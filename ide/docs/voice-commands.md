# Voice Commands

Talk to JAT. Hold the push-to-talk key, speak, release. JAT either fires a keyboard shortcut directly (fast match) or routes your utterance through an LLM that extracts parameters and calls one or more actions for you.

## Quick start

1. Hold **`Ctrl+Space`** (default push-to-talk key — rebind in `/config` → Shortcuts).
2. Speak your command. Watch the on-screen indicator transcribe it.
3. Release. JAT runs the matched action(s).

> **Tip.** Open the in-app **Voice Vocab Sheet** (the mic button or the `?` overlay) to see every command available on the page you're currently on, with example utterances. The sheet is the live source of truth — this doc covers the shape of the system.

## How it works

JAT runs a two-tier dispatcher:

| Tier | Handles | Example |
|------|---------|---------|
| **Fast match** | Fixed phrases that map 1:1 to a keyboard shortcut. Sub-second, no LLM call. | "next item" → `j`, "kill session" → `Alt+K` |
| **Natural language** | Free-form utterances with parameters (task IDs, session names, priorities, counts). LLM extracts the parameters and calls one or more tools. | "Close the auth task", "Spawn four agents on the triage epic" |

The LLM tier is tried first (5s timeout); on any failure it falls back to fast match. You can chain actions in one utterance — the LLM emits multiple tool calls and JAT runs them in sequence.

## Natural-language commands

These work anywhere in the app. JAT extracts parameters from your speech and shows a 3-second preview before running consequential actions.

### Tasks

| Say | What happens |
|-----|--------------|
| "Create a bug for the login crash" | Opens the new-task drawer pre-filled with title + type |
| "New P1 task: refactor the auth flow" | Same, with priority extracted |
| "Open the details" *(after creating one)* | Opens the task detail drawer for the just-created task |
| "Spawn an agent on the auth task" | Spawns an agent for the matched task |
| "Create a bug for the login crash and spawn an agent" | Both actions run in sequence |
| "Close the auth task" 🔴 | Closes the matched task — confirms first |
| "Set the auth task to P1" | Updates priority; works for status, type, assignee too |
| "Assign the login crash to Mike" | Updates assignee |

### Sessions

| Say | What happens |
|-----|--------------|
| "Attach" | Opens the terminal for the hovered session |
| "Attach to the EarlyShore session" | Opens the named session's terminal |
| "Kill the session" 🔴 | Kills the hovered session — confirms first |
| "Kill the EarlyShore session" 🔴 | Kills the named session — confirms first |

### Workflow

| Say | What happens |
|-----|--------------|
| "Spawn four agents on the triage epic" | Opens swarm dialog pre-filled with epic + count |
| "Add a new project" | Opens the new-project drawer |
| "New project flush" | Same, with name pre-filled |
| "Go to kanban" | Navigates to `/kanban` |
| "Find tasks about authentication" | Opens unified search with the query |

🔴 = **Destructive.** JAT shows a confirmation overlay before running. Press `Esc` to cancel.

## Fast-match commands

Per-route shortcut phrases that fire keystrokes directly. The Voice Vocab Sheet shows the full list filtered to the page you're on. Examples:

- **Anywhere:** "next item" / "previous item" / "select" / "cancel" / "show shortcuts"
- **`/triage`:** "spawn agent" / "promote task" / "edit task" / "close task" / "delete task"
- **`/kanban`:** "next column" / "previous column"
- **`/files`:** "save file" / "next tab" / "previous tab" / "quick file finder"
- **Global:** "new task" / "epic swarm" / "start next task" / "global search"

Anything that has a keyboard shortcut on a route can usually be invoked by speaking the phrase.

## Configuration

Open `/config` → **Voice** to:

- Enable/disable voice commands
- Choose your speech-to-text provider (voxtype/local, OpenAI, ElevenLabs)
- Choose your LLM dispatch provider (Anthropic Haiku / Ollama / OpenAI)
- Run diagnostics (test STT, test LLM, view audit log)
- Rebind the push-to-talk key

If no LLM provider is configured, JAT silently falls back to fast match — every fixed-phrase command still works.

## Adding new commands

If you're a developer extending JAT's voice system, see [`ide/CLAUDE.md`](../CLAUDE.md) → **Voice Dispatch** for the catalog architecture, validation rules, and the 6-step "add a verb" workflow. Full design spec: [`prd-siri-for-jat.md`](./prd-siri-for-jat.md).

## Privacy

- **Push-to-talk only.** No always-listening; the mic only opens while you hold the key.
- **Local-first STT available.** Use `voxtype` (local Whisper) to keep transcription offline.
- **Audit log.** Every cloud call is recorded under `/config` → Voice → Audit. You see the bytes sent, provider, latency, and matched tools.
