/**
 * Open Folder API - Opens a folder in the system file manager
 * POST /api/open-folder
 * Body: { path: string }
 */

import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { path } = await request.json();

		if (!path) {
			return json({ error: 'Path is required' }, { status: 400 });
		}

		// Expand ~ to home directory
		const expandedPath = path.replace(/^~/, process.env.HOME || '');

		// Security: Verify the path exists and is a directory
		if (!existsSync(expandedPath)) {
			return json({ error: 'Path does not exist' }, { status: 404 });
		}

		// Detect platform and use appropriate command
		const platform = process.platform;
		let command;

		if (platform === 'linux') {
			// Linux: use xdg-open
			command = `xdg-open "${expandedPath}"`;
		} else if (platform === 'darwin') {
			// macOS: use open
			command = `open "${expandedPath}"`;
		} else if (platform === 'win32') {
			// Windows: use explorer
			command = `explorer "${expandedPath.replace(/\//g, '\\')}"`;
		} else {
			return json({ error: `Unsupported platform: ${platform}` }, { status: 500 });
		}

		await execAsync(command);

		return json({
			success: true,
			path: expandedPath,
			platform
		});
	} catch (error) {
		console.error('Error opening folder:', error);
		return json(
			{
				error: 'Failed to open folder',
				message: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
}
