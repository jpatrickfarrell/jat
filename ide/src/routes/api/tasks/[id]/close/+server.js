/**
 * Task Close API Route
 * Closes a task using direct lib/tasks.js call
 * Used by Close & Kill action to abandon tasks quickly without full completion
 */
import { json } from '@sveltejs/kit';
import { getTaskById, closeTask } from '$lib/server/jat-tasks.js';
import { invalidateCache } from '$lib/server/cache.js';
import { _resetTaskCache } from '../../../../api/agents/+server.js';
import { emitEvent } from '$lib/utils/eventBus.server.js';

/**
 * Fire integration callback if this task was ingested from an external source.
 * Non-blocking — failures are logged but don't affect the close response.
 *
 * @param {typeof globalThis.fetch} internalFetch - SvelteKit internal fetch
 * @param {string} taskId
 * @param {string} reason
 */
async function fireIntegrationCallback(internalFetch, taskId, reason) {
	try {
		const integrationRes = await internalFetch(`/api/tasks/integrations?taskIds=${taskId}`);
		if (!integrationRes.ok) return;

		const { integrations } = await integrationRes.json();
		const integration = integrations?.[taskId];
		if (!integration?.sourceId || !integration?.callback?.url || !integration?.referenceId) {
			return; // No integration or no callback configured
		}

		const callbackRes = await internalFetch(`/api/integrations/${integration.sourceId}/callback`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				taskId,
				event: 'task_closed',
				referenceId: integration.referenceId,
				taskStatus: 'closed',
				notes: reason !== 'Closed via IDE' ? reason : undefined
			})
		});

		const result = await callbackRes.json().catch(() => ({}));
		if (result.success) {
			console.log(`[close] Integration callback fired for ${taskId} (${result.duration_ms}ms)`);
		} else {
			console.warn(`[close] Integration callback failed for ${taskId}:`, result.error || 'unknown');
		}
	} catch (e) {
		console.warn('[close] Integration callback error (non-blocking):', e.message || e);
	}
}

/**
 * Close a task
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ params, request, fetch: internalFetch }) {
	const taskId = params.id;

	try {
		// Check if task exists first
		const existingTask = getTaskById(taskId);
		if (!existingTask) {
			return json(
				{ error: true, message: `Task '${taskId}' not found` },
				{ status: 404 }
			);
		}

		// Check if task is already closed
		if (existingTask.status === 'closed') {
			return json({
				success: true,
				message: 'Task is already closed',
				task: existingTask
			});
		}

		// Parse optional reason from body
		let reason = 'Closed via IDE';
		try {
			const body = await request.json();
			if (body.reason) {
				reason = body.reason;
			}
		} catch {
			// Body is optional, use default reason
		}

		// Close the task directly
		const closedTask = closeTask(taskId, reason, existingTask.project_path);

		console.log(`[close] Closed task ${taskId}`);

		// Invalidate related caches
		invalidateCache.tasks();
		invalidateCache.agents();
		_resetTaskCache();

		// Emit task_closed event for workflow triggers
		try {
			emitEvent({
				type: 'task_closed',
				source: 'task_api',
				data: {
					taskId,
					title: existingTask.title,
					reason,
					project: existingTask.project_name || undefined,
					assignee: existingTask.assignee || undefined
				},
				project: existingTask.project_name || undefined
			});
		} catch (e) {
			console.error('[tasks/close] Failed to emit task_closed event:', e);
		}

		// Fire integration callback (non-blocking, don't await)
		fireIntegrationCallback(internalFetch, taskId, reason).catch(() => {});

		return json({
			success: true,
			message: `Task ${taskId} closed`,
			task: closedTask
		});
	} catch (error) {
		const err = /** @type {Error} */ (error);
		console.error('Error closing task:', err);
		return json({ error: 'Failed to close task', details: err.message }, { status: 500 });
	}
}
