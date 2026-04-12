import Link from 'next/link';
import { loadDb } from '@/core/infrastructure/persistence/json-store';
import ProductCard from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

const CATS = [
  { key: 'all', label: 'Todo' },
  { key: 'anillos', label: 'Anillos' },
  { key: 'collares', label: 'Collares' },
  { key: 'aretes', label: 'Aretes' },
  { key: 'pulseras', label: 'Pulseras' },
  { key: 'sets', label: 'Sets' },
];

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const db = await loadDb();
  const items = db.products.filter((p) => p.active && (cat && cat !== 'all' ? p.category === cat : true));

  return (
    <section className="container-aura py-16">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest2 text-gold-600 mb-2">Catálogo</p>
        <h1 className="h-display text-5xl md:text-6xl text-ink-900">Toda la colección</h1>
        <p className="mt-3 text-ink-700/70 max-w-2xl mx-auto">
          Descubre cada pieza diseñada para acompañarte en tus momentos más divinos.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {CATS.map((c) => {
          const active = (cat ?? 'all') === c.key;
          return (
            <Link
              key={c.key}
              href={c.key === 'all' ? '/productos' : `/productos?cat=${c.key}`}
              className={
                'px-5 py-2 rounded-full text-sm uppercase tracking-widest border transition ' +
                (active
                  ? 'bg-ink-900 text-rose-50 border-ink-900'
                  : 'bg-white text-ink-700 border-rose-150 hover:border-gold-500')
              }
            >
              {c.label}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <p className="text-center text-ink-600 py-20">No hay productos en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </section>
  );
}
