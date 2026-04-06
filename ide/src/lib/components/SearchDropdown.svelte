<script module lang="ts">
	export type SearchDropdownOption = {
		value: string;
		label: string;
		icon?: string;
	};

	export type SearchDropdownGroup = {
		label: string;
		options: SearchDropdownOption[];
	};
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import { slide } from 'svelte/transition';

	import type { Snippet } from 'svelte';

	let {
		value = '',
		groups = [],
		placeholder = 'Filter...',
		disabled = false,
		displayValue,
		colorFn,
		footer,
		variant = 'default',
		size = 'md',
		onChange,
	}: {
		value: string;
		groups: SearchDropdownGroup[];
		placeholder?: string;
		disabled?: boolean;
		displayValue?: string;
		colorFn?: (value: string) => string | undefined;
		footer?: Snippet;
		/** 'chip' renders a compact TopBar-style pill instead of the full-width trigger */
		variant?: 'default' | 'chip';
		/** 'sm' renders a smaller trigger matching text-[11px] compact UIs */
		size?: 'sm' | 'md';
		onChange: (value: string) => void;
	} = $props();

	let open = $state(false);
	let searchQuery = $state('');
	let searchInput: HTMLInputElement | undefined;
	let containerRef: HTMLDivElement | undefined;

	// Find the currently selected option across all groups
	const selectedOption = $derived.by(() => {
		for (const group of groups) {
			const found = group.options.find(o => o.value === value);
			if (found) return found;
		}
		return null;
	});

	const triggerLabel = $derived(displayValue || selectedOption?.label || value || placeholder);
	const triggerIcon = $derived(selectedOption?.icon || '');
	const activeColor = $derived(colorFn ? colorFn(value) : undefined);

	const filteredGroups = $derived.by(() => {
		if (!searchQuery.trim()) return groups;
		const q = searchQuery.toLowerCase();
		const result: SearchDropdownGroup[] = [];
		for (const group of groups) {
			const filtered = group.options.filter(o =>
				o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q) || (o.icon && o.icon.toLowerCase().includes(q))
			);
			if (filtered.length > 0) result.push({ label: group.label, options: filtered });
		}
		return result;
	});

	function select(optionValue: string) {
		open = false;
		searchQuery = '';
		onChange(optionValue);
	}

	function handleClickOutside(e: MouseEvent) {
		if (containerRef && !containerRef.contains(e.target as Node)) {
			open = false;
			searchQuery = '';
		}
	}

	$effect(() => {
		if (open) {
			document.addEventListener('mousedown', handleClickOutside);
			tick().then(() => searchInput?.focus());
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}
	});
</script>

