<script lang="ts">
	/**
	 * StateCardCompact
	 *
	 * Per-state signal card for TasksActive rows (non-completed states).
	 * Analogous to CompletionCardCompact but for working/starting/needs-input/review/completing.
	 *
	 * Default (always visible):  state badge + signal payload fields
	 * Hover (expanded):          terminal output slides in below (0 → full height)
	 * No signal data:            "NO SIGNAL DATA" badge + terminal output always visible
	 *
	 * Parent should inject: --scc-accent (state accent color)
	 */

	interface SignalEvent {
		type: string;
		state?: string;
		data?: any;
		timestamp?: string;
	}

	let {
		state: stateName = 'idle',
		event = null as SignalEvent | null,
		outputLines = [] as string[],
	}: {
		state: string;
		event: SignalEvent | null;
		outputLines: string[];
	} = $props();

	const bundle = $derived(event?.data ?? null);
	const hasSignal = $derived(bundle !== null);

	// ── starting ─────────────────────────────────────────────────────────────
	const startingModel = $derived.by<string>(() => {
		if (!bundle?.model) return '';
		// Shorten: "claude-opus-4-6" → "opus-4-6", "claude-sonnet-4-6" → "sonnet-4-6"
		return (bundle.model as string).replace(/^claude-/, '');
	});
	const startingBranch = $derived<string>(bundle?.gitBranch ?? '');
	const startingStatus = $derived<string>(bundle?.gitStatus ?? '');
	const startingTools = $derived.by<number>(() => {
		const t = bundle?.tools;
		return Array.isArray(t) ? t.length : 0;
	});
	const startingTaskTitle = $derived<string>(bundle?.taskTitle ?? '');
	const startingUncommitted = $derived.by<string[]>(() => {
		const u = bundle?.uncommittedFiles;
		return Array.isArray(u) ? u : [];
	});

	// ── working ──────────────────────────────────────────────────────────────
	const workingApproach = $derived<string>(bundle?.approach ?? '');
	const workingFiles = $derived.by<string[]>(() => {
		const f = bundle?.expectedFiles;
		if (!f) return [];
		return Array.isArray(f) ? f : [f];
	});

	// ── needs-input ──────────────────────────────────────────────────────────
	const questionText = $derived<string>(bundle?.question ?? '');
	const questionType = $derived<string>(bundle?.questionType ?? '');
	const questionOptions = $derived.by<string[]>(() => {
		const o = bundle?.options;
		if (!o) return [];
		return Array.isArray(o) ? o.map((x: any) => typeof x === 'string' ? x : (x?.label ?? String(x))) : [];
	});

	// ── ready-for-review ─────────────────────────────────────────────────────
	const reviewSummary = $derived.by<string[]>(() => {
		const s = bundle?.summary;
		if (!s) return [];
		if (Array.isArray(s)) return s as string[];
		if (typeof s === 'string') return [s];
		return [];
	});
	const reviewFiles = $derived.by<number>(() => {
		const f = bundle?.filesModified;
		if (!f) return 0;
		return Array.isArray(f) ? f.length : 0;
	});
	const reviewTests = $derived<string>(bundle?.testsStatus ?? '');
	const reviewBuild = $derived<string>(bundle?.buildStatus ?? '');
	const reviewFindings = $derived.by<string[]>(() => {
		const f = bundle?.findings;
		if (!f) return [];
		return Array.isArray(f) ? f as string[] : [];
	});

	let hovered = $state(false);
	const NOSIGNAL_PREVIEW = 4;
	const nosignalPreview = $derived(outputLines.slice(-NOSIGNAL_PREVIEW));
	const nosignalHidden = $derived(outputLines.slice(0, -NOSIGNAL_PREVIEW));
</script>

