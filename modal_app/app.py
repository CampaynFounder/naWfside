"""
Modal app: LoRA training and inference.
ACE-Step primary, MusicGen fallback; extensible via backends/.
Storage: Modal Volume for Loras, datasets, and outputs.
"""
from pathlib import Path
from typing import Optional
from uuid import uuid4

import modal

from config import (
    VOLUME_LORAS_DIR,
    VOLUME_DATASETS_DIR,
    VOLUME_OUTPUTS_DIR,
    BackendKind,
    get_backend_from_env,
    lora_volume_path,
    models_adapter_path,
    normalize_dataset,
    training_data_audio_dir,
    training_data_text_dir,
)
from backends import get_train_backend, get_infer_backend

# ---------------------------------------------------------------------------
# App and Volume
# ---------------------------------------------------------------------------

APP_NAME = "nawfside-music"

app = modal.App(APP_NAME)

# Single volume for Loras, dataset cache, and inference outputs (extensible: add more volumes if needed)
music_volume = modal.Volume.from_name("nawfside-music-volume", create_if_missing=True)
VOLUME_MOUNT = "/data"

# ---------------------------------------------------------------------------
# Images
# ---------------------------------------------------------------------------

# ACE-Step: match Modal's generate_music example (git+ACE-Step, torch, ffmpeg)
# Model downloads on first use; ace-step-model-cache volume persists it.
ACE_STEP_COMMIT = "6ae0852b1388de6dc0cca26b31a86d711f723cb3"
cache_dir = "/root/.cache/ace-step/checkpoints"
model_cache_volume = modal.Volume.from_name("ace-step-model-cache", create_if_missing=True)

ace_step_image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("git", "ffmpeg")
    .env({"HF_HUB_CACHE": cache_dir, "HF_HUB_ENABLE_HF_TRANSFER": "1"})
    .pip_install(
        "fastapi",
        "torch==2.8.0",
        "torchaudio==2.8.0",
        f"git+https://github.com/ace-step/ACE-Step.git@{ACE_STEP_COMMIT}",
    )
)

# Lighter image for training-only or MusicGen fallback (no ACE-Step).
# pydub for preprocessing: 15s segments, -1dB, 44.1kHz mono.
training_image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("ffmpeg")
    .pip_install(
        "fastapi",
        "torch>=2.2.0",
        "transformers>=4.40.0",
        "peft>=0.6.0",
        "soundfile>=0.12.1",
        "numpy>=1.26.0",
        "mutagen>=1.46.0",
        "pydub>=0.25.1",
        "google-genai>=1.0.0",
    )
)

# ---------------------------------------------------------------------------
# Store uploaded file (from Next.js) to volume for training
# ---------------------------------------------------------------------------

@app.function(
    image=training_image,
    volumes={VOLUME_MOUNT: music_volume},
    timeout=120,
)
def store_upload(
    producer_id: str,
    job_id: str,
    filename: str,
    content_base64: str,
) -> str:
    """
    Write base64-encoded file to volume at /data/uploads/<producer_id>/<job_id>/<filename>.
    Returns the path for use in train_lora(upload_paths=[...]).
    """
    import base64
    base_dir = Path(VOLUME_MOUNT) / "uploads" / producer_id / job_id
    base_dir.mkdir(parents=True, exist_ok=True)
    path = base_dir / (filename or "audio.wav")
    path.write_bytes(base64.b64decode(content_base64))
    music_volume.commit()
    return str(path)


@app.function(
    image=training_image,
    volumes={VOLUME_MOUNT: music_volume},
    timeout=120,
)
@modal.fastapi_endpoint(method="POST")
def store_upload_web(item: dict) -> dict:
    """
    POST JSON: { "producer_id", "job_id", "filename", "content_base64" }.
    Returns { "path" } or { "error": "..." }.
    """
    try:
        producer_id = (item.get("producer_id") or item.get("producerId") or "").strip()
        job_id = (item.get("job_id") or item.get("jobId") or str(uuid4())).strip()
        filename = (item.get("filename") or "audio.wav").strip()
        content_base64 = item.get("content_base64") or item.get("contentBase64") or ""
        if not producer_id or not content_base64:
            return {"error": "producer_id and content_base64 are required"}
        path = store_upload.remote(producer_id, job_id, filename, content_base64)
        return {"path": path, "producer_id": producer_id, "job_id": job_id}
    except Exception as e:
        return {"error": str(e)}


