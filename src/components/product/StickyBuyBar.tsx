'use client';

/**
 * StickyBuyBar — bar fijo en mobile para mantener la CTA visible.
 * Se muestra tras scrollear >400px y en viewports <md.
 *
 * Z-index coordinado: se posiciona en `bottom-16` (sobre MobileBottomNav que
 * está en bottom-0) y tiene `z-30`. El WhatsappFab se ocultará en el PDP
 * mientras esta bar está visible para evitar superposición.
 */

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/core/domain/product';
import PriceDisplay from '@/components/ui/PriceDisplay';

interface StickyBuyBarProps {
  product: Product;
  onAddClick: () => void;
  disabled?: boolean;
}

export default function StickyBuyBar({ product, onAddClick, disabled }: StickyBuyBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Notifica al resto de la app si la sticky bar está visible (para esconder WhatsappFab)
  useEffect(() => {
    if (visible) document.body.dataset.stickyBuy = '1';
    else delete document.body.dataset.stickyBuy;
    return () => {
      delete document.body.dataset.stickyBuy;
    };
  }, [visible]);

  return (
    <div
      aria-hidden={!visible}
      className={`lg:hidden fixed left-0 right-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="mx-3 mb-2 card-luxe !rounded-3xl !shadow-luxe p-3 flex items-center gap-3">
        <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-rose-100">
          <Image
            src={product.images[0]}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-sm text-ink-900 truncate">{product.name}</p>
          <PriceDisplay price={product.priceCOP} compareAt={product.compareAtPriceCOP} size="sm" />
        </div>
        <button
          onClick={onAddClick}
          disabled={disabled}
          className="btn-gold !px-4 !py-3 text-fluid-sm shrink-0 tap-target disabled:opacity-50"
        >
          {disabled ? 'Sin stock' : 'Agregar'}
        </button>
      </div>
    </div>
  );
}
