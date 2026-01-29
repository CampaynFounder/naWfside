'use client';
import Header from '../../../components/Header';
import { producers } from '../../../lib/mock';
import GenerationModal from '../../../components/GenerationModal.client';
import Button from '../../../components/ui/Button.client';

export default function ProducerProfile({ params }: any) {
  const producer = producers.find((p) => p.id === params.producerId);
  if (!producer) return <div className="p-8">Producer not found</div>;

  return (
    <div>
      <Header balance={12} />
      <main className="p-8">
        <div className="flex items-start space-x-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold">{producer.name}</h1>
            <p className="mt-4 text-gray-300">{producer.bio}</p>
            <div className="mt-6">
              <Button onClick={() => alert('Open upload modal (stub)')}>Upload Beats</Button>
              <Button className="ml-3" onClick={() => alert('Train LoRA (stub)')}>Train LoRA</Button>
            </div>
          </div>
          <div className="w-80">
            <div className="bg-[#0f0813] p-4 rounded border border-gray-800">
              <h3 className="text-lg font-semibold">Status</h3>
              <div className="mt-2 text-gray-300">LoRA Ready: {producer.lora_ready ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-2xl font-semibold">Generate with {producer.name}</h3>
          <p className="text-gray-400">Create a 60s track in their style.</p>
          <div className="mt-4">
            <GenerationModal producer={producer} />
          </div>
        </div>
      </main>
    </div>
  );
}

