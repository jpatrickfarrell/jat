-- Extend comments table with first-class fields for agent question/answer threads.
--
-- New columns:
--   id            TEXT PRIMARY KEY  (was INTEGER AUTOINCREMENT — now nanoid)
--   author_type   TEXT              -- 'agent' | 'user' | 'system'
--   comment_type  TEXT              -- 'question' | 'answer' | 'note' | 'event'
--   session_id    TEXT              -- agent session to resume on answer (NULL = human thread)
--   metadata      TEXT              -- JSON blob, extensible
--
-- Also: author becomes nullable (system events may have no explicit author).
--
-- SQLite cannot change a column's type in place, so existing per-project
-- `.jat/tasks.db` files are migrated at runtime by `ensureCommentsSchema()`
-- in lib/tasks-sqlite.js — it rebuilds the table, CASTs legacy integer ids
-- to TEXT, and swaps. Fresh projects get the new shape directly from
-- lib/tasks-schema.sql.
--
-- For Postgres-backed (graduated) projects, apply this file as a Supabase
-- migration:
--   cp lib/migrations/extend_comments_schema.sql \
--      supabase/migrations/$(date +%Y%m%d%H%M%S)_extend_comments_schema.sql
--   supabase db push

-- ============================================================
-- Postgres path (no-op on SQLite — runtime migration handles it)
-- ============================================================

ALTER TABLE IF EXISTS comments ALTER COLUMN author DROP NOT NULL;

ALTER TABLE IF EXISTS comments
  ADD COLUMN IF NOT EXISTS author_type  TEXT,
  ADD COLUMN IF NOT EXISTS comment_type TEXT,
  ADD COLUMN IF NOT EXISTS session_id   TEXT,
  ADD COLUMN IF NOT EXISTS metadata     TEXT;

CREATE INDEX IF NOT EXISTS idx_comments_issue_type
  ON comments(issue_id, comment_type);

-- Note: changing `id` from BIGSERIAL to TEXT PRIMARY KEY in Postgres requires
-- a separate, project-specific migration (drop PK, alter type, repopulate).
-- This file only adds the new nullable columns + index; the id column
-- transition is deferred until the graduated-project path needs it.
