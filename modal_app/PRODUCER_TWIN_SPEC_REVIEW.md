# Producer Twin Spec Review (2026 Master Prompt vs Current Codebase)

This doc compares the "Producer Twin" master prompt / spec to what we have today. **No conflicts** that block the direction; there are **naming/path and capability gaps** we can close incrementally while keeping the 1-track smoke test working.

---

## 1. Alignment (What Already Matches)

| Spec | Current | Notes |
|------|---------|--------|
| ACE-Step as primary | ✅ `BackendKind.ACE_STEP`, `ace_step_image` | Same direction. |
| LoRA per producer | ✅ `loras/{producer_id}_{model_name}.safetensors` | Partitioned by `producer_id`; spec uses `models/[producer_id]/adapter_model.safetensors` — **path shape differs**, not a conflict. |
| Multiple producers | ✅ All paths keyed by `producer_id` | Same idea. |
| Safetensors for weights | ✅ `.safetensors` in paths and backend contract | Same. |
| Modal Volume for persistence | ✅ `nawfside-music-volume` | Spec names it `producer-dataset` — **name only**. |
| FastAPI endpoint for inference | ✅ `generate_web` | Same. |
| [INST] / instrumental | ✅ ACE-Step inference uses `lyrics="[inst]"` | Already “instrumental mode” in inference. |
| HF / external secrets | ✅ `nawfside-modal-secrets` (HF_TOKEN, etc.) | Same pattern; add `GEMINI_API_KEY` when we add tagging. |

So: **architecture and intent align**. We can evolve paths and add pipeline steps without throwing away the current flow.

---

## 2. Gaps and Differences (Not Blocking)

### 2.1 Data ingestion

| Spec | Current | Change |
|------|---------|--------|
| **pydub**: 15s segments, -1dB, 44.1kHz mono | We store **raw** uploads under `/data/uploads/<producer_id>/<job_id>/<filename>` (no slicing/normalization). | Add a **preprocessing** step (pydub or ffmpeg): slice 15s, normalize -1dB, 44.1kHz mono, then write into the paths training expects. |
| Store in `producer-dataset` | We use **one** volume `nawfside-music-volume` and dirs like `uploads/`, `datasets/`, `loras/`. | Either keep one volume and add a `training_data/` tree, or add a second volume `producer-dataset` and mount it. Easiest: **same volume**, new layout (see folder structure below). |

No conflict: we can keep “upload one file → store” for the smoke test, and add a **separate** preprocessing function that turns uploads into 15s/-1dB/44.1kHz mono for “full” Producer Twin.

### 2.2 Producer-centric tagging (Gemini)

| Spec | Current | Change |
|------|---------|--------|
| Gemini 1.5 Flash: BPM, Key, Drum Kit, Synth, Sub-genre; save `.txt` next to audio | No tagging; we have optional `metadata_per_file` (e.g. title, bpm, tags) but no auto-tagging. | Add a **tagging** step (Gemini 1.5 Flash), output `.txt` (or structured JSON) alongside each segment. Trainer then reads these as conditioning. |
| System prompt | N/A | Implement when we add the tagging service. |

No conflict: tagging is an **additional** step before or alongside training. Smoke test can stay “1 track, no tags.”

### 2.3 Training engine (SimpleTuner / ACE-Step 3.5B)

| Spec | Current | Change |
|------|---------|--------|
| **GPU**: A100 (40GB) | We use **L40S**. | Spec says 3.5B needs A100/H100 to avoid OOM. For smoke test, L40S may be enough with 1 short track; for full 10-beat ~45 min runs, switch to `gpu="A100"` (or H100) in `train_lora`. |
| **LoRA**: r=32, alpha=32, target_modules=’all-linear’ | ACE-Step training is **placeholder** (writes a placeholder file). | When ACE-Step (or our wrapper) exposes training: configure LoRA as in spec and pass flow-matching shift etc. |
| **Hyperparams**: LR 1e-4, 50 epochs, flow-matching shift=3.0 | Not used (no real training yet). | Wire into the real trainer when we integrate SimpleTuner / ACE-Step training API. |
| **[INST] in training** | We use `[inst]` only at **inference** (lyrics). | Ensure training data / metadata also uses [INST] (or null lyric) so the LoRA is instrumental-only. |

No conflict: we keep the current **interface** (dataset in, LoRA path out); we just replace the placeholder with real training and the right GPU/hyperparams.

### 2.4 Inference

