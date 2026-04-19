<script lang="ts">
	/**
	 * UnifiedSearch - Single search component for both /search route and Ctrl+K modal.
	 *
	 * 5 tabs: Cmd | Tasks | Files | Content | Memory
	 * - Cmd: route/command launcher with fuzzy filter
	 * - Tasks/Memory: focused results via /api/search?sources=...
	 * - Filenames: fuzzy filename matching via /api/files/search
	 * - Content: ripgrep content search via /api/files/grep (with regex/case/glob options)
	 *
	 * Two rendering modes:
	 * - route: full page, URL-synced state
	 * - modal: overlay triggered by Ctrl+K or topbar icon
	 *
	 * Task: jat-fqaqf
	 */

	import { onMount, tick, untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import TaskIdBadge from '$lib/components/TaskIdBadge.svelte';
	import TaskDetailDrawer from '$lib/components/TaskDetailDrawer.svelte';
	import FxText from '$lib/components/FxText.svelte';
	import SearchDropdown from '$lib/components/SearchDropdown.svelte';
	import type { SearchDropdownGroup } from '$lib/components/SearchDropdown.svelte';
	import { fetchAndGetProjectColors, getProjectColor } from '$lib/utils/projectColors';
	import { unifiedNavConfig } from '$lib/config/navConfig';
	import { openTaskDrawer } from '$lib/stores/drawerStore';
	import { createListNav } from '$lib/actions/listNav';
	import KeyboardShortcutsOverlay from '$lib/components/KeyboardShortcutsOverlay.svelte';

	// --- Types ---
	interface TaskResult {
		id: string;
		title: string;
		status: string;
		priority: number;
		issue_type?: string;
		description?: string;
		snippet?: string;
		score?: number;
		labels?: string[];
		assignee?: string;
	}

	interface MemoryResult {
		file: string;
		taskId?: string;
		section?: string;
		snippet?: string;
		score?: number;
		agent?: string;
		date?: string;
	}

	interface FileResult {
		path: string;
		line?: number;
		snippet?: string;
		matchType?: string;
		project?: string;
	}

	interface FilenameResult {
		path: string;
		name: string;
		folder: string;
	}

	interface ContentResult {
		file: string;
		line: number;
		content: string;
		before?: string[];
		after?: string[];
	}

	interface SearchMeta {
		queryTime: number;
		totalResults: number;
		sources: string[];
		query: string;
		limit: number;
	}

	type SourceTab = 'routes' | 'tasks' | 'filenames' | 'content' | 'memory';

	const TABS: { id: SourceTab; label: string; icon: string }[] = [
		{ id: 'routes', label: 'Cmd', icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
		{ id: 'tasks', label: 'Tasks', icon: 'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z' },
		{ id: 'filenames', label: 'Files', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
		{ id: 'content', label: 'Content', icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5' },
		{ id: 'memory', label: 'Memory', icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125' },
	];

	// --- Route/Command Actions ---
	interface RouteAction {
		id: string;
		label: string;
		description: string;
		keywords: string[];
		path?: string;
		execute?: () => void;
	}

	const ROUTE_ACTIONS: RouteAction[] = [
		{ id: 'nav-tasks', label: 'Tasks', description: 'Open tasks list', keywords: ['tasks', 'list', 'work', 'queue'], path: '/tasks' },
		{ id: 'nav-sessions', label: 'Sessions', description: 'View active agent sessions', keywords: ['sessions', 'work', 'agents', 'terminal', 'active'], path: '/sessions' },
		{ id: 'nav-triage', label: 'Triage', description: 'Triage incoming tasks', keywords: ['triage', 'inbox', 'radar', 'review'], path: '/triage' },
		{ id: 'nav-kanban', label: 'Kanban', description: 'Kanban board view', keywords: ['kanban', 'board', 'columns', 'workflow'], path: '/kanban' },
		{ id: 'nav-history', label: 'History', description: 'Task history and timeline', keywords: ['history', 'timeline', 'log', 'chronological'], path: '/history' },
		{ id: 'nav-files', label: 'Files', description: 'Browse and edit project files', keywords: ['files', 'browse', 'edit', 'editor', 'code', 'tree'], path: '/files' },
		{ id: 'nav-source', label: 'Source', description: 'Git source and diffs', keywords: ['source', 'git', 'diff', 'commits', 'branches'], path: '/source' },
		{ id: 'nav-servers', label: 'Servers', description: 'Dev server management', keywords: ['servers', 'dev', 'port', 'process', 'run'], path: '/servers' },
		{ id: 'nav-agents', label: 'Agents', description: 'Agent registry and status', keywords: ['agents', 'ai', 'workers', 'registry'], path: '/agents' },
		{ id: 'nav-memory', label: 'Memory', description: 'Agent memory viewer', keywords: ['memory', 'context', 'recall', 'knowledge'], path: '/memory' },
		{ id: 'nav-search', label: 'Search', description: 'Full search page', keywords: ['search', 'find', 'query'], path: '/search' },
		{ id: 'nav-data', label: 'Data', description: 'Data and analytics', keywords: ['data', 'analytics', 'stats', 'metrics'], path: '/data' },
		{ id: 'nav-bases', label: 'Bases', description: 'Knowledge bases', keywords: ['bases', 'knowledge', 'docs', 'documentation'], path: '/bases' },
		{ id: 'nav-integrations', label: 'Integrations', description: 'External integrations', keywords: ['integrations', 'connect', 'api', 'webhooks'], path: '/integrations' },
		{ id: 'nav-config', label: 'Config', description: 'IDE settings and configuration', keywords: ['config', 'settings', 'preferences', 'setup'], path: '/config' },
		{ id: 'nav-monitor', label: 'Monitor', description: 'Live monitoring view', keywords: ['monitor', 'live', 'watch', 'overview'], path: '/monitor' },
		{ id: 'create-task', label: 'Create Task', description: 'Open task creation drawer', keywords: ['create', 'new', 'task', 'add', 'issue'], execute: () => { openTaskDrawer(); } },
		{ id: 'pause-all', label: 'Pause All Agents', description: 'Send Ctrl+C to all active sessions', keywords: ['pause', 'stop', 'interrupt', 'halt', 'agents'], execute: async () => { await fetch('/api/sessions/pause-all', { method: 'POST' }); } },
	];

	// --- Props ---
	interface Props {
		mode: 'route' | 'modal';
		isOpen?: boolean;
		onClose?: () => void;
		projects?: string[];
		selectedProject?: string;
		onProjectChange?: (project: string) => void;
		initialQuery?: string;
		initialTab?: SourceTab;
		/** Callback when a file result is selected (for /files page integration) */
		onFileSelect?: (path: string, line: number, project: string) => void;
	}

	let {
		mode,
		isOpen = $bindable(false),
		onClose,
		projects = [],
		selectedProject: projectProp = '',
		onProjectChange,
		initialQuery = '',
		initialTab = 'routes',
		onFileSelect,
	}: Props = $props();

	// --- State ---
	let query = $state(initialQuery);
	let activeTab = $state<SourceTab>(initialTab);
	let selectedProject = $state(projectProp);
	let projectColors = $state<Record<string, string>>({});

	const projectGroups = $derived.by<SearchDropdownGroup[]>(() => [{
		label: 'Projects',
		options: [
			{ value: '', label: 'All Projects' },
			...projects.map(p => ({ value: p, label: p }))
		]
	}]);

	function getSearchProjectColor(project: string): string | undefined {
		if (!project) return undefined;
		return projectColors[project.toLowerCase()] || getProjectColor(project + '-x');
	}

	// All/Tasks/Memory results (from /api/search)
	let taskResults = $state<TaskResult[]>([]);
	let memoryResults = $state<MemoryResult[]>([]);
	let fileResults = $state<FileResult[]>([]);
	let meta = $state<SearchMeta | null>(null);

	// Filenames tab results (from /api/files/search)
	let filenameResults = $state<FilenameResult[]>([]);
	let filenameLoading = $state(false);

	// Content tab results (from /api/files/grep)
	let contentResults = $state<ContentResult[]>([]);
	let contentLoading = $state(false);
	let contentTruncated = $state(false);

	// Content tab options
	let useRegex = $state(false);
	let caseSensitive = $state(false);
	let globFilter = $state('');

	let loading = $state(false);
	let error = $state('');
	let routeResults = $state<RouteAction[]>([...ROUTE_ACTIONS]);

	// Keyboard navigation for filenames/content results
	let selectedResultIndex = $state(-1);

	// Task detail drawer
	let selectedTaskId = $state<string | null>(null);
	let drawerOpen = $state(false);

	// Debounce
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Refs
	let searchInputEl: HTMLInputElement | undefined;
	let resultsContainerEl: HTMLDivElement | undefined;
	// Keyboard nav via listNav composable
	const nav = createListNav({
		getItems: () => resultsContainerEl
			? Array.from(resultsContainerEl.querySelectorAll<HTMLElement>('[data-nav-id]'))
			: [],
		onFocusChange: (_el, idx) => { selectedResultIndex = idx; },
		onSelect: (el) => openResultByNavId(el.dataset.navId ?? ''),
		onEscape: () => { nav.clear(); selectedResultIndex = -1; },
		focusedClass: 'result-selected',
	});

	function openResultByNavId(navId: string) {
		if (!navId) return;
		if (activeTab === 'routes') {
			const action = routeResults.find(r => r.id === navId);
			if (action?.execute) { action.execute(); closeModal(); }
			else if (action?.path) { goto(action.path); closeModal(); }
		} else if (activeTab === 'tasks') {
			const task = taskResults.find(t => t.id === navId);
			if (task) openTask(task.id);
		} else if (activeTab === 'memory') {
			const mem = memoryResults.find(m => m.file === navId);
			if (mem) navigateToMemory(mem.file);
		} else if (activeTab === 'filenames') {
			const file = filenameResults.find(f => f.path === navId);
			if (file) openFilename(file);
		} else if (activeTab === 'content') {
			const result = contentResults.find(r => `${r.file}:${r.line}` === navId);
			if (result) openContentResult(result);
		}
	}

	// Refresh nav index when results change
	$effect(() => {
		taskResults; memoryResults; filenameResults; contentResults; routeResults;
		nav.refresh();
	});

	// --- Sync props ---
	$effect(() => {
		selectedProject = projectProp;
	});

	// Focus input when modal opens
	$effect(() => {
		if (mode === 'modal' && isOpen) {
			query = '';
			taskResults = [];
			memoryResults = [];
			fileResults = [];
			filenameResults = [];
			contentResults = [];
			meta = null;
			activeTab = 'routes';
			untrack(() => filterRoutes(''));
			selectedResultIndex = -1;
			requestAnimationFrame(() => searchInputEl?.focus());
		}
	});

	// --- Derived ---
	const taskCount = $derived(taskResults.length);
	const memoryCount = $derived(memoryResults.length);
	const fileCount = $derived(fileResults.length);
	const filenameCount = $derived(filenameResults.length);
	const contentCount = $derived(contentResults.length);
	const allCount = $derived(taskCount + memoryCount + filenameCount + contentCount);

	function tabCount(tab: SourceTab): number {
		switch (tab) {
			case 'routes': return routeResults.length;
			case 'tasks': return taskCount;
			case 'memory': return memoryCount;
			case 'filenames': return filenameCount;
			case 'content': return contentCount;
		}
	}

	const hasSearched = $derived(meta !== null || filenameResults.length > 0 || contentResults.length > 0 || (activeTab === 'routes'));
	const currentTabHasResults = $derived(
		tabCount(activeTab) > 0 ||
		(activeTab === 'filenames' && filenameLoading) ||
		(activeTab === 'content' && contentLoading)
	);

	// --- Search Functions ---
	async function doUnifiedSearch() {
		if (!query.trim()) {
			taskResults = [];
			memoryResults = [];
			fileResults = [];
			meta = null;
			return;
		}

		loading = true;
		error = '';

		try {
			const params = new URLSearchParams({ q: query.trim(), limit: '10' });

			// For individual tabs, only request that source
			if (activeTab === 'tasks') {
				params.set('sources', 'tasks');
			} else if (activeTab === 'memory') {
				params.set('sources', 'memory');
			}
			// 'all' requests everything (default)

			if (selectedProject) {
				params.set('project', selectedProject);
			}

			const res = await fetch(`/api/search?${params}`);
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Search failed');
			}

			const data = await res.json();
			taskResults = data.tasks || [];
			memoryResults = data.memory || [];
			fileResults = data.files || [];
			meta = data.meta || null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Search failed';
			taskResults = [];
			memoryResults = [];
			fileResults = [];
		} finally {
			loading = false;
		}
	}

	async function doFilenameSearch() {
		if (!query.trim() || !selectedProject) {
			filenameResults = [];
			return;
		}

		filenameLoading = true;
		try {
			const params = new URLSearchParams({
				project: selectedProject,
				query: query.trim(),
				limit: '30'
			});
			const res = await fetch(`/api/files/search?${params}`);
			if (res.ok) {
				const data = await res.json();
				filenameResults = data.files || [];
			} else {
				filenameResults = [];
			}
		} catch {
			filenameResults = [];
		} finally {
			filenameLoading = false;
		}
	}

	async function doContentSearch() {
		if (!query.trim() || !selectedProject) {
			contentResults = [];
			contentTruncated = false;
			return;
		}

		contentLoading = true;
		try {
			const params = new URLSearchParams({
				project: selectedProject,
				q: query.trim(),
				limit: '100',
				context: '1'
			});

			if (globFilter.trim()) params.set('glob', globFilter.trim());
			if (useRegex) params.set('regex', 'true');
			if (caseSensitive) params.set('case', 'true');

			const res = await fetch(`/api/files/grep?${params}`);
			if (res.ok) {
				const data = await res.json();
				contentResults = data.results || [];
				contentTruncated = data.truncated || false;
			} else {
				contentResults = [];
				contentTruncated = false;
			}
		} catch {
			contentResults = [];
			contentTruncated = false;
		} finally {
			contentLoading = false;
		}
	}

	function filterRoutes(q: string) {
		const projectActions: RouteAction[] = (projects ?? [])
			.filter(p => p && p !== 'All Projects')
			.map(p => ({
				id: `switch-project-${p}`,
				label: p,
				description: p === selectedProject ? 'Current project' : `Switch to ${p}`,
				keywords: [p.toLowerCase(), 'project', 'switch', 'go'],
				execute: () => { onProjectChange?.(p); closeModal(); }
			}));
		const allActions = [...projectActions, ...ROUTE_ACTIONS];
		if (!q.trim()) { routeResults = allActions; return; }
		const ql = q.toLowerCase();
		routeResults = allActions.filter(a =>
			a.label.toLowerCase().includes(ql) ||
			a.description.toLowerCase().includes(ql) ||
			a.keywords.some(k => k.includes(ql))
		).sort((a, b) => {
			const score = (a: RouteAction) =>
				a.label.toLowerCase().startsWith(ql) ? 3 :
				a.label.toLowerCase().includes(ql) ? 2 :
				a.keywords.some(k => k.startsWith(ql)) ? 1 : 0;
			return score(b) - score(a);
		});
	}

	function doSearchForActiveTab() {
		nav.clear();
		selectedResultIndex = -1;
		if (activeTab === 'routes') {
			filterRoutes(query);
			return;
		} else if (activeTab === 'filenames') {
			doFilenameSearch();
		} else if (activeTab === 'content') {
			doContentSearch();
		} else {
			doUnifiedSearch();
		}
	}

	// --- URL Sync (route mode only) ---
	function updateUrl() {
		if (mode !== 'route') return;
		const params = new URLSearchParams();
		if (query) params.set('q', query);
		if (activeTab !== 'routes') params.set('tab', activeTab);
		if (selectedProject) params.set('project', selectedProject);
		const search = params.toString();
		const newUrl = `/search${search ? '?' + search : ''}`;
		goto(newUrl, { replaceState: true, keepFocus: true });
	}

	// --- Event Handlers ---
	function handleInput() {
		filterRoutes(query); // instant, client-side
		// Auto-select first result when filtering routes with a query
		if (activeTab === 'routes') {
			const autoIdx = query.trim() && routeResults.length > 0 ? 0 : -1;
			if (autoIdx >= 0) nav.focus(autoIdx); else nav.clear();
			selectedResultIndex = autoIdx;
		}
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			if (mode === 'route') updateUrl();
			if (activeTab !== 'routes') doSearchForActiveTab();
		}, 300);
	}

	function activeTabResultCount(): number {
		switch (activeTab) {
			case 'routes': return routeResults.length;
			case 'tasks': return taskResults.length;
			case 'memory': return memoryResults.length;
			case 'filenames': return filenameResults.length;
			case 'content': return contentResults.length;
			default: return 0;
		}
	}

	function openSelectedResult(): boolean {
		if (selectedResultIndex < 0) return false;
		if (activeTab === 'routes' && selectedResultIndex < routeResults.length) {
			const action = routeResults[selectedResultIndex];
			if (action.execute) { action.execute(); closeModal(); }
			else if (action.path) { goto(action.path); closeModal(); }
			return true;
		}
		if (activeTab === 'tasks' && selectedResultIndex < taskResults.length) {
			openTask(taskResults[selectedResultIndex].id);
			return true;
		}
		if (activeTab === 'memory' && selectedResultIndex < memoryResults.length) {
			navigateToMemory(memoryResults[selectedResultIndex].file);
			return true;
		}
		if (activeTab === 'filenames' && selectedResultIndex < filenameResults.length) {
			openFilename(filenameResults[selectedResultIndex]);
			return true;
		}
		if (activeTab === 'content' && selectedResultIndex < contentResults.length) {
			openContentResult(contentResults[selectedResultIndex]);
			return true;
		}
		return false;
	}

	// --- Tab cycling helpers ---
	function cycleTab(direction: number): SourceTab {
		nav.clear();
		const currentIndex = TABS.findIndex(t => t.id === activeTab);
		const nextIndex = (currentIndex + direction + TABS.length) % TABS.length;
		const newTab = TABS[nextIndex].id;
		activeTab = newTab;
		selectedResultIndex = -1;
		if (mode === 'route') updateUrl();
		if (newTab === 'routes') {
			filterRoutes(query);
		} else if (query.trim()) {
			doSearchForActiveTab();
		}
		return newTab;
	}

	function focusTabButton(tabId: SourceTab) {
		tick().then(() => {
			const btn = document.querySelector(`[data-tab="${tabId}"]`) as HTMLElement;
			btn?.focus();
		});
	}

	// --- Keyboard: 3-zone navigation (Input ↔ Tab Bar ↔ Results) ---
	function handleKeydown(e: KeyboardEvent) {
		const target = e.target as HTMLElement;
		const isInput = target === searchInputEl;
		const isTabButton = !!target.getAttribute?.('data-tab');

		// '/' focuses search input from outside
		if (e.key === '/' && !isInput && !isTabButton && !e.ctrlKey && !e.metaKey && !e.altKey) {
			e.preventDefault();
			searchInputEl?.focus();
			return;
		}

		// Tab key cycles tabs (Shift+Tab goes backward)
		if (e.key === 'Tab' && !e.altKey && !e.ctrlKey && !e.metaKey) {
			e.preventDefault();
			const newTab = cycleTab(e.shiftKey ? -1 : 1); // cycleTab calls nav.clear()
			searchInputEl?.focus();
			return;
		}

		// When focused on tab bar, redirect typing to search input
		if (isTabButton && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
			searchInputEl?.focus();
			return;
		}

		if (e.key === 'Enter') {
			e.preventDefault();
			if (debounceTimer) clearTimeout(debounceTimer);
			// Routes tab: directly execute selected (or first) action — don't go through state update cycle
			if (activeTab === 'routes' && routeResults.length > 0) {
				const idx = selectedResultIndex >= 0 ? Math.min(selectedResultIndex, routeResults.length - 1) : 0;
				const action = routeResults[idx];
				if (action?.execute) { action.execute(); closeModal(); }
				else if (action.path) { goto(action.path); closeModal(); }
				return;
			}
			if (openSelectedResult()) return;
			if (mode === 'route') updateUrl();
			doSearchForActiveTab();
		}

		if (e.key === 'Escape') {
			nav.clear();
			if (mode === 'modal') {
				if (query) {
					query = '';
					taskResults = []; memoryResults = []; fileResults = [];
					filenameResults = []; contentResults = [];
					meta = null;
					filterRoutes('');
				} else {
					onClose?.();
				}
			} else if (isTabButton) {
				searchInputEl?.focus();
			} else {
				query = ''; taskResults = []; memoryResults = []; fileResults = [];
				filenameResults = []; contentResults = [];
				meta = null;
				updateUrl();
			}
		}

		// ArrowDown/Up always navigate from input; j/k only navigate from tab bar (not input)
		const isNavDown = e.key === 'ArrowDown' || (e.key === 'j' && !isInput);
		const isNavUp = e.key === 'ArrowUp' || (e.key === 'k' && !isInput);
		if ((isNavDown || isNavUp)
				&& (isInput || isTabButton)
				&& !e.ctrlKey && !e.metaKey && !e.altKey) {
			const isDown = isNavDown;
			if (isDown) {
				e.preventDefault();
				e.stopPropagation();
				const maxIndex = activeTabResultCount();
				if (maxIndex > 0) {
					nav.focus(selectedResultIndex < 0 ? 0 : selectedResultIndex + 1);
					scrollSelectedIntoView();
					if (isTabButton) searchInputEl?.focus();
				} else if (e.key === 'ArrowDown' && query && activeTab !== 'routes' && debounceTimer) {
					// ArrowDown-only: trigger pending search immediately
					clearTimeout(debounceTimer);
					debounceTimer = null;
					doSearchForActiveTab();
				}
			} else {
				e.preventDefault();
				e.stopPropagation();
				if (selectedResultIndex > 0) {
					nav.focus(selectedResultIndex - 1);
					scrollSelectedIntoView();
				} else {
					nav.clear();
				}
			}
			return;
		}

		// Arrow left/right: tab cycling from tab bar or input boundary
		if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
			const direction = e.key === 'ArrowLeft' ? -1 : 1;
			if (isTabButton) {
				e.preventDefault();
				const newTab = cycleTab(direction);
				focusTabButton(newTab);
			} else if (isInput) {
				const input = target as HTMLInputElement;
				const atStart = !input.value || (input.selectionStart === 0 && input.selectionEnd === 0);
				const atEnd = !input.value || (input.selectionStart === input.value.length && input.selectionEnd === input.value.length);
				if ((e.key === 'ArrowLeft' && atStart) || (e.key === 'ArrowRight' && atEnd)) {
					e.preventDefault();
					cycleTab(direction);
				}
			}
		}
	}

	function scrollSelectedIntoView() {
		requestAnimationFrame(() => {
			const el = resultsContainerEl?.querySelector('.result-selected');
			el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
		});
	}

	function switchTab(tab: SourceTab) {
		nav.clear();
		activeTab = tab;
		selectedResultIndex = -1;
		if (mode === 'route') updateUrl();
		if (tab === 'routes') {
			filterRoutes(query);
		} else if (query.trim()) {
			doSearchForActiveTab();
		}
	}

	function handleProjectSelect(project: string) {
		selectedProject = project;
		onProjectChange?.(project);
		if (mode === 'route') updateUrl();
		if (query.trim()) doSearchForActiveTab();
	}

	// --- Navigation ---
	function closeModal() {
		if (mode === 'modal') {
			isOpen = false;
			onClose?.();
		}
	}

	function openTask(taskId: string) {
		selectedTaskId = taskId;
		drawerOpen = true;
		closeModal();
	}

	function navigateToMemory(file: string) {
		window.open(`/memory?file=${encodeURIComponent(file)}`, '_blank');
	}

	function navigateToFile(path: string, line?: number) {
		if (onFileSelect && selectedProject) {
			onFileSelect(path, line || 1, selectedProject);
			closeModal();
			return;
		}
		const params = new URLSearchParams({ path });
		if (line) params.set('line', String(line));
		if (selectedProject) params.set('project', selectedProject);
		window.open(`/files?${params}`, '_blank');
	}

	function openFilename(file: FilenameResult) {
		navigateToFile(file.path, 1);
	}

	function openContentResult(result: ContentResult) {
		navigateToFile(result.file, result.line);
	}

	// --- Utility Functions ---
	function highlightMatch(text: string, q: string): string {
		if (!q || !text) return escapeHtml(text || '');
		const escaped = escapeHtml(text);
		const pattern = q.split(/\s+/).filter(Boolean).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
		if (!pattern) return escaped;
		return escaped.replace(new RegExp(`(${pattern})`, 'gi'), '<mark class="search-highlight">$1</mark>');
	}

	function escapeHtml(str: string): string {
		return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function truncate(str: string, len: number): string {
		if (!str) return '';
		return str.length > len ? str.slice(0, len) + '...' : str;
	}

	function getFileIcon(filename: string): string {
		const ext = filename.split('.').pop()?.toLowerCase() || '';
		const name = filename.split('/').pop()?.toLowerCase() || '';
		if (name === 'package.json') return '📦';
		if (name === 'tsconfig.json') return '⚙️';
		if (name.includes('readme')) return '📖';
		const iconMap: Record<string, string> = {
			ts: '🔷', tsx: '⚛️', js: '🟨', jsx: '⚛️', svelte: '🔶',
			html: '🌐', css: '🎨', scss: '🎨', json: '📋', yaml: '📋', yml: '📋',
			md: '📝', py: '🐍', go: '🐹', rs: '🦀', sh: '🐚', sql: '🗃️'
		};
		return iconMap[ext] || '📄';
	}

	const GLOB_PRESETS = [
		{ label: 'All', glob: '' },
		{ label: 'TS', glob: '*.{ts,tsx}' },
		{ label: 'JS', glob: '*.{js,jsx,mjs}' },
		{ label: 'Svelte', glob: '*.svelte' },
		{ label: 'CSS', glob: '*.{css,scss}' },
		{ label: 'JSON', glob: '*.json' },
		{ label: 'MD', glob: '*.md' }
	];

	// --- Lifecycle ---
	onMount(async () => {
		projectColors = await fetchAndGetProjectColors();

		if (mode === 'route') {
			const params = new URL(window.location.href).searchParams;
			const tabParam = params.get('tab') as SourceTab | null;
			const projectParam = params.get('project');
			const qParam = params.get('q');

			if (tabParam && TABS.some(t => t.id === tabParam)) {
				activeTab = tabParam;
			}
			if (projectParam) selectedProject = projectParam;
			if (qParam) {
				query = qParam;
				tick().then(() => doSearchForActiveTab());
			}
			tick().then(() => searchInputEl?.focus());
		}

		return () => {
			if (debounceTimer) clearTimeout(debounceTimer);
		};
	});
</script>

{#if mode === 'route'}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="flex flex-col h-full overflow-hidden" style="background: oklch(0.16 0.01 250);" onkeydown={handleKeydown} role="search">
		{@render searchUI(false)}
	</div>
	<KeyboardShortcutsOverlay title="Search Shortcuts" shortcuts={[
		{ key: 'j / ↓', description: 'Focus next result' },
		{ key: 'k / ↑', description: 'Focus previous result' },
		{ key: 'Enter', description: 'Open selected result' },
		{ key: 'Tab / ←→', description: 'Switch tabs' },
		{ key: '/', description: 'Focus search input' },
		{ key: 'Esc', description: 'Clear selection' },
	]} />
{:else if isOpen}
	<div class="us-overlay" onclick={onClose} role="presentation">
		<div class="us-modal" role="dialog" tabindex="0" onclick={(e) => e.stopPropagation()} onkeydown={handleKeydown}>
			{@render searchUI(true)}
		</div>
	</div>
{/if}

{#snippet searchUI(isModal: boolean)}
	<!-- Header: Search bar + tabs -->
	<div class="flex-none" style="background: {isModal ? 'oklch(0.16 0.02 250)' : 'oklch(0.18 0.01 250)'}; border-bottom: 1px solid oklch(0.25 0.02 250); {isModal ? 'border-radius: 0.75rem 0.75rem 0 0;' : 'padding: 0 1.5rem;'}">
		<!-- Search input -->
		<div class="{isModal ? 'px-4 pt-3' : 'pt-5 max-w-4xl mx-auto'}">
			<div class="relative">
				<div class="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style="color: oklch(0.50 0.02 250);">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
					</svg>
				</div>
				<input
					bind:this={searchInputEl}
					bind:value={query}
					oninput={handleInput}
					onkeydown={handleKeydown}
					type="text"
					placeholder="Go somewhere, or search tasks, files, memory...{isModal ? '' : ' (Ctrl+K)'}"
					class="w-full pl-11 pr-4 py-3 rounded-lg text-sm outline-none transition-all duration-200"
					style="
						background: oklch(0.14 0.01 250);
						border: 1px solid oklch(0.30 0.02 250);
						color: oklch(0.90 0.02 250);
					"
					onfocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'oklch(0.55 0.15 200)'; (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px oklch(0.55 0.15 200 / 0.15)'; }}
					onblur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'oklch(0.30 0.02 250)'; (e.target as HTMLInputElement).style.boxShadow = 'none'; }}
				/>
				{#if query}
					<button
						tabindex={-1}
						aria-label="Clear search"
						onclick={() => { query = ''; taskResults = []; memoryResults = []; fileResults = []; filenameResults = []; contentResults = []; meta = null; if (mode === 'route') updateUrl(); searchInputEl?.focus(); }}
						class="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-colors hover:bg-base-300/30"
						style="color: oklch(0.50 0.02 250);"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				{/if}
				{#if isModal}
					<kbd class="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono" style="background: oklch(0.22 0.02 250); border: 1px solid oklch(0.30 0.02 250); color: oklch(0.50 0.02 250); {query ? 'display:none;' : ''}">ESC</kbd>
				{/if}
			</div>
		</div>

		<!-- Tabs + project filter row -->
		<div class="flex items-center justify-between {isModal ? 'px-4' : 'max-w-4xl mx-auto'} mt-2 pb-2">
			<!-- Source tabs -->
			<div class="flex gap-0.5">
				{#each TABS as tab}
					{@const isActive = activeTab === tab.id}
					<button
						data-tab={tab.id}
						onclick={() => switchTab(tab.id)}
						class="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 flex items-center gap-1"
						style="
							background: {isActive ? 'oklch(0.30 0.04 200)' : 'transparent'};
							color: {isActive ? 'oklch(0.90 0.10 200)' : 'oklch(0.55 0.02 250)'};
							border: 1px solid {isActive ? 'oklch(0.40 0.08 200)' : 'transparent'};
						"
						title=""
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3 flex-none">
							<path stroke-linecap="round" stroke-linejoin="round" d={tab.icon} />
						</svg>
						{tab.label}
						{#if hasSearched && tabCount(tab.id) > 0}
							<span
								class="px-1 py-0.5 rounded-full text-[9px] font-bold leading-none"
								style="background: oklch(0.30 0.05 200); color: oklch(0.80 0.10 200);"
							>{tabCount(tab.id)}</span>
						{/if}
					</button>
				{/each}
			</div>

			<!-- Project filter -->
			{#if projects.length > 0}
				<div style="min-width: 140px;">
					<SearchDropdown
						value={selectedProject}
						groups={projectGroups}
						placeholder="All Projects"
						colorFn={getSearchProjectColor}
						variant="chip"
						onChange={handleProjectSelect}
					/>
				</div>
			{/if}
		</div>

		<!-- Content tab options (regex, case, glob) -->
		{#if activeTab === 'content'}
			<div class="flex items-center gap-2 {isModal ? 'px-4' : 'max-w-4xl mx-auto'} pb-2 flex-wrap">
				<label class="flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer transition-colors" style="background: {useRegex ? 'oklch(0.55 0.12 220 / 0.3)' : 'oklch(0.22 0.02 250)'}; border: 1px solid {useRegex ? 'oklch(0.55 0.12 220 / 0.5)' : 'oklch(0.28 0.02 250)'}; color: {useRegex ? 'oklch(0.88 0.12 220)' : 'oklch(0.70 0.02 250)'};">
					<input type="checkbox" bind:checked={useRegex} class="hidden" />
					<span class="font-mono font-semibold">.*</span> Regex
				</label>
				<label class="flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer transition-colors" style="background: {caseSensitive ? 'oklch(0.55 0.12 220 / 0.3)' : 'oklch(0.22 0.02 250)'}; border: 1px solid {caseSensitive ? 'oklch(0.55 0.12 220 / 0.5)' : 'oklch(0.28 0.02 250)'}; color: {caseSensitive ? 'oklch(0.88 0.12 220)' : 'oklch(0.70 0.02 250)'};">
					<input type="checkbox" bind:checked={caseSensitive} class="hidden" />
					<span class="font-mono font-semibold">Aa</span> Case
				</label>
				<div class="flex items-center gap-1">
					{#each GLOB_PRESETS as preset}
						<button
							class="px-2 py-0.5 rounded text-[11px] transition-colors"
							style="background: {globFilter === preset.glob ? 'oklch(0.50 0.15 145 / 0.25)' : 'oklch(0.22 0.02 250)'}; border: 1px solid {globFilter === preset.glob ? 'oklch(0.50 0.15 145 / 0.5)' : 'oklch(0.28 0.02 250)'}; color: {globFilter === preset.glob ? 'oklch(0.85 0.14 145)' : 'oklch(0.68 0.02 250)'};"
							onclick={() => { globFilter = preset.glob; if (query.trim()) doContentSearch(); }}
						>{preset.label}</button>
					{/each}
					<input
						type="text"
						class="w-16 px-1.5 py-0.5 rounded text-[10px] font-mono outline-none"
						style="background: oklch(0.20 0.02 250); border: 1px solid oklch(0.28 0.02 250); color: oklch(0.80 0.02 250);"
						placeholder="*.ext"
						bind:value={globFilter}
						onchange={() => { if (query.trim()) doContentSearch(); }}
					/>
				</div>
			</div>
		{/if}
	</div>

	<!-- Results area -->
	<div bind:this={resultsContainerEl} class="{isModal ? 'us-results-modal' : 'flex-1 overflow-y-auto px-4 py-4'}">
		{#if (activeTab === 'filenames' || activeTab === 'content') && !selectedProject}
			<div class="text-center py-8">
				<p class="text-sm" style="color: oklch(0.65 0.10 85);">Select a project to search {activeTab === 'filenames' ? 'filenames' : 'file contents'}</p>
			</div>
		{:else if loading || filenameLoading || contentLoading}
			{@render loadingSkeleton(isModal)}
		{:else if error}
			<div class="max-w-2xl mx-auto rounded-lg p-4" style="background: oklch(0.22 0.08 25 / 0.15); border: 1px solid oklch(0.50 0.15 25 / 0.3);">
				<p class="text-sm" style="color: oklch(0.70 0.15 25);">{error}</p>
			</div>
		{:else if hasSearched && !currentTabHasResults}
			<div class="text-center py-{isModal ? '8' : '12'}">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto mb-2" style="color: oklch(0.40 0.02 250);">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
				</svg>
				<p class="text-sm" style="color: oklch(0.55 0.02 250);">No {activeTab} results for "{query}"</p>
			</div>
		{:else if !hasSearched}
			{@render emptyState(isModal)}
		{:else}
			<!-- Meta info -->
			{#if meta && (activeTab === 'tasks' || activeTab === 'memory')}
				<div class="flex items-center justify-between mb-2 {isModal ? 'px-3' : ''}">
					<p class="text-[11px]" style="color: oklch(0.50 0.02 250);">
						{meta.totalResults} result{meta.totalResults !== 1 ? 's' : ''} in {meta.queryTime}ms
					</p>
				</div>
			{/if}

			<!-- Tab-specific content -->
			{#if activeTab === 'routes'}
				{@render routesList(isModal)}
			{:else if activeTab === 'tasks'}
				{@render tasksList(isModal)}
			{:else if activeTab === 'memory'}
				{@render memoryList(isModal)}
			{:else if activeTab === 'filenames'}
				{@render filenamesList(isModal)}
			{:else if activeTab === 'content'}
				{@render contentList(isModal)}
			{/if}
		{/if}
	</div>

	<!-- Footer (modal only) -->
	{#if isModal}
		<div class="flex items-center justify-between px-3 py-2" style="border-top: 1px solid oklch(0.25 0.02 250); background: oklch(0.14 0.01 250); border-radius: 0 0 0.75rem 0.75rem;">
			<span class="text-[11px]" style="color: oklch(0.45 0.02 250);">
				<kbd class="px-1 py-0.5 rounded text-[9px] font-mono" style="background: oklch(0.22 0.02 250); border: 1px solid oklch(0.30 0.02 250);">↑↓</kbd> <kbd class="px-1 py-0.5 rounded text-[9px] font-mono" style="background: oklch(0.22 0.02 250); border: 1px solid oklch(0.30 0.02 250);">j/k</kbd> navigate · <kbd class="px-1 py-0.5 rounded text-[9px] font-mono" style="background: oklch(0.22 0.02 250); border: 1px solid oklch(0.30 0.02 250);">Tab</kbd> <kbd class="px-1 py-0.5 rounded text-[9px] font-mono" style="background: oklch(0.22 0.02 250); border: 1px solid oklch(0.30 0.02 250);">←→</kbd> tabs · <kbd class="px-1 py-0.5 rounded text-[9px] font-mono" style="background: oklch(0.22 0.02 250); border: 1px solid oklch(0.30 0.02 250);">↵</kbd> open
			</span>
			<span class="text-[11px]" style="color: oklch(0.45 0.02 250);">
				<kbd class="px-1 py-0.5 rounded text-[9px] font-mono" style="background: oklch(0.22 0.02 250); border: 1px solid oklch(0.30 0.02 250);">esc</kbd> {query ? 'clear' : 'close'}
			</span>
		</div>
	{/if}
{/snippet}

<!-- === SNIPPETS: Result Renderers === -->

{#snippet loadingSkeleton(isModal: boolean)}
	{#if activeTab === 'tasks' || activeTab === 'memory'}
		<div class="{isModal ? 'px-2' : 'max-w-3xl mx-auto'} space-y-1 py-2">
			{#each [1, 2, 3] as _}
				<div class="rounded-md p-3" style="background: oklch(0.20 0.01 250); border: 1px solid oklch(0.25 0.02 250);">
					<div class="skeleton h-2.5 w-2/3 rounded mb-2" style="background: oklch(0.25 0.02 250);"></div>
					<div class="skeleton h-2 w-full rounded" style="background: oklch(0.22 0.02 250);"></div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="{isModal ? 'px-1' : 'max-w-3xl mx-auto'} py-2">
			{#each [1, 2, 3, 4, 5] as _}
				<div class="flex items-center gap-2 px-2 py-1.5">
					<div class="skeleton w-4 h-4 rounded flex-none" style="background: oklch(0.25 0.02 250);"></div>
					<div class="skeleton h-2.5 w-48 rounded" style="background: oklch(0.25 0.02 250);"></div>
					<div class="skeleton h-2 w-24 rounded ml-auto" style="background: oklch(0.22 0.02 250);"></div>
				</div>
			{/each}
		</div>
	{/if}
{/snippet}

{#snippet routesList(isModal: boolean)}
	<div class="{isModal ? 'px-3 py-2' : 'max-w-2xl mx-auto py-4'}">
		{#if routeResults.length === 0}
			<p class="text-[11px] px-1 py-2" style="color: oklch(0.40 0.02 250);">No commands match "{query}"</p>
		{:else}
			<div class="space-y-0.5">
				{#each routeResults as action, i}
					{@const isSelected = selectedResultIndex === i}
					<button
						data-nav-id={action.id}
						class="result-item w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors duration-75"
						class:result-selected={isSelected}
						style="
							background: {isSelected ? 'oklch(0.26 0.04 200)' : 'transparent'};
							border: 1px solid {isSelected ? 'oklch(0.40 0.08 200 / 0.5)' : 'transparent'};
							color: {isSelected ? 'oklch(0.92 0.06 200)' : 'oklch(0.75 0.02 250)'};
						"
						onclick={() => {
							if (action.execute) { action.execute(); closeModal(); }
							else if (action.path) { goto(action.path); closeModal(); }
						}}
						onmouseenter={() => nav.focus(i)}
					>
						<span class="font-mono text-[10px] w-4 text-center flex-shrink-0" style="color: {isSelected ? 'oklch(0.65 0.12 200)' : 'oklch(0.40 0.02 250)'};">/</span>
						<span class="flex-1 min-w-0">
							<span class="text-xs font-medium font-mono block">{action.label}</span>
							<span class="text-[10px] block truncate" style="color: {isSelected ? 'oklch(0.70 0.04 200)' : 'oklch(0.45 0.02 250)'};">{action.description}</span>
						</span>
						{#if action.path}
							<span class="text-[10px] font-mono flex-shrink-0" style="color: {isSelected ? 'oklch(0.55 0.10 200)' : 'oklch(0.35 0.02 250)'};">{action.path}</span>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

{#snippet emptyState(isModal: boolean)}
	{#if isModal}
		<div class="px-3 py-2">
			<p class="text-[10px] uppercase tracking-wider mb-2 px-1" style="color: oklch(0.40 0.02 250); letter-spacing: 0.08em;">Navigate</p>
			<div class="grid grid-cols-2 gap-0.5">
				{#each unifiedNavConfig.navItems.slice(0, 12) as item}
					<button
						class="us-nav-item"
						onclick={() => { goto(item.href); onClose?.(); }}
					>
						<span class="us-nav-slash">/</span>
						{item.label}
					</button>
				{/each}
			</div>
			<p class="text-[10px] mt-3 px-1" style="color: oklch(0.35 0.02 250);">
				Type to search · <kbd class="px-1 py-0.5 rounded text-[9px] font-mono" style="background: oklch(0.22 0.02 250); border: 1px solid oklch(0.28 0.02 250);">Tab</kbd> switch tabs · <kbd class="px-1 py-0.5 rounded text-[9px] font-mono" style="background: oklch(0.22 0.02 250); border: 1px solid oklch(0.28 0.02 250);">↓ j/k</kbd> navigate · <kbd class="px-1 py-0.5 rounded text-[9px] font-mono" style="background: oklch(0.22 0.02 250); border: 1px solid oklch(0.28 0.02 250);">↵</kbd> go
			</p>
		</div>
	{:else}
		<div class="text-center py-16">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-14 h-14 mx-auto mb-3" style="color: oklch(0.30 0.02 250);">
				<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
			</svg>
			<p class="text-sm" style="color: oklch(0.45 0.02 250);">Search across tasks, memory, and files</p>
			<p class="text-xs mt-2" style="color: oklch(0.35 0.02 250);">
				<kbd class="px-1.5 py-0.5 rounded text-[10px] font-mono" style="background: oklch(0.22 0.02 250); border: 1px solid oklch(0.30 0.02 250);">j/k</kbd> navigate ·
				<kbd class="px-1.5 py-0.5 rounded text-[10px] font-mono" style="background: oklch(0.22 0.02 250); border: 1px solid oklch(0.30 0.02 250);">/</kbd> focus ·
				<kbd class="px-1.5 py-0.5 rounded text-[10px] font-mono" style="background: oklch(0.22 0.02 250); border: 1px solid oklch(0.30 0.02 250);">?</kbd> shortcuts
			</p>
		</div>
	{/if}
{/snippet}

{#snippet taskCard(task: TaskResult)}
	<button
		onclick={() => openTask(task.id)}
		class="us-result-card group"
	>
		<div class="flex items-center gap-1.5 min-w-0">
			<div class="flex-none"><TaskIdBadge {task} size="xs" /></div>
			<p class="text-xs font-medium truncate min-w-0" style="color: oklch(0.88 0.02 250);"><FxText text={task.title} /></p>
		</div>
		{#if task.snippet || task.description}
			<p class="text-[11px] mt-0.5 line-clamp-2" style="color: oklch(0.50 0.02 250);">
				{@html highlightMatch(truncate(task.snippet || task.description || '', 150), query)}
			</p>
		{/if}
	</button>
{/snippet}

{#snippet memoryCard(mem: MemoryResult)}
	<button
		onclick={() => navigateToMemory(mem.file)}
		class="us-result-card"
	>
		<div class="flex items-center gap-1.5 flex-wrap">
			{#if mem.taskId}
				<TaskIdBadge task={{ id: mem.taskId, status: 'closed' }} size="xs" minimal />
			{/if}
			{#if mem.agent}
				<span class="text-[10px] font-medium" style="color: oklch(0.65 0.10 200);">{mem.agent}</span>
			{/if}
			{#if mem.section}
				<span class="text-[10px] px-1 py-0.5 rounded" style="background: oklch(0.25 0.04 145 / 0.3); color: oklch(0.65 0.12 145);">{mem.section}</span>
			{/if}
		</div>
		<p class="text-[11px] font-mono truncate mt-0.5" style="color: oklch(0.55 0.02 250);">{mem.file.split('/').slice(-2).join('/')}</p>
		{#if mem.snippet}
			<p class="text-[11px] mt-0.5 line-clamp-2" style="color: oklch(0.50 0.02 250);">
				{@html highlightMatch(truncate(mem.snippet, 150), query)}
			</p>
		{/if}
	</button>
{/snippet}

{#snippet fileCard(file: FileResult)}
	<button
		onclick={() => navigateToFile(file.path, file.line)}
		class="us-result-card"
	>
		<p class="text-[11px] font-mono truncate" style="color: oklch(0.70 0.10 85);">
			{file.path.split('/').pop()}{file.line ? `:${file.line}` : ''}
		</p>
		<p class="text-[10px] font-mono truncate" style="color: oklch(0.40 0.02 250);">{file.path}</p>
		{#if file.snippet}
			<pre class="text-[11px] mt-0.5 overflow-hidden whitespace-pre-wrap break-all line-clamp-2 font-mono" style="color: oklch(0.50 0.02 250);">{@html highlightMatch(truncate(file.snippet, 200), query)}</pre>
		{/if}
	</button>
{/snippet}

{#snippet filenameCard(file: FilenameResult)}
	<button
		onclick={() => openFilename(file)}
		class="us-compact-file-card"
	>
		<span class="flex-none text-xs">{getFileIcon(file.name)}</span>
		<span class="text-[11px] font-mono font-medium truncate" style="color: oklch(0.80 0.12 220);">{@html highlightMatch(file.name, query)}</span>
		{#if file.folder}
			<span class="text-[10px] font-mono truncate ml-auto" style="color: oklch(0.40 0.02 250); direction: rtl; text-align: left;">{file.folder}</span>
		{/if}
	</button>
{/snippet}

{#snippet contentCard(result: ContentResult)}
	<button
		onclick={() => openContentResult(result)}
		class="us-result-card"
	>
		<div class="flex items-center gap-1 min-w-0">
			<span class="flex-none text-xs">{getFileIcon(result.file)}</span>
			<span class="text-[11px] font-mono truncate" style="color: oklch(0.75 0.12 220);">{result.file.split('/').pop()}</span>
			<span class="text-[10px] font-mono flex-none" style="color: oklch(0.45 0.02 250);">:{result.line}</span>
		</div>
		<pre class="text-[11px] mt-0.5 overflow-hidden whitespace-pre-wrap break-all line-clamp-2 font-mono" style="color: oklch(0.55 0.02 250);">{@html highlightMatch(truncate(result.content, 150), useRegex ? '' : query)}</pre>
	</button>
{/snippet}

{#snippet tasksList(isModal: boolean)}
	<div class="{isModal ? 'px-2' : 'max-w-3xl mx-auto'} space-y-1">
		{#each taskResults as task, index}
			<button
				data-nav-id={task.id}
				onclick={() => openTask(task.id)}
				onmouseenter={() => nav.focus(index)}
				class="us-result-card w-full"
				class:result-selected={index === selectedResultIndex}
			>
				<div class="flex items-center gap-2 min-w-0">
					<div class="flex-none"><TaskIdBadge {task} size="xs" /></div>
					<p class="text-sm font-medium truncate min-w-0" style="color: oklch(0.88 0.02 250);"><FxText text={task.title} /></p>
				</div>
				{#if task.snippet || task.description}
					<p class="text-xs mt-1 line-clamp-2" style="color: oklch(0.55 0.02 250);">
						{@html highlightMatch(truncate(task.snippet || task.description || '', 200), query)}
					</p>
				{/if}
			</button>
		{/each}
	</div>
{/snippet}

{#snippet memoryList(isModal: boolean)}
	<div class="{isModal ? 'px-2' : 'max-w-3xl mx-auto'} space-y-1">
		{#each memoryResults as mem, index}
			<button
				data-nav-id={mem.file}
				onclick={() => navigateToMemory(mem.file)}
				onmouseenter={() => nav.focus(index)}
				class="us-result-card w-full"
				class:result-selected={index === selectedResultIndex}
			>
				<div class="flex items-center gap-2 flex-wrap">
					{#if mem.taskId}
						<TaskIdBadge task={{ id: mem.taskId, status: 'closed' }} size="xs" minimal />
					{/if}
					{#if mem.agent}
						<span class="text-[10px] font-medium" style="color: oklch(0.65 0.10 200);">{mem.agent}</span>
					{/if}
					{#if mem.section}
						<span class="text-[10px] px-1.5 py-0.5 rounded" style="background: oklch(0.25 0.04 145 / 0.3); color: oklch(0.65 0.12 145);">{mem.section}</span>
					{/if}
				</div>
				<p class="text-xs font-mono truncate mt-0.5" style="color: oklch(0.60 0.02 250);">{mem.file}</p>
				{#if mem.snippet}
					<p class="text-xs mt-1 line-clamp-2" style="color: oklch(0.55 0.02 250);">
						{@html highlightMatch(truncate(mem.snippet, 200), query)}
					</p>
				{/if}
			</button>
		{/each}
	</div>
{/snippet}

{#snippet filenamesList(isModal: boolean)}
	<div class="{isModal ? 'px-1' : 'max-w-3xl mx-auto'}">
		{#each filenameResults as file, index}
			<button
				data-nav-id={file.path}
				class="us-filename-result"
				class:result-selected={index === selectedResultIndex}
				onclick={() => openFilename(file)}
				onmouseenter={() => nav.focus(index)}
			>
				<span class="flex-none text-sm">{getFileIcon(file.name)}</span>
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-1">
						{#if file.folder}
							<span class="text-[11px] font-mono truncate" style="color: oklch(0.50 0.02 250); direction: rtl; text-align: left;">{file.folder}/</span>
						{/if}
						<span class="text-[12px] font-mono font-medium flex-none" style="color: oklch(0.80 0.12 220);">{@html highlightMatch(file.name, query)}</span>
					</div>
				</div>
			</button>
		{/each}
		{#if filenameResults.length === 0 && hasSearched}
			<div class="text-center py-6">
				<p class="text-sm" style="color: oklch(0.50 0.02 250);">No filename matches for "{query}"</p>
			</div>
		{/if}
	</div>
{/snippet}

{#snippet contentList(isModal: boolean)}
	<div class="{isModal ? 'px-1' : 'max-w-3xl mx-auto'}">
		{#each contentResults as result, index}
			<button
				data-nav-id="{result.file}:{result.line}"
				class="us-content-result"
				class:result-selected={index === selectedResultIndex}
				onclick={() => openContentResult(result)}
				onmouseenter={() => nav.focus(index)}
			>
				<div class="flex items-center gap-1.5 min-w-0">
					<span class="flex-none text-sm">{getFileIcon(result.file)}</span>
					{#if result.file.includes('/')}
						<span class="text-[11px] font-mono truncate" style="color: oklch(0.50 0.02 250);">{result.file.slice(0, result.file.lastIndexOf('/') + 1)}</span>
						<span class="text-[11px] font-mono font-medium flex-none" style="color: oklch(0.75 0.12 220);">{result.file.slice(result.file.lastIndexOf('/') + 1)}</span>
					{:else}
						<span class="text-[11px] font-mono font-medium flex-none" style="color: oklch(0.75 0.12 220);">{result.file}</span>
					{/if}
					<span class="text-[10px] font-mono flex-none" style="color: oklch(0.50 0.02 250);">:{result.line}</span>
				</div>
				<div class="us-content-context">
					{#if result.before}
						{#each result.before as line}
							<div class="text-[11px] truncate" style="color: oklch(0.45 0.02 250);">{line}</div>
						{/each}
					{/if}
					<div class="text-[11px] truncate" style="color: oklch(0.85 0.02 250);">
						{@html highlightMatch(result.content, useRegex ? '' : query)}
					</div>
					{#if result.after}
						{#each result.after as line}
							<div class="text-[11px] truncate" style="color: oklch(0.45 0.02 250);">{line}</div>
						{/each}
					{/if}
				</div>
			</button>
		{/each}
		{#if contentTruncated}
			<p class="text-center text-[11px] py-2" style="color: oklch(0.65 0.10 85);">Results truncated — refine your search</p>
		{/if}
		{#if contentResults.length === 0 && hasSearched}
			<div class="text-center py-6">
				<p class="text-sm" style="color: oklch(0.50 0.02 250);">No content matches for "{query}"</p>
			</div>
		{/if}
	</div>
{/snippet}

<!-- Task Detail Drawer -->
<TaskDetailDrawer bind:taskId={selectedTaskId} bind:isOpen={drawerOpen} />

<style>
	/* Modal overlay */
	.us-overlay {
		position: fixed;
		inset: 0;
		background: oklch(0.08 0.01 250 / 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		animation: fadeIn 0.1s ease;
	}

	.us-modal {
		background: oklch(0.16 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.75rem;
		width: 95%;
		max-width: 1100px;
		height: 85vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 25px 60px oklch(0.05 0 0 / 0.6);
		animation: slideDown 0.15s ease;
		overflow: hidden;
	}

	.us-nav-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.625rem;
		border-radius: 0.375rem;
		text-align: left;
		font-size: 0.75rem;
		color: oklch(0.72 0.04 250);
		background: transparent;
		border: none;
		cursor: pointer;
		width: 100%;
		transition: background 0.1s, color 0.1s;
	}

	.us-nav-item:hover,
	.us-nav-item:focus-visible {
		background: oklch(0.22 0.02 250);
		color: oklch(0.88 0.06 250);
		outline: none;
	}

	.us-nav-slash {
		font-size: 0.625rem;
		width: 1rem;
		text-align: center;
		color: oklch(0.45 0.04 250);
		flex-shrink: 0;
	}

	.us-results-modal {
		flex: 1;
		overflow-y: auto;
		min-height: 120px;
		padding: 0.5rem;
	}

	/* Shared result card style */
	.us-result-card {
		display: flex;
		flex-direction: column;
		text-align: left;
		width: 100%;
		padding: 0.5rem 0.625rem;
		border-radius: 0.375rem;
		background: oklch(0.20 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		cursor: pointer;
		transition: all 0.12s ease;
	}

	.us-result-card:hover {
		border-color: oklch(0.35 0.06 200);
		background: oklch(0.22 0.02 250);
	}

	.us-result-card.result-selected {
		border-color: oklch(0.45 0.10 200);
		border-left-color: oklch(0.65 0.15 200);
		border-left-width: 2px;
		background: oklch(0.24 0.03 220);
		padding-left: calc(0.625rem - 1px);
	}

	/* Filename result item */
	.us-filename-result {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.375rem 0.625rem;
		border-radius: 0.375rem;
		cursor: pointer;
		text-align: left;
		transition: background 0.1s ease;
		background: transparent;
		border: none;
	}

	.us-filename-result:hover,
	.us-filename-result.result-selected {
		background: oklch(0.55 0.12 220 / 0.1);
	}

	.us-filename-result.result-selected {
		background: oklch(0.55 0.12 220 / 0.15);
	}

	/* Content result item */
	.us-content-result {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 100%;
		padding: 0.5rem 0.625rem;
		cursor: pointer;
		text-align: left;
		border-radius: 0.375rem;
		transition: background 0.1s ease;
		background: transparent;
		border: none;
		margin-bottom: 0.125rem;
	}

	.us-content-result:hover,
	.us-content-result.result-selected {
		background: oklch(0.55 0.12 220 / 0.1);
	}

	.us-content-result.result-selected {
		background: oklch(0.55 0.12 220 / 0.15);
	}

	.us-content-context {
		font-family: ui-monospace, monospace;
		background: oklch(0.12 0.01 250);
		border-radius: 0.25rem;
		padding: 0.375rem 0.5rem;
		margin-left: 1.5rem;
		overflow: hidden;
	}

	/* 4-column horizontal scroll (Cover Flow for "All" tab) */
	.us-columns-scroll {
		display: flex;
		gap: 0.75rem;
		overflow-x: auto;
		overflow-y: hidden;
		padding: 0.25rem 0.5rem 0.75rem;
		-webkit-overflow-scrolling: touch;
	}

	/* Spacer so the last column can be scrolled to center */
	.us-columns-scroll::after {
		content: '';
		flex: 0 0 50%;
	}

	/* Hide scrollbar but keep functionality */
	.us-columns-scroll::-webkit-scrollbar {
		height: 4px;
	}
	.us-columns-scroll::-webkit-scrollbar-track {
		background: transparent;
	}
	.us-columns-scroll::-webkit-scrollbar-thumb {
		background: oklch(0.30 0.02 250);
		border-radius: 2px;
	}
	.us-columns-scroll::-webkit-scrollbar-thumb:hover {
		background: oklch(0.40 0.02 250);
	}

	.us-column {
		flex: 0 0 calc(33% - 0.5rem);
		min-width: 220px;
		max-width: 320px;
	}

	.us-column-header {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.25rem 0.25rem 0.5rem;
		color: oklch(0.60 0.02 250);
	}

	.us-column-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	/* Compact file card for filename column */
	.us-compact-file-card {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		width: 100%;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		cursor: pointer;
		text-align: left;
		transition: background 0.1s ease;
		background: transparent;
		border: none;
	}

	.us-compact-file-card:hover {
		background: oklch(0.55 0.12 85 / 0.1);
	}

	/* Search highlight mark */
	:global(.search-highlight) {
		background: oklch(0.65 0.15 85 / 0.4);
		color: oklch(0.95 0.05 85);
		border-radius: 2px;
		padding: 0 2px;
	}
</style>
