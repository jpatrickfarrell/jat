# PRD: Voice Inbox Intelligence Upgrade

## Product overview

### Document title and version

**Voice Inbox Intelligence Upgrade** — v1.0
**Date:** 2026-04-24
**Author:** Joseph Winke

### Product summary

JAT's voice-to-task pipeline accepts iOS Voice Memo recordings, transcribes them via voxtype (whisper large-v3-turbo) or whisperx with diarization, then uses a local ollama model to extract tasks, a knowledge base, and a summary before depositing results in the voice inbox. The organize step currently runs blind: it sees the raw transcript and a flat project name/description list, nothing more. Tasks land as orphans with no epic affiliation, speakers remain as anonymous labels, knowledge base entries evaporate from agent context after the session, and the user gets no signal that processing completed until they open the IDE.

This document specifies four interconnected upgrades that together close those gaps: (1) injecting live JAT state — open epics, recent completions, in-progress tasks, and project member rosters — so ollama can make accurate linking decisions; (2) resolving diarized speaker labels to real names via the "I'm Joe" convention and known-member injection; (3) writing each voice session as a persistent memory file indexed by `jat-search` so agents and the `/search` route can find it; and (4) firing an ntfy.sh push notification to the user's iOS device when processing completes. All four features are implemented in a single codebase area (`voice-core.js` and its two route consumers), requiring no new infrastructure beyond an optional ntfy server already planned in task jat-if64a.

## Goals

### Business goals

- Reduce the manual effort of triaging voice-generated tasks by surfacing epic-linking suggestions at organization time rather than requiring a follow-up triage pass.
- Make voice notes a first-class knowledge source that agents consume automatically, reducing the need to re-brief agents on context already captured verbally.
- Close the feedback loop on voice processing so the user can confidently record and walk away, knowing they will be notified when tasks land.

### User goals

- Voice-created tasks link to the correct open epic at least 60% of the time without manual intervention, up from roughly 10% today.
- Speaker attribution in diarized recordings maps anonymous labels to real names when any speaker introduces themselves.
- Voice transcripts and knowledge base entries surface in `/search` queries about recent discussions so past decisions are discoverable.
- A push notification arrives on the user's iOS device within 30 seconds of tasks landing in the voice inbox, eliminating the need to poll the IDE.

### Non-goals

- Voice fingerprinting or biometric speaker identification — only the "I'm [name]" text convention is in scope.
- Real-time streaming transcription or partial results in the inbox.
- Voice synthesis or any form of the system talking back.
- Multi-user ntfy topics or per-topic access control — single-user only.
- Modifications to the voice-dismiss or voice-merge flows.
- Any changes to the iOS Shortcut, whisperx diarization parameters, or voxtype configuration.
- A UI for editing or deleting memory files from inside the IDE (covered separately by the `/memory` route).
- Automatic task creation from voice memory files (tasks are still only created by the organize step).

## User personas

### Key user types

There is one primary user for this tool: a solo developer and project manager who records voice notes throughout the day — during walks, between tasks, in the car — and wants them to become structured, routed work items without any follow-up triage session.

### Basic persona details

**Joe — Solo developer / project manager**
- Records 2–10 voice notes per day ranging from 30 seconds to 20 minutes.
- Manages 4–8 active projects simultaneously, each with open epics and in-progress work.
- Occasionally records multi-person meetings using the diarized endpoint, where participants introduce themselves at the start.
- Relies on `jat-search` and agent memory during coding sessions to recall decisions and context from past discussions.
- Checks the voice inbox on his desktop but wants to know immediately on his phone when a long recording has finished processing.

### Role-based access

This is a single-user, self-hosted system. All API routes already require the JAT IDE to be running locally and are not exposed publicly. No role differentiation is needed. The ntfy topic should be treated as a private channel (no authentication requirement is in scope, but the user may choose to add HTTP auth to their ntfy server independently).

## Functional requirements

The requirements below are grouped by feature and labeled with priority: P0 (must ship), P1 (should ship), P2 (nice to have).

### Feature 1: JAT state context injection

| ID | Priority | Requirement |
|----|----------|-------------|
| F1-01 | P0 | Add a `loadJatContext(projects)` function in `voice-core.js` that returns a structured object containing open epics, recent completions, in-progress tasks, and open task counts, keyed by project name. |
| F1-02 | P0 | `loadJatContext()` must fetch open epics using `jt list --status open --type epic --json` via `child_process.exec` with a 10-second timeout. Results are capped at 10 epics per project. |
| F1-03 | P0 | `loadJatContext()` must fetch recently closed tasks using `jt list --status closed --json` and filter client-side to tasks updated within the last 7 days. Results are capped at 20 per project. |
| F1-04 | P0 | `loadJatContext()` must fetch in-progress tasks using `jt list --status in_progress --json`. Results are capped at 20 per project. |
| F1-05 | P0 | Descriptions and titles injected into the ollama prompt must be truncated to 100 characters each to prevent context bloat. |
| F1-06 | P0 | The organize prompt in `organizeTranscript()` must include a new "JAT Context" section that lists open epics with IDs and titles, recent completions with titles, and in-progress task titles, formatted as a readable block before the project section. |
| F1-07 | P0 | The organize prompt must instruct ollama to add an optional `"epic_id"` field to each extracted task when the task clearly belongs to a listed open epic. |
| F1-08 | P0 | `loadJatContext()` must degrade gracefully: if `jt` is unavailable, times out, or returns an error, the function returns an empty context object and logs a warning via `vlog()`. The organize step must proceed normally with an empty context. |
| F1-09 | P1 | The `organizeTranscript()` function signature must accept an optional fourth argument `jatContext = {}` so the context object is passed in from the caller rather than fetched inside the function, keeping the function testable. |
| F1-10 | P1 | `loadJatContext()` is called once at the start of the background `transcribeAndOrganize()` function in both `voice/+server.js` and `voice-diarize/+server.js`, immediately after `loadProjects()`. |
| F1-11 | P1 | Add a `members` optional field to the per-project shape in `~/.config/jat/projects.json` supporting an array of `{ name, email }` objects. `loadProjects()` must pass this field through if present. |
| F1-12 | P2 | Log the number of epics, completions, and in-progress tasks injected for each project at `vlog()` level before calling ollama. |

