/**
 * Semantic column types for JAT data tables.
 *
 * Each semantic type maps to a SQLite storage type and optionally carries
 * a JSON `config` blob with type-specific settings (enum options, currency
 * symbols, date formats, etc.).
 */

// ---------------------------------------------------------------------------
// Semantic type enum
// ---------------------------------------------------------------------------

export const SEMANTIC_TYPES = [
	'text',
	'number',
	'boolean',
	'date',
	'datetime',
	'url',
	'email',
	'enum',
	'currency',
	'percentage',
	'relation',
	'formula',
] as const;

export type SemanticType = (typeof SEMANTIC_TYPES)[number];

// ---------------------------------------------------------------------------
// SQLite mapping — used by createDataTable to pick the real column type
// ---------------------------------------------------------------------------

export const SEMANTIC_TO_SQLITE: Record<SemanticType, string> = {
	text: 'TEXT',
	number: 'REAL',
	boolean: 'INTEGER',
	date: 'TEXT',
	datetime: 'TEXT',
	url: 'TEXT',
	email: 'TEXT',
	enum: 'TEXT',
	currency: 'REAL',
	percentage: 'REAL',
	relation: 'TEXT',
	formula: 'TEXT', // virtual — never stored, but needs a column for schema
};

// ---------------------------------------------------------------------------
// Type-specific config interfaces
// ---------------------------------------------------------------------------

export interface EnumOption {
	value: string;
	label?: string;
	color?: string; // oklch or DaisyUI badge class
}

export interface EnumConfig {
	options: EnumOption[];
	allowCustom?: boolean;
}

export interface CurrencyConfig {
	symbol?: string; // e.g. "$", "€", "£" — default "$"
	decimals?: number; // default 2
	position?: 'before' | 'after'; // default "before"
}

export interface DateConfig {
	format?: 'iso' | 'short' | 'long' | 'relative'; // default "short"
}

export interface PercentageConfig {
	decimals?: number; // default 0
	showBar?: boolean; // render an inline progress bar
}

export interface RelationConfig {
	targetTable: string;
	displayColumn: string;
	multiSelect?: boolean;
}

