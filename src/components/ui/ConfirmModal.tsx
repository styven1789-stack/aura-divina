'use client';

/**
 * Modal de confirmación reemplaza window.confirm() — visualmente premium.
 * - Variante 'danger' (rojo) para borrados.
 * - Click fuera + tecla Esc + botón × cierran.
 * - Loading state mientras la promesa del onConfirm resuelve.
 */

import { useState } from 'react';
import { useEscape } from './Toast';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'info',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  useEscape(open, onClose);

  if (!open) return null;

  const palette = {
    danger:  { ring: 'ring-rose-200',    icon: 'text-rose-600',    btn: 'bg-rose-600 hover:bg-rose-700 text-white' },
    warning: { ring: 'ring-amber-200',   icon: 'text-amber-600',   btn: 'bg-amber-500 hover:bg-amber-600 text-white' },
    info:    { ring: 'ring-gold-300',    icon: 'text-gold-600',    btn: 'bg-gold-500 hover:bg-gold-600 text-ink-900' },
  }[variant];

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] bg-ink-900/60 backdrop-blur-sm grid place-items-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className={`bg-rose-50 rounded-3xl p-7 w-full max-w-md ring-4 ${palette.ring} shadow-2xl animate-in zoom-in-95`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className={`grid place-items-center w-12 h-12 rounded-2xl bg-white border border-rose-150 ${palette.icon}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
              <path d="M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-serif text-xl text-ink-900">{title}</h3>
            {description && <p className="text-sm text-ink-700 mt-1.5 leading-relaxed">{description}</p>}
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} disabled={loading} className="btn-ghost flex-1">
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold tracking-wide transition disabled:opacity-50 ${palette.btn}`}
          >
            {loading ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
