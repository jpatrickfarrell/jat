/**
 * Voice-to-Task API Route (Diarized)
 *
 * Same as /api/tasks/voice except transcription runs through whisperx with
 * speaker diarization enabled. Multi-speaker transcripts get [SPEAKER_XX]:
 * labels which organizeTranscript() then uses to attribute tasks and produce
 * a speakers map.
 *
 * Accepts either:
 *   1. JSON: { "text": "transcribed text" }  — pre-transcribed, organized immediately
 *   2. Audio file (multipart/form-data or raw body) — saved to disk, transcribed
 *      asynchronously via whisperx --diarize
 *
 * Audio uploads return immediately (202 Accepted). Transcription + task creation
 * happens in the background. Results appear in the same VoiceInbox as /voice.
 *
 * POST /api/tasks/voice-diarize
 * OPTIONS /api/tasks/voice-diarize - CORS preflight
 * Optional JSON fields: { "title": "...", "project": "...", "priority": 2 }
 */
import { json } from '@sveltejs/kit';
import { writeFileSync, unlinkSync, mkdirSync, statSync } from 'fs';
import { exec, execSync } from 'child_process';
import { randomBytes } from 'crypto';
import { join } from 'path';
import {
	TEMP_DIR,
	vlog,
	loadProjects,
	loadJatContext,
	transcribe,
	organizeTranscript,
	appendToVoiceTimeline,
	appendProcessingToVoiceTimeline,
	appendFailedToVoiceTimeline
} from '$lib/server/voice-core.js';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Max-Age': '86400'
};

/**
 * OPTIONS /api/tasks/voice-diarize - CORS preflight
 */
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
 * Duration of an audio file in seconds via ffprobe. Returns null on failure.
 * @param {string} filePath
 * @returns {number|null}
 */
function getAudioDurationSec(filePath) {
	try {
		const result = execSync(
			`ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filePath}" 2>/dev/null`,
			{ encoding: 'utf-8', timeout: 5000 }
		).trim();
		const n = parseFloat(result);
		return isNaN(n) ? null : n;
	} catch {
		return null;
	}
}

/**
 * Calculate a dynamic whisperx timeout based on audio duration.
 * Uses 3x the audio length as the budget, with a 10-minute floor and
 * 12-hour ceiling. Accounts for ffmpeg conversion + transcription + diarization.
 * @param {number|null} durationSec
 * @returns {number} timeout in milliseconds
 */
function whisperxTimeout(durationSec) {
	const MULTIPLIER = 3;
	const FLOOR_MS = 10 * 60 * 1000;       // 10 minutes minimum
	const CEILING_MS = 12 * 60 * 60 * 1000; // 12 hours maximum
	if (!durationSec) return 60 * 60 * 1000; // 1hr fallback if ffprobe fails
	const budget = Math.round(durationSec * 1000 * MULTIPLIER);
	return Math.min(CEILING_MS, Math.max(FLOOR_MS, budget));
}

/**
 * Transcribe audio file with diarization and organize into suggested tasks
 * (runs in background).
 * @param {string} audioPath
 * @param {string} title
 * @param {number} priority
 */
