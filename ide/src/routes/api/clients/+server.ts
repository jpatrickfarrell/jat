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

interface ContractTerm {
	id: string;
	contract_id: string;
	title: string;
	body: string;
	sort_order: number;
	status: string; // pending | accepted | rejected
	client_notes: string | null;
	accepted_at: string | null;
	signature_data: string | null;
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
	terms?: ContractTerm[];
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

	// Fetch milestone_tasks links (non-blocking — table may not exist yet)
	const milestoneIds = milestones.map(m => m.id);
	let milestoneTaskLinks: Array<{ milestone_id: string; task_id: string }> = [];

	if (milestoneIds.length > 0) {
		const linksResult = await supabaseQuery(
			supabaseUrl,
			serviceRoleKey,
			'milestone_tasks',
			`select=milestone_id,task_id&milestone_id=in.(${milestoneIds.join(',')})`
		);
		if (!linksResult.error && linksResult.data) {
			milestoneTaskLinks = linksResult.data as Array<{ milestone_id: string; task_id: string }>;
		}
	}

	// Fetch linked task details if any links exist
	const linkedTaskIds = [...new Set(milestoneTaskLinks.map(l => l.task_id))];
	let linkedTasks: Array<{ id: string; title: string; status: string; issue_type: string }> = [];

	if (linkedTaskIds.length > 0) {
		const tasksResult = await supabaseQuery(
			supabaseUrl,
			serviceRoleKey,
			'project_tasks',
			`select=id,title,status,issue_type&id=in.(${linkedTaskIds.join(',')})`
		);
		if (!tasksResult.error && tasksResult.data) {
			linkedTasks = tasksResult.data as Array<{ id: string; title: string; status: string; issue_type: string }>;
		}
	}

	// Build task lookup
	const taskById = new Map(linkedTasks.map(t => [t.id, t]));

	// Build milestone → tasks mapping
	const tasksByMilestone = new Map<string, Array<{ id: string; title: string; status: string; issue_type: string }>>();
	for (const link of milestoneTaskLinks) {
		const task = taskById.get(link.task_id);
		if (!task) continue;
		const arr = tasksByMilestone.get(link.milestone_id) || [];
		arr.push(task);
		tasksByMilestone.set(link.milestone_id, arr);
	}

	// Attach milestones to contracts (with linked tasks)
	const milestonesByContract = new Map<string, Milestone[]>();
	for (const m of milestones) {
		(m as any).linked_tasks = tasksByMilestone.get(m.id) || [];
		const arr = milestonesByContract.get(m.contract_id) || [];
		arr.push(m);
		milestonesByContract.set(m.contract_id, arr);
	}

	for (const contract of contracts) {
		contract.milestones = milestonesByContract.get(contract.id) || [];
	}

	// Fetch contract terms (non-blocking — table may not exist yet)
	const termsResult = await supabaseQuery(
		supabaseUrl,
		serviceRoleKey,
		'contract_terms',
		`select=*&contract_id=in.(${contractIds.join(',')})&order=sort_order.asc`
	);

	if (!termsResult.error && termsResult.data) {
		const terms = termsResult.data as ContractTerm[];
		const termsByContract = new Map<string, ContractTerm[]>();
		for (const term of terms) {
			const arr = termsByContract.get(term.contract_id) || [];
			arr.push(term);
			termsByContract.set(term.contract_id, arr);
		}
		for (const contract of contracts) {
			contract.terms = termsByContract.get(contract.id) || [];
		}
	}

