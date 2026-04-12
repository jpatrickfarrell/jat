<script lang="ts">
	interface Props {
		value: string;
		label: string;
		id: string;
		placeholder?: string;
		palette?: string[];
		error?: string | null;
		touched?: boolean;
		onValidate?: (value: string) => void;
	}

	const DEFAULT_PALETTE = [
		'oklch(0.70 0.18 220)', // Blue
		'oklch(0.75 0.18 160)', // Cyan
		'oklch(0.65 0.20 30)',  // Red
		'oklch(0.80 0.18 90)',  // Yellow
		'oklch(0.70 0.18 145)', // Green
		'oklch(0.65 0.18 280)', // Purple
		'oklch(0.75 0.18 60)',  // Orange
		'oklch(0.70 0.18 200)', // Sky blue
		'oklch(0.60 0.18 300)', // Violet
		'oklch(0.55 0.25 25)',  // Dark red
		'oklch(0.80 0.20 150)', // Mint green
		'oklch(0.75 0.12 220)', // Light blue
		'oklch(0.70 0.22 15)',  // Bright red
		'oklch(0.75 0.20 120)', // Lime
		'oklch(0.85 0.18 85)'   // Bright yellow
	];

	let {
		value = $bindable(''),
		label,
		id,
		placeholder = 'oklch(0.7 0.15 150)',
		palette = DEFAULT_PALETTE,
		error = null,
		touched = false,
		onValidate
	}: Props = $props();

	let editing = $state(false);

	let hasValue = $derived(value.trim().length > 0);

	function handleSelect(color: string) {
		value = color;
		onValidate?.(color);
	}

	function handleClear() {
		value = '';
		editing = false;
		onValidate?.('');
	}
</script>

<div class="form-control">
	<label class="label" for={id}>
		<span class="label-text">{label}</span>
	</label>
	<div class="flex gap-2 items-start">
		<div class="relative">
			{#if editing}
				<div class="absolute top-0 left-0 z-50 p-3 rounded-lg shadow-xl bg-base-200 border border-base-content/25 w-64">
					<div class="grid grid-cols-5 gap-1.5 mb-3">
						{#each palette as color}
							<button
								type="button"
								class="w-8 h-8 rounded-full transition-transform hover:scale-110 {value === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-200' : ''}"
								style="background: {color};"
								onclick={() => handleSelect(color)}
								title={color}
							></button>
						{/each}
					</div>
					<div class="flex items-center gap-2 mb-3">
						<input
							type="color"
							class="w-8 h-8 rounded cursor-pointer border-0 p-0"
							value={value.startsWith('#') ? value : '#6688cc'}
							oninput={(e) => handleSelect(e.currentTarget.value)}
						/>
						<input
							type="text"
							class="flex-1 px-2 py-1.5 rounded font-mono text-xs bg-base-300 border border-base-content/20 text-base-content/90"
							class:border-error={touched && error}
							bind:value
							{placeholder}
							onblur={() => onValidate?.(value)}
						/>
					</div>
					<div class="flex justify-between">
						{#if hasValue}
							<button
								type="button"
								class="btn btn-xs btn-ghost text-error"
								onclick={handleClear}
							>
								Clear
							</button>
						{:else}
							<div></div>
						{/if}
						<button
							type="button"
							class="btn btn-xs btn-ghost"
							onclick={() => editing = false}
						>
							Done
						</button>
					</div>
				</div>
			{/if}
			<button
				type="button"
				class="w-10 h-10 rounded-lg transition-all hover:scale-105 border-2 {editing ? 'border-primary ring-2 ring-primary/30' : 'border-base-content/20 hover:border-base-content/40'}"
				class:border-dashed={!hasValue}
				style="background: {hasValue ? value : 'transparent'};"
				onclick={() => editing = !editing}
				title={hasValue ? 'Click to change color' : 'Click to set color'}
			></button>
		</div>
		<div class="flex-1">
			<input
				{id}
				type="text"
				class="input input-bordered w-full font-mono text-sm"
				class:input-error={touched && error}
				{placeholder}
				bind:value
				onblur={() => onValidate?.(value)}
			/>
			{#if touched && error}
				<div class="label py-1">
					<span class="label-text-alt text-error">{error}</span>
				</div>
			{/if}
		</div>
	</div>
</div>
