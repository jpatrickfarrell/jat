<script lang="ts">
	import { onMount, tick, untrack } from "svelte";
	import { fly, slide } from "svelte/transition";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";
	import { browser } from "$app/environment";
	import {
		getPriorityBadge,
		getTaskStatusBadge,
		getTypeBadge,
	} from "$lib/utils/badgeHelpers";
	import { formatRelativeTime } from "$lib/utils/dateFormatters";
	import { getProjectFromTaskId } from "$lib/utils/projectUtils";
	import { createListNav, type ListNavController } from "$lib/actions/listNav";
	import InboxDetail from "$lib/components/inbox/InboxDetail.svelte";
	import KeyboardShortcutsOverlay from "$lib/components/KeyboardShortcutsOverlay.svelte";
	import BulkActionBar from "$lib/components/BulkActionBar.svelte";
	import { addToast } from "$lib/stores/toasts.svelte";
	import { setSubmittedTasksCount } from "$lib/stores/drawerStore";
	import type { TaskActor } from "$lib/types/api.types";
	import { resolveRoutingTarget, isUuid } from "$lib/utils/taskRouting";

	// Mirrors KeyboardShortcutsOverlay's ShortcutSection — kept local to avoid
	// cross-component type imports from a .svelte module.
	interface ShortcutSection {
		title: string;
		shortcuts: { key: string; description: string }[];
	}

	interface Task {
		id: string;
		// Postgres UUID, present on graduated/postgres-backed projects.
		// Needed for operations whose backend columns are UUIDs
		// (e.g. milestone_tasks.task_id on /api/clients linkTask).
		db_id?: string | null;
		title: string;
		description?: string;
		status: string;
		priority: number;
		issue_type?: string;
		assignee?: string | null;
		assignee_id?: string | null;
		requester?: TaskActor | null;
		requester_id?: string | null;
		approver?: TaskActor | null;
		approver_id?: string | null;
		creator?: TaskActor | null;
		creator_id?: string | null;
		labels?: string[];
		project?: string;
		created_at?: string;
		updated_at?: string;
		blocked_by?: { id: string; title?: string; status?: string; issue_type?: string }[];
	}

	type FocusZone = "list" | "detail" | "compose";

	const FETCH_STATUSES = [
		"submitted",
		"open",
		"in_progress",
		"waiting",
	] as const;
	const STATUS_OPTIONS = FETCH_STATUSES;
	const PRIORITY_OPTIONS = [0, 1, 2, 3, 4] as const;
	const TYPE_OPTIONS = [
		"bug",
		"feature",
		"task",
		"epic",
		"chore",
		"chat",
	] as const;
	const DEFAULT_STATUSES = new Set<string>(["submitted", "open"]);

	const STATUS_DISPLAY: Record<string, string> = { in_progress: "in progress" };
	function displayStatus(s: string): string { return STATUS_DISPLAY[s] ?? s; }

	const STATUS_DESCRIPTIONS: Record<string, string> = {
		submitted: "needs routing",
		open: "ready to work",
		in_progress: "agents working",
		waiting: "pending reply",
	};

	let tasks = $state<Task[]>([]);
	let selectedIdx = $state(0);
	let panelOpen = $state(false);

	// Bulk selection
	let selectedTaskIds = $state<Set<string>>(new Set());
	let bulkEpicOpen = $state(false);
	let bulkWorking = $state(false);
	let epics = $state<Task[]>([]);
	let focusZone = $state<FocusZone>("list");

	let loading = $state(true);
	let error = $state<string | null>(null);

	// Resizable divider between list and detail panels.
	const SPLIT_STORAGE_KEY = "jat-inbox-split-percent";
	const FILTER_STORAGE_KEY = "jat-inbox-filters";
	const DEFAULT_SPLIT = 38;
	const MIN_SPLIT = 22;
	const MAX_SPLIT = 72;
	let splitPercent = $state<number>(DEFAULT_SPLIT);
	let isResizing = $state(false);
	let layoutEl: HTMLDivElement | null = $state(null);

	// Task ID that should briefly flash green in the list after a successful route.
	// Send+route errors surface inside the compose box so the user sees them
	// right where they acted — no page-level banner needed.
	let flashTaskId = $state<string | null>(null);
	let flashTimer: ReturnType<typeof setTimeout> | null = null;

	let undoTask = $state<Task | null>(null);
	let undoTimer: ReturnType<typeof setTimeout> | null = null;
	const UNDO_MS = 4000;

	// Filter + sort state — hydrated from URL on mount.
	// Using sorted string arrays instead of Sets because Svelte 5.41 does not
	// track SvelteSet/Set method calls (.has, .size) from $derived.by across
	// mutations. Plain arrays with $state work reliably.
	let filterStatuses = $state<string[]>([...DEFAULT_STATUSES]);
	let filterPriorities = $state<number[]>([]);
	let filterProject = $state<string>("");
	type SortBy = "priority" | "age" | "updated" | "status" | "type";
	type SortDir = "asc" | "desc";
	// Default direction per sort type — clicking a NEW sort chip resets to this;
	// clicking the CURRENT sort chip toggles direction.
	const DEFAULT_SORT_DIR: Record<SortBy, SortDir> = {
		priority: "asc", // P0 first
		age: "asc", // oldest (been waiting longest) first
		updated: "desc", // most recently updated first
		status: "asc", // submitted → open → in_progress → waiting
		type: "asc",   // alphabetical: bug → chat → chore → epic → feature → task
	};
	let sortBy = $state<SortBy>("priority");
	let sortDir = $state<SortDir>(DEFAULT_SORT_DIR.priority);
	let filterTypes = $state<string[]>([]);
	let filterAssignee = $state<string>("");
	let filterSearch = $state<string>("");
	let filterMilestones = $state<string[]>([]);
	let hydrated = $state(false);

	// Milestones are Supabase-backed and project-scoped. We load them on-demand
	// whenever the active project context changes, so the filter chip group can
	// reflect real milestones (not just IDs typed into the URL).
	interface MilestoneOption {
		id: string;
		name: string;
		status?: string;
		sort_order?: number;
		project?: string;
		// `id` on a linked task is the Supabase UUID; `jat_id` is the
		// human-readable form (e.g. "meadow-vmem4") that matches Task.id in
		// this view. For SQLite-backed projects the two are the same, so we
		// accept either when filtering.
		linked_tasks?: { id: string; jat_id?: string | null }[];
	}
	let milestoneList = $state<MilestoneOption[]>([]);
	let milestoneLoadedProject = $state<string>("__uninitialized__");
	let milestonesLoading = $state(false);
	// In-flight promise cache so concurrent effect runs coalesce to one fetch.
	// Without this, a second call would early-return (because
	// milestoneLoadedProject already matches) while milestoneList was still
	// empty — and the follow-up prune would wipe valid URL-hydrated selections.
	let milestoneLoadPromise: Promise<void> | null = null;

	let currentUser = $state<string>("");
	let currentUserEmail = $state<string>("");

	let filterInputEl = $state<HTMLInputElement | null>(null);
	let listEl = $state<HTMLUListElement | null>(null);
	let detailRef = $state<{
		focusCompose: () => void;
		openAssign: () => void;
		openStatus: () => void;
		openPriority: () => void;
		openType: () => void;
		openEpic: () => void;
		openMilestone: () => void;
		spawnAgent: () => void;
		openFullDrawer: () => void;
		dismissTask: () => void;
	} | null>(null);

	// Assignee list for the action bar's assign picker — unique human-ish names
	// pulled from the current task list. Requesters are included separately on
	// the task prop so "route to requester" is always available.
	const allAssignees = $derived.by<string[]>(() => {
		const set = new Set<string>();
		for (const t of tasks) {
			if (t.assignee) set.add(t.assignee);
			const handle = t.requester?.email || t.requester?.agent;
			if (handle) set.add(handle);
		}
		return [...set].sort();
	});

	// All projects detected from current task list — populates the project dropdown.
	const projectOptions = $derived.by<string[]>(() => {
		const set = new Set<string>();
		for (const t of tasks) {
			const p = t.project || getProjectFromTaskId(t.id);
			if (p) set.add(p);
		}
		return [...set].sort();
	});

	const filteredTasks = $derived.by<Task[]>(() => {
		// IMPORTANT: snapshot every reactive dependency at the top level of
		// the derivation. Svelte 5's runes mode does NOT reliably track $state
		// reads that only occur inside nested callbacks (e.g. inside a
		// `tasks.filter((t) => { ... filterStatuses.includes(t.status) ... })`).
		// Without these top-level reads, the derivation establishes deps only
		// on `tasks` and `currentUser`, and silently stops re-running when the
		// filter arrays or sortBy change — even though the URL-sync $effect
		// and template-level `{@const}` expressions (which ARE top-level reads)
		// continue to fire. This is the root cause of "chip toggles but list
		// doesn't filter" on this page.
		const _tasks = tasks;
		const _statuses = filterStatuses;
		const _priorities = filterPriorities;
		const _types = filterTypes;
		const _project = filterProject;
		const _assignee = filterAssignee;
		const _search = filterSearch;
		const _milestones = filterMilestones;
		const _milestoneList = milestoneList;
		const _sort = sortBy;
		const _dir = sortDir;
		const _user = currentUser;

		// Build the set of task IDs belonging to any selected milestone. Empty set
		// means "no milestone filter" (match all). We walk linked_tasks rather than
		// expecting a milestone_id on each task because that's where the data lives
		// in the /api/clients response. We collect BOTH `jat_id` (matches Task.id
		// for postgres-backed projects) and `id` (Supabase UUID, and also the
		// task id itself for sqlite-backed projects where jat_id is absent).
		let milestoneTaskIds: Set<string> | null = null;
		if (_milestones.length > 0) {
			milestoneTaskIds = new Set<string>();
			const selected = new Set(_milestones);
			for (const m of _milestoneList) {
				if (!selected.has(m.id)) continue;
				for (const t of m.linked_tasks ?? []) {
					if (t?.jat_id) milestoneTaskIds.add(t.jat_id);
					if (t?.id) milestoneTaskIds.add(t.id);
				}
			}
		}

		const meName = _user.toLowerCase();
		const search = _search.trim().toLowerCase();
		const assigneeRaw = _assignee.trim().toLowerCase();
		const assigneeMatch =
			assigneeRaw === "@me" && meName ? meName : assigneeRaw;

		const filtered = _tasks.filter((t) => {
			if (_statuses.length > 0 && !_statuses.includes(t.status)) {
				return false;
			}
			if (
				_priorities.length > 0 &&
				!_priorities.includes(t.priority ?? -1)
			) {
				return false;
			}
			if (_project) {
				const p = t.project || getProjectFromTaskId(t.id) || "";
				if (p !== _project) return false;
			}
			if (_types.length > 0 && !_types.includes(t.issue_type ?? "task")) {
				return false;
			}
			if (assigneeMatch) {
				const a = (t.assignee ?? "").toLowerCase();
				if (!a || !a.includes(assigneeMatch)) return false;
			}
			if (search) {
				const haystack = `${t.title ?? ""} ${
					t.description ?? ""
				}`.toLowerCase();
				if (!haystack.includes(search)) return false;
			}
			if (milestoneTaskIds && !milestoneTaskIds.has(t.id)) {
				return false;
			}
			return true;
		});

		const STATUS_ORDER: Record<string, number> = {
			submitted: 0, open: 1, in_progress: 2, waiting: 3,
		};

		// Parse timestamps numerically — string comparison is unsafe because
		// postgres-backed tasks (e.g. meadow) return `created_at`/`updated_at`
		// as human-readable strings like "Thu Apr 16 2026 14:06:28 GMT-0400
		// (Eastern Daylight Time)", which sort alphabetically by weekday name
		// rather than by date.
		const ts = (s: string | undefined | null): number => {
			if (!s) return 0;
			const t = new Date(s).getTime();
			return Number.isFinite(t) ? t : 0;
		};

		// Comparators always return ascending-direction (-1 → a before b). The
		// dirMul flips the result when the user wants descending, keeping the
		// sort functions themselves simple.
		const dirMul = _dir === "asc" ? 1 : -1;
		filtered.sort((a, b) => {
			let cmp: number;
			if (_sort === "age") {
				cmp = ts(a.created_at) - ts(b.created_at);
			} else if (_sort === "updated") {
				cmp = ts(a.updated_at) - ts(b.updated_at);
			} else if (_sort === "status") {
				const sa = STATUS_ORDER[a.status] ?? 9;
				const sb = STATUS_ORDER[b.status] ?? 9;
				cmp = sa !== sb ? sa - sb : ts(a.created_at) - ts(b.created_at);
			} else if (_sort === "type") {
				const ta = a.issue_type ?? "task";
				const tb = b.issue_type ?? "task";
				cmp = ta !== tb ? ta.localeCompare(tb) : (a.priority ?? 99) - (b.priority ?? 99);
			} else {
				// priority → age (tie-break)
				const pa = a.priority ?? 99;
				const pb = b.priority ?? 99;
				cmp = pa !== pb ? pa - pb : ts(a.created_at) - ts(b.created_at);
			}
			return cmp * dirMul;
		});

		return filtered;
	});

	const selectedTask = $derived<Task | null>(
		filteredTasks[selectedIdx] ?? null,
	);

	const inboxSummary = $derived.by<Record<string, number>>(() => {
		const counts: Record<string, number> = {};
		for (const t of tasks) counts[t.status] = (counts[t.status] ?? 0) + 1;
		return counts;
	});

	const hasActiveFilters = $derived.by(() => {
		const statusDefault =
			filterStatuses.length === DEFAULT_STATUSES.size &&
			filterStatuses.every((s) => DEFAULT_STATUSES.has(s));
		return (
			!statusDefault ||
			filterPriorities.length > 0 ||
			filterProject !== "" ||
			filterTypes.length > 0 ||
			filterAssignee.trim() !== "" ||
			filterSearch.trim() !== "" ||
			filterMilestones.length > 0 ||
			sortBy !== "priority" ||
			sortDir !== DEFAULT_SORT_DIR.priority
		);
	});

	// Compact human-readable list of which filters are non-default. Rendered as
	// chips in the status bar so the user always knows why their list is what
	// it is (jat-nm0nq.7 polish: "current filter summary").
	const filterSummaryChips = $derived.by<string[]>(() => {
		const chips: string[] = [];
		const statusDefault =
			filterStatuses.length === DEFAULT_STATUSES.size &&
			filterStatuses.every((s) => DEFAULT_STATUSES.has(s));
		if (!statusDefault) {
			chips.push(
				filterStatuses.length === 0
					? "status: none"
					: `status: ${[...filterStatuses].sort().map(displayStatus).join(",")}`,
			);
		}
		if (filterPriorities.length > 0) {
			chips.push(
				`priority: ${[...filterPriorities]
					.sort((a, b) => a - b)
					.map((p) => `P${p}`)
					.join(",")}`,
			);
		}
		if (filterProject) chips.push(`project: ${filterProject}`);
		if (filterTypes.length > 0) {
			chips.push(`type: ${[...filterTypes].sort().join(",")}`);
		}
		if (filterAssignee.trim()) {
			chips.push(`assignee: ${filterAssignee.trim()}`);
		}
		if (filterSearch.trim()) {
			const q = filterSearch.trim();
			chips.push(
				`search: "${q.length > 20 ? q.slice(0, 18) + "…" : q}"`,
			);
		}
		if (filterMilestones.length > 0) {
			// Prefer human-readable names; fall back to IDs for unresolved selections
			// (e.g. milestones still loading after URL hydrate).
			const names = filterMilestones.map((id) => {
				const m = milestoneList.find((x) => x.id === id);
				return m?.name ?? id.slice(0, 8);
			});
			chips.push(`milestone: ${names.join(",")}`);
		}
		return chips;
	});

	// Mode-aware shortcut tables for the `?` overlay (jat-nm0nq.7 polish).
	const shortcutSections: ShortcutSection[] = [
		{
			title: "List",
			shortcuts: [
				{ key: "j / ↓", description: "Focus next task" },
				{ key: "k / ↑", description: "Focus previous task" },
				{ key: "Enter / Space", description: "Open detail panel" },
				{ key: "/", description: "Focus filter search input" },
				{ key: "u", description: "Undo last dismiss (while toast is visible)" },
				{ key: "Esc", description: "Close panel / exit filter" },
			],
		},
		{
			title: "Bulk selection",
			shortcuts: [
				{ key: "x", description: "Toggle select focused task" },
				{ key: "Shift+J / Shift+K", description: "Select + move down / up" },
				{ key: "*", description: "Select / deselect all visible" },
				{ key: "a (with selection)", description: "Add selected to epic" },
				{ key: "Esc (with selection)", description: "Clear selection" },
			],
		},
		{
			title: "Detail",
			shortcuts: [
				{ key: "r / c", description: "Jump to compose box" },
				{ key: "a", description: "Open assign picker" },
				{ key: "s", description: "Open status picker" },
				{ key: "p", description: "Open priority picker" },
				{ key: "t", description: "Open type picker" },
				{ key: "e", description: "Open epic picker" },
				{ key: "m", description: "Open milestone picker" },
				{ key: "Space", description: "Spawn agent on this task" },
				{ key: "o", description: "Open full task detail drawer" },
				{ key: "d", description: "Dismiss / close task" },
				{ key: "j / k", description: "Move to next / previous task" },
				{ key: "Esc", description: "Close detail panel" },
			],
		},
		{
			title: "Compose",
			shortcuts: [
				{ key: "Enter", description: "Send comment" },
				{
					key: "Ctrl+Enter",
					description: "Send + route to requester, advance to next",
				},
				{ key: "Esc", description: "Return focus to detail panel" },
			],
		},
	];

	// Keep selection in bounds when the filtered set shrinks. Also re-home
	// listNav's internal focus so j/k after a filter change starts from a
	// valid row instead of the (now-removed) previously focused one.
	$effect(() => {
		if (selectedIdx >= filteredTasks.length) {
			selectedIdx = Math.max(0, filteredTasks.length - 1);
		}
		navController.refresh();
	});

	// Keep the sidebar Inbox badge in sync whenever the local task list
	// mutates (route, dismiss, edit) so the count reacts immediately to user
	// actions instead of waiting for the next layout poll.
	$effect(() => {
		setSubmittedTasksCount(
			tasks.filter((t) => t.status === "submitted").length,
		);
	});

	function jumpToCompose() {
		focusZone = "compose";
		tick().then(() => detailRef?.focusCompose());
	}

	function isTypingTarget(target: EventTarget | null): boolean {
		if (!(target instanceof HTMLElement)) return false;
		const tag = target.tagName;
		if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
		if (target.isContentEditable) return true;
		return false;
	}

	// j/k list navigation (jat-nm0nq.2) — driven by the shared listNav
	// composable so we don't reinvent keyboard handling. We use the imperative
	// form (not the Svelte action) so we can run the detail-zone shortcuts
	// FIRST and only fall through to nav for j/k/Arrow/Enter/Escape (and Space
	// when panel is closed). This keeps Space=spawn working in detail zone.
	const navController: ListNavController = createListNav({
		getItems: () =>
			listEl ? Array.from(listEl.querySelectorAll<HTMLElement>("[data-nav-id]")) : [],
		onSelect: (_el, idx) => selectTask(idx),
		onEscape: () => {
			if (panelOpen) {
				panelOpen = false;
				focusZone = "list";
			}
		},
		// Bridge listNav's internal focus → page-level selectedIdx so the
		// existing `.selected` styling and selectedTask derivation track j/k
		// navigation even when the panel is closed.
		onFocusChange: (_el, idx) => {
			if (idx >= 0 && idx !== selectedIdx) selectedIdx = idx;
		},
	});

	function handleWindowKeydown(e: KeyboardEvent) {
		if (e.ctrlKey || e.metaKey || e.altKey) return;

		// "/" focuses the filter input from anywhere except other inputs.
		if (e.key === "/" && !isTypingTarget(e.target)) {
			e.preventDefault();
			focusFilter();
			return;
		}

		// "u" undoes the last dismiss if an undo is pending.
		if (e.key === "u" && !isTypingTarget(e.target) && undoTask) {
			e.preventDefault();
			handleUndo();
			return;
		}

		if (isTypingTarget(e.target)) return;

		// ── Bulk selection ──────────────────────────────────────────────────
		// x — toggle current focused task
		if (e.key === 'x') {
			const task = filteredTasks[selectedIdx];
			if (task) { e.preventDefault(); toggleSelect(task.id); return; }
		}

		// Shift+J — select current + move down
		if (e.key === 'J') {
			e.preventDefault();
			const before = selectedIdx;
			const afterIdx = Math.min(before + 1, filteredTasks.length - 1);
			navController.focus(afterIdx);
			const next = new Set(selectedTaskIds);
			if (filteredTasks[before]) next.add(filteredTasks[before].id);
			if (filteredTasks[afterIdx]) next.add(filteredTasks[afterIdx].id);
			selectedTaskIds = next;
			return;
		}

		// Shift+K — select current + move up
		if (e.key === 'K') {
			e.preventDefault();
			const before = selectedIdx;
			const afterIdx = Math.max(before - 1, 0);
			navController.focus(afterIdx);
			const next = new Set(selectedTaskIds);
			if (filteredTasks[before]) next.add(filteredTasks[before].id);
			if (filteredTasks[afterIdx]) next.add(filteredTasks[afterIdx].id);
			selectedTaskIds = next;
			return;
		}

		// * — toggle select all visible
		if (e.key === '*') {
			e.preventDefault();
			const allSelected = filteredTasks.length > 0 && filteredTasks.every(t => selectedTaskIds.has(t.id));
			selectedTaskIds = allSelected ? new Set() : new Set(filteredTasks.map(t => t.id));
			return;
		}

		// Bulk action shortcuts — only when selection is non-empty
		if (selectedTaskIds.size > 0) {
			if (e.key === 'a') {
				e.preventDefault();
				loadEpics();
				bulkEpicOpen = true;
				return;
			}
			if (e.key === 'Escape') {
				e.preventDefault();
				clearBulkSelection();
				return;
			}
		}
		// ────────────────────────────────────────────────────────────────────

		// Detail-zone shortcuts run BEFORE list navigation so Space spawns
		// the agent (jat-nm0nq.6) instead of re-firing selectTask.
		if (focusZone === "detail" && panelOpen && selectedTask) {
			// r/c → jump to compose box.
			if (e.key === "r" || e.key === "c") {
				e.preventDefault();
				jumpToCompose();
				return;
			}

			// Action-bar shortcuts (jat-nm0nq.6).
			if (detailRef) {
				switch (e.key) {
					case "a":
						e.preventDefault();
						detailRef.openAssign();
						return;
					case "s":
						e.preventDefault();
						detailRef.openStatus();
						return;
					case "p":
						e.preventDefault();
						detailRef.openPriority();
						return;
					case "t":
						e.preventDefault();
						detailRef.openType();
						return;
					case "e":
						e.preventDefault();
						detailRef.openEpic();
						return;
					case "m":
						e.preventDefault();
						detailRef.openMilestone();
						return;
					case "o":
						e.preventDefault();
						detailRef.openFullDrawer();
						return;
					case "d":
						e.preventDefault();
						detailRef.dismissTask();
						return;
					case " ":
						e.preventDefault();
						detailRef.spawnAgent();
						return;
				}
			}
		}

		// j/k/Arrow/Enter/Escape (and Space when not consumed above).
		navController.handleKeydown(e);
	}

	function handleEscapeCompose() {
		focusZone = "detail";
	}

	// Merge a server-side edit back into the local task array so the list and
	// detail panel reflect it instantly. If the updated task drops out of the
	// active filter, the $effect above will clamp selectedIdx on the next tick.
	function handleTaskUpdated(patch: Partial<Task> & { id: string }) {
		tasks = tasks.map((t) => (t.id === patch.id ? { ...t, ...patch } : t));
	}

	// When a task is dismissed (closed), drop it from the list and advance to
	// the next task — matches the send+route flow so the user can keep burning
	// through the queue.
	function handleTaskDismissed(taskId: string) {
		const filteredBefore = filteredTasks;
		const filteredPos = filteredBefore.findIndex((t) => t.id === taskId);

		// Remove from source list. "closed" isn't in FETCH_STATUSES so it will
		// naturally be gone on the next refetch; we just don't want to wait.
		const srcIdx = tasks.findIndex((t) => t.id === taskId);
		const removed = srcIdx >= 0 ? tasks[srcIdx] : null;
		if (srcIdx >= 0) tasks.splice(srcIdx, 1);
		tasks = tasks;

		// Offer undo for 4 seconds — re-opens on server if claimed.
		if (removed) {
			undoTask = removed;
			if (undoTimer) clearTimeout(undoTimer);
			undoTimer = setTimeout(() => { undoTask = null; undoTimer = null; }, UNDO_MS);
		}

		triggerFlash(taskId);

		tick().then(() => {
			const filteredAfter = filteredTasks;
			if (filteredAfter.length === 0) {
				selectedIdx = 0;
				panelOpen = false;
				focusZone = "list";
				return;
			}
			// Stay on the same index so the "next" task slides up into place.
			const next = filteredPos >= 0 ? filteredPos : selectedIdx;
			selectedIdx = Math.min(next, filteredAfter.length - 1);
			focusZone = "detail";
		});
	}

	async function handleUndo() {
		if (!undoTask) return;
		const task = undoTask;
		undoTask = null;
		if (undoTimer) { clearTimeout(undoTimer); undoTimer = null; }

		// Re-insert at front and re-open on server (best effort).
		tasks = [task, ...tasks];
		try {
			await fetch(`/api/tasks/${encodeURIComponent(task.id)}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: task.status }),
			});
		} catch { /* silent — task is back in local list either way */ }

		// Navigate to the restored task.
		await tick();
		const idx = filteredTasks.findIndex((t) => t.id === task.id);
		if (idx >= 0) selectTask(idx);
	}

	// --- Send + Route -------------------------------------------------------
	//
	// Called by InboxCompose *after* it has already posted the comment (if
	// any). Our job here is:
	//   1. PUT /api/tasks/:id with assignee=requester (fallback: current human
	//      assignee) and status=waiting when task was submitted/open.
	//   2. Flash the row green for visual confirmation.
	//   3. Advance selection to the next task, wrapping around; if the filter
	//      now shows nothing, drop focus back to the list.
	//
	// Any thrown error propagates back into the compose so it can surface the
	// message and keep the user on this task (the comment has already landed).
	async function handleSendAndRoute(taskId: string, _text: string) {
		const task = tasks.find((t) => t.id === taskId);
		if (!task) {
			throw new Error("Task not found");
		}

		// Target: approver → requester → creator (post jat-9e5tc refactor).
		// Falls back to the current human-ish assignee only when no identity
		// snapshot is set, so legacy tasks still route somewhere sensible.
		const target = resolveRoutingTarget(task as any);
		const targetAssignee = (
			target?.actor.email ||
			target?.actor.agent ||
			task.assignee ||
			""
		).trim();
		if (!targetAssignee) {
			throw new Error(
				"No approver, requester, creator, or assignee to route to — set one via the task detail first.",
			);
		}
		const targetAssigneeId = isUuid(target?.id) ? target!.id : null;

		const nextStatus =
			task.status === "submitted" || task.status === "open"
				? "waiting"
				: task.status;

		const body: Record<string, unknown> = {
			assignee: targetAssignee,
			status: nextStatus,
		};
		if (targetAssigneeId) body.assignee_id = targetAssigneeId;

		const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		if (!res.ok) {
			const errBody = await res.json().catch(() => ({}));
			throw new Error(errBody.error || `Route failed (HTTP ${res.status})`);
		}

		// Apply the update locally so the UI reacts immediately instead of
		// waiting for the next poll. The derived filtered list recomputes on
		// this mutation.
		const idx = tasks.findIndex((t) => t.id === taskId);
		if (idx >= 0) {
			tasks[idx] = {
				...tasks[idx],
				assignee: targetAssignee,
				assignee_id: targetAssigneeId ?? tasks[idx].assignee_id ?? null,
				status: nextStatus,
			};
		}

		triggerFlash(taskId);

		// Let Svelte recompute filteredTasks before we touch selectedIdx — the
		// derived list may have shrunk (task fell out of the filter).
		await tick();
		advanceAfterRoute(taskId);
	}

	// --- Send + Spawn ----------------------------------------------------
	//
	// Called by InboxCompose in Internal + Spawn mode. The composer has
	// already posted the internal note. Our job:
	//   1. Fire POST /api/work/spawn with preserveAssignee=true (don't await
	//      — the spawn API takes 30-45s because of Claude Code startup-stall
	//      recovery, and we don't want the user staring at a spinner that
	//      whole time).
	//   2. Optimistically flip local status to in_progress + flash + advance
	//      so the inbox reacts immediately, same feel as pressing Space or
	//      the ActionBar spawn button.
	//   3. If the spawn fetch errors after the fact, surface a toast-style
	//      error via console + a status revert. The comment is already
	//      posted regardless, so the user's note isn't lost.
	//
	// The returned promise resolves as soon as the optimistic update is done,
	// so InboxCompose's submitting spinner clears immediately.
	function handleSendAndSpawn(taskId: string, _text: string) {
		const task = tasks.find((t) => t.id === taskId);
		if (!task) {
			throw new Error("Task not found");
		}

		// Optimistic: flip local status + advance immediately. The session
		// card will appear on /work once the signal layer catches up; no need
		// to wait for the HTTP response.
		//
		// If the task is currently unassigned, optimistically claim it for the
		// dev too — the spawn API will do the same server-side (see
		// claimAssignee). Keeps the inbox UI honest before the next poll.
		const idx = tasks.findIndex((t) => t.id === taskId);
		if (idx >= 0) {
			const wasUnassigned =
				!tasks[idx].assignee || !String(tasks[idx].assignee).trim();
			tasks[idx] = {
				...tasks[idx],
				status: "in_progress",
				assignee:
					wasUnassigned && currentUser
						? currentUser
						: tasks[idx].assignee,
			};
		}
		triggerFlash(taskId);
		tick().then(() => advanceAfterRoute(taskId));

		// Fire the spawn in the background. Failures are logged + surface
		// via a rollback so the inbox doesn't lie about the task state.
		//
		// claimAssignee / claimAssigneeEmail tell the spawn API: if the task
		// is currently unassigned, set the dev as assignee. preserveAssignee
		// = "don't replace a human with an agent" — but null isn't a human,
		// it's a vacancy, and the act of spawning is the dev claiming it.
		fetch("/api/work/spawn", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				taskId,
				preserveAssignee: true,
				claimAssignee: currentUser || undefined,
				claimAssigneeEmail: currentUserEmail || undefined,
			}),
		})
			.then(async (res) => {
				if (!res.ok) {
					const errBody = await res.json().catch(() => ({}));
					const msg =
						errBody.error ||
						errBody.message ||
						`Spawn failed (HTTP ${res.status})`;
					console.error(`[inbox] Spawn for ${taskId} failed: ${msg}`);
					// Roll back the optimistic status flip + claim so the task
					// reappears in the inbox in its original state on the next
					// filter pass.
					const j = tasks.findIndex((t) => t.id === taskId);
					if (j >= 0 && tasks[j].status === "in_progress") {
						tasks[j] = {
							...tasks[j],
							status: task.status,
							assignee: task.assignee,
						};
					}
				}
			})
			.catch((err) => {
				console.error(`[inbox] Spawn for ${taskId} errored:`, err);
			});
	}

	function triggerFlash(taskId: string) {
		flashTaskId = taskId;
		if (flashTimer) clearTimeout(flashTimer);
		// 900ms matches the CSS animation duration (see .task-row-route-flash).
		flashTimer = setTimeout(() => {
			flashTaskId = null;
			flashTimer = null;
		}, 900);
	}

	function advanceAfterRoute(previousTaskId: string) {
		const filtered = filteredTasks;

		if (filtered.length === 0) {
			// Inbox zero within the current filter — drop the detail panel and
			// return focus to the list so Escape/arrow keys behave predictably.
			selectedIdx = 0;
			panelOpen = false;
			focusZone = "list";
			return;
		}

		const currentPos = filtered.findIndex((t) => t.id === previousTaskId);

		let nextIdx: number;
		if (currentPos === -1) {
			// Task dropped out of the filtered view (e.g. submitted → waiting
			// with the default filter). The next task already occupies the old
			// slot, so clamp to the new length.
			nextIdx = Math.min(selectedIdx, filtered.length - 1);
		} else {
			// Task is still visible (e.g. filter includes waiting). Step past
			// it, wrapping to the top when we hit the end.
			nextIdx = (currentPos + 1) % filtered.length;
		}
		selectedIdx = Math.max(0, nextIdx);

		// Keep the compose hot so the user can keep tapping out replies.
		focusZone = "compose";
		tick().then(() => detailRef?.focusCompose());
	}


	function toggleSelect(taskId: string) {
		const next = new Set(selectedTaskIds);
		if (next.has(taskId)) next.delete(taskId);
		else next.add(taskId);
		selectedTaskIds = next;
	}

	function clearBulkSelection() {
		selectedTaskIds = new Set();
		bulkEpicOpen = false;
	}

	async function loadEpics() {
		try {
			// Infer project from selected tasks (fall back to active filter)
			const projects = new Set<string>(
				Array.from(selectedTaskIds).map(id => getProjectFromTaskId(id)).filter((p): p is string => !!p)
			);
			if (filterProject) projects.add(filterProject);

			// Fetch open tasks per project (API doesn't support issue_type filter — filter client-side)
			const fetches = projects.size > 0
				? Array.from(projects).map(p => fetch(`/api/tasks?status=open&limit=200&project=${encodeURIComponent(p)}`))
				: [fetch('/api/tasks?status=open&limit=200')];

			const results = await Promise.all(fetches);
			const all: Task[] = [];
			for (const res of results) {
				if (res.ok) {
					const data = await res.json();
					for (const t of data.tasks || []) {
						if (t.issue_type === 'epic' && !all.find(e => e.id === t.id)) all.push(t);
					}
				}
			}
			epics = all;
		} catch { /* silent */ }
	}

	async function bulkAssignToEpic(epicId: string) {
		const ids = Array.from(selectedTaskIds);
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
			addToast({ message: `Assigned ${success}/${ids.length} task${ids.length === 1 ? '' : 's'} to epic`, type: success === ids.length ? 'success' : 'info' });
			clearBulkSelection();
			fetchTasks();
		} finally {
			bulkWorking = false;
		}
	}

	async function fetchTasks() {
		loading = true;
		error = null;
		try {
			const projectParam = filterProject ? `&project=${encodeURIComponent(filterProject)}` : "";
			const responses = await Promise.all(
				FETCH_STATUSES.map((s) => fetch(`/api/tasks?status=${s}${projectParam}`)),
			);
			const failed = responses.find((r) => !r.ok);
			if (failed) {
				throw new Error(`Fetch failed (${failed.status})`);
			}
			const payloads = await Promise.all(responses.map((r) => r.json()));
			const combined: Task[] = payloads.flatMap((p) => p.tasks ?? []);

			tasks = combined;

			// Refresh the global Inbox badge with the freshest count we have —
			// the layout polls separately, but this keeps the sidebar accurate
			// the instant the user routes/dismisses tasks here.
			setSubmittedTasksCount(
				combined.filter((t) => t.status === "submitted").length,
			);

			// Email-client default: auto-open the first task so the user always
			// lands in a split layout with context, not a blank right panel.
			if (!panelOpen && filteredTasks.length > 0) {
				selectedIdx = 0;
				panelOpen = true;
				focusZone = "detail";
				// Sync listNav so j/k starts from position 0, not undefined.
				await tick();
				navController.focus(0);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			loading = false;
		}
	}

	function selectTask(idx: number) {
		if (idx < 0 || idx >= filteredTasks.length) return;
		selectedIdx = idx;
		panelOpen = true;
		focusZone = "detail";
		// Sync listNav's internal focus index so subsequent j/k starts from
		// the clicked row instead of the previously focused one.
		navController.focus(idx);
	}

	// ---- URL <-> filter state sync ----

	function parseSet(
		raw: string | null,
		allowed: readonly string[],
	): Set<string> {
		if (!raw) return new Set();
		const out = new Set<string>();
		for (const part of raw.split(",")) {
			const v = part.trim();
			if (v && allowed.includes(v)) out.add(v);
		}
		return out;
	}

	function parsePrioritySet(raw: string | null): Set<number> {
		if (!raw) return new Set();
		const out = new Set<number>();
		for (const part of raw.split(",")) {
			const trimmed = part.trim().replace(/^p/i, "");
			const n = Number(trimmed);
			if (Number.isInteger(n) && n >= 0 && n <= 4) out.add(n);
		}
		return out;
	}

	function hydrateFromUrl(searchParams: URLSearchParams) {
		const statusRaw = searchParams.get("status");
		// Distinguish "no param" (use defaults) from "empty param" (no statuses).
		if (statusRaw === null) {
			filterStatuses = [...DEFAULT_STATUSES];
		} else {
			filterStatuses = [...parseSet(statusRaw, FETCH_STATUSES)];
		}
		filterPriorities = [...parsePrioritySet(searchParams.get("priority"))];
		filterProject = searchParams.get("project") ?? "";
		filterTypes = [...parseSet(searchParams.get("type"), TYPE_OPTIONS)];
		filterAssignee = searchParams.get("assignee") ?? "";
		const rawSort = searchParams.get("sort");
		sortBy = (["priority", "age", "updated", "status", "type"].includes(rawSort ?? "") ? rawSort : "priority") as SortBy;
		const rawDir = searchParams.get("sortDir");
		sortDir = rawDir === "asc" || rawDir === "desc" ? rawDir : DEFAULT_SORT_DIR[sortBy];
		filterSearch = searchParams.get("q") ?? "";
		const milestoneRaw = searchParams.get("milestone");
		filterMilestones = milestoneRaw
			? milestoneRaw.split(",").map((s) => s.trim()).filter(Boolean)
			: [];
	}

	function buildSearchParams(): URLSearchParams {
		const sp = new URLSearchParams();

		// Only encode status when it diverges from the default set, so a clean URL
		// stays clean and shared URLs only carry user intent.
		const statusEqualsDefault =
			filterStatuses.length === DEFAULT_STATUSES.size &&
			filterStatuses.every((s) => DEFAULT_STATUSES.has(s));
		if (!statusEqualsDefault) {
			sp.set("status", [...filterStatuses].sort().join(","));
		}
		if (filterPriorities.length > 0) {
			sp.set(
				"priority",
				[...filterPriorities].sort((a, b) => a - b).join(","),
			);
		}
		if (filterProject) sp.set("project", filterProject);
		if (sortBy !== "priority") sp.set("sort", sortBy);
		// Only encode sortDir when it diverges from this sort type's default.
		if (sortDir !== DEFAULT_SORT_DIR[sortBy]) sp.set("sortDir", sortDir);
		if (filterTypes.length > 0) {
			sp.set("type", [...filterTypes].sort().join(","));
		}
		if (filterAssignee.trim()) sp.set("assignee", filterAssignee.trim());
		if (filterSearch.trim()) sp.set("q", filterSearch.trim());
		if (filterMilestones.length > 0) {
			sp.set("milestone", [...filterMilestones].sort().join(","));
		}

		return sp;
	}

	// Sync filter state → URL after hydration. replaceState avoids piling each
	// keystroke onto history.
	//
	// IMPORTANT: $page.url is read inside untrack() so this effect only depends
	// on filter state, not on URL. Depending on both caused an infinite loop:
	// goto() updated $page.url, the effect re-fired, and with URL param order
	// drift from layout-level gotos (e.g. project restoration) the comparison
	// never settled — the browser would throw "Too many calls to Location or
	// History APIs" and the whole reactive flush would stall, preventing
	// $derived.by(filteredTasks) from running on subsequent filter changes.
	$effect(() => {
		if (!hydrated || !browser) return;
		const next = buildSearchParams().toString();
		const pathname = untrack(() => $page.url.pathname);
		const current = untrack(() => $page.url.searchParams.toString());
		if (next === current) return;
		const target = next ? `${pathname}?${next}` : pathname;
		goto(target, { replaceState: true, keepFocus: true, noScroll: true });
	});

	// Persist filter state to localStorage so it survives SvelteKit navigation.
	// Snapshot deps at the top level to ensure reliable tracking (see filteredTasks comment).
	$effect(() => {
		if (!hydrated || !browser) return;
		const state = {
			filterStatuses,
			filterPriorities,
			filterProject,
			sortBy,
			sortDir,
			filterTypes,
			filterAssignee,
			filterSearch,
			filterMilestones,
		};
		try { localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
	});

	// Sync URL → filterProject when the layout changes the project param externally
	// (e.g. clicking a ProjectSelector chip in the TopBar). This is a one-way read:
	// it only updates filterProject; the filter-to-URL effect above handles the
	// reverse direction and guards against loops via untrack().
	// fetchTasks() must also be called here because it passes ?project= to the server
	// API — the tasks array still holds the old project's data after a URL-driven
	// project switch, which causes filteredTasks to show zero results.
	$effect(() => {
		if (!hydrated || !browser) return;
		const projectFromUrl = $page.url.searchParams.get("project") ?? "";
		if (projectFromUrl !== filterProject) {
			filterProject = projectFromUrl;
			fetchTasks();
		}
	});

	// ---- Filter toggle helpers ----

	function handleSortClick(val: SortBy) {
		if (sortBy === val) {
			// Clicking the active sort chip inverts direction.
			sortDir = sortDir === "asc" ? "desc" : "asc";
		} else {
			// Switching to a new sort type resets to that type's natural default.
			sortBy = val;
			sortDir = DEFAULT_SORT_DIR[val];
		}
	}

	function toggleStatus(s: string) {
		filterStatuses = filterStatuses.includes(s)
			? filterStatuses.filter((x) => x !== s)
			: [...filterStatuses, s];
	}
	function togglePriority(p: number) {
		filterPriorities = filterPriorities.includes(p)
			? filterPriorities.filter((x) => x !== p)
			: [...filterPriorities, p];
	}
	function toggleType(t: string) {
		filterTypes = filterTypes.includes(t)
			? filterTypes.filter((x) => x !== t)
			: [...filterTypes, t];
	}
	function toggleMilestone(id: string) {
		filterMilestones = filterMilestones.includes(id)
			? filterMilestones.filter((x) => x !== id)
			: [...filterMilestones, id];
	}

	// Load milestones for a given project key from /api/clients. The response
	// groups milestones under contracts per project — we flatten them so the
	// filter chip group can render a single list.
	//
	// Concurrent callers await the same in-flight promise instead of
	// short-circuiting: otherwise a prune that runs in .then() sees an empty
	// list and incorrectly drops URL-hydrated milestone selections.
	function loadMilestonesForProject(project: string): Promise<void> {
		if (milestoneLoadedProject === project && milestoneLoadPromise) {
			return milestoneLoadPromise;
		}
		if (milestoneLoadedProject === project && !milestoneLoadPromise) {
			// Already fully loaded for this project; nothing to do.
			return Promise.resolve();
		}
		milestoneLoadedProject = project;
		if (!project) {
			milestoneList = [];
			milestoneLoadPromise = null;
			return Promise.resolve();
		}
		milestonesLoading = true;
		milestoneLoadPromise = (async () => {
			try {
				const res = await fetch("/api/clients");
				if (!res.ok) {
					milestoneLoadedProject = "__uninitialized__";
					return;
				}
				const data = await res.json();
				const pLower = project.toLowerCase();
				const projectData = (data.projects || []).find(
					(p: any) =>
						(p.projectKey || "").toLowerCase() === pLower ||
						(p.name || "").toLowerCase() === pLower,
				);
				const flat: MilestoneOption[] = (projectData?.contracts || []).flatMap(
					(c: any) => (c.milestones || []).map((m: any) => ({
						id: m.id,
						name: m.name,
						status: m.status,
						sort_order: typeof m.sort_order === "number" ? m.sort_order : undefined,
						project,
						linked_tasks: m.linked_tasks || [],
					})),
				);
				milestoneList = flat;
			} catch {
				milestoneLoadedProject = "__uninitialized__";
			} finally {
				milestonesLoading = false;
				milestoneLoadPromise = null;
			}
		})();
		return milestoneLoadPromise;
	}

	// A project context for milestone loading: prefer the explicit filter, fall
	// back to the sole project detected in the task list so users on a
	// single-project inbox still see milestone chips without having to filter.
	const milestoneProjectContext = $derived<string>(
		filterProject || (projectOptions.length === 1 ? projectOptions[0] : ""),
	);

	// Load milestones when the project context changes. Also drop any currently
	// selected milestone IDs that don't belong to the new project's list, so
	// chip selections from a prior project don't silently filter out everything.
	$effect(() => {
		if (!hydrated || !browser) return;
		const project = milestoneProjectContext;
		loadMilestonesForProject(project).then(() => {
			if (filterMilestones.length === 0) return;
			const valid = new Set(milestoneList.map((m) => m.id));
			const pruned = filterMilestones.filter((id) => valid.has(id));
			if (pruned.length !== filterMilestones.length) {
				filterMilestones = pruned;
			}
		});
	});

	// Reverse index: taskId → milestone (the first milestone it appears in —
	// a task should only belong to one, but we take the earliest sort_order
	// just in case). Recomputed when milestoneList changes. Used by the task
	// row renderer to display an M{n} badge alongside P{priority}.
	interface TaskMilestone {
		id: string;
		name: string;
		status?: string;
		sortOrder: number;
	}
	const milestoneByTaskId = $derived.by<Map<string, TaskMilestone>>(() => {
		const _list = milestoneList;
		const map = new Map<string, TaskMilestone>();
		// Sort ascending so tasks linked to multiple milestones take the
		// earliest one (stable, and matches how the filter chip group renders).
		const sorted = [..._list].sort(
			(a, b) => (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity),
		);
		for (let i = 0; i < sorted.length; i++) {
			const m = sorted[i];
			// Fall back to positional index when sort_order is missing so every
			// milestone still gets a stable badge number.
			const sortOrder = m.sort_order ?? i;
			const entry: TaskMilestone = {
				id: m.id,
				name: m.name,
				status: m.status,
				sortOrder,
			};
			for (const t of m.linked_tasks ?? []) {
				const key = t.jat_id ?? t.id;
				if (key && !map.has(key)) map.set(key, entry);
			}
		}
		return map;
	});

	function clearAllFilters() {
		filterStatuses = [...DEFAULT_STATUSES];
		filterPriorities = [];
		filterProject = "";
		filterTypes = [];
		filterAssignee = "";
		filterSearch = "";
		filterMilestones = [];
		sortBy = "priority";
		sortDir = DEFAULT_SORT_DIR.priority;
	}

	function loadFiltersFromStorage(): boolean {
		try {
			const raw = localStorage.getItem(FILTER_STORAGE_KEY);
			if (!raw) return false;
			const saved = JSON.parse(raw);
			if (Array.isArray(saved.filterStatuses)) filterStatuses = saved.filterStatuses;
			if (Array.isArray(saved.filterPriorities)) filterPriorities = saved.filterPriorities;
			if (typeof saved.filterProject === "string") filterProject = saved.filterProject;
			if (typeof saved.sortBy === "string" && ["priority","age","updated","status","type"].includes(saved.sortBy)) sortBy = saved.sortBy as SortBy;
			if (saved.sortDir === "asc" || saved.sortDir === "desc") sortDir = saved.sortDir;
			if (Array.isArray(saved.filterTypes)) filterTypes = saved.filterTypes;
			if (typeof saved.filterAssignee === "string") filterAssignee = saved.filterAssignee;
			if (typeof saved.filterSearch === "string") filterSearch = saved.filterSearch;
			if (Array.isArray(saved.filterMilestones)) filterMilestones = saved.filterMilestones;
			return true;
		} catch { return false; }
	}

	async function focusFilter() {
		await tick();
		filterInputEl?.focus();
		filterInputEl?.select();
	}

	function focusList() {
		filterInputEl?.blur();
		(listEl as HTMLElement | null)?.focus();
		focusZone = "list";
	}

	function handleFilterKey(e: KeyboardEvent) {
		if (e.key === "Escape") {
			e.preventDefault();
			focusList();
		}
	}

	// ---- Context Menu ----

	let ctxTask = $state<Task | null>(null);
	let ctxX = $state(0);
	let ctxY = $state(0);
	let ctxVisible = $state(false);
	let ctxStatusSubmenuOpen = $state(false);
	let ctxPrioritySubmenuOpen = $state(false);

	function handleContextMenu(task: Task, event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		const menuWidth = 200;
		const menuHeight = 260;
		ctxTask = task;
		ctxX = Math.min(event.clientX, window.innerWidth - menuWidth - 8);
		ctxY = Math.min(event.clientY, window.innerHeight - menuHeight - 8);
		ctxVisible = true;
		ctxStatusSubmenuOpen = false;
		ctxPrioritySubmenuOpen = false;
	}

	function closeContextMenu() {
		ctxVisible = false;
		ctxStatusSubmenuOpen = false;
		ctxPrioritySubmenuOpen = false;
		// ctxTask intentionally NOT cleared — keeps DOM alive for CSS toggle
	}

	$effect(() => {
		if (!ctxVisible) return;
		function onClickOutside() { closeContextMenu(); }
		function onKeyDown(e: KeyboardEvent) { if (e.key === 'Escape') closeContextMenu(); }
		const timer = setTimeout(() => {
			document.addEventListener('click', onClickOutside);
			document.addEventListener('keydown', onKeyDown);
		}, 0);
		return () => {
			clearTimeout(timer);
			document.removeEventListener('click', onClickOutside);
			document.removeEventListener('keydown', onKeyDown);
		};
	});

	async function ctxSpawnTask(task: Task) {
		closeContextMenu();
		try {
			const res = await fetch('/api/work/spawn', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ taskId: task.id }),
			});
			if (res.ok) {
				handleTaskUpdated({ id: task.id, status: 'in_progress' });
			}
		} catch { /* silent */ }
	}

	async function ctxViewDetails(task: Task) {
		closeContextMenu();
		const idx = filteredTasks.findIndex((t) => t.id === task.id);
		if (idx >= 0) selectTask(idx);
		await tick();
		detailRef?.openFullDrawer();
	}

	async function ctxChangeStatus(taskId: string, status: string) {
		closeContextMenu();
		try {
			await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status }),
			});
			handleTaskUpdated({ id: taskId, status } as any);
		} catch { /* silent */ }
	}

	async function ctxChangePriority(taskId: string, priority: number) {
		closeContextMenu();
		try {
			await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ priority }),
			});
			handleTaskUpdated({ id: taskId, priority } as any);
		} catch { /* silent */ }
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
					project: task.project || getProjectFromTaskId(task.id),
					labels: task.labels?.join(',') || '',
				}),
			});
			if (res.ok) fetchTasks();
		} catch { /* silent */ }
	}

	function ctxDismissTask(task: Task) {
		closeContextMenu();
		handleTaskDismissed(task.id);
		// Best-effort server close
		fetch(`/api/tasks/${encodeURIComponent(task.id)}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status: 'closed' }),
		}).catch(() => {});
	}

	async function ctxDeleteTask(task: Task) {
		closeContextMenu();
		if (!confirm(`Delete task ${task.id}? This cannot be undone.`)) return;
		try {
			const res = await fetch(`/api/tasks/${encodeURIComponent(task.id)}`, { method: 'DELETE' });
			if (res.ok) {
				handleTaskDismissed(task.id);
			}
		} catch { /* silent */ }
	}

	// ---- Avatar helpers ----

	function getActorInitials(actor: { name?: string; email?: string; agent?: string } | null | undefined): string {
		if (!actor) return "";
		const src = actor.name || actor.email || actor.agent || "";
		if (!src) return "";
		// email: use first char of local part
		if (src.includes("@")) {
			return src.split("@")[0].slice(0, 2).toUpperCase();
		}
		// name / agent: first letters of first two words
		const words = src.trim().split(/[\s_\-]+/).filter(Boolean);
		if (words.length >= 2) {
			return (words[0][0] + words[1][0]).toUpperCase();
		}
		return src.slice(0, 2).toUpperCase();
	}

	// Build a synthetic TaskActor from a raw assignee string (used as the final
	// fallback in the avatar chain when no identity columns are populated).
	function assigneeToActor(s: string | null | undefined): { name?: string; email?: string; agent?: string } | null {
		if (!s) return null;
		return s.includes("@") ? { email: s } : { name: s };
	}

	// Deterministic hue from string so the same actor always gets the same color
	function actorHue(actor: { name?: string; email?: string; agent?: string } | null | undefined): number {
		const src = actor?.name || actor?.email || actor?.agent || "";
		let h = 0;
		for (let i = 0; i < src.length; i++) h = (h * 31 + src.charCodeAt(i)) & 0xffff;
		return h % 360;
	}

	// ---- Resizable divider ----

	function handleDividerPointerDown(e: PointerEvent) {
		if (!layoutEl) return;
		e.preventDefault();
		isResizing = true;
		const rect = layoutEl.getBoundingClientRect();
		const handleEl = e.currentTarget as HTMLElement | null;
		handleEl?.setPointerCapture?.(e.pointerId);

		const onMove = (ev: PointerEvent) => {
			const pct = ((ev.clientX - rect.left) / rect.width) * 100;
			splitPercent = Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, pct));
		};
		const onUp = () => {
			isResizing = false;
			try {
				localStorage.setItem(SPLIT_STORAGE_KEY, String(splitPercent));
			} catch { /* ignore */ }
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp);
			window.removeEventListener("pointercancel", onUp);
		};
		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp);
		window.addEventListener("pointercancel", onUp);
	}

	function resetDivider() {
		splitPercent = DEFAULT_SPLIT;
		try {
			localStorage.removeItem(SPLIT_STORAGE_KEY);
		} catch { /* ignore */ }
	}

	function handleDividerKey(e: KeyboardEvent) {
		const step = e.shiftKey ? 5 : 2;
		if (e.key === "ArrowLeft") {
			e.preventDefault();
			splitPercent = Math.max(MIN_SPLIT, splitPercent - step);
			persistSplit();
		} else if (e.key === "ArrowRight") {
			e.preventDefault();
			splitPercent = Math.min(MAX_SPLIT, splitPercent + step);
			persistSplit();
		} else if (e.key === "Home") {
			e.preventDefault();
			resetDivider();
		}
	}

	function persistSplit() {
		try {
			localStorage.setItem(SPLIT_STORAGE_KEY, String(splitPercent));
		} catch { /* ignore */ }
	}

	// ---- Mount ----

	onMount(() => {
		const sp = $page.url.searchParams;
		const FILTER_PARAM_KEYS = ["status","priority","project","sort","sortDir","type","assignee","q","milestone"];
		if (FILTER_PARAM_KEYS.some(k => sp.has(k))) {
			hydrateFromUrl(sp);
		} else {
			loadFiltersFromStorage();
		}
		hydrated = true;

		// Restore persisted divider position.
		try {
			const saved = localStorage.getItem(SPLIT_STORAGE_KEY);
			if (saved !== null) {
				const parsed = parseFloat(saved);
				if (Number.isFinite(parsed)) {
					splitPercent = Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, parsed));
				}
			}
		} catch { /* ignore */ }

		// Best-effort identity for @me resolution and comment author tagging.
		// Email is used by postgres-backed backends to resolve the commenter
		// to a per-project profile UUID (so comments show the canonical name
		// in each Supabase project). Failure is silent.
		fetch("/api/config/user")
			.then((r) => (r.ok ? r.json() : null))
			.then((data) => {
				if (data?.name) currentUser = data.name;
				if (data?.email) currentUserEmail = data.email;
			})
			.catch(() => {});

		fetchTasks();

		return () => {
			if (undoTimer) clearTimeout(undoTimer);
			if (flashTimer) clearTimeout(flashTimer);
		};
	});