export interface FormulaConfig {
	expression: string;
	outputType: SemanticType;
	outputConfig?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Conditional formatting — table-level rules (Coda-style)
// ---------------------------------------------------------------------------

/** Operators for comparing cell values in conditions */
export const FORMAT_OPERATORS = [
	'>', '>=', '<', '<=', '==', '!=',
	'contains', 'not_contains', 'starts_with', 'ends_with',
	'is_empty', 'is_not_empty',
	'between',
] as const;

export type FormatOperator = (typeof FORMAT_OPERATORS)[number];

/** A single condition that checks a column's value */
export interface FormatCondition {
	column: string;
	operator: FormatOperator;
	value?: string;       // comparison value (not needed for is_empty/is_not_empty)
	value2?: string;      // second value for 'between'
}

/** Text formatting flags */
export interface TextFormatting {
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	strikethrough?: boolean;
}

/** A single conditional format rule */
export interface ConditionalFormatRule {
	id: string;
	conditions: FormatCondition[];   // AND'd together
	textColor?: string;              // oklch color string
	backgroundColor?: string;        // oklch color string
	formatting?: TextFormatting;
	applyTo: 'all_columns' | string[]; // which columns get styled
	enabled: boolean;
}

/** Color scale rule — gradient across numeric range */
export interface ColorStop {
	position: number; // 0-100 (percentage of range)
	color: string;    // oklch color string
}

export interface ColorScaleRule {
	id: string;
	type: 'color_scale';
	column: string;           // which column's values drive the gradient
	colorStops: ColorStop[];
	rangeMode: 'auto' | 'manual';
	manualMin?: number;
	manualMax?: number;
	applyTo: 'value_column' | string[]; // 'value_column' = same column
	enabled: boolean;
}

/** Table-level conditional format config stored via _columns with reserved name */
export interface TableConditionalFormat {
	rules: ConditionalFormatRule[];
	colorScales: ColorScaleRule[];
}

/** Preset color palettes for the color picker grid */
export const FORMAT_COLOR_PALETTE = {
	text: [
		// Row 1: pure hues
		'oklch(0.55 0.22 28)',   // red
		'oklch(0.60 0.20 50)',   // orange
		'oklch(0.75 0.18 90)',   // yellow
		'oklch(0.55 0.20 145)',  // green
		'oklch(0.55 0.15 200)',  // teal
		'oklch(0.55 0.18 250)',  // blue
		'oklch(0.55 0.18 290)',  // purple
		'oklch(0.55 0.15 330)',  // pink
		// Row 2: lighter
		'oklch(0.70 0.18 28)',
		'oklch(0.75 0.16 50)',
		'oklch(0.85 0.14 90)',
		'oklch(0.70 0.16 145)',
		'oklch(0.70 0.12 200)',
		'oklch(0.70 0.14 250)',
		'oklch(0.70 0.14 290)',
		'oklch(0.70 0.12 330)',
		// Row 3: darker
		'oklch(0.40 0.16 28)',
		'oklch(0.45 0.14 50)',
		'oklch(0.55 0.12 90)',
		'oklch(0.40 0.14 145)',
		'oklch(0.40 0.10 200)',
		'oklch(0.40 0.12 250)',
		'oklch(0.40 0.12 290)',
		'oklch(0.40 0.10 330)',
		// Row 4: neutrals
		'oklch(0.99 0.00 0)',    // white
		'oklch(0.85 0.00 0)',    // light gray
		'oklch(0.65 0.00 0)',    // gray
		'oklch(0.45 0.00 0)',    // dark gray
		'oklch(0.30 0.00 0)',    // charcoal
		'oklch(0.15 0.00 0)',    // near-black
		'oklch(0.80 0.05 90)',   // warm gray
		'oklch(0.80 0.05 250)',  // cool gray
	],
	background: [
		// Row 1: vivid backgrounds
		'oklch(0.55 0.22 28)',
		'oklch(0.65 0.20 50)',
		'oklch(0.80 0.18 90)',
		'oklch(0.52 0.17 145)',
		'oklch(0.55 0.15 200)',
		'oklch(0.50 0.18 250)',
		'oklch(0.50 0.18 290)',
		'oklch(0.55 0.15 330)',
		// Row 2: medium
		'oklch(0.65 0.16 28)',
		'oklch(0.72 0.15 50)',
		'oklch(0.85 0.12 90)',
		'oklch(0.65 0.13 145)',
		'oklch(0.65 0.10 200)',
		'oklch(0.62 0.14 250)',
		'oklch(0.62 0.14 290)',
		'oklch(0.65 0.10 330)',
		// Row 3: pastel/subtle
		'oklch(0.80 0.08 28)',
		'oklch(0.85 0.08 50)',
		'oklch(0.92 0.06 90)',
		'oklch(0.80 0.06 145)',
		'oklch(0.80 0.05 200)',
		'oklch(0.80 0.07 250)',
		'oklch(0.80 0.07 290)',
		'oklch(0.80 0.05 330)',
		// Row 4: neutrals
		'oklch(0.99 0.00 0)',
		'oklch(0.90 0.00 0)',
		'oklch(0.75 0.00 0)',
		'oklch(0.55 0.00 0)',
		'oklch(0.35 0.00 0)',
		'oklch(0.18 0.00 0)',
		'oklch(0.88 0.04 90)',
		'oklch(0.88 0.04 250)',
	],
};

/** Preset color scale definitions */
export const COLOR_SCALE_PRESETS: Record<string, { label: string; description: string; colorStops: ColorStop[] }> = {
	'green-yellow-red': {
		label: 'Green → Yellow → Red',
		description: 'Low = good (green), high = bad (red)',
		colorStops: [
			{ position: 0, color: 'oklch(0.52 0.17 145)' },
			{ position: 50, color: 'oklch(0.80 0.18 90)' },
			{ position: 100, color: 'oklch(0.55 0.22 28)' },
		],
	},
	'red-yellow-green': {
		label: 'Red → Yellow → Green',
		description: 'Low = bad (red), high = good (green)',
		colorStops: [
			{ position: 0, color: 'oklch(0.55 0.22 28)' },
			{ position: 50, color: 'oklch(0.80 0.18 90)' },
			{ position: 100, color: 'oklch(0.52 0.17 145)' },
		],
	},
	'white-blue': {
		label: 'White → Blue',
		description: 'Intensity scale from white to blue',
		colorStops: [
			{ position: 0, color: 'oklch(0.95 0.01 250)' },
			{ position: 100, color: 'oklch(0.50 0.20 250)' },
		],
	},
	'yellow-black': {
		label: 'Yellow → Black',
		description: 'Bright yellow to dark',
		colorStops: [
			{ position: 0, color: 'oklch(0.20 0.02 90)' },
			{ position: 100, color: 'oklch(0.88 0.18 90)' },
		],
	},
};

/** Union of all possible config shapes — stored as JSON in _columns.config */
export type ColumnConfig =
	| EnumConfig
	| CurrencyConfig
	| DateConfig
	| PercentageConfig
	| RelationConfig
	| FormulaConfig
	| Record<string, unknown>;

// ---------------------------------------------------------------------------
// Column metadata row (matches _columns table)
// ---------------------------------------------------------------------------

export interface ColumnMeta {
	table_name: string;
	column_name: string;
	semantic_type: SemanticType;
	config: ColumnConfig;
	display_name: string | null;
	description: string | null;
	created_at: string;
	updated_at: string;
}

// ---------------------------------------------------------------------------
// Extended schema info returned by getTableSchema (PRAGMA + _columns merge)
// ---------------------------------------------------------------------------

export interface ColumnSchema {
	cid: number;
	name: string;
	type: string; // SQLite type
	notnull: number;
	dflt_value: string | null;
	pk: number;
	// Semantic metadata (undefined if no _columns row)
	semanticType?: SemanticType;
	config?: ColumnConfig;
	displayName?: string;
	columnDescription?: string;
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

export interface SemanticTypeInfo {
	type: SemanticType;
	label: string;
	sqliteType: string;
	icon: string;
	group: 'basic' | 'rich' | 'advanced';
}

export const SEMANTIC_TYPE_INFO: SemanticTypeInfo[] = [
	{ type: 'text', label: 'Text', sqliteType: 'TEXT', icon: 'Aa', group: 'basic' },
	{ type: 'number', label: 'Number', sqliteType: 'REAL', icon: '#', group: 'basic' },
	{ type: 'boolean', label: 'Checkbox', sqliteType: 'INTEGER', icon: '☑', group: 'basic' },
	{ type: 'date', label: 'Date', sqliteType: 'TEXT', icon: '📅', group: 'basic' },
	{ type: 'datetime', label: 'Date & Time', sqliteType: 'TEXT', icon: '🕐', group: 'basic' },
	{ type: 'url', label: 'URL', sqliteType: 'TEXT', icon: '🔗', group: 'rich' },
	{ type: 'email', label: 'Email', sqliteType: 'TEXT', icon: '✉', group: 'rich' },
	{ type: 'enum', label: 'Select', sqliteType: 'TEXT', icon: '▾', group: 'rich' },
	{ type: 'currency', label: 'Currency', sqliteType: 'REAL', icon: '$', group: 'rich' },
	{ type: 'percentage', label: 'Percent', sqliteType: 'REAL', icon: '%', group: 'rich' },
	{ type: 'relation', label: 'Relation', sqliteType: 'TEXT', icon: '⇢', group: 'advanced' },
	{ type: 'formula', label: 'Formula', sqliteType: 'TEXT', icon: 'ƒx', group: 'advanced' },
];
