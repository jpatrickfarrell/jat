/**
 * Projects Init API
 * POST /api/projects/init - Initialize a new project with JAT Tasks
 *
 * Request body:
 *   { path: string, name?: string, prefix?: string, description?: string,
 *     port?: number, dev_command?: string, server_path?: string,
 *     agent_program?: string, active_color?: string, inactive_color?: string,
 *     secrets?: Record<string, string> }
 *
 *   All fields except `path` are optional — backward compatible.
 *
 * Response:
 *   { success: true, project: { name, path, prefix, ...extra }, message, steps }
 *   or { error: true, message: string, type: string }
 *
 * Behavior (unified onboarding flow):
 *   1. Creates directory if it doesn't exist
 *   2. Initializes git if not already a git repository
 *   3. Runs jt init to set up JAT Tasks
 *   4. Adds project to ~/.config/jat/projects.json with all provided fields
 *   5. Stores secrets via jat-secret if provided
 *
 * Security:
 *   - Only allows paths under user's home directory
 */

import { json } from '@sveltejs/kit';
import { existsSync, statSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join, basename, resolve, normalize } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { invalidateCache } from '$lib/server/cache.js';
import { initProject } from '$lib/server/jat-tasks.js';

const execAsync = promisify(exec);

const CONFIG_DIR = join(homedir(), '.config', 'jat');
const CONFIG_FILE = join(CONFIG_DIR, 'projects.json');

/**
 * Expand ~ to home directory and resolve to absolute path
 * @param {string} inputPath
 * @returns {string}
 */
function expandPath(inputPath) {
	const expanded = inputPath.replace(/^~/, homedir());
	return resolve(expanded);
}

/**
 * Check if path is safe (under home directory)
 * Case-insensitive on macOS/Windows where filesystems are case-insensitive
 * @param {string} absolutePath
 * @returns {boolean}
 */
function isPathAllowed(absolutePath) {
	const home = homedir();
	const normalized = normalize(absolutePath);
	// macOS and Windows have case-insensitive filesystems
	return normalized.toLowerCase().startsWith(home.toLowerCase());
}

/**
 * Check if path is a git repository
 * @param {string} path
 * @returns {Promise<boolean>}
 */
async function isGitRepo(path) {
	try {
		await execAsync('git rev-parse --git-dir', { cwd: path, timeout: 5000 });
		return true;
	} catch {
		return false;
	}
}

/**
 * Check if .jat/ already exists
 * @param {string} path
 * @returns {boolean}
 */
function hasJatInit(path) {
	return existsSync(join(path, '.jat'));
}

/**
 * Add project to projects.json with optional extended config fields
 * @param {string} projectKey - Project key (prefix or basename)
 * @param {string} absolutePath - Absolute path to project
 * @param {object} [extra] - Optional extra fields to persist
 * @param {string} [extra.name] - Display name
 * @param {string} [extra.description] - Project description
 * @param {number} [extra.port] - Dev server port
 * @param {string} [extra.dev_command] - Dev server command
 * @param {string} [extra.server_path] - Server path prefix
 * @param {string} [extra.agent_program] - Default agent program
 * @param {string} [extra.active_color] - Active color
 * @param {string} [extra.inactive_color] - Inactive color
 */
