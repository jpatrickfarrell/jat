/**
 * Feedback Recording Storage API
 *
 * Stores rrweb session recording events as JSON files.
 * POST - Upload recording events, returns file path for inclusion in report.
 * OPTIONS - CORS preflight
 */
import { json } from '@sveltejs/kit';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { gzipSync } from 'zlib';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

		return json(
			{
				ok: true,
				recording_url: filepath,
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
