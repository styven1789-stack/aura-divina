/**
 * JSON store — persistencia plana en `data/db.json`.
 *
 * - Sin dependencias nativas (apto para Windows + Vercel/Render filesystem dev).
 * - Implementa lock por proceso para evitar carreras en escrituras.
 * - El método `transaction` toma un snapshot estructural; si la callback lanza,
 *   restaura el snapshot antes de re-lanzar (rollback).
 *
 * En producción esto se reemplaza por PostgreSQL + pg.PoolClient (BEGIN/COMMIT).
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Product } from '@/core/domain/product';
import type { Order } from '@/core/domain/order';
import type { CoverageZone } from '@/core/domain/coverage-zone';
import type { User } from '@/core/domain/user';

export interface DbShape {
  products: Product[];
  orders: Order[];
  coverageZones: CoverageZone[];
  events: { type: string; occurredAt: string; payload: unknown }[];
  admins: { email: string; passwordHash: string }[];
  users: User[];
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

let cache: DbShape | null = null;
let writeLock: Promise<void> = Promise.resolve();

/** Carga el JSON una sola vez por proceso (luego en memoria). */
export async function loadDb(): Promise<DbShape> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<DbShape>;
    cache = {
      products: parsed.products ?? [],
      orders: parsed.orders ?? [],
      coverageZones: parsed.coverageZones ?? [],
      events: parsed.events ?? [],
      admins: parsed.admins ?? [],
      users: parsed.users ?? [],
    };
  } catch {
    cache = { products: [], orders: [], coverageZones: [], events: [], admins: [], users: [] };
    await persist(cache!);
  }
  return cache!;
}

async function persist(db: DbShape) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

/** Escritura serializada (lock por proceso). */
export async function withWriteLock<T>(fn: (db: DbShape) => Promise<T>): Promise<T> {
  const release = writeLock;
  let resolve!: () => void;
  writeLock = new Promise((r) => (resolve = r));
  try {
    await release;
    const db = await loadDb();
    const result = await fn(db);
    await persist(db);
    return result;
  } finally {
    resolve();
  }
}

/** Transacción con rollback (snapshot estructural). */
export async function transaction<T>(fn: (db: DbShape) => Promise<T>): Promise<T> {
  return withWriteLock(async (db) => {
    const snapshot = JSON.parse(JSON.stringify(db));
    try {
      return await fn(db);
    } catch (err) {
      Object.assign(db, snapshot);
      throw err;
    }
  });
}
