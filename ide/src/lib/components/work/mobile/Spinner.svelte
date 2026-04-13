<script lang="ts">
	let { size = 14 }: { size?: number } = $props();
</script>

<svg
	class="mobile-spinner"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2.5"
	stroke-linecap="round"
	aria-hidden="true"
>
	<path d="M21 12a9 9 0 1 1-6.22-8.56" />
</svg>

<style>
	.mobile-spinner {
		animation: mobile-spin 0.9s linear infinite;
	}
	@keyframes mobile-spin {
		to { transform: rotate(360deg); }
	}
	@media (prefers-reduced-motion: reduce) {
		.mobile-spinner { animation-duration: 2s; }
	}
</style>
