import { json } from '@sveltejs/kit';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { RequestHandler } from './$types';

/**
 * GET /api/mobile/inbox
 *
 * Aggregates every pending `needs_input`, `review`, `suggested_task`, and
 * `proposal` signal across all active sessions into one chronological list.
 *
 * Scans /tmp/jat-timeline-*.jsonl (one file per session) plus joins with the
 * current signal state from /tmp/jat-signal-tmux-*.json so we hide events that
 * have been superseded (e.g. a needs_input that was answered).
 *
 * Query params:
 *   - agent       filter by agent name (tmux session strips `jat-` prefix)
 *   - project     filter by project slug
 *   - type        comma-separated event types to include
 *   - since       ISO timestamp — only events after this time
 *   - limit       max events to return (default 200, max 1000)
 */

const SIGNAL_DIR = '/tmp';
const TIMELINE_PREFIX = 'jat-timeline-';
const SIGNAL_PREFIX = 'jat-signal-';

type InboxEventType = 'needs_input' | 'review' | 'suggested_task' | 'proposal';

export interface InboxEvent {
	id: string;
	type: InboxEventType;
	timestamp: string;
	sessionName: string; // tmux session name (e.g. "jat-CalmForest")
	agentName: string;   // stripped agent name (e.g. "CalmForest")
	project: string | null;
	taskId: string | null;
	taskTitle: string | null;
	title: string;       // display title (question, review summary, task title)
	summary?: string;    // optional secondary line
	question?: string;   // for needs_input
	questionType?: string;
	priority?: number;   // for suggested_task
	reason?: string;     // for suggested_task/proposal
	superseded: boolean; // true if a newer terminal state replaces this
	data?: any;
}

export interface InboxResponse {
	count: number;
	events: InboxEvent[];
	agents: string[];
	projects: string[];
	eventTypes: InboxEventType[];
	generatedAt: string;
}

interface TimelineEvent {
	type: string;
	state?: string;
	session_id?: string;
	tmux_session?: string;
	timestamp?: string;
	task_id?: string;
	data?: any;
	git_sha?: string;
}

interface SignalState {
	type?: string;
	state?: string;
	timestamp?: string;
	data?: any;
}

function getTimelineFiles(): string[] {
	try {
		return readdirSync(SIGNAL_DIR)
			.filter((f) => f.startsWith(TIMELINE_PREFIX) && f.endsWith('.jsonl'))
			.map((f) => join(SIGNAL_DIR, f));
	} catch {
		return [];
	}
}

function parseTimelineFile(filePath: string): TimelineEvent[] {
	try {
		const content = readFileSync(filePath, 'utf-8');
		const events: TimelineEvent[] = [];
		for (const line of content.split('\n')) {
			if (!line.trim()) continue;
			try {
				events.push(JSON.parse(line) as TimelineEvent);
			} catch {
				// skip malformed
			}
		}
		return events;
	} catch {
		return [];
	}
}

function readCurrentSignal(tmuxSession: string): SignalState | null {
	// Signal files use the tmux session name after the `tmux-` prefix
	const baseName = tmuxSession.startsWith('jat-') ? tmuxSession.slice(4) : tmuxSession;
	const candidates = [
		join(SIGNAL_DIR, `${SIGNAL_PREFIX}tmux-${tmuxSession}.json`),
		join(SIGNAL_DIR, `${SIGNAL_PREFIX}tmux-jat-${baseName}.json`),
		join(SIGNAL_DIR, `${SIGNAL_PREFIX}${tmuxSession}.json`)
	];
	for (const file of candidates) {
		if (!existsSync(file)) continue;
		try {
			return JSON.parse(readFileSync(file, 'utf-8')) as SignalState;
		} catch {
			// try next
		}
	}
	return null;
}

function agentNameFromTmux(tmuxSession: string | undefined): string {
	if (!tmuxSession) return 'unknown';
	return tmuxSession.startsWith('jat-') ? tmuxSession.slice(4) : tmuxSession;
}

