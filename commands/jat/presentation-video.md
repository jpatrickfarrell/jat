---
argument-hint: <presentation.md path> [--dry-run] [--no-voice] [--port PORT]
---

Generate a presentation video from a structured markdown document. Each numbered section becomes a scene with real browser screenshots, text overlays, transitions, and optional voiceover narration.

# Presentation Video: Markdown → Storyboard → Screenshots → Voiceover → Video

**Use this command when:**
- You have a `presentation.md` with numbered sections describing product features
- You want to generate a walkthrough/demo video for a client or stakeholder
- Each section should show real app screenshots with narration

**What this does:**
1. Parses `presentation.md` into numbered scenes
2. Creates a Remotion storyboard config (one scene per section)
3. Captures real browser screenshots for each scene using CLI browser tools
4. Generates voiceover narration via ElevenLabs TTS (unless `--no-voice`)
5. Renders a single MP4 video with all scenes stitched together

**Usage:**
```
/jat:presentation-video presentation.md                    # Full pipeline
/jat:presentation-video docs/pitch.md --dry-run            # Parse + storyboard only
/jat:presentation-video presentation.md --no-voice          # Skip voiceover
/jat:presentation-video presentation.md --port 3200         # App runs on port 3200
```

**Output:**
```
docs/videos/
├── presentation-storyboard.json     ← Remotion config with all scenes
├── presentation-narration.txt       ← Full narration script
└── screenshots/                     ← Captured app screenshots
    ├── scene-01.png
    ├── scene-02.png
    └── ...

static/videos/
├── presentation.mp4                 ← Final rendered video
├── presentation-poster.jpg          ← Poster frame
└── presentation-narration.mp3       ← Voiceover audio (if generated)

video/                               ← Remotion project (reusable)
├── package.json
├── src/
│   ├── Root.tsx
│   ├── PresentationVideo.tsx
│   ├── theme.ts
│   └── scenes/
│       ├── TitleScene.tsx
│       ├── ContentScene.tsx
│       └── ClosingScene.tsx
└── public/                          ← Screenshots + audio copied here
```

---

## Architecture: Subagent Pipeline

```
Orchestrator (this command)
  │
  ├─ Phase 1: Parse presentation.md → scenes array
  │    Orchestrator does this directly (no subagent needed)
  │
  ├─ Phase 2: Storyboard Subagent (sonnet)
  │    Input:  scenes array + project context
  │    Output: docs/videos/presentation-storyboard.json
  │
  ├─ Phase 3: Assets (2 subagents, parallel)
  │    ├─ Screenshot Subagent (sonnet)
  │    │    Input:  storyboard + CLI browser tools
  │    │    Output: docs/videos/screenshots/scene-*.png
  │    │
  │    └─ Voiceover Subagent (sonnet) [skip if --no-voice]
  │         Input:  narration script + ElevenLabs API
  │         Output: static/videos/presentation-narration.mp3
  │
  ├─ Phase 4: Video Render Subagent (sonnet)
  │    Input:  storyboard JSON + screenshots + audio
  │    Output: static/videos/presentation.mp4 + poster
  │
  └─ Report
```

---

## STEP 1: Parse Arguments + Read Presentation

Parse `$ARGUMENTS` for the presentation file path and flags:
- First positional argument: path to presentation markdown file (required)
- `--dry-run` — stop after Phase 2 (storyboard only, no rendering)
- `--no-voice` — skip voiceover generation
- `--port PORT` — dev server port (default: auto-detect from projects.json or try common ports)

**The presentation file path is required.** If not provided, show usage and exit.

### Resolve project context

