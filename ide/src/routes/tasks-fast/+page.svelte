<script lang="ts">
	import { onMount, tick } from "svelte";
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
	import TaskFastDetail from "$lib/components/tasks-fast/TaskFastDetail.svelte";
	import KeyboardShortcutsOverlay from "$lib/components/KeyboardShortcutsOverlay.svelte";
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
	let focusZone = $state<FocusZone>("list");

	let loading = $state(true);
	let error = $state<string | null>(null);

	// Task ID that should briefly flash green in the list after a successful route.
	// Send+route errors surface inside the compose box so the user sees them
	// right where they acted — no page-level banner needed.
	let flashTaskId = $state<string | null>(null);
	let flashTimer: ReturnType<typeof setTimeout> | null = null;

	let undoTask = $state<Task | null>(null);
	let undoTimer: ReturnType<typeof setTimeout> | null = null;
	const UNDO_MS = 4000;

	// Filter + sort state — hydrated from URL on mount.
	let filterStatuses = $state<Set<string>>(new Set(DEFAULT_STATUSES));
	let filterPriorities = $state<Set<number>>(new Set());
	let filterProject = $state<string>("");
	type SortBy = "priority" | "age" | "updated" | "status";
	let sortBy = $state<SortBy>("priority");
	let filterTypes = $state<Set<string>>(new Set());
	let filterAssignee = $state<string>("");
	let filterSearch = $state<string>("");
	let hydrated = $state(false);

	let currentUser = $state<string>("");

	let filterInputEl = $state<HTMLInputElement | null>(null);
	let listEl = $state<HTMLUListElement | null>(null);
	let detailRef = $state<{
		focusCompose: () => void;
		openAssign: () => void;
		openStatus: () => void;
		openPriority: () => void;
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
		const meName = currentUser.toLowerCase();
		const search = filterSearch.trim().toLowerCase();
		const assigneeRaw = filterAssignee.trim().toLowerCase();
		const assigneeMatch =
			assigneeRaw === "@me" && meName ? meName : assigneeRaw;

		const filtered = tasks.filter((t) => {
			if (filterStatuses.size > 0 && !filterStatuses.has(t.status)) {
				return false;
			}
			if (
				filterPriorities.size > 0 &&
				!filterPriorities.has(t.priority ?? -1)
			) {
				return false;
			}
			if (filterProject) {
				const p = t.project || getProjectFromTaskId(t.id) || "";
				if (p !== filterProject) return false;
			}
			if (
				filterTypes.size > 0 &&
				!filterTypes.has(t.issue_type ?? "task")
			) {
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
			return true;
		});

		const STATUS_ORDER: Record<string, number> = {
			submitted: 0, open: 1, in_progress: 2, waiting: 3,
		};

		filtered.sort((a, b) => {
			if (sortBy === "age") {
				return (a.created_at ?? "").localeCompare(b.created_at ?? "");
			}
			if (sortBy === "updated") {
				return (b.updated_at ?? "").localeCompare(a.updated_at ?? "");
			}
			if (sortBy === "status") {
				const sa = STATUS_ORDER[a.status] ?? 9;
				const sb = STATUS_ORDER[b.status] ?? 9;
				if (sa !== sb) return sa - sb;
				return (a.created_at ?? "").localeCompare(b.created_at ?? "");
			}
			// default: priority → age
			const pa = a.priority ?? 99, pb = b.priority ?? 99;
			if (pa !== pb) return pa - pb;
			return (a.created_at ?? "").localeCompare(b.created_at ?? "");
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
			filterStatuses.size === DEFAULT_STATUSES.size &&
			[...filterStatuses].every((s) => DEFAULT_STATUSES.has(s));
		return (
			!statusDefault ||
			filterPriorities.size > 0 ||
			filterProject !== "" ||
			filterTypes.size > 0 ||
			filterAssignee.trim() !== "" ||
			filterSearch.trim() !== "" ||
			sortBy !== "priority"
		);
	});

	// Compact human-readable list of which filters are non-default. Rendered as
	// chips in the status bar so the user always knows why their list is what
	// it is (jat-nm0nq.7 polish: "current filter summary").
	const filterSummaryChips = $derived.by<string[]>(() => {
		const chips: string[] = [];
		const statusDefault =
			filterStatuses.size === DEFAULT_STATUSES.size &&
			[...filterStatuses].every((s) => DEFAULT_STATUSES.has(s));
		if (!statusDefault) {
			chips.push(
				filterStatuses.size === 0
					? "status: none"
					: `status: ${[...filterStatuses].sort().map(displayStatus).join(",")}`,
			);
		}
		if (filterPriorities.size > 0) {
			chips.push(
				`priority: ${[...filterPriorities]
					.sort((a, b) => a - b)
					.map((p) => `P${p}`)
					.join(",")}`,
			);
		}
		if (filterProject) chips.push(`project: ${filterProject}`);
		if (filterTypes.size > 0) {
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
			title: "Detail",
			shortcuts: [
				{ key: "r / c", description: "Jump to compose box" },
				{ key: "a", description: "Open assign picker" },
				{ key: "s", description: "Open status picker" },
				{ key: "p", description: "Open priority picker" },
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
		const idx = tasks.findIndex((t) => t.id === patch.id);
		if (idx < 0) return;
		tasks[idx] = { ...tasks[idx], ...patch };
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
	// Called by TaskFastCompose *after* it has already posted the comment (if
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
			filterStatuses = new Set(DEFAULT_STATUSES);
		} else {
			filterStatuses = parseSet(statusRaw, FETCH_STATUSES);
		}
		filterPriorities = parsePrioritySet(searchParams.get("priority"));
		filterProject = searchParams.get("project") ?? "";
		filterTypes = parseSet(searchParams.get("type"), TYPE_OPTIONS);
		filterAssignee = searchParams.get("assignee") ?? "";
		const rawSort = searchParams.get("sort");
		sortBy = (["priority", "age", "updated", "status"].includes(rawSort ?? "") ? rawSort : "priority") as SortBy;
		filterSearch = searchParams.get("q") ?? "";
	}

	function buildSearchParams(): URLSearchParams {
		const sp = new URLSearchParams();

		// Only encode status when it diverges from the default set, so a clean URL
		// stays clean and shared URLs only carry user intent.
		const statusEqualsDefault =
			filterStatuses.size === DEFAULT_STATUSES.size &&
			[...filterStatuses].every((s) => DEFAULT_STATUSES.has(s));
		if (!statusEqualsDefault) {
			sp.set("status", [...filterStatuses].sort().join(","));
		}
		if (filterPriorities.size > 0) {
			sp.set(
				"priority",
				[...filterPriorities].sort((a, b) => a - b).join(","),
			);
		}
		if (filterProject) sp.set("project", filterProject);
		if (sortBy !== "priority") sp.set("sort", sortBy);
		if (filterTypes.size > 0) {
			sp.set("type", [...filterTypes].sort().join(","));
		}
		if (filterAssignee.trim()) sp.set("assignee", filterAssignee.trim());
		if (filterSearch.trim()) sp.set("q", filterSearch.trim());

		return sp;
	}

	// Sync filter state → URL after hydration. replaceState avoids piling each
	// keystroke onto history.
	$effect(() => {
		if (!hydrated || !browser) return;
		const next = buildSearchParams().toString();
		const current = $page.url.searchParams.toString();
		if (next === current) return;
		const target = next
			? `${$page.url.pathname}?${next}`
			: $page.url.pathname;
		goto(target, { replaceState: true, keepFocus: true, noScroll: true });
	});

	// ---- Filter toggle helpers ----

	function toggleSetItem<T>(set: Set<T>, item: T): Set<T> {
		const next = new Set(set);
		if (next.has(item)) next.delete(item);
		else next.add(item);
		return next;
	}

	function toggleStatus(s: string) {
		filterStatuses = toggleSetItem(filterStatuses, s);
	}
	function togglePriority(p: number) {
		filterPriorities = toggleSetItem(filterPriorities, p);
	}
	function toggleType(t: string) {
		filterTypes = toggleSetItem(filterTypes, t);
	}

	function clearAllFilters() {
		filterStatuses = new Set(DEFAULT_STATUSES);
		filterPriorities = new Set();
		filterProject = "";
		filterTypes = new Set();
		filterAssignee = "";
		filterSearch = "";
		sortBy = "priority";
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

	// ---- Mount ----

	onMount(() => {
		hydrateFromUrl($page.url.searchParams);
		hydrated = true;

		// Best-effort identity for @me resolution; failure is silent.
		fetch("/api/config/user")
			.then((r) => (r.ok ? r.json() : null))
			.then((data) => {
				if (data?.name) currentUser = data.name;
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
	class="tasks-fast-layout"
	class:split={panelOpen}
	class:list-only={!panelOpen}
>
	<!-- LEFT: TASK LIST -->
	<section class="list-panel" aria-label="Task list">
		<header class="panel-header">
			<h1 class="panel-title">Inbox</h1>
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
						{@const active = filterStatuses.has(status)}
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
						{@const active = filterPriorities.has(p)}
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
						{@const active = filterTypes.has(type)}
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

				<div class="chip-group chip-group-sort" aria-label="Sort by">
					<span class="filter-label">Sort</span>
					{#each ([["priority","Priority"],["age","Age ↑"],["updated","Updated"],["status","Status"]] as const) as [val, label]}
						<button
							type="button"
							class="chip chip-sort"
							class:active={sortBy === val}
							onclick={() => sortBy = val}
							aria-pressed={sortBy === val}
						>{label}</button>
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
			<div class="state-message">
				Your inbox is empty.
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
					<li>
						<button
							type="button"
							class="task-row"
							class:selected={isSelected}
							class:route-flash={isFlashing}
							role="option"
							aria-selected={isSelected}
							data-nav-id={task.id}
							onclick={() => selectTask(idx)}
						>
							<span
								class="status-dot badge badge-xs {getTaskStatusBadge(
									task.status,
								)}"
								aria-hidden="true"
							></span>
							<span class="task-id">{task.id}</span>
							<span
								class="priority-badge badge badge-sm {getPriorityBadge(
									task.priority,
								)}"
							>
								P{task.priority ?? "?"}
							</span>
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
						</button>
					</li>
				{/each}
			</ul>
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
									onclick={() => { filterStatuses = new Set([s]); }}
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
			<TaskFastDetail
				bind:this={detailRef}
				task={selectedTask}
				{currentUser}
				{allAssignees}
				onEscapeCompose={handleEscapeCompose}
				onComposeFocus={() => (focusZone = "compose")}
				onSendAndRoute={handleSendAndRoute}
				onTaskUpdated={handleTaskUpdated}
				onDismissed={handleTaskDismissed}
			/>
		{/if}
	</section>
</div>

<svelte:window onkeydown={handleWindowKeydown} />

<KeyboardShortcutsOverlay
	title="Inbox · Keyboard Shortcuts"
	sections={shortcutSections}
/>

<style>
	.tasks-fast-layout {
		display: grid;
		height: 100%;
		min-height: 0;
		overflow: hidden;
		/* Enter/exit transition covers task jat-nm0nq.7 polish — defined here so
		   later animation work can just tune easing/duration. */
		transition: grid-template-columns 200ms
			cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.tasks-fast-layout.list-only {
		grid-template-columns: 1fr 0px;
	}

	.tasks-fast-layout.split {
		grid-template-columns: 38fr 62fr;
	}

	/* Below 1280px: list takes full width, detail panel is hidden.
	   (Overlay drawer fallback for small screens lands in a later task.) */
	@media (max-width: 1279px) {
		.tasks-fast-layout,
		.tasks-fast-layout.split,
		.tasks-fast-layout.list-only {
			grid-template-columns: 1fr;
		}
		.detail-panel {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tasks-fast-layout {
			transition: none;
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

	.list-panel {
		border-right: 1px solid oklch(var(--b3, 0.22 0.02 250));
	}

	.detail-panel {
		background: oklch(var(--b1, 0.14 0.01 250));
	}

	.panel-header {
		padding: 0.75rem 1rem 0.5rem;
	}

	.panel-title {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
	}

	/* ---- Filter bar ---- */

	.filter-bar {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding: 0 1rem 0.6rem;
		border-bottom: 1px solid oklch(var(--b3, 0.22 0.02 250));
	}

	.filter-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
		min-width: 0;
	}

	.filter-row-chips {
		gap: 0.4rem 1rem;
	}

	.filter-row-secondary {
		gap: 0.4rem 0.75rem;
	}

	.filter-row-search {
		gap: 0.5rem;
	}

	.filter-search {
		flex: 1 1 auto;
		min-width: 8rem;
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
		transition: all 0.1s ease;
	}

	.chip:hover {
		opacity: 1;
		background: oklch(0.30 0.03 250 / 0.4);
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
		grid-template-columns: auto auto auto auto 1fr auto;
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
		transition: background-color 0.1s ease;
	}

	.task-row:hover {
		background: oklch(0.22 0.02 250 / 0.5);
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
		animation: tasks-fast-route-flash 900ms ease-out forwards;
	}

	@keyframes tasks-fast-route-flash {
		0% {
			background: oklch(0.65 0.20 145 / 0.35);
			border-left-color: oklch(0.70 0.22 145);
		}
		60% {
			background: oklch(0.65 0.20 145 / 0.15);
			border-left-color: oklch(0.70 0.22 145 / 0.7);
		}
		100% {
			background: transparent;
			border-left-color: transparent;
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
	}

	.task-id {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
		font-size: 0.75rem;
		opacity: 0.7;
		white-space: nowrap;
	}

	.priority-badge,
	.type-badge {
		white-space: nowrap;
	}

	.task-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.task-age {
		font-size: 0.7rem;
		opacity: 0.55;
		white-space: nowrap;
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
</style>
