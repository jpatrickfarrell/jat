/**
 * Configuration Types
 *
 * Type definitions for slash commands, project configuration, and related settings
 * used throughout the dashboard.
 *
 * @see commands/jat/ for slash command implementations
 * @see ~/.config/jat/projects.json for project configuration
 */

// =============================================================================
// SLASH COMMAND TYPES
// =============================================================================

/**
 * Frontmatter metadata from a slash command file.
 *
 * Slash commands can include YAML frontmatter with metadata:
 * ```md
 * ---
 * description: Start working on a task
 * author: jat
 * version: 1.0.0
 * tags: workflow, agent
 * ---
 * ```
 */
export interface CommandFrontmatter {
	/** Brief description of what the command does */
	description?: string;
	/** Author of the command */
	author?: string;
	/** Semantic version (e.g., "1.0.0") */
	version?: string;
	/** Comma-separated or array of tags for categorization */
	tags?: string | string[];
}

/**
 * A slash command definition.
 *
 * Slash commands are markdown files in `commands/` directories that
 * can be invoked via `/namespace:name` syntax.
 *
 * @example
 * ```typescript
 * const command: SlashCommand = {
 *   name: 'start',
 *   invocation: '/jat:start',
 *   namespace: 'jat',
 *   path: '~/code/jat/commands/jat/start.md',
 *   content: '# /jat:start - Begin Working\n...',
 *   frontmatter: {
 *     description: 'Start working on a task',
 *     tags: ['workflow', 'agent']
 *   }
 * };
 * ```
 */
export interface SlashCommand {
	/** Command name without namespace (e.g., "start", "complete") */
	name: string;
	/** Full invocation string (e.g., "/jat:start", "/jat:complete") */
	invocation: string;
	/** Namespace/category (e.g., "jat", "git") */
	namespace: string;
	/** Absolute path to the command file */
	path: string;
	/** Full content of the command file (optional, loaded on demand) */
	content?: string;
	/** Parsed frontmatter metadata (optional) */
	frontmatter?: CommandFrontmatter;
}

/**
 * A group of related slash commands.
 *
 * Commands are grouped by namespace for organization in the UI.
 *
 * @example
 * ```typescript
 * const group: CommandGroup = {
 *   namespace: 'jat',
 *   commands: [
 *     { name: 'start', invocation: '/jat:start', ... },
 *     { name: 'complete', invocation: '/jat:complete', ... }
 *   ],
 *   isExpanded: true
 * };
 * ```
 */
export interface CommandGroup {
	/** Namespace name (e.g., "jat", "git") */
	namespace: string;
	/** Commands in this group */
	commands: SlashCommand[];
	/** Whether this group is expanded in the UI */
	isExpanded: boolean;
}

// =============================================================================
// PROJECT CONFIGURATION TYPES
// =============================================================================

/**
 * Color configuration for a project.
 *
 * Used for visual distinction in the dashboard.
 */
export interface ProjectColors {
	/** Color when project is active/running */
	active?: string;
	/** Color when project is inactive/stopped */
	inactive?: string;
}

/**
 * Project configuration from ~/.config/jat/projects.json.
 *
 * Defines how a project appears and behaves in the dashboard.
 *
 * @example
 * ```typescript
 * const project: ProjectConfig = {
 *   name: 'JAT',
 *   path: '~/code/jat',
 *   port: 5174,
 *   server_path: '~/code/jat/dashboard',
 *   description: 'Jomarchy Agent Tools dashboard',
 *   colors: {
 *     active: 'oklch(0.75 0.15 145)',
 *     inactive: 'oklch(0.55 0.10 145)'
 *   },
 *   hidden: false
 * };
 * ```
 */
export interface ProjectConfig {
	/** Display name for the project (e.g., "JAT", "Chimaro") */
	name: string;
	/** Absolute path to the project directory */
	path: string;
	/** Dev server port (optional, enables server controls) */
	port?: number;
	/** Path where `npm run dev` should be executed (optional, defaults to path) */
	server_path?: string;
	/** Brief description shown in dashboard (optional) */
	description?: string;
	/** Color configuration for badges and highlights (optional) */
	colors?: ProjectColors;
	/** Database URL for database tools (optional) */
	database_url?: string;
	/** Whether to hide this project from default views (optional) */
	hidden?: boolean;
}

// =============================================================================
// CONFIGURATION FILE TYPES
// =============================================================================

/**
 * Root structure of ~/.config/jat/projects.json.
 *
 * @example
 * ```json
 * {
 *   "projects": {
 *     "jat": {
 *       "name": "JAT",
 *       "path": "~/code/jat",
 *       "port": 5174
 *     },
 *     "chimaro": {
 *       "name": "Chimaro",
 *       "path": "~/code/chimaro",
 *       "port": 5173
 *     }
 *   }
 * }
 * ```
 */
export interface ProjectsConfigFile {
	/** Map of project slug to configuration */
	projects: Record<string, ProjectConfig>;
}
