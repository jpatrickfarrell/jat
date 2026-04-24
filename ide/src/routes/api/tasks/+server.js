/**
 * Tasks API Route
 * Provides task data to the IDE
 */
import { json } from '@sveltejs/kit';
import { getTasks, getProjects, getTaskById, createTask, updateTask, getScheduledTasks } from '$lib/server/jat-tasks.js';
import { invalidateCache, singleFlight, cacheKey } from '$lib/server/cache.js';
import { _resetTaskCache } from '../../api/agents/+server.js';
import { getProjectPath } from '$lib/server/projectPaths.js';
import { emitEvent } from '$lib/utils/eventBus.server.js';
import { lookupIntegrations } from '$lib/server/integrationLookup.js';
import { resolveBackendForProject, getProjectConfig } from '../../../../../lib/projects-config.js';
import { buildTaskIdentity } from '$lib/server/task-identity.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const project = url.searchParams.get('project');
	const status = url.searchParams.get('status');
	const priority = url.searchParams.get('priority');
	const search = url.searchParams.get('search');
	const scheduled = url.searchParams.get('scheduled');
	const closedAfter = url.searchParams.get('closedAfter');
	const closedBefore = url.searchParams.get('closedBefore');
	const updatedAfter = url.searchParams.get('updatedAfter');
	const updatedBefore = url.searchParams.get('updatedBefore');

	// Pagination parameters
	const limit = url.searchParams.get('limit');
	const offset = url.searchParams.get('offset');
	const cursor = url.searchParams.get('cursor'); // For cursor-based pagination (task ID)

	const key = cacheKey('tasks', { project, status, priority, search, scheduled, closedAfter, closedBefore, updatedAfter, updatedBefore, limit, offset, cursor });

	// singleFlight: cache + deduplication. Tasks endpoint queries SQLite
	// across multiple projects — avoid redundant concurrent queries.
	const responseData = await singleFlight(key, async () => {
		// If ?scheduled=true, return only tasks with schedule_cron or next_run_at
		let tasks;

		// Detect graduated (postgres-backed) projects and route through the async backend.
		// resolveBackendForProject throws when backend_url is missing, so guard with try.
		let pgBackend = null;
		if (project) {
			try {
				const backendConfig = resolveBackendForProject(project);
				if (backendConfig.kind === 'postgres') {
					const { getBackendForProject } = await import('../../../../../lib/tasks-backend.js');
					pgBackend = await getBackendForProject(project);
				}
			} catch {
				// Not a postgres project or config error — fall through to SQLite
			}
		}

		if (pgBackend) {
			// Async postgres path for graduated projects
			try {
				if (scheduled === 'true') {
					tasks = await pgBackend.getScheduled({ projectName: project });
				} else {
					/** @type {import('../../../../../lib/tasks-backend.js').ListOptions} */
					const filters = { projectName: project };
					if (status) filters.status = status;
					if (priority !== null) filters.priority = parseInt(priority);
					if (closedAfter) filters.closedAfter = closedAfter;
					if (closedBefore) filters.closedBefore = closedBefore;
					if (updatedAfter) filters.updatedAfter = updatedAfter;
					if (updatedBefore) filters.updatedBefore = updatedBefore;
					tasks = await pgBackend.list(filters);
				}
			} catch (err) {
				console.warn(`[api/tasks] postgres backend "${project}" unavailable:`, err instanceof Error ? err.message : err);
				tasks = [];
			}
		} else if (scheduled === 'true') {
			tasks = getScheduledTasks({ projectName: project || undefined });
		} else {
			const filters = {};
			if (project) filters.projectName = project;
			if (status) filters.status = status;
			if (priority !== null) filters.priority = parseInt(priority);
			if (closedAfter) filters.closedAfter = closedAfter;
			if (closedBefore) filters.closedBefore = closedBefore;

			tasks = getTasks(filters);

			// Cross-project views (no `project` param) must also include tasks from
			// postgres-backed projects (meadow, headcount, flush, steelbridge, ...).
			// Otherwise /inbox and similar aggregators only see SQLite tasks.
			if (!project) {
				const { readProjectsConfig } = await import('../../../../../lib/projects-config.js');
				const cfg = readProjectsConfig();
				const pgProjectNames = Object.entries(cfg?.projects || {})
					.filter(([, entry]) => entry && entry.backend === 'postgres')
					.map(([name]) => name);

				if (pgProjectNames.length > 0) {
					const { getBackendForProject } = await import('../../../../../lib/tasks-backend.js');

					/** @type {import('../../../../../lib/tasks-backend.js').ListOptions} */
					const pgFilters = {};
					if (status) pgFilters.status = status;
					if (priority !== null) pgFilters.priority = parseInt(priority);
					if (closedAfter) pgFilters.closedAfter = closedAfter;
					if (closedBefore) pgFilters.closedBefore = closedBefore;
					if (updatedAfter) pgFilters.updatedAfter = updatedAfter;
					if (updatedBefore) pgFilters.updatedBefore = updatedBefore;

					const pgResults = await Promise.all(
						pgProjectNames.map(async (name) => {
							try {
								const backend = await getBackendForProject(name);
								return await backend.list({ ...pgFilters, projectName: name });
							} catch (err) {
								console.warn(`[api/tasks] postgres backend "${name}" failed:`, err instanceof Error ? err.message : err);
								return [];
							}
						})
					);

					for (const pgTasks of pgResults) {
						if (pgTasks.length > 0) tasks = tasks.concat(pgTasks);
					}
				}
			}
		}
		const projects = getProjects();

		// Apply search filter if provided
		if (search && search.trim()) {
			const searchLower = search.toLowerCase().trim();
			tasks = tasks.filter(task => {
				// Search in task ID (exact match to avoid parent matching all children,
				// e.g. searching "jat-abc" should not match "jat-abc.1", "jat-abc.2")
				if (task.id && task.id.toLowerCase() === searchLower) {
					return true;
				}
				// Search in title
				if (task.title && task.title.toLowerCase().includes(searchLower)) {
					return true;
				}
				// Search in description
				if (task.description && task.description.toLowerCase().includes(searchLower)) {
					return true;
				}
				// Search in labels
				if (task.labels && Array.isArray(task.labels)) {
					return task.labels.some(label =>
						label.toLowerCase().includes(searchLower)
					);
				}
				return false;
			});
		}

		// Store total count before pagination
		const totalCount = tasks.length;

		// Apply cursor-based pagination (skip to after the cursor task ID)
		if (cursor) {
			const cursorIndex = tasks.findIndex(t => t.id === cursor);
			if (cursorIndex !== -1) {
				tasks = tasks.slice(cursorIndex + 1);
			}
		}

		// Apply offset-based pagination
		if (offset) {
			const offsetNum = parseInt(offset);
			if (!isNaN(offsetNum) && offsetNum > 0) {
				tasks = tasks.slice(offsetNum);
			}
		}

		// Apply limit
		let hasMore = false;
		let nextCursor = null;
		if (limit) {
			const limitNum = parseInt(limit);
			if (!isNaN(limitNum) && limitNum > 0) {
				hasMore = tasks.length > limitNum;
				if (hasMore) {
					nextCursor = tasks[limitNum - 1]?.id;
				}
				tasks = tasks.slice(0, limitNum);
			}
		}

		// Enrich tasks with integration source info (from tasks.source column)
		const integrations = lookupIntegrations(tasks);
		if (Object.keys(integrations).length > 0) {
			tasks = tasks.map((/** @type {any} */ t) => integrations[t.id] ? { ...t, integration: integrations[t.id] } : t);
		}

		return {
			tasks,
			projects,
			count: tasks.length,
			totalCount,
			hasMore,
			nextCursor
		};
	}, 5000); // 5s TTL — SSE handles real-time updates; matches /api/work TTL

	return json(responseData);
}

