/**
 * Voice Transcript API Route
 *
 * Transcribe-only fast path. Same input shapes as /api/tasks/voice but skips
 * the ollama organize step — no task extraction, no knowledge base, no summary.
 * The user just wants a clean text copy of what they said.
 *
 * Accepts either:
 *   1. JSON: { "text": "already-transcribed text", "title"?: "..." } — appends
 *      the text directly to the voice timeline as a transcript event.
 *   2. Audio file (multipart/form-data or raw body) — saved, converted to
 *      16kHz mono WAV via ffmpeg, transcribed via voxtype, then appended.
 *
 * Audio uploads return 202 immediately; transcription runs in the background.
 * The transcript event shows up in the Voice Inbox when transcription completes.
 *
 * POST /api/tasks/voice-transcript
 * OPTIONS /api/tasks/voice-transcript - CORS preflight
 */
import { json } from '@sveltejs/kit';
import { writeFileSync, unlinkSync, mkdirSync, statSync } from 'fs';
import { exec, execSync } from 'child_process';
import { randomBytes } from 'crypto';
import { join } from 'path';
import {
	TEMP_DIR,
	vlog,
	transcribe,
	appendTranscriptToVoiceTimeline
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
 * Extract creation date from audio file metadata via ffprobe.
 * Falls back to file mtime, then current time.
 * @param {string} filePath
 * @returns {Date}
 */
function getAudioDate(filePath) {
	try {
		const result = execSync(
			`ffprobe -v quiet -show_entries format_tags=creation_time -of csv=p=0 "${filePath}" 2>/dev/null`,
			{ encoding: 'utf-8', timeout: 5000 }
		).trim();
		if (result) {
			const d = new Date(result);
			if (!isNaN(d.getTime())) return d;
		}
	} catch {}

	try {
		return statSync(filePath).mtime;
	} catch {}

	return new Date();
}

/**
 * Read audio duration (seconds) via ffprobe. Returns null on failure.
 * @param {string} filePath
 * @returns {number|null}
 */
function getAudioDuration(filePath) {
	try {
		const result = execSync(
			`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filePath}" 2>/dev/null`,
			{ encoding: 'utf-8', timeout: 5000 }
		).trim();
		const n = parseFloat(result);
		return isNaN(n) ? null : Math.round(n * 10) / 10;
	} catch {
		return null;
	}
}

function formatTimestamp(date) {
	return date.toLocaleString('en-US', {
		month: 'short', day: 'numeric', year: 'numeric',
		hour: 'numeric', minute: '2-digit', hour12: true
	});
}

/**
 * Convert audio -> WAV -> transcribe -> append transcript event (background).
 * @param {string} audioPath
 * @param {string} title
 * @param {number} sizeBytes — original upload size, captured before ffmpeg deletes the file
 */
function transcribeInBackground(audioPath, title, sizeBytes) {
	const id = randomBytes(4).toString('hex');
	const wavPath = join(TEMP_DIR, `transcript-${id}.wav`);

	// Capture duration before ffmpeg (probes the original container).
	const durationSec = getAudioDuration(audioPath);

	vlog(`[voice-transcript] Received audio: ${audioPath}`);
	vlog('[voice-transcript] Converting to WAV...');

	exec(`ffmpeg -i "${audioPath}" -ar 16000 -ac 1 -y "${wavPath}" 2>/dev/null`, {
		timeout: 120_000
	}, async (convertErr) => {
		try { unlinkSync(audioPath); } catch {}

		if (convertErr) {
			vlog(`[voice-transcript] ERROR: ffmpeg conversion failed: ${convertErr.message}`);
			try { unlinkSync(wavPath); } catch {}
			return;
		}

		vlog('[voice-transcript] Transcribing with voxtype...');
		let text;
		try {
			text = await transcribe(wavPath);
		} catch (transcribeErr) {
			vlog(`[voice-transcript] ERROR: ${transcribeErr.message}`);
			try { unlinkSync(wavPath); } catch {}
			return;
		}

		try { unlinkSync(wavPath); } catch {}

		try {
			appendTranscriptToVoiceTimeline(text, title, { durationSec, sizeBytes, source: 'audio' });
			vlog(`[voice-transcript] Done — transcript (${text.length} chars, ${durationSec ?? '?'}s) added to voice inbox as "${title}"`);
		} catch (e) {
			vlog(`[voice-transcript] ERROR: failed to append transcript: ${e.message}`);
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

			const title = body.title?.trim() || `Transcript ${formatTimestamp(new Date())}`;

			appendTranscriptToVoiceTimeline(text, title);
			vlog(`[voice-transcript] Appended text transcript "${title}" (${text.length} chars)`);

			return json({
				success: true,
				message: 'Transcript added to voice inbox.',
				title
			}, { status: 200, headers: CORS_HEADERS });
		}

		// Audio file path — save and process async
		mkdirSync(TEMP_DIR, { recursive: true });

		let title = '';
		let audioTempPath = '';
		let originalFilename = '';

		if (contentType.includes('multipart/form-data')) {
			const formData = await request.formData();
			const file = formData.get('file') || formData.get('audio');
			title = /** @type {string} */ (formData.get('title'))?.trim() || '';

			if (!file || !(file instanceof File)) {
				return json({ error: true, message: 'Missing audio file' }, { status: 400, headers: CORS_HEADERS });
			}

			originalFilename = file.name || '';
			const ext = originalFilename.split('.').pop() || 'm4a';
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

		// Derive title from filename if provided, otherwise from audio creation date.
		if (!title) {
			if (originalFilename) {
				title = originalFilename.replace(/\.[^.]+$/, '');
			} else {
				title = `Transcript ${formatTimestamp(getAudioDate(audioTempPath))}`;
			}
		}

		let sizeBytes = 0;
		try {
			sizeBytes = statSync(audioTempPath).size;
			vlog(`[voice-transcript] Audio received: "${title}" (${(sizeBytes/1024).toFixed(0)}KB) — queuing transcription`);
		} catch {
			vlog(`[voice-transcript] Audio received: "${title}" — queuing transcription`);
		}

		transcribeInBackground(audioTempPath, title, sizeBytes);

		return json({
			success: true,
			message: 'Recording received — transcribing in background. Transcript will appear shortly.',
			title
		}, { status: 202, headers: CORS_HEADERS });
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Failed to process request';
		console.error('[voice-transcript] Error:', message);
		return json({ error: true, message }, { status: 500, headers: CORS_HEADERS });
	}
}