```bash
# Get project path (current working directory)
PROJECT_DIR=$(pwd)
PROJECT_NAME=$(basename "$PROJECT_DIR")

# Read presentation file
cat "$PRESENTATION_PATH"

# Get brand color from projects.json (if configured)
cat ~/.config/jat/projects.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
for k, v in data.get('projects', {}).items():
    import os
    if os.path.expanduser(v.get('path', '')).rstrip('/') == '$PROJECT_DIR':
        print(v.get('active_color', '#3b82f6'))
        sys.exit()
print('#3b82f6')"

# Get dev server port
cat ~/.config/jat/projects.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
for k, v in data.get('projects', {}).items():
    import os
    if os.path.expanduser(v.get('path', '')).rstrip('/') == '$PROJECT_DIR':
        print(v.get('port', '5173'))
        sys.exit()
print('5173')"

# Create output directories
mkdir -p "$PROJECT_DIR/docs/videos/screenshots"
mkdir -p "$PROJECT_DIR/static/videos"
```

### Parse the presentation markdown

Parse the markdown file into structured scenes. Look for `## N.` headers (numbered sections).

Each section becomes a scene:
- **number**: The section number (1, 2, 3, ...)
- **title**: The heading text after the number
- **oldWay**: Text under "The old way:" (if present) — becomes the "challenge" portion
- **withProduct**: Bullet points under "With [Product]:" — becomes the feature highlights
- **fullText**: The complete section text (used for narration)

Non-numbered sections like "The Big Picture", "What You're Getting", and "Next Steps" become special scenes:
- "The Big Picture" or intro text → title/opening scene
- "What You're Getting" or summary → summary scene
- "Next Steps" → closing/CTA scene

Store the parsed scenes as a JSON array. Write it to `docs/videos/presentation-scenes.json`.

**Example output for one scene:**
```json
{
  "number": 1,
  "title": "No More Paper, No More Lost Invoices",
  "slug": "no-more-paper",
  "oldWay": "Plumbers fill out paper invoices in the field...",
  "highlights": [
    "Invoices are created digitally in the field",
    "One click to email the invoice to the customer",
    "No more filing — every invoice is searchable",
    "No more 'the plumber didn't turn in paperwork'",
    "Better documentation than paper ever was"
  ],
  "fullText": "The complete section text...",
  "screenshotHint": "An invoice management screen or digital invoice creation interface"
}
```

The `screenshotHint` should be inferred from the section content — what part of the app would best illustrate this feature. The storyboard subagent will refine this.

---

## STEP 2: Storyboard Subagent

Spawn with **Agent tool**, `model: "sonnet"`:

