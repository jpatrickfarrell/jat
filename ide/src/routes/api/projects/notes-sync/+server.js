import { json } from '@sveltejs/kit';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { invalidateCache } from '$lib/server/cache.js';

const CONFIG_FILE = join(homedir(), '.config', 'jat', 'projects.json');

/**
 * POST /api/projects/notes-sync - Sync project notes via sendBeacon on page unload
 * Body: { project: string, notes: string }
 *
 * navigator.sendBeacon() only supports POST, so this thin endpoint handles
 * the notes-only save path used when the page unloads before the debounce fires.
 */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const { project, notes } = body;

		if (!project) {
			return json({ error: 'Project name required' }, { status: 400 });
		}

		if (!existsSync(CONFIG_FILE)) {
			return json({ error: 'Config not found' }, { status: 404 });
		}

		const config = JSON.parse(await readFile(CONFIG_FILE, 'utf-8'));
		if (!config?.projects?.[project]) {
			return json({ error: 'Project not found' }, { status: 404 });
		}

		if (notes !== undefined) {
			if (notes) {
				config.projects[project].notes = notes;
			} else {
				delete config.projects[project].notes;
			}
		}

		await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
		invalidateCache.projects();

		return json({ success: true });
	} catch {
		return json({ error: 'Failed to save notes' }, { status: 500 });
	}
}
