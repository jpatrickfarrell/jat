<script lang="ts">
	let {
		value = null,
		editing: editingProp = false,
		initialEditChar = null,
		onSave,
	}: {
		value: any;
		editing?: boolean;
		initialEditChar?: string | null;
		onSave: (val: any) => void;
	} = $props();

	let editing = $state(false);
	let editValue = $state('');

	// React to parent requesting edit mode
	$effect(() => {
		if (editingProp && !editing) startEdit();
	});

	function startEdit() {
		if (initialEditChar != null) {
			editValue = initialEditChar;
		} else {
			editValue = value === null ? '' : String(value);
		}
		editing = true;
	}

	function focusInput(node: HTMLInputElement) {
		node.focus();
	}

	function save() {
		editing = false;
		const newVal = editValue.trim() === '' ? null : editValue;
		onSave(newVal);
	}

	function cancel() {
		editing = false;
		onSave(value); // Signal parent to reset editingSelectedCell
	}
</script>

{#if editing}
	<input
		class="cell-edit-input"
		bind:value={editValue}
		onkeydown={(e) => {
			if (e.key === 'Enter') save();
			if (e.key === 'Escape') cancel();
		}}
		onblur={save}
		use:focusInput
	/>
{:else}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span
		class="cell-value"
		class:null-value={value === null}
		ondblclick={startEdit}
	>
		{value === null ? 'NULL' : value}
	</span>
{/if}
