import type { Order, OrderStatus } from '@/core/domain/order';

/**
 * Repository port (Hexagonal). El dominio no conoce la implementación concreta.
 */
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByCode(code: string): Promise<Order | null>;
  list(filter?: { status?: OrderStatus }): Promise<Order[]>;
  findByUserId(userId: string): Promise<Order[]>;
  findUnclaimedByEmail(email: string): Promise<Order[]>;
  updateStatus(id: string, status: OrderStatus): Promise<void>;
}
