<script lang="ts">
	/**
	 * BasePreview - View and edit knowledge base content inline.
	 *
	 * For editable types (manual, conversation): toggle between
	 * MarkdownPreview (rendered view) and MonacoWrapper (edit mode).
	 * Auto-saves on edit with 500ms debounce.
	 *
	 * For read-only types (data_table, external): MarkdownPreview only.
	 */
	import type { KnowledgeBase, RenderedBase } from '$lib/types/knowledgeBase';
	import { SOURCE_TYPE_INFO } from '$lib/types/knowledgeBase';
	import { renderBase, updateBase } from '$lib/stores/bases.svelte';
	import MonacoWrapper from '$lib/components/config/MonacoWrapper.svelte';
	import MarkdownPreview from '$lib/components/files/MarkdownPreview.svelte';

	interface Props {
		base: KnowledgeBase | null;
		onEdit?: (base: KnowledgeBase) => void;
		onDelete?: (base: KnowledgeBase) => void;
		class?: string;
	}

	let { base, onEdit, onDelete, class: className = '' }: Props = $props();

	let rendered = $state<RenderedBase | null>(null);
	let renderLoading = $state(false);
	let renderError = $state<string | null>(null);
	let editing = $state(false);
	let editorContent = $state('');
	let saveTimer: ReturnType<typeof setTimeout> | null = null;
	let saving = $state(false);
	let saveError = $state<string | null>(null);
	let previousBaseId = $state<string | null>(null);

	const sourceInfo = $derived(base ? SOURCE_TYPE_INFO.find(s => s.type === base.source_type) : null);
	const isEditable = $derived(base != null && (base.source_type === 'manual' || base.source_type === 'conversation'));

	// Reset editing only when a different base is selected (not on content updates from auto-save)
	$effect(() => {
		const currentId = base?.id ?? null;
		if (currentId !== previousBaseId) {
			previousBaseId = currentId;
			if (base) {
				editing = false;
				editorContent = base.content ?? '';
				saveError = null;
				loadRender(base.id);
			} else {
				rendered = null;
				renderError = null;
				editing = false;
			}
		}
	});

	async function loadRender(baseId: string) {
		renderLoading = true;
		renderError = null;
		try {
			rendered = await renderBase(baseId);
		} catch (err) {
			renderError = err instanceof Error ? err.message : 'Render failed';
		} finally {
			renderLoading = false;
		}
	}

	function toggleEditing() {
		if (!isEditable) return;
		if (editing) {
			// Switching from edit to view — re-render to pick up changes
			editing = false;
			if (base) loadRender(base.id);
		} else {
			editorContent = base?.content ?? '';
			editing = true;
		}
	}

	function handleContentChange(value: string) {
		editorContent = value;
		// Debounce auto-save
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(() => autoSave(value), 500);
	}

	async function autoSave(content: string) {
		if (!base) return;
		saving = true;
		saveError = null;
		try {
			await updateBase(base.id, { content });
		} catch (err) {
			saveError = err instanceof Error ? err.message : 'Save failed';
		} finally {
			saving = false;
		}
	}

	function formatTokens(n: number | null | undefined): string {
		if (n == null) return '—';
		if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
		if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
		return String(n);
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('en-US', {
			month: 'short', day: 'numeric', year: 'numeric',
			hour: '2-digit', minute: '2-digit'
		});
	}
</script>

<div
	class="flex flex-col border rounded-xl overflow-hidden {className}"
	style="background: oklch(0.16 0.01 250); border-color: oklch(0.25 0.01 250);"
