#!/bin/bash

# JAT VPS Setup — Fresh server bootstrap
# Usage: curl -fsSL https://jat.app/vps-setup.sh | bash
#   or:  bash tools/scripts/vps-setup.sh
#
# Supported: Arch Linux (primary), Ubuntu/Debian
# What it does:
#   1. Fix stale packages (Arch: orphaned firmware dirs)
#   2. Install system deps: Tailscale, Node 22, Claude Code, gh CLI
#   3. Configure iptables firewall (SSH + Tailscale only)
#   4. Create ~/projects/ and ~/data/jat/
#   5. Auth prompts: Tailscale, Claude, GitHub
#   6. Clone + install JAT

set -euo pipefail

# --- Colors ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# --- Helpers ---
info()  { echo -e "${BLUE}  →${NC} $1"; }
ok()    { echo -e "  ${GREEN}✓${NC} $1"; }
warn()  { echo -e "  ${YELLOW}⚠${NC} $1"; }
fail()  { echo -e "  ${RED}✗${NC} $1"; }
header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

prompt_user() {
    local prompt="$1" default="$2" varname="$3"
    echo -en "$prompt"
    if [ -t 0 ] || [ -e /dev/tty ]; then
        read -r response </dev/tty 2>/dev/null || response="$default"
    else
        echo -e "${YELLOW}(non-interactive — using default: ${default:-empty})${NC}"
        response="$default"
    fi
    eval "$varname=\"\$response\""
}

prompt_yes_no() {
    local prompt="$1" default="$2" response
    prompt_user "$prompt" "" "response"
    [ -z "$response" ] && { [ "$default" = "y" ]; return $?; }
    case "$response" in [yY]|[yY][eE][sS]) return 0;; *) return 1;; esac
}

# --- Root check ---
# Running as root is fine on a fresh VPS (Linode/DigitalOcean default)
if [ "$EUID" -eq 0 ]; then
    # When already root, strip sudo flags (-E, -u, etc.) and just run the command
    sudo() {
        while [[ "${1:-}" == -* ]]; do shift; done
        "$@"
    }
fi

# --- Detect distro ---
DISTRO="unknown"
PKG=""
if [ -f /etc/os-release ]; then
    . /etc/os-release
    case "$ID" in
        arch|manjaro|endeavouros) DISTRO="arch"; PKG="pacman";;
        ubuntu|debian|pop|linuxmint) DISTRO="debian"; PKG="apt";;
        fedora) DISTRO="fedora"; PKG="dnf";;
        *) DISTRO="$ID";;
    esac
fi

if [ "$PKG" = "" ]; then
    echo -e "${RED}ERROR: Unsupported distro ($DISTRO). Arch Linux or Ubuntu/Debian required.${NC}"
    exit 1
fi

echo ""
echo -e "${BOLD}JAT VPS Setup${NC}"
echo -e "${DIM}Detected: $DISTRO ($PKG)${NC}"
echo ""

# ============================================================================
# Step 1: Swap (for small VPS instances)
# ============================================================================
header "Step 1/11: Swap configuration"

# IDE production build needs ~1.5GB — 1GB VPS instances OOM without swap
TOTAL_MEM_MB=$(free -m | awk '/^Mem:/{print $2}')
if [ "$TOTAL_MEM_MB" -lt 2048 ] && ! swapon --show | grep -q '/'; then
    info "RAM: ${TOTAL_MEM_MB}MB — adding 2GB swap for build step..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    # Persist across reboots
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab > /dev/null
    fi
    ok "2GB swap enabled (${TOTAL_MEM_MB}MB RAM + 2048MB swap)"
elif swapon --show | grep -q '/'; then
    SWAP_MB=$(free -m | awk '/^Swap:/{print $2}')
    ok "Swap already active (${SWAP_MB}MB)"
else
    ok "RAM: ${TOTAL_MEM_MB}MB — swap not needed"
fi

