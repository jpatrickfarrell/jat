#!/bin/bash

# migrate.sh - Import local JAT data to a VPS
#
# Migrates JAT configuration, project databases, and source repos
# from a local machine to an always-on VPS.
#
# Usage: ./migrate.sh [user@host]
#   If no host given, reads vps_user/vps_host from ~/.config/jat/projects.json
#
# What it does:
#   1. Syncs ~/.config/jat/ to VPS
#   2. Syncs .jat/ databases from each registered project
#   3. Updates paths in remote projects.json (~/code/ -> ~/projects/)
#   4. Clones all registered GitHub repos to ~/projects/ on VPS
#
# Idempotent - safe to run multiple times.

set -euo pipefail

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
DIM='\033[2m'
NC='\033[0m'

CONFIG_DIR="$HOME/.config/jat"
PROJECTS_JSON="$CONFIG_DIR/projects.json"
REMOTE_PROJECTS_DIR="~/projects"

log()  { echo -e "${BLUE}→${NC} $*"; }
ok()   { echo -e "  ${GREEN}✓${NC} $*"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $*"; }
err()  { echo -e "${RED}ERROR:${NC} $*" >&2; }
dim()  { echo -e "  ${DIM}$*${NC}"; }

usage() {
    echo "Usage: $(basename "$0") [user@host]"
    echo ""
    echo "Migrate local JAT data to a VPS."
    echo "If no host given, reads vps_user/vps_host from projects.json defaults."
    echo ""
    echo "Options:"
    echo "  --dry-run    Show what would be done without doing it"
    echo "  --help       Show this help"
    exit 0
}

# Parse args
DRY_RUN=false
VPS_TARGET=""

for arg in "$@"; do
    case "$arg" in
        --dry-run) DRY_RUN=true ;;
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

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  JAT Migration → ${VPS_TARGET}${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# Verify connectivity
log "Testing SSH connection..."
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes "$VPS_TARGET" "echo ok" &>/dev/null; then
    err "Cannot connect to $VPS_TARGET"
    echo "  Make sure SSH is configured (key-based auth recommended)"
    exit 1
fi
ok "Connected to $VPS_TARGET"

# Ensure remote directories exist
log "Preparing remote directories..."
run_remote "mkdir -p ~/.config/jat $REMOTE_PROJECTS_DIR"
ok "Remote directories ready"

# ── Step 1: Sync JAT config ──────────────────────────────────────────────────

log "Syncing JAT config (~/.config/jat/)..."

# Sync everything except caches and temp files
rsync "${RSYNC_OPTS[@]}" \
    --exclude='cache/' \
    --exclude='ingest-dedup.db' \
    --exclude='ingest-files/' \
    "$CONFIG_DIR/" "$VPS_TARGET:~/.config/jat/"

ok "JAT config synced"

# ── Step 2: Update paths in remote projects.json ─────────────────────────────

log "Updating project paths on VPS (~/code/ → ~/projects/)..."

# Build a jq script to rewrite paths
# - ~/code/X → ~/projects/X
# - /home/USER/code/X → ~/projects/X
# - /tmp/ paths → ~/projects/NAME (extract project name)
LOCAL_HOME="$HOME"
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

# ── Step 3: Sync .jat/ databases from each project ──────────────────────────

log "Syncing project databases (.jat/)..."

SYNCED=0
SKIPPED=0

# Read project paths from local projects.json
while IFS= read -r line; do
    PROJ_KEY=$(echo "$line" | jq -r '.key')
    PROJ_PATH=$(echo "$line" | jq -r '.path' | sed "s|^~|$HOME|g")

    # Resolve the .jat directory
    JAT_DIR="$PROJ_PATH/.jat"

    if [ ! -d "$JAT_DIR" ]; then
        dim "$PROJ_KEY: no .jat/ directory, skipping"
        ((SKIPPED++)) || true
        continue
    fi

    # Determine remote project path
    REMOTE_PATH=$(echo "$line" | jq -r '.path' \
        | sed "s|^~/code/|~/projects/|" \
        | sed "s|^${LOCAL_HOME}/code/|~/projects/|" \
        | sed -E "s|^/tmp/.*/([^/]+)$|~/projects/\1|")

    # Ensure remote .jat/ exists
    run_remote "mkdir -p ${REMOTE_PATH}/.jat"

    if ! $DRY_RUN; then
        rsync "${RSYNC_OPTS[@]}" \
            "$JAT_DIR/" "$VPS_TARGET:${REMOTE_PATH}/.jat/"
    else
        dim "[dry-run] rsync $JAT_DIR/ → $VPS_TARGET:${REMOTE_PATH}/.jat/"
    fi

    ok "$PROJ_KEY → ${REMOTE_PATH}/.jat/"
    ((SYNCED++)) || true

done < <(jq -c '.projects | to_entries[] | {key: .key, path: .value.path}' "$PROJECTS_JSON")

echo -e "  ${GREEN}Synced: $SYNCED${NC}  Skipped: $SKIPPED"

# ── Step 4: Clone GitHub repos ───────────────────────────────────────────────

log "Cloning GitHub repos to VPS..."

CLONED=0
CLONE_SKIPPED=0
CLONE_FAILED=0

# Get git remote URLs from local repos
while IFS= read -r line; do
    PROJ_KEY=$(echo "$line" | jq -r '.key')
    PROJ_PATH=$(echo "$line" | jq -r '.path' | sed "s|^~|$HOME|g")

    # Skip non-existent local paths
    if [ ! -d "$PROJ_PATH/.git" ]; then
        dim "$PROJ_KEY: not a git repo locally, skipping"
        ((CLONE_SKIPPED++)) || true
        continue
    fi

    # Get remote URL
    REMOTE_URL=$(git -C "$PROJ_PATH" remote get-url origin 2>/dev/null || true)
    if [ -z "$REMOTE_URL" ]; then
        dim "$PROJ_KEY: no git remote, skipping"
        ((CLONE_SKIPPED++)) || true
        continue
    fi

    # Determine remote project directory name
    REMOTE_DIR_NAME=$(basename "$PROJ_PATH")

    # Check if already cloned on VPS
    ALREADY_CLONED=$(run_remote "test -d $REMOTE_PROJECTS_DIR/$REMOTE_DIR_NAME/.git && echo yes || echo no" 2>/dev/null || echo "no")

    if [ "$ALREADY_CLONED" = "yes" ]; then
        dim "$PROJ_KEY: already cloned"
        ((CLONE_SKIPPED++)) || true
        continue
    fi

    log "Cloning $PROJ_KEY ($REMOTE_URL)..."
    if $DRY_RUN; then
        dim "[dry-run] git clone $REMOTE_URL $REMOTE_PROJECTS_DIR/$REMOTE_DIR_NAME"
        ((CLONED++)) || true
    else
        if run_remote "git clone '$REMOTE_URL' '$REMOTE_PROJECTS_DIR/$REMOTE_DIR_NAME'" 2>/dev/null; then
            ok "$PROJ_KEY cloned"
            ((CLONED++)) || true
        else
            warn "$PROJ_KEY: clone failed (check SSH keys on VPS)"
            ((CLONE_FAILED++)) || true
        fi
    fi

done < <(jq -c '.projects | to_entries[] | {key: .key, path: .value.path}' "$PROJECTS_JSON")

echo -e "  ${GREEN}Cloned: $CLONED${NC}  Skipped: $CLONE_SKIPPED  Failed: $CLONE_FAILED"

# ── Step 5: Sync agent registry ──────────────────────────────────────────────

log "Syncing agent registry..."

AGENT_MAIL_DB="$HOME/.agent-mail.db"
if [ -f "$AGENT_MAIL_DB" ]; then
    rsync "${RSYNC_OPTS[@]}" "$AGENT_MAIL_DB" "$VPS_TARGET:~/.agent-mail.db"
    ok "Agent registry synced"
else
    dim "No agent registry found, skipping"
fi

# ── Summary ──────────────────────────────────────────────────────────────────

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Migration Complete                      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo "  Config:     ~/.config/jat/ synced"
echo "  Databases:  $SYNCED project .jat/ dirs synced"
echo "  Repos:      $CLONED cloned, $CLONE_SKIPPED skipped, $CLONE_FAILED failed"
echo "  Paths:      Updated to ~/projects/"
echo ""

if $DRY_RUN; then
    echo -e "  ${YELLOW}This was a dry run. Re-run without --dry-run to apply.${NC}"
    echo ""
fi

if [ "$CLONE_FAILED" -gt 0 ]; then
    echo -e "  ${YELLOW}Some clones failed. Ensure GitHub SSH keys are set up on the VPS:${NC}"
    echo "    ssh $VPS_TARGET"
    echo "    ssh-keygen -t ed25519"
    echo "    # Add public key to GitHub: https://github.com/settings/keys"
    echo ""
fi

echo "  Next steps on VPS:"
echo "    ssh $VPS_TARGET"
echo "    cd ~/projects/jat && ./install.sh    # Install JAT tools"
echo ""
