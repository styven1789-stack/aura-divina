'use client';

/**
 * Aura Divina — brand identity system.
 *
 * Logo rendering strategy:
 *  1. Try to load the official PNG at `public/brand/aura-divina-full.png`.
 *  2. If it 404s (file not there yet), fall back automatically to the
 *     CSS+SVG monogram — no code change required when the PNG arrives.
 *
 * The PNG is the canonical brand asset (monogram "AD" with rose-gold D,
 * botanical branch, serif wordmark "AURA DIVINA", tagline). Drop it in
 * `public/brand/aura-divina-full.png` and every <Logo> on the site picks
 * it up automatically on next render.
 *
 * Variants:
 *  - `mark`       — only the AD monogram (compact / avatars / loading).
 *  - `horizontal` — mark + wordmark inline (desktop navbar).
 *  - `stacked`    — mark above wordmark + tagline (auth, hero, success).
 *  - `wordmark`   — text only (footer secondary).
 *  - `full`       — alias of stacked with a larger mark.
 */

import Image from 'next/image';
import { useState } from 'react';

interface LogoProps {
  variant?: 'full' | 'mark' | 'horizontal' | 'stacked' | 'wordmark';
  className?: string;
  invert?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const MARK_SIZE_PX = { sm: 56, md: 72, lg: 96 };
const PHOTO_PATH = '/brand/aura-divina-full.png';

/**
 * BotanicalBranch — delicate olive-style branch in rose-gold. Overlays
 * horizontally across the middle of the AD monogram as a fallback when
 * the official PNG isn't available.
 */
function BotanicalBranch({ width = 160 }: { width?: number }) {
  const height = Math.round(width * 0.32);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="branch-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#b67a52" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#d9a87e" />
          <stop offset="100%" stopColor="#b67a52" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <path
        d="M 8 32 Q 50 14, 100 32 T 192 32"
        stroke="url(#branch-gold)"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <g fill="url(#branch-gold)">
        <ellipse cx="28" cy="20" rx="8" ry="3.2" transform="rotate(-30 28 20)" />
        <ellipse cx="44" cy="15" rx="7" ry="2.8" transform="rotate(-18 44 15)" />
        <ellipse cx="62" cy="18" rx="8" ry="3.2" transform="rotate(-25 62 18)" />
        <ellipse cx="22" cy="44" rx="7" ry="2.8" transform="rotate(28 22 44)" />
        <ellipse cx="38" cy="48" rx="8" ry="3.2" transform="rotate(22 38 48)" />
        <ellipse cx="56" cy="48" rx="7" ry="2.8" transform="rotate(18 56 48)" />
        <ellipse cx="74" cy="45" rx="6" ry="2.6" transform="rotate(12 74 45)" />
      </g>
      <g fill="url(#branch-gold)">
        <ellipse cx="126" cy="45" rx="6" ry="2.6" transform="rotate(-12 126 45)" />
        <ellipse cx="144" cy="48" rx="7" ry="2.8" transform="rotate(-18 144 48)" />
        <ellipse cx="162" cy="48" rx="8" ry="3.2" transform="rotate(-22 162 48)" />
        <ellipse cx="178" cy="44" rx="7" ry="2.8" transform="rotate(-28 178 44)" />
        <ellipse cx="138" cy="18" rx="8" ry="3.2" transform="rotate(25 138 18)" />
        <ellipse cx="156" cy="15" rx="7" ry="2.8" transform="rotate(18 156 15)" />
        <ellipse cx="172" cy="20" rx="8" ry="3.2" transform="rotate(30 172 20)" />
      </g>
      <circle cx="100" cy="32" r="1.2" fill="#9a6a47" />
    </svg>
  );
}

/**
 * AuraMonogram — CSS+SVG fallback rendering of the AD symbol.
 */
export function AuraMonogram({
  size = 72,
  inkColor = '#1a1518',
}: {
  size?: number;
  inkColor?: string;
}) {
  const fontPx = Math.round(size * 1.1);
  const branchWidth = Math.round(size * 2);

  return (
    <div
      className="relative inline-flex items-center justify-center leading-none select-none"
      style={{ height: size }}
      aria-hidden="true"
    >
      <span
        className="font-serif"
        style={{
          fontSize: fontPx,
          fontWeight: 500,
          color: inkColor,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        A
      </span>
      <span
        className="font-serif"
        style={{
          fontSize: fontPx,
          fontWeight: 500,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          background: 'linear-gradient(180deg, #eed4b0 0%, #c89372 45%, #9a6a47 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          marginLeft: '-0.08em',
        }}
      >
        D
      </span>
      <span
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width: branchWidth }}
      >
        <BotanicalBranch width={branchWidth} />
      </span>
    </div>
  );
}

/**
 * PhotoLogo — renders the canonical PNG. On load error, swaps to the
 * SVG fallback automatically.
 */
