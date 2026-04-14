/**
 * Canonical task status definitions for the IDE.
 * Mirrors lib/task-statuses.js with TypeScript types.
 * Import from this file in all Svelte components.
 */

export type TaskStatus =
	| 'open'
	| 'in_progress'
	| 'waiting'
	| 'blocked'
	| 'submitted'
	| 'accepted'
	| 'deployed'
	| 'closed'
	| 'dev';

// All valid statuses in lifecycle order
export const ALL_STATUSES: TaskStatus[] = [
	'open', 'in_progress', 'waiting', 'blocked',
	'submitted', 'accepted', 'deployed', 'closed', 'dev'
];

// Work is permanently done — no further transitions expected
export const TERMINAL_STATUSES = new Set<TaskStatus>(['closed']);

// Work is paused, not done — will resume
export const PAUSED_STATUSES = new Set<TaskStatus>(['waiting', 'blocked']);

// Ball is in someone else's court — they should see a notification/indicator
export const ACTIONABLE_BY_OTHER = new Set<TaskStatus>(['waiting', 'submitted']);

// Not visible to clients/external users
export const INTERNAL_STATUSES = new Set<TaskStatus>(['dev']);

// Agent queue: statuses where an agent should pick up work
export const AGENT_WORKABLE = new Set<TaskStatus>(['open', 'in_progress']);

// Dropdown options for status pickers — all statuses with display labels
export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
	{ value: 'open', label: 'Open' },
	{ value: 'in_progress', label: 'In Progress' },
	{ value: 'waiting', label: 'Waiting' },
	{ value: 'blocked', label: 'Blocked' },
	{ value: 'submitted', label: 'Submitted' },
	{ value: 'accepted', label: 'Accepted' },
	{ value: 'deployed', label: 'Deployed' },
	{ value: 'closed', label: 'Closed' },
	{ value: 'dev', label: 'Dev' }
];

// Status lifecycle:
//
//   open → in_progress ⟷ waiting    (counterparty input needed)
//                    ↘ blocked       (external dependency)
//                    → submitted     (ready for review)
//                    → accepted      (stakeholder approved)
//                    → deployed      (shipped)
//                    → closed        (archived)
//
//   dev = internal/hidden at any point
