<script lang="ts">
	/**
	 * TaskFastDetail — the right-side detail panel for /tasks-fast.
	 *
	 * Sections (top to bottom):
	 *   1. Header       → title + id/type/priority/status/project badges
	 *   2. Meta         → status, created, assignee, requester
	 *   3. Description  → markdown rendered, collapsible if rendered height > 400px
	 *   4. Comments     → CommentsThread (built-in input hidden; parent owns the compose)
	 *   5. Compose      → TaskFastCompose (Enter=send, Ctrl+Enter=send+route)
	 *
	 * The scrollable region is centered on the comments thread so that new
	 * replies auto-scroll into view and the description/compose stay docked.
	 */

	import { marked } from "marked";
	import CommentsThread from "$lib/components/comments/CommentsThread.svelte";
	import TaskFastCompose from "./TaskFastCompose.svelte";
	import TaskFastActionBar from "./TaskFastActionBar.svelte";
	import {
		getPriorityBadge,
		getTaskStatusBadge,
		getTypeBadge,
	} from "$lib/utils/badgeHelpers";
	import { formatRelativeTime } from "$lib/utils/dateFormatters";
	import type { TaskActor } from "$lib/types/api.types";
	import {
		resolveRoutingTarget,
		getActorDisplayName,
		getActorHandle,
	} from "$lib/utils/taskRouting";

	interface Task {
		id: string;
		title: string;
		description?: string;
		status: string;
		priority: number;
		issue_type?: string;
		assignee?: string | null;
		requester?: TaskActor | null;
		requester_id?: string | null;
		approver?: TaskActor | null;
		approver_id?: string | null;
		creator?: TaskActor | null;
		creator_id?: string | null;
		labels?: string[];
		project?: string;
		created_at?: string;
		updated_at?: string;
	}

	interface Props {
		task: Task;
		currentUser?: string;
		allAssignees?: string[];
		onEscapeCompose?: () => void;
		onComposeFocus?: () => void;
		onSendAndRoute?: (taskId: string, text: string) => void;
		onTaskUpdated?: (patch: Partial<Task> & { id: string }) => void;
		onDismissed?: (taskId: string) => void;
	}

	let {
		task,
		currentUser = "",
		allAssignees = [],
		onEscapeCompose,
		onComposeFocus,
		onSendAndRoute,
		onTaskUpdated,
		onDismissed,
	}: Props = $props();

	let composeRef = $state<{ focus: () => void } | null>(null);
	let actionBarRef = $state<{
		openAssign: () => void;
		openStatus: () => void;
		openPriority: () => void;
		spawn: () => void;
		openFull: () => void;
		dismiss: () => void;
	} | null>(null);
	let commentsScroll = $state<HTMLDivElement | null>(null);
	let descExpanded = $state(false);
	let descEl = $state<HTMLDivElement | null>(null);
	let descOverflows = $state(false);

	// Reload key — bumped after sending a comment so CommentsThread re-fetches.
	let reloadKey = $state(0);

	marked.setOptions({ gfm: true, breaks: true });

	const routingTarget = $derived(resolveRoutingTarget(task as any));
	const routingName = $derived(getActorDisplayName(routingTarget?.actor));
	const showSplitRoles = $derived(
		!!(
			task.approver &&
			task.requester &&
			task.approver !== task.requester &&
			getActorHandle(task.approver) !== getActorHandle(task.requester)
		),
	);

	const renderedDescription = $derived.by(() => {
		if (!task.description) return "";
		try {
			return marked.parse(task.description) as string;
		} catch {
			return task.description;
		}
	});

	// When task changes, collapse the description and scroll comments to bottom
	// once CommentsThread reports its count. Reset descOverflows so the effect
	// below re-measures after re-render.
	$effect(() => {
		// track id change
		void task.id;
		descExpanded = false;
		descOverflows = false;
	});

	// Measure description overflow after render.
	$effect(() => {
		void renderedDescription;
		queueMicrotask(() => {
			if (!descEl) return;
			descOverflows = descEl.scrollHeight > 400;
		});
	});

	function scrollCommentsToBottom() {
		if (!commentsScroll) return;
		commentsScroll.scrollTop = commentsScroll.scrollHeight;
	}

	function handleCommentCount(_count: number) {
		// CommentsThread fires this after each load. Scrolling on every count
		// update keeps the newest reply pinned to the bottom as the user types
		// replies on subsequent tasks.
		queueMicrotask(scrollCommentsToBottom);
	}

	export function focusCompose() {
		composeRef?.focus();
	}

	export function openAssign() {
		actionBarRef?.openAssign();
	}
	export function openStatus() {
		actionBarRef?.openStatus();
	}
	export function openPriority() {
		actionBarRef?.openPriority();
	}
	export function spawnAgent() {
		actionBarRef?.spawn();
	}
	export function openFullDrawer() {
		actionBarRef?.openFull();
	}
	export function dismissTask() {
		actionBarRef?.dismiss();
	}

	function handleSent(_comment: any) {
		// Trigger a CommentsThread reload so the new comment appears.
		reloadKey += 1;
	}

	function handleSendAndRoute(text: string) {
		onSendAndRoute?.(task.id, text);
	}
</script>

