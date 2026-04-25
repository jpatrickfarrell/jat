/**
 * Task search module — routes per-project to the correct backend
 * (sqlite or postgres) so postgres-backed projects like meadow are
 * searchable from `jat-search` and the IDE's /api/search endpoint.
 */

import { searchTasks as _searchTasks } from '../../../lib/tasks.js';
import {
  resolveBackendForProject,
  readProjectsConfig,
} from '../../../lib/projects-config.js';
import { getBackendForProject } from '../../../lib/tasks-backend.js';

/**
 * Search tasks across the configured backend for a project.
 *
 * When `project` is provided, the backend for that project is used directly
 * (sqlite → FTS5; postgres → ProjectTasksBackend ILIKE search).  When no
 * project is given we fall back to sqlite global FTS search.
 *
 * @param {string} query
 * @param {object} options
 * @param {string} [options.project] - Project path or name (null = sqlite global)
 * @param {number} [options.limit=10]
 * @param {boolean} [options.verbose=false]
 * @returns {Promise<Array<object>>}
 */
export async function searchTasks(query, options = {}) {
  const { project, limit = 10, verbose = false } = options;
  const log = verbose ? (...a) => console.error('[tasks]', ...a) : () => {};

  log(`Searching tasks for "${query}" (limit=${limit}, project=${project || 'all'})`);

  if (project) {
    const projName = projectNameFromPath(project);
    if (projName) {
      let kind = 'sqlite';
      try {
        kind = resolveBackendForProject(projName).kind;
      } catch {
        // Unknown project → treat as sqlite.
      }

      if (kind === 'postgres') {
        const backend = await getBackendForProject(projName);
        const rows = await backend.search(query, { limit });
        log(`Postgres backend returned ${rows.length} results for "${projName}"`);
        return rows.map(shapeTask);
      }

      // Sqlite — fetch extra, filter by project id prefix.
      const fetchLimit = limit * 5;
      const results = await _searchTasks(query, { limit: fetchLimit });
      const filtered = results
        .filter((t) => t.id.startsWith(projName + '-'))
        .slice(0, limit);
      log(`Sqlite backend filtered to "${projName}": ${filtered.length} results`);
      return filtered.map(shapeTask);
    }
  }

  // No project filter — sqlite global FTS plus fan-out to every
  // postgres-backed project listed in ~/.config/jat/projects.json.
  const sqliteResults = (await _searchTasks(query, { limit })).map(shapeTask);

  const cfg = readProjectsConfig();
  const postgresNames = [];
  if (cfg?.projects) {
    for (const [name, entry] of Object.entries(cfg.projects)) {
      if (entry && entry.backend === 'postgres') postgresNames.push(name);
    }
  }

  const pgResults = (
    await Promise.all(
      postgresNames.map(async (name) => {
        try {
          const backend = await getBackendForProject(name);
          const rows = await backend.search(query, { limit });
          return rows.map(shapeTask);
        } catch (err) {
          log(`Postgres search failed for "${name}": ${err.message}`);
          return [];
        }
      })
    )
  ).flat();

  // Merge: sqlite first (FTS-scored), then postgres (unscored, sorted by updated_at already).
  return [...sqliteResults, ...pgResults].slice(0, limit);
}

function shapeTask(t) {
  return {
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    issue_type: t.issue_type,
    snippet: (t.description || '').slice(0, 200),
    score: t.relevance || 0,
    labels: t.labels || [],
    assignee: t.assignee || null,
    updated_at: t.updated_at,
  };
}

/**
 * Extract project name from path or return the name itself.
 */
function projectNameFromPath(projectPath) {
  if (!projectPath) return null;
  const resolved = projectPath.replace(/\/+$/, '');
  return resolved.split('/').pop();
}
