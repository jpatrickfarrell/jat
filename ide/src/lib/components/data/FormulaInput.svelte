<script lang="ts">
	import { FORMULA_CATALOG, FORMULA_CATALOG_MAP, type FormulaEntry } from '$lib/config/formulaCatalog';

	interface SuggestionItem {
		type: 'function' | 'column';
		label: string;
		category: string;
		entry?: FormulaEntry;
		insertText: string;
	}

	let {
		value = $bindable(''),
		columns = [],
		oninput,
		placeholder = '',
		invalid = false,
	}: {
		value: string;
		columns: string[];
		oninput?: (e: Event) => void;
		placeholder?: string;
		invalid?: boolean;
	} = $props();

	let textareaEl: HTMLTextAreaElement | undefined = $state();
	let suggestions = $state<SuggestionItem[]>([]);
	let selectedIndex = $state(0);
	let context = $state<{ type: 'column' | 'function' | 'method'; start: number; partial: string } | null>(null);

	// Detail panel shows info for the currently selected suggestion
	const selectedSuggestion = $derived(suggestions.length > 0 ? suggestions[selectedIndex] : null);

	function detectContext(text: string, cursor: number) {
		// Scan backward from cursor
		let i = cursor - 1;

		// Check for column ref context: { with no closing }
		let braceStart = -1;
		for (let j = i; j >= 0; j--) {
			if (text[j] === '}') break;
			if (text[j] === '{') { braceStart = j; break; }
		}
		if (braceStart >= 0) {
			const partial = text.slice(braceStart + 1, cursor).toLowerCase();
			return { type: 'column' as const, start: braceStart, partial };
		}

		// Check for method context: . after }, ), ", '
		if (i >= 0 && text[i] === '.') {
			// Verify what's before the dot
			const before = i > 0 ? text[i - 1] : '';
			if (before === '}' || before === ')' || before === '"' || before === "'") {
				return { type: 'method' as const, start: i, partial: '' };
			}
		}
		// Or partial method: }.xxx
		for (let j = i; j >= 0; j--) {
			const ch = text[j];
			if (ch === '.') {
				const before = j > 0 ? text[j - 1] : '';
				if (before === '}' || before === ')' || before === '"' || before === "'") {
					const partial = text.slice(j + 1, cursor).toLowerCase();
					return { type: 'method' as const, start: j, partial };
				}
				break;
			}
			if (!/[a-zA-Z0-9_]/.test(ch)) break;
		}

		// Check for function context: alphabetic word at word boundary
		let wordStart = cursor;
		for (let j = cursor - 1; j >= 0; j--) {
			if (/[a-zA-Z_]/.test(text[j])) {
				wordStart = j;
			} else {
				break;
			}
		}
		if (wordStart < cursor) {
			// Make sure we're not inside {}
			let insideBrace = false;
			for (let j = wordStart - 1; j >= 0; j--) {
				if (text[j] === '{') { insideBrace = true; break; }
				if (text[j] === '}') break;
			}
			if (!insideBrace) {
				const partial = text.slice(wordStart, cursor).toLowerCase();
				if (partial.length > 0) {
					return { type: 'function' as const, start: wordStart, partial };
				}
			}
		}

		return null;
	}

	function scoreMatch(name: string, partial: string): number {
		if (!partial) return 50;
		const lower = name.toLowerCase();
		if (lower === partial) return 100;
		if (lower.startsWith(partial)) return 80;
		if (lower.includes(partial)) return 40;
		return 0;
	}

	function buildSuggestions(ctx: typeof context) {
		if (!ctx) { suggestions = []; return; }

		const items: (SuggestionItem & { score: number })[] = [];

		if (ctx.type === 'column') {
			for (const col of columns) {
				const score = scoreMatch(col, ctx.partial);
				if (score > 0) {
					items.push({
						type: 'column',
						label: col,
						category: 'Column',
						insertText: col + '}',
						score,
					});
				}
			}
		} else {
			// function or method — filter catalog
			for (const entry of FORMULA_CATALOG) {
				const score = scoreMatch(entry.name, ctx.partial);
				if (score > 0) {
					items.push({
						type: 'function',
						label: entry.signature,
						category: entry.category,
						entry,
						insertText: ctx.type === 'method' ? entry.name + '(' : entry.insertText,
						score,
					});
				}
			}
		}

		items.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
		suggestions = items.slice(0, 8);
		selectedIndex = 0;
	}

	function handleInput(e: Event) {
		const ta = e.target as HTMLTextAreaElement;
		value = ta.value;
		const cursor = ta.selectionStart ?? ta.value.length;
		context = detectContext(ta.value, cursor);
		buildSuggestions(context);
		oninput?.(e);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (suggestions.length === 0) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = (selectedIndex + 1) % suggestions.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = (selectedIndex - 1 + suggestions.length) % suggestions.length;
		} else if (e.key === 'Tab' || e.key === 'Enter') {
			if (suggestions.length > 0) {
				e.preventDefault();
				insertSuggestion(suggestions[selectedIndex]);
			}
		} else if (e.key === 'Escape') {
			e.preventDefault();
			suggestions = [];
			context = null;
		}
	}

	function insertSuggestion(item: SuggestionItem) {
		if (!textareaEl || !context) return;

		let before: string;
		let insertText = item.insertText;

		if (context.type === 'column') {
			// { is already typed, replace from after {
			before = value.slice(0, context.start + 1);
		} else if (context.type === 'method') {
			// Replace from after the dot
			before = value.slice(0, context.start + 1);
		} else {
			// Function: replace from word start
			before = value.slice(0, context.start);
		}

		const cursorPos = textareaEl.selectionStart ?? value.length;
		const after = value.slice(cursorPos);

		value = before + insertText + after;
		suggestions = [];
		context = null;

		// Position cursor inside parens for functions
		const newCursor = before.length + insertText.length;
		requestAnimationFrame(() => {
			if (textareaEl) {
				textareaEl.focus();
				textareaEl.selectionStart = textareaEl.selectionEnd = newCursor;
				// Dispatch input event so parent gets notified
				textareaEl.dispatchEvent(new Event('input', { bubbles: true }));
			}
		});
	}

	function handleSuggestionClick(item: SuggestionItem, e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		insertSuggestion(item);
	}
