import Link from 'next/link';

export default function ProducerCard({ producer }: any) {
  return (
    <div className="bg-[#0f0813] p-4 rounded shadow-md border border-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{producer.name}</h3>
          <p className="text-sm text-gray-300">{producer.bio}</p>
        </div>
        <div className="text-sm text-gray-400">
          <div>{producer.tier}</div>
          <div className="mt-2">
            <Link href={`/producer/${producer.id}`}>
              <button className="px-3 py-1 bg-[#6b21a8] rounded text-white text-sm">View</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

