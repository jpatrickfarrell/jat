<script lang="ts">
	/**
	 * Canvas Page - Block-based interactive documents
	 *
	 * Resizable two-panel layout: CanvasPageList (left) + CanvasEditor (right).
	 * Follows the /bases page pattern for resizable split panels.
	 */

	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { CanvasPage, CanvasBlock, ControlBlock, TableViewBlock } from '$lib/types/canvas';
	import { onMessage, type WebSocketMessage } from '$lib/stores/websocket.svelte';
	import CanvasPageList from '$lib/components/canvas/CanvasPageList.svelte';
	import CanvasEditor from '$lib/components/canvas/CanvasEditor.svelte';

	// Get project and page ID from URL
	const project = $derived($page.url.searchParams.get('project'));
	const pageIdParam = $derived($page.url.searchParams.get('page'));
	// Table name passed from /data "Create Canvas" context menu
	const tableParam = $derived($page.url.searchParams.get('table'));

	// Page state
	let pages = $state<CanvasPage[]>([]);
	let selectedPage = $state<CanvasPage | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	// Control values map: { [controlName]: value }
	// Updated when any control block changes, used by formula/table_view blocks
	let controlValues = $state<Record<string, unknown>>({});

	// Live refresh tokens: { [tableName]: number }
	// Incremented when data changes are detected via WS, triggers debounced re-fetch in TableViewBlocks
	let refreshTokens = $state<Record<string, number>>({});

	// System table names that map to task events
	const TASK_SYSTEM_TABLES = ['tasks', 'dependencies', 'labels', 'comments'];

	// Collect table names used by the current page's table_view blocks
	const activeTableNames = $derived(
		selectedPage
			? selectedPage.blocks
				.filter((b): b is import('$lib/types/canvas').TableViewBlock => b.type === 'table_view' && !!b.tableName)
				.map(b => b.tableName)
			: []
	);

	function bumpRefreshToken(tableName: string) {
		refreshTokens = { ...refreshTokens, [tableName]: (refreshTokens[tableName] || 0) + 1 };
	}

	// Subscribe to WS 'tasks' channel for data change events
	let unsubTasks: (() => void) | null = null;
	let unsubSessions: (() => void) | null = null;

	// Resizable panel state
	let leftPanelWidth = $state(280);
	const MIN_PANEL_WIDTH = 200;
	const MAX_PANEL_WIDTH = 500;
	let isDragging = $state(false);
	let startX = $state(0);
	let startWidth = $state(0);

	function handleDividerMouseDown(e: MouseEvent) {
		e.preventDefault();
		isDragging = true;
		startX = e.clientX;
		startWidth = leftPanelWidth;
		document.addEventListener('mousemove', handleDividerMouseMove);
		document.addEventListener('mouseup', handleDividerMouseUp);
	}

	function handleDividerMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		const deltaX = e.clientX - startX;
		let newWidth = startWidth + deltaX;
		newWidth = Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, newWidth));
		leftPanelWidth = newWidth;
	}

	function handleDividerMouseUp() {
		isDragging = false;
		document.removeEventListener('mousemove', handleDividerMouseMove);
		document.removeEventListener('mouseup', handleDividerMouseUp);
	}

	// Fetch canvas pages
	async function fetchPages() {
		if (!project) {
			pages = [];
			isLoading = false;
			return;
		}

		try {
			const res = await fetch(`/api/canvas?project=${encodeURIComponent(project)}`);
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Failed to fetch canvas pages');
			}
			const data = await res.json();
			pages = (data.pages || []).sort((a: CanvasPage, b: CanvasPage) =>
				new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
			);

			// Re-select if the selected page still exists
			if (selectedPage) {
				const updated = pages.find(p => p.id === selectedPage!.id);
				if (updated) {
					selectedPage = updated;
				} else {
					selectedPage = null;
				}
			}
		} catch (err) {
			error = (err as Error).message;
		} finally {
			isLoading = false;
		}
	}

	// Create a page from a template
	async function handleCreateFromTemplate(templateId: string) {
		if (!project) return;

		try {
			const res = await fetch('/api/canvas/templates', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, templateId })
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Failed to create page from template');
			}

			const data = await res.json();
			await fetchPages();
			const newPage = pages.find(p => p.id === data.page.id);
			if (newPage) handleSelect(newPage);
		} catch (err) {
			console.error('Failed to create from template:', err);
		}
	}

	// Create a new canvas page
	async function handleAdd() {
		if (!project) return;

		try {
			const res = await fetch('/api/canvas', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, name: 'Untitled Page', blocks: [] })
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Failed to create page');
			}

			const data = await res.json();
			await fetchPages();
			// Select the newly created page
			const newPage = pages.find(p => p.id === data.page.id);
			if (newPage) handleSelect(newPage);
		} catch (err) {
			console.error('Failed to create canvas page:', err);
		}
	}

	// Delete a canvas page
	async function handleDelete(pageToDel: CanvasPage) {
		if (!project) return;
		if (!confirm(`Delete "${pageToDel.name}"? This cannot be undone.`)) return;

		try {
			const res = await fetch(`/api/canvas/${pageToDel.id}?project=${encodeURIComponent(project)}`, {
				method: 'DELETE'
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Failed to delete page');
			}

			if (selectedPage?.id === pageToDel.id) {
				selectedPage = null;
				updateUrlPageParam(null);
			}
			await fetchPages();
		} catch (err) {
			console.error('Failed to delete canvas page:', err);
		}
	}

	// Rename a canvas page
	async function handleRename(pageToRename: CanvasPage, newName: string) {
		if (!project) return;

		try {
			const res = await fetch(`/api/canvas/${pageToRename.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, name: newName })
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Failed to rename page');
			}

			await fetchPages();
		} catch (err) {
			console.error('Failed to rename canvas page:', err);
		}
	}

	// Select a page and sync URL
	function handleSelect(pageSel: CanvasPage) {
		selectedPage = pageSel;
		// Initialize controlValues from control blocks
		controlValues = {};
		for (const block of pageSel.blocks) {
			if (block.type === 'control' && block.name) {
				controlValues[block.name] = block.value;
			}
		}
		// Sync page ID to URL for deep linking
		updateUrlPageParam(pageSel.id);
	}

	// Update URL ?page= param without navigation
	function updateUrlPageParam(pageId: string | null) {
		const url = new URL(window.location.href);
		if (pageId) {
			url.searchParams.set('page', pageId);
		} else {
			url.searchParams.delete('page');
		}
		// Remove table param after use
		url.searchParams.delete('table');
		goto(url.pathname + url.search, { replaceState: true, noScroll: true });
	}

	// Handle control value changes
	function handleControlChange(controlName: string, value: unknown) {
		controlValues = { ...controlValues, [controlName]: value };
	}

	// Update page title (from CanvasEditor inline edit)
	async function handleTitleChange(newName: string) {
		if (!selectedPage || !project) return;

		// Optimistic update — avoids fetchPages which resets scroll
		const updatedAt = new Date().toISOString();
		selectedPage = { ...selectedPage, name: newName, updated_at: updatedAt };
		pages = pages.map(p => p.id === selectedPage!.id ? { ...p, name: newName, updated_at: updatedAt } : p);

		try {
			await fetch(`/api/canvas/${selectedPage.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, name: newName })
			});
		} catch (err) {
			console.error('Failed to update title:', err);
			await fetchPages();
		}
	}

	// Toggle is_base flag on a canvas page
	async function handleToggleBase(isBase: boolean) {
		if (!selectedPage || !project) return;

		// Optimistic update
		selectedPage = { ...selectedPage, is_base: isBase };
		pages = pages.map(p => p.id === selectedPage!.id ? { ...p, is_base: isBase } : p);

		try {
			await fetch(`/api/canvas/${selectedPage.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, is_base: isBase })
			});
		} catch (err) {
			console.error('Failed to toggle base flag:', err);
			await fetchPages();
		}
	}

	// Update page blocks (from CanvasEditor block add/remove)
	async function handleUpdateBlocks(blocks: CanvasBlock[]) {
		if (!selectedPage || !project) return;

		// Optimistically update local state so concurrent saves (e.g. control
		// value debounce firing while a settings save is in-flight) read the
		// latest blocks instead of stale page data.
		const updatedAt = new Date().toISOString();
		selectedPage = { ...selectedPage, blocks, updated_at: updatedAt };

		// Update the pages list timestamp for the sidebar without re-fetching
		// (avoids selectedPage reassignment which resets scroll position)
		pages = pages.map(p => p.id === selectedPage!.id ? { ...p, blocks, updated_at: updatedAt } : p);

		try {
			await fetch(`/api/canvas/${selectedPage.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, blocks })
			});
		} catch (err) {
			console.error('Failed to update blocks:', err);
			await fetchPages(); // Restore correct state on error
		}
	}

	// Auto-select page from URL ?page= param after pages load
	function autoSelectFromUrl() {
		if (pageIdParam && pages.length > 0 && !selectedPage) {
			const target = pages.find(p => p.id === pageIdParam);
			if (target) handleSelect(target);
		}
	}

	// Create canvas from /data table param (?table=tableName)
	async function createCanvasFromTable(tableName: string) {
		if (!project) return;

		try {
			// Fetch table schema to detect relation columns
			const schemaRes = await fetch(`/api/data/tables/${encodeURIComponent(tableName)}?project=${encodeURIComponent(project)}`);
			const schemaData = schemaRes.ok ? await schemaRes.json() : null;

			const blocks: CanvasBlock[] = [];
			const controlFilters: Record<string, string> = {};

			// Auto-detect relation columns → create select controls
			if (schemaData?.columnMeta) {
				for (const [colName, meta] of Object.entries(schemaData.columnMeta) as [string, any][]) {
					if (meta.semanticType === 'relation' && meta.config?.targetTable && meta.config?.displayColumn) {
						const controlName = colName.replace(/_id$/, '').replace(/_/g, ' ');
						const controlId = crypto.randomUUID();
						blocks.push({
							type: 'control',
							id: controlId,
							name: controlName,
							controlType: 'select',
							config: {
								sourceTable: meta.config.targetTable,
								displayColumn: meta.config.displayColumn,
							},
							value: null,
						} as ControlBlock);
						controlFilters[colName] = controlName;
					}
				}
			}

			// Add the table view block
			blocks.push({
				type: 'table_view',
				id: crypto.randomUUID(),
				tableName,
				controlFilters,
			} as TableViewBlock);

			// Create the page
			const res = await fetch('/api/canvas', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, name: tableName, blocks })
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Failed to create page');
			}

			const data = await res.json();
			await fetchPages();
			const newPage = pages.find(p => p.id === data.page.id);
			if (newPage) handleSelect(newPage);
		} catch (err) {
			console.error('Failed to create canvas from table:', err);
		}
	}

	onMount(async () => {
		await fetchPages();
		autoSelectFromUrl();
		// Handle ?table= param from /data context menu
		if (tableParam && project) {
			await createCanvasFromTable(tableParam);
		}

		// Subscribe to WS events for live table refresh
		unsubTasks = onMessage('tasks', (msg: WebSocketMessage) => {
			if (msg.type === 'data-changed') {
				// User data table changed — bump if any table_view shows this table
				const tableName = (msg as any).tableName as string;
				if (tableName && activeTableNames.includes(tableName)) {
					bumpRefreshToken(tableName);
				}
			} else if (msg.type === 'task-change' || msg.type === 'task-updated' || msg.type === 'task-created') {
				// System task table changed — bump all system tables shown
				for (const t of TASK_SYSTEM_TABLES) {
					if (activeTableNames.includes(t)) {
						bumpRefreshToken(t);
					}
				}
			}
		});

		unsubSessions = onMessage('sessions', (msg: WebSocketMessage) => {
			if (msg.type === 'session-signal' || msg.type === 'session-state') {
				// Agent activity — refresh agents-related system tables if shown
				// (agents are not in system tables currently, but future-proof)
			}
		});
	});

	onDestroy(() => {
		unsubTasks?.();
		unsubSessions?.();
	});

	// Refetch when project changes
	$effect(() => {
		if (project) {
			isLoading = true;
			selectedPage = null;
			fetchPages();
		}
	});
