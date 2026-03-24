<script lang="ts">
	/**
	 * TopBar Component - Horizontal utilities bar
	 *
	 * Simplified navigation bar containing only utility components:
	 * - Hamburger toggle (mobile only, for sidebar)
	 * - AgentCountBadge
	 * - TokenUsageBadge (tokens today, cost, sparkline)
	 * - CommandPalette
	 * - UserProfile
	 *
	 * Navigation buttons (List, Graph, Agents) removed - moved to Sidebar
	 * Project filtering removed - handled by TaskTable filter bar
	 *
	 * Props:
	 * - tokensToday: number (total tokens consumed today)
	 * - costToday: number (total cost today in USD)
	 * - sparklineData: DataPoint[] (24h sparkline data)
	 */

	import { page } from "$app/stores";
	import { flip } from "svelte/animate";
	import { cubicOut } from "svelte/easing";
	import { getProjectColor } from "$lib/utils/projectColors";
	import { SESSION_STATE_VISUALS } from "$lib/config/statusColors";
	import ActivityBadge from "./ActivityBadge.svelte";
	import ServersBadge from "./ServersBadge.svelte";
	import UserProfile from "./UserProfile.svelte";
	import CommandPalette from "./CommandPalette.svelte";
	import {
		openTaskDrawer,
		toggleSidebar,
		isSidebarCollapsed,
	} from "$lib/stores/drawerStore";
	import {
		startSpawning,
		stopSpawning,
		startBulkSpawn,
		endBulkSpawn,
	} from "$lib/stores/spawningTasks";
	import {
		AGENT_SORT_OPTIONS,
		initAgentSort,
		handleAgentSortClick,
		getAgentSortBy,
		getAgentSortDir,
		type AgentSortOption,
	} from "$lib/stores/agentSort.svelte.js";
	import {
		SERVER_SORT_OPTIONS,
		initServerSort,
		handleServerSortClick,
		getServerSortBy,
		getServerSortDir,
		type ServerSortOption,
	} from "$lib/stores/serverSort.svelte.js";
	import { onMount } from "svelte";
	import { getMaxSessions } from "$lib/stores/preferences.svelte";
	import { spawnInBatches } from "$lib/utils/spawnBatch";
	import ProjectSelector from "./ProjectSelector.svelte";

	// Initialize sort stores on mount
	onMount(() => {
		initAgentSort();
		initServerSort();
	});

	// Check which page we're on for showing appropriate sort dropdown
	const isAgentsPage = $derived($page.url.pathname === "/agents");
	const isServersPage = $derived($page.url.pathname === "/servers");

	// Sort dropdown state (shared between agent and server pages)
	let showSortDropdown = $state(false);
	let sortHovered = $state(false);
	let sortDropdownTimeout: ReturnType<typeof setTimeout> | null = null;

	// Get current sort state reactively (agents page)
	const currentAgentSort = $derived(getAgentSortBy());
	const currentAgentDir = $derived(getAgentSortDir());
	const currentAgentSortLabel = $derived(
		AGENT_SORT_OPTIONS.find((o) => o.value === currentAgentSort)?.label ??
			"Sort",
	);
	const currentAgentSortIcon = $derived(
		AGENT_SORT_OPTIONS.find((o) => o.value === currentAgentSort)?.icon ?? "🔔",
	);

	// Get current sort state reactively (servers page)
	const currentServerSort = $derived(getServerSortBy());
	const currentServerDir = $derived(getServerSortDir());
	const currentServerSortLabel = $derived(
		SERVER_SORT_OPTIONS.find((o) => o.value === currentServerSort)?.label ??
			"Sort",
	);
	const currentServerSortIcon = $derived(
		SERVER_SORT_OPTIONS.find((o) => o.value === currentServerSort)?.icon ??
			"🔔",
	);

	// Handle sort dropdown show/hide with delay
	function showSortMenu() {
		if (sortDropdownTimeout) clearTimeout(sortDropdownTimeout);
		showSortDropdown = true;
	}

	function hideSortMenuDelayed() {
		sortDropdownTimeout = setTimeout(() => {
			showSortDropdown = false;
		}, 150);
	}

	function keepSortMenuOpen() {
		if (sortDropdownTimeout) clearTimeout(sortDropdownTimeout);
	}

	function onAgentSortSelect(value: AgentSortOption) {
		handleAgentSortClick(value);
		showSortDropdown = false;
	}

	function onServerSortSelect(value: ServerSortOption) {
		handleServerSortClick(value);
		showSortDropdown = false;
	}

	// Global action loading states
	let newSessionLoading = $state(false);
	let swarmLoading = $state(false);

	// New Session - spawn a planning session in selected project
	async function handleNewSession(projectName: string) {
		newSessionLoading = true;
		try {
			const response = await fetch("/api/work/spawn", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					attach: true,
					project: projectName,
				}),
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.message || "Failed to spawn session");
			}
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to spawn session");
		} finally {
			newSessionLoading = false;
		}
	}

	// Swarm - spawn one agent per ready task up to MAX_SESSIONS limit
	async function handleSwarm() {
		swarmLoading = true;
		try {
			// Get ready tasks
			const readyResponse = await fetch("/api/tasks/ready");
			const readyData = await readyResponse.json();

			if (!readyResponse.ok || !readyData.tasks?.length) {
				throw new Error("No ready tasks available");
			}

			const taskIds = readyData.tasks.map((t: { id: string }) => t.id);
			const results = await spawnInBatches(taskIds);

			const successCount = results.filter((r) => r.success).length;

			if (successCount === 0) {
				const firstError = results[0]?.error || "Failed to spawn any agents";
				throw new Error(firstError);
			}
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to spawn agents");
		} finally {
			swarmLoading = false;
		}
	}

	interface DataPoint {
		timestamp: string;
		tokens: number;
		cost: number;
	}

	/** Per-project token data from multi-project API */
	interface ProjectTokenData {
		project: string;
		tokens: number;
		cost: number;
		color: string;
	}

	/** Multi-project time-series data point from API */
	interface MultiProjectDataPoint {
		timestamp: string;
		totalTokens: number;
		totalCost: number;
		projects: ProjectTokenData[];
	}

	/** Ready task structure from /api/tasks/ready */
	interface ReadyTask {
		id: string;
		title: string;
		priority: number;
		type: string;
		project: string;
	}

	/** Epic with ready children for Run Epic feature */
	interface EpicWithReady {
		id: string;
		title: string;
		project: string;
		readyCount: number;
		totalCount: number;
	}

	/** Review rule structure */
	interface ReviewRule {
		type: string;
		maxAutoPriority: number;
		note?: string;
	}

	interface StateCounts {
		needsInput: number;
		working: number;
		review: number;
		completed: number;
		starting?: number;
		idle?: number;
	}

	interface Props {
		activeAgentCount?: number;
		totalAgentCount?: number;
		activeAgents?: string[];
		stateCounts?: StateCounts;
		tokensToday?: number;
		costToday?: number;
		sparklineData?: DataPoint[];
		/** Multi-project sparkline data (from ?multiProject=true API) */
		multiProjectData?: MultiProjectDataPoint[];
		/** Project colors map (from API response) */
		projectColors?: Record<string, string>;
		/** Number of ready tasks for Swarm button */
		readyTaskCount?: number;
		/** Ready tasks list for swarm dropdown */
		readyTasks?: ReadyTask[];
		/** Available projects for session spawning */
		projects?: string[];
		/** Currently selected project filter (for auto-detection) */
		selectedProject?: string;
		/** Open epics with ready children */
		epicsWithReady?: EpicWithReady[];
		/** Current review rules */
		reviewRules?: ReviewRule[];
		/** Callback to open global file search (Ctrl+Shift+F) */
		onGlobalSearchOpen?: () => void;
		/** Callback when project selection changes */
		onProjectChange?: (project: string) => void;
		/** Task counts per project (for ProjectSelector) */
		taskCounts?: Map<string, number> | null;
		/** Set of favorite project names */
		favoriteProjects?: Set<string>;
		/** Persisted chip order for favorites */
		favoriteChipOrder?: string[];
		/** Called when chips are reordered via drag-and-drop */
		onReorderFavorites?: (order: string[]) => void;
		/** Called when favorite star is toggled in ProjectSelector */
		onToggleFavorite?: (project: string) => void;
		/** Per-project session states (project name → array of session states, one per agent) */
		projectSessionStates?: Map<string, string[]>;
	}

	let {
		activeAgentCount = 0,
		totalAgentCount = 0,
		activeAgents = [],
		stateCounts,
		tokensToday = 0,
		costToday = 0,
		sparklineData = [],
		multiProjectData,
		projectColors = {},
		readyTaskCount = 0,
		readyTasks = [],
		projects = [],
		selectedProject = "All Projects",
		epicsWithReady = [],
		reviewRules = [],
		onGlobalSearchOpen,
		onProjectChange,
		taskCounts = null,
		favoriteProjects = new Set<string>(),
		favoriteChipOrder = [],
		onReorderFavorites,
		onToggleFavorite,
		projectSessionStates = new Map(),
	}: Props = $props();


	// Get actual project list (filter out "All Projects" for legacy compat)
	const actualProjects = $derived(projects.filter((p) => p !== "All Projects"));

	// Convert projectColors Record to Map for ProjectSelector
	const projectColorsMap = $derived(new Map(Object.entries(projectColors)));

	// Favorite projects list: user-controlled order via drag-and-drop
	const favoriteChips = $derived(() => {
		if (!favoriteProjects || favoriteProjects.size === 0) return [];
		const favSet = new Set(actualProjects.filter(p => favoriteProjects.has(p)));
		// Use persisted order, filtering to only current favorites that exist
		const ordered = favoriteChipOrder.filter(p => favSet.has(p));
		// Append any favorites not yet in the order array (newly added)
		const unordered = [...favSet].filter(p => !ordered.includes(p));
		return [...ordered, ...unordered];
	});

	// Drag state for chip reordering
	let draggedChip = $state<string | null>(null);
	let dragOverChip = $state<string | null>(null);


	// Max sessions from user preferences (reactive)
	const maxSessions = $derived(getMaxSessions());

	// Calculate available slots and effective spawn count for Run All Ready
	const availableSlots = $derived(Math.max(0, maxSessions - activeAgentCount));
	const effectiveSpawnCount = $derived(
		Math.min(readyTaskCount, availableSlots),
	);

	// Handle task creation for selected project
	function handleNewTask(projectName: string) {
		openTaskDrawer(projectName);
	}

	// Run Epic - spawn agents for all ready children of an epic
	let runningEpicId = $state<string | null>(null);

	async function handleRunEpic(epicId: string) {
		if (runningEpicId || swarmLoading) return;

		runningEpicId = epicId;

		try {
			// Fetch epic's children with ready status
			const response = await fetch(`/api/epics/${epicId}/children`);
			if (!response.ok) {
				throw new Error("Failed to fetch epic children");
			}
			const data = await response.json();

			// Filter to ready children only
			const allReadyChildren = data.children.filter(
				(c: { isBlocked: boolean; status: string }) =>
					!c.isBlocked && c.status !== "closed" && c.status !== "in_progress",
			);

			if (allReadyChildren.length === 0) {
				return;
			}

			const taskIds = allReadyChildren.map((t: { id: string }) => t.id);
			const results = await spawnInBatches(taskIds);

			const successCount = results.filter((r) => r.success).length;

			if (successCount === 0 && results.length > 0) {
				// If we had tasks but 0 success, likely all were skipped due to limits
				// or all failed. spawnInBatches returns "Skipped" errors if full.
				const firstError = results[0]?.error || "Failed to spawn agents";
				if (firstError.includes("session slots are in use")) {
					alert(firstError);
				} else {
					throw new Error(firstError);
				}
			}

		} catch (err) {
			alert(err instanceof Error ? err.message : "Failed to run epic");
		} finally {
			runningEpicId = null;
		}
	}

	// Get epics with ready children count (used by ActionPill)
	const epicsWithReadyChildren = $derived(
		epicsWithReady
			.filter((e) => e.readyCount > 0)
			.sort((a, b) => b.readyCount - a.readyCount),
	);

	// Spawn a single task (called by ActionPill)
	let spawningTaskId = $state<string | null>(null);

	async function handleSpawnSingle(taskId: string) {
		if (spawningTaskId || swarmLoading) return;

		spawningTaskId = taskId;
		startSpawning(taskId);

		try {
			const response = await fetch("/api/work/spawn", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ taskId }),
			});

			if (!response.ok) {
				stopSpawning(taskId);
			} else {
				// Keep animation briefly then clear
				setTimeout(() => stopSpawning(taskId), 2000);
			}
		} catch (err) {
			stopSpawning(taskId);
		} finally {
			spawningTaskId = null;
		}
	}

	// Drag handlers for favorite chip reordering
	function handleChipDragStart(e: DragEvent, project: string) {
		draggedChip = project;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', project);
		}
	}

	function handleChipDragOver(e: DragEvent, project: string) {
		e.preventDefault();
		if (draggedChip && draggedChip !== project) {
			dragOverChip = project;
		}
	}

	function handleChipDragLeave() {
		dragOverChip = null;
	}

	function handleChipDrop(e: DragEvent, targetProject: string) {
		e.preventDefault();
		if (!draggedChip || draggedChip === targetProject) {
			dragOverChip = null;
			draggedChip = null;
			return;
		}
		const chips = favoriteChips();
		const fromIndex = chips.indexOf(draggedChip);
		const toIndex = chips.indexOf(targetProject);
		if (fromIndex === -1 || toIndex === -1) {
			dragOverChip = null;
			draggedChip = null;
			return;
		}
		const reordered = [...chips];
		reordered.splice(fromIndex, 1);
		reordered.splice(toIndex, 0, draggedChip);
		dragOverChip = null;
		draggedChip = null;
		onReorderFavorites?.(reordered);
	}

	function handleChipDragEnd() {
		draggedChip = null;
		dragOverChip = null;
	}

	// Group ready tasks by project for ActionPill
	const tasksByProject = $derived.by(() => {
		const groups = new Map<string, ReadyTask[]>();
		for (const task of readyTasks) {
			const project = task.project || "unknown";
			if (!groups.has(project)) {
				groups.set(project, []);
			}
			groups.get(project)!.push(task);
		}
		// Sort by priority within each group
		for (const tasks of groups.values()) {
			tasks.sort((a, b) => a.priority - b.priority);
		}
		return groups;
	});
