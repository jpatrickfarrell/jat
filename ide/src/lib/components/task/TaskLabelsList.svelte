<script lang="ts">
	let {
		labels,
		emptyText = 'No labels'
	}: {
		labels: string[];
		emptyText?: string;
	} = $props();
</script>

{#if labels.length > 0}
	<div class="flex flex-wrap gap-1.5">
		{#each labels as label}
			<span class="badge badge-sm badge-outline">{label}</span>
		{/each}
	</div>
{:else}
	<span class="text-sm text-base-content/50 italic">{emptyText}</span>
{/if}
