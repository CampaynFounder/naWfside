import Link from 'next/link';
import Header from '../../components/Header';

export const metadata = {
  title: 'Privacy Policy — naWfside',
  description: 'Privacy Policy for naWfside',
};

export default function Privacy() {
  return (
    <div className="min-h-screen text-gray-200" style={{ backgroundColor: '#0a0a0f' }}>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12" style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom, 0) + 1rem)' }}>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-gray-400 sm:text-base">
          Privacy policy and data practices will be published here. This is a placeholder.
        </p>
        <p className="mt-6 text-sm text-cyan-300">
          <Link href="/" className="inline-flex min-h-[44px] items-center hover:text-cyan-200 touch-target">
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
