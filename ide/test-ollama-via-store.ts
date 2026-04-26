// Acceptance test: classify via voiceSubsystem so model is injected from
// providerOverrides instead of hardcoded in the provider. Delete after verifying.
import ollamaProvider from './src/lib/voice/providers/ollama';

// Direct provider call without model should now throw with a clear pointer.
try {
	await ollamaProvider.classify({
		system: 'x',
		transcript: 'y',
		context: '',
		schema: { type: 'object' }
	});
	console.log('FAIL: expected throw when model missing');
} catch (e) {
	console.log('PASS missing-model error:', (e as Error).message.slice(0, 120) + '…');
}

// Simulate the store's injection path with a fake providerOverrides
const overrides: Record<string, { model?: string }> = {
	ollama: { model: 'qwen2.5:latest' }
};

const result = await ollamaProvider.classify<{ ok: boolean }>({
	system: 'Reply with the JSON object {"ok": true} and nothing else.',
	transcript: 'voice subsystem self-test',
	context: '',
	schema: {
		type: 'object',
		properties: { ok: { type: 'boolean' } },
		required: ['ok']
	},
	model: overrides.ollama.model
});
console.log('PASS via override:', {
	parsed: result.parsed,
	schemaValid: result.schemaValid,
	latencyMs: result.providerLatencyMs
});
