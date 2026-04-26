<script lang="ts">
	/**
	 * KeyboardShortcutsOverlay — press `?` to toggle a modal listing the
	 * keyboard shortcuts available on the current page. Press `?` again or
	 * `Escape` to dismiss. Input/contenteditable fields and Ctrl/Meta/Alt
	 * combos are ignored so the shortcut never interferes with typing.
	 *
	 * Usage:
	 *
	 *   <KeyboardShortcutsOverlay shortcuts={[
	 *     { key: 'j / ↓', description: 'Focus next item' },
	 *     { key: 'k / ↑', description: 'Focus previous item' },
	 *     { key: 'Enter', description: 'Open detail' },
	 *   ]} />
	 */
	import type { KeyboardShortcut } from '$lib/actions/listNav';
	import { marksSnapshot } from '$lib/stores/marks.svelte';

	export interface SectionEntry {
		key: string;
		description: string;
		/** Optional oklch color to tint the key badge — used for legend entries */
		color?: string;
	}

	export interface ShortcutSection {
		title: string;
		shortcuts: SectionEntry[];
	}

	let {
		shortcuts = [],
		sections,
		title = 'Keyboard Shortcuts',
		open = $bindable(false),
		showListMotions = true,
		showMarks = true
	}: {
		shortcuts?: KeyboardShortcut[];
		/**
		 * Optional grouped sections (e.g. mode-specific shortcut tables for
		 * /inbox: list / detail / compose). When provided, takes
		 * precedence over the flat `shortcuts` prop.
		 */
		sections?: ShortcutSection[];
		title?: string;
		open?: boolean;
		/**
		 * Render the "List motions (Vim)" section. These motions are
		 * implemented by `createListNav` and apply on every route that uses
		 * it. Pass `false` to hide them (e.g. on routes with no j/k list).
		 */
		showListMotions?: boolean;
		/**
		 * Render the "Marks & Jumps (Vim)" section. Marks are global —
		 * `m<letter>` sets, `'<letter>` jumps, Ctrl+O/I traverse history.
		 */
		showMarks?: boolean;
	} = $props();

	const MARKS_SHORTCUTS: KeyboardShortcut[] = [
		{ key: 'm{a-z}', description: 'Drop a mark on the focused item' },
		{ key: "'{a-z}", description: 'Jump to a mark (cross-route)' },
		{ key: 'Ctrl+O', description: 'Jump back through recent positions' },
		{ key: 'Ctrl+I', description: 'Jump forward through recent positions' },
		{ key: ':delm {a-z}', description: 'Delete a single mark' },
		{ key: ':delmm', description: 'Delete all marks' }
	];

	// Reactive snapshot of currently set marks. Reads from the marks store
	// rune so the list updates live as marks are added or deleted.
	const activeMarks = $derived.by(() => {
		const map = marksSnapshot();
		return Object.values(map).sort((a, b) => a.letter.localeCompare(b.letter));
	});

	/**
	 * Universal list motions, layered on top of j/k/Enter/Esc by `listNav`.
	 * Surfaced here so every consumer of the overlay shows them by default.
	 */
	const LIST_MOTIONS: KeyboardShortcut[] = [
		{ key: 'gg', description: 'Jump to first item' },
		{ key: 'G', description: 'Jump to last item' },
		{ key: '{n}j / {n}k', description: 'Move n items down / up' },
		{ key: '{n}G / {n}gg', description: 'Jump to 1-indexed line n' },
		{ key: 'Ctrl+D / Ctrl+U', description: 'Half-page down / up' },
		{ key: 'zz', description: 'Centre focused item in viewport' }
	];

	let isOpen = $state(open);

	$effect(() => { isOpen = open; });
	$effect(() => { open = isOpen; });

	function isTypingTarget(target: EventTarget | null): boolean {
		if (!(target instanceof HTMLElement)) return false;
		const tag = target.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
		return target.isContentEditable;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.ctrlKey || e.metaKey || e.altKey) return;

		if (e.key === '?') {
			// `?` is always Shift+/. Don't trigger while typing — would swallow the char.
			if (isTypingTarget(e.target)) return;
			e.preventDefault();
			isOpen = !isOpen;
			return;
		}

		if (isOpen && e.key === 'Escape') {
			e.preventDefault();
			isOpen = false;
		}
	}

	$effect(() => {
		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	});
</script>

