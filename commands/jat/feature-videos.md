---
argument-hint: <projectId> [--dry-run] [--only <feature>] [--redo-storyboard] [--no-voice]
---

Generate feature academy videos for a project using Remotion. Synthesizes agent memories into features doc, storyboard, voiceover, screenshots, and parallel video renders. Also generates academy + video gallery routes for the app.

# Feature Videos: Memories → Features → Storyboard → Screenshots → Voiceover → Videos → Routes

**Use this command when:**
- A project is feature-complete and ready for client demo videos
- You want to generate explainer/academy videos for each feature
- You need a comprehensive features document synthesized from completed work

**What this does:**
1. Resolves the project and gathers context
2. **Features subagent** → reads all `.jat/memory/*.md` → writes `<projectId>-features.md`
3. **Storyboard subagent** → reads features doc → writes storyboard + remotion JSON configs + narration scripts
4. **Screenshot subagent** → starts dev server, captures real app UI for each feature
5. **Voiceover subagent** → sends narration scripts to ElevenLabs TTS → generates audio files
6. **Video subagents** (parallel) → one per feature → builds Remotion scenes with screenshots + audio → renders MP4
7. **Tour subagent** → combines best scenes into a master product tour video
8. **Routes subagent** → generates `/academy` articles + `/videos` gallery route from features doc
9. **Social cuts subagent** → generates 9:16 vertical + 15s short versions for each video

**Usage:**
```
/jat:feature-videos meadow              # Full pipeline
/jat:feature-videos meadow --dry-run    # Docs + configs only, no rendering
/jat:feature-videos meadow --only auth  # Re-render just one feature video
/jat:feature-videos meadow --redo-storyboard  # Regenerate storyboard from existing features.md
/jat:feature-videos meadow --no-voice   # Skip voiceover generation
```

**Output:**
```
docs/videos/
├── <projectId>-features.md               ← Feature curriculum (also used for academy)
├── <projectId>-storyboard.md             ← Video storyboard + narration scripts
├── <projectId>-remotion-<feature>.json   ← Remotion config per feature
└── screenshots/                          ← Captured app UI (one per feature)
    ├── <feature>.png                     ← Raw browser screenshot
    ├── <feature>-enhanced.png            ← Gemini-polished version (if enhanced)
    └── ...

static/videos/
├── <feature>.mp4                         ← Full 16:9 feature video
├── <feature>-poster.jpg                  ← Poster frame (Remotion still)
├── <feature>-thumbnail.png              ← Generated thumbnail (Gemini)
├── <feature>-vertical.mp4               ← 9:16 social cut
├── <feature>-short.mp4                  ← 15s highlight reel
├── <feature>-narration.mp3              ← Voiceover audio
└── tour.mp4                             ← Master product tour

docs/videos/
├── backgrounds/                          ← Generated scene backgrounds (Gemini)
│   ├── <feature>-bg.png
│   └── ...
├── screenshots/                          ← Captured app UI (browser)
│   ├── <feature>-1.png                  ← Raw captures
│   ├── <feature>-1-enhanced.png         ← Enhanced (Gemini edit)
│   └── ...

src/routes/(marketing)/academy/           ← Generated academy articles
src/routes/(marketing)/videos/            ← Video gallery route
```

---

## Architecture: Subagent Pipeline

Each phase runs as a focused subagent with a **fresh context window**. Phases are sequential where outputs feed into the next phase, and parallel where independent.

```
Orchestrator (this skill)
  │
  ├─ Phase 1: Features Subagent (sonnet)
  │    Input:  CLAUDE.md + knowledge bases + .jat/memory/*.md
  │    Output: docs/videos/<projectId>-features.md
  │
  ├─ Phase 2: Storyboard Subagent (sonnet)
  │    Input:  features.md + shared/remotion-video.md
  │    Output: storyboard.md + remotion JSON configs (with narration scripts)
  │
  ├─ Phase 3: Assets (3 subagents, ALL parallel)
  │    ├─ Screenshot Subagent (sonnet)
  │    │    Input:  features.md routes + browser tools
  │    │    Output: docs/videos/screenshots/<feature>-*.png
  │    │
  │    ├─ Voiceover Subagent (sonnet)
  │    │    Input:  storyboard narration scripts + ElevenLabs API
  │    │    Output: static/videos/<feature>-narration.mp3
  │    │
  │    └─ Imagery Subagent (sonnet)
  │         Input:  storyboard + project brand + gemini-image/gemini-edit
  │         Output: docs/videos/backgrounds/<feature>-bg.png (scene backgrounds)
  │                 static/videos/<feature>-thumbnail.png (video thumbnails)
  │
  ├─ Phase 3B: Screenshot Enhancement (after 3, needs screenshots + gemini)
  │    Runs gemini-edit on raw screenshots to polish them
  │    Output: docs/videos/screenshots/<feature>-*-enhanced.png
  │
  ├─ Phase 4: Video Render Subagent (sonnet, single shared Remotion project)
  │    Input:  ALL remotion JSON configs + screenshots + backgrounds + audio
  │    Output: static/videos/<feature>.mp4 + poster (batch render, 3 at a time)
  │
  ├─ Phase 5: Post-processing (parallel)
  │    ├─ Tour Subagent → static/videos/tour.mp4
  │    ├─ Social Cuts Subagent → <feature>-vertical.mp4 + <feature>-short.mp4
  │    └─ Routes Subagent → academy articles + video gallery route (uses thumbnails)
  │
  └─ Report
```

