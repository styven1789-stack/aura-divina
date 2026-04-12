/**
 * Admin auth — JWT con `jose` (HS256). Cookie httpOnly.
 * En producción esto se sustituye por NextAuth + Postgres + bcrypt.
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.AURA_JWT_SECRET || 'aura-divina-dev-secret-change-me-please-32chars',
);
const COOKIE = 'aura_admin';

export const ADMIN_EMAIL = 'admin@auradivina.co';
export const ADMIN_PASSWORD = 'AuraDivina2026!';

export async function signAdminToken(email: string) {
  return new SignJWT({ role: 'admin', email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret);
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function setAdminCookie(token: string) {
  const c = await cookies();
  c.set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminCookie() {
  const c = await cookies();
  c.delete(COOKIE);
}

export async function getAdminSession() {
  const c = await cookies();
  const token = c.get(COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
