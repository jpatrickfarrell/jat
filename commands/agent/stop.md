---
argument-hint: [reason]
---

Smart stop command that analyzes your reason and automatically routes to pause, block, or handoff based on context.

# Stop Current Work (Smart Routing)

**This is THE command for stopping work - it intelligently determines whether you're pausing, blocked, or handing off based on your reason.**

**Usage:**
- `/stop` - Pause with generic reason
- `/stop "taking a break"` - Detected as PAUSE
- `/stop "waiting for API docs from BlueLake"` - Detected as BLOCK
- `/stop "needs frontend expertise, handoff to GreenOcean"` - Detected as HANDOFF

---

## How Smart Routing Works

The command analyzes your reason and automatically chooses the right stop type:

### PAUSE Detection
Voluntary stop, no specific blocker, might resume later.

**Trigger keywords:**
- "break", "lunch", "end of day", "switching context"
- "focusing on", "priorities changed"
- No agent name or dependency mentioned
- Generic/short reason

**What happens:**
- Releases file reservations
- Updates Agent Mail with progress
- Task stays open, assigned to you
- You can resume anytime with `/start [task-id]`

### BLOCK Detection
Can't proceed, specific blocker, waiting for something/someone.

**Trigger keywords:**
- "waiting for", "blocked by", "needs", "depends on"
- "can't proceed until", "requires", "pending"
- Mentions task ID or external dependency
- BUT NOT mentioning agent handoff

**What happens:**
- Marks task as BLOCKED in Beads
- Sends message to whoever can unblock (if agent named)
- Releases file reservations
- Documents unblock conditions
- You resume when blocker clears

### HANDOFF Detection
Transferring ownership to another agent.

**Trigger keywords:**
- "handoff to [Agent]", "transfer to [Agent]"
- "needs expertise from [Agent]"
- "[Agent] should handle", "better suited for [Agent]"
- Agent name mentioned + transfer intent

**What happens:**
- Sends comprehensive handoff package to target agent
- Releases file reservations
- Updates task assignment (if Beads supports)
- Target agent takes ownership
- You move to different work

---

## STEP 1: Parse and Route

**Analyze the reason parameter (`$1`):**

```typescript
function detectStopType(reason: string): 'pause' | 'block' | 'handoff' {
  const lowerReason = reason.toLowerCase()

  // HANDOFF detection (highest priority - most specific)
  const handoffPatterns = [
    /handoff to (\w+)/i,
    /transfer to (\w+)/i,
    /needs? (?:expertise|help) from (\w+)/i,
    /(\w+) should (?:handle|take|own)/i,
    /better suited for (\w+)/i
  ]

  for (const pattern of handoffPatterns) {
    const match = reason.match(pattern)
    if (match) {
      targetAgent = match[1]  // Extract agent name
      return 'handoff'
    }
  }

  // BLOCK detection (medium priority - specific blocker)
  const blockPatterns = [
    /waiting for/i,
    /blocked by/i,
    /needs? (?!expertise from)/i,  // "needs X" but not "needs expertise from Agent"
    /depends? on/i,
    /can't proceed/i,
    /requires?/i,
    /pending/i,
    /dirt-[a-z0-9]+/i  // Task ID mentioned
  ]

  if (blockPatterns.some(pattern => pattern.test(lowerReason))) {
    return 'block'
  }

  // PAUSE detection (default - everything else)
  return 'pause'
}
```

**Execute routing:**
1. Call `detectStopType($1)` to determine type
2. Extract any mentioned agent names or task IDs
3. Route to appropriate section below

---

## STEP 2A: PAUSE Path (Voluntary Stop)

**If detected as PAUSE, execute these steps:**

### 1. Document Progress

- Check current task from file reservations or activity
- Identify what's been completed
- Identify what was in progress
- Identify what remains to be done

### 2. Release Resources

- Release all file reservations held by you
- Note how long they were held (for reporting)

### 3. Save Work State

- Check git status for uncommitted changes
- If uncommitted:
  - Option A: Create WIP commit: `git commit -m "WIP: pausing [task-id]"`
  - Option B: Create stash: `git stash save "Paused: [task-id] - [reason]"`

### 4. Update Coordination

- Send Agent Mail to task thread:
  - Progress summary (completed, in-progress, remaining)
  - Reason for pause
  - Context for whoever resumes (might be you)
- Update your task_description to indicate paused

### 5. Output Summary

