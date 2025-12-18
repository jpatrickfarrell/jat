/**
 * API endpoint to discover available Claude agent slash commands
 *
 * Commands are discovered from:
 * 1. ~/.claude/commands/{namespace}/*.md - Global namespaced commands
 * 2. .claude/commands/*.md - Project-local commands
 */

import { json } from '@sveltejs/kit';
import { readdirSync, existsSync, statSync, lstatSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';

export interface SlashCommand {
	/** Command name (e.g., "start", "complete") */
	name: string;
	/** Full invocation (e.g., "/jat:start", "/prune-resume") */
	invocation: string;
	/** Namespace (e.g., "jat" for global, "local" for project-local) */
	namespace: string;
	/** Source file path */
	path: string;
}

/**
 * Check if a path is a file (follows symlinks)
 */
function isFileOrSymlinkToFile(path: string): boolean {
	try {
		// statSync follows symlinks, so this checks the target
		return statSync(path).isFile();
	} catch {
		return false;
	}
}

/**
 * Discover commands from a directory
 */
function discoverCommands(dir: string, namespace: string, prefix: string): SlashCommand[] {
	const commands: SlashCommand[] = [];

	if (!existsSync(dir)) {
		return commands;
	}

	try {
		const entries = readdirSync(dir, { withFileTypes: true });

		for (const entry of entries) {
			if (entry.name.endsWith('.md')) {
				const fullPath = join(dir, entry.name);
				// Check if it's a file or a symlink to a file
				if (entry.isFile() || (entry.isSymbolicLink() && isFileOrSymlinkToFile(fullPath))) {
					const name = basename(entry.name, '.md');
					commands.push({
						name,
						invocation: prefix ? `/${prefix}:${name}` : `/${name}`,
						namespace,
						path: fullPath
					});
				}
			}
		}
	} catch (error) {
		console.error(`Error reading commands from ${dir}:`, error);
	}

	return commands;
}

/**
 * Discover all available commands
 */
function discoverAllCommands(projectPath?: string): SlashCommand[] {
	const allCommands: SlashCommand[] = [];
	const home = homedir();

	// 1. Discover global namespaced commands from ~/.claude/commands/{namespace}/
	const globalCommandsDir = join(home, '.claude', 'commands');
	if (existsSync(globalCommandsDir)) {
		try {
			const namespaces = readdirSync(globalCommandsDir, { withFileTypes: true });
			for (const ns of namespaces) {
				if (ns.isDirectory()) {
					const nsPath = join(globalCommandsDir, ns.name);
					const nsCommands = discoverCommands(nsPath, ns.name, ns.name);
					allCommands.push(...nsCommands);
				}
			}
		} catch (error) {
			console.error('Error reading global commands:', error);
		}
	}

	// 2. Discover project-local commands from .claude/commands/
	if (projectPath) {
		const localCommandsDir = join(projectPath, '.claude', 'commands');
		const localCommands = discoverCommands(localCommandsDir, 'local', '');
		allCommands.push(...localCommands);
	}

	// Sort by namespace then name
	allCommands.sort((a, b) => {
		if (a.namespace !== b.namespace) {
			// Put 'jat' first, then 'local', then others
			if (a.namespace === 'jat') return -1;
			if (b.namespace === 'jat') return 1;
			if (a.namespace === 'local') return -1;
			if (b.namespace === 'local') return 1;
			return a.namespace.localeCompare(b.namespace);
		}
		return a.name.localeCompare(b.name);
	});

	return allCommands;
}

export async function GET({ url }: { url: URL }) {
	// Get project path from query param or use default
	const projectPath = url.searchParams.get('project') || process.cwd().replace('/dashboard', '');
	const home = homedir();
	const globalDir = join(home, '.claude', 'commands');

	const commands = discoverAllCommands(projectPath);

	// Include debug info if requested
	const debug = url.searchParams.has('debug');
	const debugInfo = debug
		? {
				homedir: home,
				globalCommandsDir: globalDir,
				globalDirExists: existsSync(globalDir),
				globalDirContents: existsSync(globalDir)
					? readdirSync(globalDir, { withFileTypes: true }).map((e) => ({
							name: e.name,
							isDir: e.isDirectory()
						}))
					: []
			}
		: undefined;

	return json({
		commands,
		count: commands.length,
		project: projectPath,
		...(debug && { debug: debugInfo })
	});
}
