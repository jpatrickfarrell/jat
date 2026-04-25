<script lang="ts">
	/**
	 * PeekDrawer — globally-mounted 40vw right drawer for previewing the
	 * currently-focused listNav item. Mounted once in `+layout.svelte`.
	 *
	 * The drawer is passive by design: j/k still navigates the list underneath
	 * (focus stays on the list), clicking the drawer's body doesn't steal
	 * focus, and Esc / Space / clicking the backdrop close it.
	 *
	 * Content comes from the PeekRegistry — the currently-peeked `navId` is
	 * looked up to find the matching `{ component, propsForId, label }` entry.
	 */

	import {
		peekState,
		closePeek,
		togglePeek,
		setPeek,
		scrollFocusedIntoView,
	} from '$lib/stores/peekStore.svelte';
	import { getPeekEntry } from '$lib/peek/registry';

	const FOCUSED_CLASS = 'jk-focused';
	const ITEM_SELECTOR = '[data-nav-id]';
	/**
	 * Routes that own Space for something else (e.g. /servers play/pause)
	 * mark their list container with `data-peek="false"` to opt out. Detail
	 * components inside peek can also set this if they want to swallow Space.
	 */
	const OPT_OUT_ATTR = 'data-peek';

	const focusedEl = $derived.by(() => {
		const id = peekState.navId;
		if (!id) return null;
		// CSS.escape protects nav-ids that contain special chars (e.g. paths).
		try {
			return document.querySelector<HTMLElement>(
				`[data-nav-id="${CSS.escape(id)}"]`,
			);
		} catch {
			return null;
		}
	});

	const entry = $derived.by(() => {
		const id = peekState.navId;
		if (!id) return null;
		return getPeekEntry(id, focusedEl);
	});

	const props = $derived.by(() => {
		const id = peekState.navId;
		const e = entry;
		if (!id || !e) return null;
		try {
			return e.propsForId(id, focusedEl ?? undefined);
		} catch {
			return null;
		}
	});

	function isTypingTarget(t: EventTarget | null): boolean {
		if (!(t instanceof HTMLElement)) return false;
		const tag = t.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
		if (t.isContentEditable) return true;
		return false;
	}

	/**
	 * Walk up from the focused element looking for an explicit
	 * `data-peek="false"` ancestor. If found, this list opts out of peek
	 * (e.g. /servers, where Space toggles start/stop).
	 */
	function isOptedOut(el: HTMLElement | null): boolean {
		let cur: HTMLElement | null = el;
		while (cur) {
			const v = cur.getAttribute(OPT_OUT_ATTR);
			if (v === 'false') return true;
			cur = cur.parentElement;
		}
		return false;
	}

	function findFocusedItem(): HTMLElement | null {
		const els = document.querySelectorAll<HTMLElement>(`.${FOCUSED_CLASS}`);
		// Iterate in document order; first focused list item wins. (Pages
		// almost never have multiple .jk-focused at once; this is a guard.)
		for (const el of els) {
			if (!el.matches(ITEM_SELECTOR)) continue;
			if (!el.dataset.navId) continue;
			if (isOptedOut(el)) continue;
			return el;
		}
		return null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.ctrlKey || e.metaKey || e.altKey) return;
		if (isTypingTarget(e.target)) return;

		if (e.key === 'Escape') {
			if (!peekState.isOpen) return;
			// Capture phase + stopImmediatePropagation so we close peek
			// BEFORE listNav's own Escape handler sees it (otherwise listNav
			// clears focus first, which leaves the drawer stranded).
			e.preventDefault();
			e.stopImmediatePropagation();
			closePeek();
			return;
		}

		if (e.key === ' ') {
			const focused = findFocusedItem();
			if (!focused) return;
			const navId = focused.dataset.navId!;
			// Only intercept Space if a peek handler is registered for this
			// navId (or the element declares a `data-peek-kind`). Routes with
			// non-peekable nav-ids simply no-op on Space rather than showing
			// an empty "No peek handler" drawer.
			if (!getPeekEntry(navId, focused)) return;
			e.preventDefault();
			e.stopImmediatePropagation();
			togglePeek(navId);
			return;
		}

		if (e.key === 'Enter' && peekState.isOpen) {
			// Promote: close peek and let Enter bubble through to listNav's
			// onSelect, which opens the full detail drawer in one motion.
			const focused = findFocusedItem();
			if (!focused) {
				// Edge case: peek open but no focus. Just close.
				closePeek();
				return;
			}
			closePeek();
			// Don't preventDefault — listNav's bubble-phase Enter handler
			// fires onSelect, opening the full detail.
		}
	}

	// After peek opens, bring the focused list item back into view (the drawer
	// eats ~40% of the viewport width; long rows can get clipped).
	$effect(() => {
		if (peekState.isOpen) {
			void scrollFocusedIntoView();
		}
	});

	// Global Space/Enter/Esc handler at capture phase. Runs before listNav's
	// bubble-phase window listener so peek wins on Space.
	$effect(() => {
		window.addEventListener('keydown', handleKeydown, { capture: true });
		return () => window.removeEventListener('keydown', handleKeydown, { capture: true });
	});

	// While peek is open, follow the focused list item as j/k moves it.
	// Only active when peek is open — observer disconnects on close.
	$effect(() => {
		if (!peekState.isOpen) return;

		const observer = new MutationObserver(() => {
			if (!peekState.isOpen) return;
			const focused = findFocusedItem();
			if (focused?.dataset.navId) setPeek(focused.dataset.navId);
		});

		observer.observe(document.body, {
			subtree: true,
			attributes: true,
			attributeFilter: ['class'],
		});

		return () => observer.disconnect();
	});
