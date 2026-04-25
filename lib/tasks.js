/**
 * JAT Task Database Layer — Postgres-Aware Router
 *
 * Routes each operation to the correct backend based on project configuration.
 * ID-based operations derive the project from the task ID prefix; project-based
 * operations look up the backend by name or path; cross-project aggregations
 * fan out to all configured backends.
 *
 * Every export is async.  SQLite backend methods are synchronous but wrap with
 * Promise.resolve() automatically via the uniform async call sites here.
 */

import { getBackendForProject, getBackendForTaskId } from './tasks-backend.js';
import { readProjectsConfig } from './projects-config.js';

// Returns one SQLite backend (covers all sqlite-backed projects) plus one
// backend per configured postgres project.  Used for cross-project queries.
async function getAllBackends() {
  const cfg = readProjectsConfig();
  const { SqliteTaskBackend } = await import('./tasks-sqlite.js');
  const backends = [new SqliteTaskBackend()];

  if (cfg?.projects) {
    for (const [name, config] of Object.entries(cfg.projects)) {
      if (config?.backend === 'postgres') {
        try {
          backends.push(await getBackendForProject(name));
        } catch {
          // skip misconfigured entries silently
        }
      }
    }
  }

  return backends;
}

// ---------------------------------------------------------------------------
// Named exports (now async)
// ---------------------------------------------------------------------------

export async function generateTaskId(prefix) {
  const backend = await getBackendForProject(prefix);
  return backend.generateId(prefix);
}

export async function getProjects() {
  const backends = await getAllBackends();
  const results = await Promise.all(backends.map((b) => b.getProjects()));
  return results.flat();
}

export async function getTasks(options = {}) {
  if (options.projectName || options.project) {
    const name = options.projectName || options.project;
    const backend = await getBackendForProject(name);
    return backend.list(options);
  }
  const backends = await getAllBackends();
  const results = await Promise.all(backends.map((b) => b.list(options)));
  return results.flat().sort((a, b) => a.priority - b.priority || (a.created_at < b.created_at ? 1 : -1));
}

export async function getTaskById(taskId) {
  const backend = await getBackendForTaskId(taskId);
  return backend.getById(taskId);
}

export async function getReadyTasks() {
  const backends = await getAllBackends();
  const results = await Promise.all(backends.map((b) => b.getReady()));
  return results.flat().sort((a, b) => a.priority - b.priority || (a.created_at < b.created_at ? 1 : -1));
}

export async function getScheduledTasks(options = {}) {
  if (options.projectName || options.project) {
    const name = options.projectName || options.project;
    const backend = await getBackendForProject(name);
    return backend.getScheduled(options);
  }
  const backends = await getAllBackends();
  const results = await Promise.all(backends.map((b) => b.getScheduled(options)));
  return results.flat().sort((a, b) => a.priority - b.priority || (a.next_run_at < b.next_run_at ? -1 : 1));
}

export async function searchTasks(query, options = {}) {
  if (options.projectName || options.project) {
    const name = options.projectName || options.project;
    const backend = await getBackendForProject(name);
    return backend.search(query, options);
  }
  const backends = await getAllBackends();
  const results = await Promise.all(backends.map((b) => b.search(query, options)));
  return results.flat().sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0));
}

export async function createTask(opts) {
  const name = opts.projectPath || opts.project || opts.projectName;
  if (!name) throw new Error('createTask requires opts.projectPath or opts.project');
  const backend = await getBackendForProject(name);
  return backend.create(opts);
}

export async function updateTask(taskId, updates) {
  const backend = await getBackendForTaskId(taskId);
  return backend.update(taskId, updates);
}

export async function closeTask(taskId, reason, projectPath) {
  const backend = await getBackendForTaskId(taskId);
  return backend.close(taskId, reason, projectPath);
}

export async function deleteTask(taskId, projectPath) {
  const backend = await getBackendForTaskId(taskId);
  return backend.delete(taskId, projectPath);
}

export async function addDependency(taskId, dependsOnId, projectPath) {
  const backend = await getBackendForTaskId(taskId);
  return backend.addDependency(taskId, dependsOnId, projectPath);
}

export async function removeDependency(taskId, dependsOnId, projectPath) {
  const backend = await getBackendForTaskId(taskId);
  return backend.removeDependency(taskId, dependsOnId, projectPath);
}

export async function getDependencyTree(taskId, options) {
  const backend = await getBackendForTaskId(taskId);
  return backend.getDependencyTree(taskId, options);
}

export async function addComment(taskId, author, text, projectPath) {
  const backend = await getBackendForTaskId(taskId);
  return backend.addComment(taskId, author, text, projectPath);
}

export async function initProject(projectPath) {
  const backend = await getBackendForProject(projectPath);
  return backend.initProject(projectPath);
}

// ---------------------------------------------------------------------------
// Default export (legacy shape — same async signatures)
// ---------------------------------------------------------------------------

export default {
  getProjects,
  getTasks,
  getTaskById,
  getReadyTasks,
  getScheduledTasks,
  searchTasks,
  createTask,
  updateTask,
  closeTask,
  deleteTask,
  addDependency,
  removeDependency,
  getDependencyTree,
  addComment,
  generateTaskId,
  initProject,
};
