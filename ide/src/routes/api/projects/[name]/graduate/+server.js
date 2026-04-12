/**
 * Project Graduation API
 *
 * GET /api/projects/[name]/graduate
 *   -> returns { suggestedUrl } if Supabase credentials are stored for this project
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
import { execSync } from 'child_process';
import { graduateProject } from '../../../../../../../lib/tasks-graduate.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
	const projectName = params.name?.toLowerCase();
	if (!projectName) throw error(400, 'Missing project name');

	// Try to build a Postgres connection string from stored Supabase credentials.
	// Looks for secrets named {project}-supabase-url and {project}-supabase-db-password.
	try {
		const getSecret = (name) => {
			try {
				return execSync(`jat-secret ${name} 2>/dev/null`, { encoding: 'utf8' }).trim();
			} catch {
				return '';
			}
		};

		const supabaseUrl = getSecret(`${projectName}-supabase-url`);
		const dbPassword = getSecret(`${projectName}-supabase-db-password`);

		if (supabaseUrl && dbPassword) {
			// Extract project ref from https://{ref}.supabase.co
			const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
			if (match) {
				const ref = match[1];
				const suggestedUrl = `postgresql://postgres:${dbPassword}@db.${ref}.supabase.co:5432/postgres`;
				return json({ suggestedUrl });
			}
		}
	} catch {
		// Ignore errors — just return no suggestion
	}

	return json({ suggestedUrl: null });
}

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
	const markAllInternal = body?.markAllInternal === true;

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
			markAllInternal,
		});
		return json(result);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return json({ status: 'error', error: message }, { status: 500 });
	}
}
