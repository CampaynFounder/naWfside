# Modal app: LoRA training and inference

- **ACE-Step** primary (on Modal); **MusicGen** fallback.
- **Storage:** Modal Volume (`nawfside-music-volume`) for Loras, datasets, outputs.
- **Dataset:** Audio files + optional metadata (see `config.normalize_dataset`).

## Extensibility

- **Backends:** Add a new backend in `backends/` (implement `TrainBackend` + `InferBackend`), then register in `backends/__init__.py` and extend `BackendKind` in `config.py`.
- **Models:** Swap ACE-Step commit or MusicGen model id in `app.py` images; add new images for other models and route in backends.
- **Storage:** Add more volumes or switch to S3/R2 by changing volume mount and paths in `config.py` and `app.py`.

## Setup

1. Install Modal and log in:
   ```bash
   pip install -r requirements.txt
   modal setup
   ```
2. Create a secret for HF token and (optional) Gemini tagging:
   ```bash
   modal secret create nawfside-modal-secrets MODAL_API_KEY=xxx HF_TOKEN=xxx GEMINI_API_KEY=xxx
   ```

## Deploy

From repo root:

```bash
modal deploy modal_app/app.py
```

After deploy, copy the **Web endpoint** URLs from the Modal dashboard (App → nawfside-music → each function’s URL) and set in your Next.js env.

**URL format** (replace `<workspace>` with your Modal workspace name, e.g. `vannilli`):

- **Train:** `https://<workspace>--nawfside-music-train-web.modal.run`
- **Generate:** `https://<workspace>--nawfside-music-generate-web.modal.run`

Set in `.env` or Workers env:
- `MODAL_TRAIN_WEB_URL=https://<workspace>--nawfside-music-train-web.modal.run`
- `MODAL_GENERATE_WEB_URL=https://<workspace>--nawfside-music-generate-web.modal.run`
- `MODAL_STORE_UPLOAD_WEB_URL=https://<workspace>--nawfside-music-store-upload-web.modal.run`

**Optional API protection (until Supabase auth):** Set `NAWFSIDE_APP_PASSWORD` in your Next.js/Cloudflare env. The `/api/producer/upload-and-train` route accepts the same value in the `x-train-password` header (or in the form body). If the env var is set and the request doesn’t match, the API returns 401.

## Producer Twin pipeline (folder layout)

- **Upload** → raw file at `/data/uploads/<producer_id>/<job_id>/<filename>`.
- **Preprocessing** (default in `train_lora`): 15s segments, -1dB, 44.1kHz mono → `/data/training_data/<producer_id>/audio/` (e.g. `seg_0000.wav`).
- **Tagging** (optional, `tag_before_train: true`): Gemini 1.5 Flash tags each segment → `/data/training_data/<producer_id>/text/<stem>.txt`.
- **Training** reads from prepared segments (and future: tags). Writes LoRA to:
  - `/data/loras/<producer_id>_<model_name>.safetensors`
  - `/data/models/<producer_id>/adapter_model.safetensors` (spec compatibility).
- **Inference** resolves `lora_id` to either path above; skips placeholder files.

Request params: `skip_preprocess` (use raw paths), `tag_before_train` (run Gemini after preprocessing). See Train request below.

## Local CLI

```bash
# Train (pass local paths or use upload_urls in app)
modal run modal_app/app.py --task train --producer-id my_producer --paths /path/to/a.wav,/path/to/b.wav

# Generate
modal run modal_app/app.py --task generate --prompt "808 trap beat" --lora-id my_producer:nawfside_lora --duration 30
```

## API: URL values and request/response format

### Store upload (upload file to Modal volume)

**URL:** `MODAL_STORE_UPLOAD_WEB_URL` = `https://<workspace>--nawfside-music-store-upload-web.modal.run`

**Request:** `POST` with `Content-Type: application/json`

```json
{
  "producer_id": "producer_123",
  "job_id": "job_abc",
  "filename": "beat.wav",
  "content_base64": "UklGRi4AAABXQVZFZm10..."
}
```

