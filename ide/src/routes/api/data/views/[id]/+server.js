/**
 * Single View API
 * GET    /api/data/views/[id]?project=X  - Get view details
 * PUT    /api/data/views/[id]            - Update view
 * DELETE /api/data/views/[id]?project=X  - Delete view
 */
import { json } from '@sveltejs/kit';
import { getView, updateView, deleteView } from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	const project = url.searchParams.get('project');
	const viewId = params.id;

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const view = getView(path, viewId);
		if (!view) {
			return json({ error: `View not found: ${viewId}` }, { status: 404 });
		}

		return json({ view });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ params, request }) {
	const viewId = params.id;

	try {
		const body = await request.json();
		const { project, ...data } = body;

		if (!project) {
			return json({ error: 'Missing required parameter: project' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const view = updateView(path, viewId, data);
		return json({ view });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params, url }) {
	const project = url.searchParams.get('project');
	const viewId = params.id;

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const result = deleteView(path, viewId);
		return json(result);
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
