<script lang="ts">
	/**
	 * MigrationViewer - SQL editor for Supabase migrations
	 *
	 * Shows either:
	 * - Schema diff output (read-only, when there are uncommitted schema changes)
	 * - Migration SQL content (editable, when a migration file is selected)
	 */
	import MonacoWrapper from '$lib/components/config/MonacoWrapper.svelte';
	import LLMTransformModal from '$lib/components/LLMTransformModal.svelte';
	import { openTaskDrawer } from '$lib/stores/drawerStore';

	interface Props {
		/** Content to display (SQL or diff) */
		content: string;
		/** Title to show in header */
		title: string;
		/** Whether this is a schema diff (vs migration file) */
		isDiff?: boolean;
		/** Full relative path to the migration file (e.g., supabase/migrations/xxx.sql) */
		filename?: string;
		/** Project name (for saving) */
		project?: string;
		/** Called when close button clicked */
		onClose?: () => void;
		/** Called when content is saved */
		onSave?: (content: string) => void;
	}

	let { content, title, isDiff = false, filename, project, onClose, onSave }: Props = $props();

	// Extract just the filename from the full path for display
	const displayFilename = $derived(filename ? filename.split('/').pop() : undefined);

	// Editor state
	let editorContent = $state(content);
	let isSaving = $state(false);
	let saveError = $state<string | null>(null);

	// Track if content has been modified
	const isDirty = $derived(editorContent !== content);

	// Monaco ref for LLM replace/insert
	let monacoRef: {
		replaceText: (search: string, replacement: string) => boolean;
		insertAfter: (search: string, text: string) => boolean;
	} | undefined = $state(undefined);

	// LLM Transform modal state
	let llmModalOpen = $state(false);
	let llmSelectedText = $state('');

	// Sync external content changes
	$effect(() => {
		editorContent = content;
	});

	// Handle editor content changes
	function handleEditorChange(newContent: string) {
		editorContent = newContent;
		saveError = null;
	}

	function handleSendToLLM(selectedText: string) {
		llmSelectedText = selectedText;
		llmModalOpen = true;
	}

	function handleCreateTask(selectedText: string) {
		openTaskDrawer(project ?? '', selectedText.trim());
	}

	function handleLLMReplace(newText: string) {
		if (monacoRef?.replaceText(llmSelectedText, newText)) return;
		// Fallback: direct content mutation
		const index = editorContent.indexOf(llmSelectedText);
		if (index !== -1) {
			editorContent = editorContent.slice(0, index) + newText + editorContent.slice(index + llmSelectedText.length);
		}
	}

	function handleLLMInsert(newText: string) {
		if (monacoRef?.insertAfter(llmSelectedText, newText)) return;
		// Fallback: direct content mutation
		const index = editorContent.indexOf(llmSelectedText);
		if (index !== -1) {
			const insertPoint = index + llmSelectedText.length;
			editorContent = editorContent.slice(0, insertPoint) + '\n' + newText + editorContent.slice(insertPoint);
		}
	}

	// Save migration content
	async function handleSave() {
		if (!project || !filename || isDiff) return;

		isSaving = true;
		saveError = null;

		try {
			// filename is now the full relative path (e.g., supabase/migrations/xxx.sql)
			const response = await fetch(
				`/api/files/content?project=${encodeURIComponent(project)}&path=${encodeURIComponent(filename)}`,
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ content: editorContent })
				}
			);

			if (!response.ok) {
				const data = await response.json().catch(() => ({}));
				throw new Error(data.error || 'Failed to save migration');
			}

			// Notify parent of successful save
			onSave?.(editorContent);
		} catch (err) {
			saveError = err instanceof Error ? err.message : 'Failed to save';
		} finally {
			isSaving = false;
		}
	}

	// Keyboard shortcut for save
	function handleKeydown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			if (isDirty && !isDiff) {
				handleSave();
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="migration-viewer">
	<!-- Header -->
	<div class="viewer-header">
		<div class="header-info">
			{#if isDiff}
				<span class="header-badge badge-diff">DIFF</span>
			{:else}
				<span class="header-badge badge-migration">SQL</span>
			{/if}
			<span class="header-title">{title}</span>
			{#if displayFilename}
				<span class="header-filename">{displayFilename}</span>
			{/if}
			{#if isDirty && !isDiff}
				<span class="header-badge badge-modified">Modified</span>
			{/if}
		</div>
		<div class="header-actions">
			{#if !isDiff && project && filename}
				<button
					class="btn btn-sm btn-primary"
					onclick={handleSave}
					disabled={!isDirty || isSaving}
					title="Save (Ctrl+S)"
				>
					{#if isSaving}
						<span class="loading loading-spinner loading-xs"></span>
					{:else}
						<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M17 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V7l-4-4z" />
							<path stroke-linecap="round" stroke-linejoin="round" d="M17 3v4h-4" />
							<path stroke-linecap="round" stroke-linejoin="round" d="M7 14h10M7 18h6" />
						</svg>
					{/if}
					Save
				</button>
			{/if}
			{#if onClose}
				<button class="btn btn-ghost btn-sm btn-square" onclick={onClose} title="Close">
					<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			{/if}
		</div>
	</div>

	<!-- Error message -->
	{#if saveError}
		<div class="save-error">
			<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
			</svg>
			<span>{saveError}</span>
		</div>
	{/if}

	<!-- Content -->
	<div class="viewer-content">
		{#if isDiff}
			<!-- Read-only diff view with syntax highlighting -->
			<pre class="sql-content">{content}</pre>
		{:else}
			<!-- Editable Monaco editor for migrations -->
			<MonacoWrapper
				bind:this={monacoRef}
				bind:value={editorContent}
				language="sql"
				readonly={false}
				onchange={handleEditorChange}
				onSendToLLM={handleSendToLLM}
				onCreateTask={handleCreateTask}
			/>
		{/if}
	</div>
</div>

<LLMTransformModal
	bind:isOpen={llmModalOpen}
	selectedText={llmSelectedText}
	project={project ?? ''}
	onClose={() => { llmModalOpen = false; }}
	onReplace={handleLLMReplace}
	onInsert={handleLLMInsert}
/>

<style>
	.migration-viewer {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: oklch(0.14 0.01 250);
	}

	/* Header */
	.viewer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: oklch(0.16 0.01 250);
		border-bottom: 1px solid oklch(0.22 0.02 250);
		flex-shrink: 0;
	}

	.header-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.header-badge {
		font-size: 0.625rem;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		flex-shrink: 0;
	}

	.badge-diff {
		background: oklch(0.70 0.15 85 / 0.2);
		color: oklch(0.75 0.18 85);
	}

	.badge-migration {
		background: oklch(0.65 0.15 200 / 0.2);
		color: oklch(0.70 0.18 200);
	}

	.badge-modified {
		background: oklch(0.70 0.15 85 / 0.2);
		color: oklch(0.80 0.18 85);
	}

	.header-title {
		font-weight: 600;
		color: oklch(0.85 0.02 250);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.header-filename {
		font-family: monospace;
		font-size: 0.75rem;
		color: oklch(0.55 0.02 250);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Error message */
	.save-error {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: oklch(0.35 0.12 25 / 0.3);
		border-bottom: 1px solid oklch(0.50 0.15 25 / 0.5);
		color: oklch(0.75 0.15 25);
		font-size: 0.8125rem;
	}

	/* Content */
	.viewer-content {
		flex: 1;
		overflow: hidden;
		position: relative;
	}

	.sql-content {
		margin: 0;
		padding: 1rem;
		font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
		font-size: 0.8125rem;
		line-height: 1.6;
		white-space: pre-wrap;
		word-break: break-word;
		color: oklch(0.80 0.02 250);
		height: 100%;
		overflow: auto;
	}
</style>
