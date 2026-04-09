<script>
  import { onMount, onDestroy } from 'svelte'

  let statusEl
  let bodyEl
  let playerEl
  let scrubberEl
  let eventBarEl
  let detailPanelEl
  let playBtn
  let playIcon
  let pauseIcon
  let currentTimeEl
  let totalTimeEl
  let scrubberFill
  let scrubberThumb
  let eventPlayhead
  let eventBarWrap
  let legend
  let detailBadge
  let detailTime
  let detailBody

  let replayer = null
  let totalDuration = 0
  let currentTime = 0
  let playing = false
  let speed = 1
  let recordingStartTime = 0
  let consoleLogs = []
  let networkRequests = []
  let animFrame = null

  function fmt(ms) {
    const s = Math.floor(ms / 1000)
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  }

  function setStatus(msg, isError) {
    if (!statusEl) return
    statusEl.style.display = 'flex'
    statusEl.className = isError ? 'error' : ''
    statusEl.innerHTML = isError
      ? `<span>${msg}</span>`
      : `<div class="spinner"></div><span>${msg}</span>`
  }

  function showPlayer() {
    if (statusEl) statusEl.style.display = 'none'
    if (bodyEl) bodyEl.style.display = 'flex'
  }

  function updateScrubber() {
    const pct = totalDuration ? (currentTime / totalDuration) * 100 : 0
    if (scrubberFill) scrubberFill.style.width = pct + '%'
    if (scrubberThumb) scrubberThumb.style.left = pct + '%'
    if (eventPlayhead) eventPlayhead.style.left = pct + '%'
    if (currentTimeEl) currentTimeEl.textContent = fmt(currentTime)
  }

  function tick() {
    if (replayer && playing) {
      currentTime = replayer.getCurrentTime()
      updateScrubber()
    }
    animFrame = requestAnimationFrame(tick)
  }

  function scaleToFit() {
    if (!playerEl) return
    const wrapper = playerEl.querySelector('.replayer-wrapper')
    const iframe = playerEl.querySelector('iframe')
    if (!wrapper || !iframe) return
    const cw = playerEl.clientWidth, ch = playerEl.clientHeight
    const iw = parseInt(iframe.width) || iframe.clientWidth || 1280
    const ih = parseInt(iframe.height) || iframe.clientHeight || 800
    const scale = Math.min(cw / iw, ch / ih, 1)
    const ox = (cw - iw * scale) / 2, oy = (ch - ih * scale) / 2
    wrapper.style.transform = `translate(${ox}px,${oy}px) scale(${scale})`
    wrapper.style.transformOrigin = 'top left'
  }

  function buildTimeline() {
    if (!consoleLogs.length && !networkRequests.length) return
    if (!eventBarEl) return
    if (eventBarWrap) eventBarWrap.style.display = 'block'
    const t0 = recordingStartTime

    const items = []
    for (const log of consoleLogs) {
      const offset = (log.timestampMs || 0) - t0
      if (offset < 0 || offset > totalDuration) continue
      const color = log.type === 'error' ? '#ef4444' : log.type === 'warn' ? '#f59e0b' : '#3b82f6'
      items.push({ offset, pct: (offset / totalDuration) * 100, color, label: `console.${log.type}`, detail: String(log.message || '').slice(0, 500) })
    }
    for (const req of networkRequests) {
      const offset = (req.timestampMs || 0) - t0
      if (offset < 0 || offset > totalDuration) continue
      const s = req.status || 0
      const color = req.error ? '#ef4444' : s >= 400 ? '#ef4444' : s >= 200 && s < 300 ? '#10b981' : '#9ca3af'
      const urlShort = (req.url || '').replace(/^https?:\/\/[^/]+/, '')
      items.push({ offset, pct: (offset / totalDuration) * 100, color, label: `${req.method || 'GET'} ${s || 'ERR'}`, detail: `${req.method || 'GET'} ${urlShort}${req.duration ? ` (${req.duration}ms)` : ''}${req.error ? ` — ${req.error}` : ''}` })
    }

    for (const item of items) {
      const btn = document.createElement('button')
      btn.className = 'evt-dot'
      btn.style.cssText = `left:${item.pct}%;background:${item.color}`
      btn.title = `${item.label}: ${item.detail}`
      btn.onclick = (e) => {
        e.stopPropagation()
        showDetail(item)
        replayer?.pause(item.offset)
        currentTime = item.offset
        updateScrubber()
      }
      eventBarEl.appendChild(btn)
    }
  }

  function showDetail(item) {
    if (!detailPanelEl) return
    detailPanelEl.style.display = 'block'
    if (detailBadge) {
      detailBadge.textContent = item.label
      detailBadge.style.cssText = `background:${item.color}20;color:${item.color};border:1px solid ${item.color}40`
    }
    if (detailTime) detailTime.textContent = fmt(item.offset)
    if (detailBody) detailBody.textContent = item.detail
  }

  function handleDetailClose() {
    if (detailPanelEl) detailPanelEl.style.display = 'none'
  }

  function handlePlayPause() {
    if (!replayer) return
    if (playing) {
      replayer.pause()
    } else {
      replayer.play(currentTime)
    }
  }

  function handleScrubberClick(e) {
    if (!replayer || !scrubberEl) return
    const rect = scrubberEl.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    replayer.pause(pct * totalDuration)
    currentTime = pct * totalDuration
    updateScrubber()
  }

  function handleEventBarClick(e) {
    if (e.target.classList.contains('evt-dot')) return
    if (!replayer || !eventBarEl) return
    const rect = eventBarEl.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    replayer.pause(pct * totalDuration)
    currentTime = pct * totalDuration
    updateScrubber()
  }

  function handleSpeedClick(e) {
    const btn = e.currentTarget
    speed = parseFloat(btn.dataset.speed)
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    replayer?.setConfig({ speed })
  }

  async function init() {
    const taskId = new URLSearchParams(location.search).get('id') || location.pathname.split('/').pop()
    const apiBase = location.origin

    const res = await fetch(`${apiBase}/api/feedback/reports`)
    if (!res.ok) throw new Error(`Reports API: HTTP ${res.status}`)
    const data = await res.json()
    const report = (data.reports || []).find(r => r.id === taskId)
    if (!report) throw new Error(`Report ${taskId} not found`)

    document.title = `Replay: ${report.title || taskId}`
    const reportTitleEl = document.getElementById('report-title')
    if (reportTitleEl) reportTitleEl.textContent = report.title || taskId
    if (report.page_url) {
      const u = document.getElementById('page-url')
      if (u) {
        u.href = report.page_url
        u.textContent = report.page_url
        u.style.display = ''
      }
    }
    consoleLogs = report.console_logs || []
    networkRequests = report.network_requests || []

    const recordingUrl = report.recording_url
    if (!recordingUrl) throw new Error('No recording available for this report')

    setStatus('Loading recording…')
    const recRes = await fetch(recordingUrl.startsWith('http') ? recordingUrl : `${apiBase}${recordingUrl}`)
    if (!recRes.ok) throw new Error(`Recording fetch: HTTP ${recRes.status}`)
    const recData = await recRes.json()

    const events = Array.isArray(recData) ? recData : recData.events || []
    if (!events.length) throw new Error('Recording has no events')
    if (recData.recordingStartTime) recordingStartTime = recData.recordingStartTime

    showPlayer()

    const R = window.rrwebReplay
    if (!R?.Replayer) throw new Error('rrweb Replayer not available')

    replayer = new R.Replayer(events, {
      root: playerEl,
      skipInactive: true,
      showWarning: false,
      showDebug: false,
      speed,
    })

    const meta = replayer.getMetaData()
    totalDuration = meta.totalTime
    if (!recordingStartTime && meta.startTime) recordingStartTime = meta.startTime
    if (totalTimeEl) totalTimeEl.textContent = fmt(totalDuration)

    function setPlaying(v) {
      playing = v
      if (playIcon) playIcon.style.display = v ? 'none' : ''
      if (pauseIcon) pauseIcon.style.display = v ? '' : 'none'
    }
    replayer.on('start', () => setPlaying(true))
    replayer.on('play', () => setPlaying(true))
    replayer.on('pause', () => setPlaying(false))
    replayer.on('finish', () => { setPlaying(false); currentTime = totalDuration; updateScrubber() })

    requestAnimationFrame(() => requestAnimationFrame(scaleToFit))
    setTimeout(scaleToFit, 50)
    setTimeout(scaleToFit, 200)

    window.addEventListener('resize', scaleToFit)

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(scaleToFit).observe(playerEl)
    }

    buildTimeline()
    animFrame = requestAnimationFrame(tick)
  }

  onMount(() => {
    // Dynamically load rrweb CSS and JS, then init
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/feedback/rrweb-replay.min.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = '/feedback/rrweb-replay.min.js'
    script.onload = () => {
      init().catch(err => {
        console.error('[replay]', err)
        setStatus(err?.message || String(err) || 'Failed to load replay', true)
      })
    }
    script.onerror = () => setStatus('Failed to load rrweb player', true)
    document.head.appendChild(script)
  })

  onDestroy(() => {
    if (animFrame) cancelAnimationFrame(animFrame)
  })
