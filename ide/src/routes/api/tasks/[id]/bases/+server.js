/**
 * Task-Base Attachment API
 * GET  /api/tasks/[id]/bases?project=X          - List bases attached to task
 * POST /api/tasks/[id]/bases                     - Attach base to task
 */
import { json } from '@sveltejs/kit';
import { getTaskBases, attachBaseToTask, initBasesDb } from '$lib/server/jat-bases.js';
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

		const bases = getTaskBases(path, taskId);
		return json({ bases });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const taskId = params.id;

	try {
		const body = await request.json();
		const { project, baseId } = body;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}
		if (!baseId) {
			return json({ error: 'Missing required field: baseId' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		// Auto-init bases.db if needed
		initBasesDb(path);

		const result = attachBaseToTask(path, taskId, baseId);
		return json({ success: true, attached: result.attached });
	} catch (error) {
		if (error.message.includes('not found')) {
			return json({ error: error.message }, { status: 404 });
		}
		return json({ error: error.message }, { status: 500 });
	}
}
