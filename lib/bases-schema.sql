-- JAT Knowledge Bases schema
-- Stores knowledge base definitions, task attachments, and FTS index.
-- Lives in .jat/bases.db (separate from tasks.db and data.db to avoid WAL contention).

CREATE TABLE IF NOT EXISTS bases (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    source_type TEXT NOT NULL CHECK (source_type IN ('manual', 'data_table', 'conversation', 'external')),
    content TEXT,
    context_query TEXT,
    source_config TEXT DEFAULT '{}',
    always_inject INTEGER NOT NULL DEFAULT 0,
    token_estimate INTEGER,
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

-- FTS5 virtual table for keyword search across bases
CREATE VIRTUAL TABLE IF NOT EXISTS bases_fts USING fts5(
    name,
    description,
    content,
    content='bases',
    content_rowid='rowid'
);

-- Triggers to keep FTS index in sync
CREATE TRIGGER IF NOT EXISTS bases_ai AFTER INSERT ON bases BEGIN
    INSERT INTO bases_fts(rowid, name, description, content)
    VALUES (new.rowid, new.name, new.description, new.content);
END;

CREATE TRIGGER IF NOT EXISTS bases_ad AFTER DELETE ON bases BEGIN
    INSERT INTO bases_fts(bases_fts, rowid, name, description, content)
    VALUES ('delete', old.rowid, old.name, old.description, old.content);
END;

CREATE TRIGGER IF NOT EXISTS bases_au AFTER UPDATE ON bases BEGIN
    INSERT INTO bases_fts(bases_fts, rowid, name, description, content)
    VALUES ('delete', old.rowid, old.name, old.description, old.content);
    INSERT INTO bases_fts(rowid, name, description, content)
    VALUES (new.rowid, new.name, new.description, new.content);
END;
