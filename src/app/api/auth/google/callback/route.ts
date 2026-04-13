import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { exchangeGoogleCode, fetchGoogleUserInfo, loadGoogleOAuthConfig } from '@/lib/google-oauth';
import { upsertGoogleUserHandler } from '@/core/infrastructure/container';
import { signUserToken, setUserCookie } from '@/lib/auth';

export async function GET(req: Request) {
  const cfg = loadGoogleOAuthConfig();
  if (!cfg) {
    return NextResponse.redirect(new URL('/cuenta/ingresar?error=google_not_configured', req.url));
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  if (error) {
    return NextResponse.redirect(new URL(`/cuenta/ingresar?error=${encodeURIComponent(error)}`, req.url));
  }
  if (!code || !state) {
    return NextResponse.redirect(new URL('/cuenta/ingresar?error=missing_code', req.url));
  }

  const c = await cookies();
  const savedState = c.get('aura_oauth_state')?.value;
  c.delete('aura_oauth_state');
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(new URL('/cuenta/ingresar?error=state_mismatch', req.url));
  }

  try {
    const { accessToken } = await exchangeGoogleCode(cfg, code);
    const info = await fetchGoogleUserInfo(accessToken);
    const { user } = await upsertGoogleUserHandler.execute({
      googleId: info.googleId,
      email: info.email,
      name: info.name,
      avatarUrl: info.avatarUrl,
    });
    const token = await signUserToken({ userId: user.id, email: user.email, name: user.name });
    await setUserCookie(token);
    return NextResponse.redirect(new URL('/cuenta', req.url));
  } catch (err) {
    console.error('[google oauth callback]', err);
    return NextResponse.redirect(new URL('/cuenta/ingresar?error=google_auth_failed', req.url));
  }
}
