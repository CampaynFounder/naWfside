import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthenticated } from './lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect producer dashboard: require session
  if (pathname === '/dashboard') {
    const ok = await isAuthenticated(request);
    if (!ok) {
      const login = new URL('/login', request.url);
      login.searchParams.set('from', pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard'],
};
