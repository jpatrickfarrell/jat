<script lang="ts">
	/**
	 * TaskFastCompose — the reply box for /tasks-fast.
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

	// Minimal task shape needed to resolve the routing target. Using a local
	// interface keeps this component structurally compatible with the varied
	// Task shapes used by callers (TaskFastDetail, /tasks-fast page, etc.).
	interface RoutingTaskShape {
		approver?: TaskActor | null;
		approver_id?: string | null;
		requester?: TaskActor | null;
		requester_id?: string | null;
		creator?: TaskActor | null;
		creator_id?: string | null;
	}

	interface Props {
		taskId: string;
		task?: RoutingTaskShape | null;
		onSent?: (comment: any) => void;
		// Called after the comment (if any) is successfully posted. Parent handles
		// reassignment + advance. Returning a promise keeps the compose in its
		// submitting state until the route finishes.
		onSendAndRoute?: (text: string) => void | Promise<void>;
		onEscape?: () => void;
		onFocus?: () => void;
	}

	let {
		taskId,
		task = null,
		onSent,
		onSendAndRoute,
		onEscape,
		onFocus,
	}: Props = $props();

	const routingTarget = $derived(task ? resolveRoutingTarget(task as any) : null);
	const routingName = $derived(getActorDisplayName(routingTarget?.actor));

	let textarea = $state<HTMLTextAreaElement | null>(null);
	let draft = $state("");
	let submitting = $state(false);
	let error = $state<string | null>(null);

	export function focus() {
		textarea?.focus();
	}

	// Reset draft whenever the target task changes so replies don't leak.
	$effect(() => {
		// track taskId
		void taskId;
		draft = "";
		error = null;
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
		try {
			const res = await fetch(
				`/api/tasks/${encodeURIComponent(taskId)}/comments`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						text,
						author: "user",
						author_type: "user",
						comment_type: "note",
					}),
				},
			);
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.error || `HTTP ${res.status}`);
			}
			const data = await res.json();
			draft = "";
			onSent?.(data.comment);
		} catch (e: any) {
			error = e?.message || "Failed to send";
		} finally {
			submitting = false;
		}
	}

	async function sendAndRoute() {
		if (submitting) return;
		const text = draft.trim();

		// Empty comment → confirm before routing (per jat-nm0nq.4 spec).
		if (!text) {
			const ok = confirm(
				"Route without sending a comment? The task will be reassigned and marked waiting.",
			);
			if (!ok) return;
		}

		submitting = true;
		error = null;

		// Track whether the comment actually landed so a retry after a routing
		// failure doesn't double-post.
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
							author: "user",
							author_type: "user",
							comment_type: "note",
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
				// if the downstream route fails.
				draft = "";
			}

			// Hand off to the page: reassign to requester + status=waiting + advance.
			// If the parent throws we keep the (empty) draft and surface the error.
			await onSendAndRoute?.(text);
		} catch (e: any) {
			const base = e?.message || "Failed to send and route";
			error = commentSent ? `Comment sent but routing failed: ${base}` : base;
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

<div class="compose">
	<div class="reply-to" aria-live="polite">
		<span class="reply-to-label">Reply to</span>
		<span class="reply-to-name" class:reply-to-unknown={!routingTarget}>
			{routingName}
		</span>
		{#if routingTarget}
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
	</div>
	{#if error}
		<p class="compose-error">{error}</p>
	{/if}
	<textarea
		bind:this={textarea}
		bind:value={draft}
		class="compose-input"
		rows="1"
		placeholder="Reply… (Enter to send, Ctrl+↵ to send+route)"
		disabled={submitting}
		onkeydown={handleKey}
		onfocus={() => onFocus?.()}
		aria-label="Reply to task"
	></textarea>
	<div class="compose-actions">
		<span class="compose-hint">
			<kbd>↵</kbd> send · <kbd>Ctrl</kbd>+<kbd>↵</kbd> send+route · <kbd
				>Esc</kbd
			> back
		</span>
		<div class="compose-buttons">
			<button
				type="button"
				class="btn btn-xs btn-ghost"
				disabled={submitting || !draft.trim()}
				onclick={send}
				title="Send comment (Enter)"
			>
				Send
			</button>
			<button
				type="button"
				class="btn btn-xs btn-primary"
				disabled={submitting}
				onclick={sendAndRoute}
				title="Send and route to requester (Ctrl+Enter)"
			>
				{#if submitting}
					<span class="loading loading-spinner loading-xs"></span>
				{/if}
				Send + Route
			</button>
		</div>
	</div>
</div>

<style>
	.compose {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding: 0.75rem 1.25rem 1rem;
		border-top: 1px solid oklch(var(--b3, 0.22 0.02 250));
		background: oklch(0.12 0.01 250 / 0.5);
	}

	.reply-to {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
		line-height: 1;
		padding: 0.125rem 0.125rem 0.25rem;
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
</style>
