/**
 * Task-Table Detach API
 * DELETE /api/tasks/[id]/tables/[tableName]?project=X  - Detach data table from task
 */
import { json } from '@sveltejs/kit';
import { detachTableFromTask } from '$lib/server/jat-bases.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params, url }) {
	const taskId = params.id;
	const tableName = params.tableName;
	const project = url.searchParams.get('project');

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const result = detachTableFromTask(path, taskId, tableName, project);
		if (result.changes === 0) {
			return json({ error: 'Attachment not found' }, { status: 404 });
		}

		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
