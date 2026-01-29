'use client';
import { use } from 'react';
import Header from '../../../components/Header';
import { producers } from '../../../lib/mock';
import GenerationModal from '../../../components/GenerationModal.client';
import Button from '../../../components/ui/Button.client';

type PageProps = { params: Promise<{ producerId: string }> };

export default function ProducerProfile({ params }: PageProps) {
  const { producerId } = use(params);
  const producer = producers.find((p) => p.id === producerId);
  if (!producer) return <div className="p-8">Producer not found</div>;

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <main className="px-4 py-6 pb-20 sm:p-8 sm:pb-8" style={{ paddingBottom: 'max(5rem, env(safe-area-inset-bottom, 0) + 1.5rem)' }}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-white sm:text-4xl">{producer.name}</h1>
            <p className="mt-4 text-gray-300">{producer.bio}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button onClick={() => alert('Open upload modal (stub)')}>Upload Beats</Button>
              <Button onClick={() => alert('Train Sound (stub)')}>Train Sound</Button>
            </div>
          </div>
          <div className="w-full sm:w-80">
            <div className="rounded border border-gray-800 bg-[#0f0813] p-4">
              <h3 className="text-lg font-semibold text-white">Status</h3>
              <div className="mt-2 text-gray-300">Vibe Ready: {producer.lora_ready ? 'Vibe Read' : '—'}</div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-xl font-semibold text-white sm:text-2xl">Generate with {producer.name}</h3>
          <p className="mt-1 text-gray-400">Create a 60s track in their style.</p>
          <div className="mt-4">
            <GenerationModal producer={producer} />
          </div>
        </div>
      </main>
    </div>
  );
}