| Spec | Current | Change |
|------|---------|--------|
| Load `.safetensors` from Volume, attach to ACE-Step base | We **resolve** `lora_path` from `lora_id` and pass it to the backend, but **ACE-Step inference does not load the adapter yet** (no merge/load in `ace_step.py`). | Implement LoRA load/merge in `ACEStepInferBackend.generate()` when ACE-Step supports it (or when we have real .safetensors). |
| 30s “Twin Beat” | We default **60s**; duration is a parameter. | Add a 30s default for “Twin Beat” or make duration configurable (e.g. 30/60). Trivial. |

No conflict: current API and path layout support “load adapter from volume and generate”; we only need to implement the actual load inside the backend.

### 2.5 Folder structure on the volume

| Spec | Current | Recommendation |
|------|---------|----------------|
| `/training_data/[producer_id]/audio/` | `/data/uploads/...` and `/data/datasets/<producer_id>/<job_id>/` | Add `training_data/<producer_id>/audio/` (and optionally `text/`) for **preprocessed + tagged** data. Keep `uploads/` (or similar) for raw uploads. |
| `/training_data/[producer_id]/text/` | No dedicated text dir. | Add when we add Gemini tagging; e.g. `training_data/<producer_id>/text/<segment_id>.txt`. |
| `/models/[producer_id]/adapter_model.safetensors` | `/data/loras/<producer_id>_<model_name>.safetensors` | **Compatible**: we can add a **view** like `models/<producer_id>/adapter_model.safetensors` that points at or copies from `loras/<producer_id>_nawfside_lora.safetensors` so the spec’s “load from models/” works. Or we keep our naming and have the trainer write there. |

Suggestion: **evolve** to the spec layout when we add preprocessing + tagging, without breaking existing callers:

- Keep `loras/{producer_id}_{model_name}.safetensors` for API and backward compatibility.
- Introduce `training_data/<producer_id>/audio/` and `.../text/` for the full pipeline.
- Optionally add `models/<producer_id>/adapter_model.safetensors` as the canonical path the trainer writes and inference reads (and we can still keep the `loras/` path as a symlink or duplicate for compatibility).

---

## 3. Infrastructure checklist (Spec vs current)

| Item | Spec | Current | Action |
|------|------|---------|--------|
| GPU | A100 or H100 for 3.5B training | L40S | Use L40S for smoke test; switch `train_lora` to `gpu="A100"` (or H100) when running full 10-beat training. |
| Secrets | GEMINI_API_KEY, HF_TOKEN | HF_TOKEN (and others) in `nawfside-modal-secrets` | Add `GEMINI_API_KEY` to the same (or a new) Modal secret when we add tagging. |
| Volumes | `producer-dataset` | `nawfside-music-volume` | Keep one volume; use a subfolder layout that matches the spec (`training_data/`, `models/`) so the spec’s wording can be satisfied without a second volume. |

---

## 4. Smoke test vs full Producer Twin

- **Smoke test (now):** 1 producer, 1 track, upload → store → “train” (placeholder) → generate.  
  - No preprocessing, no Gemini, no real LoRA training, no LoRA load at inference.  
  - Validates: producer_id flow, volume paths, train + generate endpoints, Next.js → Modal.

- **Full Producer Twin (next):**  
  - Ingest: pydub 15s, -1dB, 44.1kHz mono → `training_data/<producer_id>/audio/`.  
  - Tagging: Gemini → `training_data/<producer_id>/text/`.  
  - Training: A100, ACE-Step 3.5B, LoRA r=32, alpha=32, 50 epochs, flow shift 3.0, [INST] → write `models/<producer_id>/adapter_model.safetensors` (and/or keep `loras/`).  
  - Inference: load that adapter, attach to ACE-Step, generate 30s (or 60s) “Twin Beat.”

We can do the smoke test with the **current** code; then add preprocessing, tagging, real training, and LoRA load in small steps without breaking the existing pipeline.

---

## 5. Summary: conflicts?

- **No architectural conflicts.**  
- **Naming:** volume name (`producer-dataset` vs `nawfside-music-volume`) and folder layout (`training_data/`, `models/` vs `uploads/`, `datasets/`, `loras/`) differ; we can align by adding the spec’s paths and optionally a second volume later.  
- **Missing pieces:** preprocessing (pydub), Gemini tagging, real ACE-Step LoRA training (SimpleTuner / repo API), LoRA load in ACE-Step inference, and GPU/secrets for full runs. All are additive.

Recommendation: keep the current flow for the 1-track smoke test; then implement the spec in this order: (1) preprocessing + folder layout, (2) Gemini tagging, (3) real training (A100 + LoRA config + [INST]), (4) LoRA load in inference, (5) optional 30s default for “Twin Beat.”
