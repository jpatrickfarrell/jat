<script lang="ts">
	import type { ControlBlock } from '$lib/types/canvas';

	let { block }: { block: ControlBlock } = $props();
</script>

<div class="canvas-block-control flex items-center gap-3">
	<span class="text-xs font-mono font-semibold px-2 py-0.5 rounded" style="background: oklch(0.55 0.12 300 / 0.15); color: oklch(0.75 0.12 300); border: 1px solid oklch(0.55 0.12 300 / 0.3);">
		{block.name || 'unnamed'}
	</span>
	<span class="text-xs" style="color: oklch(0.50 0.02 250);">
		{block.controlType} control — configure in task jat-y3zof.4
	</span>
</div>
