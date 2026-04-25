<script lang="ts">
	/**
	 * FilePeekContent — minimal file preview for peek drawer.
	 *
	 * Used by /files (tree), /memory (browse), /source (git diffs), and any
	 * other route whose `data-nav-id` points to a file path.
	 *
	 * Lightweight by design: shows path, size, ~80 lines of content with
	 * basic syntax-highlighted styling, and a button to open in /files.
	 */

	let { path, project = '' }: { path: string; project?: string } = $props();

	let content = $state<string | null>(null);
	let truncated = $state(false);
	let loading = $state(false);
	let error = $state<string | null>(null);

	const fileName = $derived(path.split('/').pop() || path);
	const ext = $derived(fileName.includes('.') ? fileName.split('.').pop()!.toLowerCase() : '');

	$effect(() => {
		if (!path) return;
		void loadFile(path, project);
	});

	async function loadFile(p: string, proj: string) {
		loading = true;
		error = null;
		content = null;
		try {
			const url = new URL('/api/files/content', window.location.origin);
			url.searchParams.set('path', p);
			if (proj) url.searchParams.set('project', proj);
			const res = await fetch(url.toString());
			if (!res.ok) {
				if (res.status === 415) error = 'Binary file — preview not available.';
				else if (res.status === 413) error = 'File too large to preview.';
				else error = `Couldn't load file (${res.status}).`;
				return;
			}
			const data = await res.json();
			const full = data?.content ?? '';
			const lines = full.split('\n');
			truncated = lines.length > 80;
			content = lines.slice(0, 80).join('\n');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Unknown error';
		} finally {
			loading = false;
		}
	}

	function openInFiles() {
		const url = new URL('/files', window.location.origin);
		if (project) url.searchParams.set('project', project);
		url.searchParams.set('path', path);
		window.location.href = url.toString();
	}
</script>

<article class="file-peek flex flex-col gap-3 p-5">
	<header class="flex flex-col gap-1">
		<h1 class="file-peek-name truncate font-mono text-base font-semibold">{fileName}</h1>
		<p class="file-peek-path truncate text-xs opacity-60">{path}</p>
	</header>

	{#if loading}
		<div class="flex items-center gap-2 text-sm opacity-70">
			<span class="loading loading-spinner loading-sm"></span>
			<span>Loading…</span>
		</div>
	{:else if error}
		<div class="file-peek-error text-sm">{error}</div>
	{:else if content !== null}
		<pre class="file-peek-code overflow-x-auto rounded-md p-3 text-xs leading-relaxed"
			><code>{content}</code></pre>
		{#if truncated}
			<p class="text-[11px] opacity-60">Truncated to 80 lines — open in /files for the full file.</p>
		{/if}
	{/if}

	<footer class="flex items-center gap-2">
		<button type="button" class="btn btn-xs btn-primary" onclick={openInFiles}>
			Open in /files
		</button>
		{#if ext}
			<span class="file-peek-chip text-[11px] uppercase">{ext}</span>
		{/if}
	</footer>
</article>

<style>
	.file-peek-name {
		color: oklch(0.92 0.02 250);
	}

	.file-peek-path {
		color: oklch(0.55 0.02 250);
	}

	.file-peek-code {
		background: oklch(0.10 0.01 250);
		color: oklch(0.85 0.02 250);
		border: 1px solid oklch(0.22 0.02 250);
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		max-height: 60vh;
	}

	.file-peek-error {
		color: oklch(0.80 0.15 25);
	}

	.file-peek-chip {
		display: inline-flex;
		align-items: center;
		padding: 0.125rem 0.4375rem;
		border-radius: 999px;
		background: oklch(0.22 0.02 250);
		color: oklch(0.80 0.02 250);
	}
</style>
