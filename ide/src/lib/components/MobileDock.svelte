<script lang="ts">
	/**
	 * MobileDock - Bottom dock navigation for mobile devices
	 *
	 * Uses DaisyUI dock component. Visible only below md breakpoint (768px).
	 * Replaces sidebar navigation on mobile with thumb-friendly bottom icons.
	 *
	 * Items: Tasks | Inbox | Files | History | New Task
	 */

	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { activeAgentSessionsCount, openTaskDrawer, isMobileFullscreenOpen } from '$lib/stores/drawerStore';
	import { getActiveProject } from '$lib/stores/preferences.svelte';

	const LAST_SEEN_KEY = 'jat-inbox-last-seen';
	const POLL_MS = 15000;

	// Current path for active state
	const currentPath = $derived($page.url.pathname);

	let unreadCount = $state(0);
	let pollTimer: number | null = null;

	async function refreshUnread() {
		try {
			const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
			const params = new URLSearchParams({ limit: '50' });
			if (lastSeen) params.set('since', lastSeen);
			const res = await fetch(`/api/mobile/inbox?${params.toString()}`);
			if (!res.ok) return;
			const data = await res.json();
			unreadCount = data.count || 0;
		} catch {
			// ignore network errors
		}
	}

	onMount(() => {
		refreshUnread();
		pollTimer = window.setInterval(refreshUnread, POLL_MS);
	});

	onDestroy(() => {
		if (pollTimer !== null) clearInterval(pollTimer);
	});

	// Refresh when path changes (e.g. leaving the inbox updates last-seen)
	$effect(() => {
		currentPath;
		refreshUnread();
	});

	// Preserve project param across navigation
	function getNavHref(href: string): string {
		const project = $page.url.searchParams.get('project');
		if (project) {
			return `${href}?project=${encodeURIComponent(project)}`;
		}
		return href;
	}

	function isActive(href: string): boolean {
		return currentPath.startsWith(href);
	}

	function navigate(href: string) {
		goto(getNavHref(href));
	}

	function handleCreateTask() {
		openTaskDrawer(getActiveProject() || undefined);
	}
</script>

<!-- Mobile dock: only visible below md breakpoint, hidden when fullscreen overlay is open -->
{#if !$isMobileFullscreenOpen}
<div class="dock dock-xl md:hidden">
	<!-- Tasks -->
	<button class:dock-active={isActive('/tasks')} onclick={() => navigate('/tasks')}>
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
			<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
		</svg>
		<span class="dock-label">
			Tasks
			{#if $activeAgentSessionsCount > 0}
				<span class="ml-0.5 text-warning">{$activeAgentSessionsCount}</span>
			{/if}
		</span>
	</button>

	<!-- Inbox -->
	<button class:dock-active={isActive('/mobile/inbox')} onclick={() => navigate('/mobile/inbox')} class="relative">
		<div class="relative inline-flex">
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
			</svg>
			{#if unreadCount > 0}
				<span class="absolute -top-1 -right-2 badge badge-xs badge-warning text-[10px] px-1 min-h-0 h-4">
					{unreadCount > 99 ? '99+' : unreadCount}
				</span>
			{/if}
		</div>
		<span class="dock-label">Inbox</span>
	</button>

	<!-- Files -->
	<button class:dock-active={isActive('/files')} onclick={() => navigate('/files')}>
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
			<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
		</svg>
		<span class="dock-label">Files</span>
	</button>

	<!-- History (completed tasks) -->
	<button class:dock-active={isActive('/history')} onclick={() => navigate('/history')}>
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
			<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
		</svg>
		<span class="dock-label">History</span>
	</button>

	<!-- New Task (action) -->
	<button onclick={handleCreateTask}>
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-primary">
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
		</svg>
		<span class="dock-label">New Task</span>
	</button>
</div>
{/if}
