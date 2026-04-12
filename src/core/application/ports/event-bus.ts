/**
 * Event Bus — abstracción para publicar eventos de dominio.
 * Implementación productiva: BullMQ + Redis (encolar jobs OrderCreatedJob).
 * Implementación dev/local: in-memory queue persistida en JSON.
 */

export interface DomainEvent<T = unknown> {
  type: string;
  occurredAt: string;
  payload: T;
}

export interface EventBus {
  publish<T>(event: DomainEvent<T>): Promise<void>;
}
