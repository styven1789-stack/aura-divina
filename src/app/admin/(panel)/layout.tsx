import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { getAdminSession } from '@/lib/auth';

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  return (
    <div className="min-h-screen flex bg-rose-50">
      <aside className="w-64 hidden md:flex flex-col bg-ink-900 text-rose-50">
        <div className="p-6 border-b border-white/10">
          <Logo invert />
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <SideLink href="/admin" label="Dashboard" icon="📊" />
          <SideLink href="/admin/productos" label="Productos" icon="💍" />
          <SideLink href="/admin/pedidos" label="Pedidos" icon="📦" />
          <SideLink href="/admin/zonas" label="Zonas de cobertura" icon="📍" />
          <SideLink href="/" label="Ver tienda ↗" icon="🏠" />
        </nav>
        <form action="/api/admin/logout" method="post" className="p-4 border-t border-white/10">
          <button className="w-full text-left text-xs uppercase tracking-widest text-rose-150/70 hover:text-gold-400">
            Cerrar sesión →
          </button>
        </form>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-ink-900 text-rose-50 p-4 flex items-center justify-between">
          <Logo invert />
          <Link href="/admin" className="text-xs uppercase tracking-widest">Admin</Link>
        </header>
        <main className="flex-1 p-6 md:p-10 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}

function SideLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm transition">
      <span className="text-base">{icon}</span>
      <span className="uppercase tracking-widest text-[11px]">{label}</span>
    </Link>
  );
}
