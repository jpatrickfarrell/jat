/**
 * Integration Callback API
 *
 * POST /api/integrations/[sourceId]/callback
 *
 * Fires a webhook to the integration's callback URL.
 * Body: { taskId, event, referenceId, notes?, taskStatus? }
 *
 * Steps:
 * 1. Look up integration source config
 * 2. Validate callback config exists and event is allowed
 * 3. Resolve secret via jat-secret
 * 4. Map JAT task status to integration status
 * 5. Fire webhook to callback.url
 * 6. Log result to .jat/callback-log/{task-id}.jsonl
 * 7. Return success/failure
 */

import { json } from '@sveltejs/kit';
import { existsSync, readFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { execSync } from 'node:child_process';
import type { RequestHandler } from './$types';

const INTEGRATIONS_CONFIG_PATH = join(homedir(), '.config/jat/integrations.json');

interface CallbackRequest {
	taskId: string;
	event: string;
	referenceId: string;
	taskStatus?: string;
	notes?: string;
}

function loadIntegrationsConfig() {
	try {
		if (!existsSync(INTEGRATIONS_CONFIG_PATH)) return { sources: [] };
		return JSON.parse(readFileSync(INTEGRATIONS_CONFIG_PATH, 'utf-8'));
	} catch {
		return { sources: [] };
	}
}

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
	// Determine project from task ID prefix
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
		console.error('Failed to write callback log:', err);
	}
}

export const POST: RequestHandler = async ({ params, request }) => {
	const { sourceId } = params;

	let body: CallbackRequest;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { taskId, event, referenceId, taskStatus, notes } = body;

	if (!taskId || !event || !referenceId) {
		return json({ error: 'Missing required fields: taskId, event, referenceId' }, { status: 400 });
	}

	// Load integration source config
	const config = loadIntegrationsConfig();
	const source = (config.sources || []).find((s: any) => s.id === sourceId);
	if (!source) {
		return json({ error: `Integration source not found: ${sourceId}` }, { status: 404 });
	}

	// Validate callback config exists
	if (!source.callback) {
		return json({ error: `Integration source "${sourceId}" has no callback configuration` }, { status: 400 });
	}

	const { callback } = source;

	// Validate event is allowed
	if (!callback.events || !callback.events.includes(event)) {
		return json({
			error: `Event "${event}" is not configured for source "${sourceId}". Allowed: ${(callback.events || []).join(', ')}`
		}, { status: 400 });
	}

	// Resolve shared secret (callback-specific, or fall back to source's secretName)
	const secretName = callback.secretName || source.secretName;
	if (!secretName) {
		return json({
			error: `No secret configured for source "${sourceId}"`
		}, { status: 500 });
	}
	const secret = getSecret(secretName);
	if (!secret) {
		return json({
			error: `Failed to resolve secret "${secretName}" for source "${sourceId}"`
		}, { status: 500 });
	}

	// Map JAT status to integration status
	const mappedStatus = taskStatus && callback.statusMapping
		? (callback.statusMapping[taskStatus] || taskStatus)
		: undefined;

	// Build webhook payload
	const payload = {
		source: 'jat',
		event,
		reference_table: callback.referenceTable,
		reference_id: referenceId,
		data: {
			status: mappedStatus,
			notes: notes || undefined,
			task_id: taskId
		}
	};

	// Fire webhook with retry on transient failures (5xx, network errors)
	const MAX_RETRIES = 2;
	const RETRY_DELAYS = [2000, 5000]; // ms between retries
	const startTime = Date.now();
	let responseStatus = 0;
	let responseBody: Record<string, unknown> | null = null;
	let errorMsg: string | undefined;
	let attempts = 0;

	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		attempts = attempt + 1;
		responseStatus = 0;
		responseBody = null;
		errorMsg = undefined;

		if (attempt > 0) {
			await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt - 1]));
		}

		try {
			const response = await fetch(callback.url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${secret}`
				},
				body: JSON.stringify(payload),
				signal: AbortSignal.timeout(15000)
			});

			responseStatus = response.status;
			try {
				responseBody = await response.json();
			} catch {
				responseBody = { text: await response.text().catch(() => '') };
			}

			if (!response.ok) {
				errorMsg = `HTTP ${response.status}: ${JSON.stringify(responseBody)}`;
			}
		} catch (err: any) {
			responseStatus = 0;
			errorMsg = err.message || 'Network error';
		}

		// Success or non-retryable error (4xx) — stop retrying
		if (!errorMsg || (responseStatus >= 400 && responseStatus < 500)) {
			break;
		}
	}

	const durationMs = Date.now() - startTime;

	// Log the callback result
	const logEntry = {
		timestamp: new Date().toISOString(),
		event,
		url: callback.url,
		status: responseStatus,
		response: responseBody,
		duration_ms: durationMs,
		...(attempts > 1 ? { attempts } : {}),
		...(errorMsg ? { error: errorMsg } : {})
	};
	appendCallbackLog(taskId, logEntry);

	if (errorMsg) {
		return json({
			success: false,
			error: errorMsg,
			status: responseStatus,
			duration_ms: durationMs
		}, { status: 502 });
	}

	return json({
		success: true,
		status: responseStatus,
		response: responseBody,
		duration_ms: durationMs
	});
};
