"use client";
import { useRef, useState, useCallback } from 'react';
import CardHeaderWaveInView from './CardHeaderWaveInView.client';
import Link from 'next/link';
import { Monoton, Inter } from 'next/font/google';

const monoton = Monoton({ weight: '400', subsets: ['latin'], display: 'optional' });
const inter = Inter({ subsets: ['latin'], display: 'optional' });

const CARDS = [
  {
    text: 'Stop scrolling when you find the lie.',
    hook: 'glitch',
    hookLabel: 'Loading...',
  },
  {
    text: "Most AI music sounds good. But you can't name not 1 hit AI record.",
    hook: 'waveform',
  },
  {
    text: "Why? Because AI is a historian. It Studies yesterday to GUESS today. Might work for homework, - But Commercial Hits are different.",
    hook: 'telescope',
  },
  {
    text: "Hits aren't made by copying the charts. They're made by breaking them.",
    hook: 'shred',
  },
  {
    text: "Right now, your hard drive is full of the future. Those unreleased beats? That's the gold.",
    hook: 'folders',
  },
  {
    text: 'What if you could train an AI only on you? Not the past. Your next move.',
    hook: 'split',
  },
  {
    text: "Artists don't want a \"Type Beat.\" They want your unreleased energy.",
    hook: 'dm',
  },
  {
    text: "Scale your influence. Keep your soul. Release what doesn't exist yet.",
    hook: 'play-future',
  },
];

function GlitchBar({ label }: { label: string }) {
  return (
    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-black/40">
      <div
        className="h-full animate-pulse rounded-full bg-cyan-500/80"
        style={{ width: '70%' }}
      />
      <p className="mt-1 font-mono text-xs tracking-widest text-gray-500 animate-pulse">
        {label}
      </p>
    </div>
  );
}

function WaveformFlat() {
  return null;
}

function CardHook({ hook, hookLabel }: { hook: string; hookLabel?: string }) {
  if (hook === 'glitch')
    return (
      <div className="rounded border border-white/10 bg-black/20 p-2">
        <p className="font-mono text-sm text-white/90" style={{ textShadow: '0 0 8px rgba(0,255,255,0.5)' }}>
          {hookLabel}
        </p>
        <GlitchBar label={hookLabel || 'Loading...'} />
      </div>
    );
  if (hook === 'waveform') return <WaveformFlat />;
  if (hook === 'telescope')
    return (
      <div className="flex items-center justify-center rounded border border-white/10 bg-black/20 p-4 text-4xl opacity-90">
        🔭
      </div>
    );
  if (hook === 'shred')
    return (
      <div className="rounded border border-red-500/30 bg-black/30 p-2 text-center font-mono text-xs text-red-400/90">
        Top 10 ░░░ ░░░ ░░░
      </div>
    );
  if (hook === 'folders')
    return (
      <div className="flex flex-wrap gap-1">
        {['Unreleased', 'Vault', '2026'].map((l) => (
          <span
            key={l}
            className="rounded border border-cyan-400/50 bg-cyan-500/10 px-2 py-1 font-mono text-xs text-cyan-300"
          >
            {l}
          </span>
        ))}
      </div>
    );
  if (hook === 'split')
    return (
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="rounded border border-gray-500/50 bg-gray-900/50 py-2 text-gray-400">Generic AI</div>
        <div className="rounded border border-cyan-400/50 bg-cyan-500/10 py-2 text-cyan-300">Your Sound</div>
      </div>
    );
  if (hook === 'dm')
    return (
      <div className="rounded border border-white/20 bg-black/30 p-2 font-mono text-xs text-white/90">
        &quot;This sound is crazy, who made this?&quot;
      </div>
    );
  if (hook === 'play-future')
    return (
      <div className="flex items-center gap-2 text-2xl">
        <span className="text-gray-500">▶</span>
        <span className="text-cyan-400">→</span>
        <span className="text-cyan-300">Future</span>
      </div>
    );
  return null;
}

