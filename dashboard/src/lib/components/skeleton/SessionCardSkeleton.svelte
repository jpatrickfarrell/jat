<script lang="ts">
	/**
	 * SessionCardSkeleton Component
	 * Shows animated placeholder matching the SessionCard structure
	 * Used during initial work session loading
	 */

	interface Props {
		/** Width of the card (matches SessionCard default) */
		width?: string;
	}

	let { width = 'w-96' }: Props = $props();
</script>

<!-- Session Card Skeleton - Industrial theme -->
<div
	class="{width} flex-shrink-0 rounded-lg overflow-hidden"
	style="
		background: linear-gradient(180deg, oklch(0.18 0.01 250) 0%, oklch(0.16 0.01 250) 100%);
		border: 1px solid oklch(0.30 0.02 250);
	"
>
	<!-- Header skeleton -->
	<div
		class="flex items-center gap-3 px-3 py-2"
		style="
			background: linear-gradient(180deg, oklch(0.22 0.01 250) 0%, oklch(0.20 0.01 250) 100%);
			border-bottom: 1px solid oklch(0.30 0.02 250);
		"
	>
		<!-- Status indicator -->
		<div class="skeleton h-2 w-2 rounded-full" style="background: oklch(0.40 0.15 200);"></div>

		<!-- Agent avatar skeleton -->
		<div class="skeleton h-8 w-8 rounded-full" style="background: oklch(0.30 0.02 250);"></div>

		<!-- Agent name + task info -->
		<div class="flex-1 min-w-0 space-y-1">
			<div class="skeleton h-4 w-24 rounded" style="background: oklch(0.30 0.02 250);"></div>
			<div class="skeleton h-3 w-32 rounded" style="background: oklch(0.25 0.01 250);"></div>
		</div>

		<!-- Status badge skeleton -->
		<div class="skeleton h-6 w-20 rounded-full" style="background: oklch(0.30 0.02 250);"></div>
	</div>

	<!-- Terminal output skeleton -->
	<div
		class="h-48 p-3 space-y-2"
		style="background: oklch(0.12 0.01 250);"
	>
		<!-- Fake terminal lines with staggered animation -->
		{#each [1, 2, 3, 4, 5, 6] as line, i}
			<div
				class="flex items-center gap-2"
				style="animation: pulse 1.5s ease-in-out infinite; animation-delay: {i * 100}ms;"
			>
				<!-- Prompt skeleton -->
				<div class="skeleton h-3 w-4 rounded opacity-50" style="background: oklch(0.35 0.02 250);"></div>
				<!-- Line content - varying widths -->
				<div
					class="skeleton h-3 rounded"
					style="
						background: oklch(0.25 0.01 250);
						width: {[70, 45, 85, 30, 60, 50][i % 6]}%;
					"
				></div>
			</div>
		{/each}
	</div>

	<!-- Footer skeleton -->
	<div
		class="flex items-center justify-between px-3 py-2"
		style="
			background: linear-gradient(180deg, oklch(0.20 0.01 250) 0%, oklch(0.18 0.01 250) 100%);
			border-top: 1px solid oklch(0.30 0.02 250);
		"
	>
		<!-- Token count skeleton -->
		<div class="flex items-center gap-2">
			<div class="skeleton h-4 w-4 rounded" style="background: oklch(0.30 0.02 250);"></div>
			<div class="skeleton h-4 w-16 rounded" style="background: oklch(0.25 0.01 250);"></div>
		</div>

		<!-- Action buttons skeleton -->
		<div class="flex items-center gap-2">
			<div class="skeleton h-6 w-6 rounded" style="background: oklch(0.30 0.02 250);"></div>
			<div class="skeleton h-6 w-6 rounded" style="background: oklch(0.30 0.02 250);"></div>
		</div>
	</div>
</div>

<style>
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}
</style>