>
	{#if !base}
		<!-- Empty state -->
		<div class="flex-1 flex items-center justify-center p-8">
			<div class="text-center">
				<svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
				</svg>
				<p class="text-sm" style="color: oklch(0.50 0.01 250);">Select a base to preview</p>
			</div>
		</div>
	{:else}
		<!-- Header -->
		<div
			class="px-4 py-3 flex items-center gap-2 border-b"
			style="background: oklch(0.19 0.01 250); border-color: oklch(0.25 0.01 250);"
		>
			<span class="text-lg">{sourceInfo?.icon || '📄'}</span>
			<div class="flex-1 min-w-0">
				<h3 class="font-semibold text-sm truncate" style="color: oklch(0.90 0.01 250);">{base.name}</h3>
				{#if base.description}
					<p class="text-xs truncate" style="color: oklch(0.55 0.01 250);">{base.description}</p>
				{/if}
			</div>

			<!-- Action buttons -->
			<div class="flex items-center gap-1">
				<!-- Save indicator -->
				{#if saving}
					<span class="loading loading-spinner loading-xs" style="color: oklch(0.70 0.12 240);"></span>
				{/if}

				<!-- Edit/View toggle for editable types -->
				{#if isEditable}
					<button
						class="btn btn-ghost btn-xs"
						style="color: {editing ? 'oklch(0.75 0.15 145)' : 'oklch(0.70 0.12 240)'};"
						onclick={toggleEditing}
						title={editing ? 'Switch to preview' : 'Edit content'}
					>
						{#if editing}
							<!-- Eye icon (switch to preview) -->
							<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
								<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						{:else}
							<!-- Pencil icon (switch to edit) -->
							<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
							</svg>
						{/if}
					</button>
				{/if}

				<!-- Metadata edit (gear icon) — opens the BaseEditor modal -->
				{#if onEdit}
					<button
						class="btn btn-ghost btn-xs"
						style="color: oklch(0.60 0.02 250);"
						onclick={() => onEdit?.(base)}
						title="Edit metadata"
					>
						<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</button>
				{/if}

				{#if onDelete}
					<button
						class="btn btn-ghost btn-xs"
						style="color: oklch(0.70 0.15 25);"
						onclick={() => onDelete?.(base)}
					>
						<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
						</svg>
					</button>
				{/if}
			</div>
		</div>

		<!-- Metadata row -->
		<div class="px-4 py-2 flex items-center gap-3 text-xs border-b" style="border-color: oklch(0.22 0.01 250); color: oklch(0.55 0.01 250);">
			<span
				class="px-1.5 py-0.5 rounded"
				style="background: oklch(0.25 0.02 250); color: oklch(0.70 0.01 250);"
			>
				{sourceInfo?.label}
			</span>
			{#if base.always_inject}
				<span
					class="px-1.5 py-0.5 rounded"
					style="background: oklch(0.45 0.15 145 / 0.2); color: oklch(0.75 0.15 145);"
				>
					Always Inject
				</span>
			{/if}
			{#if editing}
				<span
					class="px-1.5 py-0.5 rounded"
					style="background: oklch(0.55 0.15 200 / 0.2); color: oklch(0.75 0.12 200);"
				>
					Editing
				</span>
			{/if}
			{#if saveError}
				<span
					class="px-1.5 py-0.5 rounded"
					style="background: oklch(0.55 0.15 25 / 0.2); color: oklch(0.75 0.15 25);"
				>
					Save failed
				</span>
			{/if}
			{#if rendered?.token_estimate != null}
				<span>~{formatTokens(rendered.token_estimate)} tokens</span>
			{:else if base.token_estimate != null}
				<span>~{formatTokens(base.token_estimate)} tokens</span>
			{/if}
			<span class="ml-auto">Updated {formatDate(base.updated_at)}</span>
		</div>

		<!-- Content area -->
		<div class="flex-1 overflow-hidden min-h-0">
			{#if editing}
				<!-- Monaco editor for editable bases -->
				<MonacoWrapper
					value={editorContent}
					language="markdown"
					onchange={handleContentChange}
				/>
			{:else if renderLoading}
				<div class="flex items-center gap-2 p-4" style="color: oklch(0.55 0.01 250);">
					<span class="loading loading-spinner loading-xs"></span>
					<span class="text-sm">Rendering preview...</span>
				</div>
			{:else if renderError}
				<div class="text-sm p-4" style="color: oklch(0.70 0.15 25);">
					Failed to render: {renderError}
				</div>
			{:else if rendered?.content}
				<MarkdownPreview content={rendered.content} />
			{:else}
				<p class="text-sm p-4" style="color: oklch(0.50 0.01 250);">No content available</p>
			{/if}
		</div>
	{/if}
</div>
