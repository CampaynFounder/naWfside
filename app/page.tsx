import HomeCanvas from '../components/HomeCanvas.client';

export default function Home() {
  return (
    <main className="h-screen w-screen">
      <HomeCanvas />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold">naWfside</h1>
          <p className="mt-2 text-sm text-gray-300">AI Record Label & Marketplace — MVP scaffold</p>
        </div>
      </div>
    </main>
  );
}

