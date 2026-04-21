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
 * Transcribe a 16kHz mono WAV file.
 *
 * - **Fast path (default):** voxtype (whisper large-v3-turbo) — single speaker,
 *   returns a flat transcript string.
 * - **Diarize path (`opts.diarize=true`):** whisperx + pyannote — multi-speaker,
 *   returns a speaker-labeled transcript like:
 *     [SPEAKER_00]: Hi I'm John
 *     [SPEAKER_01]: Nice to meet you
 *   Falls back to the fast path if whisperx fails (missing token, model load
 *   error, etc.) so the caller always gets *some* usable transcript.
 *
 * @param {string} wavPath — path to a 16kHz mono WAV file
 * @param {{ timeout?: number, maxBuffer?: number, diarize?: boolean }} [opts]
 * @returns {Promise<string>} cleaned transcript text (optionally speaker-labeled)
 */
export function transcribe(wavPath, opts = {}) {
	const timeout = opts.timeout ?? 600_000;
	const maxBuffer = opts.maxBuffer ?? 10 * 1024 * 1024;

	if (opts.diarize === true) {
		return transcribeDiarized(wavPath, { timeout, maxBuffer })
			.catch((err) => {
				vlog(`whisperx diarize failed, falling back to voxtype: ${err.message}`);
				return transcribeFast(wavPath, { timeout, maxBuffer });
			});
	}
	return transcribeFast(wavPath, { timeout, maxBuffer });
}

