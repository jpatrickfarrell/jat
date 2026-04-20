<script lang="ts">
	/**
	 * TaskFastActionBar — quick-action bar for /tasks-fast detail panel.
	 *
	 * Keys (wired by the parent page when focusZone='detail'):
	 *   a      → Assign picker   (SearchDropdown, assignee list)
	 *   s      → Status picker   (submitted/open/in_progress/waiting/closed)
	 *   p      → Priority picker (P0-P4)
	 *   Space  → Spawn agent     (POST /api/work/spawn)
	 *   o      → Open full       (TaskDetailDrawer via drawerStore)
	 *   d      → Dismiss task    (two-press confirmation, closes the task)
	 *
	 * Exposed methods (called by TaskFastDetail via bind:this):
	 *   openAssign() / openStatus() / openPriority() → open the relevant picker
	 *   spawn() / openFull() / dismiss()             → direct actions
	 */

	import SearchDropdown, {
		type SearchDropdownGroup,
	} from "$lib/components/SearchDropdown.svelte";
	import { openTaskDetailDrawer } from "$lib/stores/drawerStore";

	interface RequesterActor {
		email?: string;
		name?: string;
		agent?: string;
		role?: string;
		source?: string;
	}

	interface Task {
		id: string;
		title: string;
		status: string;
		priority: number;
		issue_type?: string;
		assignee?: string | null;
		requester?: RequesterActor | null;
	}

	interface Props {
		task: Task;
		currentUser?: string;
		allAssignees?: string[];
		onTaskUpdated?: (patch: Partial<Task> & { id: string }) => void;
		onDismissed?: (taskId: string) => void;
	}

	let {
		task,
		currentUser = "",
		allAssignees = [],
		onTaskUpdated,
		onDismissed,
	}: Props = $props();

	// ---- Picker wrappers (for programmatic open via keyboard) ----

	let assignWrapEl = $state<HTMLDivElement | null>(null);
	let statusWrapEl = $state<HTMLDivElement | null>(null);
	let priorityWrapEl = $state<HTMLDivElement | null>(null);
	let typeWrapEl = $state<HTMLDivElement | null>(null);

	function clickTrigger(wrap: HTMLElement | null) {
		if (!wrap) return;
		const btn = wrap.querySelector<HTMLButtonElement>(".sd-trigger");
		btn?.click();
	}

	// ---- Option lists ----

	const STATUS_OPTIONS = [
		{ value: "submitted", label: "submitted" },
		{ value: "open", label: "open" },
		{ value: "in_progress", label: "in progress" },
		{ value: "waiting", label: "waiting" },
		{ value: "closed", label: "closed" },
	];

	const PRIORITY_OPTIONS = [
		{ value: "0", label: "P0 — critical" },
		{ value: "1", label: "P1 — high" },
		{ value: "2", label: "P2 — medium" },
		{ value: "3", label: "P3 — low" },
		{ value: "4", label: "P4 — lowest" },
	];

	const TYPE_OPTIONS = [
		{ value: "bug", label: "bug" },
		{ value: "feature", label: "feature" },
		{ value: "task", label: "task" },
		{ value: "epic", label: "epic" },
		{ value: "chore", label: "chore" },
		{ value: "chat", label: "chat" },
	];

	// ---- Assignee groups (@me, known assignees) ----

	const assigneeGroups = $derived.by<SearchDropdownGroup[]>(() => {
		const groups: SearchDropdownGroup[] = [];
		if (currentUser) {
			groups.push({
				label: "Me",
				options: [
					{
						value: currentUser,
						label: `${currentUser} (@me)`,
					},
				],
			});
		}
		// Unique, non-empty, non-me names from the task list + the current task's
		// requester so the common "reassign to requester" option is always there.
		const seen = new Set<string>();
		if (currentUser) seen.add(currentUser.toLowerCase());
		const rest: { value: string; label: string }[] = [];
		const candidates = [...allAssignees];
		const requesterHandle =
			task.requester?.email || task.requester?.agent || null;
		if (requesterHandle) candidates.push(requesterHandle);
		for (const raw of candidates) {
			if (!raw) continue;
			const key = raw.toLowerCase();
			if (seen.has(key)) continue;
			seen.add(key);
			rest.push({ value: raw, label: raw });
		}
		rest.sort((a, b) => a.label.localeCompare(b.label));
		if (rest.length > 0) {
			groups.push({ label: "People", options: rest });
		}
		// "Unassigned" as a last option so the picker can clear the field.
		groups.push({
			label: "Clear",
			options: [{ value: "", label: "— unassigned —" }],
		});
		return groups;
	});

	// ---- PUT helper ----

	let saving = $state<"assignee" | "status" | "priority" | "issue_type" | null>(null);
	let errorMessage = $state<string | null>(null);

	async function patchTask(
		field: "assignee" | "status" | "priority" | "issue_type",
		value: string | number | null,
	) {
		saving = field;
		errorMessage = null;
		try {
			const body: Record<string, any> = {};
			body[field] = value;
			const res = await fetch(
				`/api/tasks/${encodeURIComponent(task.id)}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(body),
				},
			);
			if (!res.ok) {
				const payload = await res.json().catch(() => ({}));
				throw new Error(payload.error || `HTTP ${res.status}`);
			}
			onTaskUpdated?.({ id: task.id, [field]: value } as Partial<Task> & {
				id: string;
			});
		} catch (err: any) {
			errorMessage = err?.message || `Failed to update ${field}`;
		} finally {
			saving = null;
		}
	}

	function handleAssigneeChange(value: string) {
		// "" → null (unassigned). SearchDropdown passes the raw value string.
		const next = value === "" ? null : value;
		if (next === (task.assignee ?? null)) return;
		patchTask("assignee", next);
	}

	function handleStatusChange(value: string) {
		if (value === task.status) return;
		patchTask("status", value);
	}

	function handlePriorityChange(value: string) {
		const n = Number(value);
		if (!Number.isInteger(n) || n === task.priority) return;
		patchTask("priority", n);
	}

	function handleTypeChange(value: string) {
		if (value === (task.issue_type ?? "task")) return;
		patchTask("issue_type", value);
	}

	// ---- Spawn ----

	let spawning = $state(false);

	async function spawnAgent() {
		if (spawning) return;
		spawning = true;
		errorMessage = null;
		try {
			const res = await fetch("/api/work/spawn", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ taskId: task.id }),
			});
			if (!res.ok) {
				const payload = await res.json().catch(() => ({}));
				throw new Error(payload.error || `HTTP ${res.status}`);
			}
			// Spawn sets the task to in_progress on the server. Reflect it locally
			// so the row updates without a full refetch.
			onTaskUpdated?.({ id: task.id, status: "in_progress" });
		} catch (err: any) {
			errorMessage = err?.message || "Failed to spawn agent";
		} finally {
			spawning = false;
		}
	}

	// ---- Dismiss (two-press confirm) ----

	let confirmDismiss = $state(false);
	let dismissTimer: ReturnType<typeof setTimeout> | null = null;

	function startConfirm() {
		confirmDismiss = true;
		if (dismissTimer) clearTimeout(dismissTimer);
		dismissTimer = setTimeout(() => {
			confirmDismiss = false;
			dismissTimer = null;
		}, 3000);
	}

	async function dismissNow() {
		if (dismissTimer) {
			clearTimeout(dismissTimer);
			dismissTimer = null;
		}
		confirmDismiss = false;
		errorMessage = null;
		try {
			const res = await fetch(
				`/api/tasks/${encodeURIComponent(task.id)}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ status: "closed" }),
				},
			);
			if (!res.ok) {
				const payload = await res.json().catch(() => ({}));
				throw new Error(payload.error || `HTTP ${res.status}`);
			}
			onDismissed?.(task.id);
		} catch (err: any) {
			errorMessage = err?.message || "Failed to dismiss task";
		}
	}

	// ---- Exported methods (called by page via detailRef → actionBarRef) ----

	export function openAssign() {
		clickTrigger(assignWrapEl);
	}
	export function openStatus() {
		clickTrigger(statusWrapEl);
	}
	export function openPriority() {
		clickTrigger(priorityWrapEl);
	}
	export function openType() {
		clickTrigger(typeWrapEl);
	}
	export function spawn() {
		spawnAgent();
	}
	export function openFull() {
		openTaskDetailDrawer(task.id);
	}
	export function dismiss() {
		if (confirmDismiss) {
			dismissNow();
		} else {
			startConfirm();
		}
	}

	// ---- Current value displays ----

	const assigneeDisplay = $derived(task.assignee || "— unassigned —");
	const priorityDisplay = $derived(`P${task.priority ?? "?"}`);
	const typeDisplay = $derived(task.issue_type || "task");
