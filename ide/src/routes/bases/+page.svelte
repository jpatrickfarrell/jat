<script lang="ts">
	/**
	 * Knowledge Bases Page
	 *
	 * Two-panel layout: BasesList (left) + BasePreview (right).
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
		// Select the saved base
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
		<div class="flex-1 p-4 overflow-hidden">
			<div class="h-full grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div class="skeleton rounded-xl" style="background: oklch(0.18 0.02 250); min-height: 400px;"></div>
				<div class="lg:col-span-2 skeleton rounded-xl" style="background: oklch(0.18 0.02 250); min-height: 400px;"></div>
			</div>
		</div>
	{:else}
		<!-- Main Content -->
		<div class="flex-1 p-4 overflow-hidden">
			<div class="h-full grid grid-cols-1 lg:grid-cols-3 gap-4">
				<!-- Left: Bases List -->
				<div class="min-h-0 overflow-hidden">
					<BasesList
						{selectedBase}
						onSelect={handleSelect}
						onEdit={handleEdit}
						onAdd={handleAdd}
						class="h-full"
					/>
				</div>

				<!-- Right: Base Preview -->
				<div class="lg:col-span-2 min-h-0 overflow-hidden">
					<BasePreview
						base={selectedBase}
						onEdit={handleEdit}
						onDelete={handleDelete}
						class="h-full"
					/>
				</div>
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
