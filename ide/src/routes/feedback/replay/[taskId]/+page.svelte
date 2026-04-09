<script lang="ts">
	import { onMount } from 'svelte';

	// Extract taskId from URL — populated in onMount since window isn't available at module init
	let taskId = $state('');

	type TimelineEvent = {
		type: 'console' | 'network';
		offset: number;
		pct: number;
		color: string;
		label: string;
		detail: string;
	};

	let containerEl = $state<HTMLElement | undefined>();
	let replayer = $state<any>(null);
	let events = $state<unknown[]>([]);
	let loading = $state(true);
	let error = $state('');
	let playing = $state(false);
	let currentTime = $state(0);
	let totalDuration = $state(0);
	let speed = $state(1);
	let selectedEvent = $state<TimelineEvent | null>(null);
	let animFrame = $state<number>(0);
	let recordingStartTime = $state(0);
	let consoleLogs = $state<unknown[] | null>(null);
	let networkRequests = $state<unknown[] | null>(null);
	let reportTitle = $state('');
	let pageUrl = $state('');

	function loadScript(src: string): Promise<void> {
		return new Promise((resolve, reject) => {
			if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
			const s = document.createElement('script');
			s.src = src;
			s.onload = () => resolve();
			s.onerror = () => reject(new Error(`Failed to load ${src}`));
			document.head.appendChild(s);
		});
	}

	onMount(async () => {
		try {
			taskId = window.location.pathname.split('/').pop() ?? '';
			// Inject CSS
			if (!document.querySelector('#rrweb-css')) {
				const link = document.createElement('link');
				link.id = 'rrweb-css';
				link.rel = 'stylesheet';
				link.href = '/rrweb-replay.min.css';
				document.head.appendChild(link);
			}
			// Load rrweb replay bundle — exposes window.rrwebReplay
			await loadScript('/rrweb-replay.min.js');
			await fetchReport();
		} catch (err: unknown) {
			error = err instanceof Error ? err.message : String(err) || 'Failed to initialize replay';
			loading = false;
		}
	});

	async function fetchReport() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/feedback/reports');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			const report = (data.reports || []).find((r: any) => r.id === taskId);
			if (!report) {
				error = `Report ${taskId} not found`;
				loading = false;
				return;
			}
			reportTitle = report.title || taskId;
			pageUrl = report.page_url || '';
			consoleLogs = report.console_logs || null;
			networkRequests = report.network_requests || null;

			const recordingUrl = report.recording_url;
			if (!recordingUrl) {
				error = 'No recording available for this report';
				loading = false;
				return;
			}

			const recRes = await fetch(recordingUrl);
			if (!recRes.ok) throw new Error(`Recording fetch failed: HTTP ${recRes.status}`);
			const recData = await recRes.json();

			if (Array.isArray(recData)) {
				events = recData;
			} else if (recData.events) {
				events = recData.events;
				if (recData.recordingStartTime) recordingStartTime = recData.recordingStartTime;
			}

			if (events.length === 0) {
				error = 'Recording has no events';
				loading = false;
				return;
			}

			loading = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load recording';
			loading = false;
		}
	}

	let timelineEvents = $derived.by(() => {
		if (totalDuration === 0) return [] as TimelineEvent[];
		const items: TimelineEvent[] = [];
		const t0 = recordingStartTime;

		if (consoleLogs) {
			for (const log of consoleLogs as any[]) {
				const offset = (log.timestampMs || 0) - t0;
				if (offset < 0 || offset > totalDuration) continue;
				const color = log.type === 'error' ? '#ef4444' : log.type === 'warn' ? '#f59e0b' : '#3b82f6';
				items.push({
					type: 'console',
					offset,
					pct: (offset / totalDuration) * 100,
					color,
					label: `console.${log.type}`,
					detail: typeof log.message === 'string' ? log.message : JSON.stringify(log.message),
				});
			}
		}

		if (networkRequests) {
			for (const req of networkRequests as any[]) {
				const offset = (req.timestampMs || 0) - t0;
				if (offset < 0 || offset > totalDuration) continue;
				const status = req.status ?? 0;
				const color = req.error ? '#ef4444' : status >= 400 ? '#ef4444' : status >= 200 && status < 300 ? '#10b981' : '#9ca3af';
				const urlShort = req.url ? req.url.replace(/^https?:\/\/[^/]+/, '') : '';
				items.push({
					type: 'network',
					offset,
					pct: (offset / totalDuration) * 100,
					color,
					label: `${req.method || 'GET'} ${status || 'ERR'}`,
					detail: `${req.method || 'GET'} ${urlShort}${req.duration ? ` (${req.duration}ms)` : ''}${req.error ? ` — ${req.error}` : ''}`,
				});
			}
		}

		return items.sort((a, b) => a.offset - b.offset);
	});

	$effect(() => {
		if (!loading && events.length > 0 && containerEl) {
			setTimeout(() => initReplayer(), 100);
		}
	});

	function initReplayer() {
		if (!containerEl || events.length === 0) return;
		if (replayer) { replayer.pause(); replayer = null; }
		containerEl.innerHTML = '';

		const rr = (window as any).rrwebReplay;
		if (!rr?.Replayer) { error = 'rrweb replay library not loaded'; return; }

		const r = new rr.Replayer(events, {
			root: containerEl,
			skipInactive: true,
			showWarning: false,
			showDebug: false,
			blockClass: 'rr-block',
			speed,
		});

		const meta = r.getMetaData();
		totalDuration = meta.totalTime;
		if (!recordingStartTime && meta.startTime) recordingStartTime = meta.startTime;

		r.on('start', () => { playing = true; });
		r.on('pause', () => { playing = false; });
		r.on('resume', () => { playing = true; });
		r.on('finish', () => { playing = false; currentTime = totalDuration; });

		replayer = r;
		// Scale to fit after first paint
		requestAnimationFrame(() => scaleToFit());
		startTimeTracker();
	}

	function scaleToFit() {
		if (!containerEl) return;
		const wrapper = containerEl.querySelector('.replayer-wrapper') as HTMLElement;
		const iframe = containerEl.querySelector('iframe');
		if (!wrapper || !iframe) return;
		const cw = containerEl.clientWidth;
		const ch = containerEl.clientHeight;
		const iw = iframe.width ? parseInt(iframe.width) : iframe.clientWidth || 1280;
		const ih = iframe.height ? parseInt(iframe.height) : iframe.clientHeight || 800;
		const scale = Math.min(cw / iw, ch / ih, 1);
		const offsetX = (cw - iw * scale) / 2;
		const offsetY = (ch - ih * scale) / 2;
		wrapper.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
		wrapper.style.transformOrigin = 'top left';
	}

	function startTimeTracker() {
		cancelAnimationFrame(animFrame);
		function tick() {
			if (replayer && playing) currentTime = replayer.getCurrentTime();
			animFrame = requestAnimationFrame(tick);
		}
		animFrame = requestAnimationFrame(tick);
	}

	function togglePlay() {
		if (!replayer) return;
		if (playing) replayer.pause();
		else if (currentTime >= totalDuration) replayer.play(0);
		else replayer.resume();
	}

	function seekTo(offsetMs: number) {
		if (!replayer) return;
		replayer.pause(offsetMs);
		currentTime = offsetMs;
	}

	function handleTimelineClick(e: MouseEvent) {
		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
		seekTo(pct * totalDuration);
	}

	function setSpeed(s: number) {
		speed = s;
		if (replayer) replayer.setConfig({ speed: s });
	}

	function formatTime(ms: number): string {
		const totalSec = Math.floor(ms / 1000);
		return `${Math.floor(totalSec / 60)}:${(totalSec % 60).toString().padStart(2, '0')}`;
	}
