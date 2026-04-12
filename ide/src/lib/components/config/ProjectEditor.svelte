<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import type { ProjectConfig } from '$lib/types/config';
	import { saveProject } from '$lib/stores/configStore.svelte';
	import { successToast, errorToast, infoToast } from '$lib/stores/toasts.svelte';
	import ProjectSecretsEditor from './ProjectSecretsEditor.svelte';
	import ColorPickerField from './ColorPickerField.svelte';
	import { AGENT_PRESETS } from '$lib/types/agentProgram';
	import ProviderLogo from '$lib/components/agents/ProviderLogo.svelte';

	interface Props {
		isOpen: boolean;
		project?: { key: string; config: ProjectConfig } | null;
		onSave?: (key: string, config: ProjectConfig) => void;
		onCancel?: () => void;
		onDelete?: (key: string) => void;
		/** Open the graduation wizard (Solo → Team). Wired by jat-nsa33.7. */
		onGraduate?: (projectKey: string) => void;
		/** Open the downgrade flow (Team → Solo). Wired by jat-nsa33.7. */
		onDowngrade?: (projectKey: string) => void;
	}

	let {
		isOpen = $bindable(false),
		project = null,
		onSave,
		onCancel,
		onDelete,
		onGraduate,
		onDowngrade
	}: Props = $props();

	// Delete confirmation state
	let showDeleteConfirm = $state(false);
	let isDeleting = $state(false);
	let deleteError = $state<string | null>(null);

	// Rename state
	let showRenameModal = $state(false);
	let isRenaming = $state(false);
	let renameError = $state<string | null>(null);
	let newProjectKey = $state('');
	let renameResult = $state<{ killedAgents: string[] } | null>(null);


	// Form state
	let key = $state('');
	let name = $state('');
	let path = $state('');
	let port = $state<number | undefined>(undefined);
	let serverPath = $state('');
	let description = $state('');
	let activeColor = $state('');
	let inactiveColor = $state('');
	let databaseUrl = $state('');
	let hidden = $state(false);
	let defaultHarness = $state('');

	// Sharing & Backend state
	let backend = $state<'sqlite' | 'postgres'>('sqlite');
	let backendUrl = $state('');
	interface ProjectAgent {
		name: string;
		last_active_ts?: string | null;
		model?: string | null;
	}
	let projectAgents = $state<ProjectAgent[]>([]);
	let loadingAgents = $state(false);

	let isTeamBackend = $derived(backend === 'postgres');

	function maskConnectionUrl(url: string): string {
		if (!url) return '';
		try {
			const u = new URL(url);
			if (u.password) u.password = '***';
			return u.toString();
		} catch {
			return url.replace(/:\/\/([^:/@]+):([^@]+)@/, '://$1:***@');
		}
	}

	async function loadProjectAgents(projectKey: string) {
		loadingAgents = true;
		try {
			const res = await fetch(`/api/agents?project=${encodeURIComponent(projectKey)}`);
			if (res.ok) {
				const data = await res.json();
				projectAgents = Array.isArray(data.agents) ? data.agents : [];
			} else {
				projectAgents = [];
			}
		} catch {
			projectAgents = [];
		} finally {
			loadingAgents = false;
		}
	}

	function handleGraduate() {
		if (!project?.key) return;
		if (onGraduate) {
			onGraduate(project.key);
		} else {
			infoToast(
				'Graduation wizard coming soon',
				'Team-mode migration is tracked in jat-nsa33.7'
			);
		}
	}

	function handleDowngrade() {
		if (!project?.key) return;
		if (onDowngrade) {
			onDowngrade(project.key);
		} else {
			infoToast(
				'Downgrade flow coming soon',
				'Team → Solo migration is tracked in jat-nsa33.7'
			);
		}
	}

	function formatLastActive(ts: string | null | undefined): string {
		if (!ts) return 'never';
		const d = new Date(ts);
		if (Number.isNaN(d.getTime())) return ts;
		const diffMs = Date.now() - d.getTime();
		const mins = Math.floor(diffMs / 60000);
		if (mins < 1) return 'just now';
		if (mins < 60) return `${mins}m ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 30) return `${days}d ago`;
		return d.toLocaleDateString();
	}

	// Validation state
	let errors = $state<Record<string, string>>({});
	let touched = $state<Record<string, boolean>>({});

	// Real-time field validation
	function validateField(field: string, value: unknown) {
		touched[field] = true;
		let error: string | null = null;
		switch (field) {
			case 'key':
				error = validateKey(value as string);
				break;
			case 'name':
				error = validateName(value as string);
				break;
			case 'path':
				error = validatePath(value as string);
				break;
			case 'port':
				error = validatePort(value as number | undefined);
				break;
			case 'activeColor':
				error = validateColor(value as string);
				break;
			case 'inactiveColor':
				error = validateColor(value as string);
				break;
		}
		if (error) {
			errors = { ...errors, [field]: error };
		} else {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { [field]: _, ...rest } = errors;
			errors = rest;
		}
	}

	// Is this a new project or editing existing?
	let isNewProject = $derived(!project);

	// Reset form when project changes
	$effect(() => {
		if (isOpen) {
			if (project) {
				key = project.key;
				name = project.config.name || '';
				path = project.config.path || '';
				port = project.config.port;
				serverPath = project.config.server_path || '';
				description = project.config.description || '';
				activeColor = project.config.colors?.active || '';
				inactiveColor = project.config.colors?.inactive || '';
				databaseUrl = project.config.database_url || '';
				hidden = project.config.hidden || false;
				defaultHarness = project.config.default_harness || '';
				backend = project.config.backend || 'sqlite';
				backendUrl = project.config.backend_url || '';
				projectAgents = [];
				loadingAgents = false;
				if (backend === 'postgres') {
					loadProjectAgents(project.key);
				}
			} else {
				// New project - reset all fields
				key = '';
				name = '';
				path = '';
				port = undefined;
				serverPath = '';
				description = '';
				activeColor = '';
				inactiveColor = '';
				databaseUrl = '';
				hidden = false;
				defaultHarness = '';
				backend = 'sqlite';
				backendUrl = '';
				projectAgents = [];
				loadingAgents = false;
			}
			errors = {};
			touched = {};
			// Reset delete state
			showDeleteConfirm = false;
			isDeleting = false;
			deleteError = null;
			// Reset rename state
			showRenameModal = false;
			isRenaming = false;
			renameError = null;
			newProjectKey = '';
			renameResult = null;
			}
	});

	// Auto-generate key from name for new projects
	function generateKeyFromName() {
		if (isNewProject && !touched['key']) {
			key = name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '');
		}
	}

	// Validation functions
	function validateKey(value: string): string | null {
		if (!value.trim()) return 'Project key is required';
		if (!/^[a-z0-9-]+$/.test(value)) return 'Key must be lowercase letters, numbers, and hyphens only';
		if (value.length < 2) return 'Key must be at least 2 characters';
		return null;
	}

	function validateName(value: string): string | null {
		if (!value.trim()) return 'Project name is required';
		return null;
	}

	function validatePath(value: string): string | null {
		if (!value.trim()) return 'Project path is required';
		if (!value.startsWith('/') && !value.startsWith('~')) {
			return 'Path must be absolute (start with / or ~)';
		}
		return null;
	}

	function validatePort(value: number | undefined): string | null {
		if (value === undefined || value === null) return null;
		if (!Number.isInteger(value)) return 'Port must be a whole number';
		if (value < 1 || value > 65535) return 'Port must be between 1 and 65535';
		return null;
	}

	function validateColor(value: string): string | null {
		if (!value.trim()) return null;
		// Accept oklch, hex, rgb, hsl formats
		const colorPatterns = [
			/^oklch\([^)]+\)$/i,
			/^#[0-9a-f]{3,8}$/i,
			/^rgb\([^)]+\)$/i,
			/^rgba\([^)]+\)$/i,
			/^hsl\([^)]+\)$/i,
			/^hsla\([^)]+\)$/i,
			/^[a-z]+$/i // Named colors
		];
		if (!colorPatterns.some(p => p.test(value.trim()))) {
			return 'Invalid color format';
		}
		return null;
	}

	function validateForm(): boolean {
		const newErrors: Record<string, string> = {};

		const keyError = validateKey(key);
		if (keyError) newErrors['key'] = keyError;

		const nameError = validateName(name);
		if (nameError) newErrors['name'] = nameError;

		const pathError = validatePath(path);
		if (pathError) newErrors['path'] = pathError;

		const portError = validatePort(port);
		if (portError) newErrors['port'] = portError;

		const activeColorError = validateColor(activeColor);
		if (activeColorError) newErrors['activeColor'] = activeColorError;

		const inactiveColorError = validateColor(inactiveColor);
		if (inactiveColorError) newErrors['inactiveColor'] = inactiveColorError;

		errors = newErrors;
		return Object.keys(newErrors).length === 0;
	}

	function handleSave() {
		// Mark all fields as touched
		touched = {
			key: true,
			name: true,
			path: true,
			port: true,
			serverPath: true,
			description: true,
			activeColor: true,
			inactiveColor: true,
			databaseUrl: true
		};

		if (!validateForm()) return;

		const config: ProjectConfig = {
			name: name.trim(),
			path: path.trim()
		};

		if (port !== undefined && port !== null) config.port = port;
		if (serverPath.trim()) config.server_path = serverPath.trim();
		if (description.trim()) config.description = description.trim();
		if (activeColor.trim() || inactiveColor.trim()) {
			config.colors = {};
			if (activeColor.trim()) config.colors.active = activeColor.trim();
			if (inactiveColor.trim()) config.colors.inactive = inactiveColor.trim();
		}
		if (databaseUrl.trim()) config.database_url = databaseUrl.trim();
		if (hidden) config.hidden = true;
		if (defaultHarness && defaultHarness !== 'claude-code') {
			config.default_harness = defaultHarness;
		}
		// Preserve backend fields — they're owned by the graduation wizard, not this form
		if (project?.config?.backend) config.backend = project.config.backend;
		if (project?.config?.backend_url) config.backend_url = project.config.backend_url;

		onSave?.(key.trim(), config);
		isOpen = false;
	}

	function handleCancel() {
		onCancel?.();
		isOpen = false;
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleCancel();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			if (showDeleteConfirm) {
				showDeleteConfirm = false;
			} else {
				handleCancel();
			}
		}
	}

	async function handleDelete() {
		if (!project?.key) return;

		isDeleting = true;
		deleteError = null;

		try {
			const response = await fetch('/api/projects', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project: project.key })
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to delete project');
			}

			// Success - close drawer and notify parent
			showDeleteConfirm = false;
			isOpen = false;
			onDelete?.(project.key);
			successToast(`Project "${project.key}" deleted`, 'Removed from configuration');
		} catch (error) {
			deleteError = error instanceof Error ? error.message : 'Failed to delete project';
			errorToast('Failed to delete project', deleteError);
		} finally {
			isDeleting = false;
		}
	}

	function validateNewKey(value: string): string | null {
		if (!value.trim()) return 'New project key is required';
		if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]{1,2}$/.test(value)) {
			return 'Key must be lowercase letters, numbers, and hyphens only';
		}
		if (value.length < 2) return 'Key must be at least 2 characters';
		if (value.length > 50) return 'Key must be 50 characters or less';
		if (value === project?.key) return 'New key must be different from current key';
		return null;
	}

	async function handleRename() {
		if (!project?.key) return;

		const validation = validateNewKey(newProjectKey);
		if (validation) {
			renameError = validation;
			return;
		}

		isRenaming = true;
		renameError = null;
		renameResult = null;

		try {
			const response = await fetch('/api/projects/rename', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					oldKey: project.key,
					newKey: newProjectKey.trim().toLowerCase()
				})
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to rename project');
			}

			// Store result for display
			renameResult = { killedAgents: data.killedAgents || [] };

			// Build success message
			let message = `Project renamed to "${data.newKey}"`;
			if (data.killedAgents?.length > 0) {
				message += `. Stopped ${data.killedAgents.length} agent(s): ${data.killedAgents.join(', ')}`;
			}

			// Close modals and drawer
			showRenameModal = false;
			isOpen = false;

			// Notify parent about the rename (triggers refresh)
			onDelete?.(project.key);

			successToast('Project renamed', message);
		} catch (error) {
			renameError = error instanceof Error ? error.message : 'Failed to rename project';
			errorToast('Failed to rename project', renameError);
		} finally {
			isRenaming = false;
		}
	}

	// Compute the preview path for rename
	let renamePreviewPath = $derived.by(() => {
		if (!path || !newProjectKey) return '';
		const parts = path.split('/');
		parts[parts.length - 1] = newProjectKey.trim().toLowerCase();
		return parts.join('/');
	});

</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
	<!-- Backdrop -->
	<div
		class="fixed inset-0 bg-black/50 z-40"
		transition:fade={{ duration: 200 }}
		onclick={handleBackdropClick}
		role="presentation"
	></div>

	<!-- Side Drawer -->
	<div
		class="fixed right-0 top-0 h-full w-full max-w-lg bg-base-100 shadow-xl z-50 flex flex-col"
		transition:fly={{ x: 400, duration: 300 }}
	>
		<!-- Header -->
		<div class="flex items-center justify-between p-4 border-b border-base-300">
			<h2 class="text-xl font-semibold">
				{isNewProject ? 'Add Project' : 'Edit Project'}
			</h2>
			<button class="btn btn-ghost btn-sm btn-circle" aria-label="Cancel and close" onclick={handleCancel}>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Form Content -->
		<div class="flex-1 overflow-y-auto p-4 space-y-4">
			<!-- Basic Information Section (always open) -->
			<div class="space-y-4">
				<h3 class="text-sm font-medium text-base-content/70 uppercase tracking-wide">Basic Information</h3>

				<!-- Project Key -->
				<div class="form-control">
					<label class="label" for="project-key">
						<span class="label-text">Project Key <span class="text-error">*</span></span>
					</label>
					<input
						id="project-key"
						type="text"
						class="input input-bordered w-full"
						class:input-error={touched['key'] && errors['key']}
						placeholder="my-project"
						bind:value={key}
						readonly={!isNewProject}
						onfocus={() => touched['key'] = true}
						onblur={() => validateField('key', key)}
					/>
					{#if touched['key'] && errors['key']}
						<div class="label">
							<span class="label-text-alt text-error">{errors['key']}</span>
						</div>
					{/if}
					{#if !isNewProject}
						<div class="label">
							<span class="label-text-alt text-base-content/50">Use <button type="button" class="link link-warning" onclick={() => { showRenameModal = true; newProjectKey = ''; renameError = null; }}>Rename</button> to change the project key</span>
						</div>
					{/if}
				</div>

				<!-- Project Name -->
				<div class="form-control">
					<label class="label" for="project-name">
						<span class="label-text">Display Name <span class="text-error">*</span></span>
					</label>
					<input
						id="project-name"
						type="text"
						class="input input-bordered w-full"
						class:input-error={touched['name'] && errors['name']}
						placeholder="My Project"
						bind:value={name}
						onfocus={() => touched['name'] = true}
						onblur={() => { generateKeyFromName(); validateField('name', name); }}
					/>
					{#if touched['name'] && errors['name']}
						<div class="label">
							<span class="label-text-alt text-error">{errors['name']}</span>
						</div>
					{/if}
				</div>

				<!-- Project Path -->
				<div class="form-control">
					<label class="label" for="project-path">
						<span class="label-text">Project Path <span class="text-error">*</span></span>
					</label>
					<input
						id="project-path"
						type="text"
						class="input input-bordered w-full font-mono text-sm"
						class:input-error={touched['path'] && errors['path']}
						placeholder="~/code/my-project"
						bind:value={path}
						onfocus={() => touched['path'] = true}
						onblur={() => validateField('path', path)}
					/>
					{#if touched['path'] && errors['path']}
						<div class="label">
							<span class="label-text-alt text-error">{errors['path']}</span>
						</div>
					{/if}
				</div>

				<!-- Description -->
				<div class="form-control">
					<label class="label" for="project-description">
						<span class="label-text">Description</span>
					</label>
					<textarea
						id="project-description"
						class="textarea textarea-bordered w-full"
						placeholder="Brief description of the project"
						rows="2"
						bind:value={description}
					></textarea>
					<div class="label">
						<span class="label-text-alt text-base-content/50">Shown in project list and agent context</span>
					</div>
				</div>

				<!-- Hidden Toggle -->
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-3">
						<input type="checkbox" class="toggle toggle-primary" bind:checked={hidden} />
						<span class="label-text">Hide from project list</span>
					</label>
				</div>
			</div>

			{#if !isNewProject}
				<!-- Sharing & Backend Section -->
				<details class="group rounded-lg border border-base-300">
					<summary class="cursor-pointer px-4 py-3 text-sm font-medium text-base-content/70 uppercase tracking-wide hover:bg-base-200 rounded-lg flex items-center justify-between">
						Sharing &amp; Backend
						<span class="badge badge-sm {isTeamBackend ? 'badge-info' : 'badge-success'}">{isTeamBackend ? 'Team' : 'Solo'}</span>
					</summary>
					<div class="px-4 pb-4 space-y-4">

					<!-- Current state card -->
					<div
						class="rounded-lg border p-4 space-y-3 {!isTeamBackend ? 'border-success bg-success/5' : 'border-info'}"
					>
						<div class="flex items-center gap-3">
							{#if isTeamBackend}
								<div class="badge badge-info gap-1.5 font-semibold">
									<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
									</svg>
									Team
								</div>
								<span class="text-sm text-base-content/70">Tasks stored in shared Postgres</span>
							{:else}
								<div class="badge badge-success gap-1.5 font-semibold">
									<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									Solo
								</div>
								<span class="text-sm text-base-content/70">Tasks stored locally in SQLite</span>
							{/if}
						</div>

						{#if isTeamBackend}
							<!-- Connection info -->
							<div class="space-y-2">
								<div class="text-xs font-medium text-base-content/60 uppercase tracking-wide">Connection</div>
								<div
									class="font-mono text-xs bg-base-300 rounded px-2 py-1.5 break-all select-all"
									title="Password is masked. Configure backend_url in ~/.config/jat/projects.json"
								>
									{backendUrl ? maskConnectionUrl(backendUrl) : '— no backend_url configured —'}
								</div>
							</div>

							<!-- Agents list -->
							<div class="space-y-2">
								<div class="text-xs font-medium text-base-content/60 uppercase tracking-wide">
									Team members ({projectAgents.length})
								</div>
								{#if loadingAgents}
									<div class="flex items-center gap-2 text-sm text-base-content/50">
										<span class="loading loading-spinner loading-xs"></span>
										Loading agents…
									</div>
								{:else if projectAgents.length === 0}
									<div class="text-sm text-base-content/50 italic">No agents registered yet</div>
								{:else}
									<ul class="space-y-1">
										{#each projectAgents as agent (agent.name)}
											<li class="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-base-200">
												<div class="flex items-center gap-2">
													<div class="w-1.5 h-1.5 rounded-full bg-success"></div>
													<span class="font-medium">{agent.name}</span>
													{#if agent.model}
														<span class="text-xs text-base-content/50">· {agent.model}</span>
													{/if}
												</div>
												<span class="text-xs text-base-content/50">
													{formatLastActive(agent.last_active_ts)}
												</span>
											</li>
										{/each}
									</ul>
								{/if}
							</div>

							<!-- Downgrade link -->
							<div class="pt-2 border-t border-base-300">
								<button
									type="button"
									class="btn btn-ghost btn-sm btn-xs text-error hover:bg-error/10"
									onclick={handleDowngrade}
								>
									<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
									</svg>
									Downgrade to solo…
								</button>
								<p class="text-xs text-base-content/50 mt-1 px-1">
									Disconnects this project from the shared Postgres backend. Team members lose access to these tasks.
								</p>
							</div>
						{:else}
							<!-- Graduate CTA -->
							<button
								type="button"
								class="btn btn-primary w-full gap-2"
								onclick={handleGraduate}
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
								</svg>
								Graduate to team
							</button>
							<p class="text-xs text-base-content/50 px-1">
								Move this project's tasks to a shared Postgres database so teammates can collaborate.
							</p>
						{/if}
					</div>

					<!-- What's still local -->
					<details class="rounded-lg border border-base-300 bg-base-200/50">
						<summary class="cursor-pointer px-4 py-2.5 text-sm font-medium hover:bg-base-200 rounded-lg flex items-center gap-2">
							<svg class="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							What's still local
						</summary>
						<div class="px-4 pb-3 pt-1 text-xs text-base-content/70 space-y-2">
							<p>
								Even in Team mode, some data stays on each developer's machine. Graduating only
								moves the task database — everything below remains per-machine:
							</p>
							<ul class="space-y-1 ml-4 list-disc">
								<li><span class="font-mono">tmux</span> sessions (agent processes)</li>
								<li><span class="font-mono">.jat/memory/</span> (agent memory &amp; context)</li>
								<li>Claude Code hooks (<span class="font-mono">.claude/hooks/</span>)</li>
								<li>Signal files (<span class="font-mono">/tmp/jat-signal-*</span>)</li>
								<li>Session identity files (<span class="font-mono">.claude/sessions/</span>)</li>
								<li>Per-machine credentials (<span class="font-mono">~/.config/jat/credentials.json</span>)</li>
							</ul>
						</div>
					</details>

					</div>
				</details>
			{/if}

			<!-- Agent Defaults Section -->
			<details class="group rounded-lg border border-base-300">
				<summary class="cursor-pointer px-4 py-3 text-sm font-medium text-base-content/70 uppercase tracking-wide hover:bg-base-200 rounded-lg flex items-center justify-between">
					Agent Defaults
					<span class="text-xs font-normal normal-case text-base-content/50">{(AGENT_PRESETS.find(p => p.id === defaultHarness) || AGENT_PRESETS.find(p => p.id === 'claude-code'))?.config.name ?? ''}</span>
				</summary>
				<div class="px-4 pb-4">
					<div class="form-control">
						<label class="label" for="project-default-harness">
							<span class="label-text">Default Agent Program</span>
						</label>
						<div class="flex items-center gap-2 flex-wrap">
							{#each AGENT_PRESETS as preset}
								<button type="button"
									class="btn btn-sm gap-1.5 {defaultHarness === preset.id || (!defaultHarness && preset.id === 'claude-code') ? 'btn-primary' : 'btn-ghost'}"
									onclick={() => defaultHarness = preset.id}
								>
									<ProviderLogo agentId={preset.id} size={16} />
									<span class="text-xs">{preset.config.name}</span>
								</button>
							{/each}
						</div>
						<div class="label">
							<span class="label-text-alt text-base-content/50">Used when spawning new agents for this project</span>
						</div>
					</div>
				</div>
			</details>

			<!-- Server Configuration Section -->
			<details class="group rounded-lg border border-base-300">
				<summary class="cursor-pointer px-4 py-3 text-sm font-medium text-base-content/70 uppercase tracking-wide hover:bg-base-200 rounded-lg flex items-center justify-between">
					Server &amp; Secrets
					{#if port}
						<span class="text-xs font-normal normal-case text-base-content/50">:{port}</span>
					{/if}
				</summary>
				<div class="px-4 pb-4 space-y-4">

				<!-- Port -->
				<div class="form-control">
					<label class="label" for="project-port">
						<span class="label-text">Dev Server Port</span>
					</label>
					<input
						id="project-port"
						type="number"
						class="input input-bordered w-full"
						class:input-error={touched['port'] && errors['port']}
						placeholder="3000"
						min="1"
						max="65535"
						step="1"
						bind:value={port}
						onfocus={() => touched['port'] = true}
						onblur={() => validateField('port', port)}
					/>
					{#if touched['port'] && errors['port']}
						<div class="label">
							<span class="label-text-alt text-error">{errors['port']}</span>
						</div>
					{:else}
						<div class="label">
							<span class="label-text-alt text-base-content/50">Port the IDE uses to detect and link to the running dev server</span>
						</div>
					{/if}
				</div>

				<!-- Server Path -->
				<div class="form-control">
					<label class="label" for="project-server-path">
						<span class="label-text">Server Subdirectory</span>
					</label>
					<input
						id="project-server-path"
						type="text"
						class="input input-bordered w-full font-mono text-sm"
						placeholder="server"
						bind:value={serverPath}
					/>
					<div class="label">
						<span class="label-text-alt text-base-content/50">Subfolder within the project path where the server runs, e.g. <code>server</code></span>
					</div>
				</div>

				<!-- Project Secrets (only for existing projects) -->
				{#if !isNewProject && key}
					<ProjectSecretsEditor projectKey={key} />
				{:else}
					<div class="mt-4 p-3 rounded-lg" style="background: oklch(0.18 0.02 250 / 0.5);">
						<p class="text-xs" style="color: oklch(0.55 0.02 250);">
							<svg class="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							Save the project first to configure secrets (database URLs, API keys, etc.)
						</p>
					</div>
				{/if}

				</div>
			</details>

				<!-- Display Colors Section -->
			<details class="group rounded-lg border border-base-300">
				<summary class="cursor-pointer px-4 py-3 text-sm font-medium text-base-content/70 uppercase tracking-wide hover:bg-base-200 rounded-lg flex items-center gap-3">
					Display Colors
					{#if activeColor || inactiveColor}
						<span class="flex gap-1.5 ml-auto">
							{#if activeColor}
								<span class="w-4 h-4 rounded-full border border-base-content/20" style="background: {activeColor};"></span>
							{/if}
							{#if inactiveColor}
								<span class="w-4 h-4 rounded-full border border-base-content/20" style="background: {inactiveColor};"></span>
							{/if}
						</span>
					{/if}
				</summary>
				<div class="px-4 pb-4 grid grid-cols-2 gap-4">
					<ColorPickerField
						bind:value={activeColor}
						label="Active Badge"
						id="project-active-color"
						placeholder="oklch(0.7 0.15 150)"
						error={errors['activeColor']}
						touched={touched['activeColor']}
						onValidate={(v) => validateField('activeColor', v)}
					/>
					<ColorPickerField
						bind:value={inactiveColor}
						label="Inactive Badge"
						id="project-inactive-color"
						placeholder="oklch(0.5 0.1 150)"
						error={errors['inactiveColor']}
						touched={touched['inactiveColor']}
						onValidate={(v) => validateField('inactiveColor', v)}
					/>
				</div>
			</details>
			{#if !isNewProject}
				<!-- Danger Zone -->
				<div class="rounded-lg border border-error/30 p-4 space-y-3">
					<h3 class="text-sm font-medium text-error/70 uppercase tracking-wide">Danger Zone</h3>
					<div class="flex gap-2">
						<button
							class="btn btn-sm btn-warning btn-outline"
							onclick={() => { showRenameModal = true; newProjectKey = ''; renameError = null; }}
							disabled={isRenaming || isDeleting}
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
							</svg>
							Rename
						</button>
						<button
							class="btn btn-sm btn-error btn-outline"
							onclick={() => showDeleteConfirm = true}
							disabled={isDeleting || isRenaming}
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
							</svg>
							Delete
						</button>
					</div>
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<div class="flex justify-end gap-2 p-4 border-t border-base-300">
			<button class="btn btn-ghost" onclick={handleCancel}>
				Cancel
			</button>
			<button class="btn btn-primary" onclick={handleSave}>
				{isNewProject ? 'Create Project' : 'Save Changes'}
			</button>
		</div>
	</div>

	<!-- Delete Confirmation Modal -->
	{#if showDeleteConfirm}
		<div
			class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
			transition:fade={{ duration: 150 }}
			onclick={(e) => e.target === e.currentTarget && (showDeleteConfirm = false)}
			onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showDeleteConfirm = false; } }}
			role="dialog"
			aria-modal="true"
			aria-labelledby="delete-confirm-title"
			tabindex="0"
		>
			<div
				class="bg-base-100 rounded-xl shadow-2xl max-w-md w-full"
				transition:fly={{ y: 20, duration: 200 }}
			>
				<div class="p-6">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
							<svg class="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>
						<div>
							<h3 id="delete-confirm-title" class="text-lg font-semibold">Delete Project</h3>
							<p class="text-sm text-base-content/70">This action cannot be undone</p>
						</div>
					</div>

					<p class="mb-4">
						Are you sure you want to remove <span class="font-semibold text-error">{project?.key}</span> from the configuration?
					</p>

					<div class="bg-base-200 rounded-lg p-3 mb-4 text-sm">
						<p class="text-base-content/70">
							<strong>Note:</strong> This only removes the project from the JAT configuration file. The actual project directory and files will not be deleted.
						</p>
					</div>

					{#if deleteError}
						<div class="alert alert-error mb-4">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>{deleteError}</span>
						</div>
					{/if}

					<div class="flex justify-end gap-2">
						<button
							class="btn btn-ghost"
							onclick={() => showDeleteConfirm = false}
							disabled={isDeleting}
						>
							Cancel
						</button>
						<button
							class="btn btn-error"
							onclick={handleDelete}
							disabled={isDeleting}
						>
							{#if isDeleting}
								<span class="loading loading-spinner loading-sm"></span>
								Deleting...
							{:else}
								Delete Project
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- Rename Confirmation Modal -->
	{#if showRenameModal}
		<div
			class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
			transition:fade={{ duration: 150 }}
			onclick={(e) => e.target === e.currentTarget && !isRenaming && (showRenameModal = false)}
			onkeydown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !isRenaming) { e.preventDefault(); showRenameModal = false; } }}
			role="dialog"
			aria-modal="true"
			aria-labelledby="rename-modal-title"
			tabindex="0"
		>
			<div
				class="bg-base-100 rounded-xl shadow-2xl max-w-md w-full"
				transition:fly={{ y: 20, duration: 200 }}
			>
				<div class="p-6">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
							<svg class="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
							</svg>
						</div>
						<div>
							<h3 id="rename-modal-title" class="text-lg font-semibold">Rename Project</h3>
							<p class="text-sm text-base-content/70">Change the project folder name and key</p>
						</div>
					</div>

					<p class="mb-4">
						Rename <span class="font-semibold text-warning">{project?.key}</span> to a new name.
					</p>

					<!-- Current path display -->
					<div class="bg-base-200 rounded-lg p-3 mb-4 text-sm font-mono">
						<div class="text-base-content/50 text-xs mb-1">Current path:</div>
						<div class="text-base-content/70">{path}</div>
					</div>

					<!-- New key input -->
					<div class="form-control mb-4">
						<label class="label" for="new-project-key">
							<span class="label-text font-medium">New Project Key</span>
						</label>
						<input
							id="new-project-key"
							type="text"
							class="input input-bordered w-full"
							class:input-error={renameError}
							placeholder="new-project-name"
							bind:value={newProjectKey}
							oninput={() => renameError = null}
							disabled={isRenaming}
						/>
						<div class="label">
							<span class="label-text-alt text-base-content/50">
								Lowercase letters, numbers, and hyphens only
							</span>
						</div>
					</div>

					<!-- Preview new path -->
					{#if newProjectKey.trim()}
						<div class="bg-base-200 rounded-lg p-3 mb-4 text-sm font-mono">
							<div class="text-base-content/50 text-xs mb-1">New path:</div>
							<div class="text-success">{renamePreviewPath}</div>
						</div>
					{/if}

					<!-- Warning about agents -->
					<div class="bg-warning/10 border border-warning/30 rounded-lg p-3 mb-4 text-sm">
						<div class="flex items-start gap-2">
							<svg class="w-5 h-5 text-warning shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
							<div class="text-warning">
								<strong>Running agents will be stopped.</strong> Any active agent sessions on this project will be terminated before renaming.
							</div>
						</div>
					</div>

					{#if renameError}
						<div class="alert alert-error mb-4">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<span>{renameError}</span>
						</div>
					{/if}

					<div class="flex justify-end gap-2">
						<button
							class="btn btn-ghost"
							onclick={() => showRenameModal = false}
							disabled={isRenaming}
						>
							Cancel
						</button>
						<button
							class="btn btn-warning"
							onclick={handleRename}
							disabled={isRenaming || !newProjectKey.trim()}
						>
							{#if isRenaming}
								<span class="loading loading-spinner loading-sm"></span>
								Renaming...
							{:else}
								Rename Project
							{/if}
						</button>
					</div>
				</div>
			</div>
		</div>
	{/if}

{/if}
