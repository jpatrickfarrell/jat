#!/bin/bash

# migrate.sh - Copy local JAT projects to a VPS
#
# Copies JAT configuration, project databases, and source repos
# from a local machine to an always-on VPS. Local data is never modified.
#
# Usage: ./migrate.sh [user@host] [--all] [--dry-run]
#   If no host given, reads vps_user/vps_host from ~/.config/jat/projects.json
#
# Features:
#   - Interactive project selector (TUI with arrow keys + space)
#   - --all flag to copy everything without prompting
#   - Safe: copies only, never modifies local data
#   - Idempotent - safe to run multiple times
#
# What it does:
#   1. Syncs ~/.config/jat/ config (selected projects only)
#   2. Clones GitHub repos to ~/projects/ on VPS
#   3. Copies .jat/ databases from each selected project
#   4. Updates paths in remote projects.json (~/code/ -> ~/projects/)
#   5. Restarts jat-ide service if running

set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'
CYAN='\033[0;36m'

# Preflight: check required tools
for cmd in rsync jq ssh git; do
    if ! command -v "$cmd" &>/dev/null; then
        echo -e "\033[0;31mERROR:\033[0m $cmd is required but not installed."
        [ "$cmd" = "rsync" ] && echo "  Install: sudo pacman -S rsync  (or: sudo apt install rsync)"
        exit 1
    fi
done

CONFIG_DIR="$HOME/.config/jat"
PROJECTS_JSON="$CONFIG_DIR/projects.json"
REMOTE_PROJECTS_DIR="~/projects"

log()  { echo -e "${BLUE}  ->${NC} $*"; }
ok()   { echo -e "  ${GREEN}ok${NC} $*"; }
warn() { echo -e "  ${YELLOW}!!${NC} $*"; }
err()  { echo -e "${RED}ERROR:${NC} $*" >&2; }
dim()  { echo -e "  ${DIM}$*${NC}"; }

usage() {
    echo "Usage: $(basename "$0") [options] [user@host]"
    echo ""
    echo "Copy local JAT projects to a VPS. Local data is never modified."
    echo "If no host given, reads vps_user/vps_host from projects.json defaults."
    echo ""
    echo "Options:"
    echo "  --all        Copy all projects (skip selector)"
    echo "  --dry-run    Show what would be done without doing it"
    echo "  --help       Show this help"
    exit 0
}

# ============================================================================
# TUI Project Selector
# ============================================================================

