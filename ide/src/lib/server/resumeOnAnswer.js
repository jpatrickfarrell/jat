/**
 * Resume trigger for `comment_type === 'answer'` on task comment threads.
 *
 * Given a task that just received an answer, finds the most recent open
 * question comment (written by `jat-signal waiting`), resumes the original
 * Claude Code session via `claude -r {session_id}` inside a fresh tmux
 * session, and injects the Q/A prompt so the agent continues work.
 *
 * On failure (session expired, tmux error), the task is flipped to `open`
 * so another agent can pick it up.
 *
 * Fire-and-forget: callers should not await this.
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync, readFileSync } from 'node:fs';
import Database from 'better-sqlite3';
import { SqliteTaskBackend } from '../../../../lib/tasks-sqlite.js';

const execAsync = promisify(exec);

const AGENT_MAIL_DB_PATH = process.env.AGENT_MAIL_DB || `${process.env.HOME}/.agent-mail.db`;

function shellEscape(s) {
	return `'${String(s).replace(/'/g, `'\\''`)}'`;
}

function getAgentProjectFromDb(agentName) {
	if (!existsSync(AGENT_MAIL_DB_PATH)) return null;
	try {
		const db = new Database(AGENT_MAIL_DB_PATH, { readonly: true });
		const row = db.prepare(
			`SELECT p.human_key AS project
			 FROM agents a JOIN projects p ON a.project_id = p.id
			 WHERE a.name = ?`
		).get(agentName);
		db.close();
		return row?.project || null;
	} catch {
		return null;
	}
}

function getClaudeFlags() {
	const configPath = `${process.env.HOME}/.config/jat/projects.json`;
	if (!existsSync(configPath)) return '';
	try {
		const config = JSON.parse(readFileSync(configPath, 'utf-8'));
		let flags = config.defaults?.claude_flags || '';
		if (config.defaults?.skip_permissions) {
			flags = (flags + ' --dangerously-skip-permissions').trim();
		}
		return flags;
	} catch {
		return '';
	}
}

/**
 * @param {string} taskId
 * @param {string} answerText
 */
export async function triggerResumeOnAnswer(taskId, answerText) {
	const sqlite = new SqliteTaskBackend();
	let question;
	try {
		question = sqlite.findOpenQuestion(taskId);
	} catch (err) {
		console.error('[resume-on-answer] findOpenQuestion failed:', err);
		return;
	}

	// Human thread comment (session_id null) or no open question — nothing to resume.
	if (!question || !question.session_id) return;

	const sessionId = question.session_id;
	const agentName = question.author;
	const questionText = question.text || '';

	if (!agentName) {
		console.warn(`[resume-on-answer] no author on question comment for ${taskId}`);
		return;
	}

	const projectPath = getAgentProjectFromDb(agentName);
	if (!projectPath || !existsSync(projectPath)) {
		console.warn(`[resume-on-answer] could not locate project path for agent ${agentName}`);
		try {
			sqlite.update(taskId, { status: 'open' });
		} catch {}
		return;
	}

	const sessionName = `jat-${agentName}`;
	const claudeFlags = getClaudeFlags();
	const prompt =
		`You asked: ${questionText}\n\nThe answer is: ${answerText}\n\nContinue working.`;

	// Kill any stale session, then spawn detached tmux running `claude -r <id>`.
	// Width/height matter — Claude Code's TUI breaks on tiny terminals.
	const killCmd = `tmux kill-session -t ${shellEscape(sessionName)} 2>/dev/null || true`;
	const createCmd =
		`tmux new-session -d -s ${shellEscape(sessionName)} -x 200 -y 50 ` +
		`-c ${shellEscape(projectPath)} ` +
		`"claude ${claudeFlags} -r ${shellEscape(sessionId)}"`;

	try {
		await execAsync(killCmd);
		await execAsync(createCmd);
	} catch (err) {
		console.error(`[resume-on-answer] failed to spawn tmux session for ${agentName}:`, err);
		try {
			sqlite.update(taskId, { status: 'open' });
		} catch {}
		return;
	}

	// Verify session exists — if `claude -r` failed immediately (bad session_id),
	// tmux session may have died before we can inject keys.
	try {
		await execAsync(`tmux has-session -t ${shellEscape(sessionName)}`);
	} catch {
		console.error(`[resume-on-answer] tmux session died after spawn (session_id likely expired)`);
		try {
			sqlite.update(taskId, { status: 'open' });
		} catch {}
		return;
	}

	// Mark task as back in progress before we inject (so IDE shows state correctly).
	try {
		sqlite.update(taskId, { status: 'in_progress' });
	} catch (err) {
		console.warn(`[resume-on-answer] failed to update task status:`, err);
	}

	// Wait for Claude TUI to boot, then inject the prompt.
	// Claude Code needs ~3-5s before it accepts input reliably.
	setTimeout(async () => {
		try {
			// send-keys with -l sends literally; follow with Enter.
			await execAsync(
				`tmux send-keys -t ${shellEscape(sessionName)} -l ${shellEscape(prompt)}`
			);
			await execAsync(`tmux send-keys -t ${shellEscape(sessionName)} Enter`);
			console.log(`[resume-on-answer] injected answer prompt for ${agentName} on ${taskId}`);
		} catch (err) {
			console.error(`[resume-on-answer] failed to inject prompt:`, err);
		}
	}, 5000);
}
