---
argument-hint: AgentName taskId
---

# /jat:spawn - IDE-Spawned Agent Startup

**Minimal startup for agents spawned by the IDE.**

---

## What's Already Done

| Step | Who Does It |
|------|-------------|
| Generate agent name | Spawn API |
| Register in Agent Registry | Spawn API |
| Create tmux session `jat-{Agent}` | Spawn API |
| Assign task | Spawn API |
| Write `.tmux-agent-{session}` file | Spawn API |
| Write `.claude/sessions/agent-{sessionId}.txt` | SessionStart hook |

**You receive arguments:** `ARGUMENTS: AgentName taskId` (e.g., `ARGUMENTS: WindyRiver jat-abc123`)

---

## Steps

### 1. Emit Starting Signal

Use the agent name and task ID from your arguments:

```bash
jat-signal starting '{"agentName":"WindyRiver","sessionId":"...","taskId":"jat-abc123","project":"jat","model":"claude-opus-4-5-20251101","gitBranch":"master","gitStatus":"clean","tools":[],"uncommittedFiles":[]}'
```

Get session ID with: `get-current-session-id` (or check `/tmp/claude-session-*.txt`)

### 2. Read Task, Comments & Plan

```bash
jt show jat-abc123 --json
```

**Scan `.comments[]` as well as `.description`.** Devs direct agents through comments on the task, not by editing the description (see `ide/docs/inbox-design.md` — "Comments as Input Pattern"). In particular, look for recent comments with `metadata.external == false` — these are internal dev-to-agent notes that should shape your approach.

Example: if a dev left "Agent: use approach X, also check file Y" as an internal comment during `/inbox` triage, that's the direction you need — not just the reporter's original description.

### 3. Emit Working Signal & Begin

```bash
jat-signal working '{"taskId":"jat-abc123","taskTitle":"...","approach":"..."}'
```

Then output banner and work:

```
╔════════════════════════════════════════════════════════════════════╗
║         🚀 STARTING WORK: jat-abc123                               ║
╚════════════════════════════════════════════════════════════════════╝

✅ Agent: WindyRiver
📋 Task: {title from jt show}

┌─ APPROACH ─────────────────────────────────────────────────────────┐
│  {your approach}                                                   │
└────────────────────────────────────────────────────────────────────┘
```

---

## When Done

Emit `review` signal, then run `/jat:complete` when user approves.
