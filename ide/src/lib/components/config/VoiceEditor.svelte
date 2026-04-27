<script lang="ts">
	/**
	 * VoiceEditor — /config → Voice tab
	 *
	 * Spec: ide/docs/prd-voice-subsystem.md §5.7
	 * Task: jat-68j78.11
	 *
	 * Two states driven by voice.enabled:
	 *  - Disabled (§5.7.1): single CTA gated on STT availability + install hints
	 *  - Enabled  (§5.7.2): full config — input device, hotkey, STT/LLM radios,
	 *    privacy master toggle, advanced overrides, diagnostics
	 *
	 * Switching providers and toggling enable take effect without reload because
	 * the voiceSubsystem store is reactive ($state) and the component reads it
	 * directly — no local cache, no manual rerender.
	 */

	import { onMount } from 'svelte';
	import { voice } from '$lib/voice/voiceSubsystem.svelte';

	type ProbeMeta = {
		id: string;
		name: string;
		isLocal: boolean;
		available: boolean;
		reason?: string;
		capabilities?: { diarize?: boolean; latencyP50Ms?: number };
	};
	type ProbeResponse = { stt: ProbeMeta[]; llm: ProbeMeta[]; speak: ProbeMeta[] };

	// ── Probe state (shared by both UI states) ────────────────────────────────
	let probe = $state<ProbeResponse | null>(null);
	let probeLoading = $state(false);
	let probeError = $state<string | null>(null);

	// ── Devices (enabled state only) ──────────────────────────────────────────
	let devices = $state<MediaDeviceInfo[]>([]);
	let deviceError = $state<string | null>(null);

	// ── Save / action state ───────────────────────────────────────────────────
	let saving = $state(false);
	let actionError = $state<string | null>(null);

	// ── Disabled-state nuclear reset ──────────────────────────────────────────
	let confirmingNuke = $state(false);
	let nuking = $state(false);

	// ── Diagnostics ───────────────────────────────────────────────────────────
	type SttResult = { ok: true; text: string; latencyMs: number } | { ok: false; error: string };
	type LlmResult = { ok: true; resultJson: string; latencyMs: number } | { ok: false; error: string };
	let testSttResult = $state<SttResult | null>(null);
	let testSttBusy = $state(false);
	let testLlmResult = $state<LlmResult | null>(null);
	let testLlmBusy = $state(false);

	// ── Audit log accordion (data wired in jat-68j78.21) ──────────────────────
	let recentCallsOpen = $state(false);

	// ── Advanced accordion ────────────────────────────────────────────────────
	let advancedOpen = $state(false);

	// Derived: at least one STT provider available?
	const hasStt = $derived(probe?.stt.some((p) => p.available) ?? false);

	async function fetchProbe() {
		probeLoading = true;
		probeError = null;
		try {
			const res = await fetch('/api/voice/providers');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			probe = (await res.json()) as ProbeResponse;
		} catch (e) {
			probeError = e instanceof Error ? e.message : String(e);
		} finally {
			probeLoading = false;
		}
	}

	async function fetchDevices() {
		deviceError = null;
		try {
			if (!navigator.mediaDevices?.enumerateDevices) {
				deviceError = 'mediaDevices not supported in this browser';
				return;
			}
			const list = await navigator.mediaDevices.enumerateDevices();
			devices = list.filter((d) => d.kind === 'audioinput');
		} catch (e) {
			deviceError = e instanceof Error ? e.message : String(e);
		}
	}

	async function requestMicAndEnumerate() {
		deviceError = null;
		try {
			// Triggers permission prompt; without it, device labels are blank.
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			stream.getTracks().forEach((t) => t.stop());
			await fetchDevices();
		} catch (e) {
			deviceError =
				e instanceof Error ? `Mic permission denied: ${e.message}` : 'Mic permission denied';
		}
	}

	onMount(async () => {
		await voice.init();
		await fetchProbe();
		if (voice.enabled) {
			await fetchDevices();
		}
	});

	// ── Disabled → Enabled flip ───────────────────────────────────────────────
	async function handleEnable() {
		saving = true;
		actionError = null;
		try {
			await voice.setEnabled(true);
			await fetchProbe();
			await fetchDevices();
		} catch (e) {
			actionError = e instanceof Error ? e.message : String(e);
		} finally {
			saving = false;
		}
	}

	async function handleDisable() {
		saving = true;
		actionError = null;
		try {
			await voice.setEnabled(false);
			devices = [];
			testSttResult = null;
			testLlmResult = null;
		} catch (e) {
			actionError = e instanceof Error ? e.message : String(e);
		} finally {
			saving = false;
		}
	}

	async function handleRecheck() {
		await fetchProbe();
		if (voice.enabled) {
			await voice.reprobe();
		}
	}

	async function handleNukeConfig() {
		nuking = true;
		actionError = null;
		try {
			// Writing the defaults via PUT is equivalent to deleting voice.json:
			// next GET re-initializes from the same shape. Keeps the API surface
			// minimal — no separate DELETE endpoint required.
			const defaults = {
				enabled: false,
				activeStt: 'voxtype',
				activeLlm: 'ollama',
				activeTts: null,
				privacy: { offDeviceAudio: false, offDeviceText: false, offDeviceSpeech: false },
				hotkey: 'Ctrl+Space',
				inputDeviceId: 'default',
				providerOverrides: {
					ollama: { model: 'gemma3:4b', timeoutMs: 5000 },
					openai: { model: 'gpt-4o-mini' }
				}
			};
			const res = await fetch('/api/config/voice', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(defaults)
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			// Force the store to re-read from disk: setEnabled flushes #initPromise.
			await voice.setEnabled(false);
			confirmingNuke = false;
		} catch (e) {
			actionError = e instanceof Error ? e.message : String(e);
		} finally {
			nuking = false;
		}
	}

	// ── Provider selection ────────────────────────────────────────────────────
	async function handleSttPick(id: string) {
		actionError = null;
		try {
			await voice.setActiveStt(id);
		} catch (e) {
			actionError = e instanceof Error ? e.message : String(e);
		}
	}

	async function handleLlmPick(id: string) {
		actionError = null;
		try {
			await voice.setActiveLlm(id);
		} catch (e) {
			actionError = e instanceof Error ? e.message : String(e);
		}
	}

	// Master privacy toggle: writes all three off-device fields together.
	// jat-68j78.18 will add granular sub-toggles + master gate behavior.
	const privacyMasterOn = $derived.by(() => {
		const c = voice.getConfig().privacy;
		return c.offDeviceAudio || c.offDeviceText || c.offDeviceSpeech;
	});

	async function handlePrivacyMaster(on: boolean) {
		actionError = null;
		try {
			await voice.setPrivacy({
				offDeviceAudio: on,
				offDeviceText: on,
				offDeviceSpeech: on
			});
		} catch (e) {
			actionError = e instanceof Error ? e.message : String(e);
		}
	}

	async function handleDeviceChange(deviceId: string) {
		actionError = null;
		try {
			await voice.setInputDevice(deviceId);
		} catch (e) {
			actionError = e instanceof Error ? e.message : String(e);
		}
	}

	// ── Advanced: provider overrides ──────────────────────────────────────────
	const overrides = $derived(voice.getConfig().providerOverrides);

	async function handleOverrideChange(
		providerId: string,
		key: 'model' | 'timeoutMs',
		value: string
	) {
		actionError = null;
		try {
			const parsed = key === 'timeoutMs' ? Number(value) || 0 : value;
			await voice.setProviderOverride(providerId, { [key]: parsed });
		} catch (e) {
			actionError = e instanceof Error ? e.message : String(e);
		}
	}

	// ── Diagnostics ───────────────────────────────────────────────────────────
	async function handleTestStt() {
		testSttBusy = true;
		testSttResult = null;
		const t0 = performance.now();
		try {
			const res = await voice.testStt();
			testSttResult = {
				ok: true,
				text: res.transcript || '(empty)',
				latencyMs: Math.round(performance.now() - t0)
			};
		} catch (e) {
			testSttResult = { ok: false, error: e instanceof Error ? e.message : String(e) };
		} finally {
			testSttBusy = false;
		}
	}

	async function handleTestLlm() {
		testLlmBusy = true;
		testLlmResult = null;
		const t0 = performance.now();
		try {
			const res = await voice.testLlm();
			testLlmResult = {
				ok: true,
				resultJson: JSON.stringify(res, null, 2),
				latencyMs: Math.round(performance.now() - t0)
			};
		} catch (e) {
			testLlmResult = { ok: false, error: e instanceof Error ? e.message : String(e) };
		} finally {
			testLlmBusy = false;
		}
	}

	function badgeFor(p: ProbeMeta): string[] {
		const out: string[] = [];
		out.push(p.isLocal ? 'LOCAL' : 'CLOUD');
		if (p.capabilities?.diarize) out.push('DIARIZE');
		if (p.capabilities?.latencyP50Ms) out.push(`p50 ${p.capabilities.latencyP50Ms}ms`);
		return out;
	}

	function installHintFor(id: string): string {
		switch (id) {
			case 'voxtype':
				return 'Install voxtype: pip install voxtype (or see https://github.com/jomarchy/voxtype)';
			case 'ollama':
				return 'Install ollama from https://ollama.ai, then run: ollama pull gemma3:4b';
			default:
				return '';
		}
	}
</script>

<div class="voice-editor">
	<header class="voice-header">
		<div>
			<h2 class="voice-title">Voice subsystem</h2>
			<p class="voice-subtitle">
				Push-to-talk transcription, intent classification, and click-to-speak across the IDE.
			</p>
		</div>

		{#if voice.enabled}
			<div class="status-pill" data-status={voice.status}>
				<span class="status-dot"></span>
				{voice.status}
			</div>
		{/if}
	</header>

	{#if actionError}
		<div class="alert alert-error" role="alert">
			<span>{actionError}</span>
			<button class="btn-close" onclick={() => (actionError = null)} aria-label="Dismiss">×</button>
		</div>
	{/if}

	{#if !voice.enabled}
		<!-- ════════════════════════════════════════════════════════════════════════ -->
		<!-- §5.7.1 — Disabled state                                                -->
		<!-- ════════════════════════════════════════════════════════════════════════ -->
		<section class="card">
			<h3 class="card-title">Voice subsystem is disabled</h3>
			<p class="card-body">
				Voice powers push-to-talk transcription (Ctrl+Space), intent classification for "Siri-style"
				commands, and dictation in any task title or description field. While disabled, no
				microphone is opened, no providers are probed, and no network calls leave your machine.
			</p>

			<h4 class="section-label">Requirements</h4>
			{#if probeLoading && !probe}
				<p class="muted">Probing local providers…</p>
			{:else if probeError}
				<p class="muted">Probe failed: {probeError}</p>
			{:else if probe}
				<ul class="req-list">
					{#each [...probe.stt, ...probe.llm] as p}
						<li class="req" class:ok={p.available}>
							<span class="req-icon">{p.available ? '✓' : '✗'}</span>
							<span class="req-name">{p.name}</span>
							<span class="req-tag">{p.isLocal ? 'local' : 'cloud'}</span>
							{#if !p.available}
								<span class="req-reason">— {p.reason ?? 'unavailable'}</span>
								{#if installHintFor(p.id)}
									<div class="req-hint">{installHintFor(p.id)}</div>
								{/if}
							{/if}
						</li>
					{/each}
				</ul>
			{/if}

			<div class="actions">
				<button class="btn btn-primary" onclick={handleEnable} disabled={!hasStt || saving}>
					{saving ? 'Enabling…' : 'Enable voice subsystem'}
				</button>
				<button class="btn btn-ghost" onclick={handleRecheck} disabled={probeLoading}>
					{probeLoading ? 'Rechecking…' : 'Recheck'}
				</button>
				{#if !hasStt && probe}
					<span class="muted small">Install at least one STT provider to enable.</span>
				{/if}
			</div>
		</section>

		<footer class="nuke-footer">
			{#if !confirmingNuke}
				<button class="link-danger" onclick={() => (confirmingNuke = true)}>
					Delete voice.json (nuclear reset)
				</button>
			{:else}
				<span class="muted">Reset voice.json to defaults?</span>
				<button class="btn btn-danger btn-sm" onclick={handleNukeConfig} disabled={nuking}>
					{nuking ? 'Resetting…' : 'Reset'}
				</button>
				<button class="btn btn-ghost btn-sm" onclick={() => (confirmingNuke = false)} disabled={nuking}>
					Cancel
				</button>
			{/if}
		</footer>
	{:else}
		<!-- ════════════════════════════════════════════════════════════════════════ -->
		<!-- §5.7.2 — Enabled state                                                 -->
		<!-- ════════════════════════════════════════════════════════════════════════ -->
		<section class="card master">
			<div class="master-row">
				<div>
					<h3 class="card-title">Voice subsystem: Enabled</h3>
					<p class="muted small">
						Toggle off to stop all voice features. The mic handler unloads without a reload.
					</p>
				</div>
				<button class="btn btn-ghost" onclick={handleDisable} disabled={saving}>
					{saving ? 'Disabling…' : 'Disable'}
				</button>
			</div>
		</section>

		<section class="card">
			<h4 class="section-label">Input device</h4>
			{#if deviceError}
				<p class="muted">{deviceError}</p>
				<button class="btn btn-ghost btn-sm" onclick={requestMicAndEnumerate}>Grant mic access</button>
			{:else if devices.length === 0}
				<p class="muted">No input devices detected.</p>
				<button class="btn btn-ghost btn-sm" onclick={requestMicAndEnumerate}>Refresh devices</button>
			{:else}
				<select
					class="select"
					value={voice.getConfig().inputDeviceId}
					onchange={(e) => handleDeviceChange((e.currentTarget as HTMLSelectElement).value)}
				>
					<option value="default">Default device</option>
					{#each devices as d}
						<option value={d.deviceId}>
							{d.label || `Mic ${d.deviceId.slice(0, 6)}`}
						</option>
					{/each}
				</select>
			{/if}
			<p class="muted small">Live waveform: jat-68j78.18</p>
		</section>

		<section class="card">
			<h4 class="section-label">Push-to-talk hotkey</h4>
			<div class="hotkey-row">
				<kbd class="kbd">{voice.getConfig().hotkey}</kbd>
				<a class="link-sub" href="/config?tab=shortcuts">Edit in Shortcuts →</a>
			</div>
		</section>

		<section class="card">
			<h4 class="section-label">Transcription provider (STT)</h4>
			{#if probeLoading && !probe}
				<p class="muted">Probing…</p>
			{:else if probe}
				<div class="radios">
					{#each probe.stt as p (p.id)}
						<label class="radio-row" class:disabled={!p.available}>
							<input
								type="radio"
								name="stt-provider"
								value={p.id}
								checked={voice.activeSttId === p.id}
								disabled={!p.available}
								onchange={() => handleSttPick(p.id)}
							/>
							<span class="radio-name">{p.name}</span>
							{#each badgeFor(p) as b}
								<span class="badge" class:cloud={b === 'CLOUD'}>{b}</span>
							{/each}
							{#if !p.available && p.reason}
								<span class="muted small">— {p.reason}</span>
							{/if}
							{#if !p.isLocal && p.available && !privacyMasterOn}
								<div class="nudge">Enable off-device audio in Privacy below to use this provider.</div>
							{/if}
						</label>
					{/each}
				</div>
			{/if}
		</section>

		<section class="card">
			<h4 class="section-label">Intent provider (LLM)</h4>
			{#if probe}
				<div class="radios">
					{#each probe.llm as p (p.id)}
						<label class="radio-row" class:disabled={!p.available}>
							<input
								type="radio"
								name="llm-provider"
								value={p.id}
								checked={voice.activeLlmId === p.id}
								disabled={!p.available}
								onchange={() => handleLlmPick(p.id)}
							/>
							<span class="radio-name">{p.name}</span>
							{#each badgeFor(p) as b}
								<span class="badge" class:cloud={b === 'CLOUD'}>{b}</span>
							{/each}
							{#if !p.available && p.reason}
								<span class="muted small">— {p.reason}</span>
							{/if}
						</label>
					{/each}
				</div>
			{/if}
		</section>

		<section class="card">
			<h4 class="section-label">Privacy</h4>
			<label class="toggle-row">
				<input
					type="checkbox"
					checked={privacyMasterOn}
					onchange={(e) => handlePrivacyMaster((e.currentTarget as HTMLInputElement).checked)}
				/>
				<span class="toggle-label">Allow off-device processing</span>
				<span class="muted small">
					Master gate. When off, only LOCAL providers may run.
				</span>
			</label>
			<p class="muted small">Granular sub-toggles: jat-68j78.18 — full audit log: jat-68j78.21</p>

			<details class="accordion" bind:open={recentCallsOpen}>
				<summary>Recent cloud calls</summary>
				<p class="muted">Audit log UI lands in jat-68j78.21 (reads <code>~/.config/jat/voice-audit.jsonl</code>).</p>
			</details>
		</section>

		<section class="card">
			<h4 class="section-label">Diagnostics</h4>
			<div class="diag-row">
				<button class="btn btn-ghost btn-sm" onclick={handleTestStt} disabled={testSttBusy}>
					{testSttBusy ? 'Testing STT…' : 'Test STT'}
				</button>
				{#if testSttResult}
					{#if testSttResult.ok}
						<span class="diag-result ok">"{testSttResult.text}" — {testSttResult.latencyMs}ms</span>
					{:else}
						<span class="diag-result err">{testSttResult.error}</span>
					{/if}
				{/if}
			</div>

			<div class="diag-row">
				<button class="btn btn-ghost btn-sm" onclick={handleTestLlm} disabled={testLlmBusy}>
					{testLlmBusy ? 'Testing LLM…' : 'Test LLM'}
				</button>
				{#if testLlmResult}
					{#if testLlmResult.ok}
						<span class="diag-result ok">{testLlmResult.latencyMs}ms</span>
					{:else}
						<span class="diag-result err">{testLlmResult.error}</span>
					{/if}
				{/if}
			</div>
			{#if testLlmResult?.ok}
				<pre class="diag-json">{testLlmResult.resultJson}</pre>
			{/if}

			<div class="diag-row">
				<button class="btn btn-ghost btn-sm" onclick={handleRecheck}>Re-probe providers</button>
				<span class="muted small">Metrics dashboard: jat-68j78.26</span>
			</div>
		</section>

		<section class="card">
			<details class="accordion" bind:open={advancedOpen}>
				<summary>Advanced</summary>
				<div class="advanced-grid">
					{#each Object.keys(overrides) as providerId}
						<div class="advanced-row">
							<div class="advanced-name">{providerId}</div>
							<label class="advanced-field">
								<span class="muted small">model</span>
								<input
									class="input"
									type="text"
									value={(overrides[providerId] as Record<string, unknown>).model ?? ''}
									onchange={(e) =>
										handleOverrideChange(
											providerId,
											'model',
											(e.currentTarget as HTMLInputElement).value
										)}
								/>
							</label>
							<label class="advanced-field">
								<span class="muted small">timeoutMs</span>
								<input
									class="input"
									type="number"
									min="500"
									max="60000"
									value={(overrides[providerId] as Record<string, unknown>).timeoutMs ?? ''}
									onchange={(e) =>
										handleOverrideChange(
											providerId,
											'timeoutMs',
											(e.currentTarget as HTMLInputElement).value
										)}
								/>
							</label>
						</div>
					{/each}
				</div>
				<p class="muted small">
					Per-provider config files. Empty model uses provider default; empty timeout uses 5s.
				</p>
			</details>
		</section>
	{/if}
</div>

<style>
	.voice-editor {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 880px;
	}

	.voice-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 0.5rem;
	}

	.voice-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: oklch(0.9 0.02 250);
		margin: 0;
		font-family: ui-monospace, monospace;
	}

	.voice-subtitle {
		color: oklch(0.6 0.02 250);
		font-size: 0.85rem;
		margin: 0.25rem 0 0;
	}

	.status-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-family: ui-monospace, monospace;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		background: oklch(0.18 0.02 250);
		color: oklch(0.7 0.02 250);
		border: 1px solid oklch(0.25 0.02 250);
	}
	.status-pill[data-status='ready'] { color: oklch(0.8 0.18 145); border-color: oklch(0.4 0.15 145); }
	.status-pill[data-status='degraded'] { color: oklch(0.8 0.15 85); border-color: oklch(0.4 0.12 85); }
	.status-pill[data-status='initializing'] { color: oklch(0.8 0.15 220); border-color: oklch(0.4 0.12 220); }
	.status-pill[data-status='offline'] { color: oklch(0.6 0.02 250); }

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: currentColor;
	}

	.alert {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.6rem 0.85rem;
		border-radius: 8px;
		font-size: 0.85rem;
	}
	.alert-error {
		background: oklch(0.22 0.08 25 / 0.4);
		border: 1px solid oklch(0.5 0.18 25 / 0.5);
		color: oklch(0.85 0.12 25);
	}
	.btn-close {
		background: transparent;
		border: none;
		color: inherit;
		font-size: 1.25rem;
		line-height: 1;
		cursor: pointer;
		padding: 0 0.25rem;
	}

	.card {
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.22 0.02 250);
		border-radius: 12px;
		padding: 1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.card.master {
		border-color: oklch(0.4 0.15 145 / 0.5);
		background: oklch(0.16 0.04 145 / 0.2);
	}

	.master-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.card-title {
		font-size: 1rem;
		font-weight: 600;
		color: oklch(0.9 0.02 250);
		margin: 0;
	}

	.card-body {
		font-size: 0.9rem;
		color: oklch(0.7 0.02 250);
		line-height: 1.5;
		margin: 0;
	}

	.section-label {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: oklch(0.55 0.02 250);
		font-weight: 600;
		font-family: ui-monospace, monospace;
		margin: 0;
	}

	.req-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.req {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
		color: oklch(0.65 0.02 250);
	}
	.req.ok { color: oklch(0.8 0.12 145); }
	.req-icon { font-family: ui-monospace, monospace; }
	.req-name { font-weight: 500; color: oklch(0.85 0.02 250); }
	.req-tag {
		font-size: 0.7rem;
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		background: oklch(0.2 0.02 250);
		color: oklch(0.6 0.02 250);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.req-reason { color: oklch(0.55 0.02 250); }
	.req-hint {
		flex-basis: 100%;
		font-size: 0.78rem;
		color: oklch(0.55 0.02 250);
		font-family: ui-monospace, monospace;
		margin-left: 1.5rem;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 0.9rem;
		font-size: 0.85rem;
		font-weight: 500;
		border-radius: 6px;
		border: 1px solid transparent;
		cursor: pointer;
		font-family: ui-monospace, monospace;
		transition: all 0.15s ease;
	}
	.btn-sm { padding: 0.35rem 0.65rem; font-size: 0.8rem; }
	.btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-primary {
		background: oklch(0.32 0.18 220);
		color: oklch(0.95 0.02 250);
		border-color: oklch(0.45 0.18 220);
	}
	.btn-primary:hover:not(:disabled) { background: oklch(0.4 0.2 220); }
	.btn-ghost {
		background: oklch(0.18 0.02 250);
		color: oklch(0.8 0.02 250);
		border-color: oklch(0.25 0.02 250);
	}
	.btn-ghost:hover:not(:disabled) { background: oklch(0.22 0.02 250); }
	.btn-danger {
		background: oklch(0.3 0.15 25);
		color: oklch(0.95 0.05 25);
		border-color: oklch(0.45 0.18 25);
	}
	.btn-danger:hover:not(:disabled) { background: oklch(0.38 0.18 25); }

	.muted { color: oklch(0.55 0.02 250); margin: 0; }
	.small { font-size: 0.8rem; }

	.nuke-footer {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.25rem 0;
		border-top: 1px solid oklch(0.2 0.02 250);
	}
	.link-danger {
		background: none;
		border: none;
		color: oklch(0.55 0.12 25);
		font-size: 0.78rem;
		cursor: pointer;
		text-decoration: underline;
		padding: 0;
		font-family: ui-monospace, monospace;
	}
	.link-danger:hover { color: oklch(0.7 0.18 25); }

	.select, .input {
		background: oklch(0.16 0.02 250);
		border: 1px solid oklch(0.25 0.02 250);
		color: oklch(0.85 0.02 250);
		padding: 0.45rem 0.6rem;
		border-radius: 6px;
		font-family: ui-monospace, monospace;
		font-size: 0.85rem;
		min-width: 200px;
	}
	.select:focus, .input:focus {
		outline: none;
		border-color: oklch(0.5 0.15 220);
	}

	.hotkey-row { display: flex; align-items: center; gap: 0.75rem; }
	.kbd {
		display: inline-flex;
		align-items: center;
		padding: 0.3rem 0.6rem;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.3 0.02 250);
		border-bottom-width: 2px;
		border-radius: 4px;
		font-family: ui-monospace, monospace;
		font-size: 0.85rem;
		color: oklch(0.85 0.02 250);
	}
	.link-sub {
		font-size: 0.8rem;
		color: oklch(0.6 0.12 220);
		text-decoration: none;
	}
	.link-sub:hover { text-decoration: underline; }

	.radios { display: flex; flex-direction: column; gap: 0.5rem; }
	.radio-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.7rem;
		background: oklch(0.16 0.02 250);
		border: 1px solid oklch(0.22 0.02 250);
		border-radius: 6px;
		font-size: 0.85rem;
		cursor: pointer;
	}
	.radio-row:has(input:checked) {
		border-color: oklch(0.45 0.18 220);
		background: oklch(0.18 0.05 220);
	}
	.radio-row.disabled { opacity: 0.5; cursor: not-allowed; }
	.radio-row input[type='radio'] { accent-color: oklch(0.55 0.18 220); }
	.radio-name { font-weight: 500; color: oklch(0.85 0.02 250); }

	.badge {
		font-size: 0.7rem;
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		background: oklch(0.2 0.02 250);
		color: oklch(0.7 0.02 250);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-family: ui-monospace, monospace;
	}
	.badge.cloud {
		background: oklch(0.25 0.1 60 / 0.5);
		color: oklch(0.85 0.12 60);
	}

	.nudge {
		flex-basis: 100%;
		margin-top: 0.3rem;
		padding: 0.4rem 0.6rem;
		background: oklch(0.2 0.06 60 / 0.4);
		border-left: 2px solid oklch(0.55 0.15 60);
		border-radius: 4px;
		font-size: 0.8rem;
		color: oklch(0.8 0.1 60);
	}

	.toggle-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
		font-size: 0.9rem;
		color: oklch(0.85 0.02 250);
		cursor: pointer;
	}
	.toggle-row input[type='checkbox'] {
		accent-color: oklch(0.55 0.18 145);
		width: 18px;
		height: 18px;
	}
	.toggle-label { font-weight: 500; }

	.accordion summary {
		font-size: 0.85rem;
		font-weight: 500;
		color: oklch(0.7 0.02 250);
		cursor: pointer;
		padding: 0.3rem 0;
	}
	.accordion[open] summary { color: oklch(0.85 0.02 250); }
	.accordion p { margin-top: 0.5rem; }

	.diag-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
	}
	.diag-result {
		font-family: ui-monospace, monospace;
		font-size: 0.8rem;
	}
	.diag-result.ok { color: oklch(0.8 0.12 145); }
	.diag-result.err { color: oklch(0.75 0.15 25); }
	.diag-json {
		background: oklch(0.1 0.01 250);
		border: 1px solid oklch(0.2 0.02 250);
		border-radius: 6px;
		padding: 0.6rem;
		font-size: 0.8rem;
		color: oklch(0.85 0.02 250);
		overflow-x: auto;
		margin: 0;
	}

	.advanced-grid {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-top: 0.5rem;
	}
	.advanced-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem 0.6rem;
		background: oklch(0.16 0.02 250);
		border: 1px solid oklch(0.22 0.02 250);
		border-radius: 6px;
	}
	.advanced-name {
		font-family: ui-monospace, monospace;
		font-size: 0.85rem;
		font-weight: 600;
		color: oklch(0.8 0.02 250);
		min-width: 80px;
	}
	.advanced-field {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.advanced-field .input { min-width: 140px; }
</style>
