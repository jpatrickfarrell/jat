---
argument-hint: <projectId> [--dry-run]
---

Generate feature academy videos for a project using Remotion. Synthesizes tasks into features doc, storyboard, and parallel video renders.

# Feature Videos: Tasks → Features → Storyboard → Remotion Videos

**Use this command when:**
- A project is feature-complete and ready for client demo videos
- You want to generate explainer/academy videos for each feature
- You need a comprehensive features document synthesized from task history

**What this does:**
1. Queries all closed tasks for the project
2. Synthesizes features into `<projectId>-features.md` (curriculum/academy doc)
3. Creates `<projectId>-storyboard.md` (video scene breakdowns per feature)
4. Generates `<projectId>-remotion-<feature>.json` configs for each video
5. Spawns parallel subagents to build and render each Remotion video

**Usage:**
- `/jat:feature-videos meadow` — Full pipeline for the meadow project
- `/jat:feature-videos meadow --dry-run` — Generate docs + configs only, skip video rendering

**Output files** (written to `<projectDir>/docs/videos/`):
```
docs/videos/
├── <projectId>-features.md              ← Feature curriculum
├── <projectId>-storyboard.md            ← Video storyboard
├── <projectId>-remotion-<feature1>.json  ← Remotion config per feature
├── <projectId>-remotion-<feature2>.json
└── ...
```

**Rendered videos** (written to `<projectDir>/static/videos/`):
```
static/videos/
├── <feature1>.mp4
├── <feature1>-poster.jpg
├── <feature2>.mp4
└── ...
```

---

## STEP 1: Resolve Project

Parse `$ARGUMENTS` to extract `projectId` and flags.

```bash
# Get project path from JAT config
cat ~/.config/jat/projects.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
p = data.get('projects', {}).get('PROJECT_ID', {})
print(p.get('path', 'NOT_FOUND'))
"
```

If project not found, list available projects and ask user to pick one.

