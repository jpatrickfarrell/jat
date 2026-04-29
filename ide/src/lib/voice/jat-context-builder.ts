/**
 * JAT-specific context builder for the voice dispatch framework.
 *
 * Returns a rich snapshot of the user's current view so the LLM can resolve
 * ambiguous references like "the auth task", "the flush project", "the
 * EarlyShore session". Modern providers (Anthropic Haiku/Sonnet, gpt-4o-mini)
 * have 128–200 K context windows, so we ship full task descriptions, project
 * descriptions, session output snippets, and recently-closed task history
 * rather than hoarding bytes — accuracy on resolution beats prompt-cache
 * cost. The framework's trim algorithm still runs as a safety net.
 *
 * The framework is field-name agnostic. This file is the only place that knows
 * what JAT's context looks like — a future tenant (Meadow, Flush, …) ships its
 * own builder calling `registerContextBuilder()` with a different shape, no
 * framework changes required.
 *
 * Trim convention: arrays under `trimmable` may be shrunk by the framework
 * (tail-first). The builder orders each array so the most-relevant item is at
 * index 0, guaranteeing it survives. Critical scalar IDs also live under
 * `pinned` as a belt-and-suspenders reference if an array gets fully trimmed.
 */

import { browser } from '$app/environment';
import { get } from 'svelte/store';
import { hoveredSessionName } from '$lib/stores/hoveredSession';
import { workSessionsState, type WorkSession } from '$lib/stores/workSessions.svelte';
import { getProjects } from '$lib/stores/configStore.svelte';
import type { AssembledContext, ContextBuilder } from './contextAssembly';

const MAX_VISIBLE_TASKS = 80;
const MAX_ACTIVE_SESSIONS = 30;
const MAX_RECENT_CLOSED = 10;
/** Per-field truncation: keep enough text to disambiguate without sending bodies. */
const TASK_DESCRIPTION_MAX = 400;
const PROJECT_DESCRIPTION_MAX = 320;
/** Output snippet from active sessions — last few non-empty lines. */
const SESSION_OUTPUT_LINES = 4;
const SESSION_OUTPUT_LINE_MAX = 140;

/** Rich task reference published by route components for context use. */
export interface VisibleTaskRef {
	id: string;
	title: string;
	status?: string;
	priority?: number;
	type?: string;
	description?: string;
	assignee?: string | null;
	labels?: string[];
	updatedAt?: string;
	project?: string;
}

interface SessionRef {
	name: string;
	agentName: string;
	taskId: string | null;
	taskTitle: string | null;
	taskStatus: string | null;
	state: string | null;
	model?: string;
	project?: string;
	contextPercent?: number | null;
	outputTail?: string[];
}

interface ProjectRef {
	name: string;
	description?: string;
	path?: string;
	port?: number;
}

interface RecentClosedRef {
	id: string;
	title: string;
	closedByAgent?: string;
	closedAt?: string;
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
	const projects = browser ? buildProjectRefs(sessions, hoveredSession) : [];

	const activeSessions = orderHoveredFirst(
		sessions.slice(0, MAX_ACTIVE_SESSIONS).map(toSessionRef),
		(s) => s.name === hoveredSession
	);

	const visibleTasks = orderHoveredFirst(
		publishedVisibleTasks.slice(0, MAX_VISIBLE_TASKS).map(normalizeTask),
		(t) => t.id === publishedSelectedTaskId
	);

	const recentlyClosedTasks = collectRecentlyClosedTasks(sessions);

	return {
		pinned: {
			route,
			hoveredSession: hoveredSession ?? null,
			selectedTask: publishedSelectedTaskId,
			lastMatchedAction: publishedLastMatchedAction
		},
		trimmable: {
			visibleTasks,
			activeSessions,
			projects,
			recentlyClosedTasks
		}
	};
};

function normalizeTask(t: VisibleTaskRef): VisibleTaskRef {
	return {
		...t,
		description: truncate(t.description, TASK_DESCRIPTION_MAX),
		labels: t.labels?.slice(0, 5)
	};
}

function toSessionRef(s: WorkSession): SessionRef {
	return {
		name: s.sessionName,
		agentName: s.agentName,
		taskId: s.task?.id ?? null,
		taskTitle: s.task?.title ?? null,
		taskStatus: s.task?.status ?? null,
		state: s._sseState ?? null,
		project: s.project,
		contextPercent: s.contextPercent ?? null,
		outputTail: extractOutputTail(s.output)
	};
}

/**
 * Build project entries with descriptions, ordered by relevance:
 *   1. Project of the hovered session (most likely target)
 *   2. Projects of any active session
 *   3. Project of the current route (best-effort match by name)
 *   4. Remaining projects, alphabetical
 */
function buildProjectRefs(
	sessions: WorkSession[],
	hoveredSession: string | null
): ProjectRef[] {
	const configs = getProjects();
	if (!configs.length) return [];

	const hovered = sessions.find((s) => s.sessionName === hoveredSession)?.project ?? null;
	const activeProjects = new Set(
		sessions.map((s) => s.project).filter((p): p is string => Boolean(p))
	);

	const score = (name: string): number => {
		if (name === hovered) return 0;
		if (activeProjects.has(name)) return 1;
		return 2;
	};

	const refs: ProjectRef[] = configs.map((p) => ({
		name: p.name,
		description: truncate(p.description, PROJECT_DESCRIPTION_MAX),
		path: p.path,
		port: p.port
	}));

	return refs.sort((a, b) => {
		const sa = score(a.name);
		const sb = score(b.name);
		if (sa !== sb) return sa - sb;
		return a.name.localeCompare(b.name);
	});
}

function collectRecentlyClosedTasks(sessions: WorkSession[]): RecentClosedRef[] {
	const out: RecentClosedRef[] = [];
	for (const s of sessions) {
		const t = s.lastCompletedTask;
		if (t?.id && t.title) {
			out.push({
				id: t.id,
				title: t.title,
				closedByAgent: s.agentName,
				closedAt: t.closedAt
			});
		}
	}
	// Newest first; the framework trims from the tail (oldest).
	out.sort((a, b) => (b.closedAt ?? '').localeCompare(a.closedAt ?? ''));
	return out.slice(0, MAX_RECENT_CLOSED);
}

function extractOutputTail(output: string | undefined): string[] | undefined {
	if (!output) return undefined;
	const lines = output
		.split('\n')
		.map((l) => l.trim())
		.filter((l) => l.length > 0);
	if (!lines.length) return undefined;
	return lines
		.slice(-SESSION_OUTPUT_LINES)
		.map((l) => (l.length > SESSION_OUTPUT_LINE_MAX ? l.slice(0, SESSION_OUTPUT_LINE_MAX) + '…' : l));
}

function truncate(s: string | undefined, max: number): string | undefined {
	if (!s) return undefined;
	if (s.length <= max) return s;
	return s.slice(0, max).trimEnd() + '…';
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
