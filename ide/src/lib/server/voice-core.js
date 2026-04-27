/**
 * Voice core — shared functions for voice-to-task processing.
 *
 * Extracted from /api/tasks/voice/+server.js so they can be reused across
 * the upcoming /voice-transcript, /voice-summary, /voice-kb, /voice-launch,
 * and /voice-diarize routes.
 */
import { appendFileSync, mkdirSync, readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'fs';
import { exec, execFile } from 'child_process';
import { join, dirname, basename } from 'path';
import { homedir, tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { classifyForPipeline } from '$lib/voice/providers/ollama.js';
import { transcribeWavFile } from '$lib/voice/providers/voxtype.js';

export const TEMP_DIR = '/tmp/jat-voice';
export const VOICE_LOG_FILE = '/tmp/jat-voice.log';

// Resolves once at startup. The ntfy-url secret is read via `jat-secret`;
// nullable result means "no ntfy-url configured" and sendVoiceNotification
// degrades to a silent no-op.
const ntfyUrlPromise = new Promise((resolve) => {
	exec('jat-secret ntfy-url', (err, stdout) => {
		if (err) { resolve(null); return; }
		const url = (stdout || '').trim();
		resolve(url || null);
	});
});

/**
 * Fire-and-forget push notification to the ntfy server.
 * Stub implementation — jat-dhzx3 (event-driven notifications epic) will
 * replace this with real event emission, but the call sites stay the same.
 *
 * Never awaits, never throws. If ntfy-url is not configured, returns silently.
 *
 * @param {{title: string, message: string, tags?: string[], priority?: number}} payload
 */
export function sendVoiceNotification(payload) {
	ntfyUrlPromise.then((url) => {
		if (!url) return;
		const segments = url.replace(/\/+$/, '').split('/');
		const topic = segments[segments.length - 1];
		if (!topic) return;
		fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ topic, ...payload })
		}).catch((e) => vlog('[ntfy] push failed: ' + (e instanceof Error ? e.message : String(e))));
	}).catch(() => {});
}

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
// Resolve the ollama model for transcript organization:
// 1. voice.json providerOverrides.ollama.model (user-configured in voice subsystem)
// 2. ORGANIZE_TASKS_MODEL env var (legacy override)
// 3. hardcoded default
function getOrganizeModel() {
	try {
		const cfgPath = join(homedir(), '.config', 'jat', 'voice.json');
		if (existsSync(cfgPath)) {
			const cfg = JSON.parse(readFileSync(cfgPath, 'utf-8'));
			const model = cfg?.providerOverrides?.ollama?.model;
			if (typeof model === 'string' && model.trim()) return model.trim();
		}
	} catch {}
	return process.env.ORGANIZE_TASKS_MODEL || 'gemma4:e2b';
}

