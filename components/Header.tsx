import Link from 'next/link';
import Image from 'next/image';
import HamburgerMenu from './HamburgerMenu.client';
import HeaderTitle from './HeaderTitle.client';

export default function Header() {
  return (
    <header className="relative w-full flex items-center justify-between border-b border-gray-800 bg-transparent px-4 py-3 sm:px-6 sm:py-4" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
      <Link href="/" className="flex shrink-0 items-center touch-target py-2 min-h-[44px]">
        <Image src="/logo.png" alt="naWfside" width={120} height={40} className="max-w-[100px] object-contain sm:max-w-[120px]" style={{ width: 'auto', height: 'auto' }} priority />
      </Link>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <HeaderTitle />
      </div>
      <div className="relative z-10 flex shrink-0">
        <HamburgerMenu />
      </div>
    </header>
  );
}

