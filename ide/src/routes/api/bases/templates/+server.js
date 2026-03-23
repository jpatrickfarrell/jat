/**
 * Base Templates API
 * GET  /api/bases/templates           - List all available templates
 * POST /api/bases/templates           - Create base from template
 * POST /api/bases/templates?seed=true - Seed all templates for project
 */
import { json } from '@sveltejs/kit';
import { getTemplates, instantiateTemplate, seedCanvasTemplates } from '$lib/server/jat-canvas.js';
import { createBase } from '$lib/server/jat-bases.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	const templates = getTemplates().map(({ id, name, description, category }) => ({
		id,
		name,
		description,
		category,
	}));
	return json({ templates });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, url }) {
	try {
		const body = await request.json();
		const { project, templateId, name: customName } = body;
		const seed = url.searchParams.get('seed') === 'true';

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		// Seed mode: create all templates for project
		if (seed) {
			const result = seedCanvasTemplates(path, project);
			return json({ success: true, ...result }, { status: 201 });
		}

		// Single template mode
		if (!templateId) {
			return json({ error: 'Missing required field: templateId' }, { status: 400 });
		}

		const instance = instantiateTemplate(templateId, customName);
		if (!instance) {
			return json({ error: `Template not found: ${templateId}` }, { status: 404 });
		}

		const base = createBase(path, {
			name: instance.name,
			project,
			blocks: instance.blocks,
		});

		return json({ success: true, base }, { status: 201 });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
