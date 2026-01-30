"use client";
import { useState } from 'react';
import Button from './ui/Button.client';

const DEFAULT_ARTIST_ID = 'test_artist';
const LORA_SUFFIX = 'nawfside_lora';

export default function GenerationModal({ producer }: { producer: { id: string; name: string } }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [tempo, setTempo] = useState(140);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);

  async function onGenerate() {
    const text = prompt.trim();
    if (!text) {
      setError('Enter a prompt (e.g. 808 trap, dark keys).');
      return;
    }
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setGenerationId(null);
    try {
      const res = await fetch('/api/artist/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId: DEFAULT_ARTIST_ID,
          loraId: `${producer.id}:${LORA_SUFFIX}`,
          prompt: text,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || res.status === 402 ? 'Insufficient credits' : 'Generation failed');
        return;
      }
      const gen = data.generation;
      if (gen?.audioUrl) {
        setAudioUrl(gen.audioUrl);
        setGenerationId(gen.generationId ?? null);
      } else if (gen?.audioBase64) {
        setAudioUrl(`data:audio/wav;base64,${gen.audioBase64}`);
        setGenerationId(gen.generationId ?? null);
      } else {
        setError(gen?.error || 'No audio returned');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setOpen(false);
    setError(null);
    setAudioUrl(null);
    setGenerationId(null);
  }

  function downloadAudio() {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `generated-${producer.id}-${generationId || Date.now()}.wav`;
    a.click();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Generate 60s</Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={closeModal}>
          <div className="relative z-50 w-full max-h-[90dvh] overflow-y-auto rounded-t-2xl border border-gray-800 bg-[#0b0710] p-4 shadow-2xl sm:mx-4 sm:max-w-xl sm:rounded-2xl sm:p-6" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white sm:text-xl">Generate with {producer.name}</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <input
                className="min-h-[48px] w-full rounded-lg border border-gray-700 bg-transparent px-4 py-3 text-base text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                placeholder="Describe the track (e.g., 808 trap, dark keys)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-gray-300">Tempo</label>
                <input
                  type="number"
                  value={tempo}
                  onChange={(e) => setTempo(Number(e.target.value))}
                  className="min-h-[48px] w-24 rounded-lg border border-gray-700 bg-transparent px-3 py-2 text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              {audioUrl && (
                <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
                  <p className="text-sm text-gray-300 mb-2">Preview</p>
                  <audio src={audioUrl} controls className="w-full max-w-full" />
                  <Button onClick={downloadAudio} className="mt-2 w-full min-h-[44px]">Download WAV</Button>
                </div>
              )}
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-2 mt-4">
                <Button onClick={closeModal} className="w-full min-h-[48px] bg-gray-600 sm:w-auto">Cancel</Button>
                <Button onClick={onGenerate} className="w-full min-h-[48px] sm:w-auto" disabled={loading}>
                  {loading ? 'Generating…' : 'Generate'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

