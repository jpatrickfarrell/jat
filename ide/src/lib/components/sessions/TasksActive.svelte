<script lang="ts">
	/**
	 * TasksActive Component
	 *
	 * Displays active agent/server sessions in a table format with expandable rows.
	 * Extracted from /tasks page for reuse in other views.
	 */

	import { untrack } from 'svelte';
	import { addToast } from '$lib/stores/toasts.svelte';
	import AgentAvatar from '$lib/components/AgentAvatar.svelte';
	import { getReviewRules } from '$lib/stores/reviewRules.svelte';
	import { computeReviewStatus } from '$lib/utils/reviewStatusUtils';
	import { getSessionStateVisual, getSessionStateActions, type SessionState } from '$lib/config/statusColors';
	import ProviderLogo from '$lib/components/agents/ProviderLogo.svelte';
	import MonacoWrapper from '$lib/components/config/MonacoWrapper.svelte';
	import FxText from '$lib/components/FxText.svelte';
	import MobileSessionDrawer from '$lib/components/work/MobileSessionDrawer.svelte';
	import CompletionCardCompact from '$lib/components/work/CompletionCardCompact.svelte';
	import StateCardCompact from '$lib/components/work/StateCardCompact.svelte';
	import { getSwipeConfig, getSwipeActionDef, initSwipeActions } from '$lib/config/swipeActions';
	import { isAutoKillEnabled, setPendingAutoKill } from '$lib/stores/autoKillConfig';
	import { autoKillCountdowns, cancelAutoKill } from '$lib/stores/sessionEvents';
	import { onMount } from 'svelte';
	import { slide, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { STATUS_OPTIONS } from '$lib/config/task-statuses';

	function activeTaskCtx(t: AgentTask): Record<string, any> {
		return { title: t.title, status: t.status, priority: t.priority, type: t.issue_type, labels: t.labels?.join(', '), created_at: t.created_at };
	}

	/** Split an agent name on camelCase boundaries: "GentleCoast" → ["Gentle", "Coast"]. */
	// Types
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

	interface AgentTask {
		id: string;
		status: string;
		issue_type?: string;
		title?: string;
		priority?: number;
		description?: string;
		notes?: string;
		labels?: string[];
		agent_program?: string | null;
		created_at?: string;
	}

	interface AgentSessionInfo {
		tokens: number;
		cost: number;
		activityState?: string;
		activityStateTimestamp?: number;
	}

	// Props
	let {
		sessions = [],
		agentTasks = new Map(),
		agentSessionInfo = new Map(),
		agentProjects = new Map(),
		projectColors = {},
		taskIntegrations = {},
		browserSessions = new Map(),
		agentOutputs = new Map(),
		onKillSession,
		onAttachSession,
		onViewTask,
		onCardClick,
	}: {
		sessions: TmuxSession[];
		agentTasks: Map<string, AgentTask>;
		agentSessionInfo: Map<string, AgentSessionInfo>;
		agentProjects: Map<string, string>;
		projectColors: Record<string, string>;
		taskIntegrations?: Record<string, { sourceId: string; sourceType: string; sourceName: string; sourceEnabled: boolean }>;
		browserSessions?: Map<string, number>;
		agentOutputs?: Map<string, string>;
		onKillSession?: (sessionName: string) => Promise<void>;
		onAttachSession?: (sessionName: string) => Promise<void>;
		onViewTask?: (taskId: string) => void;
		onCardClick?: (sessionName: string) => void;
	} = $props();

	// Terminal output helpers (shared with /monitor)
	function stripAnsi(str: string) {
		return str
			.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '')
			.replace(/\x1b\][^\x07]*(?:\x07|\x1b\\)/g, '')
			.replace(/\x1b[^[\]A-Za-z]/g, '')
			.replace(/\x1b/g, '')
			.replace(/\r/g, '');
	}

	function isStatusLine(line: string): boolean {
		if (/[▪▫]{3}/.test(line)) return true;
		if (/·\s*[●⚙○◉⏻]/.test(line)) return true;
		if (/·\s*\[P\d\]/.test(line)) return true;
		if (/^[^a-zA-Z]*💬/.test(line)) return true;
		if (/bypass permissions on/.test(line)) return true;
		if (/^[\s─]{10,}$/.test(line)) return true;
		if (/^\s*❯\s*$/.test(line)) return true;
		// Claude Code extended thinking completion lines (✻ Baked for..., ✻ Brewed for..., etc.)
		if (/^✻/.test(line)) return true;
		// Claude Code session rating prompt
		if (/How is Claude doing this session/.test(line)) return true;
		// Claude Code session rating options (1: Bad  2: Fine  3: Good  0: Dismiss)
		if (/\d:\s*(Bad|Fine|Good|Dismiss)/.test(line)) return true;
		return false;
	}

	function getOutputTail(agentName: string, n: number): string[] {
		const raw = agentOutputs.get(agentName) || '';
		if (!raw) return [];
		const lines = stripAnsi(raw)
			.split('\n')
			.map((l: string) => l.trimEnd())
			.filter((l: string) => !isStatusLine(l));
		// Find last non-blank line, then take n lines ending there (preserves blanks within window)
		let end = lines.length;
		while (end > 0 && lines[end - 1] === '') end--;
		return lines.slice(Math.max(0, end - n), end);
	}

	// Status and priority colors
	const statusColors: Record<string, string> = {
		open: 'badge-info',
		in_progress: 'badge-warning',
		blocked: 'badge-error',
		closed: 'badge-success',
		dev: 'badge-ghost',
		submitted: 'badge-secondary badge-outline'
	};

	// Mobile fullscreen state
	let fullscreenSession = $state<string | null>(null);

	// LLM file result drawer state
	let llmFileDrawerOpen = $state(false);
	let llmFileContent = $state('');
	let llmFileName = $state('');
	let llmFileProject = $state('');
	let llmFileSaving = $state(false);
	let llmFileSaved = $state(false);
	let llmFileValidation = $state<{ status: 'idle' | 'valid' | 'invalid' | 'checking'; message: string | null }>({ status: 'idle', message: null });
	let llmFileValidationTimeout: ReturnType<typeof setTimeout> | null = null;

	// Validate LLM file path
	function validateLlmFilePath(filename: string) {
		if (llmFileValidationTimeout) {
			clearTimeout(llmFileValidationTimeout);
		}

		if (!filename.trim()) {
			llmFileValidation = { status: 'invalid', message: 'Filename is required' };
			return;
		}

		// Check for invalid characters in path
		const invalidChars = /[<>:"|?*\x00-\x1f]/;
		if (invalidChars.test(filename)) {
			llmFileValidation = { status: 'invalid', message: 'Invalid characters in filename (< > : " | ? *)' };
			return;
		}

		// Check for double slashes or leading/trailing slashes
		if (filename.includes('//') || filename.startsWith('/') || filename.endsWith('/')) {
			llmFileValidation = { status: 'invalid', message: 'Invalid path format' };
			return;
		}

		// Check for path traversal attempts
		if (filename.includes('..')) {
			llmFileValidation = { status: 'invalid', message: 'Path traversal (..) not allowed' };
			return;
		}

		// Check file extension
		const hasExtension = /\.[a-zA-Z0-9]+$/.test(filename);
		if (!hasExtension) {
			llmFileValidation = { status: 'invalid', message: 'Filename should have an extension (e.g., .md, .txt)' };
			return;
		}

		// Debounce server-side validation
		llmFileValidation = { status: 'checking', message: 'Checking path...' };
		llmFileValidationTimeout = setTimeout(async () => {
			try {
				// Check if file already exists
				const params = new URLSearchParams({
					project: llmFileProject,
					path: filename.trim()
				});
				const response = await fetch(`/api/files/content?${params}`, { method: 'HEAD' });

				if (response.ok) {
					llmFileValidation = { status: 'valid', message: 'File exists - will be overwritten' };
				} else if (response.status === 404) {
					llmFileValidation = { status: 'valid', message: 'Ready to save' };
				} else {
					llmFileValidation = { status: 'valid', message: 'Ready to save' };
				}
			} catch {
				// If check fails, still allow saving
				llmFileValidation = { status: 'valid', message: 'Ready to save' };
			}
		}, 300);
	}

	// Action loading state
	let actionLoading = $state<string | null>(null);

	// Per-action visual feedback — tracks which button was just clicked per session
	// key: "sessionName:actionId", value: feedback variant ('success' | 'warning' | 'error' | 'info' | 'working')
	let actionFeedback = $state<Map<string, string>>(new Map());
	// Per-session auto-complete disabled state (when user manually overrides)
	let autoCompleteDisabledMap = $state<Map<string, boolean>>(new Map());
	// Track which sessions have already had auto-complete triggered (prevent re-fire)
	let autoCompleteTriggeredSet = $state(new Set<string>());

	// Animation state tracking - maintains order so exiting sessions stay in position
	let previousSessionObjects = $state<Map<string, TmuxSession>>(new Map());
	let sessionOrder = $state<string[]>([]); // Tracks order for position preservation
	let newSessionNames = $state<string[]>([]);
	let exitingSessionNames = $state<Set<string>>(new Set());
	// Persistent cache of last-known task per agent - survives agentTasks removal
	// so exit animation can still render the TaskIdBadge (agentPill variant).
	// Entries are only cleaned up after the exit animation timeout fires.
	let cachedAgentTasks = $state<Map<string, AgentTask>>(new Map());
	// Track sessions that had task data when they first appeared (for text animation)
	let sessionsWithTaskOnEntry = $state<Set<string>>(new Set());

	// Optimistic state overrides - for instant UI feedback before WS catches up
	let optimisticStates = $state<Map<string, string>>(new Map());

	// Completion signal events per agent (for completed state card body)
	interface CompletionEvent { type: string; state?: string; data?: any; }
	type CompletionEntry = { state: 'loading' | 'loaded' | 'empty'; events: CompletionEvent[] };
	let completionDataMap = $state<Map<string, CompletionEntry>>(new Map());

	// Auto-fetch completion data for any completed session
	$effect(() => {
		for (const session of sessions) {
			if (session.type !== 'agent') continue;
			const agentName = getAgentName(session.name);
			const task = agentTasks.get(agentName);
			const rawState = optimisticStates.get(session.name) || agentSessionInfo.get(agentName)?.activityState || 'idle';
			const effectiveState = task?.status === 'closed' ? 'completed' : rawState;
			if (effectiveState === 'completed' && !completionDataMap.has(agentName)) {
				fetchCompletionForAgent(agentName);
			}
		}
	});

	async function fetchCompletionForAgent(agentName: string) {
		if (!agentName || completionDataMap.has(agentName)) return;
		// Mark loading
		completionDataMap = new Map(completionDataMap).set(agentName, { state: 'loading', events: [] });
		try {
			const res = await fetch(`/api/sessions/${encodeURIComponent(agentName)}/timeline?limit=50&type=complete,review`);
			if (!res.ok) {
				completionDataMap = new Map(completionDataMap).set(agentName, { state: 'empty', events: [] });
				return;
			}
			const data = await res.json();
			const events: CompletionEvent[] = data.events || [];
			completionDataMap = new Map(completionDataMap).set(agentName, {
				state: events.length > 0 ? 'loaded' : 'empty',
				events
			});
		} catch {
			completionDataMap = new Map(completionDataMap).set(agentName, { state: 'empty', events: [] });
		}
	}

	// ── Signal data for active (non-completed) states ────────────────────────
	// Key: `${agentName}:${uiState}` so re-fetches automatically on state change.
	interface SignalEventEntry { state: 'loading' | 'loaded' | 'empty'; event: CompletionEvent | null; }
	let signalDataMap = $state<Map<string, SignalEventEntry>>(new Map());

	// Maps UI state → timeline event type filter
	const STATE_TO_SIGNAL_TYPE: Record<string, string> = {
		'starting':         'starting',
		'working':          'working',
		'needs-input':      'needs_input',
		'ready-for-review': 'review',
		'completing':       'completing',
	};

	$effect(() => {
		for (const session of sessions) {
			if (session.type !== 'agent') continue;
			const agentName = getAgentName(session.name);
			const task = agentTasks.get(agentName);
			const rawState = optimisticStates.get(session.name) || agentSessionInfo.get(agentName)?.activityState || 'idle';
			const effectiveState = task?.status === 'closed' ? 'completed' : rawState;
			// Only fetch for states that have signal payloads
			if (!STATE_TO_SIGNAL_TYPE[effectiveState]) continue;
			const key = `${agentName}:${effectiveState}`;
			if (!signalDataMap.has(key)) {
				fetchSignalForAgent(agentName, effectiveState);
			}
		}
	});

	async function fetchSignalForAgent(agentName: string, uiState: string) {
		const key = `${agentName}:${uiState}`;
		if (signalDataMap.has(key)) return;
		signalDataMap = new Map(signalDataMap).set(key, { state: 'loading', event: null });
		const eventType = STATE_TO_SIGNAL_TYPE[uiState] ?? uiState;
		try {
			const res = await fetch(`/api/sessions/${encodeURIComponent(agentName)}/timeline?limit=5&type=${eventType}`);
			if (!res.ok) {
				signalDataMap = new Map(signalDataMap).set(key, { state: 'empty', event: null });
				return;
			}
			const data = await res.json();
			const events: CompletionEvent[] = data.events || [];
			// events are newest-first; take the most recent
			signalDataMap = new Map(signalDataMap).set(key, {
				state: events.length > 0 ? 'loaded' : 'empty',
				event: events[0] ?? null,
			});
		} catch {
			signalDataMap = new Map(signalDataMap).set(key, { state: 'empty', event: null });
		}
	}

	// Inline epic picker state (for mobile card tray)
	let epicPickerSession = $state<string | null>(null);
	let epicPickerItems = $state<{id: string; title: string; status: string}[]>([]);
	let epicPickerLoading = $state(false);
	let epicPickerSearch = $state('');
	let epicLinkingId = $state<string | null>(null);
	let mobileShowCreateEpic = $state(false);
	let mobileNewEpicTitle = $state('');
	let mobileCreatingEpic = $state(false);
	let mobileCreateEpicError = $state<string | null>(null);
	let mobileNewEpicInputEl = $state<HTMLInputElement | undefined>(undefined);

	async function mobileCreateEpic(taskId: string) {
		if (!mobileNewEpicTitle.trim() || mobileCreatingEpic) return;
		mobileCreatingEpic = true;
		mobileCreateEpicError = null;
		try {
			const project = taskId.split('-')[0];
			const res = await fetch('/api/epics', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title: mobileNewEpicTitle.trim(), project, linkTaskId: taskId })
			});
			if (!res.ok) {
				const d = await res.json();
				throw new Error(d.error || 'Failed to create epic');
			}
			const d = await res.json();
			// Add the new epic to the list and mark it as linked
			epicPickerItems = [{ id: d.epicId, title: mobileNewEpicTitle.trim(), status: 'open' }, ...epicPickerItems];
			mobileNewEpicTitle = '';
			mobileShowCreateEpic = false;
			epicLinkingId = d.epicId;
			// Small delay so user sees the new item before closing
			setTimeout(() => { epicPickerSession = null; epicLinkingId = null; }, 800);
		} catch (err) {
			mobileCreateEpicError = err instanceof Error ? err.message : 'Failed to create epic';
		} finally {
			mobileCreatingEpic = false;
		}
	}

	const filteredEpicPickerItems = $derived(
		epicPickerSearch.trim()
			? epicPickerItems.filter(e =>
				e.id.toLowerCase().includes(epicPickerSearch.toLowerCase()) ||
				e.title.toLowerCase().includes(epicPickerSearch.toLowerCase())
			)
			: epicPickerItems
	);

	async function openMobileEpicPicker(sessionName: string, taskId: string) {
		if (epicPickerSession === sessionName) {
			epicPickerSession = null;
			mobileShowCreateEpic = false;
			mobileNewEpicTitle = '';
			mobileCreateEpicError = null;
			return;
		}
		// Close commands panel if open
		cmdPanelSession = null;
		mobileShowCreateEpic = false;
		mobileNewEpicTitle = '';
		mobileCreateEpicError = null;
		epicPickerSession = sessionName;
		epicPickerSearch = '';
		epicPickerItems = [];
		epicPickerLoading = true;
		const project = taskId.split('-')[0];
		try {
			const res = await fetch(`/api/epics?project=${project}`);
			epicPickerItems = (await res.json()).epics || [];
		} catch { /* silently fail */ }
		finally { epicPickerLoading = false; }
	}

	async function linkMobileTaskToEpic(taskId: string, epicId: string) {
		if (epicLinkingId) return;
		epicLinkingId = epicId;
		try {
			await fetch(`/api/tasks/${encodeURIComponent(taskId)}/epic`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ epicId })
			});
			epicPickerSession = null;
			epicPickerItems = [];
		} catch (e) { console.warn('[TasksActive] Failed to link task to epic:', e); }
		finally { epicLinkingId = null; }
	}



	// Shared commands cache (used by desktop tray + mobile cmd panel)
	let dtrayCommandsItems = $state<{name: string; invocation: string; namespace: string}[]>([]);
	let dtrayCommandsLoading = $state(false);

	// Inline commands panel state (for mobile card tray)
	let cmdPanelSession = $state<string | null>(null);
	let cmdPanelSearch = $state('');

	const filteredCmdPanelItems = $derived(
		cmdPanelSearch.trim()
			? dtrayCommandsItems.filter(c =>
				c.name.toLowerCase().includes(cmdPanelSearch.toLowerCase()) ||
				c.namespace.toLowerCase().includes(cmdPanelSearch.toLowerCase()) ||
				c.invocation.toLowerCase().includes(cmdPanelSearch.toLowerCase())
			)
			: dtrayCommandsItems
	);

	async function openMobileCmdPanel(sessionName: string) {
		if (cmdPanelSession === sessionName) {
			cmdPanelSession = null;
			return;
		}
		// Close epic picker if open
		epicPickerSession = null;
		cmdPanelSession = sessionName;
		cmdPanelSearch = '';
		if (dtrayCommandsItems.length === 0 && !dtrayCommandsLoading) {
			dtrayCommandsLoading = true;
			try {
				const res = await fetch('/api/commands');
				dtrayCommandsItems = (await res.json()).commands || [];
			} catch { /* silently fail */ }
			finally { dtrayCommandsLoading = false; }
		}
	}

	// Clear optimistic states when WS catches up
	$effect(() => {
		if (optimisticStates.size === 0) return;

		let changed = false;
		const newOptimistic = new Map(optimisticStates);

		for (const [sessionName, optimisticState] of optimisticStates) {
			const agentName = sessionName.startsWith('jat-') ? sessionName.slice(4) : sessionName;
			const sseState = agentSessionInfo.get(agentName)?.activityState;

			// Clear optimistic state when SSE reports a "later" state
			// For 'completing': only clear on completed/idle (NOT on exact match,
			// because SSE can briefly report 'working' between signal emissions,
			// causing the badge to flicker completing→working→completing)
			if ((optimisticState === 'completing' && (sseState === 'completed' || sseState === 'idle')) ||
				(optimisticState !== 'completing' && sseState === optimisticState)) {
				newOptimistic.delete(sessionName);
				changed = true;
				console.log('[TasksActive] Cleared optimistic state for', sessionName, '- SSE caught up:', sseState);
			}
		}

		if (changed) {
			optimisticStates = newOptimistic;
		}
	});

	// Keep task cache up-to-date so exit animations can render TaskIdBadge
	// (agentTasks may lose entries before the session exit is detected)
	$effect(() => {
		const prev = untrack(() => cachedAgentTasks);
		let changed = false;
		const updated = new Map(prev);
		for (const [name, task] of agentTasks) {
			if (prev.get(name) !== task) {
				updated.set(name, task);
				changed = true;
			}
		}
		if (changed) cachedAgentTasks = updated;
	});

	// Effect to detect new and exiting sessions while preserving order
	$effect(() => {
		const currentNames = new Set(sessions.map(s => s.name));

		// Use untrack to read previous state without creating a dependency
		const prevObjects = untrack(() => previousSessionObjects);
		const prevOrder = untrack(() => sessionOrder);
		const prevExiting = untrack(() => exitingSessionNames);

		// Build current session object map
		const currentObjects = new Map<string, TmuxSession>();
		for (const session of sessions) {
			currentObjects.set(session.name, session);
		}

		// Skip on initial load - just set initial order
		if (prevOrder.length === 0 && sessions.length > 0) {
			sessionOrder = sessions.map(s => s.name);
			previousSessionObjects = currentObjects;
			return;
		}

		// Find new sessions (in current but not in previous order)
		const newNames: string[] = [];
		for (const name of currentNames) {
			if (!prevOrder.includes(name)) {
				newNames.push(name);
			}
		}

		// Find exiting sessions (in previous order but not in current)
		const exitNames = new Set<string>();
		for (const name of prevOrder) {
			if (!currentNames.has(name) && !prevExiting.has(name)) {
				exitNames.add(name);
			}
		}

		// Update order: keep existing order, add new sessions at the end
		let newOrder = [...prevOrder];
		for (const name of newNames) {
			newOrder.push(name);
		}

		// Remove sessions that have finished exiting (not current and not newly exiting)
		newOrder = newOrder.filter(name => currentNames.has(name) || exitNames.has(name) || prevExiting.has(name));

		if (newNames.length > 0) {
			newSessionNames = newNames;
			// Track which new sessions have task data right now (for text animation timing)
			const newWithTask = new Set<string>();
			for (const name of newNames) {
				const agentName = name.startsWith('jat-') ? name.slice(4) : name;
				if (agentTasks.get(agentName)) {
					newWithTask.add(name);
				}
			}
			if (newWithTask.size > 0) {
				sessionsWithTaskOnEntry = new Set([...sessionsWithTaskOnEntry, ...newWithTask]);
			}
			setTimeout(() => {
				newSessionNames = [];
				// Clean up task-on-entry tracking after animation window
				sessionsWithTaskOnEntry = new Set([...sessionsWithTaskOnEntry].filter(n => !newNames.includes(n)));
			}, 600);
		}

		if (exitNames.size > 0) {
			// Add new exiting sessions to the set
			exitingSessionNames = new Set([...prevExiting, ...exitNames]);
			// Clear them after animation completes (250ms delay + 500ms row animation)
			setTimeout(() => {
				exitingSessionNames = new Set([...exitingSessionNames].filter(n => !exitNames.has(n)));
				// Also remove from order after animation
				sessionOrder = sessionOrder.filter(n => !exitNames.has(n));
				// Clean up task cache for exited agents
				const cleanedCache = new Map(cachedAgentTasks);
				for (const name of exitNames) {
					const agentName = name.startsWith('jat-') ? name.slice(4) : name;
					cleanedCache.delete(agentName);
				}
				cachedAgentTasks = cleanedCache;
			}, 850);
		}

		sessionOrder = newOrder;
		// Merge previous objects with current (keep exiting session objects available)
		const mergedObjects = new Map(prevObjects);
		for (const [name, session] of currentObjects) {
			mergedObjects.set(name, session);
		}
		previousSessionObjects = mergedObjects;
	});

	// Derived: sessions to render in order (includes exiting sessions in their original position)
	const orderedSessions = $derived.by(() => {
		const result: Array<{ session: TmuxSession; isExiting: boolean; isNew: boolean; hadTaskOnEntry: boolean }> = [];
		for (const name of sessionOrder) {
			const session = sessions.find(s => s.name === name) || previousSessionObjects.get(name);
			if (session) {
				result.push({
					session,
					isExiting: exitingSessionNames.has(name),
					isNew: newSessionNames.includes(name),
					hadTaskOnEntry: sessionsWithTaskOnEntry.has(name)
				});
			}
		}
		return result;
	});

	// Helper functions
	function getTaskHarness(task: AgentTask | null): string {
		return task?.agent_program || 'claude-code';
	}

	function getTaskAge(dateStr: string | undefined): { label: string; color: string } {
		if (!dateStr) return { label: '', color: '' };
		const ms = Date.now() - new Date(dateStr).getTime();
		if (ms < 0) return { label: '', color: '' };
		const mins = Math.floor(ms / 60000);
		const hours = Math.floor(mins / 60);
		const days = Math.floor(hours / 24);
		const weeks = Math.floor(days / 7);
		const months = Math.floor(days / 30);
		const label = mins < 1 ? '<1m' : mins < 60 ? `${mins}m` : hours < 24 ? `${hours}h` : days < 7 ? `${days}d` : weeks < 5 ? `${weeks}w` : `${months}mo`;
		const color = hours < 1 ? 'oklch(0.80 0.20 145)' : hours < 6 ? 'oklch(0.72 0.15 145)' : hours < 24 ? 'oklch(0.62 0.08 160)' : days < 3 ? 'oklch(0.55 0.03 200)' : 'oklch(0.45 0.01 250)';
		return { label, color };
	}

	function getAgentName(sessionName: string): string {
		if (sessionName.startsWith('jat-')) {
			return sessionName.slice(4);
		}
		return sessionName;
	}

	function getProjectColorReactive(taskIdOrProject: string): string | null {
		if (!taskIdOrProject) return null;
		const projectPrefix = taskIdOrProject.split('-')[0].toLowerCase();
		return projectColors[projectPrefix] || null;
	}

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


	// Action handlers
	async function handleKillSession(sessionName: string) {
		actionLoading = sessionName;
		try {
			await onKillSession?.(sessionName);
		} finally {
			actionLoading = null;
		}
	}

	async function handleAttachSession(sessionName: string) {
		actionLoading = sessionName;
		try {
			await onAttachSession?.(sessionName);
		} finally {
			actionLoading = null;
		}
	}

	// Send a workflow command (e.g., /jat:complete) to a specific session
	async function sendWorkflowCommand(sessionName: string, command: string) {
		const sessionId = encodeURIComponent(sessionName);
		try {
			// Send Ctrl+U first to clear any stray characters in input
			await fetch(`/api/work/${sessionId}/input`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'ctrl-u' })
			});
			await new Promise(r => setTimeout(r, 50));

			// Send the command text
			await fetch(`/api/work/${sessionId}/input`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ input: command, type: 'text' })
			});

			// Send extra Enter after delay - Claude Code needs double Enter for slash commands
			await new Promise(r => setTimeout(r, 100));
			await fetch(`/api/work/${sessionId}/input`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'enter' })
			});
		} catch (err) {
			console.error('[TasksActive] sendWorkflowCommand ERROR:', err);
		}
	}

	// === Swipe-to-Reveal State ===
	interface SwipeState {
		sessionName: string;
		startX: number;
		startY: number;
		currentX: number;
		startTime: number;
		swiping: boolean;
		committed: boolean;
	}

	let swipeState = $state<SwipeState | null>(null);
	let swipeOffsets = $state<Map<string, number>>(new Map());
	let trayOpenSession = $state<string | null>(null);
	let trayLongPressTimer: ReturnType<typeof setTimeout> | null = null;
	const TRAY_LONG_PRESS_MS = 500;

	function clearTrayLongPress() {
		if (trayLongPressTimer) {
			clearTimeout(trayLongPressTimer);
			trayLongPressTimer = null;
		}
	}

	// Set visual feedback on a tray button, auto-clears after animation.
	// Returns the timer ID so callers can cancel it (e.g. on error override).
	function setActionFeedback(sessionName: string, actionId: string, variant: string, durationMs = 800): ReturnType<typeof setTimeout> {
		const key = `${sessionName}:${actionId}`;
		actionFeedback.set(key, variant);
		actionFeedback = new Map(actionFeedback);
		return setTimeout(() => {
			actionFeedback.delete(key);
			actionFeedback = new Map(actionFeedback);
		}, durationMs);
	}

	// Hold-to-confirm for destructive mobile tray actions (kill, complete, complete-kill)
	const DESTRUCTIVE_TRAY_ACTIONS = new Set(['kill', 'complete', 'complete-kill']);
	const HOLD_DURATION_MS = 600;
	const HOLD_TICK_MS = 30;
	let holdKey = $state<string | null>(null);
	let holdProgress = $state(0);
	let holdTimer: ReturnType<typeof setInterval> | null = null;
	let pointerLocked = $state(false);

	function armPointerLock() {
		pointerLocked = true;
		// Release on click (capture phase) so the lock outlives pointerup and kills
		// the ghost-click that would otherwise fire on whatever button re-renders
		// at the same position after the destructive action updates the DOM.
		const releaseOnClick = (e: Event) => {
			e.stopPropagation();
			e.preventDefault();
			pointerLocked = false;
			window.removeEventListener('click', releaseOnClick, true);
			window.removeEventListener('pointercancel', releaseOnCancel, true);
		};
		const releaseOnCancel = () => {
			pointerLocked = false;
			window.removeEventListener('click', releaseOnClick, true);
			window.removeEventListener('pointercancel', releaseOnCancel, true);
		};
		window.addEventListener('click', releaseOnClick, true);
		window.addEventListener('pointercancel', releaseOnCancel, true);
	}

	function startTrayHold(
		actionId: string,
		sessionName: string,
		sessionTask: AgentTask | null,
		agentName: string,
		project: string | null
	) {
		if (pointerLocked) return;
		const key = `${sessionName}:${actionId}`;
		if (!DESTRUCTIVE_TRAY_ACTIONS.has(actionId)) {
			handleMobileAction(actionId, sessionName, sessionTask, agentName, project);
			return;
		}
		clearTrayHold();
		holdKey = key;
		holdProgress = 0;
		let elapsed = 0;
		holdTimer = setInterval(() => {
			elapsed += HOLD_TICK_MS;
			holdProgress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
			if (elapsed >= HOLD_DURATION_MS) {
				clearTrayHold();
				armPointerLock();
				handleMobileAction(actionId, sessionName, sessionTask, agentName, project);
			}
		}, HOLD_TICK_MS);
	}

	function clearTrayHold() {
		if (holdTimer) {
			clearInterval(holdTimer);
			holdTimer = null;
		}
		holdKey = null;
		holdProgress = 0;
	}

	// ── Tray action helpers ────────────────────────────────────────────────

	interface TrayCtx {
		sessionName: string;
		sessionTask: AgentTask | null;
		agentName: string;
		project: string | null;
	}

	async function trayCloseAndKill(ctx: TrayCtx, reason: string) {
		if (ctx.sessionTask) {
			await fetch(`/api/tasks/${encodeURIComponent(ctx.sessionTask.id)}/close`, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ reason })
			});
		}
		await handleKillSession(ctx.sessionName);
	}

	async function trayRunComplete(ctx: TrayCtx, kill: boolean) {
		optimisticStates.set(ctx.sessionName, 'completing');
		optimisticStates = new Map(optimisticStates);
		if (kill) setPendingAutoKill(ctx.sessionName, true);
		if (ctx.sessionTask) {
			await fetch(`/api/sessions/${encodeURIComponent(ctx.sessionName)}/signal`, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'completing', data: { taskId: ctx.sessionTask.id, taskTitle: ctx.sessionTask.title, currentStep: 'verifying', progress: 0, stepsCompleted: [], stepsRemaining: ['verifying', 'committing', 'closing', 'releasing'] } })
			});
		}
		await sendWorkflowCommand(ctx.sessionName, kill ? '/jat:complete --kill' : '/jat:complete');
	}

	// Per-action feedback: [variant, durationMs]
	const TRAY_FEEDBACK: Record<string, [string, number]> = {
		attach:           ['info',    800],
		kill:             ['error',  1200],
		cleanup:          ['error',  1200],
		'close-kill':     ['error',  1200],
		'close-task':     ['error',  1200],
		unassign:         ['warning',1200],
		complete:         ['success',1500],
		'complete-kill':  ['success',1500],
		interrupt:        ['warning', 800],
		escape:           ['warning', 800],
		pause:            ['info',   1200],
		resume:           ['success',1000],
		restart:          ['success',1200],
		start:            ['success',1200],
		'convert-to-tasks':['info',   800],
		'view-task':      ['info',    400],
	};

	// Dispatch table: one async handler per action id
	const TRAY_DISPATCH: Record<string, (ctx: TrayCtx) => Promise<void>> = {
		attach: async (ctx) => handleAttachSession(ctx.sessionName),

		kill:         async (ctx) => trayCloseAndKill(ctx, 'Killed via tray'),
		cleanup:      async (ctx) => trayCloseAndKill(ctx, 'Cleaned up session'),
		'close-kill': async (ctx) => trayCloseAndKill(ctx, 'Abandoned via Close & Kill'),
		'close-task': async (ctx) => trayCloseAndKill(ctx, 'Closed via mobile tray'),

		unassign: async (ctx) => {
			if (ctx.sessionTask) {
				await fetch(`/api/tasks/${encodeURIComponent(ctx.sessionTask.id)}`, {
					method: 'PUT', headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ assignee: null, status: 'open' })
				});
			}
			await handleKillSession(ctx.sessionName);
		},

		complete:        async (ctx) => trayRunComplete(ctx, false),
		'complete-kill': async (ctx) => trayRunComplete(ctx, true),

		interrupt: async (ctx) => {
			await fetch(`/api/work/${encodeURIComponent(ctx.sessionName)}/input`, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'ctrl-c' })
			});
		},

		escape: async (ctx) => {
			await fetch(`/api/work/${encodeURIComponent(ctx.sessionName)}/input`, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'escape' })
			});
		},

		pause: async (ctx) => {
			optimisticStates.set(ctx.sessionName, 'paused');
			optimisticStates = new Map(optimisticStates);
			if (ctx.sessionTask) {
				await fetch(`/api/sessions/${encodeURIComponent(ctx.sessionName)}/pause`, {
					method: 'POST', headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ taskId: ctx.sessionTask.id, taskTitle: ctx.sessionTask.title, reason: 'Paused via mobile tray', killSession: true, agentName: ctx.agentName, project: ctx.project })
				});
			} else {
				await handleKillSession(ctx.sessionName);
			}
		},

		resume: async (ctx) => {
			optimisticStates.set(ctx.sessionName, 'working');
			optimisticStates = new Map(optimisticStates);
			await fetch(`/api/sessions/${encodeURIComponent(ctx.sessionName)}/signal`, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'working', data: { taskId: ctx.sessionTask?.id, taskTitle: ctx.sessionTask?.title, agentName: ctx.agentName, approach: 'Resuming from paused state' } })
			});
			await fetch(`/api/sessions/${encodeURIComponent(ctx.sessionName)}/resume`, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ taskId: ctx.sessionTask?.id, agentName: ctx.agentName, project: ctx.project })
			});
		},

		restart: async (ctx) => {
			if (ctx.sessionTask) {
				await fetch('/api/work/spawn', {
					method: 'POST', headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ taskId: ctx.sessionTask.id, project: ctx.project })
				});
			}
		},

		start: async (ctx) => sendWorkflowCommand(ctx.sessionName, '/jat:start'),

		'convert-to-tasks': async (ctx) => sendWorkflowCommand(ctx.sessionName, '/jat:tasktree'),

		'view-task': async (ctx) => {
			if (ctx.sessionTask) onViewTask?.(ctx.sessionTask.id);
		},
	};

	async function handleMobileAction(actionId: string, sessionName: string, sessionTask: AgentTask | null, agentName: string, project: string | null) {
		const feedbackKey = `${sessionName}:${actionId}`;
		if (actionFeedback.has(feedbackKey)) return;
		if (trayOpenSession === sessionName) trayOpenSession = null;

		const handler = TRAY_DISPATCH[actionId];
		if (!handler) return;

		const [variant, duration] = TRAY_FEEDBACK[actionId] ?? ['success', 800];
		const successTimer = setActionFeedback(sessionName, actionId, variant, duration);

		try {
			await handler({ sessionName, sessionTask, agentName, project });
		} catch (e) {
			console.warn(`[TasksActive] ${actionId} failed:`, e);
			// Cancel the optimistic success timer so it doesn't wipe the error state early
			clearTimeout(successTimer);
			actionFeedback.set(feedbackKey, 'error-fail');
			actionFeedback = new Map(actionFeedback);
			setTimeout(() => {
				actionFeedback.delete(feedbackKey);
				actionFeedback = new Map(actionFeedback);
			}, 4000);
		}
	}
	let swipeConfig = $state(getSwipeConfig());
	const SWIPE_THRESHOLD = 80;
	const SWIPE_COMMIT_THRESHOLD = 140;
	const VELOCITY_THRESHOLD = 0.5;
	const SWIPE_DEADZONE = 10;
	const ACTION_TRAY_WIDTH = 100;

	// Reactive action definitions from config
	const rightAction = $derived(getSwipeActionDef(swipeConfig.rightSwipe));
	const leftAction = $derived(getSwipeActionDef(swipeConfig.leftSwipe));

	let trayHintDismissed = $state(true);
	onMount(() => {
		initSwipeActions();
		swipeConfig = getSwipeConfig();
		try {
			trayHintDismissed = localStorage.getItem('jat-tray-hint-seen') === '1';
		} catch { trayHintDismissed = true; }
	});
	function dismissTrayHint() {
		if (trayHintDismissed) return;
		trayHintDismissed = true;
		try { localStorage.setItem('jat-tray-hint-seen', '1'); } catch {}
	}

	// Auto-complete: fire /jat:complete when a session hits ready-for-review and
	// review rules say auto + Session Cleanup is enabled + user hasn't toggled off.
	$effect(() => {
		if (!isAutoKillEnabled()) return;
		for (const session of sessions) {
			if (session.type !== 'agent') continue;
			const agentName = getAgentName(session.name);
			const effectiveState = optimisticStates.get(session.name) || agentSessionInfo.get(agentName)?.activityState;
			if (effectiveState !== 'ready-for-review') {
				// Reset trigger flag when leaving review state
				if (autoCompleteTriggeredSet.has(session.name)) {
					autoCompleteTriggeredSet.delete(session.name);
					autoCompleteTriggeredSet = new Set(autoCompleteTriggeredSet);
				}
				continue;
			}
			if (autoCompleteTriggeredSet.has(session.name)) continue;
			const sessionTask = agentTasks.get(agentName);
			const reviewStatus = sessionTask ? computeReviewStatus(sessionTask, getReviewRules()) : null;
			const reviewBasedDefault = reviewStatus?.action !== 'auto';
			const autoCompleteDisabled = autoCompleteDisabledMap.get(session.name) ?? reviewBasedDefault;
			if (!autoCompleteDisabled) {
				autoCompleteTriggeredSet.add(session.name);
				autoCompleteTriggeredSet = new Set(autoCompleteTriggeredSet);
				const sName = session.name;
				setTimeout(async () => {
					optimisticStates.set(sName, 'completing');
					optimisticStates = new Map(optimisticStates);
					if (sessionTask) {
						fetch(`/api/sessions/${encodeURIComponent(sName)}/signal`, {
							method: 'POST', headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ type: 'completing', data: { taskId: sessionTask.id, taskTitle: sessionTask.title, currentStep: 'verifying', progress: 0, stepsCompleted: [], stepsRemaining: ['verifying', 'committing', 'closing', 'releasing'] } })
						}).catch(() => {});
					}
					await sendWorkflowCommand(sName, '/jat:complete');
				}, 500);
			}
		}
	});

	function handleSwipeTouchStart(e: TouchEvent, sessionName: string) {
		if (e.touches.length !== 1) return;
		const touch = e.touches[0];
		swipeState = {
			sessionName,
			startX: touch.clientX,
			startY: touch.clientY,
			currentX: touch.clientX,
			startTime: Date.now(),
			swiping: false,
			committed: false
		};
		if (trayOpenSession && trayOpenSession !== sessionName) {
			trayOpenSession = null;
		}
		clearTrayLongPress();
		trayLongPressTimer = setTimeout(() => {
			if (swipeState && !swipeState.swiping && swipeState.sessionName === sessionName) {
				trayOpenSession = sessionName;
			}
			trayLongPressTimer = null;
		}, TRAY_LONG_PRESS_MS);
	}

	function handleSwipeTouchMove(e: TouchEvent) {
		if (!swipeState || swipeState.committed) return;
		const touch = e.touches[0];
		const deltaX = touch.clientX - swipeState.startX;
		const deltaY = touch.clientY - swipeState.startY;

		if (!swipeState.swiping) {
			if (Math.abs(deltaY) > SWIPE_DEADZONE) {
				clearTrayLongPress();
				swipeState = null;
				return;
			}
			if (Math.abs(deltaX) > SWIPE_DEADZONE) {
				clearTrayLongPress();
				swipeState.swiping = true;
			} else {
				return;
			}
		}

		e.preventDefault();
		swipeState.currentX = touch.clientX;

		const rawOffset = deltaX;
		const maxOffset = ACTION_TRAY_WIDTH;
		let clampedOffset: number;
		if (Math.abs(rawOffset) <= maxOffset) {
			clampedOffset = rawOffset;
		} else {
			const excess = Math.abs(rawOffset) - maxOffset;
			clampedOffset = Math.sign(rawOffset) * (maxOffset + excess * 0.3);
		}

		const newMap = new Map(swipeOffsets);
		newMap.set(swipeState.sessionName, clampedOffset);
		swipeOffsets = newMap;
	}

	function handleSwipeTouchEnd() {
		clearTrayLongPress();
		if (!swipeState || swipeState.committed) {
			swipeState = null;
			return;
		}

		const { sessionName, swiping } = swipeState;
		if (!swiping) {
			swipeState = null;
			return;
		}

		const offset = swipeOffsets.get(sessionName) || 0;
		const elapsed = Date.now() - swipeState.startTime;
		const velocity = Math.abs(offset) / elapsed;
		const isCommit = Math.abs(offset) >= SWIPE_COMMIT_THRESHOLD || (velocity >= VELOCITY_THRESHOLD && Math.abs(offset) > SWIPE_THRESHOLD);

		if (isCommit) {
			swipeState.committed = true;
			const direction = offset > 0 ? 'right' : 'left';
			const actionId = direction === 'right' ? swipeConfig.rightSwipe : swipeConfig.leftSwipe;
			executeSwipeAction(sessionName, actionId);
		}

		resetSwipe(sessionName);
		swipeState = null;
	}

	function resetSwipe(sessionName: string) {
		const newMap = new Map(swipeOffsets);
		newMap.set(sessionName, 0);
		swipeOffsets = newMap;
		setTimeout(() => {
			const m = new Map(swipeOffsets);
			m.delete(sessionName);
			swipeOffsets = m;
		}, 300);
	}

	function executeSwipeAction(sessionName: string, actionId: string) {
		const session = sessions.find(s => s.name === sessionName);
		if (!session) return;
		const agentName = getAgentName(sessionName);
		const task = agentTasks.get(agentName);

		if (actionId === 'attach') {
			handleAttachSession(sessionName);
		} else if (actionId === 'view-task') {
			if (task) onViewTask?.(task.id);
		} else if (actionId === 'complete') {
			if (task) {
				optimisticStates.set(sessionName, 'completing');
				optimisticStates = new Map(optimisticStates);
				fetch(`/api/sessions/${encodeURIComponent(sessionName)}/signal`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						type: 'completing',
						data: { taskId: task.id, taskTitle: task.title, currentStep: 'verifying', progress: 0, stepsCompleted: [], stepsRemaining: ['verifying', 'committing', 'closing', 'releasing'] }
					})
				}).catch(() => {});
				sendWorkflowCommand(sessionName, '/jat:complete');
			}
		} else if (actionId === 'pause') {
			optimisticStates.set(sessionName, 'paused');
			optimisticStates = new Map(optimisticStates);
			if (task) {
				fetch(`/api/sessions/${encodeURIComponent(sessionName)}/pause`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ taskId: task.id, taskTitle: task.title, reason: 'Paused via swipe', killSession: true, agentName, project: session.project })
				}).catch(() => {});
			} else {
				handleKillSession(sessionName);
			}
		} else if (actionId === 'kill') {
			handleKillSession(sessionName);
		} else if (actionId === 'interrupt') {
			fetch(`/api/work/${encodeURIComponent(sessionName)}/input`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'ctrl-c' })
			}).catch(() => {});
		}
	}

	// === Context Menu State ===
	interface CtxSession {
		session: TmuxSession;
		task: AgentTask | undefined;
		agentName: string;
		activityState: string;
		effectiveState: string;
	}
	let ctxData = $state<CtxSession | null>(null);
	let ctxX = $state(0);
	let ctxY = $state(0);
	let ctxVisible = $state(false);
	let ctxStatusSubmenuOpen = $state(false);
	let ctxStateSubmenuOpen = $state(false);
	let ctxProjectSubmenuOpen = $state(false);
	let killConfirmState = $state<'stop-agent' | 'close-kill' | null>(null);
	let killConfirmTimer: ReturnType<typeof setTimeout> | null = null;
	let copiedMobileId = $state<string | null>(null);
	async function copyMobileId(e: MouseEvent, taskId: string) {
		e.stopPropagation();
		try {
			await navigator.clipboard.writeText(taskId);
			copiedMobileId = taskId;
			if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(4);
			setTimeout(() => { if (copiedMobileId === taskId) copiedMobileId = null; }, 2500);
		} catch (err) {
			addToast({ message: 'Could not copy task ID', type: 'error', details: String((err as Error)?.message || err) });
		}
	}

	function handleContextMenu(session: TmuxSession, event: MouseEvent) {
		if (session.type !== 'agent') return;
		event.preventDefault();
		event.stopPropagation();
		const menuWidth = 200;
		const menuHeight = 380;
		const agentName = getAgentName(session.name);
		const task = agentTasks.get(agentName);
		const info = agentSessionInfo.get(agentName);
		const rawState = optimisticStates.get(session.name) || info?.activityState || 'idle';
		ctxData = {
			session,
			task,
			agentName,
			activityState: rawState,
			effectiveState: task?.status === 'closed' ? 'completed' : rawState
		};
		ctxX = Math.min(event.clientX, window.innerWidth - menuWidth - 8);
		ctxY = Math.min(event.clientY, window.innerHeight - menuHeight - 8);
		ctxVisible = true;
		ctxStatusSubmenuOpen = false;
		ctxStateSubmenuOpen = false;
		ctxProjectSubmenuOpen = false;
	}

	function closeCtxMenu() {
		ctxVisible = false;
		ctxStatusSubmenuOpen = false;
		ctxStateSubmenuOpen = false;
		ctxProjectSubmenuOpen = false;
		if (killConfirmTimer) clearTimeout(killConfirmTimer);
		killConfirmState = null;
		killConfirmTimer = null;
	}

	// Close context menu on click outside or Escape
	$effect(() => {
		if (!ctxVisible) return;
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

	// Auto-close fullscreen if the session is killed/removed
	$effect(() => {
		if (fullscreenSession && !sessions.some(s => s.name === fullscreenSession)) {
			fullscreenSession = null;
		}
	});

	async function ctxChangeStatus(taskId: string, newStatus: string) {
		closeCtxMenu();
		try {
			const response = await fetch(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus })
			});
			if (!response.ok) console.error('Failed to update task status');
		} catch (err) {
			console.error('Failed to update task status:', err);
		}
	}

	async function ctxChangeState(sessionName: string, newState: string) {
		closeCtxMenu();
		// Optimistic UI update
		optimisticStates.set(sessionName, newState);
		optimisticStates = new Map(optimisticStates);
		try {
			const taskId = ctxData?.task?.id || '';
			const taskTitle = ctxData?.task?.title || '';
			const agentName = ctxData?.agentName || '';
			await fetch(`/api/sessions/${encodeURIComponent(sessionName)}/signal`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type: newState,
					data: { taskId, taskTitle, agentName, reason: 'Manual state override via context menu' }
				})
			});
		} catch (err) {
			console.error('Failed to change session state:', err);
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

	const ctxAllProjectNames = $derived.by(() => {
		const set = new Set<string>();
		// Include all known projects from projectColors (covers all configured projects)
		for (const key of Object.keys(projectColors)) set.add(key);
		// Also include any projects from active tasks
		for (const [, task] of agentTasks) set.add(task.id.split('-')[0]);
		return [...set].sort();
	});

	async function ctxChangeProject(taskId: string, newProject: string) {
		closeCtxMenu();
		try {
			const response = await fetch(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project: newProject }),
			});
			if (!response.ok) console.error('Failed to change project');
		} catch (err) {
			console.error('Failed to change project:', err);
		}
	}

