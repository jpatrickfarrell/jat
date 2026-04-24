-- Add `external` visibility flag to task comments (Postgres path).
--
-- `external = true`  → visible to external parties (clients, feedback widget).
-- `external = false` → internal-only (agent↔team thread; not shown in widget).
--
-- Policy: this flag is ONE-WAY. A comment that starts internal stays internal
-- forever. The rule is enforced at the API layer (PATCH cannot flip
-- external=false → external=true); there is no DB-level CHECK because
-- service-role rescues would otherwise be impossible.
--
-- This migration is additive and safe to run against any graduated project.
-- All existing rows get `external=true`, preserving today's behaviour where
-- every comment is visible everywhere.
--
-- For SQLite-backed projects this migration is a no-op — the runtime
-- migration in lib/tasks-sqlite.js (ensureCommentsSchema) handles it.
--
-- Usage for a Postgres-backed project:
--   cp lib/migrations/add_external_to_comments.sql \
--      supabase/migrations/$(date +%Y%m%d%H%M%S)_add_external_to_comments.sql
--   supabase db push

-- ============================================================
-- project_tasks_comments (current/canonical table)
-- ============================================================

ALTER TABLE IF EXISTS project_tasks_comments
  ADD COLUMN IF NOT EXISTS external BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_project_tasks_comments_external
  ON project_tasks_comments(task_id, external);

-- ============================================================
-- comments (legacy / pre-rename table — covered for completeness)
-- ============================================================

ALTER TABLE IF EXISTS comments
  ADD COLUMN IF NOT EXISTS external BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_comments_external
  ON comments(issue_id, external);