</script>

<div class="formula-input-wrapper">
	<textarea
		bind:this={textareaEl}
		class="field-input formula-input"
		class:formula-invalid={invalid}
		{value}
		oninput={handleInput}
		onkeydown={handleKeydown}
		{placeholder}
		rows="2"
	></textarea>

	{#if suggestions.length > 0}
		<div class="ac-dropdown">
			<div class="ac-list">
				{#each suggestions as item, i}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="ac-item"
						class:ac-item-selected={i === selectedIndex}
						onmousedown={(e) => handleSuggestionClick(item, e)}
						onmouseenter={() => selectedIndex = i}
					>
						<span class="ac-item-label">{item.label}</span>
						<span class="ac-item-category">{item.category}</span>
					</div>
				{/each}
			</div>

			{#if selectedSuggestion}
				<div class="ac-detail">
					{#if selectedSuggestion.entry}
						<div class="ac-detail-sig">{selectedSuggestion.entry.signature}</div>
						<div class="ac-detail-desc">{selectedSuggestion.entry.description}</div>
						<div class="ac-detail-example">{selectedSuggestion.entry.example}</div>
					{:else}
						<div class="ac-detail-sig">{'{' + selectedSuggestion.label + '}'}</div>
						<div class="ac-detail-desc">Column reference</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.formula-input-wrapper {
		position: relative;
	}
	.formula-input {
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.6875rem;
		resize: vertical;
		min-height: 2.5rem;
		width: 100%;
		box-sizing: border-box;
		padding: 0.25rem 0.375rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.1875rem;
		color: oklch(0.85 0.02 250);
		outline: none;
	}
	.formula-input:focus {
		border-color: oklch(0.50 0.10 200);
	}
	.formula-input.formula-invalid {
		border-color: oklch(0.55 0.18 25);
	}

	/* Autocomplete dropdown */
	.ac-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		z-index: 50;
		margin-top: 2px;
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.375rem;
		box-shadow: 0 4px 16px oklch(0 0 0 / 0.5);
		overflow: hidden;
	}
	.ac-list {
		background: oklch(0.16 0.01 250);
		max-height: 160px;
		overflow-y: auto;
	}
	.ac-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.25rem 0.5rem;
		cursor: pointer;
		font-size: 0.6875rem;
		gap: 0.5rem;
	}
	.ac-item:hover,
	.ac-item-selected {
		background: oklch(0.22 0.04 200);
	}
	.ac-item-label {
		color: oklch(0.85 0.02 250);
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.625rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ac-item-category {
		color: oklch(0.50 0.02 250);
		font-size: 0.5625rem;
		flex-shrink: 0;
	}

	/* Detail panel */
	.ac-detail {
		background: oklch(0.14 0.01 250);
		border-top: 1px solid oklch(0.25 0.02 250);
		padding: 0.375rem 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.1875rem;
	}
	.ac-detail-sig {
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.625rem;
		color: oklch(0.80 0.10 200);
	}
	.ac-detail-desc {
		font-size: 0.625rem;
		color: oklch(0.65 0.02 250);
	}
	.ac-detail-example {
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.5625rem;
		color: oklch(0.55 0.05 145);
		opacity: 0.8;
	}
</style>
