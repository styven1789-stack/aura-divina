/**
 * AuthenticateUserCommandHandler
 *
 * Verifica credenciales (email + password) y retorna el User si son válidas.
 * Para no filtrar si existe o no el email, lanza InvalidCredentialsException
 * en ambos casos (usuario inexistente O password incorrecta).
 */

import type { UnitOfWork } from '../ports/unit-of-work';
import type { User } from '@/core/domain/user';
import { normalizeEmail } from '@/core/domain/user';
import { InvalidCredentialsException } from '@/core/domain/errors';
import { verifyPassword } from '@/lib/password';

export interface AuthenticateUserCommand {
  email: string;
  password: string;
}

export class AuthenticateUserCommandHandler {
  /**
   * @param uow Unit of Work — lectura del usuario.
   */
  constructor(private readonly uow: UnitOfWork) {}

  /** /// <inheritdoc /> */
  async execute(cmd: AuthenticateUserCommand): Promise<User> {
    const email = normalizeEmail(cmd.email);
    return this.uow.run(async (tx) => {
      const user = await tx.users.findByEmail(email);
      if (!user || !user.passwordHash) throw new InvalidCredentialsException();
      const ok = await verifyPassword(cmd.password, user.passwordHash);
      if (!ok) throw new InvalidCredentialsException();
      return user;
    });
  }
}
