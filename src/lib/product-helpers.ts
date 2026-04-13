/**
 * Helpers de producto — cálculos derivados reutilizables en grids, PDP,
 * admin y checkout. Centralizan lógica que antes se duplicaba inline.
 */

import type { Product, ProductVariant } from '@/core/domain/product';

export function totalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

export function isSoldOut(product: Product): boolean {
  return totalStock(product) === 0;
}

export function isLowStock(product: Product, threshold = 5): boolean {
  const total = totalStock(product);
  return total > 0 && total <= threshold;
}

export function availableVariants(product: Product): ProductVariant[] {
  return product.variants.filter((v) => v.stock > 0);
}

export function getDiscountPercent(price: number, compareAt?: number): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round((1 - price / compareAt) * 100);
}

export function hasSingleVariant(product: Product): boolean {
  return product.variants.length === 1;
}
