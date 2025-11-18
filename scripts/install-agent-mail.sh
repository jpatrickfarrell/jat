#!/bin/bash

# Install Agent Mail Server
# Multi-agent coordination system via HTTP API

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Installing Agent Mail Server...${NC}"
echo ""

# Check if already installed
INSTALL_DIR="$HOME/code/jomarchy-agent-tools/mcp_agent_mail"

if [ -d "$INSTALL_DIR" ] && [ -f "$INSTALL_DIR/scripts/run_server_with_token.sh" ]; then
    echo -e "${YELLOW}  ⊘ Agent Mail Server already installed${NC}"
    echo "  Location: $INSTALL_DIR"
    echo ""
else
    echo "  → Installing Agent Mail Server (this may take 30-60 seconds)..."
    echo "  Installing to: $INSTALL_DIR"
    echo ""

    # Create temp log file for installer output
    TEMP_LOG=$(mktemp)

    # Run installer in background, capturing output
    # The installer will start the server at the end - we'll kill it after
    (curl -fsSL https://raw.githubusercontent.com/Dicklesworthstone/mcp_agent_mail/main/scripts/install.sh | bash -s -- --yes > "$TEMP_LOG" 2>&1) &
    INSTALLER_PID=$!

    # Wait for installation to complete (check for run script existence)
    echo "  Waiting for installation to complete..."
    for i in {1..60}; do
        if [ -f "$INSTALL_DIR/scripts/run_server_with_token.sh" ]; then
            echo "  Installation files detected, cleaning up..."
            sleep 2  # Let server start
            break
        fi
        sleep 1
    done

    # Kill the installer and any server it started
    pkill -P $INSTALLER_PID 2>/dev/null || true
    kill $INSTALLER_PID 2>/dev/null || true
    lsof -ti:8765 | xargs -r kill -9 2>/dev/null || true

    # Clean up log file
    rm -f "$TEMP_LOG"

    if [ -d "$INSTALL_DIR" ] && [ -f "$INSTALL_DIR/scripts/run_server_with_token.sh" ]; then
        echo -e "${GREEN}  ✓ Agent Mail Server installed successfully${NC}"
    else
        echo -e "${YELLOW}  ⚠ Installation incomplete - check manually${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}  ✓ Agent Mail ready${NC}"
echo "  Location: $INSTALL_DIR"
echo "  Server will auto-start when you run am-* commands (am-register, am-inbox, etc.)"

echo ""
echo "  Usage:"
echo "    am-register --program claude-code --model sonnet-4.5"
echo "    am-inbox AgentName"
echo "    am-send \"Subject\" \"Body\" --from AgentName --to project-team"
echo ""
