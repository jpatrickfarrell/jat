---
argument-hint: [reason]
---

Pause current work without completing the task, releasing resources for other agents.

# Pause Current Work

**Use this command when:**
- You need to switch to urgent work without finishing current task
- Waiting for a blocker/dependency to clear
- Taking a break and want to cleanly release resources
- Task is partially complete but not ready to mark as done

**Different from `/complete stop`:**
- `/complete` = Task is DONE, marking complete in Beads
- `/pause` = Task is NOT done, releasing resources but task stays open

**Usage:**
- `/pause` - Pause with generic reason
- `/pause "waiting for API documentation"` - Pause with specific reason

---

Follow these steps in order:

1. **Verify current context:**
   - Check what task you're working on (from file reservations or last activity)
   - Identify active file reservations held by you
   - Check current git status (uncommitted changes)

2. **Prepare for pause:**
   - Determine if there are uncommitted changes that should be stashed
   - Draft a pause message explaining current state and next steps
   - Identify the reason for pausing (from `$1` or generic)

3. **Release resources:**
   - Release all file reservations held by you
   - If reservations were recently renewed, note that in pause message

4. **Update coordination systems:**
   - Send Agent Mail message to task thread with:
     - Current progress summary
     - Reason for pause (from `$1` parameter if provided)
     - What's left to do
     - Any blockers or context for next person
   - Update Beads task with note (via `bd update` if needed)
   - Update your agent's task_description to indicate paused state

5. **Save work state:**
   - If uncommitted changes exist, offer to stash them
   - Document current state in Agent Mail for easy resume later

6. **Report pause summary** to console (see format below)

---

## Output Format

After completing all steps above, format your final output using this template:

```
╔══════════════════════════════════════════════════════════════════════════╗
║                        ⏸️  PAUSE WORK PROTOCOL                           ║
║                                                                          ║
║                    🤖 Agent: [YOUR-AGENT-NAME]                           ║
╚══════════════════════════════════════════════════════════════════════════╝

📌 Task ID: [task-id]
📝 Title: [task title]
⏸️  Pause Reason: [reason from $1 or "Pausing work to switch context"]

┌─ WORK PROGRESS ────────────────────────────────────────────────────────┐
│                                                                        │
│  ✅ Completed:                                                         │
│     • [Accomplishment 1]                                               │
│     • [Accomplishment 2]                                               │
│                                                                        │
│  🔄 In Progress:                                                       │
│     • [What was being worked on when paused]                           │
│                                                                        │
│  📋 Remaining:                                                         │
│     • [Next step 1]                                                    │
│     • [Next step 2]                                                    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ FILES MODIFIED ───────────────────────────────────────────────────────┐
│                                                                        │
│  📄 [file1.ts] - [description of changes]                              │
│  📄 [file2.svelte] - [description of changes]                          │
│  💾 Git status: [X modified, Y staged, Z uncommitted]                  │
│  📦 Stash created: [yes/no - with stash name if yes]                   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ RESOURCES RELEASED ───────────────────────────────────────────────────┐
│                                                                        │
│  🔓 Released file reservations:                                        │
│     • [pattern1] (was reserved for X hours)                            │
│     • [pattern2] (was reserved for Y hours)                            │
│                                                                        │
│  📢 Agent Mail: Message sent to thread [thread-id]                     │
│  📊 Beads: Task remains open, note added                               │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ CONTEXT FOR RESUME ───────────────────────────────────────────────────┐
│                                                                        │
│  📝 Next person should:                                                │
│     1. [Step 1 - what to do first]                                     │
│     2. [Step 2 - what to do next]                                      │
│                                                                        │
│  ⚠️  Blockers/Notes:                                                   │
│     • [Important context or blocker 1]                                 │
│     • [Important context or blocker 2]                                 │
│                                                                        │
│  🔗 References:                                                        │
│     • Agent Mail thread: [thread-id]                                   │
│     • Beads task: [task-id]                                            │
│     • Git stash: [stash name/reference if created]                     │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║                      ⏸️✅ WORK PAUSED CLEANLY ⏸️✅                      ║
║                                                                          ║
║                       	📌 Task ID: [task-id]							║
║                       	⏸️  Paused: [reason]								║
║																			║
║ 	                     🤖 Agent: [YOUR-AGENT-NAME]    					║
║																			║
╚══════════════════════════════════════════════════════════════════════════╝

💡 To resume this work later:
   • Use `/resume [task-id]` to check state and continue
   • Check Agent Mail thread [thread-id] for context
   • Review git stash [if created] before resuming
```

---

## Best Practices

1. **Always leave clear context** - The next person (or you later) should understand:
   - What was accomplished
   - What was in progress
   - What needs to happen next
   - Any blockers or important decisions

2. **Clean git state** - Either:
   - Commit work in progress with WIP prefix: `git commit -m "WIP: [description]"`
   - Stash uncommitted changes: `git stash save "Paused: [task-id] - [description]"`
   - Document which approach was used

3. **Release all resources** - Don't hold onto file reservations you're not using
   - Other agents may need those files
   - Reservations should only be held during active work

4. **Update Agent Mail** - Send a message to the task thread
   - Helps with coordination
   - Creates audit trail
   - Provides context for `/resume`

5. **Keep task open in Beads** - Task status stays as-is (open/in-progress)
   - Only mark complete when task is actually done
   - Add note about pause if helpful

---

**IMPORTANT:**
- Pause is NOT the same as complete - task remains open
- Always release file reservations when pausing
- Leave detailed context for whoever resumes (might be you or another agent)
- Agent Mail message is required for coordination
