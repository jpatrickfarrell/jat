import puppeteer from "puppeteer-core";

const b = await puppeteer.connect({
  browserURL: "http://localhost:9222",
  defaultViewport: null,
});
const p = (await b.pages()).at(-1);

await p.goto("http://127.0.0.1:3333/tasks?project=flush", {waitUntil: "networkidle0"});
await new Promise(r => setTimeout(r, 2000));

// Resize to a narrower width to match the user's likely viewport
await p.setViewport({width: 1024, height: 768});
await new Promise(r => setTimeout(r, 1000));
await p.screenshot({path: '/tmp/narrow-before.png', fullPage: false});

// Hover swarm
const swarmBtn = await p.$('.swarm-btn');
if (swarmBtn) {
  await swarmBtn.hover();
  await new Promise(r => setTimeout(r, 500));
  await p.screenshot({path: '/tmp/narrow-during-hover.png', fullPage: false});
  
  // Measure
  const info = await p.evaluate(() => {
    const tables = document.querySelectorAll('.epic-group table');
    const results = [];
    tables.forEach((t, i) => {
      const rows = t.querySelectorAll('tbody tr');
      const firstRow = rows[0];
      results.push({
        tableIdx: i,
        tableWidth: Math.round(t.getBoundingClientRect().width),
        rowWidth: firstRow ? Math.round(firstRow.getBoundingClientRect().width) : null,
        highlighted: firstRow?.classList.contains('swarm-highlight'),
        cellWidths: firstRow ? Array.from(firstRow.querySelectorAll('td')).map(td => Math.round(td.getBoundingClientRect().width)) : []
      });
    });
    
    // Check main content
    const main = document.querySelector('main');
    return {
      mainWidth: main ? Math.round(main.getBoundingClientRect().width) : null,
      tables: results,
      highlightedCount: document.querySelectorAll('.swarm-highlight').length,
    };
  });
  console.log("Narrow viewport during hover:", JSON.stringify(info, null, 2));
  
  // Mouse away
  await p.mouse.move(0, 0);
  await new Promise(r => setTimeout(r, 1000));
}

// Now try even narrower
await p.setViewport({width: 800, height: 600});
await new Promise(r => setTimeout(r, 1000));
await p.screenshot({path: '/tmp/very-narrow-before.png', fullPage: false});

const swarmBtn2 = await p.$('.swarm-btn');
if (swarmBtn2) {
  await swarmBtn2.hover();
  await new Promise(r => setTimeout(r, 500));
  await p.screenshot({path: '/tmp/very-narrow-during-hover.png', fullPage: false});
}

// Restore viewport
await p.setViewport({width: 1546, height: 1150});

await b.disconnect();
