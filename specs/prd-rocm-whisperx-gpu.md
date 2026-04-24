# PRD: ROCm GPU Acceleration for WhisperX Diarization Pipeline

## Product overview

### Document title and version

PRD: ROCm GPU Acceleration for WhisperX Diarization Pipeline
Version 1.0 — 2026-04-24

### Product summary

The JAT voice-to-task pipeline processes audio recordings through two stages: transcription (handled by voxtype, already Vulkan-accelerated and fast) and speaker diarization (handled by whisperx + pyannote, currently running on CPU and taking 15–30 minutes per 10-minute audio file). The diarization stage is the bottleneck that makes the pipeline impractical for regular use.

The system runs on a Beelink SER9 Pro with an AMD Ryzen AI 9 HX 370 and a Radeon 890M (gfx1150) integrated GPU with 64 GB of shared RAM. The GPU is already accelerating Ollama inference via a bundled ROCm runtime at `/usr/local/lib/ollama/rocm/`. PyTorch — which whisperx and pyannote depend on — requires system ROCm and cannot use Ollama's private bundled runtime or Vulkan.

ROCm 7.2 (released January 2026) added official gfx1150 support. The Arch Linux `extra` repository carries ROCm 7.2.1 packages, including `python-pytorch-rocm` at version 2.11.0. This PRD specifies the exact steps to install system ROCm, replace the CUDA-built PyTorch in the whisperx virtual environment with a ROCm-capable build, configure the required environment variables, and update the whisperx command in `voice-core.js` to target the GPU. The expected outcome is reducing diarization time from 20–30 minutes to approximately 2–3 minutes for a 10-minute recording.

## Goals

### Business goals

- Make the voice-to-task diarization pipeline usable on a daily basis by reducing processing time from 20–30 minutes to under 5 minutes per recording.
- Eliminate the CPU thermal/performance impact during diarization, which currently competes with other development workloads on the same machine.
- Keep voxtype (Vulkan transcription) and Ollama (bundled ROCm) untouched, preserving their working state.

### User goals

- Submit an audio recording to the JAT inbox and receive speaker-labeled task suggestions in under 5 minutes rather than waiting up to half an hour.
- Not need to think about the GPU configuration after initial setup: environment variables must be permanent, not session-scoped.
- Have a clear rollback path if something breaks, specifically the ability to revert to CPU mode in `voice-core.js` in under 60 seconds.

### Non-goals

- Accelerating the voxtype transcription stage (already fast via Vulkan).
- Accelerating Ollama inference (already GPU-accelerated via its own bundled runtime).
- Installing ROCm developer tools beyond what PyTorch requires (no ROCm SDK, no `rocm-llvm`, no `rocm-hip-sdk`).
- Supporting CUDA or any NVIDIA hardware path.
- Upgrading whisperx itself or any of its Python dependencies beyond the torch swap.
- Enabling multi-GPU setups.
- Containerizing the solution.

## User personas

### Key user types

There is one user for this system: the solo developer (jw) who owns and operates the JAT system on the Beelink SER9 Pro.

### Basic persona details

**jw — Solo developer and system owner**
- Fluent in Arch Linux system administration and Python packaging.
- Comfortable editing `pacman` commands, systemd unit files, and shell environment configuration.
- Maintains the JAT codebase and operates the machine daily for software development.
- Does not require a GUI wizard or installer; can follow a precise, ordered list of shell commands.
- Risk-averse about breaking Ollama or voxtype, both of which are in active daily use.

### Role-based access

There is no multi-user access model. All operations run as the `jw` user. Some installation steps require `sudo` for package installation and group membership changes (which require a logout to take effect).

## Functional requirements

### Priority 1 — system ROCm installation (must complete first)

**FR-001** Install the minimum set of ROCm 7.2.1 packages from the Arch `extra` repo required to run PyTorch ROCm. The required packages are:
- `rocm-hip-runtime` (pulls in `hsa-rocr`, `rocminfo`, `hip-runtime-amd`, and ROCm core)
- `rocm-language-runtime` (HSA runtime)
- `rocm-smi-lib` (system management interface, needed for PyTorch device detection)

The ROCm SDK, compiler toolchain (`rocm-llvm`), and development headers (`rocm-hip-sdk`) are explicitly out of scope.

