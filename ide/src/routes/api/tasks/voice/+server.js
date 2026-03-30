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

const TEMP_DIR = '/tmp/jat-voice';

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
 * Transcribe audio file and create task (runs in background).
 * @param {string} audioPath
 * @param {string} title
 * @param {number} priority
 */
function transcribeAndCreateTask(audioPath, title, priority) {
	const id = randomBytes(4).toString('hex');
	const wavPath = join(TEMP_DIR, `transcribe-${id}.wav`);

	// Step 1: Convert to 16kHz mono WAV
	exec(`ffmpeg -i "${audioPath}" -ar 16000 -ac 1 -y "${wavPath}" 2>/dev/null`, {
		timeout: 120_000
	}, (convertErr) => {
		// Clean up original audio file
		try { unlinkSync(audioPath); } catch {}

		if (convertErr) {
			console.error('[voice] ffmpeg conversion failed:', convertErr.message);
			try { unlinkSync(wavPath); } catch {}
			return;
		}

		// Step 2: Transcribe with voxtype
		exec(`voxtype transcribe "${wavPath}" 2>/dev/null`, {
			timeout: 600_000,
			encoding: 'utf-8',
			maxBuffer: 10 * 1024 * 1024
		}, (transcribeErr, stdout) => {
			// Clean up wav
			try { unlinkSync(wavPath); } catch {}

			if (transcribeErr) {
				console.error('[voice] voxtype transcription failed:', transcribeErr.message);
				return;
			}

			// Strip ANSI codes and voxtype log lines
			const lines = stdout.split('\n')
				.map(l => l.replace(/\x1b\[[0-9;]*m/g, '').trim())
				.filter(l => l && !l.startsWith('Loading audio') && !l.startsWith('Audio format:')
					&& !l.startsWith('Processing ') && !l.match(/^\d{4}-\d{2}-\d{2}T/));

			const text = lines.join('\n').trim();
			if (!text) {
				console.error('[voice] Transcription produced no output');
				return;
			}

			// Step 3: Create the task
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
					source: 'voice_api',
					data: {
						taskId: createdTask.id,
						title,
						type: 'task',
						priority,
						labels: ['voice']
					}
				});

				console.log(`[voice] Task ${createdTask.id} created: "${title}"`);
			} catch (e) {
				console.error('[voice] Failed to create task:', e);
			}
		});
	});
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const contentType = request.headers.get('content-type') || '';

	try {
		if (contentType.includes('application/json')) {
			// JSON body — synchronous, create task immediately
			const body = await request.json();
			const text = body.text?.trim();

			if (!text) {
				return json({ error: true, message: 'Missing "text" field' }, { status: 400 });
			}

			const now = new Date();
			const timestamp = now.toLocaleString('en-US', {
				month: 'short', day: 'numeric', year: 'numeric',
				hour: 'numeric', minute: '2-digit', hour12: true
			});
			const title = body.title?.trim() || `Voice note ${timestamp}`;
			const priority = body.priority !== undefined ? parseInt(body.priority) : 2;
			const projectPath = process.cwd().replace(/\/ide$/, '');

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

			try {
				emitEvent({
					type: 'task_created',
					source: 'voice_api',
					data: { taskId: createdTask.id, title, type: 'task', priority, labels: ['voice'] }
				});
			} catch {}

			return json({
				success: true,
				task: createdTask,
				message: `Task ${createdTask.id} created from voice note`
			}, { status: 201 });

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
					return json({ error: true, message: 'Missing audio file' }, { status: 400 });
				}

				const ext = file.name?.split('.').pop() || 'm4a';
				audioTempPath = join(TEMP_DIR, `${randomBytes(8).toString('hex')}.${ext}`);
				writeFileSync(audioTempPath, Buffer.from(await file.arrayBuffer()));

			} else {
				// Raw audio body
				const buffer = Buffer.from(await request.arrayBuffer());
				if (buffer.length === 0) {
					return json({ error: true, message: 'Empty request body' }, { status: 400 });
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

			// Fire and forget — transcription happens in background
			transcribeAndCreateTask(audioTempPath, title, priority);

			return json({
				success: true,
				message: 'Recording received — transcribing in background. Task will appear shortly.'
			}, { status: 202 });
		}
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Failed to process request';
		console.error('[voice] Error:', message);
		return json({ error: true, message }, { status: 500 });
	}
}