# ---------------------------------------------------------------------------
# Prepare training data (Producer Twin: 15s segments, -1dB, 44.1kHz mono)
# ---------------------------------------------------------------------------

@app.function(
    image=training_image,
    volumes={VOLUME_MOUNT: music_volume},
    timeout=600,
)
def prepare_training_data(producer_id: str, source_paths: list[str]) -> list[str]:
    """
    Slice source audio into 15s segments, normalize -1dB, 44.1kHz mono.
    Writes to /data/training_data/<producer_id>/audio/. Returns list of segment paths.
    """
    from preprocess import prepare_training_segments

    out_dir = training_data_audio_dir(producer_id, VOLUME_MOUNT)
    paths = prepare_training_segments(source_paths, producer_id, out_dir)
    music_volume.commit()
    return paths


# ---------------------------------------------------------------------------
# Tag training data (Gemini 1.5 Flash: BPM, Key, Drum Kit, Synth, Sub-genre)
# ---------------------------------------------------------------------------

@app.function(
    image=training_image,
    volumes={VOLUME_MOUNT: music_volume},
    timeout=300,
    secrets=[modal.Secret.from_name("nawfside-modal-secrets")],
)
def tag_training_data(producer_id: str) -> list[str]:
    """
    Read /data/training_data/<producer_id>/audio/*.wav, call Gemini 1.5 Flash
    for tags, write /data/training_data/<producer_id>/text/<stem>.txt.
    Requires GEMINI_API_KEY in nawfside-modal-secrets. Returns list of .txt paths.
    """
    import os
    from tagging import tag_audio_segments

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        return []
    audio_dir = training_data_audio_dir(producer_id, VOLUME_MOUNT)
    text_dir = training_data_text_dir(producer_id, VOLUME_MOUNT)
    if not Path(audio_dir).exists():
        return []
    paths = tag_audio_segments(audio_dir, text_dir, api_key)
    music_volume.commit()
    return paths


# ---------------------------------------------------------------------------
# Stage dataset (download URLs to volume for training)
# ---------------------------------------------------------------------------

@app.function(
    image=training_image,
    volumes={VOLUME_MOUNT: music_volume},
    timeout=1800,
)
def stage_dataset(
    producer_id: str,
    job_id: str,
    upload_urls: list[str],
) -> list[str]:
    """
    Download audio from URLs into volume at /data/datasets/<producer_id>/<job_id>/.
    Returns list of local paths for use in train_lora.
    """
    import urllib.request
    base = Path(VOLUME_MOUNT) / "datasets" / producer_id / job_id
    base.mkdir(parents=True, exist_ok=True)
    local_paths = []
    for i, url in enumerate(upload_urls):
        ext = Path(url.split("?")[0]).suffix or ".wav"
        path = base / f"clip_{i:04d}{ext}"
        urllib.request.urlretrieve(url, path)
        local_paths.append(str(path))
    music_volume.commit()
    return local_paths


# ---------------------------------------------------------------------------
# Train LoRA
# ---------------------------------------------------------------------------

