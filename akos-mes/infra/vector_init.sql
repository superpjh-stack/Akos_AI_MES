-- Akos AI MES - Vector Database Schema
-- PostgreSQL 16 + pgvector

CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge Embeddings
CREATE TABLE IF NOT EXISTS knowledge_embeddings (
    id             BIGSERIAL PRIMARY KEY,
    source_type    VARCHAR(100) NOT NULL,   -- e.g. 'fat_record', 'bom_item', 'manual', 'standard'
    source_id      INTEGER,                 -- FK to the originating row in main DB (informational)
    content        TEXT NOT NULL,
    embedding      vector(1536) NOT NULL,   -- OpenAI text-embedding-3-small / ada-002 dimension
    metadata_json  JSONB,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HNSW index for fast approximate nearest-neighbour search
CREATE INDEX IF NOT EXISTS idx_emb_hnsw
    ON knowledge_embeddings
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_emb_source_type ON knowledge_embeddings(source_type);
CREATE INDEX IF NOT EXISTS idx_emb_source_id   ON knowledge_embeddings(source_id);
