<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import SetupProgress from '$lib/components/onboarding/SetupProgress.svelte';
	import PrerequisiteChecks from '$lib/components/onboarding/PrerequisiteChecks.svelte';
	import FirstTaskPrompt from '$lib/components/onboarding/FirstTaskPrompt.svelte';
	import { openProjectDrawer, projectCreatedSignal } from '$lib/stores/drawerStore';
	import {
		getPrerequisiteResults,
		setPrerequisiteResults,
		isCacheValid,
		skipSetup,
		type PrerequisiteResult
	} from '$lib/stores/onboardingStore.svelte';

	let currentStep = $state(1);
	let checks = $state<PrerequisiteResult[] | null>(null);
	let loading = $state(true);
	let hasProjects = $state(false);
	let hasTasks = $state(false);
	let firstProject = $state<string | null>(null);

	// Watch for project creation signal from CreateProjectDrawer
	$effect(() => {
		const unsubscribe = projectCreatedSignal.subscribe(() => {
			// Refresh project list when a project is created
			checkProjects();
		});
		return unsubscribe;
	});

	// Advance step when projects exist
	$effect(() => {
		if (hasProjects && currentStep < 3) {
			currentStep = 3;
		}
	});

	async function loadPrerequisites() {
		// Use cache if valid
		const cached = getPrerequisiteResults();
		if (cached && isCacheValid()) {
			checks = cached;
			loading = false;
			currentStep = 2;
			return;
		}

		loading = true;
		try {
			const response = await fetch('/api/setup/check');
			const data = await response.json();
			checks = data.checks;
			setPrerequisiteResults(data.checks);
		} catch {
			checks = null;
		} finally {
			loading = false;
			// Auto-advance past prerequisites (informational step)
			if (currentStep === 1) currentStep = 2;
		}
	}

	async function checkProjects() {
		try {
			const response = await fetch('/api/projects?visible=true');
			const data = await response.json();
			const projects = data.projects || [];
			hasProjects = projects.length > 0;
			firstProject = projects[0]?.name || null;

			if (hasProjects) {
				currentStep = 3;
				// Also check for tasks
				checkTasks();
			}
		} catch {
			hasProjects = false;
		}
	}

	async function checkTasks() {
		try {
			const response = await fetch('/api/tasks?status=open&limit=1');
			const data = await response.json();
			hasTasks = (data.tasks || []).length > 0;
		} catch {
			hasTasks = false;
		}
	}

	function handleAddProject() {
		openProjectDrawer();
	}

	function handleSkip() {
		skipSetup();
		goto('/tasks', { replaceState: true });
	}

	function handleGoToTasks() {
		goto('/tasks', { replaceState: true });
	}

	onMount(() => {
		loadPrerequisites();
		checkProjects();
	});

	// Derived: all done = has projects + has tasks
	const allDone = $derived(hasProjects && hasTasks);
</script>

<svelte:head>
	<title>Setup - JAT IDE</title>
</svelte:head>

<div
	class="min-h-full flex items-start justify-center py-8 px-4"
	style="background: linear-gradient(180deg, oklch(0.16 0.01 250) 0%, oklch(0.14 0.01 250) 100%);"
