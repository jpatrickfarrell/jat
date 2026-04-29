/**
 * Parameterized voice verb display metadata.
 *
 * The LLM-facing tool definitions (JSON schemas + LLM-targeted descriptions)
 * live alongside the dispatch handler in
 * `src/routes/api/voice/dispatch/+server.ts` (`VOICE_TOOLS`). This module
 * holds the *user-facing* counterpart: a short label, plain-English description,
 * and a few example utterances shown in `VoiceVocabSheet.svelte` and the
 * `/config` voice docs page.
 *
 * Single source of truth for verb *names* is enforced by
 * `dispatch.test.ts` — every entry in this list must match a tool in
 * `VOICE_TOOLS`, and every Phase 2 tool must appear here.
 *
 * Browser-safe: no node:* imports, no Svelte runtime dependencies.
 */

export interface ParameterizedVerb {
	/** Tool name as registered in VOICE_TOOLS (snake_case). */
	toolName: string;
	/** Short user-facing label, e.g. "Create task". */
	label: string;
	/** One-line plain-English description of what saying this does. */
	description: string;
	/** A few example utterances users can say. Keep concise — 2–4 each. */
	examples: string[];
	/** Whether the verb triggers a confirmation overlay client-side. */
	destructive: boolean;
	/** Phase the verb shipped in (1 = launch, 2 = parameterized verbs expansion). */
	phase: 1 | 2;
}

export const PARAMETERIZED_VERBS: ParameterizedVerb[] = [
	// ── Phase 1 ────────────────────────────────────────────────────────────
	{
		toolName: 'create_task',
		label: 'Create task',
		description: 'Create a new task, bug, feature, chore, or epic.',
		examples: [
			'Create a bug for the login crash',
			'Add a P1 task: refactor the auth flow',
			'New feature in the flush project: dark mode'
		],
		destructive: false,
		phase: 1
	},
	{
		toolName: 'view_task',
		label: 'Open task details',
		description: 'Open the detail drawer for a task you just created or named.',
		examples: ['Open the details', 'Show me that task', 'View it'],
		destructive: false,
		phase: 1
	},
	{
		toolName: 'spawn_agent',
		label: 'Spawn agent',
		description: 'Launch an agent to work on a task.',
		examples: [
			'Spawn an agent on the auth task',
			'Create a bug for the login crash and spawn an agent',
			'Have an agent work on it'
		],
		destructive: false,
		phase: 1
	},
	{
		toolName: 'navigate',
		label: 'Navigate',
		description: 'Jump to a route in the app.',
		examples: ['Go to kanban', 'Take me to tasks', 'Open the source page'],
		destructive: false,
		phase: 1
	},
	{
		toolName: 'search',
		label: 'Search',
		description: 'Open unified search with a query.',
		examples: ['Find tasks about authentication', 'Search for OAuth timeout'],
		destructive: false,
		phase: 1
	},
	// ── Phase 2 ────────────────────────────────────────────────────────────
	{
		toolName: 'close_task',
		label: 'Close task',
		description: 'Mark a task closed. Confirms before running.',
		examples: ['Close the auth task', 'Mark the login crash done'],
		destructive: true,
		phase: 2
	},
	{
		toolName: 'update_task',
		label: 'Update task',
		description: 'Change a task’s status, priority, type, or assignee.',
		examples: [
			'Set the auth task to P1',
			'Assign the login crash to Mike',
			'Mark the auth task blocked'
		],
		destructive: false,
		phase: 2
	},
	{
		toolName: 'attach_terminal',
		label: 'Attach terminal',
		description: 'Open the tmux terminal for a session. Defaults to hovered.',
		examples: ['Attach', 'Attach to the EarlyShore session'],
		destructive: false,
		phase: 2
	},
	{
		toolName: 'kill_session',
		label: 'Kill session',
		description: 'Terminate an agent session. Confirms before running.',
		examples: ['Kill the EarlyShore session', 'Kill the session'],
		destructive: true,
		phase: 2
	},
	{
		toolName: 'epic_swarm',
		label: 'Epic swarm',
		description: 'Open the swarm dialog, optionally pre-filled with epic + count.',
		examples: ['Spawn four agents on the triage epic', 'Launch a swarm'],
		destructive: false,
		phase: 2
	},
	{
		toolName: 'add_project',
		label: 'Add project',
		description: 'Open the new-project drawer, optionally with a name pre-filled.',
		examples: ['Add a new project', 'New project flush'],
		destructive: false,
		phase: 2
	}
];

/** All Phase 2 verb names. Used by tests and the docs page. */
export const PHASE_2_VERB_NAMES = PARAMETERIZED_VERBS
	.filter((v) => v.phase === 2)
	.map((v) => v.toolName);
