---
argument-hint:
---

Display help information for agent commands.

# Agent Help - Command Reference

**Usage:**
- `/agent:help` - Show all agent commands
- `/agent:help start` - Show detailed help for specific command
- `/agent:help --quick` - Show quick reference only

**What this command does:**
Displays comprehensive help information for all agent coordination commands, similar to `--help` flags in bash commands.

---

## Implementation

**Default (no arguments):** Show all commands with brief descriptions

```bash
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📖 Agent Command Reference - 7 commands for multi-agent orchestration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "CORE WORKFLOW (4 commands):"
echo ""
echo "  /agent:start [agent|task|quick|resume]"
echo "    Get to work - register agent, select task, start working"
echo "    Examples:"
echo "      /agent:start                    # Auto-create new agent"
echo "      /agent:start resume             # Choose from logged-out agents"
echo "      /agent:start task-abc           # Start specific task"
echo "      /agent:start task-abc quick     # Skip conflict checks"
echo ""
echo "  /agent:next [quick]"
echo "    Drive mode - complete current task, auto-start next"
echo "    Examples:"
echo "      /agent:next                     # Full verify + auto-continue"
echo "      /agent:next quick               # Skip verify, fast iteration"
echo ""
echo "  /agent:complete [task-id]"
echo "    Finish properly - verify, commit, show menu, you choose next"
echo "    Examples:"
echo "      /agent:complete                 # Complete current task"
echo ""
echo "  /agent:pause [task-id] [options]"
echo "    Quick pivot - pause/block/handoff/abandon current work"
echo "    Examples:"
echo "      /agent:pause --reason \"Break\"           # Keep locks"
echo "      /agent:pause --blocked --reason \"API\"  # Release locks"
echo "      /agent:pause --handoff Alice            # Hand off to agent"
echo "      /agent:pause --abandon                  # Unassign task"
echo ""
echo "SUPPORT COMMANDS (3 commands):"
echo ""
echo "  /agent:status"
echo "    Check current work - task, locks, messages, team sync"
echo ""
echo "  /agent:verify [task-id]"
echo "    Quality checks - tests, lint, security, browser"
echo ""
echo "  /agent:plan"
echo "    Convert planning to tasks - analyze conversation/PRD, create Beads tasks"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "QUICK TIPS:"
echo ""
echo "  Speed:        /agent:start quick  /agent:next quick"
echo "  Control:      /agent:complete (manual selection)"
echo "  Quality:      /agent:verify before /agent:complete"
echo "  Coordination: All commands sync via Agent Mail"
echo ""
echo "LEARN MORE:"
echo ""
echo "  Full docs:    cat COMMANDS.md"
echo "  README:       cat README.md"
echo "  Dashboard:    bd-dashboard"
echo "  Agent Mail:   cat ~/.claude/CLAUDE.md"
echo ""
echo "For detailed help on a specific command:"
echo "  /agent:help start"
echo "  /agent:help next"
echo "  /agent:help complete"
echo ""
```

**With specific command argument:** Show detailed help for that command

```bash
#!/bin/bash

# Get command name from argument
COMMAND="$1"

if [[ -z "$COMMAND" ]]; then
    # Show full help (default - already shown above)
    exit 0
fi

# Show detailed help for specific command
case "$COMMAND" in
    start)
        cat ~/code/jat/commands/agent/start.md | grep -A 50 "^# Agent Start"
        ;;
    next)
        cat ~/code/jat/commands/agent/next.md | grep -A 30 "^# Agent Next"
        ;;
    complete)
        cat ~/code/jat/commands/agent/complete.md | grep -A 30 "^# Agent Complete"
        ;;
    pause)
        cat ~/code/jat/commands/agent/pause.md | grep -A 40 "^# Agent Pause"
        ;;
    status)
        cat ~/code/jat/commands/agent/status.md | grep -A 20 "^# Agent Status"
        ;;
    verify)
        cat ~/code/jat/commands/agent/verify.md | grep -A 20 "^# Agent Verify"
        ;;
    plan)
        cat ~/code/jat/commands/agent/plan.md | grep -A 20 "^# Agent Plan"
        ;;
    *)
        echo "❌ Unknown command: $COMMAND"
        echo ""
        echo "Available commands:"
        echo "  start, next, complete, pause, status, verify, plan"
        echo ""
        echo "Usage: /agent:help <command>"
        exit 1
        ;;
esac
```

---

## Output Examples

**Full help (default):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 Agent Command Reference - 7 commands for multi-agent orchestration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CORE WORKFLOW (4 commands):

  /agent:start [agent|task|quick|resume]
    Get to work - register agent, select task, start working
    Examples:
      /agent:start                    # Auto-create new agent
      /agent:start resume             # Choose from logged-out agents
      /agent:start task-abc           # Start specific task
      /agent:start task-abc quick     # Skip conflict checks

  /agent:next [quick]
    Drive mode - complete current task, auto-start next
    Examples:
      /agent:next                     # Full verify + auto-continue
      /agent:next quick               # Skip verify, fast iteration

  /agent:complete [task-id]
    Finish properly - verify, commit, show menu, you choose next
    Examples:
      /agent:complete                 # Complete current task

  /agent:pause [task-id] [options]
    Quick pivot - pause/block/handoff/abandon current work
    Examples:
      /agent:pause --reason "Break"           # Keep locks
      /agent:pause --blocked --reason "API"  # Release locks
      /agent:pause --handoff Alice            # Hand off to agent
      /agent:pause --abandon                  # Unassign task

SUPPORT COMMANDS (3 commands):

  /agent:status
    Check current work - task, locks, messages, team sync

  /agent:verify [task-id]
    Quality checks - tests, lint, security, browser

  /agent:plan
    Convert planning to tasks - analyze conversation/PRD, create Beads tasks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK TIPS:

  Speed:        /agent:start quick  /agent:next quick
  Control:      /agent:complete (manual selection)
  Quality:      /agent:verify before /agent:complete
  Coordination: All commands sync via Agent Mail

LEARN MORE:

  Full docs:    cat COMMANDS.md
  README:       cat README.md
  Dashboard:    bd-dashboard
  Agent Mail:   cat ~/.claude/CLAUDE.md

For detailed help on a specific command:
  /agent:help start
  /agent:help next
  /agent:help complete
```

**Specific command help:**
```bash
$ /agent:help start

# Agent Start - Get to Work

Usage:
- /agent:start                    # Auto-create new agent (fast!)
- /agent:start resume             # Choose from logged-out agents
- /agent:start GreatWind          # Resume specific agent by name
- /agent:start quick              # Start highest priority task immediately
- /agent:start task-abc           # Start specific task (with checks)
- /agent:start task-abc quick     # Start specific task (skip checks)

What it does:
1. Smart registration (auto-create or resume)
2. Session persistence (updates statusline)
3. Task selection (from parameter, context, or priority)
4. Conflict detection (file locks, git, dependencies)
5. Actually starts work (reserves files, sends mail, updates Beads)

[... continues with full start.md content ...]
```

---

## Use Cases

**Quick reference while coding:**
```bash
# Forgot command syntax?
/agent:help
# → Shows all commands with examples

# Need detailed info about a specific command?
/agent:help pause
# → Shows full pause.md documentation
```

**New user onboarding:**
```bash
# First time using agent commands
/agent:help
# → See all available commands and their purposes

# Ready to start first task
/agent:help start
# → Learn all variations of /agent:start
```

**Command discovery:**
```bash
# What commands are available?
/agent:help
# → Complete command reference

# How do I switch tasks quickly?
/agent:help pause
# → Learn about pause modes (block, handoff, abandon)
```
