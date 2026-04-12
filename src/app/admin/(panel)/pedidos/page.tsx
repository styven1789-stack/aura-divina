import { loadDb } from '@/core/infrastructure/persistence/json-store';
import OrdersAdmin from './OrdersAdmin';
import type { OrderStatus } from '@/core/domain/order';

export const dynamic = 'force-dynamic';

const VALID: OrderStatus[] = ['PENDING', 'CONFIRMED_WHATSAPP', 'SHIPPED', 'DELIVERED', 'CANCELED'];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const initialStatus = params.status && VALID.includes(params.status as OrderStatus)
    ? (params.status as OrderStatus)
    : 'all';

  const db = await loadDb();
  const orders = [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <OrdersAdmin initial={orders} initialStatus={initialStatus} />;
}
