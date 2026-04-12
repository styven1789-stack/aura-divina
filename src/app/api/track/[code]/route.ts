import { NextResponse } from 'next/server';
import { loadDb } from '@/core/infrastructure/persistence/json-store';

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const db = await loadDb();
  const order = db.orders.find((o) => o.code.toUpperCase() === code.toUpperCase());
  if (!order) return NextResponse.json({ message: 'Pedido no encontrado' }, { status: 404 });

  // Vista pública — recortamos datos sensibles del shipping.
  return NextResponse.json({
    code: order.code,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    whatsappConfirmedAt: order.whatsappConfirmedAt,
    items: order.items.map((i) => ({
      name: i.name,
      image: i.image,
      quantity: i.quantity,
      subtotalCOP: i.subtotalCOP,
    })),
    subtotalCOP: order.subtotalCOP,
    shippingCOP: order.shippingCOP,
    totalCOP: order.totalCOP,
    shipping: {
      city: order.shipping.city,
      neighborhood: order.shipping.neighborhood,
      fullName: order.shipping.fullName.split(' ')[0] + ' ' + (order.shipping.fullName.split(' ')[1]?.[0] ?? '') + '.',
    },
  });
}
