/**
 * Raw SQL Exec API
 * POST /api/data/exec
 *   Body: { project, sql }
 *
 * Dedicated write endpoint — only INSERT, UPDATE, DELETE are accepted.
 * For postgres projects, SQL is translated to JSONB operations on
 * data_rows (see lib/data-postgres.js parseInsert/parseUpdate/parseDelete).
 * For sqlite projects, runs the statement directly against data.db.
 */
import { json } from '@sveltejs/kit';
import {
	execDataSql, initDataDb,
	isPostgresProject, pgExecDataSql,
} from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const { project, sql } = body;

		if (!project) return json({ error: 'Missing required field: project' }, { status: 400 });
		if (!sql) return json({ error: 'Missing required field: sql' }, { status: 400 });

		if (isPostgresProject(project)) {
			const result = await pgExecDataSql(project, sql);
			return json({ success: true, changes: result.changes });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		initDataDb(path);
		const result = execDataSql(path, sql);
		return json({ success: true, changes: result.changes });
	} catch (error) {
		return json({ error: error.message }, { status: 400 });
	}
}
