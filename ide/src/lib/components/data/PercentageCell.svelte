<script lang="ts">
	import type { PercentageConfig } from '$lib/types/dataTable';

	let {
		value = null,
		config = {},
		editing: editingProp = false,
		onSave,
	}: {
		value: any;
		config?: PercentageConfig;
		editing?: boolean;
		onSave: (val: any) => void;
	} = $props();

	let editing = $state(false);
	let editValue = $state('');

	$effect(() => {
		if (editingProp && !editing) startEdit();
	});

	const decimals = $derived(config?.decimals ?? 0);
	const showBar = $derived(config?.showBar ?? false);

	const numValue = $derived.by(() => {
		if (value === null || value === undefined) return null;
		const num = Number(value);
		return isNaN(num) ? null : num;
	});

	const displayValue = $derived(
		numValue !== null ? `${numValue.toFixed(decimals)}%` : null
	);

	const barWidth = $derived(
		numValue !== null ? Math.max(0, Math.min(100, numValue)) : 0
	);

	function startEdit() {
		editValue = value === null ? '' : String(value);
		editing = true;
	}

	function save() {
		editing = false;
		if (editValue.trim() === '') {
			onSave(null);
			return;
		}
		const cleaned = editValue.replace(/%/g, '').trim();
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
		autofocus
	/>
{:else}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span
		class="cell-value pct-cell"
		class:null-value={displayValue === null}
		ondblclick={startEdit}
	>
		{#if showBar && numValue !== null}
			<span class="pct-bar-container">
				<span class="pct-bar" style="width: {barWidth}%"></span>
			</span>
		{/if}
		<span class="pct-text">{displayValue ?? 'NULL'}</span>
	</span>
{/if}

<style>
	.pct-cell {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-variant-numeric: tabular-nums;
	}
	.pct-text {
		white-space: nowrap;
	}
	.pct-bar-container {
		flex: 1;
		height: 0.375rem;
		background: oklch(0.25 0.01 250);
		border-radius: 0.125rem;
		overflow: hidden;
		min-width: 2rem;
	}
	.pct-bar {
		display: block;
		height: 100%;
		background: oklch(0.65 0.18 200);
		border-radius: 0.125rem;
		transition: width 0.2s ease;
	}
</style>
