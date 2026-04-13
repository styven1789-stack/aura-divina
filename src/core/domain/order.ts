/**
 * Order aggregate — Aura Divina
 *
 * Estados (máquina):
 *  PENDING -> CONFIRMED_WHATSAPP -> SHIPPED -> DELIVERED
 *  PENDING|CONFIRMED_WHATSAPP -> CANCELED
 */

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED_WHATSAPP'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELED';

export interface OrderItem {
  productId: string;
  variantId?: string;
  name: string;
  image?: string;
  unitPriceCOP: number;
  quantity: number;
  subtotalCOP: number;
}

export interface ShippingAddress {
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
}

export interface Order {
  id: string;
  code: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotalCOP: number;
  shippingCOP: number;
  totalCOP: number;
  paymentMethod: 'CASH_ON_DELIVERY';
  shipping: ShippingAddress;
  zoneId: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
  whatsappConfirmedAt?: string;
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED_WHATSAPP: 'Confirmado por WhatsApp',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELED: 'Cancelado',
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMED_WHATSAPP: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  SHIPPED: 'bg-sky-100 text-sky-800 border-sky-200',
  DELIVERED: 'bg-green-100 text-green-800 border-green-200',
  CANCELED: 'bg-rose-100 text-rose-800 border-rose-200',
};

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED_WHATSAPP', 'CANCELED'],
  CONFIRMED_WHATSAPP: ['SHIPPED', 'CANCELED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELED: [],
};

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return true;
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}

export function nextOrderStatuses(from: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[from];
}
