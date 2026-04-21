# PRD: Siri for JAT — Natural-Language Voice Commands

**Status:** Draft
**Author:** jw
**Date:** 2026-04-21
**Depends on:** [prd-voice-subsystem.md](./prd-voice-subsystem.md), jat-crmt6 (push-to-talk voice shortcuts, shipped), jat-1tjil (voice-to-task pipeline)

> **Depends on:** [prd-voice-subsystem.md](./prd-voice-subsystem.md). The Siri feature is a consumer of the subsystem's `TranscribeProvider` and `IntentProvider` interfaces — it does not implement transcription or LLM calling directly. All transcription goes through `voice.transcribe()`; all intent classification goes through `voice.classify()`. Provider selection, credential management, privacy gating, and fall-through behavior are handled one layer down.

---

## 1. Executive summary

"Siri for JAT" extends the shipped push-to-talk voice system from a deterministic phrase-dispatcher into a natural-language command interpreter. Today, holding Ctrl+Space lets a user say a canonical phrase (e.g. "new task", "spawn agent") and fires the same handler Alt+N / Alt+S would. That's great for ~70 fixed utterances but falls down the moment the user wants to combine a verb with a target or a parameter — "create a task called fix the auth bug and assign to EarlyShore", "close the triage task", "spawn an agent for the auth timeout". This project adds a second, LLM-backed interpretation path that runs *only when the fast algorithmic matcher doesn't already win*. It delegates both transcription and LLM calls to the voice subsystem, returns a strict JSON schema with an action name and typed parameters, resolves those parameters against the current route's data context (visible tasks, hovered session, selected project), and dispatches through the same `voiceActionRegistry` the existing system uses. Destructive actions (close, kill, delete) surface a one-tap confirmation overlay before firing; creation and navigation actions dispatch immediately. The goal is to make voice the fastest way to drive JAT when your hands aren't on the keyboard, without regressing the sub-second latency of the quick-phrase feature.

---

## 2. Background and motivation

### What shipped in jat-crmt6

The push-to-talk epic delivered a full algorithmic voice-to-shortcut pipeline:

| Layer | Path | Role |
|---|---|---|
| Capture | `ide/src/lib/stores/voiceCapture.svelte.ts` | MediaRecorder → `voice.transcribe()` → transcript |
| Transcription | voice subsystem (see subsystem PRD §5.2) | Active STT provider (voxtype by default) |
| Vocabulary | `ide/src/lib/stores/voiceVocabulary.svelte.ts` | ~70 `VoiceVocabularyEntry` records (navigation, global, per-route) |
| Matcher | `ide/src/lib/voice/utteranceMatcher.ts` | normalize → exact phrase → exact alias → word-order-invariant → Levenshtein; threshold 0.7 |
| Action registry | `ide/src/lib/voice/voiceActionRegistry.ts` | Same handler map `+layout.svelte` uses for Alt+N / Alt+E / Alt+A |
| Dispatch | `ide/src/lib/voice/dispatchMatch.ts` | Action handler first; `KeyboardEvent` fallback |
| Debug | `ide/src/lib/voice/matchDebugBuffer.ts` | Ring buffer, exposed as `window.__jatVoiceDebug` |
| Overlay | `ide/src/lib/components/voice/PushToTalkOverlay.svelte` | Listening → transcribing → matched / no-match |

### Why quick phrases aren't enough

Quick phrases are great for the **verbs the user memorized** and the **targets already implied by context** (the hovered session, the focused row). They break the moment any of these creep in:

1. **The verb needs a title** — "create a task called fix the login flow". Whisper produces that transcript; the matcher fuzzy-hits "create task" at 0.85 and dispatches `new-task`, but the rest of the utterance ("called fix the login flow") is discarded. The new-task drawer opens empty.
2. **The verb needs a target that isn't hovered** — "close the auth task" when the user isn't hovering a specific task. There's no mechanism to resolve "the auth task" into `jat-a1b2c3`.
3. **The verb needs a session target by name** — "spawn an agent for the triage bug". The matcher can't pick a task off visible-but-not-focused lists.
4. **Compound intents** — "close this and start the next one". Single-action dispatch only.

The user put it bluntly in review:

> "Siri for JAT is more usable than these quick phrases. I want to just say what I want and have it happen."

The intent catalog is already there (the existing `VoiceVocabularyEntry.action` field) — what's missing is (a) natural-language parsing and (b) parameter extraction.

### Why delegate to the voice subsystem

Voice-related infrastructure (transcription, LLM calling, credentials, privacy gates, provider fall-through) is centralized in the voice subsystem. Siri for JAT is a **consumer** of that layer, not a parallel implementation. By going through `voice.transcribe()` and `voice.classify()`, this feature automatically benefits from: provider swaps (voxtype → OpenAI Whisper), privacy policy enforcement, cloud fall-through on local outages, and the unified audit log. Model selection is a subsystem-level decision; Siri defaults to whichever intent provider is active.

---

## 3. Goals and non-goals

### Goals