</script>

<div class="action-bar" aria-label="Quick actions">
	<div class="slot slot-picker" bind:this={assignWrapEl}>
		<span class="kbd-label"><kbd>a</kbd> Assign</span>
		<SearchDropdown
			value={task.assignee ?? ""}
			groups={assigneeGroups}
			placeholder="Assign…"
			displayValue={assigneeDisplay}
			size="sm"
			dropup={true}
			onChange={handleAssigneeChange}
		/>
		{#if saving === "assignee"}
			<span class="saving">…</span>
		{/if}
	</div>

	<div class="slot slot-picker" bind:this={statusWrapEl}>
		<span class="kbd-label"><kbd>s</kbd> Status</span>
		<SearchDropdown
			value={task.status}
			groups={[{ label: "Status", options: STATUS_OPTIONS }]}
			placeholder="Status"
			size="sm"
			dropup={true}
			onChange={handleStatusChange}
		/>
		{#if saving === "status"}
			<span class="saving">…</span>
		{/if}
	</div>

	<div class="slot slot-picker" bind:this={priorityWrapEl}>
		<span class="kbd-label"><kbd>p</kbd> Priority</span>
		<SearchDropdown
			value={String(task.priority ?? "")}
			groups={[{ label: "Priority", options: PRIORITY_OPTIONS }]}
			placeholder={priorityDisplay}
			displayValue={priorityDisplay}
			size="sm"
			dropup={true}
			onChange={handlePriorityChange}
		/>
		{#if saving === "priority"}
			<span class="saving">…</span>
		{/if}
	</div>

	<div class="slot slot-picker" bind:this={typeWrapEl}>
		<span class="kbd-label"><kbd>t</kbd> Type</span>
		<SearchDropdown
			value={task.issue_type ?? "task"}
			groups={[{ label: "Type", options: TYPE_OPTIONS }]}
			placeholder={typeDisplay}
			displayValue={typeDisplay}
			size="sm"
			dropup={true}
			onChange={handleTypeChange}
		/>
		{#if saving === "issue_type"}
			<span class="saving">…</span>
		{/if}
	</div>

	<button
		type="button"
		class="action-btn"
		onclick={spawnAgent}
		disabled={spawning}
		title="Spawn agent (Space)"
	>
		<kbd>Space</kbd>
		{spawning ? "Spawning…" : "Spawn"}
	</button>

	<button
		type="button"
		class="action-btn"
		onclick={() => openTaskDetailDrawer(task.id)}
		title="Open full task drawer (o)"
	>
		<kbd>o</kbd> Open
	</button>

	<button
		type="button"
		class="action-btn action-btn-danger"
		class:confirm={confirmDismiss}
		onclick={dismiss}
		title={confirmDismiss
			? "Press again to confirm"
			: "Close/dismiss task (d)"}
	>
		<kbd>d</kbd>
		{confirmDismiss ? "Confirm dismiss?" : "Dismiss"}
	</button>

	{#if errorMessage}
		<span class="action-error" role="alert">{errorMessage}</span>
	{/if}
</div>

<style>
	.action-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.625rem;
		padding: 0.625rem 1.25rem 0.75rem;
		border-top: 1px solid oklch(var(--b3, 0.22 0.02 250));
		background: oklch(0.13 0.01 250 / 0.6);
	}

	.slot {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		min-width: 0;
	}

	.slot-picker :global(.search-dropdown) {
		min-width: 9rem;
	}

	.kbd-label {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.7rem;
		opacity: 0.75;
		letter-spacing: 0.02em;
	}

	kbd {
		display: inline-block;
		min-width: 1.1rem;
		padding: 0.05rem 0.3rem;
		font-size: 0.625rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		text-align: center;
		background: oklch(0.19 0.02 250);
		border: 1px solid oklch(var(--b3, 0.22 0.02 250));
		border-radius: 0.1875rem;
		color: oklch(0.85 0.02 250);
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.3rem 0.6rem;
		font-size: 0.75rem;
		border-radius: 0.375rem;
		border: 1px solid oklch(0.28 0.02 250);
		background: oklch(0.17 0.01 250);
		color: inherit;
		cursor: pointer;
		transition:
			background 0.1s ease,
			border-color 0.1s ease,
			color 0.1s ease;
	}

	.action-btn:hover:not(:disabled) {
		background: oklch(0.22 0.02 250);
		border-color: oklch(0.35 0.03 250);
	}

	.action-btn:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}

	.action-btn-danger {
		border-color: oklch(0.45 0.08 25 / 0.7);
		color: oklch(0.82 0.1 25);
	}

	.action-btn-danger:hover:not(:disabled) {
		background: oklch(0.70 0.18 25 / 0.12);
		border-color: oklch(0.70 0.18 25 / 0.8);
	}

	.action-btn-danger.confirm {
		background: oklch(0.70 0.18 25 / 0.18);
		border-color: oklch(0.70 0.18 25 / 0.9);
		color: oklch(0.90 0.12 25);
	}

	.saving {
		font-size: 0.7rem;
		opacity: 0.75;
		margin-left: -0.1rem;
	}

	.action-error {
		flex-basis: 100%;
		font-size: 0.7rem;
		color: oklch(0.75 0.18 25);
	}
</style>
