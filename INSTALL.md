# JAT Installation Guide

## Quick Install

```bash
# Clone and install
git clone https://github.com/joewinke/jat ~/.local/share/jat
cd ~/.local/share/jat
make install
```

Or install system dependencies first if needed:
```bash
make setup   # installs tmux, sqlite3, jq, node via brew/apt
make install # full install
```

Then start the IDE:
```bash
jat
```

Open your browser to: http://localhost:3333

---

## What Gets Installed Where

Understanding exactly what `make install` touches is important. Here is the complete inventory:

### Shell tools — `~/.local/bin/`

Symlinks only. All 40+ JAT CLI tools (browser automation, database, agent mail, signals, etc.) are symlinked from the repo into `~/.local/bin/`. Nothing is copied — removing the symlinks fully removes the tools.

```
~/.local/bin/jat          → /path/to/jat/cli/jat
~/.local/bin/jt           → /path/to/jat/cli/jt
~/.local/bin/am-register  → /path/to/jat/tools/agents/am-register
~/.local/bin/browser-nav.js → /path/to/jat/tools/browser/browser-nav.js
... (40+ tools)
```

Your shell config (`~/.zshrc` or `~/.bashrc`) gets one line added if `~/.local/bin` is not already in `PATH`:
```bash
export PATH="$HOME/.local/bin:$PATH"
```

### Claude Code integration — `~/.claude/`

This is the part that makes JAT work inside Claude Code sessions.

**`~/.claude/statusline.sh`** — a symlink to `jat/.claude/statusline.sh`. This is a script that renders the multi-line status bar (agent name, task, git branch, context remaining). It only activates in projects whose `.claude/settings.json` references it — other projects are completely unaffected.

**`~/.claude/hooks/`** — symlinks to hook scripts in the JAT repo:

| Hook file | Claude event | What it does |
|-----------|-------------|--------------|
| `session-start-agent-identity.sh` | SessionStart | Restores agent name and task context |
| `pre-ask-user-question.sh` | PreToolUse | Intercepts AskUserQuestion calls |
| `pre-compact-save-agent.sh` | PreCompact | Saves agent state before context compaction |
| `post-bash-jat-signal.sh` | PostToolUse (Bash) | Emits coordination signals after bash commands |
| `post-bash-agent-state-refresh.sh` | PostToolUse (Bash) | Refreshes statusline after `am-*`/`jt` commands |
| `log-tool-activity.sh` | PostToolUse | Records tool usage to activity timeline |
| `user-prompt-signal.sh` | UserPromptSubmit | Emits signal when user sends a message |
| `session-end-cleanup.sh` | SessionEnd | Kills orphaned MCP processes |
| `monitor-output.sh` | (helper) | Used internally by user-prompt-signal |

All are symlinks, not copies. When you `git pull` JAT, the hooks update automatically with no reinstall needed.

**`~/.claude/settings.local.json`** — gets hook entries added (idempotent). This wires the hook files above into Claude Code's event system globally. JAT only adds entries for its own hooks; existing entries are preserved.

**`~/.claude/commands/jat/`** — symlinks to `/jat:*` slash commands (e.g. `/jat:start`, `/jat:complete`).

**`~/.claude/CLAUDE.md`** — gets a single import line appended pointing to JAT's shared tool documentation.

### Runtime data

| Path | Purpose |
|------|---------|
| `~/.agent-mail.db` | SQLite database for inter-agent messaging |
| `~/.config/jat/projects.json` | Project registry (which repos JAT manages) |
| `~/.tmux.conf` | Gets `set -g mouse on` appended (if tmux is installed) |

### What is NOT touched automatically

- Other projects in your codebase. Per-project `.claude/settings.json` configuration is **opt-in** — run `jt init` inside a repo to add the statusline and hook references to that project.
- System packages beyond the four required deps (tmux, sqlite3, jq, node).

---

## Makefile Reference

```bash
make help      # show all targets
make setup     # install system deps (tmux, sqlite3, jq, node)
make build     # install npm dependencies (root + IDE)
make tools     # symlink CLI tools to ~/.local/bin
make hooks     # install statusline + hooks (symlinks + settings.local.json)
make install   # everything: setup + build + tools + hooks
make dev       # start IDE dev server (http://127.0.0.1:3333)
make enable    # wire up Claude Code integration (hooks, statusline, settings)
make disable   # remove Claude Code integration cleanly
make update    # git pull + re-enable
make status    # show running processes, Docker, tmux sessions, agent registry
make clean     # remove node_modules and build artifacts
make uninstall # remove JAT from XDG install location
```