**FR-002** Add the `jw` user to the `render` group. The `video` group membership already exists (`/dev/dri/renderD128` is currently `crw-rw-rw-` so render group may not be strictly required, but pyannote and some ROCm tools check for it). Run `sudo usermod -aG render jw`. A logout and back in is required for the group change to take effect in all processes.

**FR-003** Verify the KFD device is accessible after group changes by running `rocminfo` and confirming it lists the gfx1150 agent without permission errors.

### Priority 2 — PyTorch ROCm installation in the whisperx virtual environment

**FR-004** Uninstall the existing CUDA-built PyTorch from the whisperx venv. The current build is `torch 2.8.0+cu128`, confirmed via `~/.local/share/whisperx-env/bin/python3 -c "import torch; print(torch.__version__)"`. Remove it with:
```
~/.local/share/whisperx-env/bin/python3 -m pip uninstall torch torchvision torchaudio -y
```

**FR-005** Install AMD's official PyTorch ROCm wheel targeting gfx1150. AMD publishes pre-built wheels at `https://repo.amd.com/rocm/whl/gfx1150/`. The whisperx venv uses Python 3.11. Install with:
```
~/.local/share/whisperx-env/bin/python3 -m pip install \
  torch torchvision torchaudio \
  --index-url https://repo.amd.com/rocm/whl/gfx1150/
```

**FR-005a** Alternative path: if the AMD wheel index does not yield a Python 3.11 / ROCm 7.2 compatible wheel, install the Arch system package `python-pytorch-rocm` (version 2.11.0, 853 MB installed) and symlink or expose it inside the venv. This is the secondary option because system-package PyTorch locks the venv to the system Python version and complicates pip management. Attempt the AMD wheel first.

**FR-006** Verify PyTorch sees the ROCm device:
```
~/.local/share/whisperx-env/bin/python3 -c "
import torch
print('version:', torch.__version__)
print('hip version:', torch.version.hip)
print('cuda available (ROCm):', torch.cuda.is_available())
print('device count:', torch.cuda.device_count())
print('device name:', torch.cuda.get_device_name(0))
"
```
Expected output: `cuda available (ROCm): True`, device name containing "Radeon" or "gfx1150".

### Priority 3 — environment variable configuration

**FR-007** Configure the following environment variables permanently in `/etc/environment` (system-wide, survives reboots, visible to all login sessions including the SvelteKit process that spawns whisperx). These are required for gfx1150 stability:

```
HSA_OVERRIDE_GFX_VERSION=11.5.0
GPU_MAX_HW_QUEUES=4
HSA_ENABLE_SDMA=0
HIP_FORCE_DEV_KERNARG=1
ROCBLAS_USE_HIPBLASLT=1
```

`HSA_OVERRIDE_GFX_VERSION=11.5.0` corresponds to gfx1150 (major.minor.patch = 11.5.0). Some community reports suggest `11.0.0` works for broader library compatibility; if the primary value fails PyTorch device detection, `11.0.0` is the fallback. The AMD official Strix Halo documentation at `rocm.docs.amd.com/en/latest/how-to/system-optimization/strixhalo.html` is the authoritative reference for this chip family.

**FR-008** After editing `/etc/environment`, verify the variables are present in a new login shell before proceeding to any whisperx testing.

### Priority 4 — update `voice-core.js` to use the GPU

**FR-009** Update the `transcribeDiarized` function in `ide/src/lib/server/voice-core.js` (lines 134–143) to use `--device cuda --compute_type float16` instead of `--device cpu --compute_type int8`. The updated command array should be:

```javascript
const cmd = [
  `whisperx "${wavPath}"`,
  `--model large-v3-turbo`,
  `--diarize`,
  `--hf_token "${hfToken}"`,
  `--device cuda`,
  `--compute_type float16`,
  `--output_format json`,
  `--output_dir "${outputDir}"`
].join(' ');
```

**FR-010** If `float16` produces numerical instability errors on the first run, fall back to `--compute_type int8` with `--device cuda` as the intermediate option. CPU is the last resort. Document the chosen compute type as a comment in the source file.

**FR-011** The existing fallback in `transcribe()` that calls `transcribeFast` (voxtype) when whisperx fails must remain intact and unchanged. This ensures the pipeline never silently fails.

### Priority 5 — verification and rollback

**FR-012** Run a timed end-to-end test using a known audio file to confirm GPU acceleration and measure actual processing time. Use the voice diarization API endpoint or invoke whisperx directly.

