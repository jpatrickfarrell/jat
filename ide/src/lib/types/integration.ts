/**
 * TypeScript type definitions for the JAT Integration / Ingest Adapter system.
 *
 * These types formalize the contract defined in tools/ingest/adapters/base.js
 * and provide type safety for the IDE's integration APIs.
 *
 * Plugin authors: see tools/ingest/adapters/base.d.ts for the companion
 * declaration file you can import directly in TypeScript adapter projects.
 */

// ─── Config Field Types ──────────────────────────────────────────────────────

export type ConfigFieldType = 'string' | 'number' | 'boolean' | 'secret' | 'select' | 'multiselect';

/**
 * A field descriptor for source-specific configuration.
 * These drive dynamic form rendering in the IDE's IngestWizard.
 */
export interface ConfigField {
	key: string;
	label: string;
	type: ConfigFieldType;
	required?: boolean;
	default?: unknown;
	options?: Array<{ value: string; label: string }>;
	placeholder?: string;
	helpText?: string;
}

// ─── Item Field Types ────────────────────────────────────────────────────────

export type ItemFieldType = 'string' | 'enum' | 'number' | 'boolean';

/**
 * A field descriptor for filterable properties on ingested items.
 * Declared by the plugin, used by the filter engine and filter UI.
 */
export interface ItemField {
	key: string;
	label: string;
	type: ItemFieldType;
	values?: string[];
}

// ─── Filter Types ────────────────────────────────────────────────────────────

export type FilterOperator =
	| 'equals'
	| 'not_equals'
	| 'contains'
	| 'starts_with'
	| 'ends_with'
	| 'regex'
	| 'gt'
	| 'gte'
	| 'lt'
	| 'lte'
	| 'in'
	| 'not_in';

export interface FilterCondition {
	field: string;
	operator: FilterOperator;
	value: unknown;
}

// ─── Plugin Metadata ─────────────────────────────────────────────────────────

/**
 * Capability flags declared in plugin metadata or detected from adapter class.
 */
export interface PluginCapabilities {
	realtime?: boolean;
	send?: boolean;
	threads?: boolean;
}

/**
 * Plugin metadata. Every plugin must export this as `metadata`.
 */
export interface PluginMetadata {
	type: string;
	name: string;
	description: string;
	version: string;
	author?: string;
	configFields: ConfigField[];
	itemFields: ItemField[];
	defaultFilter?: FilterCondition[];
	capabilities?: PluginCapabilities;
	icon?: PluginIcon;
}

/**
 * Icon definition for plugin display in the IDE.
 */
export interface PluginIcon {
	svg: string;
	viewBox: string;
	fill?: boolean;
	color?: string;
}

// ─── Item Types ──────────────────────────────────────────────────────────────

export interface Attachment {
	url: string;
	type?: string;
	filename?: string;
	localPath?: string;
}

/**
 * An ingested item returned by poll().
 */
export interface IngestItem {
	id: string;
	title: string;
	description: string;
	hash: string;
	author?: string;
	timestamp: string;
	attachments?: Attachment[];
	fields?: Record<string, string | number | boolean>;
	replyTo?: string;
}

// ─── Adapter Result Types ────────────────────────────────────────────────────

export interface PollResult {
	items: IngestItem[];
	state: Record<string, unknown>;
}

export interface ValidateResult {
	valid: boolean;
	error?: string;
}

export interface TestResult {
	ok: boolean;
	message: string;
	sampleItems?: IngestItem[];
}

// ─── Realtime Types ──────────────────────────────────────────────────────────

export interface RealtimeCallbacks {
	onMessage: (item: IngestItem) => void;
	onError: (err: Error) => void;
	onDisconnect: (reason: string) => void;
}

export interface SendTarget {
	channelId?: string;
	threadId?: string;
	userId?: string;
}

export interface OutboundMessage {
	text: string;
	attachments?: Attachment[];
	metadata?: Record<string, unknown>;
}

// ─── Base Adapter Interface ──────────────────────────────────────────────────

/**
 * Abstract interface for all ingest adapters.
 *
 * Every adapter must implement poll() and test().
 * Realtime adapters override supportsRealtime, connect(), and disconnect().
 * Two-way adapters override supportsSend and send().
 */
export interface BaseAdapterInterface {
	readonly type: string;

	// ── Required Methods ──────────────────────────────────────────────────

	/** Poll for new items from the source. */
	poll(
		sourceConfig: Record<string, unknown>,
		adapterState: Record<string, unknown>,
		getSecret: (name: string) => string
	): Promise<PollResult>;

	/** Test the connection by making a real request and returning sample items. */
	test(
		sourceConfig: Record<string, unknown>,
		getSecret: (name: string) => string
	): Promise<TestResult>;

