/**
 * GET /api/clients
 *
 * Aggregates contract and milestone data from all client projects that have
 * Supabase credentials configured. Uses service role keys to query each
 * project's Supabase instance directly via the REST API.
 *
 * Response shape:
 * {
 *   projects: Array<{ name, supabaseUrl, contracts, milestones, error? }>,
 *   summary: { totalContracted, totalPaid, totalOutstanding, activeContracts, totalMilestones },
 *   cachedAt: string | null
 * }
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getProjectSecret } from '$lib/utils/credentials';

interface ProjectConfig {
	name: string;
	path: string;
	description?: string;
	port?: number;
	[key: string]: unknown;
}

interface Milestone {
	id: string;
	contract_id: string;
	name: string;
	description: string | null;
	percentage: number;
	amount: number;
	status: string;
	sort_order: number;
	delivered_at: string | null;
	accepted_at: string | null;
	paid_at: string | null;
	stripe_invoice_id: string | null;
	created_at: string;
	updated_at: string;
}

interface Contract {
	id: string;
	team_id: string;
	client_user_id: string | null;
	title: string;
	total_amount: number;
	currency: string;
	status: string;
	signed_at: string | null;
	notes: string | null;
	created_at: string;
	updated_at: string;
	milestones?: Milestone[];
}

interface ProjectData {
	name: string;
	projectKey: string;
	contracts: Contract[];
	error?: string;
}

interface CacheEntry {
	data: ProjectData[];
	timestamp: number;
}

// 5-minute cache
const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

/**
 * Get all projects from projects.json
 */
function getProjects(): Record<string, ProjectConfig> {
	const configPath = join(process.env.HOME || '~', '.config', 'jat', 'projects.json');
	if (!existsSync(configPath)) return {};

	try {
		const content = readFileSync(configPath, 'utf-8');
		const config = JSON.parse(content);
		return config.projects || {};
	} catch {
		return {};
	}
}

/**
 * Query a Supabase project's REST API
 */
async function supabaseQuery(
	supabaseUrl: string,
	serviceRoleKey: string,
	table: string,
	query: string = ''
): Promise<{ data: unknown[] | null; error: string | null }> {
	const url = `${supabaseUrl}/rest/v1/${table}${query ? '?' + query : ''}`;

	try {
		const response = await fetch(url, {
			headers: {
				'apikey': serviceRoleKey,
				'Authorization': `Bearer ${serviceRoleKey}`,
				'Content-Type': 'application/json',
				'Prefer': 'return=representation'
			}
		});

		if (!response.ok) {
			const text = await response.text();
			// Table doesn't exist yet — not an error, just no data
			if (response.status === 404 || text.includes('does not exist')) {
				return { data: [], error: null };
			}
			return { data: null, error: `HTTP ${response.status}: ${text.slice(0, 200)}` };
		}

		const data = await response.json();
		return { data: Array.isArray(data) ? data : [], error: null };
	} catch (err) {
		return { data: null, error: (err as Error).message };
	}
}

/**
 * Fetch contracts and milestones for a single project
 */
async function fetchProjectData(projectKey: string, projectName: string): Promise<ProjectData> {
	const supabaseUrl = getProjectSecret(projectKey, 'supabase_url');
	const serviceRoleKey = getProjectSecret(projectKey, 'supabase_service_role_key');

	if (!supabaseUrl || !serviceRoleKey) {
		return { name: projectName, projectKey, contracts: [], error: 'Missing Supabase credentials' };
	}

	// Fetch contracts
	const contractsResult = await supabaseQuery(
		supabaseUrl,
		serviceRoleKey,
		'contracts',
		'select=*&order=created_at.desc'
	);

	if (contractsResult.error) {
		return { name: projectName, projectKey, contracts: [], error: contractsResult.error };
	}

	const contracts = (contractsResult.data || []) as Contract[];

	if (contracts.length === 0) {
		return { name: projectName, projectKey, contracts: [] };
	}

	// Fetch milestones for all contracts
	const contractIds = contracts.map(c => c.id);
	const milestonesResult = await supabaseQuery(
		supabaseUrl,
		serviceRoleKey,
		'milestones',
		`select=*&contract_id=in.(${contractIds.join(',')})&order=sort_order.asc`
	);

	const milestones = (milestonesResult.data || []) as Milestone[];

	// Attach milestones to contracts
	const milestonesByContract = new Map<string, Milestone[]>();
	for (const m of milestones) {
		const arr = milestonesByContract.get(m.contract_id) || [];
		arr.push(m);
		milestonesByContract.set(m.contract_id, arr);
	}

	for (const contract of contracts) {
		contract.milestones = milestonesByContract.get(contract.id) || [];
	}

	return { name: projectName, projectKey, contracts };
}

/**
 * Write to a Supabase project's REST API (INSERT)
 */
