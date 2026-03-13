---
name: jat-onboard
description: Onboard a new client project — analyze client docs, create knowledge bases, write Supabase migration, generate PRD and tasktree. Run after jst-new has set up the mechanical scaffolding.
metadata:
  author: jat
  version: "1.0"
---

# /jat:onboard — New Client Onboarding

AI-powered onboarding for new client projects. Handles the steps that need intelligent analysis after `jst-new` has done the mechanical setup.

## Prerequisites

Run `jst-new <project>` first. It creates:
- Project directory cloned from JST template
- JAT project registration
- Standard data tables (team, integrations, open_questions)
- Bootstrap CLAUDE.md
- Initial git commit

## Usage

```
/jat:onboard                           # Interactive — prompts for client docs
/jat:onboard docs/client-prd.md        # Analyze specific doc
/jat:onboard ~/Downloads/intake.pdf    # Analyze from any path
```

---

## STEP 1: Locate Client Documents

Check for input docs in this order:
1. File path provided as argument
2. Files in `docs/` directory
3. Files in `~/Downloads/` matching project name
4. Ask user to provide docs

**Supported formats:** Markdown, PDF, DOCX (converted to .md), plain text

Read ALL provided documents thoroughly before proceeding.

---

## STEP 2: Extract Structured Data

From the client documents, extract:

### 2A: Team Information
Parse out all people mentioned with roles and responsibilities.

```bash
# Populate the team data table
jt data exec "INSERT INTO team (name, role, title, email, decision_authority, portal_role, notes) VALUES (...)" --force
```

