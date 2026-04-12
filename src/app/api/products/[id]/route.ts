import { NextResponse } from 'next/server';
import { withWriteLock } from '@/core/infrastructure/persistence/json-store';
import { getAdminSession } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  await withWriteLock(async (db) => {
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx >= 0) {
      const next = { ...db.products[idx], ...body };
      next.priceCOP = Number(next.priceCOP);
      if (next.compareAtPriceCOP) next.compareAtPriceCOP = Number(next.compareAtPriceCOP);
      db.products[idx] = next;
    }
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await withWriteLock(async (db) => {
    db.products = db.products.filter((p) => p.id !== id);
  });
  return NextResponse.json({ ok: true });
}
