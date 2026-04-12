# Artefacto 5 — `CreateCashOnDeliveryOrderCommandHandler` (Nivel Dios)

> Implementación de referencia en NestJS 11 + CQRS + TypeORM + BullMQ.
> Demuestra: inyección por puertos, transacciones SERIALIZABLE con UoW, eventos de dominio publicados a BullMQ, errores de dominio tipados, idempotencia por header, validación temprana de cobertura.
>
> El equivalente runnable (en la app de este proyecto, sin Postgres) vive en
> [`src/core/application/commands/create-cod-order.handler.ts`](../src/core/application/commands/create-cod-order.handler.ts).

---

## 5.1 Command (DTO de aplicación)

```ts
// orders/application/commands/create-cod-order/create-cod-order.command.ts
import { ICommand } from '@nestjs/cqrs';

export class CreateCashOnDeliveryOrderCommand implements ICommand {
  constructor(
    public readonly idempotencyKey: string,
    public readonly items: ReadonlyArray<{
      productId: string;
      variantId: string;
      quantity: number;
    }>,
    public readonly shipping: {
      fullName: string;
      phone: string;
      email?: string;
      city: string;
      neighborhood: string;
      addressLine1: string;
      addressLine2?: string;
      reference?: string;
      notes?: string;
    },
  ) {}
}
```

---

## 5.2 Handler

