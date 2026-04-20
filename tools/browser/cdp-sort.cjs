const WebSocket = require('ws');
async function run() {
    const res = await fetch('http://localhost:9222/json/list');
    const targets = await res.json();
    const target = targets.find(t => t.url && t.url.includes('tasks-fast'));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let msgId = 0;
    const pending = new Map();
    function send(method, params = {}) {
        return new Promise((resolve, reject) => {
            const id = ++msgId;
            pending.set(id, { resolve, reject });
            ws.send(JSON.stringify({ id, method, params }));
        });
    }
    ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id && pending.has(msg.id)) {
            const p = pending.get(msg.id);
            pending.delete(msg.id);
            if (msg.error) p.reject(msg.error); else p.resolve(msg.result);
        }
    });
    await new Promise(r => ws.on('open', r));
    await send('Runtime.enable');
    await send('Page.enable');
    await send('Page.navigate', { url: 'http://localhost:3333/tasks-fast?project=jat' });
    await new Promise(r => setTimeout(r, 3500));

    async function state() {
        const r = await send('Runtime.evaluate', {
            expression: `({
                firstId: document.querySelector('.task-row .task-id')?.textContent,
                lastId: [...document.querySelectorAll('.task-row .task-id')].pop()?.textContent,
                rows: document.querySelectorAll('.task-row').length,
                sortChipText: [...document.querySelectorAll('.chip-sort.active')].map(c => c.textContent.trim()),
                url: location.search
            })`,
            returnByValue: true
        });
        return r.result.value;
    }

    async function clickSort(label) {
        await send('Runtime.evaluate', {
            expression: `(() => {
                const chips = [...document.querySelectorAll('.chip-sort')];
                // label can be just "Age" or "Age ↑" — match starts-with
                const chip = chips.find(c => c.textContent.trim().startsWith('${label}'));
                if (chip) chip.click();
            })()`,
            returnByValue: true
        });
        await new Promise(r => setTimeout(r, 500));
    }

    console.log('init:', JSON.stringify(await state()));
    await clickSort('Age'); console.log('Age (1st):', JSON.stringify(await state()));
    await clickSort('Age'); console.log('Age (2nd, invert):', JSON.stringify(await state()));
    await clickSort('Age'); console.log('Age (3rd, invert back):', JSON.stringify(await state()));
    await clickSort('Updated'); console.log('Updated (switch):', JSON.stringify(await state()));
    await clickSort('Updated'); console.log('Updated (invert):', JSON.stringify(await state()));
    await clickSort('Priority'); console.log('Priority (back to default):', JSON.stringify(await state()));

    ws.close();
    process.exit(0);
}
run().catch(e => { console.error('ERR:', e.message || e); process.exit(1); });