function transcribeFast(wavPath, { timeout, maxBuffer }) {
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
 * Run whisperx with --diarize, parse the JSON output, and format segments
 * into a speaker-labeled transcript. Consecutive segments from the same
 * speaker are merged into one line so the result reads like a conversation
 * rather than a timestamped log.
 */
async function transcribeDiarized(wavPath, { timeout, maxBuffer }) {
	const hfToken = await getHfToken();
	if (!hfToken) {
		throw new Error('hf-token not found — run `jat-secret --set hf-token ...`');
	}

	const outputDir = mkdtempSync(join(tmpdir(), 'jat-whisperx-'));
	try {
		await new Promise((resolve, reject) => {
			const cmd = [
				`whisperx "${wavPath}"`,
				`--model large-v3-turbo`,
				`--diarize`,
				`--hf_token "${hfToken}"`,
				`--device cpu`,
				`--compute_type int8`,
				`--output_format json`,
				`--output_dir "${outputDir}"`
			].join(' ');
			vlog(`running whisperx (diarize): ${wavPath}`);
			exec(cmd, { timeout, encoding: 'utf-8', maxBuffer }, (err, _stdout, stderr) => {
				if (err) {
					reject(new Error(`whisperx failed: ${err.message}\n${stderr || ''}`.trim()));
					return;
				}
				resolve(null);
			});
		});

		// whisperx writes <stem>.json into --output_dir (stem = basename minus .wav).
		const stem = basename(wavPath).replace(/\.wav$/i, '');
		const jsonPath = join(outputDir, `${stem}.json`);
		if (!existsSync(jsonPath)) {
			throw new Error(`whisperx output not found at ${jsonPath}`);
		}

		const parsed = JSON.parse(readFileSync(jsonPath, 'utf-8'));
		const segments = Array.isArray(parsed.segments) ? parsed.segments : [];
		if (segments.length === 0) {
			throw new Error('whisperx produced no segments');
		}

		const lines = [];
		let currentSpeaker = null;
		let currentText = [];
		const flush = () => {
			if (currentSpeaker !== null && currentText.length > 0) {
				lines.push(`[${currentSpeaker}]: ${currentText.join(' ')}`);
			}
		};
		for (const seg of segments) {
			const speaker = seg.speaker || 'SPEAKER_UNKNOWN';
			const text = typeof seg.text === 'string' ? seg.text.trim() : '';
			if (!text) continue;
			if (speaker !== currentSpeaker) {
				flush();
				currentSpeaker = speaker;
				currentText = [text];
			} else {
				currentText.push(text);
			}
		}
		flush();

		const result = lines.join('\n').trim();
		if (!result) {
			throw new Error('whisperx segments had no usable text');
		}
		vlog(`whisperx produced ${lines.length} speaker-grouped lines`);
		return result;
	} finally {
		try { rmSync(outputDir, { recursive: true, force: true }); } catch {}
	}
}

function getHfToken() {
	return new Promise((resolve) => {
		exec('jat-secret hf-token', { encoding: 'utf-8' }, (err, stdout) => {
			if (err) { resolve(null); return; }
			const token = (stdout || '').trim();
			resolve(token || null);
		});
	});
}

/**
 * Detect whether a transcript is diarized (contains [SPEAKER_XX]: labels).
 * @param {string} transcript
 * @returns {boolean}
 */
function isDiarizedTranscript(transcript) {
	return /\[SPEAKER_[A-Z0-9_]+\]:/.test(transcript);
}

/**
 * Extract the set of unique SPEAKER_XX labels from a diarized transcript,
 * preserving first-mention order.
 * @param {string} transcript
 * @returns {string[]}
 */
function extractSpeakerLabels(transcript) {
	const seen = new Set();
	const labels = [];
	const re = /\[(SPEAKER_[A-Z0-9_]+)\]:/g;
	let m;
	while ((m = re.exec(transcript)) !== null) {
		if (!seen.has(m[1])) {
			seen.add(m[1]);
			labels.push(m[1]);
		}
	}
	return labels;
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

	const diarized = isDiarizedTranscript(transcript);
	const speakerLabels = diarized ? extractSpeakerLabels(transcript) : [];
	const speakerInstructions = diarized
		? `\n\nSpeaker diarization: This transcript is labeled with SPEAKER_XX tags (${speakerLabels.join(', ')}). If any speaker introduces themselves by name (e.g. "Hi I'm John", "This is Sarah", "my name is..."), map their SPEAKER_XX label to that name in the "speakers" object. Leave the value null for any speaker whose name cannot be determined from the transcript.`
		: '';
	const speakersSchemaLine = diarized
		? `,\n  "speakers": { ${speakerLabels.map(l => `"${l}": null`).join(', ')} }`
		: '';

	const projectSection = projects.length > 0
		? `Available projects (assign each entry to the most relevant one based on context):
${projects.map(p => `- ${p.name}: ${p.description}`).join('\n')}

If an entry doesn't clearly belong to any project, omit the "project" field.`
		: '';

	const summaryPrompt = `You are a note organizer. Given a voice note transcript, produce exactly two things:

1. TITLE: A short descriptive title for this voice note (max 8 words, captures the main theme, e.g. "Morning walk: billing and Steel Bridge pricing")

2. SUMMARY: Detailed organized notes covering EVERYTHING discussed. The speaker rambles and jumps between topics — reorganize into clear grouped sections without losing any detail. Format as markdown: use ## for each topic heading, then bullet points for the details, names, numbers, decisions, and context under that topic. Every name, date, number, idea, and decision must appear. Nothing omitted.

Do NOT extract tasks. Do NOT extract knowledge base entries. Only organize the transcript into a title and a detailed topic-by-topic summary.${speakerInstructions}

Return ONLY valid JSON (no markdown, no explanation):
{
  "title": "Short descriptive title for this voice note",
  "summary": "<your detailed topic-by-topic notes here>"${speakersSchemaLine}
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

2. SUMMARY: Detailed organized notes covering EVERYTHING discussed. The speaker rambles and jumps between topics — reorganize into clear grouped sections without losing any detail. Format as markdown: use ## for each topic heading, then bullet points for the details, names, numbers, decisions, and context under that topic. Every name, date, number, idea, and decision must appear. Nothing omitted.

3. TASKS: Every actionable item extracted from the transcript. Each task includes a "context" field: the specific topic line from the summary that this task belongs to.

4. KNOWLEDGE BASE: Persistent reference facts worth saving long-term per project — pricing, decisions, requirements, client details, architectural choices. Omit one-off tasks (those go in tasks). One entry per distinct topic/project combination.${speakerInstructions}

Return ONLY valid JSON (no markdown, no explanation):
{
  "title": "Short descriptive title for this voice note",
  "summary": "<your detailed topic-by-topic notes here>"${speakersSchemaLine},
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
			model: process.env.ORGANIZE_TASKS_MODEL || 'gemma4:e2b',
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
	const speakers = diarized && parsed.speakers && typeof parsed.speakers === 'object' && !Array.isArray(parsed.speakers)
		? parsed.speakers
		: null;

	if (mode === 'kb') {
		if (knowledgeBase.length === 0) {
			throw new Error('ollama returned no knowledge base entries');
		}
		return { tasks: [], summary: '', title, knowledgeBase, speakers };
	}

	if (mode === 'summary') {
		const summary = typeof parsed.summary === 'string' ? parsed.summary : '';
		if (!summary) {
			throw new Error('ollama returned no summary');
		}
		return { tasks: [], summary, title, knowledgeBase: [], speakers };
	}

	const tasks = parsed.tasks;
	const summary = typeof parsed.summary === 'string' ? parsed.summary : '';

	if (!Array.isArray(tasks) || tasks.length === 0) {
		throw new Error('ollama returned no tasks');
	}

	return { tasks, summary, title, knowledgeBase, speakers };
}

/**
 * Append organized tasks to the voice inbox timeline file.
 * EventStack polls /api/sessions/jat-voice/timeline which reads this file.
 * @param {Array} tasks
 * @param {string} transcript
 * @param {string} summary
 * @param {string} title
 * @param {Array} knowledgeBase
 * @param {Object|null} speakers — map of SPEAKER_XX labels to names (diarized only)
 */
export function appendToVoiceTimeline(tasks, transcript = '', summary = '', title = '', knowledgeBase = [], speakers = null) {
	mkdirSync(TEMP_DIR, { recursive: true });
	const timelineFile = getVoiceTimelineFile();
	mkdirSync(dirname(timelineFile), { recursive: true });
	const event = {
		type: 'tasks',
		session_id: 'voice',
		tmux_session: 'jat-voice',
		timestamp: new Date().toISOString(),
		data: { tasks, transcript, summary, title, knowledgeBase, speakers }
	};
	const line = JSON.stringify(event) + '\n';
	appendFileSync(timelineFile, line);
	// Also write to SSE timeline so VoiceInbox picks it up in real-time
	appendFileSync('/tmp/jat-timeline-jat-voice.jsonl', line);
}

/**
 * Append a raw transcript (no task extraction) to the voice inbox timeline.
 * Used by /api/tasks/voice-transcript when the user wants only a clean text
 * copy of what they said — no ollama, no task inference.
 *
 * @param {string} transcript — raw transcript text
 * @param {string} title — short title (derived from filename or timestamp)
 * @param {{ durationSec?: number, sizeBytes?: number, source?: 'text'|'audio' }} [meta]
 */
export function appendTranscriptToVoiceTimeline(transcript, title = '', meta = {}) {
	mkdirSync(TEMP_DIR, { recursive: true });
	const timelineFile = getVoiceTimelineFile();
	mkdirSync(dirname(timelineFile), { recursive: true });
	const event = {
		type: 'transcript',
		session_id: 'voice',
		tmux_session: 'jat-voice',
		timestamp: new Date().toISOString(),
		data: {
			transcript,
			title,
			charCount: transcript.length,
			durationSec: meta.durationSec ?? null,
			sizeBytes: meta.sizeBytes ?? null,
			source: meta.source ?? 'text'
		}
	};
	const line = JSON.stringify(event) + '\n';
	appendFileSync(timelineFile, line);
	// Also write to SSE timeline so VoiceInbox picks it up in real-time
	appendFileSync('/tmp/jat-timeline-jat-voice.jsonl', line);
}

/**
 * Title-only ollama call — returns a short descriptive title for a transcript
 * without running the full organize/tasks/kb pipeline. Used by
 * /api/tasks/voice-transcript to get meaningful titles without paying the cost
 * of the full task-extraction pass.
 *
 * Returns empty string on any failure; callers should fall back to a
 * heuristic title (filename, date, etc).
 *
 * @param {string} transcript
 * @returns {Promise<string>}
 */
export async function generateTitleFromTranscript(transcript) {
	const text = (transcript || '').trim();
	if (!text) return '';

	const prompt = `You are a note titler. Given a voice note transcript, return a short descriptive title (max 8 words) that captures the main theme. Example: "Morning walk: billing and Steel Bridge pricing".

Return ONLY valid JSON (no markdown, no explanation):
{
  "title": "Short descriptive title"
}

Transcript:
${text}`;

	try {
		const response = await fetch('http://localhost:11434/api/generate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: process.env.ORGANIZE_TASKS_MODEL || 'gemma4:e2b',
				prompt,
				format: 'json',
				stream: false,
				options: { temperature: 0.3, num_predict: 64 }
			}),
			signal: AbortSignal.timeout(60_000)
		});

		if (!response.ok) {
			vlog(`[title] ollama request failed: ${response.status}`);
			return '';
		}

		const body = await response.json();
		const parsed = JSON.parse(body.response || '{}');
		const title = typeof parsed.title === 'string' ? parsed.title.trim() : '';
		return title;
	} catch (e) {
		vlog(`[title] ERROR: ${e instanceof Error ? e.message : String(e)}`);
		return '';
	}
}
