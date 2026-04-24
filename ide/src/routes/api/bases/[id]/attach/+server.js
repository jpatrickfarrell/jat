/**
 * Task ↔ Base Attachment API
 * POST   /api/bases/[id]/attach        - Attach a base to a task
 *   body: { project, taskId, attached_by? }
 * DELETE /api/bases/[id]/attach        - Detach a base from a task
 *   body: { project, taskId }  (also accepts ?project=&taskId= query params)
 *
 * Routes to postgres (task_bases table) when the project is graduated,
 * otherwise uses the SQLite task_bases table in .jat/data.db.  The base must
 * exist in the same backend (creating a base in sqlite then attaching via
 * postgres will 404).
 */
import { json } from '@sveltejs/kit';
import { attachBaseToTask, detachBaseFromTask, initBasesDb } from '$lib/server/jat-bases.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { resolveBackendForProject } from '../../../../../../../lib/projects-config.js';
import * as pgBases from '../../../../../../../lib/bases-postgres.js';

function getPostgresUrlForProject(projectName) {
	try {
		const cfg = resolveBackendForProject(projectName);
		return cfg.kind === 'postgres' ? cfg.url : null;
	} catch {
		return null;
	}
}

async function readBody(request) {
	try {
		return await request.json();
	} catch {
		return {};
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const baseId = params.id;
	const body = await readBody(request);
	const { project, taskId, attached_by } = body;

	if (!project) {
		return json({ error: 'Missing required field: project' }, { status: 400 });
	}
	if (!taskId) {
		return json({ error: 'Missing required field: taskId' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const pgUrl = getPostgresUrlForProject(project);
		let result;
		if (pgUrl) {
			result = await pgBases.attachBaseToTask(pgUrl, taskId, baseId, { attached_by });
		} else {
			initBasesDb(path);
			result = attachBaseToTask(path, taskId, baseId, { attached_by });
		}

		return json({ success: true, ...result });
	} catch (error) {
		if (error.message?.includes('not found')) {
			return json({ error: error.message }, { status: 404 });
		}
		return json({ error: error.message }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params, url, request }) {
	const baseId = params.id;
	const body = await readBody(request);
	const project = body.project || url.searchParams.get('project');
	const taskId = body.taskId || url.searchParams.get('taskId');

	if (!project) {
		return json({ error: 'Missing required field: project' }, { status: 400 });
	}
	if (!taskId) {
		return json({ error: 'Missing required field: taskId' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const pgUrl = getPostgresUrlForProject(project);
		const result = pgUrl
			? await pgBases.detachBaseFromTask(pgUrl, taskId, baseId)
			: detachBaseFromTask(path, taskId, baseId);

		return json({ success: true, ...result });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
