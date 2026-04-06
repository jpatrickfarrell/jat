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
	 */

	import EventStack from '$lib/components/work/EventStack.svelte';
	import type { SuggestedTaskWithState } from '$lib/types/signals';
	import { successToast, errorToast } from '$lib/stores/toasts.svelte';

	let { availableProjects = [], defaultProject = '' }: {
		availableProjects?: string[];
		defaultProject?: string;
	} = $props();

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

<!-- EventStack renders nothing when there are no voice events -->
<EventStack
	sessionName="jat-voice"
	layoutMode="inline"
	pollInterval={15000}
	onCreateTasks={createSuggestedTasks}
	{availableProjects}
	{defaultProject}
/>