async function supabaseInsert(
	supabaseUrl: string,
	serviceRoleKey: string,
	table: string,
	rows: Record<string, unknown> | Record<string, unknown>[]
): Promise<{ data: unknown[] | null; error: string | null }> {
	const url = `${supabaseUrl}/rest/v1/${table}`;

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'apikey': serviceRoleKey,
				'Authorization': `Bearer ${serviceRoleKey}`,
				'Content-Type': 'application/json',
				'Prefer': 'return=representation'
			},
			body: JSON.stringify(rows)
		});

		if (!response.ok) {
			const text = await response.text();
			return { data: null, error: `HTTP ${response.status}: ${text.slice(0, 200)}` };
		}

		const data = await response.json();
		return { data: Array.isArray(data) ? data : [data], error: null };
	} catch (err) {
		return { data: null, error: (err as Error).message };
	}
}

/**
 * Update rows in a Supabase project's REST API (PATCH)
 */
async function supabaseUpdate(
	supabaseUrl: string,
	serviceRoleKey: string,
	table: string,
	query: string,
	updates: Record<string, unknown>
): Promise<{ data: unknown[] | null; error: string | null }> {
	const url = `${supabaseUrl}/rest/v1/${table}?${query}`;

	try {
		const response = await fetch(url, {
			method: 'PATCH',
			headers: {
				'apikey': serviceRoleKey,
				'Authorization': `Bearer ${serviceRoleKey}`,
				'Content-Type': 'application/json',
				'Prefer': 'return=representation'
			},
			body: JSON.stringify(updates)
		});

		if (!response.ok) {
			const text = await response.text();
			return { data: null, error: `HTTP ${response.status}: ${text.slice(0, 200)}` };
		}

		const data = await response.json();
		return { data: Array.isArray(data) ? data : [data], error: null };
	} catch (err) {
		return { data: null, error: (err as Error).message };
	}
}

/**
 * Delete from a Supabase project's REST API
 */
