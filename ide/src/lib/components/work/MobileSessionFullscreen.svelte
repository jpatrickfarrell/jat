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
	 * - Bottom: Inline textarea input pinned at bottom with quick action pills
	 * - Keyboard-aware: input stays above virtual keyboard
	 * - Dismiss via back button
	 */

	import { onMount, onDestroy } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import AgentAvatar from '$lib/components/AgentAvatar.svelte';
	import StatusActionBadge from '$lib/components/work/StatusActionBadge.svelte';
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
	let inputRef: HTMLTextAreaElement | null = null;
	let sendingInput = $state(false);
	let sendInputError = $state<string | null>(null);

	// Visual flash states
	let submitFlash = $state(false);
	let escapeFlash = $state(false);
	let arrowFlash = $state(false);

	// Input history (Up arrow recalls previous submissions)
	let inputHistory: string[] = [];
	let historyIndex = $state(-1); // -1 = not browsing history
	let savedInput = ''; // Stash current input when browsing history

	// Path autocomplete state (triggered by @ in input)
	let showPathAutocomplete = $state(false);
	let pathSearchResults = $state<Array<{path: string; name: string; folder: string}>>([]);
	let pathAutocompleteIndex = $state(0);
	let pathSearchTimeout: ReturnType<typeof setTimeout> | null = null;
	let pathSearchGeneration = 0;

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

	// Send input to session (matches TasksActive.sendExpandedInput API contract)
	async function handleSendInput(text: string, type: 'text' | 'key' | 'raw' = 'text'): Promise<boolean> {
		try {
			let apiType: string = type;
			let apiInput: string = text;

			if (type === 'key') {
				const specialKeys = ['ctrl-c', 'ctrl-d', 'ctrl-u', 'ctrl-l', 'enter', 'escape', 'up', 'down', 'left', 'right', 'tab', 'delete', 'backspace', 'space'];
				if (specialKeys.includes(text)) {
					apiType = text;
					apiInput = '';
				} else {
					apiType = 'raw';
					apiInput = text;
				}
			}

			const response = await fetch(`/api/work/${encodeURIComponent(sessionName)}/input`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: apiType, input: apiInput })
			});
			// Fetch output shortly after sending input
			setTimeout(fetchOutput, 100);
			return response.ok;
		} catch (e) {
			console.warn('[MobileFullscreen] Failed to send input:', e);
			return false;
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
			inputRef?.focus({ preventScroll: true });
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
					inputRef?.focus({ preventScroll: true });
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

	// Path autocomplete - triggered by @ in input
	function detectPathAutocomplete() {
		if (!inputRef) return;
		const text = inputRef.value;
		const cursorPos = inputRef.selectionStart ?? text.length;
		const beforeCursor = text.slice(0, cursorPos);
		const atMatch = beforeCursor.match(/@([\w\-\.\/]*)$/);
		if (atMatch && project) {
			const query = atMatch[1];
			showPathAutocomplete = true;
			pathAutocompleteIndex = 0;
			if (pathSearchTimeout) clearTimeout(pathSearchTimeout);
			if (query.length >= 1) {
				const generation = ++pathSearchGeneration;
				pathSearchTimeout = setTimeout(async () => {
					try {
						const res = await fetch(`/api/files/search?project=${encodeURIComponent(project!)}&query=${encodeURIComponent(query)}&limit=8`);
						const data = await res.json();
						if (generation === pathSearchGeneration) {
							pathSearchResults = data.files || [];
							pathAutocompleteIndex = 0;
						}
					} catch {
						if (generation === pathSearchGeneration) {
							pathSearchResults = [];
						}
					}
				}, 150);
			}
		} else {
			showPathAutocomplete = false;
			pathSearchResults = [];
		}
	}

	function selectPathResult(file: {path: string; name: string; folder: string}) {
		if (!inputRef) return;
		const text = inputRef.value;
		const cursorPos = inputRef.selectionStart ?? text.length;
		const beforeCursor = text.slice(0, cursorPos);
		const afterCursor = text.slice(cursorPos);
		const atMatch = beforeCursor.match(/@([\w\-\.\/]*)$/);
		if (!atMatch) return;
		const atPos = cursorPos - atMatch[0].length;
		inputText = beforeCursor.slice(0, atPos) + file.path + afterCursor;
		showPathAutocomplete = false;
		pathSearchResults = [];
		const newCursorPos = atPos + file.path.length;
		requestAnimationFrame(() => {
			inputRef?.setSelectionRange(newCursorPos, newCursorPos);
			inputRef?.focus({ preventScroll: true });
		});
	}

	function handleInputChange() {
		autoResizeTextarea();
		detectPathAutocomplete();
		// Reset history browsing when user types
		if (historyIndex >= 0) {
			historyIndex = -1;
			savedInput = '';
		}
	}

	function autoResizeTextarea() {
		if (!inputRef) return;
		inputRef.style.height = 'auto';
		inputRef.style.height = Math.min(inputRef.scrollHeight, 96) + 'px';
	}

	// Send text input to session (matches SessionCard pattern)
	async function sendTextInput() {
		const hasText = inputText.trim().length > 0;
		if (!hasText) return;

		sendingInput = true;
		try {
			sendInputError = null;

			// Clear stale terminal state before sending
			await handleSendInput('ctrl-c', 'key');
			await new Promise(r => setTimeout(r, 50));
			await handleSendInput('escape', 'key');
			await new Promise(r => setTimeout(r, 50));

			// Write IDE-initiated working signal if in input-waiting state
			const waitingStates = ['needs-input', 'completed', 'idle'];
			if (sessionName && waitingStates.includes(sessionState)) {
				const signalType = sessionState === 'completed' ? 'polishing' : 'working';
				try {
					await fetch(`/api/sessions/${encodeURIComponent(sessionName)}/signal`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							type: signalType,
							data: {
								taskId: taskId || '',
								taskTitle: taskTitle || '',
								agentName,
								approach: sessionState === 'completed' ? 'Post-completion follow-up' : 'Processing user input'
							}
						})
					});
				} catch (e) {
					console.warn('[MobileFullscreen] Failed to write working signal:', e);
				}
			}

			// Send the message
			const sendResult = await handleSendInput(inputText.trim(), 'text');

			// Send extra Enter after delay
			await new Promise(r => setTimeout(r, 100));
			await handleSendInput('enter', 'key');

			// Save to history and clear input
			const trimmed = inputText.trim();
			if (trimmed && (inputHistory.length === 0 || inputHistory[inputHistory.length - 1] !== trimmed)) {
				inputHistory.push(trimmed);
			}
			historyIndex = -1;
			savedInput = '';
			inputText = '';
			setTimeout(autoResizeTextarea, 0);

			// Visual flash
			submitFlash = true;
			setTimeout(() => { submitFlash = false; }, 300);

			// Restore focus
			setTimeout(() => {
				inputRef?.focus({ preventScroll: true });
			}, 50);
		} catch {
			sendInputError = "Message failed to send. Your text has been preserved - please try again.";
		} finally {
			sendingInput = false;
		}
	}

	// Handle keyboard shortcuts in input (matches SessionCard pattern)
	function handleInputKeydown(e: KeyboardEvent) {
		// Path autocomplete intercepts
		if (showPathAutocomplete && pathSearchResults.length > 0) {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				pathAutocompleteIndex = (pathAutocompleteIndex + 1) % pathSearchResults.length;
				return;
			}
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				pathAutocompleteIndex = (pathAutocompleteIndex - 1 + pathSearchResults.length) % pathSearchResults.length;
				return;
			}
			if (e.key === 'Tab' || (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.shiftKey)) {
				e.preventDefault();
				selectPathResult(pathSearchResults[pathAutocompleteIndex]);
				return;
			}
			if (e.key === 'Escape') {
				e.preventDefault();
				showPathAutocomplete = false;
				pathSearchResults = [];
				return;
			}
		}

		if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
			// Enter: submit input or send Enter key to tmux if empty
			e.preventDefault();
			const hasText = inputText.trim().length > 0;
			if (!hasText) {
				handleSendInput('enter', 'key');
				submitFlash = true;
				setTimeout(() => { submitFlash = false; }, 300);
				setTimeout(() => { inputRef?.focus({ preventScroll: true }); }, 50);
			} else {
				sendTextInput();
			}
		} else if (e.key === 'Enter' && e.shiftKey) {
			// Shift+Enter: insert newline (default textarea behavior)
			setTimeout(handleInputChange, 0);
		} else if (e.key === 'Escape') {
			// Send 2x Escape to tmux
			e.preventDefault();
			inputText = '';
			handleSendInput('escape', 'key');
			setTimeout(() => handleSendInput('escape', 'key'), 50);
			setTimeout(autoResizeTextarea, 0);
			escapeFlash = true;
			setTimeout(() => { escapeFlash = false; }, 300);
		} else if (e.key === 'c' && e.ctrlKey) {
			// Ctrl+C: send interrupt to tmux
			e.preventDefault();
			inputText = '';
			setTimeout(autoResizeTextarea, 0);
			handleSendInput('ctrl-c', 'key');
			escapeFlash = true;
			setTimeout(() => { escapeFlash = false; }, 300);
		} else if (e.key === 'ArrowUp' && !inputText.trim() && inputHistory.length > 0) {
			// Up arrow when empty: browse input history
			e.preventDefault();
			if (historyIndex === -1) {
				// Starting to browse — stash any current text
				savedInput = inputText;
				historyIndex = inputHistory.length - 1;
			} else if (historyIndex > 0) {
				historyIndex--;
			}
			inputText = inputHistory[historyIndex];
			setTimeout(autoResizeTextarea, 0);
		} else if (e.key === 'ArrowDown' && historyIndex >= 0) {
			// Down arrow: navigate forward in history or restore saved input
			e.preventDefault();
			if (historyIndex < inputHistory.length - 1) {
				historyIndex++;
				inputText = inputHistory[historyIndex];
			} else {
				// Past the end — restore stashed input
				historyIndex = -1;
				inputText = savedInput;
				savedInput = '';
			}
			setTimeout(autoResizeTextarea, 0);
		} else if (
			(e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') &&
			!inputText.trim()
		) {
			// Arrow keys when empty (no history or left/right): send to tmux
			e.preventDefault();
			const keyMap: Record<string, string> = {
				ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right'
			};
			handleSendInput(keyMap[e.key], 'key');
			arrowFlash = true;
			setTimeout(() => { arrowFlash = false; }, 300);
		} else if (
			(e.key === 'Delete' || e.key === 'Backspace') && !inputText.trim()
		) {
			// Delete/Backspace when empty: send to tmux
			e.preventDefault();
			handleSendInput(e.key === 'Delete' ? 'delete' : 'backspace', 'key');
		}
	}

	// Handle Escape in capture phase to close overlay without sending to tmux
	$effect(() => {
		if (!visible) return;
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				e.stopPropagation();
				e.preventDefault();
				handleClose();
			}
		}
		window.addEventListener('keydown', handleKeydown, true);
		return () => window.removeEventListener('keydown', handleKeydown, true);
	});
