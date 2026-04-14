'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { PublicUser } from '@/core/domain/user';
import type { Order } from '@/core/domain/order';
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '@/core/domain/order';
import { formatCOP } from '@/lib/money';
import { useToast } from '@/components/ui/Toast';
import ClientDate from '@/components/ClientDate';
import ProfileSection from './ProfileSection';
import AddressesSection from './AddressesSection';

type Tab = 'perfil' | 'direcciones' | 'pedidos';

export default function AccountDashboard({ initialUser, initialOrders }: { initialUser: PublicUser; initialOrders: Order[] }) {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState<PublicUser>(initialUser);
  const [orders] = useState<Order[]>(initialOrders);
  const [tab, setTab] = useState<Tab>('perfil');

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.info('Sesión cerrada', 'Hasta pronto ✨');
    router.push('/');
    router.refresh();
  };

  return (
    <section className="container-aura py-12">
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-fluid-xs uppercase tracking-widest2 text-gold-600">Mi cuenta</p>
          <h1 className="h-display text-fluid-4xl text-ink-900">Hola, {user.name.split(' ')[0]}</h1>
          <p className="text-ink-700/70 mt-1 text-fluid-sm">{user.email}</p>
        </div>
        <button onClick={logout} className="btn-ghost">Cerrar sesión</button>
      </div>

      <div className="flex overflow-x-auto scrollbar-none gap-2 mb-8 -mx-4 px-4 snap-x snap-mandatory sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
        <TabChip active={tab === 'perfil'} onClick={() => setTab('perfil')}>Perfil</TabChip>
        <TabChip active={tab === 'direcciones'} onClick={() => setTab('direcciones')}>
          Direcciones {user.addresses.length > 0 ? `· ${user.addresses.length}` : ''}
        </TabChip>
        <TabChip active={tab === 'pedidos'} onClick={() => setTab('pedidos')}>
          Pedidos {orders.length > 0 ? `· ${orders.length}` : ''}
        </TabChip>
      </div>

      {tab === 'perfil' && <ProfileSection user={user} onChange={setUser} />}
      {tab === 'direcciones' && <AddressesSection user={user} onChange={setUser} />}
      {tab === 'pedidos' && <OrdersSection orders={orders} />}
    </section>
  );
}

function TabChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={
        'text-fluid-xs uppercase tracking-widest px-4 py-2.5 rounded-full border transition snap-start shrink-0 tap-target ' +
        (active ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-ink-700 border-rose-150 hover:border-gold-500')
      }
    >
      {children}
    </button>
  );
}

function OrdersSection({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="card-soft p-16 text-center">
        <p className="text-ink-700">Aún no tienes pedidos.</p>
        <Link href="/productos" className="btn-gold mt-6 inline-flex">Explorar productos</Link>
      </div>
    );
  }
  return (
    <div className="grid gap-3 md:gap-4">
      {orders.map((o) => (
        <Link
          key={o.id}
          href={`/pedido/${o.code}`}
          className="card-soft p-4 sm:p-5 hover:border-gold-500 transition grid grid-cols-[1fr_auto] xs:grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] gap-x-4 gap-y-2 items-center"
        >
          <div className="min-w-0">
            <p className="font-mono text-gold-600 font-semibold">{o.code}</p>
            <p className="text-fluid-xs text-ink-600 mt-0.5"><ClientDate iso={o.createdAt} /></p>
          </div>
          <div className="text-fluid-sm text-ink-700 col-span-2 xs:col-span-1 truncate min-w-0">
            {o.items.length === 1
              ? o.items[0].name
              : `${o.items[0].name} y ${o.items.length - 1} más`}
          </div>
          <span className={`inline-flex justify-self-start xs:justify-self-auto text-fluid-xs uppercase tracking-widest px-2 py-1 rounded-full border ${ORDER_STATUS_COLOR[o.status]}`}>
            {ORDER_STATUS_LABEL[o.status]}
          </span>
          <span className="font-semibold text-ink-900 justify-self-end">{formatCOP(o.totalCOP)}</span>
        </Link>
      ))}
    </div>
  );
}
