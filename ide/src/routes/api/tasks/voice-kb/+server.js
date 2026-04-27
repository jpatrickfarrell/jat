/**
 * Voice-to-KnowledgeBase API Route
 *
 * Narrower variant of /api/tasks/voice that extracts ONLY knowledge base
 * entries — no tasks, no summary. Use when the speaker is recording reference
 * material (client pricing, architectural decisions, requirements) that should
 * be saved as persistent reference rather than actionable work.
 *
 * Accepts either:
 *   1. JSON: { "text": "transcribed text" }
 *   2. Audio file (multipart/form-data or raw body)
 *
 * Uploads return immediately (202 Accepted). Transcription + extraction run
 * in the background. KB entries appear in the Voice Inbox when extraction
 * completes — routed through the same timeline feed as /api/tasks/voice.
 *
 * POST    /api/tasks/voice-kb
 * OPTIONS /api/tasks/voice-kb - CORS preflight
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
} from '$lib/server/voice-pipeline.js';

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
 * Transcribe audio and extract KB entries (runs in background).
 * @param {string} audioPath
 */
function transcribeAndExtractKB(audioPath) {
	const id = randomBytes(4).toString('hex');
	const wavPath = join(TEMP_DIR, `transcribe-kb-${id}.wav`);

	vlog(`[voice-kb] Received audio: ${audioPath}`);

	exec(`ffmpeg -i "${audioPath}" -ar 16000 -ac 1 -y "${wavPath}" 2>/dev/null`, {
		timeout: 120_000
	}, async (convertErr) => {
		try { unlinkSync(audioPath); } catch {}

		if (convertErr) {
			vlog(`[voice-kb] ERROR: ffmpeg conversion failed: ${convertErr.message}`);
			try { unlinkSync(wavPath); } catch {}
			return;
		}

		vlog('[voice-kb] Transcribing with voxtype...');
		let text;
		try {
			text = await transcribe(wavPath);
		} catch (transcribeErr) {
			vlog(`[voice-kb] ERROR: ${transcribeErr.message}`);
			try { unlinkSync(wavPath); } catch {}
			return;
		}

		try { unlinkSync(wavPath); } catch {}

		vlog(`[voice-kb] Transcription complete (${text.length} chars). Extracting KB entries...`);

		try {
			const projects = loadProjects();
			const { title, knowledgeBase } = await organizeTranscript(text, projects, 'kb');
			appendToVoiceTimeline([], text, '', title, knowledgeBase);
			vlog(`[voice-kb] Done — ${knowledgeBase.length} KB entry(s) added to voice inbox`);
		} catch (extractErr) {
			vlog(`[voice-kb] ERROR: KB extraction failed: ${extractErr.message}`);
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

			// Extract KB entries in background
			const projects = loadProjects();
			organizeTranscript(text, projects, 'kb').then(({ title, knowledgeBase }) => {
				appendToVoiceTimeline([], text, '', title, knowledgeBase);
				vlog(`[voice-kb] Extracted ${knowledgeBase.length} KB entry(s) from text`);
			}).catch((err) => {
				vlog(`[voice-kb] KB extraction failed for text input: ${err.message}`);
			});

			return json({
				success: true,
				message: 'Voice note received — extracting knowledge base entries in background.'
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
			vlog(`[voice-kb] Audio received (${(sz/1024).toFixed(0)}KB) — queuing transcription`);
		} catch {
			vlog('[voice-kb] Audio received — queuing transcription');
		}

		transcribeAndExtractKB(audioTempPath);

		return json({
			success: true,
			message: 'Recording received — transcribing and extracting knowledge base entries in background.'
		}, { status: 202, headers: CORS_HEADERS });
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Failed to process request';
		console.error('[voice-kb] Error:', message);
		return json({ error: true, message }, { status: 500, headers: CORS_HEADERS });
	}
}
