"""
Producer-centric tagging via Gemini 1.5 Flash.
Analyzes each audio segment and writes comma-separated tags to .txt alongside audio.
"""
from __future__ import annotations

from pathlib import Path
from typing import List

PROMPT = (
    "You are a master music producer. Analyze this beat and provide comma-separated tags for: "
    "BPM, Key, Drum Kit Texture (e.g., punchy 808s), Synth Type, and Sub-genre. "
    "No vocals exist; focus on the mix. Output only the tags, one line."
)


def tag_audio_segments(
    audio_dir: str,
    text_dir: str,
    api_key: str,
) -> List[str]:
    """
    For each WAV in audio_dir, call Gemini 1.5 Flash, write response to text_dir/<stem>.txt.
    Returns list of written .txt paths. Uses google-genai (Files API + generate_content).
    """
    try:
        from google import genai
    except ImportError:
        return []

    client = genai.Client(api_key=api_key)
    audio_path = Path(audio_dir)
    text_path = Path(text_dir)
    text_path.mkdir(parents=True, exist_ok=True)
    written: List[str] = []

    for wav in sorted(audio_path.glob("*.wav")):
        try:
            myfile = client.files.upload(file=str(wav))
            response = client.models.generate_content(
                model="gemini-1.5-flash",
                contents=[PROMPT, myfile],
            )
            tags = (response.text or "").strip()
            out = text_path / f"{wav.stem}.txt"
            out.write_text(tags, encoding="utf-8")
            written.append(str(out))
        except Exception:
            continue
    return written
