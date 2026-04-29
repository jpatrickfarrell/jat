/**
 * Push-to-talk voice capture store.
 *
 * Usage:
 *   - Call startCapture() on keydown of the push-to-talk hotkey.
 *   - Call stopCapture() on keyup.
 *   - Call cancelCapture() to abort without transcribing.
 *   - Read voiceState, transcript, and micPermission reactively.
 *
 * State flow for consequential tools (create_task / view_task / spawn_agent):
 *   transcribing → preview (3s countdown, cancellable) → executing (step-by-step) → matched
 *
 * Transcription is delegated to the voice subsystem (`voice.transcribe(blob)`)
 * which routes to the active STT provider (voxtype by default). The matcher
 * (`ide/src/lib/voice/utteranceMatcher.ts`) then runs against the current
 * route's vocabulary; matches above MATCH_CONFIDENCE_THRESHOLD dispatch via
 * the voice action registry (same code path as a keystroke), otherwise the
 * raw transcript surfaces so the user can see why.
 */
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { openMobileSessionName } from '$lib/stores/drawerStore';
import {
	matchUtterance,
	MATCH_CONFIDENCE_THRESHOLD,
	type MatchResult
} from '$lib/voice/utteranceMatcher';
import { getVocabularyForRoute } from '$lib/stores/voiceVocabulary.svelte';
import { dispatchMatch } from '$lib/voice/dispatchMatch';
import { recordMatch } from '$lib/voice/matchDebugBuffer';
import { voice } from '$lib/voice/voiceSubsystem.svelte';

export type VoiceState = 'idle' | 'listening' | 'transcribing' | 'preview' | 'executing' | 'matched' | 'no-match';
export type MicPermission = 'unknown' | 'granted' | 'denied';
export type StepStatus = 'pending' | 'running' | 'done' | 'error';

export interface ToolStep {
	name: string;
	label: string;
	status: StepStatus;
}

// Reactive state
let voiceState = $state<VoiceState>('idle');
let transcript = $state('');
let micPermission = $state<MicPermission>('unknown');
let errorMessage = $state('');
let lastMatch = $state<MatchResult | null>(null);
let lastToolResults = $state<Array<{ tool: string; label: string; id?: string }>>([]);
// Per-step execution state for preview/executing display
let toolSteps = $state<ToolStep[]>([]);
// Task ID waiting to be opened in the detail drawer (consumed by VoiceIndicator)
let pendingOpenTaskId = $state<string | null>(null);

// Internal recording state
let mediaRecorder: MediaRecorder | null = null;
let chunks: Blob[] = [];
let cancelled = false;
let stream: MediaStream | null = null;
let autoStopTimer: ReturnType<typeof setTimeout> | null = null;

// Internal preview state (non-reactive — only toolSteps / voiceState surface externally)
let pendingCalls: Array<{ name: string; input: Record<string, unknown> }> = [];
let pendingRoute = '';
let pendingVocabulary: ReturnType<typeof getVocabularyForRoute> = [];
let previewTimer: ReturnType<typeof setTimeout> | null = null;

const CONSEQUENTIAL_TOOLS = new Set(['create_task', 'view_task', 'spawn_agent']);

export function getVoiceState(): VoiceState { return voiceState; }
export function getTranscript(): string { return transcript; }
export function getMicPermission(): MicPermission { return micPermission; }
export function getErrorMessage(): string { return errorMessage; }
export function getLastMatch(): MatchResult | null { return lastMatch; }
export function getLastToolResults(): Array<{ tool: string; label: string; id?: string }> { return lastToolResults; }
export function getToolSteps(): ToolStep[] { return toolSteps; }
export function getPendingOpenTaskId(): string | null { return pendingOpenTaskId; }
export function clearPendingOpenTaskId(): void { pendingOpenTaskId = null; }

export function cancelPendingExecution(): void {
	if (previewTimer) { clearTimeout(previewTimer); previewTimer = null; }
	pendingCalls = [];
	pendingVocabulary = [];
	pendingRoute = '';
	toolSteps = [];
	voiceState = 'idle';
	transcript = '';
	errorMessage = '';
}

