'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCart } from '@/store/cart.store';
import { formatCOP } from '@/lib/money';
import { useToast } from '@/components/ui/Toast';
import EmptyState from '@/components/ui/EmptyState';
import PriceDisplay from '@/components/ui/PriceDisplay';
import { Bag, Plus, Minus, SparkleIcon } from '@/components/icons';

const FREE_SHIPPING_THRESHOLD = 200000;

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const toast = useToast();
  useEffect(() => setMounted(true), []);

  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart((s) => s.subtotal());

  if (!mounted) return null;

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const qualifies = remainingForFreeShipping === 0;

  if (lines.length === 0) {
    return (
      <section className="container-aura py-20 max-w-2xl">
        <EmptyState
          icon={<Bag size={40} />}
          title="Tu joyero aún está vacío"
          description="Agrega piezas de nuestra colección y comienza a brillar."
          action={{ label: 'Explorar productos →', href: '/productos' }}
        />
      </section>
    );
  }

  return (
    <section className="container-aura py-12">
      <h1 className="h-display text-4xl md:text-5xl text-ink-900 mb-6">Tu carrito</h1>

      {/* Banner de envío promocional */}
      <div className={'mb-8 rounded-3xl p-5 border ' + (qualifies ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-100/50 border-rose-150')}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-gold-600">
            <SparkleIcon size={22} />
          </span>
          <p className="text-sm text-ink-900">
            {qualifies ? (
              <strong>¡Felicidades! Tu pedido califica para empaque premium gratis.</strong>
            ) : (
              <>Te faltan <strong className="text-gold-700">{formatCOP(remainingForFreeShipping)}</strong> para empaque premium gratis ✨</>
            )}
          </p>
        </div>
        <div className="h-2 rounded-full bg-white/70 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-400 to-gold-600 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {lines.map((l) => (
            <article key={l.productId + l.variantId} className="card-soft p-4 flex gap-4 items-center">
              {l.image && (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-rose-100 shrink-0">
                  <Image src={l.image} alt="" fill sizes="96px" className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-xl text-ink-900 truncate">{l.name}</h3>
                {l.variantLabel && (
                  <p className="text-[10px] uppercase tracking-widest text-ink-600 mt-0.5">{l.variantLabel}</p>
                )}
                <div className="mt-1">
                  <PriceDisplay price={l.unitPriceCOP} size="sm" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="inline-flex items-center rounded-full bg-white border border-rose-150">
                  <button
                    onClick={() => setQty(l.productId, l.variantId, l.quantity - 1)}
                    aria-label="Disminuir cantidad"
                    className="grid place-items-center w-9 h-9 text-ink-700 hover:bg-rose-100 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-2 text-sm min-w-[1.5rem] text-center">{l.quantity}</span>
                  <button
                    onClick={() => setQty(l.productId, l.variantId, l.quantity + 1)}
                    aria-label="Aumentar cantidad"
                    className="grid place-items-center w-9 h-9 text-ink-700 hover:bg-rose-100 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="font-semibold text-ink-900">{formatCOP(l.unitPriceCOP * l.quantity)}</p>
                <button
                  onClick={() => {
                    remove(l.productId, l.variantId);
                    toast.info('Quitado del carrito', l.name);
                  }}
                  className="text-[10px] uppercase tracking-widest text-rose-600 hover:text-rose-700"
                >
                  Eliminar
                </button>
              </div>
            </article>
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
