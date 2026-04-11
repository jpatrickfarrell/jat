<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<h4 class="text-xs font-semibold uppercase tracking-wider text-base-content/60 mb-2">
	{@render children()}
</h4>
