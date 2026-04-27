// Minimal JSON Schema validator shared by intent providers.
// Spec: ide/docs/prd-voice-subsystem.md §5.2 (IntentResult.schemaValid).
//
// Handles `type`, `properties`, `required`, `items`, `enum` — sufficient for
// the constrained intent payloads the voice subsystem uses (object payloads
// with primitive fields, optional arrays). Promoted out of providers/ollama.ts
// once openai/anthropic providers landed (jat-68j78.14, .15) so the schemaValid
// contract is enforced consistently across providers.

export function validate(value: unknown, schema: unknown): boolean {
	if (!schema || typeof schema !== 'object') return true;
	const s = schema as Record<string, unknown>;

	if (Array.isArray(s.enum)) {
		if (!s.enum.includes(value as never)) return false;
	}

	const t = s.type as string | string[] | undefined;
	if (t) {
		const types = Array.isArray(t) ? t : [t];
		if (!types.some((tt) => matchesType(value, tt))) return false;
	}

	if (s.type === 'object' && value && typeof value === 'object' && !Array.isArray(value)) {
		const obj = value as Record<string, unknown>;
		const required = Array.isArray(s.required) ? (s.required as string[]) : [];
		for (const key of required) {
			if (!(key in obj)) return false;
		}
		const props = (s.properties || {}) as Record<string, unknown>;
		for (const [key, sub] of Object.entries(props)) {
			if (key in obj && !validate(obj[key], sub)) return false;
		}
	}

	if (s.type === 'array' && Array.isArray(value) && s.items) {
		for (const item of value) {
			if (!validate(item, s.items)) return false;
		}
	}

	return true;
}

function matchesType(value: unknown, t: string): boolean {
	switch (t) {
		case 'string':
			return typeof value === 'string';
		case 'number':
			return typeof value === 'number' && !Number.isNaN(value);
		case 'integer':
			return typeof value === 'number' && Number.isInteger(value);
		case 'boolean':
			return typeof value === 'boolean';
		case 'null':
			return value === null;
		case 'array':
			return Array.isArray(value);
		case 'object':
			return value !== null && typeof value === 'object' && !Array.isArray(value);
		default:
			return true;
	}
}
