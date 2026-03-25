#!/bin/bash

# JAT VPS Update — Build locally, deploy to VPS
# Usage: bash tools/scripts/vps-update.sh [user@host]
#
# Builds on local machine (VPS doesn't have enough RAM for Vite)
# then ships the build artifacts + updated source to the VPS.
#
# What it does:
#   1. Pull latest locally + build IDE
#   2. Sync code + build artifacts to VPS
#   3. Resymlink CLI tools on VPS
#   4. Restart jat-ide systemd service

set -euo pipefail

# --- Colors ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

info()  { echo -e "${BLUE}  →${NC} $1"; }
ok()    { echo -e "  ${GREEN}✓${NC} $1"; }
warn()  { echo -e "  ${YELLOW}⚠${NC} $1"; }
fail()  { echo -e "  ${RED}✗${NC} $1"; exit 1; }

header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# --- Parse args ---
VPS_TARGET=""
SKIP_BUILD=false
for arg in "$@"; do
    case "$arg" in
        --help|-h)
            echo "Usage: vps-update.sh [user@host] [--skip-build]"
            echo ""
            echo "Builds locally, deploys to VPS."
            echo "Target resolves from projects.json defaults if not provided."
            echo ""
            echo "Options:"
            echo "  --skip-build   Skip local build, just sync existing artifacts"
            exit 0
            ;;
        --skip-build) SKIP_BUILD=true ;;
        *) VPS_TARGET="$arg" ;;
    esac
done

# --- Must run from local machine ---
# Find local JAT directory
LOCAL_JAT=""
for candidate in "$HOME/code/jat" "$HOME/.local/share/jat"; do
    if [ -d "$candidate/ide" ]; then
        LOCAL_JAT="$candidate"
        break
    fi
done
if [ -z "$LOCAL_JAT" ]; then
    fail "Can't find local JAT directory (checked ~/code/jat, ~/.local/share/jat)"
fi

# Resolve VPS target
if [ -z "$VPS_TARGET" ]; then
    PROJECTS_JSON="$HOME/.config/jat/projects.json"
    if [ -f "$PROJECTS_JSON" ]; then
        VPS_USER=$(jq -r '.defaults.vps_user // empty' "$PROJECTS_JSON")
        VPS_HOST=$(jq -r '.defaults.vps_host // empty' "$PROJECTS_JSON")
        if [ -n "$VPS_USER" ] && [ -n "$VPS_HOST" ]; then
            VPS_TARGET="${VPS_USER}@${VPS_HOST}"
        fi
    fi
fi
if [ -z "$VPS_TARGET" ]; then
    fail "No target specified. Usage: vps-update.sh user@host"
fi

REMOTE_JAT="~/.local/share/jat"

header "JAT VPS Update"
info "Local:  $LOCAL_JAT"
info "Remote: $VPS_TARGET:$REMOTE_JAT"

# --- Step 1: Build locally ---
header "Step 1/4 — Build locally"

cd "$LOCAL_JAT/ide"

if $SKIP_BUILD; then
    if [ ! -d "build" ]; then
        fail "No build directory found — can't skip build"
    fi
    ok "Skipping build (using existing artifacts)"
else
    info "Installing dependencies..."
    npm install 2>&1 | tail -3
    ok "Dependencies installed"

    info "Building production bundle..."
    BUILD_LOG="/tmp/jat-build-$$.log"
    # timeout: vite build can hang after completion (esbuild service stays alive)
    if timeout 120 npx vite build > "$BUILD_LOG" 2>&1; then
        ok "IDE built"
        tail -3 "$BUILD_LOG"
    else
        EXIT_CODE=$?
        # timeout returns 124 on timeout — check if build actually succeeded
        if [ "$EXIT_CODE" -eq 124 ] && grep -q '✔ done' "$BUILD_LOG" 2>/dev/null; then
            ok "IDE built (process hung after completion, killed)"
            tail -3 "$BUILD_LOG"
        else
            echo ""
            tail -20 "$BUILD_LOG"
            fail "Build failed. Full log: $BUILD_LOG"
        fi
    fi
    rm -f "$BUILD_LOG"
fi

cd "$LOCAL_JAT"

# --- Step 2: Sync to VPS ---
header "Step 2/4 — Sync to VPS"

info "Syncing code + build artifacts..."

# Delete old build first — stale chunks from previous builds cause bugs
ssh "$VPS_TARGET" "rm -rf $REMOTE_JAT/ide/build"

# Sync everything needed on VPS (no --delete to preserve VPS-only data like .jat/)
rsync -az --info=stats1 \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='ide/node_modules' \
    --exclude='ide/.svelte-kit' \
    --include='ide/build/***' \
    --include='ide/server.js' \
    --include='ide/package.json' \
    --include='ide/package-lock.json' \
    --include='ide/src/***' \
    --include='ide/svelte.config.js' \
    --include='ide/vite.config.ts' \
    --include='ide/tsconfig.json' \
    --include='ide/' \
    --include='lib/***' \
    --include='tools/***' \
    --include='shared/***' \
    --include='commands/***' \
    --include='install.sh' \
    --include='package.json' \
    --include='README.md' \
    --exclude='*' \
    "$LOCAL_JAT/" "$VPS_TARGET:$REMOTE_JAT/"

ok "Code synced"

