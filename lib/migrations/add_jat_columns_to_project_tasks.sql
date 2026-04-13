-- JAT schema extension for project_tasks
--
-- Adds columns that JAT graduated tasks need but the base project_tasks
-- schema (from jat-feedback 3.0.0) does not provide.  All columns are
-- nullable with no defaults so existing rows are completely unaffected.
--
-- Run as a Supabase migration:
--   cp lib/migrations/add_jat_columns_to_project_tasks.sql \
--      supabase/migrations/$(date +%Y%m%d%H%M%S)_jat_graduation_columns.sql
--   supabase db push

-- ============================================================
-- 1. JAT identity — original JAT task ID stored here;
--    project_tasks.id remains a UUID primary key.
-- ============================================================

ALTER TABLE project_tasks
  ADD COLUMN IF NOT EXISTS jat_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_project_tasks_jat_id
  ON project_tasks(jat_id) WHERE jat_id IS NOT NULL;

-- ============================================================
-- 2. Agent orchestration columns
-- ============================================================

ALTER TABLE project_tasks
  ADD COLUMN IF NOT EXISTS agent_program TEXT,
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS reserved_files TEXT,
  ADD COLUMN IF NOT EXISTS command TEXT;

-- ============================================================
-- 2a. JAT text assignee
--
-- project_tasks.assignee TEXT was dropped by the JST schema-clean
-- migration (replaced with assignee_id UUID FK for user-facing
-- assignment). JAT needs a text field to store agent names
-- (e.g. "GrandRavine") independently of the profile UUID FK.
-- ============================================================

ALTER TABLE project_tasks
  ADD COLUMN IF NOT EXISTS assignee TEXT;

-- ============================================================
-- 3. Task lifecycle columns
-- ============================================================

ALTER TABLE project_tasks
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS close_reason TEXT;

-- ============================================================
-- 4. Scheduling columns (for chore-type recurring tasks)
-- ============================================================

ALTER TABLE project_tasks
  ADD COLUMN IF NOT EXISTS schedule_cron TEXT,
  ADD COLUMN IF NOT EXISTS next_run_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_project_tasks_schedule
  ON project_tasks(next_run_at)
  WHERE schedule_cron IS NOT NULL;

-- ============================================================
-- 5. Labels sync mirror (space-separated, mirrors labels TEXT[])
-- ============================================================

ALTER TABLE project_tasks
  ADD COLUMN IF NOT EXISTS labels_text TEXT;

-- ============================================================
-- 6. Extended status values
--
-- project_tasks inherits feedback_reports status values:
--   submitted, in_progress, completed, accepted, rejected, wontfix, closed
-- JAT adds:
--   dev     — internal/draft task not yet visible to end users
--   open    — ready for work (maps from JAT 'open')
--   blocked — waiting on dependency
--
-- No CHECK constraint — the original was dropped in the
-- follow_up_tasks migration.  Status is validated at the
-- application layer.
-- ============================================================

-- No DDL needed — status is unconstrained TEXT after the
-- feedback_reports_status_check constraint was dropped.

-- ============================================================
-- 7. Extended issue_type values
--
-- Base: bug, feature, task, epic
-- JAT adds: chore, chat
--
-- The CHECK constraint may persist depending on which migrations
-- the host project has applied (not all projects run the
-- follow_up_tasks migration that drops it). Drop idempotently.
-- ============================================================

ALTER TABLE project_tasks DROP CONSTRAINT IF EXISTS project_tasks_issue_type_check;
ALTER TABLE project_tasks DROP CONSTRAINT IF EXISTS feedback_reports_issue_type_check;
