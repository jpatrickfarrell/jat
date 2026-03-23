/**
 * Feedback Report Reply API
 *
 * POST /api/feedback/reports/[id]/reply
 * Send a dev reply to a feedback report without spawning an agent.
 *
 * Body: { message: string, close?: boolean }
 *
 * - Adds a thread entry (from: 'dev', type: 'question')
 * - Appends reply to task notes
 * - If close is true (default), closes task with close_reason "Needs clarification"
 * - Routes reply back to origin channel via jat-reply-router (non-blocking)
 * - Invalidates caches
 */
import { json } from '@sveltejs/kit';
import { getTaskById, closeTask, updateTask } from '$lib/server/jat-tasks.js';
import { invalidateCache } from '$lib/server/cache.js';
import { _resetTaskCache } from '../../../../../api/agents/+server.js';
import { appendThreadEntry, generateEntryId } from '$lib/server/feedbackThreads.js';
import { execFile } from 'child_process';
import { homedir } from 'os';
import { join } from 'path';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Max-Age': '86400'
};

/** @type {import('./$types').RequestHandler} */
export async function OPTIONS() {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	try {
		const { id } = params;
		const body = await request.json();
		const { message, close = true } = body;

		if (!message || typeof message !== 'string' || message.trim().length < 5) {
			return json(
				{ ok: false, error: 'Reply message must be at least 5 characters' },
				{ status: 400, headers: CORS_HEADERS }
			);
		}

		// Validate task exists (searches all projects)
		const task = getTaskById(id);
		if (!task) {
			return json(
				{ ok: false, error: 'Task not found' },
				{ status: 404, headers: CORS_HEADERS }
			);
		}

		// Use the task's own project path so cross-project tasks resolve correctly
		const taskProjectPath = task.project_path || undefined;
		const trimmedMessage = message.trim();

		// 1. Append thread entry
		try {
			appendThreadEntry(id, {
				id: generateEntryId(),
				from: 'dev',
				type: 'question',
				message: trimmedMessage,
				at: new Date().toISOString()
			});
		} catch (err) {
			console.warn('[feedback-reply] Failed to append thread entry:', err.message);
		}

		// 2. Update task notes with the reply
		const timestamp = new Date().toISOString().split('T')[0];
		const noteEntry = `\n\nDev reply (${timestamp}): ${trimmedMessage}`;
		const updatedNotes = (task.notes || '') + noteEntry;

		if (close) {
			// Close with clarification reason
			closeTask(id, `Needs clarification: ${trimmedMessage.slice(0, 200)}`, taskProjectPath);
			// Also update notes since closeTask doesn't set notes
			updateTask(id, { notes: updatedNotes, projectPath: taskProjectPath });
		} else {
			// Keep open but add notes
			updateTask(id, { notes: updatedNotes, projectPath: taskProjectPath });
		}

		// 3. Route reply back to origin channel (non-blocking, best-effort)
		try {
			const replyRouterPath = join(homedir(), '.local', 'bin', 'jat-reply-router');
			execFile('node', [replyRouterPath, '--task-id', id, '--message', trimmedMessage, '--type', 'question'], {
				timeout: 10000
			}, (err, stdout, stderr) => {
				if (err) {
					console.warn('[feedback-reply] Reply router failed (non-blocking):', err.message);
				} else if (stdout) {
					console.log('[feedback-reply] Reply router:', stdout.trim());
				}
			});
		} catch (err) {
			console.warn('[feedback-reply] Failed to invoke reply router:', err.message);
		}

		// 4. Invalidate caches
		invalidateCache.tasks();
		_resetTaskCache();

		return json({
			ok: true,
			closed: close,
			message: close ? 'Reply sent and task closed' : 'Reply sent, task remains open'
		}, { headers: CORS_HEADERS });
	} catch (err) {
		console.error('[feedback-reply] Error:', err);
		return json(
			{ ok: false, error: err.message || 'Failed to send reply' },
			{ status: 500, headers: CORS_HEADERS }
		);
	}
}
