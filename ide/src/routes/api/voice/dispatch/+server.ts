/**
 * Voice Dispatch API — LLM-powered multi-tool command routing.
 *
 * POST /api/voice/dispatch
 * Body: { transcript: string, route: string, providerId?: string, context?: string }
 *
 * `context` is the framework-assembled context blob produced client-side via
 * `assembleContext()` (see `lib/voice/contextAssembly.ts`). It is opaque to
 * the server: we cap size as defence-in-depth and append it to the system
 * prompt as the dynamic suffix. The client trims to its configured budget
 * (default 128 KB — see CONTEXT_BUDGET_BYTES); the server's 1 MB cap is a
 * guardrail against abuse, not a meaningful limit on legitimate traffic.
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
	},
	{
		name: 'close_task',
		description:
			'Close an existing task (DESTRUCTIVE — will trigger a confirmation overlay client-side). Use when the user says "close", "close the task", "mark closed", "resolve", "mark done", "finish the task". Requires a taskId; if the user names the task by description ("the auth task") rather than ID, use that as taskId — the server-side resolver will fuzzy-match against visible tasks.',
		input_schema: {
			type: 'object',
			required: ['taskId'],
			properties: {
				taskId: { type: 'string', description: 'Task ID (e.g. jat-abc) or descriptive reference for resolver to match' },
				reason: { type: 'string', description: 'Optional close reason from the utterance' }
			}
		}
	},
	{
		name: 'update_task',
		description:
			'Modify task fields without closing. Use when the user says "set status to X", "change priority to P1", "assign to Mike", "make it a bug", "mark it blocked", "raise priority". Requires taskId. Only include fields the user explicitly named — never guess.',
		input_schema: {
			type: 'object',
			required: ['taskId'],
			properties: {
				taskId: { type: 'string', description: 'Task ID or descriptive reference for resolver' },
				status: {
					type: 'string',
					enum: ['open', 'in_progress', 'waiting', 'blocked', 'closed'],
					description: 'New status if the user named one'
				},
				priority: {
					type: 'string',
					enum: ['P0', 'P1', 'P2', 'P3', 'P4'],
					description: 'New priority if the user named one'
				},
				type: {
					type: 'string',
					enum: ['task', 'bug', 'feature', 'chore', 'epic'],
					description: 'New type if the user named one'
				},
				assignee: { type: 'string', description: 'New assignee name if the user named one' }
			}
		}
	},
	{
		name: 'attach_terminal',
		description:
			'Attach a terminal to a session. Use when the user says "attach", "attach terminal", "open the terminal", "open session terminal", "connect to". Omit sessionName if the user did not name a specific session — the client will fall back to the currently hovered session.',
		input_schema: {
			type: 'object',
			properties: {
				sessionName: { type: 'string', description: 'Session name like jat-EarlyShore — only set if the user named the session explicitly' }
			}
		}
	},
	{
		name: 'kill_session',
		description:
			'Kill an agent session (DESTRUCTIVE — will trigger a confirmation overlay client-side). Use when the user says "kill", "kill the session", "terminate", "destroy session", "end the session", "kill agent X". Omit sessionName only if the user did not name a session AND a session is hovered; otherwise sessionName is required.',
		input_schema: {
			type: 'object',
			properties: {
				sessionName: { type: 'string', description: 'Session name like jat-EarlyShore — required unless a session is hovered client-side' }
			}
		}
	},
	{
		name: 'epic_swarm',
		description:
			'Open the epic swarm modal to spawn multiple agents on an epic. Use when the user says "swarm", "epic swarm", "launch swarm", "spawn N agents on epic", "open the swarm dialog". epicTaskId is the epic to swarm on (descriptive reference is fine — resolver will fuzzy-match). agentCount is how many agents the user wants.',
		input_schema: {
			type: 'object',
			properties: {
				epicTaskId: { type: 'string', description: 'Epic task ID or descriptive reference (e.g. "the triage epic") — only set if the user named one' },
				agentCount: { type: 'integer', minimum: 1, maximum: 12, description: 'Number of agents to spawn (1–12). Only set if the user named a count.' }
			}
		}
	},
	{
		name: 'add_project',
		description:
			'Open the new-project drawer. Use when the user says "add project", "new project", "create a project", "register a project". projectName is optional and only set if the user named the project in the utterance.',
		input_schema: {
			type: 'object',
			properties: {
				projectName: { type: 'string', description: 'Project name if the user named one (lowercase, no spaces)' }
			}
		}
	}
];

// ─────────────────────────────────────────────────────────────────────────────
// Tool-call validation (Phase 2 parameterized verbs)
//
// Exported so tests can exercise it without going through a real LLM. Phase 1
// calls (create_task, view_task, spawn_agent, search) pass through unchanged
// for backwards compatibility — validation only enforces structure on the new
// parameterized verbs introduced in Phase 2.
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_ENUM = new Set(['open', 'in_progress', 'waiting', 'blocked', 'closed']);
const PRIORITY_ENUM = new Set(['P0', 'P1', 'P2', 'P3', 'P4']);
const TYPE_ENUM = new Set(['task', 'bug', 'feature', 'chore', 'epic']);

const isNonEmptyString = (v: unknown): v is string =>
	typeof v === 'string' && v.trim().length > 0;

export function isValidToolCall(
	call: { name: string; input: Record<string, unknown> },
	ctx: { validShortcuts: Set<string>; allowedRoutes: readonly string[] }
): boolean {
	if (call.name === 'vocab') {
		return ctx.validShortcuts.has(call.input.shortcut as string);
	}
	if (call.name === 'navigate') {
		const r = call.input.route as string;
		return ctx.allowedRoutes.some((known) => r === known || r?.startsWith(known + '/'));
	}
	if (call.name === 'close_task') {
		if (!isNonEmptyString(call.input.taskId)) return false;
		if (call.input.reason !== undefined && typeof call.input.reason !== 'string') return false;
		return true;
	}
	if (call.name === 'update_task') {
		if (!isNonEmptyString(call.input.taskId)) return false;
		const { status, priority, type, assignee } = call.input;
		if (status !== undefined && !STATUS_ENUM.has(status as string)) return false;
		if (priority !== undefined && !PRIORITY_ENUM.has(priority as string)) return false;
		if (type !== undefined && !TYPE_ENUM.has(type as string)) return false;
		if (assignee !== undefined && typeof assignee !== 'string') return false;
		// At least one mutating field besides taskId must be set, otherwise the call is a no-op.
		return status !== undefined || priority !== undefined || type !== undefined || assignee !== undefined;
	}
	if (call.name === 'attach_terminal') {
		if (call.input.sessionName !== undefined && typeof call.input.sessionName !== 'string') return false;
		return true;
	}
	if (call.name === 'kill_session') {
		if (call.input.sessionName !== undefined && typeof call.input.sessionName !== 'string') return false;
		return true;
	}
	if (call.name === 'epic_swarm') {
		const { epicTaskId, agentCount } = call.input;
		if (epicTaskId !== undefined && typeof epicTaskId !== 'string') return false;
		if (agentCount !== undefined) {
			if (typeof agentCount !== 'number' || !Number.isInteger(agentCount)) return false;
			if (agentCount < 1 || agentCount > 12) return false;
		}
		return true;
	}
	if (call.name === 'add_project') {
		if (call.input.projectName !== undefined && typeof call.input.projectName !== 'string') return false;
		return true;
	}
	return true; // create_task, search, view_task, spawn_agent always pass through (Phase 1 backwards-compat)
}

export const ALL_VOICE_TOOLS = VOICE_TOOLS;

// ─────────────────────────────────────────────────────────────────────────────
// System prompt builder
// ─────────────────────────────────────────────────────────────────────────────

/** Server-side cap on the context blob (defence-in-depth; client default is 128 KB). */
const MAX_CONTEXT_BYTES = 1024 * 1024;

