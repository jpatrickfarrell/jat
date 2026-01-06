<script lang="ts">
	/**
	 * ActivityLog Component
	 *
	 * Shows recent automation rule triggers across all sessions.
	 * Columns: timestamp, session name, rule name, matched pattern, action taken, result.
	 * Features: Clear button, filter by rule or session.
	 * Data stored in memory (not persisted).
	 */

	import { fly, fade, slide } from 'svelte/transition';

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
		/** Called when clear button is clicked */
		onClear?: () => void;
		/** Maximum entries to display */
		maxEntries?: number;
		/** Custom class */
		class?: string;
	}

	let {
		entries = $bindable([]),
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
			id: crypto.randomUUID()
		};
		entries = [newEntry, ...entries].slice(0, maxEntries);
	}
</script>

<div class="flex flex-col rounded-lg overflow-hidden bg-base-200 border border-base-300 {className}">
	<!-- Header with filters and clear button -->
	<header class="flex items-center justify-between gap-4 px-4 py-3 bg-base-300 border-b border-base-300">
		<div class="flex items-center gap-2 text-sm font-semibold text-base-content font-mono">
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
			<div class="flex flex-col items-center justify-center py-12 px-4 gap-2 text-base-content/50" transition:fade={{ duration: 150 }}>
				{#if entries.length === 0}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-base-content/30 mb-2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
					</svg>
					<p class="text-sm font-medium text-base-content/50 m-0">No activity yet</p>
					<p class="text-xs text-base-content/40 m-0">Rule triggers will appear here</p>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-base-content/30 mb-2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
					</svg>
					<p class="text-sm font-medium text-base-content/50 m-0">No matching entries</p>
					<p class="text-xs text-base-content/40 m-0">Try adjusting your filters</p>
				{/if}
			</div>
		{:else}
			<table class="w-full text-xs" style="border-collapse: collapse;">
				<thead class="sticky top-0 z-[1] bg-base-300">
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
							transition:slide={{ duration: 150, axis: 'y' }}
						>
							<td class="w-[75px] py-2 px-3 text-base-content/75 border-b border-base-content/10 align-middle font-mono text-base-content/60" title={formatTimestampFull(entry.timestamp)}>
								{formatTimestamp(entry.timestamp)}
							</td>
							<td class="w-[120px] py-2 px-3 text-base-content/75 border-b border-base-content/10 align-middle">
								<span class="inline-block py-0.5 px-2 rounded font-mono text-[0.7rem] bg-info/20 text-info max-w-full overflow-hidden text-ellipsis whitespace-nowrap">{entry.sessionName}</span>
							</td>
							<td class="w-[130px] py-2 px-3 text-base-content/75 border-b border-base-content/10 align-middle">
								<span class="text-secondary font-medium">{entry.ruleName}</span>
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
