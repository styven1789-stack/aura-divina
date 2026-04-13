import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { uow } from '@/core/infrastructure/container';

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const orders = await uow.run(async (tx) => tx.orders.findByUserId(session.userId));
  return NextResponse.json({ orders });
}
