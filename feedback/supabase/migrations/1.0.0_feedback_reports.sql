-- jat-feedback v1.0.0 — feedback_reports table
--
-- Copy this file into your project's supabase/migrations/ directory
-- and run: supabase db push
--
-- Naming: rename the file to match your timestamp convention, e.g.:
--   cp node_modules/jat-feedback/supabase/migrations/1.0.0_feedback_reports.sql \
--      supabase/migrations/$(date +%Y%m%d%H%M%S)_feedback_reports.sql
--
-- When upgrading jat-feedback, check supabase/migrations/ in the package for
-- any new versioned files (e.g. 1.1.0_*.sql) and apply those as additional
-- migrations to your project.
--
-- Ingest polling:
--   New reports:  status = 'submitted' AND jat_task_id IS NULL
--   Rejections:   status = 'rejected'
-- No jat_status column — status is the single source of truth.

CREATE TABLE IF NOT EXISTS feedback_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT DEFAULT 'bug' CHECK (type IN ('bug', 'enhancement', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  page_url TEXT,
  user_agent TEXT,

  -- Reporter identity
  reporter_user_id UUID REFERENCES auth.users(id),
  reporter_email TEXT,
  reporter_name TEXT,
  reporter_role TEXT,

  -- Structured data
  console_logs JSONB,
  selected_elements JSONB,
  screenshot_paths TEXT[],
  metadata JSONB,

  -- Lifecycle: submitted → in_progress → completed → accepted | rejected
  -- rejected rows are re-queued for a new JAT work cycle
  status TEXT DEFAULT 'submitted' CHECK (status IN (
    'submitted',
    'in_progress',
    'completed',
    'accepted',
    'rejected',
    'wontfix',
    'closed'
  )),
  jat_task_id TEXT,
  revision_count INT NOT NULL DEFAULT 0,
  responded_at TIMESTAMPTZ,
  rejection_reason TEXT,
  dev_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ingest daemon polling: new unassigned reports
CREATE INDEX idx_feedback_reports_new
  ON feedback_reports(status, jat_task_id)
  WHERE status = 'submitted' AND jat_task_id IS NULL;

-- Ingest daemon polling: rejected reports awaiting reopen
CREATE INDEX idx_feedback_reports_rejected
  ON feedback_reports(status)
  WHERE status = 'rejected';

-- User's My Requests view
CREATE INDEX idx_feedback_reports_reporter
  ON feedback_reports(reporter_user_id, created_at DESC);

-- Badge count (completed but not yet responded)
CREATE INDEX idx_feedback_reports_completed
  ON feedback_reports(reporter_user_id, status)
  WHERE status = 'completed';

-- Storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public)
  VALUES ('feedback-screenshots', 'feedback-screenshots', false)
  ON CONFLICT (id) DO NOTHING;

-- RLS policies
ALTER TABLE feedback_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert feedback"
  ON feedback_reports FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own feedback reports"
  ON feedback_reports FOR SELECT TO authenticated
  USING (reporter_user_id = auth.uid());

CREATE POLICY "Users can respond to own completed feedback"
  ON feedback_reports FOR UPDATE TO authenticated
  USING (reporter_user_id = auth.uid())
  WITH CHECK (reporter_user_id = auth.uid());

CREATE POLICY "Service role full access to feedback"
  ON feedback_reports FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Storage policies
CREATE POLICY "Authenticated users can upload feedback screenshots"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'feedback-screenshots');

CREATE POLICY "Service role can read feedback screenshots"
  ON storage.objects FOR SELECT TO service_role
  USING (bucket_id = 'feedback-screenshots');
