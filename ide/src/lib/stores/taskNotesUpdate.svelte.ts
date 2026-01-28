/**
 * Store to signal when task notes have been updated from SendToLLM.
 * TasksActive and other components can subscribe to trigger a refresh
 * of their task details when notes change.
 */

let notesUpdateSignal = $state<{ taskId: string; timestamp: number } | null>(null);

/**
 * Signal that notes were updated for a task
 */
export function signalNotesUpdate(taskId: string) {
	notesUpdateSignal = { taskId, timestamp: Date.now() };
}

/**
 * Get the current notes update signal (reactive)
 */
export function getNotesUpdateSignal() {
	return notesUpdateSignal;
}

/**
 * Clear the signal after handling
 */
export function clearNotesUpdateSignal() {
	notesUpdateSignal = null;
}
