/**
 * Reorder Bases API
 * POST /api/bases/reorder - Update sort_order for multiple bases
 */
import { json } from '@sveltejs/kit';
import { reorderBases } from '$lib/server/jat-bases.js';
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

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { project, order } = await request.json();

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}
		if (!Array.isArray(order)) {
			return json({ error: 'order must be an array of { id, sort_order }' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const pgUrl = getPostgresUrlForProject(project);
		const result = pgUrl
			? await pgBases.reorderBases(pgUrl, order)
			: reorderBases(path, order);
		return json({ success: true, ...result });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
