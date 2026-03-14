<script lang="ts">
	import type { RelationConfig } from '$lib/types/dataTable';
	import { tick } from 'svelte';

	let {
		value = null,
		config = { targetTable: '', displayColumn: '', multiSelect: false },
		editing: editingProp = false,
		selectedProject = null,
		onSave,
	}: {
		value: any;
		config?: RelationConfig;
		editing?: boolean;
		selectedProject?: string | null;
		onSave: (val: any) => void;
	} = $props();

	let editing = $state(false);
	let searchQuery = $state('');
	let targetRows = $state<Record<string, any>[]>([]);
	let loading = $state(false);
	let selectedValues = $state<Set<string>>(new Set());
	let inputRef = $state<HTMLInputElement | null>(null);
	let dropdownRef = $state<HTMLDivElement | null>(null);
	let dropdownStyle = $state('');

	$effect(() => {
		if (editingProp && !editing) startEdit();
	});

	// Close dropdown when clicking outside
	$effect(() => {
		if (!editing) return;
		function handleOutsideClick(e: MouseEvent) {
			if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
				closeDropdown();
			}
		}
		// Use capture phase + setTimeout so the click that opened us doesn't immediately close
		const timer = setTimeout(() => {
			document.addEventListener('mousedown', handleOutsideClick, true);
		}, 0);
		return () => {
			clearTimeout(timer);
			document.removeEventListener('mousedown', handleOutsideClick, true);
		};
	});

	// Parse stored value (comma-separated rowids for multi, single rowid for single)
	const storedValues = $derived.by<string[]>(() => {
		if (!value) return [];
		return String(value).split(',').map((v: string) => v.trim()).filter(Boolean);
	});

	// Fetch display labels for stored values
	let displayLabels = $state<Map<string, string>>(new Map());

	$effect(() => {
		if (config.targetTable && config.displayColumn && selectedProject) {
			fetchDisplayLabels();
		}
	});

	async function fetchDisplayLabels() {
		if (!config.targetTable || !config.displayColumn || !selectedProject) return;
		try {
			const res = await fetch(
				`/api/data/tables/${encodeURIComponent(config.targetTable)}?project=${encodeURIComponent(selectedProject)}&limit=999`
			);
			if (!res.ok) return;
			const data = await res.json();
			const rows = data.rows || [];
			const map = new Map<string, string>();
			for (const row of rows) {
				map.set(String(row.rowid), row[config.displayColumn] ?? `Row ${row.rowid}`);
			}
			displayLabels = map;
		} catch { /* ignore */ }
	}

	function updateDropdownPosition() {
		if (!inputRef) return;
		const rect = inputRef.getBoundingClientRect();
		const spaceBelow = window.innerHeight - rect.bottom;
		const maxH = 200;
		// If not enough room below, open above
		if (spaceBelow < maxH + 10) {
			dropdownStyle = `position:fixed; left:${rect.left}px; bottom:${window.innerHeight - rect.top + 2}px; width:${rect.width}px; max-height:${Math.min(maxH, rect.top - 10)}px;`;
		} else {
			dropdownStyle = `position:fixed; left:${rect.left}px; top:${rect.bottom + 2}px; width:${rect.width}px; max-height:${maxH}px;`;
		}
	}

	async function startEdit() {
		editing = true;
		searchQuery = '';
		selectedValues = new Set(storedValues);
		fetchTargetRows();
		// Focus input after Svelte renders the dropdown
		await tick();
		inputRef?.focus();
		updateDropdownPosition();
	}

	function closeDropdown() {
		if (!editing) return;
		if (config.multiSelect) {
			editing = false;
			const val = [...selectedValues].join(',');
			onSave(val || null);
		} else {
			editing = false;
			onSave(value);
		}
	}

	async function fetchTargetRows() {
		if (!config.targetTable || !selectedProject) return;
		loading = true;
		try {
			const res = await fetch(
				`/api/data/tables/${encodeURIComponent(config.targetTable)}?project=${encodeURIComponent(selectedProject)}&limit=999`
			);
			if (!res.ok) { loading = false; return; }
			const data = await res.json();
			targetRows = data.rows || [];
		} catch { /* ignore */ }
		loading = false;
	}

	const filteredRows = $derived(
		targetRows.filter(row => {
			if (!searchQuery.trim()) return true;
			const displayVal = String(row[config.displayColumn] ?? '').toLowerCase();
			return displayVal.includes(searchQuery.toLowerCase());
		})
	);

	function selectRow(rowid: string) {
		if (config.multiSelect) {
			const updated = new Set(selectedValues);
			if (updated.has(rowid)) {
				updated.delete(rowid);
			} else {
				updated.add(rowid);
			}
			selectedValues = updated;
		} else {
			// Single select — save immediately
			editing = false;
			onSave(rowid);
		}
	}

	function confirmMultiSelect() {
		editing = false;
		const val = [...selectedValues].join(',');
		onSave(val || null);
	}

	function clearValue() {
		editing = false;
		onSave(null);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			closeDropdown();
		}
	}

	// Display text for view mode
	const displayText = $derived.by(() => {
		const vals = storedValues;
		if (vals.length === 0) return null;
		return vals.map((v: string) => displayLabels.get(v) ?? `#${v}`).join(', ');
	});
