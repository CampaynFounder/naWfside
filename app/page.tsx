import HomeCanvas from '../components/HomeCanvas.client';
import HamburgerMenu from '../components/HamburgerMenu.client';
import GetBeatsForm from '../components/GetBeatsForm.client';
import Image from 'next/image';
import Link from 'next/link';

const WAVE_TOP_OFFSET = 380; // px reserved at top for logo + headings + button (no wave)

export default function Home() {
  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ minHeight: '100dvh', height: '100vh', backgroundColor: '#050505' }}
    >
      {/* Top strip: logo + headings only (no wave), mobile-first with safe-area */}
      <div
        className="absolute left-0 right-0 top-0 z-10 flex flex-col items-center px-4 pt-6 sm:pt-8"
        style={{ height: WAVE_TOP_OFFSET, paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
      >
        <div className="flex w-full justify-center drop-shadow-[0_0_20px_rgba(0,0,0,0.9)] [filter:drop-shadow(0_2px_8px_rgba(0,0,0,0.8))] pointer-events-none">
          <Image src="/logo.png" alt="naWfside" width={360} height={140} className="h-auto w-auto max-w-[min(85vw,280px)] object-contain sm:max-w-[360px]" style={{ width: 'auto', height: 'auto' }} priority />
        </div>
        <h1
          className="mt-6 max-w-3xl text-center text-2xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] sm:text-3xl md:text-4xl lg:text-5xl"
          style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
          Stop Recording on Generic &quot;AI Type Beats&quot;
        </h1>
        <h2
          className="mt-4 max-w-2xl text-center text-lg font-normal leading-snug text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:text-xl md:text-2xl"
          style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
          AI{' '}
          <Link href="/about" className="font-semibold text-cyan-400 underline decoration-cyan-400/80 underline-offset-2 hover:text-cyan-300 hover:decoration-cyan-300">
            Won&apos;t
          </Link>
          {' '}Make Tommorows Hit Records.
        </h2>
        <h3
          className="mt-3 max-w-2xl text-center text-base font-normal leading-snug text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:text-lg md:text-xl"
          style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
        >
          JuukJunt Partnered with Your Favorite{' '}
          <Link href="/producers" className="font-semibold text-cyan-400 underline decoration-cyan-400/80 underline-offset-2 hover:text-cyan-300 hover:decoration-cyan-300">
            Producers
          </Link>
          {' '}To Train on Tomorrows Unreleased Hits Today.
        </h3>
        <GetBeatsForm />
      </div>
      {/* Wave starts below the header strip */}
      <div
        className="absolute left-0 right-0 bottom-0 z-0"
        style={{ top: WAVE_TOP_OFFSET }}
      >
        <HomeCanvas />
      </div>
      <HamburgerMenu />
    </main>
  );
}

