<script lang="ts">
	/**
	 * RulesList Component
	 *
	 * Displays all automation rules with management controls:
	 * - Enable/disable toggle per rule
	 * - Edit and delete buttons
	 * - Drag-to-reorder for priority
	 * - Trigger count per rule
	 * - Master automation system toggle
	 *
	 * @see ide/src/lib/types/automation.ts for type definitions
	 * @see ide/src/lib/stores/automationRules.svelte.ts for store
	 */

	import { flip } from 'svelte/animate';
	import { fade, slide } from 'svelte/transition';

	// Multiplier for all transition durations — collapses to 0 when reduced motion is preferred
	const _dur = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1;
	import type { AutomationRule, RuleCategory } from '$lib/types/automation';
	import {
		getRules,
		getConfig,
		toggleRuleEnabled,
		deleteRule,
		reorderRules,
		cloneRule,
		exportRules,
		importRules
	} from '$lib/stores/automationRules.svelte';
	import { RULE_CATEGORY_META } from '$lib/config/automationConfig';

	interface Props {
		/** Called when edit button is clicked for a rule */
		onEditRule?: (rule: AutomationRule) => void;
		/** Called when add rule button is clicked */
		onAddRule?: () => void;
		/** Trigger counts per rule ID (from activity tracking) */
		triggerCounts?: Map<string, number>;
		/** Highlighted rule ID (from activity log click-through) */
		highlightedRuleId?: string | null;
		/** Custom class */
		class?: string;
	}

	let {
		onEditRule = () => {},
		onAddRule = () => {},
		triggerCounts = new Map(),
		highlightedRuleId = null,
		class: className = ''
	}: Props = $props();

	// Get reactive state from store
	const rules = $derived(getRules());
	const config = $derived(getConfig());

	// Drag state
	let draggedRuleId = $state<string | null>(null);
	let dragOverRuleId = $state<string | null>(null);

	// Filter state
	let showEnabledOnly = $state(false);

	// Inline delete confirmation state
	let pendingDeleteId = $state<string | null>(null);
	let pendingDeleteSeconds = $state(3);
	let pendingDeleteTimer: ReturnType<typeof setTimeout> | null = null;
	let pendingDeleteCountdownTimer: ReturnType<typeof setInterval> | null = null;

	// Optimistic delete state (rule hidden immediately, actually deleted after undo window)
	let pendingDeletionIds = $state<Set<string>>(new Set());
	let undoRule = $state<AutomationRule | null>(null);
	let showUndoToast = $state(false);
	let undoTimer: ReturnType<typeof setTimeout> | null = null;

	// Import modal state
	let showImportModal = $state(false);
	let importFileInput: HTMLInputElement;
	let importData = $state<string | null>(null);
	let importFileName = $state<string>('');
	let importError = $state<string | null>(null);
	let importSuccess = $state(false);
	let parsedRuleCount = $state(0);

	// Group rules by category (excludes pending-deletion rules and enabled filter)
	const rulesByCategory = $derived.by(() => {
		const filtered = (showEnabledOnly ? rules.filter(r => r.enabled) : rules)
			.filter(r => !pendingDeletionIds.has(r.id));
		const grouped = new Map<RuleCategory, AutomationRule[]>();

		for (const rule of filtered) {
			const category = rule.category || 'custom';
			if (!grouped.has(category)) {
				grouped.set(category, []);
			}
			grouped.get(category)!.push(rule);
		}

		// Sort by priority within each category (highest first)
		for (const [_, categoryRules] of grouped) {
			categoryRules.sort((a, b) => b.priority - a.priority);
		}

		return grouped;
	});

	// Category order for display
	const categoryOrder: RuleCategory[] = ['recovery', 'prompt', 'stall', 'notification', 'custom'];

	// Handle drag start
	function handleDragStart(event: DragEvent, ruleId: string) {
		if (!event.dataTransfer) return;
		draggedRuleId = ruleId;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/plain', ruleId);
	}

	// Handle drag over
	function handleDragOver(event: DragEvent, ruleId: string) {
		event.preventDefault();
		if (draggedRuleId && draggedRuleId !== ruleId) {
			dragOverRuleId = ruleId;
		}
	}

	// Handle drag leave
	function handleDragLeave() {
		dragOverRuleId = null;
	}

	// Handle drop
	function handleDrop(event: DragEvent, targetRuleId: string) {
		event.preventDefault();
		if (!draggedRuleId || draggedRuleId === targetRuleId) {
			resetDragState();
			return;
		}

		// Get current rule order
		const currentOrder = rules.map(r => r.id);
		const draggedIndex = currentOrder.indexOf(draggedRuleId);
		const targetIndex = currentOrder.indexOf(targetRuleId);

		if (draggedIndex === -1 || targetIndex === -1) {
			resetDragState();
			return;
		}

		// Reorder: remove dragged and insert at target position
		const newOrder = [...currentOrder];
		newOrder.splice(draggedIndex, 1);
		newOrder.splice(targetIndex, 0, draggedRuleId);

		reorderRules(newOrder);
		resetDragState();
	}

	// Handle drag end
	function handleDragEnd() {
		resetDragState();
	}

	function resetDragState() {
		draggedRuleId = null;
		dragOverRuleId = null;
	}

	// Handle rule toggle
	function handleToggleRule(ruleId: string) {
		toggleRuleEnabled(ruleId);
	}

	// Bulk-toggle all visible rules in a category (disable all if all enabled, else enable all)
	function handleCategoryToggle(category: RuleCategory) {
		const categoryRules = rulesByCategory.get(category);
		if (!categoryRules?.length) return;
		const allEnabled = categoryRules.every(r => r.enabled);
		for (const rule of categoryRules) {
			if (allEnabled ? rule.enabled : !rule.enabled) {
				toggleRuleEnabled(rule.id);
			}
		}
	}

	function clearPendingDelete() {
		pendingDeleteId = null;
		pendingDeleteSeconds = 3;
		if (pendingDeleteTimer) clearTimeout(pendingDeleteTimer);
		if (pendingDeleteCountdownTimer) clearInterval(pendingDeleteCountdownTimer);
		pendingDeleteTimer = null;
		pendingDeleteCountdownTimer = null;
	}

	// Handle delete rule: 2-click countdown → optimistic delete with 5s undo window
	function handleDeleteRule(rule: AutomationRule) {
		if (pendingDeleteId === rule.id) {
			// Confirmed: hide immediately, schedule real deletion
			clearPendingDelete();
			pendingDeletionIds = new Set([...pendingDeletionIds, rule.id]);
			undoRule = rule;
			showUndoToast = true;
			if (undoTimer) clearTimeout(undoTimer);
			undoTimer = setTimeout(() => {
				deleteRule(rule.id);
				pendingDeletionIds.delete(rule.id);
				pendingDeletionIds = new Set(pendingDeletionIds);
				showUndoToast = false;
				undoRule = null;
				undoTimer = null;
			}, 5000);
		} else {
			clearPendingDelete();
			pendingDeleteId = rule.id;
			pendingDeleteSeconds = 3;
			pendingDeleteCountdownTimer = setInterval(() => {
				pendingDeleteSeconds = Math.max(0, pendingDeleteSeconds - 1);
			}, 1000);
			pendingDeleteTimer = setTimeout(() => {
				clearPendingDelete();
			}, 3000);
		}
	}

	function handleUndoDelete() {
		if (!undoRule) return;
		pendingDeletionIds.delete(undoRule.id);
		pendingDeletionIds = new Set(pendingDeletionIds);
		showUndoToast = false;
		if (undoTimer) clearTimeout(undoTimer);
		undoRule = null;
		undoTimer = null;
	}

	// Handle clone rule
	function handleCloneRule(ruleId: string) {
		if (pendingDeleteId === ruleId) clearPendingDelete();
		cloneRule(ruleId);
	}

	// Get trigger count for a rule
	function getTriggerCount(ruleId: string): number {
		return triggerCounts.get(ruleId) || 0;
	}

	// Get category metadata
	function getCategoryMeta(category: RuleCategory) {
		return RULE_CATEGORY_META[category] || RULE_CATEGORY_META.custom;
	}

	// Format action type for display
	function formatActionType(type: string): string {
		switch (type) {
			case 'send_text': return 'Send Text';
			case 'send_keys': return 'Send Keys';
			case 'tmux_command': return 'Tmux Cmd';
			case 'signal': return 'Signal';
			case 'notify_only': return 'Notify';
			default: return type;
		}
	}

	// Handle export rules
	function handleExport() {
		const jsonString = exportRules();
		const blob = new Blob([jsonString], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `automation-rules-${new Date().toISOString().slice(0, 10)}.json`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	// Handle import file selection
	function handleImportFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		importFileName = file.name;
		importError = null;
		importSuccess = false;

		const reader = new FileReader();
		reader.onload = (e) => {
			const content = e.target?.result as string;
			try {
				const data = JSON.parse(content);
				if (!data.rules || !Array.isArray(data.rules)) {
					importError = 'Invalid file format: "rules" array not found';
					importData = null;
					parsedRuleCount = 0;
				} else {
					importData = content;
					parsedRuleCount = data.rules.length;
					showImportModal = true;
				}
			} catch (err) {
				importError = 'Invalid JSON file';
				importData = null;
				parsedRuleCount = 0;
			}
		};
		reader.onerror = () => {
			importError = 'Failed to read file';
			importData = null;
		};
		reader.readAsText(file);

		// Reset input so same file can be selected again
		input.value = '';
	}

	// Handle import with merge option
	function handleImport(merge: boolean) {
		if (!importData) return;

		const success = importRules(importData, merge);
		if (success) {
			importSuccess = true;
			importError = null;
			showImportModal = false;
			// Reset state after a delay to allow success message to show
			setTimeout(() => {
				importSuccess = false;
				importData = null;
				importFileName = '';
				parsedRuleCount = 0;
			}, 3000);
		} else {
			importError = 'Failed to import rules. Check file format.';
		}
	}

	// Scroll highlighted rule into view when activity log click-through fires
	$effect(() => {
		if (highlightedRuleId) {
			const el = document.querySelector<HTMLElement>(`[data-rule-nav-id="${highlightedRuleId}"]`);
			el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}
	});

	// Cancel import
	function handleCancelImport() {
		showImportModal = false;
		importData = null;
		importFileName = '';
		importError = null;
		parsedRuleCount = 0;
	}
</script>

<div class="flex flex-col bg-base-200 rounded-xl overflow-hidden border border-base-content/[0.15] {className}">
	<!-- Header -->
	<header class="flex items-center justify-between gap-4 px-4 py-3 bg-base-300 border-b border-base-content/10">
		<div class="flex items-center gap-2">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-[18px] h-[18px] text-info">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
			</svg>
			<span class="text-sm font-semibold text-base-content">Automation Rules</span>
			{@const visibleCount = rules.filter(r => !pendingDeletionIds.has(r.id)).length}
			{@const filteredCount = [...rulesByCategory.values()].flat().length}
			<span class="text-xs font-normal text-base-content/50 bg-base-100 px-2 py-0.5 rounded-full tabular-nums">
				{#if showEnabledOnly && filteredCount !== visibleCount}
					{filteredCount} / {visibleCount}
				{:else}
					{visibleCount} rule{visibleCount !== 1 ? 's' : ''}
				{/if}
			</span>
			<button
				class="btn btn-xs gap-1 {showEnabledOnly ? 'btn-success' : 'btn-ghost text-base-content/50 border border-base-content/20 hover:text-base-content hover:border-base-content/35'}"
				onclick={() => showEnabledOnly = !showEnabledOnly}
				title={showEnabledOnly ? 'Show all rules' : 'Show enabled only'}
				aria-pressed={showEnabledOnly}
			>
				{#if showEnabledOnly}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
					</svg>
				{/if}
				Enabled
			</button>
		</div>

		<div class="flex items-center gap-3">
			<!-- Import/Export buttons -->
			<div class="flex items-center gap-1">
				<!-- Hidden file input for import -->
				<input
					type="file"
					accept=".json,application/json"
					class="!hidden"
					bind:this={importFileInput}
					onchange={handleImportFileChange}
				/>
				<!-- Import button -->
				<button
					class="btn btn-sm btn-ghost gap-1 text-xs text-base-content/50 hover:text-success hover:bg-success/15"
					onclick={() => importFileInput?.click()}
					aria-label="Import rules"
					title="Import rules from JSON file"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
					</svg>
					Import
				</button>
				<!-- Export button -->
				<button
					class="btn btn-sm btn-ghost gap-1 text-xs text-base-content/50 hover:text-info hover:bg-info/15 disabled:opacity-30 disabled:cursor-not-allowed"
					onclick={handleExport}
					aria-label="Export rules"
					title="Export rules to JSON file"
					disabled={rules.length === 0}
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
					</svg>
					Export
				</button>
			</div>

			<!-- Add rule button -->
			<button
				class="btn btn-sm btn-info btn-outline gap-1.5 font-mono"
				onclick={() => onAddRule()}
				aria-label="Add new rule"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
				</svg>
				Add Rule
			</button>
		</div>
	</header>

	<!-- Rules content -->
	<div class="flex-1 overflow-auto max-h-[65vh] transition-opacity duration-200 {config.enabled ? '' : 'opacity-50 pointer-events-none'}">
		{@const actualRuleCount = rules.filter(r => !pendingDeletionIds.has(r.id)).length}
		{@const anyVisibleRules = [...rulesByCategory.values()].some(arr => arr.length > 0)}
		{#if actualRuleCount === 0}
			<!-- True empty state: no rules configured yet -->
			<div class="flex flex-col gap-4 py-8 px-6" transition:fade={{ duration: 150 * _dur }}>
				<div class="flex flex-col gap-1.5">
					<p class="text-sm font-semibold text-base-content/65 m-0">No rules configured</p>
					<p class="text-xs text-base-content/40 leading-relaxed m-0">Rules watch session output for patterns and fire actions automatically — auto-respond, emit signals, or run commands.</p>
				</div>
				<div class="flex items-center gap-3 flex-wrap">
					<button class="btn btn-sm btn-info btn-outline gap-1.5" onclick={() => onAddRule()}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
						</svg>
						New Rule
					</button>
					<span class="text-xs text-base-content/30">or press</span>
					<kbd class="kbd kbd-sm font-mono text-xs">n</kbd>
					<span class="text-xs text-base-content/25">·</span>
					<span class="text-xs text-base-content/35">browse presets in the panel to the right →</span>
				</div>
				<div class="flex items-center gap-2 px-3 py-2 rounded-md self-start" style="background: oklch(0.17 0.015 250); border: 1px solid oklch(0.24 0.015 250 / 0.6);">
					<span class="text-[0.6rem] font-semibold uppercase tracking-widest text-base-content/30 mr-1">Example</span>
					<span class="text-xs font-mono text-warning/55">"Do you want to proceed"</span>
					<span class="text-xs text-base-content/20">→</span>
					<span class="text-xs font-mono text-info/55">send_text "y"</span>
				</div>
			</div>
		{:else if !anyVisibleRules}
			<!-- Filtered empty state: rules exist but none match the enabled filter -->
			<div class="flex items-center gap-2 py-6 px-6 text-xs text-base-content/40" transition:fade={{ duration: 150 * _dur }}>
				<span>All {actualRuleCount} rule{actualRuleCount !== 1 ? 's' : ''} are disabled —</span>
				<button class="text-info/70 hover:text-info underline underline-offset-2" onclick={() => showEnabledOnly = false}>show all</button>
			</div>
		{:else}
			<!-- Rules grouped by category -->
			{#each categoryOrder as category, categoryIndex}
				{@const categoryRules = rulesByCategory.get(category)}
				{#if categoryRules && categoryRules.length > 0}
					{@const meta = getCategoryMeta(category)}
					{@const allCatEnabled = categoryRules.every(r => r.enabled)}
					<div class="border-b border-base-content/10 last:border-b-0 fade-in-left fade-in-delay-{Math.min(categoryIndex, 12)}" transition:slide={{ duration: 200 * _dur, axis: 'y' }}>
						<div class="flex items-center gap-2 px-4 py-2.5 bg-base-300/50 border-b border-base-content/10">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 {meta.color}">
								<path stroke-linecap="round" stroke-linejoin="round" d={meta.icon} />
							</svg>
							<span class="text-xs font-semibold text-base-content/60 uppercase tracking-wider">{meta.label}</span>
							<span class="text-[0.6rem] text-base-content/50 bg-base-100 px-1.5 py-0.5 rounded-full">{categoryRules.length}</span>
							<button
								role="switch"
								aria-checked={allCatEnabled}
								class="ml-auto p-0 bg-transparent border-none cursor-pointer opacity-40 hover:opacity-90 transition-opacity duration-150"
								onclick={() => handleCategoryToggle(category)}
								aria-label="{allCatEnabled ? 'Disable' : 'Enable'} all {meta.label} rules"
								title="{allCatEnabled ? 'Disable' : 'Enable'} all {meta.label} rules"
							>
								<span class="flex items-center w-6 h-3.5 rounded-full p-0.5 transition-colors duration-150 {allCatEnabled ? 'bg-success/70' : 'bg-base-content/20'}">
									<span class="w-2.5 h-2.5 bg-base-content/80 rounded-full transition-transform duration-150 {allCatEnabled ? 'translate-x-2.5' : ''}"></span>
								</span>
							</button>
						</div>

						<div class="flex flex-col">
							{#each categoryRules as rule (rule.id)}
								{@const triggerCount = getTriggerCount(rule.id)}
								<div
									class="rule-row flex items-center gap-3 px-4 py-2.5 bg-base-200 border-b border-base-content/[0.09] transition-all duration-150 cursor-grab last:border-b-0 hover:bg-base-300 {draggedRuleId === rule.id ? 'opacity-50 bg-base-300' : ''} {dragOverRuleId === rule.id ? 'bg-info/10 border-t-2 border-t-info' : ''} {!rule.enabled ? 'opacity-50' : ''} {highlightedRuleId === rule.id ? 'rule-highlighted' : ''}"
									data-rule-nav-id={rule.id}
									draggable="true"
									ondragstart={(e) => handleDragStart(e, rule.id)}
									ondragover={(e) => handleDragOver(e, rule.id)}
									ondragleave={handleDragLeave}
									ondrop={(e) => handleDrop(e, rule.id)}
									ondragend={handleDragEnd}
									role="group"
									animate:flip={{ duration: 200 * _dur }}
									transition:slide={{ duration: 150 * _dur, axis: 'y' }}
								>
									<!-- Drag handle -->
									<div class="flex items-center justify-center w-5 text-base-content/30 cursor-grab transition-colors duration-150 hover:text-base-content/50 active:cursor-grabbing" aria-label="Drag to reorder">
										<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
											<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
										</svg>
									</div>

									<!-- Enable/disable toggle -->
									<button
										role="switch"
										aria-checked={rule.enabled}
										class="p-0 bg-transparent border-none cursor-pointer flex-shrink-0"
										onclick={() => handleToggleRule(rule.id)}
										aria-label={rule.enabled ? 'Disable rule' : 'Enable rule'}
									>
										<span class="flex items-center w-7 h-4 rounded-lg p-0.5 transition-colors duration-200 {rule.enabled ? 'bg-success' : 'bg-base-content/20'}">
											<span class="w-3 h-3 bg-base-content/80 rounded-full transition-transform duration-200 {rule.enabled ? 'translate-x-3' : ''}"></span>
										</span>
									</button>

									<!-- Rule info -->
									<div class="flex-1 min-w-0 flex flex-col gap-1">
										<div class="flex items-center gap-2">
											<span class="text-sm font-medium truncate {rule.enabled ? 'text-base-content' : 'text-base-content/50'}">
												{rule.name}
											</span>
											{#if rule.isPreset}
												<span class="badge badge-xs badge-secondary font-semibold uppercase tracking-wide">Preset</span>
											{/if}
											{#if triggerCount > 0}
												<span class="badge badge-xs badge-warning font-semibold min-w-[18px] text-center" title="{triggerCount} triggers this session">
													{triggerCount}
												</span>
											{/if}
										</div>
										<div class="flex items-center gap-1.5 text-xs text-base-content/50 font-mono">
											<span class="text-warning/80 max-w-[180px] truncate" title={rule.patterns[0]?.pattern}>
												{rule.patterns[0]?.mode === 'regex' ? '/' : '"'}{rule.patterns[0]?.pattern}{rule.patterns[0]?.mode === 'regex' ? '/' : '"'}
											</span>
											<span class="text-base-content/30">→</span>
											<span class="text-info/80">
												{formatActionType(rule.actions[0]?.type || 'unknown')}
											</span>
										</div>
									</div>

									<!-- Action buttons -->
									<div class="flex items-center gap-1.5">
										<button
											class="btn btn-xs btn-square btn-ghost text-base-content/50 hover:text-base-content hover:bg-info/20 hover:text-info"
											onclick={() => onEditRule(rule)}
											title="Edit rule"
											aria-label="Edit rule"
										>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
												<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
											</svg>
										</button>
										<button
											class="btn btn-xs btn-square btn-ghost text-base-content/50 hover:text-base-content hover:bg-secondary/20 hover:text-secondary"
											onclick={() => handleCloneRule(rule.id)}
											title="Clone rule"
											aria-label="Clone rule"
										>
											<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
												<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
											</svg>
										</button>
										<button
											class="btn btn-xs btn-square {pendingDeleteId === rule.id ? 'bg-error/20 text-error border border-error/40 hover:bg-error/30 animate-pulse-subtle' : 'btn-ghost text-base-content/50 hover:text-error hover:bg-error/20'}"
											onclick={() => handleDeleteRule(rule)}
											title={pendingDeleteId === rule.id ? 'Click again to confirm delete' : 'Delete rule'}
											aria-label={pendingDeleteId === rule.id ? `Confirm delete (${pendingDeleteSeconds}s)` : 'Delete rule'}
										>
											{#if pendingDeleteId === rule.id}
												<span class="font-mono text-[0.75rem] font-bold leading-none tabular-nums">{pendingDeleteSeconds}</span>
											{:else}
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
													<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
												</svg>
											{/if}
										</button>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		{/if}
	</div>

	<!-- Undo delete toast -->
	{#if showUndoToast && undoRule}
		<div class="flex items-center justify-between gap-3 px-4 py-2 border-t border-base-content/[0.08]" style="background: oklch(0.165 0.012 250);" transition:slide={{ duration: 150 * _dur, axis: 'y' }}>
			<div class="flex items-center gap-2 min-w-0">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5 text-base-content/35 flex-shrink-0">
					<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
				</svg>
				<span class="text-xs text-base-content/45 font-mono truncate">"{undoRule.name}" deleted</span>
			</div>
			<button
				class="btn btn-xs btn-ghost text-info/80 hover:text-info hover:bg-info/15 font-mono flex-shrink-0"
				onclick={handleUndoDelete}
			>Undo</button>
		</div>
	{/if}

	<!-- Import success/error messages -->
	{#if importSuccess}
		<div role="alert" class="alert alert-success text-sm font-medium border-t border-base-content/10 py-2" transition:fade={{ duration: 150 * _dur }}>
			<svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>Successfully imported {parsedRuleCount} rule{parsedRuleCount !== 1 ? 's' : ''}</span>
		</div>
	{/if}
	{#if importError && !showImportModal}
		<div role="alert" class="alert alert-error text-sm font-medium border-t border-base-content/10 py-2" transition:fade={{ duration: 150 * _dur }}>
			<svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
			</svg>
			<span>{importError}</span>
			<div>
				<button class="btn btn-sm btn-ghost" onclick={() => importError = null}>×</button>
			</div>
		</div>
	{/if}
</div>

<!-- Import Modal -->
{#if showImportModal}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="fixed inset-0 bg-base-300/80 flex items-center justify-center z-[1000] backdrop-blur-sm" onclick={handleCancelImport} role="presentation" transition:fade={{ duration: 150 * _dur }}>
		<div class="bg-base-200 border border-base-content/20 rounded-xl shadow-2xl min-w-[380px] max-w-[90vw]" role="dialog" tabindex="0" aria-modal="true" aria-labelledby="import-modal-title" onclick={(e) => e.stopPropagation()}>
			<div class="flex items-center gap-2.5 px-5 py-4 border-b border-base-content/10 bg-base-300 rounded-t-xl">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-[22px] h-[22px] text-success">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
				</svg>
				<h3 id="import-modal-title" class="text-base font-semibold text-base-content m-0 font-mono">Import Rules</h3>
			</div>

			<div class="p-5 flex flex-col gap-4">
				<div class="flex items-center gap-3 px-4 py-3 bg-base-300 border border-base-content/10 rounded-lg">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7 text-info flex-shrink-0">
						<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
					</svg>
					<div class="flex flex-col gap-0.5 min-w-0">
						<span class="text-sm font-medium text-base-content truncate font-mono">{importFileName}</span>
						<span class="text-xs text-base-content/60">{parsedRuleCount} rule{parsedRuleCount !== 1 ? 's' : ''} found</span>
					</div>
				</div>

				<p class="text-sm text-base-content/70 m-0">
					How would you like to import these rules?
				</p>

				<div class="flex gap-3">
					<button class="flex-1 flex items-center gap-3 px-4 py-3.5 bg-base-300 border border-base-content/20 rounded-lg cursor-pointer transition-all duration-150 hover:bg-success/10 hover:border-success/40 group" onclick={() => handleImport(true)}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-base-content/60 flex-shrink-0 group-hover:text-success">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
						</svg>
						<div class="flex flex-col gap-0.5 text-left">
							<span class="text-sm font-semibold text-base-content">Merge</span>
							<span class="text-xs text-base-content/50">Add new rules, keep existing</span>
						</div>
					</button>

					<button class="flex-1 flex items-center gap-3 px-4 py-3.5 bg-base-300 border border-base-content/20 rounded-lg cursor-pointer transition-all duration-150 hover:bg-info/10 hover:border-info/40 group" onclick={() => handleImport(false)}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-base-content/60 flex-shrink-0 group-hover:text-info">
							<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
						</svg>
						<div class="flex flex-col gap-0.5 text-left">
							<span class="text-sm font-semibold text-base-content">Replace</span>
							<span class="text-xs text-base-content/50">Remove all existing rules</span>
						</div>
					</button>
				</div>

				{#if importError}
					<div class="alert alert-error py-2.5 px-3.5 text-sm" transition:fade={{ duration: 150 * _dur }}>
						{importError}
					</div>
				{/if}
			</div>

			<div class="flex justify-end px-5 py-3.5 border-t border-base-content/10 bg-base-300 rounded-b-xl">
				<button class="btn btn-sm btn-ghost" onclick={handleCancelImport}>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Keyboard-nav focus indicator — applied by listNav to [data-rule-nav-id] rows */
	.rule-row.jk-focused {
		background: oklch(0.70 0.18 240 / 0.10);
		box-shadow: inset 3px 0 0 0 oklch(0.70 0.18 240);
	}

	/* Activity log click-through highlight */
	.rule-row.rule-highlighted {
		background: oklch(0.70 0.18 280 / 0.12);
		box-shadow: inset 3px 0 0 0 oklch(0.70 0.18 280);
		animation: agent-highlight-flash 1.5s ease-out forwards;
	}
</style>