@app.function(
    image=ace_step_image,
    gpu="L40S",
    volumes={VOLUME_MOUNT: music_volume, cache_dir: model_cache_volume},
    timeout=3600,
    secrets=[modal.Secret.from_name("nawfside-modal-secrets")],
)
def train_lora(
    producer_id: str,
    upload_paths: Optional[list] = None,
    upload_urls: Optional[list] = None,
    model_name: str = "nawfside_lora",
    metadata_per_file: Optional[list] = None,
    backend_override: Optional[str] = None,
    job_id: Optional[str] = None,
    skip_preprocess: bool = False,
    tag_before_train: bool = False,
) -> dict:
    """
    Train a LoRA for a producer. Pass either:
    - upload_paths: local paths inside the container (e.g. from store_upload);
    - or upload_urls: will call stage_dataset first, then use staged paths.
    By default runs preprocessing: 15s segments, -1dB, 44.1kHz mono -> training_data/<producer_id>/audio/.
    Set skip_preprocess=True to train on raw paths (backward compat).
    If tag_before_train=True, runs Gemini tagging on prepared segments (requires GEMINI_API_KEY).
    Saves LoRA to volume (loras/ and models/ for spec compatibility).
    """
    job_id = job_id or str(uuid4())
    paths = list(upload_paths or [])
    if upload_urls and not paths:
        paths = stage_dataset.remote(producer_id, job_id, upload_urls)
    if not paths:
        raise ValueError("Provide either upload_paths or upload_urls")

    if not skip_preprocess:
        paths = prepare_training_data.remote(producer_id, paths)
        if not paths:
            raise ValueError("Preprocessing produced no segments; check source audio")
        if tag_before_train:
            tag_training_data.remote(producer_id)

    kind = BackendKind(backend_override) if backend_override else get_backend_from_env()
    backend = get_train_backend(kind)

    dataset = normalize_dataset(paths, metadata_per_file)
    out_path = lora_volume_path(producer_id, model_name)
    # Persist under mounted volume (loras/ for API compat)
    volume_out = f"{VOLUME_MOUNT}/loras/{producer_id}_{model_name}.safetensors"
    Path(volume_out).parent.mkdir(parents=True, exist_ok=True)

    result_path = backend.train(
        dataset=dataset,
        producer_id=producer_id,
        model_name=model_name,
        output_path=volume_out,
    )
    # Spec compatibility: also write to models/<producer_id>/adapter_model.safetensors
    adapter_dest = Path(models_adapter_path(producer_id, "adapter_model", VOLUME_MOUNT))
    adapter_dest.parent.mkdir(parents=True, exist_ok=True)
    if Path(result_path).exists():
        import shutil
        shutil.copy2(result_path, adapter_dest)
    music_volume.commit()
    return {
        "job_id": job_id,
        "producer_id": producer_id,
        "model_name": model_name,
        "backend": kind.value,
        "lora_path": result_path,
        "models_path": str(adapter_dest),
    }


# ---------------------------------------------------------------------------
# Generate (inference)
# ---------------------------------------------------------------------------

@app.function(
    image=ace_step_image,
    gpu="L40S",
    volumes={VOLUME_MOUNT: music_volume, cache_dir: model_cache_volume},
    timeout=600,
    secrets=[modal.Secret.from_name("nawfside-modal-secrets")],
)
def generate(
    prompt: str,
    lora_id: str,
    duration_seconds: float = 60.0,
    backend_override: Optional[str] = None,
    output_format: str = "wav",
) -> bytes:
    """
    Generate audio from prompt using optional LoRA (lora_id = "producer_id:model_name").
    Returns raw audio bytes.
    """
    kind = BackendKind(backend_override) if backend_override else get_backend_from_env()
    backend = get_infer_backend(kind)

    lora_path = None
    if ":" in lora_id:
        producer_id_part, model_name_part = lora_id.split(":", 1)
        for candidate in (
            f"{VOLUME_MOUNT}/loras/{producer_id_part}_{model_name_part}.safetensors",
            f"{VOLUME_MOUNT}/models/{producer_id_part}/adapter_model.safetensors",
        ):
            p = Path(candidate)
            if p.exists() and p.stat().st_size > 100:
                head = p.read_bytes()[:80]
                if b"ACE_STEP_LORA_PLACEHOLDER" not in head and b"MUSICGEN_LORA_PLACEHOLDER" not in head:
                    lora_path = candidate
                    break

    out_path = f"{VOLUME_MOUNT}/outputs/gen_{uuid4().hex}.{output_format}"
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    result = backend.generate(
        prompt=prompt,
        lora_path=lora_path,
        duration_seconds=duration_seconds,
        output_path=out_path,
    )
    if isinstance(result, bytes):
        return result
    return Path(result).read_bytes()


