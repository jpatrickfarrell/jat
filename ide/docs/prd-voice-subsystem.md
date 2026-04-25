# PRD: Voice Subsystem — Unified Voice Layer for JAT

**Status:** Draft
**Author:** jw
**Date:** 2026-04-21

**Related PRDs:**
- `specs/prd-voice-intelligence.md` — Context injection, speaker resolution, memory files, push notifications. Built on top of voice-core.js. jat-68j78.24 (refactor voice-core) must absorb these features — see that task's description for the preservation checklist.

---

## 1. Executive summary

Voice has crept into JAT through four independent entry points: the push-to-talk shortcut dispatcher (jat-crmt6), the voice-inbox iOS Shortcuts pipeline (jat-1tjil / jat-06x4t / jat-2atga), the diarization-backed voice-core library, and now the planned "Siri for JAT" natural-language interpreter. Each one stands up its own transcription and LLM path: `/api/voice/capture` shells out to voxtype directly, `voice-core.js` shells out to either voxtype or whisperx and then fetches ollama, and the Siri PRD proposed doing the same. There is **zero shared configuration**, no single place to switch providers, no privacy gate, no place for a user to plug in their OpenAI or Anthropic key, and no way to retrofit click-to-speak into arbitrary text inputs without duplicating the transport. This PRD defines the **Voice Subsystem**: two provider interfaces (`TranscribeProvider`, `IntentProvider`) plus an optional `SpeakProvider`, a single reactive store (`voice`), a user-level config file at `~/.config/jat/voice.json`, a `/config/voice` settings page, a `/setup` wizard step, and a reusable `<VoiceInput>` component. Every existing voice touchpoint moves behind this layer; every future one composes on top. Local-first by default, cloud providers opt-in, per-capability privacy gates, every cloud call logged to a user-level JSONL audit file, and **the whole subsystem is opt-out: disabled by default on fresh installs, with a zero-cost guarantee when off**. Push-to-talk only — always-listening is an explicit non-goal.

---

## 2. Background: current voice-touchpoint inventory

What's in the repo today, who it talks to, and whether it will migrate to the subsystem:

| Touchpoint | Current path | Transcribe via | LLM via | Migration | When `voice.enabled=false` |
|---|---|---|---|---|---|
| Push-to-talk shortcuts | `ide/src/lib/stores/voiceCapture.svelte.ts` → `/api/voice/capture` | voxtype (shell-out, hard-coded in `ide/src/routes/api/voice/capture/+server.ts`) | — | Route through `voice.transcribe()`; old endpoint kept as thin alias | **No-op.** Ctrl+Space handler not registered. |
| Push-to-talk capture (jat-kpfmx) | Existing Ctrl+Space → whisper pipeline shipped on master | voxtype | — | Consumes subsystem. On upgrade, becomes inactive until user opts in (see §7.5.1) | **No-op.** Handler is not installed when disabled. Upgrading users land here until they re-enable at `/config/voice`. |
| Quick phrase matcher / registry / dispatch (jat-107ll) | `ide/src/lib/voice/{utteranceMatcher,voiceActionRegistry,dispatchMatch,matchDebugBuffer}.ts` + `voiceVocabulary.svelte.ts` | N/A (pure-text matcher) | N/A | **No change** — these are upstream of the subsystem. Code stays in the bundle but is dead (tree-shaken via the lazy-import pattern in §7.5) when `enabled=false`. | **No-op.** Matcher only runs on transcripts; no transcripts produced when disabled. On upgrade, becomes inactive until user opts in. |
| Siri for JAT (planned) | `dispatchNaturalLanguage()` + `/api/voice/interpret` (prd-siri-for-jat.md) | voxtype (inherited from PTT capture) | ollama via direct `fetch` to `http://localhost:11434` | Both sides consume subsystem | **Unreachable.** Depends on transcripts. |
| Voice-inbox ingest (iOS Shortcuts) | `/api/tasks/voice/+server.js` | voxtype or whisperx-diarized (switched inside `voice-core.js`) | ollama (title/summary/task extraction in `voice-core.js`) | `voice-core.js` refactored to consume subsystem | **Still works.** Voice-inbox is a server-side pipeline triggered by iOS Shortcuts, not by the in-browser voice subsystem. Ingest endpoints bypass `voice.enabled`. |
| Voice-KB / summary / diarize siblings | `/api/voice/{kb,summary,diarize}` | same as voice-core | same | same | **Still works** (same reason as voice-inbox). |
| Push-to-talk overlay | `ide/src/lib/components/voice/PushToTalkOverlay.svelte` | N/A | N/A | Dynamic-imported only when enabled (see §7.4) | **Not loaded.** Zero bundle cost. |
| (Historic) TaskDetailDrawer click-to-speak | Removed in earlier iteration | — | — | Returns as `<VoiceInput>` component built on subsystem | **Renders as plain textarea** (mic button absent). |

The jat-107ll stack (matcher, registry, dispatch) is **above** the subsystem — it operates on transcript strings regardless of origin. Only the transcription call sites change.

The **disabled state applies to the browser voice layer**, not the server-side ingest endpoints. iOS Shortcuts users sending audio to `/api/tasks/voice` are unaffected by `voice.enabled`: they talk to the server, not the browser.

---

## 3. Goals and non-goals

### Goals

1. One initialization path, one place to see what voice capabilities are available, one place to switch providers — scoped to the **user**, not the project.
2. Provider-agnostic feature code: a feature calls `voice.transcribe(blob)` and never knows which engine ran it.
3. Per-user provider configuration (local, OpenAI, Anthropic, ElevenLabs) with credentials sourced from the existing `jat-secret` vault.
4. Graceful degradation: cloud providers unreachable or disabled → fall through to local; local provider not installed → feature disabled with a clear advisory, never a silent crash.
5. Unified debug buffer across all voice operations (`window.__jatVoiceSubsystem`) so jw can inspect every call end-to-end.
6. Capability flags that gate UI: if no STT provider is available, the push-to-talk button is hidden, not broken.
7. Reusable `<VoiceInput>` component that any textarea/input in the IDE can opt into without wiring transport.
8. **Opt-out by default.** Fresh installs start with `voice.enabled=false`. A disabled subsystem costs nothing: no mic prompt, no keydown listeners, no probe calls, no bundle cost from overlay components.

### Non-goals

- **Always-listening / wake-word.** Push-to-talk is the only capture model. Revisiting this is a separate PRD.
- **On-device custom voice training / speaker enrollment.** Diarization is supported via whisperx, but no custom model training.
- **Multi-turn conversational state.** One press, one transcript, one action. Conversation is a consumer layer, not a subsystem concern.
- **Audio storage / playback archives.** Transcripts may be logged; raw audio is discarded after transcription.
- **Replacing the matcher or action registry.** Those are orthogonal to transcription and LLM routing.
- **Project-scoped voice configuration.** Voice is explicitly a user-level concern. See §5.0.
- **Cross-device config sync.** `voice.json` lives on one machine. Using JAT from a second machine means configuring voice there independently.
- **Seamless upgrade preservation of prior voice state.** Upgrading from pre-subsystem master forces explicit opt-in; no auto-detect of existing voxtype/ollama. See §7.5.1.

---

## 4. User personas and stories

### Primary persona — jw

- Runs JAT 8-12 hours/day across 6+ projects, voxtype and ollama installed locally.
- Has paid API keys for OpenAI, Anthropic, ElevenLabs stashed in `jat-secret`.
- Wants local-first latency for the 99% case, cloud fallback for the ambiguous 1% where a bigger model resolves a nuance local can't.

### Secondary persona — self-hosted JAT users

- Run JAT on their own hardware, do not have API keys, do not want any audio leaving the box.
- Install voxtype + ollama, never touch the cloud toggles, never see a "provider unavailable" error.

### Tertiary persona — hosted JAT users (future)

- Run a hosted IDE, may not have local inference available.
- Pick cloud providers at onboarding, billed through the hosting plan.

### Quaternary persona — voice-uninterested JAT users

- Use JAT for task management and agent orchestration; never dictate anything.
- Never want a mic permission prompt, never want voice UI, never want to see voice config unless they go looking.

### User stories (high-level — see §13 for full list)

- *"As a first-time JAT user, I want the setup wizard to detect voxtype and ollama and just work — no config."*
- *"As a fresh install who doesn't want voice, I want the subsystem disabled with zero cost until I opt in."*
- *"As jw, I want to add my OpenAI key once in `jat-secret` and have it show up as a selectable STT/LLM provider in `/config/voice`."*
- *"As a privacy-conscious user, I want a master toggle that disables all cloud audio processing and greys out cloud providers in the picker."*
- *"As jw, I want to switch from voxtype to OpenAI Whisper mid-session and have the next push-to-talk use the new provider without a page reload."*
- *"As jw, I just got on a flight — I want to flip off cloud STT and have the system fall back to voxtype until I turn it back on."*
- *"As a dev debugging a misfire, I want to inspect the last 50 voice calls — which provider, how long, did it succeed — from the browser console."*
- *"As a user upgrading from the push-to-talk-only master branch, I want a clear, one-time notice that voice has moved to a subsystem I need to re-enable."*
- *"As a user who tried voice and decided not to use it, I want to turn the whole subsystem off and have it actually be off."*
- *"As a debugger, I want to `tail -f` my voice audit log from the terminal."*

---

## 5. Functional requirements

### 5.0 Config scope and storage

**Voice configuration is user-level, not project-level.** One `voice.json` file per machine, shared across every JAT project the user works on.

**File:** `~/.config/jat/voice.json`, alongside the existing `projects.json`, `credentials.json`, `agents.json`, `review-rules.json`. Never enters a project repo. Never committed.

