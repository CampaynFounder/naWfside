import Link from 'next/link';

export default function ProducerCard({ producer }: any) {
  return (
    <article className="bg-[#0f0813] p-4 rounded-xl shadow-md border border-gray-800 overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-white">{producer.name}</h3>
          <p className="mt-1 text-sm text-gray-300 line-clamp-2">{producer.bio}</p>
          <p className="mt-1 text-xs text-gray-500">{producer.tier}</p>
        </div>
        <Link
          href={`/producer/${producer.id}`}
          className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg bg-[#6b21a8] px-4 py-2 text-sm font-medium text-white hover:bg-[#7c3aed] touch-target sm:mt-0"
        >
          View
        </Link>
      </div>
    </article>
  );
}

