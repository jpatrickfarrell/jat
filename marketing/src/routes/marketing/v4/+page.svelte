<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import AgenticPanhandle from '$lib/components/AgenticPanhandle.svelte';
	import { scrollReveal } from '$lib/utils/scrollObserver';
</script>

<svelte:head>
	<title>JAT - The Agentic Flywheel</title>
</svelte:head>

<Nav />

<!-- HERO -->
<section class="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-[var(--bg-base)]">
	<div class="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent"></div>

	<div class="relative z-10 max-w-5xl mx-auto px-6 text-center">
		<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary)]/10 backdrop-blur border border-[var(--color-primary)]/30 mb-8">
			<span class="relative flex h-2 w-2">
				<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-success)] opacity-75"></span>
				<span class="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-success)]"></span>
			</span>
			<span class="text-sm text-[var(--color-primary)]">The Secret Sauce</span>
		</div>

		<h1 class="text-5xl md:text-7xl font-bold text-white mb-6">
			Other IDEs Spin Up Agents.
			<span class="pb-2 block bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-cyan-400 bg-clip-text text-transparent">
				JAT Keeps Them Going.
			</span>
		</h1>

		<p class="text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
			Most tools give you a single agent that finishes and stops. JAT runs a <strong class="text-white">perpetual flywheel</strong> where completed work suggests new work, and agents keep shipping.
		</p>

		<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
			<a href="#flywheel" class="group relative px-8 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full font-semibold text-white shadow-lg shadow-[var(--color-primary)]/25 hover:shadow-[var(--color-primary)]/40 transition-all">
				<span class="relative z-10">See the Flywheel</span>
			</a>
			<a href="/" class="px-8 py-4 rounded-full font-semibold border border-white/20 text-white hover:bg-white/10 transition-all">
				Back to Main
			</a>
		</div>
	</div>
</section>

<!-- THE PROBLEM WITH OTHER TOOLS -->
<section class="py-24 bg-gradient-to-b from-[var(--bg-base)] to-gray-900">
	<div class="max-w-5xl mx-auto px-6">
		<div class="text-center mb-16" use:scrollReveal>
			<h2 class="text-3xl md:text-4xl font-bold text-white mb-4">The One-Shot Problem</h2>
			<p class="text-gray-400 text-lg max-w-2xl mx-auto">
				Every other AI coding tool works the same way: you give it a task, it works, it finishes, it stops.
			</p>
		</div>

		<div class="grid md:grid-cols-2 gap-8">
			<!-- Other tools -->
			<div class="p-8 rounded-2xl bg-gray-900/50 border border-gray-800">
				<h3 class="text-sm font-mono text-red-400/80 mb-6 flex items-center gap-2">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
					</svg>
					OTHER AI CODING TOOLS
				</h3>
				<div class="space-y-4">
					<div class="flex items-start gap-3">
						<div class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-sm font-bold">1</div>
						<div>
							<div class="text-white font-medium">You assign a task</div>
							<div class="text-sm text-gray-500">"Add user authentication"</div>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-sm font-bold">2</div>
						<div>
							<div class="text-white font-medium">Agent works on it</div>
							<div class="text-sm text-gray-500">Writes code, makes commits</div>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 text-sm font-bold">3</div>
						<div>
							<div class="text-red-400 font-medium">Agent stops. Done.</div>
							<div class="text-sm text-gray-500">You manually assign the next task.</div>
						</div>
					</div>
				</div>
				<div class="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
					<p class="text-sm text-red-400/80">
						Every single task requires your intervention to start the next one.
					</p>
				</div>
			</div>

			<!-- JAT -->
			<div class="p-8 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-cyan-500/10 border border-[var(--color-primary)]/30">
				<h3 class="text-sm font-mono text-[var(--color-success)] mb-6 flex items-center gap-2">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
					</svg>
					JAT AGENTIC IDE
				</h3>
				<div class="space-y-4">
					<div class="flex items-start gap-3">
						<div class="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/50 flex items-center justify-center text-[var(--color-primary)] text-sm font-bold">1</div>
						<div>
							<div class="text-white font-medium">You define an epic</div>
							<div class="text-sm text-gray-400">"Build user authentication system"</div>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/50 flex items-center justify-center text-[var(--color-primary)] text-sm font-bold">2</div>
						<div>
							<div class="text-white font-medium">20+ agents swarm it</div>
							<div class="text-sm text-gray-400">Pick tasks, work in parallel</div>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="w-8 h-8 rounded-full bg-[var(--color-success)]/20 border border-[var(--color-success)]/50 flex items-center justify-center text-[var(--color-success)] text-sm font-bold">3</div>
						<div>
							<div class="text-[var(--color-success)] font-medium">Completed work suggests new work</div>
							<div class="text-sm text-gray-400">Agent finishes OAuth, suggests "Add MFA"</div>
						</div>
					</div>
					<div class="flex items-start gap-3">
						<div class="w-8 h-8 rounded-full bg-[var(--color-secondary)]/20 border border-[var(--color-secondary)]/50 flex items-center justify-center text-[var(--color-secondary)] text-sm font-bold animate-pulse">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
							</svg>
						</div>
						<div>
							<div class="text-[var(--color-secondary)] font-medium">The flywheel keeps spinning</div>
							<div class="text-sm text-gray-400">New tasks feed back to agents</div>
						</div>
					</div>
				</div>
				<div class="mt-6 p-4 rounded-lg bg-[var(--color-success)]/10 border border-[var(--color-success)]/20">
					<p class="text-sm text-[var(--color-success)]">
						You supervise. Agents ship. The wheel keeps turning.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- THE FLYWHEEL VISUALIZATION -->
