<script lang="ts">
	/**
	 * KanbanSkeleton Component
	 * Shows animated placeholder kanban columns during initial load
	 */

	interface Props {
		/** Number of columns to show */
		columns?: number;
		/** Cards per column */
		cardsPerColumn?: number;
	}

	let { columns = 4, cardsPerColumn = 3 }: Props = $props();

	// Column configs for visual variety
	const columnColors = [
		{ accent: 'oklch(0.75 0.18 200)', label: 'STARTING' },
		{ accent: 'oklch(0.75 0.20 45)', label: 'WORKING' },
		{ accent: 'oklch(0.70 0.20 280)', label: 'NEEDS INPUT' },
		{ accent: 'oklch(0.70 0.18 180)', label: 'REVIEW' },
	];
</script>

<!-- Kanban Skeleton -->
<div class="flex-1 overflow-hidden">
	<div class="flex gap-4 h-full p-4 overflow-x-auto" style="background: oklch(0.14 0.01 250);">
		{#each Array(columns) as _, colIndex}
			{@const config = columnColors[colIndex % columnColors.length]}
			<!-- Column Skeleton -->
			<div
				class="flex-shrink-0 w-72 flex flex-col rounded-lg overflow-hidden"
				style="
					background: oklch(0.16 0.01 250);
					border: 1px solid oklch(0.30 0.02 250);
					animation: fadeIn 0.3s ease-out;
					animation-delay: {colIndex * 100}ms;
					animation-fill-mode: both;
				"
			>
				<!-- Column Header -->
				<div
					class="flex items-center gap-2 px-3 py-2"
					style="
						background: linear-gradient(180deg, oklch(0.20 0.01 250) 0%, oklch(0.18 0.01 250) 100%);
						border-bottom: 1px solid oklch(0.30 0.02 250);
					"
				>
					<!-- Accent dot -->
					<div
						class="w-2 h-2 rounded-full skeleton"
						style="background: {config.accent};"
					></div>
					<!-- Label skeleton -->
					<div class="skeleton h-4 w-20 rounded" style="background: oklch(0.30 0.02 250);"></div>
					<!-- Count badge -->
					<div class="skeleton h-5 w-6 rounded-full ml-auto" style="background: oklch(0.25 0.01 250);"></div>
				</div>

				<!-- Column Cards -->
				<div class="flex-1 overflow-y-auto p-2 space-y-2">
					{#each Array(cardsPerColumn) as _, cardIndex}
						<!-- Card Skeleton -->
						<div
							class="rounded-lg p-3"
							style="
								background: oklch(0.18 0.01 250);
								border: 1px solid oklch(0.28 0.02 250);
								animation: pulse 1.5s ease-in-out infinite;
								animation-delay: {(colIndex * cardsPerColumn + cardIndex) * 80}ms;
							"
						>
							<!-- Card Header -->
							<div class="flex items-center gap-2 mb-2">
								<div class="skeleton h-6 w-6 rounded-full" style="background: oklch(0.30 0.02 250);"></div>
								<div class="skeleton h-4 w-20 rounded" style="background: oklch(0.28 0.02 250);"></div>
								<div class="skeleton h-5 w-14 rounded-full ml-auto" style="background: oklch(0.25 0.01 250);"></div>
							</div>

							<!-- Task info -->
							<div class="space-y-1.5 mb-2">
								<div class="skeleton h-3 w-16 rounded" style="background: oklch(0.25 0.01 250);"></div>
								<div
									class="skeleton h-4 rounded"
									style="
										background: oklch(0.26 0.01 250);
										width: {[75, 60, 85, 70][cardIndex % 4]}%;
									"
								></div>
							</div>

							<!-- Footer -->
							<div class="flex items-center justify-between pt-2" style="border-top: 1px solid oklch(0.25 0.01 250);">
								<div class="skeleton h-3 w-12 rounded" style="background: oklch(0.25 0.01 250);"></div>
								<div class="skeleton h-3 w-8 rounded" style="background: oklch(0.25 0.01 250);"></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/each}
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