</script>

{#if sessions.length === 0}
	<div class="empty-state">
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="empty-icon">
			<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
		</svg>
		<p class="empty-title">No sessions running</p>
		<p class="empty-hint">Spawn an agent from an open task below, or start a dev server to see it here.</p>
	</div>
{:else}
	<!-- Card-based layout -->
	<div class="ta-sessions-list">
		{#each orderedSessions as { session, isExiting, isNew, hadTaskOnEntry } (session.name)}
			{@const sessionAgentName = getAgentName(session.name)}
			{@const sessionTask = agentTasks.get(sessionAgentName) || (isExiting ? cachedAgentTasks.get(sessionAgentName) : null)}
			{@const sessionInfo = agentSessionInfo.get(sessionAgentName)}
			{@const activityState = sessionInfo?.activityState}
			{@const rawEffectiveState = optimisticStates.get(session.name) || activityState || 'idle'}
			{@const effectiveState = sessionTask?.status === 'closed' ? 'completed' : rawEffectiveState}
			{@const stateVisual = getSessionStateVisual(effectiveState)}
			{@const statusDotColor = stateVisual.accent}
			{@const derivedProject = agentProjects.get(sessionAgentName) || session.project || null}
			{@const rowProjectColor = sessionTask?.id
				? getProjectColorReactive(sessionTask.id)
				: derivedProject
					? getProjectColorReactive(`${derivedProject}-x`)
					: null
			}
			{@const elapsed = getElapsedFormatted(session.created)}
			{@const isPlanning = effectiveState === 'planning'}

			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			{@const swipeOffset = swipeOffsets.get(session.name) || 0}
			{@const isSwiping = swipeState?.sessionName === session.name && swipeState.swiping}
			<div class="swipe-container {isNew ? 'animate-slide-in-fwd-center' : ''} {isExiting ? 'animate-slide-out-bck-center exit-delayed' : ''}">
				<!-- Left tray (revealed on right/left-to-right swipe) -->
				{#if rightAction}
				<div class="swipe-tray swipe-tray-left" class:swipe-tray-visible={swipeOffset > SWIPE_DEADZONE}>
					<button class="swipe-action" style="background: {rightAction.color};" onclick={() => { executeSwipeAction(session.name, swipeConfig.rightSwipe); resetSwipe(session.name); }}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d={rightAction.icon} /></svg>
						<span>{rightAction.label}</span>
					</button>
				</div>
				{/if}
				<!-- Right tray (revealed on left/right-to-left swipe) -->
				{#if leftAction}
				<div class="swipe-tray swipe-tray-right" class:swipe-tray-visible={swipeOffset < -SWIPE_DEADZONE}>
					<button class="swipe-action" style="background: {leftAction.color};" onclick={() => { executeSwipeAction(session.name, swipeConfig.leftSwipe); resetSwipe(session.name); }}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d={leftAction.icon} /></svg>
						<span>{leftAction.label}</span>
					</button>
				</div>
				{/if}
				<!-- The actual card that slides -->
				<div
					class="ta-session-card"
					class:attached={session.attached}
					class:swiping={isSwiping}
					class:tray-hint-active={!trayHintDismissed}
					class:tray-open={trayOpenSession === session.name}
					class:is-completing={effectiveState === 'completing'}
					class:is-compacting={effectiveState === 'compacting'}
					onmouseenter={dismissTrayHint}
					style="--card-hover-tint: {stateVisual.accent}; border-left: 3px solid {stateVisual.accent}; {isExiting ? 'pointer-events: none;' : ''} {swipeOffset !== 0 ? `transform: translateX(${swipeOffset}px);` : ''} {isSwiping ? '' : swipeOffsets.has(session.name) ? 'transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);' : ''}"
					role="button" tabindex="0"
					onclick={() => { if (isExiting || swipeState?.swiping) return; if (trayOpenSession === session.name) { trayOpenSession = null; return; } if (sessionTask) { onViewTask?.(sessionTask.id); } else if (onCardClick) { onCardClick(session.name); } else { fullscreenSession = session.name; } }}
					oncontextmenu={(e) => handleContextMenu(session, e)}
					onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !isExiting && !swipeState?.swiping && (onCardClick ? onCardClick(session.name) : (fullscreenSession = session.name)); } }}
					ontouchstart={(e) => { dismissTrayHint(); handleSwipeTouchStart(e, session.name); }}
					ontouchmove={handleSwipeTouchMove}
					ontouchend={handleSwipeTouchEnd}
					ontouchcancel={handleSwipeTouchEnd}
				>
				{#if session.type === 'server'}
					<!-- Server session -->
					{@const cardActions = getSessionStateActions(effectiveState)}
					<div class="ta-card-inner">
						<div class="ta-state-strip" style="background: {stateVisual.bgTint};" aria-hidden="true">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" width="13" height="13" style="stroke: {stateVisual.accent};"><path stroke-linecap="round" stroke-linejoin="round" d={stateVisual.icon} /></svg>
						</div>
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<div class="ta-action-tray" role="group" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
							{#each cardActions.slice(0, 5) as action}
								{@const fb = actionFeedback.get(`${session.name}:${action.id}`)}
								{@const isDestructive = DESTRUCTIVE_TRAY_ACTIONS.has(action.id)}
								{@const holdMatch = holdKey === `${session.name}:${action.id}`}
								{@const isFailed = fb === 'error-fail'}
								<button class="ta-tray-btn ta-tray-btn-{fb ? fb : action.variant}" class:ta-tray-btn-feedback={!!fb} class:ta-tray-btn-holding={holdMatch} title={isFailed ? `${action.label} failed — tap to retry` : isDestructive ? `Hold to ${action.label.toLowerCase()}` : action.description} disabled={!!fb && !isFailed} onclick={() => { if (!pointerLocked) handleMobileAction(action.id, session.name, null, sessionAgentName, session.project || null); }} onpointerdown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); if (!isFailed) startTrayHold(action.id, session.name, null, sessionAgentName, session.project || null); }} onpointerup={clearTrayHold} onpointercancel={clearTrayHold}>
									{#if isDestructive && holdMatch}<span class="tray-hold-fill" style="width: {holdProgress}%"></span>{/if}
									{#if fb}
										{#if isFailed}
											<!-- ↺ retry icon -->
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
										{:else}
											<!-- ✓ success icon -->
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
										{/if}
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d={action.icon} /></svg>
									{/if}
									<span>{isFailed ? 'Retry' : fb ? 'Done' : action.label}</span>
								</button>
							{/each}
						</div>
						<div class="ta-card-body">
							<span class="ta-title">{session.name}</span>
						</div>
					</div>
				{:else if sessionTask}
					<!-- Agent session with task -->
					{@const taskAge = getTaskAge(sessionTask.created_at)}
					{@const harness = getTaskHarness(sessionTask)}
					{@const cardActions = getSessionStateActions(effectiveState)}
					{@const mobileOutputLines = getOutputTail(sessionAgentName, 15)}
					{@const reviewStatus = computeReviewStatus(sessionTask, getReviewRules())}
					{@const reviewBasedDefault = reviewStatus.action !== 'auto'}
					{@const autoCompleteDisabled = autoCompleteDisabledMap.get(session.name) ?? reviewBasedDefault}
					{@const stripDestructActive = ($autoKillCountdowns.get(session.name) ?? 0) > 0}
					<div class="ta-card-inner ta-card-inner-agent">
						<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
						<div class="ta-state-strip ta-state-strip-agent ta-state-strip-clickable" style="background: {stateVisual.bgTint};" role="button" tabindex="0" title="Open terminal" onclick={(e) => { e.stopPropagation(); fullscreenSession = session.name; }} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); fullscreenSession = session.name; } }}>
							<AgentAvatar name={sessionAgentName} size={96} showRing={false} shape="rounded" />
							{#if stripDestructActive}
								<span class="ta-strip-elapsed ta-strip-elapsed-destruct" title="Session self-destructing">
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="9" height="9"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
									{$autoKillCountdowns.get(session.name)}s
								</span>
							{:else if elapsed}
								<span class="ta-strip-elapsed">{#if elapsed.showHours}{elapsed.hours}:{/if}{elapsed.minutes}:{elapsed.seconds}</span>
							{/if}
						</div>
						{#if cmdPanelSession === session.name}
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<div
							class="ta-cmd-inline"
							onclick={(e) => e.stopPropagation()}
							onkeydown={(e) => e.stopPropagation()}
							role="group"
							transition:slide={{ duration: 200, easing: cubicOut }}
						>
							<div class="ta-cmd-header">
								<!-- svelte-ignore a11y_autofocus -->
								<input
									bind:value={cmdPanelSearch}
									placeholder="Filter commands…"
									class="ta-cmd-search"
									autofocus
								/>
								<button class="ta-cmd-close" title="Close" onclick={() => cmdPanelSession = null}>
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="12" height="12">
										<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
							{#if dtrayCommandsLoading}
								{#each Array(3) as _, i}
									<div class="ta-cmd-skeleton" style="animation-delay: {i * 80}ms;" aria-hidden="true">
										<div class="ta-cmd-skeleton-ns"></div>
										<div class="ta-cmd-skeleton-name"></div>
									</div>
								{/each}
								<span class="sr-only">Loading commands…</span>
							{:else if filteredCmdPanelItems.length === 0}
								<div class="ta-cmd-msg">{cmdPanelSearch.trim() ? `No match for "${cmdPanelSearch}"` : 'No commands found'}</div>
							{:else}
								{#each filteredCmdPanelItems as cmd, i (cmd.invocation)}
								<button
									class="ta-cmd-item"
									in:fade={{ duration: 120, delay: Math.min(i * 25, 200) }}
									onclick={() => { sendWorkflowCommand(session.name, cmd.invocation); cmdPanelSession = null; }}
								>
									<span class="ta-cmd-ns">{cmd.namespace}</span>
									<span class="ta-cmd-name">{cmd.invocation}</span>
								</button>
								{/each}
							{/if}
							<a
								href="/config?tab=commands"
								class="ta-cmd-new-link"
								onclick={() => cmdPanelSession = null}
							>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="11" height="11">
									<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
								</svg>
								<span>New Command</span>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="10" height="10" style="margin-left: auto; opacity: 0.5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
								</svg>
							</a>
						</div>
						{/if}
						{#if epicPickerSession === session.name}
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<div
							class="ta-epic-inline"
							onclick={(e) => e.stopPropagation()}
							onkeydown={(e) => e.stopPropagation()}
							role="group"
							transition:slide={{ duration: 200, easing: cubicOut }}
						>
							<div class="ta-epic-header">
								{#if epicPickerItems.length > 3}
								<input
									bind:value={epicPickerSearch}
									placeholder="Search epics…"
									class="ta-epic-search"
								/>
								{/if}
								<button class="ta-epic-close" title="Close" onclick={() => epicPickerSession = null}>
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="12" height="12">
										<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
							{#if epicPickerLoading}
								{#each Array(3) as _, i}
									<div class="ta-epic-skeleton" style="animation-delay: {i * 80}ms;" aria-hidden="true"></div>
								{/each}
								<span class="sr-only">Loading epics…</span>
							{:else if epicPickerItems.length === 0}
								<div class="ta-epic-msg">No epics in this project</div>
							{:else if filteredEpicPickerItems.length === 0}
								<div class="ta-epic-msg">No match for "{epicPickerSearch}"</div>
							{:else}
								{#each filteredEpicPickerItems as epic, i (epic.id)}
								<button
									class="ta-epic-item"
									class:ta-epic-item-closed={epic.status === 'closed'}
									disabled={!!epicLinkingId}
									in:fade={{ duration: 120, delay: Math.min(i * 25, 200) }}
									onclick={() => linkMobileTaskToEpic(sessionTask.id, epic.id)}
								>
									<span class="ta-epic-id">{epic.id}</span>
									<span class="ta-epic-title">{epic.title}</span>
									{#if epicLinkingId === epic.id}
										<svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
											<path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4" />
										</svg>
									{/if}
								</button>
								{/each}
							{/if}
							<!-- Create new epic -->
							<div class="ta-epic-create-section">
								{#if mobileShowCreateEpic}
								<div class="ta-epic-create-form" transition:slide={{ duration: 160, easing: cubicOut }}>
									<input
										bind:this={mobileNewEpicInputEl}
										bind:value={mobileNewEpicTitle}
										placeholder="Epic title…"
										class="ta-epic-create-input"
										disabled={mobileCreatingEpic}
										onkeydown={(e) => {
											if (e.key === 'Enter' && mobileNewEpicTitle.trim()) { e.preventDefault(); mobileCreateEpic(sessionTask.id); }
											if (e.key === 'Escape') { e.preventDefault(); mobileShowCreateEpic = false; mobileNewEpicTitle = ''; mobileCreateEpicError = null; }
										}}
									/>
									{#if mobileCreateEpicError}
										<span class="ta-epic-create-error">{mobileCreateEpicError}</span>
									{/if}
									<div class="ta-epic-create-actions">
										<button class="ta-epic-create-cancel" onclick={() => { mobileShowCreateEpic = false; mobileNewEpicTitle = ''; mobileCreateEpicError = null; }} disabled={mobileCreatingEpic}>Cancel</button>
										<button class="ta-epic-create-submit" onclick={() => mobileCreateEpic(sessionTask.id)} disabled={mobileCreatingEpic || !mobileNewEpicTitle.trim()}>
											{#if mobileCreatingEpic}
												<svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4" /></svg>
											{:else}
												Create
											{/if}
										</button>
									</div>
								</div>
								{:else}
								<button
									class="ta-epic-create-btn"
									in:fade={{ duration: 120 }}
									onclick={() => { mobileShowCreateEpic = true; setTimeout(() => mobileNewEpicInputEl?.focus(), 50); }}
									disabled={!!epicLinkingId}
								>
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="11" height="11">
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
									</svg>
									<span>New Epic</span>
								</button>
								{/if}
							</div>
						</div>
						{/if}
						<div class="ta-card-body">
							{#if effectiveState === 'completed'}
								{@const completionEntry = completionDataMap.get(sessionAgentName)}
								{#if completionEntry?.state === 'loaded' && completionEntry.events.length > 0}
									<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
								<div class="completion-card-inline" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
										<CompletionCardCompact events={completionEntry.events} />
									</div>
								{:else if completionEntry?.state === 'loading'}
									<div class="ta-title-row">
										<span class="ta-title" title={sessionTask.title}>
											<FxText text={sessionTask.title || sessionTask.id} context={activeTaskCtx(sessionTask)} />
										</span>
										<span class="ta-title-state" style="background: {stateVisual.bgColor}; color: {stateVisual.textColor}; border: 1px solid {stateVisual.borderColor};">{stateVisual.shortLabel}</span>
									</div>
									<div class="completion-loading-inline">
										<div class="animate-spin-fast w-3.5 h-3.5 border-2 border-success border-t-transparent rounded-full"></div>
										<span>Loading completion…</span>
									</div>
								{:else}
									<!-- empty/fallback: show title + description -->
									<div class="ta-title-row">
										<span class="ta-title" title={sessionTask.title}>
											<FxText text={sessionTask.title || sessionTask.id} context={activeTaskCtx(sessionTask)} />
										</span>
										<span class="ta-title-state" style="background: {stateVisual.bgColor}; color: {stateVisual.textColor}; border: 1px solid {stateVisual.borderColor};">{stateVisual.shortLabel}</span>
									</div>
									{#if sessionTask.description}
										<span class="ta-description" title={sessionTask.description}>{sessionTask.description}</span>
									{/if}
								{/if}
							{:else}
							{@const signalKey = `${sessionAgentName}:${effectiveState}`}
							{@const signalEntry = signalDataMap.get(signalKey)}
							<div class="ta-title-row">
								<span class="ta-title" title={sessionTask.title}>
									<FxText text={sessionTask.title || sessionTask.id} context={activeTaskCtx(sessionTask)} />
								</span>
								<span class="ta-title-state" style="background: {stateVisual.bgColor}; color: {stateVisual.textColor}; border: 1px solid {stateVisual.borderColor};">{stateVisual.shortLabel}</span>
								{#if effectiveState === 'ready-for-review'}
									{@const completeFb = actionFeedback.get(`${session.name}:complete`)}
									{@const completeFailed = completeFb === 'error-fail'}
									<button
										type="button"
										class="ta-title-complete"
										class:ta-title-complete-feedback={!!completeFb}
										class:ta-title-complete-failed={completeFailed}
										disabled={!!completeFb && !completeFailed}
										title={completeFailed ? 'Complete failed — tap to retry' : 'Mark task complete (/jat:complete)'}
										onclick={(e) => { e.stopPropagation(); handleMobileAction('complete', session.name, sessionTask, sessionAgentName, session.project || null); }}
									>
										{#if completeFb}
											{#if completeFailed}
												<!-- ↺ retry icon -->
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="11" height="11"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
												<span>Retry</span>
											{:else}
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="11" height="11"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
												<span>Done</span>
											{/if}
										{:else}
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="11" height="11"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
											<span>Complete</span>
										{/if}
									</button>
								{/if}
							</div>
							<!-- State card: signal payload + hover-revealed terminal output -->
							<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
							<div class="state-card-inline" style="--scc-accent: {stateVisual.accent};" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
								<StateCardCompact
									state={effectiveState}
									event={signalEntry?.event ?? null}
									outputLines={mobileOutputLines}
								/>
							</div>
							{/if}<!-- end {:else} non-completed -->
							<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
							<div class="ta-row2-wrapper" onclick={(e) => { if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: none)').matches) { e.stopPropagation(); trayOpenSession = trayOpenSession === session.name ? null : session.name; dismissTrayHint(); } }}>
								<div class="ta-card-row2">
									<span class="ta-agent-name" title={sessionAgentName}>{sessionAgentName}</span>
									<span class="ta-separator">·</span>
									<button class="ta-task-id" class:ta-task-id-copied={copiedMobileId === sessionTask.id} style="color: {statusDotColor};" onclick={(e) => copyMobileId(e, sessionTask.id)} title="Click to copy task ID" aria-label={copiedMobileId === sessionTask.id ? `Copied task ID ${sessionTask.id}` : `Copy task ID ${sessionTask.id}`}>
										<span class="ta-task-id-text">{sessionTask.id}</span>
										{#if copiedMobileId === sessionTask.id}<span class="ta-task-id-badge" aria-hidden="true">✓ copied</span>{/if}
									</button>
									{#if harness}
										<span class="ta-separator">·</span>
										<span class="ta-harness" title={harness}><ProviderLogo agentId={harness} size={11} /></span>
									{/if}
									{#if sessionTask.priority != null && sessionTask.priority <= 1}
										<span class="ta-separator">·</span>
										<span class="ta-priority ta-priority-{sessionTask.priority}" title={sessionTask.priority === 0 ? 'P0 — Critical' : 'P1 — High'}>P{sessionTask.priority}</span>
									{/if}
									{#if /d$|w$|mo$/.test(taskAge.label)}
										<span class="ta-separator">·</span>
										<span class="ta-age" style="color: {taskAge.color};">{taskAge.label}</span>
									{/if}
								</div>
								<!-- Action tray — fades in over row2 on hover -->
								<div class="ta-action-tray" role="group" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
									{#each cardActions.slice(0, 5) as action}
										{@const fb = actionFeedback.get(`${session.name}:${action.id}`)}
										{@const isDestructive = DESTRUCTIVE_TRAY_ACTIONS.has(action.id)}
										{@const holdMatch = holdKey === `${session.name}:${action.id}`}
										{@const isFailed = fb === 'error-fail'}
										<button class="ta-tray-btn ta-tray-btn-{fb ? fb : action.variant}" class:ta-tray-btn-feedback={!!fb} class:ta-tray-btn-holding={holdMatch} class:tray-btn-hold-dimmed={holdKey !== null && !holdMatch} title={isFailed ? `${action.label} failed — tap to retry` : isDestructive ? `Hold to ${action.label.toLowerCase()}` : action.description} disabled={!!fb && !isFailed} onclick={() => { if (!pointerLocked) handleMobileAction(action.id, session.name, sessionTask, sessionAgentName, session.project || null); }} onpointerdown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); if (!isFailed) startTrayHold(action.id, session.name, sessionTask, sessionAgentName, session.project || null); }} onpointerup={clearTrayHold} onpointercancel={clearTrayHold}>
											{#if isDestructive && holdMatch}<span class="tray-hold-fill" style="width: {holdProgress}%"></span>{/if}
											{#if fb}
												{#if isFailed}
													<!-- ↺ retry icon -->
													<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
												{:else}
													<!-- ✓ success icon -->
													<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
												{/if}
											{:else}
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d={action.icon} /></svg>
											{/if}
											<span>{isFailed ? 'Retry' : fb ? 'Done' : action.label}</span>
										</button>
									{/each}
									{#if sessionTask.issue_type !== 'epic'}
									<button
										class="ta-tray-btn ta-tray-btn-epic"
										class:ta-tray-btn-epic-open={epicPickerSession === session.name}
										title="Add to Epic"
										onclick={() => openMobileEpicPicker(session.name, sessionTask.id)}
									>
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14">
											<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
										</svg>
										<span>Epic</span>
									</button>
									{/if}
									<button
										class="ta-tray-btn ta-tray-btn-cmds"
										class:ta-tray-btn-cmds-open={cmdPanelSession === session.name}
										title="Run a slash command (/jat:complete, /commit, etc.)"
										onclick={() => openMobileCmdPanel(session.name)}
									>
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14">
											<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
										</svg>
										<span>Cmds</span>
									</button>
									<button
										class="ta-tray-btn ta-tray-btn-auto"
										class:ta-tray-btn-auto-on={!autoCompleteDisabled}
										title={autoCompleteDisabled ? 'Manual review — tap to enable auto-complete' : 'Auto-complete on — tap to require manual review'}
										onclick={() => {
											const newMap = new Map(autoCompleteDisabledMap);
											newMap.set(session.name, !autoCompleteDisabled);
											autoCompleteDisabledMap = newMap;
										}}
									>
										{#if autoCompleteDisabled}
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14">
												<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
												<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											</svg>
											<span>Review</span>
										{:else}
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14">
												<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
											</svg>
											<span>Auto</span>
										{/if}
									</button>
								</div>
							</div>
						</div>
					</div>
				{:else}
					<!-- Planning / no-task session -->
					{@const cardActions = getSessionStateActions(effectiveState)}
					<div class="ta-card-inner">
						<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
						<div class="ta-state-strip ta-state-strip-agent ta-state-strip-clickable" style="background: {stateVisual.bgTint};" role="button" tabindex="0" title="Open terminal" onclick={(e) => { e.stopPropagation(); fullscreenSession = session.name; }} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); fullscreenSession = session.name; } }}>
							<AgentAvatar name={sessionAgentName} size={96} showRing={false} shape="rounded" />
						</div>
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<div class="ta-action-tray" role="group" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
							{#each cardActions.slice(0, 5) as action}
								{@const fb = actionFeedback.get(`${session.name}:${action.id}`)}
								{@const isDestructive = DESTRUCTIVE_TRAY_ACTIONS.has(action.id)}
								{@const holdMatch = holdKey === `${session.name}:${action.id}`}
								{@const isFailed = fb === 'error-fail'}
								<button class="ta-tray-btn ta-tray-btn-{fb ? fb : action.variant}" class:ta-tray-btn-feedback={!!fb} class:ta-tray-btn-holding={holdMatch} title={isFailed ? `${action.label} failed — tap to retry` : isDestructive ? `Hold to ${action.label.toLowerCase()}` : action.description} disabled={!!fb && !isFailed} onclick={() => { if (!pointerLocked) handleMobileAction(action.id, session.name, null, sessionAgentName, session.project || null); }} onpointerdown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); if (!isFailed) startTrayHold(action.id, session.name, null, sessionAgentName, session.project || null); }} onpointerup={clearTrayHold} onpointercancel={clearTrayHold}>
									{#if isDestructive && holdMatch}<span class="tray-hold-fill" style="width: {holdProgress}%"></span>{/if}
									{#if fb}
										{#if isFailed}
											<!-- ↺ retry icon -->
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
										{:else}
											<!-- ✓ success icon -->
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
										{/if}
									{:else}
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d={action.icon} /></svg>
									{/if}
									<span>{isFailed ? 'Retry' : fb ? 'Done' : action.label}</span>
								</button>
							{/each}
						</div>
						<div class="ta-card-body">
							<span class="ta-title" style="color: oklch(0.70 0.12 270);">
								{effectiveState === 'planning' ? 'Planning session' : 'Idle — no task assigned'}
							</span>
							<div class="ta-card-row2">
								<AgentAvatar name={sessionAgentName} size={16} showRing={true} sessionState={effectiveState} />
								<span class="ta-agent-name">{sessionAgentName}</span>
								{#if derivedProject}
									<span class="ta-separator">·</span>
									<span class="ta-project">{derivedProject}</span>
								{/if}
							</div>
						</div>
					</div>
				{/if}
			</div>
			</div><!-- /swipe-container -->

			{/each}

		<!-- Mobile Fullscreen Overlay -->
		{#if fullscreenSession}
			{@const fsAgentName = getAgentName(fullscreenSession)}
			{@const fsTask = agentTasks.get(fsAgentName)}
			{@const fsSessionInfo = agentSessionInfo.get(fsAgentName)}
			{@const fsRawState = (optimisticStates.get(fullscreenSession) || fsSessionInfo?.activityState || 'idle') as SessionState}
		{@const fsState = (fsTask?.status === 'closed' ? 'completed' : fsRawState) as SessionState}
			{@const fsSession = sessions.find(s => s.name === fullscreenSession)}
			{@const fsReviewStatus = fsTask ? computeReviewStatus(fsTask, getReviewRules()) : null}
			{@const fsReviewBasedDefault = fsReviewStatus?.action !== 'auto'}
			{@const fsAutoCompleteDisabled = autoCompleteDisabledMap.get(fullscreenSession) ?? fsReviewBasedDefault}
			{@const fsActionHandler = async (actionId: string) => {
				const sName = fullscreenSession!;
				if (actionId === 'attach') {
					await handleAttachSession(sName);
				} else if (actionId === 'kill' || actionId === 'cleanup') {
					if (actionId === 'cleanup' && fsTask) {
						try { await fetch(`/api/tasks/${encodeURIComponent(fsTask.id)}/close`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'Cleaned up session' }) }); } catch (e) { console.warn('[TasksActive] Failed to close task:', e); }
					}
					fullscreenSession = null;
					await handleKillSession(sName);
				} else if (actionId === 'view-task' && fsTask) {
					onViewTask?.(fsTask.id);
				} else if (actionId === 'complete' || actionId === 'complete-kill') {
					optimisticStates.set(sName, 'completing');
					optimisticStates = new Map(optimisticStates);
					if (fsTask) {
						try {
							await fetch(`/api/sessions/${encodeURIComponent(sName)}/signal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'completing', data: { taskId: fsTask.id, taskTitle: fsTask.title, currentStep: 'verifying', progress: 0, stepsCompleted: [], stepsRemaining: ['verifying', 'committing', 'closing', 'releasing'] } }) });
						} catch (e) { console.warn('[TasksActive] Failed to write completing signal:', e); }
					}
					const cmd = actionId === 'complete-kill' ? '/jat:complete --kill' : '/jat:complete';
					await sendWorkflowCommand(sName, cmd);
				} else if (actionId === 'interrupt') {
					await fetch(`/api/work/${encodeURIComponent(sName)}/input`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'ctrl-c' }) });
				} else if (actionId === 'escape') {
					await fetch(`/api/work/${encodeURIComponent(sName)}/input`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'escape' }) });
				} else if (actionId === 'pause') {
					optimisticStates.set(sName, 'paused');
					optimisticStates = new Map(optimisticStates);
					if (fsTask) {
						try { await fetch(`/api/sessions/${encodeURIComponent(sName)}/pause`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId: fsTask.id, taskTitle: fsTask.title, reason: 'Paused via fullscreen', killSession: true, agentName: fsAgentName, project: fsSession?.project }) }); } catch (e) { console.warn('[TasksActive] Failed to pause session:', e); }
					} else { await handleKillSession(sName); }
					fullscreenSession = null;
				} else if (actionId === 'close-kill' || actionId === 'close-task') {
					if (fsTask) {
						try { await fetch(`/api/tasks/${encodeURIComponent(fsTask.id)}/close`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'Abandoned via Close & Kill' }) }); } catch (e) { console.warn('[TasksActive] Failed to close task:', e); }
					}
					fullscreenSession = null;
					await handleKillSession(sName);
				} else if (actionId === 'resume') {
					optimisticStates.set(sName, 'working');
					optimisticStates = new Map(optimisticStates);
					try {
						await fetch(`/api/sessions/${encodeURIComponent(sName)}/signal`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'working', data: { taskId: fsTask?.id, taskTitle: fsTask?.title, agentName: fsAgentName, approach: 'Resuming from paused state' } }) });
						await fetch(`/api/sessions/${encodeURIComponent(sName)}/resume`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId: fsTask?.id, agentName: fsAgentName, project: fsSession?.project }) });
					} catch (e) { console.warn('[TasksActive] Failed to resume session:', e); }
				} else if (actionId === 'restart') {
					fullscreenSession = null;
					if (fsTask) {
						try { await fetch('/api/work/spawn', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId: fsTask.id, project: fsSession?.project }) }); } catch (e) { console.warn('[TasksActive] Failed to restart session:', e); }
					}
				} else if (actionId === 'unassign') {
					if (fsTask) {
						try { await fetch(`/api/tasks/${encodeURIComponent(fsTask.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignee: null, status: 'open' }) }); } catch (e) { console.warn('[TasksActive] Failed to unassign task:', e); }
					}
					fullscreenSession = null;
					await handleKillSession(sName);
				}
			}}
			{@const fsLinkEpic = async () => {
				if (!fsTask) return;
				try {
					await fetch(`/api/tasks/${encodeURIComponent(fsTask.id)}/epic`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ epicId: null }) });
				} catch (e) { console.warn('[TasksActive] Failed to link task to epic:', e); }
			}}
			{@const fsAutoToggle = () => {
				const newMap = new Map(autoCompleteDisabledMap);
				newMap.set(fullscreenSession!, !fsAutoCompleteDisabled);
				autoCompleteDisabledMap = newMap;
			}}

			<MobileSessionDrawer
					sessionName={fullscreenSession}
					agentName={fsAgentName}
					task={fsTask as any}
					sessionState={fsState}
					project={fsSession?.project || null}
					sseState={fsSessionInfo?.activityState}
					sseStateTimestamp={fsSessionInfo?.activityStateTimestamp}
					created={fsSession?.created || ''}
					attached={false}
					autoCompleteEnabled={!fsAutoCompleteDisabled}
					onAutoCompleteToggle={fsAutoToggle}
					reviewReason={fsReviewStatus?.reason ?? ''}
					onLinkToEpic={fsLinkEpic}
					onViewEpic={(epicId) => onViewTask?.(epicId)}
					onClose={() => fullscreenSession = null}
					onKillSession={async () => { const sName = fullscreenSession!; fullscreenSession = null; await handleKillSession(sName); }}
					onAttachSession={async () => { await handleAttachSession(fullscreenSession!); }}
					onViewTask={(taskId) => onViewTask?.(taskId)}
					onAction={fsActionHandler}
					onSendInput={async (text: string, type?: string) => {
						const sName = fullscreenSession!;
						const body = type === 'enter'
							? { type: 'enter' }
							: { type: type || 'text', input: text };
						try {
							await fetch(`/api/work/${encodeURIComponent(sName)}/input`, {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify(body)
							});
						} catch (e) { console.warn('[TasksActive] Failed to send input:', e); }
					}}
				/>
		{/if}
	</div>
{/if}

<!-- LLM File Result Drawer -->
{#if llmFileDrawerOpen}
	<div class="drawer drawer-end z-50">
		<input id="llm-file-drawer" type="checkbox" class="drawer-toggle" checked />
		<div class="drawer-side">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<!-- svelte-ignore a11y_label_has_associated_control -->
			<label
				class="drawer-overlay"
				onclick={() => llmFileDrawerOpen = false}
			></label>
			<div class="bg-base-200 min-h-full w-[600px] max-w-[90vw] flex flex-col">
				<!-- Header -->
				<div class="flex items-center justify-between p-4 border-b border-base-content/10">
					<div class="flex items-center gap-3">
						<svg class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
						</svg>
						<div>
							<h3 class="font-semibold text-base-content">LLM Result</h3>
							{#if llmFileProject}
								<p class="text-xs text-base-content/50">Project: {llmFileProject}</p>
							{/if}
						</div>
					</div>
					<div class="flex items-center gap-2">
						<!-- Copy button -->
						<button
							type="button"
							class="btn btn-sm btn-ghost"
							onclick={() => {
								navigator.clipboard.writeText(llmFileContent);
							}}
							title="Copy to clipboard"
						>
							<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
							</svg>
						</button>
						<!-- Close button -->
						<button
							type="button"
							aria-label="Close"
							class="btn btn-sm btn-ghost btn-circle"
							onclick={() => llmFileDrawerOpen = false}
						>
							<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				<!-- Filename input with path preview and validation -->
				<div class="px-4 py-3 border-b border-base-content/10">
					<label for="llm-filename-input" class="text-xs text-base-content/60 mb-1 block">Save as:</label>
					<div class="flex items-center gap-1">
						<span class="text-xs text-base-content/40 font-mono shrink-0">~/code/{llmFileProject}/</span>
						<input
							id="llm-filename-input"
							type="text"
							class="input input-sm input-bordered flex-1 font-mono text-sm {llmFileValidation.status === 'invalid' ? 'input-error' : ''}"
							bind:value={llmFileName}
							oninput={() => validateLlmFilePath(llmFileName)}
							placeholder="filename.md"
							disabled={llmFileSaving || llmFileSaved}
						/>
					</div>
					<!-- Validation status -->
					<div class="mt-1.5 flex items-center gap-2">
						{#if llmFileValidation.status === 'checking'}
							<span class="loading loading-spinner loading-xs text-base-content/50"></span>
							<span class="text-xs text-base-content/50">{llmFileValidation.message}</span>
						{:else if llmFileValidation.status === 'invalid'}
							<svg class="w-3.5 h-3.5 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
							</svg>
							<span class="text-xs text-error">{llmFileValidation.message}</span>
						{:else if llmFileValidation.status === 'valid'}
							<svg class="w-3.5 h-3.5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
							</svg>
							<span class="text-xs text-success">{llmFileValidation.message}</span>
						{:else}
							<span class="text-xs text-base-content/40">
								Full path: <span class="font-mono">~/code/{llmFileProject}/{llmFileName || 'filename.md'}</span>
							</span>
						{/if}
					</div>
				</div>

				<!-- Monaco Editor -->
				<div class="flex-1 overflow-hidden">
					<MonacoWrapper
						value={llmFileContent}
						language={
							llmFileName.endsWith('.md') ? 'markdown' :
							llmFileName.endsWith('.json') ? 'json' :
							llmFileName.endsWith('.yaml') || llmFileName.endsWith('.yml') ? 'yaml' :
							llmFileName.endsWith('.ts') || llmFileName.endsWith('.tsx') ? 'typescript' :
							llmFileName.endsWith('.js') || llmFileName.endsWith('.jsx') ? 'javascript' :
							llmFileName.endsWith('.py') ? 'python' :
							llmFileName.endsWith('.sh') ? 'shell' :
							llmFileName.endsWith('.css') ? 'css' :
							llmFileName.endsWith('.html') ? 'html' :
							'markdown'
						}
						readonly={true}
					/>
				</div>

				<!-- Footer with Save/Discard -->
				<div class="p-4 border-t border-base-content/10 flex items-center justify-between gap-3">
					{#if llmFileSaved}
						<div class="flex items-center gap-2 text-success">
							<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
							</svg>
							<span class="text-sm">Saved to {llmFileName}</span>
						</div>
						<button
							type="button"
							class="btn btn-sm"
							onclick={() => llmFileDrawerOpen = false}
						>
							Close
						</button>
					{:else}
						<button
							type="button"
							class="btn btn-sm btn-ghost"
							onclick={() => llmFileDrawerOpen = false}
							disabled={llmFileSaving}
						>
							Discard
						</button>
						<button
							type="button"
							class="btn btn-sm btn-primary"
							disabled={llmFileSaving || !llmFileName.trim() || !llmFileProject || llmFileValidation.status === 'invalid' || llmFileValidation.status === 'checking'}
							onclick={async () => {
								if (!llmFileName.trim() || !llmFileProject || llmFileValidation.status !== 'valid') return;

								llmFileSaving = true;
								try {
									const params = new URLSearchParams({
										project: llmFileProject,
										path: llmFileName.trim()
									});
									const response = await fetch(`/api/files/content?${params}`, {
										method: 'PUT',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify({ content: llmFileContent })
									});

									if (!response.ok) {
										const err = await response.json();
										throw new Error(err.error || 'Failed to save file');
									}

									llmFileSaved = true;
								} catch (err) {
									console.error('[LLM File Save] Error:', err);
									alert(err instanceof Error ? err.message : 'Failed to save file');
								} finally {
									llmFileSaving = false;
								}
							}}
						>
							{#if llmFileSaving}
								<span class="loading loading-spinner loading-xs"></span>
								Saving...
							{:else}
								<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
								</svg>
								Save to Project
							{/if}
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Context Menu -->
{#if ctxData}
	{@const ctxActions = getSessionStateActions(ctxData.effectiveState)}
	{@const ctxActionIds = new Set(ctxActions.map(a => a.id))}
	<div
		class="active-context-menu"
		class:active-context-menu-hidden={!ctxVisible}
		style="left: {ctxX}px; top: {ctxY}px;"
		role="menu"
		tabindex="0"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
	>
		<!-- View Details -->
		{#if ctxData.task}
			<button class="active-context-menu-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxStateSubmenuOpen = false; ctxProjectSubmenuOpen = false; }} onclick={() => { const id = ctxData!.task!.id; closeCtxMenu(); onViewTask?.(id); ctxData = null; }}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
					<circle cx="12" cy="12" r="3" />
				</svg>
				<span>View Details</span>
			</button>
		{/if}

		<!-- Attach Terminal -->
		<button class="active-context-menu-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxStateSubmenuOpen = false; ctxProjectSubmenuOpen = false; }} onclick={() => { const name = ctxData!.session.name; closeCtxMenu(); handleAttachSession(name); ctxData = null; }}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="4 17 10 11 4 5" />
				<line x1="12" y1="19" x2="20" y2="19" />
			</svg>
			<span>Attach Terminal</span>
		</button>

		<div class="active-context-menu-divider"></div>

		<!-- Change Status (submenu) -->
		{#if ctxData.task}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="active-context-submenu-container"
				onmouseenter={() => { ctxStatusSubmenuOpen = true; ctxStateSubmenuOpen = false; ctxProjectSubmenuOpen = false; }}
				onmouseleave={() => { ctxStatusSubmenuOpen = false; }}
			>
				<button class="active-context-menu-item active-context-menu-item-has-submenu">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
						<polyline points="22 4 12 14.01 9 11.01" />
					</svg>
					<span>Change Status</span>
					<svg class="active-context-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 18 15 12 9 6" />
					</svg>
				</button>
				{#if ctxStatusSubmenuOpen}
					<div class="active-context-submenu">
						{#each STATUS_OPTIONS as status}
							<button
								class="active-context-menu-item {ctxData!.task!.status === status.value ? 'active-context-menu-item-active' : ''}"
								onclick={() => ctxChangeStatus(ctxData!.task!.id, status.value)}
							>
								<span class="active-status-dot" style="background: {status.color};"></span>
								<span>{status.label}</span>
								{#if ctxData!.task!.status === status.value}
									<svg class="active-context-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<polyline points="20 6 9 17 4 12" />
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Change State (submenu) -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="active-context-submenu-container"
			onmouseenter={() => { ctxStateSubmenuOpen = true; ctxStatusSubmenuOpen = false; ctxProjectSubmenuOpen = false; }}
			onmouseleave={() => { ctxStateSubmenuOpen = false; }}
		>
			<button class="active-context-menu-item active-context-menu-item-has-submenu">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281" />
					<circle cx="12" cy="12" r="3" />
					<path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
				</svg>
				<span>Force State</span>
				<svg class="active-context-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</button>
			{#if ctxStateSubmenuOpen}
				<div class="active-context-submenu">
					{#each [
						{ value: 'working', label: 'Working', color: 'oklch(0.70 0.18 250)', emoji: '🔧' },
						{ value: 'needs-input', label: 'Needs Input', color: 'oklch(0.75 0.20 45)', emoji: '❓' },
						{ value: 'ready-for-review', label: 'Review', color: 'oklch(0.70 0.20 85)', emoji: '🔍' },
						{ value: 'completing', label: 'Completing', color: 'oklch(0.65 0.15 175)', emoji: '⏳' },
						{ value: 'completed', label: 'Completed', color: 'oklch(0.65 0.18 145)', emoji: '✅' },
						{ value: 'paused', label: 'Paused', color: 'oklch(0.60 0.10 250)', emoji: '⏸' },
						{ value: 'idle', label: 'Idle', color: 'oklch(0.60 0.03 250)', emoji: '💤' }
					] as state}
						<button
							class="active-context-menu-item {ctxData?.activityState === state.value ? 'active-context-menu-item-active' : ''}"
							onclick={() => ctxChangeState(ctxData!.session.name, state.value)}
						>
							<span class="active-status-dot" style="background: {state.color};"></span>
							<span>{state.emoji} {state.label}</span>
							{#if ctxData?.activityState === state.value}
								<svg class="active-context-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="20 6 9 17 4 12" />
								</svg>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Change Project (submenu) -->
		{#if ctxData.task}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="active-context-submenu-container"
				onmouseenter={() => { ctxProjectSubmenuOpen = true; ctxStatusSubmenuOpen = false; ctxStateSubmenuOpen = false; }}
				onmouseleave={() => { ctxProjectSubmenuOpen = false; }}
			>
				<button class="active-context-menu-item active-context-menu-item-has-submenu">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
						<path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
					</svg>
					<span>Change Project</span>
					<svg class="active-context-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 18 15 12 9 6" />
					</svg>
				</button>
				{#if ctxProjectSubmenuOpen}
					<div class="active-context-submenu active-context-submenu-project">
						{#each ctxAllProjectNames as proj}
							{@const currentProject = ctxData!.task!.id.split('-')[0]}
							<button
								class="active-context-menu-item {currentProject === proj ? 'active-context-menu-item-active' : ''}"
								onclick={() => ctxChangeProject(ctxData!.task!.id, proj)}
							>
								<span class="active-status-dot" style="background: {projectColors[proj] || getProjectColorReactive(proj + '-x') || 'oklch(0.65 0.15 250)'};"></span>
								<span>{proj}</span>
								{#if currentProject === proj}
									<svg class="active-context-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<polyline points="20 6 9 17 4 12" />
									</svg>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Duplicate -->
		{#if ctxData.task}
			<button class="active-context-menu-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxStateSubmenuOpen = false; ctxProjectSubmenuOpen = false; }} onclick={() => ctxDuplicateTask(ctxData!.task!)}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
					<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
				</svg>
				<span>Duplicate</span>
			</button>
		{/if}

		<div class="active-context-menu-divider"></div>

		<!-- Interrupt -->
		{#if ctxActionIds.has('interrupt')}
		<button class="active-context-menu-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxStateSubmenuOpen = false; ctxProjectSubmenuOpen = false; }} onclick={async () => {
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

		<!-- Pause -->
		{#if ctxData.task && ctxActionIds.has('pause')}
			<button class="active-context-menu-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxStateSubmenuOpen = false; ctxProjectSubmenuOpen = false; }} onclick={async () => {
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

		<!-- Complete -->
		{#if ctxData.task && (ctxActionIds.has('complete') || ctxActionIds.has('complete-kill'))}
			<button class="active-context-menu-item active-context-menu-item-success" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxStateSubmenuOpen = false; ctxProjectSubmenuOpen = false; }} onclick={async () => {
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
					} catch (e) { /* ignore */ }
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

		<div class="active-context-menu-divider"></div>

		<!-- Kill / Cleanup Session -->
		{#if ctxData.effectiveState === 'completed'}
			<!-- Task already closed — just kill the tmux session -->
			<button class="active-context-menu-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxStateSubmenuOpen = false; ctxProjectSubmenuOpen = false; }} onclick={async () => {
				const d = ctxData!;
				closeCtxMenu();
				ctxData = null;
				await handleKillSession(d.session.name);
			}}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
				</svg>
				<span>End Session</span>
			</button>
		{:else}
			<!-- Stop agent only (task stays in_progress) -->
			<button class="active-context-menu-item {killConfirmState === 'stop-agent' ? 'active-context-menu-item-confirm' : 'active-context-menu-item-warning'}" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxStateSubmenuOpen = false; ctxProjectSubmenuOpen = false; }} onclick={async () => {
				if (killConfirmState !== 'stop-agent') {
					killConfirmState = 'stop-agent';
					if (killConfirmTimer) clearTimeout(killConfirmTimer);
					killConfirmTimer = setTimeout(() => { killConfirmState = null; killConfirmTimer = null; }, 2500);
					return;
				}
				const d = ctxData!;
				closeCtxMenu();
				ctxData = null;
				await handleKillSession(d.session.name);
			}}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
				<span>{killConfirmState === 'stop-agent' ? 'Confirm stop?' : 'Stop Agent'}</span>
			</button>
			<!-- Close task + kill session -->
			<button class="active-context-menu-item {killConfirmState === 'close-kill' ? 'active-context-menu-item-confirm' : 'active-context-menu-item-danger'}" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxStateSubmenuOpen = false; ctxProjectSubmenuOpen = false; }} onclick={async () => {
				if (killConfirmState !== 'close-kill') {
					killConfirmState = 'close-kill';
					if (killConfirmTimer) clearTimeout(killConfirmTimer);
					killConfirmTimer = setTimeout(() => { killConfirmState = null; killConfirmTimer = null; }, 2500);
					return;
				}
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
					} catch (e) { /* ignore */ }
				}
				await handleKillSession(d.session.name);
			}}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10" />
					<line x1="15" y1="9" x2="9" y2="15" />
					<line x1="9" y1="9" x2="15" y2="15" />
				</svg>
				<span>{killConfirmState === 'close-kill' ? 'Confirm close & stop?' : 'Close Task & Stop'}</span>
			</button>
		{/if}
	</div>
{/if}


<style>
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

	.completion-card-inline {
		margin-top: 0.25rem;
		background: transparent;
	}

	.state-card-inline {
		margin-top: 0.2rem;
		background: transparent;
	}

	/* Collapse approach text to 1 line by default; expand to 2 on card hover.
	   Approach is supplementary context — compact by default is fine.
	   Question text (needs_input state) is NOT clamped here — it stays at its
	   2-line default from StateCardCompact so mobile users see the full ask. */
	.state-card-inline :global(.scc-approach) {
		-webkit-line-clamp: 1;
		line-clamp: 1;
	}
	@media (hover: hover) {
		.ta-session-card:hover .state-card-inline :global(.scc-approach) {
			-webkit-line-clamp: 2;
			line-clamp: 2;
		}
	}

	.completion-loading-inline {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.35rem;
		font-size: 0.7rem;
		color: oklch(0.55 0.05 250);
	}

	/* .output-preview and .output-line removed — output now lives inside StateCardCompact */

	/* === Context Menu === */
	.active-context-menu {
		position: fixed;
		z-index: 100;
		min-width: 180px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		padding: 0.375rem;
		box-shadow: 0 10px 30px oklch(0.05 0 0 / 0.5);
		animation: activeCtxIn 0.1s ease;
	}

	.active-context-menu-hidden {
		display: none;
	}

	@keyframes activeCtxIn {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}

	.active-context-menu-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.375rem 0.625rem;
		border: none;
		background: transparent;
		color: oklch(0.80 0.02 250);
		font-size: 0.8125rem;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: background 0.1s ease;
		white-space: nowrap;
	}

	.active-context-menu-item:hover {
		background: oklch(0.25 0.03 250);
	}

	.active-context-menu-item svg {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		opacity: 0.7;
	}

	.active-context-menu-item-has-submenu {
		position: relative;
	}

	.active-context-menu-item-active {
		color: oklch(0.85 0.10 200);
	}

	.active-context-menu-item-danger {
		color: oklch(0.75 0.15 25);
	}

	.active-context-menu-item-danger:hover {
		background: oklch(0.25 0.06 25);
	}

	.active-context-menu-item-success {
		color: oklch(0.75 0.15 145);
	}

	.active-context-menu-item-success:hover {
		background: oklch(0.25 0.06 145);
	}

	.active-context-menu-item-warning {
		color: oklch(0.80 0.15 75);
	}

	.active-context-menu-item-warning:hover {
		background: oklch(0.25 0.06 75);
	}

	.active-context-menu-item-confirm {
		color: oklch(0.90 0.18 85);
		background: oklch(0.22 0.07 85);
		font-weight: 500;
	}

	.active-context-menu-item-confirm:hover {
		background: oklch(0.27 0.09 85);
	}

	.active-context-menu-divider {
		height: 1px;
		margin: 0.25rem 0.375rem;
		background: oklch(0.28 0.02 250);
	}

	.active-context-chevron {
		width: 12px;
		height: 12px;
		margin-left: auto;
		opacity: 0.5;
	}

	.active-context-check {
		width: 12px;
		height: 12px;
		margin-left: auto;
		color: oklch(0.75 0.15 145);
	}

	.active-status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.active-context-submenu-container {
		position: relative;
	}

	.active-context-submenu {
		position: absolute;
		left: 100%;
		top: -0.375rem;
		min-width: 150px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		padding: 0.375rem;
		box-shadow: 0 10px 30px oklch(0.05 0 0 / 0.5);
		animation: activeCtxIn 0.1s ease;
	}

	.active-context-submenu-project {
		max-height: 300px;
		overflow-y: auto;
	}

	/* Delay row exit animation so avatar flip-out plays first */
	.exit-delayed {
		animation-delay: 0.25s;
		animation-fill-mode: both;
	}

	/* ========== MOBILE LAYOUT ========== */

	.ta-sessions-list {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.ta-session-card {
		position: relative;
		z-index: 1;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-bottom: none;
		border-radius: 0;
		padding: 0;
		cursor: pointer;
		transition: background 0.15s;
		touch-action: pan-y;
		will-change: transform;
		overflow: hidden;
	}

	/*.ta-session-card:first-child {
		border-radius: 8px 8px 0 0;
	}*/

	.ta-session-card:last-child {
		/*border-radius: 0 0 8px 8px;*/
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.ta-session-card:only-child {
		/*border-radius: 8px;*/
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.ta-session-card:active {
		background: oklch(0.20 0.02 250);
	}

	.ta-session-card.attached {
		border-color: oklch(0.55 0.15 145 / 0.5);
		background: oklch(0.65 0.15 145 / 0.06);
	}

	/* Inner flex container: state strip + content body */
	.ta-card-inner {
		display: flex;
		align-items: stretch;
		min-height: 0;
	}

	/* State indicator strip */
	.ta-state-strip {
		width: 28px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: filter 0.2s;
	}

	/* Agent variant: avatar + elapsed time below */
	.ta-state-strip-agent {
		width: 140px;
		padding: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		overflow: hidden;
	}

	.ta-strip-elapsed {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		font-size: 0.625rem;
		font-weight: 500;
		color: oklch(0.58 0.03 250);
		font-variant-numeric: tabular-nums;
		font-family: ui-monospace, monospace;
		letter-spacing: 0.02em;
	}
	.ta-strip-elapsed svg {
		flex-shrink: 0;
	}

	/* Destruct countdown: red pulse urgency */
	.ta-strip-elapsed-destruct {
		color: oklch(0.90 0.08 25);
		animation: pulse-subtle 1s ease-in-out infinite;
	}

	.ta-state-strip-agent :global(*) {
		border-radius: 0 !important;
		max-width: 100%;
	}

	/* Brighten strip on card hover */
	.ta-session-card:hover .ta-state-strip {
		filter: brightness(1.15) saturate(1.2);
	}

	/* Avatar strip is now a dedicated click target → opens MobileTerminal */
	.ta-state-strip-clickable {
		cursor: pointer;
	}
	.ta-state-strip-clickable:hover {
		filter: brightness(1.3) saturate(1.35);
	}
	.ta-state-strip-clickable:focus-visible {
		outline: 2px solid oklch(0.70 0.18 240);
		outline-offset: -2px;
	}

	/* State-aware row highlight: tint follows session state color */
	.ta-session-card:hover {
		background: color-mix(in oklch, var(--card-hover-tint, oklch(0.65 0.15 145)) 12%, transparent);
	}

	/* Action tray — legacy behavior (server cards, no-task cards): expands from right on hover */
	.ta-action-tray {
		display: flex;
		align-items: stretch;
		max-width: 0;
		overflow: hidden;
		transition: max-width 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		flex-shrink: 0;
		order: 3;
		margin-right: 2.75rem; /* clear fixed TERMINAL drawer tab at viewport right edge */
	}

	/* Legacy tray (server + no-task cards): direct child of card-inner only */
	.ta-session-card:hover .ta-card-inner > .ta-action-tray,
	.ta-card-inner > .ta-action-tray:hover,
	.ta-card-inner > .ta-action-tray:focus-within {
		max-width: 480px;
	}

	/* Row2 wrapper — overlays tray over meta row on hover */
	.ta-row2-wrapper {
		display: grid;
		grid-template-areas: "row2";
		position: relative;
		cursor: pointer;
		border-radius: 3px;
		transition: background 0.15s ease;
		padding-right: 2.75rem; /* clear fixed TERMINAL drawer tab at viewport right edge */
	}

	.ta-row2-wrapper:hover,
	.ta-session-card.tray-open .ta-row2-wrapper {
		background: oklch(0.22 0.02 250 / 0.6);
	}

	/* Affordance glyph hinting that hover reveals actions */
	.ta-row2-wrapper::after {
		content: '⋯';
		position: absolute;
		right: 2.875rem; /* aligns just inside the padding-right zone, clear of TERMINAL tab */
		top: 50%;
		transform: translateY(-50%);
		font-size: 0.75rem;
		line-height: 1;
		color: oklch(0.65 0.04 250);
		pointer-events: none;
		transition: opacity 0.12s ease;
	}

	.ta-row2-wrapper:hover::after,
	.ta-session-card.tray-open .ta-row2-wrapper::after {
		opacity: 0;
	}

	.ta-row2-wrapper > .ta-card-row2 {
		grid-area: row2;
		margin-top: 0;
		padding-right: 1.125rem;
	}

	/* Tray inside wrapper: opacity overlay, triggered only by hovering the row2 zone */
	.ta-row2-wrapper > .ta-action-tray {
		grid-area: row2;
		position: relative;
		max-width: none;
		overflow: hidden;
		order: unset;
		flex-shrink: unset;
		margin-right: 0; /* override base tray margin — wrapper padding-right handles clearance */
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.15s ease;
		border-radius: 3px;
	}

	/* Reveal on row2-zone hover (not full-card hover) + focus/open states */
	.ta-row2-wrapper:hover > .ta-action-tray,
	.ta-row2-wrapper > .ta-action-tray:focus-within,
	.ta-session-card.tray-open .ta-row2-wrapper > .ta-action-tray {
		opacity: 1;
		pointer-events: auto;
	}

	/* When hovering the row2 zone (action tray target), also expand the state
	   card body so the card doesn't subtly contract while the user is trying to
	   aim at a tray button. Mirrors StateCardCompact's own hover-expand rule. */
	@media (hover: hover) and (min-width: 640px) {
		:global(.ta-session-card:hover .scc-output-wrapper),
		:global(.ta-session-card:focus-within .scc-output-wrapper),
		:global(.ta-session-card.tray-open .scc-output-wrapper) {
			grid-template-rows: 1fr;
		}
	}

	/* Overlay buttons: single-line horizontal layout to fit row2 height */
	.ta-row2-wrapper > .ta-action-tray .ta-tray-btn {
		flex-direction: row;
		padding: 0 7px;
		font-size: 0.6rem;
		height: 100%;
		gap: 3px;
	}
	/* No icon in overlay context — label only */
	.ta-row2-wrapper > .ta-action-tray .ta-tray-btn > svg {
		display: none;
	}

	/* Hold isolation: dim inactive buttons while a hold is in progress */
	.ta-tray-btn.tray-btn-hold-dimmed {
		opacity: 0.25;
		pointer-events: none;
		transition: opacity 0.1s;
	}

	/* State badge in title row */
	.ta-title-state {
		flex-shrink: 0;
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		padding: 0.1875rem 0.5rem;
		border-radius: 3px;
		white-space: nowrap;
	}

	/* Completing: indeterminate progress shimmer across the bottom edge */
	.ta-session-card.is-completing {
		position: relative;
	}
	.ta-session-card.is-completing::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 2px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			oklch(0.75 0.12 175 / 0.6) 40%,
			oklch(0.85 0.15 175) 50%,
			oklch(0.75 0.12 175 / 0.6) 60%,
			transparent 100%
		);
		background-size: 200% 100%;
		animation: completing-progress 1.6s cubic-bezier(0.25, 1, 0.5, 1) infinite;
		pointer-events: none;
	}
	@keyframes completing-progress {
		0%   { background-position: 150% 0; }
		100% { background-position: -50% 0; }
	}
	@media (prefers-reduced-motion: reduce) {
		.ta-session-card.is-completing::after {
			animation: none;
			background: oklch(0.75 0.12 175 / 0.5);
		}
	}

	/* Compacting: slow pulsing shimmer in purple/violet across the bottom edge */
	.ta-session-card.is-compacting {
		position: relative;
	}
	.ta-session-card.is-compacting::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 2px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			oklch(0.65 0.15 280 / 0.5) 40%,
			oklch(0.75 0.18 280) 50%,
			oklch(0.65 0.15 280 / 0.5) 60%,
			transparent 100%
		);
		background-size: 200% 100%;
		animation: compacting-progress 2.4s ease-in-out infinite;
		pointer-events: none;
	}
	@keyframes compacting-progress {
		0%   { background-position: 150% 0; }
		100% { background-position: -50% 0; }
	}
	@media (prefers-reduced-motion: reduce) {
		.ta-session-card.is-compacting::after {
			animation: none;
			background: oklch(0.65 0.15 280 / 0.5);
		}
	}

	/* Onboarding hint: briefly peek the tray on the first card so users discover the reveal */
	/* Legacy tray only (direct child of card-inner) — animates max-width */
	.swipe-container:first-child .ta-session-card.tray-hint-active .ta-card-inner > .ta-action-tray {
		animation: tray-hint-peek 2.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.8s 1 both;
	}
	/* Overlay tray (inside row2-wrapper) — animates opacity instead */
	.swipe-container:first-child .ta-session-card.tray-hint-active .ta-row2-wrapper > .ta-action-tray {
		animation: tray-hint-peek-opacity 2.4s ease 0.8s 1 both;
	}
	@keyframes tray-hint-peek {
		0%   { max-width: 0; }
		25%  { max-width: 96px; }
		55%  { max-width: 96px; }
		100% { max-width: 0; }
	}
	@keyframes tray-hint-peek-opacity {
		0%   { opacity: 0; }
		25%  { opacity: 1; }
		75%  { opacity: 1; }
		100% { opacity: 0; }
	}
	@media (prefers-reduced-motion: reduce) {
		.swipe-container:first-child .ta-session-card.tray-hint-active .ta-card-inner > .ta-action-tray,
		.swipe-container:first-child .ta-session-card.tray-hint-active .ta-row2-wrapper > .ta-action-tray {
			animation: none;
		}
	}

	/* Legacy tray only on tray-open: direct child of card-inner, not the overlay tray */
	.ta-session-card.tray-open .ta-card-inner > .ta-action-tray {
		max-width: 480px;
	}

	/* Tray action buttons */
	.ta-tray-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 6px 8px;
		border: none;
		border-right: 1px solid oklch(0 0 0 / 0.18);
		cursor: pointer;
		font-size: 0.6875rem;
		font-weight: 700;
		line-height: 1.2;
		color: oklch(0.96 0 0);
		font-family: system-ui, -apple-system, sans-serif;
		letter-spacing: 0.04em;
		text-align: center;
		text-transform: uppercase;
		overflow-wrap: normal;
		hyphens: none;
		transition: filter 0.1s, background 0.18s cubic-bezier(0.25, 1, 0.5, 1), transform 0.1s cubic-bezier(0.25, 1, 0.5, 1);
	}

	.ta-tray-btn:hover  { filter: brightness(1.12); }
	.ta-tray-btn:active { filter: brightness(1.25); transform: scaleY(0.94); }
	.ta-tray-btn:last-child { border-right: none; }

	.ta-tray-btn-success  { background: oklch(0.48 0.16 145); }
	.ta-tray-btn-warning  { background: oklch(0.52 0.14 70); }
	.ta-tray-btn-error    { background: oklch(0.45 0.16 25); }
	.ta-tray-btn-info     { background: oklch(0.48 0.14 220); }
	.ta-tray-btn-default  { background: oklch(0.30 0.02 250); }
	.ta-tray-btn-working  { background: oklch(0.52 0.14 70); }
	.ta-tray-btn-epic     { background: oklch(0.35 0.10 280); }
	.ta-tray-btn-epic-open { background: oklch(0.45 0.14 280); box-shadow: inset 0 -2px 0 oklch(0.65 0.18 280 / 0.6); }
	.ta-tray-btn-cmds     { background: oklch(0.30 0.08 200); }
	.ta-tray-btn-cmds-open { background: oklch(0.42 0.14 200); box-shadow: inset 0 -2px 0 oklch(0.65 0.18 200 / 0.6); }
	.ta-tray-btn-auto      { background: oklch(0.35 0.08 45); color: oklch(0.70 0.12 45); }
	.ta-tray-btn-auto-on   { background: oklch(0.35 0.12 145); color: oklch(0.75 0.15 145); }
	.ta-tray-btn-error-fail { background: oklch(0.40 0.16 25); color: oklch(0.92 0.04 25); }

	.ta-tray-btn { position: relative; overflow: hidden; }
	.tray-hold-fill {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		background: oklch(1 0 0 / 0.28);
		transition: width 30ms linear;
		pointer-events: none;
		z-index: 0;
	}
	.ta-tray-btn-holding { filter: brightness(1.2); }
	.ta-tray-btn > :not(.tray-hold-fill) { position: relative; z-index: 1; }


	/* Inline commands panel — expands below the card inner */
	.ta-cmd-inline {
		background: oklch(0.17 0.02 200 / 0.65);
		border-top: 1px solid oklch(0.35 0.08 200 / 0.4);
		padding: 0.375rem 0.5rem;
		max-height: 200px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.ta-cmd-header {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-bottom: 0.1875rem;
	}

	.ta-cmd-close {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border: none;
		border-radius: 0.25rem;
		background: oklch(0.28 0.04 200 / 0.6);
		color: oklch(0.60 0.05 200);
		cursor: pointer;
		transition: background 0.15s, color 0.15s, transform 0.1s;
	}

	.ta-cmd-close:hover {
		background: oklch(0.38 0.08 200 / 0.7);
		color: oklch(0.80 0.02 250);
	}

	.ta-cmd-close:active {
		transform: scale(0.88);
	}

	.ta-cmd-search {
		flex: 1;
		padding: 0.25rem 0.5rem;
		background: oklch(0.22 0.03 200);
		border: 1px solid oklch(0.35 0.08 200 / 0.5);
		border-radius: 0.25rem;
		color: oklch(0.85 0.02 250);
		font-size: 0.6875rem;
		outline: none;
	}

	.ta-cmd-msg {
		padding: 0.375rem 0.25rem;
		color: oklch(0.55 0.04 200);
		font-size: 0.6875rem;
		text-align: center;
	}

	.ta-cmd-skeleton {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		width: 100%;
		padding: 0.35rem 0.5rem;
		border-radius: 0.25rem;
		background: oklch(0.22 0.03 200 / 0.4);
	}
	.ta-cmd-skeleton-ns {
		width: 2.5rem;
		height: 0.625rem;
		border-radius: 0.125rem;
		background: oklch(0.35 0.03 200 / 0.6);
		animation: skeleton-pulse 1.6s ease-in-out infinite;
	}
	.ta-cmd-skeleton-name {
		flex: 1;
		height: 0.75rem;
		border-radius: 0.125rem;
		background: oklch(0.35 0.03 200 / 0.5);
		animation: skeleton-pulse 1.6s ease-in-out infinite;
	}
	.ta-epic-skeleton {
		width: 100%;
		height: 1.75rem;
		border-radius: 0.25rem;
		background: oklch(0.22 0.03 200 / 0.4);
		position: relative;
		overflow: hidden;
		animation: skeleton-pulse 1.6s ease-in-out infinite;
	}
	@media (prefers-reduced-motion: reduce) {
		.ta-cmd-skeleton-ns,
		.ta-cmd-skeleton-name,
		.ta-epic-skeleton { animation: none; }
	}

	.ta-cmd-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		width: 100%;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		border: none;
		background: oklch(0.22 0.03 200 / 0.4);
		cursor: pointer;
		text-align: left;
		transition: background 0.12s, transform 0.1s cubic-bezier(0.25, 1, 0.5, 1);
	}

	.ta-cmd-item:hover {
		background: oklch(0.30 0.08 200 / 0.6);
		transform: translateX(2px);
	}

	.ta-cmd-item:active {
		background: oklch(0.35 0.10 200 / 0.7);
		transform: translateX(1px) scale(0.98);
	}

	.ta-cmd-ns {
		font-size: 0.5625rem;
		color: oklch(0.55 0.10 200);
		font-family: monospace;
		flex-shrink: 0;
	}

	.ta-cmd-name {
		font-size: 0.6875rem;
		color: oklch(0.80 0.02 250);
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-family: monospace;
	}

	/* Inline epic picker — expands below the card inner */
	.ta-epic-inline {
		background: oklch(0.18 0.02 280 / 0.6);
		border-top: 1px solid oklch(0.35 0.08 280 / 0.4);
		padding: 0.375rem 0.5rem;
		max-height: 180px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.1875rem;
	}

	.ta-epic-header {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-bottom: 0.1875rem;
	}

	.ta-epic-close {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border: none;
		border-radius: 0.25rem;
		background: oklch(0.28 0.04 280 / 0.6);
		color: oklch(0.60 0.05 280);
		cursor: pointer;
		transition: background 0.15s, color 0.15s, transform 0.1s;
	}

	.ta-epic-close:hover {
		background: oklch(0.38 0.08 280 / 0.7);
		color: oklch(0.80 0.02 250);
	}

	.ta-epic-close:active {
		transform: scale(0.88);
	}

	.ta-epic-search {
		flex: 1;
		padding: 0.25rem 0.5rem;
		background: oklch(0.22 0.03 280);
		border: 1px solid oklch(0.35 0.08 280 / 0.5);
		border-radius: 0.25rem;
		color: oklch(0.85 0.02 250);
		font-size: 0.6875rem;
		outline: none;
	}

	.ta-epic-msg {
		padding: 0.375rem 0.25rem;
		color: oklch(0.55 0.04 280);
		font-size: 0.6875rem;
		text-align: center;
	}

	.ta-epic-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		width: 100%;
		padding: 0.3125rem 0.5rem;
		border-radius: 0.25rem;
		border: none;
		background: oklch(0.22 0.03 280 / 0.5);
		cursor: pointer;
		text-align: left;
		transition: background 0.12s, transform 0.1s cubic-bezier(0.25, 1, 0.5, 1);
	}

	.ta-epic-item:hover {
		background: oklch(0.30 0.08 280 / 0.6);
		transform: translateX(2px);
	}

	.ta-epic-item:active {
		background: oklch(0.35 0.10 280 / 0.7);
		transform: translateX(1px) scale(0.98);
	}

	.ta-epic-item-closed { opacity: 0.5; }

	/* Create new epic section */
	.ta-epic-create-section {
		border-top: 1px solid oklch(0.35 0.08 280 / 0.25);
		margin-top: 0.125rem;
		padding-top: 0.125rem;
	}

	.ta-epic-create-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		width: 100%;
		padding: 0.3125rem 0.5rem;
		border: none;
		border-radius: 0.25rem;
		background: transparent;
		color: oklch(0.55 0.08 280);
		font-size: 0.6875rem;
		cursor: pointer;
		transition: color 0.12s, background 0.12s;
	}

	.ta-epic-create-btn:hover:not(:disabled) {
		color: oklch(0.75 0.12 280);
		background: oklch(0.28 0.06 280 / 0.35);
	}

	.ta-epic-create-btn:disabled { opacity: 0.4; cursor: not-allowed; }

	.ta-epic-create-form {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.25rem 0.125rem;
	}

	.ta-epic-create-input {
		width: 100%;
		padding: 0.3125rem 0.5rem;
		background: oklch(0.20 0.03 280);
		border: 1px solid oklch(0.45 0.12 280 / 0.5);
		border-radius: 0.25rem;
		color: oklch(0.88 0.02 250);
		font-size: 0.6875rem;
		outline: none;
		transition: border-color 0.15s;
	}

	.ta-epic-create-input:focus {
		border-color: oklch(0.60 0.16 280 / 0.7);
	}

	.ta-epic-create-error {
		font-size: 0.625rem;
		color: oklch(0.65 0.16 25);
		padding: 0 0.25rem;
	}

	.ta-epic-create-actions {
		display: flex;
		gap: 0.375rem;
		justify-content: flex-end;
	}

	.ta-epic-create-cancel {
		padding: 0.1875rem 0.625rem;
		border: 1px solid oklch(0.35 0.04 250 / 0.5);
		border-radius: 0.25rem;
		background: transparent;
		color: oklch(0.55 0.02 250);
		font-size: 0.625rem;
		cursor: pointer;
		transition: background 0.12s, color 0.12s;
	}

	.ta-epic-create-cancel:hover:not(:disabled) {
		background: oklch(0.25 0.02 250 / 0.5);
		color: oklch(0.75 0.02 250);
	}

	.ta-epic-create-submit {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.1875rem 0.75rem;
		border: none;
		border-radius: 0.25rem;
		background: oklch(0.45 0.14 280);
		color: oklch(0.95 0.02 280);
		font-size: 0.625rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.12s, opacity 0.12s;
	}

	.ta-epic-create-submit:hover:not(:disabled) {
		background: oklch(0.52 0.16 280);
	}

	.ta-epic-create-submit:disabled { opacity: 0.5; cursor: not-allowed; }

	/* New Command nav link */
	.ta-cmd-new-link {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		width: 100%;
		padding: 0.3125rem 0.5rem;
		border-top: 1px solid oklch(0.35 0.08 200 / 0.25);
		margin-top: 0.125rem;
		border-radius: 0 0 0.25rem 0.25rem;
		background: transparent;
		color: oklch(0.50 0.08 200);
		font-size: 0.6875rem;
		text-decoration: none;
		cursor: pointer;
		transition: color 0.12s, background 0.12s;
	}

	.ta-cmd-new-link:hover {
		color: oklch(0.70 0.12 200);
		background: oklch(0.25 0.05 200 / 0.35);
	}

	.ta-epic-id {
		font-size: 0.5625rem;
		color: oklch(0.60 0.12 280);
		font-family: monospace;
		flex-shrink: 0;
	}

	.ta-epic-title {
		font-size: 0.6875rem;
		color: oklch(0.80 0.02 250);
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Feedback flash animation — plays when a tray button is clicked */
	.ta-tray-btn-feedback {
		animation: tray-btn-confirm 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
		pointer-events: none;
	}

	.ta-tray-btn-feedback.ta-tray-btn-success {
		background: oklch(0.58 0.20 145);
	}
	.ta-tray-btn-feedback.ta-tray-btn-error {
		background: oklch(0.55 0.20 25);
	}
	.ta-tray-btn-feedback.ta-tray-btn-warning {
		background: oklch(0.60 0.16 70);
	}
	.ta-tray-btn-feedback.ta-tray-btn-info {
		background: oklch(0.56 0.16 220);
	}

	@keyframes tray-btn-confirm {
		0% {
			transform: scale(1);
			filter: brightness(1);
		}
		30% {
			transform: scale(1.12);
			filter: brightness(1.4);
		}
		60% {
			transform: scale(0.97);
			filter: brightness(1.2);
		}
		100% {
			transform: scale(1);
			filter: brightness(1.15);
		}
	}

	/* Content area (full width minus strip) */
	.ta-card-body {
		flex: 1;
		min-width: 0;
		padding: 0.75rem 0.875rem;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.ta-title-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}

	.ta-title {
		flex: 1;
		min-width: 0;
		font-size: 1.0625rem;
		font-weight: 600;
		letter-spacing: -0.005em;
		color: oklch(0.94 0.02 250);
		font-family: system-ui, -apple-system, sans-serif;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ta-description {
		min-width: 0;
		font-size: 0.75rem;
		color: oklch(0.72 0.02 250);
		overflow: hidden;
		line-height: 1.45;
		white-space: nowrap;
		text-overflow: ellipsis;
	}



	/* Row 2: metadata line — default sans-serif for readability, mono only for IDs/timestamps */
	.ta-card-row2 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		font-family: system-ui, -apple-system, sans-serif;
		color: oklch(0.62 0.02 250);
		overflow: hidden;
		flex-wrap: nowrap;
	}

	.ta-agent-name {
		font-weight: 500;
		color: oklch(0.72 0.02 250);
		letter-spacing: 0.01em;
	}

	.ta-separator {
		color: oklch(0.35 0.01 250);
		font-size: 0.625rem;
	}

	.ta-task-id {
		font-weight: 600;
		white-space: nowrap;
		flex-shrink: 0;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		font-family: ui-monospace, monospace;
		font-size: 0.6875rem;
		text-decoration: underline;
		text-decoration-color: oklch(0.40 0.01 250 / 0.4);
		text-underline-offset: 2px;
		transition: text-decoration-color 0.15s;
	}
	.ta-task-id:hover {
		text-decoration-color: currentColor;
	}
	.ta-task-id:focus-visible {
		outline: 2px solid oklch(0.70 0.18 240);
		outline-offset: 2px;
		border-radius: 2px;
	}
	.ta-task-id-badge {
		margin-left: 0.375rem;
		font-family: system-ui, -apple-system, sans-serif;
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: oklch(0.82 0.18 145);
		text-decoration: none;
	}
	.ta-task-id-copied {
		text-decoration-color: oklch(0.70 0.18 145 / 0.6);
	}

	.ta-harness {
		display: inline-flex;
		align-items: center;
	}

	.ta-age {
		font-weight: 600;
		font-size: 0.5625rem;
	}

	.ta-priority {
		font-weight: 700;
		font-size: 0.6875rem;
		padding: 0.0625rem 0.375rem;
		border-radius: 3px;
		letter-spacing: 0.02em;
		line-height: 1.25;
	}

	.ta-priority-0 {
		color: oklch(0.88 0.18 25);
		background: oklch(0.55 0.20 25 / 0.22);
		border: 1px solid oklch(0.70 0.20 25 / 0.35);
	}

	.ta-priority-1 {
		color: oklch(0.88 0.15 85);
		background: oklch(0.55 0.18 85 / 0.20);
		border: 1px solid oklch(0.70 0.18 85 / 0.32);
	}

	.ta-project {
		font-weight: 500;
		color: oklch(0.60 0.05 250);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.ta-state-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		font-size: 0.5625rem;
		font-weight: 600;
		line-height: 1;
		margin-left: auto;
		flex-shrink: 0;
		white-space: nowrap;
	}

	/* Hide state badge when Complete button is present (badge is redundant with the button's context) */
	.ta-title-row:has(.ta-title-complete) .ta-title-state {
		display: none;
	}

	/* Primary action in title row — visible Complete button when review-ready */
	.ta-title-complete {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.1875rem 0.5rem;
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: oklch(0.97 0.05 180);
		background: oklch(0.55 0.14 180 / 0.8);
		border: 1px solid oklch(0.70 0.16 180 / 0.7);
		border-radius: 3px;
		white-space: nowrap;
		flex-shrink: 0;
		cursor: pointer;
		font-family: system-ui, -apple-system, sans-serif;
		line-height: 1;
		transition: background 0.12s ease, border-color 0.12s ease, filter 0.12s ease, transform 0.08s ease;
	}
	.ta-title-complete:hover {
		background: oklch(0.62 0.16 180 / 0.9);
		border-color: oklch(0.78 0.16 180 / 0.85);
		filter: brightness(1.08);
	}
	.ta-title-complete:active {
		transform: translateY(1px) scale(0.97);
	}
	.ta-title-complete:focus-visible {
		outline: 2px solid oklch(0.78 0.16 180);
		outline-offset: 2px;
	}
	.ta-title-complete:disabled {
		cursor: default;
	}
	.ta-title-complete-feedback {
		background: oklch(0.55 0.18 145 / 0.85);
		border-color: oklch(0.70 0.18 145 / 0.85);
		color: oklch(0.98 0.08 145);
		animation: tray-btn-confirm 0.35s cubic-bezier(0.25, 1, 0.5, 1);
	}
	.ta-title-complete-failed {
		background: oklch(0.55 0.22 25 / 0.85);
		border-color: oklch(0.70 0.22 25 / 0.85);
		color: oklch(0.98 0.08 25);
		animation: none;
	}

	/* ========== SWIPE-TO-REVEAL ========== */

	.swipe-container {
		position: relative;
		overflow: hidden;
	}

	.swipe-container:first-child .ta-session-card {
		border-radius: 0.5rem 0.5rem 0 0;
	}

	.swipe-container:last-child .ta-session-card {
		border-radius: 0 0 0.5rem 0.5rem;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.swipe-container:only-child .ta-session-card {
		border-radius: 0.5rem;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.swipe-tray {
		position: absolute;
		top: 0;
		bottom: 0;
		display: flex;
		align-items: stretch;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.15s;
	}

	.swipe-tray-visible {
		opacity: 1;
		pointer-events: auto;
	}

	.swipe-tray-left {
		left: 0;
		flex-direction: row;
	}

	.swipe-tray-right {
		right: 0;
		flex-direction: row;
	}

	.swipe-action {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		width: 100px;
		border: none;
		cursor: pointer;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: white;
		transition: filter 0.15s;
	}

	.swipe-action:active {
		filter: brightness(1.3);
	}

	.swipe-action span {
		font-size: 0.625rem;
	}

	.ta-session-card.swiping {
		/* Disable :active state during swipe */
		background: oklch(0.16 0.01 250);
	}

	.ta-session-card.swiping.attached {
		background: oklch(0.65 0.15 145 / 0.06);
	}

	/* Override first/last/only-child on .ta-session-card since .swipe-container owns that now */
	.ta-session-card:first-child {
		border-radius: 0;
	}
	.ta-session-card:last-child {
		border-radius: 0;
		border-bottom: none;
	}
	.ta-session-card:only-child {
		border-radius: 0;
		border-bottom: none;
	}

	/* Mobile: shrink avatar strip so title has room to breathe */
	@media (max-width: 560px) {
		.ta-state-strip-agent {
			width: 80px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ta-session-card {
			transition: none !important;
		}
		.swipe-tray {
			transition: none !important;
		}
		.ta-title,
		.ta-description {
			transition: none !important;
			animation: none !important;
		}
		.ta-tray-btn,
		.ta-cmd-item,
		.ta-epic-item,
		.ta-cmd-close,
		.ta-epic-close {
			transition: none !important;
			transform: none !important;
			animation: none !important;
		}
	}

	/* Expanded card within mobile */
	.ta-expanded-card {
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-top: none;
		/*border-radius: 0 0 8px 8px;*/
		margin-top: -0.5rem;
		padding-top: 0.5rem;
		overflow: hidden;
	}

</style>
