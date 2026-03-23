-- JAT per-project data store schema
-- User-defined tables for structured data (grocery lists, inventories, etc.)
-- Separate from tasks.db to avoid collisions and WAL contention.

CREATE TABLE IF NOT EXISTS _tables (
    name TEXT PRIMARY KEY,
    display_name TEXT,
    description TEXT,
    context_query TEXT,
    context_description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Column metadata registry for semantic types.
-- Absence of a row = raw SQLite type (backward compatible).
-- JSON config avoids schema migrations for type-specific settings.
CREATE TABLE IF NOT EXISTS _columns (
    table_name TEXT NOT NULL,
    column_name TEXT NOT NULL,
    semantic_type TEXT NOT NULL,
    config TEXT DEFAULT '{}',
    display_name TEXT,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (table_name, column_name)
);

-- Named views for data tables.
-- Each view defines a filtered/sorted subset of a parent table's data.
-- Filters are stored as JSON rules, converted to SQL WHERE at runtime.
CREATE TABLE IF NOT EXISTS _views (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    name TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    filters TEXT DEFAULT '[]',
    filter_conjunction TEXT DEFAULT 'AND',
    visible_columns TEXT,
    sort_column TEXT,
    sort_direction TEXT DEFAULT 'ASC',
    context_query TEXT,
    context_description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Unified knowledge bases (formerly _canvas_pages + bases.db).
-- Every base is a canvas page with blocks. Manual text, data tables,
-- conversations, and external sources are all represented as block arrays.
-- Migrated from separate bases.db by tools/scripts/migrate-bases-to-canvas.js.
CREATE TABLE IF NOT EXISTS bases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    project TEXT NOT NULL,
    blocks TEXT DEFAULT '[]',
    description TEXT,
    always_inject INTEGER NOT NULL DEFAULT 0,
    token_estimate INTEGER,
    source_config TEXT DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Task ↔ Base attachment (migrated from bases.db).
CREATE TABLE IF NOT EXISTS task_bases (
    task_id TEXT NOT NULL,
    base_id TEXT NOT NULL,
    attached_at TEXT NOT NULL,
    attached_by TEXT,
    PRIMARY KEY (task_id, base_id),
    FOREIGN KEY (base_id) REFERENCES bases(id) ON DELETE CASCADE
);

-- Direct data table attachments to tasks (migrated from bases.db).
CREATE TABLE IF NOT EXISTS task_tables (
    task_id TEXT NOT NULL,
    table_name TEXT NOT NULL,
    project TEXT NOT NULL,
    context_query TEXT,
    attached_at TEXT NOT NULL,
    attached_by TEXT,
    PRIMARY KEY (task_id, table_name, project)
);

-- FTS5 full-text search on bases (name + description).
CREATE VIRTUAL TABLE IF NOT EXISTS bases_fts USING fts5(
    name,
    description,
    content='bases',
    content_rowid='rowid'
);

-- Triggers to keep FTS index in sync.
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