### Feature 2: Speaker-to-user resolution

| ID | Priority | Requirement |
|----|----------|-------------|
| F2-01 | P0 | The `speakerInstructions` block inside `organizeTranscript()` must be extended to include a "Known team members" section injected when `jatContext` contains member data for any project that appears relevant to the transcript. |
| F2-02 | P0 | The known-members list injected into the prompt must use the format `Name (email)` for each member so ollama can populate both name and email fields in the `speakers` map. |
| F2-03 | P0 | The organize prompt must explicitly instruct ollama to look for the patterns "I'm [name]", "This is [name]", and "my name is [name]" as the primary signal for mapping speaker labels to known members. |
| F2-04 | P0 | The existing `speakers` schema line in the prompt (`"speakers": { "SPEAKER_00": null, ... }`) must be extended so ollama is told to output the matched name string (not email) as the value when a match is found, and `null` when no match is found. |
| F2-05 | P1 | The `appendToVoiceTimeline()` function already accepts and stores the `speakers` map. No change is needed there, but the calling code in both server routes must pass the `speakers` value returned by `organizeTranscript()`. Confirm both callers correctly pass `speakers` (currently the diarize route passes `null` hardcoded). |
| F2-06 | P1 | Document the "I'm [name]" convention in the voice inbox UI's tooltip or empty-state hint text in `VoiceInbox.svelte` so the user knows to use it. |
| F2-07 | P2 | When a speaker is matched to a known team member, tasks attributed to that speaker (via `context` field containing the speaker label) should include the matched name in the task description or a `requester` hint field. |

### Feature 3: Per-project memory files

| ID | Priority | Requirement |
|----|----------|-------------|
| F3-01 | P0 | Add a `writeVoiceMemoryFiles(organizeResult, projects, date)` function in `voice-core.js` that accepts the full organize result object and writes memory markdown files to `.jat/memory/`. |
| F3-02 | P0 | Memory files must be written in the format specified in the background section: YAML frontmatter block, then date/speakers/projects header, then summary section, then knowledge base entries section, then tasks created section. |
| F3-02a | P0 | Write the `summary` field verbatim — do not strip or reformat it. As of jat-b14ue, both `organize` and `summary` modes output markdown (`## Topic` headers + bullets). Markdown in the body improves FTS indexing since headers give jat-search clearer anchors. |
| F3-03 | P0 | YAML frontmatter must include `name`, `description`, and `type: project` fields. The `name` field must be `Voice note: {title}`. The `description` field must be the first 160 characters of the summary with markdown stripped for the frontmatter field (plain text only). |
| F3-04 | P0 | If tasks and KB entries span multiple projects, write one file per project. The file for project X includes only tasks and KB entries where `task.project === X` or `entry.project === X`. |
| F3-05 | P0 | Entries with no project attribution (missing `project` field) must be collected into a single `_general` section appended to the first project's file rather than creating a separate `_general` file, unless all entries are unattributed, in which case a single file with project `_general` is written. |
| F3-06 | P0 | File naming convention: `voice-{YYYY-MM-DD}-{project}-{slug}.md` where `slug` is the voice note title converted to kebab-case, truncated to 40 characters, with non-alphanumeric characters replaced by hyphens. |
| F3-07 | P0 | Files are always written to the `.jat/memory/` directory of the JAT project root (resolved via `process.cwd().replace(/\/ide$/, '')` — same pattern used by `getVoiceTimelineFile()`). This is correct for all voice sessions which run in the IDE process. |
| F3-08 | P1 | If the `projects.json` entry for a non-JAT project contains a valid `path` field and that project has a `.jat/memory/` directory, write that project's file to that project's memory directory in addition to the JAT memory directory. |
| F3-09 | P1 | `writeVoiceMemoryFiles()` must be called inside `appendToVoiceTimeline()` (after the timeline write succeeds) so it applies to all success paths — both the normal organize path and the organize-fallback path. Failure to write memory files must be caught and logged but must not prevent the timeline write from completing. |
| F3-10 | P1 | The tasks section in the memory file must list task IDs if they were created by the pipeline; for voice-inbox tasks (which are not immediately created in the DB but held in the inbox), list the titles with a `(pending)` note. |
| F3-11 | P2 | If a speaker map is present and non-null, include a `**Speakers:**` line in the file header using resolved names where available and `Unknown (SPEAKER_XX)` for unresolved labels. |