</script>

<svelte:head>
	<title>Replay: {reportTitle || taskId}</title>
</svelte:head>

<div class="replay-page">
	<header class="replay-header">
		<a href="/tasks/{taskId}" class="back-link">← {taskId}</a>
		<div class="replay-meta">
			<span class="replay-title">{reportTitle || taskId}</span>
			{#if pageUrl}
				<a href={pageUrl} target="_blank" rel="noreferrer" class="page-url">{pageUrl}</a>
			{/if}
		</div>
	</header>

	{#if loading}
		<div class="replay-state">
			<div class="spinner"></div>
			<span>Loading recording…</span>
		</div>
	{:else if error}
		<div class="replay-state error">{error}</div>
	{:else}
		<div class="replay-body">
			<!-- Player -->
			<div class="player-container" bind:this={containerEl}></div>

			<!-- Controls -->
			<div class="controls">
				<button class="play-btn" onclick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
					{#if playing}
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
					{:else}
						<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
					{/if}
				</button>
				<span class="time-label">{formatTime(currentTime)}</span>
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_interactive_supports_focus -->
				<div class="scrubber" onclick={handleTimelineClick} role="slider" aria-label="Playback position" aria-valuemin={0} aria-valuemax={totalDuration} aria-valuenow={currentTime}>
					<div class="scrubber-fill" style="width: {totalDuration ? (currentTime / totalDuration) * 100 : 0}%"></div>
					<div class="scrubber-thumb" style="left: {totalDuration ? (currentTime / totalDuration) * 100 : 0}%"></div>
				</div>
				<span class="time-label">{formatTime(totalDuration)}</span>
				<div class="speed-btns">
					{#each [1, 2, 4] as s}
						<button class="speed-btn" class:active={speed === s} onclick={() => setSpeed(s)}>{s}x</button>
					{/each}
				</div>
			</div>

			<!-- Event timeline -->
			{#if timelineEvents.length > 0}
				<div class="event-bar-wrap">
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_interactive_supports_focus -->
					<div class="event-bar" onclick={handleTimelineClick} role="slider" aria-label="Event timeline" aria-valuemin={0} aria-valuemax={totalDuration} aria-valuenow={currentTime}>
						<div class="event-playhead" style="left: {totalDuration ? (currentTime / totalDuration) * 100 : 0}%"></div>
						{#each timelineEvents as evt}
							<button
								class="evt-dot"
								class:selected={selectedEvent === evt}
								style="left: {evt.pct}%; background: {evt.color};"
								onclick={(e) => { e.stopPropagation(); selectedEvent = selectedEvent === evt ? null : evt; seekTo(evt.offset); }}
								title="{evt.label}: {evt.detail}"
								aria-label="{evt.label} at {formatTime(evt.offset)}"
							></button>
						{/each}
					</div>
					<div class="legend">
						<span><span class="dot" style="background:#ef4444"></span>Error</span>
						<span><span class="dot" style="background:#f59e0b"></span>Warn</span>
						<span><span class="dot" style="background:#3b82f6"></span>Log</span>
						<span><span class="dot" style="background:#10b981"></span>2xx</span>
						<span><span class="dot" style="background:#9ca3af"></span>Other</span>
					</div>
				</div>
			{:else}
				<p class="no-events">No console or network events captured in this recording.</p>
			{/if}

			<!-- Selected event detail -->
			{#if selectedEvent}
				<div class="detail-panel">
					<span class="detail-badge" style="background:{selectedEvent.color}20;color:{selectedEvent.color};border:1px solid {selectedEvent.color}40">{selectedEvent.label}</span>
					<span class="detail-time">{formatTime(selectedEvent.offset)}</span>
					<button class="detail-close" onclick={() => selectedEvent = null}>×</button>
					<pre class="detail-body">{selectedEvent.detail}</pre>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	:global(body) { margin: 0; background: #0d1117; color: #e5e7eb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

	.replay-page { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

	.replay-header {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 10px 16px;
		background: #161b22;
		border-bottom: 1px solid #30363d;
		flex-shrink: 0;
	}
	.back-link { color: #58a6ff; text-decoration: none; font-size: 13px; }
	.back-link:hover { text-decoration: underline; }
	.replay-meta { display: flex; flex-direction: column; gap: 2px; }
	.replay-title { font-size: 14px; font-weight: 600; color: #e6edf3; }
	.page-url { font-size: 11px; color: #8b949e; text-decoration: none; }
	.page-url:hover { color: #58a6ff; }

	.replay-state {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		flex: 1;
		color: #8b949e;
		font-size: 14px;
	}
	.replay-state.error { color: #f85149; }
	.spinner {
		width: 18px; height: 18px;
		border: 2px solid #30363d;
		border-top-color: #58a6ff;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}
	@keyframes spin { to { transform: rotate(360deg); } }

	.replay-body { display: flex; flex-direction: column; flex: 1; overflow: hidden; }

	.player-container {
		flex: 1;
		background: #0a0a0a;
		overflow: hidden;
		position: relative;
	}
	.player-container :global(.replayer-wrapper) {
		transform-origin: top left;
	}
	.player-container :global(iframe) { border: none; display: block; }

	.controls {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 14px;
		background: #161b22;
		border-top: 1px solid #30363d;
		flex-shrink: 0;
	}
	.play-btn {
		display: flex; align-items: center; justify-content: center;
		width: 32px; height: 32px;
		background: none; border: 1px solid #30363d; border-radius: 6px;
		color: #e6edf3; cursor: pointer;
	}
	.play-btn:hover { background: #21262d; }
	.time-label { font-size: 12px; color: #8b949e; font-family: 'SF Mono', monospace; min-width: 38px; flex-shrink: 0; }
	.scrubber {
		flex: 1; height: 6px; background: #21262d; border-radius: 3px;
		position: relative; cursor: pointer;
	}
	.scrubber-fill { position: absolute; top: 0; left: 0; height: 100%; background: #58a6ff; border-radius: 3px; pointer-events: none; }
	.scrubber-thumb {
		position: absolute; top: 50%; width: 12px; height: 12px;
		background: #e6edf3; border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none;
	}
	.speed-btns { display: flex; gap: 3px; flex-shrink: 0; }
	.speed-btn {
		padding: 3px 8px; font-size: 11px;
		background: none; border: 1px solid #30363d; border-radius: 4px;
		color: #6e7681; cursor: pointer;
	}
	.speed-btn:hover { color: #e6edf3; }
	.speed-btn.active { background: #58a6ff; border-color: #58a6ff; color: #fff; }

	.event-bar-wrap { padding: 6px 14px 8px; background: #161b22; border-top: 1px solid #30363d; flex-shrink: 0; }
	.event-bar {
		position: relative; height: 24px; background: #0d1117;
		border-radius: 4px; cursor: pointer;
	}
	.event-playhead { position: absolute; top: 0; bottom: 0; width: 1px; background: #e6edf3; opacity: 0.4; pointer-events: none; }
	.evt-dot {
		position: absolute; top: 50%; width: 10px; height: 10px;
		border-radius: 50%; border: none; transform: translate(-50%, -50%);
		cursor: pointer; padding: 0; transition: transform 0.15s;
	}
	.evt-dot:hover, .evt-dot.selected { transform: translate(-50%, -50%) scale(1.7); z-index: 1; }
	.legend { display: flex; gap: 12px; margin-top: 5px; }
	.legend span { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #6e7681; }
	.dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; }

	.no-events { text-align: center; font-size: 12px; color: #6e7681; padding: 8px; margin: 0; background: #161b22; border-top: 1px solid #30363d; }

	.detail-panel {
		padding: 10px 14px;
		background: #161b22;
		border-top: 1px solid #30363d;
		display: flex;
		align-items: flex-start;
		gap: 8px;
		flex-wrap: wrap;
		flex-shrink: 0;
	}
	.detail-badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-family: monospace; flex-shrink: 0; }
	.detail-time { font-size: 11px; color: #6e7681; font-family: monospace; flex-shrink: 0; align-self: center; }
	.detail-close { margin-left: auto; background: none; border: none; color: #6e7681; font-size: 18px; cursor: pointer; padding: 0 4px; }
	.detail-close:hover { color: #e6edf3; }
	.detail-body {
		width: 100%; margin: 4px 0 0; padding: 8px 10px;
		background: #0d1117; border-radius: 4px;
		font-size: 12px; color: #d2a8ff; font-family: 'SF Mono', monospace;
		white-space: pre-wrap; word-break: break-all;
		max-height: 120px; overflow-y: auto;
	}
</style>
