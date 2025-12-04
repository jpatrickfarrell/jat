<script lang="ts">
	/**
	 * TaskDetailSkeleton Component
	 * Shows animated placeholder for task detail drawer content
	 */
</script>

<!-- Task Detail Skeleton - Industrial theme -->
<div class="flex flex-col gap-6">
	<!-- Labels section -->
	<div>
		<div class="skeleton h-3 w-12 rounded mb-2" style="background: oklch(0.25 0.01 250);"></div>
		<div class="flex gap-2">
			<div class="skeleton h-5 w-16 rounded-full" style="background: oklch(0.22 0.02 250);"></div>
			<div class="skeleton h-5 w-20 rounded-full" style="background: oklch(0.22 0.02 250);"></div>
			<div class="skeleton h-5 w-14 rounded-full" style="background: oklch(0.22 0.02 250);"></div>
		</div>
	</div>

	<!-- Description section -->
	<div>
		<div class="skeleton h-3 w-20 rounded mb-2" style="background: oklch(0.25 0.01 250);"></div>
		<div
			class="p-4 rounded-lg space-y-2"
			style="background: oklch(0.18 0.01 250); border: 1px solid oklch(0.28 0.02 250);"
		>
			<div class="skeleton h-4 w-full rounded" style="background: oklch(0.24 0.01 250);"></div>
			<div class="skeleton h-4 w-4/5 rounded" style="background: oklch(0.24 0.01 250);"></div>
			<div class="skeleton h-4 w-3/5 rounded" style="background: oklch(0.24 0.01 250);"></div>
		</div>
	</div>

	<!-- Metadata grid -->
	<div class="grid grid-cols-2 gap-4">
		<!-- Status -->
		<div>
			<div class="skeleton h-3 w-12 rounded mb-2" style="background: oklch(0.25 0.01 250);"></div>
			<div class="skeleton h-8 w-24 rounded" style="background: oklch(0.22 0.02 250);"></div>
		</div>
		<!-- Priority -->
		<div>
			<div class="skeleton h-3 w-14 rounded mb-2" style="background: oklch(0.25 0.01 250);"></div>
			<div class="skeleton h-8 w-20 rounded" style="background: oklch(0.22 0.02 250);"></div>
		</div>
		<!-- Type -->
		<div>
			<div class="skeleton h-3 w-10 rounded mb-2" style="background: oklch(0.25 0.01 250);"></div>
			<div class="skeleton h-8 w-16 rounded" style="background: oklch(0.22 0.02 250);"></div>
		</div>
		<!-- Assignee -->
		<div>
			<div class="skeleton h-3 w-16 rounded mb-2" style="background: oklch(0.25 0.01 250);"></div>
			<div class="skeleton h-8 w-28 rounded" style="background: oklch(0.22 0.02 250);"></div>
		</div>
	</div>

	<!-- Dependencies section -->
	<div>
		<div class="skeleton h-3 w-24 rounded mb-2" style="background: oklch(0.25 0.01 250);"></div>
		<div
			class="p-3 rounded-lg"
			style="background: oklch(0.18 0.01 250); border: 1px solid oklch(0.28 0.02 250);"
		>
			<div class="flex items-center gap-2 mb-2">
				<div class="skeleton w-3 h-3 rounded-full" style="background: oklch(0.30 0.05 200);"></div>
				<div class="skeleton h-4 w-20 rounded" style="background: oklch(0.24 0.01 250);"></div>
				<div class="skeleton h-5 w-14 rounded-full ml-auto" style="background: oklch(0.22 0.02 250);"></div>
			</div>
			<div class="flex items-center gap-2">
				<div class="skeleton w-3 h-3 rounded-full" style="background: oklch(0.30 0.05 240);"></div>
				<div class="skeleton h-4 w-24 rounded" style="background: oklch(0.24 0.01 250);"></div>
				<div class="skeleton h-5 w-16 rounded-full ml-auto" style="background: oklch(0.22 0.02 250);"></div>
			</div>
		</div>
	</div>

	<!-- History section -->
	<div>
		<div class="skeleton h-3 w-16 rounded mb-2" style="background: oklch(0.25 0.01 250);"></div>
		<div
			class="p-3 rounded-lg space-y-3"
			style="background: oklch(0.18 0.01 250); border: 1px solid oklch(0.28 0.02 250);"
		>
			{#each Array(3) as _, i}
				<div
					class="flex items-start gap-3"
					style="animation: pulse 1.5s ease-in-out infinite; animation-delay: {i * 100}ms;"
				>
					<div class="skeleton w-2 h-2 rounded-full mt-1.5" style="background: oklch(0.35 0.05 240);"></div>
					<div class="flex-1">
						<div class="skeleton h-3 w-32 rounded mb-1" style="background: oklch(0.24 0.01 250);"></div>
						<div class="skeleton h-3 w-20 rounded" style="background: oklch(0.20 0.01 250);"></div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Timestamps -->
	<div class="flex justify-between pt-4" style="border-top: 1px solid oklch(0.25 0.01 250);">
		<div>
			<div class="skeleton h-2 w-14 rounded mb-1" style="background: oklch(0.22 0.01 250);"></div>
			<div class="skeleton h-3 w-24 rounded" style="background: oklch(0.26 0.01 250);"></div>
		</div>
		<div>
			<div class="skeleton h-2 w-14 rounded mb-1" style="background: oklch(0.22 0.01 250);"></div>
			<div class="skeleton h-3 w-20 rounded" style="background: oklch(0.26 0.01 250);"></div>
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
