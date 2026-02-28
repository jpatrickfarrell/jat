<script lang="ts">
	import type { EnumOption } from '$lib/types/dataTable';

	let {
		options = [],
		onChange,
	}: {
		options: EnumOption[];
		onChange: (options: EnumOption[]) => void;
	} = $props();

	const DEFAULT_COLORS = [
		'oklch(0.65 0.18 200)',
		'oklch(0.65 0.18 145)',
		'oklch(0.70 0.15 85)',
		'oklch(0.65 0.18 25)',
		'oklch(0.60 0.18 280)',
		'oklch(0.70 0.15 50)',
		'oklch(0.55 0.15 250)',
		'oklch(0.60 0.12 330)',
	];

	function addOption() {
		const colorIndex = options.length % DEFAULT_COLORS.length;
		onChange([...options, { value: '', color: DEFAULT_COLORS[colorIndex] }]);
	}

	function removeOption(index: number) {
		onChange(options.filter((_, i) => i !== index));
	}

	function updateOption(index: number, field: keyof EnumOption, val: string) {
		const updated = options.map((opt, i) => {
			if (i !== index) return opt;
			return { ...opt, [field]: val };
		});
		onChange(updated);
	}
</script>

<div class="enum-editor">
	{#each options as opt, i}
		<div class="option-row">
			<input
				type="color"
				class="color-pick"
				value={opt.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
				oninput={(e) => updateOption(i, 'color', e.currentTarget.value)}
				title="Badge color"
			/>
			<input
				type="text"
				class="opt-value"
				value={opt.value}
				oninput={(e) => updateOption(i, 'value', e.currentTarget.value)}
				placeholder="value"
			/>
			<input
				type="text"
				class="opt-label"
				value={opt.label || ''}
				oninput={(e) => updateOption(i, 'label', e.currentTarget.value)}
				placeholder="label (optional)"
			/>
			<button class="btn-remove" onclick={() => removeOption(i)} title="Remove option">×</button>
		</div>
	{/each}
	<button class="btn-add" onclick={addOption}>+ Add Option</button>
</div>

<style>
	.enum-editor {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}
	.option-row {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}
	.color-pick {
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.25rem;
		cursor: pointer;
		background: none;
	}
	.opt-value {
		flex: 1;
		padding: 0.1875rem 0.375rem;
		font-size: 0.75rem;
		font-family: monospace;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.1875rem;
		color: oklch(0.85 0.02 250);
		outline: none;
	}
	.opt-label {
		flex: 1;
		padding: 0.1875rem 0.375rem;
		font-size: 0.75rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.1875rem;
		color: oklch(0.85 0.02 250);
		outline: none;
	}
	.opt-value:focus,
	.opt-label:focus {
		border-color: oklch(0.50 0.10 200);
	}
	.btn-remove {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		font-size: 0.875rem;
		background: none;
		border: none;
		color: oklch(0.45 0.02 250);
		cursor: pointer;
		border-radius: 0.1875rem;
	}
	.btn-remove:hover {
		color: oklch(0.70 0.15 25);
		background: oklch(0.25 0.05 25 / 0.2);
	}
	.btn-add {
		font-size: 0.6875rem;
		padding: 0.25rem 0.5rem;
		background: none;
		border: 1px dashed oklch(0.30 0.02 250);
		color: oklch(0.55 0.02 250);
		border-radius: 0.25rem;
		cursor: pointer;
		align-self: flex-start;
	}
	.btn-add:hover {
		border-color: oklch(0.50 0.10 200);
		color: oklch(0.70 0.10 200);
	}
</style>