<div class="detail-root">
	<header class="detail-header">
		<div class="detail-title-row">
			<h2 class="detail-title">{task.title}</h2>
		</div>
		<div class="detail-badges">
			<span class="badge badge-sm badge-outline">{task.id}</span>
			<span class="badge badge-sm {getTypeBadge(task.issue_type)}">
				{task.issue_type ?? "task"}
			</span>
			<span class="badge badge-sm {getPriorityBadge(task.priority)}">
				P{task.priority ?? "?"}
			</span>
			<span class="badge badge-sm {getTaskStatusBadge(task.status)}">
				{task.status}
			</span>
			{#if task.project}
				<span class="badge badge-sm badge-ghost">{task.project}</span>
			{/if}
		</div>
	</header>

	<div class="detail-meta">
		<span>
			<strong>Assignee:</strong>
			{task.assignee || "—"}
		</span>
		<span>
			<strong>Reply to:</strong>
			{#if routingTarget}
				{routingName}
				<span class="badge badge-xs badge-outline role-badge">
					{routingTarget.role}
				</span>
			{:else}
				<span class="reply-unknown">Unknown</span>
			{/if}
		</span>
		{#if showSplitRoles && task.requester && task.approver}
			<span class="detail-meta-split">
				<strong>Requester:</strong>
				{getActorDisplayName(task.requester)}
				<span class="detail-meta-divider">·</span>
				<strong>Approver:</strong>
				{getActorDisplayName(task.approver)}
			</span>
		{/if}
		{#if task.created_at}
			<span>
				<strong>Created:</strong>
				{formatRelativeTime(task.created_at)}
			</span>
		{/if}
		{#if task.updated_at && task.updated_at !== task.created_at}
			<span>
				<strong>Updated:</strong>
				{formatRelativeTime(task.updated_at)}
			</span>
		{/if}
	</div>

	<div class="detail-body" bind:this={commentsScroll}>
		{#if task.description}
			<section
				class="detail-description"
				class:collapsible={descOverflows}
				class:expanded={descExpanded}
			>
				<div
					class="description-content prose prose-sm max-w-none"
					bind:this={descEl}
				>
					{@html renderedDescription}
				</div>
				{#if descOverflows}
					<button
						type="button"
						class="description-toggle"
						onclick={() => (descExpanded = !descExpanded)}
					>
						{descExpanded ? "Show less" : "Show more"}
					</button>
				{/if}
			</section>
		{:else}
			<section class="detail-description detail-description-empty">
				No description.
			</section>
		{/if}

		<section class="detail-comments">
			<h3 class="section-label">Comments</h3>
			{#key `${task.id}:${reloadKey}`}
				<CommentsThread
					taskId={task.id}
					hideInput={true}
					onCountChange={handleCommentCount}
				/>
			{/key}
		</section>
	</div>

	<TaskFastCompose
		bind:this={composeRef}
		taskId={task.id}
		{task}
		onSent={handleSent}
		onSendAndRoute={handleSendAndRoute}
		onEscape={() => onEscapeCompose?.()}
		onFocus={() => onComposeFocus?.()}
	/>

	<TaskFastActionBar
		bind:this={actionBarRef}
		{task}
		{currentUser}
		{allAssignees}
		{onTaskUpdated}
		{onDismissed}
	/>
</div>

<style>
	.detail-root {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}

	.detail-header {
		padding: 1rem 1.25rem 0.75rem;
		border-bottom: 1px solid oklch(var(--b3, 0.22 0.02 250));
	}

	.detail-title {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0 0 0.5rem;
		word-break: break-word;
	}

	.detail-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.detail-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		padding: 0.625rem 1.25rem;
		border-bottom: 1px solid oklch(var(--b3, 0.22 0.02 250));
		font-size: 0.8125rem;
		opacity: 0.85;
	}

	.role-badge {
		text-transform: capitalize;
		margin-left: 0.25rem;
		opacity: 0.75;
	}

	.reply-unknown {
		opacity: 0.65;
		font-style: italic;
	}

	.detail-meta-split {
		flex-basis: 100%;
		font-size: 0.75rem;
		opacity: 0.7;
	}

	.detail-meta-divider {
		margin: 0 0.5rem;
		opacity: 0.5;
	}

	.detail-body {
		flex: 1 1 auto;
		overflow-y: auto;
		padding: 1rem 1.25rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.detail-description {
		position: relative;
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.detail-description-empty {
		opacity: 0.5;
		font-style: italic;
	}

	.detail-description.collapsible:not(.expanded) .description-content {
		max-height: 400px;
		overflow: hidden;
		mask-image: linear-gradient(
			180deg,
			#000 0%,
			#000 80%,
			transparent 100%
		);
		-webkit-mask-image: linear-gradient(
			180deg,
			#000 0%,
			#000 80%,
			transparent 100%
		);
	}

	.description-toggle {
		margin-top: 0.5rem;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		color: oklch(0.70 0.18 240);
		background: transparent;
		border: 0;
		cursor: pointer;
	}

	.description-toggle:hover {
		text-decoration: underline;
	}

	.section-label {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		opacity: 0.6;
		margin: 0 0 0.5rem;
	}

	/* Let markdown output follow the existing prose utilities, but trim the
	   spacing that @tailwindcss/typography injects — the panel is dense. */
	:global(.description-content > :first-child) {
		margin-top: 0;
	}
	:global(.description-content > :last-child) {
		margin-bottom: 0;
	}
	:global(.description-content pre) {
		overflow-x: auto;
		padding: 0.5rem 0.625rem;
		background: oklch(0.14 0.01 250);
		border-radius: 0.375rem;
		font-size: 0.8125rem;
	}
	:global(.description-content code) {
		font-size: 0.8125rem;
	}
</style>
