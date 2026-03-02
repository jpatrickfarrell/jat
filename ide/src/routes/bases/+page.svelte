<script lang="ts">
	/**
	 * Knowledge Bases Page
	 *
	 * Resizable two-panel layout: BasesList (left) + BasePreview (right).
	 * Vertical divider between panels can be dragged to resize.
	 * BaseEditor modal for create/edit.
	 */

	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { KnowledgeBase } from '$lib/types/knowledgeBase';
	import { initializeStore, isStoreInitialized, deleteBase } from '$lib/stores/bases.svelte';
	import BasesList from '$lib/components/bases/BasesList.svelte';
	import BasePreview from '$lib/components/bases/BasePreview.svelte';
	import BaseEditor from '$lib/components/bases/BaseEditor.svelte';

	// Get project from URL
	const project = $derived($page.url.searchParams.get('project'));

	// Page state
	let selectedBase = $state<KnowledgeBase | null>(null);
	let showEditor = $state(false);
	let editingBase = $state<KnowledgeBase | null>(null);
	let isLoading = $state(true);

	// Resizable panel state
	let leftPanelWidth = $state(340);
	const MIN_PANEL_WIDTH = 200;
	const MAX_PANEL_WIDTH = 600;
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

	// Initialize store on mount
	onMount(async () => {
		if (!isStoreInitialized()) {
			await initializeStore(project ?? '');
		}
		isLoading = false;
	});

	// Re-initialize when project changes
	$effect(() => {
		if (project) {
			initializeStore(project);
		}
	});

	function handleSelect(base: KnowledgeBase) {
		selectedBase = base;
	}

	function handleEdit(base: KnowledgeBase) {
		editingBase = base;
		showEditor = true;
	}

	function handleAdd() {
		editingBase = null;
		showEditor = true;
	}

	function handleSave(base: KnowledgeBase) {
		selectedBase = base;
	}

	function handleEditorCancel() {
		showEditor = false;
		editingBase = null;
	}

	async function handleDelete(base: KnowledgeBase) {
		if (!confirm(`Delete "${base.name}"? This cannot be undone.`)) return;
		const ok = await deleteBase(base.id);
		if (ok && selectedBase?.id === base.id) {
			selectedBase = null;
		}
	}
</script>

<svelte:head>
	<title>Knowledge Bases | JAT IDE</title>
	<meta name="description" content="Manage knowledge bases for agent context injection. Create manual content, data table queries, conversation memory, and external sources." />
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
	{:else}
		<!-- Main Content: Resizable Split Panel -->
		<div class="bases-body" class:dragging={isDragging}>
			<!-- Left Panel: Bases List -->
			<div class="bases-panel-left" style="width: {leftPanelWidth}px;">
				<BasesList
					{selectedBase}
					onSelect={handleSelect}
					onEdit={handleEdit}
					onAdd={handleAdd}
					class="h-full"
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

			<!-- Right Panel: Base Preview -->
			<div class="bases-panel-right">
				<BasePreview
					base={selectedBase}
					onEdit={handleEdit}
					onDelete={handleDelete}
					class="h-full"
				/>
			</div>
		</div>
	{/if}
</div>

<!-- Base Editor Modal -->
<BaseEditor
	bind:isOpen={showEditor}
	base={editingBase}
	onSave={handleSave}
	onCancel={handleEditorCancel}
/>

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
		max-width: 600px;
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
