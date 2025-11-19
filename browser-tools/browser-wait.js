#!/usr/bin/env node

import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);
const flags = {
	selector: null,
	text: null,
	url: null,
	eval: null,
	timeout: 30000,
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
	if (args[i] === "--selector" && args[i + 1]) {
		flags.selector = args[++i];
	} else if (args[i] === "--text" && args[i + 1]) {
		flags.text = args[++i];
	} else if (args[i] === "--url" && args[i + 1]) {
		flags.url = args[++i];
	} else if (args[i] === "--eval" && args[i + 1]) {
		flags.eval = args[++i];
	} else if (args[i] === "--timeout" && args[i + 1]) {
		flags.timeout = parseInt(args[++i], 10);
	} else if (args[i] === "--help" || args[i] === "-h") {
		console.log("Usage: browser-wait.js [options]");
		console.log("\nOptions:");
		console.log("  --selector <css>     Wait for CSS selector to appear");
		console.log("  --text <string>      Wait for text content to appear");
		console.log("  --url <pattern>      Wait for URL to match pattern");
		console.log("  --eval <js>          Wait for JavaScript expression to be truthy");
		console.log("  --timeout <ms>       Timeout in milliseconds (default: 30000)");
		console.log("\nExamples:");
		console.log('  browser-wait.js --selector ".success-message"');
		console.log('  browser-wait.js --text "Login successful"');
		console.log('  browser-wait.js --url "dashboard" --timeout 5000');
		console.log('  browser-wait.js --eval "document.querySelectorAll(\\".item\\").length > 5"');
		process.exit(0);
	}
}

if (!flags.selector && !flags.text && !flags.url && !flags.eval) {
	console.error("Error: Must specify at least one wait condition");
	console.error("Run with --help for usage information");
	process.exit(1);
}

const b = await puppeteer.connect({
	browserURL: "http://localhost:9222",
	defaultViewport: null,
});

const page = (await b.pages()).at(-1);

try {
	const startTime = Date.now();

	if (flags.selector) {
		await page.waitForSelector(flags.selector, { timeout: flags.timeout });
		console.log(`✓ Selector "${flags.selector}" appeared (${Date.now() - startTime}ms)`);
	}

	if (flags.text) {
		await page.waitForFunction(
			(text) => document.body.innerText.includes(text),
			{ timeout: flags.timeout },
			flags.text,
		);
		console.log(`✓ Text "${flags.text}" appeared (${Date.now() - startTime}ms)`);
	}

	if (flags.url) {
		await page.waitForFunction(
			(pattern) => location.href.includes(pattern),
			{ timeout: flags.timeout },
			flags.url,
		);
		console.log(`✓ URL contains "${flags.url}" (${Date.now() - startTime}ms)`);
	}

	if (flags.eval) {
		await page.waitForFunction(flags.eval, { timeout: flags.timeout });
		console.log(`✓ Condition "${flags.eval}" became truthy (${Date.now() - startTime}ms)`);
	}
} catch (error) {
	console.error(`✗ Timeout: Condition not met within ${flags.timeout}ms`);
	process.exit(1);
} finally {
	await b.disconnect();
}
