<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	interface LinkedTask {
		id: string;
		title: string;
		status: string;
		issue_type: string;
	}

	interface ContractComment {
		author: 'client' | 'owner';
		body: string;
		created_at: string;
	}

	interface Milestone {
		id: string;
		contract_id: string;
		name: string;
		description: string | null;
		percentage: number;
		amount: number;
		status: string;
		client_status?: string;
		sort_order: number;
		delivered_at: string | null;
		accepted_at: string | null;
		paid_at: string | null;
		stripe_invoice_id: string | null;
		comments?: ContractComment[];
		created_at: string;
		updated_at: string;
		linked_tasks?: LinkedTask[];
	}

	interface ContractTerm {
		id: string;
		contract_id: string;
		title: string;
		body: string;
		sort_order: number;
		status: string;
		client_notes: string | null;
		comments?: ContractComment[];
		accepted_at: string | null;
		signature_data: string | null;
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
		terms?: ContractTerm[];
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

	interface TermRow {
		title: string;
		body: string;
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
	let saveError = $state<string | null>(null); // inline error from failed operations
	let savedItemId = $state<string | null>(null); // id of last successfully saved item (for flash)
	let savedTimer: ReturnType<typeof setTimeout> | null = null;

	function flashSaved(id: string) {
		savedItemId = id;
		if (savedTimer) clearTimeout(savedTimer);
		savedTimer = setTimeout(() => { savedItemId = null; }, 1400);
	}

	function toggleContract(contractId: string) {
		expandedContract = expandedContract === contractId ? null : contractId;
	}

	const CONTRACT_STATUSES = ['draft', 'published', 'signed', 'active', 'completed', 'cancelled'] as const;
	const MILESTONE_STATUSES = ['pending', 'delivered', 'accepted', 'paid'] as const;

	async function updateStatus(projectKey: string, type: 'contract' | 'milestone' | 'term', id: string, status: string) {
		updatingItem = id;
		try {
			const res = await fetch('/api/clients', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ projectKey, type, id, updates: { status } })
			});
			if (!res.ok) {
				const data = await res.json();
				saveError = data.error || 'Update failed. Please try again.';
				return;
			}
			saveError = null;
			if (type === 'term' && status === 'accepted') {
				const next = new Set(collapsedTerms);
				next.add(id);
				collapsedTerms = next;
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

	// Terms state
	let contractTerms = $state<TermRow[]>([]);

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
			initCollapsedTerms(projects);
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
			case 'published': return 'badge-info';
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
		contractTerms = [];
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
					milestones,
					terms: contractTerms.filter(t => t.title.trim())
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

	// Editable check: draft or sent = editable, signed/active/completed/cancelled = locked
	function isContractEditable(status: string): boolean {
		return status === 'draft' || status === 'published';
	}

	// Add milestone inline form state
	let addingMilestoneContractId = $state<string | null>(null);
	let newMilestoneName = $state('');
	let newMilestonePct = $state('');
	let newMilestoneDesc = $state('');
	let savingNewMilestone = $state(false);

	async function createMilestone(projectKey: string, contractId: string, totalAmount: number) {
		const name = newMilestoneName.trim();
		const pct = parseFloat(newMilestonePct);
		if (!name || isNaN(pct) || pct <= 0 || pct > 100) return;
		savingNewMilestone = true;
		try {
			const res = await fetch('/api/clients', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'addMilestone',
					projectKey,
					contractId,
					name,
					percentage: pct,
					description: newMilestoneDesc.trim() || undefined
				})
			});
			const data = await res.json();
			if (data.error) { console.error(data.error); return; }
			addingMilestoneContractId = null;
			newMilestoneName = '';
			newMilestonePct = '';
			newMilestoneDesc = '';
			await fetchData(true);
		} finally {
			savingNewMilestone = false;
		}
	}

	// Inline editing state
	let editingItemId = $state<string | null>(null);
	let editingField = $state<string | null>(null);
	let editingValue = $state('');
	let editingValue2 = $state(''); // for second field (e.g., body, description)
	let editingValue3 = $state(''); // for third field (e.g., percentage)

	function startEditing(id: string, field: string, currentValue: string, currentValue2 = '', currentValue3 = '') {
		editingItemId = id;
		editingField = field;
		editingValue = currentValue;
		editingValue2 = currentValue2;
		editingValue3 = currentValue3;
	}

	function cancelEditing() {
		editingItemId = null;
		editingField = null;
		editingValue = '';
		editingValue2 = '';
		editingValue3 = '';
	}

	async function saveEdit(projectKey: string, type: 'milestone' | 'term' | 'contract', id: string, updates: Record<string, unknown>) {
		updatingItem = id;
		try {
			const res = await fetch('/api/clients', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ projectKey, type, id, updates })
			});
			if (!res.ok) {
				const data = await res.json();
				saveError = data.error || 'Save failed. Please try again.';
				return;
			}
			saveError = null;
			flashSaved(id);
			cancelEditing();
			await fetchData(true);
		} finally {
			updatingItem = null;
		}
	}

	async function deleteItem(projectKey: string, type: 'milestone' | 'term', id: string) {
		updatingItem = id;
		try {
			const res = await fetch(`/api/clients?projectKey=${encodeURIComponent(projectKey)}&type=${type}&id=${id}`, {
				method: 'DELETE'
			});
			if (!res.ok) {
				const data = await res.json();
				saveError = data.error || 'Delete failed. Please try again.';
				return;
			}
			saveError = null;
			await fetchData(true);
		} finally {
			updatingItem = null;
		}
	}

	// Inline task linking for existing milestones
	let linkingTasksMilestoneId = $state<string | null>(null);
	let linkingTasksProjectKey = $state<string>('');
	let linkTaskSearch = $state('');
	let linkingTask = $state(false);

	let linkFilteredTasks = $derived.by(() => {
		if (!linkTaskSearch) return projectTasks;
		const s = linkTaskSearch.toLowerCase();
		return projectTasks.filter(t =>
			t.title.toLowerCase().includes(s) ||
			t.id.toLowerCase().includes(s)
		);
	});

	function startLinkingTasks(milestoneId: string, projectKey: string) {
		linkingTasksMilestoneId = milestoneId;
		linkingTasksProjectKey = projectKey;
		linkTaskSearch = '';
		// Always fetch fresh tasks for the project
		fetchProjectTasks(projectKey);
	}

	function stopLinkingTasks() {
		linkingTasksMilestoneId = null;
		linkingTasksProjectKey = '';
		linkTaskSearch = '';
	}

	async function linkTask(milestoneId: string, taskId: string) {
		linkingTask = true;
		try {
			const res = await fetch('/api/clients', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'linkTask', projectKey: linkingTasksProjectKey, milestoneId, taskId })
			});
			if (!res.ok) {
				const data = await res.json();
				saveError = data.error || 'Failed to link task.';
				return;
			}
			saveError = null;
			await fetchData(true);
		} finally {
			linkingTask = false;
		}
	}

	async function unlinkTask(projectKey: string, milestoneId: string, taskId: string) {
		linkingTask = true;
		try {
			const res = await fetch('/api/clients', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'unlinkTask', projectKey, milestoneId, taskId })
			});
			if (!res.ok) {
				const data = await res.json();
				saveError = data.error || 'Failed to unlink task.';
				return;
			}
			saveError = null;
			await fetchData(true);
		} finally {
			linkingTask = false;
		}
	}

	// Auto-grow textarea action — resizes on mount and on input
	function autogrow(node: HTMLTextAreaElement) {
		function resize() {
			node.style.height = 'auto';
			node.style.height = Math.min(node.scrollHeight, window.innerHeight * 0.3) + 'px';
		}
		// Run after the browser has laid out the content
		requestAnimationFrame(resize);
		node.addEventListener('input', resize);
		return { destroy() { node.removeEventListener('input', resize); } };
	}

	// Collapsed terms — accepted terms collapse by default, expandable on click
	let collapsedTerms = $state<Set<string>>(new Set());
	// Collapsed terms sections — the entire Terms section per contract, collapsed by default
	let collapsedTermsSections = $state<Set<string>>(new Set());
	// Collapsed milestones sections — the entire Milestones section per contract, collapsed by default
	let collapsedMilestonesSections = $state<Set<string>>(new Set());

	function initCollapsedTerms(projects: any[]) {
		// Add any IDs not yet tracked — preserves user toggles while collapsing new items
		const newTermIds = new Set(collapsedTerms);
		const newSectionIds = new Set(collapsedTermsSections);
		let changed = false;
		for (const project of projects) {
			for (const contract of (project.contracts ?? [])) {
				if (!newSectionIds.has(contract.id)) { newSectionIds.add(contract.id); changed = true; }
				if (!collapsedMilestonesSections.has(contract.id)) { collapsedMilestonesSections = new Set([...collapsedMilestonesSections, contract.id]); }
				for (const term of (contract.terms ?? [])) {
					if (!newTermIds.has(term.id)) { newTermIds.add(term.id); changed = true; }
				}
			}
		}
		if (changed) {
			collapsedTerms = newTermIds;
			collapsedTermsSections = newSectionIds;
		}
	}

	function toggleTermCollapse(id: string) {
		const next = new Set(collapsedTerms);
		if (next.has(id)) next.delete(id); else next.add(id);
		collapsedTerms = next;
	}

	// Owner comment state
	let commentInputs = $state<Record<string, string>>({});
	let commentingId = $state<string | null>(null);
	let commentSaving = $state(false);

	function formatCommentTime(iso: string) {
		return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	async function addOwnerComment(projectKey: string, type: 'milestone' | 'term', id: string, existingComments: ContractComment[]) {
		const body = (commentInputs[id] || '').trim();
		if (!body) return;
		commentSaving = true;
		try {
			const newComment: ContractComment = { author: 'owner', body, created_at: new Date().toISOString() };
			const updated = [...existingComments, newComment];
			const res = await fetch('/api/clients', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ projectKey, type, id, updates: { comments: updated } })
			});
			if (!res.ok) {
				const data = await res.json();
				saveError = data.error || 'Failed to add comment.';
				return;
			}
			saveError = null;
			commentInputs[id] = '';
			commentingId = null;
			await fetchData(true);
		} finally {
			commentSaving = false;
		}
	}

	// Inline add-term state for existing contracts
	let addingTermToContract = $state<string | null>(null); // contract ID
	let addingTermProject = $state<string>('');
	let newTermTitle = $state('');
	let newTermBody = $state('');
	let savingTerm = $state(false);

	function startAddingTerm(contractId: string, projectKey: string) {
		addingTermToContract = contractId;
		addingTermProject = projectKey;
		newTermTitle = '';
		newTermBody = '';
	}

	function cancelAddingTerm() {
		addingTermToContract = null;
		newTermTitle = '';
		newTermBody = '';
	}

	async function saveNewTerm() {
		if (!addingTermToContract || !newTermTitle.trim()) return;
		savingTerm = true;
		try {
			const res = await fetch('/api/clients', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 'addTerms',
					projectKey: addingTermProject,
					contractId: addingTermToContract,
					terms: [{ title: newTermTitle.trim(), body: newTermBody.trim() }]
				})
			});
			if (!res.ok) {
				const data = await res.json();
				saveError = data.error || 'Failed to add term.';
				return;
			}
			saveError = null;
			cancelAddingTerm();
			await fetchData(true);
		} finally {
			savingTerm = false;
		}
	}

	onMount(() => {
		fetchData();
	});
