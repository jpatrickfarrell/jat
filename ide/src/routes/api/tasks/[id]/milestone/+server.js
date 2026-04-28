/**
 * PUT /api/tasks/[id]/milestone
 * Set (or clear) the milestone linked to a task via milestone_tasks.
 * Body: { milestone_id: string | null }
 */
import { json } from '@sveltejs/kit';
import { resolveBackendForProject } from '../../../../../../../lib/projects-config.js';
import { invalidateCache } from '$lib/server/cache.js';

/** @type {import('./$types').RequestHandler} */
export async function PUT({ params, request }) {
	const taskId = params.id;
	const { milestone_id } = await request.json();

	// Resolve project from task id prefix (e.g. "meadow-abc12" → "meadow")
	const project = taskId.includes('-') ? taskId.split('-')[0] : null;

	if (!project) {
		return json({ ok: false, error: 'Cannot determine project from task ID' }, { status: 400 });
	}

	try {
		const backendConfig = resolveBackendForProject(project);
		if (backendConfig.kind !== 'postgres') {
			return json({ ok: false, error: 'Milestone assignment is only supported for postgres-backed projects' }, { status: 400 });
		}

		const { getBackendForProject } = await import('../../../../../../../lib/tasks-backend.js');
		const pgBackend = await getBackendForProject(project);

		await pgBackend.setMilestone(taskId, milestone_id || null);

		invalidateCache.tasks();

		return json({ ok: true });
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error('[api/tasks/milestone] error:', message);
		return json({ ok: false, error: message }, { status: 500 });
	}
}
