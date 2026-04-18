<script lang="ts">
	/**
	 * ServerStatusBadge Component
	 *
	 * A clickable status badge for server sessions that shows current state
	 * and opens a dropdown with server-specific actions (start, stop, restart).
	 *
	 * Configuration is imported from statusColors.ts for consistency.
	 */

	import { fly, fade } from 'svelte/transition';
	import {
		getServerStateVisual,
		getServerStateActions,
		type ServerStateVisual,
		type ServerStateAction,
		type ServerState
	} from '$lib/config/statusColors';

	interface Props {
		serverStatus: ServerState;
		sessionName: string;
		port?: number | null;
		portRunning?: boolean;
		disabled?: boolean;
		dropUp?: boolean;
		alignRight?: boolean;
		/** 'badge' = standalone badge with bg/border, 'integrated' = minimal style for embedding in tabs */
		variant?: 'badge' | 'integrated';
		onAction?: (actionId: string) => Promise<void> | void;
		class?: string;
	}

	let {
		serverStatus,
		sessionName,
		port = null,
		portRunning = false,
		disabled = false,
		dropUp = false,
		alignRight = false,
		variant = 'badge',
		onAction,
		class: className = ''
	}: Props = $props();

	// Dropdown state
	let isOpen = $state(false);
	let executingId = $state<string | null>(null);
	let actionError = $state<string | null>(null);
	let confirmingAction = $state<ServerStateAction | null>(null);
	let dropdownRef: HTMLDivElement | null = null;

	// Get config from centralized statusColors.ts
	const config = $derived(getServerStateVisual(serverStatus));
	const actions = $derived(getServerStateActions(serverStatus));

	function closeDropdown() {
		isOpen = false;
		actionError = null;
		confirmingAction = null;
	}

	// Handle click outside to close dropdown
	function handleClickOutside(event: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			closeDropdown();
		}
	}

	// Setup and cleanup click outside + Escape listeners
	$effect(() => {
		if (isOpen) {
			const handleKey = (e: KeyboardEvent) => {
				if (e.key === 'Escape') {
					if (confirmingAction) {
						confirmingAction = null;
						e.stopPropagation();
					} else {
						closeDropdown();
						e.stopPropagation();
					}
				}
			};
			document.addEventListener('click', handleClickOutside);
			document.addEventListener('keydown', handleKey);
			return () => {
				document.removeEventListener('click', handleClickOutside);
				document.removeEventListener('keydown', handleKey);
			};
		}
	});

	// Arrow-key navigation within the menu
	function handleMenuKeydown(e: KeyboardEvent) {
		if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
		e.preventDefault();
		const items = dropdownRef?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])');
		if (!items?.length) return;
		const idx = Array.from(items).indexOf(document.activeElement as HTMLElement);
		if (e.key === 'ArrowDown') items[(idx + 1) % items.length].focus();
		if (e.key === 'ArrowUp')   items[(idx - 1 + items.length) % items.length].focus();
		if (e.key === 'Home')      items[0].focus();
		if (e.key === 'End')       items[items.length - 1].focus();
	}

	// Handle action execution
	async function executeAction(action: ServerStateAction) {
		if (disabled || executingId !== null) return;

		// Handle "open" action client-side - open localhost URL in new tab
		if (action.id === 'open') {
			if (port) window.open(`http://localhost:${port}`, '_blank');
			closeDropdown();
			return;
		}

		// Destructive actions require inline confirmation before executing
		if (action.destructive && confirmingAction?.id !== action.id) {
			confirmingAction = action;
			return;
		}

		actionError = null;
		confirmingAction = null;
		executingId = action.id;
		try {
			await onAction?.(action.id);
			closeDropdown();
		} catch (e) {
			actionError = e instanceof Error ? e.message : 'Action failed';
		} finally {
			executingId = null;
		}
	}

	// Get variant colors for dropdown items
	function getVariantClasses(variant: ServerStateAction['variant']): string {
		switch (variant) {
			case 'success': return 'hover:bg-success/20 text-success';
			case 'warning': return 'hover:bg-warning/20 text-warning';
			case 'error':   return 'hover:bg-error/20 text-error';
			case 'info':    return 'hover:bg-info/20 text-info';
			default:        return 'hover:bg-base-300 text-base-content';
		}
	}

	// Build display label with port info
	const displayLabel = $derived.by(() => {
		const baseLabel = variant === 'integrated' ? config.shortLabel : config.label;
		if (port && serverStatus === 'running') return `${baseLabel} :${port}`;
		return baseLabel;
	});