```
╔══════════════════════════════════════════════════════════════╗
║                  ⏸️  PAUSE WORK PROTOCOL                     ║
║                                                              ║
║                🤖 Agent: [YOUR-AGENT-NAME]                   ║
╚══════════════════════════════════════════════════════════════╝

📌 Task ID: [task-id]
📝 Title: [task title]
⏸️  Pause Reason: [reason]

┌─ WORK PROGRESS ──────────────────────────────────────────────┐
│                                                              │
│  ✅ Completed: [list items]                                  │
│  🔄 In Progress: [what was being worked on]                  │
│  📋 Remaining: [next steps]                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ RESOURCES RELEASED ─────────────────────────────────────────┐
│                                                              │
│  🔓 File reservations: [patterns released]                   │
│  📧 Agent Mail: Message sent to thread [thread-id]           │
│  💾 Git: [WIP commit / stash created / clean]                │
│                                                              │
└──────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════╗
║                ⏸️✅ WORK PAUSED CLEANLY ⏸️✅                  ║
║                                                              ║
║  📌 Task ID: [task-id]                                       ║
║  ⏸️  Reason: [reason]                                        ║
║                                                              ║
║  🤖 Agent: [YOUR-AGENT-NAME]                                 ║
╚══════════════════════════════════════════════════════════════╝

💡 To resume: /start [task-id]
```

---

## STEP 2B: BLOCK Path (Specific Blocker)

**If detected as BLOCK, execute these steps:**

### 1. Analyze the Blocker

- Extract blocker description from reason
- Determine blocker type:
  - Task dependency (another Beads task)
  - Agent dependency (waiting for specific agent)
  - External dependency (API docs, human decision)
  - Technical blocker (environment, tool, bug)
- Identify who/what can unblock
- Extract any task IDs or agent names mentioned

### 2. Update Beads

- Run: `bd update [task-id] --status blocked`
- Add note explaining blocker
- Link dependency task if mentioned

### 3. Coordinate with Unblocking Party

**If agent name mentioned in reason:**
- Send Agent Mail to that agent with `ack_required=true`
- Explain what you need and why you're blocked
- Ask for ETA if possible

**If task dependency:**
- Send message to agent(s) working on that task
- Explain your dependency

**If external/technical:**
- Send message to relevant team thread
- Document for visibility, escalate if urgent

### 4. Release Resources

- Release all file reservations
- Update task thread with status update

### 5. Output Summary

```
╔══════════════════════════════════════════════════════════════╗
║                 🚫 TASK BLOCKED PROTOCOL                     ║
║                                                              ║
║                🤖 Agent: [YOUR-AGENT-NAME]                   ║
╚══════════════════════════════════════════════════════════════╝

📌 Task ID: [task-id]
📝 Title: [task title]
🚫 Blocker: [reason]

┌─ BLOCKER DETAILS ────────────────────────────────────────────┐
│                                                              │
│  🚫 Type: [Task/Agent/External/Technical Dependency]         │
│  📋 What's Blocking: [detailed explanation]                  │
│  👤 Who Can Unblock: [agent/team/external party]             │
│  ⏰ Expected Timeline: [when might clear, or "Unknown"]      │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ COORDINATION ACTIONS ───────────────────────────────────────┐
│                                                              │
│  ✅ Beads: Status changed to BLOCKED                         │
│  📧 Messages Sent:                                           │
│     • To [unblocking agent]: Requesting unblock              │
│     • To task thread: Status update                          │
│  🔓 Resources Released: [X patterns]                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ UNBLOCK CONDITIONS ─────────────────────────────────────────┐
│                                                              │
│  This task will be unblocked when:                           │
│  1. [Specific condition]                                     │
│  2. [Specific condition]                                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════╗
║              🚫✅ TASK MARKED BLOCKED ✅🚫                    ║
║                                                              ║
║  📌 Task ID: [task-id]                                       ║
║  🚫 Blocker: [short description]                             ║
║                                                              ║
║  🤖 Agent: [YOUR-AGENT-NAME]                                 ║
╚══════════════════════════════════════════════════════════════╝

💡 What now:
   • Monitor Agent Mail for unblock notification
   • Use /start to pick up other work
   • Follow up if blocker persists
```

---

## STEP 2C: HANDOFF Path (Transfer Ownership)

**If detected as HANDOFF, execute these steps:**

### 1. Extract Target Agent

- Parse agent name from reason (already extracted in routing)
- Verify agent exists in project
- Check agent's current workload
- Verify agent is active (not stale)

### 2. Prepare Handoff Package

- Progress summary (completed, in-progress, remaining)
- Known blockers or dependencies
- Relevant files and their states
- Important decisions made
- Estimated time remaining

### 3. Handle Git State

- If uncommitted changes:
  - Commit as WIP: `git commit -m "WIP: [task-id] - handoff to [agent]"`
  - OR stash: `git stash save "Handoff to [agent]: [task-id]"`

### 4. Send Comprehensive Handoff

- Send Agent Mail to target agent with `ack_required=true`:
  - Task ID and description
  - Full progress summary
  - Reason for handoff
  - File patterns to reserve
  - Git state (branch, commit, stash)
  - Blockers and context
  - Time estimate
  - Coordination notes

### 5. Update Systems

- Add Beads note: "Handed off from [you] to [target]"
- Notify task thread participants of handoff
- Update your task_description (no longer on this)
- Release all file reservations (target will re-reserve)

