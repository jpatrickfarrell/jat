/**
 * Hook Validation API
 *
 * POST /api/hooks/validate - Validate hook command paths
 *
 * Request body:
 *   { command: string } - The command path to validate
 *
 * Response:
 *   {
 *     valid: boolean,
 *     exists: boolean,
 *     isExecutable: boolean,
 *     hasShebang: boolean,
 *     shebang?: string,
 *     scriptType?: string,
 *     suggestions?: string[],
 *     error?: string,
 *     warnings?: string[],
 *     fixes?: { description: string, command: string }[]
 *   }
 */

import { json } from '@sveltejs/kit';
import { existsSync, accessSync, constants, statSync, readFileSync } from 'fs';
import path from 'path';
import type { RequestHandler } from './$types';

// Common shebangs and their script types
const SHEBANG_PATTERNS: Record<string, string> = {
	'#!/bin/bash': 'bash',
	'#!/usr/bin/env bash': 'bash',
	'#!/bin/sh': 'shell',
	'#!/usr/bin/env sh': 'shell',
	'#!/usr/bin/env node': 'node',
	'#!/usr/bin/node': 'node',
	'#!/usr/bin/env python': 'python',
	'#!/usr/bin/env python3': 'python',
	'#!/usr/bin/python': 'python',
	'#!/usr/bin/python3': 'python',
	'#!/usr/bin/env ruby': 'ruby',
	'#!/usr/bin/ruby': 'ruby',
	'#!/usr/bin/env perl': 'perl',
	'#!/usr/bin/perl': 'perl'
};

// File extensions and their expected script types
const EXTENSION_TYPES: Record<string, string> = {
	'.sh': 'bash',
	'.bash': 'bash',
	'.js': 'node',
	'.mjs': 'node',
	'.cjs': 'node',
	'.ts': 'node',
	'.py': 'python',
	'.rb': 'ruby',
	'.pl': 'perl'
};

// Get the project root directory (parent of ide)
function getProjectRoot(): string {
	return process.cwd().replace('/ide', '');
}

/**
 * Parse script content for shebang and type detection
 */
function parseScriptContent(filePath: string): {
	hasShebang: boolean;
	shebang?: string;
	scriptType?: string;
	firstLines?: string[];
} {
	try {
		const content = readFileSync(filePath, 'utf-8');
		const lines = content.split('\n').slice(0, 5); // Read first 5 lines
		const firstLine = lines[0]?.trim() || '';

		// Check for shebang
		if (firstLine.startsWith('#!')) {
			// Find matching shebang pattern
			for (const [pattern, type] of Object.entries(SHEBANG_PATTERNS)) {
				if (firstLine.startsWith(pattern)) {
					return {
						hasShebang: true,
						shebang: firstLine,
						scriptType: type,
						firstLines: lines
					};
				}
			}
			// Unknown shebang
			return {
				hasShebang: true,
				shebang: firstLine,
				scriptType: 'unknown',
				firstLines: lines
			};
		}

		return { hasShebang: false, firstLines: lines };
	} catch {
		return { hasShebang: false };
	}
}

/**
 * Detect script type from file extension
 */
function detectTypeFromExtension(filePath: string): string | undefined {
	const ext = path.extname(filePath).toLowerCase();
	return EXTENSION_TYPES[ext];
}

/**
 * Generate actionable fix suggestions
 */
function generateFixes(
	filePath: string,
	isExecutable: boolean,
	hasShebang: boolean,
	extensionType?: string
): { description: string; command: string }[] {
	const fixes: { description: string; command: string }[] = [];

	if (!isExecutable) {
		fixes.push({
			description: 'Make script executable',
			command: `chmod +x ${filePath}`
		});
	}

	if (!hasShebang && extensionType) {
		const shebangs: Record<string, string> = {
			bash: '#!/bin/bash',
			shell: '#!/bin/sh',
			node: '#!/usr/bin/env node',
			python: '#!/usr/bin/env python3',
			ruby: '#!/usr/bin/env ruby',
			perl: '#!/usr/bin/env perl'
		};
		if (shebangs[extensionType]) {
			fixes.push({
				description: `Add shebang line at top of file`,
				command: `sed -i '1i${shebangs[extensionType]}' ${filePath}`
			});
		}
	}

	return fixes;
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

		// Parse script content for shebang and type detection
		const scriptInfo = parseScriptContent(resolvedPath);
		const extensionType = detectTypeFromExtension(resolvedPath);

		// Build warnings array
		const warnings: string[] = [];

		// Check for spaces in path
		const hasSpaces = commandPath.includes(' ') && !commandPath.startsWith('"') && !commandPath.startsWith("'");
		if (hasSpaces) {
			warnings.push('Path contains spaces - consider quoting the path');
		}

		// Check executable status
		if (!isExecutable) {
			warnings.push('File exists but is not executable');
		}

		// Check for shebang
		if (!scriptInfo.hasShebang) {
			warnings.push('Script is missing a shebang line (e.g., #!/bin/bash)');
		}

		// Check for extension/shebang mismatch
		if (scriptInfo.hasShebang && extensionType && scriptInfo.scriptType) {
			if (scriptInfo.scriptType !== extensionType && scriptInfo.scriptType !== 'unknown') {
				warnings.push(
					`Extension suggests ${extensionType} but shebang indicates ${scriptInfo.scriptType}`
				);
			}
		}

		// Generate actionable fixes
		const fixes = generateFixes(resolvedPath, isExecutable, scriptInfo.hasShebang, extensionType);

		// Determine if this is valid (exists and executable with shebang)
		const isFullyValid = isExecutable && scriptInfo.hasShebang;

		return json({
			valid: true, // File exists and can be used (may have warnings)
			exists: true,
			isExecutable,
			hasShebang: scriptInfo.hasShebang,
			shebang: scriptInfo.shebang,
			scriptType: scriptInfo.scriptType || extensionType,
			resolvedPath,
			warnings: warnings.length > 0 ? warnings : undefined,
			fixes: fixes.length > 0 ? fixes : undefined,
			isWarning: warnings.length > 0,
			isFullyValid
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
