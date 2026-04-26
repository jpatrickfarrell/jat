/**
 * Move/Copy Table API
 * POST /api/data/tables/[name]/move  - Move or copy a table between projects
 */
import { json } from '@sveltejs/kit';
import {
	initDataDb,
	getDataTable,
	getTableSchema,
	createDataTable,
	getTableRows,
	insertRows,
	getColumnMetadata,
	setColumnMetadata,
	dropDataTable,
	isPostgresProject,
	pgGetTableSchema,
	pgGetDataTable,
	pgCreateDataTable,
	pgGetTableRows,
	pgInsertRows,
	pgGetColumnMetadata,
	pgSetColumnMetadata,
	pgDropDataTable,
} from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

/**
 * Backend-aware adapters. SQLite path takes a project file path; postgres
 * path takes a project name + transparently uses a connection pool.
 */
async function getSchema(backend, project, tableName) {
	if (backend.kind === 'postgres') {
		const meta = await pgGetDataTable(project, tableName);
		if (!meta) throw new Error(`Table "${tableName}" not found in ${project}`);
		return await pgGetTableSchema(project, tableName);
	}
	try {
		return getTableSchema(backend.path, tableName);
	} catch {
		throw new Error(`Table "${tableName}" not found in ${project}`);
	}
}

async function tableExists(backend, project, tableName) {
	if (backend.kind === 'postgres') {
		const meta = await pgGetDataTable(project, tableName);
		return meta !== null;
	}
	// SQLite getTableSchema returns [] for missing tables instead of throwing,
	// so use getDataTable (returns null when absent).
	return getDataTable(backend.path, tableName) !== null;
}

async function createTable(backend, project, tableName, columns) {
	if (backend.kind === 'postgres') {
		await pgCreateDataTable(project, tableName, columns);
	} else {
		createDataTable(backend.path, tableName, columns);
	}
}

async function readAllRows(backend, project, tableName) {
	if (backend.kind === 'postgres') {
		const { rows } = await pgGetTableRows(project, tableName, { limit: 999999 });
		return rows;
	}
	const { rows } = getTableRows(backend.path, tableName, { limit: 999999 });
	return rows;
}

async function writeRows(backend, project, tableName, rows) {
	if (rows.length === 0) return;
	if (backend.kind === 'postgres') {
		await pgInsertRows(project, tableName, rows);
	} else {
		insertRows(backend.path, tableName, rows);
	}
}

async function readColumnMeta(backend, project, tableName) {
	if (backend.kind === 'postgres') {
		return await pgGetColumnMetadata(project, tableName);
	}
	return getColumnMetadata(backend.path, tableName);
}

async function writeColumnMeta(backend, project, tableName, meta) {
	const opts = {
		displayName: meta.display_name || undefined,
		description: meta.description || undefined,
	};
	if (backend.kind === 'postgres') {
		await pgSetColumnMetadata(project, tableName, meta.column_name, meta.semantic_type, meta.config, opts);
	} else {
		setColumnMetadata(backend.path, tableName, meta.column_name, meta.semantic_type, meta.config, opts);
	}
}

async function dropTable(backend, project, tableName) {
	if (backend.kind === 'postgres') {
		await pgDropDataTable(project, tableName);
	} else {
		dropDataTable(backend.path, tableName);
	}
}

async function resolveBackend(projectName) {
	if (isPostgresProject(projectName)) {
		return { kind: 'postgres', path: null };
	}
	const { path, exists } = await getProjectPath(projectName);
	if (!exists) return null;
	return { kind: 'sqlite', path };
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request }) {
	const tableName = params.name;

	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { sourceProject, destinationProject, deleteSource = true } = body;

	if (!sourceProject || !destinationProject) {
		return json({ error: 'Missing sourceProject or destinationProject' }, { status: 400 });
	}

	if (sourceProject === destinationProject) {
		return json({ error: 'Source and destination projects must be different' }, { status: 400 });
	}

	try {
		const source = await resolveBackend(sourceProject);
		if (!source) {
			return json({ error: `Source project not found: ${sourceProject}` }, { status: 404 });
		}
		const dest = await resolveBackend(destinationProject);
		if (!dest) {
			return json({ error: `Destination project not found: ${destinationProject}` }, { status: 404 });
		}

		// Get source table schema (also validates source exists)
		let sourceSchema;
		try {
			sourceSchema = await getSchema(source, sourceProject, tableName);
		} catch (err) {
			return json({ error: err.message }, { status: 404 });
		}

		// Init data.db in destination if needed (sqlite only)
		if (dest.kind === 'sqlite') {
			initDataDb(dest.path);
		}

		if (await tableExists(dest, destinationProject, tableName)) {
			return json({ error: `Table "${tableName}" already exists in ${destinationProject}` }, { status: 409 });
		}

		// Build column definitions for createDataTable (exclude rowid)
		const columns = sourceSchema
			.filter(col => col.name !== 'rowid')
			.map(col => ({
				name: col.name,
				type: col.type || 'TEXT',
				semanticType: col.semanticType || undefined,
				config: col.config || undefined,
				nullable: col.notnull === 0,
			}));

		await createTable(dest, destinationProject, tableName, columns);

		const rows = await readAllRows(source, sourceProject, tableName);
		const cleanRows = rows.map(row => {
			const clean = { ...row };
			delete clean.rowid;
			return clean;
		});
		await writeRows(dest, destinationProject, tableName, cleanRows);

		const metaRows = await readColumnMeta(source, sourceProject, tableName);
		for (const meta of metaRows) {
			await writeColumnMeta(dest, destinationProject, tableName, meta);
		}

		if (deleteSource) {
			await dropTable(source, sourceProject, tableName);
		}

		return json({
			success: true,
			action: deleteSource ? 'moved' : 'copied',
			tableName,
			from: sourceProject,
			to: destinationProject,
			rowCount: rows.length,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return json({ error: message }, { status: 500 });
	}
}
