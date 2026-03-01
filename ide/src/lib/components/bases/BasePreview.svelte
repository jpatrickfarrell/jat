<script lang="ts">
	/**
	 * BasePreview - Rendered content preview for a knowledge base.
	 * Shows rendered markdown/text content and token count.
	 */
	import type { KnowledgeBase, RenderedBase } from '$lib/types/knowledgeBase';
	import { SOURCE_TYPE_INFO } from '$lib/types/knowledgeBase';
	import { renderBase } from '$lib/stores/bases.svelte';

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

	const sourceInfo = $derived(base ? SOURCE_TYPE_INFO.find(s => s.type === base.source_type) : null);

	// Re-render when base changes
	$effect(() => {
		if (base) {
			loadRender(base.id);
		} else {
			rendered = null;
			renderError = null;
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
				{#if onEdit}
					<button
						class="btn btn-ghost btn-xs"
						style="color: oklch(0.70 0.12 240);"
						onclick={() => onEdit?.(base)}
					>
						<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
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
			{#if rendered?.token_estimate != null}
				<span>~{formatTokens(rendered.token_estimate)} tokens</span>
			{:else if base.token_estimate != null}
				<span>~{formatTokens(base.token_estimate)} tokens</span>
			{/if}
			<span class="ml-auto">Updated {formatDate(base.updated_at)}</span>
		</div>

		<!-- Content preview -->
		<div class="flex-1 overflow-auto p-4">
			{#if renderLoading}
				<div class="flex items-center gap-2" style="color: oklch(0.55 0.01 250);">
					<span class="loading loading-spinner loading-xs"></span>
					<span class="text-sm">Rendering preview...</span>
				</div>
			{:else if renderError}
				<div class="text-sm" style="color: oklch(0.70 0.15 25);">
					Failed to render: {renderError}
				</div>
			{:else if rendered?.content}
				<pre class="text-xs whitespace-pre-wrap break-words font-mono" style="color: oklch(0.75 0.01 250);">{rendered.content}</pre>
			{:else}
				<p class="text-sm" style="color: oklch(0.50 0.01 250);">No content available</p>
			{/if}
		</div>
	{/if}
</div>
