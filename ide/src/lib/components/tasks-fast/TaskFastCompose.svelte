<script lang="ts">
	/**
	 * TaskFastCompose — the reply box for /tasks-fast.
	 *
	 * Keys:
	 *   Enter           → send comment (POST /api/tasks/:id/comments), stay on task
	 *   Ctrl/Cmd+Enter  → emit onSendAndRoute (jat-nm0nq.4 implements routing)
	 *   Escape          → emit onEscape (page returns focusZone='detail')
	 *   Shift+Enter     → newline (default textarea behaviour)
	 *
	 * Parent can call focus() to jump focus here (r/c from detail mode).
	 */

	interface Props {
		taskId: string;
		onSent?: (comment: any) => void;
		onSendAndRoute?: (text: string) => void;
		onEscape?: () => void;
		onFocus?: () => void;
	}

	let { taskId, onSent, onSendAndRoute, onEscape, onFocus }: Props = $props();

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

	function sendAndRoute() {
		const text = draft.trim();
		// Send+Route is wired in jat-nm0nq.4. Here we just hand the text
		// upstream; the page decides what to do (route + advance).
		onSendAndRoute?.(text);
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
