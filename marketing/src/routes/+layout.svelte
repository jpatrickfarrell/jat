<script lang="ts">
	import '../app.css';
	import Nav from '$lib/components/Nav.svelte';
	import { page } from '$app/stores';

	let { children } = $props();

	// Don't show regular Nav on the alien manual page (it has its own)
	let showNav = $derived(!$page.url.pathname.startsWith('/thealienmanual'));
</script>

<div class="min-h-screen bg-[var(--bg-deep)]">
	{#if showNav}
		<Nav />
	{/if}
	{@render children()}
</div>
