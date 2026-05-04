#!/bin/bash

# Statusline and Hooks Setup
# - Copy statusline.sh to ~/.claude/statusline.sh (GLOBAL)
# - Copy post-bash hook to ~/.claude/hooks/
# - Configure settings.json in each project with statusline and hook

# Note: Don't use 'set -e' so we continue even if one project fails

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Setting up statusline and hooks...${NC}"
echo ""

# Determine JAT installation directory
# Accept as first argument from install.sh, or auto-detect
if [ -n "$1" ]; then
    JAT_DIR="$1"
    echo -e "${BLUE}Using JAT directory: $JAT_DIR${NC}"
elif [ -n "${JAT_INSTALL_DIR:-}" ] && [ -d "$JAT_INSTALL_DIR" ]; then
    JAT_DIR="$JAT_INSTALL_DIR"
elif [ -d "${XDG_DATA_HOME:-$HOME/.local/share}/jat" ]; then
    JAT_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/jat"
elif [ -f "$HOME/.config/jat/projects.json" ]; then
    _jat_path=$(jq -r '.projects.jat.path // empty' "$HOME/.config/jat/projects.json" 2>/dev/null | sed "s|^~|$HOME|g")
    if [ -n "$_jat_path" ] && [ -d "$_jat_path" ]; then
        JAT_DIR="$_jat_path"
    fi
fi

if [ -z "${JAT_DIR:-}" ]; then
    echo -e "${RED}ERROR: JAT installation not found${NC}"
    echo "Searched in:"
    echo "  - \$JAT_INSTALL_DIR env var"
    echo "  - ${XDG_DATA_HOME:-$HOME/.local/share}/jat"
    echo "  - projects.json jat.path"
    exit 1
fi

# ============================================================================
# STEP 1: Install global statusline to ~/.claude/
# ============================================================================

echo -e "${BLUE}Step 1: Installing global statusline...${NC}"

mkdir -p "$HOME/.claude"

STATUSLINE_SOURCE="$JAT_DIR/.claude/statusline.sh"
STATUSLINE_DEST="$HOME/.claude/statusline.sh"

if [ -f "$STATUSLINE_SOURCE" ]; then
    ln -sf "$STATUSLINE_SOURCE" "$STATUSLINE_DEST"
    echo -e "  ${GREEN}✓ Linked statusline.sh to ~/.claude/${NC}"
else
    echo -e "  ${RED}✗ Statusline source not found: $STATUSLINE_SOURCE${NC}"
    exit 1
fi

echo ""

# ============================================================================
# STEP 1b: Migrate agent session files to .claude/sessions/
# ============================================================================

echo -e "${BLUE}Step 1b: Migrating agent session files...${NC}"

