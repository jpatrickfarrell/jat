<script lang="ts">
	/**
	 * ColorSwatchPicker — A compact swatch button that opens a dropdown color grid.
	 *
	 * Usage:
	 *   <ColorSwatchPicker
	 *     value={activeColor}
	 *     palette={COLOR_PALETTE}
	 *     onchange={(color) => activeColor = color}
	 *   />
	 */

	let {
		value = '',
		palette = [] as readonly string[],
		onchange = (_color: string) => {},
		label = '',
		allowCustom = true,
	}: {
		value: string;
		palette: readonly string[];
		onchange: (color: string) => void;
		label?: string;
		allowCustom?: boolean;
	} = $props();

	let open = $state(false);
	let pickerEl: HTMLDivElement | undefined = $state();

	function selectColor(color: string) {
		onchange(color);
		open = false;
	}

	function handleCustomInput(e: Event) {
		const val = (e.target as HTMLInputElement).value;
		onchange(val);
	}

	function handleClickOutside(e: MouseEvent) {
		if (pickerEl && !pickerEl.contains(e.target as Node)) {
			open = false;
		}
	}

	$effect(() => {
		if (open) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}
	});
</script>

<div class="csp-root" bind:this={pickerEl}>
	{#if label}
		<span class="csp-label">{label}</span>
	{/if}

	<!-- Swatch button -->
	<button
		type="button"
		class="csp-swatch"
		class:csp-swatch-empty={!value}
		style={value ? `background: ${value};` : ''}
		title={value || 'Choose color'}
		onclick={() => { open = !open; }}
	>
		{#if !value}
			<svg class="w-4 h-4" style="color: oklch(0.50 0.02 250);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
		{/if}
	</button>

	<!-- Dropdown grid -->
	{#if open}
		<div class="csp-dropdown">
			<div class="csp-grid">
				{#each palette as color}
					<button
						type="button"
						class="csp-cell"
						class:csp-cell-selected={value === color}
						style="background: {color};"
						title={color}
						onclick={() => selectColor(color)}
					></button>
				{/each}
			</div>

			{#if allowCustom}
				<div class="csp-custom">
					<input
						type="color"
						class="csp-native-picker"
						value={value || '#5588ff'}
						oninput={handleCustomInput}
					/>
					<input
						type="text"
						class="csp-text-input"
						placeholder="#5588ff"
						value={value}
						oninput={handleCustomInput}
					/>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.csp-root {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.csp-label {
		font-size: 0.75rem;
		font-family: ui-monospace, monospace;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(0.60 0.02 250);
	}

	.csp-swatch {
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		border: 2px solid oklch(0.35 0.02 250);
		cursor: pointer;
		transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}

	.csp-swatch:hover {
		transform: scale(1.1);
		border-color: oklch(0.55 0.02 250);
	}

	.csp-swatch-empty {
		border-style: dashed;
		background: oklch(0.18 0.01 250);
	}

	.csp-dropdown {
		position: absolute;
		top: calc(100% + 0.375rem);
		left: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.625rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.5rem;
		z-index: 50;
		box-shadow: 0 8px 24px oklch(0 0 0 / 0.4);
		animation: csp-appear 0.12s ease-out;
	}

	.csp-grid {
		display: grid;
		grid-template-columns: repeat(6, 1.5rem);
		gap: 3px;
	}

	.csp-cell {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.25rem;
		border: 2px solid transparent;
		cursor: pointer;
		padding: 0;
		transition: transform 0.1s;
	}

	.csp-cell:hover {
		transform: scale(1.2);
		border-color: oklch(0.70 0.02 250);
		z-index: 1;
	}

	.csp-cell-selected {
		border-color: oklch(0.95 0.02 250);
		box-shadow: 0 0 0 1px oklch(0.15 0.01 250);
	}

	.csp-custom {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		border-top: 1px solid oklch(0.25 0.02 250);
		padding-top: 0.5rem;
	}

	.csp-native-picker {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 0.25rem;
		cursor: pointer;
		border: 1px solid oklch(0.35 0.02 250);
		padding: 0;
	}

	.csp-text-input {
		flex: 1;
		min-width: 0;
		font-size: 0.6875rem;
		font-family: ui-monospace, monospace;
		padding: 0.25rem 0.375rem;
		border-radius: 0.25rem;
		border: 1px solid oklch(0.30 0.02 250);
		background: oklch(0.18 0.01 250);
		color: oklch(0.85 0.02 250);
		outline: none;
	}

	.csp-text-input:focus {
		border-color: oklch(0.50 0.15 240);
	}

	@keyframes csp-appear {
		from {
			opacity: 0;
			transform: translateY(-4px) scale(0.96);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
</style>
