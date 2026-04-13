import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { uow } from '@/core/infrastructure/container';
import { toPublicUser } from '@/core/domain/user';

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ user: null });
  const user = await uow.run(async (tx) => tx.users.findById(session.userId));
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: toPublicUser(user) });
}
