<script lang="ts">
	import { onMount } from 'svelte';

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

	let projects = $state<ProjectData[]>([]);
	let summary = $state<Summary | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let cachedAt = $state<string | null>(null);

	// Expanded project cards
	let expandedProjects = $state<Set<string>>(new Set());

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
								Contracts will appear here once created via the admin config in client apps.
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
													<tr>
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
