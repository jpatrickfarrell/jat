/**
 * Voice-to-Task API Route
 * Accepts either:
 *   1. JSON: { "text": "transcribed text" }  — pre-transcribed, creates task immediately
 *   2. Audio file (multipart/form-data or raw body) — saved to disk, transcribed async via voxtype
 *
 * Audio uploads return immediately (202 Accepted). Transcription + task creation happens
 * in the background. The task appears in the IDE when transcription completes.
 *
 * POST /api/tasks/voice
 * GET  /api/tasks/voice?id=<jobId> — poll transcription status (for jat-feedback widget)
 * OPTIONS /api/tasks/voice - CORS preflight (for jat-feedback widget cross-origin usage)
 * Optional JSON fields: { "title": "...", "project": "...", "priority": 2 }
 */
import { json } from '@sveltejs/kit';
import { createTask } from '$lib/server/jat-tasks.js';
import { invalidateCache } from '$lib/server/cache.js';
import { _resetTaskCache } from '../../../api/agents/+server.js';
import { emitEvent } from '$lib/utils/eventBus.server.js';
import { writeFileSync, unlinkSync, mkdirSync, statSync } from 'fs';
import { exec, execSync } from 'child_process';
import { randomBytes, randomUUID } from 'crypto';
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
import { buildTaskIdentity } from '$lib/server/task-identity.js';

/**
 * In-memory job status map for voice transcription polling.
 * Used by the jat-feedback widget to poll transcription status.
 * Keys: UUID job IDs. Values: { status: 'transcribing'|'open'|'error', tasks?: {title: string, description: string}[], title?: string }
 * @type {Map<string, { status: string, tasks?: {title: string, description: string}[], title?: string }>}
 */
const voiceJobs = new Map();

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Max-Age': '86400'
};

/**
 * OPTIONS /api/tasks/voice - CORS preflight
 */
