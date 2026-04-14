/**
 * Context Provider Autocomplete Search API
 * GET /api/context-providers/search?provider=<type>&query=<search>&project=<name>
 *
 * Returns autocomplete suggestions for context providers.
 *
 * Providers:
 * - task: Search tasks by ID or title
 * - git: List available git subcommands
 * - memory: Search project memory entries
 * - url: No autocomplete (returns empty)
 */

import { json } from '@sveltejs/kit';
import { execFile } from 'child_process';
import type { RequestHandler } from './$types';
import { getProjectPath } from '$lib/server/projectPaths';
import { FORMULA_CATALOG } from '$lib/config/formulaCatalog';

interface ProviderResult {
	value: string;
	label: string;
	description?: string;
}

function execCommand(cmd: string, args: string[], cwd: string, timeoutMs = 10000): Promise<string> {
	return new Promise((resolve, reject) => {
		execFile(cmd, args, { cwd, timeout: timeoutMs, maxBuffer: 1024 * 1024 }, (err, stdout) => {
			if (err) reject(err);
			else resolve(stdout);
		});
	});
}

async function searchTasks(query: string, cwd: string): Promise<ProviderResult[]> {
	try {
		const stdout = await execCommand('jt', ['search', query, '--limit', '10', '--json'], cwd);
		const tasks = JSON.parse(stdout);
		return tasks.map((t: { id: string; title: string; status: string; priority: number }) => ({
			value: t.id,
			label: t.id,
			description: `[P${t.priority}] ${t.title} (${t.status})`
		}));
	} catch {
		// Fallback: list ready tasks if search fails
		try {
			const stdout = await execCommand('jt', ['list', '--status', 'open', '--json'], cwd);
			const tasks = JSON.parse(stdout);
			const filtered = query
				? tasks.filter((t: { id: string; title: string }) =>
					t.id.toLowerCase() === query.toLowerCase() ||
					t.title.toLowerCase().includes(query.toLowerCase())
				)
				: tasks;
			return filtered.slice(0, 10).map((t: { id: string; title: string; status: string; priority: number }) => ({
				value: t.id,
				label: t.id,
				description: `[P${t.priority}] ${t.title} (${t.status})`
			}));
		} catch {
			return [];
		}
	}
}

function getGitSubcommands(): ProviderResult[] {
	return [
		{ value: 'diff', label: 'diff', description: 'Staged + unstaged changes' },
		{ value: 'log', label: 'log', description: 'Recent commit messages (default: 10)' },
		{ value: 'log:5', label: 'log:5', description: 'Last 5 commits' },
		{ value: 'log:20', label: 'log:20', description: 'Last 20 commits' },
		{ value: 'branch', label: 'branch', description: 'Current branch name and status' }
	];
}

async function searchMemory(query: string, cwd: string): Promise<ProviderResult[]> {
	try {
		const searchQuery = query || '*';
		const stdout = await execCommand('jat-memory', ['search', searchQuery, '--limit', '10', '--json'], cwd, 15000);
		const results = JSON.parse(stdout);
		if (!Array.isArray(results)) return [];
		// Deduplicate by value (same taskId can appear in multiple sections)
		const seen = new Set<string>();
		return results
			.map((r: { taskId?: string; path?: string; section?: string; snippet?: string; score?: number }) => ({
				value: r.taskId || r.path || '',
				label: r.taskId || r.path || '',
				description: r.snippet ? r.snippet.slice(0, 80) : (r.section || '')
			}))
			.filter(r => {
				if (!r.value || seen.has(r.value)) return false;
				seen.add(r.value);
				return true;
			});
	} catch {
		return [];
	}
}

async function searchBases(query: string, project: string, origin: string): Promise<ProviderResult[]> {
	if (!project) return [];
	try {
		const res = await fetch(`${origin}/api/bases?project=${encodeURIComponent(project)}&includeGlobal=true`);
		const data = await res.json();
		const bases = Array.isArray(data.bases) ? data.bases : [];
		const q = query.toLowerCase();
		return bases
			.filter((b: { id: string; name: string }) =>
				!q || b.id.toLowerCase().includes(q) || (b.name || '').toLowerCase().includes(q)
			)
			.slice(0, 15)
			.map((b: { id: string; name: string; description?: string; source_type?: string }) => ({
				value: b.id,
				label: b.name || b.id,
				description: b.description || b.source_type || ''
			}));
	} catch {
		return [];
	}
}