{#if !hasSignal}
	<!-- No signal data: show badge + last 4 lines; hover reveals full output -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="scc-nosignal" onmouseenter={() => hovered = true} onmouseleave={() => hovered = false}>
		{#if stateName === 'compacting'}
			<div class="scc-completing scc-completing-compact">
				<svg class="animate-spin scc-completing-spinner scc-compacting-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="10" height="10">
					<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
				</svg>
				<span>Compacting context…</span>
			</div>
		{:else}
			<div class="scc-nosignal-header">
				<span class="scc-nosignal-badge">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="9" height="9">
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
					</svg>
					NO SIGNAL
				</span>
				{#if nosignalHidden.length > 0}
					<span class="scc-nosignal-more">+{nosignalHidden.length} lines</span>
				{/if}
			</div>
		{/if}
		{#if outputLines.length > 0}
			<!-- Hidden overflow lines: reveal on hover via grid trick -->
			{#if nosignalHidden.length > 0}
				<div class="scc-output-wrapper" class:scc-output-expanded={hovered}>
					<div class="scc-output-inner">
						{#each nosignalHidden as line}
							<div class="scc-output-line">{line || '\u00a0'}</div>
						{/each}
					</div>
				</div>
			{/if}
			<!-- Always-visible preview: last 4 lines -->
			<div class="scc-output scc-output-preview">
				{#each nosignalPreview as line}
					<div class="scc-output-line">{line || '\u00a0'}</div>
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="scc-root"
		onmouseenter={() => hovered = true}
		onmouseleave={() => hovered = false}
	>
		<!-- ── State content ──────────────────────────────────────────────── -->
		{#if stateName === 'starting'}
			<div class="scc-row scc-row-starting">
				{#if startingTaskTitle}
					<span class="scc-task-title">{startingTaskTitle}</span>
					<span class="scc-sep">·</span>
				{/if}
				{#if startingModel}
					<span class="scc-mono scc-model">{startingModel}</span>
				{/if}
				{#if startingBranch}
					<span class="scc-sep">·</span>
					<span class="scc-mono scc-branch">{startingBranch}</span>
					{#if startingStatus}
						<span class="scc-git-dot" class:scc-git-clean={startingStatus === 'clean'} class:scc-git-dirty={startingStatus !== 'clean'}></span>
					{/if}
				{/if}
				{#if startingTools > 0}
					<span class="scc-sep">·</span>
					<span class="scc-dim">{startingTools} tools</span>
				{/if}
			</div>
			{#if startingUncommitted.length > 0}
				<div class="scc-uncommitted">
					{#each startingUncommitted.slice(0, 4) as f}
						<span class="scc-file">{f.split('/').pop()}</span>
					{/each}
					{#if startingUncommitted.length > 4}
						<span class="scc-more">+{startingUncommitted.length - 4}</span>
					{/if}
				</div>
			{/if}

		{:else if stateName === 'working'}
			{#if workingApproach}
				<p class="scc-approach">{workingApproach}</p>
			{/if}
			{#if workingFiles.length > 0}
				<div class="scc-files">
					{#each workingFiles.slice(0, 4) as f}
						<span class="scc-file">{f.split('/').pop() || f}</span>
					{/each}
					{#if workingFiles.length > 4}
						<span class="scc-more">+{workingFiles.length - 4}</span>
					{/if}
				</div>
			{/if}

		{:else if stateName === 'needs-input'}
			{#if questionText}
				<p class="scc-question">{questionText}</p>
			{/if}
			<div class="scc-question-meta">
				{#if questionType}
					<span class="scc-qtype">{questionType}</span>
				{/if}
				{#if questionOptions.length > 0}
					{#each questionOptions.slice(0, 3) as opt}
						<span class="scc-option-chip">{opt}</span>
					{/each}
					{#if questionOptions.length > 3}
						<span class="scc-more">+{questionOptions.length - 3}</span>
					{/if}
				{/if}
			</div>

		{:else if stateName === 'ready-for-review'}
			{#if reviewSummary.length > 0}
				<ul class="scc-summary">
					{#each reviewSummary.slice(0, 3) as item}
						<li class="scc-summary-item">
							<span class="scc-bullet">•</span>
							<span>{item}</span>
						</li>
					{/each}
					{#if reviewSummary.length > 3}
						<li class="scc-summary-item scc-summary-more">
							<span class="scc-bullet">•</span>
							<span>+{reviewSummary.length - 3} more</span>
						</li>
					{/if}
				</ul>
			{:else if reviewFindings.length > 0}
				<ul class="scc-summary">
					{#each reviewFindings.slice(0, 3) as item}
						<li class="scc-summary-item">
							<span class="scc-bullet">•</span>
							<span>{item}</span>
						</li>
					{/each}
				</ul>
			{/if}
			{#if reviewFiles > 0 || reviewTests || reviewBuild}
				<div class="scc-review-meta">
					{#if reviewFiles > 0}
						<span class="scc-meta-chip">{reviewFiles} file{reviewFiles !== 1 ? 's' : ''}</span>
					{/if}
					{#if reviewTests}
						<span class="scc-meta-chip scc-meta-{reviewTests === 'passing' ? 'ok' : 'warn'}">{reviewTests}</span>
					{/if}
					{#if reviewBuild}
						<span class="scc-meta-chip scc-meta-{reviewBuild === 'clean' ? 'ok' : 'warn'}">{reviewBuild}</span>
					{/if}
				</div>
			{/if}

		{:else if stateName === 'completing'}
			<div class="scc-completing">
				<svg class="animate-spin scc-completing-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="10" height="10">
					<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
				</svg>
				<span>Running /jat:complete…</span>
			</div>

		{:else if stateName === 'compacting'}
			<div class="scc-completing scc-completing-compact">
				<svg class="animate-spin scc-completing-spinner scc-compacting-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="10" height="10">
					<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
				</svg>
				<span>Compacting context…</span>
			</div>
		{/if}

		<!-- ── Terminal output: 0 height → full on hover ──────────────────── -->
		{#if outputLines.length > 0}
			<div class="scc-output-wrapper" class:scc-output-expanded={hovered}>
				<div class="scc-output-inner">
					{#each outputLines as line}
						<div class="scc-output-line">{line || '\u00a0'}</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.scc-root {
		padding: 0.25rem 0;
	}

	/* ── Rows & layout ─────────────────────────────────────────────────────── */
	.scc-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.25rem;
		font-size: 0.65rem;
		line-height: 1.4;
	}

	.scc-row-starting {
		color: oklch(0.65 0.03 250);
	}

	.scc-sep {
		color: oklch(0.40 0.02 250);
	}

	.scc-dim {
		color: oklch(0.50 0.03 250);
	}

	/* ── Text elements ─────────────────────────────────────────────────────── */
	.scc-task-title {
		font-size: 0.65rem;
		color: oklch(0.68 0.04 250);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 140px;
	}

	.scc-mono {
		font-family: ui-monospace, 'Cascadia Code', monospace;
	}

	.scc-model {
		font-size: 0.6rem;
		color: var(--scc-accent, oklch(0.65 0.15 240));
		letter-spacing: 0.01em;
	}

	.scc-branch {
		font-size: 0.6rem;
		color: oklch(0.60 0.04 250);
	}

	/* ── Git status dot ────────────────────────────────────────────────────── */
	.scc-git-dot {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		flex-shrink: 0;
		margin-left: 1px;
	}

	.scc-git-clean {
		background: oklch(0.65 0.18 145);
	}

	.scc-git-dirty {
		background: oklch(0.72 0.14 85);
	}

	/* ── Approach text ─────────────────────────────────────────────────────── */
	.scc-approach {
		margin: 0;
		font-size: 0.68rem;
		line-height: 1.45;
		color: oklch(0.70 0.03 250);
		/* Clamp to 2 lines */
		line-clamp: 2;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* ── Question ──────────────────────────────────────────────────────────── */
	.scc-question {
		margin: 0 0 0.25rem;
		font-size: 0.68rem;
		line-height: 1.45;
		color: oklch(0.72 0.03 250);
		line-clamp: 2;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.scc-question-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.2rem;
	}

	.scc-qtype {
		font-size: 0.55rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--scc-accent, oklch(0.65 0.15 240));
		background: color-mix(in oklch, var(--scc-accent, oklch(0.65 0.15 240)) 12%, transparent);
		border: 1px solid color-mix(in oklch, var(--scc-accent, oklch(0.65 0.15 240)) 30%, transparent);
		border-radius: 3px;
		padding: 0.1rem 0.3rem;
	}

	.scc-option-chip {
		font-size: 0.58rem;
		color: oklch(0.60 0.03 250);
		background: oklch(0.18 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 3px;
		padding: 0.1rem 0.3rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 120px;
	}

	/* ── Review summary ────────────────────────────────────────────────────── */
	.scc-summary {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.scc-summary-item {
		display: flex;
		gap: 0.3rem;
		font-size: 0.67rem;
		line-height: 1.4;
		color: oklch(0.68 0.03 250);
	}

	.scc-summary-more {
		color: oklch(0.48 0.02 250);
	}

	.scc-bullet {
		color: var(--scc-accent, oklch(0.65 0.18 145));
		flex-shrink: 0;
	}

	/* ── Review meta chips ─────────────────────────────────────────────────── */
	.scc-review-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem;
		margin-top: 0.25rem;
	}

	.scc-meta-chip {
		font-size: 0.57rem;
		font-weight: 500;
		padding: 0.1rem 0.3rem;
		border-radius: 3px;
		background: oklch(0.20 0.01 250);
		border: 1px solid oklch(0.26 0.02 250);
		color: oklch(0.58 0.03 250);
	}

	.scc-meta-ok {
		color: oklch(0.68 0.16 145);
		background: oklch(0.55 0.16 145 / 0.12);
		border-color: oklch(0.55 0.16 145 / 0.28);
	}

	.scc-meta-warn {
		color: oklch(0.72 0.14 85);
		background: oklch(0.60 0.14 85 / 0.12);
		border-color: oklch(0.60 0.14 85 / 0.28);
	}

	/* ── File chips (starting uncommitted / working expected) ──────────────── */
	.scc-files,
	.scc-uncommitted {
		display: flex;
		flex-wrap: wrap;
		gap: 0.18rem;
		margin-top: 0.2rem;
	}

	.scc-file {
		font-family: ui-monospace, 'Cascadia Code', monospace;
		font-size: 0.58rem;
		padding: 0.08rem 0.28rem;
		background: oklch(0.18 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 3px;
		color: oklch(0.60 0.04 250);
		white-space: nowrap;
	}

	.scc-more {
		font-size: 0.57rem;
		color: oklch(0.48 0.02 250);
		align-self: center;
	}

	/* ── Completing ─────────────────────────────────────────────────────────── */
	.scc-completing {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.65rem;
		color: oklch(0.65 0.12 175);
	}

	.scc-completing-spinner {
		color: oklch(0.65 0.12 175);
		flex-shrink: 0;
	}

	.scc-completing-compact {
		color: oklch(0.70 0.12 280);
	}

	.scc-compacting-spinner {
		color: oklch(0.70 0.12 280);
	}

	/* ── No-signal fallback ─────────────────────────────────────────────────── */
	.scc-nosignal {
		padding: 0.2rem 0;
	}

	.scc-nosignal-header {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin-bottom: 0.25rem;
	}

	.scc-nosignal-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.57rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		color: oklch(0.68 0.12 40);
		background: oklch(0.55 0.10 40 / 0.12);
		border: 1px solid oklch(0.55 0.10 40 / 0.30);
		border-radius: 3px;
		padding: 0.1rem 0.35rem;
	}

	.scc-nosignal-more {
		font-size: 0.55rem;
		color: oklch(0.45 0.02 250);
		letter-spacing: 0.02em;
	}

	.scc-output-preview {
		/* Preview lines are always visible, no extra margin needed */
	}

	/* ── Terminal output expand wrapper (grid trick) ────────────────────────── */
	.scc-output-wrapper {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 180ms ease-out;
		overflow: hidden;
	}

	/* Only expand on real hover-capable devices */
	@media (hover: hover) and (min-width: 640px) {
		.scc-output-expanded {
			grid-template-rows: 1fr;
		}
	}

	.scc-output-inner {
		min-height: 0;
		padding-top: 0.35rem;
	}

	/* ── Output lines ───────────────────────────────────────────────────────── */
	.scc-output-line {
		font-family: ui-monospace, 'Cascadia Code', monospace;
		font-size: 0.6rem;
		line-height: 1.5;
		color: oklch(0.58 0.03 250);
		white-space: pre-wrap;
		word-break: break-all;
	}

	.scc-nosignal .scc-output {
		margin-top: 0.1rem;
	}
</style>
