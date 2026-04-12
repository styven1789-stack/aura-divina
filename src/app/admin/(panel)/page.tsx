import { loadDb } from '@/core/infrastructure/persistence/json-store';
import { formatCOP } from '@/lib/money';
import { ORDER_STATUS_LABEL } from '@/core/domain/order';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const db = await loadDb();
  const orders = db.orders;
  const totalRevenue = orders
    .filter((o) => ['CONFIRMED_WHATSAPP', 'SHIPPED', 'DELIVERED'].includes(o.status))
    .reduce((s, o) => s + o.totalCOP, 0);
  const pending = orders.filter((o) => o.status === 'PENDING').length;
  const products = db.products.length;
  const lowStock = db.products.filter((p) => p.variants.some((v) => v.stock < 5)).length;

  const recent = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  return (
    <div>
      <h1 className="h-display text-4xl text-ink-900">Dashboard</h1>
      <p className="text-ink-700/70 mt-1">Vista general de Aura Divina</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Kpi label="Ingresos" value={formatCOP(totalRevenue)} accent="gold" />
        <Kpi label="Pedidos pendientes" value={String(pending)} accent="rose" />
        <Kpi label="Productos activos" value={String(products)} />
        <Kpi label="Stock bajo" value={String(lowStock)} accent="warn" />
      </div>

      <div className="mt-10 card-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl">Pedidos recientes</h2>
          <Link href="/admin/pedidos" className="text-xs uppercase tracking-widest text-gold-600">Ver todos →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-ink-600 text-sm py-8 text-center">Aún no hay pedidos. ¡Pronto llegarán! ✨</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-[10px] uppercase tracking-widest2 text-ink-600 border-b border-rose-150">
              <tr>
                <th className="py-2">Código</th>
                <th>Cliente</th>
                <th>Zona</th>
                <th>Estado</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-b border-rose-150/60">
                  <td className="py-3 font-mono text-gold-600">{o.code}</td>
                  <td>{o.shipping.fullName}</td>
                  <td>{o.shipping.neighborhood}</td>
                  <td><span className="chip">{ORDER_STATUS_LABEL[o.status]}</span></td>
                  <td className="text-right font-semibold">{formatCOP(o.totalCOP)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: 'gold' | 'rose' | 'warn' }) {
  const ring =
    accent === 'gold' ? 'border-gold-500/40 bg-gradient-to-br from-gold-300/20 to-transparent'
    : accent === 'rose' ? 'border-rose-300 bg-gradient-to-br from-rose-200/40 to-transparent'
    : accent === 'warn' ? 'border-amber-300 bg-gradient-to-br from-amber-200/40 to-transparent'
    : 'border-rose-150 bg-white';
  return (
    <div className={`rounded-3xl border p-5 ${ring}`}>
      <p className="text-[10px] uppercase tracking-widest2 text-ink-600">{label}</p>
      <p className="mt-2 text-3xl font-serif text-ink-900">{value}</p>
    </div>
  );
}
