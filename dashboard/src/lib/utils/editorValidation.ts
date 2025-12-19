/**
 * Editor Validation Utilities
 *
 * Provides validation for:
 * - YAML frontmatter in command files (between --- markers)
 * - JSON configuration (hooks config)
 *
 * Returns Monaco-compatible marker objects for inline error display.
 */

import * as yaml from 'js-yaml';

/**
 * Monaco marker severity levels
 */
export enum MarkerSeverity {
	Error = 8,
	Warning = 4,
	Info = 2,
	Hint = 1
}

/**
 * Monaco-compatible marker interface
 */
export interface EditorMarker {
	severity: MarkerSeverity;
	message: string;
	startLineNumber: number;
	startColumn: number;
	endLineNumber: number;
	endColumn: number;
	source?: string;
}

/**
 * Validation result with markers and summary
 */
export interface ValidationResult {
	isValid: boolean;
	hasErrors: boolean;      // Critical errors that should block save
	hasWarnings: boolean;    // Non-critical issues
	markers: EditorMarker[];
	errorCount: number;
	warningCount: number;
}

/**
 * Extract YAML frontmatter from markdown content
 * Returns null if no frontmatter found
 */
export function extractFrontmatter(content: string): {
	yaml: string;
	startLine: number;
	endLine: number;
} | null {
	const lines = content.split('\n');

	// Check if content starts with ---
	if (lines.length === 0 || lines[0].trim() !== '---') {
		return null;
	}

	// Find closing ---
	let endIndex = -1;
	for (let i = 1; i < lines.length; i++) {
		if (lines[i].trim() === '---') {
			endIndex = i;
			break;
		}
	}

	if (endIndex === -1) {
		return null; // Unclosed frontmatter
	}

	const yamlContent = lines.slice(1, endIndex).join('\n');

	return {
		yaml: yamlContent,
		startLine: 1,  // 0-indexed: line after first ---
		endLine: endIndex  // 0-indexed: line with closing ---
	};
}

/**
 * Validate YAML frontmatter in a command file
 */