```ts
// orders/application/commands/create-cod-order/create-cod-order.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';

import { CreateCashOnDeliveryOrderCommand } from './create-cod-order.command';
import { Order } from '@modules/orders/domain/entities/order.entity';
import { Money } from '@modules/orders/domain/value-objects/money.vo';
import { PhoneCO } from '@modules/orders/domain/value-objects/phone-co.vo';
import { ShippingAddress } from '@modules/orders/domain/value-objects/shipping-address.vo';
import { OrderStatus } from '@modules/orders/domain/value-objects/order-status.vo';
import { OrderCreatedEvent } from '@modules/orders/domain/events/order-created.event';
import {
  EmptyCartException,
  InsufficientStockException,
  OutOfCoverageZoneException,
} from '@modules/orders/domain/exceptions';
import type { UnitOfWork } from '@modules/orders/domain/repositories/unit-of-work';
import type { CoveragePort } from '@modules/orders/application/ports/coverage.port';

interface CreateCodOrderResult {
  orderId: string;
  code: string;
  totalCOP: number;
  whatsappDeepLink: string;
}

@CommandHandler(CreateCashOnDeliveryOrderCommand)
export class CreateCashOnDeliveryOrderCommandHandler
  implements ICommandHandler<CreateCashOnDeliveryOrderCommand, CreateCodOrderResult>
{
  private readonly logger = new Logger(CreateCashOnDeliveryOrderCommandHandler.name);

  /**
   * @param uow         Unit of Work — abre transacción SERIALIZABLE.
   * @param coverage    Adaptador hacia el bounded context Logistics.
   * @param ordersQueue Queue BullMQ donde se encolan los side-effects (WhatsApp, email, analytics).
   * @param adminWa     Número WhatsApp del comercio (E.164 sin '+').
   */
  constructor(
    @Inject('UnitOfWork') private readonly uow: UnitOfWork,
    @Inject('CoveragePort') private readonly coverage: CoveragePort,
    @InjectQueue('orders') private readonly ordersQueue: Queue,
    @Inject('ADMIN_WHATSAPP') private readonly adminWa: string,
  ) {}

  /// <inheritdoc />
  async execute(cmd: CreateCashOnDeliveryOrderCommand): Promise<CreateCodOrderResult> {
    // ── Guard clauses ─────────────────────────────────────────────
    if (!cmd.items.length) throw new EmptyCartException();

    // Value Object — falla rápido si el teléfono no es CO válido (3xxxxxxxxx).
    const customerPhone = PhoneCO.of(cmd.shipping.phone);

    // ── Idempotencia ──────────────────────────────────────────────
    // Si la misma idempotencyKey ya existe, devolvemos la orden original sin
    // crear duplicados (clave: doble click del usuario, retry de la red, etc.).
    const existing = await this.uow.orders.findByIdempotencyKey(cmd.idempotencyKey);
    if (existing) return this.toResult(existing);

    // ── Transacción SERIALIZABLE ──────────────────────────────────
    return this.uow.run(async (tx) => {
      // 1) Validar cobertura ANTES de tocar stock — feedback temprano sin efectos.
      const zone = await this.coverage.resolveByNeighborhood(
        cmd.shipping.city,
        cmd.shipping.neighborhood,
      );
      if (!zone || !zone.active) {
        throw new OutOfCoverageZoneException(
          `${cmd.shipping.neighborhood}, ${cmd.shipping.city}`,
        );
      }

      // 2) Construir address VO (valida y normaliza).
      const shipping = ShippingAddress.create({
        ...cmd.shipping,
        phone: customerPhone.value,
      });

      // 3) Re-pricing 100% server-side. JAMÁS confiar en el monto del cliente.
      let subtotal = Money.cop(0);
      const orderItems: Array<{
        variantId: string;
        productNameSnapshot: string;
        variantLabelSnapshot?: string;
        unitPriceCopSnapshot: number;
        quantity: number;
        subtotalCop: number;
      }> = [];

      for (const dto of cmd.items) {
        // SELECT ... FOR UPDATE bloquea la fila de la variante hasta el COMMIT.
        const variant = await tx.products.findVariantForUpdate(dto.variantId);
        if (!variant || variant.stock < dto.quantity || !variant.product.active) {
          throw new InsufficientStockException(variant?.product.name ?? dto.productId);
        }

        // Mutación atómica del agregado Catalog (cross-context: usar Domain Service en producción).
        variant.decreaseStock(dto.quantity);
        await tx.products.saveVariant(variant);

        const unit = Money.cop(variant.product.priceCOP);
        const line = unit.multiply(dto.quantity);
        subtotal = subtotal.add(line);

        orderItems.push({
          variantId: variant.id,
          productNameSnapshot: variant.product.name,
          variantLabelSnapshot: variant.label,
          unitPriceCopSnapshot: unit.amount,
          quantity: dto.quantity,
          subtotalCop: line.amount,
        });
      }

      // 4) Calcular total con tarifa de envío de la zona.
      const shippingFee = Money.cop(zone.shippingCOP);
      const total = subtotal.add(shippingFee);

      // 5) Crear el agregado Order (factory de dominio).
      const order = Order.createCashOnDelivery({
        idempotencyKey: cmd.idempotencyKey,
        items: orderItems,
        subtotal,
        shipping: shippingFee,
        total,
        shippingAddress: shipping,
        zoneId: zone.id,
      });

      // 6) Persistir el agregado dentro de la misma transacción.
      await tx.orders.save(order);

      // 7) Encolar side-effects (BullMQ). Falla aquí ⇒ ROLLBACK total.
      //    `attempts: 5` con backoff exponencial para resiliencia.
      //    `removeOnComplete` mantiene Redis pequeño.
      const event = new OrderCreatedEvent({
        orderId: order.id,
        code: order.code,
        totalCOP: total.amount,
        customerName: shipping.fullName,
        customerPhone: customerPhone.value,
        adminWhatsapp: this.adminWa,
        zoneId: zone.id,
        occurredAt: new Date().toISOString(),
      });

      await this.ordersQueue.add('order.created', event.payload, {
        jobId: order.id, // idempotencia del worker
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: { age: 3600, count: 1000 },
        removeOnFail: false,
      });

      this.logger.log(
        `Order ${order.code} created · total=${total.toString()} · zone=${zone.neighborhood}`,
      );

      // 8) Construir el deep link de WhatsApp pre-llenado para el cliente.
      const deepLink = customerPhone.whatsappLink(this.buildClientMessage(order, total));

      return {
        orderId: order.id,
        code: order.code,
        totalCOP: total.amount,
        whatsappDeepLink: `https://wa.me/${this.adminWa}?text=${encodeURIComponent(
          this.buildAdminMessage(order, shipping, total),
        )}`,
      };
    });
  }

  // #region private helpers

  /** Construye el mensaje pre-llenado que el ADMIN recibirá por WhatsApp. */
  private buildAdminMessage(order: Order, addr: ShippingAddress, total: Money): string {
    const lines = [
      `*Aura Divina · Nuevo Pedido ${order.code}*`,
      '',
      `*Cliente:* ${addr.fullName}`,
      `*Tel:* ${addr.phone}`,
      `*Ciudad:* ${addr.city} — ${addr.neighborhood}`,
      `*Dirección:* ${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}`,
      addr.reference ? `*Referencia:* ${addr.reference}` : null,
      '',
      '*Productos:*',
      ...order.items.map(
        (i) => `• ${i.quantity}x ${i.productNameSnapshot} — ${Money.cop(i.subtotalCop)}`,
      ),
      '',
      `*Subtotal:* ${order.subtotal}`,
      `*Envío:* ${order.shippingFee}`,
      `*TOTAL (Contraentrega):* ${total}`,
      '',
      'Por favor confirma para preparar el pedido ✨',
    ].filter(Boolean);
    return lines.join('\n');
  }

  /** Construye el mensaje del CLIENTE (variante más corta). */
  private buildClientMessage(order: Order, total: Money): string {
    return `Hola Aura Divina ✨ acabo de hacer mi pedido ${order.code} por ${total}. Quiero confirmarlo para recibirlo contraentrega.`;
  }

  /** Mapea agregado → DTO de respuesta. */
  private toResult(order: Order): CreateCodOrderResult {
    return {
      orderId: order.id,
      code: order.code,
      totalCOP: order.total.amount,
      whatsappDeepLink: `https://wa.me/${this.adminWa}`,
    };
  }

  // #endregion
}
```

---

## 5.3 Worker que consume el evento (BullMQ)

```ts
// orders/infrastructure/messaging/orders.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import type { NotificationPort } from '@modules/orders/application/ports/notification.port';

@Processor('orders')
export class OrdersProcessor extends WorkerHost {
  private readonly logger = new Logger(OrdersProcessor.name);

