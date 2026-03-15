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

	let { block }: { block: CanvasBlock } = $props();
</script>

{#if block.type === 'text'}
	<TextBlock {block} />
{:else if block.type === 'table_view'}
	<TableViewBlock {block} />
{:else if block.type === 'control'}
	<ControlBlock {block} />
{:else if block.type === 'formula'}
	<FormulaBlock {block} />
{:else if block.type === 'divider'}
	<DividerBlock {block} />
{:else}
	<div class="text-xs" style="color: oklch(0.60 0.15 30);">Unknown block type: {(block as any).type}</div>
{/if}
