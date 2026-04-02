# Accessibility (a11y) Patterns

Prevents common Svelte a11y build warnings. Follow these when writing any UI code.

**Labels must be associated with inputs** — use `for=`/`id` or wrap:
```svelte
<label for="email">Email</label><input id="email" ... />   <!-- ✅ -->
<label>Email <input .../></label>                          <!-- ✅ -->
<label>Email</label><input ... />                          <!-- ❌ -->
```

**Never use `<div onclick>` — use `<button type="button">`:**
```svelte
<button type="button" onclick={fn}>...</button>   <!-- ✅ -->
<div onclick={fn}>...</div>                        <!-- ❌ -->
```

**Inputs without visible labels need `aria-label`:**
```svelte
<input type="search" aria-label="Search jobs" />  <!-- ✅ -->
<input type="search" placeholder="Search..." />   <!-- ❌ -->
```

**Interactive ARIA roles need `tabindex`:**
```svelte
<div role="menu" tabindex="0">...</div>    <!-- ✅ -->
<div role="dialog" tabindex="-1">...</div> <!-- ✅ -->
<div role="menu">...</div>                 <!-- ❌ -->
```

**Video needs a caption track. Image alt must not contain "image/photo/picture".**

| Warning | Fix |
|---------|-----|
| `a11y_label_has_associated_control` | Add `for=` on label + `id=` on input |
| `a11y_click_events_have_key_events` | Replace `<div onclick>` with `<button type="button">` |
| `a11y_no_static_element_interactions` | Replace `<div onclick>` with `<button type="button">` |
| `a11y_consider_explicit_label` | Add `aria-label` to input |
| `a11y_interactive_supports_focus` | Add `tabindex="0"` to element with interactive role |
| `a11y_media_has_caption` | Add `<track kind="captions">` inside `<video>` |
| `a11y_img_redundant_alt` | Remove "image/photo/picture" from alt text |