>
	<div class="w-full max-w-xl space-y-8">
		<!-- Header -->
		<div class="text-center space-y-2">
			<div class="flex justify-center mb-4">
				<div
					class="px-3 py-2 rounded-lg font-mono font-bold text-xl tracking-widest"
					style="
						background: linear-gradient(135deg, oklch(0.70 0.18 240 / 0.15) 0%, oklch(0.70 0.18 240 / 0.05) 100%);
						border: 1px solid oklch(0.70 0.18 240 / 0.3);
						color: oklch(0.75 0.16 240);
						text-shadow: 0 0 15px oklch(0.70 0.18 240 / 0.5);
					"
				>
					JAT
				</div>
			</div>
			<h1 class="text-2xl font-bold font-mono" style="color: oklch(0.85 0.02 250);">
				Welcome to JAT IDE
			</h1>
			<p class="text-sm" style="color: oklch(0.55 0.02 250);">
				Your multi-agent development command center
			</p>
		</div>

		<!-- Progress Stepper -->
		<SetupProgress {currentStep} />

		<!-- All Done State -->
		{#if allDone}
			<div
				class="rounded-xl p-6 text-center space-y-4"
				style="
					background: linear-gradient(135deg, oklch(0.20 0.06 145 / 0.2) 0%, oklch(0.18 0.04 145 / 0.1) 100%);
					border: 1px solid oklch(0.40 0.12 145 / 0.3);
				"
			>
				<div
					class="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
					style="background: oklch(0.40 0.15 145); box-shadow: 0 0 20px oklch(0.50 0.18 145 / 0.3);"
				>
					<svg class="w-7 h-7" style="color: oklch(0.95 0.02 250);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<h2 class="text-lg font-bold font-mono" style="color: oklch(0.80 0.08 145);">
					All Set!
				</h2>
				<p class="text-sm" style="color: oklch(0.60 0.04 145);">
					Your project is configured and ready to go.
				</p>
				<button
					class="btn font-mono"
					style="
						background: linear-gradient(135deg, oklch(0.40 0.15 145) 0%, oklch(0.35 0.12 145) 100%);
						border: 1px solid oklch(0.55 0.18 145 / 0.5);
						color: oklch(0.95 0.02 250);
					"
					onclick={handleGoToTasks}
				>
					Go to Tasks
					<svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
					</svg>
				</button>
			</div>
		{:else}
			<!-- Step 1: Prerequisites -->
			<div
				class="rounded-xl p-5 space-y-1 transition-opacity duration-300"
				style="
					background: oklch(0.18 0.01 250);
					border: 1px solid {currentStep === 1 ? 'oklch(0.45 0.12 240 / 0.4)' : 'oklch(0.30 0.02 250)'};
					opacity: {currentStep >= 1 ? 1 : 0.5};
				"
			>
				<div class="flex items-center gap-2 mb-3">
					<span
						class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono"
						style="background: oklch(0.30 0.10 240); color: oklch(0.80 0.12 240);"
					>1</span>
					<h2 class="text-sm font-semibold font-mono uppercase tracking-wider" style="color: oklch(0.70 0.02 250);">
						Prerequisites
					</h2>
				</div>
				<PrerequisiteChecks {checks} {loading} onRecheck={loadPrerequisites} />
			</div>

			<!-- Step 2: Add Project -->
			<div
				class="rounded-xl p-5 space-y-4 transition-opacity duration-300"
				style="
					background: oklch(0.18 0.01 250);
					border: 1px solid {currentStep === 2 ? 'oklch(0.45 0.12 240 / 0.4)' : 'oklch(0.30 0.02 250)'};
					opacity: {currentStep >= 2 ? 1 : 0.4};
				"
			>
				<div class="flex items-center gap-2">
					<span
						class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono"
						style="background: {hasProjects ? 'oklch(0.35 0.15 145)' : 'oklch(0.30 0.10 240)'}; color: {hasProjects ? 'oklch(0.90 0.02 250)' : 'oklch(0.80 0.12 240)'};"
					>
						{#if hasProjects}
							<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						{:else}
							2
						{/if}
					</span>
					<h2 class="text-sm font-semibold font-mono uppercase tracking-wider" style="color: oklch(0.70 0.02 250);">
						Add Your First Project
					</h2>
				</div>

				{#if hasProjects}
					<div
						class="flex items-center gap-2 px-3 py-2 rounded-lg"
						style="background: oklch(0.20 0.06 145 / 0.1); border: 1px solid oklch(0.40 0.12 145 / 0.3);"
					>
						<svg class="w-4 h-4" style="color: oklch(0.65 0.18 145);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span class="text-xs font-mono" style="color: oklch(0.70 0.12 145);">
							Project added: <span class="font-bold">{firstProject}</span>
						</span>
					</div>
				{:else}
					<p class="text-sm" style="color: oklch(0.60 0.02 250);">
						JAT tracks tasks using Beads &mdash; a lightweight, git-friendly task system.
						Add a project from <code class="px-1 py-0.5 rounded text-xs" style="background: oklch(0.22 0.01 250);">~/code/</code> to get started.
					</p>

					<button
						class="btn w-full font-mono"
						style="
							background: linear-gradient(135deg, oklch(0.35 0.12 145) 0%, oklch(0.28 0.10 145) 100%);
							border: 1px solid oklch(0.50 0.15 145 / 0.5);
							color: oklch(0.95 0.02 250);
						"
						onclick={handleAddProject}
						disabled={currentStep < 2}
					>
						<svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
						</svg>
						Add Project
					</button>

					<p class="text-[11px] font-mono text-center" style="color: oklch(0.45 0.02 250);">
						Or from terminal: <code class="px-1 py-0.5 rounded" style="background: oklch(0.22 0.01 250);">cd ~/code/project && bd init</code>
					</p>
				{/if}
			</div>

			<!-- Step 3: First Task -->
			<div
				class="rounded-xl p-5 space-y-4 transition-opacity duration-300"
				style="
					background: oklch(0.18 0.01 250);
					border: 1px solid {currentStep === 3 ? 'oklch(0.45 0.12 240 / 0.4)' : 'oklch(0.30 0.02 250)'};
					opacity: {currentStep >= 3 ? 1 : 0.4};
				"
			>
				<div class="flex items-center gap-2">
					<span
						class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono"
						style="background: {hasTasks ? 'oklch(0.35 0.15 145)' : 'oklch(0.30 0.10 240)'}; color: {hasTasks ? 'oklch(0.90 0.02 250)' : 'oklch(0.80 0.12 240)'};"
					>
						{#if hasTasks}
							<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						{:else}
							3
						{/if}
					</span>
					<h2 class="text-sm font-semibold font-mono uppercase tracking-wider" style="color: oklch(0.70 0.02 250);">
						Create Your First Task
					</h2>
				</div>

				{#if hasTasks}
					<div
						class="flex items-center gap-2 px-3 py-2 rounded-lg"
						style="background: oklch(0.20 0.06 145 / 0.1); border: 1px solid oklch(0.40 0.12 145 / 0.3);"
					>
						<svg class="w-4 h-4" style="color: oklch(0.65 0.18 145);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span class="text-xs font-mono" style="color: oklch(0.70 0.12 145);">
							Tasks created! You're ready to start.
						</span>
					</div>
					<button
						class="btn w-full font-mono"
						style="
							background: linear-gradient(135deg, oklch(0.40 0.15 145) 0%, oklch(0.35 0.12 145) 100%);
							border: 1px solid oklch(0.55 0.18 145 / 0.5);
							color: oklch(0.95 0.02 250);
						"
						onclick={handleGoToTasks}
					>
						Go to Tasks
						<svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
						</svg>
					</button>
				{:else}
					<FirstTaskPrompt project={firstProject} disabled={currentStep < 3} />
				{/if}
			</div>
		{/if}

		<!-- Skip link -->
		{#if !allDone}
			<div class="text-center">
				<button
					class="text-xs font-mono transition-colors hover:underline"
					style="color: oklch(0.45 0.02 250);"
					onclick={handleSkip}
				>
					Skip setup &mdash; I'll configure things manually
				</button>
			</div>
		{/if}
	</div>
</div>
