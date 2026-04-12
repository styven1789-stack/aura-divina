import { NextResponse } from 'next/server';
import { loadDb, withWriteLock } from '@/core/infrastructure/persistence/json-store';
import { getAdminSession } from '@/lib/auth';
import type { Product } from '@/core/domain/product';

export async function GET() {
  const db = await loadDb();
  return NextResponse.json({ products: db.products });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = (await req.json()) as Partial<Product>;
  const product: Product = {
    id: `p_${Date.now()}`,
    slug: body.slug ?? `producto-${Date.now()}`,
    name: body.name ?? 'Producto sin nombre',
    category: body.category ?? 'anillos',
    description: body.description ?? '',
    shortDescription: body.shortDescription ?? '',
    priceCOP: Number(body.priceCOP ?? 0),
    compareAtPriceCOP: body.compareAtPriceCOP ? Number(body.compareAtPriceCOP) : undefined,
    images: body.images?.length ? body.images : ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80'],
    variants: body.variants?.length ? body.variants : [{ id: `v_${Date.now()}`, label: 'Único', sku: `SKU-${Date.now()}`, stock: 10, attributes: {} }],
    tags: body.tags ?? [],
    active: body.active ?? true,
    featured: body.featured ?? false,
    createdAt: new Date().toISOString(),
  };
  await withWriteLock(async (db) => { db.products.push(product); });
  return NextResponse.json({ product }, { status: 201 });
}
