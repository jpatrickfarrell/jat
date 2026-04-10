/**
 * Voice core — shared functions for voice-to-task processing.
 *
 * Extracted from /api/tasks/voice/+server.js so they can be reused across
 * the upcoming /voice-transcript, /voice-summary, /voice-kb, /voice-launch,
 * and /voice-diarize routes.
 */
import { appendFileSync, mkdirSync, readFileSync, existsSync, mkdtempSync, rmSync } from 'fs';
import { exec } from 'child_process';
import { join, dirname, basename } from 'path';
import { homedir, tmpdir } from 'os';

export const TEMP_DIR = '/tmp/jat-voice';
export const VOICE_LOG_FILE = '/tmp/jat-voice.log';

/**
 * Resolve the persistent voice timeline path for the current project.
 * Lives in `.jat/voice-timeline.jsonl` so notes survive /tmp being wiped on reboot.
 */
export function getVoiceTimelineFile() {
	const projectRoot = process.cwd().replace(/\/ide$/, '');
	return join(projectRoot, '.jat', 'voice-timeline.jsonl');
}

/**
 * @deprecated use getVoiceTimelineFile() — /tmp is ephemeral and loses notes on reboot.
 * Kept as an export for any legacy imports, but the value is resolved at import time
 * from the current working directory.
 */
export const VOICE_TIMELINE_FILE = getVoiceTimelineFile();

/**
 * Append a timestamped line to the voice processing log (and stdout).
 * @param {string} msg
 */
export function vlog(msg) {
	const line = `[${new Date().toISOString()}] ${msg}\n`;
	try { appendFileSync(VOICE_LOG_FILE, line); } catch {}
	console.log('[voice]', msg);
}

/**
 * Load project names and descriptions from ~/.config/jat/projects.json.
 * Returns an array of { name, description } for projects that have descriptions.
 * @returns {Array<{name: string, description: string}>}
 */