### Feature 4: ntfy.sh push notification

| ID | Priority | Requirement |
|----|----------|-------------|
| F4-01 | P0 | Add a `sendVoiceNotification(payload)` function in `voice-core.js` that fires a non-awaited `fetch()` POST to the ntfy URL with the given payload. |
| F4-02 | P0 | The ntfy URL must be read from `jat-secret ntfy-url` via `child_process.exec` on first call and cached in a module-level variable for the lifetime of the process. If the secret is not set or the command fails, `sendVoiceNotification()` is a silent no-op. |
| F4-03 | P0 | The function must never throw. All network errors, JSON serialization errors, and secret-lookup errors must be swallowed with a `vlog()` warning at most. |
| F4-04 | P0 | On success (tasks written to timeline), the notification payload must be: `title: "Voice Inbox"`, `message: "{N} task(s) from '{noteTitle}' · tap to review"`, `tags: ["microphone"]`, `priority: 3` (default, no sound). |
| F4-05 | P0 | On transcript-only completion (`appendTranscriptToVoiceTimeline()`), the notification payload must be: `title: "Voice Inbox"`, `message: "Transcript saved: '{noteTitle}'"`, `tags: ["memo"]`, `priority: 3`. |
| F4-06 | P0 | On failure (`appendFailedToVoiceTimeline()`), the notification payload must be: `title: "Voice Inbox"`, `message: "Processing failed: '{noteTitle}' — check the voice log"`, `tags: ["warning"]`, `priority: 3`. |
| F4-07 | P0 | `sendVoiceNotification()` must be called as the last statement inside `appendToVoiceTimeline()`, `appendTranscriptToVoiceTimeline()`, and `appendFailedToVoiceTimeline()` — after all file writes have completed. |
| F4-08 | P1 | The ntfy URL secret lookup must be done once at module load time (not per call) using a promise that resolves to the URL string or `null`. Subsequent calls to `sendVoiceNotification()` await this cached promise. |
| F4-09 | P1 | The ntfy POST body must be `application/json` with fields: `{ topic, title, message, tags, priority }` where `topic` is the final path segment of the ntfy URL. |
| F4-10 | P2 | Add an `ntfy-url` entry to the credentials editor in the IDE settings page (`/config`) as a custom key, so the user can set it via the UI without using the terminal. |

## User experience

### Entry points

The user interacts with this feature entirely through existing surfaces. Voice notes are recorded on iOS using the existing Shortcut and uploaded to `/api/tasks/voice` or `/api/tasks/voice-diarize`. The enriched output appears in the voice inbox (`/inbox`) just as before. New behavior surfaces at two additional touch points: a push notification on iOS when processing completes, and voice note content in `/search` results and agent context.

### Core experience

**Recording and upload (unchanged):** The user records a voice note on iOS. The Shortcut uploads the audio to the JAT IDE. The voice inbox shows a spinner card immediately.

**Background processing (enhanced):** While transcription and ollama run in the background, `loadJatContext()` fetches open epics, recent completions, and in-progress tasks for each project. This adds at most 2 seconds to the processing pipeline (the `jt list` calls are parallelized).

**Task organization (enhanced):** ollama receives a significantly richer prompt. It sees open epic titles and IDs and is instructed to add `epic_id` to tasks that belong to a listed epic. For diarized recordings, it also sees the known team member roster and is instructed to use the "I'm [name]" convention to resolve speaker labels.

**Voice inbox (unchanged display, enriched data):** Tasks appear in the inbox as before. Tasks with an `epic_id` in their metadata give the dismissal-and-creation flow a parent to attach to.

**Memory file written silently:** After the timeline write, one or more `.jat/memory/voice-YYYY-MM-DD-{project}-{slug}.md` files are written in the background. The user does not see this happen. The next time they run `/search` or an agent picks up a related task, the voice note content surfaces automatically.

**Push notification:** Within seconds of tasks landing in the inbox, the user's iOS device receives a badge notification from the ntfy app: "3 tasks from 'Tennis Building: Permit Planning' · tap to review". The notification uses default priority — no sound, badge only — so it is non-intrusive.

### Advanced features

**Epic linking via context injection:** When the user says "follow up on the tennis building permit", ollama can now see the open epic "Tennis Building: Permit and Foundation" (ID: tennis-abc) and return `"epic_id": "tennis-abc"` on the task. The downstream task creation code can use this to set the dependency.

**Speaker attribution for meetings:** A two-person meeting recording with the diarized endpoint, where one speaker says "I'm Joe, and this is Sarah from the client team", results in a `speakers` map of `{ "SPEAKER_00": "Joe", "SPEAKER_01": "Sarah" }`. Tasks attributed to SPEAKER_01 get "Sarah" in their context.

**Agent-accessible context:** An agent spawned to work on a task related to the tennis building project will find voice note memory files in `.jat/memory/` automatically surfaced through the `/jat:start` memory injection system, giving it context from past verbal discussions without any manual step.

### UI/UX highlights

