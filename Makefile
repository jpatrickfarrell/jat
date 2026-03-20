.PHONY: help setup build install dev up stop status tools hooks check test test-ide clean fresh sync uninstall
.PHONY: docker-build docker-up docker-down docker-logs docker-shell docker-status

# JAT (Jomarchy Agent Tools) - Build & Install
# https://github.com/joewinke/jat

JAT_DIR := $(shell pwd)
XDG_DIR := $(HOME)/.local/share/jat
IDE_DIR := $(JAT_DIR)/ide
DOCKER_IMAGE := jat-ide
DOCKER_CONTAINER := jat-ide

# ─── Help ────────────────────────────────────────────────────────────────────

help: ## Show this help
	@echo ""
	@echo "  \033[1mJAT Makefile\033[0m"
	@echo ""
	@echo "  \033[36mSetup & Install (native)\033[0m"
	@grep -E '^(setup|build|install|tools|hooks):.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "    \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "  \033[36mDevelopment (native)\033[0m"
	@grep -E '^(dev|up|stop|status|check|test|test-ide):.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "    \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "  \033[36mDocker\033[0m"
	@grep -E '^docker-[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "    \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "  \033[36mMaintenance\033[0m"
	@grep -E '^(clean|fresh|sync|uninstall):.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "    \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ─── Setup & Install (native) ───────────────────────────────────────────────

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

# ─── Development (native) ───────────────────────────────────────────────────

dev: ## Start IDE dev server (http://127.0.0.1:3333)
	@cd $(IDE_DIR) && npm run dev

up: dev ## Alias for 'make dev'

stop: ## Kill any running IDE dev server
	@echo "🛑 Stopping IDE dev server..."
	@-pkill -f "vite dev --host 127.0.0.1" 2>/dev/null || true
	@-lsof -ti:3333 | xargs kill 2>/dev/null || true
	@echo "✅ Stopped"

status: ## Show running JAT processes and tmux sessions
	@echo "── IDE Dev Server ──"
	@lsof -i:3333 2>/dev/null | head -5 || echo "  Not running"
	@echo ""
	@echo "── Docker ──"
	@docker ps --filter name=$(DOCKER_CONTAINER) --format "  {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "  Docker not available"
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

# ─── Docker ──────────────────────────────────────────────────────────────────

docker-build: ## Build the JAT Docker image
	@echo "🐳 Building JAT Docker image..."
	@docker build -t $(DOCKER_IMAGE) .
	@echo "✅ Image built: $(DOCKER_IMAGE)"

docker-up: ## Start JAT in Docker (builds if needed)
	@echo "🐳 Starting JAT in Docker..."
	@mkdir -p $(HOME)/.config/jat $(HOME)/.claude/sessions
	@touch $(HOME)/.agent-mail.db
	@docker compose up -d --build
	@echo ""
	@echo "✅ JAT IDE running at http://localhost:3333"
	@echo ""
	@echo "  Logs:   make docker-logs"
	@echo "  Shell:  make docker-shell"
	@echo "  Stop:   make docker-down"

docker-down: ## Stop and remove JAT container
	@echo "🛑 Stopping JAT container..."
	@docker compose down
	@echo "✅ Stopped"

docker-logs: ## Tail JAT container logs
	@docker compose logs -f

docker-shell: ## Open a shell in the running container
	@docker exec -it $(DOCKER_CONTAINER) bash

docker-status: ## Show Docker container health and resource usage
	@echo "── Container ──"
	@docker ps --filter name=$(DOCKER_CONTAINER) --format "  Status: {{.Status}}\n  Ports:  {{.Ports}}" 2>/dev/null || echo "  Not running"
	@echo ""
	@echo "── Health ──"
	@docker inspect --format='  {{.State.Health.Status}}' $(DOCKER_CONTAINER) 2>/dev/null || echo "  No health data"
	@echo ""
	@echo "── Resources ──"
	@docker stats --no-stream --format "  CPU: {{.CPUPerc}}\tMem: {{.MemUsage}}" $(DOCKER_CONTAINER) 2>/dev/null || echo "  Not running"

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
