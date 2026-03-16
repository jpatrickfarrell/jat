<script lang="ts">
	/**
	 * CanvasFormulaBlock - Evaluates expressions referencing canvas controls and data tables.
	 *
	 * Display: shows computed value inline (like Coda's = 40)
	 * Edit: click to open expression editor input
	 * Evaluation: client-side for simple formulas, server-side for table-referencing
	 */
	import type { FormulaBlock } from '$lib/types/canvas';

	let {
		block,
		controlValues = {},
		project = null,
		pageId = null,
		onBlockUpdate,
	}: {
		block: FormulaBlock;
		controlValues?: Record<string, unknown>;
		project?: string | null;
		pageId?: string | null;
		onBlockUpdate?: (block: FormulaBlock) => void;
	} = $props();

	let editing = $state(false);
	let editExpression = $state('');
	let result = $state<unknown>(null);
	let error = $state<string | null>(null);
	let loading = $state(false);
	let inputRef = $state<HTMLInputElement | null>(null);

	// Evaluate formula whenever expression or controlValues change
	$effect(() => {
		const expr = block.expression;
		const cv = controlValues;
		if (!expr || !expr.trim()) {
			result = null;
			error = null;
			return;
		}
		evaluateFormula(expr, cv);
	});

	async function evaluateFormula(expression: string, cv: Record<string, unknown>) {
		loading = true;
		error = null;

		// Check if expression references tables (contains TableFilter or similar)
		const needsServer = /TableFilter\s*\(/i.test(expression);

		if (needsServer && project && pageId) {
			// Server-side evaluation via API
			try {
				const res = await fetch(`/api/canvas/${pageId}/evaluate`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ project, controlValues: cv }),
				});
				if (!res.ok) {
					const data = await res.json();
					error = data.error || 'Evaluation failed';
					result = null;
				} else {
					const data = await res.json();
					const blockResult = data.results?.[block.id];
					if (typeof blockResult === 'string' && blockResult.startsWith('#ERR')) {
						error = blockResult;
						result = null;
					} else {
						result = blockResult;
						error = null;
					}
				}
			} catch (err) {
				error = `#ERR: ${(err as Error).message}`;
				result = null;
			}
		} else {
			// Client-side evaluation
			try {
				const { evaluateFormula: evalFn } = await import('$lib/utils/formulaEval.js');
				const controlRow: Record<string, any> = { ...cv };
				const evaluated = evalFn(expression, controlRow);
				if (typeof evaluated === 'string' && evaluated.startsWith('#')) {
					error = evaluated;
					result = null;
				} else {
					result = evaluated;
					error = null;
				}
			} catch (err) {
				error = `#ERR: ${(err as Error).message}`;
				result = null;
			}
		}
		loading = false;
	}

	function startEdit() {
		editing = true;
		editExpression = block.expression;
		// Focus after DOM updates
		setTimeout(() => inputRef?.focus({ preventScroll: true }), 0);
	}

	function commitEdit() {
		const trimmed = editExpression.trim();
		if (trimmed !== block.expression) {
			onBlockUpdate?.({ ...block, expression: trimmed });
		}
		editing = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			commitEdit();
		} else if (e.key === 'Escape') {
			editing = false;
		}
	}

	function formatResult(val: unknown): string {
		if (val === null || val === undefined) return '';
		if (typeof val === 'number') {
			// Format as currency if it looks like money (has 2 decimal places naturally)
			if (Number.isFinite(val)) {
				// Check if it's a whole number or has decimals
				if (val % 1 === 0 && Math.abs(val) < 1e15) {
					return val.toLocaleString();
				}
				return val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 4 });
			}
			return String(val);
		}
		if (val instanceof Date) {
			return val.toLocaleDateString();
		}
		if (Array.isArray(val)) {
			return val.join(', ');
		}
		return String(val);
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="formula-block" onclick={() => !editing && startEdit()}>
	{#if editing}
		<!-- Edit mode: expression input -->
		<div class="formula-edit">
			<span class="formula-eq">=</span>
			<input
				bind:this={inputRef}
				type="text"
				bind:value={editExpression}
				onblur={commitEdit}
				onkeydown={handleKeydown}
				class="formula-input"
				placeholder={`Type formula, e.g. {price} * {quantity}`}
				spellcheck="false"
			/>
		</div>
	{:else if !block.expression}
		<!-- Empty state -->
		<div class="formula-empty">
			<span class="formula-eq">=</span>
			<span class="text-xs" style="color: oklch(0.45 0.02 250);">Click to add formula</span>
		</div>
	{:else if error}
		<!-- Error state -->
		<div class="formula-result formula-error" title={error}>
			<span class="formula-eq formula-eq-error">=</span>
			<span class="error-text">#ERR</span>
			<span class="error-tooltip">{error}</span>
		</div>
	{:else if loading}
		<!-- Loading -->
		<div class="formula-result">
			<span class="formula-eq">=</span>
			<span class="text-xs" style="color: oklch(0.50 0.02 250);">...</span>
		</div>
	{:else}
		<!-- Result display -->
		<div class="formula-result">
			<span class="formula-eq">=</span>
			<span class="formula-value">{formatResult(result)}</span>
			{#if block.name}
				<span class="formula-name">({block.name})</span>
			{/if}
		</div>
	{/if}

	{#if !editing && block.expression}
		<div class="formula-expression" title={block.expression}>
			<code>{block.expression}</code>
		</div>
	{/if}
</div>

<style>
	.formula-block {
		cursor: pointer;
		padding: 0.375rem 0;
		border-radius: 0.375rem;
		transition: background 0.1s;
	}

	.formula-block:hover {
		background: oklch(0.55 0.15 145 / 0.04);
	}

	.formula-eq {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-family: monospace;
		font-size: 0.75rem;
		font-weight: 700;
		width: 22px;
		height: 22px;
		border-radius: 4px;
		flex-shrink: 0;
		background: oklch(0.55 0.15 145 / 0.15);
		color: oklch(0.70 0.15 145);
	}

	.formula-eq-error {
		background: oklch(0.55 0.18 30 / 0.15);
		color: oklch(0.70 0.18 30);
	}

	/* Edit mode */
	.formula-edit {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.formula-input {
		flex: 1;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.55 0.15 145 / 0.4);
		border-radius: 0.375rem;
		padding: 0.375rem 0.625rem;
		font-family: monospace;
		font-size: 0.8125rem;
		color: oklch(0.85 0.05 145);
		outline: none;
		transition: border-color 0.15s;
	}

	.formula-input:focus {
		border-color: oklch(0.65 0.15 145);
		box-shadow: 0 0 0 2px oklch(0.55 0.15 145 / 0.15);
	}

	.formula-input::placeholder {
		color: oklch(0.40 0.02 250);
	}

	/* Empty state */
	.formula-empty {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* Result display */
	.formula-result {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.formula-value {
		font-size: 1.125rem;
		font-weight: 600;
		color: oklch(0.90 0.02 250);
		font-variant-numeric: tabular-nums;
	}

	.formula-name {
		font-size: 0.6875rem;
		color: oklch(0.45 0.02 250);
	}

	/* Error state */
	.formula-error {
		position: relative;
	}

	.error-text {
		font-size: 0.8125rem;
		font-weight: 600;
		font-family: monospace;
		color: oklch(0.70 0.18 30);
	}

	.error-tooltip {
		display: none;
		position: absolute;
		left: 0;
		top: 100%;
		margin-top: 4px;
		padding: 0.375rem 0.625rem;
		background: oklch(0.22 0.02 250);
		border: 1px solid oklch(0.55 0.18 30 / 0.3);
		border-radius: 0.375rem;
		font-size: 0.6875rem;
		font-family: monospace;
		color: oklch(0.75 0.12 30);
		white-space: nowrap;
		z-index: 10;
		box-shadow: 0 4px 12px oklch(0 0 0 / 0.3);
	}

	.formula-error:hover .error-tooltip {
		display: block;
	}

	/* Expression subtitle */
	.formula-expression {
		margin-top: 0.25rem;
		padding-left: 30px; /* align with value after = badge */
	}

	.formula-expression code {
		font-size: 0.6875rem;
		color: oklch(0.45 0.05 145);
		font-family: monospace;
	}
</style>
