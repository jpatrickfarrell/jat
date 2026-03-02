<script lang="ts">
	/**
	 * DataTableAttachChips - Chip selector for attaching data tables to tasks.
	 * Mirrors BaseAttachChips but for data tables from the /data system.
	 */

	interface DataTable {
		name: string;
		display_name?: string;
		description?: string;
		row_count?: number;
		column_count?: number;
	}

	interface Props {
		selectedTables?: string[];
		project?: string | null;
		onChange?: (tables: string[]) => void;
		compact?: boolean;
		class?: string;
	}

	let { selectedTables = $bindable([]), project = null, onChange, compact = false, class: className = '' }: Props = $props();

	let showDropdown = $state(false);
	let allTables = $state<DataTable[]>([]);

	// Fetch available data tables when project changes
	$effect(() => {
		if (project) {
			fetchTables(project);
		}
	});

	async function fetchTables(proj: string) {
		try {
			const res = await fetch(`/api/data/tables?project=${encodeURIComponent(proj)}`);
			if (res.ok) {
				const data = await res.json();
				allTables = data.tables || [];
			}
		} catch {
			// Silently fail — tables list just stays empty
		}
	}

	const selectedTableObjs = $derived(allTables.filter(t => selectedTables.includes(t.name)));
	const availableTables = $derived(allTables.filter(t => !selectedTables.includes(t.name)));

	function addTable(name: string) {
		selectedTables = [...selectedTables, name];
		onChange?.(selectedTables);
	}

	function removeTable(name: string) {
		selectedTables = selectedTables.filter(n => n !== name);
		onChange?.(selectedTables);
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('.table-attach-dropdown')) {
			showDropdown = false;
		}
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="relative table-attach-dropdown {className}">
	<!-- Selected chips -->
	<div class="flex flex-wrap items-center gap-1">
		{#each selectedTableObjs as table (table.name)}
			<span
				class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
				style="background: oklch(0.28 0.04 145 / 0.4); color: oklch(0.80 0.10 145); border: 1px solid oklch(0.40 0.10 145 / 0.3);"
			>
				<span>🗃️</span>
				<span class="truncate max-w-[120px]">{table.display_name || table.name}</span>
				<button
					type="button"
					class="ml-0.5 hover:text-error"
					onclick={() => removeTable(table.name)}
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
			{compact ? '' : 'Data Table'}
		</button>
	</div>

	<!-- Dropdown -->
	{#if showDropdown}
		<div
			class="absolute top-full left-0 mt-1 w-64 max-h-48 overflow-auto rounded-lg border shadow-lg z-40"
			style="background: oklch(0.18 0.01 250); border-color: oklch(0.30 0.02 250);"
		>
			{#each availableTables as table (table.name)}
				<button
					type="button"
					class="w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors hover:bg-base-300"
					onclick={() => { addTable(table.name); showDropdown = false; }}
				>
					<span>🗃️</span>
					<span class="flex-1 truncate" style="color: oklch(0.80 0.01 250);">{table.display_name || table.name}</span>
					{#if table.row_count != null}
						<span style="color: oklch(0.50 0.01 250);">{table.row_count} rows</span>
					{/if}
				</button>
			{/each}
			{#if availableTables.length === 0}
				<p class="px-3 py-2 text-xs" style="color: oklch(0.50 0.01 250);">No more tables available</p>
			{/if}
		</div>
	{/if}
</div>
