<script lang="ts">
	/**
	 * /data - Per-Project Data Tables
	 *
	 * Two-panel layout:
	 * - Left: Table list with row counts
	 * - Right: Table view with inline editing, add/delete rows, SQL console
	 */

	import { onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { reveal } from '$lib/actions/reveal';
	import { successToast, errorToast } from '$lib/stores/toasts.svelte';
	import type { SemanticType, ColumnConfig, ColumnSchema } from '$lib/types/dataTable';
	import { SEMANTIC_TYPE_INFO, SEMANTIC_TO_SQLITE } from '$lib/types/dataTable';
	import DataCell from '$lib/components/data/DataCell.svelte';
	import ColumnTypeSelector from '$lib/components/data/ColumnTypeSelector.svelte';
	import ColumnSettingsPopover from '$lib/components/data/ColumnSettingsPopover.svelte';

	interface TableInfo {
		name: string;
		display_name: string | null;
		description: string | null;
		column_count: number;
		row_count: number;
		created_at: string;
	}

	interface ColumnInfo {
		cid: number;
		name: string;
		type: string;
		notnull: number;
		dflt_value: string | null;
		pk: number;
		semanticType?: SemanticType;
		config?: ColumnConfig;
		displayName?: string;
		columnDescription?: string;
	}

	// State — selectedProject synced from URL ?project= param (set by TopBar ProjectSelector)
	let selectedProject = $state<string | null>(null);
	let tables = $state<TableInfo[]>([]);
	let selectedTable = $state<string | null>(null);
	let schema = $state<ColumnInfo[]>([]);
	let rows = $state<any[]>([]);
	let totalRows = $state(0);

	// Loading states
	let tablesLoading = $state(false);
	let tableDataLoading = $state(false);

	// Pagination
	let limit = $state(100);
	let offset = $state(0);
	let orderBy = $state<string | undefined>(undefined);
	let orderDir = $state<'ASC' | 'DESC'>('ASC');

	// Column metadata
	let columnMeta = $state<Record<string, { semanticType: SemanticType; config: ColumnConfig }>>({});

	// Create table modal
	let showCreateModal = $state(false);
	let newTableName = $state('');
	let newTableDisplayName = $state('');
	let newTableDescription = $state('');
	let newTableColumns = $state<{ name: string; type: string; semanticType?: SemanticType }[]>([
		{ name: '', type: 'TEXT', semanticType: 'text' }
	]);
	let createSaving = $state(false);

	// Create table mode
	let createMode = $state<'manual' | 'csv' | 'json' | 'sql'>('manual');
	let createCsvText = $state('');
	let createCsvFormat = $state<'auto' | 'tsv' | 'csv'>('auto');
	let createJsonText = $state('');
	let createSqlText = $state('');
	let inferredColumns = $state<Array<{name: string, type: string, semanticType: SemanticType}>>([]);
	let inferredRows = $state<Array<Record<string, any>>>([]);
	let createPreviewError = $state('');

	// Column settings popover
	let columnSettingsOpen = $state<string | null>(null);

	// Cell selection & keyboard navigation
	let selectedCell = $state<{ rowIdx: number; colIdx: number } | null>(null);
	let editingSelectedCell = $state(false);

	// Inline editing (legacy — only used for columns without semantic type)
	let editingCell = $state<{ rowid: number; column: string } | null>(null);
	let editValue = $state('');

	// Add row
	let addingRow = $state(false);
	let newRowData = $state<Record<string, string>>({});

	// SQL console
	let sqlConsoleOpen = $state(false);
	let sqlText = $state('');
	let sqlResult = $state<any>(null);
	let sqlError = $state<string | null>(null);
	let sqlRunning = $state(false);

	// Import modal
	let showImportModal = $state(false);
	let importText = $state('');
	let importFormat = $state<'auto' | 'tsv' | 'csv'>('auto');
	let importPreviewing = $state(false);
	let importPreview = $state<{ headers: string[]; rows: Record<string, string>[]; matched: string[]; unmatched: string[]; tableColumns: string[] } | null>(null);
	let importError = $state<string | null>(null);
	let importImporting = $state(false);
	let importFileName = $state('');

	// Column context menu
	let ctxCol = $state<ColumnInfo | null>(null);
	let ctxColIndex = $state(0);
	let ctxX = $state(0);
	let ctxY = $state(0);
	let ctxVisible = $state(false);
	let insertSubmenuOpen = $state<'before' | 'after' | null>(null);

	// Row context menu
	let rowCtxRow = $state<any | null>(null);
	let rowCtxIndex = $state(0);
	let rowCtxX = $state(0);
	let rowCtxY = $state(0);
	let rowCtxVisible = $state(false);

	// Hidden columns (persisted per project+table in localStorage)
	let hiddenColumns = $state<Set<string>>(new Set());

	// Column order (persisted per project+table in localStorage)
	let columnOrder = $state<string[]>([]);

	// Column widths (persisted per project+table in localStorage)
	let columnWidths = $state<Record<string, number>>({});

	// Column drag state
	let colDraggedIndex = $state<number | null>(null);
	let colDragOverIndex = $state<number | null>(null);

	// Column resize state
	let colResizing = $state<string | null>(null);
	let colResizeStartX = 0;
	let colResizeStartWidth = 0;

	// Sync selectedProject from URL ?project= param (set by TopBar ProjectSelector)
	$effect(() => {
		const projectParam = $page.url.searchParams.get('project');
		if (projectParam && selectedProject !== projectParam) {
			selectedProject = projectParam;
		}
	});

	// When project changes, fetch tables
	$effect(() => {
		if (selectedProject) {
			fetchTables();
			selectedTable = null;
			schema = [];
			rows = [];
		}
	});

	// When selectedTable changes, fetch data
	$effect(() => {
		if (selectedProject && selectedTable) {
			fetchTableData();
		}
	});

	async function fetchTables() {
		if (!selectedProject) return;
		tablesLoading = true;
		try {
			const res = await fetch(`/api/data/tables?project=${encodeURIComponent(selectedProject)}`);
			const data = await res.json();
			if (res.ok) {
				tables = data.tables || [];
			} else {
				tables = [];
			}
		} catch (e) {
			console.error('Failed to fetch tables:', e);
			tables = [];
		} finally {
			tablesLoading = false;
		}
	}

	async function fetchTableData() {
		if (!selectedProject || !selectedTable) return;
		tableDataLoading = true;
		try {
			let url = `/api/data/tables/${encodeURIComponent(selectedTable)}?project=${encodeURIComponent(selectedProject)}&limit=${limit}&offset=${offset}`;
			if (orderBy) url += `&orderBy=${encodeURIComponent(orderBy)}&orderDir=${orderDir}`;
			const res = await fetch(url);
			const data = await res.json();
			if (res.ok) {
				schema = data.schema || [];
				rows = data.rows || [];
				totalRows = data.total || 0;
				columnMeta = data.columnMeta || {};
			} else {
				errorToast(data.error || 'Failed to load table');
			}
		} catch (e) {
			errorToast('Failed to load table data');
		} finally {
			tableDataLoading = false;
		}
	}

	function selectTable(name: string) {
		selectedTable = name;
		offset = 0;
		orderBy = undefined;
		orderDir = 'ASC';
	}

	function toggleSort(column: string) {
		if (orderBy === column) {
			orderDir = orderDir === 'ASC' ? 'DESC' : 'ASC';
		} else {
			orderBy = column;
			orderDir = 'ASC';
		}
		offset = 0;
		fetchTableData();
	}

	// Create table
	function addColumn() {
		newTableColumns = [...newTableColumns, { name: '', type: 'TEXT', semanticType: 'text' }];
	}

	function removeColumn(index: number) {
		newTableColumns = newTableColumns.filter((_, i) => i !== index);
	}

	// --- Type inference helpers ---

	function inferSemanticType(values: any[]): SemanticType {
		const samples = values.filter(v => v != null && v !== '').slice(0, 50);
		if (samples.length === 0) return 'text';

		const dateRe = /^\d{4}-\d{2}-\d{2}$/;
		const datetimeRe = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;
		const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const urlRe = /^https?:\/\//i;
		const currencyRe = /^[\$\€\£]\s?[\d,]+(\.\d+)?$/;
		const percentRe = /^[\d.]+\s?%$/;
		const boolRe = /^(true|false|yes|no|0|1)$/i;

		let dates = 0, datetimes = 0, numbers = 0, bools = 0, urls = 0, emails = 0, currencies = 0, percents = 0;

		for (const v of samples) {
			const s = String(v).trim();
			if (datetimeRe.test(s)) datetimes++;
			else if (dateRe.test(s)) dates++;
			if (!isNaN(Number(s)) && s !== '') numbers++;
			if (boolRe.test(s)) bools++;
			if (urlRe.test(s)) urls++;
			if (emailRe.test(s)) emails++;
			if (currencyRe.test(s)) currencies++;
			if (percentRe.test(s)) percents++;
		}

		const threshold = samples.length * 0.8;
		if (datetimes >= threshold) return 'datetime';
		if (dates >= threshold) return 'date';
		if (currencies >= threshold) return 'currency';
		if (percents >= threshold) return 'percentage';
		if (urls >= threshold) return 'url';
		if (emails >= threshold) return 'email';
		if (bools >= threshold) return 'boolean';
		if (numbers >= threshold) return 'number';
		return 'text';
	}

	function parseAndInferCsv(text: string, format: string) {
		createPreviewError = '';
		inferredColumns = [];
		inferredRows = [];

		const lines = text.split('\n');
		if (lines.length < 1 || !lines[0].trim()) {
			createPreviewError = 'Paste data with a header row';
			return;
		}

		// Detect delimiter
		const firstLine = lines[0];
		let delimiter: string;
		if (format === 'csv') delimiter = ',';
		else if (format === 'tsv') delimiter = '\t';
		else {
			const tabs = (firstLine.match(/\t/g) || []).length;
			const commas = (firstLine.match(/,/g) || []).length;
			delimiter = tabs >= commas ? '\t' : ',';
		}

		const rawHeaders = firstLine.split(delimiter);
		const headers = rawHeaders
			.map(h => h.trim().replace(/^["']|["']$/g, ''))
			.map(h => h.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''))
			.filter(h => h.length > 0);

		if (headers.length === 0) {
			createPreviewError = 'No valid column headers found';
			return;
		}

		// Parse data rows
		const parsed: Record<string, string>[] = [];
		for (let i = 1; i < lines.length; i++) {
			const line = lines[i];
			if (!line.trim() && i === lines.length - 1) continue;
			const cells = line.split(delimiter);
			const row: Record<string, string> = {};
			for (let c = 0; c < headers.length; c++) {
				row[headers[c]] = (cells[c] || '').trim().replace(/^["']|["']$/g, '');
			}
			parsed.push(row);
		}

		if (parsed.length === 0) {
			createPreviewError = 'No data rows found';
			return;
		}

		// Infer types
		inferredColumns = headers.map(h => {
			const vals = parsed.map(r => r[h]);
			const st = inferSemanticType(vals);
			return { name: h, type: SEMANTIC_TO_SQLITE[st], semanticType: st };
		});
		inferredRows = parsed;

		// Auto-suggest table name from headers if empty
		if (!newTableName.trim() && headers.length > 0) {
			newTableName = 'imported_data';
		}
	}

	function parseAndInferJson(text: string) {
		createPreviewError = '';
		inferredColumns = [];
		inferredRows = [];

		let data: any;
		try {
			data = JSON.parse(text);
		} catch (e: any) {
			createPreviewError = `Invalid JSON: ${e.message}`;
			return;
		}

		if (!Array.isArray(data)) {
			createPreviewError = 'JSON must be an array of objects';
			return;
		}
		if (data.length === 0) {
			createPreviewError = 'JSON array is empty';
			return;
		}
		if (typeof data[0] !== 'object' || data[0] === null) {
			createPreviewError = 'JSON array must contain objects';
			return;
		}

		// Collect all keys across all objects
		const keySet = new Set<string>();
		for (const obj of data) {
			if (typeof obj === 'object' && obj !== null) {
				for (const k of Object.keys(obj)) keySet.add(k);
			}
		}
		const headers = [...keySet];

		// Normalize column names
		const normalizedHeaders = headers.map(h =>
			h.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
		).filter(h => h.length > 0);

		// Build rows with normalized keys
		const parsed: Record<string, any>[] = data.map((obj: any) => {
			const row: Record<string, any> = {};
			headers.forEach((h, i) => {
				const nh = normalizedHeaders[i];
				if (nh) row[nh] = obj[h] ?? '';
			});
			return row;
		});

		inferredColumns = normalizedHeaders.map(h => {
			const vals = parsed.map(r => r[h]);
			const st = inferSemanticType(vals);
			return { name: h, type: SEMANTIC_TO_SQLITE[st], semanticType: st };
		});
		inferredRows = parsed;

		if (!newTableName.trim()) {
			newTableName = 'imported_data';
		}
	}

	function parseSqlCreate(text: string) {
		createPreviewError = '';
		inferredColumns = [];
		inferredRows = [];

		const match = text.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:["'`]?(\w+)["'`]?)\s*\(([\s\S]+)\)/i);
		if (!match) {
			createPreviewError = 'Could not parse CREATE TABLE statement';
			return;
		}

		const tableName = match[1];
		const colDefs = match[2];

		// Split by comma but not inside parentheses (for constraints like CHECK(...))
		const parts: string[] = [];
		let depth = 0, current = '';
		for (const ch of colDefs) {
			if (ch === '(') depth++;
			else if (ch === ')') depth--;
			if (ch === ',' && depth === 0) {
				parts.push(current.trim());
				current = '';
			} else {
				current += ch;
			}
		}
		if (current.trim()) parts.push(current.trim());

		// Filter out constraints (PRIMARY KEY, UNIQUE, CHECK, FOREIGN KEY, CONSTRAINT)
		const constraintRe = /^\s*(PRIMARY\s+KEY|UNIQUE|CHECK|FOREIGN\s+KEY|CONSTRAINT)\b/i;
		const cols: Array<{name: string, type: string, semanticType: SemanticType}> = [];

		for (const part of parts) {
			if (constraintRe.test(part)) continue;
			const colMatch = part.match(/^\s*["'`]?(\w+)["'`]?\s+(\w+)/);
			if (!colMatch) continue;

			const colName = colMatch[1].toLowerCase();
			const sqlType = colMatch[2].toUpperCase();

			let st: SemanticType = 'text';
			if (['INTEGER', 'INT', 'BIGINT', 'SMALLINT', 'TINYINT'].includes(sqlType)) st = 'number';
			else if (['REAL', 'FLOAT', 'DOUBLE', 'DECIMAL', 'NUMERIC'].includes(sqlType)) st = 'number';
			else if (['BOOLEAN', 'BOOL'].includes(sqlType)) st = 'boolean';
			else if (['DATE'].includes(sqlType)) st = 'date';
			else if (['DATETIME', 'TIMESTAMP'].includes(sqlType)) st = 'datetime';

			cols.push({ name: colName, type: SEMANTIC_TO_SQLITE[st], semanticType: st });
		}

		if (cols.length === 0) {
			createPreviewError = 'No columns found in CREATE TABLE statement';
			return;
		}

		inferredColumns = cols;

		// Auto-fill table name from SQL
		if (!newTableName.trim() && tableName) {
			newTableName = tableName.toLowerCase();
		}
	}

	// Reset mode-specific state when switching modes
	function switchCreateMode(mode: typeof createMode) {
		createMode = mode;
		inferredColumns = [];
		inferredRows = [];
		createPreviewError = '';
	}

	async function handleCreateTable() {
		if (!selectedProject || !newTableName.trim()) return;

		let columns: Array<{name: string, type: string, semanticType?: string}>;
		let rowsToImport: Array<Record<string, any>> | null = null;

		if (createMode === 'manual') {
			columns = newTableColumns.filter(c => c.name.trim()).map(c => ({
				name: c.name,
				type: c.type,
				semanticType: c.semanticType && c.semanticType !== 'text' ? c.semanticType : undefined,
			}));
			if (columns.length === 0) {
				errorToast('At least one column is required');
				return;
			}
		} else if (createMode === 'csv' || createMode === 'json') {
			if (inferredColumns.length === 0) {
				errorToast('Parse your data first to detect columns');
				return;
			}
			columns = inferredColumns.map(c => ({
				name: c.name,
				type: c.type,
				semanticType: c.semanticType !== 'text' ? c.semanticType : undefined,
			}));
			rowsToImport = inferredRows;
		} else {
			// SQL mode
			if (inferredColumns.length === 0) {
				errorToast('Parse your SQL first to detect columns');
				return;
			}
			columns = inferredColumns.map(c => ({
				name: c.name,
				type: c.type,
				semanticType: c.semanticType !== 'text' ? c.semanticType : undefined,
			}));
		}

		createSaving = true;
		try {
			// Step 1: Create the table
			const res = await fetch('/api/data/tables', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					project: selectedProject,
					name: newTableName.trim(),
					columns,
					displayName: newTableDisplayName.trim() || undefined,
					description: newTableDescription.trim() || undefined
				})
			});
			const data = await res.json();
			if (!res.ok) {
				errorToast(data.error || 'Failed to create table');
				return;
			}

			// Step 2: Import rows if CSV/JSON mode
			if (rowsToImport && rowsToImport.length > 0) {
				const importRes = await fetch(`/api/data/tables/${encodeURIComponent(newTableName.trim())}/import`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						project: selectedProject,
						rows: rowsToImport
					})
				});
				const importData = await importRes.json();
				if (importRes.ok && importData.success) {
					successToast(`Table "${newTableName}" created with ${importData.inserted} rows`);
				} else {
					successToast(`Table created, but import failed: ${importData.error || 'Unknown error'}`);
				}
			} else {
				successToast(`Table "${newTableName}" created`);
			}

			showCreateModal = false;
			newTableName = '';
			newTableDisplayName = '';
			newTableDescription = '';
			newTableColumns = [{ name: '', type: 'TEXT', semanticType: 'text' }];
			createMode = 'manual';
			createCsvText = '';
			createJsonText = '';
			createSqlText = '';
			inferredColumns = [];
			inferredRows = [];
			createPreviewError = '';
			await fetchTables();
			selectTable(data.table);
		} catch (e) {
			errorToast('Failed to create table');
		} finally {
			createSaving = false;
		}
	}

	// Drop table
	async function handleDropTable(tableName: string) {
		if (!selectedProject) return;
		if (!confirm(`Drop table "${tableName}"? This cannot be undone.`)) return;
		try {
			const res = await fetch(`/api/data/tables?project=${encodeURIComponent(selectedProject)}&table=${encodeURIComponent(tableName)}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				successToast(`Table "${tableName}" dropped`);
				if (selectedTable === tableName) {
					selectedTable = null;
					schema = [];
					rows = [];
				}
				await fetchTables();
			} else {
				const data = await res.json();
				errorToast(data.error || 'Failed to drop table');
			}
		} catch (e) {
			errorToast('Failed to drop table');
		}
	}

	// Cell selection & keyboard navigation
	let tableRef: HTMLTableElement | undefined = $state(undefined);

	function selectCell(rowIdx: number, colIdx: number) {
		editingSelectedCell = false;
		selectedCell = { rowIdx, colIdx };
		// Focus the table so keyboard events work
		tableRef?.focus();
	}

	function clearSelection() {
		editingSelectedCell = false;
		selectedCell = null;
	}

	function startEditingSelected() {
		if (!selectedCell) return;
		const row = rows[selectedCell.rowIdx];
		const col = orderedColumns[selectedCell.colIdx];
		if (!row || !col) return;
		editingSelectedCell = true;
	}

	function handleTableKeydown(e: KeyboardEvent) {
		// Don't interfere if a cell is being edited (input/textarea is focused)
		const target = e.target as HTMLElement;
		if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

		if (!selectedCell) return;

		const maxRow = rows.length - 1;
		const maxCol = orderedColumns.length - 1;

		switch (e.key) {
			case 'ArrowUp':
				e.preventDefault();
				if (selectedCell.rowIdx > 0) {
					selectedCell = { rowIdx: selectedCell.rowIdx - 1, colIdx: selectedCell.colIdx };
				}
				break;
			case 'ArrowDown':
				e.preventDefault();
				if (selectedCell.rowIdx < maxRow) {
					selectedCell = { rowIdx: selectedCell.rowIdx + 1, colIdx: selectedCell.colIdx };
				}
				break;
			case 'ArrowLeft':
				e.preventDefault();
				if (selectedCell.colIdx > 0) {
					selectedCell = { rowIdx: selectedCell.rowIdx, colIdx: selectedCell.colIdx - 1 };
				}
				break;
			case 'ArrowRight':
				e.preventDefault();
				if (selectedCell.colIdx < maxCol) {
					selectedCell = { rowIdx: selectedCell.rowIdx, colIdx: selectedCell.colIdx + 1 };
				}
				break;
			case 'Tab':
				e.preventDefault();
				if (e.shiftKey) {
					// Move left, or wrap to previous row
					if (selectedCell.colIdx > 0) {
						selectedCell = { rowIdx: selectedCell.rowIdx, colIdx: selectedCell.colIdx - 1 };
					} else if (selectedCell.rowIdx > 0) {
						selectedCell = { rowIdx: selectedCell.rowIdx - 1, colIdx: maxCol };
					}
				} else {
					// Move right, or wrap to next row
					if (selectedCell.colIdx < maxCol) {
						selectedCell = { rowIdx: selectedCell.rowIdx, colIdx: selectedCell.colIdx + 1 };
					} else if (selectedCell.rowIdx < maxRow) {
						selectedCell = { rowIdx: selectedCell.rowIdx + 1, colIdx: 0 };
					}
				}
				break;
			case 'Enter':
				e.preventDefault();
				startEditingSelected();
				break;
			case 'Escape':
				e.preventDefault();
				clearSelection();
				break;
			default:
				// Printable character — start editing
				if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
					e.preventDefault();
					startEditingSelected();
				}
				break;
		}
	}

	// Keep selected cell in view
	$effect(() => {
		if (selectedCell) {
			const td = document.querySelector(
				`[data-cell-row="${selectedCell.rowIdx}"][data-cell-col="${selectedCell.colIdx}"]`
			);
			if (td) {
				td.scrollIntoView({ block: 'nearest', inline: 'nearest' });
			}
		}
	});

	// Clear selection when table changes
	$effect(() => {
		selectedTable;  // track dependency
		selectedCell = null;
		editingSelectedCell = false;
	});

	// Inline cell editing
	function startEdit(rowid: number, column: string, currentValue: any) {
		editingCell = { rowid, column };
		editValue = currentValue?.toString() ?? '';
	}

	async function saveEdit() {
		if (!editingCell || !selectedProject || !selectedTable) return;
		try {
			const res = await fetch(`/api/data/tables/${encodeURIComponent(selectedTable)}/rows/${editingCell.rowid}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					project: selectedProject,
					[editingCell.column]: editValue
				})
			});
			if (res.ok) {
				editingCell = null;
				await fetchTableData();
			} else {
				const data = await res.json();
				errorToast(data.error || 'Failed to update');
			}
		} catch (e) {
			errorToast('Failed to update row');
		}
	}

	function cancelEdit() {
		editingCell = null;
	}

	// Save cell value via DataCell component
	async function handleCellSave(rowid: number, column: string, value: any) {
		editingSelectedCell = false;
		if (!selectedProject || !selectedTable) return;
		// Check if value actually changed — skip API call for no-ops (cancel, unchanged save)
		const row = rows.find(r => r.rowid === rowid);
		if (row && row[column] === value) {
			requestAnimationFrame(() => tableRef?.focus());
			return;
		}
		try {
			const res = await fetch(`/api/data/tables/${encodeURIComponent(selectedTable)}/rows/${rowid}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					project: selectedProject,
					[column]: value
				})
			});
			if (res.ok) {
				await fetchTableData();
				// Re-focus table for continued keyboard navigation
				requestAnimationFrame(() => tableRef?.focus());
			} else {
				const data = await res.json();
				errorToast(data.error || 'Failed to update');
			}
		} catch (e) {
			errorToast('Failed to update row');
		}
	}

	// Save column settings (semantic type + config)
	async function saveColumnSettings(column: string, type: SemanticType, config: ColumnConfig) {
		if (!selectedProject || !selectedTable) return;
		try {
			const res = await fetch(`/api/data/tables/${encodeURIComponent(selectedTable)}/columns/${encodeURIComponent(column)}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					project: selectedProject,
					semanticType: type,
					config
				})
			});
			if (res.ok) {
				columnSettingsOpen = null;
				successToast(`Column "${column}" updated to ${type}`);
				await fetchTableData();
			} else {
				const data = await res.json();
				errorToast(data.error || 'Failed to update column');
			}
		} catch (e) {
			errorToast('Failed to update column settings');
		}
	}

	// Add row
	function startAddRow() {
		addingRow = true;
		newRowData = {};
		for (const col of schema) {
			if (col.name !== 'rowid') {
				newRowData[col.name] = '';
			}
		}
	}

	async function saveNewRow() {
		if (!selectedProject || !selectedTable) return;
		try {
			const res = await fetch(`/api/data/tables/${encodeURIComponent(selectedTable)}/rows`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					project: selectedProject,
					...newRowData
				})
			});
			if (res.ok) {
				addingRow = false;
				newRowData = {};
				await fetchTableData();
				await fetchTables(); // Update row counts
				successToast('Row added');
			} else {
				const data = await res.json();
				errorToast(data.error || 'Failed to add row');
			}
		} catch (e) {
			errorToast('Failed to add row');
		}
	}

	// Delete row
	async function deleteRow(rowid: number) {
		if (!selectedProject || !selectedTable) return;
		if (!confirm(`Delete row ${rowid}?`)) return;
		try {
			const res = await fetch(`/api/data/tables/${encodeURIComponent(selectedTable)}/rows/${rowid}?project=${encodeURIComponent(selectedProject)}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				await fetchTableData();
				await fetchTables();
				successToast('Row deleted');
			} else {
				const data = await res.json();
				errorToast(data.error || 'Failed to delete row');
			}
		} catch (e) {
			errorToast('Failed to delete row');
		}
	}

	// SQL Console
	async function runSql(mode: 'query' | 'exec') {
		if (!selectedProject || !sqlText.trim()) return;
		sqlRunning = true;
		sqlError = null;
		sqlResult = null;
		try {
			const res = await fetch('/api/data/query', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					project: selectedProject,
					sql: sqlText.trim(),
					mode
				})
			});
			const data = await res.json();
			if (res.ok) {
				sqlResult = data;
				if (mode === 'exec') {
					successToast(`${data.changes} row(s) affected`);
					// Refresh table data if viewing a table
					if (selectedTable) {
						await fetchTableData();
						await fetchTables();
					}
				}
			} else {
				sqlError = data.error || 'Query failed';
			}
		} catch (e) {
			sqlError = 'Failed to execute query';
		} finally {
			sqlRunning = false;
		}
	}

	// Import
	function openImportModal() {
		importText = '';
		importFormat = 'auto';
		importPreview = null;
		importError = null;
		importFileName = '';
		showImportModal = true;
	}

	async function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		importFileName = file.name;
		if (file.name.endsWith('.csv')) importFormat = 'csv';
		else if (file.name.endsWith('.tsv')) importFormat = 'tsv';
		importText = await file.text();
		await previewImport();
	}

	async function previewImport() {
		if (!selectedProject || !selectedTable || !importText.trim()) {
			importPreview = null;
			return;
		}
		importPreviewing = true;
		importError = null;
		importPreview = null;
		try {
			// Use client-side parsing to show preview without hitting the API
			const lines = importText.split('\n');
			if (lines.length < 2) {
				importError = 'Need at least a header line and one data row';
				return;
			}
			// Detect delimiter
			const firstLine = lines[0];
			let delimiter: string;
			if (importFormat === 'csv') delimiter = ',';
			else if (importFormat === 'tsv') delimiter = '\t';
			else {
				const tabs = (firstLine.match(/\t/g) || []).length;
				const commas = (firstLine.match(/,/g) || []).length;
				delimiter = tabs >= commas ? '\t' : ',';
			}
			const rawHeaders = firstLine.split(delimiter);
			const headers = rawHeaders
				.map(h => h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''))
				.filter(h => h.length > 0);

			// Parse first 5 data rows
			const previewRows: Record<string, string>[] = [];
			const expectedDelimiters = rawHeaders.length - 1;
			const delimRegex = new RegExp(delimiter === '\t' ? '\t' : ',', 'g');
			let currentRow: Record<string, string> | null = null;
			for (let i = 1; i < lines.length && previewRows.length < 5; i++) {
				const line = lines[i];
				if (line.trim() === '' && i === lines.length - 1) continue;
				const delimCount = (line.match(delimRegex) || []).length;
				if (delimCount >= expectedDelimiters - 1) {
					const cells = line.split(delimiter);
					const row: Record<string, string> = {};
					for (let c = 0; c < headers.length; c++) {
						row[headers[c]] = (cells[c] || '').trim();
					}
					previewRows.push(row);
					currentRow = row;
				} else if (currentRow) {
					let lastField: string | null = null;
					for (let c = headers.length - 1; c >= 0; c--) {
						if (currentRow[headers[c]] && currentRow[headers[c]].length > 0) {
							lastField = headers[c];
							break;
						}
					}
					if (lastField) {
						currentRow[lastField] += '\n' + line;
					}
				}
			}

			// Count total data rows (rough estimate)
			let totalDataRows = 0;
			for (let i = 1; i < lines.length; i++) {
				const line = lines[i];
				if (line.trim() === '' && i === lines.length - 1) continue;
				const delimCount = (line.match(delimRegex) || []).length;
				if (delimCount >= expectedDelimiters - 1) totalDataRows++;
			}

			// Match columns against table schema
			const tableColumns = editableColumns.map(c => c.name);
			const matched = headers.filter(h => tableColumns.includes(h));
			const unmatched = headers.filter(h => !tableColumns.includes(h));

			importPreview = { headers, rows: previewRows, matched, unmatched, tableColumns };
			if (matched.length === 0) {
				importError = `No columns matched. File has: ${headers.join(', ')}. Table has: ${tableColumns.join(', ')}`;
			}
		} catch (e: any) {
			importError = e.message || 'Failed to parse';
		} finally {
			importPreviewing = false;
		}
	}

	async function executeImport() {
		if (!selectedProject || !selectedTable || !importText.trim()) return;
		importImporting = true;
		importError = null;
		try {
			const res = await fetch(`/api/data/tables/${encodeURIComponent(selectedTable)}/import`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					project: selectedProject,
					text: importText,
					format: importFormat === 'auto' ? undefined : importFormat
				})
			});
			const data = await res.json();
			if (res.ok && data.success) {
				successToast(`Imported ${data.inserted} rows into ${selectedTable}`);
				showImportModal = false;
				await fetchTableData();
				await fetchTables();
			} else {
				importError = data.error || 'Import failed';
			}
		} catch (e: any) {
			importError = e.message || 'Import failed';
		} finally {
			importImporting = false;
		}
	}

	// Pagination
	function nextPage() {
		if (offset + limit < totalRows) {
			offset += limit;
			fetchTableData();
		}
	}

	function prevPage() {
		if (offset > 0) {
			offset = Math.max(0, offset - limit);
			fetchTableData();
		}
	}


	// Editable columns (exclude rowid and hidden columns)
	const editableColumns = $derived(schema.filter(c => c.name !== 'rowid' && !hiddenColumns.has(c.name)));

	// Ordered columns (editableColumns reordered by user preference)
	const orderedColumns = $derived.by(() => {
		if (columnOrder.length === 0) return editableColumns;
		const orderMap = new Map(columnOrder.map((name, i) => [name, i]));
		const ordered: ColumnInfo[] = [];
		const unordered: ColumnInfo[] = [];
		for (const col of editableColumns) {
			if (orderMap.has(col.name)) {
				ordered.push(col);
			} else {
				unordered.push(col);
			}
		}
		ordered.sort((a, b) => (orderMap.get(a.name) ?? 0) - (orderMap.get(b.name) ?? 0));
		return [...ordered, ...unordered];
	});

	// Load hidden columns and column order from localStorage when project/table changes
	$effect(() => {
		if (selectedProject && selectedTable) {
			const hiddenKey = `jat-data-hidden-${selectedProject}-${selectedTable}`;
			try {
				const stored = localStorage.getItem(hiddenKey);
				hiddenColumns = stored ? new Set(JSON.parse(stored)) : new Set();
			} catch {
				hiddenColumns = new Set();
			}

			const orderKey = `jat-data-colorder-${selectedProject}-${selectedTable}`;
			try {
				const stored = localStorage.getItem(orderKey);
				columnOrder = stored ? JSON.parse(stored) : [];
			} catch {
				columnOrder = [];
			}

			const widthKey = `jat-data-colwidths-${selectedProject}-${selectedTable}`;
			try {
				const stored = localStorage.getItem(widthKey);
				columnWidths = stored ? JSON.parse(stored) : {};
			} catch {
				columnWidths = {};
			}
		}
	});

	function persistHiddenColumns() {
		if (!selectedProject || !selectedTable) return;
		const key = `jat-data-hidden-${selectedProject}-${selectedTable}`;
		if (hiddenColumns.size > 0) {
			localStorage.setItem(key, JSON.stringify([...hiddenColumns]));
		} else {
			localStorage.removeItem(key);
		}
	}

	function persistColumnOrder() {
		if (!selectedProject || !selectedTable) return;
		const key = `jat-data-colorder-${selectedProject}-${selectedTable}`;
		if (columnOrder.length > 0) {
			localStorage.setItem(key, JSON.stringify(columnOrder));
		} else {
			localStorage.removeItem(key);
		}
	}

	function persistColumnWidths() {
		if (!selectedProject || !selectedTable) return;
		const key = `jat-data-colwidths-${selectedProject}-${selectedTable}`;
		if (Object.keys(columnWidths).length > 0) {
			localStorage.setItem(key, JSON.stringify(columnWidths));
		} else {
			localStorage.removeItem(key);
		}
	}

	// Column context menu handlers
	function handleColContextMenu(col: ColumnInfo, index: number, event: MouseEvent) {
		event.preventDefault();
		ctxCol = col;
		ctxColIndex = index;
		ctxX = Math.min(event.clientX, window.innerWidth - 220);
		ctxY = Math.min(event.clientY, window.innerHeight - 400);
		ctxVisible = true;
		insertSubmenuOpen = null;
	}

	function closeColContextMenu() {
		ctxVisible = false;
	}

	function handleColCtxOutsideClick(event: MouseEvent) {
		const menu = document.querySelector('.col-context-menu');
		if (menu && !menu.contains(event.target as Node)) {
			closeColContextMenu();
		}
	}

	$effect(() => {
		if (ctxVisible) {
			setTimeout(() => document.addEventListener('click', handleColCtxOutsideClick), 0);
			return () => document.removeEventListener('click', handleColCtxOutsideClick);
		}
	});

	// Column operations via API
	async function colOperation(action: string, data: Record<string, any>) {
		if (!selectedProject || !selectedTable) return;
		try {
			const res = await fetch(`/api/data/tables/${encodeURIComponent(selectedTable)}/columns`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project: selectedProject, action, ...data })
			});
			const result = await res.json();
			if (!res.ok) {
				errorToast(result.error || `Failed to ${action} column`);
				return false;
			}
			await fetchTableData();
			return true;
		} catch {
			errorToast(`Failed to ${action} column`);
			return false;
		}
	}

	function handleCtxSort(dir: 'ASC' | 'DESC') {
		if (!ctxCol) return;
		orderBy = ctxCol.name;
		orderDir = dir;
		offset = 0;
		fetchTableData();
		closeColContextMenu();
	}

	function handleCtxEditColumn() {
		if (!ctxCol) return;
		columnSettingsOpen = ctxCol.name;
		closeColContextMenu();
	}

	async function handleCtxInsertColumn(semanticType: string, sqliteType: string, position: 'before' | 'after') {
		const name = prompt('Column name:');
		if (!name?.trim()) return;
		closeColContextMenu();
		await colOperation('add', { column: name.trim(), sqliteType, semanticType });
	}

	function handleCtxHideColumn() {
		if (!ctxCol) return;
		hiddenColumns = new Set([...hiddenColumns, ctxCol.name]);
		persistHiddenColumns();
		closeColContextMenu();
	}

	function unhideColumn(colName: string) {
		const next = new Set(hiddenColumns);
		next.delete(colName);
		hiddenColumns = next;
		persistHiddenColumns();
	}

	function unhideAll() {
		hiddenColumns = new Set();
		persistHiddenColumns();
	}

	// Column drag-to-reorder handlers
	function handleColDragStart(e: DragEvent, index: number) {
		if (!e.dataTransfer) return;
		colDraggedIndex = index;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', index.toString());
	}

	function handleColDragEnd() {
		colDraggedIndex = null;
		colDragOverIndex = null;
	}

	function handleColDragOver(e: DragEvent, index: number) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
		if (colDraggedIndex !== null && colDraggedIndex !== index) {
			colDragOverIndex = index;
		}
	}

	function handleColDragLeave(e: DragEvent) {
		const relatedTarget = e.relatedTarget as HTMLElement | null;
		if (!relatedTarget?.closest('.col-header-cell')) {
			colDragOverIndex = null;
		}
	}

	function handleColDrop(e: DragEvent, index: number) {
		e.preventDefault();
		if (colDraggedIndex !== null && colDraggedIndex !== index) {
			const cols = [...orderedColumns];
			const [moved] = cols.splice(colDraggedIndex, 1);
			cols.splice(index, 0, moved);
			columnOrder = cols.map(c => c.name);
			persistColumnOrder();
		}
		colDraggedIndex = null;
		colDragOverIndex = null;
	}

	// Column resize handlers
	function handleResizeStart(e: MouseEvent, colName: string) {
		e.preventDefault();
		e.stopPropagation();
		colResizing = colName;
		colResizeStartX = e.clientX;
		const th = (e.target as HTMLElement).parentElement;
		colResizeStartWidth = th ? th.offsetWidth : 120;
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';
		document.addEventListener('mousemove', handleResizeMove);
		document.addEventListener('mouseup', handleResizeEnd);
	}

	function handleResizeMove(e: MouseEvent) {
		if (!colResizing) return;
		const diff = e.clientX - colResizeStartX;
		const newWidth = Math.max(50, colResizeStartWidth + diff);
		columnWidths = { ...columnWidths, [colResizing]: newWidth };
	}

	function handleResizeEnd() {
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
		if (colResizing) {
			persistColumnWidths();
			colResizing = null;
		}
		document.removeEventListener('mousemove', handleResizeMove);
		document.removeEventListener('mouseup', handleResizeEnd);
	}

	onDestroy(() => {
		if (!browser) return;
		document.removeEventListener('mousemove', handleResizeMove);
		document.removeEventListener('mouseup', handleResizeEnd);
	});

	async function handleCtxDuplicate() {
		if (!ctxCol) return;
		const name = prompt('New column name:', `${ctxCol.name}_copy`);
		if (!name?.trim()) return;
		closeColContextMenu();
		await colOperation('duplicate', { sourceColumn: ctxCol.name, newName: name.trim() });
	}

	async function handleCtxRename() {
		if (!ctxCol) return;
		const name = prompt('New column name:', ctxCol.name);
		if (!name?.trim() || name.trim() === ctxCol.name) return;
		closeColContextMenu();
		await colOperation('rename', { column: ctxCol.name, newName: name.trim() });
	}

	function handleCtxCopyColJson() {
		if (!ctxCol) return;
		closeColContextMenu();
		const values = rows.map(row => row[ctxCol!.name]);
		navigator.clipboard.writeText(JSON.stringify(values, null, 2));
		successToast(`Copied ${values.length} values from "${ctxCol.name}"`);
	}

	function handleCopyTableJson() {
		const data = rows.map(row => {
			const obj: Record<string, any> = {};
			for (const col of editableColumns) {
				obj[col.name] = row[col.name];
			}
			return obj;
		});
		navigator.clipboard.writeText(JSON.stringify(data, null, 2));
		successToast(`Copied ${data.length} rows as JSON`);
	}

	async function handleCtxDelete() {
		if (!ctxCol) return;
		if (!confirm(`Delete column "${ctxCol.name}"? This cannot be undone.`)) return;
		closeColContextMenu();
		await colOperation('delete', { column: ctxCol.name });
	}

	// ─── Row context menu ────────────────────────────────────────
	function handleRowContextMenu(row: any, index: number, event: MouseEvent) {
		event.preventDefault();
		rowCtxRow = row;
		rowCtxIndex = index;
		rowCtxX = Math.min(event.clientX, window.innerWidth - 220);
		rowCtxY = Math.min(event.clientY, window.innerHeight - 340);
		rowCtxVisible = true;
		// Close column ctx if open
		ctxVisible = false;
		// Outside click
		setTimeout(() => {
			document.addEventListener('click', handleRowCtxOutsideClick, { once: true });
		}, 0);
		document.addEventListener('keydown', handleRowCtxEscape);
	}

	function closeRowContextMenu() {
		rowCtxVisible = false;
		document.removeEventListener('keydown', handleRowCtxEscape);
	}

	function handleRowCtxOutsideClick(e: MouseEvent) {
		const menu = document.querySelector('.row-context-menu');
		if (menu && !menu.contains(e.target as Node)) {
			closeRowContextMenu();
		} else if (rowCtxVisible) {
			setTimeout(() => {
				document.addEventListener('click', handleRowCtxOutsideClick, { once: true });
			}, 0);
		}
	}

	function handleRowCtxEscape(e: KeyboardEvent) {
		if (e.key === 'Escape') closeRowContextMenu();
	}

	async function handleRowCtxInsertAbove() {
		closeRowContextMenu();
		// Start add-row mode (inserts at end, SQLite doesn't support positional insert)
		startAddRow();
	}

	async function handleRowCtxInsertBelow() {
		closeRowContextMenu();
		startAddRow();
	}

	async function handleRowCtxDuplicate() {
		if (!rowCtxRow || !selectedProject || !selectedTable) return;
		closeRowContextMenu();
		try {
			const res = await fetch(`/api/data/tables/${encodeURIComponent(selectedTable)}/rows`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					project: selectedProject,
					action: 'duplicate',
					rowid: rowCtxRow.rowid
				})
			});
			if (res.ok) {
				await fetchTableData();
				await fetchTables();
				successToast('Row duplicated');
			} else {
				const data = await res.json();
				errorToast(data.error || 'Failed to duplicate row');
			}
		} catch {
			errorToast('Failed to duplicate row');
		}
	}

	function handleRowCtxDeleteRow() {
		if (!rowCtxRow) return;
		closeRowContextMenu();
		deleteRow(rowCtxRow.rowid);
	}

	function handleRowCtxCopyId() {
		if (!rowCtxRow) return;
		closeRowContextMenu();
		navigator.clipboard.writeText(String(rowCtxRow.rowid));
		successToast(`Copied rowid ${rowCtxRow.rowid}`);
	}

	function handleRowCtxCopyRowJson() {
		if (!rowCtxRow) return;
		closeRowContextMenu();
		const data: Record<string, any> = {};
		for (const col of editableColumns) {
			data[col.name] = rowCtxRow[col.name];
		}
		navigator.clipboard.writeText(JSON.stringify(data, null, 2));
		successToast('Row copied as JSON');
	}
</script>

<div class="data-page">
	<!-- Header -->
	<div class="page-header">
		<div class="header-left">
			<h1 class="page-title tracking-in-expand">Data Tables</h1>
		</div>
		{#if selectedProject}
			<button class="btn btn-primary btn-sm gap-1.5" onclick={() => showCreateModal = true}>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
				</svg>
				New Table
			</button>
		{/if}
	</div>

	{#if !selectedProject}
		<div class="empty-state" use:reveal>
			<div class="empty-icon">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5M3.75 3v18M9.75 3v18M15.75 3v18M20.25 3v18" />
				</svg>
			</div>
			<h3 class="empty-title">Select a project</h3>
			<p class="empty-description">Choose a project to manage its data tables.</p>
		</div>
	{:else}
		<!-- Two-panel layout -->
		<div class="panels">
			<!-- Left: Table List -->
			<div class="table-list-panel">
				<div class="panel-header">
					<span class="panel-title">Tables</span>
					<span class="panel-count">{tables.length}</span>
				</div>
				{#if tablesLoading}
					<div class="panel-loading">
						<span class="loading loading-spinner loading-sm"></span>
					</div>
				{:else if tables.length === 0}
					<div class="panel-empty">
						<p>No tables yet</p>
						<button class="btn-create-small" onclick={() => showCreateModal = true}>
							Create first table
						</button>
					</div>
				{:else}
					<div class="table-items">
						{#each tables as table}
							<button
								class="table-item"
								class:selected={selectedTable === table.name}
								onclick={() => selectTable(table.name)}
							>
								<span class="table-name">{table.display_name || table.name}</span>
								<span class="table-meta">{table.row_count} rows</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Right: Table View -->
			<div class="table-view-panel">
				{#if !selectedTable}
					<div class="panel-placeholder">
						{#if tables.length > 0}
							<p>Select a table to view its data</p>
						{:else}
							<div class="empty-state-inline" use:reveal>
								<div class="empty-icon-small">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
										<path d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5M3.75 3v18M9.75 3v18M15.75 3v18M20.25 3v18" />
									</svg>
								</div>
								<h3 class="empty-title-small">No data tables</h3>
								<p class="empty-description-small">
									Create structured data tables for your project. Use them for grocery lists, inventories, logs, or any persistent data your agents need.
								</p>
								<button class="btn btn-primary btn-sm gap-1.5" onclick={() => showCreateModal = true}>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
									</svg>
									Create Your First Table
								</button>
							</div>
						{/if}
					</div>
				{:else}
					<!-- Table header -->
					<div class="view-header">
						<div class="view-title-row">
							<h2 class="view-title">{selectedTable}</h2>
							<span class="view-meta">{totalRows} rows, {editableColumns.length} columns</span>
							{#if hiddenColumns.size > 0}
								<div class="hidden-cols-indicator">
									<button class="hidden-cols-btn" onclick={unhideAll}>
										<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
										</svg>
										{hiddenColumns.size} hidden
									</button>
									<div class="hidden-cols-dropdown">
										{#each [...hiddenColumns] as colName}
											<button class="hidden-col-item" onclick={() => unhideColumn(colName)}>
												<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
													<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
													<path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
												</svg>
												{colName}
											</button>
										{/each}
										<button class="hidden-col-item hidden-col-show-all" onclick={unhideAll}>Show all</button>
									</div>
								</div>
							{/if}
						</div>
						<div class="view-actions">
							<button class="btn-action" onclick={startAddRow} title="Add row">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
								</svg>
								Add Row
							</button>
							<button class="btn-action" onclick={openImportModal} title="Import CSV/TSV">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
								</svg>
								Import
							</button>
							<button class="btn-action" onclick={handleCopyTableJson} title="Copy table as JSON">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
								</svg>
								Copy JSON
							</button>
							<button class="btn-action btn-danger" onclick={() => selectedTable && handleDropTable(selectedTable)} title="Drop table">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
								</svg>
							</button>
						</div>
					</div>

					<!-- Data table -->
					<div class="data-table-container">
						{#if tableDataLoading}
							<div class="panel-loading">
								<span class="loading loading-spinner loading-sm"></span>
							</div>
						{:else}
							<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
							<table class="data-table" tabindex="0" onkeydown={handleTableKeydown} bind:this={tableRef}>
								<thead>
									<tr>
										<th class="row-id-col">#</th>
										{#each orderedColumns as col, colIdx}
										{@const meta = columnMeta[col.name]}
										{@const colWidth = columnWidths[col.name]}
											<th
												class="col-header-cell"
												class:col-dragging={colDraggedIndex === colIdx}
												class:col-drag-over-left={colDragOverIndex === colIdx && colDraggedIndex !== null && colDraggedIndex > colIdx}
												class:col-drag-over-right={colDragOverIndex === colIdx && colDraggedIndex !== null && colDraggedIndex < colIdx}
												class:col-resizing={colResizing === col.name}
												style={colWidth ? `width: ${colWidth}px; min-width: ${colWidth}px; max-width: ${colWidth}px;` : ''}
												draggable={colResizing ? 'false' : 'true'}
												ondragstart={(e) => handleColDragStart(e, colIdx)}
												ondragend={handleColDragEnd}
												ondragover={(e) => handleColDragOver(e, colIdx)}
												ondragleave={handleColDragLeave}
												ondrop={(e) => handleColDrop(e, colIdx)}
												oncontextmenu={(e) => handleColContextMenu(col, colIdx, e)}
											>
												<button class="sort-btn" onclick={() => toggleSort(col.name)}>
													{col.name}
													<span class="col-type">{meta?.semanticType || col.type}</span>
													{#if orderBy === col.name}
														<span class="sort-indicator">{orderDir === 'ASC' ? '↑' : '↓'}</span>
													{/if}
												</button>
												<button
													class="col-settings-btn"
													onclick={() => columnSettingsOpen = columnSettingsOpen === col.name ? null : col.name}
													title="Column settings"
												>
													<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
														<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
														<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
													</svg>
												</button>
												{#if columnSettingsOpen === col.name}
													<ColumnSettingsPopover
														column={col.name}
														semanticType={meta?.semanticType}
														config={meta?.config || {}}
														colIndex={colIdx}
														onSave={(type, cfg) => saveColumnSettings(col.name, type, cfg)}
														onClose={() => columnSettingsOpen = null}
													/>
												{/if}
												<!-- svelte-ignore a11y_no_static_element_interactions -->
												<div
													class="col-resize-handle"
													onmousedown={(e) => handleResizeStart(e, col.name)}
												></div>
											</th>
										{/each}
										<th class="actions-col"></th>
									</tr>
								</thead>
								<tbody>
									{#each rows as row, rowIdx}
										<tr oncontextmenu={(e) => handleRowContextMenu(row, rowIdx, e)}>
											<td class="row-id-col">{row.rowid}</td>
											{#each orderedColumns as col, colIdx}
											{@const cellMeta = columnMeta[col.name]}
											{@const isCellSelected = selectedCell?.rowIdx === rowIdx && selectedCell?.colIdx === colIdx}
												<!-- svelte-ignore a11y_click_events_have_key_events -->
												<td
													class="data-cell"
													class:cell-selected={isCellSelected}
													data-cell-row={rowIdx}
													data-cell-col={colIdx}
													onclick={() => selectCell(rowIdx, colIdx)}
												>
													<DataCell
														value={row[col.name]}
														semanticType={cellMeta?.semanticType}
														config={cellMeta?.config || {}}
														selected={isCellSelected}
														editing={isCellSelected && editingSelectedCell}
														onSave={(val) => handleCellSave(row.rowid, col.name, val)}
													/>
												</td>
											{/each}
											<td class="actions-col">
												<button class="row-delete-btn" onclick={() => deleteRow(row.rowid)} title="Delete row">
													<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
														<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
													</svg>
												</button>
											</td>
										</tr>
									{/each}
									<!-- Add row -->
									{#if addingRow}
										<tr class="add-row">
											<td class="row-id-col">+</td>
											{#each orderedColumns as col}
												<td>
													<input
														class="cell-edit-input"
														bind:value={newRowData[col.name]}
														placeholder={col.name}
														onkeydown={(e) => {
															if (e.key === 'Enter') saveNewRow();
															if (e.key === 'Escape') { addingRow = false; }
														}}
													/>
												</td>
											{/each}
											<td class="actions-col">
												<button class="row-save-btn" onclick={saveNewRow} title="Save">
													<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
														<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
													</svg>
												</button>
											</td>
										</tr>
									{/if}
								</tbody>
							</table>
						{/if}
					</div>

					<!-- Pagination -->
					{#if totalRows > limit}
						<div class="pagination">
							<button class="btn-page" onclick={prevPage} disabled={offset === 0}>Prev</button>
							<span class="page-info">
								{offset + 1}–{Math.min(offset + limit, totalRows)} of {totalRows}
							</span>
							<button class="btn-page" onclick={nextPage} disabled={offset + limit >= totalRows}>Next</button>
						</div>
					{/if}

					<!-- SQL Console -->
					<div class="sql-console">
						<button class="sql-toggle" onclick={() => sqlConsoleOpen = !sqlConsoleOpen}>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 toggle-icon" class:rotated={sqlConsoleOpen} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
							</svg>
							SQL Console
						</button>
						{#if sqlConsoleOpen}
							<div class="sql-body">
								<textarea
									class="sql-input"
									bind:value={sqlText}
									placeholder="SELECT * FROM {selectedTable} WHERE ..."
									rows="3"
									onkeydown={(e) => {
										if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) runSql('query');
									}}
								></textarea>
								<div class="sql-actions">
									<button class="btn-sql" onclick={() => runSql('query')} disabled={sqlRunning || !sqlText.trim()}>
										{#if sqlRunning}<span class="loading loading-spinner loading-xs"></span>{/if}
										Run Query
									</button>
									<button class="btn-sql btn-sql-exec" onclick={() => runSql('exec')} disabled={sqlRunning || !sqlText.trim()}>
										Run Exec
									</button>
									<span class="sql-hint">Ctrl+Enter to run query</span>
								</div>
								{#if sqlError}
									<div class="sql-error">{sqlError}</div>
								{/if}
								{#if sqlResult?.rows}
									<div class="sql-results">
										<table class="data-table">
											<thead>
												<tr>
													{#each Object.keys(sqlResult.rows[0] || {}) as key}
														<th>{key}</th>
													{/each}
												</tr>
											</thead>
											<tbody>
												{#each sqlResult.rows as row}
													<tr>
														{#each Object.values(row) as val}
															<td class="data-cell">
																<span class="cell-value" class:null-value={val === null}>
																	{val === null ? 'NULL' : val}
																</span>
															</td>
														{/each}
													</tr>
												{/each}
											</tbody>
										</table>
										<div class="sql-result-count">{sqlResult.rows.length} row(s)</div>
									</div>
								{:else if sqlResult?.success}
									<div class="sql-success">{sqlResult.changes} row(s) affected</div>
								{/if}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Create Table Modal -->
{#if showCreateModal}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => showCreateModal = false} role="dialog" aria-modal="true">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-panel" class:create-modal-wide={createMode !== 'manual'} onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3 class="modal-title">Create Table</h3>
				<button class="modal-close" onclick={() => showCreateModal = false} aria-label="Close">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width:16px;height:16px">
						<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
					</svg>
				</button>
			</div>

			<div class="modal-body">
				<!-- Mode Switcher -->
				<div class="create-mode-switcher">
					<button class="create-mode-btn" class:active={createMode === 'manual'} onclick={() => switchCreateMode('manual')}>Manual</button>
					<button class="create-mode-btn" class:active={createMode === 'csv'} onclick={() => switchCreateMode('csv')}>CSV / TSV</button>
					<button class="create-mode-btn" class:active={createMode === 'json'} onclick={() => switchCreateMode('json')}>JSON</button>
					<button class="create-mode-btn" class:active={createMode === 'sql'} onclick={() => switchCreateMode('sql')}>SQL</button>
				</div>

				<div class="form-group">
					<label class="form-label" for="table-name">Table Name</label>
					<input id="table-name" type="text" class="form-input font-mono" bind:value={newTableName} placeholder="groceries" />
					<span class="form-hint">Letters, numbers, underscores. No spaces.</span>
				</div>

				<!-- Manual Mode -->
				{#if createMode === 'manual'}
					<div class="form-group">
						<label class="form-label" for="table-display">Display Name (optional)</label>
						<input id="table-display" type="text" class="form-input" bind:value={newTableDisplayName} placeholder="Grocery List" />
					</div>

					<div class="form-group">
						<label class="form-label" for="table-desc">Description (optional)</label>
						<input id="table-desc" type="text" class="form-input" bind:value={newTableDescription} placeholder="Shared shopping list" />
					</div>

					<div class="form-group">
						<label class="form-label">Columns</label>
						{#each newTableColumns as col, i}
							<div class="column-row">
								<input
									type="text"
									class="form-input font-mono flex-1"
									bind:value={col.name}
									placeholder="column_name"
								/>
								<ColumnTypeSelector
									value={col.semanticType || 'text'}
									onChange={(type) => { col.semanticType = type; }}
								/>
								{#if newTableColumns.length > 1}
									<button class="btn-remove-col" onclick={() => removeColumn(i)} title="Remove column">
										<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								{/if}
							</div>
						{/each}
						<button class="btn-add-col" onclick={addColumn}>+ Add Column</button>
					</div>

				<!-- CSV/TSV Mode -->
				{:else if createMode === 'csv'}
					<div class="form-group">
						<div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.25rem;">
							<label class="form-label" style="margin:0">Data</label>
							<div class="create-format-pills">
								<button class="format-pill" class:active={createCsvFormat === 'auto'} onclick={() => createCsvFormat = 'auto'}>Auto</button>
								<button class="format-pill" class:active={createCsvFormat === 'tsv'} onclick={() => createCsvFormat = 'tsv'}>TSV</button>
								<button class="format-pill" class:active={createCsvFormat === 'csv'} onclick={() => createCsvFormat = 'csv'}>CSV</button>
							</div>
						</div>
						<textarea
							class="create-textarea"
							bind:value={createCsvText}
							placeholder={"name\tage\tcity\nAlice\t30\tNew York\nBob\t25\tSan Francisco"}
							rows="10"
						></textarea>
						<button class="btn-add-col" onclick={() => parseAndInferCsv(createCsvText, createCsvFormat)} style="align-self:flex-start">
							Parse & Detect Types
						</button>
					</div>

				<!-- JSON Mode -->
				{:else if createMode === 'json'}
					<div class="form-group">
						<label class="form-label">JSON Array</label>
						<textarea
							class="create-textarea"
							bind:value={createJsonText}
							placeholder={'[\n  {"name": "Alice", "age": 30, "city": "New York"},\n  {"name": "Bob", "age": 25, "city": "San Francisco"}\n]'}
							rows="10"
						></textarea>
						<button class="btn-add-col" onclick={() => parseAndInferJson(createJsonText)} style="align-self:flex-start">
							Parse & Detect Types
						</button>
					</div>

				<!-- SQL Mode -->
				{:else if createMode === 'sql'}
					<div class="form-group">
						<label class="form-label">CREATE TABLE Statement</label>
						<textarea
							class="create-textarea"
							bind:value={createSqlText}
							placeholder={"CREATE TABLE users (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT,\n  age INTEGER\n);"}
							rows="8"
						></textarea>
						<button class="btn-add-col" onclick={() => parseSqlCreate(createSqlText)} style="align-self:flex-start">
							Parse Columns
						</button>
						<span class="form-hint">Only column definitions are used. Constraints and indexes are ignored.</span>
					</div>
				{/if}

				<!-- Inferred columns preview (shared by csv/json/sql) -->
				{#if createMode !== 'manual' && inferredColumns.length > 0}
					<div class="form-group">
						<div style="display:flex; align-items:center; gap:0.5rem;">
							<label class="form-label" style="margin:0">Detected Columns</label>
							{#if inferredRows.length > 0}
								<span class="inferred-badge">{inferredRows.length} row{inferredRows.length !== 1 ? 's' : ''}</span>
							{/if}
						</div>
						<div class="inferred-table-wrap">
							<table class="inferred-table">
								<thead>
									<tr>
										<th>Column</th>
										<th>Type</th>
										{#if inferredRows.length > 0}
											<th>Sample</th>
										{/if}
									</tr>
								</thead>
								<tbody>
									{#each inferredColumns as col, i}
										<tr>
											<td class="font-mono">{col.name}</td>
											<td>
												<ColumnTypeSelector
													value={col.semanticType}
													onChange={(type) => {
														inferredColumns[i] = { ...col, semanticType: type, type: SEMANTIC_TO_SQLITE[type] };
														inferredColumns = [...inferredColumns];
													}}
												/>
											</td>
											{#if inferredRows.length > 0}
												<td class="sample-cell">{String(inferredRows[0]?.[col.name] ?? '')}</td>
											{/if}
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/if}

				<!-- Error display -->
				{#if createPreviewError}
					<div class="create-preview-error">{createPreviewError}</div>
				{/if}
			</div>

			<div class="modal-footer">
				<button class="btn-cancel" onclick={() => showCreateModal = false}>Cancel</button>
				<button class="btn-save" onclick={handleCreateTable} disabled={createSaving || !newTableName.trim() || (createMode !== 'manual' && inferredColumns.length === 0)}>
					{#if createSaving}
						<span class="loading loading-spinner loading-xs"></span>
					{/if}
					{createMode === 'manual' ? 'Create Table' : createMode === 'sql' ? 'Create Table' : `Create & Import ${inferredRows.length > 0 ? `(${inferredRows.length} rows)` : ''}`}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Import Modal -->
{#if showImportModal}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => showImportModal = false} role="dialog" aria-modal="true">
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-panel import-modal" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3 class="modal-title">Import into {selectedTable}</h3>
				<button class="modal-close" onclick={() => showImportModal = false} aria-label="Close">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width:16px;height:16px">
						<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
					</svg>
				</button>
			</div>

			<div class="modal-body">
				<!-- File picker -->
				<div class="form-group">
					<label class="form-label">Choose file or paste data</label>
					<div class="import-source-row">
						<label class="file-picker-btn">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							{importFileName || 'Choose File'}
							<input type="file" accept=".csv,.tsv,.txt,.md" onchange={handleFileSelect} class="hidden-file-input" />
						</label>
						<select class="format-select" bind:value={importFormat} onchange={() => { if (importText) previewImport(); }}>
							<option value="auto">Auto-detect</option>
							<option value="tsv">TSV (tabs)</option>
							<option value="csv">CSV (commas)</option>
						</select>
					</div>
				</div>

				<!-- Paste area -->
				<div class="form-group">
					<textarea
						class="import-textarea"
						bind:value={importText}
						placeholder="Paste TSV or CSV content here...&#10;&#10;header1&#9;header2&#9;header3&#10;value1&#9;value2&#9;value3"
						rows="6"
						oninput={() => { if (importText.trim()) previewImport(); else importPreview = null; }}
					></textarea>
				</div>

				<!-- Preview -->
				{#if importPreviewing}
					<div class="panel-loading"><span class="loading loading-spinner loading-sm"></span></div>
				{/if}

				{#if importError}
					<div class="import-error">{importError}</div>
				{/if}

				{#if importPreview}
					<div class="import-preview-section">
						<div class="preview-header">
							<span class="preview-title">Preview</span>
							<div class="preview-stats">
								<span class="preview-matched">{importPreview.matched.length} matched</span>
								{#if importPreview.unmatched.length > 0}
									<span class="preview-unmatched">{importPreview.unmatched.length} unmatched</span>
								{/if}
							</div>
						</div>

						<!-- Column mapping -->
						<div class="column-mapping">
							{#each importPreview.headers as h}
								<span class="col-badge" class:col-matched={importPreview.matched.includes(h)} class:col-unmatched={!importPreview.matched.includes(h)}>
									{h}
								</span>
							{/each}
						</div>

						<!-- Preview table -->
						<div class="preview-table-container">
							<table class="data-table preview-table">
								<thead>
									<tr>
										{#each importPreview.matched as h}
											<th>{h}</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#each importPreview.rows as row}
										<tr>
											{#each importPreview.matched as h}
												{@const val = row[h] || ''}
												<td class="data-cell">
													<span class="cell-value" class:null-value={!val}>
														{val.length > 60 ? val.slice(0, 60) + '...' : (val || 'NULL')}
													</span>
												</td>
											{/each}
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
						<div class="preview-note">Showing first {importPreview.rows.length} rows</div>
					</div>
				{/if}
			</div>

			<div class="modal-footer">
				<button class="btn-cancel" onclick={() => showImportModal = false}>Cancel</button>
				<button
					class="btn-save"
					onclick={executeImport}
					disabled={importImporting || !importPreview || importPreview.matched.length === 0}
				>
					{#if importImporting}
						<span class="loading loading-spinner loading-xs"></span>
					{/if}
					Import
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Column Context Menu -->
{#if ctxCol}
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="col-context-menu"
	class:col-context-menu-hidden={!ctxVisible}
	style="left: {ctxX}px; top: {ctxY}px;"
	onkeydown={(e) => { if (e.key === 'Escape') closeColContextMenu(); }}
>
	<!-- Edit Column -->
	<button class="col-context-menu-item" onclick={handleCtxEditColumn}>
		<svg xmlns="http://www.w3.org/2000/svg" class="ctx-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
			<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
		</svg>
		Edit Column
	</button>

	<!-- Sort -->
	<button class="col-context-menu-item" onclick={() => handleCtxSort('ASC')}>
		<svg xmlns="http://www.w3.org/2000/svg" class="ctx-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
		</svg>
		Sort Ascending
	</button>
	<button class="col-context-menu-item" onclick={() => handleCtxSort('DESC')}>
		<svg xmlns="http://www.w3.org/2000/svg" class="ctx-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
		</svg>
		Sort Descending
	</button>

	<div class="col-context-menu-divider"></div>

	<!-- Insert Column Before -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="col-context-menu-item col-context-menu-submenu-container"
		onmouseenter={() => insertSubmenuOpen = 'before'}
		onmouseleave={() => insertSubmenuOpen = null}
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="ctx-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
		</svg>
		Insert Column Before
		<span class="col-context-menu-chevron">›</span>
		{#if insertSubmenuOpen === 'before'}
			<div class="col-context-submenu">
				<div class="submenu-group-label">basic</div>
				{#each SEMANTIC_TYPE_INFO.filter(t => t.group === 'basic') as typeInfo}
					<button class="col-context-menu-item" onclick={() => handleCtxInsertColumn(typeInfo.type, typeInfo.sqliteType, 'before')}>
						<span class="type-icon">{typeInfo.icon}</span>
						{typeInfo.label}
					</button>
				{/each}
				<div class="submenu-group-label">rich</div>
				{#each SEMANTIC_TYPE_INFO.filter(t => t.group === 'rich') as typeInfo}
					<button class="col-context-menu-item" onclick={() => handleCtxInsertColumn(typeInfo.type, typeInfo.sqliteType, 'before')}>
						<span class="type-icon">{typeInfo.icon}</span>
						{typeInfo.label}
					</button>
				{/each}
				<div class="submenu-group-label">advanced</div>
				{#each SEMANTIC_TYPE_INFO.filter(t => t.group === 'advanced') as typeInfo}
					<button class="col-context-menu-item" onclick={() => handleCtxInsertColumn(typeInfo.type, typeInfo.sqliteType, 'before')}>
						<span class="type-icon">{typeInfo.icon}</span>
						{typeInfo.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Insert Column After -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="col-context-menu-item col-context-menu-submenu-container"
		onmouseenter={() => insertSubmenuOpen = 'after'}
		onmouseleave={() => insertSubmenuOpen = null}
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="ctx-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
		</svg>
		Insert Column After
		<span class="col-context-menu-chevron">›</span>
		{#if insertSubmenuOpen === 'after'}
			<div class="col-context-submenu">
				<div class="submenu-group-label">basic</div>
				{#each SEMANTIC_TYPE_INFO.filter(t => t.group === 'basic') as typeInfo}
					<button class="col-context-menu-item" onclick={() => handleCtxInsertColumn(typeInfo.type, typeInfo.sqliteType, 'after')}>
						<span class="type-icon">{typeInfo.icon}</span>
						{typeInfo.label}
					</button>
				{/each}
				<div class="submenu-group-label">rich</div>
				{#each SEMANTIC_TYPE_INFO.filter(t => t.group === 'rich') as typeInfo}
					<button class="col-context-menu-item" onclick={() => handleCtxInsertColumn(typeInfo.type, typeInfo.sqliteType, 'after')}>
						<span class="type-icon">{typeInfo.icon}</span>
						{typeInfo.label}
					</button>
				{/each}
				<div class="submenu-group-label">advanced</div>
				{#each SEMANTIC_TYPE_INFO.filter(t => t.group === 'advanced') as typeInfo}
					<button class="col-context-menu-item" onclick={() => handleCtxInsertColumn(typeInfo.type, typeInfo.sqliteType, 'after')}>
						<span class="type-icon">{typeInfo.icon}</span>
						{typeInfo.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="col-context-menu-divider"></div>

	<!-- Hide Column -->
	<button class="col-context-menu-item" onclick={handleCtxHideColumn}>
		<svg xmlns="http://www.w3.org/2000/svg" class="ctx-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
		</svg>
		Hide Column
	</button>

	<!-- Reset Column Order -->
	{#if columnOrder.length > 0}
	<button class="col-context-menu-item" onclick={() => { columnOrder = []; persistColumnOrder(); closeColContextMenu(); }}>
		<svg xmlns="http://www.w3.org/2000/svg" class="ctx-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
		</svg>
		Reset Column Order
	</button>
	{/if}

	<!-- Reset Column Widths -->
	{#if Object.keys(columnWidths).length > 0}
	<button class="col-context-menu-item" onclick={() => { columnWidths = {}; persistColumnWidths(); closeColContextMenu(); }}>
		<svg xmlns="http://www.w3.org/2000/svg" class="ctx-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
		</svg>
		Reset Column Widths
	</button>
	{/if}

	<div class="col-context-menu-divider"></div>

	<!-- Duplicate -->
	<button class="col-context-menu-item" onclick={handleCtxDuplicate}>
		<svg xmlns="http://www.w3.org/2000/svg" class="ctx-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
		</svg>
		Duplicate Column
	</button>

	<!-- Rename -->
	<button class="col-context-menu-item" onclick={handleCtxRename}>
		<svg xmlns="http://www.w3.org/2000/svg" class="ctx-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
		</svg>
		Rename Column
	</button>

	<div class="col-context-menu-divider"></div>

	<!-- Copy Column as JSON -->
	<button class="col-context-menu-item" onclick={handleCtxCopyColJson}>
		<svg xmlns="http://www.w3.org/2000/svg" class="ctx-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
		</svg>
		Copy Column as JSON
	</button>

	<!-- Delete (danger) -->
	<button class="col-context-menu-item col-context-menu-danger" onclick={handleCtxDelete}>
		<svg xmlns="http://www.w3.org/2000/svg" class="ctx-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
		</svg>
		Delete Column
	</button>
</div>
{/if}

<!-- Row Context Menu -->
{#if rowCtxRow}
<div
	class="col-context-menu row-context-menu"
	class:col-context-menu-hidden={!rowCtxVisible}
	style="left: {rowCtxX}px; top: {rowCtxY}px;"
>
	<!-- Insert Row -->
	<button class="col-context-menu-item" onclick={handleRowCtxInsertAbove}>
		<svg xmlns="http://www.w3.org/2000/svg" class="ctx-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
		</svg>
		Insert Row
	</button>

	<div class="col-context-menu-divider"></div>

	<!-- Duplicate -->
	<button class="col-context-menu-item" onclick={handleRowCtxDuplicate}>
		<svg xmlns="http://www.w3.org/2000/svg" class="ctx-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
		</svg>
		Duplicate Row
	</button>

	<div class="col-context-menu-divider"></div>

	<!-- Copy -->
	<button class="col-context-menu-item" onclick={handleRowCtxCopyId}>
		<svg xmlns="http://www.w3.org/2000/svg" class="ctx-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
		</svg>
		Copy Row ID
	</button>
	<button class="col-context-menu-item" onclick={handleRowCtxCopyRowJson}>
		<svg xmlns="http://www.w3.org/2000/svg" class="ctx-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
		</svg>
		Copy Row as JSON
	</button>

	<div class="col-context-menu-divider"></div>

	<!-- Delete (danger) -->
	<button class="col-context-menu-item col-context-menu-danger" onclick={handleRowCtxDeleteRow}>
		<svg xmlns="http://www.w3.org/2000/svg" class="ctx-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
		</svg>
		Delete Row
	</button>
</div>
{/if}

<style>
	.data-page {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem 1.5rem;
		height: 100%;
		overflow: hidden;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-shrink: 0;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.page-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: oklch(0.90 0.02 250);
		letter-spacing: -0.01em;
	}

	/* Panels */
	.panels {
		display: flex;
		gap: 1px;
		flex: 1;
		min-height: 0;
		background: oklch(0.25 0.02 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.table-list-panel {
		width: 200px;
		min-width: 160px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		background: oklch(0.16 0.01 250);
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 0.75rem;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.panel-title {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(0.55 0.02 250);
	}

	.panel-count {
		font-size: 0.625rem;
		color: oklch(0.45 0.02 250);
		background: oklch(0.22 0.01 250);
		padding: 0.0625rem 0.375rem;
		border-radius: 9999px;
	}

	.panel-loading {
		display: flex;
		justify-content: center;
		padding: 1.5rem;
	}

	.panel-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.5rem 0.75rem;
		text-align: center;
	}
	.panel-empty p {
		font-size: 0.75rem;
		color: oklch(0.50 0.02 250);
	}

	.btn-create-small {
		font-size: 0.6875rem;
		padding: 0.25rem 0.5rem;
		border: 1px solid oklch(0.35 0.10 200 / 0.4);
		background: oklch(0.25 0.06 200 / 0.2);
		color: oklch(0.75 0.12 200);
		border-radius: 0.25rem;
		cursor: pointer;
	}
	.btn-create-small:hover {
		background: oklch(0.30 0.08 200 / 0.3);
	}

	.table-items {
		overflow-y: auto;
		flex: 1;
	}

	.table-item {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: none;
		background: transparent;
		cursor: pointer;
		text-align: left;
		border-bottom: 1px solid oklch(0.22 0.01 250);
		transition: background 0.1s;
	}
	.table-item:hover {
		background: oklch(0.20 0.02 250);
	}
	.table-item.selected {
		background: oklch(0.25 0.06 200 / 0.2);
		border-left: 2px solid oklch(0.60 0.15 200);
	}

	.table-name {
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(0.85 0.02 250);
	}

	.table-meta {
		font-size: 0.6875rem;
		color: oklch(0.50 0.02 250);
	}

	/* Table view */
	.table-view-panel {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: oklch(0.16 0.01 250);
		min-width: 0;
		overflow: hidden;
	}

	.panel-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		color: oklch(0.45 0.02 250);
		font-size: 0.8125rem;
	}

	.view-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 0.75rem;
		border-bottom: 1px solid oklch(0.25 0.02 250);
		flex-shrink: 0;
	}

	.view-title-row {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}

	.view-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: oklch(0.85 0.02 250);
		font-family: monospace;
	}

	.view-meta {
		font-size: 0.6875rem;
		color: oklch(0.50 0.02 250);
	}

	.view-actions {
		display: flex;
		gap: 0.375rem;
	}

	.btn-action {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.6875rem;
		padding: 0.25rem 0.5rem;
		border: 1px solid oklch(0.30 0.02 250);
		background: oklch(0.20 0.01 250);
		color: oklch(0.70 0.02 250);
		border-radius: 0.25rem;
		cursor: pointer;
	}
	.btn-action:hover {
		background: oklch(0.25 0.02 250);
		color: oklch(0.85 0.02 250);
	}
	.btn-action.btn-danger:hover {
		background: oklch(0.30 0.10 25 / 0.2);
		border-color: oklch(0.50 0.15 25 / 0.4);
		color: oklch(0.75 0.15 25);
	}

	/* Data table */
	.data-table-container {
		flex: 1;
		overflow: auto;
		min-height: 0;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8125rem;
		outline: none;
	}

	.data-table th {
		position: sticky;
		top: 0;
		z-index: 10;
		background: oklch(0.19 0.01 250);
		padding: 0.375rem 0.5rem;
		border-bottom: 1px solid oklch(0.28 0.02 250);
		text-align: left;
		font-weight: 600;
		color: oklch(0.65 0.02 250);
		font-size: 0.75rem;
		white-space: nowrap;
	}

	.data-table td {
		padding: 0.3125rem 0.5rem;
		border-bottom: 1px solid oklch(0.22 0.01 250);
		color: oklch(0.80 0.02 250);
	}

	.data-table tbody tr:hover {
		background: oklch(0.20 0.02 250);
	}

	.row-id-col {
		width: 48px;
		color: oklch(0.45 0.02 250);
		font-family: monospace;
		font-size: 0.6875rem;
	}

	.actions-col {
		width: 36px;
		text-align: center;
	}

	.sort-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;
		font-size: inherit;
		font-weight: inherit;
		padding: 0;
	}
	.sort-btn:hover {
		color: oklch(0.85 0.02 250);
	}

	.col-header-cell {
		position: relative;
		cursor: grab;
	}
	.col-header-cell[draggable='true']:active {
		cursor: grabbing;
	}
	.col-dragging {
		opacity: 0.4;
	}
	.col-drag-over-left {
		box-shadow: inset 3px 0 0 0 oklch(0.65 0.15 200);
	}
	.col-drag-over-right {
		box-shadow: inset -3px 0 0 0 oklch(0.65 0.15 200);
	}
	.col-resize-handle {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		width: 5px;
		cursor: col-resize;
		z-index: 2;
	}
	.col-resize-handle:hover,
	.col-resizing .col-resize-handle {
		background: oklch(0.55 0.15 200);
	}

	.col-type {
		font-size: 0.5625rem;
		color: oklch(0.45 0.02 250);
		text-transform: lowercase;
	}

	.col-settings-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		color: oklch(0.40 0.02 250);
		cursor: pointer;
		padding: 0.125rem;
		border-radius: 0.1875rem;
		opacity: 0;
		transition: opacity 0.1s;
		vertical-align: middle;
		margin-left: 0.125rem;
	}
	.col-header-cell:hover .col-settings-btn {
		opacity: 1;
	}
	.col-settings-btn:hover {
		color: oklch(0.70 0.12 200);
	}

	.sort-indicator {
		color: oklch(0.70 0.15 200);
	}

	.data-cell {
		cursor: default;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.data-cell.cell-selected {
		outline: 2px solid oklch(0.60 0.15 240);
		outline-offset: -2px;
		background: oklch(0.60 0.15 240 / 0.08);
	}

	.cell-value {
		/* default */
	}
	.null-value {
		color: oklch(0.40 0.02 250);
		font-style: italic;
	}

	.cell-edit-input {
		width: 100%;
		padding: 0.125rem 0.25rem;
		font-size: 0.8125rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.50 0.10 200);
		border-radius: 0.1875rem;
		color: oklch(0.90 0.02 250);
		outline: none;
	}

	.row-delete-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		color: oklch(0.40 0.02 250);
		cursor: pointer;
		padding: 0.125rem;
		border-radius: 0.1875rem;
		opacity: 0;
		transition: opacity 0.1s;
	}
	.data-table tbody tr:hover .row-delete-btn {
		opacity: 1;
	}
	.row-delete-btn:hover {
		color: oklch(0.70 0.15 25);
		background: oklch(0.30 0.10 25 / 0.2);
	}

	.row-save-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		color: oklch(0.65 0.15 145);
		cursor: pointer;
		padding: 0.125rem;
		border-radius: 0.1875rem;
	}
	.row-save-btn:hover {
		background: oklch(0.30 0.10 145 / 0.2);
	}

	.add-row td {
		background: oklch(0.18 0.02 145 / 0.1);
	}

	/* Pagination */
	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 0.5rem;
		border-top: 1px solid oklch(0.25 0.02 250);
		flex-shrink: 0;
	}

	.btn-page {
		font-size: 0.6875rem;
		padding: 0.1875rem 0.5rem;
		border: 1px solid oklch(0.30 0.02 250);
		background: oklch(0.20 0.01 250);
		color: oklch(0.70 0.02 250);
		border-radius: 0.25rem;
		cursor: pointer;
	}
	.btn-page:hover:not(:disabled) {
		background: oklch(0.25 0.02 250);
	}
	.btn-page:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.page-info {
		font-size: 0.6875rem;
		color: oklch(0.50 0.02 250);
	}

	/* SQL Console */
	.sql-console {
		border-top: 1px solid oklch(0.25 0.02 250);
		flex-shrink: 0;
	}

	.sql-toggle {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		background: none;
		border: none;
		color: oklch(0.55 0.02 250);
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		text-align: left;
	}
	.sql-toggle:hover {
		color: oklch(0.75 0.02 250);
	}

	.toggle-icon {
		transition: transform 0.15s;
	}
	.toggle-icon.rotated {
		transform: rotate(90deg);
	}

	.sql-body {
		padding: 0 0.75rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.sql-input {
		width: 100%;
		font-family: monospace;
		font-size: 0.8125rem;
		padding: 0.5rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.375rem;
		color: oklch(0.85 0.02 250);
		outline: none;
		resize: vertical;
	}
	.sql-input:focus {
		border-color: oklch(0.50 0.10 200);
	}

	.sql-actions {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.btn-sql {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.6875rem;
		padding: 0.25rem 0.625rem;
		border: 1px solid oklch(0.35 0.10 200 / 0.4);
		background: oklch(0.25 0.06 200 / 0.2);
		color: oklch(0.80 0.10 200);
		border-radius: 0.25rem;
		cursor: pointer;
	}
	.btn-sql:hover:not(:disabled) {
		background: oklch(0.30 0.08 200 / 0.3);
	}
	.btn-sql:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.btn-sql-exec {
		border-color: oklch(0.35 0.10 45 / 0.4);
		background: oklch(0.25 0.06 45 / 0.2);
		color: oklch(0.80 0.10 45);
	}
	.btn-sql-exec:hover:not(:disabled) {
		background: oklch(0.30 0.08 45 / 0.3);
	}

	.sql-hint {
		font-size: 0.625rem;
		color: oklch(0.40 0.02 250);
		margin-left: auto;
	}

	.sql-error {
		font-size: 0.75rem;
		padding: 0.375rem 0.5rem;
		background: oklch(0.25 0.08 25 / 0.2);
		border: 1px solid oklch(0.40 0.12 25 / 0.3);
		border-radius: 0.25rem;
		color: oklch(0.75 0.15 25);
	}

	.sql-success {
		font-size: 0.75rem;
		padding: 0.375rem 0.5rem;
		background: oklch(0.25 0.08 145 / 0.2);
		border: 1px solid oklch(0.40 0.12 145 / 0.3);
		border-radius: 0.25rem;
		color: oklch(0.70 0.15 145);
	}

	.sql-results {
		max-height: 250px;
		overflow: auto;
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.375rem;
	}

	.sql-result-count {
		font-size: 0.625rem;
		color: oklch(0.45 0.02 250);
		padding: 0.25rem 0.5rem;
		border-top: 1px solid oklch(0.25 0.02 250);
		background: oklch(0.18 0.01 250);
	}

	/* Loading / Empty states */
	.loading-state {
		display: flex;
		justify-content: center;
		padding: 3rem;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 3rem 2rem;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.5rem;
		text-align: center;
	}

	.empty-icon {
		width: 48px;
		height: 48px;
		color: oklch(0.40 0.02 250);
		margin-bottom: 0.25rem;
	}
	.empty-icon svg {
		width: 100%;
		height: 100%;
	}

	.empty-title {
		font-size: 1rem;
		font-weight: 600;
		color: oklch(0.75 0.02 250);
	}

	.empty-description {
		font-size: 0.8125rem;
		color: oklch(0.55 0.02 250);
		line-height: 1.6;
		max-width: 480px;
	}

	/* Inline empty state (inside panel) */
	.empty-state-inline {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 2rem;
		text-align: center;
	}

	.empty-icon-small {
		width: 36px;
		height: 36px;
		color: oklch(0.35 0.02 250);
	}
	.empty-icon-small svg {
		width: 100%;
		height: 100%;
	}

	.empty-title-small {
		font-size: 0.875rem;
		font-weight: 600;
		color: oklch(0.65 0.02 250);
	}

	.empty-description-small {
		font-size: 0.75rem;
		color: oklch(0.50 0.02 250);
		line-height: 1.6;
		max-width: 380px;
	}

	/* Modal (same as chores page) */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: oklch(0 0 0 / 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
	}

	.modal-panel {
		background: oklch(0.20 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.75rem;
		width: 520px;
		max-width: 90vw;
		max-height: 85vh;
		overflow-y: auto;
		box-shadow: 0 20px 60px oklch(0 0 0 / 0.4);
	}

	.modal-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		border-bottom: 1px solid oklch(0.28 0.02 250);
	}

	.modal-title {
		font-size: 1rem;
		font-weight: 600;
		color: oklch(0.85 0.02 250);
	}

	.modal-close {
		margin-left: auto;
		background: none;
		border: none;
		color: oklch(0.50 0.02 250);
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 0.25rem;
	}
	.modal-close:hover {
		color: oklch(0.80 0.02 250);
		background: oklch(0.25 0.02 250);
	}

	.modal-body {
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.form-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: oklch(0.65 0.02 250);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.form-input {
		padding: 0.5rem 0.625rem;
		font-size: 0.8125rem;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.375rem;
		color: oklch(0.85 0.02 250);
		outline: none;
	}
	.form-input:focus {
		border-color: oklch(0.50 0.10 200);
	}

	.font-mono {
		font-family: monospace;
	}

	.form-hint {
		font-size: 0.6875rem;
		color: oklch(0.45 0.02 250);
	}

	.column-row {
		display: flex;
		gap: 0.375rem;
		align-items: center;
	}

	.flex-1 {
		flex: 1;
	}

	.col-type-select {
		width: 110px;
	}

	.btn-remove-col {
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		color: oklch(0.45 0.02 250);
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 0.25rem;
	}
	.btn-remove-col:hover {
		color: oklch(0.70 0.15 25);
		background: oklch(0.25 0.08 25 / 0.2);
	}

	.btn-add-col {
		font-size: 0.6875rem;
		padding: 0.25rem;
		background: none;
		border: none;
		color: oklch(0.60 0.10 200);
		cursor: pointer;
		text-align: left;
	}
	.btn-add-col:hover {
		color: oklch(0.80 0.10 200);
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		border-top: 1px solid oklch(0.28 0.02 250);
	}

	.btn-cancel {
		padding: 0.375rem 0.75rem;
		font-size: 0.8125rem;
		background: transparent;
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.375rem;
		color: oklch(0.65 0.02 250);
		cursor: pointer;
	}
	.btn-cancel:hover {
		background: oklch(0.25 0.02 250);
	}

	.btn-save {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		font-size: 0.8125rem;
		background: oklch(0.35 0.10 200 / 0.3);
		border: 1px solid oklch(0.50 0.10 200 / 0.4);
		border-radius: 0.375rem;
		color: oklch(0.85 0.10 200);
		cursor: pointer;
	}
	.btn-save:hover:not(:disabled) {
		background: oklch(0.40 0.12 200 / 0.4);
	}
	.btn-save:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Create modal - multi-mode */
	.create-modal-wide {
		max-width: 700px;
		width: 90vw;
	}

	.create-mode-switcher {
		display: flex;
		border-radius: 0.5rem;
		overflow: hidden;
		border: 1px solid oklch(0.30 0.02 250);
	}

	.create-mode-btn {
		flex: 1;
		padding: 0.375rem 0.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		background: oklch(0.16 0.01 250);
		color: oklch(0.55 0.02 250);
		border: none;
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
	}
	.create-mode-btn:not(:last-child) {
		border-right: 1px solid oklch(0.30 0.02 250);
	}
	.create-mode-btn:hover {
		background: oklch(0.22 0.02 250);
		color: oklch(0.75 0.02 250);
	}
	.create-mode-btn.active {
		background: oklch(0.30 0.08 240);
		color: oklch(0.90 0.05 240);
	}

	.create-format-pills {
		display: flex;
		gap: 0.25rem;
	}
	.format-pill {
		padding: 0.125rem 0.5rem;
		font-size: 0.6875rem;
		border-radius: 1rem;
		border: 1px solid oklch(0.30 0.02 250);
		background: oklch(0.16 0.01 250);
		color: oklch(0.55 0.02 250);
		cursor: pointer;
	}
	.format-pill:hover {
		background: oklch(0.22 0.02 250);
		color: oklch(0.75 0.02 250);
	}
	.format-pill.active {
		background: oklch(0.30 0.08 240);
		color: oklch(0.90 0.05 240);
		border-color: oklch(0.40 0.10 240);
	}

	.create-textarea {
		width: 100%;
		padding: 0.5rem 0.625rem;
		font-size: 0.75rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.375rem;
		color: oklch(0.85 0.02 250);
		outline: none;
		resize: vertical;
		line-height: 1.5;
	}
	.create-textarea:focus {
		border-color: oklch(0.50 0.12 240);
	}
	.create-textarea::placeholder {
		color: oklch(0.40 0.02 250);
	}

	.inferred-badge {
		font-size: 0.6875rem;
		padding: 0.125rem 0.5rem;
		border-radius: 1rem;
		background: oklch(0.30 0.08 145);
		color: oklch(0.85 0.10 145);
	}

	.inferred-table-wrap {
		max-height: 200px;
		overflow-y: auto;
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.375rem;
	}
	.inferred-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.75rem;
	}
	.inferred-table th {
		padding: 0.375rem 0.5rem;
		text-align: left;
		font-weight: 600;
		color: oklch(0.60 0.02 250);
		background: oklch(0.18 0.01 250);
		border-bottom: 1px solid oklch(0.28 0.02 250);
		position: sticky;
		top: 0;
	}
	.inferred-table td {
		padding: 0.25rem 0.5rem;
		color: oklch(0.80 0.02 250);
		border-bottom: 1px solid oklch(0.22 0.02 250);
	}
	.sample-cell {
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: oklch(0.55 0.02 250) !important;
		font-style: italic;
	}

	.create-preview-error {
		padding: 0.5rem 0.75rem;
		background: oklch(0.50 0.12 30 / 0.15);
		border: 1px solid oklch(0.55 0.15 30 / 0.3);
		border-radius: 0.375rem;
		color: oklch(0.70 0.15 30);
		font-size: 0.8125rem;
	}

	/* Import modal */
	.import-modal {
		max-width: 48rem;
		width: 90vw;
	}

	.import-source-row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.file-picker-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		font-size: 0.8125rem;
		background: oklch(0.20 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.375rem;
		color: oklch(0.70 0.02 250);
		cursor: pointer;
		flex: 1;
	}
	.file-picker-btn:hover {
		background: oklch(0.25 0.02 250);
		color: oklch(0.85 0.02 250);
	}

	.hidden-file-input {
		display: none;
	}

	.format-select {
		padding: 0.375rem 0.5rem;
		font-size: 0.8125rem;
		background: oklch(0.20 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.375rem;
		color: oklch(0.70 0.02 250);
		outline: none;
	}

	.import-textarea {
		width: 100%;
		padding: 0.5rem;
		font-size: 0.75rem;
		font-family: monospace;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.375rem;
		color: oklch(0.85 0.02 250);
		resize: vertical;
		outline: none;
		line-height: 1.4;
	}
	.import-textarea:focus {
		border-color: oklch(0.50 0.10 200);
	}
	.import-textarea::placeholder {
		color: oklch(0.40 0.02 250);
	}

	.import-error {
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		background: oklch(0.30 0.10 25 / 0.15);
		border: 1px solid oklch(0.50 0.15 25 / 0.3);
		border-radius: 0.375rem;
		color: oklch(0.75 0.15 25);
	}

	.import-preview-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.preview-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.preview-title {
		font-size: 0.75rem;
		font-weight: 600;
		color: oklch(0.65 0.02 250);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.preview-stats {
		display: flex;
		gap: 0.5rem;
		font-size: 0.6875rem;
	}

	.preview-matched {
		color: oklch(0.70 0.15 145);
	}

	.preview-unmatched {
		color: oklch(0.70 0.15 45);
	}

	.column-mapping {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.col-badge {
		font-size: 0.6875rem;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-family: monospace;
	}

	.col-matched {
		background: oklch(0.30 0.10 145 / 0.2);
		color: oklch(0.75 0.15 145);
		border: 1px solid oklch(0.50 0.15 145 / 0.3);
	}

	.col-unmatched {
		background: oklch(0.30 0.08 45 / 0.2);
		color: oklch(0.70 0.12 45);
		border: 1px solid oklch(0.50 0.12 45 / 0.3);
		text-decoration: line-through;
	}

	.preview-table-container {
		max-height: 200px;
		overflow: auto;
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.375rem;
	}

	.preview-table {
		font-size: 0.75rem !important;
	}

	.preview-note {
		font-size: 0.6875rem;
		color: oklch(0.45 0.02 250);
		text-align: center;
	}

	/* Column Context Menu */
	.col-context-menu {
		position: fixed;
		z-index: 100;
		min-width: 200px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		padding: 0.25rem 0;
		box-shadow: 0 8px 30px oklch(0 0 0 / 0.5);
		animation: contextMenuIn 0.12s ease-out;
	}

	.col-context-menu-hidden {
		display: none;
	}

	@keyframes contextMenuIn {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}

	.col-context-menu-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.375rem 0.75rem;
		background: none;
		border: none;
		color: oklch(0.80 0.02 250);
		font-size: 0.8125rem;
		cursor: pointer;
		text-align: left;
		white-space: nowrap;
		position: relative;
	}
	.col-context-menu-item:hover {
		background: oklch(0.25 0.04 200 / 0.3);
		color: oklch(0.92 0.02 250);
	}

	.col-context-menu-danger:hover {
		background: oklch(0.30 0.10 25 / 0.3);
		color: oklch(0.80 0.15 25);
	}

	.col-context-menu-divider {
		height: 1px;
		background: oklch(0.25 0.02 250);
		margin: 0.25rem 0;
	}

	.col-context-menu-chevron {
		margin-left: auto;
		color: oklch(0.45 0.02 250);
		font-size: 0.875rem;
	}

	.ctx-icon {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}

	.type-icon {
		width: 1.25rem;
		text-align: center;
		flex-shrink: 0;
		font-size: 0.75rem;
	}

	/* Submenu */
	.col-context-menu-submenu-container {
		position: relative;
	}

	.col-context-submenu {
		position: absolute;
		left: 100%;
		top: 0;
		min-width: 180px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		padding: 0.25rem 0;
		box-shadow: 0 8px 30px oklch(0 0 0 / 0.5);
		animation: contextMenuIn 0.1s ease-out;
	}

	.submenu-group-label {
		padding: 0.25rem 0.75rem 0.125rem;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(0.45 0.02 250);
	}

	/* Hidden columns indicator */
	.hidden-cols-indicator {
		position: relative;
		display: inline-flex;
	}

	.hidden-cols-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.125rem 0.5rem;
		font-size: 0.6875rem;
		background: oklch(0.25 0.06 45 / 0.2);
		border: 1px solid oklch(0.35 0.10 45 / 0.3);
		border-radius: 9999px;
		color: oklch(0.75 0.12 45);
		cursor: pointer;
	}
	.hidden-cols-btn:hover {
		background: oklch(0.30 0.08 45 / 0.3);
	}

	.hidden-cols-dropdown {
		display: none;
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: 0.25rem;
		min-width: 150px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.375rem;
		padding: 0.25rem 0;
		box-shadow: 0 4px 16px oklch(0 0 0 / 0.4);
		z-index: 50;
	}

	.hidden-cols-indicator:hover .hidden-cols-dropdown {
		display: block;
	}

	.hidden-col-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		width: 100%;
		padding: 0.3125rem 0.625rem;
		background: none;
		border: none;
		color: oklch(0.75 0.02 250);
		font-size: 0.75rem;
		cursor: pointer;
		text-align: left;
		font-family: monospace;
	}
	.hidden-col-item:hover {
		background: oklch(0.25 0.04 200 / 0.3);
		color: oklch(0.90 0.02 250);
	}

	.hidden-col-show-all {
		font-family: inherit;
		font-weight: 500;
		color: oklch(0.70 0.12 200);
		border-top: 1px solid oklch(0.25 0.02 250);
		margin-top: 0.125rem;
		padding-top: 0.375rem;
	}
</style>
