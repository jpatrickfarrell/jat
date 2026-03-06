<!--
  FxText - Renders text with inline @fx:expression evaluation.

  Usage:
    <FxText text={task.title} context={{ priority: task.priority }} />
    <FxText text={task.description} context={taskCtx} class="text-sm" />
-->
<script lang="ts">
	import { parseFx, hasFx } from '$lib/utils/formulaDisplay';

	let {
		text = '',
		context = {},
		class: className = '',
	}: {
		text: string;
		context?: Record<string, any>;
		class?: string;
	} = $props();

	let segments = $derived(hasFx(text) ? parseFx(text, context) : null);
</script>

{#if segments}
	<span class={className}>{#each segments as seg}{#if seg.type === 'formula'}<span class="fx-value" title={seg.tooltip}>{seg.display}</span>{:else}{seg.display}{/if}{/each}</span>
{:else}
	<span class={className}>{text}</span>
{/if}

<style>
	.fx-value {
		display: inline;
		padding: 0 3px;
		border-radius: 3px;
		background: oklch(0.25 0.06 80 / 0.4);
		border: 1px solid oklch(0.35 0.08 80 / 0.3);
		color: oklch(0.82 0.10 80);
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 0.85em;
		cursor: help;
	}
</style>
