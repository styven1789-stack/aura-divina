import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { buildGoogleAuthUrl, generateOAuthState, loadGoogleOAuthConfig } from '@/lib/google-oauth';

export async function GET() {
  const cfg = loadGoogleOAuthConfig();
  if (!cfg) {
    return NextResponse.json(
      { message: 'Google Sign-In no está configurado. Revisa las variables GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_REDIRECT_URI en .env.local.' },
      { status: 503 },
    );
  }
  const state = generateOAuthState();
  const c = await cookies();
  c.set('aura_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 5,
  });
  const url = buildGoogleAuthUrl(cfg, state);
  return NextResponse.redirect(url);
}
