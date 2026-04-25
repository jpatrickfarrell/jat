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
import { resolveBackendForProject } from '../../../../../../lib/projects-config.js';
import * as pgBases from '../../../../../../lib/bases-postgres.js';

function getPostgresUrlForProject(projectName) {
	try {
		const cfg = resolveBackendForProject(projectName);
		return cfg.kind === 'postgres' ? cfg.url : null;
	} catch {
		return null;
	}
}

/**
 * Seed templates for a postgres-backed project. Mirrors the behavior of
 * seedCanvasTemplates but uses pg helpers — skips templates whose name
 * already exists as a base for this project.
 */
async function seedCanvasTemplatesPg(pgUrl, project) {
	const existing = await pgBases.listBases(pgUrl, { project });
	const existingNames = new Set(existing.map((b) => b.name.toLowerCase()));

	const created = [];
	const skipped = [];

	for (const tmpl of getTemplates()) {
		if (existingNames.has(tmpl.name.toLowerCase())) {
			skipped.push(tmpl.name);
			continue;
		}
		const instance = instantiateTemplate(tmpl.id);
		if (!instance) continue;
		await pgBases.createBase(pgUrl, {
			name: instance.name,
			project,
			blocks: instance.blocks,
		});
		created.push(tmpl.name);
	}

	return { created, skipped };
}

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

		const pgUrl = getPostgresUrlForProject(project);

		// Seed mode: create all templates for project
		if (seed) {
			const result = pgUrl
				? await seedCanvasTemplatesPg(pgUrl, project)
				: seedCanvasTemplates(path, project);
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

		const base = pgUrl
			? await pgBases.createBase(pgUrl, {
					name: instance.name,
					project,
					blocks: instance.blocks,
				})
			: createBase(path, {
					name: instance.name,
					project,
					blocks: instance.blocks,
				});

		return json({ success: true, base }, { status: 201 });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
