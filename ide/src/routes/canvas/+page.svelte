<script lang="ts">
	/**
	 * Canvas Page - Block-based interactive documents
	 *
	 * Resizable two-panel layout: CanvasPageList (left) + CanvasEditor (right).
	 * Follows the /bases page pattern for resizable split panels.
	 */

	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { CanvasPage, CanvasBlock } from '$lib/types/canvas';
	import CanvasPageList from '$lib/components/canvas/CanvasPageList.svelte';
	import CanvasEditor from '$lib/components/canvas/CanvasEditor.svelte';

	// Get project from URL
	const project = $derived($page.url.searchParams.get('project'));

	// Page state
	let pages = $state<CanvasPage[]>([]);
	let selectedPage = $state<CanvasPage | null>(null);
	let isLoading = $state(true);
	let error = $state<string | null>(null);

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
			if (newPage) selectedPage = newPage;
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

	// Select a page
	function handleSelect(pageSel: CanvasPage) {
		selectedPage = pageSel;
	}

	// Update page title (from CanvasEditor inline edit)
	async function handleTitleChange(newName: string) {
		if (!selectedPage || !project) return;

		try {
			await fetch(`/api/canvas/${selectedPage.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, name: newName })
			});
			await fetchPages();
		} catch (err) {
			console.error('Failed to update title:', err);
		}
	}

	// Update page blocks (from CanvasEditor block add/remove)
	async function handleUpdateBlocks(blocks: CanvasBlock[]) {
		if (!selectedPage || !project) return;

		try {
			await fetch(`/api/canvas/${selectedPage.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project, blocks })
			});
			await fetchPages();
		} catch (err) {
			console.error('Failed to update blocks:', err);
		}
	}

	onMount(() => {
		fetchPages();
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
	<title>Canvas | JAT IDE</title>
	<meta name="description" content="Create interactive canvas pages with controls, table views, and formulas." />
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
					onUpdatePage={handleUpdateBlocks}
					onTitleChange={handleTitleChange}
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
