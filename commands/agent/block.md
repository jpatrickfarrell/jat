---
argument-hint: <reason>
---

Mark current task as blocked, coordinate with relevant agents, and release resources.

# Block Current Task

**Use this command when:**
- You can't proceed due to missing dependency
- Waiting for external decision or approval
- Blocked by another task that must complete first
- Technical blocker you can't resolve alone
- Need input from another agent or human

**Different from `/pause`:**
- `/pause` = Voluntary stop, you could continue but choosing not to
- `/block` = Cannot proceed, there's a specific blocker preventing progress

**Different from `/handoff`:**
- `/handoff` = Transferring ownership to someone else
- `/block` = Staying assigned but marking as blocked, may resume when unblocked

**Usage:**
- `/block "waiting for API design from BlueLake"` - Block with specific reason
- `/block "needs product decision on feature scope"` - Block for external input

---

Follow these steps in order:

## PART 1: Document the Blocker

1. **Verify current context:**
   - Identify current task from file reservations or activity
   - Check what work has been completed
   - Identify exactly what's blocking progress

2. **Analyze the blocker:**
   - Extract blocker reason from `$1` parameter
   - Identify blocker type:
     - Task dependency (another Beads task must complete)
     - Agent dependency (waiting for specific agent)
     - External dependency (human decision, API docs, etc.)
     - Technical blocker (bug, missing tool, environment issue)
   - Determine who can unblock (agent name, team, external party)
   - Estimate when blocker might clear (if possible)

3. **Check if blocker is already tracked:**
   - If it's a Beads task dependency, get that task ID
   - If it's waiting on another agent, verify they're aware

## PART 2: Coordinate and Update

4. **Update Beads task status:**
   - Run `bd update <task-id> --status blocked`
   - Add detailed note explaining blocker
   - If blocker is another task, link it as dependency (if Beads supports)

5. **Release resources:**
   - Release all file reservations
   - You can't make progress, so don't hold resources

6. **Send coordination messages:**
   - **If blocker is another agent:**
     - Send Agent Mail to that agent explaining what you need
     - Use `ack_required=true` to ensure they see it
     - Include context on why you're blocked and what would unblock you

   - **If blocker is a task dependency:**
     - Send message to agent(s) working on that task
     - Explain your dependency and any urgency

   - **If blocker is external (human decision, etc.):**
     - Send message to relevant team thread
     - Document the block for visibility
     - Escalate if urgent

7. **Send status update to task thread:**
   - Update all agents following this task
   - Explain blocker and expected timeline (if known)
   - Include what you accomplished before blocking

8. **Update your agent state:**
   - Update task_description to reflect blocked state
   - Make yourself available for other work

9. **Report block summary** to console (see format below)

---

## Output Format

After completing all steps above, format your final output using this template:

```
╔══════════════════════════════════════════════════════════════════════════╗
║                      🚫 TASK BLOCKED PROTOCOL                            ║
║                                                                          ║
║                    🤖 Agent: [YOUR-AGENT-NAME]                           ║
╚══════════════════════════════════════════════════════════════════════════╝

📌 Task ID: [task-id]
📝 Title: [task title]
🚫 Blocker: [reason from $1]
⏱️  Time in Progress: [how long you worked before blocking]

┌─ BLOCKER DETAILS ──────────────────────────────────────────────────────┐
│                                                                        │
│  🚫 Type: [Task Dependency / Agent Dependency / External / Technical]  │
│                                                                        │
│  📋 What's Blocking:                                                   │
│     [Detailed explanation of the blocker from $1]                      │
│                                                                        │
│  👤 Who Can Unblock:                                                   │
│     • [Agent name / Team / External party]                             │
│     • Contact: [how to reach them / Agent Mail thread]                 │
│                                                                        │
│  ⏰ Expected Timeline:                                                 │
│     • [When blocker might clear, or "Unknown"]                         │
│     • [Any dependencies of the blocker itself]                         │
│                                                                        │
│  🔗 Blocker References:                                                │
│     • [Related task ID if dependency]                                  │
│     • [Agent Mail thread discussing blocker]                           │
│     • [Issue/ticket for external blocker]                              │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ WORK COMPLETED BEFORE BLOCKING ───────────────────────────────────────┐
│                                                                        │
│  ✅ Accomplished:                                                      │
│     • [What was completed]                                             │
│     • [What was completed]                                             │
│                                                                        │
│  🔄 In Progress (stopped at blocker):                                  │
│     • [What you were working on when blocked]                          │
│                                                                        │
│  ⏸️  Paused Until Unblocked:                                           │
│     • [What needs to happen next after unblock]                        │
│     • [What needs to happen next after unblock]                        │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ FILES & STATE ────────────────────────────────────────────────────────┐
│                                                                        │
│  📄 Modified Files:                                                    │
│     • [file1.ts] - [changes made]                                      │
│     • [file2.svelte] - [changes made]                                  │
│                                                                        │
│  💾 Git State:                                                         │
│     • [X files committed]                                              │
│     • [Y files uncommitted - stashed/WIP committed]                    │
│     • Branch: [branch-name]                                            │
│     • Ready to resume: [Yes - clean state / No - needs attention]      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ COORDINATION ACTIONS ─────────────────────────────────────────────────┐
│                                                                        │
│  ✅ Beads Updated:                                                     │
│     • Status changed to: BLOCKED                                       │
│     • Note added: "[blocker reason]"                                   │
│     • Dependency linked: [task-id if applicable]                       │
│                                                                        │
│  📧 Messages Sent:                                                     │
│     • To [unblocking agent/team]: Requesting unblock                   │
│       - Message ID: [msg-id]                                           │
│       - Thread: [thread-id]                                            │
│       - Acknowledgement required: Yes                                  │
│     • To task thread: Status update about block                        │
│                                                                        │
│  🔓 Resources Released:                                                │
│     • File reservations: [X patterns released]                         │
│     • Now available for other agents                                   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ UNBLOCK CONDITIONS ───────────────────────────────────────────────────┐
│                                                                        │
│  This task will be unblocked when:                                     │
│                                                                        │
│  1. [Specific condition 1]                                             │
│  2. [Specific condition 2]                                             │
│  3. [Specific condition 3 or "Above conditions met"]                   │
│                                                                        │
│  To resume after unblock:                                              │
│  • Use `/resume [task-id]` to check state and continue                 │
│  • Review messages in thread [thread-id] for updates                   │
│  • May need to coordinate with [agent/team] first                      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║                    🚫✅ TASK MARKED BLOCKED ✅🚫                         ║
║                                                                          ║
║                       	📌 Task ID: [task-id]							║
║                       	🚫 Blocker: [short blocker description]			║
║																			║
║ 	                     🤖 Agent: [YOUR-AGENT-NAME]    					║
║																			║
╚══════════════════════════════════════════════════════════════════════════╝

💡 What to do now:
   • Monitor Agent Mail for unblock notification
   • Use `/start` to pick up other work while waiting
   • Or use `/status` to see what else is available
   • Follow up with [unblocking party] if blocker persists
```

