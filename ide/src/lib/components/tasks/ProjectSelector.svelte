<script lang="ts">
	/**
	 * ProjectSelector — Branded project dropdown
	 *
	 * Shows selected project as a colored chip. Click to reveal SearchDropdown.
	 * Fetches project colors from API with 30s cache.
	 */
	import { onMount } from 'svelte';
	import { fetchAndGetProjectColors, getProjectColor } from '$lib/utils/projectColors';
	import { openProjectDrawer } from '$lib/stores/drawerStore';
	import SearchDropdown from '$lib/components/SearchDropdown.svelte';
	import type { SearchDropdownGroup } from '$lib/components/SearchDropdown.svelte';

	interface Props {
		projects: string[];
		selected: string;
		onSelect: (project: string) => void;
		disabled?: boolean;
		variant?: 'default' | 'chip';
	}

	let {
		projects = [],
		selected = '',
		onSelect,
		disabled = false,
		variant = 'default',
	}: Props = $props();

	let projectColors = $state<Record<string, string>>({});

	onMount(async () => {
		projectColors = await fetchAndGetProjectColors();
	});

	function getColor(project: string): string {
		return projectColors[project.toLowerCase()] || getProjectColor(project + '-x');
	}

	const groups = $derived.by<SearchDropdownGroup[]>(() => [{
		label: 'Projects',
		options: projects.map(p => ({ value: p, label: p }))
	}]);
</script>

<SearchDropdown
	value={selected}
	{groups}
	placeholder="Select project"
	{disabled}
	{variant}
	colorFn={(v) => getColor(v)}
	onChange={onSelect}
>
	{#snippet footer()}
		<button
			type="button"
			class="sd-add-project"
			onclick={(e) => { e.stopPropagation(); openProjectDrawer(); }}
		>
			<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
			</svg>
			<span>Add Project</span>
		</button>
	{/snippet}
</SearchDropdown>

<style>
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
</style>
