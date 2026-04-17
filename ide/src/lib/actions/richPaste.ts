/**
 * Svelte action: intercepts paste events on textareas to convert
 * HTML clipboard content to Markdown, with a toast offering plain text fallback.
 *
 * Usage:
 *   <textarea use:richPaste></textarea>
 *
 * Also exports hasPendingUndo(node) so blur-save handlers can keep the textarea
 * mounted while the undo toast is still dismissable.
 */

import { htmlToMarkdown, hasRichFormatting } from '$lib/utils/htmlToMarkdown';
import { addToast, removeToast } from '$lib/stores/toasts.svelte';

/** Nodes that currently have a pending undo toast — blur handlers should not close editing */
const pendingUndo = new WeakSet<HTMLTextAreaElement>();

/** Returns true while the "Paste plain text instead" toast is still available for this node */
export function hasPendingUndo(node: HTMLTextAreaElement): boolean {
	return pendingUndo.has(node);
}

/** Insert text into a textarea at the current cursor position */
function insertAtCursor(textarea: HTMLTextAreaElement, text: string): { start: number; end: number } {
	const start = textarea.selectionStart ?? textarea.value.length;
	const end = textarea.selectionEnd ?? start;
	const before = textarea.value.substring(0, start);
	const after = textarea.value.substring(end);
	textarea.value = before + text + after;
	// Reposition cursor after inserted text
	textarea.selectionStart = textarea.selectionEnd = start + text.length;
	// Notify Svelte binding
	textarea.dispatchEvent(new InputEvent('input', { bubbles: true }));
	return { start, end: start + text.length };
}

export function richPaste(node: HTMLTextAreaElement) {
	function handlePaste(event: ClipboardEvent) {
		const html = event.clipboardData?.getData('text/html') ?? '';
		const plain = event.clipboardData?.getData('text/plain') ?? '';

		// Only intercept if there's HTML with actual formatting
		if (!html || !hasRichFormatting(html)) return;

		event.preventDefault();

		const markdown = htmlToMarkdown(html);

		// Insert markdown
		const { start, end } = insertAtCursor(node, markdown);

		// Mark node as having a pending undo so blur-save handlers keep the textarea alive
		const duration = 6000;
		pendingUndo.add(node);
		// Auto-clear after toast would have dismissed
		setTimeout(() => pendingUndo.delete(node), duration + 100);

		let toastId: string | undefined;

		toastId = addToast({
			message: 'Pasted as Markdown',
			type: 'info',
			duration,
			action: {
				label: 'Paste plain text instead',
				onClick: () => {
					// Replace the markdown we inserted with plain text
					const current = node.value;
					const before = current.substring(0, start);
					const after = current.substring(end);
					node.value = before + plain + after;
					node.selectionStart = node.selectionEnd = start + plain.length;
					node.dispatchEvent(new InputEvent('input', { bubbles: true }));
					// Clear pending flag and refocus so next blur triggers the save
					pendingUndo.delete(node);
					node.focus();
					if (toastId) removeToast(toastId);
				}
			}
		});
	}

	node.addEventListener('paste', handlePaste);

	return {
		destroy() {
			node.removeEventListener('paste', handlePaste);
			pendingUndo.delete(node);
		}
	};
}