# Sync fresh Claude credentials to VPS jat user (tokens expire, keep them fresh)
VPS_JAT_HOME=$(ssh "$VPS_TARGET" 'getent passwd jat | cut -d: -f6' 2>/dev/null || echo "/home/jat")
if [ -f "$HOME/.claude/.credentials.json" ] && [ -n "$VPS_JAT_HOME" ]; then
    scp -q "$HOME/.claude/.credentials.json" "$VPS_TARGET:$VPS_JAT_HOME/.claude/.credentials.json"
    ssh "$VPS_TARGET" "chown jat:jat $VPS_JAT_HOME/.claude/.credentials.json 2>/dev/null; true"
    ok "Claude credentials refreshed"
fi

# Write VERSION file so jat CLI can show commit info without .git
DEPLOY_HASH=$(git -C "$LOCAL_JAT" log -1 --format='%h' 2>/dev/null || echo "unknown")
DEPLOY_DATE=$(git -C "$LOCAL_JAT" log -1 --format='%cd' --date=short 2>/dev/null || echo "")
ssh "$VPS_TARGET" "echo '$DEPLOY_HASH $DEPLOY_DATE' > $REMOTE_JAT/VERSION"
ok "VERSION file written ($DEPLOY_HASH $DEPLOY_DATE)"

# Install production deps on VPS (lightweight, no build needed)
info "Installing dependencies on VPS..."
# tsx is a devDependency but needed at runtime for server.js (imports .ts source files)
ssh "$VPS_TARGET" "cd $REMOTE_JAT/ide && npm install --omit=dev 2>&1 | tail -3 && npm install tsx 2>&1 | tail -1"
ok "Dependencies installed on VPS"

# --- Step 3: Update CLI tools on VPS ---
header "Step 3/4 — Update CLI tools on VPS"

ssh "$VPS_TARGET" bash <<'REMOTE_SCRIPT'
JAT_DIR="$HOME/.local/share/jat"
BIN_DIR="$HOME/.local/bin"
mkdir -p "$BIN_DIR"

ln -sf "$JAT_DIR/tools/jt" "$BIN_DIR/jt"

TOOL_COUNT=0
for dir in tools/core tools/browser tools/agents tools/signal tools/media tools/ingest tools/memory tools/search; do
    if [ -d "$JAT_DIR/$dir" ]; then
        for tool in "$JAT_DIR/$dir"/*; do
            [ -f "$tool" ] && [ -x "$tool" ] || continue
            ln -sf "$tool" "$BIN_DIR/$(basename "$tool")"
            TOOL_COUNT=$((TOOL_COUNT + 1))
        done
    fi
done

if [ -d "$JAT_DIR/tools/agent-mail" ]; then
    for tool in "$JAT_DIR/tools/agent-mail"/am-*; do
        [ -f "$tool" ] || continue
        ln -sf "$tool" "$BIN_DIR/$(basename "$tool")"
        TOOL_COUNT=$((TOOL_COUNT + 1))
    done
fi

echo "  Symlinked $TOOL_COUNT tools + jt CLI"

# Resymlink jat commands to ~/.claude/commands/jat/
CMD_DIR="$HOME/.claude/commands/jat"
mkdir -p "$CMD_DIR"
find "$CMD_DIR" -type l -delete
for f in "$JAT_DIR/commands/jat"/*.md; do
    [ -f "$f" ] || continue
    ln -sf "$f" "$CMD_DIR/$(basename "$f")"
done
echo "  Relinked jat commands"
REMOTE_SCRIPT

ok "CLI tools + commands updated"

# --- Step 4: Restart service ---
header "Step 4/4 — Restart service"

# Sync API keys into systemd service environment
GEMINI_KEY=$(jq -r '.apiKeys.google.key // empty' "$HOME/.config/jat/credentials.json" 2>/dev/null || true)
if [ -n "$GEMINI_KEY" ]; then
    ssh "$VPS_TARGET" "
        SERVICE=/etc/systemd/system/jat-ide.service
        sed -i '/Environment=GEMINI_API_KEY/d' \$SERVICE
        sed -i '/Environment=NODE_ENV=production/a Environment=GEMINI_API_KEY=$GEMINI_KEY' \$SERVICE
        systemctl daemon-reload
    "
    ok "GEMINI_API_KEY synced to service"
fi

SERVICE_STATUS=$(ssh "$VPS_TARGET" "systemctl is-active jat-ide 2>/dev/null || true")

if [ "$SERVICE_STATUS" = "active" ]; then
    info "Restarting jat-ide service..."
    ssh "$VPS_TARGET" "systemctl restart jat-ide"
elif [ "$SERVICE_STATUS" = "failed" ]; then
    info "Resetting failed service and starting..."
    ssh "$VPS_TARGET" "systemctl reset-failed jat-ide; systemctl start jat-ide"
else
    info "Starting jat-ide service..."
    ssh "$VPS_TARGET" "systemctl start jat-ide"
fi

sleep 3

FINAL_STATUS=$(ssh "$VPS_TARGET" "systemctl is-active jat-ide 2>/dev/null || true")
if [ "$FINAL_STATUS" = "active" ]; then
    ok "Service running"
    PORT=$(ssh "$VPS_TARGET" "systemctl show jat-ide -p Environment 2>/dev/null | grep -o 'PORT=[0-9]*' | cut -d= -f2")
    PORT="${PORT:-3333}"
    ok "Listening on port $PORT"
else
    fail "Service failed to start — run: ssh $VPS_TARGET 'journalctl -u jat-ide -n 30'"
fi

# --- Done ---
AFTER=$(ssh "$VPS_TARGET" "cat $REMOTE_JAT/VERSION 2>/dev/null || echo 'unknown'")
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  Deploy complete${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
