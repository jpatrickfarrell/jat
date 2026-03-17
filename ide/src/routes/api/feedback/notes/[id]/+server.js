/**
 * Agent Notes Individual API
 *
 * PATCH  /api/feedback/notes/:id  - Update note
 * DELETE /api/feedback/notes/:id  - Delete note
 * OPTIONS                         - CORS preflight
 */
import { json } from '@sveltejs/kit';
import Database from 'better-sqlite3';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { getProjectPath } from '$lib/server/projectPaths.js';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
	'Access-Control-Max-Age': '86400'
};

async function getDb(project) {
	const result = await getProjectPath(project);
	if (!result?.path || !result.exists) return null;
	const dbPath = join(result.path, '.jat', 'data.db');
	if (!existsSync(dbPath)) return null;
	const db = new Database(dbPath);
	db.pragma('journal_mode = WAL');
	return db;
}

/** Find which project a note belongs to by scanning all project data.db files */
async function findNoteProject(noteId) {
	const configPath = join(homedir(), '.config/jat/projects.json');
	if (!existsSync(configPath)) return null;
	const config = JSON.parse(readFileSync(configPath, 'utf8'));
	const projects = config.projects || {};
	for (const [key, proj] of Object.entries(projects)) {
		const projPath = (proj.path || '').replace(/^~/, homedir()) || join(homedir(), 'code', key);
		const dbPath = join(projPath, '.jat', 'data.db');
		if (!existsSync(dbPath)) continue;
		const db = new Database(dbPath);
		db.pragma('journal_mode = WAL');
		try {
			const note = db.prepare('SELECT project FROM agent_notes WHERE id = ?').get(noteId);
			db.close();
			if (note) return note.project;
		} catch {
			db.close();
		}
	}
	return null;
}

/** @type {import('./$types').RequestHandler} */
export async function OPTIONS() {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/** PATCH - Update a note */
export async function PATCH({ params, request, url }) {
	const { id } = params;
	const body = await request.json();
	const project = url.searchParams.get('project') || await findNoteProject(id);

	if (!project) {
		return json({ error: 'Note not found' }, { status: 404, headers: CORS_HEADERS });
	}

	const db = await getDb(project);
	if (!db) {
		return json({ error: 'Project not found' }, { status: 404, headers: CORS_HEADERS });
	}

	try {
		const existing = db.prepare('SELECT * FROM agent_notes WHERE id = ?').get(id);
		if (!existing) {
			return json({ error: 'Note not found' }, { status: 404, headers: CORS_HEADERS });
		}

		const now = new Date().toISOString();
		const title = body.title !== undefined ? body.title : existing.title;
		const content = body.content !== undefined ? body.content : existing.content;

		db.prepare('UPDATE agent_notes SET title = ?, content = ?, updated_at = ? WHERE id = ?')
			.run(title, content, now, id);

		const note = db.prepare('SELECT * FROM agent_notes WHERE id = ?').get(id);
		return json({ note }, { headers: CORS_HEADERS });
	} finally {
		db.close();
	}
}

/** DELETE - Delete a note */
export async function DELETE({ params, url }) {
	const { id } = params;
	const project = url.searchParams.get('project') || await findNoteProject(id);

	if (!project) {
		return json({ error: 'Note not found' }, { status: 404, headers: CORS_HEADERS });
	}

	const db = await getDb(project);
	if (!db) {
		return json({ error: 'Project not found' }, { status: 404, headers: CORS_HEADERS });
	}

	try {
		const result = db.prepare('DELETE FROM agent_notes WHERE id = ?').run(id);
		if (result.changes === 0) {
			return json({ error: 'Note not found' }, { status: 404, headers: CORS_HEADERS });
		}
		return json({ ok: true }, { headers: CORS_HEADERS });
	} finally {
		db.close();
	}
}
