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
	 * Used by /mobilenew and /tasks routes for mobile session viewing.
	 */

	import { onMount, onDestroy } from 'svelte';
	import SessionCard from '$lib/components/work/SessionCard.svelte';
	import { isMobileFullscreenOpen } from '$lib/stores/drawerStore';
	import { setHoveredSession } from '$lib/stores/hoveredSession';
	import type { SessionState } from '$lib/config/statusColors';

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
	const PAGES = ['Terminal', 'Task Detail'] as const;
	let currentPage = $state(0);
	let pageTranslateX = $state(0); // drag offset during swipe
	let pageTransitioning = $state(false);

	// Visibility animation state
	let visible = $state(false);

	// Terminal output state
	let output = $state('');
	let pollInterval: ReturnType<typeof setInterval> | null = null;

	// Full task detail (fetched from API)
	let fullTask = $state<Record<string, any> | null>(null);
	let taskLoading = $state(false);

	// Mobile input state
	let inputText = $state('');
	let keyboardOpen = $state(false);

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

		// Fetch full task detail when navigating to task page
		if (page === 1 && task?.id && !fullTask) {
			fetchTaskDetail();
		}
	}

	function dismissDrawer() {
		visible = false;
		setHoveredSession(null);
		setTimeout(onClose, 300);
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
	// Each page is 50% of the pager container (which is 200% of viewport).
	// So moving one page = translateX(-50%).
	const pagerTransform = $derived(() => {
		const baseOffset = -(currentPage * 50);
		const dragPercent = (pageTranslateX / window.innerWidth) * 50;
		return `translateX(${baseOffset + dragPercent}%)`;
	});

	onMount(() => {
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

<div use:portalToBody>
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="drawer-backdrop"
		class:visible
		use:directClick={dismissDrawer}
	></div>

	<!-- Drawer Panel (full screen) -->
	<div
		class="drawer-panel"
		class:visible
		use:touchHandlers
	>
		<!-- Top bar: back button + page dots + page label -->
		<div class="drawer-topbar">
			<button class="back-btn" use:directClick={dismissDrawer} title="Close">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="20" height="20">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
				</svg>
			</button>

			<div class="topbar-center">
				<span class="page-label">{PAGES[currentPage]}</span>
				<div class="page-dots">
					{#each PAGES as _, i}
						<button
							class="dot"
							class:active={i === currentPage}
							use:directClick={() => navigateToPage(i)}
						></button>
					{/each}
				</div>
			</div>

			<div class="topbar-spacer"></div>
		</div>

		<!-- Horizontal pager -->
		<div
			class="pager-container"
			style="transform: {pagerTransform()}; {pageTransitioning ? 'transition: transform 0.3s cubic-bezier(0.33, 1, 0.68, 1);' : ''} {swipeDragging ? 'will-change: transform;' : ''}"
		>
			<!-- Page 0: Terminal / SessionCard -->
			<div class="pager-page">
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
						headerless={false}
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

				<!-- Mobile Action Buttons Row -->
				<div class="mobile-actions-row">
					<button class="mobile-action-btn" use:directClick={() => onAttachSession()} title="Attach Terminal">
						<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="14" height="14">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
						</svg>
						<span>Attach</span>
					</button>
					<button class="mobile-action-btn" use:directClick={() => sendKey('ctrl-c')} title="Interrupt (Ctrl+C)">
						<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="14" height="14">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
						</svg>
						<span>Interrupt</span>
					</button>
					<button
						class="mobile-action-btn complete-btn"
						use:directClick={async () => {
							await onSendInput('/jat:complete', 'text');
						}}
						title="Complete Task"
					>
						<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="14" height="14">
							<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
						</svg>
						<span>Complete</span>
					</button>
					<button
						class="mobile-action-btn danger-btn"
						use:directClick={() => {
							dismissDrawer();
							onKillSession();
						}}
						title="Kill Session"
					>
						<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="14" height="14">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
						<span>Kill</span>
					</button>
				</div>

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
						use:directKeydown={(e) => {
							if (e.key === 'Enter' && inputText.trim()) {
								onSendInput(inputText.trim(), 'text');
								inputText = '';
							}
						}}
					/>

					<!-- Send button -->
					<button
						class="send-btn"
						class:has-text={inputText.trim().length > 0}
						disabled={!inputText.trim()}
						use:directClick={() => {
							if (inputText.trim()) {
								onSendInput(inputText.trim(), 'text');
								inputText = '';
							}
						}}
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
		</div>
	</div>
</div>

<style>
	.drawer-backdrop {
		position: fixed;
		inset: 0;
		z-index: 49;
		background: oklch(0 0 0 / 0.6);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.drawer-backdrop.visible {
		opacity: 1;
	}

	.drawer-panel {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		flex-direction: column;
		background: oklch(0.14 0.01 250);
		transform: translateX(100%);
		transition: transform 0.3s cubic-bezier(0.33, 1, 0.68, 1);
		overflow: hidden;
	}

	.drawer-panel.visible {
		transform: translateX(0);
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

	.back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		background: transparent;
		border: none;
		color: oklch(0.75 0.02 250);
		cursor: pointer;
		flex-shrink: 0;
		transition: background 0.15s;
	}

	.back-btn:active {
		background: oklch(0.25 0.02 250);
	}

	.topbar-center {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.page-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: oklch(0.80 0.02 250);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.page-dots {
		display: flex;
		gap: 0.375rem;
		align-items: center;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: oklch(0.35 0.02 250);
		border: none;
		padding: 0;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.dot.active {
		width: 18px;
		border-radius: 3px;
		background: oklch(0.70 0.15 230);
	}

	.topbar-spacer {
		width: 2rem;
		flex-shrink: 0;
	}

	/* Horizontal pager */
	.pager-container {
		flex: 1;
		display: flex;
		width: 200%; /* 2 pages */
		min-height: 0;
	}

	.pager-page {
		width: 50%; /* Each page = 100% of viewport */
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

	/* Terminal scroll container: override inline right:60px, disable x-scroll */
	.session-card-wrapper :global(.relative.flex-1.min-h-0 > .absolute.inset-0) {
		right: 0 !important;
		transition: right 0.3s ease;
		overflow-x: hidden !important;
	}

	/* Wrap long terminal lines on mobile instead of scrolling */
	.session-card-wrapper :global(pre) {
		white-space: pre-wrap !important;
		word-break: break-all;
	}

	/* Minimap container (second child): hidden by default */
	.session-card-wrapper :global(.relative.flex-1.min-h-0 > .absolute.top-0.right-0.bottom-0) {
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
	}

	/* When scrolling, make room for minimap and reveal it */
	.session-card-wrapper.mobile-scrolling :global(.relative.flex-1.min-h-0 > .absolute.inset-0) {
		right: 60px !important;
	}

	.session-card-wrapper.mobile-scrolling :global(.relative.flex-1.min-h-0 > .absolute.top-0.right-0.bottom-0) {
		opacity: 1;
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
</style>
