'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart } from '@/store/cart.store';
import { formatCOP } from '@/lib/money';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());

  if (!mounted) return null;

  if (lines.length === 0) {
    return (
      <section className="container-aura py-24 text-center">
        <div className="text-6xl mb-4">✨</div>
        <h1 className="h-display text-4xl text-ink-900">Tu carrito está esperando brillar</h1>
        <p className="text-ink-700/70 mt-3">Agrega piezas de nuestra colección.</p>
        <Link href="/productos" className="btn-gold mt-8 inline-flex">
          Explorar la tienda
        </Link>
      </section>
    );
  }

  return (
    <section className="container-aura py-12">
      <h1 className="h-display text-4xl md:text-5xl text-ink-900 mb-10">Tu carrito</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {lines.map((l) => (
            <div key={l.productId + l.variantId} className="card-soft p-4 flex gap-4 items-center">
              {l.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.image} alt="" className="w-24 h-24 rounded-2xl object-cover" />
              )}
              <div className="flex-1">
                <h3 className="font-serif text-xl text-ink-900">{l.name}</h3>
                {l.variantLabel && (
                  <p className="text-xs uppercase tracking-widest text-ink-600 mt-0.5">{l.variantLabel}</p>
                )}
                <p className="text-sm text-gold-600 mt-1">{formatCOP(l.unitPriceCOP)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="inline-flex items-center rounded-full bg-white border border-rose-150">
                  <button onClick={() => setQty(l.productId, l.variantId, l.quantity - 1)} className="px-3 py-1.5">−</button>
                  <span className="px-3 text-sm">{l.quantity}</span>
                  <button onClick={() => setQty(l.productId, l.variantId, l.quantity + 1)} className="px-3 py-1.5">+</button>
                </div>
                <p className="font-semibold">{formatCOP(l.unitPriceCOP * l.quantity)}</p>
                <button
                  onClick={() => remove(l.productId, l.variantId)}
                  className="text-xs uppercase tracking-widest text-rose-600 hover:text-rose-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="card-soft p-6 h-fit">
          <h2 className="font-serif text-2xl text-ink-900 mb-4">Resumen</h2>
          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={formatCOP(subtotal)} />
            <Row label="Envío" value="Calculado en checkout" />
            <div className="gold-divider my-3" />
            <Row label="Total estimado" value={formatCOP(subtotal)} bold />
          </div>
          <Link href="/checkout" className="btn-gold w-full mt-6">
            Continuar al checkout →
          </Link>
          <p className="text-xs text-center text-ink-600 mt-3">Pago contraentrega · Medellín</p>
        </aside>
      </div>
    </section>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={bold ? 'font-semibold text-ink-900' : 'text-ink-700'}>{label}</span>
      <span className={bold ? 'font-semibold text-ink-900' : 'text-ink-700'}>{value}</span>
    </div>
  );
}
