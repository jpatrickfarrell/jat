// JAT IDE brand theme — matches ide/src/app.css [data-theme='jat']
export const theme = {
  bg: "#0a0a0f",
  bgCard: "#141420",
  bgCardLight: "#1a1a2e",
  bgPanel: "#0f0f1a",

  // Animation color vars (from --anim-*)
  primary: "#4d8fff",       // oklch(0.70 0.18 240) ≈ bright blue
  primaryBright: "#6eaaff", // oklch(0.80 0.18 240)
  primaryDim: "#3366cc",    // oklch(0.60 0.15 240)

  success: "#2dbe6e",       // oklch(0.65 0.20 145) ≈ green
  successBright: "#45d688", // oklch(0.70 0.22 145)

  warning: "#d4a843",       // oklch(0.75 0.15 85) ≈ amber/gold
  warningBright: "#e8bf56", // oklch(0.80 0.18 85)

  error: "#e8614a",         // oklch(0.70 0.20 25) ≈ red

  info: "#42b5d6",          // oklch(0.70 0.18 200) ≈ cyan

  text: "#f5f5f5",
  textDim: "#a0a0b0",
  textMuted: "#6b7280",
  border: "#2a2a3e",
  borderLight: "#353550",
} as const;

export const fonts = {
  heading: "system-ui, -apple-system, sans-serif",
  body: "system-ui, -apple-system, sans-serif",
  mono: "ui-monospace, 'SF Mono', 'Cascadia Code', monospace",
} as const;

// Agent names used in the video
export const agents = [
  { name: "FreeMarsh", color: "#4d8fff" },
  { name: "PaleStar", color: "#42b5d6" },
  { name: "StrongShore", color: "#2dbe6e" },
] as const;