---

## STEP 1: Resolve Project + Parse Flags

Parse `$ARGUMENTS` for projectId and flags:
- `--dry-run` — stop after phases 1-2 (docs + configs, no rendering)
- `--only <slug>` — re-render just one feature (skip phases 1-2, use existing configs)
- `--redo-storyboard` — regenerate storyboard from existing features.md (skip phase 1)
- `--no-voice` — skip voiceover generation

**Project ID is required.** Resolve from JAT config:
```bash
cat ~/.config/jat/projects.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
p = data.get('projects', {}).get('PROJECT_ID', {})
print(p.get('path', 'NOT_FOUND').replace('~', '$HOME'))"
```

If no project ID, list available projects and ask user to pick.

Gather project context:
```bash
# Count memories
ls <projectDir>/.jat/memory/*.md 2>/dev/null | wc -l

# Brand color
cat ~/.config/jat/projects.json | python3 -c "
import json, sys; p = json.load(sys.stdin).get('projects',{}).get('PROJECT_ID',{})
print(p.get('active_color', '#5588ff'))"

# Dev server port
cat ~/.config/jat/projects.json | python3 -c "
import json, sys; p = json.load(sys.stdin).get('projects',{}).get('PROJECT_ID',{})
print(p.get('port', '5173'))"

# Create output directories
mkdir -p <projectDir>/docs/videos/screenshots
mkdir -p <projectDir>/static/videos
```

---

## STEP 2: Features Subagent

**Skip if:** `--only` or `--redo-storyboard` (features.md already exists)

Spawn with **Agent tool**, `model: "sonnet"`:

```
You are a technical writer synthesizing project features from agent session memories.

## Project
- Name: <projectName>
- Path: <projectDir>
- Description: <from CLAUDE.md>

## Your Task
Read ALL memory files in <projectDir>/.jat/memory/*.md and synthesize them into a features document.

## Instructions

1. Read <projectDir>/CLAUDE.md for overall project context.

2. Read all memory files (ls <projectDir>/.jat/memory/*.md, then read each one).
   Each has frontmatter (task, agent, files, tags) and sections (Summary, Approach, Decisions, Key Files, Lessons).

3. Group memories by feature area:
   - Epic groupings (task IDs like meadow-0rfk9.1, meadow-0rfk9.2 share parent)
   - Tag/label clusters (e.g., "oha", "forms", "auth", "portal")
   - Functional areas (authentication, CRM, scheduling)

4. For each feature group, extract:
   - Feature name (user-facing, not technical)
   - One-sentence summary
   - Why it matters to the user
   - Key capabilities (from task summaries)
   - User flow (how someone uses it)
   - Key routes/pages (from memory key files — needed for screenshots later)

5. Write to: <projectDir>/docs/videos/<projectId>-features.md

## Output Format

# <ProjectName> Feature Academy

## Overview
[2-3 sentences: what the app is, who it's for]

## Features

### 1. <Feature Name>
**What it does:** [One sentence]
**Why it matters:** [User benefit]
**Routes:** [/path1, /path2 — the app pages for this feature]

**Capabilities:**
- [Capability]
- ...

**User flow:** [2-3 sentence walkthrough]

### 2. <Feature Name>
...

## Writing Guidelines
- User perspective, no tech jargon
- Order by user journey: onboarding → core → advanced
- Each feature = standalone video topic
- Skip infrastructure, bug fixes, dev tooling
- Target 8-15 features total
- INCLUDE the Routes field — this is critical for the screenshot phase
```

**After completion:** Read features doc, verify feature count. If >15, ask user to select.

**Fallback:** If `.jat/memory/` is empty, tell the subagent to use `cd <projectDir> && jt list --status closed --json` instead.

---

## STEP 3: Storyboard Subagent

**Skip if:** `--only` (use existing storyboard)

Spawn with **Agent tool**, `model: "sonnet"`:

```
You are a video storyboard designer. Create Remotion video configs and narration scripts.

## Project
- Name: <projectName>
- Path: <projectDir>
- Brand accent: <accentColor>

## Read These Files
1. <projectDir>/docs/videos/<projectId>-features.md
2. ~/code/jat/shared/remotion-video.md
3. <projectDir>/src/app.css (for DaisyUI theme colors)

## Your Task
For each feature in the features doc:
1. Write a storyboard section in <projectDir>/docs/videos/<projectId>-storyboard.md
2. Write a Remotion JSON config at <projectDir>/docs/videos/<projectId>-remotion-<slug>.json

## Storyboard Format (per feature)

## Video N: <Feature Name>
**Slug:** <feature-slug>
**Duration:** ~35s (1050 frames at 30fps)
**Tone:** [match project — clinical for healthcare, professional for B2B]

### Scene 1: Hook (0-7s, frames 0-210)
- **Visual:** [Description — can reference screenshot: screenshots/<slug>-1.png]
- **Headline:** [Exact text]
- **Subtitle:** [Supporting text]
- **Narration:** [What the voiceover says during this scene, 1-2 sentences]
- **Animation:** tracking-in-expand

### Scene 2: The Challenge (7-14s, frames 180-420, overlap 30)
- **Visual:** [Pain point]
- **Headline:** [Problem statement]
- **Items:** [Pain points list]
- **Narration:** [Voiceover text]
- **Animation:** staggered-slide-in

### Scene 3: How It Works (14-25s, frames 390-750, overlap 30)
- **Visual:** [screenshots/<slug>-2.png — actual app UI]
- **Headline:** [Feature name]
- **Items:** [Capabilities from features doc]
- **Narration:** [Voiceover text]
- **Animation:** spring entrance, staggered 12 frames

### Scene 4: The Result (25-32s, frames 720-960, overlap 30)
- **Visual:** [screenshots/<slug>-3.png — success state / dashboard]
- **Headline:** [Benefit]
- **Narration:** [Voiceover text]
- **Animation:** scale-in

### Scene 5: CTA (32-35s, frames 930-1050, overlap 30)
- **Visual:** App logo + action
- **Headline:** [CTA text]
- **Narration:** [Closing voiceover]
- **Animation:** tracking-in-expand

## Remotion JSON Config

Include a `narration` field per scene and a `screenshots` field:

{
  "projectId": "<projectId>",
  "projectPath": "<projectDir>",
  "featureName": "<Feature Name>",
  "featureSlug": "<feature-slug>",
  "duration": { "seconds": 35, "fps": 30, "totalFrames": 1050 },
  "theme": {
    "bg": "#0a0a0f", "bgCard": "#141420", "accent": "<accentColor>",
    "text": "#f5f5f5", "textDim": "#a0a0b0", "success": "#10b981", "border": "#2a2a3e"
  },
  "scenes": [
    {
      "id": "hook",
      "startFrame": 0,
      "durationFrames": 210,
      "overlapFrames": 0,
      "content": {
        "headline": "Exact text",
        "subtitle": "Exact text",
        "visual": "Description",
        "screenshot": null
      },
      "narration": "What the voiceover says during this scene.",
      "animations": { "headline": "tracking-in-expand" }
    },
    {
      "id": "how-it-works",
      "startFrame": 390,
      "durationFrames": 360,
      "overlapFrames": 30,
      "content": {
        "headline": "...",
        "items": ["Cap 1", "Cap 2"],
        "visual": "App screenshot showing the feature",
        "screenshot": "screenshots/<slug>-2.png"
      },
      "narration": "Voiceover for this scene.",
      "animations": { "items": "staggered-slide-in", "itemDelay": 12 }
    }
  ],
  "narrationFull": "Complete narration script concatenated for TTS generation.",
  "imagery": {
    "backgroundPrompt": "Gemini prompt for scene background image — atmospheric, on-brand, 1920x1080. E.g. 'Soft watercolor forest scene with bioluminescent mushrooms, dark teal and sage green palette, dreamy medical aesthetic, no text'",
    "thumbnailPrompt": "Gemini prompt for video thumbnail/card image — 1280x720, eye-catching. E.g. 'Modern healthcare portal interface glowing in dark space, teal accent, feature title area left side, clean minimal'",
    "screenshotEdits": {
      "<slug>-1.png": "Gemini edit instruction for this screenshot. E.g. 'Replace placeholder text with realistic patient names, remove browser chrome, add subtle depth-of-field blur to background'",
      "<slug>-2.png": "Edit instruction for second screenshot"
    }
  },
  "output": {
    "videoPath": "static/videos/<slug>.mp4",
    "posterPath": "static/videos/<slug>-poster.jpg",
    "thumbnailPath": "static/videos/<slug>-thumbnail.png",
    "audioPath": "static/videos/<slug>-narration.mp3",
    "verticalPath": "static/videos/<slug>-vertical.mp4",
    "shortPath": "static/videos/<slug>-short.mp4"
  }
}

## Guidelines
- Each video 30-40s
- Specific text from features doc, not placeholders
- Overlap scenes 30 frames for crossfades
- Large font sizes (see remotion-video.md size tuning guide)
- Match project tone
- Feature slugs: kebab-case, no special chars
- Reference screenshots by path — the screenshot subagent will capture them
- Write narration as natural speech (not bullet points)
- narrationFull = all scene narrations joined, with brief pauses marked as [pause]
- imagery.backgroundPrompt: describe an atmospheric image matching the feature's mood and project brand
- imagery.thumbnailPrompt: describe an eye-catching thumbnail for the video gallery card
- imagery.screenshotEdits: per-screenshot edit instructions to polish raw captures (realistic data, remove debug UI, etc.)
- All Gemini prompts should specify dimensions, mood, color palette, and "no text" (text is added in Remotion)
```