</script>

<div id="header">
  <!-- svelte-ignore a11y_invalid_attribute -->
  <a id="back-link" href="#" onclick={() => { history.back() }}>← Back</a>
  <div class="meta">
    <span id="report-title">Loading…</span>
    <a id="page-url" href="#" target="_blank" rel="noreferrer" style="display:none"></a>
  </div>
</div>

<div id="status" bind:this={statusEl}>
  <div class="spinner"></div>
  <span>Loading recording…</span>
</div>

<div id="body" bind:this={bodyEl} style="display:none">
  <div id="player" bind:this={playerEl}></div>
  <div id="controls">
    <button id="play-btn" bind:this={playBtn} title="Play/Pause" onclick={handlePlayPause}>
      <svg bind:this={playIcon} id="play-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
      <svg bind:this={pauseIcon} id="pause-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display:none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
    </button>
    <span bind:this={currentTimeEl} id="current-time" class="time">0:00</span>
    <div id="scrubber" bind:this={scrubberEl} onclick={handleScrubberClick}>
      <div id="scrubber-fill" bind:this={scrubberFill}></div>
      <div id="scrubber-thumb" bind:this={scrubberThumb}></div>
    </div>
    <span bind:this={totalTimeEl} id="total-time" class="time">0:00</span>
    <div class="speed-btns">
      <button class="speed-btn active" data-speed="1" onclick={handleSpeedClick}>1x</button>
      <button class="speed-btn" data-speed="2" onclick={handleSpeedClick}>2x</button>
      <button class="speed-btn" data-speed="4" onclick={handleSpeedClick}>4x</button>
    </div>
  </div>
  <div id="event-bar-wrap" bind:this={eventBarWrap}>
    <div id="event-bar" bind:this={eventBarEl} onclick={handleEventBarClick}>
      <div id="event-playhead" bind:this={eventPlayhead}></div>
    </div>
    <div id="legend" bind:this={legend}>
      <span class="legend-item"><span class="legend-dot" style="background:#ef4444"></span>Error</span>
      <span class="legend-item"><span class="legend-dot" style="background:#f59e0b"></span>Warn</span>
      <span class="legend-item"><span class="legend-dot" style="background:#3b82f6"></span>Log</span>
      <span class="legend-item"><span class="legend-dot" style="background:#10b981"></span>2xx</span>
      <span class="legend-item"><span class="legend-dot" style="background:#9ca3af"></span>Other</span>
    </div>
  </div>
  <div id="detail-panel" bind:this={detailPanelEl}>
    <div id="detail-header">
      <span bind:this={detailBadge} id="detail-badge" class="detail-badge"></span>
      <span bind:this={detailTime} id="detail-time" class="detail-time"></span>
      <button id="detail-close" onclick={handleDetailClose}>×</button>
    </div>
    <pre bind:this={detailBody} id="detail-body"></pre>
  </div>
