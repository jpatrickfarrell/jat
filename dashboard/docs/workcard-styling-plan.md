# WorkCard Styling Plan: Match AgentCard

## Current Differences

### AgentCard (Industrial/Terminal Style)
```css
/* Card wrapper */
background: linear-gradient(135deg, {statusVisual.bgTint} 0%, transparent 50%);
border: 1px solid oklch(0.5 0 0 / 0.15);
box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.05), 0 2px 8px oklch(0 0 0 / 0.1);
rounded-lg

/* Status accent bar */
- Left edge colored bar with glow effect
- Color based on agent status (working/live/active/idle/offline)

/* Typography */
- font-mono everywhere
- text-[9px], text-[10px], text-[11px] (tiny text)
- tracking-wider uppercase for labels
- oklch colors for text: oklch(0.5 0 0 / 0.4) for muted, oklch(0.85 0.05 145) for content

/* Section headers */
background: linear-gradient(90deg, {accent} 0%, oklch(0.18 0.01 250) 100%);
border-bottom: 1px solid oklch(0.5 0 0 / 0.08);

/* Tab bar */
background: oklch(0.5 0 0 / 0.06);
border: 1px solid oklch(0.5 0 0 / 0.1);

/* Output area */
background: oklch(0.12 0.01 250);
color: oklch(0.85 0.05 145);
```

### WorkCard (Current - DaisyUI Classes)
```css
/* Card wrapper */
bg-base-100 shadow-lg border border-base-300

/* Typography */
- Mixed: some font-mono, some default
- Larger text sizes (text-base, text-sm, text-xs)
- DaisyUI color classes

/* Output area */
background: oklch(0.14 0.01 250);
color: oklch(0.75 0.02 250);
```

## Changes Required

### 1. Card Wrapper
**File:** `WorkCard.svelte` line 301-307

Replace:
```svelte
<div
  class="card bg-base-100 shadow-lg border overflow-hidden {className}"
  class:border-base-300={!showCompletionBanner}
  class:border-success={showCompletionBanner}
  style="min-height: 300px;"
```

With:
```svelte
<div
  class="relative flex flex-col rounded-lg overflow-hidden transition-all duration-200 {className}"
  style="
    background: linear-gradient(135deg, oklch(0.22 0.02 250) 0%, transparent 50%);
    border: 1px solid {showCompletionBanner ? 'oklch(0.65 0.20 145)' : 'oklch(0.5 0 0 / 0.15)'};
    box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.05), 0 2px 8px oklch(0 0 0 / 0.1);
    min-height: 300px;
  "
```

### 2. Add Status Accent Bar
Add left edge accent bar (like AgentCard):
```svelte
<!-- Status accent bar (left edge) -->
<div
  class="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300"
  style="background: {isComplete ? 'oklch(0.65 0.20 145)' : 'oklch(0.60 0.18 250)'};
         box-shadow: 0 0 12px {isComplete ? 'oklch(0.65 0.20 145 / 0.5)' : 'oklch(0.60 0.18 250 / 0.3)'};"
></div>
```

### 3. Header Section (card-body)
**Line 369:** Replace `card-body p-4 pb-2` with custom padding

Update typography:
- Task title: `font-mono font-bold text-sm tracking-wide`
- Priority badge: oklch styling
- Agent name: `font-mono text-[10px] tracking-wider`

### 4. Output Section Header
**Line 475:** Replace `bg-base-200/50` with gradient:
```svelte
style="background: linear-gradient(90deg, oklch(0.60 0.14 250 / 0.1) 0%, oklch(0.18 0.01 250) 100%);
       border-bottom: 1px solid oklch(0.5 0 0 / 0.08);"
```

Typography: `font-mono text-[10px] tracking-widest uppercase`

### 5. Output Content Area
**Line 493-502:** Already uses oklch, minor adjustments:
- Background: `oklch(0.12 0.01 250)` (slightly darker)
- Text: `oklch(0.85 0.05 145)` (greenish terminal)

### 6. Input Section
**Line 506:** Replace background with:
```svelte
style="background: oklch(0.16 0.01 250); border-top: 1px solid oklch(0.5 0 0 / 0.08);"
```

### 7. Quick Action Buttons
Update to match AgentCard button style:
- `font-mono text-[10px] tracking-wider uppercase`
- oklch-based colors instead of inline styles

### 8. Section Borders
Replace all `border-base-200`, `border-base-300` with:
```css
border-color: oklch(0.5 0 0 / 0.08);
```

## Implementation Order

1. [ ] Card wrapper (gradient bg, border, shadow)
2. [ ] Add status accent bar
3. [ ] Header typography (task title, badges)
4. [ ] Output section header (gradient, typography)
5. [ ] Output content area (colors)
6. [ ] Input section styling
7. [ ] Quick action buttons
8. [ ] Border consistency

## Color Palette Reference (from AgentCard)

```css
/* Backgrounds */
--bg-card: linear-gradient(135deg, {tint} 0%, transparent 50%)
--bg-section: oklch(0.5 0 0 / 0.06)
--bg-header: linear-gradient(90deg, {accent}/0.1, oklch(0.18 0.01 250))
--bg-terminal: oklch(0.12 0.01 250)
--bg-input: oklch(0.16 0.01 250)

/* Borders */
--border-card: oklch(0.5 0 0 / 0.15)
--border-section: oklch(0.5 0 0 / 0.08)
--border-accent: oklch(0.5 0 0 / 0.1)

/* Text */
--text-muted: oklch(0.5 0 0 / 0.4)
--text-secondary: oklch(0.5 0 0 / 0.5)
--text-terminal: oklch(0.85 0.05 145)
--text-label: font-mono text-[10px] tracking-widest uppercase

/* Accents */
--accent-working: oklch(0.65 0.20 250) /* Blue */
--accent-success: oklch(0.65 0.20 145) /* Green */
--accent-warning: oklch(0.70 0.16 85)  /* Yellow */
--accent-error: oklch(0.65 0.25 25)    /* Red */
```
