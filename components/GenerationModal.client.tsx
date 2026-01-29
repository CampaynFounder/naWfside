"use client";
import { useState } from 'react';
import Button from './ui/Button.client';

export default function GenerationModal({ producer }: any) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [tempo, setTempo] = useState(140);
  const [loading, setLoading] = useState(false);

  async function onGenerate() {
    setLoading(true);
    // Call API - for now use alert and mock behavior
    setTimeout(() => {
      setLoading(false);
      alert('Generated 60s beat (mock). Download will be available after Modal integration.');
      setOpen(false);
    }, 1200);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Generate 60s</Button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center" onClick={() => setOpen(false)}>
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
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-2 mt-4">
                <Button onClick={() => setOpen(false)} className="w-full min-h-[48px] bg-gray-600 sm:w-auto">Cancel</Button>
                <Button onClick={() => onGenerate()} className="w-full min-h-[48px] sm:w-auto">{loading ? 'Generating...' : 'Generate'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

