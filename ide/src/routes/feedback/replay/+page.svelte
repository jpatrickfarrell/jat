<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		const id = new URLSearchParams(window.location.search).get('id');
		if (id) {
			goto(`/feedback/replay/${encodeURIComponent(id)}`, { replaceState: true });
		} else {
			goto('/tasks', { replaceState: true });
		}
	});
</script>
