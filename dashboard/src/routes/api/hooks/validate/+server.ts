/**
 * Hook Validation API
 *
 * POST /api/hooks/validate - Validate hook command paths
 *
 * Request body:
 *   { command: string } - The command path to validate
 *
 * Response:
 *   { valid: boolean, exists: boolean, isExecutable: boolean, suggestions?: string[], error?: string }
 */

import { json } from '@sveltejs/kit';
import { existsSync, accessSync, constants, statSync } from 'fs';
import path from 'path';
import type { RequestHandler } from './$types';

// Get the project root directory (parent of dashboard)
function getProjectRoot(): string {
	return process.cwd().replace('/dashboard', '');
}

/**
 * POST /api/hooks/validate
 *
 * Validates a hook command path
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { command } = body as { command: string };

		if (!command || typeof command !== 'string') {
			return json({ error: 'Missing or invalid command in request body' }, { status: 400 });
		}

		const trimmedCommand = command.trim();

		// Empty command
		if (!trimmedCommand) {
			return json({
				valid: false,
				exists: false,
				isExecutable: false,
				error: 'Command path is required'
			});
		}

		// Extract the actual path from the command (first word before any arguments)
		const commandPath = trimmedCommand.split(' ')[0];

		// Resolve relative paths from project root
		let resolvedPath = commandPath;
		if (commandPath.startsWith('./') || commandPath.startsWith('../')) {
			resolvedPath = path.resolve(getProjectRoot(), commandPath);
		} else if (!commandPath.startsWith('/') && !commandPath.startsWith('~')) {
			// Relative path without ./ prefix
			resolvedPath = path.resolve(getProjectRoot(), commandPath);
		} else if (commandPath.startsWith('~')) {
			// Expand home directory
			resolvedPath = commandPath.replace('~', process.env.HOME || '/home');
		}

		const exists = existsSync(resolvedPath);

		if (!exists) {
			// Generate suggestions for common hook locations
			const suggestions = generateSuggestions(commandPath, getProjectRoot());

			return json({
				valid: false,
				exists: false,
				isExecutable: false,
				error: `File not found: ${commandPath}`,
				resolvedPath,
				suggestions
			});
		}

		// Check if it's a file (not a directory)
		const stats = statSync(resolvedPath);
		if (stats.isDirectory()) {
			return json({
				valid: false,
				exists: true,
				isExecutable: false,
				error: 'Path is a directory, not a file'
			});
		}

		// Check if executable
		let isExecutable = false;
		try {
			accessSync(resolvedPath, constants.X_OK);
			isExecutable = true;
		} catch {
			// Not executable
		}

		// Check for spaces in path (warning)
		const hasSpaces = commandPath.includes(' ') && !commandPath.startsWith('"') && !commandPath.startsWith("'");
		const warning = hasSpaces ? 'Path contains spaces - consider quoting the path' : undefined;

		return json({
			valid: true,
			exists: true,
			isExecutable,
			resolvedPath,
			warning: isExecutable ? warning : 'File exists but is not executable (chmod +x)',
			isWarning: !isExecutable || hasSpaces
		});
	} catch (error) {
		console.error('[hooks/validate API] Error:', error);
		return json(
			{
				error: 'Failed to validate command',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

/**
 * Generate path suggestions for common hook locations
 */
function generateSuggestions(originalPath: string, projectRoot: string): string[] {
	const suggestions: string[] = [];
	const filename = path.basename(originalPath);

	// Common hook directories
	const hookDirs = [
		'.claude/hooks',
		'.claude',
		'hooks',
		'scripts'
	];

	for (const dir of hookDirs) {
		const suggestionPath = path.join(projectRoot, dir, filename);
		if (existsSync(suggestionPath)) {
			suggestions.push(`./${dir}/${filename}`);
		}
	}

	// If no suggestions found, suggest common patterns
	if (suggestions.length === 0) {
		if (!originalPath.startsWith('./')) {
			suggestions.push(`./${originalPath}`);
		}
		if (!originalPath.includes('.claude')) {
			suggestions.push(`./.claude/hooks/${filename}`);
		}
	}

	return suggestions.slice(0, 3); // Limit to 3 suggestions
}
