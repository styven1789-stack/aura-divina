import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { accountHandlers } from '@/core/infrastructure/container';
import { toPublicUser } from '@/core/domain/user';
import { DomainError } from '@/core/domain/errors';

export async function PATCH(req: Request) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const body = (await req.json()) as { name?: string; phone?: string };
    const user = await accountHandlers.updateProfile({ userId: session.userId, ...body });
    return NextResponse.json({ user: toPublicUser(user) });
  } catch (err) {
    if (err instanceof DomainError) {
      return NextResponse.json({ code: err.code, message: err.message }, { status: err.httpStatus });
    }
    return NextResponse.json({ message: (err as Error).message }, { status: 500 });
  }
}
