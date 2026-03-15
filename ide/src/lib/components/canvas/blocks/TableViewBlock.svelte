<script lang="ts">
	import type { TableViewBlock } from '$lib/types/canvas';

	let { block }: { block: TableViewBlock } = $props();
</script>

<div class="canvas-block-table-view">
	<div class="flex items-center gap-2 mb-2">
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4" style="color: oklch(0.60 0.15 200);">
			<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5M3.75 3v18M9.75 3v18M15.75 3v18M20.25 3v18" />
		</svg>
		<span class="text-xs font-mono" style="color: oklch(0.65 0.12 200);">{block.tableName || 'No table selected'}</span>
	</div>
	<div class="rounded border px-3 py-4 text-center text-xs" style="border-color: oklch(0.30 0.02 250); color: oklch(0.50 0.02 250);">
		Table view — configure in task jat-y3zof.5
	</div>
</div>
