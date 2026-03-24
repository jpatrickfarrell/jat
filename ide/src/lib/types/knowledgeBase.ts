/**
 * Knowledge Base types for JAT.
 *
 * A knowledge base is a block-based document stored in .jat/data.db.
 * Every base contains an ordered array of typed blocks (text, table_view,
 * control, formula, divider, action). Legacy source types (manual, data_table,
 * conversation, external) are inferred from blocks and source_config for
 * backward compatibility.
 */

import type { CanvasBlock } from './canvas.js';

// ---------------------------------------------------------------------------
// Source type enum (legacy — inferred from blocks/source_config)
// ---------------------------------------------------------------------------

export const SOURCE_TYPES = [
	'manual',
	'data_table',
	'conversation',
	'external',
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

// ---------------------------------------------------------------------------
// Source-specific config interfaces
// ---------------------------------------------------------------------------

/** Config for data_table sources — stores the table name and SQL query */
export interface DataTableSourceConfig {
	tableName: string;
	projectPath?: string;
	_migrated_source_type?: 'data_table';
}

/** Config for conversation sources — stores channel/person identifiers */
export interface ConversationSourceConfig {
	channel?: string;
	person?: string;
	platform?: string;
	_migrated_source_type?: 'conversation';
}

/** Config for external sources — stores URL, schedule, and cache metadata */
export interface ExternalSourceConfig {
	url?: string;
	source_subtype?: 'url' | 'coda' | 'gsheet';
	fetchedAt?: string;
	ttlSeconds?: number;
	refresh_cron?: string;
	next_refresh_at?: string;
	last_error?: string;
	_migrated_source_type?: 'external';
	/** Coda-specific fields */
	coda_doc_id?: string;
	coda_table_id?: string;
	/** Google Sheets-specific fields */
	gsheet_id?: string;
	gsheet_range?: string;
}

/** Union of all source config shapes — stored as JSON in bases.source_config */
export type SourceConfig =
	| DataTableSourceConfig
	| ConversationSourceConfig
	| ExternalSourceConfig
	| Record<string, unknown>;

// ---------------------------------------------------------------------------
// Base record (matches bases table in data.db)
// ---------------------------------------------------------------------------

export interface KnowledgeBase {
	id: string;
	name: string;
	description: string | null;
	project: string | null;
	/** Block-based content — the canonical storage format */
	blocks: CanvasBlock[];
	/** Source config with optional _migrated_source_type for backward compat */
	source_config: SourceConfig;
	always_inject: boolean;
	token_estimate: number | null;
	/** Emoji icon for visual identification */
	icon: string | null;
	/** Sort order for manual reordering (lower = first) */
	sort_order: number;
	created_at: string;
	updated_at: string;

	// --- Backward-compatible fields (synthesized by parseBaseRow) ---
	/** Legacy source type — inferred from blocks and source_config */
	source_type?: SourceType;
	/** Legacy content — extracted from text blocks */
	content?: string | null;
	/** Legacy context_query — extracted from source_config or table_view blocks */
	context_query?: string | null;

	/** Marked true for global bases loaded from ~/.config/jat/bases/ */
	_global?: boolean;
	/** Marked true for system bases (CLAUDE.md, AGENTS.md) auto-detected from project */
	_system?: boolean;
	/** For system bases: the file path relative to project root */
	_systemPath?: string;
}

// ---------------------------------------------------------------------------
// Task-base attachment (matches task_bases table)
// ---------------------------------------------------------------------------

export interface TaskBase {
	task_id: string;
	base_id: string;
	attached_at: string;
}

// ---------------------------------------------------------------------------
// Create/Update input types
// ---------------------------------------------------------------------------

export interface CreateBaseInput {
	name: string;
	description?: string;
	/** Legacy source_type — used for backward-compatible creation */
	source_type?: SourceType;
	/** Legacy content — converted to text block internally */
	content?: string;
	/** Legacy context_query — stored in source_config */
	context_query?: string;
	/** Direct block-based creation */
	blocks?: CanvasBlock[];
	source_config?: SourceConfig;
	always_inject?: boolean;
	token_estimate?: number;
}

export interface UpdateBaseInput {
	name?: string;
	description?: string;
	/** Legacy source_type — used for backward-compatible updates */
	source_type?: SourceType;
	/** Legacy content — updates the text block internally */
	content?: string;
	/** Legacy context_query — stored in source_config */
	context_query?: string;
	/** Direct block-based update */
	blocks?: CanvasBlock[];
	source_config?: SourceConfig;
	always_inject?: boolean;
	token_estimate?: number;
}

// ---------------------------------------------------------------------------
// Rendered output
// ---------------------------------------------------------------------------

export interface RenderedBase {
	id: string;
	name: string;
	source_type: SourceType;
	content: string;
	token_estimate: number;
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

export interface SourceTypeInfo {
	type: SourceType;
	label: string;
	icon: string;
	description: string;
}

export const SOURCE_TYPE_INFO: SourceTypeInfo[] = [
	{
		type: 'manual',
		label: 'Manual',
		icon: '📝',
		description: 'Hand-written content (markdown, text, instructions)',
	},
	{
		type: 'data_table',
		label: 'Data Table',
		icon: '📊',
		description: 'SQL query over a /data table',
	},
	{
		type: 'conversation',
		label: 'Conversation',
		icon: '💬',
		description: 'Conversation transcript (Telegram, Slack, etc.)',
	},
	{
		type: 'external',
		label: 'External',
		icon: '🌐',
		description: 'Cached content from an external URL or API',
	},
];
