<script lang="ts">
	import type { SemanticType, ColumnConfig, EnumConfig, CurrencyConfig, DateConfig, PercentageConfig, FormulaConfig } from '$lib/types/dataTable';
	import { SEMANTIC_TYPE_INFO } from '$lib/types/dataTable';
	import ColumnTypeSelector from './ColumnTypeSelector.svelte';
	import EnumOptionsEditor from './EnumOptionsEditor.svelte';
	import { validateFormula, extractColumnRefs, evaluateFormula } from '$lib/utils/formulaEval';

	let {
		column,
		semanticType,
		config = {},
		colIndex = 0,
		columns = [],
		sampleRow = null,
		onSave,
		onClose,
	}: {
		column: string;
		semanticType?: SemanticType;
		config?: ColumnConfig;
		colIndex?: number;
		columns?: string[];
		sampleRow?: Record<string, any> | null;
		onSave: (type: SemanticType, config: ColumnConfig) => void;
		onClose: () => void;
	} = $props();

	let selectedType = $state<SemanticType>(semanticType || 'text');
	let editConfig = $state<Record<string, any>>({ ...config });
	let formulaError = $state<string | null>(null);

	// Available columns for formula references (exclude current column)
	const availableColumns = $derived(columns.filter(c => c !== column));

	// Live formula preview: evaluate against sample row
	const formulaPreview = $derived.by(() => {
		if (selectedType !== 'formula') return null;
		const expr = editConfig.expression?.trim();
		if (!expr) return null;
		const err = validateFormula(expr);
		if (err) return { error: true, value: err };
		if (!sampleRow) return { error: false, value: 'No data to preview' as string, muted: true };
		try {
			const result = evaluateFormula(expr, sampleRow);
			if (result === null || result === undefined) return { error: false, value: '(empty)', muted: true };
			const str = String(result);
			if (str.startsWith('#')) return { error: true, value: str };
			return { error: false, value: str };
		} catch {
			return { error: true, value: '#ERR' };
		}
	});

	function handleTypeChange(type: SemanticType) {
		selectedType = type;
		// Reset config for new type
		if (type === 'enum') {
			editConfig = { options: (config as EnumConfig)?.options || [] };
		} else if (type === 'currency') {
			editConfig = { symbol: '$', decimals: 2, position: 'before' };
		} else if (type === 'date' || type === 'datetime') {
			editConfig = { format: 'short' };
		} else if (type === 'percentage') {
			editConfig = { decimals: 0, showBar: false };
		} else if (type === 'formula') {
			editConfig = {
				expression: (config as FormulaConfig)?.expression || '',
				outputType: (config as FormulaConfig)?.outputType || 'number',
				outputConfig: (config as FormulaConfig)?.outputConfig || {},
			};
			formulaError = null;
		} else {
			editConfig = {};
		}
	}

	function insertColumnRef(colName: string) {
		editConfig = { ...editConfig, expression: (editConfig.expression || '') + `{${colName}}` };
		formulaError = null;
	}

	function handleExpressionInput(e: Event) {
		const val = (e.target as HTMLTextAreaElement).value;
		editConfig = { ...editConfig, expression: val };
		if (val.trim()) {
			formulaError = validateFormula(val);
		} else {
			formulaError = null;
		}
	}

	function save() {
		if (selectedType === 'formula') {
			const err = validateFormula(editConfig.expression);
			if (err) {
				formulaError = err;
				return;
			}
		}
		onSave(selectedType, editConfig);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="popover-overlay" onclick={onClose}></div>
<div class="popover" class:popover-left={colIndex <= 1} class:popover-wide={selectedType === 'formula'}>
	<div class="popover-header">
		<span class="popover-title">Column: <code>{column}</code></span>
		<button class="popover-close" onclick={onClose}>×</button>
	</div>

	<div class="popover-body">
		<div class="field">
			<label class="field-label">Type</label>
			<ColumnTypeSelector value={selectedType} onChange={handleTypeChange} />
		</div>

		{#if selectedType === 'enum'}
			<div class="field">
				<label class="field-label">Options</label>
				<EnumOptionsEditor
					options={(editConfig as EnumConfig)?.options || []}
					onChange={(opts) => editConfig = { ...editConfig, options: opts }}
				/>
			</div>
		{/if}

		{#if selectedType === 'currency'}
			<div class="field-row">
				<div class="field">
					<label class="field-label">Symbol</label>
					<input type="text" class="field-input small" bind:value={editConfig.symbol} placeholder="$" />
				</div>
				<div class="field">
					<label class="field-label">Decimals</label>
					<input type="number" class="field-input small" bind:value={editConfig.decimals} min="0" max="6" />
				</div>
				<div class="field">
					<label class="field-label">Position</label>
					<select class="field-input small" bind:value={editConfig.position}>
						<option value="before">Before ($100)</option>
						<option value="after">After (100€)</option>
					</select>
				</div>
			</div>
		{/if}

		{#if selectedType === 'date' || selectedType === 'datetime'}
			<div class="field">
				<label class="field-label">Format</label>
				<select class="field-input" bind:value={editConfig.format}>
					<option value="iso">ISO (2026-02-28)</option>
					<option value="short">Short (Feb 28, 2026)</option>
					<option value="long">Long (February 28, 2026)</option>
					<option value="relative">Relative (2 days ago)</option>
				</select>
			</div>
		{/if}

		{#if selectedType === 'percentage'}
			<div class="field-row">
				<div class="field">
					<label class="field-label">Decimals</label>
					<input type="number" class="field-input small" bind:value={editConfig.decimals} min="0" max="4" />
				</div>
				<div class="field">
					<label class="field-label">
						<input type="checkbox" bind:checked={editConfig.showBar} />
						Show bar
					</label>
				</div>
			</div>
		{/if}

		{#if selectedType === 'formula'}
			<div class="field">
				<label class="field-label">Expression</label>
				<textarea
					class="field-input formula-input"
					class:formula-invalid={formulaError}
					value={editConfig.expression || ''}
					oninput={handleExpressionInput}
					placeholder={'{price} * {quantity}'}
					rows="2"
				></textarea>
				{#if formulaError}
					<span class="formula-error">{formulaError}</span>
				{/if}
				{#if formulaPreview}
					<div class="formula-preview" class:formula-preview-error={formulaPreview.error} class:formula-preview-muted={formulaPreview.muted}>
						<span class="formula-preview-label">Result:</span>
						<span class="formula-preview-value">{formulaPreview.value}</span>
					</div>
				{/if}
			</div>

			{#if availableColumns.length > 0}
				<div class="field">
					<label class="field-label">Insert column</label>
					<div class="column-chips">
						{#each availableColumns as col}
							<button class="column-chip" onclick={() => insertColumnRef(col)} title="Insert {col}">
								{col}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<div class="field">
				<label class="field-label">Output format</label>
				<select class="field-input" bind:value={editConfig.outputType}>
					<option value="number">Number</option>
					<option value="text">Text</option>
					<option value="currency">Currency</option>
					<option value="percentage">Percent</option>
				</select>
			</div>

			{#if editConfig.outputType === 'currency'}
				<div class="field-row">
					<div class="field">
						<label class="field-label">Symbol</label>
						<input type="text" class="field-input small" value={editConfig.outputConfig?.symbol || '$'} oninput={(e) => editConfig = { ...editConfig, outputConfig: { ...editConfig.outputConfig, symbol: (e.target as HTMLInputElement).value } }} />
					</div>
					<div class="field">
						<label class="field-label">Decimals</label>
						<input type="number" class="field-input small" value={editConfig.outputConfig?.decimals ?? 2} min="0" max="6" oninput={(e) => editConfig = { ...editConfig, outputConfig: { ...editConfig.outputConfig, decimals: parseInt((e.target as HTMLInputElement).value) } }} />
					</div>
				</div>
			{/if}

			<div class="formula-help">
				<span class="help-title">Syntax</span>
				<code>{'{column}'}</code> reference &middot; <code>+ - * /</code> math &middot; <code>round()</code> <code>abs()</code> <code>min()</code> <code>max()</code> functions
			</div>
		{/if}
	</div>

	<div class="popover-footer">
		<button class="btn-cancel" onclick={onClose}>Cancel</button>
		<button class="btn-apply" onclick={save}>Apply</button>
	</div>
</div>

<style>
	.popover-overlay {
		position: fixed;
		inset: 0;
		z-index: 39;
	}
	.popover {
		position: absolute;
		top: 100%;
		right: 0;
		z-index: 40;
		min-width: 260px;
		background: oklch(0.18 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.5rem;
		box-shadow: 0 4px 24px oklch(0 0 0 / 0.5);
		margin-top: 0.25rem;
	}
	.popover.popover-left {
		right: auto;
		left: 0;
	}
	.popover.popover-wide {
		min-width: 320px;
	}
	.popover-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}
	.popover-title {
		font-size: 0.75rem;
		font-weight: 600;
		color: oklch(0.70 0.02 250);
	}
	.popover-title code {
		color: oklch(0.80 0.10 200);
	}
	.popover-close {
		background: none;
		border: none;
		color: oklch(0.50 0.02 250);
		cursor: pointer;
		font-size: 1rem;
		padding: 0 0.25rem;
	}
	.popover-close:hover {
		color: oklch(0.80 0.02 250);
	}
	.popover-body {
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.field-row {
		display: flex;
		gap: 0.5rem;
	}
	.field-label {
		font-size: 0.6875rem;
		font-weight: 500;
		color: oklch(0.60 0.02 250);
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}
	.field-input {
		padding: 0.25rem 0.375rem;
		font-size: 0.75rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.1875rem;
		color: oklch(0.85 0.02 250);
		outline: none;
	}
	.field-input:focus {
		border-color: oklch(0.50 0.10 200);
	}
	.field-input.small {
		width: 5rem;
	}
	.formula-input {
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.6875rem;
		resize: vertical;
		min-height: 2.5rem;
	}
	.formula-input.formula-invalid {
		border-color: oklch(0.55 0.18 25);
	}
	.formula-error {
		font-size: 0.625rem;
		color: oklch(0.65 0.18 25);
	}
	.formula-preview {
		display: flex;
		align-items: baseline;
		gap: 0.375rem;
		padding: 0.25rem 0.375rem;
		background: oklch(0.16 0.02 145 / 0.3);
		border: 1px solid oklch(0.35 0.08 145 / 0.4);
		border-radius: 0.25rem;
		font-size: 0.6875rem;
	}
	.formula-preview-label {
		color: oklch(0.55 0.02 250);
		font-size: 0.625rem;
		flex-shrink: 0;
	}
	.formula-preview-value {
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		color: oklch(0.75 0.15 145);
		word-break: break-all;
	}
	.formula-preview-error {
		background: oklch(0.16 0.02 25 / 0.3);
		border-color: oklch(0.35 0.08 25 / 0.4);
	}
	.formula-preview-error .formula-preview-value {
		color: oklch(0.65 0.18 25);
	}
	.formula-preview-muted .formula-preview-value {
		color: oklch(0.50 0.02 250);
		font-style: italic;
	}
	.column-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}
	.column-chip {
		font-size: 0.625rem;
		padding: 0.125rem 0.375rem;
		background: oklch(0.22 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.70 0.10 200);
		cursor: pointer;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
	}
	.column-chip:hover {
		background: oklch(0.28 0.04 200);
		border-color: oklch(0.40 0.08 200);
	}
	.formula-help {
		font-size: 0.5625rem;
		color: oklch(0.50 0.02 250);
		line-height: 1.4;
	}
	.formula-help .help-title {
		font-weight: 600;
		color: oklch(0.55 0.02 250);
	}
	.formula-help code {
		font-size: 0.5625rem;
		color: oklch(0.65 0.08 200);
		background: oklch(0.20 0.01 250);
		padding: 0 0.1875rem;
		border-radius: 0.125rem;
	}
	.popover-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		border-top: 1px solid oklch(0.25 0.02 250);
	}
	.btn-cancel {
		font-size: 0.6875rem;
		padding: 0.25rem 0.5rem;
		background: none;
		border: 1px solid oklch(0.30 0.02 250);
		color: oklch(0.65 0.02 250);
		border-radius: 0.25rem;
		cursor: pointer;
	}
	.btn-cancel:hover {
		background: oklch(0.22 0.01 250);
	}
	.btn-apply {
		font-size: 0.6875rem;
		padding: 0.25rem 0.5rem;
		background: oklch(0.40 0.12 200);
		border: 1px solid oklch(0.50 0.14 200);
		color: oklch(0.95 0.02 200);
		border-radius: 0.25rem;
		cursor: pointer;
	}
	.btn-apply:hover {
		background: oklch(0.45 0.14 200);
	}
</style>
