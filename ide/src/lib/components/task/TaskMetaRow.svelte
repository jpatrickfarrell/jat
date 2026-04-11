<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		class: className = 'flex flex-wrap gap-1.5'
	}: {
		children: Snippet;
		class?: string;
	} = $props();
</script>

<div class={className}>
	{@render children()}
</div>
