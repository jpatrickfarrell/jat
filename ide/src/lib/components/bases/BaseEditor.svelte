<script lang="ts">
	/**
	 * BaseEditor - Create/edit drawer for knowledge bases.
	 * Full-screen overlay with form for base properties.
	 */
	import type { KnowledgeBase, SourceType, CreateBaseInput, UpdateBaseInput, ExternalSourceConfig } from '$lib/types/knowledgeBase';
	import { SOURCE_TYPE_INFO, SOURCE_TYPES } from '$lib/types/knowledgeBase';
	import { createBase, updateBase } from '$lib/stores/bases.svelte';
	import { CRON_PRESETS, describeCron, validateCron } from '$lib/utils/cronUtils';
	import { fly } from 'svelte/transition';

	interface Props {
		isOpen?: boolean;
		base?: KnowledgeBase | null;
		onSave?: (base: KnowledgeBase) => void;
		onCancel?: () => void;
		class?: string;
	}

	let { isOpen = $bindable(false), base = null, onSave, onCancel, class: className = '' }: Props = $props();

	// Form state
	let name = $state('');
	let description = $state('');
	let sourceType = $state<SourceType>('manual');
	let content = $state('');
	let contextQuery = $state('');
	let alwaysInject = $state(false);
	let saving = $state(false);
	let error = $state<string | null>(null);

	// External source state
	let externalUrl = $state('');
	let sourceSubtype = $state<'url' | 'coda' | 'gsheet'>('url');
	let refreshCron = $state('');
	let customCron = $state('');
	let useCustomCron = $state(false);
	let testing = $state(false);
	let testResult = $state<{ ok: boolean; content?: string; error?: string } | null>(null);

	const isEditMode = $derived(base !== null);

	// Reset form when base/isOpen changes
	$effect(() => {
		if (isOpen) {
			if (base) {
				name = base.name;
				description = base.description || '';
				sourceType = base.source_type;
				content = base.content || '';
				contextQuery = base.context_query || '';
				alwaysInject = base.always_inject;
				// Populate external fields
				const cfg = (base.source_config || {}) as ExternalSourceConfig;
				externalUrl = cfg.url || '';
				sourceSubtype = cfg.source_subtype || 'url';
				const cron = cfg.refresh_cron || '';
				const isPreset = CRON_PRESETS.some(p => p.cron === cron);
				if (cron && !isPreset) {
					useCustomCron = true;
					customCron = cron;
					refreshCron = '';
				} else {
					useCustomCron = false;
					customCron = '';
					refreshCron = cron;
				}
			} else {
				name = '';
				description = '';
				sourceType = 'manual';
				content = '';
				contextQuery = '';
				alwaysInject = false;
				externalUrl = '';
				sourceSubtype = 'url';
				refreshCron = '';
				customCron = '';
				useCustomCron = false;
			}
			error = null;
			testResult = null;
			testing = false;
		}
	});

	function buildExternalSourceConfig(): ExternalSourceConfig | undefined {
		if (sourceType !== 'external') return undefined;
		const cron = useCustomCron ? customCron.trim() : refreshCron;
		const config: ExternalSourceConfig = {
			url: externalUrl.trim() || undefined,
			source_subtype: sourceSubtype,
		};
		if (cron) {
			config.refresh_cron = cron;
			config.next_refresh_at = new Date().toISOString();
		}
		return config;
	}

	async function handleSave() {
		if (!name.trim()) {
			error = 'Name is required';
			return;
		}

		if (sourceType === 'external') {
			if (!externalUrl.trim()) {
				error = 'URL is required for external sources';
				return;
			}
			const cron = useCustomCron ? customCron.trim() : refreshCron;
			if (cron) {
				const validation = validateCron(cron);
				if (!validation.valid) {
					error = `Invalid cron: ${validation.error}`;
					return;
				}
			}
		}

		saving = true;
		error = null;

		try {
			const sourceConfig = buildExternalSourceConfig();

			if (isEditMode && base) {
				const input: UpdateBaseInput = {
					name: name.trim(),
					description: description.trim() || undefined,
					source_type: sourceType,
					content: sourceType === 'manual' || sourceType === 'conversation' ? content : undefined,
					context_query: sourceType === 'data_table' ? contextQuery : undefined,
					always_inject: alwaysInject,
					source_config: sourceConfig
				};
				const updated = await updateBase(base.id, input);
				if (updated) onSave?.(updated);
			} else {
				const input: CreateBaseInput = {
					name: name.trim(),
					description: description.trim() || undefined,
					source_type: sourceType,
					content: sourceType === 'manual' || sourceType === 'conversation' ? content : undefined,
					context_query: sourceType === 'data_table' ? contextQuery : undefined,
					always_inject: alwaysInject,
					source_config: sourceConfig
				};
				const created = await createBase(input);
				if (created) onSave?.(created);
			}
			isOpen = false;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Save failed';
		} finally {
			saving = false;
		}
	}

	function handleClose() {
		isOpen = false;
		onCancel?.();
	}

	async function handleTestConnection() {
		if (!externalUrl.trim()) {
			error = 'Enter a URL to test';
			return;
		}
		testing = true;
		testResult = null;
		error = null;
		try {
			const res = await fetch('/api/bases/test-fetch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: externalUrl.trim() })
			});
			const data = await res.json();
			if (res.ok) {
				testResult = { ok: true, content: data.content?.substring(0, 2000) };
			} else {
				testResult = { ok: false, error: data.error || `HTTP ${res.status}` };
			}
		} catch (err) {
			testResult = { ok: false, error: err instanceof Error ? err.message : 'Fetch failed' };
		} finally {
			testing = false;
		}
	}

	const activeCron = $derived(useCustomCron ? customCron.trim() : refreshCron);
	const cronDescription = $derived(describeCron(activeCron));

	function getSourceDescription(type: SourceType): string {
		return SOURCE_TYPE_INFO.find(s => s.type === type)?.description || '';
	}
