<script lang="ts">
	/**
	 * TasksActive Component
	 *
	 * Displays active agent/server sessions in a table format with expandable rows.
	 * Extracted from /tasks page for reuse in other views.
	 */

	import { untrack } from 'svelte';
	import SessionCard from '$lib/components/work/SessionCard.svelte';
	import TaskIdBadge from '$lib/components/TaskIdBadge.svelte';
	import AgentAvatar from '$lib/components/AgentAvatar.svelte';
	import ServerSessionBadge from '$lib/components/ServerSessionBadge.svelte';
	import StatusActionBadge from '$lib/components/work/StatusActionBadge.svelte';
	import TaskDetailPane from '$lib/components/sessions/TaskDetailPane.svelte';
	import { getReviewRules } from '$lib/stores/reviewRules.svelte';
	import { computeReviewStatus } from '$lib/utils/reviewStatusUtils';
	import { getSessionStateVisual, getIssueTypeVisual, type SessionState } from '$lib/config/statusColors';
	import ProviderLogo from '$lib/components/agents/ProviderLogo.svelte';
	import { getNotesUpdateSignal, clearNotesUpdateSignal } from '$lib/stores/taskNotesUpdate.svelte';
	import MonacoWrapper from '$lib/components/config/MonacoWrapper.svelte';
	import FxText from '$lib/components/FxText.svelte';
	import MobileSessionFullscreen from '$lib/components/work/MobileSessionFullscreen.svelte';
	import { getSwipeConfig, getSwipeActionDef, initSwipeActions } from '$lib/config/swipeActions';
	import { onMount } from 'svelte';

	function activeTaskCtx(t: AgentTask): Record<string, any> {
		return { title: t.title, status: t.status, priority: t.priority, type: t.issue_type, labels: t.labels?.join(', '), created_at: t.created_at };
	}

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
		data?: Record<string, any>;
	}

	interface ExtendedTaskDetails {
		labels?: string[];
		assignee?: string;
		notes?: string;
		depends_on?: TaskDependency[];
		blocked_by?: TaskDependency[];
		created_at?: string;
		updated_at?: string;
		attachments: TaskAttachment[];
		timeline: TimelineEvent[];
		timelineCounts: { total: number; jat_events: number; agent_mail: number; signals?: number };
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
		onKillSession,
		onAttachSession,
		onViewTask,
		mobile = false
	}: {
		sessions: TmuxSession[];
		agentTasks: Map<string, AgentTask>;
		agentSessionInfo: Map<string, AgentSessionInfo>;
		agentProjects: Map<string, string>;
		projectColors: Record<string, string>;
		taskIntegrations?: Record<string, { sourceId: string; sourceType: string; sourceName: string; sourceEnabled: boolean }>;
		browserSessions?: Map<string, number>;
		onKillSession?: (sessionName: string) => Promise<void>;
		onAttachSession?: (sessionName: string) => Promise<void>;
		onViewTask?: (taskId: string) => void;
		mobile?: boolean;
	} = $props();

	// Status and priority colors
	const statusColors: Record<string, string> = {
		open: 'badge-info',
		in_progress: 'badge-warning',
		blocked: 'badge-error',
		closed: 'badge-success'
	};

	// Mobile fullscreen state
	let fullscreenSession = $state<string | null>(null);

	// Internal state
	let expandedSession = $state<string | null>(null);
	let collapsingSession = $state<string | null>(null);
	let expandedOutput = $state<string>('');
	let outputPollInterval: ReturnType<typeof setInterval> | null = null;
	let expandedHeight = $state(800);
	let isResizing = $state(false);

	// Horizontal split between SessionCard and TaskDetailPane
	let sessionPanelPercent = $state(60); // SessionCard gets this %, TaskDetailPane gets the rest
	let isSplitResizing = $state(false);

	// Task detail panel state
	let expandedTaskId = $state<string | null>(null);
	let taskDetailOpen = $state(false);
	let expandedTaskDetails = $state<ExtendedTaskDetails | null>(null);
	let taskDetailsLoading = $state(false);
	let timelineFilter = $state<'all' | 'tasks' | 'messages'>('all');

	// Notes editing state
	let notesEditing = $state(false);
	let notesValue = $state('');
	let notesSaving = $state(false);

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

	// Per-session auto-complete disabled state (when user manually overrides)
	let autoCompleteDisabledMap = $state<Map<string, boolean>>(new Map());

	// "All done" flash state - shown when no more sessions to navigate to
	let allDoneFlash = $state(false);

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

	// React to notes updates from SendToLLM component
	$effect(() => {
		const signal = getNotesUpdateSignal();
		if (signal && signal.taskId === expandedTaskId) {
			// Notes were updated for the currently expanded task - refresh details
			fetchExpandedTaskDetails(signal.taskId);
			clearNotesUpdateSignal();
		}
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

	// Session expansion
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

	// Handle horizontal split resize between SessionCard and TaskDetailPane
	let splitResizeContainer: HTMLDivElement | null = null;

	function startSplitResize(e: MouseEvent) {
		e.preventDefault();
		isSplitResizing = true;
		const startX = e.clientX;
		const startPercent = sessionPanelPercent;

		function onMouseMove(e: MouseEvent) {
			if (!splitResizeContainer) return;
			const containerRect = splitResizeContainer.getBoundingClientRect();
			const containerWidth = containerRect.width;
			const deltaX = e.clientX - startX;
			const deltaPercent = (deltaX / containerWidth) * 100;
			sessionPanelPercent = Math.max(30, Math.min(80, startPercent + deltaPercent));
		}

		function onMouseUp() {
			isSplitResizing = false;
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		}

		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}

	function toggleExpanded(sessionName: string) {
		if (expandedSession === sessionName) {
			// Collapse with animation
			collapsingSession = sessionName;
			if (outputPollInterval) {
				clearInterval(outputPollInterval);
				outputPollInterval = null;
			}
			setTimeout(() => {
				expandedSession = null;
				expandedOutput = '';
				collapsingSession = null;
			}, 200);
		} else {
			expandInline(sessionName);
		}
	}

	function expandInline(sessionName: string) {
		if (outputPollInterval) {
			clearInterval(outputPollInterval);
			outputPollInterval = null;
		}

		expandedSession = sessionName;
		fetchExpandedOutput(sessionName);

		const agentName = getAgentName(sessionName);
		const task = agentTasks.get(agentName);
		if (task) {
			expandedTaskId = task.id;
			taskDetailOpen = true;
			fetchExpandedTaskDetails(task.id);
		} else {
			expandedTaskId = null;
			taskDetailOpen = false;
			expandedTaskDetails = null;
		}

		outputPollInterval = setInterval(() => {
			if (expandedSession === sessionName) {
				fetchExpandedOutput(sessionName);
			}
		}, 1000);
	}

	// Resize handling
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

	// Task details fetching
	async function fetchExpandedTaskDetails(taskId: string) {
		if (!taskId) return;

		taskDetailsLoading = true;
		expandedTaskDetails = null;

		try {
			const [taskRes, attachmentsRes, historyRes, signalsRes] = await Promise.all([
				fetch(`/api/tasks/${taskId}`),
				fetch(`/api/tasks/${taskId}/image`),
				fetch(`/api/tasks/${taskId}/history`),
				fetch(`/api/tasks/${taskId}/signals`)
			]);

			const taskData = taskRes.ok ? await taskRes.json() : null;
			const attachmentsData = attachmentsRes.ok ? await attachmentsRes.json() : { images: [] };
			const historyData = historyRes.ok ? await historyRes.json() : { timeline: [], count: { total: 0, jat_events: 0, agent_mail: 0 } };
			const signalsData = signalsRes.ok ? await signalsRes.json() : { signals: [] };

			const signalEvents = (signalsData.signals || []).map((signal: any) => ({
				type: 'signal' as const,
				timestamp: signal.timestamp,
				data: {
					state: signal.state,
					agentName: signal.agent_name,
					...signal.data
				}
			}));

			const mergedTimeline = [...(historyData.timeline || []), ...signalEvents]
				.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

			expandedTaskDetails = {
				labels: taskData?.task?.labels || [],
				assignee: taskData?.task?.assignee,
				notes: taskData?.task?.notes || '',
				depends_on: taskData?.task?.depends_on || [],
				blocked_by: taskData?.task?.blocked_by || [],
				created_at: taskData?.task?.created_at,
				updated_at: taskData?.task?.updated_at,
				attachments: (attachmentsData.images || []).map((img: any) => ({
					id: img.id || img.path,
					path: img.path,
					filename: img.filename || img.path.split('/').pop(),
					url: `/api/work/image/${encodeURIComponent(img.path)}`
				})),
				timeline: mergedTimeline,
				timelineCounts: {
					total: mergedTimeline.length,
					jat_events: historyData.count?.jat_events || 0,
					agent_mail: historyData.count?.agent_mail || 0,
					signals: signalEvents.length
				}
			};
			// Initialize notes editing state
			notesValue = taskData?.task?.notes || '';
			notesEditing = false;
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

	// Upload attachment for task
	async function handleUploadAttachment(taskId: string, file: File) {
		try {
			// Step 1: Upload file via /api/work/upload-image
			const formData = new FormData();
			formData.append('image', file, `task-${taskId}-${Date.now()}-${file.name}`);
			formData.append('sessionName', `task-${taskId}`);

			const uploadResponse = await fetch('/api/work/upload-image', {
				method: 'POST',
				body: formData
			});

			if (!uploadResponse.ok) {
				throw new Error('Failed to upload file');
			}

			const { filePath } = await uploadResponse.json();

			// Step 2: Save metadata via /api/tasks/${taskId}/image
			const metadataResponse = await fetch(`/api/tasks/${taskId}/image`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ path: filePath, id: `img-${Date.now()}` })
			});

			if (!metadataResponse.ok) {
				throw new Error('Failed to save attachment metadata');
			}

			// Step 3: Refresh task details to show new attachment
			if (expandedTaskId === taskId) {
				await fetchExpandedTaskDetails(taskId);
			}
		} catch (err) {
			console.error('Failed to upload attachment:', err);
		}
	}

	// Remove attachment from task
	async function handleRemoveAttachment(taskId: string, attachmentId: string) {
		try {
			const response = await fetch(`/api/tasks/${taskId}/image`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: attachmentId })
			});

			if (!response.ok) {
				throw new Error('Failed to remove attachment');
			}

			// Refresh task details to update attachments list
			if (expandedTaskId === taskId) {
				await fetchExpandedTaskDetails(taskId);
			}
		} catch (err) {
			console.error('Failed to remove attachment:', err);
		}
	}

	// Save notes on blur
	async function saveNotes(taskId: string) {
		if (!taskId || notesSaving) return;

		// Don't save if value hasn't changed
		const currentNotes = expandedTaskDetails?.notes || '';
		if (notesValue === currentNotes) {
			notesEditing = false;
			return;
		}

		notesSaving = true;
		try {
			const response = await fetch(`/api/tasks/${taskId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ notes: notesValue })
			});

			if (response.ok) {
				// Update local state
				if (expandedTaskDetails) {
					expandedTaskDetails.notes = notesValue;
				}
			} else {
				console.error('Failed to save notes:', await response.text());
				// Revert on error
				notesValue = currentNotes;
			}
		} catch (err) {
			console.error('Error saving notes:', err);
			// Revert on error
			notesValue = currentNotes;
		} finally {
			notesSaving = false;
			notesEditing = false;
		}
	}

	// Save description on blur
	async function saveDescription(taskId: string, description: string) {
		if (!taskId) return;

		try {
			const response = await fetch(`/api/tasks/${taskId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ description })
			});

			if (response.ok) {
				// Update local state by finding the task in agentTasks map
				for (const [agentName, task] of agentTasks) {
					if (task.id === taskId) {
						task.description = description;
						break;
					}
				}
			} else {
				console.error('Failed to save description:', await response.text());
			}
		} catch (err) {
			console.error('Error saving description:', err);
		}
	}

	// Input handling for expanded session
	async function sendExpandedInput(text: string, type: 'text' | 'key' | 'raw' = 'text'): Promise<boolean> {
		if (!expandedSession) return false;
		try {
			let apiType: string = type;
			let apiInput: string = text;

			if (type === 'key') {
				const specialKeys = ['ctrl-c', 'ctrl-d', 'ctrl-u', 'ctrl-l', 'enter', 'escape', 'up', 'down', 'left', 'right', 'tab', 'delete', 'backspace', 'space'];
				if (specialKeys.includes(text)) {
					apiType = text;
					apiInput = '';
				} else {
					apiType = 'raw';
					apiInput = text;
				}
			}

			// Note: Signal emission for user input is handled by SessionCard (which calls this
			// function via onSendInput). SessionCard emits the "Processing user input" working
			// signal once before sending the actual message text. We don't emit here to avoid
			// duplicate timeline entries — previously every key event (ctrl-c, escape, enter)
			// was also generating a signal, causing 5-6 "Processing user input" entries per
			// single user message. See: jat-ljhxi

			const response = await fetch(`/api/work/${encodeURIComponent(expandedSession)}/input`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ input: apiInput, type: apiType })
			});
			setTimeout(() => fetchExpandedOutput(expandedSession!), 100);
			return response.ok;
		} catch (err) {
			console.error('Failed to send input:', err);
			return false;
		}
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
	let swipeConfig = $state(getSwipeConfig());
	const SWIPE_THRESHOLD = 80;
	const SWIPE_COMMIT_THRESHOLD = 140;
	const VELOCITY_THRESHOLD = 0.5;
	const SWIPE_DEADZONE = 10;
	const ACTION_TRAY_WIDTH = 100;

	// Reactive action definitions from config
	const rightAction = $derived(getSwipeActionDef(swipeConfig.rightSwipe));
	const leftAction = $derived(getSwipeActionDef(swipeConfig.leftSwipe));

	onMount(() => {
		initSwipeActions();
		swipeConfig = getSwipeConfig();
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
	}

	function handleSwipeTouchMove(e: TouchEvent) {
		if (!swipeState || swipeState.committed) return;
		const touch = e.touches[0];
		const deltaX = touch.clientX - swipeState.startX;
		const deltaY = touch.clientY - swipeState.startY;

		if (!swipeState.swiping) {
			if (Math.abs(deltaY) > SWIPE_DEADZONE) {
				swipeState = null;
				return;
			}
			if (Math.abs(deltaX) > SWIPE_DEADZONE) {
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
	}
	let ctxData = $state<CtxSession | null>(null);
	let ctxX = $state(0);
	let ctxY = $state(0);
	let ctxVisible = $state(false);
	let ctxStatusSubmenuOpen = $state(false);
	let ctxStateSubmenuOpen = $state(false);

	function handleContextMenu(session: TmuxSession, event: MouseEvent) {
		if (session.type !== 'agent') return;
		event.preventDefault();
		event.stopPropagation();
		const menuWidth = 200;
		const menuHeight = 380;
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
		ctxStateSubmenuOpen = false;
	}

	function closeCtxMenu() {
		ctxVisible = false;
		ctxStatusSubmenuOpen = false;
		ctxStateSubmenuOpen = false;
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

	// Cleanup on destroy
	import { onDestroy } from 'svelte';
	onDestroy(() => {
		if (outputPollInterval) {
			clearInterval(outputPollInterval);
		}
	});
</script>

{#if sessions.length === 0}
	<div class="empty-state">
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="empty-icon">
			<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
		</svg>
		<p class="empty-title">No active sessions</p>
		<p class="empty-hint">Start a new agent or dev server to see sessions here.</p>
	</div>
{:else}
	{#if mobile}
	<!-- MOBILE LAYOUT: Card-based, 2-row compact design -->
	<div class="mobile-sessions-list">
		{#each orderedSessions as { session, isExiting, isNew, hadTaskOnEntry } (session.name)}
			{@const sessionAgentName = getAgentName(session.name)}
			{@const sessionTask = agentTasks.get(sessionAgentName) || (isExiting ? cachedAgentTasks.get(sessionAgentName) : null)}
			{@const sessionInfo = agentSessionInfo.get(sessionAgentName)}
			{@const activityState = sessionInfo?.activityState}
			{@const rawEffectiveState = optimisticStates.get(session.name) || activityState || 'idle'}
			{@const effectiveState = rawEffectiveState === 'completing' && sessionTask?.status === 'closed' ? 'completed' : rawEffectiveState}
			{@const statusDotColor = getSessionStateVisual(effectiveState).accent}
			{@const derivedProject = agentProjects.get(sessionAgentName) || session.project || null}
			{@const elapsed = getElapsedFormatted(session.created)}
			{@const isExpanded = expandedSession === session.name}
			{@const isCollapsing = collapsingSession === session.name}

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
					class="mobile-session-card"
					class:attached={session.attached}
					class:swiping={isSwiping}
					style="{isExiting ? 'pointer-events: none;' : ''} {swipeOffset !== 0 ? `transform: translateX(${swipeOffset}px);` : ''} {isSwiping ? '' : swipeOffsets.has(session.name) ? 'transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);' : ''}"
					onclick={() => !isExiting && !swipeState?.swiping && (fullscreenSession = session.name)}
					ontouchstart={(e) => handleSwipeTouchStart(e, session.name)}
					ontouchmove={handleSwipeTouchMove}
					ontouchend={handleSwipeTouchEnd}
					ontouchcancel={handleSwipeTouchEnd}
				>
				{#if session.type === 'server'}
					<!-- Server session -->
					<div class="mobile-card-row1">
						<span class="mobile-title">{session.name}</span>
					</div>
				{:else if sessionTask}
					<!-- Agent session with task -->
					{@const reviewStatus = computeReviewStatus(sessionTask, getReviewRules())}
					{@const reviewBasedDefault = reviewStatus?.action !== 'auto'}
					{@const autoCompleteDisabled = autoCompleteDisabledMap.get(session.name) ?? reviewBasedDefault}
					{@const taskAge = getTaskAge(sessionTask.created_at)}
					{@const typeVisual = getIssueTypeVisual(sessionTask.issue_type)}
					{@const harness = getTaskHarness(sessionTask)}
					<div class="mobile-card-row1">
						<div class="mobile-left">
							<span class="mobile-title" title={sessionTask.title}>
								<FxText text={sessionTask.title || sessionTask.id} context={activeTaskCtx(sessionTask)} />
							</span>
							<div class="mobile-card-row2">
								<span class="mobile-task-id" style="color: {statusDotColor};">{sessionTask.id}</span>
								{#if elapsed}
									<span class="mobile-separator">·</span>
									<span class="mobile-elapsed">{#if elapsed.showHours}{elapsed.hours}:{/if}{elapsed.minutes}:{elapsed.seconds}</span>
								{/if}
								<span class="mobile-separator">·</span>
								<AgentAvatar name={sessionAgentName} size={16} showRing={true} sessionState={effectiveState} />
								<span class="mobile-agent-name">{sessionAgentName}</span>
								{#if sessionTask.issue_type}
									<span class="mobile-separator">·</span>
									<span class="mobile-type-icon" title={typeVisual.label}>{typeVisual.icon}</span>
								{/if}
								{#if harness}
									<span class="mobile-separator">·</span>
									<span class="mobile-harness" title={harness}><ProviderLogo agentId={harness} size={11} /></span>
								{/if}
								{#if sessionTask.priority != null && sessionTask.priority <= 2}
									<span class="mobile-separator">·</span>
									<span class="mobile-priority mobile-priority-{sessionTask.priority}">P{sessionTask.priority}</span>
								{/if}
								{#if taskAge.label}
									<span class="mobile-separator">·</span>
									<span class="mobile-age" style="color: {taskAge.color};">{taskAge.label}</span>
								{/if}
								{#if browserSessions.get(sessionAgentName)}
									<span class="mobile-separator">·</span>
									<span class="mobile-port">🌐 {browserSessions.get(sessionAgentName)}</span>
								{/if}
							</div>
						</div>
						<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
						<div class="mobile-status" onclick={(e) => e.stopPropagation()}>
							<StatusActionBadge
								sessionState={effectiveState as SessionState}
								stacked={true}
								sessionName={session.name}
								alignRight={true}
								animate={isNew}
								showCommands={true}
								showEpic={true}
								onCommand={(cmd) => sendWorkflowCommand(session.name, cmd)}
								onAction={async (actionId) => {
									if (actionId === 'attach') {
										await handleAttachSession(session.name);
									} else if (actionId === 'kill' || actionId === 'cleanup') {
										await handleKillSession(session.name);
									} else if (actionId === 'view-task' && sessionTask) {
										onViewTask?.(sessionTask.id);
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
														data: { taskId: sessionTask.id, taskTitle: sessionTask.title, currentStep: 'verifying', progress: 0, stepsCompleted: [], stepsRemaining: ['verifying', 'committing', 'closing', 'releasing'] }
													})
												});
											} catch (e) { console.warn('[TasksActive] Failed to write completing signal:', e); }
										}
										const cmd = actionId === 'complete-kill' ? '/jat:complete --kill' : '/jat:complete';
										await sendWorkflowCommand(session.name, cmd);
									} else if (actionId === 'interrupt') {
										await fetch(`/api/work/${encodeURIComponent(session.name)}/input`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'ctrl-c' }) });
									} else if (actionId === 'escape') {
										await fetch(`/api/work/${encodeURIComponent(session.name)}/input`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'escape' }) });
									} else if (actionId === 'close-kill') {
										if (sessionTask) {
											try { await fetch(`/api/tasks/${encodeURIComponent(sessionTask.id)}/close`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'Abandoned via Close & Kill' }) }); } catch (e) { console.warn('[TasksActive] Failed to close task:', e); }
										}
										await handleKillSession(session.name);
									} else if (actionId === 'pause') {
										optimisticStates.set(session.name, 'paused');
										optimisticStates = new Map(optimisticStates);
										if (sessionTask) {
											try { await fetch(`/api/sessions/${encodeURIComponent(session.name)}/pause`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId: sessionTask.id, taskTitle: sessionTask.title, reason: 'Paused via StatusActionBadge', killSession: true, agentName: sessionAgentName, project: session.project }) }); } catch (e) { console.warn('[TasksActive] Failed to pause session:', e); }
										} else { await handleKillSession(session.name); }
									}
								}}
								task={{ id: sessionTask.id, issue_type: sessionTask.issue_type, priority: sessionTask.priority }}
								project={session.project || null}
								onViewEpic={(epicId) => onViewTask?.(epicId)}
								autoCompleteEnabled={!autoCompleteDisabled}
								onAutoCompleteToggle={() => {
									const newMap = new Map(autoCompleteDisabledMap);
									newMap.set(session.name, !autoCompleteDisabled);
									autoCompleteDisabledMap = newMap;
								}}
								reviewReason={reviewStatus?.reason ?? null}
							/>
						</div>
					</div>
				{:else}
					<!-- Planning / no-task session -->
					<div class="mobile-card-row1">
						<span class="mobile-title" style="color: oklch(0.70 0.12 270);">
							{effectiveState === 'planning' ? 'Planning session' : 'No active task'}
						</span>
					</div>
					<div class="mobile-card-row2">
						<AgentAvatar name={sessionAgentName} size={16} showRing={true} sessionState={effectiveState} />
						<span class="mobile-agent-name">{sessionAgentName}</span>
						{#if derivedProject}
							<span class="mobile-separator">·</span>
							<span class="mobile-project">{derivedProject}</span>
						{/if}
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
			{@const fsState = (optimisticStates.get(fullscreenSession) || fsSessionInfo?.activityState || 'idle') as SessionState}
			{@const fsSession = sessions.find(s => s.name === fullscreenSession)}
			<MobileSessionFullscreen
				sessionName={fullscreenSession}
				agentName={fsAgentName}
				taskId={fsTask?.id || ''}
				taskTitle={fsTask?.title || ''}
				sessionState={fsState}
				project={fsSession?.project || null}
				onClose={() => fullscreenSession = null}
				onAction={async (actionId) => {
					const sName = fullscreenSession!;
					if (actionId === 'attach') {
						await handleAttachSession(sName);
					} else if (actionId === 'kill' || actionId === 'cleanup') {
						fullscreenSession = null;
						await handleKillSession(sName);
					} else if (actionId === 'view-task' && fsTask) {
						onViewTask?.(fsTask.id);
					} else if (actionId === 'complete' || actionId === 'complete-kill') {
						optimisticStates.set(sName, 'completing');
						optimisticStates = new Map(optimisticStates);
						if (fsTask) {
							try {
								await fetch(`/api/sessions/${encodeURIComponent(sName)}/signal`, {
									method: 'POST',
									headers: { 'Content-Type': 'application/json' },
									body: JSON.stringify({
										type: 'completing',
										data: { taskId: fsTask.id, taskTitle: fsTask.title, currentStep: 'verifying', progress: 0, stepsCompleted: [], stepsRemaining: ['verifying', 'committing', 'closing', 'releasing'] }
									})
								});
							} catch (e) { console.warn('[TasksActive] Failed to write completing signal:', e); }
						}
						const cmd = actionId === 'complete-kill' ? '/jat:complete --kill' : '/jat:complete';
						await sendWorkflowCommand(sName, cmd);
					} else if (actionId === 'interrupt') {
						await fetch(`/api/work/${encodeURIComponent(sName)}/input`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'ctrl-c' }) });
					} else if (actionId === 'pause') {
						optimisticStates.set(sName, 'paused');
						optimisticStates = new Map(optimisticStates);
						if (fsTask) {
							try { await fetch(`/api/sessions/${encodeURIComponent(sName)}/pause`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId: fsTask.id, taskTitle: fsTask.title, reason: 'Paused via fullscreen', killSession: true, agentName: fsAgentName, project: fsSession?.project }) }); } catch (e) { console.warn('[TasksActive] Failed to pause session:', e); }
						} else { await handleKillSession(sName); }
						fullscreenSession = null;
					} else if (actionId === 'close-kill') {
						if (fsTask) {
							try { await fetch(`/api/tasks/${encodeURIComponent(fsTask.id)}/close`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'Abandoned via Close & Kill' }) }); } catch (e) { console.warn('[TasksActive] Failed to close task:', e); }
						}
						fullscreenSession = null;
						await handleKillSession(sName);
					}
				}}
				onViewTask={(taskId) => onViewTask?.(taskId)}
			/>
		{/if}
	</div>
	{:else}
	<div class="sessions-table-wrapper">
		<!-- "All done" flash overlay -->
		{#if allDoneFlash}
			<div class="all-done-overlay">
				<div class="all-done-content">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="all-done-icon">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span class="all-done-text">All caught up!</span>
				</div>
			</div>
		{/if}
		<table class="sessions-table">
			<thead>
				<tr>
					<th class="th-task">Task</th>
					<th class="th-status">Status</th>
				</tr>
			</thead>
			<tbody>
				{#each orderedSessions as { session, isExiting, isNew, hadTaskOnEntry } (session.name)}
					{@const typeBadge = getTypeBadge(session.type)}
					{@const isExpanded = expandedSession === session.name}
					{@const isCollapsing = collapsingSession === session.name}
					{@const sessionAgentName = getAgentName(session.name)}
					{@const sessionTask = agentTasks.get(sessionAgentName) || (isExiting ? cachedAgentTasks.get(sessionAgentName) : null)}
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
					{@const isPlanning = effectiveState === 'planning'}
					<tr
						class="session-row {isNew ? 'animate-slide-in-fwd-center' : ''} {isExiting ? 'animate-slide-out-bck-center exit-delayed' : ''}"
						class:attached={session.attached}
						class:expanded={isExpanded}
						class:expandable={!isExiting}
						class:planning={isPlanning}
						style="{rowProjectColor ? `border-left: 3px solid ${rowProjectColor};` : isPlanning ? 'border-left: 3px solid oklch(0.68 0.20 270);' : ''}{isExiting ? ' pointer-events: none;' : ''}"
						onclick={() => !isExiting && toggleExpanded(session.name)}
						oncontextmenu={(e) => !isExiting && handleContextMenu(session, e)}
					>
						<!-- Column 1: TaskIdBadge + Title + Description (merged) -->
						<td class="td-task">
							{#if session.type === 'server'}
								<!-- Server session display -->
								<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
								<div class="server-row" onclick={(e) => e.stopPropagation()}>
									<ServerSessionBadge
										sessionName={session.name}
										project={session.project}
										status="running"
										created={session.created}
										size="xs"
										variant="projectPill"
										onAction={async (actionId) => {
											if (actionId === 'stop') {
												await handleKillSession(session.name);
											} else if (actionId === 'restart') {
												await handleKillSession(session.name);
											}
										}}
									/>
									<span class="session-name">{session.name}</span>
								</div>
							{:else}
								<!-- Agent session: TaskIdBadge with title/desc column -->
								<div class="task-cell-content">
									{#if sessionTask}
										{@const animateText = isNew && hadTaskOnEntry}
										<div class="badge-and-text">
											<TaskIdBadge
												task={sessionTask}
												size="sm"
												variant="agentPill"
												agentName={sessionAgentName}
												showType={true}
												{statusDotColor}
												integration={taskIntegrations[sessionTask.id] || null}
												animate={isNew && hadTaskOnEntry}
												resumed={session.resumed}
												attached={session.attached}
												exiting={isExiting}
												harness={getTaskHarness(sessionTask)}
												browserPort={browserSessions.get(sessionAgentName) || undefined}
											/>
											<div class="text-column">
												<span class="task-title {animateText ? 'tracking-in-expand' : ''}" style={animateText ? 'animation-delay: 100ms;' : ''} title={sessionTask.title}>
													<FxText text={sessionTask.title || sessionTask.id} context={activeTaskCtx(sessionTask)} />
												</span>
												{#if sessionTask.description}
													<div class="task-description {animateText ? 'tracking-in-expand' : ''}" style={animateText ? 'animation-delay: 100ms;' : ''}>
														<FxText text={sessionTask.description} context={activeTaskCtx(sessionTask)} />
													</div>
												{/if}
											</div>
										</div>
									{:else}
										<!-- No task - planning pill matching agentPill aesthetic -->
										{@const planningColor = effectiveState === 'planning' ? 'oklch(0.68 0.20 270)' : (rowProjectColor || 'oklch(0.50 0.02 250)')}
										<div class="badge-and-text">
											<div class="inline-flex flex-col items-start flex-shrink-0">
												<button
													class="planning-pill {isNew ? 'tracking-in-expand' : ''}"
													style="background: color-mix(in oklch, {planningColor} 12%, transparent); border: 1px solid color-mix(in oklch, {planningColor} 30%, transparent); color: {planningColor};{isNew ? ' animation-delay: 100ms;' : ''}"
													onclick={(e) => e.stopPropagation()}
												>
													<AgentAvatar name={sessionAgentName} size={20} showRing={true} sessionState={effectiveState} showGlow={true} exiting={isExiting} />
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
						<!-- Column 3: Status (StatusActionBadge) -->
						<td class="td-status" onclick={(e) => e.stopPropagation()}>
							{#if session.type === 'agent'}
								{@const reviewStatus = sessionTask ? computeReviewStatus(sessionTask, getReviewRules()) : null}
								{@const reviewBasedDefault = reviewStatus?.action !== 'auto'}
								{@const autoCompleteDisabled = autoCompleteDisabledMap.get(session.name) ?? reviewBasedDefault}
								<div class="status-cell-content">
								<StatusActionBadge
										sessionState={effectiveState as SessionState}
										{elapsed}
										stacked={true}
										sessionName={session.name}
										alignRight={true}
										animate={isNew}
										showCommands={true}
										showEpic={true}
										onCommand={(cmd) => sendWorkflowCommand(session.name, cmd)}
										onAction={async (actionId) => {
											if (actionId === 'attach') {
												await handleAttachSession(session.name);
											} else if (actionId === 'kill' || actionId === 'cleanup') {
												await handleKillSession(session.name);
											} else if (actionId === 'view-task' && sessionTask) {
												onViewTask?.(sessionTask.id);
											} else if (actionId === 'complete' || actionId === 'complete-kill') {
												// INSTANT UI UPDATE - set optimistic state immediately
												optimisticStates.set(session.name, 'completing');
												optimisticStates = new Map(optimisticStates); // trigger reactivity
												console.log('[TasksActive] Set optimistic completing state for:', session.name);

												// Also write signal for persistence/other clients
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
														console.warn('[TasksActive] Failed to write completing signal:', e);
													}
												}
												// Now call the actual command
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
												// Close task immediately and kill session (skip completion)
												if (sessionTask) {
													try {
														await fetch(`/api/tasks/${encodeURIComponent(sessionTask.id)}/close`, {
															method: 'POST',
															headers: { 'Content-Type': 'application/json' },
															body: JSON.stringify({ reason: 'Abandoned via Close & Kill' })
														});
													} catch (e) {
														console.warn('[TasksActive] Failed to close task:', e);
													}
												}
												await handleKillSession(session.name);
											} else if (actionId === 'pause') {
												// Pause session: write paused signal and kill tmux session
												// INSTANT UI UPDATE - set optimistic state immediately
												optimisticStates.set(session.name, 'paused');
												optimisticStates = new Map(optimisticStates); // trigger reactivity
												console.log('[TasksActive] Set optimistic paused state for:', session.name);

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
														console.warn('[TasksActive] Failed to pause session:', e);
													}
												} else {
													// No task - just kill the session
													await handleKillSession(session.name);
												}
											}
										}}
										task={sessionTask ? { id: sessionTask.id, issue_type: sessionTask.issue_type, priority: sessionTask.priority } : null}
										project={session.project || null}
										onViewEpic={(epicId) => {
											onViewTask?.(epicId);
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
								<!-- Non-agent sessions: simple buttons -->
								<div class="action-buttons">
									<button
										class="action-btn attach"
										onclick={() => handleAttachSession(session.name)}
										disabled={actionLoading === session.name}
										title="Open in terminal"
									>
										{#if actionLoading === session.name}
											<span class="loading loading-spinner loading-xs"></span>
										{:else}
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="action-icon">
												<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
											</svg>
										{/if}
									</button>
									<button
										class="action-btn kill"
										onclick={() => handleKillSession(session.name)}
										disabled={actionLoading === session.name}
										title="Kill session"
									>
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="action-icon">
											<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							{/if}
						</td>
					</tr>
					<!-- Expanded SessionCard row -->
					{#if isExpanded}
						{@const expandedAgentName = getAgentName(session.name)}
						{@const expandedTask = agentTasks.get(expandedAgentName)}
						{@const expandedSessionInfo = agentSessionInfo.get(expandedAgentName)}
						<tr class="expanded-row {isExiting ? 'animate-slide-out-bck-top' : ''}" style={isExiting ? 'pointer-events: none;' : ''}>
							<td colspan="2" class="expanded-content">
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									class="expanded-session-wrapper"
									class:with-task-panel={expandedTask && taskDetailOpen && expandedTaskId === expandedTask.id}
									class:collapsing={isCollapsing}
									bind:this={splitResizeContainer}
									oncontextmenu={(e) => !isExiting && handleContextMenu(session, e)}
								>
									<!-- SessionCard section -->
									<div class="session-card-section" style={expandedTask && taskDetailOpen && expandedTaskId === expandedTask.id ? `flex: 0 0 ${sessionPanelPercent}%;` : ''}>
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
													handleKillSession(session.name);
												}}
												onInterrupt={() => {
													fetch(`/api/work/${encodeURIComponent(session.name)}/input`, {
														method: 'POST',
														headers: { 'Content-Type': 'application/json' },
														body: JSON.stringify({ type: 'ctrl-c' })
													});
												}}
												onAttachTerminal={() => handleAttachSession(session.name)}
												onTaskClick={(taskId) => {
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
												onFileAttachedToTask={(taskId) => {
													// Refresh task details to show new attachment
													if (expandedTaskId === taskId) {
														fetchExpandedTaskDetails(taskId);
													}
												}}
												onLLMFileResult={(filename, content) => {
													llmFileName = filename;
													llmFileContent = content;
													llmFileProject = agentProjects.get(expandedAgentName) || '';
													llmFileSaved = false;
													llmFileValidation = { status: 'idle', message: null };
													llmFileDrawerOpen = true;
													// Validate initial filename
													validateLlmFilePath(filename);
												}}
												onCtrlEnterSubmit={() => {
													// Collapse just this session row with proper animation
													// (same pattern as toggleExpanded)
													collapsingSession = session.name;
													if (outputPollInterval) {
														clearInterval(outputPollInterval);
														outputPollInterval = null;
													}
													setTimeout(() => {
														expandedSession = null;
														expandedOutput = '';
														collapsingSession = null;

														// Find and expand the next session in the list
														const sessions = orderedSessions;
														const currentIndex = sessions.findIndex(s => s.session.name === session.name);
														let foundNext = false;
														if (currentIndex >= 0) {
															// Look for the next non-exiting session
															for (let i = currentIndex + 1; i < sessions.length; i++) {
																if (!sessions[i].isExiting) {
																	expandInline(sessions[i].session.name);
																	foundNext = true;
																	break;
																}
															}
														}
														// If no next session found, show "all done" flash
														if (!foundNext) {
															allDoneFlash = true;
															setTimeout(() => {
																allDoneFlash = false;
															}, 2000);
														}
													}, 200);
												}}
												onCtrlShiftEnterSubmit={() => {
													// Collapse and go to PREVIOUS session
													collapsingSession = session.name;
													if (outputPollInterval) {
														clearInterval(outputPollInterval);
														outputPollInterval = null;
													}
													setTimeout(() => {
														expandedSession = null;
														expandedOutput = '';
														collapsingSession = null;

														// Find and expand the previous session in the list
														const sessions = orderedSessions;
														const currentIndex = sessions.findIndex(s => s.session.name === session.name);
														let foundPrev = false;
														if (currentIndex > 0) {
															// Look for the previous non-exiting session
															for (let i = currentIndex - 1; i >= 0; i--) {
																if (!sessions[i].isExiting) {
																	expandInline(sessions[i].session.name);
																	foundPrev = true;
																	break;
																}
															}
														}
														// If no previous session found, show "all done" flash
														if (!foundPrev) {
															allDoneFlash = true;
															setTimeout(() => {
																allDoneFlash = false;
															}, 2000);
														}
													}, 200);
												}}
												onActionComplete={() => {
													// Collapse session after status action completes
													// (same pattern as onCtrlEnterSubmit)
													collapsingSession = session.name;
													if (outputPollInterval) {
														clearInterval(outputPollInterval);
														outputPollInterval = null;
													}
													setTimeout(() => {
														expandedSession = null;
														expandedOutput = '';
														collapsingSession = null;

														// Find and expand the next session in the list
														const sessions = orderedSessions;
														const currentIndex = sessions.findIndex(s => s.session.name === session.name);
														let foundNext = false;
														if (currentIndex >= 0) {
															// Look for the next non-exiting session
															for (let i = currentIndex + 1; i < sessions.length; i++) {
																if (!sessions[i].isExiting) {
																	expandInline(sessions[i].session.name);
																	foundNext = true;
																	break;
																}
															}
														}
														// If no next session found, show "all done" flash
														if (!foundNext) {
															allDoneFlash = true;
															setTimeout(() => {
																allDoneFlash = false;
															}, 2000);
														}
													}, 200);
												}}
											/>
										</div>
									</div>

									<!-- Horizontal resize handle between SessionCard and TaskDetailPane -->
									{#if expandedTask && taskDetailOpen && expandedTaskId === expandedTask.id}
										<!-- svelte-ignore a11y_no_static_element_interactions -->
										<div
											class="split-resize-handle"
											class:resizing={isSplitResizing}
											onmousedown={startSplitResize}
										>
											<div class="split-resize-bar"></div>
										</div>
									{/if}

									<!-- Inline Task Detail Panel -->
									{#if expandedTask && taskDetailOpen && expandedTaskId === expandedTask.id}
										<TaskDetailPane
											task={expandedTask}
											details={expandedTaskDetails}
											loading={taskDetailsLoading}
											height={expandedHeight}
											browserPort={browserSessions.get(expandedAgentName) || null}
											onViewTask={(taskId) => onViewTask?.(taskId)}
											onSaveDescription={async (taskId, description) => {
												await saveDescription(taskId, description);
											}}
											onSaveNotes={async (taskId, notes) => {
												notesValue = notes;
												await saveNotes(taskId);
											}}
											onUploadAttachment={handleUploadAttachment}
											onRemoveAttachment={handleRemoveAttachment}
											integration={taskIntegrations[expandedTask.id] || null}
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
	</div>
	{/if}
{/if}

<!-- LLM File Result Drawer -->
{#if llmFileDrawerOpen}
	<div class="drawer drawer-end z-50">
		<input id="llm-file-drawer" type="checkbox" class="drawer-toggle" checked />
		<div class="drawer-side">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
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
					<label class="text-xs text-base-content/60 mb-1 block">Save as:</label>
					<div class="flex items-center gap-1">
						<span class="text-xs text-base-content/40 font-mono shrink-0">~/code/{llmFileProject}/</span>
						<input
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
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="active-context-menu"
		class:active-context-menu-hidden={!ctxVisible}
		style="left: {ctxX}px; top: {ctxY}px;"
		onclick={(e) => e.stopPropagation()}
	>
		<!-- View Details -->
		{#if ctxData.task}
			<button class="active-context-menu-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxStateSubmenuOpen = false; }} onclick={() => { const id = ctxData!.task!.id; closeCtxMenu(); onViewTask?.(id); ctxData = null; }}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
					<circle cx="12" cy="12" r="3" />
				</svg>
				<span>View Details</span>
			</button>
		{/if}

		<!-- Attach Terminal -->
		<button class="active-context-menu-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxStateSubmenuOpen = false; }} onclick={() => { const name = ctxData!.session.name; closeCtxMenu(); handleAttachSession(name); ctxData = null; }}>
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
				onmouseenter={() => { ctxStatusSubmenuOpen = true; ctxStateSubmenuOpen = false; }}
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
						{#each [
							{ value: 'open', label: 'Open', color: 'oklch(0.70 0.15 220)' },
							{ value: 'in_progress', label: 'In Progress', color: 'oklch(0.75 0.15 85)' },
							{ value: 'blocked', label: 'Blocked', color: 'oklch(0.65 0.18 30)' },
							{ value: 'closed', label: 'Closed', color: 'oklch(0.65 0.18 145)' }
						] as status}
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
			onmouseenter={() => { ctxStateSubmenuOpen = true; ctxStatusSubmenuOpen = false; }}
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

		<!-- Duplicate -->
		{#if ctxData.task}
			<button class="active-context-menu-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxStateSubmenuOpen = false; }} onclick={() => ctxDuplicateTask(ctxData!.task!)}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
					<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
				</svg>
				<span>Duplicate</span>
			</button>
		{/if}

		<div class="active-context-menu-divider"></div>

		<!-- Interrupt -->
		<button class="active-context-menu-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxStateSubmenuOpen = false; }} onclick={async () => {
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

		<!-- Pause -->
		{#if ctxData.task}
			<button class="active-context-menu-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxStateSubmenuOpen = false; }} onclick={async () => {
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
		{#if ctxData.task}
			<button class="active-context-menu-item active-context-menu-item-success" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxStateSubmenuOpen = false; }} onclick={async () => {
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

		<!-- Kill Session -->
		<button class="active-context-menu-item active-context-menu-item-danger" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxStateSubmenuOpen = false; }} onclick={async () => {
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
			<span>Close & Kill</span>
		</button>
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

	/* "All done" flash overlay */
	.all-done-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: oklch(0.70 0.20 145 / 0.15);
		border-radius: 8px;
		z-index: 10;
		animation: all-done-fade 2s ease-out forwards;
		pointer-events: none;
	}

	.all-done-content {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 2rem;
		background: oklch(0.20 0.02 145);
		border: 2px solid oklch(0.55 0.18 145);
		border-radius: 12px;
		box-shadow: 0 0 30px oklch(0.55 0.18 145 / 0.4);
		animation: all-done-pop 0.3s ease-out;
	}

	.all-done-icon {
		width: 32px;
		height: 32px;
		color: oklch(0.75 0.20 145);
	}

	.all-done-text {
		font-size: 1.25rem;
		font-weight: 600;
		color: oklch(0.85 0.15 145);
		letter-spacing: 0.02em;
	}

	@keyframes all-done-fade {
		0% { opacity: 1; }
		70% { opacity: 1; }
		100% { opacity: 0; }
	}

	@keyframes all-done-pop {
		0% { transform: scale(0.8); opacity: 0; }
		50% { transform: scale(1.05); }
		100% { transform: scale(1); opacity: 1; }
	}

	/* Sessions table */
	.sessions-table-wrapper {
		position: relative;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 8px;
		/* NOTE: overflow-x: clip removed - it was clipping TaskIdBadge dropdowns (see jat-1xa13) */
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

	.sessions-table td {
		padding: 0.875rem 1rem;
		font-size: 0.85rem;
		color: oklch(0.75 0.02 250);
		vertical-align: middle;
	}

	/* Two-column layout widths */
	/* Task: takes remaining space (badge + title inline), Status: fixed width for StatusActionBadge */
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
		font-size: 0.9375rem;
		font-weight: 600;
		color: oklch(0.80 0.12 270);
		font-family: inherit;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.planning-description {
		font-size: 0.75rem;
		color: oklch(0.55 0.05 270);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.server-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		min-width: 0;
	}

	.task-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: oklch(0.85 0.02 250);
		font-family: inherit; /* Override table's monospace */
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
		min-width: 0;
	}

	.task-description {
		font-size: 0.75rem;
		color: oklch(0.65 0.05 200);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.agent-badge-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}

	.agent-name-inline {
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(0.70 0.02 250);
		white-space: nowrap;
	}

	/* Actions */
	.action-buttons {
		display: flex;
		gap: 0.375rem;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		background: oklch(0.22 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 4px;
		color: oklch(0.65 0.02 250);
		cursor: pointer;
		transition: all 0.15s;
	}

	.action-btn:hover:not(:disabled) {
		background: oklch(0.28 0.02 250);
		color: oklch(0.80 0.02 250);
	}

	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.action-btn.attach:hover:not(:disabled) {
		background: oklch(0.65 0.15 200 / 0.2);
		border-color: oklch(0.65 0.15 200 / 0.4);
		color: oklch(0.75 0.15 200);
	}

	.action-btn.kill:hover:not(:disabled) {
		background: oklch(0.65 0.15 30 / 0.2);
		border-color: oklch(0.65 0.15 30 / 0.4);
		color: oklch(0.75 0.15 30);
	}

	.action-icon {
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

	.session-row.planning {
		background: oklch(0.68 0.20 270 / 0.05);
	}

	.session-row.planning:hover {
		background: oklch(0.68 0.20 270 / 0.12);
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

	/* When task panel is showing, flex is controlled by inline style for resizable width */
	/* The inline style sets flex: 0 0 {sessionPanelPercent}% */

	/* Horizontal split resize handle (between SessionCard and TaskDetailPane) */
	.split-resize-handle {
		flex-shrink: 0;
		width: 8px;
		cursor: ew-resize;
		background: oklch(0.18 0.01 250);
		border-left: 1px solid oklch(0.25 0.02 250);
		border-right: 1px solid oklch(0.25 0.02 250);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s;
		user-select: none;
	}

	.split-resize-handle:hover {
		background: oklch(0.22 0.02 250);
	}

	.split-resize-handle.resizing {
		background: oklch(0.25 0.04 200);
	}

	.split-resize-bar {
		width: 4px;
		height: 40px;
		background: oklch(0.35 0.02 250);
		border-radius: 2px;
		transition: background 0.15s, height 0.15s;
	}

	.split-resize-handle:hover .split-resize-bar {
		background: oklch(0.50 0.02 250);
		height: 60px;
	}

	.split-resize-handle.resizing .split-resize-bar {
		background: oklch(0.65 0.12 200);
		height: 80px;
	}

	/* TaskDetailPane fills remaining space in split view */
	.expanded-session-wrapper.with-task-panel :global(.task-detail-panel) {
		flex: 1;
		min-width: 0;
		border-left: 1px solid oklch(0.25 0.02 250);
		border-top: none;
		border-radius: 8px;
	}

	/* Override SessionCard styles when embedded in table */
	.expanded-session-card :global(.session-card) {
		border-radius: 8px;
		border: 1px solid oklch(0.28 0.02 250);
		max-width: none;
		width: 100%;
	}

	/* Vertical resize divider */
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
		.sessions-table th,
		.sessions-table td {
			padding: 0.625rem 0.75rem;
		}
	}

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
		border-radius: 0.375rem;
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

	/* Delay row exit animation so avatar flip-out plays first */
	.exit-delayed {
		animation-delay: 0.25s;
		animation-fill-mode: both;
	}

	/* ========== MOBILE LAYOUT ========== */

	.mobile-sessions-list {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.mobile-session-card {
		position: relative;
		z-index: 1;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-bottom: none;
		border-radius: 0;
		padding: 0.25rem 0.75rem;
		cursor: pointer;
		transition: background 0.15s;
		touch-action: pan-y;
		will-change: transform;
	}

	.mobile-session-card:first-child {
		border-radius: 8px 8px 0 0;
	}

	.mobile-session-card:last-child {
		border-radius: 0 0 8px 8px;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.mobile-session-card:only-child {
		border-radius: 8px;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.mobile-session-card:active {
		background: oklch(0.20 0.02 250);
	}

	.mobile-session-card.attached {
		border-color: oklch(0.55 0.15 145 / 0.5);
		background: oklch(0.65 0.15 145 / 0.06);
	}

	/* Row 1: Title + Status side by side */
	.mobile-card-row1 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}

	.mobile-left {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.mobile-title {
		min-width: 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: oklch(0.88 0.02 250);
		font-family: system-ui, -apple-system, sans-serif;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.mobile-status {
		flex-shrink: 0;
	}

	/* Row 2: Compact metadata line */
	.mobile-card-row2 {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-top: 0;
		font-size: 0.6875rem;
		font-family: ui-monospace, monospace;
		color: oklch(0.55 0.02 250);
	}

	.mobile-agent-name {
		font-weight: 500;
		color: oklch(0.65 0.02 250);
	}

	.mobile-separator {
		color: oklch(0.40 0.01 250);
	}

	.mobile-task-id {
		font-weight: 600;
	}

	.mobile-elapsed {
		font-weight: 500;
		color: oklch(0.60 0.02 250);
		font-variant-numeric: tabular-nums;
	}

	.mobile-type-icon {
		font-size: 0.625rem;
		line-height: 1;
	}

	.mobile-harness {
		display: inline-flex;
		align-items: center;
	}

	.mobile-age {
		font-weight: 600;
		font-size: 0.5625rem;
	}

	.mobile-priority {
		font-weight: 700;
		font-size: 0.625rem;
		padding: 0 0.25rem;
		border-radius: 3px;
	}

	.mobile-priority-0 {
		color: oklch(0.80 0.18 25);
		background: oklch(0.80 0.18 25 / 0.12);
	}

	.mobile-priority-1 {
		color: oklch(0.80 0.15 85);
		background: oklch(0.80 0.15 85 / 0.12);
	}

	.mobile-priority-2 {
		color: oklch(0.70 0.12 200);
		background: oklch(0.70 0.12 200 / 0.12);
	}

	.mobile-project {
		font-weight: 500;
		color: oklch(0.60 0.05 250);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.mobile-port {
		font-size: 0.625rem;
		color: oklch(0.75 0.15 55);
	}

	/* ========== SWIPE-TO-REVEAL ========== */

	.swipe-container {
		position: relative;
		overflow: hidden;
	}

	.swipe-container:first-child .mobile-session-card {
		border-radius: 8px 8px 0 0;
	}

	.swipe-container:last-child .mobile-session-card {
		border-radius: 0 0 8px 8px;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.swipe-container:only-child .mobile-session-card {
		border-radius: 8px;
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

	.mobile-session-card.swiping {
		/* Disable :active state during swipe */
		background: oklch(0.16 0.01 250);
	}

	.mobile-session-card.swiping.attached {
		background: oklch(0.65 0.15 145 / 0.06);
	}

	/* Override first/last/only-child on .mobile-session-card since .swipe-container owns that now */
	.mobile-session-card:first-child {
		border-radius: 0;
	}
	.mobile-session-card:last-child {
		border-radius: 0;
		border-bottom: none;
	}
	.mobile-session-card:only-child {
		border-radius: 0;
		border-bottom: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.mobile-session-card {
			transition: none !important;
		}
		.swipe-tray {
			transition: none !important;
		}
	}

	/* Expanded card within mobile */
	.mobile-expanded-card {
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-top: none;
		border-radius: 0 0 8px 8px;
		margin-top: -0.5rem;
		padding-top: 0.5rem;
		overflow: hidden;
	}
</style>
