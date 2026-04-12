'use client';

import { useEffect, useState } from 'react';

/**
 * Renderiza una fecha SOLO en el cliente para evitar mismatches de hidratación
 * entre Node ICU y el navegador (formatos de toLocaleString divergen).
 */
export default function ClientDate({ iso, mode = 'datetime' }: { iso: string; mode?: 'date' | 'datetime' }) {
  const [text, setText] = useState<string>('');
  useEffect(() => {
    const d = new Date(iso);
    setText(
      mode === 'date'
        ? d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : d.toLocaleString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
    );
  }, [iso, mode]);
  return <span suppressHydrationWarning>{text || '—'}</span>;
}
