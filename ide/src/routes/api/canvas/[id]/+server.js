/**
 * Single Canvas Page API
 * GET    /api/canvas/[id]?project=X  - Get single canvas page with blocks
 * PUT    /api/canvas/[id]            - Update canvas page (name and/or blocks)
 * DELETE /api/canvas/[id]?project=X  - Delete canvas page
 */
import { json } from '@sveltejs/kit';
import { getCanvasPage, updateCanvasPage, deleteCanvasPage } from '$lib/server/jat-canvas.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	const project = url.searchParams.get('project');
	const pageId = params.id;

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const page = getCanvasPage(path, pageId);
		if (!page) {
			return json({ error: `Canvas page not found: ${pageId}` }, { status: 404 });
		}

		return json({ page });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ params, request }) {
	const pageId = params.id;

	try {
		const body = await request.json();
		const { project, ...updates } = body;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		// Validate blocks structure if provided
		if (updates.blocks !== undefined) {
			if (!Array.isArray(updates.blocks)) {
				return json({ error: 'blocks must be an array' }, { status: 400 });
			}
			for (const block of updates.blocks) {
				if (!block.type || !block.id) {
					return json({ error: 'Each block must have a type and id' }, { status: 400 });
				}
			}
		}

		const page = updateCanvasPage(path, pageId, updates);
		return json({ success: true, page });
	} catch (error) {
		if (error.message.includes('not found')) {
			return json({ error: error.message }, { status: 404 });
		}
		return json({ error: error.message }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params, url }) {
	const project = url.searchParams.get('project');
	const pageId = params.id;

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const result = deleteCanvasPage(path, pageId);
		if (!result.success) {
			return json({ error: `Canvas page not found: ${pageId}` }, { status: 404 });
		}

		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
