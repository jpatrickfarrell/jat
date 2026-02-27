#!/bin/bash

# Migrate non-scheduled chore tasks to issue_type='task'
#
# As part of the /schedules → /chores rename, 'chore' now means
# "recurring scheduled task". Existing non-scheduled chores should
# become regular 'task' type. Closed chores are left as-is (historical).
#
# Usage: migrate-chores-to-tasks.sh [--dry-run]
#   --dry-run  Show what would change without modifying databases

set -e

DRY_RUN=false
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
fi

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}Migrate non-scheduled chore tasks → task type${NC}"
echo -e "═══════════════════════════════════════════════"
if $DRY_RUN; then
    echo -e "${YELLOW}DRY RUN - no changes will be made${NC}"
fi
echo ""

total_migrated=0
total_skipped=0

for db in ~/code/*/.jat/tasks.db; do
    [[ -f "$db" ]] || continue
    project=$(basename "$(dirname "$(dirname "$db")")")

    # Count non-scheduled open chores (exclude closed - historical)
    count=$(sqlite3 "$db" "SELECT COUNT(*) FROM tasks WHERE issue_type='chore' AND status != 'closed' AND (schedule_cron IS NULL OR schedule_cron = '')" 2>/dev/null || echo "0")

    # Count scheduled chores (these stay as chore)
    scheduled=$(sqlite3 "$db" "SELECT COUNT(*) FROM tasks WHERE issue_type='chore' AND schedule_cron IS NOT NULL AND schedule_cron != ''" 2>/dev/null || echo "0")

    # Count closed chores (left as-is)
    closed=$(sqlite3 "$db" "SELECT COUNT(*) FROM tasks WHERE issue_type='chore' AND status = 'closed'" 2>/dev/null || echo "0")

    if [[ "$count" -gt 0 ]] || [[ "$scheduled" -gt 0 ]] || [[ "$closed" -gt 0 ]]; then
        echo -e "${BLUE}${project}${NC}:"
        if [[ "$count" -gt 0 ]]; then
            # Show which tasks would be migrated
            sqlite3 "$db" "SELECT '  → ' || id || ': ' || title FROM tasks WHERE issue_type='chore' AND status != 'closed' AND (schedule_cron IS NULL OR schedule_cron = '')" 2>/dev/null

            if ! $DRY_RUN; then
                sqlite3 "$db" "UPDATE tasks SET issue_type='task', updated_at=datetime('now') WHERE issue_type='chore' AND status != 'closed' AND (schedule_cron IS NULL OR schedule_cron = '')" 2>/dev/null
                echo -e "  ${GREEN}✓ Migrated ${count} chore(s) → task${NC}"
            else
                echo -e "  ${YELLOW}Would migrate ${count} chore(s) → task${NC}"
            fi
            total_migrated=$((total_migrated + count))
        fi
        if [[ "$scheduled" -gt 0 ]]; then
            echo -e "  Keeping ${scheduled} scheduled chore(s) as-is"
        fi
        if [[ "$closed" -gt 0 ]]; then
            echo -e "  Skipping ${closed} closed chore(s) (historical)"
            total_skipped=$((total_skipped + closed))
        fi
        echo ""
    fi
done

echo -e "═══════════════════════════════════════════════"
if $DRY_RUN; then
    echo -e "${YELLOW}Would migrate: ${total_migrated} task(s)${NC}"
else
    echo -e "${GREEN}Migrated: ${total_migrated} task(s)${NC}"
fi
echo -e "Skipped (closed): ${total_skipped} task(s)"
echo ""
