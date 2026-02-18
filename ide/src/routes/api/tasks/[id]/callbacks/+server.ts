/**
 * Callback Log Read API
 *
 * GET /api/tasks/[id]/callbacks
 *
 * Reads the callback log for a task from .jat/callback-log/{task-id}.jsonl.
 * Returns the most recent 20 entries in reverse chronological order.
 */

import { json } from '@sveltejs/kit';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { RequestHandler } from './$types';

const MAX_ENTRIES = 20;

function getCallbackLogPath(taskId: string): string {
	const dashIdx = taskId.lastIndexOf('-');
	const project = dashIdx > 0 ? taskId.substring(0, dashIdx) : 'unknown';
	const projectPath = join(homedir(), 'code', project);
	return join(projectPath, '.jat', 'callback-log', `${taskId}.jsonl`);
}

export const GET: RequestHandler = async ({ params }) => {
	const { id: taskId } = params;

	if (!taskId) {
		return json({ error: 'Missing task ID' }, { status: 400 });
	}

	const logPath = getCallbackLogPath(taskId);

	if (!existsSync(logPath)) {
		return json({ entries: [], count: 0 });
	}

	try {
		const content = readFileSync(logPath, 'utf-8');
		const lines = content.trim().split('\n').filter(Boolean);

		// Parse and take the last MAX_ENTRIES, in reverse chronological order
		const entries = [];
		for (let i = lines.length - 1; i >= 0 && entries.length < MAX_ENTRIES; i--) {
			try {
				entries.push(JSON.parse(lines[i]));
			} catch {
				// Skip malformed lines
			}
		}

		return json({ entries, count: lines.length });
	} catch (err) {
		console.error('Error reading callback log:', err);
		return json({ error: 'Failed to read callback log' }, { status: 500 });
	}
};
