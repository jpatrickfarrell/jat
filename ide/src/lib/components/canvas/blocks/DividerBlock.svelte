<script lang="ts">
	import type { DividerBlock } from '$lib/types/canvas';

	let { block }: { block: DividerBlock } = $props();
</script>

<div class="canvas-divider">
	<div class="canvas-divider-line"></div>
</div>

<style>
	.canvas-divider {
		padding: 0.5rem 0;
	}

	.canvas-divider-line {
		height: 1px;
		width: 100%;
		background: linear-gradient(
			90deg,
			transparent,
			oklch(0.35 0.02 250) 15%,
			oklch(0.35 0.02 250) 85%,
			transparent
		);
	}
</style>
