<script lang="ts">
	/**
	 * TriageSkeleton Component
	 * Shows animated placeholder for the triage/dispatch page
	 * Matches the mission control aesthetic with section groupings
	 */

	interface Props {
		/** Number of cards to show */
		cards?: number;
	}

	let { cards = 4 }: Props = $props();
</script>

<!-- Triage Skeleton - Mission Control Theme -->
<div
	class="min-h-screen relative overflow-hidden"
	style="
		background: linear-gradient(135deg, oklch(0.13 0.02 260) 0%, oklch(0.10 0.015 250) 50%, oklch(0.12 0.02 240) 100%);
		font-family: 'JetBrains Mono', monospace;
	"
>
	<!-- Subtle grid overlay -->
	<div
		class="absolute inset-0 pointer-events-none opacity-[0.03]"
		style="
			background-image:
				linear-gradient(oklch(0.7 0.1 240) 1px, transparent 1px),
				linear-gradient(90deg, oklch(0.7 0.1 240) 1px, transparent 1px);
			background-size: 40px 40px;
		"
	></div>

	<div class="relative z-10 p-6 max-w-7xl mx-auto">
		<!-- Header Skeleton -->
		<header class="mb-8">
			<div class="flex items-center justify-between">
				<div>
					<div class="skeleton h-8 w-48 rounded mb-2" style="background: oklch(0.25 0.02 250);"></div>
					<div class="skeleton h-4 w-36 rounded" style="background: oklch(0.20 0.01 250);"></div>
				</div>

				<!-- Status indicator skeleton -->
				<div
					class="flex items-center gap-3 px-4 py-2 rounded-lg"
					style="
						background: oklch(0.15 0.02 250);
						border: 1px solid oklch(0.25 0.02 250);
					"
				>
					<div
						class="w-3 h-3 rounded-full skeleton"
						style="background: oklch(0.50 0.10 240);"
					></div>
					<div class="skeleton h-4 w-20 rounded" style="background: oklch(0.25 0.02 250);"></div>
				</div>
			</div>
		</header>

		<!-- Needs Input Section Skeleton -->
		<section class="mb-8">
			<div class="flex items-center gap-3 mb-4">
				<div
					class="w-2 h-8 rounded-full"
					style="background: linear-gradient(180deg, oklch(0.75 0.20 45), oklch(0.60 0.18 40));"
				></div>
				<div class="skeleton h-5 w-28 rounded" style="background: oklch(0.30 0.05 45);"></div>
				<div class="skeleton h-5 w-6 rounded-full" style="background: oklch(0.25 0.03 45);"></div>
			</div>

			<div class="grid gap-4">
				{#each Array(Math.ceil(cards / 2)) as _, i}
					<!-- Card Skeleton -->
					<div
						class="group relative rounded-xl overflow-hidden"
						style="
							background: linear-gradient(135deg, oklch(0.18 0.03 45 / 0.4) 0%, oklch(0.15 0.02 40 / 0.3) 100%);
							border: 1px solid oklch(0.40 0.12 45 / 0.5);
							animation: fadeIn 0.3s ease-out;
							animation-delay: {i * 100}ms;
							animation-fill-mode: both;
						"
					>
						<!-- Accent bar -->
						<div
							class="absolute left-0 top-0 bottom-0 w-1"
							style="background: linear-gradient(180deg, oklch(0.80 0.22 50), oklch(0.65 0.18 40));"
						></div>

						<div class="p-5 pl-6">
							<!-- Header row -->
							<div class="flex items-start justify-between mb-3">
								<div class="flex items-center gap-3">
									<div class="skeleton w-2.5 h-2.5 rounded-full" style="background: oklch(0.60 0.15 45);"></div>
									<div class="skeleton h-5 w-24 rounded" style="background: oklch(0.28 0.02 250);"></div>
									<div class="skeleton h-5 w-16 rounded" style="background: oklch(0.25 0.02 250);"></div>
								</div>
								<div class="skeleton h-6 w-20 rounded" style="background: oklch(0.25 0.03 45);"></div>
							</div>

							<!-- Task title -->
							<div class="skeleton h-4 w-3/4 rounded mb-3" style="background: oklch(0.25 0.01 250);"></div>

							<!-- Question excerpt -->
							<div
								class="p-3 rounded-lg"
								style="
									background: oklch(0.12 0.02 250 / 0.8);
									border-left: 2px solid oklch(0.70 0.18 45 / 0.5);
								"
							>
								<div class="skeleton h-4 w-full rounded mb-2" style="background: oklch(0.22 0.01 250);"></div>
								<div class="skeleton h-4 w-2/3 rounded" style="background: oklch(0.22 0.01 250);"></div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Ready for Review Section Skeleton -->
		<section class="mb-8">
			<div class="flex items-center gap-3 mb-4">
				<div
					class="w-2 h-8 rounded-full"
					style="background: linear-gradient(180deg, oklch(0.80 0.18 85), oklch(0.65 0.15 80));"
				></div>
				<div class="skeleton h-5 w-36 rounded" style="background: oklch(0.30 0.04 85);"></div>
				<div class="skeleton h-5 w-6 rounded-full" style="background: oklch(0.25 0.03 85);"></div>
			</div>

			<div class="grid gap-4">
				{#each Array(Math.floor(cards / 2)) as _, i}
					<!-- Card Skeleton -->
					<div
						class="group relative rounded-xl overflow-hidden"
						style="
							background: linear-gradient(135deg, oklch(0.18 0.03 85 / 0.3) 0%, oklch(0.15 0.02 80 / 0.2) 100%);
							border: 1px solid oklch(0.45 0.12 85 / 0.4);
							animation: fadeIn 0.3s ease-out;
							animation-delay: {(i + 2) * 100}ms;
							animation-fill-mode: both;
						"
					>
						<!-- Accent bar -->
						<div
							class="absolute left-0 top-0 bottom-0 w-1"
							style="background: linear-gradient(180deg, oklch(0.85 0.20 90), oklch(0.70 0.16 80));"
						></div>

						<div class="p-5 pl-6">
							<!-- Header row -->
							<div class="flex items-start justify-between mb-3">
								<div class="flex items-center gap-3">
									<span class="text-lg">🔍</span>
									<div class="skeleton h-5 w-24 rounded" style="background: oklch(0.28 0.02 250);"></div>
									<div class="skeleton h-5 w-16 rounded" style="background: oklch(0.25 0.02 250);"></div>
								</div>
								<div class="skeleton h-6 w-18 rounded" style="background: oklch(0.25 0.03 85);"></div>
							</div>

							<!-- Task title -->
							<div class="skeleton h-4 w-2/3 rounded mb-3" style="background: oklch(0.25 0.01 250);"></div>

							<!-- Changes summary -->
							<div
								class="p-3 rounded-lg"
								style="
									background: oklch(0.12 0.02 250 / 0.8);
									border-left: 2px solid oklch(0.70 0.14 85 / 0.5);
								"
							>
								<div class="skeleton h-4 w-full rounded mb-2" style="background: oklch(0.22 0.01 250);"></div>
								<div class="skeleton h-4 w-1/2 rounded" style="background: oklch(0.22 0.01 250);"></div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Working Section Skeleton (collapsed) -->
		<section class="mt-8">
			<div class="flex items-center gap-3 mb-4">
				<div
					class="w-2 h-6 rounded-full"
					style="background: oklch(0.55 0.12 240);"
				></div>
				<div class="skeleton h-4 w-32 rounded" style="background: oklch(0.25 0.02 250);"></div>
				<div class="skeleton h-5 w-6 rounded-full" style="background: oklch(0.22 0.01 250);"></div>
				<div class="skeleton w-4 h-4 rounded" style="background: oklch(0.20 0.01 250);"></div>
			</div>
		</section>

		<!-- Center loading indicator -->
		<div class="flex items-center justify-center mt-8">
			<div class="flex flex-col items-center gap-3">
				<div
					class="w-8 h-8 rounded-full border-2 animate-spin"
					style="border-color: oklch(0.70 0.15 240); border-top-color: transparent;"
				></div>
				<span class="text-sm" style="color: oklch(0.50 0.02 250);">Scanning sessions...</span>
			</div>
		</div>
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
