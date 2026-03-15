# Jomarchy Agent Tools

Lightweight bash tools for agent orchestration, database operations, monitoring, development, and browser automation.

Full project context is in JAT knowledge bases — run `jt bases list` to see all available context.

@~/code/jat/AGENTS.md

## Commands

```bash
# IDE
cd ide && npm run dev    # Dev server (http://127.0.0.1:5174)
cd ide && npm run build  # Production build
jat                      # Start IDE (checks deps, opens browser)

# Tools
./install.sh             # Install/refresh tool symlinks

# Tasks
jt ready --json          # Find available work
jt list --status open    # List open tasks
jt audit                 # Check context injection compliance
```
