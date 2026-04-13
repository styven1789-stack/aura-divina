/**
 * Reclamo de pedidos invitado.
 *
 * Llamado desde RegisterUser y UpsertGoogleUser dentro del mismo UoW.
 * Busca todas las órdenes sin userId cuyo shipping.email coincide con el
 * usuario recién creado/vinculado y les asigna userId.
 *
 * Retorna la cantidad reclamada.
 */

import type { UnitOfWork } from '../ports/unit-of-work';
import type { User } from '@/core/domain/user';

/**
 * Mutaciones en el mismo `tx` del UoW — no abrir otra transacción.
 */
export async function claimGuestOrders(tx: UnitOfWork, user: User): Promise<number> {
  const candidates = await tx.orders.findUnclaimedByEmail(user.email);
  if (candidates.length === 0) return 0;
  for (const order of candidates) {
    order.userId = user.id;
    await tx.orders.save(order);
  }
  return candidates.length;
}
