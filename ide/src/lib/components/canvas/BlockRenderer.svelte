<script lang="ts">
	/**
	 * BlockRenderer - Dispatches to the correct block component based on block.type
	 */
	import type { CanvasBlock } from '$lib/types/canvas';
	import TextBlock from './blocks/TextBlock.svelte';
	import TableViewBlock from './blocks/TableViewBlock.svelte';
	import ControlBlock from './blocks/ControlBlock.svelte';
	import FormulaBlock from './blocks/FormulaBlock.svelte';
	import DividerBlock from './blocks/DividerBlock.svelte';

	let {
		block,
		project = null,
		existingControlNames = [],
		onBlockUpdate,
		onControlChange = () => {},
	}: {
		block: CanvasBlock;
		project?: string | null;
		existingControlNames?: string[];
		onBlockUpdate?: (block: CanvasBlock) => void;
		onControlChange?: (controlName: string, value: unknown) => void;
	} = $props();
</script>

{#if block.type === 'text'}
	<TextBlock {block} onUpdate={onBlockUpdate} />
{:else if block.type === 'table_view'}
	<TableViewBlock {block} />
{:else if block.type === 'control'}
	<ControlBlock
		{block}
		{project}
		existingNames={existingControlNames}
		onBlockUpdate={(updated) => onBlockUpdate?.(updated)}
		onControlChange={(name, value) => onControlChange(name, value)}
	/>
{:else if block.type === 'formula'}
	<FormulaBlock {block} />
{:else if block.type === 'divider'}
	<DividerBlock {block} />
{:else}
	<div class="text-xs" style="color: oklch(0.60 0.15 30);">Unknown block type: {(block as any).type}</div>
{/if}
