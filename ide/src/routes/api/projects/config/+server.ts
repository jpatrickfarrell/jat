/**
 * GET /api/projects/config?path=<project-path>
 *
 * Reads and returns the parsed jat.config.json from the given project path.
 * Used by the Create Project wizard to pre-fill fields and show integration options.
 *
 * Response:
 *   { success: true, config: { ... } }
 *   { success: false, error: "No jat.config.json found" }
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

export const GET: RequestHandler = async ({ url }) => {
	const path = url.searchParams.get('path');
	if (!path) {
		return json({ success: false, error: 'path parameter is required' }, { status: 400 });
	}

	// Expand ~ to home directory
	const resolvedPath = path.startsWith('~') ? path.replace('~', homedir()) : path;

	const configPath = join(resolvedPath, 'jat.config.json');

	if (!existsSync(configPath)) {
		return json({ success: false, error: 'No jat.config.json found' });
	}

	try {
		const raw = readFileSync(configPath, 'utf-8');
		const config = JSON.parse(raw);
		return json({ success: true, config });
	} catch {
		return json({ success: false, error: 'Failed to parse jat.config.json' });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const { path, config } = await request.json();
	if (!path || !config) {
		return json({ success: false, error: 'path and config required' }, { status: 400 });
	}
	const resolvedPath = path.startsWith('~') ? path.replace('~', homedir()) : path;
	const configPath = join(resolvedPath, 'jat.config.json');
	try {
		writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
		return json({ success: true });
	} catch (err: any) {
		return json({ success: false, error: err.message }, { status: 500 });
	}
};
