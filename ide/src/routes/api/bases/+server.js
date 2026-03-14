/**
 * Knowledge Bases API
 * GET  /api/bases?project=X[&includeGlobal=true]  - List bases
 * POST /api/bases                                  - Create base
 */
import { json } from '@sveltejs/kit';
import { getBases, createBase, initBasesDb } from '$lib/server/jat-bases.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, basename } from 'path';
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
		let allBases = [...bases];

		if (includeSystem) {
			const systemBases = getSystemBases(path);
			allBases = [...systemBases, ...allBases];
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
		const { project, name, description, source_type, content, context_query, source_config, always_inject, token_estimate } = body;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}
		if (!name) {
			return json({ error: 'Missing required field: name' }, { status: 400 });
		}
		if (!source_type) {
			return json({ error: 'Missing required field: source_type' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		// Auto-init bases.db if needed
		initBasesDb(path);

		const base = createBase(path, {
			name,
			description,
			source_type,
			content,
			context_query,
			source_config,
			always_inject,
			token_estimate,
		});

		return json({ success: true, base }, { status: 201 });
	} catch (error) {
		const status = error.message.includes('Source type') ? 400 : 500;
		return json({ error: error.message }, { status });
	}
}
