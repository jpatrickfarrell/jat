<script lang="ts">
	/**
	 * Triage — Task Refinement Queue
	 *
	 * One screen to review all actionable tasks across projects.
	 * See everything submitted/open/in-progress, then quickly:
	 * solve (spawn agent), assign, edit, close, or delete.
	 *
	 * Layout: Left queue panel + Right detail panel
	 * Keyboard: J/K navigate, S spawn, P promote, R reject, E edit, D delete, / filter
	 */
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { getIssueTypeVisual } from '$lib/config/statusColors';
	import { getProjectColor } from '$lib/utils/projectColors';
	import { formatShortDate, formatRelativeTimestamp } from '$lib/utils/dateFormatters';
	import { addToast } from '$lib/stores/toasts.svelte';
	import { broadcastTaskEvent } from '$lib/stores/taskEvents';
	import { getProjectFromTaskId } from '$lib/utils/projectUtils';
	import SearchDropdown from '$lib/components/SearchDropdown.svelte';
	import type { SearchDropdownGroup } from '$lib/components/SearchDropdown.svelte';
	import { createListNav } from '$lib/actions/listNav';
	import KeyboardShortcutsOverlay from '$lib/components/KeyboardShortcutsOverlay.svelte';
	import BulkActionBar from '$lib/components/BulkActionBar.svelte';
	import { openTaskDetailDrawer } from '$lib/stores/drawerStore';

	interface Task {
		id: string;
		title: string;
		description?: string;
		status: string;
		priority: number;
		issue_type?: string;
		assignee?: string;
		labels?: string[];
		created_at?: string;
		updated_at?: string;
		due_date?: string | null;
		parent_id?: string;
		source?: string;
	}

	// Queue state
	let tasks = $state<Task[]>([]);
	let loading = $state(true);
	let selectedIdx = $state(0);
	let selectedTask = $derived(tasks[selectedIdx] ?? null);
	let refreshInterval: ReturnType<typeof setInterval> | null = null;

	// Filters
	let filterProject = $state('all');
	let filterType = $state('all');
	let filterStatus = $state('all');
	let filterSearch = $state('');
	let availableProjects = $derived.by(() => {
		const set = new Set<string>();
		for (const t of tasks) {
			const p = getProjectFromTaskId(t.id);
			if (p) set.add(p);
		}
		return Array.from(set).sort();
	});

	const projectGroups = $derived.by<SearchDropdownGroup[]>(() => [{
		label: 'Projects',
		options: [
			{ value: 'all', label: 'All Projects' },
			...availableProjects.map(p => ({ value: p, label: p }))
		]
	}]);

	const statusGroups: SearchDropdownGroup[] = [{
		label: 'Status',
		options: [
			{ value: 'all', label: 'All Statuses' },
			{ value: 'submitted', label: 'Submitted' },
			{ value: 'open', label: 'Open' },
			{ value: 'in_progress', label: 'In Progress' }
		]
	}];

	const typeGroups: SearchDropdownGroup[] = [{
		label: 'Type',
		options: [
			{ value: 'all', label: 'All Types' },
			{ value: 'bug', label: 'Bug' },
			{ value: 'feature', label: 'Feature' },
			{ value: 'task', label: 'Task' },
			{ value: 'chore', label: 'Chore' },
			{ value: 'chat', label: 'Chat' }
		]
	}];

	function projectColorFn(val: string): string | undefined {
		if (!val || val === 'all') return undefined;
		return getProjectColor(val + '-x');
	}

	function statusColorFn(val: string): string | undefined {
		if (!val || val === 'all') return undefined;
		return getStatusColor(val);
	}

	let filteredTasks = $derived.by(() => {
		let result = tasks;
		if (filterProject !== 'all') {
			result = result.filter(t => getProjectFromTaskId(t.id) === filterProject);
		}
		if (filterType !== 'all') {
			result = result.filter(t => t.issue_type === filterType);
		}
		if (filterStatus !== 'all') {
			result = result.filter(t => t.status === filterStatus);
		}
		if (filterSearch.trim()) {
			const q = filterSearch.toLowerCase();
			result = result.filter(t =>
				t.title.toLowerCase().includes(q) ||
				t.id.toLowerCase().includes(q) ||
				(t.description?.toLowerCase().includes(q) ?? false)
			);
		}
		return result;
	});

	// Detail editing state
	let editing = $state(false);
	let editTitle = $state('');
	let editDescription = $state('');
	let editPriority = $state(2);
	let editType = $state('task');
	let editAssignee = $state('');
	let editLabels = $state('');
	let saving = $state(false);
	let promoting = $state(false);
	let rejecting = $state(false);
	let spawning = $state(false);
	let deleting = $state(false);

	// Epics for assignment
	let epics = $state<Task[]>([]);

	// Bulk-selection state (populated by listNav's selection layer)
	let selectedIds = $state<Set<string>>(new Set());
	let bulkAssignOpen = $state(false);
	let bulkWorking = $state(false);

	// listNav composable for j/k navigation with wraparound + V/Shift+J range-select
	const nav = createListNav({
		getItems: () => Array.from(document.querySelectorAll<HTMLElement>('[data-nav-id]')),
		onSelect: (_el, idx) => {
			selectedIdx = idx;
			if (filteredTasks[idx]) openTaskDetailDrawer(filteredTasks[idx].id);
		},
		onFocusChange: (_el, idx) => {
			if (idx >= 0) selectedIdx = idx;
		},
		wraparound: true,
	});

	onMount(() => {
		load();
		loadEpics();
		refreshInterval = setInterval(load, 8000);
	});
	onDestroy(() => { if (refreshInterval) clearInterval(refreshInterval); });

	async function load() {
		try {
			// Fetch all actionable statuses in parallel
			const [submittedRes, openRes, inProgressRes] = await Promise.all([
				fetch('/api/tasks?status=submitted&limit=200'),
				fetch('/api/tasks?status=open&limit=200'),
				fetch('/api/tasks?status=in_progress&limit=200')
			]);

			const parse = async (r: Response) => r.ok ? ((await r.json()).tasks || []) : [];
			const [submitted, open, inProgress] = await Promise.all([
				parse(submittedRes), parse(openRes), parse(inProgressRes)
			]);

			// Combine, dedup by id, exclude epics
			const seen = new Set<string>();
			const items: Task[] = [];
			for (const t of [...submitted, ...open, ...inProgress]) {
				if (seen.has(t.id) || t.issue_type === 'epic') continue;
				seen.add(t.id);
				items.push(t);
			}

			// Sort: submitted first, then by priority, then by created_at.
			// Parse timestamps numerically — postgres-backed projects (meadow) return
			// `created_at` as Date.toString() format, not ISO, so localeCompare would
			// sort alphabetically by weekday name instead of chronologically.
			const statusOrder: Record<string, number> = { submitted: 0, open: 1, in_progress: 2 };
			const ts = (s: string | undefined | null): number => {
				if (!s) return 0;
				const t = new Date(s).getTime();
				return Number.isFinite(t) ? t : 0;
			};
			items.sort((a, b) => {
				const sa = statusOrder[a.status] ?? 9;
				const sb = statusOrder[b.status] ?? 9;
				if (sa !== sb) return sa - sb;
				if (a.priority !== b.priority) return a.priority - b.priority;
				return ts(a.created_at) - ts(b.created_at);
			});

			tasks = items;

			// Keep selection in bounds
			if (selectedIdx >= filteredTasks.length) {
				selectedIdx = Math.max(0, filteredTasks.length - 1);
			}
		} catch {
			// silent
		} finally {
			loading = false;
		}
	}

	async function loadEpics() {
		try {
			const res = await fetch('/api/tasks?status=open&limit=100');
			if (res.ok) {
				const data = await res.json();
				epics = (data.tasks || []).filter((t: Task) => t.issue_type === 'epic');
			}
		} catch {
			// silent
		}
	}

	function startEdit() {
		if (!selectedTask) return;
		editTitle = selectedTask.title;
		editDescription = selectedTask.description ?? '';
		editPriority = selectedTask.priority;
		editType = selectedTask.issue_type ?? 'task';
		editAssignee = selectedTask.assignee ?? '';
		editLabels = selectedTask.labels?.join(', ') ?? '';
		editing = true;
	}

	function cancelEdit() {
		editing = false;
	}

	async function saveEdit() {
		if (!selectedTask || saving) return;
		saving = true;
		try {
			const res = await fetch(`/api/tasks/${selectedTask.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: editTitle,
					description: editDescription,
					priority: editPriority,
					type: editType,
					assignee: editAssignee || undefined,
					labels: editLabels ? editLabels.split(',').map(l => l.trim()).filter(Boolean) : []
				})
			});
			if (res.ok) {
				addToast({ message: 'Task updated', type: 'success' });
				editing = false;
				await load();
				broadcastTaskEvent('task-updated',selectedTask.id);
			} else {
				const d = await res.json().catch(() => ({}));
				addToast({ message: d.error || 'Failed to save', type: 'error' });
			}
		} catch {
			addToast({ message: 'Failed to save', type: 'error' });
		} finally {
			saving = false;
		}
	}

	async function promote(taskId?: string) {
		const task = taskId ? tasks.find(t => t.id === taskId) : selectedTask;
		if (!task || promoting) return;
		promoting = true;
		try {
			const res = await fetch(`/api/tasks/${task.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: 'open' })
			});
			if (res.ok) {
				addToast({ message: `Promoted: ${task.title}`, type: 'success' });
				broadcastTaskEvent('task-updated',task.id);
				await load();
			} else {
				addToast({ message: 'Failed to promote', type: 'error' });
			}
		} catch {
			addToast({ message: 'Failed to promote', type: 'error' });
		} finally {
			promoting = false;
		}
	}

	async function reject(taskId?: string) {
		const task = taskId ? tasks.find(t => t.id === taskId) : selectedTask;
		if (!task || rejecting) return;
		rejecting = true;
		try {
			const res = await fetch(`/api/tasks/${task.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: 'closed', close_reason: 'Rejected in triage' })
			});
			if (res.ok) {
				addToast({ message: `Rejected: ${task.title}`, type: 'info' });
				broadcastTaskEvent('task-updated',task.id);
				await load();
			} else {
				addToast({ message: 'Failed to reject', type: 'error' });
			}
		} catch {
			addToast({ message: 'Failed to reject', type: 'error' });
		} finally {
			rejecting = false;
		}
	}

	async function spawnTask() {
		if (!selectedTask || spawning) return;
		spawning = true;
		try {
			const res = await fetch('/api/work/spawn', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ taskId: selectedTask.id })
			});
			if (res.ok) {
				addToast({ message: `Agent launched for: ${selectedTask.title}`, type: 'success' });
				broadcastTaskEvent('task-updated', selectedTask.id);
				await load();
			} else {
				const d = await res.json().catch(() => ({}));
				addToast({ message: d.message || 'Failed to spawn', type: 'error' });
			}
		} catch {
			addToast({ message: 'Failed to spawn agent', type: 'error' });
		} finally {
			spawning = false;
		}
	}

	async function deleteTask() {
		if (!selectedTask || deleting) return;
		const confirm = window.confirm(`Delete "${selectedTask.title}"? This cannot be undone.`);
		if (!confirm) return;
		deleting = true;
		try {
			const res = await fetch(`/api/tasks/${selectedTask.id}`, { method: 'DELETE' });
			if (res.ok) {
				addToast({ message: `Deleted: ${selectedTask.title}`, type: 'info' });
				broadcastTaskEvent('task-updated', selectedTask.id);
				await load();
			} else {
				addToast({ message: 'Failed to delete', type: 'error' });
			}
		} catch {
			addToast({ message: 'Failed to delete', type: 'error' });
		} finally {
			deleting = false;
		}
	}

	async function assignToEpic(epicId: string) {
		if (!selectedTask) return;
		try {
			const res = await fetch(`/api/tasks/${selectedTask.id}/deps`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ parentId: epicId, childId: selectedTask.id })
			});
			if (res.ok) {
				addToast({ message: 'Assigned to epic', type: 'success' });
				await load();
			} else {
				addToast({ message: 'Failed to assign', type: 'error' });
			}
		} catch {
			addToast({ message: 'Failed to assign', type: 'error' });
		}
	}

	async function promoteAll() {
		const toPromote = filteredTasks;
		if (toPromote.length === 0) return;
		const confirm = window.confirm(`Promote all ${toPromote.length} tasks to open?`);
		if (!confirm) return;

		let success = 0;
		for (const task of toPromote) {
			try {
				const res = await fetch(`/api/tasks/${task.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ status: 'open' })
				});
				if (res.ok) success++;
			} catch { /* continue */ }
		}
		addToast({ message: `Promoted ${success}/${toPromote.length} tasks`, type: 'success' });
		await load();
	}

	async function dismissAll() {
		const toDismiss = filteredTasks;
		if (toDismiss.length === 0) return;
		const confirm = window.confirm(`Reject all ${toDismiss.length} tasks?`);
		if (!confirm) return;

		let success = 0;
		for (const task of toDismiss) {
			try {
				const res = await fetch(`/api/tasks/${task.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ status: 'closed', close_reason: 'Bulk rejected in triage' })
				});
				if (res.ok) success++;
			} catch { /* continue */ }
		}
		addToast({ message: `Rejected ${success}/${toDismiss.length} tasks`, type: 'info' });
		await load();
	}

	// --- Bulk actions (operate on nav.selectedIds) ---

	async function bulkClose() {
		const ids = Array.from(selectedIds);
		if (ids.length === 0 || bulkWorking) return;
		if (!window.confirm(`Close ${ids.length} task${ids.length === 1 ? '' : 's'}?`)) return;
		bulkWorking = true;
		let success = 0;
		try {
			for (const id of ids) {
				try {
					const res = await fetch(`/api/tasks/${id}`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ status: 'closed', close_reason: 'Bulk-closed from triage' })
					});
					if (res.ok) { success++; broadcastTaskEvent('task-updated', id); }
				} catch { /* continue */ }
			}
			addToast({ message: `Closed ${success}/${ids.length} tasks`, type: success === ids.length ? 'success' : 'info' });
			selectedIds = new Set();
			await load();
		} finally {
			bulkWorking = false;
		}
	}

	async function bulkDelete() {
		const ids = Array.from(selectedIds);
		if (ids.length === 0 || bulkWorking) return;
		if (!window.confirm(`Delete ${ids.length} task${ids.length === 1 ? '' : 's'}? This cannot be undone.`)) return;
		bulkWorking = true;
		let success = 0;
		try {
			for (const id of ids) {
				try {
					const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
					if (res.ok) { success++; broadcastTaskEvent('task-updated', id); }
				} catch { /* continue */ }
			}
			addToast({ message: `Deleted ${success}/${ids.length} tasks`, type: success === ids.length ? 'success' : 'info' });
			selectedIds = new Set();
			await load();
		} finally {
			bulkWorking = false;
		}
	}

	async function bulkSetStatus(status: string) {
		const ids = Array.from(selectedIds);
		if (ids.length === 0 || bulkWorking) return;
		bulkWorking = true;
		let success = 0;
		try {
			for (const id of ids) {
				try {
					const res = await fetch(`/api/tasks/${id}`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ status })
					});
					if (res.ok) { success++; broadcastTaskEvent('task-updated', id); }
				} catch { /* continue */ }
			}
			addToast({ message: `Updated ${success}/${ids.length} tasks → ${status}`, type: success === ids.length ? 'success' : 'info' });
			selectedIds = new Set();
			await load();
		} finally {
			bulkWorking = false;
		}
	}

	async function bulkAssignToEpic(epicId: string) {
		const ids = Array.from(selectedIds);
		if (ids.length === 0 || bulkWorking) return;
		bulkWorking = true;
		let success = 0;
		try {
			for (const id of ids) {
				try {
					const res = await fetch(`/api/tasks/${id}/deps`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ parentId: epicId, childId: id })
					});
					if (res.ok) success++;
				} catch { /* continue */ }
			}
			addToast({ message: `Assigned ${success}/${ids.length} tasks to epic`, type: success === ids.length ? 'success' : 'info' });
			bulkAssignOpen = false;
			selectedIds = new Set();
			await load();
		} finally {
			bulkWorking = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.ctrlKey || e.metaKey || e.altKey) return;

		// Don't capture when typing in inputs
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

		if (!editing) {
			// x — toggle select focused task
			if (e.key === 'x') {
				const task = filteredTasks[selectedIdx];
				if (task) {
					e.preventDefault();
					const next = new Set(selectedIds);
					if (next.has(task.id)) next.delete(task.id); else next.add(task.id);
					selectedIds = next;
					return;
				}
			}

			// Shift+J — select current + move down
			if (e.key === 'J') {
				e.preventDefault();
				const before = selectedIdx;
				const afterIdx = Math.min(before + 1, filteredTasks.length - 1);
				nav.focus(afterIdx);
				const next = new Set(selectedIds);
				if (filteredTasks[before]) next.add(filteredTasks[before].id);
				if (filteredTasks[afterIdx]) next.add(filteredTasks[afterIdx].id);
				selectedIds = next;
				return;
			}

			// Shift+K — select current + move up
			if (e.key === 'K') {
				e.preventDefault();
				const before = selectedIdx;
				const afterIdx = Math.max(before - 1, 0);
				nav.focus(afterIdx);
				const next = new Set(selectedIds);
				if (filteredTasks[before]) next.add(filteredTasks[before].id);
				if (filteredTasks[afterIdx]) next.add(filteredTasks[afterIdx].id);
				selectedIds = next;
				return;
			}

			// * — toggle select all visible
			if (e.key === '*') {
				e.preventDefault();
				const allSelected = filteredTasks.length > 0 && filteredTasks.every(t => selectedIds.has(t.id));
				selectedIds = allSelected ? new Set() : new Set(filteredTasks.map(t => t.id));
				return;
			}

			// Escape clears selection before clearing nav focus
			if (e.key === 'Escape' && selectedIds.size > 0) {
				e.preventDefault();
				selectedIds = new Set();
				if (bulkAssignOpen) bulkAssignOpen = false;
				return;
			}
		}

		// Let listNav handle j/k/ArrowDown/ArrowUp/Enter/Space/Escape when not editing
		if (!editing && nav.handleKeydown(e)) return;

		// Bulk-action keys fire only when a selection exists
		if (!editing && selectedIds.size > 0) {
			switch (e.key) {
				case 'c':
					e.preventDefault(); bulkClose(); return;
				case 'a':
					e.preventDefault();
					if (epics.length > 0) bulkAssignOpen = true;
					else addToast({ message: 'No epics available to assign to', type: 'info' });
					return;
				case 'd':
					e.preventDefault(); bulkDelete(); return;
				case 's':
					e.preventDefault(); bulkSetStatus('open'); return;
			}
		}

		switch (e.key) {
			case 's':
				if (!editing) { e.preventDefault(); spawnTask(); }
				break;
			case 'p':
				if (!editing) { e.preventDefault(); promote(); }
				break;
			case 'r':
				if (!editing) { e.preventDefault(); reject(); }
				break;
			case 'e':
				if (!editing) { e.preventDefault(); startEdit(); }
				break;
			case 'd':
				if (!editing) { e.preventDefault(); deleteTask(); }
				break;
			case 'Escape':
				if (editing) cancelEdit();
				if (bulkAssignOpen) bulkAssignOpen = false;
				break;
			case '/':
				if (!editing) {
					e.preventDefault();
					document.getElementById('triage-search')?.focus();
				}
				break;
		}
	}

	function getPriorityLabel(p: number): string {
		return ['P0 Critical', 'P1 High', 'P2 Medium', 'P3 Low', 'P4 Lowest'][p] ?? `P${p}`;
	}

	function getPriorityColor(p: number): string {
		const colors = ['oklch(0.65 0.20 25)', 'oklch(0.70 0.18 50)', 'oklch(0.65 0.15 220)', 'oklch(0.50 0.04 250)', 'oklch(0.40 0.02 250)'];
		return colors[p] ?? colors[2];
	}

	function getStatusColor(s: string): string {
		const map: Record<string, string> = {
			submitted: 'oklch(0.70 0.15 280)',
			open: 'oklch(0.65 0.15 220)',
			in_progress: 'oklch(0.70 0.18 85)',
			blocked: 'oklch(0.65 0.18 25)'
		};
		return map[s] ?? 'oklch(0.50 0.04 250)';
	}

	function getStatusLabel(s: string): string {
		const map: Record<string, string> = {
			submitted: 'Submitted',
			open: 'Open',
			in_progress: 'In Progress',
			blocked: 'Blocked'
		};
		return map[s] ?? s;
	}
</script>

<svelte:head><title>Triage ({filteredTasks.length})</title></svelte:head>
<svelte:window onkeydown={handleKeydown} />

<div class="triage-page">
	<!-- Header -->
	<div class="triage-header">
		<div class="header-left">
			<h1>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /></svg>
				Triage
			</h1>
			<span class="queue-count">{filteredTasks.length}</span>
		</div>
		<div class="header-actions">
			<button class="btn-action btn-promote-all" onclick={promoteAll} disabled={filteredTasks.length === 0} title="Promote all visible to open">
				Promote All
			</button>
			<button class="btn-action btn-dismiss-all" onclick={dismissAll} disabled={filteredTasks.length === 0} title="Reject all visible">
				Dismiss All
			</button>
			<button class="btn-action btn-help" onclick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))} title="Keyboard shortcuts (?)">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>
			</button>
		</div>
	</div>

	<!-- Filter bar -->
	<div class="filter-bar">
		<div class="filter-group">
			<SearchDropdown
				value={filterProject}
				groups={projectGroups}
				placeholder="All Projects"
				colorFn={projectColorFn}
				variant="chip"
				onChange={(v) => { filterProject = v; }}
			/>
			<SearchDropdown
				value={filterStatus}
				groups={statusGroups}
				placeholder="All Statuses"
				colorFn={statusColorFn}
				variant="chip"
				onChange={(v) => { filterStatus = v; }}
			/>
			<SearchDropdown
				value={filterType}
				groups={typeGroups}
				placeholder="All Types"
				variant="chip"
				onChange={(v) => { filterType = v; }}
			/>
		</div>
		<div class="filter-search-wrap">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" class="search-icon"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
			<input
				id="triage-search"
				type="text"
				class="filter-search"
				placeholder="Search... (/)"
				bind:value={filterSearch}
			/>
		</div>
	</div>

	{#if loading}
		<div class="triage-loading" in:fade>
			<div class="animate-spin" style="width:28px;height:28px;border:2.5px solid oklch(0.25 0.03 250);border-top-color:oklch(0.60 0.15 220);border-radius:50%;"></div>
		</div>
	{:else if filteredTasks.length === 0}
		<div class="triage-empty" in:fade>
			<div class="empty-icon">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
			</div>
			<p class="empty-title">Queue is clear</p>
			<p class="empty-sub">No items to triage right now.</p>
			<p class="empty-sub" style="margin-top: 0.5rem; font-size: 0.7rem; opacity: 0.4;">j/k to navigate · ? for shortcuts</p>
		</div>
	{:else}
		<div class="triage-content">
			<!-- Left: Queue list -->
			<div class="queue-panel">
				{#each filteredTasks as task, idx (task.id)}
					{@const typeVisual = getIssueTypeVisual(task.issue_type)}
					{@const projColor = getProjectColor(getProjectFromTaskId(task.id) ?? '')}
					{@const isSelected = idx === selectedIdx}
					{@const isBulkSelected = selectedIds.has(task.id)}
					<button
						class="queue-item"
						class:queue-item-selected={isSelected}
						class:queue-item-bulk={isBulkSelected}
						data-nav-id={task.id}
						data-triage-idx={idx}
						onclick={() => { selectedIdx = idx; editing = false; nav.focus(idx); }}
					>
						<div
							class="qi-accent"
							style="background: {isBulkSelected ? 'oklch(0.70 0.18 240)' : projColor};"
							role="checkbox"
							aria-checked={isBulkSelected}
							aria-label="Select {task.id}"
							tabindex="-1"
							onclick={(e) => {
								e.stopPropagation();
								const next = new Set(selectedIds);
								if (next.has(task.id)) next.delete(task.id); else next.add(task.id);
								selectedIds = next;
							}}
						>{isBulkSelected ? '✓' : ''}</div>
						<div class="qi-body">
							<div class="qi-top">
								<span class="qi-type" title={typeVisual.label}>{typeVisual.icon}</span>
								<span class="qi-title">{task.title}</span>
								<span class="qi-priority" style="color: {getPriorityColor(task.priority)};">P{task.priority}</span>
							</div>
							<div class="qi-meta">
								<span class="qi-id">{task.id}</span>
								<span class="qi-status" style="color: {getStatusColor(task.status)};">{getStatusLabel(task.status)}</span>
								{#if task.created_at}
									<span class="qi-date">{formatRelativeTimestamp(task.created_at)}</span>
								{/if}
								{#if task.labels?.length}
									{#each task.labels.slice(0, 2) as label}
										<span class="qi-label">{label}</span>
									{/each}
								{/if}
							</div>
						</div>
					</button>
				{/each}
			</div>

			<!-- Right: Detail panel -->
			<div class="detail-panel">
				{#if selectedTask}
					{@const typeVisual = getIssueTypeVisual(selectedTask.issue_type)}
					{@const projColor = getProjectColor(getProjectFromTaskId(selectedTask.id) ?? '')}

					<div class="detail-header">
						<div class="detail-type-badge" style="background: {typeVisual.accent}; color: white;">
							{typeVisual.icon} {typeVisual.label}
						</div>
						<span class="detail-id">{selectedTask.id}</span>
						<span class="detail-status" style="color: {getStatusColor(selectedTask.status)};">{getStatusLabel(selectedTask.status)}</span>
						<div class="detail-priority" style="color: {getPriorityColor(selectedTask.priority)};">
							{getPriorityLabel(selectedTask.priority)}
						</div>
					</div>

					{#if !editing}
						<!-- View mode -->
						<div class="detail-body">
							<h2 class="detail-title">{selectedTask.title}</h2>

							{#if selectedTask.description}
								<div class="detail-description">{selectedTask.description}</div>
							{:else}
								<p class="detail-no-desc">No description</p>
							{/if}

							<div class="detail-fields">
								{#if selectedTask.assignee}
									<div class="detail-field">
										<span class="field-label">Assignee</span>
										<span class="field-value">{selectedTask.assignee}</span>
									</div>
								{/if}
								{#if selectedTask.labels?.length}
									<div class="detail-field">
										<span class="field-label">Labels</span>
										<div class="detail-labels">
											{#each selectedTask.labels as label}
												<span class="detail-label-tag">{label}</span>
											{/each}
										</div>
									</div>
								{/if}
								{#if selectedTask.parent_id}
									<div class="detail-field">
										<span class="field-label">Epic</span>
										<span class="field-value">{selectedTask.parent_id}</span>
									</div>
								{/if}
								{#if selectedTask.due_date}
									<div class="detail-field">
										<span class="field-label">Due</span>
										<span class="field-value">{formatShortDate(selectedTask.due_date)}</span>
									</div>
								{/if}
								<div class="detail-field">
									<span class="field-label">Created</span>
									<span class="field-value">{selectedTask.created_at ? formatRelativeTimestamp(selectedTask.created_at) : '—'}</span>
								</div>
							</div>

							{#if epics.length > 0}
								<div class="detail-section">
									<span class="section-label">Assign to Epic</span>
									<div class="epic-list">
										{#each epics as epic}
											<button class="epic-btn" onclick={() => assignToEpic(epic.id)}>
												<span class="epic-priority" style="color: {getPriorityColor(epic.priority)};">P{epic.priority}</span>
												{epic.title}
											</button>
										{/each}
									</div>
								</div>
							{/if}
						</div>

						<!-- Action bar -->
						<div class="detail-actions">
							<button
								class="action-btn action-spawn"
								onclick={spawnTask}
								disabled={spawning || selectedTask.status === 'in_progress'}
								title="Spawn agent (S)"
							>
								{#if spawning}
									<span class="animate-spin" style="display:inline-block;width:14px;height:14px;border:2px solid transparent;border-top-color:white;border-radius:50%;"></span>
								{:else}
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
								{/if}
								Solve
								<kbd>S</kbd>
							</button>
							<button
								class="action-btn action-promote"
								onclick={() => promote()}
								disabled={promoting}
								title="Promote to open (P)"
							>
								{#if promoting}
									<span class="animate-spin" style="display:inline-block;width:14px;height:14px;border:2px solid transparent;border-top-color:white;border-radius:50%;"></span>
								{:else}
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" /></svg>
								{/if}
								Promote
								<kbd>P</kbd>
							</button>
							<button
								class="action-btn action-edit"
								onclick={startEdit}
								title="Edit fields (E)"
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
								Edit
								<kbd>E</kbd>
							</button>
							<button
								class="action-btn action-reject"
								onclick={() => reject()}
								disabled={rejecting}
								title="Close task (R)"
							>
								{#if rejecting}
									<span class="animate-spin" style="display:inline-block;width:14px;height:14px;border:2px solid transparent;border-top-color:white;border-radius:50%;"></span>
								{:else}
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
								{/if}
								Close
								<kbd>R</kbd>
							</button>
							<button
								class="action-btn action-delete"
								onclick={deleteTask}
								disabled={deleting}
								title="Delete task (D)"
							>
								{#if deleting}
									<span class="animate-spin" style="display:inline-block;width:14px;height:14px;border:2px solid transparent;border-top-color:white;border-radius:50%;"></span>
								{:else}
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
								{/if}
								Delete
								<kbd>D</kbd>
							</button>
						</div>

					{:else}
						<!-- Edit mode -->
						<div class="detail-body edit-mode">
							<div class="edit-field">
								<label class="edit-label" for="edit-title">Title</label>
								<input id="edit-title" type="text" class="edit-input" bind:value={editTitle} />
							</div>
							<div class="edit-field">
								<label class="edit-label" for="edit-desc">Description</label>
								<textarea id="edit-desc" class="edit-textarea" bind:value={editDescription} rows="6"></textarea>
							</div>
							<div class="edit-row">
								<div class="edit-field edit-field-half">
									<label class="edit-label" for="edit-priority">Priority</label>
									<select id="edit-priority" class="edit-select" bind:value={editPriority}>
										<option value={0}>P0 - Critical</option>
										<option value={1}>P1 - High</option>
										<option value={2}>P2 - Medium</option>
										<option value={3}>P3 - Low</option>
										<option value={4}>P4 - Lowest</option>
									</select>
								</div>
								<div class="edit-field edit-field-half">
									<label class="edit-label" for="edit-type">Type</label>
									<select id="edit-type" class="edit-select" bind:value={editType}>
										<option value="bug">Bug</option>
										<option value="feature">Feature</option>
										<option value="task">Task</option>
										<option value="chore">Chore</option>
										<option value="chat">Chat</option>
									</select>
								</div>
							</div>
							<div class="edit-field">
								<label class="edit-label" for="edit-assignee">Assignee</label>
								<input id="edit-assignee" type="text" class="edit-input" bind:value={editAssignee} placeholder="Agent or person name" />
							</div>
							<div class="edit-field">
								<label class="edit-label" for="edit-labels">Labels</label>
								<input id="edit-labels" type="text" class="edit-input" bind:value={editLabels} placeholder="Comma-separated labels" />
							</div>
						</div>

						<div class="detail-actions">
							<button class="action-btn action-cancel" onclick={cancelEdit}>
								Cancel
								<kbd>Esc</kbd>
							</button>
							<button class="action-btn action-save" onclick={saveEdit} disabled={saving}>
								{#if saving}
									<span class="animate-spin" style="display:inline-block;width:14px;height:14px;border:2px solid transparent;border-top-color:white;border-radius:50%;"></span>
								{/if}
								Save Changes
							</button>
						</div>
					{/if}
				{:else}
					<div class="detail-empty">
						<p>Select a task from the queue</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<KeyboardShortcutsOverlay
	title="Triage Shortcuts"
	shortcuts={[
		{ key: 'j / ↓', description: 'Next item (wraps)' },
		{ key: 'k / ↑', description: 'Previous item (wraps)' },
		{ key: 'Enter', description: 'Open detail drawer' },
		{ key: 'x', description: 'Toggle select focused task' },
		{ key: 'Shift+J / Shift+K', description: 'Select + move down / up' },
		{ key: '*', description: 'Select / deselect all visible' },
		{ key: 's', description: 'Spawn agent (solve) / bulk: set status open' },
		{ key: 'p', description: 'Promote to open' },
		{ key: 'e', description: 'Edit task' },
		{ key: 'r', description: 'Close task' },
		{ key: 'c', description: 'Bulk: close selected' },
		{ key: 'a', description: 'Bulk: assign to epic' },
		{ key: 'd', description: 'Delete task / bulk: delete selected' },
		{ key: '/', description: 'Focus search' },
		{ key: 'Esc', description: 'Clear selection / cancel edit' },
	]}
/>

<BulkActionBar
	count={selectedIds.size}
	label={selectedIds.size === 1 ? 'task selected' : 'tasks selected'}
	actions={[
		{ key: 's', label: 'Open', onAction: () => bulkSetStatus('open'), disabled: bulkWorking },
		{ key: 'c', label: 'Close', onAction: bulkClose, disabled: bulkWorking },
		{ key: 'a', label: 'Assign to Epic', onAction: () => { if (epics.length > 0) bulkAssignOpen = true; }, disabled: bulkWorking || epics.length === 0 },
		{ key: 'd', label: 'Delete', onAction: bulkDelete, danger: true, disabled: bulkWorking }
	]}
	onClear={() => selectedIds = new Set()}
/>

{#if bulkAssignOpen}
	<div
		class="bulk-modal-overlay"
		role="button"
		tabindex="-1"
		onclick={() => { bulkAssignOpen = false; }}
		onkeydown={(e) => { if (e.key === 'Escape') bulkAssignOpen = false; }}
	>
		<div
			class="bulk-modal"
			role="dialog"
			aria-modal="true"
			aria-label="Assign tasks to epic"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			tabindex="-1"
		>
			<div class="bulk-modal-header">
				<h3>Assign {selectedIds.size} task{selectedIds.size === 1 ? '' : 's'} to epic</h3>
				<button class="bulk-modal-close" onclick={() => { bulkAssignOpen = false; }} aria-label="Close">×</button>
			</div>
			<div class="bulk-modal-body">
				{#each epics as epic (epic.id)}
					<button
						class="bulk-epic-btn"
						disabled={bulkWorking}
						onclick={() => bulkAssignToEpic(epic.id)}
					>
						<span class="bulk-epic-priority" style="color: {getPriorityColor(epic.priority)};">P{epic.priority}</span>
						<span class="bulk-epic-title">{epic.title}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	/* ========== Layout ========== */
	.triage-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
		background: oklch(0.13 0.01 250);
		color: oklch(0.80 0.03 250);
	}

	/* ========== Header ========== */
	.triage-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.6rem 1rem;
		border-bottom: 1px solid oklch(0.22 0.02 250);
		background: oklch(0.14 0.01 250);
		flex-shrink: 0;
	}
	.header-left {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	.header-left h1 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: oklch(0.75 0.04 250);
		margin: 0;
	}
	.queue-count {
		font-size: 0.7rem;
		font-weight: 700;
		padding: 0.1rem 0.45rem;
		border-radius: 8px;
		background: oklch(0.70 0.18 240 / 0.2);
		color: oklch(0.75 0.15 240);
	}
	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}
	.btn-action {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.3rem 0.65rem;
		border-radius: 6px;
		border: 1px solid oklch(0.25 0.03 250);
		background: oklch(0.18 0.02 250);
		color: oklch(0.60 0.04 250);
		cursor: pointer;
		transition: background 0.1s;
	}
	.btn-action:hover:not(:disabled) { background: oklch(0.22 0.03 250); }
	.btn-action:disabled { opacity: 0.4; cursor: not-allowed; }
	.btn-promote-all { color: oklch(0.65 0.18 145); border-color: oklch(0.50 0.15 145 / 0.3); }
	.btn-dismiss-all { color: oklch(0.65 0.15 25); border-color: oklch(0.50 0.12 25 / 0.3); }
	.btn-help {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		padding: 0;
	}

	/* ========== Filter bar ========== */
	.filter-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 1rem;
		border-bottom: 1px solid oklch(0.20 0.02 250);
		background: oklch(0.135 0.01 250);
		flex-shrink: 0;
	}
	.filter-group {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.filter-search-wrap {
		flex: 1;
		position: relative;
		max-width: 280px;
	}
	.search-icon {
		position: absolute;
		left: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		color: oklch(0.40 0.03 250);
		pointer-events: none;
	}
	.filter-search {
		width: 100%;
		font-size: 0.7rem;
		padding: 0.25rem 0.5rem 0.25rem 1.75rem;
		border-radius: 5px;
		border: 1px solid oklch(0.25 0.02 250);
		background: oklch(0.18 0.01 250);
		color: oklch(0.75 0.03 250);
		outline: none;
	}
	.filter-search:focus { border-color: oklch(0.55 0.15 220); }
	.filter-search::placeholder { color: oklch(0.40 0.03 250); }

	/* ========== Loading / Empty ========== */
	.triage-loading, .triage-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
		gap: 0.75rem;
		color: oklch(0.45 0.03 250);
	}
	.empty-icon { color: oklch(0.50 0.15 145); }
	.empty-title { font-size: 1rem; font-weight: 600; color: oklch(0.60 0.04 250); margin: 0; }
	.empty-sub { font-size: 0.8rem; margin: 0; }

	/* ========== Content split ========== */
	.triage-content {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	/* ========== Queue panel (left) ========== */
	.queue-panel {
		width: 380px;
		min-width: 280px;
		border-right: 1px solid oklch(0.20 0.02 250);
		overflow-y: auto;
		flex-shrink: 0;
	}
	.queue-item {
		display: flex;
		align-items: stretch;
		width: 100%;
		padding: 0;
		border: none;
		border-bottom: 1px solid oklch(0.18 0.02 250 / 0.6);
		background: transparent;
		cursor: pointer;
		text-align: left;
		color: inherit;
		transition: background 0.08s;
	}
	.queue-item:hover { background: oklch(0.17 0.02 250 / 0.5); }
	.queue-item-selected {
		background: oklch(0.70 0.18 240 / 0.08) !important;
		border-left: 2px solid oklch(0.70 0.18 240);
	}
	.queue-item-bulk {
		background: oklch(0.70 0.18 240 / 0.10) !important;
	}
	.qi-accent {
		width: 3px;
		flex-shrink: 0;
		opacity: 0.6;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0;
		transition: width 0.15s ease, background 0.15s ease;
		border: none;
		padding: 0;
		user-select: none;
	}
	.queue-item-bulk .qi-accent,
	.queue-item:hover .qi-accent {
		width: 14px;
		opacity: 1;
	}
	.queue-item-bulk .qi-accent {
		font-size: 0.6rem;
		color: white;
	}
	.queue-item-selected .qi-accent { opacity: 0; }
	.qi-body {
		flex: 1;
		padding: 0.5rem 0.75rem;
		min-width: 0;
	}
	.qi-top {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		margin-bottom: 0.2rem;
	}
	.qi-type { font-size: 0.72rem; flex-shrink: 0; }
	.qi-title {
		font-size: 0.78rem;
		font-weight: 500;
		color: oklch(0.78 0.03 250);
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1.3;
	}
	.queue-item-selected .qi-title { color: oklch(0.88 0.04 250); font-weight: 600; }
	.qi-priority {
		font-size: 0.6rem;
		font-weight: 700;
		flex-shrink: 0;
	}
	.qi-meta {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		flex-wrap: wrap;
	}
	.qi-id {
		font-size: 0.58rem;
		color: oklch(0.40 0.02 250);
		font-family: ui-monospace, monospace;
	}
	.qi-status {
		font-size: 0.55rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.qi-date {
		font-size: 0.58rem;
		color: oklch(0.42 0.02 250);
	}
	.qi-label {
		font-size: 0.55rem;
		padding: 0.05rem 0.3rem;
		border-radius: 3px;
		background: oklch(0.22 0.02 250);
		color: oklch(0.50 0.03 250);
	}

	/* ========== Detail panel (right) ========== */
	.detail-panel {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.detail-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		color: oklch(0.40 0.03 250);
		font-size: 0.85rem;
	}

	.detail-header {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.75rem 1.25rem;
		border-bottom: 1px solid oklch(0.20 0.02 250);
		flex-shrink: 0;
	}
	.detail-type-badge {
		font-size: 0.65rem;
		font-weight: 700;
		padding: 0.2rem 0.55rem;
		border-radius: 5px;
		letter-spacing: 0.03em;
		text-transform: uppercase;
	}
	.detail-id {
		font-size: 0.65rem;
		color: oklch(0.45 0.03 250);
		font-family: ui-monospace, monospace;
	}
	.detail-status {
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.detail-priority {
		font-size: 0.7rem;
		font-weight: 700;
		margin-left: auto;
	}

	.detail-body {
		flex: 1;
		overflow-y: auto;
		padding: 1.25rem;
	}
	.detail-title {
		font-size: 1.1rem;
		font-weight: 700;
		color: oklch(0.90 0.03 250);
		margin: 0 0 0.75rem;
		line-height: 1.35;
	}
	.detail-description {
		font-size: 0.82rem;
		color: oklch(0.68 0.03 250);
		line-height: 1.6;
		white-space: pre-wrap;
		margin-bottom: 1.25rem;
		padding: 0.75rem;
		background: oklch(0.16 0.01 250);
		border-radius: 8px;
		border: 1px solid oklch(0.22 0.02 250);
	}
	.detail-no-desc {
		font-size: 0.8rem;
		color: oklch(0.38 0.02 250);
		font-style: italic;
		margin-bottom: 1rem;
	}

	.detail-fields {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-bottom: 1.25rem;
	}
	.detail-field {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
	}
	.field-label {
		font-size: 0.7rem;
		font-weight: 600;
		color: oklch(0.50 0.03 250);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		min-width: 80px;
		flex-shrink: 0;
		padding-top: 0.1rem;
	}
	.field-value {
		font-size: 0.8rem;
		color: oklch(0.72 0.03 250);
	}
	.detail-labels {
		display: flex;
		gap: 0.3rem;
		flex-wrap: wrap;
	}
	.detail-label-tag {
		font-size: 0.65rem;
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		background: oklch(0.22 0.02 250);
		color: oklch(0.58 0.04 250);
	}

	.detail-section {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid oklch(0.20 0.02 250);
	}
	.section-label {
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: oklch(0.50 0.03 250);
		margin-bottom: 0.5rem;
		display: block;
	}
	.epic-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.epic-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0.6rem;
		font-size: 0.75rem;
		color: oklch(0.68 0.03 250);
		background: oklch(0.17 0.01 250);
		border: 1px solid oklch(0.23 0.02 250);
		border-radius: 5px;
		cursor: pointer;
		text-align: left;
		transition: background 0.1s;
	}
	.epic-btn:hover { background: oklch(0.22 0.03 250); }
	.epic-priority {
		font-size: 0.6rem;
		font-weight: 700;
		flex-shrink: 0;
	}

	/* ========== Action bar ========== */
	.detail-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 1.25rem;
		border-top: 1px solid oklch(0.20 0.02 250);
		background: oklch(0.14 0.01 250);
		flex-shrink: 0;
	}
	.action-btn {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.4rem 0.8rem;
		border-radius: 6px;
		border: 1px solid oklch(0.28 0.03 250);
		background: oklch(0.18 0.02 250);
		color: oklch(0.65 0.04 250);
		cursor: pointer;
		transition: background 0.1s;
	}
	.action-btn:hover:not(:disabled) { background: oklch(0.22 0.03 250); }
	.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
	.action-btn kbd {
		font-size: 0.55rem;
		padding: 0.1rem 0.3rem;
		border-radius: 3px;
		background: oklch(0.22 0.02 250);
		color: oklch(0.50 0.03 250);
		font-family: ui-monospace, monospace;
	}

	.action-promote {
		color: oklch(0.70 0.18 145);
		border-color: oklch(0.50 0.15 145 / 0.4);
		background: oklch(0.50 0.18 145 / 0.1);
	}
	.action-promote:hover:not(:disabled) { background: oklch(0.50 0.18 145 / 0.2); }

	.action-reject {
		color: oklch(0.70 0.15 25);
		border-color: oklch(0.50 0.12 25 / 0.4);
		background: oklch(0.50 0.15 25 / 0.1);
	}
	.action-reject:hover:not(:disabled) { background: oklch(0.50 0.15 25 / 0.2); }

	.action-spawn {
		color: oklch(0.75 0.18 145);
		border-color: oklch(0.55 0.15 145 / 0.4);
		background: oklch(0.55 0.18 145 / 0.12);
	}
	.action-spawn:hover:not(:disabled) { background: oklch(0.55 0.18 145 / 0.22); }

	.action-edit {
		color: oklch(0.70 0.15 220);
		border-color: oklch(0.50 0.12 220 / 0.4);
	}

	.action-delete {
		color: oklch(0.60 0.12 25);
		border-color: oklch(0.45 0.10 25 / 0.3);
	}
	.action-delete:hover:not(:disabled) { background: oklch(0.50 0.15 25 / 0.15); }

	.action-cancel {
		color: oklch(0.60 0.04 250);
	}

	.action-save {
		color: oklch(0.70 0.18 145);
		border-color: oklch(0.50 0.15 145 / 0.4);
		background: oklch(0.50 0.18 145 / 0.1);
		margin-left: auto;
	}
	.action-save:hover:not(:disabled) { background: oklch(0.50 0.18 145 / 0.2); }

	/* ========== Edit mode ========== */
	.edit-mode {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.edit-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.edit-row {
		display: flex;
		gap: 0.75rem;
	}
	.edit-field-half { flex: 1; }
	.edit-label {
		font-size: 0.65rem;
		font-weight: 600;
		color: oklch(0.50 0.03 250);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.edit-input, .edit-select, .edit-textarea {
		font-size: 0.8rem;
		padding: 0.4rem 0.6rem;
		border-radius: 6px;
		border: 1px solid oklch(0.28 0.03 250);
		background: oklch(0.16 0.01 250);
		color: oklch(0.82 0.03 250);
		outline: none;
		transition: border-color 0.1s;
	}
	.edit-input:focus, .edit-select:focus, .edit-textarea:focus {
		border-color: oklch(0.55 0.15 220);
	}
	.edit-textarea {
		resize: vertical;
		min-height: 100px;
		font-family: inherit;
		line-height: 1.5;
	}

	/* ========== Responsive ========== */
	@media (max-width: 768px) {
		.triage-content { flex-direction: column; }
		.queue-panel {
			width: 100%;
			max-height: 40vh;
			border-right: none;
			border-bottom: 1px solid oklch(0.20 0.02 250);
		}
		.filter-bar { flex-wrap: wrap; }
		.filter-search-wrap { max-width: 100%; }
		.header-actions { gap: 0.25rem; }
		.btn-promote-all, .btn-dismiss-all { display: none; }
	}

	/* ========== Bulk Assign Modal ========== */
	.bulk-modal-overlay {
		position: fixed;
		inset: 0;
		z-index: 60;
		background: oklch(0 0 0 / 0.5);
		backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		border: none;
		cursor: default;
	}
	.bulk-modal {
		background: oklch(0.16 0.02 250);
		border: 1px solid oklch(0.30 0.03 250);
		border-radius: 0.5rem;
		box-shadow: 0 20px 50px oklch(0 0 0 / 0.5);
		width: 100%;
		max-width: 480px;
		max-height: 70vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.bulk-modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.875rem 1rem;
		border-bottom: 1px solid oklch(0.22 0.02 250);
	}
	.bulk-modal-header h3 {
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 600;
		color: oklch(0.90 0.02 250);
	}
	.bulk-modal-close {
		background: transparent;
		border: none;
		color: oklch(0.65 0.03 250);
		font-size: 1.25rem;
		line-height: 1;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
	}
	.bulk-modal-close:hover {
		background: oklch(0.24 0.03 250);
		color: oklch(0.90 0.02 250);
	}
	.bulk-modal-body {
		padding: 0.5rem;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.bulk-epic-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: transparent;
		border: 1px solid oklch(0.22 0.02 250);
		border-radius: 0.375rem;
		color: oklch(0.85 0.03 250);
		font-size: 0.8125rem;
		cursor: pointer;
		text-align: left;
		transition: background 0.1s, border-color 0.1s;
	}
	.bulk-epic-btn:hover:not(:disabled) {
		background: oklch(0.22 0.03 250);
		border-color: oklch(0.40 0.05 250);
	}
	.bulk-epic-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.bulk-epic-priority {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 0.6875rem;
		font-weight: 600;
	}
	.bulk-epic-title {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