</script>

<div class="relative inline-block {className}" bind:this={dropdownRef}>
	<!-- Status Badge Button -->
	<button
		type="button"
		onclick={() => (isOpen = !isOpen)}
		class="font-mono tracking-wider flex-shrink-0 font-bold cursor-pointer transition-all focus:outline-none {variant === 'integrated'
			? 'text-[11px] px-2 py-0.5 hover:bg-white/5 rounded focus:ring-1 focus:ring-current focus:ring-offset-1'
			: 'text-[10px] px-1.5 pt-0.5 rounded hover:scale-105 hover:brightness-110 focus:ring-2 focus:ring-offset-1 focus:ring-offset-base-100'}"
		class:animate-pulse={config.pulse && variant === 'badge'}
		class:cursor-not-allowed={disabled}
		class:opacity-50={disabled}
		style={variant === 'integrated'
			? `color: ${config.textColor};`
			: `background: ${config.bgColor}; color: ${config.textColor}; border: 1px solid ${config.borderColor};`
		}
		disabled={disabled}
		aria-label="{config.description || 'Server status'} — click for actions"
		aria-expanded={isOpen}
		aria-haspopup="menu"
		title={config.description || "Click for server actions"}
	>
		<!-- Server icon -->
		<svg class="inline-block w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
			<path stroke-linecap="round" stroke-linejoin="round" d={config.icon} />
		</svg>
		{displayLabel}
		<!-- Port status indicator -->
		{#if port && serverStatus === 'running'}
			<span
				class="inline-block w-2 h-2 rounded-full ml-1 {portRunning ? 'port-active' : 'port-inactive'}"
				aria-label={portRunning ? 'Port is listening' : 'Port not responding'}
				role="img"
			></span>
		{/if}
		<!-- Dropdown indicator -->
		<svg
			class="inline-block w-2.5 h-2.5 ml-0.5 transition-transform"
			class:rotate-180={dropUp ? !isOpen : isOpen}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2.5"
			aria-hidden="true"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
		</svg>
	</button>

	<!-- Dropdown Menu -->
	{#if isOpen}
		<div
			class="server-dropdown absolute z-40 min-w-[180px] rounded-lg shadow-xl overflow-hidden {dropUp ? 'bottom-full mb-1' : 'top-full mt-1'} {alignRight ? 'right-0' : 'left-0'}"
			transition:fly={{ y: dropUp ? 5 : -5, duration: 150 }}
			role="menu"
		>
			<!-- Server info header -->
			{#if port}
				<div class="px-3 py-2 flex items-center justify-between text-xs server-header">
					<span class="opacity-70">Port</span>
					<span class="font-mono font-bold" style="color: {config.textColor};">
						:{port}
						{#if portRunning}
							<span class="text-success ml-1">active</span>
						{:else}
							<span class="text-warning/70 ml-1">inactive</span>
						{/if}
					</span>
				</div>
			{/if}

			<!-- Destructive confirmation row -->
			{#if confirmingAction}
				<div class="px-3 py-2.5 confirm-row" transition:fade={{ duration: 120 }}>
					<p class="text-xs text-error font-semibold mb-1.5">{confirmingAction.label}?</p>
					<p class="text-xs opacity-60 mb-2">{confirmingAction.description ?? 'This action cannot be undone.'}</p>
					<div class="flex gap-2">
						<button
							type="button"
							onclick={() => (confirmingAction = null)}
							class="flex-1 px-2 py-1 text-[11px] font-semibold rounded confirm-cancel"
						>
							Cancel
						</button>
						<button
							type="button"
							onclick={() => executeAction(confirmingAction!)}
							class="flex-1 px-2 py-1 text-[11px] font-semibold rounded confirm-proceed text-error"
							disabled={executingId !== null}
						>
							{#if executingId === confirmingAction.id}
								<span class="loading loading-spinner loading-xs" aria-label="Running…"></span>
							{:else}
								{confirmingAction.label}
							{/if}
						</button>
					</div>
				</div>
			{/if}

			<!-- Actions list -->
			<ul class="py-1" role="none" onkeydown={handleMenuKeydown}>
				{#each actions as action (action.id)}
					<li role="none">
						<button
							type="button"
							onclick={() => executeAction(action)}
							class="w-full px-3 py-2 flex items-center gap-2 text-left text-xs transition-colors {getVariantClasses(action.variant)}"
							class:opacity-30={confirmingAction !== null && confirmingAction.id !== action.id}
							class:opacity-40={executingId !== null && executingId !== action.id}
							disabled={executingId !== null || confirmingAction !== null}
							role="menuitem"
							aria-label={action.label}
						>
							{#if executingId === action.id}
								<span class="loading loading-spinner loading-xs" aria-label="Running…"></span>
							{:else}
								<svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
									<path stroke-linecap="round" stroke-linejoin="round" d={action.icon} />
								</svg>
							{/if}
							<div class="flex flex-col min-w-0">
								<span class="font-semibold">{action.label}</span>
								{#if action.description}
									<span class="text-xs opacity-70 truncate">{action.description}</span>
								{/if}
							</div>
						</button>
					</li>
				{/each}
			</ul>

			<!-- Inline error — stays open so user can retry -->
			{#if actionError}
				<div class="px-3 py-2 flex items-start gap-2 action-error" role="alert" transition:fly={{ y: -4, duration: 100 }}>
					<svg class="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
					</svg>
					<span class="text-xs text-error leading-snug flex-1">{actionError}</span>
					<button
						type="button"
						onclick={() => (actionError = null)}
						class="flex-shrink-0 text-error/50 hover:text-error transition-colors"
						aria-label="Dismiss error"
					>
						<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			{/if}

			<!-- Session info footer -->
			<div class="px-3 py-1.5 text-[10px] font-mono opacity-60 truncate server-footer">
				{sessionName}
			</div>
		</div>
	{/if}
</div>

<style>
	/* Port status indicators */
	.port-active {
		background: var(--color-success);
	}

	.port-inactive {
		background: var(--color-warning);
		opacity: 0.5;
	}

	/* Dropdown container */
	.server-dropdown {
		background: var(--color-base-300);
		border: 1px solid color-mix(in oklch, var(--color-base-content) 20%, transparent);
	}

	/* Server info header */
	.server-header {
		background: var(--color-base-200);
		border-bottom: 1px solid color-mix(in oklch, var(--color-base-content) 15%, transparent);
	}

	/* Destructive confirmation row */
	.confirm-row {
		background: color-mix(in oklch, var(--color-error) 8%, transparent);
		border-bottom: 1px solid color-mix(in oklch, var(--color-error) 20%, transparent);
	}

	.confirm-cancel {
		background: color-mix(in oklch, var(--color-base-content) 10%, transparent);
		color: var(--color-base-content);
	}

	.confirm-cancel:hover {
		background: color-mix(in oklch, var(--color-base-content) 18%, transparent);
	}

	.confirm-proceed {
		background: color-mix(in oklch, var(--color-error) 15%, transparent);
		border: 1px solid color-mix(in oklch, var(--color-error) 30%, transparent);
	}

	.confirm-proceed:hover:not(:disabled) {
		background: color-mix(in oklch, var(--color-error) 25%, transparent);
	}

	/* Footer */
	.server-footer {
		background: var(--color-base-200);
		border-top: 1px solid color-mix(in oklch, var(--color-base-content) 15%, transparent);
	}

	/* Inline action error */
	.action-error {
		background: color-mix(in oklch, var(--color-error) 12%, transparent);
		border-top: 1px solid color-mix(in oklch, var(--color-error) 25%, transparent);
	}
</style>
