'use client';
import Button from '../../../components/ui/Button.client';
import ProducerCard from '../../../components/ProducerCard';
import { producers } from '../../../lib/mock';
import Header from '../../../components/Header';

export default function Marketplace() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <main className="px-4 py-6 pb-20 sm:p-8 sm:pb-8" style={{ paddingBottom: 'max(5rem, env(safe-area-inset-bottom, 0) + 1.5rem)' }}>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Artist Marketplace</h2>
        <p className="mt-2 text-sm text-gray-300">Browse producers, buy credits, and generate tracks.</p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          {producers.map((p) => (
            <ProducerCard key={p.id} producer={p} />
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center">
          <Button onClick={() => alert('Checkout flow (stub)')} className="w-full min-h-[48px] sm:w-auto">Buy Credits</Button>
        </div>
      </main>
    </div>
  );
}

