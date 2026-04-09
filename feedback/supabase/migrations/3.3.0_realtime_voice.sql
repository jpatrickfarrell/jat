-- jat-feedback v3.3.0 — Realtime + voice transcription support
--
-- Enables Supabase Realtime on project_tasks (REPLICA IDENTITY FULL),
-- adds audio_url column for voice recordings, expands status CHECK
-- to include 'transcribing' and 'failed', and creates a private
-- Storage bucket for voice audio files.
--
-- This is an additive migration (nullable column + new bucket + constraint update).
-- Safe for 3.x — no existing data affected.
--
-- Apply to each consuming project:
--   cp node_modules/jat-feedback/supabase/migrations/3.3.0_realtime_voice.sql \
--      supabase/migrations/$(date +%Y%m%d%H%M%S)_feedback_3_3_0.sql
--   supabase db push
--
-- After applying, enable Realtime for project_tasks in the Supabase dashboard:
--   Database → Replication → supabase_realtime → toggle project_tasks ON

-- ============================================================================
-- 1. Enable Realtime (REPLICA IDENTITY FULL for complete row data in changes)
-- ============================================================================

ALTER TABLE project_tasks REPLICA IDENTITY FULL;

-- ============================================================================
-- 2. Add audio_url column (voice recording path in Storage)
-- ============================================================================

-- Separate from recording_url (which stores rrweb session replay data).
-- audio_url points to raw voice audio files in the voice-recordings bucket.
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- ============================================================================
-- 3. Expand status CHECK constraint to include voice transcription states
-- ============================================================================

-- Drop the existing constraint (inherited from 1.0.0_feedback_reports.sql)
-- and recreate with additional values for the voice pipeline.
ALTER TABLE project_tasks DROP CONSTRAINT IF EXISTS feedback_reports_status_check;

ALTER TABLE project_tasks ADD CONSTRAINT project_tasks_status_check
  CHECK (status IN (
    'submitted',
    'in_progress',
    'completed',
    'accepted',
    'rejected',
    'wontfix',
    'closed',
    'transcribing',
    'failed'
  ));

-- ============================================================================
-- 4. Storage bucket for voice recordings (private)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
  VALUES ('voice-recordings', 'voice-recordings', false)
  ON CONFLICT (id) DO NOTHING;

-- RLS: service role can read and write
CREATE POLICY "Service role can manage voice recordings"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'voice-recordings')
  WITH CHECK (bucket_id = 'voice-recordings');

-- RLS: authenticated users can upload voice recordings
CREATE POLICY "Authenticated users can upload voice recordings"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'voice-recordings');

-- RLS: authenticated users can read own voice recordings
CREATE POLICY "Authenticated users can read voice recordings"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'voice-recordings');

-- Anon role is blocked by default (no policy = no access)