**Schema:**

```json
{
  "enabled": false,
  "activeStt": "voxtype",
  "activeLlm": "ollama",
  "activeTts": null,
  "privacy": {
    "offDeviceAudio": false,
    "offDeviceText": false,
    "offDeviceSpeech": false
  },
  "hotkey": "Ctrl+Space",
  "inputDeviceId": "default",
  "providerOverrides": {
    "ollama": { "model": "gemma3:4b", "timeoutMs": 5000 },
    "openai": { "model": "gpt-4o-mini" }
  }
}
```

**Why user-level:**
- Voice hardware is a property of the machine (which mic, which speakers, which GPU), not a property of a codebase.
- API keys and privacy toggles are a property of the person, not the project. jw's OpenAI key is jw's regardless of whether he's working on chimaro or jat.
- Per-project overrides (e.g. "flush uses OpenAI, chimaro uses voxtype") solve a problem nobody has. If it turns up later, a `projectOverrides` key can be added without a schema migration — but v1 ships without it.

**Server endpoints:**

- `GET /api/config/voice` — read and return `~/.config/jat/voice.json` (or return defaults if the file does not exist).
- `PUT /api/config/voice` — write the full JSON payload atomically. Validates against the schema and rejects unknown top-level keys.

Mirror the pattern used by the existing `/api/config/defaults` endpoint (see `ide/src/routes/api/config/defaults/+server.ts`). The `/config/voice` UI consumes these endpoints.

**Relationship to the store:** `voice.init()` reads from `voice.json` on startup. `voice.setActiveStt(id)` / `voice.setActiveLlm(id)` / every privacy-toggle setter writes the full updated config back via `PUT /api/config/voice`.

### 5.1 Provider interfaces

The subsystem exposes three interfaces. Features code against these, never against a specific provider.

```ts
// ide/src/lib/voice/types.ts

export interface TranscribeResult {
  transcript: string;
  durationMs: number;                 // audio duration
  language?: string;                  // e.g. 'en'
  segments?: Array<{                  // present when diarize=true
    start: number;                    // seconds
    end: number;
    speaker?: string;                 // e.g. 'SPEAKER_00'
    text: string;
  }>;
  providerLatencyMs: number;          // wall time of the provider call
}

export interface TranscribeProvider {
  id: 'voxtype' | 'whisperx' | 'openai' | 'elevenlabs';
  name: string;                       // display name
  isLocal: boolean;
  capabilities: {
    diarize: boolean;
    maxDurationSec: number;           // provider-enforced ceiling
    supportedLanguages?: string[];    // omit = all
  };
  isAvailable(): Promise<{ ok: boolean; reason?: string }>;
  transcribe(audio: Blob, opts?: {
    language?: string;
    diarize?: boolean;
    prompt?: string;                  // biasing hint — Whisper/voxtype support
  }): Promise<TranscribeResult>;
}

export interface IntentResult<T = unknown> {
  parsed: T | null;                   // null on schema failure
  confidence: number;                 // 0-1 (heuristic + self-reported)
  raw: string;                        // raw model output (capped 4KB)
  providerLatencyMs: number;
  schemaValid: boolean;
}

export interface IntentProvider {
  id: 'ollama' | 'openai' | 'anthropic';
  name: string;
  isLocal: boolean;
  isAvailable(): Promise<{ ok: boolean; reason?: string }>;
  classify<T>(input: {
    system: string;                   // system prompt
    transcript: string;               // user utterance
    context: string;                  // pre-rendered context block
    schema: object;                   // JSON Schema draft-07
    model?: string;                   // override default
  }): Promise<IntentResult<T>>;
}

// Optional, Phase 2+
export interface SpeakProvider {
  id: 'elevenlabs' | 'openai';
  name: string;
  isLocal: boolean;
  isAvailable(): Promise<{ ok: boolean; reason?: string }>;
  speak(text: string, opts?: {
    voice?: string;
    speed?: number;                   // 0.5-2.0
  }): Promise<Blob>;                  // audio/mpeg or audio/wav
}
```

### 5.2 Provider catalog

Ship with these providers. Concrete model choices and rationale below — commit, don't hedge.

**Transcribe providers:**

| Provider | Local? | Diarize | Default model | Rationale |
|---|---|---|---|---|
| **voxtype** (default when local) | Yes | No | whisper large-v3-turbo | Existing fast path. Sub-400ms on short utterances on jw's hardware. Minimal delta from today's `/api/voice/capture`. |
| **whisperx** | Yes | **Yes** | large-v3 + pyannote | Only exposed when user enables diarization (voice-inbox usage). Slower — 3-10× voxtype — but the only local diarization option. |
| **OpenAI Whisper** | No | No | `whisper-1` | Most reliable cloud STT for English. HTTPS POST to `api.openai.com/v1/audio/transcriptions`. Key from `jat-secret openai`. Requires off-device audio toggle ON. |
| **ElevenLabs Scribe** | No | Yes | `scribe_v1` | Released 2025; currently the most accurate STT available. Supports diarization via API. Key from `jat-secret elevenlabs`. Requires off-device audio toggle ON. |

**Intent (LLM) providers:**

| Provider | Local? | Default model | Rationale |
|---|---|---|---|
| **ollama** (default when local) | Yes | `gemma3:4b` | Already wired up in voice-core.js for task extraction. JSON mode is reliable. CPU-only on jw's Radeon 890M iGPU (no ROCm). p50 ≈ 1.2s, p95 ≈ 2s. |
| **OpenAI** | No | `gpt-4o-mini` | Cheap, fast, extremely reliable JSON mode. Recommended over `gpt-4o` for intent parsing because the marginal quality gain does not justify 10× cost + 2× latency for a task this constrained. |
| **Anthropic** | No | `claude-haiku-4-5` | Structured tool use gives near-perfect schema conformance. Slightly more expensive than `gpt-4o-mini`; pick for reliability-critical flows. |

