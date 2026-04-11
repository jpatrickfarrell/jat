/**
 * JAT Task Database Layer — Compatibility Shim
 *
 * The SQLite implementation lives in lib/tasks-sqlite.js as a class
 * extending the TaskBackend interface in lib/tasks-backend.js.  This file
 * instantiates a singleton of that class and re-exports bound methods under
 * their legacy function names so existing callers (IDE routes, tools/search,
 * lib/integration.js, tests) keep working unchanged.
 *
 * New code should import from tasks-backend.js via `getBackend()` instead.
 */

import { SqliteTaskBackend } from './tasks-sqlite.js';

const backend = new SqliteTaskBackend();

// ---------------------------------------------------------------------------
// Named exports (legacy API)
// ---------------------------------------------------------------------------

export const generateTaskId = (prefix) => backend.generateId(prefix);

export const getProjects = () => backend.getProjects();

export const getTasks = (options) => backend.list(options);
export const getTaskById = (taskId) => backend.getById(taskId);
export const getReadyTasks = () => backend.getReady();
export const getScheduledTasks = (options) => backend.getScheduled(options);
export const searchTasks = (query, options) => backend.search(query, options);

export const createTask = (opts) => backend.create(opts);
export const updateTask = (taskId, updates) => backend.update(taskId, updates);
export const closeTask = (taskId, reason, projectPath) => backend.close(taskId, reason, projectPath);
export const deleteTask = (taskId, projectPath) => backend.delete(taskId, projectPath);

export const addDependency = (taskId, dependsOnId, projectPath) =>
  backend.addDependency(taskId, dependsOnId, projectPath);
export const removeDependency = (taskId, dependsOnId, projectPath) =>
  backend.removeDependency(taskId, dependsOnId, projectPath);
export const getDependencyTree = (taskId, options) => backend.getDependencyTree(taskId, options);

export const addComment = (taskId, author, text, projectPath) =>
  backend.addComment(taskId, author, text, projectPath);

export const initProject = (projectPath) => backend.initProject(projectPath);

// ---------------------------------------------------------------------------
// Default export (legacy shape)
// ---------------------------------------------------------------------------

export default {
  // Project discovery
  getProjects,
  // Reads
  getTasks,
  getTaskById,
  getReadyTasks,
  getScheduledTasks,
  searchTasks,
  // Writes
  createTask,
  updateTask,
  closeTask,
  deleteTask,
  // Dependencies
  addDependency,
  removeDependency,
  getDependencyTree,
  // Comments
  addComment,
  // Helpers
  generateTaskId,
  initProject,
};
