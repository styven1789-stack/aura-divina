import { NextResponse } from 'next/server';
import { loadDb } from '@/core/infrastructure/persistence/json-store';
import { JsonCoverageRepository } from '@/core/infrastructure/persistence/json-coverage.repository';

export async function POST(req: Request) {
  const { city, neighborhood } = await req.json();
  if (!city || !neighborhood) return NextResponse.json({ zone: null }, { status: 200 });
  const db = await loadDb();
  const repo = new JsonCoverageRepository(db);
  const zone = await repo.resolveByNeighborhood(city, neighborhood);
  return NextResponse.json({ zone });
}
