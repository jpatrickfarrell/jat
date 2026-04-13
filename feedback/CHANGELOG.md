# Changelog

## 3.3.0

- Supabase Realtime sync replaces 5-minute polling in JAT ingest (Realtime service handles updates live).
- Voice transcription confirmation flow: stop recording → upload → transcribe → user edits title/description → submit.
- New widget attributes: `supabase-url` and `supabase-anon-key` (enables client-side Realtime subscription; falls back to polling `/api/feedback/reports` if absent).
- New `audio_url` column migration on `project_tasks`.
