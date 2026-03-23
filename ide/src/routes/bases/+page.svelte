<script lang="ts">
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
	import BasesList from '$lib/components/bases/BasesList.svelte';
	import CanvasEditor from '$lib/components/canvas/CanvasEditor.svelte';

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
			console.error('Failed to create from template:', err);
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
			console.error('Failed to create base:', err);
		}
	}

	// Delete a base
	async function handleDelete(base: KnowledgeBase) {
		if (!project) return;
		if (!confirm(`Delete "${base.name}"? This cannot be undone.`)) return;
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
			console.error('Failed to delete base:', err);
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
			console.error('Failed to rename base:', err);
		}
	}

	// Select a base and sync URL
	function handleSelect(base: KnowledgeBase) {
		selectedBase = base;
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
			console.error('Failed to update title:', err);
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
				body: JSON.stringify({ project, is_base: isBase })
			});
		} catch (err) {
			console.error('Failed to toggle base flag:', err);
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
				body: JSON.stringify({ project, is_base: newValue })
			});
		} catch (err) {
			console.error('Failed to toggle always_inject:', err);
			await fetchBases();
		}
	}

	// Update base blocks (from CanvasEditor)
	async function handleUpdateBlocks(blocks: CanvasBlock[]) {
		if (!selectedBase || !project) return;
		const updatedAt = new Date().toISOString();
		selectedBase = { ...selectedBase, blocks, updated_at: updatedAt };
		bases = bases.map(b => b.id === selectedBase!.id ? { ...b, blocks, updated_at: updatedAt } : b);
		try {
			await fetch(`/api/bases/${selectedBase.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, blocks })
			});
		} catch (err) {
			console.error('Failed to update blocks:', err);
			await fetchBases();
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

			blocks.push({
				type: 'table_view',
				id: crypto.randomUUID(),
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
			console.error('Failed to create canvas from table:', err);
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
		<!-- Main Content: Resizable Split Panel -->
		<div class="bases-body" class:dragging={isDragging}>
			<!-- Left Panel: Bases List -->
			<div class="bases-panel-left" style="width: {leftPanelWidth}px;">
				<BasesList
					{bases}
					selectedBaseId={selectedBase?.id ?? null}
					onSelect={handleSelect}
					onAdd={handleAdd}
					onDelete={handleDelete}
					onRename={handleRename}
					onCreateFromTemplate={handleCreateFromTemplate}
					onToggleAlwaysInject={handleToggleAlwaysInject}
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
			<div class="bases-panel-right">
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
</style>
