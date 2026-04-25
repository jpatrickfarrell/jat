import puppeteer from "puppeteer-core";

const b = await puppeteer.connect({
	browserURL: "http://127.0.0.1:9222",
	defaultViewport: null,
	protocolTimeout: 10000,
});

const p = (await b.pages()).at(-1);

await p.setViewport({ width: 800, height: 900 });

const cdp = await p.target().createCDPSession();
await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
await cdp.send('Page.reload', { ignoreCache: true });
await new Promise(r => setTimeout(r, 6000));

const status = async (label) => {
	const r = await p.evaluate(() => {
		const btn = document.querySelector('.mps-name-btn');
		const panel = document.querySelector('.mps-panel');
		return {
			ariaExp: btn?.getAttribute('aria-expanded'),
			panel: !!panel,
			panelOpacity: panel ? window.getComputedStyle(panel).opacity : null,
		};
	});
	console.log(`[${label}]`, JSON.stringify(r));
};

console.log('=== Toggle test with btn.click() ===');
await status('initial');

// Open
await p.evaluate(() => document.querySelector('.mps-name-btn')?.click());
await new Promise(r => setTimeout(r, 500));
await status('after open');

// Take screenshot
await p.screenshot({ path: '/tmp/mps-fix-open.png' });

// Close (toggle)
await p.evaluate(() => document.querySelector('.mps-name-btn')?.click());
await new Promise(r => setTimeout(r, 300));
await status('after close (toggle)');

// Open again
await p.evaluate(() => document.querySelector('.mps-name-btn')?.click());
await new Promise(r => setTimeout(r, 500));
await status('after open again');

// Click outside
await p.evaluate(() => document.body.click());
await new Promise(r => setTimeout(r, 300));
await status('after body click');

await b.disconnect();
