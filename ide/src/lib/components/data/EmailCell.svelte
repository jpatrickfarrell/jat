<script lang="ts">
	let {
		value = null,
		onSave,
	}: {
		value: any;
		onSave: (val: any) => void;
	} = $props();

	let editing = $state(false);
	let editValue = $state('');

	function startEdit() {
		editValue = value === null ? '' : String(value);
		editing = true;
	}

	function save() {
		editing = false;
		const newVal = editValue.trim() === '' ? null : editValue.trim();
		if (newVal !== value) onSave(newVal);
	}

	function cancel() {
		editing = false;
	}
</script>

{#if editing}
	<input
		type="email"
		class="cell-edit-input"
		bind:value={editValue}
		placeholder="user@example.com"
		onkeydown={(e) => {
			if (e.key === 'Enter') save();
			if (e.key === 'Escape') cancel();
		}}
		onblur={save}
		autofocus
	/>
{:else if value}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span class="email-cell" ondblclick={startEdit}>
		<a href="mailto:{value}" class="email-link">{value}</a>
	</span>
{:else}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span class="cell-value null-value" ondblclick={startEdit}>NULL</span>
{/if}

<style>
	.email-cell {
		min-width: 0;
	}
	.email-link {
		color: oklch(0.70 0.15 230);
		text-decoration: none;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.email-link:hover {
		text-decoration: underline;
	}
</style>
