---
argument-hint:
---

Display help information for agent commands.

# Agent Help - Command Reference

**Usage:**
- `/jat:help` - Show all agent commands
- `/jat:help start` - Show detailed help for specific command

**What this command does:**
Displays comprehensive help information for all agent coordination commands.

---

## Implementation

**Default (no arguments):** Show all commands with brief descriptions

```bash
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📖 Agent Command Reference"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "One agent = one session = one task"
echo ""
echo "CORE WORKFLOW:"
echo ""
echo "  /jat:start [agent-name] [task-id]"
echo "    Begin working - register agent, select task, start working"
echo "    Examples:"
echo "      /jat:start                    # Create agent, show tasks"
echo "      /jat:start task-abc           # Create agent, start task"
echo "      /jat:start MyAgent task-abc   # Use MyAgent, start task"
echo "      /jat:start task-abc quick     # Skip conflict checks"
echo ""
echo "  /jat:complete"
echo "    Finish task - verify, commit, close task, end session"
echo "    Examples:"
echo "      /jat:complete                 # Complete current task"
echo ""
echo "  /jat:pause [options]"
echo "    Pause work - save state, release locks"
echo "    Examples:"
echo "      /jat:pause --reason \"Break\"           # Keep locks"
echo "      /jat:pause --blocked --reason \"API\"  # Release locks"
echo "      /jat:pause --handoff Alice            # Hand off to agent"
echo ""
echo "SUPPORT COMMANDS:"
echo ""
echo "  /jat:status   - Check current work, locks, messages"
echo "  /jat:verify   - Quality checks before completing"
echo "  /jat:plan     - Convert planning to Beads tasks"
echo "  /jat:help     - This help (or /jat:help <command>)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "SESSION LIFECYCLE:"
echo ""
echo "  spawn agent → work on task → /jat:complete → session ends"
echo "                                     ↓"
echo "                         spawn new agent for next task"
echo ""
echo "QUICK TIPS:"
echo ""
echo "  Fast start:   /jat:start task-abc quick"
echo "  Quality:      /jat:verify before /jat:complete"
echo "  Coordination: All commands check Agent Mail first"
echo ""
```

**With specific command argument:** Show detailed help for that command

```bash
#!/bin/bash

COMMAND="$1"

if [[ -z "$COMMAND" ]]; then
    exit 0
fi

case "$COMMAND" in
    start)
        cat ~/code/jat/commands/jat/start.md | head -100
        ;;
    complete)
        cat ~/code/jat/commands/jat/complete.md | head -80
        ;;
    pause)
        cat ~/code/jat/commands/jat/pause.md | head -60
        ;;
    status)
        cat ~/code/jat/commands/jat/status.md | head -40
        ;;
    verify)
        cat ~/code/jat/commands/jat/verify.md | head -40
        ;;
    plan)
        cat ~/code/jat/commands/jat/plan.md | head -40
        ;;
    *)
        echo "❌ Unknown command: $COMMAND"
        echo ""
        echo "Available commands:"
        echo "  start, complete, pause, status, verify, plan"
        exit 1
        ;;
esac
```

---

## Output Examples

**Full help (default):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 Agent Command Reference
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

One agent = one session = one task

CORE WORKFLOW:

  /jat:start [agent-name] [task-id]
    Begin working - register agent, select task, start working
    Examples:
      /jat:start                    # Create agent, show tasks
      /jat:start task-abc           # Create agent, start task
      /jat:start MyAgent task-abc   # Use MyAgent, start task

  /jat:complete
    Finish task - verify, commit, close task, end session

  /jat:pause [options]
    Pause work - save state, release locks

SUPPORT COMMANDS:

  /jat:status   - Check current work, locks, messages
  /jat:verify   - Quality checks before completing
  /jat:plan     - Convert planning to Beads tasks
  /jat:help     - This help

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SESSION LIFECYCLE:

  spawn agent → work on task → /jat:complete → session ends
                                     ↓
                         spawn new agent for next task
```
