<script lang="ts">
	/**
	 * HistorySkeleton Component
	 * Shows skeleton loading state for the Task History page
	 * Matches the layout: stats cluster + activity graph + day groups
	 */

	interface Props {
		/** Number of day groups to show */
		dayGroups?: number;
		/** Number of tasks per day group */
		tasksPerGroup?: number;
	}

	let { dayGroups = 3, tasksPerGroup = 4 }: Props = $props();
</script>

<!-- History Page Skeleton - Theme-aware (no padding - parent provides it) -->
<div>
	<!-- Stats Row - Stats + Graph -->
	<div class="grid grid-cols-[auto_1fr] lg:grid-cols-[auto_auto_1fr] gap-3 items-stretch mb-6">
		<!-- Left: Title (lg+ only) -->
		<div class="mr-10 hidden lg:flex flex-col justify-center pr-2">
			<div class="skeleton h-6 w-28 rounded bg-base-content/15"></div>
			<div class="skeleton h-4 w-24 rounded bg-base-content/10 mt-1"></div>
		</div>

		<!-- Stats cluster - 2x2 grid -->
		<div class="grid grid-cols-2 gap-2">
			<!-- Streak card (prominent) -->
			<div class="bg-base-100 border border-base-300 rounded-lg p-2 flex items-center justify-center gap-2 min-w-20">
				<div class="skeleton h-6 w-6 rounded-full bg-warning/30"></div>
				<div class="flex flex-col items-center">
					<div class="skeleton h-6 w-10 rounded bg-base-content/20"></div>
					<div class="skeleton h-3 w-14 rounded bg-base-content/10 mt-1"></div>
				</div>
			</div>
			<!-- Today card -->
			<div class="bg-base-100 border border-base-300 rounded-lg p-2 flex items-center justify-center">
				<div class="flex flex-col items-center">
					<div class="skeleton h-6 w-8 rounded bg-warning/20"></div>
					<div class="skeleton h-3 w-10 rounded bg-base-content/10 mt-1"></div>
				</div>
			</div>
			<!-- Best streak card -->
			<div class="bg-base-100 border border-base-300 rounded-lg p-2 flex items-center justify-center">
				<div class="flex flex-col items-center">
					<div class="skeleton h-6 w-8 rounded bg-base-content/15"></div>
					<div class="skeleton h-3 w-16 rounded bg-base-content/10 mt-1"></div>
				</div>
			</div>
			<!-- Avg/day card -->
			<div class="bg-base-100 border border-base-300 rounded-lg p-2 flex items-center justify-center">
				<div class="flex flex-col items-center">
					<div class="skeleton h-6 w-10 rounded bg-base-content/15"></div>
					<div class="skeleton h-3 w-12 rounded bg-base-content/10 mt-1"></div>
				</div>
			</div>
		</div>

		<!-- Right: Activity Graph skeleton -->
		<div class="bg-base-100 border border-base-300 rounded-lg p-2 flex items-center justify-center overflow-hidden">
			<div class="flex gap-0.5">
				{#each Array(16) as _, weekIdx}
					<div class="flex flex-col gap-0.5" style="animation: fadeIn 0.3s ease-out; animation-delay: {weekIdx * 30}ms; animation-fill-mode: both;">
						{#each Array(7) as _, dayIdx}
							{@const brightness = Math.random()}
							<div
								class="w-2.5 h-2.5 rounded-sm skeleton"
								style="opacity: {0.15 + brightness * 0.35};"
							></div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Filters Bar skeleton -->
	<div class="flex items-center gap-3 mb-4 p-3 bg-base-100 border border-base-300 rounded-lg">
		<div class="skeleton h-8 w-48 rounded bg-base-content/10"></div>
		<div class="skeleton h-8 w-32 rounded bg-base-content/10"></div>
	</div>

	<!-- Day Groups skeleton -->
	<div class="flex flex-col gap-4">
		{#each Array(dayGroups) as _, groupIdx}
			<div
				class="bg-base-100 border border-base-300 rounded-lg overflow-hidden"
				style="animation: fadeIn 0.4s ease-out; animation-delay: {groupIdx * 150}ms; animation-fill-mode: both;"
			>
				<!-- Day header -->
				<div class="flex items-center gap-3 px-4 py-3 bg-base-200 border-b border-base-300">
					<div class="skeleton h-4 w-20 rounded bg-base-content/20"></div>
					<div class="skeleton h-5 w-16 rounded-full bg-base-content/10"></div>
				</div>
				<!-- Task items -->
				<div class="flex flex-col">
					{#each Array(tasksPerGroup) as _, taskIdx}
						<div
							class="flex items-center gap-3 px-4 py-2.5 border-b border-base-300/60 last:border-b-0"
							style="animation: fadeIn 0.3s ease-out; animation-delay: {groupIdx * 150 + taskIdx * 50}ms; animation-fill-mode: both;"
						>
							<!-- Priority indicator -->
							<div class="skeleton w-1 h-7 rounded bg-base-content/20"></div>
							<!-- Task info -->
							<div class="flex-1 flex flex-col gap-1">
								<div class="skeleton h-4 rounded bg-base-content/15" style="width: {60 + Math.random() * 30}%;"></div>
								<div class="flex items-center gap-2">
									<div class="skeleton h-3 w-16 rounded bg-info/20"></div>
									<div class="skeleton h-3 w-20 rounded bg-success/15"></div>
									<div class="skeleton h-3 w-12 rounded bg-base-content/10 ml-auto"></div>
								</div>
							</div>
							<!-- Arrow icon -->
							<div class="skeleton h-4 w-4 rounded bg-base-content/10"></div>
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
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
