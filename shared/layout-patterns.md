## Layout Patterns (JST Template Standard)

### Viewport-filling layouts

Layouts use the DaisyUI drawer. The standard structure for content areas that fill the full viewport height:

**`drawer-content`** — must have `flex flex-col min-h-screen`:
```svelte
<div class="drawer-content bg-base-100 flex flex-col min-h-screen">
```

**Content wrapper** — use plain padding, no `container` class (which caps max-width). Add `flex-1 flex flex-col min-h-0` so child pages can fill remaining space:
```svelte
<div class="px-6 lg:px-12 py-3 lg:py-6 flex-1 flex flex-col min-h-0">
```

Pages that want to fill available height add `flex-1 flex flex-col` to their top-level element.

### SearchDropdown in tables

**Never use `overflow-x-auto` on a table wrapper that contains `SearchDropdown` (inline editable dropdowns).** The overflow clipping hides the dropdown panel on the last visible row.

```svelte
<!-- ❌ Clips dropdown panels -->
<div class="hidden sm:block overflow-x-auto w-full">

<!-- ✅ Correct — no overflow clipping -->
<div class="hidden sm:block w-full">
```

If horizontal scroll is needed, apply it to an outer container that doesn't clip absolutely-positioned children, or use a portal-based dropdown.