- No new UI is introduced by this feature. All changes are backend-only except for the `VoiceInbox.svelte` tooltip addition (F2-06).
- The ntfy notification is non-intrusive: `priority: 3` in ntfy maps to default alert level (badge only, no sound by default in the iOS ntfy app).
- Memory file naming is deterministic and human-readable: opening `.jat/memory/` in a file browser is comprehensible without tooling.
- Processing latency increases are bounded: the `jt list` calls have a 10-second timeout each and run in parallel, adding at most 2–3 seconds to a pipeline that already takes 30–120 seconds for transcription.

## Narrative

Joe records a 12-minute voice note on his walk to the office, covering three topics: a permit follow-up for the tennis building project, a pricing decision for a concrete foundation, and a quick API bug he noticed in the JAT dashboard. When the Shortcut uploads the audio and the diarized endpoint begins processing, the voice inbox shows a spinner card as usual. Behind the scenes, `loadJatContext()` fetches the open epics for each of his projects and finds "Tennis Building: Permit and Foundation" (ID: tennis-3f2a) and "JAT: API Stability Sprint" (ID: jat-4c19). ollama receives all of this alongside the transcript and correctly links the permit follow-up task to tennis-3f2a and the API bug to jat-4c19, while extracting the concrete pricing as a knowledge base entry. Three minutes after he sits down at his desk, his phone lights up: "Voice Inbox: 4 tasks from 'Tennis Building and JAT API Discussion' · tap to review". He glances at it, sees the notification, and opens his laptop to review the inbox — everything is already routed and linked. A week later, when an agent picks up the "Price out concrete foundation" task, it automatically has the KB entry from that walk in its memory context, saving Joe from re-explaining the pricing discussion he had already captured.

## Success metrics

### User-centric metrics

- Epic link rate: tasks created via voice that have a non-null `epic_id` or are created as children of an existing epic, measured against total voice tasks. Target: 60% within 30 days of shipping (up from ~10% baseline).
- Speaker resolution rate: percentage of diarized recordings where at least one speaker label is resolved to a real name. Target: 80% of multi-person recordings where any speaker uses an introduction phrase.
- Search recall: voice-note KB entries appearing in `/search` results for relevant queries. Measured manually by spot-checking 5 searches per week against recent voice sessions.

### Business metrics

- Reduction in post-voice triage time: time spent manually re-linking voice tasks to epics. Target: reduce from ~5 minutes per note to under 1 minute.
- Memory file adoption: number of times agents surface voice memory context in their working sessions (visible via the `/jat:start` memory injection logs).

### Technical metrics

- Push notification latency: time from `appendToVoiceTimeline()` call to ntfy delivery on iOS. Target: under 30 seconds.
- Context injection overhead: additional wall-clock time added to the processing pipeline by `loadJatContext()`. Target: under 3 seconds (measured at the `vlog()` before/after the `jt list` calls).
- Memory file write success rate: percentage of successful organize runs that produce at least one memory file. Target: 100% (failures are logged but do not block the pipeline).
- No regressions: existing voice pipeline success rate must remain stable (measure failed organize runs before and after).

## Technical considerations

### Integration points

**`voice-core.js` (`ide/src/lib/server/voice-core.js`)** is the primary change surface. All four features are implemented here:

- `loadJatContext(projects)` — new export, sits alongside `loadProjects()`
- `organizeTranscript(transcript, projects, mode, jatContext)` — extended signature, extended prompt
- `writeVoiceMemoryFiles(result, jatContext, date)` — new internal function
- `sendVoiceNotification(payload)` — new internal function, called from the three `appendXToVoiceTimeline` functions
- Cached ntfy URL promise at module scope

**`voice/+server.js` (`ide/src/routes/api/tasks/voice/+server.js`)** — `transcribeAndOrganize()` must call `loadJatContext()` after `loadProjects()` and pass the result to `organizeTranscript()`. The JSON-text path (`POST` with `application/json`) also must call `loadJatContext()` before `organizeTranscript()`.

**`voice-diarize/+server.js` (`ide/src/routes/api/tasks/voice-diarize/+server.js`)** — same changes as above. Additionally, the hardcoded `null` passed as the `speakers` argument to `appendToVoiceTimeline()` on line 161 must be replaced with the actual `speakers` value from the `organizeTranscript()` result.

**`jt` CLI** — called via `child_process.exec` inside `loadJatContext()`. The JAT IDE always runs in the context of the JAT project root, so `jt` resolves correctly. For postgres-backed sub-projects (chimaro, flush), `jt list` scoped to those projects requires that the IDE be running with the postgres backend accessible, which it always is in practice.

**`jat-search`** — no changes needed. It already indexes `.jat/memory/` via FTS5 and vector hybrid search. Writing well-formed memory files in the established format is sufficient.

**ntfy.sh** — external service. The JAT VPS setup (task jat-if64a) is a prerequisite but out of scope for this PRD. The client-side code only needs the ntfy topic URL as a secret.

### Data storage and privacy

