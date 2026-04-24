/**
 * POST /api/tasks/voice-dismiss
 * Body: { voice_id: string }
 *
 * Appends a "dismissed" entry to the voice timeline for the given voice_id.
 * The timeline collapse logic filters out dismissed entries, so the card
 * disappears from VoiceInbox on the next poll.
 */
import { json } from '@sveltejs/kit';
import { appendFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { getVoiceTimelineFile } from '$lib/server/voice-core.js';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { voice_id } = await request.json();
		if (!voice_id || typeof voice_id !== 'string') {
			return json({ error: 'Missing voice_id' }, { status: 400, headers: CORS_HEADERS });
		}

		const event = {
			type: 'dismissed',
			voice_id,
			session_id: 'voice',
			tmux_session: 'jat-voice',
			timestamp: new Date().toISOString(),
			data: {}
		};
		const line = JSON.stringify(event) + '\n';

		const timelineFile = getVoiceTimelineFile();
		mkdirSync(dirname(timelineFile), { recursive: true });
		appendFileSync(timelineFile, line);
		try { appendFileSync('/tmp/jat-timeline-jat-voice.jsonl', line); } catch {}

		return json({ ok: true }, { headers: CORS_HEADERS });
	} catch (e) {
		return json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500, headers: CORS_HEADERS });
	}
}
