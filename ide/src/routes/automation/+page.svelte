<script lang="ts">
	/**
	 * Automation Rules Page
	 *
	 * Configure pattern-based automation rules for agent sessions.
	 * Layout: Rules list (left), Presets picker (right), Pattern tester (bottom), Activity log (bottom).
	 */

	import { onMount } from 'svelte';
	import RulesList from '$lib/components/automation/RulesList.svelte';
	import PresetsPicker from '$lib/components/automation/PresetsPicker.svelte';
	import PatternTester from '$lib/components/automation/PatternTester.svelte';
	import ActivityLog from '$lib/components/automation/ActivityLog.svelte';
	import RuleEditor from '$lib/components/automation/RuleEditor.svelte';
	import KeyboardShortcutsOverlay from '$lib/components/KeyboardShortcutsOverlay.svelte';
	import { createListNav } from '$lib/actions/listNav';
	import type { AutomationRule } from '$lib/types/automation';
	import type { ActivityLogEntry } from '$lib/components/automation/ActivityLog.svelte';
	import { addRule, updateRule, getRules, getActivityEvents, initializeStore, isInitialized, toggleAutomation, getConfig, toggleRuleEnabled, reorderRules } from '$lib/stores/automationRules.svelte';
	import { onAutomationTrigger } from '$lib/utils/automationEngine';

	// Reactive automation config for page-level master toggle
	const config = $derived(getConfig());

	// Rule counts for header strip
	const enabledRuleCount = $derived(getRules().filter(r => r.enabled).length);
	const totalRuleCount = $derived(getRules().length);

	// Highlighted rule ID (from activity log click-through)
	let highlightedRuleId = $state<string | null>(null);

	function handleMasterToggle() {
		toggleAutomation();
	}

	function handleRuleClick(ruleName: string) {
		const rule = getRules().find(r => r.name === ruleName);
		if (rule) {
			highlightedRuleId = rule.id;
			setTimeout(() => { highlightedRuleId = null; }, 3000);
		}
	}

	// Convert store activity events to ActivityLog format
	function convertStoreEventsToLogEntries(): ActivityLogEntry[] {
		const storeEvents = getActivityEvents();
		const entries: ActivityLogEntry[] = storeEvents.map(event => ({
			id: event.id,
			timestamp: new Date(event.timestamp),
			sessionName: event.sessionName,
			ruleName: event.ruleName,
			matchedPattern: event.matchedPattern,
			actionTaken: event.actionsExecuted?.map(a => a.type).join(', ') || 'none',
			result: (event.success ? 'success' : 'failure') as 'success' | 'failure',
			details: event.error
		}));
		return entries;
	}

	// Convert store rules to PatternTester format
	// PatternTester uses simplified types, so we flatten patterns array
	const testerRules = $derived.by(() => {
		const storeRules = getRules();
		return storeRules.flatMap(rule => {
			// Create one entry per pattern in the rule
			return rule.patterns.map((pattern, idx) => ({
				id: `${rule.id}-p${idx}`,
				name: rule.name,
				enabled: rule.enabled,
				pattern: pattern.pattern,
				isRegex: pattern.mode === 'regex',
				caseSensitive: pattern.caseSensitive ?? false,
				action: rule.actions[0] || { type: 'notify_only' as const, value: '' },
				cooldownMs: rule.cooldownSeconds * 1000,
				priority: rule.priority
			}));
		});
	});

	// Page state
	let isLoading = $state(false);

	// Rule editor modal state
	let showRuleEditor = $state(false);
	let editingRule = $state<AutomationRule | null>(null);

	// Activity log entries (in-memory, not persisted)
	let activityEntries = $state<ActivityLogEntry[]>([]);

	// Trigger counts per rule (derived from activity log)
	const triggerCounts = $derived.by(() => {
		const counts = new Map<string, number>();
		for (const entry of activityEntries) {
			const current = counts.get(entry.ruleName) || 0;
			counts.set(entry.ruleName, current + 1);
		}
		return counts;
	});

	// Initialize page
	onMount(() => {
		if (!isInitialized()) {
			initializeStore();
		}

		activityEntries = convertStoreEventsToLogEntries();

		// Subscribe to automation triggers for activity log (new events while page is open)
		const unsubscribe = onAutomationTrigger((sessionName, rule, match, results) => {
			// Convert trigger event to ActivityLogEntry
			const entry: ActivityLogEntry = {
				id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
				timestamp: new Date(),
				sessionName,
				ruleName: rule.name,
				matchedPattern: match.pattern.pattern,
				actionTaken: results.map(r => r.action.type).join(', ') || 'none',
				result: results.every(r => r.success) ? 'success' : results.some(r => r.success) ? 'pending' : 'failure',
				details: results.map(r => r.error).filter(Boolean).join('; ') || undefined
			};
			activityEntries = [entry, ...activityEntries].slice(0, 100); // Keep latest 100
		});

		return () => {
			unsubscribe();
		};
	});

	// Handle edit rule
	function handleEditRule(rule: AutomationRule) {
		editingRule = rule;
		showRuleEditor = true;
	}

	// Handle add rule
	function handleAddRule() {
		editingRule = null;
		showRuleEditor = true;
	}

	// Handle close rule editor
	function handleCloseEditor() {
		showRuleEditor = false;
		editingRule = null;
	}

	// Handle save rule
	function handleSaveRule(rule: AutomationRule) {
		if (editingRule) {
			// Update existing rule
			updateRule(rule.id, rule);
		} else {
			// Create new rule
			addRule(rule);
		}
		handleCloseEditor();
	}

	// Handle clear activity log
	function handleClearLog() {
		activityEntries = [];
	}

	// ─── Keyboard navigation (j/k/Enter/Escape/n + ? overlay) ──────────────
	const nav = createListNav({
		getItems: () => Array.from(document.querySelectorAll<HTMLElement>('[data-rule-nav-id]')),
		onSelect: (el) => {
			const ruleId = el.dataset.ruleNavId;
			if (!ruleId) return;
			const rule = getRules().find((r) => r.id === ruleId);
			if (rule) handleEditRule(rule);
		}
	});

	function isTypingTarget(target: EventTarget | null): boolean {
		if (!(target instanceof HTMLElement)) return false;
		const tag = target.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
		return target.isContentEditable;
	}

	function handleWindowKeydown(e: KeyboardEvent) {
		if (showRuleEditor) return;
		if (isTypingTarget(e.target)) return;
		if (e.ctrlKey || e.metaKey || e.altKey) return;

		if (nav.handleKeydown(e)) return;

		if (e.key === 'n' && !e.shiftKey) {
			e.preventDefault();
			handleAddRule();
		}

		// Space: toggle enable/disable on focused rule
		if (e.key === ' ' && !e.shiftKey) {
			const focused = document.querySelector<HTMLElement>('[data-rule-nav-id].jk-focused');
			if (focused?.dataset.ruleNavId) {
				e.preventDefault();
				toggleRuleEnabled(focused.dataset.ruleNavId);
			}
		}

		// Shift+J / Shift+K: move focused rule down / up in priority order
		if ((e.key === 'J' || e.key === 'K') && e.shiftKey) {
			const focused = document.querySelector<HTMLElement>('[data-rule-nav-id].jk-focused');
			if (focused?.dataset.ruleNavId) {
				e.preventDefault();
				const currentOrder = getRules().map(r => r.id);
				const idx = currentOrder.indexOf(focused.dataset.ruleNavId);
				if (idx === -1) return;
				const newOrder = [...currentOrder];
				if (e.key === 'K' && idx > 0) {
					[newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
					reorderRules(newOrder);
				} else if (e.key === 'J' && idx < currentOrder.length - 1) {
					[newOrder[idx + 1], newOrder[idx]] = [newOrder[idx], newOrder[idx + 1]];
					reorderRules(newOrder);
				}
			}
		}
	}

	$effect(() => {
		window.addEventListener('keydown', handleWindowKeydown);
		return () => window.removeEventListener('keydown', handleWindowKeydown);
	});

	const keyboardShortcuts = [
		{ key: 'j / ↓', description: 'Focus next rule' },
		{ key: 'k / ↑', description: 'Focus previous rule' },
		{ key: 'Enter', description: 'Edit focused rule' },
		{ key: 'Space', description: 'Toggle focused rule on/off' },
		{ key: 'Shift+J / Shift+K', description: 'Move focused rule down/up in priority' },
		{ key: 'n', description: 'Create new rule' },
		{ key: 'Escape', description: 'Clear focus' }
	];
</script>

<svelte:head>
	<title>Automation | JAT IDE</title>
	<meta name="description" content="Configure pattern-based automation rules for agent sessions. Set up auto-responses, recovery actions, and notifications." />
	<meta property="og:title" content="Automation | JAT IDE" />
	<meta property="og:description" content="Configure pattern-based automation rules for agent sessions. Set up auto-responses, recovery actions, and notifications." />
	<meta property="og:image" content="/favicons/automation.svg" />
	<link rel="icon" href="/favicons/automation.svg" />
</svelte:head>

<div class="h-full flex flex-col overflow-hidden" style="background: oklch(0.14 0.01 250);">
	<!-- Page-level automation system toggle -->
	<div class="flex items-center justify-between px-4 py-2.5 border-b border-base-content/[0.08] flex-shrink-0" style="background: oklch(0.165 0.015 250);">
		<div class="flex items-center gap-2.5">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 transition-colors duration-200 {config.enabled ? 'text-success' : 'text-base-content/30'}">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
			</svg>
			<span class="text-xs font-semibold uppercase tracking-widest text-base-content/50">Automation</span>
			{#if totalRuleCount > 0}
				<span class="text-[0.65rem] font-mono tabular-nums text-base-content/30">{enabledRuleCount}/{totalRuleCount} active</span>
			{/if}
		</div>
		<div class="flex items-center gap-3">
			<span class="text-[0.7rem] font-semibold uppercase tracking-widest transition-colors duration-200 {config.enabled ? 'text-success' : 'text-base-content/30'}">
				{config.enabled ? 'System On' : 'System Off'}
			</span>
			<button
				role="switch"
				aria-checked={config.enabled}
				class="p-0 bg-transparent border-none cursor-pointer"
				onclick={handleMasterToggle}
				aria-label={config.enabled ? 'Disable automation system' : 'Enable automation system'}
				title={config.enabled ? 'Disable all automation rules' : 'Enable all automation rules'}
			>
				<span class="flex items-center w-9 h-5 rounded-full p-0.5 transition-colors duration-200 {config.enabled ? 'bg-success' : 'bg-base-content/20'}">
					<span class="w-4 h-4 bg-white/80 rounded-full shadow-sm transition-transform duration-200 {config.enabled ? 'translate-x-4' : ''}"></span>
				</span>
			</button>
		</div>
	</div>

	{#if isLoading}
		<!-- Skeleton Loading State -->
		<div class="flex-1 p-4 overflow-hidden">
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div class="lg:col-span-2 skeleton rounded-lg" style="background: oklch(0.18 0.02 250); min-height: 300px;"></div>
				<div class="skeleton rounded-lg" style="background: oklch(0.18 0.02 250); min-height: 300px;"></div>
				<div class="skeleton rounded-lg" style="background: oklch(0.18 0.02 250); min-height: 250px;"></div>
				<div class="lg:col-span-2 skeleton rounded-lg" style="background: oklch(0.18 0.02 250); min-height: 250px;"></div>
			</div>
		</div>
	{:else}
		<!-- Main Content -->
		<div class="flex-1 p-4 overflow-auto">
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-min">
				<!-- RulesList: primary surface, 2/3 width -->
				<div class="lg:col-span-2 min-h-[300px] overflow-hidden">
					<RulesList
						onEditRule={handleEditRule}
						onAddRule={handleAddRule}
						{triggerCounts}
						{highlightedRuleId}
						class="h-full"
					/>
				</div>

				<!-- PresetsPicker: supplementary, 1/3 width -->
				<div class="min-h-[300px] overflow-hidden">
					<PresetsPicker class="h-full" />
				</div>

				<!-- PatternTester: supplementary, 1/3 width -->
				<div class="min-h-[250px] overflow-hidden">
					<PatternTester rules={testerRules} />
				</div>

				<!-- ActivityLog: secondary surface, 2/3 width -->
				<div class="lg:col-span-2 min-h-[250px] overflow-hidden">
					<ActivityLog
						bind:entries={activityEntries}
						onClear={handleClearLog}
						onRuleClick={handleRuleClick}
						class="h-full"
					/>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Rule Editor Modal -->
<RuleEditor
	bind:isOpen={showRuleEditor}
	rule={editingRule}
	onSave={handleSaveRule}
	onCancel={handleCloseEditor}
/>

<!-- Keyboard Shortcuts Overlay (toggle with ?) -->
<KeyboardShortcutsOverlay
	title="Automation — Keyboard Shortcuts"
	shortcuts={keyboardShortcuts}
/>
