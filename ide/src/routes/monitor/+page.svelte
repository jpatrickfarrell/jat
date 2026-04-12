<script lang="ts">
	/**
	 * Agent Monitor — compact grid showing all active agents with live terminal tails.
	 * Hover an agent card to expand and see ~10 lines of output.
	 */
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { SESSION_STATE_VISUALS } from '$lib/config/statusColors';

	interface AgentCard {
		sessionName: string;
		agentName: string;
		state: string;
		taskId?: string;
		taskTitle?: string;
		taskPriority?: number;
		outputTail: string[];   // last 3 lines for compact view
		outputFull: string[];   // last 12 lines for hover/expanded view
		tokens?: number;
	}

	let agents = $state<AgentCard[]>([]);
	let loading = $state(true);
	let hoveredAgent = $state<string | null>(null);
	let refreshInterval: ReturnType<typeof setInterval> | null = null;

	const REFRESH_MS = 3000;

	function stripAnsi(str: string) {
		return str
			// CSI sequences: ESC [ ... letter
			.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '')
			// OSC sequences: ESC ] ... BEL or ST
			.replace(/\x1b\][^\x07]*(?:\x07|\x1b\\)/g, '')
			// Other two-char ESC sequences
			.replace(/\x1b[^[\]A-Za-z]/g, '')
			// Remaining lone ESC
			.replace(/\x1b/g, '')
			// Carriage return
			.replace(/\r/g, '');
	}

	function isStatusLine(line: string): boolean {
		// JAT statusline line 2: battery bar of ▪/▫ blocks
		if (/[▪▫]{3}/.test(line)) return true;
		// JAT statusline line 1: agent name + · + status badge (●/⚙/○/◉/⏻)
		if (/·\s*[●⚙○◉⏻]/.test(line)) return true;
		// JAT statusline line 1: agent name + priority badge [Px]
		if (/·\s*\[P\d\]/.test(line)) return true;
		// JAT statusline line 3: last prompt prefix
		if (/^[^a-zA-Z]*💬/.test(line)) return true;
		// Claude Code bottom bar: bypass permissions
		if (/bypass permissions on/.test(line)) return true;
		// Separator line: mostly ─ box-drawing chars
		if (/^[\s─]{10,}$/.test(line)) return true;
		// Shell prompt remnant
		if (/^\s*❯\s*$/.test(line)) return true;
		// Claude Code extended thinking completion lines (✻ Baked for..., ✻ Brewed for..., etc.)
		if (/^✻/.test(line)) return true;
		// Claude Code session rating prompt
		if (/How is Claude doing this session/.test(line)) return true;
		// Claude Code session rating options (1: Bad  2: Fine  3: Good  0: Dismiss)
		if (/\d:\s*(Bad|Fine|Good|Dismiss)/.test(line)) return true;
		return false;
	}

	function tailLines(output: string, n: number): string[] {
		const lines = stripAnsi(output || '')
			.split('\n')
			.map(l => l.trimEnd())
			.filter(l => l.length > 0 && !isStatusLine(l));
		return lines.slice(-n);
	}

	async function fetchAgents() {
		try {
			const workRes = await fetch('/api/work?capture_all=true');
			const workData = workRes.ok ? await workRes.json() : {};
			const workSessions: any[] = workData.sessions || [];

			const cards: AgentCard[] = [];
			for (const ws of workSessions) {
				if (!ws.agentName) continue;
				const output = ws.output || '';
				const task = ws.task || ws.lastCompletedTask;

				cards.push({
					sessionName: ws.sessionName,
					agentName: ws.agentName,
					state: ws.sessionState || 'idle',
					taskId: task?.id,
					taskTitle: task?.title,
					taskPriority: task?.priority,
					outputTail: tailLines(output, 3),
					outputFull: tailLines(output, 12),
					tokens: ws.tokens,
				});
			}

			// Sort: needs_input and review first, then working, then others
			const statePrio: Record<string, number> = {
				needs_input: 0, review: 1, 'ready-for-review': 1,
				working: 2, starting: 3, completing: 4, completed: 5, idle: 6
			};
			cards.sort((a, b) => (statePrio[a.state] ?? 7) - (statePrio[b.state] ?? 7));

			agents = cards;
		} catch {
			// silent fail
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		fetchAgents();
		refreshInterval = setInterval(fetchAgents, REFRESH_MS);
	});

	onDestroy(() => {
		if (refreshInterval) clearInterval(refreshInterval);
	});

	function getStateVisual(state: string) {
		return SESSION_STATE_VISUALS[state] ?? SESSION_STATE_VISUALS['idle'];
	}

	function getPriorityColor(p?: number) {
		const colors = ['oklch(0.65 0.20 25)', 'oklch(0.70 0.18 50)', 'oklch(0.65 0.15 200)', 'oklch(0.50 0.04 250)', 'oklch(0.40 0.02 250)'];
		return colors[p ?? 2] ?? colors[2];
	}
