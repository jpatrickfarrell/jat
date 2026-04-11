#!/usr/bin/env node
/**
 * Integration tests for lib/tasks-postgres.js
 *
 * Runs against a real Postgres instance reachable via the `JAT_PG_TEST_URL`
 * environment variable.  When that variable is not set, the test script
 * prints an instruction and exits 0 so local development without Postgres
 * still passes `npm test`.
 *
 * To run against a throw-away container:
 *
 *   docker run -d --name jat-pg-test -p 55432:5432 \
 *     -e POSTGRES_PASSWORD=jat -e POSTGRES_DB=jat_test postgres:16
 *   export JAT_PG_TEST_URL=postgres://postgres:jat@127.0.0.1:55432/jat_test
 *   node lib/tasks-postgres.test.mjs
 *   docker rm -f jat-pg-test
 *
 * The suite runs serially, wipes the three task tables between sections,
 * and asserts behavior against the PostgresTaskBackend class.
 */

import { PostgresTaskBackend, closeAllPools } from './tasks-postgres.js';
import assert from 'node:assert/strict';

const URL = process.env.JAT_PG_TEST_URL;

if (!URL) {
    console.log('ℹ️  Skipping lib/tasks-postgres.test.mjs');
    console.log('    Set JAT_PG_TEST_URL to a writable Postgres DSN to enable.');
    console.log('    Example: postgres://postgres:jat@127.0.0.1:55432/jat_test');
    process.exit(0);
}

const backend = new PostgresTaskBackend({
    connectionString: URL,
    projectName: 'jat',
    projectPath: '/tmp/fake-jat-project',
});

let failures = 0;
const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

