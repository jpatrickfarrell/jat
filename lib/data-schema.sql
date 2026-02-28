-- JAT per-project data store schema
-- User-defined tables for structured data (grocery lists, inventories, etc.)
-- Separate from tasks.db to avoid collisions and WAL contention.

CREATE TABLE IF NOT EXISTS _tables (
    name TEXT PRIMARY KEY,
    display_name TEXT,
    description TEXT,
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
