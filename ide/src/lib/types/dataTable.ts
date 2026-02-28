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
