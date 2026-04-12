import { loadDb } from '@/core/infrastructure/persistence/json-store';
import ProductsAdmin from './ProductsAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ active?: string; lowStock?: string; new?: string }>;
}) {
  const params = await searchParams;
  const db = await loadDb();
  return (
    <ProductsAdmin
      initial={db.products}
      initialFilter={params.lowStock === '1' ? 'lowStock' : params.active === '1' ? 'active' : 'all'}
      autoNew={params.new === '1'}
    />
  );
}
