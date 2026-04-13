import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadDb } from '@/core/infrastructure/persistence/json-store';
import type { Product } from '@/core/domain/product';
import AddToCart from './AddToCart';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ProductGallery from '@/components/product/ProductGallery';
import Eyebrow from '@/components/ui/Eyebrow';
import PriceDisplay from '@/components/ui/PriceDisplay';
import Badge from '@/components/ui/Badge';
import TrustPills from '@/components/trust/TrustPills';
import StarRating from '@/components/trust/StarRating';
import TestimonialsSection from '@/components/trust/TestimonialsSection';
import Accordion from '@/components/ui/Accordion';
import ProductCard from '@/components/ProductCard';
import SectionHeader from '@/components/ui/SectionHeader';
import { isSoldOut, isLowStock, totalStock } from '@/lib/product-helpers';
import brandStats from '@/data/brand-stats.json';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const db = await loadDb();
  const product = db.products.find((p) => p.slug === slug && p.active);
  if (!product) {
    return { title: 'Producto no encontrado' };
  }
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} · Aura Divina`,
      description: product.shortDescription,
      images: product.images.map((url) => ({ url, width: 1200, height: 630 })),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} · Aura Divina`,
      description: product.shortDescription,
      images: product.images.slice(0, 1),
    },
  };
}

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await loadDb();
  const product = db.products.find((p) => p.slug === slug && p.active);
  if (!product) notFound();

  // Related: misma categoría, excluye el actual, ordena por overlap de tags, top 4.
  const related: Product[] = db.products
    .filter((p) => p.active && p.id !== product.id && p.category === product.category)
    .map((p) => ({
      product: p,
      score: p.tags.filter((t) => product.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ product }) => product);

  const soldOut = isSoldOut(product);
  const lowStock = isLowStock(product, 5);
  const stockTotal = totalStock(product);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.variants[0]?.sku,
    brand: { '@type': 'Brand', name: 'Aura Divina' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'COP',
      price: product.priceCOP,
      availability: soldOut
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      url: `https://auradivina.co/productos/${product.slug}`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: brandStats.averageRating,
      reviewCount: brandStats.reviewCount,
    },
  };

  const categoryLabel =
    product.category.charAt(0).toUpperCase() + product.category.slice(1);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="container-aura py-10 md:py-14">
        <Breadcrumb
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Tienda', href: '/productos' },
            { label: categoryLabel, href: `/productos?cat=${product.category}` },
            { label: product.name },
          ]}
          className="mb-6"
        />

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Galería */}
          <ProductGallery images={product.images} name={product.name} />

          {/* Ficha */}
          <div className="flex flex-col">
            <Eyebrow>{categoryLabel}</Eyebrow>
            <h1 className="h-display text-4xl md:text-5xl text-ink-900 mt-2 leading-[1.1]">
              {product.name}
            </h1>

            <div className="mt-3">
              <StarRating
                rating={brandStats.averageRating}
                count={brandStats.reviewCount}
                size="md"
                showCount
              />
            </div>

            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <PriceDisplay
                price={product.priceCOP}
                compareAt={product.compareAtPriceCOP}
                size="lg"
              />
              {soldOut ? (
                <Badge variant="sold-out">Agotado</Badge>
              ) : lowStock ? (
                <Badge variant="low-stock">¡Últimas {stockTotal}!</Badge>
              ) : null}
            </div>

            <p className="mt-5 text-ink-700/85 leading-relaxed">{product.shortDescription}</p>

            <AddToCart product={product} />

            <div className="mt-8">
              <TrustPills variant="compact" />
            </div>

            <div className="mt-8">
              <Accordion
                items={[
                  {
                    id: 'desc',
                    title: 'Descripción completa',
                    content: <p>{product.description}</p>,
                  },
                  {
                    id: 'materials',
                    title: 'Materiales y cuidados',
                    content: (
                      <div className="space-y-2">
                        <p>Piezas con baño de rodio y acabado espejo, diseñadas para el uso diario.</p>
                        <p>
                          Cuida tu joya: evita el contacto con perfumes, cremas y cloro. Guárdala en su bolsita de terciopelo
                          cuando no la uses. Limpia suavemente con un paño de microfibra.
                        </p>
                      </div>
                    ),
                  },
                  {
                    id: 'shipping',
                    title: 'Envío y devoluciones',
                    content: (
                      <div className="space-y-2">
                        <p>
                          <strong>Envío 24h en Medellín</strong> y área metropolitana mediante pago contraentrega.
                        </p>
                        <p>
                          <strong>Garantía de 30 días</strong>: si algo no coincide con tu expectativa, contáctanos por WhatsApp y
                          resolvemos.
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Completa el look */}
      {related.length > 0 && (
        <section className="container-aura py-12 md:py-16 border-t border-rose-150/60">
          <SectionHeader
            eyebrow="Completa el look"
            title="También te podría encantar"
            titleSize="md"
            className="mb-8"
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* Testimonios */}
      <TestimonialsSection limit={3} eyebrow="Opiniones" title="Lo que dicen nuestras clientas" showStats={false} />
    </>
  );
}
