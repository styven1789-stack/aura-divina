import Link from 'next/link';
import Image from 'next/image';
import { loadDb } from '@/core/infrastructure/persistence/json-store';
import ProductCard from '@/components/ProductCard';
import SectionHeader from '@/components/ui/SectionHeader';
import CategoryCard from '@/components/ui/CategoryCard';
import FeatureCard from '@/components/ui/FeatureCard';
import Eyebrow from '@/components/ui/Eyebrow';
import TrustPills from '@/components/trust/TrustPills';
import StarRating from '@/components/trust/StarRating';
import TestimonialsSection from '@/components/trust/TestimonialsSection';
import NewsletterForm from '@/components/ui/NewsletterForm';
import { TruckIcon, ShieldIcon, SparkleIcon, ChevronRight } from '@/components/icons';
import brandStats from '@/data/brand-stats.json';

export const dynamic = 'force-dynamic';

// TODO: reemplazar con fotografías reales cuando estén disponibles.
const HERO_IMAGES = {
  large: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=85',
  small1: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=85',
  small2: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=85',
};

/**
 * Devuelve la primera imagen de un producto activo de la categoría. Así la
 * home se alimenta de las imágenes reales que ya validaste en el catálogo,
 * evitando URLs de Unsplash hardcodeadas que pueden romperse o no coincidir
 * con el tipo de pieza.
 */
function pickCategoryImage(products: { category: string; active: boolean; images: string[] }[], category: string): string {
  const match = products.find((p) => p.active && p.category === category && p.images.length > 0);
  return match?.images[0] ?? '';
}

