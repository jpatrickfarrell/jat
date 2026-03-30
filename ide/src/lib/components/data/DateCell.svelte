<script lang="ts">
	import type { DateConfig, SemanticType } from '$lib/types/dataTable';

	let {
		value = null,
		config = {},
		editing: editingProp = false,
		onSave,
		semanticType = 'date' as SemanticType,
	}: {
		value: any;
		config?: DateConfig;
		editing?: boolean;
		onSave: (val: any) => void;
		semanticType?: SemanticType;
	} = $props();

	let editing = $state(false);
	let editValue = $state('');

	const isDatetime = $derived(semanticType === 'datetime');

	$effect(() => {
		if (editingProp && !editing) startEdit();
	});

	const format = $derived(config?.format || 'short');

	const displayValue = $derived.by(() => {
		if (value === null || value === undefined || value === '') return null;
		try {
			const d = new Date(value);
			if (isNaN(d.getTime())) return String(value);

			if (isDatetime) {
				switch (format) {
					case 'iso': return d.toISOString();
					case 'long': return d.toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
					case 'relative': {
						const now = Date.now();
						const diff = now - d.getTime();
						const days = Math.floor(diff / 86400000);
						if (days === 0) {
							return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
						}
						if (days === 1) return 'Yesterday ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
						if (days < 7) return `${days}d ago`;
						return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
					}
					default: return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
				}
			}

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
		if (value) {
			try {
				const d = new Date(value);
				if (isDatetime) {
					// Format for <input type="datetime-local"> (YYYY-MM-DDTHH:mm)
					const year = d.getFullYear();
					const month = String(d.getMonth() + 1).padStart(2, '0');
					const day = String(d.getDate()).padStart(2, '0');
					const hours = String(d.getHours()).padStart(2, '0');
					const minutes = String(d.getMinutes()).padStart(2, '0');
					editValue = `${year}-${month}-${day}T${hours}:${minutes}`;
				} else {
					// Format for <input type="date"> (YYYY-MM-DD)
					editValue = d.toISOString().split('T')[0];
				}
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

	function focusInput(node: HTMLInputElement) {
		node.focus();
	}
</script>

{#if editing}
	{#if isDatetime}
		<input
			type="datetime-local"
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
		<input
			type="date"
			class="cell-edit-input"
			bind:value={editValue}
			onkeydown={(e) => {
				if (e.key === 'Enter') save();
				if (e.key === 'Escape') cancel();
			}}
			onblur={save}
			use:focusInput
		/>
	{/if}
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
	.date-value {
		font-variant-numeric: tabular-nums;
	}
</style>