function addProjectToConfig(projectKey, absolutePath, extra = {}) {
	// Ensure config directory exists
	if (!existsSync(CONFIG_DIR)) {
		mkdirSync(CONFIG_DIR, { recursive: true });
	}

	// Read existing config or create new one
	let config = { projects: {}, defaults: {} };
	if (existsSync(CONFIG_FILE)) {
		try {
			const content = readFileSync(CONFIG_FILE, 'utf-8');
			config = JSON.parse(content);
			if (!config.projects) config.projects = {};
		} catch (err) {
			console.error('Failed to read config, creating new:', err);
		}
	}

	// Build project entry — start with existing or defaults
	const existing = config.projects[projectKey] || {};
	const entry = {
		name: extra.name || existing.name || projectKey.toUpperCase(),
		path: absolutePath,
		...existing
	};
	// Overwrite path in case it changed
	entry.path = absolutePath;

	// Apply optional fields (only if provided)
	const optionalFields = ['description', 'port', 'dev_command', 'server_path', 'agent_program', 'active_color', 'inactive_color'];
	for (const field of optionalFields) {
		if (extra[field] !== undefined) {
			entry[field] = extra[field];
		}
	}

	config.projects[projectKey] = entry;
	writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

/**
 * Store secrets via jat-secret CLI
 * @param {string} projectKey - Project prefix for secret names
 * @param {Record<string, string>} secrets - Key-value pairs to store
 * @returns {Promise<string[]>} - List of stored secret keys
 */
async function storeSecrets(projectKey, secrets) {
	const stored = [];
	for (const [key, value] of Object.entries(secrets)) {
		const secretName = `${projectKey}-${key}`;
		try {
			await execAsync(`jat-secret --set ${JSON.stringify(secretName)} ${JSON.stringify(String(value))}`, { timeout: 10000 });
			stored.push(key);
		} catch (err) {
			console.error(`Failed to store secret ${secretName}:`, err);
		}
	}
	return stored;
}


/**
 * POST /api/projects/init
 * Unified project onboarding - creates directory, inits git, inits jat, adds to config
 */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const steps = []; // Track what actions were taken

		// Validate path is provided
		if (!body.path || typeof body.path !== 'string') {
			return json(
				{ error: true, message: 'Path is required', type: 'validation_error' },
				{ status: 400 }
			);
		}

		const inputPath = body.path.trim();
		if (!inputPath) {
			return json(
				{ error: true, message: 'Path cannot be empty', type: 'validation_error' },
				{ status: 400 }
			);
		}

		// Expand and resolve path
		const absolutePath = expandPath(inputPath);

		// Security: Check path is under home directory
		if (!isPathAllowed(absolutePath)) {
			return json(
				{
					error: true,
					message: `Path must be under your home directory. Got: ${inputPath}`,
					type: 'security_error'
				},
				{ status: 403 }
			);
		}

		// STEP 1: Create directory if it doesn't exist (anywhere under home directory)
		if (!existsSync(absolutePath)) {
			try {
				mkdirSync(absolutePath, { recursive: true });
				steps.push(`Created directory: ${inputPath}`);
			} catch (mkdirError) {
				return json(
					{
						error: true,
						message: `Failed to create directory: ${mkdirError instanceof Error ? mkdirError.message : 'Unknown error'}`,
						type: 'mkdir_failed'
					},
					{ status: 500 }
				);
			}
		}

		// Check path is a directory (in case a file exists at that path)
		const stats = statSync(absolutePath);
		if (!stats.isDirectory()) {
			return json(
				{
					error: true,
					message: `Path is not a directory: ${absolutePath}`,
					type: 'validation_error'
				},
				{ status: 400 }
			);
		}

		// STEP 2: Initialize git if not a git repo
		const isGit = await isGitRepo(absolutePath);
		if (!isGit) {
			try {
				await execAsync('git init', { cwd: absolutePath, timeout: 10000 });
				steps.push('Initialized git repository');

				// Create a basic .gitignore
				const gitignorePath = join(absolutePath, '.gitignore');
				if (!existsSync(gitignorePath)) {
					writeFileSync(gitignorePath, 'node_modules/\n.env\n.DS_Store\n*.log\n');
					steps.push('Created .gitignore');
				}
			} catch (gitError) {
				return json(
					{
						error: true,
						message: `Failed to initialize git: ${gitError instanceof Error ? gitError.message : 'Unknown error'}`,
						type: 'git_init_failed'
					},
					{ status: 500 }
				);
			}
		}

		// Extract extended config fields from request body
		const dirBasename = basename(absolutePath);
		const projectKey = body.prefix || dirBasename;
		const projectDisplayName = body.name || projectKey.toUpperCase();
		const extraConfig = {};
		if (body.name) extraConfig.name = body.name;
		if (body.description) extraConfig.description = body.description;
		if (body.port !== undefined) extraConfig.port = body.port;
		if (body.dev_command) extraConfig.dev_command = body.dev_command;
		if (body.server_path) extraConfig.server_path = body.server_path;
		if (body.agent_program) extraConfig.agent_program = body.agent_program;
		if (body.active_color) extraConfig.active_color = body.active_color;
		if (body.inactive_color) extraConfig.inactive_color = body.inactive_color;

		/** @param {string[]} secretsStored */
		const buildProjectResponse = (secretsStored = []) => ({
			name: projectDisplayName,
			path: absolutePath,
			prefix: projectKey,
			...(body.description && { description: body.description }),
			...(body.port !== undefined && { port: body.port }),
			...(body.dev_command && { dev_command: body.dev_command }),
			...(body.server_path && { server_path: body.server_path }),
			...(body.agent_program && { agent_program: body.agent_program }),
			...(body.active_color && { active_color: body.active_color }),
			...(body.inactive_color && { inactive_color: body.inactive_color }),
			...(secretsStored.length > 0 && { secrets_stored: secretsStored })
		});

		// STEP 3: Check if JAT Tasks is already initialized
		if (hasJatInit(absolutePath)) {
			// Already initialized - add/update config
			addProjectToConfig(projectKey, absolutePath, extraConfig);
			invalidateCache.projects();

			// Store secrets if provided
			let secretsStored = [];
			if (body.secrets && typeof body.secrets === 'object') {
				secretsStored = await storeSecrets(projectKey, body.secrets);
				if (secretsStored.length > 0) steps.push(`Stored ${secretsStored.length} secret(s)`);
			}

			return json({
				success: true,
				project: buildProjectResponse(secretsStored),
				message: steps.length > 0
					? `Project setup complete (JAT was already initialized)`
					: `JAT already initialized in ${projectDisplayName}`,
				steps,
				alreadyInitialized: true
			}, { status: 200 });
		}

		// STEP 4: Initialize task database
		try {
			initProject(absolutePath);
			steps.push('Initialized task management');

			// Add project to projects.json
			addProjectToConfig(projectKey, absolutePath, extraConfig);
			steps.push('Added to JAT configuration');

			// Store secrets if provided
			let secretsStored = [];
			if (body.secrets && typeof body.secrets === 'object') {
				secretsStored = await storeSecrets(projectKey, body.secrets);
				if (secretsStored.length > 0) steps.push(`Stored ${secretsStored.length} secret(s)`);
			}

			// Invalidate projects cache
			invalidateCache.projects();

			return json({
				success: true,
				project: buildProjectResponse(secretsStored),
				message: `Successfully set up project: ${projectDisplayName}`,
				steps
			}, { status: 201 });

		} catch (initError) {
			const err = /** @type {{ message?: string }} */ (initError);
			console.error('initProject failed:', err);

			return json(
				{
					error: true,
					message: `Failed to initialize tasks: ${err.message}`,
					type: 'init_failed',
					steps // Include steps taken before failure
				},
				{ status: 500 }
			);
		}

	} catch (error) {
		console.error('Error in projects/init:', error);
		return json(
			{
				error: true,
				message: error instanceof Error ? error.message : 'Internal server error',
				type: 'server_error'
			},
			{ status: 500 }
		);
	}
}
