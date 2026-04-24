/**
 * Task Dependencies API Route
 *
 * GET    /api/tasks/[id]/deps            — dependency graph (SQLite projects)
 * POST   /api/tasks/[id]/deps            — add dependency (postgres + SQLite)
 * DELETE /api/tasks/[id]/deps            — remove dependency (postgres + SQLite)
 */
import { json } from '@sveltejs/kit';
import { getTaskById, addDependency, removeDependency } from '$lib/server/jat-tasks.js';
import { resolveBackendForProject } from '../../../../../../../lib/projects-config.js';
import { invalidateCache } from '$lib/server/cache.js';
import { _resetTaskCache } from '../../../../api/agents/+server.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
	const taskId = params.id;

	const task = getTaskById(taskId);

	if (!task) {
		return json({ error: 'Task not found' }, { status: 404 });
	}

	const graph = {
		task: {
			id: task.id,
			title: task.title,
			status: task.status,
			priority: task.priority,
			issue_type: task.issue_type
		},
		blockedBy: (task.depends_on || []).map(dep => ({
			id: dep.id,
			title: dep.title,
			status: dep.status,
			priority: dep.priority,
			isBlocking: dep.status !== 'closed'
		})),
		unblocks: (task.blocked_by || []).map(dep => ({
			id: dep.id,
			title: dep.title,
			status: dep.status,
			priority: dep.priority,
			isWaiting: dep.status !== 'closed'
		}))
	};

	return json(graph);
}

/**
 * POST /api/tasks/[id]/deps
 * Body: { depends_on: string, project?: string }
 * Declares that task [id] depends on depends_on (depends_on must complete first).
 */
/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const taskId = params.id;

	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const dependsOnId = body?.depends_on;
	if (!dependsOnId || typeof dependsOnId !== 'string') {
		return json({ error: 'depends_on is required' }, { status: 400 });
	}

	if (taskId === dependsOnId) {
		return json({ error: 'A task cannot depend on itself' }, { status: 400 });
	}

	const project = body?.project || null;
	let pgBackend = null;
	if (project) {
		try {
			const backendConfig = resolveBackendForProject(project);
			if (backendConfig.kind === 'postgres') {
				const { getBackendForProject } = await import('../../../../../../../lib/tasks-backend.js');
				pgBackend = await getBackendForProject(project);
			}
		} catch {
			// Not a postgres project — fall through to SQLite
		}
	}

	try {
		if (pgBackend) {
			await pgBackend.addDependency(taskId, dependsOnId, undefined);
		} else {
			addDependency(taskId, dependsOnId, body?.projectPath || null);
		}
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		if (msg.includes('cycle')) {
			return json({ error: `Cannot add dependency: would create a cycle (${taskId} → ${dependsOnId})` }, { status: 409 });
		}
		if (msg.includes('Unknown task') || msg.includes('not found')) {
			return json({ error: msg }, { status: 404 });
		}
		return json({ error: msg }, { status: 500 });
	}

	invalidateCache.tasks();
	invalidateCache.agents();
	_resetTaskCache();

	return json({ success: true, taskId, depends_on: dependsOnId });
}

/**
 * DELETE /api/tasks/[id]/deps
 * Body: { depends_on: string, project?: string }
 * Removes the dependency edge from [id] → depends_on.
 */
/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params, request }) {
	const taskId = params.id;

	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const dependsOnId = body?.depends_on;
	if (!dependsOnId || typeof dependsOnId !== 'string') {
		return json({ error: 'depends_on is required' }, { status: 400 });
	}

	const project = body?.project || null;
	let pgBackend = null;
	if (project) {
		try {
			const backendConfig = resolveBackendForProject(project);
			if (backendConfig.kind === 'postgres') {
				const { getBackendForProject } = await import('../../../../../../../lib/tasks-backend.js');
				pgBackend = await getBackendForProject(project);
			}
		} catch {
			// Not a postgres project — fall through to SQLite
		}
	}

	try {
		if (pgBackend) {
			await pgBackend.removeDependency(taskId, dependsOnId, undefined);
		} else {
			removeDependency(taskId, dependsOnId, body?.projectPath || null);
		}
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		return json({ error: msg }, { status: 500 });
	}

	invalidateCache.tasks();
	invalidateCache.agents();
	_resetTaskCache();

	return json({ success: true, taskId, depends_on: dependsOnId });
}
