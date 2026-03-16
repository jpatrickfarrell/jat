<script lang="ts">
	/**
	 * CanvasActionBlock - Renders an action button that executes configured actions.
	 * Supports loading/success/error states and optional confirmation modal.
	 * Resolves control variable references in actionConfig before execution.
	 */
	import type { ActionBlock, ActionResult } from '$lib/types/canvas';

	let {
		block,
		controlValues = {},
		project = null,
		pageId = null,
		onBlockUpdate,
	}: {
		block: ActionBlock;
		controlValues?: Record<string, unknown>;
		project?: string | null;
		pageId?: string | null;
		onBlockUpdate?: (block: ActionBlock) => void;
	} = $props();

	let loading = $state(false);
	let result = $state<ActionResult | null>(null);
	let showConfirm = $state(false);
	let editing = $state(false);
	let editLabel = $state('');
	let editActionType = $state('');

	// Clear result after 3 seconds
	$effect(() => {
		if (result) {
			const timer = setTimeout(() => { result = null; }, 3000);
			return () => clearTimeout(timer);
		}
	});

	// Style → DaisyUI button class mapping
	const styleClasses: Record<string, string> = {
		primary: 'btn-primary',
		secondary: 'btn-secondary',
		danger: 'btn-error',
		success: 'btn-success',
	};

	/**
	 * Resolve control variable references in actionConfig.
	 * References look like {controlName} in string values.
	 */
	function resolveConfig(config: Record<string, unknown>): Record<string, unknown> {
		const resolved: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(config)) {
			if (typeof value === 'string') {
				resolved[key] = value.replace(/\{(\w+)\}/g, (_, name) => {
					const cv = controlValues[name];
					return cv !== undefined && cv !== null ? String(cv) : `{${name}}`;
				});
			} else if (value && typeof value === 'object' && !Array.isArray(value)) {
				resolved[key] = resolveConfig(value as Record<string, unknown>);
			} else {
				resolved[key] = value;
			}
		}
		return resolved;
	}

	async function executeAction() {
		if (loading) return;
		loading = true;
		result = null;

		try {
			const resolvedConfig = resolveConfig(block.actionConfig);

			const response = await fetch(`/api/canvas/${pageId}/action`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					actionType: block.actionType,
					actionConfig: resolvedConfig,
					project,
				}),
			});

			const data = await response.json();
			if (!response.ok) {
				result = { success: false, message: data.error || 'Action failed' };
			} else {
				result = { success: true, message: data.message || 'Done' };
			}
		} catch (err) {
			result = { success: false, message: err instanceof Error ? err.message : 'Network error' };
		} finally {
			loading = false;
		}
	}

	function handleClick() {
		if (block.confirmBeforeRun) {
			showConfirm = true;
		} else {
			executeAction();
		}
	}

	function confirmAndRun() {
		showConfirm = false;
		executeAction();
	}

	function startEdit() {
		editing = true;
		editLabel = block.label || '';
		editActionType = block.actionType || '';
	}

	function commitEdit() {
		if (editLabel.trim() !== block.label || editActionType.trim() !== block.actionType) {
			onBlockUpdate?.({
				...block,
				label: editLabel.trim() || 'Action',
				actionType: editActionType.trim(),
			});
		}
		editing = false;
	}

	function handleEditKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') commitEdit();
		else if (e.key === 'Escape') editing = false;
	}
</script>

{#if editing}
	<!-- Edit mode: configure label and action type -->
	<div class="flex flex-col gap-2">
		<div class="flex items-center gap-2">
			<label class="text-xs font-medium" style="color: oklch(0.55 0.02 250); min-width: 50px;">Label</label>
			<input
				type="text"
				bind:value={editLabel}
				onblur={commitEdit}
				onkeydown={handleEditKeydown}
				placeholder="Button label"
				class="flex-1 px-2 py-1 rounded text-sm bg-transparent border outline-none"
				style="color: oklch(0.85 0.02 250); border-color: oklch(0.30 0.02 250);"
			/>
		</div>
		<div class="flex items-center gap-2">
			<label class="text-xs font-medium" style="color: oklch(0.55 0.02 250); min-width: 50px;">Action</label>
			<input
				type="text"
				bind:value={editActionType}
				onblur={commitEdit}
				onkeydown={handleEditKeydown}
				placeholder="e.g. AddRow, SpawnAgent, RunCommand"
				class="flex-1 px-2 py-1 rounded text-sm bg-transparent border outline-none"
				style="color: oklch(0.85 0.02 250); border-color: oklch(0.30 0.02 250);"
			/>
		</div>
	</div>
{:else}
	<!-- Display mode: clickable button -->
	<div class="flex items-center gap-3">
		<button
			class="btn btn-sm {styleClasses[block.style || 'primary'] || 'btn-primary'} gap-1.5"
			disabled={loading || !block.actionType}
			onclick={handleClick}
		>
			{#if loading}
				<span class="loading loading-spinner loading-xs"></span>
			{:else if block.icon}
				<span class="text-sm">{block.icon}</span>
			{/if}
			{block.label || 'Action'}
		</button>

		{#if !block.label && !block.actionType}
			<!-- Empty state -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span
				class="text-xs cursor-pointer"
				style="color: oklch(0.45 0.02 250);"
				onclick={startEdit}
			>Click to configure action</span>
		{:else}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span
				class="text-[10px] cursor-pointer opacity-0 group-hover:opacity-60 transition-opacity"
				style="color: oklch(0.45 0.02 250);"
				onclick={startEdit}
				title="Edit action"
			>{block.actionType}</span>
		{/if}

		<!-- Result toast -->
		{#if result}
			<span
				class="text-xs px-2 py-0.5 rounded"
				style="
					background: {result.success ? 'oklch(0.40 0.12 145 / 0.2)' : 'oklch(0.40 0.12 25 / 0.2)'};
					color: {result.success ? 'oklch(0.75 0.15 145)' : 'oklch(0.75 0.15 25)'};
				"
			>{result.message}</span>
		{/if}
	</div>
{/if}

<!-- Confirmation modal -->
{#if showConfirm}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="confirm-overlay" onclick={() => showConfirm = false}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="confirm-modal" onclick={(e) => e.stopPropagation()}>
			<h4 class="text-sm font-semibold mb-2" style="color: oklch(0.85 0.02 250);">Confirm Action</h4>
			<p class="text-xs mb-1" style="color: oklch(0.60 0.02 250);">
				Run <strong style="color: oklch(0.80 0.02 250);">{block.label || block.actionType}</strong>?
			</p>
			{#if block.actionType}
				<p class="text-[10px] mb-3" style="color: oklch(0.45 0.02 250);">
					Type: {block.actionType}
				</p>
			{/if}
			<div class="flex gap-2 justify-end">
				<button class="btn btn-xs btn-ghost" onclick={() => showConfirm = false}>Cancel</button>
				<button
					class="btn btn-xs {block.style === 'danger' ? 'btn-error' : 'btn-primary'}"
					onclick={confirmAndRun}
				>Run</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.confirm-overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: center;
		background: oklch(0 0 0 / 0.5);
	}

	.confirm-modal {
		background: oklch(0.20 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.5rem;
		padding: 1rem 1.25rem;
		min-width: 280px;
		max-width: 400px;
		box-shadow: 0 8px 24px oklch(0 0 0 / 0.4);
	}
</style>
