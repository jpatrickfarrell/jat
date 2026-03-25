<script lang="ts">
	/**
	 * MobileDock - Bottom dock navigation for mobile devices
	 *
	 * Uses DaisyUI dock component. Visible only below md breakpoint (768px).
	 * Replaces sidebar navigation on mobile with thumb-friendly bottom icons.
	 *
	 * Items: Tasks | Files | Data | Bases | New Task
	 */

	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { activeAgentSessionsCount, openTaskDrawer } from '$lib/stores/drawerStore';
	import { getActiveProject } from '$lib/stores/preferences.svelte';

	// Current path for active state
	const currentPath = $derived($page.url.pathname);

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

<!-- Mobile dock: only visible below md breakpoint -->
<div class="dock dock-sm md:hidden">
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

	<!-- Files -->
	<button class:dock-active={isActive('/files')} onclick={() => navigate('/files')}>
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
			<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
		</svg>
		<span class="dock-label">Files</span>
	</button>

	<!-- Data -->
	<button class:dock-active={isActive('/data')} onclick={() => navigate('/data')}>
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
			<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5M3.75 3v18M9.75 3v18M15.75 3v18M20.25 3v18" />
		</svg>
		<span class="dock-label">Data</span>
	</button>

	<!-- Bases -->
	<button class:dock-active={isActive('/bases')} onclick={() => navigate('/bases')}>
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
		</svg>
		<span class="dock-label">Bases</span>
	</button>

	<!-- New Task (action) -->
	<button onclick={handleCreateTask}>
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5 text-primary">
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
		</svg>
		<span class="dock-label">New Task</span>
	</button>
</div>
