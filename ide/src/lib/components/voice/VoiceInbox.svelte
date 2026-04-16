<script lang="ts">
	/**
	 * VoiceInbox
	 *
	 * Shows pending voice suggestions from the voice inbox timeline.
	 * The voice API transcribes audio, runs organize-tasks via ollama,
	 * and writes SuggestedTask[] events to /tmp/jat-timeline-jat-voice.jsonl.
	 *
	 * This component mounts EventStack on that virtual session so the user
	 * can review, edit, and selectively import the suggested tasks.
	 *
	 * Header toolbar provides:
	 *   - Dismiss All: clears all visible events from the inbox
	 *   - Merge: multi-select events, concatenate transcripts, re-run organize-tasks
	 */

	import { onMount, onDestroy } from 'svelte';
	import EventStack from '$lib/components/work/EventStack.svelte';
	import type { SuggestedTaskWithState } from '$lib/types/signals';
	import { successToast, errorToast } from '$lib/stores/toasts.svelte';
	import { slide } from 'svelte/transition';

	let {
		availableProjects = [],
		defaultProject = '',
		onHasItems,
		mergeMode = $bindable(false),
		mergeSelectedCount = $bindable(0),
		isMerging = $bindable(false),
		dismissAfterMerge = $bindable(true),
	}: {
		availableProjects?: string[];
		defaultProject?: string;
		onHasItems?: (has: boolean, count?: number) => void;
		mergeMode?: boolean;
		mergeSelectedCount?: number;
		isMerging?: boolean;
		dismissAfterMerge?: boolean;
	} = $props();

	let hasItems = $state(false);
	let itemCount = $state(0);
	let pollTimer: ReturnType<typeof setInterval> | null = null;
	let eventStackRef = $state<{ dismissAll: () => void; dismissEvents: (keys: string[]) => void; getVisibleEvents: () => any[] } | null>(null);

	// Merge mode internal state
	let mergeEvents = $state<any[]>([]);
	let selectedMergeKeys = $state(new Set<string>());

	async function checkForItems() {
		try {
			const res = await fetch('/api/sessions/jat-voice/timeline?limit=50');
			if (!res.ok) return;
			const data = await res.json();
			const events = Array.isArray(data.events) ? data.events : [];
			const newHas = events.length > 0;
			const newCount = events.length;
			if (newHas !== hasItems || newCount !== itemCount) {
				hasItems = newHas;
				itemCount = newCount;
				onHasItems?.(newHas, newCount);
			}
		} catch {
			// ignore — inbox just stays hidden
		}
	}

	onMount(() => {
		checkForItems();
		pollTimer = setInterval(checkForItems, 30000);
	});

	onDestroy(() => {
		if (pollTimer) clearInterval(pollTimer);
	});

	export function dismissAll() {
		eventStackRef?.dismissAll();
		hasItems = false;
		itemCount = 0;
		onHasItems?.(false, 0);
	}

	export async function enterMergeMode() {
		// Fetch current events from the timeline
		try {
			const res = await fetch('/api/sessions/jat-voice/timeline?limit=50');
			if (!res.ok) return;
			const data = await res.json();
			mergeEvents = (data.events || []).filter((e: any) => e.type === 'tasks' && e.data?.transcript);
			selectedMergeKeys = new Set();
			mergeMode = true;
		} catch {
			errorToast('Failed to load voice events');
		}
	}

	export function exitMergeMode() {
		mergeMode = false;
		mergeEvents = [];
		selectedMergeKeys = new Set();
		mergeSelectedCount = 0;
	}

	function getMergeEventKey(event: any): string {
		return `${event.timestamp}-${event.type}-${event.state || ''}`;
	}

	function toggleMergeEvent(key: string) {
		const next = new Set(selectedMergeKeys);
		if (next.has(key)) {
			next.delete(key);
		} else {
			next.add(key);
		}
		selectedMergeKeys = next;
		mergeSelectedCount = next.size;
	}

	export async function executeMerge() {
		if (selectedMergeKeys.size < 2) return;

		const selected = mergeEvents.filter(e => selectedMergeKeys.has(getMergeEventKey(e)));
		const combinedTranscript = selected
			.map((e, i) => {
				const summary = e.data?.title || e.data?.summary || `Voice Note ${i + 1}`;
				return `--- ${summary} ---\n${e.data.transcript}`;
			})
			.join('\n\n');

		isMerging = true;
		try {
			const res = await fetch('/api/tasks/voice', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text: combinedTranscript })
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				throw new Error(err.message || 'Failed to merge voice notes');
			}

			successToast(`Merged ${selectedMergeKeys.size} voice notes — organizing tasks…`);

			if (dismissAfterMerge) {
				const keysToRemove = selected.map(getMergeEventKey);
				eventStackRef?.dismissEvents(keysToRemove);
			}

			exitMergeMode();
		} catch (err: any) {
			errorToast(err.message || 'Merge failed');
		} finally {
			isMerging = false;
		}
	}

	async function createSuggestedTasks(
		tasks: SuggestedTaskWithState[]
	): Promise<{ success: any[]; failed: any[] }> {
		if (tasks.length === 0) return { success: [], failed: [] };

		const tasksToCreate = tasks.map((t) => {
			const baseDesc = t.edits?.description || t.description || '';
			const context = (t as any).context as string | undefined;
			const description = context
				? `${baseDesc}${baseDesc ? '\n\n' : ''}**Voice note context:** ${context}`
				: baseDesc;
			return {
				type: t.edits?.type || t.type || 'task',
				title: t.edits?.title || t.title,
				description,
				priority: t.edits?.priority ?? t.priority ?? 2,
				project: t.edits?.project || t.project || defaultProject || undefined,
				labels: t.edits?.labels || t.labels || undefined,
				depends_on: t.edits?.depends_on || t.depends_on || undefined
			};
		});

		try {
			const response = await fetch('/api/tasks/bulk', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ tasks: tasksToCreate })
			});

			if (!response.ok) {
				const err = await response.json();
				throw new Error(err.message || 'Failed to create tasks');
			}

			const data = await response.json();
			const results = {
				success: data.results?.filter((r: any) => r.success) || [],
				failed: data.results?.filter((r: any) => !r.success) || []
			};

			if (results.success.length > 0) {
				successToast(`Created ${results.success.length} task${results.success.length > 1 ? 's' : ''} from voice note`);
			}
			if (results.failed.length > 0) {
				errorToast(`Failed to create ${results.failed.length} task(s)`);
			}

			return results;
		} catch (err: any) {
			errorToast(err.message);
			return {
				success: [],
				failed: tasks.map((t) => ({ title: t.title, error: err.message }))
			};
		}
	}
