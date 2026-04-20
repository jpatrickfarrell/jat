<script lang="ts">
	import { randomUUID } from '$lib/utils/uuid';
	/**
	 * ActivityLog Component
	 *
	 * Shows recent automation rule triggers across all sessions.
	 * Columns: timestamp, session name, rule name, matched pattern, action taken, result.
	 * Features: Clear button, filter by rule or session.
	 * Data stored in memory (not persisted).
	 */

	import { fly, fade, slide } from 'svelte/transition';

	// Multiplier for all transition durations — collapses to 0 when reduced motion is preferred
	const _dur = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1;

	/** Activity log entry */
	export interface ActivityLogEntry {
		id: string;
		timestamp: Date;
		sessionName: string;
		ruleName: string;
		matchedPattern: string;
		actionTaken: string;
		result: 'success' | 'failure' | 'pending';
		details?: string;
	}

	interface Props {
		/** External entries to display (component can also maintain internal state) */
		entries?: ActivityLogEntry[];
		/** Called when a rule name in the log is clicked — for click-through to RulesList */
		onRuleClick?: (ruleName: string) => void;
		/** Called when clear button is clicked */
		onClear?: () => void;
		/** Maximum entries to display */
		maxEntries?: number;
		/** Custom class */
		class?: string;
	}

	let {
		entries = $bindable([]),
		onRuleClick,
		onClear = () => {},
		maxEntries = 100,
		class: className = ''
	}: Props = $props();

	// Filter state
	let filterSession = $state('');
	let filterRule = $state('');

	// Filtered entries
	const filteredEntries = $derived.by(() => {
		let result = entries;

		if (filterSession) {
			result = result.filter(e => 
				e.sessionName.toLowerCase().includes(filterSession.toLowerCase())
			);
		}

		if (filterRule) {
			result = result.filter(e => 
				e.ruleName.toLowerCase().includes(filterRule.toLowerCase())
			);
		}

		return result.slice(0, maxEntries);
	});

	// Unique sessions and rules for filter dropdowns
	const uniqueSessions = $derived([...new Set(entries.map(e => e.sessionName))].sort());
	const uniqueRules = $derived([...new Set(entries.map(e => e.ruleName))].sort());

	// Result badge styling
	function getResultBadgeClass(result: ActivityLogEntry['result']): string {
		switch (result) {
			case 'success': return 'badge-success';
			case 'failure': return 'badge-error';
			case 'pending': return 'badge-warning';
			default: return 'badge-neutral';
		}
	}

	function formatTimestamp(date: Date): string {
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		});
	}

	function formatTimestampFull(date: Date): string {
		return date.toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false
		});
	}

	function handleClear() {
		entries = [];
		onClear();
	}

	function clearFilters() {
		filterSession = '';
		filterRule = '';
	}

	// Add entry method (for external use)
	export function addEntry(entry: Omit<ActivityLogEntry, 'id'>) {
		const newEntry: ActivityLogEntry = {
			...entry,
			id: randomUUID()
		};
		entries = [newEntry, ...entries].slice(0, maxEntries);
	}
</script>

