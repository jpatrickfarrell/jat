<script lang="ts">
	import type { DateConfig } from '$lib/types/dataTable';

	let {
		value = null,
		config = {},
		editing: editingProp = false,
		onSave,
	}: {
		value: any;
		config?: DateConfig;
		editing?: boolean;
		onSave: (val: any) => void;
	} = $props();

	let editing = $state(false);
	let editValue = $state('');

	$effect(() => {
		if (editingProp && !editing) startEdit();
	});

	const format = $derived(config?.format || 'short');

	const displayValue = $derived.by(() => {
		if (value === null || value === undefined || value === '') return null;
		try {
			const d = new Date(value);
			if (isNaN(d.getTime())) return String(value);
			switch (format) {
				case 'iso': return d.toISOString().split('T')[0];
				case 'long': return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
				case 'relative': {
					const now = Date.now();
					const diff = now - d.getTime();
					const days = Math.floor(diff / 86400000);
					if (days === 0) return 'Today';
					if (days === 1) return 'Yesterday';
					if (days < 7) return `${days}d ago`;
					return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
				}
				default: return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
			}
		} catch {
			return String(value);
		}
	});

	function startEdit() {
		// Format for <input type="date"> (YYYY-MM-DD)
		if (value) {
			try {
				const d = new Date(value);
				editValue = d.toISOString().split('T')[0];
			} catch {
				editValue = '';
			}
		} else {
			editValue = '';
		}
		editing = true;
	}

	function save() {
		editing = false;
		const newVal = editValue || null;
		onSave(newVal);
	}

	function cancel() {
		editing = false;
		onSave(value);
	}
</script>

{#if editing}
	<input
		type="date"
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
		class="cell-value date-value"
		class:null-value={displayValue === null}
		ondblclick={startEdit}
	>
		{displayValue ?? 'NULL'}
	</span>
{/if}

<style>
	.date-value {
		font-variant-numeric: tabular-nums;
	}
</style>
