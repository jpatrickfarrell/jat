/**
 * Create Directory API
 * POST /api/directories/create
 *
 * Creates a new directory at the specified path.
 * Only allows creation within ~/code/ for security.
 */

import { json } from '@sveltejs/kit';
import { mkdir, stat } from 'fs/promises';
import { homedir } from 'os';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { path } = await request.json();

		if (!path) {
			return json({ error: 'Path is required' }, { status: 400 });
		}

		// Expand ~ to home directory
		const expandedPath = path.replace(/^~/, homedir());

		// Security: Only allow creation within ~/code/
		const codeDir = `${homedir()}/code`;
		if (!expandedPath.startsWith(codeDir)) {
			return json({
				error: 'Security restriction',
				message: 'Can only create directories within ~/code/'
			}, { status: 403 });
		}

		// Check if path already exists
		try {
			await stat(expandedPath);
			return json({
				error: 'Directory already exists',
				message: `A directory already exists at ${path}`
			}, { status: 409 });
		} catch {
			// Directory doesn't exist, which is what we want
		}

		// Create the directory
		await mkdir(expandedPath, { recursive: true });

		return json({
			success: true,
			path: expandedPath,
			message: `Created directory: ${path}`
		});
	} catch (error) {
		console.error('[api/directories/create] Error:', error);
		return json({
			error: 'Failed to create directory',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
};
