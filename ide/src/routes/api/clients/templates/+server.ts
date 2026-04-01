/**
 * GET /api/clients/templates?project=<projectKey>
 *
 * Fetch milestone templates from a project's Supabase instance.
 * Falls back to built-in defaults if the project has no templates table.
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProjectSecret } from '$lib/utils/credentials';

const BUILTIN_TEMPLATES = [
	{
		id: 'builtin-standard-4-phase',
		name: 'Standard 4-Phase',
		description: 'Deposit, PRD Approval, Delivery, Final Acceptance',
		is_default: true,
		milestones: [
			{ name: 'Deposit', percentage: 20, description: 'Initial deposit upon contract signing', acceptance_criteria: 'Contract signed and deposit received' },
			{ name: 'PRD Approval', percentage: 20, description: 'Product Requirements Document approved', acceptance_criteria: 'PRD reviewed and signed off by client' },
			{ name: 'Delivery', percentage: 40, description: 'Project delivered for testing', acceptance_criteria: 'All features delivered and deployed to staging' },
			{ name: 'Final Acceptance', percentage: 20, description: 'Client accepts final deliverable', acceptance_criteria: 'All acceptance criteria met, production deployed' }
		]
	},
	{
		id: 'builtin-spec-built-80-20',
		name: 'Spec-Built 80/20',
		description: 'Upfront payment with final delivery',
		is_default: false,
		milestones: [
			{ name: 'Upfront Payment', percentage: 80, description: 'Upfront payment for spec-built project', acceptance_criteria: 'Payment received' },
			{ name: 'Final Delivery', percentage: 20, description: 'Final deliverable accepted', acceptance_criteria: 'Project delivered and accepted' }
		]
	}
];

export const GET: RequestHandler = async ({ url }) => {
	const projectKey = url.searchParams.get('project');

	if (!projectKey) {
		// Return built-in templates only
		return json({ templates: BUILTIN_TEMPLATES });
	}

	const supabaseUrl = getProjectSecret(projectKey, 'supabase_url');
	const serviceRoleKey = getProjectSecret(projectKey, 'supabase_service_role_key');

	if (!supabaseUrl || !serviceRoleKey) {
		return json({ templates: BUILTIN_TEMPLATES });
	}

	// Try to fetch templates from the project's Supabase
	try {
		const response = await fetch(
			`${supabaseUrl}/rest/v1/milestone_templates?select=*&order=is_default.desc`,
			{
				headers: {
					'apikey': serviceRoleKey,
					'Authorization': `Bearer ${serviceRoleKey}`,
					'Content-Type': 'application/json'
				}
			}
		);

		if (!response.ok) {
			// Table doesn't exist or other error — use built-in templates
			return json({ templates: BUILTIN_TEMPLATES });
		}

		const data = await response.json();
		const projectTemplates = Array.isArray(data) ? data : [];

		if (projectTemplates.length === 0) {
			return json({ templates: BUILTIN_TEMPLATES });
		}

		return json({ templates: projectTemplates });
	} catch {
		return json({ templates: BUILTIN_TEMPLATES });
	}
};
