<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getProjectColor, fetchAndGetProjectColors } from '$lib/utils/projectColors';
	import TaskDetailDrawer from '$lib/components/TaskDetailDrawer.svelte';
	import TaskIdBadge from '$lib/components/TaskIdBadge.svelte';
	import SearchDropdown from '$lib/components/SearchDropdown.svelte';
	import type { SearchDropdownGroup } from '$lib/components/SearchDropdown.svelte';
	import { openProjectDrawer } from '$lib/stores/drawerStore';
	import { saveColumnSettings as saveColumnSettingsUtil, loadColumnSettings as loadColumnSettingsUtil } from '$lib/utils/columnStorage';
	import { toggleSort as toggleSortUtil } from '$lib/utils/tableSort';
	import ManageColumnsDropdown from '$lib/components/ManageColumnsDropdown.svelte';
	import { columnResize } from '$lib/actions/columnResize';
	import { fade } from 'svelte/transition';
	import { bulkApiOperation, fetchWithTimeout, createDeleteRequest, handleApiError, formatBulkResultMessage } from '$lib/utils/bulkApiHelpers';
	import { addToast } from '$lib/stores/toasts.svelte';
	import { AGENT_PRESETS } from '$lib/types/agentProgram';
	import ProviderLogo from '$lib/components/agents/ProviderLogo.svelte';
	import { spawnInBatches, type SpawnResult } from '$lib/utils/spawnBatch';

	interface Task {
		id: string;
		title: string;
		description: string;
		status: string;
		priority: number;
		issue_type: string;
		project: string;
		assignee?: string;
		labels: string[];
		due_date?: string | null;
		created_ts?: string;
		updated_at?: string;
		depends_on?: Array<{ id: string; title: string; status: string; priority: number }>;
		blocked_by?: Array<{ id: string; title: string; status: string; priority: number }>;
	}

	// Column definition
	interface ColDef {
		id: string;
		label: string;
		defaultWidth: number;
		minWidth: number;
		sortable: boolean;
		sortField?: string;
	}

	const ALL_COLUMNS: ColDef[] = [
		{ id: 'project', label: 'Project', defaultWidth: 100, minWidth: 60, sortable: true, sortField: 'project' },
		{ id: 'priority', label: 'Priority', defaultWidth: 64, minWidth: 50, sortable: true, sortField: 'priority' },
		{ id: 'type', label: 'Type', defaultWidth: 40, minWidth: 36, sortable: true, sortField: 'type' },
		{ id: 'id', label: 'ID', defaultWidth: 110, minWidth: 70, sortable: true, sortField: 'title' },
		{ id: 'title', label: 'Title', defaultWidth: 0, minWidth: 200, sortable: true, sortField: 'title' },
		{ id: 'due_date', label: 'Due', defaultWidth: 100, minWidth: 70, sortable: true, sortField: 'due_date' },
		{ id: 'labels', label: 'Labels', defaultWidth: 160, minWidth: 80, sortable: false },
		{ id: 'assignee', label: 'Assignee', defaultWidth: 100, minWidth: 60, sortable: false },
		{ id: 'actions', label: 'Actions', defaultWidth: 72, minWidth: 50, sortable: false },
	];

	// Data state
	let tasks = $state<Task[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let pollInterval: ReturnType<typeof setInterval> | null = null;

	// Filter state
	let selectedProject = $state('all');
	let selectedType = $state('all');
	let searchQuery = $state('');
	let projects = $state<string[]>([]);

	const projectDropdownGroups = $derived.by<SearchDropdownGroup[]>(() => [{
		label: 'Projects',
		options: [
			{ value: 'all', label: 'All Projects' },
			...projects.map(p => ({ value: p, label: p }))
		]
	}]);

	const typeDropdownGroups = $derived.by<SearchDropdownGroup[]>(() => [{
		label: 'Types',
		options: [
			{ value: 'all', label: 'All Types' },
			...taskTypes.map(t => ({ value: t, label: `${typeIcon(t)} ${t}` }))
		]
	}]);

	// Sort state
	let sortField = $state<string>('priority');
	let sortDir = $state<'asc' | 'desc'>('asc');

	// Inline editing state
	let editingCell = $state<{ taskId: string; field: string } | null>(null);
	let saving = $state<string | null>(null);

	// Due date picker state
	let dueDatePickerTaskId = $state<string | null>(null);
	let dueDatePickerPos = $state<{ x: number; y: number; anchorBottom: number; anchorTop: number } | null>(null);
	let dueDatePickerEl = $state<HTMLElement | null>(null);
	let dueDateTempValue = $state('');
	let dueDateTempTime = $state('');
	let dueDateSaving = $state(false);

	// Reposition picker after it renders using its actual height
	$effect(() => {
		if (!dueDatePickerEl || !dueDatePickerPos) return;
		const { anchorBottom, anchorTop, x } = dueDatePickerPos;
		const pickerHeight = dueDatePickerEl.offsetHeight;
		const spaceBelow = window.innerHeight - anchorBottom;
		let y = spaceBelow >= pickerHeight + 8
			? anchorBottom + 4
			: Math.max(8, anchorTop - pickerHeight - 4);
		if (dueDatePickerPos.y !== y) dueDatePickerPos = { ...dueDatePickerPos, y };
	});

	// Drawer state
	let drawerOpen = $state(false);
	let drawerTaskId = $state<string | null>(null);
	let drawerMode = $state<'view' | 'edit'>('view');

	// Context menu state
	interface Epic { id: string; title: string; status: string; priority: number; }
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

	// Column state
	let columnOrder = $state<string[]>(ALL_COLUMNS.map(c => c.id));
	let columnWidths = $state<Record<string, number>>({});
	let hiddenColumns = $state<Set<string>>(new Set());

	// Column resize state (guide line only — actual resize logic is in the columnResize action)
	let resizeGuideX = $state<number | null>(null);
	let tableContainerEl: HTMLElement | undefined = $state();

	// Bulk selection
	let selectedTasks = $state<Set<string>>(new Set());
	let lastClickedTaskId = $state<string | null>(null);
	let bulkActionLoading = $state(false);
	let bulkActionError = $state('');
	let spawnProgress = $state('');
	let priorityDropdownOpen = $state(false);
	let harnessDropdownOpen = $state(false);

	// Column drag-reorder state
	let colDraggedIndex = $state<number | null>(null);
	let colDragOverIndex = $state<number | null>(null);

	// Load persisted column settings
	function loadColumnSettings() {
		if (!browser) return;
		const saved = loadColumnSettingsUtil('jat-open-tasks-columns', ALL_COLUMNS.map(c => c.id));
		if (!saved) return;
		columnOrder = saved.order;
		columnWidths = saved.widths;
		hiddenColumns = new Set(saved.hidden);
		if (saved.sortField) sortField = saved.sortField;
		if (saved.sortDir) sortDir = saved.sortDir;
	}

	function saveColumnSettings() {
		if (!browser) return;
		saveColumnSettingsUtil('jat-open-tasks-columns', {
			order: columnOrder,
			widths: columnWidths,
			hidden: [...hiddenColumns],
			sortField,
			sortDir,
		});
	}

	// Visible columns in order
	const visibleColumns = $derived.by(() => {
		return columnOrder
			.filter(id => !hiddenColumns.has(id))
			.map(id => ALL_COLUMNS.find(c => c.id === id)!)
			.filter(Boolean);
	});

	function getColWidth(col: ColDef): number {
		return columnWidths[col.id] || col.defaultWidth;
	}

	function getColStyle(col: ColDef): string {
		const w = getColWidth(col);
		if (w === 0) return ''; // flex column (title)
		return `width: ${w}px; min-width: ${col.minWidth}px;`;
	}

	// --- Column drag reorder (header) ---
	function handleColDragStart(index: number, e: DragEvent) {
		colDraggedIndex = index;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', String(index));
		}
	}

	function handleColDragOver(index: number, e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
		colDragOverIndex = index;
	}

	function handleColDragEnd() {
		colDraggedIndex = null;
		colDragOverIndex = null;
	}

	function handleColDrop(index: number, e: DragEvent) {
		e.preventDefault();
		if (colDraggedIndex === null || colDraggedIndex === index) {
			handleColDragEnd();
			return;
		}
		// Map visible indices to columnOrder indices
		const visIds = visibleColumns.map(c => c.id);
		const draggedId = visIds[colDraggedIndex];
		const targetId = visIds[index];
		const newOrder = [...columnOrder];
		const fromIdx = newOrder.indexOf(draggedId);
		const toIdx = newOrder.indexOf(targetId);
		newOrder.splice(fromIdx, 1);
		newOrder.splice(toIdx, 0, draggedId);
		columnOrder = newOrder;
		handleColDragEnd();
		saveColumnSettings();
	}

	// --- Column visibility ---
	function toggleColumnVisibility(colId: string) {
		const newHidden = new Set(hiddenColumns);
		if (newHidden.has(colId)) {
			newHidden.delete(colId);
		} else {
			// Don't allow hiding all columns
			if (columnOrder.length - newHidden.size <= 1) return;
			newHidden.add(colId);
		}
		hiddenColumns = newHidden;
		saveColumnSettings();
	}

	// Derived: filtered + sorted tasks
	const filteredTasks = $derived.by(() => {
		let result = tasks;

		if (selectedProject !== 'all') {
			result = result.filter(t => t.project === selectedProject);
		}
		if (selectedType !== 'all') {
			result = result.filter(t => t.issue_type === selectedType);
		}
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			result = result.filter(t =>
				t.title.toLowerCase().includes(q) ||
				t.id.toLowerCase().includes(q) ||
				(t.description && t.description.toLowerCase().includes(q)) ||
				(t.labels && t.labels.some(l => l.toLowerCase().includes(q)))
			);
		}

		// Sort
		result = [...result].sort((a, b) => {
			let cmp = 0;
			switch (sortField) {
				case 'priority':
					cmp = a.priority - b.priority;
					break;
				case 'title':
					cmp = a.title.localeCompare(b.title);
					break;
				case 'project':
					cmp = (a.project || '').localeCompare(b.project || '');
					break;
				case 'type':
					cmp = (a.issue_type || '').localeCompare(b.issue_type || '');
					break;
				case 'due_date':
					const aDate = a.due_date || '9999';
					const bDate = b.due_date || '9999';
					cmp = aDate.localeCompare(bDate);
					break;
				case 'created':
					cmp = (a.created_ts || '').localeCompare(b.created_ts || '');
					break;
				default:
					cmp = a.priority - b.priority;
			}
			return sortDir === 'asc' ? cmp : -cmp;
		});

		return result;
	});

	// Unique types for filter
	const taskTypes = $derived.by(() => {
		const types = new Set(tasks.map(t => t.issue_type));
		return [...types].sort();
	});

	// Stats
	const stats = $derived.by(() => {
		const total = filteredTasks.length;
		const withDueDate = filteredTasks.filter(t => t.due_date).length;
		const overdue = filteredTasks.filter(t => {
			if (!t.due_date) return false;
			return new Date(t.due_date) < new Date(new Date().toISOString().split('T')[0]);
		}).length;
		const p0p1 = filteredTasks.filter(t => t.priority <= 1).length;
		return { total, withDueDate, overdue, p0p1 };
	});

	// Bulk selection derived
	const selectionCount = $derived(selectedTasks.size);
	const allVisibleSelected = $derived.by(() => {
		const visible = filteredTasks;
		return visible.length > 0 && visible.every(t => selectedTasks.has(t.id));
	});
	const someVisibleSelected = $derived.by(() => {
		return filteredTasks.some(t => selectedTasks.has(t.id)) && !allVisibleSelected;
	});

	async function fetchTasks() {
		try {
			const res = await fetch('/api/tasks?status=open');
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			tasks = (data.tasks || []).map((t: any) => ({
				...t,
				project: t.project || extractProject(t.id),
			}));
			// Extract unique projects from tasks
			const projectSet = new Set(tasks.map(t => t.project).filter(Boolean));
			// Also fetch all configured projects so Change Project submenu shows all options
			try {
				const projRes = await fetch('/api/projects?visible=true');
				if (projRes.ok) {
					const projData = await projRes.json();
					const configuredProjects: string[] = (projData.projects || []).map((p: any) => p.name || p.human_key || p.slug);
					for (const p of configuredProjects) if (p) projectSet.add(p);
				}
			} catch { /* ignore */ }
			projects = [...projectSet].sort();

			if (loading) {
				loading = false;
				// Fetch project colors
				fetchAndGetProjectColors(tasks);
			}
		} catch (e: any) {
			error = e.message;
			loading = false;
		}
	}

	function extractProject(id: string): string {
		const idx = id.lastIndexOf('-');
		return idx > 0 ? id.substring(0, idx) : id;
	}

	// Inline save
	async function saveField(taskId: string, field: string, value: any) {
		saving = taskId;
		try {
			const body: Record<string, any> = {};
			body[field] = value;
			const res = await fetch(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			// Update local state
			tasks = tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t);
		} catch (e: any) {
			console.error(`Failed to save ${field} for ${taskId}:`, e);
		} finally {
			saving = null;
			editingCell = null;
		}
	}

	function toggleSort(field: string) {
		const result = toggleSortUtil(sortField, sortDir, field);
		sortField = result.field;
		sortDir = result.dir;
		saveColumnSettings();
	}

	function openTaskDrawer(taskId: string) {
		drawerTaskId = taskId;
		drawerMode = 'view';
		drawerOpen = true;
	}

	function formatDueDate(date: string | null | undefined): string {
		if (!date) return '';
		try {
			// Parse date-only strings as local time (not UTC) by appending T00:00:00
			const d = new Date(date.includes('T') ? date : date + 'T00:00:00');
			if (isNaN(d.getTime())) return date;
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const target = new Date(d);
			target.setHours(0, 0, 0, 0);
			const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

			if (diffDays === 0) return 'Today';
			if (diffDays === 1) return 'Tomorrow';
			if (diffDays === -1) return 'Yesterday';
			if (diffDays < -1) return `${Math.abs(diffDays)}d overdue`;
			if (diffDays <= 7) return `${diffDays}d`;
			return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
		} catch {
			return date;
		}
	}

	function dueDateClass(date: string | null | undefined): string {
		if (!date) return '';
		try {
			const d = new Date(date.includes('T') ? date : date + 'T00:00:00');
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const target = new Date(d);
			target.setHours(0, 0, 0, 0);
			const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
			if (diffDays < 0) return 'overdue';
			if (diffDays <= 2) return 'due-soon';
			return 'due-normal';
		} catch {
			return '';
		}
	}

	function priorityLabel(p: number): string {
		switch (p) {
			case 0: return 'P0';
			case 1: return 'P1';
			case 2: return 'P2';
			case 3: return 'P3';
			case 4: return 'P4';
			default: return `P${p}`;
		}
	}

	function priorityColor(p: number): string {
		switch (p) {
			case 0: return 'oklch(0.70 0.20 25)';   // red
			case 1: return 'oklch(0.75 0.15 65)';   // orange
			case 2: return 'oklch(0.75 0.12 220)';  // blue
			case 3: return 'oklch(0.65 0.05 250)';  // gray
			case 4: return 'oklch(0.55 0.03 250)';  // dim gray
			default: return 'oklch(0.55 0.03 250)';
		}
	}

	function typeIcon(type: string): string {
		switch (type) {
			case 'bug': return '🐛';
			case 'feature': return '✨';
			case 'task': return '📋';
			case 'epic': return '🏔';
			case 'chore': return '🔄';
			default: return '📋';
		}
	}

	// Due date picker functions
	function openDueDatePicker(taskId: string, event: MouseEvent) {
		const task = tasks.find(t => t.id === taskId);
		if (!task) return;

		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const pickerWidth = 280;
		let x = rect.left;
		if (x + pickerWidth > window.innerWidth) x = window.innerWidth - pickerWidth - 8;
		if (x < 8) x = 8;

		// Store anchor coords; y will be finalized after the picker renders
		dueDatePickerTaskId = taskId;
		dueDatePickerPos = { x, y: rect.bottom + 4, anchorBottom: rect.bottom, anchorTop: rect.top };

		// Parse existing due date
		if (task.due_date) {
			const parts = task.due_date.split('T');
			dueDateTempValue = parts[0] || '';
			dueDateTempTime = parts[1]?.substring(0, 5) || '';
		} else {
			dueDateTempValue = '';
			dueDateTempTime = '';
		}
	}

	function closeDueDatePicker() {
		dueDatePickerTaskId = null;
		dueDatePickerPos = null;
		dueDatePickerEl = null;
		dueDateTempValue = '';
		dueDateTempTime = '';
	}

	function getQuickSetDays() {
		const days = [];
		const today = new Date();
		const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

		for (let i = 0; i < 7; i++) {
			const d = new Date(today);
			d.setDate(d.getDate() + i);
			const dateValue = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
			const dayNum = d.getDate();
			const label = i === 0 ? 'Today' : i === 1 ? 'Tmrw' : dayNames[d.getDay()];
			let badge = '';
			if (i === 0) badge = 'today';
			else if (i === 1) badge = 'tomorrow';

			days.push({ dateValue, dayNum, label, badge });
		}
		return days;
	}

	function quickSetDueDate(dateValue: string) {
		dueDateTempValue = dateValue;
	}

	async function saveDueDate() {
		if (!dueDatePickerTaskId || !dueDateTempValue) return;
		dueDateSaving = true;

		let value = dueDateTempValue;
		if (dueDateTempTime) {
			value = `${dueDateTempValue}T${dueDateTempTime}`;
		}

		await saveField(dueDatePickerTaskId, 'due_date', value);
		dueDateSaving = false;
		closeDueDatePicker();
	}

	async function clearDueDate() {
		if (!dueDatePickerTaskId) return;
		dueDateSaving = true;
		await saveField(dueDatePickerTaskId, 'due_date', null);
		dueDateSaving = false;
		closeDueDatePicker();
	}

	// --- Context menu ---
	function getProjectFromTaskId(taskId: string): string {
		const match = taskId.match(/^([a-zA-Z0-9_-]+?)-/);
		return match ? match[1].toLowerCase() : 'unknown';
	}

	function handleContextMenu(task: Task, event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		const menuWidth = 200;
		const menuHeight = 320;
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
	}

	// Close context menu on click outside or Escape
	$effect(() => {
		if (!ctxVisible) return;
		function handleClick() { closeContextMenu(); }
		function handleKeyDown(e: KeyboardEvent) { if (e.key === 'Escape') closeContextMenu(); }
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

	// Clean up stale selections when tasks change
	$effect(() => {
		const allIds = new Set(tasks.map(t => t.id));
		const stale = [...selectedTasks].filter(id => !allIds.has(id));
		if (stale.length > 0) {
			const next = new Set(selectedTasks);
			for (const id of stale) next.delete(id);
			selectedTasks = next;
		}
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

	async function ctxChangeStatus(taskId: string, newStatus: string) {
		closeContextMenu();
		try {
			const res = await fetch(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus }),
			});
			if (res.ok) {
				if (newStatus === 'closed') {
					tasks = tasks.filter(t => t.id !== taskId);
				} else {
					tasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
				}
			}
		} catch (err) { console.error('Failed to update status:', err); }
	}

	async function ctxChangePriority(taskId: string, newPriority: number) {
		closeContextMenu();
		tasks = tasks.map(t => t.id === taskId ? { ...t, priority: newPriority } : t);
		try {
			await fetch(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ priority: newPriority }),
			});
		} catch (err) { console.error('Failed to update priority:', err); }
	}

	async function ctxChangeProject(taskId: string, newProject: string) {
		closeContextMenu();
		try {
			const res = await fetch(`/api/tasks/${taskId}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ project: newProject }),
			});
			if (res.ok) {
				tasks = tasks.map(t => t.id === taskId ? { ...t, project: newProject } : t);
			}
		} catch (err) { console.error('Failed to change project:', err); }
	}

	async function ctxDuplicateTask(task: Task) {
		closeContextMenu();
		try {
			const res = await fetch('/api/tasks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: task.title,
					description: task.description || '',
					priority: task.priority,
					type: task.issue_type || 'task',
					project: task.project,
					labels: task.labels?.join(',') || '',
				}),
			});
			if (res.ok) fetchTasks();
		} catch (err) { console.error('Failed to duplicate task:', err); }
	}

	async function ctxDeleteTask(taskId: string) {
		closeContextMenu();
		if (!confirm(`Delete task ${taskId}? This cannot be undone.`)) return;
		try {
			const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
			if (res.ok) {
				tasks = tasks.filter(t => t.id !== taskId);
			}
		} catch (err) { console.error('Failed to delete task:', err); }
	}

	async function ctxSpawnTask(task: Task) {
		closeContextMenu();
		try {
			await fetch('/api/work/spawn', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ taskId: task.id, project: task.project }),
			});
		} catch (err) { console.error('Failed to spawn task:', err); }
	}

	async function fetchEpics(projectName: string) {
		if (!projectName) return;
		epicsLoading = true;
		try {
			const res = await fetch(`/api/epics?project=${projectName}`);
			if (res.ok) {
				const data = await res.json();
				epics = data.epics || [];
			}
		} catch (err) { console.error('Failed to fetch epics:', err); }
		finally { epicsLoading = false; }
	}

	async function ctxLinkToEpic(taskId: string, epicId: string) {
		closeContextMenu();
		try {
			const res = await fetch(`/api/tasks/${taskId}/epic`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ epicId }),
			});
			if (res.ok) fetchTasks();
		} catch (err) { console.error('Failed to link to epic:', err); }
	}

	async function ctxCreateEpic() {
		if (!ctxTask || creatingEpic || !newEpicTitle.trim()) return;
		creatingEpic = true;
		try {
			const project = getProjectFromTaskId(ctxTask.id);
			const res = await fetch('/api/epics', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: newEpicTitle.trim(),
					project,
					linkTaskId: ctxTask.id,
				}),
			});
			if (res.ok) {
				newEpicTitle = '';
				showCreateEpic = false;
				closeContextMenu();
				fetchTasks();
			}
		} catch (err) { console.error('Failed to create epic:', err); }
		finally { creatingEpic = false; }
	}

	// === Bulk Selection Functions ===
	function toggleTask(taskId: string, event?: MouseEvent) {
		const visible = filteredTasks;
		if (event?.shiftKey && lastClickedTaskId) {
			const ids = visible.map(t => t.id);
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
		const visible = filteredTasks.map(t => t.id);
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
	}

	// === Bulk Actions ===
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
			fetchTasks();
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
			fetchTasks();
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
			fetchTasks();
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
			fetchTasks();
		} catch (err) {
			bulkActionError = err instanceof Error ? err.message : String(err);
		} finally {
			bulkActionLoading = false;
		}
	}

	onMount(() => {
		if (browser) {
			loadColumnSettings();
			fetchTasks();
			pollInterval = setInterval(fetchTasks, 10000);
		}
	});

	onDestroy(() => {
		if (pollInterval) clearInterval(pollInterval);
	});
</script>

<svelte:head>
	<title>Open Tasks | JAT</title>
</svelte:head>

<div class="open-tasks-page">
	<!-- Header -->
	<div class="page-header">
		<h1 class="page-title">Open Tasks</h1>
		{#if !loading}
			<div class="stats-row">
				<span class="stat">{stats.total} tasks</span>
				{#if stats.p0p1 > 0}
					<span class="stat stat-urgent">{stats.p0p1} high priority</span>
				{/if}
				{#if stats.overdue > 0}
					<span class="stat stat-overdue">{stats.overdue} overdue</span>
				{/if}
				{#if stats.withDueDate > 0}
					<span class="stat">{stats.withDueDate} with due dates</span>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Filters -->
	<div class="filters-bar">
		<div class="filter-group">
			<input
				type="text"
				class="search-input"
				placeholder="Search tasks..."
				bind:value={searchQuery}
			/>
		</div>
		<div class="filter-group">
			<div class="project-dropdown-wrapper">
				<SearchDropdown
					value={selectedProject}
					groups={projectDropdownGroups}
					placeholder="All Projects"
					colorFn={(v) => v !== 'all' ? getProjectColor(v + '-x') : undefined}
					variant="chip"
					onChange={(v) => { selectedProject = v; }}
				>
					{#snippet footer()}
						<button class="sd-add-project" onclick={() => openProjectDrawer()}>
							<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
							</svg>
							<span>Add Project</span>
						</button>
					{/snippet}
				</SearchDropdown>
			</div>
			<SearchDropdown
				value={selectedType}
				groups={typeDropdownGroups}
				placeholder="All Types"
				onChange={(v) => { selectedType = v; }}
			/>
			<!-- Manage Columns -->
			<ManageColumnsDropdown
				{columnOrder}
				{hiddenColumns}
				getLabel={(id) => ALL_COLUMNS.find(c => c.id === id)?.label ?? id}
				onReorder={(newOrder) => { columnOrder = newOrder; saveColumnSettings(); }}
				onToggleVisibility={toggleColumnVisibility}
			/>
		</div>
	</div>

	<!-- Table -->
	{#if loading}
		<div class="loading-state">
			<div class="skeleton-table">
				{#each Array(8) as _, i}
					<div class="skeleton-row" style="animation-delay: {i * 50}ms">
						<div class="skeleton h-4 w-16 rounded"></div>
						<div class="skeleton h-4 w-8 rounded"></div>
						<div class="skeleton h-4 w-48 rounded"></div>
						<div class="skeleton h-4 w-20 rounded"></div>
						<div class="skeleton h-4 w-12 rounded"></div>
						<div class="skeleton h-4 w-16 rounded"></div>
					</div>
				{/each}
			</div>
		</div>
	{:else if error}
		<div class="error-state">
			<p>Failed to load tasks: {error}</p>
			<button class="btn btn-sm btn-primary" onclick={fetchTasks}>Retry</button>
		</div>
	{:else if filteredTasks.length === 0}
		<div class="empty-state">
			<p class="empty-title">No open tasks found</p>
			<p class="empty-desc">
				{#if searchQuery || selectedProject !== 'all' || selectedType !== 'all'}
					Try adjusting your filters.
				{:else}
					All tasks are complete! Time to celebrate.
				{/if}
			</p>
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
		<div class="table-container" bind:this={tableContainerEl}>
			{#if resizeGuideX !== null}
				<div class="resize-guide" style="left: {resizeGuideX}px;"></div>
			{/if}
			<table class="tasks-table" style="table-layout: fixed;" class:has-selection={selectionCount > 0}>
				<colgroup>
					<col style="width: 32px; min-width: 32px; max-width: 32px;" />
					{#each visibleColumns as col}
						{#if getColWidth(col) === 0}
							<col />
						{:else}
							<col style="width: {getColWidth(col)}px; min-width: {col.minWidth}px;" />
						{/if}
					{/each}
				</colgroup>
				<thead>
					<tr>
						<th class="th-checkbox">
							<input
								type="checkbox"
								class="bulk-checkbox select-all-checkbox"
								checked={allVisibleSelected}
								indeterminate={someVisibleSelected}
								onclick={(e) => { e.stopPropagation(); toggleAllVisible(); }}
							/>
						</th>
						{#each visibleColumns as col, i}
							<th
								class="th-cell"
								class:th-dragging={colDraggedIndex === i}
								class:th-drag-over={colDragOverIndex === i && colDraggedIndex !== null && colDraggedIndex !== i}
								draggable="true"
								ondragstart={(e) => handleColDragStart(i, e)}
								ondragover={(e) => handleColDragOver(i, e)}
								ondragend={handleColDragEnd}
								ondrop={(e) => handleColDrop(i, e)}
								onclick={() => { if (col.sortable && col.sortField) toggleSort(col.sortField); }}
								style={col.id === 'type' ? 'text-align: center;' : ''}
								use:columnResize={{
									disabled: col.id === 'actions',
									minWidth: col.minWidth,
									onResizeStart: () => { resizeGuideX = 0; },
									onResize: (w) => { columnWidths = { ...columnWidths, [col.id]: w }; },
									onResizeEnd: () => { resizeGuideX = null; saveColumnSettings(); },
									getGuideContainer: () => tableContainerEl ?? null,
								}}
							>
								<span class="th-label">
									{col.label}
									{#if col.sortable && col.sortField === sortField}
										{sortDir === 'asc' ? '↑' : '↓'}
									{/if}
								</span>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each filteredTasks as task (task.id)}
						{@const isSaving = saving === task.id}
						{@const isSelected = selectedTasks.has(task.id)}
						<tr
							class="task-row"
							class:saving={isSaving}
							class:selected-row={isSelected}
							oncontextmenu={(e) => handleContextMenu(task, e)}
						>
							<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
							<td class="td-checkbox" onclick={(e) => { e.stopPropagation(); toggleTask(task.id, e); }}>
								<input
									type="checkbox"
									class="bulk-checkbox"
									checked={isSelected}
									style="pointer-events: none;"
								/>
							</td>
							{#each visibleColumns as col}
								{#if col.id === 'project'}
									<td>
										<span
											class="project-badge"
											style="background: {getProjectColor(task.id)}20; color: {getProjectColor(task.id)}; border: 1px solid {getProjectColor(task.id)}40;"
										>
											{task.project}
										</span>
									</td>
								{:else if col.id === 'priority'}
									<td>
										{#if editingCell?.taskId === task.id && editingCell?.field === 'priority'}
											<select
												class="inline-edit-select"
												value={task.priority}
												onchange={(e) => saveField(task.id, 'priority', parseInt(e.currentTarget.value))}
												onblur={() => { editingCell = null; }}
												autofocus
											>
												{#each [0, 1, 2, 3, 4] as p}
													<option value={p}>{priorityLabel(p)}</option>
												{/each}
											</select>
										{:else}
											<!-- svelte-ignore a11y_no_static_element_interactions -->
											<span
												class="priority-badge"
												style="background: {priorityColor(task.priority)}20; color: {priorityColor(task.priority)}; border: 1px solid {priorityColor(task.priority)}40;"
												ondblclick={() => { editingCell = { taskId: task.id, field: 'priority' }; }}
												title="Double-click to edit"
											>
												{priorityLabel(task.priority)}
											</span>
										{/if}
									</td>
								{:else if col.id === 'type'}
									<td style="text-align: center;">
										<span class="type-badge" title={task.issue_type}>
											{typeIcon(task.issue_type)}
										</span>
									</td>
								{:else if col.id === 'id'}
									<td>
										<button
											class="task-id-btn"
											onclick={() => openTaskDrawer(task.id)}
											title="View details"
										>
											{task.id}
										</button>
									</td>
								{:else if col.id === 'title'}
									<td>
										<button
											class="task-title-btn"
											onclick={() => openTaskDrawer(task.id)}
											title={task.description || task.title}
										>
											<span class="task-title-text">{task.title}</span>
										</button>
									</td>
								{:else if col.id === 'due_date'}
									<td style="padding: 0;">
										<button
											class="due-date-cell {dueDateClass(task.due_date)}"
											onclick={(e) => openDueDatePicker(task.id, e)}
											title={task.due_date ? `Due: ${task.due_date}` : 'Click to set due date'}
										>
											{#if task.due_date}
												{formatDueDate(task.due_date)}
											{:else}
												<span class="no-date">—</span>
											{/if}
										</button>
									</td>
								{:else if col.id === 'labels'}
									<td>
										{#if task.labels && task.labels.length > 0}
											<div class="labels-list">
												{#each task.labels.slice(0, 3) as label}
													<span class="label-badge">{label}</span>
												{/each}
												{#if task.labels.length > 3}
													<span class="label-more">+{task.labels.length - 3}</span>
												{/if}
											</div>
										{/if}
									</td>
								{:else if col.id === 'assignee'}
									<td>
										<span class="assignee-text">{task.assignee || ''}</span>
									</td>
								{:else if col.id === 'actions'}
									<td>
										<div class="action-buttons">
											<button
												class="action-btn"
												onclick={() => openTaskDrawer(task.id)}
												title="View details"
											>
												<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
													<circle cx="12" cy="12" r="3"/>
												</svg>
											</button>
											<button
												class="action-btn"
												onclick={() => { drawerTaskId = task.id; drawerMode = 'edit'; drawerOpen = true; }}
												title="Edit task"
											>
												<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
													<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
													<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
												</svg>
											</button>
										</div>
									</td>
								{/if}
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Due Date Picker Popover -->
{#if dueDatePickerTaskId && dueDatePickerPos}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-40" role="button" tabindex="0" onclick={closeDueDatePicker} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeDueDatePicker(); } }}></div>
	<div
		class="due-date-picker fixed z-50"
		style="left: {dueDatePickerPos.x}px; top: {dueDatePickerPos.y}px;"
		bind:this={dueDatePickerEl}
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

<!-- Context Menu -->
{#if ctxTask}
	<div
		class="task-context-menu"
		class:task-context-menu-hidden={!ctxVisible}
		style="left: {ctxX}px; top: {ctxY}px;"
		role="menu"
		tabindex="0"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
	>
		<!-- Launch -->
		<button class="task-context-menu-item" onmouseenter={() => { statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }} onclick={() => { const t = ctxTask!; closeContextMenu(); ctxSpawnTask(t); }}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M12 2C12 2 8 6 8 12C8 15 9 17 10 18L10 21C10 21.5 10.5 22 11 22H13C13.5 22 14 21.5 14 21L14 18C15 17 16 15 16 12C16 6 12 2 12 2Z" />
				<circle cx="12" cy="10" r="2" />
			</svg>
			<span>Launch</span>
		</button>

		<!-- View Details -->
		<button class="task-context-menu-item" onmouseenter={() => { statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }} onclick={() => { const id = ctxTask!.id; closeContextMenu(); openTaskDrawer(id); }}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
				<circle cx="12" cy="12" r="3" />
			</svg>
			<span>View Details</span>
		</button>

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
							onclick={() => ctxChangeStatus(ctxTask!.id, status.value)}
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
							onclick={() => ctxChangePriority(ctxTask!.id, pri.value)}
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
			onmouseenter={() => { epicSubmenuOpen = true; statusSubmenuOpen = false; prioritySubmenuOpen = false; projectSubmenuOpen = false; if (ctxTask) fetchEpics(getProjectFromTaskId(ctxTask.id)); }}
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
						<div style="padding: 0.5rem 0.75rem; opacity: 0.5; font-size: 0.75rem;">No epics found</div>
					{:else}
						{#each epics as epic}
							<button class="task-context-menu-item" onclick={() => ctxLinkToEpic(ctxTask!.id, epic.id)}>
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
									onkeydown={(e) => { if (e.key === 'Enter' && newEpicTitle.trim()) { e.preventDefault(); ctxCreateEpic(); } else if (e.key === 'Escape') { showCreateEpic = false; newEpicTitle = ''; } }}
									placeholder="Epic title..."
									disabled={creatingEpic}
									autofocus
									class="task-epic-create-input"
								/>
								<button class="task-epic-create-btn" onclick={ctxCreateEpic} disabled={creatingEpic || !newEpicTitle.trim()}>
									{#if creatingEpic}...{:else}+{/if}
								</button>
							</div>
						{:else}
							<div class="task-context-menu-divider"></div>
							<button class="task-context-menu-item" onclick={() => { showCreateEpic = true; setTimeout(() => newEpicInput?.focus(), 50); }}>
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
					{#each projects as proj}
						<button
							class="task-context-menu-item {ctxTask!.project === proj ? 'task-context-menu-item-active' : ''}"
							onclick={() => ctxChangeProject(ctxTask!.id, proj)}
						>
							<span class="task-status-dot" style="background: {getProjectColor(proj + '-x')};"></span>
							<span>{proj}</span>
							{#if ctxTask!.project === proj}
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
		<button class="task-context-menu-item" onmouseenter={() => { statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }} onclick={() => ctxDuplicateTask(ctxTask!)}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
				<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
			</svg>
			<span>Duplicate</span>
		</button>

		<!-- Close Task -->
		<button class="task-context-menu-item task-context-menu-item-danger" onmouseenter={() => { statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }} onclick={() => ctxChangeStatus(ctxTask!.id, 'closed')}>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10" />
				<line x1="15" y1="9" x2="9" y2="15" />
				<line x1="9" y1="9" x2="15" y2="15" />
			</svg>
			<span>Close Task</span>
		</button>

		<!-- Delete Task -->
		<button class="task-context-menu-item task-context-menu-item-danger" onmouseenter={() => { statusSubmenuOpen = false; prioritySubmenuOpen = false; epicSubmenuOpen = false; projectSubmenuOpen = false; }} onclick={() => ctxDeleteTask(ctxTask!.id)}>
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

<!-- Floating Bulk Action Bar -->
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
		<button type="button" class="floating-btn floating-btn-clear" onclick={clearSelection} disabled={bulkActionLoading}>
			Clear
		</button>
		{#if bulkActionLoading}
			<div class="floating-spinner"></div>
		{/if}
	</div>
{/if}

<!-- Task Detail Drawer -->
<TaskDetailDrawer
	bind:taskId={drawerTaskId}
	bind:mode={drawerMode}
	bind:isOpen={drawerOpen}
/>

<style>
	.open-tasks-page {
		padding: 1rem 1.5rem;
		max-width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	/* Header */
	.page-header {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		margin-bottom: 0.75rem;
		flex-shrink: 0;
	}
	.page-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: oklch(0.90 0.02 250);
		margin: 0;
		white-space: nowrap;
	}
	.stats-row {
		display: flex;
		gap: 0.75rem;
		margin-left: auto;
	}
	.stat {
		font-size: 0.75rem;
		color: oklch(0.60 0.02 250);
		white-space: nowrap;
	}
	.stat-urgent {
		color: oklch(0.75 0.15 65);
	}
	.stat-overdue {
		color: oklch(0.70 0.20 25);
	}

	/* Filters */
	.filters-bar {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
		flex-shrink: 0;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
	}
	.filter-group {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}
	.search-input {
		padding: 0.25rem 0.5rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.8125rem;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.25 0.02 250);
		border-radius: 0.5rem;
		color: oklch(0.90 0.02 250);
		min-height: 2rem;
		outline: none;
		width: 240px;
		transition: border-color 0.15s;
	}
	.search-input:focus {
		border-color: oklch(0.55 0.12 220);
	}
	.search-input::placeholder {
		color: oklch(0.45 0.02 250);
	}
	.project-dropdown-wrapper {
		width: 160px;
	}
	.sd-add-project {
		width: 100%;
		padding: 0.375rem 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		background: transparent;
		border: none;
		cursor: pointer;
		font-size: 0.6875rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		color: oklch(0.65 0.12 145);
		transition: background 0.1s, color 0.1s;
	}
	.sd-add-project:hover {
		background: oklch(0.24 0.06 145 / 0.3);
		color: oklch(0.80 0.15 145);
	}


	/* Table container */
	.table-container {
		flex: 1;
		overflow: auto;
		border: 1px solid oklch(0.24 0.02 250);
		border-radius: 0.5rem;
		position: relative;
	}

	/* Resize guide line */
	.resize-guide {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 1px;
		border-left: 1px dashed oklch(0.65 0.15 200 / 0.6);
		pointer-events: none;
		z-index: 3;
	}

	/* Table */
	.tasks-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}
	.tasks-table thead {
		position: sticky;
		top: 0;
		z-index: 10;
	}
	.tasks-table th {
		padding: 0.5rem 0.75rem;
		text-align: left;
		font-weight: 600;
		font-size: 0.6875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(0.55 0.02 250);
		background: oklch(0.16 0.01 250);
		border-bottom: 1px solid oklch(0.24 0.02 250);
		cursor: pointer;
		user-select: none;
		white-space: nowrap;
		position: relative;
	}
	.tasks-table th:hover {
		color: oklch(0.75 0.08 220);
	}
	.th-cell {
		transition: background 0.1s;
	}
	.th-cell.th-dragging {
		opacity: 0.5;
	}
	.th-cell.th-drag-over {
		background: oklch(0.22 0.04 220);
		border-left: 2px solid oklch(0.60 0.15 220);
	}
	.th-label {
		pointer-events: none;
	}

	/* Column resize handle (action-injected, must use :global since div is created dynamically) */
	:global(.col-resize-handle) {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		width: 5px;
		cursor: col-resize;
		z-index: 2;
	}
	:global(.col-resize-handle:hover) {
		background: oklch(0.55 0.15 200);
	}

	.tasks-table td {
		padding: 0.4rem 0.75rem;
		border-bottom: 1px solid oklch(0.20 0.01 250);
		vertical-align: middle;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Row */
	.task-row {
		transition: background 0.1s;
	}
	.task-row:hover {
		background: oklch(0.18 0.01 250);
	}
	.task-row.saving {
		opacity: 0.7;
	}

	/* Project badge */
	.project-badge {
		display: inline-block;
		padding: 0.0625rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.6875rem;
		font-weight: 500;
		white-space: nowrap;
	}

	/* Priority badge */
	.priority-badge {
		display: inline-block;
		padding: 0.0625rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.6875rem;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.priority-badge:hover {
		filter: brightness(1.2);
	}

	/* Type badge */
	.type-badge {
		font-size: 0.875rem;
		cursor: default;
	}

	/* Task ID */
	.task-id-btn {
		background: none;
		border: none;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
		font-size: 0.6875rem;
		color: oklch(0.50 0.02 250);
		cursor: pointer;
		padding: 0;
		white-space: nowrap;
		transition: color 0.1s;
	}
	.task-id-btn:hover {
		color: oklch(0.75 0.10 220);
	}

	/* Title */
	.task-title-btn {
		background: none;
		border: none;
		color: inherit;
		font: inherit;
		cursor: pointer;
		text-align: left;
		padding: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
	}
	.task-title-btn:hover .task-title-text {
		color: oklch(0.80 0.10 220);
	}
	.task-title-text {
		color: oklch(0.85 0.02 250);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		transition: color 0.1s;
	}

	/* Due date cell */
	.due-date-cell {
		display: block;
		width: 100%;
		background: none;
		border: none;
		font: inherit;
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		white-space: nowrap;
		color: oklch(0.65 0.02 250);
		padding: 0.4rem 0.75rem;
		text-align: center;
		transition: background 0.1s, color 0.1s;
	}
	.due-date-cell:hover {
		color: oklch(0.80 0.08 220);
		background: oklch(0.22 0.02 250);
	}
	.due-date-cell.overdue {
		color: oklch(0.70 0.20 25);
		font-weight: 600;
	}
	.due-date-cell.due-soon {
		color: oklch(0.75 0.15 65);
		font-weight: 500;
	}
	.no-date {
		color: oklch(0.35 0.01 250);
	}

	/* Assignee */
	.assignee-text {
		font-size: 0.75rem;
		color: oklch(0.65 0.02 250);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Due Date Picker Popover */
	.due-date-picker {
		width: 280px;
		background: oklch(0.16 0.01 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		box-shadow: 0 8px 24px oklch(0 0 0 / 0.4), 0 2px 8px oklch(0 0 0 / 0.2);
		overflow: hidden;
	}
	.due-date-picker-header {
		padding: 0.5rem 0.75rem;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: oklch(0.55 0.02 250);
		border-bottom: 1px solid oklch(0.22 0.02 250);
	}

	/* Quick set days */
	.due-date-quick-set {
		padding: 0.5rem 0.5rem 0.25rem;
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
		gap: 0.0625rem;
		padding: 0.25rem 0.125rem;
		border: 1px solid oklch(0.26 0.02 250);
		border-radius: 0.375rem;
		background: oklch(0.18 0.01 250);
		color: oklch(0.75 0.02 250);
		cursor: pointer;
		transition: all 0.1s;
		font-size: 0.6875rem;
	}
	.quick-day-btn:hover {
		border-color: oklch(0.45 0.10 220);
		background: oklch(0.22 0.02 250);
	}
	.quick-day-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.quick-day-selected {
		border-color: oklch(0.60 0.15 220);
		background: oklch(0.25 0.05 220);
		color: oklch(0.85 0.10 220);
	}
	.quick-day-name {
		font-size: 0.5625rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: oklch(0.55 0.02 250);
	}
	.quick-day-selected .quick-day-name {
		color: oklch(0.70 0.08 220);
	}
	.quick-day-num {
		font-size: 0.8125rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
	.quick-day-labels {
		display: flex;
		gap: 0.25rem;
		margin-top: 0.125rem;
	}
	.quick-day-label-slot {
		flex: 1;
		text-align: center;
		min-height: 0.875rem;
	}
	.quick-day-badge {
		font-size: 0.5rem;
		color: oklch(0.55 0.08 220);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	/* Date/time inputs */
	.due-date-picker-body {
		padding: 0.5rem 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.due-date-input,
	.due-date-time-input {
		width: 100%;
		padding: 0.375rem 0.5rem;
		font-size: 0.8125rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.25rem;
		color: oklch(0.90 0.02 250);
		outline: none;
		box-sizing: border-box;
	}
	.due-date-input:focus,
	.due-date-time-input:focus {
		border-color: oklch(0.55 0.12 220);
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
		font-size: 0.6875rem;
		color: oklch(0.55 0.02 250);
		white-space: nowrap;
		flex-shrink: 0;
	}
	.due-date-time-input {
		flex: 1;
	}

	/* Footer */
	.due-date-picker-footer {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.75rem;
		border-top: 1px solid oklch(0.22 0.02 250);
	}
	.due-date-btn {
		padding: 0.25rem 0.625rem;
		font-size: 0.75rem;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: all 0.1s;
		border: 1px solid transparent;
	}
	.due-date-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.due-date-btn-clear {
		background: none;
		color: oklch(0.70 0.15 25);
		border-color: oklch(0.70 0.15 25 / 0.3);
	}
	.due-date-btn-clear:hover:not(:disabled) {
		background: oklch(0.70 0.15 25 / 0.1);
	}
	.due-date-btn-cancel {
		background: none;
		color: oklch(0.65 0.02 250);
	}
	.due-date-btn-cancel:hover:not(:disabled) {
		background: oklch(0.22 0.02 250);
	}
	.due-date-btn-save {
		background: oklch(0.55 0.12 220);
		color: oklch(0.95 0.01 250);
		font-weight: 500;
	}
	.due-date-btn-save:hover:not(:disabled) {
		background: oklch(0.60 0.14 220);
	}

	/* Labels */
	.labels-list {
		display: flex;
		gap: 0.25rem;
		flex-wrap: wrap;
	}
	.label-badge {
		display: inline-block;
		padding: 0 0.3rem;
		border-radius: 0.1875rem;
		font-size: 0.625rem;
		background: oklch(0.25 0.02 250);
		color: oklch(0.70 0.02 250);
		white-space: nowrap;
	}
	.label-more {
		font-size: 0.625rem;
		color: oklch(0.50 0.02 250);
	}

	/* Inline editing */
	.inline-edit-select {
		padding: 0.125rem 0.25rem;
		font-size: 0.75rem;
		background: oklch(0.14 0.01 250);
		border: 1px solid oklch(0.50 0.10 200);
		border-radius: 0.1875rem;
		color: oklch(0.90 0.02 250);
		outline: none;
	}
	.inline-edit-select:focus {
		border-color: oklch(0.60 0.15 220);
	}

	/* Actions */
	.action-buttons {
		display: flex;
		gap: 0.25rem;
		opacity: 0;
		transition: opacity 0.1s;
	}
	.task-row:hover .action-buttons {
		opacity: 1;
	}
	.action-btn {
		background: none;
		border: 1px solid transparent;
		color: oklch(0.55 0.02 250);
		cursor: pointer;
		padding: 0.2rem;
		border-radius: 0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.1s;
	}
	.action-btn:hover {
		color: oklch(0.80 0.10 220);
		background: oklch(0.22 0.02 250);
		border-color: oklch(0.30 0.03 250);
	}

	/* States */
	.loading-state {
		padding: 2rem;
	}
	.skeleton-table {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.skeleton-row {
		display: flex;
		gap: 1rem;
		animation: fade-in 0.3s ease-out both;
	}
	.skeleton {
		background: oklch(0.22 0.02 250);
		animation: skeleton-pulse 2s ease-in-out infinite;
	}

	.error-state {
		padding: 2rem;
		text-align: center;
		color: oklch(0.70 0.20 25);
	}
	.empty-state {
		padding: 3rem;
		text-align: center;
	}
	.empty-title {
		font-size: 1rem;
		font-weight: 500;
		color: oklch(0.65 0.02 250);
		margin-bottom: 0.25rem;
	}
	.empty-desc {
		font-size: 0.8125rem;
		color: oklch(0.45 0.02 250);
	}

	/* Context Menu */
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
		border-radius: 0.375rem;
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
	.task-context-menu-chevron {
		width: 12px !important;
		height: 12px !important;
		margin-left: auto;
		color: oklch(0.50 0.02 250) !important;
	}
	.task-status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	.task-context-menu-item-active {
		color: oklch(0.85 0.02 250);
	}
	.task-context-menu-check {
		width: 14px !important;
		height: 14px !important;
		margin-left: auto;
		color: oklch(0.70 0.15 145) !important;
	}
	.task-context-menu-loading {
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		color: oklch(0.55 0.02 250);
	}
	.task-epic-id {
		font-size: 0.6875rem;
		font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
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

	/* === Bulk Selection === */
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
	.bulk-checkbox {
		width: 14px;
		height: 14px;
		cursor: pointer;
		accent-color: oklch(0.70 0.18 240);
		opacity: 0;
		transition: opacity 0.15s;
	}
	.task-row:hover .bulk-checkbox,
	.bulk-checkbox:checked,
	.has-selection .bulk-checkbox {
		opacity: 1;
	}
	.select-all-checkbox {
		opacity: 0;
		transition: opacity 0.15s;
	}
	.has-selection .select-all-checkbox,
	.tasks-table thead:hover .select-all-checkbox {
		opacity: 1;
	}
	.selected-row {
		background: oklch(0.70 0.18 240 / 0.08) !important;
	}
	.selected-row:hover {
		background: oklch(0.70 0.18 240 / 0.12) !important;
	}
	.bulk-error {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: oklch(0.55 0.15 30 / 0.12);
		border-bottom: 1px solid oklch(0.55 0.15 30 / 0.25);
		color: oklch(0.75 0.15 30);
		font-size: 0.8125rem;
		flex-shrink: 0;
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
	.floating-action-bar {
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
	.floating-count {
		font-size: 0.8125rem;
		font-weight: 600;
		color: oklch(0.85 0.02 250);
		white-space: nowrap;
	}
	.floating-divider {
		width: 1px;
		height: 1.25rem;
		background: oklch(0.30 0.02 250);
	}
	.floating-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.625rem;
		border: 1px solid transparent;
		border-radius: 0.375rem;
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
	}
	.floating-btn:disabled {
		opacity: 0.5;
		pointer-events: none;
	}
	.floating-btn-spawn {
		background: oklch(0.65 0.18 250 / 0.15);
		color: oklch(0.82 0.14 250);
		border-color: oklch(0.65 0.18 250 / 0.3);
	}
	.floating-btn-spawn:hover {
		background: oklch(0.65 0.18 250 / 0.25);
	}
	.floating-btn-close {
		background: oklch(0.75 0.15 85 / 0.12);
		color: oklch(0.80 0.12 85);
		border-color: oklch(0.75 0.15 85 / 0.25);
	}
	.floating-btn-close:hover {
		background: oklch(0.75 0.15 85 / 0.22);
	}
	.floating-btn-delete {
		background: oklch(0.55 0.18 30 / 0.15);
		color: oklch(0.80 0.15 30);
		border-color: oklch(0.55 0.18 30 / 0.3);
	}
	.floating-btn-delete:hover {
		background: oklch(0.55 0.18 30 / 0.25);
	}
	.floating-btn-clear {
		background: transparent;
		color: oklch(0.65 0.02 250);
	}
	.floating-btn-clear:hover {
		background: oklch(0.25 0.02 250);
		color: oklch(0.80 0.02 250);
	}
	.floating-btn-priority {
		background: oklch(0.55 0.15 200 / 0.15);
		color: oklch(0.80 0.12 200);
		border-color: oklch(0.55 0.15 200 / 0.3);
	}
	.floating-btn-priority:hover {
		background: oklch(0.55 0.15 200 / 0.25);
	}
	.floating-btn-harness {
		background: oklch(0.55 0.15 300 / 0.15);
		color: oklch(0.80 0.12 300);
		border-color: oklch(0.55 0.15 300 / 0.3);
	}
	.floating-btn-harness:hover {
		background: oklch(0.55 0.15 300 / 0.25);
	}
	.floating-spinner {
		width: 14px;
		height: 14px;
		border: 2px solid oklch(0.35 0.02 250);
		border-top-color: oklch(0.70 0.15 240);
		border-radius: 50%;
		animation: floating-spin 0.6s linear infinite;
	}
	@keyframes floating-spin {
		to { transform: rotate(360deg); }
	}
	.floating-dropdown-wrapper {
		position: relative;
	}
	.floating-dropdown {
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
	.floating-dropdown-item {
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
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background 0.1s;
		white-space: nowrap;
	}
	.floating-dropdown-item:hover {
		background: oklch(0.25 0.02 250);
	}
	.floating-priority-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}
</style>
