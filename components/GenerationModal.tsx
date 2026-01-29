import { useState } from 'react';
import Button from './ui/Button';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#0b0710] p-6 rounded w-full max-w-xl border border-gray-800">
            <h3 className="text-xl font-semibold">Generate with {producer.name}</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <input
                className="p-2 bg-transparent border border-gray-700 rounded text-white"
                placeholder="Describe the track (e.g., 808 trap, dark keys)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="flex items-center space-x-3">
                <label className="text-sm text-gray-300">Tempo</label>
                <input
                  type="number"
                  value={tempo}
                  onChange={(e) => setTempo(Number(e.target.value))}
                  className="w-24 p-2 bg-transparent border border-gray-700 rounded text-white"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button onClick={() => setOpen(false)} className="bg-gray-600">Cancel</Button>
                <Button onClick={() => onGenerate()}>{loading ? 'Generating...' : 'Generate'}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

