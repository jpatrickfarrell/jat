/**
 * Knowledge Bases API (Unified)
 * GET  /api/bases?project=X[&includeGlobal=true]  - List all bases
 * POST /api/bases                                  - Create base
 *
 * All bases are canvas pages (block-based documents). The old distinction
 * between "bases" and "canvas pages" no longer exists.
 */
import { json } from '@sveltejs/kit';
import { getBases, createBase, initBasesDb } from '$lib/server/jat-bases.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, basename, dirname } from 'path';
import { homedir } from 'os';

const GLOBAL_BASES_DIR = join(homedir(), '.config', 'jat', 'bases');

/**
 * Load global bases from ~/.config/jat/bases/*.json
 * @returns {Array<Object>}
 */
function getGlobalBases() {
	if (!existsSync(GLOBAL_BASES_DIR)) return [];

	try {
		const files = readdirSync(GLOBAL_BASES_DIR).filter(f => f.endsWith('.json'));
		return files.map(f => {
			try {
				const raw = readFileSync(join(GLOBAL_BASES_DIR, f), 'utf-8');
				const base = JSON.parse(raw);
				return { ...base, _global: true };
			} catch {
				return null;
			}
		}).filter(Boolean);
	} catch {
		return [];
	}
}

/**
 * Estimate token count from text content (~4 chars per token).
 * @param {string} text
 * @returns {number}
 */
function estimateTokens(text) {
	return Math.ceil(text.length / 4);
}

/**
 * Detect system bases (CLAUDE.md, AGENTS.md) from a project directory.
 * These are always-injected by Claude Code itself, so we surface them
 * as read-only system bases for visibility.
 * @param {string} projectPath
 * @returns {Array<Object>}
 */
function getSystemBases(projectPath) {
	const systemFiles = [
		{ file: 'CLAUDE.md', name: 'CLAUDE.md', description: 'Project instructions — always loaded by Claude Code' },
		{ file: 'AGENTS.md', name: 'AGENTS.md', description: 'Agent workflow instructions — always loaded by Claude Code' },
	];

	const bases = [];
	for (const { file, name, description } of systemFiles) {
		const filePath = join(projectPath, file);
		if (!existsSync(filePath)) continue;

		try {
			const stat = statSync(filePath);
			const content = readFileSync(filePath, 'utf-8');
			bases.push({
				id: `_system_${file.toLowerCase().replace('.', '_')}`,
				name,
				description,
				source_type: 'manual',
				content,
				context_query: null,
				source_config: {},
				always_inject: true,
				token_estimate: estimateTokens(content),
				created_at: stat.birthtime.toISOString(),
				updated_at: stat.mtime.toISOString(),
				_system: true,
				_systemPath: file,
			});
		} catch {
			// Skip unreadable files
		}
	}
	return bases;
}

/**
 * Detect JAT installation path.
 * IDE runs from {jat}/ide, so we go up one level from cwd.
 * @returns {string|null}
 */
function getJatPath() {
	const cwd = process.cwd();

	// If we're in the IDE directory, go up one level
	if (cwd.endsWith('/ide') || cwd.endsWith('\\ide')) {
		const parent = dirname(cwd);
		if (existsSync(join(parent, 'shared', 'JAT.md'))) return parent;
	}

	// If cwd is JAT root
	if (existsSync(join(cwd, 'shared', 'JAT.md'))) return cwd;

	// Check JAT_INSTALL_DIR env
	const envPath = process.env.JAT_INSTALL_DIR;
	if (envPath && existsSync(join(envPath, 'shared', 'JAT.md'))) return envPath;

	// Well-known locations
	const home = homedir();
	for (const candidate of [join(home, '.local', 'share', 'jat'), join(home, 'code', 'jat')]) {
		if (existsSync(join(candidate, 'shared', 'JAT.md'))) return candidate;
	}

	return null;
}

/**
 * Global system bases from the JAT installation directory.
 * These are injected into ALL projects so agents know about JAT tools and system capabilities.
 */
const GLOBAL_SYSTEM_BASES = [
	{ file: 'shared/JAT.md', id: '_system_jat_essentials', name: 'JAT.md', description: 'JAT tools and capabilities — available to all agents' },
	{ file: 'shared/global-tools.md', id: '_system_global_tools', name: 'Global Tools', description: 'System tools — image generation, browser automation, database, credentials' },
];

/**
 * Get global system bases from the JAT installation directory.
 * @returns {Array<Object>}
 */
function getGlobalSystemBases() {
	const jatPath = getJatPath();
	if (!jatPath) return [];

	const bases = [];
	for (const { file, id, name, description } of GLOBAL_SYSTEM_BASES) {
		const filePath = join(jatPath, file);
		if (!existsSync(filePath)) continue;

		try {
			const stat = statSync(filePath);
			const content = readFileSync(filePath, 'utf-8');
			bases.push({
				id,
				name,
				description,
				source_type: 'manual',
				content,
				context_query: null,
				source_config: {},
				always_inject: true,
				token_estimate: estimateTokens(content),
				created_at: stat.birthtime.toISOString(),
				updated_at: stat.mtime.toISOString(),
				_system: true,
				_global: true,
				_systemPath: file,
			});
		} catch {
			// Skip unreadable files
		}
	}
	return bases;
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const project = url.searchParams.get('project');
	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	const includeGlobal = url.searchParams.get('includeGlobal') === 'true';
	const includeSystem = url.searchParams.get('includeSystem') !== 'false'; // default true
	const alwaysInjectOnly = url.searchParams.get('alwaysInjectOnly') === 'true';

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const bases = getBases(path, { alwaysInjectOnly });
		// Mark project notes bases with _projectNotes flag
		let allBases = bases.map(b => {
			if (b.id?.startsWith('_notes_')) {
				return { ...b, _projectNotes: true };
			}
			return b;
		});

		if (includeSystem) {
			const systemBases = getSystemBases(path);
			allBases = [...systemBases, ...allBases];

			// Include global system bases (JAT.md, Global Tools, etc.)
			const globalSystemBases = getGlobalSystemBases();
			allBases = [...allBases, ...globalSystemBases];
		}

		if (includeGlobal) {
			const globalBases = getGlobalBases();
			allBases = [...allBases, ...globalBases];
		}

		return json({ bases: allBases });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const { project, name, description, blocks, content, source_type, context_query, source_config, always_inject, token_estimate } = body;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}
		if (!name) {
			return json({ error: 'Missing required field: name' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		// Validate blocks structure if provided
		if (blocks !== undefined) {
			if (!Array.isArray(blocks)) {
				return json({ error: 'blocks must be an array' }, { status: 400 });
			}
			for (const block of blocks) {
				if (!block.type || !block.id) {
					return json({ error: 'Each block must have a type and id' }, { status: 400 });
				}
			}
		}

		// Auto-init bases tables in data.db if needed
		initBasesDb(path);

		const base = createBase(path, {
			name,
			project,
			description,
			blocks,
			// Legacy fields — createBase handles conversion to blocks
			content,
			source_type,
			context_query,
			source_config,
			always_inject,
			token_estimate,
		});

		return json({ success: true, base }, { status: 201 });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
