#!/usr/bin/env node

import { spawn, execSync } from "node:child_process";
import puppeteer from "puppeteer-core";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";

// Parse arguments
let useProfile = false;
let port = null;

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
	if (args[i] === "--profile") {
		useProfile = true;
	} else if (args[i] === "--port") {
		port = parseInt(args[++i]);
	} else if (args[i].startsWith("--port=")) {
		port = parseInt(args[i].split("=")[1]);
	} else if (args[i] === "--help" || args[i] === "-h") {
		console.log("Usage: browser-start.js [--port <number>] [--profile]");
		console.log("\nOptions:");
		console.log("  --port <number>  Chrome DevTools port (default: auto via jat-browser, fallback 9222)");
		console.log("  --profile        Copy your default Chrome/Chromium profile (cookies, logins)");
		console.log("\nExamples:");
		console.log("  browser-start.js                    # Auto-assign port, fresh profile");
		console.log("  browser-start.js --port 9223        # Use specific port");
		console.log("  browser-start.js --profile          # Start with your profile");
		process.exit(0);
	}
}

// Auto-assign port if not specified
if (!port) {
	try {
		const available = execSync("jat-browser available 2>/dev/null", { encoding: "utf-8" }).trim();
		port = parseInt(available);
	} catch {
		port = 9222; // Fallback
	}
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
			name
		};
	} else if (platform === "win32") {
		// Windows
		const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
		const profilePath = path.join(os.homedir(), "AppData/Local/Google/Chrome/User Data");
		return {
			executable: chromePath,
			profilePath,
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
console.log(`🔌 Port: ${port}`);

// Kill only the process on the specific port (not all Chrome instances)
try {
	const pids = execSync(`lsof -i :${port} -t 2>/dev/null`, { encoding: "utf-8" }).trim();
	if (pids) {
		for (const pid of pids.split("\n")) {
			try {
				process.kill(parseInt(pid));
			} catch {
				// Process already gone
			}
		}
		console.log(`✓ Killed existing process on port ${port}`);
	}
} catch {
	// No process on that port, that's fine
}

// Wait a bit for processes to fully die
await new Promise((r) => setTimeout(r, 1000));

// Setup profile directory (unique per port to avoid profile lock conflicts)
const cacheDir = path.join(os.homedir(), `.cache/scraping-${port}`);
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
console.log(`🚀 Starting ${browser.name} on port ${port}...`);
const chromeProcess = spawn(
	browser.executable,
	[`--remote-debugging-port=${port}`, `--user-data-dir=${cacheDir}`],
	{ detached: true, stdio: "ignore" },
);
chromeProcess.unref();
const chromePid = chromeProcess.pid;

// Wait for Chrome to be ready by attempting to connect
let connected = false;
for (let i = 0; i < 30; i++) {
	try {
		const browserInstance = await puppeteer.connect({
			browserURL: `http://localhost:${port}`,
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
	console.error(`✗ Failed to connect to Chrome on port ${port}`);
	process.exit(1);
}

// Register with jat-browser registry
try {
	// Detect agent context from tmux session name
	let agentName = "";
	let taskId = "";
	try {
		const tmuxSession = execSync("tmux display-message -p '#S' 2>/dev/null", { encoding: "utf-8" }).trim();
		if (tmuxSession.startsWith("jat-")) {
			agentName = tmuxSession.replace("jat-", "");
		}
	} catch {
		// Not in tmux or tmux not available
	}

	if (agentName) {
		// Try to get task ID from signal file
		try {
			const signalFile = `/tmp/jat-signal-tmux-jat-${agentName}.json`;
			if (fs.existsSync(signalFile)) {
				const signal = JSON.parse(fs.readFileSync(signalFile, "utf-8"));
				taskId = signal.taskId || "";
			}
		} catch {
			// Signal file not available
		}

		const claimArgs = [`claim`, `${port}`, `--agent`, agentName, `--pid`, `${chromePid || ""}`];
		if (taskId) claimArgs.push(`--task`, taskId);
		else claimArgs.push(`--task`, `unknown`);

		execSync(`jat-browser ${claimArgs.join(" ")} 2>/dev/null`, { stdio: "pipe" });
	}
} catch {
	// Registry claim failed - non-fatal, browser still works
}

console.log(`✓ ${browser.name} started on :${port}${useProfile ? " with your profile" : ""}`);

// Export the port for other tools to use
if (process.env.JAT_BROWSER_PORT === undefined) {
	console.log(`\nTip: Set JAT_BROWSER_PORT=${port} or use --port ${port} with other browser tools`);
}
