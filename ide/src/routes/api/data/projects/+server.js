/**
 * Data Projects API
 * GET /api/data/projects  - List projects from projects.json (same source as TopBar ProjectSelector)
 */
import { json } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CONFIG_FILE = join(homedir(), '.config', 'jat', 'projects.json');
const IDE_SETTINGS_FILE = join(homedir(), '.config', 'jat', 'ide-projects.json');

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	try {
		// Read projects.json (source of truth)
		if (!existsSync(CONFIG_FILE)) {
			return json({ projects: [] });
		}
		const config = JSON.parse(await readFile(CONFIG_FILE, 'utf-8'));
		const projectEntries = config?.projects || {};

		// Read IDE hidden projects
		let hiddenProjects = [];
		try {
			if (existsSync(IDE_SETTINGS_FILE)) {
				const ideSettings = JSON.parse(await readFile(IDE_SETTINGS_FILE, 'utf-8'));
				hiddenProjects = ideSettings?.hiddenProjects || [];
			}
		} catch { /* ignore */ }

		const hiddenSet = new Set(hiddenProjects.map(h => h.toLowerCase()));
		const projects = [];

		for (const [key, cfg] of Object.entries(projectEntries)) {
			// Skip hidden projects (case-insensitive)
			if (hiddenSet.has(key.toLowerCase())) continue;

			const projectPath = (cfg.path || `~/code/${key}`).replace(/^~/, homedir());
			const jatDir = join(projectPath, '.jat');

			// Only include projects that have .jat/ directory
			if (!existsSync(jatDir)) continue;

			const hasDataDb = existsSync(join(jatDir, 'data.db'));
			projects.push({
				name: key,
				hasDataDb,
			});
		}

		projects.sort((a, b) => a.name.localeCompare(b.name));
		return json({ projects });
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return json({ error: message }, { status: 500 });
	}
}
