/**
 * API endpoint to import slash commands from a JSON file
 *
 * POST /api/commands/import
 * - Accepts a JSON file with commands export format
 * - Creates new commands and optionally overwrites existing ones
 * - Query params:
 *   - overwrite: If 'true', overwrites existing commands (default: false)
 */

import { json, error } from '@sveltejs/kit';
import { writeFile, mkdir, access } from 'fs/promises';
import { join, dirname } from 'path';
import { homedir } from 'os';
import type { RequestHandler } from './$types';

// Regex patterns for validation
const NAMESPACE_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;
const NAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;
const LOCAL_NAMESPACE = 'local';

interface ImportedCommand {
	name: string;
	namespace: string;
	invocation?: string;
	content: string;
}

interface CommandsImport {
	version: number;
	exportedAt?: string;
	commandCount?: number;
	commands: ImportedCommand[];
}

interface ImportResult {
	name: string;
	namespace: string;
	status: 'created' | 'updated' | 'skipped' | 'error';
	message?: string;
}

/**
 * Validate namespace and name against security patterns
 */
function validateCommandPath(namespace: string, name: string): string | null {
	if (
		namespace.includes('..') ||
		namespace.includes('/') ||
		namespace.includes('\\') ||
		name.includes('..') ||
		name.includes('/') ||
		name.includes('\\')
	) {
		return 'Path traversal not allowed';
	}

	if (!NAMESPACE_REGEX.test(namespace)) {
		return `Invalid namespace format: "${namespace}"`;
	}

	if (!NAME_REGEX.test(name)) {
		return `Invalid command name format: "${name}"`;
	}

	return null;
}

/**
 * Resolve full path to command file
 */
function resolveCommandFilePath(namespace: string, name: string, projectPath: string): string {
	if (namespace === LOCAL_NAMESPACE) {
		return join(projectPath, '.claude', 'commands', `${name}.md`);
	} else {
		return join(homedir(), '.claude', 'commands', namespace, `${name}.md`);
	}
}

/**
 * Check if a file exists
 */
async function fileExists(path: string): Promise<boolean> {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
}

/**
 * POST /api/commands/import
 *
 * Import commands from a JSON file
 */
export const POST: RequestHandler = async ({ url, request }) => {
	const projectPath = url.searchParams.get('project') || process.cwd().replace('/ide', '');
	const overwrite = url.searchParams.get('overwrite') === 'true';

	// Parse request body
	let importData: CommandsImport;
	try {
		importData = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body');
	}

	// Validate import format
	if (!importData.commands || !Array.isArray(importData.commands)) {
		throw error(400, 'Invalid import format: missing "commands" array');
	}

	if (importData.commands.length === 0) {
		throw error(400, 'No commands to import');
	}

	const results: ImportResult[] = [];

	for (const cmd of importData.commands) {
		// Validate required fields
		if (!cmd.name || typeof cmd.name !== 'string') {
			results.push({
				name: cmd.name || '(unknown)',
				namespace: cmd.namespace || '(unknown)',
				status: 'error',
				message: 'Missing or invalid "name" field'
			});
			continue;
		}

		if (!cmd.namespace || typeof cmd.namespace !== 'string') {
			results.push({
				name: cmd.name,
				namespace: '(unknown)',
				status: 'error',
				message: 'Missing or invalid "namespace" field'
			});
			continue;
		}

		if (!cmd.content || typeof cmd.content !== 'string') {
			results.push({
				name: cmd.name,
				namespace: cmd.namespace,
				status: 'error',
				message: 'Missing or invalid "content" field'
			});
			continue;
		}

		// Validate path components
		const validationError = validateCommandPath(cmd.namespace, cmd.name);
		if (validationError) {
			results.push({
				name: cmd.name,
				namespace: cmd.namespace,
				status: 'error',
				message: validationError
			});
			continue;
		}

		const filePath = resolveCommandFilePath(cmd.namespace, cmd.name, projectPath);

		try {
			const exists = await fileExists(filePath);

			if (exists && !overwrite) {
				results.push({
					name: cmd.name,
					namespace: cmd.namespace,
					status: 'skipped',
					message: 'Command already exists (use overwrite=true to update)'
				});
				continue;
			}

			// Ensure parent directory exists
			await mkdir(dirname(filePath), { recursive: true });

			// Write file content
			await writeFile(filePath, cmd.content, 'utf-8');

			results.push({
				name: cmd.name,
				namespace: cmd.namespace,
				status: exists ? 'updated' : 'created'
			});
		} catch (err) {
			results.push({
				name: cmd.name,
				namespace: cmd.namespace,
				status: 'error',
				message: (err as Error).message
			});
		}
	}

	// Count results by status
	const counts = {
		created: results.filter((r) => r.status === 'created').length,
		updated: results.filter((r) => r.status === 'updated').length,
		skipped: results.filter((r) => r.status === 'skipped').length,
		errors: results.filter((r) => r.status === 'error').length
	};

	const success = counts.errors === 0 && (counts.created > 0 || counts.updated > 0);

	return json({
		success,
		message: success
			? `Imported ${counts.created} new command${counts.created !== 1 ? 's' : ''}${counts.updated > 0 ? `, updated ${counts.updated}` : ''}${counts.skipped > 0 ? `, skipped ${counts.skipped} existing` : ''}`
			: `Import completed with ${counts.errors} error${counts.errors !== 1 ? 's' : ''}`,
		counts,
		results
	});
};
