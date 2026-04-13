<!--
  MentionPicker.svelte — Bottom-sheet @-reference picker for mobile textareas.

  Thin wrapper around BottomSheet + ReferencePicker. Parent detects @ keystrokes
  in a textarea and opens this sheet; onselect returns the item to insert.

  Usage:
    <MentionPicker
      bind:open={mentionOpen}
      project={project}
      initialFilter={mentionQuery}
      onselect={(item) => insertAtCursor(item.value)}
    />
-->
<script lang="ts">
	import BottomSheet from './BottomSheet.svelte';
	import ReferencePicker from './ReferencePicker.svelte';

	interface ReferenceItem {
		type: 'file' | 'base' | 'command';
		value: string;
		label: string;
		meta: string;
	}

	let {
		open = $bindable(false),
		project = '',
		initialFilter = '',
		types = ['files', 'bases', 'commands'] as Array<'files' | 'bases' | 'commands'>,
		onselect = (_item: ReferenceItem) => {},
		onclose = () => {}
	}: {
		open?: boolean;
		project?: string;
		initialFilter?: string;
		types?: Array<'files' | 'bases' | 'commands'>;
		onselect?: (item: ReferenceItem) => void;
		onclose?: () => void;
	} = $props();

	function handleSelect(item: ReferenceItem) {
		onselect(item);
		open = false;
		onclose();
	}

	function handleCancel() {
		open = false;
		onclose();
	}
</script>

<BottomSheet bind:open title="Insert reference" onclose={handleCancel}>
	{#if open}
		<ReferencePicker
			{project}
			{types}
			{initialFilter}
			onselect={handleSelect}
			oncancel={handleCancel}
		/>
	{/if}
</BottomSheet>
