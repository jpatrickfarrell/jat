-- jat-feedback v1.8.0 — agent_notes table
--
-- Stores user-written markdown context that gets injected into page-agent
-- LLM calls. Two scopes: site-wide (route IS NULL) and per-route.
--
-- Apply as a new migration in your project:
--   cp node_modules/jat-feedback/supabase/migrations/1.8.0_add_agent_notes.sql \
--      supabase/migrations/$(date +%Y%m%d%H%M%S)_feedback_1_8_0.sql
--   supabase db push

CREATE TABLE IF NOT EXISTS agent_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project TEXT NOT NULL,
  route TEXT DEFAULT NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- One note per route per project (NULL route = site-wide).
-- COALESCE ensures the unique constraint works for NULL routes,
-- since standard UNIQUE treats NULLs as distinct.
CREATE UNIQUE INDEX idx_agent_notes_project_route
  ON agent_notes(project, COALESCE(route, ''));

-- Listing notes by project
CREATE INDEX idx_agent_notes_project
  ON agent_notes(project);

-- Auto-update updated_at on modification
CREATE OR REPLACE FUNCTION update_agent_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agent_notes_updated_at
  BEFORE UPDATE ON agent_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_notes_updated_at();

-- RLS policies (matches feedback_reports pattern)
ALTER TABLE agent_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert agent notes"
  ON agent_notes FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read agent notes"
  ON agent_notes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update agent notes"
  ON agent_notes FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete agent notes"
  ON agent_notes FOR DELETE TO authenticated
  USING (true);

CREATE POLICY "Service role full access to agent notes"
  ON agent_notes FOR ALL TO service_role
  USING (true) WITH CHECK (true);
