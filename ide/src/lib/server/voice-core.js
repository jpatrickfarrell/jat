/**
 * Voice core — shared functions for voice-to-task processing.
 *
 * Extracted from /api/tasks/voice/+server.js so they can be reused across
 * the upcoming /voice-transcript, /voice-summary, /voice-kb, /voice-launch,
 * and /voice-diarize routes.
 */
import { appendFileSync, mkdirSync, readFileSync, existsSync, mkdtempSync, rmSync } from 'fs';
import { exec, execFile } from 'child_process';
import { join, dirname, basename } from 'path';
import { homedir, tmpdir } from 'os';
import { fileURLToPath } from 'url';

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
 * Returns an array of { name, description, members? } for projects that have descriptions.
 * The optional `members` field is an array of { name, email } passed through verbatim
 * when present in the project config — used by organizeTranscript() to inject team-member
 * context into the prompt.
 * @returns {Array<{name: string, description: string, members?: Array<{name: string, email: string}>}>}
 */
export function loadProjects() {
	try {
		const configPath = join(homedir(), '.config', 'jat', 'projects.json');
		if (!existsSync(configPath)) return [];
		const config = JSON.parse(readFileSync(configPath, 'utf-8'));
		return Object.entries(config.projects || {})
			.filter(([, p]) => p.description && !p.hidden)
			.map(([name, p]) => {
				const out = { name, description: p.description };
				if (Array.isArray(p.members) && p.members.length > 0) {
					out.members = p.members.filter(m => m && typeof m === 'object' && m.name);
				}
				return out;
			});
	} catch {
		return [];
	}
}

/**
 * Run a `jt` subcommand and parse its JSON output.
 * Returns null on failure (timeout, non-zero exit, invalid JSON, jt not on PATH) —
 * callers should treat null as "no data" and degrade gracefully.
 * @param {string[]} args
 * @param {{ timeout?: number }} [opts]
 * @returns {Promise<any|null>}
 */
function execJtJson(args, opts = {}) {
	const timeout = opts.timeout ?? 10_000;
	return new Promise((resolve) => {
		execFile('jt', args, {
			timeout,
			encoding: 'utf-8',
			maxBuffer: 50 * 1024 * 1024
		}, (err, stdout) => {
			if (err) {
				vlog(`jt ${args.join(' ')} failed: ${err.message}`);
				resolve(null);
				return;
			}
			try {
				resolve(JSON.parse(stdout));
			} catch (parseErr) {
				vlog(`jt ${args.join(' ')} returned invalid JSON: ${parseErr.message}`);
				resolve(null);
			}
		});
	});
}

/**
 * Load JAT task context (open epics, in-progress tasks, recent completions) so
 * the organize prompt can link new voice-extracted tasks back to existing work.
 *
 * Each underlying `jt list` call runs in parallel with a 10s timeout. On any
 * failure the affected bucket falls back to empty — this is best-effort context
 * and must never block voice processing.
 *
 * Caps and truncations:
 *   - epics: 10 per project
 *   - in-progress: 20 per project
 *   - recent completions: 20 per project, only those updated within the last 7 days
 *   - all titles + descriptions truncated to 100 chars
 *
 * @param {Array<{name: string}>} [projects] — used only to ensure listed projects
 *   appear as keys in the result even when they have no current activity
 * @returns {Promise<Object<string, {epics: Array, inProgress: Array, recentCompletions: Array}>>}
 */
