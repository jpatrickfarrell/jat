<script lang="ts">
	/**
	 * GitPanel - Placeholder component for Git operations
	 *
	 * Shows git status, staging, commits, etc.
	 * To be implemented in jat-79a08 (Build GitPanel component)
	 */

	interface Props {
		project: string;
	}

	let { project }: Props = $props();
</script>

<div class="git-panel">
	<div class="placeholder-content">
		<div class="placeholder-icon">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
			</svg>
		</div>
		<div class="placeholder-text">
			<h3>Git Panel</h3>
			<p>View changes, stage files, and commit</p>
		</div>
		<div class="placeholder-project">
			<span class="project-label">Project:</span>
			<span class="project-name">{project}</span>
		</div>
	</div>
</div>

<style>
	.git-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 1rem;
	}

	.placeholder-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
		gap: 1rem;
		text-align: center;
		color: oklch(0.55 0.02 250);
	}

	.placeholder-icon {
		width: 48px;
		height: 48px;
		color: oklch(0.45 0.02 250);
	}

	.placeholder-icon svg {
		width: 100%;
		height: 100%;
	}

	.placeholder-text h3 {
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 600;
		color: oklch(0.70 0.02 250);
	}

	.placeholder-text p {
		margin: 0.25rem 0 0;
		font-size: 0.8125rem;
		color: oklch(0.50 0.02 250);
	}

	.placeholder-project {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: oklch(0.18 0.02 250);
		border-radius: 0.375rem;
		font-size: 0.75rem;
	}

	.project-label {
		color: oklch(0.50 0.02 250);
	}

	.project-name {
		color: oklch(0.70 0.02 250);
		font-family: ui-monospace, monospace;
		font-weight: 500;
	}
</style>
