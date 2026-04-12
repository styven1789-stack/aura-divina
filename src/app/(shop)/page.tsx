import Link from 'next/link';
import { loadDb } from '@/core/infrastructure/persistence/json-store';
import ProductCard from '@/components/ProductCard';
import { Logo, AuraMark } from '@/components/brand/Logo';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const db = await loadDb();
  const featured = db.products.filter((p) => p.featured && p.active).slice(0, 4);
  const newest = db.products.filter((p) => p.active).slice(0, 8);

  return (
    <>
      {/* HERO */}
      <section className="hero-aura relative overflow-hidden">
        <div className="container-aura py-20 md:py-32 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="chip mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
              Nueva colección · Otoño 2026
            </p>
            <h1 className="h-display text-5xl md:text-7xl leading-[0.95] text-ink-900">
              Tu esencia,
              <br />
              <span className="italic text-gold-600">tu estilo,</span>
              <br />
              tu aura divina.
            </h1>
            <p className="mt-6 max-w-md text-ink-700/80 text-lg leading-relaxed">
              Joyería premium hipoalergénica, hecha para mujeres que brillan con autenticidad.
              Envío contraentrega en toda Medellín.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/productos" className="btn-gold">
                Descubrir colección →
              </Link>
              <Link href="/productos?cat=sets" className="btn-ghost">
                Ver sets de regalo
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              <Trust label="Pago contraentrega" />
              <Trust label="Hipoalergénico" />
              <Trust label="Envío 24h" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-200/40 to-gold-300/20 rounded-[3rem] blur-3xl" />
            <div className="relative card-soft p-10 md:p-14 text-center">
              <div className="flex justify-center">
                <Logo variant="stacked" />
              </div>
              <div className="mt-10 gold-divider" />
              <p className="mt-6 text-xs uppercase tracking-widest2 text-ink-600">
                Colección esencial
              </p>
              <p className="mt-2 font-serif text-3xl text-ink-900">Brilla siempre.</p>
            </div>
          </div>
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="container-aura py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-widest2 text-gold-600 mb-2">Lo más amado</p>
            <h2 className="h-display text-4xl md:text-5xl text-ink-900">Destacados</h2>
          </div>
          <Link href="/productos" className="hidden sm:inline text-sm uppercase tracking-widest text-ink-700 hover:text-gold-600">
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {featured.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* PROMESA */}
      <section className="bg-rose-100/50 py-20">
        <div className="container-aura grid md:grid-cols-3 gap-10 text-center">
          <Promise icon="🚚" title="Pago Contraentrega" body="Recibe tu pedido en casa y paga al recibirlo. Sin tarjeta requerida." />
          <Promise icon="💎" title="Calidad Premium" body="Materiales hipoalergénicos: oro 14k/18k laminado, plata 925, acero quirúrgico." />
          <Promise icon="✨" title="Empaque Aura" body="Cada pieza llega en una caja regalo lista para sorprender." />
        </div>
      </section>

      {/* MÁS */}
      <section className="container-aura py-20">
        <h2 className="h-display text-4xl text-ink-900 mb-10">Toda la colección</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {newest.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>
    </>
  );
}

function Trust({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <AuraMark size={22} />
      <span className="text-[11px] uppercase tracking-widest text-ink-700">{label}</span>
    </div>
  );
}

function Promise({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="card-soft p-8">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-serif text-2xl text-ink-900 mb-2">{title}</h3>
      <p className="text-sm text-ink-700/80">{body}</p>
    </div>
  );
}
