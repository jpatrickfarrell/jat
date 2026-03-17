/**
 * Agent Notes API
 *
 * Local SQLite-backed CRUD for agent notes (used by jat-feedback widget Notes tab).
 * Stores notes in .jat/data.db, same database as jt data tables.
 *
 * GET    /api/feedback/notes?project=X          - List notes for project
 * POST   /api/feedback/notes                     - Create note
 * PUT    /api/feedback/notes                     - Upsert note (by project+route)
 * OPTIONS                                        - CORS preflight
 */
import { json } from '@sveltejs/kit';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
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
	const projectPath = result.path;
	const jatDir = join(projectPath, '.jat');
	const dbPath = join(jatDir, 'data.db');
	if (!existsSync(jatDir)) {
		mkdirSync(jatDir, { recursive: true });
	}
	const db = new Database(dbPath);
	db.pragma('journal_mode = WAL');
	// Ensure table exists
	db.exec(`
		CREATE TABLE IF NOT EXISTS agent_notes (
			id TEXT PRIMARY KEY,
			project TEXT NOT NULL,
			route TEXT DEFAULT NULL,
			title TEXT NOT NULL DEFAULT '',
			content TEXT NOT NULL DEFAULT '',
			created_at TEXT DEFAULT (datetime('now')),
			updated_at TEXT DEFAULT (datetime('now'))
		);
		CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_notes_project_route
			ON agent_notes(project, COALESCE(route, ''));
		CREATE INDEX IF NOT EXISTS idx_agent_notes_project
			ON agent_notes(project);
	`);
	return db;
}

/** @type {import('./$types').RequestHandler} */
export async function OPTIONS() {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/** GET - List notes for a project */
export async function GET({ url }) {
	const project = url.searchParams.get('project');
	if (!project) {
		return json({ error: 'Missing project parameter' }, { status: 400, headers: CORS_HEADERS });
	}

	const route = url.searchParams.get('route');
	const db = await getDb(project);
	if (!db) {
		return json({ notes: [] }, { headers: CORS_HEADERS });
	}

	try {
		let notes;
		if (route !== null && route !== undefined) {
			notes = db.prepare('SELECT * FROM agent_notes WHERE project = ? AND route = ? ORDER BY updated_at DESC').all(project, route);
		} else {
			notes = db.prepare('SELECT * FROM agent_notes WHERE project = ? ORDER BY updated_at DESC').all(project);
		}
		return json({ notes }, { headers: CORS_HEADERS });
	} finally {
		db.close();
	}
}

/** POST - Create a new note */
export async function POST({ request }) {
	const body = await request.json();
	const { project, route, title, content } = body;

	if (!project) {
		return json({ error: 'Missing project' }, { status: 400, headers: CORS_HEADERS });
	}

	const db = await getDb(project);
	if (!db) {
		return json({ error: 'Project not found' }, { status: 404, headers: CORS_HEADERS });
	}

	try {
		const id = randomUUID();
		const now = new Date().toISOString();
		db.prepare(
			'INSERT INTO agent_notes (id, project, route, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
		).run(id, project, route ?? null, title || '', content || '', now, now);

		const note = db.prepare('SELECT * FROM agent_notes WHERE id = ?').get(id);
		return json({ note }, { status: 201, headers: CORS_HEADERS });
	} catch (err) {
		if (err.message?.includes('UNIQUE constraint')) {
			return json({ error: 'Note already exists for this route' }, { status: 409, headers: CORS_HEADERS });
		}
		return json({ error: err.message }, { status: 500, headers: CORS_HEADERS });
	} finally {
		db.close();
	}
}

/** PUT - Upsert note (by project + route) */
export async function PUT({ request }) {
	const body = await request.json();
	const { project, route, title, content } = body;

	if (!project) {
		return json({ error: 'Missing project' }, { status: 400, headers: CORS_HEADERS });
	}

	const db = await getDb(project);
	if (!db) {
		return json({ error: 'Project not found' }, { status: 404, headers: CORS_HEADERS });
	}

	try {
		const now = new Date().toISOString();
		const existing = db.prepare(
			'SELECT id FROM agent_notes WHERE project = ? AND COALESCE(route, \'\') = COALESCE(?, \'\')'
		).get(project, route ?? null);

		let note;
		if (existing) {
			db.prepare(
				'UPDATE agent_notes SET title = ?, content = ?, updated_at = ? WHERE id = ?'
			).run(title || '', content || '', now, existing.id);
			note = db.prepare('SELECT * FROM agent_notes WHERE id = ?').get(existing.id);
		} else {
			const id = randomUUID();
			db.prepare(
				'INSERT INTO agent_notes (id, project, route, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
			).run(id, project, route ?? null, title || '', content || '', now, now);
			note = db.prepare('SELECT * FROM agent_notes WHERE id = ?').get(id);
		}

		return json({ note }, { headers: CORS_HEADERS });
	} finally {
		db.close();
	}
}
