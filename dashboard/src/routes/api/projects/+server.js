/**
 * Projects API
 * GET /api/projects - List directories in ~/code/
 */

import { json } from '@sveltejs/kit';
import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export async function GET() {
	try {
		const codeDir = join(homedir(), 'code');

		if (!existsSync(codeDir)) {
			return json({ projects: [] });
		}

		const entries = await readdir(codeDir, { withFileTypes: true });

		// Filter to only directories, exclude hidden dirs
		const projects = entries
			.filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
			.map(entry => entry.name)
			.sort();

		return json({ projects });
	} catch (error) {
		console.error('Failed to list projects:', error);
		return json({ projects: [], error: error.message }, { status: 500 });
	}
}
