<script lang="ts">
	/**
	 * Triage Mode — mobile-optimized ranked task view.
	 * Shows everything sorted by urgency:
	 *   1. Agents waiting for input (needs_input)
	 *   2. Agents ready for review
	 *   3. Actively working agents
	 *   4. Open tasks (no agent) — sorted by priority + due date
	 *
	 * One scroll, full context, swipe actions on each card.
	 */
	import { onMount, onDestroy } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { getIssueTypeVisual } from '$lib/config/statusColors';
	import { getProjectColor } from '$lib/utils/projectColors';
	import { formatShortDate } from '$lib/utils/dateFormatters';
	import { addToast } from '$lib/stores/toasts.svelte';
	import { SESSION_STATE_VISUALS } from '$lib/config/statusColors';

	interface Task {
		id: string;
		title: string;
		description?: string;
		status: string;
		priority: number;
		issue_type?: string;
		labels?: string[];
		created_at?: string;
		due_date?: string | null;
	}

	interface AgentSession {
		sessionName: string;
		agentName: string;
		state: string;
		taskId?: string;
		taskTitle?: string;
		taskPriority?: number;
		taskDesc?: string;
		taskType?: string;
	}

	type Section =
		| { kind: 'agent'; label: string; state: string; items: AgentSession[] }
		| { kind: 'tasks'; label: string; items: Task[] };

	let sections = $state<Section[]>([]);
	let loading = $state(true);
	let refreshInterval: ReturnType<typeof setInterval> | null = null;
	let spawning = $state<string | null>(null); // taskId being spawned
	let copiedTriageId = $state<string | null>(null); // taskId that was just copied

	// Swipe state per card
	let swipeOffsets = $state<Map<string, number>>(new Map());
	let activeSwipe = $state<{ id: string; startX: number; startY: number; active: boolean } | null>(null);

	const SWIPE_THRESHOLD = 80;
	const SWIPE_DEADZONE = 10;

	function copyTriageTaskId(e: MouseEvent, taskId: string) {
		e.stopPropagation();
		navigator.clipboard.writeText(taskId);
		copiedTriageId = taskId;
		if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(4);
		setTimeout(() => (copiedTriageId = null), 1500);
	}

	function haptic(ms = 8) {
		if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
	}

	onMount(() => {
		load();
		refreshInterval = setInterval(load, 5000);
	});
	onDestroy(() => { if (refreshInterval) clearInterval(refreshInterval); });

	async function load() {
		try {
			const [workRes, tasksRes] = await Promise.all([
				fetch('/api/work'),
				fetch('/api/tasks?status=open&limit=100')
			]);

			const workData = workRes.ok ? await workRes.json() : {};
			const tasksData = tasksRes.ok ? await tasksRes.json() : {};

			const workSessions: any[] = workData.sessions || [];
			const openTasks: Task[] = (tasksData.tasks || []).filter((t: Task) => t.status === 'open');

			// Build set of task IDs already being worked on
			const activatedTaskIds = new Set<string>();
			for (const ws of workSessions) {
				if (ws.task?.id) activatedTaskIds.add(ws.task.id);
			}

			// Group work sessions by state
			const needsInput: AgentSession[] = [];
			const readyReview: AgentSession[] = [];
			const working: AgentSession[] = [];

			for (const ws of workSessions) {
				if (!ws.agentName) continue;
				const sess: AgentSession = {
					sessionName: ws.sessionName,
					agentName: ws.agentName,
					state: ws.sessionState || 'idle',
					taskId: ws.task?.id,
					taskTitle: ws.task?.title,
					taskPriority: ws.task?.priority,
					taskDesc: ws.task?.description,
					taskType: ws.task?.issue_type,
				};
				if (ws.sessionState === 'needs_input') needsInput.push(sess);
				else if (ws.sessionState === 'review' || ws.sessionState === 'ready-for-review') readyReview.push(sess);
				else if (ws.sessionState === 'working' || ws.sessionState === 'starting') working.push(sess);
			}

			// Open tasks not being worked on
			const idleTasks = openTasks
				.filter(t => !activatedTaskIds.has(t.id))
				.sort((a, b) => {
					// Overdue/due today first
					const aOver = isOverdue(a.due_date);
					const bOver = isOverdue(b.due_date);
					if (aOver !== bOver) return aOver ? -1 : 1;
					// Then priority
					return (a.priority ?? 2) - (b.priority ?? 2);
				});

			const result: Section[] = [];
			if (needsInput.length > 0) result.push({ kind: 'agent', label: 'Needs Your Input', state: 'needs_input', items: needsInput });
			if (readyReview.length > 0) result.push({ kind: 'agent', label: 'Ready for Review', state: 'ready-for-review', items: readyReview });
			if (working.length > 0) result.push({ kind: 'agent', label: 'Working', state: 'working', items: working });
			if (idleTasks.length > 0) result.push({ kind: 'tasks', label: `Open Tasks (${idleTasks.length})`, items: idleTasks });

			sections = result;
		} catch (e) {
			// silent
		} finally {
			loading = false;
		}
	}

	function isOverdue(dueDate?: string | null): boolean {
		if (!dueDate) return false;
		return new Date(dueDate) < new Date();
	}

	function isDueToday(dueDate?: string | null): boolean {
		if (!dueDate) return false;
		const d = new Date(dueDate);
		const today = new Date();
		return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
	}

	async function spawnTask(taskId: string) {
		haptic(15);
		spawning = taskId;
		try {
			const res = await fetch('/api/work/spawn', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ taskId })
			});
			if (res.ok) {
				addToast({ message: 'Agent launched', type: 'success' });
				resetSwipe(taskId);
				load();
			} else {
				const d = await res.json().catch(() => ({}));
				addToast({ message: d.message || 'Failed to launch', type: 'error' });
			}
		} catch {
			addToast({ message: 'Failed to launch', type: 'error' });
		} finally {
			spawning = null;
		}
	}

	function resetSwipe(id: string) {
		const m = new Map(swipeOffsets);
		m.set(id, 0);
		swipeOffsets = m;
		setTimeout(() => {
			const m2 = new Map(swipeOffsets);
			m2.delete(id);
			swipeOffsets = m2;
		}, 300);
	}

	function swipeTouchStart(e: TouchEvent, id: string) {
		activeSwipe = { id, startX: e.touches[0].clientX, startY: e.touches[0].clientY, active: false };
	}

	function swipeTouchMove(e: TouchEvent) {
		if (!activeSwipe) return;
		const dx = e.touches[0].clientX - activeSwipe.startX;
		const dy = e.touches[0].clientY - activeSwipe.startY;
		if (!activeSwipe.active) {
			if (Math.abs(dy) > SWIPE_DEADZONE) { activeSwipe = null; return; }
			if (Math.abs(dx) > SWIPE_DEADZONE) activeSwipe.active = true; else return;
		}
		e.preventDefault();
		const clamped = dx > 0 ? Math.min(dx, SWIPE_THRESHOLD * 1.3) : Math.max(dx, -SWIPE_THRESHOLD * 1.3);
		const m = new Map(swipeOffsets);
		m.set(activeSwipe.id, clamped * 0.7);
		swipeOffsets = m;
	}

	function swipeTouchEnd(taskId: string) {
		if (!activeSwipe?.active) { activeSwipe = null; return; }
		const offset = swipeOffsets.get(activeSwipe.id) || 0;
		if (offset > SWIPE_THRESHOLD * 0.6) {
			haptic(8);
			spawnTask(taskId);
		}
		resetSwipe(activeSwipe.id);
		activeSwipe = null;
	}

	function getPriorityColor(p?: number) {
		const colors = ['oklch(0.65 0.20 25)', 'oklch(0.70 0.18 50)', 'oklch(0.65 0.15 200)', 'oklch(0.50 0.04 250)', 'oklch(0.40 0.02 250)'];
		return colors[p ?? 2] ?? colors[2];
	}
