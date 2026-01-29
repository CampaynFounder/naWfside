"""
Inject ISRC and ID3 tags into generated audio and produce a split-sheet PDF.
"""
from mutagen.easyid3 import EasyID3
import os

def inject_metadata(wav_path, metadata: dict):
    # metadata: { 'isrc': str, 'producer_name': str, ... }
    try:
        tags = EasyID3(wav_path)
    except Exception:
        tags = EasyID3()
    tags["title"] = metadata.get("title", "naWfside Generation")
    tags["artist"] = metadata.get("producer_name", "naWfside")
    # TSRC is ISRC code in ID3 v2.4; mutagen supports custom frames if needed
    # Save tags - placeholder
    # tags.save(wav_path)
    # For now, we return the same path
    return wav_path

def generate_split_sheet_pdf(metadata: dict, out_path="/outputs/split_sheet.pdf"):
    # Minimal placeholder: create an empty PDF file
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "wb") as f:
        f.write(b"%PDF-1.4\n%naWfside split sheet\n")
    return out_path

