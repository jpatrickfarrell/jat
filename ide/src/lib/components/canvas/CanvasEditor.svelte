<script lang="ts">
	/**
	 * CanvasEditor - Right panel for editing a canvas page
	 * Renders blocks vertically with + buttons between them for inserting new blocks.
	 */
	import type { CanvasPage, CanvasBlock, CanvasBlockType } from '$lib/types/canvas';
	import BlockRenderer from './BlockRenderer.svelte';

	let {
		page,
		onUpdatePage,
		onTitleChange
	}: {
		page: CanvasPage | null;
		onUpdatePage: (blocks: CanvasBlock[]) => void;
		onTitleChange: (name: string) => void;
	} = $props();

	let editingTitle = $state(false);
	let titleValue = $state('');
	let addMenuIndex = $state<number | null>(null);

	// Block type menu options
	const blockTypes: { type: CanvasBlockType; label: string; icon: string; desc: string }[] = [
		{ type: 'text', label: 'Text', icon: 'T', desc: 'Rich text content' },
		{ type: 'table_view', label: 'Table View', icon: '⊞', desc: 'Embed a data table' },
		{ type: 'control', label: 'Control', icon: '◉', desc: 'Interactive select/slider' },
		{ type: 'formula', label: 'Formula', icon: '=', desc: 'Computed value' },
		{ type: 'divider', label: 'Divider', icon: '—', desc: 'Horizontal separator' },
	];

	function startEditTitle() {
		if (!page) return;
		editingTitle = true;
		titleValue = page.name;
	}

	function commitTitle() {
		if (titleValue.trim() && titleValue !== page?.name) {
			onTitleChange(titleValue.trim());
		}
		editingTitle = false;
	}

	function handleTitleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') commitTitle();
		else if (e.key === 'Escape') editingTitle = false;
	}

	function generateId(): string {
		return 'blk_' + Math.random().toString(36).substring(2, 10);
	}

	function addBlock(type: CanvasBlockType, atIndex: number) {
		if (!page) return;

		let newBlock: CanvasBlock;
		const id = generateId();

		switch (type) {
			case 'text':
				newBlock = { type: 'text', id, content: '' };
				break;
			case 'table_view':
				newBlock = { type: 'table_view', id, tableName: '', controlFilters: {} };
				break;
			case 'control':
				newBlock = { type: 'control', id, name: '', controlType: 'select', config: {}, value: null };
				break;
			case 'formula':
				newBlock = { type: 'formula', id, expression: '' };
				break;
			case 'divider':
				newBlock = { type: 'divider', id };
				break;
			default:
				return;
		}

		const blocks = [...page.blocks];
		blocks.splice(atIndex, 0, newBlock);
		onUpdatePage(blocks);
		addMenuIndex = null;
	}

	function toggleAddMenu(index: number) {
		addMenuIndex = addMenuIndex === index ? null : index;
	}
</script>

<svelte:window onclick={() => { addMenuIndex = null; }} />

