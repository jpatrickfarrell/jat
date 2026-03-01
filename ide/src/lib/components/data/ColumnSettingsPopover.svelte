<script lang="ts">
	import type { SemanticType, ColumnConfig, EnumConfig, CurrencyConfig, DateConfig, PercentageConfig } from '$lib/types/dataTable';
	import ColumnTypeSelector from './ColumnTypeSelector.svelte';
	import EnumOptionsEditor from './EnumOptionsEditor.svelte';

	let {
		column,
		semanticType,
		config = {},
		colIndex = 0,
		onSave,
		onClose,
	}: {
		column: string;
		semanticType?: SemanticType;
		config?: ColumnConfig;
		colIndex?: number;
		onSave: (type: SemanticType, config: ColumnConfig) => void;
		onClose: () => void;
	} = $props();

	let selectedType = $state<SemanticType>(semanticType || 'text');
	let editConfig = $state<Record<string, any>>({ ...config });

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
		} else {
			editConfig = {};
		}
	}

	function save() {
		onSave(selectedType, editConfig);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="popover-overlay" onclick={onClose}></div>
<div class="popover" class:popover-left={colIndex <= 1}>
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
