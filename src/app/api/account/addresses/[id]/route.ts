import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { accountHandlers } from '@/core/infrastructure/container';
import { toPublicUser, type SavedAddress } from '@/core/domain/user';
import { DomainError } from '@/core/domain/errors';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const data = (await req.json()) as Partial<Omit<SavedAddress, 'id'>>;
    const user = await accountHandlers.updateAddress({ userId: session.userId, addressId: id, data });
    return NextResponse.json({ user: toPublicUser(user) });
  } catch (err) {
    if (err instanceof DomainError) {
      return NextResponse.json({ code: err.code, message: err.message }, { status: err.httpStatus });
    }
    return NextResponse.json({ message: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const user = await accountHandlers.removeAddress({ userId: session.userId, addressId: id });
    return NextResponse.json({ user: toPublicUser(user) });
  } catch (err) {
    if (err instanceof DomainError) {
      return NextResponse.json({ code: err.code, message: err.message }, { status: err.httpStatus });
    }
    return NextResponse.json({ message: (err as Error).message }, { status: 500 });
  }
}