</script>

<!-- Industrial/Terminal TopBar -->
<nav
	class="w-full h-12 flex items-center relative"
	style="
		background: linear-gradient(180deg, var(--color-base-200) 0%, var(--color-base-300) 100%);
		border-bottom: 1px solid var(--color-base-content);
		border-bottom-opacity: 0.2;
	"
>
	<!-- Mobile hamburger menu (visible on small screens) -->
	<label
		for="main-drawer"
		aria-label="open menu"
		class="lg:hidden flex items-center justify-center w-7 h-7 ml-3 rounded cursor-pointer transition-all hover:scale-105 bg-base-200 border border-base-content/20 text-primary"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="2"
			stroke="currentColor"
			class="w-4 h-4"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
		</svg>
	</label>

	<!-- Sidebar toggle (industrial - visible on large screens) -->
	<button
		onclick={toggleSidebar}
		aria-label={$isSidebarCollapsed ? "expand sidebar" : "collapse sidebar"}
		class="hidden lg:flex items-center justify-center w-7 h-7 ml-3 rounded cursor-pointer transition-all hover:scale-105 bg-base-200 border border-base-content/20 text-primary"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			stroke-linejoin="round"
			stroke-linecap="round"
			stroke-width="2"
			fill="none"
			stroke="currentColor"
			class="w-4 h-4 transition-transform {$isSidebarCollapsed ? 'rotate-180' : ''}"
		>
			<path
				d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"
			></path>
			<path d="M9 4v16"></path>
			<path d="M14 10l2 2l-2 2"></path>
		</svg>
	</button>

	<!-- Project Selector + Favorite Chips (global, always visible) -->
	{#if actualProjects.length > 0 && onProjectChange}
		<div class="fav-chips-scroll ml-3 flex items-center gap-1.5">
			{#each favoriteChips() as favProject (favProject)}
				{@const favColor = projectColorsMap.get(favProject) || getProjectColor(favProject)}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="fav-flip-wrapper"
					class:fav-dragging={draggedChip === favProject}
					class:fav-drag-over={dragOverChip === favProject}
					animate:flip={{ duration: 300, easing: cubicOut }}
					draggable="true"
					ondragstart={(e) => handleChipDragStart(e, favProject)}
					ondragover={(e) => handleChipDragOver(e, favProject)}
					ondragleave={handleChipDragLeave}
					ondrop={(e) => handleChipDrop(e, favProject)}
					ondragend={handleChipDragEnd}
				>
					{#if favProject === selectedProject}
						<ProjectSelector
							projects={actualProjects}
							{selectedProject}
							onProjectChange={onProjectChange}
							{taskCounts}
							compact={true}
							showColors={true}
							projectColors={projectColorsMap}
							{favoriteProjects}
							{onToggleFavorite}
							{readyTasks}
							epics={epicsWithReadyChildren.map(e => ({ id: e.id, title: e.title, project: e.project, childCount: e.readyCount }))}
							idleSlots={availableSlots}
							onNewTask={handleNewTask}
							onStart={handleSpawnSingle}
							onSwarm={(count, epicId) => epicId ? handleRunEpic(epicId) : handleSwarm()}
							sessionStates={projectSessionStates.get(favProject) || []}
						/>
					{:else}
						{@const sessionStates = projectSessionStates.get(favProject) || []}
						{@const chipTitle = sessionStates.length > 0
							? `${favProject} — ${sessionStates.map(s => SESSION_STATE_VISUALS[s]?.shortLabel || s).join(', ')}`
							: favProject}
						<div class="fav-chip" class:has-agents={sessionStates.length > 0} style="--fav-color: {favColor};">
							<button
								type="button"
								class="fav-chip-btn"
								onclick={() => onProjectChange?.(favProject)}
								title={chipTitle}
							>
								{#if sessionStates.length > 0}
									<span class="fav-dots">
										{#each sessionStates as state}
											{@const visual = SESSION_STATE_VISUALS[state]}
											{@const color = visual?.accent || favColor}
											{@const isNI = state === 'needs-input'}
											{@const isRev = state === 'ready-for-review'}
											{#if isNI || isRev}
												<span class="fav-dot-animated">
													<span class="fav-dot-ping" class:animate-ping={isNI} class:animate-pulse={isRev} style="background: {color};"></span>
													<span class="fav-dot-core" style="background: {color};"></span>
												</span>
											{:else}
												<span class="fav-dot" style="background: {color};"></span>
											{/if}
										{/each}
									</span>
								{/if}
								<span class="fav-label">{favProject}</span>
							</button>
							<button
								type="button"
								class="fav-new-btn"
								onclick={() => handleNewTask(favProject)}
								title="New task in {favProject}"
							>
								<svg viewBox="0 0 20 20" fill="currentColor">
									<path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
								</svg>
							</button>
						</div>
					{/if}
				</div>
			{/each}
			<!-- Fallback: if selected project is NOT a favorite, show selector outside the each -->
			{#if !favoriteProjects.has(selectedProject)}
				<ProjectSelector
					projects={actualProjects}
					{selectedProject}
					onProjectChange={onProjectChange}
					{taskCounts}
					compact={true}
					showColors={true}
					projectColors={projectColorsMap}
					{favoriteProjects}
					{onToggleFavorite}
					{readyTasks}
					epics={epicsWithReadyChildren.map(e => ({ id: e.id, title: e.title, project: e.project, childCount: e.readyCount }))}
					idleSlots={availableSlots}
					onNewTask={handleNewTask}
					onStart={handleSpawnSingle}
					onSwarm={(count, epicId) => epicId ? handleRunEpic(epicId) : handleSwarm()}
					sessionStates={projectSessionStates.get(selectedProject) || []}
				/>
			{/if}
		</div>
	{/if}

	<!-- Spacer (only fills space when no favorite chips) -->
	{#if !actualProjects.length || !onProjectChange || favoriteProjects.size === 0}
		<div class="flex-1"></div>
	{/if}

	<!-- Agent Sort Dropdown (on /agents page) -->
	{#if isAgentsPage}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="relative flex-none"
			onmouseenter={showSortMenu}
			onmouseleave={hideSortMenuDelayed}
		>
			<button
				class="flex items-center gap-1 py-1 mr-3 rounded font-mono text-[10px] tracking-wider uppercase transition-all duration-200 ease-out overflow-hidden btn btn-sm btn-ghost"
				class:btn-active={sortHovered || showSortDropdown}
				style="
					padding-left: 8px;
					padding-right: 8px;
				"
				title="Sort agents"
				onmouseenter={() => (sortHovered = true)}
				onmouseleave={() => (sortHovered = false)}
			>
				<span class="text-xs">{currentAgentSortIcon}</span>
				<span class="hidden sm:inline">{currentAgentSortLabel}</span>
				<span class="text-[9px] opacity-70"
					>{currentAgentDir === "asc" ? "▲" : "▼"}</span
				>
				<svg
					class="w-2.5 h-2.5 ml-0.5 transition-transform {showSortDropdown
						? 'rotate-180'
						: ''}"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M19.5 8.25l-7.5 7.5-7.5-7.5"
					/>
				</svg>
			</button>

			<!-- Agent Sort Dropdown Menu -->
			{#if showSortDropdown}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="absolute top-full left-0 mt-1 min-w-[160px] rounded-lg shadow-xl z-50 overflow-hidden dropdown-content bg-base-200 border border-base-content/20"
					onmouseenter={keepSortMenuOpen}
					onmouseleave={hideSortMenuDelayed}
				>
					<div
						class="px-3 py-2 border-b border-base-content/10"
					>
						<span
							class="text-[9px] font-mono uppercase tracking-wider text-base-content/60"
						>
							Sort Agents
						</span>
					</div>
					<div class="py-1">
						{#each AGENT_SORT_OPTIONS as opt (opt.value)}
							<button
								class="w-full px-3 py-2 text-left text-xs font-mono flex items-center gap-2 transition-colors hover:bg-base-300"
								class:text-primary={currentAgentSort === opt.value}
								class:bg-base-300={currentAgentSort === opt.value}
								onclick={() => onAgentSortSelect(opt.value)}
							>
								<span class="text-sm">{opt.icon}</span>
								<span class="flex-1">{opt.label}</span>
								{#if currentAgentSort === opt.value}
									<span class="text-[10px] opacity-70"
										>{currentAgentDir === "asc" ? "▲" : "▼"}</span
									>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Server Sort Dropdown (on /servers page) -->
	{#if isServersPage}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="relative flex-none"
			onmouseenter={showSortMenu}
			onmouseleave={hideSortMenuDelayed}
		>
			<button
				class="flex items-center gap-1 py-1 mr-3 rounded font-mono text-[10px] tracking-wider uppercase transition-all duration-200 ease-out overflow-hidden btn btn-sm btn-ghost"
				class:btn-active={sortHovered || showSortDropdown}
				style="
					padding-left: 8px;
					padding-right: 8px;
				"
				title="Sort servers"
				onmouseenter={() => (sortHovered = true)}
				onmouseleave={() => (sortHovered = false)}
			>
				<span class="text-xs">{currentServerSortIcon}</span>
				<span class="hidden sm:inline">{currentServerSortLabel}</span>
				<span class="text-[9px] opacity-70"
					>{currentServerDir === "asc" ? "▲" : "▼"}</span
				>
				<svg
					class="w-2.5 h-2.5 ml-0.5 transition-transform {showSortDropdown
						? 'rotate-180'
						: ''}"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M19.5 8.25l-7.5 7.5-7.5-7.5"
					/>
				</svg>
			</button>

			<!-- Server Sort Dropdown Menu -->
			{#if showSortDropdown}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="absolute top-full left-0 mt-1 min-w-[160px] rounded-lg shadow-xl z-50 overflow-hidden dropdown-content bg-base-200 border border-base-content/20"
					onmouseenter={keepSortMenuOpen}
					onmouseleave={hideSortMenuDelayed}
				>
					<div
						class="px-3 py-2 border-b border-base-content/10"
					>
						<span
							class="text-[9px] font-mono uppercase tracking-wider text-base-content/60"
						>
							Sort Servers
						</span>
					</div>
					<div class="py-1">
						{#each SERVER_SORT_OPTIONS as opt (opt.value)}
							<button
								class="w-full px-3 py-2 text-left text-xs font-mono flex items-center gap-2 transition-colors hover:bg-base-300"
								class:text-primary={currentServerSort === opt.value}
								class:bg-base-300={currentServerSort === opt.value}
								onclick={() => onServerSortSelect(opt.value)}
							>
								<span class="text-sm">{opt.icon}</span>
								<span class="flex-1">{opt.label}</span>
								{#if currentServerSort === opt.value}
									<span class="text-[10px] opacity-70"
										>{currentServerDir === "asc" ? "▲" : "▼"}</span
									>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Middle: Command Palette + Global Search -->
	<div class="flex-none flex items-center gap-2">
		<CommandPalette />

		<!-- Global File Search Button -->
		{#if onGlobalSearchOpen}
			<button
				class="group h-7 px-2 rounded text-xs font-mono flex items-center transition-all duration-200"
				style="
					background: oklch(0.18 0.01 250);
					border: 1px solid oklch(0.35 0.02 250);
					color: oklch(0.60 0.02 250);
				"
				onclick={onGlobalSearchOpen}
				aria-label="Unified search (Ctrl+K)"
			>
				<!-- Search/Magnifying glass icon -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-3 h-3 flex-shrink-0"
					style="color: oklch(0.55 0.02 250);"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
					/>
				</svg>
				<span class="inline-block max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-hover:max-w-28 group-hover:opacity-100 transition-all duration-200 pl-1.5 pt-0.5">Ctrl+K</span>
			</button>
		{/if}
	</div>

	<!-- Vertical separator -->
	<div
		class="w-px h-6 mx-3 bg-gradient-to-b from-transparent via-base-content/45 to-transparent"
	></div>

	<!-- Right side: Activity Badge + Servers + User Profile -->
	<div class="flex-none flex items-center gap-2.5 pr-3">
		<!-- Combined Activity Badge (Agents + Tasks + Tokens in dropdown) -->
		<ActivityBadge
			{activeAgentCount}
			{stateCounts}
			{tokensToday}
			{costToday}
			{sparklineData}
			{multiProjectData}
			{projectColors}
		/>

		<!-- Dev Servers + WebSocket Status -->
		<ServersBadge />

		<!-- User Profile -->
		<UserProfile />
	</div>
</nav>

<style>
	/* Chips container — shrinks on narrow viewports, scrolls horizontally.
	   ProjectSelector dropdown uses position:fixed so it's not clipped. */
	.fav-chips-scroll {
		min-width: 0;
		flex: 1 1 0%;
		overflow-x: auto;
		scrollbar-width: none; /* Firefox */
	}
	.fav-chips-scroll::-webkit-scrollbar {
		display: none; /* Chrome/Safari */
	}

	/* Favorite project chips — ghost style, expand on hover */
	.fav-chip {
		display: inline-flex;
		align-items: stretch;
		border-radius: 0.375rem;
		background: transparent;
		border: 1px solid color-mix(in oklch, var(--fav-color) 20%, transparent);
		transition: all 0.15s ease;
		overflow: hidden;
		opacity: 0.5;
	}

	.fav-chip.has-agents {
		opacity: 0.85;
		border-color: color-mix(in oklch, var(--fav-color) 35%, transparent);
	}

	.fav-chip:hover,
	.fav-chip.has-agents:hover {
		opacity: 1;
		background: color-mix(in oklch, var(--fav-color) 18%, transparent);
		border-color: color-mix(in oklch, var(--fav-color) 45%, transparent);
		box-shadow: 0 0 6px color-mix(in oklch, var(--fav-color) 15%, transparent);
	}

	.fav-chip-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.2rem 0.4rem;
		background: transparent;
		border: none;
		cursor: pointer;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		color: color-mix(in oklch, var(--fav-color) 70%, oklch(0.70 0 0));
		transition: color 0.15s ease;
	}

	.fav-chip:hover .fav-chip-btn {
		color: var(--fav-color);
	}


	.fav-dots {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		flex-shrink: 0;
	}

	.fav-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		flex-shrink: 0;
	}

	/* Animated dot wrapper (needs-input ping, review pulse) */
	.fav-dot-animated {
		position: relative;
		display: inline-flex;
		width: 0.5rem;
		height: 0.5rem;
		flex-shrink: 0;
		overflow: hidden;
	}

	.fav-dot-ping {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		opacity: 0.75;
	}

	.fav-dot-core {
		position: relative;
		display: inline-flex;
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.fav-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 6rem;
	}

	/* Hover-expand + button */
	.fav-new-btn {
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

	.fav-chip:hover .fav-new-btn {
		max-width: 1.5rem;
		padding: 0 0.25rem;
		border-left: 1px solid color-mix(in oklch, var(--fav-color) 30%, transparent);
		opacity: 1;
	}

	.fav-new-btn:hover {
		background: oklch(0.30 0.08 145 / 0.3);
	}

	.fav-new-btn svg {
		width: 0.8rem;
		height: 0.8rem;
		flex-shrink: 0;
	}

	/* Drag feedback */
	.fav-dragging {
		opacity: 0.4;
	}

	.fav-drag-over {
		border-left: 2px solid oklch(0.70 0.18 240);
		box-shadow: -2px 0 8px oklch(0.70 0.18 240 / 0.4);
	}

	.fav-flip-wrapper {
		cursor: grab;
		flex-shrink: 0;
	}

	.fav-flip-wrapper:active {
		cursor: grabbing;
	}
</style>
