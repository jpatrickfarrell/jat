# Agent Tool Protocol (ATP)

**Status:** Draft v0.1
**Scope:** Browser-side agent tool registration and execution for embeddable agent widgets.
**Reference implementation:** `jat-feedback` (see epic jat-j9t9i, initial impl in jat-1qqij).

---

## 0. Motivation

Embeddable agent widgets (chat panels, feedback widgets, command bars) run in the user's browser alongside the host page. The page already has what makes the agent useful: authenticated API clients, app state, DOM, loaded libraries, and the user's session.

ATP is the contract between a **host page** and an **agent widget** for exposing page-native capabilities as callable tools. The page declares tools; the widget's LLM agent can call them during a reasoning loop; handlers execute browser-side in the page origin; results feed back into the conversation.

ATP is deliberately thin. It does not specify the LLM, the transport to the LLM provider, or the agent's reasoning loop. It specifies only the page↔widget interface.

### Goals

- Zero server changes when a page wants to expose a new capability to its agent.
- No credential duplication — tools run in the logged-in user's browser context.
- Conversational field collection — the LLM gathers required arguments in dialogue rather than the page rendering forms.
- Work unchanged on top of the two dominant agent-tool encodings: OpenAI-style `tools` + `tool_use`, and packed MacroTool union schemas (e.g. page-agent's `AgentOutput` with `tool_choice` lock).

### Non-goals

- Server-side tool execution (use normal APIs).
- Cross-origin tool registration (tools are scoped to the embedding page's origin).
- Transport-layer security between widget and LLM provider (that's the host's proxy's job).

---

## 1. Terminology

| Term | Meaning |
|------|---------|
| **Host page** | The page the widget is embedded in. Owns the tools. |
| **Widget** | The embeddable UI component (web component, iframe, or script-injected DOM) that contains the agent. |
| **Agent** | The LLM-driven reasoning loop inside the widget. |
| **Tool** | A named, parameterized capability the agent can invoke. |
| **Handler** | The JavaScript function the host page provides; runs when the tool is called. |
| **Tool definition** | The JSON-schema-described metadata + handler pair. |
| **Tool schema** | The serializable part of the definition (no handler). Shipped to the LLM. |
| **Registration** | The host telling the widget "these tools exist." |
| **Execution** | The widget calling the host's handler, obtaining a result, and returning it to the LLM. |

---

## 2. Tool Definition Schema

A tool definition is the unit the host page hands to the widget.

```typescript
interface ToolDefinition {
  /** Unique tool name. snake_case. 1-64 chars, [a-z][a-z0-9_]*. */
  name: string;

  /** Natural-language description — tells the LLM what the tool does and when to use it. */
  description: string;

  /** JSON Schema (draft 2020-12 compatible subset) for the tool's arguments. */
  parameters: JSONSchema;

  /** Browser-side function invoked when the LLM calls the tool. */
  handler: (args: Record<string, unknown>) => Promise<unknown> | unknown;

  /** Optional browser extensions (see §2.2). */
  options?: ToolOptions;
}

interface ToolOptions {
  /** If true, widget shows a confirmation UI before invoking the handler. */
  requiresConfirmation?: boolean;

  /** Declares the tool may accept file uploads; see §5. */
  fileInputs?: FileInputSpec[];

  /** Hint that the handler may take >5s; widget shows progress UI. */
  longRunning?: boolean;

  /** Display name for confirmation / history UIs. Falls back to `name`. */
  displayName?: string;

  /** Group label for UI ("Account", "Data", "Admin"). */
  category?: string;
}

interface FileInputSpec {
  /** Parameter name in `parameters` the file(s) are attached to. */
  parameter: string;

  /** MIME type hints (e.g. ["image/*", "application/pdf"]). */
  accept?: string[];

  /** Allow multiple files? Default false. */
  multiple?: boolean;

  /** Max file size in bytes. Default 10 MB. */
  maxSize?: number;
}
```

### 2.1 `parameters` field

- **Format**: JSON Schema object with `type: "object"`. Use `{ type: "object", properties: {} }` for no-arg tools.
- **Supported keywords**: `type`, `properties`, `required`, `enum`, `description`, `default`, `items`, `minimum`, `maximum`, `minLength`, `maxLength`, `pattern`, `format`, `oneOf`, `anyOf`.
- **Not supported**: `$ref`, remote schema refs, arbitrary external validators. Implementations MUST be self-contained.
- **Why JSON Schema**: It is the native tool-argument format for every major LLM provider (OpenAI, Anthropic, Gemini, etc.), so the widget can pass `parameters` through to the LLM without translation.

### 2.2 Browser extensions — rationale

These are ATP-specific and NOT part of the schema sent to the LLM. The widget consumes them for UX.

- `requiresConfirmation` — for destructive or costly tools. Widget MUST render a confirmation step before calling the handler.
- `fileInputs` — declares file-attachment semantics. The LLM asks the user for files by parameter name; the widget renders a file picker; the handler receives `{ files: File[] }` (or the platform's equivalent) merged into `args`.
- `longRunning` — advisory. Widget MAY render a persistent progress indicator.
- `displayName` / `category` — for the widget's own UIs (history panel, tool inspector).

### 2.3 Tool-naming rules

- Unique within a widget instance. Re-registering the same `name` replaces the prior definition (see §3.1).
- MUST match `^[a-z][a-z0-9_]{0,63}$`. No hyphens, no uppercase — most LLM tool-calling APIs reject other patterns.
- Reserved prefixes: `atp_*`, `_*`. Implementations MAY add built-in tools under these prefixes.

---

## 3. Registration API

The host page registers tools on the widget's DOM element. The widget MUST expose the following methods.

### 3.1 `registerTools(tools)`

```typescript
element.registerTools(tools: ToolDefinition[]): void
```

**Semantics (additive merge):**

- Tools are merged into the widget's registry. Subsequent calls add to prior calls.
- If a newly registered tool has the same `name` as an existing one, the new definition replaces the old.
- Validation happens synchronously. If any tool in the array is invalid (missing `name`, invalid `parameters`, etc.), the widget MUST throw and register **none** of the tools in that call (all-or-nothing).

**Why additive:** pages are modular. Global tools live in the root layout; per-page tools live in route components. Both register independently; the widget sees the union.

### 3.2 `unregisterTools(names)`

```typescript
element.unregisterTools(names: string[]): void
```

Removes tools by name. Unknown names are silently ignored (allows bulk cleanup without race-checking).

**Lifecycle use:** page components SHOULD call `unregisterTools` on unmount for tools registered on mount. Global tools SHOULD NOT be unregistered.

### 3.3 `getTools()`

```typescript
element.getTools(): ToolSchema[]
```

Returns the current tool schemas (no handlers — handlers are never exposed to callers; they live only inside the widget). Useful for debug panels and integration tests.

```typescript
type ToolSchema = Omit<ToolDefinition, "handler"> & {
  /** Read-only: order in registration. */
  registeredAt: number;
};
```

### 3.4 Registration lifecycle

```
  Widget element connects to DOM
          │
          ▼
  Host calls element.registerTools([...])   ◄─── tools accumulate
          │
          ▼
  User opens agent UI → first LLM call
          │
          ▼
  Widget serializes current registry to LLM request
          │
          ▼
  LLM picks a tool → widget calls handler → result → next step
          │
          ▼
  Host may register/unregister during session (widget re-serializes on each request)
```

**Timing contract:**

- Tools registered before the user opens the agent UI are always available.
- Tools registered mid-session MUST appear in the NEXT LLM request, not mid-request. Implementations MUST NOT mutate the in-flight request payload.
- `unregisterTools` applied mid-session: if the LLM has already emitted a tool_use for an unregistered tool, the widget MUST return a structured error (see §4.4) rather than silently hanging.

### 3.5 Idempotency and re-mount

The widget element may be removed and re-inserted (SPA navigation, conditional rendering). On `disconnectedCallback`, the tool registry is cleared. Hosts MUST re-register on each mount. Conversely, this means `onMount` is the correct hook for `registerTools`.

---

## 4. Execution Protocol

Execution bridges three parties: the **host page** (handlers), the **widget** (agent loop + serializer), and the **LLM** (reasoning). ATP specifies only the host↔widget contract.

### 4.1 Happy path

```
  ┌────────────┐         ┌────────────┐         ┌────────────┐
  │ Host page  │         │   Widget   │         │    LLM     │
  │ (handlers) │         │  (agent)   │         │ (provider) │
  └─────┬──────┘         └──────┬─────┘         └──────┬─────┘
        │                       │                      │
        │ registerTools([...])  │                      │
        │──────────────────────►│                      │
        │                       │ serialize schemas    │
        │                       │  + user turn         │
        │                       │─────────────────────►│
        │                       │                      │
        │                       │◄──── tool_use ───────│
        │                       │ (name, args JSON)    │
        │                       │                      │
        │                       │ lookup handler       │
        │  handler(args)        │                      │
        │◄──────────────────────│                      │
        │                       │                      │
        │  result (JSON-able)   │                      │
        │──────────────────────►│                      │
        │                       │ wrap as tool_result  │
        │                       │─────────────────────►│
        │                       │                      │
        │                       │◄── next tool_use OR  │
        │                       │     final answer ────│
```

### 4.2 Serialization to the LLM

The widget converts each registered `ToolDefinition` to the provider's native tool format. The conversion MUST:

- Use only `name`, `description`, and `parameters` — **never** serialize `handler` or `options.*`.
- Strip schema keys the provider rejects (e.g. `$schema`, `examples`) if needed.

**Two supported packing modes:**

1. **Direct function-calling** (OpenAI, Anthropic, Gemini): each tool becomes a first-class entry in the request's `tools` array. The LLM emits per-tool `tool_use` / `function_call` blocks.
2. **Packed MacroTool** (page-agent `AgentOutput`, other structured-output frameworks): all tools are merged into a single union-schema "mega-tool" with `tool_choice` forced to it. The LLM emits one response that names the chosen tool inline.

ATP implementations MUST support at least one of these. The MacroTool mode exists because some agent frameworks (notably `@page-agent/core`) lock `tool_choice` — an OpenAI-style tools array is visible but uncallable in that mode. Registered tools MUST be packed into the MacroTool union on such frameworks. See jat-1qqij.3 for the concrete adapter.

### 4.3 Handler invocation

When the widget receives a tool_use for tool `T` with args `A`:

1. Look up handler in registry. If missing → structured error (§4.4 `unknown_tool`).
2. Validate `A` against `T.parameters`. On failure → structured error (`invalid_args`).
3. If `T.options?.requiresConfirmation`, render confirmation UI with the args visible. On user cancel → structured error (`user_cancelled`).
4. `await T.handler(A)`. Catch:
    - Returned value → `tool_result` (see §4.5).
    - Thrown Error → structured error (`handler_error` with `message`).
    - Timeout (default 30s; overridable via `options.longRunning` extending to 5 min) → `handler_timeout`.
5. Emit `tool_result` to LLM and continue the agent loop.

Handlers run on the event loop of the host page. They MAY touch the DOM, call page stores, make `fetch` calls, read cookies the origin has access to — everything the logged-in user's browser can do.

### 4.4 Structured errors

On any failure, the widget MUST send a `tool_result` whose payload is:

```json
{
  "error": {
    "code": "unknown_tool" | "invalid_args" | "user_cancelled" | "handler_error" | "handler_timeout",
    "message": "human-readable explanation"
  }
}
```

Errors go to the LLM as results, **not** as HTTP errors. This lets the LLM recover ("the tool didn't work — I'll try a different approach"). Throwing from the handler is the normal signal for business-logic failure; it is not exceptional.

### 4.5 Result serialization

The handler's return value is passed to `JSON.stringify`. It MUST be JSON-serializable.

- `undefined` → the widget substitutes `{ ok: true }`.
- Symbols, functions, BigInt → widget MUST coerce or reject with `handler_error` (`result_not_serializable`).
- Large results (>1 MB): widget MAY truncate with a notice. Handlers SHOULD return summaries, not raw datasets.

---

## 5. Conversational Collection Pattern

This is where ATP earns its keep over traditional forms.

### 5.1 Required-field dialog

When the LLM decides to call a tool but doesn't yet have all `required` arguments, it produces text asking the user for them — one per turn, or batched, whichever feels natural. The widget does not render forms. The user types answers; the LLM extracts and validates; when all required fields are filled, the LLM emits the tool_use.

**Example — tool declares:**

```json
{
  "name": "update_report_status",
  "parameters": {
    "type": "object",
    "properties": {
      "report_id": { "type": "string", "description": "UUID of the report" },
      "status":    { "type": "string", "enum": ["open","in_progress","resolved"] }
    },
    "required": ["report_id", "status"]
  }
}
```

**Conversation:**

> **User:** close report abc123
> **LLM:** I'll update that report. What status?
> **User:** resolved
> **LLM:** *[tool_use: update_report_status { report_id: "abc123", status: "resolved" }]*
> *[tool_result: { ok: true }]*
> **LLM:** Done — report marked resolved.

The `description` on each property is load-bearing. Clear descriptions let the LLM paraphrase requests into clean arguments. Vague descriptions cause the LLM to ask redundant questions.

### 5.2 File uploads

When a tool declares `fileInputs: [{ parameter: "attachment", accept: ["image/*"] }]`, the widget MUST:

1. Advertise the file parameter to the LLM via the `description` (e.g. "upload a screenshot").
2. When the LLM asks for the file, render a file-picker inline in the conversation.
3. On pick, attach the File object to the args map under the declared `parameter` name.
4. Hand the File to the handler directly (browser-native object; handlers can `FileReader` it, POST it, or whatever).

Non-goal: sending file contents through the LLM. The file stays in the browser; the LLM only sees that the upload happened.

### 5.3 Confirmation step

For `requiresConfirmation: true` tools, the widget MUST pause between tool_use and handler invocation. The confirmation UI MUST display the tool's `displayName` (or `name`) and the exact args the LLM produced. The user chooses **Confirm** or **Cancel**. Cancel emits `user_cancelled` (§4.4).

Do not fold confirmation into the LLM turn ("Are you sure?" in chat) — the LLM could then convince itself the user said yes. Confirmation MUST be an out-of-band UI gesture.

### 5.4 Multi-tool flows

No special protocol support. Flows compose naturally: the LLM calls tool A, observes the result, calls tool B. ATP is stateless at the protocol layer; any stateful orchestration lives inside the LLM's reasoning, not inside the widget.

---

## 6. Security Model

### 6.1 Trust boundary

Handlers execute in the **page origin**. They are just JavaScript that the host page loaded. An ATP tool can do nothing more than a `<button onclick>` in the same page could.

The security boundary is the page's origin, not the widget.

### 6.2 No escalation

- Handlers run under the logged-in user's session. They inherit cookies, localStorage, Authorization headers — exactly as a normal click-handler would.
- The LLM never sees credentials, tokens, or cookies unless a handler explicitly returns them (don't do that).
- The widget never proxies handler execution through a server. All execution is in the browser.

### 6.3 LLM-driven action risks

The LLM can call any registered tool. The host page is responsible for:

1. **Only registering tools the user should be able to invoke** — tool registration should be behind the same auth gates as UI actions. A page that only shows the admin tool to admins should only `registerTools([...adminTools])` for admins.
2. **Marking destructive tools with `requiresConfirmation: true`** — prompt-injection resistance. An attacker who gets malicious instructions into the LLM's context (via a page's untrusted content, an email the agent reads, etc.) still cannot silently destroy data.
3. **Validating args in the handler itself**, not trusting schema validation alone. The schema is shipped to the LLM as hints; the handler is the actual enforcement boundary.

### 6.4 Cross-origin

ATP tools are scoped to the widget's embedding page. A widget embedded on `a.example.com` does not see tools registered on `b.example.com`, even if both embed the same widget bundle. Tool state lives on the widget's DOM element instance; there is no shared global registry.

### 6.5 What ATP does NOT protect against

- XSS in the host page → compromised tools. If the host is XSSed, everything is compromised; ATP changes nothing.
- Malicious handlers. If the host page author writes a handler that deletes data without confirmation, ATP can't save them.
- LLM provider compromise. A malicious LLM could emit any tool_use it likes. `requiresConfirmation` is the only defense; use it on destructive tools.

---

## 7. Minimal Conformance Checklist

An implementation conforms to ATP v0.1 if it:

- [ ] Exposes `registerTools`, `unregisterTools`, `getTools` on the widget's DOM element.
- [ ] Treats `registerTools` calls as additive and validates the full array before mutating state.
- [ ] Converts registered tools to the LLM provider's tool format, supporting at least one of direct function-calling or MacroTool packing.
- [ ] Invokes handlers with validated args and returns either the result or a structured error (§4.4) to the LLM.
- [ ] Honours `requiresConfirmation` with an out-of-band UI gesture.
- [ ] Scopes the registry to the widget element instance; clears on disconnect.
- [ ] Does not expose `handler` via `getTools()` or any other surface.

---

## 8. Reference Implementation Notes

`jat-feedback` (the `<jat-feedback>` web component) is the reference implementation.

- Registration surface: `onMount` assignment via `$host()` to the custom-element root.
- Storage: `registeredTools` array, threaded `JatFeedback → FeedbackPanel → AgentBridge`.
- LLM packing: `buildRegisteredCustomTools()` in `src/lib/agentBridge.ts` converts `ToolDefinition[]` into `@page-agent/core` `customTools`, which the core then packs into the `AgentOutput` MacroTool union schema.
- Handler bridge: `customTools` wrappers get `this` bound to PageAgentCore; handlers run without that binding.
- Errors: handler throws → error message becomes the tool_result payload → LLM recovers on next turn.

Gaps vs. this spec (to address in follow-up tasks under jat-s75su):

- `unregisterTools` and `getTools` are not yet implemented on the element.
- `requiresConfirmation` is currently honoured only for built-in tools (click, execute_javascript) via `APPROVAL_REQUIRED_TOOLS`; extending to custom tools is a clean next step.
- `fileInputs` is not implemented.
- Arg validation currently happens only at the MacroTool Zod schema layer — explicit pre-handler validation with `invalid_args` error codes should be added.

---

## 9. Open Questions

1. **Versioning.** Do we need an ATP version negotiation between host and widget? For now, v0.1 is single-version. If we break compatibility, consider a `getProtocolVersion()` method.
2. **Streaming results.** For long-running tools, should the handler be able to stream partial results to the LLM? v0.1 is request/response only.
3. **Tool composition.** Should a tool be able to register sub-tools during execution (e.g. a "setup" tool that unlocks more tools)? Currently expressible via `registerTools` from inside a handler, but the ordering contract with the in-flight LLM request is murky.
4. **Cross-widget registries.** Multiple widget instances on the same page — should they share tools? Currently no. Probably no.

---

## 10. Changelog

- **v0.1** (2026-04-24) — Initial draft. Canonicalizes the as-built jat-feedback surface plus proposed `unregisterTools` / `getTools` / `requiresConfirmation` / `fileInputs` extensions.
