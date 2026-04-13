import type { User } from '@/core/domain/user';
import type { UserRepository } from '@/core/application/ports/user.repository';
import type { DbShape } from './json-store';

export class JsonUserRepository implements UserRepository {
  constructor(private readonly db: DbShape) {}

  /** /// <inheritdoc /> */
  async save(user: User): Promise<void> {
    const idx = this.db.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) this.db.users[idx] = user;
    else this.db.users.push(user);
  }

  /** /// <inheritdoc /> */
  async findById(id: string): Promise<User | null> {
    return this.db.users.find((u) => u.id === id) ?? null;
  }

  /** /// <inheritdoc /> */
  async findByEmail(email: string): Promise<User | null> {
    return this.db.users.find((u) => u.email === email) ?? null;
  }

  /** /// <inheritdoc /> */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.db.users.find((u) => u.googleId === googleId) ?? null;
  }

  /** /// <inheritdoc /> */
  async delete(id: string): Promise<void> {
    this.db.users = this.db.users.filter((u) => u.id !== id);
  }
}