# ---------------------------------------------------------------------------
# Web endpoints for Next.js API
# ---------------------------------------------------------------------------

@app.function(
    image=training_image,
    timeout=60,
)
@modal.fastapi_endpoint(method="POST")
def train_web(item: dict) -> dict:
    """
    HTTP POST with JSON: { "producer_id", "upload_urls"? or "upload_paths"? (paths on volume), "model_name?", "job_id?" }.
    Returns JSON: { "job_id", "producer_id", "model_name", "backend", "lora_path" } or { "error": "..." }.
    """
    try:
        producer_id = (item.get("producer_id") or item.get("producerId") or "").strip()
        upload_urls = item.get("upload_urls") or item.get("uploadUrls") or []
        upload_paths = item.get("upload_paths") or item.get("uploadPaths") or []
        if not producer_id:
            return {"error": "producer_id is required"}
        if not upload_paths and not upload_urls:
            return {"error": "Provide either upload_paths (from store_upload) or upload_urls"}
        model_name = (item.get("model_name") or item.get("modelName") or "nawfside_lora").strip()
        metadata_per_file = item.get("metadata_per_file") or item.get("metadataPerFile")
        job_id = item.get("job_id") or item.get("jobId")
        backend_override = item.get("backend_override") or item.get("backendOverride")
        skip_preprocess = bool(item.get("skip_preprocess") or item.get("skipPreprocess"))
        tag_before_train = bool(item.get("tag_before_train") or item.get("tagBeforeTrain"))
        result = train_lora.remote(
            producer_id=producer_id,
            upload_paths=upload_paths if upload_paths else None,
            upload_urls=upload_urls if upload_urls else None,
            model_name=model_name,
            metadata_per_file=metadata_per_file,
            job_id=job_id,
            backend_override=backend_override,
            skip_preprocess=skip_preprocess,
            tag_before_train=tag_before_train,
        )
        return result
    except Exception as e:
        return {"error": str(e)}


@app.function(
    image=ace_step_image,
    gpu="L40S",
    volumes={VOLUME_MOUNT: music_volume, cache_dir: model_cache_volume},
    timeout=600,
)
@modal.concurrent(max_inputs=4)
@modal.fastapi_endpoint(method="POST")
def generate_web(item: dict) -> dict:
    """
    HTTP POST with JSON: { "prompt", "lora_id?", "duration_seconds?", "backend_override?" }.
    Returns JSON: { "audio_base64" } or { "error": "..." }.
    """
    prompt = (item.get("prompt") or "").strip()
    if not prompt:
        return {"error": "prompt is required"}
    lora_id = item.get("lora_id") or ""
    duration = float(item.get("duration_seconds", 60))
    backend_override = item.get("backend_override")
    try:
        raw = generate.remote(
            prompt=prompt,
            lora_id=lora_id,
            duration_seconds=duration,
            backend_override=backend_override,
        )
        import base64
        return {"audio_base64": base64.b64encode(raw).decode()}
    except Exception as e:
        return {"error": str(e)}


# ---------------------------------------------------------------------------
# Local CLI
# ---------------------------------------------------------------------------

@app.local_entrypoint()
def main(
    task: str = "train",
    producer_id: str = "local_producer",
    paths: str = "",
    model_name: str = "nawfside_lora",
    prompt: str = "808 trap beat",
    lora_id: str = "",
    duration: float = 60.0,
):
    if task == "train":
        upload_paths = [p.strip() for p in paths.split(",") if p.strip()]
        out = train_lora.remote(producer_id, upload_paths or [], model_name=model_name)
        print("Train result:", out)
    else:
        raw = generate.remote(prompt=prompt, lora_id=lora_id or f"{producer_id}:{model_name}", duration_seconds=duration)
        out_path = Path(f"/tmp/nawfside_gen_{uuid4().hex}.wav")
        out_path.write_bytes(raw)
        print("Generated:", out_path)