### 2B: Integrations Inventory
Identify all external services, APIs, and tools mentioned.
Classify each as: `keep` (integrate), `replacing` (build bespoke), or `new` (we're adding).

```bash
# Populate the integrations data table
jt data exec "INSERT INTO integrations (service, purpose, status, integration_type, auth_method, credentials_status, notes) VALUES (...)" --force
```

### 2C: Open Questions
Identify gaps in the docs — things we need answered before building.
Classify blocking vs non-blocking.

```bash
# Populate the open_questions data table
jt data exec "INSERT INTO open_questions (question, ask_who, impact, blocks, status) VALUES (...)" --force
```

### 2D: Domain-Specific Data Tables
If the domain has structured data (forms, inventory categories, compliance rules), create additional data tables:

```bash
jt data create <table_name> col1:type1 col2:type2 ...
jt data exec "INSERT INTO <table_name> ..." --force
```

---

## STEP 3: Create Knowledge Bases

### 3A: Always-Inject Bases (every agent gets these)

**Project Index** — Context map of all available knowledge:
```bash
jt bases create --name "Project Index" --type manual --always-inject --content "..."
```
Must include:
- One-liner project description
- List of all knowledge bases with IDs and descriptions
- List of all data tables with useful queries
- Key files to read

**Tech Stack** — Architecture and conventions:
```bash
jt bases create --name "Tech Stack" --type manual --always-inject --content "..."
```
Must include:
- Framework, DB, deployment details
- File/directory structure
- User roles and auth model
- Database table summary
- Branding (colors, fonts, tone)
- Critical domain rules that every agent needs

### 3B: On-Demand Bases (pulled when relevant)

Create these based on what the client docs contain. Common ones:

| Base | When to Create | Content |
|---|---|---|
| **Company** | Always | Team, branding, contacts, pricing, social |
| **Integrations** | When external services involved | API details, auth methods, what we keep vs replace |
| **Current State** | When replacing existing systems | What exists, what's broken, what to preserve |
| **Decisions** | Always | Architecture decisions + open questions |
| **Clinical/Legal/Compliance** | When regulated domain | Regulatory rules, form requirements, audit needs |

```bash
jt bases create --name "Company" --type manual --content "..."
jt bases create --name "Decisions & Open Questions" --type manual --content "..."
```

---

## STEP 4: Research External Requirements

If the domain involves regulatory compliance, state forms, or industry standards:

1. **Search the web** for official forms, templates, and requirements
2. **Download PDFs** and extract field specifications
3. **Create a specs document** in `docs/` (e.g., `docs/oha-form-specs.md`)
4. **Populate domain data tables** with structured form/requirement data

This step is critical — client docs often have errors or outdated info about regulatory requirements. Verify against official sources.

---

## STEP 5: Scrape Client Branding

If the client has an existing website:

1. **Fetch the site** and extract: colors, fonts, logo, tagline, tone
2. **Update the Tech Stack base** with branding details
3. **Note any design patterns** to replicate

---

## STEP 6: Write Supabase Migration

Based on extracted requirements, create `supabase/migrations/YYYYMMDD000000_<project>_platform.sql`:

**Standard tables to always include:**
- `pipeline_stages` — client/entity journey stages (seeded with INSERT)
- `audit_log` — compliance trail (user, action, entity, IP, timestamp)

**Domain tables:** Based on what the client needs (CRM, scheduling, forms, inventory, etc.)

**Always include:**
- RLS policies for role-based access
- Indexes on frequently queried columns
- `updated_at` triggers
- Storage buckets for file uploads
- Extend `profiles` table with `role` column if needed

---

## STEP 7: Write PRD

Create `docs/prd.md` structured as:

1. **Overview** — What we're building and why
2. **Tech Stack** — Confirmed stack choices
3. **User Roles** — Who uses the system and how
4. **Branding** — Colors, fonts, tone
5. **Database** — Table summary with references to migration
6. **Features by Sprint** — Organized into 4-6 sprints
   - Sprint 1: Foundation (auth, theme, core data model)
   - Sprint 2-N: Features in dependency order
   - Last sprint: Integrations, polish, launch prep
7. **Non-Goals** — Explicitly out of scope
8. **Open Questions** — From the open_questions table

---

## STEP 8: Generate Tasktree

Use `/jat:tasktree docs/prd.md --project <project>` to convert the PRD into:
- Epics per sprint
- Child tasks with hierarchical IDs
- Cross-epic dependencies
- Priority assignments (P0 foundation, P1 core, P2 nice-to-have)

---

## STEP 9: Final Commit + Report

```bash
git add -A
git commit -m "Complete client onboarding: KBs, migration, PRD, tasktree

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

Output summary:

```
╔══════════════════════════════════════════════════════════════╗
║  CLIENT ONBOARDING COMPLETE: <PROJECT>                       ║
╚══════════════════════════════════════════════════════════════╝

Knowledge Bases:
  Always-inject: Project Index, Tech Stack
  On-demand: [list with IDs]

Data Tables:
  [list tables with row counts]

Database:
  Migration: supabase/migrations/YYYYMMDD_<project>_platform.sql
  Tables: N tables, N RLS policies

Tasktree:
  Epics: N
  Tasks: N (P0: X, P1: X, P2: X)
  Ready now: [list unblocked tasks]

Open Questions for Client:
  [list blocking questions]

Next Steps:
  1. Review PRD with client
  2. Send open questions to client
  3. Create Supabase project and run migration
  4. Start picking up tasks: jt ready
```

---

## Checklist (verify before completing)

- [ ] All team members in `team` data table
- [ ] All integrations classified (keep/replace/new) in `integrations` table
- [ ] Open questions documented with who to ask
- [ ] Project Index base has correct KB IDs and table names
- [ ] Tech Stack base has file structure, roles, branding, domain rules
- [ ] CLAUDE.md is thin bootstrap (< 30 lines)
- [ ] Supabase migration includes RLS, indexes, triggers, audit_log
- [ ] PRD covers all sprints with feature specs
- [ ] Tasktree has proper dependencies (foundation unblocked first)
- [ ] Domain-specific research completed (forms, regulations, etc.)
- [ ] Client branding extracted if website exists
