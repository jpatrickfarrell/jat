#!/usr/bin/env bash
#
# Create and seed test databases for CI
#
# Creates:
#   ~/code/test-project/.jat/tasks.db  - Task database with test data
#   ~/.agent-mail.db                   - Agent Mail database with test data
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Safety: only run in CI or with --force flag
if [[ -z "${CI:-}" ]] && [[ "${1:-}" != "--force" ]]; then
  echo "ERROR: This script creates/overwrites test databases."
  echo "       Only runs in CI environments (CI=true) or with --force flag."
  exit 1
fi

echo "Seeding test databases..."

# --- Task Database ---
TEST_PROJECT="$HOME/code/test-project"
mkdir -p "$TEST_PROJECT/.jat"
TASKS_DB="$TEST_PROJECT/.jat/tasks.db"
rm -f "$TASKS_DB"

# Create schema
sqlite3 "$TASKS_DB" < "$PROJECT_ROOT/lib/tasks-schema.sql"

# Seed test tasks
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
sqlite3 "$TASKS_DB" <<SQL
INSERT INTO tasks (id, title, description, status, priority, issue_type, assignee, created_at, updated_at)
VALUES
  ('test-aaa01', 'Fix login timeout', 'Users see timeout on OAuth login', 'open', 0, 'bug', NULL, '$NOW', '$NOW'),
  ('test-aaa02', 'Add dark mode', 'Implement dark theme toggle', 'open', 1, 'feature', NULL, '$NOW', '$NOW'),
  ('test-aaa03', 'Refactor auth module', 'Clean up auth middleware', 'in_progress', 2, 'task', 'TestAgent', '$NOW', '$NOW'),
  ('test-aaa04', 'Update dependencies', 'Bump all npm packages', 'closed', 3, 'task', 'TestAgent', '$NOW', '$NOW');

INSERT INTO labels (issue_id, label) VALUES
  ('test-aaa01', 'security'),
  ('test-aaa01', 'urgent'),
  ('test-aaa02', 'ui'),
  ('test-aaa03', 'backend');

INSERT INTO dependencies (issue_id, depends_on_id, type) VALUES
  ('test-aaa02', 'test-aaa01', 'blocks');

INSERT INTO comments (issue_id, author, text, created_at) VALUES
  ('test-aaa01', 'TestAgent', 'Investigating root cause', '$NOW');
SQL

echo "  Created $TASKS_DB with 4 test tasks"

# --- Agent Mail Database ---
MAIL_DB="$HOME/.agent-mail.db"
rm -f "$MAIL_DB"

sqlite3 "$MAIL_DB" <<'SQL'
CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    human_key TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_human_key ON projects(human_key);

CREATE TABLE agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    program TEXT NOT NULL,
    model TEXT NOT NULL,
    task_description TEXT DEFAULT '',
    inception_ts TEXT NOT NULL DEFAULT (datetime('now')),
    last_active_ts TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    UNIQUE (project_id, name)
);
CREATE INDEX idx_agents_project_id ON agents(project_id);
CREATE INDEX idx_agents_name ON agents(name);
CREATE INDEX idx_agents_last_active ON agents(last_active_ts);

CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    thread_id TEXT,
    subject TEXT NOT NULL,
    body_md TEXT NOT NULL,
    importance TEXT NOT NULL DEFAULT 'normal',
    ack_required INTEGER DEFAULT 0,
    created_ts TEXT NOT NULL DEFAULT (datetime('now')),
    expires_ts TEXT DEFAULT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (sender_id) REFERENCES agents(id)
);
CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_created_ts ON messages(created_ts);

CREATE VIRTUAL TABLE messages_fts USING fts5(
    subject, body_md,
    content=messages, content_rowid=id
);

CREATE TRIGGER messages_fts_insert AFTER INSERT ON messages BEGIN
    INSERT INTO messages_fts(rowid, subject, body_md)
    VALUES (new.id, new.subject, new.body_md);
END;
CREATE TRIGGER messages_fts_delete AFTER DELETE ON messages BEGIN
    DELETE FROM messages_fts WHERE rowid = old.id;
END;
CREATE TRIGGER messages_fts_update AFTER UPDATE ON messages BEGIN
    DELETE FROM messages_fts WHERE rowid = old.id;
    INSERT INTO messages_fts(rowid, subject, body_md)
    VALUES (new.id, new.subject, new.body_md);
END;

CREATE TABLE message_recipients (
    message_id INTEGER NOT NULL,
    agent_id INTEGER NOT NULL,
    kind TEXT NOT NULL DEFAULT 'to',
    read_ts TEXT,
    ack_ts TEXT,
    PRIMARY KEY (message_id, agent_id),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents(id)
);
CREATE INDEX idx_recipients_agent_id ON message_recipients(agent_id);
CREATE INDEX idx_recipients_read_ts ON message_recipients(read_ts);

-- Seed test data
INSERT INTO projects (slug, human_key) VALUES ('test-project', '/home/runner/code/test-project');
INSERT INTO agents (project_id, name, program, model, task_description)
VALUES
  (1, 'TestAlpha', 'claude-code', 'sonnet-4.5', 'Fix login timeout'),
  (1, 'TestBeta', 'claude-code', 'opus', 'Add dark mode');

INSERT INTO messages (project_id, sender_id, thread_id, subject, body_md, importance)
VALUES
  (1, 1, 'thread-001', 'Starting work on login fix', 'Beginning investigation of OAuth timeout issue.', 'normal'),
  (1, 2, 'thread-001', 'Re: Starting work on login fix', 'Found related config in auth module.', 'normal'),
  (1, 1, 'thread-002', 'Completed login fix', 'The OAuth timeout has been resolved by increasing token refresh interval.', 'high');

INSERT INTO message_recipients (message_id, agent_id, kind) VALUES
  (1, 2, 'to'),
  (2, 1, 'to'),
  (3, 2, 'to');
SQL

echo "  Created $MAIL_DB with 2 test agents and 3 test messages"
echo "Done seeding test databases."
