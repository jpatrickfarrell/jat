<script lang="ts">
	/**
	 * MobileTerminal — lightweight terminal output + question UI for MobileSessionDrawer.
	 *
	 * Replaces SessionCard (mode="agent", headerless, hideInput) on mobile.
	 * Contains only what mobile needs:
	 *   - ANSI-rendered terminal output with auto-scroll
	 *   - Smart question UI (AskUserQuestion buttons)
	 *   - Custom question UI (jat-signal question)
	 *
	 * Deliberately excludes: minimap, event stack, token tracking, keyboard shortcuts,
	 * confirm modals, sparklines, and all other desktop-only machinery.
	 */

	import { onMount, onDestroy } from 'svelte';
	import { ansiToHtmlWithLinks } from '$lib/utils/ansiToHtml';

	let {
		sessionName = '',
		output = '',
		onSendInput = undefined as ((text: string, type: 'text' | 'key') => Promise<void>) | undefined
	}: {
		sessionName?: string;
		output?: string;
		onSendInput?: (text: string, type: 'text' | 'key') => Promise<void>;
	} = $props();

	// ─── Terminal output ────────────────────────────────────────────────────────
	const renderedOutput = $derived(ansiToHtmlWithLinks(output));

	let scrollEl = $state<HTMLElement | null>(null);
	let autoScroll = true;

	$effect(() => {
		// Depend on renderedOutput so this re-runs when output changes
		const _ = renderedOutput;
		if (autoScroll && scrollEl) {
			requestAnimationFrame(() => {
				if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
			});
		}
	});

	function handleScroll() {
		if (!scrollEl) return;
		const distFromBottom = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;
		autoScroll = distFromBottom < 100;
	}

	// ─── Portal-safe event actions ──────────────────────────────────────────────
	// This component is mounted inside MobileSessionDrawer's portal, so Svelte's
	// event delegation doesn't reach it. Use direct addEventListener bindings.

	function directClick(node: HTMLElement, handler: (() => void) | ((e: MouseEvent) => void)) {
		node.addEventListener('click', handler as EventListener);
		return { destroy() { node.removeEventListener('click', handler as EventListener); } };
	}

	function directKeydown(node: HTMLElement, handler: (e: KeyboardEvent) => void) {
		node.addEventListener('keydown', handler);
		return { destroy() { node.removeEventListener('keydown', handler); } };
	}

	// ─── Smart question UI (AskUserQuestion) ────────────────────────────────────
	interface QuestionOption { label: string; description?: string; }
	interface Question { question: string; options: QuestionOption[]; multiSelect?: boolean; }
	interface QuestionData { active: boolean; questions: Question[]; }

	let questionData = $state<QuestionData | null>(null);
	let selectedOptions = $state(new Set<number>());
	let currentOptionIndex = $state(0);
	let isOtherMode = $state(false);
	let otherText = $state('');
	let suppressFetch = false;
	let questionPollTimer: ReturnType<typeof setInterval> | null = null;

	async function fetchQuestion() {
		if (!sessionName || suppressFetch) return;
		try {
			const r = await fetch(`/api/work/${encodeURIComponent(sessionName)}/question`);
			if (!r.ok) return;
			const data: QuestionData = await r.json();
			const newQ = data?.questions?.[0]?.question;
			const oldQ = questionData?.questions?.[0]?.question;
			if (newQ !== oldQ) {
				selectedOptions = new Set();
				currentOptionIndex = 0;
				isOtherMode = false;
				otherText = '';
			}
			questionData = data;
		} catch { /* ignore */ }
	}

	async function clearQuestion() {
		suppressFetch = true;
		questionData = null;
		isOtherMode = false;
		try {
			await fetch(`/api/work/${encodeURIComponent(sessionName)}/question`, { method: 'DELETE' });
		} catch { /* ignore */ }
		setTimeout(() => { suppressFetch = false; }, 2000);
	}

	function delay(ms: number) { return new Promise<void>(r => setTimeout(r, ms)); }

	async function navigateTo(targetIndex: number) {
		const delta = targetIndex - currentOptionIndex;
		const dir = delta > 0 ? 'down' : 'up';
		for (let i = 0; i < Math.abs(delta); i++) {
			await onSendInput?.(dir, 'key');
			await delay(30);
		}
		currentOptionIndex = targetIndex;
		await delay(50);
	}

	async function selectOption(index: number) {
		if (!questionData?.questions?.[0]) return;
		const q = questionData.questions[0];
		await navigateTo(index);
		if (q.multiSelect) {
			await onSendInput?.('space', 'key');
			const next = new Set(selectedOptions);
			if (next.has(index)) next.delete(index); else next.add(index);
			selectedOptions = next;
		} else {
			await onSendInput?.('enter', 'key');
			clearQuestion();
		}
	}

	async function submitMultiSelect(optionCount: number) {
		// Claude Code's TUI: options + "Type something" + "Submit" = index optionCount+1
		await navigateTo(optionCount + 1);
		await onSendInput?.('enter', 'key');
		clearQuestion();
	}

	async function activateOther(optionCount: number) {
		await navigateTo(optionCount); // "Other" is right after the last option
		await onSendInput?.('enter', 'key');
		isOtherMode = true;
		otherText = '';
	}

	async function submitOther() {
		if (!otherText.trim()) return;
		await onSendInput?.(otherText, 'text');
		isOtherMode = false;
		otherText = '';
		clearQuestion();
	}

	// ─── Custom question UI (jat-signal question) ───────────────────────────────
	interface CustomQuestion {
		active: boolean;
		question?: string;
		questionType?: string;
		options?: string[];
	}
	let customQuestion = $state<CustomQuestion | null>(null);
	let customInput = $state('');
	let customPollTimer: ReturnType<typeof setInterval> | null = null;

	async function fetchCustomQuestion() {
		if (!sessionName) return;
		try {
			const r = await fetch(`/api/sessions/${encodeURIComponent(sessionName)}/custom-question`);
			if (r.ok) {
				const data = await r.json();
				customQuestion = data?.active ? data : null;
			}
		} catch { /* ignore */ }
	}

	async function answerCustom(answer: string) {
		if (!sessionName) return;
		try {
			await fetch(`/api/sessions/${encodeURIComponent(sessionName)}/custom-question`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ answer })
			});
		} catch { /* ignore */ }
		customQuestion = null;
		customInput = '';
	}

	onMount(() => {
		fetchQuestion();
		questionPollTimer = setInterval(fetchQuestion, 3000);
		fetchCustomQuestion();
		customPollTimer = setInterval(fetchCustomQuestion, 5000);
	});

	onDestroy(() => {
		if (questionPollTimer) clearInterval(questionPollTimer);
		if (customPollTimer) clearInterval(customPollTimer);
	});
