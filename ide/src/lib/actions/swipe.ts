/**
 * Shared swipe-gesture Svelte action.
 *
 * Extracted from MobileSessionDrawer (page-swipe) and TasksActive (reveal/dismiss)
 * so any surface that wants horizontal swipe gestures can opt in via a single
 * action instead of re-implementing touch tracking.
 *
 * Behavior:
 *  - Tracks one-finger horizontal drags.
 *  - Ignores drags where |deltaY| exceeds deadzone before deltaX (vertical scroll).
 *  - Ignores diagonal drags that violate the directional threshold
 *    (requires |deltaX| > directionalRatio * |deltaY| to commit).
 *  - While dragging, emits `onOffsetChange(offset)` so the caller can animate
 *    transforms. Values past `maxOffset` are rubber-banded at 0.3×.
 *  - On touchend, commits if either:
 *      (a) |offset| >= commitThreshold, OR
 *      (b) velocity >= velocityThreshold AND |offset| > threshold.
 *    Commit fires `onSwipeLeft` or `onSwipeRight` based on direction.
 *
 * Usage:
 *   <div
 *     use:swipe={{
 *       onSwipeLeft: () => revealActions(event),
 *       onSwipeRight: () => dismissEvent(event),
 *       onOffsetChange: (offset) => offsets.set(event.id, offset),
 *       allowLeft: true,
 *       allowRight: true
 *     }}
 *   >...</div>
 */

export interface SwipeOptions {
	/** Fires when user commits a leftward swipe (deltaX negative). */
	onSwipeLeft?: () => void;
	/** Fires when user commits a rightward swipe (deltaX positive). */
	onSwipeRight?: () => void;
	/** Called on every drag frame with the current clamped offset (px). Reset to 0 on cancel/release. */
	onOffsetChange?: (offset: number) => void;
	/** Called when a drag has been recognized (after deadzone). Lets caller cancel hover / long-press. */
	onSwipeStart?: () => void;
	/** Called when drag ends regardless of commit. */
	onSwipeEnd?: (committed: boolean) => void;
	/** Max drag distance before rubber-band takes over. Default 100. */
	maxOffset?: number;
	/** Minimum distance to count as a slow-commit paired with velocity. Default 80. */
	threshold?: number;
	/** Distance at which commit always fires regardless of velocity. Default 140. */
	commitThreshold?: number;
	/** px/ms that qualifies as a fast-flick commit at `threshold` distance. Default 0.5. */
	velocityThreshold?: number;
	/** Pixels of movement ignored before committing to horizontal tracking. Default 10. */
	deadzone?: number;
	/** Require |deltaX| > directionalRatio * |deltaY| to treat as horizontal swipe. Default 2. */
	directionalRatio?: number;
	/** Allow left-swipe commits. Default true. */
	allowLeft?: boolean;
	/** Allow right-swipe commits. Default true. */
	allowRight?: boolean;
	/** When false, all handlers no-op (keeps listeners attached for toggling without remount). */
	enabled?: boolean;
}

interface SwipeState {
	startX: number;
	startY: number;
	startTime: number;
	swiping: boolean;
	committed: boolean;
}

const DEFAULTS = {
	maxOffset: 100,
	threshold: 80,
	commitThreshold: 140,
	velocityThreshold: 0.5,
	deadzone: 10,
	directionalRatio: 2,
	allowLeft: true,
	allowRight: true,
	enabled: true
};

