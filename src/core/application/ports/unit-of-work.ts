import type { OrderRepository } from './order.repository';
import type { ProductRepository } from './product.repository';
import type { CoverageRepository } from './coverage.repository';
import type { UserRepository } from './user.repository';

/**
 * Unit of Work — agrupa repositorios bajo una transacción atómica.
 * Implementación JSON: lock + snapshot/rollback en memoria.
 * Implementación PostgreSQL: BEGIN / COMMIT / ROLLBACK con `pg.PoolClient`.
 */
export interface UnitOfWork {
  orders: OrderRepository;
  products: ProductRepository;
  coverage: CoverageRepository;
  users: UserRepository;
  run<T>(work: (uow: UnitOfWork) => Promise<T>): Promise<T>;
}