</script>

<svelte:head><title>Triage</title></svelte:head>

<div class="triage-page">
	<div class="triage-header">
		<a href="/tasks" class="back-btn" aria-label="Back to tasks">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
		</a>
		<h1>Triage</h1>
		<button class="reload-btn" aria-label="Reload" onclick={load}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
		</button>
	</div>

	{#if loading}
		<div class="triage-loading" in:fade>
			<div class="spinner"></div>
		</div>
	{:else if sections.length === 0}
		<div class="triage-empty" in:fade>
			<p>Nothing to triage 🎉</p>
		</div>
	{:else}
		<div class="sections">
			{#each sections as section}
				{@const vis = section.kind === 'agent' ? SESSION_STATE_VISUALS[section.state] ?? SESSION_STATE_VISUALS['idle'] : null}
				<div class="section" in:fade={{ duration: 150 }}>
					<div class="section-header" style={vis ? `--accent: ${vis.accent};` : ''}>
						<span class="section-label">{section.label}</span>
						{#if vis}<span class="section-dot"></span>{/if}
					</div>

					{#if section.kind === 'agent'}
						{#each section.items as sess (sess.sessionName)}
							{@const proj = sess.taskId?.split('-')[0] ?? ''}
							{@const projColor = getProjectColor(proj)}
							<a href="/tasks" class="agent-row" style="--proj: {projColor}; --accent: {vis?.accent ?? 'oklch(0.55 0.10 220)'};">
								<div class="agent-accent"></div>
								<div class="agent-body">
									<div class="agent-top">
										<span class="agent-name">{sess.agentName}</span>
										<span class="agent-badge" style="color: {vis?.accent};">{vis?.shortLabel ?? sess.state}</span>
									</div>
									{#if sess.taskTitle}
										<div class="agent-task">
											{#if sess.taskPriority !== undefined}
												<span class="priority-dot" style="background: {getPriorityColor(sess.taskPriority)};"></span>
											{/if}
											<span class="agent-task-title">{sess.taskTitle}</span>
										</div>
										{#if sess.taskId}<span class="task-id-small">{sess.taskId}</span>{/if}
									{:else}
										<span class="agent-notask">no task</span>
									{/if}
								</div>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="row-chevron" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
							</a>
						{/each}
					{:else}
						{#each section.items as task (task.id)}
							{@const typeVisual = getIssueTypeVisual(task.issue_type)}
							{@const projColor = getProjectColor(task.id.split('-')[0])}
							{@const offset = swipeOffsets.get(task.id) || 0}
							{@const overdue = isOverdue(task.due_date)}
							{@const dueToday = isDueToday(task.due_date)}

							<!-- Swipe wrapper -->
							<div class="task-swipe-wrapper">
								<!-- Left tray: launch -->
								<div class="task-tray task-tray-left" class:tray-active={offset > 20}>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
									<span>Launch</span>
								</div>
								<!-- Card -->
								<div
									class="task-row"
									class:task-overdue={overdue}
									class:task-today={dueToday && !overdue}
									class:task-spawning={spawning === task.id}
									style="transform: translateX({offset}px); --proj: {projColor};"
									ontouchstart={(e) => swipeTouchStart(e, task.id)}
									ontouchmove={swipeTouchMove}
									ontouchend={() => swipeTouchEnd(task.id)}
									ontouchcancel={() => { resetSwipe(task.id); activeSwipe = null; }}
								>
									<div class="task-proj-bar"></div>
									<div class="task-body">
										<div class="task-top">
											<span class="task-type-icon">{typeVisual?.emoji ?? '📋'}</span>
											<span class="task-title">{task.title}</span>
											<span class="task-priority" style="color: {getPriorityColor(task.priority)};">P{task.priority}</span>
										</div>
										<div class="task-meta">
											<button class="task-id-label" onclick={(e) => copyTriageTaskId(e, task.id)} title="Click to copy task ID">{copiedTriageId === task.id ? '✓' : task.id}</button>
											{#if task.due_date}
												<span class="task-due" class:due-overdue={overdue} class:due-today={dueToday}>
													{overdue ? '⚠ ' : ''}{formatShortDate(task.due_date)}
												</span>
											{/if}
											{#if task.labels?.length}
												{#each task.labels.slice(0, 2) as label}
													<span class="task-label">{label}</span>
												{/each}
											{/if}
										</div>
									</div>
									<!-- Launch button (tap) -->
									<button
										class="launch-btn"
										onclick={() => spawnTask(task.id)}
										disabled={spawning === task.id}
										title="Launch agent"
									>
										{#if spawning === task.id}
											<svg class="spin-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M4 12a8 8 0 0 1 16 0" /></svg>
										{:else}
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
										{/if}
									</button>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.triage-page {
		max-width: 600px;
		margin: 0 auto;
		padding: 0;
		min-height: 100vh;
	}

	.triage-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		position: sticky;
		top: 0;
		z-index: 10;
		background: oklch(0.13 0.01 250 / 0.95);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid oklch(0.22 0.02 250);
	}
	.triage-header h1 {
		font-size: 0.95rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: oklch(0.80 0.04 250);
		margin: 0;
		flex: 1;
	}
	.back-btn, .reload-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: 7px;
		border: none;
		background: oklch(0.20 0.02 250);
		color: oklch(0.55 0.04 250);
		cursor: pointer;
		text-decoration: none;
	}
	.back-btn:hover, .reload-btn:hover { background: oklch(0.24 0.03 250); }

	.triage-loading, .triage-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 4rem 1rem;
		color: oklch(0.45 0.03 250);
	}
	@keyframes spin { to { transform: rotate(360deg); } }
	.spinner {
		width: 28px; height: 28px;
		border: 2.5px solid oklch(0.25 0.03 250);
		border-top-color: oklch(0.60 0.15 220);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}
	.spin-icon { animation: spin 0.7s linear infinite; }

	.sections { display: flex; flex-direction: column; }

	/* Section */
	.section { margin-bottom: 0.25rem; }
	.section-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem 0.3rem;
	}
	.section-label {
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: oklch(0.45 0.03 250);
	}
	.section-dot {
		width: 6px; height: 6px;
		border-radius: 50%;
		background: var(--accent, oklch(0.55 0.10 220));
		animation: pulse 2s infinite;
	}
	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.4; }
	}

	/* Agent rows */
	.agent-row {
		display: flex;
		align-items: center;
		gap: 0;
		padding: 0.6rem 1rem 0.6rem 0;
		text-decoration: none;
		border-bottom: 1px solid oklch(0.20 0.02 250 / 0.5);
		position: relative;
		overflow: hidden;
		transition: background 0.1s;
	}
	.agent-row:hover { background: oklch(0.18 0.02 250 / 0.5); }
	.agent-accent {
		width: 3px;
		align-self: stretch;
		background: var(--accent);
		margin-right: 0.75rem;
		flex-shrink: 0;
		opacity: 0.8;
	}
	.agent-body { flex: 1; min-width: 0; }
	.agent-top {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.2rem;
	}
	.agent-name {
		font-size: 0.82rem;
		font-weight: 700;
		color: oklch(0.82 0.04 250);
	}
	.agent-badge {
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		margin-left: auto;
	}
	.agent-task {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}
	.priority-dot {
		width: 5px; height: 5px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.agent-task-title {
		font-size: 0.75rem;
		color: oklch(0.58 0.03 250);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.task-id-small, .task-id-label {
		font-size: 0.60rem;
		color: oklch(0.35 0.02 250);
		font-family: ui-monospace, monospace;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}
	.task-id-label:hover {
		color: oklch(0.55 0.10 200);
	}
	.agent-notask {
		font-size: 0.72rem;
		color: oklch(0.35 0.02 250);
		font-style: italic;
	}
	.row-chevron {
		color: oklch(0.35 0.03 250);
		flex-shrink: 0;
		margin-left: 0.5rem;
	}

	/* Task swipe wrapper */
	.task-swipe-wrapper {
		position: relative;
		overflow: hidden;
		border-bottom: 1px solid oklch(0.20 0.02 250 / 0.5);
	}

	/* Launch tray */
	.task-tray {
		position: absolute;
		top: 0; bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		padding: 0 1rem;
		background: oklch(0.50 0.20 145);
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
		opacity: 0;
		transition: opacity 0.1s;
	}
	.task-tray-left { left: 0; }
	.tray-active { opacity: 1; }

	/* Task row card */
	.task-row {
		display: flex;
		align-items: center;
		padding: 0.55rem 0.75rem 0.55rem 0;
		position: relative;
		background: oklch(0.14 0.01 250);
		will-change: transform;
		cursor: pointer;
		user-select: none;
	}
	.task-row:hover { background: oklch(0.17 0.02 250); }
	.task-overdue { background: oklch(0.65 0.20 25 / 0.07) !important; }
	.task-today { background: oklch(0.70 0.18 50 / 0.06) !important; }
	.task-spawning { opacity: 0.6; }

	.task-proj-bar {
		width: 3px;
		align-self: stretch;
		background: var(--proj, oklch(0.55 0.10 220));
		margin-right: 0.75rem;
		flex-shrink: 0;
		opacity: 0.6;
	}
	.task-body { flex: 1; min-width: 0; }
	.task-top {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		margin-bottom: 0.25rem;
	}
	.task-type-icon { font-size: 0.72rem; flex-shrink: 0; }
	.task-title {
		font-size: 0.82rem;
		color: oklch(0.78 0.03 250);
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1.3;
	}
	.task-priority {
		font-size: 0.62rem;
		font-weight: 700;
		flex-shrink: 0;
	}
	.task-meta {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		flex-wrap: wrap;
	}
	.task-due {
		font-size: 0.65rem;
		color: oklch(0.55 0.04 250);
	}
	.due-overdue { color: oklch(0.65 0.20 25) !important; font-weight: 600; }
	.due-today { color: oklch(0.70 0.18 50) !important; }
	.task-label {
		font-size: 0.60rem;
		padding: 0.1rem 0.35rem;
		border-radius: 3px;
		background: oklch(0.22 0.02 250);
		color: oklch(0.50 0.03 250);
	}

	/* Launch button */
	.launch-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px; height: 32px;
		border-radius: 8px;
		border: 1px solid oklch(0.28 0.06 145 / 0.6);
		background: oklch(0.50 0.20 145 / 0.15);
		color: oklch(0.65 0.20 145);
		cursor: pointer;
		flex-shrink: 0;
		margin-left: 0.5rem;
		transition: background 0.12s;
	}
	.launch-btn:hover:not(:disabled) { background: oklch(0.50 0.20 145 / 0.3); }
	.launch-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