# Find all projects with .claude directories
for project_dir in "$HOME/code"/*; do
    if [ -d "$project_dir/.claude" ]; then
        project_name=$(basename "$project_dir")
        sessions_dir="$project_dir/.claude/sessions"

        # Create sessions directory if it doesn't exist
        mkdir -p "$sessions_dir"

        # Count files to migrate
        legacy_count=$(find "$project_dir/.claude" -maxdepth 1 -name "agent-*.txt" 2>/dev/null | wc -l)
        legacy_jsonl=$(find "$project_dir/.claude" -maxdepth 1 -name "agent-*-activity.jsonl" 2>/dev/null | wc -l)

        if [ "$legacy_count" -gt 0 ] || [ "$legacy_jsonl" -gt 0 ]; then
            # Move agent files to sessions directory
            find "$project_dir/.claude" -maxdepth 1 -name "agent-*.txt" -exec mv {} "$sessions_dir/" \; 2>/dev/null
            find "$project_dir/.claude" -maxdepth 1 -name "agent-*-activity.jsonl" -exec mv {} "$sessions_dir/" \; 2>/dev/null
            echo -e "  ${GREEN}✓ $project_name: Migrated $legacy_count txt + $legacy_jsonl jsonl files${NC}"
        fi
    fi
done

echo -e "  ${GREEN}✓ Migration complete${NC}"
echo ""

# ============================================================================
# STEP 2: Install global hook to ~/.claude/hooks/
# ============================================================================

echo -e "${BLUE}Step 2: Installing global hook...${NC}"

GLOBAL_HOOKS_DIR="$HOME/.claude/hooks"
mkdir -p "$GLOBAL_HOOKS_DIR"

# Copy post-bash hook
HOOK_SOURCE="$JAT_DIR/.claude/hooks/post-bash-agent-state-refresh.sh"

# If hook doesn't exist in JAT yet, create it
if [ ! -f "$HOOK_SOURCE" ]; then
    echo "  → Creating post-bash hook template..."
    mkdir -p "$JAT_DIR/.claude/hooks"

    cat > "$HOOK_SOURCE" << 'EOF'
#!/bin/bash
#
# Post-Bash Hook: Agent State Refresh
#
# Detects when agent coordination commands are executed and triggers
# statusline refresh by outputting a message (which becomes a conversation
# message, which triggers statusline update).
#
# Monitored commands:
#   - am-* (Agent Mail: reserve, release, send, reply, ack, etc.)
#   - jt (JAT Tasks: create, update, close, etc.)
#   - /jat:* slash commands (via SlashCommand tool)
#
# Hook input (stdin): JSON with tool name, input, and output
# Hook output (stdout): Message to display (triggers statusline refresh)

# Read JSON input from stdin
input_json=$(cat)

# Extract the bash command that was executed
command=$(echo "$input_json" | jq -r '.input.command // empty')

# Check if command is empty or null
if [[ -z "$command" || "$command" == "null" ]]; then
    exit 0
fi

# Detect agent coordination commands
# Pattern: am-* (Agent Mail tools) or jt followed by space (JAT Tasks commands)
if echo "$command" | grep -qE '^(am-|jt\s)'; then
    # Extract the base command for display (first word)
    base_cmd=$(echo "$command" | awk '{print $1}')

    # Output a brief message - this triggers statusline refresh!
    # Keep it minimal to avoid cluttering the conversation
    echo "✓ $base_cmd executed"
    exit 0
fi

# No agent coordination command detected - stay silent
exit 0
EOF

    chmod +x "$HOOK_SOURCE"
fi

# Symlink all hooks from JAT repo to global hooks directory
# Symlinking (not copying) means updates to JAT propagate automatically
ln -sf "$HOOK_SOURCE" "$GLOBAL_HOOKS_DIR/post-bash-agent-state-refresh.sh"
echo -e "  ${GREEN}✓ Linked post-bash-agent-state-refresh.sh to ~/.claude/hooks/${NC}"

for hook_name in \
    post-bash-jat-signal.sh \
    session-start-agent-identity.sh \
    pre-ask-user-question.sh \
    pre-compact-save-agent.sh \
    user-prompt-signal.sh \
    monitor-output.sh \
    log-tool-activity.sh \
    session-end-cleanup.sh; do
    src="$JAT_DIR/.claude/hooks/$hook_name"
    if [ -f "$src" ]; then
        ln -sf "$src" "$GLOBAL_HOOKS_DIR/$hook_name"
        echo -e "  ${GREEN}✓ Linked $hook_name to ~/.claude/hooks/${NC}"
    else
        echo -e "  ${YELLOW}⚠ Hook not found: $src${NC}"
    fi
done

echo ""

# ============================================================================
# STEP 2b: Configure global hooks in settings.local.json
# ============================================================================

echo -e "${BLUE}Step 2b: Configuring global hooks in settings.local.json...${NC}"

SETTINGS_LOCAL="$HOME/.claude/settings.local.json"

# Create settings.local.json if it doesn't exist
if [ ! -f "$SETTINGS_LOCAL" ]; then
    echo '{}' > "$SETTINGS_LOCAL"
fi

# Check if hooks are already configured
if grep -q '"SessionStart"' "$SETTINGS_LOCAL" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} SessionStart hook already configured"

    # Add PreCompact if missing (upgrade path for older installs)
    if ! grep -q '"PreCompact"' "$SETTINGS_LOCAL" 2>/dev/null; then
        TEMP_SETTINGS=$(mktemp)
        if jq '.hooks = (.hooks // {}) * {
            "PreCompact": [
                {
                    "matcher": ".*",
                    "hooks": [
                        {
                            "type": "command",
                            "command": "~/.claude/hooks/pre-compact-save-agent.sh",
                            "statusMessage": "Saving agent identity..."
                        }
                    ]
                }
            ]
        }' "$SETTINGS_LOCAL" > "$TEMP_SETTINGS" 2>/dev/null; then
            mv "$TEMP_SETTINGS" "$SETTINGS_LOCAL"
            echo -e "  ${GREEN}✓ Added PreCompact hook to settings.local.json${NC}"
        else
            echo -e "  ${YELLOW}⚠ Failed to add PreCompact hook${NC}"
            rm -f "$TEMP_SETTINGS"
        fi
    else
        echo -e "  ${GREEN}✓${NC} PreCompact hook already configured"
    fi

    # Add UserPromptSubmit if missing (upgrade path for older installs)
    if ! grep -q '"UserPromptSubmit"' "$SETTINGS_LOCAL" 2>/dev/null; then
        TEMP_SETTINGS=$(mktemp)
        if jq '.hooks = (.hooks // {}) * {
            "UserPromptSubmit": [
                {
                    "matcher": ".*",
                    "hooks": [
                        {
                            "type": "command",
                            "command": "~/.claude/hooks/user-prompt-signal.sh",
                            "streamStdinJson": true
                        }
                    ]
                }
            ]
        }' "$SETTINGS_LOCAL" > "$TEMP_SETTINGS" 2>/dev/null; then
            mv "$TEMP_SETTINGS" "$SETTINGS_LOCAL"
            echo -e "  ${GREEN}✓ Added UserPromptSubmit hook to settings.local.json${NC}"
        else
            echo -e "  ${YELLOW}⚠ Failed to add UserPromptSubmit hook${NC}"
            rm -f "$TEMP_SETTINGS"
        fi
    else
        echo -e "  ${GREEN}✓${NC} UserPromptSubmit hook already configured"
    fi

    # Add SessionEnd if missing (upgrade path for older installs)
    if ! grep -q '"SessionEnd"' "$SETTINGS_LOCAL" 2>/dev/null; then
        TEMP_SETTINGS=$(mktemp)
        if jq '.hooks = (.hooks // {}) * {
            "SessionEnd": [
                {
                    "hooks": [
                        {
                            "type": "command",
                            "command": "~/.claude/hooks/session-end-cleanup.sh"
                        }
                    ]
                }
            ]
        }' "$SETTINGS_LOCAL" > "$TEMP_SETTINGS" 2>/dev/null; then
            mv "$TEMP_SETTINGS" "$SETTINGS_LOCAL"
            echo -e "  ${GREEN}✓ Added SessionEnd hook to settings.local.json${NC}"
        else
            echo -e "  ${YELLOW}⚠ Failed to add SessionEnd hook${NC}"
            rm -f "$TEMP_SETTINGS"
        fi
    else
        echo -e "  ${GREEN}✓${NC} SessionEnd hook already configured"
    fi

    # Add log-tool-activity PostToolUse hooks if missing (upgrade path)
    if ! grep -q 'log-tool-activity' "$SETTINGS_LOCAL" 2>/dev/null; then
        TEMP_SETTINGS=$(mktemp)
        # Replace existing PostToolUse array with expanded version that includes
        # log-tool-activity for both Bash and non-Bash tools
        if jq '.hooks.PostToolUse = [
            {
                "matcher": "^Bash$",
                "hooks": (
                    [(.hooks.PostToolUse[]? | .hooks[]? | select(.command | test("log-tool-activity") | not))] +
                    [{"type": "command", "command": "~/.claude/hooks/log-tool-activity.sh"}]
                )
            },
            {
                "matcher": "NONBASH_MATCHER_PLACEHOLDER",
                "hooks": [
                    {
                        "type": "command",
                        "command": "~/.claude/hooks/log-tool-activity.sh"
                    }
                ]
            }
        ]' "$SETTINGS_LOCAL" | sed 's/NONBASH_MATCHER_PLACEHOLDER/^(?!Bash$).*/' > "$TEMP_SETTINGS" 2>/dev/null; then
            mv "$TEMP_SETTINGS" "$SETTINGS_LOCAL"
            echo -e "  ${GREEN}✓ Added log-tool-activity PostToolUse hooks to settings.local.json${NC}"
        else
            echo -e "  ${YELLOW}⚠ Failed to add log-tool-activity hooks${NC}"
            rm -f "$TEMP_SETTINGS"
        fi
    else
        echo -e "  ${GREEN}✓${NC} log-tool-activity hooks already configured"
    fi
