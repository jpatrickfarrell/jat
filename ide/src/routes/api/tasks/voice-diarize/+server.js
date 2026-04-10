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
import { createTask } from '$lib/server/jat-tasks.js';
import { invalidateCache } from '$lib/server/cache.js';
import { _resetTaskCache } from '../../../api/agents/+server.js';
import { emitEvent } from '$lib/utils/eventBus.server.js';
import { writeFileSync, unlinkSync, mkdirSync, statSync } from 'fs';
import { exec, execSync } from 'child_process';
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
 * Transcribe audio file with diarization and organize into suggested tasks
 * (runs in background).
 * @param {string} audioPath
 * @param {string} title
 * @param {number} priority
 */
function transcribeAndOrganize(audioPath, title, priority) {
	const id = randomBytes(4).toString('hex');
	const wavPath = join(TEMP_DIR, `transcribe-${id}.wav`);

	vlog(`Received audio (diarize): ${audioPath}`);

	// Step 1: Convert to 16kHz mono WAV
	vlog('Converting to WAV...');
	exec(`ffmpeg -i "${audioPath}" -ar 16000 -ac 1 -y "${wavPath}" 2>/dev/null`, {
		timeout: 120_000
	}, async (convertErr) => {
		try { unlinkSync(audioPath); } catch {}

		if (convertErr) {
			vlog(`ERROR: ffmpeg conversion failed: ${convertErr.message}`);
			try { unlinkSync(wavPath); } catch {}
			return;
		}

		// Step 2: Transcribe with whisperx --diarize (falls back to voxtype on failure)
		vlog('Transcribing with whisperx (diarize)...');
		let text;
		try {
			text = await transcribe(wavPath, { diarize: true });
		} catch (transcribeErr) {
			vlog(`ERROR: ${transcribeErr.message}`);
			try { unlinkSync(wavPath); } catch {}
			return;
		}

		try { unlinkSync(wavPath); } catch {}

		vlog(`Transcription complete (${text.length} chars). Organizing with ollama...`);

		// Step 3: Organize transcript into structured tasks via ollama
		try {
			const projects = loadProjects();
			const { tasks, summary, title: organizedTitle, knowledgeBase } = await organizeTranscript(text, projects);
			appendToVoiceTimeline(tasks, text, summary, organizedTitle, knowledgeBase);
			vlog(`Done — ${tasks.length} task(s) added to voice inbox`);
		} catch (organizeErr) {
			vlog(`ERROR: organize failed, falling back to single task: ${organizeErr.message}`);

			// Fallback: create a single task from the transcript directly
			const projectPath = process.cwd().replace(/\/ide$/, '');
			try {
				const createdTask = createTask({
					projectPath,
					title,
					description: text,
					type: 'task',
					priority: isNaN(priority) ? 2 : Math.max(0, Math.min(4, priority)),
					labels: ['voice'],
					deps: [],
					assignee: null,
					notes: ''
				});
				invalidateCache.tasks();
				invalidateCache.agents();
				_resetTaskCache();
				emitEvent({
					type: 'task_created',
					source: 'voice_diarize_api',
					data: { taskId: createdTask.id, title, type: 'task', priority, labels: ['voice'] }
				});
				vlog(`Fallback: task ${createdTask.id} created: "${title}"`);
			} catch (e) {
				vlog(`ERROR: Fallback task creation also failed: ${e.message}`);
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
			organizeTranscript(text, projects).then(({ tasks, summary, title, knowledgeBase }) => {
				appendToVoiceTimeline(tasks, text, summary, title, knowledgeBase);
				console.log(`[voice-diarize] Organized ${tasks.length} task(s) from text into voice inbox`);
			}).catch((err) => {
				console.error('[voice-diarize] organize failed for text input:', err.message);
				// Fallback: single task
				const now = new Date();
				const timestamp = now.toLocaleString('en-US', {
					month: 'short', day: 'numeric', year: 'numeric',
					hour: 'numeric', minute: '2-digit', hour12: true
				});
				const title = body.title?.trim() || `Voice note ${timestamp}`;
				const priority = body.priority !== undefined ? parseInt(body.priority) : 2;
				const projectPath = process.cwd().replace(/\/ide$/, '');
				try {
					createTask({
						projectPath, title, description: text, type: 'task',
						priority: isNaN(priority) ? 2 : Math.max(0, Math.min(4, priority)),
						labels: ['voice'], deps: [], assignee: null, notes: ''
					});
					invalidateCache.tasks();
					invalidateCache.agents();
					_resetTaskCache();
				} catch (e) {
					console.error('[voice-diarize] Fallback task creation failed:', e);
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

			try { const sz = statSync(audioTempPath).size; vlog(`Audio received (diarize): "${title}" (${(sz/1024).toFixed(0)}KB) — queuing transcription`); } catch { vlog(`Audio received (diarize): "${title}" — queuing transcription`); }

			// Fire and forget — transcription + organize happens in background
			transcribeAndOrganize(audioTempPath, title, priority);

			return json({
				success: true,
				message: 'Recording received — transcribing with speaker identification. This may take several minutes for long recordings.'
			}, { status: 202, headers: CORS_HEADERS });
		}
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Failed to process request';
		console.error('[voice-diarize] Error:', message);
		return json({ error: true, message }, { status: 500, headers: CORS_HEADERS });
	}
}