</script>

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
			{#if sendInputError}
				<div class="input-error">
					<span class="flex-1">{sendInputError}</span>
					<button class="error-dismiss" onclick={() => sendInputError = null}>&times;</button>
				</div>
			{/if}
			<div class="input-row">
				<div class="input-wrapper">
					<textarea
						bind:this={inputRef}
						bind:value={inputText}
						onkeydown={handleInputKeydown}
						oninput={handleInputChange}
						onblur={() => { setTimeout(() => { showPathAutocomplete = false; }, 200); }}
						placeholder="Type and press Enter..."
						rows="1"
						class="mobile-input {submitFlash ? 'submit-flash' : ''} {escapeFlash ? 'escape-flash' : ''} {arrowFlash ? 'arrow-flash' : ''}"
						disabled={sendingInput}
						data-session-input="true"
					></textarea>
					<!-- Path autocomplete dropdown -->
					{#if showPathAutocomplete && pathSearchResults.length > 0}
						<div class="path-autocomplete">
							{#each pathSearchResults as file, i (file.path)}
								<button
									class="path-result"
									style="background: {i === pathAutocompleteIndex ? 'oklch(0.25 0.04 200 / 0.3)' : 'transparent'};"
									onmouseenter={() => pathAutocompleteIndex = i}
									onmousedown={(e) => { e.preventDefault(); selectPathResult(file); }}
								>
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 shrink-0" style="color: oklch(0.55 0.08 200);">
										<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
									</svg>
									<span class="truncate">{file.path}</span>
								</button>
							{/each}
							<div class="path-hint">
								<span><kbd>↑↓</kbd> Navigate</span>
								<span><kbd>Tab</kbd> Select</span>
								<span><kbd>Esc</kbd> Close</span>
							</div>
						</div>
					{/if}
					<!-- Clear button -->
					{#if inputText.trim().length > 0}
						<button
							class="input-clear"
							onclick={() => {
								inputText = '';
								setTimeout(handleInputChange, 0);
								escapeFlash = true;
								setTimeout(() => { escapeFlash = false; }, 300);
							}}
							aria-label="Clear input"
							disabled={sendingInput}
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					{/if}
				</div>
				<!-- Send button -->
				<button
					class="send-btn"
					onclick={sendTextInput}
					disabled={sendingInput || !inputText.trim()}
					aria-label="Send"
				>
					{#if sendingInput}
						<svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="12" cy="12" r="10" stroke="oklch(0.40 0.02 250)" />
							<path d="M12 2a10 10 0 019.95 9" stroke="oklch(0.75 0.15 200)" />
						</svg>
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
						</svg>
					{/if}
				</button>
			</div>
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
		padding: 0.375rem 0.5rem;
		background: oklch(0.16 0.01 250);
		border-top: 1px solid oklch(0.22 0.02 250);
		/* Safe area for home indicator */
		padding-bottom: max(0.375rem, env(safe-area-inset-bottom));
	}

	.input-error {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.625rem;
		margin-bottom: 0.375rem;
		background: oklch(0.25 0.08 25 / 0.3);
		border: 1px solid oklch(0.45 0.12 25 / 0.4);
		border-radius: 0.375rem;
		color: oklch(0.75 0.12 25);
		font-size: 0.75rem;
	}

	.error-dismiss {
		background: none;
		border: none;
		color: oklch(0.60 0.08 25);
		cursor: pointer;
		font-size: 1rem;
		padding: 0 0.25rem;
	}

	.input-row {
		display: flex;
		align-items: flex-end;
		gap: 0.375rem;
	}

	.input-wrapper {
		position: relative;
		flex: 1;
		min-width: 0;
	}

	.mobile-input {
		width: 100%;
		font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
		font-size: 0.8125rem;
		padding: 0.5rem 1.75rem 0.5rem 0.625rem;
		background: oklch(0.22 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.5rem;
		color: oklch(0.85 0.02 250);
		resize: none;
		overflow: hidden;
		min-height: 36px;
		max-height: 96px;
		line-height: 1.4;
		outline: none;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.mobile-input:focus {
		border-color: oklch(0.45 0.12 240);
		box-shadow: 0 0 0 2px oklch(0.45 0.12 240 / 0.2);
	}

	.mobile-input:disabled {
		opacity: 0.5;
	}

	.mobile-input.submit-flash {
		border-color: oklch(0.65 0.18 145);
		box-shadow: 0 0 8px oklch(0.65 0.18 145 / 0.3);
	}

	.mobile-input.escape-flash {
		border-color: oklch(0.65 0.15 25);
		box-shadow: 0 0 8px oklch(0.65 0.15 25 / 0.3);
	}

	.mobile-input.arrow-flash {
		border-color: oklch(0.65 0.12 200);
		box-shadow: 0 0 8px oklch(0.65 0.12 200 / 0.3);
	}

	.input-clear {
		position: absolute;
		right: 0.375rem;
		top: 0.5rem;
		padding: 0.125rem;
		border-radius: 50%;
		background: transparent;
		border: none;
		color: oklch(0.55 0.02 250);
		cursor: pointer;
		transition: color 0.15s;
	}

	.input-clear:active {
		color: oklch(0.80 0.02 250);
	}

	.send-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 0.5rem;
		background: oklch(0.45 0.15 240);
		border: none;
		color: oklch(0.95 0.02 250);
		cursor: pointer;
		flex-shrink: 0;
		transition: background 0.15s, opacity 0.15s;
	}

	.send-btn:active {
		background: oklch(0.50 0.18 240);
	}

	.send-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}

	/* Path autocomplete */
	.path-autocomplete {
		position: absolute;
		z-index: 60;
		width: 100%;
		border-radius: 0.5rem;
		overflow: hidden;
		box-shadow: 0 4px 16px oklch(0 0 0 / 0.4);
		background: oklch(0.18 0.01 250);
		border: 1px solid oklch(0.30 0.03 250);
		max-height: 200px;
		overflow-y: auto;
		bottom: 100%;
		margin-bottom: 4px;
	}

	.path-result {
		width: 100%;
		text-align: left;
		padding: 0.375rem 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: oklch(0.85 0.01 250);
		border: none;
		cursor: pointer;
		transition: background 0.1s;
	}

	.path-hint {
		padding: 0.25rem 0.75rem;
		font-size: 0.625rem;
		color: oklch(0.40 0.01 250);
		border-top: 1px solid oklch(0.25 0.02 250);
		display: flex;
		gap: 0.75rem;
	}

	.path-hint kbd {
		background: oklch(0.25 0.02 250);
		padding: 1px 4px;
		border-radius: 2px;
		font-size: 10px;
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
