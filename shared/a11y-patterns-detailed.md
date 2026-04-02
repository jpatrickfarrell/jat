# Accessibility (a11y) Patterns — Detailed Reference

Full reference for fixing Svelte a11y build warnings. For the quick cheat sheet loaded in project context, see `a11y-patterns.md`.

---

## Rule 1: Always Associate Labels with Inputs

Every `<label>` must be linked to its control. There are two valid patterns:

```svelte
<!-- ✅ CORRECT: for= points to input's id -->
<label for="email">Email</label>
<input id="email" type="email" bind:value={email} />

<!-- ✅ CORRECT: label wraps the input -->
<label>
  Email
  <input type="email" bind:value={email} />
</label>

<!-- ❌ WRONG: label has no association -->
<label>Email</label>
<input type="email" bind:value={email} />

<!-- ❌ WRONG: label has for= but input has no matching id -->
<label for="email">Email</label>
<input type="email" bind:value={email} />
```

**DaisyUI form fields** — `<label class="label">` is a layout wrapper, not a semantic label. It still needs `for=`:
```svelte
<!-- ✅ DaisyUI pattern -->
<label class="label" for="phone">
  <span class="label-text">Phone</span>
</label>
<input id="phone" class="input" type="tel" bind:value={phone} />

<!-- ✅ DaisyUI checkbox/toggle — label wraps the input -->
<label class="flex items-center gap-2" for="active">
  <input id="active" type="checkbox" class="checkbox" bind:checked={active} />
  <span>Active</span>
</label>
```

---

## Rule 2: Never Use `<div>` for Click Interactions

Clickable `<div>` elements are invisible to keyboard users and screen readers. Always use semantic elements.

```svelte
<!-- ✅ CORRECT: use <button> for actions -->
<button type="button" onclick={() => select(item)}>
  {item.name}
</button>

<!-- ✅ CORRECT: use <a> for navigation -->
<a href="/jobs/{id}">{title}</a>

<!-- ❌ WRONG: div with onclick -->
<div onclick={() => select(item)}>{item.name}</div>

<!-- ❌ WRONG: span with onclick -->
<span onclick={handleClick}>Click me</span>
```

**If you must use a non-button element** (e.g., a card that's both a link and has internal actions), add role + tabindex + keyboard handler:
```svelte
<!-- ✅ Only when <button> truly won't work -->
<div
  role="button"
  tabindex="0"
  onclick={handleClick}
  onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
  ...
</div>
```

---

## Rule 3: Give Every Input an Accessible Name

Inputs without visible labels need `aria-label` or `aria-labelledby`.

```svelte
<!-- ✅ Icon-only search input -->
<input type="search" aria-label="Search jobs" bind:value={query} />

<!-- ✅ Label provided by nearby heading -->
<h2 id="filters-heading">Filters</h2>
<input aria-labelledby="filters-heading" type="text" />

<!-- ✅ Placeholder is NOT a label — still need aria-label -->
<input
  type="text"
  placeholder="Search..."
  aria-label="Search"
  bind:value={query}
/>

<!-- ❌ WRONG: no label, no aria-label -->
<input type="text" placeholder="Search..." bind:value={query} />
```

---

## Rule 4: Interactive ARIA Roles Need tabindex

When you assign an interactive ARIA role, the element must be focusable.

```svelte
<!-- ✅ CORRECT -->
<div role="menu" tabindex="0">...</div>
<div role="dialog" tabindex="-1">...</div>
<div role="button" tabindex="0" onclick={...} onkeydown={...}>...</div>

<!-- ❌ WRONG: role without tabindex -->
<div role="menu">...</div>
```

**tabindex values:**
- `tabindex="0"` — in tab order (user can tab to it)
- `tabindex="-1"` — focusable by script, not in tab order (good for modals)

---

## Rule 5: Image Alt Text Rules

```svelte
<!-- ✅ Descriptive alt for informational images -->
<img src={avatar} alt="Profile photo of {name}" />

<!-- ✅ Empty alt for decorative images (screen reader skips it) -->
<img src={decorative} alt="" />

<!-- ❌ WRONG: redundant words — screen readers say "image" automatically -->
<img src={photo} alt="image of the job site" />
<img src={photo} alt="photo of technician" />
<img src={photo} alt="picture showing invoice" />
```

---

## Rule 6: Video Elements Need Caption Tracks

```svelte
<!-- ✅ With real captions -->
<video src={url} controls>
  <track kind="captions" src={captionsUrl} srclang="en" label="English" />
</video>

<!-- ✅ Placeholder when captions unavailable (suppresses warning) -->
<video src={url} controls>
  <track kind="captions" src="" srclang="en" label="English" default />
</video>
```

---

## Quick Reference: Warning → Fix

| Svelte Warning | Fix |
|----------------|-----|
| `a11y_label_has_associated_control` | Add `for=` to `<label>` matching `id=` on input, or wrap input inside label |
| `a11y_click_events_have_key_events` | Replace `<div onclick>` with `<button type="button">` |
| `a11y_no_static_element_interactions` | Replace `<div onclick>` with `<button type="button">` |
| `a11y_consider_explicit_label` | Add `aria-label` or `<label>` to input |
| `a11y_no_noninteractive_element_interactions` | Use semantic element (`<button>`, `<a>`) or add proper role |
| `a11y_no_noninteractive_tabindex` | Remove `tabindex` from non-interactive elements, or give them an interactive role |
| `a11y_interactive_supports_focus` | Add `tabindex="0"` to element with interactive ARIA role |
| `a11y_media_has_caption` | Add `<track kind="captions">` inside `<video>` |
| `a11y_img_redundant_alt` | Remove "image", "photo", "picture" from alt text |
| `a11y_role_supports_aria_props` | Remove ARIA attributes invalid for the element's role |
