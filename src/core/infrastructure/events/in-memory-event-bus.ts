/**
 * In-memory Event Bus (DEV).
 *
 * En producción esto se reemplaza por un BullMqEventBus que publica
 * `OrderCreatedEvent` a la queue `orders.created`. El worker (NestJS @Processor)
 * dispara los side-effects: notificación WhatsApp Business API, email
 * transaccional, sync de inventario y tracking analítico — todo async sin
 * bloquear el hilo de la request.
 */

import type { DomainEvent, EventBus } from '@/core/application/ports/event-bus';

/**
 * Buffer en memoria — fire-and-forget. No toca el JSON store para evitar
 * cualquier interacción con el write-lock del UoW. Suficiente para dev.
 */
const buffer: DomainEvent[] = [];

export class InMemoryEventBus implements EventBus {
  /** /// <inheritdoc /> */
  async publish<T>(event: DomainEvent<T>): Promise<void> {
    buffer.unshift(event as DomainEvent);
    if (buffer.length > 200) buffer.length = 200;
    // En BullMQ real:
    //   await this.queue.add(event.type, event.payload, { attempts: 5, backoff: 'exponential' });
    // eslint-disable-next-line no-console
    console.log(`[event-bus] ${event.type}`, JSON.stringify(event.payload));
  }

  static peek(): DomainEvent[] {
    return [...buffer];
  }
}
