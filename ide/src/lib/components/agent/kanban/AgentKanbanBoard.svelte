<script lang="ts">
	/**
	 * AgentKanbanBoard Component
	 *
	 * Kanban board grouping agents/sessions by their activity state.
	 * Each column represents an activity state (starting, working, needs-input, etc.)
	 * Uses SessionCard with mode='compact' for each agent.
	 */

	import { SESSION_STATE_VISUALS } from '$lib/config/statusColors';
	import type { ActivityState } from '$lib/types/agent';
	import AgentKanbanColumn from './AgentKanbanColumn.svelte';
	import SessionCard from '$lib/components/work/SessionCard.svelte';
	import { tick } from 'svelte';

	// Work session type (from WorkPanel)
	interface SparklineDataPoint {
		timestamp: string;
		tokens: number;
		cost: number;
	}

	interface WorkSession {
		sessionName: string;
		agentName: string;
		task: {
			id: string;
			title?: string;
			status?: string;
			priority?: number;
			issue_type?: string;
		} | null;
		lastCompletedTask: {
			id: string;
			title?: string;
			status?: string;
			priority?: number;
			closedAt?: string;
		} | null;
		output: string;
		lineCount: number;
		tokens: number;
		cost: number;
		sparklineData?: SparklineDataPoint[];
		created: string;
		attached: boolean;
		/** Real-time state from WS (working, needs-input, ready-for-review, etc.) */
		_sseState?: string;
		/** Timestamp when WS state was last updated */
		_sseStateTimestamp?: number;
		/** Suggested tasks from jat-signal (via WS session-signal event) */
		_signalSuggestedTasks?: Array<{
			id?: string;
			type: string;
			title: string;
			description: string;
			priority: number;
			reason?: string;
			project?: string;
			labels?: string;
			depends_on?: string[];
		}>;
		/** Timestamp when signal suggested tasks were last updated */
		_signalSuggestedTasksTimestamp?: number;
		/** Completion bundle from jat-signal complete (via WS session-complete event) */
		_completionBundle?: {
			taskId: string;
			agentName: string;
			summary: string[];
			quality: {
				tests: 'passing' | 'failing' | 'none' | 'skipped';
				build: 'clean' | 'warnings' | 'errors';
				preExisting?: string;
			};
			humanActions?: Array<{
				title: string;
				description?: string;
				items?: string[];
			}>;
			suggestedTasks?: Array<{
				id?: string;
				type: string;
				title: string;
				description: string;
				priority: number;
				reason?: string;
				project?: string;
				labels?: string;
				depends_on?: string[];
			}>;
			crossAgentIntel?: {
				files?: string[];
				patterns?: string[];
				gotchas?: string[];
			};
		};
		/** Timestamp when completion bundle was received */
		_completionBundleTimestamp?: number;
	}

	interface Props {
		sessions?: WorkSession[];
		onKillSession?: (sessionName: string) => Promise<void>;
		onInterrupt?: (sessionName: string) => Promise<void>;
		onContinue?: (sessionName: string) => Promise<void>;
		onAttachTerminal?: (sessionName: string) => Promise<void>;
		onSendInput?: (sessionName: string, input: string, type: 'text' | 'key' | 'raw') => Promise<void>;
		onTaskClick?: (taskId: string) => void;
		/** Filter by project (optional) */
		projectFilter?: string | null;
		/** Filter by priority (optional) */
		priorityFilter?: Set<number> | null;
		/** Search query (optional) */
		searchQuery?: string;
		class?: string;
	}

	let {
		sessions = [],
		onKillSession,
		onInterrupt,
		onContinue,
		onAttachTerminal,
		onSendInput,
		onTaskClick,
		projectFilter = null,
		priorityFilter = null,
		searchQuery = '',
		class: className = ''
	}: Props = $props();

	// Column order for the kanban board
	const columnOrder: ActivityState[] = [
		'needs-input',
		'ready-for-review',
		'working',
		'starting',
		'completing',
		'completed',
		'idle'
	];

	// Track collapsed columns
	let collapsedColumns = $state<Set<ActivityState>>(new Set());

	/**
	 * Detect session activity state from output (same logic as WorkPanel)
	 */
	function getSessionState(session: WorkSession): ActivityState {
		const output = session.output || '';
		const recentOutput = output.slice(-3000);

		// Helper to find last position of regex patterns
		const findLastPos = (patterns: RegExp[]): number => {
			let maxPos = -1;
			for (const pattern of patterns) {
				const match = recentOutput.match(new RegExp(pattern.source, 'g'));
				if (match) {
					const lastMatch = match[match.length - 1];
					const pos = recentOutput.lastIndexOf(lastMatch);
					if (pos > maxPos) maxPos = pos;
				}
			}
			return maxPos;
		};

		// Find positions using same patterns as WorkCard
		const needsInputPos = findLastPos([
			/\[JAT:NEEDS_INPUT\]/,
			/❓\s*NEED CLARIFICATION/,
			// Claude Code's native question UI patterns
			/Enter to select.*Tab\/Arrow keys to navigate.*Esc to cancel/,
			/\[ \].*\n.*\[ \]/, // Multiple checkbox options
			/Type something\s*\n\s*Next/ // "Type something" option in questions
		]);
		const workingPos = findLastPos([/\[JAT:WORKING\s+task=/]);
		const reviewPos = findLastPos([
			/\[JAT:NEEDS_REVIEW\]/,
			/\[JAT:READY\s+actions=/,
			/🔍\s*READY FOR REVIEW/
		]);
		const completingPos = findLastPos([/jat:complete is running/, /Marking task complete/]);
		const completedPos = findLastPos([/\[JAT:COMPLETED\]/, /\[JAT:IDLE\]/, /✅\s*TASK COMPLETE/]);

		if (session.task) {
			const positions = [
				{ state: 'needs-input' as ActivityState, pos: needsInputPos },
				{ state: 'ready-for-review' as ActivityState, pos: reviewPos },
				{ state: 'completing' as ActivityState, pos: completingPos },
				{ state: 'working' as ActivityState, pos: workingPos }
			].filter((p) => p.pos >= 0);

			if (positions.length > 0) {
				// Sort by position descending (most recent marker wins)
				positions.sort((a, b) => b.pos - a.pos);
				return positions[0].state;
			}
			// No markers found - agent is starting/initializing
			return 'starting';
		}

		// No active task - check completed vs idle
		const hasCompletionMarker = completedPos >= 0;
		if (session.lastCompletedTask || hasCompletionMarker) {
			return 'completed';
		}
		return 'idle';
	}

	/**
	 * Apply filters to sessions
	 */
	const filteredSessions = $derived.by(() => {
		let result = sessions;

		// Filter by project
		if (projectFilter && projectFilter !== 'All Projects') {
			result = result.filter((s) => s.task?.id?.startsWith(projectFilter + '-'));
		}

		// Filter by priority
		if (priorityFilter && priorityFilter.size > 0 && priorityFilter.size < 4) {
			result = result.filter(
				(s) => s.task?.priority !== undefined && priorityFilter.has(s.task.priority)
			);
		}

		// Filter by search
		if (searchQuery?.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(s) =>
					s.agentName.toLowerCase().includes(query) ||
					s.task?.title?.toLowerCase().includes(query) ||
					s.task?.id?.toLowerCase().includes(query)
			);
		}

		return result;
	});

	/**
	 * Group sessions by activity state
	 */
	const sessionsByState = $derived.by(() => {
		const groups = new Map<ActivityState, WorkSession[]>();

		// Initialize all columns (even if empty)
		for (const state of columnOrder) {
			groups.set(state, []);
		}

		// Group sessions
		for (const session of filteredSessions) {
			const state = getSessionState(session);
			const list = groups.get(state) || [];
			list.push(session);
			groups.set(state, list);
		}

		return groups;
	});

	/**
	 * Get count for a state
	 */
	function getCount(state: ActivityState): number {
		return sessionsByState.get(state)?.length || 0;
	}

	/**
	 * Toggle column collapse
	 */
	function toggleCollapse(state: ActivityState) {
		if (collapsedColumns.has(state)) {
			collapsedColumns.delete(state);
		} else {
			collapsedColumns.add(state);
		}
		collapsedColumns = new Set(collapsedColumns);
	}

	/**
	 * 2D keyboard navigation — j/k within a column, Left/Right across non-empty columns.
	 *
	 * We maintain `focusedColumn` (index into `columnOrder`, constrained to columns that
	 * currently have sessions) and `focusedIdx` (row within that column). Both are reset
	 * to `-1` when unfocused. The class toggle happens reactively via `class:jk-focused`
	 * in the markup — no manual DOM mutation.
	 */
	let focusedColumn = $state(-1);
	let focusedIdx = $state(-1);

	const nonEmptyColumns = $derived(
		columnOrder.filter((state) => (sessionsByState.get(state)?.length ?? 0) > 0)
	);

	function isTypingTarget(target: EventTarget | null): boolean {
		if (!(target instanceof HTMLElement)) return false;
		const tag = target.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
		return target.isContentEditable;
	}

	async function scrollFocusedIntoView() {
		await tick();
		const el = boardRoot?.querySelector('.kanban-card-wrap.jk-focused') as HTMLElement | null;
		el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
	}

	function clearFocus() {
		focusedColumn = -1;
		focusedIdx = -1;
	}

	function focusFirstAvailable() {
		const firstState = nonEmptyColumns[0];
		if (!firstState) return;
		focusedColumn = columnOrder.indexOf(firstState);
		focusedIdx = 0;
		scrollFocusedIntoView();
	}

	function moveWithinColumn(delta: 1 | -1) {
		const state = columnOrder[focusedColumn];
		if (!state) {
			focusFirstAvailable();
			return;
		}
		const items = sessionsByState.get(state) ?? [];
		if (items.length === 0) return;
		const nextRaw = focusedIdx < 0 ? (delta > 0 ? 0 : items.length - 1) : focusedIdx + delta;
		const wrapped =
			nextRaw >= items.length ? 0 : nextRaw < 0 ? items.length - 1 : nextRaw;
		focusedIdx = wrapped;
		scrollFocusedIntoView();
	}

	function moveToColumn(delta: 1 | -1) {
		if (nonEmptyColumns.length === 0) return;
		const currentState = columnOrder[focusedColumn];
		const currentNonEmptyPos = currentState ? nonEmptyColumns.indexOf(currentState) : -1;

		// No prior selection → focus first non-empty column
		if (currentNonEmptyPos < 0) {
			focusFirstAvailable();
			return;
		}

		const nextPos =
			(currentNonEmptyPos + delta + nonEmptyColumns.length) % nonEmptyColumns.length;
		const nextState = nonEmptyColumns[nextPos];
		const nextItems = sessionsByState.get(nextState) ?? [];
		focusedColumn = columnOrder.indexOf(nextState);
		// Clamp the row index to the new column's length so we don't point past its end.
		focusedIdx = Math.min(focusedIdx < 0 ? 0 : focusedIdx, nextItems.length - 1);
		scrollFocusedIntoView();
	}

	function openFocused() {
		const state = columnOrder[focusedColumn];
		if (!state) return;
		const items = sessionsByState.get(state) ?? [];
		const session = items[focusedIdx];
		const taskId = session?.task?.id;
		if (taskId) onTaskClick?.(taskId);
	}

	function handleWindowKeydown(e: KeyboardEvent) {
		if (e.ctrlKey || e.metaKey || e.altKey) return;
		if (isTypingTarget(e.target)) return;

		switch (e.key) {
			case 'j':
			case 'ArrowDown':
				e.preventDefault();
				if (focusedColumn < 0) focusFirstAvailable();
				else moveWithinColumn(1);
				return;
			case 'k':
			case 'ArrowUp':
				e.preventDefault();
				if (focusedColumn < 0) focusFirstAvailable();
				else moveWithinColumn(-1);
				return;
			case 'ArrowRight':
			case 'l':
				e.preventDefault();
				moveToColumn(1);
				return;
			case 'ArrowLeft':
			case 'h':
				e.preventDefault();
				moveToColumn(-1);
				return;
			case 'Enter':
			case ' ':
				if (focusedColumn < 0) return;
				e.preventDefault();
				openFocused();
				return;
			case 'Escape':
				if (focusedColumn < 0) return;
				e.preventDefault();
				clearFocus();
				return;
		}
	}

	let boardRoot: HTMLDivElement | undefined = $state();

	$effect(() => {
		window.addEventListener('keydown', handleWindowKeydown);
		return () => window.removeEventListener('keydown', handleWindowKeydown);
	});

	// If the focused session disappears (e.g., state change reshuffles it), re-home focus.
	$effect(() => {
		if (focusedColumn < 0) return;
		const state = columnOrder[focusedColumn];
		const items = sessionsByState.get(state) ?? [];
		if (items.length === 0) {
			// Column emptied — try the next non-empty column, else clear.
			const nonEmpty = nonEmptyColumns;
			if (nonEmpty.length === 0) {
				clearFocus();
			} else {
				focusedColumn = columnOrder.indexOf(nonEmpty[0]);
				focusedIdx = 0;
			}
		} else if (focusedIdx >= items.length) {
			focusedIdx = items.length - 1;
		}
	});

	// Session-specific handlers that create closures
	function createKillHandler(sessionName: string) {
		return async () => {
			if (onKillSession) await onKillSession(sessionName);
		};
	}

	function createSendInputHandler(sessionName: string) {
		return async (input: string, type: 'text' | 'key' | 'raw') => {
			if (onSendInput) {
				await onSendInput(sessionName, input, type);
			}
		};
	}
</script>

<div bind:this={boardRoot} class="flex h-full gap-2 overflow-x-auto p-2 {className}">
	{#each columnOrder as state, colIdx}
		{@const sessions = sessionsByState.get(state) || []}
		{@const count = sessions.length}
		{@const isCollapsed = collapsedColumns.has(state)}

		<AgentKanbanColumn
			{state}
			{count}
			collapsed={isCollapsed}
			onToggleCollapse={() => toggleCollapse(state)}
			focused={focusedColumn === colIdx}
		>
			{#each sessions as session, rowIdx (session.sessionName)}
				<div
					class="kanban-card-wrap"
					class:jk-focused={focusedColumn === colIdx && focusedIdx === rowIdx}
					data-nav-id={session.sessionName}
					data-nav-column={state}
					data-peek="false"
				>
					<SessionCard
						mode="compact"
						sessionName={session.sessionName}
						agentName={session.agentName}
						task={session.task}
						lastCompletedTask={session.lastCompletedTask}
						output={session.output}
						lineCount={session.lineCount}
						tokens={session.tokens}
						cost={session.cost}
						sparklineData={session.sparklineData}
						created={session.created}
						attached={session.attached}
						sseState={session._sseState}
						sseStateTimestamp={session._sseStateTimestamp}
						signalSuggestedTasks={session._signalSuggestedTasks}
						signalSuggestedTasksTimestamp={session._signalSuggestedTasksTimestamp}
						completionBundle={session._completionBundle}
						completionBundleTimestamp={session._completionBundleTimestamp}
						onKillSession={createKillHandler(session.sessionName)}
						onSendInput={createSendInputHandler(session.sessionName)}
						{onTaskClick}
					/>
				</div>
			{/each}
		</AgentKanbanColumn>
	{/each}
</div>

<style>
	.kanban-card-wrap {
		border-radius: 0.5rem;
		transition:
			box-shadow 0.12s ease,
			outline-color 0.12s ease;
	}

	.kanban-card-wrap.jk-focused {
		outline: 2px solid oklch(0.70 0.18 240);
		outline-offset: 2px;
		box-shadow: 0 0 0 4px oklch(0.70 0.18 240 / 0.18);
	}

	@media (prefers-reduced-motion: reduce) {
		.kanban-card-wrap {
			transition: none;
		}
	}
</style>
