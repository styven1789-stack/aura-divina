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
  { href: '/pedido', label: 'Rastrear' },
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
          <a
            href="https://www.instagram.com/auradivina.shoping"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram @auradivina.shoping"
            className="hidden lg:inline-flex w-9 h-9 rounded-full border border-rose-150 items-center justify-center text-ink-700 hover:text-gold-600 hover:border-gold-500 transition"
          >
            <InstagramIcon />
          </a>
          <a
            href="https://www.facebook.com/share/1BU2bxyGPp/?mibextid=wwXIfr"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className="hidden lg:inline-flex w-9 h-9 rounded-full border border-rose-150 items-center justify-center text-ink-700 hover:text-gold-600 hover:border-gold-500 transition"
          >
            <FacebookIcon />
          </a>
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
function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeLinecap="round" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
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
