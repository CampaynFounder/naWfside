'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import { producers as initialProducers } from '../../lib/mock';

const CARD_ASPECT = 9 / 16; // portrait 9:16
const BATCH_SIZE = 6;

export default function ProducersPage() {
  const [producers, setProducers] = useState(initialProducers);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(() => {
    setLoading(true);
    // Simulate loading more: append another batch (duplicate for infinite scroll demo)
    setTimeout(() => {
      setProducers((prev) => [
        ...prev,
        ...initialProducers.map((p, i) => ({ ...p, id: `${p.id}_page${prev.length + i}`, profileId: p.id })),
      ]);
      setLoading(false);
    }, 400);
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading) loadMore();
      },
      { rootMargin: '200px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, loading]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      <Header />
      <main className="mx-auto w-full max-w-md px-4 py-6 pb-24 sm:pb-12" style={{ paddingBottom: 'max(6rem, env(safe-area-inset-bottom, 0) + 1.5rem)' }}>
        <h1 className="text-xl font-semibold text-white sm:text-2xl">Producers</h1>
        <p className="mt-1 text-sm text-gray-400">Swipe to explore. Tap a card to view.</p>

        <div className="mt-6 flex flex-col gap-5">
          {producers.map((producer) => (
            <Link
              key={producer.id}
              href={`/producer/${'profileId' in producer ? producer.profileId : producer.id}`}
              className="block w-full overflow-hidden rounded-2xl border border-white/15 bg-[#0f0813] shadow-lg active:opacity-95"
              style={{ aspectRatio: String(CARD_ASPECT) }}
            >
              <div className="flex h-full flex-col justify-between p-5">
                <div>
                  <h2 className="text-lg font-semibold text-white sm:text-xl">{producer.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-400">{producer.bio}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{producer.tier}</span>
                  <span className="text-sm font-medium text-cyan-400">View →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div ref={sentinelRef} className="h-8 flex items-center justify-center py-6">
          {loading && <span className="text-sm text-gray-500">Loading...</span>}
        </div>
      </main>
    </div>
  );
}
