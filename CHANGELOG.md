# Changelog

All notable changes to JAT (Joe's Agent Tools) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Keyboard navigation everywhere** - Vim-style `j`/`k` navigation on every IDE route (`/triage`, `/chores`, `/automation`, `/integrations`, `/servers`, `/kanban`, `/config`, `/clients`, `/search`, `/dash`, `/memory`, `/source`, `/files`, `/data`, `/bases`, `/workflows`), plus `Enter` to open, `Esc` to clear, and `?` to show a route-specific shortcut overlay. Implemented via shared `listNav` action + `createListNav()` composable and `KeyboardShortcutsOverlay` component, propagated into JST template DNA (Flush, Meadow, Steelbridge, Headcount). See `ide/docs/keyboard-navigation.md`.
- **Keyboard Power Pack** - Five power-user features layered on top of the j/k foundation:
  - **Command Palette v2** (`Cmd+K`) — Added Agents tab with 30-most-recently-active agents, localStorage-backed recent actions that float to top on empty query and receive recency ranking boost, precomputed lowercase haystacks for fast fuzzy search over thousands of items.
  - **Bulk selection** (`V` visual mode) — Opt-in `selectable: true` on `createListNav` adds `V` (toggle visual mode), `x` (toggle single), `Shift+J/K` (toggle-and-move), `*` (all-visible), with Esc cascade (pending-motion → exit-visual → clear-selection → onEscape). Wired into `/triage`; any j/k route opts in by passing `selectable: true`.
  - **Peek mode** (`Space`) — `Space` on any j/k list opens a 40vw right-side drawer previewing the focused item; j/k continues navigating underneath and the drawer content swaps in place; `Enter` promotes to full detail drawer; `Esc` closes without promoting. Peek content is registered per-route via `registerPeek()` in `+layout.svelte`.
  - **Vim motions** (`gg` / `G` / `{n}j` / `Ctrl+D`) — `gg` (first), `G` (last), `{n}j` / `{n}k` count-prefix, `{n}G` / `{n}gg` line-jump, `Ctrl+D` / `Ctrl+U` half-page scroll, `zz` center — all built into `createListNav` with a 1.5s motion buffer and `Esc` to cancel. `KeyboardShortcutsOverlay` surfaces a "List motions (Vim)" section automatically.
  - **Marks & jumps** (`ma` / `'a` / `Ctrl+O`) — `ma`–`mz` set named marks (task ID + route), `'a`–`'z` jump to them cross-route, `Ctrl+O` / `Ctrl+I` walk the jump stack. `:delm <letter>` / `:delmm` delete marks via a floating command line (`:`). Marks overlay panel shows live active marks. Implemented in `marks.svelte.ts` store + chord handler in `+layout.svelte`.
- **`jat-search` unified search CLI** - Meta search across tasks (FTS5), memory (FTS5 + vector), and files (ripgrep) with subcommands, project filtering, and optional LLM synthesis (`--summarize`)
- **Skill agent syncing** - Skills installed via `jat-skills install` are automatically discovered by all agent programs. Claude Code gets symlinks in `~/.claude/commands/`, Pi gets directory symlinks in `~/.pi/agent/skills/`, and non-native agents (Codex, Gemini, OpenCode, Aider) receive skill info via prompt injection at spawn time. New `jat-skills sync` command for manual repair.
- **Task scheduling fields** - Command dropdown (default `/jat:start`), agent/model selector, schedule section (one-shot/recurring/cron), and due date picker in TaskCreationDrawer
- **Ingest feed system** - New `/ingest` page for managing RSS, Slack, and Telegram feed sources with guided setup wizard, poll history, manual poll trigger, last-polled timestamps, inline error indicators, and thread reply counts
- **Ingest daemon** - Background Node.js service (`jat-ingest`) that polls configured feed sources on schedule, with adapter architecture for RSS/Slack/Telegram
- **Slack channel detection** - Guided wizard flow for Slack source setup that auto-detects available channels via `conversations.list` API
- **Ingest server management** - Start/stop/restart ingest daemon from IDE Servers page with auto-start config option
- **Monaco context menu actions** - "Send to LLM" (Alt+L) and "Create Task from Selection" (Alt+T) available in all Monaco editors: FileEditor, MigrationViewer, and DiffViewer
- **Styled Monaco context menu** - Custom dark theme matching JAT FileTree style with rounded corners, oklch colors, and keybinding badges
- **Task context menus** - Right-click context menus on `/tasks` page for both open tasks (Launch, View Details, Change Status, Assign to Epic, Duplicate) and active tasks (View Details, Attach Terminal, Change Status, Duplicate, Interrupt, Pause, Complete, Close & Kill)
- Task Summary tab in task detail pane showing completion report, suggested tasks, and cross-agent intel
- Add/Add & Start buttons for creating follow-up tasks directly from Summary tab
- **Settings UI for API Keys** - Configure Anthropic, Google, OpenAI keys via IDE instead of editing .bashrc
- **Per-project secrets** - Store Supabase credentials, database passwords per project
- **Custom API keys** - Define your own API keys with custom env var names for hooks/scripts
- **`jat-secret` bash tool** - Retrieve secrets in scripts: `jat-secret stripe`, `eval $(jat-secret --export)`
- Supabase panel integration with credentials system (checks credentials.json before .env)
- Initial public release of JAT
- JAT Task IDE (SvelteKit 5)
- Agent Mail coordination system
- Browser automation tools (11 tools)
- Media generation tools (avatar, image generation)
- JAT workflow commands (start, complete, verify, etc.)
- Multi-project support with automatic detection
- Epic task management with dependency tracking
- Token usage tracking per agent
- Session automation rules system
- Voice-to-text support (local whisper.cpp)
- File explorer with Monaco editor
- Real-time WebSocket/SSE updates
- Swarm attack mode for parallel agent execution

### Changed
- `get-current-session-id` supports `--wait` flag for fresh startup retry
- Activity state polling is more resilient to transient network errors (Content-Length mismatches)
- Sidebar badge positions adjusted for collapsed nav icons
- Server restart endpoint supports ingest daemon
- Migrated from jomarchy-agent-tools to JAT branding
- Upgraded to Tailwind CSS v4
- Improved theme system with 32 DaisyUI themes

### Security
- **Secure credential storage** - API keys stored in `~/.config/jat/credentials.json` with 0600 permissions
- Credentials fallback chain: credentials.json → environment variables → .env files
- Path traversal protection in file operations
- Sensitive file patterns blocked

## [0.9.0] - 2024-12-15 (Pre-release)

### Added
- Initial dashboard implementation
- Basic Agent Mail functionality
- Core browser tools
- JAT task tracking

## Notes

JAT evolved from a collection of bash scripts and Claude commands into a comprehensive
IDE for agent orchestration. This v1.0.0 release represents the first public version
of the integrated platform.