<section id="flywheel" class="py-24 bg-[var(--bg-base)]">
	<div class="max-w-7xl mx-auto px-6">
		<div class="text-center mb-12" use:scrollReveal>
			<h2 class="text-3xl md:text-4xl font-bold mb-4">
				<span class="text-white">The Agentic</span>
				<span class="text-[var(--color-primary)]">Flywheel</span>
			</h2>
			<p class="text-gray-400 text-lg max-w-2xl mx-auto">
				Steps 1-2-3 are one-time setup. Steps 3-9 loop forever.
			</p>
		</div>

		<AgenticPanhandle
			showControls={true}
			showCenterContent={true}
			stepDuration={5000}
			autoPlay={true}
			waitForScroll={true}
		/>
	</div>
</section>

<!-- HOW IT WORKS -->
<section class="py-24 bg-gradient-to-b from-[var(--bg-base)] to-gray-900">
	<div class="max-w-5xl mx-auto px-6">
		<div class="text-center mb-16" use:scrollReveal>
			<h2 class="text-3xl md:text-4xl font-bold text-white mb-4">The Two Phases</h2>
			<p class="text-gray-400 text-lg max-w-2xl mx-auto">
				Entry ramp gets you started. The loop keeps you shipping.
			</p>
		</div>

		<div class="grid md:grid-cols-2 gap-8">
			<!-- Entry Phase -->
			<div class="p-8 rounded-2xl bg-gray-900/50 border border-gray-700">
				<div class="text-xs font-mono text-gray-500 mb-2">ENTRY PHASE (once)</div>
				<h3 class="text-2xl font-bold text-white mb-6">The Ramp</h3>
				<div class="space-y-6">
					<div class="flex items-start gap-4">
						<div class="w-10 h-10 rounded-full bg-sky-500/20 border-2 border-sky-500 flex items-center justify-center text-sky-400 font-bold text-sm flex-shrink-0">1</div>
						<div>
							<div class="font-medium text-sky-400 mb-1">PLAN</div>
							<div class="text-sm text-gray-400">Write a PRD or describe what you want. The AI helps structure it.</div>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="w-10 h-10 rounded-full bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center text-cyan-400 font-bold text-sm flex-shrink-0">2</div>
						<div>
							<div class="font-medium text-cyan-400 mb-1">BEAD</div>
							<div class="text-sm text-gray-400">Run <code class="text-xs bg-gray-800 px-1.5 py-0.5 rounded">/jat:bead</code> to generate a dependency tree of tasks.</div>
						</div>
					</div>
					<div class="flex items-start gap-4">
						<div class="w-10 h-10 rounded-full bg-teal-500/20 border-2 border-teal-500 flex items-center justify-center text-teal-400 font-bold text-sm flex-shrink-0">3</div>
						<div>
							<div class="font-medium text-teal-400 mb-1">SWARM</div>
							<div class="text-sm text-gray-400">Launch <code class="text-xs bg-gray-800 px-1.5 py-0.5 rounded">jat myproject 20</code> and agents claim work automatically.</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Loop Phase -->
			<div class="p-8 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 to-cyan-500/10 border border-[var(--color-primary)]/30">
				<div class="text-xs font-mono text-[var(--color-primary)] mb-2">LOOP PHASE (forever)</div>
				<h3 class="text-2xl font-bold text-white mb-6">The Flywheel</h3>
				<div class="space-y-4 text-sm">
					<div class="flex items-center gap-3">
						<span class="text-emerald-400 font-medium">4. WORKING</span>
						<span class="text-gray-600">-</span>
						<span class="text-gray-400">Agents code in parallel</span>
					</div>
					<div class="flex items-center gap-3">
						<span class="text-lime-400 font-medium">5. INPUT</span>
						<span class="text-gray-600">-</span>
						<span class="text-gray-400">Questions surface to dashboard</span>
					</div>
					<div class="flex items-center gap-3">
						<span class="text-yellow-400 font-medium">6. REVIEW</span>
						<span class="text-gray-600">-</span>
						<span class="text-gray-400">You approve with one click</span>
					</div>
					<div class="flex items-center gap-3">
						<span class="text-green-400 font-medium">7. COMPLETE</span>
						<span class="text-gray-600">-</span>
						<span class="text-gray-400">Tasks ship and close</span>
					</div>
					<div class="flex items-center gap-3">
						<span class="text-orange-400 font-medium">8. AUTO</span>
						<span class="text-gray-600">-</span>
						<span class="text-gray-400">Low-priority work proceeds without you</span>
					</div>
					<div class="flex items-center gap-3">
						<span class="text-pink-400 font-medium">9. SUGGEST</span>
						<span class="text-gray-600">-</span>
						<span class="text-gray-400">New tasks generated from completions</span>
					</div>
				</div>
				<div class="mt-6 pt-6 border-t border-gray-700 text-center">
					<p class="text-sm text-[var(--color-primary)]">
						Step 9 feeds back to Step 3. <span class="text-white font-medium">The cycle never ends.</span>
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- THE MATH -->
<section class="py-24 bg-gray-900">
	<div class="max-w-4xl mx-auto px-6 text-center">
		<h2 class="text-3xl md:text-4xl font-bold text-white mb-12">The Numbers</h2>

		<div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
			<div class="p-6 rounded-2xl bg-gray-800/50 border border-gray-700">
				<div class="text-4xl font-bold text-[var(--color-primary)] mb-2">20+</div>
				<div class="text-sm text-gray-400">Parallel Agents</div>
			</div>
			<div class="p-6 rounded-2xl bg-gray-800/50 border border-gray-700">
				<div class="text-4xl font-bold text-[var(--color-secondary)] mb-2">24/7</div>
				<div class="text-sm text-gray-400">Continuous Shipping</div>
			</div>
			<div class="p-6 rounded-2xl bg-gray-800/50 border border-gray-700">
				<div class="text-4xl font-bold text-cyan-400 mb-2">1</div>
				<div class="text-sm text-gray-400">Dashboard</div>
			</div>
			<div class="p-6 rounded-2xl bg-gray-800/50 border border-gray-700">
				<div class="text-4xl font-bold text-emerald-400 mb-2">0</div>
				<div class="text-sm text-gray-400">Manual Restarts</div>
			</div>
		</div>

		<p class="text-xl text-gray-300 max-w-2xl mx-auto">
			While other tools give you <span class="text-white">one agent that stops</span>, JAT gives you a <span class="text-[var(--color-primary)]">swarm that never sleeps</span>.
		</p>
	</div>
</section>

<!-- CTA -->
<section class="py-24 bg-gradient-to-b from-gray-900 to-[var(--bg-base)]">
	<div class="max-w-3xl mx-auto px-6 text-center">
		<h2 class="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Start the Flywheel?</h2>
		<p class="text-gray-400 text-lg mb-10">
			Stop babysitting agents. Start shipping at scale.
		</p>

		<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
			<a href="/#install" class="group relative px-8 py-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full font-semibold text-white shadow-lg shadow-[var(--color-primary)]/25 hover:shadow-[var(--color-primary)]/40 transition-all">
				Get Started Free
			</a>
			<a href="/flywheel/v4" class="px-8 py-4 rounded-full font-semibold border border-white/20 text-white hover:bg-white/10 transition-all">
				Explore the Flywheel
			</a>
		</div>
	</div>
</section>

<Footer />
