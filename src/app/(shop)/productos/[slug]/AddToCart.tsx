'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Product } from '@/core/domain/product';
import { useCart } from '@/store/cart.store';
import { useToast } from '@/components/ui/Toast';
import StickyBuyBar from '@/components/product/StickyBuyBar';
import { Plus, Minus } from '@/components/icons';

export default function AddToCart({ product }: { product: Product }) {
  const router = useRouter();
  const toast = useToast();
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? '');
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const outOfStock = !variant || variant.stock === 0;
  const hasMultipleVariants = product.variants.length > 1;
  const variantSelectorRef = useRef<HTMLDivElement | null>(null);

  const doAdd = () => {
    if (!variant) return;
    if (outOfStock) return;
    add({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      image: product.images[0],
      unitPriceCOP: product.priceCOP,
      quantity: qty,
      variantLabel: variant.label,
    });
    toast.success(
      '✨ Añadido al carrito',
      `${qty}x ${product.name}${variant.label !== 'Único' ? ' · ' + variant.label : ''}`,
    );
  };

  const doBuyNow = () => {
    doAdd();
    router.push('/checkout');
  };

  return (
    <>
      <div className="mt-6 space-y-5" id="buy-box">
        {hasMultipleVariants && (
          <div ref={variantSelectorRef}>
            <p className="label-aura">Talla</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => {
                const active = v.id === variantId;
                const disabled = v.stock === 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={disabled}
                    aria-pressed={active}
                    onClick={() => setVariantId(v.id)}
                    className={
                      'min-w-[3rem] h-12 px-4 rounded-full text-sm font-medium border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 ' +
                      (active
                        ? 'bg-ink-900 text-white border-ink-900 shadow-float'
                        : disabled
                          ? 'bg-rose-50 text-ink-600/40 border-rose-150 cursor-not-allowed line-through'
                          : 'bg-white text-ink-900 border-rose-150 hover:border-gold-500')
                    }
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <p className="label-aura">Cantidad</p>
          <div className="inline-flex items-center rounded-full bg-white border border-rose-150 overflow-hidden">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Disminuir cantidad"
              className="grid place-items-center w-11 h-11 text-ink-700 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-inset"
            >
              <Minus size={16} />
            </button>
            <span className="px-5 font-medium min-w-[2.5rem] text-center" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Aumentar cantidad"
              className="grid place-items-center w-11 h-11 text-ink-700 hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-inset"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={doAdd}
            disabled={outOfStock}
            className="btn-gold flex-1 text-base disabled:opacity-50"
          >
            {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
          </button>
          <button
            type="button"
            onClick={doBuyNow}
            disabled={outOfStock}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            Comprar ahora →
          </button>
        </div>

        <Link href="/carrito" className="block text-center text-sm text-ink-600 hover:text-gold-600 underline-offset-4 hover:underline">
          Ver carrito
        </Link>
      </div>

      <StickyBuyBar product={product} onAddClick={doAdd} disabled={outOfStock} />
    </>
  );
}
