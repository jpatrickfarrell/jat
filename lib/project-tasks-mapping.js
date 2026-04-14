/**
 * JAT → project_tasks Column Mapping
 *
 * Defines how JAT task columns map to the JST project_tasks schema when
 * graduating into an existing project_tasks table instead of creating a
 * separate `tasks` table.
 *
 * Key differences between the two schemas:
 *   - project_tasks uses UUID primary key; JAT uses TEXT ids like "jat-abc12"
 *   - project_tasks.priority is TEXT (low/medium/high/critical); JAT uses INTEGER 0-5
 *   - project_tasks has no `internal` column; visibility is gated by status='dev'
 *   - project_tasks.assignee was replaced by assignee_id UUID (FK to profiles)
 *   - project_tasks has `source` TEXT to distinguish origin (feedback/jat/manual)
 */

import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Priority mapping: JAT INTEGER → project_tasks TEXT
// ---------------------------------------------------------------------------

/** @type {Record<number, string>} */
const PRIORITY_INT_TO_TEXT = {
  0: 'critical',
  1: 'high',
  2: 'medium',
  3: 'low',
  4: 'low',
  5: 'low',
};

/** @type {Record<string, number>} */
const PRIORITY_TEXT_TO_INT = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/**
 * Convert JAT integer priority to project_tasks text priority.
 * @param {number} intPriority
 * @returns {string}
 */
export function priorityToText(intPriority) {
  return PRIORITY_INT_TO_TEXT[intPriority] ?? 'medium';
}

/**
 * Convert project_tasks text priority to JAT integer priority.
 * @param {string} textPriority
 * @returns {number}
 */
export function priorityToInt(textPriority) {
  return PRIORITY_TEXT_TO_INT[textPriority] ?? 2;
}

// ---------------------------------------------------------------------------
// Status passthrough
//
// Post-unification (see lib/task-statuses.js, jat-ch9y0), SQLite and Postgres
// use the identical status vocabulary. No translation needed — these helpers
// exist only to support the `defaultStatus` override used by tasks-graduate.js
// when importing rows.
// ---------------------------------------------------------------------------

/**
 * @param {string} status
 * @param {string} [defaultStatus] - Override (e.g., 'dev' for bulk imports)
 * @returns {string}
 */
export function statusToProjectTasks(status, defaultStatus) {
  return defaultStatus || status;
}

// ---------------------------------------------------------------------------
// Issue type mapping: JAT → project_tasks
// ---------------------------------------------------------------------------

/** Valid issue_type values in project_tasks CHECK constraint */
const VALID_ISSUE_TYPES = new Set(['bug', 'feature', 'task', 'epic']);

/**
 * Map JAT issue_type to a value accepted by project_tasks CHECK constraint.
 * Types like 'chore' and 'chat' are JAT-internal; map to 'task'.
 * @param {string} issueType
 * @returns {string}
 */
function mapIssueType(issueType) {
  return VALID_ISSUE_TYPES.has(issueType) ? issueType : 'task';
}

// ---------------------------------------------------------------------------
// Row mapping: JAT task row → project_tasks INSERT values
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} MappedRow
 * @property {string} id        - Generated UUID for project_tasks primary key
 * @property {string} jat_id    - Original JAT task ID (e.g., "jat-abc12")
 * @property {string} title
 * @property {string} description
 * @property {string} notes
 * @property {string} status    - Mapped status value
 * @property {string} priority  - TEXT priority (low/medium/high/critical)
 * @property {string} issue_type
 * @property {string|null} reserved_files
 * @property {string|null} command
 * @property {string|null} agent_program
 * @property {string|null} model
 * @property {string|null} schedule_cron
 * @property {string|null} next_run_at
 * @property {string|null} due_date
 * @property {string} labels_text
 * @property {string} source    - Always 'jat' for graduated tasks
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string|null} closed_at
 * @property {string} close_reason
 */

