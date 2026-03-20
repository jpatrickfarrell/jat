#!/bin/bash
#
# Session End Cleanup Hook
#
# Runs on Claude Code SessionEnd to kill orphaned processes that were
# spawned by agents (via MCP, npx, etc.) but not cleaned up when the
# agent session ended.
#
# Known offenders:
#   - chrome-devtools-mcp (spawned by browser automation MCP)
#   - Any npx-spawned MCP servers
#
# Logic: For each matching process, walk the process tree upward.
# If no living "claude" ancestor exists, the process is orphaned — kill it.
#
# Safe for parallel agents: processes with a living claude ancestor are left alone.

# Patterns of processes known to be spawned by Claude agents and not self-cleaning
ORPHAN_PATTERNS=(
    'chrome-devtools-mcp'
)

for pattern in "${ORPHAN_PATTERNS[@]}"; do
    for pid in $(pgrep -f "$pattern" 2>/dev/null); do
        # Walk up process tree looking for a living claude ancestor
        p=$pid
        has_claude_ancestor=false
        while [ "$p" != "1" ] && [ -n "$p" ] && [ -e "/proc/$p" ]; do
            comm=$(cat /proc/$p/comm 2>/dev/null) || break
            if [ "$comm" = "claude" ]; then
                has_claude_ancestor=true
                break
            fi
            p=$(awk '{print $4}' /proc/$p/stat 2>/dev/null) || break
        done

        if [ "$has_claude_ancestor" = false ]; then
            # Kill the orphaned process and its children (watchdog, etc)
            kill -- -$(ps -o pgid= -p "$pid" | tr -d ' ') 2>/dev/null || kill "$pid" 2>/dev/null
        fi
    done
done
