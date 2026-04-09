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
	import { isMobileFullscreenOpen } from '$lib/stores/drawerStore';
	import { setHoveredSession } from '$lib/stores/hoveredSession';
	import type { SessionState, SessionStateAction } from '$lib/config/statusColors';
	import { getIssueTypeVisual, getSessionStateVisual } from '$lib/config/statusColors';
	import { getActions, loadUserConfig, getIsLoaded } from '$lib/stores/stateActionsConfig.svelte';

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

	// Execute a pill action
	async function executePillAction(action: SessionStateAction) {
		if (action.id === 'interrupt') {
			sendKey('ctrl-c');
		} else if (action.id === 'attach') {
			onAttachSession();
		} else if (action.id === 'kill') {
			dismissDrawer();
			onKillSession();
		} else if (action.id === 'complete') {
			await onSendInput('/jat:complete', 'text');
		} else {
			await onAction(action.id);
		}
	}

	// Pill color mapping from action variant
	function getPillColorClass(variant: SessionStateAction['variant']): string {
		switch (variant) {
			case 'success': return 'complete-btn';
			case 'error': return 'danger-btn';
			case 'warning': return 'warning-btn';
			case 'info': return 'info-btn';
			default: return '';
		}
	}

	// Terminal output state
	let output = $state('');
	let pollInterval: ReturnType<typeof setInterval> | null = null;

	// Full task detail (fetched from API)
	let fullTask = $state<Record<string, any> | null>(null);
	let taskLoading = $state(false);

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

	function getPriorityColor(p: number | undefined): string {
		switch (p) {
			case 0: return 'oklch(0.70 0.20 25)'; // red
			case 1: return 'oklch(0.75 0.15 85)'; // amber
			case 2: return 'oklch(0.70 0.15 230)'; // blue
			default: return 'oklch(0.60 0.02 250)'; // gray
		}
	}

	function getStatusColor(s: string): string {
		switch (s) {
			case 'open': return 'oklch(0.70 0.15 230)';
			case 'in_progress': return 'oklch(0.75 0.15 85)';
			case 'blocked': return 'oklch(0.70 0.20 25)';
			case 'closed': return 'oklch(0.65 0.18 145)';
			default: return 'oklch(0.60 0.02 250)';
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
		class="drawer-backdrop"
		transition:fade={{ duration: 300 }}
		use:directClick={dismissDrawer}
	></div>

	<!-- Drawer Panel (full screen, slides up from bottom) -->
	<div
		class="drawer-panel"
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
			<div class="drop-overlay">
				<div class="drop-content">
					<svg class="w-10 h-10" style="color: oklch(0.75 0.15 250);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
					</svg>
					<span class="drop-text">Drop to attach</span>
				</div>
			</div>
		{/if}

		<!-- Top bar: back column + centered tabs + close column -->
		<div class="drawer-topbar">
			<button class="topbar-dismiss-col" use:directClick={dismissDrawer} title="Go back">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" width="18" height="18">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
				</svg>
			</button>

			<div class="topbar-tabs">
				{#each PAGES as page, i}
					<button
						class="topbar-tab"
						class:active={i === currentPage}
						use:directClick={() => navigateToPage(i)}
					>{page}</button>
				{/each}
			</div>

			<button class="topbar-dismiss-col" use:directClick={dismissDrawer} title="Close">
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
					<div class="mobile-task-header">
						<div class="mobile-card-inner">
							<!-- Left strip: large avatar + split agent name (matches TasksActive swipe card) -->
							<div class="mobile-state-strip mobile-state-strip-agent" style="background: {stateVisual.bgTint}; border-right: 2px solid {stateVisual.accent};">
								<AgentAvatar name={agentName} size={36} showRing={true} sessionState={sseState || 'idle'} />
								<div class="mobile-strip-agent-label" title={agentName}>
									{#each splitAgentName(agentName) as part}
										<span>{part}</span>
									{/each}
								</div>
							</div>
							<!-- Right body: title, description, badges row -->
							<div class="mobile-card-body">
								<div class="mobile-title" title={task.title}>{task.title || task.id}</div>
								{#if task.description}
									<div class="mobile-description">{task.description}</div>
								{/if}
								<div class="mobile-card-row2">
									<span class="mobile-task-id" style="color: {stateVisual.accent};">{task.id}</span>
									{#if elapsed}
										<span class="mobile-separator">·</span>
										<span class="mobile-elapsed">{#if elapsed.showHours}{elapsed.hours}:{/if}{elapsed.minutes}:{elapsed.seconds}</span>
									{/if}
									{#if task.issue_type}
										<span class="mobile-separator">·</span>
										<span class="mobile-type-icon" title={typeVisual.label}>{typeVisual.icon}</span>
									{/if}
									{#if task.priority != null && task.priority <= 2}
										<span class="mobile-separator">·</span>
										<span class="mobile-priority mobile-priority-{task.priority}">P{task.priority}</span>
									{/if}
									<span class="mobile-state-badge" style="color: {stateVisual.accent};">{stateVisual.shortLabel}</span>
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
				<div class="mobile-actions-row">
					{#each stateActions as action (action.id)}
						<button
							class="mobile-action-btn {getPillColorClass(action.variant)}"
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
					<div class="attachments-row">
						{#each pendingAttachments as att (att.id)}
							<div class="attachment-chip" class:uploading={att.uploading}>
								{#if att.previewUrl}
									<img src={att.previewUrl} alt={att.name} class="attachment-thumb" />
								{:else}
									<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" width="16" height="16" style="color: oklch(0.65 0.12 250);">
										<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
									</svg>
								{/if}
								<span class="attachment-name">{att.name}</span>
								{#if att.uploading}
									<span class="attachment-uploading">…</span>
								{:else}
									<button class="attachment-remove" use:directClick={() => removeAttachment(att.id)} aria-label="Remove">×</button>
								{/if}
							</div>
						{/each}
					</div>
				{/if}

				<!-- Mobile Input Row: [keyboard dropup | input | send] -->
				<div class="mobile-input-row">
					<!-- Keyboard dropup -->
					<div class="keyboard-dropup">
						<button
							class="keyboard-btn"
							use:directClick={() => keyboardOpen = !keyboardOpen}
							title="Keyboard keys"
						>
							<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" width="18" height="18">
								<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 17.25V6.75zM6 9.75h.008v.008H6V9.75zm0 3h.008v.008H6v-.008zm3-3h.008v.008H9V9.75zm0 3h.008v.008H9v-.008zm3-3h.008v.008H12V9.75zm0 3h.008v.008H12v-.008zm3-3h.008v.008H15V9.75zm0 3h.008v.008H15v-.008zM9 15.75h6" />
							</svg>
						</button>
						{#if keyboardOpen}
							<div class="keyboard-menu">
								<div class="keyboard-row">
									<button class="key-btn" use:directClick={() => sendKey('up')}>↑</button>
									<button class="key-btn" use:directClick={() => sendKey('down')}>↓</button>
									<button class="key-btn" use:directClick={() => sendKey('left')}>←</button>
									<button class="key-btn" use:directClick={() => sendKey('right')}>→</button>
								</div>
								<div class="keyboard-row">
									<button class="key-btn wide" use:directClick={() => sendKey('enter')}>Enter ⤶</button>
									<button class="key-btn wide" use:directClick={() => sendKey('tab')}>Tab ⇥</button>
									<button class="key-btn wide" use:directClick={() => sendKey('escape')}>ESC</button>
									<button class="key-btn wide" use:directClick={() => sendKey('ctrl-c')}>^C</button>
									<button class="key-btn wide" use:directClick={() => sendKey('ctrl-l')}>^L</button>
								</div>
							</div>
						{/if}
					</div>

					<!-- Input field -->
					<input
						type="text"
						class="mobile-input"
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
						class="send-btn"
						aria-label="Send message"
						class:has-text={inputText.trim().length > 0 || pendingAttachments.some(a => !a.uploading)}
						disabled={!inputText.trim() && !pendingAttachments.some(a => !a.uploading)}
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
				<div class="task-detail-page">
					{#if task}
						<!-- Task Header -->
						<div class="task-header">
							<div class="task-id-row">
								<span class="task-id">{task.id}</span>
								{#if task.issue_type}
									<span class="task-type-badge">{task.issue_type}</span>
								{/if}
							</div>
							<h2 class="task-title">{task.title || 'Untitled'}</h2>
						</div>

						<!-- Status & Priority Row -->
						<div class="task-meta-row">
							<div class="meta-badge" style="border-color: {getStatusColor(task.status)}; color: {getStatusColor(task.status)}">
								{task.status.replace('_', ' ')}
							</div>
							{#if task.priority !== undefined && task.priority !== null}
								<div class="meta-badge" style="border-color: {getPriorityColor(task.priority)}; color: {getPriorityColor(task.priority)}">
									{getPriorityLabel(task.priority)}
								</div>
							{/if}
							{#if agentName}
								<div class="meta-badge agent-badge">
									{agentName}
								</div>
							{/if}
						</div>

						<!-- Session Info -->
						<div class="detail-section">
							<h4 class="section-label">Session</h4>
							<div class="session-info-grid">
								{#if created}
									<div class="info-item">
										<span class="info-key">Started</span>
										<span class="info-value">{formatTimeAgo(created)}</span>
									</div>
								{/if}
								{#if tokens > 0}
									<div class="info-item">
										<span class="info-key">Tokens</span>
										<span class="info-value">{tokens > 1000000 ? `${(tokens / 1000000).toFixed(1)}M` : tokens > 1000 ? `${(tokens / 1000).toFixed(0)}K` : tokens}</span>
									</div>
								{/if}
								{#if cost > 0}
									<div class="info-item">
										<span class="info-key">Cost</span>
										<span class="info-value">${cost.toFixed(2)}</span>
									</div>
								{/if}
								{#if sseState}
									<div class="info-item">
										<span class="info-key">State</span>
										<span class="info-value">{sseState}</span>
									</div>
								{/if}
							</div>
						</div>

						<!-- Description -->
						{#if task.description || fullTask?.description}
							<div class="detail-section">
								<h4 class="section-label">Description</h4>
								<div class="description-content">
									{task.description || fullTask?.description}
								</div>
							</div>
						{/if}

						<!-- Full task details (loaded from API) -->
						{#if fullTask}
							{#if fullTask.labels?.length}
								<div class="detail-section">
									<h4 class="section-label">Labels</h4>
									<div class="labels-row">
										{#each fullTask.labels as label}
											<span class="label-badge">{label}</span>
										{/each}
									</div>
								</div>
							{/if}

							{#if fullTask.depends_on?.length}
								<div class="detail-section">
									<h4 class="section-label">Depends On</h4>
									<div class="dep-list">
										{#each fullTask.depends_on as dep}
											<div class="dep-item">
												<span class="dep-id">{typeof dep === 'string' ? dep : dep.id}</span>
												{#if typeof dep === 'object' && dep.title}
													<span class="dep-title">{dep.title}</span>
												{/if}
											</div>
										{/each}
									</div>
								</div>
							{/if}

							{#if fullTask.blocked_by?.length}
								<div class="detail-section">
									<h4 class="section-label">Blocks</h4>
									<div class="dep-list">
										{#each fullTask.blocked_by as dep}
											<div class="dep-item">
												<span class="dep-id">{typeof dep === 'string' ? dep : dep.id}</span>
												{#if typeof dep === 'object' && dep.title}
													<span class="dep-title">{dep.title}</span>
												{/if}
											</div>
										{/each}
									</div>
								</div>
							{/if}

							{#if fullTask.created_at || fullTask.updated_at}
								<div class="detail-section">
									<h4 class="section-label">Dates</h4>
									<div class="session-info-grid">
										{#if fullTask.created_at}
											<div class="info-item">
												<span class="info-key">Created</span>
												<span class="info-value">{formatDate(fullTask.created_at)}</span>
											</div>
										{/if}
										{#if fullTask.updated_at}
											<div class="info-item">
												<span class="info-key">Updated</span>
												<span class="info-value">{formatDate(fullTask.updated_at)}</span>
											</div>
										{/if}
									</div>
								</div>
							{/if}
						{:else if taskLoading}
							<div class="detail-section">
								<div class="loading-indicator">Loading task details...</div>
							</div>
						{/if}
					{:else}
						<div class="no-task">
							<p>No task assigned to this session</p>
						</div>
					{/if}
				</div>
			</div>

				<!-- Page 2: Attachments -->
				<div class="pager-page">
					<div class="task-detail-page">
						<div class="detail-section">
							<h4 class="section-label">Attachments</h4>
							{#if fullTask?.attachments?.length}
								<div class="attachments-list">
									{#each fullTask.attachments as attachment}
										<div class="attachment-item">
											<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" width="16" height="16">
												<path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
											</svg>
											<span class="attachment-name">{attachment.name || attachment.filename || 'Attachment'}</span>
										</div>
									{/each}
								</div>
							{:else}
								<div class="empty-page-message">
									<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" width="32" height="32">
										<path stroke-linecap="round" stroke-linejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
									</svg>
									<p>No attachments</p>
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Page 3: Notes -->
				<div class="pager-page">
					<div class="task-detail-page">
						<div class="detail-section">
							<h4 class="section-label">Notes</h4>
							{#if fullTask?.notes}
								<div class="description-content">{fullTask.notes}</div>
							{:else}
								<div class="empty-page-message">
									<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" width="32" height="32">
										<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
									</svg>
									<p>No notes</p>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.drawer-backdrop {
		position: fixed;
		inset: 0;
		z-index: 49;
		background: oklch(0 0 0 / 0.6);
	}

	.drawer-panel {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		flex-direction: column;
		background: oklch(0.14 0.01 250);
		overflow: hidden;
	}

	/* Top bar */
	.drawer-topbar {
		display: flex;
		align-items: center;
		padding: 0.5rem 0.75rem;
		background: oklch(0.16 0.01 250);
		border-bottom: 1px solid oklch(0.25 0.02 250);
		flex-shrink: 0;
		padding-top: max(0.5rem, env(safe-area-inset-top));
		gap: 0.5rem;
	}

	/* Full-height dismiss columns flanking the tabs */
	.topbar-dismiss-col {
		display: flex;
		align-items: center;
		justify-content: center;
		align-self: stretch;
		width: 2.5rem;
		flex-shrink: 0;
		background: transparent;
		border: none;
		color: oklch(0.50 0.02 250);
		cursor: pointer;
		transition: color 0.15s, background 0.15s;
		border-radius: 0.375rem;
		margin: -0.25rem 0;
	}

	.topbar-dismiss-col:active {
		background: oklch(0.25 0.02 250);
		color: oklch(0.80 0.02 250);
	}

	.topbar-tabs {
		flex: 1;
		display: flex;
		gap: 0.125rem;
		align-items: center;
		justify-content: center;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.topbar-tabs::-webkit-scrollbar {
		display: none;
	}

	.topbar-tab {
		padding: 0.25rem 0.5rem;
		font-size: 0.6875rem;
		font-weight: 500;
		color: oklch(0.50 0.02 250);
		background: transparent;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		white-space: nowrap;
		transition: all 0.15s;
	}

	.topbar-tab.active {
		color: oklch(0.90 0.02 250);
		background: oklch(0.25 0.02 250);
	}

	.topbar-tab:active {
		background: oklch(0.22 0.02 250);
	}

	/* Horizontal pager */
	.pager-container {
		flex: 1;
		display: flex;
		width: 400%; /* 4 pages */
		min-height: 0;
	}

	.pager-page {
		width: 25%; /* Each page = 100% of viewport */
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.session-card-wrapper {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	/* Make SessionCard fill the page */
	.session-card-wrapper :global(> *) {
		width: 100% !important;
		height: 100%;
		border: none;
		border-radius: 0;
	}

	/* Mobile minimap: hidden by default, revealed on scroll.
	   SessionCard sets inline right:60px on the terminal scroll container when minimap is enabled.
	   We override to right:0 by default, then restore to 60px when scrolling.
	   Selectors target the output+minimap parent's children by structure. */

	/* The output+minimap parent container */
	.session-card-wrapper :global(.relative.flex-1.min-h-0) {
		overflow-x: hidden;
	}

	/* Terminal scroll container: always full-width, minimap overlays on top */
	.session-card-wrapper :global(.relative.flex-1.min-h-0 > .absolute.inset-0) {
		right: 0 !important;
		overflow-x: hidden !important;
	}

	/* Wrap long terminal lines on mobile instead of scrolling */
	.session-card-wrapper :global(pre) {
		white-space: pre-wrap !important;
		word-break: break-all;
	}

	/* Minimap container: hidden by default, slides in from right as overlay */
	.session-card-wrapper :global(.relative.flex-1.min-h-0 > .absolute.top-0.right-0.bottom-0) {
		opacity: 0;
		transform: translateX(100%);
		transition: opacity 0.25s ease, transform 0.25s ease;
		pointer-events: none;
		/* Semi-transparent so user can still read text behind it */
		backdrop-filter: blur(1px);
	}

	/* When scrolling, slide minimap in from right — no layout shift */
	.session-card-wrapper.mobile-scrolling :global(.relative.flex-1.min-h-0 > .absolute.top-0.right-0.bottom-0) {
		opacity: 0.9;
		transform: translateX(0);
		pointer-events: auto;
	}

	/* Task Detail Page */
	.task-detail-page {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		-webkit-overflow-scrolling: touch;
	}

	.task-header {
		margin-bottom: 1rem;
	}

	.task-id-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.task-id {
		font-family: monospace;
		font-size: 0.75rem;
		color: oklch(0.65 0.12 230);
		background: oklch(0.65 0.12 230 / 0.12);
		padding: 0.125rem 0.5rem;
		border-radius: 0.25rem;
	}

	.task-type-badge {
		font-size: 0.6875rem;
		color: oklch(0.70 0.08 250);
		background: oklch(0.25 0.02 250);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.task-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: oklch(0.90 0.02 250);
		line-height: 1.4;
		margin: 0;
	}

	.task-meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-bottom: 1.25rem;
	}

	.meta-badge {
		font-size: 0.6875rem;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		border-radius: 0.375rem;
		border: 1px solid;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.agent-badge {
		border-color: oklch(0.60 0.15 200);
		color: oklch(0.70 0.15 200);
	}

	.detail-section {
		margin-bottom: 1.25rem;
	}

	.section-label {
		font-size: 0.6875rem;
		font-weight: 600;
		color: oklch(0.55 0.02 250);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0 0 0.5rem 0;
	}

	.session-info-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		background: oklch(0.18 0.01 250);
		padding: 0.5rem 0.625rem;
		border-radius: 0.375rem;
	}

	.info-key {
		font-size: 0.625rem;
		color: oklch(0.50 0.02 250);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.info-value {
		font-size: 0.8125rem;
		color: oklch(0.85 0.02 250);
		font-weight: 500;
	}

	.description-content {
		font-size: 0.8125rem;
		color: oklch(0.75 0.02 250);
		line-height: 1.6;
		white-space: pre-wrap;
		background: oklch(0.18 0.01 250);
		padding: 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid oklch(0.22 0.02 250);
	}

	.labels-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.label-badge {
		font-size: 0.6875rem;
		color: oklch(0.70 0.08 250);
		background: oklch(0.22 0.02 250);
		padding: 0.1875rem 0.5rem;
		border-radius: 0.25rem;
		border: 1px solid oklch(0.28 0.02 250);
	}

	.dep-list {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.dep-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.625rem;
		background: oklch(0.18 0.01 250);
		border-radius: 0.375rem;
		border: 1px solid oklch(0.22 0.02 250);
	}

	.dep-id {
		font-family: monospace;
		font-size: 0.6875rem;
		color: oklch(0.65 0.12 230);
		flex-shrink: 0;
	}

	.dep-title {
		font-size: 0.75rem;
		color: oklch(0.65 0.02 250);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.loading-indicator {
		text-align: center;
		padding: 2rem;
		color: oklch(0.50 0.02 250);
		font-size: 0.8125rem;
	}

	.no-task {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: oklch(0.45 0.02 250);
		font-size: 0.875rem;
	}

	.empty-page-message {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 3rem 1rem;
		color: oklch(0.40 0.02 250);
	}

	.empty-page-message p {
		font-size: 0.875rem;
	}

	.attachments-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.attachment-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: oklch(0.18 0.01 250);
		border-radius: 0.375rem;
		border: 1px solid oklch(0.25 0.02 250);
		color: oklch(0.75 0.02 250);
		font-size: 0.8125rem;
	}

	.attachment-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Custom mobile header — same swipe-card design as TasksActive standalone tasks */
	.mobile-task-header {
		border-bottom: 1px solid oklch(0.22 0.02 250);
		flex-shrink: 0;
	}

	/* Inner flex row: left strip + right body */
	.mobile-card-inner {
		display: flex;
		align-items: stretch;
		min-height: 0;
	}

	/* Left strip: avatar + split agent name */
	.mobile-state-strip {
		width: 28px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mobile-state-strip-agent {
		width: 62px;
		padding: 8px 4px;
		flex-direction: column;
		gap: 4px;
	}

	/* CamelCase-split agent name below avatar */
	.mobile-strip-agent-label {
		display: flex;
		flex-direction: column;
		align-items: center;
		line-height: 1.1;
		font-size: 0.5rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: oklch(0.60 0.015 250);
		font-family: system-ui, -apple-system, sans-serif;
		text-align: center;
		max-width: 100%;
		overflow: hidden;
		opacity: 0.85;
	}

	.mobile-strip-agent-label span {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Right content area */
	.mobile-card-body {
		flex: 1;
		min-width: 0;
		padding: 0.625rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.mobile-title {
		min-width: 0;
		font-size: 0.9375rem;
		font-weight: 600;
		color: oklch(0.88 0.02 250);
		font-family: system-ui, -apple-system, sans-serif;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.mobile-description {
		min-width: 0;
		font-size: 0.6875rem;
		color: oklch(0.60 0.02 250);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		line-height: 1.4;
	}

	.mobile-card-row2 {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.625rem;
		color: oklch(0.50 0.02 250);
		flex-wrap: wrap;
		margin-top: 0.125rem;
	}

	.mobile-task-id {
		font-family: monospace;
		font-size: 0.625rem;
	}

	.mobile-elapsed {
		font-family: monospace;
		font-size: 0.625rem;
		color: oklch(0.50 0.02 250);
	}

	.mobile-separator {
		color: oklch(0.35 0.02 250);
	}

	.mobile-type-icon {
		font-size: 0.6875rem;
	}

	.mobile-priority {
		font-size: 0.5625rem;
		font-weight: 700;
		padding: 0.0625rem 0.25rem;
		border-radius: 0.25rem;
	}

	.mobile-priority-0 {
		color: oklch(0.85 0.18 25);
		background: oklch(0.85 0.18 25 / 0.15);
	}

	.mobile-priority-1 {
		color: oklch(0.80 0.15 85);
		background: oklch(0.80 0.15 85 / 0.15);
	}

	.mobile-priority-2 {
		color: oklch(0.75 0.12 230);
		background: oklch(0.75 0.12 230 / 0.15);
	}

	.mobile-state-badge {
		display: inline-flex;
		align-items: center;
		font-size: 0.5625rem;
		font-weight: 600;
		line-height: 1;
		margin-left: auto;
		flex-shrink: 0;
		white-space: nowrap;
		letter-spacing: 0.03em;
	}

	/* === Mobile Action Buttons Row === */
	.mobile-actions-row {
		display: flex;
		gap: 0.375rem;
		padding: 0.375rem 0.5rem;
		background: oklch(0.16 0.01 250);
		border-top: 1px solid oklch(0.22 0.02 250);
		flex-shrink: 0;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.mobile-action-btn {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.3rem 0.5rem;
		font-size: 0.6875rem;
		font-weight: 500;
		color: oklch(0.80 0.02 250);
		background: oklch(0.22 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.375rem;
		white-space: nowrap;
		cursor: pointer;
		transition: background 0.15s;
		flex-shrink: 0;
	}

	.mobile-action-btn:active {
		background: oklch(0.28 0.02 250);
	}

	.mobile-action-btn.complete-btn {
		color: oklch(0.80 0.15 145);
		border-color: oklch(0.45 0.12 145 / 0.5);
		background: oklch(0.22 0.06 145 / 0.3);
	}

	.mobile-action-btn.danger-btn {
		color: oklch(0.75 0.15 25);
		border-color: oklch(0.45 0.12 25 / 0.4);
		background: oklch(0.22 0.06 25 / 0.2);
	}

	.mobile-action-btn.warning-btn {
		color: oklch(0.80 0.15 85);
		border-color: oklch(0.45 0.12 85 / 0.5);
		background: oklch(0.22 0.06 85 / 0.3);
	}

	.mobile-action-btn.info-btn {
		color: oklch(0.80 0.15 220);
		border-color: oklch(0.45 0.12 220 / 0.5);
		background: oklch(0.22 0.06 220 / 0.3);
	}

	/* === Mobile Input Row === */
	.mobile-input-row {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.5rem;
		background: oklch(0.14 0.01 250);
		border-top: 1px solid oklch(0.22 0.02 250);
		flex-shrink: 0;
		padding-bottom: max(0.375rem, env(safe-area-inset-bottom));
	}

	.keyboard-dropup {
		position: relative;
		flex-shrink: 0;
	}

	.keyboard-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 0.5rem;
		background: oklch(0.22 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		color: oklch(0.70 0.02 250);
		cursor: pointer;
		transition: background 0.15s;
	}

	.keyboard-btn:active {
		background: oklch(0.28 0.02 250);
	}

	.keyboard-menu {
		position: absolute;
		bottom: 100%;
		left: 0;
		margin-bottom: 0.375rem;
		background: oklch(0.20 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.5rem;
		padding: 0.375rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		box-shadow: 0 -4px 16px oklch(0 0 0 / 0.4);
		z-index: 60;
		min-width: 200px;
	}

	.keyboard-row {
		display: flex;
		gap: 0.25rem;
	}

	.key-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.375rem 0.5rem;
		font-family: monospace;
		font-size: 0.75rem;
		color: oklch(0.80 0.02 250);
		background: oklch(0.25 0.02 250);
		border: 1px solid oklch(0.32 0.02 250);
		border-radius: 0.375rem;
		cursor: pointer;
		flex: 1;
		white-space: nowrap;
		transition: background 0.1s;
	}

	.key-btn:active {
		background: oklch(0.35 0.02 250);
	}

	.key-btn.wide {
		flex: 1;
	}

	.mobile-input {
		flex: 1;
		min-width: 0;
		height: 2.25rem;
		padding: 0 0.625rem;
		font-size: 0.8125rem;
		font-family: monospace;
		color: oklch(0.85 0.02 250);
		background: oklch(0.22 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.5rem;
		outline: none;
		transition: border-color 0.15s;
	}

	.mobile-input:focus {
		border-color: oklch(0.50 0.15 230);
	}

	.mobile-input::placeholder {
		color: oklch(0.45 0.02 250);
	}

	.send-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 0.5rem;
		background: oklch(0.25 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		color: oklch(0.50 0.02 250);
		cursor: pointer;
		flex-shrink: 0;
		transition: all 0.15s;
	}

	.send-btn.has-text {
		background: oklch(0.45 0.15 230);
		border-color: oklch(0.55 0.15 230);
		color: oklch(0.95 0.02 250);
	}

	.send-btn:active.has-text {
		background: oklch(0.50 0.15 230);
	}

	.send-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.drop-overlay {
		position: absolute;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		background: oklch(0.25 0.15 250 / 0.9);
		border: 3px dashed oklch(0.65 0.20 250);
		border-radius: inherit;
		pointer-events: none;
	}

	.drop-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.drop-text {
		font-size: 0.875rem;
		font-weight: 600;
		color: oklch(0.85 0.10 250);
	}

	.attachments-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem 0.25rem;
		background: oklch(0.18 0.02 250);
		border-top: 1px solid oklch(0.25 0.02 250);
	}

	.attachment-chip {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.375rem;
		background: oklch(0.22 0.03 250);
		border: 1px solid oklch(0.30 0.04 250);
		border-radius: 0.375rem;
		max-width: 160px;
		opacity: 1;
		transition: opacity 0.15s;
	}

	.attachment-chip.uploading {
		opacity: 0.6;
	}

	.attachment-thumb {
		width: 28px;
		height: 28px;
		object-fit: cover;
		border-radius: 0.25rem;
		flex-shrink: 0;
	}

	.attachment-name {
		font-size: 0.7rem;
		color: oklch(0.75 0.05 250);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
	}

	.attachment-uploading {
		font-size: 0.7rem;
		color: oklch(0.60 0.08 250);
		flex-shrink: 0;
	}

	.attachment-remove {
		flex-shrink: 0;
		width: 16px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.875rem;
		line-height: 1;
		color: oklch(0.55 0.08 250);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		border-radius: 50%;
		transition: color 0.1s;
	}

	.attachment-remove:hover {
		color: oklch(0.70 0.15 25);
	}
</style>