# ============================================================================
# Step 2: Fix stale packages
# ============================================================================
header "Step 2/11: System packages"

if [ "$PKG" = "pacman" ]; then
    # Arch: remove orphaned firmware directories that block pacman -Syu
    # Only check top-level dirs — checking all files is too slow
    ORPHAN_DIRS=""
    for d in /usr/lib/firmware/*/; do
        [ -d "$d" ] || continue
        if ! pacman -Qo "$d" &>/dev/null; then
            ORPHAN_DIRS="$ORPHAN_DIRS $d"
        fi
    done
    if [ -n "$ORPHAN_DIRS" ]; then
        info "Cleaning orphaned firmware directories blocking updates..."
        for d in $ORPHAN_DIRS; do
            sudo rm -rf "$d" 2>/dev/null || true
        done
        ok "Cleaned orphaned firmware directories"
    fi

    info "Updating system packages..."
    sudo pacman -Syu --noconfirm
    ok "System updated"

    info "Installing base dependencies..."
    sudo pacman -S --needed --noconfirm base-devel git tmux sqlite jq curl wget rsync
    ok "Base dependencies installed"

elif [ "$PKG" = "apt" ]; then
    info "Updating package lists..."
    sudo apt update
    info "Upgrading system packages..."
    sudo apt upgrade -y
    ok "System updated"

    info "Installing base dependencies..."
    sudo apt install -y build-essential git tmux sqlite3 jq curl wget rsync
    ok "Base dependencies installed"

elif [ "$PKG" = "dnf" ]; then
    info "Updating system packages..."
    sudo dnf upgrade -y
    ok "System updated"

    info "Installing base dependencies..."
    sudo dnf install -y git tmux sqlite jq curl wget
    ok "Base dependencies installed"
fi

# ============================================================================
# Step 2: Install Tailscale
# ============================================================================
header "Step 3/11: Tailscale (private networking)"

if command -v tailscale &>/dev/null; then
    ok "Tailscale already installed ($(tailscale version 2>/dev/null | head -1))"
else
    info "Installing Tailscale..."
    if [ "$PKG" = "pacman" ]; then
        sudo pacman -S --needed --noconfirm tailscale
    else
        # Official install script works for Debian/Ubuntu/Fedora
        curl -fsSL https://tailscale.com/install.sh | sh
    fi
    ok "Tailscale installed"
fi

# Enable and start tailscaled
if ! systemctl is-active --quiet tailscaled 2>/dev/null; then
    info "Enabling tailscaled service..."
    sudo systemctl enable --now tailscaled
    ok "tailscaled service started"
fi

# ============================================================================
# Step 3: Install Node.js 22 LTS
# ============================================================================
header "Step 4/11: Node.js 22 LTS"

NODE_OK=false
if command -v node &>/dev/null; then
    NODE_VER=$(node -v 2>/dev/null | sed 's/v//')
    NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
    if [ "$NODE_MAJOR" -ge 20 ]; then
        ok "Node.js v$NODE_VER already installed"
        NODE_OK=true
    else
        warn "Node.js v$NODE_VER found — need v22 LTS"
    fi
fi

if [ "$NODE_OK" = false ]; then
    info "Installing Node.js 22 LTS via NodeSource..."
    if [ "$PKG" = "pacman" ]; then
        # Arch: nodejs-lts-jod is Node 22
        sudo pacman -S --needed --noconfirm nodejs-lts-jod npm
    elif [ "$PKG" = "apt" ]; then
        # NodeSource setup for Debian/Ubuntu
        if [ ! -f /etc/apt/sources.list.d/nodesource.list ]; then
            curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
        fi
        sudo apt install -y nodejs
    elif [ "$PKG" = "dnf" ]; then
        curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo -E bash -
        sudo dnf install -y nodejs
    fi
    ok "Node.js $(node -v) installed"
fi

# ============================================================================
# Step 4: Install Claude Code + gh CLI
# ============================================================================
header "Step 5/11: Claude Code + GitHub CLI"

# Claude Code (npm global)
if command -v claude &>/dev/null; then
    ok "Claude Code already installed ($(claude --version 2>/dev/null | head -1))"
else
    info "Installing Claude Code..."
    npm install -g @anthropic-ai/claude-code
    ok "Claude Code installed"
fi

# GitHub CLI
if command -v gh &>/dev/null; then
    ok "GitHub CLI already installed ($(gh --version 2>/dev/null | head -1))"
else
    info "Installing GitHub CLI..."
    if [ "$PKG" = "pacman" ]; then
        sudo pacman -S --needed --noconfirm github-cli
    elif [ "$PKG" = "apt" ]; then
        # Official gh repo for Debian/Ubuntu
        if [ ! -f /etc/apt/sources.list.d/github-cli.list ]; then
            curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
            sudo apt update
        fi
        sudo apt install -y gh
    elif [ "$PKG" = "dnf" ]; then
        sudo dnf install -y gh
    fi
    ok "GitHub CLI installed"
fi

# ============================================================================
# Step 5: Firewall (iptables)
# ============================================================================
header "Step 6/11: Firewall configuration"

# Skip if firewall rules already persisted
if [ -f /etc/iptables/iptables.rules ] || [ -f /etc/iptables/rules.v4 ]; then
    ok "Firewall already configured"
elif prompt_yes_no "${BLUE}Configure iptables firewall? (SSH + Tailscale only) [Y/n]${NC} " "y"; then
    info "Configuring iptables rules..."

    # Detect Tailscale interface
    TS_IFACE=$(ip link show | grep -oP 'tailscale\d+' | head -1 || echo "tailscale0")

    # Flush existing rules
    sudo iptables -F INPUT
    sudo iptables -F FORWARD

    # Default policies
    sudo iptables -P INPUT DROP
    sudo iptables -P FORWARD DROP
    sudo iptables -P OUTPUT ACCEPT

    # Allow loopback
    sudo iptables -A INPUT -i lo -j ACCEPT

    # Allow established/related connections
    sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

    # Allow SSH (port 22) from anywhere (for initial access)
    sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT

    # Allow all traffic on Tailscale interface
    sudo iptables -A INPUT -i "$TS_IFACE" -j ACCEPT

    # Allow ICMP (ping)
    sudo iptables -A INPUT -p icmp -j ACCEPT

    ok "Firewall configured (SSH + Tailscale + ICMP allowed, rest dropped)"

    # Persist rules
    if [ "$PKG" = "pacman" ]; then
        sudo pacman -S --needed --noconfirm iptables
        sudo iptables-save | sudo tee /etc/iptables/iptables.rules > /dev/null
        sudo systemctl enable --now iptables
        ok "Rules persisted via iptables.service"
    elif [ "$PKG" = "apt" ]; then
        if ! command -v netfilter-persistent &>/dev/null; then
            sudo apt install -y iptables-persistent
        fi
        sudo netfilter-persistent save
        ok "Rules persisted via netfilter-persistent"
    elif [ "$PKG" = "dnf" ]; then
        sudo dnf install -y iptables-services
        sudo service iptables save
        sudo systemctl enable --now iptables
        ok "Rules persisted via iptables-services"
    fi

    echo ""
    info "Current rules:"
    sudo iptables -L INPUT -n --line-numbers
else
    warn "Skipping firewall configuration"
fi

# ============================================================================
# Step 6: Directory structure + Auth
# ============================================================================
header "Step 7/11: Directories & authentication"

# Create directories
mkdir -p ~/projects ~/data/jat ~/.local/bin ~/.config/jat
ok "Created ~/projects/, ~/data/jat/, ~/.local/bin/, ~/.config/jat/"

# Ensure ~/.local/bin in PATH
SHELL_NAME=$(basename "$SHELL")
SHELL_RC="$HOME/.bashrc"
[ "$SHELL_NAME" = "zsh" ] && SHELL_RC="$HOME/.zshrc"

if ! grep -q '\.local/bin' "$SHELL_RC" 2>/dev/null; then
    echo '' >> "$SHELL_RC"
    echo '# JAT tools' >> "$SHELL_RC"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_RC"
    ok "Added ~/.local/bin to PATH in $SHELL_RC"
fi
export PATH="$HOME/.local/bin:$PATH"

echo ""

# --- Tailscale auth ---
if tailscale status &>/dev/null 2>&1; then
    TS_IP=$(tailscale ip -4 2>/dev/null || echo "connected")
    ok "Tailscale already connected ($TS_IP)"
else
    info "Connecting to Tailscale..."
    echo -e "  ${DIM}This will open a login URL — authenticate in your browser.${NC}"
    echo ""
    sudo tailscale up --ssh
    echo ""
    TS_IP=$(tailscale ip -4 2>/dev/null || echo "unknown")
    ok "Tailscale connected ($TS_IP)"
fi

echo ""

# --- Claude Code auth ---
if [ -d "$HOME/.claude" ] && ls "$HOME/.claude"/.credentials* &>/dev/null 2>&1; then
    ok "Claude Code already authenticated"
elif claude --version &>/dev/null 2>&1; then
    info "Claude Code setup"
    echo -e "  ${DIM}For headless servers, use: claude --setup-token${NC}"
    echo ""
    if prompt_yes_no "${BLUE}Run Claude Code auth now? [Y/n]${NC} " "y"; then
        echo ""
        echo -e "${DIM}  Starting Claude Code — follow the prompts...${NC}"
        claude || true
        echo ""
    fi
fi

# --- GitHub auth ---
if gh auth status &>/dev/null 2>&1; then
    ok "GitHub CLI already authenticated"
else
    info "GitHub CLI authentication"
    echo ""
    if prompt_yes_no "${BLUE}Run 'gh auth login' now? [Y/n]${NC} " "y"; then
        echo ""
        echo -e "  ${DIM}Tips:${NC}"
        echo -e "  ${DIM}  • Protocol: SSH (not HTTPS) — agents clone and push non-interactively${NC}"
        echo -e "  ${DIM}  • SSH key: generate a new one (name it e.g. 'vps-linode')${NC}"
        echo -e "  ${DIM}  • Passphrase: none — agents can't enter passwords${NC}"
        echo ""
        gh auth login
        echo ""
        ok "GitHub CLI authenticated"
    else
        warn "Skipping GitHub auth (run 'gh auth login' later)"
    fi
fi

# ============================================================================
# Step 7: Install JAT
# ============================================================================
header "Step 8/11: Install JAT"

JAT_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/jat"

if [ -d "$JAT_DIR" ] && [ -f "$JAT_DIR/install.sh" ]; then
    ok "JAT already cloned at $JAT_DIR"
    info "Updating..."
    (cd "$JAT_DIR" && git pull --ff-only 2>/dev/null || true)
else
    info "Cloning JAT..."
    mkdir -p "$(dirname "$JAT_DIR")"
    git clone https://github.com/joewinke/jat.git "$JAT_DIR"
    ok "JAT cloned to $JAT_DIR"
fi

echo ""
info "Running JAT installer..."
echo ""
bash "$JAT_DIR/install.sh"

# ============================================================================
# Step 9: Self-hosted Supabase (optional)
# ============================================================================
header "Step 9/11: Self-hosted Supabase (Docker)"

if [ -d "/opt/supabase-docker" ] && docker ps --format '{{.Names}}' 2>/dev/null | grep -q supabase-db; then
    ok "Supabase already running"
elif prompt_yes_no "${BLUE}Install self-hosted Supabase? [y/N]${NC} " "n"; then
    # Install Docker if not present
    if ! command -v docker &>/dev/null; then
        info "Installing Docker..."
        if [ "$PKG" = "pacman" ]; then
            sudo pacman -S --needed --noconfirm docker docker-compose
            sudo systemctl enable --now docker
        elif [ "$PKG" = "apt" ]; then
            install -m 0755 -d /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
            chmod a+r /etc/apt/keyrings/docker.asc
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        fi
        ok "Docker installed ($(docker --version))"
    else
        ok "Docker already installed"
    fi

    # Clone and configure Supabase
    info "Setting up Supabase..."
    cd /opt
    git clone --depth 1 https://github.com/supabase/supabase
    mkdir -p supabase-docker
    cp -rf supabase/docker/* supabase-docker/
    cp supabase/docker/.env.example supabase-docker/.env
    cd supabase-docker

    # Generate secrets
    info "Generating secrets..."
    sh ./utils/generate-keys.sh --update-env

    # Get Tailscale IP for binding
    TS_IP=$(tailscale ip -4 2>/dev/null || echo "")
    if [ -z "$TS_IP" ]; then
        warn "Tailscale not connected — binding to localhost only"
        TS_IP="127.0.0.1"
    fi

    # Configure URLs
    sed -i \
        -e "s|^SUPABASE_PUBLIC_URL=.*|SUPABASE_PUBLIC_URL=http://${TS_IP}:8000|" \
        -e "s|^API_EXTERNAL_URL=.*|API_EXTERNAL_URL=http://${TS_IP}:8000|" \
        -e "s|^SITE_URL=.*|SITE_URL=http://localhost:5173|" \
        -e "s|^ENABLE_EMAIL_AUTOCONFIRM=.*|ENABLE_EMAIL_AUTOCONFIRM=true|" \
        -e "s|^POOLER_TENANT_ID=.*|POOLER_TENANT_ID=$(hostname)|" \
        .env

    # Bind all ports to Tailscale IP only
    sed -i \
        -e "s|^\(.*\)- \${KONG_HTTP_PORT}:8000/tcp|\1- ${TS_IP}:\${KONG_HTTP_PORT}:8000/tcp|" \
        -e "s|^\(.*\)- \${KONG_HTTPS_PORT}:8443/tcp|\1- ${TS_IP}:\${KONG_HTTPS_PORT}:8443/tcp|" \
        -e "s|^\(.*\)- \${POSTGRES_PORT}:5432|\1- ${TS_IP}:\${POSTGRES_PORT}:5432|" \
        -e "s|^\(.*\)- \${POOLER_PROXY_PORT_TRANSACTION}:6543|\1- ${TS_IP}:\${POOLER_PROXY_PORT_TRANSACTION}:6543|" \
        docker-compose.yml

    ok "Ports bound to Tailscale IP ($TS_IP) only"

    # Pull and start
    info "Pulling Supabase images (this takes a few minutes)..."
    docker compose pull
    info "Starting Supabase..."
    docker compose up -d

    # Wait for health
    sleep 10
    HEALTHY=$(docker ps --filter "name=supabase" --filter "health=healthy" --format '{{.Names}}' | wc -l)
    ok "Supabase running ($HEALTHY containers healthy)"

    # Set up daily backup
    info "Setting up daily backups..."
    mkdir -p /opt/backups/supabase
    cat > /opt/supabase-docker/backup.sh << 'BACKUP'
#!/bin/bash
BACKUP_DIR=/opt/backups/supabase
KEEP_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"
docker exec supabase-db pg_dump -U postgres -d postgres \
    --clean --if-exists -n public -n auth -n storage \
    -F custom -f /tmp/backup.dump
docker cp supabase-db:/tmp/backup.dump "$BACKUP_DIR/supabase_$TIMESTAMP.dump"
docker exec supabase-db rm /tmp/backup.dump
gzip "$BACKUP_DIR/supabase_$TIMESTAMP.dump"
find "$BACKUP_DIR" -name "*.dump.gz" -mtime +$KEEP_DAYS -delete
echo "$(date): Backup complete: supabase_$TIMESTAMP.dump.gz ($(du -h "$BACKUP_DIR/supabase_$TIMESTAMP.dump.gz" | cut -f1))"
BACKUP
    chmod +x /opt/supabase-docker/backup.sh
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/supabase-docker/backup.sh >> /var/log/supabase-backup.log 2>&1") | crontab -
    ok "Daily backup cron set (2am, 30-day retention)"

    echo ""
    info "Supabase access (Tailscale only):"
    echo -e "  Studio:   ${BOLD}http://${TS_IP}:8000${NC}"
    echo -e "  REST API: ${BOLD}http://${TS_IP}:8000/rest/v1/${NC}"
    echo -e "  Postgres: ${BOLD}postgresql://postgres.$(hostname):PASS@${TS_IP}:5432/postgres${NC}"
    echo ""
    info "Credentials are in /opt/supabase-docker/.env"
    echo ""

    cd ~
else
    info "Skipping Supabase (run this script again to install later)"
fi

# ============================================================================
# Step 10: Systemd service (auto-start + crash recovery)
# ============================================================================
header "Step 10/11: JAT IDE service"

SERVICE_FILE="/etc/systemd/system/jat-ide.service"
if [ -f "$SERVICE_FILE" ]; then
    ok "jat-ide.service already installed"
    # Reload in case the unit file changed
    sudo systemctl daemon-reload
else
    info "Creating systemd service for JAT IDE..."
    sudo tee "$SERVICE_FILE" > /dev/null <<'UNIT'
[Unit]
Description=JAT IDE Server
After=network.target tailscaled.service
Wants=tailscaled.service
# Restart up to 5 times within 60s, then stop trying
StartLimitIntervalSec=60
StartLimitBurst=5

[Service]
Type=simple
User=root
WorkingDirectory=/root/.local/share/jat/ide
Environment=PORT=3333
Environment=NODE_ENV=production
Environment=PATH=/root/.local/bin:/usr/local/bin:/usr/bin:/bin
ExecStart=/usr/bin/node --import tsx server.js
Restart=on-failure
RestartSec=3
StandardOutput=journal
StandardError=journal
SyslogIdentifier=jat-ide

[Install]
WantedBy=multi-user.target
UNIT
    ok "Created $SERVICE_FILE"
fi

# Enable and start
sudo systemctl enable jat-ide 2>/dev/null
if systemctl is-active --quiet jat-ide 2>/dev/null; then
    info "Restarting jat-ide service..."
    sudo systemctl restart jat-ide
else
    info "Starting jat-ide service..."
    sudo systemctl start jat-ide
fi

# Wait for it to come up
sleep 2
if systemctl is-active --quiet jat-ide 2>/dev/null; then
    ok "JAT IDE service running (auto-starts on boot, restarts on crash)"
else
    warn "Service failed to start — check: journalctl -u jat-ide -n 20"
fi

# Kill any manually-started instances (they'd conflict on the port)
pkill -f "node build" --oldest 2>/dev/null || true

# ============================================================================
# Pre-configure Claude Code for headless agent operation
# Sets flags that would otherwise require interactive prompts on first run
# ============================================================================
header "Step 11/11: Configuring Claude Code for headless operation"

CLAUDE_JSON="$HOME/.claude.json"
CLAUDE_SETTINGS="$HOME/.claude/settings.json"

# 1. Mark onboarding complete + trust project directories
if [ -f "$CLAUDE_JSON" ]; then
    python3 - <<PYEOF
import json, os

with open("$CLAUDE_JSON") as f:
    d = json.load(f)

d["hasCompletedOnboarding"] = True

project_template = {
    "allowedTools": [],
    "mcpContextUris": [],
    "mcpServers": {},
    "enabledMcpjsonServers": [],
    "disabledMcpjsonServers": [],
    "hasTrustDialogAccepted": True,
    "projectOnboardingSeenCount": 1,
    "hasClaudeMdExternalIncludesApproved": True,
    "hasClaudeMdExternalIncludesWarningShown": True,
    "lastCost": 0, "lastAPIDuration": 0,
    "lastAPIDurationWithoutRetries": 0, "lastToolDuration": 0
}

home = os.path.expanduser("~")
if "projects" not in d:
    d["projects"] = {}

for path in [home, f"{home}/.claude", f"{home}/projects/personal", f"{home}/projects"]:
    if path not in d["projects"]:
        d["projects"][path] = project_template.copy()
    else:
        d["projects"][path]["hasTrustDialogAccepted"] = True
        d["projects"][path]["hasClaudeMdExternalIncludesApproved"] = True

with open("$CLAUDE_JSON", "w") as f:
    json.dump(d, f, indent=2)

print("  hasCompletedOnboarding = true, project dirs pre-trusted")
PYEOF
    ok "Claude onboarding configured"
else
    warn ".claude.json not found — run 'claude -p hello' once to initialize, then re-run this step"
fi

# 2. Skip bypass permissions warning (required for --dangerously-skip-permissions)
if [ -f "$CLAUDE_SETTINGS" ]; then
    python3 -c "
import json
with open('$CLAUDE_SETTINGS') as f:
    d = json.load(f)
d['skipDangerousModePermissionPrompt'] = True
with open('$CLAUDE_SETTINGS', 'w') as f:
    json.dump(d, f, indent=2)
print('  skipDangerousModePermissionPrompt = true')
"
else
    echo '{"skipDangerousModePermissionPrompt": true}' > "$CLAUDE_SETTINGS"
fi
ok "Bypass permissions prompt suppressed"

# ============================================================================
# Done
# ============================================================================
echo ""
echo -e "${GREEN}╔───────────────────────────────────────────────╗${NC}"
echo -e "${GREEN}│                                               │${NC}"
echo -e "${GREEN}│    ${BOLD}✓ VPS Setup Complete!${NC}${GREEN}                     │${NC}"
echo -e "${GREEN}│                                               │${NC}"
echo -e "${GREEN}╚───────────────────────────────────────────────╝${NC}"
echo ""
echo "What was set up:"
echo ""
echo "  ✓ System packages updated"
echo "  ✓ Tailscale (private networking)"
echo "  ✓ Node.js 22 LTS"
echo "  ✓ Claude Code"
echo "  ✓ GitHub CLI"
{ [ -f /etc/iptables/iptables.rules ] || [ -f /etc/iptables/rules.v4 ]; } && echo "  ✓ Firewall (SSH + Tailscale only)" || true
echo "  ✓ JAT (tools, IDE, agent registry)"
echo "  ✓ JAT IDE systemd service (auto-start + crash recovery)"
[ -d "/opt/supabase-docker" ] && echo "  ✓ Self-hosted Supabase (Tailscale-only, daily backups)" || true
echo ""
TS_IP=$(tailscale ip -4 2>/dev/null || echo "N/A")
echo -e "Tailscale IP: ${BOLD}$TS_IP${NC}"
echo -e "JAT IDE:      ${BOLD}http://$TS_IP:3333${NC}"
[ -d "/opt/supabase-docker" ] && echo -e "Supabase:     ${BOLD}http://$TS_IP:8000${NC}" || true
echo ""
echo "Service management:"
echo "  systemctl status jat-ide     # Check status"
echo "  journalctl -u jat-ide -f     # Live logs"
echo "  systemctl restart jat-ide    # Restart"
[ -d "/opt/supabase-docker" ] && echo "  cd /opt/supabase-docker && docker compose ps   # Supabase status" || true
[ -d "/opt/supabase-docker" ] && echo "  /opt/supabase-docker/backup.sh                 # Manual backup" || true
echo ""
echo "Next steps:"
echo "  1. Open http://$TS_IP:3333 in your browser"
echo "  2. Add your first project in the IDE"
echo "  3. Spawn agents from your local machine via 'jt spawn --remote'"
echo ""
