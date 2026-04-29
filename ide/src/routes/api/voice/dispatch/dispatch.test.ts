// Validation tests for the Phase 2 parameterized voice dispatch verbs
// (jat-ho0mz.8). Exercises isValidToolCall against the schemas declared in
// VOICE_TOOLS without requiring a real LLM provider.

import { describe, it, expect } from 'vitest';
import { isValidToolCall, ALL_VOICE_TOOLS } from './+server';

const ctx = {
	validShortcuts: new Set(['s', 'p', 'Enter', 'Alt+N']),
	allowedRoutes: ['/tasks', '/triage', '/kanban', '/work']
};

const ok = (name: string, input: Record<string, unknown> = {}) =>
	isValidToolCall({ name, input }, ctx);

describe('VOICE_TOOLS catalog', () => {
	it('exposes the Phase 1 tools', () => {
		const names = ALL_VOICE_TOOLS.map((t) => t.name);
		expect(names).toEqual(
			expect.arrayContaining(['create_task', 'navigate', 'search', 'vocab', 'view_task', 'spawn_agent'])
		);
	});

	it('exposes the Phase 2 parameterized verbs', () => {
		const names = ALL_VOICE_TOOLS.map((t) => t.name);
		expect(names).toEqual(
			expect.arrayContaining([
				'close_task',
				'update_task',
				'attach_terminal',
				'kill_session',
				'epic_swarm',
				'add_project'
			])
		);
	});

	it('declares required taskId on close_task and update_task', () => {
		const close = ALL_VOICE_TOOLS.find((t) => t.name === 'close_task');
		const update = ALL_VOICE_TOOLS.find((t) => t.name === 'update_task');
		expect(close?.input_schema.required).toEqual(['taskId']);
		expect(update?.input_schema.required).toEqual(['taskId']);
	});
});

describe('isValidToolCall — Phase 1 backwards compatibility', () => {
	it('accepts create_task with any payload', () => {
		expect(ok('create_task', { title: 'Login crash', type: 'bug' })).toBe(true);
		expect(ok('create_task', {})).toBe(true);
	});

	it('accepts spawn_agent with any payload', () => {
		expect(ok('spawn_agent', { title: 'Login crash' })).toBe(true);
	});

	it('accepts navigate only for known routes', () => {
		expect(ok('navigate', { route: '/tasks' })).toBe(true);
		expect(ok('navigate', { route: '/tasks/jat-abc' })).toBe(true);
		expect(ok('navigate', { route: '/nope' })).toBe(false);
	});

	it('accepts vocab only for shortcuts in the active vocabulary', () => {
		expect(ok('vocab', { shortcut: 's' })).toBe(true);
		expect(ok('vocab', { shortcut: 'Q' })).toBe(false);
	});
});

describe('isValidToolCall — close_task', () => {
	it('requires taskId', () => {
		expect(ok('close_task', { taskId: 'jat-abc' })).toBe(true);
		expect(ok('close_task', {})).toBe(false);
		expect(ok('close_task', { taskId: '' })).toBe(false);
		expect(ok('close_task', { taskId: '   ' })).toBe(false);
	});

	it('rejects non-string reason', () => {
		expect(ok('close_task', { taskId: 'jat-abc', reason: 'duplicate' })).toBe(true);
		expect(ok('close_task', { taskId: 'jat-abc', reason: 42 })).toBe(false);
	});
});

describe('isValidToolCall — update_task', () => {
	it('requires taskId', () => {
		expect(ok('update_task', { status: 'blocked' })).toBe(false);
	});

	it('requires at least one mutating field', () => {
		expect(ok('update_task', { taskId: 'jat-abc' })).toBe(false);
		expect(ok('update_task', { taskId: 'jat-abc', status: 'blocked' })).toBe(true);
		expect(ok('update_task', { taskId: 'jat-abc', priority: 'P1' })).toBe(true);
		expect(ok('update_task', { taskId: 'jat-abc', type: 'bug' })).toBe(true);
		expect(ok('update_task', { taskId: 'jat-abc', assignee: 'Mike' })).toBe(true);
	});

	it('rejects unknown enum values', () => {
		expect(ok('update_task', { taskId: 'jat-abc', status: 'pending' })).toBe(false);
		expect(ok('update_task', { taskId: 'jat-abc', priority: 'P9' })).toBe(false);
		expect(ok('update_task', { taskId: 'jat-abc', type: 'spike' })).toBe(false);
	});

	it('rejects non-string assignee', () => {
		expect(ok('update_task', { taskId: 'jat-abc', assignee: 12 })).toBe(false);
	});
});

describe('isValidToolCall — attach_terminal / kill_session', () => {
	it('attach_terminal accepts no params (defaults to hovered)', () => {
		expect(ok('attach_terminal')).toBe(true);
	});

	it('kill_session accepts no params (defaults to hovered)', () => {
		expect(ok('kill_session')).toBe(true);
	});

	it('rejects non-string sessionName', () => {
		expect(ok('attach_terminal', { sessionName: 7 })).toBe(false);
		expect(ok('kill_session', { sessionName: { foo: 'bar' } })).toBe(false);
	});

	it('accepts string sessionName', () => {
		expect(ok('attach_terminal', { sessionName: 'jat-EarlyShore' })).toBe(true);
		expect(ok('kill_session', { sessionName: 'jat-EarlyShore' })).toBe(true);
	});
});

describe('isValidToolCall — epic_swarm', () => {
	it('accepts no params', () => {
		expect(ok('epic_swarm')).toBe(true);
	});

	it('accepts valid epicTaskId + agentCount', () => {
		expect(ok('epic_swarm', { epicTaskId: 'jat-epic', agentCount: 4 })).toBe(true);
	});

	it('rejects out-of-range agentCount', () => {
		expect(ok('epic_swarm', { agentCount: 0 })).toBe(false);
		expect(ok('epic_swarm', { agentCount: 13 })).toBe(false);
	});

	it('rejects non-integer agentCount', () => {
		expect(ok('epic_swarm', { agentCount: 2.5 })).toBe(false);
		expect(ok('epic_swarm', { agentCount: 'four' })).toBe(false);
	});
});

describe('isValidToolCall — add_project', () => {
	it('accepts no params', () => {
		expect(ok('add_project')).toBe(true);
	});

	it('accepts valid projectName', () => {
		expect(ok('add_project', { projectName: 'flush' })).toBe(true);
	});

	it('rejects non-string projectName', () => {
		expect(ok('add_project', { projectName: 42 })).toBe(false);
	});
});