```
You are creating a Remotion video storyboard from a parsed presentation document.

## Project
- Name: <projectName>
- Path: <projectDir>
- Brand accent: <accentColor>
- Presentation: <presentationPath>

## Read These Files
1. <projectDir>/docs/videos/presentation-scenes.json (parsed scenes)
2. <presentationPath> (original markdown for full context)
3. ~/code/jat/shared/remotion-video.md (Remotion patterns and size tuning)
4. <projectDir>/CLAUDE.md (project context — what the app does, key routes)

## Your Task

Create a single Remotion JSON config for ONE video that sequences all scenes.

**Video structure:**
- Opening scene: Title + tagline (5 seconds)
- One scene per numbered section (~15-25 seconds each depending on content density)
- Summary scene if "What You're Getting" section exists (10 seconds)
- Closing scene: CTA + next steps (5 seconds)

**Duration calculation:**
- Aim for 6-10 minutes total for a 15-section presentation
- Each content scene: 15-25s depending on bullet count
  - Sections with ≤3 bullets: 15s
  - Sections with 4-6 bullets: 20s
  - Sections with 7+ bullets: 25s
- Opening: 5s, Closing: 5s, Summary: 10s
- FPS: 30

**For each content scene, create two sub-scenes:**
1. **Challenge half** (first 40% of scene duration): Shows the "old way" pain point
   - Red/amber tinted, pain point text
   - If no "old way" text, skip this half and use full duration for features
2. **Feature half** (remaining 60%): Shows the product solution
   - Screenshot of the app in a browser chrome frame (left side)
   - Feature highlight bullets (right side)
   - Green/blue accent, positive tone

**Screenshot mapping:**
For each scene, determine which URL/route in the app best demonstrates the feature.
Read CLAUDE.md to understand available routes. Map each scene to a route.
If you can't determine the route, set `screenshotUrl` to null and add a note.

Write the output to: <projectDir>/docs/videos/presentation-storyboard.json

## Output Format

{
  "projectId": "<projectName>",
  "projectPath": "<projectDir>",
  "title": "Presentation title from the markdown",
  "subtitle": "Subtitle or tagline",
  "duration": {
    "seconds": <total>,
    "fps": 30,
    "totalFrames": <total * 30>
  },
  "theme": {
    "bg": "#0a0a0f",
    "bgCard": "#141420",
    "accent": "<accentColor>",
    "text": "#f5f5f5",
    "textDim": "#a0a0b0",
    "success": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444",
    "border": "#2a2a3e"
  },
  "scenes": [
    {
      "id": "opening",
      "type": "title",
      "startFrame": 0,
      "durationFrames": 150,
      "content": {
        "headline": "Presentation Title",
        "subtitle": "A Presentation for ...",
        "tagline": "One-line value prop from intro"
      },
      "narration": "Opening narration text.",
      "animations": { "headline": "tracking-in-expand", "subtitle": "fade-in-bottom" }
    },
    {
      "id": "scene-01",
      "type": "content",
      "number": 1,
      "startFrame": 150,
      "durationFrames": 600,
      "overlapFrames": 30,
      "screenshotUrl": "/invoices",
      "screenshotHint": "Invoice list or invoice creation screen",
      "content": {
        "headline": "No More Paper, No More Lost Invoices",
        "challenge": "Plumbers fill out paper invoices...",
        "highlights": [
          "Invoices are created digitally in the field",
          "One click to email the invoice",
          "Every invoice is searchable"
        ]
      },
      "narration": "Natural voiceover text summarizing this section in 2-3 sentences.",
      "animations": {
        "challenge": "fade-in-bottom",
        "screenshot": "spring-entrance",
        "highlights": "staggered-slide-in"
      }
    },
    {
      "id": "summary",
      "type": "summary",
      "startFrame": <n>,
      "durationFrames": 300,
      "content": {
        "headline": "What You're Getting",
        "items": [
          { "before": "Paper invoices that get lost", "after": "Digital invoices, searchable and permanent" }
        ]
      },
      "narration": "Summary narration.",
      "animations": { "items": "staggered-fade-in" }
    },
    {
      "id": "closing",
      "type": "cta",
      "startFrame": <n>,
      "durationFrames": 150,
      "content": {
        "headline": "Next Steps",
        "items": ["Live demo", "Your questions", "Go live"],
        "tagline": "Built for businesses that want to spend less time on paperwork"
      },
      "narration": "Closing narration.",
      "animations": { "headline": "tracking-in-expand" }
    }
  ],
  "narrationFull": "Complete narration script — all scene narrations joined with [pause] markers between scenes."
}

## Guidelines
- Write narration as natural, conversational speech (not reading bullet points)
- Narration should summarize the key value prop of each section in 2-3 sentences
- Keep narration pacing at ~150 words per minute
- narrationFull = all scene narrations joined with [pause] between scenes
- Overlap scenes by 30 frames for smooth crossfades
- Headlines should be concise (max 8 words) — extract the key phrase from each section title
- Highlights: pick the top 3-5 most impactful bullets (not all of them)
- Font sizes will be LARGE (94px headline, 34px body) — keep text short
```

**After completion:** Read the storyboard JSON, verify scene count matches presentation sections.

Also extract the `narrationFull` field and write it to `docs/videos/presentation-narration.txt` for reference.

If `--dry-run`, output a summary and STOP HERE.

---

## STEP 3: Assets — Screenshots + Voiceover (parallel)

**Skip if:** `--dry-run`
**Skip voiceover if:** `--no-voice`

Spawn subagents in parallel (both in a single message).

### 3A: Screenshot Subagent

