<script lang="ts">
	import type { TextBlock } from '$lib/types/canvas';
	import { marked, type MarkedOptions } from 'marked';

	let {
		block,
		onUpdate
	}: {
		block: TextBlock;
		onUpdate?: (block: TextBlock) => void;
	} = $props();

	let editing = $state(false);
	let editValue = $state('');
	let textareaEl: HTMLTextAreaElement | undefined = $state(undefined);
	let saveTimeout: ReturnType<typeof setTimeout> | undefined;

	// Configure marked for inline canvas rendering
	const renderer = new marked.Renderer();

	renderer.heading = function ({ tokens, depth }) {
		const text = tokens.map((t) => ('text' in t ? t.text : '')).join('');
		return `<h${depth} class="canvas-md-h${depth}">${text}</h${depth}>`;
	};

	renderer.code = function ({ text, lang }) {
		const language = lang || '';
		const escaped = text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
		return `<div class="canvas-code-block"><pre><code class="language-${language}">${escaped}</code></pre></div>`;
	};

	// Track checkbox index during rendering for interactive toggling
	let checkboxIndex = 0;
	const originalListItem = renderer.listitem.bind(renderer);
	renderer.listitem = function (token) {
		const html = originalListItem(token);
		// Replace disabled checkboxes with interactive ones carrying a data index
		if (html.includes('type="checkbox"')) {
			const idx = checkboxIndex++;
			return html.replace(
				/<input (checked="" )?disabled="" type="checkbox">/,
				`<input $1type="checkbox" data-checkbox-index="${idx}">`
			);
		}
		return html;
	};

	marked.setOptions({
		renderer,
		gfm: true,
		breaks: true
	} as MarkedOptions);

	let renderedHtml = $derived.by(() => {
		checkboxIndex = 0; // Reset index on each render
		return block.content ? (marked.parse(block.content) as string) : '';
	});

	function handleCheckboxClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (target.tagName !== 'INPUT' || target.getAttribute('type') !== 'checkbox') return;

		e.preventDefault();
		e.stopPropagation();

		const idx = parseInt(target.getAttribute('data-checkbox-index') || '-1');
		if (idx < 0) return;

		// Find the Nth checkbox pattern in the markdown and toggle it
		let count = 0;
		const newContent = block.content.replace(/- \[([ xX])\]/g, (match, check) => {
			if (count++ === idx) {
				return check === ' ' ? '- [x]' : '- [ ]';
			}
			return match;
		});

		if (newContent !== block.content) {
			onUpdate?.({ ...block, content: newContent });
		}
	}

	function startEditing() {
		editing = true;
		editValue = block.content;
		// Focus textarea after it mounts
		requestAnimationFrame(() => {
			if (textareaEl) {
				textareaEl.focus({ preventScroll: true });
				textareaEl.selectionStart = textareaEl.selectionEnd = textareaEl.value.length;
				autoResize();
			}
		});
	}

	function stopEditing() {
		if (saveTimeout) clearTimeout(saveTimeout);
		if (editValue !== block.content) {
			onUpdate?.({ ...block, content: editValue });
		}
		editing = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			stopEditing();
		}
	}

	function handleInput() {
		autoResize();
		// Debounced auto-save while typing
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			if (editValue !== block.content) {
				onUpdate?.({ ...block, content: editValue });
			}
		}, 1000);
	}

	function autoResize() {
		if (!textareaEl) return;
		textareaEl.style.height = 'auto';
		textareaEl.style.height = textareaEl.scrollHeight + 'px';
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="canvas-text-block">
	{#if editing}
		<textarea
			bind:this={textareaEl}
			bind:value={editValue}
			onblur={stopEditing}
			onkeydown={handleKeydown}
			oninput={handleInput}
			class="canvas-text-editor"
			placeholder="Type markdown here..."
		></textarea>
	{:else if block.content}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="canvas-text-content" onclick={(e) => {
			const target = e.target as HTMLElement;
			if (target.tagName === 'INPUT' && target.getAttribute('type') === 'checkbox') {
				handleCheckboxClick(e);
			} else {
				startEditing();
			}
		}}>
			{@html renderedHtml}
		</div>
	{:else}
		<div class="canvas-text-placeholder" onclick={startEditing}>
			Click to add text...
		</div>
	{/if}
</div>

<style>
	.canvas-text-block {
		min-height: 1.5rem;
	}

	.canvas-text-editor {
		width: 100%;
		min-height: 4rem;
		padding: 0;
		margin: 0;
		background: transparent;
		border: none;
		outline: none;
		resize: none;
		font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace;
		font-size: 0.85rem;
		line-height: 1.6;
		color: oklch(0.85 0.02 250);
		overflow: hidden;
	}

	.canvas-text-editor::placeholder {
		color: oklch(0.40 0.02 250);
		font-style: italic;
	}

	.canvas-text-content {
		cursor: text;
		font-size: 0.875rem;
		line-height: 1.65;
		color: oklch(0.85 0.02 250);
	}

	.canvas-text-placeholder {
		cursor: text;
		font-size: 0.85rem;
		font-style: italic;
		color: oklch(0.40 0.02 250);
		padding: 0.25rem 0;
	}

	.canvas-text-placeholder:hover {
		color: oklch(0.55 0.02 250);
	}

	/* Markdown rendered content */
	:global(.canvas-text-content .canvas-md-h1) {
		font-size: 1.5rem;
		font-weight: 700;
		color: oklch(0.95 0.02 250);
		margin: 0.5rem 0 0.5rem 0;
		border-bottom: 1px solid oklch(0.25 0.02 250);
		padding-bottom: 0.375rem;
	}

	:global(.canvas-text-content .canvas-md-h2) {
		font-size: 1.2rem;
		font-weight: 600;
		color: oklch(0.90 0.03 200);
		margin: 0.5rem 0 0.375rem 0;
	}

	:global(.canvas-text-content .canvas-md-h3) {
		font-size: 1.05rem;
		font-weight: 600;
		color: oklch(0.85 0.02 250);
		margin: 0.375rem 0 0.25rem 0;
	}

	:global(.canvas-text-content p) {
		margin: 0 0 0.625rem 0;
	}

	:global(.canvas-text-content p:last-child) {
		margin-bottom: 0;
	}

	:global(.canvas-text-content ul),
	:global(.canvas-text-content ol) {
		margin: 0 0 0.625rem 0;
		padding-left: 1.5rem;
	}

	:global(.canvas-text-content li) {
		margin-bottom: 0.25rem;
	}

	:global(.canvas-text-content a) {
		color: oklch(0.75 0.15 200);
		text-decoration: none;
	}

	:global(.canvas-text-content a:hover) {
		text-decoration: underline;
	}

	:global(.canvas-text-content strong) {
		font-weight: 600;
		color: oklch(0.92 0.02 250);
	}

	:global(.canvas-text-content em) {
		font-style: italic;
	}

	:global(.canvas-text-content code:not([class*='language-'])) {
		font-family: ui-monospace, monospace;
		font-size: 0.82em;
		background: oklch(0.20 0.02 250);
		padding: 0.1rem 0.35rem;
		border-radius: 3px;
		color: oklch(0.80 0.10 280);
	}

	:global(.canvas-text-content .canvas-code-block) {
		margin: 0.625rem 0;
		border-radius: 6px;
		overflow: hidden;
		background: oklch(0.10 0.01 250);
		border: 1px solid oklch(0.22 0.02 250);
	}

	:global(.canvas-text-content .canvas-code-block pre) {
		margin: 0;
		padding: 0.75rem;
		overflow-x: auto;
	}

	:global(.canvas-text-content .canvas-code-block code) {
		font-family: ui-monospace, monospace;
		font-size: 0.8rem;
		line-height: 1.5;
		color: oklch(0.85 0.02 250);
	}

	:global(.canvas-text-content blockquote) {
		margin: 0.625rem 0;
		padding: 0.5rem 0.75rem;
		background: oklch(0.16 0.02 250);
		border-left: 3px solid oklch(0.50 0.10 200);
		color: oklch(0.75 0.02 250);
	}

	:global(.canvas-text-content blockquote p:last-child) {
		margin-bottom: 0;
	}

	:global(.canvas-text-content hr) {
		border: none;
		border-top: 1px solid oklch(0.25 0.02 250);
		margin: 1rem 0;
	}

	:global(.canvas-text-content input[type='checkbox']) {
		margin-right: 0.4rem;
		accent-color: oklch(0.65 0.15 200);
		cursor: pointer;
		width: 0.95rem;
		height: 0.95rem;
		vertical-align: middle;
		position: relative;
		top: -1px;
	}

	:global(.canvas-text-content input[type='checkbox']:hover) {
		accent-color: oklch(0.75 0.18 200);
	}

	/* Style checked items with strikethrough */
	:global(.canvas-text-content li:has(input[type='checkbox']:checked)) {
		color: oklch(0.50 0.02 250);
		text-decoration: line-through;
		text-decoration-color: oklch(0.40 0.02 250);
	}

	/* Remove default list bullet for checkbox items */
	:global(.canvas-text-content li:has(input[type='checkbox'])) {
		list-style: none;
		margin-left: -1.25rem;
	}
</style>
