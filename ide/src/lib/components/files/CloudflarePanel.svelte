<script lang="ts">
	/**
	 * CloudflarePanel - Cloudflare Pages deployments panel for the Source Control page
	 *
	 * Shows:
	 * - Deployment timeline (production + preview)
	 * - Status indicators (success, failure, active, canceled)
	 * - Branch, commit, and trigger info
	 * - Environment filter
	 * - Click to view deployment details in right panel
	 */
	import { onMount } from 'svelte';

	interface Props {
		project: string;
		onDeploymentSelect?: (deployment: DeploymentItem) => void;
		hideHeader?: boolean;
	}

	export interface DeploymentItem {
		id: string;
		shortId: string;
		projectName: string;
		environment: 'production' | 'preview';
		url: string;
		createdOn: string;
		modifiedOn: string;
		status: 'success' | 'failure' | 'active' | 'canceled' | 'idle';
		branch: string;
		commitHash: string;
		commitMessage: string;
		trigger: string;
		stages: { name: string; status: string; started_on: string | null; ended_on: string | null }[];
		isSkipped: boolean;
	}

	let { project, onDeploymentSelect, hideHeader = false }: Props = $props();

	let deployments = $state<DeploymentItem[]>([]);
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let pagesProject = $state('');
	let envFilter = $state<string>('');
	let selectedId = $state<string | null>(null);

	// Pagination
	let currentPage = $state(1);
	let totalPages = $state(1);
	let totalCount = $state(0);

	// Expose state and methods for parent controls
	export function getState() {
		return { totalCount, envFilter, isLoading, currentPage, pagesProject };
	}
	export function setEnvFilter(val: string) {
		envFilter = val;
	}
	export function refresh() {
		fetchDeployments(currentPage);
	}

	async function fetchDeployments(page = 1) {
		isLoading = true;
		error = null;

		try {
			const params = new URLSearchParams({ project, page: page.toString(), per_page: '25' });
			if (envFilter) params.set('env', envFilter);

			const response = await fetch(`/api/cloudflare/deployments?${params}`);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to fetch deployments');
			}

			deployments = data.deployments || [];
			pagesProject = data.pagesProject || '';
			if (data.pagination) {
				currentPage = data.pagination.page;
				totalPages = data.pagination.total_pages;
				totalCount = data.pagination.total_count;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch deployments';
		} finally {
			isLoading = false;
		}
	}

	function handleDeploymentClick(d: DeploymentItem) {
		selectedId = d.id;
		onDeploymentSelect?.(d);
	}

	function formatTime(iso: string): string {
		const d = new Date(iso);
		const now = new Date();
		const diff = now.getTime() - d.getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'just now';
		if (mins < 60) return `${mins}m ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 7) return `${days}d ago`;
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function statusColor(status: string): string {
		switch (status) {
			case 'success': return 'oklch(0.70 0.18 145)';
			case 'failure': return 'oklch(0.70 0.18 25)';
			case 'active': return 'oklch(0.75 0.15 85)';
			case 'canceled': return 'oklch(0.55 0.04 250)';
			default: return 'oklch(0.45 0.02 250)';
		}
	}

	function statusIcon(status: string): string {
		switch (status) {
			case 'success': return '✓';
			case 'failure': return '✕';
			case 'active': return '●';
			case 'canceled': return '⊘';
			default: return '○';
		}
	}

	// Refetch when project or filter changes
	$effect(() => {
		if (project) {
			fetchDeployments(1);
		}
	});

	// Refetch when envFilter changes
	$effect(() => {
		// read envFilter to establish dependency
		const _ = envFilter;
		if (project && !isLoading) {
			fetchDeployments(1);
		}
	});
</script>

<div class="cf-panel">
	<!-- Header with environment filter (hidden when parent provides controls) -->
	{#if !hideHeader}
	<div class="cf-header">
		<div class="cf-header-left">
			<!-- Cloudflare icon (cloud) -->
			<svg class="cf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="M2.25 15a4.5 4.5 0 0 1 0-9h.22A6.75 6.75 0 0 1 15.75 4.5 4.5 4.5 0 0 1 18 13.5h.75a3 3 0 1 1 0 6H2.25z"/>
			</svg>
			<span class="cf-project-name">{pagesProject || project}</span>
			{#if totalCount > 0}
				<span class="cf-count">{totalCount}</span>
			{/if}
		</div>
		<div class="cf-header-right">
			<select
				class="cf-env-filter"
				bind:value={envFilter}
				title="Filter by environment"
			>
				<option value="">All</option>
				<option value="production">Production</option>
				<option value="preview">Preview</option>
			</select>
			<button class="cf-refresh-btn" onclick={() => fetchDeployments(currentPage)} title="Refresh">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="cf-refresh-icon" class:spinning={isLoading}>
					<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
					<path d="M3 3v5h5"/>
					<path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
					<path d="M21 21v-5h-5"/>
				</svg>
			</button>
		</div>
	</div>
	{/if}

	<!-- Deployment list -->
	<div class="cf-list">
		{#if isLoading && deployments.length === 0}
			<div class="cf-loading">
				{#each Array(5) as _, i}
					<div class="cf-skeleton" style="animation-delay: {i * 80}ms;">
						<div class="cf-skeleton-dot"></div>
						<div class="cf-skeleton-lines">
							<div class="cf-skeleton-line w-60"></div>
							<div class="cf-skeleton-line w-40"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else if error}
			<div class="cf-error">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="cf-error-icon">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
				</svg>
				<p class="cf-error-text">{error}</p>
				<button class="cf-retry-btn" onclick={() => fetchDeployments(currentPage)}>Retry</button>
			</div>
		{:else if deployments.length === 0}
			<div class="cf-empty">
				<p>No deployments found</p>
			</div>
		{:else}
			{#each deployments as d (d.id)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="cf-deploy-row"
					class:selected={selectedId === d.id}
					onclick={() => handleDeploymentClick(d)}
				>
					<!-- Status indicator -->
					<div class="cf-status-col">
						<span class="cf-status-dot" style="color: {statusColor(d.status)};" title={d.status}>
							{statusIcon(d.status)}
						</span>
						{#if d.environment === 'production'}
							<div class="cf-env-line production"></div>
						{:else}
							<div class="cf-env-line preview"></div>
						{/if}
					</div>

					<!-- Deployment info -->
					<div class="cf-deploy-info">
						<div class="cf-deploy-header">
							<span class="cf-deploy-env" class:production={d.environment === 'production'} class:preview={d.environment === 'preview'}>
								{d.environment}
							</span>
							<span class="cf-deploy-time">{formatTime(d.createdOn)}</span>
						</div>

						<div class="cf-deploy-commit">
							{#if d.commitMessage}
								<span class="cf-commit-msg" title={d.commitMessage}>
									{d.commitMessage}
								</span>
							{/if}
						</div>

						<div class="cf-deploy-meta">
							<span class="cf-branch" title={d.branch}>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="cf-meta-icon">
									<line x1="6" y1="3" x2="6" y2="15"></line>
									<circle cx="18" cy="6" r="3"></circle>
									<circle cx="6" cy="18" r="3"></circle>
									<path d="M18 9a9 9 0 0 1-9 9"></path>
								</svg>
								{d.branch}
							</span>
							{#if d.commitHash}
								<span class="cf-hash" title={d.commitHash}>{d.commitHash.slice(0, 7)}</span>
							{/if}
							<span class="cf-short-id">#{d.shortId}</span>
						</div>
					</div>
				</div>
			{/each}

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="cf-pagination">
					<button
						class="cf-page-btn"
						disabled={currentPage <= 1}
						onclick={() => fetchDeployments(currentPage - 1)}
					>←</button>
					<span class="cf-page-info">{currentPage} / {totalPages}</span>
					<button
						class="cf-page-btn"
						disabled={currentPage >= totalPages}
						onclick={() => fetchDeployments(currentPage + 1)}
					>→</button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.cf-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	.cf-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.75rem;
		border-bottom: 1px solid oklch(0.22 0.02 250);
		flex-shrink: 0;
	}

	.cf-header-left {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.cf-icon {
		width: 0.875rem;
		height: 0.875rem;
		color: oklch(0.70 0.15 50);
		flex-shrink: 0;
	}

	.cf-project-name {
		font-size: 0.75rem;
		font-weight: 600;
		color: oklch(0.75 0.02 250);
	}

	.cf-count {
		font-size: 0.625rem;
		color: oklch(0.50 0.02 250);
		background: oklch(0.20 0.01 250);
		padding: 0.0625rem 0.375rem;
		border-radius: 999px;
	}

	.cf-header-right {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	.cf-env-filter {
		font-size: 0.6875rem;
		padding: 0.125rem 0.375rem;
		background: oklch(0.18 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.65 0.02 250);
		cursor: pointer;
	}

	.cf-refresh-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		background: transparent;
		border: none;
		border-radius: 0.25rem;
		color: oklch(0.50 0.02 250);
		cursor: pointer;
		transition: all 0.15s;
	}

	.cf-refresh-btn:hover {
		background: oklch(0.20 0.01 250);
		color: oklch(0.70 0.02 250);
	}

	.cf-refresh-icon {
		width: 0.875rem;
		height: 0.875rem;
	}

	.cf-refresh-icon.spinning {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

	/* Deployment list */
	.cf-list {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.cf-deploy-row {
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		border-bottom: 1px solid oklch(0.18 0.01 250);
		transition: background 0.1s;
	}

	.cf-deploy-row:hover {
		background: oklch(0.18 0.01 250);
	}

	.cf-deploy-row.selected {
		background: oklch(0.20 0.02 250);
		border-left: 2px solid oklch(0.70 0.15 50);
	}

	/* Status column with connecting line */
	.cf-status-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 1rem;
		flex-shrink: 0;
		padding-top: 0.125rem;
	}

	.cf-status-dot {
		font-size: 0.75rem;
		line-height: 1;
		font-weight: 700;
	}

	.cf-env-line {
		width: 2px;
		flex: 1;
		min-height: 0.75rem;
		margin-top: 0.25rem;
		border-radius: 1px;
	}

	.cf-env-line.production {
		background: oklch(0.70 0.15 50 / 0.25);
	}

	.cf-env-line.preview {
		background: oklch(0.60 0.12 250 / 0.25);
	}

	/* Deployment info */
	.cf-deploy-info {
		flex: 1;
		min-width: 0;
	}

	.cf-deploy-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: 0.125rem;
	}

	.cf-deploy-env {
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		padding: 0.0625rem 0.3125rem;
		border-radius: 0.1875rem;
	}

	.cf-deploy-env.production {
		color: oklch(0.80 0.15 50);
		background: oklch(0.70 0.15 50 / 0.15);
	}

	.cf-deploy-env.preview {
		color: oklch(0.65 0.10 250);
		background: oklch(0.60 0.08 250 / 0.15);
	}

	.cf-deploy-time {
		font-size: 0.6875rem;
		color: oklch(0.45 0.02 250);
		flex-shrink: 0;
	}

	.cf-deploy-commit {
		margin-bottom: 0.25rem;
	}

	.cf-commit-msg {
		font-size: 0.75rem;
		color: oklch(0.70 0.02 250);
		line-height: 1.3;
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cf-deploy-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.6875rem;
		color: oklch(0.45 0.02 250);
	}

	.cf-branch {
		display: flex;
		align-items: center;
		gap: 0.1875rem;
		max-width: 120px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cf-meta-icon {
		width: 0.625rem;
		height: 0.625rem;
		flex-shrink: 0;
	}

	.cf-hash {
		font-family: monospace;
		font-size: 0.625rem;
		color: oklch(0.50 0.02 250);
	}

	.cf-short-id {
		font-family: monospace;
		font-size: 0.625rem;
		color: oklch(0.40 0.02 250);
	}

	/* Loading skeleton */
	.cf-loading {
		padding: 0.5rem;
	}

	.cf-skeleton {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.5rem 0.25rem;
		opacity: 0;
		animation: fadeIn 0.3s ease forwards;
	}

	@keyframes fadeIn {
		to { opacity: 1; }
	}

	.cf-skeleton-dot {
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 50%;
		background: oklch(0.22 0.02 250);
		flex-shrink: 0;
	}

	.cf-skeleton-lines {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.cf-skeleton-line {
		height: 0.5rem;
		background: oklch(0.20 0.01 250);
		border-radius: 0.125rem;
	}

	.cf-skeleton-line.w-60 { width: 60%; }
	.cf-skeleton-line.w-40 { width: 40%; }

	/* Error state */
	.cf-error {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		text-align: center;
		gap: 0.75rem;
	}

	.cf-error-icon {
		width: 2rem;
		height: 2rem;
		color: oklch(0.60 0.15 25);
	}

	.cf-error-text {
		font-size: 0.8125rem;
		color: oklch(0.55 0.02 250);
	}

	.cf-retry-btn {
		font-size: 0.75rem;
		padding: 0.25rem 0.75rem;
		background: oklch(0.22 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.70 0.02 250);
		cursor: pointer;
		transition: all 0.15s;
	}

	.cf-retry-btn:hover {
		background: oklch(0.28 0.02 250);
	}

	/* Empty state */
	.cf-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		color: oklch(0.45 0.02 250);
		font-size: 0.8125rem;
	}

	/* Pagination */
	.cf-pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 0.5rem;
		border-top: 1px solid oklch(0.20 0.01 250);
	}

	.cf-page-btn {
		font-size: 0.75rem;
		padding: 0.1875rem 0.5rem;
		background: oklch(0.20 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.60 0.02 250);
		cursor: pointer;
		transition: all 0.15s;
	}

	.cf-page-btn:hover:not(:disabled) {
		background: oklch(0.25 0.02 250);
		color: oklch(0.75 0.02 250);
	}

	.cf-page-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.cf-page-info {
		font-size: 0.6875rem;
		color: oklch(0.50 0.02 250);
	}
</style>
