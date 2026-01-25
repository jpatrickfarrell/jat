/**
 * Set Default Agent API Endpoint
 *
 * Sets an agent program as the default/fallback agent.
 *
 * Endpoints:
 * - PUT: Set this agent as the default
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getAgentProgram,
	setDefaultAgent,
	getAgentConfig
} from '$lib/utils/agentConfig';

/**
 * PUT /api/config/agents/[id]/default
 *
 * Set this agent as the default fallback agent.
 *
 * Body (optional):
 * - model: string - Override the default model for fallback
 */
export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const { id } = params;

		// Check if agent exists
		const program = getAgentProgram(id);
		if (!program) {
			return json(
				{ success: false, error: `Agent program '${id}' not found` },
				{ status: 404 }
			);
		}

		// Check if agent is enabled
		if (!program.enabled) {
			return json(
				{ success: false, error: `Cannot set disabled agent '${id}' as default` },
				{ status: 400 }
			);
		}

		// Parse optional body
		let model: string | undefined;
		try {
			const body = await request.json();
			model = body.model;

			// Validate model exists if provided
			if (model && !program.models.some((m) => m.shortName === model)) {
				return json(
					{
						success: false,
						error: `Model '${model}' not found in agent '${id}'`
					},
					{ status: 400 }
				);
			}
		} catch {
			// Body is optional, ignore parse errors
		}

		setDefaultAgent(id, model);

		// Return updated config
		const config = getAgentConfig();

		return json({
			success: true,
			defaults: config.defaults
		});
	} catch (error) {
		console.error('Error setting default agent:', error);

		const errorMessage = error instanceof Error ? error.message : 'Failed to set default agent';
		return json({ success: false, error: errorMessage }, { status: 500 });
	}
};