export function swipe(node: HTMLElement, initial: SwipeOptions = {}) {
	let opts = { ...DEFAULTS, ...initial };
	let state: SwipeState | null = null;

	function resolve<K extends keyof typeof DEFAULTS>(key: K): (typeof DEFAULTS)[K] {
		const v = opts[key];
		return (v === undefined ? DEFAULTS[key] : v) as (typeof DEFAULTS)[K];
	}

	function onTouchStart(e: TouchEvent) {
		if (!resolve('enabled')) return;
		if (e.touches.length !== 1) return;
		const t = e.touches[0];
		state = {
			startX: t.clientX,
			startY: t.clientY,
			startTime: Date.now(),
			swiping: false,
			committed: false
		};
	}

	function onTouchMove(e: TouchEvent) {
		if (!state || state.committed || !resolve('enabled')) return;
		const t = e.touches[0];
		const deltaX = t.clientX - state.startX;
		const deltaY = t.clientY - state.startY;
		const deadzone = resolve('deadzone');
		const ratio = resolve('directionalRatio');

		if (!state.swiping) {
			// Vertical intent wins — let scroll happen, drop the gesture.
			if (Math.abs(deltaY) > deadzone && Math.abs(deltaY) > Math.abs(deltaX)) {
				state = null;
				opts.onOffsetChange?.(0);
				return;
			}
			if (Math.abs(deltaX) > deadzone && Math.abs(deltaX) > ratio * Math.abs(deltaY)) {
				state.swiping = true;
				opts.onSwipeStart?.();
			} else {
				return;
			}
		}

		// Direction gating — if caller disabled that side, don't preview offset past deadzone.
		const allowLeft = resolve('allowLeft');
		const allowRight = resolve('allowRight');
		if (deltaX < 0 && !allowLeft) return;
		if (deltaX > 0 && !allowRight) return;

		e.preventDefault();

		const maxOffset = resolve('maxOffset');
		let clamped: number;
		if (Math.abs(deltaX) <= maxOffset) {
			clamped = deltaX;
		} else {
			const excess = Math.abs(deltaX) - maxOffset;
			clamped = Math.sign(deltaX) * (maxOffset + excess * 0.3);
		}
		opts.onOffsetChange?.(clamped);
	}

	function finish(commitOffset: number | null) {
		if (!state) return;
		const cur = state;
		state = null;
		const wasSwiping = cur.swiping;

		if (!wasSwiping) {
			opts.onSwipeEnd?.(false);
			return;
		}

		const offset = commitOffset ?? 0;
		const elapsed = Math.max(1, Date.now() - cur.startTime);
		const velocity = Math.abs(offset) / elapsed;
		const threshold = resolve('threshold');
		const commitThreshold = resolve('commitThreshold');
		const velocityThreshold = resolve('velocityThreshold');

		const shouldCommit =
			Math.abs(offset) >= commitThreshold ||
			(velocity >= velocityThreshold && Math.abs(offset) > threshold);

		let committed = false;
		if (shouldCommit) {
			if (offset > 0 && resolve('allowRight')) {
				opts.onSwipeRight?.();
				committed = true;
			} else if (offset < 0 && resolve('allowLeft')) {
				opts.onSwipeLeft?.();
				committed = true;
			}
		}

		opts.onOffsetChange?.(0);
		opts.onSwipeEnd?.(committed);
	}

	let lastOffset = 0;
	const wrappedOffset = (v: number) => {
		lastOffset = v;
		initial.onOffsetChange?.(v);
	};
	opts = { ...opts, onOffsetChange: wrappedOffset };

	function onTouchEnd() {
		finish(lastOffset);
		lastOffset = 0;
	}

	function onTouchCancel() {
		if (state) {
			state = null;
			opts.onOffsetChange?.(0);
			opts.onSwipeEnd?.(false);
		}
		lastOffset = 0;
	}

	node.addEventListener('touchstart', onTouchStart, { passive: true });
	node.addEventListener('touchmove', onTouchMove, { passive: false });
	node.addEventListener('touchend', onTouchEnd);
	node.addEventListener('touchcancel', onTouchCancel);

	return {
		update(next: SwipeOptions) {
			const userOffsetChange = next.onOffsetChange;
			opts = {
				...DEFAULTS,
				...next,
				onOffsetChange: (v: number) => {
					lastOffset = v;
					userOffsetChange?.(v);
				}
			};
			initial = next;
		},
		destroy() {
			node.removeEventListener('touchstart', onTouchStart);
			node.removeEventListener('touchmove', onTouchMove);
			node.removeEventListener('touchend', onTouchEnd);
			node.removeEventListener('touchcancel', onTouchCancel);
		}
	};
}
