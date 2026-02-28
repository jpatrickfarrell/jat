<script lang="ts">
	let {
		value = null,
		onSave,
	}: {
		value: any;
		onSave: (val: any) => void;
	} = $props();

	const checked = $derived(value === 1 || value === true || value === 'true' || value === '1');

	function toggle() {
		onSave(checked ? 0 : 1);
	}
</script>

<label class="bool-cell">
	<input
		type="checkbox"
		class="checkbox checkbox-sm checkbox-primary"
		checked={checked}
		onchange={toggle}
	/>
</label>

<style>
	.bool-cell {
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		padding: 0.125rem;
	}
</style>
