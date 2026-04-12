import { loadDb } from '@/core/infrastructure/persistence/json-store';
import OrdersAdmin from './OrdersAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const db = await loadDb();
  const orders = [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <OrdersAdmin initial={orders} />;
}
