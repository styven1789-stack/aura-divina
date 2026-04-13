'use client';

/**
 * QuickAddButton — overlay del ProductCard.
 * - Producto con una sola variante con stock → agrega directo y muestra toast.
 * - Producto con múltiples variantes → navega al PDP.
 * - Producto agotado → deshabilitado.
 */

import { useRouter } from 'next/navigation';
import type { Product } from '@/core/domain/product';
import { useCart } from '@/store/cart.store';
import { useToast } from '@/components/ui/Toast';
import { isSoldOut, hasSingleVariant, availableVariants } from '@/lib/product-helpers';
import { Bag, Plus } from '@/components/icons';

interface QuickAddButtonProps {
  product: Product;
  className?: string;
}

export default function QuickAddButton({ product, className = '' }: QuickAddButtonProps) {
  const router = useRouter();
  const addToCart = useCart((s) => s.add);
  const toast = useToast();

  const soldOut = isSoldOut(product);
  const single = hasSingleVariant(product);
  const defaultVariant = availableVariants(product)[0];

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;
    if (single && defaultVariant) {
      addToCart({
        productId: product.id,
        variantId: defaultVariant.id,
        name: product.name,
        image: product.images[0],
        unitPriceCOP: product.priceCOP,
        quantity: 1,
        variantLabel: defaultVariant.label,
      });
      toast.success('✨ Añadido al carrito', product.name);
    } else {
      router.push(`/productos/${product.slug}`);
    }
  };

  if (soldOut) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        className={`inline-flex items-center justify-center gap-2 w-full rounded-full bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest ${className}`}
      >
        Agotado
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={single ? `Agregar ${product.name} al carrito` : `Elegir talla de ${product.name}`}
      className={`inline-flex items-center justify-center gap-2 w-full rounded-full bg-ink-900 text-white border border-ink-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition hover:bg-ink-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 ${className}`}
    >
      {single ? <><Plus size={14} /> Agregar al carrito</> : <><Bag size={14} /> Elegir talla</>}
    </button>
  );
}
