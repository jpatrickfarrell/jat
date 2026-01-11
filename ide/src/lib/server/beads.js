/**
 * Server-side Beads integration
 * Wraps lib/beads.js for use in SvelteKit server routes
 */

import { getTasks as getTasksFromBeads, getTaskById as getTaskByIdFromBeads, getReadyTasks as getReadyTasksFromBeads } from '../../../../lib/beads.js';

/**
 * @typedef {import('../../../../lib/beads.js').Task} Task
 */

/**
 * Get all tasks from all projects
 * @param {Object} [options] - Query options
 * @param {string} [options.status] - Filter by status
 * @param {number} [options.priority] - Filter by priority
 * @param {string} [options.projectName] - Filter by project
 * @returns {Task[]} List of tasks
 */
export function getTasks(options = {}) {
	return getTasksFromBeads(options);
}

/**
 * Get a specific task by ID
 * @param {string} taskId - Task ID
 * @returns {Task | null} Task object or null
 */
export function getTaskById(taskId) {
	return getTaskByIdFromBeads(taskId);
}

/**
 * Get tasks that are ready to work on (no blocking dependencies)
 * @returns {Task[]} List of ready tasks across all projects
 */
export function getReadyTasks() {
	return getReadyTasksFromBeads();
}
