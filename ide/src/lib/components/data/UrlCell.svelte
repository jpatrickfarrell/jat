<script lang="ts">
	let {
		value = null,
		onSave,
	}: {
		value: any;
		onSave: (val: any) => void;
	} = $props();

	let editing = $state(false);
	let editValue = $state('');

	const displayUrl = $derived.by(() => {
		if (!value) return null;
		try {
			const u = new URL(String(value));
			return u.hostname + (u.pathname !== '/' ? u.pathname : '');
		} catch {
			return String(value);
		}
	});

	function startEdit() {
		editValue = value === null ? '' : String(value);
		editing = true;
	}

	function save() {
		editing = false;
		const newVal = editValue.trim() === '' ? null : editValue.trim();
		if (newVal !== value) onSave(newVal);
	}

	function cancel() {
		editing = false;
	}
</script>

{#if editing}
	<input
		type="url"
		class="cell-edit-input"
		bind:value={editValue}
		placeholder="https://..."
		onkeydown={(e) => {
			if (e.key === 'Enter') save();
			if (e.key === 'Escape') cancel();
		}}
		onblur={save}
		autofocus
	/>
{:else if value}
	<span class="url-cell">
		<a href={String(value)} target="_blank" rel="noopener noreferrer" class="url-link" title={String(value)}>
			{displayUrl}
		</a>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span class="url-edit-trigger" ondblclick={startEdit}>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
			</svg>
		</span>
	</span>
{:else}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span class="cell-value null-value" ondblclick={startEdit}>NULL</span>
{/if}

<style>
	.url-cell {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		min-width: 0;
	}
	.url-link {
		color: oklch(0.70 0.15 230);
		text-decoration: none;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.url-link:hover {
		text-decoration: underline;
	}
	.url-edit-trigger {
		opacity: 0.4;
		cursor: pointer;
		flex-shrink: 0;
	}
	.url-edit-trigger:hover {
		opacity: 0.8;
	}
</style>