**FR-013** Document the exact rollback procedure as a comment block at the top of the updated `transcribeDiarized` function, so it can be reverted without consulting this PRD.

## User experience

### Entry points

There is no UI change in this feature. The entry point for the user is unchanged: they upload an audio recording via the JAT voice inbox (`VoiceInbox.svelte`), which triggers the `/api/tasks/voice-diarize` route, which calls `transcribeDiarized` in `voice-core.js`. The improvement is invisible to the UI — the same spinner and progress events fire, but they resolve in 2–3 minutes instead of 20–30.

### Core experience

After this change is complete, the user submits a multi-speaker voice recording. The voice inbox shows a `processing` stub immediately (already implemented via `appendProcessingToVoiceTimeline`). Within 2–3 minutes, the `tasks` event fires with speaker-labeled output and extracted task cards appear in the inbox. The user does not need to configure anything to get GPU acceleration — the environment variables are system-wide and the whisperx command already points at the right device.

### Advanced features

The `/api/tasks/voice-diarize` route and the `voice-core.js` `transcribeDiarized` function already implement a CPU fallback: if whisperx fails for any reason, the outer `transcribe()` function catches the error, logs it via `vlog`, and falls back to `transcribeFast` (voxtype). This fallback is preserved unchanged. ROCm initialization failures will surface as whisperx stderr output, which is captured and included in the rejection message.

### UI/UX highlights

No UI changes are required. The `stage` field in the `processing` event could optionally be updated to `'diarizing (GPU)'` instead of the generic value, but this is cosmetic and out of scope for this feature.

## Narrative

The developer records a 10-minute voice memo during a walk, covering four topics across two speakers — billing, a client call, architecture decisions, and a deployment plan. They airdrop it to their phone, the iOS Shortcut fires it to the JAT voice API, and they go back inside to make coffee. By the time the kettle boils, roughly three minutes later, the JAT inbox already shows a speaker-labeled transcript broken into eight extracted tasks neatly sorted by project. Before this change, that same walk memo would have been sitting in a processing spinner for the next twenty minutes, blocking the machine from running smoothly and making the whole pipeline feel unreliable.

## Success metrics

### User-centric metrics

- Diarization wall-clock time for a 10-minute audio file drops below 5 minutes (target: 2–3 minutes).
- The developer no longer needs to manually invoke whisperx from the command line or wait overnight for results.
- Zero regressions to Ollama GPU acceleration or voxtype performance.

### Business metrics

- Voice-to-task pipeline usage increases because latency is no longer prohibitive.
- CPU load during diarization drops measurably (verifiable via `htop` or `rocm-smi` during a run), freeing the machine for concurrent development work.

### Technical metrics

- `torch.cuda.is_available()` returns `True` in the whisperx venv.
- `torch.cuda.get_device_name(0)` returns a string containing "Radeon" or "gfx1150".
- `rocminfo` lists exactly one GPU agent with `gfx_target_version = 110500` (matches KFD topology already confirmed on this machine).
- whisperx exits with code 0 on a test file when run with `--device cuda`.
- No errors appear in the voice log (`/tmp/jat-voice.log`) attributable to ROCm device initialization.

## Technical considerations

### Integration points

**whisperx venv**: Located at `~/.local/share/whisperx-env`. The venv uses Python 3.11.14 (confirmed). The `pip` binary inside the venv is at `~/.local/share/whisperx-env/bin/python3 -m pip` (there is no standalone `pip` symlink; use the module form). The `whisperx` entry point is a bash wrapper at `~/.local/bin/whisperx` that exec-delegates to `~/.local/share/whisperx-env/bin/whisperx`.

**voice-core.js**: The diarization command is assembled at lines 134–143 of `ide/src/lib/server/voice-core.js`. The SvelteKit server process spawns whisperx via Node's `child_process.exec`. Environment variables set in `/etc/environment` are inherited by the SvelteKit process when it is launched as a login shell or via a system service.

**KFD device**: The KFD device at `/dev/kfd` already exists and is accessible. The GPU device node `/dev/dri/renderD128` is currently world-readable (`crw-rw-rw-`). The `render` group is not strictly required given current permissions, but should be added anyway per AMD's documentation for future-proofing.

