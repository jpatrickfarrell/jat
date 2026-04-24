<script lang="ts">
	/**
	 * InboxCompose — the reply box for /inbox.
	 *
	 * Keys:
	 *   Enter           → send comment (POST /api/tasks/:id/comments), stay on task
	 *   Ctrl/Cmd+Enter  → post comment (if any) then hand off to parent for route+advance
	 *   Escape          → emit onEscape (page returns focusZone='detail')
	 *   Shift+Enter     → newline (default textarea behaviour)
	 *
	 * Parent can call focus() to jump focus here (r/c from detail mode).
	 */

	import type { TaskActor } from "$lib/types/api.types";
	import {
		resolveRoutingTarget,
		getActorDisplayName,
	} from "$lib/utils/taskRouting";
	import RoleChip from "$lib/components/RoleChip.svelte";

	// Minimal task shape needed to resolve the routing target. Using a local
	// interface keeps this component structurally compatible with the varied
	// Task shapes used by callers (InboxDetail, /inbox page, etc.).
	interface RoutingTaskShape {
		approver?: TaskActor | null;
		approver_id?: string | null;
		requester?: TaskActor | null;
		requester_id?: string | null;
		creator?: TaskActor | null;
		creator_id?: string | null;
		// Needed by the action-preview panel so it can honestly describe the
		// state transitions the buttons will cause. Optional so the component
		// still works with the lighter task shapes callers pass today.
		status?: string | null;
		assignee?: string | null;
	}

	interface Props {
		taskId: string;
		task?: RoutingTaskShape | null;
		// Current JAT IDE user's display name (from git config, via /api/config/user).
		// Used as the comment `author` so replies show the human's name instead of
		// the literal string "user". The author_type stays "user" — that's the
		// role (human vs agent vs system), not the display label.
		currentUser?: string;
		// Current JAT IDE user's email (from git config). Sent as `author_email`
		// so postgres-backed backends can resolve the commenter to a per-project
		// profile UUID (each Supabase project mints its own IDs, but the user's
		// email is the stable cross-project anchor).
		currentUserEmail?: string;
		onSent?: (comment: any) => void;
		// Called after the comment (if any) is successfully posted. Parent handles
		// reassignment + advance. Returning a promise keeps the compose in its
		// submitting state until the route finishes.
		onSendAndRoute?: (text: string) => void | Promise<void>;
		// Called when the dev sends an internal note + wants to hand the task
		// off to a freshly-spawned agent instead of routing back to the reporter.
		// Parent is responsible for calling /api/work/spawn (with preserveAssignee:
		// true) and advancing to the next task. If unset, Internal+Spawn falls
		// back to onSendAndRoute behaviour so the UI never dead-ends.
		onSendAndSpawn?: (text: string) => void | Promise<void>;
		onEscape?: () => void;
		onFocus?: () => void;
	}

	let {
		taskId,
		task = null,
		currentUser = "",
		currentUserEmail = "",
		onSent,
		onSendAndRoute,
		onSendAndSpawn,
		onEscape,
		onFocus,
	}: Props = $props();

	// Fall back to "user" only if the IDE couldn't resolve the git user.
	// (Empty string → placeholder; normal case → "Joseph Winke" etc.)
	const authorName = $derived(currentUser.trim() || "user");
	const authorEmail = $derived(currentUserEmail.trim() || null);

	const routingTarget = $derived(task ? resolveRoutingTarget(task as any) : null);
	const routingName = $derived(getActorDisplayName(routingTarget?.actor));
	// Send + Route is only meaningful when a routing target exists. Without
	// one, the handler throws ("No approver, requester, or creator to route
	// to"). Disable the button and the preview reflects the failure honestly
	// instead of promising a bogus "you → Unknown" assignment.
	const canRoute = $derived(routingTarget !== null);

	// Preview helpers — formatters for the expand-on-focus panel. Mirror the
	// actual server-side logic so the panel never lies about what will happen.
	// External route: status submitted/open → waiting, else unchanged.
	const taskStatus = $derived<string>(task?.status ?? "unknown");
	const currentAssignee = $derived<string>(task?.assignee?.trim() || "you");
	const externalNextStatus = $derived(
		taskStatus === "submitted" || taskStatus === "open"
			? "waiting"
			: taskStatus,
	);
	const statusWillChange = $derived(externalNextStatus !== taskStatus);

	let textarea = $state<HTMLTextAreaElement | null>(null);
	let draft = $state("");
	let submitting = $state(false);
	let error = $state<string | null>(null);

	// Visibility toggle: false = external (reporter sees it via widget),
	// true = internal (dev-only). Resets to external after every successful
	// submit so you can't accidentally leak the next reply.
	let isInternal = $state(false);

	// Action-preview UI: expands on textarea focus OR button hover, describing
	// the state deltas each button will cause. Goal: kill any mystery about
	// what the routing/spawn buttons do before the click lands. Both buttons
	// are always described when the panel is open; the hovered one gets a
	// highlight background so the eye snaps to the right row.
	let composerFocused = $state(false);
	let hoveredAction = $state<"send" | "route" | null>(null);
	const previewOpen = $derived(composerFocused || hoveredAction !== null);

	export function focus() {
		textarea?.focus();
	}

	// Reset draft whenever the target task changes so replies don't leak.
	// Also reset isInternal — an internal toggle on task A should not bleed
	// into task B.
	$effect(() => {
		// track taskId
		void taskId;
		draft = "";
		error = null;
		isInternal = false;
	});

	// Auto-grow: resize to fit content, capped so the page doesn't blow up.
	$effect(() => {
		if (!textarea) return;
		// track draft
		void draft;
		textarea.style.height = "auto";
		const max = 200;
		const next = Math.min(textarea.scrollHeight, max);
		textarea.style.height = `${next}px`;
	});

	async function send() {
		const text = draft.trim();
		if (!text || submitting) return;
		submitting = true;
		error = null;
		const sendInternal = isInternal;
		try {
			const res = await fetch(
				`/api/tasks/${encodeURIComponent(taskId)}/comments`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						text,
						author: authorName,
						author_email: authorEmail,
						author_type: "user",
						comment_type: "note",
						external: !sendInternal,
					}),
				},
			);
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.error || `HTTP ${res.status}`);
			}
			const data = await res.json();
			draft = "";
			// Reset to external so the next reply defaults back to the safe (visible)
			// state. Internal is always explicit opt-in per draft.
			isInternal = false;
			onSent?.(data.comment);
			// Return keyboard focus to the detail zone so shortcuts (s, a, p, etc.)
			// work immediately after sending without requiring Escape.
			textarea?.blur();
			onEscape?.();
		} catch (e: any) {
			error = e?.message || "Failed to send";
		} finally {
			submitting = false;
		}
	}

	async function sendAndRoute() {
		if (submitting) return;
		const text = draft.trim();

		// Two flows behind one button, depending on the visibility toggle:
		//
		//   External  → post comment + route-to-reporter (reassign, status=waiting)
		//   Internal  → post internal note + spawn an agent to work the task
		//               (status=in_progress, dev stays as assignee)
		//
		// The external path is the legacy "Send + Route". The internal path is
		// "Brief and Spawn" — the dev is handing off to an agent with context,
		// not bouncing the task back to the reporter.
		const sendInternal = isInternal;
		const isSpawnFlow = sendInternal && !!onSendAndSpawn;

		// Empty comment → confirm before acting (per jat-nm0nq.4 spec). Wording
		// adapts to the active flow so the consequence is explicit.
		if (!text) {
			const msg = isSpawnFlow
				? "Spawn an agent without a note? The task will move to in_progress and a new session will start."
				: sendInternal
					? "Route without sending a note? The task will be reassigned and marked waiting — nothing is sent to the reporter."
					: "Route without sending a comment? The task will be reassigned and marked waiting.";
			const ok = confirm(msg);
			if (!ok) return;
		}

		submitting = true;
		error = null;

		// Track whether the comment actually landed so a retry after the
		// downstream step fails doesn't double-post.
		let commentSent = false;

		try {
			// Post the comment first (skip when empty so we don't create blank notes).
			if (text) {
				const res = await fetch(
					`/api/tasks/${encodeURIComponent(taskId)}/comments`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							text,
							author: authorName,
							author_email: authorEmail,
							author_type: "user",
							comment_type: "note",
							external: !sendInternal,
						}),
					},
				);
				if (!res.ok) {
					const body = await res.json().catch(() => ({}));
					throw new Error(body.error || `HTTP ${res.status}`);
				}
				const data = await res.json();
				commentSent = true;
				onSent?.(data.comment);
				// Drop the now-posted draft so a retry won't duplicate the comment
				// if the downstream step fails.
				draft = "";
				isInternal = false;
			}

			// Hand off to the parent. If the parent throws we keep the (empty)
			// draft and surface the error.
			if (isSpawnFlow) {
				await onSendAndSpawn?.(text);
			} else {
				await onSendAndRoute?.(text);
			}
		} catch (e: any) {
			const action = isSpawnFlow ? "spawn" : "route";
			const base = e?.message || `Failed to send and ${action}`;
			error = commentSent ? `Comment sent but ${action} failed: ${base}` : base;
		} finally {
			submitting = false;
		}
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === "Escape") {
			e.preventDefault();
			// Blur the textarea so the page's window-level keydown handler
			// (r/c, and j/k in jat-nm0nq.2) doesn't stay trapped in the input.
			textarea?.blur();
			onEscape?.();
			return;
		}
		// Cmd/Ctrl+Shift+I flips the internal toggle. Uses e.code so it
		// survives keyboard layouts that remap "I". Handled before Enter so
		// Cmd+Shift+Enter doesn't accidentally send.
		if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.code === "KeyI") {
			e.preventDefault();
			isInternal = !isInternal;
			return;
		}
		if (e.key === "Enter") {
			// Shift+Enter → newline (browser default)
			if (e.shiftKey) return;
			// Ctrl/Cmd+Enter → send+route
			if (e.ctrlKey || e.metaKey) {
				e.preventDefault();
				sendAndRoute();
				return;
			}
			// Plain Enter → send
			e.preventDefault();
			send();
		}
	}
