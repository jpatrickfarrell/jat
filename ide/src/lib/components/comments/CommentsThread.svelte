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
	import { onMount } from 'svelte';
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

	onMount(load);

	$effect(() => {
		if (taskId) load();
	});

	$effect(() => {
		onPendingQuestionChange?.(pendingQuestion !== null);
	});

	async function submitOption(optionText: string) {
		if (submitting) return;
		draft = optionText;
		await submit();
	}

	async function submit() {
		const text = draft.trim();
		if (!text || submitting) return;
		submitting = true;
		submitError = null;
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
				}),
			});
			if (!res.ok) {
				const msg = await res.json().catch(() => ({}));
				throw new Error(msg.error || `HTTP ${res.status}`);
			}
			const data = await res.json();
			comments = [...comments, data.comment];
			draft = '';
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
		}
	}
</script>

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
							<div class="flex items-center gap-2 mb-1">
								<span class="text-[10px] font-semibold uppercase tracking-wide text-warning">
									Question from {c.author || 'agent'}
								</span>
								{#if c.session_id}
									<span class="badge badge-xs badge-warning">Waiting for your answer</span>
								{/if}
							</div>
							<p class="leading-relaxed whitespace-pre-wrap break-words">{c.text}</p>
							<p class="opacity-40 text-[10px] mt-1">{formatTime(c.created_at)}</p>
						</div>
					</div>
				{:else if c.comment_type === 'answer'}
					<!-- answer: reply bubble right-aligned, user avatar -->
					<div class="flex gap-2 items-start flex-row-reverse">
						<div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-primary/15 text-primary">
							<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
							</svg>
						</div>
						<div class="max-w-[75%] rounded-2xl rounded-tr-sm px-3 py-1.5 border bg-primary/8 border-primary/20 text-primary/90">
							<p class="leading-relaxed whitespace-pre-wrap break-words">{c.text}</p>
							<p class="opacity-40 text-[10px] mt-0.5 text-right">{formatTime(c.created_at)}</p>
						</div>
					</div>
				{:else}
					<!-- note (default): subdued, no avatar prominence -->
					<div class="flex gap-2 items-start">
						<div class="flex-1 rounded-lg border px-3 py-1.5 bg-base-200 border-base-300">
							<div class="flex items-center gap-1.5 mb-0.5">
								<span class="text-[10px] font-medium text-base-content/60">
									{c.author || 'unknown'}
								</span>
								<span class="text-[10px] text-base-content/40">
									· {formatTime(c.created_at)}
								</span>
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
				class="textarea textarea-bordered textarea-sm w-full resize-none text-sm"
				rows="2"
				placeholder={pendingQuestion ? 'Type your answer… (Ctrl+Enter to send)' : 'Add a comment… (Ctrl+Enter to send)'}
				bind:value={draft}
				onkeydown={handleKey}
				disabled={submitting}
				use:richPaste
			></textarea>
			{#if submitError}
				<p class="text-xs text-error">{submitError}</p>
			{/if}
			<div class="flex justify-end">
				<button
					type="button"
					class="btn btn-primary btn-xs"
					disabled={submitting || !draft.trim()}
					onclick={submit}
				>
					{#if submitting}
						<span class="loading loading-spinner loading-xs"></span>
					{:else if pendingQuestion}
						Send Answer
					{:else}
						Add Comment
					{/if}
				</button>
			</div>
		{/if}
	</div>
	{/if}
</div>
