<script lang="ts">
	import type { DividerBlock } from '$lib/types/canvas';

	let { block }: { block: DividerBlock } = $props();
</script>

<div class="canvas-block-divider py-1">
	<div class="h-px w-full" style="background: linear-gradient(90deg, transparent, oklch(0.35 0.02 250), transparent);"></div>
</div>
