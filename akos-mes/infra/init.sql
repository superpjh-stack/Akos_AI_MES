-- Akos AI MES - Main Database Schema
-- PostgreSQL 16

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    customer    VARCHAR(255) NOT NULL,
    status      VARCHAR(50)  NOT NULL DEFAULT 'active'
                    CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    start_date  DATE,
    end_date    DATE,
    budget      NUMERIC(18, 2),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- BOM Items
CREATE TABLE IF NOT EXISTS bom_items (
    id          SERIAL PRIMARY KEY,
    project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    part_no     VARCHAR(100) NOT NULL,
    part_name   VARCHAR(255) NOT NULL,
    quantity    NUMERIC(12, 4) NOT NULL DEFAULT 1,
    unit        VARCHAR(20) NOT NULL DEFAULT 'EA',
    parent_id   INTEGER REFERENCES bom_items(id) ON DELETE SET NULL,
    revision    VARCHAR(20) NOT NULL DEFAULT 'A',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bom_project ON bom_items(project_id);
CREATE INDEX IF NOT EXISTS idx_bom_parent  ON bom_items(parent_id);

-- Production Orders
CREATE TABLE IF NOT EXISTS production_orders (
    id                  SERIAL PRIMARY KEY,
    project_id          INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    process_name        VARCHAR(255) NOT NULL,
    status              VARCHAR(50) NOT NULL DEFAULT 'planned'
                            CHECK (status IN ('planned', 'in_progress', 'completed', 'on_hold', 'cancelled')),
    planned_start       TIMESTAMPTZ,
    planned_end         TIMESTAMPTZ,
    actual_start        TIMESTAMPTZ,
    actual_end          TIMESTAMPTZ,
    operator_id         INTEGER
);

CREATE INDEX IF NOT EXISTS idx_po_project ON production_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_po_status  ON production_orders(status);

-- FAT Records
CREATE TABLE IF NOT EXISTS fat_records (
    id                  SERIAL PRIMARY KEY,
    project_id          INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    production_order_id INTEGER REFERENCES production_orders(id) ON DELETE SET NULL,
    test_item           VARCHAR(255) NOT NULL,
    result              VARCHAR(20) NOT NULL DEFAULT 'pending'
                            CHECK (result IN ('pass', 'fail', 'pending', 'waived')),
    measured_value      NUMERIC(18, 6),
    spec_min            NUMERIC(18, 6),
    spec_max            NUMERIC(18, 6),
    plc_log             TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fat_project ON fat_records(project_id);
CREATE INDEX IF NOT EXISTS idx_fat_result  ON fat_records(result);

-- Delivery Records
CREATE TABLE IF NOT EXISTS delivery_records (
    id              SERIAL PRIMARY KEY,
    project_id      INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    delivery_date   DATE NOT NULL,
    site_location   VARCHAR(255),
    sat_status      VARCHAR(50) NOT NULL DEFAULT 'pending'
                        CHECK (sat_status IN ('pending', 'scheduled', 'in_progress', 'passed', 'failed')),
    notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_delivery_project ON delivery_records(project_id);

-- AI Predictions
CREATE TABLE IF NOT EXISTS ai_predictions (
    id               SERIAL PRIMARY KEY,
    project_id       INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    prediction_type  VARCHAR(100) NOT NULL,
    predicted_value  NUMERIC(18, 6),
    confidence       NUMERIC(5, 4) CHECK (confidence BETWEEN 0 AND 1),
    features_json    JSONB,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pred_project ON ai_predictions(project_id);
CREATE INDEX IF NOT EXISTS idx_pred_type    ON ai_predictions(prediction_type);
