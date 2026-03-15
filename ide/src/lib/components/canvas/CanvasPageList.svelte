<script lang="ts">
	/**
	 * CanvasPageList - Left panel showing list of canvas pages with CRUD
	 */
	import type { CanvasPage } from '$lib/types/canvas';

	let {
		pages,
		selectedPageId,
		onSelect,
		onAdd,
		onDelete,
		onRename
	}: {
		pages: CanvasPage[];
		selectedPageId: string | null;
		onSelect: (page: CanvasPage) => void;
		onAdd: () => void;
		onDelete: (page: CanvasPage) => void;
		onRename: (page: CanvasPage, newName: string) => void;
	} = $props();

	let renamingId = $state<string | null>(null);
	let renameValue = $state('');
	let contextMenuPage = $state<CanvasPage | null>(null);
	let contextX = $state(0);
	let contextY = $state(0);
	let contextVisible = $state(false);

	function handleContextMenu(e: MouseEvent, page: CanvasPage) {
		e.preventDefault();
		contextMenuPage = page;
		contextX = e.clientX;
		contextY = e.clientY;
		contextVisible = true;
	}

	function closeContextMenu() {
		contextVisible = false;
	}

	function startRename(page: CanvasPage) {
		renamingId = page.id;
		renameValue = page.name;
		closeContextMenu();
	}

	function commitRename(page: CanvasPage) {
		if (renameValue.trim() && renameValue !== page.name) {
			onRename(page, renameValue.trim());
		}
		renamingId = null;
	}

	function handleRenameKeydown(e: KeyboardEvent, page: CanvasPage) {
		if (e.key === 'Enter') {
			commitRename(page);
		} else if (e.key === 'Escape') {
			renamingId = null;
		}
	}

	function handleDeleteClick(page: CanvasPage) {
		closeContextMenu();
		onDelete(page);
	}

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr);
		const now = new Date();
		const diffMs = now.getTime() - d.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		if (diffMins < 1) return 'just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		const diffHours = Math.floor(diffMins / 60);
		if (diffHours < 24) return `${diffHours}h ago`;
		const diffDays = Math.floor(diffHours / 24);
		if (diffDays < 7) return `${diffDays}d ago`;
		return d.toLocaleDateString();
	}
</script>

<svelte:window onclick={closeContextMenu} />

<div class="h-full flex flex-col overflow-hidden" style="background: oklch(0.16 0.01 250);">
	<!-- Header -->
	<div class="flex items-center justify-between px-4 py-3" style="border-bottom: 1px solid oklch(0.25 0.02 250);">
		<h2 class="font-mono text-xs tracking-wider uppercase" style="color: oklch(0.65 0.02 250);">
			Canvas Pages
		</h2>
		<button
			onclick={onAdd}
			class="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-all duration-150 hover:scale-105 cursor-pointer"
			style="background: oklch(0.70 0.18 240 / 0.15); color: oklch(0.75 0.15 240); border: 1px solid oklch(0.70 0.18 240 / 0.3);"
			title="Create new canvas page"
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
			</svg>
			New
		</button>
	</div>

	<!-- Page List -->
	<div class="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
		{#if pages.length === 0}
			<div class="flex flex-col items-center justify-center h-full gap-3 px-4">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-10 h-10" style="color: oklch(0.35 0.02 250);">
					<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
				</svg>
				<p class="text-xs text-center" style="color: oklch(0.45 0.02 250);">
					No canvas pages yet.<br />Click <strong>New</strong> to create one.
				</p>
			</div>
		{:else}
			{#each pages as page}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="group flex items-center gap-2 px-3 py-2.5 rounded cursor-pointer transition-all duration-150"
					style="
						background: {selectedPageId === page.id ? 'oklch(0.70 0.18 240 / 0.12)' : 'transparent'};
						border-left: 2px solid {selectedPageId === page.id ? 'oklch(0.70 0.18 240 / 0.6)' : 'transparent'};
					"
					onclick={() => onSelect(page)}
					oncontextmenu={(e) => handleContextMenu(e, page)}
				>
					<div class="flex-1 min-w-0">
						{#if renamingId === page.id}
							<!-- svelte-ignore a11y_autofocus -->
							<input
								type="text"
								bind:value={renameValue}
								onblur={() => commitRename(page)}
								onkeydown={(e) => handleRenameKeydown(e, page)}
								autofocus
								class="w-full bg-transparent border-none outline-none text-sm font-medium px-0"
								style="color: oklch(0.85 0.02 250);"
							/>
						{:else}
							<div class="text-sm font-medium truncate" style="color: {selectedPageId === page.id ? 'oklch(0.85 0.12 240)' : 'oklch(0.75 0.02 250)'};">
								{page.name}
							</div>
							<div class="text-[10px] mt-0.5" style="color: oklch(0.45 0.02 250);">
								{page.blocks.length} block{page.blocks.length !== 1 ? 's' : ''} · {formatDate(page.updated_at)}
							</div>
						{/if}
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<!-- Context Menu -->
{#if contextMenuPage}
	<div
		class="canvas-context-menu"
		class:canvas-context-menu-hidden={!contextVisible}
		style="position: fixed; left: {contextX}px; top: {contextY}px; z-index: 50;"
	>
		<button onclick={() => { if (contextMenuPage) startRename(contextMenuPage); }}>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
			</svg>
			Rename
		</button>
		<button onclick={() => { if (contextMenuPage) handleDeleteClick(contextMenuPage); }} style="color: oklch(0.70 0.15 30);">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
			</svg>
			Delete
		</button>
	</div>
{/if}

<style>
	.canvas-context-menu {
		background: oklch(0.20 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.5rem;
		padding: 0.25rem;
		min-width: 140px;
		box-shadow: 0 8px 24px oklch(0 0 0 / 0.4);
	}

	.canvas-context-menu-hidden {
		display: none;
	}

	.canvas-context-menu button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.375rem 0.625rem;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		color: oklch(0.75 0.02 250);
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background 0.1s;
	}

	.canvas-context-menu button:hover {
		background: oklch(0.28 0.02 250);
	}
</style>
