import { NextResponse } from 'next/server';
import { createSession, sessionCookieHeader } from '../../../../lib/session';

export async function POST(request: Request) {
  const password = process.env.NAWFSIDE_APP_PASSWORD;
  if (!password) {
    return NextResponse.json({ error: 'Login not configured' }, { status: 503 });
  }
  let submitted: string | undefined;
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => ({}));
    submitted = body.password;
  } else {
    const form = await request.formData().catch(() => null);
    submitted = form?.get('password') as string | undefined;
  }
  if (typeof submitted !== 'string' || submitted !== password) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  try {
    const token = await createSession();
    const secure = request.url.startsWith('https://');
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const redirectTo = from && from.startsWith('/') && !from.startsWith('//') ? from : '/dashboard';
    const headers = new Headers();
    headers.set('Set-Cookie', sessionCookieHeader(token, secure));
    headers.set('Location', redirectTo);
    return new NextResponse(null, { status: 302, headers });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Session error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
