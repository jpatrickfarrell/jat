<script lang="ts">
	import { onMount } from 'svelte';

	interface LinkedTask {
		id: string;
		title: string;
		status: string;
		issue_type: string;
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
		linked_tasks?: LinkedTask[];
	}

	interface Contract {
		id: string;
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

	interface Summary {
		totalContracted: number;
		totalPaid: number;
		totalOutstanding: number;
		activeContracts: number;
		totalMilestones: number;
		pendingMilestones: number;
		deliveredMilestones: number;
		paidMilestones: number;
	}

	interface MilestoneTemplate {
		id: string;
		name: string;
		description?: string;
		is_default?: boolean;
		milestones: Array<{
			name: string;
			percentage: number;
			description?: string;
			acceptance_criteria?: string;
		}>;
	}

	interface ProjectTask {
		id: string;
		title: string;
		status: string;
		issue_type: string;
		priority: string;
		assignee: string | null;
	}

	interface MilestoneRow {
		name: string;
		percentage: number;
		description: string;
		acceptance_criteria: string;
		taskIds: string[];
	}

	let projects = $state<ProjectData[]>([]);
	let summary = $state<Summary | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let cachedAt = $state<string | null>(null);

	// Expanded project cards
	let expandedProjects = $state<Set<string>>(new Set());

	// Expanded contract detail
	let expandedContract = $state<string | null>(null);
	let updatingItem = $state<string | null>(null); // id of item being updated

	function toggleContract(contractId: string) {
		expandedContract = expandedContract === contractId ? null : contractId;
	}

	const CONTRACT_STATUSES = ['draft', 'sent', 'signed', 'active', 'completed', 'cancelled'] as const;
	const MILESTONE_STATUSES = ['pending', 'delivered', 'accepted', 'paid'] as const;

	async function updateStatus(projectKey: string, type: 'contract' | 'milestone', id: string, status: string) {
		updatingItem = id;
		try {
			const res = await fetch('/api/clients', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ projectKey, type, id, updates: { status } })
			});
			if (!res.ok) {
				const data = await res.json();
				console.error('Update failed:', data.error);
				return;
			}
			await fetchData(true);
		} finally {
			updatingItem = null;
		}
	}

	// Contract creation modal state
	let showCreateModal = $state(false);
	let createError = $state<string | null>(null);
	let createSuccess = $state<string | null>(null);
	let creating = $state(false);

	// Form fields
	let selectedProject = $state('');
	let contractTitle = $state('Service Agreement');
	let totalAmount = $state('');
	let currency = $state('usd');
	let clientEmail = $state('');
	let contractNotes = $state('');

	// Milestone state
	let templates = $state<MilestoneTemplate[]>([]);
	let selectedTemplateId = $state<string | null>(null);
	let milestones = $state<MilestoneRow[]>([]);
	let loadingTemplates = $state(false);

	// Task picker state
	let projectTasks = $state<ProjectTask[]>([]);
	let loadingTasks = $state(false);
	let taskSearchTerm = $state('');
	let taskPickerMilestoneIndex = $state<number | null>(null);

	let filteredTasks = $derived.by(() => {
		if (!taskSearchTerm) return projectTasks;
		const term = taskSearchTerm.toLowerCase();
		return projectTasks.filter(t =>
			t.title.toLowerCase().includes(term) ||
			t.status.toLowerCase().includes(term) ||
			t.issue_type.toLowerCase().includes(term)
		);
	});

	async function fetchProjectTasks(projectKey: string) {
		loadingTasks = true;
		try {
			const res = await fetch(`/api/clients/tasks?project=${encodeURIComponent(projectKey)}`);
			const data = await res.json();
			projectTasks = data.tasks || [];
		} catch {
			projectTasks = [];
		} finally {
			loadingTasks = false;
		}
	}

	function openTaskPicker(milestoneIndex: number) {
		taskPickerMilestoneIndex = milestoneIndex;
		taskSearchTerm = '';
	}

	function closeTaskPicker() {
		taskPickerMilestoneIndex = null;
		taskSearchTerm = '';
	}

	function toggleTaskLink(milestoneIndex: number, taskId: string) {
		const current = milestones[milestoneIndex].taskIds;
		if (current.includes(taskId)) {
			milestones[milestoneIndex].taskIds = current.filter(id => id !== taskId);
		} else {
			milestones[milestoneIndex].taskIds = [...current, taskId];
		}
	}

	function getLinkedTaskNames(taskIds: string[]): string[] {
		return taskIds
			.map(id => projectTasks.find(t => t.id === id)?.title)
			.filter((t): t is string => !!t);
	}

	let totalPercentage = $derived(milestones.reduce((sum, m) => sum + (m.percentage || 0), 0));
	let percentageValid = $derived(Math.abs(totalPercentage - 100) < 0.01);

	let computedAmounts = $derived(
		milestones.map(m => {
			const cents = Math.round(parseFloat(totalAmount || '0') * 100 * (m.percentage / 100));
			return cents / 100;
		})
	);

	// Available projects (those with Supabase credentials)
	let availableProjects = $derived(projects.filter(p => !p.error || p.contracts.length > 0));

	function toggleProject(key: string) {
		const next = new Set(expandedProjects);
		if (next.has(key)) next.delete(key);
		else next.add(key);
		expandedProjects = next;
	}

	async function fetchData(refresh = false) {
		loading = true;
		error = null;
		try {
			const url = refresh ? '/api/clients?refresh' : '/api/clients';
			const res = await fetch(url);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			projects = data.projects || [];
			summary = data.summary || null;
			cachedAt = data.cachedAt || null;
		} catch (e) {
			error = (e as Error).message;
		} finally {
			loading = false;
		}
	}

	function formatCents(cents: number, currency = 'usd'): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: currency.toUpperCase(),
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(cents / 100);
	}

	function formatDollars(amount: number): string {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '—';
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function statusBadgeClass(status: string): string {
		switch (status) {
			case 'draft': return 'badge-ghost';
			case 'sent': return 'badge-info';
			case 'signed': case 'active': return 'badge-success';
			case 'completed': return 'badge-primary';
			case 'cancelled': return 'badge-error';
			case 'pending': return 'badge-warning';
			case 'delivered': case 'accepted': return 'badge-info';
			case 'paid': return 'badge-success';
			default: return 'badge-ghost';
		}
	}

	// All milestones across all projects, sorted by urgency
	const upcomingMilestones = $derived.by(() => {
		const result: Array<Milestone & { projectName: string; contractTitle: string }> = [];
		for (const project of projects) {
			for (const contract of project.contracts) {
				if (contract.status === 'cancelled' || contract.status === 'completed') continue;
				for (const m of contract.milestones || []) {
					if (m.status === 'pending' || m.status === 'delivered') {
						result.push({ ...m, projectName: project.name, contractTitle: contract.title });
					}
				}
			}
		}
		// Sort: delivered first (awaiting payment), then pending
		return result.sort((a, b) => {
			const order: Record<string, number> = { delivered: 0, accepted: 1, pending: 2 };
			return (order[a.status] ?? 3) - (order[b.status] ?? 3);
		});
	});

	// Recent payments (paid milestones sorted by paid_at desc)
	const recentPayments = $derived.by(() => {
		const result: Array<Milestone & { projectName: string; contractTitle: string }> = [];
		for (const project of projects) {
			for (const contract of project.contracts) {
				for (const m of contract.milestones || []) {
					if (m.status === 'paid' && m.paid_at) {
						result.push({ ...m, projectName: project.name, contractTitle: contract.title });
					}
				}
			}
		}
		return result.sort((a, b) => {
			const aDate = a.paid_at ? new Date(a.paid_at).getTime() : 0;
			const bDate = b.paid_at ? new Date(b.paid_at).getTime() : 0;
			return bDate - aDate;
		}).slice(0, 20);
	});

	// Projects with actual contracts
	const projectsWithContracts = $derived(projects.filter(p => p.contracts.length > 0));
	const projectsWithoutContracts = $derived(projects.filter(p => p.contracts.length === 0 && !p.error));
	const projectsWithErrors = $derived(projects.filter(p => p.error));

	// Contract creation functions
	async function openCreateModal() {
		showCreateModal = true;
		createError = null;
		createSuccess = null;
		contractTitle = 'Service Agreement';
		totalAmount = '';
		currency = 'usd';
		clientEmail = '';
		contractNotes = '';
		milestones = [];
		selectedTemplateId = null;
		templates = [];
		projectTasks = [];
		taskPickerMilestoneIndex = null;

		// Auto-select first project if only one available
		if (availableProjects.length === 1) {
			selectedProject = availableProjects[0].projectKey;
			await fetchTemplates(selectedProject);
			await fetchProjectTasks(selectedProject);
		} else {
			selectedProject = '';
		}
	}

	async function fetchTemplates(projectKey: string) {
		loadingTemplates = true;
		try {
			const res = await fetch(`/api/clients/templates?project=${encodeURIComponent(projectKey)}`);
			const data = await res.json();
			templates = data.templates || [];

			// Auto-apply default template
			const defaultTemplate = templates.find(t => t.is_default) || templates[0];
			if (defaultTemplate) {
				applyTemplate(defaultTemplate.id);
			}
		} catch {
			templates = [];
		} finally {
			loadingTemplates = false;
		}
	}

	function applyTemplate(templateId: string | null) {
		selectedTemplateId = templateId;
		if (!templateId) {
			milestones = [{ name: '', percentage: 0, description: '', acceptance_criteria: '', taskIds: [] }];
			return;
		}
		const template = templates.find(t => t.id === templateId);
		if (!template) return;
		milestones = template.milestones.map(m => ({
			name: m.name || '',
			percentage: m.percentage || 0,
			description: m.description || '',
			acceptance_criteria: m.acceptance_criteria || '',
			taskIds: []
		}));
	}

	function addMilestone() {
		milestones = [...milestones, { name: '', percentage: 0, description: '', acceptance_criteria: '', taskIds: [] }];
	}

	function removeMilestone(index: number) {
		milestones = milestones.filter((_, i) => i !== index);
	}

	let prevSelectedProject = $state('');

	$effect(() => {
		if (selectedProject && selectedProject !== prevSelectedProject) {
			prevSelectedProject = selectedProject;
			milestones = [];
			selectedTemplateId = null;
			templates = [];
			projectTasks = [];
			fetchTemplates(selectedProject);
			fetchProjectTasks(selectedProject);
		}
	});

	async function createContract() {
		if (!selectedProject || !totalAmount || milestones.length === 0 || !percentageValid) return;

		creating = true;
		createError = null;
		createSuccess = null;

		try {
			const res = await fetch('/api/clients', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					projectKey: selectedProject,
					title: contractTitle,
					totalAmount: Math.round(parseFloat(totalAmount) * 100),
					currency,
					clientEmail: clientEmail || undefined,
					notes: contractNotes || undefined,
					milestones
				})
			});

			const data = await res.json();

			if (!res.ok) {
				createError = data.error || 'Failed to create contract';
				return;
			}

			createSuccess = `Contract "${data.contract.title}" created in ${selectedProject} with ${data.contract.milestoneCount} milestones.`;

			// Refresh data
			await fetchData(true);

			// Close modal after delay
			setTimeout(() => {
				showCreateModal = false;
				createSuccess = null;
			}, 2000);
		} catch (e) {
			createError = (e as Error).message;
		} finally {
			creating = false;
		}
	}

	onMount(() => {
		fetchData();
	});
