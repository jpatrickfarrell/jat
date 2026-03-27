-- jat-feedback v3.0.0 — rename feedback_reports → project_tasks + extend schema
--
-- BREAKING CHANGE: This migration renames the core table and adds new columns
-- for unified task management (feedback + JAT tasks + manual entries).
--
-- Apply as a new migration in your project:
--   cp node_modules/jat-feedback/supabase/migrations/3.0.0_rename_to_project_tasks.sql \
--      supabase/migrations/$(date +%Y%m%d%H%M%S)_feedback_3_0_0.sql
--   supabase db push
--
-- Prerequisites: 1.0.0, 1.1.0, 1.8.0 migrations must already be applied.

-- ============================================================================
-- 1. Rename table
-- ============================================================================

ALTER TABLE feedback_reports RENAME TO project_tasks;

-- Rename type → source_type to avoid confusion with issue_type
ALTER TABLE project_tasks RENAME COLUMN type TO source_type;

-- ============================================================================
-- 2. Add new columns
-- ============================================================================

-- Source of the task: feedback widget, JAT task sync, or manual creation
ALTER TABLE project_tasks ADD COLUMN source TEXT DEFAULT 'feedback'
  CHECK (source IN ('feedback', 'jat', 'manual'));

-- Issue classification (extends the original bug/enhancement/other type)
ALTER TABLE project_tasks ADD COLUMN issue_type TEXT DEFAULT 'bug'
  CHECK (issue_type IN ('bug', 'feature', 'task', 'epic'));

-- Assignment and scheduling
ALTER TABLE project_tasks ADD COLUMN assignee TEXT;
ALTER TABLE project_tasks ADD COLUMN due_date TIMESTAMPTZ;

-- Labels for flexible categorization
ALTER TABLE project_tasks ADD COLUMN labels TEXT[];

-- Self-referential parent for hierarchical tasks (epics → children)
ALTER TABLE project_tasks ADD COLUMN parent_id UUID REFERENCES project_tasks(id);

-- Updated timestamp
ALTER TABLE project_tasks ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();

-- ============================================================================
-- 3. Auto-update updated_at trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION update_project_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_tasks_updated_at
  BEFORE UPDATE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_project_tasks_updated_at();

-- ============================================================================
-- 4. Create project_tasks_comments table
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_tasks_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  author_role TEXT DEFAULT 'user',
  text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_project_tasks_comments_task
  ON project_tasks_comments(task_id, created_at);

-- RLS for comments
ALTER TABLE project_tasks_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert comments"
  ON project_tasks_comments FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read comments"
  ON project_tasks_comments FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Service role full access to comments"
  ON project_tasks_comments FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ============================================================================
-- 5. Rename indexes (drop old, create new)
-- ============================================================================

-- The table rename does NOT automatically rename indexes.
DROP INDEX IF EXISTS idx_feedback_reports_new;
DROP INDEX IF EXISTS idx_feedback_reports_rejected;
DROP INDEX IF EXISTS idx_feedback_reports_reporter;
DROP INDEX IF EXISTS idx_feedback_reports_completed;

-- Recreate with new names
CREATE INDEX idx_project_tasks_new
  ON project_tasks(status, jat_task_id)
  WHERE status = 'submitted' AND jat_task_id IS NULL;

CREATE INDEX idx_project_tasks_rejected
  ON project_tasks(status)
  WHERE status = 'rejected';

CREATE INDEX idx_project_tasks_reporter
  ON project_tasks(reporter_user_id, created_at DESC);

CREATE INDEX idx_project_tasks_completed
  ON project_tasks(reporter_user_id, status)
  WHERE status = 'completed';

-- ============================================================================
-- 6. New indexes for extended schema
-- ============================================================================

-- Filter by source (feedback vs jat vs manual)
CREATE INDEX idx_project_tasks_source
  ON project_tasks(source);

-- Parent-child lookups
CREATE INDEX idx_project_tasks_parent
  ON project_tasks(parent_id)
  WHERE parent_id IS NOT NULL;

-- Assignee lookups
CREATE INDEX idx_project_tasks_assignee
  ON project_tasks(assignee)
  WHERE assignee IS NOT NULL;

-- Due date ordering
CREATE INDEX idx_project_tasks_due_date
  ON project_tasks(due_date)
  WHERE due_date IS NOT NULL;

-- ============================================================================
-- 7. Update RLS policies (rename references from feedback_reports)
-- ============================================================================

-- Drop old policies (they reference the old table name internally)
DROP POLICY IF EXISTS "Authenticated users can insert feedback" ON project_tasks;
DROP POLICY IF EXISTS "Users can read own feedback reports" ON project_tasks;
DROP POLICY IF EXISTS "Users can respond to own completed feedback" ON project_tasks;
DROP POLICY IF EXISTS "Service role full access to feedback" ON project_tasks;

-- Recreate with updated names
CREATE POLICY "Authenticated users can insert project tasks"
  ON project_tasks FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own project tasks"
  ON project_tasks FOR SELECT TO authenticated
  USING (reporter_user_id = auth.uid());

CREATE POLICY "Users can update own project tasks"
  ON project_tasks FOR UPDATE TO authenticated
  USING (reporter_user_id = auth.uid())
  WITH CHECK (reporter_user_id = auth.uid());

CREATE POLICY "Service role full access to project tasks"
  ON project_tasks FOR ALL TO service_role
  USING (true) WITH CHECK (true);