export async function startCapture(): Promise<void> {
	if (!browser) return;
	if (!voice.enabled) return;
	if (voiceState === 'listening') return;
	if (voice.sttProviders.length === 0) {
		errorMessage = 'Voice initializing — try again in a moment';
		voiceState = 'no-match';
		scheduleReset(2000);
		// Kick off a background reprobe so the next press succeeds
		void voice.reprobe();
		return;
	}

	cancelled = false;
	transcript = '';
	errorMessage = '';

	// Request mic access
	try {
		stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		micPermission = 'granted';
	} catch {
		micPermission = 'denied';
		errorMessage = 'Microphone access denied. Enable microphone permission to use push-to-talk.';
		return;
	}

	chunks = [];
	mediaRecorder = new MediaRecorder(stream, { mimeType: getSupportedMimeType() });

	mediaRecorder.ondataavailable = (e) => {
		if (e.data.size > 0) chunks.push(e.data);
	};

	mediaRecorder.onstop = async () => {
		stopStream();
		if (cancelled || chunks.length === 0) {
			voiceState = 'idle';
			return;
		}

		voiceState = 'transcribing';

		const mimeType = mediaRecorder?.mimeType || 'audio/webm';
		const blob = new Blob(chunks, { type: mimeType });
		chunks = [];

		try {
			const transcribeResult = await voice.transcribe(blob);
			const text = (transcribeResult.transcript ?? '').trim();

			if (!text) {
				lastMatch = null;
				voiceState = 'no-match';
				scheduleReset();
				return;
			}

			transcript = text;

			const route = typeof window !== 'undefined' ? window.location.pathname : '';
			const vocabulary = getVocabularyForRoute(route);

			// Try LLM dispatch first (5s timeout). Falls back to fuzzy on any failure.
			const llmResult = await llmDispatch(text, route);

			if (llmResult?.toolCalls?.length) {
				const hasConsequential = llmResult.toolCalls.some(c => CONSEQUENTIAL_TOOLS.has(c.name));

				if (hasConsequential) {
					// Enter preview state — show planned steps with 3s cancel countdown
					pendingCalls = llmResult.toolCalls;
					pendingRoute = route;
					pendingVocabulary = vocabulary;
					toolSteps = llmResult.toolCalls.map(call => ({
						name: call.name,
						label: makeStepLabel(call),
						status: 'pending' as StepStatus
					}));
					voiceState = 'preview';
					if (previewTimer) clearTimeout(previewTimer);
					previewTimer = setTimeout(() => {
						previewTimer = null;
						void executePendingCalls();
					}, 3000);
					return;
				}

				// Immediate tools only (navigate / vocab / search) — execute without preview
				for (const call of llmResult.toolCalls) {
					if (call.name === 'navigate' && typeof call.input.route === 'string') {
						await goto(call.input.route);

					} else if (call.name === 'vocab') {
						const shortcut = call.input.shortcut as string;
						const action = call.input.action as string | undefined;
						const phrase = call.input.phrase as string | undefined;
						const entry = vocabulary.find(
							(e) =>
								(action && e.action === action) ||
								(e.shortcut === shortcut && (!phrase || e.phrase === phrase))
						);
						if (entry) {
							const dispatched = await dispatchMatch(entry);
							lastMatch = { entry, confidence: 1, raw: text, normalized: text.toLowerCase().trim(), reason: 'exact-phrase' };
							recordMatch(lastMatch, route, dispatched);
						}

					} else if (call.name === 'search' && typeof call.input.query === 'string') {
						await goto(`/search?q=${encodeURIComponent(call.input.query)}`);
					}
				}

				lastToolResults = [];
				voiceState = 'matched';
				scheduleReset();
				return;
			}

			// Fuzzy fallback
			const matchResult = matchUtterance(text, vocabulary);
			lastMatch = matchResult;

			if (matchResult.entry && matchResult.confidence >= MATCH_CONFIDENCE_THRESHOLD) {
				const dispatched = await dispatchMatch(matchResult.entry);
				recordMatch(matchResult, route, dispatched);
				voiceState = 'matched';
			} else {
				recordMatch(matchResult, route, 'none');
				voiceState = 'no-match';
			}

			scheduleReset();
		} catch (e: unknown) {
			errorMessage = e instanceof Error ? e.message : 'Transcription failed';
			voiceState = 'no-match';
			scheduleReset();
		}
	};

	mediaRecorder.start();
	voiceState = 'listening';

	// Fallback: auto-stop after 30s in case keyup never fires
	autoStopTimer = setTimeout(() => stopCapture(), 30_000);
}

export function stopCapture(): void {
	clearAutoStop();
	if (mediaRecorder && mediaRecorder.state === 'recording') {
		mediaRecorder.stop();
	} else {
		stopStream();
		voiceState = 'idle';
	}
}