	// Auto-invoice: trigger Edge Function for delivered milestones with linked tasks but no invoice
	for (const m of milestones) {
		if (m.status === 'delivered' && !m.stripe_invoice_id) {
			const tasks = tasksByMilestone.get(m.id);
			if (tasks && tasks.length > 0) {
				// Fire-and-forget: call the auto-invoice Edge Function
				fetch(`${supabaseUrl}/functions/v1/milestone-auto-invoice`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${serviceRoleKey}`
					},
					body: JSON.stringify({ milestoneId: m.id })
				}).catch(err => {
					console.warn(`[clients] Auto-invoice call failed for milestone ${m.id}: ${err.message}`);
				});
			}
		}
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
			const activeStatuses = ['draft', 'published', 'signed', 'active'];
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
 * Two modes:
 * 1. Create new contract: { projectKey, title, totalAmount, currency, milestones[], terms[]? }
 * 2. Add terms to existing: { action: 'addTerms', projectKey, contractId, terms[] }
 */
export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	// Handle linkTask action — link a task to an existing milestone
	if (body.action === 'linkTask') {
		const { projectKey, milestoneId, taskId } = body;

		if (!projectKey || !milestoneId || !taskId) {
			return json({ error: 'projectKey, milestoneId, and taskId are required' }, { status: 400 });
		}

		const supabaseUrl = getProjectSecret(projectKey, 'supabase_url');
		const serviceRoleKey = getProjectSecret(projectKey, 'supabase_service_role_key');

		if (!supabaseUrl || !serviceRoleKey) {
			return json({ error: `Missing Supabase credentials for "${projectKey}"` }, { status: 400 });
		}

		const result = await supabaseInsert(supabaseUrl, serviceRoleKey, 'milestone_tasks', {
			milestone_id: milestoneId,
			task_id: taskId
		});

		if (result.error) {
			// Ignore duplicate key errors (task already linked)
			if (result.error.includes('duplicate') || result.error.includes('unique') || result.error.includes('23505')) {
				return json({ success: true, message: 'Already linked' });
			}
			return json({ error: `Failed to link task: ${result.error}` }, { status: 500 });
		}

		cache = null;
		return json({ success: true }, { status: 201 });
	}

	// Handle unlinkTask action — remove a task link from a milestone
	if (body.action === 'unlinkTask') {
		const { projectKey, milestoneId, taskId } = body;

		if (!projectKey || !milestoneId || !taskId) {
			return json({ error: 'projectKey, milestoneId, and taskId are required' }, { status: 400 });
		}

		const supabaseUrl = getProjectSecret(projectKey, 'supabase_url');
		const serviceRoleKey = getProjectSecret(projectKey, 'supabase_service_role_key');

		if (!supabaseUrl || !serviceRoleKey) {
			return json({ error: `Missing Supabase credentials for "${projectKey}"` }, { status: 400 });
		}

		const result = await supabaseDelete(supabaseUrl, serviceRoleKey, 'milestone_tasks',
			`milestone_id=eq.${milestoneId}&task_id=eq.${taskId}`
		);

		if (result.error) {
			return json({ error: `Failed to unlink task: ${result.error}` }, { status: 500 });
		}

		cache = null;
		return json({ success: true });
	}

	// Handle addMilestone action — add a milestone to an existing contract
	if (body.action === 'addMilestone') {
		const { projectKey, contractId, name, percentage, description } = body;

		if (!projectKey || !contractId || !name || percentage == null) {
			return json({ error: 'projectKey, contractId, name, and percentage are required' }, { status: 400 });
		}

		const supabaseUrl = getProjectSecret(projectKey, 'supabase_url');
		const serviceRoleKey = getProjectSecret(projectKey, 'supabase_service_role_key');

		if (!supabaseUrl || !serviceRoleKey) {
			return json({ error: `Missing Supabase credentials for "${projectKey}"` }, { status: 400 });
		}

		// Get the contract's total_amount and current max sort_order
		const contractResult = await supabaseQuery(
			supabaseUrl, serviceRoleKey,
			'contracts',
			`select=total_amount&id=eq.${contractId}&limit=1`
		);
		if (contractResult.error || !contractResult.data?.length) {
			return json({ error: 'Contract not found' }, { status: 404 });
		}
		const totalAmount = (contractResult.data[0] as { total_amount: number }).total_amount;

		const maxOrderResult = await supabaseQuery(
			supabaseUrl, serviceRoleKey,
			'milestones',
			`select=sort_order&contract_id=eq.${contractId}&order=sort_order.desc&limit=1`
		);
		const maxOrder = (maxOrderResult.data?.[0] as { sort_order: number } | undefined)?.sort_order ?? -1;

		const milestoneRow = {
			contract_id: contractId,
			name,
			description: description || null,
			percentage,
			amount: Math.round((percentage / 100) * totalAmount),
			sort_order: maxOrder + 1,
			status: 'pending'
		};

		const result = await supabaseInsert(supabaseUrl, serviceRoleKey, 'milestones', milestoneRow);
		if (result.error) {
			return json({ error: `Failed to add milestone: ${result.error}` }, { status: 500 });
		}

		cache = null;
		return json({ success: true, milestone: result.data?.[0] }, { status: 201 });
	}

	// Handle addTerms action for existing contracts
	if (body.action === 'addTerms') {
		const { projectKey, contractId, terms: newTerms } = body;

		if (!projectKey || !contractId || !newTerms?.length) {
			return json({ error: 'projectKey, contractId, and terms are required' }, { status: 400 });
		}

		const supabaseUrl = getProjectSecret(projectKey, 'supabase_url');
		const serviceRoleKey = getProjectSecret(projectKey, 'supabase_service_role_key');

		if (!supabaseUrl || !serviceRoleKey) {
			return json({ error: `Missing Supabase credentials for "${projectKey}"` }, { status: 400 });
		}

		// Get current max sort_order for this contract's terms
		const existingResult = await supabaseQuery(
			supabaseUrl, serviceRoleKey,
			'contract_terms',
			`select=sort_order&contract_id=eq.${contractId}&order=sort_order.desc&limit=1`
		);
		const maxOrder = (existingResult.data?.[0] as { sort_order: number } | undefined)?.sort_order ?? -1;

		const termRows = newTerms.map((t: { title: string; body: string }, i: number) => ({
			contract_id: contractId,
			title: t.title,
			body: t.body || '',
			sort_order: maxOrder + 1 + i,
			status: 'pending'
		}));

		const result = await supabaseInsert(supabaseUrl, serviceRoleKey, 'contract_terms', termRows);
		if (result.error) {
			return json({ error: `Failed to add terms: ${result.error}` }, { status: 500 });
		}

		cache = null;
		return json({ success: true, termsCreated: termRows.length }, { status: 201 });
	}

	const { projectKey, title, totalAmount, currency, clientEmail, notes, milestones, terms } = body;

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

	// Look up client user by email if provided
	let clientUserId: string | null = null;
	if (clientEmail) {
		try {
			const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
				headers: {
					'apikey': serviceRoleKey,
					'Authorization': `Bearer ${serviceRoleKey}`,
				}
			});
			if (authRes.ok) {
				const authData = await authRes.json();
				const users = authData.users || authData || [];
				const match = users.find((u: { email?: string }) =>
					u.email?.toLowerCase() === clientEmail.toLowerCase()
				);
				if (match) {
					clientUserId = match.id;
				}
			}
		} catch (err) {
			console.warn(`[clients] Could not look up client email: ${(err as Error).message}`);
		}
	}

	// Create the contract
	const contractData: Record<string, unknown> = {
		team_id: teamId,
		title: title || 'Service Agreement',
		total_amount: totalAmount,
		currency: currency || 'usd',
		notes: notes || null,
		status: 'draft',
		...(clientUserId ? { client_user_id: clientUserId } : {})
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

	// Link tasks to milestones (if any taskIds provided)
	const createdMilestones = (msResult.data || []) as Array<{ id: string }>;
	let taskLinksCreated = 0;

	for (let i = 0; i < milestones.length; i++) {
		const taskIds = milestones[i].taskIds as string[] | undefined;
		if (!taskIds || taskIds.length === 0) continue;
		if (i >= createdMilestones.length) continue;

		const milestoneId = createdMilestones[i].id;
		const linkRows = taskIds.map((taskId: string) => ({
			milestone_id: milestoneId,
			task_id: taskId
		}));

		const linkResult = await supabaseInsert(supabaseUrl, serviceRoleKey, 'milestone_tasks', linkRows);
		if (linkResult.error) {
			console.warn(`[clients] Failed to link tasks to milestone ${milestoneId}: ${linkResult.error}`);
		} else {
			taskLinksCreated += taskIds.length;
		}
	}

	// Create contract terms if provided
	let termsCreated = 0;
	if (terms && Array.isArray(terms) && terms.length > 0) {
		const termRows = terms.map((t: { title: string; body: string }, i: number) => ({
			contract_id: contract.id,
			title: t.title,
			body: t.body || '',
			sort_order: i,
			status: 'pending'
		}));

		const termsResult = await supabaseInsert(supabaseUrl, serviceRoleKey, 'contract_terms', termRows);
		if (termsResult.error) {
			console.warn(`[clients] Failed to create contract terms: ${termsResult.error}`);
		} else {
			termsCreated = termRows.length;
		}
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
			milestoneCount: milestones.length,
			taskLinksCreated,
			termsCreated
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

	if (type !== 'contract' && type !== 'milestone' && type !== 'term') {
		return json({ error: 'type must be "contract", "milestone", or "term"' }, { status: 400 });
	}

	const supabaseUrl = getProjectSecret(projectKey, 'supabase_url');
	const serviceRoleKey = getProjectSecret(projectKey, 'supabase_service_role_key');

	if (!supabaseUrl || !serviceRoleKey) {
		return json({ error: `Missing Supabase credentials for project "${projectKey}"` }, { status: 400 });
	}

	const tableMap: Record<string, string> = { contract: 'contracts', milestone: 'milestones', term: 'contract_terms' };
	const table = tableMap[type];

	// Add timestamp fields for status changes
	const patchData = { ...updates };
	if (type === 'milestone' && updates.status) {
		const now = new Date().toISOString();
		if (updates.status === 'delivered') patchData.delivered_at = now;
		if (updates.status === 'accepted') patchData.accepted_at = now;
		if (updates.status === 'paid') patchData.paid_at = now;
	}
	if (type === 'term' && updates.status) {
		const now = new Date().toISOString();
		if (updates.status === 'accepted') patchData.accepted_at = now;
		if (updates.status === 'rejected') patchData.accepted_at = null;
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

/**
 * DELETE /api/clients
 *
 * Delete a milestone or term from a contract.
 * Only allowed when the contract is in draft or sent status.
 *
 * Query params: projectKey, type (milestone|term), id
 */
export const DELETE: RequestHandler = async ({ url }) => {
	const projectKey = url.searchParams.get('projectKey');
	const type = url.searchParams.get('type');
	const id = url.searchParams.get('id');

	if (!projectKey || !type || !id) {
		return json({ error: 'projectKey, type, and id are required' }, { status: 400 });
	}

	if (type !== 'milestone' && type !== 'term') {
		return json({ error: 'type must be "milestone" or "term"' }, { status: 400 });
	}

	const supabaseUrl = getProjectSecret(projectKey, 'supabase_url');
	const serviceRoleKey = getProjectSecret(projectKey, 'supabase_service_role_key');

	if (!supabaseUrl || !serviceRoleKey) {
		return json({ error: `Missing Supabase credentials for "${projectKey}"` }, { status: 400 });
	}

	const tableMap: Record<string, string> = { milestone: 'milestones', term: 'contract_terms' };
	const table = tableMap[type];

	const result = await supabaseDelete(supabaseUrl, serviceRoleKey, table, `id=eq.${id}`);

	if (result.error) {
		return json({ error: `Failed to delete ${type}: ${result.error}` }, { status: 500 });
	}

	cache = null;

	return json({ success: true });
};
