/**
 * Epics API - List and create epics for task management
 *
 * GET /api/epics - List all epics (open and closed)
 * POST /api/epics - Create a new epic
 * Query params:
 *   - project: filter by project prefix (e.g., 'jat', 'chimaro')
 *   - status: 'open', 'closed', or 'all' (default: 'all')
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'child_process';
import { promisify } from 'util';
import { invalidateCache } from '$lib/server/cache.js';
import { _resetTaskCache } from '../agents/+server.js';

const execAsync = promisify(exec);

/**
 * Escape a string for safe shell usage (single-quoted)
 */
function shellEscape(str: string): string {
	if (!str) return "''";
	return "'" + str.replace(/'/g, "'\\''") + "'";
}

interface Epic {
	id: string;
	title: string;
	description?: string;
	status: string;
	priority: number;
	issue_type: string;
	dependency_count?: number;
	created_at?: string;
}

/**
 * GET /api/epics
 * List epics, optionally filtered by project and status
 *
 * By default, returns all epics (open and closed) so the UI can show
 * closed epics that still have active work (sessions on child tasks).
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const project = url.searchParams.get('project');
		const statusFilter = url.searchParams.get('status') || 'all';

		// Build the bd list command based on status filter
		let command = 'bd list --type epic --json';
		if (statusFilter === 'open' || statusFilter === 'closed') {
			command = `bd list --type epic --status ${statusFilter} --json`;
		}

		const { stdout } = await execAsync(command, {
			timeout: 10000
		});

		let epics: Epic[] = [];
		try {
			epics = JSON.parse(stdout.trim());
		} catch {
			// Empty or invalid JSON
			epics = [];
		}

		// Filter by project if specified
		if (project && epics.length > 0) {
			epics = epics.filter(epic => epic.id.startsWith(`${project}-`));
		}

		// Sort: open epics first, then by priority, then by created date
		epics.sort((a, b) => {
			// Open epics come first
			const aOpen = a.status === 'open' ? 0 : 1;
			const bOpen = b.status === 'open' ? 0 : 1;
			if (aOpen !== bOpen) {
				return aOpen - bOpen;
			}
			// Then by priority (lower = higher priority)
			if (a.priority !== b.priority) {
				return a.priority - b.priority;
			}
			// Fall back to created date (newer first)
			return (b.created_at || '').localeCompare(a.created_at || '');
		});

		return json({
			success: true,
			epics,
			count: epics.length
		});
	} catch (error) {
		console.error('[epics] Error listing epics:', error);
		return json(
			{
				success: false,
				error: 'Failed to list epics',
				message: error instanceof Error ? error.message : String(error),
				epics: []
			},
			{ status: 500 }
		);
	}
};

/**
 * POST /api/epics
 * Create a new epic and optionally link a task to it
 * Body: { title: string, project?: string, linkTaskId?: string }
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { title, project, linkTaskId } = body;

		if (!title || typeof title !== 'string' || !title.trim()) {
			return json(
				{ success: false, error: 'Title is required' },
				{ status: 400 }
			);
		}

		// Build the bd create command
		let command = `bd create ${shellEscape(title.trim())} --type epic --priority 1`;

		const { stdout, stderr } = await execAsync(command, { timeout: 10000 });

		// Parse the created epic ID from stdout (bd create outputs the ID)
		const epicIdMatch = stdout.match(/([a-z]+-[a-z0-9]+)/i);
		if (!epicIdMatch) {
			console.error('[epics] Failed to parse epic ID from output:', stdout);
			return json(
				{ success: false, error: 'Failed to create epic - could not parse ID' },
				{ status: 500 }
			);
		}

		const epicId = epicIdMatch[1];
		console.log(`[epics] Created epic: ${epicId}`);

		// If linkTaskId provided, link the task to the new epic
		if (linkTaskId) {
			try {
				// Epic depends on task (correct direction - makes task READY, epic BLOCKED)
				const linkCommand = `bd dep add ${shellEscape(epicId)} ${shellEscape(linkTaskId)}`;
				await execAsync(linkCommand, { timeout: 10000 });
				console.log(`[epics] Linked task ${linkTaskId} to epic ${epicId}`);
			} catch (linkError) {
				console.error('[epics] Failed to link task to epic:', linkError);
				// Epic was created successfully, so we continue but note the link failed
			}
		}

		// Invalidate caches
		invalidateCache.tasks();
		invalidateCache.agents();
		_resetTaskCache();

		return json({
			success: true,
			epicId,
			message: `Epic ${epicId} created${linkTaskId ? ` and linked to ${linkTaskId}` : ''}`
		});
	} catch (error) {
		console.error('[epics] Error creating epic:', error);
		return json(
			{
				success: false,
				error: 'Failed to create epic',
				message: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
};
