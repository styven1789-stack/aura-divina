'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from './brand/Logo';
import { useCart } from '@/store/cart.store';
import { Bag, User, MenuIcon, InstagramIcon, FacebookIcon } from './icons';

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Tienda' },
  { href: '/productos?cat=anillos', label: 'Anillos' },
  { href: '/productos?cat=collares', label: 'Collares' },
  { href: '/productos?cat=aretes', label: 'Aretes' },
  { href: '/pedido', label: 'Rastrear' },
];

interface MeUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export default function Navbar() {
  const router = useRouter();
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.quantity, 0));
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<MeUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d: { user: MeUser | null }) => setMe(d.user))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setMe(null);
    setMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-rose-50/85 border-b border-rose-150">
      <div className="container-aura flex items-center justify-between h-16 md:h-20 gap-4 md:gap-6 lg:gap-8">
        <Link href="/" className="shrink-0">
          <Logo variant="horizontal" size="sm" />
        </Link>

        <nav className="hidden md:flex items-center gap-5 lg:gap-7">
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
            <Bag size={18} />
            <span className="text-sm hidden sm:inline">Carrito</span>
            {mounted && count > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold-500 text-ink-900 text-fluid-xs font-bold rounded-full w-5 h-5 grid place-items-center shadow">
                {count}
              </span>
            )}
          </Link>

          {mounted && !me && (
            <Link href="/cuenta/ingresar" className="hidden md:inline-flex btn-ghost !py-2.5 !px-4">
              <User size={16} />
              <span className="text-sm">Ingresar</span>
            </Link>
          )}
          {mounted && me && (
            <div className="relative hidden md:block" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="btn-ghost !py-2 !px-3 inline-flex items-center gap-2"
                aria-label="Mi cuenta"
              >
                {me.avatarUrl ? (
                  <Image
                    src={me.avatarUrl}
                    alt=""
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-rose-100 grid place-items-center text-xs font-serif text-gold-600">
                    {me.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="text-sm">{me.name.split(' ')[0]}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 card-soft !p-2 z-50 animate-in fade-in">
                  <Link href="/cuenta" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm rounded-xl hover:bg-rose-100">Mi cuenta</Link>
                  <Link href="/cuenta?tab=pedidos" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm rounded-xl hover:bg-rose-100">Mis pedidos</Link>
                  <div className="h-px bg-rose-150 my-1" />
                  <button onClick={logout} className="w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-rose-100 text-rose-700">Cerrar sesión</button>
                </div>
              )}
            </div>
          )}

          <button
            className="md:hidden btn-ghost !p-2.5"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menú"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-rose-150 bg-rose-50 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain"
        >
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
            {!me ? (
              <Link
                href="/cuenta/ingresar"
                onClick={() => setOpen(false)}
                className="py-3 text-sm uppercase tracking-widest text-gold-600 font-semibold"
              >
                Ingresar
              </Link>
            ) : (
              <>
                <Link
                  href="/cuenta"
                  onClick={() => setOpen(false)}
                  className="py-3 text-sm uppercase tracking-widest text-ink-700 border-b border-rose-150/60"
                >
                  Mi cuenta
                </Link>
                <button
                  onClick={() => { setOpen(false); logout(); }}
                  className="py-3 text-sm uppercase tracking-widest text-rose-700 text-left"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

