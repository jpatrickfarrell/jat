<script lang="ts">
	/**
	 * CanvasSelectControl - Interactive select dropdown for canvas controls
	 *
	 * Renders as a compact chip: [control name] [selected value ▼]
	 * Dropdown fetches rows from a data table to populate options.
	 * Settings popover allows configuring name, source table, display column, multi-select.
	 */
	import type { ControlBlock, SelectControlConfig } from '$lib/types/canvas';
	import { tick } from 'svelte';

	let {
		block,
		project,
		existingNames = [],
		onBlockUpdate,
		onControlChange,
	}: {
		block: ControlBlock;
		project: string | null;
		existingNames?: string[];
		onBlockUpdate: (updated: ControlBlock) => void;
		onControlChange: (controlName: string, value: unknown) => void;
	} = $props();

	const config = $derived((block.config || {}) as SelectControlConfig);

	// Dropdown state
	let dropdownOpen = $state(false);
	let searchQuery = $state('');
	let targetRows = $state<Record<string, any>[]>([]);
	let loading = $state(false);
	let selectedValues = $state<Set<string>>(new Set());
	let inputRef = $state<HTMLInputElement | null>(null);
	let dropdownRef = $state<HTMLDivElement | null>(null);
	let chipRef = $state<HTMLButtonElement | null>(null);
	let dropdownStyle = $state('');

	// Settings popover state
	let settingsOpen = $state(false);
	let settingsRef = $state<HTMLDivElement | null>(null);
	let settingsName = $state('');
	let settingsSourceTable = $state('');
	let settingsDisplayColumn = $state('');
	let settingsMultiSelect = $state(false);
	let settingsError = $state('');
	let availableTables = $state<string[]>([]);
	let availableColumns = $state<string[]>([]);

	// Parse current value
	const storedValues = $derived.by<string[]>(() => {
		if (!block.value) return [];
		return String(block.value).split(',').map(v => v.trim()).filter(Boolean);
	});

	// Display labels for stored values
	let displayLabels = $state<Map<string, string>>(new Map());

	// Fetch display labels when config or value changes
	$effect(() => {
		if (config.sourceTable && config.displayColumn && project && storedValues.length > 0) {
			fetchDisplayLabels();
		}
	});

	async function fetchDisplayLabels() {
		if (!config.sourceTable || !config.displayColumn || !project) return;
		try {
			const res = await fetch(
				`/api/data/tables/${encodeURIComponent(config.sourceTable)}?project=${encodeURIComponent(project)}&limit=999`
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

	// Display text for the chip
	const displayText = $derived.by(() => {
		const vals = storedValues;
		if (vals.length === 0) return null;
		if (config.staticOptions && config.staticOptions.length > 0) {
			// For static options, value IS the display text
			return vals.join(', ');
		}
		return vals.map(v => displayLabels.get(v) ?? v).join(', ');
	});

	// Close dropdown on outside click
	$effect(() => {
		if (!dropdownOpen) return;
		function handleOutsideClick(e: MouseEvent) {
			if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
				closeDropdown();
			}
		}
		const timer = setTimeout(() => {
			document.addEventListener('mousedown', handleOutsideClick, true);
		}, 0);
		return () => {
			clearTimeout(timer);
			document.removeEventListener('mousedown', handleOutsideClick, true);
		};
	});

	// Close settings on outside click
	$effect(() => {
		if (!settingsOpen) return;
		function handleOutsideClick(e: MouseEvent) {
			if (settingsRef && !settingsRef.contains(e.target as Node)) {
				closeSettings();
			}
		}
		const timer = setTimeout(() => {
			document.addEventListener('mousedown', handleOutsideClick, true);
		}, 0);
		return () => {
			clearTimeout(timer);
			document.removeEventListener('mousedown', handleOutsideClick, true);
		};
	});

	function updateDropdownPosition() {
		if (!chipRef) return;
		const rect = chipRef.getBoundingClientRect();
		const spaceBelow = window.innerHeight - rect.bottom;
		const maxH = 220;
		if (spaceBelow < maxH + 10) {
			dropdownStyle = `position:fixed; left:${rect.left}px; bottom:${window.innerHeight - rect.top + 4}px; width:${Math.max(rect.width, 200)}px; max-height:${Math.min(maxH, rect.top - 10)}px;`;
		} else {
			dropdownStyle = `position:fixed; left:${rect.left}px; top:${rect.bottom + 4}px; width:${Math.max(rect.width, 200)}px; max-height:${maxH}px;`;
		}
	}

	async function openDropdown() {
		if (!config.sourceTable && (!config.staticOptions || config.staticOptions.length === 0)) {
			// No source configured - open settings instead
			openSettings();
			return;
		}
		dropdownOpen = true;
		searchQuery = '';
		selectedValues = new Set(storedValues);
		if (config.sourceTable) {
			fetchTargetRows();
		}
		await tick();
		inputRef?.focus();
		updateDropdownPosition();
	}

	function closeDropdown() {
		if (!dropdownOpen) return;
		if (config.multiSelect) {
			const val = [...selectedValues].join(',');
			saveValue(val || null);
		}
		dropdownOpen = false;
	}

	async function fetchTargetRows() {
		if (!config.sourceTable || !project) return;
		loading = true;
		try {
			const res = await fetch(
				`/api/data/tables/${encodeURIComponent(config.sourceTable)}?project=${encodeURIComponent(project)}&limit=999`
			);
			if (!res.ok) { loading = false; return; }
			const data = await res.json();
			targetRows = data.rows || [];
		} catch { /* ignore */ }
		loading = false;
	}

	// Options: either from table rows or static
	const options = $derived.by(() => {
		if (config.staticOptions && config.staticOptions.length > 0) {
			return config.staticOptions.map((opt, i) => ({
				id: opt,
				label: opt,
			}));
		}
		return targetRows.map(row => ({
			id: String(row.rowid),
			label: row[config.displayColumn || ''] ?? `Row ${row.rowid}`,
		}));
	});

	const filteredOptions = $derived(
		options.filter(opt => {
			if (!searchQuery.trim()) return true;
			return opt.label.toLowerCase().includes(searchQuery.toLowerCase());
		})
	);

	function selectOption(id: string) {
		if (config.multiSelect) {
			const updated = new Set(selectedValues);
			if (updated.has(id)) {
				updated.delete(id);
			} else {
				updated.add(id);
			}
			selectedValues = updated;
		} else {
			dropdownOpen = false;
			saveValue(id);
		}
	}

	function confirmMultiSelect() {
		dropdownOpen = false;
		const val = [...selectedValues].join(',');
		saveValue(val || null);
	}

	function clearValue() {
		dropdownOpen = false;
		saveValue(null);
	}

	function saveValue(val: unknown) {
		const updated = { ...block, value: val };
		onBlockUpdate(updated as ControlBlock);
		if (block.name) {
			onControlChange(block.name, val);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			closeDropdown();
		}
	}

	// Settings popover
	async function openSettings() {
		settingsName = block.name || '';
		settingsSourceTable = (config.sourceTable) || '';
		settingsDisplayColumn = (config.displayColumn) || '';
		settingsMultiSelect = config.multiSelect || false;
		settingsOpen = true;

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
		if (settingsSourceTable) {
			fetchColumnsForTable(settingsSourceTable);
		}
	}

	async function fetchColumnsForTable(tableName: string) {
		if (!project || !tableName) { availableColumns = []; return; }
		try {
			const res = await fetch(
				`/api/data/tables/${encodeURIComponent(tableName)}?project=${encodeURIComponent(project)}&limit=1`
			);
			if (res.ok) {
				const data = await res.json();
				const schema = data.schema || [];
				availableColumns = schema.map((col: any) => col.name).filter((n: string) => n !== 'rowid');
			}
		} catch { availableColumns = []; }
	}

	function handleSourceTableChange(e: Event) {
		const val = (e.target as HTMLSelectElement).value;
		settingsSourceTable = val;
		settingsDisplayColumn = '';
		if (val) fetchColumnsForTable(val);
	}

	function closeSettings() {
		settingsOpen = false;
	}

	function saveSettings() {
		const trimmedName = settingsName.trim();
		// Validate name uniqueness (exclude current block's name)
		if (trimmedName && trimmedName !== block.name) {
			const otherNames = existingNames.filter(n => n !== block.name);
			if (otherNames.includes(trimmedName)) {
				settingsError = `Name "${trimmedName}" is already used by another control`;
				return;
			}
		}
		settingsError = '';
		const updatedConfig: SelectControlConfig = {
			sourceTable: settingsSourceTable || undefined,
			displayColumn: settingsDisplayColumn || undefined,
			multiSelect: settingsMultiSelect,
		};
		const updated: ControlBlock = {
			...block,
			name: trimmedName || block.name,
			config: updatedConfig,
		};
		onBlockUpdate(updated);
		settingsOpen = false;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="canvas-select-control" bind:this={dropdownRef}>
	<!-- Chip display -->
	<div class="control-row">
		<span class="control-label">{block.name || 'unnamed'}</span>

		<button
			class="control-chip"
			bind:this={chipRef}
			onclick={openDropdown}
			title="Click to select"
		>
			{#if displayText}
				<span class="chip-value">{displayText}</span>
			{:else}
				<span class="chip-placeholder">Select...</span>
			{/if}
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="chip-chevron">
				<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
			</svg>
		</button>

		<!-- Settings gear icon -->
		<button
			class="settings-btn"
			onclick={(e) => { e.stopPropagation(); openSettings(); }}
			title="Configure control"
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
		</button>
	</div>

	<!-- Dropdown -->
	{#if dropdownOpen}
		<div class="select-dropdown" style={dropdownStyle} onkeydown={handleKeydown}>
			<div class="dropdown-search">
				<input
					type="text"
					class="search-input"
					placeholder="Search..."
					bind:value={searchQuery}
					bind:this={inputRef}
				/>
				{#if block.value}
					<button class="clear-btn" onclick={clearValue} title="Clear">×</button>
				{/if}
			</div>
			<div class="dropdown-options">
				{#if loading}
					<div class="dropdown-empty">Loading...</div>
				{:else if !config.sourceTable && (!config.staticOptions || config.staticOptions.length === 0)}
					<div class="dropdown-empty">No source configured</div>
				{:else if filteredOptions.length === 0}
					<div class="dropdown-empty">No matching options</div>
				{:else}
					{#each filteredOptions as opt}
						{@const isSelected = selectedValues.has(opt.id)}
						<button
							class="dropdown-option"
							class:selected={isSelected}
							onclick={() => selectOption(opt.id)}
						>
							{#if config.multiSelect}
								<span class="check-box" class:checked={isSelected}>
									{isSelected ? '☑' : '☐'}
								</span>
							{/if}
							<span class="option-label">{opt.label}</span>
						</button>
					{/each}
				{/if}
				{#if config.multiSelect && selectedValues.size > 0}
					<div class="dropdown-footer">
						<button class="done-btn" onclick={confirmMultiSelect}>
							Done ({selectedValues.size} selected)
						</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Settings Popover -->
	{#if settingsOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="settings-popover"
			bind:this={settingsRef}
			onclick={(e) => e.stopPropagation()}
			onmousedown={(e) => e.stopPropagation()}
		>
			<div class="settings-header">
				<span class="settings-title">Control Settings</span>
				<button class="settings-close" onclick={closeSettings}>×</button>
			</div>

			<div class="settings-body">
				<!-- Name -->
				<label class="settings-field">
					<span class="field-label">Name</span>
					<input
						type="text"
						class="field-input"
						placeholder="Control name (used in formulas)"
						bind:value={settingsName}
					/>
				</label>

				<!-- Source Table -->
				<label class="settings-field">
					<span class="field-label">Source Table</span>
					<select
						class="field-input"
						value={settingsSourceTable}
						onchange={handleSourceTableChange}
					>
						<option value="">— Select table —</option>
						{#each availableTables as table}
							<option value={table}>{table}</option>
						{/each}
					</select>
				</label>

				<!-- Display Column -->
				<label class="settings-field">
					<span class="field-label">Display Column</span>
					<select
						class="field-input"
						bind:value={settingsDisplayColumn}
						disabled={!settingsSourceTable}
					>
						<option value="">— Select column —</option>
						{#each availableColumns as col}
							<option value={col}>{col}</option>
						{/each}
					</select>
				</label>

				<!-- Multi-select -->
				<label class="settings-field settings-checkbox">
					<input
						type="checkbox"
						bind:checked={settingsMultiSelect}
					/>
					<span class="field-label">Allow multiple selections</span>
				</label>
			</div>

			{#if settingsError}
				<div class="settings-error">{settingsError}</div>
			{/if}

			<div class="settings-footer">
				<button class="settings-cancel" onclick={closeSettings}>Cancel</button>
				<button class="settings-save" onclick={saveSettings}>Save</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.canvas-select-control {
		position: relative;
	}

	.control-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.control-label {
		font-size: 0.75rem;
		font-weight: 600;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		color: oklch(0.65 0.10 300);
		flex-shrink: 0;
	}

	.control-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.1875rem 0.5rem;
		border-radius: 0.375rem;
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		border: 1px solid oklch(0.35 0.06 250);
		background: oklch(0.20 0.02 250);
		color: oklch(0.85 0.02 250);
		transition: border-color 0.15s, background 0.15s;
		max-width: 250px;
	}

	.control-chip:hover {
		border-color: oklch(0.50 0.10 250);
		background: oklch(0.24 0.02 250);
	}

	.chip-value {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chip-placeholder {
		color: oklch(0.50 0.02 250);
		font-style: italic;
	}

	.chip-chevron {
		width: 0.75rem;
		height: 0.75rem;
		flex-shrink: 0;
		color: oklch(0.55 0.02 250);
	}

	.settings-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.25rem;
		border: none;
		background: transparent;
		color: oklch(0.45 0.02 250);
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.15s, color 0.15s, background 0.15s;
	}

	.canvas-select-control:hover .settings-btn {
		opacity: 1;
	}

	.settings-btn:hover {
		color: oklch(0.75 0.12 300);
		background: oklch(0.55 0.12 300 / 0.12);
	}

	/* Dropdown */
	.select-dropdown {
		z-index: 9999;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.375rem;
		box-shadow: 0 4px 16px oklch(0 0 0 / 0.4);
		overflow: hidden;
	}

	.dropdown-search {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.375rem;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.search-input {
		flex: 1;
		padding: 0.25rem 0.375rem;
		font-size: 0.8125rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.90 0.02 250);
		outline: none;
	}

	.search-input:focus {
		border-color: oklch(0.50 0.10 200);
	}

	.clear-btn {
		background: none;
		border: none;
		color: oklch(0.55 0.02 250);
		cursor: pointer;
		font-size: 1rem;
		padding: 0 0.25rem;
		line-height: 1;
	}

	.clear-btn:hover {
		color: oklch(0.80 0.15 25);
	}

	.dropdown-options {
		overflow-y: auto;
		max-height: inherit;
	}

	.dropdown-option {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		width: 100%;
		padding: 0.375rem 0.5rem;
		font-size: 0.8125rem;
		color: oklch(0.85 0.02 250);
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
	}

	.dropdown-option:hover {
		background: oklch(0.22 0.02 250);
	}

	.dropdown-option.selected {
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

	.dropdown-empty {
		padding: 0.75rem 0.5rem;
		font-size: 0.75rem;
		color: oklch(0.50 0.02 250);
		text-align: center;
		font-style: italic;
	}

	.dropdown-footer {
		padding: 0.375rem;
		border-top: 1px solid oklch(0.25 0.02 250);
	}

	.done-btn {
		width: 100%;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		background: oklch(0.40 0.12 200);
		border: 1px solid oklch(0.50 0.14 200);
		color: oklch(0.95 0.02 200);
		border-radius: 0.25rem;
		cursor: pointer;
	}

	.done-btn:hover {
		background: oklch(0.45 0.14 200);
	}

	/* Settings Popover */
	.settings-popover {
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: 0.5rem;
		z-index: 50;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.5rem;
		box-shadow: 0 8px 24px oklch(0 0 0 / 0.4);
		min-width: 280px;
		animation: settings-scale-in 0.12s ease-out;
	}

	@keyframes settings-scale-in {
		from { opacity: 0; transform: translateY(-4px) scale(0.97); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}

	.settings-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 0.75rem;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.settings-title {
		font-size: 0.75rem;
		font-weight: 600;
		color: oklch(0.80 0.02 250);
	}

	.settings-close {
		background: none;
		border: none;
		color: oklch(0.50 0.02 250);
		cursor: pointer;
		font-size: 1rem;
		padding: 0;
		line-height: 1;
	}

	.settings-close:hover {
		color: oklch(0.80 0.02 250);
	}

	.settings-body {
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.settings-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.settings-checkbox {
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}

	.settings-checkbox input[type="checkbox"] {
		accent-color: oklch(0.65 0.15 200);
	}

	.field-label {
		font-size: 0.6875rem;
		font-weight: 500;
		color: oklch(0.60 0.02 250);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.field-input {
		padding: 0.3125rem 0.5rem;
		font-size: 0.8125rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.90 0.02 250);
		outline: none;
	}

	.field-input:focus {
		border-color: oklch(0.55 0.12 300 / 0.5);
	}

	.field-input:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.settings-error {
		margin: 0 0.75rem;
		padding: 0.375rem 0.5rem;
		font-size: 0.75rem;
		color: oklch(0.75 0.15 25);
		background: oklch(0.50 0.12 25 / 0.12);
		border: 1px solid oklch(0.55 0.15 25 / 0.25);
		border-radius: 0.25rem;
	}

	.settings-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 0.625rem 0.75rem;
		border-top: 1px solid oklch(0.25 0.02 250);
	}

	.settings-cancel {
		padding: 0.25rem 0.625rem;
		font-size: 0.75rem;
		background: transparent;
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.65 0.02 250);
		cursor: pointer;
	}

	.settings-cancel:hover {
		background: oklch(0.22 0.02 250);
	}

	.settings-save {
		padding: 0.25rem 0.625rem;
		font-size: 0.75rem;
		background: oklch(0.55 0.12 300 / 0.2);
		border: 1px solid oklch(0.55 0.12 300 / 0.4);
		border-radius: 0.25rem;
		color: oklch(0.80 0.10 300);
		cursor: pointer;
	}

	.settings-save:hover {
		background: oklch(0.55 0.12 300 / 0.3);
	}
</style>