function buildSystemPrompt(
	entries: ReturnType<typeof filterByRoute>,
	currentRoute: string,
	context: string | null
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
- close_task: "close", "close the task", "mark closed", "resolve", "mark done" applied to an EXISTING task (not the just-created one). Always include taskId — pass the user's descriptive reference verbatim if no ID is given
- update_task: "set status to X", "change priority", "assign to", "make it P1", "raise priority", "mark blocked" — only include fields the user explicitly named
- attach_terminal: "attach", "open terminal", "attach terminal", "open the session terminal" — omit sessionName when the user did not name one
- kill_session: "kill", "kill the session", "terminate", "destroy session", "end the session" — omit sessionName ONLY if the user did not name one
- epic_swarm: "swarm", "epic swarm", "spawn N agents on the epic", "launch swarm" — set agentCount when the user named a count, set epicTaskId when they named an epic
- add_project: "add project", "new project", "register a project"
- navigate: "go to", "take me to", "open [route]"
- search: "find", "search for", "look up"
- vocab: matches a listed shortcut command

COMPOUND UTTERANCE RULE: When the user chains actions, you MUST emit ALL matching tool calls in a single response. Never stop at the first match. Each tool that matches must appear.

TITLE PROPAGATION RULE: When spawn_agent or view_task follow create_task in the same utterance and no different title is mentioned, they MUST use the same title as create_task. "Spawn an agent" after "create X" means spawn_agent(title="X").

DESTRUCTIVE ACTIONS: close_task and kill_session are destructive — always emit them when the user clearly asks; the client overlays a confirmation dialog before execution. Never refuse on safety grounds; the user is in control.

PARAM HONESTY: For close_task / update_task / kill_session / attach_terminal / epic_swarm / add_project, only include parameters the user explicitly stated. Do NOT invent taskIds, sessionNames, projects, priorities, or counts. Omitted optional params are better than guessed ones.

EXAMPLE A — "Create a bug for the login crash and spawn an agent":
  → create_task(title="login crash", type="bug")
  → spawn_agent(title="login crash")
Both tools must fire. spawn_agent uses the same title as create_task.

EXAMPLE B — "Create a bug for the login crash, open the details, and spawn an agent":
  → create_task(title="login crash", type="bug")
  → view_task(title="login crash")
  → spawn_agent(title="login crash")
All three tools must fire. Omitting any is incorrect.

EXAMPLE C — "Close the auth task":
  → close_task(taskId="the auth task")
The descriptive reference is passed through verbatim — server-side resolver matches against visible tasks.

EXAMPLE D — "Set the auth task to P1 and assign it to Mike":
  → update_task(taskId="the auth task", priority="P1", assignee="Mike")
One update_task call; both fields included because both were named.

EXAMPLE E — "Spawn four agents on the triage epic":
  → epic_swarm(epicTaskId="the triage epic", agentCount=4)

EXAMPLE F — "Kill the EarlyShore session":
  → kill_session(sessionName="jat-EarlyShore")
Session-named kills always include sessionName; the EarlyShore agent name maps to the jat-EarlyShore tmux session.

EXAMPLE G — "Attach":
  → attach_terminal()
No sessionName — client will use the hovered session.${context ? `\n\n--- App Context (JSON, ≤4KB after client trim) ---\n${context}` : ''}`;
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

	const b = body as {
		transcript?: unknown;
		route?: unknown;
		providerId?: unknown;
		context?: unknown;
	};

	if (typeof b.transcript !== 'string' || !b.transcript.trim()) {
		return json({ error: 'transcript is required' }, { status: 400 });
	}

	const transcript = b.transcript.trim();
	const route = typeof b.route === 'string' && b.route ? b.route : '/';
	const requestedProvider = typeof b.providerId === 'string' ? b.providerId : undefined;

	// Optional client-assembled context blob (PRD §5.4). Capped server-side as
	// defence-in-depth; the client framework already trims to 4 KB.
	let context: string | null = null;
	if (typeof b.context === 'string' && b.context.length > 0) {
		const bytes = Buffer.byteLength(b.context, 'utf-8');
		context = bytes <= MAX_CONTEXT_BYTES ? b.context : null;
	}

	const config = await readVoiceConfig();
	const candidate = await selectProvider(requestedProvider, config);

	if (!candidate) {
		// No provider available — client will fall back to fuzzy matching
		return json({ toolCalls: [], error: 'no_provider' });
	}

	const vocabulary = filterByRoute(buildStaticVocabulary(), route);
	const systemPrompt = buildSystemPrompt(vocabulary, route, context);

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

	// Validate tool calls. Reject malformed param slots so downstream consumers
	// can trust the shape of every accepted call. Phase 1 calls (create_task,
	// view_task, spawn_agent, navigate, search, vocab) keep their original
	// behavior; Phase 2 parameterized verbs enforce required fields and enum
	// constraints declared in the tool schemas above.
	const validShortcuts = new Set(vocabulary.map((e) => e.shortcut));
	const validatedCalls = dispatchResult.toolCalls.filter((call) =>
		isValidToolCall(call, { validShortcuts, allowedRoutes: ALL_ROUTES })
	);

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
