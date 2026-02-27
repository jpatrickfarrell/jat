// Annotation drawing primitives for screenshot markup

export type ShapeType = 'arrow' | 'rectangle' | 'ellipse' | 'freehand' | 'text';

export interface Point {
  x: number;
  y: number;
}

export interface BaseShape {
  id: number;
  type: ShapeType;
  color: string;
  strokeWidth: number;
}

export interface ArrowShape extends BaseShape {
  type: 'arrow';
  start: Point;
  end: Point;
}

export interface RectangleShape extends BaseShape {
  type: 'rectangle';
  start: Point;
  end: Point;
}

export interface EllipseShape extends BaseShape {
  type: 'ellipse';
  start: Point;
  end: Point;
}

export interface FreehandShape extends BaseShape {
  type: 'freehand';
  points: Point[];
}

export interface TextShape extends BaseShape {
  type: 'text';
  position: Point;
  content: string;
  fontSize: number;
}

export type Shape = ArrowShape | RectangleShape | EllipseShape | FreehandShape | TextShape;

export const ANNOTATION_COLORS = ['#ef4444', '#eab308', '#22c55e', '#3b82f6', '#ffffff', '#111827'];

const DEFAULT_STROKE_WIDTH = 3;

// Module-level flag so JatFeedback.svelte can check if editor is open
let _editorOpen = false;
export function setAnnotationEditorOpen(v: boolean) { _editorOpen = v; }
export function isAnnotationEditorOpen(): boolean { return _editorOpen; }

let _nextId = 1;
export function nextShapeId(): number { return _nextId++; }

function drawArrow(ctx: CanvasRenderingContext2D, shape: ArrowShape) {
  const { start, end, color, strokeWidth } = shape;
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Line
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();

  // Arrowhead
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const headLen = 14;
  const headAngle = Math.PI / 7; // ~25 degrees
  ctx.beginPath();
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(end.x - headLen * Math.cos(angle - headAngle), end.y - headLen * Math.sin(angle - headAngle));
  ctx.moveTo(end.x, end.y);
  ctx.lineTo(end.x - headLen * Math.cos(angle + headAngle), end.y - headLen * Math.sin(angle + headAngle));
  ctx.stroke();
}

function drawRectangle(ctx: CanvasRenderingContext2D, shape: RectangleShape) {
  const { start, end, color, strokeWidth } = shape;
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineJoin = 'round';
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const w = Math.abs(end.x - start.x);
  const h = Math.abs(end.y - start.y);
  ctx.strokeRect(x, y, w, h);
}

function drawEllipse(ctx: CanvasRenderingContext2D, shape: EllipseShape) {
  const { start, end, color, strokeWidth } = shape;
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  const cx = (start.x + end.x) / 2;
  const cy = (start.y + end.y) / 2;
  const rx = Math.abs(end.x - start.x) / 2;
  const ry = Math.abs(end.y - start.y) / 2;
  if (rx < 1 || ry < 1) return;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawFreehand(ctx: CanvasRenderingContext2D, shape: FreehandShape) {
  const { points, color, strokeWidth } = shape;
  if (points.length < 2) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}

function drawText(ctx: CanvasRenderingContext2D, shape: TextShape) {
  const { position, content, color, fontSize } = shape;
  if (!content) return;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textBaseline = 'top';
  // Black outline for contrast
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.strokeText(content, position.x, position.y);
  // Fill with annotation color
  ctx.fillStyle = color;
  ctx.fillText(content, position.x, position.y);
}

export function renderShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  ctx.save();
  switch (shape.type) {
    case 'arrow': drawArrow(ctx, shape); break;
    case 'rectangle': drawRectangle(ctx, shape); break;
    case 'ellipse': drawEllipse(ctx, shape); break;
    case 'freehand': drawFreehand(ctx, shape); break;
    case 'text': drawText(ctx, shape); break;
  }
  ctx.restore();
}

export function renderAllShapes(ctx: CanvasRenderingContext2D, shapes: Shape[]) {
  for (const shape of shapes) {
    renderShape(ctx, shape);
  }
}

/**
 * Merge image + annotations into a single JPEG data URL.
 */
export function mergeAnnotation(
  originalDataUrl: string,
  shapes: Shape[],
  w: number,
  h: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = w;
      offscreen.height = h;
      const ctx = offscreen.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context unavailable')); return; }
      ctx.drawImage(img, 0, 0, w, h);
      renderAllShapes(ctx, shapes);
      resolve(offscreen.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = originalDataUrl;
  });
}

export { DEFAULT_STROKE_WIDTH };