export function validateYamlFrontmatter(content: string): ValidationResult {
	const markers: EditorMarker[] = [];
	const lines = content.split('\n');

	// Check if file has frontmatter
	if (lines.length === 0 || lines[0].trim() !== '---') {
		markers.push({
			severity: MarkerSeverity.Warning,
			message: 'Missing YAML frontmatter. Commands should start with --- frontmatter block.',
			startLineNumber: 1,
			startColumn: 1,
			endLineNumber: 1,
			endColumn: lines[0]?.length || 1,
			source: 'yaml'
		});

		return {
			isValid: true,
			hasErrors: false,
			hasWarnings: true,
			markers,
			errorCount: 0,
			warningCount: 1
		};
	}

	// Find closing ---
	let closingLine = -1;
	for (let i = 1; i < lines.length; i++) {
		if (lines[i].trim() === '---') {
			closingLine = i;
			break;
		}
	}

	// Check for unclosed frontmatter
	if (closingLine === -1) {
		markers.push({
			severity: MarkerSeverity.Error,
			message: 'Unclosed frontmatter block. Add closing --- marker.',
			startLineNumber: 1,
			startColumn: 1,
			endLineNumber: 1,
			endColumn: 4,
			source: 'yaml'
		});

		return {
			isValid: false,
			hasErrors: true,
			hasWarnings: false,
			markers,
			errorCount: 1,
			warningCount: 0
		};
	}

	// Extract and validate YAML content
	const yamlContent = lines.slice(1, closingLine).join('\n');

	if (yamlContent.trim().length === 0) {
		markers.push({
			severity: MarkerSeverity.Warning,
			message: 'Empty frontmatter block. Consider adding description, author, version, or tags.',
			startLineNumber: 1,
			startColumn: 1,
			endLineNumber: closingLine + 1,
			endColumn: 4,
			source: 'yaml'
		});

		return {
			isValid: true,
			hasErrors: false,
			hasWarnings: true,
			markers,
			errorCount: 0,
			warningCount: 1
		};
	}

	// Try to parse YAML
	try {
		const parsed = yaml.load(yamlContent) as Record<string, unknown> | null;

		// Validate expected frontmatter fields
		if (parsed && typeof parsed === 'object') {
			// Check for recommended fields
			const recommendedFields = ['description'];
			for (const field of recommendedFields) {
				if (!(field in parsed)) {
					markers.push({
						severity: MarkerSeverity.Info,
						message: `Consider adding '${field}' field for better documentation.`,
						startLineNumber: 2,
						startColumn: 1,
						endLineNumber: 2,
						endColumn: 1,
						source: 'yaml'
					});
				}
			}

			// Check for invalid field types
			if ('tags' in parsed && parsed.tags !== undefined) {
				const tags = parsed.tags;
				if (typeof tags !== 'string' && !Array.isArray(tags)) {
					const tagLine = findFieldLine(lines, 'tags', 1, closingLine);
					markers.push({
						severity: MarkerSeverity.Warning,
						message: 'Tags should be a string or array of strings.',
						startLineNumber: tagLine,
						startColumn: 1,
						endLineNumber: tagLine,
						endColumn: lines[tagLine - 1]?.length || 1,
						source: 'yaml'
					});
				}
			}

			// Check for version format
			if ('version' in parsed && parsed.version !== undefined) {
				const version = String(parsed.version);
				if (!/^\d+\.\d+(\.\d+)?(-[\w.]+)?$/.test(version)) {
					const versionLine = findFieldLine(lines, 'version', 1, closingLine);
					markers.push({
						severity: MarkerSeverity.Info,
						message: 'Version should follow semver format (e.g., 1.0.0).',
						startLineNumber: versionLine,
						startColumn: 1,
						endLineNumber: versionLine,
						endColumn: lines[versionLine - 1]?.length || 1,
						source: 'yaml'
					});
				}
			}
		}

	} catch (e) {
		if (e instanceof yaml.YAMLException) {
			// Get line number from yaml error
			const mark = e.mark;
			let errorLine = mark?.line ? mark.line + 2 : 2; // +2 because mark is 0-indexed and we skip first ---

			// Ensure error line is within frontmatter bounds
			if (errorLine < 2) errorLine = 2;
			if (errorLine > closingLine) errorLine = closingLine;

			const errorColumn = mark?.column ? mark.column + 1 : 1;

			markers.push({
				severity: MarkerSeverity.Error,
				message: `YAML syntax error: ${e.reason || e.message}`,
				startLineNumber: errorLine,
				startColumn: errorColumn,
				endLineNumber: errorLine,
				endColumn: lines[errorLine - 1]?.length || 100,
				source: 'yaml'
			});

			return {
				isValid: false,
				hasErrors: true,
				hasWarnings: false,
				markers,
				errorCount: 1,
				warningCount: 0
			};
		}
	}

	const errorCount = markers.filter(m => m.severity === MarkerSeverity.Error).length;
	const warningCount = markers.filter(m => m.severity === MarkerSeverity.Warning || m.severity === MarkerSeverity.Info).length;

	return {
		isValid: errorCount === 0,
		hasErrors: errorCount > 0,
		hasWarnings: warningCount > 0,
		markers,
		errorCount,
		warningCount
	};
}

/**
 * Validate JSON content (for hooks config, etc.)
 */
export function validateJson(content: string): ValidationResult {
	const markers: EditorMarker[] = [];
	const lines = content.split('\n');

	if (content.trim().length === 0) {
		markers.push({
			severity: MarkerSeverity.Warning,
			message: 'Empty JSON content.',
			startLineNumber: 1,
			startColumn: 1,
			endLineNumber: 1,
			endColumn: 1,
			source: 'json'
		});

		return {
			isValid: true,
			hasErrors: false,
			hasWarnings: true,
			markers,
			errorCount: 0,
			warningCount: 1
		};
	}

	try {
		JSON.parse(content);

		return {
			isValid: true,
			hasErrors: false,
			hasWarnings: false,
			markers: [],
			errorCount: 0,
			warningCount: 0
		};

	} catch (e) {
		if (e instanceof SyntaxError) {
			// Try to extract line/column from error message
			const { line, column } = parseJsonErrorPosition(e.message, content);

			markers.push({
				severity: MarkerSeverity.Error,
				message: `JSON syntax error: ${e.message}`,
				startLineNumber: line,
				startColumn: column,
				endLineNumber: line,
				endColumn: lines[line - 1]?.length || 100,
				source: 'json'
			});
		} else {
			markers.push({
				severity: MarkerSeverity.Error,
				message: `JSON parse error: ${e instanceof Error ? e.message : String(e)}`,
				startLineNumber: 1,
				startColumn: 1,
				endLineNumber: 1,
				endColumn: lines[0]?.length || 100,
				source: 'json'
			});
		}

		return {
			isValid: false,
			hasErrors: true,
			hasWarnings: false,
			markers,
			errorCount: 1,
			warningCount: 0
		};
	}
}