</script>

<svelte:head>
	<title>Inbox · JAT</title>
</svelte:head>

<div
	bind:this={layoutEl}
	class="inbox-layout"
	class:split={panelOpen}
	class:list-only={!panelOpen}
	class:resizing={isResizing}
	style="--split-left: {splitPercent}%"
>
	<!-- LEFT: TASK LIST -->
	<section class="list-panel" aria-label="Task list">
		<header class="panel-header">
			<h1 class="panel-title">Inbox</h1>
			{#if tasks.length > 0}
				<span class="panel-count">{tasks.length}</span>
			{/if}
		</header>

		<!-- FILTER BAR -->
		<div class="filter-bar" role="search" aria-label="Filter tasks">
			<div class="filter-row filter-row-search">
				<input
					bind:this={filterInputEl}
					bind:value={filterSearch}
					onkeydown={handleFilterKey}
					type="search"
					class="filter-search input input-sm input-bordered"
					placeholder="Search title or description… · / to focus"
					aria-label="Search title and description"
				/>
				<!-- Sort rides the search row because it's an *arrange* control,
				     not a "narrow-the-set" filter. This also frees ~285px on the
				     secondary row so Type + Assignee + Milestone can share a
				     line at typical widths without wrapping. -->
				<div class="chip-group chip-group-sort chip-group-inline-sort" aria-label="Sort by">
					<span class="filter-label">Sort</span>
					{#each ([["priority","Priority"],["age","Age"],["updated","Updated"],["status","Status"],["type","Type"]] as const) as [val, label]}
						{@const active = sortBy === val}
						<button
							type="button"
							class="chip chip-sort"
							class:active
							onclick={() => handleSortClick(val)}
							aria-pressed={active}
							title={active ? `Click to invert direction (currently ${sortDir})` : `Sort by ${label.toLowerCase()}`}
						>{label}{active ? (sortDir === "asc" ? " ↑" : " ↓") : ""}</button>
					{/each}
				</div>
				{#if hasActiveFilters}
					<button
						type="button"
						class="btn btn-xs btn-ghost"
						onclick={clearAllFilters}
						title="Clear all filters"
					>
						Clear
					</button>
				{/if}
			</div>

			<div class="filter-row filter-row-chips">
				<div class="chip-group" aria-label="Status">
					<span class="filter-label">Status</span>
					{#each STATUS_OPTIONS as status}
						{@const active = filterStatuses.includes(status)}
						<button
							type="button"
							class="chip"
							class:active
							onclick={() => toggleStatus(status)}
							aria-pressed={active}
							title="Status: {status}"
						>
							{displayStatus(status)}
						</button>
					{/each}
				</div>

				<div class="chip-group" aria-label="Priority">
					<span class="filter-label">Priority</span>
					{#each PRIORITY_OPTIONS as p}
						{@const active = filterPriorities.includes(p)}
						<button
							type="button"
							class="chip chip-priority"
							class:active
							onclick={() => togglePriority(p)}
							aria-pressed={active}
							title="Priority P{p}"
						>
							P{p}
						</button>
					{/each}
				</div>

			</div>

			<div class="filter-row filter-row-secondary">
				<div class="chip-group chip-group-types" aria-label="Type">
					<span class="filter-label">Type</span>
					{#each TYPE_OPTIONS as type}
						{@const active = filterTypes.includes(type)}
						<button
							type="button"
							class="chip chip-type"
							class:active
							onclick={() => toggleType(type)}
							aria-pressed={active}
							title="Type: {type}"
						>
							{type}
						</button>
					{/each}
				</div>

				<label class="filter-field filter-field-assignee">
					<span class="filter-label">Assignee</span>
					<input
						bind:value={filterAssignee}
						onkeydown={handleFilterKey}
						type="text"
						class="input input-xs input-bordered"
						placeholder="@me · name"
						aria-label="Assignee filter"
						list="assignee-list"
					/>
					<datalist id="assignee-list">
						{#each allAssignees as a}<option value={a} />{/each}
					</datalist>
				</label>

				{#if milestoneProjectContext && (milestoneList.length > 0 || milestonesLoading || filterMilestones.length > 0)}
					<!-- No label — M{n} chips are self-describing and the purple
					     color distinguishes them from P{n}. Lives inside the
					     secondary row so it shares horizontal space with
					     Type/Sort/Assignee rather than claiming its own row. -->
					<div class="chip-group chip-group-milestones" aria-label="Milestone">
						{#if milestonesLoading && milestoneList.length === 0}
							<span class="filter-hint">Loading milestones…</span>
						{:else if milestoneList.length === 0}
							<!-- Empty case suppressed — nothing to show. -->
						{:else}
							{#each [...milestoneList].sort((a, b) => (a.sort_order ?? Infinity) - (b.sort_order ?? Infinity)) as m, i (m.id)}
								{@const active = filterMilestones.includes(m.id)}
								{@const done = m.status === "paid" || m.status === "closed"}
								{@const n = m.sort_order ?? i}
								<button
									type="button"
									class="chip chip-milestone"
									class:active
									class:milestone-done={done}
									onclick={() => toggleMilestone(m.id)}
									aria-pressed={active}
									aria-label="Milestone {m.name}"
									title="M{n} · {m.name}{m.status ? ` (${m.status})` : ""}"
								>M{n}</button>
							{/each}
						{/if}
					</div>
				{/if}
			</div>

			{#if projectOptions.length > 1}
				<div class="filter-row filter-row-projects" transition:slide={{ duration: 150, axis: "y" }}>
					<div class="chip-group" aria-label="Project">
						<span class="filter-label">Project</span>
						{#each projectOptions as proj}
							{@const active = filterProject === proj}
							<button
								type="button"
								class="chip chip-project"
								class:active
								onclick={() => filterProject = active ? "" : proj}
								aria-pressed={active}
								title="Project: {proj}"
							>{proj}</button>
						{/each}
					</div>
				</div>
			{/if}

		</div>

		{#if loading}
			<div class="state-message state-loading">
				<span class="loading loading-spinner loading-xs"></span>
				Loading…
			</div>
		{:else if error}
			<div class="state-message state-error">
				<p>Failed to load tasks: {error}</p>
				<button class="btn btn-sm btn-primary" onclick={fetchTasks}>
					Retry
				</button>
			</div>
		{:else if tasks.length === 0}
			<div class="state-message inbox-zero" transition:fly={{ y: -8, duration: 350 }}>
				<span class="inbox-zero-check" aria-hidden="true">✓</span>
				<span class="inbox-zero-label">all clear</span>
			</div>
		{:else if filteredTasks.length === 0}
			<div class="state-message state-muted">
				<p>No tasks match the current filters.</p>
				<button class="btn btn-xs btn-ghost" onclick={clearAllFilters}>
					Clear filters
				</button>
			</div>
		{:else}
			<ul
				bind:this={listEl}
				class="task-list"
				role="listbox"
				aria-label="Tasks"
				tabindex="-1"
			>
				{#each filteredTasks as task, idx (task.id)}
					{@const isSelected = idx === selectedIdx}
					{@const isFlashing = task.id === flashTaskId}
					{@const isBulkSelected = selectedTaskIds.has(task.id)}
					{@const routedActor = task.approver || task.requester || task.creator || null}
					{@const assigneeActor = !routedActor && task.assignee ? (assigneeToActor(task.assignee)) : null}
					{@const actor = routedActor || assigneeActor}
					{@const taskMilestone = milestoneByTaskId.get(task.id) ?? null}
					{@const tooltipPrefix = routedActor ? "Routes to" : "Assigned to"}
					{@const initials = getActorInitials(actor)}
					{@const hue = actorHue(actor)}
					<li>
						<button
							type="button"
							class="task-row"
							class:selected={isSelected}
							class:route-flash={isFlashing}
							class:bulk-checked={isBulkSelected}
							class:in-selection-mode={selectedTaskIds.size > 0}
							role="option"
							aria-selected={isSelected}
							data-nav-id={task.id}
							onclick={() => selectTask(idx)}
							oncontextmenu={(e) => handleContextMenu(task, e)}
						>
							<span
								class="status-dot badge badge-xs {getTaskStatusBadge(task.status)}"
								class:bulk-checked={isBulkSelected}
								role="checkbox"
								aria-checked={isBulkSelected}
								aria-label="Select {task.id}"
								tabindex="-1"
								onclick={(e) => { e.stopPropagation(); toggleSelect(task.id); }}
								onkeydown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.stopPropagation(); e.preventDefault(); toggleSelect(task.id); } }}
							>{isBulkSelected ? '✓' : ''}</span>
							<span class="task-id">{task.id}</span>
							<span
								class="priority-badge badge badge-sm {getPriorityBadge(
									task.priority,
								)}"
							>
								P{task.priority ?? "?"}
							</span>
							{#if taskMilestone}
								{@const done = taskMilestone.status === "paid" || taskMilestone.status === "closed"}
								<span
									class="milestone-badge badge badge-sm"
									class:milestone-badge-done={done}
									title="Milestone: {taskMilestone.name}{taskMilestone.status ? ` (${taskMilestone.status})` : ""}"
									aria-label="Milestone {taskMilestone.name}"
								>M{taskMilestone.sortOrder}</span>
							{:else}
								<!-- Placeholder cell keeps the grid column alignment
								     consistent across rows that do / don't have a
								     milestone. Renders nothing visible but occupies
								     the milestone column slot. -->
								<span class="milestone-placeholder" aria-hidden="true"></span>
							{/if}
							<span
								class="type-badge badge badge-sm {getTypeBadge(task.issue_type)}"
							>
								{task.issue_type ?? "task"}
							</span>
							<span class="task-title">{task.title}</span>
							{#if task.created_at}
								<span class="task-age"
									>{formatRelativeTime(task.created_at)}</span
								>
							{/if}
							{#if initials}
								{@const actorLabel = actor?.name || actor?.email || actor?.agent || ""}
								<span
									class="creator-avatar"
									style="background: oklch(0.40 0.12 {hue}); color: oklch(0.90 0.08 {hue});"
									title="{tooltipPrefix} {actorLabel}"
									aria-label="{tooltipPrefix} {actorLabel}"
								>{initials}</span>
							{:else}
								<span class="creator-avatar creator-avatar-empty" aria-hidden="true"></span>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		{/if}

		<BulkActionBar
			count={selectedTaskIds.size}
			label={selectedTaskIds.size === 1 ? 'task selected' : 'tasks selected'}
			actions={[
				{ key: 'a', label: 'Add to Epic', onAction: () => { loadEpics(); bulkEpicOpen = true; }, disabled: bulkWorking }
			]}
			onClear={clearBulkSelection}
		/>

		{#if bulkEpicOpen}
			<div
				class="bulk-epic-overlay"
				role="button"
				tabindex="-1"
				onclick={() => { bulkEpicOpen = false; }}
				onkeydown={(e) => { if (e.key === 'Escape') bulkEpicOpen = false; }}
			>
				<div
					class="bulk-epic-modal"
					role="dialog"
					aria-modal="true"
					aria-label="Assign tasks to epic"
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => e.stopPropagation()}
					tabindex="-1"
				>
					<div class="bulk-epic-header">
						<span>Add {selectedTaskIds.size} task{selectedTaskIds.size === 1 ? '' : 's'} to epic</span>
						<button class="bulk-epic-close" onclick={() => { bulkEpicOpen = false; }} aria-label="Close">×</button>
					</div>
					<div class="bulk-epic-list">
						{#if epics.length === 0}
							<div class="bulk-epic-empty">No open epics found.</div>
						{:else}
							{#each epics as epic (epic.id)}
								<button
									class="bulk-epic-row"
									disabled={bulkWorking}
									onclick={() => bulkAssignToEpic(epic.id)}
								>
									<span class="bulk-epic-row-id">{epic.id}</span>
									<span class="bulk-epic-row-title">{epic.title}</span>
								</button>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		{/if}

		{#if undoTask}
			<div
				class="undo-toast"
				transition:fly={{ y: 6, duration: 150 }}
				role="status"
				aria-live="polite"
			>
				<span class="undo-message">dismissed · <kbd class="undo-kbd">u</kbd> to undo</span>
				<button type="button" class="undo-btn" onclick={handleUndo}>Undo</button>
			</div>
		{/if}

		<footer class="status-bar" aria-label="Status">
			{#if filteredTasks.length > 0}
				<span class="status-bar-position" title="Currently selected task position in the filtered list">
					[{Math.min(selectedIdx + 1, filteredTasks.length)} of {filteredTasks.length}]
				</span>
			{:else}
				<span class="status-bar-position status-bar-empty">[0 of 0]</span>
			{/if}
			<span class="status-bar-count" title="Filtered tasks / total tasks loaded">
				{filteredTasks.length}/{tasks.length}
			</span>
			{#if hasActiveFilters}
				<span class="status-bar-filter-chips" aria-label="Active filters">
					{#each filterSummaryChips as chip (chip)}
						<span class="status-bar-chip">{chip}</span>
					{/each}
				</span>
			{/if}
			<span class="status-bar-spacer"></span>
			<span class="status-bar-hint">/ filter · ? shortcuts · Esc exit</span>
		</footer>
	</section>

	<!-- DRAGGABLE DIVIDER -->
	<div
		class="divider-handle"
		role="separator"
		aria-orientation="vertical"
		aria-label="Resize task list and detail panels"
		aria-valuenow={Math.round(splitPercent)}
		aria-valuemin={MIN_SPLIT}
		aria-valuemax={MAX_SPLIT}
		tabindex={panelOpen ? 0 : -1}
		onpointerdown={handleDividerPointerDown}
		ondblclick={resetDivider}
		onkeydown={handleDividerKey}
		title="Drag to resize · Double-click to reset · ←/→ keyboard"
	></div>

	<!-- RIGHT: DETAIL PANEL -->
	<section class="detail-panel" aria-label="Task detail">
		{#if !panelOpen || !selectedTask}
			{#if tasks.length > 0}
				<div class="inbox-summary">
					<div class="inbox-summary-header">
						<span class="inbox-summary-title">INBOX</span>
						<span class="inbox-summary-total">{tasks.length} tasks</span>
					</div>
					<div class="inbox-summary-stats">
						{#each FETCH_STATUSES as s}
							{@const count = inboxSummary[s] ?? 0}
							{#if count > 0}
								<button
									class="inbox-stat-row"
									class:inbox-stat-submitted={s === "submitted"}
									onclick={() => { filterStatuses = [s]; }}
									title="Filter to {displayStatus(s)}"
									type="button"
								>
									<span class="inbox-stat-status">{displayStatus(s)}</span>
									<span class="inbox-stat-count">{count}</span>
									<span class="inbox-stat-bar" aria-hidden="true">
										<span
											class="inbox-stat-fill"
											style="width: {Math.round((count / tasks.length) * 100)}%"
										></span>
									</span>
									<span class="inbox-stat-desc">{STATUS_DESCRIPTIONS[s] ?? ""}</span>
								</button>
							{/if}
						{/each}
					</div>
					<div class="inbox-summary-shortcuts">
						<span>j/k <span class="inbox-shortcut-desc">navigate</span></span>
						<span>Enter <span class="inbox-shortcut-desc">open</span></span>
						<span>Space <span class="inbox-shortcut-desc">spawn</span></span>
						<span>/ <span class="inbox-shortcut-desc">filter</span></span>
						<span>? <span class="inbox-shortcut-desc">help</span></span>
					</div>
				</div>
			{:else}
				<div class="state-message state-muted">No tasks loaded.</div>
			{/if}
		{:else}
			<InboxDetail
				bind:this={detailRef}
				task={selectedTask}
				{currentUser}
				{currentUserEmail}
				{allAssignees}
				onEscapeCompose={handleEscapeCompose}
				onComposeFocus={() => (focusZone = "compose")}
				onSendAndRoute={handleSendAndRoute}
				onSendAndSpawn={handleSendAndSpawn}
				onTaskUpdated={handleTaskUpdated}
				onDismissed={handleTaskDismissed}
			/>
		{/if}
	</section>
</div>

<!-- Context Menu -->
{#if ctxTask}
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="ctx-menu"
	class:ctx-menu-hidden={!ctxVisible}
	style="left: {ctxX}px; top: {ctxY}px;"
	role="menu"
	tabindex="0"
	onclick={(e) => e.stopPropagation()}
	onkeydown={(e) => e.stopPropagation()}
>
	<!-- Launch -->
	<button class="ctx-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxPrioritySubmenuOpen = false; }} onclick={() => { const t = ctxTask!; ctxTask = null; ctxSpawnTask(t); }}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M12 2C12 2 8 6 8 12C8 15 9 17 10 18L10 21C10 21.5 10.5 22 11 22H13C13.5 22 14 21.5 14 21L14 18C15 17 16 15 16 12C16 6 12 2 12 2Z" />
			<circle cx="12" cy="10" r="2" />
		</svg>
		<span>Launch</span>
	</button>

	<!-- View Details -->
	<button class="ctx-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxPrioritySubmenuOpen = false; }} onclick={() => { const t = ctxTask!; ctxViewDetails(t); }}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
			<circle cx="12" cy="12" r="3" />
		</svg>
		<span>View Details</span>
	</button>

	<div class="ctx-divider"></div>

	<!-- Change Status (submenu) -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="ctx-submenu-container"
		onmouseenter={() => { ctxStatusSubmenuOpen = true; ctxPrioritySubmenuOpen = false; }}
		onmouseleave={() => { ctxStatusSubmenuOpen = false; }}
	>
		<button class="ctx-item ctx-item-has-submenu">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
				<polyline points="22 4 12 14.01 9 11.01" />
			</svg>
			<span>Change Status</span>
			<svg class="ctx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="9 18 15 12 9 6" />
			</svg>
		</button>
		{#if ctxStatusSubmenuOpen}
			<div class="ctx-submenu">
				{#each [
					{ value: 'submitted', label: 'Submitted', color: 'oklch(0.75 0.15 300)' },
					{ value: 'open', label: 'Open', color: 'oklch(0.70 0.15 200)' },
					{ value: 'in_progress', label: 'In Progress', color: 'oklch(0.75 0.15 85)' },
					{ value: 'waiting', label: 'Waiting', color: 'oklch(0.70 0.12 250)' },
					{ value: 'blocked', label: 'Blocked', color: 'oklch(0.70 0.20 25)' },
					{ value: 'closed', label: 'Closed', color: 'oklch(0.55 0.03 250)' },
				] as s}
					<button
						class="ctx-item {ctxTask!.status === s.value ? 'ctx-item-active' : ''}"
						onclick={() => ctxChangeStatus(ctxTask!.id, s.value)}
					>
						<span class="ctx-dot" style="background: {s.color};"></span>
						<span>{s.label}</span>
						{#if ctxTask!.status === s.value}
							<svg class="ctx-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
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
		class="ctx-submenu-container"
		onmouseenter={() => { ctxPrioritySubmenuOpen = true; ctxStatusSubmenuOpen = false; }}
		onmouseleave={() => { ctxPrioritySubmenuOpen = false; }}
	>
		<button class="ctx-item ctx-item-has-submenu">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M3 3v18h18" /><path d="m7 16 4-8 4 4 4-6" />
			</svg>
			<span>Change Priority</span>
			<svg class="ctx-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="9 18 15 12 9 6" />
			</svg>
		</button>
		{#if ctxPrioritySubmenuOpen}
			<div class="ctx-submenu">
				{#each [
					{ value: 0, label: 'P0 — Critical', color: 'oklch(0.70 0.20 25)' },
					{ value: 1, label: 'P1 — High', color: 'oklch(0.75 0.15 85)' },
					{ value: 2, label: 'P2 — Medium', color: 'oklch(0.70 0.15 200)' },
					{ value: 3, label: 'P3 — Low', color: 'oklch(0.55 0.03 250)' },
					{ value: 4, label: 'P4 — Lowest', color: 'oklch(0.45 0.01 250)' },
				] as pri}
					<button
						class="ctx-item {ctxTask!.priority === pri.value ? 'ctx-item-active' : ''}"
						onclick={() => ctxChangePriority(ctxTask!.id, pri.value)}
					>
						<span class="ctx-dot" style="background: {pri.color};"></span>
						<span>{pri.label}</span>
						{#if ctxTask!.priority === pri.value}
							<svg class="ctx-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<polyline points="20 6 9 17 4 12" />
							</svg>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="ctx-divider"></div>

	<!-- Duplicate -->
	<button class="ctx-item" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxPrioritySubmenuOpen = false; }} onclick={() => { const t = ctxTask!; ctxTask = null; ctxDuplicateTask(t); }}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
			<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
		</svg>
		<span>Duplicate</span>
	</button>

	<!-- Dismiss -->
	<button class="ctx-item ctx-item-danger" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxPrioritySubmenuOpen = false; }} onclick={() => { const t = ctxTask!; ctxTask = null; ctxDismissTask(t); }}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<circle cx="12" cy="12" r="10" />
			<line x1="15" y1="9" x2="9" y2="15" />
			<line x1="9" y1="9" x2="15" y2="15" />
		</svg>
		<span>Dismiss</span>
	</button>

	<!-- Delete -->
	<button class="ctx-item ctx-item-danger" onmouseenter={() => { ctxStatusSubmenuOpen = false; ctxPrioritySubmenuOpen = false; }} onclick={() => { const t = ctxTask!; ctxTask = null; ctxDeleteTask(t); }}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<polyline points="3 6 5 6 21 6" />
			<path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
			<path d="M10 11v6M14 11v6" />
			<path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
		</svg>
		<span>Delete</span>
	</button>
</div>
{/if}

<svelte:window onkeydown={handleWindowKeydown} />

<KeyboardShortcutsOverlay
	title="Inbox · Keyboard Shortcuts"
	sections={shortcutSections}
/>

<style>
	.inbox-layout {
		display: grid;
		height: 100%;
		min-height: 0;
		overflow: hidden;
		/* Note: grid-template-columns is intentionally not transitioned.
		   Browsers can't interpolate between mismatched track unit types
		   (1fr vs percentage+px), which freezes the computed layout. */
	}

	.inbox-layout.list-only {
		grid-template-columns: 1fr 0 0;
	}

	.inbox-layout.split {
		grid-template-columns: var(--split-left, 38%) 6px 1fr;
	}

	/* While dragging, prevent text selection and show the resize cursor everywhere. */
	.inbox-layout.resizing {
		cursor: col-resize;
		user-select: none;
	}

	/* Below 1280px: list takes full width, detail panel is hidden.
	   (Overlay drawer fallback for small screens lands in a later task.) */
	@media (max-width: 1279px) {
		.inbox-layout,
		.inbox-layout.split,
		.inbox-layout.list-only {
			grid-template-columns: 1fr;
		}
		.detail-panel,
		.divider-handle {
			display: none;
		}
	}

	.list-panel,
	.detail-panel {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		overflow: hidden;
	}

	.detail-panel {
		background: oklch(var(--b1, 0.14 0.01 250));
	}

	/* ---- Resizable divider ---- */

	.divider-handle {
		position: relative;
		cursor: col-resize;
		background: oklch(var(--b3, 0.22 0.02 250));
		transition: background 0.15s ease;
		touch-action: none;
	}

	/* Widened hit target without widening the visible line. */
	.divider-handle::before {
		content: "";
		position: absolute;
		inset: 0 -4px;
		z-index: 1;
	}

	.divider-handle:hover,
	.divider-handle:focus-visible,
	.inbox-layout.resizing .divider-handle {
		background: oklch(0.70 0.18 240 / 0.7);
	}

	.divider-handle:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px oklch(0.70 0.18 240 / 0.5);
	}

	.inbox-layout.list-only .divider-handle {
		display: none;
	}

	.panel-header {
		padding: 0.5rem 1rem 0.375rem;
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}

	.panel-title {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: oklch(0.70 0.18 240);
		opacity: 0.9;
		margin: 0;
	}

	.panel-count {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		font-size: 0.65rem;
		opacity: 0.35;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.02em;
	}

	/* ---- Filter bar ---- */

	.filter-bar {
		display: flex;
		flex-direction: column;
		/* Generous gap between filter rows — creates breathing room between
		 * distinct filter concepts (search+sort / filter chips / secondary). */
		gap: 0.5rem;
		padding: 0.2rem 1rem 0.65rem;
		border-bottom: 1px solid oklch(var(--b3, 0.22 0.02 250));
	}

	.filter-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		/* Tight within-row gap: groups feel anchored as a single composition.
		 * Rhythm comes from the row-level gap above, not from group-level gaps. */
		gap: 0.375rem 0.75rem;
		min-width: 0;
	}

	.filter-row-search {
		gap: 0.5rem;
	}

	.filter-search {
		/* Flex-shrinkable with a modest basis so Sort pills share the row on
		 * typical panel widths (~500px+). The input still grows to fill free
		 * space when available, just doesn't demand 18rem up front. */
		flex: 1 1 10rem;
		min-width: 8rem;
	}

	/* Sort chips on the search row render slightly de-emphasized because Sort
	 * is an arrange control, not a filter — visually receding keeps the eye
	 * on Status/Priority/Milestone as the primary narrowing tools. */
	.chip-group-inline-sort {
		opacity: 0.85;
	}
	.chip-group-inline-sort .chip-sort {
		font-size: 0.68rem;
	}

	.chip-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		padding: 0.1rem 0.5rem;
		font-size: 0.7rem;
		line-height: 1.2;
		border-radius: 999px;
		border: 1px solid oklch(0.30 0.02 250);
		background: transparent;
		color: inherit;
		cursor: pointer;
		opacity: 0.7;
		transition: background-color 0.1s ease, border-color 0.1s ease, color 0.1s ease, opacity 0.1s ease;
	}

	.chip:hover {
		opacity: 1;
		background: oklch(0.30 0.03 250 / 0.4);
	}

	/* Tactile press: cockpit button feel — short scale-down confirms the click. */
	.chip:active {
		transform: scale(0.90);
		transition: transform 0.07s ease-out;
	}

	.chip.active {
		background: oklch(0.70 0.18 240 / 0.18);
		border-color: oklch(0.70 0.18 240 / 0.7);
		color: oklch(0.92 0.05 240);
		opacity: 1;
	}

	.chip-priority.active {
		background: oklch(0.70 0.18 30 / 0.20);
		border-color: oklch(0.70 0.18 30 / 0.7);
		color: oklch(0.92 0.08 30);
	}

	.chip-type.active {
		background: oklch(0.65 0.15 145 / 0.18);
		border-color: oklch(0.65 0.15 145 / 0.7);
		color: oklch(0.90 0.10 145);
	}

	.chip-sort.active {
		background: oklch(0.65 0.18 280 / 0.20);
		border-color: oklch(0.65 0.18 280 / 0.7);
		color: oklch(0.90 0.10 280);
	}

	.chip-project.active {
		background: oklch(0.65 0.15 200 / 0.18);
		border-color: oklch(0.65 0.15 200 / 0.7);
		color: oklch(0.90 0.10 200);
	}

	.chip-milestone {
		/* Milestone chips use the same M{n} shorthand as the row badges, so they
		 * stay compact and the whole filter group fits on one line (usually).
		 * Tabular numbers keep M0..M9 aligned visually. */
		font-variant-numeric: tabular-nums;
		font-weight: 600;
		white-space: nowrap;
	}
	.chip-milestone.active {
		background: oklch(0.65 0.18 310 / 0.20);
		border-color: oklch(0.65 0.18 310 / 0.7);
		color: oklch(0.92 0.10 310);
	}
	.chip-milestone.milestone-done {
		/* De-emphasize paid/closed milestones so open ones lead the eye. */
		opacity: 0.45;
	}
	.chip-milestone.milestone-done.active {
		opacity: 0.9;
	}

	.filter-hint {
		font-size: 0.7rem;
		opacity: 0.55;
		padding: 0.1rem 0.2rem;
	}

	.chip-group-sort {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.filter-field {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.7rem;
		opacity: 0.85;
	}

	.filter-field-assignee {
		flex: 0 1 12rem;
		min-width: 6rem;
	}

	.filter-field-assignee .input {
		flex: 1 1 auto;
		min-width: 0;
	}

	.filter-label {
		font-size: 0.65rem;
		opacity: 0.55;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
		user-select: none;
	}

	/* ---- Task list ---- */

	.task-list {
		list-style: none;
		margin: 0;
		padding: 0;
		overflow-y: auto;
		flex: 1 1 auto;
	}

	.task-list:focus-visible {
		outline: none;
	}

	.task-row {
		display: grid;
		/* 8 columns for 8 children:
		 *   status-dot | task-id | priority | milestone | type | title (flex) | age | avatar
		 *
		 * The milestone column uses minmax(2.25rem, auto) so rows WITHOUT a
		 * milestone still reserve the slot — otherwise type/title/age shift
		 * left and rows lose vertical alignment. Matches the typical M{n}
		 * badge width (~36px). */
		grid-template-columns: auto auto auto minmax(2.25rem, auto) auto 1fr auto auto;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.5rem 1rem;
		background: transparent;
		border: 0;
		border-left: 3px solid transparent;
		cursor: pointer;
		text-align: left;
		font-size: 0.8125rem;
		color: inherit;
		transition: background-color 0.1s ease, border-left-color 0.15s ease;
	}

	.task-row:hover {
		background: oklch(0.22 0.02 250 / 0.5);
		border-left-color: oklch(0.70 0.18 240 / 0.22);
	}

	.task-row.selected {
		background: oklch(0.70 0.18 240 / 0.12);
		border-left-color: oklch(0.70 0.18 240);
	}

	.task-row:focus-visible {
		outline: 2px solid oklch(0.70 0.18 240);
		outline-offset: -2px;
	}

	/* Send+Route success flash — a brief green wash that fades back to normal.
	   Duration matches triggerFlash() in the script (900ms). */
	.task-row.route-flash {
		animation: inbox-route-flash 900ms ease-out forwards;
	}

	@keyframes inbox-route-flash {
		0% {
			background: oklch(0.65 0.20 145 / 0.35);
			border-left-color: oklch(0.70 0.22 145);
			box-shadow: inset 5px 0 14px oklch(0.70 0.22 145 / 0.30);
		}
		40% {
			box-shadow: inset 3px 0 8px oklch(0.70 0.22 145 / 0.15);
		}
		60% {
			background: oklch(0.65 0.20 145 / 0.15);
			border-left-color: oklch(0.70 0.22 145 / 0.7);
			box-shadow: none;
		}
		100% {
			background: transparent;
			border-left-color: transparent;
			box-shadow: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.task-row.route-flash {
			animation: none;
		}
	}

	.status-dot {
		width: 0.5rem;
		height: 0.5rem;
		padding: 0;
		border-radius: 999px;
		cursor: pointer;
		transition: width 0.15s ease, height 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0;
		line-height: 1;
		flex-shrink: 0;
		border: none;
		user-select: none;
	}

	/* Grow + ring hint on hover so users discover it's clickable */
	.task-row:hover .status-dot:not(.bulk-checked) {
		box-shadow: 0 0 0 2px oklch(0.70 0.18 240 / 0.25);
	}

	/* When any task is selected (selection mode), show rings on all unselected dots */
	.task-row.in-selection-mode .status-dot:not(.bulk-checked) {
		box-shadow: 0 0 0 1.5px oklch(0.70 0.18 240 / 0.20);
	}

	/* Selected: blue fill with checkmark */
	.status-dot.bulk-checked {
		width: 0.875rem !important;
		height: 0.875rem !important;
		background: oklch(0.70 0.18 240) !important;
		box-shadow: 0 0 0 2px oklch(0.70 0.18 240 / 0.35) !important;
		color: white;
		font-size: 0.55rem;
		animation: none !important;
	}

	/* Instrument warning light — submitted tasks need triage, so the dot
	 * pulses like a panel indicator demanding attention. badge-secondary is
	 * the class getTaskStatusBadge() returns for "submitted". */
	.status-dot.badge-secondary:not(.bulk-checked) {
		animation: submitted-warn 2.6s ease-in-out infinite;
	}

	@keyframes submitted-warn {
		0%, 100% { box-shadow: 0 0 0 0 oklch(0.65 0.18 310 / 0); }
		45%       { box-shadow: 0 0 0 3.5px oklch(0.65 0.18 310 / 0.35); }
	}

	@media (prefers-reduced-motion: reduce) {
		.status-dot.badge-secondary { animation: none; }
	}

	/* Bulk-selected row gets a teal-ish tint distinct from the nav-selected blue */
	.task-row.bulk-checked {
		background: oklch(0.70 0.18 240 / 0.10);
		border-left-color: oklch(0.70 0.18 240 / 0.6);
	}

	/* Epic picker modal */
	.bulk-epic-overlay {
		position: fixed;
		inset: 0;
		z-index: 60;
		background: oklch(0 0 0 / 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.bulk-epic-modal {
		background: oklch(0.16 0.015 250);
		border: 1px solid oklch(0.28 0.03 250);
		border-radius: 0.5rem;
		width: 28rem;
		max-width: calc(100vw - 2rem);
		max-height: 70vh;
		display: flex;
		flex-direction: column;
		box-shadow: 0 8px 32px oklch(0 0 0 / 0.5);
		overflow: hidden;
	}

	.bulk-epic-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid oklch(0.24 0.02 250);
		font-size: 0.8125rem;
		font-weight: 600;
		color: oklch(0.85 0.04 250);
	}

	.bulk-epic-close {
		background: none;
		border: none;
		cursor: pointer;
		color: oklch(0.55 0.04 250);
		font-size: 1.1rem;
		line-height: 1;
		padding: 0.1rem 0.3rem;
		border-radius: 0.25rem;
	}
	.bulk-epic-close:hover { background: oklch(0.22 0.02 250); color: oklch(0.80 0.04 250); }

	.bulk-epic-list {
		overflow-y: auto;
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.bulk-epic-empty {
		padding: 1rem;
		text-align: center;
		color: oklch(0.50 0.04 250);
		font-size: 0.8125rem;
	}

	.bulk-epic-row {
		display: flex;
		align-items: baseline;
		gap: 0.625rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		background: none;
		border: 1px solid transparent;
		cursor: pointer;
		text-align: left;
		transition: background 0.1s ease, border-color 0.1s ease;
		width: 100%;
	}

	.bulk-epic-row:hover:not(:disabled) {
		background: oklch(0.22 0.02 250);
		border-color: oklch(0.35 0.08 240 / 0.5);
	}

	.bulk-epic-row:disabled { opacity: 0.5; cursor: default; }

	.bulk-epic-row-id {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		font-size: 0.7rem;
		color: oklch(0.55 0.08 240);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.bulk-epic-row-title {
		font-size: 0.8125rem;
		color: oklch(0.82 0.04 250);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.task-id {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		font-size: 0.75rem;
		opacity: 0.7;
		white-space: nowrap;
	}

	.priority-badge,
	.type-badge,
	.milestone-badge {
		white-space: nowrap;
	}

	/* Milestone badge (M0, M1, M2 …) — deliberately echoes the priority badge's
	 * dimensions so the row reads as two siblings (P1 M2 · feature · title).
	 * Color matches the milestone filter chip (purple-ish) so the row badge
	 * and filter chip are visually linked. */
	.milestone-badge {
		background: oklch(0.65 0.18 310 / 0.22);
		border: 1px solid oklch(0.65 0.18 310 / 0.5);
		color: oklch(0.92 0.10 310);
		font-weight: 600;
	}
	.milestone-badge.milestone-badge-done {
		/* Past milestones (paid/closed) fade so open work leads the eye. */
		opacity: 0.55;
	}

	.task-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Content lift on hover — title brightens as you approach it. */
	.task-row:hover .task-title {
		color: oklch(0.98 0.02 250);
		transition: color 0.1s ease;
	}

	.task-age {
		font-size: 0.7rem;
		opacity: 0.55;
		white-space: nowrap;
	}

	.creator-avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 50%;
		font-size: 0.55rem;
		font-weight: 700;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		white-space: nowrap;
		flex-shrink: 0;
		letter-spacing: -0.02em;
	}

	.creator-avatar-empty {
		width: 1.25rem;
		height: 1.25rem;
	}

	/* ---- Status bar ---- */

	.status-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.3rem 1rem;
		border-top: 1px solid oklch(var(--b3, 0.22 0.02 250));
		font-size: 0.7rem;
		opacity: 0.75;
	}

	.status-bar-count {
		font-variant-numeric: tabular-nums;
		opacity: 0.65;
	}

	.status-bar-position {
		font-variant-numeric: tabular-nums;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		font-size: 0.7rem;
		color: oklch(0.85 0.08 240);
		padding: 0.05rem 0.4rem;
		border-radius: 0.25rem;
		background: oklch(0.70 0.18 240 / 0.10);
		border: 1px solid oklch(0.70 0.18 240 / 0.25);
	}

	.status-bar-position.status-bar-empty {
		color: oklch(0.65 0.02 250);
		background: transparent;
		border-color: oklch(0.30 0.02 250);
	}

	.status-bar-filter-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		min-width: 0;
		overflow: hidden;
	}

	.status-bar-chip {
		padding: 0.05rem 0.4rem;
		border-radius: 999px;
		background: oklch(0.70 0.18 240 / 0.15);
		color: oklch(0.90 0.05 240);
		font-size: 0.65rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		white-space: nowrap;
		border: 1px solid oklch(0.70 0.18 240 / 0.3);
	}

	.status-bar-spacer {
		flex: 1;
	}

	.status-bar-hint {
		opacity: 0.6;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		font-size: 0.65rem;
	}

	.state-message {
		padding: 2rem;
		text-align: center;
		font-size: 0.875rem;
		opacity: 0.75;
	}

	.state-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.state-message.state-muted {
		opacity: 0.5;
	}

	.state-error {
		color: oklch(0.70 0.18 25);
	}

	.state-error .btn {
		margin-top: 0.75rem;
	}

	.inbox-zero {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
	}

	.inbox-zero-check {
		font-size: 1.5rem;
		line-height: 1;
		color: oklch(0.70 0.22 145);
		animation: inbox-zero-arrive 0.45s cubic-bezier(0.25, 1, 0.5, 1) both;
	}

	.inbox-zero-label {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: oklch(0.70 0.22 145);
		opacity: 0.65;
	}

	@keyframes inbox-zero-arrive {
		0%   { transform: scale(0.6); opacity: 0; }
		60%  { opacity: 1; }
		100% { transform: scale(1); opacity: 1; }
	}

	@media (prefers-reduced-motion: reduce) {
		.inbox-zero-check { animation: none; }
	}

	/* ---- Undo toast ---- */

	.undo-toast {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.3rem 1rem;
		background: oklch(0.75 0.15 85 / 0.10);
		border-top: 1px solid oklch(0.75 0.15 85 / 0.25);
		font-size: 0.72rem;
		gap: 0.75rem;
		overflow: hidden;
	}

	.undo-toast::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		height: 2px;
		background: oklch(0.75 0.15 85 / 0.7);
		animation: undo-countdown 4s linear forwards;
	}

	@keyframes undo-countdown {
		from { width: 100%; }
		to   { width: 0%; }
	}

	@media (prefers-reduced-motion: reduce) {
		.undo-toast::before { animation: none; width: 100%; }
	}

	.undo-message {
		opacity: 0.8;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		font-size: 0.68rem;
		color: oklch(0.85 0.12 85);
	}

	.undo-kbd {
		display: inline-block;
		padding: 0.05rem 0.3rem;
		font-size: 0.65rem;
		border: 1px solid oklch(0.75 0.15 85 / 0.4);
		border-radius: 0.2rem;
		background: oklch(0.75 0.15 85 / 0.12);
		font-family: inherit;
	}

	.undo-btn {
		padding: 0.1rem 0.55rem;
		font-size: 0.68rem;
		border: 1px solid oklch(0.75 0.15 85 / 0.45);
		border-radius: 0.25rem;
		background: oklch(0.75 0.15 85 / 0.15);
		color: oklch(0.88 0.15 85);
		cursor: pointer;
		transition: background 0.1s ease;
		white-space: nowrap;
	}

	.undo-btn:hover {
		background: oklch(0.75 0.15 85 / 0.28);
	}

	/* ---- Inbox summary (empty detail panel) ---- */

	.inbox-summary {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: 3rem 2rem 2rem;
		height: 100%;
		justify-content: flex-start;
	}

	.inbox-summary-header {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
	}

	.inbox-summary-title {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		color: oklch(0.70 0.18 240);
		opacity: 0.9;
	}

	.inbox-summary-total {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		font-size: 0.65rem;
		opacity: 0.4;
		letter-spacing: 0.04em;
	}

	.inbox-summary-stats {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.inbox-stat-row {
		display: grid;
		grid-template-columns: 7rem 2rem 1fr 8rem;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.35rem 0.5rem;
		background: transparent;
		border: 0;
		border-radius: 0.25rem;
		cursor: pointer;
		text-align: left;
		color: inherit;
		transition: background 0.1s ease;
	}

	.inbox-stat-row:hover {
		background: oklch(0.22 0.02 250 / 0.5);
	}

	.inbox-stat-status {
		font-size: 0.8rem;
		opacity: 0.75;
		text-transform: lowercase;
		letter-spacing: 0.01em;
	}

	.inbox-stat-submitted .inbox-stat-status {
		opacity: 1;
		color: oklch(0.85 0.12 85);
	}

	.inbox-stat-count {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		font-size: 0.875rem;
		font-weight: 600;
		opacity: 0.9;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.inbox-stat-submitted .inbox-stat-count {
		color: oklch(0.85 0.15 85);
	}

	.inbox-stat-bar {
		height: 3px;
		background: oklch(0.28 0.02 250);
		border-radius: 2px;
		overflow: hidden;
	}

	.inbox-stat-fill {
		display: block;
		height: 100%;
		background: oklch(0.55 0.08 240);
		border-radius: 2px;
		transition: width 0.3s ease;
	}

	.inbox-stat-submitted .inbox-stat-fill {
		background: oklch(0.70 0.15 85);
	}

	.inbox-stat-desc {
		font-size: 0.68rem;
		opacity: 0.35;
		letter-spacing: 0.03em;
	}

	.inbox-summary-shortcuts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 1.25rem;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		font-size: 0.65rem;
		opacity: 0.4;
	}

	.inbox-summary-shortcuts span {
		white-space: nowrap;
	}

	.inbox-shortcut-desc {
		opacity: 0.7;
		margin-left: 0.25rem;
	}

	/* ---- Context Menu ---- */

	.ctx-menu {
		position: fixed;
		z-index: 100;
		min-width: 180px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		padding: 0.375rem;
		box-shadow: 0 10px 30px oklch(0.05 0 0 / 0.5);
		animation: ctxMenuIn 0.1s ease;
		transform-origin: top left;
	}

	.ctx-menu-hidden {
		display: none;
	}

	@keyframes ctxMenuIn {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}

	.ctx-item {
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

	.ctx-item:hover {
		background: oklch(0.25 0.02 250);
	}

	.ctx-item svg {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		color: oklch(0.60 0.02 250);
	}

	.ctx-item:hover svg {
		color: oklch(0.75 0.02 250);
	}

	.ctx-item-danger:hover {
		background: oklch(0.55 0.15 30 / 0.2);
		color: oklch(0.75 0.18 30);
	}

	.ctx-item-danger:hover svg {
		color: oklch(0.70 0.18 30);
	}

	.ctx-divider {
		height: 1px;
		background: oklch(0.28 0.02 250);
		margin: 0.375rem 0;
	}

	.ctx-submenu-container {
		position: relative;
	}

	.ctx-submenu {
		position: absolute;
		left: 100%;
		top: 0;
		min-width: 150px;
		background: oklch(0.18 0.02 250);
		border: 1px solid oklch(0.28 0.02 250);
		border-radius: 0.5rem;
		padding: 0.375rem;
		box-shadow: 0 10px 30px oklch(0.05 0 0 / 0.5);
		animation: ctxMenuIn 0.1s ease;
		margin-left: 2px;
		transform-origin: top left;
	}

	.ctx-item-has-submenu {
		justify-content: flex-start;
	}

	.ctx-chevron {
		width: 12px !important;
		height: 12px !important;
		margin-left: auto;
		color: oklch(0.50 0.02 250) !important;
	}

	.ctx-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.ctx-item-active {
		color: oklch(0.85 0.02 250);
	}

	.ctx-check {
		width: 14px !important;
		height: 14px !important;
		margin-left: auto;
		color: oklch(0.70 0.15 145) !important;
	}
</style>