export function cancelCapture(): void {
	clearAutoStop();
	cancelled = true;
	if (mediaRecorder && mediaRecorder.state === 'recording') {
		mediaRecorder.stop();
	} else {
		stopStream();
		voiceState = 'idle';
	}
}

export function resetVoiceState(): void {
	voiceState = 'idle';
	transcript = '';
	errorMessage = '';
	lastMatch = null;
	lastToolResults = [];
	toolSteps = [];
	pendingOpenTaskId = null;
	if (previewTimer) { clearTimeout(previewTimer); previewTimer = null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// Preview / execution helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeStepLabel(call: { name: string; input: Record<string, unknown> }): string {
	const { name, input } = call;
	if (name === 'create_task') {
		const type = typeof input.type === 'string' ? input.type : 'task';
		const pri = typeof input.priority === 'string' ? ` [${input.priority}]` : '';
		return `Create ${type}: ${input.title as string}${pri}`;
	}
	if (name === 'view_task') return `Open: ${input.title as string}`;
	if (name === 'spawn_agent') return `Spawn agent: ${input.title as string}`;
	if (name === 'navigate') {
		const r = (input.route as string).replace(/^\//, '');
		return `Go to ${r || 'home'}`;
	}
	if (name === 'search') return `Search: ${input.query as string}`;
	if (name === 'vocab') {
		return (input.phrase as string | undefined)
			?? (input.action as string | undefined)
			?? (input.shortcut as string | undefined)
			?? name;
	}
	return name;
}

function updateStepStatus(index: number, status: StepStatus): void {
	toolSteps = toolSteps.map((s, i) => i === index ? { ...s, status } : s);
}

async function executePendingCalls(): Promise<void> {
	if (!pendingCalls.length || voiceState === 'idle') return;

	voiceState = 'executing';

	const calls = [...pendingCalls];
	const route = pendingRoute;
	const vocabulary = pendingVocabulary;
	const text = transcript;

	const results: Array<{ tool: string; label: string; id?: string }> = [];
	const sessionCreatedTaskIds = new Map<string, string>();

	for (let i = 0; i < calls.length; i++) {
		if (voiceState !== 'executing') break; // cancelled mid-execution

		const call = calls[i];
		updateStepStatus(i, 'running');

		try {
			if (call.name === 'navigate' && typeof call.input.route === 'string') {
				await goto(call.input.route);

			} else if (call.name === 'vocab') {
				const shortcut = call.input.shortcut as string;
				const action = call.input.action as string | undefined;
				const phrase = call.input.phrase as string | undefined;
				const entry = vocabulary.find(
					(e) =>
						(action && e.action === action) ||
						(e.shortcut === shortcut && (!phrase || e.phrase === phrase))
				);
				if (entry) {
					const dispatched = await dispatchMatch(entry);
					lastMatch = { entry, confidence: 1, raw: text, normalized: text.toLowerCase().trim(), reason: 'exact-phrase' };
					recordMatch(lastMatch, route, dispatched);
				}

			} else if (call.name === 'create_task' && typeof call.input.title === 'string') {
				const r = await createTaskFromVoice(
					call.input.title,
					call.input.type as string | undefined,
					call.input.priority as string | undefined,
					call.input.project as string | undefined
				);
				results.push(r);
				if (r.id) sessionCreatedTaskIds.set(call.input.title.toLowerCase(), r.id);

			} else if (call.name === 'view_task' && typeof call.input.title === 'string') {
				const r = await viewTaskFromVoice(call.input.title, sessionCreatedTaskIds);
				results.push(r);

			} else if (call.name === 'spawn_agent' && typeof call.input.title === 'string') {
				const r = await spawnAgentFromVoice(
					call.input.title,
					call.input.model as string | undefined,
					sessionCreatedTaskIds
				);
				results.push(r);

			} else if (call.name === 'search' && typeof call.input.query === 'string') {
				await goto(`/search?q=${encodeURIComponent(call.input.query)}`);
			}

			updateStepStatus(i, 'done');
		} catch {
			updateStepStatus(i, 'error');
		}

		// Brief pause between steps so the user can watch the animation
		if (i < calls.length - 1) {
			await new Promise<void>(res => setTimeout(res, 350));
		}
	}

	if (voiceState === 'executing') {
		lastToolResults = results;
		voiceState = 'matched';
		scheduleReset();
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal utilities
// ─────────────────────────────────────────────────────────────────────────────

function clearAutoStop(): void {
	if (autoStopTimer) {
		clearTimeout(autoStopTimer);
		autoStopTimer = null;
	}
}

function stopStream(): void {
	if (stream) {
		stream.getTracks().forEach(t => t.stop());
		stream = null;
	}
}

function scheduleReset(ms = 3000): void {
	setTimeout(() => {
		if (voiceState === 'matched' || voiceState === 'no-match') {
			voiceState = 'idle';
			transcript = '';
			errorMessage = '';
			lastMatch = null;
			lastToolResults = [];
			toolSteps = [];
		}
	}, ms);
}

function getSupportedMimeType(): string {
	const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg'];
	for (const type of candidates) {
		if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
			return type;
		}
	}
	return '';
}

interface LlmDispatchResult {
	toolCalls: Array<{ name: string; input: Record<string, unknown> }>;
	providerLatencyMs?: number;
	provider?: string;
}

// Convert "P0"–"P4" string to integer priority. Returns 2 (P2=medium) if unrecognized.
function priorityStringToInt(p: string | undefined): number {
	if (!p) return 2;
	const n = parseInt(p.replace(/^P/i, ''));
	return isNaN(n) || n < 0 || n > 4 ? 2 : n;
}

// POST /api/tasks to create a task from a voice utterance.
async function createTaskFromVoice(
	title: string,
	type: string | undefined,
	priorityStr: string | undefined,
	project: string | undefined
): Promise<{ tool: string; label: string; id?: string }> {
	try {
		const res = await fetch('/api/tasks', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				title,
				type: type ?? 'task',
				priority: priorityStringToInt(priorityStr),
				project: project ?? 'jat'
			})
		});
		if (res.ok) {
			const data = (await res.json()) as { task?: { id?: string } };
			const id = data?.task?.id;
			return { tool: 'create_task', label: title, id };
		}
	} catch {
		// swallow — indicator will show title without id
	}
	return { tool: 'create_task', label: title };
}

