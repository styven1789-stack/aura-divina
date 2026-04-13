import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { accountHandlers } from '@/core/infrastructure/container';
import { toPublicUser, type SavedAddress } from '@/core/domain/user';
import { DomainError } from '@/core/domain/errors';

export async function POST(req: Request) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const data = (await req.json()) as Omit<SavedAddress, 'id' | 'isDefault'> & { isDefault?: boolean };
    const user = await accountHandlers.addAddress({ userId: session.userId, data });
    return NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
  } catch (err) {
    if (err instanceof DomainError) {
      return NextResponse.json({ code: err.code, message: err.message }, { status: err.httpStatus });
    }
    return NextResponse.json({ message: (err as Error).message }, { status: 500 });
  }
}
