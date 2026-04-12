/**
 * Command — CreateCashOnDeliveryOrderCommand
 *
 * Representa la intención del usuario de crear una orden con pago contraentrega.
 * Es inmutable y serializable (apto para colas / event-sourcing futuro).
 */

export interface CreateCodOrderItemDto {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CreateCodOrderCommand {
  items: CreateCodOrderItemDto[];
  shipping: {
    fullName: string;
    phone: string;
    email?: string;
    city: string;
    neighborhood: string;
    postalCode?: string;
    addressLine1: string;
    addressLine2?: string;
    reference?: string;
    notes?: string;
  };
}
