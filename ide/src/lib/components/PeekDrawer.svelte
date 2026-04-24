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

	import { slide } from 'svelte/transition';
	import { peekState, closePeek, scrollFocusedIntoView } from '$lib/stores/peekStore.svelte';
	import { getPeekEntry } from '$lib/peek/registry';

	const entry = $derived.by(() => {
		const id = peekState.navId;
		if (!id) return null;
		return getPeekEntry(id);
	});

	const props = $derived.by(() => {
		const id = peekState.navId;
		const e = entry;
		if (!id || !e) return null;
		try {
			return e.propsForId(id);
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

	function handleKeydown(e: KeyboardEvent) {
		if (!peekState.isOpen) return;
		if (isTypingTarget(e.target)) return;
		if (e.key === 'Escape') {
			// Capture phase + stopImmediatePropagation so we close peek
			// BEFORE listNav's own Escape handler sees it (otherwise listNav
			// clears focus first, which leaves the drawer stranded without
			// the user's j/k context).
			e.preventDefault();
			e.stopImmediatePropagation();
			closePeek();
		}
	}

	// After peek opens, bring the focused list item back into view (the drawer
	// eats ~40% of the viewport width; long rows can get clipped).
	$effect(() => {
		if (peekState.isOpen) {
			void scrollFocusedIntoView();
		}
	});

	// Register Esc handler at capture phase on window so we run before
	// any listNav-installed bubble-phase handlers or route-level onkeydown.
	$effect(() => {
		window.addEventListener('keydown', handleKeydown, { capture: true });
		return () => window.removeEventListener('keydown', handleKeydown, { capture: true });
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
		transition:slide={{ axis: 'x', duration: 180 }}
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