- `loadJatContext()` reads task data from the local `jt` CLI. No data leaves the machine.
- Memory files written to `.jat/memory/` are local files inside the project directory. They are included in the project's git history if `.jat/` is tracked (it is in JAT). This is acceptable and desirable for persistence across machine reloads.
- ntfy push notifications transmit the voice note title and task count to the ntfy server. If the ntfy server is self-hosted on the JAT VPS (recommended), this data never leaves the user's infrastructure. If using ntfy.sh cloud, only the notification payload (title and task count, not the transcript or task descriptions) is transmitted.
- No personal data beyond task titles and speaker names is included in ntfy payloads.

### Scalability and performance

- `loadJatContext()` parallelizes the three `jt list` calls using `Promise.all()` with individual 10-second timeouts. Total overhead is bounded by the slowest call, not the sum.
- Memory file writes are synchronous `appendFileSync` calls (same pattern as `appendToVoiceTimeline`) wrapped in try/catch. At current voice note volumes (2–10 per day), I/O is negligible.
- The ntfy call is fire-and-forget (`fetch()` without `await`). It adds zero latency to the processing pipeline.
- The ollama prompt grows by approximately 200–800 tokens depending on the number of epics and completions injected. At the current `num_ctx: 131072` context window, this is well within limits. The `num_predict: -1` setting means ollama generates until EOS; the slightly larger context does not significantly change generation time.
- The module-level ntfy URL promise is initialized once at startup (when voice-core.js is first imported). Subsequent calls to `sendVoiceNotification()` resolve immediately from the cached value.

### Potential challenges

**`jt` output format stability:** The `jt list --json` output format has been stable, but any change to the schema would silently produce empty context. `loadJatContext()` should defensively access fields with optional chaining (`task?.title ?? ''`) and log unexpected shapes via `vlog()`.

**ollama JSON compliance with extended schema:** Adding `epic_id` as an optional field to the task schema requires ollama to sometimes include it and sometimes omit it. The gemma4:e2b model (configured via `ORGANIZE_TASKS_MODEL`) handles optional fields reliably at temperature 0.3, but the JSON repair function `repairTruncatedJson()` must be verified to not strip optional fields during recovery.

**Memory file writing when title is ambiguous:** If the same voice session mentions multiple projects and the title is generic ("Afternoon notes"), multiple memory files will share a similar slug, potentially colliding. The slug must incorporate the project name (already in the filename convention: `voice-{date}-{project}-{slug}.md`) to prevent this. Verify the slug function handles the multi-project case correctly.

**Speaker resolution false positives:** ollama may match speaker labels to team members incorrectly if a speaker's introduction is ambiguous or if a known member's name appears in a non-introduction context ("I talked to Joe about the permit"). The prompt must be specific: match only explicit first-person introduction patterns, not mentions of names in the third person.

**ntfy URL secret race condition:** The module-level promise is created when voice-core.js is first imported. If `jat-secret ntfy-url` is slow to execute (network timeout on secret vault), the first few voice processing calls may have their notifications queued behind the promise resolution. This is acceptable; the promise caches on resolution.

## Milestones and sequencing

### Project estimate

2–4 days of focused implementation for a solo developer.

### Team size

One developer.

### Suggested phases

**Phase 1 — JAT context injection (day 1)**
Implement `loadJatContext()` and extend `organizeTranscript()` with the richer prompt. Wire both `transcribeAndOrganize()` callers. Verify with a real voice note that epic IDs appear in the organize output. This is the highest-value change and stands alone.

**Phase 2 — Speaker resolution (day 1–2)**
Extend `speakerInstructions` with the member injection. Test with a diarized recording where a speaker says "I'm Joe". Verify the `speakers` map is populated correctly and the timeline entry stores it. Fix the hardcoded `null` bug in `voice-diarize/+server.js`.

**Phase 3 — Memory files (day 2–3)**
Implement `writeVoiceMemoryFiles()`. Call it from `appendToVoiceTimeline()`. Verify files appear in `.jat/memory/` with the correct format. Run `jat-search` against the written files to confirm indexing. Handle the multi-project file split logic.

**Phase 4 — ntfy push notifications (day 3–4)**
Implement `sendVoiceNotification()` with the module-level URL cache. Wire it into all three `appendXToVoiceTimeline()` functions. Test end-to-end with the ntfy server running. Verify silent degradation when the secret is not set.

## User stories

### US-001: Context-loaded organize call

**Title:** System injects JAT context before calling ollama

**Description:** As a user, when I upload a voice note, I want ollama to know about my existing open epics and in-progress tasks so that extracted tasks are linked to the right context automatically.

**Acceptance criteria:**
- `loadJatContext(projects)` is exported from `voice-core.js` and accepts the same project list returned by `loadProjects()`.
- It executes `jt list --status open --type epic --json`, `jt list --status closed --json`, and `jt list --status in_progress --json` in parallel via `Promise.all`.
- Each `exec` call has a 10-second timeout. Timeout or error results in an empty array for that category; `vlog()` records the failure.
- The returned object shape is `{ epics: [{ id, title, project }], recentCompletions: [{ id, title, project }], inProgress: [{ id, title, project }] }`, capped at 10 epics and 20 entries for each of the other two categories per project.
- Titles and descriptions are truncated to 100 characters before inclusion.
- `organizeTranscript()` accepts a fourth optional parameter `jatContext = {}`.
- When `jatContext` is non-empty, the ollama prompt includes a "JAT Context" block listing open epics (with IDs), recent completions, and in-progress tasks, inserted before the project section.
- `transcribeAndOrganize()` in `voice/+server.js` calls `loadJatContext()` after `loadProjects()` and passes the result to `organizeTranscript()`.
- `transcribeAndOrganize()` in `voice-diarize/+server.js` applies the same change.
- The JSON-text path in `voice/+server.js` (`POST application/json`) also calls `loadJatContext()` before `organizeTranscript()`.

