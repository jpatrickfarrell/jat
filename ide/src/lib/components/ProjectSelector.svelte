<script lang="ts">
	/**
	 * ProjectSelector Component
	 * Project action hub for the TopBar.
	 * Shows project-relevant features: server controls, ready tasks, actions, and epics.
	 * Project switching is handled by the TopBar's project switcher button.
	 *
	 * Active:   [● jat +] - plus button always visible on active project
	 * Inactive: [● jat]   - compact chip, plus button slides out on hover
	 * Click chip: dropdown with server, ready tasks, and actions
	 * Click +: opens task creation drawer for current project
	 */
	import { onMount } from "svelte";
	import { slide } from "svelte/transition";
	import { getProjectColor } from "$lib/utils/projectColors";
	import FxText from '$lib/components/FxText.svelte';
	import { SESSION_STATE_VISUALS } from "$lib/config/statusColors";
	import {
		isStartDropdownOpen,
		closeStartDropdown,
		openTaskDetailDrawer,
	} from '$lib/stores/drawerStore';
	import {
		start as startServer,
		stop as stopServer,
		restart as restartServer,
		getSessionByProject,
		serverSessionsState,
	} from "$lib/stores/serverSessions.svelte";
	import {
		playServerStartSound,
		playServerStopSound,
	} from "$lib/utils/soundEffects";

	interface ReadyTask {
		id: string;
		title: string;
		project?: string;
		priority?: number;
	}

	interface ActiveTask {
		id: string;
		title: string;
		project?: string;
		priority?: number;
		assignee?: string | null;
	}

	interface EpicChild {
		id: string;
		title: string;
		status: string;
		priority: number;
		isBlocked: boolean;
		assignee?: string;
	}

	interface Epic {
		id: string;
		title: string;
		project?: string;
		childCount?: number;
		readyChildIds?: string[];
		children?: EpicChild[];
	}

	interface Props {
		/** List of all projects (used by non-TopBar callers for project list in dropdown) */
		projects?: string[];
		selectedProject: string;
		/** Called when user selects a project (used by non-TopBar callers) */
		onProjectChange?: (project: string) => void;
		compact?: boolean;
		showColors?: boolean;
		/** Optional map of project name -> color. If provided, used instead of getProjectColor() */
		projectColors?: Map<string, string> | null;
		readyTasks?: ReadyTask[];
		activeTasks?: ActiveTask[];
		epics?: Epic[];
		idleSlots?: number;
		onNewTask?: (project: string) => void;
		onStart?: (taskId: string) => void;
		onSwarm?: (count: number, epicId?: string) => void;
		/** Session states for the selected project (one per agent) */
		sessionStates?: string[];
		/** Whether this is the globally active/selected project (affects chip opacity) */
		isActive?: boolean;
		/** Called when an inactive chip is clicked (to switch project). If provided, click switches project instead of opening dropdown. */
		onSelect?: () => void;
		/** If true, hovering the chip opens the dropdown instead of clicking (TopBar mode) */
		openOnHover?: boolean;
		/** Whether this project is currently a favorite */
		isFavorite?: boolean;
		/** Called when favorite star is toggled */
		onToggleFavorite?: (project: string) => void;
	}

	let {
		projects = [],
		selectedProject,
		onProjectChange,
		compact = false,
		showColors = false,
		projectColors = null,
		readyTasks = [],
		activeTasks = [],
		epics = [],
		idleSlots = 0,
		onNewTask,
		onStart,
		onSwarm,
		sessionStates = [],
		isActive = true,
		onSelect,
		openOnHover = false,
		isFavorite = false,
		onToggleFavorite,
	}: Props = $props();

	// If projects list is provided (non-TopBar usage), show projects section in dropdown
	const showProjectsList = $derived(projects.length > 0 && !!onProjectChange);


	let open = $state(false);
	let containerEl = $state<HTMLDivElement | null>(null);
	let hoveredAttackEpicId = $state<string | null>(null);
	let expandedEpics = $state(new Set<string>());
	let dropdownPos = $state({ top: 0, left: 0 });
	let hoverCloseTimer = $state<ReturnType<typeof setTimeout> | null>(null);

	function computeDropdownPos() {
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		const dropdownWidth = 220;
		let left = rect.left;
		if (left + dropdownWidth > window.innerWidth - 8) {
			left = window.innerWidth - dropdownWidth - 8;
		}
		dropdownPos = { top: rect.bottom + 4, left };
	}

	function handleMouseEnter() {
		if (!openOnHover) return;
		if (hoverCloseTimer) { clearTimeout(hoverCloseTimer); hoverCloseTimer = null; }
		if (!open) {
			computeDropdownPos();
			open = true;
		}
	}

	function handleMouseLeave() {
		if (!openOnHover) return;
		hoverCloseTimer = setTimeout(() => {
			open = false;
			closeStartDropdown();
		}, 180);
	}

	function handleDropdownMouseEnter() {
		if (!openOnHover) return;
		if (hoverCloseTimer) { clearTimeout(hoverCloseTimer); hoverCloseTimer = null; }
	}

	// Get color for a project - prefer passed projectColors, fall back to utility
	function getColor(project: string): string {
		if (projectColors && projectColors.has(project)) {
			return projectColors.get(project)!;
		}
		return getProjectColor(project);
	}

	let selectedColor = $derived(
		selectedProject ? getColor(selectedProject) : '#6b7280'
	);

	// Filter ready tasks for the selected project
	const projectReadyTasks = $derived(
		readyTasks.filter(t => {
			const taskProject = t.project || t.id.split('-')[0];
			return taskProject === selectedProject;
		})
	);

	// Filter active tasks for the selected project
	const projectActiveTasks = $derived(
		activeTasks.filter(t => {
			const taskProject = t.project || t.id.split('-')[0];
			return taskProject === selectedProject;
		})
	);

	// Filter epics for the selected project
	const projectEpics = $derived(
		epics.filter(e => e.project === selectedProject)
	);

	// Group ready tasks: epic children vs standalone
	// Uses readyChildIds from the epics API (dependency-based) instead of dot-notation only
	const epicTaskGroups = $derived.by(() => {
		// Build a map: task ID → epic ID (from readyChildIds provided by the API)
		const taskToEpic = new Map<string, string>();
		for (const epic of projectEpics) {
			if (epic.readyChildIds) {
				for (const childId of epic.readyChildIds) {
					taskToEpic.set(childId, epic.id);
				}
			}
		}

		const groups = new Map<string, ReadyTask[]>();
		const standalone: ReadyTask[] = [];

		for (const task of projectReadyTasks) {
			const epicId = taskToEpic.get(task.id);
			if (epicId) {
				if (!groups.has(epicId)) groups.set(epicId, []);
				groups.get(epicId)!.push(task);
			} else {
				standalone.push(task);
			}
		}
		return { groups, standalone };
	});

	const hasActions = $derived(!!onStart || !!onSwarm || !!onNewTask);

	// Server state for selected project
	interface ProjectServerInfo {
		key: string;
		port: number;
		serverPath: string | null;
	}
	let projectServerConfigs = $state<Map<string, ProjectServerInfo>>(new Map());
	let serverLoadingAction = $state<string | null>(null);
	let serverError = $state<string | null>(null);

	// Get server session for the selected project
	const selectedServerSession = $derived(
		getSessionByProject(selectedProject)
	);
	const selectedServerConfig = $derived(
		projectServerConfigs.get(selectedProject)
	);
	const serverIsRunning = $derived(
		selectedServerSession?.status === 'running' || selectedServerSession?.status === 'starting'
	);
	const hasServerConfig = $derived(!!selectedServerConfig);

	// Fetch project server configs on mount
	onMount(async () => {
		try {
			const response = await fetch("/api/projects");
			if (!response.ok) return;
			const data = await response.json();
			const configs = new Map<string, ProjectServerInfo>();
			for (const p of (data.projects || [])) {
				if (p.port || p.serverPath) {
					configs.set(p.name, {
						key: p.name,
						port: p.port || 5173,
						serverPath: p.serverPath || null,
					});
				}
			}
			projectServerConfigs = configs;
		} catch {
			// Silently ignore - server controls just won't show
		}
	});

	// Also update configs from running sessions that don't have config
	const effectiveServerConfig = $derived.by(() => {
		if (selectedServerConfig) return selectedServerConfig;
		// Check if there's a running session without config
		if (selectedServerSession) {
			return {
				key: selectedProject,
				port: selectedServerSession.port ?? 0,
				serverPath: null,
			};
		}
		return null;
	});

	async function handleServerStart() {
		serverLoadingAction = selectedProject;
		serverError = null;
		try {
			await startServer(selectedProject);
			playServerStartSound();
		} catch (e) {
			serverError = `Failed to start ${selectedProject}`;
		} finally {
			serverLoadingAction = null;
		}
	}

	async function handleServerStop() {
		if (!selectedServerSession) return;
		serverLoadingAction = selectedProject;
		serverError = null;
		try {
			await stopServer(selectedServerSession.sessionName);
			playServerStopSound();
		} catch (e) {
			serverError = `Failed to stop ${selectedProject}`;
		} finally {
			serverLoadingAction = null;
		}
	}

	async function handleServerRestart() {
		if (!selectedServerSession) return;
		serverLoadingAction = selectedProject;
		serverError = null;
		try {
			await restartServer(selectedServerSession.sessionName);
			playServerStartSound();
		} catch (e) {
			serverError = `Failed to restart ${selectedProject}`;
		} finally {
			serverLoadingAction = null;
		}
	}

	function handleServerOpenBrowser() {
		const config = effectiveServerConfig;
		if (config && config.port) {
			window.open(`http://localhost:${config.port}`, "_blank");
		}
	}

	async function handleServerAttach() {
		if (!selectedServerSession) return;
		try {
			await fetch(`/api/sessions/${encodeURIComponent(selectedServerSession.sessionName)}/attach?forceTerminal=true`, {
				method: 'POST'
			});
		} catch (e) {
			// Fire-and-forget — terminal opens independently
		}
	}


	function handleClickOutside(e: MouseEvent) {
		if (containerEl && !containerEl.contains(e.target as Node)) {
			open = false;
			closeStartDropdown();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
			closeStartDropdown();
		}
	}

	function handleStartTask(taskId: string) {
		open = false;
		closeStartDropdown();
		onStart?.(taskId);
	}

	function handleViewTask(taskId: string) {
		open = false;
		closeStartDropdown();
		openTaskDetailDrawer(taskId);
	}

	function handleSwarmClick(count: number, epicId?: string) {
		open = false;
		onSwarm?.(count, epicId);
	}

	function handleNewTaskClick(e: MouseEvent) {
		e.stopPropagation();
		onNewTask?.(selectedProject);
	}


	// Alt+S keyboard shortcut support - open dropdown to show ready tasks
	$effect(() => {
		const unsubscribe = isStartDropdownOpen.subscribe((isOpen: boolean) => {
			if (isOpen && readyTasks.length > 0) {
				computeDropdownPos();
				open = true;
			}
		});
		return unsubscribe;
	});

	// ─── History (latest commit / CF deployment / Supabase migration) ───────────

	interface HistoryGit {
		hashShort: string;
		message: string;
		date: string;
		isPushed: boolean;
		branch: string;
	}
	interface HistoryCF {
		status: 'success' | 'failure' | 'active' | 'canceled' | 'idle';
		environment: string;
		createdOn: string;
	}
	interface HistorySB {
		name: string;
		localOnly: number;
	}
	interface HistoryData {
		git: HistoryGit | null;
		cf: HistoryCF | null;
		sb: HistorySB | null;
		loading: boolean;
	}

	let historyData = $state<HistoryData>({ git: null, cf: null, sb: null, loading: false });
	let historyFetchedFor = $state<string | null>(null);

	function relativeTime(dateStr: string): string {
		const diff = Date.now() - new Date(dateStr).getTime();
		const mins = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);
		if (mins < 1) return 'just now';
		if (mins < 60) return `${mins}m`;
		if (hours < 24) return `${hours}h`;
		if (days < 30) return `${days}d`;
		return `${Math.floor(days / 30)}mo`;
	}

	async function fetchHistory() {
		if (historyData.loading) return;
		historyData = { git: null, cf: null, sb: null, loading: true };
		historyFetchedFor = selectedProject;

		const [gitRes, cfRes, sbRes] = await Promise.allSettled([
			fetch(`/api/files/git/log?project=${encodeURIComponent(selectedProject)}&limit=1`).then(r => r.ok ? r.json() : null),
			fetch(`/api/cloudflare/deployments?project=${encodeURIComponent(selectedProject)}&per_page=1`).then(r => r.ok ? r.json() : null),
			fetch(`/api/supabase/status?project=${encodeURIComponent(selectedProject)}`).then(r => r.ok ? r.json() : null),
		]);

		const gitVal = gitRes.status === 'fulfilled' ? gitRes.value : null;
		const cfVal  = cfRes.status  === 'fulfilled' ? cfRes.value  : null;
		const sbVal  = sbRes.status  === 'fulfilled' ? sbRes.value  : null;

		const git: HistoryGit | null = gitVal?.commits?.[0]
			? {
				hashShort: gitVal.commits[0].hashShort,
				message:   gitVal.commits[0].message,
				date:      gitVal.commits[0].date,
				isPushed:  gitVal.commits[0].isPushed,
				branch:    gitVal.currentBranch || '',
			  }
			: null;

		const cf: HistoryCF | null = cfVal?.deployments?.[0]
			? {
				status:      cfVal.deployments[0].status,
				environment: cfVal.deployments[0].environment,
				createdOn:   cfVal.deployments[0].createdOn,
			  }
			: null;

		let sb: HistorySB | null = null;
		if (sbVal?.hasSupabase && sbVal?.migrations?.length) {
			// Find latest local migration (highest version timestamp)
			const localMigrations = sbVal.migrations
				.filter((m: { localVersion?: string; name?: string; filename?: string }) => m.localVersion)
				.sort((a: { localVersion: string }, b: { localVersion: string }) => b.localVersion.localeCompare(a.localVersion));
			if (localMigrations.length > 0) {
				const latest = localMigrations[0];
				sb = {
					name: latest.name || latest.filename || latest.localVersion,
					localOnly: sbVal.stats?.localOnly || 0,
				};
			}
		}

		historyData = { git, cf, sb, loading: false };
	}

	// Fetch history when dropdown opens for a new project
	$effect(() => {
		if (open && historyFetchedFor !== selectedProject) {
			fetchHistory();
		}
	});

	$effect(() => {
		if (open) {
			document.addEventListener('click', handleClickOutside, true);
			document.addEventListener('keydown', handleKeydown);
		}
		return () => {
			document.removeEventListener('click', handleClickOutside, true);
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div class="selector-container" bind:this={containerEl}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	role="group"
>
	<div class="chip-group" class:inactive={!isActive} style="--project-color: {selectedColor};">
		<button
			type="button"
			class="trigger-btn"
			class:compact
			onclick={() => {
				if (!isActive && onSelect) {
					// Inactive chip: switch project, close any open dropdown
					onSelect();
					open = false;
				} else if (!openOnHover) {
					// Active chip (or non-hover mode): toggle dropdown manually
					if (!open) computeDropdownPos();
					open = !open;
				}
				// In openOnHover mode, active chip click does nothing (hover handles it)
			}}
		>
			{#if sessionStates.length > 0}
				<span class="chip-dots">
					{#each sessionStates as state}
						{@const visual = SESSION_STATE_VISUALS[state]}
						{@const color = visual?.accent || selectedColor}
						{@const isNI = state === 'needs-input'}
						{@const isRev = state === 'ready-for-review'}
						{#if isNI || isRev}
							<span class="chip-dot-animated">
								<span class="chip-dot-ping" class:animate-ping={isNI} class:animate-pulse={isRev} style="background: {color};"></span>
								<span class="chip-dot-core" style="background: {color};"></span>
							</span>
						{:else}
							<span class="chip-dot" style="background: {color};"></span>
						{/if}
					{/each}
				</span>
			{/if}
			<span class="chip-label">{selectedProject}</span>

		</button>

		<!-- Inline server controls on chip (only when server is running — start server lives in dropdown) -->
		{#if serverIsRunning || serverLoadingAction === selectedProject}
			<div class="chip-server-controls" class:chip-server-active={isActive}>
				{#if serverLoadingAction === selectedProject}
					<span class="loading loading-spinner loading-xs" style="color: oklch(0.65 0.02 250); width: 0.625rem; height: 0.625rem;"></span>
				{:else}
					<div class="chip-server-btns">
						<button type="button" class="chip-server-btn" onclick={(e) => { e.stopPropagation(); handleServerOpenBrowser(); }} title="Open in browser">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
						</button>
						<button type="button" class="chip-server-btn" onclick={(e) => { e.stopPropagation(); handleServerRestart(); }} title="Restart server">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
						</button>
						<button type="button" class="chip-server-btn chip-server-btn-danger" onclick={(e) => { e.stopPropagation(); handleServerStop(); }} title="Stop server">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" /></svg>
						</button>
						<button type="button" class="chip-server-btn" onclick={(e) => { e.stopPropagation(); handleServerAttach(); }} title="Attach in tmux">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg>
						</button>
					</div>
					<span class="chip-server-dot chip-server-running" style="margin: 0 0.25rem;"></span>
				{/if}
			</div>
		{/if}

		{#if onNewTask}
			<button
				type="button"
				class="new-btn"
				class:new-btn-always={isActive}
				onclick={handleNewTaskClick}
				title="New task (Alt+N)"
			>
				<svg class="new-icon" viewBox="0 0 20 20" fill="currentColor">
					<path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
				</svg>
			</button>
		{/if}
	</div>

	{#if open}
		<div class="dropdown-menu" style="top: {dropdownPos.top}px; left: {dropdownPos.left}px;"
			onmouseenter={handleDropdownMouseEnter}
			onmouseleave={handleMouseLeave}
			role="group"
		>
			<!-- Header row: project name + star -->
			<div class="dropdown-header-row" style="--project-color: {selectedColor};">
				<span class="dropdown-fav-dot"></span>
				<span class="dropdown-fav-label">{selectedProject}</span>

				{#if serverError}
					<span class="header-server-error" title={serverError}>!</span>
				{/if}

				{#if onToggleFavorite}
					<button
						type="button"
						class="dropdown-fav-star"
						class:dropdown-fav-star-active={isFavorite}
						onclick={(e) => { e.stopPropagation(); onToggleFavorite?.(selectedProject); }}
						title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
					>
						{#if isFavorite}
							<svg viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" /></svg>
						{:else}
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
						{/if}
					</button>
				{/if}
			</div>
			<div class="dropdown-divider"></div>

			<!-- Server Section (shown when project has server config or running session) -->
			{#if effectiveServerConfig}
				<div class="dropdown-server-row">
					<div class="dropdown-server-info">
						<span class="dropdown-server-dot" class:dropdown-server-dot-running={serverIsRunning}></span>
						<span class="dropdown-server-port">:{effectiveServerConfig.port}</span>
						<span class="dropdown-server-status">{serverIsRunning ? 'Running' : 'Stopped'}</span>
					</div>
					<div class="dropdown-server-actions">
						{#if serverLoadingAction === selectedProject}
							<span class="loading loading-spinner loading-xs" style="color: oklch(0.65 0.02 250);"></span>
						{:else if serverIsRunning}
							<button type="button" class="dropdown-server-btn" onclick={(e) => { e.stopPropagation(); handleServerOpenBrowser(); }} title="Open in browser">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
							</button>
							<button type="button" class="dropdown-server-btn" onclick={(e) => { e.stopPropagation(); handleServerRestart(); }} title="Restart server">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
							</button>
							<button type="button" class="dropdown-server-btn dropdown-server-btn-danger" onclick={(e) => { e.stopPropagation(); handleServerStop(); }} title="Stop server">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" /></svg>
							</button>
							<button type="button" class="dropdown-server-btn" onclick={(e) => { e.stopPropagation(); handleServerAttach(); }} title="Attach in tmux">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg>
							</button>
						{:else}
							<button type="button" class="dropdown-server-btn dropdown-server-btn-success" onclick={(e) => { e.stopPropagation(); handleServerStart(); }} title="Start server">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
							</button>
						{/if}
					</div>
				</div>
				{#if serverError}
					<div class="dropdown-server-error">{serverError}</div>
				{/if}
				<div class="dropdown-divider"></div>
			{/if}

			<!-- Projects Section (only shown when used outside TopBar, e.g. IngestWizard, McpConfigEditor) -->
			{#if showProjectsList}
				<div class="dropdown-section-header">Projects</div>
				{#each projects as project}
					{@const projColor = getColor(project)}
					<button
						type="button"
						class="dropdown-item project-item"
						class:active={selectedProject === project}
						style="--project-color: {projColor};"
						onclick={() => { onProjectChange?.(project); open = false; }}
					>
						<span class="item-dot"></span>
						<span class="item-label">{project}</span>
						{#if selectedProject === project}
							<svg class="check-icon" viewBox="0 0 16 16" fill="currentColor">
								<path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd" />
							</svg>
						{/if}
					</button>
				{/each}
			{/if}

			<!-- History Section: latest commit / CF deployment / Supabase migration -->
			{#if historyData.loading}
				<div class="history-row history-loading-row">
					<span class="loading loading-spinner loading-xs" style="color: oklch(0.50 0.02 250);"></span>
					<span class="history-loading-text">Loading history…</span>
				</div>
				<div class="dropdown-divider"></div>
			{:else if historyData.git || historyData.cf || historyData.sb}
				<div class="history-rows">
					{#if historyData.git}
						<div class="history-row">
							<span class="history-label history-label-git">git</span>
							<span class="history-hash">{historyData.git.hashShort}</span>
							<span class="history-msg">{historyData.git.message}</span>
							<span class="history-time">{relativeTime(historyData.git.date)}</span>
							{#if !historyData.git.isPushed}
								<span class="history-tag history-tag-warn" title="Uncommitted changes">↑</span>
							{/if}
						</div>
					{/if}
					{#if historyData.cf}
						{@const cfStatusColor = historyData.cf.status === 'success' ? 'history-cf-success' : historyData.cf.status === 'failure' ? 'history-cf-fail' : historyData.cf.status === 'active' ? 'history-cf-active' : 'history-cf-idle'}
						{@const cfGlyph = historyData.cf.status === 'success' ? '✓' : historyData.cf.status === 'failure' ? '✗' : historyData.cf.status === 'active' ? '◉' : '○'}
						<div class="history-row">
							<span class="history-label history-label-cf">cf</span>
							<span class="history-cf-status {cfStatusColor}">{cfGlyph}</span>
							<span class="history-msg">{historyData.cf.environment}</span>
							<span class="history-time">{relativeTime(historyData.cf.createdOn)}</span>
						</div>
					{/if}
					{#if historyData.sb}
						<div class="history-row">
							<span class="history-label history-label-db">db</span>
							<span class="history-msg">{historyData.sb.name}</span>
							{#if historyData.sb.localOnly > 0}
								<span class="history-tag history-tag-warn" title="{historyData.sb.localOnly} local-only migration(s)">+{historyData.sb.localOnly}</span>
							{/if}
						</div>
					{/if}
				</div>
				<div class="dropdown-divider"></div>
			{/if}

			<!-- Active Tasks Section -->
			{#if projectActiveTasks.length > 0}
				{@const historyShown = historyData.loading || !!(historyData.git || historyData.cf || historyData.sb)}
				{#if showProjectsList && !historyShown}<div class="dropdown-divider"></div>{/if}
				<div class="dropdown-section-header">Active ({projectActiveTasks.length})</div>
				{#each projectActiveTasks as task}
					<div class="dropdown-item task-item active-task-item">
						<button
							type="button"
							class="task-info-btn"
							onclick={() => handleViewTask(task.id)}
						>
							<span class="active-dot"></span>
							{#if task.priority !== undefined}
								<span class="priority-badge priority-{task.priority}">P{task.priority}</span>
							{/if}
							<span class="item-label task-title"><FxText text={task.title} /></span>
						</button>
						{#if task.assignee}
							<span class="task-assignee">{task.assignee}</span>
						{/if}
					</div>
				{/each}
			{/if}

			<!-- Ready Tasks Section (grouped by epics, then standalone) -->
			{#if hasActions && projectReadyTasks.length > 0}
				{#if showProjectsList || projectActiveTasks.length > 0}<div class="dropdown-divider"></div>{/if}
				<div class="dropdown-section-header">Ready ({projectReadyTasks.length})</div>
				<div class="dropdown-scroll">
					<!-- Epic groups -->
					{#each projectEpics as epic}
						{@const allChildren = epic.children || []}
						{@const readySet = new Set(epic.readyChildIds || [])}
						{@const readyCount = readySet.size}
						{#if allChildren.length > 0}
							{@const isExpanded = expandedEpics.has(epic.id)}
							<div class="epic-group">
								<button
									type="button"
									class="epic-bar"
									style="--project-color: {selectedColor};"
									onclick={() => { const next = new Set(expandedEpics); if (next.has(epic.id)) next.delete(epic.id); else next.add(epic.id); expandedEpics = next; }}
								>
									<svg class="epic-bar-chevron" class:epic-bar-chevron-open={isExpanded} viewBox="0 0 16 16" fill="currentColor">
										<path fill-rule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
									</svg>
									<span class="epic-bar-icon">🏔️</span>
									<span class="epic-bar-label"><FxText text={epic.title} /></span>
									<span class="epic-bar-count">{readyCount}/{allChildren.length}</span>
									{#if readyCount > 0 && idleSlots > 0 && onSwarm}
										<button
											type="button"
											class="epic-bar-attack"
											onclick={(e) => { e.stopPropagation(); handleSwarmClick(Math.min(readyCount, idleSlots), epic.id); }}
											onmouseenter={(e) => { e.stopPropagation(); hoveredAttackEpicId = epic.id; }}
											onmouseleave={() => { if (hoveredAttackEpicId === epic.id) hoveredAttackEpicId = null; }}
											title="Attack epic ({readyCount} ready)"
										>
											<svg viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
												<path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.5A.75.75 0 002.75 12h6.572l-1.305 6.093a.75.75 0 001.292.657l8.5-9.5A.75.75 0 0017.25 8h-6.572l1.305-6.093z" />
											</svg>
										</button>
									{/if}
								</button>
								{#if isExpanded}
								<div class="epic-children" transition:slide={{ duration: 150 }}>
								{#each allChildren as child}
									{@const isReady = readySet.has(child.id)}
									{@const isActive = child.status === 'in_progress'}
									{@const isClosed = child.status === 'closed'}
									<div
										class="dropdown-item task-item epic-child-item"
										class:attack-highlight={isReady && hoveredAttackEpicId === epic.id}
										class:child-inactive={!isReady && !isActive}
										class:child-closed={isClosed}
									>
										<button
											type="button"
											class="task-info-btn"
											onclick={() => handleViewTask(child.id)}
										>
											{#if isActive}
												<span class="active-dot"></span>
											{:else if child.isBlocked}
												<span class="blocked-dot"></span>
											{:else if isClosed}
												<span class="closed-dot"></span>
											{/if}
											{#if child.priority !== undefined}
												<span class="priority-badge priority-{child.priority}">P{child.priority}</span>
											{/if}
											<span class="item-label task-title"><FxText text={child.title} /></span>
										</button>
										{#if isReady && onStart}
											<button
												type="button"
												class="task-launch-btn"
												onclick={(e) => { e.stopPropagation(); handleStartTask(child.id); }}
												title="Launch agent"
											>
												<svg viewBox="0 0 20 20" fill="currentColor"><path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" /></svg>
											</button>
										{:else if isActive && child.assignee}
											<span class="task-assignee">{child.assignee}</span>
										{/if}
									</div>
								{/each}
								</div>
								{/if}
							</div>
						{/if}
					{/each}

					<!-- Standalone tasks -->
					{#if epicTaskGroups.standalone.length > 0}
						{#if projectEpics.some(e => (epicTaskGroups.groups.get(e.id) || []).length > 0)}
							<div class="dropdown-divider"></div>
						{/if}
						{#each epicTaskGroups.standalone as task}
							<div class="dropdown-item task-item">
								<button
									type="button"
									class="task-info-btn"
									onclick={() => handleViewTask(task.id)}
								>
									{#if task.priority !== undefined}
										<span class="priority-badge priority-{task.priority}">P{task.priority}</span>
									{/if}
									<span class="item-label task-title"><FxText text={task.title} /></span>
								</button>
								{#if onStart}
									<button
										type="button"
										class="task-launch-btn"
										onclick={(e) => { e.stopPropagation(); handleStartTask(task.id); }}
										title="Launch agent"
									>
										<svg viewBox="0 0 20 20" fill="currentColor"><path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" /></svg>
									</button>
								{/if}
							</div>
						{/each}
					{/if}
				</div>

			{:else if hasActions}
				{#if showProjectsList || effectiveServerConfig || serverIsRunning}<div class="dropdown-divider"></div>{/if}
				<div class="dropdown-empty">No ready tasks</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.selector-container {
		position: relative;
		display: inline-block;
	}

	/* Pill container for chip + new button */
	.chip-group {
		display: inline-flex;
		align-items: stretch;
		border-radius: 0.375rem;
		background: color-mix(in oklch, var(--project-color) 25%, transparent);
		border: 1px solid color-mix(in oklch, var(--project-color) 50%, transparent);
		box-shadow: 0 0 6px color-mix(in oklch, var(--project-color) 15%, transparent);
		transition: all 0.15s ease;
		overflow: hidden;
	}

	.chip-group:hover {
		background: color-mix(in oklch, var(--project-color) 35%, transparent);
		border-color: color-mix(in oklch, var(--project-color) 65%, transparent);
		box-shadow: 0 0 10px color-mix(in oklch, var(--project-color) 25%, transparent);
	}

	/* Muted styling for non-active project chips */
	.chip-group.inactive {
		background: transparent;
		border-color: color-mix(in oklch, var(--project-color) 20%, transparent);
		box-shadow: none;
		opacity: 0.5;
	}

	.chip-group.inactive:hover {
		opacity: 1;
		background: color-mix(in oklch, var(--project-color) 18%, transparent);
		border-color: color-mix(in oklch, var(--project-color) 45%, transparent);
		box-shadow: 0 0 6px color-mix(in oklch, var(--project-color) 15%, transparent);
	}

	/* Main trigger button */
	.trigger-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.3rem 0.5rem;
		background: transparent;
		border: none;
		cursor: pointer;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		color: var(--project-color);
		transition: background 0.1s ease;
	}

	.trigger-btn.compact {
		padding: 0.2rem 0.4rem;
		font-size: 0.6875rem;
	}

	.trigger-btn:hover {
		background: color-mix(in oklch, var(--project-color) 10%, transparent);
	}

	.chip-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--project-color);
		flex-shrink: 0;
	}

	.chip-dots {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		flex-shrink: 0;
	}

	.chip-dot-animated {
		position: relative;
		display: inline-flex;
		width: 0.5rem;
		height: 0.5rem;
		flex-shrink: 0;
		overflow: hidden;
	}

	.chip-dot-ping {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		opacity: 0.75;
	}

	.chip-dot-core {
		position: relative;
		display: inline-flex;
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.chip-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Inline server controls on chip (only shown when server is running) */
	.chip-server-controls {
		display: flex;
		align-items: center;
		gap: 0.125rem;
		padding: 0 0.25rem;
		border-left: 1px solid color-mix(in oklch, var(--project-color) 35%, transparent);
	}

	/* Server action buttons - hidden on inactive, expand on hover */
	.chip-server-btns {
		display: flex;
		align-items: center;
		gap: 0.125rem;
		max-width: 0;
		overflow: hidden;
		opacity: 0;
		transition: all 0.2s ease;
	}

	/* Always show buttons on active chip */
	.chip-server-active .chip-server-btns {
		max-width: 5rem;
		opacity: 1;
	}

	/* Show buttons on hover for inactive chips */
	.chip-group:hover .chip-server-btns {
		max-width: 5rem;
		opacity: 1;
	}

	.chip-server-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		border: none;
		background: transparent;
		cursor: pointer;
		color: oklch(0.55 0.02 250);
		padding: 0;
		border-radius: 0.1875rem;
		transition: all 0.1s ease;
		flex-shrink: 0;
	}

	.chip-server-btn svg {
		width: 0.625rem;
		height: 0.625rem;
	}

	.chip-server-btn:hover {
		color: oklch(0.85 0.02 250);
		background: oklch(0.28 0.02 250);
	}

	.chip-server-btn-success {
		color: oklch(0.55 0.12 145);
	}

	.chip-server-btn-success:hover {
		color: oklch(0.85 0.15 145);
		background: oklch(0.28 0.08 145 / 0.3);
	}

	.chip-server-btn-danger {
		color: oklch(0.55 0.10 30);
	}

	.chip-server-btn-danger:hover {
		color: oklch(0.85 0.15 30);
		background: oklch(0.28 0.08 30 / 0.3);
	}

	.chip-server-dot {
		width: 0.3rem;
		height: 0.3rem;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.chip-server-running {
		background: oklch(0.70 0.18 145);
		box-shadow: 0 0 4px oklch(0.70 0.18 145);
	}

	/* Hover-expand + button */
	.new-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		max-width: 0;
		padding: 0;
		border: none;
		border-left: 0px solid transparent;
		background: transparent;
		opacity: 0;
		overflow: hidden;
		transition: all 0.2s ease;
		cursor: pointer;
		color: oklch(0.85 0.18 145);
	}

	/* Always visible on active project */
	.new-btn.new-btn-always {
		max-width: 1.75rem;
		padding: 0 0.3rem;
		border-left: 1px solid color-mix(in oklch, var(--project-color) 35%, transparent);
		opacity: 1;
	}

	.chip-group:hover .new-btn {
		max-width: 1.75rem;
		padding: 0 0.3rem;
		border-left: 1px solid color-mix(in oklch, var(--project-color) 35%, transparent);
		opacity: 1;
	}

	.new-btn:hover {
		background: oklch(0.30 0.08 145 / 0.3);
	}

	.new-icon {
		width: 0.875rem;
		height: 0.875rem;
		flex-shrink: 0;
	}

	/* Dropdown */
	.dropdown-menu {
		position: fixed;
		min-width: 16rem;
		max-width: 22rem;
		padding: 0.25rem;
		border-radius: 0.5rem;
		background: oklch(0.18 0.01 250);
		border: 1px solid oklch(0.28 0.02 250 / 0.5);
		box-shadow: 0 8px 24px oklch(0 0 0 / 0.4);
		z-index: 60;
		animation: dropdown-in 0.12s ease-out;
	}

	@keyframes dropdown-in {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}

	/* Section header */
	.dropdown-section-header {
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(0.50 0.02 250);
		padding: 0.375rem 0.5rem 0.25rem;
	}

	.dropdown-divider {
		height: 1px;
		background: oklch(0.26 0.02 250);
		margin: 0.25rem 0;
	}

	/* Dropdown items (shared) */
	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.375rem 0.5rem;
		border-radius: 0.375rem;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 0.75rem;
		color: oklch(0.75 0.02 250);
		transition: background 0.1s ease;
		text-align: left;
	}

	.dropdown-item:hover:not(:disabled) {
		background: oklch(0.24 0.02 250);
		color: oklch(0.92 0.02 250);
	}

	.dropdown-item:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Project items (shown in non-TopBar usage) */
	.project-item {
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
	}

	.project-item:hover:not(:disabled) {
		background: color-mix(in oklch, var(--project-color) 15%, transparent);
		color: var(--project-color);
	}

	.project-item.active {
		color: var(--project-color);
	}

	.item-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--project-color);
		flex-shrink: 0;
		opacity: 0.8;
	}

	.project-item.active .item-dot {
		opacity: 1;
		box-shadow: 0 0 5px color-mix(in oklch, var(--project-color) 50%, transparent);
	}

	.check-icon {
		width: 0.875rem;
		height: 0.875rem;
		flex-shrink: 0;
		color: var(--project-color);
	}

	.item-label {
		flex: 1;
		text-align: left;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.task-title {
		max-width: none;
	}

	/* Task items */
	.task-item {
		font-size: 0.8125rem;
	}

	/* Dropdown server section */
	.dropdown-server-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.3rem 0.5rem;
	}

	.dropdown-server-info {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.dropdown-server-dot {
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 50%;
		background: oklch(0.45 0.02 250);
		flex-shrink: 0;
	}

	.dropdown-server-dot-running {
		background: oklch(0.70 0.18 145);
		box-shadow: 0 0 4px oklch(0.70 0.18 145);
	}

	.dropdown-server-port {
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.6875rem;
		color: oklch(0.60 0.02 250);
	}

	.dropdown-server-status {
		font-size: 0.6875rem;
		color: oklch(0.50 0.02 250);
	}

	.dropdown-server-actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.dropdown-server-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		padding: 0;
		background: oklch(0.24 0.02 250);
		border: 1px solid oklch(0.32 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.60 0.02 250);
		cursor: pointer;
		transition: all 0.1s ease;
		flex-shrink: 0;
	}

	.dropdown-server-btn svg {
		width: 0.6rem;
		height: 0.6rem;
	}

	.dropdown-server-btn:hover {
		background: oklch(0.30 0.04 250);
		color: oklch(0.85 0.02 250);
	}

	.dropdown-server-btn-success {
		border-color: oklch(0.40 0.12 145 / 0.5);
		color: oklch(0.60 0.12 145);
	}

	.dropdown-server-btn-success:hover {
		background: oklch(0.28 0.08 145 / 0.3);
		color: oklch(0.80 0.15 145);
	}

	.dropdown-server-btn-danger {
		border-color: oklch(0.40 0.10 30 / 0.5);
		color: oklch(0.60 0.10 30);
	}

	.dropdown-server-btn-danger:hover {
		background: oklch(0.28 0.08 30 / 0.3);
		color: oklch(0.80 0.15 30);
	}

	.dropdown-server-error {
		padding: 0.25rem 0.5rem;
		font-size: 0.6875rem;
		color: oklch(0.70 0.15 30);
		background: oklch(0.22 0.05 30 / 0.2);
		border-radius: 0.25rem;
		margin: 0 0.25rem 0.25rem;
	}

	.dropdown-hint {
		margin-left: auto;
		font-size: 0.6875rem;
		color: oklch(0.50 0.02 250);
		flex-shrink: 0;
	}

	/* Priority badges */
	.priority-badge {
		font-size: 0.5625rem;
		font-weight: 700;
		padding: 0.0625rem 0.3rem;
		border-radius: 0.25rem;
		flex-shrink: 0;
	}

	.priority-badge.priority-0 {
		background: oklch(0.45 0.15 25 / 0.3);
		color: oklch(0.75 0.18 25);
	}

	.priority-badge.priority-1 {
		background: oklch(0.50 0.12 60 / 0.3);
		color: oklch(0.80 0.15 60);
	}

	.priority-badge.priority-2 {
		background: oklch(0.45 0.10 220 / 0.3);
		color: oklch(0.75 0.12 220);
	}

	.priority-badge.priority-3,
	.priority-badge.priority-4 {
		background: oklch(0.35 0.02 250 / 0.5);
		color: oklch(0.65 0.02 250);
	}

	/* Scrollable task list */
	.dropdown-scroll {
		max-height: 12rem;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: oklch(0.35 0.02 250) transparent;
	}

	.dropdown-scroll::-webkit-scrollbar {
		width: 0.4rem;
	}

	.dropdown-scroll::-webkit-scrollbar-track {
		background: transparent;
	}

	.dropdown-scroll::-webkit-scrollbar-thumb {
		background: oklch(0.35 0.02 250);
		border-radius: 0.2rem;
	}

	/* Header row: project name + star */
	.dropdown-header-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
	}

	.dropdown-fav-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--project-color);
		flex-shrink: 0;
	}

	.dropdown-fav-label {
		flex: 1;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		color: var(--project-color);
	}

	.dropdown-fav-star {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		border: none;
		background: transparent;
		cursor: pointer;
		color: oklch(0.45 0.02 250);
		transition: all 0.15s ease;
		flex-shrink: 0;
		padding: 0;
	}

	.dropdown-fav-star svg {
		width: 0.875rem;
		height: 0.875rem;
	}

	.dropdown-fav-star:hover {
		color: oklch(0.80 0.15 85);
		transform: scale(1.15);
	}

	.dropdown-fav-star-active {
		color: oklch(0.80 0.15 85);
	}

	.dropdown-fav-star-active:hover {
		color: oklch(0.65 0.10 85);
	}

	.header-server-error {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		font-size: 0.625rem;
		font-weight: 700;
		color: oklch(0.75 0.15 30);
		background: oklch(0.30 0.10 30 / 0.3);
		border-radius: 50%;
		flex-shrink: 0;
	}

	/* Epic group */
	.epic-group {
		margin-bottom: 0.125rem;
	}

	.epic-bar {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.5rem;
		background: color-mix(in oklch, var(--project-color) 8%, transparent);
		border: none;
		border-left: 2px solid color-mix(in oklch, var(--project-color) 50%, transparent);
		margin: 0.125rem 0;
		width: 100%;
		cursor: pointer;
		text-align: left;
	}
	.epic-bar:hover {
		background: color-mix(in oklch, var(--project-color) 14%, transparent);
	}

	.epic-bar-chevron {
		width: 0.75rem;
		height: 0.75rem;
		flex-shrink: 0;
		color: oklch(0.55 0.02 250);
		transition: transform 0.15s ease;
	}
	.epic-bar-chevron-open {
		transform: rotate(90deg);
	}

	.epic-bar-icon {
		font-size: 0.6875rem;
		flex-shrink: 0;
		line-height: 1;
	}

	.epic-bar-label {
		flex: 1;
		font-size: 0.6875rem;
		font-weight: 600;
		color: oklch(0.65 0.02 250);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.epic-bar-count {
		font-size: 0.5625rem;
		font-weight: 700;
		color: oklch(0.55 0.02 250);
		background: oklch(0.22 0.02 250);
		padding: 0.0625rem 0.3rem;
		border-radius: 0.25rem;
		flex-shrink: 0;
	}

	.epic-bar-attack {
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: transparent;
		cursor: pointer;
		color: oklch(0.55 0.10 85);
		padding: 0.125rem;
		border-radius: 0.25rem;
		transition: all 0.1s ease;
		flex-shrink: 0;
	}

	.epic-bar-attack:hover {
		color: oklch(0.85 0.15 85);
		background: oklch(0.30 0.08 85 / 0.2);
	}

	.epic-child-item {
		padding-left: 1.25rem;
		font-size: 0.75rem;
		transition: background 0.15s ease, border-color 0.15s ease;
	}

	.epic-child-item.attack-highlight {
		background: oklch(0.75 0.15 85 / 0.12);
		border-left: 2px solid oklch(0.75 0.15 85 / 0.5);
	}

	/* Task row: info button (fills space) + launch button (right) */
	.task-info-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		min-width: 0;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: inherit;
		color: inherit;
		text-align: left;
		padding: 0;
	}

	.task-launch-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		border: none;
		background: transparent;
		cursor: pointer;
		color: oklch(0.45 0.02 250);
		flex-shrink: 0;
		padding: 0;
		border-radius: 0.25rem;
		transition: all 0.1s ease;
		opacity: 0;
	}

	.task-launch-btn svg {
		width: 0.75rem;
		height: 0.75rem;
	}

	.dropdown-item:hover .task-launch-btn {
		opacity: 1;
	}

	.task-launch-btn:hover {
		color: oklch(0.85 0.15 200);
		background: oklch(0.30 0.08 200 / 0.2);
	}

	/* Active task items */
	.active-dot {
		width: 0.375rem;
		height: 0.375rem;
		border-radius: 50%;
		background: oklch(0.75 0.15 85);
		box-shadow: 0 0 4px oklch(0.75 0.15 85 / 0.5);
		flex-shrink: 0;
	}

	.blocked-dot {
		width: 0.375rem;
		height: 0.375rem;
		border-radius: 50%;
		background: oklch(0.65 0.15 25);
		flex-shrink: 0;
	}

	.closed-dot {
		width: 0.375rem;
		height: 0.375rem;
		border-radius: 50%;
		background: oklch(0.55 0.12 145);
		flex-shrink: 0;
	}

	.child-inactive {
		opacity: 0.55;
	}

	.child-closed {
		opacity: 0.35;
	}
	.child-closed .task-title {
		text-decoration: line-through;
	}

	.task-assignee {
		font-size: 0.5625rem;
		color: oklch(0.50 0.02 250);
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		flex-shrink: 0;
		max-width: 5rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Empty state */
	.dropdown-empty {
		padding: 0.5rem;
		font-size: 0.6875rem;
		color: oklch(0.45 0.02 250);
		text-align: center;
		font-style: italic;
	}

	/* ── History section ── */
	.history-rows {
		padding: 0.2rem 0;
	}

	.history-row {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.175rem 0.5rem;
		min-width: 0;
	}

	.history-loading-row {
		padding: 0.35rem 0.5rem;
	}

	.history-loading-text {
		font-size: 0.625rem;
		color: oklch(0.45 0.02 250);
		font-style: italic;
	}

	/* Small monospace label badge (git / cf / db) */
	.history-label {
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.5625rem;
		font-weight: 700;
		padding: 0.0625rem 0.25rem;
		border-radius: 0.2rem;
		flex-shrink: 0;
		letter-spacing: 0.03em;
	}

	.history-label-git {
		background: oklch(0.30 0.06 300 / 0.35);
		color: oklch(0.72 0.10 300);
	}

	.history-label-cf {
		background: oklch(0.28 0.10 55 / 0.35);
		color: oklch(0.75 0.15 55);
	}

	.history-label-db {
		background: oklch(0.25 0.08 200 / 0.35);
		color: oklch(0.68 0.12 200);
	}

	.history-hash {
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.5625rem;
		color: oklch(0.55 0.02 250);
		flex-shrink: 0;
	}

	.history-msg {
		flex: 1;
		font-size: 0.6rem;
		color: oklch(0.60 0.02 250);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
	}

	.history-time {
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.5625rem;
		color: oklch(0.42 0.02 250);
		flex-shrink: 0;
		white-space: nowrap;
	}

	.history-tag {
		font-size: 0.5rem;
		font-weight: 700;
		padding: 0.0625rem 0.2rem;
		border-radius: 0.2rem;
		flex-shrink: 0;
	}

	.history-tag-warn {
		background: oklch(0.28 0.10 55 / 0.3);
		color: oklch(0.80 0.15 55);
	}

	/* Cloudflare status glyph */
	.history-cf-status {
		font-size: 0.625rem;
		font-weight: 700;
		flex-shrink: 0;
	}

	.history-cf-success { color: oklch(0.72 0.18 145); }
	.history-cf-fail    { color: oklch(0.72 0.18 25);  }
	.history-cf-active  { color: oklch(0.75 0.15 200); }
	.history-cf-idle    { color: oklch(0.45 0.02 250); }
</style>
