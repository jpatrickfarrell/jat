-- jat-feedback v3.5.0 — Extended comments schema
--
-- Adds first-class fields for agent question/answer threads:
--   author_type   TEXT        -- 'agent' | 'user' | 'system'
--   comment_type  TEXT        -- 'question' | 'answer' | 'note' | 'event'
--   session_id    TEXT        -- agent session to resume on answer (NULL = human thread)
--   metadata      TEXT        -- JSON blob, extensible
--   external      BOOLEAN     -- true = visible to client; false = internal agent/team thread
--
-- All columns are additive and nullable-safe (IF NOT EXISTS guards).
-- Existing rows get external=true, preserving current behaviour where every
-- comment was visible everywhere.
--
-- Apply to each consuming project:
--   cp node_modules/jat-feedback/supabase/migrations/3.5.0_extend_comments_schema.sql \
--      supabase/migrations/$(date +%Y%m%d%H%M%S)_feedback_3_5_0.sql
--   supabase db push

ALTER TABLE project_tasks_comments
  ADD COLUMN IF NOT EXISTS author_type  TEXT,
  ADD COLUMN IF NOT EXISTS comment_type TEXT,
  ADD COLUMN IF NOT EXISTS session_id   TEXT,
  ADD COLUMN IF NOT EXISTS metadata     TEXT,
  ADD COLUMN IF NOT EXISTS external     BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_project_tasks_comments_type
  ON project_tasks_comments(task_id, comment_type);

CREATE INDEX IF NOT EXISTS idx_project_tasks_comments_external
  ON project_tasks_comments(task_id, external);