</div>

<style>
  :global(body) {
    background: #0d1117;
    color: #e5e7eb;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(*, *::before, *::after) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  #header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    background: #161b22;
    border-bottom: 1px solid #30363d;
    flex-shrink: 0;
  }

  :global(#back-link) {
    color: #58a6ff;
    text-decoration: none;
    font-size: 13px;
  }

  :global(#back-link:hover) {
    text-decoration: underline;
  }

  :global(#report-title) {
    font-size: 14px;
    font-weight: 600;
    color: #e6edf3;
  }

  :global(#page-url) {
    font-size: 11px;
    color: #8b949e;
    text-decoration: none;
  }

  :global(#page-url:hover) {
    color: #58a6ff;
  }

  .meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  #status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    flex: 1;
    color: #8b949e;
    font-size: 14px;
  }

  :global(#status.error) {
    color: #f85149;
  }

  :global(.spinner) {
    width: 18px;
    height: 18px;
    border: 2px solid #30363d;
    border-top-color: #58a6ff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  #body {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
  }

  #player {
    flex: 1;
    background: #0a0a0a;
    overflow: hidden;
    position: relative;
  }

  :global(#player .replayer-wrapper) {
    transform-origin: top left;
  }

  :global(#player iframe) {
    border: none;
    display: block;
  }

  #controls {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 14px;
    background: #161b22;
    border-top: 1px solid #30363d;
    flex-shrink: 0;
  }

  #play-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: none;
    border: 1px solid #30363d;
    border-radius: 6px;
    color: #e6edf3;
    cursor: pointer;
    flex-shrink: 0;
  }

  #play-btn:hover {
    background: #21262d;
  }

  .time {
    font-size: 11px;
    color: #8b949e;
    font-family: monospace;
    min-width: 36px;
    flex-shrink: 0;
  }

  #scrubber {
    flex: 1;
    height: 6px;
    background: #21262d;
    border-radius: 3px;
    position: relative;
    cursor: pointer;
  }

  #scrubber-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: #58a6ff;
    border-radius: 3px;
    pointer-events: none;
  }

  #scrubber-thumb {
    position: absolute;
    top: 50%;
    width: 12px;
    height: 12px;
    background: #e6edf3;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .speed-btns {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
  }

  .speed-btn {
    padding: 2px 7px;
    font-size: 10px;
    background: none;
    border: 1px solid #30363d;
    border-radius: 4px;
    color: #6e7681;
    cursor: pointer;
  }

  .speed-btn:hover {
    color: #e6edf3;
  }

  :global(.speed-btn.active) {
    background: #58a6ff;
    border-color: #58a6ff;
    color: #fff;
  }

  #event-bar-wrap {
    padding: 5px 14px 7px;
    background: #161b22;
    border-top: 1px solid #30363d;
    flex-shrink: 0;
    display: none;
  }

  #event-bar {
    position: relative;
    height: 22px;
    background: #0d1117;
    border-radius: 4px;
    cursor: pointer;
  }

  #event-playhead {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background: #e6edf3;
    opacity: 0.4;
    pointer-events: none;
  }

  :global(.evt-dot) {
    position: absolute;
    top: 50%;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    border: none;
    padding: 0;
    transition: transform 0.1s;
  }

  :global(.evt-dot:hover) {
    transform: translate(-50%, -50%) scale(1.7);
    z-index: 1;
  }

  #legend {
    display: flex;
    gap: 10px;
    margin-top: 4px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: #6e7681;
  }

  .legend-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
  }

  #detail-panel {
    padding: 8px 14px;
    background: #161b22;
    border-top: 1px solid #30363d;
    display: none;
  }

  #detail-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .detail-badge {
    font-size: 10px;
    padding: 1px 7px;
    border-radius: 4px;
    font-family: monospace;
  }

  .detail-time {
    font-size: 10px;
    color: #6e7681;
    font-family: monospace;
  }

  #detail-close {
    margin-left: auto;
    background: none;
    border: none;
    color: #6e7681;
    font-size: 18px;
    cursor: pointer;
  }

  #detail-close:hover {
    color: #e6edf3;
  }

  #detail-body {
    margin: 0;
    padding: 6px 8px;
    background: #0d1117;
    border-radius: 4px;
    font-size: 11px;
    color: #d2a8ff;
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 100px;
    overflow-y: auto;
  }
</style>
