<script lang="ts">
	import { SEMANTIC_TYPE_INFO } from '$lib/types/dataTable';
	import type { SemanticType } from '$lib/types/dataTable';

	let {
		value = 'text',
		onChange,
	}: {
		value: string;
		onChange: (type: SemanticType) => void;
	} = $props();

	const groups = $derived({
		basic: SEMANTIC_TYPE_INFO.filter(t => t.group === 'basic'),
		rich: SEMANTIC_TYPE_INFO.filter(t => t.group === 'rich'),
		advanced: SEMANTIC_TYPE_INFO.filter(t => t.group === 'advanced'),
	});
</script>

<select
	class="type-select"
	value={value}
	onchange={(e) => onChange(e.currentTarget.value as SemanticType)}
>
	<optgroup label="Basic">
		{#each groups.basic as info}
			<option value={info.type}>{info.icon} {info.label}</option>
		{/each}
	</optgroup>
	<optgroup label="Rich">
		{#each groups.rich as info}
			<option value={info.type}>{info.icon} {info.label}</option>
		{/each}
	</optgroup>
	<optgroup label="Advanced">
		{#each groups.advanced as info}
			<option value={info.type}>{info.icon} {info.label}</option>
		{/each}
	</optgroup>
</select>

<style>
	.type-select {
		padding: 0.25rem 0.375rem;
		font-size: 0.8125rem;
		background: oklch(0.20 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.80 0.02 250);
		outline: none;
		min-width: 7rem;
	}
	.type-select:focus {
		border-color: oklch(0.50 0.10 200);
	}
</style>