Verify the project directory exists and has a `CLAUDE.md` (confirming it's a real project).

---

## STEP 2: Query Project Tasks

```bash
cd <projectDir> && jt list --json
```

Filter to **closed tasks only** (completed work = real features). Exclude:
- Chores (type=chore)
- Bug-only fixes that don't represent user-facing features
- Infrastructure/setup tasks (unless they enable a user-visible feature)

Group tasks by epic (parent task). Tasks without a parent epic become standalone features.

**Output:** A structured list of features, each with:
- Feature name (derived from epic title or task title)
- Description (synthesized from task descriptions)
- Key capabilities (bullet points from child tasks)
- User benefit (why this matters to the end user)

---

## STEP 3: Write Features Document

Write `<projectDir>/docs/videos/<projectId>-features.md`

This is a **curriculum/academy document** — it tells the story of the app's capabilities in a way that makes sense to end users. Structure:

```markdown
# <ProjectName> Feature Academy

## Overview
Brief description of what the app does and who it's for.

## Features

### 1. <Feature Name>
**What it does:** One-sentence summary
**Why it matters:** User benefit

**Capabilities:**
- Capability 1 (from task descriptions)
- Capability 2
- ...

**User flow:** Brief walkthrough of how a user interacts with this feature

### 2. <Feature Name>
...
```

**Writing guidelines:**
- Write from the user's perspective, not the developer's
- Use plain language (no tech jargon unless the audience is technical)
- Group related capabilities logically
- Order features by user journey (onboarding → core workflow → advanced features)
- Each feature should be self-contained enough to be a standalone video topic

---

## STEP 4: Write Storyboard

Write `<projectDir>/docs/videos/<projectId>-storyboard.md`

Break each feature into a **short video story** (30-45 seconds each). Each story has 4-6 scenes.

```markdown
# <ProjectName> Video Storyboard

## Video 1: <Feature Name>
Duration: ~40s (1200 frames at 30fps)

### Scene 1: Hook (0-7s, frames 0-210)
- Visual: [What appears on screen]
- Text: [Headlines, labels]
- Animation: [Entry effects]

### Scene 2: The Problem (7-15s, frames 210-450)
- Visual: [Pain point illustration]
- Text: [Problem statement]

### Scene 3: The Solution (15-27s, frames 450-810)
- Visual: [Feature demo mockup]
- Text: [Key capabilities]
- Animation: [Staggered list items, counting numbers, etc.]

### Scene 4: The Result (27-35s, frames 810-1050)
- Visual: [Outcome/dashboard]
- Text: [Key metric or benefit]

### Scene 5: CTA (35-40s, frames 1050-1200)
- Visual: [App logo + call to action]
- Text: [Get started message]

---

## Video 2: <Feature Name>
...
```

**Storyboard guidelines:**
- Each video should work standalone (no dependency on other videos)
- Use the project's brand colors (extract from theme/CSS)
- Reference Remotion animation recipes from shared/remotion-video.md
- Include specific text content, not placeholders
- Specify frame ranges and durations
- Match the tone of the project (professional, playful, clinical, etc.)

---

## STEP 5: Generate Remotion Configs

For each video in the storyboard, write a JSON config file:

`<projectDir>/docs/videos/<projectId>-remotion-<featureSlug>.json`

```json
{
  "projectId": "<projectId>",
  "projectPath": "<projectDir>",
  "featureName": "<Feature Name>",
  "featureSlug": "<feature-slug>",
  "videoName": "<feature-slug>",
  "duration": {
    "seconds": 40,
    "fps": 30,
    "totalFrames": 1200
  },
  "theme": {
    "bg": "#0a0a0f",
    "bgCard": "#141420",
    "accent": "#<project-accent-color>",
    "text": "#f5f5f5",
    "textDim": "#a0a0b0",
    "success": "#10b981",
    "border": "#2a2a3e"
  },
  "scenes": [
    {
      "id": "hook",
      "title": "Scene 1: Hook",
      "startFrame": 0,
      "durationFrames": 210,
      "overlapFrames": 0,
      "content": {
        "headline": "Exact headline text",
        "subtitle": "Subtitle text",
        "visual": "Description of what to render"
      },
      "animations": {
        "headline": "tracking-in-expand",
        "subtitle": "fade-in-bottom",
        "entrance": "slide-in-fwd-center"
      }
    },
    {
      "id": "problem",
      "title": "Scene 2: The Problem",
      "startFrame": 180,
      "durationFrames": 270,
      "overlapFrames": 30,
      "content": {
        "headline": "...",
        "items": ["Pain point 1", "Pain point 2", "Pain point 3"],
        "visual": "Description of what to render"
      },
      "animations": {
        "items": "staggered-slide-in",
        "itemDelay": 12
      }
    }
  ],
  "output": {
    "videoPath": "static/videos/<feature-slug>.mp4",
    "posterPath": "static/videos/<feature-slug>-poster.jpg",
    "posterFrame": "auto"
  },
  "remotionSkill": "shared/remotion-video.md"
}
```

---

## STEP 6: Spawn Video Subagents (skip if --dry-run)

For each JSON config, spawn a subagent using the Agent tool to build the Remotion video.

**IMPORTANT: Spawn ALL video agents in parallel** using multiple Agent tool calls in a single message.

Each subagent prompt should be:

```
You are building a Remotion video for the <projectName> project.

## Your Config
<paste full JSON config>

## Remotion Reference
@shared/remotion-video.md

## Instructions

1. Create the Remotion project at `<projectDir>/video/<featureSlug>/`
   - If `<projectDir>/video/` doesn't exist, create it with the boilerplate from remotion-video.md
   - If it already exists (from a previous feature video), reuse the node_modules

2. Create these files:
   - `src/index.ts` — registerRoot entry point
   - `src/Root.tsx` — Composition definition (use duration from config)
   - `src/theme.ts` — Theme from config
   - `src/MainVideo.tsx` — Sequence all scenes with overlaps
   - `src/scenes/Scene1.tsx` through `src/scenes/SceneN.tsx` — One per scene in config

3. Each scene should:
   - Use the content (headlines, items, visuals) from the config
   - Apply the animations specified in the config
   - Follow the scene pattern template from remotion-video.md
   - Use font sizes from the size tuning guide (embedded playback)
   - Exit with fade-out in the last 30 frames

4. Install dependencies: `cd <projectDir>/video/<featureSlug> && npm install`

5. Render: `npx remotion render src/index.ts MainVideo out/<featureSlug>.mp4 --codec h264`

6. Render poster: `npx remotion still src/index.ts MainVideo out/<featureSlug>-poster.jpg --frame <posterFrame> --image-format jpeg`

7. Copy to static:
   ```bash
   mkdir -p <projectDir>/static/videos
   cp out/<featureSlug>.mp4 <projectDir>/static/videos/
   cp out/<featureSlug>-poster.jpg <projectDir>/static/videos/
   ```

Report back: video file path, file size, render time, any errors.
```

**Shared node_modules optimization:**
If rendering multiple videos for the same project, the first subagent installs `node_modules`. Subsequent agents can symlink or reuse if the directory structure allows. However, since agents run in parallel, each should be self-contained — install independently and let npm cache handle deduplication.

---

## STEP 7: Report Results

After all subagents complete, output:

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    FEATURE VIDEOS: <PROJECT_NAME>                        ║
╚══════════════════════════════════════════════════════════════════════════╝

📄 Features Document: docs/videos/<projectId>-features.md
📋 Storyboard: docs/videos/<projectId>-storyboard.md

🎬 Videos Generated:
  ✅ <feature-1>  → static/videos/<feature-1>.mp4 (X.XMB, XXs render)
  ✅ <feature-2>  → static/videos/<feature-2>.mp4 (X.XMB, XXs render)
  ❌ <feature-3>  → FAILED: <error message>
  ...

📁 Remotion Configs: docs/videos/<projectId>-remotion-*.json

Total: X videos rendered, Y failed
```

If `--dry-run`:
```
╔══════════════════════════════════════════════════════════════════════════╗
║               FEATURE VIDEOS (DRY RUN): <PROJECT_NAME>                  ║
╚══════════════════════════════════════════════════════════════════════════╝

📄 Features Document: docs/videos/<projectId>-features.md
📋 Storyboard: docs/videos/<projectId>-storyboard.md
📁 Remotion Configs: X configs generated in docs/videos/

To render videos, run: /jat:feature-videos <projectId>
```

---

## Example: Meadow

```bash
/jat:feature-videos meadow
```

**Expected features (from 89 tasks):**
1. **Role-Based Authentication** — Client, facilitator, and admin roles with secure access
2. **Client CRM & Pipeline** — Track clients through intake stages
3. **Health Intake & AI Risk Engine** — OHA forms with AI-powered risk assessment
4. **Client Portal** — Dashboard, OHA, community access, journal, progress timeline
5. **Facilitator Portal** — Client management, session notes, scheduler, OHA review
6. **Admin Operations** — Metrics dashboard, inventory tracking, facilitator payouts
7. **Session Management** — Scheduling, prep content, readiness checklists, recap emails
8. **Smart Notifications** — Email automation, reminders, alerts
9. **Booking System** — Session booking with calendar integration
10. **Messaging** — Client-facilitator secure messaging
11. **Theme Customization** — Admin theme editor with live preview

Each becomes a 30-45s explainer video.

---

## Brand Color Extraction

To match the project's theme, check these locations:
1. `<projectDir>/src/app.css` — DaisyUI theme colors
2. `<projectDir>/tailwind.config.*` — Custom colors
3. `~/.config/jat/projects.json` — Project `active_color`
4. `<projectDir>/src/lib/theme.ts` or similar

Extract the primary/accent color and map to the Remotion theme object.

---

## Error Handling

- **No closed tasks:** Warn and ask if user wants to include open/in-progress tasks too
- **Project not found:** List available projects
- **Remotion not installed globally:** Each subagent installs locally via npm
- **Render failure:** Report which video failed and why, continue with others
- **Too many features:** If >15 features detected, ask user to confirm or filter

---

## Best Practices

1. **Feature synthesis quality matters most** — the features doc drives everything downstream
2. **Videos should be self-contained** — each one tells a complete story
3. **Use specific content** — real feature names, real benefits, not generic placeholder text
4. **Match project tone** — clinical for healthcare, professional for construction, playful for consumer
5. **Keep videos short** — 30-45s max, attention spans are limited
6. **Parallel rendering** — spawn all video agents at once for maximum throughput
