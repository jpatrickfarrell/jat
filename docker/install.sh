#!/bin/bash

# JAT Docker Install — Two commands to get JAT running on any VPS
# Usage: curl -fsSL https://raw.githubusercontent.com/joewinke/jat/master/docker/install.sh | bash
#
# What this does:
#   1. Checks for Docker + Docker Compose
#   2. Creates ~/data/jat/ and ~/projects/ directories
#   3. Downloads docker-compose.yml
#   4. Starts JAT via docker compose up -d
#
# Requirements: Docker with Compose plugin (v2)

set -euo pipefail

# Colors
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

echo ""
echo -e "${BOLD}JAT — Jomarchy Agent Tools${NC}"
echo -e "Docker install for VPS deployment"
echo ""

# ─── Check Docker ─────────────────────────────────────────────────────────────

if ! command -v docker &>/dev/null; then
    fail "Docker not found. Install it first: https://docs.docker.com/engine/install/"
fi

if ! docker compose version &>/dev/null; then
    fail "Docker Compose plugin not found. Install it: https://docs.docker.com/compose/install/"
fi

ok "Docker $(docker --version | grep -oP '\d+\.\d+\.\d+') detected"
ok "Docker Compose $(docker compose version --short) detected"

# ─── Create directories ──────────────────────────────────────────────────────

JAT_DIR="${JAT_DIR:-$HOME/jat}"
DATA_DIR="${JAT_DATA_DIR:-$HOME/data/jat}"
PROJECTS_DIR="${JAT_PROJECTS_DIR:-$HOME/projects}"
CONFIG_DIR="${JAT_CONFIG_DIR:-$HOME/.config/jat}"

info "Setting up directories..."
mkdir -p "$JAT_DIR" "$DATA_DIR" "$PROJECTS_DIR" "$CONFIG_DIR"
ok "Data:     $DATA_DIR"
ok "Projects: $PROJECTS_DIR"
ok "Config:   $CONFIG_DIR"

# ─── Download docker-compose.yml ──────────────────────────────────────────────

COMPOSE_URL="https://raw.githubusercontent.com/joewinke/jat/master/docker-compose.yml"
COMPOSE_FILE="$JAT_DIR/docker-compose.yml"

info "Downloading docker-compose.yml..."
if curl -fsSL "$COMPOSE_URL" -o "$COMPOSE_FILE"; then
    ok "Saved to $COMPOSE_FILE"
else
    fail "Failed to download docker-compose.yml"
fi

# ─── Write .env with resolved paths ──────────────────────────────────────────

cat > "$JAT_DIR/.env" <<EOF
JAT_DATA_DIR=$DATA_DIR
JAT_PROJECTS_DIR=$PROJECTS_DIR
JAT_CONFIG_DIR=$CONFIG_DIR
JAT_ORIGIN=http://$(hostname -f 2>/dev/null || hostname):3333
EOF

ok "Environment config written to $JAT_DIR/.env"

# ─── Start JAT ────────────────────────────────────────────────────────────────

echo ""
info "Starting JAT..."
cd "$JAT_DIR"

if docker compose up -d; then
    echo ""
    echo -e "${GREEN}╔───────────────────────────────────────────╗${NC}"
    echo -e "${GREEN}│                                           │${NC}"
    echo -e "${GREEN}│      ${BOLD}✓ JAT is running!${NC}${GREEN}                    │${NC}"
    echo -e "${GREEN}│                                           │${NC}"
    echo -e "${GREEN}╚───────────────────────────────────────────╝${NC}"
    echo ""
    echo "  IDE:      http://$(hostname -f 2>/dev/null || hostname):3333"
    echo "  Data:     $DATA_DIR"
    echo "  Projects: $PROJECTS_DIR"
    echo "  Config:   $CONFIG_DIR"
    echo ""
    echo "  Logs:     cd $JAT_DIR && docker compose logs -f"
    echo "  Stop:     cd $JAT_DIR && docker compose down"
    echo "  Upgrade:  cd $JAT_DIR && docker compose pull && docker compose up -d"
    echo ""
else
    fail "Failed to start JAT. Check: docker compose logs"
fi
