/**
 * Individual Agent Program API Endpoint
 *
 * Manages a single agent program by ID.
 *
 * Endpoints:
 * - GET: Get agent program details with status
 * - PUT: Update agent program
 * - DELETE: Remove agent program
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getAgentProgram,
	updateAgentProgram,
	deleteAgentProgram,
	getAgentStatus,
	validateAgentProgram
} from '$lib/utils/agentConfig';

/**
 * GET /api/config/agents/[id]
 *
 * Get a single agent program by ID.
 */
export const GET: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;

		const program = getAgentProgram(id);
		if (!program) {
			return json(
				{ success: false, error: `Agent program '${id}' not found` },
				{ status: 404 }
			);
		}

		const status = getAgentStatus(program);

		return json({
			success: true,
			program,
			status
		});
	} catch (error) {
		console.error('Error fetching agent program:', error);
		return json(
			{ success: false, error: 'Failed to fetch agent program' },
			{ status: 500 }
		);
	}
};

/**
 * PUT /api/config/agents/[id]
 *
 * Update an existing agent program.
 *
 * Body: Partial<AgentProgram> (id cannot be changed)
 */
export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const { id } = params;
		const body = await request.json();

		// Check if agent exists
		const existing = getAgentProgram(id);
		if (!existing) {
			return json(
				{ success: false, error: `Agent program '${id}' not found` },
				{ status: 404 }
			);
		}

		// Merge with existing for validation
		const merged = { ...existing, ...body, id }; // Preserve original ID

		// Validate the merged program
		const validation = validateAgentProgram(merged);
		if (!validation.valid) {
			return json(
				{
					success: false,
					error: 'Validation failed',
					validationErrors: validation.errors
				},
				{ status: 400 }
			);
		}

		// Remove id from updates (cannot change)
		const { id: _id, ...updates } = body;

		const updated = updateAgentProgram(id, updates);
		const status = getAgentStatus(updated);

		return json({
			success: true,
			program: updated,
			status
		});
	} catch (error) {
		console.error('Error updating agent program:', error);

		const errorMessage = error instanceof Error ? error.message : 'Failed to update agent program';
		return json({ success: false, error: errorMessage }, { status: 500 });
	}
};

/**
 * DELETE /api/config/agents/[id]
 *
 * Remove an agent program.
 *
 * Will fail if:
 * - Agent doesn't exist
 * - Agent is the default/fallback
 * - Agent is the only configured agent
 */
export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;

		// Check if agent exists
		const existing = getAgentProgram(id);
		if (!existing) {
			return json(
				{ success: false, error: `Agent program '${id}' not found` },
				{ status: 404 }
			);
		}

		deleteAgentProgram(id);

		return json({
			success: true,
			deleted: id
		});
	} catch (error) {
		console.error('Error deleting agent program:', error);

		const errorMessage = error instanceof Error ? error.message : 'Failed to delete agent program';

		// Check for constraint errors (default agent, last agent)
		if (errorMessage.includes('Cannot delete')) {
			return json({ success: false, error: errorMessage }, { status: 400 });
		}

		return json({ success: false, error: errorMessage }, { status: 500 });
	}
};