</script>

<div class="mobile-terminal flex flex-col h-full min-h-0">
	<!-- Terminal output area -->
	<div
		bind:this={scrollEl}
		class="flex-1 overflow-y-auto min-h-0"
		style="background: oklch(0.17 0.01 250); -webkit-overflow-scrolling: touch;"
		onscroll={handleScroll}
	>
		<pre
			class="m-0 px-3 py-2 text-[0.8125rem] leading-relaxed"
			style="font-family: var(--terminal-font, 'JetBrains Mono', 'Fira Code', monospace); white-space: pre-wrap; word-break: break-all; color: oklch(0.90 0.01 250); min-height: 100%;"
		>{@html renderedOutput}</pre>
	</div>

	<!-- Custom question (jat-signal question) -->
	{#if customQuestion?.active && customQuestion.question}
		<div class="flex-shrink-0 p-2 border-t border-base-300" style="background: oklch(0.20 0.05 200);">
			<div class="flex items-center gap-2 mb-2">
				<span class="text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0"
					style="background: oklch(0.32 0.12 200); color: oklch(0.90 0.05 200);">?</span>
				<span class="text-xs font-semibold" style="color: oklch(0.90 0.10 200);">{customQuestion.question}</span>
			</div>
			{#if customQuestion.options?.length}
				<div class="flex flex-wrap gap-1.5 mb-1">
					{#each customQuestion.options as opt}
						<button
							class="btn btn-xs"
							style="background: oklch(0.25 0.04 200); border-color: oklch(0.40 0.08 200); color: oklch(0.85 0.05 200);"
							use:directClick={() => answerCustom(opt)}
						>{opt}</button>
					{/each}
				</div>
			{/if}
			<div class="flex gap-2 mt-1">
				<input
					type="text"
					class="input input-xs input-bordered flex-1 text-xs"
					style="background: oklch(0.18 0.02 250); border-color: oklch(0.40 0.08 200); color: oklch(0.90 0.02 250);"
					placeholder="Type response…"
					bind:value={customInput}
					use:directKeydown={(e) => { if (e.key === 'Enter' && customInput.trim()) answerCustom(customInput); }}
				/>
				<button
					class="btn btn-xs btn-success"
					use:directClick={() => { if (customInput.trim()) answerCustom(customInput); }}
				>Send</button>
			</div>
		</div>
	{/if}

	<!-- Smart question UI (AskUserQuestion) -->
	{#if questionData?.active && questionData.questions?.length}
		{@const q = questionData.questions[0]}
		<div class="flex-shrink-0 p-2 border-t border-base-300" style="background: oklch(0.22 0.04 250);">
			<div class="flex items-start justify-between gap-2 mb-2">
				<div class="flex items-center gap-2 min-w-0 flex-1">
					<span class="text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0"
						style="background: oklch(0.35 0.10 200); color: oklch(0.90 0.05 200);">❓</span>
					<span class="text-xs font-semibold leading-snug" style="color: oklch(0.90 0.10 200);">{q.question}</span>
				</div>
				<button
					class="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full opacity-50 active:opacity-100 text-xs"
					style="color: oklch(0.65 0.02 250);"
					use:directClick={clearQuestion}
					aria-label="Dismiss"
				>✕</button>
			</div>

			{#if isOtherMode}
				<div class="flex gap-2">
					<input
						type="text"
						class="input input-xs input-bordered flex-1 text-xs"
						style="background: oklch(0.18 0.02 250); border-color: oklch(0.45 0.12 200); color: oklch(0.90 0.02 250);"
						placeholder="Type your response…"
						bind:value={otherText}
						use:directKeydown={(e) => {
							if (e.key === 'Enter' && otherText.trim()) submitOther();
							else if (e.key === 'Escape') { isOtherMode = false; }
						}}
					/>
					<button class="btn btn-xs btn-success" use:directClick={submitOther}>Send</button>
					<button class="btn btn-xs btn-ghost" style="color: oklch(0.65 0.02 250);"
						use:directClick={() => { isOtherMode = false; }}>✕</button>
				</div>
			{:else}
				<div class="flex flex-wrap gap-1.5">
					{#each q.options as opt, i}
						<button
							class="btn btn-xs gap-1"
							style={selectedOptions.has(i)
								? 'background: oklch(0.45 0.15 250); border-color: oklch(0.55 0.18 250); color: oklch(0.98 0.01 250);'
								: 'background: oklch(0.25 0.03 250); border-color: oklch(0.40 0.03 250); color: oklch(0.80 0.02 250);'}
							use:directClick={() => selectOption(i)}
							title={opt.description}
						>
							{#if q.multiSelect}<span class="text-[10px]">{selectedOptions.has(i) ? '☑' : '☐'}</span>{/if}
							{opt.label}
						</button>
					{/each}

					<button
						class="btn btn-xs btn-outline"
						style="background: oklch(0.20 0.04 45); border-color: oklch(0.45 0.10 45); color: oklch(0.80 0.08 45);"
						use:directClick={() => activateOther(q.options.length)}
					>Other</button>

					{#if q.multiSelect && selectedOptions.size > 0}
						<button
							class="btn btn-xs btn-success"
							use:directClick={() => submitMultiSelect(q.options.length)}
						>Done ({selectedOptions.size})</button>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.mobile-terminal {
		contain: strict; /* hint browser to isolate layout/paint */
	}
</style>
