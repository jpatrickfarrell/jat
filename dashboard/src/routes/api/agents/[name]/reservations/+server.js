/**
 * Agent Reservations API - View Agent File Locks
 * GET /api/agents/[name]/reservations
 *
 * Retrieves agent's active file reservations globally (across all projects)
 * since agent names are globally unique.
 */

import { json } from '@sveltejs/kit';
import { getReservations } from '$lib/server/agent-mail.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
	try {
		const agentName = params.name;

		if (!agentName) {
			return json({
				error: 'Missing agent name',
				message: 'Agent name is required'
			}, { status: 400 });
		}

		// Get reservations globally (projectPath = null) since agents are globally unique
		const reservations = getReservations(agentName, null);

		return json({
			success: true,
			agentName,
			reservations,
			count: reservations.length,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error('Error in GET /api/agents/[name]/reservations:', error);
		return json({
			error: 'Internal server error',
			message: error.message
		}, { status: 500 });
	}
}
