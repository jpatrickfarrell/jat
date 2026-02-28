<script lang="ts">
	import type { EnumConfig } from '$lib/types/dataTable';

	let {
		value = null,
		config = { options: [] },
		onSave,
	}: {
		value: any;
		config?: EnumConfig;
		onSave: (val: any) => void;
	} = $props();

	let editing = $state(false);

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
		if (val !== value) onSave(val);
	}

	function handleBlur() {
		// Small delay to allow click on option
		setTimeout(() => { editing = false; }, 150);
	}
</script>

{#if editing}
	<div class="enum-dropdown" tabindex="-1" onblur={handleBlur}>
		<select
			class="cell-edit-input"
			value={value ?? ''}
			onchange={(e) => select(e.currentTarget.value)}
			autofocus
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
