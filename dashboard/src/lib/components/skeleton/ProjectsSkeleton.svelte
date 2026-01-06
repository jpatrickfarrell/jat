<script lang="ts">
	/**
	 * ProjectsSkeleton Component
	 * Shows animated placeholder cards for the /projects page during initial load.
	 * Mimics the card-based layout with color accent bars, details grid, and status badges.
	 */

	interface Props {
		/** Number of project card placeholders */
		cards?: number;
	}

	let { cards = 4 }: Props = $props();

	// Varying widths for natural look
	const nameWidths = ['w-28', 'w-36', 'w-24', 'w-32'];
	const pathWidths = ['w-44', 'w-52', 'w-40', 'w-48'];
	// Some cards show port, some don't
	const hasPort = [true, false, true, true];
</script>

<!-- Projects Page Skeleton - Card content only (header is in parent page) -->
<div class="space-y-4">
	{#each Array(cards) as _, i}
		<div
			class="card bg-base-100 shadow-md border border-base-300 relative overflow-hidden"
			style="animation: shimmer 1.5s ease-in-out infinite; animation-delay: {i * 100}ms;"
		>
			<!-- Color accent bar placeholder -->
			<div
				class="absolute left-0 top-0 bottom-0 w-1 skeleton"
				style="background: oklch(0.55 0.12 {200 + i * 40});"
			></div>

			<div class="card-body p-5 pl-6">
				<!-- Header Row -->
				<div class="flex items-start justify-between gap-4">
					<div class="flex items-center gap-3">
						<!-- Color indicator dot -->
						<div
							class="skeleton w-4 h-4 rounded-full"
							style="background: oklch(0.55 0.12 {200 + i * 40});"
						></div>
						<!-- Project name -->
						<div class="skeleton h-5 {nameWidths[i % nameWidths.length]} rounded bg-base-content/12"></div>
					</div>
					<!-- Action buttons -->
					<div class="flex items-center gap-2">
						<div class="skeleton h-8 w-12 rounded bg-base-content/10"></div>
						<div class="skeleton h-8 w-12 rounded bg-base-content/8"></div>
					</div>
				</div>

				<!-- Details grid -->
				<div class="mt-3 grid grid-cols-2 gap-x-8 gap-y-2">
					<!-- Path row -->
					<div class="flex items-center gap-2">
						<div class="skeleton h-2.5 w-8 rounded bg-base-content/10"></div>
						<div class="skeleton h-3 {pathWidths[i % pathWidths.length]} rounded bg-base-content/12"></div>
					</div>
					<!-- Port row (some cards) -->
					{#if hasPort[i % hasPort.length]}
						<div class="flex items-center gap-2">
							<div class="skeleton h-2.5 w-8 rounded bg-base-content/10"></div>
							<div class="skeleton h-3 w-12 rounded bg-base-content/12"></div>
						</div>
					{/if}
				</div>

				<!-- Status badges row -->
				<div class="mt-4 flex flex-wrap gap-2">
					<div class="skeleton h-5 w-16 rounded-full bg-base-content/10"></div>
					<div class="skeleton h-5 w-20 rounded-full bg-base-content/10"></div>
					<div class="skeleton h-5 w-24 rounded-full bg-base-content/10"></div>
					<div class="skeleton h-5 w-16 rounded-full bg-base-content/10"></div>
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	@keyframes shimmer {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}
</style>
