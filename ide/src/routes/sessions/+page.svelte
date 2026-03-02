<script lang="ts">
	/**
	 * Sessions Page
	 *
	 * Top-level view of ALL tmux sessions (not just jat-* or server-*).
	 * Provides a session-centric perspective for session management:
	 * - View all running tmux sessions
	 * - Kill/attach sessions
	 * - See session type (agent, server, other)
	 * - Choose-session style interface
	 */

	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { classifySessionLegacy, getDisplayName } from '$lib/utils/sessionNaming';
	import { goto } from '$app/navigation';
	import { getProjectColor, fetchAndGetProjectColors } from '$lib/utils/projectColors';
	import SessionCard from '$lib/components/work/SessionCard.svelte';
	import HorizontalResizeHandle from '$lib/components/HorizontalResizeHandle.svelte';
	import TaskIdBadge from '$lib/components/TaskIdBadge.svelte';
	import AgentAvatar from '$lib/components/AgentAvatar.svelte';
	import TaskDetailPane from '$lib/components/sessions/TaskDetailPane.svelte';
	import ServerStatusBadge from '$lib/components/work/ServerStatusBadge.svelte';
	import ServerSessionBadge from '$lib/components/ServerSessionBadge.svelte';
	import SessionsTabs from '$lib/components/sessions/SessionsTabs.svelte';
	import AnimatedDigits from '$lib/components/AnimatedDigits.svelte';
	import StatusActionBadge from '$lib/components/work/StatusActionBadge.svelte';
	import { getSessionStateVisual, type SessionState } from '$lib/config/statusColors';
	import { getReviewRules } from '$lib/stores/reviewRules.svelte';
	import { computeReviewStatus } from '$lib/utils/reviewStatusUtils';
	import { openTaskDetailDrawer } from '$lib/stores/drawerStore';
	import SortDropdown from '$lib/components/SortDropdown.svelte';
	import { toLocalDateStr, formatDisplayDate, parseLocalDate } from '$lib/utils/completedTaskHelpers';
	import DurationTrack from '$lib/components/history/DurationTrack.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { formatShortDate, parseTimestamp } from '$lib/utils/dateFormatters';
	import { isHumanTask } from '$lib/utils/badgeHelpers';
	import { getFileTypeInfoFromPath } from '$lib/utils/fileUtils';
	import { addToast } from '$lib/stores/toasts.svelte';

	interface TmuxSession {
		name: string;
		created: string;
		attached: boolean;
		type: 'agent' | 'server' | 'ide' | 'other';
		project?: string;
		resumed?: boolean;
		originalSessionId?: string;
		resumedAt?: string;
	}

	// State
	let sessions = $state<TmuxSession[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let pollInterval: ReturnType<typeof setInterval> | null = null;
	let selectedSession = $state<string | null>(null);
	let actionLoading = $state<string | null>(null);
	let copiedCmd = $state<string | null>(null);
	let attachMessage = $state<{ session: string; message: string; method: string } | null>(null);

	// Tab filter state - synced with URL
	let activeTab = $state('agents');

	// Open tasks state (for selected project)
	interface OpenTask {
		id: string;
		title: string;
		status: string;
		priority: number;
		issue_type?: string;
		assignee?: string;
		labels?: string[];
		created_at?: string;
		due_date?: string | null;
		integration?: { sourceId: string; sourceType: string; sourceName: string } | null;
	}
	let openTasks = $state<OpenTask[]>([]);
	let openTasksCollapsed = $state(false);
	let sessionsCollapsed = $state(false);
	let openTasksLoading = $state(false);
	let openTaskImages = $state<Record<string, Array<{ path: string; id: string; uploadedAt?: string }>>>({});
	let spawningTaskId = $state<string | null>(null);

	// Open tasks bulk selection
	let otSelectedTasks = $state<Set<string>>(new Set());
	let otLastClicked = $state<string | null>(null);

	// Open tasks selection helpers
	const otSelectionCount = $derived(otSelectedTasks.size);
	const otAllSelected = $derived.by(() => {
		return openTasks.length > 0 && openTasks.every(t => otSelectedTasks.has(t.id));
	});
	const otSomeSelected = $derived.by(() => {
		return openTasks.some(t => otSelectedTasks.has(t.id)) && !otAllSelected;
	});

	function otToggleTask(taskId: string, event?: MouseEvent) {
		if (event?.shiftKey && otLastClicked) {
			const ids = openTasks.map(t => t.id);
			const a = ids.indexOf(otLastClicked);
			const b = ids.indexOf(taskId);
			if (a !== -1 && b !== -1) {
				const [start, end] = a < b ? [a, b] : [b, a];
				const next = new Set(otSelectedTasks);
				for (let i = start; i <= end; i++) next.add(ids[i]);
				otSelectedTasks = next;
				otLastClicked = taskId;
				return;
			}
		}
		const next = new Set(otSelectedTasks);
		if (next.has(taskId)) next.delete(taskId); else next.add(taskId);
		otSelectedTasks = next;
		otLastClicked = taskId;
	}

	function otToggleAll() {
		const ids = openTasks.map(t => t.id);
		if (otAllSelected) {
			otSelectedTasks = new Set();
		} else {
			otSelectedTasks = new Set(ids);
		}
	}

	// Due date picker state
	let dueDatePickerTaskId = $state<string | null>(null);
	let dueDatePickerPos = $state<{ x: number; y: number } | null>(null);
	let dueDateTempValue = $state('');
	let dueDateTempTime = $state('');
	let dueDateSaving = $state(false);

	// Selected project (synced from URL ?project= param, managed by TopBar)
	let selectedProject = $state<string | null>(null);

	// Recently closed sessions state
	interface RecentSession {
		sessionName: string;
		agentName: string;
		taskId: string | null;
		taskTitle: string | null;
		project: string | null;
		sessionId: string | null;
		lastState: string;
		timestamp: string;
		taskStatus?: string; // Optimistic override from context menu status changes
		taskCreatedAt?: string;
		taskClosedAt?: string;
		taskUpdatedAt?: string;
		taskPriority?: number;
		taskType?: string;
		integration?: { sourceId: string; sourceType: string; sourceName: string } | null;
	}
	let recentSessions = $state<RecentSession[]>([]);
	let recentCollapsed = $state(false);
	let resumingSession = $state<string | null>(null);
	let recentTotal = $state(0);
	let recentHasMore = $state(false);
	let recentLoadingMore = $state(false);
	const RECENT_PAGE_SIZE = 20;

	// Day-grouped recent sessions
	interface RecentSessionDayGroup {
		date: string;        // YYYY-MM-DD
		displayDate: string; // "Today", "Yesterday", "Wed, Feb 19"
		sessions: RecentSession[];
	}

	function groupRecentSessionsByDay(sessions: RecentSession[]): RecentSessionDayGroup[] {
		const groups = new Map<string, RecentSessionDayGroup>();
		for (const session of sessions) {
			const dateStr = toLocalDateStr(session.timestamp);
			if (!groups.has(dateStr)) {
				groups.set(dateStr, {
					date: dateStr,
					displayDate: formatDisplayDate(parseLocalDate(dateStr)),
					sessions: [],
				});
			}
			groups.get(dateStr)!.sessions.push(session);
		}
		return Array.from(groups.values()).sort((a, b) => b.date.localeCompare(a.date));
	}

	const recentDayGroups = $derived(groupRecentSessionsByDay(recentSessions));

	// Expanded session state (inline SessionCard)
	let expandedSession = $state<string | null>(null);
	let collapsingSession = $state<string | null>(null); // For slide-up animation
	let expandedOutput = $state<string>('');
	let outputPollInterval: ReturnType<typeof setInterval> | null = null;
	let expandedHeight = $state(800); // Default height in pixels
	let isResizing = $state(false);

	// Tmux pane width tracking (in columns)
	let tmuxWidth = $state(160); // Default 160 columns
	const PIXELS_PER_COLUMN = 8.5; // Approximate pixels per monospace character
	let isCardResizing = $state(false); // For showing cols indicator during resize


	// Optimistic state and auto-complete tracking (matching TasksActive)
	let optimisticStates = $state<Map<string, string>>(new Map());
	let autoCompleteDisabledMap = $state<Map<string, boolean>>(new Map());

	// Task detail panel state (inline, not drawer overlay)
	let expandedTaskId = $state<string | null>(null);
	let taskDetailOpen = $state(false);

	// Poll for task details updates (signals) when panel is open
	let taskDetailsPollInterval: ReturnType<typeof setInterval> | null = null;
	const TASK_DETAILS_POLL_MS = 5000; // Poll every 5 seconds

	// Extended task detail data (fetched when panel opens)
	interface TaskAttachment {
		id: string;
		path: string;
		filename: string;
		url: string;
	}

	interface TaskDependency {
		id: string;
		title: string;
		status: string;
		priority: number;
	}

	interface TimelineEvent {
		type: 'jat_event' | 'agent_mail' | 'signal';
		event?: string;
		timestamp: string;
		description?: string;
		metadata?: Record<string, any>;
		data?: Record<string, any>;  // For signal events
	}

	interface ExtendedTaskDetails {
		labels?: string[];
		assignee?: string;
		depends_on?: TaskDependency[];
		blocked_by?: TaskDependency[];
		created_at?: string;
		updated_at?: string;
		attachments: TaskAttachment[];
		timeline: TimelineEvent[];
		timelineCounts: { total: number; jat_events: number; agent_mail: number; signals?: number };
	}

	let expandedTaskDetails = $state<ExtendedTaskDetails | null>(null);
	let taskDetailsLoading = $state(false);
	let expandedTaskIntegration = $state<{
		sourceId: string; sourceType: string; sourceName: string; sourceEnabled: boolean;
		callback?: any; actions?: any[]; itemId?: string; referenceId?: string; projectUrl?: string;
	} | null>(null);


	const priorityColors: Record<number, string> = {
		0: 'badge-error',
		1: 'badge-warning',
		2: 'badge-info',
		3: 'badge-ghost',
		4: 'badge-ghost'
	};

	// Agent to project mapping (from current task)
	let agentProjects = $state<Map<string, string>>(new Map());

	// Project colors (reactive state to trigger re-render when colors are fetched)
	let projectColors = $state<Record<string, string>>({});

	// Helper to get project color from reactive state
	function getProjectColorReactive(taskIdOrProject: string): string | null {
		if (!taskIdOrProject) return null;
		const projectPrefix = taskIdOrProject.split('-')[0].toLowerCase();
		return projectColors[projectPrefix] || getProjectColor(taskIdOrProject);
	}

	// Agent to task mapping (full task info for TaskIdBadge)
	interface AgentTask {
		id: string;
		status: string;
		issue_type?: string;
		title?: string;
		priority?: number;
		description?: string;
	}
	let agentTasks = $state<Map<string, AgentTask>>(new Map());

	// Agent to session info mapping (tokens, cost, activity state, etc. from /api/work)
	interface AgentSessionInfo {
		tokens: number;
		cost: number;
		activityState?: string; // 'working' | 'idle' | 'needs-input' | 'ready-for-review' | 'completing' | 'completed'
		activityStateTimestamp?: number; // Timestamp when state was fetched (so SessionCard trusts sseState)
	}
	let agentSessionInfo = $state<Map<string, AgentSessionInfo>>(new Map());

	// Browser session registry (agent name → port)
	let browserSessions = $state<Map<string, number>>(new Map());

	// Sort configuration for sessions
	type SessionSortOption = 'state' | 'project' | 'created';
	type SessionSortDirection = 'asc' | 'desc';

	interface SessionSortConfig {
		value: string;
		label: string;
		icon: string;
		defaultDir: SessionSortDirection;
	}

	let sortBy = $state<SessionSortOption>('state');
	let sortDir = $state<SessionSortDirection>('asc');

	// State priority for sorting (lower = more urgent/higher priority)
	// Principle: States requiring user attention/action come first
	const STATE_PRIORITY: Record<string, number> = {
		'ready-for-review': 0,   // Most urgent - needs human review
		'needs-input': 1,        // Waiting for user input
		'completed': 2,          // User must review completion screen and close it
		'working': 3,            // Actively working (no user action needed)
		'completing': 4,         // Running completion
		'starting': 5,           // Agent starting up
		'recovering': 6,         // Automation recovery
		'compacting': 7,         // Context compaction
		'auto-proceeding': 8,    // Spawning next
		'idle': 9                // Lowest priority
	};

	// Sort options for dropdown
	const SORT_OPTIONS: SessionSortConfig[] = [
		{ value: 'state', label: 'State', icon: '🎯', defaultDir: 'asc' },
		{ value: 'project', label: 'Project', icon: '📁', defaultDir: 'asc' },
		{ value: 'created', label: 'Created', icon: '⏱️', defaultDir: 'desc' }
	];

	// Project order (from /api/projects, sorted by last activity)
	let projectOrder = $state<string[]>([]);

	// Extract project from task ID (e.g., "jat-abc" → "jat", "chimaro-xyz" → "chimaro")
	function getProjectFromTaskId(taskId: string): string | undefined {
		if (!taskId) return undefined;
		const match = taskId.match(/^([a-zA-Z0-9_-]+)-[a-zA-Z0-9]+/);
		return match ? match[1] : undefined;
	}

	// Categorize sessions using centralized classifier
	function categorizeSession(name: string): { type: TmuxSession['type']; project?: string } {
		return classifySessionLegacy(name, (agent) => agentProjects.get(agent));
	}

	// Fetch project order (same as ActionPill uses, sorted by last activity)
	async function fetchProjectOrder() {
		try {
			const response = await fetch('/api/projects?visible=true&stats=true');
			if (!response.ok) return;
			const data = await response.json();
			projectOrder = (data.projects || []).map((p: { name: string }) => p.name);
		} catch {
			// Silent fail - will fall back to alphabetical
		}
	}

	// Fetch work sessions to get project assignments, task info, and session metrics
	async function fetchAgentProjects() {
		try {
			const response = await fetch('/api/work');
			if (!response.ok) return;
			const data = await response.json();

			const projectMap = new Map<string, string>();
			const taskMap = new Map<string, AgentTask>();
			const sessionInfoMap = new Map<string, AgentSessionInfo>();

			for (const session of data.sessions || []) {
				if (!session.agentName) continue;

				// Store session info (tokens, cost, activity state)
				sessionInfoMap.set(session.agentName, {
					tokens: session.tokens || 0,
					cost: session.cost || 0,
					activityState: session.sessionState || undefined,
					activityStateTimestamp: Date.now() // Timestamp so SessionCard trusts the state
				});

				// Get project from current task ID, or fall back to lastCompletedTask
				const taskSource = session.task || session.lastCompletedTask;
				if (taskSource?.id) {
					const project = getProjectFromTaskId(taskSource.id);
					if (project) {
						projectMap.set(session.agentName, project);
					}
					// Store full task info for TaskIdBadge
					taskMap.set(session.agentName, {
						id: taskSource.id,
						status: taskSource.status || 'open',
						issue_type: taskSource.issue_type,
						title: taskSource.title,
						priority: taskSource.priority,
						description: taskSource.description
					});
				} else {
					// No task — override idle state to 'planning'
					const info = sessionInfoMap.get(session.agentName);
					if (info && (!info.activityState || info.activityState === 'idle')) {
						info.activityState = 'planning';
					}
				}
			}
			agentProjects = projectMap;
			agentTasks = taskMap;
			agentSessionInfo = sessionInfoMap;
		} catch {
			// Silent fail - project info is optional
		}
	}

	// Fetch all tmux sessions
	async function fetchSessions() {
		try {
			const response = await fetch('/api/sessions?filter=all');
			if (!response.ok) {
				throw new Error('Failed to fetch sessions');
			}
			const data = await response.json();

			sessions = (data.sessions || []).map((s: { name: string; created: string; attached: boolean; project?: string }) => {
				const { type, project: categorizedProject } = categorizeSession(s.name);
				return {
					...s,
					type,
					// Use project from API (signal/cwd) if available, else fall back to categorized
					project: s.project || categorizedProject
				};
			});
			error = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	// Fetch project colors into reactive state
	async function fetchProjectColors() {
		try {
			const colors = await fetchAndGetProjectColors();
			projectColors = colors;
		} catch (err) {
			console.warn('Failed to fetch project colors:', err);
		}
	}

	// Fetch browser session registry (agent → port mapping)
	async function fetchBrowserSessions() {
		try {
			const response = await fetch('/api/browser-sessions');
			if (!response.ok) return;
			const data = await response.json();
			const map = new Map<string, number>();
			for (const [port, session] of Object.entries(data.sessions || {})) {
				const s = session as { agentName: string; port: number; alive: boolean; portListening: boolean };
				if (s.alive || s.portListening) {
					map.set(s.agentName, s.port);
				}
			}
			browserSessions = map;
		} catch {
			// Silent fail - browser info is optional
		}
	}

	// Fetch all data (project order + agents + colors first, then sessions)
	async function fetchAllData() {
		await Promise.all([fetchProjectOrder(), fetchAgentProjects(), fetchProjectColors(), fetchBrowserSessions()]);
		await fetchSessions();
		// Lazy fetch recently closed sessions (non-blocking)
		fetchRecentSessions();
	}

	// Fetch open tasks for a project
	async function fetchOpenTasks(project: string | null) {
		if (!project) {
			openTasks = [];
			return;
		}
		openTasksLoading = true;
		try {
			const response = await fetch(`/api/tasks?status=open&project=${encodeURIComponent(project)}`);
			if (!response.ok) return;
			const data = await response.json();
			openTasks = data.tasks || [];
		} catch {
			// Silent fail
		} finally {
			openTasksLoading = false;
		}
	}

	// Fetch task images for open tasks
	async function fetchOpenTaskImages() {
		try {
			const response = await fetch('/api/tasks/images');
			if (!response.ok) return;
			const data = await response.json();
			openTaskImages = data.images || {};
		} catch {
			// Silent fail
		}
	}

	// Due date helpers
	function formatDueDate(dateStr: string | null | undefined): string {
		if (!dateStr) return '';
		const date = parseTimestamp(dateStr);
		if (!date) return '';
		return formatShortDate(dateStr);
	}

	function getDueDateColor(dateStr: string | null | undefined): string {
		if (!dateStr) return '';
		const date = parseTimestamp(dateStr);
		if (!date) return '';
		const now = new Date();
		const diffMs = date.getTime() - now.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		if (diffDays < 0)  return 'oklch(0.70 0.18 30)';
		if (diffDays <= 1) return 'oklch(0.75 0.18 50)';
		if (diffDays <= 3) return 'oklch(0.75 0.15 85)';
		return 'oklch(0.60 0.02 250)';
	}

	function openDueDatePicker(task: OpenTask, e: MouseEvent) {
		e.stopPropagation();
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		dueDatePickerTaskId = task.id;
		if (task.due_date) {
			const d = parseTimestamp(task.due_date);
			if (d) {
				const year = d.getFullYear();
				const month = String(d.getMonth() + 1).padStart(2, '0');
				const day = String(d.getDate()).padStart(2, '0');
				dueDateTempValue = `${year}-${month}-${day}`;
				const hours = d.getHours();
				const mins = d.getMinutes();
				dueDateTempTime = (hours !== 0 || mins !== 0) ? `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}` : '';
			} else {
				dueDateTempValue = '';
				dueDateTempTime = '';
			}
		} else {
			dueDateTempValue = '';
			dueDateTempTime = '';
		}
		const pickerHeight = 200;
		const pickerWidth = 260;
		const spaceBelow = window.innerHeight - rect.bottom;
		const y = spaceBelow < pickerHeight + 8
			? Math.max(8, rect.top - pickerHeight - 4)
			: rect.bottom + 4;
		const x = Math.min(rect.left, window.innerWidth - pickerWidth - 8);
		dueDatePickerPos = { x, y };
	}

	function closeDueDatePicker() {
		dueDatePickerTaskId = null;
		dueDatePickerPos = null;
	}

	async function saveDueDate() {
		if (!dueDatePickerTaskId) return;
		dueDateSaving = true;
		try {
			let dueDate: string | null = null;
			if (dueDateTempValue) {
				dueDate = dueDateTempTime ? `${dueDateTempValue}T${dueDateTempTime}:00` : `${dueDateTempValue}T00:00:00`;
			}
			const res = await fetch(`/api/tasks/${dueDatePickerTaskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ due_date: dueDate })
			});
			if (res.ok) {
				const idx = openTasks.findIndex(t => t.id === dueDatePickerTaskId);
				if (idx !== -1) {
					openTasks[idx] = { ...openTasks[idx], due_date: dueDate };
					openTasks = [...openTasks];
				}
				closeDueDatePicker();
			} else {
				addToast({ message: 'Failed to update due date', type: 'error' });
			}
		} catch {
			addToast({ message: 'Failed to update due date', type: 'error' });
		} finally {
			dueDateSaving = false;
		}
	}

	async function clearDueDate() {
		if (!dueDatePickerTaskId) return;
		dueDateSaving = true;
		try {
			const res = await fetch(`/api/tasks/${dueDatePickerTaskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ due_date: null })
			});
			if (res.ok) {
				const idx = openTasks.findIndex(t => t.id === dueDatePickerTaskId);
				if (idx !== -1) {
					openTasks[idx] = { ...openTasks[idx], due_date: null };
					openTasks = [...openTasks];
				}
				closeDueDatePicker();
			} else {
				addToast({ message: 'Failed to clear due date', type: 'error' });
			}
		} catch {
			addToast({ message: 'Failed to clear due date', type: 'error' });
		} finally {
			dueDateSaving = false;
		}
	}

	// Spawn handler
	async function handleSpawnOpenTask(task: OpenTask) {
		spawningTaskId = task.id;
		try {
			const response = await fetch('/api/work/spawn', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ taskId: task.id, autoStart: true })
			});
			if (response.ok) {
				const data = await response.json();
				addToast({ message: `Spawned ${data.session?.agentName || 'agent'} for ${task.id}`, type: 'success' });
				// Refresh open tasks (the spawned task will move to in_progress)
				fetchOpenTasks(selectedProject);
			} else {
				const data = await response.json().catch(() => ({}));
				addToast({ message: data.error || 'Failed to spawn agent', type: 'error' });
			}
		} catch {
			addToast({ message: 'Failed to spawn agent', type: 'error' });
		} finally {
			spawningTaskId = null;
		}
	}

	// Sync selectedProject from URL and fetch open tasks when project changes
	$effect(() => {
		if (browser) {
			const projectParam = $page.url.searchParams.get('project');
			selectedProject = projectParam || null;
			fetchOpenTasks(projectParam || null);
			fetchOpenTaskImages();
		}
	});

	// Track optimistic task status overrides (survives re-fetches)
	let recentTaskStatusOverrides = new Map<string, string>();

	// Fetch recently closed sessions from signal files
	async function fetchRecentSessions() {
		try {
			// Preserve any extra pages loaded via "Load More" by fetching at least as many as currently shown
			const fetchLimit = Math.max(recentSessions.length, RECENT_PAGE_SIZE);
			const response = await fetch(`/api/sessions/recent?limit=${fetchLimit}`);
			if (!response.ok) return;
			const data = await response.json();
			const sessions: RecentSession[] = data.sessions || [];
			// Re-apply optimistic status overrides
			recentSessions = sessions.map(s =>
				s.taskId && recentTaskStatusOverrides.has(s.taskId)
					? { ...s, taskStatus: recentTaskStatusOverrides.get(s.taskId) }
					: s
			);
			recentTotal = data.total || 0;
			recentHasMore = data.hasMore || false;
		} catch {
			// Silent fail - recent sessions are optional
		}
	}

	async function loadMoreRecentSessions() {
		if (recentLoadingMore || !recentHasMore) return;
		recentLoadingMore = true;
		try {
			const currentDates = new Set(recentSessions.map(s => toLocalDateStr(s.timestamp)));
			let offset = recentSessions.length;
			let targetDay: string | null = null;
			const collected: RecentSession[] = [];

			// Fetch batches until we have one complete new day (no spillover)
			while (true) {
				const response = await fetch(`/api/sessions/recent?offset=${offset}&limit=${RECENT_PAGE_SIZE}`);
				if (!response.ok) break;
				const data = await response.json();
				const batch: RecentSession[] = data.sessions || [];
				if (batch.length === 0) { recentHasMore = false; break; }

				offset += batch.length;
				recentTotal = data.total || recentTotal;
				recentHasMore = data.hasMore || false;

				for (const s of batch) {
					const d = toLocalDateStr(s.timestamp);
					if (!targetDay && !currentDates.has(d)) {
						targetDay = d;
					}
					if (targetDay && d !== targetDay && !currentDates.has(d)) {
						// Crossed past the target day into an even older day — stop, don't include spillover
						recentHasMore = true; // we know there's more since we stopped early
						break;
					}
					collected.push(s);
				}

				// If we found the target day and the batch went past it, we're done
				if (targetDay && collected.length > 0) {
					const lastCollected = toLocalDateStr(collected[collected.length - 1].timestamp);
					// Check if we stopped early (spillover trimmed) or batch ended exactly on target day
					if (lastCollected === targetDay || !recentHasMore) break;
					// If the full batch was still within known + target days, keep fetching
					const batchLastDay = toLocalDateStr(batch[batch.length - 1].timestamp);
					if (batchLastDay === targetDay) continue; // target day might have more sessions
					break; // spillover was trimmed above
				}

				if (!recentHasMore) break;
			}

			if (collected.length > 0) {
				recentSessions = [...recentSessions, ...collected];
			}
		} catch {
			// Silent fail
		} finally {
			recentLoadingMore = false;
		}
	}

	// Resume a closed session
	async function resumeSession(recent: RecentSession) {
		resumingSession = recent.sessionName;
		attachMessage = null;
		try {
			const body: Record<string, string> = {};
			if (recent.sessionId) {
				body.session_id = recent.sessionId;
			}
			if (recent.project) {
				body.project = recent.project;
			}

			const response = await fetch(`/api/sessions/${encodeURIComponent(recent.sessionName)}/resume`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || data.error || 'Failed to resume session');
			}

			attachMessage = {
				session: recent.agentName,
				message: `Resumed in ${data.terminal || 'terminal'}`,
				method: 'terminal'
			};
			setTimeout(() => {
				if (attachMessage?.session === recent.agentName) {
					attachMessage = null;
				}
			}, 4000);

			// Refresh both lists - session should move from recent to active
			await fetchSessions();
			await fetchRecentSessions();
		} catch (err) {
			attachMessage = {
				session: recent.agentName,
				message: err instanceof Error ? err.message : 'Failed to resume',
				method: 'error'
			};
		} finally {
			resumingSession = null;
		}
	}

	// Kill a session
	async function killSession(sessionName: string) {
		actionLoading = sessionName;
		try {
			const response = await fetch(`/api/sessions/${encodeURIComponent(sessionName)}`, {
				method: 'DELETE'
			});
			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Failed to kill session');
			}
			// Refresh sessions
			await fetchSessions();
		} catch (err) {
			console.error('Failed to kill session:', err);
		} finally {
			actionLoading = null;
		}
	}

	// Attach to a session (opens in terminal)
	async function attachSession(sessionName: string) {
		actionLoading = sessionName;
		attachMessage = null;
		try {
			// Use the same endpoint as /work page - spawns external terminal
			const response = await fetch(`/api/work/${encodeURIComponent(sessionName)}/attach`, {
				method: 'POST'
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || 'Failed to attach session');
			}
			// Show success message
			attachMessage = {
				session: sessionName,
				message: `Opened in ${data.terminal?.split('/').pop() || 'terminal'}`,
				method: 'terminal'
			};
			// Clear message after 4 seconds
			setTimeout(() => {
				if (attachMessage?.session === sessionName) {
					attachMessage = null;
				}
			}, 4000);
		} catch (err) {
			console.error('Failed to attach session:', err);
			attachMessage = {
				session: sessionName,
				message: err instanceof Error ? err.message : 'Failed to attach',
				method: 'error'
			};
		} finally {
			actionLoading = null;
		}
	}

	// Copy attach command
	function copyAttachCmd(sessionName: string) {
		navigator.clipboard.writeText(`tmux attach-session -t ${sessionName}`);
		copiedCmd = sessionName;
		setTimeout(() => {
			copiedCmd = null;
		}, 2000);
	}

	// Format elapsed time
	function formatElapsed(createdISO: string): string {
		const created = new Date(createdISO).getTime();
		const now = Date.now();
		const elapsedMs = now - created;

		if (elapsedMs < 0) return 'just now';

		const seconds = Math.floor(elapsedMs / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) return `${days}d ${hours % 24}h`;
		if (hours > 0) return `${hours}h ${minutes % 60}m`;
		if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
		return `${seconds}s`;
	}

	// Format elapsed time for AnimatedDigits display
	// Returns object with hours, minutes, seconds as zero-padded strings
	function getElapsedFormatted(createdISO: string): { hours: string; minutes: string; seconds: string; showHours: boolean } | null {
		if (!createdISO) return null;
		const created = new Date(createdISO).getTime();
		const now = Date.now();
		const elapsedMs = now - created;

		if (elapsedMs < 0) return { hours: '00', minutes: '00', seconds: '00', showHours: false };

		const totalSeconds = Math.floor(elapsedMs / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		return {
			hours: hours.toString().padStart(2, '0'),
			minutes: minutes.toString().padStart(2, '0'),
			seconds: seconds.toString().padStart(2, '0'),
			showHours: hours > 0
		};
	}

	// Get type badge styling
	function getTypeBadge(type: TmuxSession['type']) {
		switch (type) {
			case 'agent':
				return { bg: 'oklch(0.65 0.15 200 / 0.2)', text: 'oklch(0.75 0.15 200)', label: 'AGENT' };
			case 'server':
				return { bg: 'oklch(0.65 0.15 145 / 0.2)', text: 'oklch(0.75 0.15 145)', label: 'SERVER' };
			case 'ide':
				return { bg: 'oklch(0.65 0.15 280 / 0.2)', text: 'oklch(0.75 0.15 280)', label: 'IDE' };
			default:
				return { bg: 'oklch(0.50 0.02 250 / 0.2)', text: 'oklch(0.65 0.02 250)', label: 'OTHER' };
		}
	}

	// Fetch output for expanded session
	async function fetchExpandedOutput(sessionName: string | null) {
		// Guard against null/undefined session names to prevent /api/work/null/output calls
		if (!sessionName) {
			return;
		}
		try {
			const response = await fetch(`/api/work/${encodeURIComponent(sessionName)}/output`);
			if (response.ok) {
				const data = await response.json();
				expandedOutput = data.output || '';
				// Stop polling if the session has ended (tmux session gone)
				if (data.sessionEnded && outputPollInterval) {
					clearInterval(outputPollInterval);
					outputPollInterval = null;
				}
			}
		} catch (err) {
			console.error('Failed to fetch session output:', err);
		}
	}

	// Fetch current tmux dimensions
	async function fetchTmuxDimensions(sessionName: string) {
		try {
			const response = await fetch(`/api/work/${encodeURIComponent(sessionName)}/resize`);
			if (response.ok) {
				const data = await response.json();
				tmuxWidth = data.dimensions?.width || 80;
			}
		} catch (err) {
			console.error('Failed to fetch tmux dimensions:', err);
		}
	}

	// Resize tmux pane width
	async function resizeTmuxWidth(sessionName: string, newWidth: number) {
		try {
			await fetch(`/api/work/${encodeURIComponent(sessionName)}/resize`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ width: newWidth })
			});
		} catch (err) {
			console.error('Failed to resize tmux pane:', err);
		}
	}

	// Handle horizontal resize delta (pixels -> columns)
	function handleHorizontalResize(deltaX: number) {
		if (!expandedSession) return;
		isCardResizing = true; // Show cols indicator
		const deltaColumns = Math.round(deltaX / PIXELS_PER_COLUMN);
		if (deltaColumns !== 0) {
			tmuxWidth = Math.max(40, tmuxWidth + deltaColumns);
		}
	}

	// Commit the resize to tmux when drag ends
	function handleHorizontalResizeEnd() {
		isCardResizing = false; // Hide cols indicator
		if (expandedSession) {
			resizeTmuxWidth(expandedSession, tmuxWidth);
		}
	}

	// Toggle session expansion (works for any session)
	function toggleExpanded(sessionName: string) {
		if (expandedSession === sessionName) {
			// Collapse with animation
			collapsingSession = sessionName;
			if (outputPollInterval) {
				clearInterval(outputPollInterval);
				outputPollInterval = null;
			}
			// After animation completes, remove the element
			setTimeout(() => {
				expandedSession = null;
				expandedOutput = '';
				collapsingSession = null;
			}, 200); // Match animation duration
		} else {
			// Expand
			expandInline(sessionName);
		}
	}

	// Fetch extended task details (attachments, dependencies, timeline, signals)
	async function fetchExpandedTaskDetails(taskId: string) {
		if (!taskId) return;

		taskDetailsLoading = true;
		expandedTaskDetails = null;
		expandedTaskIntegration = null;

		try {
			// Fetch task details, attachments, history, signals, and integration in parallel
			const [taskRes, attachmentsRes, historyRes, signalsRes, integrationRes] = await Promise.all([
				fetch(`/api/tasks/${taskId}`),
				fetch(`/api/tasks/${taskId}/images`),
				fetch(`/api/tasks/${taskId}/history`),
				fetch(`/api/tasks/${taskId}/signals`),
				fetch(`/api/tasks/integrations?taskIds=${taskId}`)
			]);

			const taskData = taskRes.ok ? await taskRes.json() : null;
			const attachmentsData = attachmentsRes.ok ? await attachmentsRes.json() : { images: [] };
			const historyData = historyRes.ok ? await historyRes.json() : { timeline: [], count: { total: 0, jat_events: 0, agent_mail: 0 } };
			const signalsData = signalsRes.ok ? await signalsRes.json() : { signals: [] };
			const integrationData = integrationRes.ok ? await integrationRes.json() : { integrations: {} };
			expandedTaskIntegration = integrationData.integrations?.[taskId] || null;

			// Convert signals to timeline event format and merge with history
			const signalEvents = (signalsData.signals || []).map((signal: any) => ({
				type: 'signal' as const,
				timestamp: signal.timestamp,
				data: {
					state: signal.state,
					agentName: signal.agent_name,
					...signal.data
				}
			}));

			// Merge history timeline with signal events and sort by timestamp
			const mergedTimeline = [...(historyData.timeline || []), ...signalEvents]
				.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

			expandedTaskDetails = {
				labels: taskData?.task?.labels || [],
				assignee: taskData?.task?.assignee,
				depends_on: taskData?.task?.depends_on || [],
				blocked_by: taskData?.task?.blocked_by || [],
				created_at: taskData?.task?.created_at,
				updated_at: taskData?.task?.updated_at,
				attachments: (attachmentsData.images || []).map((img: any) => ({
					id: img.id || img.path,
					path: img.path,
					filename: img.filename || img.path.split('/').pop(),
					url: `/api/tasks/${taskId}/images/${encodeURIComponent(img.path.split('/').pop())}`
				})),
				timeline: mergedTimeline,
				timelineCounts: {
					total: mergedTimeline.length,
					jat_events: historyData.count?.jat_events || 0,
					agent_mail: historyData.count?.agent_mail || 0,
					signals: signalEvents.length
				}
			};
		} catch (err) {
			console.error('Failed to fetch task details:', err);
			expandedTaskDetails = {
				labels: [],
				attachments: [],
				timeline: [],
				timelineCounts: { total: 0, jat_events: 0, agent_mail: 0 }
			};
		} finally {
			taskDetailsLoading = false;
		}
	}

	// Fetch only signals and merge into existing timeline (for polling updates)
	async function fetchTaskSignalsOnly(taskId: string) {
		if (!taskId || !expandedTaskDetails) return;

		try {
			const signalsRes = await fetch(`/api/tasks/${taskId}/signals`);
			if (!signalsRes.ok) return;

			const signalsData = await signalsRes.json();

			// Re-check after await — expandedTaskDetails may have been nulled
			// (e.g. user collapsed the panel or switched sessions)
			if (!expandedTaskDetails) return;

			const signalEvents = (signalsData.signals || []).map((signal: any) => ({
				type: 'signal' as const,
				timestamp: signal.timestamp,
				data: {
					state: signal.state,
					agentName: signal.agent_name,
					...signal.data
				}
			}));

			// Filter out existing signals and only add new ones
			const existingTimestamps = new Set(
				expandedTaskDetails.timeline
					.filter(e => e.type === 'signal')
					.map(e => e.timestamp)
			);
			const newSignals = signalEvents.filter((s: any) => !existingTimestamps.has(s.timestamp));

			if (newSignals.length > 0) {
				// Merge and re-sort timeline
				const mergedTimeline = [...expandedTaskDetails.timeline, ...newSignals]
					.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

				expandedTaskDetails = {
					...expandedTaskDetails,
					timeline: mergedTimeline,
					timelineCounts: {
						...expandedTaskDetails.timelineCounts,
						total: mergedTimeline.length,
						signals: (expandedTaskDetails.timelineCounts.signals || 0) + newSignals.length
					}
				};
			}
		} catch (err) {
			console.error('Failed to fetch task signals:', err);
		}
	}

	// Expand session inline (works for any session)
	function expandInline(sessionName: string) {
		// Close any existing expansion
		if (outputPollInterval) {
			clearInterval(outputPollInterval);
			outputPollInterval = null;
		}

		expandedSession = sessionName;
		fetchExpandedOutput(sessionName);
		fetchTmuxDimensions(sessionName);

		// Auto-open task panel if this session has a task
		const agentName = getAgentName(sessionName);
		const task = agentTasks.get(agentName);
		if (task) {
			expandedTaskId = task.id;
			taskDetailOpen = true;
			// Fetch extended task details
			fetchExpandedTaskDetails(task.id);
		} else {
			// Close task panel if session has no task
			expandedTaskId = null;
			taskDetailOpen = false;
			expandedTaskDetails = null;
		}

		// Poll for output updates
		outputPollInterval = setInterval(() => {
			if (expandedSession === sessionName) {
				fetchExpandedOutput(sessionName);
			}
		}, 1000);
	}

	// Resize handling for expanded session
	function startResize(e: MouseEvent) {
		e.preventDefault();
		isResizing = true;
		const startY = e.clientY;
		const startHeight = expandedHeight;

		function onMouseMove(e: MouseEvent) {
			const delta = e.clientY - startY;
			expandedHeight = Math.max(200, startHeight + delta);
		}

		function onMouseUp() {
			isResizing = false;
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		}

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}


	// Send input to expanded session
	async function sendExpandedInput(text: string, type: 'text' | 'key' | 'raw' = 'text'): Promise<boolean> {
		if (!expandedSession) return false;
		try {
			// Special key handling: when type is 'key', the text contains the key name
			// (e.g., 'backspace', 'ctrl-c', 'enter'), which should become the API type
			let apiType: string = type;
			let apiInput: string = text;

			if (type === 'key') {
				const specialKeys = ['ctrl-c', 'ctrl-d', 'ctrl-u', 'ctrl-l', 'enter', 'escape', 'up', 'down', 'left', 'right', 'tab', 'delete', 'backspace', 'space'];
				if (specialKeys.includes(text)) {
					// The key name becomes the type, input is empty
					apiType = text;
					apiInput = '';
				} else {
					// Unknown key - send as raw text
					apiType = 'raw';
					apiInput = text;
				}
			}

			const response = await fetch(`/api/work/${encodeURIComponent(expandedSession)}/input`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ input: apiInput, type: apiType })
			});
			// Refresh output after sending
			setTimeout(() => fetchExpandedOutput(expandedSession!), 100);
			return response.ok;
		} catch (err) {
			console.error('Failed to send input:', err);
			return false;
		}
	}

	// Get agent name from session name (jat-AgentName -> AgentName)
	function getAgentName(sessionName: string): string {
		if (sessionName.startsWith('jat-')) {
			return sessionName.slice(4);
		}
		return sessionName;
	}

	function getTaskHarness(task: any): string {
		return task?.agent_program || 'claude-code';
	}

	async function sendWorkflowCommand(sessionName: string, command: string) {
		const sessionId = encodeURIComponent(sessionName);
		try {
			await fetch(`/api/work/${sessionId}/input`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'ctrl-u' })
			});
			await new Promise(r => setTimeout(r, 50));
			await fetch(`/api/work/${sessionId}/input`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ input: command, type: 'text' })
			});
			await new Promise(r => setTimeout(r, 100));
			await fetch(`/api/work/${sessionId}/input`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'enter' })
			});
		} catch (err) {
			console.error('[Sessions] sendWorkflowCommand ERROR:', err);
		}
	}

	// Tick for elapsed time updates
	let tick = $state(0);

	// Handle tab change - update URL
	function handleTabChange(tabId: string) {
		activeTab = tabId;
		const url = new URL(window.location.href);
		if (tabId === 'agents') {
			// 'agents' is the default, so no tab param needed
			url.searchParams.delete('tab');
		} else {
			url.searchParams.set('tab', tabId);
		}
		goto(url.pathname + url.search, { replaceState: true, noScroll: true });
	}

	// Sync activeTab from URL on mount
	$effect(() => {
		if (browser) {
			const tabParam = $page.url.searchParams.get('tab');
			if (tabParam && ['all', 'servers', 'terminal', 'browser'].includes(tabParam)) {
				activeTab = tabParam;
			} else {
				// Default to 'agents' when no tab param or invalid param
				activeTab = 'agents';
			}
		}
	});

	// Handle sort change from dropdown
	function handleSortChange(value: string, dir: 'asc' | 'desc') {
		sortBy = value as SessionSortOption;
		sortDir = dir;
	}

	onMount(() => {
		fetchAllData();
		// Poll every 3 seconds
		pollInterval = setInterval(() => {
			fetchAllData();
			tick++;
		}, 3000);
	});

	onDestroy(() => {
		if (pollInterval) {
			clearInterval(pollInterval);
		}
		if (outputPollInterval) {
			clearInterval(outputPollInterval);
		}
		if (taskDetailsPollInterval) {
			clearInterval(taskDetailsPollInterval);
		}
	});

	// Poll for task details (signals) when panel is open
	$effect(() => {
		const shouldPoll = taskDetailOpen && expandedTaskId;

		if (shouldPoll) {
			// Start polling if not already
			if (!taskDetailsPollInterval) {
				taskDetailsPollInterval = setInterval(() => {
					if (expandedTaskId) {
						// Only refetch signals, merge into existing timeline
						fetchTaskSignalsOnly(expandedTaskId);
					}
				}, TASK_DETAILS_POLL_MS);
			}
		} else {
			// Stop polling
			if (taskDetailsPollInterval) {
				clearInterval(taskDetailsPollInterval);
				taskDetailsPollInterval = null;
			}
		}

		// Cleanup on effect re-run
		return () => {
			if (taskDetailsPollInterval) {
				clearInterval(taskDetailsPollInterval);
				taskDetailsPollInterval = null;
			}
		};
	});

	// Helper function to get state priority for a session
	function getSessionStatePriority(session: TmuxSession): number {
		if (session.type !== 'agent') return 99; // Non-agent sessions go last
		const agentName = getAgentName(session.name);
		const state = agentSessionInfo.get(agentName)?.activityState || 'idle';
		return STATE_PRIORITY[state] ?? 99;
	}

	// Sort sessions based on current sort configuration
	const sortedSessions = $derived(
		[...sessions].sort((a, b) => {
			const multiplier = sortDir === 'asc' ? 1 : -1;

			if (sortBy === 'state') {
				// Sort by state priority (most urgent first)
				const stateA = getSessionStatePriority(a);
				const stateB = getSessionStatePriority(b);
				if (stateA !== stateB) {
					return (stateA - stateB) * multiplier;
				}
				// Secondary sort by created time (most recent first)
				const createdA = new Date(a.created).getTime();
				const createdB = new Date(b.created).getTime();
				return (createdB - createdA);
			}

			if (sortBy === 'project') {
				// Sort by project (using projectOrder from API, unknown projects go last)
				const projA = a.project || '';
				const projB = b.project || '';
				if (projA !== projB) {
					const indexA = projA ? projectOrder.indexOf(projA) : -1;
					const indexB = projB ? projectOrder.indexOf(projB) : -1;
					const orderA = indexA === -1 ? (projA ? 9999 : 99999) : indexA;
					const orderB = indexB === -1 ? (projB ? 9999 : 99999) : indexB;
					if (orderA !== orderB) {
						return (orderA - orderB) * multiplier;
					}
					// Both unknown, sort alphabetically
					if (indexA === -1 && indexB === -1) {
						return projA.localeCompare(projB) * multiplier;
					}
				}
				// Secondary sort by created time
				const createdA = new Date(a.created).getTime();
				const createdB = new Date(b.created).getTime();
				return (createdB - createdA);
			}

			// Default: sort by created time
			const createdA = new Date(a.created).getTime();
			const createdB = new Date(b.created).getTime();
			return (createdB - createdA) * multiplier;
		})
	);

	// Group sessions by type
	const groupedSessions = $derived(() => {
		const groups: Record<TmuxSession['type'], TmuxSession[]> = {
			agent: [],
			server: [],
			ide: [],
			other: []
		};
		for (const session of sortedSessions) {
			groups[session.type].push(session);
		}
		return groups;
	});

	// Count by type
	const sessionCounts = $derived(() => {
		const counts = { agent: 0, server: 0, ide: 0, other: 0, total: 0, browser: 0 };
		for (const session of sessions) {
			counts[session.type]++;
			counts.total++;
			if (session.type === 'agent') {
				const agentName = getAgentName(session.name);
				if (browserSessions.has(agentName)) counts.browser++;
			}
		}
		return counts;
	});

	// Filter sessions based on active tab
	const filteredSessions = $derived(
		sortedSessions.filter(session => {
			if (activeTab === 'all') return true;
			if (activeTab === 'agents') return session.type === 'agent';
			if (activeTab === 'servers') return session.type === 'server';
			if (activeTab === 'terminal') return session.type === 'other';
			if (activeTab === 'browser') {
				if (session.type !== 'agent') return false;
				const agentName = getAgentName(session.name);
				return browserSessions.has(agentName);
			}
			return true;
		})
	);

	// === Context Menu ===
	interface CtxSession {
		session: TmuxSession;
		task?: AgentTask;
		agentName: string;
		activityState: string;
	}

	let ctxData = $state<CtxSession | null>(null);
	let ctxX = $state(0);
	let ctxY = $state(0);
	let ctxVisible = $state(false);
	let ctxStatusSubmenuOpen = $state(false);

	function handleContextMenu(session: TmuxSession, event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();

		const menuWidth = 200;
		const menuHeight = 340;
		const agentName = getAgentName(session.name);
		const task = agentTasks.get(agentName);
		const info = agentSessionInfo.get(agentName);

		ctxData = {
			session,
			task,
			agentName,
			activityState: optimisticStates.get(session.name) || info?.activityState || 'idle'
		};

		ctxX = Math.min(event.clientX, window.innerWidth - menuWidth - 8);
		ctxY = Math.min(event.clientY, window.innerHeight - menuHeight - 8);
		ctxVisible = true;
		ctxStatusSubmenuOpen = false;
	}

	function closeCtxMenu() {
		ctxVisible = false;
		ctxStatusSubmenuOpen = false;
		recentCtxVisible = false;
		recentCtxStatusSubmenuOpen = false;
	}

	// Auto-close on click outside or Escape
	$effect(() => {
		if (!ctxVisible && !recentCtxVisible) return;
		function handleClick() { closeCtxMenu(); }
		function handleKeyDown(e: KeyboardEvent) { if (e.key === 'Escape') closeCtxMenu(); }
		const timer = setTimeout(() => {
			document.addEventListener('click', handleClick);
			document.addEventListener('keydown', handleKeyDown);
		}, 0);
		return () => {
			clearTimeout(timer);
			document.removeEventListener('click', handleClick);
			document.removeEventListener('keydown', handleKeyDown);
		};
	});

	// Recently closed context menu state
	let recentCtxData = $state<RecentSession | null>(null);
	let recentCtxX = $state(0);
	let recentCtxY = $state(0);
	let recentCtxVisible = $state(false);
	let recentCtxStatusSubmenuOpen = $state(false);

	function handleRecentContextMenu(recent: RecentSession, event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		const menuWidth = 200;
		const menuHeight = 250;
		recentCtxData = recent;
		recentCtxX = Math.min(event.clientX, window.innerWidth - menuWidth - 8);
		recentCtxY = Math.min(event.clientY, window.innerHeight - menuHeight - 8);
		recentCtxVisible = true;
		recentCtxStatusSubmenuOpen = false;
		// Close the active sessions context menu if open
		ctxVisible = false;
	}

	function handleRecentRowClick(recent: RecentSession) {
		if (recent.taskId && recent.taskId !== 'unknown') {
			openTaskDetailDrawer(recent.taskId);
		}
	}

	async function ctxChangeStatus(taskId: string, newStatus: string) {
		closeCtxMenu();
		try {
			const res = await fetch(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus })
			});
			if (res.ok) {
				// Persist override so polling doesn't revert it
				recentTaskStatusOverrides.set(taskId, newStatus);
				// Optimistically update recently closed sessions
				recentSessions = recentSessions.map(r =>
					r.taskId === taskId ? { ...r, taskStatus: newStatus } : r
				);
			}
		} catch (err) {
			console.error('Failed to update task status:', err);
		}
	}

	async function ctxDuplicateTask(task: AgentTask) {
		closeCtxMenu();
		const project = task.id.split('-')[0];
		try {
			await fetch('/api/tasks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: `${task.title || task.id} (copy)`,
					type: task.issue_type || 'task',
					priority: task.priority ?? 2,
					description: task.description || '',
					project
				})
			});
		} catch (err) {
			console.error('Failed to duplicate task:', err);
		}
	}
