<script lang="ts">
	/**
	 * ProjectsTableSkeleton Component
	 * Shows animated placeholder rows for the projects table on /servers page
	 */

	interface Props {
		/** Number of skeleton rows */
		rows?: number;
	}

	let { rows = 6 }: Props = $props();

	// Varying name widths for natural look
	const nameWidths = ['w-24', 'w-32', 'w-28', 'w-20', 'w-36', 'w-26'];
</script>

<!-- Projects Table Skeleton - Industrial theme -->
<div
	class="h-full"
	style="
		background: linear-gradient(180deg, oklch(0.18 0.01 250) 0%, oklch(0.16 0.01 250) 100%);
	"
>
	<table class="table table-sm w-full">
		<!-- Table Header -->
		<thead
			class="sticky top-0 z-10"
			style="
				background: linear-gradient(180deg, oklch(0.22 0.01 250) 0%, oklch(0.20 0.01 250) 100%);
				border-bottom: 1px solid oklch(0.35 0.02 250);
			"
		>
			<tr>
				<th class="w-10">
					<div class="skeleton h-4 w-4 rounded" style="background: oklch(0.30 0.01 250);"></div>
				</th>
				<th class="w-36">
					<div class="skeleton h-4 w-16 rounded" style="background: oklch(0.30 0.01 250);"></div>
				</th>
				<th>
					<div class="skeleton h-4 w-20 rounded" style="background: oklch(0.30 0.01 250);"></div>
				</th>
				<th class="w-20">
					<div class="skeleton h-4 w-10 rounded" style="background: oklch(0.30 0.01 250);"></div>
				</th>
				<th class="w-24">
					<div class="skeleton h-4 w-14 rounded" style="background: oklch(0.30 0.01 250);"></div>
				</th>
				<th class="w-20">
					<div class="skeleton h-4 w-10 rounded" style="background: oklch(0.30 0.01 250);"></div>
				</th>
				<th class="w-20">
					<div class="skeleton h-4 w-12 rounded" style="background: oklch(0.30 0.01 250);"></div>
				</th>
			</tr>
		</thead>

		<!-- Table Body -->
		<tbody>
			{#each Array(rows) as _, i}
				<tr
					class="border-b"
					style="
						border-color: oklch(0.25 0.01 250);
						animation: pulse 1.5s ease-in-out infinite;
						animation-delay: {i * 100}ms;
					"
				>
					<!-- Visibility toggle -->
					<td>
						<div class="skeleton h-5 w-5 rounded" style="background: oklch(0.25 0.01 250);"></div>
					</td>

					<!-- Project name -->
					<td>
						<div class="flex items-center gap-2">
							<div class="skeleton h-3 w-3 rounded-full" style="background: oklch(0.35 0.02 250);"></div>
							<div class="skeleton h-4 {nameWidths[i % nameWidths.length]} rounded" style="background: oklch(0.28 0.02 250);"></div>
						</div>
					</td>

					<!-- Description -->
					<td>
						<div
							class="skeleton h-4 rounded"
							style="
								background: oklch(0.25 0.01 250);
								width: {[60, 80, 45, 70, 55, 75][i % 6]}%;
							"
						></div>
					</td>

					<!-- Port -->
					<td>
						{#if i % 3 !== 0}
							<div class="skeleton h-5 w-12 rounded" style="background: oklch(0.30 0.02 250);"></div>
						{:else}
							<div class="skeleton h-4 w-4 rounded opacity-30" style="background: oklch(0.25 0.01 250);"></div>
						{/if}
					</td>

					<!-- Status badge -->
					<td>
						<div class="skeleton h-6 w-16 rounded-full" style="background: oklch(0.28 0.02 250);"></div>
					</td>

					<!-- Tasks -->
					<td>
						<div class="skeleton h-4 w-10 rounded" style="background: oklch(0.25 0.01 250);"></div>
					</td>

					<!-- Agents -->
					<td>
						<div class="skeleton h-4 w-8 rounded" style="background: oklch(0.25 0.01 250);"></div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
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
