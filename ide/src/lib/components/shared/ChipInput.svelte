<script lang="ts">
	/**
	 * ChipInput - Generic contenteditable input with inline chips and autocomplete.
	 *
	 * Extracted base for PromptInput and FormulaInput. Handles:
	 * - Contenteditable div with placeholder
	 * - Chip insertion/deletion (non-editable inline spans)
	 * - Autocomplete dropdown with keyboard navigation
	 * - Serialization (DOM → text with chip markers)
	 */

	// --- Types ---
	export interface ChipSuggestion {
		label: string;
		description?: string;
		value: string;
		category?: string;
		icon?: string;
		/** Extra data passed through to chip creation */
		data?: Record<string, any>;
		/** Number of chars before cursor to replace (alternative to triggerChar lookup) */
		replaceLength?: number;
	}

	export interface SuggestionGroup {
		label: string;
		items: ChipSuggestion[];
	}

	export interface ChipInfo {
		/** CSS class for the chip span */
		className: string;
		/** Display text inside the chip */
		displayText: string;
		/** Data attributes to set on the chip element */
		dataAttrs: Record<string, string>;
		/** Optional HTML content (overrides displayText) */
		html?: string;
		/** If true, insert as plain text instead of a chip element */
		insertAsText?: boolean;
	}

	// --- Props ---
	let {
		value = $bindable(''),
		placeholder = '',
		disabled = false,
		compact = false,
		rows = 3,
		monospace = false,
		triggerChar = '',
		onTrigger,
		onChipCreate,
		onSerialize,
		onchange,
		onfocus,
		onblur,
		onkeydown: externalKeydown,
	}: {
		value: string;
		placeholder?: string;
		disabled?: boolean;
		compact?: boolean;
		rows?: number;
		monospace?: boolean;
		/** Character that triggers autocomplete (e.g., '@', '{') */
		triggerChar: string;
		/** Called when trigger char is typed. Return suggestions for the dropdown. */
		onTrigger?: (query: string, beforeCursor: string) => ChipSuggestion[] | SuggestionGroup[] | null;
		/** Called when a suggestion is selected. Return chip info for DOM insertion. */
		onChipCreate?: (suggestion: ChipSuggestion) => ChipInfo;
		/** Called to serialize a chip element back to text. Return the text representation. */
		onSerialize?: (chipEl: HTMLElement) => string;
		onchange?: (value: string) => void;
		onfocus?: (e: FocusEvent) => void;
		onblur?: (e: FocusEvent) => void;
		onkeydown?: (e: KeyboardEvent) => void;
	} = $props();

	// --- State ---
	let editableRef = $state<HTMLDivElement | null>(null);
	let autocompleteRef = $state<HTMLDivElement | null>(null);
	let showAutocomplete = $state(false);
	let flatSuggestions = $state<ChipSuggestion[]>([]);
	let groupedSuggestions = $state<SuggestionGroup[]>([]);
	let selectedIndex = $state(0);
	let isGrouped = $state(false);

	// Track last synced value to avoid infinite loops
	let lastSyncedValue = '';

	// Computed min-height from rows
	let minHeight = $derived(compact ? '28px' : `${Math.max(rows * 24, 40)}px`);

	// Total item count across flat or grouped suggestions
	let totalItems = $derived.by(() => {
		if (isGrouped) {
			return groupedSuggestions.reduce((sum, g) => sum + g.items.length, 0);
		}
		return flatSuggestions.length;
	});

	// Selected suggestion detail
	let selectedSuggestion = $derived.by(() => {
		if (totalItems === 0) return null;
		if (isGrouped) {
			let idx = selectedIndex;
			for (const group of groupedSuggestions) {
				if (idx < group.items.length) return group.items[idx];
				idx -= group.items.length;
			}
			return null;
		}
		return flatSuggestions[selectedIndex] ?? null;
	});

	// --- Sync contenteditable when value changes externally ---
	$effect(() => {
		if (editableRef && value !== lastSyncedValue) {
			const currentDomText = serializeContent(editableRef);
			if (value !== currentDomText) {
				if (value === '') {
					editableRef.innerHTML = '';
				} else {
					editableRef.textContent = value;
				}
				lastSyncedValue = value;
			}
		}
	});

	// --- Serialization ---
	function serializeContent(el: HTMLElement): string {
		let result = '';
		for (const node of Array.from(el.childNodes)) {
			if (node.nodeType === Node.TEXT_NODE) {
				result += node.textContent || '';
			} else if (node instanceof HTMLElement) {
				if (node.dataset.chipValue !== undefined && onSerialize) {
					result += onSerialize(node);
				} else if (node.tagName === 'BR') {
					result += '\n';
				} else if (node.tagName === 'DIV' || node.tagName === 'P') {
					if (result.length > 0 && !result.endsWith('\n')) result += '\n';
					result += serializeContent(node);
				} else {
					result += serializeContent(node);
				}
			}
		}
		return result;
	}

	function syncValue() {
		if (!editableRef) return;
		value = serializeContent(editableRef);
		lastSyncedValue = value;
		onchange?.(value);
	}

	// --- Cursor helpers ---
	function getTextBeforeCursor(): string {
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0 || !editableRef) return '';
		try {
			const range = sel.getRangeAt(0);
			const preRange = document.createRange();
			preRange.selectNodeContents(editableRef);
			preRange.setEnd(range.startContainer, range.startOffset);
			return preRange.toString();
		} catch {
			return '';
		}
	}

	// --- Input Handling ---
	function handleInput() {
		syncValue();
		if (!value.trim() && editableRef) {
			editableRef.innerHTML = '';
		}

		if (!onTrigger) {
			showAutocomplete = false;
			return;
		}

		const beforeCursor = getTextBeforeCursor();
		const triggerResult = onTrigger(extractQuery(beforeCursor), beforeCursor);

		if (triggerResult && Array.isArray(triggerResult) && triggerResult.length > 0) {
			showAutocomplete = true;
			selectedIndex = 0;

			// Detect if grouped
			if ('items' in triggerResult[0]) {
				isGrouped = true;
				groupedSuggestions = triggerResult as SuggestionGroup[];
				flatSuggestions = [];
			} else {
				isGrouped = false;
				flatSuggestions = triggerResult as ChipSuggestion[];
				groupedSuggestions = [];
			}
		} else {
			showAutocomplete = false;
			flatSuggestions = [];
			groupedSuggestions = [];
		}
	}

	function extractQuery(beforeCursor: string): string {
		if (!triggerChar) return '';
		const lastTrigger = beforeCursor.lastIndexOf(triggerChar);
		if (lastTrigger < 0) return '';
		return beforeCursor.slice(lastTrigger + triggerChar.length);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (showAutocomplete && totalItems > 0) {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				selectedIndex = (selectedIndex + 1) % totalItems;
				return;
			}
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				selectedIndex = (selectedIndex - 1 + totalItems) % totalItems;
				return;
			}
			if (e.key === 'Tab' || e.key === 'Enter') {
				e.preventDefault();
				if (selectedSuggestion) {
					selectSuggestion(selectedSuggestion);
				}
				return;
			}
			if (e.key === 'Escape') {
				e.preventDefault();
				showAutocomplete = false;
				return;
			}
		}
		externalKeydown?.(e);
	}

	// --- Suggestion Selection ---
	function selectSuggestion(suggestion: ChipSuggestion) {
		if (!editableRef || !onChipCreate) return;

		const chipInfo = onChipCreate(suggestion);
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return;

		const range = sel.getRangeAt(0);
		let textNode: Node = range.startContainer;
		let cursorPos = range.startOffset;

		// Navigate to the text node
		if (textNode.nodeType !== Node.TEXT_NODE) {
			const children = Array.from(textNode.childNodes);
			const prev = children[cursorPos - 1];
			if (prev && prev.nodeType === Node.TEXT_NODE) {
				textNode = prev;
				cursorPos = (prev.textContent || '').length;
			} else if (prev) {
				let last: Node | null = prev;
				while (last && last.nodeType !== Node.TEXT_NODE) {
					last = last.lastChild;
				}
				if (last) {
					textNode = last;
					cursorPos = (last.textContent || '').length;
				} else return;
			} else return;
		}

		const text = textNode.textContent || '';
		const beforeCursor = text.slice(0, cursorPos);

		// Find the replacement start position
		let replaceStart: number;
		if (suggestion.replaceLength !== undefined) {
			// Use explicit replaceLength (for word-based replacement like functions)
			replaceStart = cursorPos - suggestion.replaceLength;
		} else if (triggerChar) {
			// Use triggerChar position (for column refs like {column})
			replaceStart = beforeCursor.lastIndexOf(triggerChar);
			if (replaceStart < 0) return;
		} else {
			return;
		}

		const beforeReplace = text.slice(0, replaceStart);
		const afterText = text.slice(cursorPos);
		const parent = textNode.parentNode!;

		// Insert text before replacement point
		if (beforeReplace) {
			parent.insertBefore(document.createTextNode(beforeReplace), textNode);
		}

		if (chipInfo.insertAsText) {
			// Insert as plain text (e.g., function names)
			const insertedText = chipInfo.displayText;
			const afterNode = document.createTextNode(insertedText + afterText);
			parent.insertBefore(afterNode, textNode);
			parent.removeChild(textNode);

			// Position cursor after inserted text
			const newRange = document.createRange();
			newRange.setStart(afterNode, insertedText.length);
			newRange.collapse(true);
			sel.removeAllRanges();
			sel.addRange(newRange);
		} else {
			// Create chip element
			const chip = document.createElement('span');
			chip.contentEditable = 'false';
			chip.className = chipInfo.className;
			chip.dataset.chipValue = suggestion.value;
			for (const [key, val] of Object.entries(chipInfo.dataAttrs)) {
				chip.dataset[key] = val;
			}
			if (chipInfo.html) {
				chip.innerHTML = chipInfo.html;
			} else {
				chip.textContent = chipInfo.displayText;
			}
			parent.insertBefore(chip, textNode);

			// Insert space + remaining text after chip
			const afterNode = document.createTextNode('\u00A0' + afterText);
			parent.insertBefore(afterNode, textNode);
			parent.removeChild(textNode);

			// Position cursor after chip
			const newRange = document.createRange();
			newRange.setStart(afterNode, 1);
			newRange.collapse(true);
			sel.removeAllRanges();
			sel.addRange(newRange);
		}

		syncValue();
		showAutocomplete = false;
		flatSuggestions = [];
		groupedSuggestions = [];
	}

	function handleSuggestionClick(suggestion: ChipSuggestion, e: MouseEvent) {
		e.preventDefault();
		selectSuggestion(suggestion);
	}

	// --- Paste ---
	function handlePaste(e: ClipboardEvent) {
		e.preventDefault();
		const text = e.clipboardData?.getData('text/plain') || '';
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) return;
		const range = sel.getRangeAt(0);
		range.deleteContents();
		const textNode = document.createTextNode(text);
		range.insertNode(textNode);
		range.setStartAfter(textNode);
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);
		syncValue();
	}

	function handleBlur(e: FocusEvent) {
		setTimeout(() => { showAutocomplete = false; }, 200);
		onblur?.(e);
	}

	// --- Public API ---
	export function focus() {
		editableRef?.focus();
	}

	export function clear() {
		if (editableRef) editableRef.innerHTML = '';
		value = '';
		lastSyncedValue = '';
	}

	export function setText(text: string) {
		if (editableRef) editableRef.textContent = text;
		value = text;
		lastSyncedValue = text;
	}

	export function getElement(): HTMLDivElement | null {
		return editableRef;
	}
