/**
 * Feedback Report Respond API
 *
 * PATCH /api/feedback/reports/[id]/respond
 * Accept or reject a completed feedback report.
 *
 * Body: { response: 'accepted' | 'rejected', reason?: string }
 */
import { json } from '@sveltejs/kit';
import { closeTask, updateTask, getTaskById } from '$lib/server/jat-tasks.js';
import { invalidateCache } from '$lib/server/cache.js';
import { _resetTaskCache } from '../../../../../api/agents/+server.js';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Max-Age': '86400'
};

/** @type {import('./$types').RequestHandler} */
export async function OPTIONS() {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ params, request }) {
	try {
		const { id } = params;
		const body = await request.json();
		const { response, reason } = body;

		if (!response || !['accepted', 'rejected'].includes(response)) {
			return json(
				{ ok: false, error: 'Response must be "accepted" or "rejected"' },
				{ status: 400, headers: CORS_HEADERS }
			);
		}

		if (response === 'rejected' && (!reason || reason.trim().length < 10)) {
			return json(
				{ ok: false, error: 'Rejection reason must be at least 10 characters' },
				{ status: 400, headers: CORS_HEADERS }
			);
		}

		const projectPath = process.cwd().replace(/\/ide$/, '');

		// Get current task
		const task = getTaskById(id);
		if (!task) {
			return json(
				{ ok: false, error: 'Report not found' },
				{ status: 404, headers: CORS_HEADERS }
			);
		}

		if (response === 'accepted') {
			// Close the task as accepted
			closeTask(id, 'Accepted by requester', projectPath);
		} else {
			// Rejected - reopen the task for another work cycle
			const notes = task.notes
				? `${task.notes}\n\nRejected: ${reason}`
				: `Rejected: ${reason}`;
			updateTask(id, { status: 'open', notes, projectPath });
		}

		// Invalidate caches
		invalidateCache.tasks();
		_resetTaskCache();

		return json({ ok: true }, { headers: CORS_HEADERS });
	} catch (err) {
		console.error('[feedback-respond] Error:', err);
		return json(
			{ ok: false, error: err.message || 'Failed to respond' },
			{ status: 500, headers: CORS_HEADERS }
		);
	}
}
