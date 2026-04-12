import { NextResponse } from 'next/server';
import { withWriteLock } from '@/core/infrastructure/persistence/json-store';
import { getAdminSession } from '@/lib/auth';
import type { OrderStatus } from '@/core/domain/order';

const VALID: OrderStatus[] = ['PENDING', 'CONFIRMED_WHATSAPP', 'SHIPPED', 'DELIVERED', 'CANCELED'];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { status } = (await req.json()) as { status: OrderStatus };
  if (!VALID.includes(status)) {
    return NextResponse.json({ message: 'Estado inválido' }, { status: 400 });
  }
  await withWriteLock(async (db) => {
    const order = db.orders.find((o) => o.id === id);
    if (!order) return;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (status === 'CONFIRMED_WHATSAPP') order.whatsappConfirmedAt = order.updatedAt;
  });
  return NextResponse.json({ ok: true });
}
