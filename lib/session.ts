import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'nawfside_session';
const MAX_AGE_SEC = 7 * 24 * 60 * 60; // 7 days

function getSecret(): Uint8Array {
  const raw = process.env.SESSION_SECRET || process.env.NAWFSIDE_APP_PASSWORD || '';
  const bytes = new TextEncoder().encode(raw);
  if (bytes.length >= 32) return bytes;
  const key = new Uint8Array(32);
  key.set(bytes);
  return key;
}

export async function createSession(): Promise<string> {
  const secret = getSecret();
  const raw = process.env.SESSION_SECRET || process.env.NAWFSIDE_APP_PASSWORD || '';
  if (!raw || raw.length < 8) {
    throw new Error('SESSION_SECRET or NAWFSIDE_APP_PASSWORD must be set and at least 8 characters');
  }
  return new SignJWT({ sub: 'producer' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(secret);
}

export async function verifySession(token: string): Promise<boolean> {
  const raw = process.env.SESSION_SECRET || process.env.NAWFSIDE_APP_PASSWORD || '';
  if (!raw || raw.length < 8) return false;
  const secret = getSecret();
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export function getSessionTokenFromRequest(request: Request): string | null {
  const cookie = request.headers.get('cookie');
  if (!cookie) return null;
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1].trim()) : null;
}

export async function isAuthenticated(request: Request): Promise<boolean> {
  const token = getSessionTokenFromRequest(request);
  if (!token) return false;
  return verifySession(token);
}

export function sessionCookieHeader(token: string, secure: boolean): string {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${MAX_AGE_SEC}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function clearSessionCookieHeader(secure: boolean): string {
  const parts = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export { COOKIE_NAME };