</script>

<svelte:head>
	<title>Clients | JAT IDE</title>
</svelte:head>

<div class="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold">Clients</h1>
			<p class="text-sm opacity-60 mt-1">
				Contract and billing data across all client projects
			</p>
		</div>
		<div class="flex items-center gap-3">
			{#if cachedAt}
				<span class="text-xs opacity-40">
					Cached {formatDate(cachedAt)}
				</span>
			{/if}
			<button
				class="btn btn-sm btn-outline"
				onclick={() => fetchData(true)}
				disabled={loading}
			>
				{#if loading}
					<span class="loading loading-spinner loading-xs"></span>
				{:else}
					Refresh
				{/if}
			</button>
			<button
				class="btn btn-sm btn-primary"
				onclick={openCreateModal}
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
				New Contract
			</button>
		</div>
	</div>

	{#if loading && !summary}
		<!-- Skeleton loading -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each Array(4) as _}
				<div class="card bg-base-200 shadow-sm">
					<div class="card-body p-5">
						<div class="skeleton h-4 w-24 mb-2"></div>
						<div class="skeleton h-8 w-32"></div>
					</div>
				</div>
			{/each}
		</div>
		<div class="skeleton h-64 w-full rounded-lg"></div>
	{:else if error}
		<div class="alert alert-error">
			<span>Failed to load client data: {error}</span>
			<button class="btn btn-sm btn-ghost" onclick={() => fetchData()}>Retry</button>
		</div>
	{:else if summary}
		<!-- Revenue Summary Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<div class="card bg-base-200 shadow-sm">
				<div class="card-body p-5">
					<p class="text-xs font-semibold uppercase opacity-50">Total Contracted</p>
					<p class="text-2xl font-bold">{formatCents(summary.totalContracted)}</p>
					<p class="text-xs opacity-40">{summary.activeContracts} active contract{summary.activeContracts !== 1 ? 's' : ''}</p>
				</div>
			</div>
			<div class="card bg-base-200 shadow-sm">
				<div class="card-body p-5">
					<p class="text-xs font-semibold uppercase opacity-50">Total Paid</p>
					<p class="text-2xl font-bold text-success">{formatCents(summary.totalPaid)}</p>
					<p class="text-xs opacity-40">{summary.paidMilestones} milestone{summary.paidMilestones !== 1 ? 's' : ''} paid</p>
				</div>
			</div>
			<div class="card bg-base-200 shadow-sm">
				<div class="card-body p-5">
					<p class="text-xs font-semibold uppercase opacity-50">Outstanding</p>
					<p class="text-2xl font-bold text-warning">{formatCents(summary.totalOutstanding)}</p>
					<p class="text-xs opacity-40">{summary.deliveredMilestones} delivered, {summary.pendingMilestones} pending</p>
				</div>
			</div>
			<div class="card bg-base-200 shadow-sm">
				<div class="card-body p-5">
					<p class="text-xs font-semibold uppercase opacity-50">Milestone Pipeline</p>
					<p class="text-2xl font-bold">{summary.totalMilestones}</p>
					<div class="flex gap-2 mt-1">
						{#if summary.paidMilestones > 0}
							<span class="badge badge-success badge-sm">{summary.paidMilestones} paid</span>
						{/if}
						{#if summary.deliveredMilestones > 0}
							<span class="badge badge-info badge-sm">{summary.deliveredMilestones} delivered</span>
						{/if}
						{#if summary.pendingMilestones > 0}
							<span class="badge badge-warning badge-sm">{summary.pendingMilestones} pending</span>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Two-column layout: Projects + Pipeline -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Left: Projects with Contracts -->
			<div class="lg:col-span-2 flex flex-col gap-4">
				<h2 class="text-lg font-semibold">Client Projects</h2>

				{#if projectsWithContracts.length === 0}
					<div class="card bg-base-200 shadow-sm">
						<div class="card-body items-center text-center py-12">
							<p class="opacity-60">No contracts found in any project.</p>
							<p class="text-sm opacity-40 mt-1">
								Click "New Contract" to create one.
							</p>
						</div>
					</div>
				{/if}

				{#each projectsWithContracts as project}
					<div class="card bg-base-200 shadow-sm">
						<div class="card-body p-5">
							<!-- Project Header -->
							<button
								class="flex items-center justify-between w-full text-left"
								onclick={() => toggleProject(project.projectKey)}
							>
								<div class="flex items-center gap-3">
									<span class="font-bold text-lg">{project.name}</span>
									<span class="badge badge-sm badge-outline">
										{project.contracts.length} contract{project.contracts.length !== 1 ? 's' : ''}
									</span>
								</div>
								<div class="flex items-center gap-3">
									<span class="font-semibold">
										{formatCents(project.contracts.reduce((sum, c) => sum + c.total_amount, 0))}
									</span>
									<svg
										class="w-4 h-4 transition-transform"
										class:rotate-180={expandedProjects.has(project.projectKey)}
										fill="none" viewBox="0 0 24 24" stroke="currentColor"
									>
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
									</svg>
								</div>
							</button>

							<!-- Expanded: Contract Table -->
							{#if expandedProjects.has(project.projectKey)}
								<div class="mt-4">
									<div class="overflow-x-auto">
										<table class="table table-sm">
											<thead>
												<tr>
													<th>Contract</th>
													<th>Status</th>
													<th class="text-right">Amount</th>
													<th class="text-right">Paid</th>
													<th>Signed</th>
													<th>Milestones</th>
												</tr>
											</thead>
											<tbody>
												{#each project.contracts as contract}
													{@const paid = (contract.milestones || [])
														.filter(m => m.status === 'paid')
														.reduce((s, m) => s + m.amount, 0)}
													<tr
														class="cursor-pointer hover:bg-base-300/50 transition-colors"
														class:bg-base-300={expandedContract === contract.id}
														onclick={() => toggleContract(contract.id)}
													>
														<td class="font-medium">{contract.title}</td>
														<td>
															<span class="badge badge-sm {statusBadgeClass(contract.status)}">
																{contract.status}
															</span>
														</td>
														<td class="text-right font-mono">
															{formatCents(contract.total_amount, contract.currency)}
														</td>
														<td class="text-right font-mono text-success">
															{paid > 0 ? formatCents(paid, contract.currency) : '—'}
														</td>
														<td class="text-sm opacity-60">{formatDate(contract.signed_at)}</td>
														<td>
															<div class="flex gap-1">
																{#each contract.milestones || [] as milestone}
																	<div
																		class="w-3 h-3 rounded-full tooltip"
																		class:bg-success={milestone.status === 'paid'}
																		class:bg-info={milestone.status === 'delivered' || milestone.status === 'accepted'}
																		class:bg-warning={milestone.status === 'pending'}
																		data-tip="{milestone.name}: {milestone.status} ({milestone.percentage}%)"
																	></div>
																{/each}
															</div>
														</td>
													</tr>

													<!-- Expanded Contract Detail -->
													{#if expandedContract === contract.id}
														<tr>
															<td colspan="6" class="p-0 overflow-visible">
																<div class="bg-base-300/30 p-4 space-y-4 border-t border-base-300 overflow-visible">
																	<!-- Contract Info & Actions -->
																	<div class="flex items-start justify-between gap-4">
																		<div class="space-y-1">
																			{#if contract.notes}
																				<p class="text-sm opacity-60">{contract.notes}</p>
																			{/if}
																			<p class="text-xs opacity-40">
																				Created {formatDate(contract.created_at)}
																				{#if contract.signed_at} · Signed {formatDate(contract.signed_at)}{/if}
																			</p>
																		</div>
																		<div class="flex items-center gap-2 shrink-0">
																			<span class="text-xs opacity-40">Status:</span>
																			<div class="dropdown dropdown-end">
																				<div
																					tabindex="0"
																					role="button"
																					class="badge badge-sm {statusBadgeClass(contract.status)} cursor-pointer gap-1"
																					onclick={(e) => e.stopPropagation()}
																					onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") e.stopPropagation(); }}
																				>
																					{contract.status}
																					{#if updatingItem === contract.id}
																						<span class="loading loading-spinner loading-xs"></span>
																					{:else}
																						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
																						</svg>
																					{/if}
																				</div>
																				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
																				<ul tabindex="0" class="dropdown-content z-40 menu menu-sm shadow-lg bg-base-100 rounded-box w-40 p-1">
																					{#each CONTRACT_STATUSES as s}
																						<li>
																							<button
																								class:active={contract.status === s}
																								onclick={(e) => { e.stopPropagation(); updateStatus(project.projectKey, 'contract', contract.id, s); }}
																								disabled={contract.status === s}
																							>
																								<span class="badge badge-xs {statusBadgeClass(s)}"></span>
																								{s}
																							</button>
																						</li>
																					{/each}
																				</ul>
																			</div>
																		</div>
																	</div>

																	<!-- Milestone Table -->
																	{#if contract.milestones && contract.milestones.length > 0}
																		<div>
																			<h5 class="text-xs font-semibold uppercase opacity-50 mb-2">Milestones</h5>
																			<div class="overflow-visible">
																				<table class="table table-xs">
																					<thead>
																						<tr>
																							<th class="w-8">#</th>
																							<th>Name</th>
																							<th>Status</th>
																							<th class="text-right">%</th>
																							<th class="text-right">Amount</th>
																							<th>Date</th>
																						</tr>
																					</thead>
																					<tbody>
																						{#each contract.milestones as milestone, mi}
																							<tr class="hover:bg-base-300/30">
																								<td class="opacity-40">{mi + 1}</td>
																								<td>
																									<div>
																										<span class="font-medium">{milestone.name}</span>
																										{#if milestone.description}
																											<p class="text-xs opacity-50 mt-0.5">{milestone.description}</p>
																										{/if}
																									</div>
																								</td>
																								<td>
																									<div class="dropdown dropdown-end">
																										<div
																											tabindex="0"
																											role="button"
																											class="badge badge-xs {statusBadgeClass(milestone.status)} cursor-pointer gap-1"
																											onclick={(e) => e.stopPropagation()}
																											onkeydown={(e) => e.stopPropagation()}
																										>
																											{milestone.status}
																											{#if updatingItem === milestone.id}
																												<span class="loading loading-spinner" style="width:8px;height:8px"></span>
																											{:else}
																												<svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
																												</svg>
																											{/if}
																										</div>
																										<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
																										<ul tabindex="0" class="dropdown-content z-40 menu menu-xs shadow-lg bg-base-100 rounded-box w-36 p-1">
																											{#each MILESTONE_STATUSES as s}
																												<li>
																													<button
																														class:active={milestone.status === s}
																														onclick={(e) => { e.stopPropagation(); updateStatus(project.projectKey, 'milestone', milestone.id, s); }}
																														disabled={milestone.status === s}
																													>
																														<span class="badge badge-xs {statusBadgeClass(s)}"></span>
																														{s}
																													</button>
																												</li>
																											{/each}
																										</ul>
																									</div>
																								</td>
																								<td class="text-right font-mono opacity-60">{milestone.percentage}%</td>
																								<td class="text-right font-mono">{formatCents(milestone.amount, contract.currency)}</td>
																								<td class="text-xs opacity-50">
																									{#if milestone.paid_at}
																										Paid {formatDate(milestone.paid_at)}
																									{:else if milestone.accepted_at}
																										Accepted {formatDate(milestone.accepted_at)}
																									{:else if milestone.delivered_at}
																										Delivered {formatDate(milestone.delivered_at)}
																									{:else}
																										—
																									{/if}
																								</td>
																							</tr>
																							{#if milestone.linked_tasks && milestone.linked_tasks.length > 0}
																								<tr>
																									<td></td>
																									<td colspan="5" class="pt-0 pb-2">
																										<div class="flex flex-wrap gap-1">
																											{#each milestone.linked_tasks as task}
																												<span class="badge badge-xs badge-outline gap-1" title="{task.title} ({task.status})">
																													<span class="w-1.5 h-1.5 rounded-full {task.status === 'completed' || task.status === 'accepted' ? 'bg-success' : task.status === 'in_progress' ? 'bg-warning' : 'bg-base-300'}"></span>
																													<span class="max-w-[120px] truncate">{task.title}</span>
																												</span>
																											{/each}
																										</div>
																									</td>
																								</tr>
																							{/if}
																						{/each}
																					</tbody>
																				</table>
																			</div>
																		</div>
																	{/if}
																</div>
															</td>
														</tr>
													{/if}
												{/each}
											</tbody>
										</table>
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/each}

				<!-- Projects with errors -->
				{#each projectsWithErrors as project}
					<div class="card bg-base-200 shadow-sm border border-error/20">
						<div class="card-body p-4">
							<div class="flex items-center gap-3">
								<span class="font-bold">{project.name}</span>
								<span class="text-sm text-error opacity-70">{project.error}</span>
							</div>
						</div>
					</div>
				{/each}

				<!-- Projects without contracts -->
				{#if projectsWithoutContracts.length > 0}
					<div class="text-sm opacity-40 mt-2">
						{projectsWithoutContracts.length} project{projectsWithoutContracts.length !== 1 ? 's' : ''} connected with no contracts:
						{projectsWithoutContracts.map(p => p.name).join(', ')}
					</div>
				{/if}
			</div>

			<!-- Right: Pipeline & Payments -->
			<div class="flex flex-col gap-6">
				<!-- Upcoming Deliverables -->
				<div>
					<h2 class="text-lg font-semibold mb-3">Upcoming Deliverables</h2>
					{#if upcomingMilestones.length === 0}
						<p class="text-sm opacity-40">No pending milestones.</p>
					{:else}
						<div class="flex flex-col gap-2">
							{#each upcomingMilestones.slice(0, 10) as milestone}
								<div class="card bg-base-200 shadow-sm">
									<div class="card-body p-3">
										<div class="flex items-start justify-between gap-2">
											<div class="min-w-0">
												<p class="font-medium text-sm truncate">{milestone.name}</p>
												<p class="text-xs opacity-50">{milestone.projectName} / {milestone.contractTitle}</p>
											</div>
											<div class="text-right shrink-0">
												<span class="badge badge-sm {statusBadgeClass(milestone.status)}">{milestone.status}</span>
												<p class="text-sm font-mono mt-1">{formatCents(milestone.amount)}</p>
											</div>
										</div>
									</div>
								</div>
							{/each}
							{#if upcomingMilestones.length > 10}
								<p class="text-xs opacity-40 text-center">
									+{upcomingMilestones.length - 10} more
								</p>
							{/if}
						</div>
					{/if}
				</div>

				<!-- Recent Payments -->
				<div>
					<h2 class="text-lg font-semibold mb-3">Recent Payments</h2>
					{#if recentPayments.length === 0}
						<p class="text-sm opacity-40">No payments recorded yet.</p>
					{:else}
						<div class="flex flex-col gap-2">
							{#each recentPayments.slice(0, 8) as payment}
								<div class="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-base-200">
									<div class="min-w-0">
										<p class="text-sm font-medium truncate">{payment.name}</p>
										<p class="text-xs opacity-50">{payment.projectName}</p>
									</div>
									<div class="text-right shrink-0">
										<p class="text-sm font-mono text-success">{formatCents(payment.amount)}</p>
										<p class="text-xs opacity-40">{formatDate(payment.paid_at)}</p>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Contract Creation Modal -->
{#if showCreateModal}
	<div class="modal modal-open">
		<div class="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-bold">New Contract</h3>
				<button class="btn btn-sm btn-ghost btn-circle" onclick={() => showCreateModal = false}>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			{#if createError}
				<div class="alert alert-error mb-4">
					<span>{createError}</span>
				</div>
			{/if}

			{#if createSuccess}
				<div class="alert alert-success mb-4">
					<span>{createSuccess}</span>
				</div>
			{:else}
				<!-- Project Selector -->
				<div class="form-control mb-4">
					<label class="label" for="create-project">
						<span class="label-text font-semibold">Project</span>
					</label>
					<select
						id="create-project"
						class="select select-bordered w-full"
						bind:value={selectedProject}
					>
						<option value="" disabled>Select a project...</option>
						{#each projects as project}
							{#if !project.error}
								<option value={project.projectKey}>{project.name}</option>
							{/if}
						{/each}
					</select>
					<label class="label">
						<span class="label-text-alt opacity-50">Contract will be created in this project's Supabase</span>
					</label>
				</div>

				{#if selectedProject}
					<!-- Contract Details -->
					<div class="space-y-4 mb-6">
						<h4 class="font-semibold text-sm uppercase opacity-60">Contract Details</h4>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div class="form-control">
								<label class="label" for="create-title">
									<span class="label-text">Title</span>
								</label>
								<input
									id="create-title"
									type="text"
									class="input input-bordered"
									bind:value={contractTitle}
								/>
							</div>

							<div class="form-control">
								<label class="label" for="create-email">
									<span class="label-text">Client Email</span>
								</label>
								<input
									id="create-email"
									type="email"
									class="input input-bordered"
									bind:value={clientEmail}
									placeholder="client@example.com"
								/>
								<label class="label">
									<span class="label-text-alt opacity-50">Optional</span>
								</label>
							</div>

							<div class="form-control">
								<label class="label" for="create-amount">
									<span class="label-text">Total Amount</span>
								</label>
								<div class="join w-full">
									<span class="join-item btn btn-disabled">$</span>
									<input
										id="create-amount"
										type="number"
										step="0.01"
										min="0"
										class="input input-bordered join-item flex-1"
										bind:value={totalAmount}
										placeholder="50000.00"
									/>
								</div>
							</div>

							<div class="form-control">
								<label class="label" for="create-currency">
									<span class="label-text">Currency</span>
								</label>
								<select id="create-currency" class="select select-bordered" bind:value={currency}>
									<option value="usd">USD</option>
									<option value="eur">EUR</option>
									<option value="gbp">GBP</option>
								</select>
							</div>
						</div>

						<div class="form-control">
							<label class="label" for="create-notes">
								<span class="label-text">Notes</span>
							</label>
							<textarea
								id="create-notes"
								class="textarea textarea-bordered"
								rows="2"
								bind:value={contractNotes}
								placeholder="Internal notes about this contract..."
							></textarea>
						</div>
					</div>

					<!-- Milestones Section -->
					<div class="space-y-4">
						<div class="flex items-center justify-between">
							<h4 class="font-semibold text-sm uppercase opacity-60">Milestones</h4>
							<div>
								{#if milestones.length > 0}
									{#if !percentageValid}
										<span class="text-sm text-error">{totalPercentage.toFixed(1)}% (must be 100%)</span>
									{:else}
										<span class="text-sm text-success">100%</span>
									{/if}
								{/if}
							</div>
						</div>

						<!-- Template Selector -->
						{#if loadingTemplates}
							<div class="flex items-center gap-2">
								<span class="loading loading-spinner loading-xs"></span>
								<span class="text-sm opacity-60">Loading templates...</span>
							</div>
						{:else if templates.length > 0}
							<div class="flex flex-wrap gap-2">
								{#each templates as template (template.id)}
									<button
										type="button"
										class="btn btn-sm {selectedTemplateId === template.id ? 'btn-primary' : 'btn-outline'}"
										onclick={() => applyTemplate(template.id)}
									>
										{template.name}
									</button>
								{/each}
								<button
									type="button"
									class="btn btn-sm {selectedTemplateId === null && milestones.length > 0 ? 'btn-primary' : 'btn-outline'}"
									onclick={() => applyTemplate(null)}
								>
									Custom
								</button>
							</div>
						{/if}

						<!-- Milestone Rows -->
						{#if milestones.length > 0}
							<div class="space-y-3">
								{#each milestones as milestone, i}
									<div class="border border-base-300 rounded-lg p-3 space-y-2">
										<div class="flex items-center justify-between">
											<span class="text-xs font-bold opacity-50">Milestone {i + 1}</span>
											<div class="flex items-center gap-2">
												{#if totalAmount}
													<span class="text-xs font-mono opacity-50">{formatDollars(computedAmounts[i])}</span>
												{/if}
												{#if milestones.length > 1}
													<button
														type="button"
														class="btn btn-ghost btn-xs text-error"
														onclick={() => removeMilestone(i)}
													>
														<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
														</svg>
													</button>
												{/if}
											</div>
										</div>

										<div class="grid grid-cols-4 gap-2">
											<label class="floating-label col-span-3">
												<span>Name</span>
												<input
													type="text"
													class="input input-bordered input-sm w-full"
													bind:value={milestone.name}
													placeholder="Name"
												/>
											</label>
											<div class="join w-full">
												<input
													type="number"
													class="input input-bordered input-sm join-item w-full"
													bind:value={milestone.percentage}
													step="0.01"
													min="0"
													max="100"
													placeholder="%"
												/>
												<span class="join-item btn btn-sm btn-disabled">%</span>
											</div>
										</div>

										<label class="floating-label">
											<span>Description</span>
											<input
												type="text"
												class="input input-bordered input-sm w-full"
												bind:value={milestone.description}
												placeholder="Description"
											/>
										</label>

										<label class="floating-label">
											<span>Acceptance criteria</span>
											<input
												type="text"
												class="input input-bordered input-sm w-full"
												bind:value={milestone.acceptance_criteria}
												placeholder="Acceptance criteria"
											/>
										</label>

										<!-- Linked Tasks -->
										<div class="flex flex-wrap items-center gap-1.5 mt-1">
											{#if milestone.taskIds.length > 0}
												{#each milestone.taskIds as taskId}
													{@const task = projectTasks.find(t => t.id === taskId)}
													{#if task}
														<span class="badge badge-sm badge-outline gap-1">
															<span class="opacity-60">{task.issue_type}</span>
															<span class="max-w-[140px] truncate">{task.title}</span>
															<button
																type="button"
																class="ml-0.5 opacity-50 hover:opacity-100"
																onclick={() => toggleTaskLink(i, taskId)}
															>
																<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
																</svg>
															</button>
														</span>
													{/if}
												{/each}
											{/if}
											<button
												type="button"
												class="btn btn-ghost btn-xs gap-1 opacity-60 hover:opacity-100"
												onclick={() => openTaskPicker(i)}
												disabled={loadingTasks}
											>
												<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
												</svg>
												{milestone.taskIds.length > 0 ? 'Link more tasks' : 'Link tasks'}
											</button>
										</div>
									</div>
								{/each}
							</div>

							<button type="button" class="btn btn-outline btn-sm" onclick={addMilestone}>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
								</svg>
								Add Milestone
							</button>
						{/if}
					</div>

					<!-- Actions -->
					<div class="modal-action">
						<button class="btn btn-ghost" onclick={() => showCreateModal = false}>
							Cancel
						</button>
						<button
							class="btn btn-primary"
							onclick={createContract}
							disabled={creating || !percentageValid || !totalAmount || milestones.length === 0 || !selectedProject}
						>
							{#if creating}
								<span class="loading loading-spinner loading-sm"></span>
							{/if}
							Create Contract
						</button>
					</div>
				{/if}
			{/if}
		</div>
		<label class="modal-backdrop" onclick={() => showCreateModal = false} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showCreateModal = false; } }}></label>
	</div>
{/if}

<!-- Task Picker Modal -->
{#if taskPickerMilestoneIndex !== null}
	<div class="modal modal-open">
		<div class="modal-box max-w-lg">
			<h3 class="font-bold text-lg mb-3">
				Link Tasks to Milestone {taskPickerMilestoneIndex + 1}
				{#if milestones[taskPickerMilestoneIndex]?.name}
					<span class="text-sm font-normal opacity-60">— {milestones[taskPickerMilestoneIndex].name}</span>
				{/if}
			</h3>

			<p class="text-xs opacity-50 mb-3">
				When all linked tasks are completed or accepted, this milestone will be auto-delivered and invoiced.
			</p>

			<!-- Search -->
			<div class="form-control mb-3">
				<input
					type="text"
					class="input input-bordered input-sm"
					placeholder="Search tasks..."
					bind:value={taskSearchTerm}
				/>
			</div>

			{#if loadingTasks}
				<div class="flex items-center justify-center py-8">
					<span class="loading loading-spinner loading-md"></span>
				</div>
			{:else if projectTasks.length === 0}
				<div class="text-center py-8 opacity-50">
					<p>No tasks found in this project.</p>
					<p class="text-xs mt-1">Tasks are created via the feedback widget or admin panel.</p>
				</div>
			{:else}
				<div class="max-h-72 overflow-y-auto space-y-1">
					{#each filteredTasks as task (task.id)}
						{@const isLinked = milestones[taskPickerMilestoneIndex]?.taskIds.includes(task.id)}
						{@const isLinkedElsewhere = !isLinked && milestones.some((m, idx) => idx !== taskPickerMilestoneIndex && m.taskIds.includes(task.id))}
						<button
							type="button"
							class="w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors
								{isLinked ? 'bg-primary/10 border border-primary/30' : isLinkedElsewhere ? 'opacity-40 cursor-not-allowed' : 'hover:bg-base-200'}"
							onclick={() => {
								if (!isLinkedElsewhere && taskPickerMilestoneIndex !== null) {
									toggleTaskLink(taskPickerMilestoneIndex, task.id);
								}
							}}
							disabled={isLinkedElsewhere}
						>
							<!-- Checkbox indicator -->
							<div class="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
								{isLinked ? 'bg-primary border-primary' : 'border-base-300'}">
								{#if isLinked}
									<svg class="w-3 h-3 text-primary-content" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
									</svg>
								{/if}
							</div>

							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-1.5">
									<span class="badge badge-xs badge-ghost">{task.issue_type}</span>
									<span class="badge badge-xs {task.status === 'completed' || task.status === 'accepted' ? 'badge-success' : task.status === 'in_progress' ? 'badge-warning' : 'badge-ghost'}">{task.status}</span>
									{#if task.priority}
										<span class="badge badge-xs badge-outline">{task.priority}</span>
									{/if}
								</div>
								<p class="text-sm truncate mt-0.5">{task.title}</p>
							</div>

							{#if isLinkedElsewhere}
								<span class="text-xs opacity-50 flex-shrink-0">linked elsewhere</span>
							{/if}
						</button>
					{/each}
				</div>

				{#if filteredTasks.length === 0 && taskSearchTerm}
					<p class="text-center py-4 opacity-50 text-sm">No tasks match "{taskSearchTerm}"</p>
				{/if}
			{/if}

			<div class="modal-action">
				<span class="text-xs opacity-50 mr-auto">
					{milestones[taskPickerMilestoneIndex]?.taskIds.length || 0} task{milestones[taskPickerMilestoneIndex]?.taskIds.length === 1 ? '' : 's'} linked
				</span>
				<button class="btn btn-sm btn-primary" onclick={closeTaskPicker}>Done</button>
			</div>
		</div>
		<label class="modal-backdrop" onclick={closeTaskPicker} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeTaskPicker(); } }}></label>
	</div>
{/if}
