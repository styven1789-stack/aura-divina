'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, type Order, type OrderStatus } from '@/core/domain/order';
import { formatCOP } from '@/lib/money';
import ClientDate from '@/components/ClientDate';
import { useToast } from '@/components/ui/Toast';
import { useEscape } from '@/components/ui/Toast';

const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED_WHATSAPP', 'SHIPPED', 'DELIVERED', 'CANCELED'];

export default function OrdersAdmin({ initial, initialStatus = 'all' }: { initial: Order[]; initialStatus?: OrderStatus | 'all' }) {
  const router = useRouter();
  const toast = useToast();
  const [orders, setOrders] = useState(initial);
  const [filter, setFilter] = useState<OrderStatus | 'all'>(initialStatus);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);

  useEscape(!!selected, () => setSelected(null));

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== 'all' && o.status !== filter) return false;
      if (!q) return true;
      return (
        o.code.toLowerCase().includes(q) ||
        o.shipping.fullName.toLowerCase().includes(q) ||
        o.shipping.phone.includes(q) ||
        o.shipping.neighborhood.toLowerCase().includes(q)
      );
    });
  }, [orders, filter, search]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      const r = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) throw new Error('No se pudo actualizar');
      setOrders((os) => os.map((o) => (o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o)));
      if (selected?.id === id) setSelected({ ...selected, status });
      router.refresh();
      toast.success('Pedido actualizado', `Nuevo estado: ${ORDER_STATUS_LABEL[status]}`);
    } catch (err) {
      toast.error('Error', (err as Error).message);
    }
  };

  return (
    <div>
      <h1 className="h-display text-4xl text-ink-900 mb-2">Pedidos</h1>
      <p className="text-ink-700/70 mb-6">{orders.length} pedidos en total · {visible.length} mostrados</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, cliente, teléfono o barrio…"
            className="input-aura !pl-11"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-600">
            <SearchIcon />
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>Todos · {orders.length}</FilterChip>
        {STATUSES.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          return (
            <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
              {ORDER_STATUS_LABEL[s]}{count > 0 ? ` · ${count}` : ''}
            </FilterChip>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="card-soft p-16 text-center text-ink-600">
          Aún no hay pedidos en este estado.
        </div>
      ) : (
        <div className="card-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-rose-100/50 text-left text-[10px] uppercase tracking-widest2 text-ink-700">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th>Cliente</th>
                <th>Tel</th>
                <th>Zona</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th className="text-right pr-4">Total</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => (
                <tr key={o.id} onClick={() => setSelected(o)} className="border-t border-rose-150/60 hover:bg-rose-50/50 cursor-pointer">
                  <td className="px-4 py-3 font-mono text-gold-600 font-semibold">{o.code}</td>
                  <td>{o.shipping.fullName}</td>
                  <td className="font-mono text-xs">{o.shipping.phone}</td>
                  <td>{o.shipping.neighborhood}</td>
                  <td>
                    <span className={`inline-block text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border ${ORDER_STATUS_COLOR[o.status]}`}>
                      {ORDER_STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td className="text-xs text-ink-600"><ClientDate iso={o.createdAt} /></td>
                  <td className="text-right pr-4 font-semibold">{formatCOP(o.totalCOP)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-rose-50 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest2 text-gold-600">Pedido</p>
                <h2 className="font-serif text-3xl text-ink-900">{selected.code}</h2>
                <p className="text-xs text-ink-600 mt-1"><ClientDate iso={selected.createdAt} /></p>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost !py-2 !px-4">×</button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <Info label="Cliente" value={selected.shipping.fullName} />
              <Info label="Celular" value={selected.shipping.phone} />
              <Info label="Ciudad" value={selected.shipping.city} />
              <Info label="Barrio" value={selected.shipping.neighborhood} />
              <Info label="Dirección" value={selected.shipping.addressLine1} />
              <Info label="Referencia" value={selected.shipping.reference || '—'} />
              {selected.shipping.notes && <Info label="Notas" value={selected.shipping.notes} />}
            </div>

            <div className="gold-divider my-6" />

            <h3 className="font-serif text-xl mb-3">Productos</h3>
            <div className="space-y-2">
              {selected.items.map((it, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-white/70 rounded-2xl">
                  {it.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{it.name}</p>
                    <p className="text-xs text-ink-600">×{it.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatCOP(it.subtotalCOP)}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-1.5 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatCOP(selected.subtotalCOP)}</span></div>
              <div className="flex justify-between"><span>Envío</span><span>{formatCOP(selected.shippingCOP)}</span></div>
              <div className="flex justify-between text-lg font-serif text-ink-900 pt-2 border-t border-rose-150"><span>Total</span><span>{formatCOP(selected.totalCOP)}</span></div>
            </div>

            <div className="mt-6">
              <p className="label-aura">Cambiar estado</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    className={`text-xs uppercase tracking-widest px-3 py-2 rounded-full border ${
                      selected.status === s ? 'bg-ink-900 text-white border-ink-900' : 'bg-white border-rose-150 hover:border-gold-500'
                    }`}
                  >
                    {ORDER_STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <a
                href={`https://wa.me/57${selected.shipping.phone}?text=${encodeURIComponent(`Hola ${selected.shipping.fullName}! Soy de Aura Divina ✨ Confirmamos tu pedido ${selected.code} por ${formatCOP(selected.totalCOP)}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="btn-gold flex-1"
              >
                Escribir al cliente
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        'text-xs uppercase tracking-widest px-4 py-2 rounded-full border transition ' +
        (active ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-ink-700 border-rose-150 hover:border-gold-500')
      }
    >
      {children}
    </button>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest2 text-ink-600">{label}</p>
      <p className="text-ink-900">{value}</p>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}
