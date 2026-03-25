<script lang="ts">
	/**
	 * MobileSessionFullscreen Component
	 *
	 * Fullscreen chat-style overlay for mobile session interaction.
	 * Slides up from bottom when tapping a mobile session card.
	 *
	 * Features:
	 * - Top bar: back button, agent avatar + name, task title, status badge
	 * - Middle: scrollable terminal output (full width/height)
	 * - Bottom: TerminalInput pinned at bottom with quick action pills
	 * - Keyboard-aware: input stays above virtual keyboard
	 * - Dismiss via back button
	 */

	import { onMount, onDestroy } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import AgentAvatar from '$lib/components/AgentAvatar.svelte';
	import StatusActionBadge from '$lib/components/work/StatusActionBadge.svelte';
	import TerminalInput from '$lib/components/work/TerminalInput.svelte';
	import { ansiToHtmlWithLinks } from '$lib/utils/ansiToHtml';
	import { getSessionStateVisual, type SessionState } from '$lib/config/statusColors';

	// Props
	let {
		sessionName = '',
		agentName = '',
		taskId = '',
		taskTitle = '',
		sessionState = 'idle' as SessionState,
		project = null as string | null,
		onClose = () => {},
		onAction = async (_actionId: string) => {},
		onViewTask = (_taskId: string) => {},
	}: {
		sessionName?: string;
		agentName?: string;
		taskId?: string;
		taskTitle?: string;
		sessionState?: SessionState;
		project?: string | null;
		onClose?: () => void;
		onAction?: (actionId: string) => Promise<void>;
		onViewTask?: (taskId: string) => void;
	} = $props();

	// Internal state
	let output = $state('');
	let inputText = $state('');
	let scrollRef: HTMLDivElement | null = null;
	let visible = $state(false);
	let pollInterval: ReturnType<typeof setInterval> | null = null;
	let autoScroll = $state(true);
	let terminalInputRef: { focus: () => void } | null = null;

	// Rendered HTML output
	const renderedOutput = $derived(ansiToHtmlWithLinks(output));

	// Status visual
	const stateVisual = $derived(getSessionStateVisual(sessionState));

	// Fetch terminal output
	async function fetchOutput() {
		try {
			const res = await fetch(`/api/work/${encodeURIComponent(sessionName)}/output?lines=500`);
			if (res.ok) {
				const data = await res.json();
				output = data.output || '';
				if (autoScroll) {
					requestAnimationFrame(() => {
						if (scrollRef) {
							scrollRef.scrollTop = scrollRef.scrollHeight;
						}
					});
				}
			}
		} catch (e) {
			// Silently fail - will retry on next poll
		}
	}

	// Send input to session
	async function handleSendInput(text: string, type: 'text' | 'key' = 'text'): Promise<void> {
		try {
			await fetch(`/api/work/${encodeURIComponent(sessionName)}/input`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type, input: text })
			});
			// Fetch output shortly after sending input
			setTimeout(fetchOutput, 100);
		} catch (e) {
			console.warn('[MobileFullscreen] Failed to send input:', e);
		}
	}

	// Handle scroll - detect user scrolling up
	function handleScroll() {
		if (!scrollRef) return;
		const { scrollTop, scrollHeight, clientHeight } = scrollRef;
		const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
		autoScroll = distanceFromBottom < 50;
	}

	// Scroll to bottom button
	function scrollToBottom() {
		if (scrollRef) {
			scrollRef.scrollTop = scrollRef.scrollHeight;
			autoScroll = true;
		}
	}

	// Slide-up transition
	function slideUp(node: HTMLElement, { duration = 300 }: { duration?: number } = {}) {
		return {
			duration,
			css: (t: number) => {
				const eased = cubicOut(t);
				return `transform: translateY(${(1 - eased) * 100}%)`;
			}
		};
	}

	onMount(() => {
		// Trigger entrance animation
		requestAnimationFrame(() => {
			visible = true;
		});

		// Focus input after slide-up transition completes
		setTimeout(() => {
			terminalInputRef?.focus();
		}, 350);

		// Initial fetch
		fetchOutput();

		// Poll for output updates
		pollInterval = setInterval(fetchOutput, 1000);

		// Prevent body scroll when overlay is open
		document.body.style.overflow = 'hidden';
	});

	onDestroy(() => {
		if (pollInterval) {
			clearInterval(pollInterval);
		}
		document.body.style.overflow = '';
	});

	function handleClose() {
		visible = false;
		setTimeout(onClose, 300); // Wait for exit animation
	}

	// Drag-and-drop state
	let isDragOver = $state(false);

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		const hasFiles = e.dataTransfer?.types.includes('Files');
		const hasJatImage = e.dataTransfer?.types.includes('application/x-jat-image');
		const hasJatText = e.dataTransfer?.types.includes('application/x-jat-text');
		const hasText = e.dataTransfer?.types.includes('text/plain');
		if (hasFiles || hasJatImage || hasJatText || hasText) {
			isDragOver = true;
			e.dataTransfer!.dropEffect = 'copy';
		}
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		const relatedTarget = e.relatedTarget as HTMLElement | null;
		if (!relatedTarget || !e.currentTarget || !(e.currentTarget as HTMLElement).contains(relatedTarget)) {
			isDragOver = false;
		}
	}

	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		const hasFiles = e.dataTransfer?.types.includes('Files');
		const hasJatImage = e.dataTransfer?.types.includes('application/x-jat-image');
		const hasJatText = e.dataTransfer?.types.includes('application/x-jat-text');
		const hasText = e.dataTransfer?.types.includes('text/plain');
		if (hasFiles || hasJatImage || hasJatText || hasText) {
			isDragOver = true;
		}
	}

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		isDragOver = false;

		// JAT image path (dragged from TaskDetailPane thumbnails)
		const jatImageData = e.dataTransfer?.getData('application/x-jat-image');
		if (jatImageData) {
			try {
				const imageInfo = JSON.parse(jatImageData);
				if (imageInfo.path) {
					// Send image path to session as input
					await handleSendInput(imageInfo.path, 'text');
					return;
				}
			} catch { /* fall through */ }
		}

		// JAT text data (dragged description/notes)
		const jatTextData = e.dataTransfer?.getData('application/x-jat-text');
		if (jatTextData) {
			try {
				const textInfo = JSON.parse(jatTextData);
				if (textInfo.content) {
					inputText = inputText.trim() ? inputText.trim() + '\n\n' + textInfo.content : textInfo.content;
					terminalInputRef?.focus();
					return;
				}
			} catch { /* fall through */ }
		}

		// Plain text path (fallback for image paths)
		const plainText = e.dataTransfer?.getData('text/plain');
		if (plainText && plainText.startsWith('/') && !e.dataTransfer?.files?.length) {
			const isImagePath = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(plainText);
			if (isImagePath) {
				await handleSendInput(plainText, 'text');
				return;
			}
		}

		// File drops - upload and attach to task
		if (e.dataTransfer?.files?.length) {
			for (const file of Array.from(e.dataTransfer.files)) {
				await uploadAndAttachFile(file);
			}
		}
	}

	async function uploadAndAttachFile(file: File) {
		const formData = new FormData();
		formData.append('file', file, file.name);
		formData.append('sessionName', sessionName);
		formData.append('filename', file.name);

		try {
			const res = await fetch('/api/work/upload-image', { method: 'POST', body: formData });
			if (!res.ok) return;
			const { filePath } = await res.json();

			// Attach to task if we have one
			if (taskId) {
				const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
				await fetch(`/api/tasks/${taskId}/image`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ path: filePath, id: fileId, action: 'add' })
				});
			}

			// Send file path to the session
			await handleSendInput(filePath, 'text');
		} catch (e) {
			console.warn('[MobileFullscreen] Failed to upload file:', e);
		}
	}

	// Handle back button / Escape
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if visible}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div
		class="fullscreen-backdrop"
		onclick={handleClose}
	></div>

	<!-- Fullscreen Panel -->
	<div
		class="fullscreen-panel"
		transition:slideUp={{ duration: 300 }}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondragenter={handleDragEnter}
		ondrop={handleDrop}
	>
		<!-- File drop overlay -->
		{#if isDragOver}
			<div class="drop-overlay">
				<div class="drop-content">
					<svg class="w-10 h-10" style="color: oklch(0.75 0.15 250);" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
					</svg>
					<span class="drop-text">Drop to attach</span>
				</div>
			</div>
		{/if}

		<!-- Top Bar -->
		<div class="fullscreen-topbar">
			<button class="back-btn" onclick={handleClose} aria-label="Close">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
				</svg>
			</button>

			<div class="topbar-info" onclick={() => taskId && onViewTask(taskId)}>
				<AgentAvatar name={agentName} size={28} showRing={true} sessionState={sessionState} />
				<div class="topbar-text">
					<span class="topbar-agent">{agentName}</span>
					<span class="topbar-task" title={taskTitle}>{taskTitle || taskId || 'No task'}</span>
				</div>
			</div>

			<div class="topbar-status" onclick={(e) => e.stopPropagation()}>
				<StatusActionBadge
					{sessionState}
					stacked={true}
					{sessionName}
					alignRight={true}
					showCommands={true}
					{onAction}
					task={taskId ? { id: taskId, issue_type: undefined, priority: undefined } : undefined}
					{project}
				/>
			</div>
		</div>

		<!-- Terminal Output -->
		<div class="fullscreen-output">
			<div
				bind:this={scrollRef}
				class="output-scroll"
				onscroll={handleScroll}
			>
				{#if output}
					<pre class="output-pre">{@html renderedOutput}</pre>
				{:else}
					<p class="output-empty">No output yet...</p>
				{/if}
			</div>

			<!-- Scroll to bottom indicator -->
			{#if !autoScroll}
				<button class="scroll-bottom-btn" onclick={scrollToBottom}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
						<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
					</svg>
				</button>
			{/if}
		</div>

		<!-- Quick Action Pills -->
		<div class="quick-actions">
			<button class="action-pill action-complete" onclick={() => onAction('complete')}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
				Complete
			</button>
			<button class="action-pill action-pause" onclick={() => onAction('pause')}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
				</svg>
				Pause
			</button>
			<button class="action-pill action-interrupt" onclick={() => handleSendInput('ctrl-c', 'key')}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
				Interrupt
			</button>
		</div>

		<!-- Input Bar -->
		<div class="fullscreen-input">
			<TerminalInput
				bind:this={terminalInputRef}
				{sessionName}
				bind:inputText
				onSendInput={handleSendInput}
				placeholder="Send a message..."
				multiline={true}
				showFullKeyboardMenu={true}
			/>
		</div>
	</div>
{/if}

<style>
	.fullscreen-backdrop {
		position: fixed;
		inset: 0;
		background: oklch(0 0 0 / 0.6);
		z-index: 49;
	}

	.fullscreen-panel {
		position: fixed;
		inset: 0;
		z-index: 50;
		display: flex;
		flex-direction: column;
		background: oklch(0.14 0.01 250);
	}

	/* Top Bar */
	.fullscreen-topbar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.625rem 0.75rem;
		background: oklch(0.18 0.01 250);
		border-bottom: 1px solid oklch(0.25 0.02 250);
		flex-shrink: 0;
		/* Safe area for notch phones */
		padding-top: max(0.625rem, env(safe-area-inset-top));
	}

	.back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		background: transparent;
		border: none;
		color: oklch(0.75 0.02 250);
		cursor: pointer;
		flex-shrink: 0;
		transition: background 0.15s;
	}

	.back-btn:active {
		background: oklch(0.25 0.02 250);
	}

	.topbar-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		min-width: 0;
		cursor: pointer;
	}

	.topbar-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.topbar-agent {
		font-size: 0.8125rem;
		font-weight: 600;
		color: oklch(0.90 0.02 250);
		line-height: 1.2;
	}

	.topbar-task {
		font-size: 0.6875rem;
		color: oklch(0.60 0.02 250);
		line-height: 1.2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.topbar-status {
		flex-shrink: 0;
	}

	/* Terminal Output */
	.fullscreen-output {
		flex: 1;
		min-height: 0;
		position: relative;
		overflow: hidden;
	}

	.output-scroll {
		position: absolute;
		inset: 0;
		overflow-y: auto;
		overflow-x: auto;
		padding: 0.5rem 0.75rem;
		-webkit-overflow-scrolling: touch;
	}

	.output-pre {
		white-space: pre;
		margin: 0;
		font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', monospace;
		font-size: 0.75rem;
		line-height: 1.5;
		color: oklch(0.80 0.02 250);
	}

	.output-empty {
		color: oklch(0.45 0.02 250);
		font-style: italic;
		margin: 0;
		padding: 1rem 0;
	}

	/* Scroll to bottom */
	.scroll-bottom-btn {
		position: absolute;
		bottom: 0.5rem;
		right: 0.75rem;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		background: oklch(0.25 0.08 240);
		border: 1px solid oklch(0.40 0.10 240);
		color: oklch(0.85 0.02 250);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 2px 8px oklch(0 0 0 / 0.3);
		transition: background 0.15s;
	}

	.scroll-bottom-btn:active {
		background: oklch(0.30 0.10 240);
	}

	/* Quick Action Pills */
	.quick-actions {
		display: flex;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		background: oklch(0.16 0.01 250);
		border-top: 1px solid oklch(0.22 0.02 250);
		flex-shrink: 0;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	.action-pill {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.625rem;
		border-radius: 1rem;
		border: 1px solid oklch(0.30 0.02 250);
		background: oklch(0.20 0.02 250);
		color: oklch(0.75 0.02 250);
		font-size: 0.6875rem;
		font-weight: 500;
		cursor: pointer;
		white-space: nowrap;
		flex-shrink: 0;
		transition: background 0.15s, border-color 0.15s;
	}

	.action-pill:active {
		background: oklch(0.25 0.02 250);
	}

	.action-complete {
		border-color: oklch(0.45 0.12 145 / 0.5);
		color: oklch(0.70 0.15 145);
	}

	.action-complete:active {
		background: oklch(0.25 0.08 145);
	}

	.action-pause {
		border-color: oklch(0.45 0.10 85 / 0.5);
		color: oklch(0.75 0.12 85);
	}

	.action-pause:active {
		background: oklch(0.25 0.06 85);
	}

	.action-interrupt {
		border-color: oklch(0.45 0.10 25 / 0.5);
		color: oklch(0.70 0.12 25);
	}

	.action-interrupt:active {
		background: oklch(0.25 0.06 25);
	}

	/* Input Bar */
	.fullscreen-input {
		flex-shrink: 0;
		/* Safe area for home indicator */
		padding-bottom: env(safe-area-inset-bottom);
	}

	/* Drop overlay */
	.drop-overlay {
		position: absolute;
		inset: 0;
		z-index: 60;
		display: flex;
		align-items: center;
		justify-content: center;
		background: oklch(0.25 0.15 250 / 0.9);
		border: 3px dashed oklch(0.65 0.20 250);
		pointer-events: none;
	}

	.drop-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.drop-text {
		font-size: 0.875rem;
		font-weight: 600;
		color: oklch(0.85 0.10 250);
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.fullscreen-panel {
			transition: none !important;
			animation: none !important;
		}
	}
</style>
