/**
 * Voice Dispatch API — LLM-powered multi-tool command routing.
 *
 * POST /api/voice/dispatch
 * Body: { transcript: string, route: string, providerId?: string }
 *
 * Returns:
 *   { toolCalls: ToolCall[], providerLatencyMs: number, provider: string }
 *   { toolCalls: [], error: string }  (4xx / 5xx)
 *
 * The LLM may return multiple tool calls in a single response, enabling
 * compound utterances like "create a P1 bug for the checkout crash and go to
 * kanban" to execute both actions.
 *
 * Provider priority (auto-selected unless providerId is passed):
 *   1. Anthropic Haiku  — native tool use, best structured output, ~500ms
 *   2. Ollama           — local, free; needs model configured
 *   3. OpenAI           — cloud fallback
 */
import { json } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import anthropicProvider from '$lib/voice/providers/anthropic';
import ollamaProvider from '$lib/voice/providers/ollama';
import { openaiIntentProvider } from '$lib/voice/providers/openai';
import { buildStaticVocabulary, filterByRoute } from '$lib/voice/vocabularyData';
import { recordCloudCall } from '$lib/voice/auditLog';
import type { IntentProvider, VoiceTool } from '$lib/voice/types';

const VOICE_CONFIG_PATH = join(homedir(), '.config', 'jat', 'voice.json');

const ALL_ROUTES = [
	'/triage', '/kanban', '/tasks', '/work', '/files', '/source', '/data',
	'/workflows', '/automation', '/servers', '/memory', '/chores',
	'/integrations', '/clients', '/dash', '/search', '/agents', '/config'
];

interface VoiceConfig {
	activeLlm?: string;
	providerOverrides?: Record<string, { model?: string; timeoutMs?: number }>;
}