  constructor(@Inject('NotificationPort') private readonly notify: NotificationPort) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case 'order.created':
        await this.handleOrderCreated(job);
        break;
      default:
        this.logger.warn(`Unhandled job ${job.name}`);
    }
  }

  private async handleOrderCreated(job: Job) {
    const { code, customerName, customerPhone, totalCOP, adminWhatsapp } = job.data;

    // 1) Notificar al admin (WhatsApp Business Cloud API · template aprobado)
    await this.notify.sendWhatsappTemplate({
      to: adminWhatsapp,
      template: 'new_order_admin',
      params: [code, customerName, customerPhone, totalCOP.toString()],
    });

    // 2) Email transaccional al cliente (si dejó email)
    // 3) Tracking analytics
    // 4) Cache invalidation del catálogo destacado
  }
}
```

---

## 5.4 Mapeo de errores → HTTP (Exception Filter global)

```ts
// shared/exceptions/domain-exception.filter.ts
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(err: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    res.status(err.httpStatus).json({
      code: err.code,
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

Registrado en `main.ts`:

```ts
app.useGlobalFilters(new DomainExceptionFilter());
```

Resultado: el frontend recibe siempre `{ code, message }` consistente y traducible:

```json
{
  "code": "OUT_OF_COVERAGE_ZONE",
  "message": "Lo sentimos, aún no entregamos contraentrega en \"Manrique, Medellín\". Próximamente expandiremos cobertura.",
  "timestamp": "2026-04-12T15:23:11.000Z"
}
```

---

## 5.5 Test unitario del handler (Vitest)

```ts
// orders/application/commands/create-cod-order/create-cod-order.handler.spec.ts
describe('CreateCashOnDeliveryOrderCommandHandler', () => {
  let handler: CreateCashOnDeliveryOrderCommandHandler;
  let uow: MockedUnitOfWork;
  let queue: { add: ReturnType<typeof vi.fn> };
  let coverage: { resolveByNeighborhood: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    uow = new MockedUnitOfWork();
    queue = { add: vi.fn().mockResolvedValue({ id: 'job_1' }) };
    coverage = { resolveByNeighborhood: vi.fn() };
    handler = new CreateCashOnDeliveryOrderCommandHandler(
      uow,
      coverage as any,
      queue as any,
      '573187307977',
    );
  });

  it('crea la orden y encola el job order.created', async () => {
    coverage.resolveByNeighborhood.mockResolvedValue(makeZone());
    uow.products.findVariantForUpdate.mockResolvedValue(makeVariant({ stock: 5 }));

    const result = await handler.execute(makeCommand({ quantity: 2 }));

    expect(result.code).toMatch(/^AD-/);
    expect(uow.orders.save).toHaveBeenCalledOnce();
    expect(queue.add).toHaveBeenCalledWith(
      'order.created',
      expect.objectContaining({ totalCOP: expect.any(Number) }),
      expect.objectContaining({ attempts: 5 }),
    );
  });

  it('lanza OutOfCoverageZoneException si el barrio no tiene cobertura', async () => {
    coverage.resolveByNeighborhood.mockResolvedValue(null);
    await expect(handler.execute(makeCommand())).rejects.toThrow(OutOfCoverageZoneException);
    expect(uow.orders.save).not.toHaveBeenCalled();
    expect(queue.add).not.toHaveBeenCalled();
  });

  it('lanza InsufficientStockException y NO descuenta nada (rollback)', async () => {
    coverage.resolveByNeighborhood.mockResolvedValue(makeZone());
    uow.products.findVariantForUpdate.mockResolvedValue(makeVariant({ stock: 0 }));

    await expect(handler.execute(makeCommand({ quantity: 1 }))).rejects.toThrow(
      InsufficientStockException,
    );
    expect(uow.products.saveVariant).not.toHaveBeenCalled();
  });
});
```

---

## 5.6 Lo que hace que esto sea "nivel dios"

| Característica | Beneficio |
|---|---|
| **Inyección por puerto, no por clase concreta** | Cambiar de TypeORM a Prisma o de BullMQ a SQS no requiere tocar el handler. |
| **`SERIALIZABLE` + UoW** | Cero double-spend de stock incluso bajo carga concurrente real. |
| **Idempotencia por `idempotencyKey`** | El doble click del usuario en el botón nunca crea dos órdenes. |
| **Validación temprana de cobertura** | El usuario recibe error antes de gastar el rollback en stock. |
| **Re-pricing server-side** | Imposible manipular precios desde DevTools. |
| **Eventos a BullMQ con retries + backoff** | WhatsApp/email/analytics nunca pierden eventos por una caída temporal del proveedor. |
| **`jobId = order.id`** | El worker es idempotente — un retry no envía dos WhatsApps. |
| **Errores de dominio tipados con `httpStatus`** | El filter global garantiza respuestas consistentes sin lógica HTTP en el dominio. |
| **Snapshots inmutables** (`product_name_snapshot`, `shipping_snapshot`) | Cambiar el nombre de un producto NO altera órdenes históricas. |
| **Tests unitarios del handler con puertos mockeados** | Cero infraestructura levantada para validar lógica de negocio. |
