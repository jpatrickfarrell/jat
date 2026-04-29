import { describe, it, expect } from 'vitest';
import {
	resolveTaskId,
	TASK_ID_THRESHOLD,
	AMBIGUITY_MARGIN,
	type VisibleTask
} from './taskIdResolver';

const tasks = (...rows: Partial<VisibleTask>[]): VisibleTask[] =>
	rows.map((r, i) => ({
		id: r.id ?? `jat-${i}`,
		title: r.title ?? '',
		status: r.status,
		priority: r.priority,
		updated_at: r.updated_at
	}));

describe('resolveTaskId — acceptance', () => {
	it('resolves "the auth task" to "Fix auth timeout bug" over "Billing authorization"', () => {
		// Direct quote from the task spec (jat-ho0mz.10):
		// "the auth task resolves to Fix auth timeout bug over Billing authorization"
		const ctx = {
			visibleTasks: tasks(
				{ id: 'jat-bill', title: 'Billing authorization', priority: 1 },
				{ id: 'jat-auth', title: 'Fix auth timeout bug', priority: 1 }
			)
		};

		const result = resolveTaskId('the auth task', ctx);

		expect(result.status).toBe('resolved');
		if (result.status === 'resolved') {
			expect(result.value).toBe('jat-auth');
		}
	});

	it('returns disambiguation list when scores are within the margin', () => {
		// Two equally-strong matches → ambiguous. Spec: "returns disambiguation
		// list on tight margins".
		const ctx = {
			visibleTasks: tasks(
				{ id: 'jat-fix', title: 'Fix auth timeout' },
				{ id: 'jat-ref', title: 'Auth login refactor' }
			)
		};

		const result = resolveTaskId('the auth task', ctx);

		expect(result.status).toBe('ambiguous');
		if (result.status === 'ambiguous') {
			expect(result.candidates).toHaveLength(2);
			const ids = result.candidates.map((c) => c.value);
			expect(ids).toContain('jat-fix');
			expect(ids).toContain('jat-ref');
			// Labels include both title and id for the overlay to render.
			expect(result.candidates[0].label).toMatch(/jat-/);
		}
	});
});

describe('resolveTaskId — direct ID match', () => {
	it('resolves an exact task ID embedded in the utterance', () => {
		const ctx = {
			visibleTasks: tasks(
				{ id: 'jat-a1b2c3', title: 'Some task' },
				{ id: 'jat-x9y8z7', title: 'Other task' }
			)
		};

		const result = resolveTaskId('jat-a1b2c3', ctx);

		expect(result.status).toBe('resolved');
		if (result.status === 'resolved') {
			expect(result.value).toBe('jat-a1b2c3');
			expect(result.confidence).toBe(1.0);
		}
	});

	it('finds an ID even when surrounded by extra words', () => {
		const ctx = {
			visibleTasks: tasks({ id: 'jat-a1b2c3', title: 'Some task' })
		};

		const result = resolveTaskId('close jat-a1b2c3 please', ctx);

		expect(result.status).toBe('resolved');
		if (result.status === 'resolved') {
			expect(result.value).toBe('jat-a1b2c3');
		}
	});
});

describe('resolveTaskId — empty / no-match', () => {
	it('returns not-found when there are no visible tasks', () => {
		expect(resolveTaskId('the auth task', { visibleTasks: [] }).status).toBe(
			'not-found'
		);
		expect(resolveTaskId('the auth task', {}).status).toBe('not-found');
	});

	it('returns not-found when input is empty after stop-word stripping', () => {
		const ctx = { visibleTasks: tasks({ id: 'jat-1', title: 'Real task' }) };
		expect(resolveTaskId('the task', ctx).status).toBe('not-found');
	});

	it('returns not-found when nothing scores above the threshold', () => {
		const ctx = {
			visibleTasks: tasks(
				{ id: 'jat-1', title: 'Refactor docker compose pipeline' },
				{ id: 'jat-2', title: 'Update database schema' }
			)
		};

		const result = resolveTaskId('quantum cryptography', ctx);
		expect(result.status).toBe('not-found');
	});
});

describe('resolveTaskId — scoring details', () => {
	it('clear winner returns confidence ≥ threshold', () => {
		const ctx = {
			visibleTasks: tasks(
				{ id: 'jat-auth', title: 'Fix auth timeout bug' },
				{ id: 'jat-other', title: 'Update docs' }
			)
		};

		const result = resolveTaskId('fix auth bug', ctx);
		expect(result.status).toBe('resolved');
		if (result.status === 'resolved') {
			expect(result.value).toBe('jat-auth');
			expect(result.confidence ?? 0).toBeGreaterThanOrEqual(TASK_ID_THRESHOLD);
		}
	});

	it('breaks ties on equal score by lower priority number', () => {
		// Two titles score identically; the P0 should win the resolved slot.
		const ctx = {
			visibleTasks: tasks(
				{ id: 'jat-low', title: 'Auth refactor', priority: 3 },
				{ id: 'jat-high', title: 'Auth refactor', priority: 0 }
			)
		};

		// Identical titles will be grouped as ambiguous, but the *order*
		// inside `candidates` should put the P0 first.
		const result = resolveTaskId('auth refactor', ctx);
		if (result.status === 'ambiguous') {
			expect(result.candidates[0].value).toBe('jat-high');
		} else if (result.status === 'resolved') {
			expect(result.value).toBe('jat-high');
		}
	});

	it('AMBIGUITY_MARGIN constant is small enough to keep clear winners resolved', () => {
		// Sanity check on the constant — if someone tunes it above 0.30, the
		// "auth task" acceptance test would flip to ambiguous, which would
		// regress the spec.
		expect(AMBIGUITY_MARGIN).toBeLessThan(0.3);
	});
});