/**
 * Validate hooks configuration structure
 */
export function validateHooksConfig(config: unknown): ValidationResult {
	const markers: EditorMarker[] = [];

	if (!config || typeof config !== 'object') {
		markers.push({
			severity: MarkerSeverity.Error,
			message: 'Hooks config must be an object.',
			startLineNumber: 1,
			startColumn: 1,
			endLineNumber: 1,
			endColumn: 1,
			source: 'hooks'
		});

		return {
			isValid: false,
			hasErrors: true,
			hasWarnings: false,
			markers,
			errorCount: 1,
			warningCount: 0
		};
	}

	const validEventTypes = ['PreToolUse', 'PostToolUse', 'UserPromptSubmit', 'PreCompact', 'SessionStart'];
	const hookConfig = config as Record<string, unknown>;

	for (const [eventType, entries] of Object.entries(hookConfig)) {
		// Check for valid event type
		if (!validEventTypes.includes(eventType)) {
			markers.push({
				severity: MarkerSeverity.Warning,
				message: `Unknown hook event type: '${eventType}'. Valid types: ${validEventTypes.join(', ')}`,
				startLineNumber: 1,
				startColumn: 1,
				endLineNumber: 1,
				endColumn: 1,
				source: 'hooks'
			});
		}

		// Validate entries array
		if (!Array.isArray(entries)) {
			markers.push({
				severity: MarkerSeverity.Error,
				message: `Hook entries for '${eventType}' must be an array.`,
				startLineNumber: 1,
				startColumn: 1,
				endLineNumber: 1,
				endColumn: 1,
				source: 'hooks'
			});
			continue;
		}

		// Validate each entry
		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i] as Record<string, unknown>;

			if (!entry || typeof entry !== 'object') {
				markers.push({
					severity: MarkerSeverity.Error,
					message: `${eventType}[${i}] must be an object with matcher and hooks properties.`,
					startLineNumber: 1,
					startColumn: 1,
					endLineNumber: 1,
					endColumn: 1,
					source: 'hooks'
				});
				continue;
			}

			// Check required matcher field
			if (!('matcher' in entry) || typeof entry.matcher !== 'string') {
				markers.push({
					severity: MarkerSeverity.Error,
					message: `${eventType}[${i}] is missing required 'matcher' field (regex string).`,
					startLineNumber: 1,
					startColumn: 1,
					endLineNumber: 1,
					endColumn: 1,
					source: 'hooks'
				});
			} else {
				// Validate regex pattern
				try {
					new RegExp(entry.matcher);
				} catch (e) {
					markers.push({
						severity: MarkerSeverity.Error,
						message: `${eventType}[${i}].matcher is not a valid regex: ${e instanceof Error ? e.message : String(e)}`,
						startLineNumber: 1,
						startColumn: 1,
						endLineNumber: 1,
						endColumn: 1,
						source: 'hooks'
					});
				}
			}

			// Check required hooks array
			if (!('hooks' in entry) || !Array.isArray(entry.hooks)) {
				markers.push({
					severity: MarkerSeverity.Error,
					message: `${eventType}[${i}] is missing required 'hooks' array.`,
					startLineNumber: 1,
					startColumn: 1,
					endLineNumber: 1,
					endColumn: 1,
					source: 'hooks'
				});
				continue;
			}

			// Validate each hook command
			for (let j = 0; j < entry.hooks.length; j++) {
				const hook = entry.hooks[j] as Record<string, unknown>;

				if (!hook || typeof hook !== 'object') {
					markers.push({
						severity: MarkerSeverity.Error,
						message: `${eventType}[${i}].hooks[${j}] must be an object.`,
						startLineNumber: 1,
						startColumn: 1,
						endLineNumber: 1,
						endColumn: 1,
						source: 'hooks'
					});
					continue;
				}

				// Check required type field
				if (!('type' in hook) || hook.type !== 'command') {
					markers.push({
						severity: MarkerSeverity.Error,
						message: `${eventType}[${i}].hooks[${j}].type must be 'command'.`,
						startLineNumber: 1,
						startColumn: 1,
						endLineNumber: 1,
						endColumn: 1,
						source: 'hooks'
					});
				}

				// Check required command field
				if (!('command' in hook) || typeof hook.command !== 'string' || hook.command.trim() === '') {
					markers.push({
						severity: MarkerSeverity.Error,
						message: `${eventType}[${i}].hooks[${j}].command is required and must be a non-empty string.`,
						startLineNumber: 1,
						startColumn: 1,
						endLineNumber: 1,
						endColumn: 1,
						source: 'hooks'
					});
				}
			}
		}
	}

	const errorCount = markers.filter(m => m.severity === MarkerSeverity.Error).length;
	const warningCount = markers.filter(m => m.severity === MarkerSeverity.Warning || m.severity === MarkerSeverity.Info).length;

	return {
		isValid: errorCount === 0,
		hasErrors: errorCount > 0,
		hasWarnings: warningCount > 0,
		markers,
		errorCount,
		warningCount
	};
}

