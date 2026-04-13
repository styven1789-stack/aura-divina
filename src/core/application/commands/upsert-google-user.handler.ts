/**
 * UpsertGoogleUserCommandHandler
 *
 * Flujo post-OAuth callback:
 *  1. Si existe un user con googleId → retornarlo (login).
 *  2. Si existe un user con ese email pero provider=credentials → vincular
 *     googleId al existente, marcar emailVerified=true (linking).
 *  3. Si no existe → crear nuevo user con provider=google.
 *  4. Reclamar pedidos invitado previos con el mismo email.
 */

import type { UnitOfWork } from '../ports/unit-of-work';
import type { User } from '@/core/domain/user';
import { normalizeEmail } from '@/core/domain/user';
import { claimGuestOrders } from './claim-guest-orders.handler';

export interface UpsertGoogleUserCommand {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface UpsertGoogleUserResult {
  user: User;
  claimedOrdersCount: number;
  wasLinked: boolean;
  wasCreated: boolean;
}

export class UpsertGoogleUserCommandHandler {
  /**
   * @param uow Unit of Work — encapsula lectura/escritura atómica del user.
   */
  constructor(private readonly uow: UnitOfWork) {}

  /** /// <inheritdoc /> */
  async execute(cmd: UpsertGoogleUserCommand): Promise<UpsertGoogleUserResult> {
    const email = normalizeEmail(cmd.email);

    return this.uow.run(async (tx) => {
      const byGoogleId = await tx.users.findByGoogleId(cmd.googleId);
      if (byGoogleId) {
        return { user: byGoogleId, claimedOrdersCount: 0, wasLinked: false, wasCreated: false };
      }

      const byEmail = await tx.users.findByEmail(email);
      if (byEmail) {
        byEmail.googleId = cmd.googleId;
        byEmail.emailVerified = true;
        byEmail.avatarUrl = byEmail.avatarUrl ?? cmd.avatarUrl;
        byEmail.updatedAt = new Date().toISOString();
        await tx.users.save(byEmail);
        const claimedOrdersCount = await claimGuestOrders(tx, byEmail);
        return { user: byEmail, claimedOrdersCount, wasLinked: true, wasCreated: false };
      }

      const now = new Date().toISOString();
      const user: User = {
        id: cryptoId(),
        email,
        emailVerified: true,
        name: cmd.name.trim() || email.split('@')[0],
        avatarUrl: cmd.avatarUrl,
        provider: 'google',
        googleId: cmd.googleId,
        addresses: [],
        createdAt: now,
        updatedAt: now,
      };
      await tx.users.save(user);
      const claimedOrdersCount = await claimGuestOrders(tx, user);
      return { user, claimedOrdersCount, wasLinked: false, wasCreated: true };
    });
  }
}

function cryptoId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
