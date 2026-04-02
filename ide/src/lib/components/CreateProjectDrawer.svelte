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
	import ColorSwatchPicker from '$lib/components/ui/ColorSwatchPicker.svelte';

	// Props
	interface Props {
		onProjectCreated?: () => void;
	}
	let { onProjectCreated }: Props = $props();

	// ─── Wizard Step Definitions ───────────────────────────────────

	const STEPS = [
		{ label: 'Source',     icon: '1' },
		{ label: 'Basics',     icon: '2' },
		{ label: 'Tech Stack', icon: '3' },
		{ label: 'Dev Server', icon: '4' },
		{ label: 'Review',     icon: '5' },
	] as const;

	type SourceType = 'url' | 'scratch' | null;

	interface WizardData {
		// Step 0: Source
		sourceType: SourceType;
		path: string;
		// Step 1: Basics
		projectName: string;
		projectKey: string;
		description: string;
		// Step 3: Dev Server
		harness: string;
		port: number;
		devCommand: string;
		serverPath: string;
		// Step 4: Review (colors)
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
		serverPath: '',
		activeColor: '',
		inactiveColor: '',
	});

	// ─── GitHub Metadata (from clone response) ────────────────────
	interface RepoMeta {
		description: string;
		language: string;
		defaultBranch: string;
		openIssuesCount: number;
		homepage: string;
		topics: string[];
	}
	let repoMeta = $state<RepoMeta | null>(null);

	// ─── Starter Task Templates ────────────────────────────────────

	interface StarterTask {
		id: string;
		label: string;
		description: string;
		taskDescription: string;  // Full description sent to the agent
		type: 'task';
		priority: number;
		labels: string[];
		condition: (meta: RepoMeta | null) => boolean;
		preChecked: (meta: RepoMeta | null) => boolean;
		detail: (meta: RepoMeta | null) => string;  // Dynamic subtitle
	}

	const STARTER_TASKS: StarterTask[] = [
		{
			id: 'setup-kb',
			label: 'Set up project knowledge bases',
			description: 'Agent reads codebase and creates KB entries',
			taskDescription: `Analyze the project codebase and create structured knowledge bases for agents working on this project.\n\n**Steps:**\n1. Read README.md, package.json/requirements.txt/Cargo.toml, and key config files\n2. Create a "Tech Stack" knowledge base (always-inject) with: language, framework, dependencies, build tools, testing setup\n3. Create an "Architecture" knowledge base with: directory structure, key modules, data flow, API patterns\n4. Create a "Development" knowledge base with: setup instructions, environment variables, common commands, gotchas\n5. If there's a CLAUDE.md or AGENTS.md, incorporate its contents\n\nUse the IDE's knowledge base API (POST /api/bases) to create each base.`,
			type: 'task',
			priority: 1,
			labels: ['onboarding', 'knowledge-base'],
			condition: () => true,
			preChecked: () => true,
			detail: () => 'Creates Tech Stack, Architecture, and Development knowledge bases',
		},
		{
			id: 'verify-dev',
			label: 'Verify dev environment',
			description: 'Install deps, run server, confirm everything works',
			taskDescription: `Verify the development environment is fully working.\n\n**Steps:**\n1. Install dependencies (npm install / pip install / cargo build)\n2. Run the dev server and confirm it starts without errors\n3. Run the test suite (if any) and note pass/fail counts\n4. Check for any missing environment variables or config\n5. Document any setup issues or gotchas found\n\nUpdate the task with findings. If there are issues, create follow-up tasks.`,
			type: 'task',
			priority: 2,
			labels: ['onboarding', 'dev-environment'],
			condition: () => true,
			preChecked: () => true,
			detail: () => 'Installs deps, runs server, runs tests',
		},
		{
			id: 'import-issues',
			label: 'Import GitHub issues as tasks',
			description: 'Fetch open issues and create JAT tasks',
			taskDescription: `Import open GitHub issues into JAT Tasks.\n\n**Steps:**\n1. Use the GitHub API to fetch all open issues from this repository\n2. For each issue, create a JAT task with:\n   - Title from issue title\n   - Description from issue body\n   - Labels mapped from GitHub labels\n   - Priority mapped from labels (bug → P1, enhancement → P2, etc.)\n3. Skip pull requests (only import issues)\n4. Add a comment on each task noting the original GitHub issue URL\n\nReport how many issues were imported.`,
			type: 'task',
			priority: 2,
			labels: ['onboarding', 'github'],
			condition: (meta) => (meta?.openIssuesCount ?? 0) > 0,
			preChecked: (meta) => (meta?.openIssuesCount ?? 0) > 0,
			detail: (meta) => `${meta?.openIssuesCount ?? 0} open issues found`,
		},
		{
			id: 'scrape-website',
			label: 'Scrape website for branding context',
			description: 'Extract colors, fonts, and copy from project website',
			taskDescription: `Visit the project's website and extract branding information for agents.\n\n**Steps:**\n1. Navigate to the project homepage using browser automation tools\n2. Take screenshots of key pages (home, about, features)\n3. Extract: primary/secondary colors, fonts, logo, tagline, key copy\n4. Create a "Branding" knowledge base with the extracted information\n5. If the site has a docs section, note the URL structure for future reference\n\nStore findings in a knowledge base so agents can maintain brand consistency.`,
			type: 'task',
			priority: 3,
			labels: ['onboarding', 'branding'],
			condition: (meta) => !!(meta?.homepage),
			preChecked: (meta) => !!(meta?.homepage),
			detail: (meta) => meta?.homepage || '',
		},
		{
			id: 'analyze-todos',
			label: 'Analyze codebase for task backlog',
			description: 'Find TODOs, FIXMEs, and missing tests',
			taskDescription: `Scan the codebase for actionable items and create a task backlog.\n\n**Steps:**\n1. Search for TODO, FIXME, HACK, XXX comments across the codebase\n2. Identify files/modules with no test coverage\n3. Look for deprecated dependencies or outdated patterns\n4. Create a JAT task for each significant finding with:\n   - Clear title describing the work needed\n   - File path and line number in description\n   - Appropriate priority (FIXME → P1, TODO → P2, nice-to-have → P3)\n5. Group related items into a single task where appropriate\n\nReport summary of findings.`,
			type: 'task',
			priority: 3,
			labels: ['onboarding', 'codebase-analysis'],
			condition: () => true,
			preChecked: () => false,
			detail: () => 'Finds TODOs, FIXMEs, missing tests',
		},
		{
			id: 'security-audit',
			label: 'Security audit',
			description: 'Check deps, secrets, vulnerabilities',
			taskDescription: `Perform a security audit of the project.\n\n**Steps:**\n1. Run dependency vulnerability check (npm audit / pip-audit / cargo audit)\n2. Scan for hardcoded secrets, API keys, or credentials in the codebase\n3. Check .gitignore for sensitive file patterns (.env, credentials, keys)\n4. Review authentication and authorization patterns if present\n5. Check for common web vulnerabilities (XSS, injection, CSRF) if applicable\n6. Create tasks for any findings, prioritized by severity\n\nReport summary with severity levels.`,
			type: 'task',
			priority: 3,
			labels: ['onboarding', 'security'],
			condition: () => true,
			preChecked: () => false,
			detail: () => 'Checks deps, secrets, vulnerabilities',
		},
	];

	// Track which starter tasks the user has selected
	let selectedStarterTasks = $state<Set<string>>(new Set());

	// Initialize starter task selections based on conditions and pre-check logic
	function initStarterTaskSelections() {
		const selected = new Set<string>();
		for (const task of STARTER_TASKS) {
			if (task.condition(repoMeta) && task.preChecked(repoMeta)) {
				selected.add(task.id);
			}
		}
		selectedStarterTasks = selected;
	}

	// Available starter tasks (filtered by condition)
	const availableStarterTasks = $derived(
		STARTER_TASKS.filter(t => t.condition(repoMeta))
	);

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

	// ─── Known Services (Tech Stack step) ────────────────────────

	interface ServiceDef {
		id: string;
		label: string;
		description: string;
		accentColor: string;
		icon: string;
		secrets: JatConfigSecret[];
		integration?: Omit<JatConfigIntegration, 'requires'> & { requires?: string[] };
	}

	const KNOWN_SERVICES: ServiceDef[] = [
		{
			id: 'supabase',
			label: 'Supabase',
			description: 'Database, auth & storage',
			accentColor: 'oklch(0.55 0.18 145)',
			icon: '<svg viewBox="0 0 109 113" fill="none"><path d="M63.7 110.3c-2.6 3.3-8.1 1.6-8.2-2.6l-1.6-56.5h37.8c6.9 0 10.6 8 6.2 13.3L63.7 110.3z" fill="url(#sb1)"/><defs><linearGradient id="sb1" x1="53.97" y1="54.97" x2="94.17" y2="71.82" gradientUnits="userSpaceOnUse"><stop stop-color="#249361"/><stop offset="1" stop-color="#3ECF8E"/></linearGradient></defs><path d="M45.3 2.1c2.6-3.3 8.2-1.6 8.2 2.6l.7 56.5H17.8c-6.8 0-10.6-8-6.2-13.4L45.3 2.1z" fill="#3ECF8E"/></svg>',
			secrets: [
				{ key: 'supabase-url', label: 'Project URL', type: 'url', required: true, placeholder: 'https://xxx.supabase.co', group: 'Supabase' },
				{ key: 'supabase-service-role-key', label: 'Service Role Key', type: 'secret', required: true, placeholder: 'eyJ...', group: 'Supabase' },
			],
			integration: {
				id: 'feedback', type: 'supabase', label: 'User Feedback',
				description: 'Creates tasks from feedback submissions',
				enabled: true, requires: ['supabase-url', 'supabase-service-role-key'],
				pollInterval: 120,
				taskDefaults: { type: 'bug', priority: 2, labels: ['feedback'] },
				config: {
					projectUrl: '$supabase-url', secretName: '@supabase-service-role-key',
					table: 'feedback_reports', statusColumn: 'status', statusNew: 'submitted',
					taskIdColumn: 'jat_task_id', titleColumn: 'title',
					descriptionTemplate: '**Reporter:** {reporter_name} ({reporter_email})\n**Page:** {page_url}\n\n{description}',
					authorColumn: 'reporter_email', timestampColumn: 'created_at',
					attachmentColumn: 'screenshot_paths', storageBucket: 'feedback-screenshots',
				},
				automation: { action: 'delay', command: '/jat:start', delay: 5, delayUnit: 'minutes' },
			},
		},
		{
			id: 'stripe',
			label: 'Stripe',
			description: 'Payments & subscriptions',
			accentColor: 'oklch(0.55 0.18 270)',
			icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/></svg>',
			secrets: [
				{ key: 'stripe-secret-key', label: 'Secret Key', type: 'secret', required: true, placeholder: 'sk_live_...', group: 'Stripe' },
				{ key: 'stripe-webhook-secret', label: 'Webhook Secret', type: 'secret', required: false, placeholder: 'whsec_...', group: 'Stripe' },
			],
		},
		{
			id: 'cloudflare',
			label: 'Cloudflare Pages',
			description: 'Deployment monitoring',
			accentColor: 'oklch(0.65 0.15 45)',
			icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.51 15.86l.55-1.89c.12-.41.08-.79-.11-1.07-.17-.25-.45-.4-.78-.42l-8.07-.1a.17.17 0 01-.15-.09.17.17 0 01.01-.18c.04-.06.1-.1.17-.1l8.16-.1c.83-.05 1.74-.72 2.07-1.53l.42-1.03a.35.35 0 00.02-.18A5.82 5.82 0 0013.26 4a5.84 5.84 0 00-5.32 3.45 2.56 2.56 0 00-3.97 1.75A4.09 4.09 0 000 13.25a.16.16 0 00.16.17h15.87c.08 0 .14-.04.17-.11l.31-.95v-.5zM20.16 9.22a.09.09 0 00-.09.02.09.09 0 00-.04.08 3.37 3.37 0 01-.13.81l-.53 1.81c-.12.41-.08.79.11 1.07.17.25.45.4.78.42l2.1.1c.06 0 .12.04.15.09a.17.17 0 01-.01.18c-.04.06-.1.1-.17.1l-2.19.1c-.84.05-1.74.72-2.07 1.53l-.12.3a.08.08 0 00.04.1.08.08 0 00.05.02h5.73A.22.22 0 0024 15.8 5.59 5.59 0 0020.16 9.22z"/></svg>',
			secrets: [
				{ key: 'cloudflare-api-token', label: 'API Token', type: 'secret', required: true, placeholder: 'Token with Pages:Read', group: 'Cloudflare' },
				{ key: 'cloudflare-account-id', label: 'Account ID', type: 'string', required: true, placeholder: '48c159dd...', group: 'Cloudflare' },
				{ key: 'cloudflare-pages-project', label: 'Pages Project', type: 'string', required: true, placeholder: 'my-app', group: 'Cloudflare' },
			],
			integration: {
				id: 'deployments', type: 'cloudflare-pages', label: 'Deploy Failures',
				description: 'Creates tasks when deployments fail',
				enabled: true, requires: ['cloudflare-api-token', 'cloudflare-account-id', 'cloudflare-pages-project'],
				pollInterval: 60,
				taskDefaults: { type: 'task', priority: 2, labels: ['deployment'] },
				config: {
					accountId: '$cloudflare-account-id', pagesProject: '$cloudflare-pages-project',
					secretName: '@cloudflare-api-token', fetchLogs: true,
					filter: [{ field: 'status', operator: 'equals', value: 'failure' }],
				},
				automation: { action: 'delay', command: '/jat:start', delay: 2, delayUnit: 'minutes' },
			},
		},
		{
			id: 'resend',
			label: 'Resend',
			description: 'Transactional email',
			accentColor: 'oklch(0.60 0.15 0)',
			icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2.4 0L12 11.6 19.6 6H4.4zM20 7.87l-8 5.93-8-5.93V18h16V7.87z"/></svg>',
			secrets: [
				{ key: 'resend-api-key', label: 'API Key', type: 'secret', required: true, placeholder: 're_...', group: 'Resend' },
			],
		},
		{
			id: 'openai',
			label: 'OpenAI',
			description: 'GPT & embeddings',
			accentColor: 'oklch(0.60 0.12 160)',
			icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.28 9.37a6.04 6.04 0 00-.52-4.93 6.1 6.1 0 00-6.57-2.93A6.06 6.06 0 0010.68 0a6.1 6.1 0 00-5.82 4.23 6.05 6.05 0 00-4.03 2.93 6.1 6.1 0 00.75 7.15 6.04 6.04 0 00.52 4.93 6.1 6.1 0 006.57 2.93A6.06 6.06 0 0013.18 24a6.1 6.1 0 005.82-4.22 6.05 6.05 0 004.03-2.93 6.1 6.1 0 00-.75-7.48zM13.18 22.44a4.56 4.56 0 01-2.93-1.06l.15-.08 4.86-2.81a.79.79 0 00.4-.69v-6.86l2.05 1.19a.07.07 0 01.04.06v5.68a4.58 4.58 0 01-4.57 4.57zM3.6 18.31a4.54 4.54 0 01-.55-3.06l.15.09 4.86 2.81a.79.79 0 00.79 0l5.93-3.43v2.37a.07.07 0 01-.03.06l-4.91 2.84a4.58 4.58 0 01-6.24-1.68zM2.34 7.9A4.54 4.54 0 014.72 5.9v5.78a.79.79 0 00.4.68l5.93 3.43-2.05 1.18a.08.08 0 01-.07 0l-4.91-2.83A4.58 4.58 0 012.34 7.9zm17.23 4.01l-5.93-3.43 2.05-1.18a.08.08 0 01.07 0l4.91 2.83a4.57 4.57 0 01-.7 8.24v-5.78a.79.79 0 00-.4-.68zm2.04-3.08l-.15-.09-4.86-2.81a.79.79 0 00-.79 0L9.88 9.36V6.99a.07.07 0 01.03-.06l4.91-2.83a4.57 4.57 0 016.79 4.73zM8.72 12.87l-2.05-1.19a.07.07 0 01-.04-.06V5.94a4.57 4.57 0 017.5-3.5l-.15.08-4.86 2.81a.79.79 0 00-.4.69v6.85zm1.11-2.4l2.64-1.53 2.64 1.52v3.05l-2.64 1.53-2.64-1.53v-3.04z"/></svg>',
			secrets: [
				{ key: 'openai-api-key', label: 'API Key', type: 'secret', required: true, placeholder: 'sk-...', group: 'OpenAI' },
			],
		},
		{
			id: 'anthropic',
			label: 'Anthropic',
			description: 'Claude AI',
			accentColor: 'oklch(0.60 0.18 30)',
			icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.83 2L21 22h-4.3l-7.17-20h4.3zM7.17 2L0 22h4.3l7.17-20H7.17z"/></svg>',
			secrets: [
				{ key: 'anthropic-api-key', label: 'API Key', type: 'secret', required: true, placeholder: 'sk-ant-...', group: 'Anthropic' },
			],
		},
	];

	const TEMPLATE_PRESETS = [
		{ label: 'JST SaaS', path: '~/code/jst', description: 'SvelteKit + Supabase + Stripe' },
	];

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

	// Colors: assign suggested color when entering Review (step 4)
	$effect(() => {
		if (currentStep === 4 && !wizardData.activeColor) {
			wizardData.activeColor = suggestedColor;
		}
	});

	// Starter tasks: initialize on Review (step 4)
	let starterTasksInitialized = $state(false);
	$effect(() => {
		if (currentStep === 4 && !starterTasksInitialized) {
			starterTasksInitialized = true;
			initStarterTaskSelections();
		}
	});

	// Port: suggest when entering Dev Server (step 3)
	$effect(() => {
		if (currentStep === 3 && wizardData.port === 3000 && existingPorts.length > 0) {
			wizardData.port = suggestedPort;
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
		// Sync path when leaving step 0
		if (currentStep === 0) {
			if (wizardData.sourceType === 'scratch' && !wizardData.path && pathInput.trim()) {
				wizardData.path = pathInput.trim();
			}
			// For url/git: wizardData.path is already set by clone handler or validation
		}
		goToStep(currentStep + 1);
	}

	function selectSource(type: 'url' | 'scratch') {
		wizardData.sourceType = type;
		// Reset input states when switching source type
		cloneSuccess = false;
		cloneError = null;
		validationStatus = 'idle';
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
				if (wizardData.sourceType === 'url') {
					// URL/git: must have cloned (cloneSuccess) or validated a local path
					return cloneSuccess || (validationStatus === 'valid' || validationStatus === 'will-create' || validationStatus === 'already-initialized' || validationStatus === 'needs-git');
				}
				if (wizardData.sourceType === 'scratch') {
					return pathInput.trim().length > 0;
				}
				return false;
			case 1:
				return wizardData.projectName.trim().length > 0 && wizardData.projectKey.trim().length > 0;
			case 2:
				return true; // tech stack is always optional
			case 3: {
				const p = wizardData.port;
				return p >= 1024 && p <= 65535;
			}
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

	// ─── Git Clone state (Step 0 when sourceType='url') ──────────
	let gitUrl = $state('');
	let gitTargetPath = $state('');
	let gitBranch = $state('');
	let gitUrlError = $state<string | null>(null);
	let gitRepoName = $state('');
	let isCloning = $state(false);
	let cloneError = $state<string | null>(null);
	let cloneSuccess = $state(false);

	const isGitUrlInput = $derived(
		gitUrl.startsWith('https://') || gitUrl.startsWith('git@') || gitUrl.startsWith('git://')
	);
	const isLocalPathInput = $derived(
		(gitUrl.startsWith('/') || gitUrl.startsWith('~')) && !isGitUrlInput
	);

	// ─── jat.config.json integration state (Step 4) ──────────────────
	interface JatConfigSecret {
		key: string;
		label: string;
		type: string;
		required?: boolean;
		placeholder?: string;
		description?: string;
		group?: string;
	}
	interface JatConfigIntegration {
		id: string;
		type: string;
		label?: string;
		description?: string;
		enabled?: boolean;
		requires?: string[];
		pollInterval?: number;
		taskDefaults?: Record<string, any>;
		config?: Record<string, any>;
		automation?: Record<string, any>;
	}
	interface JatConfig {
		version: number;
		name?: string;
		description?: string;
		port?: number;
		devCommand?: string;
		secrets?: JatConfigSecret[];
		integrations?: JatConfigIntegration[];
	}

	let projectConfig = $state<JatConfig | null>(null);
	let configLoading = $state(false);
	let secretValues = $state<Record<string, string>>({});
	let selectedIntegrations = $state<Set<string>>(new Set());

	// Derived: required secret keys for the currently selected integrations
	const configRequiredKeys = $derived.by(() => {
		if (!projectConfig) return [] as string[];
		return [...new Set(
			(projectConfig.integrations ?? [])
				.filter(i => selectedIntegrations.has(i.id))
				.flatMap(i => i.requires ?? [])
		)];
	});

	// Derived: secrets grouped by their group field
	const configSecretsByGroup = $derived.by(() => {
		const groups: Map<string, JatConfigSecret[]> = new Map();
		for (const k of configRequiredKeys) {
			const def = (projectConfig?.secrets ?? []).find(s => s.key === k);
			const group = def?.group ?? '';
			if (!groups.has(group)) groups.set(group, []);
			groups.get(group)!.push(def ?? { key: k, label: k, type: 'secret' });
		}
		return [...groups.entries()];
	});

	// Tech stack step — manual service selection (used when no jat.config.json)
	let selectedServices = $state<Set<string>>(new Set());

	// Derived: all secrets needed across selected services (for manual mode)
	const serviceRequiredSecrets = $derived.by(() => {
		const seen = new Set<string>();
		const result: JatConfigSecret[] = [];
		for (const svc of KNOWN_SERVICES) {
			if (!selectedServices.has(svc.id)) continue;
			for (const s of svc.secrets) {
				if (!seen.has(s.key)) {
					seen.add(s.key);
					result.push(s);
				}
			}
		}
		return result;
	});

	// Derived: integrations from selected services (for manual mode)
	const serviceIntegrations = $derived.by(() =>
		KNOWN_SERVICES
			.filter(s => selectedServices.has(s.id) && s.integration)
			.map(s => s.integration!)
	);

	// Fetch jat.config.json when entering the tech stack step (step 2)
	$effect(() => {
		if (currentStep !== 2) return;

		const path = wizardData.path || pathInput.trim();
		if (!path) return;

		configLoading = true;
		fetch(`/api/projects/config?path=${encodeURIComponent(path)}`)
			.then((r) => r.json())
			.then((data) => {
				if (data.success && data.config) {
					projectConfig = data.config;
					// Pre-select integrations that are enabled by default
					const preSelected = new Set<string>();
					for (const integ of data.config.integrations ?? []) {
						if (integ.enabled !== false) preSelected.add(integ.id);
					}
					selectedIntegrations = preSelected;
					// Initialize secret values as empty
					const vals: Record<string, string> = {};
					for (const s of data.config.secrets ?? []) {
						vals[s.key] = '';
					}
					secretValues = vals;
				} else {
					projectConfig = null;
				}
			})
			.catch(() => { projectConfig = null; })
			.finally(() => { configLoading = false; });
	});

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
		// Use gitUrl when in url/import mode, otherwise use pathInput
		const rawPath = wizardData.sourceType === 'url' ? gitUrl.trim() : pathInput.trim();

		if (!rawPath) {
			validationStatus = 'idle';
			validationMessage = null;
			selectedDirectory = null;
			return;
		}

		validationStatus = 'checking';
		validationMessage = 'Checking path...';

		const trimmedPath = rawPath;
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

	// After validatePath resolves for url/local path input, sync path to wizardData
	$effect(() => {
		if (wizardData.sourceType === 'url' && isLocalPathInput &&
			(validationStatus === 'valid' || validationStatus === 'will-create' || validationStatus === 'already-initialized' || validationStatus === 'needs-git')) {
			wizardData.path = gitUrl.trim();
		}
	});

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

	/** Handle git URL input — validate and auto-populate target path, or validate local path */
	function handleGitUrlInput() {
		gitUrlError = null;
		cloneError = null;
		cloneSuccess = false;

		if (!gitUrl.trim()) {
			gitRepoName = '';
			gitTargetPath = '';
			validationStatus = 'idle';
			validationMessage = null;
			return;
		}

		// If it looks like a local path, validate it
		if (gitUrl.startsWith('/') || gitUrl.startsWith('~')) {
			gitRepoName = '';
			clearTimeout(validationTimeout);
			validationTimeout = setTimeout(validatePath, 500);
			return;
		}

		const { valid, repoName } = parseGitUrl(gitUrl);
		if (valid) {
			gitRepoName = repoName;
			// Only auto-populate if user hasn't manually edited the path
			if (!gitTargetPath || gitTargetPath === `~/projects/${gitRepoName}` || gitTargetPath.match(/^~\/projects\/[^/]*$/)) {
				gitTargetPath = `~/projects/${repoName}`;
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

			// Store GitHub metadata and auto-fill fields
			if (data.repoMeta) {
				repoMeta = data.repoMeta;
				initStarterTaskSelections();

				if (data.repoMeta.description && !wizardData.description) {
					wizardData.description = data.repoMeta.description;
				}
				if (data.repoMeta.language && wizardData.devCommand === 'npm run dev') {
					const langCommands: Record<string, string> = {
						'TypeScript': 'npm run dev',
						'JavaScript': 'npm run dev',
						'Python': 'python manage.py runserver',
						'Rust': 'cargo run',
						'Go': 'go run .',
						'Ruby': 'bin/rails server',
						'PHP': 'php artisan serve',
						'Java': './gradlew bootRun',
						'Kotlin': './gradlew bootRun',
						'Elixir': 'mix phx.server',
						'Dart': 'flutter run',
						'Swift': 'swift run',
					};
					const suggested = langCommands[data.repoMeta.language];
					if (suggested) wizardData.devCommand = suggested;
				}
			}

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
		if (wizardData.sourceType === 'url' && cloneSuccess) {
			steps.push({ label: 'Cloned repository', status: 'done' });
		} else if (wizardData.sourceType === 'scratch') {
			steps.push({ label: 'Created directory (if needed)', status: 'pending' });
		}
		steps.push({ label: 'Initialized git (if needed)', status: 'pending' });
		steps.push({ label: 'Initialized JAT Tasks', status: 'pending' });
		steps.push({ label: 'Added to projects.json', status: 'pending' });
		steps.push({ label: 'Installed dependencies', status: 'pending' });
		if (wizardData.activeColor) {
			steps.push({ label: 'Configured project colors', status: 'pending' });
		}
		if (selectedStarterTasks.size > 0) {
			steps.push({ label: `Created ${selectedStarterTasks.size} starter task${selectedStarterTasks.size === 1 ? '' : 's'}`, status: 'pending' });
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

			createdProjectKey = data.project?.prefix || data.project?.name?.toLowerCase() || null;

			// Create starter tasks (best-effort, don't fail the whole flow)
			if (selectedStarterTasks.size > 0 && createdProjectKey) {
				const tasksToCreate = STARTER_TASKS.filter(t => selectedStarterTasks.has(t.id));
				const taskResults = await Promise.allSettled(
					tasksToCreate.map(task =>
						fetch('/api/tasks', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								title: task.label,
								description: task.taskDescription,
								type: task.type,
								priority: task.priority,
								labels: task.labels,
								project: createdProjectKey,
							})
						})
					)
				);
				const created = taskResults.filter(r => r.status === 'fulfilled').length;
				if (created > 0) {
					creationSteps = [...(data.steps || []), `Created ${created} starter task${created === 1 ? '' : 's'}`];
				} else {
					creationSteps = data.steps || [];
				}
			} else {
				creationSteps = data.steps || [];
			}

			// Set up integrations — from jat.config.json OR from manually selected services
			const hasConfigInteg = projectConfig && selectedIntegrations.size > 0;
			const hasManualInteg = !projectConfig && selectedServices.size > 0;

			if (createdProjectKey && (hasConfigInteg || hasManualInteg)) {
				try {
					let integsToSetup: JatConfigIntegration[];
					let secretsPayload: Record<string, string> = {};

					if (hasConfigInteg) {
						// Config-driven path (existing logic)
						const requiredKeys = new Set<string>();
						integsToSetup = [];
						for (const integ of projectConfig!.integrations ?? []) {
							if (selectedIntegrations.has(integ.id)) {
								integsToSetup.push(integ);
								for (const k of integ.requires ?? []) requiredKeys.add(k);
							}
						}
						for (const k of requiredKeys) {
							if (secretValues[k]?.trim()) secretsPayload[k] = secretValues[k].trim();
						}
					} else {
						// Manual service selection path
						integsToSetup = serviceIntegrations;
						for (const s of serviceRequiredSecrets) {
							if (secretValues[s.key]?.trim()) secretsPayload[s.key] = secretValues[s.key].trim();
						}
					}

					const integRes = await fetch('/api/projects/setup-integrations', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							projectKey: createdProjectKey,
							secrets: secretsPayload,
							integrations: integsToSetup,
						}),
					});
					const integData = await integRes.json();
					if (integData.success && integData.steps?.length > 0) {
						creationSteps = [...creationSteps, ...integData.steps];
					}

					// Write back jat.config.json if manually configured and no config existed
					if (hasManualInteg && wizardData.path) {
						try {
							const configToWrite = {
								version: 1,
								name: wizardData.projectName || createdProjectKey,
								port: wizardData.port,
								devCommand: wizardData.devCommand,
								secrets: serviceRequiredSecrets,
								integrations: serviceIntegrations,
							};
							await fetch('/api/projects/config', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ path: wizardData.path, config: configToWrite }),
							});
							creationSteps = [...creationSteps, 'Wrote jat.config.json'];
						} catch { /* non-blocking */ }
					}
				} catch {
					// Integration setup failure is non-blocking
				}
			}

			successMessage = data.message || `Successfully added ${data.project?.name}`;
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
			serverPath: '',
			activeColor: '',
			inactiveColor: '',
		};
		projectConfig = null;
		configLoading = false;
		secretValues = {};
		selectedIntegrations = new Set();
		selectedServices = new Set();
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
		repoMeta = null;
		selectedStarterTasks = new Set();
		starterTasksInitialized = false;
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
		<div aria-label="close sidebar" class="drawer-overlay" role="button" tabindex="-1" onclick={handleClose} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClose(); } }}></div>

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
					<div class="p-6 flex flex-col gap-5">
						<div>
							<h3 class="text-base font-semibold font-mono" style="color: oklch(0.80 0.02 250);">How would you like to start?</h3>
							<p class="text-sm mt-1" style="color: oklch(0.50 0.02 250);">Import an existing project or start fresh.</p>
						</div>

						<!-- Card: Import -->
						<div>
							<button type="button" class="source-card group w-full" class:source-card-selected={wizardData.sourceType === 'url'} onclick={() => selectSource('url')}>
								<div class="source-card-icon" style="background: oklch(0.25 0.08 240 / 0.3); border-color: oklch(0.40 0.12 240 / 0.4);">
									<svg class="w-6 h-6" style="color: oklch(0.70 0.12 240);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
										<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3 3m0 0l3-3m-3 3V1.5m6 9l3 3m0 0l3-3m-3 3V1.5" />
									</svg>
								</div>
								<div class="flex-1 text-left">
									<h4 class="text-sm font-semibold font-mono" style="color: oklch(0.85 0.02 250);">Import from URL or Path</h4>
									<p class="text-xs mt-0.5" style="color: oklch(0.55 0.02 250);">Clone a git repo or point to a local project</p>
								</div>
							</button>

							{#if wizardData.sourceType === 'url'}
							<div class="mt-3 flex flex-col gap-4 pl-2 border-l-2" style="border-color: oklch(0.35 0.10 240 / 0.5);">
								<!-- Template quick-fills -->
								<div class="flex flex-col gap-1.5">
									<div class="text-xs font-mono uppercase tracking-wider" style="color: oklch(0.50 0.02 250);">Quick start from template</div>
									<div class="flex flex-wrap gap-2">
										{#each TEMPLATE_PRESETS as preset}
											<button
												type="button"
												class="btn btn-xs font-mono"
												style="background: oklch(0.25 0.05 270 / 0.4); border-color: oklch(0.40 0.10 270 / 0.5); color: oklch(0.75 0.10 270);"
												onclick={() => { gitUrl = preset.path; gitRepoName = preset.label; gitTargetPath = ''; cloneSuccess = false; cloneError = null; handleGitUrlInput(); }}
												disabled={isCloning || cloneSuccess}
											>
												{preset.label}
											</button>
										{/each}
									</div>
								</div>

								<!-- URL / path input -->
								<div class="flex flex-col gap-1.5">
									<div class="text-xs font-mono uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">Repository URL or local path</div>
									<input
										type="text"
										class="input input-bordered w-full font-mono text-sm"
										placeholder="https://github.com/user/repo  or  ~/projects/myapp"
										bind:value={gitUrl}
										oninput={handleGitUrlInput}
										onpaste={handleGitUrlPaste}
										disabled={isCloning || cloneSuccess}
										style="background: oklch(0.20 0.01 250); border-color: {gitUrlError ? 'oklch(0.55 0.18 25)' : (gitRepoName || validationStatus === 'valid') ? 'oklch(0.50 0.15 145)' : 'oklch(0.30 0.02 250)'}; color: oklch(0.85 0.02 250);"
									/>
									{#if gitUrlError}
										<p class="text-xs" style="color: oklch(0.65 0.18 25);">{gitUrlError}</p>
									{:else if gitRepoName && !isLocalPathInput}
										<p class="text-xs" style="color: oklch(0.60 0.12 145);">Repository: {gitRepoName}</p>
									{/if}
								</div>

								<!-- Git clone extra fields — only shown for git URLs -->
								{#if isGitUrlInput && !cloneSuccess}
									<div class="flex flex-col gap-3">
										<div class="flex flex-col gap-1.5">
											<div class="text-xs font-mono uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">Clone to directory</div>
											<input
												type="text"
												class="input input-bordered w-full font-mono text-sm"
												placeholder="~/projects/my-project"
												bind:value={gitTargetPath}
												disabled={isCloning}
												style="background: oklch(0.20 0.01 250); border-color: oklch(0.30 0.02 250); color: oklch(0.85 0.02 250);"
											/>
										</div>
										<div class="flex flex-col gap-1.5">
											<div class="text-xs font-mono uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">Branch <span style="color: oklch(0.40 0.02 250);">(optional)</span></div>
											<input
												type="text"
												class="input input-bordered w-full font-mono text-sm"
												placeholder="main"
												bind:value={gitBranch}
												disabled={isCloning}
												style="background: oklch(0.20 0.01 250); border-color: oklch(0.30 0.02 250); color: oklch(0.85 0.02 250);"
											/>
										</div>
										<button
											type="button"
											class="btn w-full font-mono"
											style="background: oklch(0.35 0.12 240); border: 1px solid oklch(0.50 0.15 240); color: oklch(0.95 0.02 250);"
											onclick={handleGitClone}
											disabled={isCloning || !gitRepoName || !!gitUrlError}
										>
											{#if isCloning}
												<span class="loading loading-spinner loading-sm"></span> Cloning...
											{:else}
												<svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 3v12m0 0a3 3 0 103 3H9a3 3 0 10-3-3m0 0h12a3 3 0 103-3m-3 3V6a3 3 0 10-3-3" /></svg>
												Clone Repository
											{/if}
										</button>
									</div>
								{/if}

								<!-- Local path validation status -->
								{#if isLocalPathInput && validationStatus !== 'idle'}
									<div class="flex items-center gap-2 text-xs">
										{#if validationStatus === 'checking'}
											<span class="loading loading-spinner loading-xs"></span>
											<span style="color: oklch(0.60 0.02 250);">Checking path...</span>
										{:else if validationStatus === 'valid' || validationStatus === 'already-initialized' || validationStatus === 'needs-git'}
											<svg class="w-4 h-4" style="color: oklch(0.60 0.15 145);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
											<span style="color: oklch(0.60 0.15 145);">{validationMessage}</span>
										{:else if validationStatus === 'will-create'}
											<svg class="w-4 h-4" style="color: oklch(0.60 0.15 200);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
											<span style="color: oklch(0.60 0.15 200);">{validationMessage}</span>
										{:else if validationStatus === 'invalid'}
											<svg class="w-4 h-4" style="color: oklch(0.60 0.15 25);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
											<span style="color: oklch(0.60 0.15 25);">{validationMessage}</span>
										{/if}
									</div>
								{/if}

								<!-- Clone error/success -->
								{#if cloneError}
									<div class="rounded-lg p-3 text-sm" style="background: oklch(0.25 0.10 25 / 0.3); border: 1px solid oklch(0.45 0.15 25 / 0.4); color: oklch(0.75 0.12 25);">{cloneError}</div>
								{/if}
								{#if cloneSuccess}
									<div class="rounded-lg p-3 flex items-center gap-3" style="background: oklch(0.22 0.08 145 / 0.3); border: 1px solid oklch(0.45 0.15 145 / 0.4);">
										<div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background: oklch(0.40 0.15 145); color: oklch(0.95 0.02 250);">
											<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
										</div>
										<div>
											<p class="text-sm font-semibold" style="color: oklch(0.80 0.12 145);">Cloned successfully</p>
											<p class="text-xs font-mono mt-0.5" style="color: oklch(0.55 0.02 250);">{wizardData.path}</p>
										</div>
									</div>
								{/if}
							</div>
							{/if}
						</div>

						<!-- Card: Scratch -->
						<div>
							<button type="button" class="source-card group w-full" class:source-card-selected={wizardData.sourceType === 'scratch'} onclick={() => selectSource('scratch')}>
								<div class="source-card-icon" style="background: oklch(0.25 0.08 300 / 0.3); border-color: oklch(0.40 0.12 300 / 0.4);">
									<svg class="w-6 h-6" style="color: oklch(0.70 0.12 300);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
										<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
									</svg>
								</div>
								<div class="flex-1 text-left">
									<h4 class="text-sm font-semibold font-mono" style="color: oklch(0.85 0.02 250);">Start from Scratch</h4>
									<p class="text-xs mt-0.5" style="color: oklch(0.55 0.02 250);">Create a new empty project directory</p>
								</div>
							</button>

							{#if wizardData.sourceType === 'scratch'}
							<div class="mt-3 flex flex-col gap-3 pl-2 border-l-2" style="border-color: oklch(0.35 0.10 300 / 0.5);">
								<div class="flex flex-col gap-1.5">
									<div class="text-xs font-mono uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">Project directory</div>
									<input
										type="text"
										bind:this={pathInputRef}
										class="input input-bordered w-full font-mono text-sm"
										placeholder="~/projects/my-new-app"
										bind:value={pathInput}
										oninput={() => { if (!nameManuallyEdited) { const p = pathInput.trim(); const parts = p.replace(/\/+$/, '').split('/'); wizardData.projectName = parts[parts.length - 1] || ''; } }}
										style="background: oklch(0.20 0.01 250); border-color: oklch(0.30 0.02 250); color: oklch(0.85 0.02 250);"
									/>
									<p class="text-xs" style="color: oklch(0.45 0.02 250);">Directory will be created if it doesn't exist</p>
								</div>
							</div>
							{/if}
						</div>
					</div>

					<!-- ═══════ STEP 1: Basics ═══════ -->
					{:else if currentStep === 1}
					<div class="p-6 flex flex-col gap-5">
						<div>
							<h3 class="text-base font-semibold font-mono" style="color: oklch(0.80 0.02 250);">Project Details</h3>
							<p class="text-sm mt-1" style="color: oklch(0.50 0.02 250);">Name your project and give it a unique key.</p>
						</div>
						<!-- Project Name -->
						<div class="flex flex-col gap-1.5">
							<div class="text-xs font-mono uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">Project Name</div>
							<input
								type="text"
								class="input input-bordered w-full font-mono text-sm"
								placeholder="My Project"
								bind:value={wizardData.projectName}
								oninput={() => { nameManuallyEdited = true; }}
								style="background: oklch(0.20 0.01 250); border-color: oklch(0.30 0.02 250); color: oklch(0.85 0.02 250);"
							/>
						</div>
						<!-- Project Key -->
						<div class="flex flex-col gap-1.5">
							<div class="text-xs font-mono uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">Project Key <span style="color: oklch(0.40 0.02 250);">(prefix for task IDs)</span></div>
							<input
								type="text"
								class="input input-bordered w-full font-mono text-sm"
								placeholder="my-project"
								bind:value={wizardData.projectKey}
								oninput={() => { keyManuallyEdited = true; }}
								style="background: oklch(0.20 0.01 250); border-color: oklch(0.30 0.02 250); color: oklch(0.85 0.02 250);"
							/>
							<p class="text-xs" style="color: oklch(0.45 0.02 250);">Tasks will be named {wizardData.projectKey || 'key'}-abc123</p>
						</div>
						<!-- Description -->
						<div class="flex flex-col gap-1.5">
							<div class="text-xs font-mono uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">Description <span style="color: oklch(0.40 0.02 250);">(optional)</span></div>
							<textarea
								class="textarea textarea-bordered w-full font-mono text-sm resize-none"
								placeholder="What does this project do?"
								bind:value={wizardData.description}
								rows="3"
								style="background: oklch(0.20 0.01 250); border-color: oklch(0.30 0.02 250); color: oklch(0.85 0.02 250);"
							></textarea>
						</div>
					</div>

					<!-- ═══════ STEP 2: Tech Stack ═══════ -->
					{:else if currentStep === 2}
					<div class="p-6 flex flex-col gap-5">
						<div>
							<h3 class="text-base font-semibold font-mono" style="color: oklch(0.80 0.02 250);">Tech Stack</h3>
							<p class="text-sm mt-1" style="color: oklch(0.50 0.02 250);">
								Select the services your project uses. Credentials are stored securely via <code class="font-mono">jat-secret</code>.
							</p>
						</div>

						{#if configLoading}
							<div class="flex items-center gap-2 text-sm" style="color: oklch(0.60 0.02 250);">
								<span class="loading loading-spinner loading-sm"></span>
								Checking for jat.config.json...
							</div>
						{:else if projectConfig}
							<!-- Config detected -->
							<div class="rounded-lg p-3 flex items-center gap-3" style="background: oklch(0.22 0.08 145 / 0.2); border: 1px solid oklch(0.45 0.15 145 / 0.3);">
								<svg class="w-4 h-4 flex-shrink-0" style="color: oklch(0.60 0.15 145);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
								<p class="text-xs" style="color: oklch(0.70 0.12 145);">
									<span class="font-semibold">jat.config.json detected</span> — integrations pre-configured
								</p>
							</div>

							<!-- Integrations from config -->
							<div class="flex flex-col gap-3">
								{#each projectConfig.integrations ?? [] as integ}
									{@const isSelected = selectedIntegrations.has(integ.id)}
									<label class="flex items-start gap-3 cursor-pointer p-3 rounded-lg transition-colors"
										style="background: {isSelected ? 'oklch(0.22 0.06 240 / 0.3)' : 'oklch(0.18 0.01 250)'}; border: 1px solid {isSelected ? 'oklch(0.40 0.12 240 / 0.4)' : 'oklch(0.25 0.02 250)'};">
										<input type="checkbox" class="checkbox checkbox-sm mt-0.5" checked={isSelected}
											onchange={() => {
												const next = new Set(selectedIntegrations);
												if (isSelected) next.delete(integ.id); else next.add(integ.id);
												selectedIntegrations = next;
											}}
										/>
										<div class="flex flex-col gap-0.5">
											<span class="text-sm font-semibold" style="color: oklch(0.80 0.02 250);">{integ.label ?? integ.id}</span>
											{#if integ.description}<span class="text-xs" style="color: oklch(0.50 0.02 250);">{integ.description}</span>{/if}
										</div>
									</label>
								{/each}
							</div>

							<!-- Secret fields for selected config integrations -->
							{#if configRequiredKeys.length > 0}
								<div class="flex flex-col gap-4">
									{#each configSecretsByGroup as [group, groupSecrets]}
										<div class="flex flex-col gap-2">
											{#if group}
												<div class="text-xs font-mono font-semibold uppercase tracking-wider" style="color: oklch(0.60 0.12 240);">{group}</div>
											{/if}
											{#each groupSecrets as secret}
												<div class="flex flex-col gap-1.5">
													<label class="text-xs" style="color: oklch(0.55 0.02 250);" for="ts-secret-{secret.key}">
														{secret.label ?? secret.key}
														{#if !secret.required}<span style="color: oklch(0.40 0.02 250);"> (optional)</span>{/if}
													</label>
													<input
														id="ts-secret-{secret.key}"
														type={secret.type === 'secret' ? 'password' : (secret.type === 'url' ? 'url' : 'text')}
														class="input input-bordered input-sm w-full font-mono text-xs"
														placeholder={secret.placeholder ?? ''}
														bind:value={secretValues[secret.key]}
														style="background: oklch(0.20 0.01 250); border-color: oklch(0.30 0.02 250); color: oklch(0.85 0.02 250);"
													/>
													{#if secret.description}
														<p class="text-[11px]" style="color: oklch(0.45 0.02 250);">{secret.description}</p>
													{/if}
												</div>
											{/each}
										</div>
									{/each}
								</div>
							{/if}

						{:else}
							<!-- Manual service tile selection -->
							<div class="grid grid-cols-2 gap-2">
								{#each KNOWN_SERVICES as svc}
									{@const isSelected = selectedServices.has(svc.id)}
									<button
										type="button"
										class="flex flex-col gap-1 p-3 rounded-lg text-left transition-all"
										style="background: {isSelected ? `color-mix(in oklch, ${svc.accentColor} 15%, oklch(0.18 0.01 250))` : 'oklch(0.18 0.01 250)'}; border: 1px solid {isSelected ? `color-mix(in oklch, ${svc.accentColor} 50%, transparent)` : 'oklch(0.25 0.02 250)'};"
										onclick={() => {
											const next = new Set(selectedServices);
											if (isSelected) next.delete(svc.id); else next.add(svc.id);
											selectedServices = next;
										}}
									>
										<div class="flex items-center justify-between">
											<div class="flex items-center gap-2">
												<span class="w-5 h-5 flex-shrink-0" style="color: {isSelected ? svc.accentColor : 'oklch(0.50 0.02 250)'};">{@html svc.icon}</span>
												<span class="text-sm font-semibold font-mono" style="color: {isSelected ? svc.accentColor : 'oklch(0.75 0.02 250)'};">{svc.label}</span>
											</div>
											{#if isSelected}
												<svg class="w-4 h-4 flex-shrink-0" style="color: {svc.accentColor};" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
											{/if}
										</div>
										<span class="text-xs ml-7" style="color: oklch(0.50 0.02 250);">{svc.description}</span>
									</button>
								{/each}
							</div>

							<!-- Secret fields for selected services -->
							{#if serviceRequiredSecrets.length > 0}
								<div class="flex flex-col gap-4 pt-2">
									<div class="text-xs font-mono uppercase tracking-wider" style="color: oklch(0.55 0.02 250);">Credentials</div>
									{#each serviceRequiredSecrets as secret}
										<div class="flex flex-col gap-1.5">
											<label class="text-xs font-semibold" style="color: oklch(0.65 0.02 250);" for="ts-svc-{secret.key}">
												{secret.label}
												{#if !secret.required}<span class="font-normal" style="color: oklch(0.40 0.02 250);"> (optional)</span>{/if}
											</label>
											<input
												id="ts-svc-{secret.key}"
												type={secret.type === 'secret' ? 'password' : (secret.type === 'url' ? 'url' : 'text')}
												class="input input-bordered input-sm w-full font-mono text-xs"
												placeholder={secret.placeholder ?? ''}
												bind:value={secretValues[secret.key]}
												style="background: oklch(0.20 0.01 250); border-color: oklch(0.30 0.02 250); color: oklch(0.85 0.02 250);"
											/>
											{#if secret.description}
												<p class="text-[11px]" style="color: oklch(0.45 0.02 250);">{secret.description}</p>
											{/if}
										</div>
									{/each}
								</div>
							{/if}

							{#if selectedServices.size === 0}
								<p class="text-xs text-center" style="color: oklch(0.45 0.02 250);">
									Select services above or leave empty to proceed with JAT minimal setup.
								</p>
							{/if}
						{/if}
					</div>

					<!-- ═══════ STEP 3: Dev Server ═══════ -->
					{:else if currentStep === 3}
					<div class="p-6 flex flex-col gap-5">
						<div>
							<h3 class="text-base font-semibold font-mono" style="color: oklch(0.80 0.02 250);">Dev Server</h3>
							<p class="text-sm mt-1" style="color: oklch(0.50 0.02 250);">Configure how JAT starts your development environment.</p>
						</div>

						<!-- Default Agent Harness -->
						<div class="form-control">
							<div class="text-xs font-mono uppercase tracking-wider mb-1.5" style="color: oklch(0.60 0.02 250);">
								Default Agent Harness
							</div>
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
							<div class="text-xs font-mono uppercase tracking-wider mb-1.5" style="color: oklch(0.60 0.02 250);">
								Dev Server Port
							</div>
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
							<div class="text-xs font-mono uppercase tracking-wider mb-1.5" style="color: oklch(0.60 0.02 250);">
								Dev Command <span style="color: oklch(0.40 0.02 250);">(optional)</span>
							</div>
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
							<div class="text-xs font-mono uppercase tracking-wider mb-1.5" style="color: oklch(0.60 0.02 250);">
								Server Path <span style="color: oklch(0.40 0.02 250);">(optional)</span>
							</div>
							<input
								type="text"
								class="input input-bordered w-full font-mono text-sm"
								style="background: oklch(0.20 0.01 250); border-color: oklch(0.35 0.02 250); color: oklch(0.90 0.02 250);"
								placeholder="e.g. frontend, packages/web"
								bind:value={wizardData.serverPath}
							/>
							<span class="text-[11px] mt-1" style="color: oklch(0.45 0.02 250);">
								Subdirectory where server runs (if not project root)
							</span>
						</div>
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
												goto(project ? `/tasks?project=${encodeURIComponent(project)}` : '/tasks');
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

								<!-- Colors — pick at top of review -->
								<div class="review-section">
									<div class="review-section-header">
										<span class="review-section-label">Colors</span>
									</div>
									<div class="review-section-body flex flex-col gap-3">
										<div class="flex items-start gap-6">
											<div class="flex flex-col items-center gap-1.5">
												<ColorSwatchPicker
													value={wizardData.activeColor}
													palette={COLOR_PALETTE}
													onchange={(color) => { wizardData.activeColor = color; inactiveColorManuallyEdited = false; }}
													label="Active"
												/>
											</div>
											<div class="flex flex-col items-center gap-1.5">
												<ColorSwatchPicker
													value={wizardData.inactiveColor}
													palette={COLOR_PALETTE}
													onchange={(color) => { wizardData.inactiveColor = color; inactiveColorManuallyEdited = true; }}
													label="Inactive"
												/>
												{#if !inactiveColorManuallyEdited && wizardData.inactiveColor}
													<span class="text-[10px]" style="color: oklch(0.40 0.02 250);">auto-derived</span>
												{/if}
											</div>
										</div>
										{#if wizardData.activeColor}
											<div class="flex items-center gap-3 px-2 py-1.5 rounded" style="background: oklch(0.20 0.03 250); border: 1px solid oklch(0.28 0.02 250);">
												<div class="flex items-center gap-2">
													<div class="w-3 h-3 rounded-full" style="background: {wizardData.activeColor}; box-shadow: 0 0 6px {wizardData.activeColor}80;"></div>
													<span class="text-xs font-mono font-bold uppercase" style="color: {wizardData.activeColor};">{wizardData.projectKey || 'project'}</span>
												</div>
												<span class="text-[10px]" style="color: oklch(0.40 0.02 250);">active</span>
												<div style="width: 1px; height: 16px; background: oklch(0.30 0.02 250);"></div>
												<div class="flex items-center gap-2">
													<div class="w-3 h-3 rounded-full" style="background: {wizardData.inactiveColor};"></div>
													<span class="text-xs font-mono font-bold uppercase" style="color: {wizardData.inactiveColor};">{wizardData.projectKey || 'project'}</span>
												</div>
												<span class="text-[10px]" style="color: oklch(0.40 0.02 250);">inactive</span>
											</div>
										{/if}
									</div>
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
												{wizardData.sourceType === 'url' && cloneSuccess ? 'Cloned from Git' : wizardData.sourceType === 'url' ? 'Imported from Path' : 'New Project'}
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
										<button type="button" class="review-edit-link" onclick={() => goToStep(1)}>Edit</button>
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

								<!-- Dev Server Section -->
								<div class="review-section">
									<div class="review-section-header">
										<span class="review-section-label">Dev Server</span>
										<button type="button" class="review-edit-link" onclick={() => goToStep(3)}>Edit</button>
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

							<!-- Starter Tasks Section -->
							{#if availableStarterTasks.length > 0}
								<div class="review-section">
									<div class="review-section-header">
										<span class="review-section-label">Starter Tasks</span>
										<button
											type="button"
											class="review-edit-link"
											onclick={() => {
												if (selectedStarterTasks.size === availableStarterTasks.length) {
													selectedStarterTasks = new Set();
												} else {
													selectedStarterTasks = new Set(availableStarterTasks.map(t => t.id));
												}
											}}
										>
											{selectedStarterTasks.size === availableStarterTasks.length ? 'Deselect all' : 'Select all'}
										</button>
									</div>
									<div class="review-section-body" style="padding: 0;">
										{#each availableStarterTasks as task}
											<label
												class="flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors"
												style="border-bottom: 1px solid oklch(0.25 0.02 250); {selectedStarterTasks.has(task.id) ? 'background: oklch(0.22 0.03 240 / 0.3);' : ''}"
											>
												<input
													type="checkbox"
													class="checkbox checkbox-sm mt-0.5"
													checked={selectedStarterTasks.has(task.id)}
													onchange={() => {
														const next = new Set(selectedStarterTasks);
														if (next.has(task.id)) {
															next.delete(task.id);
														} else {
															next.add(task.id);
														}
														selectedStarterTasks = next;
													}}
													style="border-color: oklch(0.40 0.02 250); {selectedStarterTasks.has(task.id) ? 'background: oklch(0.50 0.18 240); border-color: oklch(0.60 0.18 240);' : ''}"
												/>
												<div class="flex-1 min-w-0">
													<div class="text-sm font-mono" style="color: {selectedStarterTasks.has(task.id) ? 'oklch(0.85 0.02 250)' : 'oklch(0.65 0.02 250)'};">
														{task.label}
													</div>
													<div class="text-xs mt-0.5" style="color: oklch(0.50 0.02 250);">
														{task.detail(repoMeta)}
													</div>
												</div>
												<div class="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
													{#each task.labels.slice(1) as label}
														<span
															class="text-[10px] font-mono px-1.5 py-0.5 rounded"
															style="background: oklch(0.25 0.04 250); color: oklch(0.55 0.04 250);"
														>
															{label}
														</span>
													{/each}
													<span
														class="text-[10px] font-mono px-1.5 py-0.5 rounded"
														style="background: oklch(0.25 0.02 250); color: oklch(0.50 0.02 250);"
													>
														P{task.priority}
													</span>
												</div>
											</label>
										{/each}
									</div>
									{#if selectedStarterTasks.size > 0}
										<div
											class="px-3 py-2 text-xs font-mono"
											style="color: oklch(0.55 0.08 240); background: oklch(0.18 0.02 240 / 0.3); border-top: 1px solid oklch(0.25 0.02 250);"
										>
											{selectedStarterTasks.size} task{selectedStarterTasks.size === 1 ? '' : 's'} will be created for agents to pick up
										</div>
									{/if}
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

</style>
