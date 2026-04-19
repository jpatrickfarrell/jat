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

	interface SelectedElement {
		tagName?: string;
		textContent?: string;
		selector?: string;
		xpath?: string;
	}

	interface TaskAttachment {
		id: string;
		path: string;
		uploadedAt?: string;
	}

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
		// Feedback context fields (fetched from full task detail)
		page_url?: string | null;
		recording_url?: string | null;
		selected_elements?: SelectedElement[] | null;
		db_id?: string | null;
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

	// Extra context fields fetched from /api/tasks/[id] (not in list API)
	let contextDetail = $state<{
		page_url?: string | null;
		recording_url?: string | null;
		selected_elements?: SelectedElement[] | null;
		db_id?: string | null;
	} | null>(null);

	// Attachments fetched from /api/tasks/[id]/image
	let attachments = $state<TaskAttachment[]>([]);
	let attachmentsLoading = $state(false);
	let urlCopied = $state(false);

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
		contextDetail = null;
		attachments = [];
		urlCopied = false;

		// Fetch full task detail for feedback context fields (page_url, recording_url, etc.)
		const id = task.id;
		fetch(`/api/tasks/${encodeURIComponent(id)}`)
			.then((r) => (r.ok ? r.json() : null))
			.then((data) => {
				if (!data?.task || task.id !== id) return;
				const t = data.task;
				if (t.page_url || t.recording_url || t.selected_elements || t.db_id) {
					contextDetail = {
						page_url: t.page_url ?? null,
						recording_url: t.recording_url ?? null,
						selected_elements: t.selected_elements ?? null,
						db_id: t.db_id ?? null,
					};
				}
			})
			.catch(() => {});

		// Fetch attachments
		attachmentsLoading = true;
		fetch(`/api/tasks/${encodeURIComponent(id)}/image`)
			.then((r) => (r.ok ? r.json() : null))
			.then((data) => {
				if (task.id !== id) return;
				attachments = data?.images ?? [];
			})
			.catch(() => {
				attachments = [];
			})
			.finally(() => {
				if (task.id === id) attachmentsLoading = false;
			});
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

	async function copyPageUrl(url: string) {
		try {
			await navigator.clipboard.writeText(url);
			urlCopied = true;
			setTimeout(() => (urlCopied = false), 1500);
		} catch {}
	}

	// Merge task-level feedback fields with supplemental fetch results
	const feedbackContext = $derived.by(() => {
		// Prefer direct props (if list API ever includes them) over fetched detail
		const page_url = task.page_url ?? contextDetail?.page_url ?? null;
		const recording_url = task.recording_url ?? contextDetail?.recording_url ?? null;
		const selected_elements = task.selected_elements ?? contextDetail?.selected_elements ?? null;
		const db_id = task.db_id ?? contextDetail?.db_id ?? null;
		if (!page_url && !recording_url && !selected_elements?.length) return null;
		return { page_url, recording_url, selected_elements, db_id };
	});
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

		{#if feedbackContext}
			<section class="detail-context">
				<h3 class="section-label">Context</h3>
				<div class="context-items">
					{#if feedbackContext.recording_url || feedbackContext.db_id}
						{@const replayBase = (() => { try { return new URL(feedbackContext.page_url || '').origin; } catch { return ''; } })()}
						{@const replayUrl = feedbackContext.db_id && replayBase ? `${replayBase}/feedback/replay?id=${feedbackContext.db_id}` : feedbackContext.recording_url || ''}
						{#if replayUrl}
							<a
								href={replayUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="context-recording-link"
							>
								<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								Watch Recording
							</a>
						{/if}
					{/if}
					{#if feedbackContext.page_url}
						<div class="context-url-row">
							<a
								href={feedbackContext.page_url}
								target="_blank"
								rel="noopener noreferrer"
								class="context-url-link"
								title={feedbackContext.page_url}
							>
								<svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
								</svg>
								<span class="context-url-text">{feedbackContext.page_url}</span>
							</a>
							<button
								type="button"
								class="context-url-copy"
								onclick={() => copyPageUrl(feedbackContext.page_url!)}
								title="Copy URL"
							>
								{urlCopied ? '✓' : '⎘'}
							</button>
						</div>
					{/if}
					{#if feedbackContext.selected_elements?.length}
						<div class="context-elements">
							<span class="context-elements-label">Selected elements:</span>
							{#each feedbackContext.selected_elements as el}
								<code class="context-element">{el.tagName ?? ''}{el.textContent ? ` "${el.textContent.slice(0, 60)}${el.textContent.length > 60 ? '…' : ''}"` : (el.selector ?? el.xpath ?? '')}</code>
							{/each}
						</div>
					{/if}
				</div>
			</section>
		{/if}

		{#if attachmentsLoading || attachments.length > 0}
			<section class="detail-attachments">
				<h3 class="section-label">Attachments{#if attachments.length > 0}<span class="attachment-count">{attachments.length}</span>{/if}</h3>
				{#if attachmentsLoading && attachments.length === 0}
					<div class="attachment-loading">
						<span class="loading loading-spinner loading-xs"></span>
					</div>
				{:else}
					<div class="attachment-grid">
						{#each attachments as att (att.id)}
							<a
								href={`/api/work/image${att.path}`}
								target="_blank"
								rel="noopener noreferrer"
								class="attachment-thumb"
								title={att.path.split('/').pop()}
							>
								<img
									src={`/api/work/image${att.path}`}
									alt="Attachment"
									class="attachment-img"
									loading="lazy"
								/>
							</a>
						{/each}
					</div>
				{/if}
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

	/* ---- Feedback Context ---- */

	.context-items {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.context-recording-link {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 500;
		color: oklch(0.85 0.12 200);
		background: oklch(0.60 0.15 200 / 0.12);
		border: 1px solid oklch(0.60 0.15 200 / 0.3);
		text-decoration: none;
		width: max-content;
		transition: background 0.1s ease;
	}

	.context-recording-link:hover {
		background: oklch(0.60 0.15 200 / 0.22);
	}

	.context-url-row {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		min-width: 0;
	}

	.context-url-link {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.75rem;
		color: oklch(0.70 0.10 240);
		text-decoration: none;
		min-width: 0;
		flex: 1;
	}

	.context-url-link:hover {
		color: oklch(0.85 0.15 240);
	}

	.context-url-text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		opacity: 0.8;
	}

	.context-url-copy {
		flex-shrink: 0;
		padding: 0.1rem 0.3rem;
		font-size: 0.7rem;
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.25rem;
		background: transparent;
		color: inherit;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.1s ease;
	}

	.context-url-copy:hover {
		opacity: 1;
	}

	.context-elements {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		font-size: 0.75rem;
	}

	.context-elements-label {
		font-size: 0.65rem;
		opacity: 0.5;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.context-element {
		font-size: 0.7rem;
		padding: 0.1rem 0.35rem;
		border-radius: 0.25rem;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		color: oklch(0.78 0.05 240);
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* ---- Attachments ---- */

	.detail-attachments .attachment-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-left: 0.3rem;
		padding: 0 0.3rem;
		min-width: 1.1rem;
		height: 1.1rem;
		border-radius: 999px;
		background: oklch(0.28 0.02 250);
		color: oklch(0.75 0.05 250);
		font-size: 0.6rem;
		font-variant-numeric: tabular-nums;
		vertical-align: middle;
	}

	.attachment-loading {
		opacity: 0.5;
		padding: 0.25rem 0;
	}

	.attachment-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.attachment-thumb {
		display: block;
		border-radius: 0.375rem;
		overflow: hidden;
		border: 1px solid oklch(0.28 0.02 250);
		transition: border-color 0.1s ease;
	}

	.attachment-thumb:hover {
		border-color: oklch(0.55 0.08 240);
	}

	.attachment-img {
		display: block;
		width: 80px;
		height: 60px;
		object-fit: cover;
		background: oklch(0.18 0.02 250);
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