function PhotoLogo({
  width,
  variant,
  className,
  ink,
  tagColor,
}: {
  width: number;
  variant: 'stacked' | 'full' | 'horizontal' | 'mark' | 'wordmark';
  className?: string;
  ink: string;
  tagColor: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    // Fallback: render the SVG version of the requested variant.
    return <SvgLogo variant={variant} className={className} ink={ink} tagColor={tagColor} />;
  }

  const aspect = 0.66; // approx 3:2 for the full stacked composition
  const height = Math.round(width * aspect);

  return (
    <div className={className} aria-label="Aura Divina">
      <Image
        src={PHOTO_PATH}
        alt="Aura Divina"
        width={width}
        height={height}
        priority
        onError={() => setFailed(true)}
        className="h-auto w-auto max-w-full"
        style={{ maxWidth: width }}
      />
    </div>
  );
}

/**
 * SvgLogo — explicit SVG/CSS rendering of every variant. Used as fallback
 * and for compact contexts where the PNG is overkill.
 */
function SvgLogo({
  variant,
  className,
  ink,
  tagColor,
  size = 'md',
}: {
  variant: LogoProps['variant'];
  className?: string;
  ink: string;
  tagColor: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const markSize = MARK_SIZE_PX[size];

  if (variant === 'mark') {
    return (
      <span className={className} aria-label="Aura Divina">
        <AuraMonogram size={markSize} inkColor={ink} />
      </span>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div
        className={`inline-flex flex-col items-center leading-none ${className ?? ''}`}
        aria-label="Aura Divina"
      >
        <span
          className="font-serif text-3xl tracking-[0.14em]"
          style={{ color: ink, fontWeight: 500 }}
        >
          AURA DIVINA
        </span>
        <span
          className="mt-2 text-[9px] uppercase tracking-[0.32em]"
          style={{ color: tagColor }}
        >
          Tu esencia, tu estilo, tu aura divina.
        </span>
      </div>
    );
  }

  if (variant === 'stacked' || variant === 'full') {
    const markPx = variant === 'full' ? 110 : 92;
    return (
      <div
        className={`inline-flex flex-col items-center gap-5 ${className ?? ''}`}
        aria-label="Aura Divina"
      >
        <AuraMonogram size={markPx} inkColor={ink} />
        <div className="text-center leading-none">
          <div
            className="font-serif tracking-[0.14em]"
            style={{
              color: ink,
              fontWeight: 500,
              fontSize: variant === 'full' ? 36 : 30,
            }}
          >
            AURA DIVINA
          </div>
          <div
            className="mt-3 text-[10px] uppercase tracking-[0.28em]"
            style={{ color: tagColor }}
          >
            Tu esencia, tu estilo, tu aura divina.
          </div>
        </div>
      </div>
    );
  }

  // horizontal (default) — mark separated from the wordmark column,
  // wordmark + tagline stacked and both horizontally centered.
  // Font sizes scale with the `size` prop so a `sm` navbar doesn't feel
  // cramped while a `lg` hero still reads as headline.
  const wordmarkFontPx = size === 'sm' ? 22 : size === 'lg' ? 32 : 26;
  const taglineFontPx = size === 'sm' ? 7.5 : size === 'lg' ? 9 : 8.5;
  const gap = size === 'sm' ? 'gap-6' : 'gap-8';

  return (
    <div
      className={`inline-flex items-center ${gap} ${className ?? ''}`}
      aria-label="Aura Divina"
    >
      <AuraMonogram size={markSize} inkColor={ink} />
      <div className="flex flex-col items-center text-center leading-none">
        <div
          className="font-serif tracking-[0.14em] whitespace-nowrap"
          style={{ color: ink, fontWeight: 500, fontSize: wordmarkFontPx }}
        >
          AURA DIVINA
        </div>
        <div
          className="mt-1 uppercase tracking-[0.24em] whitespace-nowrap"
          style={{ color: tagColor, fontSize: taglineFontPx }}
        >
          Tu esencia, tu estilo
        </div>
      </div>
    </div>
  );
}

export function Logo({ variant = 'horizontal', className, invert = false, size = 'md' }: LogoProps) {
  const ink = invert ? '#fff5f8' : '#1a1518';
  const tagColor = invert ? '#fcd9e3' : '#6f4a2e';

  // For the big composed variants (stacked / full) try the canonical PNG first.
  // The PhotoLogo auto-falls-back to the SVG if the file 404s.
  if ((variant === 'stacked' || variant === 'full') && !invert) {
    const width = variant === 'full' ? 420 : 320;
    return (
      <PhotoLogo
        width={width}
        variant={variant}
        className={className}
        ink={ink}
        tagColor={tagColor}
      />
    );
  }

  // Compact variants always use the lightweight SVG rendering (faster, and
  // looks crisp at small sizes where the PNG would be overkill).
  return <SvgLogo variant={variant} className={className} ink={ink} tagColor={tagColor} size={size} />;
}
