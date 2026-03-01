/**
 * Move/Copy Table API
 * POST /api/data/tables/[name]/move  - Move or copy a table between projects
 */
import { json } from '@sveltejs/kit';
import {
	initDataDb,
	getTableSchema,
	createDataTable,
	getTableRows,
	insertRows,
	getColumnMetadata,
	setColumnMetadata,
	dropDataTable,
} from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';

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
		// Resolve paths
		const source = await getProjectPath(sourceProject);
		if (!source.exists) {
			return json({ error: `Source project not found: ${sourceProject}` }, { status: 404 });
		}

		const dest = await getProjectPath(destinationProject);
		if (!dest.exists) {
			return json({ error: `Destination project not found: ${destinationProject}` }, { status: 404 });
		}

		// Get source table schema
		let sourceSchema;
		try {
			sourceSchema = getTableSchema(source.path, tableName);
		} catch {
			return json({ error: `Table "${tableName}" not found in ${sourceProject}` }, { status: 404 });
		}

		// Init data.db in destination if needed
		initDataDb(dest.path);

		// Check table doesn't already exist in destination
		try {
			getTableSchema(dest.path, tableName);
			return json({ error: `Table "${tableName}" already exists in ${destinationProject}` }, { status: 409 });
		} catch {
			// Good — table doesn't exist in destination
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

		// Create table in destination
		createDataTable(dest.path, tableName, columns);

		// Read all rows from source
		const { rows } = getTableRows(source.path, tableName, { limit: 999999 });

		// Insert rows into destination (strip rowid)
		if (rows.length > 0) {
			const cleanRows = rows.map(row => {
				const clean = { ...row };
				delete clean.rowid;
				return clean;
			});
			insertRows(dest.path, tableName, cleanRows);
		}

		// Copy column metadata
		const metaRows = getColumnMetadata(source.path, tableName);
		for (const meta of metaRows) {
			setColumnMetadata(
				dest.path,
				tableName,
				meta.column_name,
				meta.semantic_type,
				meta.config,
				{
					displayName: meta.display_name || undefined,
					description: meta.description || undefined,
				}
			);
		}

		// If move (not copy), drop source table
		if (deleteSource) {
			dropDataTable(source.path, tableName);
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
