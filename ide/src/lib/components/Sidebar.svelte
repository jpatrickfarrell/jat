<script lang="ts">
	/**
	 * Sidebar Component - Vertical navigation using DaisyUI drawer sidebar pattern
	 *
	 * Features:
	 * - Vertical nav menu with 5 main routes (List, Dependency, Timeline, Kanban, Agents)
	 * - Active state highlighting based on current route
	 * - Icon + label layout with tooltips when collapsed
	 * - Responsive: push sidebar at all screen sizes, width controlled by sidebarState
	 * - Bottom utilities: Help button, Theme selector
	 * - Smooth transitions between collapsed/open states
	 *
	 * Usage: Place as first child of flex h-screen container in root layout
	 *
	 * Collapsible Sidebar:
	 * - Uses isSidebarCollapsed store for desktop collapse state
	 * - When collapsed: narrow width (w-14), shows tooltips on hover
	 * - When expanded: full width (w-64), shows labels
	 * - Toggle via hamburger button in TopBar
	 */

	import { page } from '$app/stores';
	import { unifiedNavConfig, NAV_GROUPS, type NavGroup } from '$lib/config/navConfig';
	import { isSidebarCollapsed, sidebarState, sidebarHelpOpen, gitChangesCount, activeSessionsCount, runningServersCount, activeAgentSessionsCount, fileChangesCount, submittedTasksCount, navFlashRoute } from '$lib/stores/drawerStore';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { getCollapsedNavGroups, toggleCollapsedNavGroup, isNavGroupCollapsed, getDebugMode } from '$lib/stores/preferences.svelte';

	// Respect prefers-reduced-motion for panel transitions
	const reducedMotion = typeof window !== 'undefined'
		? window.matchMedia('(prefers-reduced-motion: reduce)').matches
		: false;

	// Focus management: move focus into panel when it opens
	let panelRef: HTMLElement | null = null;
	$effect(() => {
		if ($sidebarHelpOpen && panelRef) {
			setTimeout(() => panelRef?.focus(), 0);
		}
	});

	// Current project from URL (for preserving ?project= across navigation)
	const currentProject = $derived($page.url.searchParams.get('project'));

	// Build nav href preserving the current project param
	function getNavHref(href: string): string {
		if (currentProject) {
			return `${href}?project=${encodeURIComponent(currentProject)}`;
		}
		return href;
	}

	// Helper to check if nav item is active
	function isActive(href: string): boolean {
		const currentPath = $page.url.pathname;
		return currentPath === href || currentPath.startsWith(href + '/');
	}

	// Group items by category for rendering (hides labs routes outside of debug mode)
	function getGroupItems(groupId: NavGroup) {
		const debugMode = getDebugMode();
		return unifiedNavConfig.navItems.filter((item) => {
			if (!debugMode && item.category === 'labs') return false;
			return item.category === groupId;
		});
	}

	// Check if group has any active item (to keep it visible even when collapsed)
	function groupHasActiveItem(groupId: NavGroup): boolean {
		return getGroupItems(groupId).some(item => isActive(item.href));
	}

	// Get badge count for a nav item (returns 0 if no badge)
	function getBadgeCount(itemId: string): number {
		switch (itemId) {
			case 'tasks': return $activeAgentSessionsCount;
			case 'tasks-fast': return $submittedTasksCount;
			case 'sessions': return $activeSessionsCount;
			case 'source': return $gitChangesCount;
			case 'servers': return $runningServersCount;
			case 'files': return $fileChangesCount;
			default: return 0;
		}
	}

	// Badge color configs per item
	const badgeColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
		tasks: { bg: 'oklch(0.55 0.15 85 / 0.25)', text: 'oklch(0.80 0.15 85)', border: 'oklch(0.55 0.15 85 / 0.4)', dot: 'oklch(0.75 0.15 85)' },
		'tasks-fast': { bg: 'oklch(0.55 0.18 30 / 0.25)', text: 'oklch(0.85 0.15 40)', border: 'oklch(0.60 0.18 30 / 0.45)', dot: 'oklch(0.75 0.18 40)' },
		sessions: { bg: 'oklch(0.55 0.15 145 / 0.25)', text: 'oklch(0.75 0.15 145)', border: 'oklch(0.55 0.15 145 / 0.4)', dot: 'oklch(0.70 0.15 145)' },
		source: { bg: 'oklch(0.55 0.15 220 / 0.25)', text: 'oklch(0.80 0.12 220)', border: 'oklch(0.55 0.15 220 / 0.4)', dot: 'oklch(0.75 0.12 220)' },
		servers: { bg: 'oklch(0.50 0.02 250 / 0.3)', text: 'oklch(0.75 0.02 250)', border: 'oklch(0.50 0.02 250 / 0.4)', dot: 'oklch(0.65 0.02 250)' },
		files: { bg: 'oklch(0.55 0.18 310 / 0.25)', text: 'oklch(0.80 0.15 310)', border: 'oklch(0.55 0.18 310 / 0.4)', dot: 'oklch(0.75 0.18 310)' },
	};

	// Badge title text per item
	function getBadgeTitle(itemId: string, count: number): string {
		switch (itemId) {
			case 'tasks': return `${count} active agent${count === 1 ? '' : 's'}`;
			case 'tasks-fast': return `${count} submitted task${count === 1 ? '' : 's'} awaiting reply`;
			case 'sessions': return `${count} active session${count === 1 ? '' : 's'}`;
			case 'source': return `${count} file${count === 1 ? '' : 's'} with changes`;
			case 'servers': return `${count} running server${count === 1 ? '' : 's'}`;
			case 'files': return `${count} file${count === 1 ? '' : 's'} changed on disk`;
			default: return '';
		}
	}

	// Icon SVG paths (Heroicons outline)
	const icons: Record<string, string> = {
		// WORK: Daily workflow
		mobile: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3',
		tasks: 'M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
		bolt: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
		tmux: 'M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z',
		history: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
		// CODE: Development tools
		files: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
		source: 'M6 3v12M6 21a3 3 0 100-6 3 3 0 000 6zM18 9a3 3 0 100-6 3 3 0 000 6zM18 9a9 9 0 01-9 9',
		servers: 'M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z',
		// KNOWLEDGE: Data & context
		data: 'M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5M3.75 3v18M9.75 3v18M15.75 3v18M20.25 3v18',
		bases: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
		canvas: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z M9 13.5h6m-6 3h3',
		memory: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125',
		search: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
		// CONFIGURE: System setup
		integrations: 'M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z',
		workflows: 'M3 3h6v6H3V3zm12 0h6v6h-6V3zm-6 12h6v6H9v-6zM6 9v3a3 3 0 003 3M18 9v3a3 3 0 01-3 3',
		automation: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99',
		chores: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z',
		clients: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
		settings: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
		// VIEWS: Alternative visualizations
		dashboard: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
		graph: 'M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z',
		timeline: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
		columns: 'M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z',
		// LABS: Experimental features
		terminal: 'M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5',
		beaker: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 5.607c.28 1.12-.62 2.093-1.772 2.093H4.57c-1.152 0-2.052-.973-1.772-2.093L5 14.5',
		radar: 'M9.348 14.651a3.75 3.75 0 010-5.303m5.304-.001a3.75 3.75 0 010 5.304m-7.425 2.122a6.75 6.75 0 010-9.546m9.546.001a6.75 6.75 0 010 9.547m-11.667 2.12a10.5 10.5 0 010-13.787m13.787.001a10.5 10.5 0 010 13.787M12 12h.008v.008H12V12z',
		// open-tasks: clipboard with line list (distinct from bullet-list 'tasks' icon)
		list: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
		// monitor: activity bars (distinct from terminal 'tmux' icon)
		pulse: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
		// Utilities
		help: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
		// Chevron for group collapse
		chevronDown: 'M19.5 8.25l-7.5 7.5-7.5-7.5',
		chevronRight: 'M8.25 4.5l7.5 7.5-7.5 7.5',
	};

	// Visual style config per group style
	const groupStyles = {
		main: {
			// Full size items with main blue accent
			itemPy: 'py-2.5',
			iconSize: 'w-6 h-6',
			svgSize: 'w-4.5 h-4.5',
			activeAccent: 'oklch(0.70 0.18 240)',
			activeBg: 'oklch(0.70 0.18 240 / 0.2)',
			activeText: 'oklch(0.80 0.15 240)',
			activeIcon: 'oklch(0.75 0.16 240)',
			activeIconBg: 'oklch(0.70 0.18 240 / 0.15)',
			activeIconGlow: '0 0 10px oklch(0.70 0.18 240 / 0.3)',
			inactiveText: 'oklch(0.65 0.02 250)',
			inactiveIcon: 'oklch(0.55 0.02 250)',
			labelSize: 'text-xs',
			lineColor: 'oklch(0.70 0.18 240 / 0.4)',
			headerColor: 'oklch(0.45 0.02 250)',
			strokeActive: 2,
			strokeInactive: 1.5,
		},
		views: {
			// Slightly smaller, dimmer styling
			itemPy: 'py-2',
			iconSize: 'w-5 h-5',
			svgSize: 'w-4 h-4',
			activeAccent: 'oklch(0.70 0.18 240 / 0.7)',
			activeBg: 'oklch(0.70 0.18 240 / 0.15)',
			activeText: 'oklch(0.75 0.12 240)',
			activeIcon: 'oklch(0.70 0.14 240)',
			activeIconBg: 'oklch(0.70 0.18 240 / 0.1)',
			activeIconGlow: 'none',
			inactiveText: 'oklch(0.55 0.02 250)',
			inactiveIcon: 'oklch(0.50 0.02 250)',
			labelSize: 'text-[10px]',
			lineColor: 'oklch(0.70 0.18 240 / 0.3)',
			headerColor: 'oklch(0.45 0.02 250)',
			strokeActive: 1.75,
			strokeInactive: 1.5,
		},
		labs: {
			// Smallest, purple accent, dimmed
			itemPy: 'py-2',
			iconSize: 'w-5 h-5',
			svgSize: 'w-4 h-4',
			activeAccent: 'oklch(0.55 0.12 300 / 0.7)',
			activeBg: 'oklch(0.55 0.12 300 / 0.15)',
			activeText: 'oklch(0.65 0.10 300)',
			activeIcon: 'oklch(0.60 0.10 300)',
			activeIconBg: 'oklch(0.55 0.12 300 / 0.1)',
			activeIconGlow: 'none',
			inactiveText: 'oklch(0.45 0.02 250)',
			inactiveIcon: 'oklch(0.45 0.05 300)',
			labelSize: 'text-[10px]',
			lineColor: 'oklch(0.55 0.12 300 / 0.3)',
			headerColor: 'oklch(0.50 0.12 300)',
			strokeActive: 1.75,
			strokeInactive: 1.5,
		},
	};


