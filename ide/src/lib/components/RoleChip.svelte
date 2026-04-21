<script lang="ts">
	interface Props {
		role?: string | null;
	}

	let { role }: Props = $props();

	// Domain role → DaisyUI badge modifier
	const ROLE_BADGE: Record<string, string> = {
		patient:       'badge-info',
		practitioner:  'badge-success',
		doctor:        'badge-success',
		admin:         'badge-secondary',
		agent:         'badge-warning',
		dev:           'badge-neutral',
		system:        'badge-neutral',
	};

	const badgeClass = $derived(
		role ? (ROLE_BADGE[role.toLowerCase()] ?? 'badge-ghost') : ''
	);
</script>

{#if role}
	<span class="badge badge-xs {badgeClass} normal-case font-normal shrink-0">{role}</span>
{/if}
