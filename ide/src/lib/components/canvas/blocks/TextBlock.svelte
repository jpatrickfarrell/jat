<script lang="ts">
	import type { TextBlock } from '$lib/types/canvas';

	let { block }: { block: TextBlock } = $props();
</script>

<div class="canvas-block-text">
	{#if block.content}
		<p class="whitespace-pre-wrap text-sm" style="color: oklch(0.80 0.02 250);">{block.content}</p>
	{:else}
		<p class="text-sm italic" style="color: oklch(0.45 0.02 250);">Empty text block</p>
	{/if}
</div>