	// ── Optional Methods ──────────────────────────────────────────────────

	/** Validate source configuration without making network calls. */
	validate(sourceConfig: Record<string, unknown>): ValidateResult;

	/** Poll for replies to tracked threads. */
	pollReplies(
		source: Record<string, unknown>,
		threads: unknown[],
		getSecret: (name: string) => string
	): Promise<unknown[]>;

	// ── Realtime Interface ────────────────────────────────────────────────

	/** Whether this adapter supports persistent realtime connections. */
	readonly supportsRealtime: boolean;

	/** Whether this adapter can send outbound messages. */
	readonly supportsSend: boolean;

	/** Establish a persistent realtime connection. */
	connect(
		sourceConfig: Record<string, unknown>,
		getSecret: (name: string) => string,
		callbacks: RealtimeCallbacks
	): Promise<void>;

	/** Tear down the realtime connection. */
	disconnect(): Promise<void>;

	/** Send an outbound message through this adapter. */
	send(
		target: SendTarget,
		message: OutboundMessage,
		getSecret: (name: string) => string
	): Promise<{ messageId?: string } | void>;
}

// ─── Callback & Actions Types ───────────────────────────────────────────────

/**
 * Callback configuration for bidirectional integration communication.
 * When present on a source, JAT can push status updates back to the integration.
 */
export interface IntegrationCallback {
	/** Webhook endpoint URL */
	url: string;
	/** jat-secret key name for the shared secret */
	secretName: string;
	/** Which events trigger callbacks */
	events: string[];
	/** Maps JAT status → integration status values */
	statusMapping: Record<string, string>;
	/** Target table name sent in webhook payload */
	referenceTable: string;
	/** Dot-path to extract the source record ID from task metadata (e.g., "metadata.supabase_row_id") */
	referenceIdFrom: string;
}

/**
 * An action that can be triggered from the Integration tab in TaskDetailPane.
 */
export interface IntegrationAction {
	/** Unique action identifier */
	id: string;
	/** Button label */
	label: string;
	/** Tooltip / description text */
	description?: string;
	/** Action type: callback fires webhook, link opens URL, command runs CLI */
	type: 'callback' | 'link' | 'command';
	/** Which event to fire (for callback type) */
	event?: string;
	/** URL template with {referenceId}, {taskId}, {projectUrl} placeholders (for link type) */
	urlTemplate?: string;
	/** If set, show confirm dialog before executing */
	confirmMessage?: string;
	/** Lucide icon name for the button */
	icon?: string;
	/** Condition controlling when the action is visible (e.g., "task.status === 'closed'") */
	visibleWhen?: string;
}

/**
 * A single callback log entry stored in .jat/callback-log/{task-id}.jsonl.
 */
export interface CallbackLogEntry {
	timestamp: string;
	event: string;
	url: string;
	status: number;
	response?: Record<string, unknown>;
	duration_ms: number;
	error?: string;
}

// ─── IDE-Specific Types ──────────────────────────────────────────────────────

/**
 * Plugin information as returned by the available plugins API.
 * Extends metadata with runtime/discovery information.
 */
export interface PluginInfo {
	type: string;
	name: string;
	description: string;
	version: string;
	path: string;
	isBuiltin: boolean;
	enabled: boolean;
	error?: string;
	configFields?: ConfigField[];
	itemFields?: ItemField[];
	defaultFilter?: FilterCondition[];
	icon?: PluginIcon;
	capabilities?: PluginCapabilities;
}

/**
 * A configured integration source (stored in ~/.config/jat/integrations.json).
 */
export interface IntegrationSource {
	id: string;
	type: string;
	enabled: boolean;
	project: string;
	pollInterval: number;
	connectionMode?: 'poll' | 'realtime';
	taskDefaults: {
		type: string;
		priority: number;
		labels: string[];
	};
	filter?: FilterCondition[];
	// Type-specific fields (Slack, Telegram, RSS, Gmail, etc.)
	feedUrl?: string;
	secretName?: string;
	channel?: string;
	includeBots?: boolean;
	trackReplies?: boolean;
	maxTrackedThreads?: number;
	chatId?: string;
	imapUser?: string;
	folder?: string;
	filterFrom?: string;
	filterSubject?: string;
	markAsRead?: boolean;
	command?: string;
	/** Optional callback config for bidirectional communication */
	callback?: IntegrationCallback;
	/** Optional actions rendered in the Integration tab */
	actions?: IntegrationAction[];
	[key: string]: unknown;
}

/**
 * The integrations config file structure.
 */
export interface IntegrationsConfig {
	version: number;
	sources: IntegrationSource[];
}
