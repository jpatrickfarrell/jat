/**
 * Base Render API
 * POST /api/bases/[id]/render  - Render base content for preview
 */
import { json } from '@sveltejs/kit';
import { renderBase } from '$lib/server/jat-bases.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const baseId = params.id;

	try {
		const body = await request.json();
		const { project, collapsible } = body;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const rendered = renderBase(path, baseId, { collapsible: !!collapsible });
		return json({ rendered });
	} catch (error) {
		if (error.message.includes('not found')) {
			return json({ error: error.message }, { status: 404 });
		}
		return json({ error: error.message }, { status: 500 });
	}
}
