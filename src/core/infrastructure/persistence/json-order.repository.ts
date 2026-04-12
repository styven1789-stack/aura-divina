import type { Order, OrderStatus } from '@/core/domain/order';
import type { OrderRepository } from '@/core/application/ports/order.repository';
import type { DbShape } from './json-store';

export class JsonOrderRepository implements OrderRepository {
  constructor(private readonly db: DbShape) {}

  /** /// <inheritdoc /> */
  async save(order: Order): Promise<void> {
    const idx = this.db.orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) this.db.orders[idx] = order;
    else this.db.orders.push(order);
  }

  /** /// <inheritdoc /> */
  async findById(id: string): Promise<Order | null> {
    return this.db.orders.find((o) => o.id === id) ?? null;
  }

  /** /// <inheritdoc /> */
  async findByCode(code: string): Promise<Order | null> {
    return this.db.orders.find((o) => o.code === code) ?? null;
  }

  /** /// <inheritdoc /> */
  async list(filter?: { status?: OrderStatus }): Promise<Order[]> {
    return this.db.orders
      .filter((o) => (filter?.status ? o.status === filter.status : true))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /** /// <inheritdoc /> */
  async updateStatus(id: string, status: OrderStatus): Promise<void> {
    const order = this.db.orders.find((o) => o.id === id);
    if (!order) return;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (status === 'CONFIRMED_WHATSAPP') order.whatsappConfirmedAt = order.updatedAt;
  }
}
