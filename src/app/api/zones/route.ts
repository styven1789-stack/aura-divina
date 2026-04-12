import { NextResponse } from 'next/server';
import { loadDb, withWriteLock } from '@/core/infrastructure/persistence/json-store';
import { getAdminSession } from '@/lib/auth';
import type { CoverageZone } from '@/core/domain/coverage-zone';

export async function GET() {
  const db = await loadDb();
  return NextResponse.json({ zones: db.coverageZones.filter((z) => z.active) });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const body = (await req.json()) as Partial<CoverageZone>;
  const zone: CoverageZone = {
    id: `z_${Date.now()}`,
    city: body.city ?? 'Medellín',
    neighborhood: body.neighborhood ?? '',
    postalCodes: body.postalCodes ?? [],
    shippingCOP: Number(body.shippingCOP ?? 8000),
    active: body.active ?? true,
    estimatedDelivery: body.estimatedDelivery ?? '24h',
  };
  await withWriteLock(async (db) => { db.coverageZones.push(zone); });
  return NextResponse.json({ zone }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'id requerido' }, { status: 400 });
  await withWriteLock(async (db) => {
    db.coverageZones = db.coverageZones.filter((z) => z.id !== id);
  });
  return NextResponse.json({ ok: true });
}
