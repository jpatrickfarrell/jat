<script lang="ts">
	/**
	 * CreateProjectDrawer Component — Multi-Step Wizard
	 *
	 * 5-step wizard for creating new projects:
	 *   Step 0: Source Selection (local path / git clone / template)
	 *   Step 1: Project Basics (name, key, description)
	 *   Step 2: Dev Config (harness, port, dev command)
	 *   Step 3: Appearance (colors)
	 *   Step 4: Review & Create
	 *
	 * Current implementation has Step 0 fully functional (existing path entry flow).
	 * Steps 1-4 are placeholder shells for sibling tasks to fill in.
	 */

	import { tick } from 'svelte';
	import { isProjectDrawerOpen, closeProjectDrawer, signalProjectCreated } from '$lib/stores/drawerStore';
	import { playSuccessChime, playErrorSound } from '$lib/utils/soundEffects';
	import { invalidateAll, goto } from '$app/navigation';

	// Props
	interface Props {
		onProjectCreated?: () => void;
	}
	let { onProjectCreated }: Props = $props();

	// ─── Wizard Step Definitions ───────────────────────────────────

	const STEPS = [
		{ label: 'Source', icon: '1' },
		{ label: 'Basics', icon: '2' },
		{ label: 'Config', icon: '3' },
		{ label: 'Colors', icon: '4' },
		{ label: 'Review', icon: '5' },
	] as const;

	type SourceType = 'local' | 'git' | 'template' | null;

	interface WizardData {
		// Step 0: Source
		sourceType: SourceType;
		path: string;
		// Step 1: Basics (placeholder)
		projectName: string;
		projectKey: string;
		description: string;
		// Step 2: Dev Config (placeholder)
		harness: string;
		port: number;
		devCommand: string;
		serverPath: string;
		// Step 3: Appearance (placeholder)
		activeColor: string;
		inactiveColor: string;
	}

	// ─── Wizard State ──────────────────────────────────────────────

	let currentStep = $state(0);
	let stepDirection = $state<'forward' | 'backward'>('forward');
	let isAnimating = $state(false);
	let wizardData = $state<WizardData>({
		sourceType: null,
		path: '',
		projectName: '',
		projectKey: '',
		description: '',
		harness: 'claude-code',
		port: 3000,
		devCommand: 'npm run dev',
		serverPath: '/',
		activeColor: '',
		inactiveColor: '',
	});

	const isFirstStep = $derived(currentStep === 0);
	const isLastStep = $derived(currentStep === STEPS.length - 1);

	async function goToStep(step: number) {
		if (step < 0 || step >= STEPS.length || step === currentStep || isAnimating) return;
		stepDirection = step > currentStep ? 'forward' : 'backward';
		isAnimating = true;
		currentStep = step;
		// Allow animation to play
		setTimeout(() => { isAnimating = false; }, 300);
	}

	function nextStep() {
		if (!isStepValid || isLastStep) return;
		// Sync path into wizardData when leaving step 0
		if (currentStep === 0) {
			wizardData.path = pathInput.trim();
			wizardData.sourceType = 'local';
		}
		goToStep(currentStep + 1);
	}

	function prevStep() {
		if (isFirstStep) return;
		goToStep(currentStep - 1);
	}

	// ─── Directory listing types ───────────────────────────────────

	interface DirectoryInfo {
		path: string;
		name: string;
		isGitRepo: boolean;
		hasJat: boolean;
	}

	// ─── Reactive state from store ─────────────────────────────────

	let isOpen = $state(false);

	$effect(() => {
		const unsubscribe = isProjectDrawerOpen.subscribe(value => {
			isOpen = value;
		});
		return unsubscribe;
	});

	// ─── Form state (Step 0: Source Selection) ─────────────────────

	let pathInput = $state('');
	let pathInputRef: HTMLInputElement;

	// Directory browser state
	let directories = $state<DirectoryInfo[]>([]);
	let basePath = $state('');
	let isLoadingDirectories = $state(false);
	let directoryError = $state<string | null>(null);
	let showBrowser = $state(false);

	// Submission state
	let isSubmitting = $state(false);
	let submitError = $state<string | null>(null);
	let successMessage = $state<string | null>(null);
	let createdProjectKey = $state<string | null>(null);
	let creationSteps = $state<string[]>([]);

	// Validation state
	let validationStatus = $state<'idle' | 'checking' | 'valid' | 'invalid' | 'already-initialized' | 'needs-git' | 'will-create'>('idle');
	let validationMessage = $state<string | null>(null);
	let selectedDirectory = $state<DirectoryInfo | null>(null);

	// Step validation: returns true if the current step is valid
	// NOTE: Must be declared after validationStatus and pathInput to avoid TDZ errors during SSR
	const isStepValid = $derived.by(() => {
		switch (currentStep) {
			case 0:
				// Step 0 is valid when we have a path and it's validated
				return (validationStatus === 'valid' || validationStatus === 'already-initialized' || validationStatus === 'will-create') && pathInput.trim() !== '';
			case 1:
				// Placeholder — always valid for now
				return true;
			case 2:
				return true;
			case 3:
				return true;
			case 4:
				return true;
			default:
				return false;
		}
	});

	// New folder creation state
	let showNewFolderInput = $state(false);
	let newFolderName = $state('');
	let isCreatingFolder = $state(false);
	let folderError = $state<string | null>(null);

	// Git initialization state
	let isInitializingGit = $state(false);

	// Auto-focus when drawer opens
	$effect(() => {
		if (isOpen && pathInputRef && currentStep === 0) {
			requestAnimationFrame(() => {
				setTimeout(() => {
					if (pathInputRef && isOpen) {
						pathInputRef.focus();
					}
				}, 200);
			});
		}
	});

	// Load directories when browser is opened
	$effect(() => {
		if (showBrowser && directories.length === 0) {
			loadDirectories();
		}
	});

	// ─── Step 0: Directory/Path functions ──────────────────────────

	async function loadDirectories(path?: string) {
		isLoadingDirectories = true;
		directoryError = null;

		try {
			const url = path ? `/api/directories?path=${encodeURIComponent(path)}` : '/api/directories';
			const response = await fetch(url);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to load directories');
			}

			directories = data.directories || [];
			basePath = data.basePath || '~/code';
		} catch (error) {
			directoryError = error instanceof Error ? error.message : 'Failed to load directories';
			directories = [];
		} finally {
			isLoadingDirectories = false;
		}
	}

	function selectDirectory(dir: DirectoryInfo) {
		pathInput = dir.path;
		selectedDirectory = dir;
		showBrowser = false;

		if (dir.hasJat) {
			validationStatus = 'already-initialized';
			validationMessage = 'JAT already initialized — will add to IDE';
		} else if (!dir.isGitRepo) {
			validationStatus = 'needs-git';
			validationMessage = 'Not a git repository. Initialize git to continue.';
		} else {
			validationStatus = 'valid';
			validationMessage = 'Ready to initialize';
		}
	}

	async function createNewFolder() {
		if (!newFolderName.trim()) {
			folderError = 'Please enter a folder name';
			return;
		}

		const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
		if (invalidChars.test(newFolderName)) {
			folderError = 'Invalid characters in folder name';
			return;
		}

		isCreatingFolder = true;
		folderError = null;

		try {
			const parentPath = basePath || '~/code';
			const newPath = `${parentPath}/${newFolderName.trim()}`;

			const response = await fetch('/api/directories/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ path: newPath })
			});

			const data = await response.json();

			if (!response.ok || data.error) {
				throw new Error(data.error || 'Failed to create folder');
			}

			await loadDirectories(parentPath);

			const newDir = directories.find(d => d.name === newFolderName.trim());
			if (newDir) {
				selectDirectory(newDir);
			} else {
				pathInput = newPath;
				validationStatus = 'needs-git';
				validationMessage = 'Folder created. Initialize git to continue.';
			}

			showNewFolderInput = false;
			newFolderName = '';
		} catch (error) {
			folderError = error instanceof Error ? error.message : 'Failed to create folder';
		} finally {
			isCreatingFolder = false;
		}
	}

	async function initializeGit() {
		if (!pathInput.trim()) return;

		isInitializingGit = true;
		submitError = null;

		try {
			const response = await fetch('/api/directories/git-init', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ path: pathInput.trim() })
			});

			const data = await response.json();

			if (!response.ok || data.error) {
				throw new Error(data.error || 'Failed to initialize git');
			}

			validationStatus = 'valid';
			validationMessage = 'Git initialized! Ready to add project.';

			if (selectedDirectory) {
				selectedDirectory = { ...selectedDirectory, isGitRepo: true };
			}
		} catch (error) {
			submitError = error instanceof Error ? error.message : 'Failed to initialize git';
		} finally {
			isInitializingGit = false;
		}
	}

	async function validatePath() {
		if (!pathInput.trim()) {
			validationStatus = 'idle';
			validationMessage = null;
			selectedDirectory = null;
			return;
		}

		validationStatus = 'checking';
		validationMessage = 'Checking path...';

		const trimmedPath = pathInput.trim();
		let currentValidationStep = 'initial';

		try {
			currentValidationStep = 'fetching path';
			const response = await fetch(
				`/api/directories?path=${encodeURIComponent(trimmedPath)}`,
				{ signal: AbortSignal.timeout(10000) }
			);
			const data = await response.json();

			if (!response.ok || data.error) {
				const homeDir = data.homeDir || '';
				const isUnderHome = trimmedPath.startsWith('~/') ||
					trimmedPath.startsWith(homeDir + '/') ||
					(homeDir && trimmedPath.startsWith(homeDir));

				if (isUnderHome && (data.message?.includes('not found') || data.error?.includes('not found') || response.status === 404)) {
					validationStatus = 'will-create';
					validationMessage = 'Will create directory, initialize git, and set up JAT Tasks';
					selectedDirectory = null;
					return;
				}

				validationStatus = 'invalid';
				validationMessage = data.error || data.message || 'Path not found';
				selectedDirectory = null;
				return;
			}

			const pathParts = trimmedPath.split('/');
			const dirName = pathParts[pathParts.length - 1];
			const parentPath = pathParts.slice(0, -1).join('/') || '/';

			currentValidationStep = 'fetching parent';
			const parentResponse = await fetch(
				`/api/directories?path=${encodeURIComponent(parentPath)}`,
				{ signal: AbortSignal.timeout(10000) }
			);
			const parentData = await parentResponse.json();

			const dirInfo = parentData.directories?.find((d: DirectoryInfo) => d.name === dirName || d.path === trimmedPath);

			if (dirInfo) {
				selectedDirectory = dirInfo;
				if (dirInfo.hasJat) {
					validationStatus = 'already-initialized';
					validationMessage = 'JAT already initialized — will add to IDE';
				} else if (!dirInfo.isGitRepo) {
					validationStatus = 'invalid';
					validationMessage = 'Not a git repository. Run "git init" first.';
				} else {
					validationStatus = 'valid';
					validationMessage = 'Ready to initialize';
				}
			} else {
				validationStatus = 'valid';
				validationMessage = 'Path exists, click Next to continue';
				selectedDirectory = null;
			}
		} catch (err) {
			if (err instanceof Error && err.name === 'TimeoutError') {
				validationStatus = 'invalid';
				validationMessage = `Validation timed out while ${currentValidationStep}. The server may be slow or the path may be on a slow/network drive.`;
			} else {
				validationStatus = 'invalid';
				validationMessage = `Failed to validate path: ${err instanceof Error ? err.message : 'Unknown error'}`;
			}
			selectedDirectory = null;
		}
	}

	let validationTimeout: ReturnType<typeof setTimeout>;
	function handlePathInput() {
		clearTimeout(validationTimeout);
		validationTimeout = setTimeout(validatePath, 500);
	}

	// ─── Submit (final step) ───────────────────────────────────────

	async function handleSubmit(e?: Event) {
		e?.preventDefault();

		const path = wizardData.path || pathInput.trim();
		if (!path) {
			submitError = 'Please enter a path or select a directory';
			return;
		}

		submitError = null;
		successMessage = null;
		isSubmitting = true;

		try {
			const response = await fetch('/api/projects/init', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ path })
			});

			const data = await response.json();

			if (!response.ok || data.error) {
				throw new Error(data.message || 'Failed to initialize project');
			}

			successMessage = data.message || `Successfully added ${data.project?.name}`;
			createdProjectKey = data.project?.name?.toLowerCase() || null;
			creationSteps = data.steps || [];
			playSuccessChime();

			await invalidateAll();
			signalProjectCreated();

			if (onProjectCreated) {
				onProjectCreated();
			}
		} catch (error) {
			submitError = error instanceof Error ? error.message : 'Failed to add project';
			playErrorSound();
		} finally {
			isSubmitting = false;
		}
	}

	// ─── Reset & Close ─────────────────────────────────────────────

	function resetForm() {
		currentStep = 0;
		stepDirection = 'forward';
		isAnimating = false;
		wizardData = {
			sourceType: null,
			path: '',
			projectName: '',
			projectKey: '',
			description: '',
			harness: 'claude-code',
			port: 3000,
			devCommand: 'npm run dev',
			serverPath: '/',
			activeColor: '',
			inactiveColor: '',
		};
		pathInput = '';
		directories = [];
		basePath = '';
		showBrowser = false;
		validationStatus = 'idle';
		validationMessage = null;
		selectedDirectory = null;
		submitError = null;
		successMessage = null;
		createdProjectKey = null;
		creationSteps = [];
		directoryError = null;
		showNewFolderInput = false;
		newFolderName = '';
		isCreatingFolder = false;
		folderError = null;
		isInitializingGit = false;
	}

	function handleClose() {
		if (!isSubmitting) {
			resetForm();
			closeProjectDrawer();
		}
	}

	function getStatusColor(status: typeof validationStatus): string {
		switch (status) {
			case 'valid':
			case 'will-create':
			case 'already-initialized':
				return 'oklch(0.70 0.18 145)';
			case 'invalid':
				return 'oklch(0.65 0.20 25)';
			case 'needs-git':
				return 'oklch(0.70 0.18 85)';
			case 'checking':
				return 'oklch(0.70 0.18 240)';
			default:
				return 'oklch(0.55 0.02 250)';
		}
	}