---

## STEP 4: Assets — Screenshots + Voiceover + Imagery (parallel)

**Skip if:** `--dry-run`
**Skip voiceover if:** `--no-voice`

Spawn ALL THREE subagents in parallel in a single message.

### 4A: Screenshot Subagent

**This subagent uses MCP Chrome DevTools tools** (`mcp__chrome-devtools__*`) to capture real app screenshots at video resolution. It does NOT use the CLI browser tools (`browser-*.js`).

```
You are capturing screenshots of a running web app for use in feature videos.
You have access to MCP Chrome DevTools tools for browser automation.

## Project
- Path: <projectDir>
- Dev server port: <port> (from projects.json)

## Read
<projectDir>/docs/videos/<projectId>-features.md (for the Routes field per feature)

## Instructions

### 1. Find or start the dev server

Check if the app is already running on common ports:
  curl -s -o /dev/null -w "%{http_code}" http://localhost:<port>/
  curl -s -o /dev/null -w "%{http_code}" http://localhost:3200/
  curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/

Use whichever port returns 200. If none, start the dev server:
  cd <projectDir> && eval $(jat-secret --export) && npm run dev -- --port <port> &
  Wait up to 10s for it to respond.

Set BASE_URL to the working URL (e.g., http://localhost:3200).

### 2. Set up browser viewport

Open a new page and resize to video resolution (1920x1080):

  mcp__chrome-devtools__new_page  url: ${BASE_URL}/
  mcp__chrome-devtools__resize_page  width: 1920, height: 1080

### 3. Check authentication

Navigate to a protected route (e.g., /portal or /admin) and take a test screenshot.
If it shows a login page or redirect:
  - Check if other browser tabs are already authenticated on the same domain
    (mcp__chrome-devtools__list_pages — look for existing tabs on the same origin)
  - If authenticated tabs exist, the cookies should carry over
  - If not, try navigating to /login and check for Supabase session
  - As a last resort, note which routes need auth and capture only public routes

### 4. Create output directories

  mkdir -p <projectDir>/docs/videos/screenshots
  mkdir -p <projectDir>/video/public

### 5. Capture screenshots

For each feature in features.md, use the **Routes** field to determine which URL to visit.
Pick the most representative route for each feature (the one that shows the feature best).

**Screenshot naming: one screenshot per feature, named `<slug>.png`**

For each feature:
  a) Navigate to the route:
     mcp__chrome-devtools__navigate_page  url: ${BASE_URL}/<route>

  b) Wait for content to load:
     mcp__chrome-devtools__wait_for  text: ["<expected heading or label>"]
     (Use a heading or key text that appears when the page is fully loaded)

  c) Take a full-page screenshot:
     mcp__chrome-devtools__take_screenshot
       filePath: <projectDir>/docs/videos/screenshots/<slug>.png
       format: png
       fullPage: true

**Route-to-feature mapping (derive from features.md Routes field):**
- Public routes: /, /apply, /services, /team, etc.
- Client portal: /portal, /portal/intake, /portal/oha, /portal/checkins, /portal/book
- Facilitator: /facilitator, /facilitator/schedule, /facilitator/clients
- Admin: /admin, /admin/intakes, /admin/emails, /admin/payouts, /admin/inventory, /admin/compliance, /admin/outcomes

### 6. Copy to Remotion public directory

After all screenshots are captured, copy them so Remotion can use them as static files:
  cp <projectDir>/docs/videos/screenshots/*.png <projectDir>/video/public/

### 7. Verify

List all captured screenshots with file sizes. Report any features that couldn't be captured
(auth issues, empty pages, errors) and suggest manual alternatives.

## Output
- Screenshots: <projectDir>/docs/videos/screenshots/<slug>.png (one per feature)
- Copies: <projectDir>/video/public/<slug>.png (for Remotion)
- Report: which features succeeded/failed + file sizes
```

### 4B: Voiceover Subagent