**Ollama isolation**: Ollama's ROCm runtime lives entirely under `/usr/local/lib/ollama/rocm/` and is not on the system library path. Installing system ROCm packages will not conflict with or replace Ollama's bundled runtime. Ollama should continue working without any changes.

**Existing torch build**: Current torch is `2.8.0+cu128` — a CUDA 12.8 build from PyPI. It must be fully uninstalled before the ROCm wheel is installed. Leaving both in the venv will cause package conflicts and the wrong libtorch will be loaded.

### Data storage and privacy

No change to data storage. The existing `/tmp/jat-whisperx-*` output directories used by `transcribeDiarized` are already cleaned up in the `finally` block. HuggingFace token is already retrieved via `jat-secret hf-token` and not stored in code or environment files.

### Scalability and performance

The Radeon 890M has 32 SIMD units (confirmed via KFD topology: `simd_count 32`), a max compute clock of 2900 MHz, and 1 SDMA engine. It uses unified memory architecture (UMA) with no dedicated VRAM; it shares the system's 64 GB RAM via GTT allocation. The `local_mem_size 0` in the KFD topology confirms this. PyTorch will allocate GPU memory from the GTT pool. With 64 GB total RAM, there is no meaningful risk of OOM during diarization of typical voice memos (1–30 minutes).

HSA_ENABLE_SDMA=0 is required on this chip family because the single SDMA engine can cause hangs under concurrent load. This is a known issue documented by the community for Strix Halo.

### Potential challenges

**gfx1150 library compatibility**: While ROCm 7.2 officially supports gfx1150, some higher-level libraries (rocBLAS, MIOpen) may have limited optimized kernels for this GPU target. PyTorch may fall back to generic kernels, which would still be faster than CPU but slower than on a datacenter GPU. `ROCBLAS_USE_HIPBLASLT=1` enables hipBLASLt as an alternative BLAS backend with better gfx1150 support.

**HSA_OVERRIDE_GFX_VERSION**: Even with official support, some ROCm libraries perform runtime gfx version checks and may still require this override. The value `11.5.0` directly maps to gfx1150 (11=major, 5=minor, 0=stepping). If `11.5.0` causes any library to reject the device, try `11.0.0`, which spoofs gfx1100 (RX 7000 series) and has broader pre-compiled kernel coverage.

**AMD wheel availability for Python 3.11**: AMD's wheel index at `repo.amd.com/rocm/whl/gfx1150/` is relatively new. If it lacks a Python 3.11 cp311 wheel, the fallback is the Arch package `python-pytorch-rocm` (2.11.0, 853 MB). This package installs into the system Python path, not the venv. Making the system package visible inside the venv requires either symlinking or rebuilding the venv with `--system-site-packages`. See the user stories section for step-by-step handling of this scenario.

**pytorch version mismatch with pyannote/faster-whisper**: The whisperx venv currently has `pytorch_lightning 2.6.1` and `pytorch_metric_learning 2.9.0` installed (confirmed via venv inspection). These are torch-version-sensitive. After swapping torch, verify these packages still load without import errors. If they break, pip-install compatible versions.

**GTT memory limits**: On some systems the GPU GTT allocation is capped below the physical RAM. If large model loads fail with OOM, check `/sys/class/drm/renderD128/device/mem_info_gtt_total` and configure GTT size via the `amdgpu.vram_limit` kernel parameter or `amd-debug-tools` if needed. This is a contingency step, not expected to be necessary.

**SvelteKit process environment**: The IDE dev server is started via `cd ide && npm run dev` from a terminal, which inherits the current shell's environment. `/etc/environment` variables are loaded by PAM on login, so they are available in any login shell. If the IDE is started from a terminal opened after the logout/login cycle, all variables will be present. If started from a non-login context (e.g., a pre-existing tmux session from before the reboot), source `/etc/environment` manually or restart the session.

## Milestones and sequencing

### Project estimate

Total estimated time: 2–4 hours hands-on work, plus one logout/login cycle.

### Team size

Solo developer (jw).

### Suggested phases

**Phase 1 — system prerequisites (30–45 minutes)**
Install ROCm runtime packages from Arch repos. Add `jw` to the `render` group. Logout and back in. Verify `rocminfo` shows the gfx1150 agent. Set environment variables in `/etc/environment`. Verify variables in a new shell.

