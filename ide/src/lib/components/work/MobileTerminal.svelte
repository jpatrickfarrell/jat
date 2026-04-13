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
	 * Both question surfaces render through QuestionPanel so they share the
	 * same chrome, palette, and dismiss affordance. They differ only in the
	 * interactive body (free-text answer vs TUI navigation).
	 *
	 * Deliberately excludes: minimap, event stack, token tracking, keyboard shortcuts,
	 * confirm modals, sparklines, and all other desktop-only machinery.
	 */

	import { onMount, onDestroy } from 'svelte';
	import { ansiToHtmlWithLinks } from '$lib/utils/ansiToHtml';
	import { SESSION_STATE_VISUALS } from '$lib/config/statusColors';
	import { mobileSurface } from '$lib/config/mobileSurface';
	import QuestionPanel from './mobile/QuestionPanel.svelte';
	import OptionButton from './mobile/OptionButton.svelte';
	import Spinner from './mobile/Spinner.svelte';
	import PromptInput from '$lib/components/quick-commands/PromptInput.svelte';
	import EventStack from './EventStack.svelte';
	import { errorToast } from '$lib/stores/toasts.svelte';
	import type { SuggestedTaskWithState } from '$lib/types/signals';
	import { delay } from '$lib/utils/async';

	const input = SESSION_STATE_VISUALS['needs-input'];

	let {
		sessionName = '',
		output = '',
		task = null as { id?: string; title?: string } | null,
		sessionState = '' as string,
		availableProjects = [] as string[],
		defaultProject = '',
		onSendInput = undefined as ((text: string, type: 'text' | 'key') => Promise<void>) | undefined,
		onCleanup = undefined as (() => void | Promise<void>) | undefined,
		onComplete = undefined as (() => void | Promise<void>) | undefined,
		onViewTask = undefined as ((taskId: string) => void) | undefined,
		onCreateTasks = undefined as ((tasks: SuggestedTaskWithState[]) => Promise<{ success: { title: string; taskId?: string }[]; failed: { title: string; error: string }[] }>) | undefined,
		onCreateAndStartTasks = undefined as ((tasks: SuggestedTaskWithState[]) => Promise<{ success: { title: string; taskId?: string }[]; failed: { title: string; error: string }[] }>) | undefined,
		onOptimisticAnswer = undefined as ((state: string | null) => void) | undefined
	}: {
		sessionName?: string;
		output?: string;
		task?: { id?: string; title?: string } | null;
		sessionState?: string;
		availableProjects?: string[];
		defaultProject?: string;
		onSendInput?: (text: string, type: 'text' | 'key') => Promise<void>;
		onCleanup?: () => void | Promise<void>;
		onComplete?: () => void | Promise<void>;
		onViewTask?: (taskId: string) => void;
		onCreateTasks?: (tasks: SuggestedTaskWithState[]) => Promise<{ success: { title: string; taskId?: string }[]; failed: { title: string; error: string }[] }>;
		onCreateAndStartTasks?: (tasks: SuggestedTaskWithState[]) => Promise<{ success: { title: string; taskId?: string }[]; failed: { title: string; error: string }[] }>;
		/** Called when a custom question answer is submitted (state='working') or rolled back (state=null). */
		onOptimisticAnswer?: (state: string | null) => void;
	} = $props();

	// Emit review signal for the active task
	async function emitReview() {
		if (!sessionName) return;
		try {
			await fetch(`/api/sessions/${encodeURIComponent(sessionName)}/signal`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					type: 'review',
					data: {
						taskId: task?.id || '',
						taskTitle: task?.title || '',
						summary: ['Work completed, ready for review']
					}
				}),
				signal: aborter.signal
			});
		} catch (e) {
			if ((e as Error).name !== 'AbortError') {
				console.error('[MobileTerminal] Failed to emit review signal:', e);
			}
		}
	}

	async function patchTask(taskId: string, body: Record<string, unknown>) {
		try {
			await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
				signal: aborter.signal
			});
		} catch (e) {
			if ((e as Error).name !== 'AbortError') {
				console.error('[MobileTerminal] PATCH failed:', e);
			}
		}
	}

	// ─── Lifecycle + network plumbing ───────────────────────────────────────────
	// AbortController shared by every in-flight fetch so unmount kills pending
	// requests cleanly and background polls can't race user actions after teardown.
	const aborter = new AbortController();
	let destroyed = false;

	// Reduced-motion preference: users with vestibular sensitivity get instant
	// scroll jumps instead of the default smooth auto-scroll behavior.
	const reduceMotion =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

	// ─── Terminal output ────────────────────────────────────────────────────────
	const renderedOutput = $derived(ansiToHtmlWithLinks(output));

	let scrollEl = $state<HTMLElement | null>(null);
	let autoScroll = true;

	$effect(() => {
		// Depend on renderedOutput so this re-runs when output changes
		const _ = renderedOutput;
		if (autoScroll && scrollEl) {
			if (reduceMotion) {
				scrollEl.scrollTop = scrollEl.scrollHeight;
			} else {
				requestAnimationFrame(() => {
					if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
				});
			}
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

	// Auto-grow textarea up to its CSS max-height. Resets to content height on
	// each input so removing lines also shrinks the field.
	function autoGrow(node: HTMLTextAreaElement) {
		const resize = () => {
			node.style.height = 'auto';
			node.style.height = `${node.scrollHeight}px`;
		};
		resize();
		node.addEventListener('input', resize);
		return { destroy() { node.removeEventListener('input', resize); } };
	}

	// Chip references for PromptInput instances
	let customRefs = $state<Array<{ path: string; name: string }>>([]);
	let otherRefs = $state<Array<{ path: string; name: string }>>([]);

	// ─── Smart question UI (AskUserQuestion) ────────────────────────────────────
	interface QuestionOption { label: string; description?: string; }
	interface Question { question: string; options: QuestionOption[]; multiSelect?: boolean; }
	interface QuestionData { active: boolean; questions: Question[]; }

	let questionData = $state<QuestionData | null>(null);
	let selectedOptions = $state(new Set<number>());
	let currentOptionIndex = $state(0);
	let isOtherMode = $state(false);
	let otherText = $state('');
	// `isBusy` is set while a TUI-key chain is in flight. Every user action in the
	// smart-question panel must check this flag — mobile double-taps produced
	// overlapping navigation sequences that selected the wrong option.
	let isBusy = $state(false);
	// Index of the option currently being acted on (for inline spinner feedback).
	// -1 = no active option; Submit/Other use sentinels handled separately.
	let activeOptionIndex = $state<number>(-1);
	let activeAction = $state<'option' | 'submit' | 'other' | null>(null);
	// Last attempted action, so the retry button can re-run it verbatim.
	let lastSmartAction = $state<(() => void) | null>(null);
	let smartError = $state<string | null>(null);
	// Suppress background polls briefly after a local clear so the just-answered
	// question doesn't flash back in before the server-side delete lands.
	let suppressFetchUntil = 0;
	let questionFailures = 0;
	let questionPollTimer: ReturnType<typeof setTimeout> | null = null;

	async function fetchQuestion() {
		if (!sessionName || destroyed || Date.now() < suppressFetchUntil) return;
		try {
			const r = await fetch(
				`/api/work/${encodeURIComponent(sessionName)}/question`,
				{ signal: aborter.signal }
			);
			if (!r.ok) throw new Error(`HTTP ${r.status}`);
			const data: QuestionData = await r.json();
			const newQ = data?.questions?.[0]?.question;
			const oldQ = questionData?.questions?.[0]?.question;
			if (newQ !== oldQ) {
				selectedOptions = new Set();
				currentOptionIndex = 0;
				isOtherMode = false;
				otherText = '';
				smartError = null;
			}
			questionData = data;
			questionFailures = 0;
		} catch (e) {
			if ((e as Error).name === 'AbortError') return;
			questionFailures++;
			// Poll errors are silent — only surface if we currently have a question
			// visible and the user might be confused.
			if (questionData?.active) smartError = 'Connection lost. Retrying…';
		}
	}

	function scheduleQuestionPoll() {
		if (destroyed) return;
		const delay = 3000 * Math.min(Math.pow(2, questionFailures), 4); // max 12s
		questionPollTimer = setTimeout(async () => {
			await fetchQuestion();
			scheduleQuestionPoll();
		}, delay);
	}

	async function clearQuestion() {
		suppressFetchUntil = Date.now() + 2000;
		questionData = null;
		isOtherMode = false;
		smartError = null;
		try {
			await fetch(
				`/api/work/${encodeURIComponent(sessionName)}/question`,
				{ method: 'DELETE', signal: aborter.signal }
			);
		} catch (e) {
			if ((e as Error).name !== 'AbortError') {
				// Delete failure is non-fatal — the server will clear the question
				// when it receives the TUI keystroke. No need to alarm the user.
			}
		}
	}

	async function navigateTo(targetIndex: number) {
		const delta = targetIndex - currentOptionIndex;
		const dir = delta > 0 ? 'down' : 'up';
		for (let i = 0; i < Math.abs(delta); i++) {
			if (destroyed) return;
			await onSendInput?.(dir, 'key');
			await delay(30);
		}
		currentOptionIndex = targetIndex;
		await delay(50);
	}

	// Wrap a user-initiated async chain so the UI is guaranteed to release the
	// busy flag even when the chain throws. All option buttons / Submit / Other
	// funnel through here.
	async function runExclusive(fn: () => Promise<void>) {
		if (isBusy) return;
		isBusy = true;
		smartError = null;
		try {
			await fn();
		} catch (e) {
			if ((e as Error).name !== 'AbortError') {
				smartError = 'Something went wrong sending your answer. Try again.';
			}
		} finally {
			isBusy = false;
		}
	}

	function selectOption(index: number) {
		if (!questionData?.questions?.[0]) return;
		const q = questionData.questions[0];
		const run = () => runExclusive(async () => {
			activeAction = 'option';
			activeOptionIndex = index;
			try {
				await navigateTo(index);
				if (q.multiSelect) {
					await onSendInput?.('space', 'key');
					const next = new Set(selectedOptions);
					if (next.has(index)) next.delete(index); else next.add(index);
					selectedOptions = next;
				} else {
					await onSendInput?.('enter', 'key');
					await clearQuestion();
				}
			} finally {
				activeOptionIndex = -1;
				activeAction = null;
			}
		});
		lastSmartAction = run;
		run();
	}

	function submitMultiSelect(optionCount: number) {
		const run = () => runExclusive(async () => {
			activeAction = 'submit';
			try {
				// Claude Code's TUI: options + "Type something" + "Submit" = index optionCount+1
				await navigateTo(optionCount + 1);
				await onSendInput?.('enter', 'key');
				await clearQuestion();
			} finally {
				activeAction = null;
			}
		});
		lastSmartAction = run;
		run();
	}

	function activateOther(optionCount: number) {
		const run = () => runExclusive(async () => {
			activeAction = 'other';
			try {
				await navigateTo(optionCount); // "Other" is right after the last option
				await onSendInput?.('enter', 'key');
				isOtherMode = true;
				otherText = '';
			} finally {
				activeAction = null;
			}
		});
		lastSmartAction = run;
		run();
	}

	function submitOther() {
		const text = otherText.trim();
		if (!text) return;
		const run = () => runExclusive(async () => {
			activeAction = 'submit';
			try {
				await onSendInput?.(text, 'text');
				isOtherMode = false;
				otherText = '';
				if (sessionName && typeof localStorage !== 'undefined') {
					localStorage.removeItem(`jat-draft-mobile-${sessionName}-smart-other`);
				}
				await clearQuestion();
			} finally {
				activeAction = null;
			}
		});
		lastSmartAction = run;
		run();
	}

	function retrySmart() {
		smartError = null;
		lastSmartAction?.();
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
	let customError = $state<string | null>(null);
	let isSubmittingCustom = $state(false);
	let customFailures = 0;
	let customPollTimer: ReturnType<typeof setTimeout> | null = null;

	// Draft persistence — debounce timers for autosave
	let customDraftTimer: ReturnType<typeof setTimeout> | null = null;
	let otherDraftTimer: ReturnType<typeof setTimeout> | null = null;

	// Autosave customInput draft (debounced 300ms)
	$effect(() => {
		const text = customInput;
		if (!sessionName || typeof localStorage === 'undefined') return;
		if (customDraftTimer) clearTimeout(customDraftTimer);
		customDraftTimer = setTimeout(() => {
			const key = `jat-draft-mobile-${sessionName}-custom-question`;
			if (text.trim()) {
				localStorage.setItem(key, text);
			} else {
				localStorage.removeItem(key);
			}
		}, 300);
	});

	// Autosave otherText draft (debounced 300ms)
	$effect(() => {
		const text = otherText;
		if (!sessionName || typeof localStorage === 'undefined') return;
		if (otherDraftTimer) clearTimeout(otherDraftTimer);
		otherDraftTimer = setTimeout(() => {
			const key = `jat-draft-mobile-${sessionName}-smart-other`;
			if (text.trim()) {
				localStorage.setItem(key, text);
			} else {
				localStorage.removeItem(key);
			}
		}, 300);
	});

	// Restore otherText draft when Other mode is activated
	$effect(() => {
		if (isOtherMode && sessionName && typeof localStorage !== 'undefined') {
			const saved = localStorage.getItem(`jat-draft-mobile-${sessionName}-smart-other`);
			if (saved) otherText = saved;
		}
	});

	async function fetchCustomQuestion() {
		if (!sessionName || destroyed) return;
		try {
			const r = await fetch(
				`/api/sessions/${encodeURIComponent(sessionName)}/custom-question`,
				{ signal: aborter.signal }
			);
			if (!r.ok) throw new Error(`HTTP ${r.status}`);
			const data = await r.json();
			customQuestion = data?.active ? data : null;
			if (customQuestion) customError = null;
			customFailures = 0;
		} catch (e) {
			if ((e as Error).name === 'AbortError') return;
			customFailures++;
			if (customQuestion?.active) customError = 'Connection lost. Retrying…';
		}
	}

	function scheduleCustomPoll() {
		if (destroyed) return;
		const delay = 5000 * Math.min(Math.pow(2, customFailures), 4); // max 20s
		customPollTimer = setTimeout(async () => {
			await fetchCustomQuestion();
			scheduleCustomPoll();
		}, delay);
	}

	async function answerCustom(answer: string) {
		if (!sessionName || isSubmittingCustom) return;
		isSubmittingCustom = true;
		customError = null;

		// Optimistic: dismiss the question immediately so the UI responds without waiting for the server.
		// Snapshot for rollback in case the POST fails.
		const snapshot = customQuestion;
		customQuestion = null;
		customInput = '';
		if (sessionName && typeof localStorage !== 'undefined') {
			localStorage.removeItem(`jat-draft-mobile-${sessionName}-custom-question`);
		}
		onOptimisticAnswer?.('working');

		try {
			const r = await fetch(`/api/sessions/${encodeURIComponent(sessionName)}/custom-question`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ answer }),
				signal: aborter.signal
			});
			if (!r.ok) throw new Error(`HTTP ${r.status}`);
			// Success — optimistic clear was correct, nothing more to do.
		} catch (e) {
			if ((e as Error).name !== 'AbortError') {
				// Rollback: restore the question panel and the typed answer so the user can retry.
				customQuestion = snapshot;
				customInput = answer;
				onOptimisticAnswer?.(null);
				errorToast('Answer failed to send', 'Check connection and try again');
			}
		} finally {
			isSubmittingCustom = false;
		}
	}

	onMount(() => {
		fetchQuestion();
		scheduleQuestionPoll();
		fetchCustomQuestion();
		scheduleCustomPoll();
		// Restore custom question input draft
		if (sessionName && typeof localStorage !== 'undefined') {
			const saved = localStorage.getItem(`jat-draft-mobile-${sessionName}-custom-question`);
			if (saved) customInput = saved;
		}
		// Restore smart-question Other draft (available when user next activates Other mode)
		// (restored reactively via $effect when isOtherMode becomes true)
	});

	onDestroy(() => {
		destroyed = true;
		aborter.abort();
		if (questionPollTimer) clearTimeout(questionPollTimer);
		if (customPollTimer) clearTimeout(customPollTimer);
		if (customDraftTimer) clearTimeout(customDraftTimer);
		if (otherDraftTimer) clearTimeout(otherDraftTimer);
	});
</script>

<div class="mobile-terminal flex flex-col h-full min-h-0">
	<!-- Terminal output area -->
	<div
		bind:this={scrollEl}
		class="flex-1 overflow-y-auto min-h-0"
		style="background: {mobileSurface.terminalBg}; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; min-height: 140px;"
		onscroll={handleScroll}
	>
		<pre
			class="m-0 px-3 py-2 text-[0.8125rem] leading-relaxed"
			style="font-family: var(--terminal-font, 'JetBrains Mono', 'Fira Code', monospace); white-space: pre-wrap; word-break: break-word; color: {mobileSurface.terminalFg}; min-height: 100%;"
		>{@html renderedOutput}</pre>
	</div>

	<!-- Event Timeline Stack: signal history, action buttons, suggested tasks, needs_input cards -->
	<!-- Kept outside bottom-stack so its absolute-positioned popup can expand freely -->
	{#if sessionName}
		<div class="relative px-2 bg-base-300 flex-shrink-0">
			<EventStack
				{sessionName}
				maxEvents={20}
				pollInterval={5000}
				autoExpand={sessionState === 'completed'}
				onCleanup={() => onCleanup?.()}
				onComplete={() => onComplete?.()}
				onReview={emitReview}
				onTaskClick={(id) => onViewTask?.(id)}
				onCreateTasks={onCreateTasks}
				onCreateAndStartTasks={onCreateAndStartTasks}
				{availableProjects}
				{defaultProject}
				onSelectOption={async (optionId) => { await onSendInput?.(optionId, 'text'); }}
				onSubmitText={async (text) => { await onSendInput?.(text, 'text'); }}
				onApplyRename={(taskId, newTitle) => patchTask(taskId, { title: newTitle })}
				onApplyLabels={(taskId, labels) => patchTask(taskId, { labels })}
			/>
		</div>
	{/if}

	<!-- Question panels capped so they can't push the terminal off-screen -->
	<div class="bottom-stack">
	<!-- Custom question (jat-signal question) -->
	{#if customQuestion?.active && customQuestion.question}
		<QuestionPanel
			question={customQuestion.question}
			onDismiss={() => { customQuestion = null; customInput = ''; customError = null; }}
		>
			{#if customQuestion.options?.length}
				<div class="flex flex-wrap gap-1.5 mb-2">
					{#each customQuestion.options as opt}
						<OptionButton disabled={isSubmittingCustom} onClick={() => answerCustom(opt)}>{opt}</OptionButton>
					{/each}
				</div>
			{/if}
			<div class="flex gap-2 items-end">
				<div class="flex-1 min-w-0">
					<PromptInput
						bind:value={customInput}
						bind:references={customRefs}
						project={defaultProject}
						placeholder="Type response… (Shift+Enter for newline)"
						rows={1}
						compact={true}
						disabled={isSubmittingCustom}
						onkeydown={(e) => {
							if (e.key === 'Enter' && !e.shiftKey && customInput.trim() && !isSubmittingCustom) {
								e.preventDefault();
								answerCustom(customInput);
							}
						}}
					/>
				</div>
				<button
					class="btn btn-success"
					style="min-height: 2.75rem; min-width: 2.75rem;"
					disabled={isSubmittingCustom}
					use:directClick={() => { if (customInput.trim() && !isSubmittingCustom) answerCustom(customInput); }}
				>{#if isSubmittingCustom}<Spinner />{:else}Send{/if}</button>
			</div>
			{#if customError}
				<div class="mt-2 flex items-center gap-2 text-xs" style="color: {input.textColor};" role="alert">
					<span class="flex-1">{customError}</span>
					<button
						class="btn btn-xs btn-ghost"
						style="min-height: 1.75rem; color: {input.textColor};"
						disabled={isSubmittingCustom}
						use:directClick={() => { if (customInput.trim()) answerCustom(customInput); }}
					>Retry</button>
				</div>
			{/if}
		</QuestionPanel>
	{/if}

	<!-- Smart question UI (AskUserQuestion) -->
	{#if questionData?.active && questionData.questions?.length}
		{@const q = questionData.questions[0]}
		<QuestionPanel question={q.question} badge="?" onDismiss={clearQuestion}>
			{#if isOtherMode}
				<div class="flex gap-2 items-end">
					<div class="flex-1 min-w-0">
						<PromptInput
							bind:value={otherText}
							bind:references={otherRefs}
							project={defaultProject}
							placeholder="Type your response… (Shift+Enter for newline)"
							rows={1}
							compact={true}
							onkeydown={(e) => {
								if (e.key === 'Enter' && !e.shiftKey && otherText.trim()) {
									e.preventDefault();
									submitOther();
								} else if (e.key === 'Escape') { isOtherMode = false; }
							}}
						/>
					</div>
					<button
						class="btn btn-success"
						style="min-height: 2.75rem; min-width: 2.75rem;"
						disabled={isBusy}
						use:directClick={submitOther}
					>{#if isBusy}<Spinner />{:else}Send{/if}</button>
					<button
						class="btn btn-ghost"
						style="color: {mobileSurface.textMuted}; min-height: 2.75rem; min-width: 2.75rem;"
						use:directClick={() => { isOtherMode = false; }}
						aria-label="Cancel free-text"
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M18 6 6 18M6 6l12 12" />
						</svg>
					</button>
				</div>
			{:else}
				<div class="flex flex-wrap gap-1.5">
					{#each q.options as opt, i}
						<OptionButton
							variant={selectedOptions.has(i) ? 'selected' : 'default'}
							title={opt.description}
							disabled={isBusy}
							busy={activeAction === 'option' && activeOptionIndex === i}
							onClick={() => selectOption(i)}
						>
							{#if q.multiSelect}
								{#if selectedOptions.has(i)}
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
										<rect x="3" y="3" width="18" height="18" rx="3" />
										<path d="m8 12 3 3 5-6" />
									</svg>
								{:else}
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
										<rect x="3" y="3" width="18" height="18" rx="3" />
									</svg>
								{/if}
							{/if}
							{opt.label}
						</OptionButton>
					{/each}

					<OptionButton
						variant="ghost"
						disabled={isBusy}
						busy={activeAction === 'other'}
						onClick={() => activateOther(q.options.length)}
					>
						Other
					</OptionButton>

					{#if q.multiSelect && selectedOptions.size > 0}
						<button
							class="btn btn-success gap-1"
							style="min-height: 2.75rem;"
							disabled={isBusy}
							use:directClick={() => submitMultiSelect(q.options.length)}
						>Done ({selectedOptions.size})</button>
					{/if}
				</div>
			{/if}
			{#if smartError}
				<div class="mt-2 flex items-center gap-2 text-xs" style="color: {input.textColor};" role="alert">
					<span class="flex-1">{smartError}</span>
					{#if lastSmartAction}
						<button
							class="btn btn-xs btn-ghost"
							style="min-height: 1.75rem; color: {input.textColor};"
							disabled={isBusy}
							use:directClick={retrySmart}
						>Retry</button>
					{/if}
				</div>
			{/if}
		</QuestionPanel>
	{/if}
	</div> <!-- /.bottom-stack -->
</div>

<style>
	.mobile-terminal {
		contain: strict; /* hint browser to isolate layout/paint */
	}

	.bottom-stack {
		max-height: 60vh;
		overflow-y: auto;
		flex-shrink: 0;
		-webkit-overflow-scrolling: touch;
		overscroll-behavior: contain;
	}
</style>
