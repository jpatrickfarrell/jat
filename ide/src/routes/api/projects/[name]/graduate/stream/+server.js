/**
 * Streaming Project Graduation API
 *
 * POST /api/projects/[name]/graduate/stream
 *   body: { url: string, force?: boolean }
 *
 * Runs graduateProject() for real and streams phase-progress events back to
 * the client as newline-delimited JSON (NDJSON).  Each line is one JSON
 * object; the final line is either:
 *
 *   { type: "done", result: GraduateResult }
 *   { type: "error", error: string }
 *
 * Earlier lines are:
 *
 *   { type: "progress", phase, message, percent, current?, total? }
 *
 * The wizard consumes this stream to render a running progress bar and
 * per-phase status label.  Auto-rollback is already atomic inside
 * graduateProject(): any failure leaves SQLite and projects.json untouched,
 * and the error is surfaced on the final line.
 *
 * NDJSON (not SSE) is used because EventSource is GET-only and the body
 * carries a Postgres URL we don't want in the query string.
 */

import { error } from '@sveltejs/kit';
import { graduateProject } from '../../../../../../../../lib/tasks-graduate.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const projectName = params.name;
	if (!projectName) {
		throw error(400, 'Missing project name');
	}

	let body;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	const url = typeof body?.url === 'string' ? body.url.trim() : '';
	const force = body?.force === true;
	const markAllInternal = body?.markAllInternal === true;

	if (!url) {
		throw error(400, 'url is required');
	}
	if (!url.startsWith('postgres://') && !url.startsWith('postgresql://')) {
		throw error(400, 'url must start with postgres:// or postgresql://');
	}

	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		async start(controller) {
			/** @param {Record<string, any>} obj */
			const send = (obj) => {
				try {
					controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'));
				} catch {
					// Client disconnected — graduation continues to completion
					// so data ends up in a consistent state.
				}
			};

			send({ type: 'progress', phase: 'starting', message: 'Starting graduation…', percent: 0 });

			try {
				const result = await graduateProject({
					projectNameOrPath: projectName,
					postgresUrl: url,
					force,
					markAllInternal,
					onProgress: (event) => send({ type: 'progress', ...event }),
				});
				send({ type: 'done', result });
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				send({ type: 'error', error: message });
			} finally {
				try { controller.close(); } catch { /* noop */ }
			}
		},
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'application/x-ndjson; charset=utf-8',
			'Cache-Control': 'no-cache, no-transform',
			'X-Accel-Buffering': 'no',
		},
	});
}
