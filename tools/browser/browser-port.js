/**
 * Shared port resolution for browser tools.
 *
 * Priority: --port flag > JAT_BROWSER_PORT env var > 9222
 *
 * Usage in other tools:
 *   import { resolvePort } from "./browser-port.js";
 *   const port = resolvePort();
 */

export function resolvePort() {
	const args = process.argv;

	// Check --port=VALUE
	const eqArg = args.find((a) => a.startsWith("--port="));
	if (eqArg) return eqArg.split("=")[1];

	// Check --port VALUE
	const idx = args.indexOf("--port");
	if (idx !== -1 && args[idx + 1]) return args[idx + 1];

	// Check env var
	if (process.env.JAT_BROWSER_PORT) return process.env.JAT_BROWSER_PORT;

	// Default
	return "9222";
}

export function browserURL() {
	return `http://localhost:${resolvePort()}`;
}
