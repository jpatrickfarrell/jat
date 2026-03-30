/**
 * Navigation Configuration
 * Unified config for IDE navigation (replaces page-specific configs)
 *
 * NAVIGATION STRUCTURE (collapsible groups):
 *
 * WORK (daily workflow):
 *   /mobile   - Mobile (mobile-optimized task view)
 *   /tasks    - Tasks (active sessions + open tasks with spawn)
 *   /sessions - Sessions (all tmux sessions: agents, servers, other)
 *   /history  - History (completed task history with streak calendar)
 *
 * CODE (development tools):
 *   /files    - Files (project file browser)
 *   /source   - Source Control (git changes, diff viewer)
 *   /servers  - Servers (project server sessions)
 *
 * KNOWLEDGE (data & context):
 *   /data     - Data (project data tables)
 *   /bases    - Bases (knowledge bases for agent context)
 *   /memory   - Memory (agent persistent memory browser and search)
 *   /search   - Search (unified search across tasks, memory, files)
 *
 * CONFIGURE (system setup):
 *   /integrations - Integrations (external source configuration)
 *   /workflows - Workflows (workflow engine configuration)
 *   /automation - Automation rules configuration
 *   /chores   - Chores (recurring task management, scheduler service controls)
 *   /config   - Config (JAT configuration, includes Projects tab)
 *
 * VIEWS (alternative visualizations):
 *   /dash     - Dash (multi-project sessions view with terminal output)
 *   /graph    - Dependency visualization
 *   /timeline - Historical view
 *   /kanban   - Agent kanban (sessions grouped by activity state)
 *
 * LABS (experimental):
 *   /quick-commands - Commands (single-turn quick commands + templates)
 */

export type NavGroup = 'work' | 'code' | 'knowledge' | 'configure' | 'views' | 'labs';

export interface NavItem {
	id: string; // Unique identifier (e.g., 'dash', 'files', 'servers')
	label: string; // Display text (e.g., 'Work', 'Files', 'Servers')
	href: string; // Navigation target (e.g., '/work', '/files')
	icon: string; // Icon identifier (matches icon SVG paths in Sidebar.svelte)
	category: NavGroup; // Section grouping
}

/**
 * Group display configuration
 * Controls render order, labels, and visual style for each nav group.
 */
export interface NavGroupConfig {
	id: NavGroup;
	label: string;
	style: 'main' | 'views' | 'labs'; // Visual treatment
}

export const NAV_GROUPS: NavGroupConfig[] = [
	{ id: 'work', label: 'Work', style: 'main' },
	{ id: 'code', label: 'Code', style: 'main' },
	{ id: 'knowledge', label: 'Knowledge', style: 'main' },
	{ id: 'configure', label: 'Configure', style: 'main' },
	{ id: 'views', label: 'Views', style: 'views' },
	{ id: 'labs', label: 'Labs', style: 'labs' },
];

export interface UnifiedNavConfig {
	navItems: NavItem[]; // All navigation items (rendered in sidebar)
	showProjectFilter: boolean; // Show project selector dropdown
	showThemeSelector: boolean; // Show theme picker
}

/**
 * Unified Navigation Configuration
 *
 * Defines all navigation items and global nav settings.
 * Sidebar.svelte imports this and renders nav items grouped by category.
 *
 * Icons used: tasks, agents, servers, timeline, columns, graph
 * (Icon SVG paths defined in Sidebar.svelte)
 */
export const unifiedNavConfig: UnifiedNavConfig = {
	navItems: [
		// WORK: Daily workflow
		{
			id: 'mobile',
			label: 'Mobile',
			href: '/mobile',
			icon: 'mobile',
			category: 'work'
		},
		{
			id: 'mobilenew',
			label: 'Mobile New',
			href: '/mobilenew',
			icon: 'mobile',
			category: 'work'
		},
		{
			id: 'tasks',
			label: 'Tasks',
			href: '/tasks',
			icon: 'tasks',
			category: 'work'
		},
		{
			id: 'sessions',
			label: 'Sessions',
			href: '/sessions',
			icon: 'tmux',
			category: 'work'
		},
		{
			id: 'history',
			label: 'History',
			href: '/history',
			icon: 'history',
			category: 'work'
		},
		// CODE: Development tools
		{
			id: 'files',
			label: 'Files',
			href: '/files',
			icon: 'files',
			category: 'code'
		},
		{
			id: 'source',
			label: 'Source',
			href: '/source',
			icon: 'source',
			category: 'code'
		},
		{
			id: 'servers',
			label: 'Servers',
			href: '/servers',
			icon: 'servers',
			category: 'code'
		},
		// KNOWLEDGE: Data & context
		{
			id: 'data',
			label: 'Data',
			href: '/data',
			icon: 'data',
			category: 'knowledge'
		},
		{
			id: 'bases',
			label: 'Bases',
			href: '/bases',
			icon: 'bases',
			category: 'knowledge'
		},
		{
			id: 'memory',
			label: 'Memory',
			href: '/memory',
			icon: 'memory',
			category: 'knowledge'
		},
		{
			id: 'search',
			label: 'Search',
			href: '/search',
			icon: 'search',
			category: 'knowledge'
		},
		// CONFIGURE: System setup
		{
			id: 'integrations',
			label: 'Integrations',
			href: '/integrations',
			icon: 'integrations',
			category: 'configure'
		},
		{
			id: 'workflows',
			label: 'Workflows',
			href: '/workflows',
			icon: 'workflows',
			category: 'configure'
		},
		{
			id: 'automation',
			label: 'Automation',
			href: '/automation',
			icon: 'automation',
			category: 'configure'
		},
		{
			id: 'chores',
			label: 'Chores',
			href: '/chores',
			icon: 'chores',
			category: 'configure'
		},
		{
			id: 'config',
			label: 'Config',
			href: '/config',
			icon: 'settings',
			category: 'configure'
		},
		// VIEWS: Alternative visualizations
		{
			id: 'dash',
			label: 'Dash',
			href: '/dash',
			icon: 'dashboard',
			category: 'views'
		},
		{
			id: 'graph',
			label: 'Graph',
			href: '/graph',
			icon: 'graph',
			category: 'views'
		},
		{
			id: 'timeline',
			label: 'Timeline',
			href: '/timeline',
			icon: 'timeline',
			category: 'views'
		},
		{
			id: 'kanban',
			label: 'Kanban',
			href: '/kanban',
			icon: 'columns',
			category: 'views'
		},
		// LABS: Experimental features
		{
			id: 'quick-commands',
			label: 'Commands',
			href: '/quick-commands',
			icon: 'terminal',
			category: 'labs'
		},
	],
	showProjectFilter: true,
	showThemeSelector: true
};
