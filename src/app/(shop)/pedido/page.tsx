'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TrackHomePage() {
  const router = useRouter();
  const [code, setCode] = useState('');

  return (
    <section className="container-aura py-16 md:py-20 max-w-xl">
      <div className="card-soft p-6 sm:p-10 text-center">
        <div className="text-fluid-5xl mb-3">📦</div>
        <h1 className="h-display text-fluid-4xl text-ink-900">Rastrea tu pedido</h1>
        <p className="text-ink-700/70 mt-2 text-fluid-sm">Ingresa el código que recibiste al confirmar tu compra.</p>
        <form
          className="mt-8 flex flex-col sm:flex-row gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const c = code.trim().toUpperCase();
            if (c) router.push(`/pedido/${c}`);
          }}
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="AD-XXXXXX"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            className="input-aura uppercase tracking-widest font-mono text-center"
          />
          <button type="submit" className="btn-gold tap-target">Buscar</button>
        </form>
      </div>
    </section>
  );
}
