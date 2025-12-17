/**
 * Project Path Resolution
 *
 * Looks up project paths from JAT config and beads-discovered projects.
 * Used by task creation endpoints to find the correct directory.
 */
import { readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const JAT_CONFIG_PATH = join(homedir(), '.config', 'jat', 'projects.json');

/**
 * @typedef {Object} JatProjectConfig
 * @property {string} [path] - Custom path to project
 * @property {string} [name] - Display name
 * @property {number} [port] - Dev server port
 */

/**
 * @typedef {Object} JatConfig
 * @property {Record<string, JatProjectConfig>} [projects] - Project configurations
 */

/**
 * Read JAT config file
 * @returns {Promise<JatConfig|null>}
 */
async function readJatConfig() {
	try {
		if (!existsSync(JAT_CONFIG_PATH)) {
			return null;
		}
		const content = await readFile(JAT_CONFIG_PATH, 'utf-8');
		return JSON.parse(content);
	} catch {
		return null;
	}
}

/**
 * Scan ~/code for projects with .beads/ directories
 * @returns {Promise<Array<{name: string, path: string}>>}
 */
async function scanBeadsProjects() {
	const codeDir = join(homedir(), 'code');
	if (!existsSync(codeDir)) {
		return [];
	}

	try {
		const entries = await readdir(codeDir, { withFileTypes: true });
		const beadsProjects = [];

		for (const entry of entries) {
			if (!entry.isDirectory() || entry.name.startsWith('.')) {
				continue;
			}

			const projectPath = join(codeDir, entry.name);
			const beadsDir = join(projectPath, '.beads');

			if (existsSync(beadsDir)) {
				beadsProjects.push({
					name: entry.name,
					path: projectPath
				});
			}
		}

		return beadsProjects;
	} catch {
		return [];
	}
}

/**
 * Get the filesystem path for a project by name
 *
 * Looks up in order:
 * 1. JAT config (supports custom paths)
 * 2. Beads-discovered projects (~/code/{name}/.beads/)
 * 3. Default fallback (~/code/{name})
 *
 * @param {string} projectName - Project name (e.g., "chimaro", "jat")
 * @returns {Promise<{path: string, source: 'jat-config' | 'beads-discovered' | 'default', exists: boolean}>}
 */
/**
 * Normalize a project name for comparison
 * Handles: case, underscores vs hyphens, spaces
 * @param {string} name
 * @returns {string}
 */
function normalizeProjectName(name) {
	return name.toLowerCase().replace(/[-_\s]/g, '');
}

export async function getProjectPath(projectName) {
	const normalizedName = normalizeProjectName(projectName);

	// 1. Check JAT config first (supports custom paths like /code/projects/foo)
	const jatConfig = await readJatConfig();
	if (jatConfig?.projects) {
		for (const [key, config] of Object.entries(jatConfig.projects)) {
			if (normalizeProjectName(key) === normalizedName) {
				const path = config.path?.replace(/^~/, homedir()) || join(homedir(), 'code', key);
				return {
					path,
					source: 'jat-config',
					exists: existsSync(path)
				};
			}
		}
	}

	// 2. Check beads-discovered projects
	const beadsProjects = await scanBeadsProjects();
	const beadsProject = beadsProjects.find(p => normalizeProjectName(p.name) === normalizedName);
	if (beadsProject) {
		return {
			path: beadsProject.path,
			source: 'beads-discovered',
			exists: true // If it has .beads/, it exists
		};
	}

	// 3. Default fallback
	const defaultPath = join(homedir(), 'code', projectName);
	return {
		path: defaultPath,
		source: 'default',
		exists: existsSync(defaultPath)
	};
}
