export interface ColumnResizeOptions {
	/** When true, the resize handle is not added and nothing happens. Default: false */
	disabled?: boolean;
	/** Minimum column width in pixels. Default: 40 */
	minWidth?: number;
	/** Called on mousedown — use this to show the guide line (e.g. set resizeGuideX state) */
	onResizeStart?: (initialX: number) => void;
	/** Called on every mousemove with the new width */
	onResize: (width: number) => void;
	/** Called on mouseup with the final width — use this to save settings and hide the guide */
	onResizeEnd?: (width: number) => void;
	/**
	 * Return the container element that holds the `.resize-guide` element.
	 * If provided, the guide line position is updated on each mousemove via direct DOM manipulation,
	 * avoiding reactive overhead.
	 */
	getGuideContainer?: () => HTMLElement | null;
}

/**
 * Svelte action that attaches a column-resize handle to a `<th>` (or any element).
 *
 * Usage:
 * ```svelte
 * <th use:columnResize={{
 *   minWidth: col.minWidth,
 *   onResize: (w) => { columnWidths[col.id] = w; },
 *   onResizeEnd: (w) => { saveColumnSettings(); },
 *   getGuideContainer: () => tableContainerEl,
 * }}>
 * ```
 *
 * The action appends a 4px-wide resize handle div at the right edge of the host element.
 * Dragging it fires `onResize` continuously and `onResizeEnd` on mouse-up.
 */
export function columnResize(node: HTMLElement, options: ColumnResizeOptions): { update(opts: ColumnResizeOptions): void; destroy(): void } {
	let opts = options;

	// If disabled, return a no-op handle
	if (opts.disabled) {
		return {
			update(newOptions: ColumnResizeOptions) { opts = newOptions; },
			destroy() {},
		};
	}

	// Build the resize handle element
	const handle = document.createElement('div');
	handle.className = 'col-resize-handle';
	handle.style.cssText = [
		'position: absolute',
		'right: 0',
		'top: 0',
		'bottom: 0',
		'width: 5px',
		'cursor: col-resize',
		'z-index: 2',
	].join(';');

	// Make the host element position-relative if it isn't already
	const hostPosition = getComputedStyle(node).position;
	if (hostPosition === 'static') {
		node.style.position = 'relative';
	}
	node.appendChild(handle);

	// Resize tracking state
	let startX = 0;
	let startWidth = 0;
	let currentWidth = 0;
	let resizing = false;

	function updateGuide(clientX: number) {
		const container = opts.getGuideContainer?.();
		if (!container) return;
		const guide = container.querySelector<HTMLElement>('.resize-guide');
		if (!guide) return;
		const rect = container.getBoundingClientRect();
		guide.style.left = `${clientX - rect.left + (container as HTMLElement).scrollLeft}px`;
	}

	function onMouseMove(e: MouseEvent) {
		const minWidth = opts.minWidth ?? 40;
		const diff = e.clientX - startX;
		const newWidth = Math.max(minWidth, startWidth + diff);
		currentWidth = newWidth;
		opts.onResize(newWidth);
		updateGuide(e.clientX);
	}

	function onMouseUp() {
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
		// Call onResizeEnd — the parent is responsible for clearing the guide line
		// (typically by setting resizeGuideX = null in its onResizeEnd handler)
		opts.onResizeEnd?.(currentWidth);
		document.removeEventListener('mousemove', onMouseMove);
		document.removeEventListener('mouseup', onMouseUp);
		// Suppress the click event that fires after mouseup on the host <th>,
		// which would otherwise trigger a column sort.
		resizing = true;
		requestAnimationFrame(() => { resizing = false; });
	}

	function onMouseDown(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		startX = e.clientX;
		startWidth = node.offsetWidth;
		currentWidth = startWidth;
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';
		opts.onResizeStart?.(e.clientX);
		updateGuide(e.clientX);
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);
	}

	// Suppress click events on the host element that fire right after a resize ends.
	// Without this, mouseup after dragging the resize handle triggers the host's onclick (e.g. sort).
	function onHostClick(e: MouseEvent) {
		if (resizing) {
			e.stopImmediatePropagation();
			e.preventDefault();
		}
	}

	handle.addEventListener('mousedown', onMouseDown);
	node.addEventListener('click', onHostClick, true);

	return {
		update(newOptions: ColumnResizeOptions) {
			opts = newOptions;
		},
		destroy() {
			handle.removeEventListener('mousedown', onMouseDown);
			node.removeEventListener('click', onHostClick, true);
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			if (handle.parentNode === node) {
				node.removeChild(handle);
			}
		},
	};
}
