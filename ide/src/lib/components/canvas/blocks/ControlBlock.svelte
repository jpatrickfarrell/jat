<script lang="ts">
	import type { ControlBlock } from '$lib/types/canvas';
	import CanvasSelectControl from './CanvasSelectControl.svelte';

	let {
		block,
		project = null,
		existingNames = [],
		onBlockUpdate = () => {},
		onControlChange = () => {},
	}: {
		block: ControlBlock;
		project?: string | null;
		existingNames?: string[];
		onBlockUpdate?: (updated: ControlBlock) => void;
		onControlChange?: (controlName: string, value: unknown) => void;
	} = $props();
</script>

{#if block.controlType === 'select'}
	<CanvasSelectControl
		{block}
		{project}
		{existingNames}
		{onBlockUpdate}
		{onControlChange}
	/>
{:else}
	<!-- Stub for other control types (task jat-y3zof.9) -->
	<div class="flex items-center gap-3">
		<span class="text-xs font-mono font-semibold px-2 py-0.5 rounded" style="background: oklch(0.55 0.12 300 / 0.15); color: oklch(0.75 0.12 300); border: 1px solid oklch(0.55 0.12 300 / 0.3);">
			{block.name || 'unnamed'}
		</span>
		<span class="text-xs" style="color: oklch(0.50 0.02 250);">
			{block.controlType} control — coming in jat-y3zof.9
		</span>
	</div>
{/if}