function projectFromTaskId(taskId: string | null | undefined): string | null {
	if (!taskId) return null;
	const dash = taskId.indexOf('-');
	return dash > 0 ? taskId.slice(0, dash).toLowerCase() : null;
}

/** A session's signal state is considered "still pending" if its current state
 *  matches the event we're showing. Otherwise the event has been superseded. */
function isStatePending(
	signal: SignalState | null,
	wantState: 'needs_input' | 'review'
): boolean {
	if (!signal) return false;
	const cur = signal.state || signal.type;
	return cur === wantState;
}

export const GET: RequestHandler = async ({ url }) => {
	const agentFilter = url.searchParams.get('agent');
	const projectFilter = url.searchParams.get('project');
	const typeFilter = url.searchParams.get('type')?.split(',').map((t) => t.trim()).filter(Boolean);
	const since = url.searchParams.get('since');
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '200'), 1000);
	const sinceDate = since ? new Date(since) : null;

	const events: InboxEvent[] = [];
	const agents = new Set<string>();
	const projects = new Set<string>();
	const types = new Set<InboxEventType>();

	for (const file of getTimelineFiles()) {
		const fileName = file.split('/').pop() || '';
		// timeline file name: jat-timeline-{tmux_session}.jsonl
		const tmuxSession = fileName.slice(TIMELINE_PREFIX.length, -'.jsonl'.length);
		const timeline = parseTimelineFile(file);
		if (timeline.length === 0) continue;

		const currentSignal = readCurrentSignal(tmuxSession);
		const agentName = agentNameFromTmux(tmuxSession);

		// Walk events in chronological order, tracking latest pending state per
		// (task, type). Only emit the most recent occurrence, since earlier ones
		// are either answered or duplicates.
		type Key = string;
		const latestStateByKey = new Map<Key, TimelineEvent>();
		const completeEvents: TimelineEvent[] = [];
		const proposalEvents: TimelineEvent[] = [];

		for (const ev of timeline) {
			if (ev.type === 'state') {
				if (ev.state === 'needs_input' || ev.state === 'review') {
					const key: Key = `${ev.task_id || 'no-task'}|${ev.state}`;
					latestStateByKey.set(key, ev);
				}
			} else if (ev.type === 'complete') {
				completeEvents.push(ev);
			} else if (ev.type === 'proposal') {
				proposalEvents.push(ev);
			}
		}

		// Emit needs_input / review events (only if session is still in that state)
		for (const [key, ev] of latestStateByKey) {
			const wantState = key.endsWith('|needs_input') ? 'needs_input' : 'review';
			const pending = isStatePending(currentSignal, wantState);
			if (!pending) continue; // session has moved on — already answered/completed

			const taskId = ev.task_id || ev.data?.taskId || null;
			const project = ev.data?.project || projectFromTaskId(taskId);
			const taskTitle = ev.data?.taskTitle || null;

			const inboxEvent: InboxEvent = {
				id: `${tmuxSession}|${wantState}|${taskId || 'none'}|${ev.timestamp || ''}`,
				type: wantState,
				timestamp: ev.timestamp || new Date().toISOString(),
				sessionName: tmuxSession,
				agentName,
				project: project ?? null,
				taskId,
				taskTitle,
				title:
					wantState === 'needs_input'
						? ev.data?.question || taskTitle || 'Needs input'
						: ev.data?.summary?.[0] || taskTitle || 'Ready for review',
				question: wantState === 'needs_input' ? ev.data?.question : undefined,
				questionType: wantState === 'needs_input' ? ev.data?.questionType : undefined,
				summary: wantState === 'review' && Array.isArray(ev.data?.summary)
					? ev.data.summary.slice(1).join(' • ')
					: undefined,
				superseded: false,
				data: ev.data
			};
			events.push(inboxEvent);
			agents.add(agentName);
			if (inboxEvent.project) projects.add(inboxEvent.project);
			types.add(wantState);
		}

		// Emit suggested_task items (one row per suggestion from complete events)
		for (const ev of completeEvents) {
			const suggestions = Array.isArray(ev.data?.suggestedTasks) ? ev.data.suggestedTasks : [];
			const parentTaskId = ev.task_id || ev.data?.taskId || null;
			const project = ev.data?.project || projectFromTaskId(parentTaskId);
			for (let i = 0; i < suggestions.length; i++) {
				const sug = suggestions[i];
				if (!sug?.title) continue;
				const inboxEvent: InboxEvent = {
					id: `${tmuxSession}|suggested_task|${parentTaskId || 'none'}|${ev.timestamp}|${i}`,
					type: 'suggested_task',
					timestamp: ev.timestamp || new Date().toISOString(),
					sessionName: tmuxSession,
					agentName,
					project: project ?? null,
					taskId: parentTaskId,
					taskTitle: ev.data?.taskTitle || null,
					title: sug.title,
					summary: sug.description,
					priority: typeof sug.priority === 'number' ? sug.priority : undefined,
					reason: sug.reason,
					superseded: false,
					data: sug
				};
				events.push(inboxEvent);
				agents.add(agentName);
				if (inboxEvent.project) projects.add(inboxEvent.project);
				types.add('suggested_task');
			}

			// Emit proposals for each pending human action in the completion
			const humanActions = Array.isArray(ev.data?.humanActions) ? ev.data.humanActions : [];
			for (let i = 0; i < humanActions.length; i++) {
				const ha = humanActions[i];
				if (!ha) continue;
				const title = typeof ha === 'string' ? ha : ha.title || ha.description || ha.action;
				if (!title) continue;
				const inboxEvent: InboxEvent = {
					id: `${tmuxSession}|proposal|${parentTaskId || 'none'}|${ev.timestamp}|ha${i}`,
					type: 'proposal',
					timestamp: ev.timestamp || new Date().toISOString(),
					sessionName: tmuxSession,
					agentName,
					project: project ?? null,
					taskId: parentTaskId,
					taskTitle: ev.data?.taskTitle || null,
					title,
					summary: typeof ha === 'object' ? ha.description || ha.reason : undefined,
					reason: typeof ha === 'object' ? ha.reason : undefined,
					superseded: false,
					data: ha
				};
				events.push(inboxEvent);
				agents.add(agentName);
				if (inboxEvent.project) projects.add(inboxEvent.project);
				types.add('proposal');
			}
		}

		// Emit explicit proposal-type events (future-compat — if agents start
		// emitting `proposal` as a first-class signal type)
		for (const ev of proposalEvents) {
			const taskId = ev.task_id || ev.data?.taskId || null;
			const project = ev.data?.project || projectFromTaskId(taskId);
			const inboxEvent: InboxEvent = {
				id: `${tmuxSession}|proposal|${taskId || 'none'}|${ev.timestamp}`,
				type: 'proposal',
				timestamp: ev.timestamp || new Date().toISOString(),
				sessionName: tmuxSession,
				agentName,
				project: project ?? null,
				taskId,
				taskTitle: ev.data?.taskTitle || null,
				title: ev.data?.title || ev.data?.question || 'Proposal',
				summary: ev.data?.description || ev.data?.summary,
				reason: ev.data?.reason,
				superseded: false,
				data: ev.data
			};
			events.push(inboxEvent);
			agents.add(agentName);
			if (inboxEvent.project) projects.add(inboxEvent.project);
			types.add('proposal');
		}
	}

	// Apply filters
	let filtered = events;
	if (agentFilter) filtered = filtered.filter((e) => e.agentName === agentFilter);
	if (projectFilter) filtered = filtered.filter((e) => e.project === projectFilter);
	if (typeFilter && typeFilter.length > 0) {
		filtered = filtered.filter((e) => typeFilter.includes(e.type));
	}
	if (sinceDate) {
		filtered = filtered.filter((e) => new Date(e.timestamp) > sinceDate);
	}

	// Sort newest first
	filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

	if (limit > 0) filtered = filtered.slice(0, limit);

	const response: InboxResponse = {
		count: filtered.length,
		events: filtered,
		agents: [...agents].sort(),
		projects: [...projects].sort(),
		eventTypes: [...types].sort() as InboxEventType[],
		generatedAt: new Date().toISOString()
	};

	return json(response);
};
