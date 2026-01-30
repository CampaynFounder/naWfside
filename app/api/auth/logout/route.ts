import { NextResponse } from 'next/server';
import { clearSessionCookieHeader } from '../../../../lib/session';

export async function POST(request: Request) {
  const secure = request.url.startsWith('https://');
  const headers = new Headers();
  headers.set('Set-Cookie', clearSessionCookieHeader(secure));
  headers.set('Location', '/login');
  return new NextResponse(null, { status: 302, headers });
}

export async function GET(request: Request) {
  const secure = request.url.startsWith('https://');
  const headers = new Headers();
  headers.set('Set-Cookie', clearSessionCookieHeader(secure));
  headers.set('Location', '/login');
  return new NextResponse(null, { status: 302, headers });
}
