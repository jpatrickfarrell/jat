<script lang="ts">
	import type { ControlBlock } from '$lib/types/canvas';
	import CanvasSelectControl from './CanvasSelectControl.svelte';
	import CanvasSliderControl from './CanvasSliderControl.svelte';
	import CanvasDateControl from './CanvasDateControl.svelte';
	import CanvasTextInputControl from './CanvasTextInputControl.svelte';
	import CanvasCheckboxControl from './CanvasCheckboxControl.svelte';

	let {
		block,
		project = null,
		existingNames = [],
		onBlockUpdate = () => {},
		onControlChange = () => {},
	}: {
		block: ControlBlock;
		project?: string | null;
		existingNames?: string[];
		onBlockUpdate?: (updated: ControlBlock) => void;
		onControlChange?: (controlName: string, value: unknown) => void;
	} = $props();
</script>

{#if block.controlType === 'select'}
	<CanvasSelectControl
		{block}
		{project}
		{existingNames}
		{onBlockUpdate}
		{onControlChange}
	/>
{:else if block.controlType === 'slider'}
	<CanvasSliderControl
		{block}
		{existingNames}
		{onBlockUpdate}
		{onControlChange}
	/>
{:else if block.controlType === 'date'}
	<CanvasDateControl
		{block}
		{existingNames}
		{onBlockUpdate}
		{onControlChange}
	/>
{:else if block.controlType === 'text_input'}
	<CanvasTextInputControl
		{block}
		{existingNames}
		{onBlockUpdate}
		{onControlChange}
	/>
{:else if block.controlType === 'checkbox'}
	<CanvasCheckboxControl
		{block}
		{existingNames}
		{onBlockUpdate}
		{onControlChange}
	/>
{:else}
	<div class="text-xs" style="color: oklch(0.60 0.15 30);">Unknown control type: {block.controlType}</div>
{/if}
