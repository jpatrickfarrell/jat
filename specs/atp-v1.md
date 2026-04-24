# Agent Tool Protocol (ATP) v1

**Status:** Draft
**Version:** 1.0.0
**Editors:** JAT core team
**Reference implementation:** [jat-feedback](../feedback/) — `feedback/src/lib/agentBridge.ts`, `feedback/src/JatFeedback.svelte`

## 1. Abstract

The Agent Tool Protocol (ATP) is a client-side standard for web pages to expose
executable tools to an embedded AI agent. The agent sees tool schemas, collects
required inputs conversationally from the user, and calls browser-side handlers
that run with the page's full security context (authenticated session, app state,
DOM access).

ATP replaces server-mediated tool calling with direct page-origin execution.
There is no new network path: handlers are ordinary async functions in the page,
and the agent widget invokes them directly. The tool schema *is* the form —
validation, clarification, and multi-step collection are delegated to the LLM.

## 2. Goals & Non-Goals

### 2.1 Goals

- **G1.** Let any SaaS app expose domain actions (`createQuote`, `uploadDrawing`,
  `lookupCustomer`) to an embedded agent without server-side tool infrastructure.
- **G2.** Use the handler's JSON Schema as the sole parameter contract — the LLM
  collects missing fields in natural-language dialog with the user.
- **G3.** Interoperate with existing OpenAI / Anthropic function-calling LLM APIs
  without new wire formats on the model side.
- **G4.** Preserve the page's security boundary: no handler can do more than a
  logged-in user can already do via the page's own JS.
- **G5.** Support dynamic registration — tools appear and disappear as the user
  navigates routes, opens modals, or changes permissions.

### 2.2 Non-Goals

- **N1.** A new LLM wire protocol. ATP is a widget-side API; the LLM side uses
  whichever function-calling format the widget's agent library already speaks.
- **N2.** A server-side tool registry. ATP tools do not exist on the server.
- **N3.** Cross-origin tool execution. Handlers run in the page origin only.
- **N4.** Authentication or authorization of the agent itself. That is the host
  app's responsibility (see §7).

## 3. Terminology

| Term | Meaning |
|------|---------|
| **Widget** | The custom element / embedded agent UI that implements ATP (e.g. `<jat-feedback>`). |
| **Host page** | The web page that embeds the widget and registers tools. |
| **Tool** | A named, typed, async function the host page exposes for the agent to call. |
| **Tool Definition** | The ATP record describing a tool (name, description, parameters, handler). |
| **Handler** | The host-page async function that executes when the agent calls the tool. |
| **Agent** | The LLM-driven execution loop inside the widget that decides which tool to call. |
| **Registration** | The act of attaching a Tool Definition to the widget so the agent can see it. |

