<script lang="ts">
	import { tick } from 'svelte';

	interface Props {
		columnOrder: string[];
		hiddenColumns: Set<string>;
		getLabel: (id: string) => string;
		onReorder: (newOrder: string[]) => void;
		onToggleVisibility: (id: string) => void;
	}

	let {
		columnOrder,
		hiddenColumns,
		getLabel,
		onReorder,
		onToggleVisibility,
	}: Props = $props();

	// Internal open/search state
	let mcOpen = $state(false);
	let mcSearch = $state('');
	let mcSearchInput: HTMLInputElement | undefined = $state();

	// Auto-focus the search input when opened
	$effect(() => {
		if (mcOpen) tick().then(() => mcSearchInput?.focus());
	});

	// Drag-to-reorder state (disabled while searching)
	let mcDraggedIndex = $state<number | null>(null);
	let mcDragOverIndex = $state<number | null>(null);

	function handleDragStart(index: number, e: DragEvent) {
		mcDraggedIndex = index;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', String(index));
		}
	}

	function handleDragOver(index: number, e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		mcDragOverIndex = index;
	}

	function handleDragEnd() {
		mcDraggedIndex = null;
		mcDragOverIndex = null;
	}

	function handleDrop(index: number, e: DragEvent) {
		e.preventDefault();
		if (mcDraggedIndex === null || mcDraggedIndex === index) {
			handleDragEnd();
			return;
		}
		const newOrder = [...columnOrder];
		const [moved] = newOrder.splice(mcDraggedIndex, 1);
		newOrder.splice(index, 0, moved);
		onReorder(newOrder);
		handleDragEnd();
	}

	function closeDropdown() {
		mcOpen = false;
		mcSearch = '';
	}

	const filteredOrder = $derived.by(() => {
		if (!mcSearch) return columnOrder;
		const q = mcSearch.toLowerCase();
		return columnOrder.filter(id => getLabel(id).toLowerCase().includes(q));
	});

	const hasNoMatches = $derived.by(() => {
		return mcSearch.length > 0 && filteredOrder.length === 0;
	});
</script>

<div class="mc-wrapper">
	<button class="mc-trigger" onclick={() => { mcOpen = !mcOpen; if (!mcOpen) mcSearch = ''; }}>
		<span>Columns</span>
		<svg class="mc-chevron" class:mc-chevron-open={mcOpen} viewBox="0 0 20 20" fill="currentColor">
			<path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
		</svg>
	</button>

	{#if mcOpen}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0 z-40" onclick={closeDropdown} onkeydown={() => {}}></div>
		<div class="mc-dropdown">
			<div class="mc-search">
				<svg class="mc-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
				</svg>
				<input
					bind:this={mcSearchInput}
					bind:value={mcSearch}
					type="text"
					placeholder="Filter columns..."
					class="mc-search-input"
					onkeydown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); closeDropdown(); } }}
					autocomplete="off"
				/>
				{#if mcSearch}
					<button type="button" aria-label="Clear search" class="mc-search-clear" onclick={() => { mcSearch = ''; mcSearchInput?.focus(); }}>
						<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				{/if}
			</div>

			{#each columnOrder as colId, i}
				{#if !mcSearch || getLabel(colId).toLowerCase().includes(mcSearch.toLowerCase())}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="mc-row"
						class:mc-drag-over={mcDragOverIndex === i && mcDraggedIndex !== null && mcDraggedIndex !== i}
						draggable={!mcSearch}
						ondragstart={(e) => !mcSearch && handleDragStart(i, e)}
						ondragover={(e) => !mcSearch && handleDragOver(i, e)}
						ondragend={() => !mcSearch && handleDragEnd()}
						ondrop={(e) => !mcSearch && handleDrop(i, e)}
					>
						<span class="mc-grip" class:mc-grip-disabled={!!mcSearch}>⠿</span>
						<label class="mc-label">
							<input
								type="checkbox"
								checked={!hiddenColumns.has(colId)}
								onchange={() => onToggleVisibility(colId)}
							/>
							{getLabel(colId)}
						</label>
					</div>
				{/if}
			{/each}

			{#if hasNoMatches}
				<div class="mc-empty">No columns match "{mcSearch}"</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.mc-wrapper {
		position: relative;
	}
	.mc-trigger {
		padding: 0.25rem 0.5rem;
		border-radius: 0.5rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.8125rem;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		min-height: 2rem;
		cursor: pointer;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		color: oklch(0.85 0.02 250);
		transition: background 0.15s, border-color 0.15s;
		white-space: nowrap;
	}
	.mc-trigger:hover {
		background: oklch(0.18 0.01 250);
		border-color: oklch(0.30 0.02 250);
	}
	.mc-chevron {
		width: 14px;
		height: 14px;
		opacity: 0.5;
		transition: transform 0.15s;
	}
	.mc-chevron-open {
		transform: rotate(180deg);
	}
	.mc-dropdown {
		position: absolute;
		top: calc(100% + 4px);
		right: 0;
		z-index: 50;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.375rem;
		box-shadow: 0 8px 24px oklch(0 0 0 / 0.4);
		padding: 0;
		min-width: 180px;
		max-height: 320px;
		overflow-y: auto;
	}
	.mc-search {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.625rem;
		border-bottom: 1px solid oklch(0.22 0.02 250);
		position: sticky;
		top: 0;
		background: oklch(0.16 0.01 250);
	}
	.mc-search-icon {
		width: 0.75rem;
		height: 0.75rem;
		flex-shrink: 0;
		color: oklch(0.45 0.02 250);
	}
	.mc-search-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		font-size: 0.625rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		color: oklch(0.80 0.02 250);
	}
	.mc-search-input::placeholder {
		color: oklch(0.40 0.02 250);
	}
	.mc-search-clear {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		display: flex;
		color: oklch(0.40 0.02 250);
	}
	.mc-search-clear:hover { opacity: 0.8; }
	.mc-empty {
		padding: 0.5rem 0.75rem;
		font-size: 0.625rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		color: oklch(0.45 0.02 250);
		text-align: center;
	}
	.mc-grip-disabled {
		opacity: 0.2;
		cursor: default;
	}
	.mc-row {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.625rem;
		cursor: grab;
		transition: background 0.1s;
	}
	.mc-row:hover {
		background: oklch(0.22 0.02 250);
	}
	.mc-row.mc-drag-over {
		border-top: 2px solid oklch(0.60 0.15 220);
	}
	.mc-grip {
		color: oklch(0.40 0.02 250);
		font-size: 0.75rem;
		cursor: grab;
		user-select: none;
	}
	.mc-label {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: oklch(0.80 0.02 250);
		cursor: pointer;
		user-select: none;
		flex: 1;
	}
	.mc-label input[type="checkbox"] {
		accent-color: oklch(0.60 0.15 220);
	}
</style>
