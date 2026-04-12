import type { Product, ProductCategory } from '@/core/domain/product';

export interface ProductRepository {
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  list(filter?: { category?: ProductCategory; featured?: boolean; active?: boolean }): Promise<Product[]>;
  delete(id: string): Promise<void>;
}
