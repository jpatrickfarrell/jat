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

const MAX_VISIBLE_TASKS = 100;
const MAX_ACTIVE_SESSIONS = 30;
const MAX_RECENT_CLOSED = 15;
const MAX_RECENT_TASKS = 100;
const MAX_MEMORIES = 30;
/** Per-field truncation: keep enough text to disambiguate without sending bodies. */
const TASK_DESCRIPTION_MAX = 600;
const PROJECT_DESCRIPTION_MAX = 400;
const MEMORY_SUMMARY_MAX = 600;
/** Output snippet from active sessions — last few non-empty lines. */
const SESSION_OUTPUT_LINES = 6;
const SESSION_OUTPUT_LINE_MAX = 160;
/** How often to refresh server-backed caches (recent tasks, memories). */
const CACHE_REFRESH_MS = 60_000;
const CACHE_FETCH_TIMEOUT_MS = 4_000;

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

/** Recent task pulled from /api/tasks (server-backed; cached client-side). */
interface RecentTaskRef {
	id: string;
	title: string;
	status: string;
	priority?: number;
	type?: string;
	project?: string;
	assignee?: string | null;
	updatedAt?: string;
	description?: string;
	labels?: string[];
}

/** Recent agent-memory file (the per-task notes saved by past agents). */
interface MemoryRef {
	project: string;
	taskId?: string;
	agent?: string;
	title?: string;
	summary?: string;
	type?: string;
	priority?: string;
	completedAt?: string;
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

/**
 * Server-backed caches refreshed every CACHE_REFRESH_MS. The builder reads
 * from these synchronously so dispatch latency stays at "store-read speed";
 * the first dispatch after page load may see empty caches, subsequent calls
 * benefit from a warm window.
 */
let recentTasksCache: RecentTaskRef[] = [];
let memoriesCache: MemoryRef[] = [];
let cacheStarted = false;
let cacheTimer: ReturnType<typeof setInterval> | null = null;

/** For tests — reset module state. */
export function _resetJatContextBridge(): void {
	publishedVisibleTasks = [];
	publishedSelectedTaskId = null;
	publishedLastMatchedAction = null;
	recentTasksCache = [];
	memoriesCache = [];
	if (cacheTimer) clearInterval(cacheTimer);
	cacheTimer = null;
	cacheStarted = false;
}

/** Lazy-start the background cache refresh on the first dispatch. */
function ensureCacheStarted(): void {
	if (cacheStarted || !browser) return;
	cacheStarted = true;
	void refreshCaches();
	cacheTimer = setInterval(() => void refreshCaches(), CACHE_REFRESH_MS);
}

async function refreshCaches(): Promise<void> {
	const project = inferActiveProjectName();
	const [tasks, memories] = await Promise.all([
		fetchRecentTasks(project),
		fetchRecentMemories(project)
	]);
	if (tasks) recentTasksCache = tasks;
	if (memories) memoriesCache = memories;
}

function inferActiveProjectName(): string | null {
	const sessions = workSessionsState.sessions;
	const hovered = get(hoveredSessionName);
	const hoveredProj = sessions.find((s) => s.sessionName === hovered)?.project;
	if (hoveredProj) return hoveredProj;
	const anyActive = sessions.find((s) => s.project)?.project;
	if (anyActive) return anyActive;
	return getProjects()[0]?.name ?? null;
}

async function fetchRecentTasks(project: string | null): Promise<RecentTaskRef[] | null> {
	const params = new URLSearchParams({
		status: 'open',
		limit: String(MAX_RECENT_TASKS)
	});
	if (project) params.set('project', project);
	const data = await fetchJson<{ tasks?: RawApiTask[] }>(`/api/tasks?${params}`);
	if (!data?.tasks) return null;
	return data.tasks.map(toRecentTaskRef);
}

async function fetchRecentMemories(project: string | null): Promise<MemoryRef[] | null> {
	if (!project) return [];
	const data = await fetchJson<{ files?: RawApiMemory[] }>(
		`/api/memory?action=browse&project=${encodeURIComponent(project)}`
	);
	if (!data?.files) return null;
	return data.files.slice(0, MAX_MEMORIES).map((f) => ({
		project: f.project,
		taskId: f.task,
		agent: f.agent,
		title: f.title,
		summary: truncate(f.summary, MEMORY_SUMMARY_MAX),
		type: f.type,
		priority: f.priority,
		completedAt: f.completed
	}));
}

interface RawApiTask {
	id: string;
	title: string;
	status: string;
	priority?: number;
	issue_type?: string;
	project?: string;
	assignee?: string | null;
	description?: string;
	labels?: string[];
	updated_at?: string;
}
interface RawApiMemory {
	project: string;
	task?: string;
	agent?: string;
	title?: string;
	summary?: string;
	type?: string;
	priority?: string;
	completed?: string;
}

function toRecentTaskRef(t: RawApiTask): RecentTaskRef {
	return {
		id: t.id,
		title: t.title,
		status: t.status,
		priority: t.priority,
		type: t.issue_type,
		project: t.project,
		assignee: t.assignee ?? null,
		updatedAt: t.updated_at,
		description: truncate(t.description, TASK_DESCRIPTION_MAX),
		labels: t.labels?.slice(0, 5)
	};
}

async function fetchJson<T>(url: string): Promise<T | null> {
	if (!browser) return null;
	try {
		const ctrl = new AbortController();
		const timer = setTimeout(() => ctrl.abort(), CACHE_FETCH_TIMEOUT_MS);
		const res = await fetch(url, { signal: ctrl.signal });
		clearTimeout(timer);
		if (!res.ok) return null;
		return (await res.json()) as T;
	} catch {
		return null;
	}
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
	if (browser) ensureCacheStarted();

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

	// Recent tasks from /api/tasks (open + sorted by updated_at). Dedupe against
	// visibleTasks so the same task doesn't appear twice; shipping both lists
	// is still useful since `visibleTasks` is route-aware (filtered/sorted by
	// the user's current view) while `recentTasks` is the global activity view.
	const visibleIds = new Set(visibleTasks.map((t) => t.id));
	const recentTasks = recentTasksCache.filter((t) => !visibleIds.has(t.id));

	const recentlyClosedTasks = collectRecentlyClosedTasks(sessions);

	return {
		pinned: {
			route,
			hoveredSession: hoveredSession ?? null,
			selectedTask: publishedSelectedTaskId,
			lastMatchedAction: publishedLastMatchedAction
		},
		trimmable: {
			// Order matters for trim priority — when over budget the framework
			// drops from the largest array each pass. Memory comes first since
			// agent learnings are usually the highest signal-per-byte.
			memories: memoriesCache,
			visibleTasks,
			recentTasks,
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
