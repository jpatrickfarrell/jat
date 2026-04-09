<script lang="ts">
  import { Replayer, ReplayerEvents } from 'rrweb';
  import 'rrweb/dist/replay/rrweb-replay.min.css';
  import type { ConsoleLogEntry, NetworkRequestEntry } from '../lib/types';

  let {
    recordingUrl,
    endpoint,
    consoleLogs = null,
    networkRequests = null,
  }: {
    recordingUrl: string;
    endpoint: string;
    consoleLogs?: ConsoleLogEntry[] | null;
    networkRequests?: NetworkRequestEntry[] | null;
  } = $props();

  type TimelineEvent = {
    type: 'console' | 'network';
    timestampMs: number;
    offset: number; // ms from recording start
    pct: number; // 0-100 position on timeline
    color: string;
    label: string;
    detail: string;
  };

  let containerEl = $state<HTMLElement | undefined>();
  let replayer = $state<Replayer | null>(null);
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

  // Fetch recording events from URL
  async function fetchRecording() {
    loading = true;
    error = '';
    try {
      const url = recordingUrl.startsWith('http')
        ? recordingUrl
        : `${endpoint.replace(/\/$/, '')}${recordingUrl}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // data could be { events: [...], recordingStartTime: N } or just [...]
      if (Array.isArray(data)) {
        events = data;
      } else if (data.events) {
        events = data.events;
        if (data.recordingStartTime) recordingStartTime = data.recordingStartTime;
      }
      if (events.length === 0) {
        error = 'No recording events found';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load recording';
    } finally {
      loading = false;
    }
  }

  // Build timeline events from console logs + network requests
  let timelineEvents = $derived.by(() => {
    if (totalDuration === 0) return [];
    const items: TimelineEvent[] = [];
    const t0 = recordingStartTime;

    if (consoleLogs) {
      for (const log of consoleLogs) {
        const offset = log.timestampMs - t0;
        if (offset < 0 || offset > totalDuration) continue;
        const color = log.type === 'error' ? '#ef4444'
          : log.type === 'warn' ? '#f59e0b'
          : '#3b82f6';
        items.push({
          type: 'console',
          timestampMs: log.timestampMs,
          offset,
          pct: (offset / totalDuration) * 100,
          color,
          label: `console.${log.type}`,
          detail: log.message.length > 200 ? log.message.slice(0, 200) + '...' : log.message,
        });
      }
    }

    if (networkRequests) {
      for (const req of networkRequests) {
        const offset = req.timestampMs - t0;
        if (offset < 0 || offset > totalDuration) continue;
        const status = req.status ?? 0;
        const color = req.error ? '#ef4444'
          : status >= 400 ? '#ef4444'
          : status >= 200 && status < 300 ? '#10b981'
          : '#9ca3af';
        const urlShort = req.url.replace(/^https?:\/\/[^/]+/, '');
        items.push({
          type: 'network',
          timestampMs: req.timestampMs,
          offset,
          pct: (offset / totalDuration) * 100,
          color,
          label: `${req.method} ${status || 'ERR'}`,
          detail: `${req.method} ${urlShort}${req.duration ? ` (${req.duration}ms)` : ''}${req.error ? ` — ${req.error}` : ''}`,
        });
      }
    }

    items.sort((a, b) => a.offset - b.offset);
    return items;
  });

  function initReplayer() {
    if (!containerEl || events.length === 0) return;

    // Clear previous
    if (replayer) {
      replayer.pause();
      replayer = null;
    }
    containerEl.innerHTML = '';

    const r = new Replayer(events as any, {
      root: containerEl,
      skipInactive: true,
      showWarning: false,
      showDebug: false,
      blockClass: 'rr-block',
      speed,
    });

    // Get metadata
    const meta = r.getMetaData();
    totalDuration = meta.totalTime;
    if (!recordingStartTime && meta.startTime) {
      recordingStartTime = meta.startTime;
    }

    // Scale replay to fit container width
    scaleReplay();

    r.on(ReplayerEvents.Start, () => { playing = true; });
    r.on(ReplayerEvents.Pause, () => { playing = false; });
    r.on(ReplayerEvents.Resume, () => { playing = true; });
    r.on(ReplayerEvents.Finish, () => {
      playing = false;
      currentTime = totalDuration;
    });

    replayer = r;
    startTimeTracker();
  }

  function startTimeTracker() {
    cancelAnimationFrame(animFrame);
    function tick() {
      if (replayer && playing) {
        currentTime = replayer.getCurrentTime();
      }
      animFrame = requestAnimationFrame(tick);
    }
    animFrame = requestAnimationFrame(tick);
  }

  function scaleReplay() {
    if (!containerEl) return;
    const wrapper = containerEl.querySelector('.replayer-wrapper') as HTMLElement;
    const iframe = containerEl.querySelector('iframe');
    if (!wrapper || !iframe) return;
    const containerWidth = containerEl.clientWidth;
    const iframeWidth = iframe.width ? parseInt(iframe.width) : iframe.clientWidth || 1024;
    const iframeHeight = iframe.height ? parseInt(iframe.height) : iframe.clientHeight || 768;
    if (iframeWidth > containerWidth) {
      const scale = containerWidth / iframeWidth;
      wrapper.style.transform = `scale(${scale})`;
      wrapper.style.transformOrigin = 'top left';
      containerEl.style.height = `${Math.min(300, iframeHeight * scale)}px`;
    }
  }

  function togglePlay() {
    if (!replayer) return;
    if (playing) {
      replayer.pause();
    } else if (currentTime >= totalDuration) {
      replayer.play(0);
    } else {
      replayer.resume();
    }
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

  function selectEvent(evt: TimelineEvent) {
    selectedEvent = selectedEvent === evt ? null : evt;
    seekTo(evt.offset);
  }

  function setSpeed(s: number) {
    speed = s;
    if (replayer) {
      replayer.setConfig({ speed: s });
    }
  }

  function formatTime(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  // Lifecycle
  $effect(() => {
    fetchRecording();
    return () => {
      cancelAnimationFrame(animFrame);
      if (replayer) replayer.pause();
    };
  });

  $effect(() => {
    if (!loading && events.length > 0 && containerEl) {
      // Small delay to ensure DOM is ready
      setTimeout(() => initReplayer(), 50);
    }
  });
</script>

<div class="timeline-viewer">
  {#if loading}
    <div class="tv-loading">
      <span class="tv-spinner"></span>
      <span>Loading recording...</span>
    </div>
  {:else if error}
    <div class="tv-error">{error}</div>
  {:else}
    <!-- Replay container -->
    <div class="tv-player" bind:this={containerEl}></div>

    <!-- Controls bar -->
    <div class="tv-controls">
      <button class="tv-play-btn" onclick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
        {#if playing}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        {:else}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
        {/if}
      </button>

      <span class="tv-time">{formatTime(currentTime)}</span>

      <!-- Scrubber -->
      <div class="tv-scrubber" onclick={handleTimelineClick} onkeydown={(e) => { if (e.key === 'ArrowRight') seekTo(Math.min(totalDuration, currentTime + 5000)); else if (e.key === 'ArrowLeft') seekTo(Math.max(0, currentTime - 5000)); }} role="slider" tabindex="0" aria-label="Playback position" aria-valuemin={0} aria-valuemax={totalDuration} aria-valuenow={currentTime}>
        <div class="tv-scrubber-fill" style="width: {totalDuration ? (currentTime / totalDuration) * 100 : 0}%"></div>
        <div class="tv-scrubber-thumb" style="left: {totalDuration ? (currentTime / totalDuration) * 100 : 0}%"></div>
      </div>

      <span class="tv-time">{formatTime(totalDuration)}</span>

      <!-- Speed -->
      <div class="tv-speed">
        {#each [1, 2, 4] as s}
          <button class="tv-speed-btn" class:active={speed === s} onclick={() => setSpeed(s)}>{s}x</button>
        {/each}
      </div>
    </div>

    <!-- Event timeline -->
    {#if timelineEvents.length > 0}
      <div class="tv-event-timeline">
        <div class="tv-event-bar" onclick={handleTimelineClick} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTimelineClick(e as any); }} role="slider" tabindex="0" aria-label="Event timeline" aria-valuemin={0} aria-valuemax={totalDuration} aria-valuenow={currentTime}>
          <!-- Playhead -->
          <div class="tv-event-playhead" style="left: {totalDuration ? (currentTime / totalDuration) * 100 : 0}%"></div>
          <!-- Event dots -->
          {#each timelineEvents as evt, i}
            <button
              class="tv-dot"
              class:selected={selectedEvent === evt}
              style="left: {evt.pct}%; background: {evt.color};"
              onclick={(e) => { e.stopPropagation(); selectEvent(evt); }}
              title="{evt.label}: {evt.detail}"
              aria-label="{evt.label} at {formatTime(evt.offset)}"
            ></button>
          {/each}
        </div>
        <!-- Legend -->
        <div class="tv-legend">
          <span class="tv-legend-item"><span class="tv-legend-dot" style="background:#ef4444"></span>Error</span>
          <span class="tv-legend-item"><span class="tv-legend-dot" style="background:#f59e0b"></span>Warn</span>
          <span class="tv-legend-item"><span class="tv-legend-dot" style="background:#3b82f6"></span>Log</span>
          <span class="tv-legend-item"><span class="tv-legend-dot" style="background:#10b981"></span>2xx</span>
          <span class="tv-legend-item"><span class="tv-legend-dot" style="background:#9ca3af"></span>Other</span>
        </div>
      </div>
    {/if}

    <!-- Selected event detail panel -->
    {#if selectedEvent}
      <div class="tv-detail-panel">
        <div class="tv-detail-header">
          <span class="tv-detail-badge" style="background: {selectedEvent.color}20; color: {selectedEvent.color}; border-color: {selectedEvent.color}40;">
            {selectedEvent.label}
          </span>
          <span class="tv-detail-time">{formatTime(selectedEvent.offset)}</span>
          <button class="tv-detail-close" onclick={() => selectedEvent = null} aria-label="Close">&times;</button>
        </div>
        <pre class="tv-detail-body">{selectedEvent.detail}</pre>
      </div>
    {/if}
  {/if}
</div>

<style>
  .timeline-viewer {
    margin-top: 8px;
    border: 1px solid #374151;
    border-radius: 8px;
    overflow: hidden;
    background: #111827;
  }

  /* Loading / Error */
  .tv-loading {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    color: #9ca3af;
    font-size: 12px;
  }
  .tv-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid #374151;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: tv-spin 0.6s linear infinite;
  }
  @keyframes tv-spin {
    to { transform: rotate(360deg); }
  }
  .tv-error {
    padding: 16px;
    color: #ef4444;
    font-size: 12px;
  }

  /* Player container */
  .tv-player {
    position: relative;
    background: #0a0a0a;
    overflow: hidden;
    max-height: 300px;
  }
  .tv-player :global(.replayer-wrapper) {
    position: relative !important;
    transform-origin: top left;
  }
  .tv-player :global(iframe) {
    border: none;
    max-width: 100%;
    max-height: 300px;
  }

  /* Controls */
  .tv-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: #1f2937;
    border-top: 1px solid #374151;
  }
  .tv-play-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: none;
    border: 1px solid #4b5563;
    border-radius: 4px;
    color: #e5e7eb;
    cursor: pointer;
    flex-shrink: 0;
  }
  .tv-play-btn:hover { background: #374151; }
  .tv-time {
    font-size: 11px;
    color: #9ca3af;
    font-family: 'SF Mono', 'Fira Code', monospace;
    flex-shrink: 0;
    min-width: 32px;
  }

  /* Scrubber */
  .tv-scrubber {
    flex: 1;
    height: 6px;
    background: #374151;
    border-radius: 3px;
    position: relative;
    cursor: pointer;
  }
  .tv-scrubber-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: #3b82f6;
    border-radius: 3px;
    pointer-events: none;
  }
  .tv-scrubber-thumb {
    position: absolute;
    top: 50%;
    width: 10px;
    height: 10px;
    background: #e5e7eb;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  /* Speed */
  .tv-speed {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
  }
  .tv-speed-btn {
    padding: 2px 6px;
    font-size: 10px;
    background: none;
    border: 1px solid #374151;
    border-radius: 3px;
    color: #6b7280;
    cursor: pointer;
  }
  .tv-speed-btn:hover { color: #e5e7eb; }
  .tv-speed-btn.active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: #fff;
  }

  /* Event timeline bar */
  .tv-event-timeline {
    padding: 4px 10px 6px;
    background: #1f2937;
    border-top: 1px solid #374151;
  }
  .tv-event-bar {
    position: relative;
    height: 20px;
    background: #111827;
    border-radius: 4px;
    cursor: pointer;
  }
  .tv-event-playhead {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: #e5e7eb;
    opacity: 0.5;
    pointer-events: none;
  }
  .tv-dot {
    position: absolute;
    top: 50%;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: none;
    transform: translate(-50%, -50%);
    cursor: pointer;
    padding: 0;
    transition: transform 0.15s;
  }
  .tv-dot:hover, .tv-dot.selected {
    transform: translate(-50%, -50%) scale(1.6);
    z-index: 1;
  }

  /* Legend */
  .tv-legend {
    display: flex;
    gap: 10px;
    margin-top: 4px;
    justify-content: center;
  }
  .tv-legend-item {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 9px;
    color: #6b7280;
  }
  .tv-legend-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
  }

  /* Detail panel */
  .tv-detail-panel {
    padding: 8px 10px;
    background: #1a1a2e;
    border-top: 1px solid #374151;
  }
  .tv-detail-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  .tv-detail-badge {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 3px;
    border: 1px solid;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }
  .tv-detail-time {
    font-size: 10px;
    color: #6b7280;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }
  .tv-detail-close {
    margin-left: auto;
    background: none;
    border: none;
    color: #6b7280;
    font-size: 16px;
    cursor: pointer;
    padding: 0 4px;
  }
  .tv-detail-close:hover { color: #e5e7eb; }
  .tv-detail-body {
    margin: 0;
    padding: 6px 8px;
    background: #111827;
    border-radius: 4px;
    font-size: 11px;
    color: #d1d5db;
    font-family: 'SF Mono', 'Fira Code', monospace;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 100px;
    overflow-y: auto;
  }
</style>
