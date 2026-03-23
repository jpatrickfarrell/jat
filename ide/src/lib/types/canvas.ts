/**
 * Canvas/Base block types for JAT's block-based interactive documents.
 *
 * All knowledge bases are now block-based documents stored in the unified
 * `bases` table in .jat/data.db. Each base contains an ordered array of
 * typed blocks: text, table_view, control, formula, divider, and action.
 */

// ---------------------------------------------------------------------------
// Block types
// ---------------------------------------------------------------------------

export const CANVAS_BLOCK_TYPES = [
	'text',
	'table_view',
	'control',
	'formula',
	'divider',
	'action',
] as const;

export type CanvasBlockType = (typeof CANVAS_BLOCK_TYPES)[number];

// ---------------------------------------------------------------------------
// Control types
// ---------------------------------------------------------------------------

export const CONTROL_TYPES = [
	'select',
	'slider',
	'date',
	'text_input',
	'checkbox',
] as const;

export type ControlType = (typeof CONTROL_TYPES)[number];

// ---------------------------------------------------------------------------
// Control config interfaces
// ---------------------------------------------------------------------------

export interface SelectControlConfig {
	sourceTable?: string;
	displayColumn?: string;
	staticOptions?: string[];
	multiSelect?: boolean;
}

export interface SliderControlConfig {
	min: number;
	max: number;
	step: number;
}

export interface DateControlConfig {
	range?: boolean;
}

export interface TextInputControlConfig {
	placeholder?: string;
}

export interface CheckboxControlConfig {
	label?: string;
}

export type ControlConfig =
	| SelectControlConfig
	| SliderControlConfig
	| DateControlConfig
	| TextInputControlConfig
	| CheckboxControlConfig;

// ---------------------------------------------------------------------------
// Block interfaces
// ---------------------------------------------------------------------------

export interface TextBlock {
	type: 'text';
	id: string;
	content: string;
}

export interface TableViewBlock {
	type: 'table_view';
	id: string;
	tableName: string;
	viewId?: string;
	controlFilters: Record<string, string>; // column → controlName
	visibleColumns?: string[];
	sort?: {
		column: string;
		direction: 'ASC' | 'DESC';
	};
}

export interface ControlBlock {
	type: 'control';
	id: string;
	name: string; // formula variable name (unique within page)
	controlType: ControlType;
	config: ControlConfig;
	value: unknown;
}

export interface FormulaBlock {
	type: 'formula';
	id: string;
	expression: string;
	name?: string; // optional name for referencing in other formulas
}

export interface DividerBlock {
	type: 'divider';
	id: string;
}

export type ActionBlockStyle = 'primary' | 'secondary' | 'danger' | 'success';

export interface ActionBlock {
	type: 'action';
	id: string;
	label: string;
	icon?: string;
	actionType: string;
	actionConfig: Record<string, unknown>;
	confirmBeforeRun?: boolean;
	style?: ActionBlockStyle;
}

// ---------------------------------------------------------------------------
// Action result (returned by action executors)
// ---------------------------------------------------------------------------

export interface ActionResult {
	success: boolean;
	message?: string;
	data?: unknown;
	rowsAffected?: number;
}

// ---------------------------------------------------------------------------
// Union type
// ---------------------------------------------------------------------------

export type CanvasBlock =
	| TextBlock
	| TableViewBlock
	| ControlBlock
	| FormulaBlock
	| DividerBlock
	| ActionBlock;

// ---------------------------------------------------------------------------
// Canvas page (now an alias for a base record with parsed blocks)
// ---------------------------------------------------------------------------

export interface CanvasPage {
	id: string;
	name: string;
	project: string;
	blocks: CanvasBlock[];
	description?: string | null;
	always_inject?: boolean;
	source_config?: Record<string, unknown>;
	token_estimate?: number | null;
	created_at: string;
	updated_at: string;
}
