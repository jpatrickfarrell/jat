#!/usr/bin/env node

import puppeteer from "puppeteer-core";
import { browserURL } from "./browser-port.js";

const positionalArgs = process.argv.slice(2).filter(a => !a.startsWith("--port"));
const url = positionalArgs[0];
const newTab = positionalArgs.includes("--new");

if (!url) {
	console.log("Usage: browser-nav.js [--port <number>] <url> [--new]");
	console.log("\nOptions:");
	console.log("  --port <number>  Chrome DevTools port (default: $JAT_BROWSER_PORT or 9222)");
	console.log("\nExamples:");
	console.log("  browser-nav.js https://example.com       # Navigate current tab");
	console.log("  browser-nav.js https://example.com --new # Open in new tab");
	process.exit(1);
}

const b = await puppeteer.connect({
	browserURL: browserURL(),
	defaultViewport: null,
});

if (newTab) {
	const p = await b.newPage();
	await p.goto(url, { waitUntil: "domcontentloaded" });
	console.log("✓ Opened:", url);
} else {
	const p = (await b.pages()).at(-1);
	await p.goto(url, { waitUntil: "domcontentloaded" });
	console.log("✓ Navigated to:", url);
}

await b.disconnect();
