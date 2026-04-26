#!/usr/bin/env python3
"""
whisperx GPU diarization wrapper for voice-core.js.

Replaces `whisperx --device cuda` CLI: ctranslate2 4.7.1 has no HIP/ROCm
backend, so the CLI fails on AMD GPUs. We split devices instead — CPU for
the ctranslate2 transcription step, ROCm/cuda for alignment + pyannote
diarization (which is the actual bottleneck this work targets). See
.jat/memory/2026-04-25-jat-c71qe.3-whisperx-gpu-smoke-test.md for the
import-order story.

Usage:
  whisperx-diarize.py <audio.wav> <output_dir>

Environment:
  HF_TOKEN — Hugging Face token (required for pyannote/speaker-diarization-community-1)

Output:
  Writes <output_dir>/<stem>.json with the same shape whisperx CLI would
  produce: { "segments": [ { "start", "end", "text", "speaker", ... }, ... ] }
"""

# `import ctranslate2` MUST precede `import torch`. ROCm torch initialises
# its HSA stack first and ctranslate2's bundled libgomp allocator collides
# with it (free(): invalid pointer / heap corruption). Don't reorder.
import ctranslate2  # noqa: F401

import json
import os
import sys
import time

import torch
import whisperx
from whisperx.diarize import DiarizationPipeline, assign_word_speakers

MODEL = "large-v3-turbo"
BATCH_SIZE = 16


def log(msg):
    print(msg, file=sys.stderr, flush=True)


def main():
    if len(sys.argv) < 3:
        log("usage: whisperx-diarize.py <audio.wav> <output_dir>")
        return 2

    audio_path = sys.argv[1]
    output_dir = sys.argv[2]
    hf_token = os.environ.get("HF_TOKEN", "").strip()

    if not hf_token:
        log("ERROR: HF_TOKEN env var not set")
        return 2

    if not torch.cuda.is_available():
        log("ERROR: torch.cuda.is_available()=False — ROCm/GPU not accessible")
        return 3

    os.makedirs(output_dir, exist_ok=True)
    stem = os.path.splitext(os.path.basename(audio_path))[0]
    out_path = os.path.join(output_dir, f"{stem}.json")

    t0 = time.time()
    audio = whisperx.load_audio(audio_path)
    duration_s = len(audio) / 16000.0
    log(f"loaded {duration_s:.1f}s audio in {time.time()-t0:.1f}s")

    t1 = time.time()
    model = whisperx.load_model(MODEL, "cpu", compute_type="int8")
    result = model.transcribe(audio, batch_size=BATCH_SIZE)
    log(f"transcribe (cpu): {time.time()-t1:.1f}s, {len(result['segments'])} segments")

    t2 = time.time()
    align_model, metadata = whisperx.load_align_model(language_code=result["language"], device="cuda")
    result = whisperx.align(result["segments"], align_model, metadata, audio, "cuda")
    log(f"align (gpu): {time.time()-t2:.1f}s")

    t3 = time.time()
    diarize_pipeline = DiarizationPipeline(token=hf_token, device="cuda")
    diarize_segments = diarize_pipeline(audio_path)
    result = assign_word_speakers(diarize_segments, result)
    log(f"diarize (gpu): {time.time()-t3:.1f}s")

    with open(out_path, "w") as f:
        json.dump(result, f)

    speakers = sorted({s.get("speaker") for s in result["segments"] if s.get("speaker")})
    log(f"done: {time.time()-t0:.1f}s total, {len(result['segments'])} segments, {len(speakers)} speakers, wrote {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
