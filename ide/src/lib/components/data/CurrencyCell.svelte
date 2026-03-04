<script lang="ts">
	import type { CurrencyConfig } from '$lib/types/dataTable';

	let {
		value = null,
		config = {},
		editing: editingProp = false,
		initialEditChar = null,
		onSave,
	}: {
		value: any;
		config?: CurrencyConfig;
		editing?: boolean;
		initialEditChar?: string | null;
		onSave: (val: any) => void;
	} = $props();

	let editing = $state(false);
	let editValue = $state('');

	$effect(() => {
		if (editingProp && !editing) startEdit();
	});

	const symbol = $derived(config?.symbol || '$');
	const decimals = $derived(config?.decimals ?? 2);
	const position = $derived(config?.position || 'before');

	const displayValue = $derived.by(() => {
		if (value === null || value === undefined) return null;
		const num = Number(value);
		if (isNaN(num)) return String(value);
		const formatted = num.toFixed(decimals);
		return position === 'before' ? `${symbol}${formatted}` : `${formatted}${symbol}`;
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
		if (editValue.trim() === '') {
			onSave(null);
			return;
		}
		const cleaned = editValue.replace(/[,$€£¥]/g, '').trim();
		const num = Number(cleaned);
		onSave(!isNaN(num) ? num : value);
	}

	function cancel() {
		editing = false;
		onSave(value);
	}
</script>

{#if editing}
	<input
		type="number"
		step="any"
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
		class="cell-value currency-value"
		class:null-value={displayValue === null}
		ondblclick={startEdit}
	>
		{displayValue ?? 'NULL'}
	</span>
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
	.currency-value {
		font-variant-numeric: tabular-nums;
		text-align: right;
	}
</style>