# Interactive checkbox selector using arrow keys + space
# Sets SELECTED_INDICES array with selected indices
select_projects() {
    local -n _items=$1    # project display names
    local -n _selected=$2 # output: selected indices
    local count=${#_items[@]}

    if [ "$count" -eq 0 ]; then
        echo "  No projects found."
        return 1
    fi

    # State: 0 = unselected, 1 = selected
    local -a checked
    for ((i=0; i<count; i++)); do
        checked[$i]=0
    done

    # Extra row for "Select All"
    local cursor=0
    local total=$((count + 1))  # +1 for Select All

    # Hide cursor
    tput civis 2>/dev/null || true

    # Cleanup on exit
    cleanup_tui() {
        tput cnorm 2>/dev/null || true  # Show cursor
    }
    trap cleanup_tui EXIT

    # Draw the selector
    draw() {
        # Move cursor up to redraw (skip on first draw)
        if [ "${DRAWN:-}" = "1" ]; then
            tput cuu "$total" 2>/dev/null || printf '\033[%dA' "$total"
        fi

        # Select All row
        local all_checked=1
        for ((i=0; i<count; i++)); do
            if [ "${checked[$i]}" -eq 0 ]; then
                all_checked=0
                break
            fi
        done

        if [ "$cursor" -eq 0 ]; then
            if [ "$all_checked" -eq 1 ]; then
                printf "  ${CYAN}>${NC} ${GREEN}[x]${NC} ${BOLD}Select All${NC}                              \n"
            else
                printf "  ${CYAN}>${NC} [ ] ${BOLD}Select All${NC}                              \n"
            fi
        else
            if [ "$all_checked" -eq 1 ]; then
                printf "    ${GREEN}[x]${NC} ${BOLD}Select All${NC}                              \n"
            else
                printf "    [ ] ${BOLD}Select All${NC}                              \n"
            fi
        fi

        # Project rows
        for ((i=0; i<count; i++)); do
            local row=$((i + 1))
            local mark=" "
            [ "${checked[$i]}" -eq 1 ] && mark="${GREEN}x${NC}"

            if [ "$cursor" -eq "$row" ]; then
                printf "  ${CYAN}>${NC} [%b] %s\n" "$mark" "${_items[$i]}"
            else
                printf "    [%b] %s\n" "$mark" "${_items[$i]}"
            fi
        done

        DRAWN=1
    }

    echo ""
    echo -e "  ${BOLD}Select projects to copy:${NC}"
    echo -e "  ${DIM}Arrow keys: navigate | Space: toggle | Enter: confirm${NC}"
    echo ""

    draw

    # Read keypresses
    while true; do
        # Read single char (raw mode)
        IFS= read -rsn1 key </dev/tty 2>/dev/null || break

        case "$key" in
            # Arrow keys send escape sequences: ESC [ A/B
            # Read each byte separately for reliability
            $'\x1b')
                IFS= read -rsn1 -t 0.5 ch1 </dev/tty 2>/dev/null || continue
                [ "$ch1" = "[" ] || continue
                IFS= read -rsn1 -t 0.5 ch2 </dev/tty 2>/dev/null || continue
                case "$ch2" in
                    'A') # Up
                        [ "$cursor" -gt 0 ] && cursor=$((cursor - 1))
                        ;;
                    'B') # Down
                        [ "$cursor" -lt $((total - 1)) ] && cursor=$((cursor + 1))
                        ;;
                esac
                ;;
            'k') # vim up
                [ "$cursor" -gt 0 ] && cursor=$((cursor - 1))
                ;;
            'j') # vim down
                [ "$cursor" -lt $((total - 1)) ] && cursor=$((cursor + 1))
                ;;
            ' ') # Space: toggle
                if [ "$cursor" -eq 0 ]; then
                    # Select All toggle
                    local any_unchecked=0
                    for ((i=0; i<count; i++)); do
                        [ "${checked[$i]}" -eq 0 ] && any_unchecked=1
                    done
                    local new_val=1
                    [ "$any_unchecked" -eq 0 ] && new_val=0
                    for ((i=0; i<count; i++)); do
                        checked[$i]=$new_val
                    done
                else
                    local idx=$((cursor - 1))
                    checked[$idx]=$(( 1 - checked[$idx] ))
                fi
                ;;
            '') # Enter: confirm
                break
                ;;
            'q') # Quit
                cleanup_tui
                echo ""
                echo "  Cancelled."
                exit 0
                ;;
        esac

        draw
    done

    # Show cursor again
    tput cnorm 2>/dev/null || true

    # Collect selected indices
    _selected=()
    for ((i=0; i<count; i++)); do
        if [ "${checked[$i]}" -eq 1 ]; then
            _selected+=("$i")
        fi
    done

    echo ""
}

# ============================================================================
# Parse args
# ============================================================================

DRY_RUN=false
SELECT_ALL=false
VPS_TARGET=""

for arg in "$@"; do
    case "$arg" in
        --dry-run) DRY_RUN=true ;;
        --all) SELECT_ALL=true ;;
        --help|-h) usage ;;
        *) VPS_TARGET="$arg" ;;
    esac
done

# Resolve VPS target
if [ -z "$VPS_TARGET" ]; then
    if [ ! -f "$PROJECTS_JSON" ]; then
        err "No target specified and $PROJECTS_JSON not found"
        exit 1
    fi
    VPS_USER=$(jq -r '.defaults.vps_user // empty' "$PROJECTS_JSON")
    VPS_HOST=$(jq -r '.defaults.vps_host // empty' "$PROJECTS_JSON")
    if [ -z "$VPS_USER" ] || [ -z "$VPS_HOST" ]; then
        err "No target specified and vps_user/vps_host not in projects.json defaults"
        echo "Usage: $(basename "$0") user@host"
        exit 1
    fi
    VPS_TARGET="${VPS_USER}@${VPS_HOST}"
fi

RSYNC_OPTS=(-az --info=name)
if $DRY_RUN; then
    RSYNC_OPTS+=(--dry-run)
fi

run_remote() {
    if $DRY_RUN; then
        dim "[dry-run] ssh $VPS_TARGET $*"
    else
        ssh "$VPS_TARGET" "$@"
    fi
}

# ============================================================================
# Header + connectivity
# ============================================================================

echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${BOLD}  JAT Copy to VPS${NC}"
echo -e "${DIM}  ${VPS_TARGET}${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
$DRY_RUN && echo -e "  ${YELLOW}DRY RUN - no changes will be made${NC}" && echo ""

# Verify connectivity
log "Testing SSH connection..."
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes "$VPS_TARGET" "echo ok" &>/dev/null; then
    err "Cannot connect to $VPS_TARGET"
    echo "  Make sure SSH is configured (key-based auth recommended)"
    exit 1
fi
ok "Connected to $VPS_TARGET"

# ============================================================================
# Load projects + TUI selector
# ============================================================================

if [ ! -f "$PROJECTS_JSON" ]; then
    err "$PROJECTS_JSON not found"
    exit 1
fi

# Load project data into arrays
PROJ_KEYS=()
PROJ_PATHS=()
PROJ_DISPLAY=()

while IFS= read -r line; do
    key=$(echo "$line" | jq -r '.key')
    path=$(echo "$line" | jq -r '.path')
    resolved_path=$(echo "$path" | sed "s|^~|$HOME|g")

    # Gather info for display
    local_info=""
    if [ -d "$resolved_path/.git" ]; then
        remote_url=$(git -C "$resolved_path" remote get-url origin 2>/dev/null || true)
        if [ -n "$remote_url" ]; then
            # Extract repo name from URL
            repo=$(echo "$remote_url" | sed -E 's|.*/([^/]+)(\.git)?$|\1|')
            local_info="git:$repo"
        else
            local_info="git (no remote)"
        fi
    elif [ -d "$resolved_path" ]; then
        local_info="local dir"
    else
        local_info="not found locally"
    fi

    has_jat=""
    [ -d "$resolved_path/.jat" ] && has_jat=" +db"

    PROJ_KEYS+=("$key")
    PROJ_PATHS+=("$path")
    PROJ_DISPLAY+=("$(printf '%-20s %s%s' "$key" "$local_info" "$has_jat")")

done < <(jq -c '.projects | to_entries[] | {key: .key, path: .value.path}' "$PROJECTS_JSON")

