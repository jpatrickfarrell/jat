.PHONY: help setup build install dev up stop status tools hooks check test test-ide clean fresh sync uninstall

# JAT (Jomarchy Agent Tools) - Build & Install
# https://github.com/joewinke/jat

JAT_DIR := $(shell pwd)
XDG_DIR := $(HOME)/.local/share/jat
IDE_DIR := $(JAT_DIR)/ide

# ─── Help ────────────────────────────────────────────────────────────────────

help: ## Show this help
	@echo ""
	@echo "  \033[1mJAT Makefile\033[0m"
	@echo ""
	@echo "  \033[36mSetup & Install\033[0m"
	@grep -E '^(setup|build|install|tools|hooks):.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "    \033[36m%-12s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "  \033[36mDevelopment\033[0m"
	@grep -E '^(dev|up|stop|status|check|test|test-ide):.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "    \033[36m%-12s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "  \033[36mMaintenance\033[0m"
	@grep -E '^(clean|fresh|sync|uninstall):.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "    \033[36m%-12s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ─── Setup & Install ────────────────────────────────────────────────────────

setup: ## Install system deps (tmux, sqlite, jq, node)
	@echo "🔧 Checking system dependencies..."
	@command -v tmux >/dev/null 2>&1 || (echo "  Installing tmux..." && brew install tmux)
	@command -v sqlite3 >/dev/null 2>&1 || (echo "  Installing sqlite3..." && brew install sqlite)
	@command -v jq >/dev/null 2>&1 || (echo "  Installing jq..." && brew install jq)
	@command -v node >/dev/null 2>&1 || (echo "  Installing node..." && brew install node)
	@echo "✅ System dependencies ready"

build: ## Install npm deps for root + IDE
	@echo "📦 Installing root dependencies..."
	@cd $(JAT_DIR) && npm install
	@echo "📦 Installing IDE dependencies..."
	@cd $(IDE_DIR) && npm install --legacy-peer-deps
	@echo "✅ Dependencies installed"

tools: ## Symlink CLI tools to ~/.local/bin
	@bash $(JAT_DIR)/tools/scripts/symlink-tools.sh

hooks: ## Install statusline, hooks, and tmux config
	@bash $(JAT_DIR)/tools/scripts/setup-statusline-and-hooks.sh $(JAT_DIR)
	@bash $(JAT_DIR)/tools/scripts/setup-tmux.sh

install: setup build tools hooks ## Full install: deps + build + tools + hooks
	@echo ""
	@echo "✅ JAT fully installed from $(JAT_DIR)"
	@echo ""
	@echo "  Run 'make dev' to start the IDE"

# ─── Development ─────────────────────────────────────────────────────────────

dev: ## Start IDE dev server (http://127.0.0.1:5174)
	@cd $(IDE_DIR) && npm run dev

up: dev ## Alias for 'make dev'

stop: ## Kill any running IDE dev server
	@echo "🛑 Stopping IDE dev server..."
	@-pkill -f "vite dev --host 127.0.0.1" 2>/dev/null || true
	@-lsof -ti:5174 | xargs kill 2>/dev/null || true
	@echo "✅ Stopped"

status: ## Show running JAT processes and tmux sessions
	@echo "── IDE Dev Server ──"
	@lsof -i:5174 2>/dev/null | head -5 || echo "  Not running"
	@echo ""
	@echo "── tmux Sessions ──"
	@tmux list-sessions 2>/dev/null | grep -E "^jat-" || echo "  No JAT agent sessions"
	@echo ""
	@echo "── Agent Registry ──"
	@command -v am-agents >/dev/null 2>&1 && am-agents 2>/dev/null | head -10 || echo "  am-agents not available"

check: ## Run svelte-check (type checking)
	@cd $(IDE_DIR) && npm run check

test: ## Run root-level tests
	@cd $(JAT_DIR) && npm test

test-ide: ## Run IDE tests (vitest)
	@cd $(IDE_DIR) && npm test

# ─── Maintenance ─────────────────────────────────────────────────────────────

clean: ## Remove node_modules and build artifacts
	@echo "🧹 Cleaning..."
	@rm -rf $(JAT_DIR)/node_modules
	@rm -rf $(IDE_DIR)/node_modules
	@rm -rf $(IDE_DIR)/.svelte-kit
	@rm -rf $(IDE_DIR)/dist
	@rm -rf $(IDE_DIR)/build
	@echo "✅ Clean"

fresh: clean build ## Clean everything and reinstall from scratch

sync: ## Sync dev changes to XDG installation
	@$(JAT_DIR)/sync-to-xdg.sh

uninstall: ## Remove JAT from XDG location
	@echo "⚠️  Removing JAT from $(XDG_DIR)..."
	@$(JAT_DIR)/uninstall.sh
