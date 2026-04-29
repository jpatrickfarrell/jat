import { describe, it, expect, beforeEach } from 'vitest';
import {
	registerContextBuilder,
	assembleContext,
	hasContextBuilder,
	_resetContextBuilder,
	CONTEXT_BUDGET_BYTES,
	type AssembledContext
} from './contextAssembly';

beforeEach(() => {
	_resetContextBuilder();
});

describe('contextAssembly framework', () => {
	it('returns an empty envelope when no builder is registered', async () => {
		expect(hasContextBuilder()).toBe(false);
		const result = await assembleContext({ route: '/tasks' });
		expect(result.context.pinned).toEqual({});
		expect(result.context.trimmable).toEqual({});
		expect(result.truncated).toBe(false);
	});

	it('passes through a small context unchanged', async () => {
		registerContextBuilder(() => ({
			pinned: { route: '/tasks', selectedTask: 'jat-abc' },
			trimmable: { visibleTasks: [{ id: 'jat-abc', title: 'A' }] }
		}));

		const result = await assembleContext({ route: '/tasks' });
		expect(result.truncated).toBe(false);
		expect(result.context.trimmable.visibleTasks).toHaveLength(1);
		expect(result.sizeBytes).toBeLessThanOrEqual(CONTEXT_BUDGET_BYTES);
	});

	it('passes route argument to the builder', async () => {
		const seen: string[] = [];
		registerContextBuilder(({ route }) => {
			seen.push(route);
			return { pinned: { route }, trimmable: {} };
		});

		await assembleContext({ route: '/triage' });
		expect(seen).toEqual(['/triage']);
	});

	it('replaces the prior builder when re-registered (HMR-friendly)', async () => {
		registerContextBuilder(() => ({ pinned: { v: 1 }, trimmable: {} }));
		registerContextBuilder(() => ({ pinned: { v: 2 }, trimmable: {} }));
		const result = await assembleContext({ route: '/' });
		expect(result.context.pinned).toEqual({ v: 2 });
	});

	it('enforces the configured budget by trimming oldest tail items', async () => {
		// Force overflow with a tight budget so the test stays fast and avoids
		// generating 30 KB of fake data just to exercise the trim path.
		const bigList = Array.from({ length: 200 }, (_, i) => ({
			id: `jat-${i.toString().padStart(4, '0')}`,
			title: `Task number ${i} — long enough to pad bytes`,
			status: 'open',
			priority: 1
		}));

		registerContextBuilder(() => ({
			pinned: { route: '/tasks', selectedTask: 'jat-0000' },
			trimmable: { visibleTasks: bigList }
		}));

		const result = await assembleContext({ route: '/tasks', budgetBytes: 4 * 1024 });
		expect(result.sizeBytes).toBeLessThanOrEqual(4 * 1024);
		expect(result.truncated).toBe(true);
		expect(result.dropped.visibleTasks).toBeGreaterThan(0);
		expect(result.context.trimmable.visibleTasks.length).toBeLessThan(bigList.length);
	});

	it('default 32 KB budget accommodates rich descriptions without trim', async () => {
		// A realistic JAT-shaped context: 19 projects with ~200-char descriptions,
		// 30 visible tasks with 200-char descriptions, 10 sessions, 10 recent
		// closed. Should fit comfortably under 32 KB with no trim needed.
		registerContextBuilder(() => ({
			pinned: {
				route: '/tasks',
				hoveredSession: 'jat-EarlyShore',
				selectedTask: 'jat-abc',
				lastMatchedAction: null
			},
			trimmable: {
				projects: Array.from({ length: 19 }, (_, i) => ({
					name: `project${i}`,
					description: 'A '.repeat(100) + 'description.',
					path: `/home/jw/code/project${i}`
				})),
				visibleTasks: Array.from({ length: 30 }, (_, i) => ({
					id: `jat-${i}`,
					title: `Task ${i} title`,
					status: 'open',
					priority: 1,
					description: 'B '.repeat(100) + 'task body.',
					labels: ['voice', 'phase2']
				})),
				activeSessions: Array.from({ length: 10 }, (_, i) => ({
					name: `jat-Agent${i}`,
					agentName: `Agent${i}`,
					taskId: `jat-${i}`,
					taskTitle: `Task ${i}`,
					state: 'working'
				})),
				recentlyClosedTasks: Array.from({ length: 10 }, (_, i) => ({
					id: `jat-closed-${i}`,
					title: `Closed task ${i}`,
					closedByAgent: 'TestAgent'
				}))
			}
		}));

		const result = await assembleContext({ route: '/tasks' });
		expect(result.truncated).toBe(false);
		expect(result.sizeBytes).toBeLessThanOrEqual(CONTEXT_BUDGET_BYTES);
		expect(result.context.trimmable.projects).toHaveLength(19);
		expect(result.context.trimmable.visibleTasks).toHaveLength(30);
	});

	it('preserves description text when budget is generous', async () => {
		const description = 'Brand content platform — users set up companies, upload media, and generate marketing content.';
		registerContextBuilder(() => ({
			pinned: { route: '/tasks' },
			trimmable: {
				projects: [{ name: 'chimaro', description }]
			}
		}));

		const result = await assembleContext({ route: '/tasks' });
		expect(result.serialized).toContain('Brand content platform');
		expect(result.truncated).toBe(false);
	});

	it('trim respects hover by preserving the front of the array (PRD §5.4)', async () => {
		// The builder convention: place the hovered/most-relevant item at index 0.
		// The framework drops from the tail, so the hovered entry must survive.
		const HOVERED_ID = 'jat-hovered';
		const list = [
			{ id: HOVERED_ID, title: 'Hovered task', priority: 1 },
			...Array.from({ length: 200 }, (_, i) => ({
				id: `jat-${i}`,
				title: `Filler task with enough chars to push the byte budget over the cap quickly`,
				priority: 2
			}))
		];

		registerContextBuilder(() => ({
			pinned: { route: '/tasks', selectedTask: HOVERED_ID },
			trimmable: { visibleTasks: list }
		}));

		const result = await assembleContext({ route: '/tasks', budgetBytes: 4 * 1024 });
		expect(result.truncated).toBe(true);
		expect(result.sizeBytes).toBeLessThanOrEqual(4 * 1024);
		const survivors = result.context.trimmable.visibleTasks as Array<{ id: string }>;
		expect(survivors[0].id).toBe(HOVERED_ID);
		expect(result.context.pinned.selectedTask).toBe(HOVERED_ID);
	});

	it('shares trim across multiple arrays (largest first)', async () => {
		const tasks = Array.from({ length: 100 }, (_, i) => ({
			id: `t-${i}`,
			title: `task ${i} padding padding padding padding padding`
		}));
		const sessions = Array.from({ length: 30 }, (_, i) => ({
			name: `s-${i}`,
			agentName: `Agent${i}`,
			taskId: `t-${i}`
		}));

		registerContextBuilder(() => ({
			pinned: { route: '/tasks' },
			trimmable: { visibleTasks: tasks, activeSessions: sessions }
		}));

		const result = await assembleContext({ route: '/tasks', budgetBytes: 4 * 1024 });
		expect(result.sizeBytes).toBeLessThanOrEqual(4 * 1024);
		// Both arrays were considered; tasks (much larger) absorbs most of the trim.
		expect(result.dropped.visibleTasks).toBeGreaterThan(0);
	});

	it('never drops items from pinned, even with a tiny budget', async () => {
		registerContextBuilder(() => ({
			pinned: {
				route: '/tasks',
				hoveredSession: 'jat-EarlyShore',
				selectedTask: 'jat-pinned',
				projects: ['jat', 'flush']
			},
			trimmable: { visibleTasks: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] }
		}));

		const result = await assembleContext({ route: '/tasks', budgetBytes: 64 });
		// Trimmable should be fully exhausted before pinned is touched.
		expect(result.context.trimmable.visibleTasks).toHaveLength(0);
		expect(result.context.pinned.hoveredSession).toBe('jat-EarlyShore');
		expect(result.context.pinned.selectedTask).toBe('jat-pinned');
		expect(result.context.pinned.projects).toEqual(['jat', 'flush']);
	});

	it('accepts a stub builder with a completely different shape — zero framework changes (PRD §13 acceptance)', async () => {
		// Tenant-readiness check: a Meadow-shaped stub with `currentFellow`,
		// `visibleFellows`, `activeCohorts`, `programs` works through the same
		// API. The framework does not know JAT-specific field names.
		interface MeadowContext extends AssembledContext {
			pinned: {
				route: string;
				currentFellow: string | null;
				programs: string[];
			};
			trimmable: {
				visibleFellows: Array<{ id: string; name: string }>;
				activeCohorts: Array<{ id: string; size: number }>;
			};
		}

		const stubMeadowBuilder = ({ route }: { route: string }): MeadowContext => ({
			pinned: {
				route,
				currentFellow: 'fellow-001',
				programs: ['program-a', 'program-b']
			},
			trimmable: {
				visibleFellows: [
					{ id: 'fellow-001', name: 'Alex' },
					{ id: 'fellow-002', name: 'Bryn' }
				],
				activeCohorts: [{ id: 'cohort-2026-spring', size: 18 }]
			}
		});

		registerContextBuilder(stubMeadowBuilder);
		const result = await assembleContext({ route: '/cohorts' });

		expect(result.sizeBytes).toBeLessThanOrEqual(CONTEXT_BUDGET_BYTES);
		expect(result.truncated).toBe(false);
		expect(result.context.pinned.currentFellow).toBe('fellow-001');
		expect(result.context.trimmable.visibleFellows).toHaveLength(2);
		// Serialized payload contains the tenant-specific keys, proving the
		// framework is field-name agnostic.
		expect(result.serialized).toContain('visibleFellows');
		expect(result.serialized).toContain('currentFellow');
	});

	it('serializes with stable key ordering for prefix-cache friendliness', async () => {
		registerContextBuilder(() => ({
			// Keys intentionally out of order — framework should sort them.
			pinned: { zeta: 1, alpha: 2 },
			trimmable: { visibleTasks: [{ id: 'a' }] }
		}));

		const a = await assembleContext({ route: '/tasks' });
		_resetContextBuilder();
		registerContextBuilder(() => ({
			pinned: { alpha: 2, zeta: 1 },
			trimmable: { visibleTasks: [{ id: 'a' }] }
		}));
		const b = await assembleContext({ route: '/tasks' });
		expect(a.serialized).toBe(b.serialized);
	});

	it('supports async builders', async () => {
		registerContextBuilder(async ({ route }) => {
			await Promise.resolve();
			return { pinned: { route, async: true }, trimmable: {} };
		});

		const result = await assembleContext({ route: '/work' });
		expect(result.context.pinned.async).toBe(true);
	});
});
