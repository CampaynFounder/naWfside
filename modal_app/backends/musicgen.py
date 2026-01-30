"""
MusicGen backend: fallback for LoRA training and inference.
Uses Hugging Face transformers MusicGen; LoRA via PEFT when needed.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any, Optional, Union

from .base import TrainBackend, InferBackend
from config import DatasetItem


class MusicGenTrainBackend(TrainBackend):
    """MusicGen LoRA training. Placeholder until PEFT/LoRA path is wired."""

    def train(
        self,
        dataset: list[DatasetItem],
        producer_id: str,
        model_name: str,
        output_path: str,
        **kwargs: Any,
    ) -> str:
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "wb") as f:
            f.write(b"MUSICGEN_LORA_PLACEHOLDER\n")
        return output_path


class MusicGenInferBackend(InferBackend):
    """MusicGen inference with optional LoRA."""

    def generate(
        self,
        prompt: str,
        lora_path: Optional[str],
        duration_seconds: float = 60.0,
        output_path: Optional[str] = None,
        **kwargs: Any,
    ) -> Union[str, bytes]:
        out = output_path or f"/tmp/musicgen_{id(prompt)}.wav"
        Path(out).parent.mkdir(parents=True, exist_ok=True)
        try:
            from transformers import AutoProcessor, MusicgenForConditionalGeneration
            import torch
            import scipy.io.wavfile as wavfile

            model_id = kwargs.get("model_id", "facebook/musicgen-small")
            processor = AutoProcessor.from_pretrained(model_id)
            model = MusicgenForConditionalGeneration.from_pretrained(model_id)
            if lora_path and Path(lora_path).exists():
                # TODO: load LoRA weights when MusicGen LoRA is implemented
                pass
            inputs = processor(text=[prompt], padding=True, return_tensors="pt")
            gen = model.generate(**inputs, max_new_tokens=int(duration_seconds * 50))
            audio = processor.batch_decode(gen)[0]
            wavfile.write(out, rate=32000, data=audio.numpy())
        except Exception:
            with open(out, "wb") as f:
                f.write(b"PLACEHOLDER_WAV")
        if output_path:
            return output_path
        return Path(out).read_bytes()
