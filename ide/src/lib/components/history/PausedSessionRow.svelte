<script lang="ts">
	import AgentAvatar from "$lib/components/AgentAvatar.svelte";
	import DurationTrack from "$lib/components/history/DurationTrack.svelte";
	import { getProjectColor } from "$lib/utils/projectColors";
	import type { PausedSession } from "$lib/utils/completedTaskHelpers";

	let {
		session,
		onTaskClick,
		onResumeSession,
		resuming = false,
	}: {
		session: PausedSession;
		onTaskClick?: (taskId: string) => void;
		onResumeSession?: (event: MouseEvent, session: PausedSession) => void;
		resuming?: boolean;
	} = $props();

	const projectColor = $derived(getProjectColor(session.project || session.taskId.split('-')[0]));
	const startedAt = $derived(session.startedAt || session.endedAt);
</script>

<div class="psr-swipe-container">
	<div class="psr-card" onclick={() => onTaskClick?.(session.taskId)} role="button" tabindex="0" onkeydown={(e) => { if (e.key === 'Enter') onTaskClick?.(session.taskId); }}>
		<div class="psr-duration-stripe"></div>
		<div class="psr-inner">
			<div class="psr-avatar">
				<AgentAvatar name={session.agentName} size={36} shape="rounded" />
			</div>

			<div class="psr-body">
				<div class="psr-title">{session.taskTitle}</div>
				<div class="psr-meta">
					<span class="psr-id" style="{projectColor ? `color: ${projectColor};` : ''}">{session.taskId}</span>
					<span class="psr-sep">·</span>
					<span class="psr-badge">PAUSED</span>
					<span class="psr-sep">·</span>
					<span class="psr-agent">{session.agentName}</span>
					{#if session.reason}
						<span class="psr-sep">·</span>
						<span class="psr-reason">{session.reason}</span>
					{/if}
				</div>
			</div>

			<div class="psr-duration">
				<DurationTrack
					createdAt={startedAt}
					endedAt={session.endedAt}
					width="150px"
				/>
			</div>

			<div class="psr-primary-col">
				{#if onResumeSession}
					<button
						type="button"
						class="psr-primary-btn"
						onclick={(e) => { e.stopPropagation(); onResumeSession!(e, session); }}
						title="Resume session"
						disabled={resuming}
					>
						{#if resuming}
							<span class="loading loading-spinner loading-xs"></span>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="16" height="16">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
							</svg>
						{/if}
						<span class="psr-primary-label">Resume</span>
					</button>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.psr-swipe-container {
		position: relative;
		overflow: hidden;
		border-bottom: 1px solid oklch(0.22 0.02 250);
	}

	.psr-swipe-container:last-child {
		border-bottom: none;
	}

	.psr-card {
		position: relative;
		cursor: pointer;
		background: oklch(0.16 0.01 250);
		/* Amber/gray left border — non-green, indicates paused */
		border-left: 3px solid oklch(0.55 0.12 75 / 0.55);
		transition: background 0.12s;
	}

	.psr-card:hover {
		background: oklch(0.19 0.01 250);
	}

	/* Amber stripe at bottom — indicates paused, not completed */
	.psr-duration-stripe {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, oklch(0.60 0.14 75 / 0.45), oklch(0.60 0.14 75 / 0.10));
		pointer-events: none;
	}

	.psr-inner {
		display: flex;
		align-items: stretch;
		min-height: 56px;
	}

	.psr-avatar {
		width: 56px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 8px 4px;
		background: oklch(0.18 0.01 250);
		filter: saturate(0.75);
	}

	.psr-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 8px 12px;
		gap: 3px;
	}

	.psr-title {
		font-size: 0.875rem;
		font-weight: 500;
		color: oklch(0.85 0.01 250);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.psr-meta {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.7rem;
		color: oklch(0.60 0.02 250);
		font-family: ui-monospace, monospace;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.psr-id {
		font-weight: 600;
	}

	.psr-sep {
		color: oklch(0.40 0.02 250);
	}

	.psr-badge {
		padding: 0 6px;
		border-radius: 4px;
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		background: oklch(0.55 0.14 75 / 0.20);
		color: oklch(0.80 0.12 75);
		border: 1px solid oklch(0.55 0.14 75 / 0.45);
	}

	.psr-agent {
		color: oklch(0.70 0.02 250);
	}

	.psr-reason {
		color: oklch(0.55 0.02 250);
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.psr-duration {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		padding: 0 12px;
	}

	.psr-primary-col {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		padding: 0 12px 0 4px;
	}

	.psr-primary-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border: 1px solid oklch(0.55 0.14 75 / 0.45);
		background: oklch(0.55 0.14 75 / 0.15);
		color: oklch(0.85 0.12 75);
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.12s;
	}

	.psr-primary-btn:hover:not(:disabled) {
		background: oklch(0.55 0.14 75 / 0.25);
	}

	.psr-primary-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.psr-primary-label {
		line-height: 1;
	}
</style>
