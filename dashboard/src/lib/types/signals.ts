/**
 * Signal Types
 *
 * Type definitions for the jat-signal system used for agent-to-dashboard communication.
 * These types are used by components that display suggested tasks and human actions.
 *
 * @see shared/signals.md for signal system documentation
 */

// =============================================================================
// SUGGESTED TASK TYPES
// =============================================================================

/**
 * Suggested task from jat-signal tasks command.
 *
 * Agents can suggest tasks for creation via:
 *   jat-signal tasks '[{"type":"feature","title":"...","description":"...","priority":1}]'
 *
 * The dashboard receives this data via SSE and displays it in the SessionCard.
 */
export interface SuggestedTask {
	/** Optional ID if this references an existing task */
	id?: string;
	/** Task type: bug, feature, task, chore, epic */
	type: string;
	/** Task title */
	title: string;
	/** Task description */
	description: string;
	/** Priority level: 0-4 (P0=critical, P4=lowest) */
	priority: number;
	/** Optional reason why this task was suggested */
	reason?: string;
	/** Project identifier (e.g., 'jat', 'chimaro') */
	project?: string;
	/** Comma-separated labels */
	labels?: string;
	/** Task IDs this task depends on */
	depends_on?: string[];
}

/**
 * Extended SuggestedTask with local UI state for selection and editing.
 * Used in SessionCard, SuggestedTasksSection, and SuggestedTasksModal.
 */
export interface SuggestedTaskWithState extends SuggestedTask {
	/** Whether this task is selected for creation */
	selected: boolean;
	/** Whether user has edited this task */
	edited: boolean;
	/** Local edits (if edited=true, these override the original values) */
	edits?: {
		type?: string;
		title?: string;
		description?: string;
		priority?: number;
		project?: string;
		labels?: string;
		depends_on?: string[];
	};
}

// =============================================================================
// HUMAN ACTION TYPES
// =============================================================================

/**
 * Human action from jat-signal action command.
 *
 * Agents can request human actions via:
 *   jat-signal action '{"title":"Review PR","items":["Check tests","Review code"]}'
 *
 * The dashboard displays these as a checklist on the SessionCard.
 */
export interface HumanAction {
	/** Action title */
	title: string;
	/** Action description */
	description?: string;
	/** Checklist items (if this is a multi-step action) */
	items?: string[];
}

// =============================================================================
// SIGNAL STATE TYPES
// =============================================================================

/**
 * Signal state values that can be set via jat-signal.
 * These map to SessionCard visual states.
 */
export type SignalState =
	| 'working'
	| 'needs_input'
	| 'review'
	| 'completed'
	| 'idle';

/**
 * Full signal data as returned by the signals API.
 */
export interface SignalData {
	/** Signal type: 'state', 'tasks', 'action' */
	type: 'state' | 'tasks' | 'action';
	/** Signal data (varies by type) */
	data: SignalState | SuggestedTask[] | HumanAction;
	/** Timestamp when signal was received */
	timestamp: number;
	/** Task ID associated with the signal (for 'working' state) */
	taskId?: string;
}
