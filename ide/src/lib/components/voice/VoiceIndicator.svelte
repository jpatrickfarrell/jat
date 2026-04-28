<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import {
		getVoiceState,
		getTranscript,
		getMicPermission,
		getErrorMessage,
		getLastMatch,
		getLastToolResults,
		getToolSteps,
		getPendingOpenTaskId,
		clearPendingOpenTaskId,
		cancelPendingExecution
	} from '$lib/stores/voiceCapture.svelte';
	import { voiceVocabSheet } from '$lib/stores/voiceVocabSheet.svelte';
	import TaskDetailDrawer from '$lib/components/TaskDetailDrawer.svelte';

	const MATCHED_AUTOHIDE_MS = 1500;

	let voiceState = $derived(getVoiceState());
	let transcript = $derived(getTranscript());
	let micPermission = $derived(getMicPermission());
	let errorMessage = $derived(getErrorMessage());
	let match = $derived(getLastMatch());
	let toolResults = $derived(getLastToolResults());
	let toolSteps = $derived(getToolSteps());
	let pendingTaskId = $derived(getPendingOpenTaskId());

	// Task detail drawer — opened when a view_task tool call completes
	let drawerOpen = $state(false);
	let drawerTaskId = $state<string | null>(null);
	let drawerMode = $state<'view' | 'edit'>('view');

	$effect(() => {
		const tid = pendingTaskId;
		if (tid) {
			drawerTaskId = tid;
			drawerMode = 'view';
			drawerOpen = true;
			clearPendingOpenTaskId();
		}
	});

	// Escape key cancels preview countdown
	$effect(() => {
		if (voiceState !== 'preview') return;
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape') cancelPendingExecution();
		}
		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	});

	// Track when we entered the matched state so the chip can auto-hide 1.5s after
	// matched feedback shows.
	let matchedEnteredAt = $state<number | null>(null);
	let matchedAutoHide = $state(false);

	$effect(() => {
		if (voiceState === 'matched' && matchedEnteredAt === null) {
			matchedEnteredAt = Date.now();
			matchedAutoHide = false;
			const timer = setTimeout(() => {
				matchedAutoHide = true;
			}, MATCHED_AUTOHIDE_MS);
			return () => clearTimeout(timer);
		}
		if (voiceState !== 'matched') {
			matchedEnteredAt = null;
			matchedAutoHide = false;
		}
	});

	// visible drives DOM presence. matchedAutoHide uses CSS fade so the chip
	// stays in the DOM (with content) while animating out, then gets removed
	// when scheduleReset sets voiceState back to idle.
	// We do NOT use Svelte's out-transition on the wrapper because that plays
	// while voiceState === 'idle', making all content branches false → empty chip.
	let visible = $derived(voiceState !== 'idle');

	let glowClass = $derived.by(() => {
		switch (voiceState) {
			case 'listening':  return 'animate-glow-primary';
			case 'transcribing': return 'animate-glow-secondary';
			case 'preview':    return '';
			case 'executing':  return 'animate-glow-warning';
			case 'matched':    return 'animate-glow-success';
			case 'no-match':   return 'animate-glow-error';
			default:           return '';
		}
	});

	let stateLabel = $derived.by(() => {
		switch (voiceState) {
			case 'listening':   return 'Listening';
			case 'transcribing': return 'Thinking';
			case 'preview':
				return `Confirm: ${toolSteps.map(s => s.label).join(', ')}`;
			case 'executing': {
				const running = toolSteps.find(s => s.status === 'running');
				return running ? `Executing: ${running.label}` : 'Executing…';
			}
			case 'matched':
				if (toolResults.length > 0) {
					return toolResults.map(r => {
						const verb = r.tool === 'view_task' ? 'Opened'
							: r.tool === 'spawn_agent' ? 'Spawned agent for'
							: 'Created';
						return r.id ? `${verb}: ${r.label} [${r.id}]` : `${verb}: ${r.label}`;
					}).join(' · ');
				}
				return match?.entry
					? `Matched: ${match.raw} to ${match.entry.shortcut}`
					: `Matched: ${transcript}`;
			case 'no-match':
				if (micPermission === 'denied') return errorMessage || 'Microphone permission denied';
				if (match?.raw) return `No command matched ${match.raw}`;
				return errorMessage || 'No speech detected';
			default:
				return '';
		}
	});
