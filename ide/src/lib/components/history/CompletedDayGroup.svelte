<script lang="ts">
	import CompletedTaskRow from "./CompletedTaskRow.svelte";
	import PausedSessionRow from "./PausedSessionRow.svelte";
	import type {
		CompletedTask,
		DayGroup,
		PausedSession,
	} from "$lib/utils/completedTaskHelpers";
	import {
		getTaskEndTime,
		getPausedEndTime,
	} from "$lib/utils/completedTaskHelpers";

	let {
		day,
		onTaskClick,
		onResumeSession,
		onMemoryClick,
		onReopenTask,
		onDuplicateTask,
		onResumePausedSession,
		resumingTasks,
		memoryMap,
		taskIntegrations = {},
	}: {
		day: DayGroup;
		onTaskClick: (id: string) => void;
		onResumeSession?: (event: MouseEvent, task: CompletedTask) => void;
		onMemoryClick?: (event: MouseEvent, filename: string, task: CompletedTask) => void;
		onReopenTask?: (event: MouseEvent, task: CompletedTask) => void;
		onDuplicateTask?: (event: MouseEvent, task: CompletedTask) => void;
		onResumePausedSession?: (event: MouseEvent, session: PausedSession) => void;
		resumingTasks?: Set<string>;
		memoryMap?: Map<string, string>;
		taskIntegrations?: Record<string, { sourceId: string; sourceType: string; sourceName: string; sourceEnabled: boolean }>;
	} = $props();

	type Entry =
		| { kind: "task"; task: CompletedTask; endTime: number }
		| { kind: "paused"; session: PausedSession; endTime: number };

	const entries = $derived.by<Entry[]>(() => {
		const items: Entry[] = [];
		for (const task of day.tasks) {
			items.push({ kind: "task", task, endTime: getTaskEndTime(task) });
		}
		for (const session of day.pausedSessions || []) {
			items.push({ kind: "paused", session, endTime: getPausedEndTime(session) });
		}
		items.sort((a, b) => b.endTime - a.endTime);
		return items;
	});

	const totalCount = $derived(day.tasks.length + (day.pausedSessions?.length || 0));
	const pausedCount = $derived(day.pausedSessions?.length || 0);
</script>

<div class="day-group">
	<div class="day-header">
		<span class="day-date">{day.displayDate}</span>
		<span class="day-count">{totalCount} item{totalCount !== 1 ? "s" : ""}</span>
		{#if pausedCount > 0}
			<span class="day-paused-count">{pausedCount} paused</span>
		{/if}
	</div>
	<div class="day-tasks">
		{#each entries as entry (entry.kind === "task" ? entry.task.id : entry.session.id)}
			{#if entry.kind === "task"}
				<CompletedTaskRow
					task={entry.task}
					{onTaskClick}
					{onResumeSession}
					{onMemoryClick}
					{onReopenTask}
					{onDuplicateTask}
					resuming={resumingTasks?.has(entry.task.id) ?? false}
					memoryFilename={memoryMap?.get(entry.task.id)}
					integration={taskIntegrations[entry.task.id] || entry.task.integration || null}
				/>
			{:else}
				<PausedSessionRow
					session={entry.session}
					{onTaskClick}
					onResumeSession={onResumePausedSession}
					resuming={resumingTasks?.has(entry.session.taskId) ?? false}
				/>
			{/if}
		{/each}
	</div>
</div>

<style>
	.day-group {
		background: var(--color-base-100);
		border: 1px solid var(--color-base-300);
		border-radius: 10px;
		overflow: hidden;
	}

	.day-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: var(--color-base-200);
		border-bottom: 1px solid var(--color-base-300);
	}

	.day-date {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-base-content);
		font-family: ui-monospace, monospace;
	}

	.day-count {
		font-size: 0.75rem;
		color: oklch(from var(--color-base-content) l c h / 60%);
		padding: 0.125rem 0.5rem;
		background: var(--color-base-300);
		border-radius: 10px;
	}

	.day-paused-count {
		font-size: 0.7rem;
		font-weight: 600;
		color: oklch(0.80 0.12 75);
		padding: 0.125rem 0.5rem;
		background: oklch(0.55 0.14 75 / 0.15);
		border: 1px solid oklch(0.55 0.14 75 / 0.35);
		border-radius: 10px;
	}

	.day-tasks {
		display: flex;
		flex-direction: column;
	}
</style>