---

## Best Practices

1. **Be specific about the blocker:**
   - ❌ Bad: "blocked"
   - ❌ Bad: "can't continue"
   - ✅ Good: "waiting for API authentication design from BlueLake (task dirt-abc)"
   - ✅ Good: "needs product approval on whether to use modal or sidebar UI"

2. **Identify who can unblock:**
   - Name specific agent, team, or person
   - Provide contact info or Agent Mail thread
   - Give them context on WHY you need it and WHEN

3. **Coordinate proactively:**
   - Don't just mark blocked and walk away
   - Send message to whoever can unblock
   - Explain impact and urgency
   - Offer to help if possible

4. **Define unblock conditions:**
   - Be explicit about what needs to happen
   - Helps others know when to notify you
   - Prevents "Is it unblocked yet?" back-and-forth

5. **Clean up before blocking:**
   - Commit or stash work in progress
   - Release all resources
   - Leave task in resumable state
   - Document current state

6. **Stay engaged:**
   - Check Agent Mail for unblock notifications
   - Follow up if blocker drags on
   - Escalate if urgent and no progress
   - Offer alternative approaches if blocker seems permanent

---

## Common Blocker Types

### Task Dependency Blocker
```
Blocker: "Blocked by dirt-xyz: needs auth system refactor to complete first"
Who Can Unblock: GreenOcean (working on dirt-xyz)
Action: Message GreenOcean about dependency, ask for ETA
Unblock Condition: dirt-xyz marked complete in Beads
```

### Agent Expertise Blocker
```
Blocker: "Needs BlueLake to design API contract before implementation"
Who Can Unblock: BlueLake
Action: Send design request with requirements and context
Unblock Condition: API design document posted in thread
```

### External Decision Blocker
```
Blocker: "Needs product decision: use modal or sidebar for settings UI"
Who Can Unblock: Product team / human stakeholder
Action: Send options with pros/cons to decision maker
Unblock Condition: Decision made and documented
```

### Technical Blocker
```
Blocker: "Test database not accessible, environment setup issue"
Who Can Unblock: DevOps / Infrastructure team
Action: Report issue with error logs, request fix
Unblock Condition: Database connection restored
```

### Information Blocker
```
Blocker: "Waiting for API documentation from external vendor"
Who Can Unblock: External vendor
Action: Follow up on documentation request, set deadline
Unblock Condition: Documentation published
```

---

## When to Use `/block` vs Other Commands

**Use `/block` when:**
- ✅ There's a SPECIFIC blocker you can name
- ✅ You know WHO or WHAT can unblock
- ✅ You want to stay assigned to the task
- ✅ The blocker is temporary and will clear

**Use `/pause` when:**
- ❌ No specific blocker, just need to stop
- ❌ Voluntary break or context switch
- ❌ Might not return to this task

**Use `/handoff` when:**
- ❌ Someone else should own this task
- ❌ You don't plan to resume
- ❌ Different expertise needed permanently

---

**IMPORTANT:**
- Always provide SPECIFIC blocker reason - required parameter
- Always coordinate with whoever can unblock you
- Always release resources - you're not making progress
- Task stays assigned to you unless you handoff
- Use `/resume [task-id]` when blocker clears