**Speak providers (Phase 2+, specified now so the interface doesn't churn):**

| Provider | Default model | Rationale |
|---|---|---|
| **ElevenLabs** | `eleven_flash_v2_5` | Low-latency (sub-500ms) speech for short confirmations like "Task closed" or "Spawned agent EarlyShore". |
| **OpenAI** | `tts-1` | Cheaper fallback for longer text-to-speech. |

### 5.3 Credentials integration

Cloud providers never store their own API keys. They pull from the existing `jat-secret` vault via `ide/src/lib/utils/credentials.ts` (specifically `getApiKeyWithFallback`).

- `OpenAI` → reads `jat-secret openai` → env var `OPENAI_API_KEY`.
- `Anthropic` → reads `jat-secret anthropic` → env var `ANTHROPIC_API_KEY`.
- `ElevenLabs` → reads `jat-secret elevenlabs` → env var `ELEVENLABS_API_KEY`.

The `/config/voice` page does **not** duplicate API-key storage. On provider selection:

1. The picker calls `GET /api/voice/providers` → server probes each provider's `isAvailable()`.
2. Cloud providers return `{ ok: false, reason: 'no_api_key' }` if the vault lookup misses.
3. The UI renders that provider as disabled with a "Add OpenAI key →" link that deep-links to `/config` → API Keys tab (the existing CredentialsEditor).
4. After the user adds the key and navigates back, the provider picker re-probes on mount.

### 5.4 Privacy model

One master toggle plus three sub-toggles. Default: everything off-device disabled.

**Master:**

- **"Allow off-device audio processing"** (default: **OFF**)

**Sub-toggles (revealed when master is ON):**

| Toggle | Default | Effect |
|---|---|---|
| Allow off-device audio (STT) | OFF | Cloud STT providers enabled in picker. When OFF, they are greyed out regardless of API keys. |
| Allow off-device text (LLM intent) | OFF | Cloud LLM providers enabled. Only text (transcript + context) goes off-device, not audio. |
| Allow off-device speech output (TTS) | OFF | Cloud TTS enabled (Phase 2+). |

**First-time confirmation:** When a user enables any off-device toggle for the first time, a one-time modal lists exactly what data will leave the device for that toggle:

```
"Allow off-device audio" will send:
  • Your raw recorded audio (mic capture, ~50-200KB per utterance)
  • Language hint (e.g., 'en')

The provider (OpenAI Whisper / ElevenLabs Scribe) will see this audio
and return a text transcript. They may retain audio per their privacy
policy — review before enabling.

  [ Cancel ]   [ I understand, enable ]
```

**Revocation is immediate.** Flipping a sub-toggle OFF drains in-flight cloud requests (they complete, no new ones start) and the next press of Ctrl+Space uses the next-available local provider.

**Audit log — user-level, JSONL, on disk.** See §5.4.1 for the full spec.

#### 5.4.1 Audit log

Transparency artifact, not an analytics surface. A user must be able to answer *"what did I send to OpenAI last Tuesday"* without loading a SQL tool.

**Path:** `~/.config/jat/voice-audit.jsonl` — single file, user-level, shared across every project the user works on. Sits alongside `voice.json` in the same directory.

**Format:** append-only JSONL, one line per cloud STT/LLM/TTS call. Each line:

```json
{"ts":"2026-04-21T16:42:03.112Z","provider":"openai","op":"transcribe","bytes":18422,"latencyMs":812,"model":"whisper-1","ok":true}
```

Fields are: ISO-8601 timestamp, provider id, operation (`transcribe` | `classify` | `speak`), approximate request body size in bytes, wall-clock latency in ms, model identifier, success boolean. No request body is recorded. No API keys. No transcripts.

**Rotation:** rotate at **10 MB OR 30 days, whichever hits first**. Keep 3 rotated generations (`voice-audit.jsonl.1`, `voice-audit.jsonl.2`, `voice-audit.jsonl.3`). Older files are deleted. Rotation happens lazily — on the next write after the threshold is crossed, not on a timer.

**Postgres-backed projects use the same log.** Voice is user-scoped, not project-scoped, so the underlying project backend (SQLite for local projects, postgres for `meadow` and other `graduated` projects) does not affect where the audit log lives. Every user has exactly one `voice-audit.jsonl` regardless of how many postgres projects they work on.

**Rationale for JSONL-on-disk instead of SQLite:**

- Append-only access pattern doesn't need SQL. Every write is `appendFile`; there are no updates, no deletes, no indexed reads.
- The in-browser ring buffer (N=100) already satisfies the p50/p95 metrics dashboard case in `/config/voice`.
- JSONL is trivially `tail -f`-able for debugging. Users can answer "what just happened" from a terminal without booting the IDE.
- Avoids schema migrations — fields can be added to new rows without touching old ones.

**Relationship to the debug buffer:** `window.__jatVoiceSubsystem` (§8.1) is the dev-facing, in-memory ring buffer used for `/config/voice` metrics. The JSONL file is the user-facing, on-disk transparency record. They are separate. Debug buffer is cleared on page reload; audit log persists.

**Surfaced where:**
- `/config/voice` → Diagnostics → "Recent cloud calls" shows the last 50 rows read from the audit log (server-side read via `GET /api/config/voice/audit?limit=50`).
- The IDE makes no attempt to display rotated files — those are for `tail -f` / `grep` users.

### 5.5 Reactive store — `voiceSubsystem.svelte.ts`

**File:** `ide/src/lib/voice/voiceSubsystem.svelte.ts`

Public API:

```ts
export const voice = {
  // Master enable flag — drives the disabled-state guarantees in §7.5
  enabled: $state<boolean>;

  // Provider registries (populated at init; empty arrays when disabled)
  sttProviders: readonly TranscribeProvider[];
  llmProviders: readonly IntentProvider[];
  speakProviders: readonly SpeakProvider[];    // Phase 2+

  // Active selection — reactive
  activeSttId: $state<string>;
  activeLlmId: $state<string>;
  activeSpeakId: $state<string | null>;        // null = disabled

  // Convenience accessors — route through active provider
  transcribe(audio: Blob, opts?: TranscribeOpts): Promise<TranscribeResult>;
  classify<T>(input: ClassifyInput): Promise<IntentResult<T>>;
  speak(text: string, opts?: SpeakOpts): Promise<Blob>;

  // Capabilities (derived; all false when enabled=false)
  capabilities: $derived<{
    stt: boolean;                              // any STT provider available
    llm: boolean;                              // any intent provider available
    diarize: boolean;                          // at least one STT with diarize=true
    speak: boolean;                            // any TTS provider available
    offDeviceAudio: boolean;
    offDeviceText: boolean;
    offDeviceSpeech: boolean;
  }>;

  // Runtime status
  status: $state<'offline' | 'initializing' | 'ready' | 'degraded'>;
  //   'offline'       = voice.enabled === false, or no STT/LLM at all
  //   'initializing'  = probe in flight
  //   'ready'         = all selected providers available
  //   'degraded'      = some providers unavailable but core loop works

  // Actions
  init(): Promise<void>;                       // reads voice.json, probes providers, populates registries
  setEnabled(enabled: boolean): Promise<void>; // writes voice.json, installs/removes listeners
  setActiveStt(id: string): void;              // writes voice.json via PUT /api/config/voice
  setActiveLlm(id: string): void;
  setActiveSpeak(id: string | null): void;
  testStt(): Promise<TranscribeResult>;        // canned round-trip
  testLlm(): Promise<IntentResult>;
};
```

**Load order:**

1. `+layout.svelte` `onMount()` calls `voice.init()`.
2. `init()` performs `GET /api/config/voice` — if the file doesn't exist, the upgrade behavior in §7.5.1 runs (write `enabled=false` defaults unconditionally).
3. If `enabled === false` → `init()` sets `status='offline'`, leaves all provider arrays empty, returns. **No further work happens.** No probes, no listeners, no dynamic imports. This is the cheap no-op path.
4. If `enabled === true` → `init()` fires `GET /api/voice/providers` with a 2s timeout; server probes each provider in parallel.
5. Response populates `sttProviders` / `llmProviders` / `speakProviders`.
6. `status` transitions `initializing → ready` (at least one local provider available) or `degraded` (some providers unavailable) or `offline` (no STT or no LLM).
7. UI reads `voice.capabilities` to decide what to render.

**Persistence:** The store does not maintain a parallel cache in `localStorage`. **`voice.json` is the only source of truth.** Every setter writes the full file back via `PUT /api/config/voice`. Cross-tab sync is achieved by re-reading on tab focus (`document.visibilitychange` handler — only installed when `enabled === true`).

### 5.6 `/setup` wizard step

New step inserted between the existing "Projects" and "Review" steps (see `ide/src/routes/setup/+page.svelte`).

**Step title:** "Voice (optional)" — header includes a prominent **Skip** button that leaves `voice.enabled=false`.

Skip is the default path — users who don't care about voice can one-click past the step and never see it again until they visit `/config/voice` explicitly.

**Sub-sections (only shown if user chose not to skip):**

1. **Microphone check** — requests mic permission, draws a live waveform preview while user speaks, indicates green when audio signal is detected.
2. **Local STT check** — "Detecting voxtype…"
   - Success: "✓ Found voxtype at `/usr/local/bin/voxtype`"
   - Failure: "Not installed — run `brew install voxtype` / `cargo install voxtype`" + a **Recheck** button.
3. **Local LLM check** — "Detecting ollama…"
   - Running + model present: "✓ ollama at `http://localhost:11434`, gemma3:4b installed"
   - Running, model missing: "ollama at `http://localhost:11434` — pull gemma3:4b? (1.5GB)" + a **Pull now** button → calls `/api/system/exec` to run `ollama pull gemma3:4b`, streams progress.
   - Not running: Install hint + recheck.
4. **Cloud providers (optional, collapsed by default)** — expand panel with three cards:
   - OpenAI: "Add key →" links to `/config` → API Keys tab. When the user returns with a key, this card pre-populates with masked key + "Verify" button.
   - Anthropic: same shape.
   - ElevenLabs: same shape.
5. **Test** — "Test your setup" → single button: "Say 'hello world'" → records 2s → transcribes via active STT → shows transcript + provider + latency. Second button: "Test intent" → sends a canned prompt to active LLM → shows result + latency.
6. **Enable** — final step. An explicit "Enable voice subsystem" button that:
   - Writes `enabled=true` to `voice.json`
   - Triggers `voice.init()` to install the hotkey handler and load the overlay component
   - Advances the wizard

**Enable is gated on at least one STT provider being available.** If the user reaches this step without voxtype or any cloud STT, the button is disabled and the copy is "Install a transcription provider above, then enable." A Recheck button re-probes on demand.

Skip is valid at every sub-section. Voice is optional throughout the wizard. If the user clicks Skip at any point, `voice.json` is written with `enabled=false` and the wizard advances.

### 5.7 `/config/voice` page

New route: `ide/src/routes/config/voice/+page.svelte`, surfaced as a new "Voice" tab in the existing tabbed `/config` layout (see `src/routes/config/+page.svelte` for the tab pattern).

**Two UI states**, driven by `voice.enabled`:

#### 5.7.1 Disabled state (default for fresh installs)

When `voice.enabled === false`, the page renders only:

- A single headline: **"Voice subsystem is disabled"**
- One paragraph explaining what voice does (push-to-talk transcription, intent classification, dictation in task fields)
- A list of detected/missing requirements (voxtype present? ollama running?) with install hints for whatever's missing
- A single primary CTA: **"Enable voice subsystem"** — disabled (greyed) until at least one STT provider probes available. A Recheck button re-probes on demand.
- A small footer link: "Delete voice.json (nuclear reset)" for users who want to start over.

Nothing else. No provider pickers, no privacy toggles, no diagnostics. If the user hasn't opted in, they shouldn't see a wall of configuration they don't want.

#### 5.7.2 Enabled state (full config UI)

When `voice.enabled === true`, the page renders the full configuration surface:

- **Master switch at the top:** "Voice subsystem: Enabled" with an "Disable" button (see US-040 for the disable flow).

- **Input device**
  - Dropdown populated from `navigator.mediaDevices.enumerateDevices()` filtered by `kind === 'audioinput'`.
  - Shows device label and "Default" badge.
  - Live waveform strip below the dropdown.

- **Push-to-talk hotkey**
  - Reuses the existing shortcut editor from `/config/shortcuts`.
  - Default: `Ctrl+Space` (inherited from jat-crmt6).

- **Transcription provider** (STT)
  - Radio group of available providers with badges: `[LOCAL]`, `[CLOUD — audio leaves device]`, `[DIARIZE]`, `[p50 440ms]`.
  - Unavailable providers shown greyed with reason ("ollama not running", "no OpenAI key").
  - Selecting a cloud provider when off-device audio is OFF shows an inline nudge: "Enable off-device audio below to use this provider."

- **Intent provider** (LLM)
  - Same treatment as STT.

- **Privacy**
  - Master toggle + three sub-toggles from §5.4.
  - Audit log accordion: "Recent cloud calls (last 50)" — expandable table with ts / provider / op / bytes / latency / ok, read from `~/.config/jat/voice-audit.jsonl`.

- **Diagnostics**
  - "Test microphone" → live 3-second waveform.
  - "Test STT" → records "hello world", shows transcript + latency.
  - "Test LLM" → canned classify call, shows parsed JSON + latency.
  - "Show metrics dashboard" → p50/p95 latency per provider over last 50 calls (see §8).

- **Advanced** (collapsed by default)
  - Model override per provider (e.g., switch ollama to `qwen2.5:3b`, or OpenAI Whisper to a pinned version if they introduce multiple).
  - Timeout per operation (default: 5s for STT, 5s for LLM).
  - Retry count (default: 1).
  - Debug buffer size (default: 100).

### 5.8 `<VoiceInput>` component

**File:** `ide/src/lib/components/voice/VoiceInput.svelte`

A reusable component any textarea or input in the IDE can opt into without wiring audio plumbing.

```svelte
<VoiceInput
  bind:value={taskTitle}
  mode="push"           {#- "push" | "toggle" — default "push" -#}
  autoSubmit={false}    {#- if true, submits form on transcription success -#}
  polish={true}         {#- if true, runs transcript through voice.classify() with a "clean this up" prompt -#}
  placeholder="Speak a task title..."
  disabled={false}
/>
```

**Behavior when `voice.enabled === true` and STT is available:**

- Renders an inline `<input>`/`<textarea>` with a mic button on the trailing edge.
- During recording: input is visually disabled, waveform replaces the placeholder.
- On transcription complete: fills the bound value.
- If `polish={true}`: after transcription, runs a tiny LLM pass with a fixed system prompt ("Fix punctuation and capitalization in this text. Return only the cleaned text, no commentary.") — useful for task titles, commit messages, search queries.
- If `autoSubmit={true}`: after the value is set, dispatches a `submit` event the parent can listen for.
- On failure: restores the previous value, shows a one-line error below the input for 3s.

**Behavior when `voice.enabled === false`:**

Renders as a **plain `<input>` / `<textarea>`** with identical layout — same width, same placeholder, same `bind:value`. No mic button. No keydown handlers beyond the browser default. It's a true drop-in replacement: a parent component can use `<VoiceInput>` everywhere and not care whether voice is on.

**Gating when enabled:** Mic only renders when `voice.capabilities.stt === true`. When `polish={true}`, also requires `voice.capabilities.llm`.

**Phase 2 retrofit targets:**

- `TaskCreationDrawer` — title + description fields.
- `TaskDetailDrawer` — title + description fields (returning the historic click-to-speak).
- `GlobalSearch` / `QuickFileFinder` — search queries.
- `InboxCompose` — reply field (with `polish={true}`).
- Workflow node labels.

---

## 6. UX flows

### 6.1 Fresh install — voice defaults to disabled

```
User installs JAT, opens IDE for the first time
  +layout.svelte → voice.init()
    voice.json does not exist → write enabled=false defaults (§7.5.1)
  voice.status = 'offline'
  voice.capabilities.stt = false
  voice.capabilities.llm = false

  No mic permission prompt
  No keydown listener installed
  PushToTalkOverlay never loaded
  Ctrl+Space does nothing voice-related

User reaches /setup wizard → "Voice (optional)" step
  [Skip] button in header, clicked
  Wizard advances. voice.json still enabled=false.

User works for a week, never sees voice UI

User revisits /config/voice out of curiosity
  Sees: "Voice subsystem is disabled"
  [ Enable voice subsystem ] button — greyed ("Install voxtype first")
  Install hints for voxtype + ollama
```

Total voice surface area touched: zero. No mic permission. No audio devices enumerated. No ollama probe. No network requests to cloud providers. No overlay component in the bundle.

### 6.2 Setup wizard — happy path, local-only

```
User chose to configure voice (didn't skip)
Wizard step "Voice (optional)"
  Mic permission prompt → user allows
  Waveform activates, green "signal detected"
  Detecting voxtype...                        ✓ Found
  Detecting ollama...                         ✓ gemma3:4b ready
  Cloud providers (collapsed, user ignores)
  [ Test your setup ]
    → User says "hello world"
    → "hello world" — voxtype — 420ms
  [ Enable voice subsystem ]
    → writes enabled=true, activeStt='voxtype', activeLlm='ollama'
    → voice.init() re-runs, hotkey registers, overlay loads
  [ Continue ]
```

Total time: ~20s. No network traffic leaves the machine.

### 6.3 Setup wizard — cloud opt-in

```
Wizard step "Voice (optional)"
  (mic + voxtype + ollama detected as above)
  Cloud providers (user expands)
    OpenAI:       [ Add key → ]   (opens /config, user pastes, returns)
                  ✓ sk-proj-...xyz9
    Anthropic:    [ Add key → ]   ...
    ElevenLabs:   (skipped)
  [ Test your setup ]
    → Tests run against voxtype + ollama (still local — cloud is opt-in even with keys)
  [ Enable voice subsystem ] → activates the layer
  [ Continue ]
```

### 6.4 Cloud STT with local fallback on failure

```
User holds Ctrl+Space, active STT = OpenAI Whisper
  [Listening] → [Transcribing]
  POST https://api.openai.com/v1/audio/transcriptions
    → ECONNREFUSED / 5xx / timeout
  Subsystem catches, appends audit log line with ok=false
  Subsystem falls through to next available STT (voxtype)
  voxtype returns "hello world" in 420ms
  Overlay badge: "⚠ OpenAI unavailable — used voxtype"
  Dispatch proceeds normally
```

Fall-through order: active → other local providers → (if off-device audio ON) other cloud providers → fail.

### 6.5 Revoking off-device audio mid-session

```
jw has activeSttId = 'openai', off-device audio ON
  Request 1: OpenAI Whisper, 540ms ✓
  Request 2: OpenAI Whisper, in flight (720ms elapsed)
jw opens /config/voice → flips "Allow off-device audio" OFF
  Subsystem:
    - Request 2 continues to completion (don't interrupt in-flight)
    - activeSttId auto-remapped to 'voxtype' (first local provider)
    - voice.json written with offDeviceAudio=false and new activeStt
    - Next capture uses voxtype
  Overlay badge on next press: "Using local (voxtype)"
```

### 6.6 Click-to-speak on task-title field with polish

```
TaskCreationDrawer mounts
  Title input renders with <VoiceInput bind:value={title} polish={true} />
  voice.enabled = true, voice.capabilities.stt = true → mic button renders
User clicks mic icon
  Input disables, waveform replaces placeholder
User says "fix the auth bug on chimaro"
  [Transcribing] 400ms via voxtype
  "fix the auth bug on chimaro"
  [Polishing] 900ms via ollama
  "Fix the auth bug on chimaro"
  Title field populates, waveform clears
  User presses Tab → moves to description field
```

### 6.7 Disabling the subsystem after enabling it

```
jw has voice enabled for 3 months, decides he doesn't want it anymore
  /config/voice → master switch at top: "Voice subsystem: Enabled"
  Click [Disable]
  One-time confirmation modal:
    "Disabling voice will:
     • Unregister the Ctrl+Space hotkey
     • Remove <VoiceInput> mic buttons throughout the IDE
     • Stop listening for the current voxtype and ollama processes
     Your voice.json settings are preserved — you can re-enable anytime."
    [ Cancel ]   [ Disable ]
  On confirm:
    voice.setEnabled(false)
    → writes voice.json with enabled=false (other fields preserved)
    → voice.init() re-runs, tears down hotkey + overlay
    → capabilities go false, UI updates
  /config/voice now shows the disabled state (§5.7.1)
```

Re-enabling from the disabled state one week later returns the user to their previous config (activeStt, activeLlm, privacy settings) unchanged — `voice.json` preserves everything except `enabled` on disable.

---

## 7. Technical architecture

### 7.1 Directory layout

```
ide/src/lib/voice/
  types.ts                        # Interfaces (5.1)
  voiceSubsystem.svelte.ts        # Reactive store (5.5)
  index.ts                        # Barrel: export { voice, types }

  providers/
    voxtype.ts                    # TranscribeProvider (wraps existing shell-out)
    whisperx.ts                   # TranscribeProvider (wraps existing diarize path)
    openai.ts                     # TranscribeProvider + IntentProvider + SpeakProvider
    anthropic.ts                  # IntentProvider
    elevenlabs.ts                 # TranscribeProvider + SpeakProvider
    ollama.ts                     # IntentProvider (wraps existing voice-core fetch)

  auditLog.ts                     # Writer for voice-audit.jsonl
  debugBuffer.ts                  # voiceSubsystemDebugBuffer ring (100 entries)
  upgradeNotice.ts                # One-time upgrade toast trigger (§7.5.1)

ide/src/lib/components/voice/
  VoiceInput.svelte               # Reusable mic-augmented input (5.8)
  PushToTalkOverlay.svelte        # (existing, lazy-loaded only when enabled=true)

ide/src/routes/api/config/voice/
  +server.ts                      # NEW: GET/PUT voice.json
  audit/+server.ts                # NEW: GET last N rows of voice-audit.jsonl

ide/src/routes/api/voice/
  transcribe/+server.ts           # NEW: POST { audio, providerId, opts }
  intent/+server.ts               # NEW: POST { transcript, context, schema, providerId }
  providers/+server.ts            # NEW: GET → capability probe for /setup + /config
  test/+server.ts                 # NEW: POST → canned round-trip
  capture/+server.ts              # EXISTING: kept as thin voxtype-only alias for back-compat
  interpret/+server.ts            # EXISTING (Siri): refactored to call voice.classify()
```

### 7.2 Server-side endpoints

New endpoints; all enforce the privacy model server-side as a safety net.

#### `GET /api/config/voice`

Reads `~/.config/jat/voice.json` and returns the parsed JSON. If the file does not exist, writes a fresh `enabled=false` default file (§7.5.1) and returns its contents. Mirrors the `/api/config/defaults` pattern.

#### `PUT /api/config/voice`

Accepts the full `voice.json` payload. Validates schema (unknown top-level keys are rejected). Writes atomically (write to temp file + `rename`). Returns the persisted document.

#### `GET /api/config/voice/audit?limit=50`

Reads the last N rows of `~/.config/jat/voice-audit.jsonl`, parses them, and returns an array. Used by `/config/voice` → Diagnostics → "Recent cloud calls". Server handles rotation-file enumeration transparently (if the current file has fewer than N rows, it walks into `.jsonl.1`, `.2`, `.3`).

#### `POST /api/voice/transcribe`

```ts
// Request
{
  audio: Blob;           // multipart/form-data
  providerId?: string;   // default: activeSttId
  language?: string;
  diarize?: boolean;
  prompt?: string;
}

// Response
TranscribeResult  // see 5.1
```

Server validates `providerId` against the privacy toggles before dispatching. Cloud provider + off-device audio OFF → 403 with `{ error: 'offline_policy' }`. Cloud calls append to `voice-audit.jsonl` on completion (success or failure).

#### `POST /api/voice/intent`

```ts
// Request
{
  transcript: string;
  context: string;
  schema: object;
  providerId?: string;   // default: activeLlmId
  system?: string;
  model?: string;
}

// Response
IntentResult  // see 5.1
```

#### `GET /api/voice/providers`

Returns capability probe for each provider — used by `/setup` wizard and `/config/voice`.

```ts
{
  stt: Array<{ id, name, isLocal, available: boolean, reason?: string, capabilities }>;
  llm: Array<{ id, name, isLocal, available: boolean, reason?: string }>;
  speak: Array<{ id, name, isLocal, available: boolean, reason?: string }>;
}
```

Probe timeout: 2s per provider, run in parallel.

#### `POST /api/voice/test`

Canned round-trip test — used by Diagnostics and `/setup`.

```ts
// Request
{ operation: 'stt' | 'llm' | 'speak'; providerId?: string }

// Response
{ ok: boolean; latencyMs: number; result?: unknown; error?: string }
```

### 7.3 Refactor plan for existing files

1. **`voiceCapture.svelte.ts`** — replace
   ```ts
   const res = await fetch('/api/voice/capture', { body: formData });
   const { transcript } = await res.json();
   ```
   with
   ```ts
   const result = await voice.transcribe(blob);
   const transcript = result.transcript;
   ```
   Everything else (matcher call, dispatch) unchanged. The handler is only installed when `voice.enabled === true`.

2. **`voice-core.js`** — break into two layers:
   - Transcription path (`transcribeAudio`, `transcribeWhisperx`) becomes the `voxtype` / `whisperx` provider implementations in `providers/`.
   - Extraction path (`extractTitleAndSummary`, `extractTasks`) becomes an `ollama` provider usage — the **prompt templates stay in voice-core** because they're voice-inbox-specific, but they call `voice.classify()` instead of `fetch('http://localhost:11434/api/generate')`.
   - Publishing routes (`/api/tasks/voice`, `/api/voice/kb`, `/api/voice/summary`, `/api/voice/diarize`) get small wrapper updates — they now call `voice.transcribe()` + `voice.classify()` instead of voice-core's private helpers. These routes ignore `voice.enabled` — they're server-side ingest, not browser voice.

3. **`/api/voice/capture/+server.ts`** — kept as a thin alias that forwards to `/api/voice/transcribe` with `providerId: 'voxtype'`. Deletable once all callers migrate (tracked as Phase 3 cleanup).

4. **jat-107ll matcher stack** — **no change**. The matcher takes strings, not audio. With `voice.enabled=false` the matcher simply never receives input, which is the correct behavior.

### 7.4 Provider implementation notes

Each provider file exports a default `TranscribeProvider` / `IntentProvider` / `SpeakProvider` object. The `isAvailable()` probe is cheap:

- **voxtype**: `which voxtype` — cached for 60s.
- **whisperx**: same, plus GPU detection (optional).
- **ollama**: `GET http://localhost:11434/api/tags` with 500ms timeout.
- **openai**: `jat-secret openai` present? (no network call — actually hitting OpenAI just to probe would be wasteful).
- **anthropic**: `jat-secret anthropic` present?
- **elevenlabs**: `jat-secret elevenlabs` present?

On `isAvailable() === false`, the provider is filtered out of the picker but still listed with a `reason` so the user can see what's missing.

**Probes only run when `voice.enabled === true`.** A disabled subsystem never pokes at voxtype, ollama, the filesystem for API keys, or any network endpoint.

### 7.5 Disabled-state guarantees

**Design invariant:** when `voice.enabled === false`, voice costs nothing. This is load-bearing for the quaternary persona (users who don't care about voice) and must be preserved as the subsystem evolves.

When `enabled === false`, the following **must not happen**:

| Side effect | Guarantee |
|---|---|
| Microphone permission prompt | **Never shown.** No `getUserMedia()` call. |
| `navigator.mediaDevices.enumerateDevices()` | **Never called.** No audio device listing. |
| `document.addEventListener('keydown')` for Ctrl+Space | **Never registered.** No global hotkey handler. |
| `/api/voice/providers` probe | **Never fired.** |
| `which voxtype`, `GET localhost:11434/api/tags` | **Never run.** No filesystem or network probes. |
| `PushToTalkOverlay.svelte` in the client bundle | **Never loaded.** Lazy-imported via `const { default: Overlay } = await import('./PushToTalkOverlay.svelte')` from within `voice.init()`, guarded by the `enabled` flag. |
| `<VoiceInput>` mic button DOM | **Never rendered.** Component renders the fallback plain input. |
| Audit log file | **Never created.** `voice-audit.jsonl` only appears once the user makes their first cloud call. |
| `jat-secret` vault reads | **Never performed.** No API key lookups. |
| `document.visibilitychange` cross-tab sync listener | **Never installed.** |

In practice this means `voice.init()` has two branches: the one-line disabled path (`if (!config.enabled) { status = 'offline'; return; }`) and the full setup path. The disabled path should measurably take under 5ms on first mount.

#### 7.5.1 Upgrade behavior

**Clean break, force opt-in.** On first `voice.init()` after the subsystem lands — regardless of whether the user had push-to-talk working on pre-subsystem master — we do not detect prior voxtype or ollama installations and we do not preserve any implied "voice was working" state.

Rule: on first init, if `~/.config/jat/voice.json` does not exist, write the file with `{ "enabled": false, ...defaults }`. No exceptions. This is the same path a fresh install takes.

**Rationale:** one code path, zero ambiguity, no "did my voice auto-enable or not?" surprises. Every user — new or upgrading — must explicitly opt in via `/config/voice` or the `/setup` wizard.

**Tradeoff (intentional):** upgrading users who had push-to-talk working on master will find it silently disabled on next startup until they turn it on at `/config/voice`. We accept this in exchange for a single, predictable initialization contract.

**Nuclear reset:** deleting `~/.config/jat/voice.json` manually re-triggers the same first-run path — a fresh `enabled=false` file is written. No auto-enable, ever.

#### 7.5.2 One-time upgrade notification

Because prior push-to-talk users will find voice silently disabled, the IDE shows a single non-blocking notification on first load after the subsystem ships — but **only to users who were actually using voice before**.

**Trigger signal:** presence of `localStorage['voice-hotkey']` (the pre-subsystem push-to-talk hotkey preference, set by jat-kpfmx) at the moment of first post-upgrade layout mount. Fresh users — who never opened the old push-to-talk flow — have no such key and see no toast.

**Toast content:** DaisyUI `alert-info` style, anchored top-right, auto-dismiss after 10s, and with a manual × to dismiss early:

> **Voice features moved to a configurable subsystem. Enable at Settings → Voice.**

The alert body includes a single link ("Go to Settings → Voice") that navigates to `/config/voice`.

**Shown at most once per browser.** On dismiss (manual or auto), set `localStorage['voice-upgrade-toast-seen'] = '1'`. Subsequent loads check this flag and skip.

**Where it fires:** `+layout.svelte` `onMount()`, guarded behind both the signal check (`localStorage['voice-hotkey']` present) and the seen flag (`localStorage['voice-upgrade-toast-seen']` absent). It does not depend on `voice.enabled` or any provider probe — it's pure client-side localStorage inspection, zero cost on the quaternary persona path.

Release notes accompanying the subsystem ship call out the opt-in change explicitly as a complement to the in-app toast.

---

## 8. Telemetry

### 8.1 Debug buffer

**File:** `ide/src/lib/voice/debugBuffer.ts` — ring, N=100, exposed as `window.__jatVoiceSubsystem`.

```ts
interface VoiceDebugEntry {
  ts: number;                           // unix ms
  iso: string;
  op: 'transcribe' | 'classify' | 'speak' | 'probe' | 'test';
  providerId: string;
  latencyMs: number;
  ok: boolean;
  errorClass?: string;                  // e.g. 'network', 'schema', 'timeout', 'no_key'
  bytesIn?: number;                     // request size
  bytesOut?: number;                    // response size
}
```

Complements the existing `window.__jatVoiceDebug` (fast-match only, from jat-107ll) and the Siri-specific `window.__jatVoiceInterpretDebug`. Only populated when `voice.enabled === true`.

### 8.2 Audit log

Separate from the debug buffer — audit log is user-facing and persistent, debug buffer is dev-facing and ephemeral. See §5.4.1 for the full spec and rationale.

### 8.3 Metrics dashboard

Rendered in `/config/voice` → Diagnostics → "Metrics" accordion. For the last 50 calls per provider, show:

- p50 / p95 latency
- Success rate (ok=true ratio)
- Total calls
- Last call timestamp

Pure client-side aggregation over the debug buffer. No server telemetry in v1.

---

## 9. Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| API key leakage through logs or audit buffer | Low | High | Audit log records bytes + ok only, never request body; debug buffer caps raw response at 4KB and never includes API keys; all cloud calls go through the server (keys never reach the browser) |
| Cloud provider outage | Medium | Medium | Fall-through order: active → other local → other cloud → fail; user sees one-line advisory, not a crash |
| Local provider not installed | High on fresh install | Low | Default to `enabled=false`; `/setup` wizard detects and gives install hint; UI hides voice buttons when `capabilities.stt === false` |
| User enables subsystem before installing voxtype/ollama → stuck in an un-usable state | Medium | Medium | **Enable button is gated on probe result.** At least one STT provider must probe available. A Recheck button re-probes on demand. Wizard's "Enable voice subsystem" CTA is disabled with copy "Install a transcription provider first" until a provider is detected. |
| User bypasses privacy toggle via debug tool | Low | Medium | Server-side enforcement: `/api/voice/transcribe` rejects cloud providerId when `offDeviceAudio === false` based on server-known state |
| Capability drift between providers (e.g. diarize only on whisperx / ElevenLabs) | High | Low | `capabilities` field on every provider; UI reads `voice.capabilities.diarize` and gates the toggle |
| Microphone device disappears mid-recording (USB unplug) | Medium | Low | MediaRecorder emits `error` event; subsystem catches, reports "Microphone disconnected", does not retry |
| Audio format unsupported by remote STT | Low | Medium | voiceCapture emits webm/opus; OpenAI and ElevenLabs both accept it; add a server-side ffmpeg transcode path as a fallback if a new provider doesn't |
| `ollama pull gemma3:4b` fails mid-setup | Medium | Low | Wizard shows progress + error; user can skip voice entirely |
| Surprise charges on cloud STT/LLM | Medium | Medium | Audit log shows every cloud call; `/config/voice` includes a "Cloud usage today" summary (Phase 2); user can flip master toggle OFF to hard-stop |
| Cross-origin TTS audio playback blocked | Low | Low | Audio blobs are returned to server, streamed to client as same-origin blob URLs — no cross-origin issue |
| User changes provider mid-session while a request is in flight | Medium | Low | In-flight request completes on the old provider; next request uses the new one; no interruption |
| Prompt injection via task titles / descriptions into LLM classify calls | Low (local-only for voice-inbox; cloud opt-in) | Medium | Prompt templates separate user text from system instructions; revisit when multi-user JST hits cloud providers |
| Upgrading user's push-to-talk silently stops working | High on upgrade | Low | One-time upgrade toast linking to `/config/voice` (see §7.5.2), triggered by `localStorage['voice-hotkey']` presence; release notes call out the opt-in change |
| `voice.json` syncs via Dropbox/iCloud to a second machine with different hardware | Low | Medium | Explicitly **not supported.** Documented in non-goals. Second machine should have its own `voice.json`. If users sync `~/.config/jat/` across machines, they accept their own risk. |

---

## 10. Open questions

The remaining open questions after the 2026-04-21 architectural decisions.

1. **ElevenLabs Scribe as the recommended local-replacement when voxtype is absent?** Scribe is currently the most accurate STT in any space. For online users without voxtype installed, recommending "add an ElevenLabs key" might be higher-value than "go install voxtype". But it reverses the local-first default. Needs a call.

2. **Where do provider-specific settings live?** `/config/voice` → Advanced has a model override, but per-provider concerns (OpenAI org ID, Anthropic beta headers, ElevenLabs voice selection) will accumulate. Do we allow provider-specific panels, or keep it flat via `providerOverrides` in `voice.json`?

3. **Streaming transcription.** Cloud providers support streaming STT (OpenAI `whisper-1` does not, but ElevenLabs real-time does). Worth supporting in the interface now, or add in Phase 3 when TaskDetailDrawer dictation returns?

4. **Do we pre-pull ollama models on install?** First-time latency is painful. Bundling a pull into `jat` startup (one-time, ~1.5GB for gemma3:4b) accelerates onboarding but surprises users on metered connections. **Lean:** wizard step offers it with a checkbox, default off.

**Resolved in this revision:**

- ~~Project-scoped vs global provider selection.~~ **Resolved:** global (user-level). §5.0.
- ~~Subsystem optional at install time?~~ **Resolved:** yes, opt-out by default. §3 goal 8, §7.5.
- ~~Audit log retention: localStorage vs SQLite?~~ **Resolved:** user-level JSONL on disk. §5.4.1.

---

## 11. Phased rollout

### Phase 1 — Foundation (lowest risk)

**Deliverables:**
- `types.ts` — all three interfaces
- `voice.json` schema + `GET/PUT /api/config/voice`
- First-run `enabled=false` default writer (§7.5.1)
- One-time upgrade toast (§7.5.2), gated on `localStorage['voice-hotkey']` signal
- `providers/voxtype.ts` — wraps existing shell-out
- `providers/ollama.ts` — wraps existing voice-core fetch
- `voiceSubsystem.svelte.ts` — store with `enabled` flag, probe, test, active selection
- `GET /api/voice/providers` (probe endpoint)
- `POST /api/voice/transcribe` (voxtype only)
- `POST /api/voice/intent` (ollama only)
- `/config/voice` — both disabled and enabled states (§5.7)
- `/setup` wizard step (skippable, with Enable CTA)
- Migrate `voiceCapture.svelte.ts` from `/api/voice/capture` to `voice.transcribe()`, gated on `voice.enabled`
- `auditLog.ts` (write-only, JSONL) + `debugBuffer.ts`
- `GET /api/config/voice/audit`

**Explicit exclusions:** no cloud providers, no `<VoiceInput>`, no TTS.

**Success gate:** fresh install boots with `voice.enabled=false` and zero voice-side-effects; **every upgrading user — including those who had push-to-talk working pre-subsystem — also boots with `voice.enabled=false` (clean-break, no auto-detect)**; upgrading users with prior push-to-talk usage see the one-time toast exactly once; push-to-talk latency unchanged within 5% of today's numbers once the user re-enables; voice-inbox still works (server-side, unaffected).

### Phase 2 — Cloud providers + `<VoiceInput>`

**Deliverables:**
- `providers/openai.ts` — STT + LLM
- `providers/anthropic.ts` — LLM only
- `providers/elevenlabs.ts` — STT only
- Credentials integration — provider picker greys out when key missing, links to `/config` → API Keys
- Sub-toggles for off-device audio / text
- `<VoiceInput>` component + retrofit into TaskCreationDrawer, TaskDetailDrawer
- Audit log UI in `/config/voice` → Diagnostics (reading from `voice-audit.jsonl`)

**Success gate:** jw can flip off-device audio ON, use OpenAI Whisper for one utterance, flip it OFF, next utterance uses voxtype — without a reload. Disabling the subsystem from `/config/voice` produces all the zero-cost guarantees in §7.5.

### Phase 3 — Polish, TTS, voice-core refactor

**Deliverables:**
- `providers/*.ts` speak implementations (ElevenLabs + OpenAI TTS)
- Retrofit `<VoiceInput>` into GlobalSearch, InboxCompose
- `voice-core.js` refactor — transcription/extraction move behind subsystem
- Deprecate `/api/voice/capture` (keep alias for 1 release, then remove)
- Metrics dashboard in `/config/voice` → Diagnostics → Metrics
- Audit log rotation (10MB / 30 days)

---

## 12. Success criteria

Hard checks before declaring done:

- [ ] `voice.init()` completes in **<5ms** when `enabled === false` (measured: no probes, no listeners, no dynamic imports).
- [ ] `voice.init()` completes in <500ms with local-only providers available and `enabled === true`.
- [ ] Fresh install results in `voice.json` with `enabled=false`.
- [ ] **Clean break verified:** no upgraded user has voice auto-enabled; first-init writes `enabled=false` unconditionally, regardless of whether voxtype or ollama is installed.
- [ ] One-time upgrade toast appears exactly once per browser for users with prior push-to-talk usage signal (`localStorage['voice-hotkey']` present), and never for fresh users.
- [ ] Switching STT or LLM provider in `/config/voice` takes effect without page reload; next push-to-talk uses the new provider; `voice.json` is updated on disk.
- [ ] Push-to-talk shortcut latency (release → action dispatch) within 5% of pre-subsystem numbers (p50 400ms baseline) when enabled.
- [ ] Voice-inbox pipeline (jat-1tjil iOS Shortcuts ingest) works end-to-end after `voice-core.js` refactor — zero regression on transcribed task creation, irrespective of `voice.enabled`.
- [ ] jw can flip off-device audio ON, use OpenAI Whisper for a command, flip it OFF, and the next command uses voxtype — without losing the session or refreshing.
- [ ] Every cloud call appends a line to `~/.config/jat/voice-audit.jsonl` within 200ms of completion.
- [ ] `tail -f ~/.config/jat/voice-audit.jsonl` shows live cloud calls from the terminal.
- [ ] `window.__jatVoiceSubsystem` ring buffer has 100 entries populated with every required field after 100 mixed-provider calls.
- [ ] `/setup` wizard can be skipped entirely (voice stays disabled, no settings changed) without error.
- [ ] `/setup` wizard "Enable voice subsystem" button is disabled when no STT provider is available; Recheck re-probes on demand.
- [ ] With `voice.enabled === false`, no `keydown` listener is installed (verified via `getEventListeners(document)` in devtools) and `PushToTalkOverlay.svelte` is not present in the client bundle (verified via network tab or bundle analysis).
- [ ] With `capabilities.stt === false` while enabled, the push-to-talk keybinding is inert (no overlay, no error toast).
- [ ] Disabling the subsystem from `/config/voice` removes the hotkey handler and `<VoiceInput>` mic buttons without a page reload.
- [ ] Removing a provider's API key and reloading `/config/voice` moves it from "available" to "needs key" without a reload of other settings.
- [ ] Provider fall-through: forcing OpenAI to fail (disconnect network) falls through to voxtype and surfaces the advisory badge.
- [ ] Deleting `~/.config/jat/voice.json` re-writes an `enabled=false` default file (no auto-enable from detected providers).
- [ ] Postgres-backed project (`meadow`) and SQLite-backed project (`jat`) both write to the same `~/.config/jat/voice-audit.jsonl` file.

---

## 13. User stories

All stories are testable. Acceptance criteria numbered so QA can check off.

### Subsystem lifecycle

**US-001 — First boot with local-only providers**
As a fresh JAT user with voxtype and ollama installed, I want the wizard to detect my providers so I can enable voice in one click.
Acceptance:
1. On first `+layout.svelte` mount, `voice.init()` fires
2. `voice.json` does not exist initially
3. `voice.json` is written with `enabled=false` and sensible defaults (no auto-detect, no auto-enable)
4. When the user opens `/setup`, the voice step probes and finds voxtype + ollama available
5. "Enable voice subsystem" CTA is enabled and one click flips `enabled=true`, `activeStt='voxtype'`, `activeLlm='ollama'`
6. After enable, push-to-talk button is active
7. No surprise prompts or modals appear before the user reaches the wizard

**US-002 — First boot with no local providers — opt-out default**
As a user without voxtype or ollama installed, I want voice to stay dormant and invisible until I explicitly opt in.
Acceptance:
1. On first `+layout.svelte` mount, `voice.init()` fires
2. `voice.json` is written with `enabled=false` and sensible defaults
3. `voice.capabilities.stt === false`, `voice.capabilities.llm === false`
4. `status === 'offline'`
5. Push-to-talk button does not render
6. `<VoiceInput>` components render as plain text inputs without mic icon
7. No mic permission prompt is shown
8. No keydown listener is installed (verified via `getEventListeners(document)`)
9. `/setup` wizard voice step is reachable and explains how to install/enable

**US-003 — Subsystem status reflects reality**
As jw, I can check `voice.status` to know if voice features will work.
Acceptance:
1. `enabled === false` → `status === 'offline'`
2. All providers up, enabled → `status === 'ready'`
3. One provider unavailable but STT + LLM both have at least one available, enabled → `status === 'degraded'`
4. No STT or no LLM available, enabled → `status === 'offline'`
5. UI chrome (e.g., a small dot in the status bar) reflects the status

**US-031 — Upgrading user finds voice disabled and opts in via toast**
As an existing master-branch user who had Ctrl+Space push-to-talk working, I want a clear one-time prompt pointing me to the new settings so I can re-enable voice in three clicks or fewer.
Acceptance:
1. Before upgrade: Ctrl+Space worked, `localStorage['voice-hotkey']` is set from the pre-subsystem flow
2. After upgrade, first IDE boot: `voice.json` is written with `enabled=false` (no auto-detect)
3. Ctrl+Space does nothing voice-related on this first boot
4. A non-blocking toast appears ("Voice features moved to a configurable subsystem. Enable at Settings → Voice.") with auto-dismiss 10s and a manual ×
5. The toast contains a link that navigates to `/config/voice`
6. On `/config/voice`, the user sees the disabled state and, with voxtype present, can click "Enable voice subsystem" to flip `enabled=true`
7. Total clicks from first boot to working Ctrl+Space: ≤ 3 (toast link → Enable button → Ctrl+Space)
8. The toast is shown at most once per browser

**US-031a — Fresh user does NOT see the upgrade toast**
As a brand-new JAT user who never used the pre-subsystem push-to-talk flow, the upgrade toast must not appear.
Acceptance:
1. Fresh install, `localStorage` is empty of any voice-related keys
2. First `+layout.svelte` mount runs the toast-trigger check
3. `localStorage['voice-hotkey']` is absent → toast is not shown
4. No "voice upgrade" notification appears on any subsequent load
5. The user's only path to voice config is through `/setup` or by navigating to `/config/voice` directly

**US-032 — Fresh install defaults to disabled**
As a user who doesn't care about voice, a fresh JAT install does not touch my mic, does not prompt me, and does not cost me anything in the bundle.
Acceptance:
1. Fresh install, first IDE boot
2. `voice.json` is written with `enabled=false`
3. No mic permission dialog
4. No keydown listeners installed (verified in devtools)
5. `PushToTalkOverlay.svelte` is not present in the network tab / not dynamic-imported
6. `<VoiceInput>` usages render as plain inputs
7. `/config/voice` shows the disabled state (§5.7.1) only
8. No upgrade toast appears (no `localStorage['voice-hotkey']` to trigger it)

**US-033 — Disable subsystem after using it**
As a user who tried voice for a week and decided against it, I can disable the whole subsystem and it genuinely goes away.
Acceptance:
1. Starting state: `enabled=true`, using voice daily
2. Open `/config/voice`, click master switch "Disable"
3. Confirmation modal lists what disable will do
4. Click confirm
5. `voice.json` written with `enabled=false` (other fields preserved)
6. Ctrl+Space hotkey unregisters immediately (next press does nothing)
7. `<VoiceInput>` mic buttons disappear across the IDE without reload
8. `voice.capabilities.stt === false` and `.llm === false`
9. `/config/voice` renders the disabled state
10. Re-enabling preserves previous activeStt / activeLlm / privacy settings

**US-034 — Cross-device config is not synced**
As a user running JAT on two machines, each machine has its own `voice.json`.
Acceptance:
1. Machine A: `enabled=true, activeStt=openai`
2. Machine B: fresh install, no shared config
3. Machine B's voice.json is independent (default `enabled=false`)
4. Changes on A don't propagate to B
5. This limitation is documented in `/config/voice` footer and in non-goals

**US-035 — Delete voice.json as nuclear reset**
As a user, deleting `~/.config/jat/voice.json` resets voice to a clean first-run state.
Acceptance:
1. Starting state: `voice.json` exists with custom settings
2. `rm ~/.config/jat/voice.json` (from terminal)
3. Reload IDE
4. `voice.init()` detects missing file, writes a fresh `enabled=false` defaults file
5. Voice is off; user must opt in again via `/config/voice` or `/setup`
6. No crash, no error toast
7. `/config/voice` footer link ("Delete voice.json — nuclear reset") offers a one-click version of this flow

### Provider management

**US-004 — Switch STT provider**
As jw, I can change the active STT provider in `/config/voice` and the next utterance uses the new provider.
Acceptance:
1. `/config/voice` shows radio group of available STT providers (enabled state only)
2. Selecting a different option updates `voice.activeSttId` immediately
3. `voice.json` is written via `PUT /api/config/voice`
4. Next push-to-talk round-trip writes a debug entry with the new `providerId`
5. No page reload required

**US-005 — Switch LLM provider**
Same as US-004 for `activeLlmId`.

**US-006 — Provider shows as unavailable when key missing**
As a user, if I select OpenAI without adding a key, the UI tells me clearly and links to credentials.
Acceptance:
1. OpenAI option in `/config/voice` shows greyed with "needs key" badge
2. Clicking it opens a tooltip: "Add OpenAI key →"
3. Link goes to `/config` → API Keys tab
4. After adding the key, returning to `/config/voice` re-enables the option

**US-007 — Provider probe on demand**
As jw, I can force a re-probe of all providers from `/config/voice`.
Acceptance:
1. "Refresh providers" button in Diagnostics (enabled state)
2. Click fires `GET /api/voice/providers`
3. Results update the store
4. Any newly-installed providers (e.g., just started ollama) appear as available

**US-036 — Enable button is gated on probe result**
As a user attempting to enable voice without any STT provider installed, I can't accidentally lock myself into a broken state.
Acceptance:
1. `/config/voice` in disabled state, no STT provider detected
2. "Enable voice subsystem" button is disabled (greyed)
3. Copy reads: "Install a transcription provider (voxtype or add an OpenAI key) then recheck."
4. "Recheck" button re-probes providers
5. After install + recheck, button becomes enabled
6. Clicking enable writes `voice.json` with `enabled=true`

### Privacy and audit

**US-008 — Off-device audio default OFF**
As a privacy-sensitive user, I want cloud audio processing disabled out of the box.
Acceptance:
1. Fresh voice.json: `privacy.offDeviceAudio === false`
2. Cloud STT providers show as greyed even if API keys exist
3. Attempting to select a cloud STT → nudge appears ("Enable off-device audio below")

**US-009 — First-time cloud confirmation**
As a user enabling off-device audio for the first time, I see exactly what will leave my device before committing.
Acceptance:
1. Flipping master toggle ON the first time → one-time modal
2. Modal lists data types sent (audio / transcript / context)
3. [ Cancel ] reverts; [ I understand, enable ] commits
4. Modal does not appear on subsequent toggles

**US-010 — Revoke mid-session**
As jw, I can flip off-device audio OFF and the next utterance uses local.
Acceptance:
1. Active cloud STT + toggle ON, mid-recording
2. User flips toggle OFF
3. Current in-flight request completes on cloud
4. `activeSttId` auto-remaps to first available local provider
5. `voice.json` updated
6. Next press uses local, overlay shows "Using local" badge

**US-011 — Audit log captures every cloud call**
As a user, I can see exactly what audio/text left my device, persistently, without opening the IDE.
Acceptance:
1. Every cloud call appends a JSONL line to `~/.config/jat/voice-audit.jsonl`
2. Line contains: ts (ISO-8601), provider, op, bytes, latencyMs, model, ok
3. Line is appended within 200ms of call completion
4. File is created on first cloud call (not preemptively)
5. `/config/voice` → Diagnostics → "Recent cloud calls" shows last 50 rows, read server-side

**US-037 — Tail the audit log from the terminal**
As a developer debugging a cloud provider issue, I can `tail -f ~/.config/jat/voice-audit.jsonl` and watch calls happen live.
Acceptance:
1. Open a terminal, run `tail -f ~/.config/jat/voice-audit.jsonl`
2. Hold Ctrl+Space in the IDE, speak an utterance routed through a cloud provider
3. A new JSONL line appears in the terminal within 200ms of call completion
4. The line is valid JSON (pipeable to `jq`)

**US-038 — Audit log rotation**
As a heavy voice user, my audit log doesn't grow unbounded.
Acceptance:
1. Write sufficient entries to push file past 10 MB
2. On next write, current file is renamed to `.1`, new file begins
3. Existing `.1` → `.2`, `.2` → `.3`, old `.3` deleted
4. Alternatively, after 30 days, same rotation fires on first write past day 30
5. `/config/voice` → Diagnostics only displays rows from the current file; rotated files are untouched and readable via terminal

**US-039 — Postgres-backed projects share the same audit log**
As a user working on both `meadow` (postgres backend) and `jat` (SQLite backend), voice calls from either project land in the same user-level audit log.
Acceptance:
1. Work on meadow, make a cloud STT call → appears in `~/.config/jat/voice-audit.jsonl`
2. Switch to jat, make a cloud LLM call → appears in the same file
3. No per-project audit files are created
4. The `/config/voice` UI does not filter by project — it's user-global

**US-012 — Server-side privacy enforcement**
As a paranoid user, I want the server to refuse cloud requests when the toggle is off, not trust the client.
Acceptance:
1. `POST /api/voice/transcribe` with cloud providerId when server-side `voice.json` has `privacy.offDeviceAudio === false` → 403 + `{ error: 'offline_policy' }`
2. Client logs the error, falls back to local
3. No audio is sent to any external endpoint

### `<VoiceInput>` usage

**US-013 — Drop-in voice for a text field when enabled**
As a developer, I can add voice to any text field with one component.
Acceptance:
1. `<VoiceInput bind:value={x} />` renders input with mic button (when `voice.enabled && capabilities.stt`)
2. Mic click records audio, transcribes, fills `x`
3. No props required beyond `bind:value`
4. Respects `voice.capabilities.stt` — hides mic when false

**US-040 — `<VoiceInput>` is a zero-cost plain input when disabled**
As a developer, I can use `<VoiceInput>` everywhere without worrying about users who have voice off.
Acceptance:
1. `voice.enabled === false`
2. `<VoiceInput bind:value={x} />` renders as a plain `<input>` / `<textarea>`
3. No mic button appears
4. No audio permission is requested when the element mounts or gains focus
5. `bind:value` works normally for keyboard input
6. Layout dimensions match the enabled-state input (no reflow when toggled)

**US-014 — Polish transcript for titles**
As jw, when I dictate a task title, I want capitalization and punctuation cleaned up.
Acceptance:
1. `polish={true}` triggers a classify call after transcription
2. System prompt: "Fix punctuation and capitalization. Return only the cleaned text."
3. Result is used instead of raw transcript
4. If polish fails, falls back to raw transcript (don't block)

**US-015 — Auto-submit on transcription**
As jw, dictating a search query, I want results to load without pressing Enter.
Acceptance:
1. `autoSubmit={true}` fires a `submit` event after value is set
2. Parent can listen: `on:submit={handleSearch}`
3. On failure (transcription error), no submit fires

### Diagnostics

**US-016 — Test microphone**
As jw, I can verify my mic works from `/config/voice`.
Acceptance:
1. "Test microphone" button requests permission, shows 3-second waveform
2. Green indicator when audio signal detected
3. Device dropdown reflects the device used

**US-017 — Test STT round-trip**
As jw, I can verify transcription works end-to-end.
Acceptance:
1. "Test STT" button records 2s
2. Shows transcript + active provider + latency
3. Failure shows error class (timeout / network / no_key)

**US-018 — Test LLM round-trip**
As jw, I can verify intent classification works end-to-end.
Acceptance:
1. "Test LLM" button sends a canned classify call
2. Shows parsed result + provider + latency
3. Displays `schemaValid` boolean

**US-019 — Metrics dashboard**
As jw, I can see my voice performance at a glance.
Acceptance:
1. Diagnostics → Metrics shows per-provider p50 / p95 / success rate over last 50 calls
2. Updates live as new calls complete
3. Per-provider "Clear metrics" button resets the ring

**US-020 — Debug buffer in console**
As a developer, I can inspect `window.__jatVoiceSubsystem` without auth.
Acceptance:
1. Ring buffer size = 100
2. Every entry has required fields
3. Accessible from browser devtools console
4. Cleared on page reload (not persisted — audit log is the persistent one)

**US-041 — Recent cloud calls panel reads from JSONL**
As a user, the Diagnostics panel shows my last 50 cloud calls by reading the on-disk audit log.
Acceptance:
1. `/config/voice` → Diagnostics → "Recent cloud calls" is expanded
2. Server-side `GET /api/config/voice/audit?limit=50` is called
3. Rows from current `voice-audit.jsonl` are displayed as a table
4. If the current file has fewer than 50 rows, the server reads into `.1`, `.2`, `.3` as needed
5. Each row shows: ts, provider, op, bytes, latencyMs, model, ok

### Migration-acceptance (existing features keep working)

**US-021 — Push-to-talk unchanged when enabled**
As jw, holding Ctrl+Space still works exactly like it did before the subsystem landed — provided voice is enabled.
Acceptance:
1. `voice.enabled === true`
2. Transcript → matcher → dispatch unchanged in behavior
3. Latency within 5% of pre-subsystem baseline
4. Fast-path matcher hits still skip the LLM
5. No regressions on jat-crmt6 user stories
6. Includes jat-kpfmx (Ctrl+Space whisper transcript) — behavior preserved verbatim once the user opts back in

**US-022 — Voice-inbox ingest unchanged regardless of enabled state**
As an iOS Shortcut user, my voice memos still become tasks — my browser's `voice.enabled` setting is irrelevant.
Acceptance:
1. `voice.enabled === false` in browser voice.json
2. iOS Shortcut posts audio to `/api/tasks/voice` → POST succeeds, task created
3. Title, summary, labels extract correctly
4. Diarization (if enabled) still tags speakers
5. Timeline append still happens
6. Voice-inbox endpoints bypass `voice.enabled` (server-side ingest is not a browser voice concern)

**US-023 — Old `/api/voice/capture` still responds**
As a legacy caller that hasn't migrated yet, I can still POST to the old endpoint.
Acceptance:
1. `/api/voice/capture` is kept as a thin alias to `/api/voice/transcribe` with `providerId: 'voxtype'`
2. Response shape unchanged (returns plain transcript string)
3. Deprecation warning in server logs on each call

### Setup wizard

**US-024 — Skip voice entirely**
As a user who doesn't care about voice, I can skip the wizard step with one click and voice stays disabled.
Acceptance:
1. "Voice (optional)" step has a Skip button in the header
2. Skip advances to the Review step
3. `voice.json` is written with `enabled=false` (defaults for the rest)
4. No settings are changed at runtime

**US-025 — Install ollama model from wizard**
As a user whose ollama is running without the model, I can pull the model from the wizard.
Acceptance:
1. Wizard detects ollama running, model missing
2. "Pull gemma3:4b now? (1.5GB)" button visible
3. Click streams progress
4. On completion, status flips to available without reload

**US-026 — Add cloud key from wizard**
As a user opting into cloud, I can add an OpenAI key from the wizard.
Acceptance:
1. Cloud providers panel has "Add OpenAI key →" link
2. Opens `/config` → API Keys tab in a new route (not a modal — preserves wizard state)
3. After adding + returning, the wizard re-probes and shows the key as present

### Edge cases

**US-027 — Mic unplugged mid-recording**
As a user, if my USB mic disconnects mid-capture, the system fails gracefully.
Acceptance:
1. MediaRecorder emits error → caught
2. Overlay shows "Microphone disconnected"
3. No retry, no crash
4. User can reconnect and try again

**US-028 — All cloud providers unreachable**
As a user with cloud-only providers selected and no internet, the system falls through to local.
Acceptance:
1. Cloud STT times out
2. Subsystem falls through in priority: active → other local → other cloud → fail
3. Overlay shows which provider ultimately served the request
4. If everything fails, clear error: "No voice provider available"

**US-029 — Provider timeout**
As jw, if my active STT takes more than 5 seconds, I get a timeout.
Acceptance:
1. Hard timeout configurable per operation (default 5s for STT)
2. On timeout: fall-through to next provider, not error
3. Audit entry logged with `errorClass: 'timeout'`

**US-030 — Two providers with same ID loaded**
As a developer, if a provider is accidentally registered twice, the system deduplicates.
Acceptance:
1. Registry keyed by `id`; duplicate ids replace earlier
2. Console warning on duplicate registration in dev mode
3. Active provider resolves to the latest registration
