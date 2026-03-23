<script lang="ts">
	let {
		taskId = $bindable(''),
		taskTitle = $bindable(''),
		isOpen = $bindable(false),
		onComplete = () => {}
	}: {
		taskId: string;
		taskTitle: string;
		isOpen: boolean;
		onComplete?: () => void;
	} = $props();

	let message = $state('');
	let sending = $state(false);
	let error = $state('');
	let closeTask = $state(true);

	function resetForm() {
		message = '';
		sending = false;
		error = '';
		closeTask = true;
	}

	function handleClose() {
		if (sending) return;
		isOpen = false;
		resetForm();
	}

	async function handleSend() {
		if (!message.trim() || message.trim().length < 5) {
			error = 'Reply must be at least 5 characters';
			return;
		}

		sending = true;
		error = '';

		try {
			const res = await fetch(`/api/feedback/reports/${encodeURIComponent(taskId)}/reply`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: message.trim(), close: closeTask })
			});

			const data = await res.json();

			if (!res.ok || !data.ok) {
				error = data.error || 'Failed to send reply';
				sending = false;
				return;
			}

			isOpen = false;
			resetForm();
			onComplete();
		} catch (err: any) {
			error = err.message || 'Network error';
			sending = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
		if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			handleSend();
		}
	}

	// Strip [Feedback] prefix for display
	const displayTitle = $derived(taskTitle.replace(/^\[Feedback\]\s*/, ''));
</script>

{#if isOpen}
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center"
	role="dialog"
	aria-modal="true"
	onkeydown={handleKeydown}
>
	<!-- Overlay -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="absolute inset-0 bg-black/60" onclick={handleClose}></div>

	<!-- Modal -->
	<div class="relative w-full max-w-lg mx-4 rounded-xl border shadow-2xl"
		style="background: oklch(0.18 0.02 250); border-color: oklch(0.28 0.02 250);">
		<!-- Header -->
		<div class="flex items-center justify-between px-5 py-3.5 border-b"
			style="border-color: oklch(0.24 0.02 250);">
			<div class="flex items-center gap-2.5">
				<span class="text-lg" style="color: oklch(0.75 0.15 200);">Reply to Feedback</span>
			</div>
			<button
				class="btn btn-ghost btn-sm btn-circle"
				onclick={handleClose}
				disabled={sending}
			>
				<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Body -->
		<div class="px-5 py-4">
			<!-- Task info -->
			<div class="mb-3 flex items-center gap-2">
				<span class="badge badge-sm font-mono" style="background: oklch(0.25 0.02 250); color: oklch(0.65 0.05 250);">{taskId}</span>
				<span class="text-sm truncate" style="color: oklch(0.75 0.02 250);">{displayTitle}</span>
			</div>

			<!-- Message textarea -->
			<textarea
				class="w-full rounded-lg px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2"
				style="background: oklch(0.14 0.01 250); border: 1px solid oklch(0.26 0.02 250); color: oklch(0.88 0.02 250); min-height: 120px; focus-ring-color: oklch(0.60 0.15 200);"
				placeholder="Ask for clarification, provide guidance, or explain what's needed..."
				bind:value={message}
				disabled={sending}
				autofocus
			></textarea>

			{#if error}
				<div class="mt-2 text-sm rounded px-3 py-1.5" style="background: oklch(0.30 0.08 25 / 0.3); color: oklch(0.75 0.15 25);">
					{error}
				</div>
			{/if}

			<!-- Close task toggle -->
			<label class="flex items-center gap-2 mt-3 cursor-pointer select-none">
				<input
					type="checkbox"
					class="checkbox checkbox-sm"
					bind:checked={closeTask}
					disabled={sending}
				/>
				<span class="text-sm" style="color: oklch(0.65 0.02 250);">
					Close task after sending
				</span>
			</label>
			<p class="text-xs mt-1 ml-7" style="color: oklch(0.50 0.02 250);">
				{closeTask
					? 'Task will be closed as "Needs clarification". User can submit new feedback.'
					: 'Task stays open. Reply is added to notes and thread.'}
			</p>
		</div>

		<!-- Footer -->
		<div class="flex items-center justify-end gap-2 px-5 py-3 border-t"
			style="border-color: oklch(0.24 0.02 250);">
			<button
				class="btn btn-sm btn-ghost"
				onclick={handleClose}
				disabled={sending}
			>
				Cancel
			</button>
			<button
				class="btn btn-sm"
				style="background: oklch(0.55 0.15 200); color: oklch(0.95 0.02 200); border: none;"
				onclick={handleSend}
				disabled={sending || !message.trim()}
			>
				{#if sending}
					<span class="loading loading-spinner loading-xs"></span>
					Sending...
				{:else}
					Send Reply
				{/if}
			</button>
		</div>

		<!-- Keyboard hint -->
		<div class="px-5 pb-2.5 text-right">
			<span class="text-xs" style="color: oklch(0.42 0.02 250);">
				Ctrl+Enter to send
			</span>
		</div>
	</div>
</div>
{/if}
