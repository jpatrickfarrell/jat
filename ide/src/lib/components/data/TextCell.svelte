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

	function autoResize(node: HTMLTextAreaElement) {
		function resize() {
			node.style.height = 'auto';
			node.style.height = Math.min(node.scrollHeight, 200) + 'px';
		}
		node.focus();
		// Move cursor to end
		node.selectionStart = node.selectionEnd = node.value.length;
		resize();
		node.addEventListener('input', resize);
		return {
			destroy() {
				node.removeEventListener('input', resize);
			}
		};
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
	<textarea
		class="cell-edit-textarea"
		bind:value={editValue}
		onkeydown={(e) => {
			if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save(); }
			if (e.key === 'Escape') cancel();
		}}
		onblur={save}
		use:autoResize
		rows="1"
	></textarea>
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

<style>
	.cell-edit-textarea {
		width: 100%;
		padding: 0.125rem 0.25rem;
		font-size: 0.8125rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.50 0.10 200);
		border-radius: 0.1875rem;
		color: oklch(0.90 0.02 250);
		outline: none;
		resize: none;
		max-height: 200px;
		line-height: 1.4;
		font-family: inherit;
		display: block;
		box-sizing: border-box;
	}
</style>
