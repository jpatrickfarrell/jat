## Remotion Video Creation (for SvelteKit projects)

Programmatic video generation using [Remotion](https://www.remotion.dev/) — React-based motion graphics that render to MP4. Use this when a project needs a teaser, explainer, or product demo video.

### Quick Start

```bash
# 1. Create video/ subdirectory in your SvelteKit project
mkdir -p video/src/scenes video/public video/out

# 2. Install (see package.json template below)
cd video && npm install

# 3. Preview in browser (hot-reloads on file save)
npx remotion studio --port 3100

# 4. Render + version + copy to static/ (one command)
npm run publish
# → Renders MP4 + poster, copies to ../static/ with version tag
# → e.g. static/video-v1.0.0.mp4, static/video.mp4 (active)

# 5. Iterate: edit scenes, bump version, re-publish
# In package.json: "version": "1.1.0"
npm run publish
# → static/video-v1.1.0.mp4 + updates static/video.mp4
```

### Project Structure

```
your-sveltekit-project/
├── static/
│   ├── video.mp4          ← Rendered output (served as /video.mp4)
│   └── poster.jpg         ← Poster frame
├── video/                 ← Remotion project (separate from SvelteKit)
│   ├── package.json
│   ├── tsconfig.json
│   ├── remotion.config.ts
│   └── src/
│       ├── index.ts       ← registerRoot entry point
│       ├── Root.tsx        ← Composition definitions
│       ├── MainVideo.tsx   ← Main composition (sequences scenes)
│       ├── theme.ts        ← Brand colors, fonts
│       └── scenes/
│           ├── Scene1.tsx
│           ├── Scene2.tsx
│           └── ...
```

### package.json Template

The `publish` script handles render + version + copy to `static/` in one command. Version in `package.json` drives the filename (`teaser-v1.1.0.mp4`). Bump version, run `npm run publish`.

```json
{
  "name": "project-video",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "remotion studio",
    "render": "remotion render src/index.ts MainVideo out/video.mp4 --codec h264",
    "render:poster": "remotion still src/index.ts MainVideo out/poster.jpg --frame 900 --image-format jpeg",
    "render:webm": "remotion render src/index.ts MainVideo out/video.webm --codec vp8",
    "publish": "npm run render && npm run render:poster && node -e \"const v=require('./package.json').version; const {cpSync}=require('fs'); cpSync('out/video.mp4','../static/video-v'+v+'.mp4'); cpSync('out/video.mp4','../static/video.mp4'); cpSync('out/poster.jpg','../static/poster-v'+v+'.jpg'); cpSync('out/poster.jpg','../static/poster.jpg'); console.log('Published v'+v+' to static/')\"",
    "preview": "remotion preview"
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
```

### Boilerplate Files

**src/index.ts**
```ts
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";
registerRoot(RemotionRoot);
```

**Root.tsx**
```tsx
import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MainVideo"
    component={MainVideo}
    durationInFrames={1350}  // 45s at 30fps
    fps={30}
    width={1920}
    height={1080}
  />
);
```

**remotion.config.ts**
```ts
import { Config } from "@remotion/cli/config";
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
```

### Core Remotion Concepts

**Frame math:** `durationInFrames = seconds × fps`. At 30fps: 1s = 30 frames, 45s = 1350 frames.

**Sequences** define when scenes appear on the timeline:
```tsx
<AbsoluteFill style={{ backgroundColor: "#0a0a0f" }}>
  <Sequence from={0} durationInFrames={240}>     {/* 0-8s */}
    <Scene1 />
  </Sequence>
  <Sequence from={210} durationInFrames={300}>    {/* 7-17s (overlap = crossfade) */}
    <Scene2 />
  </Sequence>
</AbsoluteFill>
```

**Animations** use `interpolate` and `spring`:
```tsx
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();
const { fps } = useVideoConfig();

// Linear interpolation (opacity fade-in over 30 frames)
const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

// Spring physics (bouncy entrance)
const scale = spring({ frame: frame - 20, fps, config: { damping: 12, stiffness: 100 } });

// Slide in from right
const translateX = interpolate(spring({ frame, fps }), [0, 1], [200, 0]);
```

**Exit animations** — fade out at end of scene:
```tsx
const exitOpacity = interpolate(frame, [200, 240], [1, 0], { extrapolateRight: "clamp" });
```

### Scene Pattern Template

Every scene follows this structure:

```tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const SceneTemplate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance
  const entranceOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });

  // Title animation
  const titleY = interpolate(frame, [5, 30], [30, 0], { extrapolateRight: "clamp" });

  // Content animations (staggered springs)
  const item1 = spring({ frame: frame - 40, fps, config: { damping: 15, stiffness: 120 } });
  const item2 = spring({ frame: frame - 52, fps, config: { damping: 15, stiffness: 120 } });

  // Exit
  const exitOpacity = interpolate(frame, [170, 210], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      backgroundColor: "#0a0a0f",
      opacity: entranceOpacity * exitOpacity,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ transform: `translateY(${titleY}px)`, fontSize: 52, fontWeight: 800, color: "#f5f5f5" }}>
        Scene Title
      </div>
      {/* Content with staggered animations */}
    </AbsoluteFill>
  );
};
```

### Theme Template

Match your SvelteKit project's brand:

```ts
export const theme = {
  bg: "#0a0a0f",
  bgCard: "#141420",
  accent: "#f59e0b",       // your brand accent
  text: "#f5f5f5",
  textDim: "#a0a0b0",
  textMuted: "#6b7280",
  success: "#10b981",
  border: "#2a2a3e",
} as const;

export const fonts = {
  heading: "system-ui, -apple-system, sans-serif",
  body: "system-ui, -apple-system, sans-serif",
  mono: "ui-monospace, 'SF Mono', monospace",
} as const;
```

### SvelteKit Integration

Replace any placeholder in your Svelte page with a real `<video>` element:

```svelte
<!-- svelte-ignore a11y_media_has_caption -->
<video
  class="w-full h-full object-cover rounded-2xl"
  poster="/poster.jpg"
  preload="metadata"
  playsinline
  controls
>
  <source src="/video.mp4" type="video/mp4" />
</video>
```

The files in `static/` are served at the root path (`/video.mp4`, `/poster.jpg`) by both Vite dev and Cloudflare Pages in production.

### Typical Scene Durations (45s total)

| Scene | Purpose | Frames (30fps) | Seconds |
|-------|---------|-----------------|---------|
| 1 | Hook/intro | 210-240 | 7-8s |
| 2 | Core feature demo | 270-300 | 9-10s |
| 3 | Trust/verification | 180-210 | 6-7s |
| 4 | Key result/outcome | 210-240 | 7-8s |
| 5 | Dashboard/portal | 270-300 | 9-10s |
| 6 | CTA | 180-210 | 6-7s |

**Overlap sequences by ~30 frames** for smooth crossfades between scenes.

### Animation Recipes

**Staggered list items:**
```tsx
const items = ["Item 1", "Item 2", "Item 3"];
{items.map((item, i) => {
  const progress = spring({ frame: frame - 40 - i * 12, fps, config: { damping: 15, stiffness: 120 } });
  return (
    <div style={{
      opacity: interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
      transform: `translateX(${interpolate(progress, [0, 1], [60, 0])}px)`,
    }}>
      {item}
    </div>
  );
})}
```

**Counting number (e.g. price):**
```tsx
const progress = interpolate(frame, [40, 120], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
const value = Math.round(interpolate(progress, [0, 1], [0, 147850]));
<span>{value.toLocaleString("en-US")}</span>
```

**Scanning line:**
```tsx
const scanY = interpolate(frame, [50, 200], [0, 400], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
<div style={{
  position: "absolute", left: 0, right: 0, top: scanY, height: 3,
  background: `linear-gradient(90deg, transparent, #f59e0b, transparent)`,
  boxShadow: "0 0 20px #f59e0b80",
}} />
```

**Stamp/badge entrance:**
```tsx
const stampScale = spring({ frame: frame - 120, fps, config: { damping: 6, stiffness: 200 } });
const stampRotation = interpolate(stampScale, [0, 1], [-20, -8]);
<div style={{ transform: `scale(${stampScale}) rotate(${stampRotation}deg)` }}>APPROVED</div>
```

### Render Commands

```bash
# IMPORTANT: Use src/index.ts (the registerRoot file), NOT Root.tsx
# Remotion CLI needs the entry point that calls registerRoot()

