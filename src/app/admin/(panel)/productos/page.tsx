import { loadDb } from '@/core/infrastructure/persistence/json-store';
import ProductsAdmin from './ProductsAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const db = await loadDb();
  return <ProductsAdmin initial={db.products} />;
}
