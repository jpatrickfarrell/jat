<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { jumpToSession } from '$lib/stores/hoveredSession';
	import { SESSION_STATE_VISUALS } from '$lib/config/statusColors';
	import { getProjectColor } from '$lib/utils/projectColors';

	export interface ReviewSession {
		sessionName: string;
		agentName: string;
		taskId?: string;
		taskTitle?: string;
		project?: string;
	}

	let { reviewSessions = [] }: { reviewSessions?: ReviewSession[] } = $props();

	function loadDismissed(): Set<string> {
		if (typeof window === 'undefined') return new Set();
		try {
			const stored = localStorage.getItem('rnb-dismissed');
			if (stored) return new Set(JSON.parse(stored));
		} catch {}
		return new Set();
	}

	let dismissed = $state<Set<string>>(loadDismissed());

	$effect(() => {
		localStorage.setItem('rnb-dismissed', JSON.stringify([...dismissed]));
	});

	// Clear dismissed state for sessions that have left review (so they re-notify next time)
	$effect(() => {
		const current = new Set(reviewSessions.map(s => s.sessionName));
		let changed = false;
		for (const name of dismissed) {
			if (!current.has(name)) {
				dismissed.delete(name);
				changed = true;
			}
		}
		if (changed) dismissed = new Set(dismissed);
	});

	const visibleSessions = $derived(reviewSessions.filter(s => !dismissed.has(s.sessionName)));
	const isVisible = $derived(visibleSessions.length > 0);

	const reviewAccent = $derived(SESSION_STATE_VISUALS['ready-for-review']?.accent ?? 'oklch(0.70 0.18 200)');

	function dismiss(sessionName: string) {
		dismissed = new Set([...dismissed, sessionName]);
	}

	function dismissAll() {
		dismissed = new Set(reviewSessions.map(s => s.sessionName));
	}

	async function goToSession(session: ReviewSession) {
		const isOnTasks = $page.url.pathname === '/tasks';
		dismiss(session.sessionName);
		if (!isOnTasks) {
			await goto('/tasks');
			setTimeout(() => jumpToSession(session.sessionName, session.agentName), 450);
		} else {
			jumpToSession(session.sessionName, session.agentName);
		}
	}
</script>

<!-- Slide-up-behind-topbar animation via grid-template-rows -->
<div
	class="rnb-wrapper"
	class:rnb-hidden={!isVisible}
	role="status"
	aria-live="polite"
	aria-label="Sessions ready for review"
