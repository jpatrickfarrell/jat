<script lang="ts">
	import type { FormulaConfig, SemanticType } from '$lib/types/dataTable';
	import { evaluateFormula, Duration, isDuration } from '$lib/utils/formulaEval';

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
	const isDateResult = $derived(computed instanceof Date && !isNaN(computed.getTime()));
	const isDurationResult = $derived(isDuration(computed));

	function formatDate(d: Date, outType: SemanticType): string {
		if (outType === 'date') {
			return d.toLocaleDateString();
		}
		if (outType === 'datetime') {
			return d.toLocaleString();
		}
		// Auto-detect: if time is midnight, show date only
		if (d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0) {
			return d.toLocaleDateString();
		}
		return d.toLocaleString();
	}

	function formatDuration(dur: Duration): string {
		const ms = Math.abs(dur._ms);
		const sign = dur._ms < 0 ? '-' : '';
		const days = Math.floor(ms / 86400000);
		const hours = Math.floor((ms % 86400000) / 3600000);
		const mins = Math.floor((ms % 3600000) / 60000);
		if (days > 0) return `${sign}${days}d ${hours}h`;
		if (hours > 0) return `${sign}${hours}h ${mins}m`;
		return `${sign}${mins}m`;
	}

	const display = $derived.by(() => {
		if (computed === null || computed === undefined) return '';
		if (isError) return computed;

		// Date result formatting
		if (isDateResult) {
			const outType: SemanticType = config?.outputType || 'text';
			return formatDate(computed as Date, outType);
		}

		// Duration result formatting
		if (isDurationResult) {
			return formatDuration(computed as Duration);
		}

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

<span
	class="formula-cell"
	class:formula-error={isError}
	class:formula-date={isDateResult || isDurationResult}
	title={isError ? String(computed) : config?.expression || ''}
>
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
	.formula-date {
		color: oklch(0.70 0.12 280);
	}
</style>
