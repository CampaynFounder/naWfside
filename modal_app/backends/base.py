"""
Abstract backends for training and inference.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Optional, Union

from config import DatasetItem


class TrainBackend(ABC):
    """LoRA training: dataset (audio + metadata) -> LoRA weights path."""

    @abstractmethod
    def train(
        self,
        dataset: list[DatasetItem],
        producer_id: str,
        model_name: str,
        output_path: str,
        **kwargs: Any,
    ) -> str:
        """Run training. Return path to saved LoRA (e.g. .safetensors)."""
        ...


class InferBackend(ABC):
    """Inference: prompt + LoRA path -> generated audio path or bytes."""

    @abstractmethod
    def generate(
        self,
        prompt: str,
        lora_path: Optional[str],
        duration_seconds: float = 60.0,
        output_path: Optional[str] = None,
        **kwargs: Any,
    ) -> Union[str, bytes]:
        """Generate audio. Return file path (if output_path given) or bytes."""
        ...
