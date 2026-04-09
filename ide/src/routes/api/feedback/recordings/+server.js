/**
 * Feedback Recording Storage API
 *
 * Stores rrweb session recording events as JSON files.
 * GET  - Serve a recording file by filename.
 * POST - Upload recording events, returns URL path for inclusion in report.
 * OPTIONS - CORS preflight
 */
import { json } from '@sveltejs/kit';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';
import { gzipSync, gunzipSync } from 'zlib';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Max-Age': '86400'
};

/** Max recording size: 10MB uncompressed */
const MAX_RECORDING_SIZE = 10 * 1024 * 1024;

/**
 * OPTIONS /api/feedback/recordings - CORS preflight
 */
export async function OPTIONS() {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * GET /api/feedback/recordings?file=filename.json.gz
 *
 * Serves a gzipped recording file as JSON.
 * Also accepts filesystem paths for backwards compatibility (strips to filename).
 */
export async function GET({ url }) {
	try {
		let fileParam = url.searchParams.get('file');
		if (!fileParam) {
			return json({ ok: false, error: 'file parameter required' }, { status: 400, headers: CORS_HEADERS });
		}

		// Strip filesystem path to filename only (backwards compat with old stored paths)
		const filename = basename(fileParam);

		// Validate filename — only allow safe characters
		if (!/^[\w\-\.]+\.json\.gz$/.test(filename)) {
			return json({ ok: false, error: 'Invalid filename' }, { status: 400, headers: CORS_HEADERS });
		}

		const recordingsDir = join(homedir(), '.local', 'share', 'jat', 'task-recordings');
		const filepath = join(recordingsDir, filename);

		if (!existsSync(filepath)) {
			return json({ ok: false, error: 'Recording not found' }, { status: 404, headers: CORS_HEADERS });
		}

		const compressed = readFileSync(filepath);
		const eventsJson = gunzipSync(compressed).toString('utf-8');
		const events = JSON.parse(eventsJson);

		return json(events, { headers: CORS_HEADERS });
	} catch (err) {
		console.error('[feedback-recordings] GET error:', err);
		return json({ ok: false, error: err.message || 'Failed to serve recording' }, { status: 500, headers: CORS_HEADERS });
	}
}

/**
 * POST /api/feedback/recordings
 *
 * Body: { events: unknown[], reportId: string }
 * Returns: { ok: true, recording_url: string }
 */
export async function POST({ request }) {
	try {
		const body = await request.json();

		// Validate required fields
		if (!body.reportId || typeof body.reportId !== 'string') {
			return json(
				{ ok: false, error: 'reportId is required' },
				{ status: 400, headers: CORS_HEADERS }
			);
		}

		if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
			return json(
				{ ok: false, error: 'events array is required and must not be empty' },
				{ status: 400, headers: CORS_HEADERS }
			);
		}

		const reportId = body.reportId.trim().replace(/[^a-zA-Z0-9._-]/g, '');
		if (!reportId) {
			return json(
				{ ok: false, error: 'Invalid reportId format' },
				{ status: 400, headers: CORS_HEADERS }
			);
		}

		// Serialize events to JSON
		const eventsJson = JSON.stringify(body.events);

		// Check size limit
		if (eventsJson.length > MAX_RECORDING_SIZE) {
			return json(
				{ ok: false, error: `Recording too large: ${(eventsJson.length / 1024 / 1024).toFixed(1)}MB exceeds 10MB limit` },
				{ status: 413, headers: CORS_HEADERS }
			);
		}

		// Gzip compress for storage efficiency
		const compressed = gzipSync(Buffer.from(eventsJson, 'utf-8'));

		// Store in local recordings directory
		const recordingsDir = join(homedir(), '.local', 'share', 'jat', 'task-recordings');
		if (!existsSync(recordingsDir)) {
			mkdirSync(recordingsDir, { recursive: true });
		}

		const filename = `${reportId}.json.gz`;
		const filepath = join(recordingsDir, filename);
		writeFileSync(filepath, compressed);

		// Return a URL path (not filesystem path) so the widget can fetch it back
		const recordingUrlPath = `/api/feedback/recordings?file=${filename}`;

		return json(
			{
				ok: true,
				recording_url: recordingUrlPath,
				size: compressed.length,
				events_count: body.events.length
			},
			{ status: 201, headers: CORS_HEADERS }
		);
	} catch (err) {
		console.error('[feedback-recordings] Error:', err);
		return json(
			{ ok: false, error: err.message || 'Failed to store recording' },
			{ status: 500, headers: CORS_HEADERS }
		);
	}
}