**Phase 2 — PyTorch swap (30–60 minutes)**
Uninstall the CUDA torch from the whisperx venv. Attempt to install the AMD gfx1150 ROCm wheel. If that fails, fall back to the Arch system package approach. Verify `torch.cuda.is_available()` is `True` in the venv. Check that pyannote and faster-whisper still import cleanly.

**Phase 3 — voice-core.js update and smoke test (15–30 minutes)**
Update the `transcribeDiarized` command in `voice-core.js`. Run whisperx manually from the command line against a short test audio file with `--device cuda` to confirm GPU execution before touching the production code path. Restart the IDE dev server so it picks up the updated source file.

**Phase 4 — end-to-end verification (15–30 minutes)**
Submit a real voice memo through the JAT voice inbox. Observe `rocm-smi` or `radeontop` during processing to confirm GPU utilization. Measure wall-clock time. Log the before/after timing in a comment in `voice-core.js`.

**Phase 5 — rollback documentation (15 minutes)**
Write the rollback comment block. Commit the changes.

## User stories

---

### US-001: install ROCm runtime packages

**Title:** Install minimum ROCm 7.2.1 runtime packages from Arch repos

**Description:** As the system owner, I need to install the ROCm runtime packages that PyTorch requires, using only Arch's official `extra` repository, so that the GPU is accessible from Python without installing the full ROCm SDK.

**Acceptance criteria:**
- Running `sudo pacman -S rocm-hip-runtime rocm-language-runtime rocm-smi-lib` completes without errors.
- After installation, the command `rocminfo` exists at `/usr/bin/rocminfo` or on PATH.
- Running `rocminfo` as the `jw` user lists at least one agent with `Name: gfx1150` or `gfx_target_version: 110500`.
- The Ollama service is still running (`systemctl status ollama` shows `active (running)`) and the existing GPU layers are still loaded.
- No voxtype or Ollama regressions are observable.

---

### US-002: add user to render group

**Title:** Add jw to the render group for KFD/GPU device access

**Description:** As the system owner, I need my user account to be in the `render` group so that ROCm tools and PyTorch can open `/dev/kfd` and `/dev/dri/renderD128` without permission errors.

**Acceptance criteria:**
- Running `sudo usermod -aG render jw` completes without errors.
- After logout and back in, running `groups` or `id` shows `render` in the group list.
- Running `rocminfo` after the group change does not produce any "permission denied" or "failed to open kfd" errors.

---

### US-003: set permanent ROCm environment variables

**Title:** Configure ROCm stability environment variables permanently in /etc/environment

**Description:** As the system owner, I need the five required ROCm environment variables to be set permanently so that they are available to every process on the system — including the SvelteKit server — without requiring manual export in each session.

**Acceptance criteria:**
- The file `/etc/environment` contains these five lines (they may already have other content; these are appended or merged):
  ```
  HSA_OVERRIDE_GFX_VERSION=11.5.0
  GPU_MAX_HW_QUEUES=4
  HSA_ENABLE_SDMA=0
  HIP_FORCE_DEV_KERNARG=1
  ROCBLAS_USE_HIPBLASLT=1
  ```
- After opening a new login shell (or after logout/login), running `printenv HSA_OVERRIDE_GFX_VERSION` outputs `11.5.0`.
- Running `printenv GPU_MAX_HW_QUEUES` outputs `4`.
- The IDE dev server, when started from a new terminal session, inherits these variables (verifiable by checking `process.env.HSA_OVERRIDE_GFX_VERSION` in a quick Node.js snippet).

---

### US-004: verify rocminfo shows the GPU agent

**Title:** Confirm rocminfo detects the Radeon 890M as a usable HSA agent

**Description:** As the system owner, I need to confirm that the ROCm runtime correctly enumerates the gfx1150 GPU before attempting the PyTorch install, so I can catch HSA permission or driver issues early.

**Acceptance criteria:**
- `rocminfo` output contains an agent block with `Name: gfx1150` or `gfx_target_version: 110500`.
- The agent block shows `simd_count: 32`.
- No error lines containing "permission denied", "failed to open", or "no devices found" appear in the output.
- `rocminfo` exits with code 0.

---

### US-005: uninstall the CUDA-built PyTorch from the whisperx venv

**Title:** Remove torch 2.8.0+cu128 from the whisperx virtual environment

**Description:** As the system owner, I need to remove the existing CUDA-built PyTorch from the whisperx venv so that the ROCm wheel can be installed cleanly without package conflicts.