</script>

<svelte:head>
	<title>Sessions | JAT IDE</title>
	<meta name="description" content="View all tmux sessions including agents, servers, and other sessions. Attach, kill, or expand sessions." />
	<meta property="og:title" content="Sessions | JAT IDE" />
	<meta property="og:description" content="View all tmux sessions including agents, servers, and other sessions. Attach, kill, or expand sessions." />
	<meta property="og:image" content="/favicons/tmux.svg" />
	<link rel="icon" href="/favicons/tmux.svg" />
</svelte:head>

<div class="tmux-page" style="background: oklch(0.14 0.01 250);">
	<!-- Content -->
	<div class="tmux-content-wrapper">
		<div class="tmux-content">
		<!-- Session type tabs + Sort control (above table) -->
		<div class="table-controls">
			<div class="table-controls-left">
				<SessionsTabs
					{activeTab}
					counts={sessionCounts()}
					onTabChange={handleTabChange}
				/>
				<div class="tmux-tip-wrapper">
					<button class="tmux-tip-btn" aria-label="tmux commands tip">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="tmux-tip-icon">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
						</svg>
						<div class="tmux-tip-tooltip">
							<span class="tmux-tip-label">Tip:</span>
							<code class="tmux-tip-code">tmux list-sessions</code>
							<span class="tmux-tip-sep">or</span>
							<code class="tmux-tip-code">tmux a -t {"<session>"}</code>
						</div>
					</button>
				</div>
			</div>
			<SortDropdown
				options={SORT_OPTIONS as any}
				{sortBy}
				{sortDir}
				onSortChange={handleSortChange}
				size="xs"
			/>
		</div>

		{#if loading && sessions.length === 0}
			<!-- Loading skeleton -->
			<div class="loading-skeleton">
				{#each [1, 2, 3] as _}
					<div class="skeleton-row">
						<div class="skeleton h-5 w-32 rounded"></div>
						<div class="skeleton h-4 w-16 rounded"></div>
						<div class="skeleton h-4 w-20 rounded"></div>
						<div class="skeleton h-8 w-24 rounded"></div>
					</div>
				{/each}
			</div>
		{:else if error}
			<!-- Error state -->
			<div class="error-state">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="error-icon">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
				</svg>
				<p class="error-text">{error}</p>
				<button class="retry-btn" onclick={() => fetchSessions()}>
					Retry
				</button>
			</div>
		{:else if sessions.length === 0}
			<!-- Empty state -->
			<div class="empty-state">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="empty-icon">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
				</svg>
				<p class="empty-title">No tmux sessions</p>
				<p class="empty-hint">Start a new agent or dev server from the Work or Servers page.</p>
			</div>
		{:else}
			<!-- Sessions table -->
			<div class="sessions-table-wrapper">
				<button
					class="sessions-collapse-header"
					onclick={() => sessionsCollapsed = !sessionsCollapsed}
				>
					<div class="sessions-collapse-header-left">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="sessions-collapse-chevron"
							class:collapsed={sessionsCollapsed}
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
						</svg>
						<span class="sessions-collapse-title">Active Sessions</span>
						<span class="sessions-collapse-count">{filteredSessions.length}</span>
					</div>
				</button>
				{#if !sessionsCollapsed}
				<table class="sessions-table">
					<thead>
						<tr>
							<th class="th-task">Task</th>
							<th class="th-status">Status</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredSessions as session (session.name)}
							{@const typeBadge = getTypeBadge(session.type)}
							{@const isExpanded = expandedSession === session.name}
							{@const isCollapsing = collapsingSession === session.name}
							{@const sessionAgentName = getAgentName(session.name)}
							{@const sessionTask = agentTasks.get(sessionAgentName)}
							{@const sessionInfo = agentSessionInfo.get(sessionAgentName)}
							{@const activityState = sessionInfo?.activityState}
							{@const rawEffectiveState = optimisticStates.get(session.name) || activityState || 'idle'}
							{@const effectiveState = rawEffectiveState === 'completing' && sessionTask?.status === 'closed' ? 'completed' : rawEffectiveState}
							{@const statusDotColor = getSessionStateVisual(effectiveState).accent}
							{@const derivedProject = agentProjects.get(sessionAgentName) || session.project || null}
							{@const rowProjectColor = sessionTask?.id
								? getProjectColorReactive(sessionTask.id)
								: derivedProject
									? getProjectColorReactive(`${derivedProject}-x`)
									: null
							}
							{@const elapsed = getElapsedFormatted(session.created)}
							<tr
								class="session-row"
								class:attached={session.attached}
								class:selected={selectedSession === session.name}
								style={rowProjectColor ? `border-left: 3px solid ${rowProjectColor};` : ''}
								class:expanded={isExpanded}
								class:expandable={true}
								onclick={() => toggleExpanded(session.name)}
								oncontextmenu={(e) => handleContextMenu(session, e)}
							>
								<td class="td-task">
									{#if session.type === 'server'}
										<!-- Server session display -->
										<div class="task-cell-content">
											<div class="badge-and-text">
												<ServerSessionBadge
													sessionName={session.name}
													project={session.project}
													status="running"
													created={session.created}
													size="sm"
													variant="projectPill"
													class="min-w-[140px] flex-shrink-0 [&>button]:w-full"
													onAction={async (actionId) => {
														if (actionId === 'stop') {
															await killSession(session.name);
														} else if (actionId === 'restart') {
															await killSession(session.name);
														}
													}}
												/>
												<div class="text-column">
													<span class="task-title">{session.name}</span>
													{#if session.project}
														<div class="task-description">{getDisplayName(session.name)}</div>
													{/if}
												</div>
											</div>
										</div>
									{:else}
										<!-- Agent session: TaskIdBadge with agentPill + title/desc -->
										<div class="task-cell-content">
											{#if sessionTask}
												<div class="badge-and-text">
													<TaskIdBadge
														task={sessionTask}
														size="sm"
														variant="agentPill"
														agentName={sessionAgentName}
														showType={true}
														{statusDotColor}
														resumed={session.resumed}
														attached={session.attached}
														harness={getTaskHarness(sessionTask)}
													/>
													<div class="text-column">
														<div class="flex items-center gap-1.5">
															<span class="task-title" title={sessionTask.title}>
																{sessionTask.title || sessionTask.id}
															</span>
															{#if browserSessions.get(sessionAgentName)}
																<span class="browser-port-badge" title="Chrome DevTools on port {browserSessions.get(sessionAgentName)}">
																	<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
																	:{browserSessions.get(sessionAgentName)}
																</span>
															{/if}
														</div>
														{#if sessionTask.description}
															<div class="task-description">
																{sessionTask.description}
															</div>
														{/if}
													</div>
												</div>
											{:else}
												<!-- No task - show agent pill with project -->
												{@const planningColor = effectiveState === 'planning' ? 'oklch(0.68 0.20 270)' : (rowProjectColor || 'oklch(0.50 0.02 250)')}
												<div class="badge-and-text">
													<div class="inline-flex flex-col items-start flex-shrink-0">
														<button
															class="planning-pill"
															style="background: color-mix(in oklch, {planningColor} 12%, transparent); border: 1px solid color-mix(in oklch, {planningColor} 30%, transparent); color: {planningColor};"
															onclick={(e) => e.stopPropagation()}
														>
															<AgentAvatar name={sessionAgentName} size={20} showRing={true} sessionState={effectiveState} showGlow={true} />
															<span>{sessionAgentName}</span>
														</button>
														{#if derivedProject}
															<div class="flex items-center gap-1 mt-0.5 ml-8">
																<span
																	class="planning-project-tag"
																	style="color: {rowProjectColor || 'oklch(0.55 0.02 250)'};"
																>
																	{derivedProject}
																</span>
															</div>
														{/if}
													</div>
													<div class="text-column">
														{#if effectiveState === 'planning'}
															<span class="planning-title">Planning session</span>
															<div class="planning-description">Interactive brainstorming — no task assigned</div>
														{:else}
															<span class="no-task-label">No active task</span>
														{/if}
													</div>
												</div>
											{/if}
										</div>
									{/if}
								</td>
								<td class="td-status" onclick={(e) => e.stopPropagation()}>
									{#if session.type === 'agent'}
										{@const reviewStatus = sessionTask ? computeReviewStatus(sessionTask, getReviewRules()) : null}
										{@const reviewBasedDefault = reviewStatus?.action !== 'auto'}
										{@const autoCompleteDisabled = autoCompleteDisabledMap.get(session.name) ?? reviewBasedDefault}
										<div class="status-cell-content">
											<StatusActionBadge
												sessionState={(effectiveState) as SessionState}
												{elapsed}
												stacked={true}
												sessionName={session.name}
												alignRight={true}
												showCommands={true}
												showEpic={true}
												onCommand={(cmd) => sendWorkflowCommand(session.name, cmd)}
												onAction={async (actionId) => {
													if (actionId === 'attach') {
														await attachSession(session.name);
													} else if (actionId === 'kill' || actionId === 'cleanup') {
														await killSession(session.name);
													} else if (actionId === 'view-task' && sessionTask) {
														window.location.href = `/tasks?task=${sessionTask.id}`;
													} else if (actionId === 'complete' || actionId === 'complete-kill') {
														optimisticStates.set(session.name, 'completing');
														optimisticStates = new Map(optimisticStates);
														if (sessionTask) {
															try {
																await fetch(`/api/sessions/${encodeURIComponent(session.name)}/signal`, {
																	method: 'POST',
																	headers: { 'Content-Type': 'application/json' },
																	body: JSON.stringify({
																		type: 'completing',
																		data: {
																			taskId: sessionTask.id,
																			taskTitle: sessionTask.title,
																			currentStep: 'verifying',
																			progress: 0,
																			stepsCompleted: [],
																			stepsRemaining: ['verifying', 'committing', 'closing', 'releasing']
																		}
																	})
																});
															} catch (e) {
																console.warn('[Sessions] Failed to write completing signal:', e);
															}
														}
														const cmd = actionId === 'complete-kill' ? '/jat:complete --kill' : '/jat:complete';
														await sendWorkflowCommand(session.name, cmd);
													} else if (actionId === 'interrupt') {
														await fetch(`/api/work/${encodeURIComponent(session.name)}/input`, {
															method: 'POST',
															headers: { 'Content-Type': 'application/json' },
															body: JSON.stringify({ type: 'ctrl-c' })
														});
													} else if (actionId === 'escape') {
														await fetch(`/api/work/${encodeURIComponent(session.name)}/input`, {
															method: 'POST',
															headers: { 'Content-Type': 'application/json' },
															body: JSON.stringify({ type: 'escape' })
														});
													} else if (actionId === 'close-kill') {
														if (sessionTask) {
															try {
																await fetch(`/api/tasks/${encodeURIComponent(sessionTask.id)}/close`, {
																	method: 'POST',
																	headers: { 'Content-Type': 'application/json' },
																	body: JSON.stringify({ reason: 'Abandoned via Close & Kill' })
																});
															} catch (e) {
																console.warn('[Sessions] Failed to close task:', e);
															}
														}
														await killSession(session.name);
													} else if (actionId === 'pause') {
														optimisticStates.set(session.name, 'paused');
														optimisticStates = new Map(optimisticStates);
														if (sessionTask) {
															try {
																await fetch(`/api/sessions/${encodeURIComponent(session.name)}/pause`, {
																	method: 'POST',
																	headers: { 'Content-Type': 'application/json' },
																	body: JSON.stringify({
																		taskId: sessionTask.id,
																		taskTitle: sessionTask.title,
																		reason: 'Paused via StatusActionBadge',
																		killSession: true,
																		agentName: sessionAgentName,
																		project: session.project
																	})
																});
															} catch (e) {
																console.warn('[Sessions] Failed to pause session:', e);
															}
														} else {
															await killSession(session.name);
														}
													}
												}}
												task={sessionTask ? { id: sessionTask.id, issue_type: sessionTask.issue_type, priority: sessionTask.priority } : null}
												project={session.project || null}
												onViewEpic={(epicId) => {
													window.location.href = `/tasks?task=${epicId}`;
												}}
												autoCompleteEnabled={!autoCompleteDisabled}
												onAutoCompleteToggle={() => {
													const newMap = new Map(autoCompleteDisabledMap);
													newMap.set(session.name, !autoCompleteDisabled);
													autoCompleteDisabledMap = newMap;
												}}
												reviewReason={reviewStatus?.reason ?? null}
											/>
										</div>
									{:else}
										<!-- Server sessions: ServerStatusBadge -->
										<div class="status-cell-content">
											<ServerStatusBadge
												serverStatus="running"
												sessionName={session.name}
												alignRight={true}
												class="pr-2 pb-1 [&>button]:min-w-[150px] [&>button]:text-[13px] [&>button]:text-center [&>button]:pt-1.5 [&>button]:pb-1"
												onAction={async (actionId) => {
													if (actionId === 'stop') {
														await killSession(session.name);
													} else if (actionId === 'restart') {
														await killSession(session.name);
													} else if (actionId === 'attach') {
														await attachSession(session.name);
													}
												}}
											/>
										</div>
									{/if}
								</td>
							</tr>
							<!-- Expanded SessionCard row -->
							{#if isExpanded}
								{@const expandedAgentName = getAgentName(session.name)}
								{@const expandedTask = agentTasks.get(expandedAgentName)}
								{@const expandedSessionInfo = agentSessionInfo.get(expandedAgentName)}
								<tr class="expanded-row">
									<td colspan="2" class="expanded-content">
										<div class="expanded-session-wrapper" class:with-task-panel={expandedTask && taskDetailOpen && expandedTaskId === expandedTask.id} class:collapsing={isCollapsing}>
											<!-- SessionCard section -->
											<div class="session-card-section">
												<div class="expanded-session-card" style="height: {expandedHeight}px;">
													<SessionCard
														mode={session.type === 'server' ? 'server' : 'agent'}
														sessionName={session.name}
														agentName={expandedAgentName}
														headerless={true}
														task={expandedTask ? {
															id: expandedTask.id,
															title: expandedTask.title,
															status: expandedTask.status,
															priority: expandedTask.priority,
															issue_type: expandedTask.issue_type,
															description: expandedTask.description
														} : null}
														output={expandedOutput}
														tokens={expandedSessionInfo?.tokens ?? 0}
														cost={expandedSessionInfo?.cost ?? 0}
														sseState={expandedSessionInfo?.activityState}
														sseStateTimestamp={expandedSessionInfo?.activityStateTimestamp}
														startTime={session.created ? new Date(session.created) : null}
														created={session.created}
														attached={session.attached}
														onSendInput={(text, type) => sendExpandedInput(text, type)}
														onKillSession={() => {
															expandedSession = null;
															killSession(session.name);
														}}
														onInterrupt={() => {
															// Send Ctrl+C to session
															fetch(`/api/work/${encodeURIComponent(session.name)}/input`, {
																method: 'POST',
																headers: { 'Content-Type': 'application/json' },
																body: JSON.stringify({ type: 'ctrl-c' })
															});
														}}
														onAttachTerminal={() => attachSession(session.name)}
														onTaskClick={(taskId) => {
															// Toggle inline task detail panel
															if (expandedTaskId === taskId && taskDetailOpen) {
																taskDetailOpen = false;
																expandedTaskId = null;
																expandedTaskDetails = null;
															} else {
																expandedTaskId = taskId;
																taskDetailOpen = true;
																fetchExpandedTaskDetails(taskId);
															}
														}}
													/>
												</div>
												<!-- Horizontal resize handle for tmux width -->
												<HorizontalResizeHandle
													onResize={handleHorizontalResize}
													onResizeEnd={handleHorizontalResizeEnd}
												/>
												<!-- Width indicator - visible only during resize -->
												<div class="width-indicator" class:visible={isCardResizing}>{tmuxWidth} cols</div>
											</div>

											<!-- Inline Task Detail Panel -->
											{#if expandedTask && taskDetailOpen && expandedTaskId === expandedTask.id}
												<TaskDetailPane
													task={expandedTask}
													details={expandedTaskDetails}
													loading={taskDetailsLoading}
													height={expandedHeight}
													integration={expandedTaskIntegration}
													browserPort={browserSessions.get(expandedAgentName) || null}
													onViewTask={(taskId) => { window.location.href = `/tasks?task=${taskId}`; }}
												/>
											{/if}
										</div>
										<!-- Vertical resize divider for height -->
										<div
											class="resize-divider"
											class:resizing={isResizing}
											onmousedown={startResize}
											role="separator"
											aria-orientation="horizontal"
											tabindex="0"
										>
											<div class="resize-handle-vertical"></div>
										</div>
									</td>
								</tr>
							{/if}
						{/each}
					</tbody>
				</table>
				{/if}
			</div>

			<!-- Open Tasks (agents tab only, when project is selected) -->
			{#if activeTab === 'agents' && selectedProject && (openTasks.length > 0 || openTasksLoading)}
				<div class="open-tasks-section">
					<button
						class="open-tasks-header"
						onclick={() => openTasksCollapsed = !openTasksCollapsed}
					>
						<div class="open-tasks-header-left">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="open-tasks-chevron"
								class:collapsed={openTasksCollapsed}
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
							</svg>
							<span class="open-tasks-title">Open Tasks</span>
							<span class="open-tasks-count">{openTasks.length}</span>
							<span class="open-tasks-project">{selectedProject}</span>
						</div>
					</button>

					{#if !openTasksCollapsed}
						<div class="open-tasks-list">
							{#if openTasksLoading && openTasks.length === 0}
								<div class="open-tasks-loading">
									<span class="loading loading-spinner loading-xs"></span>
									<span>Loading tasks...</span>
								</div>
							{:else}
								{#each openTasks as task, i (task.id)}
									{@const projectColor = getProjectColorReactive(task.id)}
									{@const taskAttachments = openTaskImages?.[task.id]}
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<div
										class="open-task-row group"
										class:ot-has-selection={otSelectionCount > 0}
										use:reveal={{ animation: 'fade-in', delay: i * 0.04 }}
										onclick={() => openTaskDetailDrawer(task.id)}
									>

										<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
										<div class="ot-checkbox" onclick={(e) => { e.stopPropagation(); otToggleTask(task.id, e); }}>
											<input type="checkbox" checked={otSelectedTasks.has(task.id)} style="pointer-events: none;" />
										</div>
										<div class="open-task-badge">
											<TaskIdBadge
												task={{ id: task.id, status: task.status, title: task.title, issue_type: task.issue_type, priority: task.priority, created_at: task.created_at, labels: task.labels, integration: task.integration || null }}
												size="sm"
												variant="agentPill"
											/>
										</div>
										<div class="open-task-info">
											<span class="open-task-title" title={task.title}>{task.title}</span>
											{#if task.assignee}
												<span class="open-task-meta">assigned to {task.assignee}</span>
											{/if}
										</div>
										<!-- Attachment thumbnail -->
										<div class="open-task-attachment">
											{#if taskAttachments && taskAttachments.length > 0}
												{@const firstTypeInfo = getFileTypeInfoFromPath(taskAttachments[0].path)}
												<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
												<div class="ot-attachment-thumb" onclick={(e) => { e.stopPropagation(); window.open(`/api/work/image/${encodeURIComponent(taskAttachments[0].path)}`, '_blank'); }} title="View attachment">
													{#if firstTypeInfo.category === 'image'}
														<img src={`/api/work/image/${encodeURIComponent(taskAttachments[0].path)}`} alt="" class="ot-attachment-img" />
													{:else}
														<svg class="w-4 h-4" style="color: {firstTypeInfo.color};" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
															<path stroke-linecap="round" stroke-linejoin="round" d={firstTypeInfo.icon} />
														</svg>
													{/if}
													{#if taskAttachments.length > 1}
														<span class="ot-attachment-count">+{taskAttachments.length - 1}</span>
													{/if}
												</div>
											{/if}
										</div>

										<div class="open-task-actions">
											<!-- Due date -->
											<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
											<div class="ot-due-date" onclick={(e) => { e.stopPropagation(); openDueDatePicker(task, e); }}>
												{#if task.due_date}
													<span style="color: {getDueDateColor(task.due_date)}" title={task.due_date}>{formatDueDate(task.due_date)}</span>
												{:else}
													<svg class="ot-calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">
														<rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
													</svg>
												{/if}
											</div>
											<!-- Spawn button -->
											<div class="ot-spawn">
												{#if isHumanTask(task)}
													<div class="ot-human-icon" title="Human task — complete manually">
														<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4" style="color: oklch(0.70 0.18 45);">
															<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
														</svg>
													</div>
												{:else}
													<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
													<button
														class="ot-spawn-btn"
														class:ot-spawning={spawningTaskId === task.id}
														onclick={(e) => { e.stopPropagation(); handleSpawnOpenTask(task); }}
														disabled={spawningTaskId === task.id}
														title="Launch agent"
													>
														{#if spawningTaskId === task.id}
															<svg class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" /></svg>
														{:else}
															<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none">
																<path d="M12 2C12 2 8 6 8 12C8 15 9 17 10 18L10 21C10 21.5 10.5 22 11 22H13C13.5 22 14 21.5 14 21L14 18C15 17 16 15 16 12C16 6 12 2 12 2Z" fill="currentColor" />
																<circle cx="12" cy="10" r="2" fill="oklch(0.75 0.15 200)" />
																<path d="M8 14L5 17L6 18L8 16Z" fill="currentColor" />
																<path d="M16 14L19 17L18 18L16 16Z" fill="currentColor" />
															</svg>
														{/if}
													</button>
												{/if}
											</div>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="open-task-arrow">
												<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
											</svg>
										</div>
									</div>
								{/each}
							{/if}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Due date picker popover (fixed positioned) -->
			{#if dueDatePickerTaskId && dueDatePickerPos}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div class="fixed inset-0 z-40" onclick={closeDueDatePicker}></div>
				<div class="ot-due-date-picker z-50" style="position: fixed; top: {dueDatePickerPos.y}px; left: {dueDatePickerPos.x}px;">
					<div class="ot-picker-header">Set Due Date</div>
					<div class="ot-picker-fields">
						<input type="date" class="ot-picker-input" bind:value={dueDateTempValue} />
						<input type="time" class="ot-picker-input ot-picker-time" bind:value={dueDateTempTime} />
					</div>
					<div class="ot-picker-actions">
						<button class="ot-picker-btn ot-picker-clear" onclick={clearDueDate} disabled={dueDateSaving}>Clear</button>
						<div class="ot-picker-spacer"></div>
						<button class="ot-picker-btn ot-picker-cancel" onclick={closeDueDatePicker}>Cancel</button>
						<button class="ot-picker-btn ot-picker-save" onclick={saveDueDate} disabled={dueDateSaving || !dueDateTempValue}>
							{#if dueDateSaving}Saving...{:else}Save{/if}
						</button>
					</div>
				</div>
			{/if}

			<!-- Recently Closed Sessions (agents tab only) -->
			{#if activeTab === 'agents' && recentSessions.length > 0}
				<div class="recent-section">
					<button
						class="recent-header"
						onclick={() => recentCollapsed = !recentCollapsed}
					>
						<div class="recent-header-left">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="recent-chevron"
								class:collapsed={recentCollapsed}
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
							</svg>
							<span class="recent-title">Recently Closed</span>
							<span class="recent-count">{recentTotal || recentSessions.length}</span>
						</div>
					</button>

					{#if !recentCollapsed}
						<div class="recent-list">
							{#each recentDayGroups as dayGroup, gi (dayGroup.date)}
								<div class="recent-day-group" use:reveal={{ animation: 'fade-in', delay: gi * 0.08 }}>
									<div class="recent-day-header">
										<span class="recent-day-date">{dayGroup.displayDate}</span>
										<span class="recent-day-count">{dayGroup.sessions.length}</span>
									</div>
									{#each dayGroup.sessions as recent, ri (recent.sessionName)}
										{@const projectColor = recent.project ? getProjectColorReactive(recent.taskId || recent.project) : null}
										{@const stateVisual = getSessionStateVisual(recent.lastState as SessionState)}
										{@const recentStatusDotColor = stateVisual.accent}
										<!-- svelte-ignore a11y_no_static_element_interactions -->
										<div use:reveal={{ animation: 'fade-in', delay: ri * 0.05 }}
											class="recent-row group"
											onclick={() => handleRecentRowClick(recent)}
											oncontextmenu={(e) => handleRecentContextMenu(recent, e)}
										>
											{#if recent.taskCreatedAt}
												<DurationTrack
													createdAt={recent.taskCreatedAt}
													endedAt={recent.taskClosedAt || recent.taskUpdatedAt || recent.timestamp}
												/>
											{:else}
												<span class="recent-time" title="Last active: {new Date(recent.timestamp).toLocaleString()}">{formatElapsed(recent.timestamp)} ago</span>
											{/if}
											<div class="recent-badge">
												{#if recent.taskId && recent.taskId !== 'unknown'}
													<TaskIdBadge
														task={{ id: recent.taskId, status: recent.taskStatus || (recent.lastState === 'complete' || recent.lastState === 'completed' ? 'closed' : 'open'), title: recent.taskTitle || undefined, integration: recent.integration || null }}
														size="sm"
														variant="agentPill"
														agentName={recent.agentName}
														showType={false}
														statusDotColor={recentStatusDotColor}
													/>
												{:else}
													<AgentAvatar name={recent.agentName} size={28} />
													<span class="recent-agent-id">{recent.agentName}</span>
												{/if}
											</div>
											<div class="recent-info">
												{#if recent.taskTitle}
													<span class="recent-task-title" title={recent.taskTitle}>{recent.taskTitle}</span>
												{/if}
												{#if recent.agentName}
													<span class="recent-meta">by {recent.agentName}</span>
												{/if}
											</div>
											<div class="recent-actions">
												{#if recent.taskId && recent.taskId !== 'unknown'}
													<button
														type="button"
														class="recent-action-btn recent-reopen-btn"
														onclick={(e) => { e.stopPropagation(); ctxChangeStatus(recent.taskId!, 'open'); }}
														title="Reopen task"
													>
														<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
															<path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
														</svg>
													</button>
													<button
														type="button"
														class="recent-action-btn recent-duplicate-btn"
														onclick={(e) => { e.stopPropagation(); ctxDuplicateTask({ id: recent.taskId!, title: recent.taskTitle || '', issue_type: recent.taskType || 'task', priority: recent.taskPriority ?? 2, description: '' } as AgentTask); }}
														title="Duplicate task"
													>
														<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
															<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
														</svg>
													</button>
												{/if}
												<button
													class="recent-action-btn recent-resume-btn"
													onclick={(e) => { e.stopPropagation(); resumeSession(recent); }}
													disabled={resumingSession === recent.sessionName}
													title="Resume session with {recent.agentName}"
												>
													{#if resumingSession === recent.sessionName}
														<span class="loading loading-spinner loading-xs"></span>
													{:else}
														<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
															<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
														</svg>
													{/if}
												</button>
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="recent-arrow">
													<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
												</svg>
											</div>
										</div>
									{/each}
								</div>
							{/each}

							{#if recentHasMore}
								<button
									class="load-more-btn"
									onclick={loadMoreRecentSessions}
									disabled={recentLoadingMore}
								>
									{#if recentLoadingMore}
										<span class="loading loading-spinner loading-xs"></span>
										Loading...
									{:else}
										Load another day
									{/if}
								</button>
							{/if}
						</div>
					{/if}
				</div>
			{/if}

		{/if}
		</div>
	</div>

	<!-- Attach feedback toast -->
	{#if attachMessage}
		<div
			class="attach-toast"
			class:error={attachMessage.method === 'error'}
			class:success={attachMessage.method !== 'error'}
		>
			{#if attachMessage.method === 'error'}
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="toast-icon">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
				</svg>
			{:else}
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="toast-icon">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
				</svg>
			{/if}
			<div class="toast-content">
				<span class="toast-session">{attachMessage.session}</span>
				<span class="toast-message">{attachMessage.message}</span>
			</div>
			<button class="toast-close" onclick={() => attachMessage = null}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	{/if}
</div>

<!-- Context Menu -->
{#if ctxData}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="ctx-menu"
		class:ctx-menu-hidden={!ctxVisible}
		style="left: {ctxX}px; top: {ctxY}px;"
		onclick={(e) => e.stopPropagation()}
	>
		<!-- View Details (agent sessions with task) -->
		{#if ctxData.task}
			<button class="ctx-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; }} onclick={() => {
				const t = ctxData!.task!;
				closeCtxMenu();
				expandedTaskId = t.id;
				taskDetailOpen = true;
			}}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
					<circle cx="12" cy="12" r="3" />
				</svg>
				<span>View Details</span>
			</button>
		{/if}

		<!-- Attach Terminal -->
		<button class="ctx-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; }} onclick={() => {
			const name = ctxData!.session.name;
			closeCtxMenu();
			ctxData = null;
			attachSession(name);
		}}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="4 17 10 11 4 5" />
				<line x1="12" y1="19" x2="20" y2="19" />
			</svg>
			<span>Attach Terminal</span>
		</button>

		<div class="ctx-divider"></div>

		<!-- Change Status (submenu) - agent sessions with task -->
		{#if ctxData.task}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="ctx-submenu-container"
				onmouseenter={() => { ctxStatusSubmenuOpen = true; }}
				onmouseleave={() => { ctxStatusSubmenuOpen = false; }}
			>
				<button class="ctx-item ctx-item-has-submenu">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
						<polyline points="22 4 12 14.01 9 11.01" />
					</svg>
					<span>Change Status</span>
					<svg class="ctx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 18 15 12 9 6" />
					</svg>
				</button>
				{#if ctxStatusSubmenuOpen}
					<div class="ctx-submenu">
						{#each [
							{ value: 'open', label: 'Open', color: 'oklch(0.70 0.15 220)' },
							{ value: 'in_progress', label: 'In Progress', color: 'oklch(0.75 0.15 85)' },
							{ value: 'blocked', label: 'Blocked', color: 'oklch(0.65 0.18 30)' },
							{ value: 'closed', label: 'Closed', color: 'oklch(0.65 0.18 145)' }
						] as status}
							<button
								class="ctx-item {ctxData!.task!.status === status.value ? 'ctx-item-active' : ''}"
								onclick={() => ctxChangeStatus(ctxData!.task!.id, status.value)}
							>
								<span class="ctx-status-dot" style="background: {status.color};"></span>
								<span>{status.label}</span>
								{#if ctxData!.task!.status === status.value}
									<svg class="ctx-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<polyline points="20 6 9 17 4 12" />
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Duplicate (agent with task) -->
		{#if ctxData.task}
			<button class="ctx-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; }} onclick={() => ctxDuplicateTask(ctxData!.task!)}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
					<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
				</svg>
				<span>Duplicate</span>
			</button>
		{/if}

		<div class="ctx-divider"></div>

		<!-- Interrupt (agent sessions) -->
		{#if ctxData.session.type === 'agent'}
			<button class="ctx-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; }} onclick={async () => {
				const name = ctxData!.session.name;
				closeCtxMenu();
				ctxData = null;
				await fetch(`/api/work/${encodeURIComponent(name)}/input`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ type: 'ctrl-c' })
				});
			}}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10" />
					<rect x="9" y="9" width="6" height="6" rx="1" />
				</svg>
				<span>Interrupt</span>
			</button>
		{/if}

		<!-- Pause (agent with task) -->
		{#if ctxData.task}
			<button class="ctx-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; }} onclick={async () => {
				const d = ctxData!;
				closeCtxMenu();
				ctxData = null;
				optimisticStates.set(d.session.name, 'paused');
				optimisticStates = new Map(optimisticStates);
				if (d.task) {
					await fetch(`/api/sessions/${encodeURIComponent(d.session.name)}/pause`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							taskId: d.task.id,
							taskTitle: d.task.title,
							reason: 'Paused via context menu',
							killSession: true,
							agentName: d.agentName,
							project: d.session.project
						})
					});
				}
			}}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10" />
					<line x1="10" y1="15" x2="10" y2="9" />
					<line x1="14" y1="15" x2="14" y2="9" />
				</svg>
				<span>Pause</span>
			</button>
		{/if}

		<!-- Complete (agent with task) -->
		{#if ctxData.task}
			<button class="ctx-item ctx-item-success" onmouseenter={() => { ctxStatusSubmenuOpen = false; }} onclick={async () => {
				const d = ctxData!;
				closeCtxMenu();
				ctxData = null;
				optimisticStates.set(d.session.name, 'completing');
				optimisticStates = new Map(optimisticStates);
				if (d.task) {
					try {
						await fetch(`/api/sessions/${encodeURIComponent(d.session.name)}/signal`, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								type: 'completing',
								data: {
									taskId: d.task.id,
									taskTitle: d.task.title,
									currentStep: 'verifying',
									progress: 0,
									stepsCompleted: [],
									stepsRemaining: ['verifying', 'committing', 'closing', 'releasing']
								}
							})
						});
					} catch (_) { /* ignore */ }
				}
				await sendWorkflowCommand(d.session.name, '/jat:complete');
			}}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
					<polyline points="22 4 12 14.01 9 11.01" />
				</svg>
				<span>Complete</span>
			</button>
		{/if}

		<div class="ctx-divider"></div>

		<!-- Kill Session (all session types) -->
		<button class="ctx-item ctx-item-danger" onmouseenter={() => { ctxStatusSubmenuOpen = false; }} onclick={async () => {
			const d = ctxData!;
			closeCtxMenu();
			ctxData = null;
			if (d.task) {
				try {
					await fetch(`/api/tasks/${encodeURIComponent(d.task.id)}/close`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ reason: 'Closed via context menu' })
					});
				} catch (_) { /* ignore */ }
			}
			await killSession(d.session.name);
		}}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10" />
				<line x1="15" y1="9" x2="9" y2="15" />
				<line x1="9" y1="9" x2="15" y2="15" />
			</svg>
			<span>{ctxData.task ? 'Close & Kill' : 'Kill Session'}</span>
		</button>
	</div>
{/if}

<!-- Recently Closed Context Menu -->
{#if recentCtxData}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="ctx-menu"
		class:ctx-menu-hidden={!recentCtxVisible}
		style="left: {recentCtxX}px; top: {recentCtxY}px;"
		onclick={(e) => e.stopPropagation()}
	>
		<!-- View Details -->
		{#if recentCtxData.taskId && recentCtxData.taskId !== 'unknown'}
			<button class="ctx-item" onmouseenter={() => { recentCtxStatusSubmenuOpen = false; }} onclick={() => {
				const id = recentCtxData!.taskId!;
				closeCtxMenu();
				openTaskDetailDrawer(id);
			}}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
					<circle cx="12" cy="12" r="3" />
				</svg>
				<span>View Details</span>
			</button>
		{/if}

		<!-- Resume Session -->
		<button class="ctx-item" onmouseenter={() => { recentCtxStatusSubmenuOpen = false; }} onclick={() => {
			const recent = recentCtxData!;
			closeCtxMenu();
			resumeSession(recent);
		}}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polygon points="5 3 19 12 5 21 5 3" />
			</svg>
			<span>Resume Session</span>
		</button>

		{#if recentCtxData.taskId && recentCtxData.taskId !== 'unknown'}
			<div class="ctx-divider"></div>

			<!-- Change Status (submenu) -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="ctx-submenu-container"
				onmouseenter={() => { recentCtxStatusSubmenuOpen = true; }}
				onmouseleave={() => { recentCtxStatusSubmenuOpen = false; }}
			>
				<button class="ctx-item ctx-item-has-submenu">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
						<polyline points="22 4 12 14.01 9 11.01" />
					</svg>
					<span>Change Status</span>
					<svg class="ctx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 18 15 12 9 6" />
					</svg>
				</button>
				{#if recentCtxStatusSubmenuOpen}
					{@const currentStatus = recentCtxData!.taskStatus || (recentCtxData!.lastState === 'complete' || recentCtxData!.lastState === 'completed' ? 'closed' : 'open')}
					<div class="ctx-submenu">
						{#each [
							{ value: 'open', label: 'Open', color: 'oklch(0.70 0.15 220)' },
							{ value: 'in_progress', label: 'In Progress', color: 'oklch(0.75 0.15 85)' },
							{ value: 'blocked', label: 'Blocked', color: 'oklch(0.65 0.18 30)' },
							{ value: 'closed', label: 'Closed', color: 'oklch(0.65 0.18 145)' }
						] as status}
							<button
								class="ctx-item {currentStatus === status.value ? 'ctx-item-active' : ''}"
								onclick={() => ctxChangeStatus(recentCtxData!.taskId!, status.value)}
							>
								<span class="ctx-status-dot" style="background: {status.color};"></span>
								<span>{status.label}</span>
								{#if currentStatus === status.value}
									<svg class="ctx-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<polyline points="20 6 9 17 4 12" />
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.tmux-page {
		min-height: 100vh;
		padding: 1.5rem;
	}

	/* Header */
	.tmux-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1.5rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	.header-left {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.page-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.5rem;
		font-weight: 600;
		color: oklch(0.90 0.02 250);
		margin: 0;
		font-family: ui-monospace, monospace;
	}

	.title-icon {
		width: 24px;
		height: 24px;
		color: oklch(0.70 0.15 200);
	}

	.page-subtitle {
		font-size: 0.8rem;
		color: oklch(0.55 0.02 250);
		margin: 0;
		font-family: ui-monospace, monospace;
	}

	/* Table controls (tabs + sort) above the session table */
	.table-controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.75rem;
	}

	.table-controls-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* Content wrapper - full width */
	.tmux-content-wrapper {
		position: relative;
	}

	/* Content - full width */
	.tmux-content {
		width: 100%;
	}

	/* Loading skeleton */
	.loading-skeleton {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.skeleton-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		background: oklch(0.18 0.01 250);
		border-radius: 8px;
	}

	.skeleton {
		background: oklch(0.25 0.02 250);
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	/* Error state */
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
		gap: 1rem;
	}

	.error-icon {
		width: 48px;
		height: 48px;
		color: oklch(0.65 0.15 30);
	}

	.error-text {
		color: oklch(0.70 0.12 30);
		font-size: 0.9rem;
		margin: 0;
	}

	.retry-btn {
		padding: 0.5rem 1rem;
		background: oklch(0.25 0.02 250);
		border: 1px solid oklch(0.35 0.02 250);
		border-radius: 6px;
		color: oklch(0.80 0.02 250);
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.retry-btn:hover {
		background: oklch(0.30 0.02 250);
	}

	/* Empty state */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem;
		gap: 0.75rem;
		color: oklch(0.50 0.02 250);
	}

	.empty-icon {
		width: 64px;
		height: 64px;
		color: oklch(0.35 0.02 250);
	}

	.empty-title {
		font-size: 1rem;
		font-weight: 500;
		color: oklch(0.60 0.02 250);
		margin: 0;
	}

	.empty-hint {
		font-size: 0.85rem;
		color: oklch(0.50 0.02 250);
		margin: 0;
	}

	/* Sessions table */
	.sessions-table-wrapper {
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 8px;
		/* Note: overflow: hidden removed to allow dropdowns to escape the table bounds */
		/* Use overflow-x: clip to contain expanded content width without cutting off dropdowns */
		overflow-x: clip;
	}

	.sessions-table {
		width: 100%;
		border-collapse: collapse;
		font-family: ui-monospace, monospace;
		table-layout: fixed;
	}

	.sessions-table thead {
		background: oklch(0.20 0.01 250);
		border-bottom: 1px solid oklch(0.28 0.02 250);
	}

	.sessions-table th {
		text-align: left;
		padding: 0.75rem 1rem;
		font-size: 0.7rem;
		font-weight: 600;
		color: oklch(0.55 0.02 250);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.sessions-table tbody tr {
		border-bottom: 1px solid oklch(0.22 0.02 250);
		transition: all 0.15s;
		cursor: pointer;
	}

	.sessions-table tbody tr:last-child {
		border-bottom: none;
	}

	.sessions-table tbody tr:hover {
		background: oklch(0.20 0.02 250);
	}

	.sessions-table tbody tr.attached {
		background: oklch(0.65 0.15 145 / 0.08);
	}

	.sessions-table tbody tr.attached:hover {
		background: oklch(0.65 0.15 145 / 0.12);
	}

	.sessions-table tbody tr.selected {
		background: oklch(0.65 0.15 200 / 0.12);
		outline: 1px solid oklch(0.65 0.15 200 / 0.3);
	}

	.sessions-table td {
		padding: 0.875rem 1rem;
		font-size: 0.85rem;
		color: oklch(0.75 0.02 250);
	}

	/* Two-column layout widths: Task (auto) | Status (fixed 160px) */
	.th-task, .td-task { width: auto; padding-left: 0.25rem; padding-right: 0.25rem; }
	.th-status, .td-status { width: 160px; text-align: right; }

	/* Task column */
	.task-cell-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.25rem;
		min-width: 0;
		width: 100%;
	}

	/* Badge + text side by side */
	.badge-and-text {
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
		min-width: 0;
		width: 100%;
	}

	.text-column {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
		flex: 1;
		padding-top: 0.125rem;
	}

	/* Status column */
	.status-cell-content {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.375rem;
		justify-content: center;
	}

	.session-name {
		font-size: 0.75rem;
		font-weight: 500;
		color: oklch(0.65 0.02 250);
	}

	.session-name-pill {
		font-size: 0.75rem;
		font-weight: 600;
		color: oklch(0.75 0.10 250);
		background: oklch(0.25 0.02 250);
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		font-family: ui-monospace, monospace;
	}

	.project-badge {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		border: 1px solid;
		font-family: ui-monospace, monospace;
	}

	.no-task-label {
		font-size: 0.75rem;
		color: oklch(0.50 0.02 250);
		font-style: italic;
	}

	/* Planning session pill - mirrors TaskIdBadge agentPill */
	.planning-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-family: ui-monospace, monospace;
		font-weight: 500;
		font-size: 0.875rem;
		padding: 0.125rem 0.625rem 0.125rem 0.125rem;
		border-radius: 9999px;
		cursor: default;
		white-space: nowrap;
	}

	.planning-project-tag {
		font-size: 0.6875rem;
		font-weight: 500;
		font-family: ui-monospace, monospace;
		opacity: 0.7;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.planning-title {
		font-size: 0.8rem;
		font-weight: 500;
		color: oklch(0.75 0.15 270);
	}

	.planning-description {
		font-size: 0.7rem;
		color: oklch(0.50 0.02 250);
	}

	.task-title {
		font-size: 0.8rem;
		font-weight: 500;
		color: oklch(0.80 0.02 250);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
		min-width: 0; /* Allow truncation */
	}

	.task-description {
		font-size: 0.7rem;
		color: oklch(0.55 0.02 250);
		margin-top: 0.25rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		width: 100%;
		max-width: 100%;
	}

	.browser-port-badge {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		font-size: 0.65rem;
		font-weight: 500;
		padding: 1px 5px;
		border-radius: 4px;
		background: oklch(0.70 0.15 55 / 0.12);
		color: oklch(0.75 0.15 55);
		border: 1px solid oklch(0.70 0.15 55 / 0.25);
		flex-shrink: 0;
		white-space: nowrap;
	}

	/* Sessions Collapse Header */
	.sessions-collapse-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: oklch(0.18 0.01 250);
		border: none;
		border-bottom: 1px solid oklch(0.22 0.02 250);
		cursor: pointer;
		width: 100%;
		text-align: left;
		transition: background 0.15s;
	}

	.sessions-collapse-header:hover {
		background: oklch(0.18 0.01 250);
	}

	.sessions-collapse-header-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.sessions-collapse-chevron {
		width: 14px;
		height: 14px;
		color: oklch(0.55 0.02 250);
		transition: transform 0.2s;
	}

	.sessions-collapse-chevron.collapsed {
		transform: rotate(-90deg);
	}

	.sessions-collapse-title {
		font-size: 0.8rem;
		font-weight: 600;
		color: oklch(0.65 0.02 250);
	}

	.sessions-collapse-count {
		font-size: 0.7rem;
		font-weight: 600;
		color: oklch(0.55 0.02 250);
		background: oklch(0.22 0.02 250);
		padding: 0.05rem 0.4rem;
		border-radius: 9999px;
		font-family: ui-monospace, monospace;
	}

	/* Open Tasks Section */
	.open-tasks-section {
		margin-top: 1.5rem;
	}

	.open-tasks-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.22 0.02 250);
		border-radius: 6px 6px 0 0;
		cursor: pointer;
		width: 100%;
		text-align: left;
		transition: background 0.15s;
	}

	.open-tasks-header:hover {
		background: oklch(0.18 0.01 250);
	}

	.open-tasks-header-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.open-tasks-chevron {
		width: 14px;
		height: 14px;
		color: oklch(0.55 0.02 250);
		transition: transform 0.2s;
	}

	.open-tasks-chevron.collapsed {
		transform: rotate(-90deg);
	}

	.open-tasks-title {
		font-size: 0.8rem;
		font-weight: 600;
		color: oklch(0.65 0.02 250);
	}

	.open-tasks-count {
		font-size: 0.7rem;
		font-weight: 600;
		color: oklch(0.55 0.02 250);
		background: oklch(0.22 0.02 250);
		padding: 0.05rem 0.4rem;
		border-radius: 9999px;
		font-family: ui-monospace, monospace;
	}

	.open-tasks-project {
		font-size: 0.65rem;
		font-weight: 500;
		color: oklch(0.50 0.08 200);
		background: oklch(0.22 0.04 200);
		padding: 0.05rem 0.4rem;
		border-radius: 9999px;
		font-family: ui-monospace, monospace;
	}

	.open-tasks-list {
		border: 1px solid oklch(0.22 0.02 250);
		border-top: none;
		border-radius: 0 0 6px 6px;
		overflow: hidden;
	}

	.open-tasks-loading {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		font-size: 0.8rem;
		color: oklch(0.55 0.02 250);
	}

	.open-task-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 1rem;
		background: transparent;
		cursor: pointer;
		transition: background 0.15s ease;
		border-bottom: 1px solid oklch(from var(--color-base-300) l c h / 60%);
	}

	.open-task-row:last-child {
		border-bottom: none;
	}

	.open-task-row:hover {
		background: var(--color-base-200);
	}

	/* Checkbox column */
	.ot-checkbox {
		width: 28px;
		min-width: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		cursor: pointer;
	}

	.ot-checkbox input {
		width: 14px;
		height: 14px;
		cursor: pointer;
		accent-color: oklch(0.70 0.18 240);
		opacity: 0;
		transition: opacity 0.15s;
	}

	.open-task-row:hover .ot-checkbox input,
	.ot-checkbox input:checked,
	.ot-has-selection .ot-checkbox input {
		opacity: 1;
	}

	.open-task-badge {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.open-task-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.open-task-title {
		font-size: 0.85rem;
		color: var(--color-base-content);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.open-task-meta {
		font-size: 0.7rem;
		color: oklch(0.55 0.02 250);
	}

	.open-task-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.open-task-arrow {
		width: 16px;
		height: 16px;
		color: oklch(from var(--color-base-content) l c h / 45%);
		flex-shrink: 0;
		transition: color 0.15s ease, transform 0.15s ease;
	}

	.open-task-row:hover .open-task-arrow {
		color: oklch(from var(--color-base-content) l c h / 65%);
		transform: translateX(2px);
	}

	/* Attachment thumbnail */
	.open-task-attachment {
		width: 28px;
		height: 28px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ot-attachment-thumb {
		position: relative;
		width: 28px;
		height: 28px;
		border-radius: 4px;
		overflow: hidden;
		cursor: pointer;
		border: 1px solid oklch(0.30 0.02 250);
		display: flex;
		align-items: center;
		justify-content: center;
		background: oklch(0.18 0.01 250);
		transition: border-color 0.15s;
	}

	.ot-attachment-thumb:hover {
		border-color: oklch(0.45 0.05 250);
	}

	.ot-attachment-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.ot-attachment-count {
		position: absolute;
		bottom: -2px;
		right: -2px;
		font-size: 0.5rem;
		font-weight: 700;
		background: oklch(0.35 0.10 240);
		color: oklch(0.90 0.05 240);
		padding: 0px 3px;
		border-radius: 4px;
		line-height: 1.2;
	}

	/* Due date */
	.ot-due-date {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 60px;
		padding: 2px 4px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.7rem;
		font-weight: 500;
		transition: background 0.15s;
		flex-shrink: 0;
	}

	.ot-due-date:hover {
		background: oklch(0.22 0.02 250);
	}

	.ot-calendar-icon {
		opacity: 0;
		color: oklch(0.45 0.02 250);
		transition: opacity 0.15s;
	}

	.open-task-row:hover .ot-calendar-icon {
		opacity: 0.5;
	}

	/* Spawn button */
	.ot-spawn {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.ot-human-icon {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.5;
		cursor: default;
	}

	.ot-spawn-btn {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: transparent;
		border-radius: 4px;
		cursor: pointer;
		color: oklch(0.55 0.02 250);
		transition: background 0.15s, color 0.15s;
		padding: 0;
	}

	.ot-spawn-btn:hover {
		background: oklch(0.25 0.08 200);
		color: oklch(0.80 0.15 200);
	}

	.ot-spawn-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.ot-spawn-btn.ot-spawning {
		color: oklch(0.70 0.15 200);
	}

	/* Due date picker popover */
	.ot-due-date-picker {
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.03 250);
		border-radius: 8px;
		padding: 0.75rem;
		min-width: 220px;
		box-shadow: 0 8px 32px oklch(0 0 0 / 0.5);
	}

	.ot-picker-header {
		font-size: 0.75rem;
		font-weight: 600;
		color: oklch(0.70 0.02 250);
		margin-bottom: 0.5rem;
	}

	.ot-picker-fields {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		margin-bottom: 0.625rem;
	}

	.ot-picker-input {
		width: 100%;
		padding: 0.35rem 0.5rem;
		font-size: 0.75rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 4px;
		color: var(--color-base-content);
		outline: none;
	}

	.ot-picker-input:focus {
		border-color: oklch(0.50 0.15 200);
	}

	.ot-picker-actions {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.ot-picker-spacer {
		flex: 1;
	}

	.ot-picker-btn {
		padding: 0.25rem 0.625rem;
		font-size: 0.7rem;
		font-weight: 500;
		border-radius: 4px;
		border: 1px solid oklch(0.25 0.02 250);
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s;
	}

	.ot-picker-clear {
		background: transparent;
		color: oklch(0.65 0.15 25);
		border-color: oklch(0.40 0.10 25 / 0.3);
	}

	.ot-picker-clear:hover {
		background: oklch(0.25 0.08 25 / 0.2);
	}

	.ot-picker-cancel {
		background: transparent;
		color: oklch(0.60 0.02 250);
	}

	.ot-picker-cancel:hover {
		background: oklch(0.22 0.02 250);
	}

	.ot-picker-save {
		background: oklch(0.35 0.12 200);
		color: oklch(0.90 0.05 200);
		border-color: oklch(0.45 0.12 200);
	}

	.ot-picker-save:hover {
		background: oklch(0.40 0.14 200);
	}

	.ot-picker-save:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Recently Closed Sessions */
	.recent-section {
		margin-top: 1.5rem;
	}

	.recent-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.22 0.02 250);
		border-radius: 6px 6px 0 0;
		cursor: pointer;
		width: 100%;
		text-align: left;
		transition: background 0.15s;
	}

	.recent-header:hover {
		background: oklch(0.18 0.01 250);
	}

	.recent-header-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.recent-chevron {
		width: 14px;
		height: 14px;
		color: oklch(0.55 0.02 250);
		transition: transform 0.2s;
	}

	.recent-chevron.collapsed {
		transform: rotate(-90deg);
	}

	.recent-title {
		font-size: 0.8rem;
		font-weight: 600;
		color: oklch(0.65 0.02 250);
	}

	.recent-count {
		font-size: 0.7rem;
		font-weight: 600;
		color: oklch(0.55 0.02 250);
		background: oklch(0.22 0.02 250);
		padding: 0.05rem 0.4rem;
		border-radius: 9999px;
		font-family: ui-monospace, monospace;
	}

	.recent-list {
		border: 1px solid oklch(0.22 0.02 250);
		border-top: none;
		border-radius: 0 0 6px 6px;
		overflow: hidden;
	}

	.recent-day-group:not(:first-child) {
		border-top: 1px solid oklch(0.22 0.02 250);
	}

	.recent-day-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.4rem 1rem;
		background: oklch(0.16 0.01 250);
		border-bottom: 1px solid oklch(0.22 0.02 250);
	}

	.recent-day-date {
		font-size: 0.75rem;
		font-weight: 600;
		color: oklch(0.60 0.02 250);
		font-family: ui-monospace, monospace;
		letter-spacing: 0.02em;
	}

	.recent-day-count {
		font-size: 0.65rem;
		font-weight: 600;
		color: oklch(0.50 0.02 250);
		background: oklch(0.20 0.02 250);
		padding: 0.05rem 0.35rem;
		border-radius: 9999px;
		font-family: ui-monospace, monospace;
	}

	.recent-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 1rem;
		background: transparent;
		cursor: pointer;
		transition: background 0.15s ease;
		border-bottom: 1px solid oklch(from var(--color-base-300) l c h / 60%);
	}

	.recent-row:last-child {
		border-bottom: none;
	}

	.recent-row:hover {
		background: var(--color-base-200);
	}

	.recent-badge {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.recent-agent-id {
		font-size: 0.75rem;
		font-family: ui-monospace, monospace;
		font-weight: 600;
		line-height: 1;
		color: oklch(0.75 0.02 250);
		white-space: nowrap;
	}

	.recent-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.recent-task-title {
		font-size: 0.85rem;
		color: var(--color-base-content);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.recent-meta {
		font-size: 0.7rem;
		color: var(--color-success);
	}

	.recent-time {
		font-size: 0.7rem;
		color: oklch(0.50 0.02 250);
		font-family: ui-monospace, monospace;
		white-space: nowrap;
		min-width: 5rem;
		flex-shrink: 0;
	}

	.recent-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.recent-action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 6px;
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.15s ease, background 0.15s ease, transform 0.15s ease;
		flex-shrink: 0;
	}

	.recent-row:hover .recent-action-btn {
		opacity: 1;
	}

	.recent-reopen-btn {
		background: oklch(from var(--color-warning) l c h / 12%);
		border: 1px solid oklch(from var(--color-warning) l c h / 25%);
		color: oklch(from var(--color-warning) l c h / 70%);
	}

	.recent-reopen-btn:hover {
		background: oklch(from var(--color-warning) l c h / 22%);
		border-color: oklch(from var(--color-warning) l c h / 45%);
		color: oklch(from var(--color-warning) l c h / 90%);
		transform: scale(1.05);
	}

	.recent-duplicate-btn {
		background: oklch(from var(--color-secondary) l c h / 12%);
		border: 1px solid oklch(from var(--color-secondary) l c h / 25%);
		color: oklch(from var(--color-secondary) l c h / 70%);
	}

	.recent-duplicate-btn:hover {
		background: oklch(from var(--color-secondary) l c h / 22%);
		border-color: oklch(from var(--color-secondary) l c h / 45%);
		color: oklch(from var(--color-secondary) l c h / 90%);
		transform: scale(1.05);
	}

	.recent-resume-btn {
		background: oklch(from var(--color-success) l c h / 15%);
		border: 1px solid oklch(from var(--color-success) l c h / 30%);
		color: var(--color-success);
	}

	.recent-resume-btn:hover:not(:disabled) {
		background: oklch(from var(--color-success) l c h / 25%);
		border-color: oklch(from var(--color-success) l c h / 50%);
		transform: scale(1.05);
	}

	.recent-resume-btn:disabled {
		cursor: not-allowed;
		opacity: 0.6 !important;
	}

	.recent-arrow {
		width: 16px;
		height: 16px;
		color: oklch(from var(--color-base-content) l c h / 45%);
		flex-shrink: 0;
		transition: color 0.15s ease, transform 0.15s ease;
	}

	.recent-row:hover .recent-arrow {
		color: oklch(from var(--color-base-content) l c h / 65%);
		transform: translateX(2px);
	}

	.load-more-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		width: 80%;
		padding: 0.5rem;
		margin: 0.5rem auto;
		background: transparent;
		border: 1px dashed oklch(0.3 0.02 250);
		border-radius: 0.5rem;
		color: oklch(0.55 0.02 250);
		font-size: 0.8rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.load-more-btn:hover:not(:disabled) {
		background: oklch(0.18 0.01 250);
		border-color: oklch(0.4 0.02 250);
		color: oklch(0.7 0.02 250);
	}

	.load-more-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Tmux tip tooltip (next to SessionsTabs) */
	.tmux-tip-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.tmux-tip-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 4px;
		color: oklch(0.45 0.02 250);
		transition: color 0.15s ease;
	}

	.tmux-tip-btn:hover {
		color: oklch(0.70 0.10 200);
	}

	.tmux-tip-icon {
		width: 16px;
		height: 16px;
	}

	.tmux-tip-tooltip {
		display: none;
		position: absolute;
		top: calc(100% + 6px);
		left: 0;
		white-space: nowrap;
		padding: 0.5rem 0.75rem;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 6px;
		box-shadow: 0 4px 12px oklch(0.05 0 0 / 0.4);
		font-size: 0.8rem;
		color: oklch(0.55 0.02 250);
		gap: 0.375rem;
		align-items: center;
		z-index: 50;
	}

	.tmux-tip-btn:hover .tmux-tip-tooltip {
		display: flex;
	}

	.tmux-tip-label {
		color: oklch(0.60 0.02 250);
	}

	.tmux-tip-code {
		background: oklch(0.22 0.02 250);
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
		font-family: ui-monospace, monospace;
		color: oklch(0.75 0.12 200);
		font-size: 0.75rem;
	}

	.tmux-tip-sep {
		color: oklch(0.45 0.02 250);
	}

	/* Attach toast */
	.attach-toast {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		background: oklch(0.20 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 8px;
		box-shadow: 0 4px 12px oklch(0 0 0 / 0.3);
		z-index: 100;
		animation: slide-up 0.2s ease-out;
	}

	.attach-toast.success {
		background: oklch(0.22 0.04 200);
		border-color: oklch(0.45 0.12 200);
	}

	.attach-toast.error {
		background: oklch(0.22 0.04 30);
		border-color: oklch(0.45 0.12 30);
	}

	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.toast-icon {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
	}

	.attach-toast.success .toast-icon {
		color: oklch(0.70 0.15 200);
	}

	.attach-toast.error .toast-icon {
		color: oklch(0.70 0.15 30);
	}

	.toast-content {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.toast-session {
		font-size: 0.8rem;
		font-weight: 600;
		color: oklch(0.85 0.02 250);
		font-family: ui-monospace, monospace;
	}

	.toast-message {
		font-size: 0.75rem;
		color: oklch(0.60 0.02 250);
	}

	.attach-toast.success .toast-message {
		color: oklch(0.70 0.10 200);
	}

	.attach-toast.error .toast-message {
		color: oklch(0.70 0.10 30);
	}

	.toast-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		padding: 0;
		margin-left: 0.5rem;
		background: transparent;
		border: none;
		color: oklch(0.50 0.02 250);
		cursor: pointer;
		transition: color 0.15s;
	}

	.toast-close:hover {
		color: oklch(0.75 0.02 250);
	}

	.toast-close svg {
		width: 14px;
		height: 14px;
	}

	/* Expandable rows */
	.session-row.expandable {
		cursor: pointer;
	}

	.session-row.expandable:hover {
		background: oklch(0.65 0.15 145 / 0.15);
	}

	.session-row.expanded {
		background: oklch(0.65 0.15 200 / 0.12);
		border-bottom: none;
	}

	.session-row.expanded:hover {
		background: oklch(0.65 0.15 200 / 0.15);
	}

	/* Expanded row with SessionCard */
	.expanded-row {
		background: oklch(0.12 0.01 250);
		border-bottom: 1px solid oklch(0.22 0.02 250);
	}

	.expanded-row:hover {
		background: oklch(0.12 0.01 250);
	}

	.expanded-content {
		padding: 0 !important;
		border-top: 1px solid oklch(0.25 0.02 250);
	}

	.expanded-session-card {
		overflow-y: auto;
		width: 100%;
		/* Height controlled by inline style for resize functionality */
	}

	@keyframes expand-slide-down {
		from {
			opacity: 0;
			max-height: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			max-height: 600px;
			transform: translateY(0);
		}
	}

	@keyframes expand-slide-up {
		from {
			opacity: 1;
			max-height: 600px;
			transform: translateY(0);
		}
		to {
			opacity: 0;
			max-height: 0;
			transform: translateY(-10px);
		}
	}

	/* Wrapper for expanded session with horizontal resize */
	.expanded-session-wrapper {
		position: relative;
		padding: 1rem;
		display: flex;
		gap: 1rem;
		animation: expand-slide-down 0.2s ease-out;
	}

	.expanded-session-wrapper.collapsing {
		animation: expand-slide-up 0.2s ease-out forwards;
	}

	/* SessionCard takes all space when no task panel */
	.session-card-section {
		position: relative;
		flex: 1;
		min-width: 0;
	}

	/* When task panel is showing, SessionCard gets 60% and panel gets 40% */
	.expanded-session-wrapper.with-task-panel .session-card-section {
		flex: 0 0 60%;
	}

	/* Override SessionCard styles when embedded in table */
	.expanded-session-card :global(.session-card) {
		border-radius: 8px;
		border: 1px solid oklch(0.28 0.02 250);
		max-width: none;
		width: 100%;
	}

	/* Width indicator - positioned within session-card-section, hidden by default */
	.session-card-section .width-indicator {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		font-size: 0.7rem;
		font-family: ui-monospace, monospace;
		color: oklch(0.55 0.02 250);
		background: oklch(0.18 0.01 250);
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		border: 1px solid oklch(0.25 0.02 250);
		pointer-events: none;
		z-index: 5;
		opacity: 0;
		transition: opacity 0.15s ease;
	}

	.session-card-section .width-indicator.visible {
		opacity: 1;
	}

	/* Vertical resize divider for expanded session height */
	.resize-divider {
		position: relative;
		height: 8px;
		cursor: ns-resize;
		background: oklch(0.18 0.01 250);
		border-top: 1px solid oklch(0.25 0.02 250);
		transition: background 0.15s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.resize-divider:hover {
		background: oklch(0.22 0.02 250);
	}

	.resize-divider.resizing {
		background: oklch(0.25 0.04 200);
	}

	.resize-handle-vertical {
		width: 40px;
		height: 4px;
		background: oklch(0.35 0.02 250);
		border-radius: 2px;
		transition: background 0.15s, width 0.15s;
	}

	.resize-divider:hover .resize-handle-vertical {
		background: oklch(0.50 0.02 250);
		width: 60px;
	}

	.resize-divider.resizing .resize-handle-vertical {
		background: oklch(0.65 0.12 200);
		width: 80px;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.tmux-page {
			padding: 1rem;
		}

		.sessions-table th,
		.sessions-table td {
			padding: 0.625rem 0.75rem;
		}

		.attach-toast {
			left: 1rem;
			right: 1rem;
			bottom: 1rem;
		}
	}

	/* === Context Menu === */
	.ctx-menu {
		position: fixed;
		z-index: 100;
		min-width: 180px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		padding: 0.375rem;
		box-shadow: 0 10px 30px oklch(0.05 0 0 / 0.5);
		animation: ctxIn 0.1s ease;
	}

	.ctx-menu-hidden {
		display: none;
	}

	@keyframes ctxIn {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}

	.ctx-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.375rem 0.625rem;
		border: none;
		background: transparent;
		color: oklch(0.80 0.02 250);
		font-size: 0.8125rem;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background 0.1s ease;
		white-space: nowrap;
	}

	.ctx-item:hover {
		background: oklch(0.25 0.03 250);
	}

	.ctx-item svg {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		opacity: 0.7;
	}

	.ctx-item-has-submenu {
		position: relative;
	}

	.ctx-item-active {
		color: oklch(0.85 0.10 200);
	}

	.ctx-item-danger {
		color: oklch(0.75 0.15 25);
	}

	.ctx-item-danger:hover {
		background: oklch(0.25 0.06 25);
	}

	.ctx-item-success {
		color: oklch(0.75 0.15 145);
	}

	.ctx-item-success:hover {
		background: oklch(0.25 0.06 145);
	}

	.ctx-divider {
		height: 1px;
		margin: 0.25rem 0.375rem;
		background: oklch(0.28 0.02 250);
	}

	.ctx-chevron {
		width: 12px;
		height: 12px;
		margin-left: auto;
		opacity: 0.5;
	}

	.ctx-check {
		width: 14px;
		height: 14px;
		margin-left: auto;
	}

	.ctx-status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.ctx-submenu-container {
		position: relative;
	}

	.ctx-submenu {
		position: absolute;
		left: 100%;
		top: -0.375rem;
		min-width: 150px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		padding: 0.375rem;
		box-shadow: 0 10px 30px oklch(0.05 0 0 / 0.5);
		animation: ctxIn 0.1s ease;
	}
</style>
