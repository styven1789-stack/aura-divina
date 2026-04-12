import { NextResponse } from 'next/server';
import { ADMIN_EMAIL, ADMIN_PASSWORD, setAdminCookie, signAdminToken } from '@/lib/auth';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 });
  }
  const token = await signAdminToken(email);
  await setAdminCookie(token);
  return NextResponse.json({ ok: true });
}