export function transcribe(wavPath, opts = {}) {
	const timeout = opts.timeout ?? 3_600_000; // 1 hour — long recordings need it
	const maxBuffer = opts.maxBuffer ?? 10 * 1024 * 1024;

	if (opts.diarize === true) {
		return transcribeDiarized(wavPath, { timeout, maxBuffer })
			.catch((err) => {
				vlog(`whisperx diarize failed, falling back to voxtype: ${err.message}`);
				// Delegate to voxtype provider (jat-68j78.24 refactor)
				return transcribeWavFile(wavPath, { timeout, maxBuffer });
			});
	}
	// Delegate to voxtype provider (jat-68j78.24 refactor)
	return transcribeWavFile(wavPath, { timeout, maxBuffer });
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

	// Delegate to ollama provider via classifyForPipeline (jat-68j78.24 refactor).
	// Uses /api/chat with format='json' for grammar-constrained JSON output,
	// replacing the streaming /api/generate call. Model is read from voice.json.
	const ollamaStart = Date.now();
	vlog(`ollama organize (${mode}) starting via subsystem provider...`);
	const jsonStr = await classifyForPipeline({ prompt, model: getOrganizeModel() });
	vlog(`ollama organize done in ${((Date.now() - ollamaStart) / 1000).toFixed(1)}s`);

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
 * Slugify a string for use in a filename.
 * Lowercase, non-alphanumeric → hyphens, collapsed, trimmed, capped at 40 chars.
 * @param {string} s
 * @returns {string}
 */
function slugifyForFilename(s) {
	const slug = (s || '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 40)
		.replace(/^-+|-+$/g, '');
	return slug || 'untitled';
}

/**
 * Strip markdown punctuation/formatting from a string for the frontmatter description.
 * @param {string} s
 * @returns {string}
 */
function stripMarkdown(s) {
	return (s || '')
		.replace(/```[\s\S]*?```/g, '')
		.replace(/`[^`]*`/g, '')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[#*_>~`]+/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Load { name → absolute path } for every project in ~/.config/jat/projects.json.
 * Expands leading ~ to the home directory. Returns empty map on any failure.
 * @returns {Object<string, string>}
 */
function loadProjectPaths() {
	try {
		const configPath = join(homedir(), '.config', 'jat', 'projects.json');
		if (!existsSync(configPath)) return {};
		const config = JSON.parse(readFileSync(configPath, 'utf-8'));
		const out = {};
		for (const [name, p] of Object.entries(config.projects || {})) {
			if (p && typeof p.path === 'string' && p.path) {
				out[name] = p.path.startsWith('~/')
					? join(homedir(), p.path.slice(2))
					: p.path;
			}
		}
		return out;
	} catch {
		return {};
	}
}

/**
 * Write per-project memory files into .jat/memory/ for every voice session that
 * produced tasks or knowledge base entries. Each project gets its own file
 * scoped to that project's entries; unattributed entries are appended to the
 * first project's file under a `_general` section, or land in a standalone
 * `_general` file if the entire note is unattributed.
 *
 * Files are written to the JAT root (`process.cwd().replace(/\/ide$/, '')`).
 * For each non-JAT project, if `~/.config/jat/projects.json` has a path for
 * that project AND `<path>/.jat/memory/` already exists, the file is also
 * written there so per-project agents can search it via jat-search.
 *
 * @param {{tasks?: Array, summary?: string, title?: string, knowledgeBase?: Array, speakers?: Object|null}} organizeResult
 * @param {Date} [date] — recording date (falls back to now)
 */
export function writeVoiceMemoryFiles(organizeResult, date = new Date()) {
	const {
		tasks = [],
		summary = '',
		title = '',
		knowledgeBase = [],
		speakers = null
	} = organizeResult || {};

	const projectGroups = {};
	const ensureGroup = (name) => {
		if (!projectGroups[name]) projectGroups[name] = { tasks: [], kb: [] };
		return projectGroups[name];
	};

	const unattributedTasks = [];
	const unattributedKb = [];

	for (const task of Array.isArray(tasks) ? tasks : []) {
		if (task && typeof task.project === 'string' && task.project.trim()) {
			ensureGroup(task.project).tasks.push(task);
		} else if (task) {
			unattributedTasks.push(task);
		}
	}
	for (const entry of Array.isArray(knowledgeBase) ? knowledgeBase : []) {
		if (entry && typeof entry.project === 'string' && entry.project.trim()) {
			ensureGroup(entry.project).kb.push(entry);
		} else if (entry) {
			unattributedKb.push(entry);
		}
	}

	const projectKeys = Object.keys(projectGroups);
	const hasUnattributed = unattributedTasks.length > 0 || unattributedKb.length > 0;

	if (projectKeys.length === 0 && !hasUnattributed) {
		vlog('writeVoiceMemoryFiles: nothing to write (no tasks, no KB)');
		return;
	}

	if (projectKeys.length === 0 && hasUnattributed) {
		ensureGroup('_general').tasks = unattributedTasks;
		projectGroups['_general'].kb = unattributedKb;
	} else if (hasUnattributed) {
		const firstKey = projectKeys[0];
		projectGroups[firstKey].generalTasks = unattributedTasks;
		projectGroups[firstKey].generalKb = unattributedKb;
	}

	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, '0');
	const dd = String(date.getDate()).padStart(2, '0');
	const dateStr = `${yyyy}-${mm}-${dd}`;

	const slug = slugifyForFilename(title);
	const descStr = stripMarkdown(summary).slice(0, 160);
	const safeTitle = title || 'Untitled';

	let speakersLine = '';
	if (speakers && typeof speakers === 'object' && !Array.isArray(speakers)) {
		const entries = Object.entries(speakers);
		if (entries.length > 0) {
			const formatted = entries
				.map(([label, name]) =>
					name && typeof name === 'string' && name.trim() ? name : `Unknown (${label})`
				)
				.join(', ');
			speakersLine = `**Speakers:** ${formatted}\n`;
		}
	}

	const allProjectsLine = `**Projects:** ${Object.keys(projectGroups).join(', ')}`;
	const projectPaths = loadProjectPaths();
	const jatRoot = process.cwd().replace(/\/ide$/, '');

	let written = 0;
	let failed = 0;

	for (const [project, data] of Object.entries(projectGroups)) {
		const filename = `voice-${dateStr}-${project}-${slug}.md`;

		let body = '---\n';
		body += `name: Voice note: ${safeTitle}\n`;
		body += `description: ${descStr}\n`;
		body += 'type: project\n';
		body += '---\n';
		body += `**Date:** ${dateStr}\n`;
		body += speakersLine;
		body += `${allProjectsLine}\n\n`;
		body += `## Summary\n${summary}\n\n`;

		if (data.kb && data.kb.length > 0) {
			body += '## Knowledge Base\n';
			for (const entry of data.kb) {
				body += `### ${entry.title || 'Untitled entry'}\n${entry.content || ''}\n\n`;
			}
		}

		if (data.tasks && data.tasks.length > 0) {
			body += '## Tasks Created\n';
			for (const task of data.tasks) {
				body += `- ${task.title || 'Untitled task'} (pending)\n`;
			}
			body += '\n';
		}

		const generalTasks = data.generalTasks || [];
		const generalKb = data.generalKb || [];
		if (generalTasks.length > 0 || generalKb.length > 0) {
			body += '## _general\n';
			if (generalKb.length > 0) {
				body += '### Knowledge Base\n';
				for (const entry of generalKb) {
					body += `#### ${entry.title || 'Untitled entry'}\n${entry.content || ''}\n\n`;
				}
			}
			if (generalTasks.length > 0) {
				body += '### Tasks Created\n';
				for (const task of generalTasks) {
					body += `- ${task.title || 'Untitled task'} (pending)\n`;
				}
				body += '\n';
			}
		}

		const targets = [join(jatRoot, '.jat', 'memory')];
		if (project !== 'jat' && project !== '_general' && projectPaths[project]) {
			const projectMemoryDir = join(projectPaths[project], '.jat', 'memory');
			if (existsSync(projectMemoryDir)) {
				targets.push(projectMemoryDir);
			}
		}

		for (const dir of targets) {
			try {
				mkdirSync(dir, { recursive: true });
				const filePath = join(dir, filename);
				writeFileSync(filePath, body);
				vlog(`wrote voice memory: ${filePath}`);
				written++;
			} catch (e) {
				vlog(`failed to write voice memory at ${dir}/${filename}: ${e.message}`);
				failed++;
			}
		}
	}

	vlog(`writeVoiceMemoryFiles done: ${written} written, ${failed} failed across ${Object.keys(projectGroups).length} project file(s)`);
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
 * @param {string|null} voiceId
 * @param {Date|null} recordingDate — recording timestamp, used for memory file naming/header
 */
export function appendToVoiceTimeline(tasks, transcript = '', summary = '', title = '', knowledgeBase = [], speakers = null, voiceId = null, recordingDate = null) {
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

	// Per-project memory files (jat-jz8k8.3) — searchable .jat/memory/ files
	// from voice notes. File-write failures must not prevent the timeline
	// write above from being considered successful.
	try {
		const memoryDate = recordingDate instanceof Date && !isNaN(recordingDate.getTime())
			? recordingDate
			: new Date();
		writeVoiceMemoryFiles({ tasks, summary, title, knowledgeBase, speakers }, memoryDate);
	} catch (e) {
		vlog(`writeVoiceMemoryFiles threw: ${e instanceof Error ? e.message : String(e)}`);
	}
	sendVoiceNotification({
		title: 'Voice Inbox',
		message: tasks.length + ' task(s) from \'' + title + '\' · tap to review',
		tags: ['microphone'],
		priority: 3
	});
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
	sendVoiceNotification({ title: 'Voice Inbox', message: 'Processing failed: \'' + title + '\' — check the voice log', tags: ['warning'], priority: 3 });
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
	sendVoiceNotification({ title: 'Voice Inbox', message: 'Transcript saved: \'' + title + '\'', tags: ['memo'], priority: 3 });
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
		const raw = await classifyForPipeline({
			prompt,
			model: getOrganizeModel(),
			timeoutMs: 60_000,
			maxRawBytes: 2048
		});
		const parsed = JSON.parse(raw);
		const title = typeof parsed.title === 'string' ? parsed.title.trim() : '';
		return title;
	} catch (e) {
		vlog(`[title] ERROR: ${e instanceof Error ? e.message : String(e)}`);
		return '';
	}
}