/**
 * Map a single JAT task row to project_tasks column values.
 *
 * @param {Record<string, any>} jatRow - Raw row from JAT SQLite export
 * @param {{ defaultStatus?: string }} [options]
 * @returns {MappedRow}
 */
export function mapTaskRow(jatRow, options = {}) {
  return {
    id: randomUUID(),
    jat_id: jatRow.id,
    title: jatRow.title,
    description: jatRow.description || '',
    notes: jatRow.notes || '',
    status: statusToProjectTasks(jatRow.status, options.defaultStatus),
    priority: priorityToText(jatRow.priority),
    issue_type: mapIssueType(jatRow.issue_type || 'task'),
    reserved_files: jatRow.reserved_files || null,
    command: jatRow.command || null,
    agent_program: jatRow.agent_program || null,
    model: jatRow.model || null,
    schedule_cron: jatRow.schedule_cron || null,
    next_run_at: jatRow.next_run_at || null,
    due_date: jatRow.due_date || null,
    labels_text: jatRow.labels_text || '',
    source: 'jat',
    created_at: jatRow.created_at,
    updated_at: jatRow.updated_at,
    closed_at: jatRow.closed_at || null,
    close_reason: jatRow.close_reason || '',
  };
}

// ---------------------------------------------------------------------------
// Parent-id mapping helper
// ---------------------------------------------------------------------------

/**
 * Build a jat_id → UUID lookup from an array of mapped rows, so parent_id
 * references (which use JAT ids) can be resolved to UUIDs.
 *
 * @param {MappedRow[]} mappedRows
 * @returns {Map<string, string>}  jat_id → uuid
 */
export function buildIdMap(mappedRows) {
  const map = new Map();
  for (const row of mappedRows) {
    map.set(row.jat_id, row.id);
  }
  return map;
}

// ---------------------------------------------------------------------------
// SQL generation
// ---------------------------------------------------------------------------

/**
 * Generate the INSERT statement for a single row into project_tasks.
 * Returns { sql, params } for use with pg client.query().
 *
 * @returns {{ sql: string, params: any[] }}
 */
export function insertProjectTaskSQL() {
  return {
    sql: `
      INSERT INTO project_tasks (
        id, jat_id, title, description, notes, status, priority, issue_type,
        reserved_files, parent_id, command, agent_program, model,
        schedule_cron, next_run_at, due_date, labels_text, source,
        created_at, updated_at, closed_at, close_reason
      ) VALUES (
        $1::uuid, $2, $3, $4, $5, $6, $7, $8,
        $9, NULL, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18::timestamptz, $19::timestamptz, $20::timestamptz, $21
      )
    `,
    /**
     * @param {MappedRow} row
     * @returns {any[]}
     */
    params(row) {
      return [
        row.id,               // $1  id (UUID)
        row.jat_id,           // $2  jat_id
        row.title,            // $3  title
        row.description,      // $4  description
        row.notes,            // $5  notes
        row.status,           // $6  status
        row.priority,         // $7  priority (TEXT)
        row.issue_type,       // $8  issue_type
        row.reserved_files,   // $9  reserved_files
        row.command,          // $10 command
        row.agent_program,    // $11 agent_program
        row.model,            // $12 model
        row.schedule_cron,    // $13 schedule_cron
        row.next_run_at,      // $14 next_run_at
        row.due_date,         // $15 due_date
        row.labels_text,      // $16 labels_text
        row.source,           // $17 source
        row.created_at,       // $18 created_at
        row.updated_at,       // $19 updated_at
        row.closed_at,        // $20 closed_at
        row.close_reason,     // $21 close_reason
      ];
    },
  };
}

/**
 * SQL to set parent_id on a project_tasks row using the UUID resolved from
 * the jat_id → UUID map.
 */
export const UPDATE_PARENT_SQL =
  'UPDATE project_tasks SET parent_id = $1::uuid WHERE id = $2::uuid';
