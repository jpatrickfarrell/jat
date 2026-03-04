<script lang="ts">
	import type { EnumConfig } from '$lib/types/dataTable';

	let {
		value = null,
		config = { options: [] },
		editing: editingProp = false,
		onSave,
	}: {
		value: any;
		config?: EnumConfig;
		editing?: boolean;
		onSave: (val: any) => void;
	} = $props();

	let editing = $state(false);

	$effect(() => {
		if (editingProp && !editing) startEdit();
	});

	const options = $derived(config?.options || []);

	const matchedOption = $derived(
		options.find(o => o.value === value)
	);

	const badgeColor = $derived(matchedOption?.color || 'oklch(0.55 0.03 250)');

	function startEdit() {
		editing = true;
	}

	function select(val: string) {
		editing = false;
		onSave(val);
	}

	function handleBlur() {
		// Small delay to allow click on option
		setTimeout(() => {
			editing = false;
			onSave(value); // Signal parent to reset editingSelectedCell
		}, 150);
	}

	function focusInput(node: HTMLSelectElement) {
		node.focus();
	}
</script>

{#if editing}
	<div class="enum-dropdown" tabindex="-1" onblur={handleBlur}>
		<select
			class="cell-edit-input"
			value={value ?? ''}
			onchange={(e) => select(e.currentTarget.value)}
			use:focusInput
		>
			<option value="">— none —</option>
			{#each options as opt}
				<option value={opt.value}>{opt.label || opt.value}</option>
			{/each}
			{#if config?.allowCustom && value && !matchedOption}
				<option value={value}>{value} (custom)</option>
			{/if}
		</select>
	</div>
{:else if value !== null && value !== undefined && value !== ''}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span
		class="enum-badge"
		style="background: {badgeColor}; color: oklch(0.95 0.01 250);"
		ondblclick={startEdit}
	>
		{matchedOption?.label || value}
	</span>
{:else}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span class="cell-value null-value" ondblclick={startEdit}>NULL</span>
{/if}

<style>
	.cell-edit-input {
		width: 100%;
		padding: 0.125rem 0.25rem;
		font-size: 0.8125rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.50 0.10 200);
		border-radius: 0.1875rem;
		color: oklch(0.90 0.02 250);
		outline: none;
		box-sizing: border-box;
	}
	.enum-badge {
		display: inline-block;
		padding: 0.0625rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		white-space: nowrap;
	}
	.enum-dropdown {
		width: 100%;
	}
</style>
