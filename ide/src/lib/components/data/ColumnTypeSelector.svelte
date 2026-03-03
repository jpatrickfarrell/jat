<script lang="ts">
	import { SEMANTIC_TYPE_INFO } from '$lib/types/dataTable';
	import type { SemanticType } from '$lib/types/dataTable';
	import SearchDropdown from '$lib/components/SearchDropdown.svelte';

	let {
		value = 'text',
		onChange,
	}: {
		value: string;
		onChange: (type: SemanticType) => void;
	} = $props();

	const groups = $derived([
		{ label: 'Basic', options: SEMANTIC_TYPE_INFO.filter(t => t.group === 'basic').map(t => ({ value: t.type, label: t.label, icon: t.icon })) },
		{ label: 'Rich', options: SEMANTIC_TYPE_INFO.filter(t => t.group === 'rich').map(t => ({ value: t.type, label: t.label, icon: t.icon })) },
		{ label: 'Advanced', options: SEMANTIC_TYPE_INFO.filter(t => t.group === 'advanced').map(t => ({ value: t.type, label: t.label, icon: t.icon })) },
	]);
</script>

<div class="type-selector-wrap">
	<SearchDropdown
		{value}
		{groups}
		placeholder="Filter types..."
		onChange={(v) => onChange(v as SemanticType)}
	/>
</div>

<style>
	.type-selector-wrap {
		min-width: 7rem;
	}
</style>
