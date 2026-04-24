/**
 * Raw SQL Query API
 * POST /api/data/query  - Execute raw SQL (query or exec mode)
 *
 * For postgres-backed projects, SQL is translated to JSONB operations on
 * data_rows (see lib/data-postgres.js). Complex SQL (JOINs, aggregates,
 * subqueries) is rejected with a clear error — callers should use the
 * REST helpers instead. Query mode rejects writes; exec mode accepts
 * INSERT/UPDATE/DELETE only.
 */
import { json } from '@sveltejs/kit';
import {
	queryDataTable, execDataSql, initDataDb,
	isPostgresProject, pgQueryDataTable, pgExecDataSql,
} from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const { project, sql, mode = 'query' } = body;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}
		if (!sql) {
			return json({ error: 'Missing required field: sql' }, { status: 400 });
		}

		if (isPostgresProject(project)) {
			if (mode === 'exec') {
				const result = await pgExecDataSql(project, sql);
				return json({ success: true, changes: result.changes });
			}
			const rows = await pgQueryDataTable(project, sql);
			return json({ rows });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		initDataDb(path);

		if (mode === 'exec') {
			const result = execDataSql(path, sql);
			return json({ success: true, changes: result.changes });
		} else {
			const rows = queryDataTable(path, sql);
			return json({ rows });
		}
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
