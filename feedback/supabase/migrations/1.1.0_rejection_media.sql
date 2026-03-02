-- jat-feedback v1.1.0 — rejection media columns
--
-- Adds columns to store rejection screenshots and element selections.
-- These are captured by the widget when a user rejects a completed report.
--
-- Apply as a new migration in your project:
--   cp node_modules/jat-feedback/supabase/migrations/1.1.0_rejection_media.sql \
--      supabase/migrations/$(date +%Y%m%d%H%M%S)_feedback_1_1_0.sql

ALTER TABLE feedback_reports ADD COLUMN IF NOT EXISTS rejection_screenshot_paths TEXT[];
ALTER TABLE feedback_reports ADD COLUMN IF NOT EXISTS rejection_elements JSONB;
