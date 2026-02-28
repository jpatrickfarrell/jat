<script lang="ts">
	import type { SemanticType, ColumnConfig } from '$lib/types/dataTable';
	import TextCell from './TextCell.svelte';
	import BooleanCell from './BooleanCell.svelte';
	import DateCell from './DateCell.svelte';
	import UrlCell from './UrlCell.svelte';
	import EmailCell from './EmailCell.svelte';
	import EnumCell from './EnumCell.svelte';
	import CurrencyCell from './CurrencyCell.svelte';
	import PercentageCell from './PercentageCell.svelte';

	let {
		value = null,
		semanticType,
		config = {},
		onSave,
	}: {
		value: any;
		semanticType?: SemanticType;
		config?: ColumnConfig;
		onSave: (val: any) => void;
	} = $props();

	// Type-safe config accessors (config is a union, narrow per-type)
	const typedConfig: any = $derived(config);
</script>

{#if semanticType === 'boolean'}
	<BooleanCell {value} {onSave} />
{:else if semanticType === 'date' || semanticType === 'datetime'}
	<DateCell {value} config={typedConfig} {onSave} />
{:else if semanticType === 'url'}
	<UrlCell {value} {onSave} />
{:else if semanticType === 'email'}
	<EmailCell {value} {onSave} />
{:else if semanticType === 'enum'}
	<EnumCell {value} config={typedConfig} {onSave} />
{:else if semanticType === 'currency'}
	<CurrencyCell {value} config={typedConfig} {onSave} />
{:else if semanticType === 'percentage'}
	<PercentageCell {value} config={typedConfig} {onSave} />
{:else}
	<TextCell {value} {onSave} />
{/if}