```
You are capturing real app screenshots for a presentation video using CLI browser tools.

## Tools Available (on PATH)
- browser-start.js [--headless]     — Connect to Chrome CDP
- browser-nav.js URL                — Navigate to URL
- browser-eval.js "JS_CODE"         — Execute JavaScript in page
- browser-screenshot.js --output PATH  — Capture screenshot
- browser-pick.js --selector "CSS"  — Click element
- browser-wait.js --text "TEXT"     — Wait for text to appear

## Project
- Path: <projectDir>
- Dev server port: <port>

## Read
<projectDir>/docs/videos/presentation-storyboard.json

## Instructions

### 1. Start browser and find the app

Connect to Chrome:
  browser-start.js

Check if the app is already running:
  curl -s -o /dev/null -w "%{http_code}" http://localhost:<port>/

If not running, start the dev server:
  cd <projectDir> && eval $(jat-secret --export) && npm run dev -- --port <port> &
  Wait up to 15 seconds, checking every 2 seconds.

Set BASE_URL to the working URL.

### 2. Set viewport to video resolution

  browser-eval.js "window.resizeTo(1920, 1080); return {w: window.innerWidth, h: window.innerHeight}"

If the window can't be resized to exactly 1920x1080, use Device Emulation:
  browser-eval.js "
    const cdp = window.__CDP__;
    return 'viewport set'
  "

### 3. Create output directory

  mkdir -p <projectDir>/docs/videos/screenshots
  mkdir -p <projectDir>/video/public

### 4. Capture screenshots

For each scene in the storyboard JSON that has `screenshotUrl` set:

  a) Navigate to the route:
     browser-nav.js "${BASE_URL}${scene.screenshotUrl}"

  b) Wait for page to load:
     browser-wait.js --text "<expected heading or key text>"
     (If no specific text, wait 3 seconds for general load)

  c) Optionally scroll or interact to show the best view of the feature.

  d) Capture screenshot:
     browser-screenshot.js --output <projectDir>/docs/videos/screenshots/scene-<NN>.png

  e) Copy to Remotion public directory:
     cp <projectDir>/docs/videos/screenshots/scene-<NN>.png <projectDir>/video/public/

### 5. Handle authentication

If a route requires login:
  - Check if there's already an authenticated session (try navigating and see if redirected)
  - Look in CLAUDE.md or .env for test credentials
  - If auth fails for a route, capture what's visible (even the login page) and note it

### 6. Handle missing routes

If a screenshotUrl is null or the route 404s:
  - Try to find a similar route that exists
  - If nothing works, skip that screenshot and note it in the report

### 7. Report

List all captured screenshots with file sizes.
Note any scenes that couldn't be captured and why.

## Output
- Screenshots: <projectDir>/docs/videos/screenshots/scene-<NN>.png
- Copies: <projectDir>/video/public/scene-<NN>.png
```

### 3B: Voiceover Subagent

**Skip if:** `--no-voice`

```
You are generating voiceover audio for a presentation video using ElevenLabs TTS.

## API Setup
API Key: $(jat-secret elevenlabs-api-key)
Endpoint: https://api.elevenlabs.io/v1/text-to-speech/<voice_id>

## Read
<projectDir>/docs/videos/presentation-narration.txt (full narration script)
<projectDir>/docs/videos/presentation-storyboard.json (for narrationFull field)

## Instructions

1. First, list available voices to pick an appropriate one:
   curl -s "https://api.elevenlabs.io/v1/voices" \
     -H "xi-api-key: <API_KEY>" | python3 -c "
   import json, sys
   for v in json.load(sys.stdin).get('voices',[]):
     labels = v.get('labels',{})
     print(f'{v[\"voice_id\"]} {v[\"name\"]:20} {labels.get(\"accent\",\"\")} {labels.get(\"gender\",\"\")} {labels.get(\"use_case\",\"\")}')"

   Pick a voice that sounds professional and confident — this is a business presentation.
   Prefer a clear, warm, authoritative voice.

2. Read the narrationFull field from the storyboard JSON.
   Replace [pause] markers with short silence indicators.

3. Generate the audio:
   curl -s "https://api.elevenlabs.io/v1/text-to-speech/<voice_id>" \
     -H "xi-api-key: <API_KEY>" \
     -H "Content-Type: application/json" \
     -d '{
       "text": "<narrationFull text>",
       "model_id": "eleven_multilingual_v2",
       "voice_settings": {
         "stability": 0.6,
         "similarity_boost": 0.75,
         "style": 0.2
       }
     }' \
     --output <projectDir>/static/videos/presentation-narration.mp3

4. Copy to Remotion public directory:
   cp <projectDir>/static/videos/presentation-narration.mp3 <projectDir>/video/public/

5. Get audio duration:
   ffprobe -i <projectDir>/static/videos/presentation-narration.mp3 \
     -show_entries format=duration -v quiet -of csv="p=0" 2>/dev/null || echo "ffprobe not available"

6. Verify the audio file exists and is >10KB.

## Error Handling
- If API key is missing or invalid, report the error and skip (don't fail the pipeline)
- If generation fails, retry once with slightly different voice settings

## Output
Audio file: <projectDir>/static/videos/presentation-narration.mp3
Copy: <projectDir>/video/public/presentation-narration.mp3
Report: file size, duration (if ffprobe available), voice used
```

