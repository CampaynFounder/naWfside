"""
Backend and dataset config for LoRA training/inference.
Extensible: add new backends in BACKENDS and implement in backends/.
"""
from __future__ import annotations

from enum import Enum
from typing import Any, List, Optional

# ---------------------------------------------------------------------------
# Backend selection (ACE-Step primary, MusicGen fallback)
# ---------------------------------------------------------------------------

class BackendKind(str, Enum):
    ACE_STEP = "ace_step"
    MUSICGEN = "musicgen"


# Default backend; override via env MODAL_MUSIC_BACKEND=musicgen
DEFAULT_BACKEND = BackendKind.ACE_STEP


def get_backend_from_env() -> BackendKind:
    import os
    v = (os.environ.get("MODAL_MUSIC_BACKEND") or "").strip().lower()
    if v == "musicgen":
        return BackendKind.MUSICGEN
    return BackendKind.ACE_STEP


# ---------------------------------------------------------------------------
# Dataset format: audio files + metadata
# ---------------------------------------------------------------------------

# Each item: path (local or volume path) + optional metadata for conditioning/tags
DatasetItem = dict[str, Any]  # {"path": str, "title": str?, "bpm": int?, "tags": list[str]?, ...}


def normalize_dataset(upload_paths: List[str], metadata_per_file: Optional[List[dict]] = None) -> List[DatasetItem]:
    """
    Normalize upload paths into dataset items with optional metadata.
    metadata_per_file[i] applies to upload_paths[i]; if shorter, missing entries get {}.
    """
    out: List[DatasetItem] = []
    meta = metadata_per_file or []
    for i, path in enumerate(upload_paths):
        item: DatasetItem = {"path": path}
        if i < len(meta) and isinstance(meta[i], dict):
            item.update(meta[i])
        out.append(item)
    return out


# ---------------------------------------------------------------------------
# Paths on Modal Volume
# ---------------------------------------------------------------------------

VOLUME_LORAS_DIR = "/loras"
VOLUME_DATASETS_DIR = "/datasets"
VOLUME_OUTPUTS_DIR = "/outputs"

# Producer Twin layout: preprocessed audio + tags + trained adapter
TRAINING_DATA_DIR = "training_data"
TRAINING_DATA_AUDIO_SUBDIR = "audio"
TRAINING_DATA_TEXT_SUBDIR = "text"
MODELS_DIR = "models"

def lora_volume_path(producer_id: str, model_name: str, ext: str = "safetensors") -> str:
    return f"{VOLUME_LORAS_DIR}/{producer_id}_{model_name}.{ext}"

def dataset_volume_dir(producer_id: str, job_id: str) -> str:
    return f"{VOLUME_DATASETS_DIR}/{producer_id}/{job_id}"

def training_data_audio_dir(producer_id: str, mount_prefix: str = "") -> str:
    base = mount_prefix or ""
    return f"{base}/{TRAINING_DATA_DIR}/{producer_id}/{TRAINING_DATA_AUDIO_SUBDIR}"

def training_data_text_dir(producer_id: str, mount_prefix: str = "") -> str:
    base = mount_prefix or ""
    return f"{base}/{TRAINING_DATA_DIR}/{producer_id}/{TRAINING_DATA_TEXT_SUBDIR}"

def models_adapter_path(producer_id: str, model_name: str = "adapter_model", mount_prefix: str = "") -> str:
    base = mount_prefix or ""
    return f"{base}/{MODELS_DIR}/{producer_id}/{model_name}.safetensors"
