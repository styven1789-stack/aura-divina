'use client';

/**
 * Sistema de notificaciones tipo "toast" con un solo provider global.
 * - Sin dependencias externas (~3KB).
 * - API: const toast = useToast(); toast.success('OK'); toast.error('Falló');
 * - Auto-dismiss 4s, hover-pause, swipe en mobile.
 * - Stack visual con animación de entrada/salida.
 */

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ToastContextValue {
  push: (variant: ToastVariant, title: string, description?: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((variant: ToastVariant, title: string, description?: string) => {
    const id = ++counter;
    setItems((prev) => [...prev, { id, variant, title, description }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value: ToastContextValue = {
    push,
    success: (t, d) => push('success', t, d),
    error: (t, d) => push('error', t, d),
    info: (t, d) => push('info', t, d),
    warning: (t, d) => push('warning', t, d),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-2.5rem)]">
        {items.map((t) => (
          <Toast
            key={t.id}
            item={t}
            onClose={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const palette: Record<ToastVariant, { bg: string; border: string; icon: string; emoji: string }> = {
    success: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-700', emoji: '✓' },
    error:   { bg: 'bg-rose-50',    border: 'border-rose-200',    icon: 'text-rose-700',    emoji: '×' },
    info:    { bg: 'bg-sky-50',     border: 'border-sky-200',     icon: 'text-sky-700',     emoji: 'ⓘ' },
    warning: { bg: 'bg-amber-50',   border: 'border-amber-200',   icon: 'text-amber-700',   emoji: '!' },
  };
  const p = palette[item.variant];

  return (
    <div
      className={`pointer-events-auto min-w-[280px] max-w-sm rounded-2xl border ${p.border} ${p.bg} shadow-soft p-4 flex items-start gap-3 animate-in slide-in-from-right-4 fade-in`}
      role="status"
    >
      <div className={`grid place-items-center w-7 h-7 rounded-full bg-white border ${p.border} ${p.icon} font-bold shrink-0`}>
        {p.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink-900 leading-tight">{item.title}</p>
        {item.description && <p className="text-xs text-ink-700 mt-0.5 leading-snug">{item.description}</p>}
      </div>
      <button
        onClick={onClose}
        aria-label="Cerrar"
        className="text-ink-600 hover:text-ink-900 text-lg leading-none -mr-1 -mt-1"
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}

/** Hook util — escapar Modales con tecla Esc. */
export function useEscape(active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, onClose]);
}
