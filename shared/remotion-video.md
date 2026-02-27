## Remotion Video Creation (for SvelteKit projects)

Programmatic video generation using [Remotion](https://www.remotion.dev/) — React-based motion graphics that render to MP4. Use this when a project needs a teaser, explainer, or product demo video.

### Quick Start (5 steps)

```bash
# 1. Create video/ subdirectory in your SvelteKit project
mkdir -p video/src/scenes video/public video/out

# 2. Install (see package.json template below)
cd video && npm install

# 3. Preview in browser
npx remotion studio --port 3100

# 4. Render to MP4
npx remotion render CompositionId out/video.mp4 --codec h264

# 5. Generate poster image from a specific frame
npx remotion still CompositionId --frame 900 --output ../static/poster.jpg --image-format jpeg --jpeg-quality 90

# 6. Copy to SvelteKit static/
cp out/video.mp4 ../static/
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

```json
{
  "name": "project-video",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "remotion studio",
    "build": "remotion render MainVideo out/video.mp4",
    "still": "remotion still MainVideo --frame 900 --output out/poster.jpg --image-format jpeg"
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
# MP4 (H.264) — best compatibility, ~4MB for 45s
npx remotion render CompositionId out/video.mp4 --codec h264

# WebM (VP8) — smaller, web-optimized
npx remotion render CompositionId out/video.webm --codec vp8

# Still frame (poster image)
npx remotion still CompositionId --frame 900 --output out/poster.jpg --image-format jpeg --jpeg-quality 90

# First render downloads Chrome Headless Shell (~87MB), cached after that
# Rendering 1350 frames takes ~20-30s with 8x concurrency
```

### Gotchas

- **Remotion is React, not Svelte** — the `video/` directory is a standalone React/TypeScript project. Don't mix with SvelteKit's build.
- **First render is slow** — downloads Chrome Headless Shell (~87MB). Subsequent renders use cache.
- **No custom fonts** — use system fonts or load via `@remotion/google-fonts` package. System fonts are the safest.
- **SVG for graphics** — inline SVGs render perfectly. Avoid external image URLs (they may fail in headless render).
- **Interactive CLI** — `npx create-video` is interactive and can't be used in automated scripts. Create files manually instead.
- **Static assets** — put images/fonts in `video/public/`, reference as `/filename.png` in components.
- **Don't commit `video/node_modules/` or `video/out/`** — add to `.gitignore`. Do commit the rendered `static/*.mp4`.
