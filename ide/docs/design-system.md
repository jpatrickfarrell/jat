# JAT IDE Design System

Design tokens and component patterns for consistent UI across the IDE. **Agents must reference this when writing any CSS.**

## Font Stacks

The IDE uses exactly **two** font stacks. No other stacks should be introduced.

| Token | Stack | Use |
|-------|-------|-----|
| **mono** | `ui-monospace, monospace` | Default for everything — table cells, headers, labels, badges, inputs, buttons |
| **mono-full** | `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace` | SearchDropdown triggers and panels (defined in component) |

**Rules:**
- `ui-monospace, monospace` is the standard — use this for all new CSS
- Never use bare `monospace`, `'JetBrains Mono'`, or `'Fira Code'`
- The SearchDropdown component owns `mono-full`; don't copy it into page styles
- Table body text inherits from the page — set `font-family` on the page container, not individual cells

**Font Sizes:**

| Size | Value | Use |
|------|-------|-----|
| `xs` | 0.6875rem (11px) | Task IDs, tiny labels, badge text |
| `sm` | 0.75rem (12px) | Stats, filter chips, secondary text |
| `base` | 0.8125rem (13px) | Table body, inputs, dropdown triggers, buttons |
| `lg` | 0.9375rem (15px) | Section headers |
| `xl` | 1.25rem (20px) | Page titles |

## Color Tokens (OKLCH)

Full theming docs in `docs/theming.md`. Quick reference for common patterns:

### Surface Colors

| Token | Value | Use |
|-------|-------|-----|
| `bg-page` | `oklch(0.14 0.01 250)` | Page background |
| `bg-surface` | `oklch(0.16 0.01 250)` | Cards, inputs, dropdowns, table headers |
| `bg-surface-hover` | `oklch(0.18 0.01 250)` | Hover state on surfaces |
| `bg-elevated` | `oklch(0.20 0.01 250)` | Elevated panels, active rows |
| `bg-section` | `oklch(0.18 0.01 250)` | Section containers |

### Border Colors

| Token | Value | Use |
|-------|-------|-----|
| `border-subtle` | `oklch(0.20 0.01 250)` | Table row separators |
| `border-default` | `oklch(0.25 0.02 250)` | Input borders, card borders |
| `border-hover` | `oklch(0.30 0.02 250)` | Hover state on borders |
| `border-focus` | `oklch(0.55 0.12 220)` | Focus rings (blue) |
| `border-section` | `oklch(0.24 0.02 250)` | Table header bottom border |

### Text Colors

| Token | Value | Use |
|-------|-------|-----|
| `text-primary` | `oklch(0.90 0.02 250)` | Primary text, input values |
| `text-secondary` | `oklch(0.65 0.02 250)` | Secondary text, descriptions |
| `text-muted` | `oklch(0.55 0.02 250)` | Table headers, placeholder-adjacent |
| `text-dim` | `oklch(0.45 0.02 250)` | Placeholders, disabled text |
| `text-link` | `oklch(0.70 0.15 220)` | Clickable text |

### Status Colors

| Status | Color | Use |
|--------|-------|-----|
| `status-open` | `oklch(0.70 0.15 220)` | Open tasks (blue) |
| `status-progress` | `oklch(0.75 0.15 85)` | In progress (amber) |
| `status-blocked` | `oklch(0.65 0.18 30)` | Blocked (red-orange) |
| `status-closed` | `oklch(0.65 0.18 145)` | Closed/success (green) |

### Priority Colors

| Priority | Color | Use |
|----------|-------|-----|
| P0 Critical | `oklch(0.70 0.20 25)` | Red |
| P1 High | `oklch(0.75 0.15 85)` | Amber |
| P2 Medium | `oklch(0.70 0.15 200)` | Blue |
| P3 Low | `oklch(0.55 0.03 250)` | Gray |
| P4 Lowest | `oklch(0.45 0.01 250)` | Dim gray |

## Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `rounded-sm` | 0.25rem | Small badges, inline labels |
| `rounded-md` | 0.375rem | Legacy inputs (avoid in new code) |
| `rounded-lg` | 0.5rem | **Standard** — inputs, buttons, dropdowns, cards, panels |
| `rounded-xl` | 0.75rem | Section containers, large cards |
| `rounded-full` | 9999px | Pills, filter chips, avatars |

**Default is `0.5rem`** — use this for all new inputs, buttons, and dropdown triggers.

