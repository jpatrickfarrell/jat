<script lang="ts">
	import type { FormulaConfig, SemanticType } from '$lib/types/dataTable';
	import { evaluateFormula } from '$lib/utils/formulaEval';

	let {
		row = {},
		config = {} as FormulaConfig,
	}: {
		row: Record<string, any>;
		config: FormulaConfig;
	} = $props();

	const computed = $derived(
		config?.expression ? evaluateFormula(config.expression, row) : null
	);

	const isError = $derived(typeof computed === 'string' && computed.startsWith('#'));

	const display = $derived.by(() => {
		if (computed === null || computed === undefined) return '';
		if (isError) return computed;

		const outType: SemanticType = config?.outputType || 'text';
		const outCfg = config?.outputConfig || {};

		if (outType === 'currency') {
			const sym = (outCfg as any).symbol || '$';
			const dec = (outCfg as any).decimals ?? 2;
			const pos = (outCfg as any).position || 'before';
			const num = typeof computed === 'number' ? computed.toFixed(dec) : computed;
			return pos === 'before' ? `${sym}${num}` : `${num}${sym}`;
		}

		if (outType === 'percentage') {
			const dec = (outCfg as any).decimals ?? 0;
			const num = typeof computed === 'number' ? computed.toFixed(dec) : computed;
			return `${num}%`;
		}

		if (outType === 'number') {
			if (typeof computed === 'number') {
				// Show clean number (remove trailing zeros from decimals)
				return Number.isInteger(computed) ? String(computed) : computed.toFixed(4).replace(/\.?0+$/, '');
			}
			return String(computed);
		}

		return String(computed);
	});
</script>

<span class="formula-cell" class:formula-error={isError} title={isError ? String(computed) : config?.expression || ''}>
	{display}
</span>

<style>
	.formula-cell {
		color: oklch(0.70 0.10 200);
		font-variant-numeric: tabular-nums;
		cursor: default;
		user-select: text;
	}
	.formula-error {
		color: oklch(0.65 0.18 25);
		font-size: 0.7em;
		font-style: italic;
	}
</style>
