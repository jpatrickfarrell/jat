## CSS Animation Approach and Design Guidelines

This document covers CSS animation strategy for both the JAT IDE and SaaS app projects (JST template, Headcount, etc.).

---

## Standard SaaS App Animation System

All SaaS apps built from the JST template include a shared animation library and scroll-reveal system. **When doing animation work on any SaaS project, use this standard.**

### Files (included in JST template, copy to new projects)

| File | Purpose |
|------|---------|
| `src/lib/animista.css` | Animation keyframes + utility classes (imported in root layout) |
| `src/lib/actions/reveal.ts` | Svelte `use:reveal` action for scroll-triggered animations |

### Available Animations

| Class | Effect | Use On |
|-------|--------|--------|
| `tracking-in-expand` | Letters expand in from compressed | Page headings, hero text |
| `tracking-out-contract` | Letters compress out | Heading exit transitions |
| `slide-in-blurred-left` | Slide from left with blur+scale | Hero images, avatars, feature images |
| `fade-in-bottom` | Rise up while fading in | Section cards (default for `use:reveal`) |
| `scale-in-center` | Scale from zero | Metric cards, badges, grid items |
| `fade-in` | Simple opacity fade | List items, table rows (with stagger) |

### The `use:reveal` Action (Scroll-Triggered)

Import and use on any element to animate it when it scrolls into view:

```svelte
<script>
  import { reveal } from "$lib/actions/reveal"
</script>

<!-- Default: fade-in-bottom when element enters viewport -->
<div use:reveal>...</div>

<!-- Custom animation -->
<div use:reveal={{ animation: 'scale-in-center' }}>...</div>

<!-- Staggered delay (seconds) -->
<div use:reveal={{ delay: 0.2 }}>...</div>

<!-- Custom visibility threshold (0-1) -->
<div use:reveal={{ threshold: 0.3 }}>...</div>
```

### Standard Page Animation Patterns

Apply these patterns when animating SaaS app pages:

#### 1. Hero / Header Section (above the fold, instant)
- **Main heading (h1):** `tracking-in-expand` class directly
- **Hero image / avatar:** `slide-in-blurred-left` class directly
- **Badges:** `tracking-in-expand` class directly

#### 2. Stat/Metric Card Grids (staggered scale)
```svelte
{#each metrics as metric, i}
  <div class="card" use:reveal={{ animation: 'scale-in-center', delay: i * 0.1 }}>
    ...
  </div>
{/each}
```

#### 3. Section Cards (scroll reveal)
```svelte
<!-- Each major section fades up when scrolled into view -->
<div class="card" use:reveal>
  <h2 class="tracking-in-expand">Section Title</h2>
  ...
</div>
```

#### 4. List/Table Items (staggered fade)
```svelte
{#each items as item, i}
  <tr use:reveal={{ animation: 'fade-in', delay: i * 0.05 }}>...</tr>
{/each}
```

#### 5. Release/Card Lists (staggered fade, wider spacing)
```svelte
{#each releases as release, i}
  <div use:reveal={{ animation: 'fade-in', delay: i * 0.08 }}>...</div>
{/each}
```

### Timing Reference

| Pattern | Animation | Delay Between Items |
|---------|-----------|---------------------|
| Metric cards (grid) | `scale-in-center` | 100ms |
| Table rows | `fade-in` | 50ms |
| List items (cards) | `fade-in` | 80ms |
| Section cards | `fade-in-bottom` | none (scroll-triggered) |
| Headings | `tracking-in-expand` | none (instant) |
| Images | `slide-in-blurred-left` | none (instant) |

### Adding New Animations