### US-002: Epic ID in organized tasks

**Title:** ollama suggests epic parent for extracted tasks

**Description:** As a user, I want tasks extracted from my voice note to include a suggested parent epic ID when the content clearly matches an open epic, so the task can be linked without manual triage.

**Acceptance criteria:**
- The organize prompt instructs ollama to add an optional `"epic_id"` field (the JAT task ID string, e.g., `"tennis-3f2a"`) to any extracted task that clearly belongs to a listed open epic.
- The prompt explicitly states that `epic_id` is optional and should be omitted when no clear match exists.
- The `tasks` array returned by `organizeTranscript()` passes through `epic_id` values without stripping them.
- When no epics are in context, `epic_id` is never present on any task (ollama must not hallucinate IDs).
- A voice note saying "follow up on the tennis building permit" when the epic "Tennis Building: Permit and Foundation" (ID: `tennis-3f2a`) is in context results in the task having `"epic_id": "tennis-3f2a"`.

### US-003: Empty context fallback

**Title:** Organize proceeds normally when JAT context is unavailable

**Description:** As a user, I want voice processing to succeed even if the JAT CLI is not available or returns an error, without any visible failure or degraded quality beyond the absence of epic linking.

**Acceptance criteria:**
- If `jt` is not on the PATH, `loadJatContext()` returns `{}` and logs a single `vlog()` warning.
- If any `jt list` call exits with a non-zero code, that category returns an empty array. The other categories are unaffected.
- If all `jt list` calls time out (simulated via a 10-second cap), `loadJatContext()` resolves within 11 seconds with an empty context object.
- `organizeTranscript()` with an empty `jatContext` produces the same output as the current implementation (no JAT Context block in the prompt).
- No error is surfaced to the user in the voice inbox when context loading fails.

### US-004: Accurate speaker resolution via introduction convention

**Title:** "I'm [name]" maps speaker labels to real names

**Description:** As a user recording a multi-person meeting using the diarized endpoint, I want speaker labels to be resolved to real names when any participant introduces themselves, so tasks are attributed correctly.

**Acceptance criteria:**
- The `speakerInstructions` block in `organizeTranscript()` is extended with a "Known team members" section when the `jatContext` contains member data for any project.
- Each known member is listed as `Name (email)` in the prompt.
- The prompt instructs ollama to match speaker labels using the exact phrases "I'm [name]", "This is [name]", "my name is [name]", and their common contractions.
- The prompt explicitly states that third-person name mentions ("I talked to Joe") must NOT trigger a speaker resolution.
- The returned `speakers` map contains the matched name string (not email) as the value for resolved speakers, and `null` for unresolved speakers.
- A transcript containing "[SPEAKER_00]: Hi, I'm Joe and I'm with Sarah" where "Joe" is in the known members list results in `speakers = { "SPEAKER_00": "Joe" }`. "Sarah" is not in the list and her label remains `null`.
- If no members are injected (no `members` field in `projects.json`), the existing speaker behavior is unchanged.

### US-005: Fix diarize route speakers passthrough

**Title:** voice-diarize route correctly passes speakers map to timeline

**Description:** As a user of the diarized voice endpoint, I want the resolved speaker map to appear in the voice inbox timeline event so the VoiceInbox component can display it.

**Acceptance criteria:**
- In `voice-diarize/+server.js`, the `organizeTranscript()` result is destructured to include `speakers`.
- `appendToVoiceTimeline()` is called with the actual `speakers` value (currently hardcoded as `null`).
- After the fix, a diarized voice note with speaker introductions shows the resolved `speakers` map in the timeline event's `data.speakers` field.
- Non-diarized recordings (standard `voice/+server.js`) are unaffected.

### US-006: Members field in projects.json

**Title:** Project registry supports a member roster for speaker resolution

**Description:** As a user, I want to be able to declare known team members in my project configuration so they are automatically available to the speaker resolution system.

**Acceptance criteria:**
- `loadProjects()` in `voice-core.js` passes through a `members` field from the project config if present, as an array of `{ name, email }` objects.
- If the `members` field is absent or malformed, `loadProjects()` returns the project without a members field (no error thrown).
- The `members` field is optional — existing `projects.json` files without it continue to work.
- Adding `"members": [{ "name": "Joe Winke", "email": "j@chimaro.ai" }]` to a project entry in `~/.config/jat/projects.json` causes that member to appear in the speaker resolution prompt when a voice note is attributed to that project.

### US-007: Voice note written as memory file

**Title:** Each successful organize run produces a memory markdown file

**Description:** As a user, I want each voice session that successfully produces tasks or KB entries to be written as a memory file so agents and the search interface can find it.

