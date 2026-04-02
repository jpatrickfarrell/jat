# `jat.config.json` — Project Configuration Standard

Any project can ship a `jat.config.json` at its root to tell JAT how to set it up. When JAT detects this file during project onboarding it pre-fills the wizard fields, prompts for the declared secrets, and automatically wires up the listed integrations.

This is how JST, or any future tech-stack template, declares itself to JAT. No JAT source changes required to support a new stack.

---

## File location

Place `jat.config.json` at the repository root:

```
my-project/
├── jat.config.json   ← here
├── src/
└── package.json
```

---

## Full schema

```jsonc
{
  // Schema version — always 1 for now
  "version": 1,

  // Human-readable display name (shown in wizard)
  "name": "My Project",

  // Short description
  "description": "...",

  // ── Dev server ────────────────────────────────────────────────────────────
  "port": 5173,
  "devCommand": "npm run dev",
  "serverPath": "/",          // URL path prefix for the IDE proxy
  "agentProgram": "claude-code",

  // ── Secrets ───────────────────────────────────────────────────────────────
  // Secrets the project needs. Shown as form fields during onboarding.
  // Stored as jat-secrets under: {projectKey}-{key}
  "secrets": [
    {
      "key": "supabase-url",           // Used as: {projectKey}-supabase-url
      "label": "Supabase Project URL",
      "type": "url",                   // url | secret | string | select
      "required": true,
      "placeholder": "https://xxx.supabase.co",
      "description": "Your Supabase project URL",
      "group": "Supabase"              // Groups related secrets under a heading
    }
  ],

  // ── Integrations ──────────────────────────────────────────────────────────
  // Ingest integrations to set up. Each maps to an ingest adapter type.
  "integrations": [
    {
      "id": "feedback",               // Integration ID suffix: {projectKey}-{id}
      "type": "supabase",             // Matches ingest adapter type
      "label": "User Feedback",
      "description": "...",
      "enabled": true,                // Default enabled state in wizard

      // Secret keys (from above) required before this integration can be set up
      "requires": ["supabase-url", "supabase-service-role-key"],

      "pollInterval": 120,            // Seconds between polls
      "taskDefaults": {
        "type": "bug",
        "priority": 2,
        "labels": ["feedback"]
      },

      // Adapter-specific config.
      // Two interpolation forms are supported:
      //   "$key"  → replaced with the VALUE of secret {projectKey}-{key}
      //   "@key"  → replaced with the KEY NAME "{projectKey}-{key}"
      //             (used when the adapter stores a secret name, not the value)
      "config": {
        "projectUrl": "$supabase-url",
        "secretName": "@supabase-service-role-key",
        "table": "feedback_reports"
      },

      "automation": {
        "action": "delay",
        "command": "/jat:start",
        "delay": 5,
        "delayUnit": "minutes"
      }
    }
  ]
}
```

---

## Secret types

| type     | UI control   | Notes                             |
|----------|--------------|-----------------------------------|
| `string` | Text input   | General text, URLs, IDs           |
| `url`    | URL input    | Validated URL format              |
| `secret` | Password input | Hidden by default              |
| `select` | Dropdown     | Requires `options: [{value, label}]` |

---

## Config interpolation in `integration.config`

When JAT builds an integration source it processes each value in `config`:

| Form       | Example in config         | Result in integrations.json                       |
|------------|---------------------------|---------------------------------------------------|
| `"$key"`   | `"$supabase-url"`         | Value of `jat-secret {projectKey}-supabase-url`   |
| `"@key"`   | `"@supabase-service-role-key"` | The string `"{projectKey}-supabase-service-role-key"` |
| literal    | `"feedback_reports"`      | Passed through as-is                              |
| object/array | `[{"field":"status"}]` | Passed through as-is                              |

Use `$key` when the adapter needs the actual value (e.g. a URL or account ID).  
Use `@key` when the adapter stores the jat-secret key name so it can retrieve the credential at poll time (e.g. `secretName` in the Supabase and Cloudflare adapters).

---

## Wizard behaviour when detected

1. **Path resolved** (git clone success or local path validated) → JAT fetches `jat.config.json` from the project root via `GET /api/projects/config?path=...`
2. **Wizard fields pre-filled** — `port`, `devCommand`, `name` (if not already set by user) come from the config
3. **Review step — Integrations section** — lists every integration declared in the config as a labelled checkbox (pre-checked if `enabled: true`)
4. **Secret fields** — for each checked integration, JAT shows only the `requires` secrets that haven't been filled yet (secrets are grouped)
5. **On submit** — `POST /api/projects/setup-integrations` stores secrets and creates integration sources

---

## Example: minimal single-service config

```json
{
  "version": 1,
  "name": "My Node API",
  "port": 3000,
  "devCommand": "npm run dev",
  "secrets": [
    {
      "key": "stripe-key",
      "label": "Stripe Secret Key",
      "type": "secret",
      "required": false,
      "group": "Stripe"
    }
  ],
  "integrations": []
}
```

---

## API reference

### `GET /api/projects/config?path=<project-path>`

Reads and returns the parsed `jat.config.json` from the given project path.

**Response:**
```json
{ "success": true, "config": { ... } }
// or
{ "success": false, "error": "No jat.config.json found" }
```

### `POST /api/projects/setup-integrations`

Stores secrets and creates/updates integration sources.

**Body:**
```json
{
  "projectKey": "myapp",
  "secrets": {
    "supabase-url": "https://xxx.supabase.co",
    "supabase-service-role-key": "eyJ..."
  },
  "integrations": [
    {
      "id": "feedback",
      "type": "supabase",
      "requires": ["supabase-url", "supabase-service-role-key"],
      "pollInterval": 120,
      "taskDefaults": { "type": "bug", "priority": 2, "labels": ["feedback"] },
      "config": {
        "projectUrl": "$supabase-url",
        "secretName": "@supabase-service-role-key",
        "table": "feedback_reports"
      },
      "automation": { "action": "delay", "command": "/jat:start", "delay": 5, "delayUnit": "minutes" }
    }
  ]
}
```

**Response:**
```json
{ "success": true, "steps": ["Stored secret supabase-url", "Created integration myapp-feedback"], "integrations": ["myapp-feedback"] }
```

---

## Adding `jat.config.json` to your project

1. Create `jat.config.json` at the repo root using the schema above
2. Commit it — JAT reads it from the working tree after clone
3. When a user adds your repo to JAT, the wizard will automatically detect it

No JAT code changes needed. Any ingest adapter type that exists in `tools/ingest/adapters/` or `~/.config/jat/ingest-plugins/` can be referenced by `type`.
