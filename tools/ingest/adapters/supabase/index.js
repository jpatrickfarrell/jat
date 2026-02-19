/**
 * Generic Supabase Table Adapter
 *
 * Watches any Supabase PostgreSQL table for new rows and creates tasks.
 * Uses a status column to track which rows have been ingested.
 * Supports configurable field mapping and description templates.
 *
 * Use cases: feedback reports, support tickets, error logs, form submissions.
 */
import { createHash } from 'node:crypto';
import { BaseAdapter, makeAttachment } from '../base.js';

/** @type {import('../base.js').PluginMetadata} */
export const metadata = {
  type: 'supabase',
  name: 'Supabase Table',
  description: 'Watch a Supabase PostgreSQL table for new rows and create tasks from them',
  version: '1.0.0',
  icon: {
    svg: 'M17.498 4.63l-1.873 2.395c-.45.576-1.335.576-1.785 0L11.967 4.63C10.94 3.32 9.286 2.5 7.5 2.5 4.462 2.5 2 4.962 2 8c0 6.5 10 13.5 10 13.5s10-7 10-13.5c0-3.038-2.462-5.5-5.5-5.5-1.786 0-3.44.82-4.502 2.13z',
    viewBox: '0 0 24 24',
    fill: false,
    color: '#3ECF8E'
  },
  configFields: [
    // Connection
    {
      key: 'projectUrl',
      label: 'Supabase Project URL',
      type: 'string',
      required: true,
      placeholder: 'https://xxx.supabase.co',
      helpText: 'Your Supabase project URL'
    },
    {
      key: 'secretName',
      label: 'Service Role Key Secret',
      type: 'secret',
      required: true,
      helpText: 'Name of the jat-secret containing the Supabase service role key'
    },
    {
      key: 'table',
      label: 'Table Name',
      type: 'string',
      required: true,
      placeholder: 'feedback_reports',
      helpText: 'The table to watch for new rows'
    },

    // Status tracking
    {
      key: 'statusColumn',
      label: 'Status Column',
      type: 'string',
      required: true,
      default: 'jat_status',
      helpText: 'Column that tracks ingest status'
    },
    {
      key: 'statusNew',
      label: 'New Row Value',
      type: 'string',
      required: true,
      default: 'new',
      helpText: 'Value in status column for unprocessed rows'
    },
    {
      key: 'statusDone',
      label: 'Ingested Value',
      type: 'string',
      required: true,
      default: 'ingested',
      helpText: 'Value to set after task creation'
    },
    {
      key: 'taskIdColumn',
      label: 'Task ID Column',
      type: 'string',
      default: 'jat_task_id',
      helpText: 'Column to write JAT task ID back to (optional)'
    },

    // Field mapping
    {
      key: 'titleColumn',
      label: 'Title Column',
      type: 'string',
      required: true,
      default: 'title',
      helpText: 'Column to use as the task title'
    },
    {
      key: 'descriptionTemplate',
      label: 'Description Template',
      type: 'string',
      helpText: 'Template with {column_name} placeholders for task description',
      placeholder: '**Reporter:** {reporter_name} ({reporter_email})\\n\\n{description}'
    },
    {
      key: 'authorColumn',
      label: 'Author Column',
      type: 'string',
      default: 'reporter_email',
      helpText: 'Column to use as the item author'
    },
    {
      key: 'timestampColumn',
      label: 'Timestamp Column',
      type: 'string',
      default: 'created_at',
      helpText: 'Column to use as the item timestamp'
    },

    // Attachments (optional)
    {
      key: 'attachmentColumn',
      label: 'Attachment Column',
      type: 'string',
      helpText: 'Column containing Storage paths (TEXT[] or JSONB array)'
    },
    {
      key: 'storageBucket',
      label: 'Storage Bucket',
      type: 'string',
      helpText: 'Supabase Storage bucket name for attachment downloads'
    }
  ],
  itemFields: [
    { key: 'table', label: 'Source Table', type: 'string' },
    { key: 'type', label: 'Type', type: 'string' },
    { key: 'priority', label: 'Priority', type: 'string' }
  ]
};

