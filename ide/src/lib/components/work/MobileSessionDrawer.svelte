<script lang="ts">
	/**
	 * MobileSessionDrawer Component
	 *
	 * Full-screen drawer with horizontal pager for mobile session viewing.
	 * Slides in from right. Contains swipeable pages:
	 *   Page 0: Terminal (SessionCard with output)
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
	import SessionCard from '$lib/components/work/SessionCard.svelte';
	import AgentAvatar from '$lib/components/AgentAvatar.svelte';
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
	import { setHoveredSession } from '$lib/stores/hoveredSession';
	import type { SessionState, SessionStateAction } from '$lib/config/statusColors';
	import { getIssueTypeVisual, getSessionStateVisual } from '$lib/config/statusColors';
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

	// Compute effective state: closed tasks → 'completed'
	const effectiveState = $derived(
		(task?.status === 'closed' ? 'completed' : (sseState || sessionState || 'idle')) as SessionState
	);

	// Dynamic actions from configurable state actions (same system as MobileSessionFullscreen)
	const MOBILE_PILL_ACTIONS = new Set(['complete', 'complete-kill', 'cleanup', 'pause', 'interrupt', 'attach', 'kill', 'escape', 'convert-to-tasks']);
	const stateActions = $derived.by(() => {
		const actions = getActions(effectiveState);
		return actions.filter(a => MOBILE_PILL_ACTIONS.has(a.id));
	});

	// Track which action button is currently animating
	let activeActionId = $state<string | null>(null);

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

	const STATUS_OPTIONS = [
		{ value: 'open', label: 'Open' },
		{ value: 'in_progress', label: 'In Progress' },
		{ value: 'blocked', label: 'Blocked' },
		{ value: 'closed', label: 'Closed' }
	];
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

	async function saveLabels() {
		const labels = editDraft
			.split(',')
			.map(l => l.trim())
			.filter(Boolean);
		if (await patchTask({ labels })) closeEditor();
	}

	// Mobile input state
	let inputText = $state('');
	let keyboardOpen = $state(false);
	let inputRef: HTMLInputElement | null = $state(null);

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

	// Elapsed time
	let now = $state(Date.now());
	$effect(() => {
		const interval = setInterval(() => now = Date.now(), 1000);
		return () => clearInterval(interval);
	});
	const elapsed = $derived.by(() => {
		if (!created) return null;
		const diff = Math.max(0, Math.floor((now - new Date(created).getTime()) / 1000));
		const h = Math.floor(diff / 3600);
		const m = Math.floor((diff % 3600) / 60);
		const s = diff % 60;
		return {
			hours: String(h).padStart(2, '0'),
			minutes: String(m).padStart(2, '0'),
			seconds: String(s).padStart(2, '0'),
			showHours: h > 0
		};
	});

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
			await onSendInput(text, 'text');
			// Extra Enter matches MobileSessionFullscreen behavior — needed for image paths.
			await new Promise(r => setTimeout(r, 100));
			await onSendInput('', 'enter'); // type='enter' → API sends Enter key (not literal text)
			inputText = '';
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
	function directClick(node: HTMLElement, handler: () => void) {
		node.addEventListener('click', handler);
		return {
			destroy() {
				node.removeEventListener('click', handler);
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
		// Re-attach when DOM changes (SessionCard may re-render with output)
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

	// Fetch terminal output
	async function fetchOutput() {
		if (!sessionName) return;
		try {
			const resp = await fetch(`/api/work/${encodeURIComponent(sessionName)}/output`);
			if (resp.ok) {
				const data = await resp.json();
				output = data.output || '';
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

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			dismissDrawer();
		}
	}

	onMount(() => {
		// Delay visible by one tick so Svelte transitions trigger on insert
		requestAnimationFrame(() => visible = true);
		isMobileFullscreenOpen.set(true);
		setHoveredSession(sessionName);

		// Start polling output
		fetchOutput();
		pollInterval = setInterval(fetchOutput, 1000);
	});

	onDestroy(() => {
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
			<button class="topbar-dismiss-col self-stretch flex items-center justify-center w-10 -my-1 flex-shrink-0 rounded-md text-base-content/50 active:bg-base-300 active:text-base-content transition-colors" use:directClick={dismissDrawer} title="Go back">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="18" height="18">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
				</svg>
			</button>

			<div class="topbar-tabs flex-1 flex gap-0.5 items-center justify-center overflow-x-auto">
				{#each PAGES as page, i}
					<button
						class="px-2 py-1 text-[0.6875rem] font-medium whitespace-nowrap rounded-md transition-colors {i === currentPage ? 'text-base-content bg-base-300' : 'text-base-content/50 bg-transparent active:bg-base-300/70'}"
						use:directClick={() => navigateToPage(i)}
					>{page}</button>
				{/each}
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
			<!-- Page 0: Terminal / SessionCard -->
			<div class="pager-page">
				<!-- Custom mobile header — same swipe-card design as TasksActive standalone tasks -->
				{#if task}
					{@const typeVisual = getIssueTypeVisual(task.issue_type)}
					{@const stateVisual = getSessionStateVisual(sseState || 'idle')}
					{@const priorityClass = task.priority === 0 ? 'text-error bg-error/15' : task.priority === 1 ? 'text-warning bg-warning/15' : 'text-info bg-info/15'}
					<div class="border-b border-base-300 flex-shrink-0" style="border-left: 3px solid {stateVisual.accent};">
						<div class="flex items-stretch min-h-0">
							<!-- Left strip: large avatar + split agent name (matches TasksActive swipe card) -->
							<div class="w-[68px] flex-shrink-0 flex flex-col items-center justify-center gap-1.5 p-1" style="background: {stateVisual.bgTint};">
								<AgentAvatar name={agentName} size={54} showRing={false} shape="rounded" />
								<div class="flex flex-col items-center leading-[1.1] text-[0.5625rem] font-semibold uppercase tracking-wide text-base-content/60 text-center max-w-full overflow-hidden opacity-85" title={agentName}>
									{#each splitAgentName(agentName) as part}
										<span class="max-w-full overflow-hidden text-ellipsis whitespace-nowrap">{part}</span>
									{/each}
								</div>
							</div>
							<!-- Right body: title, description, badges row -->
							<div class="flex-1 min-w-0 px-3 py-2.5 flex flex-col gap-[0.2rem]">
								<div class="min-w-0 text-[0.9375rem] font-semibold text-base-content overflow-hidden text-ellipsis whitespace-nowrap" title={task.title}>{task.title || task.id}</div>
								{#if task.description}
									<div class="min-w-0 text-[0.6875rem] text-base-content/60 overflow-hidden text-ellipsis whitespace-nowrap leading-snug">{task.description}</div>
								{/if}
								<div class="flex items-center gap-1 text-[0.625rem] text-base-content/50 flex-wrap mt-0.5">
									<button class="font-mono text-[0.625rem] bg-transparent border-none p-0 cursor-pointer" style="color: {stateVisual.accent};" onclick={(e) => copyMobileTaskId(e, task.id)} title="Click to copy task ID">{copiedMobileTaskId === task.id ? '✓' : task.id}</button>
									{#if elapsed}
										<span class="text-base-content/30">·</span>
										<span class="font-mono text-[0.625rem] text-base-content/50">{#if elapsed.showHours}{elapsed.hours}:{/if}{elapsed.minutes}:{elapsed.seconds}</span>
									{/if}
									{#if task.issue_type}
										<span class="text-base-content/30">·</span>
										<span class="text-[0.6875rem]" title={typeVisual.label}>{typeVisual.icon}</span>
									{/if}
									{#if task.priority != null && task.priority <= 2}
										<span class="text-base-content/30">·</span>
										<span class="text-[0.5625rem] font-bold py-px px-1 rounded {priorityClass}">P{task.priority}</span>
									{/if}
									<span class="inline-flex items-center text-[0.5625rem] font-semibold leading-none ml-auto flex-shrink-0 whitespace-nowrap tracking-wide" style="color: {stateVisual.accent};">{stateVisual.shortLabel}</span>
								</div>
							</div>
						</div>
					</div>
				{/if}
				<div class="session-card-wrapper" class:mobile-scrolling={mobileScrolling} bind:this={wrapperRef}>
					<SessionCard
						mode="agent"
						{sessionName}
						{agentName}
						{task}
						{output}
						{tokens}
						{cost}
						{sseState}
						{sseStateTimestamp}
						{created}
						{attached}
						headerless={true}
						hideInput={true}
						onKillSession={() => {
							dismissDrawer();
							onKillSession();
						}}
						onInterrupt={() => {
							fetch(`/api/work/${encodeURIComponent(sessionName)}/input`, {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ type: 'ctrl-c' })
							});
						}}
						onAttachTerminal={onAttachSession}
						onTaskClick={(taskId) => onViewTask(taskId)}
						onSendInput={(text, type) => onSendInput(text, type)}
					/>
				</div>

				<!-- Mobile Action Buttons Row (dynamic from state actions config) -->
				<div class="flex gap-1.5 px-2 py-1.5 bg-base-200 border-t border-base-300 flex-shrink-0 overflow-x-auto">
					{#each stateActions as action (action.id)}
						<button
							class="flex items-center gap-1 px-2 py-[0.3rem] text-[0.6875rem] font-medium rounded-md whitespace-nowrap cursor-pointer flex-shrink-0 border transition-colors active:brightness-125 {getPillColorClass(action.variant)}"
							class:mobile-btn-flashing={activeActionId === action.id}
							use:directClick={() => executePillAction(action)}
							title={action.description || action.label}
						>
							<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="14" height="14">
								<path stroke-linecap="round" stroke-linejoin="round" d={action.icon} />
							</svg>
							<span>{action.label}</span>
						</button>
					{/each}
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

				<!-- Mobile Input Row: [keyboard dropup | input | send] -->
				<div class="mobile-input-row flex items-center gap-1.5 px-2 py-1.5 bg-base-100 border-t border-base-300 flex-shrink-0">
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

					<!-- Input field -->
					<input
						type="text"
						class="flex-1 min-w-0 h-9 px-2.5 text-[0.8125rem] font-mono text-base-content bg-base-200 border border-base-300 rounded-lg outline-none focus:border-info transition-colors placeholder:text-base-content/40"
						placeholder="Type and press Enter..."
						bind:value={inputText}
						bind:this={inputRef}
						use:directKeydown={(e) => {
							if (e.key === 'Enter' && (inputText.trim() || pendingAttachments.some(a => !a.uploading))) {
								sendWithAttachments();
							}
						}}
					/>

					<!-- Send button -->
					<button
						class="flex items-center justify-center w-9 h-9 rounded-lg border cursor-pointer flex-shrink-0 transition-colors disabled:opacity-40 disabled:cursor-default {hasSendable ? 'bg-info border-info text-info-content active:bg-info/80' : 'bg-base-200 border-base-300 text-base-content/40'}"
						aria-label="Send message"
						disabled={!hasSendable}
						use:directClick={sendWithAttachments}
					>
						<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="18" height="18">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
						</svg>
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
										onclick={() => openEditor('title')}
										aria-label="Edit title"
									>
										{task.title || 'Untitled'}
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
									onclick={() => openEditor('status')}
									aria-label="Edit status"
								>
									{task.status.replace('_', ' ')}
								</button>
								<button
									type="button"
									class="badge badge-sm {getPriorityBadgeClass(task.priority)} badge-outline uppercase tracking-wide cursor-pointer active:scale-95 transition-transform"
									onclick={() => openEditor('priority')}
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
								class="text-left w-full text-sm text-base-content/80 leading-relaxed whitespace-pre-wrap bg-base-200 hover:bg-base-300 active:bg-base-300 border border-base-300 p-3 rounded-lg cursor-pointer transition-colors"
								onclick={() => openEditor('description')}
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
									onclick={() => openEditor('labels')}
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
							<div class="mb-5">
								<div class="text-center py-8 text-base-content/50 text-sm">Loading task details...</div>
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
							<TaskFieldLabel>Attachments</TaskFieldLabel>
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
									<p class="text-sm">No attachments</p>
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
							{#if fullTask?.notes}
								<div class="text-sm text-base-content/80 leading-relaxed whitespace-pre-wrap bg-base-200 border border-base-300 p-3 rounded-lg">{fullTask.notes}</div>
							{:else}
								<div class="flex flex-col items-center gap-3 py-12 text-base-content/40">
									<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" width="32" height="32">
										<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
									</svg>
									<p class="text-sm">No notes</p>
								</div>
							{/if}
						</div>
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
			onclick={closeEditor}
			onkeydown={(e) => { if (e.key === 'Escape') closeEditor(); }}
			transition:fade={{ duration: 150 }}
		>
			<div
				class="w-full max-w-lg bg-base-100 rounded-t-2xl border-t border-base-300 shadow-2xl p-4 pb-8"
				role="dialog"
				aria-modal="true"
				aria-label="Edit {editMode}"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
				transition:fly={{ y: 300, duration: 200, easing: cubicOut }}
			>
				<!-- Drag handle -->
				<div class="w-10 h-1 bg-base-300 rounded-full mx-auto mb-4"></div>

				<div class="flex items-center justify-between mb-3">
					<h3 class="text-base font-semibold capitalize">Edit {editMode}</h3>
					<button
						type="button"
						class="btn btn-sm btn-ghost btn-circle"
						onclick={closeEditor}
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
								onclick={() => saveStatus(opt.value)}
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
								onclick={() => savePriority(opt.value)}
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
							bind:value={editDraft}
							placeholder="Task title"
							disabled={editSaving}
							onkeydown={(e) => { if (e.key === 'Enter') saveTitle(); }}
						/>
						<div class="flex gap-2">
							<button type="button" class="btn btn-outline flex-1" disabled={editSaving} onclick={closeEditor}>Cancel</button>
							<button type="button" class="btn btn-primary flex-1" disabled={editSaving} onclick={saveTitle}>
								{editSaving ? 'Saving…' : 'Save'}
							</button>
						</div>
					</div>
				{:else if editMode === 'description'}
					<div class="flex flex-col gap-3">
						<textarea
							class="textarea textarea-bordered w-full h-40 font-mono text-sm"
							bind:value={editDraft}
							placeholder="Task description"
							disabled={editSaving}
						></textarea>
						<div class="flex gap-2">
							<button type="button" class="btn btn-outline flex-1" disabled={editSaving} onclick={closeEditor}>Cancel</button>
							<button type="button" class="btn btn-primary flex-1" disabled={editSaving} onclick={saveDescription}>
								{editSaving ? 'Saving…' : 'Save'}
							</button>
						</div>
					</div>
				{:else if editMode === 'labels'}
					<div class="flex flex-col gap-3">
						<input
							type="text"
							class="input input-bordered w-full"
							bind:value={editDraft}
							placeholder="comma, separated, labels"
							disabled={editSaving}
							onkeydown={(e) => { if (e.key === 'Enter') saveLabels(); }}
						/>
						<p class="text-xs text-base-content/60">Separate multiple labels with commas.</p>
						<div class="flex gap-2">
							<button type="button" class="btn btn-outline flex-1" disabled={editSaving} onclick={closeEditor}>Cancel</button>
							<button type="button" class="btn btn-primary flex-1" disabled={editSaving} onclick={saveLabels}>
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

	/* iOS safe-area insets (Tailwind has no utility for env()) */
	.drawer-topbar { padding-top: max(0.5rem, env(safe-area-inset-top)); }
	.mobile-input-row { padding-bottom: max(0.375rem, env(safe-area-inset-bottom)); }

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

	/* Session card wrapper: fills page and stretches child SessionCard */
	.session-card-wrapper {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.session-card-wrapper :global(> *) {
		width: 100% !important;
		height: 100%;
		border: none;
		border-radius: 0;
	}

	/* Mobile minimap overrides — hidden by default, slides in on scroll.
	   Targets SessionCard's output+minimap parent via structural selectors. */
	.session-card-wrapper :global(.relative.flex-1.min-h-0) {
		overflow-x: hidden;
	}

	.session-card-wrapper :global(.relative.flex-1.min-h-0 > .absolute.inset-0) {
		right: 0 !important;
		overflow-x: hidden !important;
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
</style>