</script>


{#if mergeMode}
<div class="voice-merge-list" transition:slide={{ duration: 150 }}>
	{#if mergeEvents.length === 0}
		<div class="voice-merge-empty">No voice notes with transcripts found.</div>
	{:else}
		{#each mergeEvents as event (getMergeEventKey(event))}
			{@const key = getMergeEventKey(event)}
			{@const isSelected = selectedMergeKeys.has(key)}
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<div class="voice-merge-item" class:selected={isSelected} onclick={() => toggleMergeEvent(key)}>
				<input
					type="checkbox"
					checked={isSelected}
					onclick={(e) => e.stopPropagation()}
					onchange={() => toggleMergeEvent(key)}
					class="voice-merge-check"
				/>
				<div class="voice-merge-item-text">
					<span class="voice-merge-item-title">{event.data?.title || event.data?.summary || 'Voice Note'}</span>
					{#if event.data?.transcript}
						<span class="voice-merge-item-preview">{event.data.transcript.slice(0, 120)}{event.data.transcript.length > 120 ? '…' : ''}</span>
					{/if}
				</div>
			</div>
		{/each}
	{/if}
</div>
{/if}

<!-- EventStack renders nothing when there are no voice events -->
<EventStack
	bind:this={eventStackRef}
	sessionName="jat-voice"
	layoutMode="inline"
	pollInterval={15000}
	onCreateTasks={createSuggestedTasks}
	{availableProjects}
	{defaultProject}
/>

<style>

.voice-merge-list {
	border-bottom: 1px solid oklch(0.25 0.02 250 / 0.5);
	max-height: 280px;
	overflow-y: auto;
}

.voice-merge-empty {
	padding: 0.75rem;
	font-size: 0.75rem;
	color: oklch(0.50 0.04 250);
	text-align: center;
}

.voice-merge-item {
	display: flex;
	align-items: flex-start;
	gap: 0.5rem;
	padding: 0.5rem 0.75rem;
	cursor: pointer;
	border-bottom: 1px solid oklch(0.22 0.02 250 / 0.4);
	transition: background 0.1s;
}

.voice-merge-item:hover {
	background: oklch(0.22 0.02 250 / 0.4);
}

.voice-merge-item.selected {
	background: oklch(0.22 0.07 290 / 0.25);
}

.voice-merge-check {
	margin-top: 0.15rem;
	accent-color: oklch(0.65 0.15 290);
	cursor: pointer;
	flex-shrink: 0;
}

.voice-merge-item-text {
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
	min-width: 0;
}

.voice-merge-item-title {
	font-size: 0.75rem;
	font-weight: 500;
	color: oklch(0.75 0.04 250);
	line-height: 1.3;
}

.voice-merge-item-preview {
	font-size: 0.7rem;
	color: oklch(0.50 0.03 250);
	line-height: 1.4;
	white-space: pre-wrap;
	word-break: break-word;
}

.voice-spinner {
	width: 0.8rem;
	height: 0.8rem;
	animation: voice-spin 0.8s linear infinite;
}

@keyframes voice-spin {
	to { transform: rotate(360deg); }
}
</style>
