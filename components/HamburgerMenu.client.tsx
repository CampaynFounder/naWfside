"use client";
import { useState } from 'react';
import Link from 'next/link';

const fontDisplay = 'font-display';

const LOGGED_OUT_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/dashboard', label: 'Producer' },
  { href: '/blog', label: 'Blog' },
  { href: '/terms', label: 'Terms' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/login', label: 'Sign in' },
];

export default function HamburgerMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute right-2 top-2 z-20 sm:right-4 sm:top-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 active:bg-white/15 ${fontDisplay}`}
        aria-label="Menu"
        aria-expanded={open}
      >
        <svg className="h-7 w-7 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" aria-hidden onClick={() => setOpen(false)} />
          <nav
            className={`absolute right-0 top-full z-20 mt-2 w-[calc(100vw-1.5rem)] max-w-[20rem] rounded-xl border border-gray-800 bg-[#0f0813] py-2 shadow-xl sm:w-56 ${fontDisplay}`}
            aria-label="Logged out navigation"
          >
            {LOGGED_OUT_LINKS.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="flex min-h-[48px] items-center px-4 text-gray-200 hover:bg-white/10 hover:text-white active:bg-white/15"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
