/**
 * Project Notes Base API
 * GET  /api/bases/notes?project=X  - Get or auto-create the project notes base
 * PUT  /api/bases/notes            - Update the project notes content
 * POST /api/bases/notes            - Sync via sendBeacon (page unload)
 *
 * The project notes base is a regular knowledge base with a well-known ID
 * pattern: _notes_{project}. It's auto-created on first access and migrates
 * content from projects.json if any exists.
 */
import { json } from '@sveltejs/kit';
import { getBase, createBase, updateBase, initBasesDb } from '$lib/server/jat-bases.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { randomBytes } from 'crypto';

const CONFIG_FILE = join(homedir(), '.config', 'jat', 'projects.json');

/**
 * Generate the well-known base ID for a project's notes.
 * @param {string} project
 * @returns {string}
 */
function notesBaseId(project) {
	return `_notes_${project}`;
}

/**
 * Try to read existing notes from projects.json for migration.
 * @param {string} project
 * @returns {string}
 */
function getExistingNotes(project) {
	try {
		if (!existsSync(CONFIG_FILE)) return '';
		const config = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
		return config?.projects?.[project]?.notes || '';
	} catch {
		return '';
	}
}

/**
 * Ensure the project notes base exists. Creates it if missing,
 * migrating content from projects.json if available.
 * @param {string} projectPath
 * @param {string} project
 * @returns {Object} The notes base
 */
function ensureNotesBase(projectPath, project) {
	const id = notesBaseId(project);
	initBasesDb(projectPath);

	let base = getBase(projectPath, id);
	if (base) return base;

	// Auto-create with migrated content
	const existingNotes = getExistingNotes(project);
	const blocks = existingNotes
		? [{ type: 'text', id: randomBytes(4).toString('hex'), content: existingNotes }]
		: [];

	base = createBase(projectPath, {
		id,
		name: 'Project Notes',
		project,
		blocks,
		description: 'Scratchpad notes for this project — editable from the Tasks page',
		always_inject: false,
		token_estimate: existingNotes ? Math.ceil(existingNotes.length / 4) : 0,
		source_config: { _projectNotes: true },
	});

	return base;
}

/**
 * Extract plain text content from a notes base's blocks.
 * @param {Object} base
 * @returns {string}
 */
function getNotesContent(base) {
	const blocks = base.blocks || [];
	const textBlock = blocks.find(b => b.type === 'text');
	return textBlock?.content || '';
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const project = url.searchParams.get('project');
	if (!project) {
		return json({ error: 'Missing required parameter: project' }, { status: 400 });
	}

	try {
		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const base = ensureNotesBase(path, project);
		const content = getNotesContent(base);

		return json({
			base,
			content,
		});
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ request }) {
	try {
		const body = await request.json();
		const { project, content } = body;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const base = ensureNotesBase(path, project);
		const id = base.id;

		// Update blocks with new content
		const blocks = content
			? [{ type: 'text', id: (base.blocks?.[0]?.id) || randomBytes(4).toString('hex'), content }]
			: [];

		updateBase(path, id, {
			blocks,
			token_estimate: content ? Math.ceil(content.length / 4) : 0,
		});

		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}

/**
 * POST handler for sendBeacon sync on page unload.
 * Same as PUT but via POST (sendBeacon only supports POST).
 */
/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const body = await request.json();
		const { project, content } = body;

		if (!project) {
			return json({ error: 'Missing required field: project' }, { status: 400 });
		}

		const { path, exists } = await getProjectPath(project);
		if (!exists) {
			return json({ error: `Project not found: ${project}` }, { status: 404 });
		}

		const base = ensureNotesBase(path, project);
		const id = base.id;

		const blocks = content
			? [{ type: 'text', id: (base.blocks?.[0]?.id) || randomBytes(4).toString('hex'), content }]
			: [];

		updateBase(path, id, {
			blocks,
			token_estimate: content ? Math.ceil(content.length / 4) : 0,
		});

		return json({ success: true });
	} catch (error) {
		return json({ error: error.message }, { status: 500 });
	}
}