export function loadProjects() {
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
 * Transcribe a 16kHz mono WAV file via local voxtype (whisper large-v3-turbo).
 *
 * Options are accepted for forward compatibility — the `diarize` branch will
 * be added in jat-2atga.3 and will return speaker-tagged segments instead of
 * a flat string.
 *
 * @param {string} wavPath — path to a 16kHz mono WAV file
 * @param {{ timeout?: number, maxBuffer?: number }} [opts]
 * @returns {Promise<string>} cleaned transcript text
 */
export function transcribe(wavPath, opts = {}) {
	const timeout = opts.timeout ?? 600_000;
	const maxBuffer = opts.maxBuffer ?? 10 * 1024 * 1024;

	return new Promise((resolve, reject) => {
		exec(`voxtype transcribe "${wavPath}" 2>/dev/null`, {
			timeout,
			encoding: 'utf-8',
			maxBuffer
		}, (err, stdout) => {
			if (err) {
				reject(new Error(`voxtype transcription failed: ${err.message}`));
				return;
			}

			// Strip ANSI codes and voxtype log lines that leak into stdout.
			const lines = stdout.split('\n')
				.map(l => l.replace(/\x1b\[[0-9;]*m/g, '').trim())
				.filter(l => l && !l.startsWith('Loading audio') && !l.startsWith('Audio format:')
					&& !l.startsWith('Processing ') && !l.match(/^\d{4}-\d{2}-\d{2}T/));

			const text = lines.join('\n').trim();
			if (!text) {
				reject(new Error('Transcription produced no output'));
				return;
			}

			resolve(text);
		});
	});
}

/**
 * Call local ollama to organize a transcript into a structured voice note.
 *
 * Modes:
 *   - 'organize' (default): returns { tasks, summary, title, knowledgeBase }
 *     Requires at least one extracted task.
 *   - 'kb': KB-only extraction — returns { tasks: [], summary: '', title, knowledgeBase }
 *     Used by /api/tasks/voice-kb to capture reference material (pricing,
 *     decisions, requirements) without generating tasks. Requires at least
 *     one knowledge base entry.
 *   - 'summary': Summary-only — returns { tasks: [], summary, title, knowledgeBase: [] }
 *     Used by /api/tasks/voice-summary for long brain dumps where the user
 *     wants organized notes but not task extraction. Faster because ollama
 *     produces fewer output tokens.
 *
 * @param {string} transcript
 * @param {Array<{name: string, description: string}>} projects
 * @param {'organize'|'kb'|'summary'} [mode]
 * @returns {Promise<{tasks: Array, summary: string, title: string, knowledgeBase: Array}>}
 */
export async function organizeTranscript(transcript, projects = [], mode = 'organize') {
	if (mode !== 'organize' && mode !== 'kb' && mode !== 'summary') {
		throw new Error(`Unsupported organizeTranscript mode: ${mode}`);
	}

	const projectSection = projects.length > 0
		? `Available projects (assign each entry to the most relevant one based on context):
${projects.map(p => `- ${p.name}: ${p.description}`).join('\n')}

If an entry doesn't clearly belong to any project, omit the "project" field.`
		: '';

	const summaryPrompt = `You are a note organizer. Given a voice note transcript, produce exactly two things:

1. TITLE: A short descriptive title for this voice note (max 8 words, captures the main theme, e.g. "Morning walk: billing and Steel Bridge pricing")

2. SUMMARY: Detailed organized notes covering EVERYTHING discussed. The speaker rambles and jumps between topics — reorganize into clear grouped sections without losing any detail. Format each topic as its own line: "TOPIC NAME: all details, names, numbers, decisions, context for that topic". Every name, date, number, idea, and decision must appear. Nothing omitted.

Do NOT extract tasks. Do NOT extract knowledge base entries. Only organize the transcript into a title and a detailed topic-by-topic summary.

Return ONLY valid JSON (no markdown, no explanation):
{
  "title": "Short descriptive title for this voice note",
  "summary": "<your detailed topic-by-topic notes here>"
}

Transcript:
${transcript}`;

	const prompt = mode === 'summary'
		? summaryPrompt
		: mode === 'kb'
		? `You are a knowledge base extractor. Given a voice note transcript, extract ONLY persistent reference facts worth saving long-term — pricing, architectural decisions, client details, requirements, configuration, domain knowledge. Ignore one-off tasks or momentary intentions ("I should", "remind me to", "later I'll") — only capture durable reference material.

Return ONLY valid JSON (no markdown, no explanation):
{
  "title": "Short descriptive title for this voice note (max 8 words)",
  "knowledgeBase": [
    {
      "title": "Short entry title",
      "content": "Detailed reference content worth remembering long-term — include every name, number, decision, and piece of context relevant to this topic",
      "project": "project-name-here"
    }
  ]
}

Rules:
- One entry per distinct topic/project combination.
- Each entry's content must stand on its own without the original transcript.
- Preserve every specific name, number, date, and decision verbatim.
- Omit the "project" field if an entry doesn't clearly belong to any project.
${projectSection}

Transcript:
${transcript}`
		: `You are a note organizer. Given a voice note transcript, produce four things:

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

	// Stream response, logging progress every 200 tokens.
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
	const title = typeof parsed.title === 'string' ? parsed.title : '';
	const knowledgeBase = Array.isArray(parsed.knowledgeBase) ? parsed.knowledgeBase : [];

	if (mode === 'kb') {
		if (knowledgeBase.length === 0) {
			throw new Error('ollama returned no knowledge base entries');
		}
		return { tasks: [], summary: '', title, knowledgeBase };
	}

	if (mode === 'summary') {
		const summary = typeof parsed.summary === 'string' ? parsed.summary : '';
		if (!summary) {
			throw new Error('ollama returned no summary');
		}
		return { tasks: [], summary, title, knowledgeBase: [] };
	}

	const tasks = parsed.tasks;
	const summary = typeof parsed.summary === 'string' ? parsed.summary : '';

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
export function appendToVoiceTimeline(tasks, transcript = '', summary = '', title = '', knowledgeBase = []) {
	mkdirSync(TEMP_DIR, { recursive: true });
	const timelineFile = getVoiceTimelineFile();
	mkdirSync(dirname(timelineFile), { recursive: true });
	const event = {
		type: 'tasks',
		session_id: 'voice',
		tmux_session: 'jat-voice',
		timestamp: new Date().toISOString(),
		data: { tasks, transcript, summary, title, knowledgeBase }
	};
	appendFileSync(timelineFile, JSON.stringify(event) + '\n');
}

/**
 * Append a raw transcript (no task extraction) to the voice inbox timeline.
 * Used by /api/tasks/voice-transcript when the user wants only a clean text
 * copy of what they said — no ollama, no task inference.
 * @param {string} transcript
 * @param {string} title
 */
export function appendTranscriptToVoiceTimeline(transcript, title = '') {
	mkdirSync(TEMP_DIR, { recursive: true });
	const timelineFile = getVoiceTimelineFile();
	mkdirSync(dirname(timelineFile), { recursive: true });
	const event = {
		type: 'transcript',
		session_id: 'voice',
		tmux_session: 'jat-voice',
		timestamp: new Date().toISOString(),
		data: { transcript, title }
	};
	appendFileSync(timelineFile, JSON.stringify(event) + '\n');
}