async function wipe() {
    const client = await backend.pool.connect();
    try {
        await client.query('TRUNCATE tasks, dependencies, labels, comments RESTART IDENTITY CASCADE');
    } finally {
        client.release();
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test('initProject creates schema and is idempotent', async () => {
    await backend.initProject(); // first call
    await backend.initProject(); // should not error
    const client = await backend.pool.connect();
    try {
        const { rows } = await client.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
        );
        const names = rows.map((r) => r.table_name);
        assert.ok(names.includes('tasks'),        'tasks table missing');
        assert.ok(names.includes('dependencies'), 'dependencies table missing');
        assert.ok(names.includes('labels'),       'labels table missing');
        assert.ok(names.includes('comments'),     'comments table missing');
    } finally {
        client.release();
    }
});

test('generateId returns prefixed 5-char ids', () => {
    const a = backend.generateId('jat');
    const b = backend.generateId('jat');
    assert.match(a, /^jat-[a-z0-9]{5}$/);
    assert.notEqual(a, b, 'ids must be unique');
});

test('create + getById round-trips with labels and deps', async () => {
    await wipe();
    const root = await backend.create({
        projectPath: '/tmp/fake-jat-project',
        title: 'Root task',
        description: 'Root description',
        priority: 1,
        labels: ['alpha', 'beta'],
    });
    assert.equal(root.title, 'Root task');
    assert.equal(root.priority, 1);
    assert.equal(root.status, 'open');
    assert.equal(root.project, 'jat');
    assert.deepEqual(root.labels.sort(), ['alpha', 'beta']);
    assert.deepEqual(root.comments, []);

    const child = await backend.create({
        projectPath: '/tmp/fake-jat-project',
        title: 'Child task',
        priority: 2,
        deps: [root.id],
    });
    assert.equal(child.depends_on.length, 1);
    assert.equal(child.depends_on[0].id, root.id);
    assert.equal(child.depends_on[0].status, 'open');

    const fetched = await backend.getById(child.id);
    assert.equal(fetched.id, child.id);
    assert.equal(fetched.depends_on[0].id, root.id);

    assert.equal(await backend.getById('jat-missing'), null);
});

test('list() filters by status, priority, and project name', async () => {
    await wipe();
    const a = await backend.create({ projectPath: '/tmp/fake-jat-project', title: 'A', priority: 0 });
    const b = await backend.create({ projectPath: '/tmp/fake-jat-project', title: 'B', priority: 1 });
    await backend.close(b.id, 'done');

    const open = await backend.list({ status: 'open' });
    assert.deepEqual(open.map((t) => t.id), [a.id]);

    const p1 = await backend.list({ priority: 1 });
    assert.equal(p1.length, 1);
    assert.equal(p1[0].id, b.id);

    const scoped = await backend.list({ projectName: 'jat' });
    assert.equal(scoped.length, 2);

    const wrongProject = await backend.list({ projectName: 'nope' });
    assert.equal(wrongProject.length, 0);
});

test('getReady skips tasks with open blockers', async () => {
    await wipe();
    const blocker = await backend.create({ projectPath: '/tmp/fake-jat-project', title: 'Blocker', priority: 0 });
    const blocked = await backend.create({
        projectPath: '/tmp/fake-jat-project',
        title: 'Blocked',
        priority: 0,
        deps: [blocker.id],
    });

    let ready = await backend.getReady();
    assert.deepEqual(ready.map((t) => t.id).sort(), [blocker.id]);

    await backend.close(blocker.id, 'done');
    ready = await backend.getReady();
    assert.deepEqual(ready.map((t) => t.id).sort(), [blocked.id]);
});

test('update() changes fields, handles status + closed_at, replaces labels', async () => {
    await wipe();
    const t = await backend.create({
        projectPath: '/tmp/fake-jat-project',
        title: 'Original',
        labels: ['one', 'two'],
    });

    const updated = await backend.update(t.id, {
        title: 'Renamed',
        status: 'in_progress',
        labels: ['three'],
    });
    assert.equal(updated.title, 'Renamed');
    assert.equal(updated.status, 'in_progress');
    assert.equal(updated.closed_at, null);
    assert.deepEqual(updated.labels, ['three']);

    const closed = await backend.update(t.id, { status: 'closed' });
    assert.equal(closed.status, 'closed');
    assert.ok(closed.closed_at, 'closed_at should be set on close');

    const reopened = await backend.update(t.id, { status: 'open' });
    assert.equal(reopened.closed_at, null);

    await assert.rejects(
        () => backend.update('jat-missing', { title: 'nope' }),
        /Task not found/
    );
});

test('close() sets close_reason and rejects unknown ids', async () => {
    await wipe();
    const t = await backend.create({ projectPath: '/tmp/fake-jat-project', title: 'To close' });
    const closed = await backend.close(t.id, 'finished');
    assert.equal(closed.status, 'closed');
    assert.equal(closed.close_reason, 'finished');

    await assert.rejects(() => backend.close('jat-missing', 'x'), /Task not found/);
});

test('delete() removes task and cascades labels/deps/comments', async () => {
    await wipe();
    const t = await backend.create({
        projectPath: '/tmp/fake-jat-project',
        title: 'Doomed',
        labels: ['gone'],
    });
    await backend.addComment(t.id, 'tester', 'bye');
    const ok = await backend.delete(t.id);
    assert.equal(ok, true);
    assert.equal(await backend.getById(t.id), null);

    const client = await backend.pool.connect();
    try {
        const { rows: lbl } = await client.query('SELECT count(*) FROM labels WHERE issue_id = $1', [t.id]);
        assert.equal(Number(lbl[0].count), 0, 'labels should cascade');
        const { rows: cmt } = await client.query('SELECT count(*) FROM comments WHERE issue_id = $1', [t.id]);
        assert.equal(Number(cmt[0].count), 0, 'comments should cascade');
    } finally {
        client.release();
    }

    await assert.rejects(() => backend.delete('jat-missing'), /Task not found/);
});

test('addDependency rejects self-deps, cycles, and dedupes', async () => {
    await wipe();
    const a = await backend.create({ projectPath: '/tmp/fake-jat-project', title: 'A' });
    const b = await backend.create({ projectPath: '/tmp/fake-jat-project', title: 'B' });
    const c = await backend.create({ projectPath: '/tmp/fake-jat-project', title: 'C' });

    await assert.rejects(() => backend.addDependency(a.id, a.id), /cannot depend on itself/);

    assert.equal(await backend.addDependency(a.id, b.id), true);
    assert.equal(await backend.addDependency(a.id, b.id), false); // duplicate → false
    assert.equal(await backend.addDependency(b.id, c.id), true);

    // Cycle: c → a would close the a → b → c → a loop.
    await assert.rejects(() => backend.addDependency(c.id, a.id), /would create a cycle/);
});

test('removeDependency drops only the target edge', async () => {
    await wipe();
    const a = await backend.create({ projectPath: '/tmp/fake-jat-project', title: 'A' });
    const b = await backend.create({ projectPath: '/tmp/fake-jat-project', title: 'B' });
    await backend.addDependency(a.id, b.id);
    assert.equal(await backend.removeDependency(a.id, b.id), true);
    assert.equal(await backend.removeDependency(a.id, b.id), false);

    const fresh = await backend.getById(a.id);
    assert.equal(fresh.depends_on.length, 0);
});

test('getDependencyTree returns depth-ordered nodes', async () => {
    await wipe();
    const a = await backend.create({ projectPath: '/tmp/fake-jat-project', title: 'A', priority: 0 });
    const b = await backend.create({ projectPath: '/tmp/fake-jat-project', title: 'B', priority: 1 });
    const c = await backend.create({ projectPath: '/tmp/fake-jat-project', title: 'C', priority: 2 });
    await backend.addDependency(a.id, b.id);
    await backend.addDependency(b.id, c.id);

    const forward = await backend.getDependencyTree(a.id);
    assert.equal(forward.length, 2);
    assert.equal(forward[0].id, b.id);
    assert.equal(forward[0].depth, 1);
    assert.equal(forward[1].id, c.id);
    assert.equal(forward[1].depth, 2);

    const reverse = await backend.getDependencyTree(c.id, { reverse: true });
    assert.deepEqual(reverse.map((n) => n.id).sort(), [a.id, b.id].sort());
});

test('addComment returns the new comment and getById includes it', async () => {
    await wipe();
    const t = await backend.create({ projectPath: '/tmp/fake-jat-project', title: 'With comments' });
    const first = await backend.addComment(t.id, 'alice', 'hello');
    const second = await backend.addComment(t.id, 'bob', 'world');
    assert.ok(first.id > 0);
    assert.notEqual(first.id, second.id);

    const fetched = await backend.getById(t.id);
    assert.equal(fetched.comments.length, 2);
    assert.equal(fetched.comments[0].author, 'alice');
});

test('search() finds tasks via tsvector and filters by status', async () => {
    await wipe();
    await backend.create({ projectPath: '/tmp/fake-jat-project', title: 'Postgres adapter implementation' });
    await backend.create({ projectPath: '/tmp/fake-jat-project', title: 'Unrelated UI tweak' });

    const hits = await backend.search('postgres adapter');
    assert.ok(hits.length >= 1, 'should find the postgres-titled task');
    assert.match(hits[0].title, /Postgres adapter/i);
    assert.ok(hits[0].relevance >= 0);

    const closedOnly = await backend.search('postgres adapter', { status: 'closed' });
    assert.equal(closedOnly.length, 0);
});

test('getScheduled() returns tasks with schedule_cron or next_run_at', async () => {
    await wipe();
    const plain = await backend.create({ projectPath: '/tmp/fake-jat-project', title: 'plain' });
    const scheduled = await backend.create({
        projectPath: '/tmp/fake-jat-project',
        title: 'scheduled',
        schedule_cron: '0 * * * *',
    });

    const result = await backend.getScheduled();
    assert.deepEqual(result.map((t) => t.id), [scheduled.id]);
    assert.ok(!result.find((t) => t.id === plain.id));
});

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

(async () => {
    console.log(`Running ${tests.length} Postgres backend tests against ${URL}\n`);
    for (const { name, fn } of tests) {
        try {
            await fn();
            console.log(`  ok  ${name}`);
        } catch (err) {
            failures++;
            console.error(`  FAIL ${name}`);
            console.error(`       ${err.message}`);
            if (err.stack) console.error(err.stack.split('\n').slice(1, 4).join('\n'));
        }
    }

    await closeAllPools();

    console.log();
    if (failures === 0) {
        console.log(`✅ ${tests.length}/${tests.length} Postgres tests passed.`);
    } else {
        console.log(`❌ ${failures}/${tests.length} Postgres tests FAILED.`);
    }
    process.exit(failures === 0 ? 0 : 1);
})();
