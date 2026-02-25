/**
 * Feedback Thread API
 *
 * POST /api/feedback/reports/[id]/thread
 * Append a dev entry to a feedback thread.
 *
 * Body: { message: string, summary?: string[], type?: 'completion' | 'note' }
 */
import { json } from '@sveltejs/kit';
import { getTaskById } from '$lib/server/jat-tasks.js';
import { appendThreadEntry, generateEntryId } from '$lib/server/feedbackThreads.js';

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
		const { message, summary, type } = body;

		if (!message || typeof message !== 'string' || message.trim().length === 0) {
			return json(
				{ ok: false, error: 'Message is required' },
				{ status: 400, headers: CORS_HEADERS }
			);
		}

		// Validate task exists
		const task = getTaskById(id);
		if (!task) {
			return json(
				{ ok: false, error: 'Report not found' },
				{ status: 404, headers: CORS_HEADERS }
			);
		}

		const entryType = type === 'note' ? 'note' : 'completion';

		appendThreadEntry(id, {
			id: generateEntryId(),
			from: 'dev',
			type: entryType,
			message: message.trim(),
			summary: Array.isArray(summary) ? summary : undefined,
			at: new Date().toISOString(),
		});

		return json({ ok: true }, { headers: CORS_HEADERS });
	} catch (err) {
		console.error('[feedback-thread] Error:', err);
		return json(
			{ ok: false, error: err.message || 'Failed to add thread entry' },
			{ status: 500, headers: CORS_HEADERS }
		);
	}
}
