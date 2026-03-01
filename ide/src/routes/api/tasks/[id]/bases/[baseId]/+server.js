/**
 * Task-Base Detach API
 * DELETE /api/tasks/[id]/bases/[baseId]?project=X  - Detach base from task
 */
import { json } from '@sveltejs/kit';
import { detachBaseFromTask } from '$lib/server/jat-bases.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params, url }) {
	const taskId = params.id;
	const baseId = params.baseId;
	const project = url.searchParams.get('project');

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const result = detachBaseFromTask(path, taskId, baseId);
		if (result.changes === 0) {
			return json({ error: 'Attachment not found' }, { status: 404 });
		}

		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