async function supabaseDelete(
	supabaseUrl: string,
	serviceRoleKey: string,
	table: string,
	query: string
): Promise<{ error: string | null }> {
	const url = `${supabaseUrl}/rest/v1/${table}?${query}`;

	try {
		const response = await fetch(url, {
			method: 'DELETE',
			headers: {
				'apikey': serviceRoleKey,
				'Authorization': `Bearer ${serviceRoleKey}`,
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			const text = await response.text();
			return { error: `HTTP ${response.status}: ${text.slice(0, 200)}` };
		}

		return { error: null };
	} catch (err) {
		return { error: (err as Error).message };
	}
}

export const GET: RequestHandler = async ({ url }) => {
	const forceRefresh = url.searchParams.has('refresh');

	// Check cache
	if (!forceRefresh && cache && (Date.now() - cache.timestamp) < CACHE_TTL_MS) {
		return json({
			projects: cache.data,
			summary: computeSummary(cache.data),
			cachedAt: new Date(cache.timestamp).toISOString()
		});
	}

	// Get all projects and find those with Supabase credentials
	const projects = getProjects();
	const fetchPromises: Promise<ProjectData>[] = [];

	for (const [key, config] of Object.entries(projects)) {
		const supabaseUrl = getProjectSecret(key, 'supabase_url');
		const serviceRoleKey = getProjectSecret(key, 'supabase_service_role_key');

		if (supabaseUrl && serviceRoleKey) {
			fetchPromises.push(fetchProjectData(key, config.name || key));
		}
	}

	// Fetch all projects in parallel
	const results = await Promise.all(fetchPromises);

	// Update cache
	cache = { data: results, timestamp: Date.now() };

	return json({
		projects: results,
		summary: computeSummary(results),
		cachedAt: null // Fresh data
	});
};

/**
 * Compute aggregate summary across all projects
 */
function computeSummary(projects: ProjectData[]) {
	let totalContracted = 0;
	let totalPaid = 0;
	let totalOutstanding = 0;
	let activeContracts = 0;
	let totalMilestones = 0;
	let pendingMilestones = 0;
	let deliveredMilestones = 0;
	let paidMilestones = 0;

	for (const project of projects) {
		for (const contract of project.contracts) {
			const activeStatuses = ['draft', 'sent', 'signed', 'active'];
			if (activeStatuses.includes(contract.status)) {
				activeContracts++;
			}
			totalContracted += contract.total_amount;

			for (const milestone of contract.milestones || []) {
				totalMilestones++;
				if (milestone.status === 'paid') {
					totalPaid += milestone.amount;
					paidMilestones++;
				} else if (milestone.status === 'delivered' || milestone.status === 'accepted') {
					totalOutstanding += milestone.amount;
					deliveredMilestones++;
				} else {
					totalOutstanding += milestone.amount;
					pendingMilestones++;
				}
			}
		}
	}

	return {
		totalContracted,
		totalPaid,
		totalOutstanding,
		activeContracts,
		totalMilestones,
		pendingMilestones,
		deliveredMilestones,
		paidMilestones
	};
}

/**
 * POST /api/clients
 *
 * Create a new contract in a specific project's Supabase instance.
 * Writes contract + milestones via REST API with service role key.
 *
 * Request body:
 * {
 *   projectKey: string,
 *   title: string,
 *   totalAmount: number (cents),
 *   currency: string,
 *   clientEmail?: string,
 *   notes?: string,
 *   milestones: Array<{ name, percentage, description?, acceptance_criteria? }>
 * }
 */
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { projectKey, title, totalAmount, currency, clientEmail, notes, milestones } = body;

	if (!projectKey) {
		return json({ error: 'projectKey is required' }, { status: 400 });
	}
	if (!totalAmount || totalAmount <= 0) {
		return json({ error: 'totalAmount must be a positive number (in cents)' }, { status: 400 });
	}
	if (!milestones || !Array.isArray(milestones) || milestones.length === 0) {
		return json({ error: 'At least one milestone is required' }, { status: 400 });
	}

	// Validate percentages sum to 100
	const totalPct = milestones.reduce((sum: number, m: { percentage: number }) => sum + (m.percentage || 0), 0);
	if (Math.abs(totalPct - 100) > 0.01) {
		return json({ error: `Milestone percentages must total 100% (currently ${totalPct}%)` }, { status: 400 });
	}

	// Get Supabase credentials for this project
	const supabaseUrl = getProjectSecret(projectKey, 'supabase_url');
	const serviceRoleKey = getProjectSecret(projectKey, 'supabase_service_role_key');

	if (!supabaseUrl || !serviceRoleKey) {
		return json({ error: `Missing Supabase credentials for project "${projectKey}"` }, { status: 400 });
	}

	// Look up the team_id from the project's teams table
	const teamsResult = await supabaseQuery(supabaseUrl, serviceRoleKey, 'teams', 'select=id&limit=1');
	if (teamsResult.error || !teamsResult.data || teamsResult.data.length === 0) {
		return json({ error: 'Could not find a team in the target project. Ensure the contracts migration has been run.' }, { status: 400 });
	}
	const teamId = (teamsResult.data[0] as { id: string }).id;

	// Create the contract
	const contractData = {
		team_id: teamId,
		title: title || 'Service Agreement',
		total_amount: totalAmount,
		currency: currency || 'usd',
		notes: notes || null,
		status: 'draft'
	};

	const contractResult = await supabaseInsert(supabaseUrl, serviceRoleKey, 'contracts', contractData);
	if (contractResult.error || !contractResult.data || contractResult.data.length === 0) {
		return json({ error: `Failed to create contract: ${contractResult.error}` }, { status: 500 });
	}

	const contract = contractResult.data[0] as { id: string };

	// Create milestones
	const milestoneRows = milestones.map((m: { name: string; percentage: number; description?: string; acceptance_criteria?: string }, i: number) => ({
		contract_id: contract.id,
		name: m.name,
		description: m.description || null,
		percentage: m.percentage,
		amount: Math.round(totalAmount * (m.percentage / 100)),
		acceptance_criteria: m.acceptance_criteria || null,
		sort_order: i,
		status: 'pending'
	}));

	const msResult = await supabaseInsert(supabaseUrl, serviceRoleKey, 'milestones', milestoneRows);
	if (msResult.error) {
		// Clean up the contract
		await supabaseDelete(supabaseUrl, serviceRoleKey, 'contracts', `id=eq.${contract.id}`);
		return json({ error: `Failed to create milestones: ${msResult.error}` }, { status: 500 });
	}

	// Invalidate cache so the list refreshes
	cache = null;

	return json({
		success: true,
		contract: {
			id: contract.id,
			projectKey,
			title: contractData.title,
			totalAmount,
			currency: contractData.currency,
			milestoneCount: milestones.length
		}
	}, { status: 201 });
};

/**
 * PATCH /api/clients
 *
 * Update a contract or milestone status in a project's Supabase.
 *
 * Request body:
 * {
 *   projectKey: string,
 *   type: 'contract' | 'milestone',
 *   id: string,
 *   updates: { status?: string, notes?: string, title?: string, ... }
 * }
 */
export const PATCH: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { projectKey, type, id, updates } = body;

	if (!projectKey || !type || !id || !updates) {
		return json({ error: 'projectKey, type, id, and updates are required' }, { status: 400 });
	}

	if (type !== 'contract' && type !== 'milestone') {
		return json({ error: 'type must be "contract" or "milestone"' }, { status: 400 });
	}

	const supabaseUrl = getProjectSecret(projectKey, 'supabase_url');
	const serviceRoleKey = getProjectSecret(projectKey, 'supabase_service_role_key');

	if (!supabaseUrl || !serviceRoleKey) {
		return json({ error: `Missing Supabase credentials for project "${projectKey}"` }, { status: 400 });
	}

	const table = type === 'contract' ? 'contracts' : 'milestones';

	// Add timestamp fields for milestone status changes
	const patchData = { ...updates };
	if (type === 'milestone' && updates.status) {
		const now = new Date().toISOString();
		if (updates.status === 'delivered') patchData.delivered_at = now;
		if (updates.status === 'accepted') patchData.accepted_at = now;
		if (updates.status === 'paid') patchData.paid_at = now;
	}

	const result = await supabaseUpdate(supabaseUrl, serviceRoleKey, table, `id=eq.${id}`, patchData);

	if (result.error) {
		return json({ error: `Failed to update ${type}: ${result.error}` }, { status: 500 });
	}

	// Invalidate cache
	cache = null;

	return json({
		success: true,
		updated: result.data?.[0] || null
	});
};