**Acceptance criteria:**
- `writeVoiceMemoryFiles(organizeResult, jatContext, date)` is implemented in `voice-core.js` and called from `appendToVoiceTimeline()` after the timeline write.
- At least one `.jat/memory/voice-{YYYY-MM-DD}-{project}-{slug}.md` file is written for every successful organize run that produces at least one task or KB entry.
- Each file contains a YAML frontmatter block with `name`, `description`, and `type: project` fields.
- The body contains: date, speakers (if available), project list, summary section, knowledge base entries section, and tasks section.
- Knowledge base entries and tasks are grouped by project: only entries attributed to project X appear in project X's file.
- Unattributed entries are appended to the first project's file under a "General" section heading.
- If all entries are unattributed, a single file with `_general` as the project segment is written.
- File naming follows `voice-{YYYY-MM-DD}-{project}-{slug}.md` where slug is the voice note title in kebab-case, truncated to 40 characters.
- Files are written to `{projectRoot}/.jat/memory/` where `projectRoot` is resolved via `process.cwd().replace(/\/ide$/, '')`.
- Write failures (permissions, disk full) are caught, logged via `vlog()`, and do not affect the timeline write result.

### US-008: Memory files indexed by jat-search

**Title:** Voice memory files surface in search results

**Description:** As a user or agent, I want to be able to search for content discussed in voice notes using `jat-search` or the `/search` route in the IDE.

**Acceptance criteria:**
- After a memory file is written, running `jat-search memory "permit"` (or a relevant keyword) returns the voice note file in the results if the transcript discussed that keyword.
- The memory file appears in the IDE's `/memory` route file list.
- No additional indexing steps are required beyond writing the file (jat-search already indexes `.jat/memory/` via FTS5 and vector hybrid search).
- The YAML frontmatter `description` field is populated so jat-search has a meaningful snippet to display.
- Files written by this feature are not distinguishable in format from manually written memory files — they use the same frontmatter schema.

### US-009: Multi-project memory file splitting

**Title:** Voice sessions spanning multiple projects write one file per project

**Description:** As a user who records notes covering multiple projects in a single session, I want each project's content isolated in its own memory file so agents for that project find only relevant context.

**Acceptance criteria:**
- When a voice session produces tasks or KB entries attributed to both `jat` and `chimaro`, two files are written: one for `jat` and one for `chimaro`.
- The `jat` file contains only tasks and KB entries where `project === "jat"`.
- The `chimaro` file contains only tasks and KB entries where `project === "chimaro"`.
- The summary section is duplicated into both files (it is the same summary regardless of project split).
- If the `chimaro` project's `path` in `projects.json` resolves to a directory containing `.jat/memory/`, the chimaro file is also written there (in addition to the JAT project's memory directory).
- If the secondary project's memory directory does not exist or the path is unresolvable, the chimaro file is only written to the JAT project's memory directory; no error is raised.

### US-010: Push notification on task completion

**Title:** ntfy notification sent when tasks land in voice inbox

**Description:** As a user, I want to receive a push notification on my iOS device within 30 seconds of voice processing completing, so I know tasks are ready to review without polling the IDE.

**Acceptance criteria:**
- `sendVoiceNotification(payload)` is implemented in `voice-core.js` and called from `appendToVoiceTimeline()`, `appendTranscriptToVoiceTimeline()`, and `appendFailedToVoiceTimeline()` as a fire-and-forget call (not awaited).
- The notification payload for task success is: `title: "Voice Inbox"`, `message: "{N} task(s) from '{noteTitle}' · tap to review"` (where N is the task count), `tags: ["microphone"]`, `priority: 3`.
- The notification payload for transcript-only success is: `title: "Voice Inbox"`, `message: "Transcript saved: '{noteTitle}'"`, `tags: ["memo"]`, `priority: 3`.
- The notification payload for failure is: `title: "Voice Inbox"`, `message: "Processing failed: '{noteTitle}' — check the voice log"`, `tags: ["warning"]`, `priority: 3`.
- The ntfy URL is read from `jat-secret ntfy-url` exactly once per process lifetime and cached.
- If the secret is not set, `sendVoiceNotification()` is a no-op — no error is logged, no network call is made.
- If the ntfy server is unreachable, the failed `fetch()` is caught and a single `vlog()` warning is emitted. Voice processing is unaffected.
- The ntfy POST is sent to the full ntfy URL (e.g., `https://ntfy.example.com/jat-voice`) with `Content-Type: application/json`.

### US-011: ntfy URL secret configured silently

**Title:** Notification system degrades gracefully when not configured

**Description:** As a user who has not set up an ntfy server, I want the voice pipeline to behave exactly as before — no errors, no warnings in the inbox — when the ntfy secret is absent.

**Acceptance criteria:**
- Running `jat-secret ntfy-url` returning a non-zero exit code causes `sendVoiceNotification()` to become a permanent no-op for the process lifetime (no retry on each call).
- The cached promise resolves to `null` when the secret is absent, and `sendVoiceNotification()` returns immediately on `null`.
- No error appears in the voice inbox timeline for missing ntfy config.
- A single `vlog('[ntfy] URL not configured — notifications disabled')` is emitted once at startup (when the secret lookup runs), not on every voice processing call.

### US-012: ntfy notification latency

