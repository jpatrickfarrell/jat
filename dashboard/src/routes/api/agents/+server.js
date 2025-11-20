import { json } from '@sveltejs/kit';
import { getAgents } from '$lib/server/agent-mail.js';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	try {
		const agents = getAgents();

		return json({ agents });
	} catch (error) {
		console.error('Error fetching agents:', error);
		return json({ error: 'Failed to fetch agents', agents: [] }, { status: 500 });
	}
}
