import { NextResponse } from 'next/server';
import { registerUserHandler } from '@/core/infrastructure/container';
import { signUserToken, setUserCookie } from '@/lib/auth';
import { toPublicUser } from '@/core/domain/user';
import { DomainError } from '@/core/domain/errors';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email: string; password: string; name: string; phone?: string };
    const { user, claimedOrdersCount } = await registerUserHandler.execute(body);
    const token = await signUserToken({ userId: user.id, email: user.email, name: user.name });
    await setUserCookie(token);
    return NextResponse.json({ user: toPublicUser(user), claimedOrdersCount }, { status: 201 });
  } catch (err) {
    if (err instanceof DomainError) {
      return NextResponse.json({ code: err.code, message: err.message }, { status: err.httpStatus });
    }
    console.error(err);
    return NextResponse.json({ message: (err as Error).message ?? 'Error interno' }, { status: 500 });
  }
}
