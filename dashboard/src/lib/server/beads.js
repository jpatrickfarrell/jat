/**
 * Server-side Beads integration
 * Wraps lib/beads.js for use in SvelteKit server routes
 */

import { getTasks as getTasksFromBeads, getTaskById as getTaskByIdFromBeads } from '../../../../lib/beads.js';

/**
 * Get all tasks from all projects
 * @param {Object} options - Query options
 * @param {string} [options.status] - Filter by status
 * @param {number} [options.priority] - Filter by priority
 * @param {string} [options.projectName] - Filter by project
 * @returns {Array<Object>} List of tasks
 */
export function getTasks(options = {}) {
	return getTasksFromBeads(options);
}

/**
 * Get a specific task by ID
 * @param {string} taskId - Task ID
 * @returns {Object|null} Task object or null
 */
export function getTaskById(taskId) {
	return getTaskByIdFromBeads(taskId);
}
