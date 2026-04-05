/**
 * GET /api/clients/tasks?project=<projectKey>&status=<status>&search=<term>
 *
 * Fetches project_tasks from a client project's Supabase instance.
 * Used by the contract creation UI to link tasks to milestones.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProjectSecret } from '$lib/utils/credentials';

interface ProjectTask {
	id: string;
	title: string;
	description: string | null;
	status: string;
	issue_type: string;
	priority: string;
	assignee: string | null;
	created_at: string;
	updated_at: string;
}

export const GET: RequestHandler = async ({ url }) => {
	const projectKey = url.searchParams.get('project');
	if (!projectKey) {
		return json({ error: 'project parameter is required' }, { status: 400 });
	}

	const supabaseUrl = getProjectSecret(projectKey, 'supabase_url');
	const serviceRoleKey = getProjectSecret(projectKey, 'supabase_service_role_key');

	if (!supabaseUrl || !serviceRoleKey) {
		return json({ error: `Missing Supabase credentials for project "${projectKey}"` }, { status: 400 });
	}

	// Build query filters
	const status = url.searchParams.get('status');
	const search = url.searchParams.get('search');

	let query = 'select=id,title,description,status,issue_type,priority,assignee,created_at,updated_at&order=updated_at.desc&limit=100';

	if (status) {
		query += `&status=eq.${encodeURIComponent(status)}`;
	}

	if (search) {
		// Search in title and description using Supabase text search
		query += `&or=(title.ilike.*${encodeURIComponent(search)}*,description.ilike.*${encodeURIComponent(search)}*)`;
	}

	try {
		const response = await fetch(`${supabaseUrl}/rest/v1/project_tasks?${query}`, {
			headers: {
				'apikey': serviceRoleKey,
				'Authorization': `Bearer ${serviceRoleKey}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const text = await response.text();
			if (response.status === 404 || text.includes('does not exist')) {
				return json({ tasks: [], message: 'project_tasks table not found' });
			}
			return json({ error: `HTTP ${response.status}: ${text.slice(0, 200)}` }, { status: 500 });
		}

		const tasks = await response.json() as ProjectTask[];

		return json({ tasks });
	} catch (err) {
		return json({ error: (err as Error).message }, { status: 500 });
	}
};
