<script lang="ts">
	import StatusActionBadge from '$lib/components/work/atoms/StatusActionBadge.svelte';
	import AgentAvatar from '$lib/components/AgentAvatar.svelte';
	import { getSessionStateVisual } from '$lib/config/statusColors';

	// Types
	interface PausedSession {
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

	// Props
	let {
		sessions = [],
		projectColors = {},
		taskIntegrations = {},
		onResumeSession,
		onRestartTask,
		onUnassignTask,
		onKillSession,
		onCloseTask,
		onViewTask
	}: {
		sessions: PausedSession[];
		projectColors: Record<string, string>;
		taskIntegrations?: Record<string, { sourceId: string; sourceType: string; sourceName: string; sourceEnabled: boolean }>;
		onResumeSession?: (agentName: string, sessionId: string) => Promise<void>;
		onRestartTask?: (taskId: string, agentName?: string) => Promise<void>;
		onUnassignTask?: (taskId: string, agentName: string) => Promise<void>;
		onKillSession?: (taskId: string, agentName: string) => Promise<void>;
		onCloseTask?: (taskId: string, agentName: string) => Promise<void>;
		onViewTask?: (taskId: string) => void;
	} = $props();

	// Action loading state
	let actionLoading = $state<string | null>(null);

	// Timer tick for elapsed time updates
	let tick = $state(0);

	$effect(() => {
		if (sessions.length === 0) return;
		const interval = setInterval(() => { tick++; }, 1000);
		return () => clearInterval(interval);
	});

	function getElapsedFormatted(lastActivityISO: string | undefined): { hours: string; minutes: string; seconds: string; showHours: boolean } | null {
		void tick;
		if (!lastActivityISO) return null;
		const lastActivity = new Date(lastActivityISO).getTime();
		const now = Date.now();
		const elapsedMs = now - lastActivity;
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

	async function handleAction(actionId: string, session: PausedSession) {
		if (actionLoading) return;
		actionLoading = session.agentName;
		try {
			if (actionId === 'resume' && onResumeSession && session.sessionId) {
				await onResumeSession(session.agentName, session.sessionId);
			} else if (actionId === 'restart' && onRestartTask) {
				await onRestartTask(session.taskId, session.agentName);
			} else if (actionId === 'unassign' && onUnassignTask) {
				await onUnassignTask(session.taskId, session.agentName);
			} else if ((actionId === 'kill' || actionId === 'cleanup') && onKillSession) {
				await onKillSession(session.taskId, session.agentName);
			} else if (actionId === 'close-task' && onCloseTask) {
				await onCloseTask(session.taskId, session.agentName);
			} else if (actionId === 'view-task' && onViewTask) {
				onViewTask(session.taskId);
			}
		} finally {
			actionLoading = null;
		}
	}
</script>

{#if sessions.length > 0}
	<div class="tp-sessions-list">
		{#each sessions as session (session.taskId)}
			{@const stateKey = session.resumable ? 'paused' : 'orphaned'}
			{@const stateVisual = getSessionStateVisual(stateKey)}
			{@const elapsed = getElapsedFormatted(session.lastActivity)}
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<div
				class="tp-session-card"
				style="--card-hover-tint: {stateVisual.accent}; border-left: 3px solid {stateVisual.accent};"
				role="button"
				tabindex="0"
				onclick={() => onViewTask?.(session.taskId)}
				onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewTask?.(session.taskId); } }}
			>
				<div class="tp-card-inner">
					<!-- State strip: avatar + elapsed (matches TasksActive agent strip) -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="tp-state-strip" style="background: {stateVisual.bgTint};" aria-hidden="true">
						<AgentAvatar name={session.agentName} size={96} showRing={false} shape="rounded" />
						{#if elapsed}
							<span class="tp-strip-elapsed">
								{#if elapsed.showHours}{elapsed.hours}:{/if}{elapsed.minutes}:{elapsed.seconds}
							</span>
						{/if}
					</div>
					<!-- Content body -->
					<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
					<div class="tp-card-body" onclick={(e) => e.stopPropagation()}>
						<!-- Row 1: title + status badge (matches TasksActive ta-title-row) -->
						<div class="tp-title-row">
							<span class="tp-title" title={session.taskTitle}>
								{session.taskTitle || session.taskId}
							</span>
							<StatusActionBadge
								sessionState={session.resumable ? 'paused' : 'orphaned'}
								sessionName={`jat-${session.agentName}`}
								disabled={actionLoading === session.agentName}
								onAction={(actionId) => handleAction(actionId, session)}
								alignRight={true}
							/>
						</div>
						<!-- Row 2: agent name · task ID (matches TasksActive ta-card-row2) -->
						<div class="tp-card-row2">
							<span class="tp-agent-name">{session.agentName}</span>
							<span class="tp-separator">·</span>
							<span class="tp-task-id" style="color: {stateVisual.accent};">{session.taskId}</span>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
{:else}
	<div class="text-center py-6 text-base-content/50 text-sm">
		No paused sessions
	</div>
{/if}

<style>
	.tp-sessions-list {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.tp-session-card {
		position: relative;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-bottom: none;
		border-radius: 0;
		padding: 0;
		cursor: pointer;
		transition: background 0.15s;
		overflow: hidden;
	}

	.tp-session-card:first-child {
		border-radius: 8px 8px 0 0;
	}

	.tp-session-card:last-child {
		border-radius: 0 0 8px 8px;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.tp-session-card:only-child {
		border-radius: 8px;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.tp-session-card:hover {
		background: color-mix(in oklch, var(--card-hover-tint, oklch(0.65 0.18 300)) 12%, transparent);
	}

	.tp-session-card:active {
		background: oklch(0.20 0.02 250);
	}

	.tp-card-inner {
		display: flex;
		align-items: stretch;
		min-height: 0;
	}

	/* Avatar + elapsed strip — matches ta-state-strip-agent in TasksActive */
	.tp-state-strip {
		width: 140px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		overflow: hidden;
		transition: filter 0.2s;
	}

	.tp-session-card:hover .tp-state-strip {
		filter: brightness(1.3) saturate(1.35);
	}

	.tp-state-strip :global(*) {
		border-radius: 0 !important;
		max-width: 100%;
	}

	.tp-strip-elapsed {
		font-size: 0.625rem;
		font-weight: 500;
		color: oklch(0.58 0.03 250);
		font-variant-numeric: tabular-nums;
		font-family: ui-monospace, monospace;
		letter-spacing: 0.02em;
	}

	.tp-card-body {
		flex: 1;
		padding: 0.75rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	/* Row 1: title + StatusActionBadge side by side */
	.tp-title-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}

	.tp-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: oklch(0.85 0.02 250);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
		min-width: 0;
	}

	/* Row 2: agent name · task ID */
	.tp-card-row2 {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
	}

	.tp-agent-name {
		color: oklch(0.60 0.03 250);
		font-weight: 500;
	}

	.tp-separator {
		color: oklch(0.40 0.02 250);
	}

	.tp-task-id {
		font-family: ui-monospace, monospace;
		font-size: 0.7rem;
		font-weight: 500;
		opacity: 0.8;
	}

	/* Responsive: narrow state strip on small screens */
	@media (max-width: 480px) {
		.tp-state-strip {
			width: 64px;
		}
	}
</style>
