<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import {
		getVoiceState,
		getTranscript,
		getMicPermission,
		getErrorMessage,
		getLastMatch
	} from '$lib/stores/voiceCapture.svelte';

	const MATCHED_AUTOHIDE_MS = 1500;

	let voiceState = $derived(getVoiceState());
	let transcript = $derived(getTranscript());
	let micPermission = $derived(getMicPermission());
	let errorMessage = $derived(getErrorMessage());
	let match = $derived(getLastMatch());

	// Track when we entered the matched state so the chip can auto-hide 1.5s after
	// matched feedback shows. The store keeps voiceState='matched' for ~3s, but
	// the visual confirmation only needs to flash briefly.
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

	let visible = $derived(
		voiceState !== 'idle' && !(voiceState === 'matched' && matchedAutoHide)
	);

	let glowClass = $derived.by(() => {
		switch (voiceState) {
			case 'listening':
				return 'animate-glow-primary';
			case 'transcribing':
				return 'animate-glow-secondary';
			case 'matched':
				return 'animate-glow-success';
			case 'no-match':
				return 'animate-glow-error';
			default:
				return '';
		}
	});

	let stateLabel = $derived.by(() => {
		switch (voiceState) {
			case 'listening':
				return 'Listening';
			case 'transcribing':
				return 'Thinking';
			case 'matched':
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

{#if visible}
	<div
		class="voice-indicator fixed bottom-4 right-4 z-[9999] pointer-events-none"
		role="status"
		aria-live="polite"
		aria-label={stateLabel}
		transition:fly={{ y: 24, duration: 220, easing: cubicOut }}
	>
		<div class="vi-chip {glowClass}" data-state={voiceState}>
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

			{:else if voiceState === 'matched'}
				<span class="vi-icon vi-icon-success" aria-hidden="true">✓</span>
				{#if match?.entry}
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
					<span class="vi-hint">
						Press <kbd class="kbd kbd-xs vi-kbd-hint">?</kbd> for vocabulary
					</span>
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

	.vi-chip[data-state='no-match'] {
		background: oklch(0.20 0.06 30 / 0.94);
		border-color: oklch(0.45 0.12 30 / 0.6);
	}

	.vi-mic {
		display: inline-flex;
		color: oklch(0.82 0.14 200);
		animation: vi-mic-pulse 1.4s ease-in-out infinite;
	}

	@keyframes vi-mic-pulse {
		0%, 100% {
			transform: scale(1);
			opacity: 0.85;
		}
		50% {
			transform: scale(1.15);
			opacity: 1;
		}
	}

	.vi-spinner {
		color: oklch(0.78 0.10 280);
	}

	.vi-icon {
		font-size: 0.95rem;
		line-height: 1;
		flex-shrink: 0;
	}

	.vi-icon-success {
		color: oklch(0.72 0.18 145);
	}

	.vi-icon-error {
		color: oklch(0.70 0.18 30);
	}

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

	.vi-kbd-hint {
		background: oklch(0.26 0.04 250);
		border-color: oklch(0.4 0.06 250);
		color: oklch(0.78 0.04 250);
	}

	.vi-hint {
		font-size: 0.7rem;
		color: oklch(0.62 0.06 250);
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		margin-left: 0.25rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.vi-mic {
			animation: none !important;
		}
	}
</style>
