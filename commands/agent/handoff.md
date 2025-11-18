---
argument-hint: <target-agent> [reason]
---

Transfer current work to another agent with full context and coordination.

# Handoff Work to Another Agent

**Use this command when:**
- You're blocked on something only another agent can do
- Task requires expertise you don't have
- Load balancing - another agent has capacity
- You need to focus on higher priority work
- Task is better suited for a different agent's capabilities

**Different from `/pause`:**
- `/pause` = You might resume this later
- `/handoff` = Explicitly transferring ownership to someone else

**Usage:**
- `/handoff BlueLake` - Handoff to specific agent
- `/handoff BlueLake "needs frontend expertise"` - Handoff with reason

---

Follow these steps in order:

## PART 1: Prepare Handoff Package

1. **Verify current context:**
   - Identify current task from file reservations or activity
   - Check what work has been completed
   - Identify what remains to be done
   - Check git status for uncommitted changes

2. **Verify target agent:**
   - Check if target agent (`$1`) exists in project
   - Get target agent's current workload and active tasks
   - Verify target agent was recently active (not stale)
   - Check if target agent has relevant expertise (if known)

3. **Prepare comprehensive context:**
   - Progress summary (what's done, what's in progress)
   - Remaining work breakdown
   - Known blockers or dependencies
   - Relevant files and their states
   - Important decisions made so far
   - Links to documentation or references

4. **Handle uncommitted changes:**
   - If git has uncommitted changes, decide:
     - Commit as WIP: `git commit -m "WIP: [task-id] - handoff to [agent]"`
     - Create stash: `git stash save "Handoff to [agent]: [task-id]"`
   - Document which approach was used for target agent

## PART 2: Execute Handoff

5. **Release your resources:**
   - Release all file reservations held by you
   - Document which patterns were reserved (for target agent to re-reserve)

6. **Send comprehensive handoff message:**
   - Send Agent Mail to target agent with:
     - Task ID and full description
     - Progress summary (completed, in-progress, remaining)
     - Reason for handoff (from `$2` or inferred)
     - File patterns to reserve
     - Git state (commit hash, branch, stash info)
     - Blockers and important context
     - Your assessment of time remaining
     - Any coordination notes (who to talk to, dependencies, etc.)
   - Mark message as `ack_required=true` so target must acknowledge

7. **Update Beads task:**
   - Add note to task: "Handed off from [your-agent] to [target-agent]"
   - Optionally update assignee if Beads supports it

8. **Send coordination messages:**
   - If other agents are involved in this task's thread, notify them of handoff
   - Ensures everyone knows who's now responsible

9. **Update your agent state:**
   - Update your task_description to reflect you're no longer on this task
   - Clear from your current focus

10. **Report handoff summary** to console (see format below)

---

## Output Format

After completing all steps above, format your final output using this template:

```
╔══════════════════════════════════════════════════════════════════════════╗
║                      🤝 WORK HANDOFF PROTOCOL                            ║
║                                                                          ║
║                    🤖 From: [YOUR-AGENT-NAME]                            ║
║                    🤖 To: [TARGET-AGENT-NAME]                            ║
╚══════════════════════════════════════════════════════════════════════════╝

📌 Task ID: [task-id]
📝 Title: [task title]
🔄 Handoff Reason: [reason from $2 or "Transferring ownership"]

┌─ WORK COMPLETED ───────────────────────────────────────────────────────┐
│                                                                        │
│  ✅ Done:                                                              │
│     • [Accomplishment 1]                                               │
│     • [Accomplishment 2]                                               │
│     • [Accomplishment 3]                                               │
│                                                                        │
│  🔄 In Progress (partial):                                             │
│     • [What was being worked on]                                       │
│                                                                        │
│  📋 Remaining Work:                                                    │
│     • [Next step 1]                                                    │
│     • [Next step 2]                                                    │
│     • [Next step 3]                                                    │
│                                                                        │
│  ⏱️  Estimated Time Remaining: [estimate]                              │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ FILES & GIT STATE ────────────────────────────────────────────────────┐
│                                                                        │
│  📄 Modified Files:                                                    │
│     • [file1.ts] - [description of changes]                            │
│     • [file2.svelte] - [description of changes]                        │
│                                                                        │
│  📦 Git State:                                                         │
│     • Branch: [branch-name]                                            │
│     • Last commit: [hash] - [subject]                                  │
│     • Uncommitted: [WIP commit created / Stash: stash-ref / None]      │
│                                                                        │
│  🔒 File Patterns to Reserve:                                          │
│     • [pattern1] - [reason]                                            │
│     • [pattern2] - [reason]                                            │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ IMPORTANT CONTEXT ────────────────────────────────────────────────────┐
│                                                                        │
│  ⚠️  Blockers:                                                         │
│     • [Blocker 1]                                                      │
│     • [Blocker 2]                                                      │
│     • Or: "No known blockers"                                          │
│                                                                        │
│  🔗 Dependencies:                                                      │
│     • [Dependency 1 - task or person]                                  │
│     • [Dependency 2 - task or person]                                  │
│     • Or: "No dependencies"                                            │
│                                                                        │
│  💡 Key Decisions Made:                                                │
│     • [Decision 1 and rationale]                                       │
│     • [Decision 2 and rationale]                                       │
│                                                                        │
│  👥 People to Coordinate With:                                         │
│     • [Agent/person 1] - [why/what about]                              │
│     • [Agent/person 2] - [why/what about]                              │
│     • Or: "No coordination needed"                                     │
│                                                                        │
│  📚 References:                                                        │
│     • [Documentation link or file]                                     │
│     • [Related PR or issue]                                            │
│     • [Agent Mail thread for discussion]                               │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ HANDOFF EXECUTION ────────────────────────────────────────────────────┐
│                                                                        │
│  ✅ Resources Released:                                                │
│     • File reservations: [X patterns released]                         │
│     • Task cleared from your active focus                              │
│                                                                        │
│  📧 Messages Sent:                                                     │
│     • To [target-agent]: Comprehensive handoff message                 │
│       - Message ID: [msg-id]                                           │
│       - Thread: [thread-id]                                            │
│       - Acknowledgement required: Yes                                  │
│     • To [other agents]: Handoff notification (if applicable)          │
│                                                                        │
│  📊 Beads Updated:                                                     │
│     • Note added: "Handed off from [you] to [target]"                  │
│     • Task status: [current status]                                    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ NEXT STEPS FOR [TARGET-AGENT] ───────────────────────────────────────┐
│                                                                        │
│  The target agent should:                                              │
│                                                                        │
│  1. Acknowledge the handoff message in Agent Mail                      │
│  2. Review the complete context and ask questions if needed            │
│  3. Reserve the file patterns listed above                             │
│  4. Check git state (pull, review WIP commit or unstash if needed)     │
│  5. Use `/start [task-id]` to formally begin work                      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║                    🤝✅ HANDOFF COMPLETE ✅🤝                            ║
║                                                                          ║
║                       	📌 Task ID: [task-id]							║
║                       	👉 Handed to: [TARGET-AGENT-NAME]				║
║																			║
║ 	                     🤖 From: [YOUR-AGENT-NAME]    					║
║																			║
╚══════════════════════════════════════════════════════════════════════════╝

💡 What to do now:
   • Wait for [target-agent] to acknowledge handoff
   • Use `/start` to pick up new work
   • Or use `/status` to see what else is available
```

---

## Best Practices

1. **Complete and clear handoff:**
   - Don't just say "take over" - provide full context
   - Include WHY decisions were made, not just WHAT was done
   - Be explicit about blockers and dependencies

2. **Clean git state:**
   - Either commit WIP or create named stash
   - Don't leave the target agent with confusing uncommitted changes
   - Document exactly what state the code is in

3. **Verify target agent:**
   - Check they're active (not a stale/inactive agent)
   - Consider their current workload (don't overload)
   - Verify they have the needed expertise (if applicable)

4. **Require acknowledgement:**
   - Always use `ack_required=true` in handoff message
   - Ensures target agent actually received and reviewed the handoff
   - Don't assume handoff is complete until acked

5. **Update all systems:**
   - Agent Mail (primary handoff message)
   - Beads task (note about handoff)
   - File reservations (release yours, document what target needs)
   - Your own agent state (clear current focus)

6. **Follow up:**
   - If target doesn't ack within reasonable time, follow up
   - Be available for questions as target agent ramps up
   - Consider adding yourself to Agent Mail thread as observer

---

## Common Handoff Scenarios

### Expertise Gap
```
Handoff Reason: "Requires frontend Svelte expertise I don't have"
Target: Agent known for Svelte work
Context: Explain what you tried, what didn't work, what approach might work
```

### Blocked on Another Agent
```
Handoff Reason: "Blocked waiting for API design from BlueLake"
Target: BlueLake (who can unblock themselves)
Context: What's blocking, what you accomplished while waiting
```

### Load Balancing
```
Handoff Reason: "Switching to higher priority P0 work"
Target: Agent with capacity for P2 work
Context: This is lower priority but valuable, here's the full context
```

### Time Constraints
```
Handoff Reason: "Need to focus on deadline for other project"
Target: Agent with availability
Context: How much time you estimate remains, when you might be available again
```

---

**IMPORTANT:**
- Handoff requires target agent to acknowledge
- Don't handoff to inactive/stale agents
- Always release resources before handing off
- Provide COMPLETE context - don't make target agent detective work to continue
- Follow up if target doesn't acknowledge within reasonable time