/**
 * Create a new task
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ request }) {
	// Declare project outside try block so it's accessible in catch
	let project = null;

	try {
		// Parse request body
		const body = await request.json();
		// Extract project early so it's available in catch block for better error messages
		project = body.project ? body.project.trim() : null;

		// Validate required fields
		if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
			return json(
				{ error: true, message: 'Title is required and must be a non-empty string' },
				{ status: 400 }
			);
		}

		if (!body.type || typeof body.type !== 'string') {
			return json(
				{ error: true, message: 'Type is required (task, bug, feature, epic, chore)' },
				{ status: 400 }
			);
		}

		// Validate type is one of allowed values
		const validTypes = ['task', 'bug', 'feature', 'epic', 'chore'];
		if (!validTypes.includes(body.type)) {
			return json(
				{
					error: true,
					message: `Type must be one of: ${validTypes.join(', ')}. Got: ${body.type}`
				},
				{ status: 400 }
			);
		}

		// Validate priority if provided
		if (body.priority !== undefined && body.priority !== null) {
			const priority = parseInt(body.priority);
			if (isNaN(priority) || priority < 0 || priority > 4) {
				return json(
					{
						error: true,
						message: 'Priority must be 0-4 (P0=critical, P1=high, P2=medium, P3=low, P4=backlog)'
					},
					{ status: 400 }
				);
			}
		}

		// Validate description length
		if (body.description && typeof body.description === 'string' && body.description.length > 50_000) {
			return json(
				{
					error: true,
					message: `Description too long (${body.description.length} chars). Maximum is 50,000 characters.`
				},
				{ status: 400 }
			);
		}

		// Sanitize inputs
		const title = body.title.trim();
		const description = body.description ? body.description.trim() : '';
		const priority = body.priority !== undefined ? parseInt(body.priority) : 2; // Default to P2
		let type = body.type.trim().toLowerCase();

		// Get project path
		let projectPath = null;
		if (project) {
			const projectInfo = await getProjectPath(project);

			if (!projectInfo.exists) {
				return json(
					{
						error: true,
						message: `Project directory not found: ${projectInfo.path}. Either create the directory and run 'jt init', or add the project to ~/.config/jat/projects.json with the correct path.`,
						type: 'project_not_found'
					},
					{ status: 400 }
				);
			}

			projectPath = projectInfo.path;
		}

		// Resolve project path if not provided - use the IDE's parent directory
		if (!projectPath) {
			projectPath = process.cwd().replace(/\/ide$/, '');
		}

		// Build labels array
		let labels = [];
		if (body.labels && Array.isArray(body.labels) && body.labels.length > 0) {
			labels = body.labels
				.filter((/** @type {unknown} */ l) => typeof l === 'string' && /** @type {string} */ (l).trim())
				.map((/** @type {string} */ l) => l.trim());
		}

		// Build deps array
		let deps = [];
		if (body.deps && Array.isArray(body.deps) && body.deps.length > 0) {
			deps = body.deps
				.filter((/** @type {unknown} */ d) => typeof d === 'string' && /** @type {string} */ (d).trim())
				.map((/** @type {string} */ d) => d.trim());
		}

		// Build notes with review_override if provided
		let notes = body.notes && typeof body.notes === 'string' ? body.notes.trim() : '';
		if (body.review_override && (body.review_override === 'always_review' || body.review_override === 'always_auto')) {
			const overrideTag = `[REVIEW_OVERRIDE:${body.review_override}]`;
			notes = notes ? `${notes}\n${overrideTag}` : overrideTag;
		}

		// Build scheduling fields
		/** @type {Record<string, any>} */
		const schedulingFields = {};
		if (body.command && typeof body.command === 'string') {
			schedulingFields.command = body.command.trim();
		}
		if (body.agent_program && typeof body.agent_program === 'string') {
			schedulingFields.agent_program = body.agent_program.trim();
		}
		if (body.model && typeof body.model === 'string') {
			schedulingFields.model = body.model.trim();
		}
		if (body.schedule_cron && typeof body.schedule_cron === 'string') {
			schedulingFields.schedule_cron = body.schedule_cron.trim();
		}
		if (body.next_run_at && typeof body.next_run_at === 'string') {
			schedulingFields.next_run_at = body.next_run_at.trim();
		}
		if (body.due_date && typeof body.due_date === 'string') {
			schedulingFields.due_date = body.due_date.trim();
		}

		// Tasks with a cron schedule are automatically chores
		if (schedulingFields.schedule_cron) {
			type = 'chore';
		}

		// Route to Postgres backend for graduated projects
		let pgBackendForCreate = null;
		if (project) {
			try {
				const backendConfig = resolveBackendForProject(project);
				if (backendConfig.kind === 'postgres') {
					const { getBackendForProject } = await import('../../../../../lib/tasks-backend.js');
					pgBackendForCreate = await getBackendForProject(project);
				}
			} catch {
				// Not a postgres project — fall through to SQLite
			}
		}

		// Task identity (jat-9e5tc): accept creator/requester/approver as either
		// a string (legacy — email or agent name) or a structured TaskActor
		// object. Postgres stores JSONB; SQLite collapses to string aliases.
		/** @param {unknown} v */
		const toActor = (v) => {
			if (v == null) return null;
			if (typeof v === 'string') return v.trim() || null;
			if (typeof v === 'object') return v;
			return null;
		};
		/** @param {unknown} a */
		const actorToString = (a) => {
			if (!a) return null;
			if (typeof a === 'string') return a;
			/** @type {any} */
			const o = a;
			return o.email || o.agent || o.name || null;
		};
		const bodyCreator   = toActor(body.creator);
		const bodyRequester = toActor(body.requester);
		const bodyApprover  = toActor(body.approver);
		// Build default identity for when no actor fields are provided in body
		const defaultIdentity = buildTaskIdentity({ source: 'ide', userId: body.creator_id || undefined });
		const creator   = bodyCreator   ?? defaultIdentity.creator;
		const requester = (bodyRequester ?? bodyCreator) ?? defaultIdentity.requester;
		const approver  = (bodyApprover ?? bodyRequester ?? bodyCreator) ?? defaultIdentity.approver;
		const creator_id   = body.creator_id   || defaultIdentity.creator_id   || null;
		const requester_id = body.requester_id || defaultIdentity.requester_id || null;
		const approver_id  = body.approver_id  || defaultIdentity.approver_id  || null;
		const sqliteRequester = actorToString(approver) || actorToString(requester) || actorToString(creator);

		const assigneeValue = (typeof body.assignee === 'string' && body.assignee.trim()) ? body.assignee.trim() : null;

		const parentId = (body.parent_id && typeof body.parent_id === 'string') ? body.parent_id.trim() : null;

		/** @type {any} */
		const createdTask = pgBackendForCreate
			? await pgBackendForCreate.create({
				projectPath,
				title,
				description,
				type,
				priority,
				labels,
				deps,
				assignee: assigneeValue,
				creator,
				creator_id,
				requester,
				requester_id,
				approver,
				approver_id,
				notes,
				...(parentId ? { parent_id: parentId } : {}),
				...schedulingFields
			})
			: createTask({
				projectPath,
				title,
				description,
				type,
				priority,
				labels,
				deps,
				assignee: assigneeValue,
				requester: sqliteRequester,
				notes,
				...schedulingFields
			});

		// Invalidate caches so subsequent fetches get fresh data
		invalidateCache.tasks();
		invalidateCache.agents();
		_resetTaskCache();

		// Emit task_created event for workflow triggers
		try {
			emitEvent({
				type: 'task_created',
				source: 'task_api',
				data: {
					taskId: createdTask.id,
					title,
					type,
					priority,
					labels,
					project: project || undefined
				},
				project: project || undefined
			});
		} catch (e) {
			console.error('[tasks] Failed to emit task_created event:', e);
		}

		return json({
			success: true,
			task: createdTask,
			message: `Task ${createdTask.id} created successfully`
		}, { status: 201 });

	} catch (err) {
		console.error('Error creating task:', err);

		const errorObj = /** @type {{ message?: string }} */ (err);
		const message = errorObj.message || '';

		// Check for "no .jat/ database" error - project not initialized
		if (message.includes('No .jat/ database') || message.includes('Run initProject()')) {
			const projectName = project || 'this project';
			return json(
				{
					error: true,
					message: `Project "${projectName}" has not been initialized for task tracking. Run "jt init" in the project directory, or use the "Add Project" button on the Projects page.`,
					type: 'project_not_initialized',
					hint: `cd ~/code/${projectName} && jt init`
				},
				{ status: 400 }
			);
		}

		return json(
			{
				error: true,
				message: message || 'Internal server error creating task',
				type: 'server_error'
			},
			{ status: 500 }
		);
	}
}
