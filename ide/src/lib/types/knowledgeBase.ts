/**
 * Knowledge Base types for JAT.
 *
 * A knowledge base is a named unit of context that can be attached to tasks
 * and injected into agent prompts at spawn time. Sources include hand-written
 * content (manual), SQL views over data.db tables (data_table), conversation
 * transcripts (conversation), and cached external content (external).
 */

// ---------------------------------------------------------------------------
// Source type enum
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
}

/** Config for conversation sources — stores channel/person identifiers */
export interface ConversationSourceConfig {
	channel?: string;
	person?: string;
	platform?: string;
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
// Base record (matches bases table)
// ---------------------------------------------------------------------------

export interface KnowledgeBase {
	id: string;
	name: string;
	description: string | null;
	source_type: SourceType;
	content: string | null;
	context_query: string | null;
	source_config: SourceConfig;
	always_inject: boolean;
	token_estimate: number | null;
	created_at: string;
	updated_at: string;
	/** Marked true for global bases loaded from ~/.config/jat/bases/ */
	_global?: boolean;
	/** Marked true for system bases (CLAUDE.md, AGENTS.md) auto-detected from project */
	_system?: boolean;
	/** For system bases: the file path relative to project root */
	_systemPath?: string;
	/** Marked true for canvas-based knowledge bases */
	_canvas?: boolean;
	/** Canvas page ID for canvas bases */
	_canvasPageId?: string;
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
	source_type: SourceType;
	content?: string;
	context_query?: string;
	source_config?: SourceConfig;
	always_inject?: boolean;
	token_estimate?: number;
}

export interface UpdateBaseInput {
	name?: string;
	description?: string;
	source_type?: SourceType;
	content?: string;
	context_query?: string;
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
	{
		type: 'canvas' as SourceType,
		label: 'Canvas',
		icon: '🎨',
		description: 'Canvas page flagged as a knowledge base',
	},
];
