import { record } from 'rrweb';
import type { eventWithTime } from '@rrweb/types';
import { clearCapturedRequests } from './networkCapture';

let stopFn: (() => void) | null = null;
let events: eventWithTime[] = [];
let recordingStartTime: number | null = null;

export function startRecording(): void {
  if (stopFn) return;

  events = [];
  recordingStartTime = Date.now();
  // Clear network requests so only events during recording are captured.
  // Network capture itself is managed by JatFeedback lifecycle — don't start/stop it here.
  clearCapturedRequests();

  stopFn = record({
    emit(event) {
      events.push(event);
    },
    recordCrossOriginIframes: false,
  }) || null;
}

export function stopRecording(): unknown[] {
  if (!stopFn) return [];

  stopFn();
  stopFn = null;

  const captured = [...events];
  events = [];
  return captured;
}

export function isRecording(): boolean {
  return stopFn !== null;
}

export function getRecordingStartTime(): number | null {
  return recordingStartTime;
}

export function getEvents(): unknown[] {
  return [...events];
}