/**
 * Make a request to the Supabase REST API (PostgREST).
 */
async function supabaseRequest(projectUrl, serviceRoleKey, path, options = {}) {
  const url = `${projectUrl}/rest/v1/${path}`;
  const headers = {
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    'Prefer': options.prefer || 'return=representation',
    ...options.headers
  };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase API error (${res.status}): ${text}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return null;
}

/**
 * Generate a signed URL for a Supabase Storage object.
 */
async function getSignedUrl(projectUrl, serviceRoleKey, bucket, path) {
  const url = `${projectUrl}/storage/v1/object/sign/${bucket}/${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ expiresIn: 3600 }) // 1 hour
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.signedURL ? `${projectUrl}/storage/v1${data.signedURL}` : null;
}

/**
 * Replace {column_name} placeholders in a template string with row values.
 */
function renderTemplate(template, row) {
  if (!template) return '';
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const val = row[key];
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  });
}

export default class SupabaseAdapter extends BaseAdapter {
  constructor() {
    super('supabase');
  }

  validate(source) {
    if (!source.projectUrl) {
      return { valid: false, error: 'projectUrl is required' };
    }
    try {
      new URL(source.projectUrl);
    } catch {
      return { valid: false, error: `Invalid projectUrl: ${source.projectUrl}` };
    }
    if (!source.secretName) {
      return { valid: false, error: 'secretName is required (name of jat-secret for service role key)' };
    }
    if (!source.table) {
      return { valid: false, error: 'table is required' };
    }
    if (!source.statusColumn) {
      return { valid: false, error: 'statusColumn is required' };
    }
    if (!source.titleColumn) {
      return { valid: false, error: 'titleColumn is required' };
    }
    return { valid: true };
  }

  async poll(source, adapterState, getSecret) {
    const serviceRoleKey = getSecret(source.secretName);
    if (!serviceRoleKey) {
      throw new Error(`Secret "${source.secretName}" not found. Set it with: jat-secret --set ${source.secretName} <key>`);
    }

    const table = source.table;
    const statusCol = source.statusColumn || 'jat_status';
    const statusNew = source.statusNew || 'new';
    const titleCol = source.titleColumn || 'title';
    const authorCol = source.authorColumn || null;
    const timestampCol = source.timestampColumn || 'created_at';

    // Query new rows: SELECT * FROM table WHERE status = 'new' ORDER BY created_at ASC LIMIT 20
    const queryParams = `${statusCol}=eq.${encodeURIComponent(statusNew)}&order=${timestampCol}.asc&limit=20`;
    const rows = await supabaseRequest(source.projectUrl, serviceRoleKey, `${table}?${queryParams}`);

    // Query rejected rows for reopening tasks
    const rejectedParams = `${statusCol}=eq.rejected&order=${timestampCol}.asc&limit=20`;
    let rejectedRows = [];
    try {
      rejectedRows = await supabaseRequest(source.projectUrl, serviceRoleKey, `${table}?${rejectedParams}`) || [];
    } catch (err) {
      // Non-fatal: rejected polling is secondary
    }

    if ((!rows || rows.length === 0) && rejectedRows.length === 0) {
      return { items: [], state: adapterState };
    }

    const items = [];
    for (const row of (rows || [])) {
      const rowId = row.id || row.uuid || Object.values(row)[0];
      const title = row[titleCol] || 'Untitled';
      const author = authorCol ? row[authorCol] : null;
      const timestamp = row[timestampCol] || new Date().toISOString();

      // Build description from template or fall back to description column
      let description;
      if (source.descriptionTemplate) {
        description = renderTemplate(source.descriptionTemplate, row);
      } else {
        description = row.description || '';
      }

      // Handle attachments from Supabase Storage
      const attachments = [];
      if (source.attachmentColumn && source.storageBucket && row[source.attachmentColumn]) {
        const paths = Array.isArray(row[source.attachmentColumn])
          ? row[source.attachmentColumn]
          : [row[source.attachmentColumn]];

        for (const storagePath of paths) {
          if (!storagePath) continue;
          const signedUrl = await getSignedUrl(
            source.projectUrl, serviceRoleKey,
            source.storageBucket, storagePath
          );
          if (signedUrl) {
            attachments.push(makeAttachment(signedUrl, 'image', storagePath.split('/').pop()));
          }
        }
      }

      const hash = createHash('sha256')
        .update(String(rowId))
        .digest('hex');

      items.push({
        id: `supabase-${rowId}`,
        title,
        description,
        hash,
        author,
        timestamp,
        attachments: attachments.length > 0 ? attachments : undefined,
        fields: {
          table: source.table,
          type: row.type || '',
          priority: row.priority || ''
        },
        origin: {
          adapterType: 'supabase',
          table: source.table,
          rowId: String(rowId),
          metadata: {}
        }
      });
    }

    // Build rejection items (reopen existing tasks)
    const taskIdCol = source.taskIdColumn || 'jat_task_id';
    for (const row of rejectedRows) {
      const rowId = row.id || row.uuid || Object.values(row)[0];
      const taskId = row[taskIdCol];
      if (!taskId) continue; // Can't reopen without a task ID

      const hash = createHash('sha256')
        .update(`reject-${rowId}-${Date.now()}`)
        .digest('hex');

      items.push({
        id: `supabase-reject-${rowId}-${Date.now()}`,
        title: row[titleCol] || 'Rejected report',
        description: '',
        hash,
        author: authorCol ? row[authorCol] : null,
        timestamp: row[timestampCol] || new Date().toISOString(),
        rejection: {
          taskId,
          reason: row.rejection_reason || row.user_response || 'rejected'
        },
        origin: {
          adapterType: 'supabase',
          table: source.table,
          rowId: String(rowId),
          metadata: {}
        }
      });
    }

    return { items, state: adapterState };
  }

  /**
   * Called by the ingest daemon AFTER a task is created from an item.
   * Marks the source row as ingested and writes the task ID back.
   */
  async markIngested(source, item, taskId, getSecret) {
    const serviceRoleKey = getSecret(source.secretName);
    if (!serviceRoleKey) return;

    const rowId = item.origin?.rowId;
    if (!rowId) return;

    const statusCol = source.statusColumn || 'jat_status';
    const statusDone = source.statusDone || 'ingested';
    const taskIdCol = source.taskIdColumn || 'jat_task_id';

    const updateBody = { [statusCol]: statusDone };
    if (taskIdCol) {
      updateBody[taskIdCol] = taskId;
    }

    try {
      await supabaseRequest(
        source.projectUrl, serviceRoleKey,
        `${source.table}?id=eq.${encodeURIComponent(rowId)}`,
        { method: 'PATCH', body: updateBody }
      );
    } catch (err) {
      console.error(`[supabase-adapter] Failed to mark row ${rowId} as ingested:`, err.message);
    }
  }

  async test(source, getSecret) {
    const serviceRoleKey = getSecret(source.secretName);
    if (!serviceRoleKey) {
      return { ok: false, message: `Secret "${source.secretName}" not found` };
    }

    try {
      // Test connection by counting rows
      const rows = await supabaseRequest(
        source.projectUrl, serviceRoleKey,
        `${source.table}?select=id&limit=1`,
        { headers: { 'Prefer': 'count=exact' } }
      );

      // Try to get new row count
      const statusCol = source.statusColumn || 'jat_status';
      const statusNew = source.statusNew || 'new';
      const newRows = await supabaseRequest(
        source.projectUrl, serviceRoleKey,
        `${source.table}?${statusCol}=eq.${encodeURIComponent(statusNew)}&select=id&limit=5`
      );

      const newCount = newRows ? newRows.length : 0;
      return {
        ok: true,
        message: `Connected to ${source.table}. ${newCount} new row(s) waiting for ingest.`
      };
    } catch (err) {
      return {
        ok: false,
        message: `Connection failed: ${err.message}`
      };
    }
  }
}
