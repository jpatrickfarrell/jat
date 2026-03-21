<script lang="ts">
	/**
	 * CreateProjectDrawer Component — Multi-Step Wizard
	 *
	 * 5-step wizard for creating new projects:
	 *   Step 0: Source Selection — three entry point cards (git / local / template)
	 *   Step 1: Project Basics (name, key, description) — placeholder
	 *   Step 2: Dev Config (harness, port, dev command) — placeholder
	 *   Step 3: Appearance (colors) — placeholder
	 *   Step 4: Review & Create — placeholder
	 *
	 * Step 0 presents three cards. Clicking a card sets wizardData.sourceType
	 * and advances to Step 1. Subsequent steps vary by sourceType (sibling tasks).
	 * Path entry functions remain in script for the local/git sub-steps.
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

	// ─── Manual Override Tracking ──────────────────────────────────
	// Once a user manually edits a derived field, stop auto-deriving it
	let nameManuallyEdited = $state(false);
	let keyManuallyEdited = $state(false);
	let inactiveColorManuallyEdited = $state(false);

	// ─── Color Palette ─────────────────────────────────────────────
	const COLOR_PALETTE = [
		'#5588ff', '#00d4aa', '#bb66ff', '#ff6644', '#ffdd00',
		'#17ace6', '#ff44aa', '#44cc44', '#ff8800', '#8572d6',
		'#3df1ae', '#e63946', '#2ec4b6', '#ff9f1c', '#6a4c93',
		'#1982c4', '#8ac926', '#ff595e',
	] as const;

	// Track existing project colors to avoid duplicates
	let existingProjectColors = $state<string[]>([]);
	let existingPorts = $state<number[]>([]);

	// Fetch existing project data for color/port suggestions
	async function fetchExistingProjectData() {
		try {
			const response = await fetch('/api/projects');
			if (response.ok) {
				const data = await response.json();
				const projects = data.projects || {};
				existingProjectColors = Object.values(projects)
					.map((p: any) => (p.active_color || '').toLowerCase())
					.filter(Boolean);
				existingPorts = Object.values(projects)
					.map((p: any) => p.port)
					.filter((p: any): p is number => typeof p === 'number' && p > 0);
			}
		} catch { /* ignore */ }
	}

	// Auto-suggest first unused port starting from 3000
	const suggestedPort = $derived.by(() => {
		let port = 3000;
		while (existingPorts.includes(port) && port < 65535) {
			port += 100;
		}
		return port;
	});

	// Auto-suggest first unused color
	const suggestedColor = $derived.by(() => {
		const lower = existingProjectColors.map(c => c.toLowerCase());
		return COLOR_PALETTE.find(c => !lower.includes(c.toLowerCase())) || COLOR_PALETTE[0];
	});

	// Derive darker shade for inactive color
	function darkenColor(hex: string): string {
		const clean = hex.replace('#', '');
		const r = Math.max(0, Math.round(parseInt(clean.substring(0, 2), 16) * 0.75));
		const g = Math.max(0, Math.round(parseInt(clean.substring(2, 4), 16) * 0.75));
		const b = Math.max(0, Math.round(parseInt(clean.substring(4, 6), 16) * 0.75));
		return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
	}

	// Auto-derive name from path basename
	$effect(() => {
		if (!nameManuallyEdited && wizardData.path) {
			const parts = wizardData.path.replace(/\/+$/, '').split('/');
			wizardData.projectName = parts[parts.length - 1] || '';
		}
	});

	// Auto-derive key from name
	$effect(() => {
		if (!keyManuallyEdited && wizardData.projectName) {
			wizardData.projectKey = wizardData.projectName
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '');
		}
	});

	// Auto-derive inactive color from active color
	$effect(() => {
		if (!inactiveColorManuallyEdited && wizardData.activeColor) {
			wizardData.inactiveColor = darkenColor(wizardData.activeColor);
		}
	});

	// Set default port and color when entering step 2/3
	$effect(() => {
		if (currentStep === 2 && wizardData.port === 3000 && existingPorts.length > 0) {
			wizardData.port = suggestedPort;
		}
	});

	$effect(() => {
		if (currentStep === 3 && !wizardData.activeColor) {
			wizardData.activeColor = suggestedColor;
		}
	});

	// Fetch project data when drawer opens
	$effect(() => {
		if (isOpen) {
			fetchExistingProjectData();
		}
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
		// Sync pathInput into wizardData.path for local source when leaving source step
		if (wizardData.sourceType === 'local' && !wizardData.path && pathInput.trim()) {
			wizardData.path = pathInput.trim();
		}
		goToStep(currentStep + 1);
	}

	function selectSource(type: 'git' | 'local' | 'template') {
		wizardData.sourceType = type;
		goToStep(1);
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

	// Creation progress tracking
	interface CreationStep {
		label: string;
		status: 'pending' | 'active' | 'done' | 'error';
	}
	let creationProgress = $state<CreationStep[]>([]);
	let failedStepIndex = $state<number>(-1);

	// Validation state
	let validationStatus = $state<'idle' | 'checking' | 'valid' | 'invalid' | 'already-initialized' | 'needs-git' | 'will-create'>('idle');
	let validationMessage = $state<string | null>(null);
	let selectedDirectory = $state<DirectoryInfo | null>(null);

	// Step validation: returns true if the current step is valid
	// NOTE: Must be declared after validationStatus and pathInput to avoid TDZ errors during SSR
	const isStepValid = $derived.by(() => {
		switch (currentStep) {
			case 0:
				return wizardData.sourceType !== null;
			case 1:
				// For git: valid once clone succeeded (path is set)
				if (wizardData.sourceType === 'git') {
					return cloneSuccess && wizardData.path.length > 0;
				}
				return wizardData.projectName.trim().length > 0 && wizardData.projectKey.trim().length > 0;
			case 2: {
				const p = wizardData.port;
				const portValid = p >= 1024 && p <= 65535;
				// For git source, step 2 also includes basics fields
				if (wizardData.sourceType === 'git') {
					return portValid && wizardData.projectName.trim().length > 0 && wizardData.projectKey.trim().length > 0;
				}
				return portValid;
			}
			case 3:
				return wizardData.activeColor.length > 0;
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

	// ─── Git Clone state (Step 1 when sourceType='git') ──────────
	let gitUrl = $state('');
	let gitTargetPath = $state('');
	let gitBranch = $state('');
	let gitUrlError = $state<string | null>(null);
	let gitRepoName = $state('');
	let isCloning = $state(false);
	let cloneError = $state<string | null>(null);
	let cloneSuccess = $state(false);

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

	// ─── Git Clone functions ──────────────────────────────────────

	/** Validate and parse a git URL, extracting the repo name */
	function parseGitUrl(url: string): { valid: boolean; repoName: string } {
		const cleaned = url.trim().replace(/\/+$/, '');
		const httpsPattern = /^https?:\/\/[^/]+\/[^/]+\/[^/]+(\.git)?$/;
		const sshPattern = /^git@[^:]+:[^/]+\/[^/]+(\.git)?$/;
		const gitProtocol = /^git:\/\/[^/]+\/[^/]+\/[^/]+(\.git)?$/;

		const valid = httpsPattern.test(cleaned) || sshPattern.test(cleaned) || gitProtocol.test(cleaned);
		let repoName = '';
		if (valid) {
			const parts = cleaned.replace(/:/, '/').split('/');
			repoName = parts[parts.length - 1].replace(/\.git$/, '');
		}
		return { valid, repoName };
	}

	/** Handle git URL input — validate and auto-populate target path */
	function handleGitUrlInput() {
		gitUrlError = null;
		cloneError = null;
		cloneSuccess = false;

		if (!gitUrl.trim()) {
			gitRepoName = '';
			gitTargetPath = '';
			return;
		}

		const { valid, repoName } = parseGitUrl(gitUrl);
		if (valid) {
			gitRepoName = repoName;
			// Only auto-populate if user hasn't manually edited the path
			if (!gitTargetPath || gitTargetPath === `~/code/${gitRepoName}` || gitTargetPath.match(/^~\/code\/[^/]*$/)) {
				gitTargetPath = `~/code/${repoName}`;
			}
			gitUrlError = null;
		} else {
			gitRepoName = '';
			gitUrlError = 'Enter a valid git URL (HTTPS or SSH)';
		}
	}

	/** Handle paste in URL input — clean GitHub URLs */
	function handleGitUrlPaste(e: ClipboardEvent) {
		const pasted = e.clipboardData?.getData('text')?.trim();
		if (!pasted) return;

		// Clean GitHub browser URLs: strip trailing slash, normalize .git
		let cleaned = pasted.replace(/\/+$/, '');
		// If it looks like a GitHub URL without .git, that's fine — our regex handles both
		gitUrl = cleaned;

		// Prevent default so we control the value
		e.preventDefault();

		// Trigger validation
		handleGitUrlInput();
	}

	/** Execute git clone */
	async function handleGitClone() {
		if (!gitUrl.trim()) return;

		const { valid } = parseGitUrl(gitUrl);
		if (!valid) {
			gitUrlError = 'Invalid git URL';
			return;
		}

		isCloning = true;
		cloneError = null;
		cloneSuccess = false;

		try {
			const response = await fetch('/api/projects/clone', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					url: gitUrl.trim(),
					targetPath: gitTargetPath.trim() || undefined,
					branch: gitBranch.trim() || undefined
				})
			});

			const data = await response.json();

			if (!response.ok || data.error) {
				cloneError = data.message || 'Clone failed';
				playErrorSound();
				return;
			}

			// Success — update wizard data and advance
			cloneSuccess = true;
			wizardData.path = data.path;
			playSuccessChime();

			// Auto-advance to next step after brief delay
			setTimeout(() => {
				goToStep(currentStep + 1);
			}, 600);
		} catch (error) {
			cloneError = error instanceof Error ? error.message : 'Failed to clone repository';
			playErrorSound();
		} finally {
			isCloning = false;
		}
	}

	// ─── Submit (final step) ───────────────────────────────────────

	function buildCreationSteps(): CreationStep[] {
		const steps: CreationStep[] = [];
		if (wizardData.sourceType === 'git') {
			steps.push({ label: 'Cloned repository', status: 'done' });
		} else if (wizardData.sourceType === 'local') {
			steps.push({ label: 'Created directory (if needed)', status: 'pending' });
		}
		steps.push({ label: 'Initialized git (if needed)', status: 'pending' });
		steps.push({ label: 'Initialized JAT Tasks', status: 'pending' });
		steps.push({ label: 'Added to projects.json', status: 'pending' });
		if (wizardData.activeColor) {
			steps.push({ label: 'Configured project colors', status: 'pending' });
		}
		return steps;
	}

	async function handleSubmit(e?: Event) {
		e?.preventDefault();

		const path = wizardData.path || pathInput.trim();
		if (!path) {
			submitError = 'Please enter a path or select a directory';
			return;
		}

		submitError = null;
		successMessage = null;
		failedStepIndex = -1;
		isSubmitting = true;

		// Build and show progress steps
		creationProgress = buildCreationSteps();

		// Animate steps to "active" one by one
		let stepIdx = 0;
		const advanceStep = () => {
			if (stepIdx < creationProgress.length) {
				creationProgress[stepIdx].status = 'active';
				creationProgress = [...creationProgress];
			}
		};
		advanceStep();

		const stepInterval = setInterval(() => {
			// Mark previous step as done, advance to next
			if (stepIdx < creationProgress.length) {
				creationProgress[stepIdx].status = 'done';
			}
			stepIdx++;
			if (stepIdx < creationProgress.length) {
				advanceStep();
			} else {
				clearInterval(stepInterval);
			}
			creationProgress = [...creationProgress];
		}, 400);

		try {
			const body: Record<string, any> = {
				path,
				name: wizardData.projectName || undefined,
				prefix: wizardData.projectKey || undefined,
				description: wizardData.description || undefined,
				port: wizardData.port || undefined,
				dev_command: wizardData.devCommand || undefined,
				server_path: wizardData.serverPath || undefined,
				agent_program: wizardData.harness || undefined,
				active_color: wizardData.activeColor || undefined,
				inactive_color: wizardData.inactiveColor || undefined,
			};

			const response = await fetch('/api/projects/init', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			const data = await response.json();

			if (!response.ok || data.error) {
				throw new Error(data.message || 'Failed to initialize project');
			}

			// Stop step animation and mark all done
			clearInterval(stepInterval);
			creationProgress = creationProgress.map(s => ({ ...s, status: 'done' as const }));

			successMessage = data.message || `Successfully added ${data.project?.name}`;
			createdProjectKey = data.project?.prefix || data.project?.name?.toLowerCase() || null;
			creationSteps = data.steps || [];
			playSuccessChime();

			await invalidateAll();
			signalProjectCreated();

			if (onProjectCreated) {
				onProjectCreated();
			}
		} catch (error) {
			// Stop step animation and mark failed
			clearInterval(stepInterval);
			failedStepIndex = stepIdx;
			if (stepIdx < creationProgress.length) {
				creationProgress[stepIdx].status = 'error';
			}
			creationProgress = [...creationProgress];

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
		nameManuallyEdited = false;
		keyManuallyEdited = false;
		inactiveColorManuallyEdited = false;
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
		creationProgress = [];
		failedStepIndex = -1;
		directoryError = null;
		showNewFolderInput = false;
		newFolderName = '';
		isCreatingFolder = false;
		folderError = null;
		isInitializingGit = false;
		gitUrl = '';
		gitTargetPath = '';
		gitBranch = '';
		gitUrlError = null;
		gitRepoName = '';
		isCloning = false;
		cloneError = null;
		cloneSuccess = false;
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
						<div class="p-6 flex flex-col gap-6">
							<!-- Heading -->
							<div>
								<h3 class="text-base font-semibold font-mono" style="color: oklch(0.80 0.02 250);">
									How would you like to start?
								</h3>
								<p class="text-sm mt-1" style="color: oklch(0.50 0.02 250);">
									Choose how to bring your project into JAT.
								</p>
							</div>

							<!-- Source Cards -->
							<div class="flex flex-col gap-3">
								<!-- Clone from Git -->
								<button
									type="button"
									class="source-card group"
									class:source-card-selected={wizardData.sourceType === 'git'}
									onclick={() => selectSource('git')}
								>
									<div class="source-card-icon" style="background: oklch(0.25 0.10 25 / 0.3); border-color: oklch(0.40 0.15 25 / 0.4);">
										<svg class="w-6 h-6" style="color: oklch(0.75 0.15 25);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M6 3v12m0 0a3 3 0 103 3H9a3 3 0 10-3-3m0 0h12a3 3 0 103-3m-3 3V6a3 3 0 10-3-3" />
										</svg>
									</div>
									<div class="flex-1 text-left">
										<h4 class="text-sm font-semibold font-mono" style="color: oklch(0.85 0.02 250);">Clone from Git</h4>
										<p class="text-xs mt-0.5" style="color: oklch(0.60 0.02 250);">Clone a GitHub or Git repository</p>
										<p class="text-[11px] mt-1" style="color: oklch(0.45 0.02 250);">Paste a repo URL and JAT handles the rest</p>
									</div>
									<svg class="w-5 h-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style="color: oklch(0.50 0.02 250);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
									</svg>
								</button>

								<!-- Add Local Project -->
								<button
									type="button"
									class="source-card group"
									class:source-card-selected={wizardData.sourceType === 'local'}
									onclick={() => selectSource('local')}
								>
									<div class="source-card-icon" style="background: oklch(0.25 0.10 240 / 0.3); border-color: oklch(0.40 0.15 240 / 0.4);">
										<svg class="w-6 h-6" style="color: oklch(0.75 0.15 240);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
										</svg>
									</div>
									<div class="flex-1 text-left">
										<h4 class="text-sm font-semibold font-mono" style="color: oklch(0.85 0.02 250);">Local Project</h4>
										<p class="text-xs mt-0.5" style="color: oklch(0.60 0.02 250);">Add a project already on your machine</p>
										<p class="text-[11px] mt-1" style="color: oklch(0.45 0.02 250);">Point to an existing directory</p>
									</div>
									<svg class="w-5 h-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style="color: oklch(0.50 0.02 250);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
									</svg>
								</button>

								<!-- Create from Template -->
								<button
									type="button"
									class="source-card group"
									class:source-card-selected={wizardData.sourceType === 'template'}
									onclick={() => selectSource('template')}
								>
									<div class="source-card-icon" style="background: oklch(0.25 0.10 300 / 0.3); border-color: oklch(0.40 0.15 300 / 0.4);">
										<svg class="w-6 h-6" style="color: oklch(0.75 0.15 300);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
										</svg>
									</div>
									<div class="flex-1 text-left">
										<h4 class="text-sm font-semibold font-mono" style="color: oklch(0.85 0.02 250);">Start from Template</h4>
										<p class="text-xs mt-0.5" style="color: oklch(0.60 0.02 250);">Scaffold a new SaaS app from JST</p>
										<p class="text-[11px] mt-1" style="color: oklch(0.45 0.02 250);">Describe your idea and we build it</p>
									</div>
									<svg class="w-5 h-5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style="color: oklch(0.50 0.02 250);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
									</svg>
								</button>
							</div>
						</div>

					<!-- ═══════ STEP 1: Source-specific sub-step ═══════ -->
					{:else if currentStep === 1}
						{#if wizardData.sourceType === 'git'}
							<!-- Git Clone sub-step -->
							<div class="p-6 flex flex-col gap-5">
								<div>
									<h3 class="text-base font-semibold font-mono" style="color: oklch(0.80 0.02 250);">
										Clone Repository
									</h3>
									<p class="text-sm mt-1" style="color: oklch(0.50 0.02 250);">
										Paste a repository URL and we'll clone it for you.
									</p>
								</div>

								<!-- URL Input -->
								<div class="flex flex-col gap-1.5">
									<label class="text-xs font-mono uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">
										Repository URL
									</label>
									<input
										type="text"
										class="input input-bordered w-full font-mono text-sm"
										placeholder="https://github.com/user/repo.git"
										bind:value={gitUrl}
										oninput={handleGitUrlInput}
										onpaste={handleGitUrlPaste}
										disabled={isCloning || cloneSuccess}
										style="background: oklch(0.20 0.01 250); border-color: {gitUrlError ? 'oklch(0.55 0.18 25)' : gitRepoName ? 'oklch(0.50 0.15 145)' : 'oklch(0.30 0.02 250)'}; color: oklch(0.85 0.02 250);"
									/>
									{#if gitUrlError}
										<p class="text-xs" style="color: oklch(0.65 0.18 25);">{gitUrlError}</p>
									{:else if gitRepoName}
										<p class="text-xs" style="color: oklch(0.60 0.12 145);">
											Repository: {gitRepoName}
										</p>
									{/if}
								</div>

								<!-- Target Path -->
								<div class="flex flex-col gap-1.5">
									<label class="text-xs font-mono uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">
										Target Directory
									</label>
									<input
										type="text"
										class="input input-bordered w-full font-mono text-sm"
										placeholder="~/code/my-project"
										bind:value={gitTargetPath}
										disabled={isCloning || cloneSuccess}
										style="background: oklch(0.20 0.01 250); border-color: oklch(0.30 0.02 250); color: oklch(0.85 0.02 250);"
									/>
									<p class="text-xs" style="color: oklch(0.45 0.02 250);">
										Where to clone the repository
									</p>
								</div>

								<!-- Branch (optional) -->
								<div class="flex flex-col gap-1.5">
									<label class="text-xs font-mono uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">
										Branch <span style="color: oklch(0.40 0.02 250);">(optional)</span>
									</label>
									<input
										type="text"
										class="input input-bordered w-full font-mono text-sm"
										placeholder="main"
										bind:value={gitBranch}
										disabled={isCloning || cloneSuccess}
										style="background: oklch(0.20 0.01 250); border-color: oklch(0.30 0.02 250); color: oklch(0.85 0.02 250);"
									/>
									<p class="text-xs" style="color: oklch(0.45 0.02 250);">
										Leave blank for the default branch
									</p>
								</div>

								<!-- Clone Button -->
								{#if !cloneSuccess}
									<button
										type="button"
										class="btn w-full font-mono"
										style="background: oklch(0.40 0.15 25); border: 1px solid oklch(0.55 0.18 25); color: oklch(0.95 0.02 250);"
										onclick={handleGitClone}
										disabled={isCloning || !gitRepoName || !!gitUrlError}
									>
										{#if isCloning}
											<span class="loading loading-spinner loading-sm"></span>
											Cloning...
										{:else}
											<svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
												<path stroke-linecap="round" stroke-linejoin="round" d="M6 3v12m0 0a3 3 0 103 3H9a3 3 0 10-3-3m0 0h12a3 3 0 103-3m-3 3V6a3 3 0 10-3-3" />
											</svg>
											Clone Repository
										{/if}
									</button>
								{/if}

								<!-- Clone Error -->
								{#if cloneError}
									<div
										class="rounded-lg p-3 text-sm"
										style="background: oklch(0.25 0.10 25 / 0.3); border: 1px solid oklch(0.45 0.15 25 / 0.4); color: oklch(0.75 0.12 25);"
									>
										{cloneError}
									</div>
								{/if}

								<!-- Clone Success -->
								{#if cloneSuccess}
									<div
										class="rounded-lg p-3 flex items-center gap-3"
										style="background: oklch(0.22 0.08 145 / 0.3); border: 1px solid oklch(0.45 0.15 145 / 0.4);"
									>
										<div
											class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
											style="background: oklch(0.40 0.15 145); color: oklch(0.95 0.02 250);"
										>
											<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
												<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
											</svg>
										</div>
										<div>
											<p class="text-sm font-semibold" style="color: oklch(0.80 0.08 145);">Repository cloned!</p>
											<p class="text-xs font-mono" style="color: oklch(0.60 0.04 145);">{wizardData.path}</p>
										</div>
									</div>
								{/if}
							</div>
						{:else}
							<!-- Basics form for local/template -->
							<div class="p-6 flex flex-col gap-5">
								<div>
									<h3 class="text-base font-semibold font-mono" style="color: oklch(0.80 0.02 250);">
										Project Basics
									</h3>
									<p class="text-sm mt-1" style="color: oklch(0.50 0.02 250);">
										Name your project and set its task ID prefix.
									</p>
								</div>

								<!-- Project Name -->
								<div class="form-control">
									<label class="text-xs font-mono uppercase tracking-wider mb-1.5" style="color: oklch(0.60 0.02 250);">
										Project Name
									</label>
									<input
										type="text"
										class="input input-bordered w-full font-mono text-sm"
										style="background: oklch(0.20 0.01 250); border-color: oklch(0.35 0.02 250); color: oklch(0.90 0.02 250);"
										placeholder="My SaaS App"
										bind:value={wizardData.projectName}
										oninput={() => { nameManuallyEdited = true; }}
									/>
									{#if wizardData.path && !nameManuallyEdited}
										<span class="text-[11px] mt-1 font-mono" style="color: oklch(0.45 0.02 250);">
											Auto-derived from path
										</span>
									{/if}
								</div>

								<!-- Project Key -->
								<div class="form-control">
									<label class="text-xs font-mono uppercase tracking-wider mb-1.5" style="color: oklch(0.60 0.02 250);">
										Project Key
									</label>
									<input
										type="text"
										class="input input-bordered w-full font-mono text-sm"
										style="background: oklch(0.20 0.01 250); border-color: oklch(0.35 0.02 250); color: oklch(0.90 0.02 250);"
										placeholder="my-saas-app"
										bind:value={wizardData.projectKey}
										oninput={() => { keyManuallyEdited = true; }}
									/>
									{#if wizardData.projectKey}
										<span class="text-[11px] mt-1 font-mono" style="color: oklch(0.50 0.05 240);">
											Task IDs will look like: <strong>{wizardData.projectKey}-abc123</strong>
										</span>
									{:else if !keyManuallyEdited}
										<span class="text-[11px] mt-1 font-mono" style="color: oklch(0.45 0.02 250);">
											Auto-derived from name
										</span>
									{/if}
								</div>

								<!-- Description -->
								<div class="form-control">
									<label class="text-xs font-mono uppercase tracking-wider mb-1.5" style="color: oklch(0.60 0.02 250);">
										Description <span style="color: oklch(0.40 0.02 250);">(optional)</span>
									</label>
									<textarea
										class="textarea textarea-bordered w-full font-mono text-sm resize-none"
										style="background: oklch(0.20 0.01 250); border-color: oklch(0.35 0.02 250); color: oklch(0.90 0.02 250); min-height: 80px;"
										placeholder="What is this project about?"
										bind:value={wizardData.description}
										rows="3"
									></textarea>
								</div>

								<!-- Path display -->
								{#if wizardData.path}
									<div
										class="rounded-lg px-3 py-2 flex items-center gap-2"
										style="background: oklch(0.20 0.03 250); border: 1px solid oklch(0.28 0.02 250);"
									>
										<svg class="w-4 h-4 flex-shrink-0" style="color: oklch(0.50 0.02 250);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
											<path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
										</svg>
										<span class="text-xs font-mono truncate" style="color: oklch(0.55 0.02 250);">
											{wizardData.path}
										</span>
									</div>
								{/if}
							</div>
						{/if}

					<!-- ═══════ STEP 2: Dev Config ═══════ -->
					{:else if currentStep === 2}
						<div class="p-6 flex flex-col gap-5">
							<div>
								<h3 class="text-base font-semibold font-mono" style="color: oklch(0.80 0.02 250);">
									Development Config
								</h3>
								<p class="text-sm mt-1" style="color: oklch(0.50 0.02 250);">
									Configure your development environment.
								</p>
							</div>

							<!-- For git source: show basics fields inline since step 1 was clone -->
							{#if wizardData.sourceType === 'git'}
								<!-- Project Name -->
								<div class="form-control">
									<label class="text-xs font-mono uppercase tracking-wider mb-1.5" style="color: oklch(0.60 0.02 250);">
										Project Name
									</label>
									<input
										type="text"
										class="input input-bordered w-full font-mono text-sm"
										style="background: oklch(0.20 0.01 250); border-color: oklch(0.35 0.02 250); color: oklch(0.90 0.02 250);"
										placeholder="My SaaS App"
										bind:value={wizardData.projectName}
										oninput={() => { nameManuallyEdited = true; }}
									/>
									{#if wizardData.path && !nameManuallyEdited}
										<span class="text-[11px] mt-1 font-mono" style="color: oklch(0.45 0.02 250);">
											Auto-derived from cloned repo
										</span>
									{/if}
								</div>

								<!-- Project Key -->
								<div class="form-control">
									<label class="text-xs font-mono uppercase tracking-wider mb-1.5" style="color: oklch(0.60 0.02 250);">
										Project Key
									</label>
									<input
										type="text"
										class="input input-bordered w-full font-mono text-sm"
										style="background: oklch(0.20 0.01 250); border-color: oklch(0.35 0.02 250); color: oklch(0.90 0.02 250);"
										placeholder="my-saas-app"
										bind:value={wizardData.projectKey}
										oninput={() => { keyManuallyEdited = true; }}
									/>
									{#if wizardData.projectKey}
										<span class="text-[11px] mt-1 font-mono" style="color: oklch(0.50 0.05 240);">
											Task IDs: <strong>{wizardData.projectKey}-abc123</strong>
										</span>
									{/if}
								</div>

								<!-- Description -->
								<div class="form-control">
									<label class="text-xs font-mono uppercase tracking-wider mb-1.5" style="color: oklch(0.60 0.02 250);">
										Description <span style="color: oklch(0.40 0.02 250);">(optional)</span>
									</label>
									<textarea
										class="textarea textarea-bordered w-full font-mono text-sm resize-none"
										style="background: oklch(0.20 0.01 250); border-color: oklch(0.35 0.02 250); color: oklch(0.90 0.02 250); min-height: 64px;"
										placeholder="What is this project about?"
										bind:value={wizardData.description}
										rows="2"
									></textarea>
								</div>

								<div style="height: 1px; background: oklch(0.28 0.02 250); margin: 4px 0;"></div>
							{/if}

							<!-- Default Agent Harness -->
							<div class="form-control">
								<label class="text-xs font-mono uppercase tracking-wider mb-1.5" style="color: oklch(0.60 0.02 250);">
									Default Agent Harness
								</label>
								<select
									class="select select-bordered w-full font-mono text-sm"
									style="background: oklch(0.20 0.01 250); border-color: oklch(0.35 0.02 250); color: oklch(0.90 0.02 250);"
									bind:value={wizardData.harness}
								>
									<option value="claude-code">Claude Code</option>
									<option value="pi">Pi</option>
									<option value="codex">Codex</option>
								</select>
								<span class="text-[11px] mt-1" style="color: oklch(0.45 0.02 250);">
									Which AI coding agent to use by default
								</span>
							</div>

							<!-- Dev Server Port -->
							<div class="form-control">
								<label class="text-xs font-mono uppercase tracking-wider mb-1.5" style="color: oklch(0.60 0.02 250);">
									Dev Server Port
								</label>
								<input
									type="number"
									class="input input-bordered w-full font-mono text-sm"
									style="background: oklch(0.20 0.01 250); border-color: {wizardData.port >= 1024 && wizardData.port <= 65535 ? 'oklch(0.35 0.02 250)' : 'oklch(0.55 0.15 25)'}; color: oklch(0.90 0.02 250);"
									min="1024"
									max="65535"
									bind:value={wizardData.port}
								/>
								{#if wizardData.port < 1024 || wizardData.port > 65535}
									<span class="text-[11px] mt-1" style="color: oklch(0.70 0.15 25);">
										Port must be between 1024 and 65535
									</span>
								{:else}
									<span class="text-[11px] mt-1" style="color: oklch(0.45 0.02 250);">
										Port for the development server (e.g., npm run dev)
									</span>
								{/if}
							</div>

							<!-- Dev Command -->
							<div class="form-control">
								<label class="text-xs font-mono uppercase tracking-wider mb-1.5" style="color: oklch(0.60 0.02 250);">
									Dev Command <span style="color: oklch(0.40 0.02 250);">(optional)</span>
								</label>
								<input
									type="text"
									class="input input-bordered w-full font-mono text-sm"
									style="background: oklch(0.20 0.01 250); border-color: oklch(0.35 0.02 250); color: oklch(0.90 0.02 250);"
									placeholder="npm run dev"
									bind:value={wizardData.devCommand}
								/>
								<span class="text-[11px] mt-1" style="color: oklch(0.45 0.02 250);">
									Command to start the dev server
								</span>
							</div>

							<!-- Server Path -->
							<div class="form-control">
								<label class="text-xs font-mono uppercase tracking-wider mb-1.5" style="color: oklch(0.60 0.02 250);">
									Server Path <span style="color: oklch(0.40 0.02 250);">(optional)</span>
								</label>
								<input
									type="text"
									class="input input-bordered w-full font-mono text-sm"
									style="background: oklch(0.20 0.01 250); border-color: oklch(0.35 0.02 250); color: oklch(0.90 0.02 250);"
									placeholder="/"
									bind:value={wizardData.serverPath}
								/>
								<span class="text-[11px] mt-1" style="color: oklch(0.45 0.02 250);">
									Subdirectory where server runs (if not project root)
								</span>
							</div>
						</div>

					<!-- ═══════ STEP 3: Appearance ═══════ -->
					{:else if currentStep === 3}
						<div class="p-6 flex flex-col gap-5">
							<div>
								<h3 class="text-base font-semibold font-mono" style="color: oklch(0.80 0.02 250);">
									Appearance
								</h3>
								<p class="text-sm mt-1" style="color: oklch(0.50 0.02 250);">
									Choose a color for your project badge.
								</p>
							</div>

							<!-- Active Color -->
							<div class="form-control">
								<label class="text-xs font-mono uppercase tracking-wider mb-2" style="color: oklch(0.60 0.02 250);">
									Active Color
								</label>
								<!-- Color Swatches -->
								<div class="flex flex-wrap gap-2 mb-3">
									{#each COLOR_PALETTE as color}
										<button
											type="button"
											class="color-swatch"
											class:color-swatch-selected={wizardData.activeColor === color}
											style="background: {color};"
											title={color}
											onclick={() => { wizardData.activeColor = color; inactiveColorManuallyEdited = false; }}
										></button>
									{/each}
								</div>
								<!-- Custom Color Input -->
								<div class="flex items-center gap-2">
									<input
										type="color"
										class="w-8 h-8 rounded cursor-pointer"
										style="border: 1px solid oklch(0.35 0.02 250);"
										value={wizardData.activeColor || '#5588ff'}
										oninput={(e) => { wizardData.activeColor = (e.target as HTMLInputElement).value; inactiveColorManuallyEdited = false; }}
									/>
									<input
										type="text"
										class="input input-bordered input-sm font-mono text-xs flex-1"
										style="background: oklch(0.20 0.01 250); border-color: oklch(0.35 0.02 250); color: oklch(0.90 0.02 250);"
										placeholder="#5588ff"
										value={wizardData.activeColor}
										oninput={(e) => { wizardData.activeColor = (e.target as HTMLInputElement).value; inactiveColorManuallyEdited = false; }}
									/>
								</div>
							</div>

							<!-- Inactive Color -->
							<div class="form-control">
								<label class="text-xs font-mono uppercase tracking-wider mb-1.5" style="color: oklch(0.60 0.02 250);">
									Inactive Color
									{#if !inactiveColorManuallyEdited}
										<span style="color: oklch(0.40 0.02 250);">(auto-derived)</span>
									{/if}
								</label>
								<div class="flex items-center gap-2">
									<input
										type="color"
										class="w-8 h-8 rounded cursor-pointer"
										style="border: 1px solid oklch(0.35 0.02 250);"
										value={wizardData.inactiveColor || '#3366dd'}
										oninput={(e) => { wizardData.inactiveColor = (e.target as HTMLInputElement).value; inactiveColorManuallyEdited = true; }}
									/>
									<input
										type="text"
										class="input input-bordered input-sm font-mono text-xs flex-1"
										style="background: oklch(0.20 0.01 250); border-color: oklch(0.35 0.02 250); color: oklch(0.90 0.02 250);"
										placeholder="#3366dd"
										value={wizardData.inactiveColor}
										oninput={(e) => { wizardData.inactiveColor = (e.target as HTMLInputElement).value; inactiveColorManuallyEdited = true; }}
									/>
								</div>
							</div>

							<!-- Preview Badge -->
							{#if wizardData.activeColor}
								<div class="form-control">
									<label class="text-xs font-mono uppercase tracking-wider mb-2" style="color: oklch(0.60 0.02 250);">
										Preview
									</label>
									<div
										class="rounded-lg px-4 py-3 flex items-center gap-3"
										style="background: oklch(0.20 0.03 250); border: 1px solid oklch(0.28 0.02 250);"
									>
										<div class="flex items-center gap-2">
											<div
												class="w-3 h-3 rounded-full"
												style="background: {wizardData.activeColor}; box-shadow: 0 0 6px {wizardData.activeColor}80;"
											></div>
											<span class="text-xs font-mono font-bold uppercase" style="color: {wizardData.activeColor};">
												{wizardData.projectKey || wizardData.projectName || 'project'}
											</span>
										</div>
										<span class="text-[10px]" style="color: oklch(0.40 0.02 250);">active</span>

										<div style="width: 1px; height: 20px; background: oklch(0.30 0.02 250);"></div>

										<div class="flex items-center gap-2">
											<div
												class="w-3 h-3 rounded-full"
												style="background: {wizardData.inactiveColor};"
											></div>
											<span class="text-xs font-mono font-bold uppercase" style="color: {wizardData.inactiveColor};">
												{wizardData.projectKey || wizardData.projectName || 'project'}
											</span>
										</div>
										<span class="text-[10px]" style="color: oklch(0.40 0.02 250);">inactive</span>
									</div>
								</div>
							{/if}
						</div>

					<!-- ═══════ STEP 4: Review & Create ═══════ -->
					{:else if currentStep === 4}
						<div class="p-6 flex flex-col gap-5">
							{#if successMessage}
								<!-- ─── Success state ─── -->
								<div
									class="rounded-lg p-5 space-y-4"
									style="background: oklch(0.20 0.08 150 / 0.2); border: 1px solid oklch(0.45 0.12 150 / 0.4);"
								>
									<div class="flex items-center gap-3">
										<div
											class="w-12 h-12 rounded-full flex items-center justify-center"
											style="background: oklch(0.40 0.15 150); color: oklch(0.95 0.02 250);"
										>
											<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
											</svg>
										</div>
										<div>
											<p class="text-lg font-bold font-mono" style="color: oklch(0.85 0.08 150);">Project Created!</p>
											<p class="text-sm" style="color: oklch(0.65 0.04 150);">{successMessage}</p>
										</div>
									</div>

									{#if creationSteps.length > 0}
										<div class="space-y-1.5">
											{#each creationSteps as step}
												<div class="flex items-center gap-2">
													<svg class="w-4 h-4 flex-shrink-0" style="color: oklch(0.70 0.18 145);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
														<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
													</svg>
													<span class="text-sm" style="color: oklch(0.70 0.02 250);">{step}</span>
												</div>
											{/each}
										</div>
									{/if}

									<div class="flex flex-wrap items-center gap-2 pt-3" style="border-top: 1px solid oklch(0.35 0.08 150 / 0.3);">
										<button
											type="button"
											class="btn btn-sm font-mono"
											style="background: oklch(0.35 0.12 145); border: 1px solid oklch(0.50 0.15 145); color: oklch(0.95 0.02 250);"
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
											<svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
												<path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
											</svg>
											Open in IDE
										</button>
										<button
											type="button"
											class="btn btn-sm btn-ghost font-mono"
											onclick={resetForm}
										>
											Create Another
										</button>
										<button
											type="button"
											class="btn btn-sm btn-ghost font-mono"
											onclick={() => { resetForm(); closeProjectDrawer(); }}
										>
											Close
										</button>
									</div>
								</div>

							{:else if isSubmitting}
								<!-- ─── Creation progress ─── -->
								<div>
									<h3 class="text-base font-semibold font-mono mb-4" style="color: oklch(0.80 0.02 250);">
										Creating Project...
									</h3>
									<div class="flex flex-col gap-2">
										{#each creationProgress as step}
											<div class="flex items-center gap-3 py-1.5">
												{#if step.status === 'done'}
													<div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style="background: oklch(0.40 0.15 145);">
														<svg class="w-3 h-3" style="color: oklch(0.95 0.02 250);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
															<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
														</svg>
													</div>
												{:else if step.status === 'active'}
													<span class="loading loading-spinner loading-xs flex-shrink-0" style="color: oklch(0.70 0.15 240);"></span>
												{:else if step.status === 'error'}
													<div class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style="background: oklch(0.45 0.18 25);">
														<svg class="w-3 h-3" style="color: oklch(0.95 0.02 250);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
															<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
														</svg>
													</div>
												{:else}
													<div class="w-5 h-5 rounded-full flex-shrink-0" style="border: 2px solid oklch(0.30 0.02 250);"></div>
												{/if}
												<span
													class="text-sm font-mono"
													style="color: {step.status === 'done' ? 'oklch(0.70 0.10 145)' : step.status === 'active' ? 'oklch(0.80 0.02 250)' : step.status === 'error' ? 'oklch(0.70 0.15 25)' : 'oklch(0.45 0.02 250)'};"
												>
													{step.label}
												</span>
											</div>
										{/each}
									</div>
								</div>

							{:else}
								<!-- ─── Review summary ─── -->
								<div>
									<h3 class="text-base font-semibold font-mono" style="color: oklch(0.80 0.02 250);">
										Review Your Project
									</h3>
									<p class="text-sm mt-1" style="color: oklch(0.50 0.02 250);">
										Confirm your settings before creating.
									</p>
								</div>

								<!-- Source Section -->
								<div class="review-section">
									<div class="review-section-header">
										<span class="review-section-label">Source</span>
										<button type="button" class="review-edit-link" onclick={() => goToStep(0)}>Edit</button>
									</div>
									<div class="review-section-body">
										<div class="review-row">
											<span class="review-key">Type</span>
											<span class="review-value">
												{wizardData.sourceType === 'git' ? 'Cloned from Git' : wizardData.sourceType === 'template' ? 'JST Template' : 'Local Project'}
											</span>
										</div>
										<div class="review-row">
											<span class="review-key">Path</span>
											<span class="review-value font-mono text-xs">{wizardData.path || pathInput}</span>
										</div>
									</div>
								</div>

								<!-- Basics Section -->
								<div class="review-section">
									<div class="review-section-header">
										<span class="review-section-label">Basics</span>
										<button type="button" class="review-edit-link" onclick={() => goToStep(wizardData.sourceType === 'git' ? 2 : 1)}>Edit</button>
									</div>
									<div class="review-section-body">
										<div class="review-row">
											<span class="review-key">Name</span>
											<span class="review-value">{wizardData.projectName || '(not set)'}</span>
										</div>
										<div class="review-row">
											<span class="review-key">Key</span>
											<span class="review-value font-mono">{wizardData.projectKey || '(not set)'}</span>
										</div>
										{#if wizardData.description}
											<div class="review-row">
												<span class="review-key">Description</span>
												<span class="review-value text-xs">{wizardData.description}</span>
											</div>
										{/if}
									</div>
								</div>

								<!-- Dev Config Section -->
								<div class="review-section">
									<div class="review-section-header">
										<span class="review-section-label">Config</span>
										<button type="button" class="review-edit-link" onclick={() => goToStep(2)}>Edit</button>
									</div>
									<div class="review-section-body">
										<div class="review-row">
											<span class="review-key">Harness</span>
											<span class="review-value">
												{wizardData.harness === 'claude-code' ? 'Claude Code' : wizardData.harness === 'pi' ? 'Pi' : 'Codex'}
											</span>
										</div>
										<div class="review-row">
											<span class="review-key">Port</span>
											<span class="review-value font-mono">{wizardData.port}</span>
										</div>
										{#if wizardData.devCommand}
											<div class="review-row">
												<span class="review-key">Dev Command</span>
												<span class="review-value font-mono text-xs">{wizardData.devCommand}</span>
											</div>
										{/if}
										{#if wizardData.serverPath && wizardData.serverPath !== '/'}
											<div class="review-row">
												<span class="review-key">Server Path</span>
												<span class="review-value font-mono text-xs">{wizardData.serverPath}</span>
											</div>
										{/if}
									</div>
								</div>

								<!-- Colors Section -->
								<div class="review-section">
									<div class="review-section-header">
										<span class="review-section-label">Colors</span>
										<button type="button" class="review-edit-link" onclick={() => goToStep(3)}>Edit</button>
									</div>
									<div class="review-section-body">
										<div class="flex items-center gap-4 py-1">
											<div class="flex items-center gap-2">
												<div
													class="w-4 h-4 rounded-full"
													style="background: {wizardData.activeColor}; box-shadow: 0 0 6px {wizardData.activeColor}80;"
												></div>
												<span class="text-xs font-mono" style="color: oklch(0.65 0.02 250);">Active</span>
											</div>
											<div class="flex items-center gap-2">
												<div
													class="w-4 h-4 rounded-full"
													style="background: {wizardData.inactiveColor};"
												></div>
												<span class="text-xs font-mono" style="color: oklch(0.65 0.02 250);">Inactive</span>
											</div>
										</div>
									</div>
								</div>
							{/if}

							<!-- Error Message -->
							{#if submitError}
								<div
									class="rounded-lg p-3 flex items-center gap-3"
									style="background: oklch(0.25 0.10 25 / 0.3); border: 1px solid oklch(0.45 0.15 25 / 0.4);"
								>
									<svg class="w-5 h-5 flex-shrink-0" style="color: oklch(0.70 0.15 25);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
									</svg>
									<div>
										<p class="text-sm font-semibold" style="color: oklch(0.75 0.12 25);">Creation failed</p>
										<p class="text-xs mt-0.5" style="color: oklch(0.60 0.08 25);">{submitError}</p>
									</div>
									<button
										type="button"
										class="btn btn-xs btn-ghost ml-auto"
										onclick={handleSubmit}
									>
										Retry
									</button>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>

			<!-- Footer Navigation (hidden after success or during creation) -->
			{#if !successMessage && !isSubmitting}
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

	/* Source selection cards */
	.source-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.25rem;
		border-radius: 0.75rem;
		background: oklch(0.20 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.source-card:hover {
		background: oklch(0.22 0.02 250);
		border-color: oklch(0.40 0.04 250);
		transform: translateX(4px);
	}

	.source-card-selected {
		border-color: oklch(0.55 0.18 240);
		background: oklch(0.22 0.05 240 / 0.2);
		box-shadow: 0 0 12px oklch(0.55 0.18 240 / 0.15);
	}

	.source-card-icon {
		width: 3rem;
		height: 3rem;
		border-radius: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		border: 1px solid;
		transition: transform 0.2s;
	}

	.source-card:hover .source-card-icon {
		transform: scale(1.05);
	}

	/* Review sections */
	.review-section {
		border-radius: 0.5rem;
		overflow: hidden;
		border: 1px solid oklch(0.28 0.02 250);
		background: oklch(0.19 0.01 250);
	}

	.review-section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.75rem;
		background: oklch(0.22 0.01 250);
		border-bottom: 1px solid oklch(0.28 0.02 250);
	}

	.review-section-label {
		font-size: 0.6875rem;
		font-family: monospace;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
		color: oklch(0.60 0.02 250);
	}

	.review-edit-link {
		font-size: 0.6875rem;
		font-family: monospace;
		color: oklch(0.65 0.15 240);
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
		transition: color 0.15s;
	}

	.review-edit-link:hover {
		color: oklch(0.80 0.18 240);
		text-decoration: underline;
	}

	.review-section-body {
		padding: 0.5rem 0.75rem;
	}

	.review-row {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		padding: 0.25rem 0;
	}

	.review-key {
		font-size: 0.75rem;
		color: oklch(0.50 0.02 250);
		min-width: 5.5rem;
		flex-shrink: 0;
	}

	.review-value {
		font-size: 0.8125rem;
		color: oklch(0.80 0.02 250);
		word-break: break-all;
	}

	/* Color swatches */
	.color-swatch {
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		border: 2px solid oklch(0.30 0.02 250);
		cursor: pointer;
		transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.color-swatch:hover {
		transform: scale(1.1);
		border-color: oklch(0.60 0.02 250);
	}

	.color-swatch-selected {
		border-color: oklch(0.95 0.02 250);
		transform: scale(1.15);
	}
</style>
