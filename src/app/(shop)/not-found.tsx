import Link from 'next/link';
import { AuraMonogram } from '@/components/brand/Logo';

export default function NotFound() {
  return (
    <section className="min-h-[70vh] hero-aura flex items-center justify-center p-6">
      <div className="card-luxe p-12 md:p-16 max-w-xl w-full text-center">
        <div className="flex justify-center mb-6">
          <AuraMonogram size={88} />
        </div>
        <p className="eyebrow mb-3">Error 404</p>
        <h1 className="h-display text-4xl md:text-5xl text-ink-900">
          Esta pieza no existe,<br />pero tenemos otras hermosas.
        </h1>
        <p className="mt-4 text-ink-700/70 max-w-md mx-auto">
          Quizás la URL cambió o la pieza que buscabas se agotó. Te invitamos a descubrir el resto de nuestra colección.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-gold">
            Volver al inicio
          </Link>
          <Link href="/productos" className="btn-ghost">
            Explorar colección
          </Link>
        </div>
      </div>
    </section>
  );
}
