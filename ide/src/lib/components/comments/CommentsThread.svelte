<script lang="ts">
	/**
	 * CommentsThread
	 *
	 * Renders the comment thread for a task and provides a reply input.
	 * Rendering rules by comment_type:
	 *   question → highlighted callout with agent avatar + "Waiting for your answer"
	 *   answer   → reply bubble, user avatar, right-aligned
	 *   note     → subdued inline note
	 *   event    → italic system line, no avatar
	 *
	 * Reply input posts to POST /api/tasks/[id]/comments. The API handles
	 * resume-trigger logic when the reply answers a pending agent question.
	 */

	import AgentAvatar from '$lib/components/AgentAvatar.svelte';
	import { richPaste } from '$lib/actions/richPaste';

	interface Comment {
		id: string;
		text: string;
		author: string | null;
		author_type: 'agent' | 'user' | 'system' | null;
		comment_type: 'question' | 'answer' | 'note' | 'event' | null;
		session_id: string | null;
		metadata: any;
		/** Visibility flag (from jat-47wul.1). true = visible to reporter in widget,
		 * false = internal, dev-only. Older comments may omit this — treat as true. */
		external?: boolean;
		created_at: string;
	}

	let {
		taskId,
		compact = false,
		hideInput = false,
		onCountChange,
		onPendingQuestionChange
	}: {
		taskId: string;
		compact?: boolean;
		/** Hide the built-in reply textarea (e.g. when a parent renders its own compose box). */
		hideInput?: boolean;
		onCountChange?: (count: number) => void;
		onPendingQuestionChange?: (hasPending: boolean) => void;
	} = $props();

	let comments = $state<Comment[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let draft = $state('');
	let submitting = $state(false);
	let submitError = $state<string | null>(null);

	// Composer visibility toggle: false = external (default, visible to reporter),
	// true = internal (dev-only). Resets to external after every successful submit —
	// internal is always an explicit opt-in per draft so you can't accidentally
	// "stick" the toggle on and leak the next reply to the customer.
	let isInternal = $state(false);

	// Pending question = most recent 'question' with session_id that has no later 'answer' after it.
	const pendingQuestion = $derived.by(() => {
		for (let i = comments.length - 1; i >= 0; i--) {
			const c = comments[i];
			if (c.comment_type === 'answer') return null;
			if (c.comment_type === 'question' && c.session_id) return c;
		}
		return null;
	});

	async function load() {
		loading = true;
		error = null;
		try {
			const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}/comments`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			comments = data.comments || [];
			onCountChange?.(comments.length);
		} catch (e: any) {
			error = e?.message || 'Failed to load comments';
		} finally {
			loading = false;
		}
	}

	// $effect handles both initial load and taskId changes — onMount is redundant
	// here and would cause a double-fetch on every task switch (the {#key} block
	// in InboxDetail destroys/remounts this component when taskId changes, which
	// triggers $effect on the fresh mount just like onMount would).
	$effect(() => {
		if (taskId) load();
	});

	$effect(() => {
		onPendingQuestionChange?.(pendingQuestion !== null);
	});

	async function submitOption(optionText: string) {
		if (submitting) return;
		draft = optionText;
		// Quick-reply option buttons are for answering pending agent questions —
		// always external (the answer is for the customer who asked). Force-override
		// any lingering internal toggle so the "reset on submit" guarantee holds.
		await submit({ forceExternal: true });
	}

	async function submit(opts: { forceExternal?: boolean } = {}) {
		const text = draft.trim();
		if (!text || submitting) return;
		submitting = true;
		submitError = null;
		const sendInternal = !opts.forceExternal && isInternal;
		try {
			// If there's a pending agent question, send as 'answer' so API can resume.
			// Otherwise send as 'note' for a normal human thread entry.
			const comment_type = pendingQuestion ? 'answer' : 'note';
			const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}/comments`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					text,
					author: 'user',
					author_type: 'user',
					comment_type,
					external: !sendInternal,
				}),
			});
			if (!res.ok) {
				const msg = await res.json().catch(() => ({}));
				throw new Error(msg.error || `HTTP ${res.status}`);
			}
			const data = await res.json();
			comments = [...comments, data.comment];
			draft = '';
			// Safety net: always reset to external so the next draft can't inherit
			// an unintended internal state.
			isInternal = false;
		} catch (e: any) {
			submitError = e?.message || 'Failed to post comment';
		} finally {
			submitting = false;
		}
	}

	function formatTime(iso: string): string {
		try {
			return new Date(iso).toLocaleString('en-US', {
				month: 'short',
				day: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
			});
		} catch {
			return iso;
		}
	}

	function handleKey(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
			e.preventDefault();
			submit();
			return;
		}
		// Alt+I flips the internal toggle without leaving the textarea.
		// Uses e.code so it survives keyboard layouts that remap "I".
		// Avoids Cmd/Ctrl+Shift+I because that's Firefox/Chrome dev tools
		// and the browser claims it before preventDefault can run.
		if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyI') {
			e.preventDefault();
			isInternal = !isInternal;
		}
	}
