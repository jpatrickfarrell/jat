---
argument-hint: [task-id | quick]
---

Get to work! Smart, conversationally-aware command that handles fresh starts, resuming paused work, conflict detection, and even creates tasks from conversation context.

# Start Working - Unified Smart Command

**Prerequisites:** Agent should already be registered via `/register_and_review` command.

**Usage:**
- `/start` - Contextualize from conversation OR auto-select highest priority (with conflict checks)
- `/start dirt-abc` - Start specific task (with conflict checks)
- `/start quick` - Auto-select, skip conflict checks (fast mode)
- `/start dirt-abc quick` - Start specific task, skip checks (fast mode)

---

## What This Command Does

This is THE command for "get to work" - it's smart enough to:
- 🧠 Understand conversation context and create tasks from discussion
- 🔍 Search Beads for related tasks
- 🛡️ Detect if you're resuming vs starting fresh
- ⚠️ Check for conflicts (file locks, git changes, task status)
- ⚡ Fast mode when you want to skip safety checks
- 🚀 Always ends with STARTING WORK (not just recommending)

---

Follow these steps in order:

## STEP 1: Parse Parameters and Mode

**Check command arguments (`$1`):**

1. **Quick mode detection:**
   - If `$1` contains "quick" (any position) → Enable QUICK MODE
   - Quick mode = Skip all conflict checks (steps 4-5)
   - Use when: You're the only one working, need speed, know no conflicts

2. **Task ID extraction:**
   - If `$1` is a task ID (e.g., "dirt-abc") → Use that task
   - If `$1` is empty or "quick" → Proceed to STEP 2 (contextualization)

---

## STEP 1.5: Detect Task Type (Bulk vs Normal)

**After task ID is determined (from STEP 1 or STEP 2), analyze the task to determine completion strategy.**

### Analyze Task Characteristics

Retrieve task details:
```bash
task_info=$(bd show [task-id] --json)
title=$(echo "$task_info" | jq -r '.title')
description=$(echo "$task_info" | jq -r '.description')
labels=$(echo "$task_info" | jq -r '.labels[]')
```

### Detection Patterns for Bulk Remediation

**Indicators that this is BULK REMEDIATION** (not normal feature work):

1. **Title patterns** (case-insensitive):
   - Contains: "fix X errors", "eliminate", "cleanup", "remove all"
   - Contains numbers: "1000", "500", "100+" followed by "errors", "warnings", "issues"
   - Contains: "lint", "type errors", "eslint", "tsc errors"
   - Examples:
     - "Fix 1,231 TypeScript errors"
     - "Eliminate all implicit 'any' parameters"
     - "Cleanup lint warnings across codebase"

2. **Description patterns**:
   - Mentions: "pattern-based", "systematic", "across codebase", "bulk", "mass"
   - Describes repetitive work: "same fix in multiple files", "consistent pattern"
   - Large scope: "all files", "entire project", "everywhere"

3. **Labels**:
   - Has labels: "bulk", "remediation", "cleanup", "tech-debt", "mass-fix"

4. **Scope indicators**:
   - File count: Description mentions >50 files
   - Error count: Description mentions >100 errors/issues
   - Time estimate: >20 hours of repetitive work

### Decision Tree

**If 2+ bulk indicators detected:**
→ **BULK REMEDIATION MODE**
→ Skip to STEP 7 (Bulk Completion Strategy)

**If 0-1 indicators:**
→ **NORMAL FEATURE WORK MODE**
→ Continue to STEP 2 (or STEP 3 if task already selected)

---

## STEP 2: Contextualize Task (Only if no task ID provided AND normal work mode)

**Smart task selection based on conversation context:**

### A) Analyze Recent Conversation

Review last 3-5 messages in conversation history:
- What feature/work was discussed?
- Any specific requirements mentioned?
- Any bug/issue described?
- Any user needs expressed?

