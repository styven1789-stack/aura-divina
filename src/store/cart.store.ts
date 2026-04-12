'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartLine {
  productId: string;
  variantId: string;
  name: string;
  image?: string;
  unitPriceCOP: number;
  quantity: number;
  variantLabel?: string;
}

interface CartState {
  lines: CartLine[];
  add: (line: CartLine) => void;
  remove: (productId: string, variantId: string) => void;
  setQty: (productId: string, variantId: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line) =>
        set((s) => {
          const idx = s.lines.findIndex(
            (l) => l.productId === line.productId && l.variantId === line.variantId,
          );
          if (idx >= 0) {
            const next = [...s.lines];
            next[idx] = { ...next[idx], quantity: next[idx].quantity + line.quantity };
            return { lines: next };
          }
          return { lines: [...s.lines, line] };
        }),
      remove: (productId, variantId) =>
        set((s) => ({
          lines: s.lines.filter((l) => !(l.productId === productId && l.variantId === variantId)),
        })),
      setQty: (productId, variantId, qty) =>
        set((s) => ({
          lines: s.lines.map((l) =>
            l.productId === productId && l.variantId === variantId
              ? { ...l, quantity: Math.max(1, qty) }
              : l,
          ),
        })),
      clear: () => set({ lines: [] }),
      count: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: () => get().lines.reduce((sum, l) => sum + l.unitPriceCOP * l.quantity, 0),
    }),
    { name: 'aura-cart' },
  ),
);
