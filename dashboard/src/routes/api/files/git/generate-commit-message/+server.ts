/**
 * Generate Commit Message API Endpoint
 *
 * POST /api/files/git/generate-commit-message
 * Generates a commit message based on staged changes using Claude.
 *
 * Request body:
 * - project: Project name (required)
 *
 * Response:
 * - message: Generated commit message
 * - reasoning: Brief explanation of the suggested message
 *
 * Task: jat-2d600 - Add a 'generate commit message' button in /files
 */
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getGitForProject, formatGitError } from '$lib/server/git.js';
import { env } from '$env/dynamic/private';

// Get API key from environment
function getApiKey(): string | undefined {
	return env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
}

/**
 * Build the prompt for Claude to generate a commit message
 */
function buildPrompt(diff: string, stagedFiles: string[]): string {
	// Truncate diff if too long (keep first 8000 chars to stay within token limits)
	const truncatedDiff = diff.length > 8000 ? diff.substring(0, 8000) + '\n\n[... diff truncated ...]' : diff;

	return `You are a git commit message generator. Analyze the following staged changes and generate a clear, concise commit message.

STAGED FILES:
${stagedFiles.join('\n')}

DIFF:
${truncatedDiff}

Generate a commit message following these conventions:
1. First line: imperative mood summary (50 chars max), e.g., "Add user authentication", "Fix login redirect bug"
2. Leave a blank line after the subject
3. Body (optional): explain WHAT changed and WHY (not HOW - the diff shows that)
4. Use conventional commit prefixes when appropriate: feat:, fix:, docs:, style:, refactor:, test:, chore:

Guidelines:
- Be specific but concise
- Focus on the user-visible impact when possible
- If multiple unrelated changes, suggest they should be separate commits

Respond with ONLY a JSON object in this format:
{
  "message": "<commit message>",
  "reasoning": "<brief explanation of why this message was chosen>"
}`;
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { project } = body;

		if (!project) {
			throw error(400, 'Project name is required');
		}

		// Get API key
		const apiKey = getApiKey();
		if (!apiKey) {
			throw error(500, 'ANTHROPIC_API_KEY not configured. Add it to dashboard/.env');
		}

		// Get git instance for project
		const result = await getGitForProject(project);
		if ('error' in result) {
			throw error(result.status, result.error);
		}

		const { git } = result;

		// Get staged files list
		const status = await git.status();
		const stagedFiles = status.staged || [];

		if (stagedFiles.length === 0) {
			throw error(400, 'No staged changes to generate a commit message for');
		}

		// Get the diff for staged changes
		const diff = await git.diff(['--cached']);

		if (!diff.trim()) {
			throw error(400, 'No diff content available for staged changes');
		}

		// Build prompt
		const prompt = buildPrompt(diff, stagedFiles);

		// Call Claude API (using Haiku for speed and cost efficiency)
		const response = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': apiKey,
				'anthropic-version': '2023-06-01'
			},
			body: JSON.stringify({
				model: 'claude-3-5-haiku-20241022',
				max_tokens: 500,
				messages: [
					{
						role: 'user',
						content: prompt
					}
				]
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('Claude API error:', response.status, errorText);
			throw error(502, `Claude API error: ${response.status}`);
		}

		const apiResult = await response.json();

		// Extract the text response
		const textContent = apiResult.content?.find((c: { type?: string; text?: string }) => c.type === 'text');
		if (!textContent?.text) {
			throw error(500, 'No response from Claude');
		}

		// Parse the JSON response
		let suggestion;
		try {
			// Try to extract JSON from the response (handle potential markdown code blocks)
			let jsonText = textContent.text.trim();
			if (jsonText.startsWith('```')) {
				jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
			}
			suggestion = JSON.parse(jsonText);
		} catch (parseErr) {
			console.error('Failed to parse Claude response:', textContent.text);
			// Fall back to using the raw text as the message
			return json({
				success: true,
				message: textContent.text.trim(),
				reasoning: 'Could not parse structured response, using raw output'
			});
		}

		return json({
			success: true,
			message: suggestion.message || '',
			reasoning: suggestion.reasoning || '',
			usage: apiResult.usage
		});
	} catch (err) {
		// Re-throw SvelteKit errors
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		const gitError = formatGitError(err as Error);
		throw error(gitError.status, gitError.error);
	}
};
