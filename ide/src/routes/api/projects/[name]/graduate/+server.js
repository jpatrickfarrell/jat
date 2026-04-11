/**
 * Project Graduation API
 *
 * POST /api/projects/[name]/graduate
 *   body: { action: "preview", url?: string }
 *     -> runs graduateProject({ dryRun: true }) and returns the migration summary
 *   body: { action: "graduate", url: string, force?: boolean }
 *     -> runs graduateProject() for real, then returns the result
 *
 * Backed by lib/tasks-graduate.js — see that module's header for the full
 * step-by-step contract and failure modes.
 */

import { json, error } from '@sveltejs/kit';
import { graduateProject } from '../../../../../../../lib/tasks-graduate.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const projectName = params.name;
	if (!projectName) {
		throw error(400, 'Missing project name');
	}

	let body;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	const action = body?.action;
	if (action !== 'preview' && action !== 'graduate') {
		throw error(400, 'action must be "preview" or "graduate"');
	}

	const url = typeof body?.url === 'string' ? body.url.trim() : '';
	const force = body?.force === true;

	if (action === 'graduate') {
		if (!url) {
			throw error(400, 'url is required for action=graduate');
		}
		if (!url.startsWith('postgres://') && !url.startsWith('postgresql://')) {
			throw error(
				400,
				'url must start with postgres:// or postgresql://',
			);
		}
	}

	try {
		const result = await graduateProject({
			projectNameOrPath: projectName,
			postgresUrl: url,
			dryRun: action === 'preview',
			force,
		});
		return json(result);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return json({ status: 'error', error: message }, { status: 500 });
	}
}