async function readVoiceConfig(): Promise<VoiceConfig> {
	if (!existsSync(VOICE_CONFIG_PATH)) return {};
	try {
		return JSON.parse(await readFile(VOICE_CONFIG_PATH, 'utf-8')) as VoiceConfig;
	} catch {
		return {};
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool catalog — one entry per capability
// ─────────────────────────────────────────────────────────────────────────────

const VOICE_TOOLS: VoiceTool[] = [
	{
		name: 'create_task',
		description:
			'Create a new task, bug, feature, chore, or epic. Use when the user says "create", "add", "log", "new task/bug/feature", etc. Extract the title from the utterance without project/priority qualifiers. Infer type: bug/issue/error/crash → bug; feature/add/implement/build → feature; chore/recurring → chore; otherwise → task. Set project if user says "in project X" or "in the X project" (lowercase). Set priority only if explicitly stated (P0/critical/high/P1/etc).',
		input_schema: {
			type: 'object',
			required: ['title'],
			properties: {
				title: { type: 'string', description: 'Task title without project or priority qualifiers' },
				type: { type: 'string', enum: ['task', 'bug', 'feature', 'chore', 'epic'] },
				priority: {
					type: 'string',
					enum: ['P0', 'P1', 'P2', 'P3', 'P4'],
					description: 'Only if explicitly stated'
				},
				project: {
					type: 'string',
					description: 'Lowercase project name if stated in utterance'
				}
			}
		}
	},
	{
		name: 'navigate',
		description:
			'Navigate to a route in the app. Use when the user says "go to", "show me", "open", "take me to", or "navigate to". Route must be one of the navigable routes listed in context.',
		input_schema: {
			type: 'object',
			required: ['route'],
			properties: {
				route: { type: 'string', description: 'Route path e.g. /kanban, /tasks, /files' }
			}
		}
	},
	{
		name: 'search',
		description:
			'Search tasks or content. Use when the user says "find", "search for", "look up", "show me tasks about", "filter by".',
		input_schema: {
			type: 'object',
			required: ['query'],
			properties: {
				query: { type: 'string', description: 'The search query' }
			}
		}
	},
	{
		name: 'vocab',
		description:
			'Execute a keyboard shortcut or registered voice command from the AVAILABLE SHORTCUTS list. Use when the utterance matches a listed command or a natural variation of it.',
		input_schema: {
			type: 'object',
			required: ['shortcut'],
			properties: {
				shortcut: { type: 'string', description: 'Keyboard shortcut string' },
				action: { type: 'string', description: 'Action ID if the entry has one' },
				phrase: { type: 'string', description: 'Matched vocabulary phrase' }
			}
		}
	},
	{
		name: 'view_task',
		description:
			'Open the detail drawer for a task. Use when the user says "open it", "open the details", "show details", "view the task", "open that" — especially after creating a task in the same utterance. Use the exact title from the create_task call when referring to a just-created task.',
		input_schema: {
			type: 'object',
			required: ['title'],
			properties: {
				title: { type: 'string', description: 'Title of the task to open' }
			}
		}
	},
	{
		name: 'spawn_agent',
		description:
			'Spawn an agent to work on a task. Use when the user says "spawn an agent", "launch an agent", "start an agent", "have an agent work on it", "assign to agent", "start working on it", "run an agent on it". IMPORTANT: when the user says "spawn an agent" without naming a task, use the title of the most recently created or mentioned task in the same utterance. If a create_task call was made in this response, reuse that exact title here.',
		input_schema: {
			type: 'object',
			required: ['title'],
			properties: {
				title: { type: 'string', description: 'Title of the task — copy from create_task title if one was just created in this response' },
				model: { type: 'string', description: 'Optional model override (opus/sonnet/haiku)' }
			}
		}
	}
];

// ─────────────────────────────────────────────────────────────────────────────
// System prompt builder
// ─────────────────────────────────────────────────────────────────────────────

function buildSystemPrompt(
	entries: ReturnType<typeof filterByRoute>,
	currentRoute: string
): string {
	const commandLines = entries
		.map((e) => {
			const extras = e.aliases.slice(0, 4).map((a) => `"${a}"`).join(', ');
			const hint = extras ? ` (also: ${extras})` : '';
			const actionNote = e.action ? ` [action=${e.action}]` : '';
			return `  • "${e.phrase}"${hint}  →  shortcut="${e.shortcut}"${actionNote}`;
		})
		.join('\n');

	return `You are a voice command dispatcher for JAT IDE.
Current route: "${currentRoute}"

AVAILABLE SHORTCUTS on this route (for the vocab tool):
${commandLines || '  (none on this route)'}

NAVIGABLE ROUTES (for the navigate tool): ${ALL_ROUTES.join(', ')}

TOOL SELECTION RULES — apply ALL that match, in order:
- create_task: "create", "add", "log", "new task/bug/feature"
- view_task: "open the details", "open it", "show details", "view it", "open that" — refers to a task just created or named in the same utterance
- spawn_agent: "spawn", "launch", "start an agent", "have an agent work on it", "assign to agent", "run an agent" — refers to a task just created or named in the same utterance; REUSE the title from create_task if one is in this response
- navigate: "go to", "take me to", "open [route]"
- search: "find", "search for", "look up"
- vocab: matches a listed shortcut command

COMPOUND UTTERANCE RULE: When the user chains actions, you MUST emit ALL matching tool calls in a single response. Never stop at the first match. Each tool that matches must appear.

TITLE PROPAGATION RULE: When spawn_agent or view_task follow create_task in the same utterance and no different title is mentioned, they MUST use the same title as create_task. "Spawn an agent" after "create X" means spawn_agent(title="X").

EXAMPLE A — "Create a bug for the login crash and spawn an agent":
  → create_task(title="login crash", type="bug")
  → spawn_agent(title="login crash")
Both tools must fire. spawn_agent uses the same title as create_task.

EXAMPLE B — "Create a bug for the login crash, open the details, and spawn an agent":
  → create_task(title="login crash", type="bug")
  → view_task(title="login crash")
  → spawn_agent(title="login crash")
All three tools must fire. Omitting any is incorrect.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider selection
// ─────────────────────────────────────────────────────────────────────────────

interface ProviderCandidate {
	provider: IntentProvider;
	model: string;
	label: string;
}

async function selectProvider(
	requestedId: string | undefined,
	config: VoiceConfig
): Promise<ProviderCandidate | null> {
	// Explicit override from caller
	if (requestedId) {
		if (requestedId === 'anthropic') {
			const a = await anthropicProvider.isAvailable();
			if (a.ok) {
				const model = config.providerOverrides?.anthropic?.model ?? 'claude-haiku-4-5-20251001';
				return { provider: anthropicProvider, model, label: 'anthropic' };
			}
		}
		if (requestedId === 'ollama') {
			const model = config.providerOverrides?.ollama?.model;
			if (model) {
				return { provider: ollamaProvider, model, label: 'ollama' };
			}
		}
		if (requestedId === 'openai') {
			const o = await openaiIntentProvider.isAvailable();
			if (o.ok) {
				const model = config.providerOverrides?.openai?.model ?? 'gpt-4o-mini';
				return { provider: openaiIntentProvider, model, label: 'openai' };
			}
		}
		return null;
	}

	// Auto-select: Anthropic → Ollama → OpenAI
	const anthropicAvail = await anthropicProvider.isAvailable();
	if (anthropicAvail.ok) {
		const model = config.providerOverrides?.anthropic?.model ?? 'claude-haiku-4-5-20251001';
		return { provider: anthropicProvider, model, label: 'anthropic' };
	}

	const ollamaModel = config.providerOverrides?.ollama?.model;
	if (ollamaModel) {
		const ollamaAvail = await ollamaProvider.isAvailable();
		if (ollamaAvail.ok) {
			return { provider: ollamaProvider, model: ollamaModel, label: 'ollama' };
		}
	}

	const openaiAvail = await openaiIntentProvider.isAvailable();
	if (openaiAvail.ok) {
		const model = config.providerOverrides?.openai?.model ?? 'gpt-4o-mini';
		return { provider: openaiIntentProvider, model, label: 'openai' };
	}

	return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST({ request }: { request: Request }) {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'invalid JSON body' }, { status: 400 });
	}

	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		return json({ error: 'body must be a JSON object' }, { status: 400 });
	}

	const b = body as { transcript?: unknown; route?: unknown; providerId?: unknown };

	if (typeof b.transcript !== 'string' || !b.transcript.trim()) {
		return json({ error: 'transcript is required' }, { status: 400 });
	}

	const transcript = b.transcript.trim();
	const route = typeof b.route === 'string' && b.route ? b.route : '/';
	const requestedProvider = typeof b.providerId === 'string' ? b.providerId : undefined;

	const config = await readVoiceConfig();
	const candidate = await selectProvider(requestedProvider, config);

	if (!candidate) {
		// No provider available — client will fall back to fuzzy matching
		return json({ toolCalls: [], error: 'no_provider' });
	}

	const vocabulary = filterByRoute(buildStaticVocabulary(), route);
	const systemPrompt = buildSystemPrompt(vocabulary, route);

	const dispatchStart = Date.now();
	let dispatchResult;
	try {
		dispatchResult = await candidate.provider.dispatch(
			transcript,
			VOICE_TOOLS,
			systemPrompt,
			candidate.model
		);
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : String(e);
		const isTimeout = /timed out|abort/i.test(msg);
		void recordCloudCall({
			provider: candidate.label,
			op: 'dispatch',
			bytes: Buffer.byteLength(transcript, 'utf-8'),
			model: candidate.model,
			ok: false,
			errorClass: isTimeout ? 'timeout' : 'provider_error',
			startedAt: dispatchStart,
			transcript,
			route
		});
		return json(
			{ toolCalls: [], error: isTimeout ? 'timeout' : 'provider_error' },
			{ status: isTimeout ? 504 : 500 }
		);
	}

	// Validate vocab tool calls: reject shortcuts not in vocabulary
	const validShortcuts = new Set(vocabulary.map((e) => e.shortcut));
	const validatedCalls = dispatchResult.toolCalls.filter((call) => {
		if (call.name === 'vocab') {
			return validShortcuts.has(call.input.shortcut as string);
		}
		if (call.name === 'navigate') {
			const r = call.input.route as string;
			return ALL_ROUTES.some((known) => r === known || r?.startsWith(known + '/'));
		}
		return true; // create_task, search always pass through
	});

	void recordCloudCall({
		provider: candidate.label,
		op: 'dispatch',
		bytes: Buffer.byteLength(transcript, 'utf-8'),
		model: candidate.model,
		ok: true,
		startedAt: dispatchStart,
		endedAt: dispatchStart + dispatchResult.providerLatencyMs,
		transcript,
		toolCalls: validatedCalls,
		route
	});

	return json({
		toolCalls: validatedCalls,
		providerLatencyMs: dispatchResult.providerLatencyMs,
		provider: candidate.label
	});
}
