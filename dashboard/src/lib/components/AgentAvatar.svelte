<script lang="ts">
	/**
	 * AgentAvatar Component
	 * Displays agent avatar (SVG) or fallback initials
	 *
	 * Features:
	 * - Fetches SVG from /api/avatar/{name}
	 * - Caches results to avoid refetching on re-renders
	 * - Fallback to initials with hash-based background color
	 * - Uses oklch color space for theme consistency
	 * - Handles loading, success, and error states
	 */

	interface Props {
		name: string;
		size?: number;
		class?: string;
	}

	let {
		name,
		size = 32,
		class: className = ''
	}: Props = $props();

	let loadState: 'loading' | 'success' | 'error' = $state('loading');
	let svgContent: string | null = $state(null);

	// Cache for avatar SVGs (module-level to persist across instances)
	const avatarCache = new Map<string, string>();

	// Track the last fetched name to avoid redundant fetches
	let lastFetchedName: string | null = null;

	// Fetch avatar only when name actually changes
	async function fetchAvatar(agentName: string) {
		if (!agentName) {
			loadState = 'error';
			return;
		}

		// Skip if we already fetched this name
		if (lastFetchedName === agentName && loadState !== 'loading') {
			return;
		}

		// Check cache first
		const cached = avatarCache.get(agentName);
		if (cached) {
			svgContent = cached;
			loadState = 'success';
			lastFetchedName = agentName;
			return;
		}

		loadState = 'loading';
		svgContent = null;

		try {
			const response = await fetch(`/api/avatar/${encodeURIComponent(agentName)}`);
			if (response.ok) {
				const svg = await response.text();
				avatarCache.set(agentName, svg);
				svgContent = svg;
				loadState = 'success';
			} else {
				loadState = 'error';
			}
		} catch {
			loadState = 'error';
		}

		lastFetchedName = agentName;
	}

	// React to name changes only
	$effect(() => {
		const currentName = name;
		if (currentName !== lastFetchedName) {
			fetchAvatar(currentName);
		}
	});
</script>

<div
	class="inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 {className}"
	style="width: {size}px; height: {size}px;"
>
	{#if loadState === 'loading'}
		<!-- Loading skeleton -->
		<div
			class="w-full h-full animate-pulse"
			style="background: oklch(0.30 0.02 250);"
		></div>
	{:else if loadState === 'success' && svgContent}
		<!-- SVG avatar -->
		<div
			class="w-full h-full"
			style="background: oklch(0.15 0.01 250);"
		>
			{@html svgContent}
		</div>
	{:else}
		<!-- Fallback: generic avatar icon -->
		<div
			class="w-full h-full flex items-center justify-center"
			style="background: oklch(0.25 0.02 250);"
		>
			<svg
				viewBox="0 0 24 24"
				fill="currentColor"
				class="text-base-content/50"
				style="width: {size * 0.65}px; height: {size * 0.65}px;"
			>
				<path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd" />
			</svg>
		</div>
	{/if}
</div>

<style>
	/* Ensure SVG scales to fill container */
	div :global(svg) {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
