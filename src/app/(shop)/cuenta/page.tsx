import { redirect } from 'next/navigation';
import { getUserSession } from '@/lib/auth';
import { uow } from '@/core/infrastructure/container';
import { toPublicUser } from '@/core/domain/user';
import AccountDashboard from './AccountDashboard';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await getUserSession();
  if (!session) redirect('/cuenta/ingresar?next=/cuenta');

  const { user, orders } = await uow.run(async (tx) => {
    const user = await tx.users.findById(session.userId);
    if (!user) return { user: null, orders: [] };
    const orders = await tx.orders.findByUserId(user.id);
    return { user, orders };
  });

  if (!user) redirect('/cuenta/ingresar');
  return <AccountDashboard initialUser={toPublicUser(user)} initialOrders={orders} />;
}
