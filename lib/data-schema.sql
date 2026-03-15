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

-- Canvas pages for interactive block-based documents.
-- Blocks are stored as a JSON array (like views store filters).
CREATE TABLE IF NOT EXISTS _canvas_pages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    project TEXT NOT NULL,
    blocks TEXT DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