{#if isOpen}
	<div
		class="kso-backdrop"
		role="presentation"
		onclick={() => (isOpen = false)}
	>
		<div
			class="kso-panel animate-scale-in"
			role="dialog"
			aria-modal="true"
			aria-label={title}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			tabindex="-1"
		>
			<div class="kso-header">
				<h2 class="kso-title">{title}</h2>
				<button
					type="button"
					class="kso-close"
					onclick={() => (isOpen = false)}
					aria-label="Close keyboard shortcuts"
				>
					×
				</button>
			</div>
			<div class="kso-list">
				{#if sections && sections.length > 0}
					{#each sections as section, sIdx (section.title + '::' + sIdx)}
						<div class="kso-section-title">{section.title}</div>
						{#each section.shortcuts as { key, description, color }, i (section.title + '::' + key + '::' + i)}
							<div class="kso-row">
								<kbd class="kso-key" style={color ? `color:${color};border-color:color-mix(in oklch,${color} 50%,oklch(0.35 0.02 250));background:color-mix(in oklch,${color} 12%,oklch(0.25 0.02 250))` : ''}>
									{key}
								</kbd>
								<span class="kso-description">{description}</span>
							</div>
						{/each}
					{/each}
				{:else}
					{#each shortcuts as { key, description }, i (key + '::' + i)}
						<div class="kso-row">
							<kbd class="kso-key">{key}</kbd>
							<span class="kso-description">{description}</span>
						</div>
					{/each}
				{/if}
				{#if showListMotions}
					<div class="kso-section-title">List motions (Vim)</div>
					{#each LIST_MOTIONS as { key, description }, i (key + '::' + i)}
						<div class="kso-row">
							<kbd class="kso-key">{key}</kbd>
							<span class="kso-description">{description}</span>
						</div>
					{/each}
				{/if}
				{#if showMarks}
					<div class="kso-section-title">Marks & jumps (Vim)</div>
					{#each MARKS_SHORTCUTS as { key, description }, i (key + '::' + i)}
						<div class="kso-row">
							<kbd class="kso-key">{key}</kbd>
							<span class="kso-description">{description}</span>
						</div>
					{/each}
					{#if activeMarks.length > 0}
						<div class="kso-marks-list">
							<div class="kso-marks-label">Active marks</div>
							{#each activeMarks as mark (mark.letter)}
								<div class="kso-mark-row">
									<kbd class="kso-key kso-mark-letter">{mark.letter}</kbd>
									<span class="kso-mark-target">
										<span class="kso-mark-label">{mark.label || mark.navId || '—'}</span>
										<span class="kso-mark-route">({mark.route})</span>
									</span>
								</div>
							{/each}
						</div>
					{/if}
				{/if}
				<div class="kso-row kso-row-meta">
					<kbd class="kso-key">?</kbd>
					<span class="kso-description">Toggle this overlay</span>
				</div>
				<div class="kso-row kso-row-meta">
					<kbd class="kso-key">Esc</kbd>
					<span class="kso-description">Close overlay</span>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.kso-backdrop {
		position: fixed;
		inset: 0;
		background: oklch(0 0 0 / 0.6);
		backdrop-filter: blur(2px);
		z-index: 60;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.5rem;
		animation: kso-fade 0.15s ease-out;
	}

	.kso-panel {
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.30 0.03 250);
		border-radius: 0.75rem;
		box-shadow: 0 20px 60px oklch(0 0 0 / 0.6);
		max-width: 34rem;
		width: 100%;
		max-height: 80vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.kso-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.9rem 1.25rem;
		border-bottom: 1px solid oklch(0.25 0.02 250);
		flex-shrink: 0;
	}

	.kso-title {
		font-size: 0.95rem;
		font-weight: 600;
		color: oklch(0.92 0.02 250);
		margin: 0;
		letter-spacing: 0.01em;
	}

	.kso-close {
		background: transparent;
		border: none;
		color: oklch(0.65 0.02 250);
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
		padding: 0.15rem 0.5rem;
		border-radius: 0.35rem;
		transition: background 0.12s ease, color 0.12s ease;
	}

	.kso-close:hover {
		color: oklch(0.94 0.02 250);
		background: oklch(0.25 0.02 250);
	}

	.kso-list {
		padding: 0.75rem 1.25rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		overflow-y: auto;
	}

	.kso-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.4rem 0.25rem;
	}

	.kso-section-title {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: oklch(0.62 0.05 240);
		padding: 0.55rem 0.25rem 0.2rem;
		border-bottom: 1px solid oklch(0.25 0.02 250);
		margin-top: 0.25rem;
	}

	.kso-section-title:first-of-type {
		margin-top: 0;
		padding-top: 0.1rem;
	}

	.kso-row-meta {
		opacity: 0.7;
		border-top: 1px dashed oklch(0.25 0.02 250);
		margin-top: 0.25rem;
		padding-top: 0.5rem;
	}

	.kso-row-meta:not(:first-of-type) {
		border-top: none;
		margin-top: 0;
	}

	.kso-key {
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 0.78rem;
		background: oklch(0.25 0.02 250);
		border: 1px solid oklch(0.35 0.02 250);
		border-bottom-width: 2px;
		border-radius: 0.35rem;
		padding: 0.18rem 0.55rem;
		min-width: 3.25rem;
		text-align: center;
		color: oklch(0.93 0.02 250);
		flex-shrink: 0;
		white-space: nowrap;
	}

	.kso-description {
		font-size: 0.85rem;
		color: oklch(0.78 0.02 250);
		line-height: 1.35;
	}

	.kso-marks-list {
		margin-top: 0.4rem;
		padding: 0.5rem 0.6rem;
		background: oklch(0.22 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.4rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.kso-marks-label {
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: oklch(0.62 0.05 240);
		margin-bottom: 0.15rem;
	}

	.kso-mark-row {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		padding: 0.15rem 0;
	}

	.kso-mark-letter {
		min-width: 2rem;
		color: oklch(0.85 0.12 200);
		border-color: oklch(0.45 0.10 200);
		background: oklch(0.30 0.04 220);
	}

	.kso-mark-target {
		font-size: 0.8rem;
		color: oklch(0.85 0.02 250);
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		min-width: 0;
	}

	.kso-mark-label {
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 16rem;
	}

	.kso-mark-route {
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 0.72rem;
		color: oklch(0.60 0.04 250);
	}

	@keyframes kso-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.kso-backdrop,
		.kso-panel {
			animation: none !important;
		}
	}
</style>
