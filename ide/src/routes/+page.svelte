<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { isSetupSkipped } from '$lib/stores/onboardingStore.svelte';

	// Smart redirect: /setup if no projects, /tasks if projects exist
	onMount(async () => {
		try {
			const response = await fetch('/api/projects?visible=true');
			const data = await response.json();
			const projects = data.projects || [];

			if (projects.length === 0 && !isSetupSkipped()) {
				goto('/setup', { replaceState: true });
			} else {
				goto('/tasks', { replaceState: true });
			}
		} catch {
			// On error, fall back to /tasks
			goto('/tasks', { replaceState: true });
		}
	});
</script>

<!-- Redirecting... -->
<div class="min-h-screen bg-base-200 flex items-center justify-center">
	<span class="loading loading-spinner loading-lg"></span>
</div>
