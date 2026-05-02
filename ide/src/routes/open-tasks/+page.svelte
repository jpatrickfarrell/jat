<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getProjectColor, fetchAndGetProjectColors } from '$lib/utils/projectColors';
	import TaskDetailDrawer from '$lib/components/TaskDetailDrawer.svelte';
	import TaskIdBadge from '$lib/components/TaskIdBadge.svelte';
	import SearchDropdown from '$lib/components/SearchDropdown.svelte';
	import type { SearchDropdownGroup } from '$lib/components/SearchDropdown.svelte';
	import { openProjectDrawer, isMobileFullscreenOpen, availableProjects } from '$lib/stores/drawerStore';
	import { get } from 'svelte/store';
	import { saveColumnSettings as saveColumnSettingsUtil, loadColumnSettings as loadColumnSettingsUtil } from '$lib/utils/columnStorage';
	import ManageColumnsDropdown from '$lib/components/ManageColumnsDropdown.svelte';
	import { columnResize } from '$lib/actions/columnResize';
	import { fade } from 'svelte/transition';
	import { bulkApiOperation, fetchWithTimeout, createDeleteRequest, handleApiError, formatBulkResultMessage } from '$lib/utils/bulkApiHelpers';
	import { addToast } from '$lib/stores/toasts.svelte';
	import { AGENT_PRESETS } from '$lib/types/agentProgram';
	import ProviderLogo from '$lib/components/agents/ProviderLogo.svelte';
	import { spawnInBatches, type SpawnResult } from '$lib/utils/spawnBatch';
	import { STATUS_OPTIONS, type TaskStatus } from '$lib/config/task-statuses';
	import { createListNav } from '$lib/actions/listNav';
	import KeyboardShortcutsOverlay from '$lib/components/KeyboardShortcutsOverlay.svelte';
	import { addVoiceActionHandlers } from '$lib/voice/voiceActionRegistry';

	interface Task {
		id: string;
		title: string;
		description: string;
		status: string;
		priority: number;
		issue_type: string;
		project: string;
		assignee?: string;
		labels: string[];
		due_date?: string | null;
		created_at?: string;
		updated_at?: string;
		milestone_id?: string | null;
		milestone_name?: string | null;
		internal?: boolean | null;
		creator?: { name?: string; email?: string } | string | null;
		requester?: { name?: string; email?: string } | null;
		approver?: { name?: string; email?: string } | null;
		depends_on?: Array<{ id: string; title: string; status: string; priority: number }>;
		blocked_by?: Array<{ id: string; title: string; status: string; priority: number }>;
		source?: string | null;
		source_item_id?: string | null;
		metadata?: string | Record<string, unknown> | null;
		page_url?: string | null;
	}

	// Column definition
	interface ColDef {
		id: string;
		label: string;
		defaultWidth: number;
		minWidth: number;
		sortable: boolean;
		sortField?: string;
	}

	const ALL_COLUMNS: ColDef[] = [
		{ id: 'project', label: 'Project', defaultWidth: 100, minWidth: 60, sortable: true, sortField: 'project' },
		{ id: 'priority', label: 'Priority', defaultWidth: 64, minWidth: 50, sortable: true, sortField: 'priority' },
		{ id: 'status', label: 'Status', defaultWidth: 110, minWidth: 70, sortable: true, sortField: 'status' },
		{ id: 'type', label: 'Type', defaultWidth: 40, minWidth: 36, sortable: true, sortField: 'type' },
		{ id: 'id', label: 'ID', defaultWidth: 110, minWidth: 70, sortable: true, sortField: 'title' },
		{ id: 'title', label: 'Title', defaultWidth: 0, minWidth: 200, sortable: true, sortField: 'title' },
		{ id: 'milestone', label: 'Milestone', defaultWidth: 130, minWidth: 80, sortable: false },
		{ id: 'due_date', label: 'Due', defaultWidth: 100, minWidth: 70, sortable: true, sortField: 'due_date' },
		{ id: 'labels', label: 'Labels', defaultWidth: 160, minWidth: 80, sortable: false },
		{ id: 'assignee', label: 'Assignee', defaultWidth: 100, minWidth: 60, sortable: false },
		{ id: 'requester', label: 'Requester', defaultWidth: 120, minWidth: 80, sortable: false },
		{ id: 'source', label: 'Source', defaultWidth: 90, minWidth: 60, sortable: true, sortField: 'source' },
		{ id: 'page', label: 'Page', defaultWidth: 160, minWidth: 80, sortable: true, sortField: 'page' },
		{ id: 'created', label: 'Created', defaultWidth: 120, minWidth: 80, sortable: true, sortField: 'created' },
		{ id: 'updated', label: 'Updated', defaultWidth: 120, minWidth: 80, sortable: true, sortField: 'updated' },
		{ id: 'actions', label: 'Actions', defaultWidth: 72, minWidth: 50, sortable: false },
	];

	interface Milestone {
		id: string;
		name: string;
		sort_order: number;
		status: string;
		contract_id: string | null;
		contract_title: string | null;
	}

	// Data state — $state.raw: mutations always replace the full array, deep proxy tracking buys nothing
	let tasks = $state.raw<Task[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let pollInterval: ReturnType<typeof setInterval> | null = null;
	let availableMilestones = $state<Milestone[]>([]);

	// Filter state — default project comes from URL param > saved prefs > app's current project
	const urlProject = $derived($page.url.searchParams.get('project') ?? '');
	let selectedProject = $state(urlProject || 'all');
	let selectedType = $state('all');
	let searchQuery = $state('');
	let projects = $state<string[]>([]);
	let searchInputEl = $state<HTMLInputElement | null>(null);

	let initialFocusDone = false;

	// Power view filter state
	const DEFAULT_STATUSES: TaskStatus[] = ['open', 'in_progress', 'waiting', 'blocked', 'submitted', 'accepted'];
	let selectedStatuses = $state<Set<TaskStatus>>(new Set(DEFAULT_STATUSES));
	let selectedPriority = $state('');
	let selectedAssignee = $state('');
	let selectedLabel = $state('');
	let selectedMilestone = $state('');
	let selectedRequester = $state('');
	let selectedApprover = $state('');
	let internalFilter = $state<'all' | 'internal' | 'public'>('all');

	const projectDropdownGroups = $derived.by<SearchDropdownGroup[]>(() => [{
		label: 'Projects',
		options: [
			{ value: 'all', label: 'All Projects' },
			...projects.map(p => ({ value: p, label: p }))
		]
	}]);

	const typeDropdownGroups = $derived.by<SearchDropdownGroup[]>(() => [{
		label: 'Types',
		options: [
			{ value: 'all', label: 'All Types' },
			...taskTypes.map(t => ({ value: t, label: `${typeIcon(t)} ${t}` }))
		]
	}]);

	const priorityGroups: SearchDropdownGroup[] = [{
		label: 'Priority',
		options: [
			{ value: '', label: 'All Priorities' },
			{ value: '0', label: 'P0 — Critical' },
			{ value: '1', label: 'P1 — High' },
			{ value: '2', label: 'P2 — Medium' },
			{ value: '3', label: 'P3 — Low' },
			{ value: '4', label: 'P4 — Lowest' },
		]
	}];

	// Agent names are PascalCase compound words (AdjectiveNoun, e.g. GentleCoast, RoundLedge)
	function isHumanAssignee(name: string): boolean {
		if (!name) return false;
		if (name.includes('@')) return true;   // email
		if (name.includes(' ')) return true;   // full name with space
		if (name === name.toLowerCase()) return true;  // lowercase handle
		if (/[0-9]/.test(name)) return true;   // has digits (fallback agent suffix)
		// Exclude bare PascalCase compound words — the JAT agent name pattern
		return !/^[A-Z][a-z]+[A-Z][a-z]+$/.test(name);
	}

	const assigneeGroups = $derived.by<SearchDropdownGroup[]>(() => {
		return [{
			label: 'Assignee',
			options: [
				{ value: '', label: 'All Assignees' },
				{ value: '__unassigned__', label: 'Unassigned' },
				...humanAssignees.map(n => ({ value: n, label: n }))
			]
		}];
	});

	const allLabels = $derived([...new Set(tasks.flatMap(t => t.labels ?? []))].sort());
	const allAssignees = $derived([...new Set(tasks.map(t => t.assignee).filter(Boolean) as string[])].sort());
	const humanAssignees = $derived(allAssignees.filter(isHumanAssignee));
	const allApprovers = $derived([...new Set(tasks.map(t => t.approver?.name || t.approver?.email).filter(Boolean) as string[])].sort());
	const allRequesters = $derived([...new Set(tasks.map(t => t.requester?.name || t.requester?.email).filter(Boolean) as string[])].sort());

	const labelGroups = $derived.by<SearchDropdownGroup[]>(() => {
		return [{
			label: 'Label',
			options: [
				{ value: '', label: 'All Labels' },
				...allLabels.map(l => ({ value: l, label: l }))
			]
		}];
	});

	const milestoneGroups = $derived.by<SearchDropdownGroup[]>(() => {
		const seen = new Map<string, string>();
		for (const t of tasks) {
			if (t.milestone_id) seen.set(t.milestone_id, t.milestone_name || t.milestone_id);
		}
		const entries = [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
		return [{
			label: 'Milestone',
			options: [
				{ value: '', label: 'All Milestones' },
				{ value: '__none__', label: 'No Milestone' },
				...entries.map(([id, name]) => ({ value: id, label: name }))
			]
		}];
	});

	// Milestone assignment groups (for inline cell dropdown) — includes full list from API
	const milestoneAssignGroups = $derived.by<SearchDropdownGroup[]>(() => {
		if (!availableMilestones.length) {
			// Fallback: use only milestones seen on current tasks
			const seen = new Map<string, string>();
			for (const t of tasks) {
				if (t.milestone_id) seen.set(t.milestone_id, t.milestone_name || t.milestone_id);
			}
			const entries = [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
			return [
				{ label: '-', options: [{ value: '', label: 'No milestone' }] },
				{ label: 'Milestones', options: entries.map(([id, name]) => ({ value: id, label: name })) },
			];
		}
		// Group by contract
		const byContract = new Map<string, { title: string; items: Milestone[] }>();
		for (const m of availableMilestones) {
			const key = m.contract_id || '__none__';
			if (!byContract.has(key)) byContract.set(key, { title: m.contract_title || 'Milestones', items: [] });
			byContract.get(key)!.items.push(m);
		}
		const groups: SearchDropdownGroup[] = [
			{ label: '-', options: [{ value: '', label: 'No milestone' }] },
		];
		for (const { title, items } of byContract.values()) {
			groups.push({ label: title, options: items.map(m => ({ value: m.id, label: m.name })) });
		}
		return groups;
	});

	// Flat milestone list for bulk-action dropdown — combines task-observed + API milestones
	const bulkMilestoneOptions = $derived.by<Array<{id: string, name: string}>>(() => {
		const seen = new Map<string, string>();
		for (const t of tasks) {
			if (t.milestone_id) seen.set(t.milestone_id, t.milestone_name || t.milestone_id);
		}
		for (const m of availableMilestones) {
			if (!seen.has(m.id)) seen.set(m.id, m.name);
		}
		return [...seen.entries()]
			.map(([id, name]) => ({ id, name }))
			.sort((a, b) => a.name.localeCompare(b.name));
	});

	const requesterGroups = $derived.by<SearchDropdownGroup[]>(() => {
		return [{
			label: 'Requester',
			options: [
				{ value: '', label: 'All Requesters' },
				...allRequesters.map(n => ({ value: n, label: n }))
			]
		}];
	});

	const approverGroups = $derived.by<SearchDropdownGroup[]>(() => {
		return [{
			label: 'Approver',
			options: [
				{ value: '', label: 'All Approvers' },
				...allApprovers.map(n => ({ value: n, label: n }))
			]
		}];
	});

	// Whether conditional dropdowns should render
	// Active milestone shorthand resolution (for the inline badge)
	const activeMilestoneShorthand = $derived.by(() => {
		const q = searchQuery.toLowerCase().trim();
		const m = q.match(/^m(\d+)$/);
		if (!m) return null;
		const idx = parseInt(m[1]) - 1;
		const ms = sortedMilestones[idx];
		return ms ? { label: ms.name, num: parseInt(m[1]) } : { label: null, num: parseInt(m[1]) };
	});

	// Ordered milestone list used for m1/m2/m3 search shorthands
	const sortedMilestones = $derived.by(() => {
		const seen = new Map<string, string>();
		for (const t of tasks) {
			if (t.milestone_id) seen.set(t.milestone_id, t.milestone_name || t.milestone_id);
		}
		return [...seen.entries()]
			.sort((a, b) => a[1].localeCompare(b[1]))
			.map(([id, name]) => ({ id, name }));
	});

	const hasAssignees = $derived(tasks.some(t => t.assignee));
	const hasLabels = $derived(tasks.some(t => t.labels?.length));
	const hasMilestones = $derived(tasks.some(t => t.milestone_id));
	const hasRequesters = $derived(tasks.some(t => t.requester?.name || t.requester?.email));
	const hasApprovers = $derived(tasks.some(t => t.approver?.name || t.approver?.email));

	// Tasks after all filters except status — used for status-dropdown counts
	const tasksForStatusCounts = $derived.by(() => {
		let result = tasks;
		if (selectedProject !== 'all') result = result.filter(t => t.project === selectedProject);
		if (selectedType !== 'all') result = result.filter(t => t.issue_type === selectedType);
		if (selectedPriority !== '') result = result.filter(t => String(t.priority) === selectedPriority);
		if (selectedAssignee === '__unassigned__') result = result.filter(t => !t.assignee);
		else if (selectedAssignee !== '') result = result.filter(t => t.assignee === selectedAssignee);
		if (selectedLabel !== '') result = result.filter(t => (t.labels ?? []).includes(selectedLabel));
		if (selectedMilestone === '__none__') result = result.filter(t => !t.milestone_id);
		else if (selectedMilestone !== '') result = result.filter(t => t.milestone_id === selectedMilestone);
		if (selectedRequester !== '') result = result.filter(t => {
			const r = t.requester;
			return r && (r.name === selectedRequester || r.email === selectedRequester);
		});
		if (selectedApprover !== '') result = result.filter(t => {
			const a = t.approver;
			return a && (a.name === selectedApprover || a.email === selectedApprover);
		});
		return result;
	});

	// Status counts scoped to currently active non-status filters
	const statusCounts = $derived.by(() => {
		const counts: Record<string, number> = {};
		for (const t of tasksForStatusCounts) counts[t.status] = (counts[t.status] ?? 0) + 1;
		return counts;
	});

	const hasActiveFilters = $derived(
		selectedProject !== 'all' ||
		selectedType !== 'all' ||
		searchQuery.trim() !== '' ||
		selectedPriority !== '' ||
		selectedAssignee !== '' ||
		selectedLabel !== '' ||
		selectedMilestone !== '' ||
		selectedRequester !== '' ||
		selectedApprover !== '' ||
		internalFilter !== 'all' ||
		selectedStatuses.size !== DEFAULT_STATUSES.length ||
		!DEFAULT_STATUSES.every(s => selectedStatuses.has(s))
	);

	function clearFilters() {
		selectedProject = 'all';
		selectedType = 'all';
		searchQuery = '';
		selectedPriority = '';
		selectedAssignee = '';
		selectedLabel = '';
		selectedMilestone = '';
		selectedRequester = '';
		selectedApprover = '';
		internalFilter = 'all';
		selectedStatuses = new Set(DEFAULT_STATUSES);
	}

	function toggleStatus(s: TaskStatus) {
		const next = new Set(selectedStatuses);
		if (next.has(s)) next.delete(s); else next.add(s);
		selectedStatuses = next;
	}

	function selectAllStatuses() { selectedStatuses = new Set(STATUS_OPTIONS.map(o => o.value)); }
	function clearAllStatuses() { selectedStatuses = new Set(); }
	function resetStatuses() { selectedStatuses = new Set(DEFAULT_STATUSES); }

	// j/k nav with full selection layer (x = toggle, V = visual, * = select all, Shift+J/K = range)
	const nav = createListNav({
		getItems: () => Array.from(document.querySelectorAll<HTMLElement>('tr[data-nav-id]')),
		onSelect: (_el) => { const id = _el.dataset.navId; if (id) openTaskDrawer(id); },
		selectable: true,
		onSelectionChange: (ids) => { selectedTasks = ids; },
		wraparound: true,
	});

	// Keyboard-first focus: focus first row when tasks first load, re-sync on every list change.
	// requestAnimationFrame (not tick) for initial focus — guarantees the browser has painted
	// the rows before we try to apply the focused class.
	$effect(() => {
		const items = filteredTasks; // track
		if (items.length === 0) return;
		if (!initialFocusDone) {
			initialFocusDone = true;
			requestAnimationFrame(() => nav.focus(0));
		} else {
			tick().then(() => nav.refresh());
		}
	});

	function handlePageKeydown(e: KeyboardEvent) {
		// MobileSessionDrawer owns the keyboard when open — don't interfere
		if (get(isMobileFullscreenOpen)) return;
		const target = e.target as HTMLElement;
		// Don't steal keys when typing in inputs or contenteditables (e.g. PromptInput)
		if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target.isContentEditable) {
			if (e.key === 'Escape' && target === searchInputEl) {
				e.preventDefault();
				searchQuery = '';
				searchInputEl?.blur();
				return;
			}
			if (e.key === 'Tab' && !e.shiftKey && target === searchInputEl) {
				e.preventDefault();
				nav.focus(0);
			}
			return;
		}
		if (e.key === '?' || e.key === '/') {
			e.preventDefault();
			if (e.key === '?') { shortcutsOpen = true; return; }
			searchInputEl?.focus();
			return;
		}
		if (e.key === 'f') {
			e.preventDefault();
			searchInputEl?.focus();
			return;
		}
		if (nav.handleKeydown(e)) return;

		// Single-key shortcuts (no modifier) — dual mode:
		//   no selection  → open the corresponding FILTER dropdown
		//   with selection → open the corresponding BULK ACTION dropdown
		if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
			const hasSel = selectedTasks.size > 0;
			switch (e.key) {
				case 'p':
					e.preventDefault();
					if (hasSel) { closeBulkDropdowns(); priorityDropdownOpen = true; }
					else priorityFilterRef?.openDropdown();
					break;
				case 's':
					e.preventDefault();
					if (hasSel) { closeBulkDropdowns(); statusDropdownOpen = true; }
					else if (statusFilterEl) { statusFilterEl.open = true; }
					break;
				case 'a':
					e.preventDefault();
					if (hasSel) { closeBulkDropdowns(); assignDropdownOpen = true; }
					else assigneeFilterRef?.openDropdown();
					break;
				case 'm':
					e.preventDefault();
					if (hasSel) { closeBulkDropdowns(); milestoneDropdownOpen = true; }
					else milestoneFilterRef?.openDropdown();
					break;
				case 't':
					e.preventDefault();
					if (hasSel) { closeBulkDropdowns(); typeDropdownOpen = true; }
					else typeFilterRef?.openDropdown();
					break;
				case 'l':
					e.preventDefault();
					labelFilterRef?.openDropdown();
					break;
				case 'e':
					if (hasSel) { e.preventDefault(); closeBulkDropdowns(); loadEpics(); bulkEpicOpen = true; }
					break;
				case 'c':
					if (hasSel) { e.preventDefault(); handleBulkClose(); }
					break;
				case 'h':
					if (hasSel) { e.preventDefault(); handleBulkHide(); }
					break;
				case 'P':
					if (hasSel) { e.preventDefault(); handleBulkPromote(); }
					break;
				case 'Escape':
					closeBulkDropdowns();
					break;
			}
		}
	}

	// Sort chips
	interface SortChip { field: string; dir: 'asc' | 'desc'; }
	const SORT_FIELDS: Record<string, string> = {
		priority: 'Priority', status: 'Status', title: 'Title', project: 'Project',
		type: 'Type', due_date: 'Due', created: 'Created', updated: 'Updated', assignee: 'Assignee',
		source: 'Source', page: 'Page',
	};
	let sortChips = $state<SortChip[]>([{ field: 'priority', dir: 'asc' }]);
	const availableSortFields = $derived(
		Object.keys(SORT_FIELDS).filter(f => !sortChips.some(c => c.field === f))
	);

	// Group-by
	type GroupBy = 'none' | 'milestone' | 'assignee' | 'status';
	const GROUP_BY_OPTIONS: Array<{ value: GroupBy; label: string }> = [
		{ value: 'none', label: 'None' },
		{ value: 'milestone', label: 'Milestone' },
		{ value: 'assignee', label: 'Assignee' },
		{ value: 'status', label: 'Status' },
	];
	let groupBy = $state<GroupBy>('none');
	let collapsedGroups = $state<Set<string>>(new Set());
	function toggleGroupCollapse(key: string) {
		const next = new Set(collapsedGroups);
		if (next.has(key)) next.delete(key); else next.add(key);
		collapsedGroups = next;
	}

	let chipDragIdx = $state<number | null>(null);
	let chipDragOverIdx = $state<number | null>(null);
	let addSortDetailsEl = $state<HTMLDetailsElement | null>(null);

	function getTaskPageUrl(task: Task): string {
		if (task.page_url) return task.page_url;
		if (!task.metadata) return '';
		try {
			const meta = typeof task.metadata === 'string' ? JSON.parse(task.metadata) : task.metadata;
			return (meta as Record<string, unknown>).page_url as string || '';
		} catch { return ''; }
	}

	function formatPageUrl(url: string): string {
		if (!url) return '';
		try {
			const u = new URL(url);
			return u.pathname + (u.search ? u.search : '');
		} catch {
			// Not a full URL — already a pathname
			return url;
		}
	}

	function compareByField(a: Task, b: Task, field: string): number {
		switch (field) {
			case 'priority': return a.priority - b.priority;
			case 'status':   return (a.status || '').localeCompare(b.status || '');
			case 'title':    return a.title.localeCompare(b.title);
			case 'project':  return (a.project || '').localeCompare(b.project || '');
			case 'type':     return (a.issue_type || '').localeCompare(b.issue_type || '');
			case 'due_date': return (a.due_date || '9999').localeCompare(b.due_date || '9999');
			case 'created':  return (a.created_at || '').localeCompare(b.created_at || '');
			case 'updated':  return (a.updated_at || '').localeCompare(b.updated_at || '');
			case 'assignee': return (a.assignee || '￿').localeCompare(b.assignee || '￿');
			case 'source':   return (a.source || '').localeCompare(b.source || '');
			case 'page':     return getTaskPageUrl(a).localeCompare(getTaskPageUrl(b));
			default:         return 0;
		}
	}

	function toggleChipDir(i: number) {
		sortChips = sortChips.map((c, idx) => idx === i ? { ...c, dir: c.dir === 'asc' ? 'desc' : 'asc' } : c);
	}
	function removeSortChip(i: number) {
		sortChips = sortChips.filter((_, idx) => idx !== i);
		if (sortChips.length === 0) sortChips = [{ field: 'priority', dir: 'asc' }];
	}
	function addSortChip(field: string) {
		sortChips = [...sortChips, { field, dir: 'asc' }];
		addSortDetailsEl?.removeAttribute('open');
	}

	function handleChipDragStart(i: number, e: DragEvent) {
		chipDragIdx = i;
		if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); }
	}
	function handleChipDragOver(i: number, e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		chipDragOverIdx = i;
	}
	function handleChipDragEnd() { chipDragIdx = null; chipDragOverIdx = null; }
	function handleChipDrop(i: number, e: DragEvent) {
		e.preventDefault();
		if (chipDragIdx === null || chipDragIdx === i) { handleChipDragEnd(); return; }
		const next = [...sortChips];
		const [moved] = next.splice(chipDragIdx, 1);
		next.splice(i, 0, moved);
		sortChips = next;
		handleChipDragEnd();
	}

	// Persist filter + sort preferences
	let prefsLoaded = false;
	function savePrefs() {
		if (!browser || !prefsLoaded) return;
		try {
			localStorage.setItem('jat-open-tasks-prefs', JSON.stringify({
				selectedStatuses: [...selectedStatuses],
				selectedProject, selectedType, selectedPriority, selectedAssignee,
				selectedLabel, selectedMilestone, selectedRequester, selectedApprover,
				sortChips,
				groupBy,
				collapsedGroups: [...collapsedGroups],
			}));
		} catch { /* quota */ }
	}
	function loadPrefs() {
		if (!browser) return;
		try {
			// URL param wins outright
			const fromUrl = $page.url.searchParams.get('project');
			if (fromUrl) { selectedProject = fromUrl; }

			const raw = localStorage.getItem('jat-open-tasks-prefs');
			if (raw) {
				const p = JSON.parse(raw);
				if (p.selectedStatuses) selectedStatuses = new Set(p.selectedStatuses);
				// Only restore saved project if URL didn't specify one
				if (!fromUrl && p.selectedProject) selectedProject = p.selectedProject;
				if (p.selectedType) selectedType = p.selectedType;
				if ('selectedPriority' in p) selectedPriority = p.selectedPriority;
				if ('selectedAssignee' in p) selectedAssignee = p.selectedAssignee;
				if ('selectedLabel' in p) selectedLabel = p.selectedLabel;
				if ('selectedMilestone' in p) selectedMilestone = p.selectedMilestone;
				if ('selectedRequester' in p) selectedRequester = p.selectedRequester;
				if ('selectedApprover' in p) selectedApprover = p.selectedApprover;
				if (p.sortChips?.length) sortChips = p.sortChips;
				if (p.groupBy) groupBy = p.groupBy;
				if (Array.isArray(p.collapsedGroups)) collapsedGroups = new Set(p.collapsedGroups);
			}

			// If still 'all' (no URL param, no saved pref), default to the app's current project
			if (!fromUrl && selectedProject === 'all') {
				const appProject = get(availableProjects)[0];
				if (appProject) selectedProject = appProject;
			}
		} catch { /* parse error */ }
		prefsLoaded = true;
	}

	// Auto-save whenever filter/sort state changes
	$effect(() => {
		const _deps = [
			selectedProject, selectedType, selectedPriority, selectedAssignee,
			selectedLabel, selectedMilestone, selectedRequester, selectedApprover,
			[...selectedStatuses].join(','), JSON.stringify(sortChips),
			groupBy, [...collapsedGroups].join(','),
		];
		if (browser) savePrefs();
	});

	// ─── Saved Views ──────────────────────────────────────────────────────
	interface SavedViewFilters {
		statuses: TaskStatus[];
		project: string;
		type: string;
		priority: string;
		assignee: string;
		label: string;
		milestone: string;
		requester: string;
		approver: string;
		internal: 'all' | 'internal' | 'public';
		search: string;
		sortChips: SortChip[];
		groupBy?: GroupBy;
		collapsedGroups?: string[];
	}
	interface SavedView {
		id: string;
		name: string;
		filters: SavedViewFilters;
	}
	const SAVED_VIEWS_KEY = 'jat-open-tasks-saved-views';
	let savedViews = $state<SavedView[]>([]);
	let activeViewId = $state<string | null>(null);
	let showSaveDialog = $state(false);
	let savingViewName = $state('');
	let saveDialogInputEl = $state<HTMLInputElement | null>(null);
	let renamingViewId = $state<string | null>(null);
	let renamingViewName = $state('');
	let renameInputEl = $state<HTMLInputElement | null>(null);

	function captureCurrentFilters(): SavedViewFilters {
		return {
			statuses: [...selectedStatuses],
			project: selectedProject,
			type: selectedType,
			priority: selectedPriority,
			assignee: selectedAssignee,
			label: selectedLabel,
			milestone: selectedMilestone,
			requester: selectedRequester,
			approver: selectedApprover,
			internal: internalFilter,
			search: searchQuery,
			sortChips: sortChips.map(c => ({ ...c })),
			groupBy,
			collapsedGroups: [...collapsedGroups],
		};
	}

	function applyViewFilters(f: SavedViewFilters) {
		selectedStatuses = new Set(f.statuses);
		selectedProject = f.project;
		selectedType = f.type;
		selectedPriority = f.priority;
		selectedAssignee = f.assignee;
		selectedLabel = f.label;
		selectedMilestone = f.milestone;
		selectedRequester = f.requester;
		selectedApprover = f.approver;
		internalFilter = f.internal ?? 'all';
		searchQuery = f.search ?? '';
		if (f.sortChips?.length) sortChips = f.sortChips.map(c => ({ ...c }));
		groupBy = f.groupBy ?? 'none';
		collapsedGroups = new Set(Array.isArray(f.collapsedGroups) ? f.collapsedGroups : []);
	}

	function filtersEqual(a: SavedViewFilters, b: SavedViewFilters): boolean {
		if (a.project !== b.project) return false;
		if (a.type !== b.type) return false;
		if (a.priority !== b.priority) return false;
		if (a.assignee !== b.assignee) return false;
		if (a.label !== b.label) return false;
		if (a.milestone !== b.milestone) return false;
		if (a.requester !== b.requester) return false;
		if (a.approver !== b.approver) return false;
		if ((a.internal ?? 'all') !== (b.internal ?? 'all')) return false;
		if ((a.search ?? '') !== (b.search ?? '')) return false;
		if ((a.groupBy ?? 'none') !== (b.groupBy ?? 'none')) return false;
		if (a.statuses.length !== b.statuses.length) return false;
		const aSet = new Set(a.statuses);
		for (const s of b.statuses) if (!aSet.has(s)) return false;
		const aCol = a.collapsedGroups ?? [];
		const bCol = b.collapsedGroups ?? [];
		if (aCol.length !== bCol.length) return false;
		const aColSet = new Set(aCol);
		for (const k of bCol) if (!aColSet.has(k)) return false;
		const aChips = a.sortChips ?? [];
		const bChips = b.sortChips ?? [];
		if (aChips.length !== bChips.length) return false;
		for (let i = 0; i < aChips.length; i++) {
			if (aChips[i].field !== bChips[i].field || aChips[i].dir !== bChips[i].dir) return false;
		}
		return true;
	}

	function loadSavedViews() {
		if (!browser) return;
		try {
			const raw = localStorage.getItem(SAVED_VIEWS_KEY);
			if (raw) {
				const parsed = JSON.parse(raw);
				if (Array.isArray(parsed)) savedViews = parsed;
			}
			const activeRaw = localStorage.getItem(SAVED_VIEWS_KEY + ':active');
			if (activeRaw) {
				const view = savedViews.find(v => v.id === activeRaw);
				if (view) {
					applyViewFilters(view.filters);
					activeViewId = view.id;
				}
			}
		} catch { /* parse error */ }
	}

	function persistSavedViews() {
		if (!browser) return;
		try {
			localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(savedViews));
			if (activeViewId) localStorage.setItem(SAVED_VIEWS_KEY + ':active', activeViewId);
			else localStorage.removeItem(SAVED_VIEWS_KEY + ':active');
		} catch { /* quota */ }
	}

	function applySavedView(view: SavedView) {
		applyViewFilters(view.filters);
		activeViewId = view.id;
		persistSavedViews();
	}

	function applyAllOpenView() {
		clearFilters();
		activeViewId = null;
		persistSavedViews();
	}

	function openSaveDialog() {
		showSaveDialog = true;
		savingViewName = '';
		tick().then(() => saveDialogInputEl?.focus());
	}

	function closeSaveDialog() {
		showSaveDialog = false;
		savingViewName = '';
	}

	function confirmSaveView() {
		const name = savingViewName.trim();
		if (!name) return;
		const view: SavedView = {
			id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
			name,
			filters: captureCurrentFilters(),
		};
		savedViews = [...savedViews, view];
		activeViewId = view.id;
		persistSavedViews();
		closeSaveDialog();
	}

	function deleteView(id: string) {
		savedViews = savedViews.filter(v => v.id !== id);
		if (activeViewId === id) activeViewId = null;
		persistSavedViews();
	}

	function startRenameView(view: SavedView) {
		renamingViewId = view.id;
		renamingViewName = view.name;
		tick().then(() => {
			renameInputEl?.focus();
			renameInputEl?.select();
		});
	}

	function commitRenameView() {
		if (!renamingViewId) return;
		const name = renamingViewName.trim();
		if (name) {
			savedViews = savedViews.map(v => v.id === renamingViewId ? { ...v, name } : v);
			persistSavedViews();
		}
		renamingViewId = null;
		renamingViewName = '';
	}

	function cancelRenameView() {
		renamingViewId = null;
		renamingViewName = '';
	}

	function updateActiveView() {
		if (!activeViewId) return;
		savedViews = savedViews.map(v => v.id === activeViewId ? { ...v, filters: captureCurrentFilters() } : v);
		persistSavedViews();
	}

	const activeViewMatchesCurrent = $derived.by(() => {
		const snap: SavedViewFilters = {
			statuses: [...selectedStatuses],
			project: selectedProject,
			type: selectedType,
			priority: selectedPriority,
			assignee: selectedAssignee,
			label: selectedLabel,
			milestone: selectedMilestone,
			requester: selectedRequester,
			approver: selectedApprover,
			internal: internalFilter,
			search: searchQuery,
			sortChips: sortChips.map(c => ({ ...c })),
			groupBy,
			collapsedGroups: [...collapsedGroups],
		};
		if (!activeViewId) return false;
		const view = savedViews.find(v => v.id === activeViewId);
		if (!view) return false;
		return filtersEqual(view.filters, snap);
	});

	const allOpenViewActive = $derived(!activeViewId && !hasActiveFilters);

	// Inline editing state
	let editingCell = $state<{ taskId: string; field: string } | null>(null);
	let saving = $state<string | null>(null);

	// Due date picker state
	let dueDatePickerTaskId = $state<string | null>(null);
	let dueDatePickerPos = $state<{ x: number; y: number; anchorBottom: number; anchorTop: number } | null>(null);
	let dueDatePickerEl = $state<HTMLElement | null>(null);
	let dueDateTempValue = $state('');
	let dueDateTempTime = $state('');
	let dueDateSaving = $state(false);

	// Reposition picker after it renders using its actual height
	$effect(() => {
		if (!dueDatePickerEl || !dueDatePickerPos) return;
		const { anchorBottom, anchorTop, x } = dueDatePickerPos;
		const pickerHeight = dueDatePickerEl.offsetHeight;
		const spaceBelow = window.innerHeight - anchorBottom;
		let y = spaceBelow >= pickerHeight + 8
			? anchorBottom + 4
			: Math.max(8, anchorTop - pickerHeight - 4);
		if (dueDatePickerPos.y !== y) dueDatePickerPos = { ...dueDatePickerPos, y };
	});

	// Drawer state
	let drawerOpen = $state(false);
	let drawerTaskId = $state<string | null>(null);
	let drawerMode = $state<'view' | 'edit'>('view');

	// Context menu state
	interface Epic { id: string; title: string; status: string; priority: number; }
	let ctxTask = $state<Task | null>(null);
	let ctxX = $state(0);
	let ctxY = $state(0);
	let ctxVisible = $state(false);
	let statusSubmenuOpen = $state(false);
	let prioritySubmenuOpen = $state(false);
	let epicSubmenuOpen = $state(false);
	let projectSubmenuOpen = $state(false);
	let epics = $state<Epic[]>([]);
	let epicsLoading = $state(false);
	let showCreateEpic = $state(false);
	let newEpicTitle = $state('');
	let creatingEpic = $state(false);
	let newEpicInput: HTMLInputElement;

	// Column state
	let columnOrder = $state<string[]>(ALL_COLUMNS.map(c => c.id));
	let columnWidths = $state<Record<string, number>>({});
	let hiddenColumns = $state<Set<string>>(new Set());

	// Column resize state (guide line only — actual resize logic is in the columnResize action)
	let resizeGuideX = $state<number | null>(null);
	let tableContainerEl: HTMLElement | undefined = $state();

	// Virtual scroll
	const VIRT_ROW_HEIGHT = 40;
	const VIRT_BUFFER = 8;
	let virtScrollTop = $state(0);
	let virtContainerHeight = $state(600);
	const virtualWindow = $derived.by(() => {
		const start = Math.max(0, Math.floor(virtScrollTop / VIRT_ROW_HEIGHT) - VIRT_BUFFER);
		const end = Math.min(renderItems.length, Math.ceil((virtScrollTop + virtContainerHeight) / VIRT_ROW_HEIGHT) + VIRT_BUFFER);
		return {
			start,
			end,
			items: renderItems.slice(start, end),
			topPad: start * VIRT_ROW_HEIGHT,
			bottomPad: Math.max(0, (renderItems.length - end) * VIRT_ROW_HEIGHT),
		};
	});

	// Bulk selection
	let selectedTasks = $state<Set<string>>(new Set());
	let lastClickedTaskId = $state<string | null>(null);
	let bulkActionLoading = $state(false);
	let bulkActionError = $state('');
	let spawnProgress = $state('');
	let priorityDropdownOpen = $state(false);
	let harnessDropdownOpen = $state(false);
	let typeDropdownOpen = $state(false);
	let statusDropdownOpen = $state(false);
	let assignDropdownOpen = $state(false);
	let milestoneDropdownOpen = $state(false);
	let bulkEpicOpen = $state(false);

	// Filter dropdown refs (keyboard-triggered)
	let priorityFilterRef = $state<{ openDropdown: () => void } | null>(null);
	let typeFilterRef = $state<{ openDropdown: () => void } | null>(null);
	let assigneeFilterRef = $state<{ openDropdown: () => void } | null>(null);
	let labelFilterRef = $state<{ openDropdown: () => void } | null>(null);
	let milestoneFilterRef = $state<{ openDropdown: () => void } | null>(null);
	let statusFilterEl = $state<HTMLDetailsElement | null>(null);

	// Close status <details> dropdown when clicking outside
	$effect(() => {
		if (!statusFilterEl) return;
		function handlePointerDown(e: PointerEvent) {
			if (!statusFilterEl?.open) return;
			const target = e.target as HTMLElement;
			if (!target.closest('.status-dropdown-wrapper')) {
				statusFilterEl!.open = false;
			}
		}
		document.addEventListener('pointerdown', handlePointerDown);
		return () => document.removeEventListener('pointerdown', handlePointerDown);
	});

	let shortcutsOpen = $state(false);

	// Column header context menu
	let colCtxCol = $state<string | null>(null);
	let colCtxX = $state(0);
	let colCtxY = $state(0);
	let colCtxVisible = $state(false);

	function openColCtxMenu(e: MouseEvent, colId: string) {
		if (!['status', 'priority', 'type', 'assignee', 'milestone'].includes(colId)) return;
		e.preventDefault();
		colCtxCol = colId;
		colCtxX = e.clientX;
		colCtxY = e.clientY;
		colCtxVisible = true;
	}

	function closeColCtxMenu() { colCtxVisible = false; }

	function colCtxApply(action: () => void) {
		// Select all filtered tasks first, then run action
		selectedTasks = new Set(filteredTasks.map(t => t.id));
		closeColCtxMenu();
		// Defer so selectedTasks is committed before handler reads it
		setTimeout(action, 0);
	}
	let deleteArmed = $state(false);
	let deleteArmTimeout: ReturnType<typeof setTimeout> | null = null;

	// Column drag-reorder state
	let colDraggedIndex = $state<number | null>(null);
	let colDragOverIndex = $state<number | null>(null);

	// Load persisted column settings
	function loadColumnSettings() {
		if (!browser) return;
		const saved = loadColumnSettingsUtil('jat-open-tasks-columns', ALL_COLUMNS.map(c => c.id));
		if (!saved) {
			// First time — hide supplementary columns that aren't core defaults
			hiddenColumns = new Set(['status', 'milestone', 'created', 'updated', 'requester', 'source', 'page']);
			return;
		}
		columnOrder = saved.order;
		columnWidths = saved.widths;
		const hidden = new Set(saved.hidden);
		// Newly added columns not present in old saved order default to hidden
		for (const id of ['status', 'milestone', 'created', 'updated', 'requester', 'source', 'page']) {
			if (!(saved.order as string[]).includes(id)) hidden.add(id);
		}
		hiddenColumns = hidden;
		// sort state migrated to jat-open-tasks-prefs (sortChips)
	}

	function saveColumnSettings() {
		if (!browser) return;
		saveColumnSettingsUtil('jat-open-tasks-columns', {
			order: columnOrder,
			widths: columnWidths,
			hidden: [...hiddenColumns],
			// sort state in jat-open-tasks-prefs
		});
	}

	// Visible columns in order
	const visibleColumns = $derived.by(() => {
		return columnOrder
			.filter(id => !hiddenColumns.has(id))
			.map(id => ALL_COLUMNS.find(c => c.id === id)!)
			.filter(Boolean);
	});

	function getColWidth(col: ColDef): number {
		return columnWidths[col.id] || col.defaultWidth;
	}

	function getColStyle(col: ColDef): string {
		const w = getColWidth(col);
		if (w === 0) return ''; // flex column (title)
		return `width: ${w}px; min-width: ${col.minWidth}px;`;
	}

	// --- Column drag reorder (header) ---
	function handleColDragStart(index: number, e: DragEvent) {
		colDraggedIndex = index;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', String(index));
		}
	}

	function handleColDragOver(index: number, e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		colDragOverIndex = index;
	}

	function handleColDragEnd() {
		colDraggedIndex = null;
		colDragOverIndex = null;
	}

	function handleColDrop(index: number, e: DragEvent) {
		e.preventDefault();
		if (colDraggedIndex === null || colDraggedIndex === index) {
			handleColDragEnd();
			return;
		}
		// Map visible indices to columnOrder indices
		const visIds = visibleColumns.map(c => c.id);
		const draggedId = visIds[colDraggedIndex];
		const targetId = visIds[index];
		const newOrder = [...columnOrder];
		const fromIdx = newOrder.indexOf(draggedId);
		const toIdx = newOrder.indexOf(targetId);
		newOrder.splice(fromIdx, 1);
		newOrder.splice(toIdx, 0, draggedId);
		columnOrder = newOrder;
		handleColDragEnd();
		saveColumnSettings();
	}

	// --- Column visibility ---
	function toggleColumnVisibility(colId: string) {
		const newHidden = new Set(hiddenColumns);
		if (newHidden.has(colId)) {
			newHidden.delete(colId);
		} else {
			// Don't allow hiding all columns
			if (columnOrder.length - newHidden.size <= 1) return;
			newHidden.add(colId);
		}
		hiddenColumns = newHidden;
		saveColumnSettings();
	}

	// Derived: filtered + sorted tasks
	const filteredTasks = $derived.by(() => {
		let result = tasks;

		// Status multi-select
		if (selectedStatuses.size > 0) {
			result = result.filter(t => selectedStatuses.has(t.status as TaskStatus));
		}
		if (selectedProject !== 'all') {
			result = result.filter(t => t.project === selectedProject);
		}
		if (selectedType !== 'all') {
			result = result.filter(t => t.issue_type === selectedType);
		}
		if (selectedPriority !== '') {
			result = result.filter(t => String(t.priority) === selectedPriority);
		}
		if (selectedAssignee === '__unassigned__') {
			result = result.filter(t => !t.assignee);
		} else if (selectedAssignee !== '') {
			result = result.filter(t => t.assignee === selectedAssignee);
		}
		if (selectedLabel !== '') {
			result = result.filter(t => (t.labels ?? []).includes(selectedLabel));
		}
		if (selectedMilestone === '__none__') {
			result = result.filter(t => !t.milestone_id);
		} else if (selectedMilestone !== '') {
			result = result.filter(t => t.milestone_id === selectedMilestone);
		}
		if (selectedRequester !== '') {
			result = result.filter(t => {
				const r = t.requester;
				return r && (r.name === selectedRequester || r.email === selectedRequester);
			});
		}
		if (selectedApprover !== '') {
			result = result.filter(t => {
				const a = t.approver;
				return a && (a.name === selectedApprover || a.email === selectedApprover);
			});
		}
		if (internalFilter === 'internal') {
			result = result.filter(t => t.internal !== false);
		} else if (internalFilter === 'public') {
			result = result.filter(t => t.internal === false);
		}
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			const milestoneShorthand = q.match(/^m(\d+)$/);
			if (milestoneShorthand) {
				const idx = parseInt(milestoneShorthand[1]) - 1;
				const ms = sortedMilestones[idx];
				result = ms ? result.filter(t => t.milestone_id === ms.id) : [];
			} else {
				result = result.filter(t =>
					t.title.toLowerCase().includes(q) ||
					t.id.toLowerCase().includes(q) ||
					(t.description && t.description.toLowerCase().includes(q)) ||
					(t.labels && t.labels.some(l => l.toLowerCase().includes(q)))
				);
			}
		}

		// Multi-key sort from chips
		result = [...result].sort((a, b) => {
			for (const chip of sortChips) {
				const cmp = compareByField(a, b, chip.field);
				if (cmp !== 0) return chip.dir === 'asc' ? cmp : -cmp;
			}
			return 0;
		});

		return result;
	});

	// Group-by: collapse filtered rows into milestone/assignee/status groups
	type TaskGroup = { key: string; label: string; count: number; tasks: Task[] };
	const groupedRows = $derived.by<TaskGroup[] | null>(() => {
		if (groupBy === 'none') return null;
		const items = filteredTasks;
		const groups = new Map<string, TaskGroup>();

		if (groupBy === 'status') {
			for (const opt of STATUS_OPTIONS) {
				groups.set(opt.value, { key: opt.value, label: opt.label, count: 0, tasks: [] });
			}
			for (const t of items) {
				const k = t.status || 'open';
				let g = groups.get(k);
				if (!g) { g = { key: k, label: k, count: 0, tasks: [] }; groups.set(k, g); }
				g.tasks.push(t); g.count++;
			}
			return [...groups.values()].filter(g => g.count > 0);
		}

		if (groupBy === 'assignee') {
			for (const t of items) {
				const k = t.assignee || '__unassigned__';
				const label = t.assignee || 'Unassigned';
				let g = groups.get(k);
				if (!g) { g = { key: k, label, count: 0, tasks: [] }; groups.set(k, g); }
				g.tasks.push(t); g.count++;
			}
			return [...groups.values()].sort((a, b) => {
				if (a.key === '__unassigned__') return -1;
				if (b.key === '__unassigned__') return 1;
				return a.label.localeCompare(b.label);
			});
		}

		// milestone — use availableMilestones (carries real sort_order from /api/milestones).
		// Build sort_order map; tasks whose milestone_id isn't in the curated list
		// (legacy/orphaned) get sort_order=Infinity so they fall after curated ones.
		const orderById = new Map<string, number>();
		const nameById = new Map<string, string>();
		for (const m of availableMilestones) {
			orderById.set(m.id, m.sort_order ?? 9999);
			nameById.set(m.id, m.name);
		}
		for (const t of items) {
			const k = t.milestone_id || '__none__';
			const label = t.milestone_id
				? (nameById.get(t.milestone_id) || t.milestone_name || t.milestone_id)
				: 'No milestone';
			let g = groups.get(k);
			if (!g) { g = { key: k, label, count: 0, tasks: [] }; groups.set(k, g); }
			g.tasks.push(t); g.count++;
		}
		return [...groups.values()].sort((a, b) => {
			// "No milestone" pinned to the top (where unsorted/new work lives)
			if (a.key === '__none__') return -1;
			if (b.key === '__none__') return 1;
			const ao = orderById.get(a.key);
			const bo = orderById.get(b.key);
			// Both curated → use sort_order; one curated → curated first; neither → alpha
			if (ao !== undefined && bo !== undefined) return ao - bo;
			if (ao !== undefined) return -1;
			if (bo !== undefined) return 1;
			return a.label.localeCompare(b.label);
		});
	});

	type RenderItem = { type: 'header'; group: TaskGroup } | { type: 'task'; task: Task };
	const renderItems = $derived.by<RenderItem[]>(() => {
		const collapsed = collapsedGroups;
		const groups = groupedRows;
		if (groups) {
			const out: RenderItem[] = [];
			for (const group of groups) {
				out.push({ type: 'header', group });
				if (!collapsed.has(group.key)) {
					for (const t of group.tasks) out.push({ type: 'task', task: t });
				}
			}
			return out;
		}
		return filteredTasks.map(t => ({ type: 'task' as const, task: t }));
	});

	const taskTypes = $derived([...new Set(tasks.map(t => t.issue_type))].sort());

	// Stats
	const stats = $derived.by(() => {
		const total = filteredTasks.length;
		const withDueDate = filteredTasks.filter(t => t.due_date).length;
		const overdue = filteredTasks.filter(t => {
			if (!t.due_date) return false;
			return new Date(t.due_date) < new Date(new Date().toISOString().split('T')[0]);
		}).length;
		const p0p1 = filteredTasks.filter(t => t.priority <= 1).length;
		return { total, withDueDate, overdue, p0p1 };
	});

	// Bulk selection derived
	const selectionCount = $derived(selectedTasks.size);
	const allVisibleSelected = $derived.by(() => {
		const visible = filteredTasks;
		return visible.length > 0 && visible.every(t => selectedTasks.has(t.id));
	});
	const someVisibleSelected = $derived.by(() => {
		return filteredTasks.some(t => selectedTasks.has(t.id)) && !allVisibleSelected;
	});

	async function fetchMilestones(project: string) {
		if (!project || project === 'all') { availableMilestones = []; return; }
		try {
			const res = await fetch(`/api/milestones?project=${encodeURIComponent(project)}`);
			if (res.ok) {
				const data = await res.json();
				availableMilestones = data.milestones || [];
			}
		} catch { availableMilestones = []; }
	}

	// Fetch milestones whenever the project filter changes to a single project
	$effect(() => {
		const p = selectedProject;
		if (browser) fetchMilestones(p === 'all' ? '' : p);
	});

	async function setMilestone(taskId: string, milestoneId: string | null) {
		const prev = tasks.find(t => t.id === taskId);
		const prevMilestoneId = prev?.milestone_id ?? null;
		const prevMilestoneName = prev?.milestone_name ?? null;

		// Optimistic update
		tasks = tasks.map(t => t.id === taskId
			? { ...t,
				milestone_id: milestoneId || null,
				milestone_name: milestoneId ? (availableMilestones.find(m => m.id === milestoneId)?.name ?? null) : null
			}
			: t
		);

		try {
			const res = await fetch(`/api/tasks/${taskId}/milestone`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ milestone_id: milestoneId }),
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
		} catch (e) {
			// Roll back optimistic update
			tasks = tasks.map(t => t.id === taskId
				? { ...t, milestone_id: prevMilestoneId, milestone_name: prevMilestoneName }
				: t
			);
			addToast({ message: 'Failed to set milestone', type: 'error' });
		}
	}

	async function fetchTasks() {
		try {
			const res = await fetch('/api/tasks');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			tasks = (data.tasks || []).map((t: any) => ({
				...t,
				project: t.project || extractProject(t.id),
			}));
			// Extract unique projects from tasks
			const projectSet = new Set(tasks.map(t => t.project).filter(Boolean));
			// Also fetch all configured projects so Change Project submenu shows all options
			try {
				const projRes = await fetch('/api/projects?visible=true');
				if (projRes.ok) {
					const projData = await projRes.json();
					const configuredProjects: string[] = (projData.projects || []).map((p: any) => p.name || p.human_key || p.slug);
					for (const p of configuredProjects) if (p) projectSet.add(p);
				}
			} catch { /* ignore */ }
			projects = [...projectSet].sort();

			if (loading) {
				loading = false;
				fetchAndGetProjectColors(tasks);
			}
		} catch (e: any) {
			error = e.message;
			loading = false;
		}
	}

	function extractProject(id: string): string {
		const idx = id.lastIndexOf('-');
		return idx > 0 ? id.substring(0, idx) : id;
	}

	// Inline save
	async function saveField(taskId: string, field: string, value: any) {
		saving = taskId;
		try {
			const body: Record<string, any> = {};
			body[field] = value;
			const res = await fetch(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			// Update local state
			tasks = tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t);
		} catch (e: any) {
			console.error(`Failed to save ${field} for ${taskId}:`, e);
		} finally {
			saving = null;
			editingCell = null;
		}
	}

	function toggleSort(field: string) {
		const idx = sortChips.findIndex(c => c.field === field);
		if (idx >= 0) {
			sortChips = sortChips.map((c, i) => i === idx ? { ...c, dir: c.dir === 'asc' ? 'desc' : 'asc' } : c);
		} else {
			sortChips = [{ field, dir: 'asc' }, ...sortChips];
		}
		saveColumnSettings();
	}

	function openTaskDrawer(taskId: string) {
		drawerTaskId = taskId;
		drawerMode = 'view';
		drawerOpen = true;
	}

	// Compact relative/absolute date for created/updated columns
	function formatShortDate(ts: string | null | undefined): string {
		if (!ts) return '';
		try {
			const d = new Date(ts);
			if (isNaN(d.getTime())) return '';
			const now = new Date();
			const diffMs = now.getTime() - d.getTime();
			const diffMin = Math.floor(diffMs / 60000);
			if (diffMin < 1) return 'just now';
			if (diffMin < 60) return `${diffMin}m ago`;
			const diffHr = Math.floor(diffMin / 60);
			if (diffHr < 24) return `${diffHr}h ago`;
			const diffDay = Math.floor(diffHr / 24);
			if (diffDay === 1) return 'yesterday';
			if (diffDay < 7) return `${diffDay}d ago`;
			const sameYear = d.getFullYear() === now.getFullYear();
			return d.toLocaleDateString(undefined, sameYear
				? { month: 'short', day: 'numeric' }
				: { month: 'short', day: 'numeric', year: '2-digit' });
		} catch { return ''; }
	}

	// Return first letter of a person for the initials circle
	function getPersonInitial(person: Task['creator'] | string | null | undefined): string {
		if (!person) return '';
		if (typeof person === 'string') return person.charAt(0).toUpperCase();
		return ((person.name ?? person.email) ?? '').charAt(0).toUpperCase();
	}

	function getPersonLabel(person: Task['creator'] | string | null | undefined): string {
		if (!person) return '';
		if (typeof person === 'string') return person;
		return person.name ?? person.email ?? '';
	}

	function formatDueDate(date: string | null | undefined): string {
		if (!date) return '';
		try {
			// Parse date-only strings as local time (not UTC) by appending T00:00:00
			const d = new Date(date.includes('T') ? date : date + 'T00:00:00');
			if (isNaN(d.getTime())) return date;
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const target = new Date(d);
			target.setHours(0, 0, 0, 0);
			const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

			if (diffDays === 0) return 'Today';
			if (diffDays === 1) return 'Tomorrow';
			if (diffDays === -1) return 'Yesterday';
			if (diffDays < -1) return `${Math.abs(diffDays)}d overdue`;
			if (diffDays <= 7) return `${diffDays}d`;
			return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
		} catch {
			return date;
		}
	}

	function dueDateClass(date: string | null | undefined): string {
		if (!date) return '';
		try {
			const d = new Date(date.includes('T') ? date : date + 'T00:00:00');
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const target = new Date(d);
			target.setHours(0, 0, 0, 0);
			const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
			if (diffDays < 0) return 'overdue';
			if (diffDays <= 2) return 'due-soon';
			return 'due-normal';
		} catch {
			return '';
		}
	}

	function parseLabelsInput(value: string): string[] {
		return value.split(',').map(s => s.trim()).filter(Boolean);
	}

	function priorityLabel(p: number): string {
		switch (p) {
			case 0: return 'P0';
			case 1: return 'P1';
			case 2: return 'P2';
			case 3: return 'P3';
			case 4: return 'P4';
			default: return `P${p}`;
		}
	}

	function priorityColor(p: number): string {
		switch (p) {
			case 0: return 'oklch(0.70 0.20 25)';   // red
			case 1: return 'oklch(0.75 0.15 65)';   // orange
			case 2: return 'oklch(0.75 0.12 220)';  // blue
			case 3: return 'oklch(0.65 0.05 250)';  // gray
			case 4: return 'oklch(0.55 0.03 250)';  // dim gray
			default: return 'oklch(0.55 0.03 250)';
		}
	}

	function typeIcon(type: string): string {
		switch (type) {
			case 'bug': return '🐛';
			case 'feature': return '✨';
			case 'task': return '📋';
			case 'epic': return '🏔';
			case 'chore': return '🔄';
			default: return '📋';
		}
	}

	// Due date picker functions
	function openDueDatePicker(taskId: string, event: MouseEvent) {
		const task = tasks.find(t => t.id === taskId);
		if (!task) return;

		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const pickerWidth = 280;
		let x = rect.left;
		if (x + pickerWidth > window.innerWidth) x = window.innerWidth - pickerWidth - 8;
		if (x < 8) x = 8;

		// Store anchor coords; y will be finalized after the picker renders
		dueDatePickerTaskId = taskId;
		dueDatePickerPos = { x, y: rect.bottom + 4, anchorBottom: rect.bottom, anchorTop: rect.top };

		// Parse existing due date
		if (task.due_date) {
			const parts = task.due_date.split('T');
			dueDateTempValue = parts[0] || '';
			dueDateTempTime = parts[1]?.substring(0, 5) || '';
		} else {
			dueDateTempValue = '';
			dueDateTempTime = '';
		}
	}

	function closeDueDatePicker() {
		dueDatePickerTaskId = null;
		dueDatePickerPos = null;
		dueDatePickerEl = null;
		dueDateTempValue = '';
		dueDateTempTime = '';
	}

	function getQuickSetDays() {
		const days = [];
		const today = new Date();
		const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

		for (let i = 0; i < 7; i++) {
			const d = new Date(today);
			d.setDate(d.getDate() + i);
			const dateValue = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
			const dayNum = d.getDate();
			const label = i === 0 ? 'Today' : i === 1 ? 'Tmrw' : dayNames[d.getDay()];
			let badge = '';
			if (i === 0) badge = 'today';
			else if (i === 1) badge = 'tomorrow';

			days.push({ dateValue, dayNum, label, badge });
		}
		return days;
	}

	function quickSetDueDate(dateValue: string) {
		dueDateTempValue = dateValue;
	}

	async function saveDueDate() {
		if (!dueDatePickerTaskId || !dueDateTempValue) return;
		dueDateSaving = true;

		let value = dueDateTempValue;
		if (dueDateTempTime) {
			value = `${dueDateTempValue}T${dueDateTempTime}`;
		}

		await saveField(dueDatePickerTaskId, 'due_date', value);
		dueDateSaving = false;
		closeDueDatePicker();
	}

	async function clearDueDate() {
		if (!dueDatePickerTaskId) return;
		dueDateSaving = true;
		await saveField(dueDatePickerTaskId, 'due_date', null);
		dueDateSaving = false;
		closeDueDatePicker();
	}

	// --- Context menu ---
	function getProjectFromTaskId(taskId: string): string {
		const match = taskId.match(/^([a-zA-Z0-9_-]+?)-/);
		return match ? match[1].toLowerCase() : 'unknown';
	}

	function handleContextMenu(task: Task, event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		const menuWidth = 200;
		const menuHeight = 320;
		ctxTask = task;
		ctxX = Math.min(event.clientX, window.innerWidth - menuWidth - 8);
		ctxY = Math.min(event.clientY, window.innerHeight - menuHeight - 8);
		ctxVisible = true;
		statusSubmenuOpen = false;
		prioritySubmenuOpen = false;
		epicSubmenuOpen = false;
		projectSubmenuOpen = false;
	}

	function closeContextMenu() {
		ctxVisible = false;
		statusSubmenuOpen = false;
		prioritySubmenuOpen = false;
		epicSubmenuOpen = false;
		projectSubmenuOpen = false;
		showCreateEpic = false;
		newEpicTitle = '';
	}

	// Close context menu on click outside or Escape
	$effect(() => {
		if (!ctxVisible) return;
		function handleClick() { closeContextMenu(); }
		function handleKeyDown(e: KeyboardEvent) { if (e.key === 'Escape') closeContextMenu(); }
		const timer = setTimeout(() => {
			document.addEventListener('click', handleClick);
			document.addEventListener('keydown', handleKeyDown);
		}, 0);
		return () => {
			clearTimeout(timer);
			document.removeEventListener('click', handleClick);
			document.removeEventListener('keydown', handleKeyDown);
		};
	});

	// Clean up stale selections when tasks change
	$effect(() => {
		const allIds = new Set(tasks.map(t => t.id));
		const stale = [...selectedTasks].filter(id => !allIds.has(id));
		if (stale.length > 0) {
			const next = new Set(selectedTasks);
			for (const id of stale) next.delete(id);
			selectedTasks = next;
		}
	});

	// Close floating bar dropdowns on click outside
	$effect(() => {
		const anyOpen = priorityDropdownOpen || harnessDropdownOpen || typeDropdownOpen || statusDropdownOpen || assignDropdownOpen || milestoneDropdownOpen;
		if (!anyOpen) return;
		function handleClickOutside(e: MouseEvent) {
			const target = e.target as HTMLElement;
			if (!target.closest('.floating-dropdown-wrapper')) {
				closeBulkDropdowns();
			}
		}
		const timer = setTimeout(() => {
			document.addEventListener('click', handleClickOutside);
		}, 0);
		return () => {
			clearTimeout(timer);
			document.removeEventListener('click', handleClickOutside);
		};
	});

	async function ctxChangeStatus(taskId: string, newStatus: string) {
		closeContextMenu();
		try {
			const res = await fetch(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus }),
			});
			if (res.ok) {
				if (newStatus === 'closed') {
					tasks = tasks.filter(t => t.id !== taskId);
				} else {
					tasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
				}
			}
		} catch (err) { console.error('Failed to update status:', err); }
	}

	async function ctxChangePriority(taskId: string, newPriority: number) {
		closeContextMenu();
		tasks = tasks.map(t => t.id === taskId ? { ...t, priority: newPriority } : t);
		try {
			await fetch(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ priority: newPriority }),
			});
		} catch (err) { console.error('Failed to update priority:', err); }
	}

	async function ctxChangeProject(taskId: string, newProject: string) {
		closeContextMenu();
		try {
			const res = await fetch(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project: newProject }),
			});
			if (res.ok) {
				tasks = tasks.map(t => t.id === taskId ? { ...t, project: newProject } : t);
			}
		} catch (err) { console.error('Failed to change project:', err); }
	}

	async function ctxDuplicateTask(task: Task) {
		closeContextMenu();
		try {
			const res = await fetch('/api/tasks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: task.title,
					description: task.description || '',
					priority: task.priority,
					type: task.issue_type || 'task',
					project: task.project,
					labels: task.labels?.join(',') || '',
				}),
			});
			if (res.ok) fetchTasks();
		} catch (err) { console.error('Failed to duplicate task:', err); }
	}

	async function ctxDeleteTask(taskId: string) {
		closeContextMenu();
		if (!confirm(`Delete task ${taskId}? This cannot be undone.`)) return;
		try {
			const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
			if (res.ok) {
				tasks = tasks.filter(t => t.id !== taskId);
			}
		} catch (err) { console.error('Failed to delete task:', err); }
	}

	async function ctxSpawnTask(task: Task) {
		closeContextMenu();
		try {
			await fetch('/api/work/spawn', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ taskId: task.id, project: task.project }),
			});
		} catch (err) { console.error('Failed to spawn task:', err); }
	}

	async function fetchEpics(projectName: string) {
		if (!projectName) return;
		epicsLoading = true;
		try {
			const res = await fetch(`/api/epics?project=${projectName}`);
			if (res.ok) {
				const data = await res.json();
				epics = data.epics || [];
			}
		} catch (err) { console.error('Failed to fetch epics:', err); }
		finally { epicsLoading = false; }
	}

	async function ctxLinkToEpic(taskId: string, epicId: string) {
		closeContextMenu();
		try {
			const res = await fetch(`/api/tasks/${taskId}/epic`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ epicId }),
			});
			if (res.ok) fetchTasks();
		} catch (err) { console.error('Failed to link to epic:', err); }
	}

	async function ctxCreateEpic() {
		if (!ctxTask || creatingEpic || !newEpicTitle.trim()) return;
		creatingEpic = true;
		try {
			const project = getProjectFromTaskId(ctxTask.id);
			const res = await fetch('/api/epics', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: newEpicTitle.trim(),
					project,
					linkTaskId: ctxTask.id,
				}),
			});
			if (res.ok) {
				newEpicTitle = '';
				showCreateEpic = false;
				closeContextMenu();
				fetchTasks();
			}
		} catch (err) { console.error('Failed to create epic:', err); }
		finally { creatingEpic = false; }
	}

	// === Bulk Selection Functions ===
	function toggleTask(taskId: string, event?: MouseEvent) {
		const visible = filteredTasks;
		if (event?.shiftKey && lastClickedTaskId) {
			const ids = visible.map(t => t.id);
			const a = ids.indexOf(lastClickedTaskId);
			const b = ids.indexOf(taskId);
			if (a !== -1 && b !== -1) {
				const [start, end] = a < b ? [a, b] : [b, a];
				const next = new Set(selectedTasks);
				for (let i = start; i <= end; i++) next.add(ids[i]);
				selectedTasks = next;
				lastClickedTaskId = taskId;
				return;
			}
		}
		const next = new Set(selectedTasks);
		if (next.has(taskId)) {
			next.delete(taskId);
		} else {
			next.add(taskId);
		}
		selectedTasks = next;
		lastClickedTaskId = taskId;
	}

	function toggleAllVisible() {
		const visible = filteredTasks.map(t => t.id);
		const allSelected = visible.length > 0 && visible.every(id => selectedTasks.has(id));
		if (allSelected) {
			selectedTasks = new Set();
		} else {
			selectedTasks = new Set(visible);
		}
	}

	async function loadEpics() {
		try {
			const projects = new Set<string>(
				[...selectedTasks].map(id => id.includes('-') ? id.split('-')[0] : '').filter(Boolean)
			);
			if (selectedProject && selectedProject !== 'all') projects.add(selectedProject);
			const fetches = projects.size > 0
				? [...projects].map(p => fetch(`/api/tasks?status=open&limit=200&project=${encodeURIComponent(p)}`))
				: [fetch('/api/tasks?status=open&limit=200')];
			const results = await Promise.all(fetches);
			const all: typeof epics = [];
			for (const res of results) {
				if (res.ok) {
					const data = await res.json();
					for (const t of data.tasks || []) {
						if (t.issue_type === 'epic' && !all.find(e => e.id === t.id)) all.push(t);
					}
				}
			}
			epics = all;
		} catch { /* silent */ }
	}

	async function bulkAssignToEpic(epicId: string) {
		const ids = [...selectedTasks];
		if (!ids.length || bulkActionLoading) return;
		bulkActionLoading = true;
		const snap = ids.map(id => ({
			id,
			body: { parent_id: tasks.find(t => t.id === id)?.parent_id ?? null },
			endpoint: `/api/tasks/${id}/deps`
		}));
		let success = 0;
		try {
			for (const id of ids) {
				try {
					const res = await fetch(`/api/tasks/${id}/deps`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ parentId: epicId, childId: id })
					});
					if (res.ok) success++;
				} catch { /* continue */ }
			}
			showUndoToast(
				`Assigned ${success} task${success === 1 ? '' : 's'} to epic`,
				() => revertTasks(snap)
			);
			clearSelection();
			fetchTasks();
		} finally {
			bulkActionLoading = false;
			bulkEpicOpen = false;
		}
	}

	function closeBulkDropdowns() {
		priorityDropdownOpen = false;
		harnessDropdownOpen = false;
		typeDropdownOpen = false;
		statusDropdownOpen = false;
		assignDropdownOpen = false;
		milestoneDropdownOpen = false;
		bulkEpicOpen = false;
	}

	function clearSelection() {
		selectedTasks = new Set();
		lastClickedTaskId = null;
		closeBulkDropdowns();
		if (deleteArmTimeout) clearTimeout(deleteArmTimeout);
		deleteArmed = false;
	}

	// === Undo helpers ===
	function showUndoToast(message: string, undoFn: () => Promise<void>) {
		addToast({
			message,
			type: 'success',
			duration: 6000,
			action: { label: 'Undo', onClick: () => { undoFn().catch(() => {}); } }
		});
	}

	async function revertTasks(items: Array<{ id: string; body: Record<string, unknown>; endpoint?: string }>) {
		await bulkApiOperation(items.map(i => i.id), async (taskId) => {
			const item = items.find(x => x.id === taskId);
			if (!item) return;
			const url = item.endpoint ?? `/api/tasks/${taskId}`;
			const res = await fetchWithTimeout(url, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(item.body)
			});
			if (!res.ok) throw new Error(await handleApiError(res, `undo ${taskId}`));
		});
		fetchTasks();
	}

	// === Bulk Actions ===
	async function handleBulkDelete() {
		const ids = [...selectedTasks];
		if (ids.length === 0) return;
		if (!deleteArmed) { armDelete(); return; }
		deleteArmed = false;
		if (deleteArmTimeout) { clearTimeout(deleteArmTimeout); deleteArmTimeout = null; }
		bulkActionLoading = true;
		bulkActionError = '';
		try {
			const result = await bulkApiOperation(ids, async (taskId) => {
				const response = await fetchWithTimeout(`/api/tasks/${taskId}`, createDeleteRequest());
				if (!response.ok) {
					throw new Error(await handleApiError(response, `delete task ${taskId}`));
				}
			});
			if (!result.success) {
				bulkActionError = formatBulkResultMessage(result, 'task');
			}
			clearSelection();
			fetchTasks();
		} catch (err) {
			bulkActionError = err instanceof Error ? err.message : String(err);
		} finally {
			bulkActionLoading = false;
		}
	}

	async function handleBulkClose() {
		const ids = [...selectedTasks];
		if (ids.length === 0) return;
		const snap = ids.map(id => ({ id, body: { status: tasks.find(t => t.id === id)?.status || 'open' } }));
		bulkActionLoading = true;
		bulkActionError = '';
		try {
			const result = await bulkApiOperation(ids, async (taskId) => {
				const response = await fetchWithTimeout(`/api/tasks/${taskId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ status: 'closed' })
				});
				if (!response.ok) throw new Error(await handleApiError(response, `close task ${taskId}`));
			});
			if (!result.success) bulkActionError = formatBulkResultMessage(result, 'task');
			clearSelection();
			fetchTasks();
			showUndoToast(`Closed ${ids.length} task${ids.length !== 1 ? 's' : ''}`, () => revertTasks(snap));
		} catch (err) {
			bulkActionError = err instanceof Error ? err.message : String(err);
		} finally {
			bulkActionLoading = false;
		}
	}

	async function handleBulkSpawn() {
		const ids = [...selectedTasks];
		if (ids.length === 0) return;
		if (!confirm(`Spawn ${ids.length} agent${ids.length > 1 ? 's' : ''}? One per selected task.`)) return;
		bulkActionLoading = true;
		bulkActionError = '';
		spawnProgress = `Spawning 0/${ids.length}...`;
		try {
			const results = await spawnInBatches(ids, {
				onSpawn(result: SpawnResult, index: number, total: number) {
					spawnProgress = `Spawning ${index + 1}/${total}...`;
				},
				onBatchComplete(batchResults: SpawnResult[], batchIndex: number, totalBatches: number) {
					if (totalBatches > 1) {
						spawnProgress = `Batch ${batchIndex + 1}/${totalBatches} done...`;
					}
				}
			});
			const succeeded = results.filter(r => r.success).length;
			const failed = results.filter(r => !r.success);
			if (failed.length === 0) {
				addToast({ message: `Spawned ${succeeded} agent${succeeded !== 1 ? 's' : ''}`, type: 'success' });
			} else if (succeeded > 0) {
				addToast({ message: `Spawned ${succeeded}/${results.length} (${failed.length} failed)`, type: 'warning' });
			} else {
				const firstError = failed[0]?.error || 'Unknown error';
				addToast({ message: `Spawn failed: ${firstError}`, type: 'error' });
			}
			clearSelection();
		} catch (err) {
			bulkActionError = err instanceof Error ? err.message : String(err);
		} finally {
			bulkActionLoading = false;
			spawnProgress = '';
		}
	}

	async function handleBulkPriority(priority: number) {
		const ids = [...selectedTasks];
		if (ids.length === 0) return;
		priorityDropdownOpen = false;
		const snap = ids.map(id => ({ id, body: { priority: tasks.find(t => t.id === id)?.priority ?? 2 } }));
		bulkActionLoading = true;
		bulkActionError = '';
		try {
			const result = await bulkApiOperation(ids, async (taskId) => {
				const response = await fetchWithTimeout(`/api/tasks/${taskId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ priority })
				});
				if (!response.ok) throw new Error(await handleApiError(response, `update priority for ${taskId}`));
			});
			if (!result.success) bulkActionError = formatBulkResultMessage(result, 'task');
			clearSelection();
			fetchTasks();
			showUndoToast(`Set ${ids.length} task${ids.length !== 1 ? 's' : ''} to P${priority}`, () => revertTasks(snap));
		} catch (err) {
			bulkActionError = err instanceof Error ? err.message : String(err);
		} finally {
			bulkActionLoading = false;
		}
	}

	async function handleBulkHarness(agentId: string) {
		const ids = [...selectedTasks];
		if (ids.length === 0) return;
		harnessDropdownOpen = false;
		bulkActionLoading = true;
		bulkActionError = '';
		try {
			const result = await bulkApiOperation(ids, async (taskId) => {
				const response = await fetchWithTimeout(`/api/tasks/${taskId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ agent_program: agentId === 'claude-code' ? null : agentId })
				});
				if (!response.ok) {
					throw new Error(await handleApiError(response, `update harness for ${taskId}`));
				}
			});
			if (!result.success) {
				bulkActionError = formatBulkResultMessage(result, 'task');
			}
			clearSelection();
			fetchTasks();
		} catch (err) {
			bulkActionError = err instanceof Error ? err.message : String(err);
		} finally {
			bulkActionLoading = false;
		}
	}

	async function handleBulkType(issueType: string) {
		const ids = [...selectedTasks];
		if (ids.length === 0) return;
		typeDropdownOpen = false;
		const snap = ids.map(id => ({ id, body: { type: tasks.find(t => t.id === id)?.issue_type || 'task' } }));
		bulkActionLoading = true;
		bulkActionError = '';
		try {
			const result = await bulkApiOperation(ids, async (taskId) => {
				const response = await fetchWithTimeout(`/api/tasks/${taskId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ type: issueType })
				});
				if (!response.ok) throw new Error(await handleApiError(response, `update type for ${taskId}`));
			});
			if (!result.success) bulkActionError = formatBulkResultMessage(result, 'task');
			clearSelection();
			fetchTasks();
			showUndoToast(`Set ${ids.length} task${ids.length !== 1 ? 's' : ''} to ${issueType}`, () => revertTasks(snap));
		} catch (err) {
			bulkActionError = err instanceof Error ? err.message : String(err);
		} finally {
			bulkActionLoading = false;
		}
	}

	async function handleBulkStatus(status: string) {
		const ids = [...selectedTasks];
		if (ids.length === 0) return;
		statusDropdownOpen = false;
		const snap = ids.map(id => ({ id, body: { status: tasks.find(t => t.id === id)?.status || 'open' } }));
		bulkActionLoading = true;
		bulkActionError = '';
		try {
			const result = await bulkApiOperation(ids, async (taskId) => {
				const response = await fetchWithTimeout(`/api/tasks/${taskId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ status })
				});
				if (!response.ok) throw new Error(await handleApiError(response, `update status for ${taskId}`));
			});
			if (!result.success) bulkActionError = formatBulkResultMessage(result, 'task');
			clearSelection();
			fetchTasks();
			showUndoToast(`Set ${ids.length} task${ids.length !== 1 ? 's' : ''} to ${status}`, () => revertTasks(snap));
		} catch (err) {
			bulkActionError = err instanceof Error ? err.message : String(err);
		} finally {
			bulkActionLoading = false;
		}
	}

	async function handleBulkAssign(assignee: string | null) {
		const ids = [...selectedTasks];
		if (ids.length === 0) return;
		assignDropdownOpen = false;
		const snap = ids.map(id => ({ id, body: { assignee: tasks.find(t => t.id === id)?.assignee || '' } }));
		bulkActionLoading = true;
		bulkActionError = '';
		try {
			const result = await bulkApiOperation(ids, async (taskId) => {
				const response = await fetchWithTimeout(`/api/tasks/${taskId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ assignee: assignee || '' })
				});
				if (!response.ok) throw new Error(await handleApiError(response, `assign ${taskId}`));
			});
			if (!result.success) bulkActionError = formatBulkResultMessage(result, 'task');
			clearSelection();
			fetchTasks();
			const label = assignee || 'unassigned';
			showUndoToast(`${ids.length} task${ids.length !== 1 ? 's' : ''} → ${label}`, () => revertTasks(snap));
		} catch (err) {
			bulkActionError = err instanceof Error ? err.message : String(err);
		} finally {
			bulkActionLoading = false;
		}
	}

	async function handleBulkMilestone(milestoneId: string | null) {
		const ids = [...selectedTasks];
		if (ids.length === 0) return;
		milestoneDropdownOpen = false;
		const snap = ids.map(id => ({
			id,
			body: { milestone_id: tasks.find(t => t.id === id)?.milestone_id ?? null },
			endpoint: `/api/tasks/${id}/milestone`
		}));
		bulkActionLoading = true;
		bulkActionError = '';
		try {
			const result = await bulkApiOperation(ids, async (taskId) => {
				const response = await fetchWithTimeout(`/api/tasks/${taskId}/milestone`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ milestone_id: milestoneId })
				});
				if (!response.ok) throw new Error(await handleApiError(response, `set milestone for ${taskId}`));
			});
			if (!result.success) bulkActionError = formatBulkResultMessage(result, 'task');
			clearSelection();
			fetchTasks();
			const mName = milestoneId ? (bulkMilestoneOptions.find(m => m.id === milestoneId)?.name || milestoneId) : 'no milestone';
			showUndoToast(`${ids.length} task${ids.length !== 1 ? 's' : ''} → ${mName}`, () => revertTasks(snap));
		} catch (err) {
			bulkActionError = err instanceof Error ? err.message : String(err);
		} finally {
			bulkActionLoading = false;
		}
	}

	async function handleBulkPromote() {
		const ids = [...selectedTasks];
		if (ids.length === 0) return;
		const snap = ids.map(id => ({ id, body: { status: tasks.find(t => t.id === id)?.status || 'open' } }));
		bulkActionLoading = true;
		bulkActionError = '';
		try {
			const result = await bulkApiOperation(ids, async (taskId) => {
				const response = await fetchWithTimeout(`/api/tasks/${taskId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ status: 'open' })
				});
				if (!response.ok) throw new Error(await handleApiError(response, `promote ${taskId}`));
			});
			if (!result.success) bulkActionError = formatBulkResultMessage(result, 'task');
			clearSelection();
			fetchTasks();
			showUndoToast(`Promoted ${ids.length} task${ids.length !== 1 ? 's' : ''}`, () => revertTasks(snap));
		} catch (err) {
			bulkActionError = err instanceof Error ? err.message : String(err);
		} finally {
			bulkActionLoading = false;
		}
	}

	async function ctxToggleInternal(task: Task) {
		closeContextMenu();
		const newInternal = !(task.internal ?? true);
		tasks = tasks.map(t => t.id === task.id ? { ...t, internal: newInternal } : t);
		try {
			const response = await fetch(`/api/tasks/${task.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ internal: newInternal }),
			});
			if (!response.ok) {
				tasks = tasks.map(t => t.id === task.id ? { ...t, internal: task.internal } : t);
			}
		} catch (err) {
			tasks = tasks.map(t => t.id === task.id ? { ...t, internal: task.internal } : t);
			console.error('Failed to update internal flag:', err);
		}
	}

	async function handleBulkHide() {
		const ids = [...selectedTasks];
		if (ids.length === 0) return;
		const snap = ids.map(id => ({ id, body: { internal: tasks.find(t => t.id === id)?.internal ?? true } }));
		bulkActionLoading = true;
		bulkActionError = '';
		try {
			const result = await bulkApiOperation(ids, async (taskId) => {
				const response = await fetchWithTimeout(`/api/tasks/${taskId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ internal: true })
				});
				if (!response.ok) throw new Error(await handleApiError(response, `hide ${taskId}`));
			});
			if (!result.success) bulkActionError = formatBulkResultMessage(result, 'task');
			clearSelection();
			tasks = tasks.filter(t => !ids.includes(t.id));
			showUndoToast(`Hidden ${ids.length} task${ids.length !== 1 ? 's' : ''}`, () => revertTasks(snap));
		} catch (err) {
			bulkActionError = err instanceof Error ? err.message : String(err);
		} finally {
			bulkActionLoading = false;
		}
	}

	async function handleBulkPublish() {
		const ids = [...selectedTasks];
		if (ids.length === 0) return;
		const snap = ids.map(id => ({ id, body: { internal: tasks.find(t => t.id === id)?.internal ?? true } }));
		bulkActionLoading = true;
		bulkActionError = '';
		try {
			const result = await bulkApiOperation(ids, async (taskId) => {
				const response = await fetchWithTimeout(`/api/tasks/${taskId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ internal: false })
				});
				if (!response.ok) throw new Error(await handleApiError(response, `publish ${taskId}`));
			});
			if (!result.success) bulkActionError = formatBulkResultMessage(result, 'task');
			clearSelection();
			fetchTasks();
			showUndoToast(`Published ${ids.length} task${ids.length !== 1 ? 's' : ''}`, () => revertTasks(snap));
		} catch (err) {
			bulkActionError = err instanceof Error ? err.message : String(err);
		} finally {
			bulkActionLoading = false;
		}
	}

	function copyTaskIds() {
		const ids = [...selectedTasks].join(' ');
		navigator.clipboard.writeText(ids).then(() => {
			addToast({ message: `Copied ${selectedTasks.size} task ID${selectedTasks.size !== 1 ? 's' : ''}`, type: 'info', duration: 3000 });
		});
	}

	function exportCSV() {
		const selected = tasks.filter(t => selectedTasks.has(t.id));
		const headers = ['ID', 'Title', 'Status', 'Priority', 'Type', 'Project', 'Assignee', 'Milestone', 'Due Date', 'Labels', 'Source', 'Page'];
		const rows = selected.map(t => [
			t.id,
			`"${(t.title || '').replace(/"/g, '""')}"`,
			t.status,
			`P${t.priority}`,
			t.issue_type,
			t.project,
			t.assignee || '',
			t.milestone_name || '',
			t.due_date || '',
			(t.labels || []).join(';'),
			t.source || '',
			formatPageUrl(getTaskPageUrl(t)),
		].join(','));
		const csv = [headers.join(','), ...rows].join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `tasks-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
		addToast({ message: `Exported ${selected.length} task${selected.length !== 1 ? 's' : ''} as CSV`, type: 'success', duration: 3000 });
	}

	function armDelete() {
		if (deleteArmTimeout) clearTimeout(deleteArmTimeout);
		deleteArmed = true;
		deleteArmTimeout = setTimeout(() => { deleteArmed = false; }, 4000);
	}

	let unregisterVoice: (() => void) | null = null;

	function setStatusOnly(s: TaskStatus) {
		selectedStatuses = new Set([s]);
	}

	onMount(() => {
		if (browser) {
			loadColumnSettings();
			loadPrefs();
			loadSavedViews();
			fetchTasks();
			pollInterval = setInterval(fetchTasks, 10000);
			unregisterVoice = addVoiceActionHandlers({
				'open-tasks-status-open': () => setStatusOnly('open'),
				'open-tasks-status-in-progress': () => setStatusOnly('in_progress'),
				'open-tasks-status-waiting': () => setStatusOnly('waiting'),
				'open-tasks-status-blocked': () => setStatusOnly('blocked'),
				'open-tasks-status-submitted': () => setStatusOnly('submitted'),
				'open-tasks-status-accepted': () => setStatusOnly('accepted'),
				'open-tasks-status-closed': () => setStatusOnly('closed'),
				'open-tasks-status-reset': () => resetStatuses(),
				'open-tasks-priority-0': () => { selectedPriority = '0'; },
				'open-tasks-priority-1': () => { selectedPriority = '1'; },
				'open-tasks-priority-2': () => { selectedPriority = '2'; },
				'open-tasks-priority-3': () => { selectedPriority = '3'; },
				'open-tasks-priority-4': () => { selectedPriority = '4'; },
				'open-tasks-priority-reset': () => { selectedPriority = ''; },
				'open-tasks-type-bug': () => { selectedType = 'bug'; },
				'open-tasks-type-feature': () => { selectedType = 'feature'; },
				'open-tasks-type-task': () => { selectedType = 'task'; },
				'open-tasks-type-epic': () => { selectedType = 'epic'; },
				'open-tasks-type-chore': () => { selectedType = 'chore'; },
				'open-tasks-type-reset': () => { selectedType = 'all'; },
				'open-tasks-assignee-unassigned': () => { selectedAssignee = '__unassigned__'; },
				'open-tasks-assignee-reset': () => { selectedAssignee = ''; },
				'open-tasks-clear-all': () => clearFilters(),
			});
		}
	});

	onDestroy(() => {
		if (pollInterval) clearInterval(pollInterval);
		unregisterVoice?.();
	});
</script>

<svelte:window onkeydown={handlePageKeydown} />

<svelte:head>
	<title>Tasks | JAT</title>
</svelte:head>

<datalist id="opentasks-assignee-suggestions">
	{#each allAssignees as name}
		<option value={name}></option>
	{/each}
</datalist>

<datalist id="opentasks-label-suggestions">
	{#each allLabels as label}
		<option value={label}></option>
	{/each}
</datalist>

<div class="open-tasks-page">
	<!-- Header + Saved Views combined row -->
	<div class="page-header" role="tablist" aria-label="Saved views">
		<h1 class="page-title">Tasks</h1>
		<button
			type="button"
			class="view-tab"
			class:view-tab-active={allOpenViewActive}
			role="tab"
			aria-selected={allOpenViewActive}
			onclick={applyAllOpenView}
			title="Reset to default open-tasks view"
		>
			All Open
		</button>

		{#each savedViews as view (view.id)}
			{@const isActive = activeViewId === view.id}
			{@const isModified = isActive && !activeViewMatchesCurrent}
			<div class="view-tab-wrapper" class:view-tab-wrapper-active={isActive}>
				{#if renamingViewId === view.id}
					<input
						bind:this={renameInputEl}
						bind:value={renamingViewName}
						class="view-tab-rename-input"
						onkeydown={(e) => {
							if (e.key === 'Enter') { e.preventDefault(); commitRenameView(); }
							else if (e.key === 'Escape') { e.preventDefault(); cancelRenameView(); }
						}}
						onblur={commitRenameView}
						maxlength={40}
					/>
				{:else}
					<button
						type="button"
						class="view-tab"
						class:view-tab-active={isActive}
						role="tab"
						aria-selected={isActive}
						ondblclick={() => startRenameView(view)}
						onclick={() => applySavedView(view)}
						title="{view.name}{isModified ? ' (modified — double-click to rename)' : ' (double-click to rename)'}"
					>
						<span class="view-tab-name">{view.name}</span>
						{#if isModified}
							<span class="view-tab-modified-dot" aria-label="Modified" title="Filters differ from saved view">●</span>
						{/if}
					</button>
					{#if isActive && isModified}
						<button
							type="button"
							class="view-tab-action"
							onclick={updateActiveView}
							title="Update saved view with current filters"
							aria-label="Update view"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>
						</button>
					{/if}
					<button
						type="button"
						class="view-tab-action view-tab-delete"
						onclick={(e) => { e.stopPropagation(); deleteView(view.id); }}
						title="Delete this saved view"
						aria-label="Delete view"
					>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
					</button>
				{/if}
			</div>
		{/each}

		{#if showSaveDialog}
			<div class="view-tab-save-dialog">
				<input
					bind:this={saveDialogInputEl}
					bind:value={savingViewName}
					class="view-tab-rename-input"
					placeholder="View name…"
					maxlength={40}
					onkeydown={(e) => {
						if (e.key === 'Enter') { e.preventDefault(); confirmSaveView(); }
						else if (e.key === 'Escape') { e.preventDefault(); closeSaveDialog(); }
					}}
				/>
				<button type="button" class="view-tab-action" onclick={confirmSaveView} disabled={!savingViewName.trim()} title="Save view">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>
				</button>
				<button type="button" class="view-tab-action view-tab-delete" onclick={closeSaveDialog} title="Cancel">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
				</button>
			</div>
		{:else}
			<button
				type="button"
				class="view-tab view-tab-add"
				onclick={openSaveDialog}
				disabled={!hasActiveFilters && savedViews.length === 0}
				title={hasActiveFilters ? 'Save current filters as a new view' : 'Adjust some filters first, then save them as a view'}
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
				Save current
			</button>
		{/if}

		{#if !loading}
			<div class="stats-row">
				<span class="stat">{stats.total} tasks</span>
				{#if stats.p0p1 > 0}
					<span class="stat stat-urgent">{stats.p0p1} high priority</span>
				{/if}
				{#if stats.overdue > 0}
					<span class="stat stat-overdue">{stats.overdue} overdue</span>
				{/if}
				{#if stats.withDueDate > 0}
					<span class="stat">{stats.withDueDate} with due dates</span>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Filters -->
	<div class="filters-bar">
		<!-- Row 1: Search + Status multi-select + core filters -->
		<div class="filter-row">
			<input
				type="text"
				class="search-input"
				placeholder="Search… or m1, m2, m3"
				bind:value={searchQuery}
				bind:this={searchInputEl}
			/>
			{#if activeMilestoneShorthand}
				<span class="milestone-shorthand-badge" class:milestone-shorthand-miss={!activeMilestoneShorthand.label}>
					{#if activeMilestoneShorthand.label}
						→ {activeMilestoneShorthand.label}
					{:else}
						m{activeMilestoneShorthand.num} not found
					{/if}
				</span>
			{/if}

			<!-- Status multi-select dropdown -->
			<div class="status-dropdown-wrapper">
				<details class="status-dropdown" bind:this={statusFilterEl}>
					<summary class="status-dropdown-trigger">
						<span class="status-dropdown-label">
							{#if selectedStatuses.size === STATUS_OPTIONS.length}
								All Statuses
							{:else if selectedStatuses.size === 0}
								No Statuses
							{:else}
								{selectedStatuses.size} of {STATUS_OPTIONS.length}
							{/if}
						</span>
						<svg class="status-dropdown-caret" viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
							<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
						</svg>
					</summary>
					<div class="status-dropdown-menu">
						<div class="status-dropdown-controls">
							<button type="button" onclick={selectAllStatuses} class="sd-ctrl-btn">All</button>
							<button type="button" onclick={resetStatuses} class="sd-ctrl-btn">Default</button>
							<button type="button" onclick={clearAllStatuses} class="sd-ctrl-btn">None</button>
						</div>
						{#each STATUS_OPTIONS as opt}
							<label class="status-option">
								<input
									type="checkbox"
									checked={selectedStatuses.has(opt.value)}
									onchange={() => toggleStatus(opt.value)}
								/>
								<span class="status-option-label">{opt.label}</span>
								{#if statusCounts[opt.value]}
									<span class="status-option-count">{statusCounts[opt.value]}</span>
								{/if}
							</label>
						{/each}
					</div>
				</details>
			</div>

			<!-- Project -->
			<div class="project-dropdown-wrapper">
				<SearchDropdown
					value={selectedProject}
					groups={projectDropdownGroups}
					placeholder="All Projects"
					colorFn={(v) => v !== 'all' ? getProjectColor(v + '-x') : undefined}
					variant="chip"
					onChange={(v) => { selectedProject = v; }}
				>
					{#snippet footer()}
						<button class="sd-add-project" onclick={() => openProjectDrawer()}>
							<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
							</svg>
							<span>Add Project</span>
						</button>
					{/snippet}
				</SearchDropdown>
			</div>

			<!-- Priority -->
			<SearchDropdown
				bind:this={priorityFilterRef}
				value={selectedPriority}
				groups={priorityGroups}
				placeholder="All Priorities"
				onChange={(v) => { selectedPriority = v; }}
			/>

			<!-- Type -->
			<SearchDropdown
				bind:this={typeFilterRef}
				value={selectedType}
				groups={typeDropdownGroups}
				placeholder="All Types"
				onChange={(v) => { selectedType = v; }}
			/>

			<!-- Conditional: Assignee -->
			{#if hasAssignees}
				<SearchDropdown
					bind:this={assigneeFilterRef}
					value={selectedAssignee}
					groups={assigneeGroups}
					placeholder="All Assignees"
					onChange={(v) => { selectedAssignee = v; }}
				/>
			{/if}

			<!-- Conditional: Labels -->
			{#if hasLabels}
				<SearchDropdown
					bind:this={labelFilterRef}
					value={selectedLabel}
					groups={labelGroups}
					placeholder="All Labels"
					onChange={(v) => { selectedLabel = v; }}
				/>
			{/if}

			<!-- Milestone (always shown — postgres projects always have milestones) -->
			<SearchDropdown
				bind:this={milestoneFilterRef}
				value={selectedMilestone}
				groups={milestoneGroups}
				placeholder="All Milestones"
				onChange={(v) => { selectedMilestone = v; }}
			/>

			<!-- Conditional: Requester -->
			{#if hasRequesters}
				<SearchDropdown
					value={selectedRequester}
					groups={requesterGroups}
					placeholder="All Requesters"
					onChange={(v) => { selectedRequester = v; }}
				/>
			{/if}

			<!-- Conditional: Approver -->
			{#if hasApprovers}
				<SearchDropdown
					value={selectedApprover}
					groups={approverGroups}
					placeholder="All Approvers"
					onChange={(v) => { selectedApprover = v; }}
				/>
			{/if}

			<!-- Internal / Public filter -->
			<div class="internal-filter-toggle">
				<button
					class="internal-filter-btn"
					class:active={internalFilter === 'all'}
					onclick={() => internalFilter = 'all'}
					title="Show all tasks"
				>All</button>
				<button
					class="internal-filter-btn"
					class:active={internalFilter === 'internal'}
					onclick={() => internalFilter = 'internal'}
					title="Show only dev-internal tasks"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
					Internal
				</button>
				<button
					class="internal-filter-btn"
					class:active={internalFilter === 'public'}
					onclick={() => internalFilter = 'public'}
					title="Show only client-visible tasks"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
					Public
				</button>
			</div>

			<!-- Clear all filters -->
			{#if hasActiveFilters}
				<button type="button" class="clear-filters-btn" onclick={clearFilters}>
					Clear
				</button>
			{/if}

		</div>

		<!-- Sort chips row -->
		<div class="sort-row">
			<span class="sort-row-label">Group</span>
			<select class="group-by-select" bind:value={groupBy} title="Group rows by">
				{#each GROUP_BY_OPTIONS as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
			{#if groupBy !== 'none' && groupedRows && groupedRows.length > 0}
				<button
					type="button"
					class="group-collapse-all-btn"
					onclick={() => {
						const allKeys = (groupedRows ?? []).map(g => g.key);
						const allCollapsed = allKeys.every(k => collapsedGroups.has(k));
						collapsedGroups = allCollapsed ? new Set() : new Set(allKeys);
					}}
					title="Collapse or expand all groups"
				>
					{(groupedRows ?? []).every(g => collapsedGroups.has(g.key)) ? 'Expand all' : 'Collapse all'}
				</button>
			{/if}

			<span class="sort-row-divider"></span>
			<span class="sort-row-label">Sort</span>

			{#each sortChips as chip, i}
				<div
					class="sort-chip"
					class:sort-chip-drag-over={chipDragOverIdx === i && chipDragIdx !== null && chipDragIdx !== i}
					class:sort-chip-dragging={chipDragIdx === i}
					draggable="true"
					ondragstart={(e) => handleChipDragStart(i, e)}
					ondragover={(e) => handleChipDragOver(i, e)}
					ondragend={handleChipDragEnd}
					ondrop={(e) => handleChipDrop(i, e)}
					role="group"
				>
					<span class="sort-chip-grip" aria-hidden="true">⠿</span>
					<span class="sort-chip-label">{SORT_FIELDS[chip.field] ?? chip.field}</span>
					<button
						type="button"
						class="sort-chip-dir"
						onclick={() => toggleChipDir(i)}
						title={chip.dir === 'asc' ? 'Ascending — click to reverse' : 'Descending — click to reverse'}
					>{chip.dir === 'asc' ? '↑' : '↓'}</button>
					{#if sortChips.length > 1}
						<button type="button" class="sort-chip-remove" onclick={() => removeSortChip(i)} title="Remove">×</button>
					{/if}
				</div>
			{/each}

			{#if availableSortFields.length > 0}
				<details class="add-sort-details" bind:this={addSortDetailsEl}>
					<summary class="add-sort-btn">+ sort</summary>
					<div class="add-sort-menu">
						{#each availableSortFields as field}
							<button type="button" class="add-sort-option" onclick={() => addSortChip(field)}>
								{SORT_FIELDS[field]}
							</button>
						{/each}
					</div>
				</details>
			{/if}

			<div class="columns-btn-wrapper">
				<ManageColumnsDropdown
					{columnOrder}
					{hiddenColumns}
					getLabel={(id) => ALL_COLUMNS.find(c => c.id === id)?.label ?? id}
					onReorder={(newOrder) => { columnOrder = newOrder; saveColumnSettings(); }}
					onToggleVisibility={toggleColumnVisibility}
				/>
			</div>
		</div>
	</div>

	<!-- Table -->
	{#if loading}
		<div class="loading-state">
			<div class="skeleton-table">
				{#each Array(8) as _, i}
					<div class="skeleton-row" style="animation-delay: {i * 50}ms">
						<div class="skeleton h-4 w-16 rounded"></div>
						<div class="skeleton h-4 w-8 rounded"></div>
						<div class="skeleton h-4 w-48 rounded"></div>
						<div class="skeleton h-4 w-20 rounded"></div>
						<div class="skeleton h-4 w-12 rounded"></div>
						<div class="skeleton h-4 w-16 rounded"></div>
					</div>
				{/each}
			</div>
		</div>
	{:else if error}
		<div class="error-state">
			<p>Failed to load tasks: {error}</p>
			<button class="btn btn-sm btn-primary" onclick={fetchTasks}>Retry</button>
		</div>
	{:else if filteredTasks.length === 0}
		<div class="empty-state">
			<p class="empty-title">No tasks found</p>
			<p class="empty-desc">
				{#if hasActiveFilters}
					Try adjusting your filters.
				{:else}
					All tasks are complete! Time to celebrate.
				{/if}
			</p>
		</div>
	{:else}
		{#if bulkActionError}
			<div class="bulk-error">
				<span>{bulkActionError}</span>
				<button type="button" aria-label="Dismiss error" onclick={() => bulkActionError = ''}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
						<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>
		{/if}
		<div
			class="table-container"
			class:has-selection={selectionCount > 0}
			bind:this={tableContainerEl}
			bind:clientHeight={virtContainerHeight}
			onscroll={(e) => virtScrollTop = e.currentTarget.scrollTop}
		>
			{#if resizeGuideX !== null}
				<div class="resize-guide" style="left: {resizeGuideX}px;"></div>
			{/if}
			<table class="tasks-table" style="table-layout: fixed;" class:has-selection={selectionCount > 0}>
				<colgroup>
					<col style="width: 32px; min-width: 32px; max-width: 32px;" />
					{#each visibleColumns as col}
						{#if getColWidth(col) === 0}
							<col />
						{:else}
							<col style="width: {getColWidth(col)}px; min-width: {col.minWidth}px;" />
						{/if}
					{/each}
				</colgroup>
				<thead>
					<tr>
						<th class="th-checkbox">
							<input
								type="checkbox"
								class="bulk-checkbox select-all-checkbox"
								checked={allVisibleSelected}
								indeterminate={someVisibleSelected}
								onclick={(e) => { e.stopPropagation(); toggleAllVisible(); }}
							/>
						</th>
						{#each visibleColumns as col, i}
							<th
								class="th-cell"
								class:th-dragging={colDraggedIndex === i}
								class:th-drag-over={colDragOverIndex === i && colDraggedIndex !== null && colDraggedIndex !== i}
								draggable="true"
								ondragstart={(e) => handleColDragStart(i, e)}
								ondragover={(e) => handleColDragOver(i, e)}
								ondragend={handleColDragEnd}
								ondrop={(e) => handleColDrop(i, e)}
								onclick={() => { if (col.sortable && col.sortField) toggleSort(col.sortField); }}
								oncontextmenu={(e) => openColCtxMenu(e, col.id)}
								style={col.id === 'type' ? 'text-align: center;' : ''}
								use:columnResize={{
									disabled: col.id === 'actions',
									minWidth: col.minWidth,
									onResizeStart: () => { resizeGuideX = 0; },
									onResize: (w) => { columnWidths = { ...columnWidths, [col.id]: w }; },
									onResizeEnd: () => { resizeGuideX = null; saveColumnSettings(); },
									getGuideContainer: () => tableContainerEl ?? null,
								}}
							>
								<span class="th-label">
									{col.label}
									{#if col.sortable && col.sortField}
										{@const chipIdx = sortChips.findIndex(c => c.field === col.sortField)}
										{#if chipIdx >= 0}
											{sortChips[chipIdx].dir === 'asc' ? '↑' : '↓'}{#if sortChips.length > 1}<sub>{chipIdx + 1}</sub>{/if}
										{/if}
									{/if}
								</span>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#if virtualWindow.topPad > 0}
						<tr style="height: {virtualWindow.topPad}px; line-height: 0;"><td colspan={visibleColumns.length + 1}></td></tr>
					{/if}
					{#each virtualWindow.items as item (item.type === 'header' ? `__group_${item.group.key}` : item.task.id)}
						{#if item.type === 'header'}
							{@const isCollapsed = collapsedGroups.has(item.group.key)}
							<tr class="group-header-row">
								<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
								<td class="group-header-cell" colspan={visibleColumns.length + 1} onclick={() => toggleGroupCollapse(item.group.key)}>
									<span class="group-chevron" class:open={!isCollapsed} aria-hidden="true">▸</span>
									<span class="group-header-label">{item.group.label}</span>
									<span class="group-header-count">{item.group.count}</span>
								</td>
							</tr>
						{:else}
							{@const task = item.task}
							{@const isSaving = saving === task.id}
							{@const isSelected = selectedTasks.has(task.id)}
							<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
						<tr
							class="task-row"
							class:saving={isSaving}
							class:selected-row={isSelected}
							data-nav-id={task.id}
							tabindex="-1"
							onmousedown={(e) => { if (e.shiftKey) e.preventDefault(); }}
							oncontextmenu={(e) => handleContextMenu(task, e)}
							onclick={(e) => {
								const t = e.target as HTMLElement;
								if (t.closest('.priority-badge, .status-pill, .type-badge, .assignee-editable, .label-editable, .title-editable, .due-date-cell, .milestone-cell, .td-checkbox, .inline-edit-input, .inline-edit-select, button, input, select, textarea')) return;
								openTaskDrawer(task.id);
							}}
						>
							<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
							<td class="td-checkbox" onclick={(e) => { e.stopPropagation(); toggleTask(task.id, e); }}>
								<input
									type="checkbox"
									class="bulk-checkbox"
									checked={isSelected}
									style="pointer-events: none;"
								/>
							</td>
							{#each visibleColumns as col}
								{#if col.id === 'project'}
									<td>
										<span
											class="project-badge"
											style="background: {getProjectColor(task.id)}20; color: {getProjectColor(task.id)}; border: 1px solid {getProjectColor(task.id)}40;"
										>
											{task.project}
										</span>
									</td>
								{:else if col.id === 'priority'}
									<td>
										{#if editingCell?.taskId === task.id && editingCell?.field === 'priority'}
											<!-- svelte-ignore a11y_autofocus -->
											<select
												class="inline-edit-select"
												value={task.priority}
												onchange={(e) => saveField(task.id, 'priority', parseInt(e.currentTarget.value))}
												onblur={() => { editingCell = null; }}
												autofocus
											>
												{#each [0, 1, 2, 3, 4] as p}
													<option value={p}>{priorityLabel(p)}</option>
												{/each}
											</select>
										{:else}
											<!-- svelte-ignore a11y_no_static_element_interactions -->
											<span
												class="priority-badge"
												style="background: {priorityColor(task.priority)}20; color: {priorityColor(task.priority)}; border: 1px solid {priorityColor(task.priority)}40;"
												onclick={() => { editingCell = { taskId: task.id, field: 'priority' }; }}
												title="Click to edit"
											>
												{priorityLabel(task.priority)}
											</span>
										{/if}
									</td>
								{:else if col.id === 'type'}
									<td style="text-align: center;">
										{#if editingCell?.taskId === task.id && editingCell?.field === 'issue_type'}
											<!-- svelte-ignore a11y_autofocus -->
											<select
												class="inline-edit-select"
												value={task.issue_type}
												onchange={(e) => saveField(task.id, 'issue_type', e.currentTarget.value)}
												onblur={() => { editingCell = null; }}
												onkeydown={(e) => { if (e.key === 'Escape') editingCell = null; }}
												autofocus
											>
												{#each ['bug', 'feature', 'task', 'epic', 'chore'] as t}
													<option value={t}>{typeIcon(t)} {t}</option>
												{/each}
											</select>
										{:else}
											<!-- svelte-ignore a11y_no_static_element_interactions -->
											<span
												class="type-badge"
												title="Click to edit ({task.issue_type})"
												onclick={() => { editingCell = { taskId: task.id, field: 'issue_type' }; }}
											>
												{typeIcon(task.issue_type)}
											</span>
										{/if}
									</td>
								{:else if col.id === 'id'}
									<td>
										<button
											class="task-id-btn"
											onclick={() => openTaskDrawer(task.id)}
											title="View details"
										>
											{task.id}
										</button>
									</td>
								{:else if col.id === 'title'}
									<td>
										{#if editingCell?.taskId === task.id && editingCell?.field === 'title'}
											<!-- svelte-ignore a11y_autofocus -->
											<input
												type="text"
												class="inline-edit-input"
												value={task.title}
												onkeydown={(e) => {
													if (e.key === 'Enter') saveField(task.id, 'title', e.currentTarget.value);
													else if (e.key === 'Escape') editingCell = null;
												}}
												onblur={(e) => {
													if (editingCell?.taskId === task.id && editingCell?.field === 'title') {
														saveField(task.id, 'title', e.currentTarget.value);
													}
												}}
												autofocus
											/>
										{:else}
											<!-- svelte-ignore a11y_no_static_element_interactions -->
											<span
												class="title-editable"
												title={task.description || 'Click to edit'}
												onclick={() => { editingCell = { taskId: task.id, field: 'title' }; }}
											>
												{#if task.internal === false}
													<svg class="visibility-badge public" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
												{/if}
												<span class="task-title-text">{task.title}</span>
											</span>
										{/if}
									</td>
								{:else if col.id === 'due_date'}
									<td style="padding: 0;">
										<button
											class="due-date-cell {dueDateClass(task.due_date)}"
											onclick={(e) => openDueDatePicker(task.id, e)}
											title={task.due_date ? `Due: ${task.due_date}` : 'Click to set due date'}
										>
											{#if task.due_date}
												{formatDueDate(task.due_date)}
											{:else}
												<span class="no-date">—</span>
											{/if}
										</button>
									</td>
								{:else if col.id === 'labels'}
									<td>
										{#if editingCell?.taskId === task.id && editingCell?.field === 'labels'}
											<!-- svelte-ignore a11y_autofocus -->
											<input
												type="text"
												class="inline-edit-input"
												value={(task.labels || []).join(', ')}
												list="opentasks-label-suggestions"
												placeholder="comma, separated"
												onkeydown={(e) => {
													if (e.key === 'Enter') saveField(task.id, 'labels', parseLabelsInput(e.currentTarget.value));
													else if (e.key === 'Escape') editingCell = null;
												}}
												onblur={(e) => {
													if (editingCell?.taskId === task.id && editingCell?.field === 'labels') {
														saveField(task.id, 'labels', parseLabelsInput(e.currentTarget.value));
													}
												}}
												autofocus
											/>
										{:else}
											<!-- svelte-ignore a11y_no_static_element_interactions -->
											<span
												class="labels-list label-editable"
												title="Click to edit labels"
												onclick={() => { editingCell = { taskId: task.id, field: 'labels' }; }}
											>
												{#if task.labels && task.labels.length > 0}
													{#each task.labels.slice(0, 3) as label}
														<span class="label-badge">{label}</span>
													{/each}
													{#if task.labels.length > 3}
														<span class="label-more">+{task.labels.length - 3}</span>
													{/if}
												{:else}
													<span class="no-labels">—</span>
												{/if}
											</span>
										{/if}
									</td>
								{:else if col.id === 'status'}
									{@const statusOpt = STATUS_OPTIONS.find(o => o.value === task.status)}
									<td>
										{#if editingCell?.taskId === task.id && editingCell?.field === 'status'}
											<!-- svelte-ignore a11y_autofocus -->
											<select
												class="inline-edit-select"
												value={task.status}
												onchange={(e) => saveField(task.id, 'status', e.currentTarget.value)}
												onblur={() => { editingCell = null; }}
												onkeydown={(e) => { if (e.key === 'Escape') editingCell = null; }}
												autofocus
											>
												{#each STATUS_OPTIONS as opt}
													<option value={opt.value}>{opt.label}</option>
												{/each}
											</select>
										{:else}
											<!-- svelte-ignore a11y_no_static_element_interactions -->
											<span
												class="status-pill"
												style="background: {statusOpt?.color ?? 'oklch(0.55 0.03 250)'}20; color: {statusOpt?.color ?? 'oklch(0.55 0.03 250)'}; border: 1px solid {statusOpt?.color ?? 'oklch(0.55 0.03 250)'}40;"
												title="Click to edit"
												onclick={() => { editingCell = { taskId: task.id, field: 'status' }; }}
											>
												{statusOpt?.label ?? task.status}
											</span>
										{/if}
									</td>
								{:else if col.id === 'milestone'}
									<td class="milestone-cell" class:milestone-cell-set={!!task.milestone_id}>
										<SearchDropdown
											value={task.milestone_id || ''}
											groups={milestoneAssignGroups}
											placeholder="Set milestone…"
											appendToBody
											onChange={(v) => setMilestone(task.id, v || null)}
										/>
									</td>
								{:else if col.id === 'assignee'}
									<td>
										{#if editingCell?.taskId === task.id && editingCell?.field === 'assignee'}
											<!-- svelte-ignore a11y_autofocus -->
											<input
												type="text"
												class="inline-edit-input"
												value={task.assignee || ''}
												list="opentasks-assignee-suggestions"
												placeholder="Unassigned"
												onkeydown={(e) => {
													if (e.key === 'Enter') saveField(task.id, 'assignee', e.currentTarget.value);
													else if (e.key === 'Escape') editingCell = null;
												}}
												onblur={(e) => {
													if (editingCell?.taskId === task.id && editingCell?.field === 'assignee') {
														saveField(task.id, 'assignee', e.currentTarget.value);
													}
												}}
												autofocus
											/>
										{:else}
											<!-- svelte-ignore a11y_no_static_element_interactions -->
											<span
												class="assignee-text assignee-editable"
												title="Click to edit"
												onclick={() => { editingCell = { taskId: task.id, field: 'assignee' }; }}
											>
												{task.assignee || '—'}
											</span>
										{/if}
									</td>
								{:else if col.id === 'requester'}
									{@const reqLabel = getPersonLabel(task.requester) || getPersonLabel(task.creator)}
									{@const reqInitial = getPersonInitial(task.requester) || getPersonInitial(task.creator)}
									<td>
										{#if reqLabel}
											<div class="person-date-cell">
												<div class="person-avatar" title={reqLabel}>{reqInitial}</div>
												<span class="person-date-text" title={reqLabel}>{reqLabel}</span>
											</div>
										{:else}
											<span class="text-muted">—</span>
										{/if}
									</td>
								{:else if col.id === 'source'}
									<td>
										{#if task.source}
											<span class="source-badge source-badge-{task.source}">{task.source}</span>
										{:else}
											<span class="text-muted">—</span>
										{/if}
									</td>
								{:else if col.id === 'page'}
									{@const pageUrl = getTaskPageUrl(task)}
									{@const pagePath = formatPageUrl(pageUrl)}
									<td>
										{#if pagePath}
											<span class="page-url-cell" title={pageUrl}>{pagePath}</span>
										{:else}
											<span class="text-muted">—</span>
										{/if}
									</td>
								{:else if col.id === 'created'}
									{@const createdInitial = getPersonInitial(task.creator)}
									{@const createdLabel = getPersonLabel(task.creator)}
									<td>
										<div class="person-date-cell">
											{#if createdInitial}
												<div class="person-avatar" title={createdLabel}>{createdInitial}</div>
											{/if}
											<span class="person-date-text" title={task.created_at}>{formatShortDate(task.created_at)}</span>
										</div>
									</td>
								{:else if col.id === 'updated'}
									{@const updatedInitial = getPersonInitial(task.assignee)}
									<td>
										<div class="person-date-cell">
											{#if updatedInitial}
												<div class="person-avatar" title={task.assignee}>{updatedInitial}</div>
											{/if}
											<span class="person-date-text" title={task.updated_at}>{formatShortDate(task.updated_at)}</span>
										</div>
									</td>
								{:else if col.id === 'actions'}
									<td>
										<div class="action-buttons">
											<button
												class="action-btn"
												onclick={() => openTaskDrawer(task.id)}
												title="View details"
											>
												<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
													<circle cx="12" cy="12" r="3"/>
												</svg>
											</button>
											<button
												class="action-btn"
												onclick={() => { drawerTaskId = task.id; drawerMode = 'edit'; drawerOpen = true; }}
												title="Edit task"
											>
												<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
													<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
												</svg>
											</button>
										</div>
									</td>
								{/if}
							{/each}
						</tr>
						{/if}
					{/each}
					{#if virtualWindow.bottomPad > 0}
						<tr style="height: {virtualWindow.bottomPad}px; line-height: 0;"><td colspan={visibleColumns.length + 1}></td></tr>
					{/if}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Due Date Picker Popover -->
{#if dueDatePickerTaskId && dueDatePickerPos}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-40" role="button" tabindex="0" onclick={closeDueDatePicker} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeDueDatePicker(); } }}></div>
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="due-date-picker fixed z-50"
		style="left: {dueDatePickerPos.x}px; top: {dueDatePickerPos.y}px;"
		bind:this={dueDatePickerEl}
		role="group"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
	>
		<div class="due-date-picker-header">Due Date</div>
		<div class="due-date-quick-set">
			<div class="quick-day-row">
				{#each getQuickSetDays() as day}
					<button
						class="quick-day-btn"
						class:quick-day-selected={dueDateTempValue === day.dateValue}
						onclick={() => quickSetDueDate(day.dateValue)}
						disabled={dueDateSaving}
					>
						<span class="quick-day-name">{day.label}</span>
						<span class="quick-day-num">{day.dayNum}</span>
					</button>
				{/each}
			</div>
			<div class="quick-day-labels">
				{#each getQuickSetDays() as day}
					<span class="quick-day-label-slot">
						{#if day.badge}
							<span class="quick-day-badge">{day.badge}</span>
						{/if}
					</span>
				{/each}
			</div>
		</div>
		<div class="due-date-picker-body">
			<input
				type="date"
				class="due-date-input"
				bind:value={dueDateTempValue}
			/>
			<div class="due-date-time-row">
				<label for="opentasks-due-time" class="due-date-time-label">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="12" height="12">
						<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
					</svg>
					Time
				</label>
				<input
					id="opentasks-due-time"
					type="time"
					class="due-date-time-input"
					bind:value={dueDateTempTime}
					placeholder="Optional"
				/>
			</div>
		</div>
		<div class="due-date-picker-footer">
			{#if tasks.find(t => t.id === dueDatePickerTaskId)?.due_date}
				<button class="due-date-btn due-date-btn-clear" onclick={clearDueDate} disabled={dueDateSaving}>
					Clear
				</button>
			{/if}
			<div class="flex-1"></div>
			<button class="due-date-btn due-date-btn-cancel" onclick={closeDueDatePicker} disabled={dueDateSaving}>
				Cancel
			</button>
			<button class="due-date-btn due-date-btn-save" onclick={saveDueDate} disabled={dueDateSaving || !dueDateTempValue}>
				{dueDateSaving ? 'Saving...' : 'Save'}
			</button>
		</div>
	</div>
{/if}

<!-- Context Menu -->
{#if ctxTask}
	<div
		class="task-context-menu"
		class:task-context-menu-hidden={!ctxVisible}
		style="left: {ctxX}px; top: {ctxY}px;"
		role="menu"
		tabindex="0"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
	>
		<!-- Launch -->
		<button class="task-context-menu-item" onmouseenter={() => { statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }} onclick={() => { const t = ctxTask!; closeContextMenu(); ctxSpawnTask(t); }}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M12 2C12 2 8 6 8 12C8 15 9 17 10 18L10 21C10 21.5 10.5 22 11 22H13C13.5 22 14 21.5 14 21L14 18C15 17 16 15 16 12C16 6 12 2 12 2Z" />
				<circle cx="12" cy="10" r="2" />
			</svg>
			<span>Launch</span>
		</button>

		<!-- View Details -->
		<button class="task-context-menu-item" onmouseenter={() => { statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }} onclick={() => { const id = ctxTask!.id; closeContextMenu(); openTaskDrawer(id); }}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
				<circle cx="12" cy="12" r="3" />
			</svg>
			<span>View Details</span>
		</button>

		<div class="task-context-menu-divider"></div>

		<!-- Change Status (submenu) -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="task-context-menu-submenu-container"
			onmouseenter={() => { statusSubmenuOpen = true; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }}
			onmouseleave={() => { statusSubmenuOpen = false; }}
		>
			<button class="task-context-menu-item task-context-menu-item-has-submenu">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
					<polyline points="22 4 12 14.01 9 11.01" />
				</svg>
				<span>Change Status</span>
				<svg class="task-context-menu-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</button>
			{#if statusSubmenuOpen}
				<div class="task-context-submenu">
					{#each STATUS_OPTIONS as status}
						<button
							class="task-context-menu-item {ctxTask!.status === status.value ? 'task-context-menu-item-active' : ''}"
							onclick={() => ctxChangeStatus(ctxTask!.id, status.value)}
						>
							<span class="task-status-dot" style="background: {status.color};"></span>
							<span>{status.label}</span>
							{#if ctxTask!.status === status.value}
								<svg class="task-context-menu-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="20 6 9 17 4 12" />
								</svg>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Change Priority (submenu) -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="task-context-menu-submenu-container"
			onmouseenter={() => { prioritySubmenuOpen = true; statusSubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }}
			onmouseleave={() => { prioritySubmenuOpen = false; }}
		>
			<button class="task-context-menu-item task-context-menu-item-has-submenu">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M3 3v18h18" /><path d="m7 16 4-8 4 4 4-6" />
				</svg>
				<span>Change Priority</span>
				<svg class="task-context-menu-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</button>
			{#if prioritySubmenuOpen}
				<div class="task-context-submenu">
					{#each [
						{ value: 0, label: 'P0 — Critical', color: 'oklch(0.70 0.20 25)' },
						{ value: 1, label: 'P1 — High', color: 'oklch(0.75 0.15 85)' },
						{ value: 2, label: 'P2 — Medium', color: 'oklch(0.70 0.15 200)' },
						{ value: 3, label: 'P3 — Low', color: 'oklch(0.55 0.03 250)' },
						{ value: 4, label: 'P4 — Lowest', color: 'oklch(0.45 0.01 250)' }
					] as pri}
						<button
							class="task-context-menu-item {ctxTask!.priority === pri.value ? 'task-context-menu-item-active' : ''}"
							onclick={() => ctxChangePriority(ctxTask!.id, pri.value)}
						>
							<span class="task-status-dot" style="background: {pri.color};"></span>
							<span>{pri.label}</span>
							{#if ctxTask!.priority === pri.value}
								<svg class="task-context-menu-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="20 6 9 17 4 12" />
								</svg>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Assign to Epic (submenu) -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="task-context-menu-submenu-container"
			onmouseenter={() => { epicSubmenuOpen = true; statusSubmenuOpen = false; prioritySubmenuOpen = false; projectSubmenuOpen = false; if (ctxTask) fetchEpics(getProjectFromTaskId(ctxTask.id)); }}
			onmouseleave={() => { epicSubmenuOpen = false; }}
		>
			<button class="task-context-menu-item task-context-menu-item-has-submenu">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
				</svg>
				<span>Assign to Epic</span>
				<svg class="task-context-menu-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</button>
			{#if epicSubmenuOpen}
				<div class="task-context-submenu task-context-submenu-epic">
					{#if epicsLoading}
						<div class="task-context-menu-loading">Loading...</div>
					{:else if epics.length === 0 && !showCreateEpic}
						<div style="padding: 0.5rem 0.75rem; opacity: 0.5; font-size: 0.75rem;">No epics found</div>
					{:else}
						{#each epics as epic}
							<button class="task-context-menu-item" onclick={() => ctxLinkToEpic(ctxTask!.id, epic.id)}>
								<span class="task-epic-id">{epic.id}</span>
								<span class="task-epic-title">{epic.title}</span>
							</button>
						{/each}
					{/if}
					{#if !epicsLoading}
						{#if showCreateEpic}
							<div style="padding: 0.25rem 0.5rem; display: flex; gap: 0.25rem; align-items: center;">
								<!-- svelte-ignore a11y_autofocus -->
								<input
									bind:this={newEpicInput}
									bind:value={newEpicTitle}
									onkeydown={(e) => { if (e.key === 'Enter' && newEpicTitle.trim()) { e.preventDefault(); ctxCreateEpic(); } else if (e.key === 'Escape') { showCreateEpic = false; newEpicTitle = ''; } }}
									placeholder="Epic title..."
									disabled={creatingEpic}
									autofocus
									class="task-epic-create-input"
								/>
								<button class="task-epic-create-btn" onclick={ctxCreateEpic} disabled={creatingEpic || !newEpicTitle.trim()}>
									{#if creatingEpic}...{:else}+{/if}
								</button>
							</div>
						{:else}
							<div class="task-context-menu-divider"></div>
							<button class="task-context-menu-item" onclick={() => { showCreateEpic = true; setTimeout(() => newEpicInput?.focus(), 50); }}>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
								</svg>
								<span>Create Epic</span>
							</button>
						{/if}
					{/if}
				</div>
			{/if}
		</div>

		<!-- Change Project (submenu) -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="task-context-menu-submenu-container"
			onmouseenter={() => { projectSubmenuOpen = true; statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; }}
			onmouseleave={() => { projectSubmenuOpen = false; }}
		>
			<button class="task-context-menu-item task-context-menu-item-has-submenu">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
					<path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
				</svg>
				<span>Change Project</span>
				<svg class="task-context-menu-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</button>
			{#if projectSubmenuOpen}
				<div class="task-context-submenu task-context-submenu-project">
					{#each projects as proj}
						<button
							class="task-context-menu-item {ctxTask!.project === proj ? 'task-context-menu-item-active' : ''}"
							onclick={() => ctxChangeProject(ctxTask!.id, proj)}
						>
							<span class="task-status-dot" style="background: {getProjectColor(proj + '-x')};"></span>
							<span>{proj}</span>
							{#if ctxTask!.project === proj}
								<svg class="task-context-menu-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="20 6 9 17 4 12" />
								</svg>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<div class="task-context-menu-divider"></div>

		<!-- Internal toggle -->
		<button class="task-context-menu-item" onmouseenter={() => { statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }} onclick={() => ctxToggleInternal(ctxTask!)}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
				<circle cx="9" cy="7" r="4"/>
				<path d="M23 21v-2a4 4 0 00-3-3.87"/>
				<path d="M16 3.13a4 4 0 010 7.75"/>
			</svg>
			<span>{(ctxTask?.internal ?? true) ? 'Make Public' : 'Mark Internal'}</span>
		</button>

		<!-- Duplicate -->
		<button class="task-context-menu-item" onmouseenter={() => { statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }} onclick={() => ctxDuplicateTask(ctxTask!)}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
				<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
			</svg>
			<span>Duplicate</span>
		</button>

		<!-- Close Task -->
		<button class="task-context-menu-item task-context-menu-item-danger" onmouseenter={() => { statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }} onclick={() => ctxChangeStatus(ctxTask!.id, 'closed')}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10" />
				<line x1="15" y1="9" x2="9" y2="15" />
				<line x1="9" y1="9" x2="15" y2="15" />
			</svg>
			<span>Close Task</span>
		</button>

		<!-- Delete Task -->
		<button class="task-context-menu-item task-context-menu-item-danger" onmouseenter={() => { statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }} onclick={() => ctxDeleteTask(ctxTask!.id)}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="3 6 5 6 21 6" />
				<path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
				<line x1="10" y1="11" x2="10" y2="17" />
				<line x1="14" y1="11" x2="14" y2="17" />
			</svg>
			<span>Delete Task</span>
		</button>
	</div>
{/if}

<!-- Floating Bulk Action Bar -->
{#if selectionCount > 0}
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="floating-action-bar" transition:fade={{ duration: 150 }} onclick={(e) => { if (!(e.target as HTMLElement).closest('.floating-dropdown-wrapper')) closeBulkDropdowns(); }} onkeydown={(e) => { if (e.key === 'Escape') closeBulkDropdowns(); }}>
	<span class="floating-count">{selectionCount} selected</span>
	<div class="floating-divider"></div>

	<!-- Type dropdown -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="floating-dropdown-wrapper" role="group" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
		<button type="button" class="floating-btn" onclick={() => { closeBulkDropdowns(); typeDropdownOpen = !typeDropdownOpen; }} disabled={bulkActionLoading}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
			Type
		</button>
		{#if typeDropdownOpen}
			<div class="floating-dropdown" transition:fade={{ duration: 100 }}>
				{#each [
					{ value: 'bug', label: '🐛 Bug' },
					{ value: 'feature', label: '✨ Feature' },
					{ value: 'task', label: '📋 Task' },
					{ value: 'epic', label: '⚡ Epic' },
					{ value: 'chore', label: '🔄 Chore' },
					{ value: 'chat', label: '💬 Chat' },
				] as opt}
					<button class="floating-dropdown-item" onclick={() => handleBulkType(opt.value)}>
						{opt.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Status dropdown -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="floating-dropdown-wrapper" role="group" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
		<button type="button" class="floating-btn" onclick={() => { closeBulkDropdowns(); statusDropdownOpen = !statusDropdownOpen; }} disabled={bulkActionLoading}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
			Status
		</button>
		{#if statusDropdownOpen}
			<div class="floating-dropdown" transition:fade={{ duration: 100 }}>
				{#each STATUS_OPTIONS as opt}
					<button class="floating-dropdown-item" onclick={() => handleBulkStatus(opt.value)}>
						<span class="floating-priority-dot" style="background: {opt.color};"></span>
						{opt.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Priority dropdown -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="floating-dropdown-wrapper" role="group" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
		<button type="button" class="floating-btn floating-btn-priority" onclick={() => { closeBulkDropdowns(); priorityDropdownOpen = !priorityDropdownOpen; }} disabled={bulkActionLoading}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
				<path d="M3 3v18h18" /><path d="M18 9l-5-6-4 4-4 2" />
			</svg>
			Priority
		</button>
		{#if priorityDropdownOpen}
			<div class="floating-dropdown" transition:fade={{ duration: 100 }}>
				{#each [
					{ p: 0, label: 'P0 Critical', color: 'oklch(0.75 0.18 25)' },
					{ p: 1, label: 'P1 High', color: 'oklch(0.80 0.15 85)' },
					{ p: 2, label: 'P2 Medium', color: 'oklch(0.75 0.12 200)' },
					{ p: 3, label: 'P3 Low', color: 'oklch(0.65 0.02 250)' },
					{ p: 4, label: 'P4 Lowest', color: 'oklch(0.55 0.02 250)' }
				] as item}
					<button class="floating-dropdown-item" onclick={() => handleBulkPriority(item.p)}>
						<span class="floating-priority-dot" style="background: {item.color};"></span>
						{item.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Assign dropdown -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="floating-dropdown-wrapper" role="group" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
		<button type="button" class="floating-btn" onclick={() => { closeBulkDropdowns(); assignDropdownOpen = !assignDropdownOpen; }} disabled={bulkActionLoading}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
			Assign
		</button>
		{#if assignDropdownOpen}
			<div class="floating-dropdown" transition:fade={{ duration: 100 }}>
				<button class="floating-dropdown-item" onclick={() => handleBulkAssign(null)}>
					<span style="opacity:0.5">— Unassigned</span>
				</button>
				{#each humanAssignees as name}
					<button class="floating-dropdown-item" onclick={() => handleBulkAssign(name)}>
						{name}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Milestone dropdown -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="floating-dropdown-wrapper" role="group" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
		<button type="button" class="floating-btn" onclick={() => { closeBulkDropdowns(); milestoneDropdownOpen = !milestoneDropdownOpen; }} disabled={bulkActionLoading}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M3 3v18M3 9l9-6 9 6"/></svg>
			Milestone
		</button>
		{#if milestoneDropdownOpen}
			<div class="floating-dropdown" transition:fade={{ duration: 100 }}>
				<button class="floating-dropdown-item" onclick={() => handleBulkMilestone(null)}>
					<span style="opacity:0.5">— No milestone</span>
				</button>
				{#each bulkMilestoneOptions as m}
					<button class="floating-dropdown-item" onclick={() => handleBulkMilestone(m.id)}>
						{m.name}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Epic dropdown -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="floating-dropdown-wrapper" role="group" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
		<button type="button" class="floating-btn" onclick={() => { closeBulkDropdowns(); loadEpics(); bulkEpicOpen = !bulkEpicOpen; }} disabled={bulkActionLoading}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
			Epic
		</button>
		{#if bulkEpicOpen}
			<div class="floating-dropdown" transition:fade={{ duration: 100 }}>
				{#if epics.length === 0}
					<span class="floating-dropdown-item" style="opacity:0.5; pointer-events:none;">No open epics</span>
				{:else}
					{#each epics as epic}
						<button class="floating-dropdown-item" onclick={() => bulkAssignToEpic(epic.id)}>
							⚡ {epic.title}
						</button>
					{/each}
				{/if}
			</div>
		{/if}
	</div>

	<div class="floating-divider"></div>

	<!-- Promote / Hide / Make Public / Close -->
	<button type="button" class="floating-btn floating-btn-promote" onclick={handleBulkPromote} disabled={bulkActionLoading} title="Set status=open (promote to active queue)">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="17 11 12 6 7 11"/><line x1="12" y1="18" x2="12" y2="6"/></svg>
		Promote
	</button>
	<button type="button" class="floating-btn floating-btn-hide" onclick={handleBulkHide} disabled={bulkActionLoading} title="Mark internal=true (hidden from clients)">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
		Hide
	</button>
	<button type="button" class="floating-btn floating-btn-publish" onclick={handleBulkPublish} disabled={bulkActionLoading} title="Mark internal=false (visible to clients)">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
		Publish
	</button>
	<button type="button" class="floating-btn floating-btn-close" onclick={handleBulkClose} disabled={bulkActionLoading}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
			<circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
		</svg>
		Close
	</button>

	<div class="floating-divider"></div>

	<!-- Spawn + Harness -->
	<button type="button" class="floating-btn floating-btn-spawn" onclick={handleBulkSpawn} disabled={bulkActionLoading}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
			<path d="M12 2C12 2 8 6 8 12C8 15 9 17 10 18L10 21C10 21.5 10.5 22 11 22H13C13.5 22 14 21.5 14 21L14 18C15 17 16 15 16 12C16 6 12 2 12 2Z" />
			<circle cx="12" cy="10" r="2" />
		</svg>
		{spawnProgress || 'Spawn'}
	</button>
	<!-- Harness dropdown -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="floating-dropdown-wrapper" role="group" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
		<button type="button" class="floating-btn floating-btn-harness" onclick={() => { closeBulkDropdowns(); harnessDropdownOpen = !harnessDropdownOpen; }} disabled={bulkActionLoading}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
				<path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
				<circle cx="12" cy="12" r="3" />
			</svg>
			Harness
		</button>
		{#if harnessDropdownOpen}
			<div class="floating-dropdown" transition:fade={{ duration: 100 }}>
				{#each AGENT_PRESETS as preset}
					<button class="floating-dropdown-item" onclick={() => handleBulkHarness(preset.id)}>
						<ProviderLogo agentId={preset.id} size={14} />
						<span>{preset.name}</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="floating-divider"></div>

	<!-- Copy IDs / Export CSV -->
	<button type="button" class="floating-btn floating-btn-copy" onclick={copyTaskIds} disabled={bulkActionLoading} title="Copy task IDs to clipboard">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
		Copy IDs
	</button>
	<button type="button" class="floating-btn floating-btn-export" onclick={exportCSV} disabled={bulkActionLoading} title="Export selection as CSV">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
		CSV
	</button>

	<div class="floating-divider"></div>

	<!-- Delete (two-click arm) -->
	{#if deleteArmed}
		<button type="button" class="floating-btn floating-btn-delete floating-btn-delete-armed" onclick={handleBulkDelete} disabled={bulkActionLoading}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
			Delete {selectionCount}?
		</button>
	{:else}
		<button type="button" class="floating-btn floating-btn-delete" onclick={handleBulkDelete} disabled={bulkActionLoading} title="Click to arm, then click again to confirm delete">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
				<polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
			</svg>
			Delete
		</button>
	{/if}

	<button type="button" class="floating-btn floating-btn-clear" onclick={clearSelection} disabled={bulkActionLoading}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
		Clear
	</button>
	{#if bulkActionLoading}
		<div class="floating-spinner"></div>
	{/if}
</div>
{/if}

<!-- Column header context menu -->
{#if colCtxCol}
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="col-ctx-menu"
	class:col-ctx-menu-hidden={!colCtxVisible}
	style="left: {colCtxX}px; top: {colCtxY}px;"
	onmouseleave={closeColCtxMenu}
>
	<div class="col-ctx-header">Set all {filteredTasks.length} visible to…</div>
	{#if colCtxCol === 'priority'}
		{#each [0,1,2,3,4] as p}
			<button class="col-ctx-item" onclick={() => colCtxApply(() => handleBulkPriority(p))}>P{p}</button>
		{/each}
	{:else if colCtxCol === 'status'}
		{#each STATUS_OPTIONS as s}
			<button class="col-ctx-item" onclick={() => colCtxApply(() => handleBulkStatus(s.value))}>{s.label}</button>
		{/each}
	{:else if colCtxCol === 'type'}
		{#each ['bug','feature','task','chore','epic'] as t}
			<button class="col-ctx-item" onclick={() => colCtxApply(() => handleBulkType(t))}>{t}</button>
		{/each}
	{:else if colCtxCol === 'assignee'}
		<button class="col-ctx-item" onclick={() => colCtxApply(() => handleBulkAssign(null))}>— Unassigned</button>
		{#each humanAssignees as name}
			<button class="col-ctx-item" onclick={() => colCtxApply(() => handleBulkAssign(name))}>{name}</button>
		{/each}
	{:else if colCtxCol === 'milestone'}
		<button class="col-ctx-item" onclick={() => colCtxApply(() => handleBulkMilestone(null))}>— No milestone</button>
		{#each bulkMilestoneOptions as m}
			<button class="col-ctx-item" onclick={() => colCtxApply(() => handleBulkMilestone(m.id))}>{m.name}</button>
		{/each}
	{/if}
</div>
{/if}

<!-- Task Detail Drawer -->
<TaskDetailDrawer
	bind:taskId={drawerTaskId}
	bind:mode={drawerMode}
	bind:isOpen={drawerOpen}
/>

<style>
	.open-tasks-page {
		padding: 1rem 1.5rem;
		max-width: 100%;
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* Header + Saved Views — merged into one row */
	.page-header {
		display: flex;
		gap: 0.25rem;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 0.5rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid oklch(0.30 0.02 250 / 0.5);
		flex-shrink: 0;
	}
	.page-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: oklch(0.65 0.02 250);
		margin: 0;
		margin-right: 0.25rem;
		white-space: nowrap;
	}
	.stats-row {
		display: flex;
		gap: 0.625rem;
		margin-left: auto;
		align-items: center;
	}
	.stat {
		font-size: 0.75rem;
		color: oklch(0.55 0.02 250);
		white-space: nowrap;
	}
	.stat-urgent {
		color: oklch(0.75 0.15 65);
	}
	.stat-overdue {
		color: oklch(0.70 0.20 25);
	}
	.view-tab-wrapper {
		display: inline-flex;
		align-items: stretch;
		gap: 0;
		border-radius: 0.375rem;
		overflow: hidden;
	}
	.view-tab-wrapper-active {
		box-shadow: 0 0 0 1px oklch(0.70 0.18 240 / 0.4);
	}
	.view-tab {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.3125rem 0.625rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(0.70 0.02 250);
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background 0.15s, color 0.15s, border-color 0.15s;
		white-space: nowrap;
		line-height: 1.2;
	}
	.view-tab:hover:not(:disabled) {
		background: oklch(0.22 0.02 250);
		color: oklch(0.85 0.02 250);
		border-color: oklch(0.35 0.02 250);
	}
	.view-tab:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.view-tab.view-tab-active {
		background: oklch(0.30 0.10 240 / 0.4);
		color: oklch(0.92 0.05 240);
		border-color: oklch(0.55 0.15 240 / 0.6);
	}
	.view-tab-wrapper .view-tab {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
		border-right: none;
	}
	.view-tab-name {
		max-width: 14rem;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.view-tab-modified-dot {
		color: oklch(0.75 0.18 85);
		font-size: 0.75rem;
		line-height: 1;
	}
	.view-tab-action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0 0.375rem;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-left: none;
		color: oklch(0.65 0.02 250);
		cursor: pointer;
		transition: background 0.15s, color 0.15s, border-color 0.15s;
	}
	.view-tab-action:last-child {
		border-top-right-radius: 0.375rem;
		border-bottom-right-radius: 0.375rem;
	}
	.view-tab-action:hover:not(:disabled) {
		background: oklch(0.22 0.02 250);
		color: oklch(0.90 0.02 250);
	}
	.view-tab-action:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.view-tab-wrapper-active .view-tab-action {
		background: oklch(0.30 0.10 240 / 0.4);
		border-color: oklch(0.55 0.15 240 / 0.6);
		color: oklch(0.85 0.05 240);
	}
	.view-tab-wrapper-active .view-tab-action:hover {
		background: oklch(0.36 0.12 240 / 0.55);
		color: oklch(0.96 0.04 240);
	}
	.view-tab-delete:hover:not(:disabled) {
		background: oklch(0.32 0.12 25 / 0.5) !important;
		color: oklch(0.85 0.18 25) !important;
		border-color: oklch(0.55 0.18 25 / 0.6) !important;
	}
	.view-tab-add {
		color: oklch(0.65 0.02 250);
		border-style: dashed;
	}
	.view-tab-add:hover:not(:disabled) {
		color: oklch(0.85 0.10 145);
		border-color: oklch(0.55 0.15 145 / 0.6);
	}
	.view-tab-save-dialog {
		display: inline-flex;
		align-items: stretch;
		gap: 0;
		border-radius: 0.375rem;
		box-shadow: 0 0 0 1px oklch(0.55 0.15 145 / 0.5);
	}
	.view-tab-rename-input {
		padding: 0.3125rem 0.625rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(0.92 0.02 250);
		background: oklch(0.16 0.02 250);
		border: 1px solid oklch(0.45 0.10 240);
		border-radius: 0.375rem 0 0 0.375rem;
		outline: none;
		min-width: 8rem;
		max-width: 14rem;
		line-height: 1.2;
	}
	.view-tab-rename-input:focus {
		border-color: oklch(0.65 0.18 240);
	}

	/* Filters */
	.filters-bar {
		margin-bottom: 0.75rem;
		flex-shrink: 0;
	}
	.filter-row {
		display: flex;
		gap: 0.375rem;
		align-items: center;
		flex-wrap: wrap;
	}
	.search-input {
		padding: 0.25rem 0.5rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.8125rem;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.5rem;
		color: oklch(0.90 0.02 250);
		min-height: 2rem;
		outline: none;
		width: 200px;
		transition: border-color 0.15s;
	}
	.search-input:focus {
		border-color: oklch(0.55 0.12 220);
	}
	.search-input::placeholder {
		color: oklch(0.45 0.02 250);
	}
	.milestone-shorthand-badge {
		padding: 0.125rem 0.5rem;
		background: oklch(0.22 0.06 280 / 0.5);
		border: 1px solid oklch(0.45 0.10 280 / 0.5);
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		color: oklch(0.75 0.12 280);
		white-space: nowrap;
		flex-shrink: 0;
	}
	.milestone-shorthand-miss {
		background: oklch(0.22 0.04 25 / 0.4);
		border-color: oklch(0.40 0.08 25 / 0.5);
		color: oklch(0.65 0.10 25);
	}
	.project-dropdown-wrapper {
		width: 150px;
	}
	.sd-add-project {
		width: 100%;
		padding: 0.375rem 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: transparent;
		border: none;
		cursor: pointer;
		font-size: 0.6875rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		color: oklch(0.65 0.12 145);
		transition: background 0.1s, color 0.1s;
	}
	.sd-add-project:hover {
		background: oklch(0.24 0.06 145 / 0.3);
		color: oklch(0.80 0.15 145);
	}

	/* Status multi-select dropdown */
	.status-dropdown-wrapper {
		position: relative;
	}
	.status-dropdown {
		position: relative;
	}
	.status-dropdown summary {
		list-style: none;
	}
	.status-dropdown summary::-webkit-details-marker {
		display: none;
	}
	.status-dropdown-trigger {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.625rem;
		min-height: 2rem;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.5rem;
		color: oklch(0.70 0.03 250);
		font-size: 0.8125rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		cursor: pointer;
		white-space: nowrap;
		user-select: none;
		transition: border-color 0.15s, color 0.15s;
	}
	.status-dropdown[open] .status-dropdown-trigger,
	.status-dropdown-trigger:hover {
		border-color: oklch(0.55 0.12 220);
		color: oklch(0.90 0.02 250);
	}
	.status-dropdown-label {
		flex: 1;
	}
	.status-dropdown-caret {
		opacity: 0.5;
		flex-shrink: 0;
	}
	.status-dropdown-menu {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		z-index: 40;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.5rem;
		box-shadow: 0 8px 24px oklch(0 0 0 / 0.4);
		min-width: 180px;
		padding: 0.375rem 0;
		animation: dropdown-slide 0.12s ease-out;
	}
	.status-dropdown-controls {
		display: flex;
		gap: 0.25rem;
		padding: 0.25rem 0.625rem 0.375rem;
		border-bottom: 1px solid oklch(0.22 0.02 250);
		margin-bottom: 0.25rem;
	}
	.sd-ctrl-btn {
		font-size: 0.6875rem;
		padding: 0.125rem 0.375rem;
		background: oklch(0.22 0.02 250);
		border: none;
		border-radius: 0.25rem;
		color: oklch(0.60 0.03 250);
		cursor: pointer;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		transition: background 0.1s, color 0.1s;
	}
	.sd-ctrl-btn:hover {
		background: oklch(0.28 0.03 250);
		color: oklch(0.85 0.02 250);
	}
	.status-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.3rem 0.75rem;
		cursor: pointer;
		font-size: 0.8125rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		color: oklch(0.75 0.03 250);
		transition: background 0.08s;
	}
	.status-option:hover {
		background: oklch(0.20 0.02 250);
		color: oklch(0.92 0.02 250);
	}
	.status-option input[type="checkbox"] {
		accent-color: oklch(0.65 0.15 220);
		cursor: pointer;
		flex-shrink: 0;
	}
	.status-option-label {
		flex: 1;
	}
	.status-option-count {
		font-size: 0.6875rem;
		color: oklch(0.50 0.03 250);
		background: oklch(0.20 0.02 250);
		padding: 0 0.3rem;
		border-radius: 0.25rem;
		flex-shrink: 0;
	}

	/* Clear filters button */
	.clear-filters-btn {
		padding: 0.25rem 0.625rem;
		min-height: 2rem;
		background: transparent;
		border: 1px solid oklch(0.35 0.05 25 / 0.5);
		border-radius: 0.5rem;
		color: oklch(0.65 0.10 25);
		font-size: 0.8125rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.1s, color 0.1s, border-color 0.1s;
	}
	.clear-filters-btn:hover {
		background: oklch(0.35 0.08 25 / 0.15);
		border-color: oklch(0.55 0.12 25);
		color: oklch(0.80 0.12 25);
	}

	/* Internal/Public filter toggle */
	.internal-filter-toggle {
		display: flex;
		align-items: center;
		border: 1px solid oklch(0.30 0.03 250 / 0.5);
		border-radius: 0.5rem;
		overflow: hidden;
		flex-shrink: 0;
	}
	.internal-filter-btn {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		min-height: 2rem;
		background: transparent;
		border: none;
		border-right: 1px solid oklch(0.30 0.03 250 / 0.4);
		color: oklch(0.55 0.05 250);
		font-size: 0.75rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.1s, color 0.1s;
	}
	.internal-filter-btn:last-child { border-right: none; }
	.internal-filter-btn:hover {
		background: oklch(0.28 0.04 250 / 0.4);
		color: oklch(0.80 0.05 250);
	}
	.internal-filter-btn.active {
		background: oklch(0.28 0.04 250 / 0.6);
		color: oklch(0.88 0.04 250);
	}

	/* Columns button pushed to end */
	.columns-btn-wrapper {
		margin-left: auto;
	}

	/* Sort row */
	.sort-row {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-top: 0.375rem;
		flex-wrap: wrap;
	}
	.sort-row-label {
		font-size: 0.6875rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		color: oklch(0.45 0.03 250);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding-right: 0.125rem;
		flex-shrink: 0;
	}
	.sort-row-divider {
		width: 1px;
		height: 1.125rem;
		background: oklch(0.25 0.02 250);
		margin: 0 0.25rem;
		flex-shrink: 0;
	}
	.group-by-select {
		background: oklch(0.18 0.02 250);
		color: oklch(0.85 0.04 250);
		border: 1px solid oklch(0.28 0.03 250);
		border-radius: 0.375rem;
		padding: 0.2rem 1.5rem 0.2rem 0.5rem;
		font-size: 0.75rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		cursor: pointer;
		appearance: none;
		-webkit-appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.4rem center;
		transition: border-color 0.15s ease;
	}
	.group-by-select:hover { border-color: oklch(0.40 0.05 240); }
	.group-by-select:focus { outline: none; border-color: oklch(0.55 0.18 240); }
	.group-collapse-all-btn {
		background: oklch(0.18 0.02 250);
		color: oklch(0.65 0.04 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.375rem;
		padding: 0.2rem 0.5rem;
		font-size: 0.7rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.group-collapse-all-btn:hover {
		background: oklch(0.22 0.02 250);
		color: oklch(0.85 0.04 250);
		border-color: oklch(0.35 0.04 250);
	}
	.group-header-row {
		background: oklch(0.16 0.02 250);
	}
	.group-header-cell {
		padding: 0.4rem 0.625rem !important;
		border-top: 1px solid oklch(0.28 0.03 250);
		border-bottom: 1px solid oklch(0.22 0.02 250);
		cursor: pointer;
		user-select: none;
		font-size: 0.8125rem;
		color: oklch(0.85 0.04 250);
		font-weight: 600;
		position: sticky;
		left: 0;
	}
	.group-header-cell:hover {
		background: oklch(0.20 0.02 250);
	}
	.group-chevron {
		display: inline-block;
		margin-right: 0.5rem;
		font-size: 0.7rem;
		color: oklch(0.55 0.05 250);
		transition: transform 0.15s ease;
		width: 0.75rem;
	}
	.group-chevron.open {
		transform: rotate(90deg);
	}
	.group-header-label {
		font-weight: 600;
	}
	.group-header-count {
		display: inline-block;
		margin-left: 0.5rem;
		background: oklch(0.24 0.03 250);
		color: oklch(0.65 0.05 250);
		padding: 0.05rem 0.4rem;
		border-radius: 0.625rem;
		font-size: 0.6875rem;
		font-weight: 500;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
	}
	.sort-chip {
		display: flex;
		align-items: center;
		gap: 0.125rem;
		padding: 0 0.125rem 0 0.375rem;
		min-height: 1.75rem;
		background: oklch(0.20 0.03 240 / 0.5);
		border: 1px solid oklch(0.35 0.08 240 / 0.45);
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		color: oklch(0.78 0.08 240);
		cursor: grab;
		user-select: none;
		transition: background 0.1s, border-color 0.1s, opacity 0.1s;
	}
	.sort-chip:hover {
		background: oklch(0.24 0.05 240 / 0.6);
		border-color: oklch(0.50 0.12 240 / 0.6);
	}
	.sort-chip-drag-over {
		border-color: oklch(0.65 0.15 240);
		box-shadow: -3px 0 0 oklch(0.65 0.15 240);
	}
	.sort-chip-dragging {
		opacity: 0.4;
		cursor: grabbing;
	}
	.sort-chip-grip {
		color: oklch(0.45 0.04 250);
		font-size: 0.875rem;
		cursor: grab;
		flex-shrink: 0;
	}
	.sort-chip-label {
		padding: 0 0.25rem;
		flex-shrink: 0;
	}
	.sort-chip-dir {
		padding: 0 0.3rem;
		min-height: 1.25rem;
		background: oklch(0.28 0.05 240 / 0.5);
		border: none;
		border-radius: 0.25rem;
		color: oklch(0.85 0.10 240);
		font-size: 0.8125rem;
		cursor: pointer;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		flex-shrink: 0;
		transition: background 0.1s, color 0.1s;
	}
	.sort-chip-dir:hover {
		background: oklch(0.38 0.10 240 / 0.7);
		color: oklch(0.95 0.08 240);
	}
	.sort-chip-remove {
		padding: 0 0.3rem;
		min-height: 1.25rem;
		background: transparent;
		border: none;
		color: oklch(0.50 0.04 250);
		font-size: 0.875rem;
		cursor: pointer;
		line-height: 1;
		flex-shrink: 0;
		transition: color 0.1s;
	}
	.sort-chip-remove:hover {
		color: oklch(0.75 0.12 25);
	}
	/* Add sort button */
	.add-sort-details {
		position: relative;
	}
	.add-sort-details summary {
		list-style: none;
	}
	.add-sort-details summary::-webkit-details-marker {
		display: none;
	}
	.add-sort-btn {
		display: flex;
		align-items: center;
		padding: 0 0.5rem;
		min-height: 1.75rem;
		background: transparent;
		border: 1px dashed oklch(0.35 0.03 250 / 0.6);
		border-radius: 0.375rem;
		color: oklch(0.50 0.04 250);
		font-size: 0.75rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		cursor: pointer;
		white-space: nowrap;
		transition: border-color 0.1s, color 0.1s;
	}
	.add-sort-btn:hover,
	.add-sort-details[open] .add-sort-btn {
		border-color: oklch(0.55 0.10 240 / 0.7);
		color: oklch(0.75 0.08 240);
		border-style: solid;
	}
	.add-sort-menu {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		z-index: 40;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.5rem;
		box-shadow: 0 8px 24px oklch(0 0 0 / 0.4);
		min-width: 120px;
		padding: 0.25rem 0;
		animation: dropdown-slide 0.12s ease-out;
	}
	.add-sort-option {
		display: block;
		width: 100%;
		padding: 0.3rem 0.75rem;
		background: transparent;
		border: none;
		text-align: left;
		font-size: 0.8125rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		color: oklch(0.75 0.03 250);
		cursor: pointer;
		transition: background 0.08s, color 0.08s;
	}
	.add-sort-option:hover {
		background: oklch(0.20 0.02 250);
		color: oklch(0.92 0.02 250);
	}


	/* Table container */
	.table-container {
		flex: 1;
		overflow: auto;
		border: 1px solid oklch(0.24 0.02 250);
		border-radius: 0.5rem;
		position: relative;
	}
	.table-container.has-selection {
		padding-bottom: 5rem;
	}

	/* Resize guide line */
	.resize-guide {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 1px;
		border-left: 1px dashed oklch(0.65 0.15 200 / 0.6);
		pointer-events: none;
		z-index: 3;
	}

	/* Table */
	.tasks-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}
	.tasks-table thead {
		position: sticky;
		top: 0;
		z-index: 10;
	}
	.tasks-table th {
		padding: 0.5rem 0.75rem;
		text-align: left;
		font-weight: 600;
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(0.55 0.02 250);
		background: oklch(0.16 0.01 250);
		border-bottom: 1px solid oklch(0.24 0.02 250);
		cursor: pointer;
		user-select: none;
		white-space: nowrap;
		position: relative;
	}
	.tasks-table th:hover {
		color: oklch(0.75 0.08 220);
	}
	.th-cell {
		transition: background 0.1s;
	}
	.th-cell.th-dragging {
		opacity: 0.5;
	}
	.th-cell.th-drag-over {
		background: oklch(0.22 0.04 220);
		border-left: 2px solid oklch(0.60 0.15 220);
	}
	.th-label {
		pointer-events: none;
	}

	/* Column resize handle (action-injected, must use :global since div is created dynamically) */
	:global(.col-resize-handle) {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		width: 5px;
		cursor: col-resize;
		z-index: 2;
	}
	:global(.col-resize-handle:hover) {
		background: oklch(0.55 0.15 200);
	}

	.tasks-table td {
		padding: 0.4rem 0.75rem;
		border-bottom: 1px solid oklch(0.20 0.01 250);
		vertical-align: middle;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Row */
	.task-row {
		transition: background 0.1s;
	}
	.task-row:hover {
		background: oklch(0.18 0.01 250);
	}
	.task-row.saving {
		opacity: 0.7;
	}

	/* Project badge */
	.project-badge {
		display: inline-block;
		padding: 0.0625rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.6875rem;
		font-weight: 500;
		white-space: nowrap;
	}

	/* Priority badge */
	.priority-badge {
		display: inline-block;
		padding: 0.0625rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.6875rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.priority-badge:hover {
		filter: brightness(1.2);
	}

	/* Status pill (column) */
	.status-pill {
		display: inline-block;
		padding: 0.0625rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.6875rem;
		font-weight: 500;
		white-space: nowrap;
		cursor: pointer;
	}

	/* Person + date cell (Created / Updated columns) */
	.person-date-cell {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}
	.person-avatar {
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 50%;
		background: oklch(0.30 0.03 250);
		color: oklch(0.75 0.05 250);
		font-size: 0.5rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		line-height: 1;
	}
	.person-date-text {
		font-size: 0.6875rem;
		color: oklch(var(--bc) / 0.5);
		white-space: nowrap;
	}

	/* Source badge */
	.source-badge {
		display: inline-block;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		background: oklch(0.28 0.03 250);
		color: oklch(0.70 0.06 250);
		border: 1px solid oklch(0.35 0.04 250);
	}
	.source-badge-feedback {
		background: oklch(0.25 0.06 290);
		color: oklch(0.75 0.12 290);
		border-color: oklch(0.35 0.08 290);
	}
	.source-badge-voice {
		background: oklch(0.25 0.07 30);
		color: oklch(0.75 0.12 30);
		border-color: oklch(0.35 0.09 30);
	}
	.source-badge-api {
		background: oklch(0.25 0.06 200);
		color: oklch(0.72 0.10 200);
		border-color: oklch(0.35 0.08 200);
	}

	/* Page URL cell */
	.page-url-cell {
		font-size: 0.6875rem;
		font-family: ui-monospace, monospace;
		color: oklch(var(--bc) / 0.65);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
		display: block;
	}

	.text-muted {
		color: oklch(var(--bc) / 0.25);
		font-size: 0.75rem;
	}

	/* Milestone cell — SearchDropdown assignment */
	.milestone-cell {
		padding: 0 2px !important;
		min-width: 0;
	}
	.milestone-cell :global(.sd-trigger) {
		padding: 0.15rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.6875rem;
		font-weight: 500;
		white-space: nowrap;
		width: 100%;
		min-width: 90px;
		max-width: 160px;
		border: 1px solid transparent;
		background: transparent;
		color: oklch(0.55 0.02 250);
		transition: background 0.1s, border-color 0.1s;
	}
	.milestone-cell-set :global(.sd-trigger) {
		background: oklch(0.65 0.12 260 / 0.15);
		border-color: oklch(0.65 0.12 260 / 0.3);
		color: oklch(0.75 0.12 260);
	}
	.milestone-cell :global(.sd-trigger:hover) {
		background: oklch(0.65 0.12 260 / 0.12);
		border-color: oklch(0.65 0.12 260 / 0.4);
		color: oklch(0.75 0.12 260);
	}

	/* Milestone pill (column) — kept for any other uses */
	.milestone-pill {
		display: inline-block;
		padding: 0.0625rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.6875rem;
		font-weight: 500;
		white-space: nowrap;
		max-width: 120px;
		overflow: hidden;
		text-overflow: ellipsis;
		background: oklch(0.65 0.12 260 / 0.15);
		color: oklch(0.75 0.12 260);
		border: 1px solid oklch(0.65 0.12 260 / 0.3);
	}

	/* Type badge */
	.type-badge {
		font-size: 0.875rem;
		cursor: pointer;
	}

	/* Task ID */
	.task-id-btn {
		background: none;
		border: none;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.6875rem;
		color: oklch(0.50 0.02 250);
		cursor: pointer;
		padding: 0;
		white-space: nowrap;
		transition: color 0.1s;
	}
	.task-id-btn:hover {
		color: oklch(0.75 0.10 220);
	}

	/* Title */
	.task-title-btn {
		background: none;
		border: none;
		color: inherit;
		font: inherit;
		cursor: pointer;
		text-align: left;
		padding: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
	}
	.task-title-btn:hover .task-title-text {
		color: oklch(0.80 0.10 220);
	}
	.task-title-text {
		color: oklch(0.85 0.02 250);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		transition: color 0.1s;
	}
	.visibility-badge {
		flex-shrink: 0;
		width: 12px;
		height: 12px;
		opacity: 0.7;
	}
	.visibility-badge.public {
		color: oklch(0.70 0.18 145);
	}

	/* Due date cell */
	.due-date-cell {
		display: block;
		width: 100%;
		background: none;
		border: none;
		font: inherit;
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		white-space: nowrap;
		color: oklch(0.65 0.02 250);
		padding: 0.4rem 0.75rem;
		text-align: center;
		transition: background 0.1s, color 0.1s;
	}
	.due-date-cell:hover {
		color: oklch(0.80 0.08 220);
		background: oklch(0.22 0.02 250);
	}
	.due-date-cell.overdue {
		color: oklch(0.70 0.20 25);
		font-weight: 600;
	}
	.due-date-cell.due-soon {
		color: oklch(0.75 0.15 65);
		font-weight: 500;
	}
	.no-date {
		color: oklch(0.35 0.01 250);
	}

	/* Assignee */
	.assignee-text {
		font-size: 0.75rem;
		color: oklch(0.65 0.02 250);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Due Date Picker Popover */
	.due-date-picker {
		width: 280px;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		box-shadow: 0 8px 24px oklch(0 0 0 / 0.4), 0 2px 8px oklch(0 0 0 / 0.2);
		overflow: hidden;
	}
	.due-date-picker-header {
		padding: 0.5rem 0.75rem;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(0.55 0.02 250);
		border-bottom: 1px solid oklch(0.22 0.02 250);
	}

	/* Quick set days */
	.due-date-quick-set {
		padding: 0.5rem 0.5rem 0.25rem;
	}
	.quick-day-row {
		display: flex;
		gap: 0.25rem;
	}
	.quick-day-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.0625rem;
		padding: 0.25rem 0.125rem;
		border: 1px solid oklch(0.26 0.02 250);
		border-radius: 0.375rem;
		background: oklch(0.18 0.01 250);
		color: oklch(0.75 0.02 250);
		cursor: pointer;
		transition: all 0.1s;
		font-size: 0.6875rem;
	}
	.quick-day-btn:hover {
		border-color: oklch(0.45 0.10 220);
		background: oklch(0.22 0.02 250);
	}
	.quick-day-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.quick-day-selected {
		border-color: oklch(0.60 0.15 220);
		background: oklch(0.25 0.05 220);
		color: oklch(0.85 0.10 220);
	}
	.quick-day-name {
		font-size: 0.5625rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: oklch(0.55 0.02 250);
	}
	.quick-day-selected .quick-day-name {
		color: oklch(0.70 0.08 220);
	}
	.quick-day-num {
		font-size: 0.8125rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
	.quick-day-labels {
		display: flex;
		gap: 0.25rem;
		margin-top: 0.125rem;
	}
	.quick-day-label-slot {
		flex: 1;
		text-align: center;
		min-height: 0.875rem;
	}
	.quick-day-badge {
		font-size: 0.5rem;
		color: oklch(0.55 0.08 220);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	/* Date/time inputs */
	.due-date-picker-body {
		padding: 0.5rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.due-date-input,
	.due-date-time-input {
		width: 100%;
		padding: 0.375rem 0.5rem;
		font-size: 0.8125rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.90 0.02 250);
		outline: none;
		box-sizing: border-box;
	}
	.due-date-input:focus,
	.due-date-time-input:focus {
		border-color: oklch(0.55 0.12 220);
	}
	.due-date-time-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.due-date-time-label {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.6875rem;
		color: oklch(0.55 0.02 250);
		white-space: nowrap;
		flex-shrink: 0;
	}
	.due-date-time-input {
		flex: 1;
	}

	/* Footer */
	.due-date-picker-footer {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		border-top: 1px solid oklch(0.22 0.02 250);
	}
	.due-date-btn {
		padding: 0.25rem 0.625rem;
		font-size: 0.75rem;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: all 0.1s;
		border: 1px solid transparent;
	}
	.due-date-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.due-date-btn-clear {
		background: none;
		color: oklch(0.70 0.15 25);
		border-color: oklch(0.70 0.15 25 / 0.3);
	}
	.due-date-btn-clear:hover:not(:disabled) {
		background: oklch(0.70 0.15 25 / 0.1);
	}
	.due-date-btn-cancel {
		background: none;
		color: oklch(0.65 0.02 250);
	}
	.due-date-btn-cancel:hover:not(:disabled) {
		background: oklch(0.22 0.02 250);
	}
	.due-date-btn-save {
		background: oklch(0.55 0.12 220);
		color: oklch(0.95 0.01 250);
		font-weight: 500;
	}
	.due-date-btn-save:hover:not(:disabled) {
		background: oklch(0.60 0.14 220);
	}

	/* Labels */
	.labels-list {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
	}
	.label-badge {
		display: inline-block;
		padding: 0 0.3rem;
		border-radius: 0.1875rem;
		font-size: 0.625rem;
		background: oklch(0.25 0.02 250);
		color: oklch(0.70 0.02 250);
		white-space: nowrap;
	}
	.label-more {
		font-size: 0.625rem;
		color: oklch(0.50 0.02 250);
	}

	/* Inline editing */
	.inline-edit-select {
		padding: 0.125rem 0.25rem;
		font-size: 0.75rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.50 0.10 200);
		border-radius: 0.1875rem;
		color: oklch(0.90 0.02 250);
		outline: none;
	}
	.inline-edit-select:focus {
		border-color: oklch(0.60 0.15 220);
	}
	.inline-edit-input {
		width: 100%;
		min-width: 6rem;
		padding: 0.125rem 0.375rem;
		font-size: 0.75rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.50 0.10 200);
		border-radius: 0.1875rem;
		color: oklch(0.90 0.02 250);
		outline: none;
		font-family: inherit;
	}
	.inline-edit-input:focus {
		border-color: oklch(0.60 0.15 220);
	}
	.assignee-editable {
		display: inline-block;
		min-width: 3rem;
		cursor: text;
		padding: 0.0625rem 0.125rem;
		border-radius: 0.125rem;
	}
	.assignee-editable:hover {
		background: oklch(0.20 0.02 250);
	}
	.title-editable {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		cursor: text;
		padding: 0.0625rem 0.125rem;
		border-radius: 0.125rem;
		overflow: hidden;
	}
	.title-editable:hover {
		background: oklch(0.20 0.02 250);
	}
	.title-editable:hover .task-title-text {
		color: oklch(0.80 0.10 220);
	}
	.label-editable {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		flex-wrap: wrap;
		min-width: 3rem;
		cursor: text;
		padding: 0.0625rem 0.125rem;
		border-radius: 0.125rem;
	}
	.label-editable:hover {
		background: oklch(0.20 0.02 250);
	}
	.no-labels {
		color: oklch(0.50 0.02 250);
		font-size: 0.75rem;
	}

	/* Actions */
	.action-buttons {
		display: flex;
		gap: 0.25rem;
		opacity: 0;
		transition: opacity 0.1s;
	}
	.task-row:hover .action-buttons {
		opacity: 1;
	}
	.action-btn {
		background: none;
		border: 1px solid transparent;
		color: oklch(0.55 0.02 250);
		cursor: pointer;
		padding: 0.2rem;
		border-radius: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.1s;
	}
	.action-btn:hover {
		color: oklch(0.80 0.10 220);
		background: oklch(0.22 0.02 250);
		border-color: oklch(0.30 0.03 250);
	}

	/* States */
	.loading-state {
		padding: 2rem;
	}
	.skeleton-table {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.skeleton-row {
		display: flex;
		gap: 1rem;
		animation: fade-in 0.3s ease-out both;
	}
	.skeleton {
		background: oklch(0.22 0.02 250);
		animation: skeleton-pulse 2s ease-in-out infinite;
	}

	.error-state {
		padding: 2rem;
		text-align: center;
		color: oklch(0.70 0.20 25);
	}
	.empty-state {
		padding: 3rem;
		text-align: center;
	}
	.empty-title {
		font-size: 1rem;
		font-weight: 500;
		color: oklch(0.65 0.02 250);
		margin-bottom: 0.25rem;
	}
	.empty-desc {
		font-size: 0.8125rem;
		color: oklch(0.45 0.02 250);
	}

	/* Context Menu */
	.col-ctx-menu {
		position: fixed;
		z-index: 100;
		min-width: 200px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		padding: 0.375rem;
		box-shadow: 0 10px 30px oklch(0.05 0 0 / 0.5);
		animation: contextMenuIn 0.1s ease;
	}
	.col-ctx-menu-hidden { display: none; }
	.col-ctx-header {
		padding: 0.25rem 0.5rem 0.375rem;
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(0.55 0.05 250);
		border-bottom: 1px solid oklch(0.28 0.02 250);
		margin-bottom: 0.25rem;
	}
	.col-ctx-item {
		display: block;
		width: 100%;
		text-align: left;
		padding: 0.375rem 0.625rem;
		font-size: 0.8rem;
		color: oklch(0.80 0.05 250);
		border-radius: 0.25rem;
		background: none;
		border: none;
		cursor: pointer;
	}
	.col-ctx-item:hover {
		background: oklch(0.28 0.04 250);
		color: oklch(0.95 0.03 250);
	}
	.task-context-menu {
		position: fixed;
		z-index: 100;
		min-width: 180px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		padding: 0.375rem;
		box-shadow: 0 10px 30px oklch(0.05 0 0 / 0.5);
		animation: contextMenuIn 0.1s ease;
	}
	.task-context-menu-hidden {
		display: none;
	}
	@keyframes contextMenuIn {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}
	.task-context-menu-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: none;
		background: transparent;
		color: oklch(0.80 0.02 250);
		font-size: 0.8125rem;
		text-align: left;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.1s ease;
	}
	.task-context-menu-item:hover {
		background: oklch(0.25 0.02 250);
	}
	.task-context-menu-item svg {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		color: oklch(0.60 0.02 250);
	}
	.task-context-menu-item:hover svg {
		color: oklch(0.75 0.02 250);
	}
	.task-context-menu-item-danger:hover {
		background: oklch(0.55 0.15 30 / 0.2);
		color: oklch(0.75 0.18 30);
	}
	.task-context-menu-item-danger:hover svg {
		color: oklch(0.70 0.18 30);
	}
	.task-context-menu-divider {
		height: 1px;
		background: oklch(0.28 0.02 250);
		margin: 0.375rem 0;
	}
	.task-context-menu-submenu-container {
		position: relative;
	}
	.task-context-submenu {
		position: absolute;
		left: 100%;
		top: 0;
		min-width: 150px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		padding: 0.375rem;
		box-shadow: 0 10px 30px oklch(0.05 0 0 / 0.5);
		animation: contextMenuIn 0.1s ease;
		margin-left: 2px;
	}
	.task-context-submenu-epic {
		min-width: 220px;
		max-height: 240px;
		overflow-y: auto;
	}
	.task-context-submenu-project {
		max-height: 300px;
		overflow-y: auto;
	}
	.task-context-menu-chevron {
		width: 12px !important;
		height: 12px !important;
		margin-left: auto;
		color: oklch(0.50 0.02 250) !important;
	}
	.task-status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.task-context-menu-item-active {
		color: oklch(0.85 0.02 250);
	}
	.task-context-menu-check {
		width: 14px !important;
		height: 14px !important;
		margin-left: auto;
		color: oklch(0.70 0.15 145) !important;
	}
	.task-context-menu-loading {
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		color: oklch(0.55 0.02 250);
	}
	.task-epic-id {
		font-size: 0.6875rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		color: oklch(0.60 0.02 250);
		flex-shrink: 0;
	}
	.task-epic-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.task-epic-create-input {
		flex: 1;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.25rem;
		padding: 0.25rem 0.375rem;
		font-size: 0.75rem;
		color: oklch(0.90 0.02 250);
		outline: none;
	}
	.task-epic-create-input:focus {
		border-color: oklch(0.55 0.15 250);
	}
	.task-epic-create-btn {
		background: oklch(0.30 0.02 250);
		border: 1px solid oklch(0.35 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.80 0.02 250);
		font-size: 0.875rem;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		flex-shrink: 0;
	}
	.task-epic-create-btn:hover:not(:disabled) {
		background: oklch(0.40 0.10 145);
		border-color: oklch(0.50 0.12 145);
	}
	.task-epic-create-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}

	/* === Bulk Selection === */
	.th-checkbox, .td-checkbox {
		width: 32px;
		min-width: 32px;
		max-width: 32px;
		text-align: center;
		padding: 0 !important;
	}
	.td-checkbox {
		cursor: pointer;
	}
	.bulk-checkbox {
		width: 14px;
		height: 14px;
		cursor: pointer;
		accent-color: oklch(0.70 0.18 240);
		opacity: 0;
		transition: opacity 0.15s;
	}
	.task-row:hover .bulk-checkbox,
	.bulk-checkbox:checked,
	.has-selection .bulk-checkbox {
		opacity: 1;
	}
	.select-all-checkbox {
		opacity: 0;
		transition: opacity 0.15s;
	}
	.has-selection .select-all-checkbox,
	.tasks-table thead:hover .select-all-checkbox {
		opacity: 1;
	}
	.selected-row {
		background: oklch(0.70 0.18 240 / 0.08) !important;
	}
	.selected-row:hover {
		background: oklch(0.70 0.18 240 / 0.12) !important;
	}
	.bulk-error {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: oklch(0.55 0.15 30 / 0.12);
		border-bottom: 1px solid oklch(0.55 0.15 30 / 0.25);
		color: oklch(0.75 0.15 30);
		font-size: 0.8125rem;
		flex-shrink: 0;
	}
	.bulk-error span {
		flex: 1;
	}
	.bulk-error button {
		display: flex;
		align-items: center;
		background: transparent;
		border: none;
		color: oklch(0.65 0.10 30);
		cursor: pointer;
		padding: 0.125rem;
		border-radius: 0.25rem;
	}
	.bulk-error button:hover {
		color: oklch(0.80 0.15 30);
		background: oklch(0.55 0.15 30 / 0.15);
	}

	/* === Floating Action Bar === */
	.floating-action-bar {
		position: fixed;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 50;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: oklch(0.16 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.75rem;
		box-shadow: 0 8px 32px oklch(0.05 0 0 / 0.6), 0 2px 8px oklch(0.05 0 0 / 0.3);
	}
	.floating-count {
		font-size: 0.8125rem;
		font-weight: 600;
		color: oklch(0.85 0.02 250);
		white-space: nowrap;
	}
	.floating-divider {
		width: 1px;
		height: 1.25rem;
		background: oklch(0.30 0.02 250);
	}
	.floating-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.625rem;
		border: 1px solid transparent;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
	}
	.floating-btn:disabled {
		opacity: 0.5;
		pointer-events: none;
	}
	.floating-btn-spawn {
		background: oklch(0.65 0.18 250 / 0.15);
		color: oklch(0.82 0.14 250);
		border-color: oklch(0.65 0.18 250 / 0.3);
	}
	.floating-btn-spawn:hover {
		background: oklch(0.65 0.18 250 / 0.25);
	}
	.floating-btn-close {
		background: oklch(0.75 0.15 85 / 0.12);
		color: oklch(0.80 0.12 85);
		border-color: oklch(0.75 0.15 85 / 0.25);
	}
	.floating-btn-close:hover {
		background: oklch(0.75 0.15 85 / 0.22);
	}
	.floating-btn-delete {
		background: oklch(0.55 0.18 30 / 0.15);
		color: oklch(0.80 0.15 30);
		border-color: oklch(0.55 0.18 30 / 0.3);
	}
	.floating-btn-delete:hover {
		background: oklch(0.55 0.18 30 / 0.25);
	}
	.floating-btn-clear {
		background: transparent;
		color: oklch(0.65 0.02 250);
	}
	.floating-btn-clear:hover {
		background: oklch(0.25 0.02 250);
		color: oklch(0.80 0.02 250);
	}
	.floating-btn-priority {
		background: oklch(0.55 0.15 200 / 0.15);
		color: oklch(0.80 0.12 200);
		border-color: oklch(0.55 0.15 200 / 0.3);
	}
	.floating-btn-priority:hover {
		background: oklch(0.55 0.15 200 / 0.25);
	}
	.floating-btn-harness {
		background: oklch(0.55 0.15 300 / 0.15);
		color: oklch(0.80 0.12 300);
		border-color: oklch(0.55 0.15 300 / 0.3);
	}
	.floating-btn-harness:hover {
		background: oklch(0.55 0.15 300 / 0.25);
	}
	.floating-btn-promote {
		background: oklch(0.55 0.18 145 / 0.15);
		color: oklch(0.75 0.18 145);
		border-color: oklch(0.55 0.18 145 / 0.3);
	}
	.floating-btn-promote:hover {
		background: oklch(0.55 0.18 145 / 0.25);
	}
	.floating-btn-hide {
		background: oklch(0.65 0.15 85 / 0.15);
		color: oklch(0.80 0.15 85);
		border-color: oklch(0.65 0.15 85 / 0.3);
	}
	.floating-btn-hide:hover {
		background: oklch(0.65 0.15 85 / 0.25);
	}
	.floating-btn-publish {
		background: oklch(0.55 0.18 145 / 0.15);
		color: oklch(0.75 0.18 145);
		border-color: oklch(0.55 0.18 145 / 0.3);
	}
	.floating-btn-publish:hover {
		background: oklch(0.55 0.18 145 / 0.25);
	}
	.floating-btn-copy {
		background: oklch(0.55 0.10 250 / 0.15);
		color: oklch(0.75 0.12 250);
		border-color: oklch(0.55 0.10 250 / 0.3);
	}
	.floating-btn-copy:hover { background: oklch(0.55 0.10 250 / 0.25); }
	.floating-btn-export {
		background: oklch(0.55 0.12 190 / 0.15);
		color: oklch(0.75 0.12 190);
		border-color: oklch(0.55 0.12 190 / 0.3);
	}
	.floating-btn-export:hover { background: oklch(0.55 0.12 190 / 0.25); }
	.floating-btn-delete-armed {
		background: oklch(0.65 0.20 25 / 0.30) !important;
		color: oklch(0.85 0.15 25) !important;
		border-color: oklch(0.65 0.20 25 / 0.6) !important;
		animation: armed-pulse 0.8s ease-in-out infinite;
	}
	@keyframes armed-pulse {
		0%, 100% { box-shadow: 0 0 0 0 oklch(0.65 0.20 25 / 0.4); }
		50% { box-shadow: 0 0 0 4px oklch(0.65 0.20 25 / 0); }
	}
	.floating-spinner {
		width: 14px;
		height: 14px;
		border: 2px solid oklch(0.35 0.02 250);
		border-top-color: oklch(0.70 0.15 240);
		border-radius: 50%;
		animation: floating-spin 0.6s linear infinite;
	}
	@keyframes floating-spin {
		to { transform: rotate(360deg); }
	}
	.floating-dropdown-wrapper {
		position: relative;
	}
	.floating-dropdown {
		position: absolute;
		bottom: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%);
		min-width: 160px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.5rem;
		padding: 0.375rem;
		box-shadow: 0 8px 24px oklch(0.05 0 0 / 0.5);
		z-index: 60;
	}
	.floating-dropdown-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.375rem 0.625rem;
		border: none;
		background: transparent;
		color: oklch(0.80 0.02 250);
		font-size: 0.75rem;
		text-align: left;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background 0.1s;
		white-space: nowrap;
	}
	.floating-dropdown-item:hover {
		background: oklch(0.25 0.02 250);
	}
	.floating-priority-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}
</style>

<KeyboardShortcutsOverlay
	bind:open={shortcutsOpen}
	title="Open Tasks Shortcuts"
	sections={[
		{
			title: 'Navigation',
			shortcuts: [
				{ key: 'j / ↓', description: 'Focus next task' },
				{ key: 'k / ↑', description: 'Focus previous task' },
				{ key: 'Enter', description: 'Open task detail drawer' },
				{ key: '/ or f', description: 'Focus search input' },
				{ key: '?', description: 'Show this help overlay' },
				{ key: 'Esc', description: 'Clear focus / close dropdowns' },
			],
		},
		{
			title: 'Filter shortcuts (no selection)',
			shortcuts: [
				{ key: 'p', description: 'Open Priority filter' },
				{ key: 's', description: 'Open Status filter' },
				{ key: 'a', description: 'Open Assignee filter' },
				{ key: 'm', description: 'Open Milestone filter' },
				{ key: 't', description: 'Open Type filter' },
				{ key: 'l', description: 'Open Label filter' },
			],
		},
		{
			title: 'Bulk actions (with selection)',
			shortcuts: [
				{ key: 'p', description: 'Bulk: set priority' },
				{ key: 's', description: 'Bulk: set status' },
				{ key: 'a', description: 'Bulk: assign' },
				{ key: 'm', description: 'Bulk: set milestone' },
				{ key: 't', description: 'Bulk: set type' },
				{ key: 'e', description: 'Bulk: assign to epic' },
				{ key: 'c', description: 'Bulk: close tasks' },
				{ key: 'h', description: 'Bulk: hide (set dev status)' },
				{ key: 'P', description: 'Bulk: promote (set open status)' },
				{ key: 'Esc', description: 'Clear selection / close bulk dropdowns' },
			],
		},
		{
			title: 'Selection',
			shortcuts: [
				{ key: 'x', description: 'Toggle select focused task' },
				{ key: 'Click', description: 'Select task (Shift+click for range)' },
			],
		},
	]}
/>