<div class="search-dropdown" class:sd-chip-wrap={variant === 'chip'} bind:this={containerRef}>
	<button
		type="button"
		class="sd-trigger"
		class:sd-disabled={disabled}
		class:sd-chip={variant === 'chip'}
		class:sd-sm={size === 'sm'}
		style={activeColor
			? variant === 'chip'
				? `--sd-color: ${activeColor};`
				: `border-left-color: ${activeColor}; border-left-width: 3px; color: ${activeColor};`
			: ''}
		onclick={() => { if (!disabled) open = !open; }}
		{disabled}
	>
		<span class="sd-trigger-label">
			{#if triggerIcon}<span class="sd-trigger-icon">{triggerIcon}</span>{/if}
			<span class="truncate">{triggerLabel}</span>
		</span>
		<svg class="sd-chevron" class:sd-chevron-open={open} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if open}
		<div
			class="sd-panel"
			class:sd-panel-sm={size === 'sm'}
			transition:slide={{ duration: 120 }}
		>
			<!-- Search input -->
			<div class="sd-search">
				<div class="sd-search-inner">
					<svg class="sd-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
					</svg>
					<input
						bind:this={searchInput}
						bind:value={searchQuery}
						onkeydown={(e) => {
							if (e.key === 'Escape') { e.stopPropagation(); open = false; searchQuery = ''; }
						}}
						type="text"
						{placeholder}
						class="sd-search-input"
						autocomplete="off"
					/>
					{#if searchQuery}
						<button type="button" onclick={() => { searchQuery = ''; searchInput?.focus(); }} class="sd-search-clear">
							<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
						</button>
					{/if}
				</div>
			</div>

			<!-- Options list -->
			<ul class="sd-list">
				{#if filteredGroups.length > 0}
					{#each filteredGroups as group}
						<li class="sd-group-label">
							<span>{group.label}</span>
						</li>
						{#each group.options as option}
							<li>
								<button
									type="button"
									onclick={() => select(option.value)}
									class="sd-option"
									class:sd-option-selected={value === option.value}
									style={colorFn && colorFn(option.value)
										? variant === 'chip'
											? `--sd-color: ${colorFn(option.value)};`
											: `border-left-color: ${colorFn(option.value)}; color: ${colorFn(option.value)};`
										: ''}
								>
									{#if option.icon}<span class="sd-option-icon">{option.icon}</span>{/if}
									{#if variant === 'chip' && colorFn && colorFn(option.value)}
										<span class="sd-option-chip">{option.label}</span>
									{:else}
										<span class="truncate">{option.label}</span>
									{/if}
									{#if value === option.value}
										<svg class="sd-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
									{/if}
								</button>
							</li>
						{/each}
					{/each}
				{:else}
					<li class="sd-empty">No matches for "{searchQuery}"</li>
				{/if}
			</ul>
			{#if footer}
				<div class="sd-footer">
					{@render footer()}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.search-dropdown {
		position: relative;
	}

	/* Trigger button */
	.sd-trigger {
		width: 100%;
		padding: 0.25rem 0.5rem;
		border-radius: 0.5rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.8125rem;
		text-align: left;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.375rem;
		transition: background 0.15s, border-color 0.15s;
		min-height: 2rem;
		cursor: pointer;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		color: oklch(0.85 0.02 250);
	}
	.sd-trigger:hover:not(:disabled) {
		background: oklch(0.18 0.01 250);
		border-color: oklch(0.30 0.02 250);
	}
	.sd-trigger:disabled, .sd-disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Small size variant — matches DaisyUI select-sm / input-sm */
	.sd-sm {
		font-size: 0.75rem;
		min-height: 2rem;
		padding: 0 0.75rem;
		border-radius: var(--rounded-btn, 0.5rem);
		background: var(--b2, oklch(0.16 0.01 250));
		border: 1px solid oklch(from var(--bc, oklch(0.85 0.02 250)) l c h / 0.3);
		color: var(--bc, oklch(0.85 0.02 250));
	}
	.sd-sm .sd-chevron {
		width: 0.625rem;
		height: 0.625rem;
	}
	.sd-panel-sm {
		font-size: 0.75rem;
	}
	.sd-panel-sm .sd-search {
		padding: 0.25rem 0.5rem;
	}
	.sd-panel-sm .sd-search-input {
		font-size: 0.75rem;
	}
	.sd-panel-sm .sd-option {
		padding: 0.375rem 0.625rem;
		font-size: 0.75rem;
	}
	.sd-panel-sm .sd-group-label {
		font-size: 0.625rem;
		padding: 0.25rem 0.625rem 0.125rem;
	}

	/* Chip variant — TopBar fav-chip style: full border, color-tinted background */
	.sd-chip-wrap {
		display: inline-flex;
	}
	.sd-chip {
		width: auto;
		min-height: 1.5rem;
		padding: 0.15rem 0.4rem;
		border-radius: 0.375rem;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		background: transparent;
		border: 1px solid color-mix(in oklch, var(--sd-color, oklch(0.5 0 0)) 35%, transparent);
		color: color-mix(in oklch, var(--sd-color, oklch(0.7 0 0)) 85%, oklch(0.80 0 0));
		transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, color 0.15s;
	}
	.sd-chip:hover:not(:disabled) {
		background: color-mix(in oklch, var(--sd-color, oklch(0.5 0 0)) 15%, transparent);
		border-color: color-mix(in oklch, var(--sd-color, oklch(0.5 0 0)) 50%, transparent);
		color: var(--sd-color, oklch(0.80 0 0));
		box-shadow: 0 0 6px color-mix(in oklch, var(--sd-color, oklch(0.5 0 0)) 15%, transparent);
	}

	.sd-trigger-label {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		min-width: 0;
	}
	.sd-trigger-icon {
		flex-shrink: 0;
		font-size: 0.75rem;
	}

	.sd-chevron {
		width: 0.75rem;
		height: 0.75rem;
		flex-shrink: 0;
		transition: transform 0.15s;
		color: oklch(0.50 0.02 250);
	}
	.sd-chevron-open {
		transform: rotate(180deg);
	}

	/* Dropdown panel */
	.sd-panel {
		position: absolute;
		z-index: 50;
		margin-top: 0.25rem;
		width: 100%;
		min-width: 12rem;
		border-radius: 0.5rem;
		overflow: hidden;
		box-shadow: 0 4px 24px oklch(0 0 0 / 0.4);
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
	}

	/* Search section */
	.sd-search {
		padding: 0.375rem 0.625rem;
		border-bottom: 1px solid oklch(0.22 0.02 250);
	}
	.sd-search-inner {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}
	.sd-search-icon {
		width: 0.75rem;
		height: 0.75rem;
		flex-shrink: 0;
		color: oklch(0.45 0.02 250);
	}
	.sd-search-input {
		width: 100%;
		background: transparent;
		font-size: 0.625rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		color: oklch(0.75 0.02 250);
		border: none;
		outline: none;
	}
	.sd-search-input::placeholder {
		color: oklch(0.40 0.02 250);
	}
	.sd-search-clear {
		color: oklch(0.40 0.02 250);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		display: flex;
	}
	.sd-search-clear:hover {
		opacity: 0.8;
	}

	/* Options list */
	.sd-list {
		padding: 0.125rem 0;
		max-height: 280px;
		overflow-y: auto;
		list-style: none;
		margin: 0;
	}

	.sd-group-label {
		padding: 0.375rem 0.75rem 0.125rem;
	}
	.sd-group-label span {
		font-size: 0.5625rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(0.50 0.10 250);
	}

	.sd-option {
		width: 100%;
		padding: 0.375rem 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-align: left;
		font-size: 0.6875rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		transition: background 0.1s;
		cursor: pointer;
		background: transparent;
		border: none;
		border-left: 2px solid transparent;
		color: oklch(0.80 0.02 250);
	}
	.sd-option:hover {
		background: oklch(0.19 0.01 250);
	}
	.sd-option-selected {
		background: oklch(0.20 0.02 250);
		border-left-color: oklch(0.65 0.15 250);
	}

	/* Chip variant — options render as inline chip pills */
	.sd-chip-wrap .sd-option {
		border-left: none;
		padding: 0.25rem 0.625rem;
	}
	.sd-chip-wrap .sd-option-selected {
		background: oklch(0.19 0.01 250);
		border-left: none;
	}
	.sd-option-chip {
		display: inline-flex;
		align-items: center;
		padding: 0.1rem 0.45rem;
		border-radius: 0.3rem;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		border: 1px solid color-mix(in oklch, var(--sd-color, oklch(0.5 0 0)) 35%, transparent);
		color: color-mix(in oklch, var(--sd-color, oklch(0.7 0 0)) 85%, oklch(0.80 0 0));
		background: transparent;
		transition: background 0.1s, border-color 0.1s, color 0.1s;
	}
	.sd-chip-wrap .sd-option:hover .sd-option-chip {
		background: color-mix(in oklch, var(--sd-color, oklch(0.5 0 0)) 12%, transparent);
		border-color: color-mix(in oklch, var(--sd-color, oklch(0.5 0 0)) 50%, transparent);
		color: var(--sd-color, oklch(0.80 0 0));
	}
	.sd-chip-wrap .sd-option-selected .sd-option-chip {
		background: color-mix(in oklch, var(--sd-color, oklch(0.5 0 0)) 15%, transparent);
		border-color: color-mix(in oklch, var(--sd-color, oklch(0.5 0 0)) 50%, transparent);
		color: var(--sd-color, oklch(0.80 0 0));
	}

	.sd-option-icon {
		flex-shrink: 0;
		width: 1.25rem;
		text-align: center;
		font-size: 0.75rem;
	}

	.sd-check {
		width: 0.75rem;
		height: 0.75rem;
		flex-shrink: 0;
		margin-left: auto;
		color: oklch(0.70 0.15 145);
	}

	.sd-footer {
		border-top: 1px solid oklch(0.22 0.02 250);
	}

	.sd-empty {
		padding: 0.75rem;
		text-align: center;
		font-size: 0.625rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		color: oklch(0.45 0.02 250);
	}
</style>
