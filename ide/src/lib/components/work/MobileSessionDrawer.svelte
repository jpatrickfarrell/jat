<script lang="ts">
	/**
	 * MobileSessionDrawer Component
	 *
	 * Full-screen drawer with horizontal pager for mobile session viewing.
	 * Slides in from right. Contains swipeable pages:
	 *   Page 0: Terminal (MobileTerminal — lightweight ANSI output + question UI)
	 *   Page 1: Task Detail (task info, description, status)
	 *
	 * Swipe gestures:
	 *   - Right-to-left: next page
	 *   - Left-to-right on page 0: dismiss drawer
	 *   - Left-to-right on page 1+: previous page
	 *
	 * Used by /tasks route for mobile session viewing.
	 */

	import { onMount, onDestroy } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import MobileTerminal from '$lib/components/work/MobileTerminal.svelte';
	import EventStack from '$lib/components/work/EventStack.svelte';
	import AgentAvatar from '$lib/components/AgentAvatar.svelte';
	import MobileTaskBody from '$lib/components/work/atoms/MobileTaskBody.svelte';
	import PromptInput from '$lib/components/quick-commands/PromptInput.svelte';
	import { getElapsedFormatted } from '$lib/utils/elapsedTime';
	import {
		TaskFieldLabel,
		TaskFieldGrid,
		TaskFieldCell,
		TaskHeaderBlock,
		TaskMetaRow,
		TaskLabelsList,
		DependencyList,
		TaskDatesPair
	} from '$lib/components/task';
	import { isMobileFullscreenOpen } from '$lib/stores/drawerStore';
	import CommentsThread from '$lib/components/comments/CommentsThread.svelte';
	import { setHoveredSession } from '$lib/stores/hoveredSession';
	import { marked } from 'marked';
	import type { SessionState, SessionStateAction } from '$lib/config/statusColors';
	import { getIssueTypeVisual, getSessionStateVisual } from '$lib/config/statusColors';
	import { STATUS_OPTIONS } from '$lib/config/task-statuses';
	import { getActions, loadUserConfig, getIsLoaded } from '$lib/stores/stateActionsConfig.svelte';
	import {
		playTaskCompleteSound,
		playCleanupSound,
		playKillSound,
		playInterruptSound,
		playAttachSound,
		playSuccessChime,
		playErrorSound,
		initAudioOnInteraction
	} from '$lib/utils/soundEffects';

	/** Split an agent name on camelCase boundaries: "GentleCoast" → ["Gentle", "Coast"]. */
	function splitAgentName(name: string): string[] {
		if (!name) return [];
		return name.replace(/([a-z])([A-Z])/g, '$1\u0000$2').split('\u0000');
	}

	interface AgentTask {
		id: string;
		title?: string;
		status: string;
		priority?: number;
		issue_type?: string;
		description?: string;
	}

	// Props
	let {
		sessionName = '',
		agentName = '',
		task = null as AgentTask | null,
		sessionState = 'idle' as SessionState,
		project = null as string | null,
		tokens = 0,
		cost = 0,
		sseState = undefined as string | undefined,
		sseStateTimestamp = undefined as number | undefined,
		created = '',
		attached = false,
		onClose = () => {},
		onKillSession = async () => {},
		onAttachSession = async () => {},
		onViewTask = (_taskId: string) => {},
		onSendInput = async (_text: string, _type?: string) => {},
		onAction = async (_actionId: string) => {},
	}: {
		sessionName?: string;
		agentName?: string;
		task?: AgentTask | null;
		sessionState?: SessionState;
		project?: string | null;
		tokens?: number;
		cost?: number;
		sseState?: string | undefined;
		sseStateTimestamp?: number | undefined;
		created?: string;
		attached?: boolean;
		onClose?: () => void;
		onKillSession?: () => Promise<void>;
		onAttachSession?: () => Promise<void>;
		onViewTask?: (taskId: string) => void;
		onSendInput?: (text: string, type?: string) => Promise<void>;
		onAction?: (actionId: string) => Promise<void>;
	} = $props();

	// === Page State ===
	const PAGES = ['Terminal', 'Task Detail', 'Attachments', 'Notes'] as const;
	let currentPage = $state(0);
	let tabRefs = $state<HTMLButtonElement[]>([]);
	let indicatorLeft = $state(0);
	let indicatorWidth = $state(0);

	$effect(() => {
		const el = tabRefs[currentPage];
		if (el) {
			indicatorLeft = el.offsetLeft;
			indicatorWidth = el.offsetWidth;
		}
	});
	let pageTranslateX = $state(0); // drag offset during swipe
	let pageTransitioning = $state(false);

	// Visibility animation state
	let visible = $state(false);

	// Load user action config on mount
	$effect(() => {
		if (!getIsLoaded()) {
			loadUserConfig();
		}
	});

	// Optimistic answer state: set to 'working' when user submits a needs_input answer,
	// cleared when SSE confirms the session is no longer in needs-input state.
	let optimisticAnswerState = $state<SessionState | null>(null);

	// Clear optimistic state once SSE has caught up (session is no longer needs-input).
	$effect(() => {
		if (optimisticAnswerState !== null && sseState !== 'needs-input') {
			optimisticAnswerState = null;
		}
	});

	// Compute effective state: closed tasks → 'completed', optimistic answer → override SSE
	const effectiveState = $derived(
		(task?.status === 'closed' ? 'completed' : (optimisticAnswerState || sseState || sessionState || 'idle')) as SessionState
	);

	// Dynamic actions from configurable state actions (same system as MobileSessionFullscreen)
	const MOBILE_PILL_ACTIONS = new Set(['complete', 'complete-kill', 'cleanup', 'pause', 'interrupt', 'attach', 'kill', 'escape', 'convert-to-tasks']);
	const stateActions = $derived.by(() => {
		const actions = getActions(effectiveState);
		return actions.filter(a => MOBILE_PILL_ACTIONS.has(a.id));
	});

	// Track which action button is currently animating
	let activeActionId = $state<string | null>(null);

	// Hold-to-confirm for destructive pills (kill, complete, complete-kill)
	const DESTRUCTIVE_ACTIONS = new Set(['kill', 'complete', 'complete-kill']);
	const HOLD_DURATION_MS = 600;
	const HOLD_TICK_MS = 30;
	let holdActionId = $state<string | null>(null);
	let holdProgress = $state(0);
	let holdTimer: ReturnType<typeof setInterval> | null = null;
	let pillPointerLocked = $state(false);

	function armPillPointerLock() {
		pillPointerLocked = true;
		const release = () => {
			pillPointerLocked = false;
			window.removeEventListener('pointerup', release, true);
			window.removeEventListener('pointercancel', release, true);
		};
		window.addEventListener('pointerup', release, true);
		window.addEventListener('pointercancel', release, true);
	}

	function startHold(action: SessionStateAction) {
		if (pillPointerLocked) return;
		if (!DESTRUCTIVE_ACTIONS.has(action.id)) {
			executePillAction(action);
			return;
		}
		clearHold();
		holdActionId = action.id;
		holdProgress = 0;
		let elapsed = 0;
		holdTimer = setInterval(() => {
			elapsed += HOLD_TICK_MS;
			holdProgress = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
			if (elapsed >= HOLD_DURATION_MS) {
				const a = action;
				clearHold();
				armPillPointerLock();
				executePillAction(a);
			}
		}, HOLD_TICK_MS);
	}

	function clearHold() {
		if (holdTimer) {
			clearInterval(holdTimer);
			holdTimer = null;
		}
		holdActionId = null;
		holdProgress = 0;
	}

	// Map action ID to appropriate sound
	function playActionSound(actionId: string): void {
		initAudioOnInteraction();
		switch (actionId) {
			case 'complete':
			case 'complete-kill':
				playTaskCompleteSound();
				break;
			case 'cleanup':
				playCleanupSound();
				break;
			case 'kill':
				playKillSound();
				break;
			case 'interrupt':
			case 'escape':
				playInterruptSound();
				break;
			case 'pause':
				playErrorSound();
				break;
			case 'attach':
				playAttachSound();
				break;
			case 'convert-to-tasks':
				playSuccessChime();
				break;
			default:
				break;
		}
	}

	// Pill color mapping from action variant → DaisyUI token classes
	function getPillColorClass(variant: SessionStateAction['variant']): string {
		switch (variant) {
			case 'success': return 'text-success border-success/50 bg-success/15';
			case 'error': return 'text-error border-error/50 bg-error/15';
			case 'warning': return 'text-warning border-warning/50 bg-warning/15';
			case 'info': return 'text-info border-info/50 bg-info/15';
			default: return 'text-base-content/80 border-base-300 bg-base-200';
		}
	}

	// Execute a pill action — plays unique sound, flashes button, then dismisses drawer
	async function executePillAction(action: SessionStateAction) {
		// 1. Play unique sound for this action type
		playActionSound(action.id);

		// 2. Trigger button flash animation
		activeActionId = action.id;
		setTimeout(() => { activeActionId = null; }, 300);

		// 3. Execute the action
		if (action.id === 'interrupt') {
			sendKey('ctrl-c');
		} else if (action.id === 'attach') {
			onAttachSession();
		} else if (action.id === 'kill') {
			onKillSession();
		} else if (action.id === 'cleanup') {
			if (task?.id) {
				try {
					await fetch(`/api/tasks/${encodeURIComponent(task.id)}/close`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ reason: 'Cleaned up session' })
					});
				} catch (e) {
					console.warn('[MobileSessionDrawer] Failed to close task:', e);
				}
			}
			await onKillSession();
		} else if (action.id === 'complete') {
			await onSendInput('/jat:complete', 'text');
		} else if (action.id === 'complete-kill') {
			// Send /jat:complete --kill command - agent will emit forceKill:true in bundle
			// IDE will then show 15-second countdown before killing the tmux session
			await onSendInput('/jat:complete --kill', 'text');
		} else {
			await onAction(action.id);
		}

		// 4. Dismiss drawer after button flash animation completes
		setTimeout(dismissDrawer, 180);
	}

	// Completion signal events (for completed state)
	interface TimelineEvent {
		type: string;
		session_id: string;
		tmux_session: string;
		timestamp: string;
		state?: string;
		task_id?: string;
		data?: any;
	}
	type CompletionLoadState = 'idle' | 'loading' | 'loaded' | 'empty';
	let completionEvents = $state<TimelineEvent[]>([]);
	let completionLoadState = $state<CompletionLoadState>('idle');
	let completionFetchedFor = $state<string | null>(null);

	async function fetchCompletionEvents() {
		if (!agentName) return;
		if (completionFetchedFor === agentName) return;
		completionLoadState = 'loading';
		completionFetchedFor = agentName;
		try {
			// No taskId filter — get the latest complete/review event for this session
			// (task.id in the prop may not match the signal's task_id)
			const res = await fetch(
				`/api/sessions/${encodeURIComponent(agentName)}/timeline?limit=50&type=complete,review`
			);
			if (!res.ok) { completionLoadState = 'empty'; return; }
			const data = await res.json();
			const fetched: TimelineEvent[] = data.events || [];
			if (fetched.length === 0) { completionLoadState = 'empty'; }
			else { completionEvents = fetched; completionLoadState = 'loaded'; }
		} catch { completionLoadState = 'empty'; }
	}

	// Fetch completion events when state becomes completed
	$effect(() => {
		if (effectiveState === 'completed' && agentName) {
			fetchCompletionEvents();
		}
	});

	// Terminal output state
	let output = $state('');
	let pollInterval: ReturnType<typeof setInterval> | null = null;

	// Full task detail (fetched from API)
	let fullTask = $state<Record<string, any> | null>(null);
	let taskLoading = $state(false);

	// Inline edit state — which field (if any) is currently being edited
	type EditMode = 'none' | 'status' | 'priority' | 'labels' | 'title' | 'description';
	let editMode = $state<EditMode>('none');
	let editDraft = $state('');
	let editSaving = $state(false);
	let editError = $state<string | null>(null);

	const PRIORITY_OPTIONS = [
		{ value: 0, label: 'P0 — Critical' },
		{ value: 1, label: 'P1 — High' },
		{ value: 2, label: 'P2 — Medium' },
		{ value: 3, label: 'P3 — Low' },
		{ value: 4, label: 'P4 — Lowest' }
	];

	function openEditor(mode: EditMode) {
		if (!task) return;
		editError = null;
		editMode = mode;
		if (mode === 'title') {
			editDraft = task.title || '';
		} else if (mode === 'description') {
			editDraft = (fullTask?.description ?? task.description ?? '') as string;
		} else if (mode === 'labels') {
			editDraft = (fullTask?.labels || []).join(', ');
		} else if (mode === 'notes') {
			editDraft = (fullTask?.notes ?? '') as string;
		} else {
			editDraft = '';
		}
	}

	function closeEditor() {
		editMode = 'none';
		editDraft = '';
		editError = null;
	}

	async function patchTask(body: Record<string, any>): Promise<boolean> {
		if (!task?.id) return false;
		editSaving = true;
		editError = null;
		try {
			const resp = await fetch(`/api/tasks/${encodeURIComponent(task.id)}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!resp.ok) {
				const data = await resp.json().catch(() => ({}));
				throw new Error(data?.message || 'Failed to save');
			}
			const data = await resp.json();
			const updated = data.task || data;
			if (task) {
				task = { ...task, ...updated };
			}
			fullTask = { ...(fullTask || {}), ...updated };
			playSuccessChime();
			return true;
		} catch (err: any) {
			editError = err?.message || 'Failed to save';
			playErrorSound();
			return false;
		} finally {
			editSaving = false;
		}
	}

	async function saveStatus(value: string) {
		if (await patchTask({ status: value })) closeEditor();
	}

	async function savePriority(value: number) {
		if (await patchTask({ priority: value })) closeEditor();
	}

	async function saveTitle() {
		const trimmed = editDraft.trim();
		if (!trimmed) {
			editError = 'Title cannot be empty';
			return;
		}
		if (await patchTask({ title: trimmed })) closeEditor();
	}

	async function saveDescription() {
		if (await patchTask({ description: editDraft })) closeEditor();
	}

	async function saveNotes() {
		if (await patchTask({ notes: editDraft })) closeEditor();
	}

	async function saveLabels() {
		const labels = editDraft
			.split(',')
			.map(l => l.trim())
			.filter(Boolean);
		if (await patchTask({ labels })) closeEditor();
	}

	// Mobile input state
	let inputText = $state('');
	let promptRefs = $state<Array<{ path: string; name: string }>>([]);
	let keyboardOpen = $state(false);
	let inputRef: { focus: (opts?: { preventScroll?: boolean }) => void } | null = $state(null);

	// Draft persistence — debounce timer for autosave
	let mainDraftTimer: ReturnType<typeof setTimeout> | null = null;

	// Pending file attachments (staged before sending)
	interface PendingAttachment {
		id: string;
		name: string;
		previewUrl: string | null;
		path: string;
		uploading: boolean;
	}
	let pendingAttachments = $state<PendingAttachment[]>([]);
	const hasSendable = $derived(inputText.trim().length > 0 || pendingAttachments.some(a => !a.uploading));
	let sentFlash = $state(false);      // full flash: recede + close
	let sentStayFlash = $state(false);  // brief flash: button+row only, stay open

	// Message history (per session, persisted to localStorage)
	let sentHistory = $state<string[]>([]);
	let historyIndex = $state(-1);       // -1 = not browsing history
	let historyBuffer = $state('');      // saved current input when browsing history

	function loadHistory() {
		if (!sessionName || typeof localStorage === 'undefined') return;
		try {
			const saved = localStorage.getItem(`jat-input-history-${sessionName}`);
			if (saved) sentHistory = JSON.parse(saved);
		} catch { /* ignore */ }
	}

	function pushToHistory(text: string) {
		if (!text.trim()) return;
		// Don't duplicate last entry
		if (sentHistory.length > 0 && sentHistory[sentHistory.length - 1] === text) return;
		sentHistory = [...sentHistory, text].slice(-50);
		if (sessionName && typeof localStorage !== 'undefined') {
			try { localStorage.setItem(`jat-input-history-${sessionName}`, JSON.stringify(sentHistory)); } catch { /* ignore */ }
		}
	}

	async function sendWithStay() {
		if (!hasSendable) return;
		await sendWithAttachments();
		sentStayFlash = true;
		setTimeout(() => { sentStayFlash = false; }, 420);
		historyIndex = -1;
	}

	async function sendBroadcast() {
		if (!hasSendable) return;
		const text = inputText.trim();
		await sendWithAttachments(); // sends to current session
		// Broadcast to all other active sessions
		try {
			const resp = await fetch('/api/work');
			const data = await resp.json();
			const sessions: Array<{ sessionName: string }> = data.sessions || [];
			for (const session of sessions) {
				if (session.sessionName === sessionName) continue;
				try {
					await fetch(`/api/work/${encodeURIComponent(session.sessionName)}/input`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ type: 'text', input: text })
					});
				} catch { /* ignore */ }
				await new Promise(r => setTimeout(r, 60));
			}
		} catch { /* ignore */ }
		sentStayFlash = true;
		setTimeout(() => { sentStayFlash = false; }, 420);
		historyIndex = -1;
	}

	async function sendAndDismiss() {
		if (!hasSendable) return;
		await sendWithAttachments();
		sentFlash = true;
		setTimeout(() => dismissDrawer(), 320);
		historyIndex = -1;
	}

	// Markdown preview toggle
	let showPreview = $state(false);
	const renderedMarkdown = $derived.by(() => {
		if (!showPreview || !inputText.trim()) return '';
		return marked.parse(inputText) as string;
	});

	// Elapsed time — 1s tick so HH:MM:SS matches TasksActive swipe cards exactly.
	let now = $state(Date.now());
	$effect(() => {
		const interval = setInterval(() => now = Date.now(), 1000);
		return () => clearInterval(interval);
	});
	const elapsed = $derived(getElapsedFormatted(created, now));

	// Drag-and-drop state
	let isDragOver = $state(false);

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		const hasFiles = e.dataTransfer?.types.includes('Files');
		const hasJatImage = e.dataTransfer?.types.includes('application/x-jat-image');
		const hasJatText = e.dataTransfer?.types.includes('application/x-jat-text');
		const hasText = e.dataTransfer?.types.includes('text/plain');
		if (hasFiles || hasJatImage || hasJatText || hasText) {
			isDragOver = true;
			e.dataTransfer!.dropEffect = 'copy';
		}
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		const relatedTarget = e.relatedTarget as HTMLElement | null;
		if (!relatedTarget || !e.currentTarget || !(e.currentTarget as HTMLElement).contains(relatedTarget)) {
			isDragOver = false;
		}
	}

	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		const hasFiles = e.dataTransfer?.types.includes('Files');
		const hasJatImage = e.dataTransfer?.types.includes('application/x-jat-image');
		const hasJatText = e.dataTransfer?.types.includes('application/x-jat-text');
		const hasText = e.dataTransfer?.types.includes('text/plain');
		if (hasFiles || hasJatImage || hasJatText || hasText) {
			isDragOver = true;
		}
	}

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDragOver = false;

		// JAT image path (dragged from TaskDetailPane thumbnails)
		const jatImageData = e.dataTransfer?.getData('application/x-jat-image');
		if (jatImageData) {
			try {
				const imageInfo = JSON.parse(jatImageData);
				if (imageInfo.path) {
					await onSendInput(imageInfo.path, 'text');
					return;
				}
			} catch { /* fall through */ }
		}

		// JAT text data (dragged description/notes from TaskDetailPane)
		const jatTextData = e.dataTransfer?.getData('application/x-jat-text');
		if (jatTextData) {
			try {
				const textInfo = JSON.parse(jatTextData);
				if (textInfo.content) {
					inputText = inputText.trim() ? inputText.trim() + '\n\n' + textInfo.content : textInfo.content;
					inputRef?.focus({ preventScroll: true });
					return;
				}
			} catch { /* fall through */ }
		}

		// Plain text path (fallback for image paths)
		const plainText = e.dataTransfer?.getData('text/plain');
		if (plainText && plainText.startsWith('/') && !e.dataTransfer?.files?.length) {
			const isImagePath = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(plainText);
			if (isImagePath) {
				await onSendInput(plainText, 'text');
				return;
			}
		}

		// File drops - upload and send path to session
		if (e.dataTransfer?.files?.length) {
			for (const file of Array.from(e.dataTransfer.files)) {
				await uploadAndSendFile(file);
			}
		}
	}

	async function uploadAndSendFile(file: File) {
		const id = `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
		const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;

		// Show uploading placeholder immediately
		pendingAttachments = [...pendingAttachments, { id, name: file.name, previewUrl, path: '', uploading: true }];

		const formData = new FormData();
		formData.append('file', file, file.name);
		formData.append('sessionName', sessionName);
		formData.append('filename', file.name);

		try {
			const res = await fetch('/api/work/upload-image', { method: 'POST', body: formData });
			if (!res.ok) {
				pendingAttachments = pendingAttachments.filter(a => a.id !== id);
				if (previewUrl) URL.revokeObjectURL(previewUrl);
				return;
			}
			const { filePath } = await res.json();
			// Update with the actual path, clear uploading state
			pendingAttachments = pendingAttachments.map(a =>
				a.id === id ? { ...a, path: filePath, uploading: false } : a
			);
		} catch (e) {
			console.warn('[MobileSessionDrawer] Failed to upload file:', e);
			pendingAttachments = pendingAttachments.filter(a => a.id !== id);
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		}
	}

	function removeAttachment(id: string) {
		const att = pendingAttachments.find(a => a.id === id);
		if (att?.previewUrl) URL.revokeObjectURL(att.previewUrl);
		pendingAttachments = pendingAttachments.filter(a => a.id !== id);
	}

	async function sendWithAttachments() {
		const text = inputText.trim();
		const readyAttachments = pendingAttachments.filter(a => !a.uploading && a.path);
		if (!text && !readyAttachments.length) return;

		// Send each attachment path then an extra Enter (Claude Code needs the extra
		// Enter to submit after it processes the image path into [Image #N]).
		for (const att of readyAttachments) {
			await onSendInput(att.path, 'text');
			await new Promise(r => setTimeout(r, 100));
			await onSendInput('', 'enter'); // type='enter' → API sends Enter key (not literal text)
			if (att.previewUrl) URL.revokeObjectURL(att.previewUrl);
		}
		pendingAttachments = pendingAttachments.filter(a => a.uploading); // keep any still uploading

		if (text) {
			pushToHistory(text);
			await onSendInput(text, 'text');
			// Extra Enter matches MobileSessionFullscreen behavior — needed for image paths.
			await new Promise(r => setTimeout(r, 100));
			await onSendInput('', 'enter'); // type='enter' → API sends Enter key (not literal text)
			inputText = '';
			if (sessionName && typeof localStorage !== 'undefined') {
				localStorage.removeItem(`jat-draft-mobile-${sessionName}-main-input`);
			}
		}
	}

	// Minimap show-on-scroll state
	let mobileScrolling = $state(false);
	let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
	let userTouching = false; // true while user has finger on screen

	// Send key to tmux session
	async function sendKey(key: string) {
		if (!sessionName) return;
		try {
			await fetch(`/api/work/${encodeURIComponent(sessionName)}/input`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: key === 'ctrl-c' ? 'ctrl-c' : 'key', text: key })
			});
		} catch {
			// Ignore errors
		}
	}

	// === Swipe Gesture State ===
	let swipeStartX = 0;
	let swipeStartY = 0;
	let swipeDragging = false;
	let swipeDirection: 'left' | 'right' | null = null;
	let swipeStartTime = 0;
	const SWIPE_DEADZONE = 10;
	const SWIPE_THRESHOLD = 80;
	const SWIPE_VELOCITY = 0.4;

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length !== 1) return;
		swipeStartX = e.touches[0].clientX;
		swipeStartY = e.touches[0].clientY;
		swipeStartTime = Date.now();
		swipeDragging = false;
		swipeDirection = null;
		pageTranslateX = 0;
		pageTransitioning = false;
	}

	function handleTouchMove(e: TouchEvent) {
		const touch = e.touches[0];
		const deltaX = touch.clientX - swipeStartX;
		const deltaY = touch.clientY - swipeStartY;

		if (!swipeDragging) {
			// Vertical scroll takes priority
			if (Math.abs(deltaY) > SWIPE_DEADZONE) return;
			if (Math.abs(deltaX) > SWIPE_DEADZONE) {
				swipeDragging = true;
				swipeDirection = deltaX > 0 ? 'right' : 'left';
			} else {
				return;
			}
		}

		// Determine valid swipe directions based on current page
		const canSwipeRight = currentPage > 0 || true; // page 0 right = dismiss
		const canSwipeLeft = currentPage < PAGES.length - 1;

		if (deltaX > 0 && canSwipeRight) {
			e.preventDefault();
			pageTranslateX = deltaX;
		} else if (deltaX < 0 && canSwipeLeft) {
			e.preventDefault();
			pageTranslateX = deltaX;
		} else if (deltaX < 0 && !canSwipeLeft) {
			// Rubber band effect on last page
			e.preventDefault();
			pageTranslateX = deltaX * 0.3;
		} else if (deltaX > 0 && currentPage === 0) {
			// Dismiss direction on first page
			e.preventDefault();
			pageTranslateX = deltaX;
		}
	}

	function handleTouchEnd() {
		if (!swipeDragging) return;

		const elapsed = Math.max(1, Date.now() - swipeStartTime);
		const velocity = Math.abs(pageTranslateX) / elapsed;
		const absDelta = Math.abs(pageTranslateX);
		const shouldNavigate = absDelta > SWIPE_THRESHOLD || (velocity > SWIPE_VELOCITY && absDelta > 30);

		if (shouldNavigate) {
			if (pageTranslateX > 0) {
				// Swiped right
				if (currentPage === 0) {
					// Dismiss
					dismissDrawer();
					return;
				} else {
					// Previous page
					navigateToPage(currentPage - 1);
				}
			} else {
				// Swiped left
				if (currentPage < PAGES.length - 1) {
					navigateToPage(currentPage + 1);
				} else {
					// Rubber band back
					pageTransitioning = true;
					pageTranslateX = 0;
					setTimeout(() => pageTransitioning = false, 250);
				}
			}
		} else {
			// Snap back
			pageTransitioning = true;
			pageTranslateX = 0;
			setTimeout(() => pageTransitioning = false, 250);
		}

		swipeDragging = false;
		swipeDirection = null;
	}

	function handleTouchCancel() {
		swipeDragging = false;
		swipeDirection = null;
		pageTransitioning = true;
		pageTranslateX = 0;
		setTimeout(() => pageTransitioning = false, 250);
	}

	function navigateToPage(page: number) {
		pageTransitioning = true;
		pageTranslateX = 0;
		currentPage = page;
		setTimeout(() => pageTransitioning = false, 300);

		// Fetch full task detail when navigating to any detail page
		if (page >= 1 && task?.id && !fullTask) {
			fetchTaskDetail();
		}
		// Resume output fetch immediately when returning to terminal page
		if (page === 0) {
			fetchOutput();
		}
	}

	function dismissDrawer() {
		visible = false;
		setHoveredSession(null);
		// Wait for Svelte out-transition (300ms) then notify parent
		setTimeout(onClose, 350);
	}

	// Portal action
	function portalToBody(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	// Direct click action (bypasses Svelte 5 event delegation for portals)
	function directClick(node: HTMLElement, handler: ((e: MouseEvent) => void) | (() => void)) {
		node.addEventListener('click', handler as EventListener);
		return {
			destroy() {
				node.removeEventListener('click', handler as EventListener);
			}
		};
	}

	// Direct keydown action (bypasses Svelte 5 event delegation for portals)
	function directKeydown(node: HTMLElement, handler: (e: KeyboardEvent) => void) {
		node.addEventListener('keydown', handler);
		return {
			destroy() {
				node.removeEventListener('keydown', handler);
			}
		};
	}

	// Auto-grow textarea up to its CSS max-height. Runs on input + on
	// programmatic value changes so clearing after send snaps back to 1 row.
	function autoGrow(node: HTMLTextAreaElement) {
		const resize = () => {
			node.style.height = 'auto';
			node.style.height = `${node.scrollHeight}px`;
		};
		resize();
		node.addEventListener('input', resize);
		const observer = new MutationObserver(resize);
		observer.observe(node, { attributes: true, attributeFilter: ['value'] });
		return {
			update() { resize(); },
			destroy() {
				node.removeEventListener('input', resize);
				observer.disconnect();
			}
		};
	}

	// Direct change action (bypasses Svelte 5 event delegation for portals)
	function directChange(node: HTMLElement, handler: (e: Event) => void) {
		node.addEventListener('change', handler as EventListener);
		return {
			destroy() {
				node.removeEventListener('change', handler as EventListener);
			}
		};
	}

	let fileInputEl = $state<HTMLInputElement | null>(null);

	// Focus input when hovering/touching the drawer (input is the main interaction)
	function focusInputOnHover(node: HTMLElement) {
		function focusInput(e: Event) {
			// Don't steal focus from buttons or other interactive elements
			const target = e.target as HTMLElement;
			if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button, a')) return;
			inputRef?.focus({ preventScroll: true });
		}
		node.addEventListener('mouseenter', focusInput);
		return {
			destroy() {
				node.removeEventListener('mouseenter', focusInput);
			}
		};
	}

	let copiedMobileTaskId = $state<string | null>(null);
	function copyMobileTaskId(e: MouseEvent, taskId: string) {
		e.stopPropagation();
		navigator.clipboard.writeText(taskId);
		copiedMobileTaskId = taskId;
		if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(4);
		setTimeout(() => (copiedMobileTaskId = null), 1500);
	}

	// Minimap scroll detection: track the wrapper element ref
	let wrapperRef: HTMLElement | null = $state(null);

	// Use $effect to attach scroll listener when wrapper + scroll container are ready
	$effect(() => {
		if (!wrapperRef) return;
		let scrollEl: HTMLElement | null = null;
		let observer: MutationObserver | null = null;

		function onScroll() {
			// Only show minimap for user-initiated scrolls, not auto-scroll from new output
			if (!userTouching) return;
			mobileScrolling = true;
			if (scrollTimeout) clearTimeout(scrollTimeout);
			scrollTimeout = setTimeout(() => {
				mobileScrolling = false;
			}, 1500);
		}

		// Track user interaction to distinguish user scroll from auto-scroll
		function onTouchStart() { userTouching = true; }
		function onTouchEnd() {
			// Delay clearing so scroll events from momentum still count
			setTimeout(() => { userTouching = false; }, 2000);
		}
		function onWheel() { userTouching = true; setTimeout(() => { userTouching = false; }, 2000); }

		function tryAttach() {
			if (!wrapperRef) return;
			const el = wrapperRef.querySelector('.overflow-y-auto') as HTMLElement;
			if (el && el !== scrollEl) {
				if (scrollEl) {
					scrollEl.removeEventListener('scroll', onScroll);
					scrollEl.removeEventListener('touchstart', onTouchStart);
					scrollEl.removeEventListener('touchend', onTouchEnd);
					scrollEl.removeEventListener('wheel', onWheel);
				}
				scrollEl = el;
				scrollEl.addEventListener('scroll', onScroll, { passive: true });
				scrollEl.addEventListener('touchstart', onTouchStart, { passive: true });
				scrollEl.addEventListener('touchend', onTouchEnd, { passive: true });
				scrollEl.addEventListener('wheel', onWheel, { passive: true });
			}
		}

		tryAttach();
		// Re-attach when DOM changes (MobileTerminal may update)
		observer = new MutationObserver(tryAttach);
		observer.observe(wrapperRef, { childList: true, subtree: true });

		return () => {
			if (scrollEl) {
				scrollEl.removeEventListener('scroll', onScroll);
				scrollEl.removeEventListener('touchstart', onTouchStart);
				scrollEl.removeEventListener('touchend', onTouchEnd);
				scrollEl.removeEventListener('wheel', onWheel);
			}
			if (observer) observer.disconnect();
		};
	});

	// Touch handlers action for swipe gestures (direct binding for portal compat)
	function touchHandlers(node: HTMLElement) {
		node.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
		node.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
		node.addEventListener('touchend', handleTouchEnd as EventListener);
		node.addEventListener('touchcancel', handleTouchCancel as EventListener);
		return {
			destroy() {
				node.removeEventListener('touchstart', handleTouchStart as EventListener);
				node.removeEventListener('touchmove', handleTouchMove as EventListener);
				node.removeEventListener('touchend', handleTouchEnd as EventListener);
				node.removeEventListener('touchcancel', handleTouchCancel as EventListener);
			}
		};
	}

	// Max characters to keep in terminal output — prevents unbounded growth on mobile
	const MAX_OUTPUT_CHARS = 40_000;

	// Fetch terminal output
	async function fetchOutput() {
		if (!sessionName || currentPage !== 0) return; // skip when not on terminal page
		try {
			const resp = await fetch(`/api/work/${encodeURIComponent(sessionName)}/output`);
			if (resp.ok) {
				const data = await resp.json();
				const raw: string = data.output || '';
				// Truncate from the front to avoid unbounded DOM growth on mobile
				output = raw.length > MAX_OUTPUT_CHARS ? raw.slice(-MAX_OUTPUT_CHARS) : raw;
			}
		} catch {
			// Ignore fetch errors
		}
	}

	// Fetch full task detail from API
	async function fetchTaskDetail() {
		if (!task?.id || taskLoading) return;
		taskLoading = true;
		try {
			const resp = await fetch(`/api/tasks/${encodeURIComponent(task.id)}`);
			if (resp.ok) {
				const data = await resp.json();
				fullTask = data.task || data;
			}
		} catch {
			// Use basic task info as fallback
		} finally {
			taskLoading = false;
		}
	}

	function formatDate(dateStr: string): string {
		if (!dateStr) return '';
		const d = new Date(dateStr);
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function formatTimeAgo(dateStr: string): string {
		if (!dateStr) return '';
		const now = Date.now();
		const then = new Date(dateStr).getTime();
		const diff = now - then;
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'just now';
		if (mins < 60) return `${mins}m ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	}

	function getPriorityLabel(p: number | undefined): string {
		if (p === undefined || p === null) return '';
		return `P${p}`;
	}

	function getPriorityBadgeClass(p: number | undefined): string {
		switch (p) {
			case 0: return 'badge-error';
			case 1: return 'badge-warning';
			case 2: return 'badge-info';
			default: return 'badge-ghost';
		}
	}

	function getStatusBadgeClass(s: string): string {
		switch (s) {
			case 'open': return 'badge-info';
			case 'in_progress': return 'badge-warning';
			case 'blocked': return 'badge-error';
			case 'closed': return 'badge-success';
			default: return 'badge-ghost';
		}
	}

	// Pager transform calculation
	// Each page is (100/PAGES.length)% of the pager container (which is PAGES.length * 100% of viewport).
	// So moving one page = translateX(-(100/PAGES.length)%).
	const pagePercent = 100 / PAGES.length;
	const pagerTransform = $derived.by(() => {
		const baseOffset = -(currentPage * pagePercent);
		const dragPercent = (pageTranslateX / window.innerWidth) * pagePercent;
		return `translateX(${baseOffset + dragPercent}%)`;
	});

	// Auto-focus input as soon as it's mounted in the DOM
	$effect(() => {
		if (inputRef && visible) {
			// Focus immediately — don't wait for transition to finish
			inputRef.focus({ preventScroll: true });
		}
	});

	// Autosave main input draft to localStorage (debounced 300ms)
	$effect(() => {
		const text = inputText;
		if (!sessionName || typeof localStorage === 'undefined') return;
		if (mainDraftTimer) clearTimeout(mainDraftTimer);
		mainDraftTimer = setTimeout(() => {
			const key = `jat-draft-mobile-${sessionName}-main-input`;
			if (text.trim()) {
				localStorage.setItem(key, text);
			} else {
				localStorage.removeItem(key);
			}
		}, 300);
	});

	function handleKeydown(e: KeyboardEvent) {
		const target = e.target as HTMLElement;

		// Esc: two-stage — clear non-empty input first, then close
		if (e.key === 'Escape') {
			e.preventDefault();
			if (inputText.trim().length > 0) {
				inputText = '';
				historyIndex = -1;
			} else {
				dismissDrawer();
			}
			return;
		}

		// Shift+Enter → let through (natural linebreak in textarea)
		if (e.key === 'Enter' && e.shiftKey) return;

		// Alt+Enter → broadcast to all active sessions
		if (e.key === 'Enter' && e.altKey) {
			if (hasSendable) {
				e.preventDefault();
				sendBroadcast();
			}
			return;
		}

		// Ctrl/Cmd+Enter → send + close drawer
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			if (hasSendable) {
				e.preventDefault();
				sendAndDismiss();
			}
			return;
		}

		// Enter (bare) → send, stay open
		// Skip if autocomplete in PromptInput already handled it (e.defaultPrevented)
		if (e.key === 'Enter' && !e.defaultPrevented) {
			if (hasSendable) {
				e.preventDefault();
				sendWithStay();
			}
			return;
		}

		// ↑ → previous history (only when cursor is on first line)
		if (e.key === 'ArrowUp') {
			const textarea = target instanceof HTMLTextAreaElement ? target : null;
			const cursorPos = textarea?.selectionStart ?? 0;
			const isFirstLine = !inputText.substring(0, cursorPos).includes('\n');
			if (isFirstLine && sentHistory.length > 0) {
				e.preventDefault();
				if (historyIndex === -1) {
					historyBuffer = inputText;
					historyIndex = sentHistory.length - 1;
				} else if (historyIndex > 0) {
					historyIndex--;
				}
				inputText = sentHistory[historyIndex];
			}
			return;
		}

		// ↓ → forward through history / restore current buffer
		if (e.key === 'ArrowDown' && historyIndex !== -1) {
			const textarea = target instanceof HTMLTextAreaElement ? target : null;
			const cursorPos = textarea?.selectionStart ?? inputText.length;
			const isLastLine = !inputText.substring(cursorPos).includes('\n');
			if (isLastLine) {
				e.preventDefault();
				if (historyIndex < sentHistory.length - 1) {
					historyIndex++;
					inputText = sentHistory[historyIndex];
				} else {
					historyIndex = -1;
					inputText = historyBuffer;
				}
			}
			return;
		}

		// Ctrl+K → clear input
		if (e.key === 'k' && e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
			e.preventDefault();
			inputText = '';
			historyIndex = -1;
			return;
		}
	}

	onMount(() => {
		// Delay visible by one tick so Svelte transitions trigger on insert
		requestAnimationFrame(() => visible = true);
		isMobileFullscreenOpen.set(true);
		setHoveredSession(sessionName);

		// Restore main input draft and history
		if (sessionName && typeof localStorage !== 'undefined') {
			const saved = localStorage.getItem(`jat-draft-mobile-${sessionName}-main-input`);
			if (saved) inputText = saved;
		}
		loadHistory();

		// Start polling output — 3s on mobile is responsive enough and much lighter
		fetchOutput();
		pollInterval = setInterval(fetchOutput, 3000);
	});

	onDestroy(() => {
		clearHold();
		if (mainDraftTimer) clearTimeout(mainDraftTimer);
		if (pollInterval) {
			clearInterval(pollInterval);
			pollInterval = null;
		}
		if (scrollTimeout) {
			clearTimeout(scrollTimeout);
			scrollTimeout = null;
		}
		isMobileFullscreenOpen.set(false);
		setHoveredSession(null);
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div use:portalToBody>
	{#if visible}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[49] bg-black/60"
		transition:fade={{ duration: 300 }}
		use:directClick={dismissDrawer}
	></div>

	<!-- Drawer Panel (full screen, slides up from bottom) -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="drawer-panel fixed inset-0 z-50 flex flex-col overflow-hidden bg-base-100"
		style="max-width: 100vw;"
		transition:fly={{ y: globalThis.innerHeight || 900, duration: 300, easing: cubicOut }}
		use:touchHandlers
		use:focusInputOnHover
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondragenter={handleDragEnter}
		ondrop={handleDrop}
	>
		<!-- File drop overlay -->
		{#if isDragOver}
			<div class="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none bg-info/30 border-[3px] border-dashed border-info rounded-[inherit]">
				<div class="flex flex-col items-center gap-2">
					<svg class="w-10 h-10 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
					</svg>
					<span class="text-sm font-semibold text-info">Drop to attach</span>
				</div>
			</div>
		{/if}

		<!-- Top bar: back column + centered tabs + close column -->
		<div class="drawer-topbar flex items-center gap-2 px-3 py-2 bg-base-200 border-b border-base-300 flex-shrink-0">
			<button class="topbar-dismiss-col self-stretch flex items-center justify-center w-10 -my-1 flex-shrink-0 rounded-md text-base-content/50 active:bg-base-300 active:text-base-content transition-colors" use:directClick={() => currentPage === 0 ? dismissDrawer() : navigateToPage(0)} title={currentPage === 0 ? 'Close' : 'Back to Terminal'}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="18" height="18">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
				</svg>
			</button>

			<div class="topbar-tabs relative flex-1 flex gap-0.5 items-center justify-center overflow-x-auto">
				{#each PAGES as page, i}
					<button
						bind:this={tabRefs[i]}
						class="px-2 py-1 text-[0.6875rem] whitespace-nowrap rounded-t-md transition-colors {i === currentPage ? 'font-semibold text-base-content bg-base-300' : 'font-medium text-base-content/50 bg-transparent active:bg-base-300/70'}"
						use:directClick={() => navigateToPage(i)}
					>{page}</button>
				{/each}
				<div
					class="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-info"
					style="left: {indicatorLeft}px; width: {indicatorWidth}px; transition: left 280ms cubic-bezier(0.22, 1, 0.36, 1), width 280ms cubic-bezier(0.22, 1, 0.36, 1);"
				></div>
			</div>

			<button class="topbar-dismiss-col self-stretch flex items-center justify-center w-10 -my-1 flex-shrink-0 rounded-md text-base-content/50 active:bg-base-300 active:text-base-content transition-colors" use:directClick={dismissDrawer} title="Close">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="18" height="18">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Horizontal pager -->
		<div
			class="pager-container"
			style="transform: {pagerTransform}; {pageTransitioning ? 'transition: transform 0.3s cubic-bezier(0.33, 1, 0.68, 1);' : ''} {swipeDragging ? 'will-change: transform;' : ''}"
		>
			<!-- Page 0: Terminal -->
			<div class="pager-page">
				<!-- Custom mobile header — same swipe-card design as TasksActive standalone tasks -->
				{#if task}
					{@const typeVisual = getIssueTypeVisual(task.issue_type)}
					{@const stateVisual = getSessionStateVisual(effectiveState || 'idle')}
					<div class="border-b border-base-300 flex-shrink-0" style="border-left: 3px solid {stateVisual.accent};">
						<div class="flex items-stretch min-h-0">
							<!-- Left strip: square agent tile (matches TasksActive swipe card pattern) -->
							<div class="detail-agent-strip flex-shrink-0 flex items-center justify-center" style="background: {stateVisual.bgTint};" title={agentName}>
								<AgentAvatar name={agentName} size={80} showRing={false} shape="rounded" />
							</div>
							<!-- Shared body markup — same component TasksActive uses -->
							<MobileTaskBody
								{task}
								{agentName}
								{stateVisual}
								{typeVisual}
								{elapsed}
								copiedTaskId={copiedMobileTaskId}
								onCopyTaskId={copyMobileTaskId}
							/>
						</div>
					</div>
				{/if}
				<div class="session-card-wrapper" class:mobile-scrolling={mobileScrolling} bind:this={wrapperRef}>
					{#if currentPage === 0}
						{#if effectiveState === 'completed' && completionLoadState === 'loaded' && completionEvents.length > 0}
							<div class="completion-eventstack-wrapper">
								<EventStack
									sessionName={agentName}
									initialEvents={completionEvents}
									layoutMode="inline"
									autoExpand={true}
									pollInterval={0}
								/>
							</div>
						{:else if effectiveState === 'completed' && completionLoadState === 'loading'}
							<div class="completion-loading">
								<div class="animate-spin-fast w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
								<span class="text-xs text-base-content/50">Loading completion data…</span>
							</div>
						{:else if effectiveState === 'completed' && completionLoadState === 'empty'}
							<MobileTerminal
								{sessionName}
								{output}
								{task}
								defaultProject={project || ''}
								sessionState={effectiveState}
								onSendInput={(text, type) => onSendInput(text, type)}
								onCleanup={() => onAction('cleanup')}
								onComplete={() => onSendInput('/jat:complete', 'text')}
								onViewTask={onViewTask}
								onOptimisticAnswer={(state) => { optimisticAnswerState = state as SessionState | null; }}
							/>
						{:else}
							<MobileTerminal
								{sessionName}
								{output}
								{task}
								defaultProject={project || ''}
								sessionState={effectiveState}
								onSendInput={(text, type) => onSendInput(text, type)}
								onCleanup={() => onAction('cleanup')}
								onComplete={() => onSendInput('/jat:complete', 'text')}
								onViewTask={onViewTask}
								onOptimisticAnswer={(state) => { optimisticAnswerState = state as SessionState | null; }}
							/>
						{/if}
					{/if}
				</div>

				<!-- Mobile Action Buttons Row (dynamic from state actions config) -->
				<div class="action-pills-wrapper bg-base-200 border-t border-base-300 flex-shrink-0">
				<div class="flex gap-1.5 px-2 py-1.5 overflow-x-auto">
					{#each stateActions as action (action.id)}
						{@const isDestructive = DESTRUCTIVE_ACTIONS.has(action.id)}
						<button
							class="relative overflow-hidden flex items-center gap-1 px-2 py-[0.3rem] text-[0.6875rem] font-medium rounded-md whitespace-nowrap cursor-pointer flex-shrink-0 border transition-colors active:brightness-125 {getPillColorClass(action.variant)}"
							class:mobile-btn-flashing={activeActionId === action.id}
							class:hold-active={holdActionId === action.id}
							use:directClick={() => { if (!isDestructive && !pillPointerLocked) executePillAction(action); }}
							onpointerdown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); startHold(action); }}
							onpointerup={clearHold}
							onpointercancel={clearHold}
							title={isDestructive ? `Hold to ${action.label.toLowerCase()}` : (action.description || action.label)}
						>
							{#if isDestructive && holdActionId === action.id}
								<span class="hold-fill" style="width: {holdProgress}%"></span>
							{/if}
							<svg class="relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="14" height="14">
								<path stroke-linecap="round" stroke-linejoin="round" d={action.icon} />
							</svg>
							<span class="relative z-10">{action.label}</span>
						</button>
					{/each}
				</div>
				</div>

				<!-- Pending Attachments Preview -->
				{#if pendingAttachments.length > 0}
					<div class="flex flex-wrap gap-1.5 px-3 pt-1.5 pb-1 bg-base-200 border-t border-base-300">
						{#each pendingAttachments as att (att.id)}
							<div class="flex items-center gap-1 px-1.5 py-1 bg-base-300/60 border border-base-300 rounded-md max-w-[160px] transition-opacity {att.uploading ? 'opacity-60' : 'opacity-100'}">
								{#if att.previewUrl}
									<img src={att.previewUrl} alt={att.name} class="w-7 h-7 object-cover rounded flex-shrink-0" />
								{:else}
									<svg class="text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" width="16" height="16">
										<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
									</svg>
								{/if}
								<span class="text-[0.7rem] text-base-content/70 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">{att.name}</span>
								{#if att.uploading}
									<span class="text-[0.7rem] text-base-content/50 flex-shrink-0">…</span>
								{:else}
									<button class="flex-shrink-0 w-4 h-4 flex items-center justify-center text-sm leading-none text-base-content/50 hover:text-error bg-transparent border-none cursor-pointer p-0 rounded-full transition-colors" use:directClick={() => removeAttachment(att.id)} aria-label="Remove">×</button>
								{/if}
							</div>
						{/each}
					</div>
				{/if}

				<!-- Hidden file picker — triggered by paperclip button -->
				<input
					type="file"
					accept="image/*,application/pdf,text/*,.csv,.json,.md,.txt,.log"
					multiple
					style="display:none"
					bind:this={fileInputEl}
					use:directChange={async (e) => {
						const files = (e.target as HTMLInputElement).files;
						if (!files) return;
						for (const file of Array.from(files)) {
							await uploadAndSendFile(file);
						}
						// Reset so same file can be picked again
						if (fileInputEl) fileInputEl.value = '';
					}}
				/>

				<!-- Mobile Input Row: [keyboard dropup | attach | input | send] -->
				<div class="mobile-input-row flex items-center gap-1.5 px-2 py-1.5 bg-base-100 border-t border-base-300 flex-shrink-0 {(sentFlash || sentStayFlash) ? 'send-flash' : ''}">
					<!-- Keyboard dropup -->
					<div class="relative flex-shrink-0">
						<button
							class="flex items-center justify-center w-9 h-9 rounded-lg bg-base-200 border border-base-300 text-base-content/70 cursor-pointer active:bg-base-300 transition-colors"
							use:directClick={() => keyboardOpen = !keyboardOpen}
							title="Keyboard keys"
						>
							<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" width="18" height="18">
								<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 17.25V6.75zM6 9.75h.008v.008H6V9.75zm0 3h.008v.008H6v-.008zm3-3h.008v.008H9V9.75zm0 3h.008v.008H9v-.008zm3-3h.008v.008H12V9.75zm0 3h.008v.008H12v-.008zm3-3h.008v.008H15V9.75zm0 3h.008v.008H15v-.008zM9 15.75h6" />
							</svg>
						</button>
						{#if keyboardOpen}
							<div class="absolute bottom-full left-0 mb-1.5 bg-base-200 border border-base-300 rounded-lg p-1.5 flex flex-col gap-1 shadow-xl z-[60] min-w-[200px]">
								<div class="flex gap-1">
									<button class="flex-1 flex items-center justify-center px-2 py-1.5 font-mono text-xs text-base-content bg-base-300 border border-base-300 rounded-md cursor-pointer whitespace-nowrap active:bg-base-content/20 transition-colors" use:directClick={() => sendKey('up')}>↑</button>
									<button class="flex-1 flex items-center justify-center px-2 py-1.5 font-mono text-xs text-base-content bg-base-300 border border-base-300 rounded-md cursor-pointer whitespace-nowrap active:bg-base-content/20 transition-colors" use:directClick={() => sendKey('down')}>↓</button>
									<button class="flex-1 flex items-center justify-center px-2 py-1.5 font-mono text-xs text-base-content bg-base-300 border border-base-300 rounded-md cursor-pointer whitespace-nowrap active:bg-base-content/20 transition-colors" use:directClick={() => sendKey('left')}>←</button>
									<button class="flex-1 flex items-center justify-center px-2 py-1.5 font-mono text-xs text-base-content bg-base-300 border border-base-300 rounded-md cursor-pointer whitespace-nowrap active:bg-base-content/20 transition-colors" use:directClick={() => sendKey('right')}>→</button>
								</div>
								<div class="flex gap-1">
									<button class="flex-1 flex items-center justify-center px-2 py-1.5 font-mono text-xs text-base-content bg-base-300 border border-base-300 rounded-md cursor-pointer whitespace-nowrap active:bg-base-content/20 transition-colors" use:directClick={() => sendKey('enter')}>Enter ⤶</button>
									<button class="flex-1 flex items-center justify-center px-2 py-1.5 font-mono text-xs text-base-content bg-base-300 border border-base-300 rounded-md cursor-pointer whitespace-nowrap active:bg-base-content/20 transition-colors" use:directClick={() => sendKey('tab')}>Tab ⇥</button>
									<button class="flex-1 flex items-center justify-center px-2 py-1.5 font-mono text-xs text-base-content bg-base-300 border border-base-300 rounded-md cursor-pointer whitespace-nowrap active:bg-base-content/20 transition-colors" use:directClick={() => sendKey('escape')}>ESC</button>
									<button class="flex-1 flex items-center justify-center px-2 py-1.5 font-mono text-xs text-base-content bg-base-300 border border-base-300 rounded-md cursor-pointer whitespace-nowrap active:bg-base-content/20 transition-colors" use:directClick={() => sendKey('ctrl-c')}>^C</button>
									<button class="flex-1 flex items-center justify-center px-2 py-1.5 font-mono text-xs text-base-content bg-base-300 border border-base-300 rounded-md cursor-pointer whitespace-nowrap active:bg-base-content/20 transition-colors" use:directClick={() => sendKey('ctrl-l')}>^L</button>
								</div>
							</div>
						{/if}
					</div>

					<!-- Paperclip / file picker -->
					<button
						class="flex items-center justify-center w-9 h-9 rounded-lg bg-base-200 border border-base-300 text-base-content/70 cursor-pointer active:bg-base-300 transition-colors flex-shrink-0"
						title="Attach file"
						use:directClick={() => fileInputEl?.click()}
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" width="18" height="18">
							<path stroke-linecap="round" stroke-linejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
						</svg>
					</button>

					<!-- Input field or markdown preview -->
					{#if showPreview}
						<div
							class="mob-md-preview flex-1 min-w-0 px-2.5 py-2 text-[0.8125rem] text-base-content bg-base-200 border border-info/40 rounded-lg leading-snug overflow-y-auto"
							style="min-height: 2.25rem; max-height: 12rem;"
						>
							{#if inputText.trim()}
								{@html renderedMarkdown}
							{:else}
								<span class="text-base-content/30 italic">Nothing to preview</span>
							{/if}
						</div>
					{:else}
					<div class="flex-1 min-w-0 {sentFlash ? 'send-input-recede' : ''}">
						<PromptInput
							bind:this={inputRef}
							bind:value={inputText}
							bind:references={promptRefs}
							project={project || ''}
							placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
							rows={1}
							compact={true}
						/>
					</div>
					{/if}

					<!-- Eye/pencil preview toggle -->
					{#if inputText.trim()}
						<button
							class="flex items-center justify-center w-9 h-9 rounded-lg border flex-shrink-0 transition-colors {showPreview ? 'bg-info/20 border-info text-info' : 'bg-base-200 border-base-300 text-base-content/50 active:bg-base-300'}"
							aria-label={showPreview ? 'Back to edit' : 'Preview markdown'}
							use:directClick={() => {
								showPreview = !showPreview;
								if (!showPreview) {
									requestAnimationFrame(() => inputRef?.focus());
								}
							}}
						>
							{#if showPreview}
								<!-- Pencil -->
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="18" height="18">
									<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
								</svg>
							{:else}
								<!-- Eye -->
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="18" height="18">
									<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
									<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
							{/if}
						</button>
					{/if}

					<!-- Send button -->
					<button
						class="send-btn flex items-center justify-center w-9 h-9 rounded-lg border cursor-pointer flex-shrink-0 transition-colors disabled:opacity-40 disabled:cursor-default {(sentFlash || sentStayFlash) ? 'bg-success border-success text-success-content send-btn-sent' : hasSendable && !showPreview ? 'bg-info border-info text-info-content active:bg-info/80' : 'bg-base-200 border-base-300 text-base-content/40'}"
						aria-label="Send message"
						disabled={!hasSendable || showPreview}
						use:directClick={sendWithStay}
					>
						{#if sentFlash || sentStayFlash}
							<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" width="18" height="18">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
							</svg>
						{:else}
							<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="18" height="18">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
							</svg>
						{/if}
					</button>
				</div>
			</div>

			<!-- Page 1: Task Detail -->
			<div class="pager-page">
				<div class="flex-1 overflow-y-auto p-4" style="-webkit-overflow-scrolling: touch;">
					{#if task}
						<!-- Task Header — tap title to edit -->
						<div class="mb-4">
							<TaskHeaderBlock id={task.id} type={task.issue_type}>
								{#snippet title()}
									<button
										type="button"
										class="text-left w-full text-lg font-semibold text-base-content leading-snug m-0 bg-transparent border-0 p-0 cursor-pointer hover:text-info active:text-info transition-colors"
										use:directClick={() => openEditor('title')}
										aria-label="Edit title"
									>
										{task?.title || 'Untitled'}
									</button>
								{/snippet}
							</TaskHeaderBlock>
						</div>

						<!-- Status & Priority Row — tap badges to edit -->
						<div class="mb-5">
							<TaskMetaRow>
								<button
									type="button"
									class="badge badge-sm {getStatusBadgeClass(task.status)} badge-outline uppercase tracking-wide cursor-pointer active:scale-95 transition-transform"
									use:directClick={() => openEditor('status')}
									aria-label="Edit status"
								>
									{task.status.replace('_', ' ')}
								</button>
								<button
									type="button"
									class="badge badge-sm {getPriorityBadgeClass(task.priority)} badge-outline uppercase tracking-wide cursor-pointer active:scale-95 transition-transform"
									use:directClick={() => openEditor('priority')}
									aria-label="Edit priority"
								>
									{task.priority !== undefined && task.priority !== null ? getPriorityLabel(task.priority) : 'Set priority'}
								</button>
								{#if agentName}
									<div class="badge badge-sm badge-info badge-outline uppercase tracking-wide">
										{agentName}
									</div>
								{/if}
							</TaskMetaRow>
						</div>

						<!-- Session Info -->
						<div class="mb-5">
							<TaskFieldLabel>Session</TaskFieldLabel>
							<TaskFieldGrid>
								{#if created}
									<TaskFieldCell label="Started">{formatTimeAgo(created)}</TaskFieldCell>
								{/if}
								{#if tokens > 0}
									<TaskFieldCell label="Tokens">{tokens > 1000000 ? `${(tokens / 1000000).toFixed(1)}M` : tokens > 1000 ? `${(tokens / 1000).toFixed(0)}K` : tokens}</TaskFieldCell>
								{/if}
								{#if cost > 0}
									<TaskFieldCell label="Cost">${cost.toFixed(2)}</TaskFieldCell>
								{/if}
								{#if sseState}
									<TaskFieldCell label="State">{sseState}</TaskFieldCell>
								{/if}
							</TaskFieldGrid>
						</div>

						<!-- Description — tap to edit -->
						<div class="mb-5">
							<TaskFieldLabel>Description</TaskFieldLabel>
							<button
								type="button"
								class="text-left w-full text-sm text-base-content/80 leading-relaxed whitespace-pre-wrap break-words bg-base-200 hover:bg-base-300 active:bg-base-300 border border-base-300 p-3 rounded-lg cursor-pointer transition-colors"
								style="overflow-wrap: break-word; word-break: break-word; min-width: 0;"
								use:directClick={() => openEditor('description')}
								aria-label="Edit description"
							>
								{#if task.description || fullTask?.description}
									{task.description || fullTask?.description}
								{:else}
									<span class="italic text-base-content/50">Tap to add a description…</span>
								{/if}
							</button>
						</div>

						<!-- Full task details (loaded from API) -->
						{#if fullTask}
							<!-- Labels — tap to edit -->
							<div class="mb-5">
								<TaskFieldLabel>Labels</TaskFieldLabel>
								<button
									type="button"
									class="text-left w-full bg-base-200 hover:bg-base-300 active:bg-base-300 border border-base-300 p-3 rounded-lg cursor-pointer transition-colors"
									use:directClick={() => openEditor('labels')}
									aria-label="Edit labels"
								>
									{#if fullTask.labels?.length}
										<TaskLabelsList labels={fullTask.labels} />
									{:else}
										<span class="text-sm italic text-base-content/50">Tap to add labels…</span>
									{/if}
								</button>
							</div>

							{#if fullTask.depends_on?.length}
								<div class="mb-5">
									<TaskFieldLabel>Depends On</TaskFieldLabel>
									<DependencyList items={fullTask.depends_on.map((d: any) => typeof d === 'string' ? { id: d } : d)} />
								</div>
							{/if}

							{#if fullTask.blocked_by?.length}
								<div class="mb-5">
									<TaskFieldLabel>Blocks</TaskFieldLabel>
									<DependencyList items={fullTask.blocked_by.map((d: any) => typeof d === 'string' ? { id: d } : d)} />
								</div>
							{/if}

							{#if fullTask.created_at || fullTask.updated_at}
								<div class="mb-5">
									<TaskDatesPair createdAt={fullTask.created_at} updatedAt={fullTask.updated_at} />
								</div>
							{/if}
						{:else if taskLoading}
							<div class="flex flex-col gap-4 mb-5">
								<!-- Labels skeleton -->
								<div>
									<div class="skeleton h-3 w-12 mb-2 rounded"></div>
									<div class="skeleton h-8 w-full rounded-lg"></div>
								</div>
								<!-- Dependencies skeleton -->
								<div>
									<div class="skeleton h-3 w-20 mb-2 rounded"></div>
									<div class="flex flex-col gap-1.5">
										<div class="skeleton h-6 w-4/5 rounded"></div>
										<div class="skeleton h-6 w-3/5 rounded"></div>
									</div>
								</div>
								<!-- Dates skeleton -->
								<div>
									<div class="skeleton h-3 w-16 mb-2 rounded"></div>
									<div class="skeleton h-10 w-full rounded-lg"></div>
								</div>
							</div>
						{/if}
					{:else}
						<div class="flex items-center justify-center h-full text-base-content/50 text-sm">
							<p>No task assigned to this session</p>
						</div>
					{/if}
				</div>
			</div>

				<!-- Page 2: Attachments -->
				<div class="pager-page">
					<div class="flex-1 overflow-y-auto p-4" style="-webkit-overflow-scrolling: touch;">
						<div class="mb-5">
							<div class="flex items-center justify-between mb-2">
								<TaskFieldLabel>Attachments</TaskFieldLabel>
								<button
									class="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-base-200 border border-base-300 text-base-content/70 cursor-pointer active:bg-base-300 transition-colors"
									use:directClick={() => fileInputEl?.click()}
								>
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" width="14" height="14">
										<path stroke-linecap="round" stroke-linejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
									</svg>
									Add file
								</button>
							</div>
							{#if fullTask?.attachments?.length}
								<div class="flex flex-col gap-2">
									{#each fullTask.attachments as attachment}
										<div class="flex items-center gap-2 px-3 py-2 bg-base-200 border border-base-300 rounded-md text-sm text-base-content/80">
											<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" width="16" height="16">
												<path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
											</svg>
											<span class="truncate">{attachment.name || attachment.filename || 'Attachment'}</span>
										</div>
									{/each}
								</div>
							{:else}
								<div class="flex flex-col items-center gap-3 py-12 text-base-content/40">
									<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" width="32" height="32">
										<path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
									</svg>
									<p class="text-sm">No attachments yet</p>
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Page 3: Notes -->
				<div class="pager-page">
					<div class="flex-1 overflow-y-auto p-4" style="-webkit-overflow-scrolling: touch;">
						<div class="mb-5">
							<TaskFieldLabel>Notes</TaskFieldLabel>
							<button
								type="button"
								class="text-left w-full text-sm text-base-content/80 leading-relaxed whitespace-pre-wrap break-words bg-base-200 hover:bg-base-300 active:bg-base-300 border border-base-300 p-3 rounded-lg cursor-pointer transition-colors"
								style="overflow-wrap: break-word; word-break: break-word; min-width: 0;"
								use:directClick={() => openEditor('notes')}
								aria-label="Edit notes"
							>
								{#if fullTask?.notes}
									{fullTask.notes}
								{:else}
									<span class="italic text-base-content/50">Tap to add notes…</span>
								{/if}
							</button>
						</div>

						{#if task?.id}
							<div class="mb-5">
								<TaskFieldLabel>Comments</TaskFieldLabel>
								<CommentsThread taskId={task.id} />
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Edit bottom sheet — renders over the drawer when editing a field -->
	{#if editMode !== 'none' && task}
		<div
			class="fixed inset-0 z-[60] flex items-end justify-center bg-black/50"
			role="button"
			tabindex="-1"
			use:directClick={closeEditor}
			use:directKeydown={(e) => { if (e.key === 'Escape') closeEditor(); }}
			transition:fade={{ duration: 150 }}
		>
			<div
				class="mobile-edit-sheet w-full bg-base-100 rounded-t-2xl border-t border-base-300 shadow-2xl p-4 pb-8"
				style="max-width: 100%; box-sizing: border-box; overflow-x: hidden;"
				role="dialog"
				aria-modal="true"
				aria-label="Edit {editMode}"
				use:directClick={(e) => e.stopPropagation()}
				use:directKeydown={(e) => e.stopPropagation()}
				transition:fly={{ y: 300, duration: 200, easing: cubicOut }}
			>
				<!-- Drag handle -->
				<div class="w-10 h-1 bg-base-300 rounded-full mx-auto mb-4"></div>

				<div class="flex items-center justify-between mb-3">
					<h3 class="text-base font-semibold capitalize">Edit {editMode}</h3>
					<button
						type="button"
						class="btn btn-sm btn-ghost btn-circle"
						use:directClick={closeEditor}
						aria-label="Close"
					>
						✕
					</button>
				</div>

				{#if editError}
					<div class="alert alert-error text-xs mb-3 py-2">{editError}</div>
				{/if}

				{#if editMode === 'status'}
					<div class="flex flex-col gap-2">
						{#each STATUS_OPTIONS as opt}
							<button
								type="button"
								class="btn btn-block justify-start {task.status === opt.value ? 'btn-primary' : 'btn-outline'}"
								disabled={editSaving}
								use:directClick={() => saveStatus(opt.value)}
							>
								{opt.label}
							</button>
						{/each}
					</div>
				{:else if editMode === 'priority'}
					<div class="flex flex-col gap-2">
						{#each PRIORITY_OPTIONS as opt}
							<button
								type="button"
								class="btn btn-block justify-start {task.priority === opt.value ? 'btn-primary' : 'btn-outline'}"
								disabled={editSaving}
								use:directClick={() => savePriority(opt.value)}
							>
								{opt.label}
							</button>
						{/each}
					</div>
				{:else if editMode === 'title'}
					<div class="flex flex-col gap-3">
						<input
							type="text"
							class="input input-bordered w-full"
							style="max-width: 100%; box-sizing: border-box;"
							bind:value={editDraft}
							placeholder="Task title"
							disabled={editSaving}
							use:directKeydown={(e) => { if (e.key === 'Enter') saveTitle(); }}
						/>
						<div class="flex gap-2">
							<button type="button" class="btn btn-outline flex-1" disabled={editSaving} use:directClick={closeEditor}>Cancel</button>
							<button type="button" class="btn btn-primary flex-1" disabled={editSaving} use:directClick={saveTitle}>
								{editSaving ? 'Saving…' : 'Save'}
							</button>
						</div>
					</div>
				{:else if editMode === 'description'}
					<div class="flex flex-col gap-3">
						<textarea
							class="textarea textarea-bordered w-full h-40 font-mono text-sm"
							style="max-width: 100%; box-sizing: border-box;"
							bind:value={editDraft}
							placeholder="Task description"
							disabled={editSaving}
						></textarea>
						<div class="flex gap-2">
							<button type="button" class="btn btn-outline flex-1" disabled={editSaving} use:directClick={closeEditor}>Cancel</button>
							<button type="button" class="btn btn-primary flex-1" disabled={editSaving} use:directClick={saveDescription}>
								{editSaving ? 'Saving…' : 'Save'}
							</button>
						</div>
					</div>
				{:else if editMode === 'labels'}
					<div class="flex flex-col gap-3">
						<input
							type="text"
							class="input input-bordered w-full"
							style="max-width: 100%; box-sizing: border-box;"
							bind:value={editDraft}
							placeholder="comma, separated, labels"
							disabled={editSaving}
							use:directKeydown={(e) => { if (e.key === 'Enter') saveLabels(); }}
						/>
						<p class="text-xs text-base-content/60">Separate multiple labels with commas.</p>
						<div class="flex gap-2">
							<button type="button" class="btn btn-outline flex-1" disabled={editSaving} use:directClick={closeEditor}>Cancel</button>
							<button type="button" class="btn btn-primary flex-1" disabled={editSaving} use:directClick={saveLabels}>
								{editSaving ? 'Saving…' : 'Save'}
							</button>
						</div>
					</div>
				{:else if editMode === 'notes'}
					<div class="flex flex-col gap-3">
						<textarea
							class="textarea textarea-bordered w-full h-40 font-mono text-sm"
							style="max-width: 100%; box-sizing: border-box;"
							bind:value={editDraft}
							placeholder="Task notes"
							disabled={editSaving}
						></textarea>
						<div class="flex gap-2">
							<button type="button" class="btn btn-outline flex-1" disabled={editSaving} use:directClick={closeEditor}>Cancel</button>
							<button type="button" class="btn btn-primary flex-1" disabled={editSaving} use:directClick={saveNotes}>
								{editSaving ? 'Saving…' : 'Save'}
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	/* Layout-only CSS: colors, spacing, and typography are handled via DaisyUI + Tailwind
	   classes inline. What remains here is structural layout that can't be expressed with
	   utility classes: iOS safe-area insets, the 400%/25% pager math, scoped minimap
	   overrides, and the action-button flash keyframe. */

	/* Markdown preview in mobile input composer */
	:global(.mob-md-preview p) { margin: 0 0 0.3rem 0; }
	:global(.mob-md-preview p:last-child) { margin-bottom: 0; }
	:global(.mob-md-preview code) { font-family: ui-monospace, monospace; font-size: 0.8em; background: oklch(0.20 0.02 250 / 0.4); padding: 0.1rem 0.3rem; border-radius: 3px; }
	:global(.mob-md-preview pre) { background: oklch(0.15 0.02 250 / 0.5); padding: 0.5rem; border-radius: 6px; overflow-x: auto; margin: 0.3rem 0; font-size: 0.75rem; }
	:global(.mob-md-preview pre code) { background: none; padding: 0; }
	:global(.mob-md-preview ul, .mob-md-preview ol) { margin: 0 0 0.3rem 0; padding-left: 1.25rem; }
	:global(.mob-md-preview li) { margin-bottom: 0.125rem; }
	:global(.mob-md-preview strong) { font-weight: 600; }
	:global(.mob-md-preview h1, .mob-md-preview h2, .mob-md-preview h3) { font-weight: 600; margin: 0.25rem 0 0.125rem 0; font-size: 0.9rem; }
	:global(.mob-md-preview blockquote) { border-left: 2px solid oklch(0.50 0.10 200); padding-left: 0.5rem; margin: 0.25rem 0; opacity: 0.8; }

	/* iOS safe-area insets (Tailwind has no utility for env()) */
	.drawer-topbar { padding-top: max(0.5rem, env(safe-area-inset-top)); }
	.mobile-input-row { padding-bottom: max(0.375rem, env(safe-area-inset-bottom)); }

	/* Prevent iOS Safari auto-zoom on focus.
	   iOS zooms the viewport when a form field's computed font-size < 16px.
	   Force 16px on all inputs/textareas inside the mobile drawer at sm/md widths. */
	@media (max-width: 1024px) {
		.mobile-input-row :global(textarea),
		.mobile-input-row :global(input:not([type="file"])) { font-size: 16px !important; }
		:global(.mobile-edit-sheet input:not([type="file"])),
		:global(.mobile-edit-sheet textarea) { font-size: 16px !important; }
	}

	/* Agent strip — mirrors .mobile-state-strip-agent in TasksActive so the
	   /tasks list and session detail share one visual language. Square corners
	   (even on the avatar's internal rounding), no padding, name omitted. */
	.detail-agent-strip {
		width: 100px;
		padding: 0;
	}
	.detail-agent-strip :global(*) {
		border-radius: 0 !important;
	}

	/* Hide horizontal scrollbar on topbar tabs */
	.topbar-tabs { scrollbar-width: none; }
	.topbar-tabs::-webkit-scrollbar { display: none; }

	/* Horizontal pager: 4 pages × 25% each */
	.pager-container {
		flex: 1;
		display: flex;
		width: 400%;
		min-height: 0;
	}

	.pager-page {
		width: 25%;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* Terminal wrapper: fills page and stretches child MobileTerminal */
	.session-card-wrapper {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.completion-eventstack-wrapper {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem;
		background: transparent;
	}

	.completion-loading {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}

	.session-card-wrapper :global(> *) {
		width: 100% !important;
		height: 100%;
		border: none;
		border-radius: 0;
	}


	/* Wrap long terminal lines on mobile */
	.session-card-wrapper :global(pre) {
		white-space: pre-wrap !important;
		word-break: break-all;
	}

	/* Minimap: hidden by default, slides in from right as overlay */
	.session-card-wrapper :global(.relative.flex-1.min-h-0 > .absolute.top-0.right-0.bottom-0) {
		opacity: 0;
		transform: translateX(100%);
		transition: opacity 0.25s ease, transform 0.25s ease;
		pointer-events: none;
		backdrop-filter: blur(1px);
	}

	.session-card-wrapper.mobile-scrolling :global(.relative.flex-1.min-h-0 > .absolute.top-0.right-0.bottom-0) {
		opacity: 0.9;
		transform: translateX(0);
		pointer-events: auto;
	}

	/* Send confirmation — input row outline flash (outline is not clipped by overflow) */
	@keyframes send-row-flash {
		0%   { outline-color: oklch(0.65 0.20 145 / 0); }
		25%  { outline-color: oklch(0.65 0.20 145 / 0.8); }
		100% { outline-color: oklch(0.65 0.20 145 / 0); }
	}

	.mobile-input-row.send-flash {
		outline: 2px solid transparent;
		outline-offset: -1px;
		animation: send-row-flash 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	/* Input text recedes backwards into the screen on send (like session card exit) */
	@keyframes send-input-recede {
		0%   { transform: perspective(600px) translateZ(0) scale(1); opacity: 1; }
		100% { transform: perspective(600px) translateZ(-280px) scale(0.82); opacity: 0; }
	}

	.send-input-recede {
		animation: send-input-recede 0.22s cubic-bezier(0.55, 0.085, 0.68, 0.53) both;
		pointer-events: none;
	}

	/* Send button: scale-up + checkmark pop */
	@keyframes send-btn-sent-anim {
		0%   { transform: scale(1); }
		40%  { transform: scale(1.18); }
		70%  { transform: scale(0.95); }
		100% { transform: scale(1); }
	}

	.send-btn-sent {
		animation: send-btn-sent-anim 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	@media (prefers-reduced-motion: reduce) {
		.mobile-input-row.send-flash,
		.send-input-recede,
		.send-btn-sent { animation: none !important; }
	}

	/* Action button flash animation (fired when user taps a pill action) */
	@keyframes mobile-btn-flash {
		0%   { transform: scale(1); opacity: 1; }
		30%  { transform: scale(0.88); opacity: 0.85; }
		65%  { transform: scale(1.06); opacity: 1; }
		100% { transform: scale(1); opacity: 1; }
	}

	.mobile-btn-flashing {
		animation: mobile-btn-flash 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	/* Hold-to-confirm progress fill for destructive action pills */
	.hold-fill {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		background: currentColor;
		opacity: 0.35;
		transition: width 30ms linear;
		pointer-events: none;
		z-index: 0;
	}

	.hold-active {
		transform: scale(0.97);
		transition: transform 0.1s ease-out;
	}

	/* Right-edge fade signals scrollable overflow on the action pills row.
	   Pinned to wrapper (not scrollable row) so it stays visible while content
	   scrolls underneath. Gradient fades to bg-base-200; visually neutral when
	   no overflow (area behind last pill is already base-200). */
	.action-pills-wrapper {
		position: relative;
	}
	.action-pills-wrapper::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		width: 2rem;
		background: linear-gradient(to right, transparent, var(--color-base-200));
		pointer-events: none;
	}
</style>
