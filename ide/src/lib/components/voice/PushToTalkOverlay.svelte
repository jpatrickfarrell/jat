<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import {
		getVoiceState,
		getTranscript,
		getMicPermission,
		getErrorMessage,
		type VoiceState
	} from '$lib/stores/voiceCapture.svelte';

	const WAVEFORM_BARS = 12;

	let voiceState = $derived(getVoiceState());
	let transcript = $derived(getTranscript());
	let micPermission = $derived(getMicPermission());
	let errorMessage = $derived(getErrorMessage());

	let visible = $derived(voiceState !== 'idle');
</script>

{#if visible}
	<div
		class="push-to-talk-overlay"
		role="status"
		aria-live="polite"
		transition:fly={{ y: -80, duration: 220, easing: cubicOut }}
	>
		<div class="ptl-inner">
			{#if voiceState === 'listening'}
				<div class="ptl-waveform" aria-hidden="true">
					{#each Array(WAVEFORM_BARS) as _, i}
						<div
							class="ptl-bar"
							style="animation-delay: {(i * 60) % 360}ms; animation-duration: {600 + (i % 4) * 100}ms"
						></div>
					{/each}
				</div>
				<span class="ptl-label listening">Listening…</span>
				<span class="ptl-hint">Release Space to transcribe · Esc to cancel</span>

			{:else if voiceState === 'transcribing'}
				<span class="ptl-spinner" aria-hidden="true"></span>
				<span class="ptl-label transcribing">Transcribing…</span>

			{:else if voiceState === 'matched'}
				<span class="ptl-icon matched" aria-hidden="true">✓</span>
				<span class="ptl-transcript">{transcript}</span>

			{:else if voiceState === 'no-match'}
				{#if micPermission === 'denied'}
					<span class="ptl-icon error" aria-hidden="true">🎤</span>
					<span class="ptl-label error">{errorMessage || 'Microphone permission denied'}</span>
				{:else}
					<span class="ptl-icon error" aria-hidden="true">✗</span>
					<span class="ptl-label error">{errorMessage || 'No speech detected'}</span>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<style>
	.push-to-talk-overlay {
		position: fixed;
		top: 3.5rem; /* below TopBar */
		left: 50%;
		transform: translateX(-50%);
		z-index: 9999;
		pointer-events: none;
	}

	.ptl-inner {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.5rem 1rem;
		background: oklch(0.18 0.03 250 / 0.96);
		border: 1px solid oklch(0.35 0.05 250 / 0.6);
		border-radius: 2rem;
		box-shadow: 0 8px 32px oklch(0 0 0 / 0.4), 0 0 0 1px oklch(0.4 0.1 240 / 0.15);
		backdrop-filter: blur(12px);
		white-space: nowrap;
		min-width: 200px;
		max-width: 480px;
	}

	/* Waveform bars */
	.ptl-waveform {
		display: flex;
		align-items: center;
		gap: 2px;
		height: 1.25rem;
	}

	.ptl-bar {
		width: 3px;
		height: 100%;
		background: oklch(0.75 0.18 200);
		border-radius: 2px;
		animation: ptl-bounce infinite ease-in-out alternate;
	}

	@keyframes ptl-bounce {
		0%   { transform: scaleY(0.2); opacity: 0.5; }
		100% { transform: scaleY(1);   opacity: 1; }
	}

	/* Spinner */
	.ptl-spinner {
		display: inline-block;
		width: 14px;
		height: 14px;
		border: 2px solid oklch(0.5 0.05 250);
		border-top-color: oklch(0.75 0.18 200);
		border-radius: 50%;
		animation: ptl-spin 0.6s linear infinite;
		flex-shrink: 0;
	}

	@keyframes ptl-spin {
		to { transform: rotate(360deg); }
	}

	/* Icons */
	.ptl-icon {
		font-size: 0.9rem;
		flex-shrink: 0;
	}

	.ptl-icon.matched {
		color: oklch(0.72 0.18 145);
	}

	.ptl-icon.error {
		color: oklch(0.68 0.18 30);
	}

	/* Labels */
	.ptl-label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(0.85 0.04 250);
	}

	.ptl-label.listening {
		color: oklch(0.82 0.12 200);
	}

	.ptl-label.transcribing {
		color: oklch(0.80 0.10 250);
	}

	.ptl-label.error {
		color: oklch(0.72 0.15 30);
	}

	.ptl-hint {
		font-size: 0.7rem;
		color: oklch(0.55 0.04 250);
		margin-left: 0.25rem;
	}

	/* Transcript */
	.ptl-transcript {
		font-size: 0.8125rem;
		color: oklch(0.88 0.04 250);
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 380px;
	}

	@media (prefers-reduced-motion: reduce) {
		.ptl-bar,
		.ptl-spinner {
			animation: none !important;
		}
	}
</style>