# MP4 (H.264) — best compatibility, ~5-6MB for 45s
npx remotion render src/index.ts CompositionId out/video.mp4 --codec h264

# WebM (VP8) — smaller, web-optimized
npx remotion render src/index.ts CompositionId out/video.webm --codec vp8

# Still frame (poster image)
npx remotion still src/index.ts CompositionId --frame 900 --output out/poster.jpg --image-format jpeg

# First render downloads Chrome Headless Shell (~87MB), cached after that
# Rendering 1350 frames takes ~20-30s with 8x concurrency
```

### Versioning Workflow

Keep versioned copies so you can compare iterations and roll back:

```bash
# After each render, save a versioned copy AND update the active file
cp video/out/video.mp4 static/video-v1.0.mp4    # versioned backup
cp video/out/video.mp4 static/video.mp4          # active (served to users)
cp video/out/poster.jpg static/poster-v1.0.jpg
cp video/out/poster.jpg static/poster.jpg

# Next iteration: edit scenes, re-render, save as v1.1
cp video/out/video.mp4 static/video-v1.1.mp4
cp video/out/video.mp4 static/video.mp4
```

**File inventory pattern:**
```
static/
├── video.mp4            ← Active (always latest)
├── video-v1.0.mp4       ← First render
├── video-v1.1.mp4       ← Scaled up 17%
├── video-v1.2.mp4       ← Next iteration...
├── poster.jpg           ← Active poster
├── poster-v1.0.jpg
└── poster-v1.1.jpg
```

### Size Tuning Guide

Videos render at 1920x1080 but display embedded at ~800px width on a page — **roughly 42% of native size**. Text that looks fine at 1080p becomes illegible when shrunk.

**Recommended font sizes for embedded playback (at 1920x1080 canvas):**

| Element | Minimum | Recommended | Notes |
|---------|---------|-------------|-------|
| Scene titles | 80px | 94-110px | Bold (800+), should dominate the frame |
| Subtitles | 34px | 40-42px | Readable but secondary |
| Body/labels | 26px | 30-35px | Spec labels, timeline items, list text |
| Mono values | 28px | 33-36px | Data values, prices, dimensions |
| Small labels | 18px | 21-24px | URL bars, dates, meta text |
| Hero numbers | 100px | 130px+ | Prices, key metrics — make them huge |
| CTA headline | 100px | 118px+ | The thing you want people to read |
| Buttons | 28px | 33px | With generous padding (24px 72px) |

**Element sizing:**

| Element | Minimum | Recommended |
|---------|---------|-------------|
| Card/dropzone | 800px wide | 940px+ wide |
| Portal mockup | 1200px wide | 1400px wide |
| Icons (shields, checkmarks) | 160px | 188px+ |
| Checkboxes | 36px | 42px |
| Gaps/spacing | Scale with text | 1.17× of text scale |

**Iteration process:**
1. Render v1.0 with initial sizes
2. Embed on page, scrub through scenes at embedded size
3. If text feels small, bump everything ~17% (multiply by 1.17)
4. Re-render as v1.1, compare
5. Repeat if needed — usually 2-3 iterations to dial in

### Gotchas

- **Entry point**: Use `src/index.ts` (the file with `registerRoot()`), NOT `Root.tsx`. The CLI will error if you pass the wrong file.
- **Remotion is React, not Svelte** — the `video/` directory is a standalone React/TypeScript project. Don't mix with SvelteKit's build.
- **First render is slow** — downloads Chrome Headless Shell (~87MB). Subsequent renders use cache.
- **No custom fonts** — use system fonts or load via `@remotion/google-fonts` package. System fonts are the safest.
- **SVG for graphics** — inline SVGs render perfectly. Avoid external image URLs (they may fail in headless render).
- **Interactive CLI** — `npx create-video` is interactive and can't be used in automated scripts. Create files manually instead.
- **Static assets** — put images/fonts in `video/public/`, reference as `/filename.png` in components.
- **Don't commit `video/node_modules/` or `video/out/`** — add to `.gitignore`. Do commit the rendered `static/*.mp4`.
- **431 errors on localhost** — cookie bloat from multiple dev servers. Fix: `NODE_OPTIONS="--max-http-header-size=65536"` when starting Remotion studio or the SvelteKit dev server.
- **Embedded sizing** — 1920×1080 video at ~800px embed width means everything renders at ~42% native size. Start with large fonts and iterate down, not up.
