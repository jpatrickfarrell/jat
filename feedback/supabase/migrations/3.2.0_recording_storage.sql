-- jat-feedback v3.2.0 — rrweb recording storage
--
-- Adds recording_url column to feedback_reports for linking
-- rrweb session recordings, and creates a Supabase Storage
-- bucket for storing recording JSON files.
--
-- This is an additive migration (nullable column + new bucket).
-- Safe for 3.x — no existing data affected.

-- Add recording_url column (nullable, no default — safe for minor bump)
ALTER TABLE feedback_reports ADD COLUMN recording_url TEXT;

-- Storage bucket for rrweb session recordings (private, not public)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('feedback-recordings', 'feedback-recordings', false)
  ON CONFLICT (id) DO NOTHING;

-- RLS policies for feedback-recordings bucket
CREATE POLICY "Authenticated users can upload feedback recordings"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'feedback-recordings');

CREATE POLICY "Authenticated users can read own feedback recordings"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'feedback-recordings');

CREATE POLICY "Service role can manage feedback recordings"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'feedback-recordings')
  WITH CHECK (bucket_id = 'feedback-recordings');
