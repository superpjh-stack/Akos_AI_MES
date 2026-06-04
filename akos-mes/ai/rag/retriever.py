"""
Knowledge retriever for Akos AI MES RAG pipeline.
Performs pgvector similarity search and formats RAG context.
"""
from __future__ import annotations

import logging
import os
from typing import Any

import psycopg2
import psycopg2.extras

from .embeddings import EmbeddingManager

logger = logging.getLogger(__name__)

TOP_K_DEFAULT = 5
MIN_SIMILARITY = 0.30  # discard results below this cosine similarity


class KnowledgeRetriever:
    """
    Retrieves relevant knowledge chunks from pgvector for RAG.

    Parameters
    ----------
    embedding_manager : EmbeddingManager
        Shared instance (avoids re-creating OpenAI client per request).
    db_dsn : str, optional
        PostgreSQL DSN. Defaults to DATABASE_URL env var.
    """

    def __init__(
        self,
        embedding_manager: EmbeddingManager | None = None,
        db_dsn: str | None = None,
    ) -> None:
        self._dsn = db_dsn or os.getenv("DATABASE_URL", "")
        self._em = embedding_manager or EmbeddingManager(db_dsn=self._dsn)
        self._conn: Any = None

    # ------------------------------------------------------------------
    # Connection
    # ------------------------------------------------------------------

    def _get_conn(self):
        if self._conn is None or self._conn.closed:
            self._conn = psycopg2.connect(self._dsn)
        return self._conn

    # ------------------------------------------------------------------
    # Core search
    # ------------------------------------------------------------------

    def search(
        self,
        query: str,
        top_k: int = TOP_K_DEFAULT,
        source_type: str | None = None,
    ) -> list[dict]:
        """
        Embed query and retrieve top-k most similar knowledge chunks.

        Parameters
        ----------
        query : str
        top_k : int
        source_type : str | None
            Filter by source type (e.g. 'fat_record', 'manual').

        Returns
        -------
        list[dict] with keys:
            id, source_type, source_id, content, metadata, similarity
        """
        query_vec = self._em.embed_text(query)
        vec_str = str(query_vec)

        if source_type:
            sql = """
                SELECT
                    id,
                    source_type,
                    source_id,
                    content,
                    metadata,
                    1 - (embedding <=> %s::vector) AS similarity
                FROM knowledge_embeddings
                WHERE source_type = %s
                  AND 1 - (embedding <=> %s::vector) >= %s
                ORDER BY embedding <=> %s::vector
                LIMIT %s
            """
            params = (vec_str, source_type, vec_str, MIN_SIMILARITY, vec_str, top_k)
        else:
            sql = """
                SELECT
                    id,
                    source_type,
                    source_id,
                    content,
                    metadata,
                    1 - (embedding <=> %s::vector) AS similarity
                FROM knowledge_embeddings
                WHERE 1 - (embedding <=> %s::vector) >= %s
                ORDER BY embedding <=> %s::vector
                LIMIT %s
            """
            params = (vec_str, vec_str, MIN_SIMILARITY, vec_str, top_k)

        conn = self._get_conn()
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()

        results = [dict(r) for r in rows]
        logger.debug("search('%s') → %d results", query[:60], len(results))
        return results

    # ------------------------------------------------------------------
    # RAG context builder
    # ------------------------------------------------------------------

    def get_context(
        self,
        query: str,
        top_k: int = TOP_K_DEFAULT,
        source_type: str | None = None,
        max_chars: int = 4000,
    ) -> str:
        """
        Retrieve relevant chunks and format as a context string for LLM prompts.

        Returns
        -------
        str
            Formatted context block, truncated to max_chars.
        """
        chunks = self.search(query, top_k=top_k, source_type=source_type)

        if not chunks:
            return "관련 지식 베이스 항목이 없습니다."

        parts: list[str] = []
        total = 0
        for i, chunk in enumerate(chunks, 1):
            sim_pct = round(chunk.get("similarity", 0) * 100, 1)
            header = f"[{i}] {chunk['source_type']} (유사도: {sim_pct}%)"
            body = chunk["content"]
            entry = f"{header}\n{body}"
            if total + len(entry) > max_chars:
                break
            parts.append(entry)
            total += len(entry)

        return "\n\n---\n\n".join(parts)

    def close(self):
        if self._conn and not self._conn.closed:
            self._conn.close()
