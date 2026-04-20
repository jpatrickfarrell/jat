<script lang="ts">
	import { page } from "$app/stores";
	import { flip } from "svelte/animate";
	import { cubicOut } from "svelte/easing";
	import { getProjectColor } from "$lib/utils/projectColors";
	import ActivityBadge from "./ActivityBadge.svelte";
	import ServersBadge from "./ServersBadge.svelte";
	import UserProfile from "./UserProfile.svelte";
	import MobileProjectSelector from "./MobileProjectSelector.svelte";
	import {
		openTaskDrawer,
		toggleSidebar,
		cycleSidebarState,
		isSidebarCollapsed,
		sidebarState,
		openProjectDrawer,
	} from "$lib/stores/drawerStore";
	import {
		startSpawning,
		stopSpawning,
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
	import { onMount, onDestroy } from "svelte";
	import { getMaxSessions } from "$lib/stores/preferences.svelte";
	import { spawnInBatches } from "$lib/utils/spawnBatch";
	import ProjectSelector from "./ProjectSelector.svelte";
	// Initialize sort stores on mount
	onMount(() => {
		initAgentSort();
		initServerSort();
	});

	// Project switcher dropdown state (the + button at end of favorites)
	let showProjectSwitcher = $state(false);
	let projectSwitcherEl = $state<HTMLDivElement | null>(null);
	let projectSwitcherPos = $state({ top: 0, left: 0 });

	function toggleProjectSwitcher() {
		if (!showProjectSwitcher && projectSwitcherEl) {
			const rect = projectSwitcherEl.getBoundingClientRect();
			const dropdownWidth = 224; // min-width: 14rem ≈ 224px
			let left = rect.left;
			// Clamp to viewport so dropdown doesn't overflow right edge
			if (left + dropdownWidth > window.innerWidth - 8) {
				left = window.innerWidth - dropdownWidth - 8;
			}
			projectSwitcherPos = { top: rect.bottom + 4, left };
		}
		showProjectSwitcher = !showProjectSwitcher;
	}

	function handleProjectSwitcherClickOutside(e: MouseEvent) {
		if (projectSwitcherEl && !projectSwitcherEl.contains(e.target as Node)) {
			showProjectSwitcher = false;
		}
	}

	function handleProjectSwitcherKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			showProjectSwitcher = false;
			projectSwitcherEl?.querySelector<HTMLButtonElement>('.project-switcher-btn')?.focus();
		}
	}

	function handleDropdownKeydown(e: KeyboardEvent) {
		if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
		e.preventDefault();
		const items = Array.from(projectSwitcherEl?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
		if (!items.length) return;
		const idx = items.indexOf(document.activeElement as HTMLElement);
		let next: HTMLElement | undefined;
		if (e.key === 'ArrowDown') next = items[idx + 1] ?? items[0];
		else if (e.key === 'ArrowUp') next = items[idx - 1] ?? items[items.length - 1];
		else if (e.key === 'Home') next = items[0];
		else if (e.key === 'End') next = items[items.length - 1];
		next?.focus();
	}

	$effect(() => {
		if (showProjectSwitcher) {
			document.addEventListener('click', handleProjectSwitcherClickOutside, true);
			document.addEventListener('keydown', handleProjectSwitcherKeydown);
			// Auto-focus first menuitem when dropdown opens (ARIA menu pattern)
			const first = projectSwitcherEl?.querySelector<HTMLElement>('[role="menuitem"]');
			first?.focus();
		}
		return () => {
			document.removeEventListener('click', handleProjectSwitcherClickOutside, true);
			document.removeEventListener('keydown', handleProjectSwitcherKeydown);
		};
	});

	// Helper to get color for a project
	function getSwitcherColor(project: string): string {
		if (projectColors[project]) return projectColors[project];
		return getProjectColor(project);
	}

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
		AGENT_SORT_OPTIONS.find((o) => o.value === currentAgentSort)?.icon ?? "↕",
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
			"↕",
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

	function handleSortKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') showSortDropdown = false;
	}

	function handleSortDropdownKeydown(e: KeyboardEvent) {
		if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Home' && e.key !== 'End') return;
		e.preventDefault();
		const container = e.currentTarget as HTMLElement;
		const items = Array.from(container.querySelectorAll<HTMLElement>('[role="menuitem"]'));
		if (!items.length) return;
		const idx = items.indexOf(document.activeElement as HTMLElement);
		let next: HTMLElement | undefined;
		if (e.key === 'ArrowDown') next = items[idx + 1] ?? items[0];
		else if (e.key === 'ArrowUp') next = items[idx - 1] ?? items[items.length - 1];
		else if (e.key === 'Home') next = items[0];
		else if (e.key === 'End') next = items[items.length - 1];
		next?.focus();
	}

	$effect(() => {
		if (showSortDropdown) {
			document.addEventListener('keydown', handleSortKeydown);
		}
		return () => {
			document.removeEventListener('keydown', handleSortKeydown);
		};
	});

	// Global action loading states
	let swarmLoading = $state(false);

	// Error toast
	let toastError = $state<string | null>(null);
	let toastRetry = $state<(() => void) | null>(null);
	let toastTimeout: ReturnType<typeof setTimeout> | null = null;

	function showError(msg: string, retryFn?: () => void) {
		if (toastTimeout) clearTimeout(toastTimeout);
		toastError = msg;
		toastRetry = retryFn ?? null;
		toastTimeout = setTimeout(() => { toastError = null; toastRetry = null; }, 5000);
	}

	// Success toast
	let toastSuccess = $state<string | null>(null);
	let toastSuccessTimeout: ReturnType<typeof setTimeout> | null = null;

	function showSuccess(msg: string) {
		if (toastSuccessTimeout) clearTimeout(toastSuccessTimeout);
		toastSuccess = msg;
		toastSuccessTimeout = setTimeout(() => { toastSuccess = null; }, 3000);
	}

	onDestroy(() => {
		if (toastTimeout) clearTimeout(toastTimeout);
		if (toastSuccessTimeout) clearTimeout(toastSuccessTimeout);
	});

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
			showSuccess(`Spawned ${successCount} agent${successCount !== 1 ? 's' : ''}`);
		} catch (error) {
			showError(error instanceof Error ? error.message : "Failed to spawn agents", handleSwarm);
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
	interface EpicChild {
		id: string;
		title: string;
		status: string;
		priority: number;
		isBlocked: boolean;
		assignee?: string;
	}
	interface EpicWithReady {
		id: string;
		title: string;
		project: string;
		readyCount: number;
		totalCount: number;
		readyChildIds: string[];
		children: EpicChild[];
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
		stateCounts?: StateCounts;
		tokensToday?: number;
		costToday?: number;
		sparklineData?: DataPoint[];
		/** Multi-project sparkline data (from ?multiProject=true API) */
		multiProjectData?: MultiProjectDataPoint[];
		/** Project colors map (from API response) */
		projectColors?: Record<string, string>;
		/** Per-project backend kind ('sqlite' | 'postgres') */
		projectBackends?: Record<string, 'sqlite' | 'postgres'>;
		/** Ready tasks list for swarm dropdown */
		readyTasks?: ReadyTask[];
		/** Active (in_progress) tasks for ProjectSelector dropdown */
		activeTasks?: Array<{ id: string; title: string; priority: number; type: string; project: string; assignee: string | null }>;
		/** Available projects for session spawning */
		projects?: string[];
		/** Currently selected project filter (for auto-detection) */
		selectedProject?: string;
		/** Open epics with ready children */
		epicsWithReady?: EpicWithReady[];
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
		stateCounts,
		tokensToday = 0,
		costToday = 0,
		sparklineData = [],
		multiProjectData,
		projectColors = {},
		projectBackends = {},
		readyTasks = [],
		activeTasks = [],
		projects = [],
		selectedProject = "All Projects",
		epicsWithReady = [],
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

	// Current project accent color for bottom border
	const activeProjectColor = $derived(
		selectedProject && selectedProject !== 'All Projects'
			? (projectColors[selectedProject] || getProjectColor(selectedProject))
			: null
	);

	// Favorite projects list: user-controlled order via drag-and-drop
	const favoriteChips = $derived.by(() => {
		if (!favoriteProjects || favoriteProjects.size === 0) return [];
		const favSet = new Set(actualProjects.filter(p => favoriteProjects.has(p)));
		const ordered = favoriteChipOrder.filter(p => favSet.has(p));
		const unordered = [...favSet].filter(p => !ordered.includes(p));
		return [...ordered, ...unordered];
	});

	// Drag state for chip reordering
	let draggedChip = $state<string | null>(null);
	let dragOverChip = $state<string | null>(null);
	// Roving tabindex: tracks which chip holds tabindex=0
	let focusedChipProject = $state<string | null>(null);

	// Chip overflow fade — scroll listener toggles right-edge fade indicator
	let favChipsScrollEl = $state<HTMLDivElement | null>(null);
	let favChipsAtEnd = $state(true);

	function updateChipsScrollState() {
		if (!favChipsScrollEl) return;
		const { scrollLeft, scrollWidth, clientWidth } = favChipsScrollEl;
		favChipsAtEnd = scrollWidth <= clientWidth || scrollLeft + clientWidth >= scrollWidth - 2;
	}

	$effect(() => {
		if (!favChipsScrollEl) return;
		updateChipsScrollState();
		favChipsScrollEl.addEventListener('scroll', updateChipsScrollState, { passive: true });
		window.addEventListener('resize', updateChipsScrollState, { passive: true });
		return () => {
			favChipsScrollEl?.removeEventListener('scroll', updateChipsScrollState);
			window.removeEventListener('resize', updateChipsScrollState);
		};
	});

	// Max sessions from user preferences (reactive)
	const maxSessions = $derived(getMaxSessions());

	// Calculate available slots for Run All Ready
	const availableSlots = $derived(Math.max(0, maxSessions - activeAgentCount));
	// Handle task creation for selected project
	function handleNewTask(projectName: string) {
		openTaskDrawer(projectName);
	}

	// Run Epic - spawn agents for all ready children of an epic
	async function handleRunEpic(epicId: string) {
		if (swarmLoading) return;

		swarmLoading = true;

		try {
			const response = await fetch(`/api/epics/${epicId}/children`);
			if (!response.ok) {
				throw new Error("Failed to fetch epic children");
			}
			const data = await response.json();

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
				const firstError = results[0]?.error || "Failed to spawn agents";
				if (firstError.includes("session slots are in use")) {
					showError(firstError);
				} else {
					throw new Error(firstError);
				}
			} else if (successCount > 0) {
				showSuccess(`Spawned ${successCount} agent${successCount !== 1 ? 's' : ''}`);
			}
		} catch (err) {
			showError(err instanceof Error ? err.message : "Failed to run epic", () => handleRunEpic(epicId));
		} finally {
			swarmLoading = false;
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
		const chips = favoriteChips;
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

	function handleChipKeydown(e: KeyboardEvent, project: string) {
		if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
		e.preventDefault();
		const chips = favoriteChips;
		const idx = chips.indexOf(project);
		if (idx === -1) return;
		const targetIdx = e.key === 'ArrowLeft' ? idx - 1 : idx + 1;
		if (targetIdx < 0 || targetIdx >= chips.length) return;
		if (e.altKey) {
			// Alt+Arrow: reorder — re-focus after FLIP animation (300ms)
			const reordered = [...chips];
			reordered.splice(idx, 1);
			reordered.splice(targetIdx, 0, project);
			onReorderFavorites?.(reordered);
			setTimeout(() => {
				const el = document.querySelector<HTMLElement>(`[data-chip-project="${CSS.escape(project)}"]`);
				el?.focus();
			}, 310);
		} else {
			// Plain Arrow: move focus
			const targetProject = chips[targetIdx];
			focusedChipProject = targetProject;
			const el = document.querySelector<HTMLElement>(`[data-chip-project="${CSS.escape(targetProject)}"]`);
			el?.focus();
		}
	}

</script>

<!-- Industrial/Terminal TopBar -->
<nav
	class="w-full h-12 flex items-center relative flex-shrink-0 z-30"
	style="
		background: linear-gradient(180deg, var(--color-base-200) 0%, var(--color-base-300) 100%);
		border-bottom: {activeProjectColor ? `3px solid ${activeProjectColor}` : '1px solid oklch(0.25 0.02 250)'};
	"
>
	<!-- Sidebar toggle — single button, all screen sizes, cycles hidden→icon→full -->
	<button
		onclick={cycleSidebarState}
		aria-label={$sidebarState === 'hidden' ? 'show sidebar' : $isSidebarCollapsed ? 'expand sidebar' : 'collapse sidebar'}
		class="flex items-center justify-center w-7 h-7 ml-3 rounded cursor-pointer transition-all hover:scale-105 bg-base-200 border border-base-content/20 text-primary"
		title="Cycle sidebar (Ctrl+B)"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			stroke-linejoin="round"
			stroke-linecap="round"
			stroke-width="2"
			fill="none"
			stroke="currentColor"
			class="w-4 h-4 transition-transform {$sidebarState === 'hidden' ? 'rotate-180' : ''}"
		>
			<path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
			<path d="M9 4v16"></path>
			<path d="M14 10l2 2l-2 2"></path>
		</svg>
	</button>

	<!-- Project Selector + Favorite Chips (global, always visible) -->
	{#if actualProjects.length > 0 && onProjectChange}
		<div class="fav-chips-wrapper hidden lg:block" class:fav-chips-end={favChipsAtEnd}>
		<div class="fav-chips-scroll ml-3 flex items-center gap-1.5" bind:this={favChipsScrollEl} role="list" aria-label="Favorite projects">
			{#each favoriteChips as favProject, chipIdx (favProject)}
				<div
					class="fav-flip-wrapper"
					class:fav-dragging={draggedChip === favProject}
					class:fav-drag-over={dragOverChip === favProject}
					animate:flip={{ duration: 300, easing: cubicOut }}
					draggable="true"
					data-chip-project={favProject}
					tabindex={focusedChipProject === favProject || (!focusedChipProject && chipIdx === 0) ? 0 : -1}
					role="listitem"
					aria-label="{favProject} — ←→ navigate · Alt+←→ reorder"
					title="Drag or Alt+←→ to reorder · ←→ to navigate"
					ondragstart={(e) => handleChipDragStart(e, favProject)}
					ondragover={(e) => handleChipDragOver(e, favProject)}
					ondragleave={handleChipDragLeave}
					ondrop={(e) => handleChipDrop(e, favProject)}
					ondragend={handleChipDragEnd}
					onfocus={() => (focusedChipProject = favProject)}
					onkeydown={(e) => handleChipKeydown(e, favProject)}
				>
					<span class="fav-drag-handle" aria-hidden="true">⠿</span>
					<ProjectSelector
						selectedProject={favProject}
						compact={true}
						showColors={true}
						projectColors={projectColorsMap}
						{readyTasks}
						{activeTasks}
						epics={epicsWithReadyChildren.map(e => ({ id: e.id, title: e.title, project: e.project, childCount: e.readyCount, readyChildIds: e.readyChildIds, children: e.children }))}
						idleSlots={availableSlots}
						onNewTask={handleNewTask}
						onStart={handleSpawnSingle}
						onSwarm={(count, epicId) => epicId ? handleRunEpic(epicId) : handleSwarm()}
						sessionStates={projectSessionStates.get(favProject) || []}
						isActive={favProject === selectedProject}
						onSelect={() => onProjectChange?.(favProject)}
						openOnHover={true}
						isFavorite={favoriteProjects.has(favProject)}
						{onToggleFavorite}
						backend={projectBackends[favProject] ?? 'sqlite'}
						onPrevProject={() => { const chips = favoriteChips; const idx = chips.indexOf(favProject); if (idx > 0) onProjectChange?.(chips[idx - 1]); }}
						onNextProject={() => { const chips = favoriteChips; const idx = chips.indexOf(favProject); if (idx < chips.length - 1) onProjectChange?.(chips[idx + 1]); }}
					/>
				</div>
			{/each}
			<!-- Fallback: if selected project is NOT a favorite, show selector outside the each -->
			{#if !favoriteProjects.has(selectedProject)}
				<div role="listitem">
				<ProjectSelector
					{selectedProject}
					compact={true}
					showColors={true}
					projectColors={projectColorsMap}
					{readyTasks}
					{activeTasks}
					epics={epicsWithReadyChildren.map(e => ({ id: e.id, title: e.title, project: e.project, childCount: e.readyCount, readyChildIds: e.readyChildIds, children: e.children }))}
					idleSlots={availableSlots}
					onNewTask={handleNewTask}
					onStart={handleSpawnSingle}
					onSwarm={(count, epicId) => epicId ? handleRunEpic(epicId) : handleSwarm()}
					sessionStates={projectSessionStates.get(selectedProject) || []}
					isActive={true}
					onSelect={() => onProjectChange?.(selectedProject)}
					openOnHover={true}
					isFavorite={favoriteProjects.has(selectedProject)}
					{onToggleFavorite}
					backend={projectBackends[selectedProject] ?? 'sqlite'}
				/>
				</div>
			{/if}

			<!-- Project switcher: switch projects or add new -->
			<div class="project-switcher-container" bind:this={projectSwitcherEl}>
				<button
					type="button"
					class="project-switcher-btn"
					onclick={toggleProjectSwitcher}
					aria-label="Switch project (Alt+Shift+P)"
					aria-haspopup="true"
					aria-expanded={showProjectSwitcher}
					title="Switch project or add new (Alt+Shift+P)"
				>
					<svg viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
						<path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
					</svg>
				</button>

				{#if showProjectSwitcher}
					<div class="project-switcher-dropdown" role="menu" aria-label="Switch project" onkeydown={handleDropdownKeydown} style="top: {projectSwitcherPos.top}px; left: {projectSwitcherPos.left}px;">
						<div class="psd-header">Switch Project</div>
						<div class="psd-scroll">
							{#each actualProjects as project}
								{@const projColor = getSwitcherColor(project)}
								{@const isFavorite = favoriteProjects?.has(project)}
								{@const count = taskCounts?.get(project)}
								<div class="psd-row" role="none" style="--psd-color: {projColor};">
									<button
										type="button"
										class="psd-item"
										class:psd-active={selectedProject === project}
										role="menuitem"
										onclick={() => { onProjectChange?.(project); showProjectSwitcher = false; }}
									>
										<span class="psd-dot"></span>
										<span class="psd-label">{project}{count ? ` (${count})` : ''}</span>
										{#if selectedProject === project}
											<svg class="psd-check" viewBox="0 0 16 16" fill="currentColor">
												<path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd" />
											</svg>
										{/if}
									</button>
									{#if onToggleFavorite}
										<button
											type="button"
											class="psd-star"
											class:psd-star-active={isFavorite}
											role="menuitem"
											aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
											onclick={() => { onToggleFavorite?.(project); }}
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
							{/each}
						</div>
						<div class="psd-divider"></div>
						<button
							type="button"
							class="psd-item psd-add-item"
							role="menuitem"
							onclick={() => { showProjectSwitcher = false; openProjectDrawer(); }}
						>
							<svg viewBox="0 0 20 20" fill="currentColor" class="psd-add-icon">
								<path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
							</svg>
							<span class="psd-label">Add Project</span>
						</button>
					</div>
				{/if}
			</div>
		</div>
		</div>
	{/if}

	<!-- Mobile project selector (inline in TopBar, replaces the separate row below) -->
	{#if actualProjects.length > 0 && onProjectChange}
		{@const mobileProject = selectedProject !== 'All Projects' ? (selectedProject || '') : (actualProjects[0] || '')}
		<div class="flex-1 lg:hidden">
			<MobileProjectSelector
				projects={actualProjects}
				selected={mobileProject}
				onSelect={(p) => onProjectChange?.(p)}
				colorFn={getSwitcherColor}
				onOpenSearch={onGlobalSearchOpen}
				sessionStates={projectSessionStates.get(mobileProject) || []}
			/>
		</div>
	{/if}

	<!-- Spacer / Empty project CTA -->
	{#if !actualProjects.length || !onProjectChange || favoriteProjects.size === 0}
		{#if !actualProjects.length && onProjectChange}
			<!-- No projects yet: guide user toward first action -->
			<button
				type="button"
				class="no-projects-cta"
				onclick={openProjectDrawer}
				title="Add your first project"
			>
				<svg viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
					<path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
				</svg>
				<span>Add Project</span>
			</button>
		{/if}
		<!-- Desktop-only spacer: on narrow, MobileProjectSelector (flex-1) fills the space. -->
		<div class="flex-1 hidden lg:block"></div>
	{/if}

	<!-- Shared sort dropdown snippet — used by both /agents and /servers pages -->
	{#snippet sortDropdownPanel(
		options: Array<{value: string; label: string; icon: string}>,
		currentSort: string,
		currentDir: 'asc' | 'desc',
		currentLabel: string,
		currentIcon: string,
		headerLabel: string,
		onSelect: (value: string) => void
	)}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="relative flex-none"
			onmouseenter={showSortMenu}
			onmouseleave={hideSortMenuDelayed}
		>
			<button
				class="sort-btn"
				class:sort-btn-active={sortHovered || showSortDropdown}
				title={headerLabel}
				aria-haspopup="true"
				aria-expanded={showSortDropdown}
				onmouseenter={() => (sortHovered = true)}
				onmouseleave={() => (sortHovered = false)}
				onfocus={showSortMenu}
				onblur={hideSortMenuDelayed}
			>
				<span class="text-xs">{currentIcon}</span>
				<span class="hidden sm:inline">{currentLabel}</span>
				<span class="text-[10px] opacity-60">{currentDir === "asc" ? "▲" : "▼"}</span>
				<svg
					class="w-2.5 h-2.5 ml-0.5 transition-transform {showSortDropdown ? 'rotate-180' : ''}"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
				</svg>
			</button>

			{#if showSortDropdown}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					role="menu"
					class="absolute top-full left-0 mt-1 min-w-[160px] rounded-lg shadow-xl z-50 overflow-hidden dropdown-content bg-base-200 border border-base-content/20"
					onmouseenter={keepSortMenuOpen}
					onmouseleave={hideSortMenuDelayed}
					onfocusin={keepSortMenuOpen}
					onfocusout={hideSortMenuDelayed}
					onkeydown={handleSortDropdownKeydown}
				>
					<div class="px-3 py-2 border-b border-base-content/10">
						<span class="text-[10px] font-mono uppercase tracking-wider text-base-content/60">
							{headerLabel}
						</span>
					</div>
					<div class="py-1">
						{#each options as opt (opt.value)}
							<button
								role="menuitem"
								class="w-full px-3 py-2 text-left text-xs font-mono flex items-center gap-2 transition-colors hover:bg-base-300"
								class:text-primary={currentSort === opt.value}
								class:bg-base-300={currentSort === opt.value}
								onclick={() => onSelect(opt.value)}
							>
								<span class="text-sm">{opt.icon}</span>
								<span class="flex-1">{opt.label}</span>
								{#if currentSort === opt.value}
									<span class="text-[10px] opacity-60">{currentDir === "asc" ? "▲" : "▼"}</span>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/snippet}

	<!-- Sort Dropdown (on /agents page) -->
	{#if isAgentsPage}
		{@render sortDropdownPanel(AGENT_SORT_OPTIONS, currentAgentSort, currentAgentDir, currentAgentSortLabel, currentAgentSortIcon, 'Sort Agents', onAgentSortSelect)}
	{/if}

	<!-- Sort Dropdown (on /servers page) -->
	{#if isServersPage}
		{@render sortDropdownPanel(SERVER_SORT_OPTIONS, currentServerSort, currentServerDir, currentServerSortLabel, currentServerSortIcon, 'Sort Servers', onServerSortSelect)}
	{/if}

	<!-- Vertical separator (desktop only) -->
	<div
		class="hidden lg:block w-px h-6 mx-3 bg-gradient-to-b from-transparent via-base-content/45 to-transparent"
	></div>

	<!-- Right side: Cmd + Search (all screens) + Activity + Servers + Profile -->
	<div class="flex-none flex items-center gap-2 pr-3">
		<!-- Unified search + commands — opens UnifiedSearch (Ctrl+K).
		     Hidden on narrow: MobileProjectSelector already opens the same palette when tapped. -->
		{#if onGlobalSearchOpen}
			<button
				class="search-cmd-btn"
				onclick={onGlobalSearchOpen}
				aria-label="Search and commands (Ctrl+K)"
				title="Search and commands (Ctrl+K)"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5 flex-shrink-0">
					<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
				</svg>
				<span class="search-cmd-hint">⌘K</span>
			</button>
		<!-- Inner separator: tools | status (desktop only) -->
		<div class="hidden lg:block w-px h-5 mx-1 bg-gradient-to-b from-transparent via-base-content/30 to-transparent flex-shrink-0"></div>
		{/if}

		<!-- Swarm loading slot — always rendered so Activity/Servers badges don't shift -->
		<div class="swarm-slot" class:swarm-slot-hidden={!swarmLoading}>
			<!-- Mobile: icon only -->
			<div class="flex lg:hidden items-center justify-center w-7 h-7" style="color: oklch(0.75 0.18 85);">
				<svg class="w-4 h-4 animate-spin-fast" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" d="M12 3v3m0 12v3M3 12h3m12 0h3"/>
				</svg>
			</div>
			<!-- Desktop: icon + label -->
			<div class="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded" style="background: oklch(0.22 0.04 85 / 0.4); border: 1px solid oklch(0.55 0.15 85 / 0.4);">
				<svg class="w-3 h-3 animate-spin-fast" style="color: oklch(0.75 0.18 85);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
					<path stroke-linecap="round" d="M12 3v3m0 12v3M3 12h3m12 0h3"/>
				</svg>
				<span class="font-mono text-[10px] uppercase tracking-wider" style="color: oklch(0.75 0.15 85);">Spawning</span>
			</div>
		</div>

		<!-- Combined Activity Badge (hidden on small screens) -->
		<div class="hidden lg:block">
			<ActivityBadge
				{activeAgentCount}
				{stateCounts}
				{tokensToday}
				{costToday}
				{sparklineData}
				{multiProjectData}
				{projectColors}
			/>
		</div>

		<!-- Dev Servers + WebSocket Status (hidden on small screens) -->
		<div class="hidden lg:block">
			<ServersBadge />
		</div>

		<!-- User Profile -->
		<UserProfile />
	</div>
</nav>

{#if toastSuccess}
	<div class="topbar-toast topbar-toast-success" role="status" aria-live="polite">
		<svg viewBox="0 0 16 16" fill="currentColor" class="topbar-toast-icon">
			<path fill-rule="evenodd" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" clip-rule="evenodd" />
		</svg>
		<span class="topbar-toast-msg">{toastSuccess}</span>
		<button class="topbar-toast-close" onclick={() => toastSuccess = null} aria-label="Dismiss">
			<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/></svg>
		</button>
	</div>
{/if}

{#if toastError}
	<div class="topbar-toast" role="alert">
		<svg viewBox="0 0 16 16" fill="currentColor" class="topbar-toast-icon">
			<path fill-rule="evenodd" d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8Zm8-3a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5A.75.75 0 0 1 8 5Zm0 6.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
		</svg>
		<span class="topbar-toast-msg">{toastError}</span>
		{#if toastRetry}
			<button class="topbar-toast-retry" onclick={() => { const fn = toastRetry; toastError = null; toastRetry = null; fn?.(); }} aria-label="Retry" title="Retry">
				<svg viewBox="0 0 16 16" fill="currentColor">
					<path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
					<path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
				</svg>
			</button>
		{/if}
		<button class="topbar-toast-close" onclick={() => { toastError = null; toastRetry = null; }} aria-label="Dismiss">
			<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z"/></svg>
		</button>
	</div>
{/if}

<style>
	/* Focus rings for nav buttons that rely on Tailwind classes (sidebar toggle, hamburger) */
	nav > button:focus-visible,
	nav > label:focus-visible {
		outline: 1px solid oklch(0.65 0.15 240 / 0.7);
		outline-offset: 2px;
	}

	/* Ctrl+K search/command button — hidden on narrow (MobileProjectSelector opens the same palette) */
	.search-cmd-btn {
		display: none;
		align-items: center;
		gap: 0.3rem;
		height: 1.75rem;
		padding: 0 0.5rem;
		border-radius: 0.375rem;
		background: oklch(0.18 0.01 250);
		border: 1px solid oklch(0.35 0.02 250);
		color: oklch(0.55 0.02 250);
		cursor: pointer;
		transition: color 0.15s, background 0.15s, border-color 0.15s;
		flex-shrink: 0;
	}
	@media (min-width: 1024px) {
		.search-cmd-btn {
			display: flex;
		}
	}
	.search-cmd-btn:hover {
		color: oklch(0.75 0.02 250);
		background: oklch(0.22 0.02 250);
		border-color: oklch(0.45 0.03 250);
	}
	.search-cmd-btn:focus-visible {
		outline: 1px solid oklch(0.65 0.15 240 / 0.7);
		outline-offset: 2px;
	}
	.search-cmd-hint {
		font-family: ui-monospace, monospace;
		font-size: 0.625rem;
		font-weight: 500;
		color: oklch(0.42 0.02 250);
		letter-spacing: 0.01em;
		display: none;
	}
	@media (min-width: 640px) {
		.search-cmd-hint { display: inline; }
	}

	/* Chips wrapper — takes available flex space, hosts overflow fade ::after */
	.fav-chips-wrapper {
		position: relative;
		flex: 1 1 0%;
		min-width: 0;
	}
	.fav-chips-wrapper::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		width: 2.5rem;
		background: linear-gradient(to left, var(--color-base-200) 20%, transparent);
		pointer-events: none;
		z-index: 1;
		transition: opacity 0.15s ease;
	}
	.fav-chips-wrapper.fav-chips-end::after {
		opacity: 0;
	}

	/* Chips container — scrolls horizontally.
	   ProjectSelector dropdown uses position:fixed so it's not clipped. */
	.fav-chips-scroll {
		width: 100%;
		overflow-x: auto;
		scrollbar-width: none; /* Firefox */
	}
	.fav-chips-scroll::-webkit-scrollbar {
		display: none; /* Chrome/Safari */
	}
	/* Right-align chips when they fit so they sit adjacent to the right cluster.
	   When chips overflow, the auto margin resolves to 0 and horizontal scroll works normally. */
	.fav-chips-scroll > :first-child {
		margin-inline-start: auto;
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
		position: relative;
	}

	.fav-flip-wrapper:active {
		cursor: grabbing;
	}

	.fav-flip-wrapper:focus-visible {
		outline: 1px solid oklch(0.65 0.15 240 / 0.7);
		border-radius: 0.375rem;
	}

	/* ── No-projects CTA ── */
	.no-projects-cta {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-left: 0.75rem;
		padding: 0.25rem 0.625rem;
		border-radius: 0.375rem;
		border: 1px dashed oklch(0.45 0.08 145 / 0.6);
		background: transparent;
		color: oklch(0.65 0.12 145);
		cursor: pointer;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		transition: all 0.15s ease;
		flex-shrink: 0;
	}
	.no-projects-cta:hover {
		border-color: oklch(0.65 0.12 145);
		color: oklch(0.80 0.15 145);
		background: oklch(0.25 0.04 145 / 0.15);
	}
	.no-projects-cta:focus-visible {
		outline: 1px solid oklch(0.65 0.15 145 / 0.7);
		outline-offset: 2px;
	}

	/* ── Project Switcher (+ button & dropdown) ── */
	.project-switcher-container {
		position: relative;
		display: inline-flex;
		flex-shrink: 0;
		margin: 0 10px 0 4px;
	}

	.project-switcher-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.375rem;
		border: 1px dashed oklch(0.45 0.02 250);
		background: transparent;
		color: oklch(0.55 0.02 250);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.project-switcher-btn:focus-visible {
		outline: 1px solid oklch(0.65 0.15 240 / 0.7);
		outline-offset: 2px;
	}

	.project-switcher-btn:hover {
		border-color: oklch(0.65 0.12 145);
		color: oklch(0.75 0.15 145);
		background: oklch(0.25 0.04 145 / 0.2);
		box-shadow: 0 0 6px oklch(0.65 0.12 145 / 0.2);
	}

	.project-switcher-dropdown {
		position: fixed;
		min-width: 14rem;
		max-width: 20rem;
		padding: 0.25rem;
		border-radius: 0.5rem;
		background: oklch(0.18 0.01 250);
		border: 1px solid oklch(0.28 0.02 250 / 0.5);
		box-shadow: 0 8px 24px oklch(0 0 0 / 0.4);
		z-index: 60;
		animation: psd-in 0.12s ease-out;
	}

	@keyframes psd-in {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.psd-header {
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(0.50 0.02 250);
		padding: 0.375rem 0.5rem 0.25rem;
	}

	.psd-scroll {
		max-height: 14rem;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: oklch(0.35 0.02 250) transparent;
	}

	.psd-scroll::-webkit-scrollbar {
		width: 0.4rem;
	}
	.psd-scroll::-webkit-scrollbar-track {
		background: transparent;
	}
	.psd-scroll::-webkit-scrollbar-thumb {
		background: oklch(0.35 0.02 250);
		border-radius: 0.2rem;
	}

	.psd-row {
		display: flex;
		align-items: center;
		border-radius: 0.375rem;
	}

	.psd-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		padding: 0.375rem 0.5rem;
		border-radius: 0.375rem;
		border: none;
		background: transparent;
		cursor: pointer;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		color: oklch(0.75 0.02 250);
		transition: background 0.1s ease;
		text-align: left;
	}

	.psd-item:hover {
		background: oklch(0.22 0.01 250);
	}

	/* Placed AFTER .psd-item:hover so equal-specificity row-hover wins,
	   giving project-colored background when hovering anywhere on the row. */
	.psd-row:hover .psd-item {
		background: color-mix(in oklch, var(--psd-color, oklch(0.60 0.02 250)) 15%, transparent);
		color: var(--psd-color, oklch(0.92 0.02 250));
	}

	.psd-item.psd-active {
		color: var(--psd-color);
	}

	.psd-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: var(--psd-color);
		flex-shrink: 0;
		opacity: 0.8;
	}

	.psd-item.psd-active .psd-dot {
		opacity: 1;
		box-shadow: 0 0 5px color-mix(in oklch, var(--psd-color) 50%, transparent);
	}

	.psd-label {
		flex: 1;
		text-align: left;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.psd-star {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
		padding: 0;
		border: none;
		border-radius: 0.25rem;
		background: transparent;
		cursor: pointer;
		color: oklch(0.40 0.02 250);
		opacity: 0;
		transition: all 0.15s ease;
	}

	.psd-star svg {
		width: 0.8rem;
		height: 0.8rem;
	}

	.psd-row:hover .psd-star {
		opacity: 1;
	}

	.psd-star.psd-star-active {
		opacity: 1;
		color: oklch(0.80 0.18 85);
	}

	.psd-star:focus-visible {
		opacity: 1;
	}

	.psd-star:hover {
		color: oklch(0.85 0.15 85);
		background: oklch(0.28 0.08 85 / 0.3);
	}

	.psd-star.psd-star-active:hover {
		color: oklch(0.60 0.10 85);
	}

	.psd-check {
		width: 0.875rem;
		height: 0.875rem;
		flex-shrink: 0;
		color: var(--psd-color);
	}

	.psd-divider {
		height: 1px;
		background: oklch(0.26 0.02 250);
		margin: 0.25rem 0;
	}

	.psd-add-item {
		font-weight: 500;
		text-transform: none;
		letter-spacing: normal;
	}

	.psd-add-icon {
		width: 0.875rem;
		height: 0.875rem;
		flex-shrink: 0;
		color: oklch(0.70 0.18 145);
	}

	.psd-add-item:hover .psd-add-icon {
		color: oklch(0.85 0.18 145);
	}

	/* Error toast (stacks below success toast when both are shown) */
	.topbar-toast {
		position: fixed;
		top: 6.5rem;
		right: 1rem;
		z-index: 50;
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.5rem 0.625rem 0.5rem 0.75rem;
		border-radius: 0.375rem;
		background: oklch(0.18 0.04 25);
		border: 1px solid oklch(0.55 0.18 25 / 0.5);
		box-shadow: 0 4px 16px oklch(0 0 0 / 0.4);
		max-width: 28rem;
		animation: topbar-toast-in 0.15s ease-out;
	}

	@keyframes topbar-toast-in {
		from { opacity: 0; transform: translateY(-6px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	.topbar-toast-icon {
		width: 0.875rem;
		height: 0.875rem;
		flex-shrink: 0;
		color: oklch(0.70 0.20 25);
		margin-top: 0.1rem;
	}

	.topbar-toast-msg {
		flex: 1;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.75rem;
		color: oklch(0.85 0.08 25);
		line-height: 1.4;
	}

	.topbar-toast-retry {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
		padding: 0;
		border: none;
		border-radius: 0.25rem;
		background: transparent;
		cursor: pointer;
		color: oklch(0.65 0.15 25);
		transition: color 0.1s, background 0.1s;
	}

	.topbar-toast-retry:hover {
		color: oklch(0.80 0.18 25);
		background: oklch(0.55 0.18 25 / 0.15);
	}

	.topbar-toast-retry svg {
		width: 0.75rem;
		height: 0.75rem;
	}

	.topbar-toast-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
		padding: 0;
		border: none;
		border-radius: 0.25rem;
		background: transparent;
		cursor: pointer;
		color: oklch(0.50 0.06 25);
		transition: color 0.1s, background 0.1s;
	}

	.topbar-toast-close:hover {
		color: oklch(0.80 0.12 25);
		background: oklch(0.55 0.18 25 / 0.15);
	}

	.topbar-toast-close svg {
		width: 0.75rem;
		height: 0.75rem;
	}

	.topbar-toast-success {
		top: 3.5rem; /* Success stacks above error when both are shown */
		background: oklch(0.18 0.04 145);
		border-color: oklch(0.55 0.18 145 / 0.5);
	}

	.topbar-toast-success .topbar-toast-icon {
		color: oklch(0.70 0.20 145);
	}

	.topbar-toast-success .topbar-toast-msg {
		color: oklch(0.85 0.08 145);
	}

	.topbar-toast-success .topbar-toast-close {
		color: oklch(0.50 0.06 145);
	}

	.topbar-toast-success .topbar-toast-close:hover {
		color: oklch(0.80 0.12 145);
		background: oklch(0.55 0.18 145 / 0.15);
	}

	/* ── Sort button (custom, no DaisyUI) ── */
	.sort-btn {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 8px;
		margin-right: 0.75rem;
		border-radius: 0.375rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.625rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		cursor: pointer;
		outline: none;
		transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
		background: oklch(0.18 0.01 250);
		border: 1px solid oklch(0.28 0.02 250);
		color: oklch(0.58 0.03 240);
	}

	.sort-btn:hover,
	.sort-btn-active {
		background: oklch(0.22 0.04 240 / 0.6);
		border-color: oklch(0.45 0.12 240 / 0.5);
		color: oklch(0.80 0.08 240);
	}

	.sort-btn:focus-visible {
		outline: 1px solid oklch(0.65 0.15 240 / 0.7);
		outline-offset: 2px;
	}

	/* ── Swarm loading slot (reserved space prevents Activity/Servers badge shift) ── */
	.swarm-slot {
		display: flex;
		align-items: center;
	}
	/* Collapse fully when idle; the spawn-loading state is ephemeral, so a slight badge
	   shift on spawn is a better trade-off than permanent dead space in the topbar. */
	.swarm-slot-hidden {
		display: none;
	}

	/* ── Chip drag affordance ── */
	.fav-drag-handle {
		position: absolute;
		left: 3px;
		top: 50%;
		transform: translateY(-50%);
		font-size: 10px;
		line-height: 1;
		color: oklch(0.55 0.08 240 / 0.6);
		opacity: 0.55;
		transition: opacity 0.15s ease;
		pointer-events: none;
		z-index: 2;
		user-select: none;
	}

	.fav-flip-wrapper:hover .fav-drag-handle {
		opacity: 1;
	}

</style>
