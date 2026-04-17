<script lang="ts">
	/**
	 * Mobile Inbox — mission control aggregator.
	 *
	 * Aggregates pending needs_input, review, suggested_task, and proposal events
	 * across all active sessions into one chronological list. Tapping a row
	 * deep-links into /tasks with MobileSessionDrawer pre-opened at Timeline/Detail.
	 *
	 * Tracks unread state via localStorage key `jat-inbox-last-seen` so MobileDock
	 * can show an unread count badge.
	 */

	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import AgentAvatar from '$lib/components/AgentAvatar.svelte';
	import type { InboxEvent, InboxResponse } from '../../api/mobile/inbox/+server';

	const LAST_SEEN_KEY = 'jat-inbox-last-seen';
	const POLL_MS = 5000;

	let loading = $state(true);
	let error = $state<string | null>(null);
	let events = $state<InboxEvent[]>([]);
	let agents = $state<string[]>([]);
	let projects = $state<string[]>([]);
	let eventTypes = $state<string[]>([]);

	// Filters
	let agentFilter = $state<string>('');
	let projectFilter = $state<string>('');
	let typeFilter = $state<string>('');

	let pollTimer: number | null = null;

	const TYPE_CONFIG: Record<
		string,
		{ label: string; icon: string; color: string; bg: string }
	> = {
		needs_input: {
			label: 'Needs Input',
			icon: '?',
			color: 'oklch(0.80 0.18 290)',
			bg: 'oklch(0.80 0.18 290 / 0.15)'
		},
		review: {
			label: 'Review',
			icon: '👁',
			color: 'oklch(0.80 0.15 200)',
			bg: 'oklch(0.80 0.15 200 / 0.15)'
		},
		suggested_task: {
			label: 'Suggested',
			icon: '+',
			color: 'oklch(0.80 0.18 145)',
			bg: 'oklch(0.80 0.18 145 / 0.15)'
		},
		proposal: {
			label: 'Proposal',
			icon: '!',
			color: 'oklch(0.80 0.18 85)',
			bg: 'oklch(0.80 0.18 85 / 0.15)'
		}
	};

	async function fetchInbox() {
		try {
			const params = new URLSearchParams();
			if (agentFilter) params.set('agent', agentFilter);
			if (projectFilter) params.set('project', projectFilter);
			if (typeFilter) params.set('type', typeFilter);
			params.set('limit', '200');

			const res = await fetch(`/api/mobile/inbox?${params.toString()}`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data: InboxResponse = await res.json();
			events = data.events;
			agents = data.agents;
			projects = data.projects;
			eventTypes = data.eventTypes;
			error = null;
		} catch (e: any) {
			error = e?.message || 'Failed to fetch inbox';
		} finally {
			loading = false;
		}
	}

	function markAllRead() {
		const latest = events[0]?.timestamp || new Date().toISOString();
		localStorage.setItem(LAST_SEEN_KEY, latest);
	}

	onMount(() => {
		fetchInbox();
		pollTimer = window.setInterval(fetchInbox, POLL_MS);
		return () => {
			if (pollTimer !== null) clearInterval(pollTimer);
		};
	});

	onDestroy(() => {
		// On leave, update last-seen so the dock badge clears correctly.
		if (events.length > 0) {
			localStorage.setItem(LAST_SEEN_KEY, events[0].timestamp);
		}
	});

	function handleRowTap(ev: InboxEvent) {
		// Deep link into /tasks with the drawer pre-opened.
		const targetPage = ev.type === 'needs_input' || ev.type === 'review' ? 'Timeline' : 'Detail';
		const params = new URLSearchParams();
		params.set('session', ev.sessionName);
		params.set('page', targetPage);
		if (ev.project) params.set('project', ev.project);
		localStorage.setItem(LAST_SEEN_KEY, ev.timestamp);
		goto(`/tasks?${params.toString()}`);
	}

	function formatRelative(iso: string): string {
		const then = new Date(iso).getTime();
		const diff = Date.now() - then;
		const sec = Math.floor(diff / 1000);
		if (sec < 60) return `${sec}s ago`;
		const min = Math.floor(sec / 60);
		if (min < 60) return `${min}m ago`;
		const hr = Math.floor(min / 60);
		if (hr < 24) return `${hr}h ago`;
		const day = Math.floor(hr / 24);
		return `${day}d ago`;
	}

	// Re-fetch when filters change
	$effect(() => {
		// Track filter dependencies
		agentFilter;
		projectFilter;
		typeFilter;
		fetchInbox();
	});
</script>

<svelte:head>
	<title>Inbox — JAT</title>
</svelte:head>

<div class="min-h-screen bg-base-100 pb-24">
	<!-- Header -->
	<div class="sticky top-0 z-20 bg-base-100/95 backdrop-blur border-b border-base-300">
		<div class="px-4 pt-3 pb-2">
			<div class="flex items-center justify-between">
				<h1 class="text-lg font-bold">Inbox</h1>
				<div class="flex items-center gap-2">
					<span class="text-xs opacity-60">{events.length} event{events.length === 1 ? '' : 's'}</span>
					{#if events.length > 0}
						<button class="btn btn-xs btn-ghost" onclick={markAllRead} aria-label="Mark all read">
							Mark read
						</button>
					{/if}
				</div>
			</div>

			<!-- Filters -->
			<div class="flex gap-2 mt-2 overflow-x-auto">
				<select class="select select-xs select-bordered" bind:value={typeFilter}>
					<option value="">All types</option>
					{#each eventTypes as t}
						<option value={t}>{TYPE_CONFIG[t]?.label || t}</option>
					{/each}
				</select>
				<select class="select select-xs select-bordered" bind:value={agentFilter}>
					<option value="">All agents</option>
					{#each agents as a}
						<option value={a}>{a}</option>
					{/each}
				</select>
				<select class="select select-xs select-bordered" bind:value={projectFilter}>
					<option value="">All projects</option>
					{#each projects as p}
						<option value={p}>{p}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<!-- Body -->
	{#if loading && events.length === 0}
		<div class="p-6 text-center">
			<span class="loading loading-spinner loading-md"></span>
		</div>
	{:else if error}
		<div class="p-4">
			<div class="alert alert-error text-sm">
				<span>{error}</span>
			</div>
		</div>
	{:else if events.length === 0}
		<div class="p-8 text-center opacity-60">
			<div class="text-4xl mb-2">📭</div>
			<div class="text-sm">No pending events</div>
			<div class="text-xs mt-1">All agents are quiet right now.</div>
		</div>
	{:else}
		<div class="divide-y divide-base-300">
			{#each events as ev (ev.id)}
				{@const cfg = TYPE_CONFIG[ev.type] || { label: ev.type, icon: '•', color: 'oklch(0.7 0.02 240)', bg: 'oklch(0.7 0.02 240 / 0.15)' }}
				<button
					type="button"
					class="w-full px-4 py-3 text-left hover:bg-base-200 active:bg-base-300 transition-colors flex gap-3 items-start"
					onclick={() => handleRowTap(ev)}
				>
					<!-- Avatar -->
					<div class="flex-shrink-0 pt-0.5">
						<AgentAvatar name={ev.agentName} size={36} />
					</div>

					<!-- Content -->
					<div class="flex-1 min-w-0">
						<!-- Row 1: type badge + agent/project + timestamp -->
						<div class="flex items-center gap-1.5 text-xs mb-1 flex-wrap">
							<span
								class="badge badge-xs font-semibold"
								style="color: {cfg.color}; background: {cfg.bg}; border-color: {cfg.color};"
							>
								{cfg.icon} {cfg.label}
							</span>
							<span class="font-medium">{ev.agentName}</span>
							{#if ev.project}
								<span class="opacity-50">·</span>
								<span class="opacity-70">{ev.project}</span>
							{/if}
							<span class="opacity-50">·</span>
							<span class="opacity-60">{formatRelative(ev.timestamp)}</span>
						</div>

						<!-- Row 2: title -->
						<div class="text-sm font-medium line-clamp-2 leading-snug">{ev.title}</div>

						<!-- Row 3: secondary -->
						{#if ev.summary}
							<div class="text-xs opacity-70 mt-0.5 line-clamp-2">{ev.summary}</div>
						{/if}
						{#if ev.taskId}
							<div class="text-xs opacity-50 mt-0.5 font-mono">{ev.taskId}{ev.taskTitle && ev.taskTitle !== ev.title ? ` · ${ev.taskTitle}` : ''}</div>
						{/if}
					</div>

					<!-- Chevron -->
					<div class="flex-shrink-0 opacity-30 pt-1">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
							<polyline points="9 18 15 12 9 6"/>
						</svg>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