1. A user can say **"create a task called X"** and land in the task drawer pre-filled with title X.
2. A user can say **"close the auth task"** and the matcher resolves "the auth task" against the current route's visible task list, shows a one-tap confirmation, then dispatches.
3. A user can say **"spawn an agent for the triage bug"** and get an actual `POST /api/work/spawn` for the resolved task.
4. Natural-language interpretation p95 latency ≤ 3 seconds end-to-end (the subsystem's active LLM provider is the latency budget — with local ollama + gemma3:4b, this means CPU-only on dev hardware).
5. No regression to the sub-400ms fast-path for utterances the algorithmic matcher already handles.
6. Every dispatch surfaces a visible interpretation so the user can tell at a glance what the system decided (transparency beats silent correctness).
7. Graceful degradation: if the subsystem's active LLM provider is unreachable, the feature silently falls back to the existing matcher.

### Non-goals

- **Multi-turn conversation.** Each Ctrl+Space press is one transcript → one intent. No "what did you mean?" loops. (If a parameter is ambiguous, we show the two candidates inline and the user either picks one or re-records.)
- **Wake-word listening.** Still push-to-talk only. Always-on listening is a separate, larger project (privacy, battery, accidental activation).
- **Dictation-heavy workflows.** If the user wants to write a 300-word task description, the iOS Voice Memos → `/api/tasks/voice` pipeline (jat-1tjil) is the right tool. Siri for JAT is for *commands*, not dictation.
- **Cloud-versus-local routing policy.** That's a subsystem-level concern. Siri inherits whatever the user picked in `/config/voice`.
- **Replacing the fast matcher.** The Levenshtein-based matcher is the primary dispatcher; the LLM is the upgrade for the hard cases only.

---

## 4. User personas and stories

### Primary persona — jw (the project owner / power user)

- Runs JAT 8-12 hours a day across 6+ projects
- Already uses Alt+N / Alt+E / Alt+S / Alt+A reflexively
- Knows the full intent catalog by muscle memory
- **Pain point:** Keyboard shortcuts max out at ~1 verb per modifier chord. Creating a titled task is still `Alt+N → click title field → type → click type → ...`.

User stories:

- *"As jw, I want to say 'create a task titled fix the auth bug, priority P1' and have the drawer open pre-filled so I don't type the title twice."*
- *"As jw, I want to say 'close the completed auth task' from any page without navigating to it first."*
- *"As jw, I want to say 'spawn four agents on the triage epic' and have the epic-swarm dialog pre-configured."*

### Secondary persona — JAT customers building their own agent workflows

- Use JAT as a multi-agent IDE but haven't memorized the shortcut grid
- Discover features by talking to the UI rather than reading docs
- Typically run with the mouse-and-menu flow; voice is a power-user reveal for them
- **Pain point:** They don't know to say "epic swarm" but they do know to say "start a bunch of agents on this".

User stories:

- *"As a new user, I want to say things in plain English and have the IDE figure out what I meant."*
- *"As a customer, I want to choose whether my voice leaves my machine — and that choice lives in subsystem settings, not per-feature."*

### Role-based access

Not applicable. This is a local, single-user feature. No per-role gating.

---

## 5. Functional requirements

### 5.1 Intent catalog

The intent catalog is the **action IDs already defined** in `voiceVocabulary.svelte.ts` plus a few new ones needed for target-taking verbs. Priority indicates phase: **P0** ships in phase 1, **P1** in phase 2, **P2** in phase 3.

| Action ID | Category | Description | Takes parameters? | Destructive? | Priority |
|---|---|---|---|---|---|
| `new-task` | global | Open task drawer | title, priority, type, project, assignee, labels | No | P0 |
| `epic-swarm` | global | Open swarm modal | epicTaskId (optional), agentCount | No | P1 |
| `start-next` | global | Open start-next dropdown | — | No | P0 |
| `global-search` | global | Focus unified search | query | No | P0 |
| `toggle-terminal` | global | Show/hide terminal drawer | — | No | P0 |
| `add-project` | global | Open new-project drawer | projectName | No | P1 |
| `navigate` | new | Route to a page | routePath | No | P0 |
| `spawn-agent` | new | `POST /api/work/spawn` | taskId (required), model, project | No | P1 |
| `close-task` | new | `PATCH /api/tasks/:id status=closed` | taskId (required), reason | **Yes** | P1 |
| `update-task` | new | `PATCH /api/tasks/:id` | taskId (required), status, priority, assignee | No | P1 |
| `attach-terminal` | session | Open session tmux terminal | sessionName (inferred from hover if omitted) | No | P0 |
| `kill-session` | session | Kill tmux session | sessionName (inferred from hover if omitted) | **Yes** | P1 |
| `interrupt-session` | session | Send Ctrl+C | sessionName (inferred from hover if omitted) | No | P0 |
| `pause-session` | session | Pause agent | sessionName | No | P0 |
| `copy-session` | session | Copy session contents | sessionName | No | P0 |
| `delete-task` | new | `DELETE /api/tasks/:id` | taskId (required) | **Yes** | P2 |

The LLM **must return an action ID from this enumerated list**. Unknown actions → treat as parse failure.

### 5.2 Parameter types

| Type | Resolver source | Example input | Example resolution |
|---|---|---|---|
| `task-id` | Visible tasks on current route + fuzzy title match | "the auth task" | `jat-a1b2c3` (title "Fix auth timeout bug") |
| `session-name` | Active sessions list + hovered-session fallback | "the claude session" | `jat-EarlyShore` |
| `agent-name` | Registered agents | "EarlyShore" | `EarlyShore` |
| `project-name` | `~/.config/jat/projects.json` | "the flush project" | `flush` |
| `free-text` | Passed through | "fix the login flow" | `Fix the login flow` (capitalized first letter) |
| `priority` | Enum [0..4] | "priority one" / "P1" / "high" | `1` |
| `task-type` | Enum [task, bug, feature, epic, chore] | "bug" / "feature" | `bug` |
| `route-path` | Known routes | "workflows page" | `/workflows` |
| `label` | Free text, lowercased | "auth" | `auth` |
| `file-path` | File tree fuzzy match on `/files` context | "the spawn endpoint" | `src/routes/api/work/spawn/+server.js` |

### 5.3 Parameter resolution rules

Resolution happens **server-side in `/api/voice/interpret`** using the `context` payload the client sends. Rules:

1. **Visible tasks first.** The client posts the list of visible task IDs + titles on the current route (tasks table rows, triage queue, kanban cards). Resolve `task-id` params against that list via Levenshtein + substring match on title; break ties by priority (lower `P` number wins) and `updated_at` (more recent wins).
2. **Fuzzy match threshold = 0.6.** Lower than the utterance matcher's 0.7 because task titles are longer and the LLM's natural-language description ("the auth task") will always have weaker overlap with the canonical title.
3. **Multiple matches = disambiguation.** If two tasks match "the auth task" with similar scores, return both in the response and show the user a quick-pick UI (see 5.6).
4. **Zero matches = fail loud.** Overlay shows "No task matching 'the auth task'" with the raw transcript so the user can retry.
5. **Hovered / selected wins for session params.** If the utterance is "attach terminal" and a session is hovered, the hovered session is used without LLM involvement (that's already the fast path). LLM only sees session-param requests when the utterance explicitly names a session.
6. **Free-text titles get light capitalization.** "fix the login flow" → "Fix the login flow". No heavier rewriting — the user's words are the user's words.

### 5.4 Context assembly

The client builds a context payload per-utterance and POSTs it to `/api/voice/interpret` alongside the transcript:

```typescript
interface InterpretContext {
    route: string;                              // e.g. '/tasks', '/triage'
    hoveredSession: string | null;              // jat-EarlyShore or null
    selectedTaskId: string | null;              // task currently focused via j/k
    visibleTasks: Array<{                       // max 40, from current route
        id: string;
        title: string;
        status: string;
        priority: number;
    }>;
    activeSessions: Array<{                     // max 20
        name: string;
        agentName: string;
        taskId: string | null;
    }>;
    projects: string[];                         // project names from projects.json
    lastAction: string | null;                  // last-matched action ID (for compound)
}
```

Size budget: **≤ 4 KB**. Visible tasks are truncated to 40 most recent / highest priority; active sessions to 20. This keeps the prompt small and prefix-cache-friendly on whatever LLM provider the subsystem routes to.

### 5.5 JSON schema for LLM output

The LLM MUST emit JSON conforming to this schema. Anything else is a parse failure. The schema is passed to `voice.classify()` as the `schema` field — the active subsystem provider is responsible for enforcing JSON conformance (ollama uses `format: 'json'`; Anthropic uses structured tool use; OpenAI uses JSON mode).

```typescript
interface InterpretResult {
    action: ActionID;                  // enum — see 5.1
    confidence: 'high' | 'medium' | 'low';  // self-reported
    params: {
        taskId?: string;               // resolved, not raw
        taskIdCandidates?: string[];   // if ambiguous
        sessionName?: string;
        agentName?: string;
        projectName?: string;
        title?: string;
        priority?: 0 | 1 | 2 | 3 | 4;
        type?: 'task' | 'bug' | 'feature' | 'epic' | 'chore';
        route?: string;
        label?: string[];
        query?: string;
        reason?: string;               // for close-task
    };
    interpretation: string;            // human-readable echo: "Close 'Fix auth timeout' (jat-a1b2c3)"
    fallback: 'fast-match' | null;     // "I didn't understand; try one of: …"
}
```

Example realistic responses:

```json
{
  "action": "new-task",
  "confidence": "high",
  "params": {
    "title": "Fix the auth bug",
    "priority": 1,
    "type": "bug"
  },
  "interpretation": "Create bug 'Fix the auth bug' at P1"
}
```

```json
{
  "action": "close-task",
  "confidence": "medium",
  "params": {
    "taskId": "jat-a1b2c3",
    "taskIdCandidates": ["jat-a1b2c3", "jat-x9y8z7"]
  },
  "interpretation": "Close 'Fix auth timeout' (jat-a1b2c3) — 2 tasks matched 'the auth task'"
}
```

```json
{
  "action": "spawn-agent",
  "confidence": "high",
  "params": {
    "taskId": "jat-trg001"
  },
  "interpretation": "Spawn agent for 'Triage weekend feedback' (jat-trg001)"
}
```

### 5.6 Confirmation UX rules

| Action category | Confirmation? | UX |
|---|---|---|
| Navigation (`navigate`) | No | Dispatch immediately |
| Creation (`new-task`, `add-project`, `epic-swarm`) | No | Open drawer pre-filled; user confirms by submitting |
| Search (`global-search`) | No | Dispatch immediately |
| Session read-only (`attach-terminal`, `copy-session`) | No | Dispatch immediately |
| Session mutating (`interrupt-session`, `pause-session`) | No | Dispatch immediately (reversible) |
| **Destructive (`close-task`, `kill-session`, `delete-task`)** | **Yes** | Overlay shows interpretation + [Confirm] / [Cancel]; Esc cancels |
| Ambiguous (`taskIdCandidates.length > 1`) | Yes | Overlay shows up to 3 candidates; number-key pick (1/2/3) |

Confirmation overlay times out after 8 seconds and auto-cancels. This avoids zombie confirmations when the user walks away.

---

## 6. User experience flows

### 6.1 Happy path — titled task creation

```
User holds Ctrl+Space
   → voiceState: listening
User says "create a task called fix the login flow priority one"
User releases
   → voiceState: transcribing
   → voice.transcribe(blob) via subsystem → ~400ms on voxtype (or active STT)
   → transcript: "create a task called fix the login flow priority one"

Fast matcher runs
   → best score: 0.85 on "create task" alias (new-task)
   → BUT utterance has 9 extra tokens beyond "create task"
   → router sees: matched action takes params + unused tokens exist
   → route to LLM interpretation path

POST /api/voice/interpret
   body: { transcript, route: '/tasks', context }
   → server calls voice.classify({ system, transcript, context, schema })
   → active LLM provider returns JSON (ollama gemma3:4b CPU ~1.2s, OpenAI gpt-4o-mini cloud ~600ms)
   → response: { action: 'new-task', params: { title: 'Fix the login flow', priority: 1 }, interpretation: "Create task 'Fix the login flow' at P1" }

Overlay updates:
   ┌──────────────────────────────────────────────┐
   │ I heard: "create a task called fix the       │
   │ login flow priority one"                     │
   │                                              │
   │ Creating task: "Fix the login flow" (P1)     │
   └──────────────────────────────────────────────┘

No confirmation (non-destructive) → dispatch
   → voiceActionRegistry.get('new-task')({ title: 'Fix the login flow', priority: 1 })
   → task drawer opens pre-filled
   → user presses Enter to submit

Total latency: ~1.6s end-to-end (local providers) or ~1.0s (cloud)
```

### 6.2 Fast-path hit — no LLM call

```
User says "next item"
   → transcript: "next item"

Fast matcher runs
   → exact phrase match on 'next item' → confidence 1.00
   → action is navigation key 'j', takes no params, no unused tokens
   → dispatch directly
   → NO LLM call

Total latency: ~400ms (STT only, subsystem-provider-dependent)
```

### 6.3 Destructive action with confirmation

```
User says "close the auth task"
   → transcript: "close the auth task"

Fast matcher
   → "close task" alias hits at 0.78
   → BUT "close-task" is now a param-taking action (see 5.1)
   → unused tokens: "the auth" → route to LLM

POST /api/voice/interpret
   → voice.classify() returns: { action: 'close-task', params: { taskId: 'jat-a1b2c3' }, interpretation: "Close 'Fix auth timeout' (jat-a1b2c3)" }

Overlay shows:
   ┌──────────────────────────────────────────────┐
   │ Close this task?                             │
   │                                              │
   │ "Fix auth timeout"                           │
   │ jat-a1b2c3 · P1 · in_progress                │
   │                                              │
   │   [Enter: Confirm]   [Esc: Cancel]           │
   └──────────────────────────────────────────────┘

User presses Enter → PATCH /api/tasks/jat-a1b2c3 status=closed
User presses Esc → dismiss, no action
Times out after 8s → auto-cancel
```

### 6.4 Ambiguous parameter — disambiguation

```
User says "close the auth task"
   → two tasks match: jat-a1b2c3 "Fix auth timeout" and jat-x9y8z7 "Refactor auth middleware"

Overlay shows:
   ┌──────────────────────────────────────────────┐
   │ Which task?                                  │
   │                                              │
   │ 1. Fix auth timeout        jat-a1b2c3  P1    │
   │ 2. Refactor auth middleware jat-x9y8z7 P2    │
   │                                              │
   │   Press 1 or 2 to pick · Esc to cancel       │
   └──────────────────────────────────────────────┘

User presses 1 → confirmation shown for jat-a1b2c3 → user Enters → dispatch
```

### 6.5 Wrong parse — user correction

```
User says "create a task to fix the login flow"
voice.classify() returns: { action: 'new-task', params: { title: 'A task to fix the login flow' } }

Overlay shows:
   Creating task: "A task to fix the login flow"
   → opens drawer with that title

User realizes title is wrong → presses Esc → drawer closes without saving
User holds Ctrl+Space again, says "create a task called fix the login flow" (more explicit verb)
→ parses correctly
```

No retraining, no learning loop — the user self-corrects by being more explicit. The debug buffer captures both attempts for later audit.

### 6.6 LLM unavailable — graceful fallback

```
User says "create a task called fix the login flow"
Fast matcher → 0.85 on new-task; attempts LLM

POST /api/voice/interpret
   → voice.classify() throws (active LLM provider unreachable;
     subsystem already attempted fall-through to other providers and
     all failed, or all cloud providers are gated off by privacy toggles)
   → endpoint returns 503 + { error: 'interpreter_unavailable', fallbackAction: 'new-task' }

Client falls back to fast matcher result
   → dispatches new-task() with NO params (empty drawer)

Overlay flags it:
   ┌──────────────────────────────────────────────┐
   │ ⚠ Natural-language interpreter offline.      │
   │ Created empty task — edit manually.          │
   │ (Check /config/voice → Intent provider)      │
   └──────────────────────────────────────────────┘
```

User never loses the core feature; they just don't get auto-filled params. The advisory points to subsystem config, not to a specific provider — the user might have no ollama, or might have opted out of cloud LLM, or both.

---

## 7. Technical architecture

### 7.1 New endpoint: `POST /api/voice/interpret`

**File:** `ide/src/routes/api/voice/interpret/+server.ts` (new)

**Request:**
```typescript
{
    transcript: string;
    route: string;
    context: InterpretContext;  // see 5.4
    fastMatch?: {               // optional — what the fast matcher thought
        action: string;
        confidence: number;
    };
}
```

**Response (success):**
```typescript
InterpretResult  // see 5.5
```

**Response (error):**
```typescript
{
    error: 'interpreter_unavailable' | 'parse_failed' | 'timeout';
    fallbackAction: string | null;  // from fastMatch if present
    raw: string;                    // raw LLM output if parse_failed
}
```

**Behavior:**
1. Build prompt from action catalog (static) + context (dynamic) — see 7.3
2. Call `voice.classify({ system, transcript, context, schema })` where `schema` is the JSON Schema draft-07 version of `InterpretResult`. The subsystem routes this to the active `IntentProvider` — ollama, OpenAI, or Anthropic — with whatever JSON-mode mechanism that provider supports.
3. Check `result.schemaValid`. If false, return `parse_failed` + `result.raw`.
4. Validate `action` is in the enumerated list. If not, `parse_failed`.
5. Resolve `taskId` / `sessionName` / `projectName` params against context (5.3).
6. If multiple `taskId` candidates scored closely, populate `taskIdCandidates`.
7. Return the interpreted result.

Timeout is inherited from the subsystem's configured per-operation timeout (default 5s for LLM). Siri does not enforce its own timeout on top of the subsystem's.

### 7.2 Integration point: `dispatchNaturalLanguage()`

**File:** `ide/src/lib/voice/dispatchNaturalLanguage.ts` (new)

Parallels `dispatchMatch.ts`. Signature:

```typescript
export async function dispatchNaturalLanguage(
    transcript: string,
    route: string,
    context: InterpretContext,
    fastMatch?: MatchResult
): Promise<InterpretDispatchResult>;

type InterpretDispatchResult =
    | { status: 'dispatched'; action: string; params: unknown; interpretation: string }
    | { status: 'confirm-required'; result: InterpretResult }      // destructive
    | { status: 'disambiguate'; candidates: TaskCandidate[]; result: InterpretResult }
    | { status: 'parse-failed'; raw: string; fallback: MatchResult | null }
    | { status: 'unavailable'; fallback: MatchResult | null };
```

Internally it POSTs to `/api/voice/interpret`, then either:

- Resolves params + dispatches through `voiceActionRegistry` (same path `dispatchMatch.ts` uses for action-backed entries), OR
- Returns `confirm-required` / `disambiguate` for the overlay to render, OR
- Returns `unavailable` / `parse-failed` with the fast-match fallback.

Transcription itself is delegated upstream — `voiceCapture.svelte.ts` already calls `voice.transcribe()` by the time `dispatchNaturalLanguage()` runs, so this function only sees the resolved transcript string.

### 7.3 Prompt construction

The prompt has **three stable sections** and **one dynamic section**. Keep the stable stuff at the top so prefix caching (when supported by the active provider) kicks in.

```
You are a command router for the JAT IDE. Given a voice transcript,
return JSON describing the user's intent.

You MUST respond with JSON matching this schema:
{ "action": "<ID>", "confidence": "high"|"medium"|"low", "params": {...}, "interpretation": "<human-readable>" }

Valid actions (use EXACTLY one of these):
- new-task: create a new task. params: title (string), priority (0-4), type (task|bug|feature|epic|chore), project (string)
- close-task: close an existing task. params: taskId (string, required), reason (string)
- spawn-agent: start an agent session on a task. params: taskId (string, required), model (opus|sonnet|haiku)
- update-task: modify a task. params: taskId, status, priority, assignee
- attach-terminal: open a session's terminal. params: sessionName (optional, defaults to hovered)
- kill-session: kill an agent session. params: sessionName (required)
- interrupt-session: send Ctrl+C. params: sessionName (optional)
- pause-session: pause an agent. params: sessionName
- navigate: route to a page. params: route (string, e.g. "/workflows")
- global-search: focus search. params: query (string)
- epic-swarm: open swarm dialog. params: epicTaskId (optional), agentCount (number)
- add-project: open new-project drawer. params: projectName (string)
- start-next: trigger start-next dropdown. no params
- toggle-terminal: show/hide terminal drawer. no params

Rules:
1. For task references like "the auth task", pick the closest match from the Visible Tasks list below. If multiple match, pick the highest-priority one but list others in your interpretation.
2. Titles should be capitalized: "fix the bug" → "Fix the bug".
3. Priority words: "critical"/"P0" → 0, "high"/"P1" → 1, "medium" → 2, "low"/"P3" → 3.
4. If the transcript is unclear, set confidence: "low" and pick the most plausible single action.
5. Never invent task IDs not in the context. If no visible task matches, omit taskId and set confidence: "low".

--- Context ---
Current route: {{route}}
Hovered session: {{hoveredSession}}
Selected task: {{selectedTaskId}}
Visible tasks (top 40):
{{#each visibleTasks}}  - {{id}} [{{status}} P{{priority}}] {{title}}
{{/each}}
Active sessions:
{{#each activeSessions}}  - {{name}} (agent: {{agentName}}, task: {{taskId}})
{{/each}}

--- Transcript ---
{{transcript}}

--- Response (JSON only) ---
```

Prompt budget:
- **Stable prefix** (system prompt + action catalog + rules): ~800 tokens
- **Dynamic suffix** (context + transcript): ~300-600 tokens
- Total: ~1100-1400 tokens in, ≤ 150 tokens out

### 7.4 Model selection

Model selection is a subsystem-level decision. Siri defaults to whichever intent provider is active in `voice.activeLlmId`. The subsystem's default is ollama with `gemma3:4b` (see subsystem PRD §5.2 for provider catalog and rationale); users on cloud providers get OpenAI `gpt-4o-mini` or Anthropic `claude-haiku-4-5` instead.

Siri-specific model overrides (e.g., "always use a bigger model for interpret even when the user picked the smaller one for dictation polish") are **not supported in v1**. If that becomes necessary later, it's a subsystem-layer feature — a `model` override on the classify call — not a Siri-layer workaround.

### 7.5 Tiered dispatch wiring

The existing `voiceCapture.svelte.ts` `stopCapture()` handler currently:
1. Gets transcript via `voice.transcribe(blob)` (subsystem)
2. Runs `matchUtterance(transcript, route)`
3. Dispatches via `dispatchMatch(entry)`

New flow:

```
transcript arrives (from voice.transcribe())
    │
    ▼
matchUtterance(transcript, route)  → MatchResult { entry, confidence, reason }
    │
    ├── confidence ≥ 0.90 AND action is parameterless
    │       → dispatchMatch(entry)            (fast path, no LLM)
    │
    ├── confidence in [0.70, 0.90) AND action is parameterless
    │       → dispatchMatch(entry)            (fast path)
    │       → fire dispatchNaturalLanguage() in background for telemetry
    │
    ├── confidence ≥ 0.70 AND action takes params AND unused tokens remain
    │       → dispatchNaturalLanguage()       (LLM path — extract params)
    │
    └── confidence < 0.70
            → dispatchNaturalLanguage()       (LLM path — primary)
```

"Unused tokens remain" is calculated as:
```typescript
const phraseTokens = new Set(normalize(entry.phrase).split(' '));
const transcriptTokens = normalize(transcript).split(' ');
const unused = transcriptTokens.filter(t => !phraseTokens.has(t));
const hasUnusedTokens = unused.length > 0;
```

Parameter-taking actions (per 5.1): `new-task`, `close-task`, `spawn-agent`, `update-task`, `attach-terminal` (only when not hovered), `kill-session`, `add-project`, `navigate`, `global-search`, `epic-swarm`, `delete-task`.

### 7.6 Settings / opt-in

Global voice settings live in `/config/voice` (subsystem). Siri adds a single feature toggle in the UserProfile dropdown:

```
UserProfile → Voice Commands
  ☐ Enable natural-language interpretation
     (requires an intent provider — configure in /config/voice)
```

Default: **off in phase 1, on after 100 successful uses or a week, whichever comes first.** This is a local-only preference, stored in localStorage at `jat-voice-nl-enabled`. The subsystem provides the `capabilities.llm` boolean — if false, the toggle is disabled and a link points to `/config/voice`.

When off, the flow degrades to the existing jat-crmt6 behavior exactly.

---

## 8. Telemetry and metrics

### 8.1 Debug buffer extension

Add a parallel ring buffer:

**File:** `ide/src/lib/voice/interpretDebugBuffer.ts` (new)

```typescript
export interface InterpretDebugEntry {
    timestamp: number;
    iso: string;
    raw: string;                      // whisper transcript
    route: string;
    fastMatch: {                      // what the fast matcher said
        entryPhrase: string | null;
        confidence: number;
        reason: MatchReason;
    };
    llmCall: {
        providerId: string;           // subsystem-resolved provider
        latencyMs: number;
        parseSuccess: boolean;
        rawResponse: string;          // trimmed to 2KB
    } | null;
    interpretation: string | null;
    resolved: {
        taskId: string | null;
        resolvedFromCandidates: string[] | null;
    } | null;
    outcome:
        | 'fast-dispatched'
        | 'nl-dispatched'
        | 'nl-confirmed'
        | 'nl-cancelled'
        | 'nl-disambiguated'
        | 'nl-parse-failed'
        | 'nl-unavailable';
}
```

Exposed as `window.__jatVoiceInterpretDebug` for live inspection (ring buffer, N=50). Complements:
- `window.__jatVoiceDebug` (fast-match only, from jat-107ll)
- `window.__jatVoiceSubsystem` (provider-level calls, from subsystem)

### 8.2 Success metrics

| Metric | Source | Target |
|---|---|---|
| **Interpret latency p50** | `interpretDebugBuffer.llmCall.latencyMs` | ≤ 1.5s |
| **Interpret latency p95** | same | ≤ 3.0s |
| **Schema-parse success rate** | `interpretDebugBuffer.llmCall.parseSuccess` | ≥ 95% |
| **Wrong-action rate** | outcome `nl-cancelled` while overlay was on destructive confirm | ≤ 5% |
| **Abandonment rate** | outcome `nl-cancelled` regardless of destructiveness | ≤ 15% |
| **Fast-path preservation** | utterances with fast-match confidence ≥ 0.90 that DIDN'T hit the LLM | ≥ 99% |
| **Parameter resolution hit rate** | `taskId` was populated when `action` needed one | ≥ 90% on tasks visible in context |

No server-side telemetry in phase 1 — everything lives client-side. If users opt in to sharing debug data (separate feature), we can aggregate later.

---

## 9. Risks and mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| LLM hallucinates an action not in the catalog | Medium | Strict enum validation server-side; fall back to fast-match on failure; ring-buffer logs every parse for audit |
| LLM invents a `taskId` that doesn't exist | Medium | Server-side validation: taskId must be in `context.visibleTasks`. If not, strip it and set confidence to `low` |
| Intent provider returns malformed JSON | Medium | `voice.classify()` surfaces `schemaValid: false`; endpoint returns `parse_failed` + raw; client falls back to fast-match. Different providers have different JSON reliability (see subsystem PRD §5.2) — switching providers is a `/config/voice` operation, not a Siri-code change |
| Resolver misfires on ambiguous title ("the task") | High | Always surface candidates when top-2 scores within 10%; disambiguate UI |
| Latency spike from cold model load | High on first use | Subsystem warms providers on init; provider-specific warming (e.g. `ollama run gemma3:4b ""`) is a subsystem concern, not a Siri concern |
| User accidentally triggers destructive action | Low | Confirmation overlay for `close-task`, `kill-session`, `delete-task` — no exceptions |
| Prompt injection from task titles | Low (local only, no external users) | Don't need sanitization in phase 1; revisit if JST customers with untrusted content start using it |
| Whisper mishears "don't close the task" as "close the task" | Medium | Transparency overlay shows what was heard before dispatch; user has visible Esc window |
| Prompt grows unbounded as catalog expands | Low | Cap `visibleTasks` at 40, `activeSessions` at 20; prompt budget ≤ 2 KB context |
| Action catalog drifts out of sync with voiceVocabulary | Medium | Single source of truth: generate prompt's action catalog from `voiceVocabulary.svelte.ts` at build time; add type-level invariant that every interpret-able action has a vocab entry |
| Cloud provider accidentally used when user intended local | Low | Enforced at subsystem level via privacy toggles — Siri inherits the policy and cannot bypass it |

---

## 10. Open questions

1. **Opt-in vs always-on.** Should natural-language interpretation be on by default, or hidden behind a settings toggle the user flips after learning the quick phrases? Leaning toward opt-in for phase 1 (lower blast radius) and auto-enable after N successful uses.

2. **Compound commands.** "Close this and start the next one" — do we (a) issue one LLM call that returns an array of actions, or (b) run two sequential LLM calls pipelining the `lastAction` context? Option (a) is cleaner but harder to confirm destructive parts; option (b) matches how humans say them. Needs a spike.

3. **Mobile routing.** The iOS Voice Memos → `/api/tasks/voice` pipeline (jat-1tjil) ingests free-form voice memos into tasks. Should we add a mobile route to `/api/voice/interpret` so "hey JAT, close the auth task" from an iOS Shortcut does the same thing? Or keep mobile free-form and let command-style stay desktop-only? Probably: interpret if the utterance starts with a command verb, task-capture otherwise.

4. **How does the confirmation overlay interact with PushToTalkOverlay?** They're both modal-ish. Likely the confirmation replaces the PTT overlay content in place rather than stacking.

5. **Resolver for non-task routes.** On `/files` should "open the spawn endpoint" resolve against the file tree? On `/workflows` should "run the deploy workflow" match workflow names? Each route needs its own resolver contract. Phase 1 only solves `task-id`.

6. **LLM offline indicator.** Do we show a persistent health icon somewhere, or only flag it reactively when the user tries to invoke NL? Probably the latter — a health icon is noise 99% of the time. The subsystem's status (`ready`/`degraded`/`offline`) is already surfaced in `/config/voice` if the user wants to check.

7. **Voice mode for non-en-US accents.** Whisper large-v3-turbo handles English well; LLM prompt is English-only. What happens with a strong accent that whisper transcribes approximately? Relying on the LLM's tolerance for "rough" input is fine; adding per-user accent tuning is not in scope.

---

## 11. Phased rollout

### Phase 1 — `new-task` with parameter extraction (lowest risk, highest value)

**Prereq:** Voice subsystem Phase 1 (interfaces + voxtype/ollama providers) must ship first. Siri depends on `voice.transcribe()` and `voice.classify()`.

**Goal:** The single most common command (`create a task called …`) goes from matcher-only (empty drawer) to LLM-aided (pre-filled title, priority, type).

**Deliverables:**
- `POST /api/voice/interpret` endpoint (calls `voice.classify()`) with action enum limited to `new-task`, `navigate`, `global-search`, `toggle-terminal`, `start-next`, parameterless session actions
- `dispatchNaturalLanguage()` function, tiered dispatch in `voiceCapture.svelte.ts`
- `interpretDebugBuffer.ts` and `window.__jatVoiceInterpretDebug`
- Settings toggle in UserProfile
- Prompt built from `voiceVocabulary.svelte.ts` at compile time
- Overlay variant: "non-destructive interpretation preview"

**Explicit exclusions:**
- No task-id resolution (no close-task, no spawn-agent, no attach-terminal by name)
- No confirmation UX (nothing destructive yet)
- No disambiguation UX

**Success gate:** p95 ≤ 3s, schema-parse ≥ 95%, zero regressions on existing fast-path metrics.

### Phase 2 — Target resolution for existing verbs

**Goal:** "close the auth task", "spawn an agent for the triage bug", "attach terminal to EarlyShore".

**Deliverables:**
- Action catalog expands to `close-task`, `update-task`, `spawn-agent`, `kill-session`, `attach-terminal` (by name), `epic-swarm` (with epicTaskId), `add-project`
- Parameter resolver: visible-tasks fuzzy match + session-name + project-name
- Confirmation overlay for destructive actions (`close-task`, `kill-session`)
- Disambiguation overlay (numbered picks)
- Context assembly from route stores (visible tasks, active sessions)

**Success gate:** destructive wrong-action rate ≤ 5%, taskId resolution hit rate ≥ 90%.

### Phase 3 — Compound commands + polish

**Goal:** "close this and start the next one"; file-path resolver on `/files`; workflow-name resolver on `/workflows`.

**Deliverables:**
- Multi-action JSON schema (`actions: [...]`) or sequential pipelining — TBD from phase 2 learnings
- File-path resolver
- Workflow-name resolver
- `delete-task` action (destructive, least-used)
- Overlay polish: animated transitions between preview → confirmation → dispatch

---

## 12. Success criteria

Hard checks before declaring done:

- [ ] p95 latency of `/api/voice/interpret` ≤ 3.0 seconds on dev hardware with the subsystem's default LLM provider
- [ ] Schema-parse success rate ≥ 95% over a 100-utterance test set
- [ ] Fast-path hit rate unchanged (≥ 99% of confidence ≥ 0.90 utterances still skip the LLM)
- [ ] Natural-language opt-in conversion: 50% of users who try it enable it permanently within one session
- [ ] jw's canonical flow works end-to-end without touching the keyboard:
  - Hold Ctrl+Space → say "create a task titled fix the auth bug and assign to EarlyShore"
  - Release → drawer opens pre-filled with title "Fix the auth bug" and assignee "EarlyShore"
  - Hold Ctrl+Space → say "submit"
  - Task is created
- [ ] jw's destructive canonical flow: say "close the auth task" → confirmation shows right task → Enter closes it
- [ ] If the subsystem's active LLM provider is unreachable, the user still gets the jat-crmt6 quick-phrase feature with one-line advisory
- [ ] Every dispatch shows a visible interpretation string before firing (no silent mystery dispatches)
- [ ] Cancelling a confirmation (Esc) fires no API calls and leaves no side effects
- [ ] `window.__jatVoiceInterpretDebug` has 50-entry ring buffer with every required field populated

---

## 13. User stories

All stories are testable. Acceptance criteria are numbered so QA can check them off one at a time.

### Authentication and access

**US-001 — Privacy inherits from subsystem**
As jw, I want Siri's voice handling to respect whatever privacy policy I set in `/config/voice` so I don't have to configure it twice.
Acceptance:
1. Flipping off-device audio OFF in `/config/voice` immediately disables cloud STT for Siri as well
2. Flipping off-device text OFF disables cloud LLM classification for Siri
3. No Siri-specific privacy toggles exist
4. Siri's settings panel has a link "Privacy settings are in /config/voice"

**US-002 — Feature is opt-in**
As a user, I want natural-language interpretation to be disabled by default so I don't get unexpected LLM behavior until I choose to try it.
Acceptance:
1. Fresh install: `localStorage['jat-voice-nl-enabled']` is `null`; feature is off
2. Fast-path matcher still works with NL off
3. Settings toggle flips state; page reload preserves it
4. With NL off, `/api/voice/interpret` is never called

### Fast-path preservation

**US-003 — Quick phrases unchanged**
As jw, when I say "new task" (exact phrase), I want the same sub-400ms drawer-opening behavior I have today so I don't regress my muscle memory.
Acceptance:
1. Transcript "new task" → fast matcher confidence 1.0 → dispatch via action-handler
2. Zero calls to `/api/voice/interpret` for this path
3. End-to-end latency from release to drawer-open ≤ 450ms (assuming voxtype active)

**US-004 — Navigation keys unaffected**
As jw, saying "next item" still fires 'j' keystroke with no LLM involvement.
Acceptance:
1. Fast-match exact-phrase hit dispatches immediately
2. No `InterpretDebugEntry` is written for this utterance

### Creation with parameters

**US-005 — Titled task creation**
As jw, I want to say "create a task called fix the login flow" and land in a drawer with that exact title pre-filled.
Acceptance:
1. `voice.classify()` returns `action: new-task`, `params.title: "Fix the login flow"` (capitalized)
2. Drawer opens with title field populated
3. Overlay shows the interpretation before dispatch
4. Pressing Esc before overlay dismisses closes drawer without saving

**US-006 — Task creation with priority and type**
As jw, "create a bug called fix the login flow priority one" fills title, type=bug, priority=1.
Acceptance:
1. `voice.classify()` returns `type: 'bug'`, `priority: 1`, `title: "Fix the login flow"`
2. Drawer's type dropdown is "bug", priority badge shows P1
3. Title is correct

**US-007 — Task creation with project**
As jw, "create a task in the flush project called set up Stripe webhooks" creates against the flush project.
Acceptance:
1. `voice.classify()` returns `params.project: 'flush'` and `title: "Set up Stripe webhooks"`
2. Drawer opens on flush project
3. If the project name isn't in `projects.json`, feature falls back to current project and shows advisory

### Target resolution

**US-008 — Close task by reference**
As jw, I want to say "close the auth task" and have the IDE pick the right task from my visible list.
Acceptance:
1. Server resolves `taskId` against `context.visibleTasks` using fuzzy match on title
2. If one match: confirmation overlay shows "Close 'Fix auth timeout' (jat-a1b2c3)"
3. Enter → `PATCH /api/tasks/jat-a1b2c3 status=closed`; Esc → no call
4. Interpretation string includes both the title and the task ID

**US-009 — Ambiguous task resolution**
As jw, when "the auth task" matches two tasks, I want to pick one without re-recording.
Acceptance:
1. `taskIdCandidates.length >= 2` → disambiguation overlay
2. Up to 3 candidates shown with number keys 1/2/3
3. Number press → confirmation overlay for that task
4. Esc at any stage → no side effects
5. Candidates show title + id + status + priority

**US-010 — Spawn agent on named task**
As jw, "spawn an agent for the triage bug" resolves to a task and POSTs to `/api/work/spawn`.
Acceptance:
1. `voice.classify()` returns `action: spawn-agent`, `params.taskId: <resolved>`
2. No confirmation (spawn is non-destructive)
3. `POST /api/work/spawn` body: `{ taskId }`
4. Session appears in work view

**US-011 — Attach terminal to named session**
As jw, "attach terminal to EarlyShore" opens the tmux terminal for that session even when nothing is hovered.
Acceptance:
1. `voice.classify()` returns `sessionName: 'EarlyShore'`
2. Dispatch calls the same handler as Alt+A does for the hovered session
3. If session doesn't exist, overlay shows "No session EarlyShore" and no dispatch fires

### Navigation

**US-012 — Navigate by name**
As jw, "go to the workflows page" routes to `/workflows`.
Acceptance:
1. `voice.classify()` returns `action: navigate`, `params.route: '/workflows'`
2. Overlay shows interpretation
3. SvelteKit goto() fires
4. No confirmation (non-destructive)

**US-013 — Navigate by informal reference**
As jw, "show me clients" routes to `/clients`.
Acceptance:
1. `voice.classify()` returns `route: '/clients'` even though the phrase isn't "clients page"
2. Route matches the canonical navigation entry list

### Destructive confirmations

**US-014 — Close confirmation required**
As jw, destructive actions always show a confirmation before firing.
Acceptance:
1. `close-task` → confirmation overlay appears
2. No API call fires until Enter is pressed
3. Esc cancels with no side effects
4. Overlay auto-times-out after 8 seconds → no dispatch
5. Confirmation shows task title, id, current status

**US-015 — Kill session confirmation**
As jw, "kill the session on the auth task" requires confirmation.
Acceptance:
1. Resolves sessionName from active sessions
2. Shows confirmation "Kill session jat-EarlyShore?"
3. Enter → DELETE /api/sessions/:name; Esc → no-op

### Graceful degradation

**US-016 — Intent provider unavailable**
As jw, if the subsystem's active LLM provider is unreachable (and subsystem fall-through has also failed), Siri falls back to fast-match cleanly.
Acceptance:
1. `voice.classify()` throws; `/api/voice/interpret` returns 503 within 500ms
2. Client dispatches fast-match fallback with an advisory overlay
3. Advisory points to `/config/voice` → Intent provider
4. No console errors, no retries, no hangs
5. Next press of Ctrl+Space tries the subsystem again (no circuit breaker at the Siri layer)

**US-017 — LLM returns malformed JSON**
As jw, if the provider returns garbage, I get a clear no-action message — not a crash.
Acceptance:
1. Parse failure → `interpretDebugBuffer` entry with `parseSuccess: false`
2. Overlay shows "I didn't understand. Try: 'create a task called …'" (hinted from fast-match if any)
3. No dispatch fires
4. Raw provider output is captured in debug buffer (trimmed to 2KB)

**US-018 — LLM times out**
As jw, if the LLM takes longer than the subsystem's timeout, I get a timeout message and can try again.
Acceptance:
1. Timeout is inherited from subsystem configuration (default 5s)
2. Overlay shows "Interpretation timed out"
3. Fast-match fallback fires if present

**US-019 — LLM invents a task ID**
As jw, if the provider returns a taskId not in my visible list, the server strips it and lowers confidence.
Acceptance:
1. Server-side validation: taskId must be in `context.visibleTasks`
2. If not, taskId is removed from response and confidence set to 'low'
3. Overlay shows "No task matching '…' — try being more specific"

### Transparency

**US-020 — Interpretation is always visible**
As jw, I always see what the system thinks I said before it acts.
Acceptance:
1. Every NL dispatch passes through the PushToTalkOverlay in an `interpretation` state
2. Interpretation string is visible for at least 500ms before auto-dispatch of non-destructive actions
3. Destructive actions block on user confirm

**US-021 — Debug buffer captures everything**
As a developer, I can inspect `window.__jatVoiceInterpretDebug` and see exactly what the LLM said.
Acceptance:
1. Ring buffer size = 50
2. Every entry has: transcript, route, fast-match result, providerId, LLM latency, parse success, raw response (≤ 2KB), outcome
3. Accessible from browser console without auth

### Compound and edge

**US-022 — Compound command (phase 3)**
As jw, "close this task and start the next one" executes both actions in sequence.
Acceptance:
1. First action's confirmation (if destructive) must pass before second action is considered
2. `lastAction` context is passed to the second LLM call (or encoded in single-call array response)
3. Cancelling the first action cancels the whole compound
4. Each action independently appears in debug buffer

**US-023 — Empty / unclear utterance**
As jw, if I say nothing coherent, I get a "no-match" overlay, not a random action.
Acceptance:
1. Transcription returns near-empty transcript → no interpret call
2. Interpret with confidence 'low' and no resolvable action → no-match overlay
3. Raw transcript is shown so jw can see what the STT provider heard

**US-024 — Privacy-respecting debug**
As jw, debug buffer is local-only and cleared on page reload.
Acceptance:
1. Ring buffer is module-scoped memory; never persisted
2. Reload clears it
3. No server-side telemetry in phase 1

### Settings

**US-025 — Toggle on/off**
As jw, I can enable or disable NL interpretation per-machine from the UserProfile dropdown.
Acceptance:
1. Toggle writes `localStorage['jat-voice-nl-enabled']`
2. Changes take effect without reload
3. Toggle description links to `/config/voice` for provider setup
4. Disabling mid-session: any in-flight interpret request is still dispatched; new presses use fast-match only

**US-026 — Feature gate on subsystem capability**
As jw, I can't enable Siri if the subsystem has no LLM provider available.
Acceptance:
1. `voice.capabilities.llm === false` → settings toggle is disabled
2. Tooltip: "Configure an intent provider in /config/voice"
3. Toggle auto-re-enables when a provider becomes available
