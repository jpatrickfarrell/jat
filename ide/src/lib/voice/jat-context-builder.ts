/**
 * JAT-specific context builder for the voice dispatch framework.
 *
 * Returns the shape described in PRD §5.4 (`JatInterpretContext`):
 *   { route, hoveredSession, selectedTask, visibleTasks≤40, activeSessions≤20,
 *     projects, lastMatchedAction }
 *
 * The framework is field-name agnostic. This file is the only place that knows
 * what JAT's context looks like — a future tenant (Meadow, Flush, …) ships its
 * own builder calling `registerContextBuilder()` with a different shape, no
 * framework changes required.
 *
 * Trim convention: `visibleTasks` and `activeSessions` are array fields placed
 * under `trimmable`. The most-relevant entry (the selected task, the hovered
 * session) is moved to index 0 so the framework's tail-trim leaves it in place
 * even when the 4 KB budget kicks in. The same IDs are also kept under
 * `pinned.selectedTask` / `pinned.hoveredSession` as a belt-and-suspenders
 * reference for the LLM in case the array form is shrunk to zero.
 */

import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { hoveredSessionName } from '$lib/stores/hoveredSession';
import { workSessionsState, type WorkSession } from '$lib/stores/workSessions.svelte';
import { getProjects } from '$lib/stores/configStore.svelte';
import type { AssembledContext, ContextBuilder } from './contextAssembly';

const MAX_VISIBLE_TASKS = 40;
const MAX_ACTIVE_SESSIONS = 20;

/** Lightweight task reference published by route components for context use. */
export interface VisibleTaskRef {
	id: string;
	title: string;
	status?: string;
	priority?: number;
}

/**
 * Module-local bridge state. Route components that own a task list call
 * `publishVisibleTasks()` / `publishSelectedTask()` so the builder can pick
 * those up at dispatch time without each component having to wire the builder
 * itself. Updates are O(1); reads are O(1).
 */
let publishedVisibleTasks: VisibleTaskRef[] = [];
let publishedSelectedTaskId: string | null = null;
let publishedLastMatchedAction: string | null = null;

/** Route components call this with the task list currently rendered to the user. */
export function publishVisibleTasks(tasks: VisibleTaskRef[]): void {
	publishedVisibleTasks = tasks;
}

/** Route components call this when a task is focused (e.g. j/k cursor, click). */
export function publishSelectedTask(id: string | null): void {
	publishedSelectedTaskId = id;
}

/**
 * dispatchNaturalLanguage / dispatchMatch call this after a successful match so
 * a follow-up utterance can reference "this task" / "the last one".
 */
export function publishLastMatchedAction(action: string | null): void {
	publishedLastMatchedAction = action;
}

/** For tests — reset module state. */
export function _resetJatContextBridge(): void {
	publishedVisibleTasks = [];
	publishedSelectedTaskId = null;
	publishedLastMatchedAction = null;
}

/**
 * Build the JAT voice-dispatch context. Reads from the workSessions and
 * config stores plus the small bridge fed by route components.
 *
 * Server-side this returns an effectively empty envelope (no browser stores) —
 * which is correct, since the framework is intended to run on the client where
 * the speaking user is.
 */
export const buildJatContext: ContextBuilder = ({ route }): AssembledContext => {
	const hoveredSession = browser ? get(hoveredSessionName) : null;
	const sessions: WorkSession[] = browser ? workSessionsState.sessions : [];
	const projectConfigs = browser
		? getProjects().map((p) => p.name).filter((n): n is string => typeof n === 'string')
		: [];

	const activeSessions = orderHoveredFirst(
		sessions.map(toSessionRef),
		(s) => s.name === hoveredSession
	).slice(0, MAX_ACTIVE_SESSIONS);

	const visibleTasks = orderHoveredFirst(
		publishedVisibleTasks.slice(0, MAX_VISIBLE_TASKS),
		(t) => t.id === publishedSelectedTaskId
	);

	return {
		pinned: {
			route,
			hoveredSession: hoveredSession ?? null,
			selectedTask: publishedSelectedTaskId,
			projects: projectConfigs,
			lastMatchedAction: publishedLastMatchedAction
		},
		trimmable: {
			visibleTasks,
			activeSessions
		}
	};
};

function toSessionRef(s: WorkSession): { name: string; agentName: string; taskId: string | null } {
	return {
		name: s.sessionName,
		agentName: s.agentName,
		taskId: s.task?.id ?? null
	};
}

/**
 * Move the entry matched by `predicate` (if any) to index 0 so the framework's
 * tail-trim preserves it. Stable for non-matching items.
 */
function orderHoveredFirst<T>(items: T[], predicate: (item: T) => boolean): T[] {
	const idx = items.findIndex(predicate);
	if (idx <= 0) return items;
	return [items[idx], ...items.slice(0, idx), ...items.slice(idx + 1)];
}