```
You are generating voiceover audio for feature videos using ElevenLabs TTS.

## API Setup
API Key: $(jat-secret elevenlabs-api-key)
Endpoint: https://api.elevenlabs.io/v1/text-to-speech/<voice_id>

## Instructions

1. First, list available voices to pick an appropriate one:
   curl -s "https://api.elevenlabs.io/v1/voices" \
     -H "xi-api-key: <API_KEY>" | python3 -c "
   import json, sys
   for v in json.load(sys.stdin).get('voices',[]):
     labels = v.get('labels',{})
     print(f'{v[\"voice_id\"]} {v[\"name\"]:20} {labels.get(\"accent\",\"\")} {labels.get(\"gender\",\"\")} {labels.get(\"use_case\",\"\")}')"

   Pick a voice that matches the project tone:
   - Healthcare/clinical: calm, professional, warm
   - B2B/SaaS: confident, clear, professional
   - Consumer: friendly, energetic

2. Read each remotion JSON config in <projectDir>/docs/videos/<projectId>-remotion-*.json
   Extract the "narrationFull" field.

3. For each feature, generate audio:
   curl -s "https://api.elevenlabs.io/v1/text-to-speech/<voice_id>" \
     -H "xi-api-key: <API_KEY>" \
     -H "Content-Type: application/json" \
     -d '{
       "text": "<narrationFull text>",
       "model_id": "eleven_multilingual_v2",
       "voice_settings": {
         "stability": 0.5,
         "similarity_boost": 0.75,
         "style": 0.3
       }
     }' \
     --output <projectDir>/static/videos/<slug>-narration.mp3

4. Verify each audio file was created and has reasonable size (>10KB).

## Error Handling
- If API key is invalid, report the error and skip voiceover (don't fail the whole pipeline)
- If a voice generation fails, report which feature and continue with others
- Write a summary of generated audio files with durations

## Output
Audio files at: <projectDir>/static/videos/<slug>-narration.mp3
```

### 4C: Imagery Subagent (Gemini)

```
You are generating background images and video thumbnails using Gemini image generation.

Tools available (on PATH):
- gemini-image "PROMPT" OUTPUT [--aspect 16:9] [--size 2K]  — Generate image from text
- gemini-edit INPUT "INSTRUCTION" OUTPUT                     — Edit existing image
- gemini-compose IMG1 IMG2 "INSTRUCTION" [--output PATH]     — Combine images

Requires: GEMINI_API_KEY environment variable (already configured)

## Read
All remotion JSON configs: <projectDir>/docs/videos/<projectId>-remotion-*.json
Extract the "imagery" object from each config.

## Instructions

1. Create output directories:
   mkdir -p <projectDir>/docs/videos/backgrounds
   mkdir -p <projectDir>/static/videos

2. For each feature config, generate:

   a) Scene background (1920x1080, 16:9):
      gemini-image "<backgroundPrompt>" <projectDir>/docs/videos/backgrounds/<slug>-bg.png --aspect 16:9 --size 2K

   b) Video thumbnail (1280x720, 16:9):
      gemini-image "<thumbnailPrompt>" <projectDir>/static/videos/<slug>-thumbnail.png --aspect 16:9

3. Quality check: verify each image exists and is >50KB (not a failed generation).
   If a generation fails, retry once with a simplified prompt.

## Guidelines
- Backgrounds should be atmospheric, NOT busy — text and UI will overlay them
- Use the project's color palette (from the theme in the config)
- No text in generated images — text is added by Remotion
- Thumbnails should be visually distinct per feature (different composition/subject)
- For healthcare projects: warm, calming, nature-inspired, clinical-but-human
- For B2B/SaaS: clean, modern, abstract geometric, tech-forward

## Output
- Backgrounds: <projectDir>/docs/videos/backgrounds/<slug>-bg.png
- Thumbnails: <projectDir>/static/videos/<slug>-thumbnail.png
Report which images were generated successfully.
```

---

### STEP 4D: Screenshot Enhancement (after Phase 4A + 4C complete)

**Skip if:** no screenshots were captured, or `--dry-run`

After the screenshot subagent and imagery subagent both complete, run `gemini-edit` on each raw screenshot using the edit instructions from the remotion JSON configs.

This is a quick sequential step (not a subagent) — the orchestrator runs it directly:

```bash
# For each feature config that has imagery.screenshotEdits:
# Read the edit instruction from the JSON config
# Run gemini-edit on the raw screenshot → enhanced version

gemini-edit <projectDir>/docs/videos/screenshots/<slug>.png \
  "<edit instruction from config>" \
  <projectDir>/docs/videos/screenshots/<slug>-enhanced.png

# Copy enhanced versions to Remotion public dir
cp <projectDir>/docs/videos/screenshots/*-enhanced.png <projectDir>/video/public/
```

