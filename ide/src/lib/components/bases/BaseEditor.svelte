<script lang="ts">
	/**
	 * BaseEditor - Create/edit drawer for knowledge bases.
	 * Full-screen overlay with form for base properties.
	 */
	import type { KnowledgeBase, SourceType, CreateBaseInput, UpdateBaseInput } from '$lib/types/knowledgeBase';
	import { SOURCE_TYPE_INFO, SOURCE_TYPES } from '$lib/types/knowledgeBase';
	import { createBase, updateBase } from '$lib/stores/bases.svelte';
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
			} else {
				name = '';
				description = '';
				sourceType = 'manual';
				content = '';
				contextQuery = '';
				alwaysInject = false;
			}
			error = null;
		}
	});

	async function handleSave() {
		if (!name.trim()) {
			error = 'Name is required';
			return;
		}

		saving = true;
		error = null;

		try {
			if (isEditMode && base) {
				const input: UpdateBaseInput = {
					name: name.trim(),
					description: description.trim() || undefined,
					source_type: sourceType,
					content: sourceType === 'manual' || sourceType === 'conversation' ? content : undefined,
					context_query: sourceType === 'data_table' ? contextQuery : undefined,
					always_inject: alwaysInject
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
					always_inject: alwaysInject
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

				<!-- External URL (external) -->
				{#if sourceType === 'external'}
					<div class="px-3 py-2 rounded-lg text-sm" style="background: oklch(0.20 0.02 240 / 0.2); color: oklch(0.70 0.10 240); border: 1px solid oklch(0.40 0.10 240 / 0.2);">
						External source ingestion is configured via the scheduler. Set up URL, cron schedule, and TTL in the base config after creation.
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