---

## Enabling and Disabling

`make enable` and `make disable` let you toggle the Claude Code integration on and off without a full reinstall.

```bash
make enable   # create symlinks + configure settings.local.json
make disable  # remove symlinks + clean settings.local.json
```

**What `make enable` does:**
1. Symlinks all hooks into `~/.claude/hooks/`
2. Symlinks `statusline.sh` into `~/.claude/`
3. Symlinks CLI tools into `~/.local/bin/`
4. Adds JAT hook entries to `~/.claude/settings.local.json` (idempotent)

**What `make disable` does:**
1. Removes hook symlinks from `~/.claude/hooks/` (only the ones pointing into this JAT repo)
2. Removes `~/.claude/statusline.sh` (only if it's a symlink into this JAT repo)
3. Removes tool symlinks from `~/.local/bin/` (only the ones pointing into this JAT repo)
4. Surgically removes JAT hook entries from `~/.claude/settings.local.json` using `jq`, leaving any non-JAT hooks untouched

**Note on `~/.claude/statusline.sh`:** This file is a stable indirection layer. Your per-project `.claude/settings.json` files reference `~/.claude/statusline.sh` as the statusline command. The global file then points to wherever JAT is installed. If you run `make disable`, projects that reference this path will show a blank statusline until you re-enable or remove the `statusLine` entry from their settings.

After `make disable`, restart any open Claude Code sessions for the changes to take effect. Hooks are loaded at session start.

---

## Per-Project Setup

After installing JAT, opt individual projects into the statusline and hooks:

```bash
cd ~/your/project
jt init
```

This adds a `.claude/settings.json` to the project pointing at `~/.claude/statusline.sh` and the global hooks. You can check it into git — other developers who have JAT installed will get the statusline automatically; those without JAT will see a missing-command warning they can ignore.

---

## Updating

```bash
make update
# equivalent to: git pull && make enable
```

Because hooks and statusline are symlinks (not copies), most updates take effect immediately without any reinstall. `make update` handles the cases where `settings.local.json` needs new entries added for newly introduced hooks.

---

## Uninstalling

```bash
# 1. Disable the Claude integration
make disable

# 2. Remove the npm dependencies and build artifacts
make clean

# 3. Remove the repo itself
rm -rf ~/.local/share/jat   # or wherever you cloned it

# 4. Remove runtime data (optional)
rm -f ~/.agent-mail.db
rm -rf ~/.config/jat

# 5. Remove PATH entry from ~/.zshrc or ~/.bashrc
# Delete the line: export PATH="$HOME/.local/bin:$PATH"
```

---

## Troubleshooting

### "command not found: jat"

`~/.local/bin` is not in PATH. Add it:
```bash
export PATH="$HOME/.local/bin:$PATH"
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
```

### Statusline shows blank or error after disable

Projects whose `.claude/settings.json` references `~/.claude/statusline.sh` will fail if that symlink is removed. Either re-enable JAT (`make enable`) or remove the `statusLine` block from the project's settings.json.

### Hooks not firing in Claude Code

Verify the hooks are wired in `~/.claude/settings.local.json`:
```bash
jq '.hooks | keys' ~/.claude/settings.local.json
```

If empty, re-run `make enable`.

Verify the symlinks exist:
```bash
ls -la ~/.claude/hooks/
```

### Node.js version warning

JAT requires Node.js 20 or 22 (LTS). Versions 23+ break native modules:
```bash
nvm install 22 && nvm use 22
# or
brew install node@22 && brew link --overwrite node@22
```

### IDE won't start

```bash
cd ide
npm install --legacy-peer-deps
npm run dev
```

### Homebrew not found on macOS

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

---

## Platform Notes

| Platform | Shell | Config | Package manager |
|----------|-------|--------|----------------|
| macOS (default) | zsh | `~/.zshrc` | Homebrew |
| Ubuntu/Debian | bash | `~/.bashrc` | apt |
| Arch/Manjaro | bash | `~/.bashrc` | pacman |
| Fedora | bash | `~/.bashrc` | dnf |
| Alpine | sh | `~/.profile` | apk |

---

## Getting Help

- **Issues**: https://github.com/joewinke/jat/issues
- **Docs**: [README.md](README.md), [CLAUDE.md](CLAUDE.md)
