'use client';

/**
 * Bottom navigation flotante para móvil — solo visible en pantallas <md.
 * Acceso de un toque a las 4 secciones críticas.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/store/cart.store';
import { HomeIcon, PackageIcon, Bag, User } from './icons';
import type { ComponentType } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  matchPrefix?: string;
  isCart?: boolean;
  isAccount?: boolean;
}

const NAV: NavItem[] = [
  { href: '/', label: 'Inicio', icon: HomeIcon },
  { href: '/productos', label: 'Tienda', icon: PackageIcon, matchPrefix: '/productos' },
  { href: '/cuenta', label: 'Cuenta', icon: User, matchPrefix: '/cuenta', isAccount: true },
  { href: '/carrito', label: 'Carrito', icon: Bag, isCart: true },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.quantity, 0));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <nav
      aria-label="Navegación móvil"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-rose-50/95 backdrop-blur-md border-t border-rose-150"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <ul className="grid grid-cols-4">
        {NAV.map((n) => {
          const active =
            n.href === '/'
              ? pathname === '/'
              : pathname.startsWith(n.matchPrefix ?? n.href);
          const Icon = n.icon;
          return (
            <li key={n.href}>
              <Link
                href={n.href}
                className={
                  'flex flex-col items-center justify-center py-2.5 gap-0.5 transition relative focus-visible:outline-none focus-visible:bg-rose-100 ' +
                  (active ? 'text-gold-700' : 'text-ink-700 hover:text-gold-700')
                }
              >
                <span className={'relative grid place-items-center ' + (active ? '' : 'opacity-80')}>
                  <Icon size={22} />
                  {n.isCart && mounted && count > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-gold-500 text-ink-900 text-[9px] font-bold rounded-full w-4 h-4 grid place-items-center shadow">
                      {count}
                    </span>
                  )}
                </span>
                <span className="text-[10px] uppercase tracking-widest font-medium">{n.label}</span>
                {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gold-500 rounded-full" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