// Find task by title: reuse same-utterance ID from sessionCreatedTaskIds first,
// then fall back to searching /api/tasks.
async function findTaskIdByTitle(
	title: string,
	sessionCreatedTaskIds: Map<string, string>
): Promise<string | undefined> {
	const existing = sessionCreatedTaskIds.get(title.toLowerCase());
	if (existing) return existing;
	try {
		const res = await fetch(`/api/tasks?search=${encodeURIComponent(title)}&limit=5`);
		if (res.ok) {
			const data = (await res.json()) as { tasks?: Array<{ id?: string; title?: string }> };
			const tasks = data?.tasks ?? [];
			const exact = tasks.find((t) => t.title?.toLowerCase() === title.toLowerCase());
			return (exact ?? tasks[0])?.id;
		}
	} catch { /* swallow */ }
	return undefined;
}

// Open task detail drawer for a task by title.
async function viewTaskFromVoice(
	title: string,
	sessionCreatedTaskIds: Map<string, string>
): Promise<{ tool: string; label: string; id?: string }> {
	const id = await findTaskIdByTitle(title, sessionCreatedTaskIds);
	if (id) pendingOpenTaskId = id;
	return { tool: 'view_task', label: title, id };
}

// Spawn an agent for a task by title, then open its live session drawer.
async function spawnAgentFromVoice(
	title: string,
	model: string | undefined,
	sessionCreatedTaskIds: Map<string, string>
): Promise<{ tool: string; label: string; id?: string }> {
	const taskId = await findTaskIdByTitle(title, sessionCreatedTaskIds);
	if (!taskId) return { tool: 'spawn_agent', label: title };
	try {
		const body: Record<string, unknown> = { taskId };
		if (model) body.model = model;
		const res = await fetch('/api/work/spawn', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
		if (res.ok) {
			const data = (await res.json()) as { session?: { sessionName?: string } };
			const sessionName = data?.session?.sessionName;
			if (sessionName) openMobileSessionName.set(sessionName);
			return { tool: 'spawn_agent', label: title, id: taskId };
		}
	} catch { /* swallow */ }
	return { tool: 'spawn_agent', label: title, id: taskId };
}

// Call /api/voice/dispatch. Returns null on any error so the caller falls
// back to fuzzy matching without surfacing an error to the user.
async function llmDispatch(transcript: string, route: string): Promise<LlmDispatchResult | null> {
	if (!browser) return null;
	try {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 12000);
		const res = await fetch('/api/voice/dispatch', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ transcript, route }),
			signal: controller.signal
		});
		clearTimeout(timer);
		if (!res.ok) return null;
		const data = (await res.json()) as LlmDispatchResult & { error?: string };
		if (data.error) return null;
		return data;
	} catch {
		return null;
	}
}
