<script lang="ts">
	/**
	 * MarksCommandLine — minimal vim-style ex-command prompt.
	 *
	 * Press `:` (when not editing in an input/textarea/contenteditable) to
	 * open a small floating command line at the bottom of the viewport.
	 * Supports the two commands referenced by the marks task:
	 *
	 *   :delm <letter>   delete a single mark
	 *   :delmm           delete all marks
	 *
	 * Enter executes, Escape (or empty submit) cancels. We deliberately
	 * keep the surface tiny — this is *not* a full vim ex-mode shim.
	 */
	import { tick } from 'svelte';
	import { deleteMark, clearAllMarks } from '$lib/stores/marks.svelte';

	let open = $state(false);
	let buffer = $state('');
	let feedback = $state<{ kind: 'ok' | 'err'; text: string } | null>(null);
	let inputEl: HTMLInputElement | null = null;
	let feedbackTimer: ReturnType<typeof setTimeout> | null = null;

	function isEditingTarget(target: EventTarget | null): boolean {
		if (!(target instanceof HTMLElement)) return false;
		const tag = target.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
		return target.isContentEditable;
	}

	function showFeedback(kind: 'ok' | 'err', text: string) {
		feedback = { kind, text };
		if (feedbackTimer) clearTimeout(feedbackTimer);
		feedbackTimer = setTimeout(() => { feedback = null; feedbackTimer = null; }, 2000);
	}

	function execute(raw: string) {
		const trimmed = raw.trim();
		if (!trimmed) return;

		// :delmm — delete all marks
		if (trimmed === 'delmm') {
			clearAllMarks();
			showFeedback('ok', 'All marks cleared');
			return;
		}

		// :delm <letter> — delete one mark
		const m = trimmed.match(/^delm\s+([a-z])$/i);
		if (m) {
			const letter = m[1].toLowerCase();
			if (deleteMark(letter)) {
				showFeedback('ok', `Mark '${letter}' deleted`);
			} else {
				showFeedback('err', `No mark '${letter}'`);
			}
			return;
		}

		showFeedback('err', `Unknown command: :${trimmed}`);
	}

	async function openPrompt() {
		open = true;
		buffer = '';
		await tick();
		inputEl?.focus();
	}

	function closePrompt() {
		open = false;
		buffer = '';
	}

	function onSubmit(e: Event) {
		e.preventDefault();
		const input = buffer;
		closePrompt();
		execute(input);
	}

	function onKeydown(e: KeyboardEvent) {
		// Only the global trigger here; in-prompt keys are handled by the
		// <input> element's own onkeydown. Note: `:` is Shift+; on US
		// keyboards, so we cannot bail on shiftKey — only modifier keys
		// that change the meaning (Ctrl/Meta/Alt) disqualify the press.
		if (open) return;
		if (e.ctrlKey || e.metaKey || e.altKey) return;
		if (e.key !== ':') return;
		if (isEditingTarget(e.target)) return;
		e.preventDefault();
		openPrompt();
	}

	function onInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			closePrompt();
		}
	}

	$effect(() => {
		// Capture phase so we get `:` before route-level keydown handlers.
		window.addEventListener('keydown', onKeydown, true);
		return () => window.removeEventListener('keydown', onKeydown, true);
	});
</script>

{#if open}
	<form class="mcl-bar" onsubmit={onSubmit} role="search" aria-label="Marks command line">
		<span class="mcl-prefix">:</span>
		<input
			bind:this={inputEl}
			bind:value={buffer}
			onkeydown={onInputKeydown}
			class="mcl-input"
			type="text"
			autocomplete="off"
			autocorrect="off"
			autocapitalize="off"
			spellcheck="false"
			placeholder="delm a   |   delmm"
			aria-label="Marks command"
		/>
	</form>
{/if}

{#if feedback}
	<div class="mcl-toast" class:mcl-toast-err={feedback.kind === 'err'} role="status">
		{feedback.text}
	</div>
{/if}

<style>
	.mcl-bar {
		position: fixed;
		left: 50%;
		bottom: 1.5rem;
		transform: translateX(-50%);
		z-index: 70;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.45rem 0.7rem;
		min-width: 18rem;
		max-width: 80vw;
		background: oklch(0.16 0.02 250);
		border: 1px solid oklch(0.32 0.03 250);
		border-radius: 0.5rem;
		box-shadow: 0 12px 32px oklch(0 0 0 / 0.55);
	}

	.mcl-prefix {
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		color: oklch(0.78 0.05 200);
		font-weight: 600;
	}

	.mcl-input {
		flex: 1;
		min-width: 0;
		background: transparent;
		border: none;
		outline: none;
		color: oklch(0.94 0.02 250);
		font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
		font-size: 0.85rem;
	}

	.mcl-input::placeholder {
		color: oklch(0.50 0.04 250);
	}

	.mcl-toast {
		position: fixed;
		left: 50%;
		bottom: 1.5rem;
		transform: translateX(-50%);
		z-index: 71;
		padding: 0.4rem 0.8rem;
		background: oklch(0.30 0.05 145);
		color: oklch(0.96 0.04 145);
		border: 1px solid oklch(0.45 0.10 145);
		border-radius: 0.4rem;
		font-size: 0.8rem;
		box-shadow: 0 8px 22px oklch(0 0 0 / 0.45);
		animation: mcl-toast-fade 2s ease-out forwards;
	}

	.mcl-toast-err {
		background: oklch(0.30 0.07 25);
		color: oklch(0.96 0.06 25);
		border-color: oklch(0.50 0.13 25);
	}

	@keyframes mcl-toast-fade {
		0%   { opacity: 0; transform: translate(-50%, 8px); }
		10%  { opacity: 1; transform: translate(-50%, 0); }
		80%  { opacity: 1; transform: translate(-50%, 0); }
		100% { opacity: 0; transform: translate(-50%, -4px); }
	}

	@media (prefers-reduced-motion: reduce) {
		.mcl-toast { animation: none; }
	}
</style>
