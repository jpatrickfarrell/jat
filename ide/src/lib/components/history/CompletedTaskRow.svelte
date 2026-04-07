<script lang="ts">
	import AgentAvatar from "$lib/components/AgentAvatar.svelte";
	import ProviderLogo from "$lib/components/agents/ProviderLogo.svelte";
	import DurationTrack from "$lib/components/history/DurationTrack.svelte";
	import { getProjectColor } from "$lib/utils/projectColors";
	import { getIssueTypeVisual } from "$lib/config/statusColors";
	import { getIntegrationIcon } from "$lib/config/integrationIcons";
	import {
		type CompletedTask,
		PRIORITY_COLORS,
	} from "$lib/utils/completedTaskHelpers";

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
	} = $props();

	const projectColor = $derived(getProjectColor(task.project || task.id.split('-')[0]));
	const typeVis = $derived(getIssueTypeVisual(task.issue_type));
	const pc = $derived(PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS[3]);
	const resolvedIntegration = $derived(integration ?? task.integration ?? null);
	const integrationIcon = $derived(resolvedIntegration ? getIntegrationIcon(resolvedIntegration.sourceType) : null);

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
				// right swipe → primary action (resume if available, else reopen)
				if (task.assignee && onResumeSession) {
					onResumeSession(new MouseEvent('click'), task);
				} else if (onReopenTask) {
					onReopenTask(new MouseEvent('click'), task);
				}
			} else {
				// left swipe → details
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
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="ctr-card"
		style="{swipeOffset !== 0 ? `transform: translateX(${swipeOffset}px);` : ''} {!swiping && swipeOffset === 0 ? '' : !swiping ? 'transition: transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94);' : ''}"
		onclick={() => !swiping && onTaskClick(task.id)}
		ontouchstart={onTouchStart}
		ontouchmove={onTouchMove}
		ontouchend={onTouchEnd}
		ontouchcancel={onTouchEnd}
	>
		<!-- Duration stripe along bottom -->
		<div class="ctr-duration-stripe"></div>

		<div class="ctr-inner">
			<!-- Left: avatar -->
			<div class="ctr-avatar" style="{projectColor ? `border-color: ${projectColor};` : ''}">
				{#if task.assignee}
					<AgentAvatar name={task.assignee} size={24} />
				{:else if resolvedIntegration && integrationIcon}
					<svg class="w-5 h-5" viewBox={integrationIcon.viewBox} fill={integrationIcon.fill ? 'currentColor' : 'none'} stroke={integrationIcon.fill ? 'none' : 'currentColor'} stroke-width="1.5" style="color: {integrationIcon.color};">
						<path d={integrationIcon.svg} />
					</svg>
				{:else}
					<span class="ctr-avatar-fallback">{typeVis?.icon ?? '✓'}</span>
				{/if}
			</div>

			<!-- Center: title + meta -->
			<div class="ctr-body">
				<div class="ctr-title">{task.title}</div>
				<div class="ctr-meta">
					<span class="ctr-id" style="{projectColor ? `color: ${projectColor};` : ''}">{task.id}</span>
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
				</div>
			</div>

			<!-- Right: duration track (time-of-day graph) -->
			<div class="ctr-duration">
				<DurationTrack
					createdAt={task.created_at}
					endedAt={task.closed_at || task.updated_at}
					width="150px"
				/>
			</div>

			<!-- Right: primary action column (always visible) + extras on hover -->
			<div class="ctr-primary-col">
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
		transition: background 0.12s;
	}

	.ctr-card:hover {
		background: oklch(0.19 0.01 250);
	}

	/* Green stripe at bottom — indicates completed */
	.ctr-duration-stripe {
		position: absolute;
		bottom: 0;
		left: 52px;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, oklch(0.55 0.18 145 / 0.5), oklch(0.55 0.18 145 / 0.15));
		pointer-events: none;
	}

	/* Inner flex row */
	.ctr-inner {
		display: flex;
		align-items: stretch;
		min-height: 56px;
	}

	/* Avatar */
	.ctr-avatar {
		width: 52px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 8px 0;
		background: oklch(0.18 0.01 250);
		border-right: 1px solid oklch(0.22 0.02 250);
		border-left: 3px solid oklch(0.40 0.12 145 / 0.6);
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
	}

	.ctr-sep {
		color: oklch(0.35 0.02 250);
	}

	.ctr-priority {
		font-size: 0.5rem;
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

	/* Right: duration track column */
	.ctr-duration {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		border-left: 1px solid oklch(0.22 0.02 250);
		padding: 8px 10px;
	}

	/* Primary action column: always visible (like date picker in open tasks) */
	.ctr-primary-col {
		display: flex;
		align-items: stretch;
		flex-shrink: 0;
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

	/* Primary button: always visible, matches date picker column style */
	.ctr-primary-btn {
		width: 56px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		padding: 0;
		background: transparent;
		border-top: none;
		border-right: none;
		border-bottom: none;
		border-left: 1px solid oklch(0.22 0.02 250);
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
		font-size: 0.5rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.ctr-primary-resume  { color: oklch(0.62 0.16 145); }
	.ctr-primary-reopen  { color: oklch(0.65 0.14 75); }
	.ctr-primary-details { color: oklch(0.55 0.10 250); }
</style>
