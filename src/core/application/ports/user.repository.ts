import type { User } from '@/core/domain/user';

/**
 * Repository port (Hexagonal) para el agregado User.
 * La normalización del email (lowercase/trim) es responsabilidad del dominio,
 * no del adaptador — siempre recibir email ya normalizado.
 */
export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  delete(id: string): Promise<void>;
}
