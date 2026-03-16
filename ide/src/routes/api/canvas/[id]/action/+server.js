import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import {
	insertRow,
	updateRow,
	deleteRow,
	getTableRows,
	queryDataTable,
	initDataDb,
	isSystemTable,
	getTableSchema,
} from '$lib/server/jat-data.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { broadcastDataChanged } from '$lib/server/websocket';
import { evaluateFormula } from '$lib/utils/formulaEval';
import { createTask, updateTask as updateJatTask, getTaskById } from '$lib/server/jat-tasks.js';
import { invalidateCache } from '$lib/server/cache.js';

const execAsync = promisify(exec);

/**
 * Canvas action executor endpoint.
 * Dispatches action requests to the appropriate executor based on actionType.
 *
 * POST /api/canvas/:pageId/action
 * Body: { actionType: string, actionConfig: Record<string, unknown>, project?: string }
 * Returns: { success: boolean, message?: string, data?: unknown, rowsAffected?: number }
 *
 * Data actions (jat-i1r8u): AddRow, ModifyRows, DeleteRows, RunFormula
 * JAT actions (jat-qk1n6): SpawnAgent, CreateTask, UpdateTask, RunCommand
 */

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request, fetch }) {
	try {
		const { actionType, actionConfig, project } = await request.json();
		const pageId = params.id;

		if (!actionType) {
			return json({ success: false, error: 'Missing actionType' }, { status: 400 });
		}

		// Dispatch to executor based on actionType
		const executor = ACTION_EXECUTORS[actionType];
		if (!executor) {
			return json(
				{
					success: false,
					error: `Unknown action type: ${actionType}. Available: ${Object.keys(ACTION_EXECUTORS).join(', ') || 'none (executors not yet registered)'}`,
				},
				{ status: 400 }
			);
		}

		const result = await executor({ actionConfig, project, pageId, fetch });
		return json(result);
	} catch (err) {
		return json(
			{ success: false, error: err instanceof Error ? err.message : 'Action execution failed' },
			{ status: 500 }
		);
	}
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolve project path and initialize the data DB. Returns { path } or throws.
 */
async function resolveProject(project) {
	if (!project) throw new Error('Missing required field: project');
	const { path, exists } = await getProjectPath(project);
	if (!exists) throw new Error(`Project not found: ${project}`);
	initDataDb(path);
	return path;
}

/**
 * Build a WHERE clause and params array from a filter object.
 * filter: { column: value, ... }  →  "col1 = ? AND col2 = ?"  +  [val1, val2]
 */
function buildWhereClause(filter, validColumns) {
	const conditions = [];
	const params = [];
	for (const [col, val] of Object.entries(filter)) {
		if (!validColumns.includes(col)) {
			throw new Error(`Unknown column: ${col}`);
		}
		conditions.push(`"${col}" = ?`);
		params.push(val);
	}
	if (conditions.length === 0) throw new Error('Filter must specify at least one column');
	return { where: conditions.join(' AND '), params };
}

// ---------------------------------------------------------------------------
// Action executor registry
// ---------------------------------------------------------------------------

const ACTION_EXECUTORS = {};

// ---------------------------------------------------------------------------
// AddRow — Insert a new row into a data table
// Config: { table: string, values: { col: val, ... } }
// ---------------------------------------------------------------------------

ACTION_EXECUTORS['AddRow'] = async ({ actionConfig, project }) => {
	const { table, values } = actionConfig;
	if (!table) return { success: false, message: 'AddRow: missing "table" in config' };
	if (!values || typeof values !== 'object' || Object.keys(values).length === 0) {
		return { success: false, message: 'AddRow: missing or empty "values" in config' };
	}

	const projectPath = await resolveProject(project);

	const result = insertRow(projectPath, table, values);
	broadcastDataChanged(table, project, 'insert');

	// Fetch the newly inserted row to return it
	let newRow = null;
	try {
		const { rows } = getTableRows(projectPath, table, {
			filters: { rowid: String(result.rowid) },
			limit: 1,
		});
		newRow = rows[0] || null;
	} catch {
		// Non-fatal — we still succeeded at inserting
	}

	return {
		success: true,
		message: `Added row to ${table}`,
		data: newRow,
		rowsAffected: 1,
	};
};

// ---------------------------------------------------------------------------
// ModifyRows — Update rows matching a filter
// Config: { table: string, filter: { col: val }, updates: { col: val } }
// ---------------------------------------------------------------------------

ACTION_EXECUTORS['ModifyRows'] = async ({ actionConfig, project }) => {
	const { table, filter, updates } = actionConfig;
	if (!table) return { success: false, message: 'ModifyRows: missing "table" in config' };
	if (!filter || typeof filter !== 'object' || Object.keys(filter).length === 0) {
		return { success: false, message: 'ModifyRows: missing or empty "filter" in config' };
	}
	if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
		return { success: false, message: 'ModifyRows: missing or empty "updates" in config' };
	}

	if (isSystemTable(table)) {
		return { success: false, message: 'Cannot modify system table (read-only)' };
	}

	const projectPath = await resolveProject(project);

	// Validate filter and update columns against schema
	const schema = getTableSchema(projectPath, table);
	const validColumns = schema.map((c) => c.name);
	for (const col of Object.keys(filter)) {
		if (!validColumns.includes(col)) {
			return { success: false, message: `ModifyRows: unknown filter column "${col}"` };
		}
	}
	for (const col of Object.keys(updates)) {
		if (!validColumns.includes(col)) {
			return { success: false, message: `ModifyRows: unknown update column "${col}"` };
		}
	}

	// Convert filter values to strings for getTableRows (it expects string values)
	const stringFilter = {};
	for (const [k, v] of Object.entries(filter)) stringFilter[k] = String(v);

	// Find matching rows
	const { rows: matchingRows } = getTableRows(projectPath, table, {
		filters: stringFilter,
		limit: 10000,
	});

	if (matchingRows.length === 0) {
		return { success: true, message: 'No rows matched the filter', rowsAffected: 0 };
	}

	// Update each matching row
	let updated = 0;
	for (const row of matchingRows) {
		const result = updateRow(projectPath, table, row.rowid, updates);
		updated += result.changes;
	}

	broadcastDataChanged(table, project, 'update');

	return {
		success: true,
		message: `Updated ${updated} row${updated !== 1 ? 's' : ''} in ${table}`,
		rowsAffected: updated,
	};
};

