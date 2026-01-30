"""
ACE-Step backend: primary model for LoRA training and inference.
Uses ACE-Step from GitHub + Hugging Face; LoRA training API follows repo when available.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any, Optional, Union

from .base import TrainBackend, InferBackend
from config import DatasetItem


class ACEStepTrainBackend(TrainBackend):
    """ACE-Step LoRA training. Uses repo training script when available; else placeholder."""

    def train(
        self,
        dataset: list[DatasetItem],
        producer_id: str,
        model_name: str,
        output_path: str,
        **kwargs: Any,
    ) -> str:
        # TODO: when ACE-Step exposes LoRA training, call it here.
        # Example: from acestep.train_lora import run_training; run_training(dataset, output_path=output_path)
        # For now: ensure output dir exists and write a minimal placeholder so the pipeline is testable.
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "wb") as f:
            # Minimal safetensors-like header so downstream can detect "trained"
            f.write(b"ACE_STEP_LORA_PLACEHOLDER\n")
        return output_path


class ACEStepInferBackend(InferBackend):
    """ACE-Step inference with optional LoRA. Uses ACEStepPipeline from the Modal example."""

    def generate(
        self,
        prompt: str,
        lora_path: Optional[str],
        duration_seconds: float = 60.0,
        output_path: Optional[str] = None,
        **kwargs: Any,
    ) -> Union[str, bytes]:
        # Pipeline lives in Modal image; import inside function so it runs in Modal env.
        try:
            from acestep.pipeline_ace_step import ACEStepPipeline
        except ImportError:
            # Fallback: write placeholder wav so API is testable without full image
            out = output_path or "/tmp/ace_step_placeholder.wav"
            Path(out).parent.mkdir(parents=True, exist_ok=True)
            with open(out, "wb") as f:
                f.write(b"PLACEHOLDER_WAV")
            return out

        # Load pipeline (caller may cache via @modal.enter)
        model = kwargs.get("_pipeline")  # Optional: preloaded pipeline
        if model is None:
            model = ACEStepPipeline(dtype="bfloat16", cpu_offload=False, overlapped_decode=True)

        out = output_path or f"/tmp/ace_step_{id(prompt)}.wav"
        Path(out).parent.mkdir(parents=True, exist_ok=True)
        model(
            audio_duration=duration_seconds,
            prompt=prompt,
            lyrics=kwargs.get("lyrics", "[inst]"),
            format="wav",
            save_path=out,
            manual_seeds=kwargs.get("manual_seeds", 1),
            infer_step=60,
            guidance_scale=15,
            scheduler_type="euler",
            cfg_type="apg",
            omega_scale=10,
            guidance_interval=0.5,
            guidance_interval_decay=0,
            min_guidance_scale=3,
            use_erg_tag=True,
            use_erg_lyric=True,
            use_erg_diffusion=True,
        )
        if output_path:
            return output_path
        return Path(out).read_bytes()
