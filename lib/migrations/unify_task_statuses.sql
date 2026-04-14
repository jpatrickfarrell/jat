-- Unify project_tasks status vocabulary with the canonical JAT status set.
--
-- Canonical statuses (see lib/task-statuses.js):
--   open, in_progress, waiting, blocked,
--   submitted, accepted, deployed, closed, dev
--
-- Legacy project_tasks values inherited from feedback_reports:
--   completed, rejected, wontfix  ← removed
--   accepted, submitted           ← kept (already canonical)
--
-- project_tasks.status is unconstrained TEXT after the follow_up_tasks
-- migration dropped feedback_reports_status_check (see
-- add_jat_columns_to_project_tasks.sql §6). So this migration is
-- data-only: backfill legacy values to `closed` and preserve intent
-- via close_reason.
--
-- Idempotent: safe to re-run. Rows already at `closed` are untouched.
--
-- Usage (per project):
--   cp lib/migrations/unify_task_statuses.sql \
--      supabase/migrations/$(date +%Y%m%d%H%M%S)_unify_task_statuses.sql
--   supabase db push

BEGIN;

-- ============================================================
-- 1. completed → closed
--    Pure rename; no reason annotation (completion is the default
--    meaning of `closed`).
-- ============================================================

UPDATE project_tasks
   SET status = 'closed',
       closed_at = COALESCE(closed_at, NOW())
 WHERE status = 'completed';

-- ============================================================
-- 2. rejected → closed WITH close_reason='rejected'
--    Preserve the rejection signal so UI/reports can still
--    distinguish rejected work from completed work.
-- ============================================================

UPDATE project_tasks
   SET status = 'closed',
       close_reason = COALESCE(NULLIF(close_reason, ''), 'rejected'),
       closed_at = COALESCE(closed_at, NOW())
 WHERE status = 'rejected';

-- ============================================================
-- 3. wontfix → closed WITH close_reason='wontfix'
-- ============================================================

UPDATE project_tasks
   SET status = 'closed',
       close_reason = COALESCE(NULLIF(close_reason, ''), 'wontfix'),
       closed_at = COALESCE(closed_at, NOW())
 WHERE status = 'wontfix';

COMMIT;

-- ============================================================
-- Verification (run manually after apply):
--
--   SELECT status, COUNT(*) FROM project_tasks GROUP BY status;
--
-- Expected: no rows with status IN ('completed','rejected','wontfix').
-- ============================================================
