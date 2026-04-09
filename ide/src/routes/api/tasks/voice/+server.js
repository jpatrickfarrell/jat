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
 * OPTIONS /api/tasks/voice - CORS preflight (for jat-feedback widget cross-origin usage)
 * Optional JSON fields: { "title": "...", "project": "...", "priority": 2 }
 */
import { json } from '@sveltejs/kit';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Max-Age': '86400'
};

/**
 * OPTIONS /api/tasks/voice - CORS preflight
 */
export async function OPTIONS() {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}
import { createTask } from '$lib/server/jat-tasks.js';
import { invalidateCache } from '$lib/server/cache.js';
import { _resetTaskCache } from '../../../api/agents/+server.js';
import { emitEvent } from '$lib/utils/eventBus.server.js';
import { writeFileSync, unlinkSync, mkdirSync, statSync, appendFileSync, readFileSync, existsSync } from 'fs';
import { exec, execSync } from 'child_process';
import { randomBytes } from 'crypto';
import { join } from 'path';
import { homedir } from 'os';

const TEMP_DIR = '/tmp/jat-voice';
const VOICE_LOG_FILE = '/tmp/jat-voice.log';

function vlog(msg) {
	const line = `[${new Date().toISOString()}] ${msg}\n`;
	try { appendFileSync(VOICE_LOG_FILE, line); } catch {}
	console.log('[voice]', msg);
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

const VOICE_TIMELINE_FILE = '/tmp/jat-timeline-jat-voice.jsonl';

/**
 * Load project names and descriptions from ~/.config/jat/projects.json.
 * Returns an array of { name, description } for projects that have descriptions.
 * @returns {Array<{name: string, description: string}>}
 */
function loadProjects() {
	try {
		const configPath = join(homedir(), '.config', 'jat', 'projects.json');
		if (!existsSync(configPath)) return [];
		const config = JSON.parse(readFileSync(configPath, 'utf-8'));
		return Object.entries(config.projects || {})
			.filter(([, p]) => p.description && !p.hidden)
			.map(([name, p]) => ({ name, description: p.description }));
	} catch {
		return [];
	}
}

/**
 * Call local ollama to organize a transcript into structured tasks (JSON).
 * Returns an array of SuggestedTask objects.
 * @param {string} transcript
 * @param {Array<{name: string, description: string}>} projects
 * @returns {Promise<Array>}
 */
async function organizeTranscript(transcript, projects = []) {
	const projectSection = projects.length > 0
		? `Available projects (assign each task to the most relevant one based on context):
${projects.map(p => `- ${p.name}: ${p.description}`).join('\n')}

If a task doesn't clearly belong to any project, omit the "project" field.`
		: '';

	const prompt = `You are a note organizer. Given a voice note transcript, produce four things:

1. TITLE: A short descriptive title for this voice note (max 8 words, captures the main theme, e.g. "Morning walk: billing and Steel Bridge pricing")

2. SUMMARY: Detailed organized notes covering EVERYTHING discussed. The speaker rambles and jumps between topics — reorganize into clear grouped sections without losing any detail. Format each topic as its own line: "TOPIC NAME: all details, names, numbers, decisions, context for that topic". Every name, date, number, idea, and decision must appear. Nothing omitted.

3. TASKS: Every actionable item extracted from the transcript. Each task includes a "context" field: the specific topic line from the summary that this task belongs to.

4. KNOWLEDGE BASE: Persistent reference facts worth saving long-term per project — pricing, decisions, requirements, client details, architectural choices. Omit one-off tasks (those go in tasks). One entry per distinct topic/project combination.

Return ONLY valid JSON (no markdown, no explanation):
{
  "title": "Short descriptive title for this voice note",
  "summary": "<your detailed topic-by-topic notes here>",
  "tasks": [
    {
      "type": "task",
      "title": "Short actionable title in imperative form",
      "description": "More context if the transcript provides it",
      "priority": 2,
      "project": "project-name-here",
      "labels": "voice",
      "context": "The specific topic line from the summary relevant to this task"
    }
  ],
  "knowledgeBase": [
    {
      "title": "Short entry title",
      "content": "Detailed reference content worth remembering long-term",
      "project": "project-name-here"
    }
  ]
}

Task types: task, feature, bug, chore
Priority: 0=critical 1=high 2=medium 3=low 4=lowest
Use priority cues ("urgent", "first thing", "must", "deadline" → lower number).
Group related items into one task rather than splitting trivially.
${projectSection}

Transcript:
${transcript}`;

	const response = await fetch('http://localhost:11434/api/generate', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			model: process.env.ORGANIZE_TASKS_MODEL || 'qwen2.5:7b',
			prompt,
			format: 'json',
			stream: true,
			options: { temperature: 0.3, num_predict: 2048 }
		}),
		signal: AbortSignal.timeout(300_000)
	});

	if (!response.ok) {
		throw new Error(`ollama request failed: ${response.status}`);
	}

	// Stream response, logging progress every 200 tokens
	let fullResponse = '';
	let tokenCount = 0;
	let lastLogAt = 0;
	let firstTokenAt = null;
	const ollamaStart = Date.now();
	const reader = response.body.getReader();
	const decoder = new TextDecoder();

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		for (const line of decoder.decode(value).split('\n')) {
			if (!line.trim()) continue;
			try {
				const chunk = JSON.parse(line);
				if (chunk.response) {
					if (!firstTokenAt) {
						firstTokenAt = Date.now();
						vlog(`ollama prefill done in ${((firstTokenAt - ollamaStart) / 1000).toFixed(1)}s — generating...`);
					}
					fullResponse += chunk.response;
					tokenCount++;
					if (tokenCount - lastLogAt >= 200) {
						vlog(`ollama generating... ${tokenCount} tokens`);
						lastLogAt = tokenCount;
					}
				}
			} catch {}
		}
	}

	vlog(`ollama done: ${tokenCount} tokens generated in ${((Date.now() - (firstTokenAt || ollamaStart)) / 1000).toFixed(1)}s`);

	const parsed = JSON.parse(fullResponse);
	const tasks = parsed.tasks;
	const summary = typeof parsed.summary === 'string' ? parsed.summary : '';
	const title = typeof parsed.title === 'string' ? parsed.title : '';
	const knowledgeBase = Array.isArray(parsed.knowledgeBase) ? parsed.knowledgeBase : [];

	if (!Array.isArray(tasks) || tasks.length === 0) {
		throw new Error('ollama returned no tasks');
	}

	return { tasks, summary, title, knowledgeBase };
}

