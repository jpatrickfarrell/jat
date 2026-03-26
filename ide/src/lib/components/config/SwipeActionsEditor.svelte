<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getSwipeConfig,
		setSwipeAction,
		resetSwipeActions,
		getSwipeActionDef,
		SWIPE_ACTION_CATALOG,
		initSwipeActions,
		type SwipeConfig
	} from '$lib/config/swipeActions';

	let config = $state<SwipeConfig>(getSwipeConfig());
	let saved = $state(false);

	onMount(() => {
		initSwipeActions();
		config = getSwipeConfig();
	});

	function handleChange(direction: 'rightSwipe' | 'leftSwipe', actionId: string) {
		setSwipeAction(direction, actionId);
		config = getSwipeConfig();
		flashSaved();
	}

	function handleReset() {
		resetSwipeActions();
		config = getSwipeConfig();
		flashSaved();
	}

	function flashSaved() {
		saved = true;
		setTimeout(() => saved = false, 1500);
	}

	const actionEntries = Object.values(SWIPE_ACTION_CATALOG);
</script>

<div class="swipe-editor">
	<div class="swipe-header">
		<h3 class="swipe-title">Mobile Swipe Actions</h3>
		<p class="swipe-desc">Assign actions to swipe gestures on mobile session cards.</p>
	</div>

	<div class="swipe-rows">
		<!-- Right swipe (left-to-right) -->
		<div class="swipe-row">
			<div class="swipe-direction">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
				<span>Swipe right</span>
			</div>
			<select
				class="swipe-select"
				value={config.rightSwipe}
				onchange={(e) => handleChange('rightSwipe', (e.target as HTMLSelectElement).value)}
			>
				{#each actionEntries as action}
					<option value={action.id}>{action.label}</option>
				{/each}
			</select>
			{#if getSwipeActionDef(config.rightSwipe)}
				{@const def = getSwipeActionDef(config.rightSwipe)!}
				<div class="swipe-preview" style="background: {def.color};">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d={def.icon} /></svg>
				</div>
			{/if}
		</div>

		<!-- Left swipe (right-to-left) -->
		<div class="swipe-row">
			<div class="swipe-direction">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
				<span>Swipe left</span>
			</div>
			<select
				class="swipe-select"
				value={config.leftSwipe}
				onchange={(e) => handleChange('leftSwipe', (e.target as HTMLSelectElement).value)}
			>
				{#each actionEntries as action}
					<option value={action.id}>{action.label}</option>
				{/each}
			</select>
			{#if getSwipeActionDef(config.leftSwipe)}
				{@const def = getSwipeActionDef(config.leftSwipe)!}
				<div class="swipe-preview" style="background: {def.color};">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d={def.icon} /></svg>
				</div>
			{/if}
		</div>
	</div>

	<div class="swipe-footer">
		<button class="swipe-reset" onclick={handleReset}>Reset to defaults</button>
		{#if saved}
			<span class="swipe-saved">Saved</span>
		{/if}
	</div>
</div>

<style>
	.swipe-editor {
		margin-top: 2rem;
		padding: 1.25rem;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.75rem;
	}

	.swipe-header {
		margin-bottom: 1rem;
	}

	.swipe-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: oklch(0.88 0.02 250);
		margin: 0 0 0.25rem 0;
	}

	.swipe-desc {
		font-size: 0.75rem;
		color: oklch(0.55 0.02 250);
		margin: 0;
	}

	.swipe-rows {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.swipe-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.swipe-direction {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		min-width: 120px;
		font-size: 0.8125rem;
		font-weight: 500;
		color: oklch(0.70 0.02 250);
	}

	.swipe-select {
		flex: 1;
		max-width: 200px;
		padding: 0.375rem 0.625rem;
		background: oklch(0.20 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.375rem;
		color: oklch(0.85 0.02 250);
		font-size: 0.8125rem;
		cursor: pointer;
		outline: none;
	}

	.swipe-select:focus {
		border-color: oklch(0.55 0.15 240);
	}

	.swipe-preview {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 6px;
		color: white;
		flex-shrink: 0;
	}

	.swipe-footer {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.swipe-reset {
		padding: 0.25rem 0.625rem;
		background: transparent;
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.375rem;
		color: oklch(0.60 0.02 250);
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.swipe-reset:hover {
		border-color: oklch(0.45 0.02 250);
		color: oklch(0.75 0.02 250);
	}

	.swipe-saved {
		font-size: 0.75rem;
		color: oklch(0.65 0.15 145);
		font-weight: 500;
	}
</style>