// ---------------------------------------------------------------------------
// DeleteRows — Delete rows matching a filter
// Config: { table: string, filter: { col: val } }
// ---------------------------------------------------------------------------

ACTION_EXECUTORS['DeleteRows'] = async ({ actionConfig, project }) => {
	const { table, filter } = actionConfig;
	if (!table) return { success: false, message: 'DeleteRows: missing "table" in config' };
	if (!filter || typeof filter !== 'object' || Object.keys(filter).length === 0) {
		return { success: false, message: 'DeleteRows: missing or empty "filter" in config' };
	}

	if (isSystemTable(table)) {
		return { success: false, message: 'Cannot modify system table (read-only)' };
	}

	const projectPath = await resolveProject(project);

	// Validate filter columns against schema
	const schema = getTableSchema(projectPath, table);
	const validColumns = schema.map((c) => c.name);
	for (const col of Object.keys(filter)) {
		if (!validColumns.includes(col)) {
			return { success: false, message: `DeleteRows: unknown filter column "${col}"` };
		}
	}

	// Convert filter values to strings for getTableRows
	const stringFilter = {};
	for (const [k, v] of Object.entries(filter)) stringFilter[k] = String(v);

	// Find matching rows
	const { rows: matchingRows } = getTableRows(projectPath, table, {
		filters: stringFilter,
		limit: 10000,
	});

	if (matchingRows.length === 0) {
		return { success: true, message: 'No rows matched the filter', rowsAffected: 0 };
	}

	// Delete each matching row
	let deleted = 0;
	for (const row of matchingRows) {
		const result = deleteRow(projectPath, table, row.rowid);
		deleted += result.changes;
	}

	broadcastDataChanged(table, project, 'delete');

	return {
		success: true,
		message: `Deleted ${deleted} row${deleted !== 1 ? 's' : ''} from ${table}`,
		rowsAffected: deleted,
	};
};

