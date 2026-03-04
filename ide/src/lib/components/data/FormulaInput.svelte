<script lang="ts">
	/**
	 * FormulaInput - Chip-based formula editor with column autocomplete.
	 *
	 * Composes ChipInput with `{` trigger for column references (rendered as
	 * colored chips) and function autocomplete from the formula catalog.
	 */
	import ChipInput from '$lib/components/shared/ChipInput.svelte';
	import type { ChipSuggestion, SuggestionGroup, ChipInfo } from '$lib/components/shared/ChipInput.svelte';
	import { FORMULA_CATALOG, type FormulaEntry } from '$lib/config/formulaCatalog';

	// --- Types ---
	export interface ColumnInfo {
		name: string;
		type?: string;
	}

	// --- Props ---
	let {
		value = $bindable(''),
		columns = [],
		oninput,
		placeholder = '',
		invalid = false,
	}: {
		value: string;
		columns: ColumnInfo[] | string[];
		oninput?: (e: Event) => void;
		placeholder?: string;
		invalid?: boolean;
	} = $props();

	// Normalize columns to ColumnInfo[]
	let normalizedColumns = $derived<ColumnInfo[]>(
		columns.map(c => typeof c === 'string' ? { name: c, type: 'text' } : c)
	);

	// Selected suggestion for detail panel
	let detailEntry = $state<FormulaEntry | null>(null);
	let detailColumn = $state<ColumnInfo | null>(null);

	let chipInputRef: { focus: () => void; clear: () => void; setText: (t: string) => void; getElement: () => HTMLDivElement | null } | undefined = $state();

	// --- Color mapping for column types ---
	const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
		number:     { bg: 'oklch(0.25 0.08 240 / 0.4)', border: 'oklch(0.40 0.12 240 / 0.5)', text: 'oklch(0.80 0.10 240)' },
		currency:   { bg: 'oklch(0.25 0.08 240 / 0.4)', border: 'oklch(0.40 0.12 240 / 0.5)', text: 'oklch(0.80 0.10 240)' },
		percentage: { bg: 'oklch(0.25 0.08 240 / 0.4)', border: 'oklch(0.40 0.12 240 / 0.5)', text: 'oklch(0.80 0.10 240)' },
		text:       { bg: 'oklch(0.25 0.08 145 / 0.4)', border: 'oklch(0.40 0.12 145 / 0.5)', text: 'oklch(0.80 0.10 145)' },
		enum:       { bg: 'oklch(0.25 0.08 145 / 0.4)', border: 'oklch(0.40 0.12 145 / 0.5)', text: 'oklch(0.80 0.10 145)' },
		email:      { bg: 'oklch(0.25 0.08 145 / 0.4)', border: 'oklch(0.40 0.12 145 / 0.5)', text: 'oklch(0.80 0.10 145)' },
		url:        { bg: 'oklch(0.25 0.08 145 / 0.4)', border: 'oklch(0.40 0.12 145 / 0.5)', text: 'oklch(0.80 0.10 145)' },
		date:       { bg: 'oklch(0.25 0.08 300 / 0.4)', border: 'oklch(0.40 0.12 300 / 0.5)', text: 'oklch(0.80 0.10 300)' },
		datetime:   { bg: 'oklch(0.25 0.08 300 / 0.4)', border: 'oklch(0.40 0.12 300 / 0.5)', text: 'oklch(0.80 0.10 300)' },
		boolean:    { bg: 'oklch(0.25 0.08 60 / 0.4)',  border: 'oklch(0.40 0.12 60 / 0.5)',  text: 'oklch(0.80 0.10 60)' },
		formula:    { bg: 'oklch(0.25 0.08 80 / 0.4)',  border: 'oklch(0.40 0.12 80 / 0.5)',  text: 'oklch(0.80 0.10 80)' },
		relation:   { bg: 'oklch(0.25 0.08 200 / 0.4)', border: 'oklch(0.40 0.12 200 / 0.5)', text: 'oklch(0.80 0.10 200)' },
	};

	const DEFAULT_COLORS = { bg: 'oklch(0.25 0.06 200 / 0.4)', border: 'oklch(0.35 0.08 200 / 0.4)', text: 'oklch(0.80 0.10 200)' };

	function getTypeColors(type?: string) {
		return TYPE_COLORS[type || 'text'] || DEFAULT_COLORS;
	}

	// --- Autocomplete logic ---
	function scoreMatch(name: string, partial: string): number {
		if (!partial) return 50;
		const lower = name.toLowerCase();
		const p = partial.toLowerCase();
		if (lower === p) return 100;
		if (lower.startsWith(p)) return 80;
		if (lower.includes(p)) return 40;
		return 0;
	}

	function handleTrigger(query: string, beforeCursor: string): SuggestionGroup[] | null {
		// Detect context: are we inside {} for column ref, or typing a function name?
		const lastBrace = beforeCursor.lastIndexOf('{');
		const lastCloseBrace = beforeCursor.lastIndexOf('}');
		const insideBrace = lastBrace > lastCloseBrace;

		if (insideBrace) {
			// Column autocomplete
			const partial = beforeCursor.slice(lastBrace + 1).toLowerCase();
			const matches: (ChipSuggestion & { score: number })[] = [];
			for (const col of normalizedColumns) {
				const score = scoreMatch(col.name, partial);
				if (score > 0) {
					const colors = getTypeColors(col.type);
					matches.push({
						label: col.name,
						description: col.type || 'text',
						value: col.name,
						category: 'Column',
						icon: '◆',
						data: { type: col.type || 'text' },
						score,
					});
				}
			}
			matches.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
			if (matches.length === 0) { detailEntry = null; detailColumn = null; return null; }

			detailEntry = null;
			detailColumn = matches[0] ? normalizedColumns.find(c => c.name === matches[0].value) || null : null;

			return [{ label: 'Columns', items: matches.slice(0, 8) }];
		}

		// Function autocomplete: detect word being typed
		let wordStart = beforeCursor.length;
		for (let j = beforeCursor.length - 1; j >= 0; j--) {
			if (/[a-zA-Z_]/.test(beforeCursor[j])) {
				wordStart = j;
			} else {
				break;
			}
		}

		if (wordStart < beforeCursor.length) {
			// Check we're not inside braces
			let inBrace = false;
			for (let j = wordStart - 1; j >= 0; j--) {
				if (beforeCursor[j] === '{') { inBrace = true; break; }
				if (beforeCursor[j] === '}') break;
			}
			if (inBrace) { detailEntry = null; detailColumn = null; return null; }

			const partial = beforeCursor.slice(wordStart).toLowerCase();
			if (partial.length === 0) { detailEntry = null; detailColumn = null; return null; }

			const matches: (ChipSuggestion & { score: number; entry: FormulaEntry })[] = [];
			for (const entry of FORMULA_CATALOG) {
				const score = scoreMatch(entry.name, partial);
				if (score > 0) {
					matches.push({
						label: entry.signature,
						description: entry.description,
						value: entry.insertText,
						category: entry.category,
						data: { entryName: entry.name },
						replaceLength: partial.length,
						score,
						entry,
					});
				}
			}
			matches.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
			if (matches.length === 0) { detailEntry = null; detailColumn = null; return null; }

			// For functions, we insert raw text, not chips
			detailEntry = matches[0]?.entry || null;
			detailColumn = null;

			return [{ label: 'Functions', items: matches.slice(0, 8) }];
		}

		detailEntry = null;
		detailColumn = null;
		return null;
	}

	function handleChipCreate(suggestion: ChipSuggestion): ChipInfo {
		// Clear detail panel when suggestion is selected
		detailEntry = null;
		detailColumn = null;

		// If it's a column, create a chip
		if (suggestion.category === 'Column') {
			const colors = getTypeColors(suggestion.data?.type);
			return {
				className: 'formula-column-chip',
				displayText: suggestion.value,
				dataAttrs: {
					chipValue: suggestion.value,
					columnType: suggestion.data?.type || 'text',
				},
			};
		}

		// For functions, insert as plain text, not a chip
		return {
			className: '',
			displayText: suggestion.value,
			dataAttrs: {},
			insertAsText: true,
		};
	}

	function handleSerialize(chipEl: HTMLElement): string {
		const val = chipEl.dataset.chipValue || '';
		const colType = chipEl.dataset.columnType;
		// Column chips serialize as {column_name}
		if (colType !== undefined) {
			return `{${val}}`;
		}
		// Function text just serializes as-is
		return val;
	}

	function handleChange(newValue: string) {
		value = newValue;
		// Synthesize an input event for the parent
		oninput?.({ target: { value: newValue } } as unknown as Event);
	}

	// --- Initialize contenteditable with existing formula value ---
	// Parse {column} references into chips on mount
	let chipsInitialized = false;
	$effect(() => {
		if (!chipInputRef) return;
		const el = chipInputRef.getElement();
		if (!el || !value) return;

		// Only run once per mount — skip if we already created chips
		if (chipsInitialized) return;

		// Check if chips already exist (component reuse)
		const hasChips = el.querySelector('.formula-column-chip');
		if (hasChips) { chipsInitialized = true; return; }

		// Skip if value has no column references to chipify
		if (!value.includes('{')) { chipsInitialized = true; return; }

		chipsInitialized = true;

		// Parse value and create chips for {column} references
		const regex = /\{([^}]+)\}/g;
		let lastIndex = 0;
		const fragment = document.createDocumentFragment();
		let match;

		while ((match = regex.exec(value)) !== null) {
			// Add text before the match
			if (match.index > lastIndex) {
				fragment.appendChild(document.createTextNode(value.slice(lastIndex, match.index)));
			}

			const colName = match[1];
			const col = normalizedColumns.find(c => c.name === colName);

			if (col) {
				// Create chip
				const chip = document.createElement('span');
				chip.contentEditable = 'false';
				chip.className = 'formula-column-chip';
				chip.dataset.chipValue = colName;
				chip.dataset.columnType = col.type || 'text';
				chip.textContent = colName;
				fragment.appendChild(chip);
			} else {
				// Column not found, keep as text
				fragment.appendChild(document.createTextNode(match[0]));
			}

			lastIndex = match.index + match[0].length;
		}

		// Add remaining text
		if (lastIndex < value.length) {
			fragment.appendChild(document.createTextNode(value.slice(lastIndex)));
		}

		if (fragment.childNodes.length > 0) {
			el.innerHTML = '';
			el.appendChild(fragment);
		}
	});
