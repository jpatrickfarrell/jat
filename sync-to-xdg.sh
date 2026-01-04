#!/bin/bash
# Sync JAT development changes to XDG installation
# Usage: ./sync-to-xdg.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

SOURCE_DIR="$HOME/code/jat"
TARGET_DIR="$HOME/.local/share/jat"

echo -e "${CYAN}🔄 JAT Development → XDG Sync${NC}"
echo ""
echo -e "Source: ${SOURCE_DIR}"
echo -e "Target: ${TARGET_DIR}"
echo ""

# Check if source exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}❌ Source directory not found: $SOURCE_DIR${NC}"
    exit 1
fi

# Check if target exists
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${RED}❌ Target directory not found: $TARGET_DIR${NC}"
    echo -e "${YELLOW}Run JAT installer first to create XDG installation${NC}"
    exit 1
fi

# Confirm before syncing
echo -e "${YELLOW}⚠️  This will overwrite the XDG installation with your dev changes${NC}"
echo -e "Continue? [y/N]: "
read -r response

if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${RED}Sync cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}Syncing files...${NC}"

# Sync all files except node_modules and .git
rsync -av --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude '.svelte-kit' \
    --exclude 'dist' \
    --exclude 'build' \
    --exclude '.env' \
    --exclude '.env.local' \
    "$SOURCE_DIR/" "$TARGET_DIR/"

echo ""
echo -e "${GREEN}✅ Sync complete!${NC}"
echo ""
echo -e "Changes synced to XDG installation:"
echo -e "  • Dashboard changes → ${CYAN}jat-dashboard${NC} will now use updated code"
echo -e "  • Tool changes → ${CYAN}am-*, db-*, etc.${NC} will use updated scripts"
echo -e "  • Config changes → Templates and shared docs updated"
echo ""
echo -e "Your dev environment (${CYAN}jat-dev${NC}) remains unchanged."