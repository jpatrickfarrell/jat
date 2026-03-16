/**
 * Canvas seed templates — shipped as code, not database fixtures.
 *
 * Each template defines a name, description, category, and a blocks() function
 * that returns a fresh array of blocks with unique IDs each time.
 *
 * Downstream tasks add specific templates (Project Dashboard, Agent Monitor, etc.).
 * This module provides the template registry and seed function.
 */

import { createCanvasPage, listCanvasPages } from './canvas.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateBlockId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'blk-';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// ---------------------------------------------------------------------------
// Template Definitions
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} CanvasTemplate
 * @property {string} id - Unique template identifier
 * @property {string} name - Display name (also used as default page name)
 * @property {string} description - What this template is for
 * @property {string} category - Template category (general, project, agent, data)
 * @property {function(): Array} blocks - Factory function returning fresh blocks with unique IDs
 */

/** @type {CanvasTemplate[]} */
const templates = [
  {
    id: 'blank',
    name: 'Blank Page',
    description: 'Empty page with a single text block to get started',
    category: 'general',
    blocks: () => [
      {
        type: 'text',
        id: generateBlockId(),
        content: '# New Page\n\nStart writing here...',
      },
    ],
  },
  {
    id: 'notes',
    name: 'Notes',
    description: 'Simple notes page with sections and a checklist',
    category: 'general',
    blocks: () => [
      {
        type: 'text',
        id: generateBlockId(),
        content: '# Notes\n\nCapture ideas, decisions, and action items.',
      },
      { type: 'divider', id: generateBlockId() },
      {
        type: 'text',
        id: generateBlockId(),
        content: '## Key Decisions\n\n- ',
      },
      { type: 'divider', id: generateBlockId() },
      {
        type: 'text',
        id: generateBlockId(),
        content: '## Action Items\n\n- [ ] First task\n- [ ] Second task\n- [ ] Third task',
      },
    ],
  },
  {
    id: 'data-view',
    name: 'Data View',
    description: 'A page with a select control and table view, ready to connect to your data',
    category: 'data',
    blocks: () => [
      {
        type: 'text',
        id: generateBlockId(),
        content: '# Data View\n\nConnect the control and table below to a data table.',
      },
      { type: 'divider', id: generateBlockId() },
      {
        type: 'control',
        id: generateBlockId(),
        name: 'filter',
        controlType: 'select',
        config: { sourceTable: '', displayColumn: '', multiSelect: false },
        value: null,
      },
      {
        type: 'table_view',
        id: generateBlockId(),
        tableName: '',
        controlFilters: {},
        visibleColumns: [],
        sort: { column: '', direction: 'ASC' },
      },
    ],
  },
  {
    id: 'my-tasks',
    name: 'My Tasks',
    description: 'Personal task board filtered by assignee and status',
    category: 'project',
    blocks: () => [
      {
        type: 'text',
        id: generateBlockId(),
        content: '# My Tasks\n\nYour personal task board. Set your name in the assignee filter to see tasks assigned to you.',
      },
      { type: 'divider', id: generateBlockId() },
      {
        type: 'control',
        id: generateBlockId(),
        name: 'assignee',
        controlType: 'text_input',
        config: { placeholder: 'Filter by assignee name...' },
        value: '',
      },
      {
        type: 'control',
        id: generateBlockId(),
        name: 'status',
        controlType: 'select',
        config: { staticOptions: ['open', 'in_progress', 'blocked', 'closed'], multiSelect: true },
        value: ['open', 'in_progress'],
      },
      { type: 'divider', id: generateBlockId() },
      {
        type: 'table_view',
        id: generateBlockId(),
        tableName: 'tasks',
        controlFilters: { assignee: 'assignee', status: 'status' },
        visibleColumns: ['id', 'title', 'status', 'priority', 'issue_type', 'assignee', 'updated_at'],
        sort: { column: 'priority', direction: 'ASC' },
      },
    ],
  },
  {
    id: 'data-explorer',
    name: 'Data Explorer',
    description: 'Browse any data table with dynamic table selection and row count',
    category: 'data',
    blocks: () => [
      {
        type: 'text',
        id: generateBlockId(),
        content: '# Data Explorer\n\nSelect a table below to browse its contents. Use this to inspect any data table in the project.',
      },
      { type: 'divider', id: generateBlockId() },
      {
        type: 'control',
        id: generateBlockId(),
        name: 'table_name',
        controlType: 'select',
        config: { staticOptions: ['tasks', 'dependencies', 'labels', 'comments'], multiSelect: false },
        value: 'tasks',
      },
      {
        type: 'table_view',
        id: generateBlockId(),
        tableName: '{table_name}',
        controlFilters: {},
        visibleColumns: [],
        sort: { column: '', direction: 'ASC' },
      },
      { type: 'divider', id: generateBlockId() },
      {
        type: 'formula',
        id: generateBlockId(),
        expression: '"Row count: " & Count({table_name})',
        name: 'row_count',
      },
    ],
  },
  {
    id: 'agent-monitor',
    name: 'Agent Monitor',
    description: 'Live agent sessions, active tasks, and model usage — filterable by model',
    category: 'agent',
    blocks: () => [
      {
        type: 'text',
        id: generateBlockId(),
        content: '# Agent Monitor\n\nLive view of active agents and their current tasks. Use the controls below to filter by model or status.',
      },
      {
        type: 'control',
        id: generateBlockId(),
        name: 'model',
        controlType: 'select',
        config: {
          staticOptions: ['', 'opus', 'sonnet', 'haiku'],
          multiSelect: false,
        },
        value: '',
      },
      {
        type: 'control',
        id: generateBlockId(),
        name: 'status',
        controlType: 'select',
        config: {
          staticOptions: ['in_progress', 'open', 'blocked', 'closed'],
          multiSelect: false,
        },
        value: 'in_progress',
      },
      { type: 'divider', id: generateBlockId() },
      {
        type: 'formula',
        id: generateBlockId(),
        expression: '"Filtering: " + If({model}, "model=" + {model}, "all models") + ", status=" + {status}',
        name: 'active_filter',
      },
      {
        type: 'table_view',
        id: generateBlockId(),
        tableName: 'tasks',
        controlFilters: { model: 'model', status: 'status' },
        visibleColumns: ['id', 'title', 'assignee', 'model', 'agent_program', 'priority', 'updated_at'],
        sort: { column: 'updated_at', direction: 'DESC' },
      },
      { type: 'divider', id: generateBlockId() },
      {
        type: 'text',
        id: generateBlockId(),
        content: '## Token Usage Today\n\n*Token tracking available after Phase 3 — live data subscriptions.*',
      },
      {
        type: 'formula',
        id: generateBlockId(),
        expression: '"Token tracking not yet available"',
        name: 'token_usage',
      },
    ],
  },
  {
    id: 'project-dashboard',
    name: 'Project Dashboard',
    description: 'Task overview with status counts, filtered task list, and recent completions',
    category: 'project',
    blocks: () => [
      {
        type: 'text',
        id: generateBlockId(),
        content:
          '# Project Dashboard\n\nOverview of tasks by status with filtering. Use the controls below to narrow down the task list.',
      },
      {
        type: 'control',
        id: generateBlockId(),
        name: 'status',
        controlType: 'select',
        config: {
          staticOptions: ['open', 'in_progress', 'blocked', 'closed'],
          multiSelect: false,
        },
        value: null,
      },
      {
        type: 'control',
        id: generateBlockId(),
        name: 'assignee',
        controlType: 'text_input',
        config: { placeholder: 'Filter by assignee...' },
        value: null,
      },
      {
        type: 'control',
        id: generateBlockId(),
        name: 'due_date',
        controlType: 'date',
        config: { range: true },
        value: null,
      },
      { type: 'divider', id: generateBlockId() },
      {
        type: 'formula',
        id: generateBlockId(),
        expression:
          '"Filtering: " + If({status}, "status=" + {status}, "all statuses") + If({assignee}, ", assignee=" + {assignee}, "")',
        name: 'active_filter',
      },
      { type: 'divider', id: generateBlockId() },
      {
        type: 'table_view',
        id: generateBlockId(),
        tableName: 'tasks',
        controlFilters: { status: 'status', assignee: 'assignee', due_date: 'due_date' },
        visibleColumns: [
          'id',
          'title',
          'status',
          'priority',
          'assignee',
          'issue_type',
          'updated_at',
        ],
        sort: { column: 'priority', direction: 'ASC' },
      },
      { type: 'divider', id: generateBlockId() },
      {
        type: 'text',
        id: generateBlockId(),
        content: '## Recent Completions',
      },
      {
        type: 'control',
        id: generateBlockId(),
        name: 'completions_status',
        controlType: 'select',
        config: { staticOptions: ['closed'], multiSelect: false },
        value: 'closed',
      },
      {
        type: 'table_view',
        id: generateBlockId(),
        tableName: 'tasks',
        controlFilters: { status: 'completions_status' },
        visibleColumns: [
          'id',
          'title',
          'priority',
          'assignee',
          'close_reason',
          'updated_at',
        ],
        sort: { column: 'updated_at', direction: 'DESC' },
      },
    ],
  },
  {
    id: 'dashboard-starter',
    name: 'Dashboard Starter',
    description: 'Starting point for a dashboard with metrics, controls, and a data table',
    category: 'project',
    blocks: () => [
      {
        type: 'text',
        id: generateBlockId(),
        content: '# Dashboard\n\nCustomize this template by connecting controls and tables to your data.',
      },
      { type: 'divider', id: generateBlockId() },
      {
        type: 'control',
        id: generateBlockId(),
        name: 'category',
        controlType: 'select',
        config: { sourceTable: '', displayColumn: '', multiSelect: false },
        value: null,
      },
      {
        type: 'control',
        id: generateBlockId(),
        name: 'date_range',
        controlType: 'date',
        config: { range: true },
        value: null,
      },
      { type: 'divider', id: generateBlockId() },
      {
        type: 'formula',
        id: generateBlockId(),
        expression: '',
        name: 'metric1',
      },
      {
        type: 'formula',
        id: generateBlockId(),
        expression: '',
        name: 'metric2',
      },
      { type: 'divider', id: generateBlockId() },
      {
        type: 'table_view',
        id: generateBlockId(),
        tableName: '',
        controlFilters: {},
        visibleColumns: [],
        sort: { column: '', direction: 'DESC' },
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get all available templates.
 * @returns {CanvasTemplate[]}
 */
export function getTemplates() {
  return templates;
}

/**
 * Get a template by ID.
 * @param {string} id
 * @returns {CanvasTemplate|undefined}
 */
export function getTemplate(id) {
  return templates.find((t) => t.id === id);
}

/**
 * Instantiate a template into a page-ready object.
 * Returns { name, blocks } with fresh block IDs.
 * @param {string} templateId
 * @param {string} [customName] - Override the default page name
 * @returns {{ name: string, blocks: Array, templateId: string }|null}
 */
export function instantiateTemplate(templateId, customName) {
  const tmpl = getTemplate(templateId);
  if (!tmpl) return null;
  return {
    name: customName || tmpl.name,
    blocks: tmpl.blocks(),
    templateId: tmpl.id,
  };
}

/**
 * Seed canvas templates for a project. Skips templates whose name already
 * exists as a page (avoids duplicates on re-runs).
 *
 * @param {string} projectPath - Absolute path to the project root
 * @param {string} project - Project name
 * @param {string[]} [templateIds] - Specific templates to seed (default: all)
 * @returns {{ created: string[], skipped: string[] }}
 */
export function seedCanvasTemplates(projectPath, project, templateIds) {
  const toSeed = templateIds
    ? templates.filter((t) => templateIds.includes(t.id))
    : templates;

  const existingPages = listCanvasPages(projectPath, project);
  const existingNames = new Set(existingPages.map((p) => p.name.toLowerCase()));

  const created = [];
  const skipped = [];

  for (const tmpl of toSeed) {
    if (existingNames.has(tmpl.name.toLowerCase())) {
      skipped.push(tmpl.name);
      continue;
    }

    const instance = instantiateTemplate(tmpl.id);
    if (!instance) continue;

    createCanvasPage(projectPath, {
      name: instance.name,
      project,
      blocks: instance.blocks,
    });

    created.push(tmpl.name);
  }

  return { created, skipped };
}

export default {
  getTemplates,
  getTemplate,
  instantiateTemplate,
  seedCanvasTemplates,
};
