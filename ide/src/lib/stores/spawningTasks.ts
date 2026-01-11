/**
 * Shared store for tracking which tasks are currently being spawned.
 * Used by both TopBar (swarm button) and TaskTable (animations).
 */

import { writable, get } from 'svelte/store';

// Set of task IDs currently being spawned
export const spawningTaskIds = writable<Set<string>>(new Set());

// Whether a bulk spawn is in progress
export const isBulkSpawning = writable<boolean>(false);

/**
 * Mark a task as spawning (for animation)
 */
export function startSpawning(taskId: string): void {
	spawningTaskIds.update(set => {
		set.add(taskId);
		return new Set(set);
	});
}

/**
 * Mark a task as done spawning
 */
export function stopSpawning(taskId: string): void {
	spawningTaskIds.update(set => {
		set.delete(taskId);
		return new Set(set);
	});
}

/**
 * Check if a task is currently spawning
 */
export function isSpawning(taskId: string): boolean {
	return get(spawningTaskIds).has(taskId);
}

/**
 * Start bulk spawn mode
 */
export function startBulkSpawn(): void {
	isBulkSpawning.set(true);
}

/**
 * End bulk spawn mode
 */
export function endBulkSpawn(): void {
	isBulkSpawning.set(false);
	spawningTaskIds.set(new Set());
}