export default async function HomePage() {
  const db = await loadDb();
  const featured = db.products.filter((p) => p.featured && p.active).slice(0, 4);

  const categoryImages = {
    anillos: pickCategoryImage(db.products, 'anillos'),
    collares: pickCategoryImage(db.products, 'collares'),
    aretes: pickCategoryImage(db.products, 'aretes'),
  };

  return (
    <>
      {/* HERO editorial */}
      <section className="hero-aura relative overflow-hidden">
        <div className="container-aura py-12 md:py-20 lg:py-24 grid lg:grid-cols-2 gap-10 md:gap-12 items-center">
          {/* Texto */}
          <div className="order-1 lg:order-1">
            <Eyebrow className="mb-5">Nueva colección · 2026</Eyebrow>
            <h1 className="h-display text-fluid-display text-ink-900 leading-[1.05]">
              Joyería que revela
              <br />
              <span className="italic text-gold-600">tu luz.</span>
            </h1>
            <p className="mt-6 max-w-lg text-ink-700/80 text-fluid-lg leading-relaxed">
              Piezas con baño de rodio · hechas con alma en Medellín y enviadas a tu puerta.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/productos" className="btn-gold">
                Descubrir la colección →
              </Link>
              <Link href="/productos?cat=sets" className="btn-ghost">
                Sets de regalo ✨
              </Link>
            </div>

            <div className="mt-10">
              <TrustPills variant="hero" />
            </div>

            <div className="mt-8 flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur border border-rose-150 max-w-md">
              <StarRating rating={brandStats.averageRating} size="md" />
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  {brandStats.averageRating} de 5 · Más de {brandStats.reviewCount} clientas nos eligieron
                </p>
                <p className="text-fluid-xs text-ink-600">Historias reales de mujeres que brillan con Aura Divina.</p>
              </div>
            </div>
          </div>

          {/* Grid editorial asimétrico de imágenes */}
          <div className="order-2 lg:order-2 relative">
            <div className="grid grid-cols-2 md:grid-cols-5 md:grid-rows-6 gap-2 md:gap-4">
              {/* Imagen grande */}
              <div className="col-span-2 aspect-[4/5] md:col-span-3 md:row-span-6 md:aspect-auto relative rounded-4xl overflow-hidden shadow-luxe">
                <Image
                  src={HERO_IMAGES.large}
                  alt="Modelo luciendo joyería Aura Divina con baño de rodio"
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 60vw, 36vw"
                  priority
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 animate-float">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-3 py-1.5 text-fluid-xs uppercase tracking-widest text-gold-700 font-bold shadow-soft">
                    <SparkleIcon size={12} className="text-gold-600" />
                    Entrega 24h
                  </span>
                </div>
              </div>
              {/* Imagen pequeña superior */}
              <div className="col-span-1 aspect-square md:col-span-2 md:row-span-3 md:aspect-auto relative rounded-4xl overflow-hidden shadow-luxe">
                <Image
                  src={HERO_IMAGES.small1}
                  alt="Detalle de anillo minimalista con baño de rodio"
                  fill
                  sizes="(max-width: 767px) 50vw, (max-width: 1023px) 40vw, 24vw"
                  className="object-cover"
                />
              </div>
              {/* Imagen pequeña inferior */}
              <div className="col-span-1 aspect-square md:col-span-2 md:row-span-3 md:aspect-auto relative rounded-4xl overflow-hidden shadow-luxe">
                <Image
                  src={HERO_IMAGES.small2}
                  alt="Collar con dije de luna creciente"
                  fill
                  sizes="(max-width: 767px) 50vw, (max-width: 1023px) 40vw, 24vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strip de valores */}
      <section className="container-aura py-4 -mt-2">
        <TrustPills variant="compact" />
      </section>

      {/* Lo más amado */}
      <section className="container-aura py-16 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <SectionHeader
            eyebrow="Best-sellers"
            title="Lo más amado por nuestras clientas"
            subtitle="Las piezas que vuelan de nuestras cajas, elegidas por mujeres reales."
          />
          <Link
            href="/productos"
            className="hidden md:inline-flex items-center gap-1 text-sm uppercase tracking-widest text-ink-700 hover:text-gold-600 transition"
          >
            Ver toda la colección <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-5 gap-4 md:gap-5">
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
        <div className="md:hidden mt-8 text-center">
          <Link href="/productos" className="btn-ghost">
            Ver toda la colección →
          </Link>
        </div>
      </section>

      {/* Categorías destacadas */}
      <section className="container-aura py-16 md:py-20">
        <SectionHeader
          eyebrow="Por categoría"
          title="Encuentra tu favorita"
          subtitle="Anillos, collares y aretes diseñados para combinarse entre sí."
          align="center"
          className="mb-10"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          <CategoryCard
            title="Anillos"
            subtitle="Esenciales"
            href="/productos?cat=anillos"
            image={categoryImages.anillos}
          />
          <CategoryCard
            title="Collares"
            subtitle="Con alma"
            href="/productos?cat=collares"
            image={categoryImages.collares}
          />
          <CategoryCard
            title="Aretes"
            subtitle="Día y noche"
            href="/productos?cat=aretes"
            image={categoryImages.aretes}
          />
        </div>
      </section>

      {/* Testimonios */}
      <TestimonialsSection limit={3} />

      {/* Por qué Aura Divina */}
      <section className="bg-rose-100/40 py-16 md:py-20">
        <div className="container-aura">
          <SectionHeader
            eyebrow="Por qué Aura Divina"
            title="Más que joyería, una promesa"
            align="center"
            className="mb-10"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            <FeatureCard
              icon={<TruckIcon size={26} />}
              title="Envío 24h en Medellín"
              description="Contraentrega: recibes en casa y pagas cuando la joya está en tus manos."
            />
            <FeatureCard
              icon={<ShieldIcon size={26} />}
              title="Garantía 30 días"
              description="Si algo no coincide con tu expectativa, resolvemos por WhatsApp. Sin letras pequeñas."
            />
            <FeatureCard
              icon={<SparkleIcon size={26} />}
              title="Hecho en Medellín"
              description="Marca colombiana con alma. Cada pieza llega en su caja regalo, lista para sorprender."
            />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterForm />
    </>
  );
}
