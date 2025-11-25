<script lang="ts">
	/**
	 * ProjectBadgeFilter - Multi-select badge filter for projects
	 *
	 * Follows TaskQueue's priority filter pattern:
	 * - Multi-select badge toggles
	 * - No selection = all projects (no explicit "All" badge)
	 * - Shows task count per project
	 * - Selected badges are badge-primary with shadow
	 * - Unselected badges are badge-ghost with hover effects
	 */

	let {
		projects = [],
		selectedProjects = new Set<string>(),
		taskCounts = new Map<string, number>(),
		onFilterChange = (projects: Set<string>) => {}
	} = $props();

	// Filter out "All Projects" from the list (we don't need an explicit All badge)
	const filteredProjects = $derived(
		projects.filter((p: string) => p !== 'All Projects')
	);

	function toggleProject(project: string) {
		// Create a new Set based on current selection
		const newSet = new Set(selectedProjects);
		if (newSet.has(project)) {
			newSet.delete(project);
		} else {
			newSet.add(project);
		}
		// Call parent callback - parent updates state, which flows back as prop
		onFilterChange(newSet);
	}
</script>

<div class="flex flex-wrap gap-1.5 p-2 bg-base-200 rounded-lg">
	{#each filteredProjects as project (project + '-' + selectedProjects.has(project))}
		<button
			class="badge badge-sm transition-all duration-200 cursor-pointer {selectedProjects.has(project) ? 'badge-primary shadow-md' : 'badge-ghost hover:badge-primary/20 hover:shadow-sm hover:scale-105'}"
			onclick={() => toggleProject(project)}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					toggleProject(project);
				}
			}}
		>
			{project} <span class="ml-1 opacity-70">({taskCounts.get(project) || 0})</span>
		</button>
	{/each}
	{#if filteredProjects.length === 0}
		<span class="text-xs text-base-content/50 italic">No projects found</span>
	{/if}
</div>