</script>

<svelte:head>
	<title>Monitor</title>
</svelte:head>

<div class="monitor-page">
	<div class="monitor-header">
		<h1>Agent Monitor</h1>
		<span class="agent-count">{agents.length} active</span>
		<button class="refresh-btn" aria-label="Refresh agents" onclick={fetchAgents}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
		</button>
	</div>

	{#if loading}
		<div class="monitor-loading" in:fade>
			<div class="monitor-spinner"></div>
		</div>
	{:else if agents.length === 0}
		<div class="monitor-empty" in:fade>
			<p>No active agents</p>
			<a href="/tasks" class="goto-tasks">Go to Tasks</a>
		</div>
	{:else}
		<div class="agents-grid">
			{#each agents as agent (agent.sessionName)}
				{@const vis = getStateVisual(agent.state)}
				{@const isHovered = hoveredAgent === agent.sessionName}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="agent-card"
					class:card-hovered={isHovered}
					class:card-needs-input={agent.state === 'needs_input'}
					class:card-review={agent.state === 'review' || agent.state === 'ready-for-review'}
					style="--accent: {vis.accent};"
					onmouseenter={() => hoveredAgent = agent.sessionName}
					onmouseleave={() => hoveredAgent = null}
					ontouchstart={() => hoveredAgent = hoveredAgent === agent.sessionName ? null : agent.sessionName}
				>
					<!-- Accent bar -->
					<div class="card-accent"></div>

					<!-- Agent name + state badge -->
					<div class="card-top">
						<span class="agent-name">{agent.agentName}</span>
						<span class="state-badge" style="color: {vis.accent}; border-color: {vis.accent}40;">
							{vis.shortLabel}
						</span>
					</div>

					<!-- Task title -->
					{#if agent.taskTitle}
						<div class="card-task">
							{#if agent.taskPriority !== undefined}
								<span class="task-priority" style="color: {getPriorityColor(agent.taskPriority)}">P{agent.taskPriority}</span>
							{/if}
							<span class="task-title" title={agent.taskTitle}>
								{isHovered && agent.taskTitle.length > 60 ? agent.taskTitle : agent.taskTitle.slice(0, 60) + (agent.taskTitle.length > 60 ? '…' : '')}
							</span>
						</div>
						{#if agent.taskId}
							<span class="task-id">{agent.taskId}</span>
						{/if}
					{:else}
						<div class="card-task card-task-none">no task assigned</div>
					{/if}

					<!-- Terminal output tail -->
					<div class="terminal-tail" class:tail-expanded={isHovered}>
						{#each (isHovered ? agent.outputFull : agent.outputTail) as line}
							<div class="tail-line">{line || ' '}</div>
						{/each}
						{#if (!isHovered ? agent.outputTail : agent.outputFull).length === 0}
							<div class="tail-line tail-empty">no output</div>
						{/if}
					</div>

					<!-- Token count -->
					{#if agent.tokens}
						<div class="card-tokens">{(agent.tokens / 1000).toFixed(0)}k tokens</div>
					{/if}

					<!-- Action buttons (shown on hover) -->
					{#if isHovered}
						<div class="card-actions" in:fade={{ duration: 100 }}>
							<a href="/work" class="action-link" title="Go to Work view">Work</a>
							<a href="/tasks" class="action-link" title="Go to Tasks">Tasks</a>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.monitor-page {
		padding: 1rem;
		margin: 0 auto;
	}

	.monitor-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1.25rem;
		padding: 0 0.25rem;
	}
	.monitor-header h1 {
		font-size: 1rem;
		font-weight: 700;
		color: oklch(0.80 0.04 250);
		margin: 0;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}
	.agent-count {
		font-size: 0.72rem;
		color: oklch(0.45 0.03 250);
		background: oklch(0.20 0.02 250);
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
	}
	.refresh-btn {
		margin-left: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 6px;
		border: none;
		background: oklch(0.20 0.02 250);
		color: oklch(0.55 0.03 250);
		cursor: pointer;
	}
	.refresh-btn:hover { background: oklch(0.24 0.03 250); }

	@keyframes spin { to { transform: rotate(360deg); } }
	.monitor-spinner {
		width: 24px; height: 24px;
		border: 2.5px solid oklch(0.25 0.03 250);
		border-top-color: oklch(0.60 0.15 220);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
		margin: 3rem auto;
	}
	.monitor-loading { display: flex; justify-content: center; }
	.monitor-empty {
		text-align: center;
		padding: 3rem;
		color: oklch(0.45 0.03 250);
	}
	.goto-tasks {
		display: inline-block;
		margin-top: 0.75rem;
		padding: 0.4rem 1rem;
		border-radius: 6px;
		background: oklch(0.20 0.03 250);
		color: oklch(0.65 0.10 220);
		text-decoration: none;
		font-size: 0.85rem;
	}

	.agents-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 0.75rem;
	}

	.agent-card {
		position: relative;
		background: oklch(0.16 0.02 250);
		border-radius: 10px;
		border: 1px solid oklch(0.26 0.03 250);
		padding: 0.75rem;
		overflow: hidden;
		transition: border-color 0.15s, box-shadow 0.15s;
		cursor: default;
	}
	.agent-card:hover, .card-hovered {
		border-color: oklch(var(--accent) / 0.4);
		box-shadow: 0 0 0 1px oklch(var(--accent) / 0.15);
	}
	.card-needs-input {
		border-color: oklch(0.55 0.18 290 / 0.5) !important;
		box-shadow: 0 0 12px oklch(0.55 0.18 290 / 0.15) !important;
	}
	.card-review {
		border-color: oklch(0.55 0.15 180 / 0.5) !important;
		box-shadow: 0 0 12px oklch(0.55 0.15 180 / 0.15) !important;
	}

	.card-accent {
		position: absolute;
		top: 0; left: 0; right: 0;
		height: 2px;
		background: var(--accent);
		opacity: 0.7;
		border-radius: 10px 10px 0 0;
	}

	.card-top {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}
	.agent-name {
		font-size: 0.85rem;
		font-weight: 700;
		color: oklch(0.82 0.04 250);
		flex: 1;
	}
	.state-badge {
		font-size: 0.62rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		border: 1px solid;
	}

	.card-task {
		display: flex;
		align-items: baseline;
		gap: 0.35rem;
		margin-bottom: 0.25rem;
	}
	.task-priority {
		font-size: 0.65rem;
		font-weight: 700;
		flex-shrink: 0;
	}
	.task-title {
		font-size: 0.78rem;
		color: oklch(0.65 0.03 250);
		line-height: 1.3;
		word-break: break-word;
	}
	.card-task-none { color: oklch(0.35 0.02 250); font-size: 0.72rem; font-style: italic; }
	.task-id {
		display: block;
		font-size: 0.62rem;
		color: oklch(0.35 0.02 250);
		font-family: ui-monospace, monospace;
		margin-bottom: 0.5rem;
	}

	.terminal-tail {
		background: oklch(0.11 0.01 250);
		border-radius: 6px;
		padding: 0.4rem 0.5rem;
		margin-top: 0.4rem;
		font-family: ui-monospace, monospace;
		font-size: 0.62rem;
		color: oklch(0.50 0.02 250);
		min-height: 3.2rem;
		max-height: 4rem;
		overflow: hidden;
		transition: max-height 0.2s ease;
	}
	.tail-expanded {
		max-height: 12rem;
	}
	.tail-line {
		line-height: 1.4;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.tail-empty { color: oklch(0.30 0.01 250); font-style: italic; }

	.card-tokens {
		margin-top: 0.4rem;
		font-size: 0.62rem;
		color: oklch(0.38 0.02 250);
	}

	.card-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.6rem;
		padding-top: 0.5rem;
		border-top: 1px solid oklch(0.22 0.02 250);
	}
	.action-link {
		font-size: 0.72rem;
		color: oklch(0.55 0.08 220);
		text-decoration: none;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		background: oklch(0.20 0.03 220 / 0.4);
	}
	.action-link:hover { background: oklch(0.24 0.05 220 / 0.6); }
</style>
