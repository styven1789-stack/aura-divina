import type { UnitOfWork } from '@/core/application/ports/unit-of-work';
import { transaction, type DbShape } from './json-store';
import { JsonOrderRepository } from './json-order.repository';
import { JsonProductRepository } from './json-product.repository';
import { JsonCoverageRepository } from './json-coverage.repository';
import { JsonUserRepository } from './json-user.repository';

/**
 * UoW basado en JSON store. Cada llamada a `run` crea repositorios nuevos
 * vinculados al snapshot transaccional. Si la callback lanza, se hace rollback.
 */
export class JsonUnitOfWork implements UnitOfWork {
  // Por contrato del puerto: estos no se usan directamente; siempre via run().
  orders!: JsonOrderRepository;
  products!: JsonProductRepository;
  coverage!: JsonCoverageRepository;
  users!: JsonUserRepository;

  /** /// <inheritdoc /> */
  async run<T>(work: (uow: UnitOfWork) => Promise<T>): Promise<T> {
    return transaction(async (db: DbShape) => {
      const tx: UnitOfWork = {
        orders: new JsonOrderRepository(db),
        products: new JsonProductRepository(db),
        coverage: new JsonCoverageRepository(db),
        users: new JsonUserRepository(db),
        run: () => Promise.reject(new Error('No nested UoW')),
      };
      return work(tx);
    });
  }
}
