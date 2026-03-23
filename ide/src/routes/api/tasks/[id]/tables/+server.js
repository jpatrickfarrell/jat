/**
 * Task-Table Attachment API
 * GET  /api/tasks/[id]/tables?project=X          - List data tables attached to task
 * POST /api/tasks/[id]/tables                     - Attach data table to task
 */
import { json } from '@sveltejs/kit';
import { getTaskTables, attachTableToTask, initBasesDb } from '$lib/server/jat-bases.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	const taskId = params.id;
	const project = url.searchParams.get('project');

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const tables = getTaskTables(path, taskId);
		return json({ tables });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const taskId = params.id;

	try {
		const body = await request.json();
		const { project, tableName, contextQuery } = body;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}
		if (!tableName) {
			return json({ error: 'Missing required field: tableName' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		// Auto-init bases tables in data.db if needed
		initBasesDb(path);

		const result = attachTableToTask(path, taskId, tableName, project, { context_query: contextQuery });
		return json({ success: true, attached: result.attached });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
