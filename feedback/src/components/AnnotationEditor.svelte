<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Shape, ShapeType, Point } from '../lib/annotation';
  import {
    ANNOTATION_COLORS,
    DEFAULT_STROKE_WIDTH,
    renderAllShapes,
    renderShape,
    mergeAnnotation,
    setAnnotationEditorOpen,
    nextShapeId,
  } from '../lib/annotation';

  let {
    imageDataUrl,
    onsave,
    oncancel,
  }: {
    imageDataUrl: string;
    onsave: (dataUrl: string) => void;
    oncancel: () => void;
  } = $props();

  let tool = $state<ShapeType>('arrow');
  let color = $state(ANNOTATION_COLORS[0]);
  let shapes = $state<Shape[]>([]);

  // Canvas refs
  let baseCanvas: HTMLCanvasElement | undefined = $state();
  let overlayCanvas: HTMLCanvasElement | undefined = $state();

  // Image dimensions (native)
  let imgW = $state(0);
  let imgH = $state(0);
  let loaded = $state(false);

  // Drawing state
  type DrawState = 'idle' | 'drawing' | 'typing';
  let drawState = $state<DrawState>('idle');
  let startPoint: Point = { x: 0, y: 0 };
  let freehandPoints: Point[] = [];

  // Text input
  let textInput: HTMLInputElement | undefined = $state();
  let textInputPos = $state({ x: 0, y: 0 }); // canvas coords
  let textInputCss = $state({ left: '0px', top: '0px' });
  let textValue = $state('');

  // Load image and init canvases
  onMount(() => {
    setAnnotationEditorOpen(true);
    const img = new Image();
    img.onload = () => {
      imgW = img.naturalWidth;
      imgH = img.naturalHeight;
      loaded = true;
      requestAnimationFrame(() => redrawBase(img));
    };
    img.src = imageDataUrl;
  });

  onDestroy(() => {
    setAnnotationEditorOpen(false);
  });

  function getBaseImage(): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageDataUrl;
    });
  }

  async function redrawBase(img?: HTMLImageElement) {
    if (!baseCanvas) return;
    const ctx = baseCanvas.getContext('2d');
    if (!ctx) return;
    if (!img) img = await getBaseImage();
    baseCanvas.width = imgW;
    baseCanvas.height = imgH;
    ctx.drawImage(img, 0, 0, imgW, imgH);
    renderAllShapes(ctx, shapes);
  }

  function clearOverlay() {
    if (!overlayCanvas) return;
    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;
    overlayCanvas.width = imgW;
    overlayCanvas.height = imgH;
    ctx.clearRect(0, 0, imgW, imgH);
  }

  /** Convert mouse event to canvas-space coords */
  function canvasCoords(e: MouseEvent): Point {
    if (!overlayCanvas) return { x: 0, y: 0 };
    const rect = overlayCanvas.getBoundingClientRect();
    const scaleX = imgW / rect.width;
    const scaleY = imgH / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  /** Convert canvas coords to CSS position on the overlay element */
  function canvasToCss(p: Point): { left: string; top: string } {
    if (!overlayCanvas) return { left: '0px', top: '0px' };
    const rect = overlayCanvas.getBoundingClientRect();
    return {
      left: `${rect.left + p.x / (imgW / rect.width)}px`,
      top: `${rect.top + p.y / (imgH / rect.height)}px`,
    };
  }

  function buildShape(end: Point): Shape | null {
    const base = { color, strokeWidth: DEFAULT_STROKE_WIDTH };
    switch (tool) {
      case 'arrow':
        return { ...base, id: nextShapeId(), type: 'arrow', start: startPoint, end };
      case 'rectangle':
        return { ...base, id: nextShapeId(), type: 'rectangle', start: startPoint, end };
      case 'ellipse':
        return { ...base, id: nextShapeId(), type: 'ellipse', start: startPoint, end };
      case 'freehand':
        return { ...base, id: nextShapeId(), type: 'freehand', points: [...freehandPoints, end] };
      default:
        return null;
    }
  }

  function onPointerDown(e: MouseEvent) {
    if (drawState === 'typing') {
      commitText();
      return;
    }
    const p = canvasCoords(e);
    if (tool === 'text') {
      drawState = 'typing';
      textInputPos = p;
      textInputCss = canvasToCss(p);
      textValue = '';
      requestAnimationFrame(() => textInput?.focus());
      return;
    }
    drawState = 'drawing';
    startPoint = p;
    freehandPoints = [p];
  }

  function onPointerMove(e: MouseEvent) {
    if (drawState !== 'drawing') return;
    const p = canvasCoords(e);
    if (tool === 'freehand') freehandPoints.push(p);
    // Preview on overlay
    clearOverlay();
    const preview = buildShape(p);
    if (preview && overlayCanvas) {
      const ctx = overlayCanvas.getContext('2d');
      if (ctx) renderShape(ctx, preview);
    }
  }

  function onPointerUp(e: MouseEvent) {
    if (drawState !== 'drawing') return;
    const p = canvasCoords(e);
    const shape = buildShape(p);
    if (shape) {
      shapes = [...shapes, shape];
    }
    drawState = 'idle';
    freehandPoints = [];
    clearOverlay();
    redrawBase();
  }

  function commitText() {
    if (textValue.trim()) {
      const shape: Shape = {
        id: nextShapeId(),
        type: 'text',
        color,
        strokeWidth: DEFAULT_STROKE_WIDTH,
        position: textInputPos,
        content: textValue.trim(),
        fontSize: 20,
      };
      shapes = [...shapes, shape];
      redrawBase();
    }
    textValue = '';
    drawState = 'idle';
  }

  function handleTextKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitText();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      textValue = '';
      drawState = 'idle';
    }
  }

  function undo() {
    if (shapes.length === 0) return;
    shapes = shapes.slice(0, -1);
    redrawBase();
  }

  function clearAll() {
    shapes = [];
    redrawBase();
  }

  async function handleDone() {
    if (shapes.length === 0) {
      // No annotations — return original
      onsave(imageDataUrl);
      return;
    }
    const result = await mergeAnnotation(imageDataUrl, shapes, imgW, imgH);
    onsave(result);
  }

  function handleCancel() {
    oncancel();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && drawState !== 'typing') {
      e.stopPropagation();
      handleCancel();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      undo();
    }
  }

  const toolIcons: Record<ShapeType, string> = {
    arrow: 'M5 19L19 5M19 5H9M19 5V15',
    rectangle: 'M3 3h18v18H3z',
    ellipse: '',
    freehand: 'M3 17c1-2 3-6 5-6s3 4 5 4 3-6 5-6 2 4 3 4',
    text: 'M6 4v16M18 4v16M6 12h12M8 4h-4M20 4h-4M8 20h-4M20 20h-4',
  };

  const toolLabels: Record<ShapeType, string> = {
    arrow: 'Arrow',
    rectangle: 'Rect',
    ellipse: 'Ellipse',
    freehand: 'Draw',
    text: 'Text',
  };

  const tools: ShapeType[] = ['arrow', 'rectangle', 'ellipse', 'freehand', 'text'];
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="annotation-backdrop" onkeydown={handleKeydown}>
  <div class="annotation-toolbar">
    <div class="tool-group">
      {#each tools as t}
        <button
          class="tool-btn"
          class:active={tool === t}
          onclick={() => { tool = t; }}
          title={toolLabels[t]}
        >
          {#if t === 'ellipse'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <ellipse cx="12" cy="12" rx="10" ry="7" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          {:else}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d={toolIcons[t]} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          {/if}
          <span class="tool-label">{toolLabels[t]}</span>
        </button>
      {/each}
    </div>

    <div class="divider"></div>

    <div class="color-group">
      {#each ANNOTATION_COLORS as c}
        <button
          class="color-swatch"
          class:active={color === c}
          style="background: {c}; {c === '#111827' ? 'border-color: #6b7280;' : ''}"
          onclick={() => { color = c; }}
          title={c}
        ></button>
      {/each}
    </div>

    <div class="divider"></div>

    <div class="action-group">
      <button class="action-btn" onclick={undo} disabled={shapes.length === 0} title="Undo (Ctrl+Z)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 10h10a5 5 0 015 5v0a5 5 0 01-5 5H8M3 10l4-4M3 10l4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Undo
      </button>
      <button class="action-btn" onclick={clearAll} disabled={shapes.length === 0} title="Clear all">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M8 6V4h8v2M10 11v6M14 11v6M5 6l1 14h12l1-14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Clear
      </button>
    </div>

    <div class="spacer"></div>

    <div class="commit-group">
      <button class="cancel-btn" onclick={handleCancel}>Cancel</button>
      <button class="done-btn" onclick={handleDone}>Done</button>
    </div>
  </div>

  <div class="canvas-container">
    {#if loaded}
      <canvas
        bind:this={baseCanvas}
        width={imgW}
        height={imgH}
        class="base-canvas"
      ></canvas>
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <canvas
        bind:this={overlayCanvas}
        width={imgW}
        height={imgH}
        class="overlay-canvas"
        class:cursor-crosshair={tool !== 'text'}
        class:cursor-text={tool === 'text'}
        onmousedown={onPointerDown}
        onmousemove={onPointerMove}
        onmouseup={onPointerUp}
      ></canvas>
    {:else}
      <div class="loading">Loading image...</div>
    {/if}
  </div>

  {#if drawState === 'typing'}
    <input
      bind:this={textInput}
      type="text"
      class="text-overlay-input"
      style="left: {textInputCss.left}; top: {textInputCss.top}; color: {color};"
      bind:value={textValue}
      onkeydown={handleTextKeydown}
      onblur={commitText}
      placeholder="Type here..."
    />
  {/if}
</div>

<style>
  .annotation-backdrop {
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .annotation-toolbar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: #1f2937;
    border-bottom: 1px solid #374151;
    width: 100%;
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  .tool-group, .color-group, .action-group, .commit-group {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .divider {
    width: 1px;
    height: 24px;
    background: #374151;
    margin: 0 4px;
  }

  .spacer { flex: 1; }

  .tool-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 8px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    color: #9ca3af;
    font-size: 11px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
  }
  .tool-btn:hover { color: #e5e7eb; background: #374151; }
  .tool-btn.active { color: #fff; background: #3b82f6; border-color: #3b82f6; }

  .tool-label {
    display: none;
  }
  @media (min-width: 640px) {
    .tool-label { display: inline; }
  }

  .color-swatch {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.1s, border-color 0.1s;
    padding: 0;
  }
  .color-swatch:hover { transform: scale(1.15); }
  .color-swatch.active { border-color: #fff; transform: scale(1.2); }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 8px;
    background: transparent;
    border: 1px solid #374151;
    border-radius: 4px;
    color: #9ca3af;
    font-size: 11px;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.15s;
  }
  .action-btn:hover:not(:disabled) { color: #e5e7eb; background: #374151; }
  .action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .cancel-btn {
    padding: 6px 14px;
    background: #374151;
    border: 1px solid #4b5563;
    border-radius: 5px;
    color: #d1d5db;
    font-size: 12px;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
  }
  .cancel-btn:hover { background: #4b5563; }

  .done-btn {
    padding: 6px 16px;
    background: #3b82f6;
    border: none;
    border-radius: 5px;
    color: white;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
  }
  .done-btn:hover { background: #2563eb; }

  .canvas-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    padding: 20px;
  }

  .base-canvas, .overlay-canvas {
    max-width: calc(100vw - 80px);
    max-height: calc(100vh - 120px);
    object-fit: contain;
    border-radius: 4px;
  }

  .base-canvas {
    display: block;
  }

  .overlay-canvas {
    position: absolute;
    /* Overlays exactly on base-canvas — sized by max-width/max-height */
  }

  .cursor-crosshair { cursor: crosshair; }
  .cursor-text { cursor: text; }

  .text-overlay-input {
    position: fixed;
    background: transparent;
    border: 1px dashed rgba(255,255,255,0.5);
    outline: none;
    font-size: 16px;
    font-weight: bold;
    font-family: sans-serif;
    padding: 2px 4px;
    z-index: 2147483647;
    min-width: 80px;
  }

  .loading {
    color: #9ca3af;
    font-size: 14px;
  }
</style>
