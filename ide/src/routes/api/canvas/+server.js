/**
 * Canvas Pages API
 * GET  /api/canvas?project=X  - List all canvas pages for project
 * POST /api/canvas            - Create new canvas page
 */
import { json } from '@sveltejs/kit';
import { listCanvasPages, createCanvasPage } from '$lib/server/jat-canvas.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const project = url.searchParams.get('project');
	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const pages = listCanvasPages(path, project);
		return json({ pages });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const { project, name, blocks } = body;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}
		if (!name) {
			return json({ error: 'Missing required field: name' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		// Validate blocks structure if provided
		if (blocks && !Array.isArray(blocks)) {
			return json({ error: 'blocks must be an array' }, { status: 400 });
		}

		if (blocks) {
			for (const block of blocks) {
				if (!block.type || !block.id) {
					return json({ error: 'Each block must have a type and id' }, { status: 400 });
				}
			}
		}

		const page = createCanvasPage(path, { name, project, blocks });
		return json({ success: true, page }, { status: 201 });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