</script>

<svelte:head>
	<title>Clients | JAT IDE</title>
</svelte:head>

<div class="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto overflow-x-hidden">
	<!-- Header -->
	<div class="flex flex-wrap items-center justify-between gap-2">
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
		<!-- Revenue Summary Strip -->
		<div in:fly={{ y: 16, duration: 500, easing: cubicOut }} class="bg-base-200 rounded-xl flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-base-300">
			<div class="flex-1 px-5 py-4">
				<p class="text-xs font-semibold uppercase tracking-wider opacity-40">Contracted</p>
				<p class="text-xl font-bold mt-1">{formatCents(summary.totalContracted)}</p>
				<p class="text-xs opacity-40 mt-0.5">{summary.activeContracts} active contract{summary.activeContracts !== 1 ? 's' : ''}</p>
			</div>
			<div class="flex-1 px-5 py-4">
				<p class="text-xs font-semibold uppercase tracking-wider opacity-40">Collected</p>
				<p class="text-xl font-bold text-success mt-1">{formatCents(summary.totalPaid)}</p>
				<p class="text-xs opacity-40 mt-0.5">{summary.paidMilestones} milestone{summary.paidMilestones !== 1 ? 's' : ''} paid</p>
			</div>
			<div class="flex-1 px-5 py-4">
				<p class="text-xs font-semibold uppercase tracking-wider opacity-40">Outstanding</p>
				<p class="text-xl font-bold text-warning mt-1">{formatCents(summary.totalOutstanding)}</p>
				<p class="text-xs opacity-40 mt-0.5">{summary.deliveredMilestones} delivered, {summary.pendingMilestones} pending</p>
			</div>
			<div class="flex-1 px-5 py-4">
				<p class="text-xs font-semibold uppercase tracking-wider opacity-40">Pipeline</p>
				<p class="text-xl font-bold mt-1">{summary.totalMilestones} <span class="text-sm font-normal opacity-40">milestones</span></p>
				<div class="flex gap-1.5 mt-1.5 flex-wrap">
					{#if summary.paidMilestones > 0}
						<span class="badge badge-success badge-xs">{summary.paidMilestones} paid</span>
					{/if}
					{#if summary.deliveredMilestones > 0}
						<span class="badge badge-info badge-xs">{summary.deliveredMilestones} delivered</span>
					{/if}
					{#if summary.pendingMilestones > 0}
						<span class="badge badge-warning badge-xs">{summary.pendingMilestones} pending</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- Two-column layout: Projects + Pipeline -->
		<div in:fly={{ y: 20, duration: 500, delay: 120, easing: cubicOut }} class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Left: Projects with Contracts -->
			<div class="lg:col-span-2 flex flex-col gap-4">
				<h2 class="text-sm font-semibold uppercase tracking-wider opacity-50">Client Projects</h2>

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

				{#each projectsWithContracts as project, pi}
					<div in:fly={{ y: 12, duration: 380, delay: pi * 60, easing: cubicOut }} class="card bg-base-200 shadow-sm">
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
								<div transition:slide={{ duration: 220, easing: cubicOut }} class="mt-4">
									<div class="overflow-x-auto">
										<table class="table table-sm">
											<thead>
												<tr>
													<th>Contract</th>
													<th>Status</th>
													<th class="text-right">Amount</th>
													<th class="text-right hidden md:table-cell">Paid</th>
													<th class="hidden md:table-cell">Signed</th>
													<th class="hidden sm:table-cell">
											Milestones
											<div class="flex gap-1.5 mt-0.5 font-normal">
												<span class="flex items-center gap-0.5 text-[10px] opacity-40"><span class="w-1.5 h-1.5 rounded-full bg-success inline-block"></span>paid</span>
												<span class="flex items-center gap-0.5 text-[10px] opacity-40"><span class="w-1.5 h-1.5 rounded-full bg-info inline-block"></span>del</span>
												<span class="flex items-center gap-0.5 text-[10px] opacity-40"><span class="w-1.5 h-1.5 rounded-full bg-warning inline-block"></span>pend</span>
											</div>
										</th>
												<th class="hidden lg:table-cell">Terms</th>
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
														<td class="text-right font-mono text-success hidden md:table-cell">
															{paid > 0 ? formatCents(paid, contract.currency) : '—'}
														</td>
														<td class="text-sm opacity-60 hidden md:table-cell">{formatDate(contract.signed_at)}</td>
														<td class="hidden sm:table-cell">
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
														<td class="hidden lg:table-cell">
															{#if contract.terms && contract.terms.length > 0}
																{@const acceptedCount = contract.terms.filter(t => t.status === 'accepted').length}
																<span class="text-xs opacity-60">
																	{acceptedCount}/{contract.terms.length}
																</span>
															{:else}
																<span class="text-xs opacity-30">—</span>
															{/if}
														</td>
													</tr>

													<!-- Expanded Contract Detail -->
													{#if expandedContract === contract.id}
														{@const editable = isContractEditable(contract.status)}
														<tr>
															<td colspan="7" class="p-0 overflow-visible">
																<div transition:fly={{ y: -8, duration: 260, easing: cubicOut }} class="bg-base-300/30 p-4 space-y-4 border-t border-base-300 overflow-visible">
																	{#if saveError}
																		<div transition:fly={{ y: -8, duration: 200, easing: cubicOut }} class="flex items-center justify-between gap-2 px-3 py-2 bg-error/10 border border-error/30 rounded-lg text-xs text-error" role="alert">
																			<span>{saveError}</span>
																			<button class="btn btn-ghost btn-xs p-0 h-auto min-h-0 text-error opacity-60 hover:opacity-100" onclick={() => saveError = null} aria-label="Dismiss">✕</button>
																		</div>
																	{/if}
																	{#if !editable}
																		<div class="flex items-center gap-2 text-xs opacity-50">
																			<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
																			</svg>
																			Contract is {contract.status} — milestones and terms are locked
																		</div>
																	{/if}
																	<!-- Contract Info & Actions -->
																	<div class="flex items-start justify-between gap-4">
																		<div class="space-y-1 flex-1 min-w-0">
																			{#if editingItemId === contract.id && editingField === "title"}
																				<input type="text" class="input input-sm w-full bg-base-200 border-base-content/20 text-base-content" bind:value={editingValue} onkeydown={(e) => { if (e.key === "Enter") saveEdit(project.projectKey, "contract", contract.id, { title: editingValue }); if (e.key === "Escape") cancelEditing(); }} onclick={(e) => e.stopPropagation()} />
																			{:else}
																				<span class="font-semibold inline-flex items-center gap-1 {editable ? "cursor-pointer hover:text-primary" : ""}" onclick={(e) => { if (editable) { e.stopPropagation(); startEditing(contract.id, "title", contract.title); } }}>
																					{contract.title}
																					{#if editable}<svg class="w-3 h-3 opacity-20 hover:opacity-60 transition-opacity shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>{/if}
																				</span>
																			{/if}
																			{#if editingItemId === contract.id && editingField === "notes"}
																				<textarea class="textarea w-full text-sm bg-base-200 border-base-content/20 text-base-content" rows="2" bind:value={editingValue} onkeydown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(project.projectKey, "contract", contract.id, { notes: editingValue || null }); } if (e.key === "Escape") cancelEditing(); }} onclick={(e) => e.stopPropagation()}></textarea>
																			{:else}
																				<span class="text-sm opacity-60 inline-flex items-center gap-1 {editable ? "cursor-pointer hover:text-primary" : ""}" onclick={(e) => { if (editable) { e.stopPropagation(); startEditing(contract.id, "notes", contract.notes || ""); } }}>
																					{contract.notes || (editable ? "Add notes..." : "")}
																					{#if editable}<svg class="w-3 h-3 opacity-20 hover:opacity-60 transition-opacity shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>{/if}
																				</span>
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
																					class="badge badge-sm {statusBadgeClass(contract.status)} cursor-pointer gap-1 md:min-h-0 min-h-[28px]"
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
																		{@const milestonesSectionCollapsed = collapsedMilestonesSections.has(contract.id)}
																		<div>
																			<button
																				class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-40 hover:opacity-70 transition-opacity mb-2 w-full text-left"
																				onclick={() => { const next = new Set(collapsedMilestonesSections); if (milestonesSectionCollapsed) next.delete(contract.id); else next.add(contract.id); collapsedMilestonesSections = next; }}
																			>
																				<svg class="w-3 h-3 transition-transform duration-200 {milestonesSectionCollapsed ? '' : 'rotate-90'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
																				Milestones
																				<span class="font-normal normal-case tracking-normal opacity-60">({contract.milestones.length})</span>
																			</button>
																			{#if !milestonesSectionCollapsed}
																			<!-- Mobile: Card layout -->
																			<div class="md:hidden space-y-2">
																				{#each contract.milestones as milestone, mi}
																					{#if editable && editingItemId === milestone.id}
																						<div transition:fly={{ y: -4, duration: 200, easing: cubicOut }} class="p-4 bg-primary/5 border-l-2 border-primary/40 space-y-3 rounded-lg" onclick={(e) => e.stopPropagation()}>
																							<p class="text-xs font-medium opacity-50 mb-1">Edit milestone</p>
																							<input type="text" class="input input-sm w-full bg-base-200 border-base-content/20" bind:value={editingValue} placeholder="Milestone name" onkeydown={(e) => { if (e.key === 'Escape') cancelEditing(); }} />
																							<textarea class="textarea w-full text-sm bg-base-200 border-base-content/20 resize-none" style="min-height: 5rem; max-height: 30vh; overflow-y: auto;" use:autogrow bind:value={editingValue2} placeholder="Description (optional)" onkeydown={(e) => { if (e.key === 'Escape') cancelEditing(); }}></textarea>
																							<div class="flex items-center gap-3">
																								<span class="text-xs opacity-50 whitespace-nowrap">Percentage</span>
																								<div class="flex items-center gap-2">
																									<input type="number" class="input input-sm w-24 bg-base-200 border-base-content/20" bind:value={editingValue3} placeholder={milestone.percentage.toString()} min="0" max="100" step="0.01" onkeydown={(e) => { if (e.key === 'Escape') cancelEditing(); }} />
																									<span class="text-xs opacity-40">%</span>
																									{#if editingValue3 && !isNaN(parseFloat(editingValue3)) && contract.total_amount}
																										<span class="text-xs opacity-60">${((parseFloat(editingValue3) / 100) * (contract.total_amount / 100)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
																									{/if}
																								</div>
																							</div>
																							<div class="flex gap-2">
																								<button class="btn btn-success btn-xs" onclick={() => {
																									const updates: Record<string, unknown> = { name: editingValue, description: editingValue2 };
																									const pct = parseFloat(editingValue3);
																									if (editingValue3 && !isNaN(pct) && pct > 0 && pct <= 100 && contract.total_amount) { updates.percentage = pct; updates.amount = Math.round((pct / 100) * contract.total_amount); }
																									saveEdit(project.projectKey, 'milestone', milestone.id, updates);
																								}}>Save</button>
																								<button class="btn btn-ghost btn-xs" onclick={() => cancelEditing()}>Cancel</button>
																							</div>
																						</div>
																					{:else}
																						<div class="rounded-lg border border-base-300/50 p-3 space-y-2 {savedItemId === milestone.id ? 'bg-success/5' : 'bg-base-100/50'}">
																							<div class="flex items-start gap-2">
																								<span class="text-xs opacity-40 mt-0.5 shrink-0">{mi + 1}.</span>
																								<div class="min-w-0 flex-1 {editable ? 'cursor-pointer' : ''}" onclick={(e) => { if (editable) { e.stopPropagation(); startEditing(milestone.id, 'milestone', milestone.name, milestone.description || '', milestone.percentage.toString()); } }} role={editable ? 'button' : undefined} tabindex={editable ? 0 : undefined} onkeydown={(e) => { if (editable && (e.key === 'Enter' || e.key === ' ')) { e.stopPropagation(); startEditing(milestone.id, 'milestone', milestone.name, milestone.description || '', milestone.percentage.toString()); } }}>
																									<span class="font-medium text-sm">{milestone.name}</span>
																									{#if milestone.description}<p class="text-xs opacity-50 mt-0.5">{milestone.description}</p>{/if}
																								</div>
																								<div class="dropdown dropdown-end dropdown-top shrink-0">
																									<div tabindex="0" role="button" class="badge badge-sm {statusBadgeClass(milestone.status)} cursor-pointer gap-1 min-h-[28px] min-w-[72px] justify-center" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
																										{milestone.status}
																										{#if updatingItem === milestone.id}<span class="loading loading-spinner" style="width:10px;height:10px"></span>{:else}<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>{/if}
																									</div>
																									<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
																									<ul tabindex="0" class="dropdown-content z-50 menu menu-sm shadow-lg bg-base-100 rounded-box w-40 p-1">
																										{#each MILESTONE_STATUSES as s}<li><button class:active={milestone.status === s} onclick={(e) => { e.stopPropagation(); updateStatus(project.projectKey, 'milestone', milestone.id, s); }} disabled={milestone.status === s}><span class="badge badge-xs {statusBadgeClass(s)}"></span>{s}</button></li>{/each}
																									</ul>
																								</div>
																							</div>
																							<div class="flex items-center gap-3 text-xs pl-5">
																								<span class="font-mono">{formatCents(milestone.amount, contract.currency)}</span>
																								<span class="font-mono opacity-50">({milestone.percentage}%)</span>
																								<span class="opacity-40 ml-auto">
																									{#if milestone.paid_at}Paid {formatDate(milestone.paid_at)}{:else if milestone.accepted_at}Accepted {formatDate(milestone.accepted_at)}{:else if milestone.delivered_at}Delivered {formatDate(milestone.delivered_at)}{:else}—{/if}
																								</span>
																								{#if editable}<button class="btn btn-ghost btn-xs text-error opacity-40 hover:opacity-100 p-1" onclick={(e) => { e.stopPropagation(); deleteItem(project.projectKey, 'milestone', milestone.id); }} title="Delete milestone"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>{/if}
																							</div>
																							{#if (milestone.linked_tasks && milestone.linked_tasks.length > 0) || editable}
																								<div class="flex flex-wrap gap-1 items-center pl-5">
																									{#each (milestone.linked_tasks || []) as task}
																										<span class="badge badge-xs badge-outline gap-1 opacity-50" title="{task.title} ({task.status})">
																											<span class="w-1.5 h-1.5 rounded-full {task.status === 'completed' || task.status === 'accepted' ? 'bg-success' : task.status === 'in_progress' ? 'bg-warning' : 'bg-base-300'}"></span>
																											<span class="max-w-[100px] truncate">{task.title}</span>
																											{#if editable}<button class="ml-0.5 opacity-40 hover:opacity-100 hover:text-error" onclick={(e) => { e.stopPropagation(); unlinkTask(project.projectKey, milestone.id, task.id); }} title="Remove task link">×</button>{/if}
																										</span>
																									{/each}
																									{#if editable}<button class="badge badge-xs badge-ghost gap-0.5 opacity-50 hover:opacity-100" onclick={(e) => { e.stopPropagation(); startLinkingTasks(milestone.id, project.projectKey); }}><svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Link</button>{/if}
																								</div>
																								{#if linkingTasksMilestoneId === milestone.id}
																									<div class="ml-5 border border-base-300 rounded-lg p-2 bg-base-100 max-h-48 overflow-y-auto" onclick={(e) => e.stopPropagation()}>
																										<div class="flex items-center gap-2 mb-2">
																											<input type="text" class="input input-sm flex-1 bg-base-200 border-base-content/20" placeholder="Search tasks..." bind:value={linkTaskSearch} />
																											<button class="btn btn-ghost btn-xs" onclick={() => stopLinkingTasks()}>Done</button>
																										</div>
																										{#if loadingTasks}<span class="loading loading-spinner loading-xs"></span>
																										{:else if linkFilteredTasks.length === 0}<p class="text-xs opacity-40">No tasks found</p>
																										{:else}
																											{#each linkFilteredTasks.slice(0, 15) as task}
																												{@const alreadyLinked = (milestone.linked_tasks || []).some((lt) => lt.id === task.id)}
																												<button class="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded text-xs hover:bg-base-200 {alreadyLinked ? 'opacity-40' : ''}" onclick={() => { if (!alreadyLinked) linkTask(milestone.id, task.id); }} disabled={alreadyLinked || linkingTask}>
																													<span class="w-1.5 h-1.5 rounded-full shrink-0 {task.status === 'completed' ? 'bg-success' : task.status === 'in_progress' ? 'bg-warning' : 'bg-base-300'}"></span>
																													<span class="truncate">{task.title}</span>
																													{#if alreadyLinked}<span class="text-[10px] opacity-50 ml-auto">linked</span>{/if}
																												</button>
																											{/each}
																										{/if}
																									</div>
																								{/if}
																							{/if}
																							{#if milestone.comments && milestone.comments.length > 0}
																								<div class="space-y-1.5 pl-5">
																									{#each milestone.comments as c}
																										<div class="flex gap-2 items-start {c.author === 'owner' ? 'flex-row-reverse' : ''}">
																											<div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 {c.author === 'owner' ? 'bg-primary/15 text-primary' : 'bg-base-300 text-base-content/50'}"><svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></div>
																											<div class="max-w-[75%] rounded-2xl px-3 py-1.5 text-xs border {c.author === 'owner' ? 'bg-primary/8 border-primary/20 text-primary/90 rounded-tr-sm' : 'bg-base-200 border-base-content/10 text-base-content/70 rounded-tl-sm'}">
																												<p class="leading-relaxed">{c.body}</p>
																												<p class="opacity-40 mt-0.5 {c.author === 'owner' ? 'text-right' : ''}">{formatCommentTime(c.created_at)}</p>
																											</div>
																										</div>
																									{/each}
																								</div>
																							{/if}
																							{#if commentingId === milestone.id}
																								<div class="flex gap-2 items-start justify-end pl-5" onclick={(e) => e.stopPropagation()}>
																									<textarea class="textarea textarea-xs flex-1 bg-base-200 border-base-content/20 resize-none text-xs" rows="2" placeholder="Add owner comment..." bind:value={commentInputs[milestone.id]} onkeydown={(e) => { if (e.key === 'Escape') commentingId = null; }}></textarea>
																									<div class="flex flex-col gap-1">
																										<button class="btn btn-primary btn-xs" onclick={() => addOwnerComment(project.projectKey, 'milestone', milestone.id, milestone.comments || [])} disabled={!(commentInputs[milestone.id] || '').trim() || commentSaving}>{#if commentSaving}<span class="loading loading-spinner loading-xs"></span>{:else}Send{/if}</button>
																										<button class="btn btn-ghost btn-xs" onclick={() => commentingId = null}>Cancel</button>
																									</div>
																								</div>
																							{:else}
																								<button class="text-[10px] opacity-30 hover:opacity-60 transition-opacity flex items-center gap-1 pl-5" onclick={(e) => { e.stopPropagation(); commentingId = milestone.id; }}>
																									<svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
																									Reply
																								</button>
																							{/if}
																						</div>
																					{/if}
																				{/each}
																			</div>
																			<!-- Desktop: Table layout -->
																			<div class="overflow-visible hidden md:block">
																				<table class="table table-xs">
																					<thead>
																						<tr>
																							<th class="w-8">#</th>
																							<th>Name</th>
																							<th>Status</th>
																							<th class="text-right">%</th>
																							<th class="text-right">Amount</th>
																							<th>Date</th>
																							{#if editable}<th class="w-8"></th>{/if}
																						</tr>
																					</thead>
																					<tbody>
																						{#each contract.milestones as milestone, mi}
																							{#if editable && editingItemId === milestone.id}
																								<tr>
																									<td colspan={editable ? 7 : 6} class="p-0">
																										<div transition:fly={{ y: -4, duration: 200, easing: cubicOut }} class="p-4 bg-primary/5 border-l-2 border-primary/40 space-y-3" onclick={(e) => e.stopPropagation()}>
																											<p class="text-xs font-medium opacity-50 mb-1">Edit milestone</p>
																											<input
																												type="text"
																												class="input input-sm w-full bg-base-200 border-base-content/20"
																												bind:value={editingValue}
																												placeholder="Milestone name"
																												onkeydown={(e) => { if (e.key === 'Escape') cancelEditing(); }}
																											/>
																											<textarea
																												class="textarea w-full text-sm bg-base-200 border-base-content/20 resize-none"
																												style="min-height: 5rem; max-height: 30vh; overflow-y: auto;"
																												use:autogrow
																												bind:value={editingValue2}
																												placeholder="Description (optional)"
																												onkeydown={(e) => { if (e.key === 'Escape') cancelEditing(); }}
																											></textarea>
																											<div class="flex items-center gap-3">
																												<span class="text-xs opacity-50 whitespace-nowrap">Percentage</span>
																												<div class="flex items-center gap-2">
																													<input
																														type="number"
																														class="input input-sm w-24 bg-base-200 border-base-content/20"
																														bind:value={editingValue3}
																														placeholder={milestone.percentage.toString()}
																														min="0"
																														max="100"
																														step="0.01"
																														onkeydown={(e) => { if (e.key === 'Escape') cancelEditing(); }}
																													/>
																												<span class="text-xs opacity-40">%</span>
																												{#if editingValue3 && !isNaN(parseFloat(editingValue3)) && contract.total_amount}
																													<span class="text-xs opacity-60">${((parseFloat(editingValue3) / 100) * (contract.total_amount / 100)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
																												{/if}
																												</div>
																											</div>
																											<div class="flex gap-2">
																												<button class="btn btn-success btn-xs" onclick={() => {
																													const updates: Record<string, unknown> = { name: editingValue, description: editingValue2 };
																													const pct = parseFloat(editingValue3);
																													if (editingValue3 && !isNaN(pct) && pct > 0 && pct <= 100 && contract.total_amount) {
																														updates.percentage = pct;
																														updates.amount = Math.round((pct / 100) * contract.total_amount);
																													}
																													saveEdit(project.projectKey, 'milestone', milestone.id, updates);
																												}}>Save</button>
																												<button class="btn btn-ghost btn-xs" onclick={() => cancelEditing()}>Cancel</button>
																											</div>
																										</div>
																									</td>
																								</tr>
																							{:else}
																							<tr class="hover:bg-base-300/30 transition-colors duration-500 {savedItemId === milestone.id ? 'bg-success/5' : ''}">
																								<td class="opacity-40">{mi + 1}</td>
																								<td>
																										<div
																											class={editable ? 'cursor-pointer hover:bg-base-300/50 rounded px-1 -mx-1 flex items-start gap-1' : ''}
																											onclick={(e) => { if (editable) { e.stopPropagation(); startEditing(milestone.id, 'milestone', milestone.name, milestone.description || '', milestone.percentage.toString()); } }}
																											role={editable ? 'button' : undefined}
																											tabindex={editable ? 0 : undefined}
																											onkeydown={(e) => { if (editable && (e.key === 'Enter' || e.key === ' ')) { e.stopPropagation(); startEditing(milestone.id, 'milestone', milestone.name, milestone.description || '', milestone.percentage.toString()); } }}
																										>
																											<div class="min-w-0 flex-1">
																												<span class="font-medium">{milestone.name}</span>
																												{#if milestone.description}
																													<p class="text-xs opacity-50 mt-0.5">{milestone.description}</p>
																												{/if}
																											</div>
																											{#if editable}<svg class="w-3 h-3 opacity-20 hover:opacity-60 transition-opacity shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>{/if}
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
																								{#if editable}
																									<td>
																										<button
																											class="btn btn-ghost btn-xs text-error opacity-40 hover:opacity-100"
																											onclick={(e) => { e.stopPropagation(); deleteItem(project.projectKey, 'milestone', milestone.id); }}
																											title="Delete milestone"
																										>
																											<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
																											</svg>
																										</button>
																									</td>
																								{/if}
																							</tr>
																							{/if}
																							{#if (milestone.linked_tasks && milestone.linked_tasks.length > 0) || editable}
																								<tr>
																									<td></td>
																									<td colspan={editable ? 6 : 5} class="pt-1.5 pb-2">
																										<div class="flex flex-wrap gap-1 items-center">
																											{#each (milestone.linked_tasks || []) as task}
																												<span class="badge badge-xs badge-outline gap-1 opacity-50" title="{task.title} ({task.status})">
																													<span class="w-1.5 h-1.5 rounded-full {task.status === 'completed' || task.status === 'accepted' ? 'bg-success' : task.status === 'in_progress' ? 'bg-warning' : 'bg-base-300'}"></span>
																													<span class="max-w-[120px] truncate">{task.title}</span>
																													{#if editable}
																														<button
																															class="ml-0.5 opacity-40 hover:opacity-100 hover:text-error"
																															onclick={(e) => { e.stopPropagation(); unlinkTask(project.projectKey, milestone.id, task.id); }}
																															title="Remove task link"
																														>×</button>
																													{/if}
																												</span>
																											{/each}
																											{#if editable}
																												<button
																													class="badge badge-xs badge-ghost gap-0.5 opacity-50 hover:opacity-100"
																													onclick={(e) => { e.stopPropagation(); startLinkingTasks(milestone.id, project.projectKey); }}
																												>
																													<svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
																													</svg>
																													Link task
																												</button>
																											{/if}
																										</div>
																										{#if linkingTasksMilestoneId === milestone.id}
																											<div class="mt-2 border border-base-300 rounded-lg p-2 bg-base-100 max-h-48 overflow-y-auto" onclick={(e) => e.stopPropagation()}>
																												<div class="flex items-center gap-2 mb-2">
																													<input
																														type="text"
																														class="input input-sm flex-1 bg-base-200 border-base-content/20"
																														placeholder="Search tasks..."
																														bind:value={linkTaskSearch}
																													/>
																													<button class="btn btn-ghost btn-xs" onclick={() => stopLinkingTasks()}>Done</button>
																												</div>
																												{#if loadingTasks}
																													<span class="loading loading-spinner loading-xs"></span>
																												{:else if linkFilteredTasks.length === 0}
																													<p class="text-xs opacity-40">No tasks found</p>
																												{:else}
																													{#each linkFilteredTasks.slice(0, 15) as task}
																														{@const alreadyLinked = (milestone.linked_tasks || []).some((lt: {id: string}) => lt.id === task.id)}
																														<button
																															class="flex items-center gap-2 w-full text-left px-2 py-1 rounded text-xs hover:bg-base-200 {alreadyLinked ? 'opacity-40' : ''}"
																															onclick={() => { if (!alreadyLinked) linkTask(milestone.id, task.id); }}
																															disabled={alreadyLinked || linkingTask}
																														>
																															<span class="w-1.5 h-1.5 rounded-full shrink-0 {task.status === 'completed' ? 'bg-success' : task.status === 'in_progress' ? 'bg-warning' : 'bg-base-300'}"></span>
																															<span class="truncate">{task.title}</span>
																															{#if alreadyLinked}
																																<span class="text-[10px] opacity-50 ml-auto">linked</span>
																															{/if}
																														</button>
																													{/each}
																												{/if}
																											</div>
																										{/if}
																									</td>
																								</tr>
																							{/if}
																						{#if milestone.comments && milestone.comments.length > 0}
																							<tr>
																								<td></td>
																								<td colspan={editable ? 6 : 5} class="pt-1 pb-2">
																									<div class="space-y-1.5">
																										{#each milestone.comments as c}
																											<div class="flex gap-2 items-start {c.author === 'owner' ? 'flex-row-reverse' : ''}">
																												<div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 {c.author === 'owner' ? 'bg-primary/15 text-primary' : 'bg-base-300 text-base-content/50'}">
																													<svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
																												</div>
																												<div class="max-w-[75%] rounded-2xl px-3 py-1.5 text-xs border {c.author === 'owner' ? 'bg-primary/8 border-primary/20 text-primary/90 rounded-tr-sm' : 'bg-base-200 border-base-content/10 text-base-content/70 rounded-tl-sm'}">
																													<p class="leading-relaxed">{c.body}</p>
																													<p class="opacity-40 mt-0.5 {c.author === 'owner' ? 'text-right' : ''}">{formatCommentTime(c.created_at)}</p>
																												</div>
																											</div>
																										{/each}
																									</div>
																								</td>
																							</tr>
																						{/if}
																						{#if commentingId === milestone.id}
																							<tr>
																								<td></td>
																								<td colspan={editable ? 6 : 5} class="pt-1 pb-2">
																									<div class="flex gap-2 items-start justify-end" onclick={(e) => e.stopPropagation()}>
																										<textarea
																											class="textarea textarea-xs flex-1 max-w-xs bg-base-200 border-base-content/20 resize-none text-xs"
																											rows="2"
																											placeholder="Add owner comment..."
																											bind:value={commentInputs[milestone.id]}
																											onkeydown={(e) => { if (e.key === 'Escape') commentingId = null; }}
																										></textarea>
																										<div class="flex flex-col gap-1">
																											<button class="btn btn-primary btn-xs" onclick={() => addOwnerComment(project.projectKey, 'milestone', milestone.id, milestone.comments || [])} disabled={!(commentInputs[milestone.id] || '').trim() || commentSaving}>
																												{#if commentSaving}<span class="loading loading-spinner loading-xs"></span>{:else}Send{/if}
																											</button>
																											<button class="btn btn-ghost btn-xs" onclick={() => commentingId = null}>Cancel</button>
																										</div>
																									</div>
																								</td>
																							</tr>
																						{:else}
																							<tr>
																								<td></td>
																								<td colspan={editable ? 6 : 5} class="pb-1">
																									<button class="text-[10px] opacity-30 hover:opacity-60 transition-opacity flex items-center gap-1" onclick={(e) => { e.stopPropagation(); commentingId = milestone.id; }}>
																										<svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
																										Reply
																									</button>
																								</td>
																							</tr>
																						{/if}
																					{/each}
																				</tbody>
																				</table>
																			</div>
																			{/if}
																		</div>
																	{/if}

																	{#if editable}
																		{#if addingMilestoneContractId === contract.id}
																			<div transition:fly={{ y: -4, duration: 200, easing: cubicOut }} class="mt-3 p-4 bg-primary/5 border-l-2 border-primary/40 space-y-3">
																				<p class="text-xs font-medium opacity-50">New milestone</p>
																				<input type="text" class="input input-sm w-full bg-base-200 border-base-content/20" bind:value={newMilestoneName} placeholder="Milestone name" onkeydown={(e) => { if (e.key === 'Escape') { addingMilestoneContractId = null; } }} />
																				<textarea class="textarea w-full text-sm bg-base-200 border-base-content/20 resize-none" style="min-height: 4rem;" use:autogrow bind:value={newMilestoneDesc} placeholder="Description (optional)" onkeydown={(e) => { if (e.key === 'Escape') { addingMilestoneContractId = null; } }}></textarea>
																				<div class="flex items-center gap-3">
																					<span class="text-xs opacity-50 whitespace-nowrap">Percentage</span>
																					<div class="flex items-center gap-2">
																						<input type="number" class="input input-sm w-24 bg-base-200 border-base-content/20" bind:value={newMilestonePct} placeholder="0" min="0" max="100" step="0.01" onkeydown={(e) => { if (e.key === 'Escape') { addingMilestoneContractId = null; } }} />
																						<span class="text-xs opacity-40">%</span>
																						{#if newMilestonePct && !isNaN(parseFloat(newMilestonePct)) && contract.total_amount}
																							<span class="text-xs opacity-60">${((parseFloat(newMilestonePct) / 100) * (contract.total_amount / 100)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
																						{/if}
																					</div>
																				</div>
																				<div class="flex gap-2">
																					<button class="btn btn-success btn-xs" disabled={savingNewMilestone || !newMilestoneName.trim() || !newMilestonePct} onclick={() => createMilestone(project.projectKey, contract.id, contract.total_amount)}>
																						{#if savingNewMilestone}<span class="loading loading-spinner loading-xs"></span>{:else}Add{/if}
																					</button>
																					<button class="btn btn-ghost btn-xs" onclick={() => { addingMilestoneContractId = null; newMilestoneName = ''; newMilestonePct = ''; newMilestoneDesc = ''; }}>Cancel</button>
																				</div>
																			</div>
																		{:else}
																			<button class="btn btn-ghost btn-xs mt-2 opacity-50 hover:opacity-100" onclick={() => { addingMilestoneContractId = contract.id; newMilestoneName = ''; newMilestonePct = ''; newMilestoneDesc = ''; }}>
																				<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
																				Add Milestone
																			</button>
																		{/if}
																	{/if}

																	<!-- Contract Terms -->
																	<div>
																		{#if contract.terms && contract.terms.length > 0}
																			{@const termsSectionCollapsed = collapsedTermsSections.has(contract.id)}
																			<button
																				class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-40 hover:opacity-70 transition-opacity mb-2 w-full text-left"
																				onclick={() => { const next = new Set(collapsedTermsSections); if (termsSectionCollapsed) next.delete(contract.id); else next.add(contract.id); collapsedTermsSections = next; }}
																			>
																				<svg class="w-3 h-3 transition-transform duration-200 {termsSectionCollapsed ? '' : 'rotate-90'}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
																				Terms
																				<span class="font-normal normal-case tracking-normal opacity-60">({contract.terms.length})</span>
																			</button>
																			{#if !termsSectionCollapsed}
																			<div class="space-y-2">
																				{#each contract.terms as term, ti}
																					<div class="border border-base-300 rounded-lg p-3">
																						{#if editable && editingItemId === term.id}
																							<div transition:fly={{ y: -4, duration: 200, easing: cubicOut }} class="space-y-3" onclick={(e) => e.stopPropagation()}>
																								<p class="text-xs font-medium opacity-50 mb-1">Edit term</p>
																								<input
																									type="text"
																									class="input input-sm w-full bg-base-200 border-base-content/20"
																									bind:value={editingValue}
																									placeholder="Title"
																									onkeydown={(e) => { if (e.key === 'Enter') saveEdit(project.projectKey, 'term', term.id, { title: editingValue, body: editingValue2 }); if (e.key === 'Escape') cancelEditing(); }}
																								/>
																								<textarea
																									class="textarea w-full text-sm bg-base-200 border-base-content/20 resize-none"
																									style="min-height: 5rem; max-height: 30vh; overflow-y: auto;"
																									bind:value={editingValue2}
																									use:autogrow
																									placeholder="Term body (optional)"
																									onkeydown={(e) => { if (e.key === 'Escape') cancelEditing(); }}
																								></textarea>
																								<div class="flex gap-2">
																									<button class="btn btn-success btn-xs" onclick={() => saveEdit(project.projectKey, 'term', term.id, { title: editingValue, body: editingValue2 })}>Save</button>
																									<button class="btn btn-ghost btn-xs" onclick={() => cancelEditing()}>Cancel</button>
																								</div>
																							</div>
																						{:else}
																						{@const isCollapsed = collapsedTerms.has(term.id)}
																						<div class="flex items-center gap-2 group cursor-pointer" role="button" tabindex="0"
																							onclick={(e) => { e.stopPropagation(); toggleTermCollapse(term.id); }}
																							onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); toggleTermCollapse(term.id); } }}
																						>
																							<div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
																								{term.status === 'accepted' ? 'bg-success/20' : term.status === 'rejected' ? 'bg-error/20' : 'bg-base-300'}">
																								{#if term.status === 'accepted'}
																									<svg class="w-2.5 h-2.5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
																								{:else if term.status === 'rejected'}
																									<svg class="w-2.5 h-2.5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
																								{:else}
																									<span class="text-xs font-bold opacity-60">{ti + 1}</span>
																								{/if}
																							</div>
																							<p class="font-medium text-sm flex-1 min-w-0 truncate">{term.title}</p>
																							<div class="flex items-center gap-2 shrink-0" onclick={(e) => e.stopPropagation()} role="none">
																								{#if !isCollapsed && editable}
																									<button class="btn btn-ghost btn-xs text-error opacity-30 hover:opacity-100"
																										onclick={(e) => { e.stopPropagation(); deleteItem(project.projectKey, 'term', term.id); }}
																										title="Delete term">
																										<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
																										</svg>
																									</button>
																								{/if}
																								<div class="dropdown dropdown-end">
																									<div tabindex="0" role="button"
																										class="badge badge-xs md:badge-xs badge-sm {term.status === 'accepted' ? 'badge-success' : term.status === 'rejected' ? 'badge-error' : 'badge-warning'} cursor-pointer gap-1 min-h-[28px] md:min-h-0"
																										onkeydown={(e) => e.stopPropagation()}>
																										{term.status}
																										{#if updatingItem === term.id}
																											<span class="loading loading-spinner" style="width:8px;height:8px"></span>
																										{:else}
																											<svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
																										{/if}
																									</div>
																									<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
																									<ul tabindex="0" class="dropdown-content z-40 menu menu-xs shadow-lg bg-base-100 rounded-box w-36 p-1">
																										{#each ['pending', 'accepted', 'rejected'] as s}
																											<li><button class:active={term.status === s}
																												onclick={(e) => { e.stopPropagation(); updateStatus(project.projectKey, 'term', term.id, s); }}
																												disabled={term.status === s}>
																												<span class="badge badge-xs {s === 'accepted' ? 'badge-success' : s === 'rejected' ? 'badge-error' : 'badge-warning'}"></span>
																												{s}
																											</button></li>
																										{/each}
																									</ul>
																								</div>
																								<!-- expand/collapse chevron -->
																								<svg class="w-3.5 h-3.5 opacity-30 group-hover:opacity-60 transition-all duration-200 {isCollapsed ? '' : 'rotate-180'}"
																									fill="none" stroke="currentColor" viewBox="0 0 24 24">
																									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
																								</svg>
																							</div>
																						</div>
																						{#if !isCollapsed}
																							<div class="mt-1 ml-7 space-y-1">
																								{#if term.body}
																									<div
																										class={editable ? 'text-xs opacity-60 mt-1 whitespace-pre-wrap cursor-pointer hover:bg-base-300/50 rounded px-1 -mx-1' : 'text-xs opacity-60 mt-1 whitespace-pre-wrap'}
																										onclick={(e) => { if (editable) { e.stopPropagation(); startEditing(term.id, 'term', term.title, term.body || ''); } }}
																										role={editable ? 'button' : undefined}
																										tabindex={editable ? 0 : undefined}
																									>{term.body}</div>
																								{:else if editable}
																									<button class="text-xs opacity-30 hover:opacity-60 italic mt-1" onclick={(e) => { e.stopPropagation(); startEditing(term.id, 'term', term.title, ''); }}>+ add body</button>
																								{/if}
																								{#if term.comments && term.comments.length > 0}
																									<div class="mt-2 space-y-1.5">
																										{#each term.comments as c}
																											<div class="flex gap-2 items-start {c.author === 'owner' ? 'flex-row-reverse' : ''}">
																												<div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 {c.author === 'owner' ? 'bg-primary/15 text-primary' : 'bg-base-300 text-base-content/50'}">
																													<svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
																												</div>
																												<div class="max-w-[75%] rounded-2xl px-3 py-1.5 text-xs border {c.author === 'owner' ? 'bg-primary/8 border-primary/20 text-primary/90 rounded-tr-sm' : 'bg-base-200 border-base-content/10 text-base-content/70 rounded-tl-sm'}">
																													<p class="leading-relaxed">{c.body}</p>
																													<p class="opacity-40 mt-0.5 {c.author === 'owner' ? 'text-right' : ''}">{formatCommentTime(c.created_at)}</p>
																												</div>
																											</div>
																										{/each}
																									</div>
																								{:else if term.client_notes}
																									<div class="mt-2 px-2 py-1.5 bg-base-200 rounded text-xs">
																										<span class="opacity-50">Client notes:</span>
																										<span class="opacity-70">{term.client_notes}</span>
																									</div>
																								{/if}
																								{#if commentingId === term.id}
																									<div class="mt-2 flex gap-2 items-start justify-end" onclick={(e) => e.stopPropagation()}>
																										<textarea
																											class="textarea textarea-xs flex-1 max-w-xs bg-base-200 border-base-content/20 resize-none text-xs"
																											rows="2"
																											placeholder="Add owner comment..."
																											bind:value={commentInputs[term.id]}
																											onkeydown={(e) => { if (e.key === 'Escape') commentingId = null; }}
																										></textarea>
																										<div class="flex flex-col gap-1">
																											<button class="btn btn-primary btn-xs" onclick={() => addOwnerComment(project.projectKey, 'term', term.id, term.comments || [])} disabled={!(commentInputs[term.id] || '').trim() || commentSaving}>
																												{#if commentSaving}<span class="loading loading-spinner loading-xs"></span>{:else}Send{/if}
																											</button>
																											<button class="btn btn-ghost btn-xs" onclick={() => commentingId = null}>Cancel</button>
																										</div>
																									</div>
																								{:else if editable}
																									<button class="mt-1 text-[10px] opacity-30 hover:opacity-60 transition-opacity flex items-center gap-1" onclick={(e) => { e.stopPropagation(); commentingId = term.id; }}>
																										<svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
																										Reply
																									</button>
																								{/if}
																								{#if term.accepted_at}
																									<p class="text-xs opacity-40 mt-1">
																										{term.status === 'accepted' ? 'Accepted' : 'Updated'} {formatDate(term.accepted_at)}
																									</p>
																								{/if}
																							</div>
																						{/if}
																						{/if}
																					</div>
																				{/each}
																			</div>
																			{/if}
																		{:else}
																			<h5 class="text-xs font-semibold uppercase tracking-wider opacity-40 mb-2">Terms</h5>
																			<p class="text-xs opacity-40">No terms defined yet.</p>
																		{/if}

																		<!-- Inline Add Term -->
																		{#if !editable}
																			<!-- locked -->
																		{:else if addingTermToContract === contract.id}
																			<div class="border border-primary/30 rounded-lg p-3 mt-2 space-y-2 bg-primary/5">
																				<span class="text-xs font-bold opacity-50">New Term</span>
																				<input
																					type="text"
																					class="input input-sm w-full bg-base-200 border-base-content/20"
																					bind:value={newTermTitle}
																					placeholder="Term title, e.g. Payment Terms"
																					onclick={(e) => e.stopPropagation()}
																				/>
																				<textarea
																					class="textarea w-full text-sm bg-base-200 border-base-content/20 text-base-content"
																					rows="3"
																					bind:value={newTermBody}
																					placeholder="Describe this term in detail..."
																					onclick={(e) => e.stopPropagation()}
																				></textarea>
																				<div class="flex items-center gap-2 justify-end">
																					<button
																						class="btn btn-ghost btn-xs"
																						onclick={(e) => { e.stopPropagation(); cancelAddingTerm(); }}
																					>Cancel</button>
																					<button
																						class="btn btn-primary btn-xs"
																						onclick={(e) => { e.stopPropagation(); saveNewTerm(); }}
																						disabled={savingTerm || !newTermTitle.trim()}
																					>
																						{#if savingTerm}
																							<span class="loading loading-spinner" style="width:10px;height:10px"></span>
																						{/if}
																						Save Term
																					</button>
																				</div>
																			</div>
																		{:else}
																			<button
																				class="btn btn-ghost btn-xs mt-2 gap-1 opacity-60 hover:opacity-100"
																				onclick={(e) => { e.stopPropagation(); startAddingTerm(contract.id, project.projectKey); }}
																			>
																				<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
																				</svg>
																				Add Term
																			</button>
																		{/if}
																	</div>
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
					<h2 class="text-sm font-semibold uppercase tracking-wider opacity-50 mb-3">Upcoming Deliverables</h2>
					{#if upcomingMilestones.length === 0}
						<p class="text-sm opacity-30 px-1">No pending milestones.</p>
					{:else}
						<div class="flex flex-col divide-y divide-base-300">
							{#each upcomingMilestones.slice(0, 10) as milestone, mi}
								<div in:fly={{ y: 8, duration: 280, delay: mi * 45, easing: cubicOut }} class="flex items-start justify-between gap-2 py-2.5 px-1">
									<div class="min-w-0">
										<p class="font-medium text-sm truncate">{milestone.name}</p>
										<p class="text-xs opacity-40 mt-0.5">{milestone.projectName}</p>
									</div>
									<div class="text-right shrink-0">
										<p class="text-sm font-mono">{formatCents(milestone.amount)}</p>
										<span class="badge badge-xs {statusBadgeClass(milestone.status)} mt-0.5">{milestone.status}</span>
									</div>
								</div>
							{/each}
							{#if upcomingMilestones.length > 10}
								<p class="text-xs opacity-30 text-center pt-2">+{upcomingMilestones.length - 10} more</p>
							{/if}
						</div>
					{/if}
				</div>

				<!-- Recent Payments -->
				<div>
					<h2 class="text-sm font-semibold uppercase tracking-wider opacity-50 mb-3">Recent Payments</h2>
					{#if recentPayments.length === 0}
						<p class="text-sm opacity-30 px-1">No payments recorded yet.</p>
					{:else}
						<div class="flex flex-col divide-y divide-base-300">
							{#each recentPayments.slice(0, 8) as payment, pi}
								<div in:fly={{ y: 8, duration: 280, delay: pi * 40, easing: cubicOut }} class="flex items-center justify-between gap-2 py-2.5 px-1">
									<div class="min-w-0">
										<p class="text-sm font-medium truncate">{payment.name}</p>
										<p class="text-xs opacity-40 mt-0.5">{payment.projectName}</p>
									</div>
									<div class="text-right shrink-0">
										<p class="text-sm font-mono text-success font-semibold">{formatCents(payment.amount)}</p>
										<p class="text-xs opacity-40 mt-0.5">{formatDate(payment.paid_at)}</p>
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
						class="select bg-base-200 border-base-content/20 w-full"
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
									class="input input-sm w-full bg-base-200 border-base-content/20"
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
									class="input input-sm w-full bg-base-200 border-base-content/20"
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
										class="input input-sm bg-base-200 border-base-content/20 join-item flex-1"
										bind:value={totalAmount}
										placeholder="50000.00"
									/>
								</div>
							</div>

							<div class="form-control">
								<label class="label" for="create-currency">
									<span class="label-text">Currency</span>
								</label>
								<select id="create-currency" class="select bg-base-200 border-base-content/20" bind:value={currency}>
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
								class="textarea bg-base-200 border-base-content/20 w-full"
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
													class="input input-sm w-full bg-base-200 border-base-content/20"
													bind:value={milestone.name}
													placeholder="Name"
												/>
											</label>
											<div class="join w-full">
												<input
													type="number"
													class="input input-sm bg-base-200 border-base-content/20 join-item w-full"
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
												class="input input-sm w-full bg-base-200 border-base-content/20"
												bind:value={milestone.description}
												placeholder="Description"
											/>
										</label>

										<label class="floating-label">
											<span>Acceptance criteria</span>
											<input
												type="text"
												class="input input-sm w-full bg-base-200 border-base-content/20"
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

					<!-- Contract Terms Section -->
					<div class="space-y-4 mt-6">
						<div class="flex items-center justify-between">
							<h4 class="font-semibold text-sm uppercase opacity-60">Contract Terms</h4>
							<span class="text-xs opacity-40">{contractTerms.length} term{contractTerms.length !== 1 ? 's' : ''}</span>
						</div>

						<p class="text-xs opacity-50">
							Define the terms and conditions for this contract. Clients will review, accept, and initial each term.
						</p>

						{#if contractTerms.length > 0}
							<div class="space-y-3">
								{#each contractTerms as term, i}
									<div class="border border-base-300 rounded-lg p-3 space-y-2">
										<div class="flex items-center justify-between">
											<span class="text-xs font-bold opacity-50">Term {i + 1}</span>
											<button
												type="button"
												class="btn btn-ghost btn-xs text-error"
												onclick={() => { contractTerms = contractTerms.filter((_, idx) => idx !== i); }}
											>
												<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
												</svg>
											</button>
										</div>

										<label class="floating-label">
											<span>Title</span>
											<input
												type="text"
												class="input input-sm w-full bg-base-200 border-base-content/20"
												bind:value={term.title}
												placeholder="e.g. Payment Terms"
											/>
										</label>

										<label class="floating-label">
											<span>Description</span>
											<textarea
												class="textarea w-full text-sm bg-base-200 border-base-content/20 text-base-content"
												rows="3"
												bind:value={term.body}
												placeholder="Describe this term in detail..."
											></textarea>
										</label>
									</div>
								{/each}
							</div>
						{/if}

						<button
							type="button"
							class="btn btn-outline btn-sm"
							onclick={() => { contractTerms = [...contractTerms, { title: '', body: '' }]; }}
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
							Add Term
						</button>
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
					class="input input-sm bg-base-200 border-base-content/20"
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

<style>
	/* Reduced motion: disable all transitions and animations */
	@media (prefers-reduced-motion: reduce) {
		* {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}
	}
</style>
