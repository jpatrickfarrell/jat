<script lang="ts">
	/**
	 * CanvasTableView — Inline data table on the canvas with control-driven filtering.
	 *
	 * Fetches rows from /api/data/tables/[name], renders typed cells via DataCell,
	 * and reactively re-fetches when controlValues change.
	 */
	import type { TableViewBlock } from '$lib/types/canvas';
	import type { SemanticType, ColumnConfig } from '$lib/types/dataTable';
	import DataCell from '$lib/components/data/DataCell.svelte';

	let {
		block,
		project = null,
		controlValues = {},
		onBlockUpdate,
	}: {
		block: TableViewBlock;
		project?: string | null;
		controlValues?: Record<string, unknown>;
		onBlockUpdate?: (block: TableViewBlock) => void;
	} = $props();

	// --- Data state ---
	let rows = $state<Record<string, any>[]>([]);
	let schema = $state<{ name: string; type: string }[]>([]);
	let columnMeta = $state<Record<string, { semanticType?: SemanticType; config?: ColumnConfig; displayName?: string }>>({});
	let total = $state(0);
	let loading = $state(false);
	let error = $state<string | null>(null);

	// --- Settings state ---
	let settingsOpen = $state(false);
	let availableTables = $state<string[]>([]);
	let availableColumns = $state<string[]>([]);
	let settingsTableName = $state('');
	let settingsSort = $state<{ column: string; direction: 'ASC' | 'DESC' } | undefined>(undefined);
	let settingsVisibleColumns = $state<string[]>([]);
	let settingsFilters = $state<Record<string, string>>({});
	// New filter being added
	let newFilterColumn = $state('');
	let newFilterControl = $state('');

	// Compute active control names for the filter dropdown
	const activeControlNames = $derived(Object.keys(controlValues));

	// Columns to display (respects visibleColumns if set)
	const displayColumns = $derived.by(() => {
		const cols = schema.filter(c => c.name !== 'rowid');
		if (block.visibleColumns && block.visibleColumns.length > 0) {
			return cols.filter(c => block.visibleColumns!.includes(c.name));
		}
		return cols;
	});

	// Build relevant control values for this block's filters
	const relevantFilterValues = $derived.by(() => {
		const vals: Record<string, string> = {};
		if (!block.controlFilters) return vals;
		for (const [column, controlName] of Object.entries(block.controlFilters)) {
			const cv = controlValues[controlName];
			if (cv !== undefined && cv !== null && cv !== '') {
				vals[column] = String(cv);
			}
		}
		return vals;
	});

	// Fetch data whenever table name, sort, or filter values change
	$effect(() => {
		if (block.tableName && project) {
			// Touch reactive dependencies explicitly
			const _filters = relevantFilterValues;
			const _sort = block.sort;
			const _table = block.tableName;
			fetchRows();
		}
	});

	async function fetchRows() {
		if (!block.tableName || !project) return;

		loading = true;
		error = null;

		try {
			const params = new URLSearchParams({
				project,
				limit: '200',
				resolve: 'true',
			});
			if (block.sort?.column) {
				params.set('orderBy', block.sort.column);
				params.set('orderDir', block.sort.direction || 'ASC');
			}

			const res = await fetch(`/api/data/tables/${encodeURIComponent(block.tableName)}?${params}`);
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Failed to fetch table data');
			}

			const data = await res.json();
			schema = data.schema || [];
			columnMeta = data.columnMeta || {};
			total = data.total || 0;

			// Apply control filters client-side (WHERE column = controlValue)
			let filtered = data.rows || [];
			for (const [column, value] of Object.entries(relevantFilterValues)) {
				filtered = filtered.filter((row: Record<string, any>) => {
					const cellVal = row[column];
					if (cellVal === null || cellVal === undefined) return false;
					// Support comma-separated multi-values from multi-select controls
					const filterVals = String(value).split(',').map(v => v.trim());
					return filterVals.some(fv => String(cellVal).toLowerCase().includes(fv.toLowerCase()));
				});
			}

			rows = filtered;
		} catch (err) {
			error = (err as Error).message;
			rows = [];
		} finally {
			loading = false;
		}
	}

	// --- Settings helpers ---
	async function openSettings() {
		// Initialize settings from block config
		settingsTableName = block.tableName || '';
		settingsSort = block.sort ? { ...block.sort } : undefined;
		settingsVisibleColumns = block.visibleColumns ? [...block.visibleColumns] : [];
		settingsFilters = block.controlFilters ? { ...block.controlFilters } : {};
		newFilterColumn = '';
		newFilterControl = '';

		// Fetch available tables
		if (project) {
			try {
				const res = await fetch(`/api/data/tables?project=${encodeURIComponent(project)}`);
				if (res.ok) {
					const data = await res.json();
					availableTables = (data.tables || []).map((t: any) => t.name).filter((n: string) => !n.startsWith('_'));
				}
			} catch { /* ignore */ }
		}

		// Fetch columns for current table
		if (settingsTableName) {
			await fetchColumnsForTable(settingsTableName);
		}

		settingsOpen = true;
	}

	async function fetchColumnsForTable(tableName: string) {
		if (!project || !tableName) {
			availableColumns = [];
			return;
		}
		try {
			const res = await fetch(`/api/data/tables/${encodeURIComponent(tableName)}?project=${encodeURIComponent(project)}&limit=0`);
			if (res.ok) {
				const data = await res.json();
				availableColumns = (data.schema || []).map((c: any) => c.name).filter((n: string) => n !== 'rowid');
			}
		} catch { availableColumns = []; }
	}

	function handleSettingsTableChange(newTable: string) {
		settingsTableName = newTable;
		settingsVisibleColumns = [];
		settingsFilters = {};
		settingsSort = undefined;
		fetchColumnsForTable(newTable);
	}

	function addControlFilter() {
		if (newFilterColumn && newFilterControl) {
			settingsFilters = { ...settingsFilters, [newFilterColumn]: newFilterControl };
			newFilterColumn = '';
			newFilterControl = '';
		}
	}

	function removeControlFilter(column: string) {
		const { [column]: _, ...rest } = settingsFilters;
		settingsFilters = rest;
	}

	function toggleVisibleColumn(col: string) {
		if (settingsVisibleColumns.includes(col)) {
			settingsVisibleColumns = settingsVisibleColumns.filter(c => c !== col);
		} else {
			settingsVisibleColumns = [...settingsVisibleColumns, col];
		}
	}

	function saveSettings() {
		if (!onBlockUpdate) return;
		const updated: TableViewBlock = {
			...block,
			tableName: settingsTableName,
			controlFilters: settingsFilters,
			visibleColumns: settingsVisibleColumns.length > 0 ? settingsVisibleColumns : undefined,
			sort: settingsSort,
		};
		onBlockUpdate(updated);
		settingsOpen = false;
	}

	function cancelSettings() {
		settingsOpen = false;
	}

	// Column header click to toggle sort
	function toggleSort(colName: string) {
		if (!onBlockUpdate) return;
		let newSort: { column: string; direction: 'ASC' | 'DESC' } | undefined;
		if (block.sort?.column === colName) {
			if (block.sort.direction === 'ASC') {
				newSort = { column: colName, direction: 'DESC' };
			} else {
				newSort = undefined; // third click removes sort
			}
		} else {
			newSort = { column: colName, direction: 'ASC' };
		}
		onBlockUpdate({ ...block, sort: newSort });
	}
