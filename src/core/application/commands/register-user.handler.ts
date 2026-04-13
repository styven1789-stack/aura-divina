/**
 * RegisterUserCommandHandler
 *
 * Responsabilidades:
 *  1. Validar email + password (reglas de dominio).
 *  2. Rechazar si el email ya existe.
 *  3. Hashear password con scrypt.
 *  4. Persistir el agregado User dentro de una transacción.
 *  5. Reclamar pedidos invitado previos con el mismo email (mismo UoW).
 *
 * Retorna el User persistido y el número de pedidos reclamados.
 */

import type { UnitOfWork } from '../ports/unit-of-work';
import type { User } from '@/core/domain/user';
import { normalizeEmail } from '@/core/domain/user';
import {
  EmailAlreadyExistsException,
  InvalidEmailException,
  WeakPasswordException,
} from '@/core/domain/errors';
import { hashPassword } from '@/lib/password';
import { isValidEmail, isStrongEnoughPassword } from '@/lib/validation';
import { claimGuestOrders } from './claim-guest-orders.handler';

export interface RegisterUserCommand {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface RegisterUserResult {
  user: User;
  claimedOrdersCount: number;
}

export class RegisterUserCommandHandler {
  /**
   * @param uow Unit of Work — atomiza creación de usuario + reclamo de pedidos.
   */
  constructor(private readonly uow: UnitOfWork) {}

  /** /// <inheritdoc /> */
  async execute(cmd: RegisterUserCommand): Promise<RegisterUserResult> {
    const email = normalizeEmail(cmd.email);
    if (!isValidEmail(email)) throw new InvalidEmailException();
    if (!isStrongEnoughPassword(cmd.password)) throw new WeakPasswordException();

    const passwordHash = await hashPassword(cmd.password);

    return this.uow.run(async (tx) => {
      const existing = await tx.users.findByEmail(email);
      if (existing) throw new EmailAlreadyExistsException(email);

      const now = new Date().toISOString();
      const user: User = {
        id: cryptoId(),
        email,
        emailVerified: false,
        name: cmd.name.trim(),
        phone: cmd.phone?.trim() || undefined,
        provider: 'credentials',
        passwordHash,
        addresses: [],
        createdAt: now,
        updatedAt: now,
      };
      await tx.users.save(user);

      const claimedOrdersCount = await claimGuestOrders(tx, user);

      return { user, claimedOrdersCount };
    });
  }
}

/** Genera un id resistente a colisiones (uuid v4 RFC 4122). */
function cryptoId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