---

## STEP 4: Video Render Subagent

**Skip if:** `--dry-run`

Wait for Phase 3 subagents to complete. Then spawn the render subagent.

```
You are building and rendering a Remotion presentation video from a JSON storyboard.

## Reference
Read: ~/code/jat/shared/remotion-video.md (patterns, gotchas, size tuning)

## Available Assets
- Storyboard: <projectDir>/docs/videos/presentation-storyboard.json
- Screenshots: <projectDir>/video/public/scene-*.png
- Narration audio: <projectDir>/video/public/presentation-narration.mp3 (may not exist if --no-voice)

## Instructions

### 1. Set up Remotion project

Create project at <projectDir>/video/ (if it doesn't already exist):
  mkdir -p <projectDir>/video/src/scenes <projectDir>/video/public <projectDir>/video/out

Create boilerplate files:

**package.json:**
{
  "name": "<projectName>-presentation",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "remotion studio --port 3100",
    "render": "remotion render src/index.ts Presentation out/presentation.mp4 --codec h264",
    "render:poster": "remotion still src/index.ts Presentation out/presentation-poster.jpg --frame 300 --image-format jpeg",
    "publish": "npm run render && npm run render:poster && cp out/presentation.mp4 ../static/videos/ && cp out/presentation-poster.jpg ../static/videos/ && echo 'Published to static/videos/'"
  },
  "dependencies": {
    "@remotion/cli": "^4.0.0",
    "@remotion/player": "^4.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "remotion": "^4.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "typescript": "^5.5.0"
  }
}

**tsconfig.json:**
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}

**remotion.config.ts:**
import { Config } from "@remotion/cli/config";
Config.setVideoImageFormat("jpeg");

**src/index.ts:**
import { registerRoot } from "remotion";
import { Root } from "./Root";
registerRoot(Root);

### 2. Create theme + types

**src/theme.ts** — extract from storyboard JSON theme object:
```typescript
export const theme = {
  bg: "#0a0a0f",
  bgCard: "#141420",
  accent: "<accentColor>",
  text: "#f5f5f5",
  textDim: "#a0a0b0",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  border: "#2a2a3e",
};
```

**src/types.ts** — TypeScript interfaces matching the storyboard JSON structure.

### 3. Create scene components

Build scene components that render based on the scene `type` field:

**src/scenes/TitleScene.tsx** — type: "title"
  - Large headline with tracking-in-expand animation
  - Subtitle fades in below
  - Optional tagline
  - Radial gradient background with accent color
  - Logo or project name mark

**src/scenes/ContentScene.tsx** — type: "content"
  This is the main scene component. Two halves:

  **Challenge half** (first 40% of duration):
  - Dark card with warm/red tint
  - "The old way:" header
  - Challenge text fading in
  - Pain point visual (subtle warning icon or red accent border)

  **Feature half** (remaining 60% of duration):
  - LEFT SIDE: Real app screenshot in browser chrome frame
    - Browser chrome: traffic light dots + URL bar showing project domain
    - Screenshot: `<Img src={staticFile("scene-<NN>.png")} />` (use Remotion's Img + staticFile)
    - Spring entrance from bottom
    - Crop to viewport (objectFit: "cover", objectPosition: "top")
    - If no screenshot exists for this scene, show a gradient placeholder card
  - RIGHT SIDE: Feature headline + highlight bullets
    - Headline: fade-in-bottom
    - Highlights: stagger-slide-in with green checkmark indicators
    - Max 5 highlights shown (even if more in the data)

  **Crossfade**: Both halves overlap by overlapFrames for smooth transition.

**src/scenes/SummaryScene.tsx** — type: "summary"
  - "Before → After" comparison table
  - Items stagger in with fade animation
  - Two columns: old way (dimmed) vs new way (bright accent)

**src/scenes/CTAScene.tsx** — type: "cta"
  - Headline: tracking-in-expand
  - Next steps items
  - Tagline at bottom
  - Subtle radial gradient
  - Logo mark

### 4. Create composition

**src/PresentationVideo.tsx** — sequences all scenes using `<Sequence>`:
  - Read the storyboard JSON (import or pass as props)
  - For each scene in the scenes array, render a `<Sequence>` with the correct component based on `scene.type`
  - Use startFrame and durationFrames from the JSON
  - Each scene fades out in its final 30 frames for crossfade effect
  - If narration audio exists, include `<Audio src={staticFile("presentation-narration.mp3")} />`

**src/Root.tsx** — registers the Presentation composition:
```typescript
import { Composition } from "remotion";
import { PresentationVideo } from "./PresentationVideo";
import storyboard from "../../docs/videos/presentation-storyboard.json";