</script>

<div class="compose" class:compose-internal={isInternal}>
	<div class="reply-to" aria-live="polite">
		<div class="reply-to-main">
			{#if isInternal}
				<span class="reply-to-label internal-label">Internal note</span>
				<span
					class="reply-to-name reply-to-unknown"
					title="Not sent to {routingName}. Visible only in the IDE."
				>
					not sent to {routingName}
				</span>
			{:else}
				<span class="reply-to-label">Reply to</span>
				<span class="reply-to-name" class:reply-to-unknown={!routingTarget}>
					{routingName}
				</span>
				{#if routingTarget}
					<RoleChip role={routingTarget.actor.role} />
					<span class="reply-to-role badge badge-xs badge-outline">
						{routingTarget.role}
					</span>
				{:else}
					<span
						class="reply-to-warn"
						title="No approver, requester, or creator is set on this task — Ctrl+↵ will fail until one is set."
						aria-label="No routing target set"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							aria-hidden="true"
						>
							<path
								fill-rule="evenodd"
								d="M8.485 2.495c.673-1.166 2.357-1.166 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
								clip-rule="evenodd"
							/>
						</svg>
					</span>
				{/if}
			{/if}
		</div>
		<!-- Visibility toggle lives in the header because it controls exactly
		     what the header describes (who sees this). Keeps the action cluster
		     below focused on *actions*, not modes. -->
		<button
			type="button"
			class="btn btn-xs visibility-toggle {isInternal
				? 'btn-warning'
				: 'btn-ghost'}"
			aria-pressed={isInternal}
			disabled={submitting}
			onclick={() => (isInternal = !isInternal)}
			title={isInternal
				? "Internal — only visible in IDE. Click or Cmd+Shift+I to make external."
				: "External — visible to the reporter. Click or Cmd+Shift+I to make internal."}
		>
			{#if isInternal}
				<svg
					class="toggle-icon"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 15v2m-6 4h12a2 2 0 002-2v-7a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
					/>
				</svg>
				Internal
			{:else}
				<svg
					class="toggle-icon"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
					/>
					<circle
						cx="12"
						cy="12"
						r="3"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				External
			{/if}
		</button>
	</div>
	{#if error}
		<p class="compose-error">{error}</p>
	{/if}
	<textarea
		bind:this={textarea}
		bind:value={draft}
		class="compose-input"
		rows="1"
		placeholder={isInternal
			? "Internal note — dev-only, not sent to reporter (Enter to send)"
			: "Reply… (Enter to send, Ctrl+↵ to send+route)"}
		disabled={submitting}
		onkeydown={handleKey}
		onfocus={() => {
			composerFocused = true;
			onFocus?.();
		}}
		onblur={() => {
			composerFocused = false;
		}}
		aria-label={isInternal ? "Internal note" : "Reply to task"}
	></textarea>
	<div class="compose-actions">
		<span class="compose-hint">
			<kbd>↵</kbd> send · <kbd>Ctrl</kbd>+<kbd>↵</kbd> send+route · <kbd
				>⇧⌘I</kbd
			> internal · <kbd>Esc</kbd> back
		</span>
		<div class="compose-buttons">
			<button
				type="button"
				class="btn btn-xs {isInternal ? 'btn-warning' : 'btn-ghost'}"
				disabled={submitting || !draft.trim()}
				onclick={send}
				onmouseenter={() => (hoveredAction = "send")}
				onmouseleave={() => (hoveredAction = null)}
				onfocus={() => (hoveredAction = "send")}
				onblur={() => (hoveredAction = null)}
				title={isInternal
					? "Post internal note (Enter) — not sent to reporter"
					: "Send comment (Enter)"}
			>
				{isInternal ? "Post Internal" : "Send"}
			</button>
			<button
				type="button"
				class="btn btn-xs btn-primary"
				disabled={submitting || (!isInternal && !canRoute)}
				onclick={sendAndRoute}
				onmouseenter={() => (hoveredAction = "route")}
				onmouseleave={() => (hoveredAction = null)}
				onfocus={() => (hoveredAction = "route")}
				onblur={() => (hoveredAction = null)}
				title={isInternal
					? "Post internal note and spawn an agent (Ctrl+Enter). Dev stays as assignee."
					: canRoute
						? "Send and route to requester (Ctrl+Enter)"
						: "No approver, requester, or creator set on this task — set one in the task detail before routing."}
			>
				{#if submitting}
					<span class="loading loading-spinner loading-xs"></span>
				{/if}
				{isInternal ? "Internal + Spawn" : "Send + Route"}
			</button>
		</div>
	</div>

	<!-- Action preview — expands on textarea focus or button hover/focus.
	     Describes both action buttons side-by-side so there's no ambiguity
	     about which button does what. The hovered button's row is
	     highlighted. Reads from the same logic the handlers use so it
	     can't drift from reality. -->
	{#if previewOpen}
		<div class="action-preview" role="note" aria-live="polite">
			<!-- Row 1: primary send (stays on task) -->
			<div class="preview-row" class:preview-row-active={hoveredAction === "send"}>
				<span class="preview-btn-name"
					>{isInternal ? "Post Internal" : "Send"}</span
				>
				<span class="preview-arrow">→</span>
				<span class="preview-desc">
					{#if isInternal}
						Posts an <b class="label-internal">internal</b> note · task
						status <code>{taskStatus}</code> unchanged · reporter sees nothing.
					{:else}
						Posts an <b class="label-external">external</b> reply · task
						status <code>{taskStatus}</code> unchanged · reporter sees it in
						the widget.
					{/if}
				</span>
			</div>
			<!-- Row 2: secondary action (route or spawn) -->
			<div class="preview-row" class:preview-row-active={hoveredAction === "route"}>
				<span class="preview-btn-name"
					>{isInternal ? "Internal + Spawn" : "Send + Route"}</span
				>
				<span class="preview-arrow">→</span>
				<span class="preview-desc">
					{#if isInternal}
						Posts an <b class="label-internal">internal</b> note · spawns a
						new agent · status <code>{taskStatus}</code>
						<span class="arrow">→</span>
						<code class="code-next">in_progress</code> ·
						<b>you stay as assignee</b> ({currentAssignee}).
					{:else if !canRoute}
						<!-- No approver/requester/creator set → Route would throw.
						     Surface that up-front so the user fixes the task
						     identity instead of clicking and hitting an error. -->
						<b class="label-disabled">Disabled</b> · this task has no
						approver, requester, or creator — set one in the task detail
						before routing.
					{:else if statusWillChange}
						Posts an <b class="label-external">external</b> reply · status
						<code>{taskStatus}</code>
						<span class="arrow">→</span>
						<code class="code-next">{externalNextStatus}</code> · assignee
						<code>{currentAssignee}</code>
						<span class="arrow">→</span>
						<code class="code-next">{routingName}</code> · advances to next.
					{:else}
						Posts an <b class="label-external">external</b> reply · status
						<code>{taskStatus}</code> unchanged · assignee
						<code>{currentAssignee}</code>
						<span class="arrow">→</span>
						<code class="code-next">{routingName}</code> · advances to next.
					{/if}
				</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.compose {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding: 0.75rem 1.25rem 1rem;
		border-top: 1px solid oklch(var(--b3, 0.22 0.02 250));
		background: oklch(0.12 0.01 250 / 0.5);
		transition:
			background-color 120ms ease,
			border-color 120ms ease;
	}

	/* Internal mode — subtle amber wash across the whole compose region so
	 * it's impossible to type a long note and forget you're in internal mode. */
	.compose.compose-internal {
		background: oklch(0.75 0.15 85 / 0.06);
		border-top-color: oklch(0.75 0.15 85 / 0.45);
	}

	.internal-label {
		color: oklch(0.75 0.15 85);
		opacity: 1 !important;
		font-weight: 600;
	}

	.toggle-icon {
		width: 0.75rem;
		height: 0.75rem;
		margin-right: 0.25rem;
	}

	.reply-to {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 0.75rem;
		line-height: 1;
		padding: 0.125rem 0.125rem 0.25rem;
	}

	.reply-to-main {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		min-width: 0;
		flex: 1;
	}

	.visibility-toggle {
		flex-shrink: 0;
	}

	.reply-to-label {
		opacity: 0.55;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-size: 0.6875rem;
	}

	.reply-to-name {
		font-weight: 500;
		color: oklch(var(--bc, 0.95 0.02 250));
	}

	.reply-to-unknown {
		opacity: 0.7;
		font-style: italic;
	}

	.reply-to-role {
		text-transform: capitalize;
		opacity: 0.75;
	}

	.reply-to-warn {
		display: inline-flex;
		align-items: center;
		color: oklch(0.75 0.15 65);
	}

	.reply-to-warn svg {
		width: 0.875rem;
		height: 0.875rem;
	}

	.compose-input {
		width: 100%;
		min-height: 2.25rem;
		max-height: 200px;
		padding: 0.5rem 0.625rem;
		font-size: 0.875rem;
		line-height: 1.4;
		font-family: inherit;
		color: inherit;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(var(--b3, 0.22 0.02 250));
		border-radius: 0.375rem;
		resize: none;
		overflow-y: auto;
	}

	.compose-input:focus-visible {
		outline: 2px solid oklch(0.70 0.18 240);
		outline-offset: 1px;
		border-color: oklch(0.70 0.18 240 / 0.6);
	}

	.compose-internal .compose-input {
		border-color: oklch(0.75 0.15 85 / 0.55);
		background: oklch(0.16 0.02 85 / 0.35);
	}

	.compose-internal .compose-input:focus-visible {
		outline-color: oklch(0.75 0.15 85);
		border-color: oklch(0.75 0.15 85 / 0.8);
	}

	.compose-input:disabled {
		opacity: 0.6;
	}

	.compose-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.compose-hint {
		font-size: 0.6875rem;
		opacity: 0.55;
	}

	.compose-hint kbd {
		display: inline-block;
		padding: 0.05rem 0.25rem;
		font-size: 0.625rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(var(--b3, 0.22 0.02 250));
		border-radius: 0.1875rem;
		vertical-align: baseline;
	}

	.compose-buttons {
		display: flex;
		gap: 0.375rem;
	}

	.compose-error {
		margin: 0;
		padding: 0.375rem 0.5rem;
		font-size: 0.75rem;
		color: oklch(0.70 0.18 25);
		background: oklch(0.70 0.18 25 / 0.08);
		border: 1px solid oklch(0.70 0.18 25 / 0.25);
		border-radius: 0.25rem;
	}

	.action-preview {
		margin-top: 0.125rem;
		padding: 0.375rem 0.5rem;
		font-size: 0.6875rem;
		line-height: 1.4;
		color: oklch(0.80 0.03 250);
		background: oklch(0.15 0.01 250 / 0.6);
		border: 1px solid oklch(0.22 0.02 250);
		border-radius: 0.25rem;
		animation: preview-fade-in 120ms ease-out;
		display: flex;
		flex-direction: column;
		gap: 0.1875rem;
	}

	.preview-row {
		display: flex;
		align-items: baseline;
		gap: 0.375rem;
		padding: 0.1875rem 0.25rem;
		border-radius: 0.1875rem;
		transition: background-color 100ms ease;
	}

	/* Hovered row pops so the user's eye snaps to "this button does X". */
	.preview-row-active {
		background: oklch(0.22 0.04 240 / 0.4);
	}

	.compose-internal .preview-row-active {
		background: oklch(0.75 0.15 85 / 0.15);
	}

	.preview-btn-name {
		flex-shrink: 0;
		font-weight: 600;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		font-size: 0.625rem;
		color: oklch(0.88 0.05 250);
		padding: 0.0625rem 0.3125rem;
		background: oklch(0.20 0.02 250);
		border-radius: 0.1875rem;
	}

	.preview-arrow {
		flex-shrink: 0;
		opacity: 0.4;
		font-weight: 600;
	}

	.preview-desc {
		flex: 1;
		min-width: 0;
	}

	.action-preview code {
		padding: 0 0.25rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		font-size: 0.625rem;
		background: oklch(0.20 0.02 250);
		border-radius: 0.1875rem;
	}

	.action-preview .code-next {
		background: oklch(0.25 0.05 200 / 0.6);
		color: oklch(0.90 0.08 200);
	}

	.action-preview .arrow {
		margin: 0 0.125rem;
		opacity: 0.6;
	}

	.action-preview .label-internal {
		color: oklch(0.75 0.15 85);
	}

	.action-preview .label-external {
		color: oklch(0.75 0.12 200);
	}

	.action-preview .label-disabled {
		color: oklch(0.70 0.14 40);
	}

	/* When internal mode tints the whole compose, the preview panel picks up
	 * a matching border so it reads as part of the same surface. */
	.compose-internal .action-preview {
		background: oklch(0.75 0.15 85 / 0.05);
		border-color: oklch(0.75 0.15 85 / 0.3);
	}

	@keyframes preview-fade-in {
		from {
			opacity: 0;
			transform: translateY(-2px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.action-preview {
			animation: none;
		}
	}
</style>