/**
 * Append organized tasks to the voice inbox timeline file.
 * EventStack polls /api/sessions/jat-voice/timeline which reads this file.
 * @param {Array} tasks
 * @param {string} transcript
 * @param {string} summary
 * @param {string} title
 * @param {Array} knowledgeBase
 */
function appendToVoiceTimeline(tasks, transcript = '', summary = '', title = '', knowledgeBase = []) {
	mkdirSync(TEMP_DIR, { recursive: true });
	const event = {
		type: 'tasks',
		session_id: 'voice',
		tmux_session: 'jat-voice',
		timestamp: new Date().toISOString(),
		data: { tasks, transcript, summary, title, knowledgeBase }
	};
	appendFileSync(VOICE_TIMELINE_FILE, JSON.stringify(event) + '\n');
}

/**
 * Transcribe audio file and organize into suggested tasks (runs in background).
 * @param {string} audioPath
 * @param {string} title
 * @param {number} priority
 */
function transcribeAndOrganize(audioPath, title, priority) {
	const id = randomBytes(4).toString('hex');
	const wavPath = join(TEMP_DIR, `transcribe-${id}.wav`);

	vlog(`Received audio: ${audioPath}`);

	// Step 1: Convert to 16kHz mono WAV
	vlog('Converting to WAV...');
	exec(`ffmpeg -i "${audioPath}" -ar 16000 -ac 1 -y "${wavPath}" 2>/dev/null`, {
		timeout: 120_000
	}, (convertErr) => {
		// Clean up original audio file
		try { unlinkSync(audioPath); } catch {}

		if (convertErr) {
			vlog(`ERROR: ffmpeg conversion failed: ${convertErr.message}`);
			try { unlinkSync(wavPath); } catch {}
			return;
		}

		// Step 2: Transcribe with voxtype
		vlog('Transcribing with voxtype...');
		exec(`voxtype transcribe "${wavPath}" 2>/dev/null`, {
			timeout: 600_000,
			encoding: 'utf-8',
			maxBuffer: 10 * 1024 * 1024
		}, async (transcribeErr, stdout) => {
			// Clean up wav
			try { unlinkSync(wavPath); } catch {}

			if (transcribeErr) {
				vlog(`ERROR: voxtype transcription failed: ${transcribeErr.message}`);
				return;
			}

			// Strip ANSI codes and voxtype log lines
			const lines = stdout.split('\n')
				.map(l => l.replace(/\x1b\[[0-9;]*m/g, '').trim())
				.filter(l => l && !l.startsWith('Loading audio') && !l.startsWith('Audio format:')
					&& !l.startsWith('Processing ') && !l.match(/^\d{4}-\d{2}-\d{2}T/));

			const text = lines.join('\n').trim();
			if (!text) {
				vlog('ERROR: Transcription produced no output');
				return;
			}

			vlog(`Transcription complete (${text.length} chars). Organizing with ollama...`);

			// Step 3: Organize transcript into structured tasks via ollama
			try {
				const projects = loadProjects();
				const { tasks, summary, title, knowledgeBase } = await organizeTranscript(text, projects);
				appendToVoiceTimeline(tasks, text, summary, title, knowledgeBase);
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
						source: 'voice_api',
						data: { taskId: createdTask.id, title, type: 'task', priority, labels: ['voice'] }
					});
					vlog(`Fallback: task ${createdTask.id} created: "${title}"`);
				} catch (e) {
					vlog(`ERROR: Fallback task creation also failed: ${e.message}`);
				}
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

			if (!text) {
				return json({ error: true, message: 'Missing "text" field' }, { status: 400, headers: CORS_HEADERS });
			}

			// Organize in background, don't block the response
			const projects = loadProjects();
			organizeTranscript(text, projects).then(({ tasks, summary, title, knowledgeBase }) => {
				appendToVoiceTimeline(tasks, text, summary, title, knowledgeBase);
				console.log(`[voice] Organized ${tasks.length} task(s) from text into voice inbox`);
			}).catch((err) => {
				console.error('[voice] organize failed for text input:', err.message);
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
					const createdTask = createTask({
						projectPath, title, description: text, type: 'task',
						priority: isNaN(priority) ? 2 : Math.max(0, Math.min(4, priority)),
						labels: ['voice'], deps: [], assignee: null, notes: ''
					});
					invalidateCache.tasks();
					invalidateCache.agents();
					_resetTaskCache();
				} catch (e) {
					console.error('[voice] Fallback task creation failed:', e);
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

			try { const sz = statSync(audioTempPath).size; vlog(`Audio received: "${title}" (${(sz/1024).toFixed(0)}KB) — queuing transcription`); } catch { vlog(`Audio received: "${title}" — queuing transcription`); }

			// Fire and forget — transcription + organize happens in background
			transcribeAndOrganize(audioTempPath, title, priority);

			return json({
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