**Examples:**
- "We need a password reset flow" → Feature: password reset
- "The payment form has a Stripe webhook bug" → Bug: Stripe webhooks
- "Let's build user profile editing" → Feature: user profile editing

### B) Search Beads for Related Tasks

If conversation context detected:

1. **Search Beads** using keywords from conversation:
   ```bash
   bd list --json | grep -i "password reset"
   bd list --json | grep -i "stripe webhook"
   ```

2. **If matches found:**
   - Show top 2-3 most relevant tasks
   - Identify best match based on keywords
   - **Ask user**: "Found related task dirt-abc (Improve login form UX). Start this one? [yes/no/other]"
   - If yes → Use that task ID, proceed to STEP 3
   - If no → Proceed to C) Create Task
   - If other → User specifies different task

3. **If no matches found:**
   - Proceed to C) Create Task

### C) Create Task from Conversation Context

If context detected but no matching task exists:

1. **Parse conversation** for requirements:
   - Feature/bug description
   - Infer priority (P0 if urgent/blocking, P1 if important, P2 if enhancement)
   - Estimate scope

2. **Create task in Beads:**
   ```bash
   bd create "Implement password reset flow (from conversation)" \
     --priority P1 \
     --description "Create password reset flow with email verification based on conversation requirements"
   ```

3. **Announce in Agent Mail:**
   - Send message to project thread
   - Subject: "[new task] Implement password reset flow"
   - Body: "Created from conversation context, starting work immediately"

4. **Use the newly created task ID** → Proceed to STEP 3

### D) Fall Back to Auto-Select

If NO conversation context detected:

1. **Run `bd ready --json`** to find highest priority tasks
2. **Pick top priority task** (P0 > P1 > P2, then by creation date)
3. If no ready tasks: Report "No ready tasks available" and suggest using `/plan`

---

## STEP 3: Verify Agent Identity

- Confirm agent identity is established (you should have agent name from registration)
- If not registered: Instruct user to run `/register_and_review` first

---

## STEP 4: Conflict Detection (Skip if QUICK MODE)

**CRITICAL: Only run if NOT in quick mode**

### A) Check if Resuming Previous Work

Check if agent worked on this task before:
- Look for file reservations with this task ID
- Check Agent Mail for previous messages about this task
- Check git history for commits referencing this task

**If resuming:** Add context about "Resuming work on dirt-abc (paused Xh ago)"

### B) Check File Reservations

Query active file reservations for patterns this task will need:

```bash
# Check for conflicts by attempting to reserve (use --dry-run to check without reserving)
am-reserve "src/routes/auth/**" "src/lib/auth/**" \
  --agent YourAgentName \
  --ttl 3600 \
  --exclusive \
  --reason "task-id check" \
  --dry-run
```

**If conflicts detected:**
- Note which agent holds lock
- Note expiry time
- Save for conflict report in STEP 6

### C) Check Task Status in Beads

```bash
bd show <task-id> --json
```

**Check:**
- Status is OPEN (not blocked, not completed, not closed)
- Task not reassigned to another agent
- No new blockers added since last time

**If issues found:**
- Save for conflict report in STEP 6

### D) Check Git Status

```bash
git status
git diff --name-only
```

**Check:**
- Are there uncommitted changes in files this task will touch?
- Have other agents modified related files since you last worked?
- Any merge conflicts?

**If issues found:**
- Save for conflict report in STEP 6

### E) Check Agent Mail Inbox

Fetch urgent messages:

```bash
# Get urgent unread messages
am-inbox YourAgentName --unread --urgent | head -10
```

**Check for:**
- Messages about this specific task
- Blocking coordination requests
- Handoff messages
- Urgent decisions needed

**If urgent items found:**
- Save for conflict report in STEP 6

---

## STEP 5: Acknowledge Inbox (Skip if QUICK MODE)

**CRITICAL: Only run if NOT in quick mode**

Acknowledge ALL pending messages in inbox:

