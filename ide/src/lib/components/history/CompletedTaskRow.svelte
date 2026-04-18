<script lang="ts">
	import AgentAvatar from "$lib/components/AgentAvatar.svelte";
	import { getProjectColor } from "$lib/utils/projectColors";
	import { getIssueTypeVisual } from "$lib/config/statusColors";
	import { getIntegrationIcon } from "$lib/config/integrationIcons";
	import {
		type CompletedTask,
		PRIORITY_COLORS,
		getTaskDuration,
		formatDuration,
	} from "$lib/utils/completedTaskHelpers";
	import type { CompletionBundle, SuggestedTask } from "$lib/types/signals";

	let {
		task,
		onTaskClick,
		onResumeSession,
		onMemoryClick,
		onReopenTask,
		onDuplicateTask,
		resuming = false,
		memoryFilename,
		integration = null,
		maxDuration = 0,
	}: {
		task: CompletedTask;
		onTaskClick: (id: string) => void;
		onResumeSession?: (event: MouseEvent, task: CompletedTask) => void;
		onMemoryClick?: (event: MouseEvent, filename: string, task: CompletedTask) => void;
		onReopenTask?: (event: MouseEvent, task: CompletedTask) => void;
		onDuplicateTask?: (event: MouseEvent, task: CompletedTask) => void;
		resuming?: boolean;
		memoryFilename?: string;
		integration?: { sourceId: string; sourceType: string; sourceName: string } | null;
		maxDuration?: number;
	} = $props();

	const projectColor = $derived(getProjectColor(task.project || task.id.split('-')[0]));
	const typeVis = $derived(getIssueTypeVisual(task.issue_type));
	const pc = $derived(PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS[3]);
	const resolvedIntegration = $derived(integration ?? task.integration ?? null);
	const integrationIcon = $derived(resolvedIntegration ? getIntegrationIcon(resolvedIntegration.sourceType) : null);
	const durationText = $derived(formatDuration(getTaskDuration(task)));
	const stripeWidth = $derived(
		maxDuration > 0
			? Math.max(4, Math.round((getTaskDuration(task) / maxDuration) * 100))
			: 100
	);
	const hasExtraActions = $derived(
		!!(memoryFilename && onMemoryClick) || !!onReopenTask || !!onDuplicateTask
	);

	// === Signal data for completion summary ===
	type SignalState = null | 'loading' | 'empty' | CompletionBundle;
	let signalData = $state<SignalState>(null);
	let fetchStarted = $state(false);
	let isHovered = $state(false);
	let isExpanded = $state(false);
	let touchDevice = $state(false);

	const isLoading = $derived(signalData === 'loading');
	const hasData = $derived(signalData !== null && signalData !== 'loading' && signalData !== 'empty');
	const isLoaded = $derived(signalData !== null && signalData !== 'loading');

	const summaryLines = $derived.by<string[]>(() => {
		if (!hasData) return [];
		return (signalData as CompletionBundle).summary || [];
	});

	const suggestedTasks = $derived.by<SuggestedTask[]>(() => {
		if (!hasData) return [];
		return (signalData as CompletionBundle).suggestedTasks || [];
	});

	async function fetchSignalData() {
		if (fetchStarted || !task.assignee) return;
		fetchStarted = true;
		signalData = 'loading';
		try {
			const res = await fetch(
				`/api/sessions/${encodeURIComponent(task.assignee)}/timeline?limit=30&type=complete,review&taskId=${encodeURIComponent(task.id)}`
			);
			if (!res.ok) { signalData = 'empty'; return; }
			const data = await res.json();
			const events: any[] = data.events || [];
			// Prefer complete signal, fall back to review
			const event =
				events.find((e) => e.type === 'complete') ||
				events.find((e) => e.type === 'state' && e.state === 'review');
			if (event?.data?.summary?.length) {
				signalData = event.data as CompletionBundle;
			} else {
				signalData = 'empty';
			}
		} catch {
			signalData = 'empty';
		}
	}

	function handleMouseEnter() {
		if (touchDevice) return;
		isHovered = true;
		fetchSignalData();
	}

	function handleMouseLeave() {
		if (touchDevice) return;
		isHovered = false;
	}

	// === Copy ID ===
	let copiedId = $state(false);
	function copyTaskId(e: MouseEvent) {
		e.stopPropagation();
		navigator.clipboard.writeText(task.id);
		copiedId = true;
		setTimeout(() => (copiedId = false), 1500);
	}

	function haptic(ms = 8) {
		if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
	}

	// === Swipe ===
	const SWIPE_DEADZONE = 10;
	const SWIPE_THRESHOLD = 80;
	const SWIPE_COMMIT_THRESHOLD = 140;
	const VELOCITY_THRESHOLD = 0.5;
	const LEFT_TRAY_WIDTH = 90;   // right-swipe → resume/reopen
	const RIGHT_TRAY_WIDTH = 180; // left-swipe → all options

	let swipeStartX = $state(0);
	let swipeStartY = $state(0);
	let swipeStartTime = $state(0);
	let swipeOffset = $state(0);
	let swiping = $state(false);
	let committed = $state(false);

	function onTouchStart(e: TouchEvent) {
		touchDevice = true;
		if (e.touches.length !== 1) return;
		const t = e.touches[0];
		swipeStartX = t.clientX;
		swipeStartY = t.clientY;
		swipeStartTime = Date.now();
		swipeOffset = 0;
		swiping = false;
		committed = false;
	}

	function onTouchMove(e: TouchEvent) {
		if (committed) return;
		const t = e.touches[0];
		const dx = t.clientX - swipeStartX;
		const dy = t.clientY - swipeStartY;
		if (!swiping) {
			if (Math.abs(dy) > SWIPE_DEADZONE) { swipeOffset = 0; return; }
			if (Math.abs(dx) > SWIPE_DEADZONE) { swiping = true; } else { return; }
		}
		e.preventDefault();
		const max = dx < 0 ? RIGHT_TRAY_WIDTH : LEFT_TRAY_WIDTH;
		swipeOffset = Math.abs(dx) <= max
			? dx
			: Math.sign(dx) * (max + (Math.abs(dx) - max) * 0.3);
	}

	function onTouchEnd() {
		if (committed || !swiping) { swipeOffset = 0; swiping = false; return; }
		const elapsed = Date.now() - swipeStartTime;
		const velocity = Math.abs(swipeOffset) / elapsed;
		const isCommit = Math.abs(swipeOffset) >= SWIPE_COMMIT_THRESHOLD
			|| (velocity >= VELOCITY_THRESHOLD && Math.abs(swipeOffset) > SWIPE_THRESHOLD);
		if (isCommit) {
			committed = true;
			haptic();
			if (swipeOffset > 0) {
				if (task.assignee && onResumeSession) {
					onResumeSession(new MouseEvent('click'), task);
				} else if (onReopenTask) {
					onReopenTask(new MouseEvent('click'), task);
				}
			} else {
				onTaskClick(task.id);
			}
		}
		swipeOffset = 0;
		swiping = false;
		committed = false;
	}