TOTAL_PROJECTS=${#PROJ_KEYS[@]}

if [ "$TOTAL_PROJECTS" -eq 0 ]; then
    err "No projects found in $PROJECTS_JSON"
    exit 1
fi

echo ""
echo -e "  Found ${BOLD}$TOTAL_PROJECTS${NC} projects in projects.json"

# Select projects
SELECTED_INDICES=()

if $SELECT_ALL; then
    for ((i=0; i<TOTAL_PROJECTS; i++)); do
        SELECTED_INDICES+=("$i")
    done
    echo -e "  ${DIM}--all: copying all projects${NC}"
elif [ ! -t 0 ]; then
    # Non-interactive: copy all
    for ((i=0; i<TOTAL_PROJECTS; i++)); do
        SELECTED_INDICES+=("$i")
    done
    echo -e "  ${DIM}Non-interactive: copying all projects${NC}"
else
    select_projects PROJ_DISPLAY SELECTED_INDICES
fi

SELECTED_COUNT=${#SELECTED_INDICES[@]}

if [ "$SELECTED_COUNT" -eq 0 ]; then
    echo "  No projects selected. Nothing to do."
    exit 0
fi

echo -e "  Copying ${BOLD}$SELECTED_COUNT${NC} project(s)..."
echo ""

# Build list of selected project keys for filtering projects.json
SELECTED_KEYS=()
for idx in "${SELECTED_INDICES[@]}"; do
    SELECTED_KEYS+=("${PROJ_KEYS[$idx]}")
done

# ============================================================================
# Step 1: Sync JAT config (with filtered projects.json)
# ============================================================================

log "Copying JAT config (~/.config/jat/)..."

# Ensure remote directories exist
run_remote "mkdir -p ~/.config/jat $REMOTE_PROJECTS_DIR"

# Sync config dir (excluding projects.json — we'll write a filtered one)
rsync "${RSYNC_OPTS[@]}" \
    --exclude='cache/' \
    --exclude='ingest-dedup.db' \
    --exclude='ingest-files/' \
    --exclude='projects.json' \
    "$CONFIG_DIR/" "$VPS_TARGET:~/.config/jat/"

# Merge selected projects into remote projects.json (preserves existing VPS projects)
FILTER_KEYS=$(printf '"%s",' "${SELECTED_KEYS[@]}")
FILTER_KEYS="[${FILTER_KEYS%,}]"

LOCAL_HOME="$HOME"
# Extract only selected projects from local config
SELECTED_JSON=$(jq --argjson keys "$FILTER_KEYS" '
    .projects | with_entries(select(.key | IN($keys[])))
' "$PROJECTS_JSON")

if $DRY_RUN; then
    dim "[dry-run] Merge $SELECTED_COUNT projects into remote projects.json"
else
    # Read existing remote projects.json, merge selected projects in, write back
    echo "$SELECTED_JSON" | ssh "$VPS_TARGET" '
        NEW_PROJECTS=$(cat)
        REMOTE_FILE=~/.config/jat/projects.json
        if [ -f "$REMOTE_FILE" ]; then
            # Merge: new projects override existing ones with same key, others preserved
            jq --argjson new "$NEW_PROJECTS" ".projects |= (. + \$new)" "$REMOTE_FILE" > "${REMOTE_FILE}.tmp" \
                && mv "${REMOTE_FILE}.tmp" "$REMOTE_FILE"
        else
            # No existing file — create one with just these projects
            echo "{\"projects\": $NEW_PROJECTS, \"defaults\": {}}" | jq . > "$REMOTE_FILE"
        fi
    '
fi

REMOTE_TOTAL=$(run_remote "jq '.projects | length' ~/.config/jat/projects.json 2>/dev/null || echo 0")
ok "Config copied ($SELECTED_COUNT added, $REMOTE_TOTAL total on VPS)"

# ============================================================================
# Step 2: Clone GitHub repos
# ============================================================================

log "Cloning repos to VPS..."

CLONED=0
CLONE_SKIPPED=0
CLONE_FAILED=0

for idx in "${SELECTED_INDICES[@]}"; do
    key="${PROJ_KEYS[$idx]}"
    path="${PROJ_PATHS[$idx]}"
    resolved_path=$(echo "$path" | sed "s|^~|$HOME|g")

    # Skip non-git repos
    if [ ! -d "$resolved_path/.git" ]; then
        dim "$key: not a git repo, skipping clone"
        ((CLONE_SKIPPED++)) || true
        continue
    fi

    REMOTE_URL=$(git -C "$resolved_path" remote get-url origin 2>/dev/null || true)
    if [ -z "$REMOTE_URL" ]; then
        dim "$key: no git remote, skipping clone"
        ((CLONE_SKIPPED++)) || true
        continue
    fi

    REMOTE_DIR_NAME=$(basename "$resolved_path")

    # Check if already cloned
    ALREADY=$(run_remote "test -d $REMOTE_PROJECTS_DIR/$REMOTE_DIR_NAME/.git && echo yes || echo no" 2>/dev/null || echo "no")
    if [ "$ALREADY" = "yes" ]; then
        ok "$key: already on VPS"
        ((CLONE_SKIPPED++)) || true
        continue
    fi

    if $DRY_RUN; then
        dim "[dry-run] git clone $REMOTE_URL -> $REMOTE_PROJECTS_DIR/$REMOTE_DIR_NAME"
        ((CLONED++)) || true
    else
        log "Cloning $key..."
        if run_remote "git clone '$REMOTE_URL' '$REMOTE_PROJECTS_DIR/$REMOTE_DIR_NAME'" 2>/dev/null; then
            ok "$key cloned"
            ((CLONED++)) || true
        else
            warn "$key: clone failed (check SSH keys on VPS)"
            ((CLONE_FAILED++)) || true
        fi
    fi
done

echo -e "  Repos: ${GREEN}$CLONED cloned${NC}, $CLONE_SKIPPED existing, $CLONE_FAILED failed"

# ============================================================================
# Step 3: Copy .jat/ databases
# ============================================================================

log "Copying project databases (.jat/)..."

DB_SYNCED=0
DB_SKIPPED=0

for idx in "${SELECTED_INDICES[@]}"; do
    key="${PROJ_KEYS[$idx]}"
    path="${PROJ_PATHS[$idx]}"
    resolved_path=$(echo "$path" | sed "s|^~|$HOME|g")
    jat_dir="$resolved_path/.jat"

    if [ ! -d "$jat_dir" ]; then
        dim "$key: no .jat/ directory"
        ((DB_SKIPPED++)) || true
        continue
    fi

    # Remote project path
    remote_path=$(echo "$path" \
        | sed "s|^~/code/|~/projects/|" \
        | sed "s|^${LOCAL_HOME}/code/|~/projects/|" \
        | sed -E "s|^/tmp/.*/([^/]+)$|~/projects/\1|")

    run_remote "mkdir -p ${remote_path}/.jat"

    if $DRY_RUN; then
        dim "[dry-run] rsync $jat_dir/ -> $VPS_TARGET:${remote_path}/.jat/"
    else
        rsync "${RSYNC_OPTS[@]}" "$jat_dir/" "$VPS_TARGET:${remote_path}/.jat/"
    fi

    ok "$key .jat/ copied"
    ((DB_SYNCED++)) || true
done

echo -e "  Databases: ${GREEN}$DB_SYNCED copied${NC}, $DB_SKIPPED skipped"

# ============================================================================
# Step 4: Update paths in remote projects.json
# ============================================================================

log "Updating paths on VPS (~/code/ -> ~/projects/)..."

run_remote "
    if [ -f ~/.config/jat/projects.json ]; then
        jq '
            .projects |= with_entries(
                .value.path = (
                    .value.path
                    | gsub(\"^~/code/\"; \"~/projects/\")
                    | gsub(\"^${LOCAL_HOME}/code/\"; \"~/projects/\")
                    | if startswith(\"/tmp/\") then
                        \"~/projects/\" + (split(\"/\") | last)
                      else . end
                )
                | if .value.server_path then
                    .value.server_path = (
                        .value.server_path
                        | gsub(\"^~/code/\"; \"~/projects/\")
                        | gsub(\"^${LOCAL_HOME}/code/\"; \"~/projects/\")
                    )
                  else . end
            )
        ' ~/.config/jat/projects.json > ~/.config/jat/projects.json.tmp \
        && mv ~/.config/jat/projects.json.tmp ~/.config/jat/projects.json
    fi
"

ok "Paths updated"

# ============================================================================
# Step 5: Copy agent registry
# ============================================================================

log "Copying agent registry..."

AGENT_MAIL_DB="$HOME/.agent-mail.db"
if [ -f "$AGENT_MAIL_DB" ]; then
    rsync "${RSYNC_OPTS[@]}" "$AGENT_MAIL_DB" "$VPS_TARGET:~/.agent-mail.db"
    ok "Agent registry copied"
else
    dim "No agent registry found, skipping"
fi

# ============================================================================
# Step 6: Restart service if running
# ============================================================================

log "Checking jat-ide service..."

SERVICE_STATUS=$(run_remote "systemctl is-active jat-ide 2>/dev/null || echo inactive")
if [ "$SERVICE_STATUS" = "active" ]; then
    if $DRY_RUN; then
        dim "[dry-run] systemctl restart jat-ide"
    else
        run_remote "systemctl restart jat-ide"
        ok "jat-ide service restarted"
    fi
else
    dim "jat-ide service not running (start with: systemctl start jat-ide)"
fi

# ============================================================================
# Summary
# ============================================================================

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Copy Complete${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo "  Projects:   $SELECTED_COUNT selected"
echo "  Repos:      $CLONED cloned, $CLONE_SKIPPED existing"
echo "  Databases:  $DB_SYNCED copied"
echo "  Config:     ~/.config/jat/ synced"
echo "  Local data: untouched"
echo ""

if $DRY_RUN; then
    echo -e "  ${YELLOW}This was a dry run. Re-run without --dry-run to apply.${NC}"
    echo ""
fi

if [ "$CLONE_FAILED" -gt 0 ]; then
    echo -e "  ${YELLOW}Some clones failed. Set up SSH keys on the VPS:${NC}"
    echo "    ssh $VPS_TARGET"
    echo "    ssh-keygen -t ed25519"
    echo "    # Add public key to GitHub: https://github.com/settings/keys"
    echo ""
fi

TS_IP=$(ssh "$VPS_TARGET" "tailscale ip -4 2>/dev/null" 2>/dev/null || echo "")
if [ -n "$TS_IP" ]; then
    echo -e "  IDE: ${BOLD}http://$TS_IP:3333${NC}"
else
    echo -e "  IDE: ${BOLD}http://$VPS_TARGET:3333${NC}"
fi
echo ""
