"""
Extensible backends for LoRA training and inference.
Add a new backend by implementing TrainBackend + InferBackend and registering in get_train_backend / get_infer_backend.
"""
from .base import TrainBackend, InferBackend
from .ace_step import ACEStepTrainBackend, ACEStepInferBackend
from .musicgen import MusicGenTrainBackend, MusicGenInferBackend
from config import BackendKind, DatasetItem

def get_train_backend(kind: BackendKind) -> TrainBackend:
    if kind == BackendKind.ACE_STEP:
        return ACEStepTrainBackend()
    if kind == BackendKind.MUSICGEN:
        return MusicGenTrainBackend()
    raise ValueError(f"Unknown backend: {kind}")

def get_infer_backend(kind: BackendKind) -> InferBackend:
    if kind == BackendKind.ACE_STEP:
        return ACEStepInferBackend()
    if kind == BackendKind.MUSICGEN:
        return MusicGenInferBackend()
    raise ValueError(f"Unknown backend: {kind}")
