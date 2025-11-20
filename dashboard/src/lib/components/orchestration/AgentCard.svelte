<script>
	let { agent, tasks = [], reservations = [], onTaskAssign = () => {} } = $props();

	let isDragOver = $state(false);
	let isAssigning = $state(false);

	// Compute agent status using $derived
	const agentStatus = $derived(() => {
		// Use agent.active from API (computed based on reservations + in-progress tasks)
		if (agent.active) {
			return agent.in_progress_tasks > 0 ? 'active' : 'idle';
		}
		// Check if agent has been active recently (based on last_activity timestamp)
		const lastActivity = agent.last_activity ? new Date(agent.last_activity) : null;
		if (lastActivity && (Date.now() - lastActivity.getTime()) < 3600000) {
			// Active within last hour
			return 'idle';
		}
		return 'offline';
	});

	// Get status badge class
	function getStatusBadge(status) {
		switch (status) {
			case 'active':
				return 'badge-info'; // Blue
			case 'idle':
				return 'badge-success'; // Green
			case 'blocked':
				return 'badge-warning'; // Yellow
			case 'offline':
				return 'badge-ghost'; // Gray
			default:
				return 'badge-ghost';
		}
	}

	// Get status icon
	function getStatusIcon(status) {
		switch (status) {
			case 'active':
				return '⚡'; // Working
			case 'idle':
				return '✓'; // Ready
			case 'blocked':
				return '⏸'; // Paused
			case 'offline':
				return '○'; // Offline
			default:
				return '?';
		}
	}

	// Compute current task (in-progress tasks assigned to this agent)
	const currentTask = $derived(() => {
		const inProgressTasks = tasks.filter(
			(t) => t.assignee === agent.name && t.status === 'in_progress'
		);
		return inProgressTasks.length > 0 ? inProgressTasks[0] : null;
	});

	// Compute queued tasks (open tasks assigned to this agent)
	const queuedTasks = $derived(() => {
		return tasks.filter((t) => t.assignee === agent.name && t.status === 'open');
	});

	// Compute file locks held by this agent
	const agentLocks = $derived(() => {
		return reservations.filter(
			(r) =>
				(r.agent_name === agent.name || r.agent === agent.name) &&
				(!r.released_ts) &&
				new Date(r.expires_ts) > new Date()
		);
	});

	// Compute task capacity (simple load indicator based on task count)
	const MAX_TASKS = 10; // Maximum recommended tasks per agent
	const taskCapacity = $derived(() => {
		const totalActiveTasks = (agent.in_progress_tasks || 0) + (agent.open_tasks || 0);
		const percentage = Math.min((totalActiveTasks / MAX_TASKS) * 100, 100);
		return {
			total: totalActiveTasks,
			max: MAX_TASKS,
			percentage,
			status: percentage < 50 ? 'good' : percentage < 80 ? 'moderate' : 'high'
		};
	});

	// Format last activity time
	function formatLastActivity(timestamp) {
		if (!timestamp) return 'Never';
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now - date;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		return `${diffDays}d ago`;
	}

	// Calculate progress for current task (simple estimation based on time)
	function getTaskProgress(task) {
		if (!task) return 0;

		// Simple heuristic: if task has been in progress, show 30-70% random progress
		// In a real system, this would come from task metadata
		const created = new Date(task.created_at || task.updated_at);
		const now = new Date();
		const elapsed = now - created;
		const oneHour = 3600000;

		// Show progress based on time elapsed (0-70% over first 2 hours)
		const progress = Math.min((elapsed / (oneHour * 2)) * 70, 70);
		return Math.floor(progress);
	}

	// Handle drop event
	async function handleDrop(event) {
		event.preventDefault();
		isDragOver = false;

		const taskId = event.dataTransfer.getData('text/plain');
		if (!taskId) return;

		// Show loading state
		isAssigning = true;

		try {
			// Call parent callback to assign task
			await onTaskAssign(taskId, agent.name);
		} catch (error) {
			console.error('Failed to assign task:', error);
			// TODO: Show error toast/notification
		} finally {
			isAssigning = false;
		}
	}

	function handleDragOver(event) {
		event.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave() {
		isDragOver = false;
	}
</script>

<div
	class="card bg-base-100 border-2 transition-all {isDragOver ? 'border-primary border-dashed bg-primary/10 scale-105' : 'border-base-300 hover:border-primary'} {isAssigning ? 'opacity-50 pointer-events-none' : ''}"
	role="button"
	tabindex="0"
	ondrop={handleDrop}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
>
	<div class="card-body p-4">
		<!-- Agent Header -->
		<div class="flex items-start justify-between gap-2 mb-3">
			<div class="flex-1 min-w-0">
				<h3 class="font-semibold text-base text-base-content truncate" title={agent.name}>
					{agent.name || 'Unknown Agent'}
				</h3>
				<p class="text-xs text-base-content/50 font-mono truncate">
					{agent.program || 'claude-code'} • {agent.model || 'unknown'}
				</p>
				<p class="text-xs text-base-content/40 mt-0.5">
					Last active: {formatLastActivity(agent.last_activity)}
				</p>
			</div>
			<span class="badge badge-sm {getStatusBadge(agentStatus())}">
				{getStatusIcon(agentStatus())}
				{agentStatus().charAt(0).toUpperCase() + agentStatus().slice(1)}
			</span>
		</div>

		<!-- Current Task -->
		<div class="mb-3">
			<div class="text-xs font-medium text-base-content/70 mb-1">Current Task:</div>
			{#if currentTask()}
				<div class="bg-base-200 rounded p-2">
					<div class="flex items-center gap-2 mb-1">
						<span class="text-xs font-mono text-base-content/50">{currentTask().id}</span>
						<div class="flex-1 w-full bg-base-300 rounded-full h-1.5">
							<div class="bg-primary h-1.5 rounded-full transition-all" style="width: {getTaskProgress(currentTask())}%"></div>
						</div>
						<span class="text-xs text-base-content/50 font-medium">{getTaskProgress(currentTask())}%</span>
					</div>
					<p class="text-xs text-base-content truncate" title={currentTask().title}>
						{currentTask().title}
					</p>
				</div>
			{:else}
				<div class="bg-base-200 rounded p-2 text-center">
					<p class="text-xs text-base-content/50 italic">No active task</p>
				</div>
			{/if}
		</div>

		<!-- Queued Tasks -->
		<div class="mb-3">
			<div class="text-xs font-medium text-base-content/70 mb-1">
				Queue ({queuedTasks().length}):
			</div>
			{#if queuedTasks().length > 0}
				<div class="space-y-1">
					{#each queuedTasks().slice(0, 3) as task}
						<div class="bg-base-200 rounded px-2 py-1">
							<p class="text-xs text-base-content truncate" title={task.title}>
								• {task.title}
							</p>
						</div>
					{/each}
					{#if queuedTasks().length > 3}
						<div class="text-xs text-base-content/50 text-center">
							+{queuedTasks().length - 3} more
						</div>
					{/if}
				</div>
			{:else}
				<div class="bg-base-200 rounded p-2 text-center">
					<p class="text-xs text-base-content/50 italic">No queued tasks</p>
				</div>
			{/if}
		</div>

		<!-- File Locks -->
		<div>
			<div class="text-xs font-medium text-base-content/70 mb-1">
				File Locks ({agentLocks().length}):
			</div>
			{#if agentLocks().length > 0}
				<div class="space-y-1">
					{#each agentLocks().slice(0, 2) as lock}
						<div class="bg-warning/10 rounded px-2 py-1">
							<p class="text-xs text-warning truncate" title={lock.file_pattern || lock.pattern}>
								🔒 {lock.file_pattern || lock.pattern}
							</p>
						</div>
					{/each}
					{#if agentLocks().length > 2}
						<div class="text-xs text-base-content/50 text-center">
							+{agentLocks().length - 2} more
						</div>
					{/if}
				</div>
			{:else}
				<div class="bg-base-200 rounded p-2 text-center">
					<p class="text-xs text-base-content/50 italic">No file locks</p>
				</div>
			{/if}
		</div>

		<!-- Capacity Indicator -->
		<div class="mb-3">
			<div class="text-xs font-medium text-base-content/70 mb-1">
				Capacity: {taskCapacity().total}/{taskCapacity().max} tasks
			</div>
			<div class="flex items-center gap-2">
				<div class="flex-1 bg-base-300 rounded-full h-2">
					<div
						class="h-2 rounded-full transition-all {taskCapacity().status === 'good' ? 'bg-success' : taskCapacity().status === 'moderate' ? 'bg-warning' : 'bg-error'}"
						style="width: {taskCapacity().percentage}%"
					></div>
				</div>
				<span class="text-xs font-medium {taskCapacity().status === 'good' ? 'text-success' : taskCapacity().status === 'moderate' ? 'text-warning' : 'text-error'}">
					{Math.round(taskCapacity().percentage)}%
				</span>
			</div>
		</div>

		<!-- Drop Zone Indicator -->
		<div class="mt-3 pt-3 border-t border-base-300 text-center">
			{#if isAssigning}
				<div class="flex items-center justify-center gap-2">
					<span class="loading loading-spinner loading-xs"></span>
					<p class="text-xs text-base-content/70">Assigning task...</p>
				</div>
			{:else if isDragOver}
				<p class="text-xs text-primary font-medium">Drop to assign to {agent.name}</p>
			{:else}
				<p class="text-xs text-base-content/50">Drop task here to assign</p>
			{/if}
		</div>
	</div>
</div>
