import Link from 'next/link';
import { loadDb } from '@/core/infrastructure/persistence/json-store';
import { formatCOP } from '@/lib/money';
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, type Order } from '@/core/domain/order';
import ClientDate from '@/components/ClientDate';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const db = await loadDb();
  const orders = db.orders;
  const products = db.products;

  // ───────────────────────── KPIs ─────────────────────────
  const billable = orders.filter((o) => ['CONFIRMED_WHATSAPP', 'SHIPPED', 'DELIVERED'].includes(o.status));
  const totalRevenue = billable.reduce((s, o) => s + o.totalCOP, 0);
  const avgTicket = billable.length ? Math.round(totalRevenue / billable.length) : 0;

  const pending = orders.filter((o) => o.status === 'PENDING').length;
  const activeProducts = products.filter((p) => p.active).length;
  const lowStockProducts = products.filter((p) => p.variants.some((v) => v.stock < 5));
  const lowStock = lowStockProducts.length;

  // ─────────────── Series 7 días (sparkline ingresos) ───────────────
  const today = new Date();
  const days: { date: Date; label: string; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push({ date: d, label: d.toLocaleDateString('es-CO', { weekday: 'short' }), revenue: 0 });
  }
  for (const o of billable) {
    const created = new Date(o.createdAt);
    created.setHours(0, 0, 0, 0);
    const slot = days.find((d) => d.date.getTime() === created.getTime());
    if (slot) slot.revenue += o.totalCOP;
  }

  // ─────────────── Top productos por unidades vendidas ───────────────
  const productSales = new Map<string, { name: string; qty: number; revenue: number; image?: string }>();
  for (const o of billable) {
    for (const it of o.items) {
      const cur = productSales.get(it.productId) ?? { name: it.name, qty: 0, revenue: 0, image: it.image };
      cur.qty += it.quantity;
      cur.revenue += it.subtotalCOP;
      productSales.set(it.productId, cur);
    }
  }
  const topProducts = [...productSales.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

  // ─────────────── Recent orders ───────────────
  const recent = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest2 text-gold-600">Panel administrativo</p>
          <h1 className="h-display text-4xl text-ink-900">Dashboard</h1>
          <p className="text-ink-700/70 mt-1 text-sm">
            {orders.length} pedidos · {activeProducts} productos activos · ticket promedio {formatCOP(avgTicket)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/productos?new=1" className="btn-ghost !py-2.5 !px-4 text-sm">+ Producto</Link>
          <Link href="/admin/zonas" className="btn-ghost !py-2.5 !px-4 text-sm">+ Zona</Link>
        </div>
      </div>

      {/* KPI cards — clickables */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          href="/admin/pedidos?status=DELIVERED"
          label="Ingresos confirmados"
          value={formatCOP(totalRevenue)}
          hint={`${billable.length} pedidos facturables`}
          accent="gold"
          icon="💰"
        />
        <KpiCard
          href="/admin/pedidos?status=PENDING"
          label="Pedidos pendientes"
          value={String(pending)}
          hint={pending > 0 ? 'Requieren confirmación WhatsApp' : 'Todo al día ✨'}
          accent="rose"
          icon="📦"
          urgent={pending > 0}
        />
        <KpiCard
          href="/admin/productos?active=1"
          label="Productos activos"
          value={String(activeProducts)}
          hint={`de ${products.length} en catálogo`}
          accent="default"
          icon="💍"
        />
        <KpiCard
          href="/admin/productos?lowStock=1"
          label="Stock bajo"
          value={String(lowStock)}
          hint={lowStock > 0 ? 'Reabastecer pronto' : 'Inventario saludable'}
          accent="warn"
          icon="⚠️"
          urgent={lowStock > 0}
        />
      </div>

      {/* Sparkline + acciones rápidas */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 card-soft p-6">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest2 text-gold-600">Últimos 7 días</p>
              <h2 className="font-serif text-2xl text-ink-900">Ingresos</h2>
            </div>
            <p className="text-sm text-ink-700">
              Total semana: <strong className="text-gold-600">{formatCOP(days.reduce((s, d) => s + d.revenue, 0))}</strong>
            </p>
          </div>
          <Sparkline days={days} />
        </div>

        <div className="card-soft p-6">
          <p className="text-[10px] uppercase tracking-widest2 text-gold-600 mb-1">Top productos</p>
          <h2 className="font-serif text-2xl text-ink-900 mb-4">Más vendidos</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-ink-600">Aún sin ventas confirmadas.</p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center gap-3">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-gold-500/15 text-gold-700 text-xs font-bold">{i + 1}</span>
                  {p.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="w-9 h-9 rounded-xl object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink-900 truncate">{p.name}</p>
                    <p className="text-[11px] text-ink-600">{p.qty} und · {formatCOP(p.revenue)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl text-ink-900">Pedidos recientes</h2>
          <Link href="/admin/pedidos" className="text-xs uppercase tracking-widest text-gold-600 hover:text-gold-700">Ver todos →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-4xl mb-2">✨</div>
            <p className="text-ink-600 text-sm">Aún no hay pedidos. ¡Pronto llegará tu primera venta!</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm">
              <thead className="text-left text-[10px] uppercase tracking-widest2 text-ink-600 border-b border-rose-150">
                <tr>
                  <th className="py-2">Código</th>
                  <th>Cliente</th>
                  <th>Zona</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o: Order) => (
                  <tr key={o.id} className="border-b border-rose-150/60 hover:bg-rose-50/50">
                    <td className="py-3">
                      <Link href={`/admin/pedidos?status=${o.status}`} className="font-mono text-gold-600 hover:underline">{o.code}</Link>
                    </td>
                    <td>{o.shipping.fullName}</td>
                    <td>{o.shipping.neighborhood}</td>
                    <td>
                      <span className={`inline-block text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border ${ORDER_STATUS_COLOR[o.status]}`}>
                        {ORDER_STATUS_LABEL[o.status]}
                      </span>
                    </td>
                    <td className="text-xs text-ink-600"><ClientDate iso={o.createdAt} /></td>
                    <td className="text-right font-semibold">{formatCOP(o.totalCOP)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────── Componentes ───────────────────

function KpiCard({
  href, label, value, hint, accent, icon, urgent,
}: {
  href: string;
  label: string;
  value: string;
  hint: string;
  accent: 'gold' | 'rose' | 'warn' | 'default';
  icon: string;
  urgent?: boolean;
}) {
  const ring =
    accent === 'gold'  ? 'border-gold-500/40 bg-gradient-to-br from-gold-300/25 via-white to-transparent hover:from-gold-300/40'
    : accent === 'rose' ? 'border-rose-300 bg-gradient-to-br from-rose-200/40 via-white to-transparent hover:from-rose-200/60'
    : accent === 'warn' ? 'border-amber-300 bg-gradient-to-br from-amber-200/40 via-white to-transparent hover:from-amber-200/60'
    : 'border-rose-150 bg-white hover:border-gold-400';
  return (
    <Link
      href={href}
      className={`group relative rounded-3xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft ${ring}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest2 text-ink-600">{label}</p>
          <p className="mt-2 text-3xl font-serif text-ink-900 leading-none">{value}</p>
          <p className="text-[11px] text-ink-700/70 mt-2">{hint}</p>
        </div>
        <div className={`grid place-items-center w-10 h-10 rounded-2xl bg-white/70 border border-rose-150 text-xl ${urgent ? 'animate-pulse' : ''}`}>
          {icon}
        </div>
      </div>
      <span className="absolute bottom-3 right-4 text-[10px] uppercase tracking-widest text-ink-600 opacity-0 group-hover:opacity-100 transition">
        Ver →
      </span>
    </Link>
  );
}

function Sparkline({ days }: { days: { label: string; revenue: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.revenue));
  const W = 100;
  const H = 36;
  const step = W / (days.length - 1 || 1);
  const points = days.map((d, i) => {
    const x = i * step;
    const y = H - (d.revenue / max) * (H - 4) - 2;
    return { x, y, ...d };
  });
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  const area = `${path} L ${W} ${H} L 0 ${H} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32" preserveAspectRatio="none">
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a96e" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#c9a96e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#spark-fill)" />
        <path d={path} stroke="#c9a96e" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.6" fill="#a8884f" />
        ))}
      </svg>
      <div className="grid grid-cols-7 mt-2 text-[10px] uppercase tracking-widest text-ink-600">
        {days.map((d, i) => (
          <div key={i} className="text-center">
            <div>{d.label}</div>
            <div className="text-ink-900 font-medium normal-case tracking-normal text-[10px] mt-0.5">
              {d.revenue > 0 ? `$${(d.revenue / 1000).toFixed(0)}k` : '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