**Acceptance criteria:**
- Running `~/.local/share/whisperx-env/bin/python3 -m pip uninstall torch torchvision torchaudio -y` completes without errors (packages may not all be present; that is acceptable).
- After uninstall, running `~/.local/share/whisperx-env/bin/python3 -c "import torch"` raises `ModuleNotFoundError`.
- The whisperx venv Python binary (`python3.11`) and all non-torch packages (`whisperx`, `pyannote.audio`, `faster_whisper`, `pytorch_lightning`, `pytorch_metric_learning`) remain importable.

---

### US-006: install ROCm-capable PyTorch via AMD official wheel

**Title:** Install torch with ROCm support from AMD's gfx1150 wheel index

**Description:** As the system owner, I want to install PyTorch from AMD's official `repo.amd.com/rocm/whl/gfx1150/` index so that the whisperx venv gets a GPU-capable torch build that is matched exactly to the gfx1150 target.

**Acceptance criteria:**
- Running the following command completes successfully:
  ```bash
  ~/.local/share/whisperx-env/bin/python3 -m pip install \
    torch torchvision torchaudio \
    --index-url https://repo.amd.com/rocm/whl/gfx1150/
  ```
- `torch.__version__` does not contain `+cu` (confirming it is not a CUDA build).
- `torch.version.hip` is not `None`.
- `torch.cuda.is_available()` returns `True`.
- `torch.cuda.get_device_name(0)` returns a non-empty string (e.g., `"Radeon Graphics"` or similar).
- If the wheel index does not have a compatible cp311 wheel, proceed to US-007 (system package fallback).

---

### US-007: fallback — use Arch system python-pytorch-rocm package

**Title:** Install ROCm PyTorch via Arch package and expose it to the whisperx venv

**Description:** As the system owner, if the AMD wheel index does not provide a Python 3.11-compatible wheel, I need to install the `python-pytorch-rocm` Arch package and make it visible to the whisperx venv so that the pipeline gets GPU acceleration.