</script>

<div class="ctr-swipe-container">
	<!-- Left tray: right-swipe → primary action (Resume / Reopen) -->
	<div class="ctr-tray ctr-tray-left" class:ctr-tray-visible={swipeOffset > SWIPE_DEADZONE}>
		{#if task.assignee && onResumeSession}
			<button class="ctr-tray-btn ctr-tray-btn-resume" onclick={(e) => onResumeSession!(e, task)} disabled={resuming}>
				{#if resuming}
					<span class="loading loading-spinner loading-xs"></span>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="20" height="20">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
					</svg>
				{/if}
				<span>Resume</span>
			</button>
		{:else if onReopenTask}
			<button class="ctr-tray-btn ctr-tray-btn-reopen" onclick={(e) => onReopenTask!(e, task)}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="20" height="20">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
				</svg>
				<span>Reopen</span>
			</button>
		{/if}
	</div>
	<!-- Right tray: left-swipe → all options -->
	<div class="ctr-tray ctr-tray-right" class:ctr-tray-visible={swipeOffset < -SWIPE_DEADZONE}>
		{#if memoryFilename && onMemoryClick}
			<button class="ctr-tray-btn ctr-tray-btn-memory" onclick={(e) => { onMemoryClick!(e, memoryFilename!, task); }}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="18" height="18">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
				</svg>
				<span>Memory</span>
			</button>
		{/if}
		{#if onReopenTask}
			<button class="ctr-tray-btn ctr-tray-btn-reopen" onclick={(e) => onReopenTask!(e, task)}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="18" height="18">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
				</svg>
				<span>Reopen</span>
			</button>
		{/if}
		{#if onDuplicateTask}
			<button class="ctr-tray-btn ctr-tray-btn-duplicate" onclick={(e) => onDuplicateTask!(e, task)}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="18" height="18">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
				</svg>
				<span>Dup</span>
			</button>
		{/if}
		{#if task.assignee && onResumeSession}
			<button class="ctr-tray-btn ctr-tray-btn-resume" onclick={(e) => onResumeSession!(e, task)} disabled={resuming}>
				{#if resuming}
					<span class="loading loading-spinner loading-xs"></span>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="18" height="18">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
					</svg>
				{/if}
				<span>Resume</span>
			</button>
		{:else}
			<button class="ctr-tray-btn ctr-tray-btn-details" onclick={() => onTaskClick(task.id)}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="18" height="18">
					<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
				</svg>
				<span>Details</span>
			</button>
		{/if}
	</div>

	<!-- The sliding card -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="ctr-card"
		style="{projectColor ? `border-left-color: ${projectColor};` : ''} {swipeOffset !== 0 ? `transform: translateX(${swipeOffset}px);` : ''} {!swiping && swipeOffset === 0 ? '' : !swiping ? 'transition: transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94);' : ''}"
		onclick={() => {
			if (swiping) return;
			if (touchDevice) {
				if (!isExpanded) {
					isExpanded = true;
					fetchSignalData();
				} else {
					onTaskClick(task.id);
				}
			} else {
				onTaskClick(task.id);
			}
		}}
		onmouseenter={handleMouseEnter}
		onmouseleave={handleMouseLeave}
		ontouchstart={onTouchStart}
		ontouchmove={onTouchMove}
		ontouchend={onTouchEnd}
		ontouchcancel={onTouchEnd}
	>
		<!-- Duration stripe: width proportional to task duration relative to day's longest -->
		<div class="ctr-duration-stripe" style="width: {stripeWidth}%;"></div>

		<!-- Compact row -->
		<div class="ctr-inner">
			<!-- Left: avatar -->
			<div class="ctr-avatar">
				{#if task.assignee}
					<AgentAvatar name={task.assignee} size={36} shape="rounded" />
				{:else if resolvedIntegration && integrationIcon}
					<svg class="w-5 h-5" viewBox={integrationIcon.viewBox} fill={integrationIcon.fill ? 'currentColor' : 'none'} stroke={integrationIcon.fill ? 'none' : 'currentColor'} stroke-width="1.5" style="color: {integrationIcon.color};">
						<path d={integrationIcon.svg} />
					</svg>
				{:else}
					<span class="ctr-avatar-fallback">{typeVis?.icon ?? '✓'}</span>
				{/if}
			</div>

			<!-- Center: title + meta + compact summary -->
			<div class="ctr-body">
				<div class="ctr-title">{task.title}</div>
				<div class="ctr-meta">
					<button class="ctr-id" style="{projectColor ? `color: ${projectColor};` : ''}" onclick={copyTaskId} title="Click to copy task ID">{task.id}{#if copiedId} ✓{/if}</button>
					{#if task.priority != null}
						<span class="ctr-sep">·</span>
						<span class="ctr-priority" style="background: {pc.bg}; color: {pc.text}; border: 1px solid {pc.border};">P{task.priority}</span>
					{/if}
					{#if typeVis}
						<span class="ctr-sep">·</span>
						<span class="ctr-type">{typeVis.icon}</span>
					{/if}
					{#if task.assignee}
						<span class="ctr-sep">·</span>
						<span class="ctr-agent">{task.assignee}</span>
					{/if}
					{#if task.status && task.status !== 'closed'}
						<span class="ctr-sep">·</span>
						<span class="ctr-status-pill" data-status={task.status}>{task.status}</span>
					{/if}
				</div>
				<!-- Snippet slot: always rendered so all rows share consistent height -->
				<div class="ctr-snippet-slot">
					{#if isLoading}
						<div class="ctr-summary-skeleton animate-skeleton-pulse"></div>
					{:else if summaryLines.length > 0}
						<div class="ctr-summary-snippet">{summaryLines[0]}</div>
					{/if}
				</div>
			</div>

			<!-- Right: primary action column (always visible) + extras on hover -->
			<div class="ctr-primary-col">
				<!-- Touch-only expand chevron: visible on touch devices, rotates when expanded -->
				<div class="ctr-expand-hint" class:ctr-expand-hint-open={isExpanded} aria-hidden="true">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="12" height="12">
						<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
					</svg>
				</div>
				<!-- Hint: fades out as extras slide in on hover -->
				{#if hasExtraActions}
					<span class="ctr-more-hint" aria-hidden="true">···</span>
				{/if}
				<!-- Extra actions: slide in on desktop hover -->
				<div class="ctr-extras">
					{#if memoryFilename && onMemoryClick}
						<button type="button" class="ctr-extra-btn ctr-extra-memory" onclick={(e) => { e.stopPropagation(); onMemoryClick!(e, memoryFilename!, task); }} title="View memory">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
							</svg>
						</button>
					{/if}
					{#if onReopenTask}
						<button type="button" class="ctr-extra-btn ctr-extra-reopen" onclick={(e) => { e.stopPropagation(); onReopenTask!(e, task); }} title="Reopen">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
							</svg>
						</button>
					{/if}
					{#if onDuplicateTask}
						<button type="button" class="ctr-extra-btn ctr-extra-duplicate" onclick={(e) => { e.stopPropagation(); onDuplicateTask!(e, task); }} title="Duplicate">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14">
								<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
							</svg>
						</button>
					{/if}
				</div>
				<!-- Primary action: Resume (or Reopen fallback) — always visible -->
				{#if task.assignee && onResumeSession}
					<button type="button" class="ctr-primary-btn ctr-primary-resume" onclick={(e) => { e.stopPropagation(); onResumeSession!(e, task); }} title="Resume session" disabled={resuming}>
						{#if resuming}
							<span class="loading loading-spinner loading-xs"></span>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="16" height="16">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
							</svg>
						{/if}
						<span class="ctr-primary-label">Resume</span>
					</button>
				{:else if onReopenTask}
					<button type="button" class="ctr-primary-btn ctr-primary-reopen" onclick={(e) => { e.stopPropagation(); onReopenTask!(e, task); }} title="Reopen task">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="16" height="16">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
						</svg>
						<span class="ctr-primary-label">Reopen</span>
					</button>
				{:else}
					<button type="button" class="ctr-primary-btn ctr-primary-details" onclick={(e) => { e.stopPropagation(); onTaskClick(task.id); }} title="View details">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="16" height="16">
							<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
						</svg>
						<span class="ctr-primary-label">Details</span>
					</button>
				{/if}
			</div>
		</div>

		<!-- Expansion area: animates open on hover (desktop only) -->
		<div class="ctr-expand-wrapper" class:ctr-expanded={isHovered && isLoaded} class:ctr-expanded-touch={isExpanded && isLoaded}>
			<div class="ctr-expand-inner">
				{#if isLoaded}
					<div class="ctr-expand-content" onclick={(e) => e.stopPropagation()}>
						{#if hasData && summaryLines.length > 0}
							<!-- Full summary bullets -->
							<ul class="ctr-exp-bullets">
								{#each summaryLines as bullet}
									<li>{bullet}</li>
								{/each}
							</ul>
						{/if}

						<!-- Suggested tasks (if any) -->
						{#if suggestedTasks.length > 0}
							<div class="ctr-exp-suggested">
								<span class="ctr-exp-label">Suggested:</span>
								{#each suggestedTasks.slice(0, 3) as st}
									<span class="ctr-exp-chip">
										<span class="ctr-exp-chip-type">{st.type}</span>
										{st.title}
									</span>
								{/each}
							</div>
						{/if}

						<!-- Footer: duration + memory + extra actions -->
						<div class="ctr-exp-footer">
							<span class="ctr-exp-duration">ran for {durationText}</span>

							{#if memoryFilename && onMemoryClick}
								<button
									type="button"
									class="ctr-exp-action ctr-exp-action-memory"
									onclick={(e) => { e.stopPropagation(); onMemoryClick!(e, memoryFilename!, task); }}
									title="View memory"
								>
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="12" height="12">
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
									</svg>
									Memory
								</button>
							{/if}

							{#if onReopenTask}
								<button
									type="button"
									class="ctr-exp-action ctr-exp-action-reopen"
									onclick={(e) => { e.stopPropagation(); onReopenTask!(e, task); }}
								>
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="12" height="12">
										<path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
									</svg>
									Reopen
								</button>
							{/if}

							{#if onDuplicateTask}
								<button
									type="button"
									class="ctr-exp-action ctr-exp-action-dup"
									onclick={(e) => { e.stopPropagation(); onDuplicateTask!(e, task); }}
								>
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="12" height="12">
										<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
									</svg>
									Duplicate
								</button>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	/* Swipe container */
	.ctr-swipe-container {
		position: relative;
		overflow: hidden;
		border-bottom: 1px solid oklch(0.22 0.02 250);
	}

	.ctr-swipe-container:last-child {
		border-bottom: none;
	}

	.ctr-tray {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 90px;
		display: flex;
		align-items: stretch;
		opacity: 0;
		transition: opacity 0.15s;
		pointer-events: none;
	}

	.ctr-tray-left { left: 0; }
	.ctr-tray-right { right: 0; width: 180px; }

	.ctr-tray-visible {
		opacity: 1;
		pointer-events: auto;
	}

	.ctr-tray-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		border: none;
		cursor: pointer;
		font-size: 0.5625rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: oklch(0.95 0.01 250);
		font-family: system-ui, -apple-system, sans-serif;
	}

	.ctr-tray-btn-details   { background: oklch(0.50 0.12 270); }
	.ctr-tray-btn-resume    { background: oklch(0.48 0.16 145); }
	.ctr-tray-btn-reopen    { background: oklch(0.55 0.13 75); }
	.ctr-tray-btn-memory    { background: oklch(0.45 0.12 200); }
	.ctr-tray-btn-duplicate { background: oklch(0.45 0.10 280); }

	/* Sliding card */
	.ctr-card {
		position: relative;
		cursor: pointer;
		background: oklch(0.16 0.01 250);
		border-left: 3px solid oklch(0.40 0.12 145 / 0.6);
		transition: background 0.12s;
	}

	.ctr-card:hover {
		background: oklch(0.19 0.01 250);
	}

	/* Duration stripe: width = proportion of task duration vs day's longest task */
	.ctr-duration-stripe {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 2px;
		background: linear-gradient(90deg, oklch(0.55 0.18 145 / 0.55), oklch(0.55 0.18 145 / 0.05));
		pointer-events: none;
		transition: width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	/* More-actions hint: fades out when extras expand */
	.ctr-more-hint {
		font-size: 0.65rem;
		color: oklch(0.38 0.02 250);
		padding: 0 3px;
		letter-spacing: 0.05em;
		pointer-events: none;
		transition: opacity 0.15s;
		flex-shrink: 0;
	}

	@media (min-width: 640px) {
		.ctr-card:hover .ctr-more-hint {
			opacity: 0;
		}
	}

	/* Inner flex row */
	.ctr-inner {
		display: flex;
		align-items: stretch;
		min-height: 56px;
	}

	/* Avatar */
	.ctr-avatar {
		width: 56px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 8px 4px;
		background: oklch(0.18 0.01 250);
	}

	.ctr-avatar-fallback {
		font-size: 1rem;
		line-height: 1;
	}

	/* Body */
	.ctr-body {
		flex: 1;
		min-width: 0;
		padding: 0.5rem 0.625rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 0.2rem;
	}

	.ctr-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: oklch(0.80 0.02 250);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.ctr-meta {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		font-size: 0.6rem;
		font-family: ui-monospace, monospace;
		color: oklch(0.48 0.02 250);
		flex-wrap: nowrap;
		overflow: hidden;
	}

	.ctr-id {
		color: oklch(0.60 0.12 200);
		font-weight: 600;
		white-space: nowrap;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
	}
	.ctr-id:hover {
		opacity: 0.8;
	}

	.ctr-sep {
		color: oklch(0.35 0.02 250);
	}

	.ctr-priority {
		font-size: 0.575rem;
		font-weight: 700;
		padding: 0 3px;
		border-radius: 3px;
		line-height: 1.6;
		white-space: nowrap;
	}

	.ctr-type {
		font-size: 0.75rem;
		line-height: 1;
	}

	.ctr-agent {
		color: oklch(0.58 0.12 145);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 80px;
	}

	.ctr-status-pill {
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.1em 0.45em;
		border-radius: 0.25rem;
		white-space: nowrap;
		border: 1px solid;
		color: oklch(0.70 0.05 250);
		background: oklch(0.30 0.03 250 / 0.4);
		border-color: oklch(0.45 0.04 250 / 0.5);
	}

	.ctr-status-pill[data-status="completed"] {
		color: oklch(0.78 0.18 145);
		background: oklch(0.28 0.08 145 / 0.35);
		border-color: oklch(0.55 0.15 145 / 0.5);
	}

	.ctr-status-pill[data-status="accepted"] {
		color: oklch(0.78 0.16 195);
		background: oklch(0.28 0.08 195 / 0.35);
		border-color: oklch(0.55 0.14 195 / 0.5);
	}

	.ctr-status-pill[data-status="submitted"] {
		color: oklch(0.82 0.16 80);
		background: oklch(0.30 0.08 80 / 0.35);
		border-color: oklch(0.58 0.15 80 / 0.5);
	}

	/* Snippet slot: reserves height even when empty for row-height consistency */
	.ctr-snippet-slot {
		min-height: 1rem;
		display: flex;
		align-items: center;
	}

	/* Summary snippet (compact state) */
	.ctr-summary-snippet {
		font-size: 0.72rem;
		color: oklch(0.55 0.03 250);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1.3;
		font-family: system-ui, -apple-system, sans-serif;
	}

	/* Skeleton loading line in compact state */
	.ctr-summary-skeleton {
		height: 0.65rem;
		width: 60%;
		border-radius: 3px;
		background: oklch(0.25 0.01 250);
	}

	/* Primary action column: always visible */
	.ctr-primary-col {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		border-left: 1px solid oklch(0.22 0.02 250);
		flex-direction: row;
		position: relative;
	}

	/* Touch-only expand chevron */
	.ctr-expand-hint {
		display: none;
		position: absolute;
		top: 4px;
		left: 50%;
		transform: translateX(-50%);
		color: oklch(0.45 0.03 250);
		transition: transform 0.2s ease-out, color 0.15s;
		pointer-events: none;
	}

	.ctr-expand-hint-open {
		transform: translateX(-50%) rotate(180deg);
		color: oklch(0.60 0.10 145);
	}

	@media (hover: none) {
		.ctr-expand-hint {
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	/* Extra icon buttons: hidden by default, slide in on desktop hover */
	.ctr-extras {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 0;
		overflow: hidden;
		max-width: 0;
		opacity: 0;
		transition: max-width 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.15s;
	}

	@media (min-width: 640px) {
		.ctr-card:hover .ctr-extras {
			max-width: 110px;
			opacity: 1;
			padding: 0 4px;
		}
	}

	.ctr-extra-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border-radius: 5px;
		border: 1px solid transparent;
		background: transparent;
		cursor: pointer;
		flex-shrink: 0;
		transition: background 0.12s;
	}

	.ctr-extra-btn:hover {
		background: oklch(0.24 0.02 250);
		border-color: oklch(0.28 0.02 250);
	}

	.ctr-extra-memory    { color: oklch(0.60 0.12 200); }
	.ctr-extra-reopen    { color: oklch(0.65 0.14 75); }
	.ctr-extra-duplicate { color: oklch(0.60 0.12 290); }

	/* Primary button: always visible */
	.ctr-primary-btn {
		width: 56px;
		min-height: 44px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		padding: 6px 0;
		background: transparent;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background 0.12s;
	}

	.ctr-primary-btn:hover {
		background: oklch(0.22 0.02 250 / 0.6);
	}

	.ctr-primary-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.ctr-primary-label {
		font-size: 0.575rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.ctr-primary-resume  { color: oklch(0.62 0.16 145); }
	.ctr-primary-reopen  { color: oklch(0.65 0.14 75); }
	.ctr-primary-details { color: oklch(0.55 0.10 250); }

	/* === Expansion area (desktop hover) === */
	.ctr-expand-wrapper {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 200ms ease-out;
		overflow: hidden;
	}

	/* Hover-expand on pointer devices */
	@media (hover: hover) and (min-width: 640px) {
		.ctr-expand-wrapper.ctr-expanded {
			grid-template-rows: 1fr;
		}
	}

	/* Tap-expand on touch devices */
	.ctr-expand-wrapper.ctr-expanded-touch {
		grid-template-rows: 1fr;
	}

	.ctr-expand-inner {
		overflow: hidden;
		min-height: 0;
	}

	.ctr-expand-content {
		padding: 0.625rem 0.625rem 0.75rem 56px; /* align with body content */
		border-top: 1px solid oklch(0.22 0.02 250 / 0.5);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* Full summary bullet list */
	.ctr-exp-bullets {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.ctr-exp-bullets li {
		font-size: 0.78rem;
		color: oklch(0.70 0.02 250);
		line-height: 1.4;
		font-family: system-ui, -apple-system, sans-serif;
		padding-left: 0.9rem;
		position: relative;
	}

	.ctr-exp-bullets li::before {
		content: '·';
		position: absolute;
		left: 0.25rem;
		color: oklch(0.55 0.10 145);
		font-weight: 700;
	}

	/* Suggested tasks row */
	.ctr-exp-suggested {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		flex-wrap: wrap;
	}

	.ctr-exp-label {
		font-size: 0.6rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: oklch(0.45 0.02 250);
		white-space: nowrap;
	}

	.ctr-exp-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.68rem;
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
		background: oklch(0.22 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		color: oklch(0.65 0.02 250);
		font-family: system-ui, -apple-system, sans-serif;
		white-space: nowrap;
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ctr-exp-chip-type {
		color: oklch(0.60 0.10 200);
		font-weight: 600;
		font-size: 0.6rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	/* Footer row */
	.ctr-exp-footer {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.ctr-exp-duration {
		font-size: 0.65rem;
		color: oklch(0.42 0.02 250);
		font-family: ui-monospace, monospace;
		margin-right: 0.25rem;
	}

	/* Action buttons in expanded footer */
	.ctr-exp-action {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		border: 1px solid transparent;
		background: transparent;
		cursor: pointer;
		transition: background 0.12s, border-color 0.12s;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.ctr-exp-action:hover {
		background: oklch(0.22 0.02 250);
		border-color: oklch(0.28 0.02 250);
	}

	.ctr-exp-action-memory {
		color: oklch(0.60 0.12 200);
	}
	.ctr-exp-action-reopen {
		color: oklch(0.65 0.14 75);
	}
	.ctr-exp-action-dup {
		color: oklch(0.60 0.12 290);
	}

	/* prefers-reduced-motion: instant expand, no animation */
	@media (prefers-reduced-motion: reduce) {
		.ctr-expand-wrapper {
			transition: none !important;
		}
		.ctr-summary-skeleton {
			animation: none !important;
		}
	}
</style>