<div class="flex flex-col rounded-md overflow-hidden bg-base-100 border border-base-content/[0.07] {className}">
	<!-- Header with filters and clear button -->
	<header class="flex items-center justify-between gap-4 px-4 py-3 bg-base-200 border-b border-base-content/[0.07]">
		<div class="flex items-center gap-2 text-sm font-semibold text-base-content">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-[18px] h-[18px] text-info">
				<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
			</svg>
			<span>Activity Log</span>
			<span class="text-[0.7rem] font-normal text-base-content/50 bg-base-100 px-2 py-0.5 rounded-full">{filteredEntries.length} / {entries.length}</span>
		</div>

		<div class="flex items-center gap-2">
			<!-- Session filter -->
			<select
				class="text-xs py-1.5 px-2.5 font-mono min-w-[110px] cursor-pointer bg-base-100 border border-base-content/20 rounded-md text-base-content hover:bg-base-200 hover:border-base-content/30 focus:outline-none focus:border-info"
				bind:value={filterSession}
				aria-label="Filter by session"
			>
				<option value="">All Sessions</option>
				{#each uniqueSessions as session}
					<option value={session}>{session}</option>
				{/each}
			</select>

			<!-- Rule filter -->
			<select
				class="text-xs py-1.5 px-2.5 font-mono min-w-[110px] cursor-pointer bg-base-100 border border-base-content/20 rounded-md text-base-content hover:bg-base-200 hover:border-base-content/30 focus:outline-none focus:border-info"
				bind:value={filterRule}
				aria-label="Filter by rule"
			>
				<option value="">All Rules</option>
				{#each uniqueRules as rule}
					<option value={rule}>{rule}</option>
				{/each}
			</select>

			{#if filterSession || filterRule}
				<button
					class="flex items-center gap-1.5 py-1.5 px-2.5 text-xs font-mono cursor-pointer bg-base-100 border border-base-content/20 rounded-md text-base-content/70 transition-all duration-150 hover:bg-base-200 hover:border-base-content/30 hover:text-base-content"
					onclick={clearFilters}
					aria-label="Clear filters"
				>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
						<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			{/if}

			<button
				class="flex items-center gap-1.5 py-1.5 px-2.5 text-xs font-mono cursor-pointer bg-base-100 border border-base-content/20 rounded-md text-base-content/70 transition-all duration-150 hover:bg-error/20 hover:border-error/40 hover:text-base-content disabled:opacity-40 disabled:cursor-not-allowed"
				onclick={handleClear}
				disabled={entries.length === 0}
				aria-label="Clear all entries"
			>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
					<path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
				</svg>
				Clear
			</button>
		</div>
	</header>

	<!-- Log table -->
	<div class="flex-1 overflow-auto min-h-[200px] max-h-[400px]">
		{#if filteredEntries.length === 0}
			<div class="flex flex-col items-center justify-center py-10 px-4 gap-2" transition:fade={{ duration: 150 * _dur }}>
				{#if entries.length === 0}
					<div class="w-2 h-2 rounded-full bg-success/40 animate-pulse-subtle mb-1"></div>
					<p class="text-sm font-medium text-base-content/45 m-0">Listening</p>
					<p class="text-xs font-mono text-base-content/30 m-0">0 triggers this session</p>
				{:else}
					<p class="text-sm font-medium text-base-content/45 m-0">No matching entries</p>
					<p class="text-xs text-base-content/30 m-0">Try adjusting your filters</p>
				{/if}
			</div>
		{:else}
			<table class="w-full text-xs" style="border-collapse: collapse;">
				<thead class="sticky top-0 z-[1] bg-base-200">
					<tr>
						<th class="w-[75px] py-2.5 px-3 text-left font-semibold text-base-content/50 uppercase text-[0.65rem] tracking-wide border-b border-base-content/20">Time</th>
						<th class="w-[120px] py-2.5 px-3 text-left font-semibold text-base-content/50 uppercase text-[0.65rem] tracking-wide border-b border-base-content/20">Session</th>
						<th class="w-[130px] py-2.5 px-3 text-left font-semibold text-base-content/50 uppercase text-[0.65rem] tracking-wide border-b border-base-content/20">Rule</th>
						<th class="min-w-[150px] py-2.5 px-3 text-left font-semibold text-base-content/50 uppercase text-[0.65rem] tracking-wide border-b border-base-content/20">Pattern</th>
						<th class="min-w-[100px] py-2.5 px-3 text-left font-semibold text-base-content/50 uppercase text-[0.65rem] tracking-wide border-b border-base-content/20">Action</th>
						<th class="w-[80px] py-2.5 px-3 text-center font-semibold text-base-content/50 uppercase text-[0.65rem] tracking-wide border-b border-base-content/20">Result</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredEntries as entry (entry.id)}
						<tr
							class="transition-colors duration-100 hover:bg-base-300/50"
							style={entry.result === 'success' ? 'box-shadow: inset 3px 0 0 var(--color-success)' : entry.result === 'failure' ? 'box-shadow: inset 3px 0 0 var(--color-error)' : ''}
							transition:slide={{ duration: 150 * _dur, axis: 'y' }}
						>
							<td class="w-[75px] py-2 px-3 text-base-content/75 border-b border-base-content/10 align-middle font-mono text-base-content/60" title={formatTimestampFull(entry.timestamp)}>
								{formatTimestamp(entry.timestamp)}
							</td>
							<td class="w-[120px] py-2 px-3 text-base-content/75 border-b border-base-content/10 align-middle">
								<span class="inline-block py-0.5 px-2 rounded font-mono text-[0.7rem] bg-info/20 text-info max-w-full overflow-hidden text-ellipsis whitespace-nowrap">{entry.sessionName}</span>
							</td>
							<td class="w-[130px] py-2 px-3 text-base-content/75 border-b border-base-content/10 align-middle">
								{#if onRuleClick}
									<button
										class="text-secondary font-medium hover:text-secondary/70 hover:underline underline-offset-2 cursor-pointer bg-transparent border-none p-0 text-left text-xs"
										onclick={() => onRuleClick(entry.ruleName)}
										title="Highlight rule in rules list"
									>{entry.ruleName}</button>
								{:else}
									<span class="text-secondary font-medium">{entry.ruleName}</span>
								{/if}
							</td>
							<td class="min-w-[150px] py-2 px-3 text-base-content/75 border-b border-base-content/10 align-middle">
								<code class="inline-block py-0.5 px-1.5 rounded font-mono text-[0.65rem] bg-base-300 border border-base-content/15 text-warning max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" title={entry.matchedPattern}>
									{entry.matchedPattern}
								</code>
							</td>
							<td class="min-w-[100px] py-2 px-3 text-base-content/75 border-b border-base-content/10 align-middle">
								<span class="text-base-content/70">{entry.actionTaken}</span>
							</td>
							<td class="w-[80px] py-2 px-3 text-base-content/75 border-b border-base-content/10 align-middle text-center">
								<span class="inline-block py-0.5 px-2 rounded-full text-[0.65rem] font-semibold uppercase tracking-wide {entry.result === 'success' ? 'bg-success/20 text-success' : entry.result === 'failure' ? 'bg-error/20 text-error' : entry.result === 'pending' ? 'bg-warning/20 text-warning' : 'bg-base-300 text-base-content/60'}">
									{entry.result}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<style>
	/* All styling converted to inline Tailwind/DaisyUI classes for Tailwind v4 compatibility */
</style>