```bash
# Acknowledge all unread messages at once
am-inbox YourAgentName --unread --json | jq -r '.[].id' | \
  xargs -I {} am-ack {} --agent YourAgentName
```

---

## STEP 6: Decision Point - Start or Report Conflicts

### A) If NO conflicts detected (or QUICK MODE):

**✅ CLEAR TO START**

Proceed to STEP 7 (Reserve Files)

### B) If conflicts detected:

**⚠️ CONFLICTS FOUND - DO NOT START YET**

**Report conflicts to user and present options:**

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    ⚠️  CONFLICTS DETECTED                                ║
╚══════════════════════════════════════════════════════════════════════════╝

📌 Task: dirt-abc - Implement password reset flow
🔄 Resuming previous work (paused 3h ago)

┌─ FILE CONFLICTS ───────────────────────────────────────────────────────┐
│                                                                        │
│  🚫 BlueLake has exclusive lock on:                                    │
│     • src/routes/auth/** (Reason: "Refactoring auth flow")             │
│     • Expires in: 1.5 hours                                            │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ GIT CHANGES ──────────────────────────────────────────────────────────┐
│                                                                        │
│  ⚠️  3 files modified by others since pause:                           │
│     • src/lib/auth/utils.ts (BlueLake, 2h ago)                         │
│     • src/routes/auth/+page.svelte (GreenCastle, 1h ago)               │
│     • src/lib/types/auth.ts (BlueLake, 2h ago)                         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ INBOX ────────────────────────────────────────────────────────────────┐
│                                                                        │
│  📬 3 urgent messages requiring attention:                             │
│     • BlueLake: "Coordinating auth refactor, please hold" (2h ago)     │
│     • GreenCastle: "Updated auth types, FYI" (1h ago)                  │
│     • System: "Task dirt-abc dependency updated" (30m ago)             │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ TASK STATUS ──────────────────────────────────────────────────────────┐
│                                                                        │
│  ✅ Status: OPEN (still available)                                     │
│  ✅ Assignment: Still assigned to you                                  │
│  ✅ Blockers: None                                                     │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════╗
║                           OPTIONS                                        ║
╚══════════════════════════════════════════════════════════════════════════╝

1. ⏰ Wait for BlueLake's file lock to expire (1.5 hours)

2. 📨 Message BlueLake to coordinate
   - Ask about auth refactor timeline
   - See if you can work on different part of task

3. 🔄 Pull latest git changes and review
   - git pull
   - Review BlueLake and GreenCastle's changes
   - Rebase your work if needed

4. 🔀 Start different task instead
   - /start (will pick different task)

5. ⚡ Force start anyway (risky)
   - /start dirt-abc quick
   - Skips conflict checks
   - May cause merge conflicts or duplicate work

Recommended: Option 2 or 3 (coordinate with BlueLake)
```

**STOP HERE** - Do not proceed to file reservation or work start.

Wait for user to resolve conflicts or choose different task.

---

## STEP 7: Reserve Files

**Infer file patterns from task:**

Based on task description, reserve appropriate file patterns:

**Examples:**
- "Implement password reset" → `src/routes/auth/reset/**`, `src/lib/auth/**`
- "Fix Stripe webhook bug" → `src/routes/api/stripe/**`, `src/lib/stripe/**`
- "Build user profile page" → `src/routes/account/profile/**`, `src/lib/components/profile/**`

```bash
# Reserve files for this task
am-reserve "inferred/patterns/**" \
  --agent YourAgentName \
  --ttl 3600 \
  --exclusive \
  --reason "task-id: Working on <task description>"
```

---

## STEP 8: Announce Start in Agent Mail

Send announcement message to project thread:

```bash
# Send start announcement
am-send "[task-id] Starting: <task title>" \
  "$(cat <<'EOF'
Starting work on task-id: <task description>

**Scope:**
- <Brief overview of what will be done>

**Reserved files:**
- <file patterns>

**ETA:** <estimated completion time>

Will update thread with progress.
EOF
)" \
  --from YourAgentName \
  --to project-team \
  --thread task-id \
  --importance normal
```

---

## STEP 9: Check Dependencies and Parallel Opportunities

**Check Beads for:**

1. **Blocking tasks:**
   ```bash
   bd show <task-id> --json
   # Check "depends_on" field
   ```
   - If blockers exist and not completed: Warn user

2. **Related tasks:**
   - Tasks that touch similar files
   - Tasks in same feature area
   - Could be done in parallel by other agents

3. **Parallel opportunities:**
   - Can this task be split?
   - Can sub-agents help (code-refactorer, etc.)?

---

## STEP 10: Report Start Summary and BEGIN WORK

**Output the start summary** (format below)

**THEN IMMEDIATELY START WORKING** - Do not stop at recommendations!

---

## Output Format

After completing all steps above, use this template:

```
╔══════════════════════════════════════════════════════════════════════════╗
║                      🚀 TASK START PROTOCOL                              ║
║                                                                          ║
║                    🤖 Agent: [YOUR-AGENT-NAME]                           ║
╚══════════════════════════════════════════════════════════════════════════╝

[If created from conversation:]
┌─ TASK CREATION ────────────────────────────────────────────────────────┐
│                                                                        │
│  ➕ Created from conversation context                                  │
│  💡 Context: "[brief summary of conversation]"                         │
│  📋 Created: dirt-xyz with P1 priority                                 │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

[If matched existing task:]
┌─ TASK MATCH ───────────────────────────────────────────────────────────┐
│                                                                        │
│  🔍 Searched conversation context: "[keywords]"                        │
│  ✅ Matched existing task: dirt-abc                                    │
│  📊 Confidence: High (direct keyword match)                            │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

[If resuming:]
┌─ RESUMING WORK ────────────────────────────────────────────────────────┐
│                                                                        │
│  🔄 Previously worked on this task                                     │
│  ⏰ Last active: 3 hours ago                                           │
│  ✅ All conflict checks passed                                         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════╗
║                        📋 TASK OVERVIEW                                  ║
╚══════════════════════════════════════════════════════════════════════════╝

📌 Task ID: [task-id]
📝 Title: [task title]
🔥 Priority: P[X]
⏱️  Estimated Duration: [estimate if known]
[If quick mode:] ⚡ Mode: QUICK (conflict checks skipped)

┌─ TASK DESCRIPTION ─────────────────────────────────────────────────────┐
│                                                                        │
│  [Brief description of what this task entails]                         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

[If NOT quick mode:]
┌─ CONFLICT CHECKS ──────────────────────────────────────────────────────┐
│                                                                        │
│  ✅ File Reservations: No conflicts                                    │
│  ✅ Task Status: Open and available                                    │
│  ✅ Git Status: No conflicts                                           │
│  ✅ Inbox: 3 messages acknowledged, 0 urgent                           │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ FILE RESERVATIONS ────────────────────────────────────────────────────┐
│                                                                        │
│  🔒 [path/pattern] - [TTL: X hours] - [reason]                         │
│  🔒 [path/pattern] - [TTL: X hours] - [reason]                         │
│  📝 Or: "No file reservations needed for this task"                    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ AGENT MAIL ANNOUNCEMENTS ─────────────────────────────────────────────┐
│                                                                        │
│  📤 Thread: [thread-id]                                                │
│  👥 Recipients: [agent names or "project-team"]                        │
│  📋 Subject: "[task-id] Starting: [task title]"                        │
│  ✅ Announcement sent                                                  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ DEPENDENCIES & OPPORTUNITIES ─────────────────────────────────────────┐
│                                                                        │
│  ✅ Blocking tasks: [list or "None"]                                   │
│  🔗 Related tasks: [list or "None"]                                    │
│  ⚡ Parallel opportunities: [list or "None"]                           │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║                       🚀✅🔒 STARTING WORK NOW 🚀✅🔒                    ║
║                                                                          ║
║                       	📌 Task ID: [task-id]							║
║                       	📝 Title: [task title]							║
║																			║
║ 	                     🤖 Agent: [YOUR-AGENT-NAME]    					║
║																			║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## STEP 7: Bulk Completion Strategy (Only If Bulk Remediation Detected)

**This step is ONLY executed if STEP 1.5 detected bulk remediation (2+ indicators).**

**Objective**: Complete the ENTIRE bulk task efficiently in one session using pattern-based fixing or massive parallelization.

### A) Analyze Scope and Choose Strategy

1. **Get current error/issue count:**
   ```bash
   # For TypeScript errors
   npm run check 2>&1 | tail -5

   # For lint errors
   npm run lint 2>&1 | tail -5

   # Parse count
   remaining_count=[extract number from output]
   ```

2. **Determine if pattern-based fixing is applicable:**

   **Pattern-based fixing works best for:**
   - Repetitive syntax errors (implicit 'any', missing types)
   - Consistent lint violations (same rule broken many times)
   - Simple replacements (import paths, naming conventions)
   - Mechanical fixes (add null checks, type annotations)

   **Pattern-based does NOT work for:**
   - Complex logic errors
   - Architectural issues
   - Varied/unique problems per file
   - Requires understanding context

3. **Choose strategy:**

   **Strategy 1: Pattern-Based Bulk Fixing** (Fastest - 10-100x faster)
   - IF: Errors are repetitive and pattern-based
   - IF: Can be fixed with grep + MultiEdit
   - Use when: 80%+ of errors follow same patterns
   - Estimated time: Minutes to fix hundreds of errors

   **Strategy 2: Massive Agent Parallelization** (Fast but resource-intensive)
   - IF: Errors are varied but still bulk-scale
   - IF: Each fix requires some context/logic
   - Use when: Patterns won't work but scale is large
   - Estimated time: 10-30 minutes for 500+ errors

   **Strategy 3: Hybrid Approach** (Best for mixed cases)
   - Use pattern-based for 80% of simple errors
   - Use agent parallelization for remaining 20% complex
   - Most efficient overall

### B) Execute Strategy 1: Pattern-Based Bulk Fixing

**If chosen, execute these steps:**

1. **Categorize error patterns:**
   ```bash
   # Run check to get all errors
   npm run check > /tmp/all_errors.txt 2>&1

   # Extract unique error patterns
   grep "error TS" /tmp/all_errors.txt | \
     cut -d':' -f4 | \
     sort | uniq -c | sort -rn | head -20
   ```

2. **For each major pattern (top 5-10):**

   **Example: Implicit 'any' parameters**
   ```bash
   # Find all instances
   grep -r "\.map((" src/ | grep -v "\.map((.*:.*)" > /tmp/map_no_types.txt

   # Review pattern (ensure it's safe to fix mechanically)
   head -5 /tmp/map_no_types.txt

   # Use MultiEdit to fix all at once
   # (Provide specific type annotations based on context)
   ```

   **Example: Null safety**
   ```bash
   # Find all "possibly null" errors
   grep "Object is possibly 'null'" /tmp/all_errors.txt | \
     cut -d':' -f1-2 | sort -u > /tmp/null_errors.txt

   # Use MultiEdit to add optional chaining
   # Transform: obj.property → obj?.property
   ```

3. **Verify fixes after each pattern:**
   ```bash
   # Re-run check to see error reduction
   npm run check 2>&1 | tail -1
   # "Found X errors" - compare to previous count
   ```

4. **Report progress:**
   - Pattern 1: Fixed 300 implicit 'any' errors
   - Pattern 2: Fixed 150 null safety errors
   - Pattern 3: Fixed 80 type mismatch errors
   - Total: 530 errors → 201 errors remaining (-62%)

### C) Execute Strategy 2: Massive Agent Parallelization

**If chosen, execute these steps:**

1. **Calculate agent deployment:**
   - >1000 errors → Deploy 60-80 agents
   - 500-1000 errors → Deploy 40-60 agents
   - 100-500 errors → Deploy 20-40 agents
   - <100 errors → Deploy 10-20 agents

2. **Categorize errors into batches:**
   ```bash
   # Get all errors
   npm run check > /tmp/all_errors.txt 2>&1

   # Group by error type
   grep "TS2304" /tmp/all_errors.txt > /tmp/batch_missing_names.txt
   grep "TS2322" /tmp/all_errors.txt > /tmp/batch_type_mismatch.txt
   grep "TS2345" /tmp/all_errors.txt > /tmp/batch_arg_types.txt
   # ... continue for major error codes

   # Count batches
   batch_count=$(ls /tmp/batch_*.txt | wc -l)
   ```

3. **Deploy agents in ONE parallel wave:**
   ```typescript
   // In a single message, call Task tool multiple times
   // Example for 60 agents:

   for (let i = 1; i <= 60; i++) {
     const batchFile = `/tmp/batch_${i}.txt`
     const agentTask = {
       subagent_type: "code-refactorer",
       description: `Fix TS errors batch ${i}`,
       prompt: `Fix all TypeScript errors in batch ${i}.
                Batch file: ${batchFile}
                Fix systematically, run verification after.
                Report: errors fixed, files changed.`
     }
     // Call Task tool
   }
   ```

4. **Wait for all agents to complete** (tool returns when all done)

5. **Consolidate results:**
   - Agent 1: Fixed 15 errors in 3 files
   - Agent 2: Fixed 18 errors in 5 files
   - ...
   - Agent 60: Fixed 12 errors in 4 files
   - Total: 890 errors fixed, 141 remaining

### D) Execute Strategy 3: Hybrid Approach

**If chosen, execute these steps:**

1. **Start with pattern-based for simple errors:**
   - Follow Strategy 1 steps for top patterns
   - Fix 70-80% of bulk errors quickly (minutes)
   - Report: "1,231 → 300 errors remaining via pattern fixing"

2. **Deploy agents for remaining complex errors:**
   - Follow Strategy 2 for remaining errors
   - Deploy 20-40 agents to handle complex cases
   - Report: "300 → 0 errors via agent parallelization"

3. **Total time:** 10-20 minutes to complete entire bulk task

### E) Final Verification and Completion

**After bulk fixing (any strategy):**

1. **Run full verification:**
   ```bash
   npm run check
   npm run lint
   npm run build
   ```

2. **Verify 0 errors or acceptable threshold:**
   - Target: 0 errors for "eliminate all" tasks
   - Target: <10 errors if scope was "major cleanup"

3. **Commit all fixes:**
   ```bash
   git add .
   git commit -m "[task-id] Bulk fix: [X] errors eliminated via [strategy]

   - Strategy: [Pattern-based / Massive parallel / Hybrid]
   - Errors fixed: [count]
   - Files modified: [count]
   - Time: [duration]

   🤖 Generated with [Claude Code](https://claude.com/claude-code)

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

4. **Mark task complete:**
   - Use `/complete` command
   - Verification will pass (already verified above)
   - Task closes, next task starts

### Output Format for Bulk Completion

```
╔══════════════════════════════════════════════════════════════════════════╗
║             ⚡ BULK REMEDIATION - AGGRESSIVE COMPLETION ⚡               ║
║                                                                          ║
║                    🤖 Agent: [YOUR-AGENT-NAME]                           ║
╚══════════════════════════════════════════════════════════════════════════╝

📌 Task ID: [task-id]
📝 Title: [task title]
⚡ Mode: BULK REMEDIATION (detected 3 indicators)

┌─ SCOPE ANALYSIS ───────────────────────────────────────────────────────┐
│                                                                        │
│  📊 Initial Count: [X errors/issues]                                   │
│  🎯 Target: [0 or <10 errors]                                          │
│  📋 Error Types: [list top 5 patterns]                                 │
│  ⏱️  Estimated Time: [10-30 minutes]                                    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ CHOSEN STRATEGY ──────────────────────────────────────────────────────┐
│                                                                        │
│  Strategy: [Pattern-Based / Massive Parallel / Hybrid]                │
│  Why: [Explanation of why this strategy chosen]                        │
│  Approach: [High-level plan]                                           │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

[If Pattern-Based:]
┌─ PATTERN FIXING PROGRESS ──────────────────────────────────────────────┐
│                                                                        │
│  Pattern 1: Implicit 'any' parameters                                  │
│     • Found: 300 instances                                             │
│     • Fixed: grep + MultiEdit → 300 fixes                              │
│     • Time: 2 minutes                                                  │
│                                                                        │
│  Pattern 2: Null safety (possibly null)                                │
│     • Found: 150 instances                                             │
│     • Fixed: optional chaining → 150 fixes                             │
│     • Time: 1 minute                                                   │
│                                                                        │
│  Pattern 3: Type mismatches (number vs string)                         │
│     • Found: 80 instances                                              │
│     • Fixed: type conversions → 80 fixes                               │
│     • Time: 1 minute                                                   │
│                                                                        │
│  Total Fixed: 530 errors in 4 minutes                                  │
│  Remaining: 200 errors (complex cases)                                 │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

[If Massive Parallel:]
┌─ AGENT DEPLOYMENT ─────────────────────────────────────────────────────┐
│                                                                        │
│  🚀 Deployed: 60 agents in ONE parallel wave                           │
│  📦 Batches: 60 batches (20 errors each avg)                           │
│  ⏱️  Duration: 12 minutes                                               │
│                                                                        │
│  Results:                                                              │
│  • 58/60 agents completed successfully (97%)                           │
│  • 1,187 errors fixed                                                  │
│  • 234 files modified                                                  │
│  • 44 errors remaining (edge cases)                                    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

┌─ FINAL VERIFICATION ───────────────────────────────────────────────────┐
│                                                                        │
│  ✅ Type Checking: 0 errors (was 1,231)                                │
│  ✅ Linting: PASSED                                                    │
│  ✅ Build: SUCCESS                                                     │
│  ✅ Total Time: 18 minutes                                             │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════╗
║                  ⚡✅ BULK TASK COMPLETE ✅⚡                            ║
║                                                                          ║
║  📌 Task ID: [task-id]                                                   ║
║  ⚡ [X] errors eliminated in [Y] minutes                                 ║
║  🎯 100% completion via [strategy]                                       ║
║                                                                          ║
║  🤖 Agent: [YOUR-AGENT-NAME]                                             ║
╚══════════════════════════════════════════════════════════════════════════╝

💡 Automatically proceeding to `/complete`
```

---

## IMPORTANT NOTES

**Always:**
- Show agent name at top and bottom
- If creating task from conversation, explain the context
- If resuming, show when you last worked on it
- If conflicts detected, STOP and present options (don't proceed to work)
- If quick mode, clearly indicate conflict checks were skipped
- End with "STARTING WORK NOW" and ACTUALLY START WORKING

**Quick Mode:**
- Use sparingly - only when you KNOW no conflicts exist
- Skips all safety checks (file reservations, git, inbox, task status)
- Faster but risky (can cause merge conflicts, duplicate work)
- Good for: solo work, rapid iteration, known-safe scenarios

**Conversational Awareness:**
- Review last 3-5 messages for context
- Extract feature/bug/requirement intent
- Search Beads for matches before creating new task
- Ask user to confirm matched tasks
- Auto-create tasks when context is clear but no match exists

**Conflict Detection:**
- Default behavior (unless quick mode)
- Checks file locks, git status, task status, inbox
- Reports conflicts clearly with recommended actions
- Prevents stepping on other agents' work
- Saves time by catching issues before starting
