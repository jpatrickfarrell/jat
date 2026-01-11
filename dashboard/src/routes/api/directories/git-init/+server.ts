/**
 * Git Init API
 * POST /api/directories/git-init
 *
 * Initializes a git repository in the specified directory.
 * Only allows initialization within ~/code/ for security.
 */

import { json } from '@sveltejs/kit';
import { stat } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { homedir } from 'os';
import type { RequestHandler } from './$types';

const execAsync = promisify(exec);

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { path } = await request.json();

		if (!path) {
			return json({ error: 'Path is required' }, { status: 400 });
		}

		// Expand ~ to home directory
		const expandedPath = path.replace(/^~/, homedir());

		// Security: Only allow git init within ~/code/
		const codeDir = `${homedir()}/code`;
		if (!expandedPath.startsWith(codeDir)) {
			return json({
				error: 'Security restriction',
				message: 'Can only initialize git within ~/code/'
			}, { status: 403 });
		}

		// Check if path exists and is a directory
		try {
			const stats = await stat(expandedPath);
			if (!stats.isDirectory()) {
				return json({
					error: 'Not a directory',
					message: `${path} is not a directory`
				}, { status: 400 });
			}
		} catch {
			return json({
				error: 'Directory not found',
				message: `Directory does not exist: ${path}`
			}, { status: 404 });
		}

		// Check if already a git repo
		try {
			await execAsync('git rev-parse --git-dir', { cwd: expandedPath });
			return json({
				error: 'Already a git repository',
				message: `${path} is already a git repository`
			}, { status: 409 });
		} catch {
			// Not a git repo, which is what we want
		}

		// Initialize git repository
		const { stdout, stderr } = await execAsync('git init', { cwd: expandedPath });

		// Create initial .gitignore if it doesn't exist
		try {
			await execAsync('test -f .gitignore || echo "node_modules/\n.env\n.DS_Store\n*.log" > .gitignore', { cwd: expandedPath });
		} catch {
			// Ignore .gitignore creation errors
		}

		return json({
			success: true,
			path: expandedPath,
			message: 'Git repository initialized successfully',
			output: stdout || stderr
		});
	} catch (error) {
		console.error('[api/directories/git-init] Error:', error);
		return json({
			error: 'Failed to initialize git',
			message: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 500 });
	}
};
