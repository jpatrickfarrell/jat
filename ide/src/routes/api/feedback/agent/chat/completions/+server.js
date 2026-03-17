/**
 * Agent LLM Proxy — OpenAI-compatible chat completions
 *
 * Proxies requests from the jat-feedback widget's page-agent to Anthropic's API.
 * Keeps API keys server-side (never exposed to client).
 *
 * POST /api/feedback/agent/chat/completions
 */
import { json } from '@sveltejs/kit';
import { getApiKeyWithFallback } from '$lib/utils/credentials.js';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	'Access-Control-Max-Age': '86400'
};

/** @type {import('./$types').RequestHandler} */
export async function OPTIONS() {
	return new Response(null, { status: 204, headers: CORS_HEADERS });
}

/** POST - Proxy chat completions to Anthropic */
export async function POST({ request }) {
	const apiKey = getApiKeyWithFallback('anthropic', 'ANTHROPIC_API_KEY');
	if (!apiKey) {
		return json(
			{ error: 'No Anthropic API key configured. Add one in Settings → API Keys.' },
			{ status: 401, headers: CORS_HEADERS }
		);
	}

	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400, headers: CORS_HEADERS });
	}

	// Map model names — page-agent may send claude model names directly
	const model = body.model || 'claude-sonnet-4-6';

	// Forward to Anthropic's Messages API, converting from OpenAI format
	try {
		const response = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': apiKey,
				'anthropic-version': '2023-06-01',
			},
			body: JSON.stringify(convertToAnthropicFormat(body, model)),
		});

		if (!response.ok) {
			const errorText = await response.text();
			return new Response(errorText, {
				status: response.status,
				headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
			});
		}

		const anthropicResponse = await response.json();
		const openaiResponse = convertToOpenAIFormat(anthropicResponse, model);

		return json(openaiResponse, { headers: CORS_HEADERS });
	} catch (err) {
		return json(
			{ error: `Proxy error: ${err.message}` },
			{ status: 502, headers: CORS_HEADERS }
		);
	}
}

/**
 * Convert OpenAI chat completions request to Anthropic Messages API format
 */
function convertToAnthropicFormat(openaiBody, model) {
	const messages = openaiBody.messages || [];
	let system = '';
	const anthropicMessages = [];

	for (const msg of messages) {
		if (msg.role === 'system') {
			system += (system ? '\n\n' : '') + (typeof msg.content === 'string' ? msg.content : msg.content.map(c => c.text || '').join(''));
		} else {
			anthropicMessages.push({
				role: msg.role === 'assistant' ? 'assistant' : 'user',
				content: msg.content,
			});
		}
	}

	// Ensure messages alternate user/assistant (Anthropic requirement)
	// If first message is assistant, prepend a user message
	if (anthropicMessages.length > 0 && anthropicMessages[0].role === 'assistant') {
		anthropicMessages.unshift({ role: 'user', content: 'Continue.' });
	}

	const result = {
		model,
		max_tokens: openaiBody.max_tokens || 4096,
		messages: anthropicMessages,
	};

	if (system) {
		result.system = system;
	}

	// Forward tools if present
	if (openaiBody.tools?.length > 0) {
		result.tools = openaiBody.tools.map(t => ({
			name: t.function?.name || t.name,
			description: t.function?.description || t.description || '',
			input_schema: t.function?.parameters || t.input_schema || { type: 'object', properties: {} },
		}));
	}

	// Forward tool_choice if present
	if (openaiBody.tool_choice) {
		if (openaiBody.tool_choice === 'auto') {
			result.tool_choice = { type: 'auto' };
		} else if (openaiBody.tool_choice === 'none') {
			// Don't set tool_choice
		} else if (typeof openaiBody.tool_choice === 'object' && openaiBody.tool_choice.function?.name) {
			result.tool_choice = { type: 'tool', name: openaiBody.tool_choice.function.name };
		}
	}

	return result;
}

/**
 * Convert Anthropic Messages API response to OpenAI chat completions format
 */
function convertToOpenAIFormat(anthropicResponse, model) {
	const content = anthropicResponse.content || [];
	const textParts = content.filter(c => c.type === 'text').map(c => c.text);
	const toolUses = content.filter(c => c.type === 'tool_use');

	const message = {
		role: 'assistant',
		content: textParts.join('') || null,
	};

	if (toolUses.length > 0) {
		message.tool_calls = toolUses.map(tu => ({
			id: tu.id,
			type: 'function',
			function: {
				name: tu.name,
				arguments: JSON.stringify(tu.input),
			},
		}));
	}

	return {
		id: anthropicResponse.id || `chatcmpl-${Date.now()}`,
		object: 'chat.completion',
		created: Math.floor(Date.now() / 1000),
		model,
		choices: [{
			index: 0,
			message,
			finish_reason: anthropicResponse.stop_reason === 'tool_use' ? 'tool_calls'
				: anthropicResponse.stop_reason === 'end_turn' ? 'stop'
				: anthropicResponse.stop_reason || 'stop',
		}],
		usage: {
			prompt_tokens: anthropicResponse.usage?.input_tokens || 0,
			completion_tokens: anthropicResponse.usage?.output_tokens || 0,
			total_tokens: (anthropicResponse.usage?.input_tokens || 0) + (anthropicResponse.usage?.output_tokens || 0),
		},
	};
}
