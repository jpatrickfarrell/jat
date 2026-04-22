<script lang="ts">
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { fetchAndGetProjectColors, getProjectColor } from '$lib/utils/projectColors';
	import { SESSION_STATE_VISUALS } from '$lib/config/statusColors';
	import {
		fetch as fetchServers,
		start as startServer,
		stop as stopServer,
		restart as restartServer,
		getSessionByProject,
		serverSessionsState,
	} from '$lib/stores/serverSessions.svelte';
	import { isStartDropdownOpen, closeStartDropdown, startDropdownOpenedViaKeyboard } from '$lib/stores/drawerStore';
	import { playServerStartSound, playServerStopSound } from '$lib/utils/soundEffects';

	interface Props {
		projects: string[];
		selected: string;
		onSelect: (project: string) => void;
		colorFn?: (project: string) => string;
		onOpenSearch?: () => void;
		sessionStates?: string[];
	}

	let { projects = [], selected = '', onSelect, colorFn, onOpenSearch, sessionStates = [] }: Props = $props();

	let projectColors = $state<Record<string, string>>({});

	// Dropdown state
	let showDropdown = $state(false);
	let dropdownEl = $state<HTMLDivElement | null>(null);
	let nameBtnEl = $state<HTMLButtonElement | null>(null);
	// Keyboard-focused project (for visible focus ring on programmatic focus)
	let kbdFocusedProject = $state<string | null>(null);

	// Server state (mirrors ProjectSelector pattern)
	interface ProjectServerInfo {
		port: number;
		serverPath: string | null;
	}
	let projectServerConfigs = $state<Map<string, ProjectServerInfo>>(new Map());
	let serverLoading = $state(false);
	let serverError = $state<string | null>(null);

	const selectedServerSession = $derived(getSessionByProject(selected));
	const selectedServerConfig = $derived(projectServerConfigs.get(selected));
	const serverIsRunning = $derived(
		selectedServerSession?.status === 'running' || selectedServerSession?.status === 'starting'
	);
	const effectiveServerConfig = $derived.by(() => {
		if (selectedServerConfig) return selectedServerConfig;
		if (selectedServerSession) {
			return {
				port: selectedServerSession.port ?? 0,
				serverPath: null,
			};
		}
		return null;
	});

	async function fetchProjectConfigs() {
		try {
			const response = await fetch('/api/projects');
			if (!response.ok) return;
			const data = await response.json();
			const configs = new Map<string, ProjectServerInfo>();
			for (const p of data.projects || []) {
				if (p.port || p.serverPath) {
					configs.set(p.name, {
						port: p.port || 5173,
						serverPath: p.serverPath || null,
					});
				}
			}
			projectServerConfigs = configs;
		} catch {
			// Non-fatal — dropdown still usable for project switching
		}
	}

	async function handleServerStart() {
		if (!selected) return;
		serverLoading = true;
		serverError = null;
		try {
			await startServer(selected);
			playServerStartSound();
		} catch (e) {
			serverError = `Failed to start`;
		} finally {
			serverLoading = false;
		}
	}

	async function handleServerStop() {
		if (!selectedServerSession) return;
		serverLoading = true;
		serverError = null;
		try {
			await stopServer(selectedServerSession.sessionName);
			playServerStopSound();
		} catch (e) {
			serverError = `Failed to stop`;
		} finally {
			serverLoading = false;
		}
	}

	async function handleServerRestart() {
		if (!selectedServerSession) return;
		serverLoading = true;
		serverError = null;
		try {
			await restartServer(selectedServerSession.sessionName);
			playServerStartSound();
		} catch (e) {
			serverError = `Failed to restart`;
		} finally {
			serverLoading = false;
		}
	}

	function handleServerOpenBrowser() {
		const config = effectiveServerConfig;
		if (!config?.port) return;
		window.open(`http://localhost:${config.port}`, '_blank');
	}

	function openDropdown() {
		showDropdown = true;
		serverError = null;
	}

	function closeDropdown() {
		showDropdown = false;
		serverError = null;
		// Keep the global Alt+S store in sync so the next press re-opens cleanly
		if (get(isStartDropdownOpen)) closeStartDropdown();
	}

	function toggleDropdown() {
		if (showDropdown) closeDropdown();
		else openDropdown();
	}

	function handleProjectTap(project: string) {
		closeDropdown();
		if (project !== selected) onSelect(project);
	}

	function handleSearchTap() {
		closeDropdown();
		onOpenSearch?.();
	}

	// Mirror Alt+S global shortcut (`isStartDropdownOpen` store) on narrow screens.
	// Desktop ProjectSelector owns this store on wide; here we take over under lg breakpoint.
	$effect(() => {
		const unsubscribe = isStartDropdownOpen.subscribe((isOpen: boolean) => {
			if (typeof window === 'undefined') return;
			const isNarrow = window.matchMedia('(max-width: 1023.98px)').matches;
			if (!isNarrow) return;
			if (isOpen && !showDropdown) {
				openDropdown();
				// If opened by keyboard, move focus into the panel so arrow keys navigate it
				// instead of scrolling the page.
				if (get(startDropdownOpenedViaKeyboard)) {
					queueMicrotask(() => focusFirstMenuItem());
				}
			} else if (!isOpen && showDropdown) {
				// Local-only close; avoid re-entering closeStartDropdown (already false)
				showDropdown = false;
				serverError = null;
			}
		});
		return unsubscribe;
	});

	function getMenuItems(): HTMLElement[] {
		if (!dropdownEl) return [];
		return Array.from(dropdownEl.querySelectorAll<HTMLElement>('[role="menuitem"], .mps-server-btn'));
	}

	function setKbdFocus(el: HTMLElement | null | undefined) {
		// Clear prior marker on non-project items (manual class management)
		dropdownEl?.querySelectorAll('.mps-kbd-focus:not(.mps-project-row)').forEach((n) => n.classList.remove('mps-kbd-focus'));
		if (!el) {
			kbdFocusedProject = null;
			return;
		}
		// Project rows: reactive class via Svelte (kbdFocusedProject === p)
		const rowProject = el.getAttribute('data-project');
		if (rowProject) {
			kbdFocusedProject = rowProject;
		} else {
			kbdFocusedProject = null;
			// Non-project menu items (server buttons, search footer): manual class
			el.classList.add('mps-kbd-focus');
		}
		el.focus();
		el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
	}

	function focusFirstMenuItem() {
		// Prefer the current project row so arrow-up/down moves from the current position
		const current = dropdownEl?.querySelector<HTMLElement>('.mps-project-row-current');
		if (current) { setKbdFocus(current); return; }
		const items = getMenuItems();
		setKbdFocus(items[0]);
	}


	// Close on outside pointerdown
	$effect(() => {
		if (!showDropdown) return;
		function onPointerDown(e: PointerEvent) {
			const target = e.target as Node;
			if (dropdownEl?.contains(target)) return;
			if (nameBtnEl?.contains(target)) return;
			closeDropdown();
		}
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				e.preventDefault();
				closeDropdown();
				nameBtnEl?.focus();
				return;
			}
			// Arrow keys navigate dropdown items — capture at document level so the
			// page doesn't also scroll behind the panel.
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
				const active = document.activeElement as HTMLElement | null;
				if (!active || !dropdownEl?.contains(active)) return;
				const items = getMenuItems();
				if (items.length === 0) return;
				const activeIdx = items.indexOf(active);
				let nextIdx = activeIdx;
				if (e.key === 'ArrowDown') nextIdx = activeIdx < 0 ? 0 : (activeIdx + 1) % items.length;
				else if (e.key === 'ArrowUp') nextIdx = activeIdx <= 0 ? items.length - 1 : activeIdx - 1;
				else if (e.key === 'Home') nextIdx = 0;
				else if (e.key === 'End') nextIdx = items.length - 1;
				e.preventDefault();
				setKbdFocus(items[nextIdx]);
			}
		}
		document.addEventListener('pointerdown', onPointerDown, true);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('pointerdown', onPointerDown, true);
			document.removeEventListener('keydown', onKey);
		};
	});

	// Swipe state
	let touchStartX = $state(0);
	let touchStartY = $state(0);
	let swipeDelta = $state(0); // current drag offset (px)
	let isSwiping = $state(false);
	let swipeCommitted = $state(false);

	// Peek label while swiping
	const SWIPE_THRESHOLD = 40; // px horizontal travel to commit
	const DIR_RATIO = 2; // deltaX must be > DIR_RATIO * deltaY

	onMount(async () => {
		if (!colorFn) {
			projectColors = await fetchAndGetProjectColors();
		}
		fetchProjectConfigs();
		fetchServers();
	});

	function getColor(project: string): string {
		if (colorFn) return colorFn(project);
		return projectColors[project?.toLowerCase()] || getProjectColor(project + '-x');
	}

	const currentIndex = $derived(projects.indexOf(selected));
	const prevProject = $derived(
		projects.length > 1 ? projects[(currentIndex - 1 + projects.length) % projects.length] : null
	);
	const nextProject = $derived(
		projects.length > 1 ? projects[(currentIndex + 1) % projects.length] : null
	);

	// Peek label: while swiping show adjacent project name
	const peekLabel = $derived.by(() => {
		if (!isSwiping || Math.abs(swipeDelta) < 8) return null;
		return swipeDelta > 0 ? prevProject : nextProject;
	});

	function go(direction: 1 | -1) {
		if (projects.length < 2) return;
		const next = projects[(currentIndex + direction + projects.length) % projects.length];
		onSelect(next);
	}

	// Touch handlers
	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
		swipeDelta = 0;
		isSwiping = false;
		swipeCommitted = false;
	}

	function handleTouchMove(e: TouchEvent) {
		const dx = e.touches[0].clientX - touchStartX;
		const dy = e.touches[0].clientY - touchStartY;
		if (!isSwiping && Math.abs(dx) < 8) return;

		// Only commit as horizontal swipe if deltaX > DIR_RATIO * deltaY
		if (!isSwiping) {
			if (Math.abs(dx) > DIR_RATIO * Math.abs(dy)) {
				isSwiping = true;
			} else {
				return; // vertical scroll takes priority
			}
		}

		e.preventDefault();
		swipeDelta = dx;
	}

	function handleTouchEnd() {
		if (isSwiping && !swipeCommitted && Math.abs(swipeDelta) >= SWIPE_THRESHOLD) {
			swipeCommitted = true;
			go(swipeDelta > 0 ? -1 : 1);
		}
		// Reset
		swipeDelta = 0;
		isSwiping = false;
		swipeCommitted = false;
	}

	// Clamp peek translate so it doesn't go too far (max 30% of bar width)
	const peekTranslate = $derived(
		isSwiping ? Math.max(-60, Math.min(60, swipeDelta * 0.35)) : 0
	);

	const selectedColor = $derived(selected ? getColor(selected) : 'oklch(0.70 0.15 200)');
