import { J as delegate, K as push, M as append_styles, O as user_effect, a9 as getSettings, Q as set, R as comment, S as first_child, T as if_block, U as append, V as pop, W as state, g as get, X as sibling, Y as child, Z as template_effect, $ as bind_value, a0 as from_html, aa as saveSettings, ab as testConnection, a5 as user_derived, a4 as set_class, a1 as set_text, ac as clearSettings, a8 as mount } from "./supabase.js";
import "./browser-compat.js";
var root_1 = from_html(`<div class="page svelte-11xnrmq"><div class="loading svelte-11xnrmq">Loading...</div></div>`);
var root_3 = from_html(`<div> </div>`);
var root_4 = from_html(`<button class="btn danger svelte-11xnrmq">Clear</button>`);
var root_2 = from_html(`<div class="page svelte-11xnrmq"><header class="header svelte-11xnrmq"><div class="logo svelte-11xnrmq">J</div> <h1 class="svelte-11xnrmq">JAT Extension Settings</h1></header> <section class="section svelte-11xnrmq"><h2 class="svelte-11xnrmq">Supabase Connection</h2> <p class="hint svelte-11xnrmq">Connect to your Supabase project to submit bug reports. You need a project with
        a <code class="svelte-11xnrmq">feedback</code> table and a <code class="svelte-11xnrmq">screenshots</code> storage bucket.</p> <div class="field svelte-11xnrmq"><label for="url" class="svelte-11xnrmq">Project URL</label> <input id="url" type="url" placeholder="https://your-project.supabase.co" class="svelte-11xnrmq"/></div> <div class="field svelte-11xnrmq"><label for="key" class="svelte-11xnrmq">Anon Key</label> <input id="key" type="password" placeholder="eyJhbGciOiJIUzI1NiIs..." class="svelte-11xnrmq"/> <span class="field-hint svelte-11xnrmq">Found in Supabase Dashboard &gt; Settings &gt; API</span></div> <!> <div class="actions svelte-11xnrmq"><button class="btn primary svelte-11xnrmq"> </button> <button class="btn secondary svelte-11xnrmq"> </button> <!></div></section> <section class="section svelte-11xnrmq"><h2 class="svelte-11xnrmq">Required Supabase Setup</h2> <p class="hint svelte-11xnrmq">Run this SQL in your Supabase SQL Editor to create the feedback table:</p> <pre class="code-block svelte-11xnrmq"></pre> <p class="hint svelte-11xnrmq" style="margin-top: 12px;">Create a storage bucket for screenshots:</p> <pre class="code-block svelte-11xnrmq"></pre></section></div>`);
