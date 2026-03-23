/**
 * Single Base API (Unified)
 * GET    /api/bases/[id]?project=X  - Get single base (with blocks)
 * PUT    /api/bases/[id]            - Update base (name, blocks, description, always_inject, etc.)
 * DELETE /api/bases/[id]?project=X  - Delete base
 */
import { json } from '@sveltejs/kit';
import { getBase, updateBase, deleteBase } from '$lib/server/jat-bases.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	const project = url.searchParams.get('project');
	const baseId = params.id;

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const base = getBase(path, baseId);
		if (!base) {
			return json({ error: `Base not found: ${baseId}` }, { status: 404 });
		}

		return json({ base });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ params, request }) {
	const baseId = params.id;

	try {
		const body = await request.json();
		const { project, ...updates } = body;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
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

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const base = updateBase(path, baseId, updates);
		return json({ success: true, base });
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
	const baseId = params.id;

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const result = deleteBase(path, baseId);
		if (result.changes === 0) {
			return json({ error: `Base not found: ${baseId}` }, { status: 404 });
		}

		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