</script>

<!-- DaisyUI Drawer -->
<div class="drawer drawer-end z-50">
	<input id="create-project-drawer" type="checkbox" class="drawer-toggle" bind:checked={isOpen} />

	<div class="drawer-side">
		<label aria-label="close sidebar" class="drawer-overlay" onclick={handleClose}></label>

		<div
			class="h-full w-full max-w-xl flex flex-col shadow-2xl"
			style="
				background: linear-gradient(180deg, oklch(0.18 0.01 250) 0%, oklch(0.16 0.01 250) 100%);
				border-left: 1px solid oklch(0.35 0.02 250);
			"
			role="dialog"
			aria-labelledby="drawer-title"
		>
			<!-- Header -->
			<div
				class="flex items-center justify-between p-6 relative"
				style="
					background: linear-gradient(180deg, oklch(0.22 0.01 250) 0%, oklch(0.20 0.01 250) 100%);
					border-bottom: 1px solid oklch(0.35 0.02 250);
				"
			>
				<div
					class="absolute left-0 top-0 bottom-0 w-1"
					style="background: linear-gradient(180deg, oklch(0.70 0.18 145) 0%, oklch(0.70 0.18 145 / 0.3) 100%);"
				></div>
				<div class="flex items-center gap-3">
					<div
						class="w-10 h-10 rounded-lg flex items-center justify-center"
						style="background: linear-gradient(135deg, oklch(0.35 0.12 145) 0%, oklch(0.28 0.10 145) 100%); border: 1px solid oklch(0.45 0.15 145 / 0.5);"
					>
						<svg class="w-5 h-5" style="color: oklch(0.90 0.05 145);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
						</svg>
					</div>
					<div>
						<h2 id="drawer-title" class="text-xl font-bold font-mono uppercase tracking-wider" style="color: oklch(0.85 0.02 250);">
							New Project
						</h2>
						<p class="text-sm mt-1" style="color: oklch(0.55 0.02 250);">
							{STEPS[currentStep].label} — Step {currentStep + 1} of {STEPS.length}
						</p>
					</div>
				</div>
				<button
					class="btn btn-sm btn-circle btn-ghost"
					onclick={handleClose}
					disabled={isSubmitting}
					aria-label="Close drawer"
				>
					✕
				</button>
			</div>

			<!-- Step Indicator -->
			<div
				class="px-6 py-4 flex items-center justify-between"
				style="background: oklch(0.17 0.01 250); border-bottom: 1px solid oklch(0.25 0.02 250);"
			>
				{#each STEPS as step, i}
					{@const isCompleted = i < currentStep}
					{@const isCurrent = i === currentStep}
					{@const isUpcoming = i > currentStep}

					{#if i > 0}
						<!-- Connector line -->
						<div
							class="flex-1 h-0.5 mx-1"
							style="background: {isCompleted ? 'oklch(0.70 0.18 145)' : 'oklch(0.30 0.02 250)'};"
						></div>
					{/if}

					<!-- Step dot -->
					<button
						type="button"
						class="flex flex-col items-center gap-1 group"
						onclick={() => { if (isCompleted) goToStep(i); }}
						disabled={isUpcoming || isAnimating}
						title="{step.label}"
					>
						<div
							class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all duration-200"
							style="
								background: {isCurrent ? 'oklch(0.45 0.18 240)' : isCompleted ? 'oklch(0.40 0.15 145)' : 'oklch(0.25 0.02 250)'};
								border: 2px solid {isCurrent ? 'oklch(0.65 0.20 240)' : isCompleted ? 'oklch(0.55 0.18 145)' : 'oklch(0.35 0.02 250)'};
								color: {isCurrent || isCompleted ? 'oklch(0.95 0.02 250)' : 'oklch(0.50 0.02 250)'};
								{isCurrent ? 'box-shadow: 0 0 12px oklch(0.65 0.20 240 / 0.4);' : ''}
							"
						>
							{#if isCompleted}
								<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
									<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
								</svg>
							{:else}
								{step.icon}
							{/if}
						</div>
						<span
							class="text-[10px] font-mono uppercase tracking-wider"
							style="color: {isCurrent ? 'oklch(0.75 0.15 240)' : isCompleted ? 'oklch(0.65 0.10 145)' : 'oklch(0.45 0.02 250)'};"
						>
							{step.label}
						</span>
					</button>
				{/each}
			</div>

			<!-- Step Content -->
			<div class="flex-1 overflow-y-auto min-h-0" style="background: oklch(0.16 0.01 250);">
				<div
					class="wizard-step-container"
					class:wizard-slide-in-right={stepDirection === 'forward' && isAnimating}
					class:wizard-slide-in-left={stepDirection === 'backward' && isAnimating}
				>
					<!-- ═══════ STEP 0: Source Selection ═══════ -->
					{#if currentStep === 0}
						<form onsubmit={(e) => { e.preventDefault(); nextStep(); }} class="p-6 flex flex-col gap-6">
							<!-- Path Input -->
							<div class="form-control">
								<label class="label" for="project-path">
									<span class="label-text text-xs font-semibold font-mono uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">
										Project Path
										<span class="text-error">*</span>
									</span>
								</label>
								<div class="flex items-center gap-2">
									<input
										id="project-path"
										type="text"
										placeholder="/path/to/my-project"
										class="input flex-1 font-mono"
										style="background: oklch(0.18 0.01 250); border: 1px solid oklch(0.35 0.02 250); color: oklch(0.80 0.02 250);"
										bind:this={pathInputRef}
										bind:value={pathInput}
										oninput={handlePathInput}
										disabled={isSubmitting}
										required
									/>
									<button
										type="button"
										class="btn btn-sm"
										style="background: oklch(0.25 0.02 250); border: 1px solid oklch(0.40 0.02 250); color: oklch(0.75 0.02 250);"
										onclick={() => { showBrowser = !showBrowser; if (showBrowser && directories.length === 0) loadDirectories(); }}
										disabled={isSubmitting}
									>
										{showBrowser ? 'Hide' : 'Browse'}
									</button>
								</div>

								<!-- Validation status -->
								{#if validationStatus !== 'idle'}
									<div class="flex items-center gap-2 mt-2">
										{#if validationStatus === 'checking'}
											<span class="loading loading-spinner loading-xs" style="color: oklch(0.70 0.18 240);"></span>
										{:else}
											<span
												class="w-2 h-2 rounded-full"
												style="background: {getStatusColor(validationStatus)};"
											></span>
										{/if}
										<span class="text-xs font-mono" style="color: {getStatusColor(validationStatus)};">
											{validationMessage}
										</span>
									</div>

									<!-- Initialize Git button -->
									{#if validationStatus === 'needs-git'}
										<div class="mt-3">
											<button
												type="button"
												class="btn btn-sm"
												style="background: oklch(0.30 0.12 85); border: 1px solid oklch(0.45 0.15 85); color: oklch(0.95 0.02 250);"
												onclick={initializeGit}
												disabled={isInitializingGit || isSubmitting}
											>
												{#if isInitializingGit}
													<span class="loading loading-spinner loading-xs"></span>
													Initializing Git...
												{:else}
													<svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
													</svg>
													Initialize Git Repository
												{/if}
											</button>
											<p class="text-xs mt-2" style="color: oklch(0.55 0.02 250);">
												This will run <code class="px-1 py-0.5 rounded" style="background: oklch(0.22 0.01 250);">git init</code> in the selected folder.
											</p>
										</div>
									{/if}

									<!-- Will-create info -->
									{#if validationStatus === 'will-create'}
										<div class="mt-3 space-y-1">
											<p class="text-xs font-semibold" style="color: oklch(0.70 0.18 145);">
												On submit, we will:
											</p>
											<ul class="text-xs space-y-0.5" style="color: oklch(0.60 0.02 250);">
												<li class="flex items-center gap-1.5">
													<span style="color: oklch(0.70 0.18 145);">1.</span>
													Create directory at {pathInput}
												</li>
												<li class="flex items-center gap-1.5">
													<span style="color: oklch(0.70 0.18 145);">2.</span>
													Initialize git repository
												</li>
												<li class="flex items-center gap-1.5">
													<span style="color: oklch(0.70 0.18 145);">3.</span>
													Set up JAT task management
												</li>
												<li class="flex items-center gap-1.5">
													<span style="color: oklch(0.70 0.18 145);">4.</span>
													Add to JAT configuration
												</li>
											</ul>
										</div>
									{/if}
								{/if}
							</div>

							<!-- Directory Browser -->
							{#if showBrowser}
								<div
									class="rounded-lg p-4"
									style="background: oklch(0.18 0.01 250); border: 1px solid oklch(0.30 0.02 250);"
								>
									<div class="flex items-center justify-between mb-3">
										<span class="text-xs font-mono" style="color: oklch(0.55 0.02 250);">
											{basePath}
										</span>
										<div class="flex items-center gap-2">
											<button
												type="button"
												class="btn btn-xs"
												style="background: oklch(0.30 0.10 145); border: 1px solid oklch(0.40 0.15 145); color: oklch(0.95 0.02 250);"
												onclick={() => { showNewFolderInput = !showNewFolderInput; folderError = null; newFolderName = ''; }}
												disabled={isLoadingDirectories || isCreatingFolder}
											>
												{#if showNewFolderInput}
													Cancel
												{:else}
													<svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
													</svg>
													New Folder
												{/if}
											</button>
											<button
												type="button"
												class="btn btn-xs btn-ghost"
												onclick={() => loadDirectories()}
												disabled={isLoadingDirectories}
											>
												{#if isLoadingDirectories}
													<span class="loading loading-spinner loading-xs"></span>
												{:else}
													Refresh
												{/if}
											</button>
										</div>
									</div>

									<!-- New Folder Input -->
									{#if showNewFolderInput}
										<div class="mb-3 p-3 rounded" style="background: oklch(0.22 0.01 250); border: 1px solid oklch(0.35 0.02 250);">
											<label class="text-xs font-mono mb-2 block" style="color: oklch(0.55 0.02 250);">
												New folder name
											</label>
											<div class="flex items-center gap-2">
												<input
													type="text"
													placeholder="my-new-project"
													class="input input-sm flex-1 font-mono"
													style="background: oklch(0.18 0.01 250); border: 1px solid oklch(0.35 0.02 250); color: oklch(0.80 0.02 250);"
													bind:value={newFolderName}
													disabled={isCreatingFolder}
													onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); createNewFolder(); } }}
												/>
												<button
													type="button"
													class="btn btn-sm"
													style="background: oklch(0.35 0.15 145); border: 1px solid oklch(0.45 0.18 145); color: oklch(0.95 0.02 250);"
													onclick={createNewFolder}
													disabled={isCreatingFolder || !newFolderName.trim()}
												>
													{#if isCreatingFolder}
														<span class="loading loading-spinner loading-xs"></span>
													{:else}
														Create
													{/if}
												</button>
											</div>
											{#if folderError}
												<p class="text-xs mt-2" style="color: oklch(0.65 0.20 25);">{folderError}</p>
											{/if}
										</div>
									{/if}

									{#if directoryError}
										<div class="text-sm text-error">{directoryError}</div>
									{:else if directories.length === 0 && !isLoadingDirectories}
										<div class="text-sm" style="color: oklch(0.55 0.02 250);">
											No directories found
										</div>
									{:else}
										<div class="max-h-64 overflow-y-auto space-y-1">
											{#each directories as dir}
												<button
													type="button"
													class="w-full text-left px-3 py-2 rounded transition-colors flex items-center gap-2"
													style="
														background: {pathInput === dir.path ? 'oklch(0.30 0.08 240 / 0.3)' : 'transparent'};
														border: 1px solid {pathInput === dir.path ? 'oklch(0.50 0.15 240 / 0.5)' : 'transparent'};
													"
													onclick={() => selectDirectory(dir)}
													disabled={isSubmitting}
												>
													<svg class="w-4 h-4 flex-shrink-0" style="color: oklch(0.60 0.10 85);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
													</svg>

													<span class="flex-1 font-mono text-sm truncate" style="color: oklch(0.80 0.02 250);">
														{dir.name}
													</span>

													<div class="flex items-center gap-1">
														{#if dir.hasJat}
															<span
																class="badge badge-xs"
																style="background: oklch(0.35 0.15 145); color: oklch(0.90 0.02 250);"
															>
																JAT
															</span>
														{/if}
														{#if dir.isGitRepo}
															<span
																class="badge badge-xs"
																style="background: oklch(0.35 0.10 250); color: oklch(0.90 0.02 250);"
															>
																Git
															</span>
														{:else}
															<span
																class="badge badge-xs"
																style="background: oklch(0.35 0.15 25); color: oklch(0.90 0.02 250);"
															>
																No Git
															</span>
														{/if}
													</div>
												</button>
											{/each}
										</div>
									{/if}
								</div>
							{/if}

							<!-- Info box -->
							<div
								class="rounded-lg p-4"
								style="background: oklch(0.20 0.05 240 / 0.15); border: 1px solid oklch(0.40 0.10 240 / 0.3);"
							>
								<h4 class="text-xs font-semibold font-mono uppercase tracking-wider mb-2" style="color: oklch(0.70 0.15 240);">
									Unified Onboarding
								</h4>
								<ul class="space-y-1 text-sm" style="color: oklch(0.65 0.02 250);">
									<li class="flex items-center gap-2">
										<svg class="w-4 h-4 flex-shrink-0" style="color: oklch(0.70 0.18 145);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
										</svg>
										<span>New paths under <code class="px-1 py-0.5 rounded" style="background: oklch(0.22 0.01 250);">~/</code> are auto-created</span>
									</li>
									<li class="flex items-center gap-2">
										<svg class="w-4 h-4 flex-shrink-0" style="color: oklch(0.70 0.18 145);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
										</svg>
										<span>Git initialized automatically if needed</span>
									</li>
									<li class="flex items-center gap-2">
										<svg class="w-4 h-4 flex-shrink-0" style="color: oklch(0.70 0.18 145);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
										</svg>
										<span>JAT task management set up for you</span>
									</li>
								</ul>
							</div>
						</form>

					<!-- ═══════ STEP 1: Project Basics (placeholder) ═══════ -->
					{:else if currentStep === 1}
						<div class="p-6 flex flex-col gap-6">
							<div class="text-center py-12">
								<div
									class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
									style="background: oklch(0.25 0.08 240 / 0.3); border: 1px solid oklch(0.40 0.12 240 / 0.3);"
								>
									<svg class="w-8 h-8" style="color: oklch(0.65 0.15 240);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
										<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
									</svg>
								</div>
								<h3 class="text-lg font-semibold font-mono" style="color: oklch(0.80 0.02 250);">Project Basics</h3>
								<p class="text-sm mt-2" style="color: oklch(0.55 0.02 250);">
									Name, key, and description will be configured here.
								</p>
								<p class="text-xs mt-4 font-mono" style="color: oklch(0.45 0.02 250);">
									Path: {wizardData.path}
								</p>
							</div>
						</div>

					<!-- ═══════ STEP 2: Dev Config (placeholder) ═══════ -->
					{:else if currentStep === 2}
						<div class="p-6 flex flex-col gap-6">
							<div class="text-center py-12">
								<div
									class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
									style="background: oklch(0.25 0.08 85 / 0.3); border: 1px solid oklch(0.40 0.12 85 / 0.3);"
								>
									<svg class="w-8 h-8" style="color: oklch(0.65 0.15 85);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
										<path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17l-5.2-3a2 2 0 010-3.46l5.2-3a2 2 0 012.16 0l5.2 3a2 2 0 010 3.46l-5.2 3a2 2 0 01-2.16 0z" />
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 22V12" />
									</svg>
								</div>
								<h3 class="text-lg font-semibold font-mono" style="color: oklch(0.80 0.02 250);">Development Config</h3>
								<p class="text-sm mt-2" style="color: oklch(0.55 0.02 250);">
									Harness, port, and dev command will be configured here.
								</p>
							</div>
						</div>

					<!-- ═══════ STEP 3: Appearance (placeholder) ═══════ -->
					{:else if currentStep === 3}
						<div class="p-6 flex flex-col gap-6">
							<div class="text-center py-12">
								<div
									class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
									style="background: oklch(0.25 0.08 320 / 0.3); border: 1px solid oklch(0.40 0.12 320 / 0.3);"
								>
									<svg class="w-8 h-8" style="color: oklch(0.65 0.15 320);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
										<path stroke-linecap="round" stroke-linejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
									</svg>
								</div>
								<h3 class="text-lg font-semibold font-mono" style="color: oklch(0.80 0.02 250);">Appearance</h3>
								<p class="text-sm mt-2" style="color: oklch(0.55 0.02 250);">
									Project colors will be configured here.
								</p>
							</div>
						</div>

					<!-- ═══════ STEP 4: Review & Create ═══════ -->
					{:else if currentStep === 4}
						<div class="p-6 flex flex-col gap-6">
							{#if successMessage}
								<!-- Success state -->
								<div
									class="rounded-lg p-4 space-y-4"
									style="background: oklch(0.20 0.08 150 / 0.2); border: 1px solid oklch(0.45 0.12 150 / 0.4);"
								>
									<div class="flex items-center gap-3">
										<div
											class="w-10 h-10 rounded-full flex items-center justify-center"
											style="background: oklch(0.40 0.15 150); color: oklch(0.95 0.02 250);"
										>
											<svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
											</svg>
										</div>
										<div>
											<p class="font-semibold" style="color: oklch(0.85 0.08 150);">Project Created!</p>
											<p class="text-sm" style="color: oklch(0.65 0.04 150);">{successMessage}</p>
										</div>
									</div>

									{#if creationSteps.length > 0}
										<div class="space-y-1">
											<p class="text-xs font-semibold uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">
												Steps completed:
											</p>
											<ul class="text-sm space-y-0.5" style="color: oklch(0.70 0.02 250);">
												{#each creationSteps as step}
													<li class="flex items-center gap-2">
														<svg class="w-3 h-3 flex-shrink-0" style="color: oklch(0.70 0.18 145);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
														</svg>
														<span>{step}</span>
													</li>
												{/each}
											</ul>
										</div>
									{/if}

									<div class="flex items-center gap-3 pt-2">
										{#if createdProjectKey}
											<a
												href="/config?tab=projects&edit={encodeURIComponent(createdProjectKey)}"
												class="btn btn-sm"
												style="background: oklch(0.30 0.10 240); border: 1px solid oklch(0.45 0.12 240); color: oklch(0.90 0.02 250);"
												onclick={() => { resetForm(); closeProjectDrawer(); }}
											>
												<svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												</svg>
												Configure Settings
											</a>
										{/if}
										<button
											type="button"
											class="btn btn-sm btn-ghost"
											onclick={() => {
												const project = createdProjectKey;
												resetForm();
												closeProjectDrawer();
												if (project) {
													localStorage.setItem('tasks3-selected-project', project);
												}
												goto('/tasks');
											}}
										>
											Done
										</button>
									</div>
								</div>
							{:else}
								<!-- Review summary (placeholder for now) -->
								<div class="text-center py-8">
									<div
										class="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
										style="background: oklch(0.25 0.08 145 / 0.3); border: 1px solid oklch(0.40 0.12 145 / 0.3);"
									>
										<svg class="w-8 h-8" style="color: oklch(0.65 0.15 145);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
									<h3 class="text-lg font-semibold font-mono" style="color: oklch(0.80 0.02 250);">Review & Create</h3>
									<p class="text-sm mt-2" style="color: oklch(0.55 0.02 250);">
										Full review panel will be built by a sibling task.
									</p>
								</div>

								<!-- Quick summary of path for now -->
								<div
									class="rounded-lg p-4"
									style="background: oklch(0.20 0.03 250); border: 1px solid oklch(0.30 0.02 250);"
								>
									<div class="flex items-center gap-2 mb-2">
										<span class="text-xs font-mono uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">Source</span>
									</div>
									<p class="text-sm font-mono" style="color: oklch(0.75 0.02 250);">{wizardData.path}</p>
								</div>
							{/if}

							<!-- Error Message -->
							{#if submitError}
								<div
									class="alert font-mono text-sm"
									style="background: oklch(0.35 0.15 25); border: 1px solid oklch(0.50 0.18 25); color: oklch(0.95 0.02 250);"
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<span>{submitError}</span>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>

			<!-- Footer Navigation (hidden after success) -->
			{#if !successMessage}
				<div
					class="p-6"
					style="
						background: linear-gradient(180deg, oklch(0.20 0.01 250) 0%, oklch(0.18 0.01 250) 100%);
						border-top: 1px solid oklch(0.35 0.02 250);
					"
				>
					<div class="flex items-center justify-between">
						<!-- Left side: Back button -->
						<div>
							{#if !isFirstStep}
								<button
									type="button"
									class="btn btn-ghost font-mono"
									onclick={prevStep}
									disabled={isSubmitting || isAnimating}
								>
									<svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
									</svg>
									Back
								</button>
							{:else}
								<button
									type="button"
									class="btn btn-ghost"
									onclick={handleClose}
									disabled={isSubmitting}
								>
									Cancel
								</button>
							{/if}
						</div>

						<!-- Right side: Next / Create button -->
						<div>
							{#if isLastStep}
								<button
									type="button"
									class="btn font-mono"
									style="background: oklch(0.40 0.15 145); border: 1px solid oklch(0.55 0.18 145); color: oklch(0.95 0.02 250);"
									onclick={handleSubmit}
									disabled={isSubmitting || isAnimating}
								>
									{#if isSubmitting}
										<span class="loading loading-spinner loading-sm"></span>
										Creating...
									{:else}
										<svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
											<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
										</svg>
										Create Project
									{/if}
								</button>
							{:else}
								<button
									type="button"
									class="btn btn-primary font-mono"
									onclick={nextStep}
									disabled={!isStepValid || isAnimating}
								>
									Next
									<svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
									</svg>
								</button>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	/* Wizard step transition animations */
	.wizard-step-container {
		animation: none;
	}

	.wizard-slide-in-right {
		animation: wizard-slide-right 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
	}

	.wizard-slide-in-left {
		animation: wizard-slide-left 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
	}

	@keyframes wizard-slide-right {
		0% {
			opacity: 0;
			transform: translateX(40px);
		}
		100% {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@keyframes wizard-slide-left {
		0% {
			opacity: 0;
			transform: translateX(-40px);
		}
		100% {
			opacity: 1;
			transform: translateX(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.wizard-slide-in-right,
		.wizard-slide-in-left {
			animation: none !important;
		}
	}
</style>