async function searchCommands(query: string, origin: string): Promise<ProviderResult[]> {
	try {
		const res = await fetch(`${origin}/api/commands`);
		const data = await res.json();
		const commands = Array.isArray(data.commands) ? data.commands : [];
		const q = query.toLowerCase();
		return commands
			.filter((c: { name: string; invocation: string }) =>
				!q || c.name.toLowerCase().includes(q) || c.invocation.toLowerCase().includes(q)
			)
			.slice(0, 15)
			.map((c: { name: string; invocation: string; namespace?: string; frontmatter?: { argumentHint?: string } }) => ({
				value: c.invocation.replace(/^\//, ''),
				label: c.invocation,
				description: c.frontmatter?.argumentHint || c.namespace || ''
			}));
	} catch {
		return [];
	}
}

async function searchAgents(query: string, origin: string): Promise<ProviderResult[]> {
	try {
		const res = await fetch(`${origin}/api/agents`);
		const data = await res.json();
		const agents = Array.isArray(data.agents) ? data.agents : [];
		const q = query.toLowerCase();
		return agents
			.filter((a: { name: string }) => !q || a.name.toLowerCase().includes(q))
			.slice(0, 15)
			.map((a: { name: string; model?: string; program?: string; last_active_ts?: string }) => ({
				value: a.name,
				label: a.name,
				description: [a.program, a.model].filter(Boolean).join(' · ')
			}));
	} catch {
		return [];
	}
}

async function searchData(query: string, project: string, origin: string): Promise<ProviderResult[]> {
	if (!project) return [];
	try {
		const res = await fetch(`${origin}/api/data/tables?project=${encodeURIComponent(project)}`);
		const data = await res.json();
		const tables = Array.isArray(data.tables) ? data.tables : [];
		const views = Array.isArray(data.views) ? data.views : [];
		const q = query.toLowerCase();
		const tableResults: ProviderResult[] = tables
			.filter((t: { name: string; display_name?: string }) =>
				!q || t.name.toLowerCase().includes(q) || (t.display_name || '').toLowerCase().includes(q)
			)
			.map((t: { name: string; display_name?: string; row_count?: number; column_count?: number }) => ({
				value: t.name,
				label: t.display_name || t.name,
				description: `table · ${t.row_count ?? 0} rows × ${t.column_count ?? 0} cols`
			}));
		const viewResults: ProviderResult[] = views
			.filter((v: { id?: string | number; name?: string }) =>
				!q || (v.name || '').toLowerCase().includes(q)
			)
			.map((v: { id?: string | number; name?: string; table_name?: string }) => ({
				value: `view:${v.id}`,
				label: v.name || `view ${v.id}`,
				description: v.table_name ? `view on ${v.table_name}` : 'view'
			}));
		return [...tableResults, ...viewResults].slice(0, 15);
	} catch {
		return [];
	}
}

function searchFormulas(query: string): ProviderResult[] {
	const q = query.toLowerCase();
	const matches = q
		? FORMULA_CATALOG.filter(e =>
			e.name.includes(q) || e.category.toLowerCase().includes(q)
		)
		: FORMULA_CATALOG;
	return matches.slice(0, 20).map(e => ({
		value: e.name,
		label: e.signature,
		description: `${e.category} — ${e.description}`
	}));
}

export const GET: RequestHandler = async ({ url, request }) => {
	const provider = url.searchParams.get('provider') || '';
	const query = url.searchParams.get('query') || '';
	const projectName = url.searchParams.get('project') || '';
	const origin = new URL(request.url).origin;

	if (!provider) {
		return json({ error: 'Missing provider parameter' }, { status: 400 });
	}

	// Get project path for CLI commands
	let cwd = process.cwd().replace(/\/ide$/, '');
	if (projectName) {
		const projectInfo = await getProjectPath(projectName);
		if (projectInfo.exists) {
			cwd = projectInfo.path;
		}
	}

	let results: ProviderResult[] = [];

	switch (provider) {
		case 'task':
			results = await searchTasks(query, cwd);
			break;
		case 'git':
			results = getGitSubcommands().filter(cmd =>
				!query || cmd.value.toLowerCase().includes(query.toLowerCase())
			);
			break;
		case 'memory':
			results = await searchMemory(query, cwd);
			break;
		case 'url':
			// No autocomplete for URLs
			results = [];
			break;
		case 'fx':
			results = searchFormulas(query);
			break;
		case 'base':
			results = await searchBases(query, projectName, origin);
			break;
		case 'command':
			results = await searchCommands(query, origin);
			break;
		case 'agent':
			results = await searchAgents(query, origin);
			break;
		case 'data':
			results = await searchData(query, projectName, origin);
			break;
		default:
			return json({ error: `Unknown provider: ${provider}` }, { status: 400 });
	}

	return json({ provider, query, results });
};
