// Voice subsystem provider interfaces. Spec: ide/docs/prd-voice-subsystem.md §5.1.

export interface TranscribeResult {
	transcript: string;
	durationMs: number;
	language?: string;
	segments?: Array<{
		start: number;
		end: number;
		speaker?: string;
		text: string;
	}>;
	providerLatencyMs: number;
}

export interface TranscribeProvider {
	id: 'voxtype' | 'whisperx' | 'openai' | 'elevenlabs';
	name: string;
	isLocal: boolean;
	capabilities: {
		diarize: boolean;
		maxDurationSec: number;
		supportedLanguages?: string[];
	};
	isAvailable(): Promise<{ ok: boolean; reason?: string }>;
	transcribe(
		audio: Blob,
		opts?: {
			language?: string;
			diarize?: boolean;
			prompt?: string;
		}
	): Promise<TranscribeResult>;
}

export interface IntentResult<T = unknown> {
	parsed: T | null;
	confidence: number;
	raw: string;
	providerLatencyMs: number;
	schemaValid: boolean;
}

export interface VoiceTool {
	name: string;
	description: string;
	input_schema: {
		type: 'object';
		properties: Record<string, unknown>;
		required?: string[];
	};
}

export interface ToolCall {
	name: string;
	input: Record<string, unknown>;
}

export interface DispatchResult {
	toolCalls: ToolCall[];
	providerLatencyMs: number;
}

export interface IntentProvider {
	id: 'ollama' | 'openai' | 'anthropic';
	name: string;
	isLocal: boolean;
	isAvailable(): Promise<{ ok: boolean; reason?: string }>;
	classify<T>(input: {
		system: string;
		transcript: string;
		context: string;
		schema: object;
		model?: string;
	}): Promise<IntentResult<T>>;
	dispatch(
		transcript: string,
		tools: VoiceTool[],
		systemPrompt: string,
		model?: string
	): Promise<DispatchResult>;
}

export interface SpeakProvider {
	id: 'elevenlabs' | 'openai';
	name: string;
	isLocal: boolean;
	isAvailable(): Promise<{ ok: boolean; reason?: string }>;
	speak(
		text: string,
		opts?: {
			voice?: string;
			speed?: number;
		}
	): Promise<Blob>;
}
