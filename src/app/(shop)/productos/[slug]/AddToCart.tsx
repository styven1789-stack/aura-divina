'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/core/domain/product';
import { useCart } from '@/store/cart.store';
import { useToast } from '@/components/ui/Toast';

export default function AddToCart({ product }: { product: Product }) {
  const toast = useToast();
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? '');
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const outOfStock = !variant || variant.stock === 0;

  const onAdd = () => {
    if (!variant) return;
    add({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      image: product.images[0],
      unitPriceCOP: product.priceCOP,
      quantity: qty,
      variantLabel: variant.label,
    });
    toast.success('Agregado al carrito ✨', `${qty}x ${product.name}${variant.label !== 'Único' ? ' · ' + variant.label : ''}`);
  };

  const hasMultipleVariants = product.variants.length > 1;

  return (
    <div className="mt-6 space-y-5">
      {hasMultipleVariants && (
        <div>
          <p className="label-aura">Talla</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const active = v.id === variantId;
              const disabled = v.stock === 0;
              return (
                <button
                  key={v.id}
                  disabled={disabled}
                  onClick={() => setVariantId(v.id)}
                  className={
                    'px-4 py-2 rounded-full text-sm border transition ' +
                    (active
                      ? 'bg-ink-900 text-white border-ink-900'
                      : disabled
                        ? 'bg-rose-100 text-ink-600/40 border-rose-150 cursor-not-allowed line-through'
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
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2 text-ink-700 hover:bg-rose-100">−</button>
          <span className="px-4 font-medium min-w-[2rem] text-center">{qty}</span>
          <button onClick={() => setQty((q) => q + 1)} className="px-4 py-2 text-ink-700 hover:bg-rose-100">+</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onAdd} disabled={outOfStock} className="btn-gold flex-1 disabled:opacity-50">
          {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
        </button>
        <Link href="/carrito" className="btn-primary">
          Ver carrito →
        </Link>
      </div>
    </div>
  );
}
