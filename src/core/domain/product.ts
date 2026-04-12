/**
 * Product aggregate — Aura Divina
 */

export type ProductCategory = 'anillos' | 'collares' | 'aretes' | 'pulseras' | 'sets';

export interface ProductVariant {
  id: string;
  label: string;
  sku: string;
  stock: number;
  attributes: Record<string, string>;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  description: string;
  shortDescription: string;
  priceCOP: number;
  compareAtPriceCOP?: number;
  images: string[];
  variants: ProductVariant[];
  tags: string[];
  active: boolean;
  featured: boolean;
  createdAt: string;
}
