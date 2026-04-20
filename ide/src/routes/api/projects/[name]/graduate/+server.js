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
import {
	resolveIdentity,
	syncIdentityForProject
} from '../../../../../../../lib/identity-sync.js';

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
	const importStatus = typeof body?.importStatus === 'string' ? body.importStatus : null;
	const targetTable = typeof body?.targetTable === 'string' ? body.targetTable : 'project_tasks';

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
			importStatus,
			targetTable,
		});

		// Trailing step: if the project just graduated (or was already graduated
		// and the user is re-running), propagate the operator's JAT identity
		// into the project's Supabase so comment/assignee UUID resolution works
		// out of the box. Best-effort — a failure here does NOT fail the
		// graduation; the result is returned under `identitySync` so the
		// wizard can surface it.
		if (action === 'graduate' && (result?.status === 'graduated' || result?.status === 'already_graduated')) {
			try {
				const identity = resolveIdentity();
				if (identity.email) {
					result.identitySync = await syncIdentityForProject(
						projectName.toLowerCase(),
						identity,
						{ apply: true }
					);
				} else {
					result.identitySync = {
						project: projectName,
						status: 'skip',
						reason: 'no JAT identity resolved (set one in the UserProfile dropdown or git config)'
					};
				}
			} catch (err) {
				const m = err instanceof Error ? err.message : String(err);
				result.identitySync = { project: projectName, status: 'error', reason: m };
			}
		}

		return json(result);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return json({ status: 'error', error: message }, { status: 500 });
	}
}
