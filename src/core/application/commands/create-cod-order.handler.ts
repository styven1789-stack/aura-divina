/**
 * CreateCashOnDeliveryOrderCommandHandler
 *
 * Capa: Application (CQRS — Command side).
 *
 * Responsabilidades:
 *  1. Validar el comando con reglas de dominio (carrito no vacío, teléfono CO).
 *  2. Resolver cobertura por barrio/ciudad (Coverage_Zones).
 *  3. Re-precios server-side (jamás confiar en el monto del cliente).
 *  4. Atomicidad: descontar stock + crear Order + crear OrderItems en una sola
 *     Unit of Work (rollback automático ante cualquier error).
 *  5. Publicar `OrderCreatedEvent` en el bus → BullMQ encola jobs:
 *       - notification.whatsapp.confirmAdmin
 *       - notification.email.customer
 *       - analytics.track
 *  6. Devolver el agregado Order (con código humano AD-XXXX) y el deep link de WhatsApp.
 *
 * Diseño:
 *  - Inyección por constructor (puertos), zero acoplamiento a frameworks.
 *  - Errores tipados de dominio (mapeables 1:1 a códigos HTTP).
 *  - Idempotente por idempotencyKey (futuro) — extender con headers.
 */

import type { UnitOfWork } from '../ports/unit-of-work';
import type { EventBus } from '../ports/event-bus';
import type { Order, OrderItem } from '@/core/domain/order';
import type { CreateCodOrderCommand } from './create-cod-order.command';
import { Money, PhoneCO } from '@/core/domain/value-objects';
import {
  EmptyCartException,
  InsufficientStockException,
  OutOfCoverageZoneException,
} from '@/core/domain/errors';

export interface CreateCodOrderResult {
  order: Order;
  whatsappDeepLink: string;
}

export class CreateCashOnDeliveryOrderCommandHandler {
  /**
   * @param uow      Unit of Work (transacción atómica sobre orders+products+coverage).
   * @param events   Event bus (BullMQ en producción, in-memory en dev).
   * @param adminWa  Número de WhatsApp del comercio (E.164 sin +) para deep links.
   */
  constructor(
    private readonly uow: UnitOfWork,
    private readonly events: EventBus,
    private readonly adminWa: string,
  ) {}

  /** /// <inheritdoc /> */
  async execute(cmd: CreateCodOrderCommand): Promise<CreateCodOrderResult> {
    if (!cmd.items?.length) throw new EmptyCartException();

    // Value object — falla rápido si el teléfono no es CO válido.
    const customerPhone = PhoneCO.of(cmd.shipping.phone);

    // Toda la operación corre dentro de una transacción. NOTA: el event bus
    // también toma el write-lock del store; por eso publicamos DESPUÉS del
    // commit (patrón "outbox light"), nunca dentro del callback transaccional.
    const order = await this.uow.run(async (tx) => {
      // 1) Validar cobertura ANTES de tocar stock — feedback temprano.
      const zone = await tx.coverage.resolveByNeighborhood(
        cmd.shipping.city,
        cmd.shipping.neighborhood,
      );
      if (!zone || !zone.active) {
        throw new OutOfCoverageZoneException(`${cmd.shipping.neighborhood}, ${cmd.shipping.city}`);
      }

      // 2) Re-precios server-side + descuento de stock atómico.
      const items: OrderItem[] = [];
      let subtotal = Money.cop(0);

      for (const dto of cmd.items) {
        const product = await tx.products.findById(dto.productId);
        if (!product || !product.active) {
          throw new InsufficientStockException(dto.productId);
        }

        const variant = dto.variantId
          ? product.variants.find((v) => v.id === dto.variantId)
          : product.variants[0];
        if (!variant || variant.stock < dto.quantity) {
          throw new InsufficientStockException(product.name);
        }

        // Mutación del agregado (descuento de stock).
        variant.stock -= dto.quantity;
        await tx.products.save(product);

        const unit = Money.cop(product.priceCOP);
        const line = unit.multiply(dto.quantity);
        subtotal = subtotal.add(line);

        items.push({
          productId: product.id,
          variantId: variant.id,
          name: product.name,
          image: product.images[0],
          unitPriceCOP: unit.amount,
          quantity: dto.quantity,
          subtotalCOP: line.amount,
        });
      }

      // 3) Cálculo de total con tarifa de envío de la zona.
      const shipping = Money.cop(zone.shippingCOP);
      const total = subtotal.add(shipping);

      // 4) Persistir agregado Order.
      const now = new Date().toISOString();
      const order: Order = {
        id: cryptoId(),
        code: humanCode(),
        status: 'PENDING',
        items,
        subtotalCOP: subtotal.amount,
        shippingCOP: shipping.amount,
        totalCOP: total.amount,
        paymentMethod: 'CASH_ON_DELIVERY',
        shipping: { ...cmd.shipping, phone: customerPhone.value },
        zoneId: zone.id,
        createdAt: now,
        updatedAt: now,
      };
      await tx.orders.save(order);

      return order;
    });

    // 5) Publicar evento DESPUÉS del commit (outbox light).
    //    En producción esto encola en BullMQ; aquí solo lo loguea.
    //    Si falla, no rollbackeamos: la orden ya está persistida y los
    //    side-effects son reintentables (idempotentes por jobId).
    try {
      await this.events.publish({
        type: 'order.created',
        occurredAt: order.createdAt,
        payload: { orderId: order.id, code: order.code, totalCOP: order.totalCOP },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[create-cod-order] event publish failed (orden ya persistida):', err);
    }

    // 6) Construir el deep link de WhatsApp para confirmación (admin).
    const message = buildWhatsappMessage(order);
    const whatsappDeepLink = `https://wa.me/57${this.adminWa}?text=${encodeURIComponent(message)}`;

    return { order, whatsappDeepLink };
  }
}

// #region private helpers

/** Genera un id resistente a colisiones (uuid v4 RFC 4122). */
function cryptoId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Código humano legible para el cliente (`AD-` + 6 chars). */
function humanCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = 'AD-';
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

/** Mensaje pre-llenado para confirmación por WhatsApp. */
function buildWhatsappMessage(order: Order): string {
  const lines = [
    `*Aura Divina · Nuevo Pedido ${order.code}*`,
    '',
    `*Cliente:* ${order.shipping.fullName}`,
    `*Tel:* ${order.shipping.phone}`,
    `*Ciudad:* ${order.shipping.city} — ${order.shipping.neighborhood}`,
    `*Dirección:* ${order.shipping.addressLine1}${order.shipping.addressLine2 ? ', ' + order.shipping.addressLine2 : ''}`,
    order.shipping.reference ? `*Referencia:* ${order.shipping.reference}` : '',
    '',
    '*Productos:*',
    ...order.items.map((i) => `• ${i.quantity}x ${i.name} — ${formatCOP(i.subtotalCOP)}`),
    '',
    `*Subtotal:* ${formatCOP(order.subtotalCOP)}`,
    `*Envío:* ${formatCOP(order.shippingCOP)}`,
    `*TOTAL (Contraentrega):* ${formatCOP(order.totalCOP)}`,
    '',
    'Por favor confirma para preparar el pedido ✨',
  ].filter(Boolean);
  return lines.join('\n');
}

function formatCOP(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

// #endregion
