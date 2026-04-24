<script lang="ts">
	/**
	 * Floating chip (bottom-right) that surfaces bulk actions for a listNav
	 * selection. Pages bind `count` + `visible` and pass an `actions` array.
	 *
	 *   <BulkActionBar
	 *     count={selectedIds.size}
	 *     actions={[
	 *       { key: 'c', label: 'Close',   onAction: bulkClose   },
	 *       { key: 'a', label: 'Assign',  onAction: openPicker  },
	 *       { key: 'd', label: 'Delete',  onAction: bulkDelete, danger: true },
	 *       { key: 's', label: 'Status',  onAction: bulkStatus  },
	 *     ]}
	 *     onClear={() => nav.clearSelection()}
	 *   />
	 *
	 * The component does NOT register keyboard shortcuts — the host page's
	 * existing keydown handler should call `action.onAction()` when the
	 * matching key fires *and* the selection is non-empty. This keeps all
	 * key-handling in one place (the page) so conflicts with page shortcuts
	 * are obvious.
	 */

	export interface BulkAction {
		/** Keyboard hint shown in the chip (e.g. 'c'). Purely advisory. */
		key?: string;
		/** Button label. */
		label: string;
		/** Click handler. */
		onAction: () => void;
		/** Style as destructive (red). Default: false. */
		danger?: boolean;
		/** Disable the button (e.g. while the action is in flight). */
		disabled?: boolean;
	}

	let {
		count,
		actions,
		onClear,
		label = 'selected'
	}: {
		count: number;
		actions: BulkAction[];
		onClear: () => void;
		label?: string;
	} = $props();

	const visible = $derived(count > 0);
</script>

{#if visible}
	<div
		class="bulk-action-bar"
		role="toolbar"
		aria-label="Bulk actions for selected items"
	>
		<div class="bulk-count">
			<span class="count">{count}</span>
			<span class="count-label">{label}</span>
		</div>

		<div class="bulk-divider" aria-hidden="true"></div>

		<div class="bulk-actions">
			{#each actions as action (action.label)}
				<button
					type="button"
					class="bulk-btn"
					class:bulk-btn-danger={action.danger}
					disabled={action.disabled}
					onclick={action.onAction}
					title={action.key ? `${action.label} (${action.key})` : action.label}
				>
					{action.label}
					{#if action.key}
						<kbd class="bulk-key">{action.key}</kbd>
					{/if}
				</button>
			{/each}
		</div>

		<div class="bulk-divider" aria-hidden="true"></div>

		<button
			type="button"
			class="bulk-clear"
			onclick={onClear}
			title="Clear selection (Esc)"
			aria-label="Clear selection"
		>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
				<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
			</svg>
		</button>
	</div>
{/if}

<style>
	.bulk-action-bar {
		position: fixed;
		right: 1.5rem;
		bottom: 1.5rem;
		z-index: 50;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.5rem 0.5rem 0.875rem;
		background: oklch(0.18 0.02 250 / 0.96);
		border: 1px solid oklch(0.70 0.18 240 / 0.4);
		border-radius: 999px;
		box-shadow:
			0 10px 30px oklch(0 0 0 / 0.4),
			0 0 0 1px oklch(0.70 0.18 240 / 0.1),
			0 0 24px oklch(0.70 0.18 240 / 0.2);
		color: oklch(0.95 0.02 250);
		font-size: 0.8125rem;
		backdrop-filter: blur(8px);
		animation: bulk-bar-in 0.18s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	@keyframes bulk-bar-in {
		0% {
			opacity: 0;
			transform: translateY(8px) scale(0.95);
		}
		100% {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.bulk-count {
		display: flex;
		align-items: baseline;
		gap: 0.375rem;
	}

	.count {
		font-weight: 600;
		font-size: 0.9375rem;
		color: oklch(0.85 0.15 240);
	}

	.count-label {
		color: oklch(0.70 0.03 250);
		font-size: 0.75rem;
	}

	.bulk-divider {
		width: 1px;
		height: 1.25rem;
		background: oklch(0.35 0.02 250);
	}

	.bulk-actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.bulk-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.3125rem 0.625rem;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 0.375rem;
		color: oklch(0.90 0.02 250);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.12s, border-color 0.12s, color 0.12s;
	}

	.bulk-btn:hover:not(:disabled) {
		background: oklch(0.28 0.03 250);
		border-color: oklch(0.40 0.03 250);
	}

	.bulk-btn:active:not(:disabled) {
		background: oklch(0.22 0.02 250);
	}

	.bulk-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.bulk-btn-danger:hover:not(:disabled) {
		background: oklch(0.35 0.12 25 / 0.3);
		border-color: oklch(0.60 0.18 25 / 0.5);
		color: oklch(0.85 0.15 25);
	}

	.bulk-key {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.125rem;
		height: 1.125rem;
		padding: 0 0.25rem;
		background: oklch(0.24 0.02 250);
		border: 1px solid oklch(0.35 0.02 250);
		border-radius: 0.25rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.6875rem;
		font-weight: 600;
		color: oklch(0.70 0.03 250);
		line-height: 1;
	}

	.bulk-clear {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		padding: 0;
		background: transparent;
		border: 1px solid transparent;
		border-radius: 999px;
		color: oklch(0.65 0.03 250);
		cursor: pointer;
		transition: background 0.12s, color 0.12s;
	}

	.bulk-clear:hover {
		background: oklch(0.28 0.03 250);
		color: oklch(0.90 0.02 250);
	}

	@media (max-width: 640px) {
		.bulk-action-bar {
			right: 0.75rem;
			bottom: 0.75rem;
			padding: 0.4375rem 0.5rem 0.4375rem 0.75rem;
			font-size: 0.75rem;
		}

		.count-label {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bulk-action-bar {
			animation: none;
		}
	}
</style>