**Acceptance criteria:**
- This story is only executed if US-006 fails (no compatible wheel found on AMD's index).
- `sudo pacman -S python-pytorch-rocm` completes without errors.
- The package is installed at a path discoverable via `python -c "import torch; print(torch.__file__)"` using the system Python.
- The whisperx venv is recreated with `--system-site-packages` enabled, or the torch site-packages path is appended to the venv's `sys.path` via a `.pth` file, such that `~/.local/share/whisperx-env/bin/python3 -c "import torch; print(torch.__version__)"` successfully imports the system ROCm torch.
- All pre-existing whisperx venv packages (`whisperx`, `pyannote.audio`, `faster_whisper`) still import cleanly after the venv modification.
- `torch.cuda.is_available()` returns `True` in the modified venv.

---

### US-008: verify pyannote and faster-whisper still work after torch swap

**Title:** Confirm whisperx pipeline dependencies are compatible with the new ROCm torch

**Description:** As the system owner, I need to verify that the PyTorch-sensitive packages in the whisperx venv — pyannote.audio, faster-whisper, pytorch-lightning, and pytorch-metric-learning — still import and function correctly after the torch swap, so I do not discover incompatibilities during a real voice processing job.

**Acceptance criteria:**
- The following one-liner completes without import errors:
  ```bash
  ~/.local/share/whisperx-env/bin/python3 -c "
  import torch
  import whisperx
  import pyannote.audio
  import faster_whisper
  import pytorch_lightning
  import pytorch_metric_learning
  print('all imports ok')
  "
  ```
- No `RuntimeError` or `ImportError` is raised.
- If a version incompatibility error appears for `pytorch_lightning` or `pytorch_metric_learning`, install compatible versions via pip and re-run until all imports succeed.

---

### US-009: run a GPU smoke test with a short audio file

**Title:** Verify whisperx executes on the GPU with a test audio file

**Description:** As the system owner, I need to run whisperx directly from the command line against a short test audio file using `--device cuda` to confirm GPU execution works end to end, before modifying the production code path in voice-core.js.

**Acceptance criteria:**
- A test WAV file is available (e.g., any 30-second 16kHz mono WAV, or a recording from `/tmp/jat-voice/`).
- The following command completes without error:
  ```bash
  HSA_OVERRIDE_GFX_VERSION=11.5.0 \
  GPU_MAX_HW_QUEUES=4 \
  HSA_ENABLE_SDMA=0 \
  HIP_FORCE_DEV_KERNARG=1 \
  ROCBLAS_USE_HIPBLASLT=1 \
  whisperx /path/to/test.wav \
    --model large-v3-turbo \
    --diarize \
    --hf_token "$(jat-secret hf-token)" \
    --device cuda \
    --compute_type float16 \
    --output_format json \
    --output_dir /tmp/whisperx-test/
  ```
- During execution, GPU utilization is visible in `radeontop` or `rocm-smi` in a separate terminal.
- The output JSON file exists in `/tmp/whisperx-test/` and contains at least one segment with a `speaker` field.
- Processing time for a 30-second clip is under 60 seconds (validates GPU is being used, not CPU).
- If `float16` produces a `RuntimeError: nan values in output`, re-run with `--compute_type int8` and confirm that also succeeds.

---

### US-010: update voice-core.js to use GPU device

**Title:** Change the whisperx command in voice-core.js from --device cpu to --device cuda

**Description:** As the system owner, I need to update the `transcribeDiarized` function in `ide/src/lib/server/voice-core.js` so that it passes `--device cuda --compute_type float16` to whisperx instead of `--device cpu --compute_type int8`.

**Acceptance criteria:**
- Lines 134–143 of `ide/src/lib/server/voice-core.js` are updated so the command array contains `--device cuda` and `--compute_type float16`.
- The old `--device cpu` and `--compute_type int8` flags no longer appear in the command array.
- A comment immediately above the command array documents the rollback procedure:
  ```javascript
  // GPU (ROCm): --device cuda --compute_type float16
  // CPU fallback: --device cpu --compute_type int8
  // Rollback: change device to 'cpu' and compute_type to 'int8'
  ```
- The existing `catch` clause in `transcribe()` that falls back to `transcribeFast` is unchanged.
- `vlog` calls inside `transcribeDiarized` still fire correctly and appear in `/tmp/jat-voice.log`.

---

### US-011: restart the IDE dev server and verify environment variable inheritance

**Title:** Confirm the SvelteKit server process inherits the ROCm environment variables

**Description:** As the system owner, I need to confirm that when the JAT IDE dev server is started from a terminal opened after the logout/login cycle, it inherits the five ROCm environment variables from `/etc/environment`, so that the whisperx subprocess spawned by `child_process.exec` also has them.

**Acceptance criteria:**
- The IDE dev server is stopped and restarted from a new terminal session opened after the logout/login cycle.
- A quick diagnostic endpoint or Node.js `console.log(process.env.HSA_OVERRIDE_GFX_VERSION)` confirms the value is `11.5.0` in the server process.
- If the IDE is started via a systemd user service or a pre-existing tmux session, the `/etc/environment` values are either inherited or the service unit file is updated to include `Environment=HSA_OVERRIDE_GFX_VERSION=11.5.0` and the other four variables.

---

### US-012: end-to-end voice diarization test via the JAT inbox

**Title:** Submit a real voice memo through the JAT inbox and verify GPU-accelerated processing

**Description:** As the system owner, I need to run a complete end-to-end test using the actual JAT voice API to confirm that GPU acceleration is working in production through the full stack, not just from the command line.

**Acceptance criteria:**
- A multi-speaker audio recording of at least 2 minutes is submitted to the voice inbox via the iOS Shortcut or the `/api/tasks/voice` endpoint.
- The voice inbox shows a `processing` stub within a few seconds of submission (this was already working before this feature).
- `rocm-smi` or `radeontop` shows non-zero GPU utilization during the diarization phase.
- The `processing` stub resolves to a `tasks` event with speaker-labeled transcript lines in the format `[SPEAKER_00]: text`.
- Total wall-clock time from submission to task appearance is under 5 minutes for a 2-minute recording.
- The voice log at `/tmp/jat-voice.log` shows `running whisperx (diarize)` and `whisperx produced N speaker-grouped lines` entries with no ROCm error lines.

---

### US-013: confirm Ollama is unaffected

**Title:** Verify Ollama GPU acceleration is not broken by system ROCm installation

**Description:** As the system owner, I need to verify that installing system ROCm packages has not disrupted Ollama's bundled ROCm runtime, which lives at `/usr/local/lib/ollama/rocm/` and is intentionally isolated from the system library path.

**Acceptance criteria:**
- `systemctl status ollama` shows `active (running)`.
- Sending a test prompt to Ollama via `ollama run gemma4:e2b "hello"` or equivalent completes successfully.
- The Ollama logs (via `journalctl -u ollama -n 50`) show GPU layers are still being loaded (look for lines referencing GPU layers or `35/36 layers on GPU`).
- No new error lines appear in Ollama logs related to library conflicts or ROCm initialization.

---

### US-014: document rollback procedure

**Title:** Write and test the rollback procedure for reverting to CPU mode

**Description:** As the system owner, I need a documented rollback procedure that can revert the whisperx pipeline to CPU mode in under 60 seconds, without uninstalling ROCm, in case GPU execution causes unexpected issues.

**Acceptance criteria:**
- The rollback is documented as a comment block in `voice-core.js` directly above the whisperx command array (see US-010).
- The rollback requires changing exactly two string values: `'cuda'` to `'cpu'` and `'float16'` to `'int8'` in the command array — and restarting the IDE dev server.
- No uninstallation of ROCm packages or environment variable removal is needed for the rollback.
- If a deeper rollback is needed (e.g., the ROCm torch breaks pyannote on startup), the procedure to reinstall the CUDA torch is documented:
  ```bash
  ~/.local/share/whisperx-env/bin/python3 -m pip install \
    torch==2.8.0 torchvision torchaudio \
    --index-url https://download.pytorch.org/whl/cu128
  ```
- The full rollback procedure is tested by temporarily switching back to CPU in `voice-core.js`, running a short voice file, confirming CPU processing works, then re-enabling GPU mode.

---

### US-015: handle HSA_OVERRIDE_GFX_VERSION fallback if 11.5.0 fails

**Title:** Fall back to HSA_OVERRIDE_GFX_VERSION=11.0.0 if gfx1150 libraries reject the 11.5.0 value

**Description:** As the system owner, if `HSA_OVERRIDE_GFX_VERSION=11.5.0` causes a library to reject the GPU (e.g., rocBLAS or MIOpen returning "unsupported target" errors), I need to switch to `11.0.0` which spoofs gfx1100 and has broader kernel coverage.

**Acceptance criteria:**
- This story is only executed if US-009 (smoke test) fails with errors mentioning unsupported gfx version or missing kernels.
- The value in `/etc/environment` is changed from `HSA_OVERRIDE_GFX_VERSION=11.5.0` to `HSA_OVERRIDE_GFX_VERSION=11.0.0`.
- The smoke test from US-009 is re-run with the new value exported in the current shell.
- If the smoke test passes with `11.0.0`, the `/etc/environment` file is updated to the working value.
- `rocminfo` still shows the device (the override value only affects library kernel selection, not device enumeration).

---

### US-016: handle GTT memory limits if model load fails with OOM

**Title:** Diagnose and resolve GPU out-of-memory errors during model loading

**Description:** As the system owner, if whisperx fails with an out-of-memory error during model loading (expected to be rare given 64 GB unified RAM), I need to check the GTT memory limit and adjust it if needed.

**Acceptance criteria:**
- This story is only executed if US-009 or US-012 fails with an OOM or memory allocation error.
- Running `cat /sys/class/drm/renderD128/device/mem_info_gtt_total` reveals the current GTT limit.
- If the GTT limit is below 8 GB, investigate whether a kernel boot parameter such as `amdgpu.gttsize=8192` (value in MiB) can raise it.
- After any GTT adjustment (requires reboot to apply kernel parameters), re-run the smoke test from US-009.
- The test passes without OOM errors.

---

### US-017: commit the changes with an appropriate message

**Title:** Commit all changes (voice-core.js update) to the JAT repository

**Description:** As the system owner, I need to commit the updated `voice-core.js` to the JAT git repository with a descriptive commit message that explains what changed and why, following the project's commit convention.

**Acceptance criteria:**
- Only `ide/src/lib/server/voice-core.js` is staged (no `/etc/environment` or system files, which are not in the repo).
- The commit message follows the project convention: `feat(jat): GPU-accelerate whisperx diarization via ROCm on gfx1150`.
- The commit message body includes the before/after timing numbers measured in US-012.
- `git log --oneline -1` shows the new commit on the `master` branch.
- The working tree is clean after the commit.
