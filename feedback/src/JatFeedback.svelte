<svelte:options customElement="jat-feedback" />

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { WidgetConfig } from './lib/types';
  import { DEFAULT_CONFIG } from './lib/types';
  import { startConsoleCapture, stopConsoleCapture } from './lib/consoleCapture';
  import { isElementPickerActive } from './lib/elementPicker';
  import { isAnnotationEditorOpen } from './lib/annotation';
  import { startRetryLoop, stopRetryLoop } from './lib/queue';
  import FeedbackButton from './components/FeedbackButton.svelte';
  import FeedbackPanel from './components/FeedbackPanel.svelte';

  // Custom element attributes
  let {
    endpoint = '',
    project = '',
    position = 'bottom-right',
    theme = 'dark',
    buttoncolor = '#3b82f6',
    'user-id': userId = '',
    'user-email': userEmail = '',
    'user-name': userName = '',
    'user-role': userRole = '',
    'org-id': orgId = '',
    'org-name': orgName = '',
  }: {
    endpoint: string;
    project: string;
    position: string;
    theme: string;
    buttoncolor: string;
    'user-id': string;
    'user-email': string;
    'user-name': string;
    'user-role': string;
    'org-id': string;
    'org-name': string;
  } = $props();

  let open = $state(false);
  let pickerHidden = $state(false);

  // Drag state
  let isDragging = $state(false);
  let dragOffset = { x: 0, y: 0 };
  let rootEl: HTMLDivElement | undefined = $state();

  const DRAG_THRESHOLD = 5; // px before we consider it a drag

  function startDrag(e: MouseEvent, { onDragEnd }: { onDragEnd?: (didDrag: boolean) => void } = {}) {
    if (!rootEl) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const rect = rootEl.getBoundingClientRect();
    dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    let didDrag = false;

    function onMouseMove(e: MouseEvent) {
      if (!rootEl) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!didDrag && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return;
      didDrag = true;
      isDragging = true;
      e.preventDefault();
      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;
      rootEl.style.top = `${y}px`;
      rootEl.style.left = `${x}px`;
      rootEl.style.bottom = 'auto';
      rootEl.style.right = 'auto';
    }

    function onMouseUp() {
      isDragging = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      onDragEnd?.(didDrag);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function handlePanelDragStart(e: MouseEvent) {
    startDrag(e);
  }

  function handleButtonMouseDown(e: MouseEvent) {
    // Only handle left button
    if (e.button !== 0) return;
    e.preventDefault();
    startDrag(e, {
      onDragEnd(didDrag) {
        if (!didDrag) toggle();
      }
    });
  }

  // Poll element picker state to hide/show panel
  let pickerPollInterval: ReturnType<typeof setInterval> | null = null;

  function startPickerPoll() {
    pickerPollInterval = setInterval(() => {
      const active = isElementPickerActive();
      if (active && !pickerHidden) {
        pickerHidden = true;
      } else if (!active && pickerHidden) {
        pickerHidden = false;
      }
    }, 100);
  }

  let config = $derived<WidgetConfig>({
    ...DEFAULT_CONFIG,
    endpoint: endpoint || DEFAULT_CONFIG.endpoint,
    position: (position as WidgetConfig['position']) || DEFAULT_CONFIG.position,
    theme: (theme as WidgetConfig['theme']) || DEFAULT_CONFIG.theme,
    buttonColor: buttoncolor || DEFAULT_CONFIG.buttonColor,
  });

  function toggle() {
    open = !open;
  }

  function close() {
    open = false;
  }

  const positionStyles: Record<string, string> = {
    'bottom-right': 'bottom: 20px; right: 20px;',
    'bottom-left': 'bottom: 20px; left: 20px;',
    'top-right': 'top: 20px; right: 20px;',
    'top-left': 'top: 20px; left: 20px;',
  };

  const panelPositionStyles: Record<string, string> = {
    'bottom-right': 'bottom: 80px; right: 0;',
    'bottom-left': 'bottom: 80px; left: 0;',
    'top-right': 'top: 80px; right: 0;',
    'top-left': 'top: 80px; left: 0;',
  };

  // Intercept Escape key in capture phase when widget is open.
  // This prevents the event from reaching host-app drawers/modals
  // that also listen for Escape to close themselves.
  function handleEscapeCapture(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      // Let annotation editor handle its own Escape
      if (isAnnotationEditorOpen()) return;
      e.stopPropagation();
      e.stopImmediatePropagation();
      close();
    }
  }

  onMount(() => {
    if (config.captureConsole) {
      startConsoleCapture(config.maxConsoleLogs);
    }
    startRetryLoop();
    startPickerPoll();

    // Capture-phase Escape handler to absorb Esc before host app sees it
    window.addEventListener('keydown', handleEscapeCapture, true);

    // Listen for external open requests (e.g. host app's "Report Bug" button)
    const handleOpen = () => { open = true; };
    window.addEventListener('jat-feedback:open', handleOpen);
    return () => window.removeEventListener('jat-feedback:open', handleOpen);
  });

  onDestroy(() => {
    stopConsoleCapture();
    stopRetryLoop();
    window.removeEventListener('keydown', handleEscapeCapture, true);
    if (pickerPollInterval) clearInterval(pickerPollInterval);
  });
</script>

<div class="jat-feedback-root" bind:this={rootEl} style="{positionStyles[config.position] || positionStyles['bottom-right']}; --jat-btn-color: {config.buttonColor}; {pickerHidden ? 'display: none;' : ''}">
  {#if config.endpoint}
    <div
      class="jat-feedback-panel"
      class:dragging={isDragging}
      class:hidden={!open}
      style="{panelPositionStyles[config.position] || panelPositionStyles['bottom-right']}"
    >
      <FeedbackPanel endpoint={config.endpoint} {project} isOpen={open} {userId} {userEmail} {userName} {userRole} {orgId} {orgName} onclose={close} ongrip={handlePanelDragStart} />
    </div>
  {:else if open}
    <div class="jat-feedback-panel" style="{panelPositionStyles[config.position] || panelPositionStyles['bottom-right']}">
      <div class="no-endpoint">
        <p>No endpoint configured.</p>
        <p>Add the <code>endpoint</code> attribute:</p>
        <code class="example">&lt;jat-feedback endpoint="http://localhost:3333"&gt;</code>
      </div>
    </div>
  {/if}

  <FeedbackButton onmousedown={handleButtonMouseDown} {open} />
</div>

<style>
  .jat-feedback-root {
    position: fixed;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  .jat-feedback-panel {
    position: absolute;
    animation: panel-in 0.2s ease;
  }
  .jat-feedback-panel.hidden {
    display: none;
  }
  .jat-feedback-panel.dragging {
    pointer-events: none;
    opacity: 0.9;
  }
  .no-endpoint {
    width: 320px;
    background: #111827;
    border: 1px solid #374151;
    border-radius: 12px;
    padding: 20px;
    color: #d1d5db;
    font-size: 13px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  }
  .no-endpoint p {
    margin: 0 0 8px;
  }
  .no-endpoint code {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 11px;
    color: #93c5fd;
  }
  .no-endpoint code.example {
    display: block;
    background: #1f2937;
    padding: 8px 10px;
    border-radius: 4px;
    margin-top: 4px;
  }
  @keyframes panel-in {
    from { opacity: 0; transform: translateY(8px) scale(0.96); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
</style>
