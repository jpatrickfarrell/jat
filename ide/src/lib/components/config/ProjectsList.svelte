<script lang="ts">
	/**
	 * ProjectsList Component
	 *
	 * Displays all project configurations in a grid layout with:
	 * - Grid of ProjectCard components
	 * - New Project button
	 * - Loading and error states
	 * - Collapsible hidden projects section
	 *
	 * Follows the RulesList pattern from automation.
	 *
	 * @see ide/src/lib/types/config.ts for ProjectConfig type
	 * @see ide/src/lib/stores/configStore.svelte.ts for store
	 */

	import { fade, slide } from 'svelte/transition';
	import type { ProjectConfig } from '$lib/types/config';
	import {
		getProjects,
		getVisibleProjects,
		getHiddenProjects,
		isProjectsLoading,
		getProjectsError,
		loadProjects,
		toggleProjectVisibility,
		toggleProjectFavorite
	} from '$lib/stores/configStore.svelte';
	import ProjectCard from './ProjectCard.svelte';
	import { successToast, errorToast } from '$lib/stores/toasts.svelte';

	type ViewMode = 'cards' | 'table';
	type SortField = 'name' | 'path' | 'port' | 'tasks' | 'agents' | 'description';
	type SortDir = 'asc' | 'desc';

	interface Props {
		/** Called when edit button is clicked for a project */
		onEditProject?: (project: ProjectConfig) => void;
		/** Called when add project button is clicked */
		onAddProject?: () => void;
		/** Called when delete button is clicked for a project */
		onDeleteProject?: (project: ProjectConfig) => void;
		/** Custom class */
		class?: string;
	}

	let {
		onEditProject = () => {},
		onAddProject = () => {},
		onDeleteProject = () => {},
		class: className = ''
	}: Props = $props();

	// Get reactive state from store
	const visibleProjects = $derived(getVisibleProjects());
	const hiddenProjects = $derived(getHiddenProjects());
	const allProjects = $derived(getProjects());
	const loading = $derived(isProjectsLoading());
	const error = $derived(getProjectsError());

	// View mode (cards or table)
	const STORAGE_KEY = 'jat-projects-view-mode';
	let viewMode = $state<ViewMode>((typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) as ViewMode) || 'table');

	function setViewMode(mode: ViewMode) {
		viewMode = mode;
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, mode);
		}
	}

	// Sorting state for table view
	let sortField = $state<SortField>('name');
	let sortDir = $state<SortDir>('asc');

	function toggleSort(field: SortField) {
		if (sortField === field) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDir = 'asc';
		}
	}

	// Sorted projects for table view
	const sortedProjects = $derived((() => {
		const projects = [...visibleProjects];
		projects.sort((a, b) => {
			let aVal: string | number = '';
			let bVal: string | number = '';
			switch (sortField) {
				case 'name': aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase(); break;
				case 'path': aVal = a.path.toLowerCase(); bVal = b.path.toLowerCase(); break;
				case 'port': aVal = a.port || 0; bVal = b.port || 0; break;
				case 'tasks': aVal = a.stats?.openTaskCount || 0; bVal = b.stats?.openTaskCount || 0; break;
				case 'agents': aVal = a.stats?.agentCount || 0; bVal = b.stats?.agentCount || 0; break;
				case 'description': aVal = (a.description || '').toLowerCase(); bVal = (b.description || '').toLowerCase(); break;
			}
			if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
			return 0;
		});
		return projects;
	})());

	// Hidden projects section collapsed state
	let hiddenSectionExpanded = $state(false);

	// Handle visibility toggle
	async function handleToggleVisibility(project: ProjectConfig) {
		try {
			const newVisibility = !project.hidden;
			await toggleProjectVisibility(project.name, newVisibility);
			const action = newVisibility ? 'hidden' : 'shown';
			successToast(`Project "${project.name}" ${action}`, `Project is now ${newVisibility ? 'hidden from' : 'visible in'} the IDE`);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to toggle visibility';
			errorToast('Failed to update project visibility', message);
		}
	}

	// Handle favorite toggle
	async function handleToggleFavorite(project: ProjectConfig) {
		try {
			const newFavorite = !project.favorite;
			await toggleProjectFavorite(project.path, newFavorite);
			const action = newFavorite ? 'added to' : 'removed from';
			successToast(`Project "${project.name}" ${action} favorites`);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to toggle favorite';
			errorToast('Failed to update favorite', message);
		}
	}

	// Handle open folder
	async function handleOpenFolder(project: ProjectConfig) {
		try {
			const response = await fetch('/api/open-folder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ path: project.path })
			});
			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to open folder');
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to open folder';
			errorToast('Failed to open folder', message);
		}
	}

	// Handle retry
	function handleRetry() {
		loadProjects();
	}

	// Toggle hidden section
	function toggleHiddenSection() {
		hiddenSectionExpanded = !hiddenSectionExpanded;
	}