The video renderer (Phase 5) will prefer `<slug>-enhanced.png` if it exists, falling back to `<slug>.png`.

**Also copy backgrounds and audio to Remotion public dir:**
```bash
cp <projectDir>/docs/videos/backgrounds/*.png <projectDir>/video/public/ 2>/dev/null
cp <projectDir>/static/videos/*-narration.mp3 <projectDir>/video/public/ 2>/dev/null
```

---

## STEP 5: Video Render (single shared Remotion project)

**Skip if:** `--dry-run`

**Architecture:** Use ONE shared Remotion project at `<projectDir>/video/` with all features registered as separate Compositions. This avoids 15 separate `npm install`s and allows batch rendering.

If `--only <slug>` was specified, render just that one composition.

Spawn a single subagent:

```
You are building and rendering Remotion feature videos from JSON specs.

## Reference
Read: ~/code/jat/shared/remotion-video.md (patterns, gotchas, size tuning)

## Available Assets
- JSON specs: <projectDir>/docs/videos/<projectId>-remotion-*.json (one per feature)
- Screenshots: <projectDir>/video/public/<slug>.png (captured by screenshot subagent)
- Enhanced screenshots: <projectDir>/video/public/<slug>-enhanced.png (if gemini-edit ran)
- Backgrounds: <projectDir>/video/public/<slug>-bg.png (if Gemini imagery ran)
- Narration audio: <projectDir>/video/public/<slug>-narration.mp3 (if voiceover ran)

## Instructions

### 1. Set up shared Remotion project

Create ONE project at <projectDir>/video/ (if it doesn't already exist):
  mkdir -p <projectDir>/video/src/scenes <projectDir>/video/public <projectDir>/video/out

Create boilerplate files per remotion-video.md:
- package.json (name: "<projectId>-videos")
- tsconfig.json (with resolveJsonModule: true — needed to import JSON specs)
- remotion.config.ts
- src/index.ts (registerRoot)

### 2. Create shared theme + animation utilities

**src/theme.ts** — extract colors from the JSON spec theme object.
**src/types.ts** — TypeScript interfaces for VideoSpec, SceneSpec, AnimationSpec.
**src/animations.ts** — reusable animation functions:
  - fadeIn, fadeOut, slideUpFade, trackingInExpand (letter-spacing)
  - springEntrance, scaleInSpring, stampEntrance, slideInLeft
  - sceneExit (fade out in final 30 frames of each scene)

### 3. Create data-driven scene components

Build 5 scene components that accept the JSON spec data as props:

**src/scenes/HookScene.tsx** — handles scene.id === "hook"
  - Animated headline (tracking-in-expand or fade-in-bottom)
  - Optional subtitle
  - Optional stat cards (scale-in-stagger) or progress bar (sequential-fill)
  - Logo mark + radial gradient background

**src/scenes/ChallengeScene.tsx** — handles scene.id === "challenge"
  - Headline (fade-in-bottom)
  - Pain point items (stagger-slide-in-left with red indicators)
  - Subtle chaos icons in background (low opacity)

**src/scenes/HowItWorksScene.tsx** — handles scene.id === "how-it-works"
  - **LEFT SIDE: Real app screenshot** in a browser chrome frame
    - Browser chrome: traffic light dots (red/yellow/green) + URL bar showing "projectdomain.com"
    - Screenshot image: `<Img src={staticFile("<slug>.png")}/>` (prefer <slug>-enhanced.png if exists)
    - Spring entrance from bottom (translateY animation)
    - Crop to viewport height (objectFit: "cover", objectPosition: "top", height: ~480px)
    - If no screenshot file exists, fall back to a placeholder mockup card
  - **RIGHT SIDE: Headline + feature bullet items**
    - Headline (fade-in-bottom)
    - Items with checkmark indicators (stagger-slide-in-left)
  - Optional warning banner overlay on screenshot (health-intake hard disqualifier)

**src/scenes/ResultScene.tsx** — handles scene.id === "result"
  - Headline (fade-in-bottom)
  - Metric badge (scale-in with spring)
  - Optional stamp badge ("AUTO-APPROVED" with stamp-entrance)
  - Optional ring-pulse animation
  - Dark card container with border glow

**src/scenes/CTAScene.tsx** — handles scene.id === "cta"
  - Headline (tracking-in-expand — always use this for CTA)
  - Logo with gentle opacity pulse
  - URL text below
  - Radial gradient background

### 4. Create composition router

**src/FeatureVideo.tsx** — sequences the 5 scenes using `<Sequence>` with startFrame/durationFrames from JSON spec. Routes each scene.id to the correct component. Passes the featureSlug to HowItWorksScene so it can load the right screenshot.

**src/Root.tsx** — imports ALL JSON specs and registers each as a Composition:
  import specData from "../../docs/videos/<projectId>-remotion-<slug>.json"
  Convert slug to PascalCase for composition ID (e.g., "client-portal" → "ClientPortal")

### 5. Create batch render script

**render-all.mjs** — renders all compositions in parallel batches:
  - Read all JSON specs from docs/videos/
  - Render 3 at a time (CONCURRENCY=3) to avoid OOM
  - For each: `npx remotion render src/index.ts <CompositionId> out/<slug>.mp4 --codec h264 --concurrency 4`
  - Also render poster frame: `npx remotion still src/index.ts <CompositionId> --frame 700 --output out/<slug>-poster.jpg --image-format jpeg`
  - Copy each output to <projectDir>/static/videos/
  - Report: success/fail count, file sizes, total time

### 6. Install and render

  cd <projectDir>/video && npm install
  node render-all.mjs

### 7. Verify

  ls -lhS <projectDir>/static/videos/*.mp4
  Verify all features have video + poster files.
  Report: video count, total size, any failures.

## Key Implementation Notes
- Use `import { Img, staticFile } from "remotion"` for all image references
- Screenshots in video/public/ are served as static files via staticFile()
- JSON specs are imported directly (resolveJsonModule in tsconfig)
- Font sizes must be LARGE (see size tuning guide) — 94px headlines, 34px body
- All scenes fade out in final 30 frames for smooth crossfade transitions
- The HowItWorksScene screenshot browser chrome should show the project's domain, not localhost
```

