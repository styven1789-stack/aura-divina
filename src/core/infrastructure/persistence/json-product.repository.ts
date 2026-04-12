import type { Product, ProductCategory } from '@/core/domain/product';
import type { ProductRepository } from '@/core/application/ports/product.repository';
import type { DbShape } from './json-store';

export class JsonProductRepository implements ProductRepository {
  constructor(private readonly db: DbShape) {}

  /** /// <inheritdoc /> */
  async save(product: Product): Promise<void> {
    const idx = this.db.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) this.db.products[idx] = product;
    else this.db.products.push(product);
  }

  /** /// <inheritdoc /> */
  async findById(id: string): Promise<Product | null> {
    return this.db.products.find((p) => p.id === id) ?? null;
  }

  /** /// <inheritdoc /> */
  async findBySlug(slug: string): Promise<Product | null> {
    return this.db.products.find((p) => p.slug === slug) ?? null;
  }

  /** /// <inheritdoc /> */
  async list(filter?: { category?: ProductCategory; featured?: boolean; active?: boolean }): Promise<Product[]> {
    return this.db.products.filter((p) => {
      if (filter?.category && p.category !== filter.category) return false;
      if (filter?.featured !== undefined && p.featured !== filter.featured) return false;
      if (filter?.active !== undefined && p.active !== filter.active) return false;
      return true;
    });
  }

  /** /// <inheritdoc /> */
  async delete(id: string): Promise<void> {
    this.db.products = this.db.products.filter((p) => p.id !== id);
  }
}
