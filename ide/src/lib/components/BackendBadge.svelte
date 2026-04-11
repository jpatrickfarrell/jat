<script lang="ts">
	import { goto } from '$app/navigation';

	interface Props {
		backend: 'sqlite' | 'postgres';
		project: string;
		/** Optional member count for team projects */
		memberCount?: number | null;
		/** Visual size variant */
		size?: 'xs' | 'sm';
	}

	let {
		backend,
		project,
		memberCount = null,
		size = 'xs'
	}: Props = $props();

	const isTeam = $derived(backend === 'postgres');
	const label = $derived(isTeam ? 'Team' : 'Solo');

	const tooltip = $derived(
		isTeam
			? memberCount != null
				? `Team — tasks stored in shared Postgres, ${memberCount} ${memberCount === 1 ? 'member' : 'members'}`
				: 'Team — tasks stored in shared Postgres'
			: 'Solo — tasks stored in .jat/tasks.db on this machine'
	);

	function openSharingTab(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		goto(`/config?project=${encodeURIComponent(project)}&tab=sharing`);
	}
</script>

<button
	type="button"
	class="backend-badge"
	class:team={isTeam}
	class:solo={!isTeam}
	class:size-sm={size === 'sm'}
	onclick={openSharingTab}
	title={tooltip}
	aria-label={tooltip}
>
	{label}
</button>

<style>
	.backend-badge {
		display: inline-flex;
		align-items: center;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-family: ui-monospace, 'Fira Code', monospace;
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		line-height: 1;
		cursor: pointer;
		transition: filter 0.15s ease, transform 0.15s ease;
		border: 1px solid transparent;
		white-space: nowrap;
	}

	.backend-badge.size-sm {
		padding: 0.1875rem 0.5rem;
		font-size: 0.6875rem;
	}

	.backend-badge:hover {
		filter: brightness(1.2);
		transform: translateY(-1px);
	}

	.backend-badge:active {
		transform: translateY(0);
	}

	.backend-badge.solo {
		background: oklch(0.30 0.02 250);
		color: oklch(0.75 0.02 250);
		border-color: oklch(0.40 0.02 250);
	}

	.backend-badge.team {
		background: oklch(0.45 0.15 280 / 0.25);
		color: oklch(0.80 0.15 280);
		border-color: oklch(0.60 0.15 280 / 0.5);
		box-shadow: 0 0 8px oklch(0.60 0.15 280 / 0.3);
	}
</style>
