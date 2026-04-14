// lib/task-statuses.js
// Canonical source of truth for all task status logic.
// Import from this file anywhere status sets are needed.

export const ALL_STATUSES = [
	'open', 'in_progress', 'waiting', 'blocked',
	'submitted', 'accepted', 'deployed', 'closed', 'dev'
];

// Work is permanently done — no further transitions expected
export const TERMINAL_STATUSES = new Set(['closed']);

// Work is paused, not done — will resume
export const PAUSED_STATUSES = new Set(['waiting', 'blocked']);

// Ball is in someone else's court — they should see a notification/indicator
export const ACTIONABLE_BY_OTHER = new Set(['waiting', 'submitted']);

// Not visible to clients/external users
export const INTERNAL_STATUSES = new Set(['dev']);

// Agent queue: statuses where an agent should pick up work
export const AGENT_WORKABLE = new Set(['open', 'in_progress']);

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