export async function OPTIONS() {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * GET /api/tasks/voice?id=<jobId>
 * Poll transcription status for the jat-feedback widget.
 * Returns task-like status so the widget knows when to stop polling.
 */
export async function GET({ url }) {
	const id = url.searchParams.get('id');
	if (!id) {
		return json({ error: true, message: 'Missing id parameter' }, { status: 400, headers: CORS_HEADERS });
	}
	const job = voiceJobs.get(id);
	if (!job) {
		// Unknown ID — return open so the widget stops polling
		return json({ id, status: 'open' }, { headers: CORS_HEADERS });
	}
	return json({ id, status: job.status, tasks: job.tasks || [], title: job.title, description: job.tasks?.[0]?.description || '' }, { headers: CORS_HEADERS });
}

/**
 * PATCH /api/tasks/voice?id=<jobId>
 * Create a JAT task from the user-confirmed voice note submission.
 * Body: { title: string, description: string, status: 'submitted' }
 * Called once per submitted task from the jat-feedback widget review UI.
 */
export async function PATCH({ url, request }) {
	const id = url.searchParams.get('id');
	if (id && voiceJobs.has(id)) {
		const job = voiceJobs.get(id);
		voiceJobs.set(id, { ...job, status: 'submitted' });
	}

	let title = '';
	let description = '';
	let widgetRequester = null;
	try {
		const body = await request.json();
		title = (body.title || '').trim();
		description = (body.description || '').trim();
		if (body.requester && typeof body.requester === 'string') widgetRequester = body.requester.trim();
	} catch {
		// Ignore body parse errors — still mark submitted
	}

	if (title) {
		try {
			const projectPath = process.cwd().replace(/\/ide$/, '');
			const identity = buildTaskIdentity({
				source: 'voice',
				email: widgetRequester?.includes('@') ? widgetRequester : undefined,
				name: !widgetRequester?.includes('@') ? widgetRequester : undefined,
			});
			const createdTask = await createTask({
				projectPath,
				title,
				description,
				type: 'task',
				priority: 2,
				labels: ['voice'],
				deps: [],
				assignee: null,
				requester: identity.creator.email || identity.creator.name || null,
				notes: '',
				source: 'voice'
			});
			invalidateCache.tasks();
			invalidateCache.agents();
			_resetTaskCache();
			emitEvent({
				type: 'task_created',
				source: 'voice_widget',
				data: { taskId: createdTask.id, title, type: 'task', priority: 2, labels: ['voice'] }
			});
			vlog(`Voice task created: ${createdTask.id} "${title}"`);
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			vlog(`ERROR: Failed to create voice task "${title}": ${message}`);
			return json({ error: true, message }, { status: 500, headers: CORS_HEADERS });
		}
	}

	return json({ ok: true }, { headers: CORS_HEADERS });
}

/**
 * Extract creation date from audio file metadata via ffprobe.
 * Falls back to file mtime, then current time.
 * @param {string} filePath
 * @returns {Date}
 */
function getAudioDate(filePath) {
	try {
		// ffprobe reads creation_time from m4a/mp4 container metadata
		const result = execSync(
			`ffprobe -v quiet -show_entries format_tags=creation_time -of csv=p=0 "${filePath}" 2>/dev/null`,
			{ encoding: 'utf-8', timeout: 5000 }
		).trim();
		if (result) {
			const d = new Date(result);
			if (!isNaN(d.getTime())) return d;
		}
	} catch {}

	// Fallback: file modification time
	try {
		return statSync(filePath).mtime;
	} catch {}

	return new Date();
}

/**
 * Transcribe audio file and organize into suggested tasks (runs in background).
 * Resolves with { tasks, title } so the caller can update voiceJobs for widget polling.
 * @param {string} audioPath
 * @param {string} title
 * @param {number} priority
 * @param {string|null} requester
 * @param {string|null} voiceId
 * @param {Date|null} recordingDate — recording timestamp threaded into voice memory files
 * @returns {Promise<{ tasks: {title: string, description: string}[], title: string }>}
 */
function transcribeAndOrganize(audioPath, title, priority, requester, voiceId = null, recordingDate = null) {
	return new Promise((resolve) => {
		const id = randomBytes(4).toString('hex');
		const wavPath = join(TEMP_DIR, `transcribe-${id}.wav`);

		vlog(`Received audio: ${audioPath}`);

		// Step 1: Convert to 16kHz mono WAV
		vlog('Converting to WAV...');
		exec(`ffmpeg -i "${audioPath}" -ar 16000 -ac 1 -y "${wavPath}" 2>/dev/null`, {
			timeout: 120_000
		}, async (convertErr) => {
			// Clean up original audio file
			try { unlinkSync(audioPath); } catch {}

			if (convertErr) {
				vlog(`ERROR: ffmpeg conversion failed: ${convertErr.message}`);
				try { unlinkSync(wavPath); } catch {}
				if (voiceId) appendFailedToVoiceTimeline(voiceId, title, `Audio conversion failed: ${convertErr.message}`);
				resolve({ tasks: [{ title, description: '' }], title });
				return;
			}

			// Step 2: Transcribe with voxtype
			vlog('Transcribing with voxtype...');
			let text;
			try {
				text = await transcribe(wavPath);
			} catch (transcribeErr) {
				vlog(`ERROR: ${transcribeErr.message}`);
				try { unlinkSync(wavPath); } catch {}
				if (voiceId) appendFailedToVoiceTimeline(voiceId, title, transcribeErr.message);
				resolve({ tasks: [{ title, description: '' }], title });
				return;
			}

			// Clean up wav
			try { unlinkSync(wavPath); } catch {}

			vlog(`Transcription complete (${text.length} chars). Organizing with ollama...`);
			if (voiceId) appendProcessingToVoiceTimeline(voiceId, title, 0, 'generating');

			// Step 3: Organize transcript into structured tasks via ollama
			try {
				const projects = loadProjects();
				const jatContext = await loadJatContext(projects);
				const { tasks, summary, title: organizedTitle, knowledgeBase } = await organizeTranscript(text, projects, 'organize', jatContext);
				appendToVoiceTimeline(tasks, text, summary, organizedTitle, knowledgeBase, null, voiceId, recordingDate);
				vlog(`Done — ${tasks.length} task(s) added to voice inbox`);
				resolve({
					tasks: tasks.length > 0
						? tasks.map(t => ({ title: String(t.title || ''), description: String(t.description || '') }))
						: [{ title: organizedTitle || title, description: summary || text }],
					title: tasks[0]?.title || organizedTitle || title
				});
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
						voiceId,
						recordingDate
					);
					vlog(`Fallback: transcript "${title}" saved to voice inbox (${text.length} chars)`);
				} catch (e) {
					vlog(`ERROR: Timeline fallback also failed: ${e.message}`);
					if (voiceId) appendFailedToVoiceTimeline(voiceId, title, `Organize failed: ${organizeErr.message}`);
				}
				resolve({ tasks: [{ title, description: text || '' }], title });
			}
		});
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
			const postRequester = body.requester && typeof body.requester === 'string' ? body.requester.trim() : null;

			if (!text) {
				return json({ error: true, message: 'Missing "text" field' }, { status: 400, headers: CORS_HEADERS });
			}

			// Organize in background, don't block the response
			const projects = loadProjects();
			loadJatContext(projects)
				.then(jatContext => organizeTranscript(text, projects, 'organize', jatContext))
				.then(({ tasks, summary, title, knowledgeBase }) => {
				appendToVoiceTimeline(tasks, text, summary, title, knowledgeBase);
				vlog(`Organized ${tasks.length} task(s) from text into voice inbox`);
			}).catch((err) => {
				vlog(`ERROR: organize failed for text input: ${err.message}`);
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
					const textFallbackIdentity = buildTaskIdentity({
						source: 'voice',
						email: postRequester?.includes('@') ? postRequester : undefined,
						name: !postRequester?.includes('@') ? postRequester : undefined,
					});
					const createdTask = await createTask({
						projectPath, title, description: text, type: 'task',
						priority: isNaN(priority) ? 2 : Math.max(0, Math.min(4, priority)),
						labels: ['voice'], deps: [], assignee: null,
						requester: textFallbackIdentity.creator.email || textFallbackIdentity.creator.name || null,
						notes: '',
						source: 'voice'
					});
					invalidateCache.tasks();
					invalidateCache.agents();
					_resetTaskCache();
				} catch (e) {
					console.error('[voice] Fallback task creation failed:', e);
				}
			});

			const jobId = randomUUID();
			voiceJobs.set(jobId, { status: 'transcribing' });
			// Mark complete after a short delay (text is already organized above)
			setTimeout(() => { voiceJobs.set(jobId, { status: 'open' }); }, 2000);

			return json({
				ok: true,
				id: jobId,
				success: true,
				message: 'Voice note received — organizing in background. Tasks will appear in Voice Inbox shortly.'
			}, { status: 202, headers: CORS_HEADERS });

		} else {
			// Audio file — save and process async
			mkdirSync(TEMP_DIR, { recursive: true });

			let title = '';
			let priority = 2;
			let audioTempPath = '';
			let postRequester = null;

			if (contentType.includes('multipart/form-data')) {
				const formData = await request.formData();
				const file = formData.get('file') || formData.get('audio');
				title = /** @type {string} */ (formData.get('title'))?.trim() || '';
				const priorityStr = /** @type {string} */ (formData.get('priority'));
				priority = priorityStr ? parseInt(priorityStr) : 2;
				const requesterField = formData.get('requester');
				if (requesterField && typeof requesterField === 'string') postRequester = requesterField.trim() || null;

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
			try { sizeBytes = statSync(audioTempPath).size; vlog(`Audio received: "${title}" (${(sizeBytes/1024).toFixed(0)}KB) — queuing transcription`); } catch { vlog(`Audio received: "${title}" — queuing transcription`); }

			// Create a job ID for the widget to poll status
			const jobId = randomUUID();
			voiceJobs.set(jobId, { status: 'transcribing', title });

			// Write processing stub immediately so VoiceInbox shows a spinner
			const voiceId = randomBytes(8).toString('hex');
			appendProcessingToVoiceTimeline(voiceId, title, sizeBytes);

			// Fire and forget — transcription + organize happens in background
			// Update voiceJobs with all tasks for widget review form
			transcribeAndOrganize(audioTempPath, title, priority, postRequester, voiceId, fileDate).then((result) => {
				voiceJobs.set(jobId, { status: 'open', tasks: result.tasks, title: result.tasks[0]?.title || title });
			}).catch(() => {
				voiceJobs.set(jobId, { status: 'open', tasks: [{ title, description: '' }], title });
			});

			return json({
				ok: true,
				id: jobId,
				voice_id: voiceId,
				success: true,
				message: 'Recording received — transcribing in background. Task will appear shortly.'
			}, { status: 202, headers: CORS_HEADERS });
		}
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Failed to process request';
		console.error('[voice] Error:', message);
		return json({ error: true, message }, { status: 500, headers: CORS_HEADERS });
	}
}
