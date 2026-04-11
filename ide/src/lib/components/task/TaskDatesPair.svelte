<script lang="ts">
	import { formatDate } from '$lib/utils/dateFormatters';
	import TaskFieldLabel from './primitives/TaskFieldLabel.svelte';
	import TaskFieldGrid from './primitives/TaskFieldGrid.svelte';
	import TaskFieldCell from './primitives/TaskFieldCell.svelte';

	let {
		createdAt,
		updatedAt,
		label = 'Dates'
	}: {
		createdAt?: string;
		updatedAt?: string;
		label?: string;
	} = $props();
</script>

{#if createdAt || updatedAt}
	<div>
		<TaskFieldLabel>{label}</TaskFieldLabel>
		<TaskFieldGrid>
			{#if createdAt}
				<TaskFieldCell label="Created">{formatDate(createdAt)}</TaskFieldCell>
			{/if}
			{#if updatedAt}
				<TaskFieldCell label="Updated">{formatDate(updatedAt)}</TaskFieldCell>
			{/if}
		</TaskFieldGrid>
	</div>
{/if}
