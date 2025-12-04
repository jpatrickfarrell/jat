<script lang="ts">
	/**
	 * TimelineSkeleton Component
	 * Shows animated placeholder for the timeline/gantt visualization
	 */

	interface Props {
		/** Number of task bars */
		tasks?: number;
	}

	let { tasks = 8 }: Props = $props();

	// Varying task bar widths for visual variety
	const taskWidths = [60, 40, 75, 55, 45, 70, 35, 65];
	const taskOffsets = [5, 25, 10, 40, 20, 15, 50, 30];

	// Pre-computed dot colors for variety
	const dotColors = [
		'oklch(0.35 0.05 200)',
		'oklch(0.45 0.10 230)',
		'oklch(0.55 0.15 260)',
		'oklch(0.40 0.08 290)',
		'oklch(0.50 0.12 320)',
		'oklch(0.35 0.05 200)',
		'oklch(0.45 0.10 230)',
		'oklch(0.55 0.15 260)',
	];

	// Pre-computed bar colors for variety
	const barColors = [
		'oklch(0.30 0.05 220)',
		'oklch(0.35 0.08 240)',
		'oklch(0.40 0.11 260)',
		'oklch(0.45 0.08 280)',
		'oklch(0.30 0.05 300)',
		'oklch(0.35 0.08 220)',
		'oklch(0.40 0.11 240)',
		'oklch(0.45 0.08 260)',
	];
</script>

<!-- Timeline Skeleton -->
<div class="min-h-screen" style="background: oklch(0.14 0.01 250);">
	<!-- Filter Bar Skeleton -->
	<div
		class="p-4"
		style="
			background: oklch(0.16 0.01 250);
			border-bottom: 1px solid oklch(0.30 0.02 250);
		"
	>
		<div class="flex flex-wrap items-center gap-4">
			<!-- Priority filter -->
			<div class="form-control">
				<div class="skeleton h-4 w-14 rounded mb-1" style="background: oklch(0.25 0.01 250);"></div>
				<div class="skeleton h-8 w-32 rounded" style="background: oklch(0.22 0.02 250);"></div>
			</div>
			<!-- Status filter -->
			<div class="form-control">
				<div class="skeleton h-4 w-12 rounded mb-1" style="background: oklch(0.25 0.01 250);"></div>
				<div class="skeleton h-8 w-28 rounded" style="background: oklch(0.22 0.02 250);"></div>
			</div>
			<!-- Search -->
			<div class="form-control">
				<div class="skeleton h-4 w-12 rounded mb-1" style="background: oklch(0.25 0.01 250);"></div>
				<div class="skeleton h-8 w-40 rounded" style="background: oklch(0.22 0.02 250);"></div>
			</div>
		</div>
	</div>

	<!-- Gantt Chart Skeleton -->
	<div class="p-4">
		<div
			class="rounded-lg overflow-hidden"
			style="
				background: oklch(0.16 0.01 250);
				border: 1px solid oklch(0.30 0.02 250);
			"
		>
			<!-- Header row (time columns) -->
			<div
				class="flex items-center gap-2 px-4 py-3"
				style="
					background: oklch(0.20 0.01 250);
					border-bottom: 1px solid oklch(0.30 0.02 250);
				"
			>
				<div class="w-48 flex-shrink-0">
					<div class="skeleton h-4 w-20 rounded" style="background: oklch(0.30 0.02 250);"></div>
				</div>
				<div class="flex-1 flex justify-between">
					{#each Array(6) as _, i}
						<div
							class="skeleton h-4 w-12 rounded"
							style="background: oklch(0.28 0.01 250);"
						></div>
					{/each}
				</div>
			</div>

			<!-- Task rows -->
			<div class="divide-y" style="--tw-divide-opacity: 0.3; border-color: oklch(0.25 0.01 250);">
				{#each Array(tasks) as _, i}
					<div
						class="flex items-center gap-2 px-4 py-3"
						style="
							animation: pulse 1.5s ease-in-out infinite;
							animation-delay: {i * 100}ms;
						"
					>
						<!-- Task name column -->
						<div class="w-48 flex-shrink-0 flex items-center gap-2">
							<!-- Priority dot -->
							<div
								class="skeleton w-2 h-2 rounded-full"
								style="background: {dotColors[i % dotColors.length]};"
							></div>
							<!-- Task ID -->
							<div
								class="skeleton h-4 rounded"
								style="
									background: oklch(0.28 0.02 250);
									width: {[60, 72, 56, 68, 64, 76, 52, 70][i % 8]}px;
								"
							></div>
						</div>

						<!-- Gantt bar area -->
						<div class="flex-1 relative h-6">
							<!-- Grid lines (subtle) -->
							<div class="absolute inset-0 flex justify-between opacity-20">
								{#each Array(6) as _}
									<div class="w-px h-full" style="background: oklch(0.40 0.02 250);"></div>
								{/each}
							</div>

							<!-- Task bar -->
							<div
								class="absolute top-1 h-4 rounded skeleton"
								style="
									left: {taskOffsets[i % taskOffsets.length]}%;
									width: {taskWidths[i % taskWidths.length]}%;
									background: {barColors[i % barColors.length]};
								"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Center loading indicator -->
		<div class="flex items-center justify-center mt-8">
			<div class="flex flex-col items-center gap-3">
				<div
					class="w-10 h-10 rounded-full border-2 animate-spin"
					style="border-color: oklch(0.50 0.15 240); border-top-color: transparent;"
				></div>
				<span class="text-xs font-mono" style="color: oklch(0.50 0.02 250);">Loading timeline...</span>
			</div>
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