// ---------------------------------------------------------------------------
// RunFormula — Evaluate a formula expression with controlValues as context
// Config: { expression: string }
// The controlValues are already resolved into the config by the client-side
// resolveConfig() in CanvasActionBlock — so {controlName} references in the
// expression string have already been replaced with actual values.
// ---------------------------------------------------------------------------

ACTION_EXECUTORS['RunFormula'] = async ({ actionConfig }) => {
	const { expression } = actionConfig;
	if (!expression) {
		return { success: false, message: 'RunFormula: missing "expression" in config' };
	}

	try {
		// evaluateFormula expects { column: value } as the row context.
		// Since control variables are already resolved into the expression string
		// by the client, we pass an empty row context.
		const result = evaluateFormula(expression, {});

		// Check for formula error (evaluateFormula returns '#ERROR: ...' strings)
		if (typeof result === 'string' && result.startsWith('#')) {
			return { success: false, message: `Formula error: ${result}` };
		}

		return {
			success: true,
			message: `Result: ${result}`,
			data: result,
		};
	} catch (err) {
		return {
			success: false,
			message: `Formula error: ${err instanceof Error ? err.message : String(err)}`,
		};
	}
};

// ===========================================================================
// JAT Actions (jat-qk1n6)
// ===========================================================================

/**
 * Resolve a project name to its filesystem path.
 * Falls back to the IDE's parent directory if no project specified.
 */
async function resolveProjectPath(project) {
	if (project) {
		const info = await getProjectPath(project);
		if (info.exists) return info.path;
	}
	return process.cwd().replace(/\/ide$/, '');
}

// ---------------------------------------------------------------------------
// SpawnAgent — spawn a new agent session via the existing spawn API
// Config: { taskId?: string, model?: string }
// ---------------------------------------------------------------------------

ACTION_EXECUTORS['SpawnAgent'] = async ({ actionConfig, project, fetch }) => {
	const { taskId, model } = actionConfig;

	const body = {};
	if (taskId) body.taskId = String(taskId);
	if (model) body.model = String(model);
	if (project) body.project = String(project);

	const response = await fetch('/api/work/spawn', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});

	const data = await response.json();

	if (!response.ok) {
		return {
			success: false,
			message: data.error || data.message || `Spawn failed (${response.status})`,
		};
	}

	return {
		success: true,
		message: data.message || `Spawned agent ${data.session?.agentName || ''}`,
		data: {
			agentName: data.session?.agentName,
			sessionName: data.session?.sessionName,
			taskId: data.session?.task?.id,
		},
	};
};

// ---------------------------------------------------------------------------
// CreateTask — create a new task via the tasks library
// Config: { title: string, type?: string, priority?: number, description?: string, labels?: string[] }
// ---------------------------------------------------------------------------

ACTION_EXECUTORS['CreateTask'] = async ({ actionConfig, project }) => {
	const { title, type, priority, description, labels } = actionConfig;

	if (!title || typeof title !== 'string' || !title.trim()) {
		return { success: false, message: 'CreateTask: title is required' };
	}

	const projectPath = await resolveProjectPath(project);

	const taskType = type ? String(type).trim().toLowerCase() : 'task';
	const validTypes = ['task', 'bug', 'feature', 'epic', 'chore'];
	if (!validTypes.includes(taskType)) {
		return { success: false, message: `Invalid type: ${taskType}. Must be one of: ${validTypes.join(', ')}` };
	}

	const result = createTask({
		projectPath,
		title: String(title).trim(),
		type: taskType,
		priority: priority !== undefined ? parseInt(String(priority)) : 2,
		description: description ? String(description).trim() : '',
		labels: Array.isArray(labels) ? labels.map(String) : [],
	});

	invalidateCache.tasks();

	return {
		success: true,
		message: `Created ${taskType} "${String(title).trim()}" (${result.id})`,
		data: { taskId: result.id },
	};
};

