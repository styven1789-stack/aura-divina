/**
 * Aura Divina — Sistema de identidad visual.
 *
 * Filosofía:
 *  - El "aura" es el alma de la marca: lo representamos como un halo de
 *    rayos finos que emanan de un punto central (una mujer/llama esencial).
 *  - Tipografía: serif elegante (Cormorant) para el nombre + sans tracked
 *    para el slogan, evocando alta perfumería y joyería fina.
 *  - Color: rosa pastel + dorado bruñido + tinta casi negra.
 *  - Sin ningún recurso pixelado: 100% SVG vectorial, escala perfecta.
 */

import * as React from 'react';

interface LogoProps {
  variant?: 'full' | 'mark' | 'horizontal' | 'stacked';
  className?: string;
  invert?: boolean;
}

const GOLD = '#c9a96e';
const GOLD_DARK = '#a8884f';
const INK = '#1a1518';

/** Halo radial: 24 rayos finos + arco superior + punto central. */
function AuraMark({ size = 56, color = GOLD }: { size?: number; color?: string }) {
  const rays = Array.from({ length: 24 });
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="aura-glow" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="60%" stopColor={color} stopOpacity="0.05" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="aura-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e3c98e" />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor={GOLD_DARK} />
        </linearGradient>
      </defs>

      {/* glow halo */}
      <circle cx="60" cy="60" r="58" fill="url(#aura-glow)" />

      {/* rayos del aura */}
      <g stroke="url(#aura-gold)" strokeWidth="1.4" strokeLinecap="round">
        {rays.map((_, i) => {
          const angle = (i / rays.length) * Math.PI * 2 - Math.PI / 2;
          const r1 = 28;
          const r2 = i % 2 === 0 ? 44 : 38;
          const x1 = 60 + Math.cos(angle) * r1;
          const y1 = 60 + Math.sin(angle) * r1;
          const x2 = 60 + Math.cos(angle) * r2;
          const y2 = 60 + Math.sin(angle) * r2;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>

      {/* anillo principal */}
      <circle cx="60" cy="60" r="22" stroke="url(#aura-gold)" strokeWidth="1.6" />
      {/* anillo interior fino */}
      <circle cx="60" cy="60" r="16" stroke="url(#aura-gold)" strokeWidth="0.8" opacity="0.7" />

      {/* esencia central — gota / llama */}
      <path
        d="M60 47 C 66 54, 68 62, 60 72 C 52 62, 54 54, 60 47 Z"
        fill="url(#aura-gold)"
      />
      {/* destello */}
      <circle cx="60" cy="58" r="1.6" fill="#fff" opacity="0.85" />
    </svg>
  );
}

export function Logo({ variant = 'horizontal', className, invert = false }: LogoProps) {
  const ink = invert ? '#fff5f8' : INK;

  if (variant === 'mark') {
    return (
      <span className={className} aria-label="Aura Divina">
        <AuraMark />
      </span>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className ?? ''}`} aria-label="Aura Divina">
        <AuraMark size={64} />
        <div className="text-center leading-none">
          <div
            className="font-serif text-3xl tracking-[0.18em]"
            style={{ color: ink, fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 500 }}
          >
            AURA DIVINA
          </div>
          <div
            className="mt-2 text-[9px] uppercase tracking-[0.4em]"
            style={{ color: invert ? '#fcd9e3' : '#3d3338' }}
          >
            Tu esencia · Tu estilo
          </div>
        </div>
      </div>
    );
  }

  // horizontal (default) + full
  return (
    <div className={`flex items-center gap-3 ${className ?? ''}`} aria-label="Aura Divina">
      <AuraMark size={44} />
      <div className="leading-none">
        <div
          className="font-serif text-2xl tracking-[0.16em]"
          style={{ color: ink, fontFamily: '"Cormorant Garamond", Georgia, serif', fontWeight: 500 }}
        >
          AURA <span style={{ color: GOLD }}>·</span> DIVINA
        </div>
        {variant === 'full' && (
          <div
            className="mt-1.5 text-[8.5px] uppercase tracking-[0.36em]"
            style={{ color: invert ? '#fcd9e3' : '#3d3338' }}
          >
            Tu esencia, tu estilo, tu aura divina
          </div>
        )}
      </div>
    </div>
  );
}

export { AuraMark };