1. Pick from [animista.net](https://animista.net) — copy both `-webkit-` and unprefixed versions
2. Add to `src/lib/animista.css` with a comment block documenting the use case
3. Use the class name directly for above-fold elements, or via `use:reveal` for scroll-triggered

---

## JAT IDE Animation Strategy

This section describes the CSS animation strategy used in the JAT IDE, particularly for the `/tasks` page task list animations.

### Animation Library: Animista

The IDE uses [Animista](https://animista.net/) as inspiration for 3D transform-based animations. Animista is a CSS animation library that provides pre-built, customizable animations with smooth timing functions.

**Key Animista-inspired animations used:**

| Animation | Keyframe Name | Use Case |
|-----------|---------------|----------|
| Slide in from back (3D) | `slide-in-fwd-center` | New tasks appearing in Open Tasks |
| Slide out to back (3D) | `slide-out-bck-center` | Tasks being closed/completed |
| Slide in from top (3D) | `slide-in-fwd-top` | New session cards appearing |
| Slide out to bottom (3D) | `slide-out-bck-bottom` | Session cards being removed |

### Cubic-Bezier Timing Functions

The animations use carefully chosen cubic-bezier timing functions for natural motion:

**Entrance animations (ease-out feel):**
```css
cubic-bezier(0.250, 0.460, 0.450, 0.940)
```
- Control points: `(0.25, 0.46)` and `(0.45, 0.94)`
- Characteristics: Quick start, gentle deceleration
- Result: Elements arrive confidently and settle naturally

**Exit animations (ease-in feel):**
```css
cubic-bezier(0.550, 0.085, 0.680, 0.530)
```
- Control points: `(0.55, 0.085)` and `(0.68, 0.53)`
- Characteristics: Slow start, accelerating exit
- Result: Elements gather momentum as they leave

### 3D Perspective Animations

The task list uses 3D perspective transforms for depth perception:

**Entrance (slide-in-fwd-center):**
```css
@keyframes slide-in-fwd-center {
  0% {
    transform: perspective(1000px) translateZ(-1400px);
    opacity: 0;
  }
  100% {
    transform: perspective(1000px) translateZ(0);
    opacity: 1;
  }
}
```

**Exit (slide-out-bck-center):**
```css
@keyframes slide-out-bck-center {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 1;
  }
}
```

**Design reasoning:**
- Entrance uses Z-axis translation from far back (`-1400px`) to create a "flying in" effect
- Exit uses scale-to-zero for a quick, clean disappearance
- The asymmetric approach (3D enter, scale exit) provides visual variety and prevents monotony

### Animation Durations

| Animation Type | Duration | Reasoning |
|----------------|----------|-----------|
| Task entrance | 400ms | Long enough to notice, short enough to not delay workflow |
| Task exit | 500ms | Slightly longer for visual closure/confirmation |
| Session entrance | 500ms | Matches session card complexity |
| Session exit | 500ms | Consistent with entrance |

### Session Card Animations

Session cards use a different 3D animation approach with Y-axis translation:

**Entrance (slide-in-fwd-top):**
```css
@keyframes slide-in-fwd-top {
  0% {
    transform: translateZ(-1100px) translateY(-1000px);
    opacity: 0;
  }
  100% {
    transform: translateZ(0) translateY(0);
    opacity: 1;
  }
}
```

**Exit (slide-out-bck-bottom):**
```css
@keyframes slide-out-bck-bottom {
  0% {
    transform: translateZ(0) translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateZ(-1100px) translateY(1000px);
    opacity: 0;
  }
}
```

**Design reasoning:**
- Cards "descend" from above and exit downward
- Y-axis movement reinforces vertical list organization
- Combined Z-axis creates depth without being overwhelming

### Design Guidelines for New Animations

When adding new animations, follow these principles:

#### 1. Match Context

| Context | Animation Style |
|---------|-----------------|
| Lists/tables | Slide in/out with perspective |
| Modals/dialogs | Scale or slide from direction of trigger |
| Notifications | Slide from edge of screen |
| Feedback (success/error) | Glow + subtle scale |

#### 2. Duration Guidelines

- **Micro-interactions** (button feedback): 100-200ms
- **Content transitions** (tabs, toggles): 150-250ms
- **Entrance animations** (new items): 300-500ms
- **Exit animations**: 300-500ms
- **Attention animations** (errors, warnings): 500-1000ms

#### 3. Easing Choices

| Motion Type | Cubic-Bezier | When to Use |
|-------------|--------------|-------------|
| Snappy entrance | `(0.25, 0.46, 0.45, 0.94)` | Items appearing |
| Smooth exit | `(0.55, 0.085, 0.68, 0.53)` | Items leaving |
| Bounce | `(0.34, 1.56, 0.64, 1)` | Playful feedback |
| Linear | `linear` | Loading spinners, progress |

#### 4. Accessibility

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  .animate-slide-in-fwd-center,
  .animate-slide-out-bck-center,
  .session-entrance,
  .session-exit {
    animation: none !important;
    transition: none !important;
  }
}
```

### Animation CSS Variables

The IDE defines semantic animation color variables in the `[data-theme='jat']` block:

```css
/* Primary blue - entrance animations, radar, links */
--anim-primary: oklch(0.70 0.18 240);
--anim-primary-bright: oklch(0.80 0.18 240);

/* Success green - task starting, completion */
--anim-success: oklch(0.65 0.20 145);
--anim-success-bright: oklch(0.70 0.22 145);

/* Warning amber/gold - working state */
--anim-warning: oklch(0.75 0.15 85);
--anim-warning-bright: oklch(0.80 0.18 85);

/* Error red - exit animations */
--anim-error: oklch(0.70 0.20 25);

/* Info cyan - agent animations */
--anim-info: oklch(0.70 0.18 200);
```

### Task State Animation Classes

| Class | Animation | Trigger |
|-------|-----------|---------|
| `.task-new-entrance` | Blue glow slide-in | New task created |
| `.task-exit` | Red fade slide-out | Task deleted |
| `.task-starting` | Green glow pulse | Task begins work |
| `.task-completed` | Gold glow pulse | Task marked complete |
| `.task-working-completed` | Amber→green transition | Direct working→closed |
| `.session-entrance` | 3D slide from top | New agent session |
| `.session-exit` | 3D slide to bottom | Session closed |

### Files Reference

**CSS Definitions:**
- `ide/src/app.css` - All animation keyframes and utility classes

**Components Using Animations:**
- `ide/src/lib/components/sessions/TasksActive.svelte` - Active task list with slide animations
- `ide/src/lib/components/sessions/TasksOpen.svelte` - Open task list with slide animations
- `ide/src/lib/components/work/SessionCard.svelte` - Session cards with entrance/exit animations
- `ide/src/lib/components/work/EventStack.svelte` - Event stack with slide-in animations

**IDE Documentation:**
- `ide/CLAUDE.md` - Animation utility classes section
- `ide/CLAUDE.md` - "CSS color-mix Patterns" section (non-replaceable animations)

### Historical Context

The current animation approach evolved through several iterations:

1. **Initial implementation (jat-9kghu):** Added scale-in/scale-out animations to `/tasks` page
2. **Refinement (jat-64s5a):** Changed to slide-in-fwd-center/slide-out-bck-center for 3D depth effect
3. **Session cards:** Separate Y-axis animations to match vertical card layout

### Animista Integration

While we don't import Animista directly, we've adapted its animation patterns:

**Animista naming convention:** `{effect}-{direction}-{entry-point}`
- Example: `slide-in-fwd-center` = slide in, forward (toward viewer), from center

**Our adaptations:**
- Simplified some animations (removed unnecessary complexity)
- Adjusted durations for IDE context (snappier for productivity tools)
- Added opacity transitions for smoother visual integration

### Testing Animations

To test animations in development:

```bash
# Start IDE
cd ide && npm run dev

# Open /tasks page
# Create a new task to see entrance animation
# Complete/close a task to see exit animation
```

**Visual verification checklist:**
- [ ] Animation feels smooth (no jank)
- [ ] Duration feels appropriate (not too fast/slow)
- [ ] Animation direction matches context
- [ ] Reduced motion preference is respected
- [ ] Animation doesn't interfere with user interaction

### Animation Coherence Audit

This section documents the animation landscape across the entire IDE codebase to identify coherence issues.

#### Centralized Animations (app.css)

The following animations are properly defined in `ide/src/app.css` and should be used instead of component-local definitions:

**Task State Animations:**
| Keyframe | Purpose | Utility Class |
|----------|---------|---------------|
| `task-entrance` | New task appearing | `.task-new-entrance` |
| `task-exit` | Task being removed | `.task-exit` |
| `task-starting` | Task begins work | `.task-starting` |
| `task-completed` | Task marked complete | `.task-completed` |
| `working-to-completed` | Working→closed transition | `.task-working-completed` |
| `epic-completed` | Epic completion | `.epic-completed` |
| `epic-running` | Epic in progress | `.epic-running` |

**3D Perspective Animations (Animista-inspired):**
| Keyframe | Purpose | Utility Class |
|----------|---------|---------------|
| `slide-in-fwd-center` | 3D fly-in from back | `.animate-slide-in-fwd-center` |
| `slide-out-bck-center` | Scale to zero exit | `.animate-slide-out-bck-center` |
| `slide-in-fwd-top` | 3D slide from top | (used for session cards) |
| `slide-out-bck-bottom` | 3D slide to bottom | (used for session cards) |

**Common Utility Animations:**
| Keyframe | Purpose | Utility Class |
|----------|---------|---------------|
| `spin` | Loading spinners | `.animate-spin`, `.animate-spin-fast` |
| `skeleton-pulse` | Skeleton loading | `.animate-skeleton-pulse` |
| `slide-down` | Dropdown entrance | `.animate-slide-down` |
| `slide-up` | Content sliding up | `.animate-slide-up` |
| `scale-in` | Scale entrance | `.animate-scale-in` |
| `dropdown-slide` | Dropdown menus | `.animate-dropdown-slide` |
| `pop` | Attention pop | `.animate-pop` |
| `pulse-subtle` | Subtle pulsing | `.animate-pulse-subtle` |
| `ring-pulse` | Ring expansion | `.animate-ring-pulse` |
| `pulse-save` | Save feedback | `.animate-pulse-save` |

**Glow Animations:**
| Keyframe | Purpose | Utility Class |
|----------|---------|---------------|
| `glow-primary` | Primary color glow | `.animate-glow-primary` |
| `glow-success` | Success glow | `.animate-glow-success` |
| `glow-warning` | Warning glow | `.animate-glow-warning` |
| `glow-error` | Error glow | `.animate-glow-error` |
| `glow-secondary` | Secondary glow | `.animate-glow-secondary` |

**Specialized Animations:**
| Keyframe | Purpose |
|----------|---------|
| `radar-sweep` | Radar spinner rotation |
| `radar-pulse` | Radar pulse effect |
| `agent-entrance` | Agent card appearing |
| `agent-highlight-flash` | Agent card highlight |
| `tracking-in-expand` | Text tracking in |
| `tracking-out-contract` | Text tracking out |
| `fade-in`, `fade-in-fast`, `fade-in-left` | Various fade entrances |

#### Duplication Issues Found

The following animations are **duplicated across multiple component files** despite being centralized in app.css:

**`spin` - CRITICAL (20+ duplicates)**
```
Components with duplicate @keyframes spin:
- RuleEditor.svelte
- ClaudeMdEditor.svelte
- CommandsList.svelte
- CommitMessageSettingsEditor.svelte
- DocsEditor.svelte, DocsList.svelte, DocsViewer.svelte
- HooksEditor.svelte
- McpConfigEditor.svelte
- TemplatesEditor.svelte
- ToolsEditor.svelte, ToolsList.svelte
- ProjectsList.svelte
- ClaudeMdList.svelte
- DefaultsEditor.svelte
- FileEditor.svelte, FileTree.svelte, FileTreeNode.svelte
- QuickFileFinder.svelte, GlobalSearch.svelte
- config/+page.svelte
- t1/+page.svelte through t5/+page.svelte
```
**Fix:** Remove all `@keyframes spin` from components, use `.animate-spin` class.

**`pulse` - HIGH (10+ duplicates)**
```
Components with duplicate @keyframes pulse:
- DefaultsEditor.svelte (also has slideDown)
- AgentGridSkeleton.svelte
- KanbanSkeleton.svelte
- ProjectsTableSkeleton.svelte
- SessionCardSkeleton.svelte
- TaskDetailSkeleton.svelte
- TaskTableSkeleton.svelte
- TimelineSkeleton.svelte
- TasksOpen.svelte
- sessions/+page.svelte
- tasks-table/+page.svelte
- tasks/+page.svelte
- triage/+page.svelte (as pulse-glow)
```
**Fix:** Use `.animate-skeleton-pulse` or `.animate-pulse-subtle` from app.css.

**`fadeIn` / `fade-in` - MEDIUM (8+ duplicates)**
```
Components with duplicate @keyframes fadeIn:
- FileEditor.svelte
- FileTree.svelte
- QuickFileFinder.svelte
- GlobalSearch.svelte
- AgentGridSkeleton.svelte
- HistorySkeleton.svelte
- KanbanSkeleton.svelte
- TriageSkeleton.svelte
- BranchSwitcherModal.svelte (as fade-in)
- CommitDetailModal.svelte (as fade-in)
- StreakCelebration.svelte (as fade-in, fade-in-out)
```
**Fix:** Use centralized `fade-in` from app.css.

**`slideUp` / `slide-up` - MEDIUM (5+ duplicates)**
```
Components with duplicate @keyframes:
- FileEditor.svelte (slideUp)
- FileTree.svelte (slideUp)
- GitPanel.svelte (slide-up)
- sessions/+page.svelte (slide-up)
- tasks-table/+page.svelte (slide-up)
```
**Fix:** Use `.animate-slide-up` from app.css, standardize to kebab-case.

**`slideDown` / `slide-down` - MEDIUM (5+ duplicates)**
```
Components with duplicate @keyframes:
- DefaultsEditor.svelte (slideDown)
- QuickFileFinder.svelte (slideDown)
- GlobalSearch.svelte (slideDown)
- BranchSwitcherModal.svelte (slide-down)
- CommitDetailModal.svelte (slide-down)
```
**Fix:** Use `.animate-slide-down` from app.css, standardize to kebab-case.

**`dropdown-slide` - LOW (4 duplicates)**
```
Components with duplicate @keyframes dropdown-slide:
- ActivityBadge.svelte
- ServersBadge.svelte
- TasksCompletedBadge.svelte
- TopBar.svelte (as swarm-dropdown-slide)
```
**Fix:** Use `.animate-dropdown-slide` from app.css.

**`expand-slide-down` / `expand-slide-up` - LOW (3 duplicates)**
```
Components with duplicate @keyframes:
- TasksActive.svelte
- sessions/+page.svelte
- tasks-table/+page.svelte
```
**Fix:** Consider adding to app.css as utility animations.

#### Naming Inconsistencies

| Current | Should Be | Affected Files |
|---------|-----------|----------------|
| `slideUp` | `slide-up` | FileEditor, FileTree |
| `slideDown` | `slide-down` | DefaultsEditor, QuickFileFinder, GlobalSearch |
| `fadeIn` | `fade-in` | FileEditor, FileTree, QuickFileFinder, GlobalSearch, skeletons |

**Standard:** Use kebab-case for all keyframe names to match CSS conventions.

#### Component-Specific Animations (OK to Keep)

These animations are unique to specific components and don't need consolidation:

| Component | Animation | Purpose |
|-----------|-----------|---------|
| MonacoWrapper | `search-highlight-pulse`, `search-glyph-fade` | Editor search highlighting |
| AgentAvatar | `avatarFlipIn` | Avatar 3D flip entrance |
| SessionCard | `shimmer`, `complete-flash` | Card-specific effects |
| VoiceInput | `mic-start-pulse`, `mic-stop-shrink` | Microphone feedback |
| ThemeSelector | `theme-spin`, `dot-pulse` | Theme switching animation |
| UserProfile | `toggle-pulse`, `toggle-bounce` | Toggle animations |
| StreakCelebration | `star-move`, `star-sparkles`, `rotate` | Celebration effects |
| EventStack | `slide-in-top` | Event entry animation |
| EpicSwarmBadge | `pulse-glow` | Swarm indicator |
| TaskActionButton | `ring-pulse` | Action feedback (also in app.css) |

#### Consolidation Guidelines

**When adding new animations:**

1. **Check app.css first** - Search for existing animations before creating new ones
2. **Use utility classes** - Prefer `.animate-*` classes over inline animation properties
3. **Keep component animations minimal** - Only define keyframes locally when truly unique
4. **Follow naming convention** - Use kebab-case: `animation-name-variant`
5. **Add to app.css** - If an animation will be used in 3+ components, centralize it

**Refactoring priority:**

| Priority | Animation | Duplicate Count | Effort |
|----------|-----------|-----------------|--------|
| P0 | `spin` | 20+ | Low (just remove) |
| P1 | `pulse` | 10+ | Medium (verify variants) |
| P2 | `fadeIn` | 8+ | Low |
| P2 | `slideUp/slideDown` | 10+ | Low |
| P3 | `dropdown-slide` | 4 | Low |

### Future Considerations

When adding new animations, consider:

1. **Performance:** 3D transforms are GPU-accelerated; avoid animating layout properties
2. **Consistency:** Match existing timing functions and durations
3. **Purpose:** Every animation should communicate state change
4. **Subtlety:** Productivity tools benefit from understated animations
5. **Centralization:** Check app.css before adding component-local keyframes
