<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		children
	}: {
		label: string;
		children: Snippet;
	} = $props();
</script>

<div class="flex flex-col gap-0.5 bg-base-200 px-2.5 py-2 rounded-md">
	<span class="text-[0.625rem] uppercase tracking-wide text-base-content/50">{label}</span>
	<span class="text-sm font-medium text-base-content">
		{@render children()}
	</span>
</div>
