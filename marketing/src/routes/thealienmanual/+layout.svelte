<script lang="ts">
	let { children } = $props();
</script>

<!-- Alien manual has its own full-page design with AlienNav -->
<div class="min-h-screen">
	{@render children()}
</div>