## Component Patterns

### Input / Trigger (standard interactive control)

All filter inputs, buttons, and dropdown triggers should match this pattern:

```css
.control {
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    font-family: ui-monospace, monospace;
    font-size: 0.8125rem;
    min-height: 2rem;
    cursor: pointer;
    background: oklch(0.16 0.01 250);
    border: 1px solid oklch(0.25 0.02 250);
    color: oklch(0.85 0.02 250);
    transition: background 0.15s, border-color 0.15s;
}
.control:hover {
    background: oklch(0.18 0.01 250);
    border-color: oklch(0.30 0.02 250);
}
.control:focus {
    border-color: oklch(0.55 0.12 220);
    outline: none;
}
```

This matches the SearchDropdown `.sd-trigger` pattern and should be used for:
- Search inputs
- Select/dropdown triggers
- Filter buttons (like "Columns")
- Any interactive filter bar control

### Table Headers

```css
th {
    padding: 0.5rem 0.75rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: oklch(0.55 0.02 250);
    background: oklch(0.16 0.01 250);
    border-bottom: 1px solid oklch(0.24 0.02 250);
}
```

### Table Cells

```css
td {
    padding: 0.4rem 0.75rem;
    border-bottom: 1px solid oklch(0.20 0.01 250);
    vertical-align: middle;
    overflow: hidden;
    text-overflow: ellipsis;
}
```

### Table Row Hover

```css
tr:hover {
    background: oklch(0.20 0.02 250);
}
```

### Dropdown Panels

```css
.panel {
    position: absolute;
    z-index: 50;
    margin-top: 0.25rem;
    min-width: 12rem;
    border-radius: 0.5rem;
    overflow: hidden;
    box-shadow: 0 4px 24px oklch(0 0 0 / 0.4);
    background: oklch(0.16 0.01 250);
    border: 1px solid oklch(0.25 0.02 250);
}
```

### Context Menu Items

```css
.menu-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.375rem 0.625rem;
    font-size: 0.8125rem;
    color: oklch(0.85 0.02 250);
    background: transparent;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background 0.1s;
}
.menu-item:hover {
    background: oklch(0.24 0.03 250);
}
.menu-item svg {
    width: 14px;
    height: 14px;
    color: oklch(0.55 0.02 250);
}
```

### Page Layout

```css
.page {
    padding: 1rem 1.5rem;
    max-width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.page-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: oklch(0.90 0.02 250);
}
```

### Badges (status dots)

```css
.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}
```

## Spacing Scale

See `docs/spacing-guidelines.md` for full details. Quick reference:

| Token | Value | Use |
|-------|-------|-----|
| `xs` | 0.125rem (2px) | Micro spacing |
| `sm` | 0.25rem (4px) | Tight gaps |
| `md` | 0.375rem (6px) | Compact elements |
| `base` | 0.5rem (8px) | Standard gaps |
| `lg` | 0.75rem (12px) | Section gaps |
| `xl` | 1rem (16px) | Panel padding |

## Filter Bars

Filter bars should use `display: flex` with `gap: 0.5rem` and `align-items: center`. All controls in a filter bar use the Input/Trigger pattern above.

**Preferred components for filters:**
- **SearchDropdown** — for single-select with search (projects, types, statuses)
- **DaisyUI `filter`** — for small fixed option sets displayed as pill buttons
- **Text input** — for free-text search

## What NOT To Do

- Don't use `font-family: monospace` (bare) — always `ui-monospace, monospace`
- Don't use `border-radius: 0.375rem` for new controls — use `0.5rem`
- Don't define one-off oklch colors — check this doc first
- Don't use `<select>` elements — use SearchDropdown
- Don't hardcode `font-family` on every element — set it on the container and inherit
- Don't copy the SearchDropdown's `mono-full` font stack into page CSS
- Don't invent new animation keyframes without checking `app.css` first (see `css-animations.md`)

## Files Reference

| File | Contains |
|------|----------|
| `src/app.css` | Theme definitions, animation keyframes, utility classes |
| `src/lib/components/SearchDropdown.svelte` | Reference dropdown pattern |
| `src/lib/config/statusColors.ts` | Programmatic status/state visuals |
| `docs/theming.md` | Full OKLCH color system documentation |
| `docs/spacing-guidelines.md` | Spacing scale details |
| `docs/design-system.md` | This file |
