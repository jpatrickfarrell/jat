/**
 * Poll History API
 *
 * GET /api/ingest/[sourceId]/polls
 *
 * poll_log table has been retired (jat-on1rt.8). Returns empty results.
 * Per-source item counts are available via GET /api/ingest/stats.
 */

import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	return json({ polls: [], total: 0 });
}
