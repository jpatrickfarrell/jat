<script lang="ts">
	/**
	 * RecentlyClosed - Recently closed agent sessions
	 *
	 * Displays recently closed sessions grouped by day with
	 * resume, reopen, duplicate, and status change actions.
	 */

	import TaskIdBadge from '$lib/components/TaskIdBadge.svelte';
	import AgentAvatar from '$lib/components/AgentAvatar.svelte';
	import DurationTrack from '$lib/components/history/DurationTrack.svelte';
	import { reveal } from '$lib/actions/reveal';
	import { getSessionStateVisual, type SessionState } from '$lib/config/statusColors';
	import { getProjectColor } from '$lib/utils/projectColors';
	import { openTaskDetailDrawer } from '$lib/stores/drawerStore';
	import { toLocalDateStr, formatDisplayDate, parseLocalDate } from '$lib/utils/completedTaskHelpers';
	import { addToast } from '$lib/stores/toasts.svelte';

	interface RecentSession {
		sessionName: string;
		agentName: string;
		taskId: string | null;
		taskTitle: string | null;
		project: string | null;
		sessionId: string | null;
		lastState: string;
		timestamp: string;
		taskStatus?: string;
		taskCreatedAt?: string;
		taskClosedAt?: string;
		taskUpdatedAt?: string;
		taskPriority?: number;
		taskType?: string;
		integration?: { sourceId: string; sourceType: string; sourceName: string } | null;
	}

	interface RecentSessionDayGroup {
		date: string;
		displayDate: string;
		sessions: RecentSession[];
	}

	let {
		sessions = [],
		projectColors = {},
		collapsed = $bindable(false),
		resumingSession = null,
		total = 0,
		hasMore = false,
		loadingMore = false,
		onResume = (_session: RecentSession) => {},
		onLoadMore = () => {},
		onStatusChange = (_taskId: string, _status: string) => {},
		onDuplicate = (_data: { id: string; title: string; type: string; priority: number }) => {},
	}: {
		sessions: RecentSession[];
		projectColors: Record<string, string>;
		collapsed?: boolean;
		resumingSession: string | null;
		total: number;
		hasMore: boolean;
		loadingMore: boolean;
		onResume?: (session: RecentSession) => void;
		onLoadMore?: () => void;
		onStatusChange?: (taskId: string, status: string) => void;
		onDuplicate?: (data: { id: string; title: string; type: string; priority: number }) => void;
	} = $props();

	// Day-grouped sessions
	function groupByDay(sessions: RecentSession[]): RecentSessionDayGroup[] {
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

	const dayGroups = $derived(groupByDay(sessions));

	// Elapsed time formatter
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

	// Project color helper
	function getColor(taskIdOrProject: string): string | null {
		const project = taskIdOrProject.includes('-') ? taskIdOrProject.split('-')[0] : taskIdOrProject;
		return projectColors[project] || getProjectColor(project) || null;
	}

	// Context menu state
	let ctxData = $state<RecentSession | null>(null);
	let ctxX = $state(0);
	let ctxY = $state(0);
	let ctxVisible = $state(false);
	let ctxStatusSubmenuOpen = $state(false);

	function handleContextMenu(recent: RecentSession, event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		const menuWidth = 200;
		const menuHeight = 250;
		ctxData = recent;
		ctxX = Math.min(event.clientX, window.innerWidth - menuWidth - 8);
		ctxY = Math.min(event.clientY, window.innerHeight - menuHeight - 8);
		ctxVisible = true;
		ctxStatusSubmenuOpen = false;
	}

	function closeCtxMenu() {
		ctxVisible = false;
		ctxStatusSubmenuOpen = false;
	}

	function handleRowClick(recent: RecentSession) {
		if (recent.taskId && recent.taskId !== 'unknown') {
			openTaskDetailDrawer(recent.taskId);
		}
	}

	function handleStatusChange(taskId: string, status: string) {
		closeCtxMenu();
		onStatusChange(taskId, status);
	}

	function handleDuplicate(recent: RecentSession) {
		closeCtxMenu();
		onDuplicate({
			id: recent.taskId!,
			title: recent.taskTitle || '',
			type: recent.taskType || 'task',
			priority: recent.taskPriority ?? 2,
		});
	}

	// Auto-close on click outside or Escape
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
</script>

<div class="recent-section">
	<button
		class="recent-header"
		onclick={() => collapsed = !collapsed}
	>
		<div class="recent-header-left">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="recent-chevron"
				class:collapsed
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
			</svg>
			<span class="recent-title">Recently Closed</span>
			<span class="recent-count">{total || sessions.length}</span>
		</div>
	</button>

	{#if !collapsed}
		<div class="recent-list">
			{#each dayGroups as dayGroup, gi (dayGroup.date)}
				<div class="recent-day-group" use:reveal={{ animation: 'fade-in', delay: gi * 0.08 }}>
					<div class="recent-day-header">
						<span class="recent-day-date">{dayGroup.displayDate}</span>
						<span class="recent-day-count">{dayGroup.sessions.length}</span>
					</div>
					{#each dayGroup.sessions as recent, ri (recent.sessionName)}
						{@const projectColor = recent.project ? getColor(recent.taskId || recent.project) : null}
						{@const stateVisual = getSessionStateVisual(recent.lastState as SessionState)}
						{@const recentStatusDotColor = stateVisual.accent}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div use:reveal={{ animation: 'fade-in', delay: ri * 0.05 }}
							class="recent-row group"
							onclick={() => handleRowClick(recent)}
							oncontextmenu={(e) => handleContextMenu(recent, e)}
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
										onclick={(e) => { e.stopPropagation(); handleStatusChange(recent.taskId!, 'open'); }}
										title="Reopen task"
									>
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
										</svg>
									</button>
									<button
										type="button"
										class="recent-action-btn recent-duplicate-btn"
										onclick={(e) => { e.stopPropagation(); handleDuplicate(recent); }}
										title="Duplicate task"
									>
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
										</svg>
									</button>
								{/if}
								<button
									class="recent-action-btn recent-resume-btn"
									onclick={(e) => { e.stopPropagation(); onResume(recent); }}
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

			{#if hasMore}
				<button
					class="load-more-btn"
					onclick={onLoadMore}
					disabled={loadingMore}
				>
					{#if loadingMore}
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

<!-- Context Menu -->
{#if ctxData}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="ctx-menu"
		class:ctx-menu-hidden={!ctxVisible}
		style="left: {ctxX}px; top: {ctxY}px;"
		onclick={(e) => e.stopPropagation()}
	>
		<!-- View Details -->
		{#if ctxData.taskId && ctxData.taskId !== 'unknown'}
			<button class="ctx-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; }} onclick={() => {
				const id = ctxData!.taskId!;
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
		<button class="ctx-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; }} onclick={() => {
			const recent = ctxData!;
			closeCtxMenu();
			onResume(recent);
		}}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polygon points="5 3 19 12 5 21 5 3" />
			</svg>
			<span>Resume Session</span>
		</button>

		{#if ctxData.taskId && ctxData.taskId !== 'unknown'}
			<div class="ctx-divider"></div>

			<!-- Change Status (submenu) -->
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
					{@const currentStatus = ctxData!.taskStatus || (ctxData!.lastState === 'complete' || ctxData!.lastState === 'completed' ? 'closed' : 'open')}
					<div class="ctx-submenu">
						{#each [
							{ value: 'open', label: 'Open', color: 'oklch(0.70 0.15 220)' },
							{ value: 'in_progress', label: 'In Progress', color: 'oklch(0.75 0.15 85)' },
							{ value: 'blocked', label: 'Blocked', color: 'oklch(0.65 0.18 30)' },
							{ value: 'closed', label: 'Closed', color: 'oklch(0.65 0.18 145)' }
						] as status}
							<button
								class="ctx-item {currentStatus === status.value ? 'ctx-item-active' : ''}"
								onclick={() => handleStatusChange(ctxData!.taskId!, status.value)}
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

	/* Context Menu */
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
		padding: 0.4rem 0.6rem;
		font-size: 0.8rem;
		color: oklch(0.75 0.02 250);
		background: none;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background 0.1s;
	}

	.ctx-item:hover {
		background: oklch(0.24 0.02 250);
	}

	.ctx-item svg {
		width: 15px;
		height: 15px;
		flex-shrink: 0;
	}

	.ctx-divider {
		height: 1px;
		background: oklch(0.25 0.02 250);
		margin: 0.25rem 0;
	}

	.ctx-submenu-container {
		position: relative;
	}

	.ctx-item-has-submenu {
		justify-content: flex-start;
	}

	.ctx-chevron {
		width: 12px !important;
		height: 12px !important;
		margin-left: auto;
		color: oklch(0.50 0.02 250);
	}

	.ctx-submenu {
		position: absolute;
		left: 100%;
		top: -0.375rem;
		min-width: 160px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		padding: 0.375rem;
		box-shadow: 0 10px 30px oklch(0.05 0 0 / 0.5);
		animation: ctxIn 0.1s ease;
	}

	.ctx-status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.ctx-item-active {
		background: oklch(0.22 0.02 250);
	}

	.ctx-check {
		width: 14px !important;
		height: 14px !important;
		margin-left: auto;
		color: oklch(0.70 0.15 145);
	}
</style>
