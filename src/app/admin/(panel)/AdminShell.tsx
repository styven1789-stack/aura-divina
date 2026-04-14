'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { MenuIcon, Close } from '@/components/icons';
import { useEscape } from '@/components/ui/Toast';

const LINKS = [
  { href: '/admin',           label: 'Dashboard',          icon: '📊' },
  { href: '/admin/productos', label: 'Productos',          icon: '💍' },
  { href: '/admin/pedidos',   label: 'Pedidos',            icon: '📦' },
  { href: '/admin/zonas',     label: 'Zonas de cobertura', icon: '📍' },
  { href: '/',                label: 'Ver tienda ↗',       icon: '🏠' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEscape(open, () => setOpen(false));
  useEffect(() => { setOpen(false); }, [pathname]);

  const current = LINKS.find((l) => l.href === pathname)?.label ?? 'Admin';

  return (
    <div className="min-h-[100dvh] flex bg-rose-50">
      {/* Sidebar fijo lg+ */}
      <aside className="w-64 hidden lg:flex flex-col bg-ink-900 text-rose-50">
        <div className="p-6 border-b border-white/10"><Logo invert /></div>
        <nav className="flex-1 p-4 space-y-1">
          {LINKS.map((l) => (
            <SideLink key={l.href} {...l} active={l.href === pathname} />
          ))}
        </nav>
        <form action="/api/admin/logout" method="post" className="p-4 border-t border-white/10">
          <button className="w-full text-left text-fluid-xs uppercase tracking-widest text-rose-150/70 hover:text-gold-400">
            Cerrar sesión →
          </button>
        </form>
      </aside>

      {/* Panel derecho */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header móvil/tablet */}
        <header className="lg:hidden bg-ink-900 text-rose-50 px-4 py-3 flex items-center justify-between gap-3 sticky top-0 z-30 safe-pt">
          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls="admin-drawer"
            className="tap-target grid place-items-center rounded-xl hover:bg-white/10"
          >
            <MenuIcon />
          </button>
          <p className="flex-1 text-fluid-sm font-serif truncate text-center">{current}</p>
          <Logo invert />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-10 min-w-0">{children}</main>
      </div>

      {/* Drawer + backdrop lg:hidden */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm animate-in fade-in"
          />
          <aside
            id="admin-drawer"
            className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-ink-900 text-rose-50 flex flex-col safe-pt safe-pb shadow-luxe animate-in slide-in-from-left"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <Logo invert />
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="tap-target grid place-items-center rounded-xl hover:bg-white/10"
              >
                <Close size={22} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {LINKS.map((l) => (
                <SideLink key={l.href} {...l} active={l.href === pathname} />
              ))}
            </nav>
            <form action="/api/admin/logout" method="post" className="p-4 border-t border-white/10">
              <button className="w-full text-left text-fluid-xs uppercase tracking-widest text-rose-150/70 hover:text-gold-400">
                Cerrar sesión →
              </button>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}

function SideLink({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-fluid-sm transition tap-target ${
        active ? 'bg-white/10 text-gold-400' : 'hover:bg-white/5 text-rose-50'
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="uppercase tracking-widest text-fluid-xs">{label}</span>
    </Link>
  );
}