</script>

<div class="chip-input-wrapper relative">
	<div
		bind:this={editableRef}
		contenteditable={disabled ? 'false' : 'true'}
		role="textbox"
		aria-multiline="true"
		class="chip-input-editable w-full rounded-md text-sm"
		class:chip-input-monospace={monospace}
		class:chip-input-compact={compact}
		style="
			min-height: {minHeight};
			max-height: {compact ? '120px' : '240px'};
			{disabled ? 'opacity: 0.5; cursor: not-allowed;' : ''}
		"
		oninput={handleInput}
		onkeydown={handleKeydown}
		onpaste={handlePaste}
		onfocus={onfocus}
		onblur={handleBlur}
	></div>

	<!-- Placeholder overlay -->
	{#if !value.trim()}
		<div class="chip-input-placeholder absolute top-0 left-0 text-sm pointer-events-none"
			class:chip-input-placeholder-compact={compact}
			class:chip-input-placeholder-mono={monospace}
		>
			{placeholder}
		</div>
	{/if}

	<!-- Autocomplete dropdown -->
	{#if showAutocomplete && totalItems > 0}
		<div
			bind:this={autocompleteRef}
			class="chip-input-dropdown absolute z-50 w-full mt-1 rounded-lg overflow-hidden shadow-xl"
		>
			{#if isGrouped}
				{@const flatIdx = { current: 0 }}
				{#each groupedSuggestions as group}
					{#if group.items.length > 0}
						<div class="chip-input-dropdown-header">
							{group.label}
						</div>
						{#each group.items as item}
							{@const idx = flatIdx.current++}
							<button
								class="chip-input-dropdown-item"
								class:chip-input-dropdown-item-selected={idx === selectedIndex}
								onmouseenter={() => selectedIndex = idx}
								onmousedown={(e) => handleSuggestionClick(item, e)}
							>
								{#if item.icon}
									<span class="chip-input-dropdown-icon">{item.icon}</span>
								{/if}
								<span class="chip-input-dropdown-label">{item.label}</span>
								{#if item.description}
									<span class="chip-input-dropdown-desc">{item.description}</span>
								{/if}
								{#if item.category}
									<span class="chip-input-dropdown-category">{item.category}</span>
								{/if}
							</button>
						{/each}
					{/if}
				{/each}
			{:else}
				{#each flatSuggestions as item, i}
					<button
						class="chip-input-dropdown-item"
						class:chip-input-dropdown-item-selected={i === selectedIndex}
						onmouseenter={() => selectedIndex = i}
						onmousedown={(e) => handleSuggestionClick(item, e)}
					>
						{#if item.icon}
							<span class="chip-input-dropdown-icon">{item.icon}</span>
						{/if}
						<span class="chip-input-dropdown-label">{item.label}</span>
						{#if item.description}
							<span class="chip-input-dropdown-desc">{item.description}</span>
						{/if}
						{#if item.category}
							<span class="chip-input-dropdown-category">{item.category}</span>
						{/if}
					</button>
				{/each}
			{/if}

			<div class="chip-input-dropdown-footer">
				<span><kbd>↑↓</kbd> Navigate</span>
				<span><kbd>Tab</kbd> Select</span>
				<span><kbd>Esc</kbd> Close</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.chip-input-editable {
		padding: 0.5rem 0.75rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		color: oklch(0.90 0.01 250);
		overflow-y: auto;
		white-space: pre-wrap;
		word-break: break-word;
		outline: none;
		resize: vertical;
		line-height: 1.6;
	}
	.chip-input-editable:focus {
		border-color: oklch(0.45 0.10 200);
		box-shadow: 0 0 0 1px oklch(0.45 0.10 200 / 0.3);
	}
	.chip-input-compact {
		padding: 0.25rem 0.375rem;
		line-height: 1.4;
		resize: none;
	}
	.chip-input-monospace {
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.6875rem;
	}
	.chip-input-placeholder {
		padding: 0.5rem 0.75rem;
		color: oklch(0.40 0.01 250);
	}
	.chip-input-placeholder-compact {
		padding: 0.25rem 0.375rem;
	}
	.chip-input-placeholder-mono {
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.6875rem;
	}

	/* Dropdown */
	.chip-input-dropdown {
		background: oklch(0.18 0.01 250);
		border: 1px solid oklch(0.30 0.03 250);
		max-height: 280px;
		overflow-y: auto;
	}
	.chip-input-dropdown-header {
		padding: 0.25rem 0.5rem;
		font-size: 0.625rem;
		color: oklch(0.50 0.01 250);
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}
	.chip-input-dropdown-item {
		width: 100%;
		text-align: left;
		padding: 0.25rem 0.5rem;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		transition: background 0.1s;
		font-size: 0.6875rem;
		color: oklch(0.85 0.01 250);
		background: transparent;
		border: none;
		cursor: pointer;
	}
	.chip-input-dropdown-item:hover,
	.chip-input-dropdown-item-selected {
		background: oklch(0.25 0.04 200 / 0.3);
	}
	.chip-input-dropdown-icon {
		flex-shrink: 0;
		font-size: 0.75rem;
	}
	.chip-input-dropdown-label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.chip-input-dropdown-desc {
		margin-left: auto;
		font-size: 0.625rem;
		color: oklch(0.50 0.01 250);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.chip-input-dropdown-category {
		flex-shrink: 0;
		font-size: 0.5625rem;
		color: oklch(0.50 0.02 250);
	}
	.chip-input-dropdown-footer {
		padding: 0.25rem 0.5rem;
		font-size: 0.625rem;
		color: oklch(0.40 0.01 250);
		border-top: 1px solid oklch(0.25 0.02 250);
		display: flex;
		gap: 0.75rem;
	}
	.chip-input-dropdown-footer kbd {
		background: oklch(0.25 0.02 250);
		padding: 1px 4px;
		border-radius: 2px;
		font-size: 10px;
	}
</style>