</script>

{#if peekState.isOpen}
	<!-- Backdrop: subtle, non-blocking (transparent so the user still sees the list) -->
	<button
		type="button"
		aria-label="Close peek"
		class="fixed inset-0 z-40 cursor-default bg-transparent"
		onclick={closePeek}
	></button>

	<!-- Drawer panel -->
	<aside
		class="peek-drawer fixed right-0 top-0 z-50 flex h-screen w-[40vw] min-w-[360px] max-w-[720px] flex-col shadow-2xl"
		aria-label="Peek preview"
	>
		<!-- Header -->
		<header class="peek-drawer-header flex items-center justify-between px-4 py-2.5">
			<div class="flex min-w-0 items-center gap-2">
				<span class="peek-kbd">Peek</span>
				{#if entry?.label}
					<span class="peek-drawer-label truncate text-sm">{entry.label}</span>
				{/if}
				{#if peekState.navId}
					<code class="peek-drawer-navid truncate font-mono text-xs">
						{peekState.navId}
					</code>
				{/if}
			</div>

			<div class="flex items-center gap-2">
				<span class="peek-drawer-hint text-xs">
					<span class="peek-kbd">Space</span> or <span class="peek-kbd">Esc</span> to close
				</span>
				<button
					type="button"
					class="peek-drawer-close"
					aria-label="Close peek"
					onclick={closePeek}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			</div>
		</header>

		<!-- Body: swaps in place as peekState.navId changes -->
		<section class="peek-drawer-body flex-1 overflow-y-auto">
			{#if entry && props}
				{@const Comp = entry.component}
				{#key peekState.navId}
					<Comp {...props} />
				{/key}
			{:else if peekState.navId}
				<div class="peek-drawer-empty p-6 text-sm">
					<p class="font-medium">No peek handler registered</p>
					<p class="mt-1 opacity-70">
						Nothing matches <code class="font-mono">{peekState.navId}</code>.
					</p>
					<p class="mt-3 text-xs opacity-60">
						Register a peek entry with <code>registerPeek()</code> in layout bootstrap.
					</p>
				</div>
			{/if}
		</section>
	</aside>
{/if}

<style>
	.peek-drawer {
		background: oklch(0.14 0.01 250);
		border-left: 1px solid oklch(0.30 0.02 250);
		animation: peek-drawer-in 180ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	@keyframes peek-drawer-in {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}

	.peek-drawer-header {
		background: oklch(0.18 0.01 250);
		border-bottom: 1px solid oklch(0.26 0.02 250);
		color: oklch(0.85 0.02 250);
	}

	.peek-drawer-label {
		color: oklch(0.70 0.02 250);
	}

	.peek-drawer-navid {
		background: oklch(0.22 0.02 250);
		color: oklch(0.78 0.10 200);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
	}

	.peek-drawer-hint {
		color: oklch(0.55 0.02 250);
	}

	.peek-kbd {
		display: inline-block;
		padding: 0.0625rem 0.3125rem;
		font-family: ui-monospace, monospace;
		font-size: 0.6875rem;
		line-height: 1.2;
		color: oklch(0.80 0.02 250);
		background: oklch(0.22 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-bottom-width: 2px;
		border-radius: 0.25rem;
	}

	.peek-drawer-close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 0.375rem;
		color: oklch(0.70 0.02 250);
		background: transparent;
		border: none;
		cursor: pointer;
		transition: background 120ms ease, color 120ms ease;
	}

	.peek-drawer-close:hover {
		background: oklch(0.24 0.02 250);
		color: oklch(0.90 0.02 250);
	}

	.peek-drawer-body {
		background: oklch(0.14 0.01 250);
		color: oklch(0.82 0.02 250);
	}

	.peek-drawer-empty {
		color: oklch(0.70 0.02 250);
	}

	.peek-drawer-empty code {
		background: oklch(0.22 0.02 250);
		color: oklch(0.78 0.10 200);
		padding: 0.0625rem 0.3125rem;
		border-radius: 0.25rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.peek-drawer {
			transition: none !important;
			animation: none !important;
		}
	}
</style>