</script>

<svelte:head>
	<title>{selectedPage ? `${selectedPage.name} - Canvas` : 'Canvas'} | JAT IDE</title>
	<meta name="description" content="Create interactive canvas pages with controls, table views, and formulas." />
</svelte:head>

<div class="h-full flex flex-col overflow-hidden" style="background: oklch(0.14 0.01 250);">
	<!-- Breadcrumb Navigation -->
	{#if selectedPage}
		<div class="flex items-center gap-1.5 px-4 py-2" style="border-bottom: 1px solid oklch(0.22 0.02 250); background: oklch(0.15 0.01 250);">
			<button
				onclick={() => { selectedPage = null; updateUrlPageParam(null); }}
				class="text-xs font-mono tracking-wide uppercase hover:underline cursor-pointer"
				style="color: oklch(0.55 0.02 250); background: none; border: none; padding: 0;"
			>Canvas</button>
			<span class="text-xs" style="color: oklch(0.40 0.02 250);">›</span>
			<span class="text-xs font-medium truncate" style="color: oklch(0.80 0.12 240); max-width: 300px;">
				{selectedPage.name}
			</span>
		</div>
	{/if}

	{#if isLoading}
		<!-- Skeleton Loading State -->
		<div class="flex-1 flex overflow-hidden">
			<div class="skeleton" style="width: {leftPanelWidth}px; flex-shrink: 0; background: oklch(0.18 0.02 250); min-height: 400px;"></div>
			<div style="width: 8px; flex-shrink: 0;"></div>
			<div class="flex-1 skeleton" style="background: oklch(0.18 0.02 250); min-height: 400px;"></div>
		</div>
	{:else if error}
		<div class="flex-1 flex items-center justify-center">
			<div class="text-center">
				<p class="text-sm mb-2" style="color: oklch(0.70 0.15 30);">{error}</p>
				<button
					onclick={() => { error = null; isLoading = true; fetchPages(); }}
					class="text-xs px-3 py-1.5 rounded"
					style="background: oklch(0.70 0.18 240 / 0.15); color: oklch(0.75 0.15 240); border: 1px solid oklch(0.70 0.18 240 / 0.3);"
				>
					Retry
				</button>
			</div>
		</div>
	{:else}
		<!-- Main Content: Resizable Split Panel -->
		<div class="canvas-body" class:dragging={isDragging}>
			<!-- Left Panel: Page List -->
			<div class="canvas-panel-left" style="width: {leftPanelWidth}px;">
				<CanvasPageList
					{pages}
					selectedPageId={selectedPage?.id ?? null}
					onSelect={handleSelect}
					onAdd={handleAdd}
					onDelete={handleDelete}
					onRename={handleRename}
					onCreateFromTemplate={handleCreateFromTemplate}
				/>
			</div>

			<!-- Vertical Divider -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="vertical-divider"
				class:dragging={isDragging}
				onmousedown={handleDividerMouseDown}
				role="separator"
				aria-orientation="vertical"
			>
				<div class="divider-grip">
					<div class="grip-line"></div>
					<div class="grip-line"></div>
				</div>
			</div>

			<!-- Right Panel: Canvas Editor -->
			<div class="canvas-panel-right">
				<CanvasEditor
					page={selectedPage}
					{project}
					{controlValues}
					{refreshTokens}
					onUpdatePage={handleUpdateBlocks}
					onTitleChange={handleTitleChange}
					onControlChange={handleControlChange}
					onToggleBase={handleToggleBase}
				/>
			</div>
		</div>
	{/if}
</div>

<style>
	.canvas-body {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	.canvas-body.dragging {
		cursor: col-resize;
		user-select: none;
	}

	.canvas-panel-left {
		display: flex;
		flex-direction: column;
		min-width: 200px;
		max-width: 500px;
		flex-shrink: 0;
		overflow: hidden;
	}

	.canvas-panel-right {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 300px;
		overflow: hidden;
	}

	/* Vertical Divider */
	.vertical-divider {
		width: 8px;
		min-width: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: col-resize;
		background: transparent;
		transition: background 0.15s ease;
		user-select: none;
	}

	.vertical-divider:hover {
		background: oklch(0.65 0.15 200 / 0.1);
	}

	.vertical-divider.dragging {
		background: oklch(0.65 0.15 200 / 0.2);
	}

	.divider-grip {
		display: flex;
		flex-direction: column;
		gap: 3px;
		padding: 4px 2px;
		opacity: 0.4;
		transition: opacity 0.15s ease;
	}

	.vertical-divider:hover .divider-grip,
	.vertical-divider.dragging .divider-grip {
		opacity: 1;
	}

	.grip-line {
		width: 2px;
		height: 24px;
		border-radius: 1px;
		background: oklch(0.60 0.02 250);
		transition: background 0.15s ease;
	}

	.vertical-divider:hover .grip-line {
		background: oklch(0.65 0.15 200);
	}

	.vertical-divider.dragging .grip-line {
		background: oklch(0.70 0.18 200);
	}
</style>
