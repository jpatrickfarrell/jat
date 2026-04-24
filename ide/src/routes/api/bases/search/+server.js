/**
 * Base Search API
 * GET  /api/bases/search?project=X&q=QUERY[&limit=20]  - Search (FTS5 on SQLite, ILIKE on postgres)
 * POST /api/bases/search?project=X                      - Same semantics; body { q, limit? }
 *
 * POST is preferred for postgres-backed projects since FTS5 tables don't exist
 * there; search runs via ILIKE on name + description.  GET is preserved for
 * existing callers.
 */
import { json } from '@sveltejs/kit';
import { searchBases } from '$lib/server/jat-bases.js';
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

async function runSearch(project, query, limit) {
	const { path, exists } = await getProjectPath(project);
	if (!exists) {
		return { error: `Project not found: ${project}`, status: 404 };
	}

	const pgUrl = getPostgresUrlForProject(project);
	const results = pgUrl
		? await pgBases.searchBases(pgUrl, { project, query, limit })
		: searchBases(path, query, { limit });
	return { results };
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const project = url.searchParams.get('project');
	const query = url.searchParams.get('q');
	const limit = parseInt(url.searchParams.get('limit') || '20');

	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}
	if (!query) {
		return json({ error: 'Missing required parameter: q' }, { status: 400 });
	}

	try {
		const out = await runSearch(project, query, limit);
		if (out.error) return json({ error: out.error }, { status: out.status });
		return json({ results: out.results });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ url, request }) {
	const project = url.searchParams.get('project');
	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	let body;
	try {
		body = await request.json();
	} catch {
		body = {};
	}

	const query = body.q ?? body.query;
	const limit = Number.isFinite(body.limit) ? body.limit : 20;

	if (!query || typeof query !== 'string') {
		return json({ error: 'Missing required field: q' }, { status: 400 });
	}

	try {
		const out = await runSearch(project, query, limit);
		if (out.error) return json({ error: out.error }, { status: out.status });
		return json({ results: out.results });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
