/**
 * Feedback Thread Storage
 *
 * Sidecar JSON files at .jat/feedback-threads/{taskId}.json
 * One file per feedback task, storing the conversation thread.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Get the thread directory path for the current project.
 * @returns {string}
 */
function getThreadDir() {
	const projectPath = process.cwd().replace(/\/ide$/, '');
	return join(projectPath, '.jat', 'feedback-threads');
}

/**
 * Get the thread file path for a task.
 * @param {string} taskId
 * @returns {string}
 */
function getThreadPath(taskId) {
	return join(getThreadDir(), `${taskId}.json`);
}

/**
 * Generate a unique entry ID.
 * @returns {string}
 */
export function generateEntryId() {
	const ts = Date.now();
	const rand = Math.random().toString(36).substring(2, 8);
	return `entry-${ts}-${rand}`;
}

/**
 * Read the thread for a task. Returns null if no thread file exists.
 * @param {string} taskId
 * @returns {import('./feedbackThreadTypes').ThreadEntry[] | null}
 */
export function getThread(taskId) {
	const threadPath = getThreadPath(taskId);
	if (!existsSync(threadPath)) return null;

	try {
		const data = JSON.parse(readFileSync(threadPath, 'utf-8'));
		return Array.isArray(data) ? data : null;
	} catch {
		return null;
	}
}

/**
 * Save the full thread array for a task.
 * @param {string} taskId
 * @param {import('./feedbackThreadTypes').ThreadEntry[]} thread
 */
export function saveThread(taskId, thread) {
	const threadPath = getThreadPath(taskId);
	const dir = dirname(threadPath);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
	writeFileSync(threadPath, JSON.stringify(thread, null, 2), 'utf-8');
}

/**
 * Append a single entry to a task's thread. Creates the thread if it doesn't exist.
 * @param {string} taskId
 * @param {import('./feedbackThreadTypes').ThreadEntry} entry
 */
export function appendThreadEntry(taskId, entry) {
	const existing = getThread(taskId) || [];
	existing.push(entry);
	saveThread(taskId, existing);
}
