<script lang="ts">
	/**
	 * Redirect: /work → /dash
	 * The dashboard has been moved to /dash for better naming clarity.
	 */
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('/dash', { replaceState: true });
	});
</script>

<div class="min-h-screen bg-base-200 flex items-center justify-center">
	<span class="loading loading-spinner loading-lg"></span>
</div>
