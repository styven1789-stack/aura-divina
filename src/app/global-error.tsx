'use client';

/**
 * global-error.tsx — ÚLTIMO recurso de error boundary a nivel raíz.
 * Debe definir su propio <html> y <body> porque reemplaza al layout root.
 * Se activa solo cuando `app/layout.tsx` o sus children fallan antes del boundary (shop/error.tsx).
 */

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[global-error]', error);
  }, [error]);

  return (
    <html lang="es-CO">
      <body
        style={{
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          background:
            'radial-gradient(1200px 600px at 80% -10%, #fcd9e3 0%, transparent 55%), radial-gradient(900px 500px at 0% 100%, #ffe6ee 0%, transparent 55%), linear-gradient(180deg, #fff5f8 0%, #ffe9f0 100%)',
          minHeight: '100vh',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          color: '#1a1518',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid rgba(200, 147, 114, 0.3)',
            borderRadius: '32px',
            padding: '48px',
            maxWidth: '520px',
            textAlign: 'center',
            boxShadow: '0 20px 60px -20px rgba(200, 147, 114, 0.35)',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 600,
              background: 'linear-gradient(180deg, #eed4b0, #c89372 55%, #9a6a47)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-2px',
              lineHeight: 1,
              marginBottom: '24px',
            }}
          >
            AD
          </div>
          <p
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.32em',
              color: '#6f4a2e',
              fontWeight: 600,
              margin: '0 0 12px',
            }}
          >
            Algo se salió del guión
          </p>
          <h1
            style={{
              fontSize: '40px',
              fontWeight: 500,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Algo brilló demasiado fuerte.
          </h1>
          <p
            style={{
              marginTop: '16px',
              fontSize: '16px',
              lineHeight: 1.6,
              color: 'rgba(61, 51, 56, 0.75)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            Tuvimos un problema cargando la página. Inténtalo de nuevo en un momento o vuelve al inicio.
          </p>
          <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                letterSpacing: '0.02em',
                color: '#1a1518',
                background: 'linear-gradient(180deg, #e0b68a, #9a6a47)',
                border: 'none',
                borderRadius: '999px',
                padding: '14px 28px',
                cursor: 'pointer',
                boxShadow: '0 6px 24px -8px rgba(200, 147, 114, 0.45)',
              }}
            >
              Reintentar
            </button>
            <a
              href="/"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                letterSpacing: '0.02em',
                color: '#1a1518',
                background: 'transparent',
                border: '1px solid rgba(26, 21, 24, 0.15)',
                borderRadius: '999px',
                padding: '14px 28px',
                textDecoration: 'none',
              }}
            >
              Volver al inicio
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
