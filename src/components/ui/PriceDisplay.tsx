/**
 * PriceDisplay — formato unificado de precio + compare-at + discount chip.
 * Se usa en ProductCard, PDP, cart line items, checkout summary, sticky buy bar.
 */

import { formatCOP } from '@/lib/money';
import { getDiscountPercent } from '@/lib/product-helpers';

type Size = 'sm' | 'md' | 'lg';

interface PriceDisplayProps {
  price: number;
  compareAt?: number;
  size?: Size;
  showDiscount?: boolean;
  className?: string;
}

const SIZE_CLASS: Record<Size, { primary: string; compare: string }> = {
  sm: { primary: 'text-sm font-semibold', compare: 'text-xs' },
  md: { primary: 'font-serif text-xl text-ink-900', compare: 'text-xs' },
  lg: { primary: 'font-serif text-3xl text-ink-900', compare: 'text-base' },
};

export default function PriceDisplay({
  price,
  compareAt,
  size = 'md',
  showDiscount = true,
  className = '',
}: PriceDisplayProps) {
  const discount = getDiscountPercent(price, compareAt);
  const cls = SIZE_CLASS[size];
  return (
    <div className={`inline-flex items-baseline gap-2 flex-wrap ${className}`}>
      <span className={cls.primary}>{formatCOP(price)}</span>
      {compareAt && compareAt > price && (
        <>
          <span className={`${cls.compare} text-ink-600/60 line-through`}>{formatCOP(compareAt)}</span>
          {showDiscount && discount > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-gold-700">
              -{discount}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
