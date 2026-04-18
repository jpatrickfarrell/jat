<script lang="ts">
	import { randomUUID } from '$lib/utils/uuid';
	/**
	 * Knowledge Bases Page - Unified /bases route
	 *
	 * Resizable two-panel layout: BasesList (left) + CanvasEditor (right).
	 * All bases are canvas pages with blocks. System bases shown as read-only.
	 * Replaces both old /bases and /canvas routes.
	 */

	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { KnowledgeBase } from '$lib/types/knowledgeBase';
	import type { CanvasBlock, ControlBlock, TableViewBlock } from '$lib/types/canvas';
	import { onMessage, type WebSocketMessage } from '$lib/stores/websocket.svelte';
	import { errorToast } from '$lib/stores/toasts.svelte';
	import BasesList from '$lib/components/bases/BasesList.svelte';
	import CanvasEditor from '$lib/components/canvas/CanvasEditor.svelte';
	import { swipe } from '$lib/actions/swipe';

	// Get project and page ID from URL
	const project = $derived($page.url.searchParams.get('project'));
	const pageIdParam = $derived($page.url.searchParams.get('page'));
	// Table name passed from /data "Create Canvas" context menu
	const tableParam = $derived($page.url.searchParams.get('table'));

	// Page state
	let bases = $state<KnowledgeBase[]>([]);
	let selectedBase = $state<KnowledgeBase | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

	// Delete confirmation state
	let showDeleteConfirm = $state(false);
	let baseToDelete = $state<KnowledgeBase | null>(null);

	// Canvas save state
	let isSavingCanvas = $state(false);
	let lastCanvasSave = $state<Date | null>(null);

	// Control values map: { [controlName]: value }
	let controlValues = $state<Record<string, unknown>>({});

	// Live refresh tokens: { [tableName]: number }
	let refreshTokens = $state<Record<string, number>>({});

	// System table names for WS events
	const TASK_SYSTEM_TABLES = ['tasks', 'dependencies', 'labels', 'comments'];

	// Collect table names used by the selected base's table_view blocks
	const activeTableNames = $derived(
		selectedBase
			? (selectedBase.blocks || [])
				.filter((b): b is TableViewBlock => b.type === 'table_view' && !!b.tableName)
				.map(b => b.tableName)
			: []
	);

	function bumpRefreshToken(tableName: string) {
		refreshTokens = { ...refreshTokens, [tableName]: (refreshTokens[tableName] || 0) + 1 };
	}

	// WebSocket subscriptions
	let unsubTasks: (() => void) | null = null;
	let unsubSessions: (() => void) | null = null;

	// Resizable panel state
	let leftPanelWidth = $state(300);
	const MIN_PANEL_WIDTH = 200;
	const MAX_PANEL_WIDTH = 550;
	const COLLAPSE_THRESHOLD = 140;
	let isDragging = $state(false);
	let isCollapsed = $state(false);
	let startX = $state(0);
	let startWidth = $state(0);

	function onDividerPointerDown(e: PointerEvent) {
		e.preventDefault();
		isDragging = true;
		startX = e.clientX;
		startWidth = leftPanelWidth;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}

	function onDividerPointerMove(e: PointerEvent) {
		if (!isDragging) return;
		const deltaX = e.clientX - startX;
		let newWidth = startWidth + deltaX;
		if (newWidth < COLLAPSE_THRESHOLD) {
			isCollapsed = true;
			return;
		}
		isCollapsed = false;
		newWidth = Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, newWidth));
		leftPanelWidth = newWidth;
	}

	function onDividerPointerUp(e: PointerEvent) {
		isDragging = false;
		(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
	}

	function expandPanel() {
		isCollapsed = false;
	}

	// Ctrl+\ toggles the KB browser panel
	onMount(() => {
		function handlePanelToggle(e: KeyboardEvent) {
			if (e.ctrlKey && e.key === '\\') {
				e.preventDefault();
				isCollapsed = !isCollapsed;
			}
		}
		window.addEventListener('keydown', handlePanelToggle, true);
		return () => window.removeEventListener('keydown', handlePanelToggle, true);
	});

	// Fetch all bases
	async function fetchBases() {
		if (!project) {
			bases = [];
			isLoading = false;
			return;
		}

		try {
			const res = await fetch(`/api/bases?project=${encodeURIComponent(project)}&includeSystem=true`);
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Failed to fetch bases');
			}
			const data = await res.json();
			bases = (data.bases || []).sort((a: KnowledgeBase, b: KnowledgeBase) => {
				// System bases first, then by updated_at desc
				if (a._system && !b._system) return -1;
				if (!a._system && b._system) return 1;
				return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
			});

			// Re-select if the selected base still exists
			if (selectedBase) {
				const updated = bases.find(b => b.id === selectedBase!.id);
				if (updated) {
					selectedBase = updated;
				} else {
					selectedBase = null;
				}
			}
		} catch (err) {
			error = (err as Error).message;
		} finally {
			isLoading = false;
		}
	}

	// Create from template
	async function handleCreateFromTemplate(templateId: string) {
		if (!project) return;
		try {
			const res = await fetch('/api/bases/templates', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, templateId })
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Failed to create from template');
			}
			const data = await res.json();
			await fetchBases();
			const newBase = bases.find(b => b.id === data.base.id);
			if (newBase) handleSelect(newBase);
		} catch (err) {
			errorToast((err as Error).message || 'Failed to create from template');
		}
	}

	// Create a new blank base
	async function handleAdd() {
		if (!project) return;
		try {
			const res = await fetch('/api/bases', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, name: 'Untitled', blocks: [] })
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Failed to create base');
			}
			const data = await res.json();
			await fetchBases();
			const newBase = bases.find(b => b.id === data.base.id);
			if (newBase) handleSelect(newBase);
		} catch (err) {
			errorToast((err as Error).message || 'Failed to create base');
		}
	}

	// Delete a base
	function handleDelete(base: KnowledgeBase) {
		baseToDelete = base;
		showDeleteConfirm = true;
	}

	async function confirmDelete() {
		if (!baseToDelete || !project) return;
		const base = baseToDelete;
		showDeleteConfirm = false;
		baseToDelete = null;
		try {
			const res = await fetch(`/api/bases/${base.id}?project=${encodeURIComponent(project)}`, {
				method: 'DELETE'
			});
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Failed to delete base');
			}
			if (selectedBase?.id === base.id) {
				selectedBase = null;
				updateUrlPageParam(null);
			}
			await fetchBases();
		} catch (err) {
			errorToast((err as Error).message || 'Failed to delete base');
		}
	}

	// Rename a base
	async function handleRename(base: KnowledgeBase, newName: string) {
		if (!project) return;
		try {
			await fetch(`/api/bases/${base.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, name: newName })
			});
			await fetchBases();
		} catch (err) {
			errorToast((err as Error).message || 'Failed to rename base');
		}
	}

	// Select a base and sync URL
	function handleSelect(base: KnowledgeBase) {
		selectedBase = base;
		showDeleteConfirm = false;
		baseToDelete = null;
		// Initialize controlValues from control blocks
		controlValues = {};
		for (const block of (base.blocks || [])) {
			if (block.type === 'control' && block.name) {
				controlValues[block.name] = block.value;
			}
		}
		updateUrlPageParam(base.id);
	}

	// Update URL ?page= param without navigation
	function updateUrlPageParam(pageId: string | null) {
		const url = new URL(window.location.href);
		if (pageId) {
			url.searchParams.set('page', pageId);
		} else {
			url.searchParams.delete('page');
		}
		url.searchParams.delete('table');
		goto(url.pathname + url.search, { replaceState: true, noScroll: true });
	}

	// Handle control value changes
	function handleControlChange(controlName: string, value: unknown) {
		controlValues = { ...controlValues, [controlName]: value };
	}

	// Update base title (from CanvasEditor inline edit)
	async function handleTitleChange(newName: string) {
		if (!selectedBase || !project) return;
		const updatedAt = new Date().toISOString();
		selectedBase = { ...selectedBase, name: newName, updated_at: updatedAt };
		bases = bases.map(b => b.id === selectedBase!.id ? { ...b, name: newName, updated_at: updatedAt } : b);
		try {
			await fetch(`/api/bases/${selectedBase.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, name: newName })
			});
		} catch (err) {
			errorToast((err as Error).message || 'Failed to save title');
			await fetchBases();
		}
	}

	// Toggle always_inject flag
	async function handleToggleBase(isBase: boolean) {
		if (!selectedBase || !project) return;
		selectedBase = { ...selectedBase, always_inject: isBase };
		bases = bases.map(b => b.id === selectedBase!.id ? { ...b, always_inject: isBase } : b);
		try {
			await fetch(`/api/bases/${selectedBase!.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, always_inject: isBase })
			});
		} catch (err) {
			errorToast((err as Error).message || 'Failed to update base');
			await fetchBases();
		}
	}

	// Toggle always_inject from the list (BasesList)
	async function handleToggleAlwaysInject(base: KnowledgeBase) {
		if (!project) return;
		const newValue = !base.always_inject;
		// Optimistic update
		bases = bases.map(b => b.id === base.id ? { ...b, always_inject: newValue } : b);
		if (selectedBase?.id === base.id) {
			selectedBase = { ...selectedBase!, always_inject: newValue };
		}
		try {
			await fetch(`/api/bases/${base.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, always_inject: newValue })
			});
		} catch (err) {
			errorToast((err as Error).message || 'Failed to update base');
			await fetchBases();
		}
	}

	// Change icon on a base
	async function handleIconChange(base: KnowledgeBase, icon: string | null) {
		if (!project) return;
		// Optimistic update
		bases = bases.map(b => b.id === base.id ? { ...b, icon } : b);
		if (selectedBase?.id === base.id) {
			selectedBase = { ...selectedBase!, icon };
		}
		try {
			await fetch(`/api/bases/${base.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, icon })
			});
		} catch (err) {
			errorToast((err as Error).message || 'Failed to update icon');
			await fetchBases();
		}
	}

	// Reorder bases via drag-and-drop
	async function handleReorder(orderedIds: string[]) {
		if (!project) return;
		const order = orderedIds.map((id, i) => ({ id, sort_order: i }));
		const orderMap = new Map(order.map(o => [o.id, o.sort_order]));
		// Optimistic: rebuild bases array in the new order so BasesList $effect stays correct
		const userReordered = orderedIds
			.map(id => bases.find(b => b.id === id))
			.filter((b): b is KnowledgeBase => !!b)
			.map(b => ({ ...b, sort_order: orderMap.get(b.id)! }));
		const rest = bases.filter(b => !orderMap.has(b.id));
		bases = [...userReordered, ...rest];
		try {
			await fetch('/api/bases/reorder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, order })
			});
		} catch (err) {
			errorToast((err as Error).message || 'Failed to reorder bases');
			await fetchBases();
		}
	}

	// Update base blocks (from CanvasEditor)
	async function handleUpdateBlocks(blocks: CanvasBlock[]) {
		if (!selectedBase || !project) return;
		const updatedAt = new Date().toISOString();
		selectedBase = { ...selectedBase, blocks, updated_at: updatedAt };
		bases = bases.map(b => b.id === selectedBase!.id ? { ...b, blocks, updated_at: updatedAt } : b);
		isSavingCanvas = true;
		try {
			await fetch(`/api/bases/${selectedBase.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, blocks })
			});
			lastCanvasSave = new Date();
		} catch (err) {
			errorToast((err as Error).message || 'Failed to save page');
			await fetchBases();
		} finally {
			isSavingCanvas = false;
		}
	}

	// Auto-select base from URL ?page= param
	function autoSelectFromUrl() {
		if (pageIdParam && bases.length > 0 && !selectedBase) {
			const target = bases.find(b => b.id === pageIdParam);
			if (target) handleSelect(target);
		}
	}

	// Create canvas from /data table param (?table=tableName)
	async function createCanvasFromTable(tableName: string) {
		if (!project) return;
		try {
			const schemaRes = await fetch(`/api/data/tables/${encodeURIComponent(tableName)}?project=${encodeURIComponent(project)}`);
			const schemaData = schemaRes.ok ? await schemaRes.json() : null;

			const blocks: CanvasBlock[] = [];
			const controlFilters: Record<string, string> = {};

			if (schemaData?.columnMeta) {
				for (const [colName, meta] of Object.entries(schemaData.columnMeta) as [string, any][]) {
					if (meta.semanticType === 'relation' && meta.config?.targetTable && meta.config?.displayColumn) {
						const controlName = colName.replace(/_id$/, '').replace(/_/g, ' ');
						const controlId = randomUUID();
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

			blocks.push({
				type: 'table_view',
				id: randomUUID(),
				tableName,
				controlFilters,
			} as TableViewBlock);

			const res = await fetch('/api/bases', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, name: tableName, blocks })
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Failed to create page');
			}

			const data = await res.json();
			await fetchBases();
			const newBase = bases.find(b => b.id === data.base.id);
			if (newBase) handleSelect(newBase);
		} catch (err) {
			errorToast((err as Error).message || 'Failed to create page from table');
		}
	}

	onMount(async () => {
		await fetchBases();
		autoSelectFromUrl();
		if (tableParam && project) {
			await createCanvasFromTable(tableParam);
		}

		// Subscribe to WS events for live table refresh
		unsubTasks = onMessage('tasks', (msg: WebSocketMessage) => {
			if (msg.type === 'data-changed') {
				const tableName = (msg as any).tableName as string;
				if (tableName && activeTableNames.includes(tableName)) {
					bumpRefreshToken(tableName);
				}
			} else if (msg.type === 'task-change' || msg.type === 'task-updated' || msg.type === 'task-created') {
				for (const t of TASK_SYSTEM_TABLES) {
					if (activeTableNames.includes(t)) {
						bumpRefreshToken(t);
					}
				}
			}
		});

		unsubSessions = onMessage('sessions', (_msg: WebSocketMessage) => {
			// Future: refresh agents-related system tables if shown
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
			selectedBase = null;
			fetchBases();
		}
	});
</script>

<svelte:head>
	<title>{selectedBase ? `${selectedBase.name} - Bases` : 'Knowledge Bases'} | JAT IDE</title>
	<meta name="description" content="Manage knowledge bases for agent context injection. Create interactive pages with controls, table views, and formulas." />
	<link rel="icon" href="/favicons/bases.svg" />
</svelte:head>

<div class="h-full flex flex-col overflow-hidden" style="background: oklch(0.14 0.01 250);">
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
					onclick={() => { error = null; isLoading = true; fetchBases(); }}
					class="text-xs px-3 py-1.5 rounded"
					style="background: oklch(0.70 0.18 240 / 0.15); color: oklch(0.75 0.15 240); border: 1px solid oklch(0.70 0.18 240 / 0.3);"
				>
					Retry
				</button>
			</div>
		</div>
	{:else}
		<!-- Delete Confirmation Bar -->
		{#if showDeleteConfirm && baseToDelete}
			<div class="flex items-center justify-between gap-3 px-4 py-2 flex-shrink-0" style="background: oklch(0.55 0.18 25 / 0.15); border-bottom: 1px solid oklch(0.55 0.18 25 / 0.30);">
				<div class="flex items-center gap-2">
					<svg class="h-4 w-4 flex-shrink-0" style="color: oklch(0.70 0.18 25);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
					</svg>
					<span class="text-sm font-medium" style="color: oklch(0.80 0.15 25);">Delete "{baseToDelete.name}"?</span>
					<span class="text-xs text-base-content/50">Cannot be undone</span>
				</div>
				<div class="flex items-center gap-1.5">
					<button class="btn btn-xs btn-ghost" onclick={() => { showDeleteConfirm = false; baseToDelete = null; }}>Cancel</button>
					<button class="btn btn-xs btn-error" onclick={confirmDelete}>Delete</button>
				</div>
			</div>
		{/if}
		<!-- Main Content: Resizable Split Panel -->
		<div class="bases-body" class:dragging={isDragging}>
			<!-- Left Panel: Bases List -->
			<div
				class="bases-panel-left"
				class:collapsed={isCollapsed}
				style="width: {isCollapsed ? 0 : leftPanelWidth}px; transition: {isDragging ? 'none' : 'width 0.2s ease'};"
				use:swipe={{ onSwipeLeft: () => { isCollapsed = true; }, allowRight: false, commitThreshold: 60, threshold: 40 }}
			>
				<BasesList
					{bases}
					selectedBaseId={selectedBase?.id ?? null}
					onSelect={handleSelect}
					onAdd={handleAdd}
					onDelete={handleDelete}
					onRename={handleRename}
					onCreateFromTemplate={handleCreateFromTemplate}
					onToggleAlwaysInject={handleToggleAlwaysInject}
					onIconChange={handleIconChange}
					onReorder={handleReorder}
					onCollapse={() => { isCollapsed = true; }}
				/>
			</div>

			<!-- Vertical Divider / Expand Tab -->
			{#if isCollapsed}
				<button
					class="expand-tab"
					onclick={expandPanel}
					title="Expand knowledge bases (Ctrl+\\)"
					aria-label="Expand knowledge bases panel"
				>
					<div class="expand-tab-inner">
						<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
						</svg>
					</div>
				</button>
			{:else}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<div
					class="vertical-divider"
					class:dragging={isDragging}
					onpointerdown={onDividerPointerDown}
					onpointermove={onDividerPointerMove}
					onpointerup={onDividerPointerUp}
					role="separator"
					aria-orientation="vertical"
					aria-valuenow={leftPanelWidth}
					aria-valuemin={MIN_PANEL_WIDTH}
					aria-valuemax={MAX_PANEL_WIDTH}
				>
					<div class="divider-grip">
						<div class="grip-line"></div>
						<div class="grip-line"></div>
					</div>
				</div>
			{/if}

			<!-- Right Panel: Canvas Editor -->
			<div class="bases-panel-right" style="position: relative;">
				<!-- Canvas save indicator -->
				{#if isSavingCanvas}
					<div class="absolute top-2 right-3 z-10 flex items-center gap-1 text-xs text-base-content/50 pointer-events-none">
						<span class="loading loading-spinner loading-xs"></span>
						Saving...
					</div>
				{:else if lastCanvasSave}
					{#key lastCanvasSave}
						<div class="absolute top-2 right-3 z-10 text-xs pointer-events-none canvas-saved-flash" style="color: oklch(0.65 0.15 145 / 0.80);">
							✓ Saved
						</div>
					{/key}
				{/if}
				{#if selectedBase?._system}
					<!-- Read-only system base view -->
					<div class="h-full flex flex-col overflow-hidden" style="background: oklch(0.14 0.01 250);">
						<div class="flex-1 overflow-y-auto">
							<div class="max-w-3xl mx-auto px-8 py-6">
								<div class="mb-2 flex items-center gap-2">
									<h1 class="text-2xl font-bold" style="color: oklch(0.90 0.02 250);">
										{selectedBase.name}
									</h1>
									<span class="text-[10px] font-mono px-1.5 py-0.5 rounded" style="background: oklch(0.40 0.10 270 / 0.2); color: oklch(0.65 0.08 270);">SYSTEM</span>
								</div>
								<div class="mb-4 text-xs" style="color: oklch(0.50 0.02 250);">
									System bases are read-only and always injected into agent prompts.
								</div>
								{#if selectedBase.content}
									<pre class="text-sm whitespace-pre-wrap" style="color: oklch(0.75 0.02 250); font-family: 'JetBrains Mono', 'Fira Code', monospace; line-height: 1.6;">{selectedBase.content}</pre>
								{:else if selectedBase.blocks?.length}
									<!-- Render blocks read-only via CanvasEditor with no callbacks -->
									<CanvasEditor
										page={selectedBase as any}
										{project}
										{controlValues}
										{refreshTokens}
										onUpdatePage={() => {}}
										onTitleChange={() => {}}
										onControlChange={() => {}}
										onToggleBase={() => {}}
									/>
								{:else}
									<p class="text-sm" style="color: oklch(0.45 0.02 250);">No content.</p>
								{/if}
							</div>
						</div>
					</div>
				{:else}
					<CanvasEditor
						page={selectedBase as any}
						{project}
						{controlValues}
						{refreshTokens}
						onUpdatePage={handleUpdateBlocks}
						onTitleChange={handleTitleChange}
						onControlChange={handleControlChange}
						onToggleBase={handleToggleBase}
					/>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.bases-body {
		flex: 1;
		display: flex;
		overflow: hidden;
	}

	.bases-body.dragging {
		cursor: col-resize;
		user-select: none;
	}

	.bases-panel-left {
		display: flex;
		flex-direction: column;
		min-width: 200px;
		max-width: 550px;
		flex-shrink: 0;
		overflow: hidden;
	}

	.bases-panel-left.collapsed {
		min-width: 0;
	}

	/* Expand tab — shown when left panel is collapsed */
	.expand-tab {
		width: 16px;
		min-width: 16px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
	}

	.expand-tab-inner {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 52px;
		border-radius: 0 6px 6px 0;
		background: oklch(0.22 0.02 250);
		color: oklch(0.55 0.02 250);
		transition: background 0.15s ease, color 0.15s ease, width 0.15s ease;
	}

	.expand-tab:hover .expand-tab-inner {
		background: oklch(0.65 0.15 200 / 0.25);
		color: oklch(0.75 0.15 200);
		width: 20px;
	}

	.bases-panel-right {
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

	@keyframes saved-flash {
		0%   { opacity: 0; transform: translateY(-3px); color: oklch(0.75 0.20 145); }
		20%  { opacity: 1; transform: translateY(0); }
		70%  { opacity: 1; }
		100% { opacity: 0.4; color: oklch(0.55 0.10 145 / 0.60); }
	}
	.canvas-saved-flash {
		animation: saved-flash 1.8s ease-out forwards;
	}
</style>