</script>

<!-- aria-live region announces project changes to screen readers -->
<div class="mps-live" aria-live="polite" aria-atomic="true">
	{selected || ''}
</div>

<div class="mps-wrap">
<div
	class="mps-bar"
	style="--mps-color: {selectedColor}"
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
	onkeydown={(e) => {
		if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
		if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
	}}
	role="navigation"
	aria-label="Project navigation"
>
	<!-- Prev chevron -->
	<button
		type="button"
		class="mps-chevron"
		aria-label="Previous project"
		disabled={projects.length < 2}
		onclick={() => go(-1)}
	>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M15 18l-6-6 6-6" />
		</svg>
	</button>

	<!-- Center: project name + dropdown trigger -->
	<div class="mps-center">
		<div
			class="mps-label-wrap"
			style="transform: translateX({peekTranslate}px)"
		>
			<!-- Peek label (fades in during swipe) -->
			{#if peekLabel}
				<span
					class="mps-peek"
					class:mps-peek-left={swipeDelta < 0}
					class:mps-peek-right={swipeDelta > 0}
					style="--peek-color: {getColor(peekLabel)}"
					aria-hidden="true"
				>
					{peekLabel}
				</span>
			{/if}

			<!-- Project name button — tapping opens the mobile dropdown (server + switch + search) -->
			<button
				type="button"
				class="mps-name-btn"
				style="--mps-color: {selectedColor}"
				bind:this={nameBtnEl}
				onclick={toggleDropdown}
				aria-label="Open project menu"
				aria-haspopup="menu"
				aria-expanded={showDropdown}
			>
				{#if sessionStates.length > 0}
					<span class="mps-dots">
						{#each sessionStates as state}
							{@const visual = SESSION_STATE_VISUALS[state]}
							{@const color = visual?.accent || selectedColor}
							{@const isNI = state === 'needs-input'}
							{@const isRev = state === 'ready-for-review'}
							{#if isNI || isRev}
								<span class="mps-dot-animated">
									<span class="mps-dot-ping" class:animate-ping={isNI} class:animate-pulse={isRev} style="background: {color};"></span>
									<span class="mps-dot-core" style="background: {color};"></span>
								</span>
							{:else}
								<span class="mps-dot" style="background: {color};"></span>
							{/if}
						{/each}
					</span>
				{:else}
					<span class="mps-dot" style="background: {selectedColor};"></span>
				{/if}
				<span class="mps-name-text truncate">{selected || 'Select project'}</span>
				<svg class="mps-name-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
				</svg>
			</button>
		</div>
	</div>

	<!-- Next chevron -->
	<button
		type="button"
		class="mps-chevron"
		aria-label="Next project"
		disabled={projects.length < 2}
		onclick={() => go(1)}
	>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<path d="M9 18l6-6-6-6" />
		</svg>
	</button>
</div>

<!-- Mobile dropdown: server + switch project + search -->
{#if showDropdown}
	<div
		bind:this={dropdownEl}
		class="mps-panel"
		role="menu"
		aria-label="Project menu"
		style="--mps-color: {selectedColor}"
	>
		<!-- Server section -->
		{#if effectiveServerConfig}
			<div class="mps-section">
				<div class="mps-section-label">Server</div>
				<div class="mps-server-row">
					<div class="mps-server-info">
						<span class="mps-server-dot" class:mps-server-dot-running={serverIsRunning}></span>
						<span class="mps-server-port">:{effectiveServerConfig.port}</span>
						<span class="mps-server-status">{serverIsRunning ? 'Running' : 'Stopped'}</span>
					</div>
					<div class="mps-server-actions">
						{#if serverLoading}
							<span class="loading loading-spinner loading-xs" style="color: oklch(0.65 0.02 250);"></span>
						{:else if serverIsRunning}
							<button type="button" class="mps-server-btn" onclick={handleServerOpenBrowser} aria-label="Open in browser">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
							</button>
							<button type="button" class="mps-server-btn" onclick={handleServerRestart} aria-label="Restart server">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
							</button>
							<button type="button" class="mps-server-btn mps-server-btn-danger" onclick={handleServerStop} aria-label="Stop server">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" /></svg>
							</button>
						{:else}
							<button type="button" class="mps-server-btn mps-server-btn-success" onclick={handleServerStart} aria-label="Start server">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>
							</button>
						{/if}
					</div>
				</div>
				{#if serverError}
					<div class="mps-server-error">{serverError}</div>
				{/if}
			</div>
		{/if}

		<!-- Switch project -->
		{#if projects.length > 1}
			<div class="mps-section">
				<div class="mps-section-label">Switch project</div>
				<ul class="mps-project-list" role="none">
					{#each projects as p (p)}
						{@const isCurrent = p === selected}
						<li role="none">
							<button
								type="button"
								class="mps-project-row"
								class:mps-project-row-current={isCurrent}
								class:mps-kbd-focus={kbdFocusedProject === p}
								data-project={p}
								onclick={() => handleProjectTap(p)}
								role="menuitem"
							>
								<span class="mps-project-dot" style="background: {getColor(p)};"></span>
								<span class="mps-project-name truncate">{p}</span>
								{#if isCurrent}
									<svg class="mps-project-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-label="Current project">
										<path d="M4.5 12.75l6 6 9-13.5" />
									</svg>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<!-- Search / commands footer -->
		{#if onOpenSearch}
			<button type="button" class="mps-search-row" onclick={handleSearchTap} role="menuitem">
				<svg class="mps-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<circle cx="11" cy="11" r="7" />
					<path d="M21 21l-4.3-4.3" />
				</svg>
				<span class="mps-search-label">Search &amp; commands</span>
				<span class="mps-search-kbd">⌘K</span>
			</button>
		{/if}
	</div>
{/if}
</div>

<style>
	.mps-live {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
	}

	.mps-wrap {
		position: relative;
		width: 100%;
	}

	.mps-bar {
		display: flex;
		align-items: center;
		height: 44px;
		padding: 0 0.25rem;
		touch-action: pan-y;
		user-select: none;
		-webkit-user-select: none;
		position: relative;
	}

	.mps-chevron {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		height: 44px;
		background: transparent;
		border: none;
		cursor: pointer;
		color: oklch(0.55 0.04 250);
		transition: color 0.15s, background 0.15s;
		border-radius: 0.5rem;
		flex-shrink: 0;
	}
	.mps-chevron:hover:not(:disabled) {
		color: var(--mps-color);
		background: color-mix(in oklch, var(--mps-color) 10%, transparent);
	}
	.mps-chevron:active:not(:disabled) {
		background: color-mix(in oklch, var(--mps-color) 18%, transparent);
	}
	.mps-chevron:disabled {
		opacity: 0.25;
		cursor: not-allowed;
	}
	.mps-chevron svg {
		width: 18px;
		height: 18px;
	}

	.mps-center {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
		overflow: visible;
		position: relative;
	}

	/* Project name button — matches desktop chip-group language */
	.mps-name-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.3rem 0.625rem;
		border-radius: 0.375rem;
		border: 1px solid color-mix(in oklch, var(--mps-color) 62%, transparent);
		background: color-mix(in oklch, var(--mps-color) 30%, transparent);
		box-shadow: 0 0 14px color-mix(in oklch, var(--mps-color) 28%, transparent), 0 0 4px color-mix(in oklch, var(--mps-color) 12%, transparent);
		cursor: pointer;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		color: var(--mps-color);
		max-width: 16rem;
		transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
		-webkit-tap-highlight-color: transparent;
		/* Ensure touch target is at least 44px tall via line-height */
		min-height: 2rem;
	}
	.mps-name-btn:hover, .mps-name-btn:focus-visible {
		background: color-mix(in oklch, var(--mps-color) 38%, transparent);
		border-color: color-mix(in oklch, var(--mps-color) 75%, transparent);
		box-shadow: 0 0 18px color-mix(in oklch, var(--mps-color) 38%, transparent), 0 0 6px color-mix(in oklch, var(--mps-color) 18%, transparent);
		outline: none;
	}
	.mps-name-btn:active {
		background: color-mix(in oklch, var(--mps-color) 42%, transparent);
	}
	/* Session state dots — mirrors ProjectSelector chip-dot pattern */
	.mps-dots {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		flex-shrink: 0;
	}

	.mps-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.mps-dot-animated {
		position: relative;
		display: inline-flex;
		width: 0.5rem;
		height: 0.5rem;
		flex-shrink: 0;
		overflow: hidden;
	}

	.mps-dot-ping {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		opacity: 0.75;
	}

	.mps-dot-core {
		position: relative;
		display: inline-flex;
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}
	.mps-name-text {
		flex: 1;
		min-width: 0;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}
	.mps-name-chevron {
		width: 11px;
		height: 11px;
		flex-shrink: 0;
		opacity: 0.5;
	}

	.mps-label-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: transform 0.05s linear;
		will-change: transform;
	}

	/* Peek label — shows adjacent project name during swipe */
	.mps-peek {
		position: absolute;
		font-size: 0.6875rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		color: var(--peek-color, oklch(0.65 0.10 250));
		opacity: 0.7;
		white-space: nowrap;
		pointer-events: none;
		transition: opacity 0.1s;
	}
	.mps-peek-right {
		right: calc(100% + 0.75rem);
	}
	.mps-peek-left {
		left: calc(100% + 0.75rem);
	}

@media (prefers-reduced-motion: reduce) {
		.mps-label-wrap {
			transition: none;
		}
		.mps-panel {
			animation: none;
		}
	}

	/* ── Mobile dropdown panel ──────────────────────────────────────────────
	   Anchored below the bar, width-capped for thumb reach. Three sections:
	   Server (primary reason for the dropdown), Switch project, Search. */
	.mps-panel {
		position: absolute;
		left: 50%;
		top: calc(100% + 6px);
		transform: translateX(-50%);
		z-index: 50;
		width: min(360px, 92vw);
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.625rem;
		box-shadow: 0 10px 40px oklch(0 0 0 / 0.45);
		animation: mps-panel-in 0.14s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		font-family: ui-monospace, monospace;
		overflow: hidden;
	}

	@keyframes mps-panel-in {
		from { opacity: 0; transform: translate(-50%, -6px); }
		to   { opacity: 1; transform: translate(-50%, 0); }
	}

	.mps-section {
		padding: 0.5rem 0.5rem 0.375rem;
	}
	.mps-section + .mps-section {
		border-top: 1px solid oklch(0.24 0.02 250);
	}

	.mps-section-label {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: oklch(0.52 0.02 250);
		padding: 0.125rem 0.5rem 0.3rem;
	}

	/* Server row (mirrors ProjectSelector's dropdown-server-row pattern) */
	.mps-server-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		border-radius: 0.375rem;
	}
	.mps-server-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}
	.mps-server-dot {
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 50%;
		background: oklch(0.45 0.02 250);
		flex-shrink: 0;
	}
	.mps-server-dot-running {
		background: oklch(0.70 0.18 145);
		box-shadow: 0 0 4px oklch(0.70 0.18 145);
	}
	.mps-server-port {
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.75rem;
		color: oklch(0.75 0.02 250);
	}
	.mps-server-status {
		font-size: 0.6875rem;
		color: oklch(0.55 0.02 250);
	}
	.mps-server-actions {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		flex-shrink: 0;
	}
	.mps-server-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.875rem;
		height: 1.875rem;
		padding: 0;
		background: oklch(0.22 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.375rem;
		color: oklch(0.65 0.02 250);
		cursor: pointer;
		transition: background 0.12s, color 0.12s, border-color 0.12s;
		-webkit-tap-highlight-color: transparent;
	}
	.mps-server-btn svg {
		width: 0.95rem;
		height: 0.95rem;
	}
	.mps-server-btn:hover,
	.mps-server-btn:active {
		background: oklch(0.28 0.03 250);
		color: oklch(0.88 0.02 250);
		border-color: oklch(0.36 0.02 250);
	}
	.mps-server-btn:focus,
	.mps-server-btn:global(.mps-kbd-focus) {
		outline: none;
		box-shadow: 0 0 0 2px oklch(0.65 0.14 220 / 0.8);
	}
	.mps-server-btn-success {
		border-color: oklch(0.42 0.12 145 / 0.55);
		color: oklch(0.68 0.14 145);
	}
	.mps-server-btn-success:hover,
	.mps-server-btn-success:active {
		background: oklch(0.28 0.08 145 / 0.3);
		color: oklch(0.82 0.16 145);
	}
	.mps-server-btn-danger {
		border-color: oklch(0.42 0.10 30 / 0.55);
		color: oklch(0.68 0.12 30);
	}
	.mps-server-btn-danger:hover,
	.mps-server-btn-danger:active {
		background: oklch(0.28 0.08 30 / 0.3);
		color: oklch(0.82 0.16 30);
	}
	.mps-server-error {
		margin: 0.25rem 0.5rem 0;
		padding: 0.25rem 0.5rem;
		font-size: 0.6875rem;
		color: oklch(0.75 0.15 30);
		background: oklch(0.22 0.05 30 / 0.2);
		border-radius: 0.25rem;
	}

	/* Project list */
	.mps-project-list {
		list-style: none;
		margin: 0;
		padding: 0;
		max-height: 50vh;
		overflow-y: auto;
	}
	.mps-project-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.45rem 0.5rem;
		background: transparent;
		border: none;
		border-radius: 0.375rem;
		color: oklch(0.82 0.02 250);
		font-family: ui-monospace, monospace;
		font-size: 0.8125rem;
		cursor: pointer;
		text-align: left;
		transition: background 0.12s;
		-webkit-tap-highlight-color: transparent;
	}
	.mps-project-row:hover,
	.mps-project-row:active {
		background: oklch(0.22 0.02 250);
	}
	.mps-project-row.mps-kbd-focus {
		outline: none;
		background: oklch(0.26 0.04 250);
		box-shadow: inset 0 0 0 1.5px oklch(0.65 0.14 220 / 0.8);
	}
	.mps-project-row:focus { outline: none; }
	.mps-project-row-current {
		background: oklch(0.22 0.03 250);
		color: oklch(0.92 0.02 250);
	}
	.mps-project-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.mps-project-name {
		flex: 1;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.mps-project-check {
		width: 0.875rem;
		height: 0.875rem;
		color: oklch(0.70 0.15 145);
		flex-shrink: 0;
	}

	/* Search footer */
	.mps-search-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.625rem 0.75rem;
		background: oklch(0.18 0.02 250);
		border: none;
		border-top: 1px solid oklch(0.24 0.02 250);
		color: oklch(0.70 0.02 250);
		font-family: ui-monospace, monospace;
		font-size: 0.75rem;
		cursor: pointer;
		transition: background 0.12s, color 0.12s;
		-webkit-tap-highlight-color: transparent;
	}
	.mps-search-row:hover,
	.mps-search-row:active {
		background: oklch(0.22 0.03 250);
		color: oklch(0.88 0.02 250);
	}
	.mps-search-row:focus,
	.mps-search-row:global(.mps-kbd-focus) {
		outline: none;
		background: oklch(0.26 0.04 250);
		color: oklch(0.92 0.02 250);
		box-shadow: inset 0 0 0 1.5px oklch(0.65 0.14 220 / 0.8);
	}
	.mps-search-icon {
		width: 0.9rem;
		height: 0.9rem;
		flex-shrink: 0;
		opacity: 0.75;
	}
	.mps-search-label {
		flex: 1;
		text-align: left;
	}
	.mps-search-kbd {
		font-size: 0.6875rem;
		padding: 0.0625rem 0.3rem;
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.60 0.02 250);
		background: oklch(0.14 0.01 250);
	}
</style>
