import Link from 'next/link';

export default function Header({ balance = 0 }: { balance?: number }) {
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between bg-transparent border-b border-gray-800">
      <div className="flex items-center space-x-4">
        <Link href="/">
          <span className="text-2xl font-bold text-white">naWfside</span>
        </Link>
        <nav className="hidden md:flex space-x-3 text-gray-300">
          <Link href="/(artist)/marketplace">Marketplace</Link>
          <Link href="/(producer)/dashboard">Producer</Link>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-300">
          Credits: <span className="font-semibold text-white">{balance}</span>
        </div>
        <button className="px-3 py-1 bg-[#6b21a8] rounded text-white text-sm">Sign in</button>
      </div>
    </header>
  );
}

