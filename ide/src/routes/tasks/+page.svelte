<script lang="ts">
	/**
	 * Tasks Page
	 *
	 * Tasks view with project selection via TopBar global selector.
	 * - Only one project visible at a time (selected via TopBar)
	 * - Within each project, groups by epic (accordion behavior)
	 */

	import { onMount, onDestroy } from "svelte";
	import { slide, fly } from "svelte/transition";
	import { cubicOut } from "svelte/easing";
	import { page } from "$app/stores";
	import { classifySessionLegacy } from "$lib/utils/sessionNaming";
	import SortDropdown from "$lib/components/SortDropdown.svelte";
	import TasksActive from "$lib/components/sessions/TasksActive.svelte";
	import MobileSessionDrawer from "$lib/components/work/MobileSessionDrawer.svelte";
	import TasksPaused from "$lib/components/sessions/TasksPaused.svelte";
	import AgentAvatar from "$lib/components/AgentAvatar.svelte";
	import StatusActionBadge from "$lib/components/work/atoms/StatusActionBadge.svelte";
	import CommentsThread from "$lib/components/comments/CommentsThread.svelte";
	import TasksOpen from "$lib/components/sessions/TasksOpen.svelte";
	import ProjectNotes from "$lib/components/sessions/ProjectNotes.svelte";
	import WorkingAgentBadge from "$lib/components/WorkingAgentBadge.svelte";
	import EpicBar from "$lib/components/sessions/EpicBar.svelte";
	import { fetchAndGetProjectColors } from "$lib/utils/projectColors";
	import { openTaskDetailDrawer, openProjectDrawer, projectCreatedSignal, openTaskDrawer } from "$lib/stores/drawerStore";
	import {
		getProjectFromTaskId,
		buildEpicChildMap,
		getParentEpicId,
	} from "$lib/utils/projectUtils";
	import { cleanupCollapsedEpics } from "$lib/stores/preferences.svelte";
	import CompletedDayGroup from "$lib/components/history/CompletedDayGroup.svelte";
	import {
		type CompletedTask,
		type DayGroup,
		type PausedSession,
		groupTasksByDay,
		mergePausedSessions,
	} from "$lib/utils/completedTaskHelpers";
	import { isHumanTask } from "$lib/utils/badgeHelpers";
	import VoiceInbox from "$lib/components/voice/VoiceInbox.svelte";

	interface TmuxSession {
		name: string;
		created: string;
		attached: boolean;
		type: "agent" | "server" | "ide" | "other";
		project?: string;
	}

	interface Task {
		id: string;
		title: string;
		description?: string;
		status: string;
		priority: number;
		issue_type?: string;
		assignee?: string;
		labels?: string[];
		created_at?: string;
		depends_on?: Array<{ id: string; [key: string]: any }>;
		agent_program?: string | null;
		due_date?: string | null;
	}

	interface AgentTask {
		id: string;
		status: string;
		issue_type?: string;
		title?: string;
		priority?: number;
		description?: string;
		labels?: string[];
		created_at?: string;
		agent_program?: string;
	}

	interface AgentSessionInfo {
		tokens: number;
		cost: number;
		activityState?: string;
		activityStateTimestamp?: number;
	}

	// Due date filter
	type DueDateFilter = "today" | "tomorrow" | "week" | "overdue" | "unscheduled" | "all";
	let dueDateFilter = $state<DueDateFilter>("all");

	function getLocalDateString(date: Date): string {
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
	}

	function getToday(): string {
		return getLocalDateString(new Date());
	}

	function getTomorrow(): string {
		const d = new Date();
		d.setDate(d.getDate() + 1);
		return getLocalDateString(d);
	}

	function getEndOfWeek(): string {
		const d = new Date();
		const day = d.getDay(); // 0=Sun
		const daysUntilSunday = day === 0 ? 0 : 7 - day;
		d.setDate(d.getDate() + daysUntilSunday);
		return getLocalDateString(d);
	}

	function taskMatchesDateFilter(task: Task, filter: DueDateFilter): boolean {
		const dueDate = task.due_date;
		switch (filter) {
			case "all":
				return true;
			case "unscheduled":
				return !dueDate;
			case "overdue":
				return !!dueDate && dueDate < getToday();
			case "today":
				return !!dueDate && dueDate <= getToday();
			case "tomorrow":
				return !!dueDate && dueDate <= getTomorrow();
			case "week":
				return !!dueDate && dueDate <= getEndOfWeek();
			default:
				return true;
		}
	}

	const DATE_FILTER_OPTIONS: { id: DueDateFilter; label: string; icon: string }[] = [
		{ id: "today", label: "Today", icon: "📌" },
		{ id: "tomorrow", label: "Tomorrow", icon: "➡️" },
		{ id: "week", label: "This Week", icon: "📅" },
		{ id: "overdue", label: "Overdue", icon: "🔴" },
		{ id: "unscheduled", label: "Unscheduled", icon: "📭" },
		{ id: "all", label: "All", icon: "∞" },
	];

	// Sessions state
	let sessions = $state<TmuxSession[]>([]);
	let sessionsLoading = $state(true);
	let sessionsError = $state<string | null>(null);
	let pollInterval: ReturnType<typeof setInterval> | null = null;
	let recoveryPollInterval: ReturnType<typeof setInterval> | null = null;

	// Open tasks state
	let openTasks = $state<Task[]>([]);
	let allTasks = $state<Task[]>([]); // For epic mapping (includes closed)
	let tasksLoading = $state(true);
	let tasksError = $state<string | null>(null);

	// Agent mappings
	let agentProjects = $state<Map<string, string>>(new Map());
	let agentTasks = $state<Map<string, AgentTask>>(new Map());
	let agentSessionInfo = $state<Map<string, AgentSessionInfo>>(new Map());
	let agentOutputs = $state<Map<string, string>>(new Map());

	// Mobile detection
	let isMobile = $state(false);
	let mobileCleanup: (() => void) | null = null;

	// Mobile session drawer
	let drawerSessionName = $state<string | null>(null);
	function getAgentNameFromSession(sessionName: string): string {
		return sessionName.replace(/^jat-/, '');
	}
	$effect(() => {
		if (drawerSessionName && !sessions.some(s => s.name === drawerSessionName)) {
			drawerSessionName = null;
		}
	});

	// Project colors
	let projectColors = $state<Record<string, string>>({});

	// Browser sessions (agent name → port)
	let browserSessions = $state<Map<string, number>>(new Map());

	// Task → integration source mapping (lazy loaded)
	let taskIntegrations = $state<Record<string, { sourceId: string; sourceType: string; sourceName: string; sourceEnabled: boolean }>>({});

	// Task → attachment images (lazy loaded)
	let taskImages = $state<Record<string, Array<{ path: string; id: string; uploadedAt?: string }>>>({});

	// Project notes
	let projectNotes = $state<Record<string, string>>({});

	// Configured projects (from projects.json - includes empty projects)
	let configuredProjects = $state<string[]>([]);

	// Recoverable sessions state
	interface RecoverableSession {
		agentName: string;
		sessionId: string | null;
		resumable: boolean;
		taskId: string;
		taskTitle: string;
		taskPriority: number;
		taskType?: string;
		taskDescription?: string;
		taskAgentProgram?: string;
		project: string;
		lastActivity?: string;
	}
	let recoverableSessions = $state<RecoverableSession[]>([]);

	// Spawn loading state
	let spawningTaskId = $state<string | null>(null);

	// Swarm button state
	let swarmHoveredEpicId = $state<string | null>(null);
	let swarmSpawningEpicId = $state<string | null>(null);
	let swarmAutoExpandedEpicId = $state<string | null>(null); // epic expanded by hover (collapse on leave)

	// Completed tasks state (loaded day-by-day from API)
	let completedDayGroups = $state<DayGroup[]>([]);
	let completedLoading = $state(false);
	let completedLoadingMore = $state(false);
	let completedDaysSearched = $state(0); // how many days back we've searched
	let completedNoMoreDays = $state(false); // true when we've exhausted lookback
	let completedMemoryMap = $state<Map<string, string>>(new Map());
	let memoryViewerOpen = $state(false);
	let memoryContent = $state("");
	let memoryTitle = $state("");

	// Selected project (synced from URL ?project= param, managed by TopBar)
	let selectedProject = $state<string | null>(null);

	// Subsection collapse state per project (sessions/paused/waiting/conversations/tasks)
	type SubsectionType = "sessions" | "paused" | "waiting" | "conversations" | "tasks" | "completed";
	let collapsedSubsections = $state<Map<string, Set<SubsectionType>>>(
		new Map(),
	);
	// Track subsections the user has manually toggled (prevents auto-expand from fighting user intent)
	let userToggledSubsections = new Set<string>(); // keys: "project:subsection"

	// Epic collapse state (independent: each group can be expanded/collapsed separately)
	// Uses Set of epic keys per project. "standalone" key used for tasks without an epic.
	let expandedEpicsByProject = $state<Map<string, Set<string>>>(new Map());

	// Sort configuration for sessions
	type SessionSortOption = "state" | "project" | "created";
	type SessionSortDirection = "asc" | "desc";

	interface SessionSortConfig {
		value: string;
		label: string;
		icon: string;
		defaultDir: SessionSortDirection;
	}

	let sortBy = $state<SessionSortOption>("state");
	let sortDir = $state<SessionSortDirection>("asc");

	// State priority for sorting
	const STATE_PRIORITY: Record<string, number> = {
		"ready-for-review": 0,
		"needs-input": 1,
		completed: 2,
		working: 3,
		completing: 4,
		starting: 5,
		recovering: 6,
		compacting: 7,
		"auto-proceeding": 8,
		idle: 9,
	};

	const SORT_OPTIONS: SessionSortConfig[] = [
		{ value: "state", label: "State", icon: "🎯", defaultDir: "asc" },
		{ value: "project", label: "Project", icon: "📁", defaultDir: "asc" },
		{ value: "created", label: "Created", icon: "⏱️", defaultDir: "desc" },
	];

	let projectOrder = $state<string[]>([]);

	// Helpers — uses centralized session classifier
	function categorizeSession(name: string): { type: TmuxSession["type"]; project?: string } {
		return classifySessionLegacy(name, (agent) => agentProjects.get(agent));
	}

	function getAgentName(sessionName: string): string {
		if (sessionName.startsWith("jat-")) {
			return sessionName.slice(4);
		}
		return sessionName;
	}

	function getSessionStatePriority(session: TmuxSession): number {
		if (session.type !== "agent") return 99;
		const agentName = getAgentName(session.name);
		const state = agentSessionInfo.get(agentName)?.activityState || "idle";
		return STATE_PRIORITY[state] ?? 99;
	}

	// Tasks in 'waiting' status (agent asked a question and paused session)
	const waitingTasks = $derived(allTasks.filter(t => t.status === 'waiting'));

	// Build epic-child map from all tasks
	const epicChildMap = $derived(buildEpicChildMap(allTasks));

	// Epics where all children are closed but epic itself is still open (ready for verification)
	const epicsReadyForVerification = $derived.by(() => {
		const readySet = new Set<string>();
		for (const task of allTasks) {
			if (task.issue_type !== 'epic' || task.status !== 'open') continue;
			const children = allTasks.filter(t => t.id !== task.id && getParentEpicId(t.id, epicChildMap) === task.id);
			if (children.length > 0 && children.every(c => c.status === 'closed')) {
				readySet.add(task.id);
			}
		}
		return readySet;
	});

	// Agents that need user attention (needs_input or review state)
	const attentionAgents = $derived.by(() => {
		const result: Array<{ agentName: string; sessionName: string; state: string; taskTitle?: string; taskId?: string }> = [];
		for (const session of sessions) {
			if (session.type !== 'agent') continue;
			const agentName = getAgentName(session.name);
			const info = agentSessionInfo.get(agentName);
			if (info?.activityState === 'needs_input' || info?.activityState === 'review' || info?.activityState === 'ready-for-review') {
				const task = agentTasks.get(agentName);
				result.push({ agentName, sessionName: session.name, state: info.activityState, taskTitle: task?.title, taskId: task?.id });
			}
		}
		return result;
	});

	// Dismissed attention notifications (local session state — clears on reload)
	let dismissedAttentionSessions = $state(new Set<string>());

	// Voice inbox collapsed state (section hidden entirely when empty)
	let voiceInboxCollapsed = $state(false);
	// null = not yet checked (show by default until confirmed empty)
	let voiceInboxHasItems = $state<boolean | null>(null);
	let voiceInboxCount = $state(0);
	let voiceInboxPollTimer: ReturnType<typeof setInterval> | null = null;
	let voiceInboxRef = $state<{ dismissAll: () => void; enterMergeMode: () => void; exitMergeMode: () => void; executeMerge: () => void } | null>(null);
	// Dismiss All slide-to-confirm state
	let voicePendingDismissAll = $state(false);
	let voiceDismissProgress = $state(0);
	let voiceIsSliding = $state(false);
	// Merge mode state (bound to VoiceInbox)
	let voiceMergeMode = $state(false);
	let voiceMergeSelectedCount = $state(0);
	let voiceIsMerging = $state(false);
	let voiceDismissAfterMerge = $state(true);

	async function checkVoiceInbox() {
		try {
			const res = await fetch('/api/sessions/jat-voice/timeline?limit=50');
			if (!res.ok) return;
			const data = await res.json();
			const events = Array.isArray(data.events) ? data.events : [];
			voiceInboxHasItems = events.length > 0;
			voiceInboxCount = events.length;
		} catch {
			// ignore — keep current state on error
		}
	}

	function voiceStartDismiss() { voicePendingDismissAll = true; voiceDismissProgress = 0; voiceIsSliding = false; }
	function voiceCancelDismiss() { voicePendingDismissAll = false; voiceDismissProgress = 0; voiceIsSliding = false; }
	function voiceSlideMove(e: MouseEvent | TouchEvent, el: HTMLElement) {
		if (!voiceIsSliding) return;
		const rect = el.getBoundingClientRect();
		const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
		voiceDismissProgress = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
	}
	function voiceSlideEnd() {
		if (voiceDismissProgress >= 80) {
			voiceInboxRef?.dismissAll();
			voiceInboxHasItems = false;
			voiceInboxCount = 0;
		}
		voicePendingDismissAll = false;
		voiceDismissProgress = 0;
		voiceIsSliding = false;
	}

	// Guard: don't let saveCollapseState overwrite localStorage until we've loaded saved state.
	// selectProject() runs as a $effect (before onMount), so without this guard it would
	// save default values to localStorage before loadCollapseState() ever reads the saved ones.
	let collapseStateLoaded = false;

	// When an agent leaves the attention state, un-dismiss it so it can show again next time
	$effect(() => {
		const currentSessions = new Set(attentionAgents.map(a => a.sessionName));
		for (const dismissed of dismissedAttentionSessions) {
			if (!currentSessions.has(dismissed)) {
				dismissedAttentionSessions.delete(dismissed);
				dismissedAttentionSessions = new Set(dismissedAttentionSessions);
			}
		}
	});

	const visibleAttentionAgents = $derived.by(() =>
		attentionAgents.filter(a => !dismissedAttentionSessions.has(a.sessionName))
	);

	// Get all unique projects from sessions, tasks, and configured projects
	const allProjects = $derived.by(() => {
		const projects = new Set<string>();

		// Add configured projects (includes empty projects)
		for (const project of configuredProjects) {
			projects.add(project);
		}

		// Add projects from agent sessions only (server sessions are not task projects)
		for (const session of sessions) {
			if (session.type === "agent" && session.project) {
				projects.add(session.project);
			}
		}

		// Add projects from tasks
		for (const task of openTasks) {
			const project = getProjectFromTaskId(task.id);
			if (project) {
				projects.add(project);
			}
		}

		// Sort by projectOrder, then alphabetically
		return Array.from(projects).sort((a, b) => {
			const indexA = projectOrder.indexOf(a);
			const indexB = projectOrder.indexOf(b);
			const orderA = indexA === -1 ? 9999 : indexA;
			const orderB = indexB === -1 ? 9999 : indexB;
			if (orderA !== orderB) return orderA - orderB;
			return a.localeCompare(b);
		});
	});

	// Sync selectedProject from URL ?project= param (managed by TopBar/layout)
	// NOTE: All smart defaults for subsections are handled in selectProject() to avoid
	// infinite effect loops. Do NOT add a separate effect for subsection defaults.
	$effect(() => {
		const projectParam = $page.url.searchParams.get('project');
		const projects = allProjects;
		// Trust URL param unconditionally - it's set by the layout which already validates it.
		// Don't gate on projects.includes() because allProjects depends on configuredProjects
		// which loads in Phase 2 (~1.5s delay), causing a temporary mismatch with the TopBar.
		if (projectParam) {
			if (selectedProject !== projectParam) {
				selectProject(projectParam);
			}
		} else if (projects.length > 0 && !selectedProject) {
			selectProject(projects[0]);
		} else if (
			projects.length > 0 &&
			selectedProject &&
			!projects.includes(selectedProject)
		) {
			selectProject(projects[0]);
		}
	});

	// Group sessions by project
	const sessionsByProject = $derived.by(() => {
		const grouped = new Map<string, TmuxSession[]>();

		for (const session of sessions.filter((s) => s.type === "agent")) {
			// Prefer task-derived project (from task ID prefix) over signal-reported project.
			// Signal files can report the wrong project if an agent was resumed in a different
			// project context (e.g. DenseHorizon resumed in meadow while its task was steelbridge).
			const agentName = getAgentName(session.name);
			const taskDerivedProject = agentProjects.get(agentName);
			const project = taskDerivedProject || session.project || "Unknown";
			if (!grouped.has(project)) {
				grouped.set(project, []);
			}
			grouped.get(project)!.push(session);
		}

		// Sort sessions within each project
		for (const [project, projectSessions] of grouped) {
			projectSessions.sort((a, b) => {
				const multiplier = sortDir === "asc" ? 1 : -1;

				if (sortBy === "state") {
					const stateA = getSessionStatePriority(a);
					const stateB = getSessionStatePriority(b);
					if (stateA !== stateB) {
						return (stateA - stateB) * multiplier;
					}
				}

				const createdA = new Date(a.created).getTime();
				const createdB = new Date(b.created).getTime();
				return (createdB - createdA) * multiplier;
			});
		}

		return grouped;
	});


	// Group sessions by epic within a project
	function getSessionsByEpic(
		projectSessions: TmuxSession[],
	): Map<string | null, TmuxSession[]> {
		const grouped = new Map<string | null, TmuxSession[]>();

		for (const session of projectSessions) {
			const agentName = getAgentName(session.name);
			const task = agentTasks.get(agentName);
			const epicId = task ? getParentEpicId(task.id, epicChildMap) : null;

			if (!grouped.has(epicId)) {
				grouped.set(epicId, []);
			}
			grouped.get(epicId)!.push(session);
		}

		return grouped;
	}

	// Counts for filter chips (computed from all open tasks in selected project)
	const filterCounts = $derived.by(() => {
		const projectTasks = selectedProject
			? openTasks.filter((t) => {
					const project = getProjectFromTaskId(t.id);
					return project === selectedProject;
				})
			: openTasks;

		const candidates = projectTasks.filter(
			(t) => (t.status === "open" || t.status === "dev") && t.issue_type !== "epic",
		);

		const counts: Record<DueDateFilter, number> = {
			today: 0,
			tomorrow: 0,
			week: 0,
			overdue: 0,
			unscheduled: 0,
			all: candidates.length,
		};

		for (const task of candidates) {
			if (taskMatchesDateFilter(task, "today")) counts.today++;
			if (taskMatchesDateFilter(task, "tomorrow")) counts.tomorrow++;
			if (taskMatchesDateFilter(task, "week")) counts.week++;
			if (taskMatchesDateFilter(task, "overdue")) counts.overdue++;
			if (taskMatchesDateFilter(task, "unscheduled")) counts.unscheduled++;
		}

		return counts;
	});

	// Filtered open tasks based on due date filter
	const filteredOpenTasks = $derived.by(() => {
		if (dueDateFilter === "all") return openTasks;
		return openTasks.filter((task) => {
			if (task.issue_type === "epic") return true;
			if (task.status === "in_progress" || task.status === "blocked") return true;
			return taskMatchesDateFilter(task, dueDateFilter);
		});
	});

	// Group tasks by project
	const tasksByProject = $derived.by(() => {
		const grouped = new Map<string, Task[]>();

		for (const task of filteredOpenTasks) {
			const project = getProjectFromTaskId(task.id) || "Unknown";
			if (!grouped.has(project)) {
				grouped.set(project, []);
			}
			grouped.get(project)!.push(task);
		}

		return grouped;
	});

	// Group tasks by epic within a project (only open tasks)
	function getTasksByEpic(projectTasks: Task[]): Map<string | null, Task[]> {
		const grouped = new Map<string | null, Task[]>();

		for (const task of projectTasks) {
			// Don't include epics themselves in their own group
			if (task.issue_type === "epic") {
				continue;
			}

			// Show open and dev tasks (dev = internal/not-for-end-users but workable in IDE)
			if (task.status !== "open" && task.status !== "dev") {
				continue;
			}

			const epicId = getParentEpicId(task.id, epicChildMap);

			if (!grouped.has(epicId)) {
				grouped.set(epicId, []);
			}
			grouped.get(epicId)!.push(task);
		}

		// Pass 1: Add child epics (epics that are children of another epic) to their parent's group.
		// Must happen before pass 2 so parent epics that receive child epics don't end up in standalone.
		for (const task of projectTasks) {
			if (task.issue_type === "epic" && (task.status === "open" || task.status === "dev") && !grouped.has(task.id)) {
				const parentEpicId = getParentEpicId(task.id, epicChildMap);
				if (parentEpicId) {
					if (!grouped.has(parentEpicId)) {
						grouped.set(parentEpicId, []);
					}
					grouped.get(parentEpicId)!.push(task);
				}
			}
		}

		// Pass 2: Add standalone epics — open/dev epics with no non-epic children AND no parent epic.
		for (const task of projectTasks) {
			if (task.issue_type === "epic" && (task.status === "open" || task.status === "dev")) {
				const isChildEpic = getParentEpicId(task.id, epicChildMap) !== null;
				if (!grouped.has(task.id) && !isChildEpic) {
					if (!grouped.has(null)) {
						grouped.set(null, []);
					}
					grouped.get(null)!.push(task);
				}
			}
		}

		return grouped;
	}

	// Get epic task by ID
	function getEpicTask(epicId: string): Task | undefined {
		return allTasks.find((t) => t.id === epicId);
	}

	// Get epic progress: { closed, total } across ALL children (not just open)
	function getEpicProgress(epicId: string): { closed: number; total: number } {
		const children = allTasks.filter(
			(t) => t.id !== epicId && getParentEpicId(t.id, epicChildMap) === epicId
		);
		const closed = children.filter((t) => t.status === "closed").length;
		return { closed, total: children.length };
	}

	// Get agents actively working on tasks within an epic (for Open Tasks indicators)
	function getActiveAgentsForEpic(epicId: string): Array<{ name: string }> {
		const result: Array<{ name: string }> = [];
		for (const [agentName, task] of agentTasks) {
			if (getParentEpicId(task.id, epicChildMap) === epicId) {
				const state = agentSessionInfo.get(agentName)?.activityState;
				if (state && state !== 'idle' && state !== 'completed' && state !== 'planning') {
					result.push({ name: agentName });
				}
			}
		}
		return result;
	}

	// Toggle epic collapse
	function toggleEpicCollapse(
		project: string,
		epicId: string | null,
		subsection: "sessions" | "tasks" = "tasks",
	) {
		// Each subsection (sessions/tasks) has independent expand state
		const key = epicId
			? `${subsection}-${epicId}`
			: `${subsection}-standalone`;
		const existing = expandedEpicsByProject.get(project);

		// Create a NEW Set (not mutate in place) to ensure Svelte 5 reactivity
		let expanded: Set<string>;
		if (!existing) {
			// First interaction - initialize with defaults matching isEpicExpanded
			expanded = new Set<string>();
			expanded.add("sessions-standalone");
			expanded.add("tasks-standalone");
			// All session epic groups expanded by default
			const projectSessions = sessionsByProject.get(project) || [];
			const sessionsByEpicLocal = getSessionsByEpic(projectSessions);
			for (const [eid] of sessionsByEpicLocal) {
				if (eid) expanded.add(`sessions-${eid}`);
			}
		} else {
			expanded = new Set(existing);
		}

		if (expanded.has(key)) {
			expanded.delete(key);
		} else {
			expanded.add(key);
		}

		// Create new Map with new Set for clean reactivity
		const newMap = new Map(expandedEpicsByProject);
		newMap.set(project, expanded);
		expandedEpicsByProject = newMap;
	}

	function isEpicExpanded(
		project: string,
		epicId: string | null,
		subsection: "sessions" | "tasks" = "tasks",
	): boolean {
		// Each subsection (sessions/tasks) has independent expand state
		const key = epicId
			? `${subsection}-${epicId}`
			: `${subsection}-standalone`;
		const expanded = expandedEpicsByProject.get(project);
		if (!expanded) {
			// No explicit state yet - use smart defaults:
			// Standalone groups: always expanded
			// Session epic groups: always expanded (agents should be visible)
			// Task epic groups: collapsed
			if (epicId === null) return true;
			if (subsection === "sessions") return true;
			return false;
		}
		return expanded.has(key);
	}

	// Subsection collapse handlers
	function toggleSubsectionCollapse(
		project: string,
		subsection: SubsectionType,
	) {
		userToggledSubsections.add(`${project}:${subsection}`);
		const projectSubsections =
			collapsedSubsections.get(project) || new Set();
		if (projectSubsections.has(subsection)) {
			projectSubsections.delete(subsection);
		} else {
			projectSubsections.add(subsection);
		}
		collapsedSubsections.set(project, projectSubsections);
		collapsedSubsections = new Map(collapsedSubsections);
		saveCollapseState();
	}

	function isSubsectionCollapsed(
		project: string,
		subsection: SubsectionType,
	): boolean {
		return collapsedSubsections.get(project)?.has(subsection) ?? false;
	}

	// Persist collapse state
	function saveCollapseState() {
		if (!collapseStateLoaded) return; // Don't save until saved state has been loaded
		try {
			// Save subsection collapse state
			const subsectionData: Record<string, string[]> = {};
			for (const [project, subsections] of collapsedSubsections) {
				subsectionData[project] = Array.from(subsections);
			}
			localStorage.setItem(
				"tasks3-collapsed-subsections",
				JSON.stringify(subsectionData),
			);
			// Save voice inbox collapsed state
			localStorage.setItem(
				"tasks3-voice-inbox-collapsed",
				voiceInboxCollapsed ? "1" : "0",
			);
		} catch {
			// Ignore storage errors
		}
	}

	function loadCollapseState() {
		try {
			// Load subsection collapse state
			const subsectionSaved = localStorage.getItem(
				"tasks3-collapsed-subsections",
			);
			if (subsectionSaved) {
				const data = JSON.parse(subsectionSaved) as Record<
					string,
					string[]
				>;
				const map = new Map<string, Set<SubsectionType>>();
				for (const [project, subsections] of Object.entries(data)) {
					map.set(project, new Set(subsections as SubsectionType[]));
					// Mark saved collapsed subsections as user-toggled so auto-expand doesn't override them
					for (const subsection of subsections as SubsectionType[]) {
						userToggledSubsections.add(`${project}:${subsection}`);
					}
				}
				collapsedSubsections = map;
			}
			// Load voice inbox collapsed state
			const voiceSaved = localStorage.getItem("tasks3-voice-inbox-collapsed");
			if (voiceSaved !== null) {
				voiceInboxCollapsed = voiceSaved === "1";
			}
		} catch {
			// Ignore storage errors
		}
	}

	// API calls
	async function fetchProjectOrder() {
		try {
			const response = await fetch(
				"/api/projects?visible=true&stats=true",
			);
			if (!response.ok) return;
			const data = await response.json();
			projectOrder = (data.projects || []).map(
				(p: { name: string }) => p.name,
			);
		} catch {
			// Silent fail
		}
	}

	async function fetchAgentProjects() {
		try {
			const response = await fetch("/api/work");
			if (!response.ok) return;
			const data = await response.json();

			const projectMap = new Map<string, string>();
			const taskMap = new Map<string, AgentTask>();
			const sessionInfoMap = new Map<string, AgentSessionInfo>();
			const outputMap = new Map<string, string>();

			for (const session of data.sessions || []) {
				if (!session.agentName) continue;

				sessionInfoMap.set(session.agentName, {
					tokens: session.tokens || 0,
					cost: session.cost || 0,
					activityState: session.sessionState || undefined,
					activityStateTimestamp: Date.now(),
				});

				if (session.output) {
					outputMap.set(session.agentName, session.output);
				} else {
					// Preserve cached output for completed/idle sessions
					// (API skips tmux capture for non-active sessions)
					const cached = agentOutputs.get(session.agentName);
					if (cached) outputMap.set(session.agentName, cached);
				}

				const taskSource = session.task || session.lastCompletedTask;
				if (taskSource?.id) {
					const project = getProjectFromTaskId(taskSource.id);
					if (project) {
						projectMap.set(session.agentName, project);
					}
					taskMap.set(session.agentName, {
						id: taskSource.id,
						status: taskSource.status || "open",
						issue_type: taskSource.issue_type,
						title: taskSource.title,
						priority: taskSource.priority,
						description: taskSource.description,
						labels: taskSource.labels,
						created_at: taskSource.created_at,
						agent_program: taskSource.agent_program,
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
			agentOutputs = outputMap;
		} catch {
			// Silent fail
		}
	}

	async function fetchSessions() {
		try {
			const response = await fetch("/api/sessions?filter=all");
			if (!response.ok) {
				throw new Error("Failed to fetch sessions");
			}
			const data = await response.json();

			sessions = (data.sessions || []).map(
				(s: {
					name: string;
					created: string;
					attached: boolean;
					project?: string;
				}) => {
					const { type, project: categorizedProject } =
						categorizeSession(s.name);
					return {
						...s,
						type,
						project: s.project || categorizedProject,
					};
				},
			);
			sessionsError = null;
		} catch (err) {
			sessionsError =
				err instanceof Error ? err.message : "Unknown error";
		} finally {
			sessionsLoading = false;
		}
	}

	async function fetchTasks() {
		try {
			// Pass project param so postgres-backed projects (e.g. meadow) hit Postgres instead of SQLite.
			// Without this, app-created tasks that only live in Postgres are invisible to the IDE.
			const url = selectedProject ? `/api/tasks?project=${encodeURIComponent(selectedProject)}` : '/api/tasks';
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error("Failed to fetch tasks");
			}
			const data = await response.json();
			const tasks = data.tasks || [];
			// Set both variables from the same data to avoid duplicate fetches
			openTasks = tasks;
			allTasks = tasks;
			tasksError = null;

			// Clean up stale collapsed epic IDs to prevent memory leak
			// (removes IDs for tasks that no longer exist)
			const existingIds = new Set<string>(tasks.map((t: Task) => t.id));
			cleanupCollapsedEpics(existingIds);
		} catch (err) {
			tasksError = err instanceof Error ? err.message : "Unknown error";
		} finally {
			tasksLoading = false;
		}
	}

	async function fetchProjectColors() {
		try {
			const colors = await fetchAndGetProjectColors();
			projectColors = colors;
		} catch (err) {
			console.warn("Failed to fetch project colors:", err);
		}
	}

	async function fetchProjectNotes() {
		try {
			// Fetch project list for configuredProjects
			const response = await fetch("/api/projects?visible=true");
			if (!response.ok) return;
			const data = await response.json();
			const projectKeys: string[] = [];
			for (const project of data.projects || []) {
				if (project.hidden) continue;
				const projectKey = project.key || project.name;
				if (projectKey) projectKeys.push(projectKey);
			}
			configuredProjects = projectKeys;

			// Fetch notes for all visible projects from bases API
			const notes: Record<string, string> = {};
			await Promise.all(projectKeys.map(async (key) => {
				try {
					const res = await fetch(`/api/bases/notes?project=${encodeURIComponent(key)}`);
					if (res.ok) {
						const d = await res.json();
						if (d.content) notes[key] = d.content;
					}
				} catch {
					// Skip individual project failures
				}
			}));
			projectNotes = notes;
		} catch (err) {
			console.warn("Failed to fetch project notes:", err);
		}
	}

	async function fetchTaskIntegrations() {
		try {
			// Only fetch integrations for the currently selected project's tasks
			// (openTasks contains ALL tasks from ALL projects — sending them all
			//  causes HTTP 431 when the URL exceeds header size limits)
			const ids = new Set<string>();
			const projectTasks = selectedProject
				? tasksByProject.get(selectedProject) || []
				: openTasks;
			for (const t of projectTasks) ids.add(t.id);
			for (const [, t] of agentTasks) {
				if (!selectedProject || getProjectFromTaskId(t.id) === selectedProject) {
					ids.add(t.id);
				}
			}
			for (const day of completedDayGroups) {
				for (const t of day.tasks) ids.add(t.id);
			}
			if (ids.size === 0) return;

			const response = await fetch(`/api/tasks/integrations?taskIds=${[...ids].join(",")}`);
			if (!response.ok) return;
			const data = await response.json();
			taskIntegrations = data.integrations || {};
		} catch {
			// Silent fail - integrations are supplemental
		}
	}

	async function fetchTaskImages() {
		try {
			const response = await fetch('/api/tasks/images');
			if (!response.ok) return;
			const data = await response.json();
			taskImages = data.images || {};
		} catch {
			// Silent fail - images are supplemental
		}
	}

	async function fetchBrowserSessions() {
		try {
			const response = await fetch('/api/browser-sessions');
			if (!response.ok) return;
			const data = await response.json();
			const map = new Map<string, number>();
			for (const [port, session] of Object.entries(data.sessions || {})) {
				const s = session as any;
				if (s.alive || s.portListening) {
					map.set(s.agentName, parseInt(port));
				}
			}
			browserSessions = map;
		} catch {
			// Silent fail - browser sessions are supplemental
		}
	}

	async function fetchRecoverableSessions() {
		try {
			const response = await fetch("/api/recovery");
			if (!response.ok) return;
			const data = await response.json();
			recoverableSessions = data.sessions || [];
		} catch {
			// Silent fail
		}
	}

	/** Compute start/end ISO strings for a local date N days ago */
	function getDayRange(daysAgo: number): { start: string; end: string } {
		const d = new Date();
		d.setHours(0, 0, 0, 0);
		d.setDate(d.getDate() - daysAgo);
		const start = d.toISOString();
		const next = new Date(d);
		next.setDate(next.getDate() + 1);
		const end = next.toISOString();
		return { start, end };
	}

	/** Fetch closed tasks for a single day (daysAgo=0 is today) for the selected project */
	async function fetchCompletedDay(daysAgo: number): Promise<DayGroup[]> {
		if (!selectedProject) return [];
		const { start, end } = getDayRange(daysAgo);
		const tasksParams = new URLSearchParams({
			status: "closed",
			project: selectedProject,
			closedAfter: start,
			closedBefore: end,
		});
		const doneParams = new URLSearchParams({
			project: selectedProject,
			updatedAfter: start,
			updatedBefore: end,
		});
		const pausedParams = new URLSearchParams({
			project: selectedProject,
			closedAfter: start,
			closedBefore: end,
		});

		const [tasksRes, doneRes, pausedRes] = await Promise.all([
			fetch(`/api/tasks?${tasksParams}`),
			fetch(`/api/tasks?${doneParams}`),
			fetch(`/api/tasks/paused-sessions?${pausedParams}`),
		]);

		const closedTasks: CompletedTask[] = tasksRes.ok
			? ((await tasksRes.json()).tasks || [])
			: [];

		// Filter done-statuses tasks: completed, accepted, submitted (not closed — already fetched above)
		const DONE_STATUSES = new Set(['completed', 'accepted', 'submitted']);
		const doneTasks: CompletedTask[] = doneRes.ok
			? ((await doneRes.json()).tasks || []).filter((t: CompletedTask) => DONE_STATUSES.has(t.status ?? ''))
			: [];

		const tasks: CompletedTask[] = [...closedTasks, ...doneTasks];

		const pausedSessions: PausedSession[] = pausedRes.ok
			? ((await pausedRes.json()).sessions || [])
			: [];

		if (tasks.length === 0 && pausedSessions.length === 0) return [];

		const groups = groupTasksByDay(tasks);
		return mergePausedSessions(groups, pausedSessions);
	}

	/** Initial fetch: load today's completed tasks, auto-lookback if empty */
	async function fetchCompletedTasks() {
		completedLoading = true;
		completedNoMoreDays = false;
		completedDaysSearched = 0;
		try {
			// Try today first
			completedDayGroups = await fetchCompletedDay(0);
			completedDaysSearched = 1;

			// Count actual tasks (not paused sessions) to decide whether to look back.
			// Today may have paused sessions but no completed tasks — in that case we
			// still want to look back to find recent completed work.
			const todayTaskCount = completedDayGroups.reduce((sum, g) => sum + g.tasks.length, 0);

			// If today has no completed tasks, automatically look back up to 14 days
			// to find the most recent completed tasks
			if (todayTaskCount === 0) {
				for (let attempt = 1; attempt <= 14; attempt++) {
					const dayGroups = await fetchCompletedDay(attempt);
					if (dayGroups.some(g => g.tasks.length > 0)) {
						// Merge lookback tasks with today's paused sessions (if any)
						if (completedDayGroups.length > 0) {
							// Keep today's paused-session groups + add lookback task groups
							const todayGroups = completedDayGroups.filter(g => g.tasks.length === 0 && g.pausedSessions?.length);
							completedDayGroups = [...todayGroups, ...dayGroups];
						} else {
							completedDayGroups = dayGroups;
						}
						completedDaysSearched = attempt + 1;
						break;
					}
				}
				if (completedDayGroups.reduce((sum, g) => sum + g.tasks.length, 0) === 0 && !completedDayGroups.some(g => g.pausedSessions?.length)) {
					completedDaysSearched += 14;
					completedNoMoreDays = true;
				}
			}
		} catch {
			// Silent fail
		} finally {
			completedLoading = false;
		}
	}

	/** Load the next day of history (skips empty days, gives up after 14 consecutive misses) */
	async function loadMoreCompletedDays() {
		if (completedLoadingMore || completedNoMoreDays) return;
		completedLoadingMore = true;
		try {
			let found = false;
			for (let attempt = 0; attempt < 14; attempt++) {
				const daysAgo = completedDaysSearched + attempt;
				const dayGroups = await fetchCompletedDay(daysAgo);
				if (dayGroups.some(g => g.tasks.length > 0)) {
					completedDayGroups = [...completedDayGroups, ...dayGroups];
					completedDaysSearched = daysAgo + 1;
					found = true;
					break;
				}
			}
			if (!found) {
				completedDaysSearched += 14;
				completedNoMoreDays = true;
			}
		} catch {
			// Silent fail
		} finally {
			completedLoadingMore = false;
		}
	}

	const completedCount = $derived(
		completedDayGroups.reduce((sum, g) => sum + g.tasks.length, 0),
	);

	async function fetchCompletedMemory() {
		if (!selectedProject) return;
		try {
			const res = await fetch(`/api/memory?action=browse&project=${encodeURIComponent(selectedProject)}`);
			if (!res.ok) return;
			const data = await res.json();
			const map = new Map<string, string>();
			for (const file of data.files || []) {
				if (file.task) {
					map.set(file.task, file.filename);
				}
			}
			completedMemoryMap = map;
		} catch {
			// Silent fail
		}
	}

	async function handleMemoryClick(event: MouseEvent, filename: string, task: CompletedTask) {
		event.stopPropagation();
		const project = task.project || task.id.split("-")[0];
		try {
			const res = await fetch(`/api/memory?action=file&project=${encodeURIComponent(project)}&filename=${encodeURIComponent(filename)}`);
			if (!res.ok) return;
			const data = await res.json();
			memoryTitle = filename.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
			memoryContent = data.content || "";
			memoryViewerOpen = true;
		} catch (e) {
			console.error("Failed to fetch memory file:", e);
		}
	}

	// Completed task actions
	let completedResumingTasks = $state<Set<string>>(new Set());

	async function handleCompletedResumeSession(event: MouseEvent, task: CompletedTask) {
		event.stopPropagation();
		if (!task.assignee) return;

		completedResumingTasks.add(task.id);
		completedResumingTasks = new Set(completedResumingTasks);

		try {
			const response = await fetch(`/api/sessions/${task.assignee}/resume`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});
			if (!response.ok) {
				const data = await response.json();
				console.error("Failed to resume session:", data.message);
			}
		} catch (error) {
			console.error("Error resuming session:", error);
		} finally {
			completedResumingTasks.delete(task.id);
			completedResumingTasks = new Set(completedResumingTasks);
		}
	}

	async function handleReopenTask(event: MouseEvent, task: CompletedTask) {
		event.stopPropagation();
		try {
			const response = await fetch(`/api/tasks/${task.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "open" }),
			});
			if (response.ok) {
				// Remove from completed groups and refresh open tasks
				completedDayGroups = completedDayGroups
					.map((g) => ({ ...g, tasks: g.tasks.filter((t) => t.id !== task.id) }))
					.filter((g) => g.tasks.length > 0 || (g.pausedSessions?.length || 0) > 0);
				await fetchTasks();
			}
		} catch (error) {
			console.error("Error reopening task:", error);
		}
	}

	async function handleResumePausedSession(
		event: MouseEvent,
		session: PausedSession,
	) {
		event.stopPropagation();

		completedResumingTasks.add(session.taskId);
		completedResumingTasks = new Set(completedResumingTasks);

		try {
			const response = await fetch(`/api/sessions/${session.agentName}/resume`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});
			if (!response.ok) {
				const data = await response.json();
				console.error("Failed to resume paused session:", data.message);
			}
		} catch (error) {
			console.error("Error resuming paused session:", error);
		} finally {
			completedResumingTasks.delete(session.taskId);
			completedResumingTasks = new Set(completedResumingTasks);
		}
	}

	function handleDuplicateTask(event: MouseEvent, task: CompletedTask) {
		event.stopPropagation();
		const project = task.project || task.id.split("-")[0];
		openTaskDrawer(project, task.title, "task", task.issue_type);
	}

	// Get paused sessions for a project
	function getProjectPausedSessions(project: string): RecoverableSession[] {
		return recoverableSessions.filter(
			(s) => s.project.toLowerCase() === project.toLowerCase(),
		);
	}

	// Map of taskId → agentName for tasks with previous sessions (passed to TasksOpen context menu)
	let resumableTasks = $state(new Map<string, string>());

	async function fetchResumableTasks() {
		try {
			const taskIds = openTasks
				.filter(t => (t.status === 'open' || t.status === 'dev') && t.issue_type !== 'epic')
				.map(t => t.id);
			if (taskIds.length === 0) return;
			const response = await fetch('/api/tasks/sessions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ taskIds })
			});
			if (!response.ok) return;
			const data = await response.json();
			const map = new Map<string, string>();
			for (const [taskId, sessions] of Object.entries(data.sessions || {})) {
				const arr = sessions as Array<{ agentName: string; sessionId: string | null; isOnline: boolean }>;
				// Find the first offline session (resume API will locate the session ID)
				const resumable = arr.find(s => !s.isOnline);
				if (resumable) {
					map.set(taskId, resumable.agentName);
				}
			}
			resumableTasks = map;
		} catch {
			// Silent fail
		}
	}

	// Critical data for initial render (tasks + sessions clear the loading skeleton)
	async function fetchCriticalData() {
		await Promise.all([
			fetchTasks(),
			fetchSessions(),
			fetchAgentProjects(),
		]);
	}

	// Non-critical data (colors, notes, project order, recovery, completed tasks)
	async function fetchSupplementalData() {
		await Promise.all([
			fetchProjectOrder(),
			fetchProjectColors(),
			fetchProjectNotes(),
			fetchCompletedTasks(),
			fetchCompletedMemory(),
			fetchBrowserSessions(),
			fetchTaskImages(),
			fetchResumableTasks(),
		]);
	}

	// Full refresh (used by actions that change state, NOT for polling)
	async function fetchAllData() {
		await Promise.all([
			fetchCriticalData(),
			fetchSupplementalData(),
			fetchRecoverableSessions(),
		]);
		// Integrations depend on openTasks/agentTasks being populated,
		// so fetch after critical data is loaded
		fetchTaskIntegrations();
	}

	// Actions
	async function killSession(sessionName: string) {
		try {
			const response = await fetch(
				`/api/sessions/${encodeURIComponent(sessionName)}`,
				{
					method: "DELETE",
				},
			);
			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Failed to kill session");
			}
			await fetchSessions();
		} catch (err) {
			console.error("Failed to kill session:", err);
		}
	}

	async function attachSession(sessionName: string) {
		try {
			const response = await fetch(
				`/api/work/${encodeURIComponent(sessionName)}/attach`,
				{
					method: "POST",
				},
			);
			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to attach session");
			}
		} catch (err) {
			console.error("Failed to attach session:", err);
		}
	}

	async function resumeSession(agentName: string, sessionId: string) {
		try {
			const response = await fetch(
				`/api/sessions/${encodeURIComponent(agentName)}/resume`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ session_id: sessionId }),
				},
			);
			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to resume session");
			}
			// Refresh data after resume
			await fetchAllData();
		} catch (err) {
			console.error("Failed to resume session:", err);
		}
	}

	async function restartTask(taskId: string, agentName?: string) {
		try {
			// If there's an existing agent session, kill it first (releases the task too).
			// This prevents the spawn API from rejecting with "Task already has an active agent".
			if (agentName) {
				const sessionName = `jat-${agentName}`;
				try {
					await fetch(`/api/sessions/${encodeURIComponent(sessionName)}`, { method: "DELETE" });
				} catch {
					// Session may already be gone — not fatal, proceed with spawn
				}
			}
			const response = await fetch("/api/work/spawn", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ taskId, autoStart: true }),
			});
			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to restart task");
			}
			await fetchAllData();
		} catch (err) {
			console.error("Failed to restart task:", err);
		}
	}

	async function unassignTask(taskId: string, agentName: string) {
		try {
			const response = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "open", assignee: "" }),
			});
			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to unassign task");
			}
			await fetchAllData();
		} catch (err) {
			console.error("Failed to unassign task:", err);
		}
	}

	async function killPausedSession(taskId: string, agentName: string) {
		try {
			// 1. Release the task (set status back to open, clear assignee)
			await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "open", assignee: "" }),
			});

			// 2. Clean up signal file so the session doesn't linger
			const sessionName = `jat-${agentName}`;
			try {
				await fetch(`/api/sessions/${encodeURIComponent(sessionName)}`, { method: "DELETE" });
			} catch {
				// Session may already be gone — not fatal
			}

			await fetchAllData();
		} catch (err) {
			console.error("Failed to kill paused session:", err);
		}
	}

	async function reopenWaitingTask(taskId: string) {
		try {
			await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "open", assignee: "" }),
			});
			await fetchCriticalData();
		} catch (err) {
			console.error("Failed to reopen waiting task:", err);
		}
	}

	async function spawnWaitingTask(taskId: string) {
		try {
			const response = await fetch("/api/work/spawn", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ taskId, autoStart: true }),
			});
			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to spawn agent");
			}
			await fetchAllData();
		} catch (err) {
			console.error("Failed to spawn agent for waiting task:", err);
		}
	}

	async function closeOrphanedTask(taskId: string, agentName: string) {
		try {
			// 1. Close the task
			await fetch(`/api/tasks/${encodeURIComponent(taskId)}/close`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ reason: "Closed orphaned task" }),
			});

			// 2. Clean up session artifacts
			const sessionName = `jat-${agentName}`;
			try {
				await fetch(`/api/sessions/${encodeURIComponent(sessionName)}`, { method: "DELETE" });
			} catch {
				// Session may already be gone — not fatal
			}

			await fetchAllData();
		} catch (err) {
			console.error("Failed to close orphaned task:", err);
		}
	}

	async function spawnTask(task: Task, selection?: { agentId: string | null; model: string | null }) {
		spawningTaskId = task.id;
		try {
			const body: Record<string, any> = {
				taskId: task.id,
				autoStart: true,
			};

			// Add agent/model selection if provided (from Alt+click agent picker)
			if (selection) {
				if (selection.agentId) body.agentId = selection.agentId;
				if (selection.model) body.model = selection.model;
			} else {
				// No explicit selection — use task's agent_program if set
				if (task.agent_program) {
					body.agentId = task.agent_program;
				}
			}

			const response = await fetch("/api/work/spawn", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				const data = await response.json();
				// If task already has an active agent, just refresh the view
				if (response.status === 409 && data.existingAgent) {
					console.log(`Task ${task.id} already active with agent ${data.existingAgent}`);
					await fetchAllData();
					return;
				}
				throw new Error(data.error || "Failed to spawn task");
			}

			await fetchAllData();
		} catch (err) {
			console.error("Failed to spawn task:", err);
		} finally {
			spawningTaskId = null;
		}
	}

	// Get launchable (non-blocked, non-human) task IDs for an epic
	function getLaunchableTaskIds(epicId: string): Set<string> {
		const projectTasks = tasksByProject.get(selectedProject!) || [];
		const ids = new Set<string>();
		for (const task of projectTasks) {
			if ((task.status !== "open" && task.status !== "dev") || task.issue_type === "epic") continue;
			// Skip human tasks - can't be automated
			if (isHumanTask(task)) continue;
			const parentEpic = getParentEpicId(task.id, epicChildMap);
			if (parentEpic !== epicId) continue;
			// Check if blocked
			const hasBlockers = task.depends_on?.some((d: any) => d.status !== "closed");
			if (!hasBlockers) {
				ids.add(task.id);
			}
		}
		return ids;
	}

	// Spawn all launchable tasks in an epic
	async function swarmEpic(epicId: string) {
		const launchableIds = getLaunchableTaskIds(epicId);
		if (launchableIds.size === 0) return;

		swarmSpawningEpicId = epicId;
		const projectTasks = tasksByProject.get(selectedProject!) || [];
		const tasksToSpawn = projectTasks.filter(t => launchableIds.has(t.id));

		try {
			for (let i = 0; i < tasksToSpawn.length; i++) {
				const task = tasksToSpawn[i];
				spawningTaskId = task.id;

				const body: Record<string, any> = {
					taskId: task.id,
					autoStart: true,
				};

				// Use task's agent_program if set
				if (task.agent_program) {
					body.agentId = task.agent_program;
				}

				try {
					const response = await fetch("/api/work/spawn", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(body),
					});

					if (!response.ok) {
						const data = await response.json();
						if (response.status === 409 && data.existingAgent) {
							// Already active, skip
							continue;
						}
						console.error(`Failed to spawn ${task.id}:`, data.error);
					}
				} catch (err) {
					console.error(`Failed to spawn ${task.id}:`, err);
				}

				// Stagger between spawns (except last)
				if (i < tasksToSpawn.length - 1) {
					await new Promise(resolve => setTimeout(resolve, 6000));
				}
			}

			await fetchAllData();
		} finally {
			spawningTaskId = null;
			swarmSpawningEpicId = null;
			swarmHoveredEpicId = null;
			// Collapse the epic if hover had auto-expanded it
			if (swarmAutoExpandedEpicId === epicId) {
				swarmAutoExpandedEpicId = null;
				if (selectedProject && isEpicExpanded(selectedProject, epicId)) {
					toggleEpicCollapse(selectedProject, epicId);
				}
			}
		}
	}

	function handleSortChange(value: string, dir: "asc" | "desc") {
		sortBy = value as SessionSortOption;
		sortDir = dir;
	}

	// Count helpers
	function getProjectTaskCount(project: string): number {
		const tasks = tasksByProject.get(project) || [];
		const isWorkable = (t: Task) => t.status === "open" || t.status === "dev";
		let count = tasks.filter(
			(t) => isWorkable(t) && t.issue_type !== "epic",
		).length;
		for (const t of tasks) {
			if (t.issue_type === "epic" && isWorkable(t)) {
				const hasWorkableChildren = tasks.some(
					(child) => isWorkable(child) && child.issue_type !== "epic" && getParentEpicId(child.id, epicChildMap) === t.id,
				);
				if (!hasWorkableChildren) count++;
			}
		}
		return count;
	}

	// Handle tab selection
	function selectProject(project: string) {
		selectedProject = project;
		completedDayGroups = []; // Reset completed tasks for new project
		fetchTasks(); // Re-fetch tasks — routes to Postgres for postgres-backed projects
		fetchCompletedTasks(); // Re-fetch completed tasks for the new project
		fetchTaskIntegrations(); // Re-fetch integrations for new project's tasks

		const projectSessions = sessionsByProject.get(project) || [];
		const projectTasks = tasksByProject.get(project) || [];
		const projectPausedSessions = getProjectPausedSessions(project);
		const hasActiveSessions = projectSessions.length > 0;
		const hasPausedSessions = projectPausedSessions.filter(s => s.taskType !== 'chat').length > 0;
		const hasChatSessions = projectPausedSessions.filter(s => s.taskType === 'chat').length > 0;
		const hasOpenTasks = getProjectTaskCount(project) > 0;

		// Only apply default subsection collapse logic if this project doesn't have saved state
		// This preserves user's manual collapse/expand choices
		if (!collapsedSubsections.has(project)) {
			// All sections expanded by default. Only auto-collapse when empty.
			const projectSubsections = new Set<SubsectionType>();

			if (!hasPausedSessions) {
				projectSubsections.add("paused");
			}
			if (!hasChatSessions) {
				projectSubsections.add("conversations");
			}
			// Completed Tasks starts collapsed (supplementary info)
			projectSubsections.add("completed");
			// Active Tasks and Open Tasks are always visible by default
			// so users can see both in-progress work and available tasks/epics

			collapsedSubsections.set(project, projectSubsections);
			collapsedSubsections = new Map(collapsedSubsections);
		}

		// Epic expand/collapse state is NOT initialized here.
		// isEpicExpanded() returns smart defaults when no explicit state exists,
		// and toggleEpicCollapse() lazy-initializes on first user interaction.
		// This avoids the timing bug where selectProject() runs before data loads,
		// creating an empty Set that overrides the defaults.

		saveCollapseState();
		fetchCompletedMemory();
	}

	// Reactively auto-expand paused/conversations subsections when data arrives.
	// Fixes: selectProject() runs before recovery data loads, marking empty sections as collapsed.
	// When data arrives later, the section stays collapsed even though it now has content.
	// Respects user intent: if user manually toggled a section, don't override it.
	// Resets the user-touched flag when a section empties (so it auto-expands on reappear).
	$effect(() => {
		if (!selectedProject) return;
		const projectCollapsed = collapsedSubsections.get(selectedProject);
		if (!projectCollapsed) return;

		const paused = getProjectPausedSessions(selectedProject);
		const hasWork = paused.some(s => s.taskType !== 'chat');
		const hasChat = paused.some(s => s.taskType === 'chat');
		const projectWaiting = waitingTasks.filter(t => (t.id || '').startsWith(selectedProject + '-'));
		const hasWaiting = projectWaiting.length > 0;
		let changed = false;

		const chatKey = `${selectedProject}:conversations`;
		const pausedKey = `${selectedProject}:paused`;
		const waitingKey = `${selectedProject}:waiting`;

		// Auto-expand when content appears (only if user hasn't manually toggled)
		if (hasChat && projectCollapsed.has("conversations") && !userToggledSubsections.has(chatKey)) {
			projectCollapsed.delete("conversations");
			changed = true;
		}
		if (hasWork && projectCollapsed.has("paused") && !userToggledSubsections.has(pausedKey)) {
			projectCollapsed.delete("paused");
			changed = true;
		}
		if (hasWaiting && projectCollapsed.has("waiting") && !userToggledSubsections.has(waitingKey)) {
			projectCollapsed.delete("waiting");
			changed = true;
		}

		// Auto-expand completed section when tasks arrive (only if user hasn't manually toggled)
		const completedKey = `${selectedProject}:completed`;
		const hasCompleted = completedDayGroups.length > 0;
		if (hasCompleted && projectCollapsed.has("completed") && !userToggledSubsections.has(completedKey)) {
			projectCollapsed.delete("completed");
			changed = true;
		}

		// Reset user-touched flag when section empties (so it auto-expands if it reappears).
		// But preserve the flag if the section is explicitly collapsed — the user wanted it closed.
		if (!hasChat && !projectCollapsed.has("conversations")) userToggledSubsections.delete(chatKey);
		if (!hasWork && !projectCollapsed.has("paused")) userToggledSubsections.delete(pausedKey);
		if (!hasWaiting && !projectCollapsed.has("waiting")) userToggledSubsections.delete(waitingKey);
		if (!hasCompleted && !projectCollapsed.has("completed")) userToggledSubsections.delete(completedKey);

		if (changed) {
			collapsedSubsections = new Map(collapsedSubsections);
		}
	});

	onMount(() => {
		loadCollapseState();
		collapseStateLoaded = true;

		// Mobile detection via matchMedia
		const mql = window.matchMedia('(max-width: 768px)');
		isMobile = mql.matches;
		const handleMobileChange = (e: MediaQueryListEvent) => { isMobile = e.matches; };
		mql.addEventListener('change', handleMobileChange);
		// Store cleanup function for onDestroy
		mobileCleanup = () => mql.removeEventListener('change', handleMobileChange);

		// Phase 1: Critical data for initial render (clears loading skeleton ASAP)
		fetchCriticalData();

		// Phase 2: Non-critical data after a short delay (reduces server contention)
		setTimeout(() => {
			fetchSupplementalData();
			fetchTaskIntegrations(); // Needs openTasks populated from Phase 1
		}, 1500);

		// Phase 3: Recovery data — load after initial render, then poll every 30s
		setTimeout(() => {
			fetchRecoverableSessions();
		}, 5000);

		// Voice inbox: check on mount and every 30s (lightweight, limit=1)
		checkVoiceInbox();
		voiceInboxPollTimer = setInterval(checkVoiceInbox, 30000);

		// Auto-open drawer for new users from /setup
		const params = new URL(window.location.href).searchParams;
		if (params.get('welcome') === 'true') {
			const project = params.get('project') || undefined;
			openTaskDrawer(project);
			// Clean URL without triggering navigation
			history.replaceState({}, '', '/tasks');
		}

		// Poll critical data only (not recovery or supplemental) at a relaxed interval.
		// WebSocket events already trigger refreshes for session/task changes.
		pollInterval = setInterval(() => {
			// Skip fetch when page is hidden to avoid Content-Length mismatch errors
			if (document.visibilityState === 'hidden') return;
			fetchCriticalData();
		}, 15000);

		// Poll recovery data at a slower interval for detecting paused/orphaned sessions.
		// Recovery detects tasks changed outside the IDE (e.g., via terminal jt commands).
		recoveryPollInterval = setInterval(() => {
			if (document.visibilityState === 'hidden') return;
			fetchRecoverableSessions();
		}, 30000);
	});

	onDestroy(() => {
		if (pollInterval) {
			clearInterval(pollInterval);
		}
		if (recoveryPollInterval) {
			clearInterval(recoveryPollInterval);
		}
		if (voiceInboxPollTimer) {
			clearInterval(voiceInboxPollTimer);
		}
		mobileCleanup?.();
	});

	// Refresh data when a new project is created via CreateProjectDrawer.
	// Use Svelte's $-prefix auto-subscription instead of raw .subscribe() inside $effect.
	$effect(() => {
		const count = $projectCreatedSignal;
		// Only refetch if signal has been triggered (not on initial mount)
		if (count > 0) {
			fetchAllData();
		}
	});
</script>

<svelte:head>
	<title>Tasks (Tabbed) | JAT IDE</title>
	<meta
		name="description"
		content="Task management with project tabs for AI coding agents."
	/>
	<link rel="icon" href="/favicons/tasks.svg" />
</svelte:head>

<div class="tasks-page">
	<!-- Loading State -->
	{#if sessionsLoading && tasksLoading && sessions.length === 0 && openTasks.length === 0}
		<div class="loading-container">
			<!-- Active Tasks Section Skeleton -->
			<div class="section-skeleton">
				<div class="skeleton-section-header">
					<div class="skeleton h-4 w-4 rounded"></div>
					<div class="skeleton h-5 w-28 rounded"></div>
					<div class="skeleton h-5 w-6 rounded-full"></div>
				</div>
				<div class="skeleton-subsection">
					<div class="skeleton-subsection-header">
						<div class="skeleton h-4 w-32 rounded"></div>
						<div class="flex gap-1 ml-2">
							<div class="skeleton h-5 w-5 rounded-full"></div>
						</div>
					</div>
					<div class="skeleton-task-rows">
						{#each [1, 2] as __}
							<div class="skeleton-task-row">
								<div class="skeleton h-5 w-16 rounded"></div>
								<div
									class="skeleton h-6 w-6 rounded-full"
								></div>
								<div class="flex-1 flex flex-col gap-1">
									<div
										class="skeleton h-4 w-48 rounded"
									></div>
									<div
										class="skeleton h-3 w-72 rounded"
									></div>
								</div>
								<div
									class="skeleton h-5 w-16 rounded-full"
								></div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<!-- Open Tasks Section Skeleton -->
			<div class="section-skeleton">
				<div class="skeleton-section-header">
					<div class="skeleton h-4 w-4 rounded"></div>
					<div class="skeleton h-5 w-24 rounded"></div>
					<div class="skeleton h-5 w-6 rounded-full"></div>
				</div>
				<div class="skeleton-task-rows">
					{#each [1, 2, 3] as __}
						<div class="skeleton-task-row">
							<div class="skeleton h-5 w-16 rounded"></div>
							<div class="flex-1 flex flex-col gap-1">
								<div class="skeleton h-4 w-40 rounded"></div>
								<div class="skeleton h-3 w-64 rounded"></div>
							</div>
							<div class="skeleton h-7 w-7 rounded-full"></div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{:else if sessionsError && tasksError}
		<div class="error-state">
			<span>Failed to load data: {sessionsError || tasksError}</span>
			<button onclick={() => fetchAllData()}>Retry</button>
		</div>
	{:else if allProjects.length === 0}
		<div class="empty-state">
			<span>No projects with active sessions or open tasks</span>
		</div>
	{:else}
		<!-- Selected Project Content -->
		{#if selectedProject}
			{@const projectSessions =
				sessionsByProject.get(selectedProject) || []}
			{@const projectTasks = tasksByProject.get(selectedProject) || []}
			{@const allPausedSessions =
				getProjectPausedSessions(selectedProject)}
			{@const projectPausedSessions = allPausedSessions.filter(s => s.taskType !== 'chat')}
			{@const projectChatSessions = allPausedSessions.filter(s => s.taskType === 'chat')}
			{@const projectWaitingTasks = waitingTasks.filter(t => (t.id || '').startsWith(selectedProject + '-'))}
			{@const sessionsByEpic = getSessionsByEpic(projectSessions)}
			{@const tasksByEpic = getTasksByEpic(projectTasks)}
			{@const projectColor =
				projectColors[selectedProject] || "oklch(0.70 0.15 200)"}

			<section
				class="project-content pt-0.5"
				style="--project-color: {projectColor}"
			>
				<!-- Attention notifications: agents waiting for input or review (dismissable) -->
				<!-- Placed inside project-content so the colored top border always abuts the TopBar -->
				{#if visibleAttentionAgents.length > 0}
					<div class="attention-notifs">
						{#each visibleAttentionAgents as agent (agent.sessionName)}
							<div
								class="attention-notif"
								class:notif-needs-input={agent.state === 'needs_input'}
								class:notif-review={agent.state !== 'needs_input'}
								in:fly={{ y: -18, duration: 300, opacity: 0, easing: cubicOut }}
								out:fly={{ y: -8, duration: 180, opacity: 0, easing: cubicOut }}
							>
								<span class="notif-icon">
									{#if agent.state === 'needs_input'}
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
									{/if}
								</span>
								<div class="notif-body">
									<span class="notif-agent">{agent.agentName}</span>
									<span class="notif-state">{agent.state === 'needs_input' ? 'needs input' : 'ready to review'}</span>
									{#if agent.taskTitle}
										<span class="notif-task">{agent.taskTitle.length > 40 ? agent.taskTitle.slice(0, 40) + '…' : agent.taskTitle}</span>
									{/if}
								</div>
								<button
									class="notif-go"
									onclick={() => {
										const proj = agentProjects.get(agent.agentName);
										if (proj) selectedProject = proj;
										drawerSessionName = agent.sessionName;
									}}
									title="Go to session"
								>Go →</button>
								<button
									class="notif-dismiss"
									onclick={() => {
										dismissedAttentionSessions = new Set([...dismissedAttentionSessions, agent.sessionName]);
									}}
									title="Dismiss"
								>×</button>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Active Sessions Section -->
				{#if projectSessions.length > 0}
					<div class="subsection bg-base-100">
						<button
							class="subsection-header"
							onclick={() =>
								toggleSubsectionCollapse(
									selectedProject!,
									"sessions",
								)}
							aria-expanded={!isSubsectionCollapsed(
								selectedProject!,
								"sessions",
							)}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								class="subsection-collapse-icon"
								class:collapsed={isSubsectionCollapsed(
									selectedProject!,
									"sessions",
								)}
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:0.875rem;height:0.875rem;color:oklch(0.75 0.15 85);flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
							<span>Active Tasks</span>
							<span class="subsection-count"
								>{projectSessions.length}</span
							>
						</button>

						{#if !isSubsectionCollapsed(selectedProject!, "sessions")}
							<!-- Group by Epic - sorted: epics by priority first, standalone last -->
							{@const sortedSessionEntries = Array.from(
								sessionsByEpic.entries(),
							).sort((a, b) => {
								const [epicIdA] = a;
								const [epicIdB] = b;
								// Standalone (null) always goes last
								if (epicIdA === null) return 1;
								if (epicIdB === null) return -1;
								// Sort epics by priority (lower = higher priority)
								const epicA = getEpicTask(epicIdA);
								const epicB = getEpicTask(epicIdB);
								const priorityA = epicA?.priority ?? 99;
								const priorityB = epicB?.priority ?? 99;
								return priorityA - priorityB;
							})}
							{#each sortedSessionEntries as [epicId, epicSessions] (epicId ?? "standalone")}
								{@const epic = epicId
									? getEpicTask(epicId)
									: null}
								{@const isExpanded = isEpicExpanded(
									selectedProject!,
									epicId,
									"sessions",
								)}

								{#if epicId && epicSessions.length > 0}
									<!-- Epic Group - only show if there are active sessions -->
									{@const progress = getEpicProgress(epicId)}
									<div class="epic-group">
										<button
											class="epic-header"
											onclick={() =>
												toggleEpicCollapse(
													selectedProject!,
													epicId,
													"sessions",
												)}
											aria-expanded={isExpanded}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="2"
												stroke="currentColor"
												class="collapse-icon small"
												class:collapsed={!isExpanded}
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M19 9l-7 7-7-7"
												/>
											</svg>
											<EpicBar
												{epicId}
												title={epic?.title || "Untitled Epic"}
												{progress}
												countLabel="{epicSessions.length} active"
												agents={epicSessions.map(s => ({ name: getAgentName(s.name) }))}
												AgentBadge={WorkingAgentBadge}
											/>
										</button>

										{#if isExpanded}
											<div
												class="epic-content"
												transition:slide={{
													duration: 200,
												}}
											>
												<TasksActive
													sessions={epicSessions}
													{agentTasks}
													{agentSessionInfo}
													{agentProjects}
													{projectColors}
													{taskIntegrations}
													{browserSessions}
													{agentOutputs}
													onKillSession={killSession}
													onAttachSession={attachSession}
													onViewTask={(taskId) =>
														openTaskDetailDrawer(
															taskId,
														)}
																										onCardClick={(sn) => drawerSessionName = sn}
												/>
											</div>
										{/if}
									</div>
								{:else if epicSessions.length > 0}
									<!-- Standalone Sessions (no epic) - shown directly without sub-group header -->
									<TasksActive
										sessions={epicSessions}
										{agentTasks}
										{agentSessionInfo}
										{agentProjects}
										{projectColors}
										{taskIntegrations}
										{browserSessions}
										{agentOutputs}
										onKillSession={killSession}
										onAttachSession={attachSession}
										onViewTask={(taskId) =>
											openTaskDetailDrawer(
												taskId,
											)}
																				onCardClick={(sn) => drawerSessionName = sn}
									/>
								{/if}
							{/each}
						{/if}
					</div>
				{/if}

				<!-- Waiting for Input Section -->
				{#if projectWaitingTasks.length > 0}
					<div class="subsection waiting-subsection">
						<button
							class="subsection-header"
							onclick={() => toggleSubsectionCollapse(selectedProject!, "waiting")}
							aria-expanded={!isSubsectionCollapsed(selectedProject!, "waiting")}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								class="subsection-collapse-icon"
								class:collapsed={isSubsectionCollapsed(selectedProject!, "waiting")}
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
							</svg>
							<!-- Clock icon -->
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:0.875rem;height:0.875rem;color:oklch(0.75 0.15 85);flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
							<span>Waiting for Input</span>
							<span class="subsection-count-inline">{projectWaitingTasks.length}</span>
						</button>

						{#if !isSubsectionCollapsed(selectedProject!, "waiting")}
							<div class="waiting-content" transition:slide={{ duration: 200 }}>
								<div class="waiting-sessions-list">
									{#each projectWaitingTasks as task (task.id)}
										<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
										<div class="waiting-row">
											<!-- Top bar: avatar + title + actions -->
											<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
											<div class="waiting-row-top" onclick={() => openTaskDetailDrawer(task.id)}>
												<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
												<div class="waiting-row-task" onclick={(e) => e.stopPropagation()}>
													<AgentAvatar name={task.assignee || task.id} size={40} />
													<div class="waiting-task-text">
														<span class="waiting-task-title" title={task.title}>{task.title || task.id}</span>
														<span class="waiting-task-id">{task.id}{task.assignee ? ` · ${task.assignee}` : ''}</span>
													</div>
												</div>
												<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
												<div class="waiting-row-action" onclick={(e) => e.stopPropagation()}>
													<StatusActionBadge
														sessionState="waiting"
														sessionName={task.assignee ? `jat-${task.assignee}` : task.id}
														onAction={(actionId) => {
															if (actionId === 'restart') spawnWaitingTask(task.id);
															else if (actionId === 'reopen') reopenWaitingTask(task.id);
															else if (actionId === 'view-task') openTaskDetailDrawer(task.id);
														}}
														alignRight={true}
														stacked={true}
													/>
												</div>
											</div>
											<!-- Inline question + reply — stops click from bubbling to drawer -->
											<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
											<div class="waiting-row-thread" onclick={(e) => e.stopPropagation()}>
												<CommentsThread taskId={task.id} compact={true} />
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Voice Inbox: hidden only when confirmed empty (null = not checked yet = show) -->
				{#if voiceInboxHasItems !== false}
				<div class="subsection voice-inbox-subsection">
					<div class="subsection-header-row">
						<button
							class="subsection-header"
							onclick={() => { voiceInboxCollapsed = !voiceInboxCollapsed; saveCollapseState(); }}
							aria-expanded={!voiceInboxCollapsed}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								class="subsection-collapse-icon"
								class:collapsed={voiceInboxCollapsed}
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
							</svg>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:0.875rem;height:0.875rem;color:oklch(0.65 0.15 290);flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" /></svg>
							<span>Voice Inbox</span>
							{#if voiceInboxCount > 0}
							<span class="subsection-count">{voiceInboxCount}</span>
							{/if}
						</button>
						<!-- Toolbar actions inline in header row -->
						{#if !voiceInboxCollapsed && voiceInboxHasItems}
						<div class="voice-header-actions" onclick={(e) => e.stopPropagation()}>
							{#if !voiceMergeMode}
								<button class="vi-btn" onclick={() => voiceInboxRef?.enterMergeMode()} title="Select notes to merge">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:0.75rem;height:0.75rem"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
									Merge
								</button>
								{#if !voicePendingDismissAll}
									<button class="vi-btn" onclick={voiceStartDismiss} title="Dismiss all voice inbox items">
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:0.75rem;height:0.75rem"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
										Dismiss All
									</button>
								{:else}
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										class="vi-slide-container"
										role="slider"
										tabindex="0"
										aria-label="Slide to dismiss all"
										aria-valuenow={Math.round(voiceDismissProgress)}
										aria-valuemin={0}
										aria-valuemax={100}
										onmousedown={(e) => { voiceIsSliding = true; voiceSlideMove(e, e.currentTarget); }}
										onmousemove={(e) => voiceSlideMove(e, e.currentTarget)}
										onmouseup={voiceSlideEnd}
										onmouseleave={voiceSlideEnd}
										ontouchstart={(e) => { voiceIsSliding = true; voiceSlideMove(e, e.currentTarget); }}
										ontouchmove={(e) => { e.preventDefault(); voiceSlideMove(e, e.currentTarget); }}
										ontouchend={voiceSlideEnd}
										onkeydown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault();
												voiceIsSliding = true;
												voiceDismissProgress = 100;
												voiceSlideEnd();
											} else if (e.key === 'Escape') {
												voiceCancelDismiss();
											}
										}}
									>
										<div class="vi-slide-track">
											<div class="vi-slide-fill" style="width: {voiceDismissProgress}%"></div>
											<div class="vi-slide-thumb" style="left: {voiceDismissProgress}%"></div>
											<span class="vi-slide-text">{voiceDismissProgress >= 80 ? 'Release to dismiss' : 'Slide to dismiss all'}</span>
										</div>
									</div>
									<button class="vi-btn vi-btn-cancel" onclick={voiceCancelDismiss} title="Cancel">✕</button>
								{/if}
							{:else}
								<label class="vi-toggle" onclick={(e) => e.stopPropagation()}>
									<input type="checkbox" bind:checked={voiceDismissAfterMerge} />
									<span>Dismiss sources</span>
								</label>
								<button
									class="vi-btn vi-btn-primary"
									onclick={() => voiceInboxRef?.executeMerge()}
									disabled={voiceMergeSelectedCount < 2 || voiceIsMerging}
									title={voiceMergeSelectedCount < 2 ? 'Select at least 2 notes' : `Merge ${voiceMergeSelectedCount} notes`}
								>
									{#if voiceIsMerging}
										<svg style="width:0.75rem;height:0.75rem;animation:vi-spin 0.8s linear infinite" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="31.4" stroke-dashoffset="10" /></svg>
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:0.75rem;height:0.75rem"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
									{/if}
									Merge{voiceMergeSelectedCount >= 2 ? ` (${voiceMergeSelectedCount})` : ''}
								</button>
								<button class="vi-btn" onclick={() => voiceInboxRef?.exitMergeMode()}>Cancel</button>
							{/if}
						</div>
						{/if}
					</div>
					{#if !voiceInboxCollapsed}
						<div transition:slide={{ duration: 200 }}>
							<VoiceInbox
								bind:this={voiceInboxRef}
								bind:mergeMode={voiceMergeMode}
								bind:mergeSelectedCount={voiceMergeSelectedCount}
								bind:isMerging={voiceIsMerging}
								bind:dismissAfterMerge={voiceDismissAfterMerge}
								availableProjects={allProjects}
								defaultProject={selectedProject}
								onHasItems={(has, count) => { voiceInboxHasItems = has; if (count !== undefined) voiceInboxCount = count; }}
							/>
						</div>
					{/if}
				</div>
				{/if}

				<!-- Paused Sessions Section -->
				{#if projectPausedSessions.length > 0}
					<div class="subsection paused-subsection">
						<button
							class="subsection-header"
							onclick={() =>
								toggleSubsectionCollapse(
									selectedProject!,
									"paused",
								)}
							aria-expanded={!isSubsectionCollapsed(
								selectedProject!,
								"paused",
							)}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								class="subsection-collapse-icon"
								class:collapsed={isSubsectionCollapsed(
									selectedProject!,
									"paused",
								)}
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:0.875rem;height:0.875rem;color:oklch(0.70 0.12 250);flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>
							<span>Paused Sessions</span>
							<div class="subsection-right">
								<div class="paused-agents">
									{#each projectPausedSessions as session}
										<WorkingAgentBadge
											name={session.agentName}
											size={18}
											variant="avatar"
											isWorking={false}
										/>
									{/each}
								</div>
								<span class="subsection-count-inline"
									>{projectPausedSessions.length}</span
								>
							</div>
						</button>

						{#if !isSubsectionCollapsed(selectedProject!, "paused")}
							<div
								class="paused-content"
								transition:slide={{ duration: 200 }}
							>
								<TasksPaused
									sessions={projectPausedSessions}
									{projectColors}
									{taskIntegrations}
									onResumeSession={resumeSession}
									onRestartTask={restartTask}
									onUnassignTask={unassignTask}
									onKillSession={killPausedSession}
									onCloseTask={closeOrphanedTask}
									onViewTask={(taskId) =>
										openTaskDetailDrawer(taskId)}
								/>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Conversations Section (chat-type paused sessions) -->
				{#if projectChatSessions.length > 0}
					<div class="subsection conversations-subsection">
						<button
							class="subsection-header"
							onclick={() =>
								toggleSubsectionCollapse(
									selectedProject!,
									"conversations",
								)}
							aria-expanded={!isSubsectionCollapsed(
								selectedProject!,
								"conversations",
							)}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								class="subsection-collapse-icon"
								class:collapsed={isSubsectionCollapsed(
									selectedProject!,
									"conversations",
								)}
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
							<span>Conversations</span>
							<div class="subsection-right">
								<div class="paused-agents">
									{#each projectChatSessions as session}
										<WorkingAgentBadge
											name={session.agentName}
											size={18}
											variant="avatar"
											isWorking={false}
										/>
									{/each}
								</div>
								<span class="subsection-count-inline"
									>{projectChatSessions.length}</span
								>
							</div>
						</button>

						{#if !isSubsectionCollapsed(selectedProject!, "conversations")}
							<div
								class="paused-content"
								transition:slide={{ duration: 200 }}
							>
								<TasksPaused
									sessions={projectChatSessions}
									{projectColors}
									{taskIntegrations}
									onResumeSession={resumeSession}
									onRestartTask={restartTask}
									onUnassignTask={unassignTask}
									onKillSession={killPausedSession}
									onCloseTask={closeOrphanedTask}
									onViewTask={(taskId) =>
										openTaskDetailDrawer(taskId)}
								/>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Open Tasks Section (show if filtered tasks exist OR unfiltered tasks exist but filter hides them) -->
				{#if tasksByEpic.size > 0 || (dueDateFilter !== "all" && filterCounts.all > 0)}
					<div class="subsection open-tasks-subsection">
						<div class="subsection-header-row">
							<button
								class="subsection-header"
								onclick={() =>
									toggleSubsectionCollapse(
										selectedProject!,
										"tasks",
									)}
								aria-expanded={!isSubsectionCollapsed(
									selectedProject!,
									"tasks",
								)}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="2"
									stroke="currentColor"
									class="subsection-collapse-icon"
									class:collapsed={isSubsectionCollapsed(
										selectedProject!,
										"tasks",
									)}
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M19 9l-7 7-7-7"
									/>
								</svg>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:0.875rem;height:0.875rem;color:oklch(0.70 0.15 200);flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0z" /></svg>
								<span>Open Tasks</span>
								<span class="subsection-count"
									>{Array.from(tasksByEpic.values()).reduce(
										(sum, tasks) => sum + tasks.length,
										0,
									)}</span
								>
							</button>
							<!-- Due Date Filter Chips (visible when section expanded) -->
							{#if !isSubsectionCollapsed(selectedProject!, "tasks")}
								<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
								<div class="date-filter-chips" role="group" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
									{#each DATE_FILTER_OPTIONS as opt}
										{@const count = filterCounts[opt.id]}
										<button
											class="date-filter-chip"
											class:active={dueDateFilter === opt.id}
											class:has-overdue={opt.id === "overdue" && count > 0}
											onclick={() => (dueDateFilter = opt.id)}
										>
											<span class="chip-label">{opt.label}</span>
											{#if count > 0}
												<span class="chip-count">{count}</span>
											{/if}
										</button>
									{/each}
								</div>
							{/if}
						</div>

						{#if !isSubsectionCollapsed(selectedProject!, "tasks") && tasksByEpic.size === 0 && dueDateFilter !== "all"}
							<div class="filter-empty-state">
								<span>No tasks matching "{DATE_FILTER_OPTIONS.find(o => o.id === dueDateFilter)?.label}" filter</span>
								<button class="filter-reset-btn" onclick={() => (dueDateFilter = "all")}>Show all tasks</button>
							</div>
						{/if}

						{#if !isSubsectionCollapsed(selectedProject!, "tasks") && tasksByEpic.size > 0}
							<!-- Group by Epic - sorted: epics by priority first, standalone last -->
							{@const sortedTaskEntries = Array.from(
								tasksByEpic.entries(),
							).sort((a, b) => {
								const [epicIdA] = a;
								const [epicIdB] = b;
								// Standalone (null) always goes last
								if (epicIdA === null) return 1;
								if (epicIdB === null) return -1;
								// Sort epics by priority (lower = higher priority)
								const epicA = getEpicTask(epicIdA);
								const epicB = getEpicTask(epicIdB);
								const priorityA = epicA?.priority ?? 99;
								const priorityB = epicB?.priority ?? 99;
								return priorityA - priorityB;
							})}
							{#each sortedTaskEntries as [epicId, epicTasks] (epicId ?? "standalone")}
								{@const epic = epicId
									? getEpicTask(epicId)
									: null}
								{@const isExpanded = isEpicExpanded(
									selectedProject!,
									epicId,
								)}

								{#if epicId && epicTasks.length > 0}
									<!-- Epic Group - only show if there are open child tasks -->
									{@const launchableIds = getLaunchableTaskIds(epicId)}
									{@const launchableCount = launchableIds.size}
									{@const isSwarmHovered = swarmHoveredEpicId === epicId}
									{@const isSwarmSpawning = swarmSpawningEpicId === epicId}
									{@const progress = getEpicProgress(epicId)}
									{@const openTasksActiveAgents = getActiveAgentsForEpic(epicId)}
									<div class="epic-group">
										<div class="epic-header-row">
										<button
											class="epic-header"
											onclick={() =>
												toggleEpicCollapse(
													selectedProject!,
													epicId,
												)}
											aria-expanded={isExpanded}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="2"
												stroke="currentColor"
												class="collapse-icon small"
												class:collapsed={!isExpanded}
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M19 9l-7 7-7-7"
												/>
											</svg>
											<EpicBar
												{epicId}
												title={epic?.title || "Untitled Epic"}
												{progress}
												agents={openTasksActiveAgents}
												AgentBadge={openTasksActiveAgents.length > 0 ? WorkingAgentBadge : null}
											/>
										</button>
										{#if launchableCount > 0}
											<button
												class="swarm-btn"
												class:swarm-spawning={isSwarmSpawning}
												disabled={isSwarmSpawning}
												title={isSwarmSpawning ? `Spawning ${launchableCount} tasks...` : `Launch ${launchableCount} task${launchableCount > 1 ? 's' : ''}`}
												onmouseenter={() => {
													swarmHoveredEpicId = epicId;
													// Auto-expand epic to show highlighted tasks
													if (!isEpicExpanded(selectedProject!, epicId)) {
														toggleEpicCollapse(selectedProject!, epicId);
														swarmAutoExpandedEpicId = epicId;
													}
												}}
												onmouseleave={() => {
													if (swarmHoveredEpicId === epicId) swarmHoveredEpicId = null;
													// Collapse back if hover caused the expansion
													if (swarmAutoExpandedEpicId === epicId) {
														swarmAutoExpandedEpicId = null;
														if (isEpicExpanded(selectedProject!, epicId)) {
															toggleEpicCollapse(selectedProject!, epicId);
														}
													}
												}}
												onclick={(e) => {
													e.stopPropagation();
													swarmEpic(epicId);
												}}
											>
												{#if isSwarmSpawning}
													<svg class="swarm-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
														<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke-linecap="round"/>
													</svg>
												{:else}
													<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="swarm-icon">
														<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
													</svg>
												{/if}
												<span class="swarm-count">{launchableCount}</span>
											</button>
										{/if}
										</div>

										{#if isExpanded}
											<div
												class="epic-content"
												transition:slide={{
													duration: 200,
												}}
											>
												<TasksOpen
													tasks={epicTasks as any[]}
													loading={false}
													error={null}
													{spawningTaskId}
													{projectColors}
													{taskIntegrations}
													{taskImages}
													{epicsReadyForVerification}
													{resumableTasks}
													highlightedTaskIds={isSwarmHovered || isSwarmSpawning ? launchableIds : new Set()}
													onSpawnTask={spawnTask as any}
													onRetry={fetchTasks}
													onTaskClick={(taskId) =>
														openTaskDetailDrawer(
															taskId,
														)}
													showHeader={false}
													onAddTask={() => openTaskDrawer(selectedProject ?? undefined)}
																									/>
											</div>
										{/if}
									</div>
								{:else if epicTasks.length > 0}
									<!-- Standalone Tasks (no epic) - collapsible group like epics -->
									<!-- Uses isExpanded from outer {#each} scope (epicId=null) -->
									<div class="epic-group standalone">
										<button
											class="epic-header"
											onclick={() =>
												toggleEpicCollapse(
													selectedProject!,
													null,
												)}
											aria-expanded={isExpanded}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="2"
												stroke="currentColor"
												class="collapse-icon small"
												class:collapsed={!isExpanded}
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M19 9l-7 7-7-7"
												/>
											</svg>
											<span class="standalone-icon"
												>📋</span
											>
											<span class="epic-title"
												>Tasks</span
											>
											<span class="epic-count"
												>{epicTasks.length} open</span
											>
										</button>

										{#if isExpanded}
											<div
												class="epic-content"
												transition:slide={{
													duration: 200,
												}}
											>
												<TasksOpen
													tasks={epicTasks as any[]}
													loading={false}
													error={null}
													{spawningTaskId}
													{projectColors}
													{taskImages}
													{epicsReadyForVerification}
													{resumableTasks}
													onSpawnTask={spawnTask as any}
													onRetry={fetchTasks}
													onTaskClick={(taskId) =>
														openTaskDetailDrawer(
															taskId,
														)}
													showHeader={false}
													onAddTask={() => openTaskDrawer(selectedProject ?? undefined)}
																									/>
											</div>
										{/if}
									</div>
								{/if}
							{/each}
						{/if}
					</div>
				{/if}

				<!-- Completed Tasks Section -->
				{#if completedCount > 0 || completedLoading || completedDayGroups.some(g => g.pausedSessions?.length)}
					<div class="subsection completed-tasks-subsection">
						<button
							class="subsection-header"
							onclick={() =>
								toggleSubsectionCollapse(
									selectedProject!,
									"completed",
								)}
							aria-expanded={!isSubsectionCollapsed(
								selectedProject!,
								"completed",
							)}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								class="subsection-collapse-icon"
								class:collapsed={isSubsectionCollapsed(
									selectedProject!,
									"completed",
								)}
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:0.875rem;height:0.875rem;color:oklch(0.65 0.18 145);flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
							<span>Completed Tasks</span>
							<span class="subsection-count">{completedCount}</span>
						</button>

						{#if !isSubsectionCollapsed(selectedProject!, "completed")}
							<div class="completed-tasks-content">
								{#if completedLoading}
									<div class="completed-loading">
										<span class="loading loading-spinner loading-sm"></span>
										<span>Loading completed tasks...</span>
									</div>
								{:else}
									{#each completedDayGroups as day (day.date)}
										<CompletedDayGroup
											{day}
											onTaskClick={(taskId) => openTaskDetailDrawer(taskId)}
											onResumeSession={handleCompletedResumeSession}
											onMemoryClick={handleMemoryClick}
											onReopenTask={handleReopenTask}
											onDuplicateTask={handleDuplicateTask}
											onResumePausedSession={handleResumePausedSession}
											resumingTasks={completedResumingTasks}
											memoryMap={completedMemoryMap}
											{taskIntegrations}
										/>
									{/each}

									{#if !completedNoMoreDays}
										<button
											class="load-more-btn"
											onclick={loadMoreCompletedDays}
											disabled={completedLoadingMore}
										>
											{#if completedLoadingMore}
												<span class="loading loading-spinner loading-xs"></span>
												Loading...
											{:else}
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:1rem;height:1rem;flex-shrink:0"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
												Load previous day
											{/if}
										</button>
									{/if}

									{#if completedDayGroups.length === 0}
										<div class="completed-empty">
											No completed tasks in the last 2 weeks
										</div>
									{/if}
								{/if}
							</div>
						{/if}
					</div>
				{/if}

				<!-- Project Notes Section -->
				<ProjectNotes
					projectName={selectedProject}
					notes={projectNotes[selectedProject] || ""}
					{projectColor}
					onSave={(project, content) => {
						projectNotes[project] = content;
						projectNotes = projectNotes;
					}}
				/>

				<!-- Empty state for selected project -->
				{#if projectSessions.length === 0 && tasksByEpic.size === 0 && filterCounts.all === 0 && projectPausedSessions.length === 0 && projectChatSessions.length === 0 && completedCount === 0}
					<div class="project-empty-state">
						<span
							>No active sessions or open tasks for {selectedProject}</span
						>
						<button
							class="add-task-empty-btn"
							onclick={() => openTaskDrawer(selectedProject ?? undefined)}
							title="Add new task"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="2"
								stroke="currentColor"
								class="add-task-icon"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 4.5v15m7.5-7.5h-15"
								/>
							</svg>
							<span class="add-task-label">Add Task</span>
						</button>
					</div>
				{/if}
			</section>
		{/if}
	{/if}
</div>

{#if memoryViewerOpen}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div class="memory-overlay" role="presentation" onclick={() => (memoryViewerOpen = false)} onkeydown={(e) => e.key === "Escape" && (memoryViewerOpen = false)}>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="memory-panel" role="group" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
			<div class="memory-header">
				<h3 class="memory-header-title">{memoryTitle}</h3>
				<button type="button" class="memory-close" aria-label="Close memory viewer" onclick={() => (memoryViewerOpen = false)}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			<pre class="memory-body">{memoryContent}</pre>
		</div>
	</div>
{/if}

<!-- MobileSessionDrawer: replaces MobileSessionFullscreen on mobile -->
{#if drawerSessionName}
	{@const drawerAgent = getAgentNameFromSession(drawerSessionName)}
	{@const drawerTask = agentTasks.get(drawerAgent)}
	{@const drawerInfo = agentSessionInfo.get(drawerAgent)}
	{@const drawerSession = sessions.find(s => s.name === drawerSessionName)}
	<MobileSessionDrawer
		sessionName={drawerSessionName}
		agentName={drawerAgent}
		project={selectedProject || (drawerTask?.id?.includes('-') ? drawerTask.id.split('-')[0] : null)}
		task={drawerTask ? {
			id: drawerTask.id,
			title: drawerTask.title,
			status: drawerTask.status,
			priority: drawerTask.priority,
			issue_type: drawerTask.issue_type,
			description: drawerTask.description
		} : null}
		tokens={drawerInfo?.tokens ?? 0}
		cost={drawerInfo?.cost ?? 0}
		sseState={drawerInfo?.activityState}
		sseStateTimestamp={drawerInfo?.activityStateTimestamp}
		created={drawerSession?.created ?? ''}
		attached={drawerSession?.attached ?? false}
		onClose={() => drawerSessionName = null}
		onKillSession={async () => {
			const sn = drawerSessionName!;
			drawerSessionName = null;
			await killSession(sn);
		}}
		onAttachSession={async () => {
			if (drawerSessionName) await attachSession(drawerSessionName);
		}}
		onViewTask={(taskId) => openTaskDetailDrawer(taskId)}
		onSendInput={async (text, type) => {
			if (!drawerSessionName) return;
			await fetch(`/api/work/${encodeURIComponent(drawerSessionName)}/input`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ input: text, type: type || 'text' })
			});
		}}
	/>
{/if}

<style>
	.tasks-page {
		min-height: 100vh;
		background: oklch(0.14 0.01 250);
		padding: 1.5rem;
	}

	@media (max-width: 1023px) {
		.tasks-page {
			padding: 0;
		}
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
	}

	.page-header h1 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.5rem;
		font-weight: 600;
		color: oklch(0.9 0.02 250);
		margin: 0;
	}

	.subtitle {
		font-size: 0.875rem;
		font-weight: 400;
		color: oklch(0.6 0.02 250);
		margin-left: 0.5rem;
	}

	.header-icon {
		width: 1.5rem;
		height: 1.5rem;
		color: oklch(0.7 0.15 200);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* Due Date Filter Chips (inline in Open Tasks header) */
	.subsection-header-row {
		display: flex;
		align-items: center;
	}
	.subsection-header-row .subsection-header {
		flex: 1;
		min-width: 0;
	}
	.date-filter-chips {
		display: flex;
		gap: 0.375rem;
		overflow-x: auto;
		scrollbar-width: none;
		margin-left: auto;
		padding-right: 0.25rem;
	}
	.date-filter-chips::-webkit-scrollbar {
		display: none;
	}
	.date-filter-chip {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		border-radius: 999px;
		border: 1px solid oklch(0.30 0.02 250);
		background: oklch(0.20 0.01 250);
		color: oklch(0.65 0.02 250);
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
		flex-shrink: 0;
	}
	.date-filter-chip:hover {
		background: oklch(0.24 0.02 250);
		border-color: oklch(0.38 0.03 250);
		color: oklch(0.80 0.02 250);
	}
	.date-filter-chip.active {
		background: oklch(0.28 0.08 200);
		border-color: oklch(0.55 0.12 200);
		color: oklch(0.90 0.05 200);
	}
	.date-filter-chip.has-overdue {
		border-color: oklch(0.50 0.15 25);
	}
	.date-filter-chip.has-overdue.active {
		background: oklch(0.28 0.08 25);
		border-color: oklch(0.55 0.15 25);
		color: oklch(0.90 0.08 25);
	}
	.chip-label {
		line-height: 1;
	}
	.chip-count {
		font-size: 0.6875rem;
		font-weight: 600;
		background: oklch(0.30 0.03 250);
		color: oklch(0.75 0.02 250);
		padding: 0.0625rem 0.375rem;
		border-radius: 999px;
		min-width: 1.25rem;
		text-align: center;
	}
	.date-filter-chip.active .chip-count {
		background: oklch(0.40 0.10 200);
		color: oklch(0.95 0.02 200);
	}
	.date-filter-chip.has-overdue.active .chip-count {
		background: oklch(0.45 0.12 25);
		color: oklch(0.95 0.02 25);
	}

	.filter-empty-state {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		color: oklch(0.55 0.02 250);
		font-size: 0.8125rem;
	}
	.filter-reset-btn {
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
		border: 1px solid oklch(0.35 0.06 200);
		background: oklch(0.22 0.03 200);
		color: oklch(0.75 0.10 200);
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.filter-reset-btn:hover {
		background: oklch(0.28 0.06 200);
		border-color: oklch(0.45 0.10 200);
		color: oklch(0.85 0.08 200);
	}

	/* Project Content Area */
	.project-content {
		background: oklch(0.18 0.01 250);
		border-radius: 0.75rem;
		border: 1px solid oklch(0.25 0.02 250);
		/* NOTE: overflow:hidden removed - it clips TaskIdBadge dropdowns that need to escape container (see jat-1xa13) */
	}

	@media (max-width: 1023px) {
		.project-content {
			border-radius: 0;
		}
	}

	/* Subsections */
	.subsection {
		padding: 0.5rem 0 0.75rem 0;
		border-bottom: 1px solid oklch(0.22 0.02 250);
	}

	.subsection:last-child {
		border-bottom: none;
	}

	.subsection-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		min-height: 2.25rem;
		padding: 0 1rem;
		background: transparent;
		border: none;
		cursor: pointer;
		font-size: 0.8125rem;
		font-weight: 600;
		color: oklch(0.7 0.02 250);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: background-color 0.15s ease;
	}

	.subsection-header:hover {
		background: oklch(0.2 0.01 250);
	}

	.subsection-collapse-icon {
		width: 0.875rem;
		height: 0.875rem;
		color: oklch(0.55 0.02 250);
		transition: transform 0.22s cubic-bezier(0.25, 1, 0.5, 1);
	}

	.subsection-collapse-icon.collapsed {
		transform: rotate(-90deg);
	}

	.subsection-count {
		margin-left: auto;
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.125rem 0.375rem;
		border-radius: 9999px;
		background: oklch(0.25 0.02 250);
		color: oklch(0.65 0.02 250);
		text-transform: none;
		letter-spacing: normal;
	}

	/* Epic Groups - indented to visually nest inside their parent section */
	.epic-group {
		margin: 0.5rem 0.75rem;
		background: oklch(0.16 0.01 250);
		border-radius: 0.5rem;
		border: 1px solid oklch(0.23 0.02 250);
		/* NOTE: Do NOT add overflow: hidden here - it clips TaskIdBadge dropdown menus */
	}

	.epic-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		min-height: 2.25rem;
		padding: 0 0.75rem;
		background: transparent;
		border: none;
		cursor: pointer;
	}

	.epic-header-row {
		display: flex;
		align-items: center;
		border-radius: 0.5rem;
		transition: background-color 0.15s ease;
	}

	.epic-header-row:hover {
		background: oklch(0.19 0.01 250);
	}

	.epic-header-row .epic-header {
		flex: 1;
		min-width: 0;
	}

	/* Swarm Button */
	.swarm-btn {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		margin-right: 0.5rem;
		border: 1px solid oklch(0.55 0.20 280 / 0.4);
		border-radius: 0.5rem;
		background: oklch(0.55 0.20 280 / 0.1);
		color: oklch(0.80 0.15 280);
		cursor: pointer;
		font-size: 0.75rem;
		font-weight: 600;
		transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
		white-space: nowrap;
		animation: swarm-glow 2s ease-in-out infinite;
	}

	.swarm-btn:hover {
		background: oklch(0.55 0.20 280 / 0.25);
		border-color: oklch(0.65 0.20 280 / 0.7);
		color: oklch(0.90 0.15 280);
		box-shadow: 0 0 12px oklch(0.55 0.20 280 / 0.3), 0 0 24px oklch(0.55 0.20 280 / 0.15);
	}

	.swarm-btn:disabled {
		cursor: not-allowed;
		opacity: 0.8;
	}

	.swarm-btn.swarm-spawning {
		animation: swarm-pulse 1s ease-in-out infinite;
		background: oklch(0.55 0.20 280 / 0.2);
		border-color: oklch(0.65 0.20 280 / 0.6);
	}

	.swarm-icon {
		width: 0.875rem;
		height: 0.875rem;
	}

	.swarm-spinner {
		width: 0.875rem;
		height: 0.875rem;
		animation: spin 0.8s linear infinite;
	}

	.swarm-count {
		font-variant-numeric: tabular-nums;
	}

	@keyframes swarm-glow {
		0%, 100% {
			box-shadow: 0 0 4px oklch(0.55 0.20 280 / 0.15);
		}
		50% {
			box-shadow: 0 0 10px oklch(0.55 0.20 280 / 0.25), 0 0 20px oklch(0.55 0.20 280 / 0.1);
		}
	}

	@keyframes swarm-pulse {
		0%, 100% {
			box-shadow: 0 0 8px oklch(0.55 0.20 280 / 0.3);
		}
		50% {
			box-shadow: 0 0 16px oklch(0.55 0.20 280 / 0.5), 0 0 32px oklch(0.55 0.20 280 / 0.2);
		}
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	.collapse-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: oklch(0.6 0.02 250);
		transition: transform 0.22s cubic-bezier(0.25, 1, 0.5, 1);
	}

	.collapse-icon.collapsed {
		transform: rotate(-90deg);
	}

	.collapse-icon.small {
		width: 1rem;
		height: 1rem;
	}

	.epic-title {
		flex: 1;
		text-align: left;
		font-size: 0.9375rem;
		font-weight: 600;
		color: oklch(0.85 0.02 250);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.epic-title-clickable {
		cursor: pointer;
		border-radius: 0.25rem;
		padding: 0.125rem 0.375rem;
		margin: -0.125rem -0.375rem;
		transition: background-color 0.15s, color 0.15s;
	}

	.epic-title-clickable:hover {
		background: oklch(0.85 0.02 250 / 0.12);
		color: oklch(0.92 0.04 250);
	}

	.epic-count {
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.125rem 0.375rem;
		border-radius: 9999px;
		background: oklch(0.25 0.02 250);
		color: oklch(0.7 0.02 250);
	}

	.epic-agents {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-left: auto;
		margin-right: 0.5rem;
	}

	.paused-agents {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-right: 0.5rem;
	}

	.subsection-right {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-left: auto;
	}

	.subsection-count-inline {
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.125rem 0.375rem;
		border-radius: 9999px;
		background: oklch(0.25 0.02 250);
		color: oklch(0.65 0.02 250);
		text-transform: none;
		letter-spacing: normal;
	}

	.epic-content {
		border-top: 1px solid oklch(0.23 0.02 250);
		/* Ensure full width even during Svelte slide transition which temporarily
		   applies overflow:hidden + height animation. Without this, table-layout:fixed
		   tables inside may compute incorrect column widths. */
		width: 100%;
	}

	/* Override TasksOpen table styles when inside accordion */
	.epic-content :global(.tasks-table-wrapper) {
		background: transparent;
	}

	.epic-content :global(.tasks-table th) {
		display: none; /* Hide header row - parent accordion header is the context */
	}

	.epic-content :global(.tasks-table thead) {
		display: none;
	}

	.epic-content :global(.tasks-table td) {
		padding: 0.5rem 0.75rem;
		border-bottom-color: oklch(0.2 0.02 250 / 0.5);
	}

	.epic-content :global(.task-row:last-child td) {
		border-bottom: none;
	}

	.epic-content :global(.task-row:hover) {
		background: oklch(0.18 0.01 250);
	}

	/* Active Sessions subsection - amber left border on header to signal live ops */
	.subsection.bg-base-100 .subsection-header {
		border-left: 3px solid oklch(0.75 0.15 85 / 0.9);
		background: oklch(0.75 0.15 85 / 0.04);
	}

	/* Active Sessions count badge - amber tint so it reads as live even when collapsed */
	.subsection.bg-base-100 .subsection-count {
		background: oklch(0.28 0.08 85);
		color: oklch(0.75 0.15 85);
	}

	/* Voice Inbox subsection - violet left border and chip (matches mic icon hue 290) */
	.voice-inbox-subsection .subsection-header {
		border-left: 2px solid oklch(0.65 0.15 290 / 0.4);
	}

	.voice-inbox-subsection .subsection-count {
		background: oklch(0.25 0.08 290);
		color: oklch(0.70 0.15 290);
	}

	/* Voice Inbox header action buttons */
	.voice-header-actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding-right: 0.5rem;
		flex-shrink: 0;
	}

	.vi-btn {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.15rem 0.45rem;
		font-size: 0.6875rem;
		border-radius: 0.25rem;
		border: 1px solid oklch(0.28 0.03 250 / 0.6);
		background: oklch(0.20 0.02 250 / 0.4);
		color: oklch(0.58 0.04 250);
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.1s, color 0.1s;
	}

	.vi-btn:hover:not(:disabled) {
		background: oklch(0.25 0.03 250 / 0.6);
		color: oklch(0.75 0.04 250);
	}

	.vi-btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.vi-btn-cancel {
		padding: 0.15rem 0.35rem;
	}

	.vi-btn-primary {
		background: oklch(0.22 0.06 290 / 0.4);
		border-color: oklch(0.45 0.12 290 / 0.5);
		color: oklch(0.68 0.12 290);
	}

	.vi-btn-primary:hover:not(:disabled) {
		background: oklch(0.28 0.08 290 / 0.5);
		color: oklch(0.78 0.14 290);
	}

	.vi-toggle {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.6875rem;
		color: oklch(0.55 0.04 250);
		cursor: pointer;
		user-select: none;
		white-space: nowrap;
	}

	.vi-toggle input[type="checkbox"] {
		accent-color: oklch(0.65 0.15 290);
		cursor: pointer;
		width: 0.75rem;
		height: 0.75rem;
	}

	/* Slide-to-dismiss track in header */
	.vi-slide-container {
		width: 9rem;
		height: 22px;
		cursor: grab;
		user-select: none;
		touch-action: none;
		flex-shrink: 0;
	}

	.vi-slide-container:active { cursor: grabbing; }

	.vi-slide-track {
		position: relative;
		height: 100%;
		background: oklch(0.20 0.05 25 / 0.3);
		border-radius: 11px;
		border: 1px solid oklch(0.40 0.10 25 / 0.4);
		overflow: hidden;
	}

	.vi-slide-fill {
		position: absolute;
		inset: 0 auto 0 0;
		background: linear-gradient(90deg, oklch(0.45 0.12 25 / 0.6), oklch(0.55 0.15 25 / 0.7));
		border-radius: 11px;
		transition: width 0.05s linear;
		pointer-events: none;
	}

	.vi-slide-thumb {
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 18px;
		height: 18px;
		background: oklch(0.88 0.03 250);
		border: 1.5px solid oklch(0.55 0.12 25 / 0.8);
		border-radius: 50%;
		pointer-events: none;
		transition: left 0.05s linear;
	}

	.vi-slide-text {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.6rem;
		font-weight: 600;
		color: oklch(0.72 0.08 25);
		pointer-events: none;
		white-space: nowrap;
	}

	@keyframes vi-spin { to { transform: rotate(360deg); } }

	/* Open Tasks subsection - cyan chip (matches list icon hue 200) */
	.open-tasks-subsection .subsection-count {
		background: oklch(0.22 0.07 200);
		color: oklch(0.70 0.15 200);
	}

	/* Completed Tasks subsection - green chip (matches check icon hue 145) */
	.completed-tasks-subsection .subsection-count {
		background: oklch(0.22 0.07 145);
		color: oklch(0.65 0.18 145);
	}

	/* Paused/Waiting/Conversations subsections - flush with other top-level sections */
	.paused-subsection,
	.waiting-subsection,
	.conversations-subsection {
		margin-left: 0;
		margin-right: 0;
	}

	/* Waiting for Input header - amber tint signals "needs you" even when collapsed */
	.waiting-subsection .subsection-header {
		background: oklch(0.75 0.15 85 / 0.05);
		border-left: 2px solid oklch(0.75 0.15 85 / 0.5);
	}
	.waiting-subsection .subsection-header:hover {
		background: oklch(0.75 0.15 85 / 0.09);
	}

	/* Waiting for Input section */
	.waiting-content {
		overflow: hidden;
	}

	.waiting-sessions-list {
		border-radius: 0.375rem;
		overflow: hidden;
		border: 1px solid oklch(0.75 0.15 85 / 0.15);
	}

	.waiting-row {
		display: flex;
		flex-direction: column;
		background: linear-gradient(90deg, oklch(0.75 0.15 85 / 0.06), transparent 60%);
		border-left: 3px solid oklch(0.75 0.15 85 / 0.5);
		border-bottom: 1px solid oklch(0.75 0.15 85 / 0.08);
	}

	.waiting-row:last-child {
		border-bottom: none;
	}

	.waiting-row-top {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.waiting-row-top:hover {
		background: linear-gradient(90deg, oklch(0.75 0.15 85 / 0.12), oklch(0.20 0.01 250 / 0.3) 60%);
	}

	.waiting-row-thread {
		padding: 0 0.75rem 0.75rem 0.75rem;
		padding-left: calc(0.75rem + 40px + 0.625rem); /* align with task text */
	}

	.waiting-row-task {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		flex: 1;
		min-width: 0;
	}

	.waiting-task-text {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
		flex: 1;
	}

	.waiting-task-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: oklch(0.85 0.02 250);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.waiting-task-id {
		font-size: 0.7rem;
		color: oklch(0.75 0.15 85 / 0.8);
	}

	.waiting-row-action {
		flex-shrink: 0;
	}

	/* Override TasksPaused table styles to match TasksActive and TasksOpen */
	.paused-content {
		overflow: hidden; /* Prevent table from overflowing container */
	}

	.paused-content :global(.paused-sessions-table) {
		background: transparent;
		border: none;
		border-radius: 0;
	}

	.paused-content :global(.paused-table thead) {
		display: none; /* Hide header row - parent subsection header is the context */
	}

	.paused-content :global(.paused-table tbody tr) {
		border-bottom: 1px solid oklch(0.2 0.02 250 / 0.5);
	}

	.paused-content :global(.paused-table tbody tr:last-child) {
		border-bottom: none;
	}

	.paused-content :global(.paused-table td) {
		padding: 0.5rem 0.75rem;
		font-size: 0.8rem;
	}

	.paused-content :global(.paused-row:hover) {
		background: oklch(0.18 0.01 250);
	}

	/* Standalone Group (collapsible, same structure as epic) */
	.epic-group.standalone {
		border-color: oklch(0.28 0.02 250);
		background: oklch(0.14 0.01 250);
	}

	.epic-group.standalone .epic-header:hover {
		background: oklch(0.17 0.01 250);
	}

	.standalone-icon {
		font-size: 0.875rem;
		line-height: 1;
	}

	/* Loading Skeleton */
	.loading-container {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* Section Skeleton */
	.section-skeleton {
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.22 0.02 250);
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.skeleton-section-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: oklch(0.16 0.01 250);
		border-bottom: 1px solid oklch(0.22 0.02 250);
	}

	.skeleton-subsection {
		padding: 0.5rem;
	}

	.skeleton-subsection-header {
		display: flex;
		align-items: center;
		padding: 0.5rem 0.75rem;
		background: oklch(0.15 0.01 250);
		border-radius: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.skeleton-task-rows {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.skeleton-task-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 0.75rem;
		background: oklch(0.15 0.01 250);
		border-radius: 0.25rem;
	}

	.skeleton {
		background: oklch(0.25 0.02 250);
		animation: pulse 1.5s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	/* Error and empty states */
	.error-state,
	.empty-state,
	.project-empty-state {
		padding: 3rem;
		text-align: center;
		color: oklch(0.6 0.02 250);
		background: oklch(0.18 0.01 250);
		border-radius: 0.75rem;
		border: 1px solid oklch(0.25 0.02 250);
	}

	.project-empty-state {
		margin: 1rem;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	/* Add task button for empty state */
	.add-task-empty-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1rem 1.5rem;
		background: oklch(0.16 0.01 250);
		border: 2px dashed oklch(0.30 0.02 250);
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.add-task-empty-btn:hover {
		background: oklch(0.20 0.01 250);
		border-color: oklch(0.45 0.02 250);
	}

	.add-task-empty-btn:hover .add-task-icon {
		color: oklch(0.75 0.15 200);
	}

	.add-task-empty-btn:hover .add-task-label {
		color: oklch(0.75 0.15 200);
	}

	.add-task-icon {
		width: 1.5rem;
		height: 1.5rem;
		color: oklch(0.45 0.02 250);
		transition: color 0.15s ease;
	}

	.add-task-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: oklch(0.45 0.02 250);
		transition: color 0.15s ease;
	}

	.error-state button {
		margin-top: 0.75rem;
		padding: 0.375rem 0.75rem;
		background: oklch(0.25 0.02 250);
		border: 1px solid oklch(0.35 0.02 250);
		border-radius: 0.5rem;
		color: oklch(0.8 0.02 250);
		cursor: pointer;
	}

	.error-state button:hover {
		background: oklch(0.3 0.02 250);
	}

	/* Completed Tasks Section */
	.completed-tasks-content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 0.5rem 0rem;
	}

	.completed-loading {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		color: oklch(0.6 0.02 250);
		font-size: 0.8125rem;
	}

	.completed-empty {
		padding: 1.5rem;
		text-align: center;
		color: oklch(0.5 0.02 250);
		font-size: 0.8125rem;
	}

	.load-more-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		width: auto;
		margin: 0 1rem;
		padding: 0.75rem 1rem;
		min-height: 2.75rem;
		background: oklch(0.18 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.5rem;
		color: oklch(0.70 0.02 250);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.load-more-btn:hover {
		background: oklch(0.22 0.02 250);
		border-color: oklch(0.40 0.02 250);
		color: oklch(0.80 0.02 250);
	}

	.memory-overlay {
		position: fixed;
		inset: 0;
		background: oklch(0 0 0 / 50%);
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.memory-panel {
		background: var(--color-base-100);
		border: 1px solid var(--color-base-300);
		border-radius: 0.75rem;
		max-width: 700px;
		width: 100%;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 25px 50px oklch(0 0 0 / 25%);
	}

	.memory-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-base-300);
	}

	.memory-header-title {
		font-size: 0.85rem;
		font-weight: 600;
		font-family: ui-monospace, monospace;
		color: var(--color-base-content);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.memory-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 0.5rem;
		border: none;
		background: transparent;
		color: oklch(from var(--color-base-content) l c h / 50%);
		cursor: pointer;
		flex-shrink: 0;
	}

	.memory-close:hover {
		background: var(--color-base-200);
		color: var(--color-base-content);
	}

	.memory-body {
		padding: 1rem;
		overflow-y: auto;
		font-size: 0.8rem;
		line-height: 1.6;
		color: oklch(from var(--color-base-content) l c h / 80%);
		font-family: ui-monospace, monospace;
		white-space: pre-wrap;
		word-break: break-word;
		margin: 0;
	}

	/* Voice inbox subsection - uses standard .subsection padding-bottom like all other sections */

	/* Attention notifications */
	.attention-notifs {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.5rem 0.5rem 0;
	}
	.attention-notif {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.45rem 0.65rem;
		border-radius: 0.5rem;
		border: 1px solid oklch(0.36 0.10 280 / 0.45);
		background: oklch(0.18 0.03 280 / 0.9);
		backdrop-filter: blur(6px);
		font-size: 0.75rem;
	}
	/* Pulsing border glow for urgent needs_input notifications */
	@keyframes notif-urgent-glow {
		0%, 100% {
			border-color: oklch(0.52 0.16 290 / 0.5);
			box-shadow: 0 0 0 0 oklch(0.55 0.18 290 / 0);
		}
		50% {
			border-color: oklch(0.65 0.22 290 / 0.80);
			box-shadow: 0 0 10px 2px oklch(0.55 0.18 290 / 0.22);
		}
	}
	/* Subtle glow for review-ready notifications */
	@keyframes notif-review-glow {
		0%, 100% {
			border-color: oklch(0.50 0.14 180 / 0.45);
			box-shadow: none;
		}
		50% {
			border-color: oklch(0.62 0.18 180 / 0.70);
			box-shadow: 0 0 8px 1px oklch(0.55 0.16 180 / 0.18);
		}
	}
	/* Icon breathe for needs_input */
	@keyframes notif-icon-breathe {
		0%, 100% { transform: scale(1); opacity: 0.82; }
		50% { transform: scale(1.20); opacity: 1; }
	}
	.notif-needs-input {
		border-color: oklch(0.52 0.16 290 / 0.5);
		background: oklch(0.17 0.04 290 / 0.9);
		animation: notif-urgent-glow 2.4s ease-in-out infinite;
	}
	.notif-review {
		border-color: oklch(0.50 0.14 180 / 0.45);
		background: oklch(0.17 0.03 180 / 0.9);
		animation: notif-review-glow 3.2s ease-in-out infinite;
	}
	.notif-icon {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		color: oklch(0.65 0.14 280);
	}
	.notif-needs-input .notif-icon {
		color: oklch(0.68 0.18 290);
		animation: notif-icon-breathe 2.4s ease-in-out infinite;
	}
	.notif-review .notif-icon { color: oklch(0.65 0.16 180); }
	.notif-body {
		display: flex;
		align-items: baseline;
		gap: 0.35rem;
		flex: 1;
		flex-wrap: wrap;
		min-width: 0;
	}
	.notif-agent {
		font-weight: 600;
		color: oklch(0.84 0.06 250);
		white-space: nowrap;
	}
	.notif-state {
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		white-space: nowrap;
	}
	.notif-needs-input .notif-state { color: oklch(0.68 0.18 290); }
	.notif-review .notif-state { color: oklch(0.65 0.16 180); }
	.notif-task {
		color: oklch(0.50 0.04 250);
		font-size: 0.70rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 240px;
	}
	.notif-go {
		font-size: 0.68rem;
		font-weight: 600;
		padding: 0.18rem 0.5rem;
		border-radius: 0.25rem;
		border: 1px solid oklch(0.40 0.08 250 / 0.4);
		background: oklch(0.22 0.03 250 / 0.6);
		color: oklch(0.70 0.10 220);
		cursor: pointer;
		white-space: nowrap;
		flex-shrink: 0;
		transition: background 0.15s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.15s, transform 0.12s cubic-bezier(0.25, 1, 0.5, 1);
	}
	.notif-go:hover {
		background: oklch(0.28 0.06 220 / 0.7);
		border-color: oklch(0.55 0.12 220 / 0.5);
		transform: scale(1.04);
	}
	.notif-go:active {
		transform: scale(0.96);
		transition-duration: 0.06s;
	}
	.notif-dismiss {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		border-radius: 0.25rem;
		border: none;
		background: transparent;
		color: oklch(0.40 0.02 250);
		cursor: pointer;
		font-size: 0.9rem;
		line-height: 1;
		flex-shrink: 0;
		transition: color 0.15s, background 0.15s, transform 0.15s cubic-bezier(0.25, 1, 0.5, 1);
	}
	.notif-dismiss:hover {
		color: oklch(0.65 0.04 250);
		background: oklch(0.22 0.02 250 / 0.5);
		transform: rotate(90deg) scale(1.1);
	}
	.notif-dismiss:active {
		transform: rotate(90deg) scale(0.9);
		transition-duration: 0.06s;
	}
	@media (prefers-reduced-motion: reduce) {
		.notif-needs-input,
		.notif-review,
		.notif-needs-input .notif-icon {
			animation: none !important;
		}
		.notif-go,
		.notif-dismiss {
			transition: background 0.15s, color 0.15s, border-color 0.15s !important;
		}
		.notif-go:hover,
		.notif-dismiss:hover {
			transform: none !important;
		}
	}

</style>