### 6. Output Summary

```
╔══════════════════════════════════════════════════════════════╗
║                 🤝 WORK HANDOFF PROTOCOL                     ║
║                                                              ║
║       🤖 From: [YOUR-AGENT-NAME]                             ║
║       🤖 To: [TARGET-AGENT-NAME]                             ║
╚══════════════════════════════════════════════════════════════╝

📌 Task ID: [task-id]
📝 Title: [task title]
🔄 Handoff Reason: [reason]

┌─ WORK COMPLETED ─────────────────────────────────────────────┐
│                                                              │
│  ✅ Done: [accomplishments]                                  │
│  🔄 In Progress: [partial work]                              │
│  📋 Remaining: [next steps]                                  │
│  ⏱️  Est. Time Remaining: [estimate]                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ HANDOFF PACKAGE SENT ───────────────────────────────────────┐
│                                                              │
│  📧 To: [target-agent]                                       │
│  🔗 Thread: [thread-id]                                      │
│  💾 Git: Branch [name], [WIP commit/stash/clean]             │
│  🔒 Files to reserve: [patterns]                             │
│  ⚠️  Blockers: [list or "None"]                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════╗
║           🤝✅ HANDOFF COMPLETE ✅🤝                          ║
║                                                              ║
║  📌 Task ID: [task-id]                                       ║
║  👤 Now owned by: [target-agent]                             ║
║                                                              ║
║  🤖 From: [YOUR-AGENT-NAME]                                  ║
╚══════════════════════════════════════════════════════════════╝

💡 What now:
   • Use /start to pick up new work
   • Monitor for target agent's acknowledgement
   • Available to answer questions about handoff
```

---

## Examples of Smart Routing

### Example 1: Pause
```bash
/stop "taking a lunch break"
```
**Detected as:** PAUSE
**Why:** Mentions "break", no blocker or agent
**Result:** Releases resources, sends progress update, can resume later

### Example 2: Block (Task Dependency)
```bash
/stop "waiting for dirt-abc to complete, can't proceed with API integration until auth is done"
```
**Detected as:** BLOCK
**Why:** "waiting for" + task ID "dirt-abc"
**Result:** Marks blocked, messages agent working on dirt-abc, documents unblock condition

### Example 3: Block (Agent Dependency)
```bash
/stop "needs API design from BlueLake before implementation"
```
**Detected as:** BLOCK
**Why:** "needs" + agent name but no handoff intent
**Result:** Marks blocked, sends message to BlueLake with requirements, waits for design

### Example 4: Block (External)
```bash
/stop "pending product decision on modal vs sidebar UI"
```
**Detected as:** BLOCK
**Why:** "pending" + decision blocker
**Result:** Marks blocked, messages team thread, escalates if urgent

### Example 5: Handoff
```bash
/stop "needs frontend expertise, handoff to GreenOcean"
```
**Detected as:** HANDOFF
**Why:** "handoff to" + agent name
**Result:** Sends comprehensive package to GreenOcean, transfers ownership

### Example 6: Handoff (Implicit)
```bash
/stop "GreenOcean should handle this, better suited for CSS animations"
```
**Detected as:** HANDOFF
**Why:** "should handle" + agent name
**Result:** Transfers to GreenOcean with context

---

## Best Practices

### Writing Good Stop Reasons

**For Pause:**
- ✅ "taking a break"
- ✅ "end of day"
- ✅ "switching to higher priority work"
- ❌ "can't continue" (too vague - block or handoff?)

**For Block:**
- ✅ "waiting for API docs from external vendor"
- ✅ "blocked by dirt-abc, needs auth refactor first"
- ✅ "needs product decision on feature scope"
- ❌ "stuck" (too vague - why? who can help?)

**For Handoff:**
- ✅ "handoff to BlueLake, needs backend expertise"
- ✅ "GreenOcean should take this, better at CSS"
- ✅ "transfer to RedMountain for database work"
- ❌ "someone else should do this" (who?)

---

## When Smart Routing Might Be Ambiguous

If the reason is unclear, the command will:
1. Default to PAUSE (safest option)
2. Show detection reasoning in output
3. Suggest alternative if wrong type detected

**Example of ambiguous reason:**
```bash
/stop "need help"
```
**Detected as:** PAUSE (default)
**Output includes:**
```
⚠️  Ambiguous reason detected - defaulted to PAUSE
💡 If you meant to BLOCK, specify who can help:
   /stop "need help from BlueLake with database design"
💡 If you meant to HANDOFF, specify target:
   /stop "handoff to BlueLake for help"
```

---

**IMPORTANT:**
- This command replaces `/pause`, `/block`, and `/handoff`
- Smart routing based on reason keywords
- Always release resources when stopping
- Always update coordination systems (Beads, Agent Mail)
- Task stays assigned unless handoff detected