export const Root: React.FC = () => {
  return (
    <Composition
      id="Presentation"
      component={PresentationVideo}
      durationInFrames={storyboard.duration.totalFrames}
      fps={storyboard.duration.fps}
      width={1920}
      height={1080}
      defaultProps={{ storyboard }}
    />
  );
};
```

### 5. Install and render

  cd <projectDir>/video && npm install
  npx remotion render src/index.ts Presentation out/presentation.mp4 --codec h264 --concurrency 4
  npx remotion still src/index.ts Presentation out/presentation-poster.jpg --frame 300 --image-format jpeg

### 6. Copy to static directory

  mkdir -p <projectDir>/static/videos
  cp <projectDir>/video/out/presentation.mp4 <projectDir>/static/videos/
  cp <projectDir>/video/out/presentation-poster.jpg <projectDir>/static/videos/

### 7. Verify

  ls -lh <projectDir>/static/videos/presentation.mp4
  ls -lh <projectDir>/static/videos/presentation-poster.jpg
  ffprobe -i <projectDir>/static/videos/presentation.mp4 \
    -show_entries format=duration -v quiet -of csv="p=0" 2>/dev/null || echo "ffprobe not available"

Report: file size, duration, frame count, any render warnings.

## Key Implementation Notes
- Use `import { Img, staticFile, Audio, Sequence } from "remotion"` for all asset references
- Screenshots in video/public/ are served as static files via staticFile()
- Font sizes MUST be LARGE: 94px headlines, 42px section titles, 34px body text, 28px bullets
- All text must be readable at 1080p — test with remotion studio before rendering
- Each scene fades out in its final 30 frames for crossfade transitions
- The ContentScene screenshot browser chrome should show the project's domain (from CLAUDE.md), not localhost
- If a screenshot file doesn't exist for a scene, render a gradient placeholder instead of crashing
- Audio sync: if narration exists, the total video duration should approximately match the audio duration
```

---

## STEP 5: Report

After the render completes, output a summary:

```
╔════════════════════════════════════════════════════════╗
║         PRESENTATION VIDEO COMPLETE                    ║
╚════════════════════════════════════════════════════════╝

Video: static/videos/presentation.mp4
Poster: static/videos/presentation-poster.jpg
Audio: static/videos/presentation-narration.mp3

Scenes: <N> content scenes + opening + closing
Duration: ~<M> minutes
Screenshots captured: <X>/<Y>
Missing screenshots: <list or "none">

To preview: cd video && npx remotion studio --port 3100
To re-render: cd video && npm run publish
```

Then emit `jat-signal review` with the results.
