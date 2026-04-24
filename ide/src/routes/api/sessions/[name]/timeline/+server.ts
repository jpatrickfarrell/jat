import { json } from '@sveltejs/kit';
import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';
import type { RequestHandler } from './$types';

export interface TimelineEvent {
	type: string;
	session_id: string;
	tmux_session: string;
	timestamp: string;
	state?: string;
	task_id?: string;
	data?: any;
	git_sha?: string;
	validation_warning?: string;
}

export interface TimelineResponse {
	session: string;
	events: TimelineEvent[];
	count: number;
	oldest?: string;
	newest?: string;
}

/**
 * GET /api/sessions/[name]/timeline
 *
 * Returns the signal timeline for a session (JSONL log).
 *
 * Query params:
 * - limit: Max events to return (default 50, max 500)
 * - offset: Skip N events from the end (for pagination)
 * - since: ISO timestamp - only return events after this time
 * - type: Comma-separated list of event types to include (e.g. "complete,review")
 * - taskId: Only return events matching this task ID
 */
export const GET: RequestHandler = async ({ params, url }) => {
	const sessionName = params.name;

	if (!sessionName) {
		return json({ error: 'Session name required' }, { status: 400 });
	}

	// Parse query params
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 500);
	const offset = parseInt(url.searchParams.get('offset') || '0');
	const since = url.searchParams.get('since');
	const typeFilter = url.searchParams.get('type')?.split(',').map(t => t.trim()).filter(Boolean);
	const taskIdFilter = url.searchParams.get('taskId');

	// Timeline file is named by tmux session (with jat- prefix if not present)
	const tmuxSession = sessionName.startsWith('jat-') ? sessionName : `jat-${sessionName}`;
	const timelineFile = `/tmp/jat-timeline-${tmuxSession}.jsonl`;

	// For jat-voice, also check the persistent .jat/voice-timeline.jsonl which
	// survives reboots (the /tmp file is ephemeral and wiped on restart).
	const isVoiceSession = tmuxSession === 'jat-voice';
	const projectRoot = process.cwd().replace(/\/ide$/, '');
	const persistentVoiceFile = isVoiceSession
		? join(projectRoot, '.jat', 'voice-timeline.jsonl')
		: null;

	const hasTmpFile = existsSync(timelineFile);
	const hasPersistentFile = persistentVoiceFile ? existsSync(persistentVoiceFile) : false;

	if (!hasTmpFile && !hasPersistentFile) {
		return json({
			session: sessionName,
			events: [],
			count: 0
		} satisfies TimelineResponse);
	}

	try {
		// Merge persistent + tmp content (persistent first for chronological order,
		// then deduplicate since voice-core dual-writes both during normal operation).
		let rawLines: string[] = [];

		if (hasPersistentFile && persistentVoiceFile) {
			const persContent = readFileSync(persistentVoiceFile, 'utf-8');
			rawLines.push(...persContent.trim().split('\n').filter(l => l.trim()));
		}

		if (hasTmpFile) {
			const tmpContent = readFileSync(timelineFile, 'utf-8');
			rawLines.push(...tmpContent.trim().split('\n').filter(l => l.trim()));
		}

		// Deduplicate by timestamp+type (voice-core writes the same event to both files)
		const seen = new Set<string>();
		const dedupedLines = rawLines.filter(line => {
			try {
				const ev = JSON.parse(line);
				// Use voice_id+type as dedup key when present (more precise than timestamp for voice events)
				const key = (ev as any).voice_id
					? `vid:${(ev as any).voice_id}|${ev.type}`
					: `${ev.timestamp}|${ev.type}`;
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			} catch {
				return true; // keep unparseable lines for later error handling
			}
		});

		const lines = dedupedLines;

		// Parse all events
		let events: TimelineEvent[] = [];
		for (const line of lines) {
			try {
				const event = JSON.parse(line) as TimelineEvent;
				events.push(event);
			} catch {
				// Skip malformed lines
			}
		}

		// Collapse voice_id-linked entries: last write wins per voice_id.
		// This makes processing → tasks → dismissed transitions seamless.
		if (isVoiceSession) {
			const voiceIdMap = new Map<string, TimelineEvent>();
			const noIdEvents: TimelineEvent[] = [];
			for (const event of events) {
				const vid = (event as any).voice_id;
				if (vid) {
					voiceIdMap.set(vid, event); // last write per id wins
				} else {
					noIdEvents.push(event);
				}
			}
			// Strip dismissed entries — they exist only to cancel their predecessor
			const collapsed = Array.from(voiceIdMap.values()).filter(e => e.type !== 'dismissed');
			events = [...noIdEvents, ...collapsed];
			// Re-sort chronologically (collapsed events have their completion timestamp)
			events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
		}

		// Filter by timestamp if 'since' provided
		if (since) {
			const sinceDate = new Date(since);
			events = events.filter(e => new Date(e.timestamp) > sinceDate);
		}

		// Filter by type if specified (e.g. type=complete,review)
		if (typeFilter && typeFilter.length > 0) {
			events = events.filter(e =>
				typeFilter.includes(e.type) ||
				(e.state && typeFilter.includes(e.state))
			);
		}

		// Filter by taskId if specified
		if (taskIdFilter) {
			events = events.filter(e => !e.task_id || e.task_id === taskIdFilter);
		}

		// Get total count before pagination
		const totalCount = events.length;

		// Apply pagination (from end - most recent first)
		// Events are in chronological order, so we reverse for most-recent-first
		events = events.reverse();

		if (offset > 0) {
			events = events.slice(offset);
		}

		if (limit > 0) {
			events = events.slice(0, limit);
		}

		// Get time range
		const oldest = events.length > 0 ? events[events.length - 1].timestamp : undefined;
		const newest = events.length > 0 ? events[0].timestamp : undefined;

		return json({
			session: sessionName,
			events,
			count: totalCount,
			oldest,
			newest
		} satisfies TimelineResponse);

	} catch (err: any) {
		return json({
			error: 'Failed to read timeline',
			details: err.message
		}, { status: 500 });
	}
};

/**
 * DELETE /api/sessions/[name]/timeline
 *
 * Clears the timeline log for a session.
 * Useful for cleanup or starting fresh.
 */
export const DELETE: RequestHandler = async ({ params }) => {
	const sessionName = params.name;

	if (!sessionName) {
		return json({ error: 'Session name required' }, { status: 400 });
	}

	const tmuxSession = sessionName.startsWith('jat-') ? sessionName : `jat-${sessionName}`;
	const timelineFile = `/tmp/jat-timeline-${tmuxSession}.jsonl`;

	if (!existsSync(timelineFile)) {
		return json({ success: true, message: 'Timeline already empty' });
	}

	try {
		const { unlinkSync } = await import('fs');
		unlinkSync(timelineFile);
		return json({ success: true, message: 'Timeline cleared' });
	} catch (err: any) {
		return json({
			error: 'Failed to clear timeline',
			details: err.message
		}, { status: 500 });
	}
};
