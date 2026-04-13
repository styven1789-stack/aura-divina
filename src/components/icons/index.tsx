/**
 * Set de iconos compartido de Aura Divina.
 *
 * Todos los iconos usan el mismo viewBox 24×24, stroke currentColor,
 * strokeWidth configurable (default 1.8). Se consumen por import nombrado:
 *   import { TruckIcon } from '@/components/icons';
 */

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number };

const baseProps = (p: IconProps) => ({
  width: p.size ?? 20,
  height: p.size ?? 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: p.strokeWidth ?? 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...p,
});

export function TruckIcon(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

export function ShieldIcon(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <path d="M12 2l9 4v6c0 5-3.8 9.4-9 10-5.2-.6-9-5-9-10V6l9-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function CashIcon(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 10v.01M18 14v.01" />
    </svg>
  );
}

export function LeafIcon(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <path d="M11 20A7 7 0 019.8 6.14a12 12 0 0110.2-3.14 12 12 0 01-3.14 10.2A7 7 0 0111 20z" />
      <path d="M2 22l8-8" />
    </svg>
  );
}

export function SparkleIcon(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" />
    </svg>
  );
}

export function HeartIcon(p: IconProps & { filled?: boolean }) {
  const { filled, ...rest } = p;
  return (
    <svg {...baseProps(rest)} fill={filled ? 'currentColor' : 'none'}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

export function StarIcon(p: IconProps & { filled?: boolean; half?: boolean }) {
  const { filled, half, ...rest } = p;
  if (half) {
    return (
      <svg {...baseProps(rest)}>
        <defs>
          <linearGradient id="half-star">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="url(#half-star)"
        />
      </svg>
    );
  }
  return (
    <svg {...baseProps(rest)} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function ChevronRight(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function ChevronLeft(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}

export function ChevronDown(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function Close(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <path d="M6 6l12 12M6 18L18 6" />
    </svg>
  );
}

export function Plus(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function Minus(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function Search(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export function User(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0116 0" />
    </svg>
  );
}

export function Bag(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <path d="M6 7h12l-1 13H7L6 7z" />
      <path d="M9 7V5a3 3 0 016 0v2" />
    </svg>
  );
}

export function Zoom(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35M8 11h6M11 8v6" />
    </svg>
  );
}

export function Check(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export function HomeIcon(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <path d="M3 10l9-7 9 7v11a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2V10z" />
    </svg>
  );
}

export function PackageIcon(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <path d="M3.27 6.96L12 12l8.73-5.04M12 22V12" />
    </svg>
  );
}

export function MailIcon(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}

export function InstagramIcon(p: IconProps) {
  return (
    <svg {...baseProps(p)}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function FacebookIcon(p: IconProps) {
  return (
    <svg
      width={p.size ?? 20}
      height={p.size ?? 20}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...p}
    >
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
    </svg>
  );
}

export function MenuIcon(p: IconProps) {
  return (
    <svg {...baseProps(p)} strokeWidth={p.strokeWidth ?? 2}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
