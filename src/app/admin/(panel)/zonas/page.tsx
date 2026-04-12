import { loadDb } from '@/core/infrastructure/persistence/json-store';
import ZonesAdmin from './ZonesAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminZonesPage() {
  const db = await loadDb();
  return <ZonesAdmin initial={db.coverageZones} />;
}
