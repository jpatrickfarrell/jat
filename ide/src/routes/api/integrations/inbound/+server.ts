/**
 * Inbound Integration Webhook
 *
 * POST /api/integrations/inbound
 *
 * Receives webhooks from external systems (e.g., Flush user accept/reject).
 *
 * Auth: Bearer token validated against `jat-inbound-webhook-secret` from credentials store.
 *
 * Body: { source, event, data: { response, task_id, reason? } }
 *
 * Events:
 *   user_responded:
 *     - "accepted" → Log to callback log only (no task modification)
 *     - "rejected" → Log to callback log + reopen task (status=open)
 */

import { json } from '@sveltejs/kit';
import { existsSync, appendFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { execSync } from 'node:child_process';
import type { RequestHandler } from './$types';

function getSecret(secretName: string): string | null {
	try {
		const result = execSync(`jat-secret ${secretName}`, {
			encoding: 'utf-8',
			timeout: 5000
		}).trim();
		return result || null;
	} catch {
		return null;
	}
}

function getCallbackLogPath(taskId: string): string {
	const dashIdx = taskId.lastIndexOf('-');
	const project = dashIdx > 0 ? taskId.substring(0, dashIdx) : 'unknown';
	const projectPath = join(homedir(), 'code', project);
	return join(projectPath, '.jat', 'callback-log', `${taskId}.jsonl`);
}

function appendCallbackLog(taskId: string, entry: Record<string, unknown>) {
	try {
		const logPath = getCallbackLogPath(taskId);
		const logDir = dirname(logPath);
		if (!existsSync(logDir)) {
			mkdirSync(logDir, { recursive: true });
		}
		appendFileSync(logPath, JSON.stringify(entry) + '\n');
	} catch (err) {
		console.error('[inbound] Failed to write callback log:', err);
	}
}

function reopenTask(taskId: string): { ok: boolean; error?: string } {
	try {
		execSync(`jt update "${taskId}" --status open`, {
			encoding: 'utf-8',
			timeout: 10000,
			cwd: homedir()
		});
		return { ok: true };
	} catch (err: any) {
		return { ok: false, error: err.message || 'Failed to reopen task' };
	}
}

export const POST: RequestHandler = async ({ request }) => {
	// Validate auth
	const authHeader = request.headers.get('authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return json({ error: 'Missing or invalid Authorization header' }, { status: 401 });
	}

	const token = authHeader.slice(7);
	const expectedSecret = getSecret('jat-inbound-webhook-secret');
	if (!expectedSecret) {
		console.error('[inbound] Secret "jat-inbound-webhook-secret" not configured');
		return json({ error: 'Webhook secret not configured' }, { status: 500 });
	}

	if (token !== expectedSecret) {
		return json({ error: 'Invalid token' }, { status: 403 });
	}

	// Parse body
	let body: { source?: string; event?: string; data?: Record<string, unknown> };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { source, event, data } = body;

	if (!source || !event || !data) {
		return json({ error: 'Missing required fields: source, event, data' }, { status: 400 });
	}

	const taskId = data.task_id as string;
	if (!taskId) {
		return json({ error: 'Missing data.task_id' }, { status: 400 });
	}

	// Handle events
	if (event === 'user_responded') {
		const response = data.response as string;
		const reason = data.reason as string | undefined;

		if (!response || !['accepted', 'rejected'].includes(response)) {
			return json({ error: 'data.response must be "accepted" or "rejected"' }, { status: 400 });
		}

		const timestamp = new Date().toISOString();

		// Log to callback log
		const logEntry: Record<string, unknown> = {
			timestamp,
			event: 'user_responded',
			source,
			response,
			task_id: taskId,
			...(reason ? { reason } : {})
		};

		if (response === 'rejected') {
			// Reopen the task
			const result = reopenTask(taskId);
			logEntry.task_reopened = result.ok;
			if (!result.ok) {
				logEntry.reopen_error = result.error;
			}

			appendCallbackLog(taskId, logEntry);

			if (!result.ok) {
				return json({
					ok: false,
					logged: true,
					error: `Logged rejection but failed to reopen task: ${result.error}`
				}, { status: 207 });
			}

			return json({
				ok: true,
				action: 'task_reopened',
				task_id: taskId,
				reason: reason || undefined
			});
		}

		// Accepted — just log, no task modification
		appendCallbackLog(taskId, logEntry);

		return json({
			ok: true,
			action: 'logged',
			task_id: taskId
		});
	}

	// Unknown event
	return json({ error: `Unknown event: ${event}` }, { status: 400 });
};
