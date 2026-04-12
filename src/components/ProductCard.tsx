import Link from 'next/link';
import type { Product } from '@/core/domain/product';
import { formatCOP } from '@/lib/money';

export default function ProductCard({ p }: { p: Product }) {
  const discount = p.compareAtPriceCOP
    ? Math.round((1 - p.priceCOP / p.compareAtPriceCOP) * 100)
    : 0;

  return (
    <Link
      href={`/productos/${p.slug}`}
      className="group block card-soft overflow-hidden transition hover:-translate-y-1 hover:shadow-gold"
    >
      <div className="relative aspect-square overflow-hidden bg-rose-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.images[0]}
          alt={p.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-gold-500 text-ink-900 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow">
            -{discount}%
          </span>
        )}
        {p.tags.includes('nuevo') && (
          <span className="absolute top-3 right-3 bg-ink-900 text-rose-50 text-[10px] font-medium tracking-widest uppercase px-2.5 py-1 rounded-full">
            Nuevo
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-[10px] uppercase tracking-widest2 text-gold-600 mb-1">{p.category}</p>
        <h3 className="font-serif text-xl text-ink-900 leading-tight">{p.name}</h3>
        <p className="text-xs text-ink-600 mt-1 line-clamp-2">{p.shortDescription}</p>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-lg font-semibold text-ink-900">{formatCOP(p.priceCOP)}</span>
          {p.compareAtPriceCOP && (
            <span className="text-xs text-ink-600/60 line-through">{formatCOP(p.compareAtPriceCOP)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