**Response (success):** `{ "path": "/data/uploads/producer_123/job_abc/beat.wav", "producer_id": "...", "job_id": "..." }`

**Response (error):** `{ "error": "message" }`

Use the returned `path` in the Train endpoint with `upload_paths` (see below).

---

### Train (LoRA training)

**URL:** `MODAL_TRAIN_WEB_URL` = `https://<workspace>--nawfside-music-train-web.modal.run`

**Request:** `POST` with `Content-Type: application/json`

```json
{
  "producer_id": "producer_123",
  "upload_urls": ["https://example.com/beat1.wav", "https://example.com/beat2.wav"],
  "model_name": "nawfside_lora",
  "metadata_per_file": [{"title": "Track 1"}, {"title": "Track 2"}],
  "job_id": "optional-job-uuid",
  "backend_override": "ace_step"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `producer_id` or `producerId` | Yes | Producer identifier. |
| `upload_urls` or `uploadUrls` | Yes* | Array of URLs to audio files (WAV/MP3). |
| `upload_paths` or `uploadPaths` | Yes* | Array of paths on the Modal volume (e.g. from Store upload). Use either `upload_urls` or `upload_paths`. |
| `model_name` or `modelName` | No | Default `nawfside_lora`. |
| `metadata_per_file` or `metadataPerFile` | No | Array of objects, one per file (e.g. `title`, `bpm`, `tags`). |
| `job_id` or `jobId` | No | Optional job id. |
| `skip_preprocess` or `skipPreprocess` | No | If true, use raw paths (no 15s/-1dB/44.1kHz). Default false. |
| `tag_before_train` or `tagBeforeTrain` | No | If true, run Gemini tagging on prepared segments (needs GEMINI_API_KEY). |
| `backend_override` or `backendOverride` | No | `ace_step` or `musicgen`. |

**Response (success):**

```json
{
  "job_id": "abc-123",
  "producer_id": "producer_123",
  "model_name": "nawfside_lora",
  "backend": "ace_step",
  "lora_path": "/data/loras/producer_123_nawfside_lora.safetensors"
}
```

**Response (error):** `{ "error": "message" }`

---

### Generate (music generation)

**URL:** `MODAL_GENERATE_WEB_URL` = `https://<workspace>--nawfside-music-generate-web.modal.run`

**Request:** `POST` with `Content-Type: application/json`

```json
{
  "prompt": "808 trap beat, dark synth",
  "lora_id": "producer_123:nawfside_lora",
  "duration_seconds": 60,
  "backend_override": "ace_step"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `prompt` | Yes | Text description for generation. |
| `lora_id` | No | `producer_id:model_name` to use a trained LoRA; omit for base model only. |
| `duration_seconds` | No | Default `60`. |
| `backend_override` | No | `ace_step` or `musicgen`. |

**Response (success):**

```json
{
  "audio_base64": "UklGRi4AAABXQVZFZm10..."
}
```

Decode `audio_base64` as WAV bytes, or use as a data URL: `data:audio/wav;base64,<audio_base64>`.

**Response (error):** `{ "error": "message" }`

---

## Next.js

- **Store upload:** Next.js does not expose store-upload directly; use **Upload & train** to store and train in one step.
- **Upload & train:** `POST /api/producer/upload-and-train` with `FormData` (`file`, `producerId`, optional `x-train-password` header). Stores file via Modal store-upload, then calls Modal train with `upload_paths`. If `NAWFSIDE_APP_PASSWORD` is set, requests must send the same value in `x-train-password` header.
- **Train (URLs only):** `POST /api/producer/train` with `{ producerId, uploadUrls }` → calls Modal train URL above.
- **Generate:** `POST /api/artist/generate` with `{ artistId, loraId, prompt }` → calls Modal generate URL above; response includes `audio_base64` or `audioUrl` (data URL). Play or download the returned WAV in the browser.