</script>

{#snippet internalBadge()}
	<span
		class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-warning/20 border border-warning/40 text-warning text-[10px] font-semibold uppercase tracking-wide"
		title="Only visible in IDE — not sent to reporter"
	>
		<svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-7a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
		</svg>
		Internal
	</span>
{/snippet}

<div class="flex flex-col gap-2 {compact ? 'text-xs' : 'text-sm'}">
	{#if loading}
		<div class="flex items-center gap-2 text-base-content/50 text-xs">
			<span class="loading loading-spinner loading-xs"></span>
			Loading comments…
		</div>
	{:else if error}
		<div class="alert alert-error py-2 text-xs">{error}</div>
	{:else if comments.length === 0}
		<p class="text-xs italic text-base-content/40">No comments yet.</p>
	{:else}
		<div class="flex flex-col gap-2">
			{#each comments as c (c.id)}
				{@const isInternalComment = c.external === false}
				{#if c.comment_type === 'event'}
					<!-- event: italic system line, no avatar -->
					<div class="text-[11px] italic text-base-content/50 px-1 py-0.5">
						{c.text}
						<span class="opacity-60">· {formatTime(c.created_at)}</span>
					</div>
				{:else if c.comment_type === 'question'}
					<!-- question: highlighted callout + agent avatar + waiting label -->
					<div class="flex gap-2 items-start">
						<div class="shrink-0 mt-0.5">
							{#if c.author}
								<AgentAvatar name={c.author} size={24} />
							{/if}
						</div>
						<div class="flex-1 rounded-lg border px-3 py-2 bg-warning/10 border-warning/30">
							<div class="flex items-center gap-2 mb-1 flex-wrap">
								<span class="text-[10px] font-semibold uppercase tracking-wide text-warning">
									Question from {c.author || 'agent'}
								</span>
								{#if c.session_id}
									<span class="badge badge-xs badge-warning">Waiting for your answer</span>
								{/if}
								{#if isInternalComment}
									{@render internalBadge()}
								{/if}
							</div>
							<p class="leading-relaxed whitespace-pre-wrap break-words">{c.text}</p>
							<p class="opacity-40 text-[10px] mt-1">{formatTime(c.created_at)}</p>
						</div>
					</div>
				{:else if c.comment_type === 'answer'}
					<!-- answer: reply bubble right-aligned, user avatar -->
					<div class="flex gap-2 items-start flex-row-reverse">
						<div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 {isInternalComment ? 'bg-warning/20 text-warning' : 'bg-primary/15 text-primary'}">
							<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
							</svg>
						</div>
						<div
							class="max-w-[75%] rounded-2xl rounded-tr-sm px-3 py-1.5 border {isInternalComment
								? 'bg-warning/10 border-warning/40 text-base-content/90'
								: 'bg-primary/8 border-primary/20 text-primary/90'}"
							title={isInternalComment ? 'Only visible in IDE — not sent to reporter' : undefined}
						>
							{#if isInternalComment}
								<div class="flex justify-end mb-1">
									{@render internalBadge()}
								</div>
							{/if}
							<p class="leading-relaxed whitespace-pre-wrap break-words">{c.text}</p>
							<p class="opacity-40 text-[10px] mt-0.5 text-right">{formatTime(c.created_at)}</p>
						</div>
					</div>
				{:else}
					<!-- note (default): subdued, no avatar prominence -->
					<div class="flex gap-2 items-start">
						<div
							class="flex-1 rounded-lg border px-3 py-1.5 {isInternalComment
								? 'bg-warning/10 border-warning/40'
								: 'bg-base-200 border-base-300'}"
							title={isInternalComment ? 'Only visible in IDE — not sent to reporter' : undefined}
						>
							<div class="flex items-center gap-1.5 mb-0.5 flex-wrap">
								<span class="text-[10px] font-medium text-base-content/60">
									{c.author || 'unknown'}
								</span>
								<span class="text-[10px] text-base-content/40">
									· {formatTime(c.created_at)}
								</span>
								{#if isInternalComment}
									{@render internalBadge()}
								{/if}
							</div>
							<p class="leading-relaxed whitespace-pre-wrap break-words text-base-content/80">{c.text}</p>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}

	<!-- Reply input -->
	{#if !hideInput}
	<div class="mt-2 flex flex-col gap-1.5">
		{#if pendingQuestion}
			<p class="text-[10px] text-warning font-medium">
				Answering {pendingQuestion.author || 'agent'}'s question…
			</p>
		{/if}

		{#if pendingQuestion?.metadata?.options?.length > 0}
			<!-- Structured option buttons — click to immediately answer -->
			<div class="flex flex-wrap gap-1.5">
				{#each pendingQuestion.metadata.options as option, i}
					<button
						type="button"
						class="btn btn-sm btn-outline btn-warning"
						disabled={submitting}
						onclick={() => submitOption(option)}
					>
						{#if submitting && draft === option}
							<span class="loading loading-spinner loading-xs"></span>
						{/if}
						{option}
					</button>
				{/each}
			</div>
			{#if submitError}
				<p class="text-xs text-error">{submitError}</p>
			{/if}
		{:else}
			<textarea
				class="textarea textarea-bordered textarea-sm w-full resize-none text-sm {isInternal
					? 'border-warning/60 bg-warning/5 focus:border-warning'
					: ''}"
				rows="2"
				placeholder={pendingQuestion
					? 'Type your answer… (Ctrl+Enter to send)'
					: isInternal
						? 'Add an internal note — dev-only, not sent to reporter… (Ctrl+Enter to send)'
						: 'Add a comment… (Ctrl+Enter to send)'}
				bind:value={draft}
				onkeydown={handleKey}
				disabled={submitting}
				use:richPaste
			></textarea>
			{#if submitError}
				<p class="text-xs text-error">{submitError}</p>
			{/if}
			<div class="flex items-center justify-between gap-2">
				<!-- Visibility toggle: eye (external) / lock (internal). Resets to external after submit. -->
				<button
					type="button"
					class="btn btn-xs {isInternal ? 'btn-warning' : 'btn-ghost'}"
					aria-pressed={isInternal}
					disabled={submitting}
					title={isInternal
						? 'Internal — only visible in IDE. Click or Alt+I to make external.'
						: 'External — visible to the reporter. Click or Alt+I to make internal.'}
					onclick={() => (isInternal = !isInternal)}
				>
					{#if isInternal}
						<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-7a2 2 0 00-2-2H6a2 2 0 00-2 2v7a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
						<span>Internal</span>
					{:else}
						<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
							<circle cx="12" cy="12" r="3" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
						<span>External</span>
					{/if}
				</button>
				<button
					type="button"
					class="btn btn-xs {isInternal ? 'btn-warning' : 'btn-primary'}"
					disabled={submitting || !draft.trim()}
					onclick={() => submit()}
				>
					{#if submitting}
						<span class="loading loading-spinner loading-xs"></span>
					{:else if pendingQuestion}
						Send Answer
					{:else if isInternal}
						Post Internal Note
					{:else}
						Add Comment
					{/if}
				</button>
			</div>
		{/if}
	</div>
	{/if}
</div>
