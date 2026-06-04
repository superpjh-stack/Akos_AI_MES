"""
Embedding manager for Akos AI MES RAG pipeline.
Generates OpenAI embeddings and stores them in pgvector.
"""
from __future__ import annotations

import json
import logging
import os
from typing import Any

import psycopg2
import psycopg2.extras
from openai import OpenAI

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536


class EmbeddingManager:
    """
    Manages text embedding generation (OpenAI) and storage (pgvector).

    Parameters
    ----------
    openai_api_key : str, optional
        Defaults to OPENAI_API_KEY env var.
    db_dsn : str, optional
        PostgreSQL DSN string. Defaults to DATABASE_URL env var.
    """

    def __init__(
        self,
        openai_api_key: str | None = None,
        db_dsn: str | None = None,
    ) -> None:
        api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OpenAI API key not provided.")
        self._client = OpenAI(api_key=api_key)
        self._dsn = db_dsn or os.getenv("DATABASE_URL", "")
        self._conn: Any = None

    # ------------------------------------------------------------------
    # Connection
    # ------------------------------------------------------------------

    def _get_conn(self):
        if self._conn is None or self._conn.closed:
            self._conn = psycopg2.connect(self._dsn)
            self._ensure_table()
        return self._conn

    def _ensure_table(self):
        """Create knowledge_embeddings table + pgvector extension if missing."""
        with self._conn.cursor() as cur:
            cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            cur.execute(f"""
                CREATE TABLE IF NOT EXISTS knowledge_embeddings (
                    id           SERIAL PRIMARY KEY,
                    source_type  TEXT NOT NULL,
                    source_id    INTEGER,
                    content      TEXT NOT NULL,
                    embedding    VECTOR({EMBEDDING_DIM}),
                    metadata     JSONB DEFAULT '{{}}',
                    created_at   TIMESTAMPTZ DEFAULT NOW()
                );
            """)
            cur.execute("""
                CREATE INDEX IF NOT EXISTS knowledge_embeddings_embedding_idx
                ON knowledge_embeddings USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100);
            """)
        self._conn.commit()
        logger.debug("knowledge_embeddings table ready.")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def embed_text(self, text: str) -> list[float]:
        """
        Generate an embedding vector for the given text.

        Returns
        -------
        list[float] of length EMBEDDING_DIM (1536)
        """
        response = self._client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text.replace("\n", " "),
        )
        return response.data[0].embedding

    def store_knowledge(
        self,
        source_type: str,
        source_id: int | None,
        content: str,
        metadata: dict | None = None,
    ) -> int:
        """
        Embed content and persist to pgvector.

        Parameters
        ----------
        source_type : str
            e.g. 'fat_record', 'bom_item', 'manual', 'production_order'
        source_id : int | None
            Primary key in the originating table.
        content : str
            Raw text to embed.
        metadata : dict | None
            Arbitrary JSON metadata to store alongside the embedding.

        Returns
        -------
        int : id of the inserted row
        """
        embedding = self.embed_text(content)
        meta_json = json.dumps(metadata or {})
        conn = self._get_conn()
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO knowledge_embeddings
                    (source_type, source_id, content, embedding, metadata)
                VALUES (%s, %s, %s, %s::vector, %s::jsonb)
                RETURNING id
                """,
                (source_type, source_id, content, str(embedding), meta_json),
            )
            row_id = cur.fetchone()[0]
        conn.commit()
        logger.info("Stored embedding id=%d source_type=%s source_id=%s",
                    row_id, source_type, source_id)
        return row_id

    def embed_batch(self, documents: list[dict]) -> list[int]:
        """
        Embed and store a batch of documents.

        Each document dict must have:
            source_type : str
            content     : str
        Optional keys:
            source_id   : int
            metadata    : dict

        Returns
        -------
        list[int] : inserted row ids
        """
        # OpenAI supports up to 2048 texts per request; batch in chunks of 100
        BATCH_SIZE = 100
        texts = [d["content"].replace("\n", " ") for d in documents]
        all_embeddings: list[list[float]] = []

        for i in range(0, len(texts), BATCH_SIZE):
            chunk = texts[i: i + BATCH_SIZE]
            resp = self._client.embeddings.create(model=EMBEDDING_MODEL, input=chunk)
            all_embeddings.extend([r.embedding for r in resp.data])

        conn = self._get_conn()
        ids: list[int] = []
        with conn.cursor() as cur:
            for doc, emb in zip(documents, all_embeddings):
                meta_json = json.dumps(doc.get("metadata") or {})
                cur.execute(
                    """
                    INSERT INTO knowledge_embeddings
                        (source_type, source_id, content, embedding, metadata)
                    VALUES (%s, %s, %s, %s::vector, %s::jsonb)
                    RETURNING id
                    """,
                    (
                        doc["source_type"],
                        doc.get("source_id"),
                        doc["content"],
                        str(emb),
                        meta_json,
                    ),
                )
                ids.append(cur.fetchone()[0])
        conn.commit()
        logger.info("Batch embedded %d documents.", len(ids))
        return ids

    def close(self):
        if self._conn and not self._conn.closed:
            self._conn.close()
