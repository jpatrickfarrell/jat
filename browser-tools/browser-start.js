#!/usr/bin/env node

import { spawn, execSync } from "node:child_process";
import puppeteer from "puppeteer-core";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";

const useProfile = process.argv[2] === "--profile";

if (process.argv[2] && process.argv[2] !== "--profile") {
	console.log("Usage: browser-start.js [--profile]");
	console.log("\nOptions:");
	console.log("  --profile  Copy your default Chrome/Chromium profile (cookies, logins)");
	console.log("\nExamples:");
	console.log("  browser-start.js            # Start with fresh profile");
	console.log("  browser-start.js --profile  # Start with your profile");
	process.exit(1);
}

// Detect platform and find Chrome/Chromium
function detectBrowser() {
	const platform = os.platform();

	if (platform === "darwin") {
		// macOS
		const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
		const profilePath = path.join(os.homedir(), "Library/Application Support/Google/Chrome");
		return {
			executable: chromePath,
			profilePath,
			killCommand: "killall 'Google Chrome'",
			name: "Google Chrome"
		};
	} else if (platform === "linux") {
		// Linux (including Arch)
		// Try to find chromium or google-chrome-stable
		const possiblePaths = [
			"/usr/bin/chromium",
			"/usr/bin/chromium-browser",
			"/usr/bin/google-chrome-stable",
			"/usr/bin/google-chrome",
			"/snap/bin/chromium"
		];

		let executable = null;
		let name = null;

		for (const p of possiblePaths) {
			if (fs.existsSync(p)) {
				executable = p;
				name = path.basename(p);
				break;
			}
		}

		if (!executable) {
			console.error("✗ Chrome/Chromium not found. Install with:");
			console.error("  Arch: sudo pacman -S chromium");
			console.error("  Ubuntu/Debian: sudo apt install chromium-browser");
			process.exit(1);
		}

		// Profile paths for Linux
		const profilePaths = [
			path.join(os.homedir(), ".config/chromium"),
			path.join(os.homedir(), ".config/google-chrome")
		];

		let profilePath = profilePaths[0]; // Default to chromium
		for (const p of profilePaths) {
			if (fs.existsSync(p)) {
				profilePath = p;
				break;
			}
		}

		return {
			executable,
			profilePath,
			killCommand: `killall ${name} || killall chromium || killall chrome`,
			name
		};
	} else if (platform === "win32") {
		// Windows
		const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
		const profilePath = path.join(os.homedir(), "AppData/Local/Google/Chrome/User Data");
		return {
			executable: chromePath,
			profilePath,
			killCommand: "taskkill /F /IM chrome.exe",
			name: "chrome.exe"
		};
	} else {
		console.error(`✗ Unsupported platform: ${platform}`);
		process.exit(1);
	}
}

const browser = detectBrowser();

console.log(`📍 Platform: ${os.platform()}`);
console.log(`🌐 Browser: ${browser.name}`);
console.log(`📂 Executable: ${browser.executable}`);
console.log(`👤 Profile: ${browser.profilePath}`);

// Kill existing Chrome/Chromium
try {
	execSync(browser.killCommand, { stdio: "ignore" });
	console.log(`✓ Killed existing ${browser.name} instances`);
} catch {
	// No instances running, that's fine
}

// Wait a bit for processes to fully die
await new Promise((r) => setTimeout(r, 1000));

// Setup profile directory
const cacheDir = path.join(os.homedir(), ".cache/scraping");
execSync(`mkdir -p ${cacheDir}`, { stdio: "ignore" });

if (useProfile) {
	console.log(`🔄 Syncing profile from ${browser.profilePath}...`);
	// Sync profile with rsync (works on Linux/macOS)
	try {
		execSync(
			`rsync -a --delete "${browser.profilePath}/" ${cacheDir}/`,
			{ stdio: "pipe" },
		);
		console.log(`✓ Profile synced`);
	} catch (error) {
		console.warn(`⚠ Profile sync failed, starting with fresh profile`);
	}
}

// Start Chrome in background (detached so Node can exit)
console.log(`🚀 Starting ${browser.name}...`);
spawn(
	browser.executable,
	["--remote-debugging-port=9222", `--user-data-dir=${cacheDir}`],
	{ detached: true, stdio: "ignore" },
).unref();

// Wait for Chrome to be ready by attempting to connect
let connected = false;
for (let i = 0; i < 30; i++) {
	try {
		const browserInstance = await puppeteer.connect({
			browserURL: "http://localhost:9222",
			defaultViewport: null,
		});
		await browserInstance.disconnect();
		connected = true;
		break;
	} catch {
		await new Promise((r) => setTimeout(r, 500));
	}
}

if (!connected) {
	console.error("✗ Failed to connect to Chrome");
	process.exit(1);
}

console.log(`✓ ${browser.name} started on :9222${useProfile ? " with your profile" : ""}`);
