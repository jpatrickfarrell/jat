<script lang="ts">
	import type { UpstreamVariableGroup } from '$lib/utils/workflowVariables';

	let {
		groups = [],
		onInsert = () => {}
	}: {
		groups: UpstreamVariableGroup[];
		onInsert?: (insertText: string) => void;
	} = $props();
</script>

{#if groups.length > 0}
	<div class="mt-2">
		<div class="text-[10px] font-medium mb-1.5" style="color: oklch(0.50 0.02 250)">
			Available variables
		</div>
		<div class="flex flex-col gap-1.5">
			{#each groups as group}
				<div class="flex flex-wrap items-center gap-1">
					<!-- Source node label -->
					<span
						class="text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0"
						style="background: {group.color}20; color: {group.color}"
					>
						{group.sourceLabel}
					</span>
					<!-- Variable chips -->
					{#each group.variables as variable}
						<button
							type="button"
							class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer"
							style="background: oklch(0.20 0.01 250); color: oklch(0.70 0.02 250); border: 1px solid oklch(0.28 0.02 250)"
							title={variable.description}
							onclick={() => onInsert(variable.insertText)}
							onmouseenter={(e) => {
								const el = e.currentTarget;
								el.style.background = `${group.color}20`;
								el.style.borderColor = `${group.color}60`;
								el.style.color = group.color;
							}}
							onmouseleave={(e) => {
								const el = e.currentTarget;
								el.style.background = 'oklch(0.20 0.01 250)';
								el.style.borderColor = 'oklch(0.28 0.02 250)';
								el.style.color = 'oklch(0.70 0.02 250)';
							}}
						>
							{variable.insertText}
						</button>
					{/each}
				</div>
			{/each}
		</div>
	</div>
{/if}
