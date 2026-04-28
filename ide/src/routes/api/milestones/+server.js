/**
 * GET /api/milestones?project=X
 * Returns the list of milestones for a postgres-backed project.
 */
import { json } from '@sveltejs/kit';
import { resolveBackendForProject } from '../../../../../lib/projects-config.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const project = url.searchParams.get('project');
	if (!project) {
		return json({ ok: false, error: 'project param required' }, { status: 400 });
	}

	try {
		const backendConfig = resolveBackendForProject(project);
		if (backendConfig.kind !== 'postgres') {
			return json({ milestones: [] });
		}

		const { getBackendForProject } = await import('../../../../../lib/tasks-backend.js');
		const pgBackend = await getBackendForProject(project);
		const milestones = await pgBackend.listMilestones();

		return json({ milestones });
	} catch (err) {
		console.error('[api/milestones] error:', err instanceof Error ? err.message : err);
		return json({ milestones: [] });
	}
}
