# Route Templates

Drop-in SvelteKit route templates for customer-facing task management UI.

## /tasks — Task List & Detail

A customer-facing page that reads from the `project_tasks` Supabase table. Shows tasks with filtering, detail drawer, and comment thread.

### Prerequisites

- jat-feedback v3.0.0+ with `3.0.0_rename_to_project_tasks.sql` migration applied
- SvelteKit app with Supabase SSR auth (parent layout provides `data.supabase`)
- DaisyUI + Tailwind CSS v4

### Installation

Copy the route into your SvelteKit app:

```bash
cp -r node_modules/jat-feedback/routes/tasks/ src/routes/(admin)/account/tasks/
```

Adjust the destination path to match your route structure. The route must be nested under a layout that:
1. Creates a Supabase browser client and passes it as `data.supabase`
2. Handles auth redirects (the page has a fallback redirect to `/login`)
3. Passes `data.user` with at least an `email` field

### Features

- **Server-side loading** from `project_tasks` via Supabase RLS
- **URL-based filters** for status, type, and priority
- **Task detail drawer** with full description, metadata, and labels
- **Comment thread** with real-time submission (Ctrl+Enter shortcut)
- **Mobile responsive** — table on desktop, cards on mobile
- **Status badges** with color coding
- **Screenshot display** from feedback-captured images

### Customization

The route uses standard DaisyUI classes and inherits your theme. Common customizations:

- **Change redirect path**: Edit the `redirect(303, "/login")` in `+page.server.ts`
- **Add more statuses**: Edit `statusOptions` array in `+page.svelte`
- **Customize columns**: Modify the table `<thead>` and `<tbody>` cells
- **Restrict by source**: Add `.eq("source", "feedback")` to the server query
