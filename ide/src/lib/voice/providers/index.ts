// Provider catalog. Concrete provider modules register themselves here as
// downstream tasks (jat-68j78.4 voxtype, .5 ollama, etc.) land. The store reads
// these arrays at init and merges them with the /api/voice/providers probe
// response to populate the runtime registries.
//
// Spec: ide/docs/prd-voice-subsystem.md §5.1, §5.2, §7.4

import type { TranscribeProvider, IntentProvider, SpeakProvider } from '../types';
import ollamaProvider from './ollama';

export const sttProviderCatalog: TranscribeProvider[] = [];
export const llmProviderCatalog: IntentProvider[] = [ollamaProvider];
export const speakProviderCatalog: SpeakProvider[] = [];
