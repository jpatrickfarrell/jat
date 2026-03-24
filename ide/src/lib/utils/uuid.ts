/**
 * UUID generation with fallback for non-secure contexts (HTTP over LAN/VPS).
 * crypto.randomUUID() requires a secure context (HTTPS or localhost).
 */
export function randomUUID(): string {
	return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
}
