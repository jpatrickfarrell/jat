-- JAT task database schema — Postgres edition
-- Status values: open, in_progress, blocked, closed, dev, submitted
--
-- Mirrors lib/tasks-schema.sql, adapted for Postgres:
--   TEXT/INTEGER primary keys stay the same (ids are strings like "jat-abc12")
--   Timestamps use TIMESTAMPTZ stored as strings via application (.toISOString())
--     to keep JSDoc contract: "ISO 8601 strings in UTC" — we return TEXT columns.
--   Full-text search uses tsvector + GIN index instead of FTS5.
--   labels_text column retained for symmetry with SQLite schema.
--
-- All operations are idempotent so the schema can be re-applied safely.

CREATE TABLE IF NOT EXISTS tasks (
    id             TEXT PRIMARY KEY,
    title          TEXT NOT NULL,
    description    TEXT NOT NULL DEFAULT '',
    notes          TEXT NOT NULL DEFAULT '',
    status         TEXT NOT NULL DEFAULT 'open',
    priority       INTEGER NOT NULL DEFAULT 2,
    issue_type     TEXT NOT NULL DEFAULT 'task',
    assignee       TEXT,
    reserved_files TEXT,
    parent_id      TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    command        TEXT DEFAULT '/jat:start',
    agent_program  TEXT,
    model          TEXT,
    schedule_cron  TEXT,
    next_run_at    TEXT,
    due_date       TEXT,
    labels_text    TEXT NOT NULL DEFAULT '',
    internal       BOOLEAN NOT NULL DEFAULT true,
    created_at     TEXT NOT NULL,
    updated_at     TEXT NOT NULL,
    closed_at      TEXT,
    close_reason   TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS dependencies (
    issue_id      TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    type          TEXT NOT NULL DEFAULT 'blocks',
    PRIMARY KEY (issue_id, depends_on_id)
);

CREATE TABLE IF NOT EXISTS labels (
    issue_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    label    TEXT NOT NULL,
    PRIMARY KEY (issue_id, label)
);

CREATE TABLE IF NOT EXISTS comments (
    id         BIGSERIAL PRIMARY KEY,
    issue_id   TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author     TEXT NOT NULL,
    text       TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_status          ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority        ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON tasks(status, priority);
CREATE INDEX IF NOT EXISTS idx_deps_issue            ON dependencies(issue_id);
CREATE INDEX IF NOT EXISTS idx_deps_depends          ON dependencies(depends_on_id);
CREATE INDEX IF NOT EXISTS idx_labels_label          ON labels(label);
CREATE INDEX IF NOT EXISTS idx_comments_issue        ON comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_tasks_next_run        ON tasks(next_run_at);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date        ON tasks(due_date);

-- ---------------------------------------------------------------------------
-- Full-text search (tsvector + GIN, porter-style english stemming)
-- ---------------------------------------------------------------------------
--
-- The FTS document is derived on demand from title/description/labels_text,
-- indexed via a GIN index on a generated column so INSERT/UPDATE stays cheap
-- and search uses `tasks_fts_doc @@ plainto_tsquery(...)`.
-- ---------------------------------------------------------------------------

-- Add internal column to existing tables (idempotent migration)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tasks' AND column_name = 'internal'
    ) THEN
        ALTER TABLE tasks ADD COLUMN internal BOOLEAN NOT NULL DEFAULT true;
    END IF;
END$$;

-- Postgres 12+ supports stored generated columns; guarded with a DO block
-- so re-applying the schema on an older version doesn't error.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tasks' AND column_name = 'tasks_fts_doc'
    ) THEN
        ALTER TABLE tasks ADD COLUMN tasks_fts_doc tsvector
            GENERATED ALWAYS AS (
                setweight(to_tsvector('english', COALESCE(title, '')),       'A') ||
                setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
                setweight(to_tsvector('english', COALESCE(labels_text, '')), 'C')
            ) STORED;
    END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_tasks_fts_doc ON tasks USING GIN (tasks_fts_doc);

-- ---------------------------------------------------------------------------
-- labels → tasks.labels_text sync (replaces SQLite's labels_ai_fts / labels_ad_fts)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION tasks_sync_labels_text()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tasks
    SET labels_text = COALESCE(
        (SELECT string_agg(label, ' ') FROM labels WHERE issue_id = COALESCE(NEW.issue_id, OLD.issue_id)),
        ''
    )
    WHERE id = COALESCE(NEW.issue_id, OLD.issue_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS labels_sync_ai ON labels;
CREATE TRIGGER labels_sync_ai
    AFTER INSERT ON labels
    FOR EACH ROW EXECUTE FUNCTION tasks_sync_labels_text();

DROP TRIGGER IF EXISTS labels_sync_ad ON labels;
CREATE TRIGGER labels_sync_ad
    AFTER DELETE ON labels
    FOR EACH ROW EXECUTE FUNCTION tasks_sync_labels_text();
