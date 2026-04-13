import { NextResponse } from 'next/server';
import { loadDb } from '@/core/infrastructure/persistence/json-store';
import { createCodOrderHandler } from '@/core/infrastructure/container';
import { DomainError } from '@/core/domain/errors';
import { getAdminSession, getUserSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const db = await loadDb();
  const orders = [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  try {
    const cmd = await req.json();
    const userSession = await getUserSession();
    const result = await createCodOrderHandler.execute({
      ...cmd,
      userId: userSession?.userId,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof DomainError) {
      return NextResponse.json({ code: err.code, message: err.message }, { status: err.httpStatus });
    }
    console.error(err);
    return NextResponse.json({ message: (err as Error).message ?? 'Error interno' }, { status: 500 });
  }
}
