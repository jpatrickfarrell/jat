/**
 * Voice-to-Summary API Route
 *
 * Lightweight variant of /api/tasks/voice that produces ONLY an organized
 * title + summary — no task extraction, no knowledge base entries. Use for
 * long brain dumps where the speaker wants organized notes but is not ready
 * to commit to actionable tasks yet. Faster than /api/tasks/voice because
 * ollama generates fewer output tokens.
 *
 * Accepts either:
 *   1. JSON: { "text": "transcribed text" }
 *   2. Audio file (multipart/form-data or raw body)
 *
 * Uploads return immediately (202 Accepted). Transcription + summarization
 * run in the background. The summary appears in the Voice Inbox (with an
 * empty tasks[] array) when processing completes — routed through the same
 * timeline feed as /api/tasks/voice.
 *
 * POST    /api/tasks/voice-summary
 * OPTIONS /api/tasks/voice-summary - CORS preflight
 */
import { json } from '@sveltejs/kit';
import { writeFileSync, unlinkSync, mkdirSync, statSync } from 'fs';
import { exec } from 'child_process';
import { randomBytes } from 'crypto';
import { join } from 'path';
import {
	TEMP_DIR,
	vlog,
	loadProjects,
	transcribe,
	organizeTranscript,
	appendToVoiceTimeline
} from '$lib/server/voice-core.js';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Max-Age': '86400'
};

export async function OPTIONS() {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Transcribe audio and build a title + summary (runs in background).
 * @param {string} audioPath
 */
function transcribeAndSummarize(audioPath) {
	const id = randomBytes(4).toString('hex');
	const wavPath = join(TEMP_DIR, `transcribe-summary-${id}.wav`);

	vlog(`[voice-summary] Received audio: ${audioPath}`);

	exec(`ffmpeg -i "${audioPath}" -ar 16000 -ac 1 -y "${wavPath}" 2>/dev/null`, {
		timeout: 120_000
	}, async (convertErr) => {
		try { unlinkSync(audioPath); } catch {}

		if (convertErr) {
			vlog(`[voice-summary] ERROR: ffmpeg conversion failed: ${convertErr.message}`);
			try { unlinkSync(wavPath); } catch {}
			return;
		}

		vlog('[voice-summary] Transcribing with voxtype...');
		let text;
		try {
			text = await transcribe(wavPath);
		} catch (transcribeErr) {
			vlog(`[voice-summary] ERROR: ${transcribeErr.message}`);
			try { unlinkSync(wavPath); } catch {}
			return;
		}

		try { unlinkSync(wavPath); } catch {}

		vlog(`[voice-summary] Transcription complete (${text.length} chars). Organizing into summary...`);

		try {
			const projects = loadProjects();
			const { title, summary } = await organizeTranscript(text, projects, 'summary');
			appendToVoiceTimeline([], text, summary, title, []);
			vlog(`[voice-summary] Done — summary "${title}" added to voice inbox`);
		} catch (summarizeErr) {
			vlog(`[voice-summary] ERROR: summarization failed: ${summarizeErr.message}`);
		}
	});
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const contentType = request.headers.get('content-type') || '';

	try {
		if (contentType.includes('application/json')) {
			const body = await request.json();
			const text = body.text?.trim();

			if (!text) {
				return json({ error: true, message: 'Missing "text" field' }, { status: 400, headers: CORS_HEADERS });
			}

			// Summarize in background
			const projects = loadProjects();
			organizeTranscript(text, projects, 'summary').then(({ title, summary }) => {
				appendToVoiceTimeline([], text, summary, title, []);
				vlog(`[voice-summary] Summarized text input into "${title}"`);
			}).catch((err) => {
				vlog(`[voice-summary] Summarization failed for text input: ${err.message}`);
			});

			return json({
				success: true,
				message: 'Voice note received — organizing into a summary in background.'
			}, { status: 202, headers: CORS_HEADERS });
		}

		// Audio file — save and process async
		mkdirSync(TEMP_DIR, { recursive: true });

		let audioTempPath = '';

		if (contentType.includes('multipart/form-data')) {
			const formData = await request.formData();
			const file = formData.get('file') || formData.get('audio');

			if (!file || !(file instanceof File)) {
				return json({ error: true, message: 'Missing audio file' }, { status: 400, headers: CORS_HEADERS });
			}

			const ext = file.name?.split('.').pop() || 'm4a';
			audioTempPath = join(TEMP_DIR, `${randomBytes(8).toString('hex')}.${ext}`);
			writeFileSync(audioTempPath, Buffer.from(await file.arrayBuffer()));
		} else {
			const buffer = Buffer.from(await request.arrayBuffer());
			if (buffer.length === 0) {
				return json({ error: true, message: 'Empty request body' }, { status: 400, headers: CORS_HEADERS });
			}

			const ext = contentType.includes('m4a') ? 'm4a'
				: contentType.includes('mp4') ? 'mp4'
				: contentType.includes('mp3') || contentType.includes('mpeg') ? 'mp3'
				: contentType.includes('wav') ? 'wav'
				: contentType.includes('webm') ? 'webm'
				: 'm4a';

			audioTempPath = join(TEMP_DIR, `${randomBytes(8).toString('hex')}.${ext}`);
			writeFileSync(audioTempPath, buffer);
		}

		try {
			const sz = statSync(audioTempPath).size;
			vlog(`[voice-summary] Audio received (${(sz/1024).toFixed(0)}KB) — queuing transcription`);
		} catch {
			vlog('[voice-summary] Audio received — queuing transcription');
		}

		transcribeAndSummarize(audioTempPath);

		return json({
			success: true,
			message: 'Recording received — transcribing and summarizing in background.'
		}, { status: 202, headers: CORS_HEADERS });
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Failed to process request';
		console.error('[voice-summary] Error:', message);
		return json({ error: true, message }, { status: 500, headers: CORS_HEADERS });
	}
}
