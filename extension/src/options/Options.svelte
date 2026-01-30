<script lang="ts">
  import { getSettings, saveSettings, clearSettings, testConnection, type SupabaseSettings } from '../lib/supabase'

  let url = $state('')
  let anonKey = $state('')
  let saving = $state(false)
  let testing = $state(false)
  let message = $state<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  let loaded = $state(false)

  // Load existing settings on mount
  $effect(() => {
    loadSettings()
  })

  async function loadSettings() {
    const settings = await getSettings()
    if (settings) {
      url = settings.supabaseUrl
      anonKey = settings.supabaseAnonKey
    }
    loaded = true
  }

  async function handleSave() {
    if (!url.trim() || !anonKey.trim()) {
      message = { type: 'error', text: 'Both fields are required.' }
      return
    }

    // Basic URL validation
    if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
      message = { type: 'error', text: 'URL should be like https://your-project.supabase.co' }
      return
    }

    saving = true
    message = null

    try {
      await saveSettings({
        supabaseUrl: url.trim(),
        supabaseAnonKey: anonKey.trim(),
      })
      message = { type: 'success', text: 'Settings saved.' }
    } catch (err) {
      message = { type: 'error', text: err instanceof Error ? err.message : 'Failed to save.' }
    } finally {
      saving = false
    }
  }

  async function handleTest() {
    if (!url.trim() || !anonKey.trim()) {
      message = { type: 'error', text: 'Save settings first.' }
      return
    }

    testing = true
    message = { type: 'info', text: 'Testing connection...' }

    try {
      // Save first so testConnection uses current values
      await saveSettings({
        supabaseUrl: url.trim(),
        supabaseAnonKey: anonKey.trim(),
      })

      const result = await testConnection()
      if (result.ok) {
        message = { type: 'success', text: 'Connected successfully! Feedback table found.' }
      } else {
        message = { type: 'error', text: result.error || 'Connection failed.' }
      }
    } catch (err) {
      message = { type: 'error', text: err instanceof Error ? err.message : 'Test failed.' }
    } finally {
      testing = false
    }
  }

  async function handleClear() {
    await clearSettings()
    url = ''
    anonKey = ''
    message = { type: 'info', text: 'Settings cleared.' }
  }

  const hasValues = $derived(url.trim().length > 0 && anonKey.trim().length > 0)
</script>

{#if !loaded}
  <div class="page">
    <div class="loading">Loading...</div>
  </div>
{:else}
  <div class="page">
    <header class="header">
      <div class="logo">J</div>
      <h1>JAT Extension Settings</h1>
    </header>

    <section class="section">
      <h2>Supabase Connection</h2>
      <p class="hint">
        Connect to your Supabase project to submit bug reports. You need a project with
        a <code>feedback</code> table and a <code>screenshots</code> storage bucket.
      </p>

      <div class="field">
        <label for="url">Project URL</label>
        <input
          id="url"
          type="url"
          bind:value={url}
          placeholder="https://your-project.supabase.co"
          disabled={saving || testing}
        />
      </div>

      <div class="field">
        <label for="key">Anon Key</label>
        <input
          id="key"
          type="password"
          bind:value={anonKey}
          placeholder="eyJhbGciOiJIUzI1NiIs..."
          disabled={saving || testing}
        />
        <span class="field-hint">Found in Supabase Dashboard &gt; Settings &gt; API</span>
      </div>

      {#if message}
        <div class="message {message.type}">
          {message.text}
        </div>
      {/if}

      <div class="actions">
        <button class="btn primary" onclick={handleSave} disabled={saving || testing || !hasValues}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button class="btn secondary" onclick={handleTest} disabled={saving || testing || !hasValues}>
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
        {#if hasValues}
          <button class="btn danger" onclick={handleClear} disabled={saving || testing}>
            Clear
          </button>
        {/if}
      </div>
    </section>

    <section class="section">
      <h2>Required Supabase Setup</h2>
      <p class="hint">Run this SQL in your Supabase SQL Editor to create the feedback table:</p>
      <pre class="code-block">{`create table feedback (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  title text not null,
  description text,
  type text not null default 'bug',
  priority text not null default 'medium',
  page_url text,
  user_agent text,
  console_logs jsonb,
  selected_elements jsonb,
  screenshot_urls text[],
  metadata jsonb
);

-- Allow anonymous inserts (adjust RLS as needed)
alter table feedback enable row level security;
create policy "Allow anonymous inserts"
  on feedback for insert
  with check (true);
create policy "Allow anonymous reads"
  on feedback for select
  using (true);`}</pre>

      <p class="hint" style="margin-top: 12px;">Create a storage bucket for screenshots:</p>
      <pre class="code-block">{`-- In Supabase Dashboard > Storage:
-- 1. Create bucket named "screenshots"
-- 2. Set it to Public
-- Or via SQL:
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true);`}</pre>
    </section>
  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    background: #f9fafb;
    color: #1f2937;
  }

  .page {
    max-width: 600px;
    margin: 0 auto;
    padding: 24px;
  }

  .loading {
    text-align: center;
    padding: 40px;
    color: #6b7280;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  .logo {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 16px;
    flex-shrink: 0;
  }

  h1 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .section {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
  }

  h2 {
    margin: 0 0 8px 0;
    font-size: 15px;
    font-weight: 600;
  }

  .hint {
    color: #6b7280;
    font-size: 13px;
    margin: 0 0 16px 0;
    line-height: 1.4;
  }

  .field {
    margin-bottom: 14px;
  }

  label {
    display: block;
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 4px;
    color: #374151;
  }

  input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
    font-family: inherit;
    color: #1f2937;
    background: #fff;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }

  input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
  }

  input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .field-hint {
    display: block;
    font-size: 11px;
    color: #9ca3af;
    margin-top: 4px;
  }

  code {
    background: #f3f4f6;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 12px;
  }

  .message {
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    margin-bottom: 14px;
  }

  .message.success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
  }

  .message.error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
  }

  .message.info {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1d4ed8;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: background 0.15s;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn.primary {
    background: #3b82f6;
    color: white;
  }

  .btn.primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn.secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .btn.secondary:hover:not(:disabled) {
    background: #e5e7eb;
  }

  .btn.danger {
    background: #fff;
    color: #dc2626;
    border: 1px solid #fecaca;
  }

  .btn.danger:hover:not(:disabled) {
    background: #fef2f2;
  }

  .code-block {
    background: #1f2937;
    color: #e5e7eb;
    padding: 14px;
    border-radius: 6px;
    font-size: 12px;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
    overflow-x: auto;
    line-height: 1.5;
    white-space: pre;
    margin: 0;
  }
</style>
