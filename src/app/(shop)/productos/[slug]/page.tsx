import { notFound } from 'next/navigation';
import { loadDb } from '@/core/infrastructure/persistence/json-store';
import { formatCOP } from '@/lib/money';
import AddToCart from './AddToCart';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await loadDb();
  const product = db.products.find((p) => p.slug === slug && p.active);
  if (!product) notFound();

  const discount = product.compareAtPriceCOP
    ? Math.round((1 - product.priceCOP / product.compareAtPriceCOP) * 100)
    : 0;

  return (
    <section className="container-aura py-12 md:py-16">
      <nav className="text-xs uppercase tracking-widest text-ink-600 mb-6">
        <Link href="/" className="hover:text-gold-600">Inicio</Link> ·{' '}
        <Link href="/productos" className="hover:text-gold-600">Tienda</Link> ·{' '}
        <span className="text-ink-900">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Galería */}
        <div className="space-y-4">
          <div className="card-soft overflow-hidden aspect-square">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={img}
                  alt=""
                  className="w-full aspect-square object-cover rounded-2xl border border-rose-150"
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs uppercase tracking-widest2 text-gold-600 mb-2">{product.category}</p>
          <h1 className="h-display text-4xl md:text-5xl text-ink-900">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-ink-900">{formatCOP(product.priceCOP)}</span>
            {product.compareAtPriceCOP && (
              <>
                <span className="text-lg text-ink-600/60 line-through">{formatCOP(product.compareAtPriceCOP)}</span>
                <span className="bg-gold-500 text-ink-900 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          <div className="mt-6 gold-divider" />
          <p className="mt-6 text-ink-700/85 leading-relaxed">{product.description}</p>

          <AddToCart product={product} />

          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <Badge title="Pago" sub="Contraentrega" />
            <Badge title="Envío" sub="24h Medellín" />
            <Badge title="Garantía" sub="30 días" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Badge({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="card-soft p-4">
      <p className="text-[10px] uppercase tracking-widest2 text-gold-600">{title}</p>
      <p className="text-sm text-ink-900 mt-1">{sub}</p>
    </div>
  );
}
