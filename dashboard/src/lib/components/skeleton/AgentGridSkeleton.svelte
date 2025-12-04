<script lang="ts">
	/**
	 * AgentGridSkeleton Component
	 * Shows animated placeholder cards matching the AgentGrid horizontal scroll layout
	 * Used during initial agent data loading
	 */

	interface Props {
		/** Number of skeleton cards to show */
		cards?: number;
	}

	let { cards = 4 }: Props = $props();
</script>

<!-- Agent Grid Skeleton - Horizontal Scrolling Row - Industrial -->
<div class="flex flex-col h-full">
	<div class="p-4 h-full" style="background: oklch(0.14 0.01 250);">
		<!-- Horizontal Scrolling Row -->
		<div class="flex gap-4 overflow-x-auto pb-2 h-full">
			{#each Array(cards) as _, i}
				<!-- Compact Agent Card Skeleton (matching SessionCard compact mode) -->
				<div
					class="flex-shrink-0 w-72 rounded-lg overflow-hidden"
					style="
						background: linear-gradient(180deg, oklch(0.18 0.01 250) 0%, oklch(0.16 0.01 250) 100%);
						border: 1px solid oklch(0.30 0.02 250);
						animation: fadeIn 0.3s ease-out;
						animation-delay: {i * 80}ms;
						animation-fill-mode: both;
					"
				>
					<!-- Card Header -->
					<div
						class="flex items-center gap-3 px-3 py-2"
						style="
							background: linear-gradient(180deg, oklch(0.22 0.01 250) 0%, oklch(0.20 0.01 250) 100%);
							border-bottom: 1px solid oklch(0.30 0.02 250);
						"
					>
						<!-- Left accent bar -->
						<div class="w-1 h-8 rounded-full skeleton" style="background: oklch(0.30 0.02 250);"></div>

						<!-- Agent avatar skeleton -->
						<div class="skeleton h-8 w-8 rounded-full" style="background: oklch(0.30 0.02 250);"></div>

						<!-- Agent name + task info -->
						<div class="flex-1 min-w-0 space-y-1.5">
							<div
								class="skeleton h-4 rounded"
								style="
									background: oklch(0.30 0.02 250);
									width: {[65, 80, 55, 75][i % 4]}%;
									animation: pulse 1.5s ease-in-out infinite;
									animation-delay: {i * 100}ms;
								"
							></div>
							<div
								class="skeleton h-3 rounded"
								style="
									background: oklch(0.25 0.01 250);
									width: {[45, 60, 50, 40][i % 4]}%;
									animation: pulse 1.5s ease-in-out infinite;
									animation-delay: {i * 100 + 50}ms;
								"
							></div>
						</div>

						<!-- Status badge skeleton -->
						<div class="skeleton h-6 w-16 rounded-full" style="background: oklch(0.30 0.02 250);"></div>
					</div>

					<!-- Card Body - Compact info rows -->
					<div class="px-3 py-2 space-y-2">
						<!-- Task row skeleton -->
						<div class="flex items-center justify-between">
							<div class="skeleton h-3 w-12 rounded" style="background: oklch(0.25 0.01 250);"></div>
							<div class="skeleton h-4 w-24 rounded" style="background: oklch(0.28 0.01 250);"></div>
						</div>

						<!-- Tokens/cost row skeleton -->
						<div class="flex items-center justify-between">
							<div class="skeleton h-3 w-16 rounded" style="background: oklch(0.25 0.01 250);"></div>
							<div class="skeleton h-4 w-14 rounded" style="background: oklch(0.28 0.01 250);"></div>
						</div>
					</div>

					<!-- Card Footer -->
					<div
						class="flex items-center justify-between px-3 py-2"
						style="
							background: linear-gradient(180deg, oklch(0.20 0.01 250) 0%, oklch(0.18 0.01 250) 100%);
							border-top: 1px solid oklch(0.30 0.02 250);
						"
					>
						<!-- Activity indicator -->
						<div class="flex items-center gap-2">
							<div class="skeleton h-3 w-3 rounded-full" style="background: oklch(0.30 0.02 250);"></div>
							<div class="skeleton h-3 w-20 rounded" style="background: oklch(0.25 0.01 250);"></div>
						</div>

						<!-- Action button -->
						<div class="skeleton h-6 w-6 rounded" style="background: oklch(0.30 0.02 250);"></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}
</style>