function transcribeAndOrganize(audioPath, title, priority, voiceId, sizeBytes = 0) {
	const id = randomBytes(4).toString('hex');
	const wavPath = join(TEMP_DIR, `transcribe-${id}.wav`);

	// Measure duration before ffmpeg deletes the original file
	const durationSec = getAudioDurationSec(audioPath);
	const timeout = whisperxTimeout(durationSec);
	vlog(`Received audio (diarize): ${audioPath}${durationSec ? ` — ${Math.round(durationSec)}s audio, ${Math.round(timeout/60000)}min timeout` : ''}`);

	// Step 1: Convert to 16kHz mono WAV
	vlog('Converting to WAV...');
	exec(`ffmpeg -i "${audioPath}" -ar 16000 -ac 1 -y "${wavPath}" 2>/dev/null`, {
		timeout: 120_000
	}, async (convertErr) => {
		try { unlinkSync(audioPath); } catch {}

		if (convertErr) {
			vlog(`ERROR: ffmpeg conversion failed: ${convertErr.message}`);
			try { unlinkSync(wavPath); } catch {}
			appendFailedToVoiceTimeline(voiceId, title, `Audio conversion failed: ${convertErr.message}`);
			return;
		}

		// Step 2: Transcribe with whisperx --diarize (falls back to voxtype on failure)
		vlog('Transcribing with whisperx (diarize)...');
		let text;
		try {
			text = await transcribe(wavPath, { diarize: true, timeout });
		} catch (transcribeErr) {
			vlog(`ERROR: ${transcribeErr.message}`);
			try { unlinkSync(wavPath); } catch {}
			appendFailedToVoiceTimeline(voiceId, title, transcribeErr.message);
			return;
		}

		try { unlinkSync(wavPath); } catch {}

		vlog(`Transcription complete (${text.length} chars). Organizing with ollama...`);
		appendProcessingToVoiceTimeline(voiceId, title, 0, 'generating');

		// Step 3: Organize transcript into structured tasks via ollama
		try {
			const projects = loadProjects();
			const jatContext = await loadJatContext(projects);
			const { tasks, summary, title: organizedTitle, knowledgeBase } = await organizeTranscript(text, projects, 'organize', jatContext);
			appendToVoiceTimeline(tasks, text, summary, organizedTitle, knowledgeBase, null, voiceId);
			vlog(`Done — ${tasks.length} task(s) added to voice inbox`);
		} catch (organizeErr) {
			vlog(`ERROR: organize failed, saving transcript to voice inbox: ${organizeErr.message}`);

			// Fallback: save transcript directly to voice timeline so it appears in voice inbox.
			// Do NOT call SQLite createTask() here — the project may be postgres-backed.
			try {
				appendToVoiceTimeline(
					[{ title, description: text }],
					text,
					'',
					title,
					[],
					null,
					voiceId
				);
				vlog(`Fallback: transcript "${title}" saved to voice inbox (${text.length} chars)`);
			} catch (e) {
				vlog(`ERROR: Timeline fallback also failed: ${e.message}`);
				appendFailedToVoiceTimeline(voiceId, title, `Organize failed: ${organizeErr.message}`);
			}
		}
	});
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const contentType = request.headers.get('content-type') || '';

	try {
		if (contentType.includes('application/json')) {
			// JSON body — pre-transcribed text, organize async and add to voice inbox
			const body = await request.json();
			const text = body.text?.trim();

			if (!text) {
				return json({ error: true, message: 'Missing "text" field' }, { status: 400, headers: CORS_HEADERS });
			}

			const projects = loadProjects();
			const fallbackTitle = body.title?.trim() || `Voice note ${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}`;
			loadJatContext(projects)
				.then(jatContext => organizeTranscript(text, projects, 'organize', jatContext))
				.then(({ tasks, summary, title, knowledgeBase }) => {
				appendToVoiceTimeline(tasks, text, summary, title, knowledgeBase);
				vlog(`[voice-diarize] Organized ${tasks.length} task(s) from text into voice inbox`);
			}).catch((err) => {
				vlog(`[voice-diarize] organize failed for text input, saving to timeline: ${err.message}`);
				try {
					appendToVoiceTimeline([{ title: fallbackTitle, description: text }], text, '', fallbackTitle, []);
					vlog(`[voice-diarize] Fallback: transcript "${fallbackTitle}" saved to voice inbox`);
				} catch (e) {
					vlog(`[voice-diarize] ERROR: Timeline fallback also failed: ${e.message}`);
				}
			});

			return json({
				success: true,
				message: 'Voice note received — organizing in background. Tasks will appear in Voice Inbox shortly.'
			}, { status: 202, headers: CORS_HEADERS });

		} else {
			// Audio file — save and process async
			mkdirSync(TEMP_DIR, { recursive: true });

			let title = '';
			let priority = 2;
			let audioTempPath = '';

			if (contentType.includes('multipart/form-data')) {
				const formData = await request.formData();
				const file = formData.get('file') || formData.get('audio');
				title = /** @type {string} */ (formData.get('title'))?.trim() || '';
				const priorityStr = /** @type {string} */ (formData.get('priority'));
				priority = priorityStr ? parseInt(priorityStr) : 2;

				if (!file || !(file instanceof File)) {
					return json({ error: true, message: 'Missing audio file' }, { status: 400, headers: CORS_HEADERS });
				}

				const ext = file.name?.split('.').pop() || 'm4a';
				audioTempPath = join(TEMP_DIR, `${randomBytes(8).toString('hex')}.${ext}`);
				writeFileSync(audioTempPath, Buffer.from(await file.arrayBuffer()));

			} else {
				// Raw audio body
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

			// Extract recording date from audio file metadata (not current time)
			const fileDate = getAudioDate(audioTempPath);
			const timestamp = fileDate.toLocaleString('en-US', {
				month: 'short', day: 'numeric', year: 'numeric',
				hour: 'numeric', minute: '2-digit', hour12: true
			});
			if (!title) title = `Voice note ${timestamp}`;

			let sizeBytes = 0;
			try { sizeBytes = statSync(audioTempPath).size; vlog(`Audio received (diarize): "${title}" (${(sizeBytes/1024).toFixed(0)}KB) — queuing transcription`); } catch { vlog(`Audio received (diarize): "${title}" — queuing transcription`); }

			// Write processing stub immediately so VoiceInbox shows a spinner
			const voiceId = randomBytes(8).toString('hex');
			appendProcessingToVoiceTimeline(voiceId, title, sizeBytes);

			// Fire and forget — transcription + organize happens in background
			transcribeAndOrganize(audioTempPath, title, priority, voiceId, sizeBytes);

			return json({
				success: true,
				voice_id: voiceId,
				message: 'Recording received — transcribing with speaker identification. This may take several minutes for long recordings.'
			}, { status: 202, headers: CORS_HEADERS });
		}
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Failed to process request';
		console.error('[voice-diarize] Error:', message);
		return json({ error: true, message }, { status: 500, headers: CORS_HEADERS });
	}
}