---

## STEP 6: Post-Processing (parallel)

**Skip if:** `--dry-run`

Spawn ALL three subagents in parallel.

### 6A: Tour Video Subagent

```
You are creating a master product tour video that combines the best scene from each feature video.

## Read
- <projectDir>/docs/videos/<projectId>-storyboard.md (for all feature scenes)
- ~/code/jat/shared/remotion-video.md

## Instructions

1. Create a Remotion project at <projectDir>/video/tour/

2. The tour video should be 2-3 minutes (3600-5400 frames at 30fps).
   Structure:
   - Opening: Project name + tagline (5s)
   - For each feature: show the "How It Works" scene (the strongest scene) — ~15s each
   - Closing: CTA + all feature names listed (8s)

3. Copy the screenshots from docs/videos/screenshots/ to video/tour/public/

4. If narration audio exists for features, generate a tour narration script
   and note it for manual TTS generation later.

5. Render to <projectDir>/static/videos/tour.mp4

Report: video path, file size, duration.
```

### 6B: Social Cuts Subagent

```
You are creating social media cuts of feature videos.

For each feature video that was rendered, create two additional compositions:

## 1. Vertical Cut (9:16, 1080x1920)
- Same content as the main video but reformatted for portrait
- Resize screenshots to fit vertical frame
- Larger text (scale up ~1.3x from landscape)
- Same duration as original
- Output: <projectDir>/static/videos/<slug>-vertical.mp4

## 2. Short Cut (16:9, 15 seconds)
- Take the strongest 15s from the feature video (usually Scene 3: How It Works)
- Add quick intro title (2s) + CTA end card (3s) + feature content (10s)
- Output: <projectDir>/static/videos/<slug>-short.mp4

## Instructions

1. For each feature, create a Remotion project at <projectDir>/video/<slug>-social/
   OR add additional Compositions to the existing <projectDir>/video/<slug>/ project.

2. Read ~/code/jat/shared/remotion-video.md for patterns.

3. The vertical version needs a separate Root.tsx Composition with width: 1080, height: 1920.
   The short version needs durationInFrames: 450 (15s at 30fps).

4. Render both:
   npx remotion render src/index.ts VerticalVideo out/<slug>-vertical.mp4 --codec h264
   npx remotion render src/index.ts ShortVideo out/<slug>-short.mp4 --codec h264

5. Copy to static/videos/.

Report: paths and file sizes for all social cuts.
```

### 6C: Routes Subagent