</script>

{#if editing}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- Stop propagation so clicks inside don't reach the table cell's onclick -->
	<div
		class="relation-dropdown"
		bind:this={dropdownRef}
		onclick={(e) => e.stopPropagation()}
		onmousedown={(e) => e.stopPropagation()}
		onkeydown={handleKeydown}
	>
		<div class="relation-search">
			<input
				type="text"
				class="search-input"
				placeholder="Search {config.targetTable}..."
				bind:value={searchQuery}
				bind:this={inputRef}
			/>
			{#if value}
				<button class="clear-btn" onclick={clearValue} title="Clear">×</button>
			{/if}
		</div>
		<div class="relation-options" style={dropdownStyle}>
			{#if loading}
				<div class="relation-loading">Loading...</div>
			{:else if !config.targetTable}
				<div class="relation-empty">No target table configured</div>
			{:else if filteredRows.length === 0}
				<div class="relation-empty">No matching rows</div>
			{:else}
				{#each filteredRows as row}
					{@const rowId = String(row.rowid)}
					{@const isSelected = selectedValues.has(rowId)}
					<button
						class="relation-option"
						class:selected={isSelected}
						onclick={() => selectRow(rowId)}
					>
						{#if config.multiSelect}
							<span class="check-box" class:checked={isSelected}>
								{isSelected ? '☑' : '☐'}
							</span>
						{/if}
						<span class="option-label">{row[config.displayColumn] ?? `Row ${row.rowid}`}</span>
					</button>
				{/each}
			{/if}
			{#if config.multiSelect && selectedValues.size > 0}
				<div class="relation-footer">
					<button class="done-btn" onclick={confirmMultiSelect}>
						Done ({selectedValues.size} selected)
					</button>
				</div>
			{/if}
		</div>
	</div>
{:else if displayText}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span class="relation-badge" ondblclick={startEdit}>
		{displayText}
	</span>
{:else}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span class="cell-value null-value" ondblclick={startEdit}>NULL</span>
{/if}

<style>
	.relation-dropdown {
		position: relative;
		width: 100%;
	}
	.relation-search {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	.search-input {
		flex: 1;
		padding: 0.125rem 0.25rem;
		font-size: 0.8125rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.50 0.10 200);
		border-radius: 0.1875rem;
		color: oklch(0.90 0.02 250);
		outline: none;
		box-sizing: border-box;
	}
	.clear-btn {
		background: none;
		border: none;
		color: oklch(0.55 0.02 250);
		cursor: pointer;
		font-size: 0.875rem;
		padding: 0 0.125rem;
		line-height: 1;
	}
	.clear-btn:hover {
		color: oklch(0.80 0.15 25);
	}
	.relation-options {
		/* position: fixed is set via inline style with computed coordinates */
		overflow-y: auto;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.25rem;
		z-index: 9999;
		box-shadow: 0 4px 12px oklch(0 0 0 / 0.4);
	}
	.relation-option {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		width: 100%;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		color: oklch(0.85 0.02 250);
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
	}
	.relation-option:hover {
		background: oklch(0.22 0.02 250);
	}
	.relation-option.selected {
		background: oklch(0.25 0.06 200 / 0.3);
		color: oklch(0.90 0.08 200);
	}
	.check-box {
		font-size: 0.75rem;
		color: oklch(0.50 0.02 250);
	}
	.check-box.checked {
		color: oklch(0.70 0.15 200);
	}
	.relation-loading,
	.relation-empty {
		padding: 0.5rem;
		font-size: 0.6875rem;
		color: oklch(0.50 0.02 250);
		text-align: center;
		font-style: italic;
	}
	.relation-footer {
		padding: 0.25rem 0.5rem;
		border-top: 1px solid oklch(0.25 0.02 250);
		background: oklch(0.16 0.01 250);
	}
	.done-btn {
		width: 100%;
		padding: 0.25rem 0.5rem;
		font-size: 0.6875rem;
		background: oklch(0.40 0.12 200);
		border: 1px solid oklch(0.50 0.14 200);
		color: oklch(0.95 0.02 200);
		border-radius: 0.25rem;
		cursor: pointer;
	}
	.done-btn:hover {
		background: oklch(0.45 0.14 200);
	}
	.relation-badge {
		display: inline-block;
		padding: 0.0625rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		white-space: nowrap;
		background: oklch(0.30 0.08 200 / 0.5);
		color: oklch(0.85 0.10 200);
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.relation-badge:hover {
		background: oklch(0.35 0.10 200 / 0.6);
	}
</style>
