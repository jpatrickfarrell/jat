<script lang="ts">
	/**
	 * InlineEdit Component
	 *
	 * A reusable inline editing component for text and textarea inputs.
	 * Shows display value when not editing, converts to input on click.
	 *
	 * Features:
	 * - Auto-saves on blur or Enter (Enter only for text type)
	 * - Cancels on Escape, reverting to original value
	 * - Hover state to indicate editability
	 * - Auto-focus when editing starts
	 * - Disabled state during saves
	 * - Formula-aware display: @fx:expression renders as evaluated value
	 */

	import { parseFx, hasFx } from '$lib/utils/formulaDisplay';

	interface Props {
		/** Current value */
		value: string;
		/** Callback when value is saved */
		onSave: (newValue: string) => Promise<void> | void;
		/** Input type: 'text' or 'textarea' */
		type?: 'text' | 'textarea';
		/** Placeholder text when empty */
		placeholder?: string;
		/** Disable editing */
		disabled?: boolean;
		/** Additional CSS classes for the container */
		class?: string;
		/** Number of rows for textarea (default: 3) */
		rows?: number;
		/** Show save/cancel buttons instead of auto-save on blur */
		showButtons?: boolean;
		/** Truncate long text with ellipsis (shows full text on hover) */
		truncate?: boolean;
		/** Row context for evaluating @fx: formulas */
		formulaContext?: Record<string, any>;
	}

	let {
		value,
		onSave,
		type = 'text',
		placeholder = 'Click to edit...',
		disabled = false,
		class: className = '',
		rows = 3,
		showButtons = false,
		truncate = false,
		formulaContext = {}
	}: Props = $props();

	// --- Formula rendering ---
	let hasFormulas = $derived(hasFx(value));
	let displaySegments = $derived(hasFormulas ? parseFx(value, formulaContext) : []);

	// Internal state
	let isEditing = $state(false);
	let editValue = $state(value);
	let isSaving = $state(false);
	let inputElement = $state<HTMLInputElement | HTMLTextAreaElement | null>(null);

	// Sync editValue when value prop changes (only when not editing)
	$effect(() => {
		if (!isEditing) {
			editValue = value;
		}
	});

	// Start editing
	function startEditing() {
		if (disabled || isSaving) return;
		editValue = value;
		isEditing = true;
	}

	// Cancel editing
	function cancelEditing() {
		editValue = value;
		isEditing = false;
	}

	// Save the edited value
	async function saveValue() {
		// Don't save if value hasn't changed
		if (editValue === value) {
			isEditing = false;
			return;
		}

		isSaving = true;
		try {
			await onSave(editValue);
			isEditing = false;
		} catch (err) {
			console.error('Failed to save:', err);
			// Keep editing mode open on error
		} finally {
			isSaving = false;
		}
	}

	// Handle keydown events
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			cancelEditing();
		} else if (event.key === 'Enter') {
			// For text inputs, Enter saves
			// For textarea, Enter adds newline (unless Cmd/Ctrl+Enter)
			if (type === 'text' || event.metaKey || event.ctrlKey) {
				event.preventDefault();
				saveValue();
			}
		}
	}

	// Handle blur (auto-save when not using buttons)
	function handleBlur() {
		if (!showButtons) {
			saveValue();
		}
	}

	// Auto-focus action
	function autofocus(node: HTMLElement) {
		// Use requestAnimationFrame to ensure DOM is ready
		requestAnimationFrame(() => {
			node.focus();
			// For inputs, select all text
			if (node instanceof HTMLInputElement) {
				node.select();
			}
		});
	}

	// Auto-resize textarea to fit content
	function autoresize(node: HTMLTextAreaElement) {
		function resize() {
			node.style.height = 'auto';
			node.style.height = node.scrollHeight + 'px';
		}

		// Resize on mount
		requestAnimationFrame(resize);

		// Resize on input
		node.addEventListener('input', resize);

		return {
			destroy() {
				node.removeEventListener('input', resize);
			}
		};
	}
</script>

{#if isEditing}
	<!-- Edit mode -->
	<div class="inline-edit-container w-full {className}">
		{#if type === 'textarea'}
			<textarea
				bind:this={inputElement}
				bind:value={editValue}
				{placeholder}
				{rows}
				class="textarea textarea-bordered w-full text-sm resize-none overflow-hidden"
				style="min-height: {rows * 1.5}rem;"
				disabled={isSaving}
				onkeydown={handleKeyDown}
				onblur={handleBlur}
				use:autofocus
				use:autoresize
			></textarea>
		{:else}
			<input
				bind:this={inputElement}
				bind:value={editValue}
				type="text"
				{placeholder}
				class="input input-bordered input-sm w-full"
				disabled={isSaving}
				onkeydown={handleKeyDown}
				onblur={handleBlur}
				use:autofocus
			/>
		{/if}

		{#if showButtons}
			<div class="flex gap-1 mt-1">
				<button
					class="btn btn-xs btn-success"
					onclick={saveValue}
					disabled={isSaving}
				>
					{#if isSaving}
						<span class="loading loading-spinner loading-xs"></span>
					{:else}
						Save
					{/if}
				</button>
				<button
					class="btn btn-xs btn-ghost"
					onclick={cancelEditing}
					disabled={isSaving}
				>
					Cancel
				</button>
			</div>
		{:else if isSaving}
			<div class="absolute right-2 top-1/2 -translate-y-1/2">
				<span class="loading loading-spinner loading-xs"></span>
			</div>
		{/if}
	</div>
{:else}
	<!-- Display mode -->
	<button
		class="inline-edit-display text-left w-full rounded px-2 py-1 transition-colors {disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-base-200'} {truncate ? 'inline-edit-truncate' : ''} {className}"
		onclick={startEditing}
		disabled={disabled}
		type="button"
		title={truncate && value ? value : undefined}
	>
		{#if value}
			{#if hasFormulas}
				<span class={type === 'textarea' ? 'whitespace-pre-wrap' : (truncate ? 'truncate-text' : '')}>
					{#each displaySegments as seg}
						{#if seg.type === 'formula'}
							<span class="inline-fx-result" title={seg.tooltip}>{seg.display}</span>
						{:else}
							{seg.display}
						{/if}
					{/each}
				</span>
			{:else if type === 'textarea'}
				<span class="whitespace-pre-wrap">{value}</span>
			{:else}
				<span class={truncate ? 'truncate-text' : ''}>{value}</span>
			{/if}
		{:else}
			<span class="text-base-content/50 italic">{placeholder}</span>
		{/if}
	</button>
{/if}

<style>
	.inline-edit-container {
		position: relative;
	}

	.inline-edit-display {
		min-height: 2rem;
		display: flex;
		align-items: center;
	}

	/* Truncation styles */
	.inline-edit-truncate {
		max-width: 100%;
		overflow: hidden;
	}

	.truncate-text {
		display: block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	.inline-fx-result {
		display: inline;
		padding: 0 4px;
		border-radius: 3px;
		background: oklch(0.25 0.06 80 / 0.4);
		border: 1px solid oklch(0.35 0.08 80 / 0.3);
		color: oklch(0.82 0.10 80);
		font-family: 'JetBrains Mono', ui-monospace, monospace;
		font-size: 0.85em;
		cursor: help;
	}
</style>
