# Changelog

## 3.5.0

- Widget "Requests" tab now renders the live external comment thread for each report.
- Comments from agents appear with a blue "Agent" label; dev/team comments show purple "Team"; reporter replies show gray "You".
- Reply box lets reporters post new comments inline (Ctrl+Enter to send). Posts as `author_type=user, external=true`.
- 30-second poll while a card is expanded; stops on collapse.
- Backward-compatible: if the comments API returns empty, falls back to showing the existing sidecar thread.
- New consumer route template: `routes/api/tasks/[id]/comments/+server.ts` — copy to `src/routes/api/tasks/[id]/comments/` in each consuming project.
- New migration `3.5.0_extend_comments_schema.sql` adds `author_type`, `comment_type`, `session_id`, `metadata`, `external` columns to `project_tasks_comments`.

### Consumer project checklist (3.5.0)

| Step | Action |
|------|--------|
| Migration | `cp node_modules/jat-feedback/supabase/migrations/3.5.0_extend_comments_schema.sql supabase/migrations/$(date +%Y%m%d%H%M%S)_feedback_3_5_0.sql && supabase db push` |
| Route | `cp -r node_modules/jat-feedback/routes/api src/routes/api/tasks` (copy `[id]/comments/+server.ts`) |
| npm | `npm install jat-feedback@latest` |

## 3.3.0

- Supabase Realtime sync replaces 5-minute polling in JAT ingest (Realtime service handles updates live).
- Voice transcription confirmation flow: stop recording → upload → transcribe → user edits title/description → submit.
- New widget attributes: `supabase-url` and `supabase-anon-key` (enables client-side Realtime subscription; falls back to polling `/api/feedback/reports` if absent).
- New `audio_url` column migration on `project_tasks`.
