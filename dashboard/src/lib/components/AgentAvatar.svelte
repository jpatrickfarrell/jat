<script lang="ts">
	/**
	 * AgentAvatar Component
	 * Displays agent avatar (SVG) or fallback initials
	 *
	 * Features:
	 * - Fetches SVG from /api/avatar/{name}
	 * - Fallback to initials with hash-based background color
	 * - Uses oklch color space for theme consistency
	 * - Handles loading, success, and error states
	 */

	import { onMount } from 'svelte';

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

	// Generate initials from agent name (e.g., BlueStream -> BS, DarkBay -> DB)
	function getInitials(agentName: string): string {
		if (!agentName) return '??';
		// Split on capital letters to get words
		const words = agentName.replace(/([a-z])([A-Z])/g, '$1 $2').split(' ');
		if (words.length >= 2) {
			return (words[0][0] + words[1][0]).toUpperCase();
		}
		return agentName.slice(0, 2).toUpperCase();
	}

	// Generate consistent background color from name hash
	function getBgColor(agentName: string): string {
		if (!agentName) return 'oklch(0.50 0.10 250)';
		// Simple hash function
		let hash = 0;
		for (let i = 0; i < agentName.length; i++) {
			hash = ((hash << 5) - hash) + agentName.charCodeAt(i);
			hash = hash & hash; // Convert to 32bit integer
		}
		// Map hash to hue (0-360)
		const hue = Math.abs(hash) % 360;
		// Use oklch for consistent lightness/chroma
		return `oklch(0.55 0.15 ${hue})`;
	}

	const initials = $derived(getInitials(name));
	const bgColor = $derived(getBgColor(name));

	// Fetch avatar on mount
	onMount(async () => {
		if (!name) {
			loadState = 'error';
			return;
		}

		try {
			const response = await fetch(`/api/avatar/${encodeURIComponent(name)}`);
			if (response.ok) {
				svgContent = await response.text();
				loadState = 'success';
			} else {
				loadState = 'error';
			}
		} catch {
			loadState = 'error';
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
		<!-- Fallback: initials with colored background -->
		<div
			class="w-full h-full flex items-center justify-center font-bold text-white"
			style="background: {bgColor}; font-size: {size * 0.4}px;"
		>
			{initials}
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