**Title:** Push notification arrives within 30 seconds of timeline write

**Description:** As a user, I want the push notification to arrive promptly so I can act on it while the recording context is still fresh.

**Acceptance criteria:**
- The `fetch()` call to ntfy is made synchronously (fire-and-forget) immediately inside `appendToVoiceTimeline()` before the function returns.
- The ntfy server processes the HTTP POST and delivers to the ntfy iOS app within the standard ntfy delivery latency (typically under 5 seconds for self-hosted).
- End-to-end time from `appendToVoiceTimeline()` being called to notification appearing on iOS is under 30 seconds on a normal network connection.
- The ntfy call does not delay the response to the browser or the writing of the timeline file — it is non-blocking.

### US-013: Tooltip for speaker convention in voice inbox

**Title:** VoiceInbox UI hints at the "I'm [name]" convention for diarized recordings

**Description:** As a user who is new to the diarized endpoint, I want to see a hint in the voice inbox explaining how to get speaker names resolved, so I know to use the introduction convention.

**Acceptance criteria:**
- The `VoiceInbox.svelte` component (`ide/src/lib/components/voice/VoiceInbox.svelte`) includes a brief note visible near the diarized recording section or as a tooltip on the speaker labels.
- The hint text reads approximately: "For speaker names, start recordings with 'I'm [name]' or 'This is [name]'."
- The hint is only visible when a voice event with diarized speaker labels is present in the inbox (i.e., any event with a non-null `speakers` field).
- The hint does not appear for non-diarized recordings.

### US-014: Context injection logging

**Title:** Context loading details are logged at vlog level

**Description:** As a developer debugging the organize pipeline, I want to see what context was loaded and injected before the ollama call so I can diagnose linking failures.

**Acceptance criteria:**
- `loadJatContext()` emits a `vlog()` line summarizing the loaded context: e.g., `[context] loaded: 3 epics, 12 completions, 4 in-progress tasks across 2 projects`.
- If any `jt list` call fails or times out, a `vlog()` warning identifies which call failed and why.
- Before calling ollama, `organizeTranscript()` emits a `vlog()` line indicating whether jat context was injected: e.g., `[organize] prompt includes jat context (3 epics, 12 completions)` or `[organize] no jat context`.
- After `writeVoiceMemoryFiles()` runs, a `vlog()` line lists each file path written.
- All of the above are `vlog()` calls (written to `/tmp/jat-voice.log` and stdout), not console.error.

### US-015: JSON schema backward compatibility

**Title:** organizeTranscript return value is backward compatible

**Description:** As a caller of `organizeTranscript()`, I want the function's return value to remain backward compatible so no changes are needed in callers that do not use `epic_id`.

**Acceptance criteria:**
- The return value of `organizeTranscript()` is `{ tasks, summary, title, knowledgeBase, speakers }` — the same shape as today.
- Individual task objects may now optionally contain an `epic_id` field, but its presence is never required.
- Callers that destructure only `{ tasks, summary, title, knowledgeBase }` continue to work without modification.
- The `repairTruncatedJson()` function does not strip `epic_id` from recovered task objects (verify the recovery suffixes do not truncate inside a task object with this field).
- No existing caller of `organizeTranscript()` requires changes as a result of the signature extension to four parameters (the fourth parameter defaults to `{}`).

### US-016: Memory file format correctness

**Title:** Memory files are valid markdown with correct YAML frontmatter

**Description:** As an agent or developer reading memory files, I want the files to be well-formed so they are correctly parsed by `jat-search` and readable in any markdown viewer.

**Acceptance criteria:**
- Each file starts with `---` on line 1, a YAML frontmatter block, and a closing `---`.
- The frontmatter `name` field is a string: `Voice note: {title}`.
- The frontmatter `description` field is a string of at most 160 characters derived from the summary.
- The frontmatter `type` field is the string `project`.
- The body uses `##` headings for sections: "Summary", "Knowledge Base Entries", "Tasks Created".
- Within "Knowledge Base Entries", each entry uses a `###` heading matching the entry title.
- Within "Tasks Created", each task is a list item: `- {id or "(pending)"}: {title}`.
- The file is UTF-8 encoded with Unix line endings.
- Files pass a basic markdown lint check (no unclosed fences, valid YAML frontmatter parseable by `js-yaml` or equivalent).
- The slug portion of the filename contains only lowercase alphanumeric characters and hyphens, with no leading or trailing hyphens.

### US-017: ntfy credentials UI entry

**Title:** ntfy URL can be set from the IDE credentials settings page

**Description:** As a user, I want to configure my ntfy URL through the IDE settings UI without using the terminal, so setup is accessible and visible alongside other credentials.

**Acceptance criteria:**
- The credentials editor at `/config` → API Keys shows an `ntfy-url` entry as a custom key.
- The user can enter a full ntfy topic URL (e.g., `https://ntfy.example.com/jat-voice`) and save it.
- After saving, `jat-secret ntfy-url` returns the saved value from the terminal.
- The value is displayed masked in the credentials editor (same masking as other custom keys).
- Saving a new ntfy URL takes effect on the next voice processing call (the cached promise must be re-initialized; in practice this requires an IDE restart or a module reload trigger, which is acceptable for a configuration change).
