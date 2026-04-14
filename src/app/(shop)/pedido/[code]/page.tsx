import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { loadDb } from '@/core/infrastructure/persistence/json-store';
import { ORDER_STATUS_LABEL, type OrderStatus } from '@/core/domain/order';
import { formatCOP } from '@/lib/money';
import ClientDate from '@/components/ClientDate';

export const dynamic = 'force-dynamic';

const TIMELINE: { status: OrderStatus; label: string; sub: string; emoji: string }[] = [
  { status: 'PENDING',            label: 'Pedido recibido',         sub: 'Estamos esperando tu confirmación',     emoji: '✨' },
  { status: 'CONFIRMED_WHATSAPP', label: 'Confirmado por WhatsApp', sub: 'Estamos preparando tu pedido',          emoji: '💬' },
  { status: 'SHIPPED',            label: 'En camino',               sub: 'Tu pedido va rumbo a tu dirección',     emoji: '🛵' },
  { status: 'DELIVERED',          label: 'Entregado',               sub: '¡Esperamos que lo disfrutes!',          emoji: '🎉' },
];

export default async function TrackOrderPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const db = await loadDb();
  const order = db.orders.find((o) => o.code.toUpperCase() === code.toUpperCase());
  if (!order) notFound();

  const currentIdx = order.status === 'CANCELED'
    ? -1
    : TIMELINE.findIndex((t) => t.status === order.status);

  return (
    <section className="container-aura py-12 max-w-3xl">
      <Link href="/pedido" className="text-xs uppercase tracking-widest text-ink-600 hover:text-gold-600">← Buscar otro pedido</Link>

      <div className="mt-4 card-soft p-5 sm:p-8">
        <div className="flex flex-col xs:flex-row items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-fluid-xs uppercase tracking-widest2 text-gold-600">Tu pedido</p>
            <h1 className="h-display text-fluid-4xl text-ink-900 font-mono break-all">{order.code}</h1>
            <p className="text-fluid-sm text-ink-600 mt-1">
              Creado <ClientDate iso={order.createdAt} />
            </p>
          </div>
          <div className="xs:text-right">
            <p className="text-fluid-xs uppercase tracking-widest text-ink-600">Total contraentrega</p>
            <p className="text-fluid-3xl font-serif text-gold-600">{formatCOP(order.totalCOP)}</p>
          </div>
        </div>

        <div className="gold-divider my-8" />

        {/* Timeline */}
        {order.status === 'CANCELED' ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">😔</div>
            <h2 className="font-serif text-2xl text-rose-700">Pedido cancelado</h2>
            <p className="text-sm text-ink-600 mt-2">Si crees que es un error, contáctanos por WhatsApp.</p>
          </div>
        ) : (
          <ol className="relative space-y-6">
            <span className="absolute left-[14px] top-3 bottom-3 w-px bg-rose-150" aria-hidden />
            {TIMELINE.map((step, i) => {
              const done = i <= currentIdx;
              const current = i === currentIdx;
              return (
                <li key={step.status} className="relative flex items-start gap-4">
                  <div
                    className={
                      'relative grid place-items-center w-7 h-7 rounded-full border-2 shrink-0 ' +
                      (done
                        ? 'bg-gold-500 border-gold-500 text-white'
                        : 'bg-white border-rose-150 text-ink-600')
                    }
                  >
                    {done ? '✓' : i + 1}
                    {current && <span className="absolute inset-0 rounded-full ring-4 ring-gold-300/40 animate-pulse" />}
                  </div>
                  <div className="flex-1 -mt-0.5">
                    <p className={'font-serif text-fluid-lg ' + (done ? 'text-ink-900' : 'text-ink-600')}>
                      {step.emoji} {step.label}
                    </p>
                    <p className="text-fluid-xs text-ink-600">{step.sub}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {/* Productos */}
        <div className="mt-10">
          <h3 className="text-xs uppercase tracking-widest2 text-gold-600 mb-3">Productos</h3>
          <div className="space-y-2">
            {order.items.map((it, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/70 rounded-2xl border border-rose-150">
                {it.image && (
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-rose-100 shrink-0">
                    <Image src={it.image} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-900">{it.name}</p>
                  <p className="text-fluid-xs text-ink-600">×{it.quantity}</p>
                </div>
                <p className="text-sm font-semibold">{formatCOP(it.subtotalCOP)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen + entrega */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-fluid-sm">
          <div className="card-soft p-4">
            <p className="text-fluid-xs uppercase tracking-widest2 text-ink-600">Entrega</p>
            <p className="mt-1 text-ink-900">{order.shipping.fullName}</p>
            <p className="text-ink-700">{order.shipping.neighborhood}, {order.shipping.city}</p>
          </div>
          <div className="card-soft p-4">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCOP(order.subtotalCOP)}</span></div>
            <div className="flex justify-between"><span>Envío</span><span>{formatCOP(order.shippingCOP)}</span></div>
            <div className="flex justify-between font-semibold text-gold-600 mt-1 pt-2 border-t border-rose-150">
              <span>Total</span><span>{formatCOP(order.totalCOP)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <a
            href={`https://wa.me/573187307977?text=${encodeURIComponent(`Hola Aura Divina ✨ Tengo una consulta sobre mi pedido ${order.code}.`)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-gold flex-1"
          >
            💬 Hablar por WhatsApp
          </a>
          <Link href="/productos" className="btn-ghost flex-1">Seguir comprando</Link>
        </div>
      </div>
    </section>
  );
}

export function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  return params.then(({ code }) => ({
    title: `Pedido ${code} · Aura Divina`,
    robots: { index: false },
  }));
}
