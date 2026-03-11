<script lang="ts">
	/**
	 * BaseAttachChips - Chip selector for attaching bases to tasks.
	 * Reusable in TaskCreationDrawer and TaskDetailDrawer.
	 */
	import type { KnowledgeBase } from '$lib/types/knowledgeBase';
	import { SOURCE_TYPE_INFO } from '$lib/types/knowledgeBase';
	import { getBases, isStoreInitialized, initializeStore, getCurrentProject } from '$lib/stores/bases.svelte';

	interface Props {
		selectedIds?: string[];
		project?: string | null;
		onChange?: (ids: string[]) => void;
		compact?: boolean;
		class?: string;
	}

	let { selectedIds = $bindable([]), project = null, onChange, compact = false, class: className = '' }: Props = $props();

	let showDropdown = $state(false);

	// Ensure store is initialized for the correct project
	$effect(() => {
		if (project && (!isStoreInitialized() || getCurrentProject() !== project)) {
			initializeStore(project);
		}
	});

	const allBases = $derived(getBases());
	const selectedBases = $derived(allBases.filter(b => selectedIds.includes(b.id)));
	const availableBases = $derived(allBases.filter(b => !selectedIds.includes(b.id)));

	function getSourceIcon(type: string): string {
		return SOURCE_TYPE_INFO.find(s => s.type === type)?.icon || '📄';
	}

	function addBase(id: string) {
		selectedIds = [...selectedIds, id];
		onChange?.(selectedIds);
	}

	function removeBase(id: string) {
		selectedIds = selectedIds.filter(i => i !== id);
		onChange?.(selectedIds);
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('.base-attach-dropdown')) {
			showDropdown = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="relative base-attach-dropdown {className}">
	<!-- Selected chips -->
	<div class="flex flex-wrap items-center gap-1">
		{#each selectedBases as base (base.id)}
			<span
				class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
				style="background: oklch(0.28 0.04 240 / 0.4); color: oklch(0.80 0.10 240); border: 1px solid oklch(0.40 0.10 240 / 0.3);"
			>
				<span>{getSourceIcon(base.source_type)}</span>
				<span class="truncate max-w-[120px]">{base.name}</span>
				<button
					type="button"
					class="ml-0.5 hover:text-error"
					onclick={() => removeBase(base.id)}
				>
					<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</span>
		{/each}

		<!-- Add button (always visible) -->
		<button
			type="button"
			class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors"
			style="background: oklch(0.22 0.01 250); color: oklch(0.60 0.01 250); border: 1px dashed oklch(0.35 0.01 250);"
			onclick={(e) => { e.stopPropagation(); showDropdown = !showDropdown; }}
		>
			<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
			</svg>
			{compact ? '' : 'Knowledge'}
		</button>
	</div>

	<!-- Dropdown -->
	{#if showDropdown}
		<div
			class="absolute top-full left-0 mt-1 w-64 max-h-48 overflow-auto rounded-lg border shadow-lg z-40"
			style="background: oklch(0.18 0.01 250); border-color: oklch(0.30 0.02 250);"
		>
			{#each availableBases as base (base.id)}
				<button
					type="button"
					class="w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors hover:bg-base-300"
					onclick={() => { addBase(base.id); showDropdown = false; }}
				>
					<span>{getSourceIcon(base.source_type)}</span>
					<span class="flex-1 truncate" style="color: oklch(0.80 0.01 250);">{base.name}</span>
					{#if base.token_estimate}
						<span style="color: oklch(0.50 0.01 250);">~{Math.round(base.token_estimate / 1000)}K</span>
					{/if}
				</button>
			{/each}
			{#if availableBases.length === 0}
				<p class="px-3 py-2 text-xs" style="color: oklch(0.50 0.01 250);">No more bases available</p>
			{/if}
		</div>
	{/if}
</div>