const $$css = {
  hash: "svelte-11xnrmq",
  code: "body {margin:0;padding:0;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;font-size:14px;background:#f9fafb;color:#1f2937;}.page.svelte-11xnrmq {max-width:600px;margin:0 auto;padding:24px;}.loading.svelte-11xnrmq {text-align:center;padding:40px;color:#6b7280;}.header.svelte-11xnrmq {display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #e5e7eb;}.logo.svelte-11xnrmq {width:32px;height:32px;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:16px;flex-shrink:0;}h1.svelte-11xnrmq {margin:0;font-size:18px;font-weight:600;}.section.svelte-11xnrmq {background:white;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:16px;}h2.svelte-11xnrmq {margin:0 0 8px 0;font-size:15px;font-weight:600;}.hint.svelte-11xnrmq {color:#6b7280;font-size:13px;margin:0 0 16px 0;line-height:1.4;}.field.svelte-11xnrmq {margin-bottom:14px;}label.svelte-11xnrmq {display:block;font-weight:600;font-size:13px;margin-bottom:4px;color:#374151;}input.svelte-11xnrmq {width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;font-family:inherit;color:#1f2937;background:#fff;box-sizing:border-box;transition:border-color 0.15s;}input.svelte-11xnrmq:focus {outline:none;border-color:#3b82f6;box-shadow:0 0 0 2px rgba(59, 130, 246, 0.15);}input.svelte-11xnrmq:disabled {opacity:0.6;cursor:not-allowed;}.field-hint.svelte-11xnrmq {display:block;font-size:11px;color:#9ca3af;margin-top:4px;}code.svelte-11xnrmq {background:#f3f4f6;padding:1px 4px;border-radius:3px;font-size:12px;}.message.svelte-11xnrmq {padding:8px 12px;border-radius:6px;font-size:13px;margin-bottom:14px;}.message.success.svelte-11xnrmq {background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;}.message.error.svelte-11xnrmq {background:#fef2f2;border:1px solid #fecaca;color:#dc2626;}.message.info.svelte-11xnrmq {background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;}.actions.svelte-11xnrmq {display:flex;gap:8px;}.btn.svelte-11xnrmq {padding:8px 16px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:background 0.15s;}.btn.svelte-11xnrmq:disabled {opacity:0.5;cursor:not-allowed;}.btn.primary.svelte-11xnrmq {background:#3b82f6;color:white;}.btn.primary.svelte-11xnrmq:hover:not(:disabled) {background:#2563eb;}.btn.secondary.svelte-11xnrmq {background:#f3f4f6;color:#374151;border:1px solid #d1d5db;}.btn.secondary.svelte-11xnrmq:hover:not(:disabled) {background:#e5e7eb;}.btn.danger.svelte-11xnrmq {background:#fff;color:#dc2626;border:1px solid #fecaca;}.btn.danger.svelte-11xnrmq:hover:not(:disabled) {background:#fef2f2;}.code-block.svelte-11xnrmq {background:#1f2937;color:#e5e7eb;padding:14px;border-radius:6px;font-size:12px;font-family:'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;overflow-x:auto;line-height:1.5;white-space:pre;margin:0;}"
};
function Options($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css);
  let url = state("");
  let anonKey = state("");
  let saving = state(false);
  let testing = state(false);
  let message = state(null);
  let loaded = state(false);
  user_effect(() => {
    loadSettings();
  });
  async function loadSettings() {
    const settings = await getSettings();
    if (settings) {
      set(url, settings.supabaseUrl, true);
      set(anonKey, settings.supabaseAnonKey, true);
    }
    set(loaded, true);
  }
  async function handleSave() {
    if (!get(url).trim() || !get(anonKey).trim()) {
      set(message, { type: "error", text: "Both fields are required." }, true);
      return;
    }
    if (!get(url).startsWith("https://") || !get(url).includes(".supabase.co")) {
      set(
        message,
        {
          type: "error",
          text: "URL should be like https://your-project.supabase.co"
        },
        true
      );
      return;
    }
    set(saving, true);
    set(message, null);
    try {
      await saveSettings({
        supabaseUrl: get(url).trim(),
        supabaseAnonKey: get(anonKey).trim()
      });
      set(message, { type: "success", text: "Settings saved." }, true);
    } catch (err) {
      set(
        message,
        {
          type: "error",
          text: err instanceof Error ? err.message : "Failed to save."
        },
        true
      );
    } finally {
      set(saving, false);
    }
  }
  async function handleTest() {
    if (!get(url).trim() || !get(anonKey).trim()) {
      set(message, { type: "error", text: "Save settings first." }, true);
      return;
    }
    set(testing, true);
    set(message, { type: "info", text: "Testing connection..." }, true);
    try {
      await saveSettings({
        supabaseUrl: get(url).trim(),
        supabaseAnonKey: get(anonKey).trim()
      });
      const result = await testConnection();
      if (result.ok) {
        set(
          message,
          {
            type: "success",
            text: "Connected successfully! Feedback table found."
          },
          true
        );
      } else {
        set(message, { type: "error", text: result.error || "Connection failed." }, true);
      }
    } catch (err) {
      set(
        message,
        {
          type: "error",
          text: err instanceof Error ? err.message : "Test failed."
        },
        true
      );
    } finally {
      set(testing, false);
    }
  }
  async function handleClear() {
    await clearSettings();
    set(url, "");
    set(anonKey, "");
    set(message, { type: "info", text: "Settings cleared." }, true);
  }
  const hasValues = user_derived(() => get(url).trim().length > 0 && get(anonKey).trim().length > 0);
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      var div = root_1();
      append($$anchor2, div);
    };
    var alternate = ($$anchor2) => {
      var div_1 = root_2();
      var section = sibling(child(div_1), 2);
      var div_2 = sibling(child(section), 4);
      var input = sibling(child(div_2), 2);
      var div_3 = sibling(div_2, 2);
      var input_1 = sibling(child(div_3), 2);
      var node_1 = sibling(div_3, 2);
      {
        var consequent_1 = ($$anchor3) => {
          var div_4 = root_3();
          var text = child(div_4);
          template_effect(() => {
            set_class(div_4, 1, `message ${get(message).type ?? ""}`, "svelte-11xnrmq");
            set_text(text, get(message).text);
          });
          append($$anchor3, div_4);
        };
        if_block(node_1, ($$render) => {
          if (get(message)) $$render(consequent_1);
        });
      }
      var div_5 = sibling(node_1, 2);
      var button = child(div_5);
      button.__click = handleSave;
      var text_1 = child(button);
      var button_1 = sibling(button, 2);
      button_1.__click = handleTest;
      var text_2 = child(button_1);
      var node_2 = sibling(button_1, 2);
      {
        var consequent_2 = ($$anchor3) => {
          var button_2 = root_4();
          button_2.__click = handleClear;
          template_effect(() => button_2.disabled = get(saving) || get(testing));
          append($$anchor3, button_2);
        };
        if_block(node_2, ($$render) => {
          if (get(hasValues)) $$render(consequent_2);
        });
      }
      var section_1 = sibling(section, 2);
      var pre = sibling(child(section_1), 4);
      pre.textContent = `create table feedback (
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
  using (true);`;
      var pre_1 = sibling(pre, 4);
      pre_1.textContent = `-- In Supabase Dashboard > Storage:
-- 1. Create bucket named "screenshots"
-- 2. Set it to Public
-- Or via SQL:
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true);`;
      template_effect(() => {
        input.disabled = get(saving) || get(testing);
        input_1.disabled = get(saving) || get(testing);
        button.disabled = get(saving) || get(testing) || !get(hasValues);
        set_text(text_1, get(saving) ? "Saving..." : "Save");
        button_1.disabled = get(saving) || get(testing) || !get(hasValues);
        set_text(text_2, get(testing) ? "Testing..." : "Test Connection");
      });
      bind_value(input, () => get(url), ($$value) => set(url, $$value));
      bind_value(input_1, () => get(anonKey), ($$value) => set(anonKey, $$value));
      append($$anchor2, div_1);
    };
    if_block(node, ($$render) => {
      if (!get(loaded)) $$render(consequent);
      else $$render(alternate, false);
    });
  }
  append($$anchor, fragment);
  pop();
}
delegate(["click"]);
mount(Options, {
  target: document.getElementById("app")
});