export async function loadJatContext(projects = []) {
	const since = Date.now() - 7 * 24 * 60 * 60 * 1000;

	const [epicsRaw, inProgressRaw, closedRaw] = await Promise.all([
		execJtJson(['list', '--status', 'open', '--type', 'epic', '--json'], { timeout: 10_000 }),
		execJtJson(['list', '--status', 'in_progress', '--json'], { timeout: 10_000 }),
		execJtJson(['list', '--status', 'closed', '--json'], { timeout: 10_000 })
	]);

	const trunc = (s, n = 100) => {
		const str = typeof s === 'string' ? s : '';
		return str.length > n ? str.slice(0, n - 1) + '…' : str;
	};

	const groupAndCap = (items, cap, predicate = () => true) => {
		const buckets = {};
		if (!Array.isArray(items)) return buckets;
		for (const item of items) {
			if (!item || !predicate(item)) continue;
			const project = item.project || 'unknown';
			if (!buckets[project]) buckets[project] = [];
			if (buckets[project].length >= cap) continue;
			buckets[project].push({
				id: item.id,
				title: trunc(item.title),
				description: trunc(item.description)
			});
		}
		return buckets;
	};

	const epicsByProject = groupAndCap(epicsRaw, 10);
	const inProgressByProject = groupAndCap(inProgressRaw, 20);
	const recentByProject = groupAndCap(closedRaw, 20, (item) => {
		if (!item.updated_at) return false;
		const t = Date.parse(item.updated_at);
		return Number.isFinite(t) && t >= since;
	});

	const projectNames = new Set([
		...projects.map(p => p && p.name).filter(Boolean),
		...Object.keys(epicsByProject),
		...Object.keys(inProgressByProject),
		...Object.keys(recentByProject)
	]);

	const result = {};
	for (const name of projectNames) {
		result[name] = {
			epics: epicsByProject[name] || [],
			inProgress: inProgressByProject[name] || [],
			recentCompletions: recentByProject[name] || []
		};
	}
	return result;
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
	const timeout = opts.timeout ?? 3_600_000; // 1 hour — long recordings need it
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
		// GPU diarization via whisperx-diarize.py (jat-c71qe.4).
		//
		// We don't use the whisperx CLI: `whisperx --device cuda` cannot run on
		// AMD ROCm because ctranslate2 4.7.1 has no HIP backend (NVIDIA-only).
		// The wrapper splits devices: ctranslate2 transcribe on CPU, alignment
		// and pyannote diarization on GPU via ROCm torch. Diarization was the
		// 15–30 min bottleneck on CPU and runs in ~10s/min-of-audio on GPU.
		//
		// Rollback to CPU-only diarization (if ROCm/pyannote breaks): edit
		// whisperx-diarize.py and change device="cuda" to device="cpu" in the
		// load_align_model and DiarizationPipeline calls; restart the IDE.
		const venvPython = join(homedir(), '.local', 'share', 'whisperx-env', 'bin', 'python3');
		const scriptPath = join(dirname(fileURLToPath(import.meta.url)), 'whisperx-diarize.py');
		await new Promise((resolve, reject) => {
			vlog(`running whisperx (diarize, gpu): ${wavPath}`);
			execFile(
				venvPython,
				[scriptPath, wavPath, outputDir],
				{
					timeout,
					encoding: 'utf-8',
					maxBuffer,
					env: { ...process.env, HF_TOKEN: hfToken }
				},
				(err, _stdout, stderr) => {
					if (err) {
						reject(new Error(`whisperx failed: ${err.message}\n${stderr || ''}`.trim()));
						return;
					}
					if (stderr) {
						for (const line of stderr.split('\n')) {
							const trimmed = line.trim();
							if (trimmed) vlog(`[whisperx] ${trimmed}`);
						}
					}
					resolve(null);
				}
			);
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
/**
 * Attempt to salvage truncated JSON from ollama by closing open structures.
 * Strategy 1: append common suffixes to close arrays/objects.
 * Strategy 2: walk back to the last complete `}`, close from there.
 * Returns parsed object or null if unrecoverable.
 * @param {string} str
 * @param {Function} log
 * @returns {object|null}
 */
function repairTruncatedJson(str, log) {
	// Phase 1: simple suffix closures (truncated after a complete value)
	const suffixes = ['"}', '"}]', '"]}', '"}]}', '],"summary":""}', ']}', '}'];
	for (const s of suffixes) {
		try {
			const r = JSON.parse(str + s);
			log(`ollama JSON repaired (+suffix), tasks=${Array.isArray(r.tasks) ? r.tasks.length : 0}`);
			return r;
		} catch {}
	}

	// Phase 2: find the last `}` and try closing from there
	// This handles truncation mid-task-object — we lose the incomplete task but keep the rest
	for (let i = str.length - 1; i > str.length / 3; i--) {
		if (str[i] !== '}') continue;
		const trunc = str.slice(0, i + 1);
		for (const s of [']}', '],"summary":""}', '],"knowledgeBase":[],"summary":""}', '}']) {
			try {
				const r = JSON.parse(trunc + s);
				const taskCount = Array.isArray(r.tasks) ? r.tasks.length : 0;
				log(`ollama JSON repaired (truncated at last }, +suffix), tasks=${taskCount}`);
				return r;
			} catch {}
		}
		break; // only try the last `}` — don't walk the whole string
	}

	return null;
}

export async function organizeTranscript(transcript, projects = [], mode = 'organize', jatContext = {}) {
	if (mode !== 'organize' && mode !== 'kb' && mode !== 'summary') {
		throw new Error(`Unsupported organizeTranscript mode: ${mode}`);
	}

	const diarized = isDiarizedTranscript(transcript);
	const speakerLabels = diarized ? extractSpeakerLabels(transcript) : [];

	const knownMembers = diarized
		? Array.from(new Map(
			(projects || [])
				.flatMap(p => Array.isArray(p?.members) ? p.members : [])
				.filter(m => m && typeof m.name === 'string' && m.name.trim())
				.map(m => [`${m.name.toLowerCase()}|${(m.email || '').toLowerCase()}`, m])
		).values())
		: [];
	const knownMembersLine = knownMembers.length > 0
		? ` Known team members across projects: ${knownMembers.map(m => m.email ? `${m.name} (${m.email})` : m.name).join(', ')}.`
		: '';

	const speakerInstructions = diarized
		? `\n\nSpeaker diarization: This transcript is labeled with SPEAKER_XX tags (${speakerLabels.join(', ')}).${knownMembersLine} Look for patterns "I'm [name]", "This is [name]", "my name is [name]" as primary signals for matching speaker labels to known members. Output the matched name string as the value in the "speakers" object (use the canonical member name when a match is found), or null if no match can be determined from the transcript.`
		: '';
	const speakersSchemaLine = diarized
		? `,\n  "speakers": { ${speakerLabels.map(l => `"${l}": null`).join(', ')} }`
		: '';

	const projectSection = projects.length > 0
		? `Available projects (assign each entry to the most relevant one based on context):
${projects.map(p => `- ${p.name}: ${p.description}`).join('\n')}

If an entry doesn't clearly belong to any project, omit the "project" field.`
		: '';

	// JAT context — only injected in 'organize' mode, where epic linking and member
	// attribution influence the generated tasks. KB and summary modes don't produce
	// tasks, so injecting this would just bloat the prompt for no win.
	let jatContextSection = '';
	let jatContextCounts = { epics: 0, inProgress: 0, recentCompletions: 0, members: 0 };
	if (mode === 'organize') {
		const projectMembersByName = new Map(
			projects.filter(p => Array.isArray(p.members) && p.members.length > 0).map(p => [p.name, p.members])
		);
		const allProjectNames = new Set([
			...Object.keys(jatContext || {}),
			...projectMembersByName.keys()
		]);

		const lines = [];
		for (const name of allProjectNames) {
			const ctx = (jatContext && jatContext[name]) || {};
			const epics = Array.isArray(ctx.epics) ? ctx.epics : [];
			const inProgress = Array.isArray(ctx.inProgress) ? ctx.inProgress : [];
			const recent = Array.isArray(ctx.recentCompletions) ? ctx.recentCompletions : [];
			const members = projectMembersByName.get(name) || [];

			if (epics.length === 0 && inProgress.length === 0 && recent.length === 0 && members.length === 0) {
				continue;
			}

			lines.push(`Project "${name}":`);
			if (epics.length > 0) {
				lines.push('  Open epics:');
				for (const e of epics) lines.push(`    - ${e.id}: ${e.title}`);
				jatContextCounts.epics += epics.length;
			}
			if (inProgress.length > 0) {
				lines.push(`  In progress: ${inProgress.map(t => t.title).filter(Boolean).join('; ')}`);
				jatContextCounts.inProgress += inProgress.length;
			}
			if (recent.length > 0) {
				lines.push(`  Recently completed (last 7d): ${recent.map(t => t.title).filter(Boolean).join('; ')}`);
				jatContextCounts.recentCompletions += recent.length;
			}
			if (members.length > 0) {
				lines.push(`  Team members: ${members.map(m => m.email ? `${m.name} (${m.email})` : m.name).join(', ')}`);
				jatContextCounts.members += members.length;
			}
		}

		if (lines.length > 0) {
			jatContextSection = `JAT Context (use this to link tasks to existing work):
${lines.join('\n')}

If a task clearly belongs to a listed epic, add "epic_id": "<id>" to that task object.`;
		}
	}

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
  ],
  "summary": "<your detailed topic-by-topic notes here>"${speakersSchemaLine}
}

Task types: task, feature, bug, chore
Priority: 0=critical 1=high 2=medium 3=low 4=lowest
Use priority cues ("urgent", "first thing", "must", "deadline" → lower number).
Group related items into one task rather than splitting trivially.
${jatContextSection ? `${jatContextSection}\n\n` : ''}${projectSection}

Transcript:
${transcript}`;

	if (mode === 'organize') {
		const totalCtx = jatContextCounts.epics + jatContextCounts.inProgress + jatContextCounts.recentCompletions + jatContextCounts.members;
		if (totalCtx > 0) {
			vlog(`injecting ${jatContextCounts.epics} epics, ${jatContextCounts.inProgress} in-progress, ${jatContextCounts.recentCompletions} recent completions, ${jatContextCounts.members} members into organize prompt`);
		} else {
			vlog('no JAT context to inject (empty epics/in-progress/recent/members)');
		}
	}

	const response = await fetch('http://localhost:11434/api/generate', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			model: process.env.ORGANIZE_TASKS_MODEL || 'gemma4:e2b',
			prompt,
			stream: true,
			options: { temperature: 0.3, num_predict: -1, num_ctx: 131072 }
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

	// Strip markdown code fences if model wrapped the JSON (happens without format:'json')
	const jsonStr = fullResponse.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

	let parsed;
	try {
		parsed = JSON.parse(jsonStr);
	} catch (jsonErr) {
		parsed = repairTruncatedJson(jsonStr, vlog);
		if (!parsed) {
			const preview = jsonStr.slice(0, 200).replace(/\n/g, '\\n');
			throw new Error(`ollama returned invalid JSON: ${jsonErr.message} — raw (first 200 chars): ${preview}`);
		}
	}
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
export function appendToVoiceTimeline(tasks, transcript = '', summary = '', title = '', knowledgeBase = [], speakers = null, voiceId = null) {
	mkdirSync(TEMP_DIR, { recursive: true });
	const timelineFile = getVoiceTimelineFile();
	mkdirSync(dirname(timelineFile), { recursive: true });
	const event = {
		type: 'tasks',
		...(voiceId ? { voice_id: voiceId } : {}),
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
 * Write a "processing" stub to the voice inbox immediately on upload so the
 * UI can show a spinner while transcription + organisation run in the background.
 * @param {string} voiceId — stable ID linking stub → completion/failure
 * @param {string} title
 * @param {number} [sizeBytes]
 */
export function appendProcessingToVoiceTimeline(voiceId, title, sizeBytes = 0, stage = 'transcribing') {
	mkdirSync(TEMP_DIR, { recursive: true });
	const timelineFile = getVoiceTimelineFile();
	mkdirSync(dirname(timelineFile), { recursive: true });
	const event = {
		type: 'processing',
		voice_id: voiceId,
		session_id: 'voice',
		tmux_session: 'jat-voice',
		timestamp: new Date().toISOString(),
		data: { title, sizeBytes, stage }
	};
	const line = JSON.stringify(event) + '\n';
	appendFileSync(timelineFile, line);
	appendFileSync('/tmp/jat-timeline-jat-voice.jsonl', line);
}

/**
 * Write a "failed" entry — collapses the "processing" stub for the same voiceId.
 * @param {string} voiceId
 * @param {string} title
 * @param {string} errorMsg
 */
export function appendFailedToVoiceTimeline(voiceId, title, errorMsg) {
	mkdirSync(TEMP_DIR, { recursive: true });
	const timelineFile = getVoiceTimelineFile();
	mkdirSync(dirname(timelineFile), { recursive: true });
	const event = {
		type: 'failed',
		voice_id: voiceId,
		session_id: 'voice',
		tmux_session: 'jat-voice',
		timestamp: new Date().toISOString(),
		data: { title, error: errorMsg }
	};
	const line = JSON.stringify(event) + '\n';
	appendFileSync(timelineFile, line);
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
				stream: false,
				options: { temperature: 0.3, num_predict: 64, num_ctx: 131072 }
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