</script>

<!-- Industrial/Terminal Sidebar — push sidebar, no overlay -->
<div
	class="flex-shrink-0 flex flex-col transition-all duration-300 relative z-40"
	style="width: {$sidebarState === 'hidden' ? '0px' : $sidebarState === 'collapsed' ? '3.5rem' : '10rem'}; overflow: {$sidebarState === 'hidden' ? 'hidden' : 'visible'};"
>
	<!-- Sidebar content -->
	<div
		class="flex h-screen flex-col transition-all duration-200 relative {$isSidebarCollapsed ? 'w-14 overflow-visible' : 'w-40 overflow-hidden'}"
		style="
			background: linear-gradient(180deg, oklch(0.22 0.01 250) 0%, oklch(0.18 0.01 250) 100%);
		"
	>
		<!-- Right accent bar (acts as border) -->
		<div
			class="absolute right-0 top-0 bottom-0 w-px"
			style="background: oklch(0.35 0.02 250);"
		></div>

		<!-- Logo (Industrial) -->
		<div class="py-4 flex justify-center relative">
			<a
				href="https://github.com/joewinke/jat"
				target="_blank"
				rel="noopener noreferrer"
				class="group transition-all duration-200 hover:scale-105"
			>
				<div
					class="px-1.5 py-1.5 rounded font-mono font-bold text-sm tracking-widest"
					style="
						background: linear-gradient(135deg, oklch(0.70 0.18 240 / 0.15) 0%, oklch(0.70 0.18 240 / 0.05) 100%);
						border: 1px solid oklch(0.70 0.18 240 / 0.3);
						color: oklch(0.75 0.16 240);
					"
				>
					JAT
				</div>
			</a>
			<!-- Decorative line under logo -->
			<div
				class="absolute bottom-0 left-3 right-3 h-px"
				style="background: linear-gradient(90deg, transparent, oklch(0.45 0.02 250), transparent);"
			></div>
		</div>

		<!-- Navigation groups (collapsible) -->
		<nav class="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
			{#each NAV_GROUPS as group, groupIndex}
				{@const style = groupStyles[group.style]}
				{@const items = getGroupItems(group.id)}
				{@const collapsed = isNavGroupCollapsed(group.id)}
				{@const hasActive = groupHasActiveItem(group.id)}

				{#if group.id !== 'labs' || getDebugMode()}
				<!-- Group header -->
				{#if !$isSidebarCollapsed}
					<button
						onclick={() => toggleCollapsedNavGroup(group.id)}
						class="w-full flex items-center gap-1.5 px-3 cursor-pointer transition-colors duration-150 hover:opacity-80
							{groupIndex === 0 ? 'pt-1 pb-1' : 'pt-3 pb-1'}"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
							stroke-width="1.5" stroke="currentColor"
							class="w-2.5 h-2.5 transition-transform duration-200 {collapsed ? '' : 'rotate-90'}"
							style="color: {style.headerColor};"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d={icons.chevronRight} />
						</svg>
						<span class="text-[10px] tracking-widest uppercase select-none"
							style="color: {style.headerColor};">
							{group.label}
						</span>
						<div class="flex-1 h-px"
							style="background: linear-gradient(90deg, {style.lineColor}, transparent);">
						</div>
					</button>
				{:else if groupIndex > 0}
					<!-- Collapsed sidebar: thin divider between groups -->
					<div class="h-px mx-2 my-2" style="background: {style.lineColor};"></div>
				{/if}

				<!-- Group items (hidden when collapsed, unless has active item or sidebar is narrow) -->
				{#if !collapsed || hasActive || $isSidebarCollapsed}
					{#each items as navItem, index}
						{@const active = isActive(navItem.href)}
						{@const badgeCount = getBadgeCount(navItem.id)}
						{@const colors = badgeColors[navItem.id]}
						{@const flashing = $navFlashRoute === navItem.href && !active}
						{#if !collapsed || active || $isSidebarCollapsed}
							<a
								href={getNavHref(navItem.href)}
								class="w-full flex items-center gap-3 px-3 {style.itemPy} rounded transition-all duration-200 group relative
									{$isSidebarCollapsed ? 'justify-center tooltip tooltip-right' : ''}
									{active ? '' : 'industrial-hover'}
									{flashing ? 'nav-shortcut-flash' : ''}"
								style="
									background: {active ? `linear-gradient(90deg, ${style.activeBg} 0%, transparent 100%)` : 'transparent'};
									border-left: 2px solid {active ? style.activeAccent : 'transparent'};
									color: {active ? style.activeText : style.inactiveText};
									text-decoration: none;
								"
								data-tip="{navItem.label}{group.style === 'labs' ? ' (experimental)' : ''}"
							>
								<!-- Icon with glow on active -->
								<div
									class="flex items-center justify-center {style.iconSize} rounded transition-all {$isSidebarCollapsed ? 'puff-in-center' : ''}"
									style="
										background: {active ? style.activeIconBg : 'transparent'};
										box-shadow: {active ? style.activeIconGlow : 'none'};
									"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke-width={active ? style.strokeActive : style.strokeInactive}
										stroke="currentColor"
										class="{style.svgSize} transition-all {active ? '' : 'group-hover:scale-110'}"
										style="color: {active ? style.activeIcon : style.inactiveIcon};"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d={icons[navItem.icon]} />
									</svg>
								</div>

								<!-- Label (hidden when sidebar collapsed) -->
								{#if !$isSidebarCollapsed}
									<span
										class="fade-in {style.labelSize} tracking-wider uppercase transition-colors
											{active ? '' : 'group-hover:text-base-content/80'}"
										style="text-shadow: {active && group.style === 'main' ? '0 0 10px oklch(0.70 0.18 240 / 0.4)' : 'none'};"
									>
										<span class="tracking-in-expand">{navItem.label}</span>
									</span>

									<!-- Badge (expanded sidebar) -->
									{#if badgeCount > 0 && colors}
										<span
											class="font-mono text-[10px] px-1.5 pt-0.5 rounded-full ml-auto"
											style="
												background: {colors.bg};
												color: {colors.text};
												border: 1px solid {colors.border};
											"
											title={getBadgeTitle(navItem.id, badgeCount)}
										>
											{badgeCount}
										</span>
									{/if}

									<!-- Active indicator line (when no badge showing) -->
									{#if active && !(badgeCount > 0 && colors)}
										<div
											class="flex-1 h-px"
											style="background: linear-gradient(90deg, {style.lineColor}, transparent);"
										></div>
									{/if}
								{:else if badgeCount > 0 && colors}
									<!-- Badge dot (collapsed sidebar) -->
									<span
										class="absolute top-1 right-0 w-2.5 h-2.5 rounded-full"
										style="background: {colors.dot}; box-shadow: 0 0 6px {colors.dot}99;"
										title={getBadgeTitle(navItem.id, badgeCount)}
									></span>
								{/if}
							</a>
						{/if}
					{/each}
				{/if}
				{/if}
			{/each}
		</nav>

		<!-- Bottom utilities -->
		<div class="px-2 py-3 space-y-1">
			<!-- Separator -->
			<div
				class="h-px mx-2 mb-3"
				style="background: linear-gradient(90deg, transparent, oklch(0.45 0.02 250), transparent);"
			></div>

			<!-- Ambient shortcut hint -->
			{#if !$isSidebarCollapsed}
				<button
					onclick={() => sidebarHelpOpen.set(true)}
					class="px-3 pb-2 w-full text-left transition-colors duration-150 hover:opacity-70"
					style="font-family: monospace; font-size: 0.65rem; color: oklch(0.45 0.02 250); letter-spacing: 0.02em;"
					aria-label="Open keyboard shortcuts"
				>ctrl+b · ?</button>
			{/if}
		</div>

		<!-- Bottom glow accent -->
		<div
			class="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
			style="background: linear-gradient(180deg, transparent, oklch(0.70 0.18 240 / 0.05));"
		></div>
	</div>
</div>

<!-- Floating keyboard shortcuts panel -->
{#if $sidebarHelpOpen}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 z-40"
		style="background: oklch(0.10 0.01 250 / 0.15);"
		transition:fade={{ duration: reducedMotion ? 0 : 180, easing: cubicOut }}
		onclick={() => sidebarHelpOpen.set(false)}
		aria-hidden="true"
	></div>

	<!-- Panel -->
	<aside
		class="fixed bottom-6 right-6 z-50 rounded-lg overflow-hidden"
		style="width: min(30rem, calc(100vw - 3rem)); max-height: calc(100vh - 5rem); display: flex; flex-direction: column; background: oklch(0.16 0.015 250); border: 1px solid oklch(0.28 0.02 250); box-shadow: 0 8px 40px oklch(0.05 0.01 250 / 0.7);"
		aria-label="Keyboard shortcuts reference"
		tabindex="-1"
		bind:this={panelRef}
		in:fly={{ y: reducedMotion ? 0 : 12, duration: reducedMotion ? 0 : 220, easing: cubicOut }}
		out:fly={{ y: reducedMotion ? 0 : 12, duration: reducedMotion ? 0 : 160, easing: cubicOut }}
	>
		<!-- Header -->
		<div class="flex items-center justify-between px-4 py-3 flex-shrink-0" style="border-bottom: 1px solid oklch(0.22 0.02 250);">
			<span style="font-family: monospace; font-size: 0.65rem; letter-spacing: 0.12em; color: oklch(0.40 0.02 250); text-transform: uppercase;">Keyboard Shortcuts</span>
			<button
				onclick={() => sidebarHelpOpen.set(false)}
				aria-label="Close"
				style="color: oklch(0.40 0.02 250); line-height: 1; font-size: 0.8rem;"
				class="transition-colors hover:text-base-content"
			>✕</button>
		</div>

		<!-- Scrollable content -->
		<div class="overflow-y-auto flex-1" style="padding: 0.75rem 1rem;">

			<!-- Navigate -->
			<div class="shortcuts-nav-header">
				<p class="shortcuts-section-label" style="margin: 0;">Navigate</p>
				<span class="shortcuts-nav-prefix"><kbd class="shortcut-key">Ctrl</kbd><kbd class="shortcut-key">Shift</kbd><span class="shortcuts-nav-plus">+</span></span>
			</div>
			<div class="shortcuts-nav-grid">
				{#each [
					['Tasks',        'T'],
					['Sessions',     'W'],
					['Source',       'G'],
					['Files',        'E'],
					['History',      'H'],
					['Servers',      'S'],
					['Data',         'D'],
					['Bases',        'B'],
					['Search',       'F'],
					['Integrations', 'X'],
					['Chores',       'A'],
					['Memory',       'M'],
					['Clients',      'C'],
					['Config',       ','],
				] as [label, key]}
					<div class="shortcuts-nav-row">
						<span class="shortcuts-label">{label}</span>
						<kbd class="shortcut-key shortcut-key-letter">{key}</kbd>
					</div>
				{/each}
			</div>

			<!-- Panels -->
			<p class="shortcuts-section-label" style="margin-top: 0.875rem;">Panels</p>
			{#each [
				['Sidebar',         ['Ctrl', 'B']],
				['Source panel',    ['Ctrl', '\\']],
				['Command palette', ['Ctrl', 'K']],
				['This panel',      ['?']],
			] as [label, keys]}
				<div class="shortcuts-row">
					<span class="shortcuts-label">{label}</span>
					<span class="shortcuts-keys">{#each keys as k}<kbd class="shortcut-key">{k}</kbd>{/each}</span>
				</div>
			{/each}

			<!-- Actions -->
			<p class="shortcuts-section-label" style="margin-top: 0.875rem;">Actions</p>
			{#each [
				['New task',           ['Alt', 'N']],
				['Epic swarm',         ['Alt', 'E']],
				['Start next',         ['Alt', 'S']],
				['Add project',        ['Alt', 'Shift', 'P']],
				['Cycle project',       ['Alt', '→']],
				['Cycle route',        ['Alt', '↑ / ↓']],
			] as [label, keys]}
				<div class="shortcuts-row">
					<span class="shortcuts-label">{label}</span>
					<span class="shortcuts-keys">{#each keys as k}<kbd class="shortcut-key">{k}</kbd>{/each}</span>
				</div>
			{/each}

			<!-- Sessions (work page) -->
			<p class="shortcuts-section-label" style="margin-top: 0.875rem;">Sessions <span class="section-context">work page</span></p>
			{#each [
				['Jump to session',    ['Alt', '1–9']],
				['Attach terminal',    ['Alt', 'A']],
				['Kill session',        ['Alt', 'K']],
				['Interrupt',          ['Alt', 'I']],
				['Pause',              ['Alt', 'P']],
				['Restart',            ['Alt', 'R']],
				['Copy output',        ['Alt', 'Shift', 'C']],
			] as [label, keys]}
				<div class="shortcuts-row">
					<span class="shortcuts-label">{label}</span>
					<span class="shortcuts-keys">{#each keys as k}<kbd class="shortcut-key">{k}</kbd>{/each}</span>
				</div>
			{/each}

			<!-- Source page -->
			<p class="shortcuts-section-label" style="margin-top: 0.875rem;">Source page <span class="section-context">mode tabs</span></p>
			{#each [
				['Git mode',           ['Alt', 'G']],
				['Supabase mode',      ['Alt', 'U']],
				['Cloudflare mode',    ['Alt', 'C']],
			] as [label, keys]}
				<div class="shortcuts-row">
					<span class="shortcuts-label">{label}</span>
					<span class="shortcuts-keys">{#each keys as k}<kbd class="shortcut-key">{k}</kbd>{/each}</span>
				</div>
			{/each}

			<!-- Files page -->
			<p class="shortcuts-section-label" style="margin-top: 0.875rem;">Files page <span class="section-context">file editor</span></p>
			{#each [
				['Save',               ['Ctrl', 'S']],
				['Close tab',          ['Alt', 'W']],
				['Quick finder',       ['Alt', 'P']],
				['Next tab',           ['Alt', ']']],
				['Prev tab',           ['Alt', '[']],
			] as [label, keys]}
				<div class="shortcuts-row">
					<span class="shortcuts-label">{label}</span>
					<span class="shortcuts-keys">{#each keys as k}<kbd class="shortcut-key">{k}</kbd>{/each}</span>
				</div>
			{/each}

		</div>

		<!-- Footer -->
		<div class="flex-shrink-0 px-4 py-2.5" style="border-top: 1px solid oklch(0.20 0.01 250);">
			<a href="/config?tab=shortcuts" onclick={() => sidebarHelpOpen.set(false)} style="font-size: 0.65rem; color: oklch(0.42 0.02 250); text-decoration: none; letter-spacing: 0.04em;" class="hover:opacity-70 transition-opacity">
				Full shortcut editor →
			</a>
		</div>
	</aside>
{/if}

<style>
	/* Nav item flash when Ctrl+Shift+* shortcut fires */
	@keyframes nav-flash {
		0%   { background: oklch(0.70 0.18 240 / 0); }
		25%  { background: oklch(0.70 0.18 240 / 0.22); }
		100% { background: oklch(0.70 0.18 240 / 0); }
	}
	:global(.nav-shortcut-flash) {
		animation: nav-flash 0.55s ease-out forwards !important;
	}
	@media (prefers-reduced-motion: reduce) {
		:global(.nav-shortcut-flash) { animation: none !important; }
	}

	/* Navigate section header with prefix */
	.shortcuts-nav-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.375rem;
	}
	.shortcuts-nav-prefix {
		display: flex;
		align-items: center;
		gap: 0.2rem;
	}
	.shortcuts-nav-plus {
		font-size: 0.55rem;
		color: oklch(0.38 0.02 250);
		margin-left: 0.1rem;
	}
	/* Letter-only chip in Navigate grid — slightly wider for visual breathing room */
	.shortcut-key-letter {
		min-width: 1.25rem;
		text-align: center;
	}
	/* Context label inside section headers */
	.section-context {
		opacity: 0.45;
		font-size: 0.55rem;
		text-transform: none;
		letter-spacing: 0.02em;
	}

	.shortcuts-section-label {
		font-size: 0.6rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: oklch(0.44 0.02 250);
		margin: 0 0 0.375rem;
	}
	.shortcuts-nav-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.25rem 1rem;
		margin-bottom: 0.125rem;
	}
	.shortcuts-nav-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.shortcuts-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}
	.shortcuts-label {
		font-size: 0.75rem;
		color: oklch(0.60 0.02 250);
		white-space: nowrap;
	}
	.shortcuts-keys {
		display: flex;
		gap: 0.2rem;
		flex-shrink: 0;
	}
	.shortcut-key {
		font-family: ui-monospace, monospace;
		font-size: 0.6rem;
		color: oklch(0.65 0.02 250);
		background: oklch(0.22 0.02 250);
		border: 1px solid oklch(0.32 0.02 250);
		border-radius: 3px;
		padding: 1px 4px;
		line-height: 1.4;
	}
</style>

