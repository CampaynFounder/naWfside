import Link from 'next/link';
import Image from 'next/image';
import HamburgerMenu from './HamburgerMenu.client';

export default function Header() {
  return (
    <header className="relative w-full flex items-center justify-between gap-3 border-b border-gray-800 bg-transparent px-4 py-3 sm:px-6 sm:py-4" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
      <Link href="/" className="flex shrink-0 items-center touch-target py-2 min-h-[44px]">
        <Image src="/logo.png" alt="naWfside" width={120} height={40} className="max-w-[100px] object-contain sm:max-w-[120px]" style={{ width: 'auto', height: 'auto' }} priority />
      </Link>
      <nav className="hidden md:flex md:items-center md:gap-3 text-gray-300">
        <Link href="/(artist)/marketplace" className="touch-target py-2">Marketplace</Link>
        <Link href="/(producer)/dashboard" className="touch-target py-2">Producer</Link>
      </nav>
      <HamburgerMenu />
    </header>
  );
}

