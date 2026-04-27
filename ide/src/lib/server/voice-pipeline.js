// Voice pipeline — thin re-export layer for voice-inbox ingest routes.
// Routes import from here instead of voice-core.js directly, completing the
// voice subsystem refactor (jat-68j78.24). voice-core.js now delegates its
// AI calls to the subsystem providers; this module surfaces everything routes
// need without a direct voice-core import.
export {
	TEMP_DIR,
	VOICE_LOG_FILE,
	VOICE_TIMELINE_FILE,
	vlog,
	getVoiceTimelineFile,
	sendVoiceNotification,
	loadProjects,
	loadJatContext,
	transcribe,
	organizeTranscript,
	writeVoiceMemoryFiles,
	appendToVoiceTimeline,
	appendProcessingToVoiceTimeline,
	appendFailedToVoiceTimeline,
	appendTranscriptToVoiceTimeline,
	generateTitleFromTranscript
} from './voice-core.js';