MUST, SHOULD, MAY follow [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

## 4. Tool Definition Schema

Every tool MUST be described by a Tool Definition record. Conforming widgets
MUST accept the following shape:

```typescript
interface ToolDefinition {
  /** Unique tool name within the widget. Snake_case recommended. */
  name: string;

  /** Human-language description shown to the LLM. Tell the model what the
   *  tool does and when to use it. */
  description: string;

  /** JSON Schema (draft 2020-12 subset) describing the tool's input. MUST be
   *  `{ type: "object", properties: {...}, required: [...] }`. Use
   *  `{ type: "object", properties: {} }` for no-arg tools. */
  parameters: JsonSchema;

  /** Async function called when the agent invokes this tool. Receives parsed
   *  arguments, returns any JSON-serializable value (or throws). */
  handler: (args: Record<string, unknown>) => Promise<unknown>;

  /** OPTIONAL — see §4.2 Browser Extensions. */
  requiresConfirmation?: boolean;
  fileInputs?: string[];
  longRunning?: boolean;
  returns?: JsonSchema;
}
```

### 4.1 Core fields (MUST)

- **name.** Unique within the widget's registered tool set. Tools with the same
  name MUST be rejected (last-write-wins is allowed but SHOULD emit a warning).
  Widgets MUST NOT pass `name` through to the LLM unchanged if it conflicts
  with a widget-internal tool — see §5.4.
- **description.** Plain text ≤ 1024 chars. The LLM uses this to decide when
  to call the tool. Include trigger phrasing ("Call this when the user wants
  to create a new project").
- **parameters.** A JSON Schema object. Widgets MUST support at minimum:
  `type`, `properties`, `required`, `description`, and the primitive types
  `string`, `number`, `integer`, `boolean`, `array`, `object`. Enums,
  `format` hints (`email`, `uri`, `date`), and nested objects SHOULD be
  supported. A tool with no inputs MUST use `{ type: "object", properties: {} }`.
- **handler.** An async function. The widget MUST pass the parsed argument
  object (after JSON Schema coercion) as the single argument. Return values
  MUST be JSON-serializable. Thrown errors MUST be caught and their message
  SHOULD be returned to the LLM as tool output so the agent can recover.

### 4.2 Browser Extensions (MAY)

ATP extends OpenAI function-calling format with four browser-specific hints.
All are optional and default to `false` / `undefined`. The widget MAY use
them to adjust UX; the LLM SHOULD NOT see them directly.

| Field | Type | Meaning |
|-------|------|---------|
| `requiresConfirmation` | `boolean` | Widget MUST prompt the user to approve before calling the handler. Default `false`. Use for destructive or side-effecting actions (`deleteProject`, `sendInvoice`). |
| `fileInputs` | `string[]` | Names of parameters whose values are `File` / `Blob` references. Widget is responsible for staging them — see §6.3. |
| `longRunning` | `boolean` | Handler may take > 5 s. Widget SHOULD show a progress indicator and MUST NOT enforce a short timeout. Default `false`. |
| `returns` | `JsonSchema` | OPTIONAL schema for the handler's return value. Widgets MAY use this to pretty-render results. The LLM receives the serialized return value regardless. |

### 4.3 Example

```typescript
{
  name: "create_project",
  description: "Create a new construction project. Call this when the user says 'new project', 'start a job', or drops project drawings into the chat.",
  parameters: {
    type: "object",
    properties: {
      name:      { type: "string", description: "Project name shown to the client" },
      client_id: { type: "string", description: "Existing client UUID; ask user if unknown" },
      address:   { type: "string", description: "Job site address" },
      trade:     { type: "string", enum: ["plumbing", "electrical", "hvac"] },
      drawings:  { type: "array", items: { type: "string" }, description: "File IDs from fileInputs" },
    },
    required: ["name", "client_id", "address", "trade"],
  },
  fileInputs: ["drawings"],
  requiresConfirmation: true,
  handler: async (args) => {
    const { data, error } = await supabase.from("projects").insert(args).select().single();
    if (error) throw new Error(error.message);
    return { project_id: data.id, url: `/projects/${data.id}` };
  },
}
```

## 5. Registration API

Conforming widgets MUST expose the following methods on the custom element host.
All three methods operate on an internal tool table scoped to the widget instance.

### 5.1 `registerTools(tools: ToolDefinition[]): void` — MUST

Append one or more tools to the widget's tool table. Registration is **additive**:
subsequent calls accumulate rather than replace. A page-level `+layout` can
register global tools and an individual page can register route-specific tools;
both coexist.

- Duplicate `name` within the same call or against already-registered tools
  SHOULD emit a `console.warn` and last-write-wins.
- Registration MUST be possible from page load onward; the widget MUST NOT
  require all tools to be registered before mount.
- Tools registered while an agent turn is in flight MUST NOT be injected into
  that turn's LLM request — they become visible on the next turn.

### 5.2 `unregisterTools(names: string[]): void` — MUST

Remove tools by name. Unknown names are a no-op. Used when a user navigates
away from a route that registered page-specific tools, or when permissions
change (e.g. user loses admin rights, admin-only tools disappear).

### 5.3 `getTools(): ToolDefinition[]` — SHOULD

Return a shallow copy of the current registered tool table. Primarily for
debugging, testing, and widgets that render a "what can the agent do?" panel.
Handlers MUST NOT be invoked through the returned array; treat it as read-only
introspection.

### 5.4 Name namespacing

Widget-internal tools (e.g. `click_element_by_index` in a DOM-automation agent)
and host-registered tools share a namespace from the LLM's perspective. To
prevent collisions, widgets MUST:

- Document the reserved names they use internally (see §8 for jat-feedback's
  reserved set).
- Reject or rename host-registered tools that collide with reserved names.
  Renaming SHOULD prefix with `host__` and emit a warning.

### 5.5 Lifecycle

```
┌───────────────────┐  customElement upgraded
│ widget undefined  │
└────────┬──────────┘
         │ onMount / connectedCallback
         ▼
┌───────────────────┐  host.registerTools(globalTools)
│ empty tool table  │ ◄────────────────────────────────
└────────┬──────────┘
         │ route change
         ▼
┌───────────────────┐  host.registerTools(routeTools)
│ table = globals + │
│       routeTools  │
└────────┬──────────┘
         │ navigate away
         ▼
┌───────────────────┐  host.unregisterTools(routeToolNames)
│ table = globals   │
└───────────────────┘
```

Widgets MUST tolerate `registerTools()` being called before, during, or after
first agent use.

### 5.6 Reference: Attaching to a custom element

```typescript
// Inside the widget (Svelte example, feedback/src/JatFeedback.svelte:189)
const host = $host<HTMLElement & {
  registerTools?: (tools: ToolDefinition[]) => void;
  unregisterTools?: (names: string[]) => void;
  getTools?: () => ToolDefinition[];
}>();

host.registerTools = (tools) => {
  registeredTools = [...registeredTools, ...tools];
};
host.unregisterTools = (names) => {
  const drop = new Set(names);
  registeredTools = registeredTools.filter((t) => !drop.has(t.name));
};
host.getTools = () => registeredTools.slice();
```

Host page usage:

```typescript
const widget = document.querySelector("jat-feedback");
widget.registerTools([...]);
```

## 6. Execution Protocol

When the user sends a message to the agent, the widget runs a standard
LLM-agent loop. ATP defines how host-registered tools participate in that loop.

### 6.1 Wire format (widget ↔ LLM)

The widget MUST serialize ATP Tool Definitions into whichever function-calling
format its LLM API expects. For OpenAI-compatible APIs:

```json
{
  "type": "function",
  "function": {
    "name":        "<ToolDefinition.name>",
    "description": "<ToolDefinition.description>",
    "parameters":  "<ToolDefinition.parameters>"
  }
}
```

Browser extension fields (§4.2) MUST NOT be forwarded to the LLM. They are
widget-local metadata.

### 6.2 Execution loop

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. User sends message                                               │
│ 2. Widget builds LLM request:                                       │
│      system prompt + conversation history + serialized tool table   │
│ 3. LLM returns a response containing either:                        │
│      (a) assistant text → show to user, loop ends                   │
│      (b) tool_use { name, arguments } → continue                    │
│ 4. Widget looks up `name` in the tool table                         │
│      - Not found → return error to LLM, continue loop               │
│      - `requiresConfirmation` → prompt user, skip if rejected       │
│      - `fileInputs` → resolve file IDs to Blobs, inject into args   │
│ 5. Widget calls handler(args)                                       │
│      - Thrown error → return "Error: <msg>" as tool_result          │
│      - Resolved value → JSON.stringify (string values pass through) │
│ 6. Widget appends tool_result to conversation, loops to step 3      │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.3 File inputs

A tool with `fileInputs: ["drawings"]` declares that the `drawings` parameter
refers to uploaded files rather than plain data. The widget is responsible for
maintaining a file staging area and resolving IDs before handler invocation:

1. When the user drops / pastes / attaches files in the chat UI, the widget
   stores them in an internal `Map<id, Blob>` and surfaces the IDs in the
   conversation context (e.g. "User attached 3 files: drw_1, drw_2, drw_3").
2. The LLM references file IDs by name in the tool's `fileInputs` parameters.
3. Before calling the handler, the widget resolves each ID in a `fileInputs`
   parameter to the actual `Blob` / `File` and substitutes it into `args`.
4. The handler receives real `File` objects — it can upload them, hash them,
   read them as text, etc.

Widgets that do not support file inputs MUST ignore the `fileInputs` field;
tools that rely on it will simply never be called with files.

### 6.4 Confirmation

For tools with `requiresConfirmation: true`, the widget MUST:

1. Render a confirmation prompt showing the tool name and arguments (redacted
   as appropriate — see §7.3).
2. Wait for a user approve / skip action.
3. On approve → run the handler.
4. On skip → inject a tool_result of the form `"Skipped by user. Re-plan with
   a different approach."` so the agent can recover.

The reference implementation uses this pattern for DOM-automation tools; ATP
extends it to host-registered tools via the `requiresConfirmation` flag.

### 6.5 Error handling

Handler errors MUST NOT crash the widget. The widget MUST:

- Catch all thrown exceptions.
- Return the error message as the tool_result (truncated to a reasonable
  length, e.g. 2 KB) so the LLM can retry with different arguments or
  apologize to the user.
- Log the full error (including stack trace) to `console.error` for debugging.

Handlers MAY return structured error objects (e.g.
`{ error: "not_found", id: "..." }`). The widget SHOULD serialize these
normally and let the LLM decide how to respond.

### 6.6 Return value serialization

| Handler return | Passed to LLM as |
|----------------|------------------|
| `string`       | string verbatim |
| any other JSON value | `JSON.stringify(value)` |
| `undefined` / `null` | `"null"` (literal) |
| Value that throws on stringify (circular) | `"Error: handler return value is not JSON-serializable"` |

### 6.7 Timeouts

Unless `longRunning: true`, widgets MAY enforce a default handler timeout
(recommended: 30 s). On timeout, the widget MUST:

- Return `"Error: handler timed out after Ns"` as tool_result.
- Not cancel the handler (ATP has no cancellation mechanism in v1) — the
  handler continues running but its result is discarded.

## 7. Conversational Collection Pattern

This section describes the intended UX pattern, not a normative protocol
requirement. It's the reason ATP exists.

### 7.1 The schema is the form

Traditional form UIs hardcode field collection: labels, validation, required
markers, step-by-step wizards. ATP delegates this to the LLM. The tool's
`parameters` JSON Schema is the only declarative artifact; the LLM drives the
interaction.

Example flow for `create_project` (§4.3):

```
User: "start a new job for the Henderson place"

Agent (internal): Tool `create_project` needs name, client_id, address, trade.
  I have "Henderson place" which could be the name or address. Ask.

Agent → User: "Is 'Henderson place' the project name or the job-site address?
  And which client is this for?"

User: "That's the address. It's for Henderson Construction.
  Plumbing rough-in, we'll call it 'Henderson Rough-in 2026'."

Agent (internal): Looks up Henderson Construction via `lookup_customer`
  tool → got client_id. Now has all required fields.

Agent → User: "Creating project 'Henderson Rough-in 2026' for Henderson
  Construction at 'Henderson place' as a plumbing job. Confirm?"

User: "yes"

Agent: calls create_project(...) → returns project_id, url
Agent → User: "Project created: /projects/abc123"
```

No form UI was rendered. The LLM asked only for missing fields, disambiguated
a confusable input, used a second tool (`lookup_customer`) to resolve a field,
and confirmed before execution.

### 7.2 Design guidance for Tool Definitions

- **Write descriptions that trigger calls.** Include the phrases users say
  ("when the user asks to create a quote", "if the user drops a drawing").
- **Describe every parameter.** `description` on each property tells the LLM
  what to ask for. "Project name shown to the client" beats "name".
- **Mark only truly-required fields as `required`.** Optional fields let the
  LLM skip collection and use sane defaults.
- **Use enums for closed sets.** `{ enum: [...] }` lets the LLM present
  options to the user instead of free-form prompting.
- **Prefer composable small tools over monolithic ones.** `lookup_customer`
  + `create_project` is better than a `create_project_with_new_customer`
  mega-tool — the LLM can mix and match.

### 7.3 Sensitive arguments

If a parameter is sensitive (API keys, passwords, PII), the Tool Definition
SHOULD include `description` text that tells the LLM not to echo it back
("Do not repeat this value in chat"). The widget MAY mask arguments in the
confirmation prompt; see §7.3 of the security model.

## 8. Security Model

### 8.1 Origin & capability boundary

Tool handlers run in the host page's JavaScript context. They inherit:

- The page's origin (for fetch / XHR / Supabase client access).
- The logged-in user's session cookies / auth tokens.
- The page's direct DOM access.

Therefore, **a tool cannot do anything the logged-in user cannot already do**
by pressing a button in the page. ATP does not grant new privileges; it
re-exposes existing capabilities in a machine-callable form.

### 8.2 Threat model

| Threat | Mitigation |
|--------|-----------|
| Malicious tool description tricks LLM into harmful action | `requiresConfirmation` for destructive tools; confirmation prompt shows resolved arguments. |
| Prompt injection via tool return value | Widget SHOULD treat tool results as untrusted text and not re-execute or render-as-HTML. |
| Malicious tool *name* conflicts with widget-internal tool | §5.4 namespacing: widget reserves names, rejects/renames colliding registrations. |
| Handler leaks secrets via return value | Handler author's responsibility. ATP cannot enforce this — handlers are ordinary app code. |
| Agent-initiated action without user intent | `requiresConfirmation` flag; widget UX SHOULD make every tool call visible in the chat transcript. |
| Cross-widget tool access (two widgets on same page) | Each widget's tool table is instance-scoped. Tools registered on widget A are not visible to widget B. |

### 8.3 What ATP does NOT protect against

- **Compromised host page JS.** If the page itself is XSS'd, the attacker can
  register arbitrary tools. ATP assumes host-page JS is trusted.
- **Malicious LLM.** A rogue model can ignore confirmations and craft
  arguments to exploit handlers. Confirmation UX and handler-side validation
  are the defenses — ATP is not a sandbox.
- **Data exfiltration through tool results.** A handler that returns sensitive
  data hands that data to the LLM provider. The Tool Definition author MUST
  decide what's safe to return.

### 8.4 Recommended handler-side guardrails

Handler authors SHOULD:

- Validate arguments server-side (same as any user-submitted form). JSON
  Schema validation in the widget is advisory — don't trust it.
- Re-check authorization on every call (don't assume "the LLM wouldn't ask
  for something the user can't do").
- Log tool calls on the server for audit.
- Rate-limit destructive tools.

## 9. Reference Implementation: jat-feedback

The `<jat-feedback>` custom element implements ATP v1 (modulo missing
`unregisterTools` and `getTools` — see §10 Roadmap).

### 9.1 Reserved internal names

The page-agent core inside the widget registers these DOM-automation tools
by default. Host pages MUST NOT register tools with these names:

```
click_element_by_index
input_text
select_dropdown_option
execute_javascript
```

### 9.2 Architecture notes

- Tools registered via `widget.registerTools()` are stored on the
  `FeedbackPanel` component and passed to `AgentBridge` at construction
  (`feedback/src/lib/agentBridge.ts:39`).
- `AgentBridge.buildRegisteredCustomTools()` converts ATP Tool Definitions
  into the PageAgentCore `customTools` format by wrapping the handler in a
  Zod-permissive execute function and inlining the JSON Schema into the tool
  description (`agentBridge.ts:350-372`). The LLM is guided by the
  description string, not a live schema check.
- Because PageAgentCore uses a macro-tool pattern (all tools merged into one
  "AgentOutput" union), registered tools share the agent's per-step execution
  loop and do not require a separate tool_call interception path.

### 9.3 Known divergences from spec

The current implementation ships §5.1 only. The following are tracked in the
ATP epic (`jat-j9t9i`):

- `unregisterTools()` — not yet implemented.
- `getTools()` — not yet implemented.
- `requiresConfirmation` on host-registered tools — only applied to
  reserved internal DOM tools in current impl.
- `fileInputs` — no file staging yet; see jat-s75su.
- `returns` — not consumed.

## 10. Roadmap

| Version | Additions |
|---------|-----------|
| 1.0 (this doc) | Core schema, registration API, execution protocol. |
| 1.1 | `fileInputs` staging UX, `returns` rich rendering. |
| 1.2 | Streaming tool results (for `longRunning` tools). |
| 2.0 | Breaking: cross-widget tool sharing, required `returns` for typed UIs. |

## 11. References

- [OpenAI function calling](https://platform.openai.com/docs/guides/function-calling)
- [JSON Schema draft 2020-12](https://json-schema.org/draft/2020-12/schema)
- [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) — Key words for requirement levels.
- `feedback/src/lib/agentBridge.ts` — Reference implementation.
- `feedback/src/JatFeedback.svelte` — Custom element host wiring.
- `feedback/README.md` §"registerTools() API Reference" — Public API docs.
- Epic `jat-j9t9i` — Agent Tool Protocol standard (run `jt show jat-j9t9i` for details).
- Prior art: [jat-1qqij memory](../.jat/memory/2026-03-18-jat-1qqij-feedback-page-level-tool-registration.md) — original `registerTools()` implementation.
