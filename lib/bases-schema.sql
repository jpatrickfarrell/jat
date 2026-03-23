-- JAT Knowledge Bases schema (unified with canvas)
-- Now lives in .jat/data.db alongside data tables.
-- Every base is a block-based document (text, table_view, control, etc.).
-- Legacy source_type is stored in source_config._migrated_source_type.

CREATE TABLE IF NOT EXISTS bases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    project TEXT,
    blocks TEXT DEFAULT '[]',
    description TEXT,
    always_inject INTEGER NOT NULL DEFAULT 0,
    token_estimate INTEGER,
    source_config TEXT DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS task_bases (
    task_id TEXT NOT NULL,
    base_id TEXT NOT NULL,
    attached_at TEXT NOT NULL,
    attached_by TEXT,
    PRIMARY KEY (task_id, base_id),
    FOREIGN KEY (base_id) REFERENCES bases(id) ON DELETE CASCADE
);

-- Direct data table attachments to tasks (no base record needed).
-- table_name references a user table in data.db.
-- context_query overrides the table's default context_query if set.
CREATE TABLE IF NOT EXISTS task_tables (
    task_id TEXT NOT NULL,
    table_name TEXT NOT NULL,
    project TEXT NOT NULL,
    context_query TEXT,
    attached_at TEXT NOT NULL,
    attached_by TEXT,
    PRIMARY KEY (task_id, table_name, project)
);

-- FTS5 virtual table for keyword search across bases (name + description only)
CREATE VIRTUAL TABLE IF NOT EXISTS bases_fts USING fts5(
    name,
    description,
    content='bases',
    content_rowid='rowid'
);

-- Triggers to keep FTS index in sync
CREATE TRIGGER IF NOT EXISTS bases_fts_ai AFTER INSERT ON bases BEGIN
    INSERT INTO bases_fts(rowid, name, description)
    VALUES (new.rowid, new.name, new.description);
END;

CREATE TRIGGER IF NOT EXISTS bases_fts_ad AFTER DELETE ON bases BEGIN
    INSERT INTO bases_fts(bases_fts, rowid, name, description)
    VALUES ('delete', old.rowid, old.name, old.description);
END;

CREATE TRIGGER IF NOT EXISTS bases_fts_au AFTER UPDATE ON bases BEGIN
    INSERT INTO bases_fts(bases_fts, rowid, name, description)
    VALUES ('delete', old.rowid, old.name, old.description);
    INSERT INTO bases_fts(rowid, name, description)
    VALUES (new.rowid, new.name, new.description);
END;
