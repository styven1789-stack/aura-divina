import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/core/domain/product';
import PriceDisplay from '@/components/ui/PriceDisplay';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/trust/StarRating';
import QuickAddButton from '@/components/product/QuickAddButton';
import { totalStock, isSoldOut, isLowStock, getDiscountPercent } from '@/lib/product-helpers';
import brandStats from '@/data/brand-stats.json';

export default function ProductCard({ p }: { p: Product }) {
  const soldOut = isSoldOut(p);
  const lowStock = isLowStock(p, 5);
  const total = totalStock(p);
  const discount = getDiscountPercent(p.priceCOP, p.compareAtPriceCOP);

  return (
    <article
      className={`group card-soft overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-luxe ${soldOut ? 'opacity-85' : ''}`}
    >
      <Link
        href={`/productos/${p.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 rounded-3xl"
        aria-label={`Ver detalles de ${p.name}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-rose-100">
          <Image
            src={p.images[0]}
            alt={`${p.name} · Aura Divina`}
            fill
            sizes="(max-width: 479px) 50vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1439px) 25vw, 20vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            {discount > 0 && <Badge variant="sale">-{discount}%</Badge>}
          </div>
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
            {p.tags.includes('nuevo') && <Badge variant="new">Nuevo</Badge>}
            {p.tags.includes('bestseller') && !p.tags.includes('nuevo') && (
              <Badge variant="hot">Bestseller</Badge>
            )}
          </div>

          {soldOut && (
            <div className="absolute inset-0 grid place-items-center bg-ink-900/20">
              <span className="bg-white/95 backdrop-blur rounded-full px-5 py-2 text-xs font-bold uppercase tracking-widest text-ink-900">
                Agotado
              </span>
            </div>
          )}
          {!soldOut && lowStock && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="low-stock">¡Últimas {total}!</Badge>
            </div>
          )}
        </div>

        <div className="px-4 pt-4 pb-3 sm:px-5 sm:pt-5">
          <p className="eyebrow mb-1">{p.category}</p>
          <h3 className="font-serif text-fluid-lg text-ink-900 leading-tight">{p.name}</h3>
          <p className="text-fluid-xs text-ink-600 mt-1 line-clamp-2">{p.shortDescription}</p>
          <div className="mt-3">
            <StarRating rating={brandStats.averageRating} count={brandStats.reviewCount} size="sm" showCount />
          </div>
          <div className="mt-3">
            <PriceDisplay price={p.priceCOP} compareAt={p.compareAtPriceCOP} size="md" />
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <QuickAddButton product={p} />
      </div>
    </article>
  );
}
