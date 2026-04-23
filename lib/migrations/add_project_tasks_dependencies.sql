-- JAT: dependency support for project_tasks (postgres-graduated projects)
--
-- Postgres-graduated projects lose all dependency data today because the
-- project_tasks schema (from jat-feedback 3.0.0) doesn't have a deps table.
-- lib/tasks-project-tasks.js returned depends_on: [] hardcoded, getReady()
-- ignored blockers, and tasks-graduate.js skipped Phase 4 entirely in the
-- project_tasks path.
--
-- This migration adds the missing table. Mirrors the legacy `dependencies`
-- join table from lib/tasks-schema.sql in structure (task_id, depends_on_id,
-- type) but uses UUID FKs with CASCADE on delete and a self-dep CHECK.
--
-- Safe to apply to already-graduated projects (meadow, flush, steelbridge):
-- existing tasks get no rows; no data changes. The backend read path falls
-- back to empty when no rows exist.
--
-- Apply as a Supabase migration:
--   cp lib/migrations/add_project_tasks_dependencies.sql \
--      supabase/migrations/$(date +%Y%m%d%H%M%S)_project_tasks_dependencies.sql
--   supabase db push

CREATE TABLE IF NOT EXISTS project_tasks_dependencies (
  task_id          UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  depends_on_id    UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  type             TEXT NOT NULL DEFAULT 'blocks'
                     CHECK (type IN ('blocks', 'relates_to', 'duplicates')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by_id    UUID,
  PRIMARY KEY (task_id, depends_on_id),
  CONSTRAINT project_tasks_deps_no_self CHECK (task_id <> depends_on_id)
);

-- Lookups in both directions: "what does X depend on?" and "what depends on X?"
CREATE INDEX IF NOT EXISTS idx_project_tasks_deps_task_id
  ON project_tasks_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_deps_depends_on_id
  ON project_tasks_dependencies(depends_on_id);

COMMENT ON TABLE project_tasks_dependencies IS
  'JAT task dependency graph for graduated (postgres-backed) projects. '
  'Mirrors the legacy SQLite `dependencies` table. Populated by '
  'jt graduate (Phase 4) and by jat-tasks-project-tasks.js addDependency().';
