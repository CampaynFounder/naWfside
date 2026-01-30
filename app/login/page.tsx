'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Button from '../components/ui/Button.client';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
        redirect: 'manual',
      });
      if (res.status === 302) {
        window.location.href = res.headers.get('Location') || '/dashboard';
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || (res.status === 401 ? 'Invalid password' : 'Login failed'));
    } catch {
      setError('Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#0a0a0f' }}>
      <Header />
      <main className="px-4 py-8 sm:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-[#0f0813] p-6">
          <h1 className="text-xl font-semibold text-white">Producer login</h1>
          <p className="mt-1 text-sm text-gray-400">Sign in with your app password to use the dashboard.</p>
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
            <label className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="App password"
              autoComplete="current-password"
              className="min-h-[48px] w-full rounded-lg border border-gray-700 bg-transparent px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" disabled={loading} className="min-h-[48px] w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
