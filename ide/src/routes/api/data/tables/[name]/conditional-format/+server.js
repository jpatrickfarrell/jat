/**
 * Table Conditional Format API
 *
 * GET  /api/data/tables/[name]/conditional-format?project=X  — Get format rules
 * PUT  /api/data/tables/[name]/conditional-format             — Save format rules
 *
 * Stores table-level conditional formatting rules in the _columns metadata table
 * using reserved column name '__conditional_format__'.
 */
import { json } from '@sveltejs/kit';
import {
	getColumnMetadata, setColumnMetadata,
	isPostgresProject, pgGetColumnMetadata, pgSetColumnMetadata,
} from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

const RESERVED_COLUMN = '__conditional_format__';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url }) {
	const project = url.searchParams.get('project');
	const tableName = params.name;

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		if (isPostgresProject(project)) {
			const metadata = await pgGetColumnMetadata(project, tableName);
			const formatRow = metadata.find(/** @param {any} r */ (r) => r.column_name === RESERVED_COLUMN);
			if (!formatRow) {
				return json({ rules: [], colorScales: [] });
			}
			const config = formatRow.config || {};
			return json({
				rules: config.rules || [],
				colorScales: config.colorScales || [],
			});
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const metadata = getColumnMetadata(path, tableName);
		const formatRow = metadata.find(r => r.column_name === RESERVED_COLUMN);

		if (!formatRow) {
			return json({ rules: [], colorScales: [] });
		}

		const config = formatRow.config || {};
		return json({
			rules: config.rules || [],
			colorScales: config.colorScales || [],
		});
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ params, request }) {
	try {
		const body = await request.json();
		const { project, rules, colorScales } = body;
		const tableName = params.name;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}

		const config = {
			rules: rules || [],
			colorScales: colorScales || [],
		};

		if (isPostgresProject(project)) {
			await pgSetColumnMetadata(project, tableName, RESERVED_COLUMN, 'text', config, {
				displayName: 'Conditional Format Rules',
				description: 'Table-level conditional formatting configuration',
			});
			return json({ success: true });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		setColumnMetadata(path, tableName, RESERVED_COLUMN, 'text', config, {
			displayName: 'Conditional Format Rules',
			description: 'Table-level conditional formatting configuration',
		});

		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
