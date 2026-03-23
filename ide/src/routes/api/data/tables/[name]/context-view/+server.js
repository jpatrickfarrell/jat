/**
 * Context View API
 * GET  /api/data/tables/[name]/context-view?project=X  - Get context view settings
 * PUT  /api/data/tables/[name]/context-view             - Update context view settings
 * POST /api/data/tables/[name]/context-view/preview     - Preview context query results
 */
import { json } from '@sveltejs/kit';
import { getContextView, setContextView, previewContextQuery } from '$lib/server/jat-data.js';
import { createBase, updateBase, deleteBase, getBases } from '$lib/server/jat-bases.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	const project = url.searchParams.get('project');
	const tableName = params.name;

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const view = getContextView(path, tableName);

		// Check if a knowledge base exists for this table
		let linkedBase = null;
		try {
			const bases = getBases(path);
			linkedBase = bases.find(b =>
				b.source_type === 'data_table' &&
				b.source_config?.tableName === tableName
			) || null;
		} catch { /* bases tables may not exist yet */ }

		return json({ ...view, linkedBase });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ params, url, request }) {
	const tableName = params.name;

	try {
		const body = await request.json();
		const project = body.project;

		if (!project) {
			return json({ error: 'Missing required parameter: project' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		// Update context view settings on the data table
		const result = setContextView(path, tableName, {
			context_query: body.context_query,
			context_description: body.context_description,
		});

		// Handle knowledge base link/unlink
		if (body.enableBase !== undefined) {
			try {
				const bases = getBases(path);
				const existingBase = bases.find(b =>
					b.source_type === 'data_table' &&
					b.source_config?.tableName === tableName
				);

				if (body.enableBase && !existingBase) {
					// Create a new knowledge base linked to this table
					const base = createBase(path, {
						name: body.baseName || `${tableName} context view`,
						description: body.context_description || `Context view for ${tableName} data table`,
						source_type: 'data_table',
						context_query: body.context_query || null,
						source_config: { tableName },
						always_inject: false,
					});
					return json({ ...result, linkedBase: base });
				} else if (!body.enableBase && existingBase) {
					// Delete the linked knowledge base
					deleteBase(path, existingBase.id);
					return json({ ...result, linkedBase: null });
				} else if (body.enableBase && existingBase) {
					// Update existing base with new query/description
					const updated = updateBase(path, existingBase.id, {
						context_query: body.context_query || null,
						description: body.context_description || existingBase.description,
					});
					return json({ ...result, linkedBase: updated });
				}
			} catch (e) {
				// Don't fail the whole request if bases operations fail
				console.error('Failed to manage knowledge base:', e.message);
			}
		}

		return json(result);
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const tableName = params.name;

	try {
		const body = await request.json();
		const project = body.project;

		if (!project) {
			return json({ error: 'Missing required parameter: project' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const result = previewContextQuery(path, body.sql);
		return json(result);
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
