const WebSocket = require('ws');
async function run() {
    const res = await fetch('http://localhost:9222/json/list');
    const targets = await res.json();
    const target = targets.find(t => t.url && t.url.includes('tasks-fast'));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let id = 0;
    const p = new Map();
    const send = (m, pp = {}) => new Promise((r, rj) => { const i = ++id; p.set(i, { r, rj }); ws.send(JSON.stringify({ id: i, method: m, params: pp })); });
    ws.on('message', (d) => { const m = JSON.parse(d.toString()); if (m.id && p.has(m.id)) { const { r, rj } = p.get(m.id); p.delete(m.id); m.error ? rj(m.error) : r(m.result); }});
    await new Promise(r => ws.on('open', r));
    await send('Runtime.enable');

    const r = await send('Runtime.evaluate', {
        expression: `({
            selectedTaskId: document.querySelector('.task-row.selected .task-id')?.textContent,
            detailTaskId: document.querySelector('.detail-panel .task-id-badge, .detail-header .task-id, [class*=task-id]')?.textContent,
            titleInHeader: document.querySelector('.detail-title, .detail-panel h1, h1.task-title')?.textContent,
            assignSlotLabel: document.querySelector('.action-bar .slot-picker:first-of-type .sd-trigger .truncate')?.textContent,
            replyToLabel: document.querySelector('[class*=reply-to], [class*=reply]')?.textContent?.slice(0,120),
        })`,
        returnByValue: true
    });
    console.log(JSON.stringify(r.result.value, null, 2));
    ws.close();
    process.exit(0);
}
run().catch(e => { console.error('ERR:', e.message || e); process.exit(1); });
