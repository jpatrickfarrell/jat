<script lang="ts">
	import type { FormulaBlock } from '$lib/types/canvas';

	let { block }: { block: FormulaBlock } = $props();
</script>

<div class="canvas-block-formula flex items-center gap-2">
	<span class="text-xs font-mono px-1.5 py-0.5 rounded" style="background: oklch(0.55 0.15 145 / 0.15); color: oklch(0.70 0.15 145);">=</span>
	<code class="text-xs font-mono" style="color: oklch(0.70 0.10 145);">
		{block.expression || 'Empty formula'}
	</code>
	{#if block.name}
		<span class="text-xs" style="color: oklch(0.45 0.02 250);">({block.name})</span>
	{/if}
</div>
