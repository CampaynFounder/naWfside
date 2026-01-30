"use client";
import { useState, useRef } from 'react';
import Button from '../../../components/ui/Button.client';
import { triggerTrain } from '../../../lib/api';
import Header from '../../../components/Header';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_ACCEPT = 'audio/wav,audio/wave,audio/x-wav,audio/mpeg,audio/mp3,.wav,.mp3';
const DEFAULT_MODEL = 'nawfside_lora';

export default function ProducerDashboard() {
  const [producerId, setProducerId] = useState('test_producer');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ job?: Record<string, unknown>; error?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [testPrompt, setTestPrompt] = useState('');
  const [testModelName, setTestModelName] = useState(DEFAULT_MODEL);
  const [testGenerating, setTestGenerating] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testAudioUrl, setTestAudioUrl] = useState<string | null>(null);
  const [testGenerationId, setTestGenerationId] = useState<string | null>(null);

  async function onTrainWithUrls() {
    const res = await triggerTrain({ producerId: 'local-producer', uploadUrls: [] });
    console.log('train response', res);
  }

  async function onUploadAndTrain() {
    if (!file) {
      setResult({ error: 'Select an audio file first (e.g. one ~60s WAV/MP3).' });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setResult({ error: 'File too large (max 50 MB).' });
      return;
    }
    setUploading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('producerId', producerId.trim() || 'test_producer');
      const res = await fetch('/api/producer/upload-and-train', {
        method: 'POST',
        credentials: 'include',
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResult({ error: data.error || res.statusText || 'Upload/train failed' });
        return;
      }
      setResult({ job: data.job });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : 'Upload/train failed' });
    } finally {
      setUploading(false);
    }
  }

  async function onTestGenerate() {
    const prompt = testPrompt.trim();
    if (!prompt) {
      setTestError('Enter a prompt (e.g. 808 trap, dark keys).');
      return;
    }
    setTestGenerating(true);
    setTestError(null);
    setTestAudioUrl(null);
    setTestGenerationId(null);
    try {
      const res = await fetch('/api/producer/test-generate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          producerId: producerId.trim() || 'test_producer',
          prompt,
          modelName: testModelName.trim() || DEFAULT_MODEL,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTestError(data.error || 'Test generation failed');
        return;
      }
      const gen = data.generation;
      if (gen?.audioUrl) {
        setTestAudioUrl(gen.audioUrl);
        setTestGenerationId(gen.generationId ?? null);
      } else if (gen?.audioBase64) {
        setTestAudioUrl(`data:audio/wav;base64,${gen.audioBase64}`);
        setTestGenerationId(gen.generationId ?? null);
      } else {
        setTestError(gen?.error || 'No audio returned');
      }
    } catch (e) {
      setTestError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setTestGenerating(false);
    }
  }

  function downloadTestAudio() {
    if (!testAudioUrl) return;
    const a = document.createElement('a');
    a.href = testAudioUrl;
    a.download = `test-${producerId}-${testGenerationId || Date.now()}.wav`;
    a.click();
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <div className="px-4 py-6 pb-20 sm:p-8 sm:pb-8" style={{ paddingBottom: 'max(5rem, env(safe-area-inset-bottom, 0) + 1.5rem)' }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Producer Dashboard</h2>
            <p className="mt-2 text-sm text-gray-300">Upload your audio, monitor Sound training, and view earnings.</p>
          </div>
          <form action="/api/auth/logout" method="POST" className="inline">
            <Button type="submit" className="min-h-[44px] bg-gray-600 hover:bg-gray-500">
              Log out
            </Button>
          </form>
        </div>

        <section className="mt-8 rounded-xl border border-gray-800 bg-[#0f0813] p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-white">Upload & train (test: 1 × 60s file)</h3>
          <p className="mt-1 text-sm text-gray-400">One audio file is stored on Modal and used to start a training job.</p>
          <div className="mt-4 flex flex-col gap-3">
            <label className="text-sm text-gray-300">Producer ID</label>
            <input
              type="text"
              value={producerId}
              onChange={(e) => setProducerId(e.target.value)}
              placeholder="test_producer"
              className="min-h-[44px] w-full max-w-xs rounded-lg border border-gray-700 bg-transparent px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_ACCEPT}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="text-sm text-gray-300 file:mr-3 file:rounded file:border-0 file:bg-cyan-600 file:px-4 file:py-2 file:text-white"
              />
              {file && <span className="text-sm text-gray-400">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={onUploadAndTrain} disabled={uploading}>
                {uploading ? 'Uploading & training…' : 'Upload & train'}
              </Button>
            </div>
            {result?.error && <p className="text-sm text-red-400">{result.error}</p>}
            {result?.job && (
              <pre className="mt-2 overflow-auto rounded bg-gray-900 p-3 text-xs text-gray-300">
                {JSON.stringify(result.job, null, 2)}
              </pre>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-gray-800 bg-[#0f0813] p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-white">Test generation</h3>
          <p className="mt-1 text-sm text-gray-400">Generate a sample with your LoRA to confirm the model sounds right. Uses the same Producer ID as above; no credits charged.</p>
          <div className="mt-4 flex flex-col gap-3">
            <label className="text-sm text-gray-300">Prompt</label>
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="e.g. 808 trap, dark keys"
              className="min-h-[44px] w-full max-w-md rounded-lg border border-gray-700 bg-transparent px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <label className="text-sm text-gray-300">Model name (optional)</label>
            <input
              type="text"
              value={testModelName}
              onChange={(e) => setTestModelName(e.target.value)}
              placeholder={DEFAULT_MODEL}
              className="min-h-[44px] w-full max-w-xs rounded-lg border border-gray-700 bg-transparent px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <Button onClick={onTestGenerate} disabled={testGenerating}>
              {testGenerating ? 'Generating…' : 'Test generate'}
            </Button>
            {testError && <p className="text-sm text-red-400">{testError}</p>}
            {testAudioUrl && (
              <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
                <p className="text-sm text-gray-300 mb-2">Preview</p>
                <audio src={testAudioUrl} controls className="w-full max-w-full" />
                <Button onClick={downloadTestAudio} className="mt-2 w-full min-h-[44px]">Download WAV</Button>
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button onClick={() => alert('Upload flow: use form above')}>Upload Beats</Button>
          <Button onClick={() => onTrainWithUrls()}>Train from URLs (stub)</Button>
        </div>
      </div>
    </div>
  );
}