// ---------------------------------------------------------------------------
// UpdateTask — update an existing task
// Config: { taskId: string, status?: string, assignee?: string, priority?: number, ... }
// ---------------------------------------------------------------------------

ACTION_EXECUTORS['UpdateTask'] = async ({ actionConfig }) => {
	const { taskId, ...updates } = actionConfig;

	if (!taskId || typeof taskId !== 'string') {
		return { success: false, message: 'UpdateTask: taskId is required' };
	}

	const existing = getTaskById(String(taskId));
	if (!existing) {
		return { success: false, message: `Task not found: ${taskId}` };
	}

	const allowedFields = ['title', 'description', 'status', 'priority', 'assignee', 'notes', 'model', 'agent_program'];
	const fields = { projectPath: existing.project_path };

	for (const key of allowedFields) {
		if (updates[key] !== undefined) {
			fields[key] = key === 'priority' ? parseInt(String(updates[key])) : String(updates[key]);
		}
	}

	if (Object.keys(fields).length <= 1) {
		return { success: false, message: 'No valid update fields provided' };
	}

	updateJatTask(String(taskId), fields);
	invalidateCache.tasks();

	const updatedFields = Object.keys(fields).filter(k => k !== 'projectPath');
	return {
		success: true,
		message: `Updated task ${taskId} (${updatedFields.join(', ')})`,
		data: { taskId: String(taskId), updatedFields },
	};
};

// ---------------------------------------------------------------------------
// RunCommand — execute a whitelisted shell command
// Config: { command: string }
// Security: Only commands starting with known safe prefixes are allowed.
// ---------------------------------------------------------------------------

const COMMAND_WHITELIST = [
	'jt ',           // JAT Tasks CLI
	'jt-',           // JAT Tasks helpers
	'jat-signal ',   // Signal emission
	'jat-search ',   // Search
	'jat-memory ',   // Memory operations
	'am-',           // Agent Mail tools
	'git status',    // Git read-only
	'git log',       // Git read-only
	'git diff',      // Git read-only
	'git branch',    // Git read-only
];

function isCommandAllowed(command) {
	const trimmed = command.trim();
	return COMMAND_WHITELIST.some(prefix => trimmed.startsWith(prefix));
}

ACTION_EXECUTORS['RunCommand'] = async ({ actionConfig, project }) => {
	const { command } = actionConfig;

	if (!command || typeof command !== 'string' || !command.trim()) {
		return { success: false, message: 'RunCommand: command is required' };
	}

	const cmd = String(command).trim();

	if (!isCommandAllowed(cmd)) {
		return {
			success: false,
			message: `Command not allowed. Must start with: ${COMMAND_WHITELIST.map(p => p.trim()).join(', ')}`,
		};
	}

	const projectPath = await resolveProjectPath(project);

	try {
		const { stdout, stderr } = await execAsync(cmd, {
			cwd: projectPath,
			timeout: 30000,
			maxBuffer: 512 * 1024,
			env: { ...process.env, HOME: process.env.HOME },
		});

		return {
			success: true,
			message: stdout.trim() || stderr.trim() || 'Command completed',
			data: { command: cmd, stdout: stdout.trim(), stderr: stderr.trim() },
		};
	} catch (err) {
		const error = /** @type {any} */ (err);
		return {
			success: false,
			message: `Command failed: ${error.stderr?.trim() || error.message}`,
			data: { command: cmd, exitCode: error.code, stdout: error.stdout?.trim(), stderr: error.stderr?.trim() },
		};
	}
};