>
	<div class="rnb-inner">
		<div class="rnb-bar" style="--rnb-accent: {reviewAccent}">
			<!-- Label -->
			<span class="rnb-label" aria-hidden="true">
				<svg class="rnb-eye-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
					<path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clip-rule="evenodd" />
				</svg>
				REVIEW
			</span>

			<!-- Session chips -->
			<div class="rnb-chips" role="list">
				{#each visibleSessions as session (session.sessionName)}
					{@const projColor = session.project ? getProjectColor(session.project) : reviewAccent}
					<span class="rnb-chip" role="listitem" style="--chip-color: {projColor}">
						<span class="rnb-dot" style="background: {projColor};" aria-hidden="true"></span>
						<span class="rnb-agent">{session.agentName}</span>
						{#if session.taskTitle}
							<span class="rnb-task" title={session.taskTitle}>{session.taskTitle}</span>
						{/if}
						<button
							type="button"
							class="rnb-go"
							onclick={() => goToSession(session)}
							aria-label="Go to {session.agentName} session"
						>Go →</button>
						<button
							type="button"
							class="rnb-x"
							onclick={() => dismiss(session.sessionName)}
							aria-label="Dismiss {session.agentName} notification"
						>×</button>
					</span>
				{/each}
			</div>

			{#if visibleSessions.length > 1}
				<button type="button" class="rnb-dismiss-all" onclick={dismissAll}>
					dismiss all
				</button>
			{/if}
		</div>
	</div>
</div>

<style>
	/* Grid trick: collapses height to 0 with a smooth slide-up animation */
	.rnb-wrapper {
		display: grid;
		grid-template-rows: 1fr;
		transition: grid-template-rows 0.22s cubic-bezier(0.4, 0, 0.2, 1),
		            opacity 0.18s ease;
		opacity: 1;
		flex-shrink: 0;
		z-index: 29;
	}

	.rnb-hidden {
		grid-template-rows: 0fr;
		opacity: 0;
		pointer-events: none;
	}

	.rnb-inner {
		min-height: 0;
		overflow: hidden;
	}

	.rnb-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0 0.75rem;
		height: 30px;
		background: color-mix(in oklch, var(--rnb-accent) 10%, oklch(0.14 0.01 250));
		border-bottom: 1px solid color-mix(in oklch, var(--rnb-accent) 25%, transparent);
		overflow-x: auto;
		scrollbar-width: none;
	}

	.rnb-bar::-webkit-scrollbar { display: none; }

	.rnb-label {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		color: var(--rnb-accent);
		flex-shrink: 0;
		opacity: 0.85;
	}

	.rnb-eye-icon {
		width: 12px;
		height: 12px;
		flex-shrink: 0;
	}

	/* Vertical separator after label */
	.rnb-label::after {
		content: '';
		display: inline-block;
		width: 1px;
		height: 14px;
		background: color-mix(in oklch, var(--rnb-accent) 30%, transparent);
		margin-left: 0.4rem;
	}

	.rnb-chips {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		flex: 1;
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.rnb-chips::-webkit-scrollbar { display: none; }

	.rnb-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.15rem 0.1rem 0.15rem 0.5rem;
		border-radius: 0.3rem;
		border: 1px solid color-mix(in oklch, var(--chip-color) 30%, transparent);
		background: color-mix(in oklch, var(--chip-color) 12%, transparent);
		flex-shrink: 0;
		max-width: 320px;
	}

	.rnb-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.rnb-agent {
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.02em;
		color: var(--chip-color);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.rnb-task {
		font-size: 0.65rem;
		color: oklch(0.55 0.03 250);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 180px;
	}

	/* Prominent CTA button — this IS the action that matters */
	.rnb-go {
		flex-shrink: 0;
		padding: 0.15rem 0.55rem;
		border-radius: 0.25rem;
		border: 1px solid color-mix(in oklch, var(--chip-color) 55%, transparent);
		background: color-mix(in oklch, var(--chip-color) 22%, transparent);
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		color: var(--chip-color);
		cursor: pointer;
		transition: background 0.12s, border-color 0.12s, box-shadow 0.12s;
		white-space: nowrap;
		box-shadow: 0 0 6px color-mix(in oklch, var(--chip-color) 18%, transparent);
	}

	.rnb-go:hover {
		background: color-mix(in oklch, var(--chip-color) 32%, transparent);
		border-color: color-mix(in oklch, var(--chip-color) 75%, transparent);
		box-shadow: 0 0 10px color-mix(in oklch, var(--chip-color) 35%, transparent);
	}

	.rnb-go:focus-visible {
		outline: 1px solid color-mix(in oklch, var(--chip-color) 70%, transparent);
		outline-offset: 2px;
	}

	.rnb-x {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		padding: 0;
		border: none;
		border-radius: 0.25rem;
		background: transparent;
		color: oklch(0.40 0.02 250);
		font-size: 0.8rem;
		line-height: 1;
		cursor: pointer;
		transition: color 0.1s, background 0.1s;
		flex-shrink: 0;
	}

	.rnb-x:hover {
		color: oklch(0.75 0.04 250);
		background: oklch(0.25 0.02 250 / 0.6);
	}

	.rnb-dismiss-all {
		flex-shrink: 0;
		padding: 0.15rem 0.5rem;
		border: none;
		border-radius: 0.25rem;
		background: transparent;
		font-family: ui-monospace, monospace;
		font-size: 0.575rem;
		letter-spacing: 0.03em;
		color: oklch(0.38 0.02 250);
		cursor: pointer;
		transition: color 0.1s;
		white-space: nowrap;
		margin-left: auto;
	}

	.rnb-dismiss-all:hover {
		color: oklch(0.60 0.04 250);
	}

	@media (prefers-reduced-motion: reduce) {
		.rnb-wrapper {
			transition: none;
		}
	}
</style>
