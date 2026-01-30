"""
Producer Twin preprocessing: slice 15s, normalize -1dB, 44.1kHz mono.
Used before training so the trainer sees consistent segments.
"""
from __future__ import annotations

from pathlib import Path
from typing import List

# Producer Twin spec: 15s segments, -1dB, 44.1kHz mono
SEGMENT_DURATION_MS = 15 * 1000
TARGET_DBFS = -1.0
TARGET_SAMPLE_RATE = 44100
TARGET_CHANNELS = 1


def prepare_training_segments(
    source_paths: List[str],
    producer_id: str,
    output_dir: str,
) -> List[str]:
    """
    Slice each source file into 15s segments, normalize to -1dB, convert to 44.1kHz mono.
    Writes WAVs to output_dir (e.g. /data/training_data/<producer_id>/audio/).
    Returns list of output paths.
    """
    from pydub import AudioSegment

    Path(output_dir).mkdir(parents=True, exist_ok=True)
    out_paths: List[str] = []
    segment_index = 0

    for src in source_paths:
        path = Path(src)
        if not path.exists():
            continue
        try:
            audio = AudioSegment.from_file(str(path))
        except Exception:
            continue
        # Convert to mono and 44.1kHz for consistent processing
        if audio.channels != TARGET_CHANNELS:
            audio = audio.set_channels(TARGET_CHANNELS)
        if audio.frame_rate != TARGET_SAMPLE_RATE:
            audio = audio.set_frame_rate(TARGET_SAMPLE_RATE)

        pos_ms = 0
        while pos_ms < len(audio):
            segment = audio[pos_ms : pos_ms + SEGMENT_DURATION_MS]
            if len(segment) < 1000:
                break
            # Normalize to -1dB (skip if silence)
            try:
                dbfs = segment.dBFS
                if dbfs > -100:
                    change_dbfs = TARGET_DBFS - dbfs
                    segment = segment.apply_gain(change_dbfs)
            except Exception:
                pass
            out_name = f"seg_{segment_index:04d}.wav"
            out_path = Path(output_dir) / out_name
            segment.export(str(out_path), format="wav", parameters=["-ac", "1", "-ar", str(TARGET_SAMPLE_RATE)])
            out_paths.append(str(out_path))
            segment_index += 1
            pos_ms += SEGMENT_DURATION_MS

    return out_paths
