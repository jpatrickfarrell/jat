<script lang="ts">
	/**
	 * Memory Page - Search and browse agent memory entries
	 *
	 * Features:
	 * - Search across all project memory indexes (hybrid FTS + vector)
	 * - Browse memory files per project
	 * - View memory file contents with frontmatter
	 * - Index status and rebuild controls
	 */

	import { onMount, onDestroy, tick } from 'svelte';
	import { page } from '$app/stores';
	import { reveal } from '$lib/actions/reveal';
	import SearchDropdown from '$lib/components/SearchDropdown.svelte';
	import type { SearchDropdownGroup } from '$lib/components/SearchDropdown.svelte';
	import { fetchAndGetProjectColors, getProjectColor } from '$lib/utils/projectColors';
	import { addToast } from '$lib/stores/toasts.svelte';
	import { createListNav } from '$lib/actions/listNav';
	import KeyboardShortcutsOverlay from '$lib/components/KeyboardShortcutsOverlay.svelte';

	// --- State ---
	let activeTab = $state<'search' | 'browse' | 'status'>('search');

	// Project filter from URL (set by TopBar ProjectSelector)
	let filterProject = $state('');

	// Project colors for dropdown
	let projectColors = $state<Record<string, string>>({});

	// Status state (must be declared before projectFilterGroups derived)
	let projectStatuses = $state<any[]>([]);
	let statusLoading = $state(true);

	// Project dropdown groups (derived from projectStatuses)
	const projectFilterGroups = $derived.by<SearchDropdownGroup[]>(() => [{
		label: 'Projects',
		options: [
			{ value: '', label: 'All Projects' },
			...projectStatuses.map(p => ({ value: p.project, label: p.project }))
		]
	}]);

	function getMemoryProjectColor(project: string): string | undefined {
		if (!project) return undefined;
		return projectColors[project.toLowerCase()] || getProjectColor(project + '-x');
	}

	// Search state
	let searchQuery = $state('');
	let searchResults = $state<any[]>([]);
	let searchLoading = $state(false);
	let searchError = $state('');
	let lastSearchQuery = $state('');

	// Browse state
	let browseProject = $state('');
	let browseFiles = $state<any[]>([]);
	let browseLoading = $state(false);

	// File viewer state
	let viewingFile = $state<{ content: string; frontmatter: any; filename: string; project: string } | null>(null);
	let fileLoading = $state(false);
	let viewFileError = $state('');

	// Keyboard nav DOM refs
	let browseListEl = $state<HTMLElement | null>(null);
	let searchResultsEl = $state<HTMLElement | null>(null);
	let searchInputEl = $state<HTMLInputElement | null>(null);

	const browseNav = createListNav({
		getItems: () =>
			browseListEl ? Array.from(browseListEl.querySelectorAll<HTMLElement>('[data-nav-id]')) : [],
		onSelect: (el) => {
			const filename = el.dataset.navId;
			if (filename && browseProject) viewFile(browseProject, filename);
		},
		onEscape: () => browseNav.clear(),
	});

	const searchNav = createListNav({
		getItems: () =>
			searchResultsEl ? Array.from(searchResultsEl.querySelectorAll<HTMLElement>('[data-nav-id]')) : [],
		onSelect: (el) => {
			const idx = parseInt(el.dataset.navId ?? '', 10);
			const result = searchResults[idx];
			if (!result) return;
			const filename = result.path?.split('/').pop();
			if (filename && result.project) viewFile(result.project, filename);
		},
		onEscape: () => searchNav.clear(),
	});

	function isTypingTarget(target: EventTarget | null): boolean {
		if (!(target instanceof HTMLElement)) return false;
		const tag = target.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
		return target.isContentEditable;
	}

	function handleWindowKeydown(e: KeyboardEvent) {
		// Let the existing Escape handler manage the file viewer
		if (viewingFile || fileLoading || viewFileError) return;
		if (e.ctrlKey || e.metaKey || e.altKey) return;

		// / → focus search input, switch to search tab
		if (e.key === '/' && !isTypingTarget(e.target)) {
			e.preventDefault();
			activeTab = 'search';
			tick().then(() => searchInputEl?.focus());
			return;
		}

		// Tab → switch between search/browse tabs
		if (e.key === 'Tab' && !isTypingTarget(e.target)) {
			e.preventDefault();
			if (activeTab === 'search') {
				activeTab = 'browse';
				tick().then(() => browseNav.refresh());
			} else if (activeTab === 'browse') {
				activeTab = 'search';
				tick().then(() => searchNav.refresh());
			}
			return;
		}

		if (isTypingTarget(e.target)) return;

		if (activeTab === 'browse') browseNav.handleKeydown(e);
		else if (activeTab === 'search') searchNav.handleKeydown(e);
	}

	$effect(() => {
		window.addEventListener('keydown', handleWindowKeydown);
		return () => window.removeEventListener('keydown', handleWindowKeydown);
	});

	// Refresh nav controllers when lists change
	$effect(() => {
		if (browseFiles.length >= 0) tick().then(() => browseNav.refresh());
	});
	$effect(() => {
		if (searchResults.length >= 0) tick().then(() => searchNav.refresh());
	});

	// Reindex state
	let reindexing = $state(false);
	let reindexResults = $state<any[] | null>(null);
	let reindexConfirming = $state(false);
	let reindexConfirmTimer: ReturnType<typeof setTimeout> | null = null;

	// --- Data Fetching ---
	async function fetchStatus() {
		statusLoading = true;
		try {
			const res = await fetch('/api/memory?action=status');
			const data = await res.json();
			projectStatuses = data.projects || [];
			// Set default browse project (prefer filtered project)
			if (!browseProject && projectStatuses.length > 0) {
				browseProject = filterProject && filterProject !== 'All Projects'
					? filterProject
					: projectStatuses[0].project;
			}
		} catch (err) {
			addToast({ message: 'Failed to load memory status', type: 'error' });
		} finally {
			statusLoading = false;
		}
	}

	async function handleSearch() {
		if (!searchQuery.trim()) return;
		searchLoading = true;
		searchError = '';
		try {
			const params = new URLSearchParams({ action: 'search', q: searchQuery, limit: '20' });
			if (filterProject && filterProject !== 'All Projects') {
				params.set('project', filterProject);
			}
			const res = await fetch(`/api/memory?${params}`);
			const data = await res.json();
			if (data.error) {
				searchError = data.error;
				searchResults = [];
			} else {
				searchResults = data.results || [];
				lastSearchQuery = searchQuery;
			}
		} catch (err) {
			searchError = err instanceof Error ? err.message : 'Search failed';
			searchResults = [];
		} finally {
			searchLoading = false;
		}
	}

	async function fetchBrowseFiles() {
		if (!browseProject) return;
		browseLoading = true;
		try {
			const params = new URLSearchParams({ action: 'browse', project: browseProject });
			const res = await fetch(`/api/memory?${params}`);
			const data = await res.json();
			browseFiles = data.files || [];
		} catch (err) {
			addToast({ message: 'Failed to load memory files', type: 'error' });
			browseFiles = [];
		} finally {
			browseLoading = false;
		}
	}

	async function viewFile(project: string, filename: string) {
		viewFileError = '';
		fileLoading = true;
		try {
			const params = new URLSearchParams({ action: 'file', project, filename });
			const res = await fetch(`/api/memory?${params}`);
			const data = await res.json();
			if (data.error) {
				viewFileError = data.error;
			} else {
				viewingFile = data;
			}
		} catch (err) {
			viewFileError = err instanceof Error ? err.message : 'Failed to load file';
		} finally {
			fileLoading = false;
		}
	}

	async function handleReindex(project?: string) {
		reindexing = true;
		reindexResults = null;
		try {
			const res = await fetch('/api/memory', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, force: false })
			});
			const data = await res.json();
			reindexResults = data.results || [];
			// Refresh status
			await fetchStatus();
		} catch (err) {
			addToast({ message: err instanceof Error ? err.message : 'Reindex failed', type: 'error' });
		} finally {
			reindexing = false;
		}
	}

	function handleSearchKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') handleSearch();
	}

	function closeFileViewer() {
		viewingFile = null;
		viewFileError = '';
	}

	function formatDate(dateStr: string | undefined) {
		if (!dateStr) return '';
		const d = new Date(dateStr);
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function formatSize(bytes: number) {
		if (bytes < 1024) return `${bytes}B`;
		return `${(bytes / 1024).toFixed(1)}KB`;
	}

	// Filtered project statuses based on URL project param
	let filteredStatuses = $derived(
		filterProject && filterProject !== 'All Projects'
			? projectStatuses.filter((p) => p.project === filterProject)
			: projectStatuses
	);

	// Total stats (based on filtered view)
	let totalFiles = $derived(filteredStatuses.reduce((sum, p) => sum + (p.fileCount || 0), 0));
	let totalChunks = $derived(filteredStatuses.reduce((sum, p) => sum + (p.chunkCount || 0), 0));
	let indexedProjects = $derived(filteredStatuses.filter((p) => p.hasIndex).length);

	// Sync project filter from URL
	$effect(() => {
		const projectParam = $page.url.searchParams.get('project');
		if (projectParam) {
			filterProject = projectParam;
			// Auto-set browse project to match
			if (!browseProject || browseProject !== projectParam) {
				browseProject = projectParam;
			}
		}
	});

	// Fetch on browse project change
	$effect(() => {
		if (browseProject) fetchBrowseFiles();
	});

	// Escape key to close file viewer
	$effect(() => {
		if (!viewingFile && !fileLoading && !viewFileError) return;
		function onEsc(e: KeyboardEvent) { if (e.key === 'Escape') closeFileViewer(); }
		window.addEventListener('keydown', onEsc);
		return () => window.removeEventListener('keydown', onEsc);
	});

	onMount(async () => {
		fetchStatus();
		projectColors = await fetchAndGetProjectColors();
		// Auto-open file viewer if ?file=&project= params are present (navigated from search palette)
		const fileParam = $page.url.searchParams.get('file');
		const projParam = $page.url.searchParams.get('project');
		if (fileParam && projParam) {
			viewFile(projParam, fileParam);
		}
	});

	onDestroy(() => {
		if (reindexConfirmTimer) clearTimeout(reindexConfirmTimer);
	});
</script>

<div class="flex flex-col h-full overflow-hidden" style="background: oklch(0.14 0.01 250);">
	<!-- Header -->
	<div
		class="flex items-center justify-between px-6 py-4 border-b shrink-0"
		style="
			background: oklch(0.16 0.01 250);
			border-color: oklch(0.25 0.02 250);
		"
	>
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-2.5">
				<h1 style="font-size: 0.875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: oklch(from var(--color-base-content) l c h / 60%); font-family: system-ui, -apple-system, sans-serif;">
					MEMORY
				</h1>
			</div>

			<!-- Quick stats -->
			{#if !statusLoading}
				<div class="flex items-center gap-3 ml-4">
					<span class="text-xs px-2 py-0.5 rounded" style="background: oklch(0.25 0.02 250); color: oklch(0.65 0.05 250); font-family: system-ui, -apple-system, sans-serif;">
						<span style="font-family: ui-monospace, monospace;">{totalFiles}</span> file{totalFiles !== 1 ? 's' : ''}
					</span>
					<span class="text-xs px-2 py-0.5 rounded" style="background: oklch(0.25 0.02 250); color: oklch(0.65 0.05 250); font-family: system-ui, -apple-system, sans-serif;">
						<span style="font-family: ui-monospace, monospace;">{totalChunks}</span> chunk{totalChunks !== 1 ? 's' : ''}
					</span>
					<span class="text-xs px-2 py-0.5 rounded" style="background: oklch(0.25 0.02 250); color: oklch(0.65 0.05 250); font-family: system-ui, -apple-system, sans-serif;">
						<span style="font-family: ui-monospace, monospace;">{indexedProjects}</span> project{indexedProjects !== 1 ? 's' : ''}
					</span>
				</div>
			{/if}
		</div>

		<!-- Reindex button — two-step to prevent accidental rebuild-all -->
		<button
			class="flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-all"
			style="
				background: {reindexConfirming ? 'oklch(0.55 0.20 25 / 0.15)' : 'oklch(0.55 0.15 145 / 0.15)'};
				border: 1px solid {reindexConfirming ? 'oklch(0.55 0.20 25 / 0.4)' : 'oklch(0.55 0.15 145 / 0.3)'};
				color: {reindexConfirming ? 'oklch(0.78 0.16 25)' : 'oklch(0.75 0.12 145)'};
				font-family: system-ui, -apple-system, sans-serif;
			"
			disabled={reindexing}
			onclick={() => {
				if (!reindexConfirming) {
					reindexConfirming = true;
					reindexConfirmTimer = setTimeout(() => { reindexConfirming = false; }, 2500);
				} else {
					if (reindexConfirmTimer) clearTimeout(reindexConfirmTimer);
					reindexConfirming = false;
					handleReindex();
				}
			}}
		>
			{#if reindexing}
				<span class="loading loading-spinner loading-xs"></span>
				Indexing...
			{:else if reindexConfirming}
				Confirm rebuild all?
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
					<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
				</svg>
				Rebuild Index
			{/if}
		</button>
	</div>

	<!-- Tab bar -->
	<div role="tablist" class="flex items-center gap-1 px-6 py-2 border-b shrink-0" style="border-color: oklch(0.22 0.02 250); background: oklch(0.16 0.01 250);">
		{#each [
			{ id: 'search', label: 'Search', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' },
			{ id: 'browse', label: 'Browse', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
			{ id: 'status', label: 'Status', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' }
		] as tab}
			<button
				role="tab"
				aria-selected={activeTab === tab.id}
				class="flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-all"
				style="
					background: {activeTab === tab.id ? 'oklch(0.65 0.15 280 / 0.15)' : 'transparent'};
					border: 1px solid {activeTab === tab.id ? 'oklch(0.65 0.15 280 / 0.3)' : 'transparent'};
					color: {activeTab === tab.id ? 'oklch(0.80 0.12 280)' : 'oklch(0.55 0.02 250)'};
					font-family: system-ui, -apple-system, sans-serif;
				"
				onclick={() => { activeTab = tab.id as typeof activeTab; }}
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
					<path stroke-linecap="round" stroke-linejoin="round" d={tab.icon} />
				</svg>
				{tab.label}
			</button>
		{/each}

		<!-- Project filter -->
		<div class="ml-auto" style="min-width: 140px;">
			<SearchDropdown
				value={filterProject}
				groups={projectFilterGroups}
				placeholder="All Projects"
				colorFn={getMemoryProjectColor}
				variant="chip"
				onChange={(v) => {
					filterProject = v;
					if (activeTab === 'browse' && v) browseProject = v;
				}}
			/>
		</div>
	</div>

	<!-- Content area -->
	<div class="flex-1 overflow-y-auto">
		<!-- SEARCH TAB -->
		{#if activeTab === 'search'}
			<div class="p-6 max-w-5xl mx-auto">
				<div>
					<p class="mb-3 text-xs" style="color: oklch(from var(--color-base-content) l c h / 40%); font-family: system-ui, -apple-system, sans-serif;">
						Search across agent memory files by content, task, or concept
					</p>
					<div class="flex gap-3 mb-4">
						<div class="flex-1 relative">
							<input
								bind:this={searchInputEl}
								type="text"
								bind:value={searchQuery}
								onkeydown={handleSearchKeydown}
								placeholder="Search memory entries..."
								class="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
								style="
									background: oklch(0.20 0.01 250);
									border: 1px solid oklch(0.30 0.02 250);
									color: oklch(0.85 0.05 250);
									font-family: ui-monospace, monospace;
								"
							/>
							{#if searchLoading}
								<span class="loading loading-spinner loading-sm absolute right-3 top-3" style="color: oklch(0.65 0.15 280);"></span>
							{/if}
						</div>
						<button
							class="px-4 py-2.5 rounded-lg text-sm font-bold transition-all"
							style="
								background: oklch(0.55 0.15 280 / 0.2);
								border: 1px solid oklch(0.55 0.15 280 / 0.4);
								color: oklch(0.80 0.12 280);
								font-family: system-ui, -apple-system, sans-serif;
							"
							disabled={searchLoading || !searchQuery.trim()}
							onclick={handleSearch}
						>
							Search
						</button>
					</div>

					<!-- Search results -->
					{#if searchError}
						<div class="mt-3 px-4 py-3 rounded-lg text-sm" style="background: oklch(0.50 0.15 30 / 0.15); border: 1px solid oklch(0.50 0.15 30 / 0.3); color: oklch(0.75 0.12 30); font-family: system-ui, -apple-system, sans-serif;">
							{searchError}
						</div>
					{/if}

					{#if searchResults.length > 0}
						<div class="mt-4 space-y-3" bind:this={searchResultsEl}>
							<div class="text-xs" style="color: oklch(0.55 0.02 250); font-family: system-ui, -apple-system, sans-serif;">
								<span style="font-family: ui-monospace, monospace;">{searchResults.length}</span> result{searchResults.length !== 1 ? 's' : ''} for "<span style="font-family: ui-monospace, monospace;">{lastSearchQuery}</span>"
							</div>
							{#each searchResults as result, i}
								<button use:reveal={{ animation: 'fade-in', delay: i * 0.05 }}
									data-nav-id={String(i)}
									class="w-full text-left p-4 rounded-lg transition-all"
									style="
										background: oklch(0.18 0.01 250);
										border: 1px solid oklch(0.25 0.02 250);
									"
									onclick={() => {
										const filename = result.path?.split('/').pop();
										if (filename && result.project) viewFile(result.project, filename);
									}}
								>
									<div class="flex items-center gap-2 mb-2">
										<span class="text-xs px-1.5 py-0.5 rounded" style="background: oklch(0.55 0.15 280 / 0.15); color: oklch(0.75 0.12 280); font-family: system-ui, -apple-system, sans-serif;">
											{result.project}
										</span>
										{#if result.taskId}
											<span class="text-xs px-1.5 py-0.5 rounded" style="background: oklch(0.55 0.15 200 / 0.15); color: oklch(0.75 0.12 200); font-family: ui-monospace, monospace;">
												{result.taskId}
											</span>
										{/if}
										{#if result.section}
											<span class="text-xs" style="color: oklch(0.50 0.02 250); font-family: system-ui, -apple-system, sans-serif;">
												§ <span style="font-family: ui-monospace, monospace;">{result.section}</span>
											</span>
										{/if}
										<span class="ml-auto text-xs" style="color: oklch(0.50 0.02 250); font-family: system-ui, -apple-system, sans-serif;">
											score: <span style="font-family: ui-monospace, monospace;">{result.score?.toFixed(2)}</span>
										</span>
									</div>
									<div class="text-sm whitespace-pre-wrap line-clamp-3" style="color: oklch(0.75 0.03 250); font-family: system-ui, -apple-system, sans-serif;">
										{result.snippet}
									</div>
									{#if result.source}
										<div class="mt-2 text-[10px]" style="color: oklch(0.45 0.02 250); font-family: system-ui, -apple-system, sans-serif;">
											via {result.source} | lines <span style="font-family: ui-monospace, monospace;">{result.startLine}-{result.endLine}</span>
										</div>
									{/if}
								</button>
							{/each}
						</div>
					{:else if lastSearchQuery && !searchLoading && !searchError}
						<div class="text-center py-8 text-sm" style="color: oklch(0.50 0.02 250); font-family: system-ui, -apple-system, sans-serif;">
							No results found for "<span style="font-family: ui-monospace, monospace;">{lastSearchQuery}</span>"
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- BROWSE TAB -->
		{#if activeTab === 'browse'}
			<div class="p-6 max-w-5xl mx-auto space-y-4">
				<!-- Project selector -->
				<div class="flex items-center gap-3">
					<span class="text-xs" style="color: oklch(0.55 0.02 250); font-family: system-ui, -apple-system, sans-serif;">Project:</span>
					{#if filteredStatuses.length > 1}
						<select
							bind:value={browseProject}
							class="px-3 py-1.5 rounded text-sm outline-none"
							style="background: oklch(0.20 0.01 250); border: 1px solid oklch(0.30 0.02 250); color: oklch(0.80 0.05 250); font-family: ui-monospace, monospace;"
						>
							{#each filteredStatuses as proj}
								<option value={proj.project}>{proj.project} ({proj.fileCount} files)</option>
							{/each}
						</select>
					{:else}
						<span style="font-family: ui-monospace, monospace; font-size: 0.875rem; color: oklch(0.80 0.05 250);">{browseProject}</span>
					{/if}
				</div>

				{#if browseLoading}
					<div class="flex items-center gap-2 py-8 justify-center">
						<span class="loading loading-spinner loading-sm" style="color: oklch(0.65 0.15 280);"></span>
						<span class="text-sm" style="color: oklch(0.55 0.02 250); font-family: system-ui, -apple-system, sans-serif;">Loading...</span>
					</div>
				{:else if browseFiles.length === 0}
					<div class="text-center py-12 space-y-3">
						<p class="text-sm" style="color: oklch(0.50 0.02 250); font-family: system-ui, -apple-system, sans-serif;">
							No memory files in <span style="font-family: ui-monospace, monospace;">{browseProject}</span>
						</p>
						<p class="text-xs" style="color: oklch(0.40 0.02 250); font-family: system-ui, -apple-system, sans-serif;">
							Memory files are created when tasks complete via /jat:complete
						</p>
						<p class="text-xs" style="color: oklch(0.35 0.02 250);">j/k to navigate · ? for shortcuts</p>
					</div>
				{:else}
					<div class="space-y-2" bind:this={browseListEl}>
						{#each browseFiles as file, i}
							<button
								data-nav-id={file.filename}
								class="w-full text-left p-4 rounded-lg transition-all"
								use:reveal={{ animation: 'fade-in', delay: i * 0.05 }}
								style="
									background: oklch(0.18 0.01 250);
									border: 1px solid oklch(0.25 0.02 250);
								"
								onclick={() => viewFile(browseProject, file.filename)}
							>
								<div class="flex items-center gap-2 mb-1.5">
									<span class="font-bold text-sm" style="color: oklch(0.85 0.05 250); font-family: system-ui, -apple-system, sans-serif;">
										{file.title}
									</span>
									{#if file.task}
										<span class="text-xs px-1.5 py-0.5 rounded" style="background: oklch(0.55 0.15 200 / 0.15); color: oklch(0.75 0.12 200); font-family: ui-monospace, monospace;">
											{file.task}
										</span>
									{/if}
									<span class="ml-auto text-[10px]" style="color: oklch(0.45 0.02 250); font-family: ui-monospace, monospace;">
										{formatSize(file.size)} | {formatDate(file.completed_at || file.modified)}
									</span>
								</div>
								{#if file.summary}
									<p class="text-xs line-clamp-2 mb-2" style="color: oklch(0.60 0.03 250); font-family: system-ui, -apple-system, sans-serif;">
										{file.summary}
									</p>
								{/if}
								<div class="flex items-center gap-2 flex-wrap">
									{#if file.agent}
										<span class="text-[10px] px-1.5 py-0.5 rounded" style="background: oklch(0.55 0.15 85 / 0.12); color: oklch(0.70 0.10 85); font-family: ui-monospace, monospace;">
											{file.agent}
										</span>
									{/if}
									{#if Array.isArray(file.tags)}
										{#each file.tags.slice(0, 5) as tag}
											<span class="text-[10px] px-1.5 py-0.5 rounded" style="background: oklch(0.30 0.02 250); color: oklch(0.60 0.03 250); font-family: ui-monospace, monospace;">
												{tag}
											</span>
										{/each}
									{/if}
									{#if file.risk}
										<span class="text-[10px] px-1.5 py-0.5 rounded ml-auto" style="
											background: {file.risk === 'high' ? 'oklch(0.50 0.15 30 / 0.15)' : file.risk === 'medium' ? 'oklch(0.55 0.15 85 / 0.12)' : 'oklch(0.30 0.02 250)'};
											color: {file.risk === 'high' ? 'oklch(0.75 0.12 30)' : file.risk === 'medium' ? 'oklch(0.70 0.10 85)' : 'oklch(0.60 0.03 250)'};
											font-family: ui-monospace, monospace;
										">
											risk: {file.risk}
										</span>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- STATUS TAB -->
		{#if activeTab === 'status'}
			<div class="p-6 max-w-5xl mx-auto space-y-6">
				{#if statusLoading}
					<div class="flex items-center gap-2 py-8 justify-center">
						<span class="loading loading-spinner loading-sm" style="color: oklch(0.65 0.15 280);"></span>
						<span class="text-sm" style="color: oklch(0.55 0.02 250); font-family: system-ui, -apple-system, sans-serif;">Loading status...</span>
					</div>
				{:else if filteredStatuses.length === 0}
					<div class="text-center py-12 space-y-3">
						<p class="text-sm" style="color: oklch(0.50 0.02 250); font-family: system-ui, -apple-system, sans-serif;">
							No projects with memory directories found
						</p>
						<p class="text-xs" style="color: oklch(0.40 0.02 250); font-family: system-ui, -apple-system, sans-serif;">
							Memory files are stored in .jat/memory/ within each project
						</p>
					</div>
				{:else}
					<!-- Reindex results -->
					{#if reindexResults}
						<div class="p-4 rounded-lg" style="background: oklch(0.55 0.15 145 / 0.1); border: 1px solid oklch(0.55 0.15 145 / 0.25);">
							<div class="text-xs font-bold mb-2" style="color: oklch(0.75 0.12 145); font-family: system-ui, -apple-system, sans-serif;">Reindex Complete</div>
							{#each reindexResults as r}
								<div class="text-xs" style="color: oklch(0.65 0.05 250); font-family: ui-monospace, monospace;">
									{r.project}: {r.error ? `Error: ${r.error}` : `${r.indexed || 0} indexed, ${r.chunks || r.totalChunks || 0} chunks`}
								</div>
							{/each}
						</div>
					{/if}

					<!-- Project cards -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#each filteredStatuses as proj, i}
							<div
								class="p-4 rounded-lg"
								use:reveal={{ animation: 'scale-in-center', delay: i * 0.1 }}
								style="
									background: oklch(0.18 0.01 250);
									border: 1px solid oklch(0.25 0.02 250);
								"
							>
								<div class="flex items-center justify-between mb-3">
									<div class="flex items-center gap-2">
										<span class="font-bold text-sm" style="color: oklch(0.85 0.05 250); font-family: system-ui, -apple-system, sans-serif;">
											{proj.project}
										</span>
										{#if proj.hasIndex}
											<span class="text-[10px] px-1.5 py-0.5 rounded" style="background: oklch(0.55 0.15 145 / 0.15); color: oklch(0.70 0.10 145); font-family: system-ui, -apple-system, sans-serif;">
												indexed
											</span>
										{:else}
											<span class="text-[10px] px-1.5 py-0.5 rounded" style="background: oklch(0.55 0.15 85 / 0.12); color: oklch(0.70 0.10 85); font-family: system-ui, -apple-system, sans-serif;">
												not indexed
											</span>
										{/if}
									</div>
									<button
										class="text-[10px] px-2 py-1 rounded transition-all"
										style="background: oklch(0.25 0.02 250); color: oklch(0.60 0.05 250); font-family: system-ui, -apple-system, sans-serif;"
										disabled={reindexing}
										onclick={() => handleReindex(proj.project)}
									>
										Reindex
									</button>
								</div>

								<div class="grid grid-cols-3 gap-3">
									<div>
										<div class="text-[10px] uppercase tracking-wider mb-1" style="color: oklch(0.45 0.02 250); font-family: system-ui, -apple-system, sans-serif;">Files</div>
										<div class="text-lg font-bold" style="color: oklch(0.80 0.05 250); font-family: ui-monospace, monospace;">{proj.fileCount || 0}</div>
									</div>
									<div>
										<div class="text-[10px] uppercase tracking-wider mb-1" style="color: oklch(0.45 0.02 250); font-family: system-ui, -apple-system, sans-serif;">Chunks</div>
										<div class="text-lg font-bold" style="color: oklch(0.80 0.05 250); font-family: ui-monospace, monospace;">{proj.chunkCount || 0}</div>
									</div>
									<div>
										<div class="text-[10px] uppercase tracking-wider mb-1" style="color: oklch(0.45 0.02 250); font-family: system-ui, -apple-system, sans-serif;">Embedded</div>
										<div class="text-lg font-bold" style="color: oklch(0.80 0.05 250); font-family: ui-monospace, monospace;">{proj.embeddedCount || 0}</div>
									</div>
								</div>

								{#if proj.error}
									<div class="mt-3 text-xs" style="color: oklch(0.65 0.10 30); font-family: system-ui, -apple-system, sans-serif;">
										{proj.error}
									</div>
								{/if}
							</div>
						{/each}
					</div>

					<!-- Info -->
					<div class="p-4 rounded-lg" style="background: oklch(0.16 0.01 250); border: 1px solid oklch(0.22 0.02 250);">
						<div class="text-xs space-y-1" style="color: oklch(0.50 0.02 250); font-family: system-ui, -apple-system, sans-serif;">
							<p>Memory files: <code style="color: oklch(0.65 0.10 280); font-family: ui-monospace, monospace;">.jat/memory/*.md</code></p>
							<p>Index database: <code style="color: oklch(0.65 0.10 280); font-family: ui-monospace, monospace;">.jat/memory.db</code></p>
							<p>CLI: <code style="color: oklch(0.65 0.10 280); font-family: ui-monospace, monospace;">jat-memory index | search | status | providers</code></p>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<KeyboardShortcutsOverlay shortcuts={[
		{ key: 'j / ↓', description: 'Focus next item' },
		{ key: 'k / ↑', description: 'Focus previous item' },
		{ key: 'Enter', description: 'Open file preview' },
		{ key: 'Tab', description: 'Switch between Search / Browse tabs' },
		{ key: '/', description: 'Focus search input' },
		{ key: 'Esc', description: 'Clear focus' },
	]} />

	<!-- File Viewer Drawer -->
	{#if viewingFile || fileLoading || viewFileError}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="fixed inset-0 z-50 flex justify-end"
			onclick={(e) => { if (e.target === e.currentTarget) closeFileViewer(); }}
		>
			<!-- Overlay — click to close -->
			<div class="absolute inset-0" style="background: oklch(0 0 0 / 0.5);" onclick={closeFileViewer}></div>

			<!-- Drawer panel -->
			<div
				class="relative w-full max-w-3xl h-full overflow-y-auto shadow-2xl"
				style="background: oklch(0.16 0.01 250); animation: memory-drawer-enter 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);"
			>
				{#if fileLoading}
					<div class="flex items-center gap-2 p-8 justify-center">
						<span class="loading loading-spinner loading-sm" style="color: oklch(0.65 0.15 280);"></span>
					</div>
				{:else if viewFileError}
					<div class="p-6">
						<!-- Close button -->
						<div class="flex justify-end mb-4">
							<button
								class="p-1.5 rounded transition-all"
								style="color: oklch(0.55 0.02 250);"
								onclick={closeFileViewer}
								aria-label="Close file viewer"
							>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<div class="px-4 py-3 rounded-lg text-sm" style="background: oklch(0.50 0.15 30 / 0.15); border: 1px solid oklch(0.50 0.15 30 / 0.3); color: oklch(0.75 0.12 30); font-family: system-ui, -apple-system, sans-serif;">
							{viewFileError}
						</div>
					</div>
				{:else if viewingFile}
					<!-- Header -->
					<div class="sticky top-0 flex items-center justify-between px-6 py-4 border-b z-10" style="background: oklch(0.18 0.01 250); border-color: oklch(0.25 0.02 250);">
						<div class="flex items-center gap-2">
							<span class="text-xs px-1.5 py-0.5 rounded" style="background: oklch(0.55 0.15 280 / 0.15); color: oklch(0.75 0.12 280); font-family: system-ui, -apple-system, sans-serif;">
								{viewingFile.project}
							</span>
							<span class="text-sm font-bold" style="color: oklch(0.85 0.05 250); font-family: ui-monospace, monospace;">
								{viewingFile.filename}
							</span>
						</div>
						<button
							class="p-1.5 rounded transition-all"
							style="color: oklch(0.55 0.02 250);"
							onclick={closeFileViewer}
							aria-label="Close file viewer"
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<!-- Frontmatter badges -->
					{#if viewingFile.frontmatter && Object.keys(viewingFile.frontmatter).length > 0}
						<div class="flex flex-wrap gap-2 px-6 py-3 border-b" style="border-color: oklch(0.22 0.02 250);">
							{#each Object.entries(viewingFile.frontmatter) as [key, value]}
								<span class="text-[10px] px-2 py-0.5 rounded" style="background: oklch(0.25 0.02 250); color: oklch(0.65 0.05 250); font-family: ui-monospace, monospace;">
									{key}: {Array.isArray(value) ? value.join(', ') : value}
								</span>
							{/each}
						</div>
					{/if}

					<!-- Content -->
					<div class="px-6 py-4">
						<pre class="text-sm whitespace-pre-wrap leading-relaxed" style="color: oklch(0.80 0.03 250); font-family: ui-monospace, monospace;">{viewingFile.content}</pre>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