else
    # Add SessionStart and PostToolUse hooks to settings.local.json
    TEMP_SETTINGS=$(mktemp)
    if jq '. * {
        "hooks": ((.hooks // {}) * {
            "SessionStart": [
                {
                    "matcher": ".*",
                    "hooks": [
                        {
                            "type": "command",
                            "command": "~/.claude/hooks/session-start-agent-identity.sh",
                            "statusMessage": "Setting up agent identity..."
                        }
                    ]
                }
            ],
            "PreToolUse": [
                {
                    "matcher": "AskUserQuestion",
                    "hooks": [
                        {
                            "type": "command",
                            "command": "~/.claude/hooks/pre-ask-user-question.sh"
                        }
                    ]
                }
            ],
            "PreCompact": [
                {
                    "matcher": ".*",
                    "hooks": [
                        {
                            "type": "command",
                            "command": "~/.claude/hooks/pre-compact-save-agent.sh",
                            "statusMessage": "Saving agent identity..."
                        }
                    ]
                }
            ],
            "PostToolUse": [
                {
                    "matcher": "^Bash$",
                    "hooks": [
                        {
                            "type": "command",
                            "command": "~/.claude/hooks/post-bash-jat-signal.sh"
                        },
                        {
                            "type": "command",
                            "command": "~/.claude/hooks/log-tool-activity.sh"
                        }
                    ]
                },
                {
                    "matcher": "NONBASH_MATCHER_PLACEHOLDER",
                    "hooks": [
                        {
                            "type": "command",
                            "command": "~/.claude/hooks/log-tool-activity.sh"
                        }
                    ]
                }
            ],
            "UserPromptSubmit": [
                {
                    "matcher": ".*",
                    "hooks": [
                        {
                            "type": "command",
                            "command": "~/.claude/hooks/user-prompt-signal.sh",
                            "streamStdinJson": true
                        }
                    ]
                }
            ],
            "SessionEnd": [
                {
                    "hooks": [
                        {
                            "type": "command",
                            "command": "~/.claude/hooks/session-end-cleanup.sh"
                        }
                    ]
                }
            ]
        })
    }' "$SETTINGS_LOCAL" | sed 's/NONBASH_MATCHER_PLACEHOLDER/^(?!Bash$).*/' > "$TEMP_SETTINGS" 2>/dev/null; then
        mv "$TEMP_SETTINGS" "$SETTINGS_LOCAL"
        echo -e "  ${GREEN}✓ Added SessionStart, PreCompact, PostToolUse, UserPromptSubmit, and SessionEnd hooks to settings.local.json${NC}"
    else
        echo -e "  ${YELLOW}⚠ Failed to update settings.local.json${NC}"
        rm -f "$TEMP_SETTINGS"
    fi
fi

echo ""

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Statusline and Hooks Setup Complete${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "  Global statusline: ~/.claude/statusline.sh -> $JAT_DIR/.claude/statusline.sh"
echo "  Global hooks (symlinked from $JAT_DIR/.claude/hooks/):"
echo "    - session-start-agent-identity.sh (SessionStart)"
echo "    - pre-ask-user-question.sh (PreToolUse)"
echo "    - pre-compact-save-agent.sh (PreCompact)"
echo "    - post-bash-agent-state-refresh.sh (PostToolUse)"
echo "    - post-bash-jat-signal.sh (PostToolUse)"
echo "    - log-tool-activity.sh (PostToolUse)"
echo "    - user-prompt-signal.sh (UserPromptSubmit)"
echo "    - session-end-cleanup.sh (SessionEnd)"
echo "    - monitor-output.sh (helper)"
echo ""
echo "  To configure a project's settings.json, run inside that repo:"
echo "    jt init"
echo ""
