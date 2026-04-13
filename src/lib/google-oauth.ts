/**
 * Google OAuth 2.0 — flujo Authorization Code, manual con fetch.
 *
 * Docs: https://developers.google.com/identity/openid-connect/openid-connect
 *
 * Para habilitar en dev:
 *  1. Crear OAuth Client en Google Cloud Console (tipo Web).
 *  2. Authorized redirect URI: http://localhost:3000/api/auth/google/callback
 *  3. Setear en .env.local:
 *       GOOGLE_CLIENT_ID=...
 *       GOOGLE_CLIENT_SECRET=...
 *       GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
 */

import { randomBytes } from 'node:crypto';

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GoogleUserInfo {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified: boolean;
}

export function loadGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, clientSecret, redirectUri };
}

export function generateOAuthState(): string {
  return randomBytes(32).toString('hex');
}

export function buildGoogleAuthUrl(cfg: GoogleOAuthConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
    access_type: 'online',
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeGoogleCode(cfg: GoogleOAuthConfig, code: string): Promise<{ accessToken: string; idToken?: string }> {
  const body = new URLSearchParams({
    code,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    redirect_uri: cfg.redirectUri,
    grant_type: 'authorization_code',
  });
  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`Google token exchange failed: ${r.status} ${text}`);
  }
  const data = (await r.json()) as { access_token: string; id_token?: string };
  return { accessToken: data.access_token, idToken: data.id_token };
}

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const r = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) {
    throw new Error(`Google userinfo failed: ${r.status}`);
  }
  const data = (await r.json()) as {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
    email_verified?: boolean;
  };
  return {
    googleId: data.sub,
    email: data.email,
    name: data.name ?? data.email.split('@')[0],
    avatarUrl: data.picture,
    emailVerified: data.email_verified ?? false,
  };
}