<div class="h-full flex flex-col overflow-hidden" style="background: oklch(0.14 0.01 250);">
	{#if !page}
		<!-- Empty state -->
		<div class="flex-1 flex flex-col items-center justify-center gap-4">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="0.75" stroke="currentColor" class="w-16 h-16" style="color: oklch(0.30 0.02 250);">
				<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
			</svg>
			<p class="text-sm" style="color: oklch(0.45 0.02 250);">Select a canvas page to start editing</p>
		</div>
	{:else}
		<!-- Page content -->
		<div class="flex-1 overflow-y-auto">
			<div class="max-w-3xl mx-auto px-8 py-6">
				<!-- Page title (inline editable) -->
				<div class="mb-6">
					{#if editingTitle}
						<!-- svelte-ignore a11y_autofocus -->
						<input
							type="text"
							bind:value={titleValue}
							onblur={commitTitle}
							onkeydown={handleTitleKeydown}
							autofocus
							class="w-full bg-transparent border-none outline-none text-2xl font-bold"
							style="color: oklch(0.90 0.02 250);"
						/>
					{:else}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<h1
							class="text-2xl font-bold cursor-text transition-colors duration-150"
							style="color: oklch(0.90 0.02 250);"
							onclick={startEditTitle}
							title="Click to edit title"
						>
							{page.name}
						</h1>
					{/if}
				</div>

				<!-- Add block button at top -->
				<div class="add-block-zone">
					<button
						class="add-block-btn"
						onclick={(e) => { e.stopPropagation(); toggleAddMenu(0); }}
						title="Add block"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
						</svg>
					</button>
					{#if addMenuIndex === 0}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="add-block-menu" onclick={(e) => e.stopPropagation()}>
							{#each blockTypes as bt}
								<button onclick={() => addBlock(bt.type, 0)}>
									<span class="block-type-icon">{bt.icon}</span>
									<div>
										<div class="text-xs font-medium" style="color: oklch(0.80 0.02 250);">{bt.label}</div>
										<div class="text-[10px]" style="color: oklch(0.45 0.02 250);">{bt.desc}</div>
									</div>
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Blocks -->
				{#each page.blocks as block, i (block.id)}
					<div class="canvas-block group">
						<BlockRenderer {block} />
					</div>

					<!-- Add block button between/after blocks -->
					<div class="add-block-zone">
						<button
							class="add-block-btn"
							onclick={(e) => { e.stopPropagation(); toggleAddMenu(i + 1); }}
							title="Add block"
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
							</svg>
						</button>
						{#if addMenuIndex === i + 1}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div class="add-block-menu" onclick={(e) => e.stopPropagation()}>
								{#each blockTypes as bt}
									<button onclick={() => addBlock(bt.type, i + 1)}>
										<span class="block-type-icon">{bt.icon}</span>
										<div>
											<div class="text-xs font-medium" style="color: oklch(0.80 0.02 250);">{bt.label}</div>
											<div class="text-[10px]" style="color: oklch(0.45 0.02 250);">{bt.desc}</div>
										</div>
									</button>
								{/each}
							</div>
						{/if}
					</div>
				{/each}

				{#if page.blocks.length === 0}
					<div class="text-center py-8">
						<p class="text-sm mb-2" style="color: oklch(0.50 0.02 250);">This page is empty</p>
						<p class="text-xs" style="color: oklch(0.40 0.02 250);">Click the <strong>+</strong> button above to add your first block</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.canvas-block {
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid transparent;
		transition: border-color 0.15s, background 0.15s;
	}

	.canvas-block:hover {
		border-color: oklch(0.30 0.02 250);
		background: oklch(0.17 0.01 250);
	}

	.add-block-zone {
		position: relative;
		display: flex;
		justify-content: center;
		height: 20px;
		margin: 2px 0;
	}

	.add-block-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 1px solid oklch(0.30 0.02 250);
		background: oklch(0.18 0.01 250);
		color: oklch(0.50 0.02 250);
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.15s, background 0.15s, color 0.15s, border-color 0.15s;
	}

	.add-block-zone:hover .add-block-btn,
	.add-block-btn:focus {
		opacity: 1;
	}

	.add-block-btn:hover {
		background: oklch(0.70 0.18 240 / 0.15);
		border-color: oklch(0.70 0.18 240 / 0.4);
		color: oklch(0.75 0.15 240);
	}

	.add-block-menu {
		position: absolute;
		top: 24px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 40;
		background: oklch(0.20 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.5rem;
		padding: 0.25rem;
		min-width: 200px;
		box-shadow: 0 8px 24px oklch(0 0 0 / 0.4);
		animation: animate-scale-in 0.12s ease-out;
	}

	.add-block-menu button {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		padding: 0.5rem 0.625rem;
		border-radius: 0.375rem;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background 0.1s;
		text-align: left;
	}

	.add-block-menu button:hover {
		background: oklch(0.28 0.02 250);
	}

	.block-type-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 600;
		background: oklch(0.25 0.02 250);
		color: oklch(0.65 0.10 240);
		flex-shrink: 0;
	}

	@keyframes animate-scale-in {
		from { opacity: 0; transform: translateX(-50%) scale(0.95); }
		to { opacity: 1; transform: translateX(-50%) scale(1); }
	}
</style>