export default function AboutContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMouse({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      className="relative min-h-screen overflow-x-hidden"
      style={{ backgroundColor: '#0a0a0f' }}
    >
      {/* Mobile-first: narrow column on desktop, full width on small screens */}
      <div
        className="relative z-10 mx-auto flex min-h-screen w-full max-w-full flex-col px-4 pt-6 pb-24 sm:px-6 sm:pt-8 sm:pb-12"
        style={{ maxWidth: 'min(100vw, 56.25vh)', backgroundColor: 'transparent', paddingBottom: 'max(6rem, env(safe-area-inset-bottom, 0) + 3rem)' }}
      >
        <p
          className={`mb-8 text-center text-sm uppercase tracking-[0.3em] ${monoton.className}`}
          style={{ color: '#67e8f9' }}
        >
          The AI Music Trap
        </p>

        {CARDS.map((card, i) => (
          <article
            key={i}
            className="relative mb-5 flex min-h-[40vh] flex-col justify-center overflow-hidden rounded-2xl border-2 p-0 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-md transition-transform duration-200 sm:mb-6"
            style={{
              transform: `perspective(800px) rotateY(${(mouse.x - 0.5) * 4}deg) rotateX(${(mouse.y - 0.5) * -4}deg)`,
              backgroundColor: 'rgba(10, 10, 15, 0.95)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            {/* Card header: wave strip only when in view (limits WebGL contexts) */}
            <div
              className="relative w-full shrink-0 overflow-hidden rounded-t-2xl"
              style={{ height: '96px' }}
            >
              <CardHeaderWaveInView />
            </div>
            {/* Hook imagery/text below the wave so it never covers the wave */}
            <div className="shrink-0 px-4 py-3 text-center sm:px-6 sm:py-4">
              <CardHook hook={card.hook} hookLabel={card.hookLabel} />
            </div>
            <div className="flex flex-1 flex-col justify-center p-6 text-center sm:p-8 pt-0 sm:pt-0">
              <p className={`text-base font-semibold leading-snug text-white sm:text-lg md:text-xl ${inter.className}`}>
                {card.text}
              </p>
            </div>
          </article>
        ))}

        <article
          className="relative mb-8 flex min-h-[36vh] flex-col justify-center overflow-hidden rounded-2xl border-2 p-0 text-center shadow-[inset_0_1px_0_rgba(0,255,255,0.08),0_4px_24px_rgba(0,0,0,0.5),0_0_40px_rgba(0,255,255,0.12)] backdrop-blur-md"
          style={{
            transform: `perspective(800px) rotateY(${(mouse.x - 0.5) * 2}deg) rotateX(${(mouse.y - 0.5) * -2}deg)`,
            backgroundColor: 'rgba(10, 10, 15, 0.95)',
            borderColor: 'rgba(34, 211, 238, 0.4)',
          }}
        >
          {/* CTA card header: small wave strip (only when in view) */}
          <div
            className="relative w-full shrink-0 overflow-hidden rounded-t-2xl"
            style={{ height: '80px' }}
          >
            <CardHeaderWaveInView />
          </div>
          <div className="flex flex-1 flex-col justify-center p-6 sm:p-8">
            <p className={`mb-6 text-lg font-semibold leading-snug text-white sm:text-xl md:text-2xl ${inter.className}`}>
              Stop imitating. Start originating.
            </p>
            <Link
              href="#"
              className={`inline-flex min-h-[48px] items-center justify-center rounded-xl bg-cyan-400 px-8 py-4 font-bold text-black shadow-[0_0_24px_rgba(0,255,255,0.5)] transition hover:bg-cyan-300 hover:shadow-[0_0_32px_rgba(0,255,255,0.6)] active:bg-cyan-300 ${inter.className}`}
            >
              Get Early Access — JUUKJUNT
            </Link>
          </div>
        </article>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className={`inline-flex min-h-[44px] items-center justify-center text-sm font-medium ${inter.className}`}
            style={{ color: '#67e8f9' }}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
