<script lang="ts">
	/**
	 * TasksOpen Component
	 *
	 * Displays open tasks that are ready to spawn with a rocket button.
	 * Used on /tasks2 page below the active sessions section.
	 */

	import { untrack, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import TaskIdBadge from '$lib/components/TaskIdBadge.svelte';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { getProjectColor } from '$lib/utils/projectColors';
	import { getIssueTypeVisual } from '$lib/config/statusColors';
	import AgentSelector from '$lib/components/agents/AgentSelector.svelte';
	import { bulkApiOperation, fetchWithTimeout, createDeleteRequest, handleApiError, formatBulkResultMessage } from '$lib/utils/bulkApiHelpers';
	import { isHumanTask } from '$lib/utils/badgeHelpers';
	import { addToast } from '$lib/stores/toasts.svelte';
	import { broadcastTaskEvent } from '$lib/stores/taskEvents';
	import { AGENT_PRESETS } from '$lib/types/agentProgram';
	import ProviderLogo from '$lib/components/agents/ProviderLogo.svelte';
	import { spawnInBatches, type SpawnResult } from '$lib/utils/spawnBatch';
	import { formatShortDate, parseTimestamp } from '$lib/utils/dateFormatters';
	import { getFileTypeInfoFromPath } from '$lib/utils/fileUtils';
	import FxText from '$lib/components/FxText.svelte';
	import FeedbackReplyModal from '$lib/components/FeedbackReplyModal.svelte';
	import HarnessTray from '$lib/components/sessions/HarnessTray.svelte';

	function taskCtx(t: Task): Record<string, any> {
		return { title: t.title, status: t.status, priority: t.priority, type: t.issue_type, assignee: t.assignee, labels: t.labels?.join(', '), created_at: t.created_at, due_date: t.due_date };
	}

	interface AgentSelection {
		agentId: string | null;
		model: string | null;
	}

	interface Epic {
		id: string;
		title: string;
		status: string;
		priority: number;
	}

	const STORAGE_KEY = 'jat-open-tasks-project-filter';

	interface Dependency {
		id: string;
		title?: string;
		status: string;
		priority?: number;
	}

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
		due_date?: string | null;
		depends_on?: Dependency[];
		agent_program?: string | null;
	}

	type DueDateFilterType = 'today' | 'tomorrow' | 'week' | 'overdue' | 'unscheduled' | 'all';

	let {
		tasks = [],
		loading = false,
		error = null,
		spawningTaskId = null,
		projectColors = {},
		taskIntegrations = {},
		taskImages = {},
		showHeader = true,
		highlightedTaskIds = new Set<string>(),
		epicsReadyForVerification = new Set<string>(),
		dueDateFilter = $bindable('all' as DueDateFilterType),
		onSpawnTask = () => {},
		onRetry = () => {},
		onTaskClick = () => {},
		onAddTask = null,
		onFilterCountsChange = (_counts: Record<string, number>) => {},
		mobile = false,
		resumableTasks = new Map<string, string>()
	}: {
		tasks: Task[];
		loading: boolean;
		error: string | null;
		spawningTaskId: string | null;
		projectColors: Record<string, string>;
		taskIntegrations?: Record<string, { sourceId: string; sourceType: string; sourceName: string; sourceEnabled: boolean }>;
		taskImages?: Record<string, Array<{ path: string; id: string; uploadedAt?: string }>>;
		showHeader?: boolean;
		highlightedTaskIds?: Set<string>;
		epicsReadyForVerification?: Set<string>;
		dueDateFilter?: DueDateFilterType;
		onSpawnTask: (task: Task, selection?: AgentSelection) => void;
		onRetry: () => void;
		onTaskClick: (taskId: string) => void;
		onAddTask?: (() => void) | null;
		onFilterCountsChange?: (counts: Record<string, number>) => void;
		mobile?: boolean;
		/** Map of taskId → agentName for tasks with resumable sessions */
		resumableTasks?: Map<string, string>;
	} = $props();

	// Alt key tracking for agent picker
	let altKeyHeld = $state(false);
	let agentPickerOpen = $state(false);
	let agentPickerTask = $state<Task | null>(null);
	// Position for fixed-positioned agent picker (to escape overflow containers)
	// Uses bottom/left to drop up and to the left for better visibility
	let agentPickerPosition = $state<{ bottom: number; left: number } | null>(null);

	// === Haptic feedback ===
	function haptic(ms = 8) {
		if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
	}

	// === Long-press → multi-select ===
	let longPressTimer: ReturnType<typeof setTimeout> | null = null;
	let longPressActive = $state(false); // true while in selection mode

	function startLongPress(taskId: string) {
		longPressTimer = setTimeout(() => {
			haptic(30); // stronger pulse for mode change
			longPressActive = true;
			toggleTask(taskId);
		}, 500);
	}

	function cancelLongPress() {
		if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
	}

	// === Bulk Selection ===
	let selectedTasks = $state<Set<string>>(new Set());
	let lastClickedTaskId = $state<string | null>(null);
	let bulkActionLoading = $state(false);
	let bulkActionError = $state('');
	let spawnProgress = $state('');
	let priorityDropdownOpen = $state(false);
	let harnessDropdownOpen = $state(false);

	// === Single-task Harness Picker ===
	let harnessPickerTaskId = $state<string | null>(null);
	let harnessPickerPos = $state({ x: 0, y: 0, openUp: false, maxH: 0 });

	// === Pull-to-refresh (mobile) ===
	const PTR_THRESHOLD = 72;
	let ptrTouchStartY = 0;
	let ptrPull = $state(0);
	let ptrRefreshing = $state(false);
	let sectionEl = $state<HTMLElement | null>(null);

	onMount(() => {
		function onPtrTouchStart(e: TouchEvent) {
			ptrTouchStartY = e.touches[0].clientY;
		}
		function onPtrTouchMove(e: TouchEvent) {
			if (ptrRefreshing || swipeState) return;
			if (window.scrollY > 10) return;
			const dy = e.touches[0].clientY - ptrTouchStartY;
			if (dy > 0) {
				ptrPull = Math.min(dy * 0.55, PTR_THRESHOLD * 1.4);
				if (dy > 20) e.preventDefault();
			} else if (ptrPull > 0) {
				ptrPull = 0;
			}
		}
		function onPtrTouchEnd() {
			if (ptrPull >= PTR_THRESHOLD && !ptrRefreshing) {
				haptic(20);
				ptrRefreshing = true;
				ptrPull = 0;
				const result = (onRetry as () => unknown)();
				const done = () => setTimeout(() => { ptrRefreshing = false; }, 500);
				if (result instanceof Promise) result.finally(done); else done();
			} else {
				ptrPull = 0;
			}
		}
		function onPtrTouchCancel() { ptrPull = 0; }

		// Wait for sectionEl to be bound
		const el = sectionEl;
		if (!el) return;
		el.addEventListener('touchstart', onPtrTouchStart, { passive: true });
		el.addEventListener('touchmove', onPtrTouchMove, { passive: false });
		el.addEventListener('touchend', onPtrTouchEnd, { passive: true });
		el.addEventListener('touchcancel', onPtrTouchCancel, { passive: true });
		return () => {
			el.removeEventListener('touchstart', onPtrTouchStart);
			el.removeEventListener('touchmove', onPtrTouchMove);
			el.removeEventListener('touchend', onPtrTouchEnd);
			el.removeEventListener('touchcancel', onPtrTouchCancel);
		};
	});

	// === Swipe-to-reveal (mobile) ===
	const SWIPE_DEADZONE = 10;
	const SWIPE_THRESHOLD = 80;
	const SWIPE_COMMIT_THRESHOLD = 140;
	const VELOCITY_THRESHOLD = 0.5;
	const SWIPE_TRAY_WIDTH = 90;

	interface SwipeState {
		taskId: string;
		startX: number;
		startY: number;
		startTime: number;
		swiping: boolean;
		committed: boolean;
	}

	let swipeState = $state<SwipeState | null>(null);
	let swipeOffsets = $state<Map<string, number>>(new Map());

	function handleSwipeTouchStart(e: TouchEvent, taskId: string) {
		if (e.touches.length !== 1) return;
		const touch = e.touches[0];
		swipeState = { taskId, startX: touch.clientX, startY: touch.clientY, startTime: Date.now(), swiping: false, committed: false };
	}

	function handleSwipeTouchMove(e: TouchEvent) {
		if (!swipeState || swipeState.committed) return;
		const touch = e.touches[0];
		const deltaX = touch.clientX - swipeState.startX;
		const deltaY = touch.clientY - swipeState.startY;
		if (!swipeState.swiping) {
			if (Math.abs(deltaY) > SWIPE_DEADZONE) { swipeState = null; return; }
			if (Math.abs(deltaX) > SWIPE_DEADZONE) { swipeState.swiping = true; } else { return; }
		}
		e.preventDefault();
		const maxOffset = SWIPE_TRAY_WIDTH;
		let clamped = deltaX;
		if (Math.abs(deltaX) > maxOffset) {
			clamped = Math.sign(deltaX) * (maxOffset + (Math.abs(deltaX) - maxOffset) * 0.3);
		}
		const m = new Map(swipeOffsets);
		m.set(swipeState.taskId, clamped);
		swipeOffsets = m;
	}

	function handleSwipeTouchEnd(task: Task) {
		if (!swipeState || swipeState.committed) { swipeState = null; return; }
		const { taskId, swiping } = swipeState;
		if (!swiping) { swipeState = null; return; }
		const offset = swipeOffsets.get(taskId) || 0;
		const elapsed = Date.now() - swipeState.startTime;
		const velocity = Math.abs(offset) / elapsed;
		const isCommit = Math.abs(offset) >= SWIPE_COMMIT_THRESHOLD || (velocity >= VELOCITY_THRESHOLD && Math.abs(offset) > SWIPE_THRESHOLD);
		if (isCommit) {
			swipeState.committed = true;
			haptic();
			if (offset > 0) {
				onSpawnTask(task, { agentId: null, model: null });
			} else {
				handleRowClick(taskId);
			}
		}
		resetSwipe(taskId);
		swipeState = null;
	}

	// Avatar tap on mobile → open AgentSelector (harness picker)
	function handleAvatarTap(e: TouchEvent, task: Task) {
		e.stopPropagation();
		haptic(12);
		harnessPickerTaskId = task.id;
		harnessPickerPos = {
			x: Math.max(8, window.innerWidth / 2 - 160),
			y: 80,
			openUp: false,
			maxH: window.innerHeight - 160
		};
	}

	function resetSwipe(taskId: string) {
		const m = new Map(swipeOffsets);
		m.set(taskId, 0);
		swipeOffsets = m;
		setTimeout(() => {
			const m2 = new Map(swipeOffsets);
			m2.delete(taskId);
			swipeOffsets = m2;
		}, 300);
	}

	// === Sort ===
	type SortBy = 'due' | 'priority' | 'created' | 'title';
	let sortBy = $state<SortBy>('due');
	let sortDir = $state<'asc' | 'desc'>('asc');

	function cycleSortDir(field: SortBy) {
		if (sortBy === field) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = field;
			sortDir = 'asc';
		}
		// Re-sort taskOrder immediately with FLIP animation
		taskOrder = [...taskOrder].sort((a, b) => {
			const ta = previousTaskObjects.get(a);
			const tb = previousTaskObjects.get(b);
			if (!ta || !tb) return 0;
			return compareTaskSort(ta, tb);
		});
	}

	// === Due Date Picker ===
	let dueDatePickerTaskId = $state<string | null>(null);
	let dueDatePickerPos = $state<{ x: number; y: number } | null>(null);
	let dueDateTempValue = $state('');
	let dueDateTempTime = $state('');
	let dueDateSaving = $state(false);

	const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	function getQuickSetDays(): Array<{ label: string; dayNum: number; badge: string | null; dateValue: string }> {
		const today = new Date();
		const days: Array<{ label: string; dayNum: number; badge: string | null; dateValue: string }> = [];
		for (let i = 0; i < 5; i++) {
			const d = new Date(today);
			d.setDate(today.getDate() + i);
			const badge = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : null;
			const year = d.getFullYear();
			const month = String(d.getMonth() + 1).padStart(2, '0');
			const day = String(d.getDate()).padStart(2, '0');
			days.push({
				label: DAY_NAMES_SHORT[d.getDay()],
				dayNum: d.getDate(),
				badge,
				dateValue: `${year}-${month}-${day}`
			});
		}
		return days;
	}

	async function quickSetDueDate(dateValue: string) {
		if (!dueDatePickerTaskId) return;
		dueDateSaving = true;
		try {
			const dueDate = `${dateValue}T00:00:00`;
			const res = await fetch(`/api/tasks/${dueDatePickerTaskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ due_date: dueDate })
			});
			if (res.ok) {
				const idx = tasks.findIndex(t => t.id === dueDatePickerTaskId);
				if (idx !== -1) {
					tasks[idx] = { ...tasks[idx], due_date: dueDate };
					tasks = [...tasks];
				}
				closeDueDatePicker();
			} else {
				addToast({ message: 'Failed to update due date', type: 'error' });
			}
		} catch {
			addToast({ message: 'Failed to update due date', type: 'error' });
		} finally {
			dueDateSaving = false;
		}
	}

	function formatDueDate(dateStr: string | null | undefined): string {
		if (!dateStr) return '';
		const date = parseTimestamp(dateStr);
		if (!date) return '';
		const now = new Date();
		const diffMs = date.getTime() - now.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		// Show short date, but highlight if overdue or soon
		return formatShortDate(dateStr);
	}

	function formatDueTime(dateStr: string | null | undefined): string | null {
		if (!dateStr) return null;
		const d = parseTimestamp(dateStr);
		if (!d) return null;
		const hours = d.getHours();
		const mins = d.getMinutes();
		if (hours === 0 && mins === 0) return null;
		const h = hours % 12 || 12;
		const ampm = hours < 12 ? 'am' : 'pm';
		return mins === 0 ? `${h}${ampm}` : `${h}:${String(mins).padStart(2, '0')}${ampm}`;
	}

	function getDueDateColor(dateStr: string | null | undefined): string {
		if (!dateStr) return '';
		const date = parseTimestamp(dateStr);
		if (!date) return '';
		const now = new Date();
		const diffMs = date.getTime() - now.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
		if (diffDays < 0) return 'oklch(0.70 0.18 30)'; // overdue - red
		if (diffDays <= 1) return 'oklch(0.75 0.18 50)'; // due today/tomorrow - orange
		if (diffDays <= 3) return 'oklch(0.75 0.15 85)'; // due soon - amber
		return 'oklch(0.60 0.02 250)'; // normal - muted
	}

	function openDueDatePicker(task: Task, e: MouseEvent) {
		e.stopPropagation();
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		dueDatePickerTaskId = task.id;
		// Parse existing date into date and time parts
		if (task.due_date) {
			const d = parseTimestamp(task.due_date);
			if (d) {
				const year = d.getFullYear();
				const month = String(d.getMonth() + 1).padStart(2, '0');
				const day = String(d.getDate()).padStart(2, '0');
				dueDateTempValue = `${year}-${month}-${day}`;
				const hours = d.getHours();
				const mins = d.getMinutes();
				if (hours !== 0 || mins !== 0) {
					dueDateTempTime = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
				} else {
					dueDateTempTime = '';
				}
			} else {
				dueDateTempValue = '';
				dueDateTempTime = '';
			}
		} else {
			dueDateTempValue = '';
			dueDateTempTime = '';
		}
		// Position: prefer below cell, but flip above if near viewport bottom
		const pickerHeight = 200;
		const pickerWidth = 260;
		const spaceBelow = window.innerHeight - rect.bottom;
		const y = spaceBelow < pickerHeight + 8
			? Math.max(8, rect.top - pickerHeight - 4)
			: rect.bottom + 4;
		const x = Math.min(rect.left, window.innerWidth - pickerWidth - 8);
		dueDatePickerPos = { x, y };
	}

	function closeDueDatePicker() {
		dueDatePickerTaskId = null;
		dueDatePickerPos = null;
	}

	async function saveDueDate() {
		if (!dueDatePickerTaskId) return;
		dueDateSaving = true;
		try {
			let dueDate: string | null = null;
			if (dueDateTempValue) {
				if (dueDateTempTime) {
					dueDate = `${dueDateTempValue}T${dueDateTempTime}:00`;
				} else {
					dueDate = `${dueDateTempValue}T00:00:00`;
				}
			}
			const res = await fetch(`/api/tasks/${dueDatePickerTaskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ due_date: dueDate })
			});
			if (res.ok) {
				// Update local task data
				const idx = tasks.findIndex(t => t.id === dueDatePickerTaskId);
				if (idx !== -1) {
					tasks[idx] = { ...tasks[idx], due_date: dueDate };
					tasks = [...tasks];
				}
				closeDueDatePicker();
			} else {
				addToast('Failed to update due date', 'error');
			}
		} catch {
			addToast('Failed to update due date', 'error');
		} finally {
			dueDateSaving = false;
		}
	}

	async function clearDueDate() {
		if (!dueDatePickerTaskId) return;
		dueDateSaving = true;
		try {
			const res = await fetch(`/api/tasks/${dueDatePickerTaskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ due_date: null })
			});
			if (res.ok) {
				const idx = tasks.findIndex(t => t.id === dueDatePickerTaskId);
				if (idx !== -1) {
					tasks[idx] = { ...tasks[idx], due_date: null };
					tasks = [...tasks];
				}
				closeDueDatePicker();
			} else {
				addToast('Failed to clear due date', 'error');
			}
		} catch {
			addToast('Failed to clear due date', 'error');
		} finally {
			dueDateSaving = false;
		}
	}

	// === Hover-to-select (spacebar) ===
	let hoveredTaskId = $state<string | null>(null);

	const selectionCount = $derived(selectedTasks.size);
	const allVisibleSelected = $derived.by(() => {
		const visible = orderedTasks.filter(e => !e.isExiting);
		return visible.length > 0 && visible.every(e => selectedTasks.has(e.task.id));
	});
	const someVisibleSelected = $derived.by(() => {
		const visible = orderedTasks.filter(e => !e.isExiting);
		return visible.some(e => selectedTasks.has(e.task.id)) && !allVisibleSelected;
	});

	// Clean up stale selections when tasks change
	$effect(() => {
		const openIds = new Set(tasks.filter(t => t.status === 'open').map(t => t.id));
		const stale = [...selectedTasks].filter(id => !openIds.has(id));
		if (stale.length > 0) {
			const next = new Set(selectedTasks);
			for (const id of stale) next.delete(id);
			selectedTasks = next;
		}
	});

	function toggleTask(taskId: string, event?: MouseEvent) {
		const visible = orderedTasks.filter(e => !e.isExiting);
		if (event?.shiftKey && lastClickedTaskId) {
			const ids = visible.map(e => e.task.id);
			const a = ids.indexOf(lastClickedTaskId);
			const b = ids.indexOf(taskId);
			if (a !== -1 && b !== -1) {
				const [start, end] = a < b ? [a, b] : [b, a];
				const next = new Set(selectedTasks);
				for (let i = start; i <= end; i++) next.add(ids[i]);
				selectedTasks = next;
				lastClickedTaskId = taskId;
				return;
			}
		}
		const next = new Set(selectedTasks);
		if (next.has(taskId)) {
			next.delete(taskId);
		} else {
			next.add(taskId);
		}
		selectedTasks = next;
		lastClickedTaskId = taskId;
	}

	function toggleAllVisible() {
		const visible = orderedTasks.filter(e => !e.isExiting).map(e => e.task.id);
		const allSelected = visible.length > 0 && visible.every(id => selectedTasks.has(id));
		if (allSelected) {
			selectedTasks = new Set();
		} else {
			selectedTasks = new Set(visible);
		}
	}

	function clearSelection() {
		selectedTasks = new Set();
		lastClickedTaskId = null;
		priorityDropdownOpen = false;
		harnessDropdownOpen = false;
		longPressActive = false;
	}

	async function handleBulkDelete() {
		const ids = [...selectedTasks];
		if (ids.length === 0) return;
		if (!confirm(`Delete ${ids.length} task${ids.length > 1 ? 's' : ''}? This cannot be undone.`)) return;
		bulkActionLoading = true;
		bulkActionError = '';
		try {
			const result = await bulkApiOperation(ids, async (taskId) => {
				const response = await fetchWithTimeout(`/api/tasks/${taskId}`, createDeleteRequest());
				if (!response.ok) {
					throw new Error(await handleApiError(response, `delete task ${taskId}`));
				}
			});
			if (!result.success) {
				bulkActionError = formatBulkResultMessage(result, 'task');
			}
			clearSelection();
			onRetry();
		} catch (err) {
			bulkActionError = err instanceof Error ? err.message : String(err);
		} finally {
			bulkActionLoading = false;
		}
	}

	async function handleBulkClose() {
		const ids = [...selectedTasks];
		if (ids.length === 0) return;
		if (!confirm(`Close ${ids.length} task${ids.length > 1 ? 's' : ''}?`)) return;
		bulkActionLoading = true;
		bulkActionError = '';
		try {
			const result = await bulkApiOperation(ids, async (taskId) => {
				const response = await fetchWithTimeout(`/api/tasks/${taskId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ status: 'closed' })
				});
				if (!response.ok) {
					throw new Error(await handleApiError(response, `close task ${taskId}`));
				}
			});
			if (!result.success) {
				bulkActionError = formatBulkResultMessage(result, 'task');
			}
			clearSelection();
			onRetry();
		} catch (err) {
			bulkActionError = err instanceof Error ? err.message : String(err);
		} finally {
			bulkActionLoading = false;
		}
	}

	async function handleBulkSpawn() {
		const ids = [...selectedTasks];
		if (ids.length === 0) return;
		if (!confirm(`Spawn ${ids.length} agent${ids.length > 1 ? 's' : ''}? One per selected task.`)) return;
		bulkActionLoading = true;
		bulkActionError = '';
		spawnProgress = `Spawning 0/${ids.length}...`;
		try {
			const results = await spawnInBatches(ids, {
				onSpawn(result: SpawnResult, index: number, total: number) {
					spawnProgress = `Spawning ${index + 1}/${total}...`;
				},
				onBatchComplete(batchResults: SpawnResult[], batchIndex: number, totalBatches: number) {
					if (totalBatches > 1) {
						spawnProgress = `Batch ${batchIndex + 1}/${totalBatches} done...`;
					}
				}
			});
			const succeeded = results.filter(r => r.success).length;
			const failed = results.filter(r => !r.success);
			if (failed.length === 0) {
				addToast({ message: `Spawned ${succeeded} agent${succeeded !== 1 ? 's' : ''}`, type: 'success' });
			} else if (succeeded > 0) {
				addToast({ message: `Spawned ${succeeded}/${results.length} (${failed.length} failed)`, type: 'warning' });
			} else {
				const firstError = failed[0]?.error || 'Unknown error';
				addToast({ message: `Spawn failed: ${firstError}`, type: 'error' });
			}
			clearSelection();
		} catch (err) {
			bulkActionError = err instanceof Error ? err.message : String(err);
		} finally {
			bulkActionLoading = false;
			spawnProgress = '';
		}
	}

	async function handleDeleteTask(taskId: string) {
		closeContextMenu();
		if (!confirm(`Delete task ${taskId}? This cannot be undone.`)) return;
		try {
			const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
			if (response.ok) {
				onRetry();
			}
		} catch (err) {
			console.error('Failed to delete task:', err);
		}
	}

	/** Extract harness from task's agent_program field (falls back to 'claude-code') */
	function getTaskHarness(task: Task): string {
		return task.agent_program || 'claude-code';
	}

	async function handleBulkPriority(priority: number) {
		const ids = [...selectedTasks];
		if (ids.length === 0) return;
		priorityDropdownOpen = false;
		bulkActionLoading = true;
		bulkActionError = '';
		try {
			const result = await bulkApiOperation(ids, async (taskId) => {
				const response = await fetchWithTimeout(`/api/tasks/${taskId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ priority })
				});
				if (!response.ok) {
					throw new Error(await handleApiError(response, `update priority for ${taskId}`));
				}
			});
			if (!result.success) {
				bulkActionError = formatBulkResultMessage(result, 'task');
			}
			clearSelection();
			onRetry();
		} catch (err) {
			bulkActionError = err instanceof Error ? err.message : String(err);
		} finally {
			bulkActionLoading = false;
		}
	}

	async function handleBulkHarness(agentId: string) {
		const ids = [...selectedTasks];
		if (ids.length === 0) return;
		harnessDropdownOpen = false;
		bulkActionLoading = true;
		bulkActionError = '';
		try {
			const result = await bulkApiOperation(ids, async (taskId) => {
				const response = await fetchWithTimeout(`/api/tasks/${taskId}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ agent_program: agentId === 'claude-code' ? null : agentId })
				});
				if (!response.ok) {
					throw new Error(await handleApiError(response, `update harness for ${taskId}`));
				}
			});
			if (!result.success) {
				bulkActionError = formatBulkResultMessage(result, 'task');
			}
			clearSelection();
			onRetry();
		} catch (err) {
			bulkActionError = err instanceof Error ? err.message : String(err);
		} finally {
			bulkActionLoading = false;
		}
	}

	async function handleSingleHarnessChange(taskId: string, selection: { agentId: string | null; model: string | null }) {
		harnessPickerTaskId = null;
		const task = tasks.find(t => t.id === taskId);
		if (!task) return;
		const agentId = selection.agentId;
		const model = selection.model;
		try {
			// Update agent_program and model fields together
			const updates: Record<string, any> = {
				agent_program: agentId || null,
				model: model || null
			};
			const resp = await fetchWithTimeout(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updates)
			});
			if (!resp.ok) {
				console.error('Failed to update harness:', resp.status, await resp.text());
			}
			// Handle human-action label separately if needed
			if (agentId === 'human') {
				const currentLabels = (task.labels || []).filter(l => l !== 'human-action' && l !== 'human');
				const newLabels = [...currentLabels, 'human-action'];
				await fetchWithTimeout(`/api/tasks/${taskId}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ labels: newLabels.join(',') })
				});
			} else {
				// Remove human-action label if switching away from human
				const currentLabels = task.labels || [];
				if (currentLabels.includes('human-action') || currentLabels.includes('human')) {
					const newLabels = currentLabels.filter(l => l !== 'human-action' && l !== 'human');
					await fetchWithTimeout(`/api/tasks/${taskId}`, {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ labels: newLabels.join(',') })
					});
				}
			}
		} catch (err) {
			console.error('Failed to update harness:', err);
		}
		onRetry();
	}

	async function handleSingleHarnessSaveAndLaunch(taskId: string, selection: { agentId: string | null; model: string | null }) {
		const task = tasks.find(t => t.id === taskId);
		if (!task) return;
		// Save first, then spawn
		await handleSingleHarnessChange(taskId, selection);
		onSpawnTask(task, selection);
	}

	// Close single-task harness picker on Escape key
	$effect(() => {
		if (!harnessPickerTaskId) return;

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape') harnessPickerTaskId = null;
		}

		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	});

	// Track Alt key state for visual feedback
	$effect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === 'Alt' || e.code === 'AltLeft' || e.code === 'AltRight') {
				altKeyHeld = true;
			}
		}
		function handleKeyUp(e: KeyboardEvent) {
			if (e.key === 'Alt' || e.code === 'AltLeft' || e.code === 'AltRight') {
				altKeyHeld = false;
			}
		}
		// Reset when window loses focus
		function handleBlur() {
			altKeyHeld = false;
		}

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('blur', handleBlur);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
			window.removeEventListener('blur', handleBlur);
		};
	});

	// Spacebar toggles selection on hovered task
	$effect(() => {
		function handleSpaceToggle(e: KeyboardEvent) {
			if (e.key !== ' ' || !hoveredTaskId) return;
			const tag = (e.target as HTMLElement)?.tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
			e.preventDefault();
			toggleTask(hoveredTaskId);
		}
		window.addEventListener('keydown', handleSpaceToggle);
		return () => window.removeEventListener('keydown', handleSpaceToggle);
	});

	function handleSpawnClick(task: Task, event: MouseEvent) {
		event.stopPropagation();

		// Alt+click opens agent selector
		if (event.altKey) {
			// Calculate fixed position from button - drop up and to the left
			const button = event.currentTarget as HTMLElement;
			const rect = button.getBoundingClientRect();
			// Position to the left, but ensure it stays within viewport
			const preferredLeft = rect.left - 280; // AgentSelector is ~320px wide
			const safeLeft = Math.max(8, preferredLeft); // At least 8px from left edge
			agentPickerPosition = {
				bottom: window.innerHeight - rect.top + 4, // 4px gap above button
				left: safeLeft
			};
			agentPickerTask = task;
			agentPickerOpen = true;
			return;
		}

		// Quick spawn with default agent
		onSpawnTask(task);
	}

	function handleAgentSelect(selection: AgentSelection) {
		if (agentPickerTask) {
			onSpawnTask(agentPickerTask, selection);
		}
		agentPickerOpen = false;
		agentPickerTask = null;
		agentPickerPosition = null;
	}

	function handleAgentPickerCancel() {
		agentPickerOpen = false;
		agentPickerTask = null;
		agentPickerPosition = null;
	}

	function handleRowClick(taskId: string) {
		onTaskClick(taskId);
	}

	// State for project filter
	let selectedProject = $state<string | null>(null);

	// === Due Date Filter ===

	function getLocalDateString(date: Date): string {
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
	}
	function getToday(): string { return getLocalDateString(new Date()); }
	function getTomorrow(): string { const d = new Date(); d.setDate(d.getDate() + 1); return getLocalDateString(d); }
	function getEndOfWeek(): string { const d = new Date(); const day = d.getDay(); const daysUntilSunday = day === 0 ? 0 : 7 - day; d.setDate(d.getDate() + daysUntilSunday); return getLocalDateString(d); }

	function taskMatchesDateFilter(task: Task, filter: DueDateFilterType): boolean {
		const dueDate = task.due_date;
		switch (filter) {
			case 'all': return true;
			case 'unscheduled': return !dueDate;
			case 'overdue': return !!dueDate && dueDate < getToday();
			case 'today': return !!dueDate && dueDate <= getToday();
			case 'tomorrow': return !!dueDate && dueDate <= getTomorrow();
			case 'week': return !!dueDate && dueDate <= getEndOfWeek();
			default: return true;
		}
	}

	const DATE_FILTER_OPTIONS: { id: DueDateFilterType; label: string }[] = [
		{ id: 'today', label: 'Today' },
		{ id: 'tomorrow', label: 'Tomorrow' },
		{ id: 'week', label: 'This Week' },
		{ id: 'overdue', label: 'Overdue' },
		{ id: 'unscheduled', label: 'Unscheduled' },
		{ id: 'all', label: 'All' },
	];

	// Counts for filter chips
	const filterCounts = $derived.by(() => {
		const candidates = tasks.filter(t =>
			t.status === 'open' && t.issue_type !== 'epic' &&
			(!showHeader || selectedProject === null || getProjectFromTaskId(t.id) === selectedProject)
		);
		const counts: Record<DueDateFilterType, number> = { today: 0, tomorrow: 0, week: 0, overdue: 0, unscheduled: 0, all: candidates.length };
		for (const task of candidates) {
			if (taskMatchesDateFilter(task, 'today')) counts.today++;
			if (taskMatchesDateFilter(task, 'tomorrow')) counts.tomorrow++;
			if (taskMatchesDateFilter(task, 'week')) counts.week++;
			if (taskMatchesDateFilter(task, 'overdue')) counts.overdue++;
			if (taskMatchesDateFilter(task, 'unscheduled')) counts.unscheduled++;
		}
		return counts;
	});

	// Notify parent of filter count changes
	$effect(() => {
		onFilterCountsChange(filterCounts);
	});

	// Load persisted filter on mount
	onMount(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			selectedProject = saved;
		}
	});

	// Persist filter changes
	$effect(() => {
		if (selectedProject === null) {
			localStorage.removeItem(STORAGE_KEY);
		} else {
			localStorage.setItem(STORAGE_KEY, selectedProject);
		}
	});

	// Track task IDs for animations - maintains order so exiting tasks stay in position
	let previousTaskObjects = $state<Map<string, Task>>(new Map());
	let taskOrder = $state<string[]>([]); // Tracks order for position preservation
	let newTaskIds = $state<string[]>([]);
	let exitingTaskIds = $state<Set<string>>(new Set());

	// Track filter-based animations (separate from data changes)
	let filterExitingTaskIds = $state<Set<string>>(new Set());
	let filterEnteringTaskIds = $state<string[]>([]);
	let previousSelectedProject = $state<string | null | undefined>(undefined); // undefined = not initialized

	// Effect to detect new and exiting tasks while preserving order
	$effect(() => {
		const openTasks = tasks.filter(t => t.status === 'open');
		const currentIds = new Set(openTasks.map(t => t.id));

		// Use untrack to read previous state without creating a dependency
		const prevObjects = untrack(() => previousTaskObjects);
		const prevOrder = untrack(() => taskOrder);
		const prevExiting = untrack(() => exitingTaskIds);

		// Build current task object map
		const currentObjects = new Map<string, Task>();
		for (const task of openTasks) {
			currentObjects.set(task.id, task);
		}

		// Skip on initial load - just set initial order (sorted by due date → age → priority)
		if (prevOrder.length === 0 && openTasks.length > 0) {
			taskOrder = openTasks.sort(compareTaskSort).map(t => t.id);
			previousTaskObjects = currentObjects;
			return;
		}

		// Find new tasks (in current but not in previous order)
		const newIds: string[] = [];
		for (const id of currentIds) {
			if (!prevOrder.includes(id)) {
				newIds.push(id);
			}
		}

		// Find exiting tasks (in previous order but not in current)
		const exitIds = new Set<string>();
		for (const id of prevOrder) {
			if (!currentIds.has(id) && !prevExiting.has(id)) {
				exitIds.add(id);
			}
		}

		// Update order: keep existing order (preserve positions), add new tasks sorted by due date → age → priority
		let newOrder = [...prevOrder];
		// Sort new tasks and add them
		const newTasksSorted = newIds
			.map(id => currentObjects.get(id))
			.filter((t): t is Task => t !== undefined)
			.sort(compareTaskSort);
		for (const task of newTasksSorted) {
			// Insert at correct position based on sort order
			const insertIndex = newOrder.findIndex(existingId => {
				const existing = currentObjects.get(existingId) || prevObjects.get(existingId);
				return existing && compareTaskSort(task, existing) < 0;
			});
			if (insertIndex === -1) {
				newOrder.push(task.id);
			} else {
				newOrder.splice(insertIndex, 0, task.id);
			}
		}

		// Detect sort-relevant property changes on existing tasks (priority, due_date)
		// and re-sort when they change — this triggers FLIP animation on mobile cards
		let sortChanged = false;
		for (const id of currentIds) {
			const prev = prevObjects.get(id);
			const curr = currentObjects.get(id);
			if (prev && curr && (prev.priority !== curr.priority || prev.due_date !== curr.due_date)) {
				sortChanged = true;
				break;
			}
		}
		if (sortChanged) {
			// Re-sort the existing order using current task data
			newOrder = newOrder
				.filter(id => currentIds.has(id) || exitIds.has(id) || prevExiting.has(id))
				.sort((a, b) => {
					const taskA = currentObjects.get(a) || prevObjects.get(a);
					const taskB = currentObjects.get(b) || prevObjects.get(b);
					if (!taskA || !taskB) return 0;
					return compareTaskSort(taskA, taskB);
				});
		}

		// Remove tasks that have finished exiting
		newOrder = newOrder.filter(id => currentIds.has(id) || exitIds.has(id) || prevExiting.has(id));

		if (newIds.length > 0) {
			newTaskIds = newIds;
			setTimeout(() => {
				newTaskIds = [];
			}, 600);
		}

		if (exitIds.size > 0) {
			exitingTaskIds = new Set([...prevExiting, ...exitIds]);
			setTimeout(() => {
				exitingTaskIds = new Set([...exitingTaskIds].filter(id => !exitIds.has(id)));
				taskOrder = taskOrder.filter(id => !exitIds.has(id));
			}, 600);
		}

		taskOrder = newOrder;
		// Merge previous objects with current (keep exiting task objects available)
		const mergedObjects = new Map(prevObjects);
		for (const [id, task] of currentObjects) {
			mergedObjects.set(id, task);
		}
		previousTaskObjects = mergedObjects;
	});

	// Effect to detect filter changes and animate tasks being filtered in/out
	$effect(() => {
		// Track the current selectedProject
		const currentFilter = selectedProject;

		// Use untrack to read previous state without creating dependencies
		const prevFilter = untrack(() => previousSelectedProject);
		const currentOrder = untrack(() => taskOrder);
		const taskObjects = untrack(() => previousTaskObjects);
		const currentTasks = untrack(() => tasks);
		const prevFilterExiting = untrack(() => filterExitingTaskIds);

		// Skip filter animations when embedded (no header means no filter UI)
		if (!showHeader) {
			previousSelectedProject = currentFilter;
			return;
		}

		// Skip on initial load (undefined means not initialized yet)
		if (prevFilter === undefined) {
			previousSelectedProject = currentFilter;
			return;
		}

		// If filter hasn't changed, nothing to do
		if (prevFilter === currentFilter) {
			return;
		}

		// Helper to check if a task passes the filter
		const passesFilter = (taskId: string, filter: string | null): boolean => {
			if (filter === null) return true;
			return getProjectFromTaskId(taskId) === filter;
		};

		// Get all open task IDs that exist in our order
		const openTaskIds = currentOrder.filter(id => {
			const task = currentTasks.find(t => t.id === id && t.status === 'open') || taskObjects.get(id);
			return task !== undefined;
		});

		// Find tasks that were visible before but not now (filter exit)
		const exitingIds = new Set<string>();
		for (const id of openTaskIds) {
			const wasVisible = passesFilter(id, prevFilter) && !prevFilterExiting.has(id);
			const isVisible = passesFilter(id, currentFilter);
			if (wasVisible && !isVisible) {
				exitingIds.add(id);
			}
		}

		// Find tasks that were not visible before but are now (filter enter)
		const enteringIds: string[] = [];
		for (const id of openTaskIds) {
			const wasVisible = passesFilter(id, prevFilter);
			const isVisible = passesFilter(id, currentFilter);
			if (!wasVisible && isVisible) {
				enteringIds.push(id);
			}
		}

		// Update animation states
		if (exitingIds.size > 0) {
			filterExitingTaskIds = new Set([...prevFilterExiting, ...exitingIds]);
			setTimeout(() => {
				filterExitingTaskIds = new Set([...filterExitingTaskIds].filter(id => !exitingIds.has(id)));
			}, 600);
		}

		if (enteringIds.length > 0) {
			filterEnteringTaskIds = enteringIds;
			setTimeout(() => {
				filterEnteringTaskIds = [];
			}, 600);
		}

		// Update previous filter
		previousSelectedProject = currentFilter;
	});

	// Derived: tasks to render in order (includes exiting tasks in their original position)
	const orderedTasks = $derived.by(() => {
		const result: Array<{ task: Task; isExiting: boolean; isNew: boolean }> = [];
		for (const id of taskOrder) {
			const task = tasks.find(t => t.id === id && t.status === 'open') || previousTaskObjects.get(id);
			if (task) {
				const taskProject = getProjectFromTaskId(task.id);
				// Only apply project filter when header is shown (filter UI is visible)
				const matchesProject = !showHeader || selectedProject === null || taskProject === selectedProject;
				// Apply date filter (epics and non-open tasks pass through)
				const matchesDate = dueDateFilter === 'all' || task.issue_type === 'epic' || task.status !== 'open' || taskMatchesDateFilter(task, dueDateFilter);
				const matchesFilter = matchesProject && matchesDate;
				const isFilterExiting = filterExitingTaskIds.has(id);

				// Include task if it matches filter OR if it's animating out due to filter change
				if (!matchesFilter && !isFilterExiting) {
					continue;
				}

				// Task is exiting if: data-removed OR filter-removed
				const isExiting = exitingTaskIds.has(id) || isFilterExiting;
				// Task is new if: data-added OR filter-added
				const isNew = newTaskIds.includes(id) || filterEnteringTaskIds.includes(id);

				result.push({
					task,
					isExiting,
					isNew
				});
			}
		}
		return result;
	});

	// Extract project from task ID (prefix before first hyphen)
	function getProjectFromTaskId(taskId: string): string {
		const match = taskId.match(/^([a-zA-Z0-9_-]+?)-/);
		return match ? match[1].toLowerCase() : 'unknown';
	}

	// Get unique projects from all tasks
	const uniqueProjects = $derived(() => {
		const projects = new Set<string>();
		for (const task of tasks) {
			if (task.status === 'open') {
				projects.add(getProjectFromTaskId(task.id));
			}
		}
		return Array.from(projects).sort();
	});

	// Task sort comparator — respects sortBy / sortDir
	function compareTaskSort(a: Task, b: Task): number {
		const dir = sortDir === 'asc' ? 1 : -1;

		if (sortBy === 'due') {
			// Tasks with due dates first (asc = soonest first; no-due always last)
			const aHasDue = a.due_date ? 1 : 0;
			const bHasDue = b.due_date ? 1 : 0;
			if (aHasDue !== bHasDue) return bHasDue - aHasDue; // no-due always last regardless of dir
			if (a.due_date && b.due_date) {
				const diff = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
				if (diff !== 0) return diff * dir;
			}
			// Fallback: priority
			return a.priority - b.priority;
		}

		if (sortBy === 'priority') {
			if (a.priority !== b.priority) return (a.priority - b.priority) * dir;
			// Fallback: due date, then age
			const aHasDue = a.due_date ? 1 : 0;
			const bHasDue = b.due_date ? 1 : 0;
			if (aHasDue !== bHasDue) return bHasDue - aHasDue;
			if (a.created_at && b.created_at) {
				return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			}
			return 0;
		}

		if (sortBy === 'created') {
			if (a.created_at && b.created_at) {
				const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
				if (diff !== 0) return diff * dir; // asc = oldest first
			}
			return 0;
		}

		if (sortBy === 'title') {
			const cmp = a.title.localeCompare(b.title);
			if (cmp !== 0) return cmp * dir;
			return 0;
		}

		return 0;
	}

	// Derived: open tasks sorted by due date → newest first → priority, filtered by project + date (only when header is shown)
	const sortedOpenTasks = $derived(
		tasks
			.filter(t => t.status === 'open')
			.filter(t => !showHeader || selectedProject === null || getProjectFromTaskId(t.id) === selectedProject)
			.filter(t => dueDateFilter === 'all' || t.issue_type === 'epic' || taskMatchesDateFilter(t, dueDateFilter))
			.sort(compareTaskSort)
	);

	function getProjectColorReactive(taskIdOrProject: string): string | null {
		if (!taskIdOrProject) return null;
		const projectPrefix = taskIdOrProject.split('-')[0].toLowerCase();
		return projectColors[projectPrefix] || getProjectColor(taskIdOrProject);
	}

	function getTaskAge(dateStr: string | undefined): { label: string; color: string } {
		if (!dateStr) return { label: '', color: '' };
		const ms = Date.now() - new Date(dateStr).getTime();
		if (ms < 0) return { label: '', color: '' };
		const mins = Math.floor(ms / 60000);
		const hours = Math.floor(mins / 60);
		const days = Math.floor(hours / 24);
		const weeks = Math.floor(days / 7);
		const months = Math.floor(days / 30);
		const label = mins < 1 ? '<1m' : mins < 60 ? `${mins}m` : hours < 24 ? `${hours}h` : days < 7 ? `${days}d` : weeks < 5 ? `${weeks}w` : `${months}mo`;
		const color = hours < 1 ? 'oklch(0.80 0.20 145)' : hours < 6 ? 'oklch(0.72 0.15 145)' : hours < 24 ? 'oklch(0.62 0.08 160)' : days < 3 ? 'oklch(0.55 0.03 200)' : 'oklch(0.45 0.01 250)';
		return { label, color };
	}

	function hasUnresolvedBlockers(task: Task): boolean {
		if (!task.depends_on || task.depends_on.length === 0) return false;
		return task.depends_on.some(dep => dep.status !== 'closed');
	}

	function getBlockingReason(task: Task): string {
		if (!task.depends_on) return '';
		const unresolvedDeps = task.depends_on.filter(dep => dep.status !== 'closed');
		if (unresolvedDeps.length === 0) return '';
		if (unresolvedDeps.length === 1) {
			return `Blocked by ${unresolvedDeps[0].id}`;
		}
		return `Blocked by ${unresolvedDeps.length} dependencies`;
	}

	// Pre-computed map: task.id → tasks that depend on it (for "Blocks" indicator)
	// Maps a task ID to all tasks that have it in their depends_on
	const blockedByMap = $derived.by(() => {
		const map = new Map<string, Task[]>();
		for (const task of tasks) {
			if (task.status === 'closed') continue; // Only track open blockers
			if (!task.depends_on) continue;
			for (const dep of task.depends_on) {
				if (!map.has(dep.id)) {
					map.set(dep.id, []);
				}
				map.get(dep.id)!.push(task);
			}
		}
		return map;
	});

	// === Context Menu ===
	// Separate visibility from task data so DOM persists after first use (no re-creation)
	let ctxTask = $state<Task | null>(null);
	let ctxX = $state(0);
	let ctxY = $state(0);
	let ctxVisible = $state(false);
	let statusSubmenuOpen = $state(false);
	let prioritySubmenuOpen = $state(false);
	let epicSubmenuOpen = $state(false);
	let projectSubmenuOpen = $state(false);
	let epics = $state<Epic[]>([]);
	let epicsLoading = $state(false);
	let showCreateEpic = $state(false);
	let newEpicTitle = $state('');
	let creatingEpic = $state(false);
	let newEpicInput: HTMLInputElement;

	// === Feedback Reply Modal ===
	let replyModalOpen = $state(false);
	let replyModalTaskId = $state('');
	let replyModalTaskTitle = $state('');
	let integratedTaskIds = $state<Set<string>>(new Set());

	// Fetch integrated task IDs on mount
	$effect(() => {
		fetch('/api/ingest/task-ids')
			.then(r => r.json())
			.then(data => {
				integratedTaskIds = new Set(data.taskIds || []);
			})
			.catch(() => {});
	});

	function isIntegratedTask(task: Task): boolean {
		return integratedTaskIds.has(task.id) || task.title.startsWith('[Feedback]');
	}

	function openReplyModal(task: Task) {
		replyModalTaskId = task.id;
		replyModalTaskTitle = task.title;
		replyModalOpen = true;
	}

	function handleContextMenu(task: Task, event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();

		// Calculate position with viewport bounds clamping
		const menuWidth = 200;
		const menuHeight = 280;

		ctxTask = task;
		ctxX = Math.min(event.clientX, window.innerWidth - menuWidth - 8);
		ctxY = Math.min(event.clientY, window.innerHeight - menuHeight - 8);
		ctxVisible = true;
		statusSubmenuOpen = false;
		prioritySubmenuOpen = false;
		epicSubmenuOpen = false;
		projectSubmenuOpen = false;
	}

	function closeContextMenu() {
		ctxVisible = false;
		statusSubmenuOpen = false;
		prioritySubmenuOpen = false;
		epicSubmenuOpen = false;
		projectSubmenuOpen = false;
		showCreateEpic = false;
		newEpicTitle = '';
		// Note: ctxTask is intentionally NOT cleared so the DOM persists
	}

	// Close context menu on click outside or Escape
	$effect(() => {
		if (!ctxVisible) return;

		function handleClick() {
			closeContextMenu();
		}
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape') closeContextMenu();
		}

		// Defer adding listener to avoid immediate close from the right-click itself
		const timer = setTimeout(() => {
			document.addEventListener('click', handleClick);
			document.addEventListener('keydown', handleKeyDown);
		}, 0);

		return () => {
			clearTimeout(timer);
			document.removeEventListener('click', handleClick);
			document.removeEventListener('keydown', handleKeyDown);
		};
	});

	// Close floating bar dropdowns on click outside
	$effect(() => {
		if (!priorityDropdownOpen && !harnessDropdownOpen) return;

		function handleClickOutside(e: MouseEvent) {
			const target = e.target as HTMLElement;
			if (!target.closest('.floating-dropdown-wrapper')) {
				priorityDropdownOpen = false;
				harnessDropdownOpen = false;
			}
		}

		const timer = setTimeout(() => {
			document.addEventListener('click', handleClickOutside);
		}, 0);

		return () => {
			clearTimeout(timer);
			document.removeEventListener('click', handleClickOutside);
		};
	});

	// Context menu actions
	let resumingTaskId = $state<string | null>(null);

	async function handleResumeTask(task: Task) {
		const agentName = task.assignee || resumableTasks.get(task.id);
		if (!agentName) return;
		closeContextMenu();
		resumingTaskId = task.id;
		try {
			const response = await fetch(`/api/sessions/${agentName}/resume`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			});
			if (!response.ok) {
				const data = await response.json();
				if (response.status === 404) {
					addToast({ message: 'Resume failed', type: 'error', details: 'Session expired — launch a new session instead' });
				} else {
					addToast({ message: 'Resume failed', type: 'error', details: data.message || data.error || 'Could not resume session' });
				}
			} else {
				addToast({ message: 'Session resumed', type: 'success', details: `Resuming ${agentName}'s session` });
				broadcastTaskEvent('session-resumed', task.id);
			}
		} catch (err) {
			addToast({ message: 'Resume failed', type: 'error', details: 'Network error' });
			console.error('Resume error:', err);
		} finally {
			resumingTaskId = null;
		}
	}

	async function handleChangeStatus(taskId: string, newStatus: string) {
		closeContextMenu();
		try {
			const response = await fetch(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus })
			});
			if (response.ok) {
				onRetry(); // Refresh task list
			}
		} catch (err) {
			console.error('Failed to update task status:', err);
		}
	}

	async function handleChangePriority(taskId: string, newPriority: number) {
		closeContextMenu();

		// Optimistic local re-sort: update task in previousTaskObjects and re-sort taskOrder
		// immediately so FLIP can measure before/after positions in one update cycle.
		const updated = previousTaskObjects.get(taskId);
		if (updated) {
			const patched = { ...updated, priority: newPriority };
			previousTaskObjects = new Map(previousTaskObjects).set(taskId, patched);
			// Re-sort taskOrder using current data
			const objects = previousTaskObjects;
			taskOrder = [...taskOrder].sort((a, b) => {
				const ta = objects.get(a);
				const tb = objects.get(b);
				if (!ta || !tb) return 0;
				return compareTaskSort(ta, tb);
			});
		}

		// Fire API call + background refresh
		try {
			await fetch(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ priority: newPriority })
			});
			onRetry(); // Sync with server
		} catch (err) {
			console.error('Failed to update task priority:', err);
		}
	}

	async function fetchEpics(projectName: string) {
		if (!projectName) return;
		epicsLoading = true;
		try {
			const response = await fetch(`/api/epics?project=${projectName}`);
			if (response.ok) {
				const data = await response.json();
				epics = data.epics || [];
			}
		} catch (err) {
			console.error('Failed to fetch epics:', err);
		} finally {
			epicsLoading = false;
		}
	}

	async function handleLinkToEpic(taskId: string, epicId: string) {
		closeContextMenu();
		try {
			const response = await fetch(`/api/tasks/${taskId}/epic`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ epicId })
			});
			if (response.ok) {
				const data = await response.json();
				if (data.epicReopened) {
					addToast({ message: `Task linked to epic (epic was reopened)`, type: 'success', projectId: getProjectFromTaskId(taskId) || undefined, taskId, route: `/tasks?taskDetailDrawer=${taskId}` });
				} else {
					addToast({ message: `Task linked to epic`, type: 'success', projectId: getProjectFromTaskId(taskId) || undefined, taskId, route: `/tasks?taskDetailDrawer=${taskId}` });
				}
				onRetry(); // Refresh task list
			} else {
				const data = await response.json().catch(() => ({ error: 'Unknown error' }));
				addToast({ message: data.error || 'Failed to link task to epic', type: 'error' });
			}
		} catch (err) {
			console.error('Failed to link task to epic:', err);
			addToast({ message: 'Failed to link task to epic', type: 'error' });
		}
	}

	async function handleCreateEpic() {
		if (!ctxTask || creatingEpic || !newEpicTitle.trim()) return;
		creatingEpic = true;
		try {
			const project = getProjectFromTaskId(ctxTask.id);
			const response = await fetch('/api/epics', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: newEpicTitle.trim(),
					project,
					linkTaskId: ctxTask.id
				})
			});
			if (response.ok) {
				newEpicTitle = '';
				showCreateEpic = false;
				closeContextMenu();
				addToast({ message: 'Epic created and task linked', type: 'success', projectId: getProjectFromTaskId(ctxTask.id) || undefined, taskId: ctxTask.id, route: `/tasks?taskDetailDrawer=${ctxTask.id}` });
				onRetry();
			} else {
				const data = await response.json().catch(() => ({ error: 'Unknown error' }));
				addToast({ message: data.error || 'Failed to create epic', type: 'error' });
			}
		} catch (err) {
			console.error('Failed to create epic:', err);
			addToast({ message: 'Failed to create epic', type: 'error' });
		} finally {
			creatingEpic = false;
		}
	}

	// All unique project names for "Change Project" submenu
	const allProjectNames = $derived.by(() => {
		const set = new Set<string>();
		// Include all known projects from projectColors (covers all configured projects)
		for (const key of Object.keys(projectColors)) set.add(key);
		// Also include any projects visible in the current task list
		for (const t of tasks) set.add(getProjectFromTaskId(t.id));
		return [...set].sort();
	});

	async function handleChangeProject(taskId: string, newProject: string) {
		closeContextMenu();
		try {
			const response = await fetch(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project: newProject }),
			});
			if (response.ok) {
				onRetry();
			}
		} catch (err) {
			console.error('Failed to change project:', err);
		}
	}

	async function handleDuplicateTask(task: Task) {
		closeContextMenu();
		const projectName = getProjectFromTaskId(task.id);
		try {
			const response = await fetch('/api/tasks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: task.title,
					description: task.description || '',
					priority: task.priority,
					type: task.issue_type || 'task',
					project: projectName,
					labels: task.labels?.join(',') || ''
				})
			});
			if (response.ok) {
				onRetry(); // Refresh task list
			}
		} catch (err) {
			console.error('Failed to duplicate task:', err);
		}
	}