</script>

<div class="canvas-table-view">
	<!-- Header -->
	<div class="table-header">
		<div class="flex items-center gap-2">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4" style="color: oklch(0.60 0.15 200);">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5M3.75 3v18M9.75 3v18M15.75 3v18M20.25 3v18" />
			</svg>
			<span class="text-xs font-mono" style="color: oklch(0.65 0.12 200);">
				{block.tableName || 'No table selected'}
			</span>
			{#if rows.length > 0 || total > 0}
				<span class="text-[10px] px-1.5 py-0.5 rounded" style="background: oklch(0.22 0.02 250); color: oklch(0.55 0.02 250);">
					{rows.length}{#if rows.length < total} / {total}{/if} rows
				</span>
			{/if}
			{#if Object.keys(block.controlFilters || {}).length > 0}
				<span class="text-[10px] px-1.5 py-0.5 rounded" style="background: oklch(0.55 0.15 200 / 0.15); color: oklch(0.70 0.12 200);">
					filtered
				</span>
			{/if}
		</div>
		<button
			class="settings-btn"
			onclick={openSettings}
			title="Table settings"
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
		</button>
	</div>

	<!-- Content -->
	{#if !block.tableName}
		<!-- No table configured -->
		<button class="empty-config" onclick={openSettings}>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
			</svg>
			<span>Select a table to display</span>
		</button>
	{:else if loading}
		<!-- Loading skeleton -->
		<div class="table-skeleton">
			<div class="skeleton-header">
				{#each Array(Math.min(displayColumns.length || 3, 5)) as _, i}
					<div class="skeleton h-4 rounded" style="width: {70 + i * 10}px;"></div>
				{/each}
			</div>
			{#each Array(4) as _}
				<div class="skeleton-row">
					{#each Array(Math.min(displayColumns.length || 3, 5)) as _, i}
						<div class="skeleton h-3.5 rounded" style="width: {50 + i * 15}px;"></div>
					{/each}
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="table-error">
			<span>{error}</span>
			<button onclick={fetchRows} class="retry-btn">Retry</button>
		</div>
	{:else if rows.length === 0}
		<div class="table-empty">
			<span>No matching rows</span>
		</div>
	{:else}
		<!-- Data table -->
		<div class="table-scroll">
			<table class="canvas-data-table">
				<thead>
					<tr>
						{#each displayColumns as col}
							{@const meta = columnMeta[col.name]}
							{@const isSorted = block.sort?.column === col.name}
							<th
								class="canvas-th"
								class:sorted={isSorted}
								onclick={() => toggleSort(col.name)}
								title="Click to sort by {meta?.displayName || col.name}"
							>
								<span class="th-label">{meta?.displayName || col.name}</span>
								{#if isSorted}
									<span class="sort-arrow">{block.sort?.direction === 'DESC' ? '↓' : '↑'}</span>
								{/if}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each rows as row}
						<tr class="canvas-tr">
							{#each displayColumns as col}
								{@const meta = columnMeta[col.name]}
								<td class="canvas-td">
									<DataCell
										value={row[col.name]}
										semanticType={meta?.semanticType}
										config={meta?.config || {}}
										editing={false}
										selected={false}
										row={meta?.semanticType === 'formula' ? row : undefined}
										allRows={meta?.semanticType === 'formula' ? rows : undefined}
										selectedProject={meta?.semanticType === 'relation' ? project : undefined}
										onSave={() => {}}
									/>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Settings Popover -->
{#if settingsOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="settings-overlay" onclick={cancelSettings}></div>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="settings-panel" onclick={(e) => e.stopPropagation()}>
		<div class="settings-title">Table View Settings</div>

		<!-- Table Selection -->
		<div class="settings-field">
			<label class="settings-label">Table</label>
			<select
				class="settings-select"
				bind:value={settingsTableName}
				onchange={(e) => handleSettingsTableChange((e.target as HTMLSelectElement).value)}
			>
				<option value="">— Select table —</option>
				{#each availableTables as t}
					<option value={t}>{t}</option>
				{/each}
			</select>
		</div>

		<!-- Visible Columns -->
		{#if availableColumns.length > 0}
			<div class="settings-field">
				<label class="settings-label">Visible Columns <span class="settings-hint">(none = all)</span></label>
				<div class="column-checkboxes">
					{#each availableColumns as col}
						<label class="column-checkbox">
							<input
								type="checkbox"
								checked={settingsVisibleColumns.includes(col)}
								onchange={() => toggleVisibleColumn(col)}
							/>
							<span>{col}</span>
						</label>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Sort -->
		{#if availableColumns.length > 0}
			<div class="settings-field">
				<label class="settings-label">Sort</label>
				<div class="flex gap-2">
					<select
						class="settings-select flex-1"
						value={settingsSort?.column || ''}
						onchange={(e) => {
							const val = (e.target as HTMLSelectElement).value;
							settingsSort = val ? { column: val, direction: settingsSort?.direction || 'ASC' } : undefined;
						}}
					>
						<option value="">— None —</option>
						{#each availableColumns as col}
							<option value={col}>{col}</option>
						{/each}
					</select>
					{#if settingsSort?.column}
						<select
							class="settings-select"
							value={settingsSort?.direction || 'ASC'}
							onchange={(e) => {
								if (settingsSort) {
									settingsSort = { ...settingsSort, direction: (e.target as HTMLSelectElement).value as 'ASC' | 'DESC' };
								}
							}}
						>
							<option value="ASC">ASC</option>
							<option value="DESC">DESC</option>
						</select>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Control Filters -->
		<div class="settings-field">
			<label class="settings-label">Control Filters</label>
			{#if Object.keys(settingsFilters).length > 0}
				<div class="filter-list">
					{#each Object.entries(settingsFilters) as [col, ctrl]}
						<div class="filter-item">
							<span class="filter-col">{col}</span>
							<span class="filter-arrow">←</span>
							<span class="filter-ctrl">{ctrl}</span>
							<button class="filter-remove" onclick={() => removeControlFilter(col)} title="Remove filter">×</button>
						</div>
					{/each}
				</div>
			{/if}
			{#if availableColumns.length > 0 && activeControlNames.length > 0}
				<div class="flex gap-2 mt-1.5">
					<select class="settings-select flex-1" bind:value={newFilterColumn}>
						<option value="">Column…</option>
						{#each availableColumns.filter(c => !(c in settingsFilters)) as col}
							<option value={col}>{col}</option>
						{/each}
					</select>
					<select class="settings-select flex-1" bind:value={newFilterControl}>
						<option value="">Control…</option>
						{#each activeControlNames as name}
							<option value={name}>{name}</option>
						{/each}
					</select>
					<button
						class="add-filter-btn"
						onclick={addControlFilter}
						disabled={!newFilterColumn || !newFilterControl}
					>+</button>
				</div>
			{:else if activeControlNames.length === 0}
				<div class="text-[10px] mt-1" style="color: oklch(0.45 0.02 250);">Add controls above to enable filtering</div>
			{/if}
		</div>

		<!-- Actions -->
		<div class="settings-actions">
			<button class="settings-cancel" onclick={cancelSettings}>Cancel</button>
			<button class="settings-save" onclick={saveSettings}>Save</button>
		</div>
	</div>
{/if}

<style>
	.canvas-table-view {
		position: relative;
	}

	.table-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	.settings-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		border-radius: 0.25rem;
		border: none;
		background: transparent;
		color: oklch(0.45 0.02 250);
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.15s, color 0.15s, background 0.15s;
	}

	.canvas-table-view:hover .settings-btn {
		opacity: 1;
	}

	.settings-btn:hover {
		background: oklch(0.25 0.02 250);
		color: oklch(0.70 0.12 200);
	}

	/* Empty / unconfigured state */
	.empty-config {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: 100%;
		padding: 1rem;
		border-radius: 0.375rem;
		border: 1px dashed oklch(0.30 0.02 250);
		background: transparent;
		color: oklch(0.50 0.02 250);
		font-size: 0.75rem;
		cursor: pointer;
		transition: border-color 0.15s, color 0.15s, background 0.15s;
	}

	.empty-config:hover {
		border-color: oklch(0.70 0.18 240 / 0.5);
		background: oklch(0.70 0.18 240 / 0.06);
		color: oklch(0.75 0.15 240);
	}

	/* Loading skeleton */
	.table-skeleton {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.5rem;
	}

	.skeleton-header {
		display: flex;
		gap: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid oklch(0.22 0.02 250);
	}

	.skeleton-row {
		display: flex;
		gap: 1rem;
		padding: 0.25rem 0;
	}

	.skeleton {
		background: oklch(0.22 0.02 250);
		animation: skeleton-pulse 2s ease-in-out infinite;
	}

	/* Error state */
	.table-error {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		background: oklch(0.50 0.12 30 / 0.1);
		color: oklch(0.70 0.15 30);
		font-size: 0.75rem;
	}

	.retry-btn {
		padding: 0.125rem 0.5rem;
		border-radius: 0.25rem;
		border: 1px solid oklch(0.55 0.15 30 / 0.3);
		background: transparent;
		color: oklch(0.70 0.15 30);
		font-size: 0.6875rem;
		cursor: pointer;
	}

	.retry-btn:hover {
		background: oklch(0.55 0.15 30 / 0.15);
	}

	/* Empty results */
	.table-empty {
		padding: 1rem;
		text-align: center;
		font-size: 0.75rem;
		color: oklch(0.45 0.02 250);
	}

	/* Table */
	.table-scroll {
		overflow-x: auto;
		border-radius: 0.375rem;
		border: 1px solid oklch(0.22 0.02 250);
	}

	.canvas-data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.75rem;
	}

	.canvas-th {
		text-align: left;
		padding: 0.375rem 0.625rem;
		font-size: 0.6875rem;
		font-weight: 600;
		color: oklch(0.55 0.02 250);
		background: oklch(0.17 0.01 250);
		border-bottom: 1px solid oklch(0.25 0.02 250);
		white-space: nowrap;
		cursor: pointer;
		user-select: none;
		transition: color 0.1s;
	}

	.canvas-th:hover {
		color: oklch(0.70 0.12 200);
	}

	.canvas-th.sorted {
		color: oklch(0.70 0.15 200);
	}

	.th-label {
		margin-right: 0.25rem;
	}

	.sort-arrow {
		font-size: 0.625rem;
		opacity: 0.8;
	}

	.canvas-tr {
		transition: background 0.1s;
	}

	.canvas-tr:hover {
		background: oklch(0.18 0.01 250);
	}

	.canvas-td {
		padding: 0.3125rem 0.625rem;
		border-bottom: 1px solid oklch(0.20 0.01 250);
		color: oklch(0.80 0.02 250);
		max-width: 250px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Settings overlay */
	.settings-overlay {
		position: fixed;
		inset: 0;
		z-index: 49;
	}

	.settings-panel {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 50;
		width: 320px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		padding: 0.875rem;
		box-shadow: 0 8px 32px oklch(0 0 0 / 0.5);
		animation: animate-scale-in 0.12s ease-out;
	}

	.settings-title {
		font-size: 0.8125rem;
		font-weight: 600;
		color: oklch(0.80 0.02 250);
		margin-bottom: 0.75rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.settings-field {
		margin-bottom: 0.75rem;
	}

	.settings-label {
		display: block;
		font-size: 0.6875rem;
		font-weight: 600;
		color: oklch(0.60 0.02 250);
		margin-bottom: 0.25rem;
	}

	.settings-hint {
		font-weight: 400;
		color: oklch(0.45 0.02 250);
	}

	.settings-select {
		width: 100%;
		padding: 0.3125rem 0.5rem;
		border-radius: 0.25rem;
		border: 1px solid oklch(0.28 0.02 250);
		background: oklch(0.15 0.01 250);
		color: oklch(0.80 0.02 250);
		font-size: 0.75rem;
		outline: none;
	}

	.settings-select:focus {
		border-color: oklch(0.60 0.15 200);
	}

	/* Column checkboxes */
	.column-checkboxes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.625rem;
		max-height: 120px;
		overflow-y: auto;
	}

	.column-checkbox {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.6875rem;
		color: oklch(0.70 0.02 250);
		cursor: pointer;
	}

	.column-checkbox input {
		accent-color: oklch(0.60 0.15 200);
	}

	/* Control filter list */
	.filter-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 0.375rem;
	}

	.filter-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		background: oklch(0.22 0.02 250);
		font-size: 0.6875rem;
	}

	.filter-col {
		color: oklch(0.70 0.12 200);
		font-family: monospace;
	}

	.filter-arrow {
		color: oklch(0.40 0.02 250);
		font-size: 0.625rem;
	}

	.filter-ctrl {
		color: oklch(0.70 0.12 280);
		font-family: monospace;
	}

	.filter-remove {
		margin-left: auto;
		padding: 0 0.25rem;
		border: none;
		background: transparent;
		color: oklch(0.50 0.02 250);
		cursor: pointer;
		font-size: 0.8125rem;
		line-height: 1;
	}

	.filter-remove:hover {
		color: oklch(0.70 0.15 30);
	}

	.add-filter-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		flex-shrink: 0;
		border-radius: 0.25rem;
		border: 1px solid oklch(0.28 0.02 250);
		background: oklch(0.20 0.02 250);
		color: oklch(0.60 0.02 250);
		font-size: 0.875rem;
		cursor: pointer;
	}

	.add-filter-btn:hover:not(:disabled) {
		background: oklch(0.60 0.15 200 / 0.15);
		border-color: oklch(0.60 0.15 200 / 0.4);
		color: oklch(0.70 0.12 200);
	}

	.add-filter-btn:disabled {
		opacity: 0.3;
		cursor: default;
	}

	/* Settings actions */
	.settings-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid oklch(0.25 0.02 250);
	}

	.settings-cancel {
		padding: 0.3125rem 0.75rem;
		border-radius: 0.25rem;
		border: 1px solid oklch(0.28 0.02 250);
		background: transparent;
		color: oklch(0.60 0.02 250);
		font-size: 0.6875rem;
		cursor: pointer;
	}

	.settings-cancel:hover {
		background: oklch(0.22 0.02 250);
	}

	.settings-save {
		padding: 0.3125rem 0.75rem;
		border-radius: 0.25rem;
		border: 1px solid oklch(0.55 0.15 200 / 0.4);
		background: oklch(0.55 0.15 200 / 0.15);
		color: oklch(0.75 0.12 200);
		font-size: 0.6875rem;
		cursor: pointer;
	}

	.settings-save:hover {
		background: oklch(0.55 0.15 200 / 0.25);
	}

	@keyframes animate-scale-in {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}
</style>
