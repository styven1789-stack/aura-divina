/**
 * Auth — JWT con `jose` (HS256) + cookies httpOnly.
 * Dos roles separados por `aud` claim:
 *  - admin: cookie `aura_admin`, 8h, aud="aura-admin"
 *  - user:  cookie `aura_user`,  30d, aud="aura-user"
 *
 * El mismo secret firma ambos, pero verifyToken exige el aud esperado
 * para que un token de cliente no pueda usarse como admin y viceversa.
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.AURA_JWT_SECRET || 'aura-divina-dev-secret-change-me-please-32chars',
);

const ADMIN_COOKIE = 'aura_admin';
const USER_COOKIE = 'aura_user';
const ADMIN_AUD = 'aura-admin';
const USER_AUD = 'aura-user';

export const ADMIN_EMAIL = 'admin@auradivina.co';
export const ADMIN_PASSWORD = 'AuraDivina2026!';

// #region admin

export async function signAdminToken(email: string) {
  return new SignJWT({ role: 'admin', email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setAudience(ADMIN_AUD)
    .setExpirationTime('8h')
    .sign(secret);
}

export async function verifyAdminToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { audience: ADMIN_AUD });
    return payload;
  } catch {
    return null;
  }
}

export async function setAdminCookie(token: string) {
  const c = await cookies();
  c.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminCookie() {
  const c = await cookies();
  c.delete(ADMIN_COOKIE);
}

export async function getAdminSession() {
  const c = await cookies();
  const token = c.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

// #endregion

// #region user

export interface UserSession {
  userId: string;
  email: string;
  name: string;
}

export async function signUserToken(payload: UserSession) {
  return new SignJWT({ ...payload, role: 'user' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setAudience(USER_AUD)
    .setExpirationTime('30d')
    .sign(secret);
}

export async function verifyUserToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret, { audience: USER_AUD });
    if (typeof payload.userId !== 'string' || typeof payload.email !== 'string' || typeof payload.name !== 'string') {
      return null;
    }
    return { userId: payload.userId, email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

export async function setUserCookie(token: string) {
  const c = await cookies();
  c.set(USER_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearUserCookie() {
  const c = await cookies();
  c.delete(USER_COOKIE);
}

export async function getUserSession(): Promise<UserSession | null> {
  const c = await cookies();
  const token = c.get(USER_COOKIE)?.value;
  if (!token) return null;
  return verifyUserToken(token);
}

// #endregion