```
You are generating SvelteKit routes for a video gallery and academy articles from feature documentation.

## Project
- Path: <projectDir>
- Framework: SvelteKit 5 + DaisyUI + Tailwind v4

## Read
- <projectDir>/docs/videos/<projectId>-features.md
- <projectDir>/src/routes/(marketing)/academy/+page.svelte (existing academy page)
- <projectDir>/src/routes/(marketing)/academy/articles.ts (existing article structure)
- <projectDir>/src/routes/(marketing)/media/+page.svelte (existing media page for reference)

## Task 1: Video Gallery Route

Create <projectDir>/src/routes/(marketing)/videos/+page.svelte

A page that displays all feature videos in a grid. Each video card shows:
- **Thumbnail image** (from /videos/<slug>-thumbnail.png — Gemini-generated)
- Feature name
- Brief description (from features.md)
- Play button overlay
- Clicking opens the video in a modal or navigates to a detail page

Use the existing media page as a reference for layout patterns. Use DaisyUI card components.

Videos are served from /videos/<slug>.mp4, thumbnails from /videos/<slug>-thumbnail.png,
and posters from /videos/<slug>-poster.jpg.

Include the master tour video prominently at the top as a "hero" video.

## Task 2: Academy Feature Articles

For each feature in the features doc, create an academy article.
Check the existing articles.ts structure and add new entries.

Create article pages at <projectDir>/src/routes/(marketing)/academy/(articles)/<slug>/+page.svelte

Each article should:
- Use the feature's capabilities and user flow from features.md as content
- Embed the corresponding feature video (if it exists)
- Match the existing academy page styling
- Include a "Watch the video" section with the embedded <video> element
- Link to the next feature article at the bottom

## Styling
- Use existing project styles (DaisyUI theme, reveal animations)
- Import { reveal } from "$lib/actions/reveal" for scroll animations
- Follow patterns from the existing academy and media pages
- Responsive: looks good on mobile and desktop

Report: list of created route files.
```

---

## STEP 7: Report Results

After all subagents complete:

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    FEATURE VIDEOS: <PROJECT_NAME>                        ║
╚══════════════════════════════════════════════════════════════════════════╝

Documents:
  Features:   docs/videos/<projectId>-features.md (N features)
  Storyboard: docs/videos/<projectId>-storyboard.md

Assets:
  Screenshots: N captured, M enhanced (Gemini edit)
  Backgrounds: N generated (Gemini image)
  Thumbnails:  N generated (Gemini image)

Voiceover:
  Voice: <voice name>
  Audio: N files generated (or: skipped / API key invalid)

Feature Videos:
  <feature-1>  → static/videos/<feature-1>.mp4 (X.XMB)
  <feature-2>  → static/videos/<feature-2>.mp4 (X.XMB)
  ...

Social Cuts:
  N vertical (9:16) + N short (15s) versions

Tour Video: static/videos/tour.mp4 (X.XMB)

Routes Generated:
  /videos — Video gallery page
  /academy/<slug> — N feature articles

Total: X feature videos, X social cuts, 1 tour video
```

---

## Data Source: Agent Memories

Uses `.jat/memory/*.md` as the primary data source. Each memory is a structured summary (~300 words) with Summary, Approach, Decisions, Key Files, Lessons.

**Why memories:** Already summarized, implementation-perspective (knows what shipped), includes routes/files (needed for screenshots), grouped by task ID mapping to epics.

**Fallback:** If no memories, use `cd <projectDir> && jt list --status closed --json`.

---

## Iteration Support

### Re-render one feature
```
/jat:feature-videos meadow --only auth
```
Skips phases 1-2, reads existing `<projectId>-remotion-auth.json`, runs phase 5 for just that feature.

### Regenerate storyboard
```
/jat:feature-videos meadow --redo-storyboard
```
Skips phase 1 (features.md already exists), re-runs phase 2 (storyboard), then continues.

### Edit and re-render
After initial `--dry-run`, user can edit `features.md` or `storyboard.md` manually, then:
```
/jat:feature-videos meadow --redo-storyboard  # if features.md was edited
/jat:feature-videos meadow                    # if only storyboard was edited
```

---

## ElevenLabs TTS Integration

**API:** `https://api.elevenlabs.io/v1/text-to-speech/<voice_id>`
**Key:** `jat-secret elevenlabs-api-key`
**Model:** `eleven_multilingual_v2`

The voiceover subagent:
1. Lists available voices via API
2. Selects a voice matching project tone
3. Generates MP3 for each feature's `narrationFull` text
4. Audio is synced to video via Remotion's `<Audio>` component

**Graceful degradation:** If the API key is invalid or TTS fails, the pipeline continues without voiceover. Narration scripts are still in the storyboard and JSON configs for manual recording.

---

## Error Handling

- **No memories AND no closed tasks:** Cannot proceed, ask user
- **Project not found:** List available projects
- **>15 features:** Ask user to select
- **Screenshots fail:** Some routes may require auth — note which failed, continue
- **Voiceover fails:** Continue without audio, narration scripts preserved
- **Render failure:** Report which video failed, continue with others
- **Dev server won't start:** Skip screenshots, use motion-graphics-only videos

---

## Best Practices

1. **Run --dry-run first** — review features.md and storyboard before committing to renders
2. **Feature synthesis quality matters most** — everything downstream depends on it
3. **Screenshots make videos 10x better** — real app UI beats abstract motion graphics
4. **Match project tone** — clinical for healthcare, professional for construction
5. **Keep feature videos short** — 30-40s max each
6. **Parallel everything possible** — screenshots + voiceover in parallel, all video renders in parallel
7. **Review between phases** — check features doc before spawning storyboard
8. **Iterate with --only** — re-render individual videos after tweaking configs