/**
 * Apply validation markers to Monaco editor
 */
export function setEditorMarkers(
	monaco: typeof import('monaco-editor'),
	model: import('monaco-editor').editor.ITextModel,
	markers: EditorMarker[],
	owner: string = 'validation'
): void {
	const monacoMarkers = markers.map(marker => ({
		severity: marker.severity,
		message: marker.message,
		startLineNumber: marker.startLineNumber,
		startColumn: marker.startColumn,
		endLineNumber: marker.endLineNumber,
		endColumn: marker.endColumn,
		source: marker.source
	}));

	monaco.editor.setModelMarkers(model, owner, monacoMarkers);
}

/**
 * Clear validation markers from Monaco editor
 */
export function clearEditorMarkers(
	monaco: typeof import('monaco-editor'),
	model: import('monaco-editor').editor.ITextModel,
	owner: string = 'validation'
): void {
	monaco.editor.setModelMarkers(model, owner, []);
}

// Helper: Find line number where a field appears in YAML
function findFieldLine(lines: string[], fieldName: string, startLine: number, endLine: number): number {
	const pattern = new RegExp(`^${fieldName}\\s*:`);
	for (let i = startLine; i < endLine; i++) {
		if (pattern.test(lines[i])) {
			return i + 1; // Convert to 1-indexed
		}
	}
	return startLine + 1;
}

// Helper: Parse JSON error position from error message
function parseJsonErrorPosition(message: string, content: string): { line: number; column: number } {
	// Try to extract position from error message
	// Common format: "at position N" or "at line L column C"
	const posMatch = message.match(/at position (\d+)/i);
	if (posMatch) {
		const position = parseInt(posMatch[1], 10);
		return positionToLineColumn(content, position);
	}

	const lineColMatch = message.match(/line (\d+) column (\d+)/i);
	if (lineColMatch) {
		return {
			line: parseInt(lineColMatch[1], 10),
			column: parseInt(lineColMatch[2], 10)
		};
	}

	// Default to first line
	return { line: 1, column: 1 };
}

// Helper: Convert character position to line/column
function positionToLineColumn(content: string, position: number): { line: number; column: number } {
	const lines = content.split('\n');
	let currentPos = 0;

	for (let i = 0; i < lines.length; i++) {
		const lineLength = lines[i].length + 1; // +1 for newline
		if (currentPos + lineLength > position) {
			return {
				line: i + 1,
				column: position - currentPos + 1
			};
		}
		currentPos += lineLength;
	}

	return { line: lines.length, column: 1 };
}