</script>

<div class="formula-input-wrapper" class:formula-input-invalid={invalid}>
	<ChipInput
		bind:this={chipInputRef}
		bind:value
		{placeholder}
		compact
		monospace
		rows={2}
		triggerChar={`{`}
		onTrigger={handleTrigger}
		onChipCreate={handleChipCreate}
		onSerialize={handleSerialize}
		onchange={handleChange}
	/>

	<!-- Detail panel for selected suggestion -->
	{#if detailEntry}
		<div class="formula-detail-panel">
			<div class="formula-detail-sig">{detailEntry.signature}</div>
			<div class="formula-detail-desc">{detailEntry.description}</div>
			<div class="formula-detail-example">{detailEntry.example}</div>
		</div>
	{:else if detailColumn}
		<div class="formula-detail-panel">
			<div class="formula-detail-sig">{`{${detailColumn.name}}`}</div>
			<div class="formula-detail-desc">Column reference ({detailColumn.type || 'text'})</div>
		</div>
	{/if}
</div>

<style>
	.formula-input-wrapper {
		position: relative;
	}
	.formula-input-invalid :global(.chip-input-editable) {
		border-color: oklch(0.55 0.18 25);
	}

	/* Column chips - styled with type-specific colors via inline styles */
	:global(.formula-column-chip) {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		padding: 0px 5px;
		margin: 0 1px;
		border-radius: 3px;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.625rem;
		line-height: 1.4;
		vertical-align: baseline;
		user-select: none;
		cursor: default;
		white-space: nowrap;
	}

	/* Type-specific chip colors */
	:global(.formula-column-chip[data-column-type="number"]),
	:global(.formula-column-chip[data-column-type="currency"]),
	:global(.formula-column-chip[data-column-type="percentage"]) {
		background: oklch(0.25 0.08 240 / 0.4);
		border: 1px solid oklch(0.40 0.12 240 / 0.5);
		color: oklch(0.80 0.10 240);
	}
	:global(.formula-column-chip[data-column-type="text"]),
	:global(.formula-column-chip[data-column-type="enum"]),
	:global(.formula-column-chip[data-column-type="email"]),
	:global(.formula-column-chip[data-column-type="url"]) {
		background: oklch(0.25 0.08 145 / 0.4);
		border: 1px solid oklch(0.40 0.12 145 / 0.5);
		color: oklch(0.80 0.10 145);
	}
	:global(.formula-column-chip[data-column-type="date"]),
	:global(.formula-column-chip[data-column-type="datetime"]) {
		background: oklch(0.25 0.08 300 / 0.4);
		border: 1px solid oklch(0.40 0.12 300 / 0.5);
		color: oklch(0.80 0.10 300);
	}
	:global(.formula-column-chip[data-column-type="boolean"]) {
		background: oklch(0.25 0.08 60 / 0.4);
		border: 1px solid oklch(0.40 0.12 60 / 0.5);
		color: oklch(0.80 0.10 60);
	}
	:global(.formula-column-chip[data-column-type="formula"]) {
		background: oklch(0.25 0.08 80 / 0.4);
		border: 1px solid oklch(0.40 0.12 80 / 0.5);
		color: oklch(0.80 0.10 80);
	}

	:global(.formula-column-chip:hover) {
		filter: brightness(1.1);
	}

	/* Detail panel */
	.formula-detail-panel {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		z-index: 49;
		margin-top: 2px;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.375rem;
		padding: 0.375rem 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.1875rem;
	}
	.formula-detail-sig {
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.625rem;
		color: oklch(0.80 0.10 200);
	}
	.formula-detail-desc {
		font-size: 0.625rem;
		color: oklch(0.65 0.02 250);
	}
	.formula-detail-example {
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.5625rem;
		color: oklch(0.55 0.05 145);
		opacity: 0.8;
	}
</style>
