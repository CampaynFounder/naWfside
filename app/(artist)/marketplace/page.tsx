'use client';
import Button from '../../../components/ui/Button.client';
import ProducerCard from '../../../components/ProducerCard';
import { producers } from '../../../lib/mock';
import Header from '../../../components/Header';

export default function Marketplace() {
  return (
    <div>
      <Header balance={12} />
      <main className="p-8">
        <h2 className="text-3xl font-bold">Artist Marketplace</h2>
        <p className="mt-2 text-sm text-gray-300">Browse producers, buy credits, and generate tracks.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {producers.map((p) => (
            <ProducerCard key={p.id} producer={p} />
          ))}
        </div>

        <div className="mt-8">
          <Button onClick={() => alert('Checkout flow (stub)')}>Buy Credits</Button>
        </div>
      </main>
    </div>
  );
}

