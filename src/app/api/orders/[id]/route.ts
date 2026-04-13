import { NextResponse } from 'next/server';
import { withWriteLock } from '@/core/infrastructure/persistence/json-store';
import { getAdminSession } from '@/lib/auth';
import {
  canTransitionOrderStatus,
  ORDER_STATUS_LABEL,
  type OrderStatus,
} from '@/core/domain/order';

const VALID: OrderStatus[] = ['PENDING', 'CONFIRMED_WHATSAPP', 'SHIPPED', 'DELIVERED', 'CANCELED'];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { status } = (await req.json()) as { status: OrderStatus };
  if (!VALID.includes(status)) {
    return NextResponse.json({ message: 'Estado inválido' }, { status: 400 });
  }

  const result: { code: number; message: string } = { code: 200, message: 'ok' };
  await withWriteLock(async (db) => {
    const order = db.orders.find((o) => o.id === id);
    if (!order) {
      result.code = 404;
      result.message = 'Pedido no encontrado';
      return;
    }
    if (!canTransitionOrderStatus(order.status, status)) {
      result.code = 409;
      result.message = `No se puede pasar de ${ORDER_STATUS_LABEL[order.status]} a ${ORDER_STATUS_LABEL[status]}`;
      return;
    }
    if (order.status === status) return;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (status === 'CONFIRMED_WHATSAPP') order.whatsappConfirmedAt = order.updatedAt;
  });

  if (result.code !== 200) return NextResponse.json({ message: result.message }, { status: result.code });
  return NextResponse.json({ ok: true });
}
