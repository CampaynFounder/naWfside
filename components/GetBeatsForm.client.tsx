'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const overlayTransition = { type: 'tween' as const, duration: 0.2, ease: [0.32, 0.72, 0, 1] as const };
const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: -12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 350, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 8,
    transition: { type: 'tween' as const, duration: 0.18, ease: [0.32, 0.72, 0, 1] as const },
  },
};

export default function GetBeatsForm() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('submitting');
    try {
      // TODO: wire to API / waitlist endpoint
      await new Promise((r) => setTimeout(r, 600));
      setStatus('done');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glow-pulse mt-4 flex min-h-[48px] items-center justify-center rounded-xl bg-cyan-400 px-6 py-3 text-base font-semibold text-black transition hover:bg-cyan-300 active:bg-cyan-300"
        style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        Get Beats from my Favorite Producer
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
              aria-hidden
              onClick={() => !status && setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={overlayTransition}
            />
            <motion.div
              key="modal-wrapper"
              className="fixed inset-0 z-40 flex items-center justify-center p-4 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={overlayTransition}
              onClick={() => !status && setOpen(false)}
            >
              <motion.div
                key="modal"
                className="relative w-full max-w-sm flex flex-col rounded-2xl border border-white/20 bg-[#0f0813] p-4 shadow-2xl sm:p-6 overflow-hidden"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                  maxHeight: 'min(85dvh, calc(100vh - 2rem))',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-base font-semibold text-white leading-snug sm:text-lg pr-2">Get Beats from my Favorite Producer</h4>
                <motion.button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-white/10 hover:text-white touch-target"
                  aria-label="Close"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              {status === 'done' ? (
                <p className="mt-4 text-center text-cyan-300">Thanks! We&apos;ll be in touch.</p>
              ) : status === 'error' ? (
                <p className="mt-4 text-center text-red-400">Something went wrong. Try again.</p>
              ) : (
                <form onSubmit={handleSubmit} className="mt-4">
                  <label htmlFor="get-beats-email" className="sr-only">
                    Email
                  </label>
                <input
                  id="get-beats-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="min-h-[48px] w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3 text-base text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-lg bg-cyan-400 py-3 font-semibold text-black transition hover:bg-cyan-300 disabled:opacity-60 active:bg-cyan-300"
                >
                    {status === 'submitting' ? 'Submitting…' : 'Submit'}
                  </button>
                </form>
              )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