</script>

<TaskDetailDrawer bind:taskId={drawerTaskId} bind:isOpen={drawerOpen} bind:mode={drawerMode} />

{#if visible}
	<div
		class="voice-indicator fixed bottom-4 right-4 z-[9999] pointer-events-none"
		role="status"
		aria-live="polite"
		aria-label={stateLabel}
		in:fly={{ y: 24, duration: 220, easing: cubicOut }}
	>
		<div
			class="vi-chip {glowClass}"
			data-state={voiceState}
			class:vi-chip-fadeout={voiceState === 'matched' && matchedAutoHide}
		>

			{#if voiceState === 'listening'}
				<span class="vi-mic" aria-hidden="true">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<rect x="9" y="2" width="6" height="12" rx="3" />
						<path d="M5 10v2a7 7 0 0 0 14 0v-2" />
						<line x1="12" y1="19" x2="12" y2="22" />
					</svg>
				</span>
				<span class="vi-label">listening…</span>

			{:else if voiceState === 'transcribing'}
				<span class="vi-spinner loading loading-spinner loading-xs" aria-hidden="true"></span>
				<span class="vi-label">thinking…</span>

			{:else if voiceState === 'preview'}
				<div class="vi-preview">
					<div class="vi-preview-header">
						<span class="vi-quoted vi-preview-transcript">&ldquo;{transcript}&rdquo;</span>
						<button
							class="vi-cancel-btn pointer-events-auto"
							onclick={cancelPendingExecution}
							aria-label="Cancel"
						>✕</button>
					</div>
					<div class="vi-step-list" aria-label="Planned actions">
						{#each toolSteps as step}
							<div class="vi-step">
								<span class="vi-step-icon vi-step-pending-icon" aria-hidden="true">○</span>
								<span class="vi-step-label">{step.label}</span>
							</div>
						{/each}
					</div>
					<div class="vi-preview-footer">Esc to cancel</div>
					<div class="vi-countdown-bar" aria-hidden="true"></div>
				</div>

			{:else if voiceState === 'executing'}
				<div class="vi-preview">
					<div class="vi-step-list" aria-label="Executing actions">
						{#each toolSteps as step}
							<div class="vi-step" data-status={step.status}>
								{#if step.status === 'pending'}
									<span class="vi-step-icon vi-step-pending-icon" aria-hidden="true">○</span>
								{:else if step.status === 'running'}
									<span class="vi-step-icon loading loading-spinner loading-xs vi-step-running-icon" aria-hidden="true"></span>
								{:else if step.status === 'done'}
									<span class="vi-step-icon vi-step-done-icon" aria-hidden="true">✓</span>
								{:else if step.status === 'error'}
									<span class="vi-step-icon vi-step-error-icon" aria-hidden="true">✗</span>
								{/if}
								<span class="vi-step-label">{step.label}</span>
							</div>
						{/each}
					</div>
				</div>

			{:else if voiceState === 'matched'}
				<span class="vi-icon vi-icon-success" aria-hidden="true">✓</span>
				{#if toolResults.length > 0}
					<span class="vi-transcript">
						{#each toolResults as r, i}
							{#if i > 0}<span class="vi-sep">·</span>{/if}
							{#if r.tool === 'view_task'}
								<span class="vi-tool-label vi-tool-open">Opened:</span>
							{:else if r.tool === 'spawn_agent'}
								<span class="vi-tool-label vi-tool-spawn">Spawned:</span>
							{:else}
								<span class="vi-tool-label">Created:</span>
							{/if}
							<span class="vi-quoted">&ldquo;{r.label}&rdquo;</span>
							{#if r.id}<span class="vi-task-id">{r.id}</span>{/if}
						{/each}
					</span>
				{:else if match?.entry}
					<span class="vi-transcript">
						<span class="vi-quoted">&ldquo;{match.raw}&rdquo;</span>
						<span class="vi-arrow" aria-hidden="true">→</span>
						<kbd class="kbd kbd-xs vi-kbd">{match.entry.shortcut}</kbd>
					</span>
				{:else}
					<span class="vi-transcript">{transcript}</span>
				{/if}

			{:else if voiceState === 'no-match'}
				{#if micPermission === 'denied'}
					<span class="vi-icon vi-icon-error" aria-hidden="true">🎤</span>
					<span class="vi-label vi-error">
						{errorMessage || 'Microphone permission denied'}
					</span>
				{:else if match?.raw}
					<span class="vi-icon vi-icon-error" aria-hidden="true">✗</span>
					<span class="vi-transcript vi-error">
						No command for &ldquo;{match.raw}&rdquo;
					</span>
					<button class="vi-hint-btn pointer-events-auto" onclick={() => voiceVocabSheet.show()}>
						See all commands →
					</button>
				{:else}
					<span class="vi-icon vi-icon-error" aria-hidden="true">✗</span>
					<span class="vi-label vi-error">
						{errorMessage || 'No speech detected'}
					</span>
				{/if}
			{/if}

		</div>
	</div>
{/if}

<style>
	.vi-chip {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.875rem;
		background: oklch(0.18 0.03 250 / 0.96);
		border: 1px solid oklch(0.35 0.05 250 / 0.6);
		border-radius: 9999px;
		box-shadow:
			0 8px 24px oklch(0 0 0 / 0.4),
			0 0 0 1px oklch(0.4 0.1 240 / 0.15);
		backdrop-filter: blur(12px);
		white-space: nowrap;
		max-width: min(420px, calc(100vw - 2rem));
		font-size: 0.8125rem;
		color: oklch(0.85 0.04 250);
		pointer-events: auto;
	}

	/* Multi-step states expand to column layout */
	.vi-chip[data-state='preview'],
	.vi-chip[data-state='executing'] {
		flex-direction: column;
		align-items: stretch;
		white-space: normal;
		border-radius: 0.875rem;
		max-width: min(480px, calc(100vw - 2rem));
		padding: 0;
		overflow: hidden;
		gap: 0;
	}

	.vi-chip[data-state='preview'] {
		background: oklch(0.17 0.04 260 / 0.97);
		border-color: oklch(0.40 0.08 260 / 0.7);
	}

	.vi-chip[data-state='no-match'] {
		background: oklch(0.20 0.06 30 / 0.94);
		border-color: oklch(0.45 0.12 30 / 0.6);
	}

	/* ── Preview / executing inner layout ── */

	.vi-preview {
		display: flex;
		flex-direction: column;
		gap: 0;
		padding: 0.625rem 0.875rem 0.5rem;
		position: relative;
	}

	.vi-preview-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.vi-preview-transcript {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		color: oklch(0.88 0.04 250);
		font-size: 0.8125rem;
	}

	.vi-cancel-btn {
		flex-shrink: 0;
		width: 1.25rem;
		height: 1.25rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: oklch(0.30 0.06 250 / 0.5);
		border: 1px solid oklch(0.40 0.06 250 / 0.4);
		border-radius: 50%;
		color: oklch(0.60 0.05 250);
		font-size: 0.6rem;
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s, color 0.15s;
		padding: 0;
		line-height: 1;
		margin-top: 0.1rem;
	}

	.vi-cancel-btn:hover {
		background: oklch(0.45 0.14 30 / 0.6);
		border-color: oklch(0.55 0.14 30 / 0.5);
		color: oklch(0.88 0.10 30);
	}

	/* ── Step list ── */

	.vi-step-list {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		padding-bottom: 0.25rem;
	}

	.vi-step {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.78rem;
		color: oklch(0.72 0.04 250);
		min-height: 1.25rem;
	}

	.vi-step[data-status='running'] .vi-step-label {
		color: oklch(0.92 0.05 250);
		font-weight: 500;
	}

	.vi-step[data-status='done'] .vi-step-label {
		color: oklch(0.62 0.05 250);
	}

	.vi-step-icon {
		flex-shrink: 0;
		width: 0.875rem;
		text-align: center;
		font-size: 0.75rem;
		line-height: 1;
	}

	.vi-step-pending-icon {
		color: oklch(0.42 0.04 250);
	}

	.vi-step-running-icon {
		color: oklch(0.72 0.14 200);
	}

	.vi-step-done-icon {
		color: oklch(0.68 0.18 145);
		animation: vi-step-pop 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
	}

	.vi-step-error-icon {
		color: oklch(0.68 0.18 30);
	}

	@keyframes vi-step-pop {
		from { transform: scale(0.4); opacity: 0; }
		to   { transform: scale(1);   opacity: 1; }
	}

	/* ── Countdown bar ── */

	.vi-preview-footer {
		font-size: 0.68rem;
		color: oklch(0.46 0.04 250);
		text-align: right;
		padding-top: 0.2rem;
		padding-bottom: 0.35rem;
		letter-spacing: 0.01em;
	}

	.vi-countdown-bar {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: oklch(0.60 0.14 240);
		transform-origin: left center;
		animation: vi-countdown 3s linear forwards;
	}

	@keyframes vi-countdown {
		from { transform: scaleX(1); opacity: 1; }
		to   { transform: scaleX(0); opacity: 0.6; }
	}

	/* ── Existing single-line chip elements ── */

	.vi-mic {
		display: inline-flex;
		color: oklch(0.82 0.14 200);
		animation: vi-mic-pulse 1.4s ease-in-out infinite;
	}

	@keyframes vi-mic-pulse {
		0%, 100% { transform: scale(1);    opacity: 0.85; }
		50%       { transform: scale(1.15); opacity: 1;    }
	}

	.vi-spinner {
		color: oklch(0.78 0.10 280);
	}

	.vi-icon {
		font-size: 0.95rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.vi-icon-success { color: oklch(0.72 0.18 145); }
	.vi-icon-error   { color: oklch(0.70 0.18 30);  }

	.vi-label {
		font-weight: 500;
	}

	.vi-error {
		color: oklch(0.78 0.14 30);
	}

	.vi-transcript {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	.vi-quoted {
		color: oklch(0.88 0.04 250);
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 220px;
	}

	.vi-sep {
		color: oklch(0.50 0.04 250);
		margin: 0 0.2rem;
		flex-shrink: 0;
	}

	.vi-arrow {
		color: oklch(0.55 0.04 250);
		flex-shrink: 0;
	}

	.vi-kbd {
		background: oklch(0.26 0.04 250);
		border-color: oklch(0.4 0.08 250);
		color: oklch(0.85 0.14 200);
		font-family: ui-monospace, monospace;
	}

	.vi-hint-btn {
		font-size: 0.7rem;
		color: oklch(0.60 0.1 200);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		margin-left: 0.25rem;
		white-space: nowrap;
		transition: color 0.15s;
	}

	.vi-hint-btn:hover {
		color: oklch(0.78 0.14 200);
	}

	.vi-tool-label {
		color: oklch(0.72 0.18 145);
		font-weight: 500;
		flex-shrink: 0;
	}

	.vi-tool-open  { color: oklch(0.72 0.14 220); }
	.vi-tool-spawn { color: oklch(0.75 0.15 85);  }

	.vi-task-id {
		font-family: ui-monospace, monospace;
		font-size: 0.75rem;
		color: oklch(0.65 0.10 200);
		flex-shrink: 0;
	}

	.vi-step-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Matched auto-hide: CSS fade so content is still visible while animating */
	.vi-chip-fadeout {
		animation: vi-chip-fade-out 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
		pointer-events: none;
	}

	@keyframes vi-chip-fade-out {
		from { opacity: 1; transform: translateY(0);   }
		to   { opacity: 0; transform: translateY(6px); }
	}

	@media (prefers-reduced-motion: reduce) {
		.vi-mic            { animation: none !important; }
		.vi-countdown-bar  { animation: none !important; }
		.vi-step-done-icon { animation: none !important; }
		.vi-chip-fadeout   { animation: none !important; }
	}
</style>
