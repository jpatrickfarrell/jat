#!/usr/bin/env node

import puppeteer from "puppeteer-core";

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
	console.log("Usage: browser-snapshot.js [options]");
	console.log("\nOptions:");
	console.log("  --full          Include all node details (larger output)");
	console.log("  --help, -h      Show this help message");
	console.log("\nDescription:");
	console.log("  Captures accessibility tree snapshot of current page.");
	console.log("  Returns structured JSON (5KB vs 5MB HTML).");
	console.log("  Useful for LLM page analysis with massive token savings.");
	console.log("\nExamples:");
	console.log("  browser-snapshot.js                  # Minimal snapshot");
	console.log("  browser-snapshot.js --full           # Full details");
	console.log("  browser-snapshot.js > page-state.json # Save to file");
	process.exit(0);
}

const fullDetails = args.includes("--full");

const b = await puppeteer.connect({
	browserURL: "http://localhost:9222",
	defaultViewport: null,
});

const page = (await b.pages()).at(-1);

try {
	// Get accessibility tree snapshot
	const snapshot = await page.accessibility.snapshot();

	if (!snapshot) {
		console.error("✗ Failed to capture accessibility snapshot");
		process.exit(1);
	}

	// Format output
	const output = {
		url: page.url(),
		title: await page.title(),
		timestamp: new Date().toISOString(),
		snapshot: fullDetails ? snapshot : simplifySnapshot(snapshot),
	};

	console.log(JSON.stringify(output, null, 2));
} catch (error) {
	console.error(`✗ Error: ${error.message}`);
	process.exit(1);
} finally {
	await b.disconnect();
}

// Simplify snapshot for minimal output
function simplifySnapshot(node) {
	if (!node) return null;

	const simplified = {
		role: node.role,
	};

	if (node.name) simplified.name = node.name;
	if (node.value) simplified.value = node.value;

	if (node.children && node.children.length > 0) {
		simplified.children = node.children.map(simplifySnapshot).filter(Boolean);
	}

	return simplified;
}
