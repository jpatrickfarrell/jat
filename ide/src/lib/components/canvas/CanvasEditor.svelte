<script lang="ts">
	/**
	 * CanvasEditor - Right panel for editing a canvas page
	 * Renders blocks vertically with + buttons between them for inserting new blocks.
	 * Supports drag-to-reorder and delete functionality for blocks.
	 */
	import type { CanvasBlock, CanvasBlockType } from '$lib/types/canvas';
	import BlockRenderer from './BlockRenderer.svelte';

	// Accept any object with the required page shape (CanvasPage or KnowledgeBase)
	interface PageLike {
		id: string;
		name: string;
		blocks: CanvasBlock[];
		is_base?: boolean;
		always_inject?: boolean;
	}

	let {
		page,
		project = null,
		controlValues = {},
		refreshTokens = {},
		onUpdatePage,
		onTitleChange,
		onControlChange = () => {},
		onToggleBase = () => {},
	}: {
		page: PageLike | null;
		project?: string | null;
		controlValues?: Record<string, unknown>;
		refreshTokens?: Record<string, number>;
		onUpdatePage: (blocks: CanvasBlock[]) => void;
		onTitleChange: (name: string) => void;
		onControlChange?: (controlName: string, value: unknown) => void;
		onToggleBase?: (isBase: boolean) => void;
	} = $props();

	let editingTitle = $state(false);
	let titleValue = $state('');
	let titleInputEl: HTMLInputElement | undefined = $state(undefined);
	let addMenuIndex = $state<number | null>(null);

	// Drag-and-drop state
	let draggedIndex = $state<number | null>(null);
	let dropTargetIndex = $state<number | null>(null);

	// Delete confirmation state
	let confirmDeleteIndex = $state<number | null>(null);

	// Block type menu options — control types expanded for direct selection
	type BlockMenuOption = { type: CanvasBlockType; label: string; icon: string; desc: string; controlType?: string };
	const blockTypes: BlockMenuOption[] = [
		{ type: 'text', label: 'Text', icon: 'T', desc: 'Rich text content' },
		{ type: 'table_view', label: 'Table View', icon: '⊞', desc: 'Embed a data table' },
		{ type: 'control', label: 'Select', icon: '▾', desc: 'Dropdown from data table', controlType: 'select' },
		{ type: 'control', label: 'Slider', icon: '≡', desc: 'Numeric range slider', controlType: 'slider' },
		{ type: 'control', label: 'Date', icon: '◷', desc: 'Date or date range picker', controlType: 'date' },
		{ type: 'control', label: 'Text Input', icon: 'A', desc: 'Free-form text entry', controlType: 'text_input' },
		{ type: 'control', label: 'Checkbox', icon: '☑', desc: 'Boolean toggle', controlType: 'checkbox' },
		{ type: 'formula', label: 'Formula', icon: '=', desc: 'Computed value' },
		{ type: 'action', label: 'Action', icon: '▶', desc: 'Clickable action button' },
		{ type: 'divider', label: 'Divider', icon: '—', desc: 'Horizontal separator' },
	];

	// Block type icons for the toolbar
	const blockTypeIcons: Record<string, string> = {
		text: 'T',
		table_view: '⊞',
		control: '◉',
		formula: '=',
		action: '▶',
		divider: '—',
	};

	function startEditTitle() {
		if (!page) return;
		editingTitle = true;
		titleValue = page.name;
		requestAnimationFrame(() => {
			titleInputEl?.focus({ preventScroll: true });
		});
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

	function addBlock(type: CanvasBlockType, atIndex: number, controlType?: string) {
		if (!page) return;

		let newBlock: CanvasBlock;
		const id = generateId();
		const ct = (controlType || 'select') as import('$lib/types/canvas').ControlType;

		switch (type) {
			case 'text':
				newBlock = { type: 'text', id, content: '' };
				break;
			case 'table_view':
				newBlock = { type: 'table_view', id, tableName: '', controlFilters: {} };
				break;
			case 'control': {
				const defaultConfigs: Record<string, any> = {
					select: {},
					slider: { min: 0, max: 100, step: 1 },
					date: {},
					text_input: {},
					checkbox: {},
				};
				newBlock = { type: 'control', id, name: '', controlType: ct, config: defaultConfigs[ct] || {}, value: null };
				break;
			}
			case 'formula':
				newBlock = { type: 'formula', id, expression: '' };
				break;
			case 'action':
				newBlock = { type: 'action', id, label: '', actionType: '', actionConfig: {} };
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

	function updateBlock(updatedBlock: CanvasBlock) {
		if (!page) return;
		const blocks = page.blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b));
		onUpdatePage(blocks);
	}

	// --- Drag-and-drop handlers ---
	function handleDragStart(e: DragEvent, index: number) {
		if (!e.dataTransfer) return;
		draggedIndex = index;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', index.toString());
	}

	function handleDragEnd() {
		draggedIndex = null;
		dropTargetIndex = null;
	}

	function handleDragOver(e: DragEvent, index: number) {
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		if (draggedIndex !== null && draggedIndex !== index) {
			dropTargetIndex = index;
		}
	}

	function handleDragLeave(e: DragEvent) {
		const related = e.relatedTarget as HTMLElement | null;
		if (!related?.closest('.canvas-block-wrapper')) {
			dropTargetIndex = null;
		}
	}

	function handleDrop(e: DragEvent, index: number) {
		e.preventDefault();
		if (!page || draggedIndex === null || draggedIndex === index) {
			draggedIndex = null;
			dropTargetIndex = null;
			return;
		}
		const blocks = [...page.blocks];
		const [moved] = blocks.splice(draggedIndex, 1);
		blocks.splice(index > draggedIndex ? index - 1 : index, 0, moved);
		onUpdatePage(blocks);
		draggedIndex = null;
		dropTargetIndex = null;
	}

	// --- Drop zone handlers (between blocks) ---
	function handleZoneDragOver(e: DragEvent, insertAt: number) {
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		if (draggedIndex !== null) {
			dropTargetIndex = insertAt;
		}
	}

	function handleZoneDragLeave() {
		// Only clear if leaving to non-zone area
	}

	function handleZoneDrop(e: DragEvent, insertAt: number) {
		e.preventDefault();
		if (!page || draggedIndex === null) {
			draggedIndex = null;
			dropTargetIndex = null;
			return;
		}
		const blocks = [...page.blocks];
		const [moved] = blocks.splice(draggedIndex, 1);
		// Adjust insert position if we removed from before
		const adjustedIndex = insertAt > draggedIndex ? insertAt - 1 : insertAt;
		blocks.splice(adjustedIndex, 0, moved);
		onUpdatePage(blocks);
		draggedIndex = null;
		dropTargetIndex = null;
	}

	// --- Delete handlers ---
	function isBlockEmpty(block: CanvasBlock): boolean {
		if (block.type === 'text') return !block.content?.trim();
		if (block.type === 'divider') return true;
		if (block.type === 'formula') return !block.expression?.trim();
		if (block.type === 'control') return !block.name?.trim();
		if (block.type === 'table_view') return !block.tableName?.trim();
		if (block.type === 'action') return !block.label?.trim() && !block.actionType?.trim();
		return false;
	}

	function deleteBlock(index: number) {
		if (!page) return;
		const block = page.blocks[index];
		if (!block) return;

		if (isBlockEmpty(block)) {
			// Delete immediately for empty blocks
			const blocks = [...page.blocks];
			blocks.splice(index, 1);
			onUpdatePage(blocks);
			confirmDeleteIndex = null;
		} else if (confirmDeleteIndex === index) {
			// Second click = confirm
			const blocks = [...page.blocks];
			blocks.splice(index, 1);
			onUpdatePage(blocks);
			confirmDeleteIndex = null;
		} else {
			// First click on non-empty = show confirmation
			confirmDeleteIndex = index;
		}
	}

	function handleBlockKeydown(e: KeyboardEvent, index: number) {
		if (!page) return;
		const block = page.blocks[index];
		if (!block) return;

		// Delete/Backspace on empty text block removes it
		if ((e.key === 'Delete' || e.key === 'Backspace') && block.type === 'text' && isBlockEmpty(block)) {
			// Only delete if the event target is the block wrapper, not an inner input/textarea
			const target = e.target as HTMLElement;
			if (!target.closest('textarea') && !target.closest('input') && !target.closest('[contenteditable]')) {
				e.preventDefault();
				const blocks = [...page.blocks];
				blocks.splice(index, 1);
				onUpdatePage(blocks);
			}
		}
	}

	// Collect control names for uniqueness validation
	const controlNames = $derived(
		page ? page.blocks
			.filter((b): b is import('$lib/types/canvas').ControlBlock => b.type === 'control' && !!b.name)
			.map(b => b.name) : []
	);
</script>

<svelte:window onclick={() => { addMenuIndex = null; confirmDeleteIndex = null; }} />

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
				<div class="mb-2">
					{#if editingTitle}
						<input
							type="text"
							bind:this={titleInputEl}
							bind:value={titleValue}
							onblur={commitTitle}
							onkeydown={handleTitleKeydown}
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

				<!-- Knowledge Base toggle -->
				{#if true}
				{@const isKB = !!(page.is_base || page.always_inject)}
				<div class="mb-6 flex items-center gap-2">
					<label class="canvas-base-toggle">
						<input
							type="checkbox"
							checked={isKB}
							onchange={() => onToggleBase(!isKB)}
						/>
						<span class="toggle-track">
							<span class="toggle-thumb"></span>
						</span>
						<span class="toggle-label" class:active={isKB}>
							{isKB ? 'Always Inject' : 'Inject into Agent Prompts'}
						</span>
					</label>
					{#if isKB}
						<span class="text-[10px] px-1.5 py-0.5 rounded" style="background: oklch(0.65 0.20 145 / 0.15); color: oklch(0.70 0.18 145); border: 1px solid oklch(0.65 0.20 145 / 0.3);">
							Injected into agent prompts
						</span>
					{/if}
				</div>
				{/if}

				{#if page.blocks.length === 0}
					<!-- Empty state: prominent add block button -->
					<div class="empty-add-block">
						<button
							class="empty-add-btn"
							onclick={(e) => { e.stopPropagation(); toggleAddMenu(0); }}
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
							</svg>
							<span>Add a block</span>
						</button>
						{#if addMenuIndex === 0}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div class="add-block-menu add-block-menu-empty" onclick={(e) => e.stopPropagation()}>
								{#each blockTypes as bt}
									<button onclick={() => addBlock(bt.type, 0, bt.controlType)}>
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
				{:else}
					<!-- Drop zone at top -->
					<div
						class="add-block-zone"
						class:drop-indicator-active={draggedIndex !== null && dropTargetIndex === 0 && draggedIndex !== 0}
						ondragover={(e) => handleZoneDragOver(e, 0)}
						ondragleave={handleZoneDragLeave}
						ondrop={(e) => handleZoneDrop(e, 0)}
					>
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
									<button onclick={() => addBlock(bt.type, 0, bt.controlType)}>
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
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="canvas-block-wrapper group"
							class:dragging={draggedIndex === i}
							class:drop-above={dropTargetIndex === i && draggedIndex !== null && draggedIndex > i}
							class:drop-below={dropTargetIndex === i && draggedIndex !== null && draggedIndex < i}
							draggable="false"
							ondragover={(e) => handleDragOver(e, i)}
							ondragleave={handleDragLeave}
							ondrop={(e) => handleDrop(e, i)}
							onkeydown={(e) => handleBlockKeydown(e, i)}
						>
							<!-- Block toolbar (visible on hover) -->
							<div class="block-toolbar">
								<!-- Drag handle -->
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									class="toolbar-btn drag-handle"
									draggable="true"
									ondragstart={(e) => handleDragStart(e, i)}
									ondragend={handleDragEnd}
									title="Drag to reorder"
								>
									<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" class="w-3.5 h-3.5">
										<circle cx="5.5" cy="3.5" r="1.25" />
										<circle cx="10.5" cy="3.5" r="1.25" />
										<circle cx="5.5" cy="8" r="1.25" />
										<circle cx="10.5" cy="8" r="1.25" />
										<circle cx="5.5" cy="12.5" r="1.25" />
										<circle cx="10.5" cy="12.5" r="1.25" />
									</svg>
								</div>

								<!-- Block type indicator -->
								<span class="toolbar-type-icon">{blockTypeIcons[block.type] || '?'}</span>

								<!-- Spacer -->
								<div class="flex-1"></div>

								<!-- Delete button -->
								<button
									class="toolbar-btn delete-btn"
									class:confirm-delete={confirmDeleteIndex === i}
									onclick={(e) => { e.stopPropagation(); deleteBlock(i); }}
									title={confirmDeleteIndex === i ? 'Click again to confirm delete' : 'Delete block'}
								>
									{#if confirmDeleteIndex === i}
										<span class="text-[10px] font-medium" style="color: oklch(0.80 0.18 25);">Delete?</span>
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
										</svg>
									{/if}
								</button>
							</div>

							<!-- Block content -->
							<div class="canvas-block">
								<BlockRenderer {block} {project} pageId={page?.id ?? null} {controlValues} {refreshTokens} existingControlNames={controlNames} onBlockUpdate={updateBlock} {onControlChange} />
							</div>
						</div>

						<!-- Add block button / drop zone between/after blocks -->
						<div
							class="add-block-zone"
							class:drop-indicator-active={draggedIndex !== null && dropTargetIndex === i + 1 && draggedIndex !== i && draggedIndex !== i + 1}
							ondragover={(e) => handleZoneDragOver(e, i + 1)}
							ondragleave={handleZoneDragLeave}
							ondrop={(e) => handleZoneDrop(e, i + 1)}
						>
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
										<button onclick={() => addBlock(bt.type, i + 1, bt.controlType)}>
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
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	/* --- Block wrapper with toolbar --- */
	.canvas-block-wrapper {
		position: relative;
		border-radius: 0.5rem;
		transition: opacity 0.2s, transform 0.2s;
	}

	.canvas-block-wrapper.dragging {
		opacity: 0.4;
		transform: scale(0.98);
	}

	/* Drop indicators on blocks */
	.canvas-block-wrapper.drop-above {
		border-top: 2px solid oklch(0.65 0.15 200);
	}

	.canvas-block-wrapper.drop-below {
		border-bottom: 2px solid oklch(0.65 0.15 200);
	}

	/* Block toolbar - left side on hover */
	.block-toolbar {
		position: absolute;
		left: -36px;
		top: 0.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		opacity: 0;
		transition: opacity 0.15s;
		z-index: 10;
	}

	.canvas-block-wrapper:hover .block-toolbar {
		opacity: 1;
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border-radius: 4px;
		border: none;
		background: transparent;
		color: oklch(0.45 0.02 250);
		cursor: pointer;
		transition: background 0.1s, color 0.1s;
	}

	.toolbar-btn:hover {
		background: oklch(0.25 0.02 250);
		color: oklch(0.70 0.02 250);
	}

	.drag-handle {
		cursor: grab;
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	.toolbar-type-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		font-size: 10px;
		font-weight: 600;
		color: oklch(0.40 0.05 240);
		pointer-events: none;
	}

	.delete-btn:hover {
		background: oklch(0.50 0.12 25 / 0.2);
		color: oklch(0.70 0.18 25);
	}

	.delete-btn.confirm-delete {
		background: oklch(0.50 0.12 25 / 0.25);
		width: auto;
		padding: 0 6px;
	}

	.canvas-block {
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		border: 1px solid transparent;
		transition: border-color 0.15s, background 0.15s;
	}

	.canvas-block-wrapper:hover .canvas-block {
		border-color: oklch(0.30 0.02 250);
		background: oklch(0.17 0.01 250);
	}

	/* --- Drop indicator on add-block zones --- */
	.add-block-zone {
		position: relative;
		display: flex;
		justify-content: center;
		height: 20px;
		margin: 2px 0;
		transition: height 0.15s;
	}

	.add-block-zone.drop-indicator-active {
		height: 4px;
		background: oklch(0.65 0.15 200);
		border-radius: 2px;
		margin: 4px 0;
	}

	.add-block-zone.drop-indicator-active .add-block-btn {
		display: none;
	}

	.add-block-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 1px solid oklch(0.25 0.02 250);
		background: oklch(0.16 0.01 250);
		color: oklch(0.40 0.02 250);
		cursor: pointer;
		opacity: 0.4;
		transition: opacity 0.15s, background 0.15s, color 0.15s, border-color 0.15s;
	}

	.add-block-zone:hover .add-block-btn,
	.add-block-btn:focus {
		opacity: 1;
		border-color: oklch(0.30 0.02 250);
		background: oklch(0.18 0.01 250);
		color: oklch(0.50 0.02 250);
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

	/* Empty state add block */
	.empty-add-block {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem 0;
	}

	.empty-add-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 1.25rem;
		border-radius: 0.5rem;
		border: 1px dashed oklch(0.35 0.02 250);
		background: oklch(0.17 0.01 250);
		color: oklch(0.55 0.02 250);
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.empty-add-btn:hover {
		border-color: oklch(0.70 0.18 240 / 0.5);
		background: oklch(0.70 0.18 240 / 0.08);
		color: oklch(0.75 0.15 240);
	}

	.add-block-menu-empty {
		top: auto;
		margin-top: 0.5rem;
		position: relative;
		left: auto;
		transform: none;
		animation: animate-scale-in-center 0.12s ease-out;
	}

	@keyframes animate-scale-in {
		from { opacity: 0; transform: translateX(-50%) scale(0.95); }
		to { opacity: 1; transform: translateX(-50%) scale(1); }
	}

	@keyframes animate-scale-in-center {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}

	/* Knowledge Base toggle */
	.canvas-base-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		user-select: none;
	}

	.canvas-base-toggle input {
		display: none;
	}

	.toggle-track {
		position: relative;
		width: 32px;
		height: 18px;
		border-radius: 9px;
		background: oklch(0.25 0.02 250);
		border: 1px solid oklch(0.35 0.02 250);
		transition: background 0.2s, border-color 0.2s;
		flex-shrink: 0;
	}

	.canvas-base-toggle input:checked + .toggle-track {
		background: oklch(0.55 0.18 145 / 0.4);
		border-color: oklch(0.65 0.20 145 / 0.6);
	}

	.toggle-thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: oklch(0.55 0.02 250);
		transition: transform 0.2s, background 0.2s;
	}

	.canvas-base-toggle input:checked + .toggle-track .toggle-thumb {
		transform: translateX(14px);
		background: oklch(0.75 0.20 145);
	}

	.toggle-label {
		font-size: 0.75rem;
		color: oklch(0.50 0.02 250);
		transition: color 0.2s;
	}

	.toggle-label.active {
		color: oklch(0.70 0.18 145);
	}
</style>