</script>

{#if isOpen}
	<!-- Overlay -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		style="background: oklch(0.10 0.01 250 / 0.8); backdrop-filter: blur(4px);"
	>
		<!-- Panel -->
		<div
			class="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border shadow-2xl {className}"
			style="background: oklch(0.16 0.01 250); border-color: oklch(0.28 0.02 250);"
			transition:fly={{ y: 20, duration: 200 }}
		>
			<!-- Header -->
			<div
				class="px-5 py-3.5 flex items-center gap-3 border-b"
				style="background: oklch(0.19 0.01 250); border-color: oklch(0.25 0.01 250); border-radius: 0.75rem 0.75rem 0 0;"
			>
				<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="color: oklch(0.70 0.12 240);">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
				</svg>
				<h2 class="font-semibold text-sm flex-1" style="color: oklch(0.90 0.01 250);">
					{isEditMode ? 'Edit Base' : 'Create Base'}
				</h2>
				<button class="btn btn-ghost btn-xs btn-circle" onclick={handleClose}>
					<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Body (scrollable) -->
			<div class="flex-1 overflow-auto p-5 space-y-4">
				<!-- Error -->
				{#if error}
					<div class="px-3 py-2 rounded-lg text-sm" style="background: oklch(0.30 0.10 25 / 0.2); color: oklch(0.75 0.15 25); border: 1px solid oklch(0.50 0.15 25 / 0.3);">
						{error}
					</div>
				{/if}

				<!-- Name -->
				<div>
					<label class="block text-xs font-medium mb-1" style="color: oklch(0.65 0.01 250);">Name *</label>
					<input
						type="text"
						bind:value={name}
						placeholder="e.g. Project Architecture Guide"
						class="input input-sm w-full border text-sm"
						style="background: oklch(0.20 0.01 250); border-color: oklch(0.30 0.01 250); color: oklch(0.90 0.01 250);"
					/>
				</div>

				<!-- Description -->
				<div>
					<label class="block text-xs font-medium mb-1" style="color: oklch(0.65 0.01 250);">Description</label>
					<input
						type="text"
						bind:value={description}
						placeholder="Brief description of this knowledge base"
						class="input input-sm w-full border text-sm"
						style="background: oklch(0.20 0.01 250); border-color: oklch(0.30 0.01 250); color: oklch(0.90 0.01 250);"
					/>
				</div>

				<!-- Source Type -->
				<div>
					<label class="block text-xs font-medium mb-1" style="color: oklch(0.65 0.01 250);">Source Type</label>
					<div class="grid grid-cols-2 gap-2">
						{#each SOURCE_TYPE_INFO as info}
							<button
								type="button"
								class="p-2 rounded-lg border text-left transition-all"
								style="
									background: {sourceType === info.type ? 'oklch(0.25 0.04 240 / 0.3)' : 'oklch(0.20 0.01 250)'};
									border-color: {sourceType === info.type ? 'oklch(0.55 0.12 240 / 0.5)' : 'oklch(0.28 0.01 250)'};
								"
								onclick={() => sourceType = info.type}
							>
								<div class="flex items-center gap-2">
									<span class="text-base">{info.icon}</span>
									<span class="text-sm font-medium" style="color: oklch(0.85 0.01 250);">{info.label}</span>
								</div>
								<p class="text-xs mt-0.5" style="color: oklch(0.55 0.01 250);">{info.description}</p>
							</button>
						{/each}
					</div>
				</div>

				<!-- Content field (manual/conversation) -->
				{#if sourceType === 'manual' || sourceType === 'conversation'}
					<div>
						<label class="block text-xs font-medium mb-1" style="color: oklch(0.65 0.01 250);">
							Content
							{#if sourceType === 'conversation'}
								<span class="text-xs font-normal opacity-60">(auto-managed for conversations)</span>
							{/if}
						</label>
						<textarea
							bind:value={content}
							rows="10"
							placeholder={sourceType === 'manual' ? 'Write markdown content that will be injected into agent prompts...' : 'Conversation memory content...'}
							class="textarea textarea-sm w-full border text-sm font-mono"
							style="background: oklch(0.20 0.01 250); border-color: oklch(0.30 0.01 250); color: oklch(0.85 0.01 250); resize: vertical;"
						></textarea>
					</div>
				{/if}

				<!-- Context Query (data_table) -->
				{#if sourceType === 'data_table'}
					<div>
						<label class="block text-xs font-medium mb-1" style="color: oklch(0.65 0.01 250);">
							SQL Query
							<span class="text-xs font-normal opacity-60">(runs against data.db)</span>
						</label>
						<textarea
							bind:value={contextQuery}
							rows="5"
							placeholder="SELECT name, value FROM my_table WHERE active = 1"
							class="textarea textarea-sm w-full border text-sm font-mono"
							style="background: oklch(0.20 0.01 250); border-color: oklch(0.30 0.01 250); color: oklch(0.85 0.01 250); resize: vertical;"
						></textarea>
					</div>
				{/if}

				<!-- External Source Config -->
				{#if sourceType === 'external'}
					<div class="space-y-3">
						<!-- Source Subtype -->
						<div>
							<label class="block text-xs font-medium mb-1" style="color: oklch(0.65 0.01 250);">Source Type</label>
							<div class="flex gap-2">
								{#each [{ value: 'url', label: 'URL', icon: '🌐' }, { value: 'coda', label: 'Coda', icon: '📋' }, { value: 'gsheet', label: 'Google Sheet', icon: '📊' }] as opt}
									<button
										type="button"
										class="px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
										style="
											background: {sourceSubtype === opt.value ? 'oklch(0.25 0.04 240 / 0.3)' : 'oklch(0.20 0.01 250)'};
											border-color: {sourceSubtype === opt.value ? 'oklch(0.55 0.12 240 / 0.5)' : 'oklch(0.28 0.01 250)'};
											color: oklch(0.85 0.01 250);
										"
										onclick={() => sourceSubtype = opt.value}
									>
										{opt.icon} {opt.label}
									</button>
								{/each}
							</div>
						</div>

						<!-- URL Input -->
						<div>
							<label class="block text-xs font-medium mb-1" style="color: oklch(0.65 0.01 250);">
								{sourceSubtype === 'url' ? 'URL' : sourceSubtype === 'coda' ? 'Coda Doc URL' : 'Google Sheet URL'}
							</label>
							<div class="flex gap-2">
								<input
									type="url"
									bind:value={externalUrl}
									placeholder={sourceSubtype === 'url' ? 'https://example.com/page' : sourceSubtype === 'coda' ? 'https://coda.io/d/doc-id' : 'https://docs.google.com/spreadsheets/d/...'}
									class="input input-sm flex-1 border text-sm"
									style="background: oklch(0.20 0.01 250); border-color: oklch(0.30 0.01 250); color: oklch(0.90 0.01 250);"
								/>
								<button
									type="button"
									class="btn btn-sm border"
									style="background: oklch(0.22 0.02 200); border-color: oklch(0.35 0.06 200); color: oklch(0.80 0.08 200);"
									onclick={handleTestConnection}
									disabled={testing || !externalUrl.trim()}
								>
									{#if testing}
										<span class="loading loading-spinner loading-xs"></span>
									{:else}
										Test
									{/if}
								</button>
							</div>
						</div>

						<!-- Test Result -->
						{#if testResult}
							<div
								class="px-3 py-2 rounded-lg text-sm"
								style="
									background: {testResult.ok ? 'oklch(0.20 0.04 145 / 0.2)' : 'oklch(0.20 0.04 25 / 0.2)'};
									color: {testResult.ok ? 'oklch(0.70 0.12 145)' : 'oklch(0.70 0.12 25)'};
									border: 1px solid {testResult.ok ? 'oklch(0.40 0.12 145 / 0.3)' : 'oklch(0.40 0.12 25 / 0.3)'};
								"
							>
								{#if testResult.ok}
									<div class="font-medium mb-1">Connection successful</div>
									{#if testResult.content}
										<pre class="text-xs whitespace-pre-wrap max-h-40 overflow-auto mt-1 opacity-80" style="font-family: monospace;">{testResult.content}</pre>
									{/if}
								{:else}
									<div class="font-medium">Connection failed</div>
									<div class="text-xs mt-0.5 opacity-80">{testResult.error}</div>
								{/if}
							</div>
						{/if}

						<!-- Refresh Schedule -->
						<div>
							<label class="block text-xs font-medium mb-1" style="color: oklch(0.65 0.01 250);">
								Refresh Schedule
								<span class="text-xs font-normal opacity-60">(optional)</span>
							</label>
							{#if !useCustomCron}
								<select
									bind:value={refreshCron}
									class="select select-sm w-full border text-sm"
									style="background: oklch(0.20 0.01 250); border-color: oklch(0.30 0.01 250); color: oklch(0.90 0.01 250);"
								>
									<option value="">No automatic refresh</option>
									{#each CRON_PRESETS as preset}
										<option value={preset.cron}>{preset.label}</option>
									{/each}
								</select>
							{:else}
								<input
									type="text"
									bind:value={customCron}
									placeholder="* * * * *  (min hour dom month dow)"
									class="input input-sm w-full border text-sm font-mono"
									style="background: oklch(0.20 0.01 250); border-color: oklch(0.30 0.01 250); color: oklch(0.90 0.01 250);"
								/>
							{/if}
							<div class="flex items-center justify-between mt-1">
								<button
									type="button"
									class="text-xs underline"
									style="color: oklch(0.60 0.08 240);"
									onclick={() => { useCustomCron = !useCustomCron; }}
								>
									{useCustomCron ? 'Use preset' : 'Custom cron'}
								</button>
								{#if cronDescription}
									<span class="text-xs" style="color: oklch(0.55 0.01 250);">{cronDescription}</span>
								{/if}
							</div>
						</div>

						<!-- Cached Content Preview (edit mode) -->
						{#if isEditMode && base?.content}
							<div>
								<label class="block text-xs font-medium mb-1" style="color: oklch(0.65 0.01 250);">
									Cached Content
									<span class="text-xs font-normal opacity-60">
										({base.token_estimate ? `~${base.token_estimate} tokens` : 'size unknown'})
									</span>
								</label>
								<pre
									class="text-xs whitespace-pre-wrap max-h-48 overflow-auto p-2 rounded-lg border"
									style="background: oklch(0.18 0.01 250); border-color: oklch(0.28 0.01 250); color: oklch(0.70 0.01 250); font-family: monospace;"
								>{base.content.substring(0, 3000)}{base.content.length > 3000 ? '\n\n... (truncated)' : ''}</pre>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Always Inject toggle -->
				<div class="flex items-center gap-3 pt-2">
					<input
						type="checkbox"
						bind:checked={alwaysInject}
						class="toggle toggle-sm toggle-success"
					/>
					<div>
						<span class="text-sm font-medium" style="color: oklch(0.85 0.01 250);">Always Inject</span>
						<p class="text-xs" style="color: oklch(0.55 0.01 250);">
							Automatically include in all agent prompts for this project
						</p>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<div
				class="px-5 py-3 flex items-center justify-end gap-2 border-t"
				style="background: oklch(0.19 0.01 250); border-color: oklch(0.25 0.01 250); border-radius: 0 0 0.75rem 0.75rem;"
			>
				<button
					class="btn btn-sm btn-ghost"
					onclick={handleClose}
					disabled={saving}
				>
					Cancel
				</button>
				<button
					class="btn btn-sm"
					style="background: oklch(0.45 0.15 240); color: oklch(0.95 0.01 250); border: none;"
					onclick={handleSave}
					disabled={saving || !name.trim()}
				>
					{#if saving}
						<span class="loading loading-spinner loading-xs"></span>
					{/if}
					{isEditMode ? 'Save Changes' : 'Create Base'}
				</button>
			</div>
		</div>
	</div>
{/if}
