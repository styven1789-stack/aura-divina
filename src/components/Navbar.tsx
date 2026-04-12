'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Logo } from './brand/Logo';
import { useCart } from '@/store/cart.store';

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Tienda' },
  { href: '/productos?cat=anillos', label: 'Anillos' },
  { href: '/productos?cat=collares', label: 'Collares' },
  { href: '/productos?cat=aretes', label: 'Aretes' },
];

export default function Navbar() {
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.quantity, 0));
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-rose-50/85 border-b border-rose-150">
      <div className="container-aura flex items-center justify-between h-20">
        <Link href="/" className="shrink-0">
          <Logo variant="horizontal" />
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm uppercase tracking-widest text-ink-700 hover:text-gold-600 transition"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/login"
            className="hidden lg:inline-flex text-xs uppercase tracking-widest text-ink-600 hover:text-gold-600"
          >
            Admin
          </Link>
          <Link href="/carrito" className="relative btn-ghost !py-2.5 !px-4">
            <CartIcon />
            <span className="text-sm">Carrito</span>
            {mounted && count > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold-500 text-ink-900 text-[10px] font-bold rounded-full w-5 h-5 grid place-items-center shadow">
                {count}
              </span>
            )}
          </Link>
          <button
            className="md:hidden btn-ghost !p-2.5"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menú"
          >
            <BurgerIcon />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-rose-150 bg-rose-50">
          <div className="container-aura flex flex-col py-3">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm uppercase tracking-widest text-ink-700 border-b border-rose-150/60"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 6h15l-1.5 9h-12z" strokeLinejoin="round" />
      <path d="M6 6L4 2H1" strokeLinecap="round" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
    </svg>
  );
}
function BurgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}