</script>

<section class="open-tasks-section" class:no-header={!showHeader} class:has-selection={selectionCount > 0} bind:this={sectionEl}>
	{#if showHeader}
		<div class="section-header">
			<h2>Open Tasks</h2>
			<span class="task-count">{sortedOpenTasks.length}</span>
			{#if selectionCount > 0}
				<span class="selection-count">{selectionCount} selected</span>
				<button type="button" class="selection-clear-btn" onclick={clearSelection}>Clear</button>
			{/if}

			{#if uniqueProjects().length > 1}
				<div class="project-filter">
					{#each uniqueProjects() as project}
						{@const color = projectColors[project] || getProjectColor(project) || 'oklch(0.65 0.15 250)'}
						{#if selectedProject === null || selectedProject === project}
							<button
								type="button"
								class="project-filter-btn {selectedProject === project ? 'active' : ''}"
								style="--project-color: {color};"
								onclick={() => selectedProject = selectedProject === project ? null : project}
								transition:fade={{ duration: 200 }}
							>
								{project}
							</button>
						{/if}
					{/each}
					{#if selectedProject !== null}
						<button
							type="button"
							class="project-filter-btn all-btn"
							onclick={() => selectedProject = null}
							transition:fade={{ duration: 200 }}
						>
							All
						</button>
					{/if}
				</div>
			{/if}

			<!-- Due Date Filter Chips -->
			<div class="date-filter-chips">
				{#each DATE_FILTER_OPTIONS as opt}
					{@const count = filterCounts[opt.id]}
					<button
						type="button"
						class="date-filter-chip"
						class:active={dueDateFilter === opt.id}
						class:has-overdue={opt.id === 'overdue' && count > 0}
						onclick={() => (dueDateFilter = opt.id)}
					>
						<span class="chip-label">{opt.label}</span>
						{#if count > 0}
							<span class="chip-count">{count}</span>
						{/if}
					</button>
				{/each}
			</div>
		</div>

		{#if sortedOpenTasks.length === 0 && dueDateFilter !== 'all' && filterCounts.all > 0}
			<div class="filter-empty-state">
				<span>No tasks matching "{DATE_FILTER_OPTIONS.find(o => o.id === dueDateFilter)?.label}" filter</span>
				<button type="button" class="filter-reset-btn" onclick={() => (dueDateFilter = 'all')}>Show all tasks</button>
			</div>
		{/if}
	{/if}

	{#if !showHeader && sortedOpenTasks.length === 0 && dueDateFilter !== 'all' && filterCounts.all > 0}
		<div class="filter-empty-state">
			<span>No tasks matching "{DATE_FILTER_OPTIONS.find(o => o.id === dueDateFilter)?.label}" filter</span>
			<button type="button" class="filter-reset-btn" onclick={() => (dueDateFilter = 'all')}>Show all tasks</button>
		</div>
	{/if}

	{#if loading && tasks.length === 0}
		<div class="loading-skeleton">
			{#each [1, 2, 3, 4] as _}
				<div class="skeleton-row">
					<div class="skeleton h-5 w-40 rounded"></div>
					<div class="skeleton h-8 w-20 rounded"></div>
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="error-state">
			<span>{error}</span>
			<button onclick={() => onRetry()}>Retry</button>
		</div>
	{:else if sortedOpenTasks.length === 0}
		<div class="empty-state">
			{#if onAddTask}
				<div class="add-task-button" role="button" tabindex="0" onclick={onAddTask} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAddTask(); } }}>
					<div class="add-task-icon">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
						</svg>
					</div>
					<span class="add-task-label">add task</span>
				</div>
			{:else}
				<span>No open tasks</span>
			{/if}
		</div>
	{:else}
		{#if bulkActionError}
			<div class="bulk-error">
				<span>{bulkActionError}</span>
				<button type="button" onclick={() => bulkActionError = ''}>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
						<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>
		{/if}
		<!-- Pull-to-refresh indicator -->
		{#if ptrPull > 0 || ptrRefreshing}
			{@const progress = Math.min(ptrPull / PTR_THRESHOLD, 1)}
			<div class="ptr-indicator" style="height: {ptrRefreshing ? 44 : Math.round(ptrPull)}px; opacity: {ptrRefreshing ? 1 : progress}">
				{#if ptrRefreshing}
					<svg class="ptr-spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 12a8 8 0 0116 0" />
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"
						style="transform: rotate({Math.round(progress * 180)}deg); transition: transform 0.1s;"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
					</svg>
				{/if}
			</div>
		{/if}

		<!-- Sort header bar — mirrors card columns exactly -->
		<div class="tasks-sort-bar">
			<!-- Spacer: checkbox col (hidden mobile) -->
			<div class="sort-bar-checkbox-spacer"></div>
			<!-- Spacer: avatar col -->
			<div class="sort-bar-avatar-spacer"></div>
			<!-- Task body col: flex-1, contains sort pills for title/priority/age -->
			<div class="sort-bar-task">
				<span class="sort-bar-label">Task</span>
				<div class="sort-bar-pills">
					<button
						class="sort-pill"
						class:sort-active={sortBy === 'priority'}
						onclick={() => cycleSortDir('priority')}
					>Pri{#if sortBy === 'priority'} {sortDir === 'asc' ? '↑' : '↓'}{/if}</button>
					<button
						class="sort-pill"
						class:sort-active={sortBy === 'created'}
						onclick={() => cycleSortDir('created')}
					>Age{#if sortBy === 'created'} {sortDir === 'asc' ? '↑' : '↓'}{/if}</button>
					<button
						class="sort-pill"
						class:sort-active={sortBy === 'title'}
						onclick={() => cycleSortDir('title')}
					>A–Z{#if sortBy === 'title'} {sortDir === 'asc' ? '↑' : '↓'}{/if}</button>
				</div>
			</div>
			<!-- Due date col — must be exactly 56px to align with card -->
			<button
				class="sort-bar-col sort-bar-due"
				class:sort-active={sortBy === 'due'}
				onclick={() => cycleSortDir('due')}
			>
				Due
				{#if sortBy === 'due'}<span class="sort-arrow">{sortDir === 'asc' ? '↑' : '↓'}</span>{/if}
			</button>
		</div>

		<!-- SwipeCard layout — always on, all viewports -->
		<div class="mobile-tasks-list">
			{#each orderedTasks as { task, isExiting, isNew } (task.id)}
				{@const projectColor = getProjectColorReactive(task.id)}
				{@const isBlocked = hasUnresolvedBlockers(task)}
				{@const typeVisual = getIssueTypeVisual(task.issue_type)}
				{@const taskAge = getTaskAge(task.created_at)}
				{@const harness = getTaskHarness(task)}
				{@const integration = taskIntegrations[task.id] || null}
				{@const swipeOffset = swipeOffsets.get(task.id) || 0}
				{@const isSwiping = swipeState?.taskId === task.id && swipeState.swiping}
				<!-- Swipe container: holds revealed trays + sliding card -->
				<div
					animate:flip={{ duration: 300, easing: cubicOut }}
					class="open-swipe-container {isNew ? 'animate-slide-in-fwd-center' : ''} {isExiting ? 'animate-slide-out-bck-center' : ''}"
				>
					<!-- Left tray: right-swipe → Launch -->
					<div class="open-swipe-tray open-swipe-tray-left" class:open-swipe-tray-visible={swipeOffset > SWIPE_DEADZONE}>
						<button class="open-swipe-action open-swipe-action-launch" onclick={() => { onSpawnTask(task, { agentId: null, model: null }); resetSwipe(task.id); }}>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>
							<span>Launch</span>
						</button>
					</div>
					<!-- Right tray: left-swipe → Details -->
					<div class="open-swipe-tray open-swipe-tray-right" class:open-swipe-tray-visible={swipeOffset < -SWIPE_DEADZONE}>
						<button class="open-swipe-action open-swipe-action-details" onclick={() => { handleRowClick(task.id); resetSwipe(task.id); }}>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="22" height="22"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" /></svg>
							<span>Details</span>
						</button>
					</div>
				<div
					class="mobile-task-card {isBlocked && !isExiting ? 'mobile-task-blocked' : ''} {longPressActive && selectedTasks.has(task.id) ? 'mobile-task-selected' : ''}"
					class:swarm-highlight={highlightedTaskIds.has(task.id)}
					style="{isExiting ? 'pointer-events: none;' : ''} {swipeOffset !== 0 ? `transform: translateX(${swipeOffset}px);` : ''} {isSwiping ? '' : swipeOffsets.has(task.id) ? 'transition: transform 0.3s cubic-bezier(0.25,0.46,0.45,0.94);' : ''}"
					role="button" tabindex="0"
					onclick={() => {
						if (isExiting || swipeState?.swiping) return;
						if (longPressActive) { haptic(8); toggleTask(task.id); }
						else handleRowClick(task.id);
					}}
					onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !isExiting && !swipeState?.swiping && handleRowClick(task.id); } }}
					oncontextmenu={(e) => !isExiting && handleContextMenu(task, e)}
					ontouchstart={(e) => { handleSwipeTouchStart(e, task.id); startLongPress(task.id); }}
					ontouchmove={(e) => { cancelLongPress(); handleSwipeTouchMove(e); }}
					ontouchend={() => { cancelLongPress(); handleSwipeTouchEnd(task); }}
					ontouchcancel={() => { cancelLongPress(); handleSwipeTouchEnd(task); }}
				>
					<div class="mobile-task-inner">
						<!-- Bulk checkbox: hidden on mobile unless long-press selection mode active -->
						<div class="card-checkbox-col {longPressActive ? 'card-checkbox-col-active' : ''}" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="presentation">
							<input
								type="checkbox"
								class="card-checkbox"
								checked={selectedTasks.has(task.id)}
								onclick={(e) => { e.stopPropagation(); haptic(8); toggleTask(task.id); }}
							/>
						</div>

						<!-- Left: circular avatar — tap on mobile → harness picker -->
						<div class="mobile-task-avatar" style="{projectColor ? `border-color: ${projectColor};` : ''}"
							ontouchend={(e) => handleAvatarTap(e, task)}
						>
							{#if isHumanTask(task)}
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="oklch(0.70 0.12 45)" width="22" height="22">
									<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
								</svg>
							{:else if harness}
								<ProviderLogo agentId={harness} size={22} />
							{:else if integration}
								<ProviderLogo agentId={integration.sourceType} size={22} />
							{:else}
								<span class="mobile-task-type-icon" title={typeVisual?.label}>{typeVisual?.icon ?? '📋'}</span>
							{/if}
						</div>

						<!-- Harness tray: slides out RIGHT from avatar on card hover -->
						{#if !isBlocked}
							<HarnessTray
								onLaunch={(agentId) => {
									if (agentId === 'human') {
										// Mark as human task (saves harness, no launch)
										handleSingleHarnessChange(task.id, { agentId: 'human', model: null });
									} else {
										onSpawnTask(task, { agentId, model: null });
									}
								}}
								onSettings={() => {
									harnessPickerTaskId = task.id;
									harnessPickerPos = {
										x: Math.max(8, window.innerWidth / 2 - 160),
										y: 80,
										openUp: true,
										maxH: window.innerHeight - 160
									};
								}}
							/>
						{/if}

						<!-- Center: title, description, badges -->
						<div class="mobile-task-body">
							<div class="mobile-task-title" title={task.title}>
								<FxText text={task.title} context={taskCtx(task)} />
							</div>
							{#if task.description}
								<div class="mobile-task-description">{task.description}</div>
							{/if}
							<div class="mobile-task-meta">
								<span class="mobile-task-id" style="{projectColor ? `color: ${projectColor};` : 'color: oklch(0.65 0.15 200);'}">{task.id}</span>
								{#if task.priority != null && task.priority <= 2}
									<span class="mobile-task-separator">·</span>
									<span class="mobile-task-priority mobile-task-priority-{task.priority}">P{task.priority}</span>
								{/if}
								{#if typeVisual && !harness && !integration}
									<span class="mobile-task-separator">·</span>
									<span class="mobile-task-type-badge" title={typeVisual.label}>{typeVisual.icon}</span>
								{/if}
								{#if taskAge.label}
									<span class="mobile-task-separator">·</span>
									<span class="mobile-task-age" style="color: {taskAge.color};">{taskAge.label}</span>
								{/if}
								{#if task.labels && task.labels.length > 0}
									<span class="mobile-task-separator">·</span>
									{#each task.labels.slice(0, 2) as label}
										<span class="mobile-task-label">{label}</span>
									{/each}
									{#if task.labels.length > 2}
										<span class="mobile-task-label-more">+{task.labels.length - 2}</span>
									{/if}
								{/if}
							</div>
						</div>

						<!-- Right: due date column (always visible, click to edit) -->
						<button
							class="mobile-task-duedate"
							onclick={(e) => { e.stopPropagation(); openDueDatePicker(task, e); }}
							title={task.due_date ? task.due_date : 'Set due date'}
						>
							{#if task.due_date}
								{@const timeStr = formatDueTime(task.due_date)}
								<span style="color: {getDueDateColor(task.due_date)};">{formatDueDate(task.due_date)}</span>
								{#if timeStr}<span class="mobile-duedate-time">{timeStr}</span>{/if}
							{:else}
								<span class="mobile-duedate-empty">+</span>
							{/if}
						</button>

						<!-- Right: blocked indicator only (human shown via amber avatar on left) -->
						{#if isBlocked}
							<div class="mobile-task-action-col mobile-task-action-blocked" title="Blocked">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="18" height="18">
									<path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
								</svg>
							</div>
						{/if}
					</div>
				</div>
			</div><!-- /open-swipe-container -->
			{/each}
		</div>

	{/if}
</section>

<!-- Due Date Picker Popover -->
{#if dueDatePickerTaskId && dueDatePickerPos}
	<div class="fixed inset-0 z-40" role="button" tabindex="0" onclick={closeDueDatePicker} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeDueDatePicker(); } }}></div>
	<div
		class="due-date-picker fixed z-50"
		style="left: {dueDatePickerPos.x}px; top: {dueDatePickerPos.y}px;"
		role="group"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
	>
		<div class="due-date-picker-header">Due Date</div>
		<div class="due-date-quick-set">
			<div class="quick-day-row">
				{#each getQuickSetDays() as day}
					<button
						class="quick-day-btn"
						class:quick-day-selected={dueDateTempValue === day.dateValue}
						onclick={() => quickSetDueDate(day.dateValue)}
						disabled={dueDateSaving}
					>
						<span class="quick-day-name">{day.label}</span>
						<span class="quick-day-num">{day.dayNum}</span>
					</button>
				{/each}
			</div>
			<div class="quick-day-labels">
				{#each getQuickSetDays() as day}
					<span class="quick-day-label-slot">
						{#if day.badge}
							<span class="quick-day-badge">{day.badge}</span>
						{/if}
					</span>
				{/each}
			</div>
		</div>
		<div class="due-date-picker-body">
			<input
				type="date"
				class="due-date-input"
				bind:value={dueDateTempValue}
			/>
			<div class="due-date-time-row">
				<label class="due-date-time-label">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="12" height="12">
						<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
					</svg>
					Time
				</label>
				<input
					type="time"
					class="due-date-time-input"
					bind:value={dueDateTempTime}
					placeholder="Optional"
				/>
			</div>
		</div>
		<div class="due-date-picker-footer">
			{#if tasks.find(t => t.id === dueDatePickerTaskId)?.due_date}
				<button class="due-date-btn due-date-btn-clear" onclick={clearDueDate} disabled={dueDateSaving}>
					Clear
				</button>
			{/if}
			<div class="flex-1"></div>
			<button class="due-date-btn due-date-btn-cancel" onclick={closeDueDatePicker} disabled={dueDateSaving}>
				Cancel
			</button>
			<button class="due-date-btn due-date-btn-save" onclick={saveDueDate} disabled={dueDateSaving || !dueDateTempValue}>
				{dueDateSaving ? 'Saving...' : 'Save'}
			</button>
		</div>
	</div>
{/if}

<!-- Floating Action Bar -->
{#if selectionCount > 0}
	<div class="floating-action-bar" transition:fade={{ duration: 150 }}>
		<span class="floating-count">{selectionCount} selected</span>
		<div class="floating-divider"></div>
		<button type="button" class="floating-btn floating-btn-spawn" onclick={handleBulkSpawn} disabled={bulkActionLoading}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
				<path d="M12 2C12 2 8 6 8 12C8 15 9 17 10 18L10 21C10 21.5 10.5 22 11 22H13C13.5 22 14 21.5 14 21L14 18C15 17 16 15 16 12C16 6 12 2 12 2Z" />
				<circle cx="12" cy="10" r="2" />
			</svg>
			{spawnProgress || 'Spawn'}
		</button>
		<button type="button" class="floating-btn floating-btn-close" onclick={handleBulkClose} disabled={bulkActionLoading}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
				<circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
			</svg>
			Close
		</button>
		<button type="button" class="floating-btn floating-btn-delete" onclick={handleBulkDelete} disabled={bulkActionLoading}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
				<polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
			</svg>
			Delete
		</button>
		<div class="floating-divider"></div>
		<!-- Priority dropdown -->
		<div class="floating-dropdown-wrapper" role="group" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
			<button type="button" class="floating-btn floating-btn-priority" onclick={() => { priorityDropdownOpen = !priorityDropdownOpen; harnessDropdownOpen = false; }} disabled={bulkActionLoading}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
					<path d="M3 3v18h18" /><path d="M18 9l-5-6-4 4-4 2" />
				</svg>
				Priority
			</button>
			{#if priorityDropdownOpen}
				<div class="floating-dropdown" transition:fade={{ duration: 100 }}>
					{#each [
						{ p: 0, label: 'P0 Critical', color: 'oklch(0.75 0.18 25)' },
						{ p: 1, label: 'P1 High', color: 'oklch(0.80 0.15 85)' },
						{ p: 2, label: 'P2 Medium', color: 'oklch(0.75 0.12 200)' },
						{ p: 3, label: 'P3 Low', color: 'oklch(0.65 0.02 250)' },
						{ p: 4, label: 'P4 Lowest', color: 'oklch(0.55 0.02 250)' }
					] as item}
						<button class="floating-dropdown-item" onclick={() => handleBulkPriority(item.p)}>
							<span class="floating-priority-dot" style="background: {item.color};"></span>
							{item.label}
						</button>
					{/each}
				</div>
			{/if}
		</div>
		<!-- Harness dropdown -->
		<div class="floating-dropdown-wrapper" role="group" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
			<button type="button" class="floating-btn floating-btn-harness" onclick={() => { harnessDropdownOpen = !harnessDropdownOpen; priorityDropdownOpen = false; }} disabled={bulkActionLoading}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
					<path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
					<circle cx="12" cy="12" r="3" />
				</svg>
				Harness
			</button>
			{#if harnessDropdownOpen}
				<div class="floating-dropdown" transition:fade={{ duration: 100 }}>
					{#each AGENT_PRESETS as preset}
						<button class="floating-dropdown-item" onclick={() => handleBulkHarness(preset.id)}>
							<ProviderLogo agentId={preset.id} size={14} />
							<span>{preset.name}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
		<div class="floating-divider"></div>
		<button type="button" class="floating-btn floating-btn-clear" onclick={() => { clearSelection(); longPressActive = false; }} disabled={bulkActionLoading}>
			{longPressActive ? 'Done' : 'Clear'}
		</button>
		{#if bulkActionLoading}
			<div class="floating-spinner"></div>
		{/if}
	</div>
{/if}

<!-- Context Menu -->
{#if ctxTask}
	<div
		class="task-context-menu"
		class:task-context-menu-hidden={!ctxVisible}
		style="left: {ctxX}px; top: {ctxY}px;"
		role="menu"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
	>
		<!-- Launch -->
		<button class="task-context-menu-item" onmouseenter={() => { statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }} onclick={() => { const t = ctxTask!; closeContextMenu(); onSpawnTask(t); ctxTask = null; }}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M12 2C12 2 8 6 8 12C8 15 9 17 10 18L10 21C10 21.5 10.5 22 11 22H13C13.5 22 14 21.5 14 21L14 18C15 17 16 15 16 12C16 6 12 2 12 2Z" />
				<circle cx="12" cy="10" r="2" />
			</svg>
			<span>Launch</span>
		</button>

		<!-- Resume (only for tasks with a resumable session) -->
		{#if ctxTask.assignee || resumableTasks.has(ctxTask.id)}
			<button class="task-context-menu-item" onmouseenter={() => { statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }} onclick={() => { const t = ctxTask!; handleResumeTask(t); ctxTask = null; }} disabled={resumingTaskId === ctxTask.id}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
				</svg>
				<span>Resume</span>
			</button>
		{/if}

		<!-- View Details -->
		<button class="task-context-menu-item" onmouseenter={() => { statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }} onclick={() => { const id = ctxTask!.id; closeContextMenu(); onTaskClick(id); ctxTask = null; }}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
				<circle cx="12" cy="12" r="3" />
			</svg>
			<span>View Details</span>
		</button>

		<!-- Reply (integrated tasks from ingest — feedback widget, Supabase, Telegram, Slack, etc.) -->
		{#if isIntegratedTask(ctxTask)}
			<button class="task-context-menu-item" onmouseenter={() => { statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }} onclick={() => { const t = ctxTask!; closeContextMenu(); openReplyModal(t); }}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
				</svg>
				<span>Reply & Close</span>
			</button>
		{/if}

		<div class="task-context-menu-divider"></div>

		<!-- Change Status (submenu) -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="task-context-menu-submenu-container"
			onmouseenter={() => { statusSubmenuOpen = true; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }}
			onmouseleave={() => { statusSubmenuOpen = false; }}
		>
			<button class="task-context-menu-item task-context-menu-item-has-submenu">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
					<polyline points="22 4 12 14.01 9 11.01" />
				</svg>
				<span>Change Status</span>
				<svg class="task-context-menu-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</button>
			{#if statusSubmenuOpen}
				<div class="task-context-submenu">
					{#each [
						{ value: 'open', label: 'Open', color: 'oklch(0.70 0.15 220)' },
						{ value: 'in_progress', label: 'In Progress', color: 'oklch(0.75 0.15 85)' },
						{ value: 'blocked', label: 'Blocked', color: 'oklch(0.65 0.18 30)' },
						{ value: 'closed', label: 'Closed', color: 'oklch(0.65 0.18 145)' }
					] as status}
						<button
							class="task-context-menu-item {ctxTask!.status === status.value ? 'task-context-menu-item-active' : ''}"
							onclick={() => handleChangeStatus(ctxTask!.id, status.value)}
						>
							<span class="task-status-dot" style="background: {status.color};"></span>
							<span>{status.label}</span>
							{#if ctxTask!.status === status.value}
								<svg class="task-context-menu-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="20 6 9 17 4 12" />
								</svg>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Change Priority (submenu) -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="task-context-menu-submenu-container"
			onmouseenter={() => { prioritySubmenuOpen = true; statusSubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }}
			onmouseleave={() => { prioritySubmenuOpen = false; }}
		>
			<button class="task-context-menu-item task-context-menu-item-has-submenu">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M3 3v18h18" /><path d="m7 16 4-8 4 4 4-6" />
				</svg>
				<span>Change Priority</span>
				<svg class="task-context-menu-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</button>
			{#if prioritySubmenuOpen}
				<div class="task-context-submenu">
					{#each [
						{ value: 0, label: 'P0 — Critical', color: 'oklch(0.70 0.20 25)' },
						{ value: 1, label: 'P1 — High', color: 'oklch(0.75 0.15 85)' },
						{ value: 2, label: 'P2 — Medium', color: 'oklch(0.70 0.15 200)' },
						{ value: 3, label: 'P3 — Low', color: 'oklch(0.55 0.03 250)' },
						{ value: 4, label: 'P4 — Lowest', color: 'oklch(0.45 0.01 250)' }
					] as pri}
						<button
							class="task-context-menu-item {ctxTask!.priority === pri.value ? 'task-context-menu-item-active' : ''}"
							onclick={() => handleChangePriority(ctxTask!.id, pri.value)}
						>
							<span class="task-status-dot" style="background: {pri.color};"></span>
							<span>{pri.label}</span>
							{#if ctxTask!.priority === pri.value}
								<svg class="task-context-menu-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="20 6 9 17 4 12" />
								</svg>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Assign to Epic (submenu) -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="task-context-menu-submenu-container"
			onmouseenter={() => { epicSubmenuOpen = true; statusSubmenuOpen = false; prioritySubmenuOpen = false; projectSubmenuOpen = false; if (ctxTask) { const p = getProjectFromTaskId(ctxTask.id); fetchEpics(p); } }}
			onmouseleave={() => { epicSubmenuOpen = false; }}
		>
			<button class="task-context-menu-item task-context-menu-item-has-submenu">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
				</svg>
				<span>Assign to Epic</span>
				<svg class="task-context-menu-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</button>
			{#if epicSubmenuOpen}
				<div class="task-context-submenu task-context-submenu-epic">
					{#if epicsLoading}
						<div class="task-context-menu-loading">Loading...</div>
					{:else if epics.length === 0 && !showCreateEpic}
						<div class="task-context-menu-empty" style="padding: 0.25rem 0;">
							<span style="opacity: 0.5; font-size: 0.75rem;">No epics found</span>
						</div>
					{:else}
						{#each epics as epic}
							<button
								class="task-context-menu-item"
								onclick={() => handleLinkToEpic(ctxTask!.id, epic.id)}
							>
								<span class="task-epic-id">{epic.id}</span>
								<span class="task-epic-title">{epic.title}</span>
							</button>
						{/each}
					{/if}
					{#if !epicsLoading}
						{#if showCreateEpic}
							<div style="padding: 0.25rem 0.5rem; display: flex; gap: 0.25rem; align-items: center;">
								<!-- svelte-ignore a11y_autofocus -->
								<input
									bind:this={newEpicInput}
									bind:value={newEpicTitle}
									onkeydown={(e) => { if (e.key === 'Enter' && newEpicTitle.trim()) { e.preventDefault(); handleCreateEpic(); } else if (e.key === 'Escape') { showCreateEpic = false; newEpicTitle = ''; } }}
									placeholder="Epic title..."
									disabled={creatingEpic}
									autofocus
									class="task-epic-create-input"
								/>
								<button
									class="task-epic-create-btn"
									onclick={handleCreateEpic}
									disabled={creatingEpic || !newEpicTitle.trim()}
								>
									{#if creatingEpic}...{:else}+{/if}
								</button>
							</div>
						{:else}
							<div class="task-context-menu-divider"></div>
							<button
								class="task-context-menu-item"
								onclick={() => { showCreateEpic = true; setTimeout(() => newEpicInput?.focus(), 50); }}
							>
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
								</svg>
								<span>Create Epic</span>
							</button>
						{/if}
					{/if}
				</div>
			{/if}
		</div>

		<!-- Change Project (submenu) -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="task-context-menu-submenu-container"
			onmouseenter={() => { projectSubmenuOpen = true; statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; }}
			onmouseleave={() => { projectSubmenuOpen = false; }}
		>
			<button class="task-context-menu-item task-context-menu-item-has-submenu">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
					<path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
				</svg>
				<span>Change Project</span>
				<svg class="task-context-menu-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</button>
			{#if projectSubmenuOpen}
				<div class="task-context-submenu task-context-submenu-project">
					{#each allProjectNames as proj}
						{@const currentProject = getProjectFromTaskId(ctxTask!.id)}
						<button
							class="task-context-menu-item {currentProject === proj ? 'task-context-menu-item-active' : ''}"
							onclick={() => handleChangeProject(ctxTask!.id, proj)}
						>
							<span class="task-status-dot" style="background: {projectColors[proj] || getProjectColor(proj + '-x')};"></span>
							<span>{proj}</span>
							{#if currentProject === proj}
								<svg class="task-context-menu-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<polyline points="20 6 9 17 4 12" />
								</svg>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<div class="task-context-menu-divider"></div>

		<!-- Duplicate -->
		<button class="task-context-menu-item" onmouseenter={() => { statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }} onclick={() => handleDuplicateTask(ctxTask!)}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
				<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
			</svg>
			<span>Duplicate</span>
		</button>

		<!-- Close Task -->
		<button class="task-context-menu-item task-context-menu-item-danger" onmouseenter={() => { statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }} onclick={() => handleChangeStatus(ctxTask!.id, 'closed')}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10" />
				<line x1="15" y1="9" x2="9" y2="15" />
				<line x1="9" y1="9" x2="15" y2="15" />
			</svg>
			<span>Close Task</span>
		</button>

		<!-- Delete Task -->
		<button class="task-context-menu-item task-context-menu-item-danger" onmouseenter={() => { statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }} onclick={() => handleDeleteTask(ctxTask!.id)}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="3 6 5 6 21 6" />
				<path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
				<line x1="10" y1="11" x2="10" y2="17" />
				<line x1="14" y1="11" x2="14" y2="17" />
			</svg>
			<span>Delete Task</span>
		</button>
	</div>
{/if}

<!-- Single-task Harness + Model Picker (AgentSelector) -->
{#if harnessPickerTaskId}
	{@const pickerTask = tasks.find(t => t.id === harnessPickerTaskId)}
	{#if pickerTask}
		<div class="harness-picker-backdrop" role="button" tabindex="0" onclick={() => harnessPickerTaskId = null} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); harnessPickerTaskId = null; } }}></div>
		<div
			class="fixed z-50 overflow-y-auto rounded-lg"
			style="left: {harnessPickerPos.x}px; {harnessPickerPos.openUp ? `bottom: ${harnessPickerPos.y}px;` : `top: ${harnessPickerPos.y}px;`} max-height: {harnessPickerPos.maxH}px;"
			role="group"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<AgentSelector
				task={pickerTask}
				onsave={(selection) => handleSingleHarnessChange(harnessPickerTaskId!, selection)}
				onselect={(selection) => handleSingleHarnessSaveAndLaunch(harnessPickerTaskId!, selection)}
				oncancel={() => harnessPickerTaskId = null}
			/>
		</div>
	{/if}
{/if}

<!-- Feedback Reply Modal -->
<FeedbackReplyModal
	bind:taskId={replyModalTaskId}
	bind:taskTitle={replyModalTaskTitle}
	bind:isOpen={replyModalOpen}
	onComplete={() => {
		addToast({ message: 'Reply sent', type: 'success' });
	}}
/>

<style>
	/* Section styling */
	.open-tasks-section {
		background: oklch(0.18 0.01 250);
		border-radius: 0.75rem;
		border: 1px solid oklch(0.25 0.02 250);
	}

	.open-tasks-section.no-header {
		background: transparent;
		border: none;
		border-radius: 0;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.875rem 1rem;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.section-header h2 {
		font-size: 0.9375rem;
		font-weight: 600;
		color: oklch(0.85 0.02 250);
		margin: 0;
	}

	.task-count {
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.125rem 0.5rem;
		background: oklch(0.25 0.02 250);
		border-radius: 9999px;
		color: oklch(0.70 0.02 250);
	}

	/* Project filter */
	.project-filter {
		margin-left: auto;
		display: flex;
		gap: 0.375rem;
	}

	.project-filter-btn {
		font-size: 0.6875rem;
		font-weight: 500;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		text-transform: lowercase;
		padding: 0.25rem 0.5rem;
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.15s ease;
		/* Use CSS custom property for project color */
		background: color-mix(in oklch, var(--project-color) 15%, transparent);
		border: 1px solid color-mix(in oklch, var(--project-color) 35%, transparent);
		color: var(--project-color);
	}

	.project-filter-btn:hover {
		background: color-mix(in oklch, var(--project-color) 25%, transparent);
		border-color: color-mix(in oklch, var(--project-color) 50%, transparent);
	}

	.project-filter-btn.active {
		background: color-mix(in oklch, var(--project-color) 30%, transparent);
		border-color: color-mix(in oklch, var(--project-color) 60%, transparent);
		box-shadow: 0 0 8px color-mix(in oklch, var(--project-color) 30%, transparent);
	}

	.project-filter-btn.all-btn {
		--project-color: oklch(0.70 0.02 250);
	}

	/* Due Date Filter Chips */
	.section-header:has(.project-filter) .date-filter-chips {
		margin-left: 0;
	}
	.date-filter-chips {
		display: flex;
		gap: 0.375rem;
		overflow-x: auto;
		scrollbar-width: none;
		margin-left: auto;
		padding-right: 0.25rem;
	}
	.date-filter-chips::-webkit-scrollbar { display: none; }
	.date-filter-chip {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		border-radius: 999px;
		border: 1px solid oklch(0.30 0.02 250);
		background: oklch(0.20 0.01 250);
		color: oklch(0.65 0.02 250);
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
		flex-shrink: 0;
	}
	.date-filter-chip:hover {
		background: oklch(0.24 0.02 250);
		border-color: oklch(0.38 0.03 250);
		color: oklch(0.80 0.02 250);
	}
	.date-filter-chip.active {
		background: oklch(0.28 0.08 200);
		border-color: oklch(0.55 0.12 200);
		color: oklch(0.90 0.05 200);
	}
	.date-filter-chip.has-overdue {
		border-color: oklch(0.50 0.15 25);
	}
	.date-filter-chip.has-overdue.active {
		background: oklch(0.28 0.08 25);
		border-color: oklch(0.55 0.15 25);
		color: oklch(0.90 0.08 25);
	}
	.chip-label { line-height: 1; }
	.chip-count {
		font-size: 0.6875rem;
		font-weight: 600;
		background: oklch(0.30 0.03 250);
		color: oklch(0.75 0.02 250);
		padding: 0.0625rem 0.375rem;
		border-radius: 999px;
		min-width: 1.25rem;
		text-align: center;
	}
	.date-filter-chip.active .chip-count {
		background: oklch(0.40 0.10 200);
		color: oklch(0.95 0.02 200);
	}
	.date-filter-chip.has-overdue.active .chip-count {
		background: oklch(0.45 0.12 25);
		color: oklch(0.95 0.02 25);
	}

	/* Filter empty state */
	.filter-empty-state {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		color: oklch(0.55 0.02 250);
		font-size: 0.8125rem;
	}
	.filter-reset-btn {
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
		border: 1px solid oklch(0.35 0.06 200);
		background: oklch(0.22 0.03 200);
		color: oklch(0.75 0.10 200);
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}
	.filter-reset-btn:hover {
		background: oklch(0.28 0.06 200);
		border-color: oklch(0.45 0.10 200);
		color: oklch(0.85 0.08 200);
	}

	/* Loading skeleton */
	.loading-skeleton {
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.skeleton-row {
		display: flex;
		gap: 1rem;
	}

	.skeleton {
		background: oklch(0.25 0.02 250);
		animation: pulse 1.5s infinite;
	}

	/* Error and empty states */
	.error-state,
	.empty-state {
		padding: 2rem;
		text-align: center;
		color: oklch(0.60 0.02 250);
	}

	/* Add task button - matches mockup design */
	.add-task-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		width: 220px;
		height: 160px;
		margin: 0 auto;
		border: 2px dashed oklch(0.60 0.15 50);
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
		background: transparent;
	}

	.add-task-button:hover {
		border-color: oklch(0.70 0.18 50);
		background: oklch(0.70 0.18 50 / 0.08);
	}

	.add-task-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		border: 2px solid oklch(0.60 0.15 50);
		border-radius: 0.5rem;
		color: oklch(0.65 0.15 50);
		transition: all 0.2s ease;
	}

	.add-task-button:hover .add-task-icon {
		border-color: oklch(0.70 0.18 50);
		color: oklch(0.75 0.18 50);
	}

	.add-task-icon svg {
		width: 40px;
		height: 40px;
	}

	.add-task-label {
		font-size: 1rem;
		font-weight: 500;
		color: oklch(0.65 0.15 50);
		transition: color 0.2s ease;
	}

	.add-task-button:hover .add-task-label {
		color: oklch(0.75 0.18 50);
	}

	.error-state button {
		margin-top: 0.75rem;
		padding: 0.375rem 0.75rem;
		background: oklch(0.25 0.02 250);
		border: 1px solid oklch(0.35 0.02 250);
		border-radius: 0.5rem;
		color: oklch(0.80 0.02 250);
		cursor: pointer;
	}

	/* Table styling */
	.tasks-table-wrapper {
		overflow-x: auto;
	}

	.tasks-table {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
	}

	.tasks-table th {
		text-align: left;
		padding: 0.625rem 1rem;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(0.55 0.02 250);
		background: oklch(0.16 0.01 250);
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	/* Column layout widths (badge + title merged into task column) */
	.th-task, .td-task { width: auto; padding-left: 0.25rem; padding-right: 0.25rem; }
	.th-attachment, .td-attachment { width: 32px; min-width: 32px; max-width: 32px; padding: 0.375rem 0.25rem !important; text-align: center; vertical-align: middle; }
	.th-due-date, .td-due-date { width: 80px; min-width: 80px; max-width: 80px; text-align: center; padding: 0.5rem 0.25rem !important; }
	.th-actions, .td-actions { width: 80px; text-align: right; }

	.tasks-table td {
		padding: 0.75rem 1rem;
		vertical-align: middle;
		border-bottom: 1px solid oklch(0.22 0.02 250);
	}

	.task-row {
		transition: background 0.15s;
		cursor: pointer;
	}

	.task-row:hover {
		background: oklch(0.20 0.01 250);
	}

	/* Task cell content - matches TasksActive structure */
	.task-cell-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.25rem;
		min-width: 0;
		width: 100%;
	}

	/* Badge + text side by side */
	.badge-and-text {
		display: flex;
		align-items: flex-start;
		gap: 0.625rem;
		min-width: 0;
		width: 100%;
	}

	.text-column {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
		flex: 1;
		padding-top: 0.125rem;
	}

	/* Task info */
	.task-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.task-title {
		font-size: 0.8125rem;
		color: oklch(0.88 0.02 250);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
		min-width: 0;
	}

	.task-description {
		font-size: 0.75rem;
		color: oklch(0.55 0.02 250);
		margin-top: 0.375rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Actions column - center the rocket button */
	.td-actions {
		text-align: center;
	}

	/* Attachment thumbnail column */
	.td-attachment {
		height: 1px; /* trick to let child fill height */
	}
	.attachment-thumb {
		width: 28px;
		height: 100%;
		min-height: 28px;
		border-radius: 0.25rem;
		overflow: hidden;
		cursor: pointer;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid oklch(0.30 0.02 250);
		transition: border-color 0.15s, transform 0.15s;
	}

	.attachment-thumb:hover {
		border-color: oklch(0.50 0.10 240);
		transform: scale(1.15);
	}

	.attachment-thumb-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.attachment-count {
		position: absolute;
		bottom: -2px;
		right: -2px;
		font-size: 0.5rem;
		font-weight: 700;
		background: oklch(0.35 0.05 250);
		color: oklch(0.85 0.02 250);
		padding: 0 3px;
		border-radius: 0.25rem;
		line-height: 1.2;
		border: 1px solid oklch(0.20 0.02 250);
	}

	/* Due date column */
	.td-due-date {
		cursor: pointer;
		position: relative;
	}

	.td-due-date:hover {
		background: oklch(0.22 0.02 250) !important;
	}

	.due-date-display {
		font-size: 0.75rem;
		font-weight: 500;
		white-space: nowrap;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.0625rem;
	}

	.due-date-time-display {
		font-size: 0.625rem;
		font-weight: 400;
		opacity: 0.7;
	}

	.due-date-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		color: oklch(0.40 0.02 250);
	}

	.task-row:hover .due-date-empty svg {
		opacity: 0.5 !important;
	}

	/* Due date picker popover */
	.due-date-picker {
		width: 260px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		box-shadow: 0 10px 30px oklch(0.05 0 0 / 0.5);
		animation: contextMenuIn 0.1s ease;
	}

	.due-date-picker-header {
		padding: 0.625rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(0.55 0.02 250);
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.due-date-quick-set {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		padding: 0.625rem 0.75rem 0.375rem;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.quick-day-row {
		display: flex;
		gap: 0.25rem;
	}

	.quick-day-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.125rem;
		padding: 0.375rem 0.25rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		cursor: pointer;
		transition: all 0.1s;
	}

	.quick-day-btn:hover:not(:disabled) {
		background: oklch(0.22 0.02 250);
		border-color: oklch(0.40 0.08 250);
	}

	.quick-day-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.quick-day-selected {
		background: oklch(0.30 0.10 250);
		border-color: oklch(0.50 0.15 250);
	}

	.quick-day-name {
		font-size: 0.625rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: oklch(0.55 0.02 250);
	}

	.quick-day-num {
		font-size: 0.9375rem;
		font-weight: 600;
		color: oklch(0.85 0.02 250);
		line-height: 1;
	}

	.quick-day-labels {
		display: flex;
		gap: 0.25rem;
	}

	.quick-day-label-slot {
		flex: 1;
		display: flex;
		justify-content: center;
		min-height: 0.875rem;
	}

	.quick-day-badge {
		font-size: 0.5625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: oklch(0.80 0.15 200);
	}

	.due-date-picker-body {
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.due-date-input, .due-date-time-input {
		width: 100%;
		padding: 0.5rem 0.625rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.5rem;
		color: oklch(0.88 0.02 250);
		font-size: 0.8125rem;
		outline: none;
		transition: border-color 0.15s;
	}

	.due-date-input:focus, .due-date-time-input:focus {
		border-color: oklch(0.60 0.15 250);
	}

	/* Style the calendar icon and date picker chrome */
	.due-date-input::-webkit-calendar-picker-indicator,
	.due-date-time-input::-webkit-calendar-picker-indicator {
		filter: invert(0.7);
		cursor: pointer;
	}

	.due-date-time-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.due-date-time-label {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.75rem;
		color: oklch(0.55 0.02 250);
		white-space: nowrap;
		min-width: 50px;
	}

	.due-date-time-input {
		flex: 1;
	}

	.due-date-picker-footer {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		border-top: 1px solid oklch(0.25 0.02 250);
	}

	.due-date-btn {
		padding: 0.375rem 0.625rem;
		border: none;
		border-radius: 0.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.1s;
	}

	.due-date-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.due-date-btn-cancel {
		background: transparent;
		color: oklch(0.65 0.02 250);
	}

	.due-date-btn-cancel:hover:not(:disabled) {
		background: oklch(0.22 0.02 250);
	}

	.due-date-btn-save {
		background: oklch(0.45 0.15 250);
		color: oklch(0.95 0.02 250);
	}

	.due-date-btn-save:hover:not(:disabled) {
		background: oklch(0.50 0.15 250);
	}

	.due-date-btn-clear {
		background: transparent;
		color: oklch(0.65 0.15 30);
	}

	.due-date-btn-clear:hover:not(:disabled) {
		background: oklch(0.55 0.15 30 / 0.15);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.th-attachment, .td-attachment {
			display: none;
		}

		.th-due-date, .td-due-date {
			display: none;
		}

		.th-task {
			width: 60%;
		}

		.th-actions {
			width: 40%;
		}
	}

	/* === Context Menu (matches FileTree styling) === */
	.task-context-menu {
		position: fixed;
		z-index: 100;
		min-width: 180px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		padding: 0.375rem;
		box-shadow: 0 10px 30px oklch(0.05 0 0 / 0.5);
		animation: contextMenuIn 0.1s ease;
	}

	.task-context-menu-hidden {
		display: none;
	}

	@keyframes contextMenuIn {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}

	.task-context-menu-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: none;
		background: transparent;
		color: oklch(0.80 0.02 250);
		font-size: 0.8125rem;
		text-align: left;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: all 0.1s ease;
	}

	.task-context-menu-item:hover {
		background: oklch(0.25 0.02 250);
	}

	.task-context-menu-item svg {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		color: oklch(0.60 0.02 250);
	}

	.task-context-menu-item:hover svg {
		color: oklch(0.75 0.02 250);
	}

	.task-context-menu-item-danger:hover {
		background: oklch(0.55 0.15 30 / 0.2);
		color: oklch(0.75 0.18 30);
	}

	.task-context-menu-item-danger:hover svg {
		color: oklch(0.70 0.18 30);
	}

	.task-context-menu-divider {
		height: 1px;
		background: oklch(0.28 0.02 250);
		margin: 0.375rem 0;
	}

	/* Submenu container and panel */
	.task-context-menu-submenu-container {
		position: relative;
	}

	.task-context-submenu {
		position: absolute;
		left: 100%;
		top: 0;
		min-width: 150px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		padding: 0.375rem;
		box-shadow: 0 10px 30px oklch(0.05 0 0 / 0.5);
		animation: contextMenuIn 0.1s ease;
		margin-left: 2px;
	}

	.task-context-submenu-epic {
		min-width: 220px;
		max-height: 240px;
		overflow-y: auto;
	}

	.task-context-submenu-project {
		max-height: 300px;
		overflow-y: auto;
	}

	/* Chevron for submenu indicators */
	.task-context-menu-chevron {
		width: 12px !important;
		height: 12px !important;
		margin-left: auto;
		color: oklch(0.50 0.02 250) !important;
	}

	/* Status dot */
	.task-status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	/* Active status indicator (checkmark) */
	.task-context-menu-item-active {
		color: oklch(0.85 0.02 250);
	}

	.task-context-menu-check {
		width: 14px !important;
		height: 14px !important;
		margin-left: auto;
		color: oklch(0.70 0.15 145) !important;
	}

	/* Epic item styling */
	.task-epic-id {
		font-size: 0.6875rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		color: oklch(0.60 0.02 250);
		flex-shrink: 0;
	}

	.task-epic-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.task-epic-create-input {
		flex: 1;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.25rem;
		padding: 0.25rem 0.375rem;
		font-size: 0.75rem;
		color: oklch(0.90 0.02 250);
		outline: none;
	}
	.task-epic-create-input:focus {
		border-color: oklch(0.55 0.15 250);
	}
	.task-epic-create-btn {
		background: oklch(0.30 0.02 250);
		border: 1px solid oklch(0.35 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.80 0.02 250);
		font-size: 0.875rem;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		flex-shrink: 0;
	}
	.task-epic-create-btn:hover:not(:disabled) {
		background: oklch(0.40 0.10 145);
		border-color: oklch(0.50 0.12 145);
	}
	.task-epic-create-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}

	/* Loading and empty states in submenu */
	.task-context-menu-loading,
	.task-context-menu-empty {
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		color: oklch(0.55 0.02 250);
		text-align: center;
	}

	/* === Bulk Selection === */

	/* Checkbox columns */
	.th-checkbox, .td-checkbox {
		width: 32px;
		min-width: 32px;
		max-width: 32px;
		text-align: center;
		padding: 0 !important;
	}

	.td-checkbox {
		cursor: pointer;
	}

	/* Checkbox styling */
	.bulk-checkbox {
		width: 14px;
		height: 14px;
		cursor: pointer;
		accent-color: oklch(0.70 0.18 240);
		opacity: 0;
		transition: opacity 0.15s;
	}

	/* Show checkboxes: on row hover, when checked, or when any selection active */
	.task-row:hover .bulk-checkbox,
	.bulk-checkbox:checked,
	.has-selection .bulk-checkbox {
		opacity: 1;
	}

	/* Select-all checkbox always visible when there's a selection */
	.select-all-checkbox {
		opacity: 0;
		transition: opacity 0.15s;
	}

	.has-selection .select-all-checkbox,
	.tasks-table thead:hover .select-all-checkbox {
		opacity: 1;
	}

	/* Selected row highlight */
	.selected-row {
		background: oklch(0.70 0.18 240 / 0.08) !important;
	}

	.selected-row:hover {
		background: oklch(0.70 0.18 240 / 0.12) !important;
	}

	/* Swarm hover highlight - launchable tasks glow when swarm button is hovered. */
	.swarm-highlight {
		background: oklch(0.65 0.20 280 / 0.12) !important;
		border-color: oklch(0.65 0.20 280 / 0.4) !important;
		box-shadow: inset 0 0 20px oklch(0.65 0.20 280 / 0.08);
		transition: background 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
	}

	/* Selection count badge in header */
	.selection-count {
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.125rem 0.5rem;
		background: oklch(0.70 0.18 240 / 0.15);
		border: 1px solid oklch(0.70 0.18 240 / 0.3);
		border-radius: 9999px;
		color: oklch(0.80 0.12 240);
	}

	.selection-clear-btn {
		font-size: 0.6875rem;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		border: 1px solid oklch(0.35 0.02 250);
		background: transparent;
		color: oklch(0.65 0.02 250);
		cursor: pointer;
		transition: all 0.15s;
	}

	.selection-clear-btn:hover {
		background: oklch(0.25 0.02 250);
		color: oklch(0.80 0.02 250);
	}

	/* Bulk error banner */
	.bulk-error {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: oklch(0.55 0.15 30 / 0.12);
		border-bottom: 1px solid oklch(0.55 0.15 30 / 0.25);
		color: oklch(0.75 0.15 30);
		font-size: 0.8125rem;
	}

	.bulk-error span {
		flex: 1;
	}

	.bulk-error button {
		display: flex;
		align-items: center;
		background: transparent;
		border: none;
		color: oklch(0.65 0.10 30);
		cursor: pointer;
		padding: 0.125rem;
		border-radius: 0.25rem;
	}

	.bulk-error button:hover {
		color: oklch(0.80 0.15 30);
		background: oklch(0.55 0.15 30 / 0.15);
	}

	/* === Floating Action Bar === */
	:global(.floating-action-bar) {
		position: fixed;
		bottom: 1.5rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 50;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		background: oklch(0.16 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.75rem;
		box-shadow: 0 8px 32px oklch(0.05 0 0 / 0.6), 0 2px 8px oklch(0.05 0 0 / 0.3);
	}

	:global(.floating-count) {
		font-size: 0.8125rem;
		font-weight: 600;
		color: oklch(0.85 0.02 250);
		white-space: nowrap;
	}

	:global(.floating-divider) {
		width: 1px;
		height: 1.25rem;
		background: oklch(0.30 0.02 250);
	}

	:global(.floating-btn) {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.625rem;
		border: 1px solid transparent;
		border-radius: 0.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
	}

	:global(.floating-btn:disabled) {
		opacity: 0.5;
		pointer-events: none;
	}

	:global(.floating-btn-spawn) {
		background: oklch(0.65 0.18 250 / 0.15);
		color: oklch(0.82 0.14 250);
		border-color: oklch(0.65 0.18 250 / 0.3);
	}

	:global(.floating-btn-spawn:hover) {
		background: oklch(0.65 0.18 250 / 0.25);
	}

	:global(.floating-btn-close) {
		background: oklch(0.75 0.15 85 / 0.12);
		color: oklch(0.80 0.12 85);
		border-color: oklch(0.75 0.15 85 / 0.25);
	}

	:global(.floating-btn-close:hover) {
		background: oklch(0.75 0.15 85 / 0.22);
	}

	:global(.floating-btn-delete) {
		background: oklch(0.55 0.18 30 / 0.15);
		color: oklch(0.80 0.15 30);
		border-color: oklch(0.55 0.18 30 / 0.3);
	}

	:global(.floating-btn-delete:hover) {
		background: oklch(0.55 0.18 30 / 0.25);
	}

	:global(.floating-btn-clear) {
		background: transparent;
		color: oklch(0.65 0.02 250);
	}

	:global(.floating-btn-clear:hover) {
		background: oklch(0.25 0.02 250);
		color: oklch(0.80 0.02 250);
	}

	:global(.floating-spinner) {
		width: 14px;
		height: 14px;
		border: 2px solid oklch(0.35 0.02 250);
		border-top-color: oklch(0.70 0.15 240);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Priority button */
	:global(.floating-btn-priority) {
		background: oklch(0.55 0.15 200 / 0.15);
		color: oklch(0.80 0.12 200);
		border-color: oklch(0.55 0.15 200 / 0.3);
	}

	:global(.floating-btn-priority:hover) {
		background: oklch(0.55 0.15 200 / 0.25);
	}

	/* Harness button */
	:global(.floating-btn-harness) {
		background: oklch(0.55 0.15 300 / 0.15);
		color: oklch(0.80 0.12 300);
		border-color: oklch(0.55 0.15 300 / 0.3);
	}

	:global(.floating-btn-harness:hover) {
		background: oklch(0.55 0.15 300 / 0.25);
	}

	/* Dropdown wrapper for floating bar */
	:global(.floating-dropdown-wrapper) {
		position: relative;
	}

	/* Dropdown menu above the floating bar */
	:global(.floating-dropdown) {
		position: absolute;
		bottom: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%);
		min-width: 160px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.30 0.02 250);
		border-radius: 0.5rem;
		padding: 0.375rem;
		box-shadow: 0 8px 24px oklch(0.05 0 0 / 0.5);
		z-index: 60;
	}

	:global(.floating-dropdown-item) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.375rem 0.625rem;
		border: none;
		background: transparent;
		color: oklch(0.80 0.02 250);
		font-size: 0.75rem;
		text-align: left;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: background 0.1s;
		white-space: nowrap;
	}

	:global(.floating-dropdown-item:hover) {
		background: oklch(0.25 0.02 250);
	}

	:global(.floating-priority-dot) {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	/* === Single-task Harness Picker Backdrop === */
	.harness-picker-backdrop {
		position: fixed;
		inset: 0;
		z-index: 49;
	}

	/* === Mobile Task Cards === */
	.mobile-tasks-list {
		display: flex;
		flex-direction: column;
	}

	/* === Mobile Task Cards — three-column swipe-card design === */

	.mobile-task-card {
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-bottom: none;
		border-radius: 0;
		cursor: pointer;
		transition: background 0.15s;
		overflow: hidden;
	}

	.open-swipe-container:first-child .mobile-task-card {
		border-radius: 0.5rem 0.5rem 0 0;
	}

	.open-swipe-container:last-child .mobile-task-card {
		border-radius: 0 0 0.5rem 0.5rem;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.open-swipe-container:only-child .mobile-task-card {
		border-radius: 0.5rem;
		border-bottom: 1px solid oklch(0.25 0.02 250);
	}

	.mobile-task-card:active {
		background: oklch(0.20 0.02 250);
	}

	.mobile-task-blocked {
		opacity: 0.7;
	}

	/* Inner three-column flex row — position:relative anchors the absolute HarnessTray */
	.mobile-task-inner {
		position: relative;
		display: flex;
		align-items: stretch;
		min-height: 0;
	}

	/* Left: circular avatar */
	.mobile-task-avatar {
		width: 52px;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: oklch(0.18 0.01 250);
		border-right: 1px solid oklch(0.22 0.02 250);
	}

	.mobile-task-avatar > :global(*) {
		border-radius: 50%;
	}

	.mobile-task-type-icon {
		font-size: 1.25rem;
		line-height: 1;
	}

	/* Center: title + description + meta */
	.mobile-task-body {
		flex: 1;
		min-width: 0;
		padding: 0.625rem 0.625rem;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.mobile-task-title {
		min-width: 0;
		font-size: 0.9375rem;
		font-weight: 600;
		color: oklch(0.88 0.02 250);
		font-family: system-ui, -apple-system, sans-serif;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.mobile-task-description {
		min-width: 0;
		font-size: 0.6875rem;
		color: oklch(0.55 0.02 250);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		line-height: 1.4;
	}

	.mobile-task-meta {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-top: 0.1rem;
		font-size: 0.625rem;
		font-family: ui-monospace, monospace;
		color: oklch(0.50 0.02 250);
		flex-wrap: wrap;
	}

	.mobile-task-priority-2 {
		color: oklch(0.75 0.12 200);
		background: oklch(0.75 0.12 200 / 0.12);
	}

	.mobile-task-age {
		font-weight: 600;
		font-size: 0.5625rem;
	}

	.mobile-task-label {
		font-size: 0.5625rem;
		font-weight: 500;
		padding: 0 0.25rem;
		border-radius: 0.25rem;
		background: oklch(0.30 0.02 250);
		color: oklch(0.65 0.02 250);
	}

	.mobile-task-label-more {
		font-size: 0.5625rem;
		color: oklch(0.50 0.02 250);
	}

	/* Right: action column */
	.mobile-task-actions {
		flex-shrink: 0;
		display: flex;
		align-items: stretch;
	}

	.mobile-task-action-col {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 52px;
		border-left: 1px solid oklch(0.22 0.02 250);
		gap: 3px;
		font-size: 0.5rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.mobile-task-action-launch {
		background: transparent;
		border: none;
		color: oklch(0.65 0.18 250);
		cursor: pointer;
		transition: background 0.15s, color 0.15s;
	}

	.mobile-task-action-launch:hover {
		background: oklch(0.65 0.18 250 / 0.08);
		color: oklch(0.80 0.18 250);
	}

	.mobile-task-action-launch:active {
		background: oklch(0.65 0.18 250 / 0.15);
		color: oklch(0.85 0.18 250);
	}

	.mobile-task-action-blocked {
		color: oklch(0.55 0.12 30);
		opacity: 0.6;
		cursor: default;
	}

	.mobile-task-action-human {
		color: oklch(0.65 0.12 45);
		opacity: 0.7;
		cursor: default;
	}

	/* Swipe-to-reveal container */
	.open-swipe-container {
		position: relative;
		overflow: hidden;
	}

	.open-swipe-tray {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 90px;
		display: flex;
		align-items: stretch;
		opacity: 0;
		transition: opacity 0.15s;
		pointer-events: none;
	}

	.open-swipe-tray-left {
		left: 0;
	}

	.open-swipe-tray-right {
		right: 0;
	}

	.open-swipe-tray-visible {
		opacity: 1;
		pointer-events: auto;
	}

	.open-swipe-action {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
		border: none;
		cursor: pointer;
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: oklch(0.95 0.01 250);
		font-family: system-ui, -apple-system, sans-serif;
	}

	.open-swipe-action-launch {
		background: oklch(0.50 0.18 145);
	}

	.open-swipe-action-details {
		background: oklch(0.50 0.12 270);
	}

	/* Sort header bar */
	.tasks-sort-bar {
		display: flex;
		align-items: stretch;
		border-bottom: 1px solid oklch(0.22 0.02 250);
		background: oklch(0.155 0.01 250);
		height: 26px;
		flex-shrink: 0;
	}

	.sort-bar-checkbox-spacer {
		display: none;
		width: 40px;
		flex-shrink: 0;
		border-right: 1px solid oklch(0.20 0.01 250);
	}
	@media (min-width: 640px) {
		.sort-bar-checkbox-spacer {
			display: block;
		}
	}

	.sort-bar-avatar-spacer {
		width: 52px;
		flex-shrink: 0;
		border-right: 1px solid oklch(0.20 0.01 250);
	}

	.sort-bar-col {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 3px;
		padding: 0 6px;
		font-size: 0.5625rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: oklch(0.45 0.02 250);
		background: transparent;
		border: none;
		cursor: pointer;
		font-family: ui-monospace, monospace;
		transition: color 0.1s, background 0.1s;
	}

	.sort-bar-col:hover {
		color: oklch(0.70 0.05 250);
		background: oklch(0.20 0.01 250 / 0.6);
	}

	.sort-bar-col.sort-active {
		color: oklch(0.72 0.15 240);
	}

	.sort-arrow {
		font-size: 0.625rem;
		line-height: 1;
	}

	/* Task column: flex-1, label on left, sort pills on right */
	.sort-bar-task {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		padding: 0 10px;
		gap: 6px;
	}

	.sort-bar-label {
		font-size: 0.5625rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: oklch(0.38 0.02 250);
		font-family: ui-monospace, monospace;
	}

	.sort-bar-pills {
		display: flex;
		align-items: center;
		gap: 3px;
		margin-left: auto;
	}

	.sort-pill {
		font-size: 0.5rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: oklch(0.42 0.02 250);
		background: oklch(0.20 0.01 250);
		border: 1px solid oklch(0.24 0.02 250);
		border-radius: 0.25rem;
		padding: 1px 5px;
		cursor: pointer;
		font-family: ui-monospace, monospace;
		transition: color 0.1s, background 0.1s, border-color 0.1s;
		line-height: 1.6;
	}

	.sort-pill:hover {
		color: oklch(0.70 0.05 250);
		background: oklch(0.24 0.02 250);
	}

	.sort-pill.sort-active {
		color: oklch(0.72 0.15 240);
		background: oklch(0.72 0.15 240 / 0.12);
		border-color: oklch(0.72 0.15 240 / 0.3);
	}

	/* Due date col — 56px to match .mobile-task-duedate */
	.sort-bar-due {
		width: 56px;
		flex-shrink: 0;
		border-left: 1px solid oklch(0.20 0.01 250);
	}

	/* Checkbox column: hidden on mobile unless long-press selection active */
	.card-checkbox-col {
		display: none;
		align-items: center;
		justify-content: center;
		width: 40px;
		flex-shrink: 0;
		border-right: 1px solid oklch(0.22 0.02 250);
	}
	.card-checkbox-col-active {
		display: flex;
	}
	@media (min-width: 640px) {
		.card-checkbox-col {
			display: flex;
		}
	}

	.mobile-task-selected {
		background: oklch(0.70 0.18 240 / 0.08);
		border-left: 3px solid oklch(0.70 0.18 240 / 0.6);
	}
	.card-checkbox {
		width: 14px;
		height: 14px;
		cursor: pointer;
		accent-color: oklch(0.65 0.18 240);
	}

	/* Due date column: always visible */
	.mobile-task-duedate {
		width: 56px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-left: 1px solid oklch(0.22 0.02 250);
		border-top: none;
		border-right: none;
		border-bottom: none;
		background: transparent;
		cursor: pointer;
		font-size: 0.5625rem;
		font-family: ui-monospace, monospace;
		gap: 2px;
		padding: 0 4px;
		line-height: 1.3;
		text-align: center;
	}
	.mobile-task-duedate:hover {
		background: oklch(0.22 0.02 250 / 0.5);
	}
	.mobile-duedate-time {
		color: oklch(0.50 0.02 250);
		font-size: 0.5rem;
	}
	.mobile-duedate-empty {
		color: oklch(0.35 0.02 250);
		font-size: 1.1rem;
		line-height: 1;
	}

	/* Pull-to-refresh indicator */
	.ptr-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		color: oklch(0.55 0.12 220);
		transition: height 0.15s ease, opacity 0.15s ease;
	}
	@keyframes ptr-spin {
		to { transform: rotate(360deg); }
	}
	.ptr-spinner {
		animation: ptr-spin 0.7s linear infinite;
	}
</style>
