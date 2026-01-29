"use client";
import Button from '../../../components/ui/Button.client';
import { triggerTrain } from '../../../lib/api';
import Header from '../../../components/Header';

export default function ProducerDashboard() {
  async function onTrain() {
    // placeholder call - in production, collect upload URLs first
    const res = await triggerTrain({ producerId: 'local-producer', uploadUrls: [] });
    console.log('train response', res);
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <div className="px-4 py-6 pb-20 sm:p-8 sm:pb-8" style={{ paddingBottom: 'max(5rem, env(safe-area-inset-bottom, 0) + 1.5rem)' }}>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Producer Dashboard</h2>
        <p className="mt-2 text-sm text-gray-300">Upload your audio, monitor Sound training, and view earnings.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button onClick={() => alert('Upload flow not implemented')}>Upload Beats</Button>
          <Button onClick={() => onTrain()}>Train Sound</Button>
        </div>
      </div>
    </div>
  );
}

