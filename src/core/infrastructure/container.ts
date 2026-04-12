/**
 * Composition Root — wire de toda la inyección de dependencias.
 * Equivalente al DI container de NestJS pero hecho a mano para Next.js.
 */

import { JsonUnitOfWork } from './persistence/json-unit-of-work';
import { InMemoryEventBus } from './events/in-memory-event-bus';
import { CreateCashOnDeliveryOrderCommandHandler } from '@/core/application/commands/create-cod-order.handler';

export const ADMIN_WHATSAPP = '3187307977';

export const uow = new JsonUnitOfWork();
export const eventBus = new InMemoryEventBus();

export const createCodOrderHandler = new CreateCashOnDeliveryOrderCommandHandler(
  uow,
  eventBus,
  ADMIN_WHATSAPP,
);
