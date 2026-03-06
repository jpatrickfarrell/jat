<script lang="ts">
	/**
	 * ProjectSelector Component
	 * Unified project selector + action hub for the TopBar.
	 * Combines project switching with task creation, start, and swarm actions.
	 *
	 * Default: [● jat ▾] - compact project chip
	 * Hover:  [● jat ▾|+] - plus button slides out
	 * Click chip: dropdown with projects, ready tasks, and actions
	 * Click +: opens task creation drawer for current project
	 */
	import { getProjectColor } from "$lib/utils/projectColors";
	import FxText from '$lib/components/FxText.svelte';
	import { SESSION_STATE_VISUALS } from "$lib/config/statusColors";
	import {
		isStartDropdownOpen,
		closeStartDropdown,
		openProjectDrawer
	} from '$lib/stores/drawerStore';

	interface ReadyTask {
		id: string;
		title: string;
		project?: string;
		priority?: number;
	}

	interface Epic {
		id: string;
		title: string;
		project?: string;
		childCount?: number;
	}

	interface Props {
		projects: string[];
		selectedProject: string;
		onProjectChange: (project: string) => void;
		taskCounts?: Map<string, number> | null;
		compact?: boolean;
		showColors?: boolean;
		/** Optional map of project name -> color. If provided, used instead of getProjectColor() */
		projectColors?: Map<string, string> | null;
		/** Set of project names that are favorites (sorted to top of dropdown) */
		favoriteProjects?: Set<string> | null;
		/** Called when favorite star is toggled for a project */
		onToggleFavorite?: (project: string) => void;
		readyTasks?: ReadyTask[];
		epics?: Epic[];
		idleSlots?: number;
		onNewTask?: (project: string) => void;
		onStart?: (taskId: string) => void;
		onSwarm?: (count: number, epicId?: string) => void;
		/** Session states for the selected project (one per agent) */
		sessionStates?: string[];
	}

	let {
		projects,
		selectedProject,
		onProjectChange,
		taskCounts = null,
		compact = false,
		showColors = false,
		projectColors = null,
		favoriteProjects = null,
		onToggleFavorite,
		readyTasks = [],
		epics = [],
		idleSlots = 0,
		onNewTask,
		onStart,
		onSwarm,
		sessionStates = [],
	}: Props = $props();

	// Sort projects: favorites first, then the rest
	const sortedProjects = $derived(
		favoriteProjects && favoriteProjects.size > 0
			? [...projects].sort((a, b) => {
				const aFav = favoriteProjects.has(a) ? 1 : 0;
				const bFav = favoriteProjects.has(b) ? 1 : 0;
				if (aFav !== bFav) return bFav - aFav;
				return 0; // preserve original order within groups
			})
			: projects
	);

	let open = $state(false);
	let containerEl = $state<HTMLDivElement | null>(null);

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

	// Filter epics for the selected project
	const projectEpics = $derived(
		epics.filter(e => e.project === selectedProject)
	);

	const hasActions = $derived(!!onStart || !!onSwarm || !!onNewTask);

	function handleSelect(project: string) {
		onProjectChange(project);
		open = false;
	}

	// Format project option with task count if available
	function formatProjectOption(project: string): string {
		if (taskCounts && taskCounts.has(project)) {
			const count = taskCounts.get(project);
			return `${project} (${count})`;
		}
		return project;
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

	function handleStartTop() {
		if (projectReadyTasks.length > 0) {
			handleStartTask(projectReadyTasks[0].id);
		}
	}

	function handleSwarmClick(count: number, epicId?: string) {
		open = false;
		onSwarm?.(count, epicId);
	}

	function handleNewTaskClick(e: MouseEvent) {
		e.stopPropagation();
		onNewTask?.(selectedProject);
	}

	function handleToggleFavorite(e: MouseEvent, project: string) {
		e.stopPropagation();
		onToggleFavorite?.(project);
	}

	// Alt+S keyboard shortcut support - open dropdown to show ready tasks
	$effect(() => {
		const unsubscribe = isStartDropdownOpen.subscribe((isOpen: boolean) => {
			if (isOpen && readyTasks.length > 0) {
				open = true;
			}
		});
		return unsubscribe;
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

<div class="selector-container" bind:this={containerEl}>
	<div class="chip-group" style="--project-color: {selectedColor};">
		<button
			type="button"
			class="trigger-btn"
			class:compact
			onclick={() => open = !open}
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
			{:else}
				<span class="chip-dot"></span>
			{/if}
			<span class="chip-label">{selectedProject}</span>
			<svg class="chevron" class:open viewBox="0 0 16 16" fill="currentColor">
				<path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
			</svg>
		</button>

		{#if onNewTask}
			<button
				type="button"
				class="new-btn"
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
		<div class="dropdown-menu">
			<!-- Projects Section -->
			<div class="dropdown-section-header">Projects</div>
			{#each sortedProjects as project}
				{@const projColor = getColor(project)}
				{@const isFavorite = favoriteProjects?.has(project)}
				<button
					type="button"
					class="dropdown-item project-item"
					class:active={selectedProject === project}
					style="--project-color: {projColor};"
					onclick={() => handleSelect(project)}
				>
					<span class="item-dot"></span>
					<span class="item-label">{formatProjectOption(project)}</span>
					{#if onToggleFavorite}
						<button
							type="button"
							class="favorite-star-btn"
							class:is-favorite={isFavorite}
							onclick={(e) => handleToggleFavorite(e, project)}
							title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
						>
							{#if isFavorite}
								<svg viewBox="0 0 24 24" fill="currentColor">
									<path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
								</svg>
							{:else}
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
								</svg>
							{/if}
						</button>
					{/if}
					{#if selectedProject === project}
						<svg class="check-icon" viewBox="0 0 16 16" fill="currentColor">
							<path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd" />
						</svg>
					{/if}
				</button>
			{/each}

			<!-- Add New Project -->
			<div class="dropdown-divider"></div>
			<button
				type="button"
				class="dropdown-item action-item add-project-item"
				onclick={() => { open = false; openProjectDrawer(); }}
			>
				<svg class="action-icon action-add" viewBox="0 0 20 20" fill="currentColor">
					<path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
				</svg>
				<span class="item-label">Add Project</span>
			</button>

			<!-- Ready Tasks Section -->
			{#if hasActions && projectReadyTasks.length > 0}
				<div class="dropdown-divider"></div>
				<div class="dropdown-section-header">Ready Tasks ({projectReadyTasks.length})</div>
				<div class="dropdown-scroll">
					{#each projectReadyTasks as task}
						<button
							type="button"
							class="dropdown-item task-item"
							onclick={() => handleStartTask(task.id)}
						>
							{#if task.priority !== undefined}
								<span class="priority-badge priority-{task.priority}">P{task.priority}</span>
							{/if}
							<span class="item-label task-title"><FxText text={task.title} /></span>
						</button>
					{/each}
				</div>
			{/if}

			<!-- Quick Actions Section -->
			{#if hasActions && projectReadyTasks.length > 0}
				<div class="dropdown-divider"></div>
				<div class="dropdown-section-header">Actions</div>
				<button
					type="button"
					class="dropdown-item action-item"
					onclick={handleStartTop}
				>
					<svg class="action-icon action-start" viewBox="0 0 20 20" fill="currentColor">
						<path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
					</svg>
					<span class="item-label">Start top task</span>
				</button>
				{#if idleSlots > 0 && onSwarm}
					<button
						type="button"
						class="dropdown-item action-item"
						onclick={() => handleSwarmClick(Math.min(projectReadyTasks.length, idleSlots))}
					>
						<svg class="action-icon action-swarm" viewBox="0 0 20 20" fill="currentColor">
							<path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.5A.75.75 0 002.75 12h6.572l-1.305 6.093a.75.75 0 001.292.657l8.5-9.5A.75.75 0 0017.25 8h-6.572l1.305-6.093z" />
						</svg>
						<span class="item-label">Swarm ({Math.min(projectReadyTasks.length, idleSlots)} agents)</span>
					</button>
				{/if}
			{/if}

			<!-- Epics Section -->
			{#if hasActions && projectEpics.length > 0}
				<div class="dropdown-divider"></div>
				<div class="dropdown-section-header">Attack Epic</div>
				{#each projectEpics.slice(0, 3) as epic}
					<button
						type="button"
						class="dropdown-item action-item"
						onclick={() => handleSwarmClick(Math.min(epic.childCount || 4, idleSlots), epic.id)}
						disabled={idleSlots === 0}
					>
						<span class="epic-icon">&#127919;</span>
						<span class="item-label task-title"><FxText text={epic.title} /></span>
						{#if epic.childCount}
							<span class="dropdown-hint">{epic.childCount} tasks</span>
						{/if}
					</button>
				{/each}
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
		transform: scale(1.15);
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

	.chevron {
		width: 0.875rem;
		height: 0.875rem;
		opacity: 0.7;
		transition: transform 0.15s ease;
		flex-shrink: 0;
	}

	.chevron.open {
		transform: rotate(180deg);
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
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
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

	/* Project items */
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

	.favorite-star-btn {
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

	.favorite-star-btn svg {
		width: 0.8rem;
		height: 0.8rem;
	}

	/* Show on row hover */
	.project-item:hover .favorite-star-btn {
		opacity: 1;
	}

	/* Always visible when favorited */
	.favorite-star-btn.is-favorite {
		opacity: 1;
		color: oklch(0.80 0.18 85);
	}

	.favorite-star-btn:hover {
		color: oklch(0.85 0.15 85);
		background: oklch(0.28 0.08 85 / 0.3);
	}

	.favorite-star-btn.is-favorite:hover {
		color: oklch(0.60 0.10 85);
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

	.check-icon {
		width: 0.875rem;
		height: 0.875rem;
		flex-shrink: 0;
		color: var(--project-color);
	}

	/* Task items */
	.task-item {
		font-size: 0.8125rem;
	}

	/* Action items */
	.action-item {
		font-size: 0.8125rem;
	}

	.action-icon {
		width: 0.875rem;
		height: 0.875rem;
		flex-shrink: 0;
	}

	.action-start {
		color: oklch(0.75 0.15 200);
	}

	.action-swarm {
		color: oklch(0.80 0.15 85);
	}

	.action-item:hover .action-start {
		color: oklch(0.90 0.15 200);
	}

	.action-item:hover .action-swarm {
		color: oklch(0.92 0.15 85);
	}

	.action-add {
		color: oklch(0.70 0.18 145);
	}

	.action-item:hover .action-add {
		color: oklch(0.85 0.18 145);
	}

	.epic-icon {
		font-size: 0.875rem;
		flex-shrink: 0;
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
</style>
