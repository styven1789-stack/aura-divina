/**
 * Composition Root — wire de toda la inyección de dependencias.
 * Equivalente al DI container de NestJS pero hecho a mano para Next.js.
 */

import { JsonUnitOfWork } from './persistence/json-unit-of-work';
import { InMemoryEventBus } from './events/in-memory-event-bus';
import { CreateCashOnDeliveryOrderCommandHandler } from '@/core/application/commands/create-cod-order.handler';
import { RegisterUserCommandHandler } from '@/core/application/commands/register-user.handler';
import { AuthenticateUserCommandHandler } from '@/core/application/commands/authenticate-user.handler';
import { UpsertGoogleUserCommandHandler } from '@/core/application/commands/upsert-google-user.handler';
import { AccountCommandHandlers } from '@/core/application/commands/account.handlers';

export const ADMIN_WHATSAPP = '3187307977';

export const uow = new JsonUnitOfWork();
export const eventBus = new InMemoryEventBus();

export const createCodOrderHandler = new CreateCashOnDeliveryOrderCommandHandler(
  uow,
  eventBus,
  ADMIN_WHATSAPP,
);

export const registerUserHandler = new RegisterUserCommandHandler(uow);
export const authenticateUserHandler = new AuthenticateUserCommandHandler(uow);
export const upsertGoogleUserHandler = new UpsertGoogleUserCommandHandler(uow);
export const accountHandlers = new AccountCommandHandlers(uow);