</script>

<div class="projects-list {className}">
	<!-- Header -->
	<header class="list-header">
		<div class="header-left">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="header-icon">
				<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
			</svg>
			<span class="header-title">Projects</span>
			<span class="project-count">{allProjects.length} project{allProjects.length !== 1 ? 's' : ''}</span>
		</div>

		<div class="header-right">
			<!-- View mode toggle -->
			<div class="view-toggle">
				<button
					class="view-toggle-btn"
					class:active={viewMode === 'cards'}
					onclick={() => setViewMode('cards')}
					title="Card view"
					aria-label="Card view"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
					</svg>
				</button>
				<button
					class="view-toggle-btn"
					class:active={viewMode === 'table'}
					onclick={() => setViewMode('table')}
					title="Table view"
					aria-label="Table view"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12h-7.5m8.625 0h7.5m-7.5 0c.621 0 1.125.504 1.125 1.125M3.375 12c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M3.375 15.75h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m-1.125-2.625c0-.621.504-1.125 1.125-1.125M12 15.75h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125m0 0v1.5c0 .621.504 1.125 1.125 1.125" />
					</svg>
				</button>
			</div>

			<!-- Refresh button -->
			<button
				class="refresh-btn"
				onclick={handleRetry}
				disabled={loading}
				title="Refresh projects"
				aria-label="Refresh projects"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-4 h-4"
					class:spinning={loading}
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
				</svg>
			</button>

			<!-- Add project button -->
			<button
				class="add-btn"
				onclick={() => onAddProject()}
				aria-label="Add new project"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
				</svg>
				New Project
			</button>
		</div>
	</header>

	<!-- Content -->
	<div class="list-content">
		{#if loading && allProjects.length === 0}
			<!-- Loading state -->
			<div class="loading-state" transition:fade={{ duration: 150 }}>
				<div class="loading-spinner"></div>
				<p class="loading-text">Loading projects...</p>
			</div>
		{:else if error}
			<!-- Error state -->
			<div class="error-state" transition:fade={{ duration: 150 }}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="error-icon">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
				</svg>
				<p class="error-title">Failed to load projects</p>
				<p class="error-message">{error}</p>
				<button class="retry-btn" onclick={handleRetry}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
						<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
					</svg>
					Retry
				</button>
			</div>
		{:else if allProjects.length === 0}
			<!-- Empty state -->
			<div class="empty-state" transition:fade={{ duration: 150 }}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="empty-icon">
					<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
				</svg>
				<p class="empty-title">No projects configured</p>
				<p class="empty-hint">Add a project to get started with the IDE</p>
				<button class="empty-action" onclick={() => onAddProject()}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
					</svg>
					Add First Project
				</button>
			</div>
		{:else}
			{#if viewMode === 'cards'}
				<!-- Projects grid -->
				<div class="projects-grid">
					{#each visibleProjects as project, index (project.path)}
						<div class="fade-in-left fade-in-delay-{Math.min(index, 12)}">
							<ProjectCard
								{project}
								onEdit={onEditProject}
								onDelete={onDeleteProject}
								onToggleVisibility={handleToggleVisibility}
								onOpenFolder={handleOpenFolder}
								onToggleFavorite={handleToggleFavorite}
							/>
						</div>
					{/each}
				</div>
			{:else}
				<!-- Table view -->
				<div class="table-wrapper">
					<table class="projects-table">
						<thead>
							<tr>
								{#each [
									{ field: 'name' as SortField, label: 'Name' },
									{ field: 'path' as SortField, label: 'Path' },
									{ field: 'port' as SortField, label: 'Port' },
									{ field: 'tasks' as SortField, label: 'Tasks' },
									{ field: 'agents' as SortField, label: 'Agents' },
									{ field: 'description' as SortField, label: 'Description' }
								] as col}
									<th
										class="sortable-th"
										class:sorted={sortField === col.field}
										onclick={() => toggleSort(col.field)}
									>
										<span>{col.label}</span>
										{#if sortField === col.field}
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="sort-icon" class:sort-desc={sortDir === 'desc'}>
												<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
											</svg>
										{/if}
									</th>
								{/each}
								<th class="actions-th">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each sortedProjects as project (project.path)}
								<tr
									class="project-row"
									class:hidden-project={project.hidden}
									onclick={() => onEditProject(project)}
								>
									<td class="name-cell">
										<span class="table-name-badge" style="--project-color: {project.colors?.active || 'oklch(0.70 0.15 200)'}">
											{project.name}
										</span>
										{#if project.favorite}
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="star-icon">
												<path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd" />
											</svg>
										{/if}
										{#if project.stats?.hasJat}
											<span class="table-micro-badge jat">JAT</span>
										{/if}
									</td>
									<td class="path-cell" title={project.path}>
										{project.path.replace(/^\/home\/[^/]+\/code\//, '~/')}
									</td>
									<td class="port-cell">
										{#if project.port}
											<span class="table-port-badge">:{project.port}</span>
										{:else}
											<span class="table-muted">&mdash;</span>
										{/if}
									</td>
									<td class="num-cell">
										{#if project.stats}
											<span class="table-stat" title="{project.stats.openTaskCount} open / {project.stats.taskCount} total">{project.stats.openTaskCount}</span>
										{:else}
											<span class="table-muted">&mdash;</span>
										{/if}
									</td>
									<td class="num-cell">
										{#if project.stats}
											<span class="table-stat" class:has-agents={project.stats.agentCount > 0}>{project.stats.agentCount}</span>
										{:else}
											<span class="table-muted">&mdash;</span>
										{/if}
									</td>
									<td class="desc-cell">
										{#if project.description}
											<span class="table-desc">{project.description}</span>
										{:else}
											<span class="table-muted">&mdash;</span>
										{/if}
									</td>
									<td class="actions-cell">
										<button
											class="table-action-btn"
											onclick={(e: MouseEvent) => { e.stopPropagation(); onEditProject(project); }}
											title="Edit"
										>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
												<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
											</svg>
										</button>
										<button
											class="table-action-btn"
											onclick={(e: MouseEvent) => { e.stopPropagation(); handleOpenFolder(project); }}
											title="Open folder"
										>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
												<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
											</svg>
										</button>
										<button
											class="table-action-btn delete"
											onclick={(e: MouseEvent) => { e.stopPropagation(); if (confirm(`Delete project "${project.name}"?`)) onDeleteProject(project); }}
											title="Delete"
										>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
												<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
											</svg>
										</button>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}

			<!-- Hidden projects section -->
			{#if hiddenProjects.length > 0}
				<div class="hidden-section" transition:slide={{ duration: 200, axis: 'y' }}>
					<button
						class="hidden-section-header"
						onclick={toggleHiddenSection}
						aria-expanded={hiddenSectionExpanded}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="chevron-icon"
							class:expanded={hiddenSectionExpanded}
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
						</svg>
						<span class="hidden-section-title">Hidden Projects</span>
						<span class="hidden-count">{hiddenProjects.length}</span>
					</button>

					{#if hiddenSectionExpanded}
						<div class="hidden-projects-grid" transition:slide={{ duration: 200, axis: 'y' }}>
							{#each hiddenProjects as project, index (project.path)}
								<div class="fade-in-left fade-in-delay-{Math.min(index, 12)}">
									<ProjectCard
										{project}
										onEdit={onEditProject}
										onDelete={onDeleteProject}
										onToggleVisibility={handleToggleVisibility}
										onOpenFolder={handleOpenFolder}
										onToggleFavorite={handleToggleFavorite}
									/>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.projects-list {
		display: flex;
		flex-direction: column;
		background: oklch(0.14 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 10px;
		overflow: hidden;
	}

	/* Header */
	.list-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: oklch(0.12 0.02 250);
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.header-icon {
		width: 18px;
		height: 18px;
		color: oklch(0.65 0.10 200);
	}

	.header-title {
		font-size: 0.85rem;
		font-weight: 600;
		color: oklch(0.85 0.02 250);
		font-family: ui-monospace, monospace;
	}

	.project-count {
		font-size: 0.7rem;
		font-weight: 400;
		color: oklch(0.50 0.02 250);
		background: oklch(0.22 0.02 250);
		padding: 0.125rem 0.5rem;
		border-radius: 10px;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* Refresh button */
	.refresh-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		background: oklch(0.22 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 6px;
		color: oklch(0.60 0.02 250);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.refresh-btn:hover:not(:disabled) {
		background: oklch(0.28 0.02 250);
		color: oklch(0.80 0.02 250);
	}

	.refresh-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.spinning {
		animation: spin 1s linear infinite;
	}

	/* Add button */
	.add-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 500;
		background: oklch(0.35 0.10 200);
		border: 1px solid oklch(0.45 0.12 200);
		border-radius: 6px;
		color: oklch(0.90 0.08 200);
		cursor: pointer;
		transition: all 0.15s ease;
		font-family: ui-monospace, monospace;
	}

	.add-btn:hover {
		background: oklch(0.40 0.12 200);
		border-color: oklch(0.50 0.15 200);
	}

	/* Content */
	.list-content {
		padding: 1rem;
	}

	/* Projects grid */
	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1rem;
	}

	/* Loading state */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1rem;
		gap: 1rem;
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid oklch(0.30 0.02 250);
		border-top-color: oklch(0.65 0.15 200);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.loading-text {
		font-size: 0.85rem;
		color: oklch(0.55 0.02 250);
		margin: 0;
	}

	/* Error state */
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1rem;
		gap: 0.5rem;
		color: oklch(0.50 0.02 250);
	}

	.error-icon {
		width: 48px;
		height: 48px;
		color: oklch(0.60 0.15 25);
		margin-bottom: 0.5rem;
	}

	.error-title {
		font-size: 0.9rem;
		font-weight: 500;
		color: oklch(0.70 0.12 25);
		margin: 0;
	}

	.error-message {
		font-size: 0.75rem;
		color: oklch(0.55 0.02 250);
		margin: 0;
		text-align: center;
	}

	.retry-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		font-size: 0.8rem;
		font-weight: 500;
		background: oklch(0.30 0.08 200);
		border: 1px solid oklch(0.40 0.10 200);
		border-radius: 6px;
		color: oklch(0.85 0.08 200);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.retry-btn:hover {
		background: oklch(0.35 0.10 200);
	}

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem 1rem;
		gap: 0.5rem;
		color: oklch(0.50 0.02 250);
	}

	.empty-icon {
		width: 48px;
		height: 48px;
		color: oklch(0.35 0.02 250);
		margin-bottom: 0.5rem;
	}

	.empty-title {
		font-size: 0.9rem;
		font-weight: 500;
		color: oklch(0.55 0.02 250);
		margin: 0;
	}

	.empty-hint {
		font-size: 0.75rem;
		color: oklch(0.45 0.02 250);
		margin: 0;
	}

	.empty-action {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-top: 1rem;
		padding: 0.5rem 1rem;
		font-size: 0.8rem;
		font-weight: 500;
		background: oklch(0.30 0.08 200);
		border: 1px solid oklch(0.40 0.10 200);
		border-radius: 6px;
		color: oklch(0.85 0.08 200);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.empty-action:hover {
		background: oklch(0.35 0.10 200);
	}

	/* Hidden projects section */
	.hidden-section {
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid oklch(0.22 0.02 250);
	}

	.hidden-section-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0;
		background: none;
		border: none;
		cursor: pointer;
		color: oklch(0.60 0.02 250);
		font-size: 0.8rem;
		font-weight: 500;
		transition: color 0.15s ease;
	}

	.hidden-section-header:hover {
		color: oklch(0.75 0.02 250);
	}

	.chevron-icon {
		width: 14px;
		height: 14px;
		transition: transform 0.2s ease;
	}

	.chevron-icon.expanded {
		transform: rotate(90deg);
	}

	.hidden-section-title {
		font-family: ui-monospace, monospace;
	}

	.hidden-count {
		font-size: 0.65rem;
		color: oklch(0.50 0.02 250);
		background: oklch(0.22 0.02 250);
		padding: 0.125rem 0.375rem;
		border-radius: 8px;
	}

	.hidden-projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1rem;
		margin-top: 0.75rem;
	}

	/* View toggle */
	.view-toggle {
		display: flex;
		align-items: center;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 6px;
		overflow: hidden;
	}

	.view-toggle-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 28px;
		background: transparent;
		border: none;
		color: oklch(0.50 0.02 250);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.view-toggle-btn:hover {
		background: oklch(0.25 0.02 250);
		color: oklch(0.75 0.02 250);
	}

	.view-toggle-btn.active {
		background: oklch(0.28 0.06 200);
		color: oklch(0.85 0.10 200);
	}

	/* Table view */
	.table-wrapper {
		overflow-x: auto;
	}

	.projects-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	}

	.projects-table thead {
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.projects-table th {
		padding: 0.5rem 0.75rem;
		text-align: left;
		font-weight: 600;
		font-size: 0.7rem;
		color: oklch(0.60 0.02 250);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		background: oklch(0.12 0.02 250);
		border-bottom: 1px solid oklch(0.25 0.02 250);
		white-space: nowrap;
	}

	.sortable-th {
		cursor: pointer;
		user-select: none;
		transition: color 0.15s ease;
	}

	.sortable-th:hover {
		color: oklch(0.85 0.08 200);
	}

	.sortable-th.sorted {
		color: oklch(0.85 0.12 200);
	}

	.sortable-th span {
		display: inline;
	}

	.sort-icon {
		width: 12px;
		height: 12px;
		display: inline-block;
		vertical-align: middle;
		margin-left: 0.25rem;
		transition: transform 0.15s ease;
	}

	.sort-icon.sort-desc {
		transform: rotate(180deg);
	}

	.actions-th {
		text-align: right;
		width: 100px;
	}

	.projects-table td {
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid oklch(0.20 0.02 250);
		color: oklch(0.75 0.02 250);
		vertical-align: middle;
	}

	.project-row {
		cursor: pointer;
		transition: background 0.1s ease;
	}

	.project-row:hover {
		background: oklch(0.18 0.02 250);
	}

	.project-row.hidden-project {
		opacity: 0.5;
	}

	/* Table cell styles */
	.name-cell {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		white-space: nowrap;
	}

	.table-name-badge {
		font-weight: 600;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		padding: 0.15rem 0.5rem;
		border-radius: 5px;
		background: color-mix(in oklch, var(--project-color) 20%, transparent);
		border: 1px solid color-mix(in oklch, var(--project-color) 35%, transparent);
		color: var(--project-color);
	}

	.star-icon {
		width: 13px;
		height: 13px;
		color: oklch(0.80 0.18 85);
		flex-shrink: 0;
	}

	.table-micro-badge {
		font-size: 0.55rem;
		font-weight: 600;
		padding: 0.1rem 0.3rem;
		border-radius: 3px;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.table-micro-badge.jat {
		color: oklch(0.80 0.12 145);
		background: oklch(0.25 0.06 145);
	}

	.path-cell {
		max-width: 250px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.75rem;
		color: oklch(0.60 0.02 250);
	}

	.port-cell {
		white-space: nowrap;
	}

	.table-port-badge {
		font-size: 0.7rem;
		color: oklch(0.80 0.10 200);
		background: oklch(0.22 0.05 200);
		padding: 0.1rem 0.375rem;
		border-radius: 4px;
	}

	.num-cell {
		text-align: center;
		white-space: nowrap;
	}

	.table-stat {
		font-size: 0.75rem;
		color: oklch(0.70 0.02 250);
	}

	.table-stat.has-agents {
		color: oklch(0.80 0.15 145);
		font-weight: 600;
	}

	.desc-cell {
		max-width: 300px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.table-desc {
		font-size: 0.75rem;
		color: oklch(0.60 0.02 250);
	}

	.table-muted {
		color: oklch(0.35 0.02 250);
	}

	.actions-cell {
		text-align: right;
		white-space: nowrap;
	}

	.table-action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 5px;
		color: oklch(0.50 0.02 250);
		cursor: pointer;
		transition: all 0.15s ease;
		opacity: 0;
	}

	.project-row:hover .table-action-btn {
		opacity: 1;
	}

	.table-action-btn:hover {
		background: oklch(0.25 0.02 250);
		border-color: oklch(0.35 0.02 250);
		color: oklch(0.80 0.02 250);
	}

	.table-action-btn.delete:hover {
		background: oklch(0.25 0.08 25);
		border-color: oklch(0.40 0.12 25);
		color: oklch(0.80 0.15 25);
	}
</style>
