<script lang="ts">
	/**
	 * ConditionalFormatPanel — Coda-style conditional formatting rule editor
	 *
	 * Table-level rules with conditions, colors, text formatting, and column targeting.
	 * Also supports color scale (gradient) rules for numeric columns.
	 */
	import type {
		TableConditionalFormat,
		ConditionalFormatRule,
		ColorScaleRule,
		FormatCondition,
		FormatOperator,
		TextFormatting,
		ColorStop,
	} from '$lib/types/dataTable';
	import { FORMAT_COLOR_PALETTE, FORMAT_OPERATORS, COLOR_SCALE_PRESETS } from '$lib/types/dataTable';

	let {
		format = $bindable<TableConditionalFormat>({ rules: [], colorScales: [] }),
		columns = [] as { name: string; type: string }[],
		onSave,
		onClose,
		onPreview,
	}: {
		format: TableConditionalFormat;
		columns: { name: string; type: string }[];
		onSave: (f: TableConditionalFormat) => void;
		onClose: () => void;
		onPreview?: (f: TableConditionalFormat) => void;
	} = $props();

	// Local working copy
	let rules = $state<ConditionalFormatRule[]>([...(format.rules || [])]);
	let colorScales = $state<ColorScaleRule[]>([...(format.colorScales || [])]);

	// Editing state
	let editingRuleId = $state<string | null>(null);
	let activeTab = $state<'rules' | 'color-scales'>('rules');

	// Color picker state
	let showTextColorPicker = $state(false);
	let showBgColorPicker = $state(false);

	// Live preview: emit current state to parent on every change
	function emitPreview() {
		onPreview?.({ rules, colorScales });
	}

	function genId(): string {
		return Math.random().toString(36).slice(2, 9);
	}

	// ── Rule CRUD ──────────────────────────────────────────────────

	// Default background colors for new rules (cycle through)
	const DEFAULT_BG_COLORS = [
		'oklch(0.80 0.08 28)',   // pastel red
		'oklch(0.85 0.08 50)',   // pastel orange
		'oklch(0.92 0.06 90)',   // pastel yellow
		'oklch(0.80 0.06 145)',  // pastel green
		'oklch(0.80 0.07 250)',  // pastel blue
		'oklch(0.80 0.07 290)',  // pastel purple
	];

	function addRule() {
		const bgColor = DEFAULT_BG_COLORS[rules.length % DEFAULT_BG_COLORS.length];
		const newRule: ConditionalFormatRule = {
			id: genId(),
			conditions: [{ column: columns[0]?.name || '', operator: '>', value: '' }],
			backgroundColor: bgColor,
			applyTo: 'all_columns',
			enabled: true,
		};
		rules = [...rules, newRule];
		editingRuleId = newRule.id;
		emitPreview();
	}

	function removeRule(id: string) {
		rules = rules.filter(r => r.id !== id);
		if (editingRuleId === id) editingRuleId = null;
		emitPreview();
	}

	function duplicateRule(rule: ConditionalFormatRule) {
		const clone: ConditionalFormatRule = {
			...JSON.parse(JSON.stringify(rule)),
			id: genId(),
		};
		rules = [...rules, clone];
		editingRuleId = clone.id;
		emitPreview();
	}

	function toggleRule(id: string) {
		rules = rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
		emitPreview();
	}

	function moveRule(id: string, dir: -1 | 1) {
		const idx = rules.findIndex(r => r.id === id);
		if (idx < 0) return;
		const newIdx = idx + dir;
		if (newIdx < 0 || newIdx >= rules.length) return;
		const arr = [...rules];
		[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
		rules = arr;
		emitPreview();
	}

	// ── Condition helpers ──────────────────────────────────────────

	function addCondition(ruleId: string) {
		rules = rules.map(r => {
			if (r.id !== ruleId) return r;
			return {
				...r,
				conditions: [...r.conditions, { column: columns[0]?.name || '', operator: '>' as FormatOperator, value: '' }],
			};
		});
		emitPreview();
	}

	function removeCondition(ruleId: string, condIdx: number) {
		rules = rules.map(r => {
			if (r.id !== ruleId) return r;
			return { ...r, conditions: r.conditions.filter((_, i) => i !== condIdx) };
		});
		emitPreview();
	}

	function updateCondition(ruleId: string, condIdx: number, patch: Partial<FormatCondition>) {
		rules = rules.map(r => {
			if (r.id !== ruleId) return r;
			const conditions = r.conditions.map((c, i) => i === condIdx ? { ...c, ...patch } : c);
			return { ...r, conditions };
		});
		emitPreview();
	}

	// ── Style helpers ──────────────────────────────────────────────

	function setRuleColor(ruleId: string, field: 'textColor' | 'backgroundColor', color: string | undefined) {
		rules = rules.map(r => r.id === ruleId ? { ...r, [field]: color } : r);
		emitPreview();
	}

	function toggleFormatting(ruleId: string, key: keyof TextFormatting) {
		rules = rules.map(r => {
			if (r.id !== ruleId) return r;
			const formatting = { ...(r.formatting || {}) };
			formatting[key] = !formatting[key];
			return { ...r, formatting };
		});
		emitPreview();
	}

	function setApplyTo(ruleId: string, value: 'all_columns' | string[]) {
		rules = rules.map(r => r.id === ruleId ? { ...r, applyTo: value } : r);
		emitPreview();
	}

	// ── Color scale CRUD ───────────────────────────────────────────

	function addColorScale(presetKey?: string) {
		const preset = presetKey ? COLOR_SCALE_PRESETS[presetKey] : null;
		const numericCols = columns.filter(c => ['REAL', 'INTEGER', 'number', 'currency', 'percentage'].some(t => c.type.toUpperCase().includes(t.toUpperCase())));
		const newScale: ColorScaleRule = {
			id: genId(),
			type: 'color_scale',
			column: numericCols[0]?.name || columns[0]?.name || '',
			colorStops: preset?.colorStops ? [...preset.colorStops.map(s => ({ ...s }))] : [
				{ position: 0, color: 'oklch(0.52 0.17 145)' },
				{ position: 100, color: 'oklch(0.55 0.22 28)' },
			],
			rangeMode: 'auto',
			applyTo: 'value_column',
			enabled: true,
		};
		colorScales = [...colorScales, newScale];
		emitPreview();
	}

	function removeColorScale(id: string) {
		colorScales = colorScales.filter(s => s.id !== id);
		emitPreview();
	}

	function toggleColorScale(id: string) {
		colorScales = colorScales.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
		emitPreview();
	}

	function updateColorScale(id: string, patch: Partial<ColorScaleRule>) {
		colorScales = colorScales.map(s => s.id === id ? { ...s, ...patch } : s);
		emitPreview();
	}

	// ── Operators ──────────────────────────────────────────────────

	const OPERATOR_LABELS: Record<string, string> = {
		'>': 'greater than',
		'>=': 'greater or equal',
		'<': 'less than',
		'<=': 'less or equal',
		'==': 'equals',
		'!=': 'not equals',
		'contains': 'contains',
		'not_contains': 'does not contain',
		'starts_with': 'starts with',
		'ends_with': 'ends with',
		'is_empty': 'is empty',
		'is_not_empty': 'is not empty',
		'between': 'between',
	};

	const NO_VALUE_OPS: FormatOperator[] = ['is_empty', 'is_not_empty'];

	// ── Save / Cancel ──────────────────────────────────────────────

	function handleSave() {
		onSave({ rules, colorScales });
	}

	function handleCancel() {
		onClose();
	}

	// Helper to get rule being edited
	const editingRule = $derived(editingRuleId ? rules.find(r => r.id === editingRuleId) : null);
</script>

<div class="cf-panel">
	<div class="cf-header">
		<h3>Conditional Formatting</h3>
		<button class="cf-close-btn" onclick={handleCancel} title="Close">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>

	<!-- Tabs -->
	<div class="cf-tabs">
		<button class="cf-tab" class:cf-tab-active={activeTab === 'rules'} onclick={() => activeTab = 'rules'}>
			Rules ({rules.length})
		</button>
		<button class="cf-tab" class:cf-tab-active={activeTab === 'color-scales'} onclick={() => activeTab = 'color-scales'}>
			Color Scales ({colorScales.length})
		</button>
	</div>

	<div class="cf-body">
		{#if activeTab === 'rules'}
			<!-- Rule list -->
			{#if rules.length === 0}
				<div class="cf-empty">
					<p>No rules yet. Add a rule to apply conditional formatting.</p>
				</div>
			{/if}

			{#each rules as rule, idx (rule.id)}
				<div class="cf-rule" class:cf-rule-disabled={!rule.enabled} class:cf-rule-editing={editingRuleId === rule.id}>
					<div class="cf-rule-header">
						<label class="cf-rule-toggle">
							<input type="checkbox" checked={rule.enabled} onchange={() => toggleRule(rule.id)} />
						</label>
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="cf-rule-summary" onclick={() => editingRuleId = editingRuleId === rule.id ? null : rule.id}>
							<span class="cf-rule-preview">
								{#if rule.backgroundColor}
									<span class="cf-color-dot" style="background: {rule.backgroundColor}"></span>
								{/if}
								{#if rule.textColor}
									<span class="cf-color-dot cf-color-dot-text" style="background: {rule.textColor}"></span>
								{/if}
								{#if rule.formatting?.bold}<strong>B</strong>{/if}
								{#if rule.formatting?.italic}<em>I</em>{/if}
								{#if rule.formatting?.underline}<u>U</u>{/if}
								{#if rule.formatting?.strikethrough}<s>S</s>{/if}
							</span>
							<span class="cf-rule-label">
								{#if rule.conditions.length > 0}
									{rule.conditions.map(c => `${c.column} ${OPERATOR_LABELS[c.operator] || c.operator}${NO_VALUE_OPS.includes(c.operator) ? '' : ` ${c.value || '?'}`}`).join(' AND ')}
								{:else}
									(no conditions)
								{/if}
							</span>
						</div>
						<div class="cf-rule-actions">
							<button class="cf-icon-btn" onclick={() => moveRule(rule.id, -1)} disabled={idx === 0} title="Move up">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/></svg>
							</button>
							<button class="cf-icon-btn" onclick={() => moveRule(rule.id, 1)} disabled={idx === rules.length - 1} title="Move down">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
							</button>
							<button class="cf-icon-btn" onclick={() => duplicateRule(rule)} title="Duplicate">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
							</button>
							<button class="cf-icon-btn cf-icon-btn-danger" onclick={() => removeRule(rule.id)} title="Delete">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
							</button>
						</div>
					</div>

					{#if editingRuleId === rule.id}
						<div class="cf-rule-editor">
							<!-- Conditions -->
							<div class="cf-section">
								<div class="cf-section-label">Conditions (all must match)</div>
								{#each rule.conditions as cond, ci}
									<div class="cf-condition-row">
										<select class="cf-select" value={cond.column} onchange={(e) => updateCondition(rule.id, ci, { column: e.currentTarget.value })}>
											{#each columns as col}
												<option value={col.name}>{col.name}</option>
											{/each}
										</select>
										<select class="cf-select" value={cond.operator} onchange={(e) => updateCondition(rule.id, ci, { operator: e.currentTarget.value as FormatOperator })}>
											{#each FORMAT_OPERATORS as op}
												<option value={op}>{OPERATOR_LABELS[op] || op}</option>
											{/each}
										</select>
										{#if !NO_VALUE_OPS.includes(cond.operator)}
											<input
												class="cf-input"
												type="text"
												value={cond.value || ''}
												placeholder="value"
												oninput={(e) => updateCondition(rule.id, ci, { value: e.currentTarget.value })}
											/>
										{/if}
										{#if cond.operator === 'between'}
											<span class="cf-and">and</span>
											<input
												class="cf-input"
												type="text"
												value={cond.value2 || ''}
												placeholder="value2"
												oninput={(e) => updateCondition(rule.id, ci, { value2: e.currentTarget.value })}
											/>
										{/if}
										<button class="cf-icon-btn cf-icon-btn-danger" onclick={() => removeCondition(rule.id, ci)} title="Remove condition">
											<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
										</button>
									</div>
								{/each}
								<button class="cf-add-btn" onclick={() => addCondition(rule.id)}>+ Add condition</button>
							</div>

							<!-- Styling -->
							<div class="cf-section">
								<div class="cf-section-label">Style</div>
								<div class="cf-style-row">
									<!-- Text color -->
									<div class="cf-color-control">
										<span class="cf-color-label">Text</span>
										<button
											class="cf-color-swatch"
											style="background: {rule.textColor || 'transparent'}; {!rule.textColor ? 'border: 1px dashed oklch(0.5 0 0)' : ''}"
											onclick={() => { showTextColorPicker = !showTextColorPicker; showBgColorPicker = false; }}
											title="Text color"
										></button>
										{#if rule.textColor}
											<button class="cf-clear-btn" onclick={() => setRuleColor(rule.id, 'textColor', undefined)}>x</button>
										{/if}
										{#if showTextColorPicker && editingRuleId === rule.id}
											<div class="cf-color-grid">
												{#each FORMAT_COLOR_PALETTE.text as color}
													<button
														class="cf-color-cell"
														class:cf-color-cell-selected={rule.textColor === color}
														style="background: {color}"
														onclick={() => { setRuleColor(rule.id, 'textColor', color); showTextColorPicker = false; }}
													></button>
												{/each}
											</div>
										{/if}
									</div>

									<!-- Background color -->
									<div class="cf-color-control">
										<span class="cf-color-label">Fill</span>
										<button
											class="cf-color-swatch"
											style="background: {rule.backgroundColor || 'transparent'}; {!rule.backgroundColor ? 'border: 1px dashed oklch(0.5 0 0)' : ''}"
											onclick={() => { showBgColorPicker = !showBgColorPicker; showTextColorPicker = false; }}
											title="Background color"
										></button>
										{#if rule.backgroundColor}
											<button class="cf-clear-btn" onclick={() => setRuleColor(rule.id, 'backgroundColor', undefined)}>x</button>
										{/if}
										{#if showBgColorPicker && editingRuleId === rule.id}
											<div class="cf-color-grid">
												{#each FORMAT_COLOR_PALETTE.background as color}
													<button
														class="cf-color-cell"
														class:cf-color-cell-selected={rule.backgroundColor === color}
														style="background: {color}"
														onclick={() => { setRuleColor(rule.id, 'backgroundColor', color); showBgColorPicker = false; }}
													></button>
												{/each}
											</div>
										{/if}
									</div>

									<!-- Text formatting -->
									<div class="cf-format-toggles">
										<button class="cf-fmt-btn" class:cf-fmt-active={rule.formatting?.bold} onclick={() => toggleFormatting(rule.id, 'bold')} title="Bold">
											<strong>B</strong>
										</button>
										<button class="cf-fmt-btn" class:cf-fmt-active={rule.formatting?.italic} onclick={() => toggleFormatting(rule.id, 'italic')} title="Italic">
											<em>I</em>
										</button>
										<button class="cf-fmt-btn" class:cf-fmt-active={rule.formatting?.underline} onclick={() => toggleFormatting(rule.id, 'underline')} title="Underline">
											<u>U</u>
										</button>
										<button class="cf-fmt-btn" class:cf-fmt-active={rule.formatting?.strikethrough} onclick={() => toggleFormatting(rule.id, 'strikethrough')} title="Strikethrough">
											<s>S</s>
										</button>
									</div>
								</div>
							</div>

							<!-- Apply To -->
							<div class="cf-section">
								<div class="cf-section-label">Apply to</div>
								<div class="cf-apply-to">
									<label class="cf-radio">
										<input type="radio" name="applyTo-{rule.id}" checked={rule.applyTo === 'all_columns'} onchange={() => setApplyTo(rule.id, 'all_columns')} />
										All columns
									</label>
									<label class="cf-radio">
										<input type="radio" name="applyTo-{rule.id}" checked={Array.isArray(rule.applyTo)} onchange={() => setApplyTo(rule.id, [])} />
										Specific columns
									</label>
									{#if Array.isArray(rule.applyTo)}
										<div class="cf-col-checkboxes">
											{#each columns as col}
												<label class="cf-checkbox">
													<input
														type="checkbox"
														checked={rule.applyTo.includes(col.name)}
														onchange={(e) => {
															const current = Array.isArray(rule.applyTo) ? rule.applyTo : [];
															if (e.currentTarget.checked) {
																setApplyTo(rule.id, [...current, col.name]);
															} else {
																setApplyTo(rule.id, current.filter(c => c !== col.name));
															}
														}}
													/>
													{col.name}
												</label>
											{/each}
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/each}

			<button class="cf-add-rule-btn" onclick={addRule}>+ Add Rule</button>

		{:else}
			<!-- Color Scales tab -->
			{#if colorScales.length === 0}
				<div class="cf-empty">
					<p>No color scales. Add one to color cells by numeric value.</p>
				</div>
			{/if}

			{#each colorScales as scale (scale.id)}
				<div class="cf-rule" class:cf-rule-disabled={!scale.enabled}>
					<div class="cf-rule-header">
						<label class="cf-rule-toggle">
							<input type="checkbox" checked={scale.enabled} onchange={() => toggleColorScale(scale.id)} />
						</label>
						<div class="cf-rule-summary">
							<span class="cf-scale-preview">
								{#each scale.colorStops as stop}
									<span class="cf-color-dot" style="background: {stop.color}"></span>
								{/each}
							</span>
							<span class="cf-rule-label">{scale.column}</span>
						</div>
						<div class="cf-rule-actions">
							<button class="cf-icon-btn cf-icon-btn-danger" onclick={() => removeColorScale(scale.id)} title="Delete">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
							</button>
						</div>
					</div>
					<div class="cf-scale-editor">
						<div class="cf-condition-row">
							<label class="cf-color-label">Column</label>
							<select class="cf-select" value={scale.column} onchange={(e) => updateColorScale(scale.id, { column: e.currentTarget.value })}>
								{#each columns as col}
									<option value={col.name}>{col.name}</option>
								{/each}
							</select>
						</div>
						<div class="cf-condition-row">
							<label class="cf-color-label">Range</label>
							<select class="cf-select" value={scale.rangeMode} onchange={(e) => updateColorScale(scale.id, { rangeMode: e.currentTarget.value as 'auto' | 'manual' })}>
								<option value="auto">Auto (min/max from data)</option>
								<option value="manual">Manual</option>
							</select>
							{#if scale.rangeMode === 'manual'}
								<input class="cf-input cf-input-sm" type="number" value={scale.manualMin ?? ''} placeholder="Min" oninput={(e) => updateColorScale(scale.id, { manualMin: parseFloat(e.currentTarget.value) || undefined })} />
								<input class="cf-input cf-input-sm" type="number" value={scale.manualMax ?? ''} placeholder="Max" oninput={(e) => updateColorScale(scale.id, { manualMax: parseFloat(e.currentTarget.value) || undefined })} />
							{/if}
						</div>
						<div class="cf-condition-row">
							<label class="cf-color-label">Apply to</label>
							<select class="cf-select" value={scale.applyTo === 'value_column' ? 'value_column' : 'specific'} onchange={(e) => updateColorScale(scale.id, { applyTo: e.currentTarget.value === 'value_column' ? 'value_column' : [] })}>
								<option value="value_column">Same column</option>
								<option value="specific">Specific columns</option>
							</select>
						</div>
						{#if Array.isArray(scale.applyTo)}
							<div class="cf-col-checkboxes">
								{#each columns as col}
									<label class="cf-checkbox">
										<input
											type="checkbox"
											checked={scale.applyTo.includes(col.name)}
											onchange={(e) => {
												const current = Array.isArray(scale.applyTo) ? scale.applyTo : [];
												if (e.currentTarget.checked) {
													updateColorScale(scale.id, { applyTo: [...current, col.name] });
												} else {
													updateColorScale(scale.id, { applyTo: current.filter(c => c !== col.name) });
												}
											}}
										/>
										{col.name}
									</label>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/each}

			<!-- Preset buttons -->
			<div class="cf-scale-presets">
				<span class="cf-section-label">Add preset:</span>
				{#each Object.entries(COLOR_SCALE_PRESETS) as [key, preset]}
					<button class="cf-preset-btn" onclick={() => addColorScale(key)} title={preset.description}>
						<span class="cf-preset-preview">
							{#each preset.colorStops as stop}
								<span class="cf-color-dot" style="background: {stop.color}"></span>
							{/each}
						</span>
						{preset.label}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Footer -->
	<div class="cf-footer">
		<button class="cf-btn cf-btn-secondary" onclick={handleCancel}>Cancel</button>
		<button class="cf-btn cf-btn-primary" onclick={handleSave}>Save</button>
	</div>
</div>

<style>
	.cf-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: oklch(0.16 0.01 250);
		border-left: 1px solid oklch(0.25 0.02 250);
		color: oklch(0.85 0.02 250);
		font-size: 0.8125rem;
	}

	.cf-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 0.75rem;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.cf-header h3 {
		font-size: 0.875rem;
		font-weight: 600;
		margin: 0;
	}

	.cf-close-btn {
		background: none;
		border: none;
		color: oklch(0.6 0.02 250);
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 0.25rem;
	}

	.cf-close-btn:hover {
		background: oklch(0.25 0.02 250);
		color: oklch(0.85 0.02 250);
	}

	.cf-tabs {
		display: flex;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.cf-tab {
		flex: 1;
		padding: 0.5rem;
		background: none;
		border: none;
		color: oklch(0.6 0.02 250);
		cursor: pointer;
		font-size: 0.75rem;
		font-weight: 500;
		border-bottom: 2px solid transparent;
		transition: all 0.15s;
	}

	.cf-tab:hover {
		color: oklch(0.8 0.02 250);
		background: oklch(0.20 0.01 250);
	}

	.cf-tab-active {
		color: oklch(0.85 0.12 200);
		border-bottom-color: oklch(0.65 0.15 200);
	}

	.cf-body {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem;
	}

	.cf-empty {
		padding: 1rem;
		text-align: center;
		color: oklch(0.5 0.02 250);
		font-size: 0.75rem;
	}

	/* Rule card */
	.cf-rule {
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.375rem;
		margin-bottom: 0.375rem;
		overflow: hidden;
	}

	.cf-rule-disabled {
		opacity: 0.5;
	}

	.cf-rule-editing {
		border-color: oklch(0.55 0.15 200);
	}

	.cf-rule-header {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.5rem;
		background: oklch(0.19 0.01 250);
	}

	.cf-rule-toggle input {
		cursor: pointer;
	}

	.cf-rule-summary {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.375rem;
		cursor: pointer;
		min-width: 0;
	}

	.cf-rule-preview {
		display: flex;
		align-items: center;
		gap: 0.125rem;
		font-size: 0.6875rem;
	}

	.cf-color-dot {
		width: 12px;
		height: 12px;
		border-radius: 2px;
		display: inline-block;
		border: 1px solid oklch(0.35 0.02 250);
	}

	.cf-color-dot-text {
		border-radius: 50%;
	}

	.cf-rule-label {
		flex: 1;
		font-size: 0.6875rem;
		color: oklch(0.7 0.02 250);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.cf-rule-actions {
		display: flex;
		gap: 0.125rem;
	}

	.cf-icon-btn {
		background: none;
		border: none;
		color: oklch(0.5 0.02 250);
		cursor: pointer;
		padding: 0.2rem;
		border-radius: 0.25rem;
		display: flex;
		align-items: center;
	}

	.cf-icon-btn:hover {
		background: oklch(0.25 0.02 250);
		color: oklch(0.8 0.02 250);
	}

	.cf-icon-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.cf-icon-btn-danger:hover {
		color: oklch(0.7 0.18 28);
		background: oklch(0.25 0.05 28);
	}

	/* Rule editor */
	.cf-rule-editor {
		padding: 0.5rem;
		background: oklch(0.17 0.01 250);
		border-top: 1px solid oklch(0.25 0.02 250);
	}

	.cf-section {
		margin-bottom: 0.5rem;
	}

	.cf-section-label {
		font-size: 0.6875rem;
		font-weight: 600;
		color: oklch(0.6 0.02 250);
		margin-bottom: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.cf-condition-row {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-bottom: 0.25rem;
		flex-wrap: wrap;
	}

	.cf-select {
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.85 0.02 250);
		padding: 0.25rem 0.375rem;
		font-size: 0.75rem;
		cursor: pointer;
	}

	.cf-select:focus {
		outline: none;
		border-color: oklch(0.55 0.15 200);
	}

	.cf-input {
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.85 0.02 250);
		padding: 0.25rem 0.375rem;
		font-size: 0.75rem;
		width: 5rem;
	}

	.cf-input:focus {
		outline: none;
		border-color: oklch(0.55 0.15 200);
	}

	.cf-input-sm {
		width: 3.5rem;
	}

	.cf-and {
		font-size: 0.6875rem;
		color: oklch(0.5 0.02 250);
	}

	.cf-add-btn {
		background: none;
		border: none;
		color: oklch(0.65 0.12 200);
		cursor: pointer;
		font-size: 0.6875rem;
		padding: 0.125rem 0;
	}

	.cf-add-btn:hover {
		color: oklch(0.80 0.15 200);
	}

	/* Style controls */
	.cf-style-row {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.cf-color-control {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.cf-color-label {
		font-size: 0.6875rem;
		color: oklch(0.6 0.02 250);
		min-width: 2rem;
	}

	.cf-color-swatch {
		width: 20px;
		height: 20px;
		border-radius: 0.25rem;
		border: 1px solid oklch(0.35 0.02 250);
		cursor: pointer;
		padding: 0;
	}

	.cf-color-swatch:hover {
		border-color: oklch(0.55 0.15 200);
	}

	.cf-clear-btn {
		background: none;
		border: none;
		color: oklch(0.5 0.02 250);
		cursor: pointer;
		font-size: 0.625rem;
		padding: 0 0.125rem;
	}

	.cf-clear-btn:hover {
		color: oklch(0.7 0.18 28);
	}

	.cf-color-grid {
		position: absolute;
		top: 100%;
		left: 0;
		z-index: 50;
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: 2px;
		padding: 0.375rem;
		background: oklch(0.20 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.375rem;
		box-shadow: 0 4px 12px oklch(0 0 0 / 0.4);
		margin-top: 0.25rem;
	}

	.cf-color-cell {
		width: 20px;
		height: 20px;
		border-radius: 2px;
		border: 1px solid oklch(0.25 0.02 250);
		cursor: pointer;
		padding: 0;
		transition: transform 0.1s;
	}

	.cf-color-cell:hover {
		transform: scale(1.2);
		border-color: oklch(0.7 0.02 250);
		z-index: 1;
	}

	.cf-color-cell-selected {
		border: 2px solid oklch(0.85 0.02 250);
		box-shadow: 0 0 0 1px oklch(0.15 0.01 250);
	}

	/* Format toggles */
	.cf-format-toggles {
		display: flex;
		gap: 1px;
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.25rem;
		overflow: hidden;
	}

	.cf-fmt-btn {
		background: oklch(0.19 0.01 250);
		border: none;
		color: oklch(0.6 0.02 250);
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		min-width: 1.75rem;
		text-align: center;
	}

	.cf-fmt-btn:hover {
		background: oklch(0.25 0.02 250);
	}

	.cf-fmt-active {
		background: oklch(0.35 0.10 200);
		color: oklch(0.90 0.05 200);
	}

	/* Apply to */
	.cf-apply-to {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.cf-radio, .cf-checkbox {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
		color: oklch(0.75 0.02 250);
		cursor: pointer;
	}

	.cf-col-checkboxes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.75rem;
		padding-left: 1.25rem;
	}

	/* Scale editor */
	.cf-scale-editor {
		padding: 0.5rem;
		background: oklch(0.17 0.01 250);
		border-top: 1px solid oklch(0.25 0.02 250);
	}

	.cf-scale-preview {
		display: flex;
		gap: 0.125rem;
	}

	.cf-scale-presets {
		margin-top: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.cf-preset-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: oklch(0.19 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.75 0.02 250);
		cursor: pointer;
		padding: 0.375rem 0.5rem;
		font-size: 0.6875rem;
		transition: all 0.15s;
	}

	.cf-preset-btn:hover {
		background: oklch(0.25 0.02 250);
		border-color: oklch(0.35 0.02 250);
	}

	.cf-preset-preview {
		display: flex;
		gap: 0.125rem;
	}

	/* Add rule button */
	.cf-add-rule-btn {
		width: 100%;
		padding: 0.5rem;
		background: oklch(0.19 0.01 250);
		border: 1px dashed oklch(0.35 0.02 250);
		border-radius: 0.375rem;
		color: oklch(0.65 0.12 200);
		cursor: pointer;
		font-size: 0.75rem;
		transition: all 0.15s;
	}

	.cf-add-rule-btn:hover {
		background: oklch(0.22 0.02 250);
		border-color: oklch(0.55 0.12 200);
	}

	/* Footer */
	.cf-footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-top: 1px solid oklch(0.25 0.02 250);
		background: oklch(0.18 0.01 250);
	}

	.cf-btn {
		padding: 0.375rem 0.75rem;
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		border: 1px solid transparent;
		transition: all 0.15s;
	}

	.cf-btn-secondary {
		background: oklch(0.22 0.02 250);
		color: oklch(0.75 0.02 250);
		border-color: oklch(0.30 0.02 250);
	}

	.cf-btn-secondary:hover {
		background: oklch(0.28 0.02 250);
	}

	.cf-btn-primary {
		background: oklch(0.50 0.15 200);
		color: oklch(0.95 0.02 200);
	}

	.cf-btn-primary:hover {
		background: oklch(0.55 0.17 200);
	}
</style>
