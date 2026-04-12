'use client';

/**
 * Bottom navigation flotante para móvil — solo se ve en pantallas <md.
 * Acceso de un toque a las 4 secciones críticas. Se eleva sobre el FAB de
 * WhatsApp añadiendo padding al fab y safe-area inset bottom.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/store/cart.store';

const NAV = [
  { href: '/', label: 'Inicio', icon: HomeIcon },
  { href: '/productos', label: 'Tienda', icon: BagIcon },
  { href: '/pedido', label: 'Pedido', icon: TruckIcon },
  { href: '/carrito', label: 'Carrito', icon: CartIcon, isCart: true },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.quantity, 0));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-rose-50/95 backdrop-blur-md border-t border-rose-150"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
    >
      <ul className="grid grid-cols-4">
        {NAV.map((n) => {
          const active = n.href === '/' ? pathname === '/' : pathname.startsWith(n.href);
          const Icon = n.icon;
          return (
            <li key={n.href}>
              <Link
                href={n.href}
                className={
                  'flex flex-col items-center justify-center py-2.5 gap-0.5 transition relative ' +
                  (active ? 'text-gold-600' : 'text-ink-700 hover:text-gold-600')
                }
              >
                <span className={'relative grid place-items-center ' + (active ? '' : 'opacity-80')}>
                  <Icon />
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

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2h-4a2 2 0 01-2-2v-5h-2v5a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <path d="M3 6h18M16 10a4 4 0 11-8 0" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="19" r="2" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6" />
    </svg>
  );
}
