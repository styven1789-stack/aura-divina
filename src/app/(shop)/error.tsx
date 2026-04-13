'use client';

import { useEffect } from 'react';
import { AuraMonogram } from '@/components/brand/Logo';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[shop/error]', error);
  }, [error]);

  return (
    <section className="min-h-[70vh] hero-aura flex items-center justify-center p-6">
      <div className="card-luxe p-12 md:p-16 max-w-xl w-full text-center">
        <div className="flex justify-center mb-6">
          <AuraMonogram size={88} />
        </div>
        <p className="eyebrow mb-3">Algo se salió del guión</p>
        <h1 className="h-display text-4xl md:text-5xl text-ink-900">
          Algo brilló demasiado fuerte.
        </h1>
        <p className="mt-4 text-ink-700/70 max-w-md mx-auto">
          Tuvimos un problema cargando esta página. Inténtalo de nuevo en un momento o vuelve al inicio.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-gold">
            Reintentar
          </button>
          <a href="/" className="btn-ghost">
            Volver al inicio
          </a>
        </div>
      </div>
    </section>
  );
}
