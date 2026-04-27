<script lang="ts">
	// Spec: ide/docs/prd-voice-subsystem.md §5.8
	//
	// Drop-in replacement for <input>/<textarea> that adds an inline mic button
	// when the voice subsystem is enabled and STT is available. When voice is
	// off, renders the bare element with identical layout — no mic, no extra
	// keydown handlers, no audio plumbing loaded.
	//
	// Behavior:
	//   mode='push'   hold-to-talk: pointerdown → record, pointerup → stop+transcribe
	//   mode='toggle' click to start, click again to stop+transcribe
	//   polish=true   run transcript through voice.classify() with a cleanup prompt
	//   autoSubmit    dispatch a 'submit' event on the host element after value lands

	import { onDestroy, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { voice } from '$lib/voice/voiceSubsystem.svelte';

	type Mode = 'push' | 'toggle';

	let {
		value = $bindable<string>(''),
		mode = 'push' as Mode,
		autoSubmit = false,
		polish = false,
		placeholder = '',
		disabled = false,
		multiline = false,
		rows = 3,
		name,
		id,
		class: klass = '',
		inputClass = '',
		ariaLabel,
		onsubmit
	}: {
		value?: string;
		mode?: Mode;
		autoSubmit?: boolean;
		polish?: boolean;
		placeholder?: string;
		disabled?: boolean;
		multiline?: boolean;
		rows?: number;
		name?: string;
		id?: string;
		class?: string;
		inputClass?: string;
		ariaLabel?: string;
		onsubmit?: (value: string) => void;
	} = $props();

	type RecordState = 'idle' | 'recording' | 'transcribing' | 'polishing';

	let recordState = $state<RecordState>('idle');
	let errorMessage = $state('');
	let waveformLevels = $state<number[]>(new Array(16).fill(0));

	let mediaRecorder: MediaRecorder | null = null;
	let stream: MediaStream | null = null;
	let chunks: Blob[] = [];
	let cancelled = false;
	let autoStopTimer: ReturnType<typeof setTimeout> | null = null;
	let errorClearTimer: ReturnType<typeof setTimeout> | null = null;

	// Waveform driven by Web Audio API analyser node — sampled at ~30Hz while
	// recording so the bars feel responsive without burning a frame budget.
	let audioCtx: AudioContext | null = null;
	let analyser: AnalyserNode | null = null;
	let analyserSource: MediaStreamAudioSourceNode | null = null;
	let waveformRaf: number | null = null;

	const POLISH_SYSTEM_PROMPT =
		'Fix punctuation and capitalization in this text. Return only the cleaned text, no commentary.';
	const POLISH_SCHEMA = {
		type: 'object',
		properties: { text: { type: 'string' } },
		required: ['text']
	} as const;
	const AUTO_STOP_MS = 30_000;
	const ERROR_VISIBLE_MS = 3_000;

	const sttAvailable = $derived(voice.enabled && voice.capabilities.stt);
	const llmAvailable = $derived(voice.enabled && voice.capabilities.llm);
	// Mic is suppressed when polish is requested but no LLM is wired — without
	// LLM the polish behavior would silently degrade, which violates the
	// "predictable per-instance behavior" goal in §5.8.
	const showMic = $derived(sttAvailable && (!polish || llmAvailable));
	const isBusy = $derived(recordState !== 'idle');
	const inputDisabled = $derived(disabled || isBusy);

	function getSupportedMimeType(): string {
		const candidates = [
			'audio/webm;codecs=opus',
			'audio/webm',
			'audio/ogg;codecs=opus',
			'audio/ogg'
		];
		for (const t of candidates) {
			if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
				return t;
			}
		}
		return '';
	}

	function setError(msg: string) {
		errorMessage = msg;
		if (errorClearTimer) clearTimeout(errorClearTimer);
		errorClearTimer = setTimeout(() => {
			errorMessage = '';
			errorClearTimer = null;
		}, ERROR_VISIBLE_MS);
	}

	function teardownStream() {
		if (waveformRaf !== null) {
			cancelAnimationFrame(waveformRaf);
			waveformRaf = null;
		}
		if (analyserSource) {
			try { analyserSource.disconnect(); } catch {}
			analyserSource = null;
		}
		if (analyser) {
			try { analyser.disconnect(); } catch {}
			analyser = null;
		}
		if (audioCtx) {
			audioCtx.close().catch(() => {});
			audioCtx = null;
		}
		if (stream) {
			stream.getTracks().forEach((t) => t.stop());
			stream = null;
		}
		waveformLevels = new Array(16).fill(0);
	}

	function startWaveformLoop() {
		if (!stream) return;
		try {
			const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
			if (!Ctx) return;
			audioCtx = new Ctx();
			analyserSource = audioCtx.createMediaStreamSource(stream);
			analyser = audioCtx.createAnalyser();
			analyser.fftSize = 64;
			analyserSource.connect(analyser);

			const buf = new Uint8Array(analyser.frequencyBinCount);
			const sample = () => {
				if (!analyser) return;
				analyser.getByteFrequencyData(buf);
				const slice = Math.floor(buf.length / waveformLevels.length);
				const next = new Array(waveformLevels.length);
				for (let i = 0; i < next.length; i++) {
					let sum = 0;
					for (let j = 0; j < slice; j++) sum += buf[i * slice + j] ?? 0;
					next[i] = Math.min(1, (sum / slice) / 180);
				}
				waveformLevels = next;
				waveformRaf = requestAnimationFrame(sample);
			};
			waveformRaf = requestAnimationFrame(sample);
		} catch {
			// Waveform is cosmetic — failure here shouldn't block recording.
		}
	}

	async function startRecording() {
		if (!browser || recordState !== 'idle' || !showMic) return;

		cancelled = false;
		errorMessage = '';
		chunks = [];

		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch {
			setError('Microphone access denied');
			return;
		}

		const mimeType = getSupportedMimeType();
		try {
			mediaRecorder = mimeType
				? new MediaRecorder(stream, { mimeType })
				: new MediaRecorder(stream);
		} catch (e) {
			teardownStream();
			setError(e instanceof Error ? e.message : 'Recorder unavailable');
			return;
		}

		mediaRecorder.ondataavailable = (e) => {
			if (e.data && e.data.size > 0) chunks.push(e.data);
		};
		mediaRecorder.onstop = handleRecorderStop;

		try {
			mediaRecorder.start();
		} catch (e) {
			teardownStream();
			setError(e instanceof Error ? e.message : 'Failed to start recorder');
			return;
		}

		recordState = 'recording';
		startWaveformLoop();
		autoStopTimer = setTimeout(() => stopRecording(), AUTO_STOP_MS);
	}

	function stopRecording() {
		if (autoStopTimer) {
			clearTimeout(autoStopTimer);
			autoStopTimer = null;
		}
		if (mediaRecorder && mediaRecorder.state === 'recording') {
			mediaRecorder.stop();
		} else {
			teardownStream();
			recordState = 'idle';
		}
	}

	function cancelRecording() {
		cancelled = true;
		stopRecording();
	}

	async function handleRecorderStop() {
		const recorderMime = mediaRecorder?.mimeType ?? 'audio/webm';
		teardownStream();

		if (cancelled || chunks.length === 0) {
			recordState = 'idle';
			return;
		}

		recordState = 'transcribing';
		const blob = new Blob(chunks, { type: recorderMime });
		chunks = [];

		let transcript = '';
		try {
			const form = new FormData();
			form.append('audio', blob, 'audio.webm');
			const res = await fetch('/api/voice/transcribe', { method: 'POST', body: form });
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || `Transcription failed (${res.status})`);
			}
			const data = (await res.json()) as { transcript?: string };
			transcript = (data.transcript ?? '').trim();
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Transcription failed');
			recordState = 'idle';
			return;
		}

		if (!transcript) {
			setError('No speech detected');
			recordState = 'idle';
			return;
		}

		let finalText = transcript;
		if (polish && llmAvailable) {
			recordState = 'polishing';
			try {
				const result = await voice.classify<{ text: string }>({
					system: POLISH_SYSTEM_PROMPT,
					transcript,
					context: '',
					schema: POLISH_SCHEMA as unknown as object
				});
				if (result.parsed?.text && typeof result.parsed.text === 'string') {
					finalText = result.parsed.text.trim() || transcript;
				}
			} catch {
				// Polish failure falls back to the raw transcript — surfacing an
				// error here would be more disruptive than the cosmetic miss.
			}
		}

		value = finalText;
		recordState = 'idle';

		if (autoSubmit) {
			await tick();
			onsubmit?.(finalText);
		}
	}

	function handleMicPointerDown(e: PointerEvent) {
		if (mode !== 'push' || !showMic || disabled) return;
		e.preventDefault();
		(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
		void startRecording();
	}

	function handleMicPointerUp(e: PointerEvent) {
		if (mode !== 'push') return;
		if (recordState === 'recording') {
			(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
			stopRecording();
		}
	}

	function handleMicPointerCancel() {
		if (mode === 'push' && recordState === 'recording') cancelRecording();
	}

	function handleMicClick() {
		if (mode !== 'toggle' || !showMic || disabled) return;
		if (recordState === 'idle') void startRecording();
		else if (recordState === 'recording') stopRecording();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && recordState === 'recording') {
			e.preventDefault();
			cancelRecording();
		}
	}

	onDestroy(() => {
		if (autoStopTimer) clearTimeout(autoStopTimer);
		if (errorClearTimer) clearTimeout(errorClearTimer);
		if (mediaRecorder && mediaRecorder.state === 'recording') {
			cancelled = true;
			try { mediaRecorder.stop(); } catch {}
		}
		teardownStream();
	});

	const stateLabel = $derived.by(() => {
		switch (recordState) {
			case 'recording': return 'Listening…';
			case 'transcribing': return 'Transcribing…';
			case 'polishing': return 'Polishing…';
			default: return placeholder;
		}
	});
</script>

<div class="voice-input {klass}" class:voice-input--busy={isBusy}>
	<div class="voice-input__field">
		{#if multiline}
			<textarea
				bind:value
				{name}
				{id}
				{rows}
				class="voice-input__el {inputClass}"
				class:voice-input__el--has-mic={showMic}
				placeholder={isBusy ? stateLabel : placeholder}
				disabled={inputDisabled}
				aria-label={ariaLabel}
				onkeydown={handleKeydown}
			></textarea>
		{:else}
			<input
				type="text"
				bind:value
				{name}
				{id}
				class="voice-input__el {inputClass}"
				class:voice-input__el--has-mic={showMic}
				placeholder={isBusy ? stateLabel : placeholder}
				disabled={inputDisabled}
				aria-label={ariaLabel}
				onkeydown={handleKeydown}
			/>
		{/if}

		{#if showMic}
			<button
				type="button"
				class="voice-input__mic"
				class:voice-input__mic--recording={recordState === 'recording'}
				class:voice-input__mic--working={recordState === 'transcribing' || recordState === 'polishing'}
				class:voice-input__mic--multiline={multiline}
				disabled={disabled || (recordState === 'transcribing' || recordState === 'polishing')}
				onpointerdown={handleMicPointerDown}
				onpointerup={handleMicPointerUp}
				onpointercancel={handleMicPointerCancel}
				onclick={handleMicClick}
				aria-label={recordState === 'recording' ? 'Stop recording' : 'Start voice input'}
				aria-pressed={recordState === 'recording'}
				title={mode === 'push' ? 'Hold to talk' : 'Click to talk'}
			>
				{#if recordState === 'transcribing' || recordState === 'polishing'}
					<svg class="voice-input__spinner" viewBox="0 0 24 24" aria-hidden="true">
						<circle cx="12" cy="12" r="9" />
					</svg>
				{:else}
					<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="9" y="3" width="6" height="12" rx="3" />
						<path d="M5 11a7 7 0 0 0 14 0" />
						<line x1="12" y1="18" x2="12" y2="22" />
					</svg>
				{/if}
			</button>
		{/if}

		{#if recordState === 'recording'}
			<div class="voice-input__waveform" aria-hidden="true">
				{#each waveformLevels as level, i (i)}
					<span class="voice-input__bar" style="--h: {Math.max(0.08, level)}"></span>
				{/each}
			</div>
		{/if}
	</div>

	{#if errorMessage}
		<div class="voice-input__error" role="alert">{errorMessage}</div>
	{/if}
</div>

<style>
	.voice-input {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 100%;
	}

	.voice-input__field {
		position: relative;
		display: flex;
		width: 100%;
	}

	.voice-input__el {
		width: 100%;
		font: inherit;
		color: inherit;
	}

	/* Reserve space for the mic button so the visible text doesn't slide under it. */
	.voice-input__el--has-mic {
		padding-right: 2.5rem;
	}

	.voice-input__mic {
		position: absolute;
		top: 0.375rem;
		right: 0.375rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		padding: 0;
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.375rem;
		background: oklch(0.20 0.02 250);
		color: oklch(0.85 0.02 250);
		cursor: pointer;
		transition: background-color 0.12s ease, border-color 0.12s ease, color 0.12s ease;
	}

	/* Anchor to top-right for textareas so the mic doesn't drift mid-field. */
	.voice-input__mic--multiline {
		top: 0.5rem;
		right: 0.5rem;
	}

	.voice-input__mic:hover:not(:disabled) {
		background: oklch(0.25 0.03 250);
		color: oklch(0.95 0.02 250);
	}

	.voice-input__mic:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.voice-input__mic svg {
		width: 1rem;
		height: 1rem;
	}

	.voice-input__mic--recording {
		background: oklch(0.55 0.20 25);
		border-color: oklch(0.65 0.22 25);
		color: oklch(0.98 0.01 25);
		animation: voice-mic-pulse 1.1s ease-in-out infinite;
	}

	.voice-input__mic--working {
		background: oklch(0.40 0.10 250);
		border-color: oklch(0.50 0.12 250);
		color: oklch(0.95 0.02 250);
	}

	.voice-input__spinner {
		width: 1rem;
		height: 1rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 2.5;
		stroke-dasharray: 56;
		stroke-dashoffset: 14;
		animation: voice-spin 0.9s linear infinite;
	}

	.voice-input__waveform {
		position: absolute;
		left: 0.625rem;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		gap: 2px;
		height: 1rem;
		pointer-events: none;
	}

	.voice-input__bar {
		display: inline-block;
		width: 2px;
		height: calc(0.875rem * var(--h, 0.1));
		min-height: 2px;
		background: oklch(0.70 0.18 25);
		border-radius: 1px;
		transition: height 60ms linear;
	}

	.voice-input__error {
		font-size: 0.75rem;
		color: oklch(0.70 0.18 25);
		padding-left: 0.125rem;
	}

	@keyframes voice-mic-pulse {
		0%, 100% { box-shadow: 0 0 0 0 oklch(0.65 0.22 25 / 0.45); }
		50%      { box-shadow: 0 0 0 6px oklch(0.65 0.22 25 / 0); }
	}

	@keyframes voice-spin {
		to { transform: rotate(360deg); }
	}

	@media (prefers-reduced-motion: reduce) {
		.voice-input__mic--recording { animation: none; }
		.voice-input__spinner { animation: none; }
		.voice-input__bar { transition: none; }
	}
</style>
